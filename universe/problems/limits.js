/* E7 极限与逼近：用取整器材一位一位逼近 √2，看“越来越近”和“正好等于”的区别。 */
(function (G) {
  'use strict';
  const U = G.U, mk = U.mkScene, P = [];
  P.push({
    id: 'approach-sqrt2', title: '√2 到底是多少？用取整一位一位逼近', grade: 8, domain: '数与运算', essence: ['E7', 'E3'], points: ['2.12'], topics: ['无理数', '近似', '逼近'],
    alias: ['开方', '近似数'], hook: '√2 写不成分数，也写不完。先用“取整”看精确到十分位，再精确到百分位，看它越来越靠近哪里。',
    shelf: ['num', 'sqrt', 'round', 'meter', 'compare'],
    build: mk({ ents: [
      { type: 'num', x: 60, y: 260, role: 'two', props: { n: 2 } },
      { type: 'sqrt', x: 220, y: 100, role: 'r', props: {} },
      { type: 'round', x: 420, y: 100, role: 'k', props: { place: 0, mode: 0, show: 1 } },
    ], links: [['two', 'r', 'v'], ['r', 'k', 'v']] }),
    predict: { q: '先猜：精确到百分位，√2 约等于——', options: [{ v: 1.41, label: '1.41' }, { v: 1.5, label: '1.5' }, { v: 1.4, label: '1.4' }], reveal: () => ({ v: 1.41, label: '1.41（1.414…）' }) },
    goal: ['tenth', 'hund'],
    milestones: [
      { id: 'tenth', say: '精确到十分位：1.4', score: 3, when: (w) => w.some('round', (e) => e.props.place === -1 && w.num(e, 'r') === 1.4), hints: ['√2 的十分位要看百分位那一位。', '把“精确到”设为 -1（十分位）。', '1.4。'] },
      { id: 'hund', say: '精确到百分位：1.41', score: 7, when: (w) => w.some('round', (e) => e.props.place === -2 && w.num(e, 'r') === 1.41), hints: ['把“精确到”改成 -2。', '千分位是 4，舍掉。', '1.41。'] },
    ],
    traps: [{ id: 'far', when: (w) => w.some('round', (e) => w.num(e, 'r') === 1.5), wrong: '1.5 比 √2 大太多，取整把它“推”过去了。' }],
    why: '√2 是无理数，小数无限不循环。精确到的位数越多，取整结果越靠近它，但永远不会正好相等。这就是“无限靠近”，极限的核心。',
    ref: ['sqrt|0', 'round|0'],
  });
  U.problems.push(...P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
