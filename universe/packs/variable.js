/* 器材包 variable：变量盒。字母 x 不是“一个未知数”，而是“任意一个数”。
 * 左右两个式子，器材把 x = lo…hi 一个个代进去比较：全部相等 → 恒等式；只有个别 x 相等 → 方程；一个都不等 → 永远不成立。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q.fromNumber(n));
  // 小型表达式解析：数字、n、+ - * / ^ ( )，用精确分数算。
  function parse(src) {
    const t = String(src).replace(/[×·]/g, '*').replace(/÷/g, '/').replace(/\s+/g, '').match(/\d+\.?\d*|[x()+\-*/^]|./g) || [];
    let i = 0;
    const bad = (m) => { throw new Error(m); };
    const atom = () => {
      const x = t[i++];
      if (x === undefined) bad('式子没写完');
      if (x === '(') { const v = add(); if (t[i++] !== ')') bad('括号没配对'); return v; }
      if (x === '-') { const v = atom(); return (n) => Q.mul(Q(-1), v(n)); }
      if (x === 'x') return (n) => Q.fromNumber(n);
      if (/^\d/.test(x)) return () => Q.fromNumber(+x);
      return bad('看不懂“' + x + '”，只能用数字、x 和 + − × ÷ ^ ( )');
    };
    const pow = () => { const b = atom(); if (t[i] === '^') { i++; const e = atom(); return (n) => { const k = Q.num(e(n)); if (!Number.isInteger(k) || k < 0 || k > 8) bad('次方只能是 0~8 的整数'); let r = Q(1); const bv = b(n); for (let j = 0; j < k; j++) r = Q.mul(r, bv); return r; }; } return b; };
    const mul = () => { let l = pow(); while (t[i] === '*' || t[i] === '/' || (t[i] === 'x' || t[i] === '(')) { const op = t[i] === '*' || t[i] === '/' ? t[i++] : '*'; const r = pow(), a = l; l = op === '*' ? (n) => Q.mul(a(n), r(n)) : (n) => { const d = r(n); if (Q.num(d) === 0) bad('除数不能是 0'); return Q.div(a(n), d); }; } return l; };
    const add = () => { let l = mul(); while (t[i] === '+' || t[i] === '-') { const op = t[i++], r = mul(), a = l; l = op === '+' ? (n) => Q.add(a(n), r(n)) : (n) => Q.sub(a(n), r(n)); } return l; };
    const f = add(); if (i < t.length) bad('多出来的“' + t.slice(i).join('') + '”');
    return f;
  }

  function scan(p) {
    const L = parse(p.left), R = parse(p.right), rows = [];
    for (let x = p.lo; x <= p.hi; x++) rows.push({ x, ok: Q.eq(L(x), R(x)) });
    return rows;
  }
  U.registerPack({
    id: 'variable', version: 1,
    types: {
      variable: {
        label: '变量盒', prefix: '式', group: '关系', grades: [5, 9], alias: ['字母表示数', '恒等式', '方程', '代数', '整式', '乘法公式', '完全平方'],
        props: {
          left: { type: 'text', label: '左边（用 x）', default: 'x+1' },
          right: { type: 'text', label: '右边（用 x）', default: 'x+2' },
          lo: { type: 'int', label: 'x 从', default: -10, min: -50, max: 0 },
          hi: { type: 'int', label: 'x 到', default: 10, min: 0, max: 50 },
        },
        outputs: { hits: { kind: 'num', label: '相等的个数' }, all: { kind: 'num', label: '恒等吗（1/0）' }, first: { kind: 'num', label: '第一个相等的 x' } },
        icon: () => K.text(32, 27, 'x=?', { size: 22, weight: 700, fill: 'var(--accent)' }),
        size: () => [340, 170],
        compute: (c) => {
          let rows;
          try { rows = scan(c.props); } catch (e) { c.say('reject', '式子有问题：' + e.message); return {}; }
          const hits = rows.filter((r) => r.ok), n = rows.length;
          const o = { hits: num(hits.length), all: num(hits.length === n ? 1 : 0) };
          if (hits.length) o.first = num(hits[0].x);
          c.say(hits.length === n ? 'ok' : 'info', hits.length === n ? '试了 ' + n + ' 个 x 全部相等：看起来是恒等式（但试的只是证据，要证明才算）' : hits.length ? '只有 ' + hits.length + ' 个 x 让两边相等（如 x=' + hits[0].x + '）：这是方程，不是恒等式' : '没有一个 x 能让两边相等：永远不成立');
          return o;
        },
        badge: (c) => (c.out.all ? (Q.num(c.out.all.data) ? '恒等（证据）' : Q.num(c.out.hits.data) + ' 个 x 成立') : ''),
        draw: (c) => {
          let rows; try { rows = scan(c.props); } catch (e) { return K.text(c.w / 2, c.h / 2, '式子有问题', { fill: 'var(--bad)' }); }
          let g = K.text(c.w / 2, 26, c.props.left + '  =  ' + c.props.right, { size: 16, weight: 700 });
          const W = c.w - 24, step = W / rows.length;
          rows.forEach((r, i) => { g += K.circle(12 + step * (i + 0.5), c.h / 2 + 8, Math.min(7, step / 2 - 1), { fill: r.ok ? 'var(--good)' : 'var(--bad)' }); });
          g += K.text(12, c.h - 22, c.props.lo, { size: 11, fill: 'var(--dim)', anchor: 'start' }) + K.text(c.w - 12, c.h - 22, c.props.hi, { size: 11, fill: 'var(--dim)', anchor: 'end' });
          return g + K.text(c.w / 2, c.h - 22, '绿＝相等  红＝不等', { size: 11, fill: 'var(--dim)' });
        },
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
