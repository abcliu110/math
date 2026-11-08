/* 值类型注册表 KINDS。加一种新类型只改这里（或某个器材包里调 U.defineKind），内核不写 if(kind===…)。
 * 每种 kind 必须有 label / eq / show；可选 to（可自动转换到哪些 kind）、color（界面连线与端口颜色）。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q;
  U.KINDS = {};
  U.defineKind = (id, def) => { def.id = id; U.KINDS[id] = def; return def; };

  // 带类型的值：{kind, data, dim, exact}。exact=false 表示近似（浮点、取样），界面上带 ≈。
  U.val = (kind, data, o) => ({ kind, data, dim: (o && o.dim) || null, exact: !(o && o.exact === false) });
  U.vals = (arr) => (arr || []).filter(Boolean);

  U.defineKind('num', { label: '数', color: '#3b9bff', eq: (a, b) => Q.eq(a, b), show: (a) => Q.show(a), approx: (a) => Q.showDec(a, 3) });
  U.defineKind('bool', { label: '真假', color: '#f5a524', eq: (a, b) => a === b, show: (a) => (a ? '是' : '否') });
  U.defineKind('dist', {
    label: '分布', color: '#a78bfa',
    eq: (a, b) => a.lo === b.lo && a.counts.length === b.counts.length && a.counts.every((c, i) => c === b.counts[i]),
    show: (a) => '共 ' + a.counts.reduce((s, c) => s + c, 0) + ' 次',
  });
  U.defineKind('fn', {
    label: '直线', color: '#34d399',
    eq: (a, b) => Q.eq(a.k, b.k) && Q.eq(a.b, b.b),
    show: (f) => {
      const k = f.k, b = f.b;
      const kx = k.n === 0 ? '' : Q.eq(k, Q(1)) ? 'x' : Q.eq(k, Q(-1)) ? '−x' : (k.n < 0 ? '−' : '') + Q.show(Q(Math.abs(k.n), k.d)) + 'x';
      const bs = b.n === 0 ? (kx ? '' : '0') : (kx ? (b.n < 0 ? ' − ' : ' + ') : (b.n < 0 ? '−' : '')) + Q.show(Q(Math.abs(b.n), b.d));
      return 'y = ' + kx + bs;
    },
  });
  U.defineKind('point', { label: '点', color: '#fb7185', eq: (a, b) => Q.eq(a.x, b.x) && Q.eq(a.y, b.y), show: (p) => '(' + Q.show(p.x) + ', ' + Q.show(p.y) + ')' });
  U.defineKind('seq', { label: '数列', color: '#f472b6', eq: (a, b) => a.length === b.length && a.every((x, i) => x === b[i]), show: (a) => '共 ' + a.length + ' 项' });

  U.kindOK = (src, dst) => src === dst || dst === 'any' || !!(U.KINDS[src] && U.KINDS[src].to && U.KINDS[src].to[dst]);
  U.kindName = (k) => (U.KINDS[k] ? U.KINDS[k].label : k);
  U.kindColor = (k) => (U.KINDS[k] ? U.KINDS[k].color : '#94a3b8');
  // 值的文字表示（读数、连线气泡）。近似值带 ≈。
  U.showVal = (v) => {
    if (!v) return '—';
    const K = U.KINDS[v.kind];
    const s = K ? K.show(v.data) : String(v.data);
    return (v.exact === false ? '≈' : '') + s;
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
