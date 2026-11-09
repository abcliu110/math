/* 三年级题目的参考解（content-g3.js）：用 h 一步步搭，必须能让该题通关（满足 goal）。
 * h.add(type, props) → id；h.link(from, to, toPort, fromPort)；h.set(id,k,v)；h.role(r)；h.run(n) 走 n 拍。
 * 运算器的 op：0 +、1 −、2 ×、3 ÷。 */
'use strict';
module.exports = {
  'g3-time-hour-minute-core'(h) { const o = h.add('op', { op: 2 }); h.link(h.role('h'), o, 'a'); h.link(h.role('sixty'), o, 'b'); },
  'g3-time-add-trap'(h) {
    const o1 = h.add('op', { op: 2 }); h.link(h.role('h'), o1, 'a'); h.link(h.role('sixty'), o1, 'b');
    const o2 = h.add('op'); h.link(o1, o2, 'a'); h.link(h.role('m'), o2, 'b');
  },
  'g3-add-carry-core'(h) { const o = h.add('op'); h.link(h.role('a'), o, 'a'); h.link(h.role('b'), o, 'b'); },
  'g3-subtract-zero-trap'(h) { const o = h.add('op', { op: 1 }); h.link(h.role('a'), o, 'a'); h.link(h.role('b'), o, 'b'); },
  'g3-measure-m-to-cm-core'(h) { const o = h.add('op', { op: 2 }); h.link(h.role('m'), o, 'a'); h.link(h.role('hundred'), o, 'b'); },
  'g3-measure-m-cm-trap'(h) {
    const o1 = h.add('op', { op: 2 }); h.link(h.role('m'), o1, 'a'); h.link(h.role('hundred'), o1, 'b');
    const o2 = h.add('op'); h.link(o1, o2, 'a'); h.link(h.role('cm'), o2, 'b');
  },
  'g3-times-core'(h) { const o = h.add('op', { op: 2 }); h.link(h.role('pencil'), o, 'a'); h.link(h.role('times'), o, 'b'); },
  'g3-times-trap'(h) { const o = h.add('op', { op: 3 }); h.link(h.role('big'), o, 'a'); h.link(h.role('small'), o, 'b'); },
  'g3-multi-digit-core'(h) { const o = h.add('op', { op: 2 }); h.link(h.role('a'), o, 'a'); h.link(h.role('b'), o, 'b'); },
  'g3-zero-place-trap'(h) { const o = h.add('op', { op: 2 }); h.link(h.role('a'), o, 'a'); h.link(h.role('b'), o, 'b'); },
  'g3-rect-square-core'(h) { h.set(h.role('r'), 'h', 5); },
  'g3-rect-perimeter-trap'(h) { h.set(h.role('r'), 'h', 4); },
  'g3-fraction-add-core'(h) { const o = h.add('op'); h.link(h.role('a'), o, 'a'); h.link(h.role('b'), o, 'b'); },
  'g3-fraction-denom-trap'(h) { const o = h.add('op'); h.link(h.role('a'), o, 'a'); h.link(h.role('b'), o, 'b'); },
  'g3-set-core'(h) {
    const o1 = h.add('op', { op: 1 }); h.link(h.role('chi'), o1, 'a'); h.link(h.role('both'), o1, 'b');
    const o2 = h.add('op'); h.link(h.role('math'), o2, 'a'); h.link(o1, o2, 'b');
  },
  'g3-set-trap'(h) {
    const o1 = h.add('op', { op: 1 }); h.link(h.role('rope'), o1, 'a'); h.link(h.role('both'), o1, 'b');
    const o2 = h.add('op'); h.link(h.role('run'), o2, 'a'); h.link(o1, o2, 'b');
  },
  'g3-direction-east-west-core'(h) {
    const o = h.add('op', { op: 1 }); h.link(h.role('east'), o, 'a'); h.link(h.role('west'), o, 'b');
    h.link(o, h.role('line'), 'v');
  },
  'g3-direction-back-trap'(h) {
    const o1 = h.add('op', { op: 1 }); h.link(h.role('origin'), o1, 'a'); h.link(h.role('west'), o1, 'b');
    const o2 = h.add('op'); h.link(o1, o2, 'a'); h.link(h.role('east'), o2, 'b');
    h.link(o2, h.role('line'), 'v');
  },
  'g3-divide-core'(h) { const o = h.add('op', { op: 3 }); h.link(h.role('apples'), o, 'a'); h.link(h.role('kids'), o, 'b'); },
  'g3-divide-zero-trap'(h) { const o = h.add('op', { op: 3 }); h.link(h.role('a'), o, 'a'); h.link(h.role('b'), o, 'b'); },
  'g3-area-parts-core'(h) {
    const p1 = h.add('op', { op: 2 }); h.link(h.role('t20'), p1, 'a'); h.link(h.role('o10'), p1, 'b');
    const p2 = h.add('op', { op: 2 }); h.link(h.role('t20'), p2, 'a'); h.link(h.role('o5'), p2, 'b');
    const p3 = h.add('op', { op: 2 }); h.link(h.role('t3'), p3, 'a'); h.link(h.role('o10'), p3, 'b');
    const p4 = h.add('op', { op: 2 }); h.link(h.role('t3'), p4, 'a'); h.link(h.role('o5'), p4, 'b');
    const s1 = h.add('op'); h.link(p1, s1, 'a'); h.link(p2, s1, 'b');
    const s2 = h.add('op'); h.link(s1, s2, 'a'); h.link(p3, s2, 'b');
    const s3 = h.add('op'); h.link(s2, s3, 'a'); h.link(p4, s3, 'b');
  },
  'g3-two-digit-trap'(h) { const o = h.add('op', { op: 2 }); h.link(h.role('x'), o, 'a'); h.link(h.role('y'), o, 'b'); },
  'g3-year-days-core'(h) {
    const p1 = h.add('op', { op: 2 }); h.link(h.role('nbig'), p1, 'a'); h.link(h.role('big'), p1, 'b');
    const p2 = h.add('op', { op: 2 }); h.link(h.role('nsmall'), p2, 'a'); h.link(h.role('small'), p2, 'b');
    const s1 = h.add('op'); h.link(p1, s1, 'a'); h.link(p2, s1, 'b');
    const s2 = h.add('op'); h.link(s1, s2, 'a'); h.link(h.role('feb'), s2, 'b');
  },
  'g3-year-feb-trap'(h) {
    const p1 = h.add('op', { op: 2 }); h.link(h.role('nbig'), p1, 'a'); h.link(h.role('big'), p1, 'b');
    const p2 = h.add('op', { op: 2 }); h.link(h.role('nsmall'), p2, 'a'); h.link(h.role('small'), p2, 'b');
    const s1 = h.add('op'); h.link(p1, s1, 'a'); h.link(p2, s1, 'b');
    const s2 = h.add('op'); h.link(s1, s2, 'a'); h.link(h.role('feb'), s2, 'b');
  },
  'g3-decimal-jiao-core'(h) { const o = h.add('op', { op: 0, form: 2 }); h.link(h.role('jiao3'), o, 'a'); h.link(h.role('jiao4'), o, 'b'); },
  'g3-decimal-trap'(h) { const o = h.add('op', { op: 0, form: 2 }); h.link(h.role('yuan'), o, 'a'); h.link(h.role('jiao'), o, 'b'); },
  'g3-combo-core'(h) {
    const o1 = h.add('op', { op: 2 }); h.link(h.role('shirt'), o1, 'a'); h.link(h.role('pants'), o1, 'b');
    const o2 = h.add('op', { op: 2 }); h.link(o1, o2, 'a'); h.link(h.role('shoes'), o2, 'b');
  },
  'g3-combo-add-trap'(h) { const o = h.add('op', { op: 2 }); h.link(h.role('shirt'), o, 'a'); h.link(h.role('pants'), o, 'b'); },
};
