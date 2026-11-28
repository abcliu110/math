/* “因数与倍数”题的参考解（problems/factorbench.js）。 */
'use strict';
const set = (o) => (h) => { const v = h.role('f'); for (const k of Object.keys(o)) h.set(v, k, o[k]); };
module.exports = {
  'fb-24': set({ w: 4, found: '1,2,3,4' }), 'fb-360': set({ w: 18, found: '1,2,3,4,5,6,8,9,10,12,15,18' }), 'fb-29': set({ w: 1, found: '1' }), 'fb-sieve': set({ one: true, sieved: '2,3,5,7' })
};
