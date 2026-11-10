/* 精确有理数 Q 与量纲代数 Dim。无 DOM，浏览器和 node 通用。
 * Q 的分子 n、分母 d 都是 BigInt，且总是约分过的、d > 0。整数运算不会溢出；
 * 需要普通数字时用 Q.num（近似）。存档用 U.JSON（BigInt 会存成 {"$big":"..."}，读回来仍是 BigInt）。 */
(function (G) {
  'use strict';
  const U = (G.U = G.U || {});

  const babs = (x) => (x < 0n ? -x : x);
  const bgcd = (a, b) => { a = babs(a); b = babs(b); while (b) { const t = a % b; a = b; b = t; } return a; };
  // 接受 number（必须是整数）、BigInt，或十进制整数字符串（存档里读回来的）
  const toBig = (x) => {
    if (typeof x === 'bigint') return x;
    if (typeof x === 'number' && Number.isInteger(x)) return BigInt(x);
    if (typeof x === 'string' && /^-?\d+$/.test(x)) return BigInt(x);
    throw new Error('bad-number');
  };

  function Q(n, d) {
    if (d === undefined) d = 1n;
    n = toBig(n); d = toBig(d);
    if (d === 0n) throw new Error('bad-number');
    if (d < 0n) { n = -n; d = -d; }
    const g = bgcd(n, d);
    if (g > 1n) { n /= g; d /= g; }
    return { n, d };
  }
  Q.add = (a, b) => Q(a.n * b.d + b.n * a.d, a.d * b.d);
  Q.sub = (a, b) => Q(a.n * b.d - b.n * a.d, a.d * b.d);
  Q.mul = (a, b) => Q(a.n * b.n, a.d * b.d);
  Q.div = (a, b) => { if (b.n === 0n) throw new Error('div0'); return Q(a.n * b.d, a.d * b.n); };
  Q.neg = (a) => Q(-a.n, a.d);
  Q.abs = (a) => (a.n < 0n ? Q.neg(a) : a);
  Q.cmp = (a, b) => {
    const x = a.n * b.d, y = b.n * a.d;
    return x < y ? -1 : x > y ? 1 : 0;
  };
  Q.eq = (a, b) => a.n === b.n && a.d === b.d;
  // 近似值（普通数字）。分子分母都超出普通数字范围时先整体缩小再相除。
  Q.num = (a) => {
    const x = Number(a.n), y = Number(a.d);
    if (Number.isFinite(x) && Number.isFinite(y)) return x / y;
    const k = BigInt(Math.max(a.n.toString().length, a.d.toString().length) - 300);
    return Number(a.n / 10n ** k) / Number(a.d / 10n ** k);
  };
  Q.isInt = (a) => a.d === 1n;
  Q.show = (a) => (a.d === 1n ? String(a.n) : a.n + '/' + a.d);
  // 存进属性（props）的规范形式：整数存普通数字（老存档和老测试的 props 不变），分数存 "n/d" 字符串（精确，不近似）
  Q.store = (a) => (a.d === 1n && a.n >= -9007199254740991n && a.n <= 9007199254740991n ? Number(a.n) : Q.show(a));
  Q.showDec = (a, k) => { const x = Q.num(a); return Number.isInteger(x) ? String(x) : String(+x.toFixed(k === undefined ? 2 : k)); };
  Q.showMixed = (a) => {
    if (a.d === 1n || babs(a.n) < a.d) return Q.show(a);
    const s = a.n < 0n ? '−' : '', n = babs(a.n), w = n / a.d, r = n % a.d;
    return r === 0n ? s + w : s + w + '又' + r + '/' + a.d;
  };
  Q.fromNumber = (x) => {
    if (Number.isInteger(x)) return Q(x, 1n);
    if (!Number.isFinite(x)) throw new Error('bad-number');
    return Q(Math.round(x * 1e6), 1000000n);
  };
  Q.parse = (s) => {
    if (typeof s === 'number') return Q.fromNumber(s);
    if (s && typeof s === 'object' && 'n' in s) return Q(s.n, s.d === undefined ? 1n : s.d);
    const t = String(s).trim();
    let m = /^(-?\d+)\s*\/\s*(\d+)$/.exec(t);
    if (m) return Q(BigInt(m[1]), BigInt(m[2]));
    m = /^-?\d+(\.\d+)?$/.exec(t);
    if (m) return Q.fromNumber(parseFloat(t));
    throw new Error('bad-number');
  };
  // 存档用的 JSON：BigInt 写成 {"$big":"数字串"}，读回时还原成 BigInt
  Q.json = {
    replacer: (k, v) => (typeof v === 'bigint' ? { $big: v.toString() } : v),
    reviver: (k, v) => (v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 1 && typeof v.$big === 'string' ? BigInt(v.$big) : v),
  };
  U.Q = Q;
  U.JSON = {
    stringify: (v, sp) => JSON.stringify(v, Q.json.replacer, sp),
    parse: (s) => JSON.parse(s, Q.json.reviver),
  };
  // ---- 量纲 ----
  // key 与界面名字一一对应；null 表示“没标单位”，参与运算时让位给另一边。
  const DIM = {
    keys: [null, 'count', 'length', 'area', 'volume', 'weight', 'money', 'time', 'ratio', 'speed', 'unitprice', 'density'],
    names: ['无', '个数', '长度', '面积', '体积', '重量', '钱', '时间', '比值', '速度', '单价（每斤）', '密度'],
    key(i) { return DIM.keys[i] === undefined ? null : DIM.keys[i]; },
    idx(k) { const i = DIM.keys.indexOf(k === undefined ? null : k); return i < 0 ? 0 : i; },
    name(k) { if (k === null || k === undefined) return '无'; if (typeof k === 'string' && k.startsWith('other')) return '没有名字的量'; return DIM.names[DIM.idx(k)]; },
    // 加减：两边必须同量纲，或有一边没标单位
    add(a, b) { if (a === b) return { ok: true, dim: a }; if (!a) return { ok: true, dim: b }; if (!b) return { ok: true, dim: a }; return { ok: false }; },
    mul(a, b) {
      if (!a) return b; if (!b) return a;
      const k = [a, b].sort().join('*');
      const T = { 'speed*time': 'length', 'density*volume': 'weight', 'unitprice*weight': 'money', 'length*length': 'area', 'area*length': 'volume', 'count*count': 'count', 'count*money': 'money', 'count*weight': 'weight', 'count*length': 'length', 'count*area': 'area', 'count*time': 'time', 'length*ratio': 'length', 'money*ratio': 'money', 'ratio*weight': 'weight', 'ratio*time': 'time', 'ratio*ratio': 'ratio', 'area*ratio': 'area', 'count*ratio': 'count' };
      return T[k] || 'other:' + k;
    },
    div(a, b) {
      if (!b) return a; if (a === b) return 'ratio'; if (!a) return 'other:1/' + b;
      const T = { 'length/time': 'speed', 'money/weight': 'unitprice', 'weight/volume': 'density', 'length/speed': 'time', 'weight/density': 'volume', 'money/unitprice': 'weight', 'area/length': 'length', 'volume/area': 'length', 'volume/length': 'area', 'money/count': 'money', 'weight/count': 'weight', 'length/count': 'length', 'area/count': 'area', 'time/count': 'time', 'count/ratio': 'count', 'length/ratio': 'length', 'money/ratio': 'money', 'weight/ratio': 'weight', 'time/ratio': 'time' };
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
