/* 七年级题目的参考解（content-g7.js）：用 h 一步步搭，必须能让该题通关（满足 goal）。
 * h.add(type, props) → id；h.link(from, to, toPort, fromPort)；h.set(id,k,v)；h.role(r)；h.run(n) 走 n 拍。 */
'use strict';
module.exports = {
  'g7-rational-compare-core'(h) { const c = h.add('compare', { op: 1 }); h.link(h.role('a'), c, 'a'); h.link(h.role('b'), c, 'b'); },
  'g7-rational-opposite-trap'(h) { const o = h.add('op', { op: 1 }); h.link(h.role('zero'), o, 'a'); h.link(h.role('neg'), o, 'b'); },
  'g7-rational-addsub-core'(h) { const o = h.add('op', { op: 0 }); h.link(h.role('a'), o, 'a'); h.link(h.role('b'), o, 'b'); },
  'g7-rational-subneg-trap'(h) { const o = h.add('op', { op: 1 }); h.link(h.role('a'), o, 'a'); h.link(h.role('b'), o, 'b'); },
  'g7-rational-divsign-core'(h) { const o = h.add('op', { op: 3 }); h.link(h.role('a'), o, 'a'); h.link(h.role('b'), o, 'b'); },
  'g7-rational-mulneg-trap'(h) { const o = h.add('op', { op: 2 }); h.link(h.role('a'), o, 'a'); h.link(h.role('b'), o, 'b'); },
  'g7-poly-order-core'(h) { h.set(h.role('card'), 'text', '2x + x^2 - 3'); },
  'g7-poly-minus-trap'(h) { h.set(h.role('card'), 'text', '-x'); },
  'g7-like-terms-core'(h) { h.set(h.role('card'), 'text', '2x + 3x - x'); },
  'g7-like-terms-trap'(h) { h.set(h.role('card'), 'text', '3x - (x - 2)'); },
  'g7-equation-word-core'(h) {
    const q = h.add('eqdesk', { rel: 0 }); h.link(h.role('lhs'), q, 'L', 'p'); h.link(h.role('rhs'), q, 'R', 'p');
  },
  'g7-equation-sign-trap'(h) {
    const q = h.add('eqdesk', { rel: 0 }); h.link(h.role('lhs'), q, 'L', 'p'); h.link(h.role('rhs'), q, 'R', 'p');
  },
  'g7-segment-length-core'(h) { const o = h.add('op', { op: 1 }); h.link(h.role('B'), o, 'a'); h.link(h.role('A'), o, 'b'); },
  'g7-segment-sum-trap'(h) { const o = h.add('op', { op: 0 }); h.link(h.role('AC'), o, 'a'); h.link(h.role('CB'), o, 'b'); },
  'g7-adjacent-angle-core'(h) { const o = h.add('op', { op: 1 }); h.link(h.role('straight'), o, 'a'); h.link(h.role('a1'), o, 'b'); },
  'g7-vertical-angle-trap'(h) { const c = h.add('compare', { op: 0 }); h.link(h.role('a1'), c, 'a'); h.link(h.role('a3'), c, 'b'); },
  'g7-parallel-sameside-core'(h) { const o = h.add('op', { op: 1 }); h.link(h.role('straight'), o, 'a'); h.link(h.role('a'), o, 'b'); },
  'g7-translate-down-trap'(h) { const o = h.add('op', { op: 1 }); h.link(h.role('y'), o, 'a'); h.link(h.role('down'), o, 'b'); },
  'g7-quadrant-core'(h) {
    const c1 = h.add('compare', { op: 1 }); h.link(h.role('x'), c1, 'a'); h.link(h.role('zero'), c1, 'b');
    const c2 = h.add('compare', { op: 2 }); h.link(h.role('y'), c2, 'a'); h.link(h.role('zero'), c2, 'b');
  },
  'g7-symmetry-x-axis-trap'(h) { const o = h.add('op', { op: 1 }); h.link(h.role('zero'), o, 'a'); h.link(h.role('y'), o, 'b'); },
  'g7-survey-mean-core'(h) { h.add('data', { list: '150, 152, 154, 156, 158' }); },
  'g7-survey-median-trap'(h) { h.add('data', { list: '1, 2, 2, 3, 100' }); },
};
