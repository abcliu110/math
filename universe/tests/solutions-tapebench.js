/* “线段图”题的参考解（problems/tapebench.js）。学生是点 + 搭段数、拖把手改一段的长；这里直接设同样的属性。 */
'use strict';
const set = (...list) => (h) => { const t = h.role('t'); for (const [k, v] of list) h.set(t, k, v); };
module.exports = {
  'tp-times-3': set(['ka', 3], ['u', 6]), 'tp-sum-times': set(['u', 12]), 'tp-diff-times': set(['ka', 4], ['u', 8]),
  'tp-sum-diff': set(['u', 12]), 'tp-age': set(['ka', 4], ['u', 9]), 'tp-times-more': set(['ka', 2], ['u', 10]),
  'bm-more5': set(['u', 8]), 'bm-times3': set(['ka', 3], ['u', 4]),
};
