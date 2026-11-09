/* 六年级题目的参考解（content-g6.js）：用 h 一步步搭，必须能让该题通关（满足 goal）。
 * h.add(type, props) → id；h.link(from, to, toPort, fromPort)；h.set(id,k,v)；h.role(r)；h.run(n) 走 n 拍。 */
'use strict';
module.exports = {
  'g6-frac-mul-core'(h) { const o = h.add('op', { op: 2 }); h.link(h.role('a'), o, 'a'); h.link(h.role('b'), o, 'b'); },
  'g6-frac-mul-trap'(h) { const o = h.add('op', { op: 2 }); h.link(h.role('a'), o, 'a'); h.link(h.role('b'), o, 'b'); },
  'g6-frac-div-core'(h) { const o = h.add('op', { op: 3 }); h.link(h.role('a'), o, 'a'); h.link(h.role('b'), o, 'b'); },
  'g6-frac-div-trap'(h) { const o = h.add('op', { op: 3 }); h.link(h.role('a'), o, 'a'); h.link(h.role('b'), o, 'b'); },
  'g6-circle-diameter-trap'(h) { h.set(h.role('c'), 'r', 5); },
  'g6-percent-part-core'(h) { const p = h.add('percent', { mode: 0 }); h.link(h.role('a'), p, 'a'); h.link(h.role('b'), p, 'b'); },
  'g6-percent-base-trap'(h) {
    const o = h.add('op', { op: 1 }); h.link(h.role('two'), o, 'a'); h.link(h.role('one'), o, 'b');
    const p = h.add('percent', { mode: 0 }); h.link(o, p, 'a'); h.link(h.role('one'), p, 'b');
  },
  'g6-sector-angle-core'(h) { const p = h.add('percent', { mode: 1 }); h.link(h.role('pct'), p, 'a'); h.link(h.role('full'), p, 'b'); },
  'g6-sector-whole-trap'(h) { const p = h.add('percent', { mode: 1 }); h.link(h.role('pct'), p, 'a'); h.link(h.role('full'), p, 'b'); },
  'g6-odd-sum-core'(h) { h.add('conjecture', { law: 0, expr: 'n*n', upto: 10 }); },
  'g6-odd-sum-trap'(h) { h.add('conjecture', { law: 0, expr: 'n*n', upto: 10 }); },
  'g6-negative-order-core'(h) { const c = h.add('compare', { op: 1 }); h.link(h.role('a'), c, 'a'); h.link(h.role('b'), c, 'b'); },
  'g6-negative-order-trap'(h) { const c = h.add('compare', { op: 1 }); h.link(h.role('a'), c, 'a'); h.link(h.role('b'), c, 'b'); },
  'g6-neg-times-core'(h) { const o = h.add('op', { op: 2 }); h.link(h.role('a'), o, 'a'); h.link(h.role('b'), o, 'b'); },
  'g6-neg-times-trap'(h) { const o = h.add('op', { op: 2 }); h.link(h.role('a'), o, 'a'); h.link(h.role('b'), o, 'b'); },
  'g6-percent-rebound-trap'(h) {
    const p1 = h.add('percent', { mode: 2 }); h.link(h.role('pct'), p1, 'a'); h.link(h.role('price'), p1, 'b');
    const p2 = h.add('percent', { mode: 3 }); h.link(h.role('pct'), p2, 'a'); h.link(p1, p2, 'b');
  },
  'g6-cylinder-volume-core'(h) { const o = h.add('op', { op: 2 }); h.link(h.role('base'), o, 'a', 'area'); h.link(h.role('height'), o, 'b'); },
  'g6-cone-volume-trap'(h) {
    const o1 = h.add('op', { op: 3 }); h.link(h.role('base'), o1, 'a', 'area'); h.link(h.role('three'), o1, 'b');
    const o2 = h.add('op', { op: 2 }); h.link(o1, o2, 'a'); h.link(h.role('height'), o2, 'b');
  },
  'g6-ratio-cross-core'(h) {
    const m = h.add('op', { op: 2 }); h.link(h.role('a'), m, 'a'); h.link(h.role('d'), m, 'b');
    const dv = h.add('op', { op: 3 }); h.link(m, dv, 'a'); h.link(h.role('b'), dv, 'b');
  },
  'g6-ratio-difference-trap'(h) {
    const m = h.add('op', { op: 2 }); h.link(h.role('a'), m, 'a'); h.link(h.role('d'), m, 'b');
    const dv = h.add('op', { op: 3 }); h.link(m, dv, 'a'); h.link(h.role('b'), dv, 'b');
  },
  'g6-pigeon-core'(h) {
    const dm = h.add('divmod'); h.link(h.role('pigeons'), dm, 'a'); h.link(h.role('cages'), dm, 'b');
    const o = h.add('op', { op: 0 }); h.link(dm, o, 'a', 'q'); h.link(h.role('one'), o, 'b');
  },
  'g6-pigeon-exact-trap'(h) { const dm = h.add('divmod'); h.link(h.role('pigeons'), dm, 'a'); h.link(h.role('cages'), dm, 'b'); },
};
