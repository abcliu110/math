/* 八年级题目的参考解（problems/content-g8.js）：用 h 一步步搭，必须能让该题通关（满足 goal）。
 * h.add(type, props) → id；h.link(from, to, toPort, fromPort)；h.set(id,k,v)；h.role(r)；h.run(n) 走 n 拍。 */
'use strict';
module.exports = {
  'g8-polygon-sum-core'(h) { h.add('polygon', { n: 6 }); },
  'g8-congruent-sss-core'(h) { const g = h.add('figrel'); h.link(h.role('p'), g, 'a', 'f'); h.link(h.role('q'), g, 'b', 'f'); },
  'g8-similar-not-congruent-trap'(h) { const g = h.add('figrel'); h.link(h.role('p'), g, 'a', 'f'); h.link(h.role('q'), g, 'b', 'f'); },
  'g8-isosceles-perimeter-core'(h) { h.add('tri', { a: 5, b: 5, c: 6 }); },
  'g8-isosceles-base-trap'(h) { h.add('tri', { a: 5, b: 5, c: 4 }); },
  'g8-power-product-core'(h) {
    const b = h.role('base');
    const p1 = h.add('power', { e: 3 }); h.link(b, p1, 'a');
    const p2 = h.add('power', { e: 4 }); h.link(b, p2, 'a');
    const o = h.add('op', { op: 2 }); h.link(p1, o, 'a'); h.link(p2, o, 'b');
  },
  'g8-power-chain-trap'(h) {
    const p1 = h.add('power', { e: 3 }); h.link(h.role('base'), p1, 'a');
    const p2 = h.add('power', { e: 2 }); h.link(p1, p2, 'a');
  },
  'g8-fraction-eval-core'(h) { const f = h.add('fracnum', { num: 'x^2 - 1', den: 'x - 1' }); const r = h.add('ratread', { x: 3 }); h.link(f, r, 'f'); },
  'g8-fraction-cancel-trap'(h) { const f = h.add('fracnum', { num: 'x^2 - 1', den: 'x - 1' }); const r = h.add('ratread', { x: 4 }); h.link(f, r, 'f'); },
  'g8-fraction-equation-core'(h) { h.add('variable', { left: '4/(x+12)', right: 'x+9' }); },
  'g8-sqrt-product-core'(h) {
    const o = h.add('op', { op: 2 }); h.link(h.role('a'), o, 'a'); h.link(h.role('b'), o, 'b');
    const s = h.add('sqrt'); h.link(o, s, 'v');
  },
  'g8-sqrt-sum-trap'(h) {
    const o = h.add('op'); h.link(h.role('a'), o, 'a'); h.link(h.role('b'), o, 'b');
    const s = h.add('sqrt'); h.link(o, s, 'v');
  },
  'g8-pythagoras-core'(h) { h.add('tri', { a: 5, b: 12, c: 13 }); },
  'g8-pythagoras-trap'(h) { h.add('tri', { a: 6, b: 8, c: 10 }); },
  'g8-square-area-core'(h) { h.add('rect', { w: 5, h: 5 }); },
  'g8-rect-height-trap'(h) { h.add('rect', { w: 5, h: 3 }); },
  'g8-proportional-core'(h) { const l = h.add('line', { k: 2, b: 0 }); const a = h.add('at', { x: 3 }); h.link(l, a, 'f', 'f'); },
  'g8-proportional-intercept-trap'(h) { const l = h.add('line', { k: 2, b: 3 }); const a = h.add('at', { x: 3 }); h.link(l, a, 'f', 'f'); },
  'g8-median-core'(h) { const st = h.add('stats', { want: 3 }); h.link(h.role('d'), st, 'd', 'dist'); },
  'g8-median-mode-trap'(h) { const st = h.add('stats', { want: 3 }); h.link(h.role('d'), st, 'd', 'dist'); },
};
