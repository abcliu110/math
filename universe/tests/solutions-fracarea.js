/* 分数面积模型题的参考解（problems/fracarea.js）。 */
'use strict';
module.exports = {
  'fa-numberline'(h) { h.set(h.role('f'), 'a', '3/4'); },
  'fa-add'(h) { const f = h.role('f'); h.set(f, 'op', 2); h.set(f, 'cut', 6); },
  'fa-mul'(h) { const f = h.role('f'); h.set(f, 'gans', '1/2'); h.set(f, 'op', 1); },
  'fa-div'(h) { const f = h.role('f'); h.set(f, 'b', '1/8'); h.set(f, 'op', 3); },
};
