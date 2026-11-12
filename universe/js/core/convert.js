/* 连线时的类型转换（任务 B.1，见 next-steps.md §3.1）。
 * 源值的 kind 和目标口要的 kind 不同时，调用 U.KINDS[源].to[目标](数据) 得到新数据。
 * 精确标记与量纲照传；转换不得把精确值变成近似值（否则要用显式的“近似器”器材）。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q;

  // 首批转换（只声明在 to 里，world.js 的 gather 执行）
  const toQ = (x) => (x && typeof x === 'object' && 'n' in x ? x : Q.fromNumber(+x));
  U.KINDS.num.to = Object.assign({}, U.KINDS.num.to || {}, {
    expr: (q) => U.Poly.const(q),                     // 常数多项式（代数式与多项式同表示）
  });
  U.KINDS.point.to = Object.assign({}, U.KINDS.point.to || {}, {
    fig: (p) => ({ type: 'point', pts: [{ x: p.x, y: p.y }] }),   // 点图形
  });
  U.KINDS.fig.to = Object.assign({}, U.KINDS.fig.to || {}, {
    point: (f) => (f.type === 'point' ? { x: f.pts[0].x, y: f.pts[0].y } : null),   // 只有点图形能变回点
  });
  U.KINDS.seq.to = Object.assign({}, U.KINDS.seq.to || {}, {
    set: (arr) => U.SetV.of(arr.map(toQ)),           // 数列变成集合（去重、排序）
  });

  // 数列、符号数、符号点接进管道：精确值不丢；做不到的返回 null（连线时提示“不能转换”）
  U.KINDS.seq.to = Object.assign({}, U.KINDS.seq.to || {}, {
    table: (arr) => U.Table.make([{ name: '序号' }, { name: '值' }], arr.map((x, i) => [Q(i + 1), toQ(x)])),   // 数列变成两列的表：序号、值
    dist: (arr) => {                                    // 全是不太大的整数时，数列变成分布（统计量、直方图能接）
      const xs = arr.map(toQ); if (!xs.length || !xs.every((x) => x.d === 1n)) return null;
      const ns = xs.map((x) => Number(x.n)), lo = Math.min.apply(null, ns), hi = Math.max.apply(null, ns);
      if (hi - lo > 200) return null;
      const counts = new Array(hi - lo + 1).fill(0); ns.forEach((n) => { counts[n - lo]++; });
      return { lo, counts };
    },
  });
  U.KINDS.real.to = Object.assign({}, U.KINDS.real.to || {}, {
    num: (r) => (r.b.n === 0n && r.p.n === 0n ? r.a : null),   // 只有“其实是有理数”的符号数才能直接当数
  });
  U.KINDS.spoint.to = Object.assign({}, U.KINDS.spoint.to || {}, {
    point: (p) => (p.x.b.n === 0n && p.x.p.n === 0n && p.y.b.n === 0n && p.y.p.n === 0n ? { x: p.x.a, y: p.y.a } : null),
  });
  U.KINDS.point.to = Object.assign({}, U.KINDS.point.to || {}, {
    spoint: (p) => ({ x: U.Real.from(p.x), y: U.Real.from(p.y) }),
  });

  // 执行一次转换：返回新值；不能转换时返回 null
  U.convertVal = function (v, dst) {
    if (!v || v.kind === dst || dst === 'any') return v;
    const K = U.KINDS[v.kind], fn = K && K.to && K.to[dst];
    if (typeof fn !== 'function') return null;
    const data = fn(v.data);
    if (data === null || data === undefined) return null;
    const out = U.val(dst, data, { dim: v.dim, exact: v.exact !== false });
    return out;
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
