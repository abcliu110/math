/* 找错台题的参考解（problems/findbug.js）。 */
'use strict';
const solve = (pick, reason, fix) => (h) => { const f = h.role('f'); h.set(f, 'claim', 2); h.set(f, 'pick', pick); h.set(f, 'reason', reason); h.set(f, 'fix', fix); };
module.exports = {
  'fb-law-25x12': solve(2, 1, '25×4+25×8'),
  'fb-frac-add': solve(2, 2, '3/6+2/6'),
  'fb-eq-move': solve(2, 1, '3x=15'),
  'fb-order': solve(2, 3, '12−2×4'),
  'fb-eq-paren': solve(2, 4, '2x−6=10'),
  'fb-square': solve(2, 2, 'x^2+6x+9'),
  'fb-neg': solve(2, 1, '−3+2'),
  'fb-div-frac': solve(2, 3, '(2/3)×(5/4)'),
  'fb-sub-frac': solve(2, 2, '3/4−2/4'),
  'fb-ltr': solve(2, 1, '4×4'),
  'fb-eq-div': solve(2, 2, 'x=12÷4'),
  'fb-eq-neg': solve(2, 1, 'x=8÷(−2)'),
  'fb-eq-both': solve(2, 1, '2x−x=7−3'),
  'fb-combine': solve(2, 4, '5x'),
  'fb-sq2': solve(2, 2, 'x^2−2x+1'),
  'fb-ok-expr'(h) { h.set(h.role('f'), 'claim', 1); },
  'fb-ok-frac'(h) { h.set(h.role('f'), 'claim', 1); },
  'fb-ok-factor'(h) { h.set(h.role('f'), 'claim', 1); },
  'fb-all-correct'(h) { h.set(h.role('f'), 'claim', 1); },
};
