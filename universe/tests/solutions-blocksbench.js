/* 计数块与数位题的参考解（problems/blocksbench.js）。学生是在图上拖出来的；这里直接设同样的属性。 */
'use strict';
const set = (h, o) => { const k = h.role('k'); for (const x of Object.keys(o)) h.set(k, x, o[x]); };
module.exports = {
  'bk-make-16'(h) { set(h, { t: 1, o: 6 }); },
  'bk-make-34'(h) { set(h, { t: 3, o: 4 }); },
  'bk-bundle'(h) { set(h, { t: 3, o: 4 }); },
  'bk-27-15'(h) { set(h, { t: 4, o: 2 }); },
  'bk-38-46'(h) { set(h, { t: 8, o: 4 }); },
  'bk-156-87'(h) { set(h, { o: 3, t: 14 }); set(h, { t: 4, h: 2 }); },
  'bk-break-ten'(h) { set(h, { t: 4, o: 12 }); },
  'bk-hundred'(h) { set(h, { h: 0, t: 10 }); },
  'bk-205'(h) { set(h, { h: 2, o: 5 }); },
  'bk-other-way'(h) { set(h, { t: 2, o: 14 }); },
};
