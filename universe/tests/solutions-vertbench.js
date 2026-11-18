/* “竖式（加减与除法）”题的参考解（problems/vertbench.js）。学生是一位一位点出来的；这里直接设写好的得数和点过的进位、退位。 */
'use strict';
const set = (o) => (h) => { const v = h.role('v'); for (const k of Object.keys(o)) h.set(v, k, o[k]); };
module.exports = {
  'vt-47-38': set({ marks: '1', res: '58' }), 'vt-52-27': set({ marks: '1', res: '52' }), 'vt-300-125': set({ marks: '1,2', res: '571' }), 'vt-58-67': set({ marks: '1,2', res: '521' }), 'vt-fill-81': set({ fill: '38' }), 'vt-fill-sub': set({ fill: '34' })
};
