/* “行程”题的参考解（problems/travelbench.js）。学生是拖时间条、拖箭头做出来的；这里直接设同样的属性。 */
'use strict';
const set = (...list) => (h) => { const r = h.role('r'); for (const [k, v] of list) h.set(r, k, v); };
module.exports = {
  'tv-solo': set(['t', 5]), 'tv-meet': set(['t', 6]), 'tv-chase': set(['t', 6]), 'tv-apart': set(['t', 4]),
  'tv-find-speed': set(['vb', 8], ['t', 5]), 'tv-graph': set(['t', 10]),
};
