/* “平均数”题的参考解（problems/meanbench.js）。学生是在图上一块一块搬出来的；这里直接设搬完以后每堆的数。 */
'use strict';
const v = (...list) => (h) => { const m = h.role('m'); for (const t of list) h.set(m, 'vals', t); };
module.exports = {
  'mn-3-7-5-9': v('6,6,6,6'), 'mn-no-line': v('7,7,7'), 'mn-between': v('4,4,4,4,4'),
  'mn-add-zero': v('8,8,8,0', '6,6,6,6'), 'mn-target': v('6,9,7,10'), 'mn-not-whole': v('5,6'),
};
