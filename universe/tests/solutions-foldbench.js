/* “折纸与对称”题的参考解（problems/foldbench.js）。 */
'use strict';
const set = (o) => (h) => { const v = h.role('fd'); for (const k of Object.keys(o)) h.set(v, k, o[k]); };
module.exports = { 'fd-rect-axes': set({ found: '0,90' }), 'fd-pgram-none': set({ none: true }) };
