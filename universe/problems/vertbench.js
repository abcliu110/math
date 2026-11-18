/* “竖式（加减与除法）”的题。学生点数字键一位一位写，进位、退位自己点；除法一步一步试商。
 * 全部可以在图上直接完成。判分只看器材的输出（算完了没有、得数、商和余数）。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const vb = (props) => () => { const s = W.blank(); const id = W.add(s, 'vertbench', 40, 50, props); s.entities[id].role = 'v'; return s; };
  const P = [];
  const base = { domain: '数与运算', level: 'core', shelf: ['vertbench'], traps: [], predict: null };
  const add = (o) => P.push(Object.assign({}, base, o));
  const ms = (id, say, score, port, value, hints) => ({ id, say, score, when: { role: 'v', port, op: '=', value: String(value) }, hints });

  add({
    id: 'vt-47-38', essence: ['E2', 'E7'], title: '47 + 38：个位满十，进 1', grade: 2, rung: 2, points: ['2.2'],
    topics: ['进位加法', '笔算加法'], alias: ['进位', '竖式加法'],
    hook: '从个位算起：7 + 8 = 15，个位写几？满十的那 1 去哪了？先点十位上面的小圆圈“进 1”，再写十位。',
    build: vb({ mode: 0, a: 47, b: 38 }),
    predict: { q: '47 + 38 等于几？', options: [{ v: '75', label: '75' }, { v: '85', label: '85' }, { v: '715', label: '715' }], answer: '85' },
    milestones: [ms('done', '47 + 38 = 85', 8, 'result', 85, ['个位 7 + 8 = 15，写 5。', '点十位上面的小圆圈，进 1。', '十位 4 + 3 + 1 = 8。'])],
    goal: ['done'],
    why: '个位 7 + 8 = 15，是 1 个十和 5 个一：个位写 5，那 1 个十要加到十位上。十位 4 + 3 + 1 = 8。进位就是“满十，往前一位送 1”。',
  });
  add({
    id: 'vt-52-27', essence: ['E2', 'E7'], title: '52 − 27：个位不够减，退 1', grade: 2, rung: 2, points: ['2.2'],
    topics: ['退位减法', '笔算减法'], alias: ['退位', '借位', '竖式减法'],
    hook: '个位 2 减 7 不够减。先点十位上面的小圆圈“退 1”：十位少 1，个位多 10。再一位一位写。',
    build: vb({ mode: 1, a: 52, b: 27 }),
    predict: { q: '52 − 27 等于几？', options: [{ v: '35', label: '35' }, { v: '25', label: '25' }, { v: '15', label: '15' }], answer: '25' },
    milestones: [ms('done', '52 − 27 = 25', 8, 'result', 25, ['2 不够减 7：点十位上面的小圆圈。', '个位 12 − 7 = 5。', '十位 4 − 2 = 2。'])],
    goal: ['done'],
    why: '个位 2 不够减 7，从十位借 1 个十：个位变成 12，十位剩 4。12 − 7 = 5，4 − 2 = 2。',
  });
  add({
    id: 'vt-300-125', essence: ['E2', 'E7'], title: '300 − 125：中间是 0 怎么退位', grade: 3, rung: 3, points: ['2.2'],
    topics: ['连续退位', '笔算减法'], alias: ['连续退位', '0 的退位'],
    hook: '个位 0 不够减 5，向十位借；可十位也是 0。点十位“退 1”，十位变成 −1 也不够，再点百位“退 1”。看看十位最后是几。',
    build: vb({ mode: 1, a: 300, b: 125 }),
    milestones: [ms('done', '300 − 125 = 175', 8, 'result', 175, ['先点十位，再点百位。', '个位 10 − 5 = 5。', '十位 9 − 2 = 7，百位 2 − 1 = 1。'])],
    goal: ['done'],
    why: '300 里借 1 个百给十位，十位变成 10；再从十位借 1 个十给个位：十位剩 9，个位是 10。10 − 5 = 5，9 − 2 = 7，2 − 1 = 1。',
  });
  add({
    id: 'vt-58-67', essence: ['E2', 'E7'], title: '58 + 67：连续进位', grade: 2, rung: 3, points: ['2.2'],
    topics: ['连续进位', '笔算加法'], alias: ['连续进位', '竖式加法'],
    hook: '个位满十进 1，十位加上进的 1 又满十了。一位一位算，别忘了最后一位。',
    build: vb({ mode: 0, a: 58, b: 67 }),
    milestones: [ms('done', '58 + 67 = 125', 8, 'result', 125, ['8 + 7 = 15，写 5 进 1。', '5 + 6 + 1 = 12，写 2 进 1。', '百位写 1。'])],
    goal: ['done'],
    why: '个位 15 写 5 进 1；十位 5 + 6 + 1 = 12 写 2 进 1；百位只有进来的 1。和是 125，比两个加数都多一位。',
  });
  add({
    id: 'vt-fill-81', essence: ['E2', 'E7'], title: '□3 + 4□ = 81：□ 里是几？', grade: 3, rung: 3, points: ['2.2'],
    topics: ['填缺数字', '进位加法'], alias: ['填数', '竖式谜', '进位'],
    hook: '先看个位：3 + □ 的个位是 1，□ 是几？有没有进位？再看十位。点一个 □，再点数字键。',
    build: vb({ mode: 3, fa: '?3', fb: '4?', fr: '81' }),
    milestones: [ms('ok', '填对了：33 + 48 = 81', 8, 'ok', 1, ['个位：3 + 8 = 11，写 1 进 1。', '十位：□ + 4 + 1 = 8。', '□ 是 3。'])],
    goal: ['ok'],
    why: '个位 3 + □ 的个位是 1，只能是 3 + 8 = 11，进 1；十位 □ + 4 + 1 = 8，□ = 3。从能确定的那一位先想，进位别忘了。',
  });
  add({
    id: 'vt-fill-sub', essence: ['E2', 'E7'], title: '7□ − □8 = 25：□ 里是几？', grade: 3, rung: 4, points: ['2.2'],
    topics: ['填缺数字', '退位减法'], alias: ['填数', '竖式谜', '退位'],
    hook: '个位：□ − 8 的个位是 5，够减吗？要不要退位？',
    build: vb({ mode: 3, fa: '7?', fb: '?8', fr: '25', fop: 1 }),
    milestones: [ms('ok', '填对了：73 − 48 = 25', 8, 'ok', 1, ['个位不够减：退 1，13 − 8 = 5。', '个位的 □ 是 3。', '十位：7 − 1 − □ = 2，□ 是 4。'])],
    goal: ['ok'],
    why: '个位 □ − 8 得 5，□ 比 8 小，要退位：13 − 8 = 5，□ = 3。十位退了 1：6 − □ = 2，□ = 4。',
  });
  add({
    id: 'vt-bug-47', essence: ['E2', 'E7'], title: '小明算 47 + 38 = 75，错在哪？', grade: 2, rung: 3, points: ['2.2'],
    topics: ['找错', '进位加法'], alias: ['找错', '进位', '订正'],
    hook: '小明的竖式里有一位写错了。一位一位重新算：个位对吗？十位呢？点写错的那一位，再改对。',
    build: vb({ mode: 4, a: 47, b: 38, bop: 0, wrong: '75', why: '个位满十，进的 1 忘了加到十位上' }),
    milestones: [ms('fixed', '十位错了，改成 8：47 + 38 = 85', 8, 'fixed', 1, ['个位 7 + 8 = 15，写 5，进 1。', '十位 4 + 3 再加进的 1。', '十位是 8。'])],
    goal: ['fixed'],
    why: '个位 7 + 8 = 15，写 5 进 1；十位 4 + 3 + 1 = 8。小明忘了加进上来的 1，十位写成了 7。检查竖式就是一位一位重新算，特别看进位。',
  });
  U.problems.push.apply(U.problems, P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
