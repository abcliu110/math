/* 五年级题目的参考解（content-g5.js）：用 h 一步步搭，必须能让该题通关（满足 goal）。
 * h.add(type, props) → id；h.link(from, to, toPort, fromPort)；h.set(id,k,v)；h.role(r)；h.run(n) 走 n 拍。 */
'use strict';
module.exports = {
  'g5-decimal-mul-core'(h) { const o = h.add('op', { op: 2 }); h.link(h.role('a'), o, 'a'); h.link(h.role('b'), o, 'b'); },
  'g5-decimal-mul-trap'(h) { const o = h.add('op', { op: 2 }); h.link(h.role('a'), o, 'a'); h.link(h.role('b'), o, 'b'); },
  'g5-decimal-div-core'(h) { const o = h.add('op', { op: 3 }); h.link(h.role('a'), o, 'a'); h.link(h.role('b'), o, 'b'); },
  'g5-decimal-div-trap'(h) { const o = h.add('op', { op: 3 }); h.link(h.role('a'), o, 'a'); h.link(h.role('b'), o, 'b'); },
  'g5-chance-core'(h) { h.set(h.role('e'), 'target', 7); },
  'g5-chance-trap'(h) { h.set(h.role('e'), 'target', 13); },
  'g5-polygon-tri-core'(h) {
    const m = h.add('op', { op: 2 }); h.link(h.role('base'), m, 'a'); h.link(h.role('h'), m, 'b');
    const d = h.add('op', { op: 3 }); h.link(m, d, 'a'); h.link(h.role('two'), d, 'b');
  },
  'g5-polygon-slant-trap'(h) { const m = h.add('op', { op: 2 }); h.link(h.role('base'), m, 'a'); h.link(h.role('h'), m, 'b'); },
  'g5-tree-core'(h) {
    const d = h.add('op', { op: 3 }); h.link(h.role('len'), d, 'a'); h.link(h.role('gap'), d, 'b');
    const p = h.add('op', { op: 0 }); h.link(d, p, 'a'); h.link(h.role('one'), p, 'b');
  },
  'g5-tree-ring-trap'(h) { const d = h.add('op', { op: 3 }); h.link(h.role('len'), d, 'a'); h.link(h.role('gap'), d, 'b'); },
  'g5-cuboid-vol-core'(h) { const c = h.role('box'); h.set(c, 'l', 5); h.set(c, 'w', 4); h.set(c, 'h', 3); },
  'g5-cuboid-same-vol-trap'(h) { const c = h.role('box'); h.set(c, 'l', 2); h.set(c, 'w', 3); h.set(c, 'h', 4); },
  'g5-fraction-add-core'(h) { const o = h.add('op', { op: 0 }); h.link(h.role('a'), o, 'a'); h.link(h.role('b'), o, 'b'); },
  'g5-fraction-add-trap'(h) { const o = h.add('op', { op: 0 }); h.link(h.role('a'), o, 'a'); h.link(h.role('b'), o, 'b'); },
  'g5-fraction-equiv-core'(h) { const c = h.add('compare', { op: 0 }); h.link(h.role('a'), c, 'a'); h.link(h.role('b'), c, 'b'); },
  'g5-balance-core'(h) { const b = h.add('balance'); h.link(h.role('L'), b, 'L'); h.link(h.role('R'), b, 'R'); },
};
