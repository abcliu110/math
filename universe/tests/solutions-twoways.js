/* 两种解法对照题的参考解（problems/twoways.js）：每一项连到随 n 一起变且值相同的那一项。 */
'use strict';
const go = (h) => {
  const o = h.role('w'), T = h.U.TwoWays, sc = T.SCN[h.props(o).sc];
  for (let l = 0; l < 4; l++) { const r = [0, 1, 2, 3].find((r) => T.NS.every((n) => sc.lv[l](n) === sc.rv[r](n))); h.set(o, 'lp', l + 1); h.set(o, 'rp', sc.perm.indexOf(r) + 1); }
  h.set(o, 'n', 5); h.set(o, 'disc', 1);
};
module.exports = { 'tw-hunt': go, 'tw-sum': go };
