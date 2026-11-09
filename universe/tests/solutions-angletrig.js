/* 角与三角函数补充题的参考解（见 problems/missing-angletrig.js）。 */
'use strict';
module.exports = {
  'mt-right-angle-core'(h) { h.set(h.role('ang'), 'angle', 90); },
  'mt-right-angle-trap'(h) { h.set(h.role('ang'), 'angle', 120); },
  'mt-circle-angle-core'(h) { h.set(h.role('arc'), 'center_angle', 60); },
  'mt-circle-angle-trap'(h) { h.set(h.role('arc'), 'center_angle', 120); },
  'mt-trig-core'(h) { h.set(h.role('tb'), 'angle', 0); },
  'mt-trig-trap'(h) { h.set(h.role('tb'), 'angle', 1); },
};
