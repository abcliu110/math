/* 天平与方程题的参考解（problems/balancebench.js）。学生是在卡片上拖出来的；这里按同样的顺序设属性，每一步都保持平衡。 */
'use strict';
const go = (h, states) => { const b = h.role('b'); for (const [lx, lc, rx, rc] of states) { h.set(b, 'lx', lx); h.set(b, 'rx', rx); h.set(b, 'lc', lc); h.set(b, 'rc', rc); } };
module.exports = {
  'bb-x-plus-5'(h) { const b = h.role('b'); h.set(b, 'rc', 7); h.set(b, 'lc', 0); },
  'bb-linked'(h) { go(h, [[1, 5, 0, 9], [1, 0, 0, 4]]); },
  'bb-2x-10'(h) { const b = h.role('b'); h.set(b, 'rc', 5); h.set(b, 'lx', 1); },
  'bb-2x-3-11'(h) { go(h, [[2, 0, 0, 8], [1, 0, 0, 4]]); },
  'bb-3x-12'(h) { go(h, [[1, 0, 0, 4]]); },
  'bb-box-right'(h) { go(h, [[0, 5, 1, 0]]); },
  'bb-both-sides'(h) { go(h, [[2, 0, 0, 6], [1, 0, 0, 3]]); },
  'bb-4x1-2x9'(h) { go(h, [[2, 0, 0, 8], [1, 0, 0, 4]]); },
  'bb-5x-3x6'(h) { go(h, [[2, 0, 0, 6], [1, 0, 0, 3]]); },
  'bb-make-4'(h) { go(h, [[2, 0, 1, 4], [3, 0, 2, 4]]); },
  'bb-6x2-2x14'(h) { go(h, [[4, 0, 0, 12], [1, 0, 0, 3]]); },
  'bb-3x45-165'(h) { go(h, [[3, 0, 0, 120], [1, 0, 0, 40]]); },
};
