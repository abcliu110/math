/* “盈亏问题”的题。点 − + 改人数，让两种分法需要的东西一样多。判分只看器材的输出。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const sb = (props) => () => { const s = W.blank(); const id = W.add(s, 'surplusbench', 40, 50, props); s.entities[id].role = 'sp'; return s; };
  const P = [];
  const base = { domain: '关系', level: 'core', shelf: ['surplusbench'], traps: [], predict: null, points: ['4.16'] };
  const add = (o) => P.push(Object.assign({}, base, o));
  const ms = (id, say, score, port, value, hints) => ({ id, say, score, when: { role: 'sp', port, op: '=', value: String(value) }, hints });
  add({
    id: 'sp-5-7', essence: ['E4', 'E7'], title: '分苹果：每人 5 个多 3 个，每人 7 个少 5 个。几个人？几个苹果？', grade: 5, rung: 3,
    topics: ['盈亏问题'], alias: ['盈亏', '分苹果', '多了少了'],
    hook: '上面每人 5 个，多出 3 个；下面每人 7 个，还差 5 个。改人数，直到上下两排要的苹果一样多。',
    build: sb({ a: 5, r1: 3, b: 7, r2: -5, n: 1, item: '个', who: '人' }),
    predict: { q: '先猜：有几个人？', options: [{ v: 4, label: '4 人' }, { v: 8, label: '8 人' }, { v: 2, label: '2 人' }], answer: 4 },
    milestones: [ms('n', '4 个人，23 个苹果', 6, 'total', 23, ['每人多分 2 个，一共要多出 3 + 5 = 8 个。', '8 里有几个 2？', '4 人：5 × 4 + 3 = 23。'])],
    goal: ['n'],
    why: '从每人 5 个改成每人 7 个，每人多要 2 个。原来多 3 个，后来差 5 个，前后一共差了 3 + 5 = 8 个。8 ÷ 2 = 4 人，苹果 5 × 4 + 3 = 23 个。“一共差的”就是“每人差的”攒起来的。',
  });
  add({
    id: 'sp-both-more', essence: ['E4', 'E7'], title: '分本子：每人 4 本多 22 本，每人 6 本多 6 本。几个人？', grade: 5, rung: 4,
    topics: ['盈亏问题', '两次都多'], alias: ['盈盈', '盈亏'],
    hook: '两次都有多的。每人多分 2 本，多出来的从 22 本变成 6 本：少了几本？',
    build: sb({ a: 4, r1: 22, b: 6, r2: 6, n: 1, item: '本', who: '人' }),
    milestones: [ms('n', '8 个人，54 本', 6, 'total', 54, ['每人多分 2 本。', '多的从 22 变 6，少了 16 本。', '16 ÷ 2 = 8 人。'])],
    goal: ['n'],
    why: '每人多分 2 本，多出来的就少了 22 − 6 = 16 本，所以有 16 ÷ 2 = 8 人，本子 4 × 8 + 22 = 54 本。两次都多，一共差的是两个“多”相减。',
  });
  U.problems.push.apply(U.problems, P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
