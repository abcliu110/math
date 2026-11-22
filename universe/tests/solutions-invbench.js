/* “不变量放大镜”题的参考解（problems/invbench.js）。hist 是每一步的局面，lens 放大镜看第几个量，ans 下的结论。 */
'use strict';
const at = (h, x) => { Object.keys(x).forEach((k) => h.set(h.role('iv'), k, x[k])); };
module.exports = {
  'iv-sum-board'(h) { at(h, { lens: 2, hist: '1,2,3,4,5,6|3,3,4,5,6|6,4,5,6|10,5,6|15,6|21' }); },
  'iv-diff-100'(h) { at(h, { lens: 3, hist: '1,2,3,4,5,6|1,3,4,5,6|2,4,5,6|2,1,6', ans: 2 }); },
  'iv-cups-7-2'(h) { at(h, { lens: 3, hist: '0000000|1100000|1010000', ans: 2 }); },
  'iv-cups-6-2'(h) { at(h, { hist: '000000|110000|111100|111111' }); },
  'iv-cups-7-3'(h) { at(h, { hist: '0000000|1110000|0111100|1111111' }); },
};
