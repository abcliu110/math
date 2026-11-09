/* coordsx 补充题的参考解（missing-coordsx.js）：用 h 搭出能通关的台面。
 * h.add(type, props) → id；h.link(from, to, toPort, fromPort)；h.set(id,k,v)；h.role(r)。 */
'use strict';
module.exports = {
  'g5-pair-pos-core'(h) { const p = h.add('pair-pos'); h.set(p, 'col', 4); h.set(p, 'row', 3); },
  'g5-pair-pos-trap'(h) { const p = h.add('pair-pos'); h.set(p, 'col', 3); h.set(p, 'row', 4); },
  'g5-rotate-core'(h) { const p = h.add('pair-pos'); h.set(p, 'col', 1); h.set(p, 'row', 0); const r = h.add('rotate-about'); h.link(p, r, 'p'); },
  'g5-rotate-trap'(h) {
    const p = h.add('pair-pos'); h.set(p, 'col', 2); h.set(p, 'row', 1);
    const r = h.add('rotate-about'); h.set(r, 'cx', 1); h.set(r, 'cy', 1); h.set(r, 'angle', 1); h.link(p, r, 'p');
  },
  'g9-rotate-core'(h) {
    const p = h.add('pair-pos'); h.set(p, 'col', 3); h.set(p, 'row', 1);
    const r = h.add('rotate-about'); h.set(r, 'angle', 1); h.link(p, r, 'p');
  },
  'g9-rotate-trap'(h) { const p = h.add('pair-pos'); h.set(p, 'col', 1); h.set(p, 'row', 0); const r = h.add('rotate-about'); h.link(p, r, 'p'); },
  'g9-inverse-core'(h) { const r = h.add('inverse-prop'); h.set(r, 'x', 3); },
  'g9-inverse-trap'(h) { const r = h.add('inverse-prop'); h.set(r, 'x', -2); },
  'g9-circle-core'(h) { const c = h.add('circle-line'); h.set(c, 'd', 5); },
  'g9-circle-trap'(h) { const c = h.add('circle-line'); h.set(c, 'd', 3); },
};
