/* “枚举树”题的参考解（problems/treebench.js）：全部展开。 */
'use strict';
const all = (h) => { h.set(h.role('tr'), 'open', 6); };
module.exports = { 'tr-123': all, 'tr-0123': all, 'tr-even': all, 'tr-repeat': all, 'tr-coins-10': all };
