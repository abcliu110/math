/* “找次品”题的参考解（problems/weighbench.js）。hist：每次称的时候每个零件放在哪（0 不放，1 左，2 右）。
 * 天平按最不利回答：三份一样多时说“平”，所以可疑的总在没上秤的那一份里。 */
'use strict';
const w27 = ['1'.repeat(9) + '2'.repeat(9) + '0'.repeat(9), '0'.repeat(18) + '111222000', '0'.repeat(24) + '120'];
module.exports = { 'wt-3'(h) { h.set(h.role('wt'), 'hist', '120'); }, 'wt-27'(h) { h.set(h.role('wt'), 'hist', w27.join(';')); },
  'wt-12-unknown'(h) { h.set(h.role('wt'), 'hist', '111122220000;222000001110;000000001200'); }
};
