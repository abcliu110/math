/* 三视图题的参考解：台面上的三视图器材一开始是空的（全 0），参考解把积木录入 grid，
 * 让每道题的里程碑从“不成立”变成“成立”。h.role('v') 取到台面上的三视图器材。 */
'use strict';
module.exports = {
  'vw-front-core'(h) { h.set(h.role('v'), 'grid', '1,2;1,1'); },
  'vw-front-trap'(h) { h.set(h.role('v'), 'grid', '3,1;1,1'); },
  'vw-side-core'(h) { h.set(h.role('v'), 'grid', '2,0;1,3'); },
  'vw-side-trap'(h) { h.set(h.role('v'), 'grid', '3,0;2,2'); },
  'vw-top-core'(h) { h.set(h.role('v'), 'grid', '1,0;0,1'); },
  'vw-top-trap'(h) { h.set(h.role('v'), 'grid', '3,0;0,1'); },
  'vw-total-core'(h) { h.set(h.role('v'), 'grid', '2,2;2,2'); },
  'vw-total-trap'(h) { h.set(h.role('v'), 'grid', '2,1;1,2'); },
};
