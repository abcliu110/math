/* 数轴操作台题的参考解（problems/numlinebench.js）。学生是在图上拖出来的；这里直接设同样的属性。 */
'use strict';
const set = (h, o) => { const n = h.role('n'); for (const k of Object.keys(o)) h.set(n, k, o[k]); };
module.exports = {
  'nl-3-plus-4'(h) { set(h, { a: 3, n: 4 }); },
  'nl-13-minus-5'(h) { set(h, { s: -1, n: 5 }); },
  'nl-4x3'(h) { set(h, { s: 3, n: 4 }); },
  'nl-20-div-4'(h) { set(h, { n: 5 }); },
  'nl-three-quarters'(h) { set(h, { k: 3 }); },
  'nl-five-quarters'(h) { set(h, { k: 5 }); },
  'nl-1p3'(h) { set(h, { d: 10, k: 13 }); },
  'nl-2-minus-5'(h) { set(h, { n: 5 }); },
  'nl-neg3-plus-5'(h) { set(h, { a: -3, n: 5 }); },
  'nl-ineq'(h) { set(h, { lo: -2, hi: 3, lc: 0 }); },
  'nl-jump-23'(h) { h.set(h.role('n'), 'path', '1,1,1,1,0'); }
};
