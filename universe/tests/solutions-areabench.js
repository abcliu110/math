/* “面积公式推导”题的参考解（problems/areabench.js）。 */
'use strict';
const set = (o) => (h) => { const v = h.role('ar'); for (const k of Object.keys(o)) h.set(v, k, o[k]); };
module.exports = {
  'ar-triangle': set({ step: 2 }), 'ar-trapezoid': set({ step: 2 }),
};
