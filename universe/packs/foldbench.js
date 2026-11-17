/* 器材包 foldbench：折纸与对称。
 *   一张纸（正方形、长方形、等腰三角形、圆、平行四边形），一条折痕。拖折痕一头的圆点转它（15° 一格），拖中间的圆点把它往旁边挪。
 *   点“折一下”：折痕这边的一半翻过去（半透明、虚线），叠在另一半上，看两半能不能完全重合。重合就是一条对称轴，记下来；
 *   找全了说“找全了，有几条对称轴”（圆说“有无数条”，平行四边形一条也没有——可以点“它没有对称轴”）。
 * 这一版的边界（如实写）：折痕方向 15° 一格；偏移 0.5 格一格；“重合”按顶点精确判断（圆单独判断）。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 700, CX = 230, CY = 228, S = 40;   // 纸的中心、一格多少像素
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? +v : lo));
  const SHAPES = [
    { name: '正方形', pts: [[-2, -2], [2, -2], [2, 2], [-2, 2]], axes: [0, 45, 90, 135] },
    { name: '长方形', pts: [[-3, -2], [3, -2], [3, 2], [-3, 2]], axes: [0, 90] },
    { name: '等腰三角形', pts: [[-2.5, -2], [2.5, -2], [0, 2.5]], axes: [90] },
    { name: '圆', circle: 2.5, axes: null },
    { name: '平行四边形', pts: [[-3, -2], [2, -2], [3, 2], [-2, 2]], axes: [] },
  ];
  const EPS = 1e-6;
  function model(p) {
    const shape = Math.round(clamp(p.shape, 0, SHAPES.length - 1)), SH = SHAPES[shape], angle = ((Math.round(clamp(p.angle, -360, 360) / 15) * 15) % 180 + 180) % 180, off = Math.round(clamp(p.off, -3, 3) * 2) / 2, folded = !!p.folded;
    const found = [...new Set(String(p.found || '').split(',').filter((x) => x !== '').map(Number))].sort((a, b) => a - b);
    const a = angle * Math.PI / 180, u = [Math.cos(a), Math.sin(a)], n = [-u[1], u[0]], q = [off * n[0], off * n[1]];
    const refl = ([x, y]) => { const d = (x - q[0]) * n[0] + (y - q[1]) * n[1]; return [x - 2 * d * n[0], y - 2 * d * n[1]]; };
    let same;
    if (SH.circle) same = off === 0;
    else { const R = SH.pts.map(refl); same = R.every((r) => SH.pts.some((s) => Math.abs(s[0] - r[0]) < EPS && Math.abs(s[1] - r[1]) < EPS)); }
    const total = SH.circle ? Infinity : SH.axes.length, all = SH.circle ? found.length >= 4 : total > 0 && SH.axes.every((x) => found.includes(x));
    return { shape, SH, angle, off, folded, found, u, n, q, refl, same, total, all, none: !!p.none };
  }
  const X = (x) => CX + x * S, Y = (y) => CY - y * S;
  const poly = (pts, o) => '<polygon points="' + pts.map(([x, y]) => X(x).toFixed(1) + ',' + Y(y).toFixed(1)).join(' ') + '" fill="' + o.fill + '" fill-opacity="' + (o.op || 1) + '" stroke="' + (o.stroke || '#3a4a63') + '" stroke-width="' + (o.w || 1.6) + '"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') + '/>';
  // 用折痕切多边形：side = +1 留法向正的一边
  function clip(pts, m, side) {
    const out = [], f = (p) => side * ((p[0] - m.q[0]) * m.n[0] + (p[1] - m.q[1]) * m.n[1]);
    for (let i = 0; i < pts.length; i++) {
      const A = pts[i], B = pts[(i + 1) % pts.length], fa = f(A), fb = f(B);
      if (fa >= 0) out.push(A);
      if ((fa >= 0) !== (fb >= 0)) { const t = fa / (fa - fb); out.push([A[0] + t * (B[0] - A[0]), A[1] + t * (B[1] - A[1])]); }
    }
    return out;
  }
  const circlePts = (r) => { const o = []; for (let i = 0; i < 72; i++) o.push([r * Math.cos(i * Math.PI / 36), r * Math.sin(i * Math.PI / 36)]); return o; };
  const btn = (x, y, w, label, patch, enabled, tip) => '<g' + (enabled ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' data-off="1"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 26, { fill: enabled ? '#fff' : '#f1f3f6', stroke: enabled ? 'var(--blue)' : '#b8c0cc', r: 7, w: 1.4 }) + K.text(x + w / 2, y + 17, label, { size: 12, weight: 700, fill: enabled ? 'var(--ink)' : '#5f6773' }) + '</g>';
  const L = 3.8;   // 折痕画多长（格）
  function grips(c) {
    const m = model(c.props); if (m.folded) return [];
    const end = [m.q[0] + L * m.u[0], m.q[1] + L * m.u[1]];
    return [
      { id: 'rot', x: X(end[0]), y: Y(end[1]), r: 10, cursor: 'grab', tip: '拖：转折痕', drag: (c0, q) => { const ang = Math.atan2(CY - q.y, q.x - CX) * 180 / Math.PI; return { angle: ((Math.round(ang / 15) * 15) % 180 + 180) % 180, folded: false }; }, say: (c1) => '折痕 ' + model(c1.props).angle + '°' },
      { id: 'off', x: X(m.q[0]), y: Y(m.q[1]), r: 10, cursor: 'move', tip: '拖：把折痕往旁边挪', drag: (c0, q) => { const m0 = model(c0.props), dx = (q.x - CX) / S, dy = (CY - q.y) / S; return { off: Math.max(-3, Math.min(3, Math.round((dx * m0.n[0] + dy * m0.n[1]) * 2) / 2)), folded: false }; }, say: (c1) => '离中心 ' + model(c1.props).off + ' 格' },
    ];
  }
  function draw(c) {
    const p = c.props, m = model(p); let s = '';
    const pts = m.SH.circle ? circlePts(m.SH.circle) : m.SH.pts;
    s += K.text(20, 26, m.SH.name + '：怎样折，两半正好重合？', { size: 16, weight: 700, anchor: 'start' });
    SHAPES.forEach((sh, i) => { s += btn(20 + i * 92, 38, 86, sh.name, { shape: i, folded: false, found: '', none: false }, m.shape !== i, '换成' + sh.name); });
    if (!m.folded) s += poly(pts, { fill: '#fdf0c4', stroke: '#8a6d1a' });
    else {
      const keep = clip(pts, m, -1), flip = clip(pts, m, 1).map(m.refl);
      s += poly(pts, { fill: '#fdf0c4', op: 0.25, stroke: '#c9b88a', w: 1, dash: '3 3' }) + (keep.length > 2 ? poly(keep, { fill: '#fdf0c4', stroke: '#8a6d1a' }) : '') + (flip.length > 2 ? poly(flip, { fill: m.same ? '#9fd5ad' : '#f4a6a0', op: 0.6, stroke: m.same ? '#1f6a34' : '#a12a1f', dash: '5 3', w: 2 }) : '');
    }
    const a = [m.q[0] - L * m.u[0], m.q[1] - L * m.u[1]], b = [m.q[0] + L * m.u[0], m.q[1] + L * m.u[1]];
    s += K.line(X(a[0]), Y(a[1]), X(b[0]), Y(b[1]), { stroke: 'var(--blue)', w: 2, dash: '7 5' }) + K.circle(CX, CY, 3, { fill: '#5a6478' });
    const R0 = 470;
    s += K.text(R0, 100, '折痕：' + m.angle + '°，离中心 ' + m.off + ' 格', { size: 13, anchor: 'start' });
    s += btn(R0, 112, 100, '折一下', { folded: true, found: m.same && m.off === 0 && !m.folded ? [...new Set(m.found.concat([m.angle]))].join(',') : m.found.join(','), none: false }, !m.folded, '把折痕这边翻过去') + btn(R0 + 108, 112, 100, '打开', { folded: false }, m.folded, '把纸打开');
    if (m.folded) s += '<g data-read="1">' + K.text(R0, 170, m.same ? '两半正好重合：这是一条对称轴' : '对不齐（红色）：不是对称轴', { size: 14, weight: 700, anchor: 'start', fill: m.same ? 'var(--blue)' : 'var(--bad)' }) + '</g>';
    s += K.text(R0, 214, '找到的对称轴：' + (m.found.length ? m.found.map((x) => x + '°').join('、') : '还没有'), { size: 13, weight: 700, anchor: 'start' });
    if (m.all) s += '<g data-all="1">' + K.text(R0, 240, m.SH.circle ? '圆过圆心的每条直线都是对称轴：有无数条' : '找全了：' + m.SH.name + '有 ' + m.total + ' 条对称轴', { size: 14, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
    if (m.total === 0) {
      s += btn(R0, 262, 150, '它没有对称轴', { none: true }, !m.none, '试过了，怎么折都对不齐');
      if (m.none) s += '<g data-all="1">' + K.text(R0, 312, '对：平行四边形怎么折都对不齐，没有对称轴', { size: 13, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + K.text(R0, 332, '（转半圈能和自己重合：它是中心对称）', { size: 12, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
    }
    return s;
  }
  U.registerPack({
    id: 'foldbench', version: 1,
    types: {
      foldbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E5', 'E7'],
        label: '折纸与对称', prefix: '折纸', group: '图形', grades: [2, 7],
        alias: ['折纸', '对折', '轴对称', '对称轴', '对称图形', '重合', '折痕'],
        props: {
          shape: { type: 'choice', label: '什么纸', default: 0, choices: SHAPES.map((x) => x.name), write: true },
          angle: { type: 'int', label: '折痕方向（度）', default: 90, min: -360, max: 360, write: true }, off: { type: 'num', label: '折痕离中心几格', default: 0, write: true },
          folded: { type: 'bool', label: '折起来了', default: false, write: true }, found: { type: 'text', label: '找到的对称轴（度）', default: '', write: true }, none: { type: 'bool', label: '说了“没有对称轴”', default: false, write: true },
        },
        outputs: {
          same: { dim: null, kind: 'num', label: '折起来以后两半重合：1，不重合：0（折了才有）' }, axes: { dim: null, kind: 'num', label: '找到几条对称轴' },
          all: { dim: null, kind: 'num', label: '对称轴找全了（或者说对了没有）：1' },
        },
        icon: () => '<polygon points="8,40 32,40 32,8 8,8" fill="#fdf0c4" stroke="#8a6d1a" stroke-width="1.2"/>' + '<polygon points="32,40 50,40 50,8 32,8" fill="#9fd5ad" fill-opacity="0.6" stroke="#1f6a34" stroke-dasharray="3 2" stroke-width="1.2"/>' + K.line(32, 4, 32, 44, { stroke: 'var(--blue)', w: 1.6, dash: '4 3' }),
        size: () => [W, 400],
        grips,
        compute: (c) => {
          const m = model(c.props), o = { axes: num(m.found.length) };
          if (m.folded) o.same = num(m.same ? 1 : 0);
          if (m.all || (m.total === 0 && m.none)) o.all = num(1);
          return o;
        },
        badge: () => '',
        draw,
      },
    },
  });
  U.FoldBench = { model };
})(typeof globalThis !== 'undefined' ? globalThis : window);
