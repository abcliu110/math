/* “尺子”题的参考解（problems/rulerbench.js）。 */
'use strict';
const set = (o) => (h) => { const v = h.role('rl'); for (const k of Object.keys(o)) h.set(v, k, o[k]); };
module.exports = {
  'ru-pencil': set({ at: 0 }),
};
