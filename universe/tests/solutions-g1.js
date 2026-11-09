/* 一年级题目的参考解（content-g1.js）：用 h 一步步搭，必须能让该题通关（满足 goal）。
 * h.add(type, props) → id；h.link(from, to, toPort, fromPort)；h.set(id,k,v)；h.role(r)；h.run(n) 走 n 拍。 */
'use strict';
module.exports = {
  'g1-position-compare-core'(h) { const c = h.add('compare', { op: 2 }); h.link(h.role('a'), c, 'a'); h.link(h.role('b'), c, 'b'); },
  'g1-position-numline-trap'(h) { const nl = h.add('numline', { lo: 0, hi: 5, tick: 1 }); h.link(h.role('p3'), nl, 'v'); h.link(h.role('p7'), nl, 'v'); h.set(nl, 'hi', 10); },
  'g1-split-merge-core'(h) { const o = h.add('op'); h.link(h.role('x'), o, 'a'); h.link(h.role('y'), o, 'b'); },
  'g1-split-minus-trap'(h) { const o = h.add('op', { op: 1 }); h.link(h.role('all'), o, 'a'); h.link(h.role('part'), o, 'b'); },
  'g1-zero-subtract-core'(h) { const o = h.add('op', { op: 1 }); h.link(h.role('a'), o, 'a'); h.link(h.role('b'), o, 'b'); },
  'g1-zero-trap'(h) { const o = h.add('op', { op: 1 }); h.link(h.role('c'), o, 'a'); h.link(h.role('z'), o, 'b'); },
  'g1-solid-edges-core'(h) { const c = h.role('box'); h.set(c, 'l', 3); h.set(c, 'w', 2); h.set(c, 'h', 1); },
  'g1-solid-volume-trap'(h) { const c = h.role('box'); h.set(c, 'l', 2); h.set(c, 'w', 3); },
  'g1-chain-add-core'(h) {
    const o1 = h.add('op'); h.link(h.role('a'), o1, 'a'); h.link(h.role('b'), o1, 'b');
    const o2 = h.add('op'); h.link(o1, o2, 'a'); h.link(h.role('c'), o2, 'b');
  },
  'g1-chain-sub-trap'(h) {
    const o1 = h.add('op', { op: 1 }); h.link(h.role('a'), o1, 'a'); h.link(h.role('b'), o1, 'b');
    const o2 = h.add('op', { op: 1 }); h.link(o1, o2, 'a'); h.link(h.role('c'), o2, 'b');
  },
  'g1-ten-plus-core'(h) { const o = h.add('op'); h.link(h.role('ten'), o, 'a'); h.link(h.role('six'), o, 'b'); const d = h.add('digits'); h.link(o, d, 'v'); },
  'g1-teen-tens-trap'(h) { const d = h.add('divmod'); h.link(h.role('a'), d, 'a'); h.link(h.role('b'), d, 'b'); },
  'g1-clock-hour-core'(h) { h.run(3); },
  'g1-clock-minute-trap'(h) { h.run(12); },
  'g1-carry-add-core'(h) { const o = h.add('op'); h.link(h.role('a'), o, 'a'); h.link(h.role('b'), o, 'b'); },
  'g1-make-ten-trap'(h) {
    const o1 = h.add('op'); h.link(h.role('a'), o1, 'a'); h.link(h.role('one'), o1, 'b');
    const o2 = h.add('op'); h.link(o1, o2, 'a'); h.link(h.role('five'), o2, 'b');
  },
  'g1-rect-perimeter-core'(h) { const r = h.role('r'); h.set(r, 'w', 4); h.set(r, 'h', 2); },
  'g1-triangle-sides-trap'(h) { h.set(h.role('t'), 'c', 5); },
  'g1-minus-core'(h) { const o = h.add('op', { op: 1 }); h.link(h.role('a'), o, 'a'); h.link(h.role('b'), o, 'b'); },
  'g1-minus-break-trap'(h) {
    const o1 = h.add('op', { op: 1 }); h.link(h.role('a'), o1, 'a'); h.link(h.role('b'), o1, 'b');
    const o2 = h.add('op', { op: 1 }); h.link(o1, o2, 'a'); h.link(h.role('c'), o2, 'b');
  },
  'g1-classify-count-core'(h) {
    const cs = [];
    for (let i = 0; i < 3; i++) cs.push(h.add('counter', { color: 0 }));
    for (let i = 0; i < 2; i++) cs.push(h.add('counter', { color: 1 }));
    let prev = cs[0];
    for (let i = 1; i < cs.length; i++) { const o = h.add('op'); h.link(prev, o, 'a'); h.link(cs[i], o, 'b'); prev = o; }
    const c = h.add('compare'); h.link(prev, c, 'a'); h.link(h.role('total'), c, 'b');
  },
  'g1-classify-check-trap'(h) {
    const cs = [];
    for (let i = 0; i < 4; i++) cs.push(h.add('counter', { color: 0 }));
    for (let i = 0; i < 2; i++) cs.push(h.add('counter', { color: 1 }));
    let prev = cs[0];
    for (let i = 1; i < cs.length; i++) { const o = h.add('op'); h.link(prev, o, 'a'); h.link(cs[i], o, 'b'); prev = o; }
    const c = h.add('compare'); h.link(prev, c, 'a'); h.link(h.role('total'), c, 'b');
  },
  'g1-money-add-core'(h) { const o = h.add('op'); h.link(h.role('pencil'), o, 'a'); h.link(h.role('eraser'), o, 'b'); },
  'g1-money-jiao-trap'(h) { h.set(h.role('jiao'), 'd', 10); const o = h.add('op'); h.link(h.role('yuan'), o, 'a'); h.link(h.role('jiao'), o, 'b'); },
  'g1-add-two-digit-core'(h) { const o = h.add('op'); h.link(h.role('a'), o, 'a'); h.link(h.role('b'), o, 'b'); },
  'g1-sub-borrow-trap'(h) { const o = h.add('op', { op: 1 }); h.link(h.role('a'), o, 'a'); h.link(h.role('b'), o, 'b'); },
};
