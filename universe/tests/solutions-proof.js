/* 证明类器材题的参考解（problems/proofs.js）。 */
'use strict';
module.exports = {
  'pf-2n1-prime'(h) { h.set(h.role('c'), 'rule', 5); },
  'pf-prime-odd'(h) { h.set(h.role('c'), 'rule', 3); },
  'pf-half-even'(h) { h.set(h.role('c'), 'rule', 4); },
  'pf-sum3-scan'(h) { h.set(h.role('s'), 'custom', 'n+(n+1)+(n+2) = 3n+3'); },
  'pf-three-dice'(h) { const e = h.role('e'); h.set(e, 'set', 2); h.set(e, 'expected', 216); },
  'pf-induct-odd'(h) { h.set(h.role('i'), 'base', true); },
  'pf-induct-gauss'(h) { h.set(h.role('i'), 'base', true); },
  'pf-induct-pow2'(h) { h.set(h.role('i'), 'base', true); },
  'pf-scaffold-odd'(h) { const k = h.role('i') + '.identity', s = h.role('s'); h.set(s, 'r1', k); h.set(s, 'r2', k); h.set(s, 'r3', k); },
  'pf-board-pattern'(h) { const b = h.role('b'); h.set(b, 'text', '如果前一个数是 5，那么后一个数是 7'); h.set(b, 'ok', true); },
};
