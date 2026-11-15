/* 坐标与函数操作台题的参考解（problems/coordbench.js）。学生是在图上拖出来的；这里直接设同样的属性。 */
'use strict';
const set = (h, o) => { const c = h.role('c'); for (const k of Object.keys(o)) h.set(c, k, o[k]); };
module.exports = {
  'cb-2x-plus-1'(h) { set(h, { b: 1, kn: 2 }); },
  'cb-shift-down'(h) { set(h, { b: -3 }); },
  'cb-negative'(h) { set(h, { b: 2, kn: -1 }); },
  'cb-half'(h) { set(h, { kd: 2 }); },
  'cb-two-points'(h) { set(h, { bx: 3, by: 6, ax: 1, ay: 2 }); },
  'cb-intercepts'(h) { set(h, { bx: 4, by: 0, ax: 0, ay: 4 }); },
  'cb-zero'(h) { set(h, { x: 2 }); },
  'cb-vertex'(h) { set(h, { h: 2, v: -1 }); },
  'cb-no-root'(h) { set(h, { v: 2 }); },
  'cb-flip'(h) { set(h, { h: -1, v: 4, a2: -2 }); },
};
