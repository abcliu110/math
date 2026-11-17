/* “证明台”题的参考解（problems/proofbench.js）。 */
'use strict';
const set = (o) => (h) => { const v = h.role('pf'); for (const k of Object.keys(o)) h.set(v, k, o[k]); };
module.exports = { 'pd-false-base': set({ step: true, base: true }), 'pd-breaks': set({ base: true, step: true, push: true }), 'pd-conj-prime': set({ ci: 3, ct: 3, tried: true }) };
