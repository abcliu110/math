/* “分类与整理”的题。选分法，点卡片、点框，分完数一数。判分只看器材的输出。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const sb = (props) => () => { const s = W.blank(); const id = W.add(s, 'sortbench', 40, 50, props); s.entities[id].role = 'so'; return s; };
  const P = [];
  const base = { domain: '统计与概率', level: 'core', shelf: ['sortbench'], traps: [], predict: null };
  const add = (o) => P.push(Object.assign({}, base, o));
  const ms = (id, say, score, port, value, hints) => ({ id, say, score, when: { role: 'so', port, op: '=', value: String(value) }, hints });
  add({
    id: 'so-two-ways', essence: ['E1', 'E2'], title: '同一堆卡片，按颜色分和按形状分', grade: 1, rung: 3, points: ['1.12'],
    topics: ['分类', '分类标准'], alias: ['分类', '按形状分', '按颜色分'],
    hook: '8 张卡片。这回按形状分：圆、方块、三角各几个？分完核对总数。',
    build: sb({ items: '00,01,02,10,11,20,21,12', crit: 1 }),
    milestones: [ms('check', '按形状分完：和总数 8 一样', 6, 'check', 1, ['点一张卡片，再点它的形状框。', '圆 3 个、方块 3 个、三角 2 个。', '3 + 3 + 2 = 8。'])],
    goal: ['check'],
    why: '分类先定标准：按形状分是圆、方、三角三类；按颜色分又是另外几类。标准不同，每一类的个数不同，但加起来都是 8。',
  });
  U.problems.push.apply(U.problems, P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
