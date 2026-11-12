/* 剪拼题的参考解（problems/dissect.js）。 */
'use strict';
module.exports = {
  'dz-pyth'(h) { h.set(h.role('d'), 'gans', 3); h.set(h.role('d'), 'angle', 1); },
  'dz-obtuse'(h) { const d = h.role('d'); h.set(d, 'gans', 2); h.set(d, 'angle', 2); },
  'dz-circle'(h) { const d = h.role('d'); h.set(d, 'gans', 1); h.set(d, 'n', 8); h.set(d, 'n', 16); h.set(d, 'n', 32); },
};
