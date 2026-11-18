/* “倒水”的题。点按钮装满、倒空、从一个杯子倒进另一个。判分只看器材的输出。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const pb = (props) => () => { const s = W.blank(); const id = W.add(s, 'pourbench', 40, 50, props); s.entities[id].role = 'pb'; return s; };
  const P = [];
  const base = { domain: '数与运算', level: 'core', shelf: ['pourbench'], traps: [], predict: null };
  const add = (o) => P.push(Object.assign({}, base, o));
  const ms = (id, say, score, port, value, hints) => ({ id, say, score, when: { role: 'pb', port, op: '=', value: String(value) }, hints });
  add({
    id: 'pb-9-4-1', essence: ['E5', 'E2'], title: '只用 9 升和 4 升的杯子，怎么量出 1 升？', grade: 4, rung: 3, points: ['8.7'],
    topics: ['倒水', '量出'], alias: ['倒水', '量出', '1 升'],
    hook: '杯子上没有刻度，只能装满、倒空、从一个倒进另一个。9 里面去掉两个 4，剩几？',
    build: pb({ A: 9, B: 4, tgt: 1 }),
    milestones: [ms('hit', '量出 1 升', 6, 'hit', 1, ['先把 9 升杯装满。', '倒进 4 升杯，倒空 4 升杯，再倒一次。', '9 − 4 − 4 = 1。']), ms('few', '只用 4 步', 3, 'fewest', 1, ['装满、倒、倒空、倒。', '不要多做没用的步。', '4 步。'])],
    goal: ['hit'],
    why: '9 升杯装满，往 4 升杯里倒两回（中间把 4 升杯倒空），9 − 4 − 4 = 1。量水就是用两个杯子的容量做加减。',
  });
  add({
    id: 'pb-8-5-2', essence: ['E5', 'E2'], title: '只用 8 升和 5 升的杯子，怎么量出 2 升？', grade: 5, rung: 4, points: ['8.7'],
    topics: ['倒水', '量出'], alias: ['倒水', '量出', '2 升'],
    hook: '5 + 5 = 10，比 8 多 2。用 5 升杯往 8 升杯里倒两回试试。',
    build: pb({ A: 8, B: 5, tgt: 2 }),
    milestones: [ms('hit', '量出 2 升', 6, 'hit', 1, ['装满 5 升杯，倒进 8 升杯。', '再装满 5 升杯，往 8 升杯里倒：只倒得进 3 升。', '5 升杯里剩 2 升。']), ms('few', '只用 4 步', 3, 'fewest', 1, ['装满、倒、装满、倒。', '8 升杯不用倒空。', '4 步。'])],
    goal: ['hit'],
    why: '两次 5 升一共 10 升，8 升杯只装得下 8 升，多出来的 2 升留在 5 升杯里：5 + 5 − 8 = 2。',
  });
  U.problems.push.apply(U.problems, P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
