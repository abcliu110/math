/* 代数式操作台题的参考解（problems/termsbench.js）。学生是在图上拖、点出来的；这里直接设同样的属性。 */
'use strict';
const set = (h, o) => { const t = h.role('t'); for (const k of Object.keys(o)) h.set(t, k, o[k]); };
module.exports = {
  'tb-3x-2x'(h) { set(h, { terms: '5x' }); },
  'tb-mixed'(h) { set(h, { terms: '5x,2,5' }); set(h, { terms: '5x,7' }); },
  'tb-4x-minus-x'(h) { set(h, { terms: '3x' }); },
  'tb-two-letters'(h) { set(h, { terms: '3x,3y,-y' }); set(h, { terms: '3x,2y' }); },
  'tb-square'(h) { set(h, { terms: '3x2,3x,-x' }); set(h, { terms: '3x2,2x' }); },
  'tb-refuse'(h) { set(h, { refused: 1 }); },
  'tb-order-mul'(h) { set(h, { toks: '6,+,10' }); set(h, { toks: '16' }); },
  'tb-order-paren'(h) { set(h, { toks: '8,*,5' }); set(h, { toks: '40' }); },
  'tb-order-div'(h) { set(h, { toks: '20,-,3' }); set(h, { toks: '17' }); },
  'tb-order-sub'(h) { set(h, { toks: '20,-,5' }); set(h, { toks: '15' }); },
};
