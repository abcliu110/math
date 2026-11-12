/* 缩放对比、影子测高题的参考解（problems/scale.js）。 */
'use strict';
module.exports = {
  'sc-area'(h) { const s = h.role('s'); h.set(s, 'gans', '4'); h.set(s, 'k', '2'); h.set(s, 'k', '3/2'); h.set(s, 'k', '2'); },
  'sc-cube'(h) { const s = h.role('s'); h.set(s, 'gans', '4'); h.set(s, 'k', '2'); },
  'sh-tree'(h) { const s = h.role('h'); h.set(s, 'hgt', '9'); h.set(s, 'sun', 1); h.set(s, 'sun', 2); h.set(s, 'myans', '8'); },
};
