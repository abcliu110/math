/* 最优化沙盘题的参考解（problems/optimize.js）。 */
'use strict';
const go = (list, g) => (h) => { const o = h.role('o'); h.set(o, 'gx', g); for (const x of list) h.set(o, 'x', x); };
module.exports = { 'op-fence': go([1, 3, 5, 7, 9], 5), 'op-wall': go([1, 3, 5, 7, 9], 5), 'op-horse': go([0, 2, 4, 6, 3], 3) };
