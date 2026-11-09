/* 其余首批值类型（设计 v2 §1.7）：set（集合）、vec（向量）、expr（一元多项式，供方程 / 恒等式）、graph（图）。
 * 每种 kind 都有 eq / show / serialize / parse（默认 JSON 往返），由 U.defineKind 注册。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q;

  const cmpQ = (a, b) => Q.cmp(a, b);
  // 集合：有理数的有序、去重列表
  const SetV = {
    of(list) {
      const s = [];
      for (const x of list) if (!s.some((y) => Q.eq(x, y))) s.push(x);
      return s.sort(cmpQ);
    },
    has: (set, x) => set.some((y) => Q.eq(x, y)),
    union: (a, b) => SetV.of(a.concat(b)),
    inter: (a, b) => SetV.of(a.filter((x) => SetV.has(b, x))),
  };

  // 一元多项式：coeffs[i] 是 x^i 的系数（有理数）；末尾的 0 去掉
  const Expr = {
    trim(c) { const a = c.slice(); while (a.length && a[a.length - 1].n === 0) a.pop(); return a; },
    add(a, b) { const n = Math.max(a.length, b.length), r = []; for (let i = 0; i < n; i++) r.push(Q.add(a[i] || Q(0), b[i] || Q(0))); return Expr.trim(r); },
    mul(a, b) {
      if (!a.length || !b.length) return [];
      const r = Array.from({ length: a.length + b.length - 1 }, () => Q(0));
      a.forEach((x, i) => b.forEach((y, j) => { r[i + j] = Q.add(r[i + j], Q.mul(x, y)); }));
      return Expr.trim(r);
    },
    eq(a, b) { return a.length === b.length && a.every((x, i) => Q.eq(x, b[i])); },
    eval(c, x) { let s = 0; for (let i = c.length - 1; i >= 0; i--) s = s * x + c[i].n / c[i].d; return s; },
    show(c) {
      if (!c.length) return '0';
      const parts = [];
      for (let i = c.length - 1; i >= 0; i--) {
        const k = c[i]; if (k.n === 0) continue;
        const neg = k.n < 0, mag = Q(Math.abs(k.n), k.d);
        const coef = Q.eq(mag, Q(1)) && i > 0 ? '' : Q.show(mag);
        const pow = i === 0 ? '' : i === 1 ? 'x' : 'x' + String(i).split('').map((d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d]).join('');
        const term = coef + pow;
        parts.push({ neg, term });
      }
      return parts.map((t, i) => (i === 0 ? (t.neg ? '−' : '') : (t.neg ? ' − ' : ' + ')) + t.term).join('');
    },
  };

  // 图：n 个点（编号 0..n-1），边为无向的 [a, b]（a < b），去重并排序
  const Graph = {
    of(n, edges) {
      const seen = {}, out = [];
      for (const [a0, b0] of edges) {
        const a = Math.min(a0, b0), b = Math.max(a0, b0);
        if (a === b || a < 0 || b >= n) continue;
        const k = a + ',' + b; if (seen[k]) continue; seen[k] = 1; out.push([a, b]);
      }
      out.sort((x, y) => x[0] - y[0] || x[1] - y[1]);
      return { n, edges: out };
    },
    eq: (a, b) => a.n === b.n && a.edges.length === b.edges.length && a.edges.every((e, i) => e[0] === b.edges[i][0] && e[1] === b.edges[i][1]),
    degree(g, v) { return g.edges.filter((e) => e[0] === v || e[1] === v).length; },
  };

  U.SetV = SetV; U.Expr = Expr; U.Graph = Graph;

  U.defineKind('set', {
    label: '集合', color: '#a3e635',
    eq: (a, b) => a.length === b.length && a.every((x, i) => Q.eq(x, b[i])),
    show: (s) => '{' + s.map((x) => Q.show(x)).join(', ') + '}',
  });
  U.defineKind('vec', {
    label: '向量', color: '#38bdf8',
    eq: (a, b) => a.length === b.length && a.every((x, i) => Q.eq(x, b[i])),
    show: (v) => '(' + v.map((x) => Q.show(x)).join(', ') + ')',
  });
  U.defineKind('graph', {
    label: '图', color: '#c084fc',
    eq: (a, b) => Graph.eq(a, b),
    show: (g) => g.n + ' 个点，' + g.edges.length + ' 条边',
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
