/* “凑十与拆数”的题（一年级）。点圆片挪过去、划掉，点缝分开。判分只看器材的输出。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const mb = (props) => () => { const s = W.blank(); const id = W.add(s, 'makebench', 40, 50, props); s.entities[id].role = 'k'; return s; };
  const P = [];
  const base = { domain: '数与运算', level: 'core', shelf: ['makebench'], traps: [], predict: null };
  const add = (o) => P.push(Object.assign({}, base, o));
  const ms = (id, say, score, port, value, hints) => ({ id, say, score, when: { role: 'k', port, op: '=', value: String(value) }, hints });

  add({
    id: 'mk-8-5', essence: ['E2'], title: '8 + 5：凑成十再加', grade: 1, rung: 2, points: ['1.9'],
    topics: ['凑十法', '20 以内进位加法'], alias: ['凑十', '十格框'],
    hook: '左边十格框里 8 个，还空几格？点右边的蓝片挪过去，把左边凑满。5 拆成了几和几？',
    build: mb({ mode: 0, a: 8, b: 5 }),
    milestones: [ms('ten', '挪过去 2 个，凑成十', 3, 'moved', 2, ['8 还差 2 个满十。', '点 2 个蓝片。', '5 拆成 2 和 3。']), ms('sum', '8 + 5 = 13', 5, 'sum', 13, ['左边满了是 10。', '右边还剩 3 个。', '10 + 3 = 13。'])],
    goal: ['sum'],
    why: '8 差 2 满十，就把 5 拆成 2 和 3：8 + 2 = 10，10 + 3 = 13。凑成十，后面就好加了。',
  });
  add({
    id: 'mk-15-7', essence: ['E2'], title: '15 − 7：破十还是平十？', grade: 1, rung: 3, points: ['1.9'],
    topics: ['破十法', '平十法', '20 以内退位减法'], alias: ['破十', '平十', '十格框'],
    hook: '15 是满满一框 10 个，外面 5 个。要划掉 7 个：可以都从框里划（破十），也可以先把外面的 5 个划完再划框里的（平十）。',
    build: mb({ mode: 1, a: 15, b: 7 }),
    milestones: [ms('diff', '15 − 7 = 8', 6, 'diff', 8, ['一共划掉 7 个。', '从框里划 7 个：10 − 7 = 3，3 + 5 = 8。', '还剩 8 个。'])],
    goal: ['diff'],
    why: '破十：10 − 7 = 3，3 + 5 = 8。平十：15 − 5 = 10，10 − 2 = 8。两种方法都把一个难的减法拆成两个容易的。',
  });
  add({
    id: 'mk-split-7', essence: ['E2', 'E6'], title: '7 可以分成几和几？', grade: 1, rung: 2, points: ['1.3'],
    topics: ['数的分与合'], alias: ['分与合', '拆数', '几和几'],
    hook: '7 个圆片排成一排。点两个圆片之间的缝，把它们分成两份。一共有几种分法？都找出来。',
    build: mb({ mode: 2, n: 7 }),
    milestones: [ms('all', '找全了：7 有 6 种分法', 6, 'all', 1, ['从左边起，第 1 条缝：1 和 6。', '一条缝一条缝地点。', '1 和 6、2 和 5……6 和 1。'])],
    goal: ['all'],
    why: '7 个排成一排，中间有 6 条缝，每条缝是一种分法：1 和 6、2 和 5、3 和 4、4 和 3、5 和 2、6 和 1。一份多 1，另一份就少 1。',
  });
  U.problems.push.apply(U.problems, P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
