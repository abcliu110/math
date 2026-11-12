/* 线段图题的参考解（problems/barmodel.js）。 */
'use strict';
const draw = (sa, sb, ea, eb) => (h) => { const b = h.role('b'); h.set(b, 'sa', sa); h.set(b, 'sb', sb); h.set(b, 'ea', ea); h.set(b, 'eb', eb); };
module.exports = { 'bm-more5': draw(1, 1, 0, 5), 'bm-times3': draw(1, 3, 0, 0), 'bm-sum-times': draw(1, 3, 0, 0), 'bm-diff-times': draw(1, 4, 0, 0), 'bm-sum-more': draw(1, 1, 0, 5) };
