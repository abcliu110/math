/* 计数块与数位的题（docs/instrument-design.md 第 4 节）。开场都没到目标：学生自己往栏里拖块、十个捆成一个、一个拆成十个。
 * 全部可以在图上直接完成。判分只看器材的输出（表示的数、每一位有几个、是不是每位都不超过 9）。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const bk = (props) => () => { const s = W.blank(); const id = W.add(s, 'blocksbench', 40, 40, props); s.entities[id].role = 'k'; return s; };
  const P = [];
  const base = { domain: '数与运算', level: 'core', shelf: ['blocksbench'], traps: [], predict: null };
  const add = (o) => P.push(Object.assign({}, base, o));
  const ms = (id, say, score, port, value, hints) => ({ id, say, score, when: { role: 'k', port, op: '=', value: String(value) }, hints });

  add({
    id: 'bk-make-16', essence: ['E1', 'E5'], title: '摆出 16', grade: 1, rung: 1, points: ['1.7'],
    topics: ['11–20 各数的认识'], alias: ['数的组成', '十几', '数位'],
    hook: '从下面往栏里拖块，摆出 16。用几个十、几个一？',
    build: bk({ h: 0, t: 0, o: 0 }),
    milestones: [ms('v', '摆出了 16', 8, 'value', 16, ['16 是 1 个十和 6 个一。', '拖一根长条到十位。', '再拖 6 个小方块到个位。'])],
    goal: ['v'],
    why: '16 = 1 个十 + 6 个一。十位上的 1 表示一个十，不是一个一。',
  });
  add({
    id: 'bk-make-34', essence: ['E1', 'E5'], title: '用最少的块摆出 34', grade: 1, rung: 2, points: ['1.13'],
    topics: ['100 以内数的认识'], alias: ['数的组成', '数位', '几个十几个一'],
    hook: '摆出 34。可以摆 34 个小方块，但那样太多了。最少用几个块？',
    build: bk({ h: 0, t: 0, o: 0 }),
    milestones: [ms('v', '摆出了 34', 4, 'value', 34, ['3 个十，4 个一。', '拖 3 根长条。', '再拖 4 个小方块。']), ms('few', '用了 3 根长条（十位 3 个）', 5, 'tens', 3, ['十个小方块可以换一根长条。', '34 里有 3 个十。', '十位 3，个位 4。'])],
    goal: ['v', 'few'],
    why: '34 = 3 个十 + 4 个一，一共 7 个块。每一位都不超过 9 个时，用的块最少，这也正是这个数的写法。',
  });
  add({
    id: 'bk-bundle', essence: ['E1', 'E5'], title: '2 个十和 14 个一是多少？', grade: 1, rung: 2, points: ['1.13'],
    topics: ['100 以内数的认识', '满十进一'], alias: ['满十进一', '数位', '进位'],
    hook: '个位那一栏放了 14 个，红了：一个数位写不下 14。把个位的块往左拖到十位，十个捆成一根。',
    build: bk({ h: 0, t: 2, o: 14 }),
    predict: { q: '2 个十和 14 个一，是多少？', options: [{ v: 'a', label: '214' }, { v: 'b', label: '34' }, { v: 'c', label: '24' }], answer: 'b' },
    milestones: [ms('std', '每一位都不超过 9 了', 8, 'standard', 1, ['个位有 14 个，够十个。', '把个位的块往左拖。', '十个捆成一个十：3 个十、4 个一。'])],
    goal: ['std'],
    why: '14 个一 = 1 个十 + 4 个一，所以 2 个十和 14 个一就是 3 个十和 4 个一：34。不能写成 214。',
  });
  add({
    id: 'bk-27-15', essence: ['E1', 'E5'], title: '27 + 15：个位满十了', grade: 2, rung: 2, points: ['2.3'],
    topics: ['100 以内的进位加法'], alias: ['进位加法', '满十进一', '竖式'],
    hook: '27 和 15 的块倒在了一起：十位 3 个，个位 12 个。整理到每一位都不超过 9，就是答案。',
    build: bk({ mode: 1, a: 27, b: 15, h: 0, t: 3, o: 12 }),
    milestones: [ms('std', '整理好了：42', 8, 'standard', 1, ['个位 12 个，超过 9。', '把个位的块往左拖。', '捆成 1 个十：4 个十、2 个一。'])],
    goal: ['std'],
    why: '7 + 5 = 12，个位写 2，向十位进 1；十位 2 + 1 + 1 = 4。竖式上那个小小的“1”，就是捆起来的这一根。',
  });
  add({
    id: 'bk-38-46', essence: ['E1', 'E5'], title: '38 + 46', grade: 2, rung: 2, points: ['2.3'],
    topics: ['100 以内的进位加法'], alias: ['进位加法', '满十进一'],
    hook: '十位 7 个，个位 14 个。整理它。',
    build: bk({ mode: 1, a: 38, b: 46, h: 0, t: 7, o: 14 }),
    predict: { q: '38 + 46 的十位是几？', options: [{ v: '7', label: '7' }, { v: '8', label: '8' }, { v: '9', label: '9' }], answer: '8' },
    milestones: [ms('std', '整理好了', 4, 'standard', 1, ['个位超过 9。', '往左拖。', '捆。']), ms('v', '答案是 84', 4, 'tens', 8, ['十位 7 + 1。', '8 个十。', '84。'])],
    goal: ['std', 'v'],
    why: '38 + 46 = 84。十位不是 3 + 4 = 7，因为个位进了 1。',
  });
  add({
    id: 'bk-156-87', essence: ['E1', 'E5'], title: '156 + 87：连着进两次', grade: 3, rung: 3, points: ['3.2'],
    topics: ['万以内的加法', '连续进位'], alias: ['连续进位', '三位数加法'],
    hook: '百位 1 个，十位 13 个，个位 13 个。两栏都红了。从哪一栏开始整理都可以吗？',
    build: bk({ mode: 1, a: 156, b: 87, h: 1, t: 13, o: 13 }),
    milestones: [ms('std', '整理好了：243', 8, 'standard', 1, ['个位捆一次。', '十位再捆一次。', '2 个百、4 个十、3 个一。'])],
    goal: ['std'],
    why: '156 + 87 = 243。先捆个位或先捆十位，结果一样；竖式规定从个位开始，是因为这样每一位只用写一次。',
  });
  add({
    id: 'bk-break-ten', essence: ['E1', 'E5'], title: '52 − 7：个位不够减', grade: 2, rung: 3, points: ['2.3'],
    topics: ['100 以内的退位减法'], alias: ['退位减法', '破十', '借位'],
    hook: '52 是 5 个十、2 个一。要拿走 7 个一，个位只有 2 个，不够。把一根长条往右拖到个位，拆成十个。',
    build: bk({ mode: 1, a: 52, b: 0, h: 0, t: 5, o: 2 }),
    predict: { q: '拆开一个十以后，52 变了吗？', options: [{ v: 'n', label: '没变，还是 52' }, { v: 'y', label: '变小了' }, { v: 'b', label: '变大了' }], answer: 'n' },
    milestones: [ms('o12', '个位有 12 个了', 8, 'ones', 12, ['十位的一根可以换十个小方块。', '把十位的块往右拖。', '4 个十、12 个一。'])],
    goal: ['o12'],
    why: '52 = 4 个十 + 12 个一。数没变，只是换了一种摆法，现在个位够拿走 7 个了：12 − 7 = 5，答案是 45。竖式里的“借 1 当 10”就是这一步。',
  });
  add({
    id: 'bk-hundred', essence: ['E1', 'E5'], title: '1 个百是几个十？', grade: 2, rung: 2, points: ['2.12'],
    topics: ['1000 以内数的认识'], alias: ['数位', '百', '十进制'],
    hook: '百位有一块大的。把它往右拖到十位，看它变成几根。',
    build: bk({ mode: 1, a: 100, b: 0, h: 1, t: 0, o: 0 }),
    milestones: [ms('t10', '十位有 10 个', 8, 'tens', 10, ['往右拖是“拆”。', '把大方块拖到十位。', '1 个百 = 10 个十。'])],
    goal: ['t10'],
    why: '1 个百 = 10 个十 = 100 个一。相邻两个数位之间，都是“十个换一个”。',
  });
  add({
    id: 'bk-205', essence: ['E1', 'E5'], title: '摆出 205：中间的 0 是什么？', grade: 2, rung: 2, points: ['2.12'],
    topics: ['1000 以内数的认识', '0 的占位'], alias: ['数位', '0 占位', '三位数'],
    hook: '摆出 205。十位那一栏放什么？',
    build: bk({ h: 0, t: 0, o: 0 }),
    milestones: [ms('v', '摆出了 205：十位一个也不放', 8, 'value', 205, ['2 个百，5 个一。', '十位一个也不放。', '拖 2 块大的、5 个小的。'])],
    traps: [{ id: 't25', wrong: '2 个十和 5 个一是 25，不是 205。205 的 2 在百位。', when: { role: 'k', port: 'value', op: '=', value: '25' } }],
    goal: ['v'],
    why: '205 = 2 个百 + 0 个十 + 5 个一。十位的 0 不能省：省掉就成了 25。0 在这里是“占住这个位置”。',
  });
  add({
    id: 'bk-other-way', essence: ['E1', 'E2'], title: '34 的另一种摆法', grade: 1, rung: 3, points: ['1.13'],
    topics: ['100 以内数的认识'], alias: ['数的组成', '拆', '数位'],
    hook: '现在是 3 个十、4 个一。只用“拆”，把它变成 2 个十和若干个一。数变了吗？',
    build: bk({ mode: 1, a: 34, b: 0, h: 0, t: 3, o: 4 }),
    milestones: [ms('t2', '十位只有 2 个', 8, 'tens', 2, ['把一根长条往右拖。', '它变成 10 个小方块。', '2 个十、14 个一。'])],
    goal: ['t2'],
    why: '34 = 3 个十 + 4 个一 = 2 个十 + 14 个一 = 1 个十 + 24 个一。同一个数有很多种摆法，写出来的只有一种。',
  });
  U.problems.push.apply(U.problems, P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
