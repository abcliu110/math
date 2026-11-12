/* 取石子、汉诺塔、一笔画题的参考解（problems/games.js）。 */
'use strict';
const hanoi = (n, a, b, c, out) => { if (!n) return; hanoi(n - 1, a, c, b, out); out.push([a, c]); hanoi(n - 1, b, a, c, out); };
module.exports = {
  'nim-10-2'(h) {
    const n = h.role('n'); h.set(n, 'level', 2);
    for (let g = 0; g < 3; g++) {
      h.set(n, 'go', 1);
      for (let i = 0; i < 20 && h.props(n).phase === 1; i++) { const p = h.props(n), t = p.pile % 3 === 0 ? 1 : p.pile % 3; h.set(n, 'take', t); }
    }
  },
  'nim-table'(h) { const n = h.role('n'); for (let i = 0; i <= 12; i++) h.set(n, 'tm', i * 3 + (i % 4 === 0 ? 2 : 1) + 1); },
  'hn-3'(h) { const t = h.role('h'), mv = []; hanoi(3, 1, 2, 3, mv); for (const [a, b] of mv) { h.set(t, 'mv', a); h.set(t, 'mv', b); } },
  'hn-4'(h) { const t = h.role('h'), mv = []; hanoi(4, 1, 2, 3, mv); for (const [a, b] of mv) { h.set(t, 'mv', a); h.set(t, 'mv', b); } },
  'hn-table'(h) { const t = h.role('h'); [1, 3, 7, 15].forEach((v, i) => h.set(t, 't' + (i + 1), v)); },
  'eu-ri'(h) { const e = h.role('e'), p = h.props(e), G = h.U.Games, g = G.GRAPHS[p.graph], path = G.findPath(g.v.length, G.edgesOf(p)); for (const v of path) h.set(e, 'go', v + 1); },
  'eu-tian'(h) { h.set(h.role('e'), 'gposs', 2); },
  'eu-bridge'(h) { const e = h.role('e'); h.set(e, 'mode', 1); h.set(e, 'go', 2); h.set(e, 'go', 3); },
};
