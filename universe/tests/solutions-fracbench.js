/* “分数运算”题的参考解（problems/fracbench.js）。 */
'use strict';
const set = (o) => (h) => { const v = h.role('fr'); for (const k of Object.keys(o)) h.set(v, k, o[k]); };
module.exports = { 'fr-sub-unlike': set({ ka: 3, kc: 2, done: true }), 'fr-reduce'(h) { const v = h.role('fr'); h.set(v, 'kc', 2); h.set(v, 'done', true); h.set(v, 'red', 3); }, 'fr-recip': set({ flip: true }) };
