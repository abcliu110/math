/* “工程问题”题的参考解（problems/jobbench.js）。 */
'use strict';
const set = (o) => (h) => { const v = h.role('jb'); for (const k of Object.keys(o)) h.set(v, k, o[k]); };
module.exports = {
  'jb-6-3': set({ t: 2 }), 'jb-10-15': set({ t: 6 }), 'jb-tank': set({ t: 12 }),
};
