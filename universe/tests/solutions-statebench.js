/* “状态图”题的参考解（problems/statebench.js）。path：走过的步；mark：往回标了几个。 */
'use strict';
module.exports = {
  'sg-river'(h) { const v = h.role('sg'); h.set(v, 'path', 'c1'); h.set(v, 'path', 'c2,c0,c1,c2,c3,c0,c2'); },
  'sg-hanoi'(h) { h.set(h.role('sg'), 'path', 'm02,m01,m21,m02,m10,m12,m02'); },
  'sg-nim'(h) { const v = h.role('sg'); h.set(v, 'mark', 11); h.set(v, 'path', 't2,t1,t3,t1,t3'); },
};
