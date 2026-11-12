/* 改规则的世界题的参考解（problems/whatif.js）。 */
'use strict';
const pick = (list) => (h) => { const o = h.role('w'); h.set(o, 'gans', '270'); for (const i of list) h.set(o, 'pk', i + 1); };
module.exports = {
  'st-sum': pick([0, 1, 2]), 'st-three-right': pick([0, 1, 2]),
  'tx-circle': (h) => { const o = h.role('w'); h.set(o, 'gans', 2); for (const i of h.U.WhatIf.tTruth({ mode: 0, r: 3, pair: 0 })) h.set(o, 'cell', i + 1); },
  'tx-bisector': (h) => { const o = h.role('w'); h.set(o, 'gans', 4); for (const i of h.U.WhatIf.tTruth({ mode: 1, r: 3, pair: 1 })) h.set(o, 'cell', i + 1); },
  'nw-sub': (h) => { const o = h.role('w'); h.set(o, 'ex', '1,2'); h.set(o, 'ex', '0,1,2'); h.set(o, 'qc', 2); h.set(o, 'qa', 2); h.set(o, 'qi', 2); h.set(o, 'qv', 2); },
  'nw-max': (h) => { const o = h.role('w'); h.set(o, 'qc', 1); h.set(o, 'qa', 1); h.set(o, 'qi', 1); h.set(o, 'qv', 2); },
};
