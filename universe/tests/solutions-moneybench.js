/* “钱币”题的参考解（problems/moneybench.js）。 */
'use strict';
const set = (o) => (h) => { const v = h.role('mo'); for (const k of Object.keys(o)) h.set(v, k, o[k]); };
module.exports = {
  'mn-pay-7-5': set({ tray: '0,1,2,1,0,0,0' }), 'mn-change-20': set({ tray: '0,1,1,1,0,0,0' }), 'mn-fewest': set({ tray: '2,1,3,1,0,0,0' })
};
