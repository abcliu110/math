/* “正负数（零对）”题的参考解（problems/chipbench.js）。学生是点按钮做出来的；这里直接设最后的片数和步数。 */
'use strict';
const set = (o) => (h) => { const v = h.role('z'); for (const k of Object.keys(o)) h.set(v, k, o[k]); };
module.exports = {
  'zp-neg2-plus5': set({ pos: 3, neg: 0, step: 1 }), 'zp-3-minus-5': set({ pos: 0, neg: 2, step: 1 }),
};
