/* 质因数积木题的参考解（problems/primeblocks.js）。 */
'use strict';
module.exports = {
  'pb-split-36'(h) { h.set(h.role('p'), 'a', 36); },
  'pb-gcd-24-36'(h) { h.set(h.role('p'), 'b', 36); },
  'pb-reduce-24-36'(h) { h.set(h.role('p'), 'b', 36); },
  'pb-count-divisors'(h) { h.set(h.role('p'), 'guess', '9'); },
  'pb-twelve-divisors'(h) { h.set(h.role('p'), 'a', 60); },
};
