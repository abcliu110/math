/* 四年级题目的参考解（content-g4.js）：用 h 一步步搭，必须能让该题通关（满足 goal）。
 * h.add(type, props) → id；h.link(from, to, toPort, fromPort)；h.set(id,k,v)；h.role(r)；h.run(n) 走 n 拍。 */
'use strict';
module.exports = {
  'g4-area-km2-core'(h) { const o = h.add('op', { op: 2 }); h.link(h.role('km2'), o, 'a'); h.link(h.role('rate'), o, 'b'); },
  'g4-area-ha-trap'(h) { const o = h.add('op', { op: 3 }); h.link(h.role('ha'), o, 'a'); h.link(h.role('rate'), o, 'b'); },
  'g4-mul-3x2-core'(h) { const o = h.add('op', { op: 2 }); h.link(h.role('a'), o, 'a'); h.link(h.role('b'), o, 'b'); },
  'g4-mul-zero-trap'(h) { const o = h.add('op', { op: 2 }); h.link(h.role('a'), o, 'a'); h.link(h.role('b'), o, 'b'); },
  'g4-angle-straight-core'(h) {
    const o = h.add('op', { op: 0 }); h.link(h.role('a'), o, 'a'); h.link(h.role('b'), o, 'b');
    const c = h.add('compare', { op: 0 }); h.link(o, c, 'a'); h.link(h.role('straight'), c, 'b');
  },
  'g4-parallelogram-core'(h) { h.set(h.role('shape'), 'h', 4); },
  'g4-parallelogram-slant-trap'(h) { h.set(h.role('shape'), 'h', 4); },
  'g4-div-2digit-core'(h) { const d = h.add('divmod'); h.link(h.role('a'), d, 'a'); h.link(h.role('b'), d, 'b'); },
  'g4-div-trial-trap'(h) { const d = h.add('divmod'); h.link(h.role('a'), d, 'a'); h.link(h.role('b'), d, 'b'); },
  'g4-bar-range-core'(h) { const st = h.add('stats', { want: 4 }); h.link(h.role('classes'), st, 'd', 'dist'); },
  'g4-bar-scale-trap'(h) { const o = h.add('op', { op: 2 }); h.link(h.role('bars'), o, 'a'); h.link(h.role('scale'), o, 'b'); },
  'g4-optimize-boil-core'(h) { const o = h.add('op', { op: 0 }); h.link(h.role('boil'), o, 'a'); h.link(h.role('brew'), o, 'b'); },
  'g4-optimize-sum-trap'(h) { const o = h.add('op', { op: 0 }); h.link(h.role('boil'), o, 'a'); h.link(h.role('brew'), o, 'b'); },
  'g4-order-mul-core'(h) {
    const o1 = h.add('op', { op: 2 }); h.link(h.role('b'), o1, 'a'); h.link(h.role('c'), o1, 'b');
    const o2 = h.add('op', { op: 0 }); h.link(h.role('a'), o2, 'a'); h.link(o1, o2, 'b');
  },
  'g4-order-left-trap'(h) {
    const o1 = h.add('op', { op: 3 }); h.link(h.role('b'), o1, 'a'); h.link(h.role('c'), o1, 'b');
    const o2 = h.add('op', { op: 1 }); h.link(h.role('a'), o2, 'a'); h.link(o1, o2, 'b');
  },
  'g4-assoc-mul-core'(h) {
    const o1 = h.add('op', { op: 2 }); h.link(h.role('a'), o1, 'a'); h.link(h.role('b'), o1, 'b');
    const o2 = h.add('op', { op: 2 }); h.link(o1, o2, 'a'); h.link(h.role('c'), o2, 'b');
  },
  'g4-assoc-sub-trap'(h) {
    const o1 = h.add('op', { op: 1 }); h.link(h.role('a'), o1, 'a'); h.link(h.role('b'), o1, 'b');
    const o2 = h.add('op', { op: 1 }); h.link(o1, o2, 'a'); h.link(h.role('c'), o2, 'b');
  },
  'g4-decimal-equal-core'(h) { const c = h.add('compare', { op: 0 }); h.link(h.role('a'), c, 'a'); h.link(h.role('b'), c, 'b'); },
  'g4-decimal-shift-trap'(h) { const o = h.add('op', { op: 2 }); h.link(h.role('x'), o, 'a'); h.link(h.role('ten'), o, 'b'); },
  'g4-decimal-add-core'(h) { const o = h.add('op', { op: 0 }); h.link(h.role('a'), o, 'a'); h.link(h.role('b'), o, 'b'); },
  'g4-decimal-align-trap'(h) { const o = h.add('op', { op: 1 }); h.link(h.role('a'), o, 'a'); h.link(h.role('b'), o, 'b'); },
  'g4-translate-congruent-core'(h) {
    const xf = h.add('xform', { mode: 0, dx: 3, dy: 1 }); h.link(h.role('tri'), xf, 'f');
    const fr = h.add('figrel', {}); h.link(h.role('tri'), fr, 'a'); h.link(xf, fr, 'b');
  },
  'g4-chicken-rabbit-core'(h) {
    const o1 = h.add('op', { op: 2 }); h.link(h.role('heads'), o1, 'a'); h.link(h.role('two'), o1, 'b');
    const o2 = h.add('op', { op: 1 }); h.link(h.role('legs'), o2, 'a'); h.link(o1, o2, 'b');
    const o3 = h.add('op', { op: 3 }); h.link(o2, o3, 'a'); h.link(h.role('two'), o3, 'b');
  },
  'g4-chicken-rabbit-trap'(h) {
    const o1 = h.add('op', { op: 2 }); h.link(h.role('heads'), o1, 'a'); h.link(h.role('two'), o1, 'b');
    const o2 = h.add('op', { op: 1 }); h.link(h.role('legs'), o2, 'a'); h.link(o1, o2, 'b');
    const o3 = h.add('op', { op: 3 }); h.link(o2, o3, 'a'); h.link(h.role('two'), o3, 'b');
    const o4 = h.add('op', { op: 1 }); h.link(h.role('heads'), o4, 'a'); h.link(o3, o4, 'b');
  },
};
