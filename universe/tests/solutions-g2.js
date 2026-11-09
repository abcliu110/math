/* 二年级题目的参考解（content-g2.js）：用 h 一步步搭，必须能让该题通关（满足 goal）。
 * h.add(type, props) → id；h.link(from, to, toPort, fromPort)；h.set(id,k,v)；h.role(r)；h.run(n) 走 n 拍。 */
'use strict';
module.exports = {
  'g2-length-cut-core'(h) {
    const o1 = h.add('op', { op: 2 }); h.link(h.role('rope'), o1, 'a'); h.link(h.role('hundred'), o1, 'b');
    const o2 = h.add('op', { op: 1 }); h.link(o1, o2, 'a'); h.link(h.role('cut'), o2, 'b');
  },
  'g2-length-direct-trap'(h) {
    const o1 = h.add('op', { op: 2 }); h.link(h.role('rope'), o1, 'a'); h.link(h.role('hundred'), o1, 'b');
    const o2 = h.add('op', { op: 1 }); h.link(o1, o2, 'a'); h.link(h.role('cut'), o2, 'b');
  },
  'g2-two-digit-add-core'(h) { const o = h.add('op'); h.link(h.role('a'), o, 'a'); h.link(h.role('b'), o, 'b'); },
  'g2-estimate-trap'(h) {
    const r1 = h.add('round', { place: 1, mode: 0 }); h.link(h.role('a'), r1, 'v');
    const r2 = h.add('round', { place: 1, mode: 0 }); h.link(h.role('b'), r2, 'v');
    const o = h.add('op'); h.link(r1, o, 'a'); h.link(r2, o, 'b');
  },
  'g2-carry-add-core'(h) { const o = h.add('op'); h.link(h.role('a'), o, 'a'); h.link(h.role('b'), o, 'b'); },
  'g2-borrow-sub-trap'(h) { const o = h.add('op', { op: 1 }); h.link(h.role('a'), o, 'a'); h.link(h.role('b'), o, 'b'); },
  'g2-right-angle-core'(h) { h.set(h.role('tri'), 'B', 60); },
  'g2-times-trap'(h) { const o = h.add('op', { op: 2 }); h.link(h.role('each'), o, 'a'); h.link(h.role('boxes'), o, 'b'); },
  'g2-hour-minute-core'(h) {
    const o1 = h.add('op', { op: 2 }); h.link(h.role('hours'), o1, 'a'); h.link(h.role('per'), o1, 'b');
    const o2 = h.add('op'); h.link(o1, o2, 'a'); h.link(h.role('mins'), o2, 'b');
  },
  'g2-hour-100-trap'(h) { const o = h.add('op', { op: 2 }); h.link(h.role('hours'), o, 'a'); h.link(h.role('per'), o, 'b'); },
  'g2-divide-share-core'(h) { const o = h.add('op', { op: 3 }); h.link(h.role('apples'), o, 'a'); h.link(h.role('kids'), o, 'b'); },
  'g2-divide-order-trap'(h) { const o = h.add('op', { op: 3 }); h.link(h.role('rope'), o, 'a'); h.link(h.role('segs'), o, 'b'); },
  'g2-fold-symmetric-core'(h) { h.set(h.role('paper'), 'fold', 1); },
  'g2-fold-offset-trap'(h) { h.set(h.role('paper'), 'offset', 0); },
  'g2-mixed-core'(h) {
    const m = h.add('op', { op: 2 }); h.link(h.role('three'), m, 'a'); h.link(h.role('four'), m, 'b');
    const s = h.add('op'); h.link(h.role('two'), s, 'a'); h.link(m, s, 'b');
  },
  'g2-mixed-brackets-trap'(h) {
    const p = h.add('op'); h.link(h.role('two'), p, 'a'); h.link(h.role('three'), p, 'b');
    const m = h.add('op', { op: 2 }); h.link(p, m, 'a'); h.link(h.role('four'), m, 'b');
  },
  'g2-kg-to-g-core'(h) { const o = h.add('op', { op: 2 }); h.link(h.role('kg'), o, 'a'); h.link(h.role('k'), o, 'b'); },
  'g2-kg-trap'(h) { const o = h.add('op', { op: 2 }); h.link(h.role('kg'), o, 'a'); h.link(h.role('k'), o, 'b'); },
  'g2-data-mode-core'(h) { const st = h.add('stats', { want: 1 }); h.link(h.role('data'), st, 'd', 'dist'); },
  'g2-data-count-trap'(h) { const st = h.add('stats', { want: 2 }); h.link(h.role('data'), st, 'd', 'dist'); },
  'g2-combo-multiply-core'(h) { const o = h.add('op', { op: 2 }); h.link(h.role('tops'), o, 'a'); h.link(h.role('pants'), o, 'b'); },
  'g2-combo-add-trap'(h) { const o = h.add('op', { op: 2 }); h.link(h.role('hats'), o, 'a'); h.link(h.role('scarves'), o, 'b'); },
};
