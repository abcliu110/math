/* 函数机题的参考解（problems/fmachine.js）。 */
'use strict';
const feed = (h, m, list, f) => { for (const x of list) { h.set(m, 'ex', String(x)); h.set(m, 'gy', String(f(x))); } };
module.exports = {
  'fm-times3'(h) { const m = h.role('m'); feed(h, m, [1, 2, 3], (x) => 3 * x); h.set(m, 'hyp', 1); },
  'fm-cheat'(h) { const m = h.role('m'); feed(h, m, [0, 1], (x) => 2 * x + 1); h.set(m, 'hyp', 2); feed(h, m, [2, 3, 4], (x) => x * x + x + 1); h.set(m, 'hyp', 3); },
  'fm-proportional'(h) { h.set(h.role('m'), 'b', 0); },
  'fm-tank'(h) { const m = h.role('m'); h.set(m, 'k', 3); h.set(m, 'b', 5); },
};
