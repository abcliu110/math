/* 分数条与比题的参考解（problems/ratiobench.js）。学生是在图上拖出来的；这里直接设同样的属性。 */
'use strict';
const set = (h, o) => { const r = h.role('r'); for (const k of Object.keys(o)) h.set(r, k, o[k]); };
module.exports = {
  'rb-half-third'(h) { set(h, { n1: 1, n2: 1 }); },
  'rb-equal-half'(h) { set(h, { n2: 1 }); },
  'rb-eighths'(h) { set(h, { d2: 8, n2: 6 }); },
  'rb-diff'(h) { set(h, { n1: 3, n2: 2 }); },
  'rb-make-one'(h) { set(h, { d2: 4, n2: 3 }); },
  'rb-apples'(h) { set(h, { t: 5 }); },
  'rb-28yuan'(h) { set(h, { t: 7 }); },
  'rb-percent'(h) { set(h, { t: 25 }); },
  'rb-discount'(h) { set(h, { t: 80 }); },
  'rb-ratio-2-3'(h) { set(h, { t: 8 }); },
};
