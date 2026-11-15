/* “换一换”题的参考解（problems/swapbench.js）。学生是在图上点、拖出来的；这里直接设“乙有几个”。 */
'use strict';
const k = (n) => (h) => h.set(h.role('s'), 'k', n);
module.exports = {
  'sw-8-26': k(5), 'sw-from-rabbits': k(5), 'sw-boats': k(3), 'sw-basketball': k(3), 'sw-money': k(5), 'sw-wheels': k(4), 'sw-bugs': k(4), 'sw-table': k(8),
};
