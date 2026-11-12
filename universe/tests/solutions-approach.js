/* 逼近器题的参考解（problems/approach.js）。 */
'use strict';
const walk = (h, n, extra) => { const a = h.role('a'); if (extra) for (const k of Object.keys(extra)) h.set(a, k, extra[k]); for (let i = 1; i <= n; i++) h.set(a, 'step', i); };
module.exports = {
  'ap-half'(h) { walk(h, 8, { gans: 2 }); },
  'ap-circle'(h) { walk(h, 4, { gans: 2 }); },
  'ap-999'(h) { walk(h, 6, { gans: 2, sfg: 7 }); },
  'ap-sqrt2'(h) { walk(h, 5, { gans: 2 }); },
};
