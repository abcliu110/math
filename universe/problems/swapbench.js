/* “换一换”的题（鸡兔同笼的假设法）。开场都是“全是甲”或“全是乙”：学生一个一个换，看总数怎么变，换到正好。
 * 全部可以在图上直接完成。判分只看器材的输出（乙有几个、总数对不对）。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const sw = (props) => () => { const s = W.blank(); const id = W.add(s, 'swapbench', 40, 50, props); s.entities[id].role = 's'; return s; };
  const P = [];
  const base = { domain: '关系', level: 'core', shelf: ['swapbench'], traps: [], predict: null };
  const add = (o) => P.push(Object.assign({}, base, o));
  const ms = (id, say, score, port, value, hints) => ({ id, say, score, when: { role: 's', port, op: '=', value: String(value) }, hints });

  add({
    id: 'sw-8-26', essence: ['E7', 'E4'], title: '8 个头，26 条腿', grade: 4, rung: 2, points: ['4.16'],
    topics: ['鸡兔同笼', '假设法'], alias: ['鸡兔同笼', '假设法'],
    hook: '笼子里有鸡和兔，一共 8 个头、26 条腿。先假设全是鸡：只有 16 条腿，不够。点一只鸡，把它换成兔，看腿数怎么变。',
    build: sw({ n: 8, k: 0, target: 26, la: 2, lb: 4 }),
    predict: { q: '把一只鸡换成兔，腿数多几条？', options: [{ v: '2', label: '2 条' }, { v: '4', label: '4 条' }, { v: '6', label: '6 条' }], answer: '2' },
    milestones: [ms('hit', '腿数正好 26', 5, 'ok', 1, ['每换一只多 2 条腿。', '差 10 条，要换几只？', '10 ÷ 2 = 5 只。']), ms('five', '兔有 5 只', 4, 'b', 5, ['数一数橙色的。', '5 只。', '鸡有 3 只。'])],
    goal: ['hit', 'five'],
    why: '假设全是鸡：8 × 2 = 16 条腿，比 26 少 10 条。每把一只鸡换成兔多 2 条，10 ÷ 2 = 5，所以兔 5 只、鸡 3 只。右边的表里，相邻两行总是差 2。',
  });
  add({
    id: 'sw-from-rabbits', essence: ['E7', 'E4'], title: '反过来：先假设全是兔', grade: 4, rung: 3, points: ['4.16'],
    topics: ['鸡兔同笼', '假设法'], alias: ['鸡兔同笼', '假设法', '反过来假设'],
    hook: '还是 8 个头、26 条腿。这回开始全是兔：32 条腿，多了。点一只兔，把它换成鸡。',
    build: sw({ n: 8, k: 8, target: 26, la: 2, lb: 4 }),
    predict: { q: '从“全是兔”开始换，最后的答案会不一样吗？', options: [{ v: 'same', label: '一样' }, { v: 'diff', label: '不一样' }], answer: 'same' },
    milestones: [ms('hit', '腿数正好 26', 8, 'ok', 1, ['多了 6 条。', '每换一只少 2 条。', '换 3 只：兔剩 5 只。'])],
    goal: ['hit'],
    why: '假设全是兔：32 条腿，多 6 条。每把一只兔换成鸡少 2 条，6 ÷ 2 = 3，所以鸡 3 只、兔 5 只。从哪头假设都得到同一个答案。',
  });
  add({
    id: 'sw-boats', essence: ['E7', 'E4'], title: '大船小船：10 条船坐 46 人', grade: 4, rung: 3, points: ['4.16'],
    topics: ['鸡兔同笼', '假设法'], alias: ['大船小船', '租船', '假设法'],
    hook: '大船坐 6 人，小船坐 4 人，一共租了 10 条船，正好坐 46 人。大船几条？',
    build: sw({ n: 10, k: 0, target: 46, la: 4, lb: 6, na: '小船', nb: '大船', unit: '人', style: 1 }),
    milestones: [ms('hit', '正好坐 46 人', 5, 'ok', 1, ['全是小船坐 40 人。', '差 6 人，每换一条多 2 人。', '换 3 条。']), ms('big', '大船 3 条', 4, 'b', 3, ['数橙色的。', '3 条。', '小船 7 条。'])],
    goal: ['hit', 'big'],
    why: '全是小船：40 人，差 6 人。每把一条小船换成大船多坐 2 人，6 ÷ 2 = 3。和鸡兔同笼是同一道题：两种东西、总数固定、换一个差几。',
  });
  add({
    id: 'sw-basketball', essence: ['E7', 'E4'], title: '投中 10 个球，得 23 分', grade: 5, rung: 3, points: ['4.16'],
    topics: ['鸡兔同笼', '假设法'], alias: ['投篮', '两分球', '三分球', '假设法'],
    hook: '两分球和三分球一共投中 10 个，得了 23 分。三分球投中几个？',
    build: sw({ n: 10, k: 0, target: 23, la: 2, lb: 3, na: '两分', nb: '三分', unit: '分', style: 1 }),
    milestones: [ms('three', '三分球 3 个', 8, 'b', 3, ['全是两分球是 20 分。', '差 3 分，每换一个多 1 分。', '3 个。'])],
    goal: ['three'],
    why: '全是两分球：20 分，差 3 分。每把一个换成三分球多 1 分，所以三分球 3 个。每换一个的差越小，要换的就越多。',
  });
  add({
    id: 'sw-money', essence: ['E7', 'E4'], title: '12 张纸币，一共 85 元', grade: 5, rung: 3, points: ['4.16'],
    topics: ['鸡兔同笼', '假设法'], alias: ['人民币', '5 元 10 元', '假设法'],
    hook: '5 元和 10 元的纸币一共 12 张，共 85 元。10 元的有几张？',
    build: sw({ n: 12, k: 0, target: 85, la: 5, lb: 10, na: '5元', nb: '10元', unit: '元', style: 1 }),
    predict: { q: '全是 5 元的话是多少钱？', options: [{ v: 'a', label: '60 元' }, { v: 'b', label: '85 元' }, { v: 'c', label: '120 元' }], answer: 'a' },
    milestones: [ms('ten', '10 元的 5 张', 8, 'b', 5, ['全是 5 元是 60 元。', '差 25 元，每换一张多 5 元。', '5 张。'])],
    goal: ['ten'],
    why: '全是 5 元：60 元，差 25 元。每换成一张 10 元多 5 元，25 ÷ 5 = 5 张。',
  });
  add({
    id: 'sw-wheels', essence: ['E7', 'E4'], title: '三轮车和自行车：10 辆，24 个轮子', grade: 4, rung: 2, points: ['4.16'],
    topics: ['鸡兔同笼', '假设法'], alias: ['三轮车', '自行车', '假设法'],
    hook: '三轮车和自行车一共 10 辆，数一数有 24 个轮子。三轮车几辆？',
    build: sw({ n: 10, k: 0, target: 24, la: 2, lb: 3, na: '自行车', nb: '三轮车', unit: '个轮子' }),
    milestones: [ms('tri', '三轮车 4 辆', 8, 'b', 4, ['全是自行车是 20 个轮子。', '差 4 个，每换一辆多 1 个。', '4 辆。'])],
    goal: ['tri'],
    why: '全是自行车：20 个轮子，差 4 个。每换成一辆三轮车多 1 个，所以三轮车 4 辆。',
  });
  add({
    id: 'sw-bugs', essence: ['E7', 'E4'], title: '蜘蛛和蜻蜓：10 只，68 条腿', grade: 5, rung: 3, points: ['4.16'],
    topics: ['鸡兔同笼', '假设法'], alias: ['蜘蛛', '蜻蜓', '假设法'],
    hook: '蜘蛛 8 条腿，蜻蜓 6 条腿。一共 10 只、68 条腿。蜘蛛几只？',
    build: sw({ n: 10, k: 0, target: 68, la: 6, lb: 8, na: '蜻蜓', nb: '蜘蛛', unit: '条腿' }),
    milestones: [ms('sp', '蜘蛛 4 只', 8, 'b', 4, ['全是蜻蜓是 60 条腿。', '差 8 条，每换一只多 2 条。', '4 只。'])],
    goal: ['sp'],
    why: '全是蜻蜓：60 条腿，差 8 条。每换成一只蜘蛛多 2 条，8 ÷ 2 = 4。数变了，方法没变。',
  });
  add({
    id: 'sw-table', essence: ['E7', 'E2'], title: '不换到底，只看表能知道答案吗？', grade: 5, rung: 4, points: ['4.16'],
    topics: ['鸡兔同笼', '列表法', '找规律'], alias: ['列表法', '找规律', '鸡兔同笼'],
    hook: '20 个头、56 条腿。只换 2 只就停下来，看右边的表：每多一只兔，腿多几条？还差多少？算出来再一次拖到位。',
    build: sw({ n: 20, k: 0, target: 56, la: 2, lb: 4 }),
    predict: { q: '兔有几只？先算再做。', options: [{ v: '6', label: '6 只' }, { v: '8', label: '8 只' }, { v: '10', label: '10 只' }], answer: '8' },
    milestones: [ms('hit', '兔 8 只，腿正好 56', 8, 'b', 8, ['全是鸡 40 条，差 16 条。', '每只多 2 条：16 ÷ 2。', '拖把手到第 8 个后面。'])],
    goal: ['hit'],
    why: '表里每一行比上一行多 2：这是个固定的差。所以不用一个一个试，(56 − 40) ÷ 2 = 8 就直接算出来了。假设法就是把“试”变成“算”。',
  });
  U.problems.push.apply(U.problems, P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
