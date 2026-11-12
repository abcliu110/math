/* 代数砖题的参考解（problems/tiles.js）。 */
'use strict';
const set = (h, o) => { const t = h.role('t'); for (const k of Object.keys(o)) h.set(t, k, o[k]); };
module.exports = {
  'tl-expand'(h) { set(h, { n2: 1, n1x: 5, n1: 4 }); },
  'tl-factor'(h) { set(h, { gans: 1, n2: 1, n1x: 5, n1: 6, wp: 3, hp: 2 }); },
  'tl-complete'(h) { set(h, { n1: 9 }); },
  'tl-trap'(h) { set(h, { gans: 2 }); },
};
