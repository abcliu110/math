/* “牛吃草”的题。两次记录比一比，找出草每天长几份、原来有几份；再算别的牛数吃几天。判分只看器材的输出。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const gr = (props) => () => { const s = W.blank(); const id = W.add(s, 'grassbench', 40, 50, props); s.entities[id].role = 'gr'; return s; };
  const P = [];
  const base = { domain: '关系', level: 'core', shelf: ['grassbench'], traps: [], predict: null, points: ['5.5'], topics: ['牛吃草', '奥数'] };
  const add = (o) => P.push(Object.assign({}, base, o));
  const ms = (id, say, score, port, value, hints) => ({ id, say, score, when: { role: 'gr', port, op: '=', value: String(value) }, hints });
  add({
    id: 'gr-10-15-25', essence: ['E4', 'E7'], title: '牛吃草：10 头牛 20 天吃完，15 头牛 10 天吃完。25 头牛几天吃完？', grade: 5, rung: 4, alias: ['牛吃草', '牛顿问题'],
    hook: '草一边长一边被吃。改“每天长几份”，让两根长条里“原来的草”一样长：原来的草只有一种。',
    build: gr({ mode: 0, r: 0, k1: 10, d1: 20, k2: 15, d2: 10, k3: 25, t3: 1 }),
    predict: { q: '先猜：25 头牛比 15 头牛多，能吃几天？', options: [{ v: 0, label: '6 天（10 × 15 ÷ 25）' }, { v: 1, label: '比 6 天少' }, { v: 2, label: '比 6 天多' }], answer: 1 },
    milestones: [
      ms('r', '草每天长 5 份', 4, 'r', 5, ['两次比一比：第一次多吃了 10 天，多吃了 200 − 150 = 50 份。', '这 50 份是那 10 天新长的。', '每天长 5 份。']),
      ms('t', '25 头牛 5 天吃完', 4, 't3', 5, ['原来 100 份，每天长 5 份。', '25 头牛每天吃 25 份，草每天净少 25 − 5 = 20 份。', '100 ÷ 20 = 5 天。']),
    ],
    goal: ['r', 't'],
    why: '10 头牛 20 天吃了 200 份，15 头牛 10 天吃了 150 份。多吃的 50 份，是多出来的 10 天新长的，所以每天长 5 份，原来有 200 − 20 × 5 = 100 份。25 头牛里有 5 头正好吃掉每天新长的，剩下 20 头吃原来的 100 份：5 天。',
  });
  add({
    id: 'gr-27-23-21', essence: ['E4', 'E7'], title: '牧场：27 头牛 6 天吃完，23 头牛 9 天吃完。21 头牛几天吃完？', grade: 6, rung: 5, alias: ['牛吃草', '牧场'],
    hook: '先找草每天长几份（两根长条里原来的草一样长），再改第三行的天数。',
    build: gr({ mode: 0, r: 0, k1: 27, d1: 6, k2: 23, d2: 9, k3: 21, t3: 1 }),
    milestones: [
      ms('r', '草每天长 15 份', 4, 'r', 15, ['23 × 9 = 207，27 × 6 = 162。', '多 3 天，多吃 45 份。', '每天长 45 ÷ 3 = 15 份。']),
      ms('t', '21 头牛 12 天吃完', 4, 't3', 12, ['原来 162 − 6 × 15 = 72 份。', '21 头牛每天净少 21 − 15 = 6 份。', '72 ÷ 6 = 12 天。']),
    ],
    goal: ['r', 't'],
    why: '207 − 162 = 45 份是多出来的 3 天长的，每天长 15 份，原来 162 − 6 × 15 = 72 份。21 头牛里 15 头吃新长的，6 头吃原来的 72 份：12 天。',
  });
  add({
    id: 'gr-day-by-day', essence: ['E4', 'E7'], title: '原来有 60 份草，每天长 4 份。几头牛正好 6 天吃完？', grade: 5, rung: 3, alias: ['牛吃草', '一天一天'],
    hook: '一天一天看：每天早上的草量画成柱子。改牛的头数，让第 6 天正好吃完（最后一天也正好吃饱）。',
    build: gr({ mode: 1, g: 60, r: 4, k: 1 }),
    milestones: [ms('d', '14 头牛正好 6 天吃完', 6, 'exact', 6, ['每天净少（牛数 − 4）份。', '6 天要吃掉原来的 60 份：每天净少 10 份。', '10 + 4 = 14 头牛。'])],
    goal: ['d'],
    why: '6 天吃完原来的 60 份，每天要净少 10 份；草每天还长 4 份，所以要 10 + 4 = 14 头牛。牛不超过 4 头，草就永远吃不完。',
  });
  U.problems.push.apply(U.problems, P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
