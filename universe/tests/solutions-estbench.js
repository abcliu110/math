/* “估一估”题的参考解（problems/estbench.js）。 */
'use strict';
const set = (o) => (h) => { const v = h.role('e'); for (const k of Object.keys(o)) h.set(v, k, o[k]); };
module.exports = {
  'es-503-198': set({ pa: 1, pb: 2, reveal: true }),
};
