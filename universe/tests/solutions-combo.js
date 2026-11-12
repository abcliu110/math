/* 综合示例的参考解：接线（h.link(从, 到, 到的输入口, 从的输出口)）。被 tests/run.js 按 solutions-*.js 自动加载。 */
'use strict';
module.exports = {
  'combo-fraction-sum'(h) {
    const op = h.role('op'), rd = h.role('rd');
    h.link(h.role('f1'), op, 'a'); h.link(h.role('f2'), op, 'b');
    h.link(op, rd, 'f'); h.link(rd, h.role('show'), 'v', 'v');
  },
  'combo-substitute'(h) {
    h.link(h.role('p'), h.role('sub'), 'p'); h.link(h.role('sub'), h.role('show'), 'v', 'v');
  },
  'combo-system-interval'(h) {
    const e1 = h.role('e1'), e2 = h.role('e2'), sys = h.role('sys');
    h.link(h.role('a1'), e1, 'L'); h.link(h.role('a2'), e1, 'R');
    h.link(h.role('a3'), e2, 'L'); h.link(h.role('a4'), e2, 'R');
    h.link(e1, sys, 'A', 'eq'); h.link(e2, sys, 'B', 'eq');
    h.link(sys, h.role('show'), 'v', 'x');
    h.link(e1, h.role('nl'), 'iv', 'iv');
  },
  'combo-move-area'(h) {
    const blk = h.role('blk'), ga = h.role('ga');
    h.link(h.role('sq'), blk, 'f'); h.link(blk, ga, 'f'); h.link(ga, h.role('show'), 'v', 's');
  },
  'combo-invariant-check'(h) {
    h.link(h.role('inv'), h.role('pc'), 'lv', 'lv');
  },
  'combo-parabola-vertex'(h) {
    h.link(h.role('q'), h.role('mx'), 'v', 'vx'); h.link(h.role('q'), h.role('my'), 'v', 'vy');
  },
  'combo-shapes-compare'(h) {
    const rt = h.role('rt'), it = h.role('it'), sc = h.role('sc');
    h.link(rt, h.role('cmp'), 'a', 'area'); h.link(it, h.role('cmp'), 'b', 'area');
    h.link(rt, h.role('rel'), 'a', 'f'); h.link(it, h.role('rel'), 'b', 'f');
    h.link(sc, h.role('show'), 'v', 'area');
  },
  'combo-quad-family'(h) {
    h.link(h.role('sq'), h.role('rat'), 'a', 'area'); h.link(h.role('pg'), h.role('rat'), 'b', 'area');
    h.link(h.role('rat'), h.role('show'), 'v', 'ra');
  },
  'combo-tenframe-count'(h) {
    h.link(h.role('tf'), h.role('show'), 'v', 'count');
  },
  'combo-expr-read'(h) {
    h.link(h.role('p'), h.role('wb'), 'f');
  },
  'combo-number-chain'(h) {
    const dm = h.role('dm'), dg = h.role('dg'), nt = h.role('nt'), pw = h.role('pw');
    h.link(h.role('n17'), dm, 'a'); h.link(h.role('n5'), dm, 'b');
    h.link(dm, h.role('mq'), 'v', 'q'); h.link(dm, h.role('mr'), 'v', 'r');
    h.link(h.role('n2024'), dg, 'v'); h.link(dg, h.role('msum'), 'v', 'sum');
    h.link(h.role('x12'), nt, 'a'); h.link(h.role('x18'), nt, 'b'); h.link(nt, h.role('mg'), 'v', 'gcd');
    h.link(h.role('two'), pw, 'a'); h.link(pw, h.role('mp'), 'v', 'r');
  },
  'combo-percent-bar'(h) {
    const pc = h.role('pc');
    h.link(h.role('a'), pc, 'a'); h.link(h.role('b'), pc, 'b');
    h.link(pc, h.role('mp'), 'v', 'r');
    h.link(pc, h.role('fb'), 'v', 'r'); h.link(h.role('fb'), h.role('mfb'), 'v', 'v');
    h.link(pc, h.role('es'), 'actual', 'r');
  },
  'combo-line-inverse-rotate'(h) {
    const at3 = h.role('at3');
    h.link(h.role('ln'), at3, 'f');
    h.link(at3, h.role('m1'), 'v', 'y');
    h.link(h.role('ip'), h.role('m2'), 'v', 'y');
    h.link(h.role('cl'), h.role('m3'), 'v', 'rel');
    h.link(h.role('pp'), h.role('rot'), 'p', 'p');
  },
  'combo-measure-transform'(h) {
    const xf = h.role('xf'), fm = h.role('fm');
    h.link(h.role('fr'), xf, 'f'); h.link(xf, fm, 'f');
    h.link(fm, h.role('ma'), 'v', 'area'); h.link(fm, h.role('mpm'), 'v', 'perim');
  },
  'combo-data-fit'(h) {
    const dt = h.role('dt'), ft = h.role('ft'), pr = h.role('pr'), st = h.role('st'), tw = h.role('tw');
    h.link(dt, ft, 't'); h.link(ft, h.role('mk'), 'v', 'k');
    h.link(ft, pr, 'f', 'f'); h.link(pr, h.role('my'), 'v', 'y');
    h.link(dt, h.role('col'), 't');
    h.link(h.role('ln'), h.role('sc'), 'line', 'f'); h.link(dt, h.role('sc'), 't', 't');
    h.link(h.role('d'), st, 'd', 'dist'); h.link(st, h.role('mst'), 'v', 'v');
    h.link(tw, h.role('mtw'), 'v', 'total');
  },
  'combo-loop-dice'(h) {
    const mem = h.role('mem'), op = h.role('op'), hs = h.role('hs');
    h.link(mem, op, 'a', 'v'); h.link(h.role('one'), op, 'b');
    h.link(op, mem, 'in', 'r'); h.link(mem, h.role('mm'), 'v', 'v');
    h.link(h.role('dc'), hs, 'v', 'v'); h.link(hs, h.role('mh'), 'v', 'n');
    h.run(5);
  },
  'combo-sweep-fence'(h) {
    const x = h.role('x'), sub = h.role('sub'), area = h.role('area'), tab = h.role('tab');
    h.link(h.role('ten'), sub, 'a'); h.link(x, sub, 'b', 'x');
    h.link(x, area, 'a', 'x'); h.link(sub, area, 'b', 'r');
    h.link(x, tab, 'x', 'x'); h.link(area, tab, 'y', 'r');
    h.link(tab, h.role('mbest'), 'v', 'best'); h.link(tab, h.role('mat'), 'v', 'at');
  },
};
