/* 对手（docs/new-instruments.md 3.4）：取石子、汉诺塔这类器材要一个会下的对手。
 *   U.Game.define({ id, moves(state), apply(state, move), over(state), winner(state) })   state 是普通对象（可 JSON 化），state.turn 是轮到谁（0 或 1）；winner 返回赢的人（0 或 1）
 *   U.Game.best(game, state)   小状态空间直接穷举（带记忆）：{ win: 轮到的人能不能必赢, move: 最好的走法（赢就走最快赢的，输就拖得最久的）, depth }
 *   U.Game.opponent(game, state, level, seed)   难度 0 随机走；1 大约三成的时候走错（留给学生赢的机会）；2 总走最好的。seed 是整数——同一个局面、同一个 seed，走法永远一样（可重复，能测试）。 */
(function (G) {
  'use strict';
  const U = G.U;
  const games = {};
  const hash = (n) => { let h = (Math.imul((n | 0) + 0x9e3779b9, 2654435761) >>> 0); h ^= h >>> 15; h = Math.imul(h, 2246822519) >>> 0; return (h ^ (h >>> 13)) >>> 0; };
  function best(g, s, memo) {
    memo = memo || (g._memo = g._memo || new Map());
    const key = JSON.stringify(s); if (memo.has(key)) return memo.get(key);
    let r;
    if (g.over(s)) r = { win: g.winner(s) === s.turn, move: null, depth: 0 };
    else {
      let bw = null, bl = null;
      for (const m of g.moves(s)) {
        const t = best(g, g.apply(s, m), memo);
        if (!t.win) { if (!bw || t.depth + 1 < bw.depth) bw = { win: true, move: m, depth: t.depth + 1 }; }
        else if (!bl || t.depth + 1 > bl.depth) bl = { win: false, move: m, depth: t.depth + 1 };
      }
      r = bw || bl;
    }
    memo.set(key, r); return r;
  }
  U.Game = {
    define(g) { games[g.id] = g; return g; }, get: (id) => games[id] || null,
    best,
    opponent(g, s, level, seed) {
      const ms = g.moves(s); if (!ms.length) return null;
      const rnd = ms[hash(seed) % ms.length];
      if (level <= 0) return rnd;
      if (level === 1 && hash(seed * 31 + 7) % 10 < 3) return rnd;
      return best(g, s).move;
    },
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
