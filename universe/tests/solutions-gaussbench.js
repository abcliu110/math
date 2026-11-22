/* “高斯求和”题的参考解（problems/gaussbench.js）。a 第一个数，d 每次加几，n 几个数；flip 倒过来写一行，pair 对齐相加。 */
'use strict';
const fin = (h) => { h.set(h.role('gs'), 'flip', true); h.set(h.role('gs'), 'pair', true); };
module.exports = {
  'gs-1-100'(h) { fin(h); },
  'gs-odd'(h) { h.set(h.role('gs'), 'd', 2); h.set(h.role('gs'), 'n', 10); fin(h); },
  'gs-seats'(h) { h.set(h.role('gs'), 'a', 20); h.set(h.role('gs'), 'd', 2); h.set(h.role('gs'), 'n', 15); fin(h); },
  'gs-find-n'(h) { h.set(h.role('gs'), 'n', 20); fin(h); },
};
