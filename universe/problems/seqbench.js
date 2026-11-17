/* “数列与规律”的题。点“再摆一个”、改规律里的两个数、改 n。判分只看器材的输出。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const sb = (props) => () => { const s = W.blank(); const id = W.add(s, 'seqbench', 40, 50, props); s.entities[id].role = 'sq'; return s; };
  const P = [];
  const base = { domain: '关系', level: 'core', shelf: ['seqbench'], traps: [], predict: null };
  const add = (o) => P.push(Object.assign({}, base, o));
  const ms = (id, say, score, port, value, hints) => ({ id, say, score, when: { role: 'sq', port, op: '=', value: String(value) }, hints });

  add({
    id: 'sq-matches-10', essence: ['E6', 'E8'], title: '火柴摆 10 个正方形，要几根？', grade: 4, rung: 3, points: ['1.16'],
    topics: ['找规律', '火柴棒'], alias: ['找规律', '火柴', '第 n 个'],
    hook: '1 个正方形 4 根火柴。再摆几个看看：每多一个正方形，多几根？找到规律，再算第 10 个。',
    build: sb({ kind: 0, k: 1, a: 0, d: 0, n: 10 }),
    predict: { q: '10 个正方形要几根火柴？', options: [{ v: '40', label: '40 根' }, { v: '31', label: '31 根' }, { v: '30', label: '30 根' }], answer: '31' },
    milestones: [ms('rule', '规律：第 1 个 4 根，以后每个多 3 根', 4, 'd', 3, ['点“再摆一个”，摆到第 3 个。', '4、7、10：每次多 3。', '规律里填 4 和 3。']), ms('ten', '第 10 个要 31 根', 4, 'term', 31, ['4 + (10 − 1) × 3。', '4 + 27。', '31。'])],
    goal: ['ten'],
    why: '第一个正方形 4 根，后面每个和前一个共用一条边，只要再加 3 根。第 n 个是 4 + (n − 1) × 3 = 3n + 1，第 10 个是 31，不是 4 × 10 = 40。',
  });
  add({
    id: 'sq-tables-n', essence: ['E6', 'E8'], title: 'n 张桌子拼成一排，能坐几人？', grade: 5, rung: 3, points: ['5.5'],
    topics: ['找规律', '用字母表示数'], alias: ['找规律', '桌子拼起来', '用字母表示'],
    hook: '一张桌子坐 4 人。两张拼起来坐几人？三张呢？找到规律，算 25 张桌子能坐几人。',
    build: sb({ kind: 1, k: 1, a: 0, d: 0, n: 25 }),
    milestones: [ms('n25', '25 张桌子坐 52 人', 6, 'term', 52, ['4、6、8：每多一张桌子多 2 人。', '规律：第 1 个 4，每个多 2。', '4 + 24 × 2 = 52。'])],
    goal: ['n25'],
    why: '拼起来以后，中间接头的地方坐不了人：每多一张桌子只多上下 2 人。n 张桌子坐 4 + (n − 1) × 2 = 2n + 2 人。',
  });
  U.problems.push.apply(U.problems, P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
