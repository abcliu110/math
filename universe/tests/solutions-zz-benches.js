/* 搬到操作台上的旧题的参考解（problems/zz-benches.js）。文件名 zz 开头：排在各年级的参考解后面加载，盖掉原来“接运算器”的解法。 */
'use strict';
const S = (role) => (o) => (h) => { const e = h.role(role); for (const k of Object.keys(o)) h.set(e, k, o[k]); };
const n = S('n'), k = S('k'), r = S('r');
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
};
