/* “枚举树”题的参考解（problems/treebench.js）：每一枝都按从小到大列全。 */
'use strict';
const at = (x) => (h) => { Object.keys(x).forEach((k) => h.set(h.role('tr'), k, x[k])); };
module.exports = {
  'tr-123': at({ got: '123,132,213,231,312,321', open: 3 }),
  'tr-0123': at({ got: '10,12,13,20,21,23,30,31,32', open: 4 }),
  'tr-even': at({ got: '12,14,24,32,34,42', open: 4 }),
  'tr-repeat': at({ got: '11,12,13,21,22,23,31,32,33', open: 3 }),
  'tr-coins-10': at({ got: '0-0,0-1,0-2,0-3,0-4,0-5,1-0,1-1,1-2,2-0', open: 3 }),
};
