/* “量角器与角”题的参考解（problems/anglebench.js）。 */
'use strict';
const set = (o) => (h) => { const v = h.role('an'); for (const k of Object.keys(o)) h.set(v, k, o[k]); };
module.exports = {
  'an-inner-scale': set({ prot: 0 }),
};
