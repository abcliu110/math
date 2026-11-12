/* 钉板题的参考解（problems/geoboard.js）。 */
'use strict';
const poly = (h, g, list) => { for (const [x, y] of list) h.set(g, 'pt', y * 7 + x + 1); h.set(g, 'pt', list[0][1] * 7 + list[0][0] + 1); };
module.exports = {
  'gb-area6'(h) { poly(h, h.role('g'), [[0, 0], [3, 0], [3, 2], [0, 2]]); },
  'gb-perim12'(h) { poly(h, h.role('g'), [[0, 0], [4, 0], [4, 2], [0, 2]]); },
  'gb-pick'(h) {
    const g = h.role('g'), shapes = [[[0, 0], [2, 0], [2, 1], [0, 1]], [[0, 0], [3, 0], [0, 3]], [[0, 0], [4, 0], [3, 2], [1, 2]], [[0, 0], [3, 1], [1, 3]], [[0, 0], [2, 0], [2, 2], [0, 2]], [[0, 0], [4, 1], [2, 3]]];
    for (const sh of shapes) { poly(h, g, sh); h.set(g, 'rec', 1); }
    h.set(g, 'fb', '1/2'); h.set(g, 'fc', '-1');
  },
};
