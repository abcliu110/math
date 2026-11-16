/* “集合圈”题的参考解（problems/vennbench.js）。学生是一个一个拖进去的；这里直接设每个东西在哪（1 只在左圈，2 重叠，3 只在右圈，4 圈外，0 托盘）。 */
'use strict';
const w = (...list) => (h) => { const v = h.role('v'); for (const t of list) h.set(v, 'where', t); };
const rep = (ch, n) => String(ch).repeat(n);
const sort = (lo, hi, fa, fb) => { let s = ''; for (let v = lo; v <= hi; v++) { const a = fa(v), b = fb(v); s += a && b ? 2 : a ? 1 : b ? 3 : 4; } return s; };
module.exports = {
  'vn-8-6-3': w(rep(2, 3) + rep(0, 11), rep(2, 3) + rep(1, 5) + rep(0, 6), rep(2, 3) + rep(1, 5) + rep(3, 3) + rep(0, 3)),
  'vn-sort-2-3': w('000002000002', sort(1, 12, (v) => v % 2 === 0, (v) => v % 3 === 0)),
  'vn-find-both': w(rep(1, 12) + rep(0, 8), rep(1, 6) + rep(2, 6) + rep(3, 8)),
  'vn-neither': w(rep(2, 2) + rep(0, 13), rep(2, 2) + rep(1, 5) + rep(0, 8), rep(2, 2) + rep(1, 5) + rep(3, 4) + rep(0, 4), rep(2, 2) + rep(1, 5) + rep(3, 4) + rep(4, 4)),
  'vn-odd-5': w(sort(1, 15, (v) => v % 2 === 1, (v) => v % 5 === 0)),
  'vn-no-overlap': w(sort(1, 10, (v) => v % 2 === 1, (v) => v % 2 === 0)),
};
