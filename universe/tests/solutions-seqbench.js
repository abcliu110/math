/* “数列与规律”题的参考解（problems/seqbench.js）。 */
'use strict';
const set = (o) => (h) => { const v = h.role('sq'); for (const k of Object.keys(o)) h.set(v, k, o[k]); };
module.exports = {
  'sq-matches-10': set({ k: 3, a: 4, d: 3 }), 'sq-tables-n': set({ k: 3, a: 4, d: 2 }),
};
