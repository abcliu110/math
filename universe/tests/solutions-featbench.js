/* “数的特征”题的参考解（problems/featbench.js）。pick：每个空位放第几张卡片；found：记下的数；tried：奇偶试过的。 */
'use strict';
const set = (o) => (h) => { const v = h.role('ft'); for (const k of Object.keys(o)) h.set(v, k, o[k]); };
module.exports = {
  'ft-max-10': set({ pick: '3,2,0' }), 'ft-3-all': set({ found: '24,42,27,72' }), 'ft-fill-3': set({ found: '402,432,462,492' }),
  'ft-odd-odd'(h) { const v = h.role('ft'); h.set(v, 'joined', true); h.set(v, 'tried', '3+5'); h.set(v, 'tried', '3+5,1+7,5+5'); },
};
