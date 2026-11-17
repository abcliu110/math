/* “日历”题的参考解（problems/calbench.js）。 */
'use strict';
const set = (o) => (h) => { const v = h.role('cl'); for (const k of Object.keys(o)) h.set(v, k, o[k]); };
module.exports = {
  'cal-feb-2024': set({ mo: 2 }), 'cal-may-days': set({ d1: 1, d2: 31 }),
};
