/* 九年级题目的参考解（content-g9.js）：用 h 一步步搭，必须能让该题通关（满足 goal）。
 * h.add(type, props) → id；h.link(from, to, toPort, fromPort)；h.set(id,k,v)；h.role(r)；h.run(n) 走 n 拍。 */
'use strict';
module.exports = {
  'g9-quad-solve-core'(h) {
    const e = h.add('eqcard', { text: 'x^2 - 5x + 6 = 0' }), q = h.add('solve', {});
    h.link(e, q, 'eq', 'eq');
  },
  'g9-discriminant-core'(h) { h.set(h.role('q'), 'c', 4); },
  'g9-discriminant-trap'(h) { h.set(h.role('q'), 'c', -4); h.set(h.role('q'), 'c', 4); },
  'g9-vertex-down-core'(h) { const q = h.role('q'); h.set(q, 'a', -1); h.set(q, 'b', 2); h.set(q, 'c', 3); },
  'g9-vertex-down-trap'(h) { const q = h.role('q'); h.set(q, 'a', 1); h.set(q, 'b', 2); h.set(q, 'a', -1); h.set(q, 'c', 3); },
  'g9-min-value-core'(h) { const q = h.role('q'); h.set(q, 'b', -6); h.set(q, 'c', 10); },
  'g9-sector-core'(h) {
    const c = h.role('c'), n90 = h.add('num', { n: 90 }), n360 = h.add('num', { n: 360 });
    const m = h.add('op', { op: 2 }), d = h.add('op', { op: 3 });
    h.link(c, m, 'a', 'area'); h.link(n90, m, 'b'); h.link(m, d, 'a', 'r'); h.link(n360, d, 'b');
  },
  'g9-sector-trap'(h) {
    const c = h.role('c'), n90 = h.add('num', { n: 90 }), n360 = h.add('num', { n: 360 });
    const m = h.add('op', { op: 2 }), d = h.add('op', { op: 3 });
    h.link(c, m, 'a', 'area'); h.link(n90, m, 'b'); h.link(m, d, 'a', 'r'); h.link(n360, d, 'b');
  },
  'g9-enum-prob-core'(h) {
    const e = h.role('e'); h.set(e, 'target', 7);
    const d = h.add('op', { op: 3 });
    h.link(e, d, 'a', 'count'); h.link(e, d, 'b', 'total');
  },
  'g9-enum-prob-trap'(h) {
    const e = h.role('e'); h.set(e, 'target', 7);
    const d = h.add('op', { op: 3 });
    h.link(e, d, 'a', 'count'); h.link(e, d, 'b', 'total');
  },
  'g9-similar-scale-core'(h) {
    const a = h.role('a'), x = h.add('xform', { mode: 5 }), f = h.add('figrel');
    h.link(a, x, 'f', 'f'); h.link(a, f, 'a', 'f'); h.link(x, f, 'b', 'f');
  },
  'g9-similar-scale-trap'(h) {
    const a = h.role('a'), x = h.add('xform', { mode: 5 }), f = h.add('figrel');
    h.link(a, x, 'f', 'f'); h.link(a, f, 'a', 'f'); h.link(x, f, 'b', 'f');
  },
  'g9-similar-tri-core'(h) {
    const a = h.role('a'), b = h.role('b'), f = h.add('figrel');
    h.link(a, f, 'a', 'f'); h.link(b, f, 'b', 'f'); h.set(b, 'cy', 6);
  },
};
