/* “倒水”题的参考解（problems/pourbench.js）。hist：做过的每一步（fA 装满甲、eB 倒空乙、AB 甲倒进乙……）。 */
'use strict';
module.exports = {
  'pb-9-4-1'(h) { h.set(h.role('pb'), 'hist', 'fA,AB,eB,AB'); },
  'pb-8-5-2'(h) { h.set(h.role('pb'), 'hist', 'fB,BA,fB,BA'); },
};
