/* 搬到操作台上的旧题的参考解（problems/zz-benches.js）。文件名 zz 开头：排在各年级的参考解后面加载，盖掉原来“接运算器”的解法。 */
'use strict';
const S = (role) => (o) => (h) => { const e = h.role(role); for (const k of Object.keys(o)) h.set(e, k, o[k]); };
const n = S('n'), k = S('k'), r = S('r'), m = S('m'), c = S('c'), t = S('t'), s = S('s');
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
  'g1-make-ten-trap'(h) { const e = h.role('n'); h.set(e, 'n', 1); h.set(e, 'n', 6); },
  'g1-minus-break-trap'(h) { const e = h.role('n'); h.set(e, 'n', 3); h.set(e, 'n', 9); },
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
