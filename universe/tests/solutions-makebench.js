/* “凑十与拆数”题的参考解（problems/makebench.js）。学生是点圆片做的；这里直接设挪了几个、划掉了哪些、找到的分法。 */
'use strict';
const set = (o) => (h) => { const v = h.role('k'); for (const k of Object.keys(o)) h.set(v, k, o[k]); };
module.exports = {
  'mk-8-5': set({ moved: 2 }), 'mk-15-7': set({ cross: '0,1,2,3,4,5,6' }), 'mk-split-7': set({ splits: '1,2,3,4,5,6' }), 'mk-pairs': set({ taken: '0,1,2,3,5,6,7,8' })
};
