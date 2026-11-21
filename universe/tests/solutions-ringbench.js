/* “跳格钟”题的参考解（problems/ringbench.js）。k 步长，beats 走了几拍，tried 走完一圈的步长记录。 */
'use strict';
const set = (o) => (h) => { const v = h.role('rg'); for (const k of Object.keys(o)) h.set(v, k, o[k]); };
module.exports = {
  'rg-8-steps'(h) { const v = h.role('rg'); h.set(v, 'beats', 4); h.set(v, 'k', 3); h.set(v, 'beats', 8); },
  'rg-7-last': set({ beats: 50 }),
};
