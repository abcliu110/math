/* 海龟作图题的参考解（problems/turtle.js）。 */
'use strict';
const prog = (list) => (h) => { const o = h.role('t'); for (const [k, v] of list) { if (k === 'n' || k === 'a' || k === 'k') h.set(o, k, v); else h.set(o, 'add', v); } };
module.exports = {
  'tu-square': prog([['n', 100], ['k', 4], ['a', 90], ['add', 4], ['add', 1], ['add', 2], ['add', 5]]),
  'tu-triangle': prog([['n', 100], ['k', 3], ['a', 120], ['add', 4], ['add', 1], ['add', 2], ['add', 5]]),
  'tu-ngon': prog([['n', 100], ['k', 9], ['a', 40], ['add', 4], ['add', 1], ['add', 2], ['add', 5]]),
  'tu-star': prog([['n', 100], ['k', 5], ['a', 144], ['add', 4], ['add', 1], ['add', 2], ['add', 5]]),
};
