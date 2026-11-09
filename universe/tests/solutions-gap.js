/* 缺口补题（content-gap.js）的参考解：用 h 搭出能通关的台面。
 * h.add(type, props) → id；h.link(from, to, toPort, fromPort)；h.set(id,k,v)；h.role(r)。 */
'use strict';
module.exports = {
  'gap-pair-pos-core'(h) { const p = h.add('pair-pos'); h.set(p, 'col', 4); h.set(p, 'row', 3); },
  'gap-rotate-trap'(h) { const p = h.add('pair-pos'); h.set(p, 'col', 1); h.set(p, 'row', 0); const r = h.add('rotate-about'); h.set(r, 'angle', 0); h.link(p, r, 'p'); },
};
