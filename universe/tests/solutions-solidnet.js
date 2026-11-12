/* 展开图和小方块题的参考解（problems/solidnet.js）。 */
'use strict';
// 在目标的三视图下搜一个块数等于 want（'min' 或 'max'）的搭法
const build = (want) => (h) => {
  const o = h.role('n'), SN = h.U.SolidNet, t = h.props(o).tgt, T = SN.views(SN.TGT[t].split('').map(Number)), R = SN.range(t), vol = want === 'min' ? R[0] : R[1];
  const cells = []; for (let i = 0; i < 16; i++) if (T.top[i]) cells.push(i);
  const cap = cells.map((i) => Math.min(T.front[i % 4], T.left[Math.floor(i / 4)])), a = new Array(16).fill(0); let sol = null;
  const rec = (k, v) => { if (sol) return; if (k === cells.length) { const V = SN.views(a); if (v === vol && V.front.join() === T.front.join() && V.left.join() === T.left.join()) sol = a.slice(); return; } for (let x = 1; x <= cap[k]; x++) { a[cells[k]] = x; rec(k + 1, v + x); } a[cells[k]] = 0; };
  rec(0, 0); sol.forEach((v, i) => { if (v) h.set(o, 'put', i * 5 + v + 1); });
};
module.exports = {
  'sn-net-build': (h) => { const o = h.role('n'); for (const v of [2, 7, 8, 9, 10, 14]) h.set(o, 'cell', v); },
  'sn-net-all': (h) => { const o = h.role('n'), SN = h.U.SolidNet; SN.HEX.forEach((c, i) => { h.set(o, 'load', i + 1); h.set(o, 'say', SN.fold(c).foldable ? 1 : 2); }); },
  'sn-cubes-min': build('min'), 'sn-cubes-max': build('max'),
};
