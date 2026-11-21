/* “状态图”的题：玩谜题，看状态图怎么长出来。判分只看器材的输出。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const sb = (props) => () => { const s = W.blank(); const id = W.add(s, 'statebench', 40, 50, props); s.entities[id].role = 'sg'; return s; };
  const P = [];
  const base = { domain: '关系', level: 'core', shelf: ['statebench'], traps: [], predict: null };
  const add = (o) => P.push(Object.assign({}, base, o));
  const ms = (id, say, score, port, value, hints) => ({ id, say, score, when: { role: 'sg', port, op: '=', value: String(value) }, hints });
  add({
    id: 'sg-river', essence: ['E7', 'E6'], title: '农夫带狼、羊、菜过河，船上只能带一样。怎么过？', grade: 3, rung: 4, points: ['2.14b'],
    topics: ['推理', '状态图'], alias: ['过河', '狼羊菜', '状态图'],
    hook: '农夫不在，狼会吃羊，羊会吃菜。走错了状态图上会出现红点：退一步换个走法。走到全部过河。',
    build: sb({ puz: 1 }),
    milestones: [ms('dead', '走进过一次死路（红点）', 1, 'dead', 1, ['先带狼过去试试。', '狼羊菜里留下谁会出事？', '退一步。']), ms('reach', '全部过河', 5, 'reached', 1, ['第一趟只能带羊。', '回来再带狼（或菜）过去，把羊带回来。', '最后再接羊。']), ms('few', '用最少的 7 步', 2, 'fewest', 1, ['不要来回白跑。', '点“看全部”看最短的路。', '7 步。'])],
    goal: ['reach'],
    why: '第一趟只能带羊（狼和菜在一起没事）。关键的一步是把羊再带回来：羊、狼、菜里，只有羊跟谁都不能单独待着。状态图上一共只有十几种局面，最短的路是 7 步。',
  });
  add({
    id: 'sg-hanoi', essence: ['E7', 'E6'], title: '3 个盘子的汉诺塔，最少几步？', grade: 4, rung: 4, points: ['1.16'],
    topics: ['递推', '状态图'], alias: ['汉诺塔', '最少几步'],
    hook: '大盘不能压小盘。先想：要搬最大的盘，上面两个得先挪到哪里？走到右柱，再看状态图里最短的路。',
    build: sb({ puz: 2, pa: 3 }),
    milestones: [ms('reach', '3 个盘子都到了右柱', 4, 'reached', 1, ['小盘先去右柱。', '中盘去中柱，小盘叠上去。', '大盘去右柱，再搬上面两个。']), ms('few', '用最少的 7 步', 4, 'fewest', 1, ['两个盘子要 3 步。', '3 + 1 + 3 = 7。', '点“看全部”看最短的路。'])],
    goal: ['few'],
    why: '要搬最大的盘，先把上面 2 个搬走（3 步），搬大盘（1 步），再把 2 个搬回来（3 步）：3 + 1 + 3 = 7。n 个盘子要 2 × (n − 1 个的步数) + 1。状态图有 27 种局面，最短的路正好 7 步。',
  });
  add({
    id: 'sg-nim', essence: ['E7', 'E6'], title: '10 颗石子，轮流拿 1 到 3 颗，拿到最后一颗的赢。你先拿，怎样必赢？', grade: 5, rung: 5, points: ['2.14b'],
    topics: ['对策', '倒推'], alias: ['取石子', '必胜', '抢 10'],
    hook: '先点“往回标”，从 0 颗开始一颗一颗往回标：留给对方几颗，对方就一定输？找到规律以后，再跟电脑玩一局，赢它。',
    build: sb({ puz: 3, pa: 10, pb: 3 }),
    milestones: [ms('mark', '从 0 标到 10', 3, 'marked', 11, ['0 颗时轮到谁谁就输了。', '1、2、3 颗能一步拿光：必胜。', '4 颗怎么拿都留给对方必胜：必败。']), ms('won', '赢了电脑', 5, 'won', 1, ['必败是 0、4、8。', '第一次拿 2 颗，留下 8。', '以后对方拿几，你就拿 4 减几。'])],
    goal: ['won'],
    why: '0 颗轮到谁谁输；能一步留给对方必败的就是必胜。往回标，必败是 0、4、8……也就是 4 的倍数（每次最多拿 3，一轮两人凑成 4）。10 颗先拿 2 颗留下 8，以后对方拿几颗你就拿 4 减几，最后一颗一定是你的。',
  });
  U.problems.push.apply(U.problems, P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
