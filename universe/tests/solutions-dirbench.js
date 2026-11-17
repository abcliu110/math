/* “方向与路线”题的参考解。 */
'use strict';
const set = (o) => (h) => { const v = h.role('dr'); for (const k of Object.keys(o)) h.set(v, k, o[k]); };
module.exports = { 'dr-reverse': set({ ans: 5 }), 'dr-route': set({ path: 'EEEEEENNNN' }), 'dr-bearing': set({ deg: 30, dist: 3 }) };
