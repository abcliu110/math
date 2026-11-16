/* “速算原理”题的参考解（problems/fastbench.js）。学生是拖把手、剪拼做出来的；这里直接设同样的属性。 */
'use strict';
const set = (...list) => (h) => { const f = h.role('f'); for (const [k, v] of list) h.set(f, k, v); };
module.exports = {
  'fs-99x37': set(['stage', 1], ['stage', 2]), 'fs-48x25': set(['stage', 1], ['stage', 2]),
  'fs-25x36': set(['s', 4]), 'fs-125x32': set(['s', 8]),
  'fs-23x27': set(['stage', 1]), 'fs-64x66': set(['stage', 1]), 'fs-19x21': set(['stage', 1]), 'fs-48x52': set(['stage', 1]),
  'fs-35sq': set(['s', 30]), 'fs-34x11': set(['s', 10]),
};
