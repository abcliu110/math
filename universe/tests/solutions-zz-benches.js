/* 搬到操作台上的旧题的参考解（problems/zz-benches.js）。文件名 zz 开头：排在各年级的参考解后面加载，盖掉原来“接运算器”的解法。 */
'use strict';
const S = (role) => (o) => (h) => { const e = h.role(role); for (const k of Object.keys(o)) h.set(e, k, o[k]); };
const n = S('n'), k = S('k'), r = S('r'), m = S('m'), c = S('c'), t = S('t'), s = S('s'), gp = S('g'), b = S('b'), d = S('d'), ch = S('h'), ck = S('k'), gq = S('q'), so = S('o'), cj = S('j'), fz = S('z'), pq = S('p'), tx = S('x'), ci = S('i'), gw = S('w'), ty = S('y'), vv = S('v'), mbs = S('c2'), dd = S('d'), tt = S('tb'), zz = S('z'), ee = S('e'), ar = S('ar'), ff = S('f');
module.exports = {
  'g1-split-merge-core': n({ a: 2, n: 3 }),
  'g1-split-minus-trap': n({ s: -1, n: 2 }),
  'g1-zero-subtract-core': n({ n: 5 }),
  'g1-carry-add-core'(h) { const e = h.role('n'); h.set(e, 'n', 1); h.set(e, 'n', 5); },
  'g1-minus-core'(h) { const e = h.role('n'); h.set(e, 'n', 3); h.set(e, 'n', 9); },
  'g2-times-trap': n({ s: 6, n: 3 }),
  'g2-divide-share-core': n({ n: 4 }),
  'g7-rational-compare-core': n({ lo: -3, hi: 2 }),
  'g7-rational-addsub-core': n({ a: -3, n: 5 }),
  'g7-segment-length-core': n({ hi: 7, lo: 2 }),
  'g1-add-two-digit-core': k({ t: 8, o: 3 }),
  'g2-carry-add-core': k({ t: 7, o: 3 }),
  'g3-add-carry-core'(h) { const e = h.role('k'); h.set(e, 'o', 2); h.set(e, 't', 15); h.set(e, 't', 5); h.set(e, 'h', 8); },
  'g1-sub-borrow-trap': k({ t: 4, o: 12 }),
  'g2-borrow-sub-trap': k({ t: 5, o: 10 }),
  'g5-fraction-equiv-core': r({ n2: 3 }),
  'g5-fraction-add-core': r({ n2: 2 }),
  'g6-ratio-cross-core': r({ t: 9 }),
  // 第二批
  'g1-position-compare-core': n({ hi: 4, lo: 2 }),
  'g1-make-ten-trap'(h) { const e = h.role('k'); h.set(e, 'moved', 1); },
  'g1-minus-break-trap'(h) { const e = h.role('k'); h.set(e, 'cross', '10,11,12,0,1,2,3,4,5'); },
  'g2-divide-order-trap': n({ s: 4, n: 3 }),
  'g3-times-trap': n({ n: 4 }),
  'g6-negative-order-core': n({ lo: -3, hi: -1 }),
  'g6-negative-order-trap': n({ lo: -8, hi: -2 }),
  'g7-rational-subneg-trap': n({ s: 1, n: 5 }),
  'g3-subtract-zero-trap'(h) { const e = h.role('k'); h.set(e, 'h', 2); h.set(e, 't', 10); h.set(e, 't', 9); h.set(e, 'o', 10); },
  'g3-fraction-add-core': r({ n2: 1 }),
  'g3-fraction-denom-trap': r({ n2: 2 }),
  'g5-fraction-add-trap': r({ n2: 1 }),
  'g6-ratio-difference-trap': r({ t: 9 }),
  'g2-combo-multiply-core': m({ w: 3, h: 2 }),
  'g2-combo-add-trap': m({ w: 3, h: 2 }),
  'g3-combo-add-trap': m({ w: 3, h: 2 }),
  'g3-zero-place-trap': m({ w: 20 }),
  'g6-frac-mul-core': m({ d1: 3, n1: 2, d2: 4, n2: 3 }),
  'g7-quadrant-core': c({ ax: -2, ay: 3 }),
  'g7-symmetry-x-axis-trap': c({ bx: 3, by: 2 }),
  'g7-translate-down-trap': c({ ay: -1 }),
  // 第三十三批
  'gcd-12-18': ff({ tried: '1,2,3,6', cm: '36' }), 'pb-gcd-24-36': ff({ tried: '1,2,3,4,6,12', cm: '72' }), 'pb-count-divisors': ff({ w: 6, found: '1,2,3,4,6' }),
  // 第三十二批
  'g4-parallelogram-core': ar({ h: 4, step: 2, seen: '2' }), 'g4-parallelogram-slant-trap': ar({ step: 2, seen: '2' }), 'para-area': ar({ b: 6, h: 4, step: 2, seen: '2' }), 'cut-invariant': ar({ step: 2, seen: '1,4', s: 4 }),
  // 第三十一批
  'g2-estimate-trap': ee({ pa: 2, pb: 2 }), 'est-29x31': ee({ pa: 2, pb: 1, reveal: true }), 'est-48x52': ee({ pa: 2, pb: 1, reveal: true }), 'est-circle': ee({ lo: 50, hi: 100, reveal: true }),
  // 第二十九批
  'g6-neg-times-core': zz({ pos: 12, neg: 0, step: 3 }), 'g6-neg-times-trap': zz({ pos: 30, neg: 0, step: 6 }), 'g7-rational-mulneg-trap': zz({ pos: 12, neg: 0, step: 4 }), 'g7-rational-opposite-trap': zz({ pos: 4, neg: 0, step: 1 }), 'g7-rational-divsign-core': zz({ neg: 0, dealt: 3 }),
  // 第二十八批
  'tl-expand': tt({ p2: 1, p1: 5, p0: 4 }), 'tl-factor': tt({ wp: 3, hp: 2 }), 'tl-complete': tt({ wp: 3, add: 9 }), 'tl-trap': tt({ claim: 1 }),
  // 第二十七批
  'g3-decimal-jiao-core': dd({ t: 7, step: 1 }), 'g3-decimal-trap': dd({ u: 1, t: 5 }), 'g4-decimal-equal-core': dd({ t: 0, h: 50 }), 'g4-decimal-shift-trap': dd({ shift: 1 }),
  'g4-decimal-add-core': dd({ u: 4, t: 0, h: 5, step: 1 }), 'g4-decimal-align-trap': dd({ u: 2, t: 3, h: 2, step: 1 }), 'decimal-add': dd({ t: 3, step: 1 }), 'g5-decimal-mul-core': dd({ u: 2, t: 4, step: 4 }),
  'g5-decimal-mul-trap': dd({ gw: 2, gh: 3 }), 'g5-decimal-div-core': dd({ u: 0, t: 0, step: 4 }), 'g5-decimal-div-trap': dd({ u: 0, t: 0, step: 3 }),
  // 第二十六批
  'g2-two-digit-add-core': vv({ res: '68' }), 'g3-divide-core': vv({ qd: '21' }), 'g3-divide-zero-trap': vv({ qd: '203' }), 'g4-div-2digit-core': vv({ qd: '20' }), 'g4-div-trial-trap': vv({ qd: '19' }),
  'g4-mul-3x2-core': mbs({ vals: '400,80,20,2000,400,100,500,2500,3000' }), 'g4-mul-zero-trap': mbs({ vals: '4000,800,120,4920' }),
  // 第二十五批
  'g3-twoway-total-core': ty({ picked: '0,1,2,3', done: true }), 'g3-twoway-total-trap': ty({ picked: '0,1,2,3', done: true }), 'g3-twoway-zero-core': ty({ picked: '0,1,2,3,4,5', done: true }), 'g3-twoway-zero-trap': ty({ picked: '0,1,2,3,4,5', done: true }),
  // 第二十四批
  'g1-ten-plus-core': k({ o: 6 }),
  // 第二十三批
  'gap-pair-pos-core': gw({ px: 4, py: 3 }), 'g5-pair-pos-core': gw({ px: 4, py: 3 }), 'g5-pair-pos-trap': gw({ px: 3, py: 4 }),
  'gap-rotate-trap': gw({ rot: 90 }), 'g5-rotate-core': gw({ rot: 90 }), 'g5-rotate-trap': gw({ ox: 1, oy: 1, rot: 180 }), 'g9-rotate-core': gw({ rot: 180 }), 'g9-rotate-trap': gw({ rot: 90 }),
  'g4-translate-congruent-core'(h) { const e = h.role('w'); h.set(e, 'tm', 1); h.set(e, 'dx', 3); h.set(e, 'dy', 1); h.set(e, 'cmp', true); },
  'g8-congruent-sss-core': gw({ cmp: true }), 'g8-similar-not-congruent-trap': gw({ cmp: true }), 'g9-similar-scale-core'(h) { const e = h.role('w'); h.set(e, 'tm', 2); h.set(e, 'k', 2); h.set(e, 'cmp', true); },
  'g9-similar-scale-trap'(h) { const e = h.role('w'); h.set(e, 'tm', 2); h.set(e, 'k', 2); h.set(e, 'cmp', true); }, 'g9-similar-tri-core': gw({ qy3: 0 }),
  // 第二十二批
  'g6-circle-diameter-trap': ci({ r: 5 }), 'circle-r5': ci({ r: 5 }), 'g6-cylinder-volume-core': ci({ r: 2, h: 5 }), 'g6-cone-volume-trap': ci({ r: 3, h: 4 }),
  'g9-sector-core'(h) { const e = h.role('i'); h.set(e, 'r', 6); h.set(e, 'theta', 90); }, 'g9-sector-trap'(h) { const e = h.role('i'); h.set(e, 'r', 6); h.set(e, 'theta', 90); },
  'g9-circle-core': ci({ d: 5 }), 'g9-circle-trap': ci({ d: 3 }), 'mt-circle-angle-core': ci({ ca: 60 }), 'mt-circle-angle-trap': ci({ ca: 120 }),
  // 第二十一批
  'g1-triangle-sides-trap'(h) { const e = h.role('x'); h.set(e, 'c', 6); h.set(e, 'c', 5); }, 'g8-isosceles-perimeter-core': tx({ c: 6 }), 'g8-isosceles-base-trap': tx({ c: 4 }),
  'g8-pythagoras-core': tx({ c: 13 }), 'g8-pythagoras-trap': tx({ c: 10 }), 'triangle-348'(h) { const e = h.role('x'); h.set(e, 'c', 6); h.set(e, 'c', 5); },
  'triangle-right': tx({ B: 55 }), 'g2-right-angle-core': tx({ B: 60 }),
  // 第二十批
  'match-pairs': pq({ pairs: '0-0,1-1,2-2,3-3,4-4' }), 'no-extra-seat': pq({ pairs: '0-0,1-1,2-2,3-3' }),
  'one-to-one'(h) { const e = h.role('p'); h.set(e, 'pairs', '0-0,1-1'); h.set(e, 'nb', 3); h.set(e, 'pairs', '0-0,1-1,2-2'); },
  'count-by-match': pq({ pairs: '0-1,0-2,0-3,1-2,1-3,2-3' }), 'counting-matching': pq({ pairs: '0-1,0-2,0-3,0-4,1-2,1-3,1-4,2-3,2-4,3-4' }),
  'array-12'(h) { const e = h.role('m'); h.set(e, 'w', 4); h.set(e, 'h', 3); h.set(e, 'w', 6); h.set(e, 'h', 2); h.set(e, 'w', 12); h.set(e, 'h', 1); },
  // 第十九批
  'g5-chance-core': ch({ list: true }), 'g5-chance-trap': ch({ sumv: 13 }), 'g9-enum-prob-core': ch({ list: true }), 'g9-enum-prob-trap': ch({ list: true }), 'pf-three-dice': ch({ mode: 4, list: true }),
  // 第十八批
  'car-model-proportional': fz({ bx: 1, by: 60, px: 5 }), 'taxi-model-linear': fz({ ax: 1, ay: 8, bx: 4, by: 17, px: 10 }), 'tank-model-linear-decrease': fz({ ax: 0, ay: 100, bx: 6, by: 70, px: 10 }),
  // 第十七批
  'g6-odd-sum-core': cj({ pick: 3, n: 5 }), 'g6-odd-sum-trap'(h) { const e = h.role('j'); h.set(e, 'n', 2); h.set(e, 'pick', 3); h.set(e, 'n', 5); },
  'odd-sum-law': cj({ pick: 3, n: 20 }), 'polygon-law': cj({ pick: 2, n: 8 }), 'euler-prime'(h) { const e = h.role('j'); h.set(e, 'n', 40); h.set(e, 'verdict', 2); },
  'asn-n2n41'(h) { const e = h.role('j'); h.set(e, 'n', 40); h.set(e, 'upto', 40); h.set(e, 'verdict', 2); }, 'pf-2n1-prime': cj({ n: 4 }), 'pf-prime-odd': cj({ n: 1 }), 'pf-half-even': cj({ n: 1 }),
  'pf-sum3-scan'(h) { const e = h.role('j'); h.set(e, 'pick', 2); h.set(e, 'n', 100); h.set(e, 'upto', 100); },
  // 第十六批
  'g1-solid-edges-core': so({ h: '1,1,1;1,1,1' }),
  'g1-solid-volume-trap'(h) { const e = h.role('o'); h.set(e, 'h', '6'); h.set(e, 'rows', 2); h.set(e, 'cols', 3); h.set(e, 'h', '1,1,1;1,1,1'); },
  'g5-cuboid-vol-core'(h) { const e = h.role('o'); h.set(e, 'h', '1,1,1,1,1;1,1,1,1,1;1,1,1,1,1;1,1,1,1,1'); h.set(e, 'h', '3,3,3,3,3;3,3,3,3,3;3,3,3,3,3;3,3,3,3,3'); },
  'g5-cuboid-same-vol-trap': so({ h: '4,4;4,4;4,4' }),
  'cuboid-vol': so({ rows: 4, cols: 6, h: '3,3,3,3,3,3;3,3,3,3,3,3;3,3,3,3,3,3;3,3,3,3,3,3' }),
  // 第十五批
  'vw-front-core': so({ h: '1,2;1,1', sf: true }), 'vw-front-trap': so({ h: '3,1;1,1', sf: true }), 'vw-side-core': so({ h: '2,0;1,3', ss: true }), 'vw-side-trap': so({ h: '3,0;2,2', ss: true }),
  'vw-top-core': so({ h: '0,1;1,0', st: true }), 'vw-top-trap': so({ h: '0,1;3,0', st: true }), 'vw-total-core': so({ h: '2,2;2,2', st: true }), 'vw-total-trap': so({ st: true, ss: true }),
  // 第十四批
  'g1-teen-tens-trap': gq({ g: 10 }), 'divmod-17-5': gq({ g: 5 }), 'g6-pigeon-core': gq({ dealt: 10 }), 'g6-pigeon-exact-trap': gq({ dealt: 12 }), 'prime-91': gq({ g: 7 }),
  // 第十三批
  'g1-clock-hour-core': ck({ t: 180 }), 'g1-clock-minute-trap'(h) { const e = h.role('k'); h.set(e, 'timing', true); h.set(e, 't', 60); },
  'g2-hour-minute-core'(h) { const e = h.role('k'); h.set(e, 't', 120); h.set(e, 't', 150); }, 'g3-time-add-trap': ck({ t: 150 }),
  // 第十二批
  'two-dice'(h) { const e = h.role('h'); h.set(e, 'n', 300); h.set(e, 'showp', true); }, 'coin-fair'(h) { const e = h.role('h'); h.set(e, 'n', 10); h.set(e, 'n', 400); },
  'bag-red-ratio': ch({ n: 400, showp: true }), 'dice-mean': ch({ n: 300 }),
  // 第十一批
  'g2-data-mode-core': d({ smode: true }), 'g2-data-count-trap': d({ vals: '2, 3, 5, 5, 5', smode: true }), 'g4-bar-range-core': d({ srange: true }), 'g7-survey-mean-core': d({ smean: true }),
  'g7-survey-median-trap': d({ vals: '1, 2, 2, 3, 100', smed: true }), 'g8-median-core': d({ vals: '2, 4, 4, 6, 9', smed: true }), 'g8-median-mode-trap': d({ vals: '1, 1, 2, 3, 4', smed: true }),
  'mean-vs-median'(h) { const e = h.role('d'); h.set(e, 'smean', true); h.set(e, 'smed', true); h.set(e, 'vals', '3, 4, 4, 5, 4'); },
  // 第十批
  'g8-proportional-core': c({ kn: 2, x: 3 }), 'g8-proportional-intercept-trap': c({ b: 3 }), 'line-through': c({ kn: 2, x: 2 }), 'model-rent': c({ b: 2 }),
  'g9-discriminant-core': c({ v: 0 }), 'g9-discriminant-trap': c({ v: 0 }), 'g9-vertex-down-core': c({ h: 1, v: 4 }), 'g9-vertex-down-trap': c({ a2: -2 }), 'g9-min-value-core': c({ h: 3, v: 1 }), 'quad-vertex': c({ h: 2, v: -1 }),
  'g7-equation-word-core': b({ lx: 1, rc: 8 }),
  'g7-equation-sign-trap'(h) { const e = h.role('b'); h.set(e, 'lc', 0); h.set(e, 'rc', 12); h.set(e, 'lx', 1); h.set(e, 'rc', 6); },
  'linear-3x5'(h) { const e = h.role('b'); h.set(e, 'lc', 0); h.set(e, 'rc', 15); h.set(e, 'lx', 1); h.set(e, 'rc', 5); },
  // 第九批
  'g1-rect-perimeter-core': m({ w: 4, h: 2 }), 'g3-rect-square-core': m({ h: 5 }), 'g3-rect-perimeter-trap': m({ h: 4 }), 'g8-square-area-core': m({ w: 5 }),
  'rect-perimeter'(h) { const e = h.role('m'); h.set(e, 'w', 6); h.set(e, 'h', 4); h.set(e, 'w', 5); h.set(e, 'h', 5); }, 'g8-rect-height-trap': m({ h: 3 }),
  // 第八批
  'discount-80': r({ t: 80 }), 'g6-percent-part-core': r({ t: 15 }), 'g6-percent-base-trap': r({ t: 60 }), 'g6-sector-angle-core': r({ t: 25 }), 'g6-sector-whole-trap': r({ t: 25 }),
  'g6-percent-rebound-trap': r({ t: 80 }), 'ratio-share-50': r({ t: 3 }),
  // 第七批
  'g5-tree-core': gp({ gap: 5 }), 'g5-tree-ring-trap': gp({ ring: 1 }),
  // 第六批
  'g4-chicken-rabbit-core': s({ k: 12 }), 'g4-chicken-rabbit-trap': s({ k: 12 }),
  // 第五批
  'g1-position-numline-trap': n({ k: 7 }),
  'g3-direction-east-west-core'(h) { const e = h.role('n'); h.set(e, 'n', 5); h.set(e, 'n', 0); h.set(e, 'a', 5); h.set(e, 's', -1); h.set(e, 'n', 3); },
  'g3-direction-back-trap': n({ n: 4 }),
  'frac-compare': r({ n2: 3 }),
  // 第四批
  'g1-chain-add-core': t({ toks: '9' }), 'g1-chain-sub-trap': t({ toks: '4' }), 'g2-mixed-core': t({ toks: '14' }), 'g2-mixed-brackets-trap': t({ toks: '20' }),
  'g4-order-mul-core': t({ toks: '23' }), 'g4-order-left-trap': t({ toks: '10' }), 'g4-assoc-mul-core': t({ toks: '800' }), 'g4-assoc-sub-trap': t({ toks: '7' }),
  // 第三批
  'g2-kg-to-g-core': r({ t: 2 }), 'g2-kg-trap': r({ t: 3 }), 'g2-hour-100-trap': r({ t: 3 }), 'g3-time-hour-minute-core': r({ t: 2 }),
  'g3-measure-m-to-cm-core': r({ t: 3 }), 'g4-area-km2-core': r({ t: 3 }), 'g4-area-ha-trap': r({ t: 2 }), 'g4-bar-scale-trap': r({ t: 9 }),
};
