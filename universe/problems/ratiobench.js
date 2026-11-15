/* 分数条与比的题（docs/instrument-design.md 第 4 节）。开场都没到目标：学生自己切条、拖涂色的边、拖数轴上的点。
 * 全部可以在图上直接完成。判分只看器材的输出（两个分数、谁大、差多少、下面对着的数……）。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const rb = (props) => () => { const s = W.blank(); const id = W.add(s, 'ratiobench', 40, 60, props); s.entities[id].role = 'r'; return s; };
  const P = [];
  const base = { domain: '数与运算', level: 'core', shelf: ['ratiobench'], traps: [], predict: null };
  const add = (o) => P.push(Object.assign({}, base, o));
  const ms = (id, say, score, port, value, hints) => ({ id, say, score, when: { role: 'r', port, op: '=', value: String(value) }, hints });

  add({
    id: 'rb-half-third', essence: ['E3', 'E1'], title: '1/2 和 1/3，谁大？', grade: 3, rung: 2, points: ['3.7'],
    topics: ['分数的初步认识', '比较分数的大小'], alias: ['分数', '比大小', '几分之一'],
    hook: '甲条切成 2 份，乙条切成 3 份。把两条各涂 1 份，上下一比，谁长？',
    build: rb({ d1: 2, n1: 0, d2: 3, n2: 0 }),
    predict: { q: '1/2 和 1/3，谁大？', options: [{ v: 'a', label: '1/2 大' }, { v: 'b', label: '1/3 大（3 比 2 大）' }, { v: 'c', label: '一样大' }], answer: 'a' },
    milestones: [ms('a', '甲涂 1/2', 3, 'a', '1/2', ['拖甲条左边的把手。', '往右拖一格。', '涂 1 份。']), ms('b', '乙涂 1/3', 3, 'b', '1/3', ['拖乙条的把手。', '往右一格。', '涂 1 份。']), ms('cmp', '1/2 比 1/3 大', 3, 'cmp', 1, ['看两条虚线。', '甲的虚线更靠右。', '1/2 > 1/3。'])],
    goal: ['a', 'b', 'cmp'],
    why: '同样长的一条，切的份数越多，每一份越小。所以 1/3 比 1/2 小，虽然 3 比 2 大。',
  });
  add({
    id: 'rb-equal-half', essence: ['E3', 'E2'], title: '2/4 和谁一样大？', grade: 5, rung: 2, points: ['5.10'],
    topics: ['等值分数'], alias: ['等值分数', '分数的基本性质'],
    hook: '甲是 2/4。乙条切成了 2 份：涂几份，和甲一样长？',
    build: rb({ d1: 4, n1: 2, d2: 2, n2: 0 }),
    milestones: [ms('eq', '两条一样长', 8, 'cmp', 0, ['让两条虚线对齐。', '拖乙条的把手。', '涂 1 份：1/2。'])],
    goal: ['eq'],
    why: '2/4 = 1/2。把 1/2 的每一份再切成两半，就得到 2/4：份数和取的份数同时乘 2，大小不变。',
  });
  add({
    id: 'rb-eighths', essence: ['E3', 'E2'], title: '把 3/4 写成八分之几', grade: 5, rung: 3, points: ['5.10'],
    topics: ['分数的基本性质', '通分'], alias: ['等值分数', '通分', '分数的基本性质'],
    hook: '甲是 3/4。把乙条切成 8 份，涂到和甲一样长。是八分之几？',
    build: rb({ d1: 4, n1: 3, d2: 4, n2: 0 }),
    milestones: [ms('cut8', '乙切成 8 份', 3, 'db', 8, ['点乙条右边的 ＋。', '切到 8 份。', '点 4 下。']), ms('eq', '涂到一样长：6/8', 5, 'cmp', 0, ['让虚线对齐。', '拖乙的把手。', '6 份。'])],
    goal: ['cut8', 'eq'],
    why: '3/4 = 6/8。每一份切成两半，份数变成 8，涂的也从 3 份变成 6 份。分子分母同时乘 2。',
  });
  add({
    id: 'rb-diff', essence: ['E3', 'E2'], title: '3/4 比 2/3 大多少？', grade: 5, rung: 3, points: ['5.11'],
    topics: ['异分母分数比较', '异分母分数减法'], alias: ['比较分数', '通分', '分数减法'],
    hook: '做出 3/4 和 2/3。它们差得很少，看不清差多少。下面“通分”那一行会告诉你：都切成同样的份数再比。',
    build: rb({ d1: 4, n1: 0, d2: 3, n2: 0 }),
    predict: { q: '3/4 和 2/3 相差多少？', options: [{ v: 'a', label: '1/12' }, { v: 'b', label: '1/7' }, { v: 'c', label: '1' }], answer: 'a' },
    milestones: [ms('a', '甲是 3/4', 2, 'a', '3/4', ['拖甲的把手。', '涂 3 份。', '3/4。']), ms('b', '乙是 2/3', 2, 'b', '2/3', ['拖乙的把手。', '涂 2 份。', '2/3。']), ms('d', '相差 1/12', 5, 'diff', '1/12', ['都切成 12 份。', '9/12 和 8/12。', '差 1/12。'])],
    goal: ['a', 'b', 'd'],
    why: '3/4 = 9/12，2/3 = 8/12，差 1/12。分母不同不能直接减，先通分成同样大的小份。',
  });
  add({
    id: 'rb-make-one', essence: ['E3', 'E2'], title: '1/4 再加多少是 1？', grade: 3, rung: 2, points: ['3.7'],
    topics: ['同分母分数加法'], alias: ['分数加法', '凑成 1'],
    hook: '甲是 1/4。把乙条切成 4 份，涂到两条合起来正好是 1。',
    build: rb({ d1: 4, n1: 1, d2: 2, n2: 0 }),
    milestones: [ms('one', '合起来是 1', 8, 'sum', 1, ['一整条是 4 个 1/4。', '乙切成 4 份。', '涂 3 份：3/4。'])],
    goal: ['one'],
    why: '1/4 + 3/4 = 4/4 = 1。同分母的分数相加，分母不变，分子相加。',
  });
  add({
    id: 'rb-apples', essence: ['E6', 'E2'], title: '3 个 12 元，5 个多少元？', grade: 6, rung: 2, points: ['6.12'],
    topics: ['正比例', '单价、数量、总价'], alias: ['正比例', '单价', '归一'],
    hook: '上面是苹果的个数，下面是钱。绿线告诉你：3 个对着 12 元。把上面的点拖到 5，下面对着几？',
    build: rb({ mode: 1, pa: 3, pb: 12, tmax: 10, tstep: 1, t: 0, ua: '个', ub: '元' }),
    milestones: [ms('five', '5 个对着 20 元', 8, 'b', 20, ['先看 1 个对着几元。', '12 ÷ 3 = 4。', '把点拖到 5。'])],
    goal: ['five'],
    why: '3 个 12 元，1 个 4 元，5 个 20 元。两条数轴对齐：上面乘几，下面也乘几。这就是正比例。',
  });
  add({
    id: 'rb-28yuan', essence: ['E6', 'E2'], title: '28 元能买几个？', grade: 6, rung: 3, points: ['6.12'],
    topics: ['正比例'], alias: ['正比例', '单价', '反过来求'],
    hook: '还是 3 个 12 元。现在知道的是钱：28 元。拖上面的点，找到下面对着 28 的位置。',
    build: rb({ mode: 1, pa: 3, pb: 12, tmax: 10, tstep: 1, t: 0, ua: '个', ub: '元' }),
    milestones: [ms('seven', '28 元对着 7 个', 8, 'a', 7, ['1 个 4 元。', '28 里有几个 4？', '拖到 7。'])],
    traps: [],
    goal: ['seven'],
    why: '1 个 4 元，28 ÷ 4 = 7 个。同一张图，从上往下读是乘，从下往上读是除。',
  });
  add({
    id: 'rb-percent', essence: ['E6', 'E3'], title: '80 的 25% 是多少？', grade: 6, rung: 2, points: ['6.6'],
    topics: ['百分数的应用'], alias: ['百分数', '求一个数的百分之几'],
    hook: '上面是百分数，从 0 到 100；100% 对着 80。把点拖到 25%。',
    build: rb({ mode: 1, pa: 100, pb: 80, tmax: 100, tstep: 5, t: 0, ua: '%', ub: '' }),
    predict: { q: '80 的 25% 比 40 大还是小？', options: [{ v: 's', label: '小' }, { v: 'b', label: '大' }, { v: 'e', label: '正好 40' }], answer: 's' },
    milestones: [ms('q', '25% 对着 20', 8, 'b', 20, ['50% 是一半：40。', '25% 是一半的一半。', '拖到 25。'])],
    goal: ['q'],
    why: '100% 对着 80，50% 对着 40，25% 对着 20。百分数就是把整体看成 100 份的比例。',
  });
  add({
    id: 'rb-discount', essence: ['E6', 'E3'], title: '原价 50 元，打八折', grade: 6, rung: 2, points: ['6.10'],
    topics: ['折扣'], alias: ['折扣', '百分数', '打折'],
    hook: '打八折就是按原价的 80% 卖。100% 对着 50 元，把点拖到 80%。',
    build: rb({ mode: 1, pa: 100, pb: 50, tmax: 100, tstep: 10, t: 100, ua: '%', ub: '元' }),
    milestones: [ms('d', '80% 对着 40 元', 8, 'b', 40, ['10% 是 5 元。', '80% 是 8 个 5 元。', '拖到 80。'])],
    goal: ['d'],
    why: '50 × 80% = 40 元，便宜了 10 元（20%）。“八折”是 80%，不是减 8 元，也不是 8%。',
  });
  add({
    id: 'rb-ratio-2-3', essence: ['E6', 'E2'], title: '甲乙的比是 2 : 3，甲是 8，乙是多少？', grade: 6, rung: 3, points: ['6.4'],
    topics: ['比的应用', '按比分配'], alias: ['比', '按比例', '比的基本性质'],
    hook: '上面是甲，下面是乙。2 对着 3。把甲拖到 8。',
    build: rb({ mode: 1, pa: 2, pb: 3, tmax: 12, tstep: 1, t: 0, ua: '甲', ub: '乙' }),
    milestones: [ms('twelve', '甲 8，乙 12', 8, 'b', 12, ['2 变成 8，乘了几？', '乘 4。', '3 × 4 = 12。'])],
    goal: ['twelve'],
    why: '2 : 3 = 8 : 12。比的前项和后项同时乘 4，比不变。和等值分数是同一件事。',
  });
  U.problems.push.apply(U.problems, P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
