/* 精确有理数 Q 与量纲代数 Dim。无 DOM，浏览器和 node 通用。
 * 规则：所有整数运算结果必须是安全整数，否则抛 'overflow'（界面显示“数太大，算不下”），
 * 绝不悄悄丢精度。 */
(function (G) {
  'use strict';
  const U = (G.U = G.U || {});

  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t; } return a || 1; };

  function Q(n, d) {
    if (d === undefined) d = 1;
    if (!Number.isInteger(n) || !Number.isInteger(d) || d === 0) throw new Error('bad-number');
    if (!Number.isSafeInteger(n) || !Number.isSafeInteger(d)) throw new Error('overflow');
    if (d < 0) { n = -n; d = -d; }
    const g = gcd(n, d);
    n = n / g; d = d / g;
    if (n === 0) n = 0; // 去掉 -0
    return { n, d };
  }
  Q.add = (a, b) => Q(a.n * b.d + b.n * a.d, a.d * b.d);
  Q.sub = (a, b) => Q(a.n * b.d - b.n * a.d, a.d * b.d);
  Q.mul = (a, b) => Q(a.n * b.n, a.d * b.d);
  Q.div = (a, b) => { if (b.n === 0) throw new Error('div0'); return Q(a.n * b.d, a.d * b.n); };
  Q.neg = (a) => Q(-a.n, a.d);
  Q.cmp = (a, b) => {
    const x = a.n * b.d, y = b.n * a.d;
    if (!Number.isSafeInteger(x) || !Number.isSafeInteger(y)) { const p = a.n / a.d, q = b.n / b.d; return p < q ? -1 : p > q ? 1 : 0; }
    return x < y ? -1 : x > y ? 1 : 0;
  };
  Q.eq = (a, b) => a.n === b.n && a.d === b.d;
  Q.num = (a) => a.n / a.d;
  Q.isInt = (a) => a.d === 1;
  Q.show = (a) => (a.d === 1 ? String(a.n) : a.n + '/' + a.d);
  Q.showDec = (a, k) => { const x = a.n / a.d; return Number.isInteger(x) ? String(x) : String(+x.toFixed(k === undefined ? 2 : k)); };
  Q.showMixed = (a) => {
    if (a.d === 1 || Math.abs(a.n) < a.d) return Q.show(a);
    const s = a.n < 0 ? '−' : '', n = Math.abs(a.n), w = Math.floor(n / a.d), r = n % a.d;
    return r === 0 ? s + w : s + w + '又' + r + '/' + a.d;
  };
  Q.fromNumber = (x) => {
    if (Number.isInteger(x)) return Q(x, 1);
    if (!Number.isFinite(x)) throw new Error('bad-number');
    return Q(Math.round(x * 1e6), 1e6);
  };
  Q.parse = (s) => {
    if (typeof s === 'number') return Q.fromNumber(s);
    if (s && typeof s === 'object' && 'n' in s) return Q(s.n, s.d);
    const t = String(s).trim();
    let m = /^(-?\d+)\s*\/\s*(\d+)$/.exec(t);
    if (m) return Q(parseInt(m[1], 10), parseInt(m[2], 10));
    m = /^-?\d+(\.\d+)?$/.exec(t);
    if (m) return Q.fromNumber(parseFloat(t));
    throw new Error('bad-number');
  };
  U.Q = Q;

  // ---- 量纲 ----
  // key 与界面名字一一对应；null 表示“没标单位”，参与运算时让位给另一边。
  const DIM = {
    keys: [null, 'count', 'length', 'area', 'volume', 'weight', 'money', 'time', 'ratio'],
    names: ['无', '个数', '长度', '面积', '体积', '重量', '钱', '时间', '比值'],
    key(i) { return DIM.keys[i] === undefined ? null : DIM.keys[i]; },
    idx(k) { const i = DIM.keys.indexOf(k === undefined ? null : k); return i < 0 ? 0 : i; },
    name(k) { if (k === null || k === undefined) return '无'; if (typeof k === 'string' && k.startsWith('other')) return '没有名字的量'; return DIM.names[DIM.idx(k)]; },
    // 加减：两边必须同量纲，或有一边没标单位
    add(a, b) { if (a === b) return { ok: true, dim: a }; if (!a) return { ok: true, dim: b }; if (!b) return { ok: true, dim: a }; return { ok: false }; },
    mul(a, b) {
      if (!a) return b; if (!b) return a;
      const k = [a, b].sort().join('*');
      const T = { 'length*length': 'area', 'area*length': 'volume', 'count*count': 'count', 'count*money': 'money', 'count*weight': 'weight', 'count*length': 'length', 'count*area': 'area', 'count*time': 'time', 'length*ratio': 'length', 'money*ratio': 'money', 'ratio*weight': 'weight', 'ratio*time': 'time', 'ratio*ratio': 'ratio', 'area*ratio': 'area', 'count*ratio': 'count' };
      return T[k] || 'other:' + k;
    },
    div(a, b) {
      if (!b) return a; if (a === b) return 'ratio'; if (!a) return 'other:1/' + b;
      const T = { 'area/length': 'length', 'volume/area': 'length', 'volume/length': 'area', 'money/count': 'money', 'weight/count': 'weight', 'length/count': 'length', 'area/count': 'area', 'time/count': 'time', 'count/ratio': 'count', 'length/ratio': 'length', 'money/ratio': 'money', 'weight/ratio': 'weight', 'time/ratio': 'time' };
      return T[a + '/' + b] || 'other:' + a + '/' + b;
    },
  };
  U.Dim = DIM;

  // ---- 种子随机（确定性）：同一台面 + 同一操作序列，每一跳结果完全相同 ----
  const strHash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const mix = (a, b, c, d) => {
    let h = 0x811c9dc5;
    for (const x of [a, b, c, d]) { h ^= (x | 0); h = Math.imul(h, 0x01000193); h ^= h >>> 15; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; }
    return h >>> 0;
  };
  U.rand = (seed, id, n, k) => mix(seed, strHash(String(id)), n, k || 0) / 4294967296;
})(typeof globalThis !== 'undefined' ? globalThis : window);
