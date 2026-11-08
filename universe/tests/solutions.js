/* 每道题的参考解：用 act 一步步搭，必须能让该题通关（满足 goal）。新增题目时在这里补一条。
 * h.add(type, props) → id；h.link(from, to, toPort, fromPort)；h.set(id,k,v)；h.role(r)；h.run(n) 走 n 拍。 */
'use strict';
module.exports = {
  'frac-add-unlike'(h) { const o = h.add('op'); h.link(h.role('a'), o, 'a'); h.link(h.role('b'), o, 'b'); },
  'balance-12'(h) { const a = h.add('num', { n: 5 }), b = h.add('num', { n: 7 }), o = h.add('op'); h.link(a, o, 'a'); h.link(b, o, 'b'); h.link(o, h.role('bal'), 'R'); },
  'two-dice'(h) { const o = h.add('op'), g = h.add('hist'); h.link(h.role('d1'), o, 'a'); h.link(h.role('d2'), o, 'b'); h.link(o, g, 'v'); h.run(120); },
  'counter-loop'(h) { const m = h.add('memory'), o = h.add('op'); h.link(m, o, 'a'); h.link(h.role('one'), o, 'b'); h.link(o, m, 'in'); h.run(12); },
  'frac-compare'(h) { const f1 = h.add('fracbar'), f2 = h.add('fracbar'), c = h.add('compare', { op: 1 }); h.link(h.role('a'), f1); h.link(h.role('b'), f2); h.link(h.role('a'), c, 'a'); h.link(h.role('b'), c, 'b'); },
  'rect-perimeter'(h) { const r = h.role('r'); h.set(r, 'w', 6); h.set(r, 'h', 4); h.set(r, 'w', 5.5); h.set(r, 'h', 4.5); h.set(r, 'w', 5); h.set(r, 'h', 5); },
  'line-through'(h) { const l = h.add('line', { k: 2, b: 1 }), a = h.add('at', { x: 3 }); h.link(l, a, 'f'); },
  'dice-mean'(h) { const o = h.add('op'), g = h.add('hist'), s = h.add('stats'); h.link(h.role('d1'), o, 'a'); h.link(h.role('d2'), o, 'b'); h.link(o, g, 'v'); h.link(g, s, 'd', 'dist'); h.run(400); },
  'array-12'(h) { const a = h.add('array', { rows: 3, cols: 4 }), b = h.add('array', { rows: 2, cols: 6 }), c = h.add('array', { rows: 1, cols: 12 }); },
  'divmod-17-5'(h) { const d = h.add('divmod'); h.link(h.role('a'), d, 'a'); h.link(h.role('b'), d, 'b'); },
  'round-347'(h) { const r = h.add('round'); h.link(h.role('x'), r, 'v'); h.set(r, 'place', -1); },
  'binary-13'(h) { const d = h.add('digits'); h.link(h.role('x'), d, 'v'); h.set(d, 'base', 2); },
  'decimal-add'(h) { const o = h.add('op'), c = h.add('compare'); h.link(h.role('a'), o, 'a'); h.link(h.role('b'), o, 'b'); h.link(o, c, 'a'); h.link(h.role('c'), c, 'b'); },
  'linear-3x5'(h) { const s = h.role('s'); h.set(s, 'a', 3); h.set(s, 'b', 5); h.set(s, 'c', 20); },
  'triangle-348'(h) { const t = h.role('t'); h.set(t, 'c', 6); h.set(t, 'c', 5); },
  'circle-r5'(h) { const c = h.role('c'); h.set(c, 'r', 5); },
  'quad-vertex'(h) { const q = h.role('q'); h.set(q, 'b', -4); h.set(q, 'c', 3); },
  'coin-fair'(h) { const g = h.add('hist'), s = h.add('stats'); h.link(h.role('c'), g, 'v'); h.set(g, 'lo', 0); h.set(g, 'hi', 1); h.link(g, s, 'd', 'dist'); h.run(450); },
  'seq-arith-20'(h) { const s = h.role('s'); h.set(s, 'first', 3); h.set(s, 'diff', 4); h.run(19); },
};
