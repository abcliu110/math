/* 面积模型题的参考解（problems/areamodel.js）。学生是在卡片上拖出来的；这里直接设同样的属性。 */
'use strict';
module.exports = {
  'am-13x7'(h) { h.set(h.role('m'), 'vcuts', '10'); },
  'am-14x12'(h) { const m = h.role('m'); h.set(m, 'vcuts', '10'); h.set(m, 'hcuts', '10'); },
  'am-area24'(h) { h.set(h.role('m'), 'h', 4); },
  'am-square36'(h) { const m = h.role('m'); h.set(m, 'w', 6); h.set(m, 'h', 6); },
  'am-half-third'(h) { const m = h.role('m'); h.set(m, 'd2', 3); h.set(m, 'n2', 1); },
  'am-23x34'(h) { const m = h.role('m'); h.set(m, 'd1', 3); h.set(m, 'n1', 2); h.set(m, 'd2', 4); h.set(m, 'n2', 3); },
  'am-38'(h) { const m = h.role('m'); h.set(m, 'd1', 4); h.set(m, 'n1', 3); },
  'am-x2x3'(h) { const m = h.role('m'); h.set(m, 'a', 2); h.set(m, 'b', 3); },
  'am-factor'(h) { const m = h.role('m'); h.set(m, 'a', 3); h.set(m, 'b', 4); },
  'am-perfect'(h) { const m = h.role('m'); h.set(m, 'a', 3); h.set(m, 'b', 3); },
};
