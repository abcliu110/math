/* 证明排序题的参考解（problems/proofsort.js）。 */
'use strict';
const go = (h) => {
  const p = h.role('p'), P = h.U.Proofsort.proofOf(h.props(p)), C = h.U.Proofsort.cardsOf(P);
  P.steps.forEach((st, i) => { h.set(p, 'add', C.findIndex((c) => c.id === st.id) + 1); h.set(p, 'rr', i * 10 + P.rules.indexOf(st.rule) + 1); });
};
module.exports = { 'ps-odd-odd': go, 'ps-vertical': go, 'ps-isosceles': go, 'ps-parallelogram': go };
