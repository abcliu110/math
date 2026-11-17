/* “推理台”题的参考解（problems/logicbench.js）。marks 的格式：行,列,值（1 是 ✗，2 是 ✓）。 */
'use strict';
const set = (o) => (h) => { const v = h.role('lg'); for (const k of Object.keys(o)) h.set(v, k, o[k]); };
module.exports = { 'lg-jobs': set({ marks: '0,0,1;0,1,2;0,2,1;1,0,1;1,1,1;1,2,2;2,0,2;2,1,1;2,2,1' }) };
