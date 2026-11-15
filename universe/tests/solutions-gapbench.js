/* “间隔与植树”题的参考解（problems/gapbench.js）。学生是在图上拖、点出来的；这里直接设同样的属性。 */
'use strict';
const set = (o) => (h) => { const g = h.role('g'); for (const k of Object.keys(o)) h.set(g, k, o[k]); };
module.exports = {
  'gp-20-5': set({ gap: 5 }), 'gp-one-end': set({ re: 0 }), 'gp-no-ends': set({ le: 0, re: 0 }), 'gp-saw': set({ gap: 2, le: 0, re: 0 }),
  'gp-lamps': set({ len: 60 }), 'gp-ring': set({ ring: 1 }),
};
