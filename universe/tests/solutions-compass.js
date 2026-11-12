/* 尺规作图题的参考解（problems/compass.js）。 */
'use strict';
// 在步骤里取“对象 i 和对象 j 的第 w 个交点”：按坐标在候选交点里找
const take = (h, o, i, j, w, any) => {
  const C = h.U.Compass, p = h.props(o), S = String(p.steps || '').split(';').filter(Boolean), giv = C.givOf(p.task), B = C.build(S, giv), I = C.inter(B.P, B.O[i], B.O[j]), list = C.cands(S, giv), find = (q) => list.findIndex((x) => Math.hypot(x.q[0] - q[0], x.q[1] - q[1]) < 1e-7);
  let at = find(I[w]); if (any && at < 0) at = find(I[1 - w]);
  h.set(o, 'tool', 3); h.set(o, 'cand', at + 1);
};
const circle = (h, o, c, p) => { h.set(o, 'tool', 1); h.set(o, 'pt', c + 1); h.set(o, 'pt', p + 1); };
const line = (h, o, a, b) => { h.set(o, 'tool', 2); h.set(o, 'pt', a + 1); h.set(o, 'pt', b + 1); };
module.exports = {
  'cs-bisector': (h) => { const o = h.role('c'); circle(h, o, 0, 1); circle(h, o, 1, 0); take(h, o, 0, 1, 0); take(h, o, 0, 1, 1); line(h, o, 2, 3); },
  'cs-equilateral': (h) => { const o = h.role('c'); circle(h, o, 0, 1); circle(h, o, 1, 0); take(h, o, 0, 1, 0); },
  'cs-anglebisect': (h) => { const o = h.role('c'); circle(h, o, 0, 1); line(h, o, 0, 2); take(h, o, 0, 1, 1); circle(h, o, 1, 3); circle(h, o, 3, 1); take(h, o, 2, 3, 0); line(h, o, 0, 4); },
  'cs-perp': (h) => { const o = h.role('c'); line(h, o, 0, 1); circle(h, o, 2, 0); take(h, o, 0, 1, 0, true); circle(h, o, 0, 3); circle(h, o, 3, 0); take(h, o, 2, 3, 0); take(h, o, 2, 3, 1); line(h, o, 4, 5); },
};
