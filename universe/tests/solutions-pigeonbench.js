/* “摸球保证”题的参考解（problems/pigeonbench.js）。x1–x4 是摸出来的红、黄、蓝、绿：摸成最倒霉的那一种（卡住），say 是说出来的“保证要摸几个”。 */
'use strict';
const at = (h, x) => { Object.keys(x).forEach((k) => h.set(h.role('pg'), k, x[k])); };
module.exports = {
  'pg-socks'(h) { at(h, { x1: 1, x2: 1, x3: 1, say: 4 }); },
  'pg-three-same'(h) { at(h, { x1: 2, x2: 2, x3: 2, x4: 2, say: 9 }); },
  'pg-short-color'(h) { at(h, { x1: 2, x2: 1, x3: 2, say: 6 }); },
  'pg-every-color'(h) { at(h, { x1: 6, x2: 4, say: 11 }); },
  'pg-three-red'(h) { at(h, { x1: 2, x2: 4, x3: 3, say: 10 }); },
};
