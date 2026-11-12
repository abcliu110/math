/* 估算器题的参考解（problems/estimate.js）。 */
'use strict';
module.exports = {
  'est-29x31'(h) { const o = h.add('op', { op: 2 }); h.link(h.role('a'), o, 'a'); h.link(h.role('b'), o, 'b'); const e = h.add('estimate'); h.set(e, 'guess', '900'); h.link(o, e, 'actual'); },
  'est-48x52'(h) { const o = h.add('op', { op: 2 }); h.link(h.role('a'), o, 'a'); h.link(h.role('b'), o, 'b'); const e = h.add('estimate'); h.set(e, 'guess', '2.4'); h.link(o, e, 'actual'); },
  'est-circle'(h) { const e = h.add('estimate'); h.set(e, 'mode', 1); h.set(e, 'lo', '50'); h.set(e, 'hi', '100'); h.link(h.role('c'), e, 'actual', 'area'); },
};
