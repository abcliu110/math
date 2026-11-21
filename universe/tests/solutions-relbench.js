/* “关系图”题的参考解（problems/relbench.js）。chosen：连上的关系卡；got：算出来的“量@关系”。 */
'use strict';
const set = (o) => (h) => { const v = h.role('rl'); for (const k of Object.keys(o)) h.set(v, k, o[k]); };
module.exports = {
  'rl-times-sum': set({ chosen: '1,2,3', got: '5@5=3+4,1@1=2/5,0@0=1*3' }),
  'rl-unit': set({ got: '2@2=1/0,4@4=2*3' }),
};
