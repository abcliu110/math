/* “换一换”题的参考解（problems/swapbench.js）。学生是在图上点、拖出来的；这里直接设“乙有几个”。 */
'use strict';
const k = (n) => (h) => h.set(h.role('s'), 'k', n);
const lift = (n) => (h) => { h.set(h.role('s'), 'lift', true); h.set(h.role('s'), 'k', n); };
module.exports = {
  'sw-8-26': k(5), 'sw-from-rabbits': k(5), 'sw-boats': k(3), 'sw-basketball': k(3), 'sw-money': k(5), 'sw-wheels': k(4), 'sw-bugs': k(4), 'sw-table': k(8), 'sw-balance': k(6), 'sw-lift': lift(5),
  'sw-as-system'(h) { const s = h.role('s'); h.set(s, 'e0', '1,1,0,0,0,8'); h.set(s, 'e1', '2,4,0,0,0,26'); h.set(s, 'view', 1); h.set(s, 'e1', '1,3,0,0,0,18'); h.set(s, 'e1', '0,2,0,0,0,10'); h.set(s, 'e1', '0,1,0,0,0,5'); h.set(s, 'view', 0); h.set(s, 'k', 5); },
};
