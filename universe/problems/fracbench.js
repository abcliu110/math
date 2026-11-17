/* “分数运算”的题。切格子通分、合起来或拿走、约分；量尺量一量；翻过来找倒数。判分只看器材的输出。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const fb = (props) => () => { const s = W.blank(); const id = W.add(s, 'fracbench', 40, 50, props); s.entities[id].role = 'fr'; return s; };
  const P = [];
  const base = { domain: '分数', level: 'core', shelf: ['fracbench'], traps: [], predict: null };
  const add = (o) => P.push(Object.assign({}, base, o));
  const ms = (id, say, score, port, value, hints) => ({ id, say, score, when: { role: 'fr', port, op: '=', value: String(value) }, hints });

  add({
    id: 'fr-sub-unlike', essence: ['E3', 'E2'], title: '3/4 − 1/6：格子不一样大，怎么减？', grade: 5, rung: 3, points: ['5.11'],
    topics: ['异分母分数减法', '通分'], alias: ['通分', '异分母', '分数减法'],
    hook: '3/4 的格子是 1/4，1/6 的格子是 1/6，不一样大，不能直接拿走。把两根条都切细，切到格子一样大。',
    build: fb({ mode: 0, op: 1, a: 3, b: 4, c: 1, d: 6 }),
    milestones: [ms('common', '都切成 1/12 一格', 3, 'common', 12, ['上面每格切 3 份：3/4 = 9/12。', '下面每格切 2 份：1/6 = 2/12。', '格子都是 1/12。']), ms('res', '3/4 − 1/6 = 7/12', 5, 'result', '7/12', ['点“拿走（减）”。', '9 格拿走 2 格。', '7/12。'])],
    goal: ['res'],
    why: '分母不一样，格子大小就不一样，不能直接减。都切成 1/12：3/4 = 9/12，1/6 = 2/12，9/12 − 2/12 = 7/12。这就是通分。',
  });
  add({
    id: 'fr-reduce', essence: ['E3'], title: '1/6 + 1/3 = ？还能再约吗？', grade: 5, rung: 3, points: ['5.11'],
    topics: ['分数加法', '约分', '最简分数'], alias: ['约分', '最简分数', '通分'],
    hook: '先通分再加。加出来的结果，几格还能并成一格吗？约到最简。',
    build: fb({ mode: 0, op: 0, a: 1, b: 6, c: 1, d: 3 }),
    milestones: [ms('sum', '1/6 + 2/6 = 3/6', 3, 'result', '1/2', ['下面每格切 2 份：1/3 = 2/6。', '点“合起来”。', '3/6。']), ms('low', '约成最简：1/2', 5, 'lowest', 1, ['3 格并成 1 格。', '点“约分 ÷3”。', '3/6 = 1/2。'])],
    goal: ['low'],
    why: '1/6 + 1/3 = 1/6 + 2/6 = 3/6。3/6 的分子分母都能被 3 整除，每 3 格并成一格：1/2。算完要约成最简分数。',
  });
  add({
    id: 'fr-recip', essence: ['E3', 'E2'], title: '3/5 的倒数是几？', grade: 6, rung: 2, points: ['6.2'],
    topics: ['倒数'], alias: ['倒数'],
    hook: '3/5 乘几等于 1？把它上下翻过来试试。',
    build: fb({ mode: 2, a: 3, b: 5 }),
    milestones: [ms('rec', '3/5 的倒数是 5/3', 6, 'recip', '5/3', ['点“上下翻过来”。', '分子分母换个位置。', '3/5 × 5/3 = 1。'])],
    goal: ['rec'],
    why: '乘积是 1 的两个数互为倒数。3/5 × 5/3 = 15/15 = 1，所以 3/5 的倒数是 5/3：分子分母换个位置。0 没有倒数。',
  });
  U.problems.push.apply(U.problems, P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
