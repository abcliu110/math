/* “代数砖”题的参考解（problems/tilebench.js）。学生是点按钮做出来的；这里直接设最后的长、宽、铺的砖数、剪拼的步数。 */
'use strict';
const set = (o) => (h) => { const v = h.role('tb'); for (const k of Object.keys(o)) h.set(v, k, o[k]); };
module.exports = {
  'tlb-square': set({ p2: 1, p1: 6, p0: 9 }), 'tlb-factor2': set({ wa: 2, wp: 1, ha: 1, hp: 3 }), 'tlb-diff': set({ cut: 2 }),
};
