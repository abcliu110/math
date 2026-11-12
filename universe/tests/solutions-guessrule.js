/* 猜规则台题的参考解（problems/guessrule.js）。 */
'use strict';
const tryEx = (h, g, list) => { for (const [i, v] of list) { h.set(g, 'ex', i); h.set(g, 'gs', v); } };
module.exports = {
  'gr-even'(h) { const g = h.role('g'); tryEx(h, g, [[1, 1], [2, 1], [3, 1]]); h.set(g, 'hyp', 1); },
  'gr-mod3'(h) { const g = h.role('g'); tryEx(h, g, [[1, 1], [4, 1], [7, 1], [2, 2], [3, 2]]); h.set(g, 'hyp', 2); h.set(g, 'hyp', 6); },
  'gr-iso'(h) { const g = h.role('g'); tryEx(h, g, [[1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1]]); h.set(g, 'hyp', 1); },
  'gr-swap'(h) {
    const g = h.role('g'); h.set(g, 'mine', 1);
    for (let i = 0; i < 40; i++) { const q = h.U.GuessRule.pending(h.props(g)); if (!q) break; h.set(g, 'ans', q.truth ? 1 : 2); }
  },
};
