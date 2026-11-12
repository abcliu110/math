/* 线段图的题（docs/new-instruments.md 6.3）：题面 → 画两条线段 → 方程 → 答案。开场的图是“两条一样长”，学生要自己改成对的画法。
 * 不说“画错了”，只把按学生的图算出来的结果放回题面。判分：按学生的图算出的答案 = 标准答案。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const bm = (props) => () => { const s = W.blank(); const id = W.add(s, 'barmodel', 60, 60, props); s.entities[id].role = 'b'; return s; };
  const P = [];
  const base = { domain: '数与运算', level: 'core', shelf: ['barmodel', 'meter'], predict: null };
  const ms = (say, hints) => [{ id: 'ok', say, score: 8, when: { role: 'b', port: 'ok', op: '=', value: '1' }, hints }];
  const add = (o) => P.push(Object.assign({}, base, o));

  add({
    id: 'bm-more5', essence: ['E12', 'E3'], title: '小明有 8 个，小红比他多 5 个', grade: 2, rung: 2, points: ['2.5'],
    topics: ['线段图', '求比一个数多几的数', '应用题'], alias: ['线段图', '多几', '应用题', '画图'],
    hook: '小明有 8 个，小红比他多 5 个，小红有几个？A 是小明，B 是小红。把 B 画成对的样子：和 A 比，多出来的那一段是几？',
    build: bm({ story: '小明有 8 个，小红比他多 5 个，小红有几个？', gk: 2, gv: '8', tq: 1, truth: '1,1,0,5', sa: 1, sb: 1, ea: 0, eb: 0 }),
    milestones: ms('画对了，小红有 13 个', ['B 比 A 长出一段，长出来的就是“多 5”。', '“B 额外”点 + 到 5。', 'B：1 份，额外 +5。']),
    traps: [{ id: 'five-times', wrong: '“多 5”不是“是 5 倍”：多 5 是在 8 的后面再接 5，不是把 8 重复 5 次。', when: { role: 'b', port: 'answer', op: '=', value: '40' } }],
    goal: ['ok'],
    why: '小红 = 小明 + 5 = 8 + 5 = 13。线段图里，“多几”是在一条线段后面多出一段，这一段的长度就是 5。',
  });
  add({
    id: 'bm-times3', essence: ['E12', 'E3'], title: '哥哥 12 本，是弟弟的 3 倍', grade: 3, rung: 3, points: ['3.4'],
    topics: ['线段图', '倍的认识', '求一份数'], alias: ['线段图', '倍', '应用题', '画图'],
    hook: '哥哥有 12 本书，是弟弟的 3 倍，弟弟有几本？A 是弟弟，B 是哥哥。“3 倍”的意思：B 里有 3 份那么长的 A。',
    build: bm({ story: '哥哥有 12 本书，是弟弟的 3 倍，弟弟有几本？', gk: 3, gv: '12', tq: 0, truth: '1,3,0,0', sa: 1, sb: 1, ea: 0, eb: 0 }),
    milestones: ms('画对了，弟弟有 4 本', ['哥哥是弟弟的 3 倍：哥哥有几份？', '把 B 的份数调到 3。', 'A：1 份，B：3 份。']),
    traps: [], goal: ['ok'],
    why: '把弟弟的书看作 1 份，哥哥有 3 份，3 份是 12 本，1 份是 12 ÷ 3 = 4 本。',
  });
  add({
    id: 'bm-sum-times', essence: ['E12', 'E3'], title: '和倍：两数的和是 48，大数是小数的 3 倍', grade: 4, rung: 3, points: ['3.4'],
    topics: ['线段图', '和倍问题', '应用题'], alias: ['线段图', '和倍', '应用题', '画图'],
    hook: '两个数的和是 48，大数是小数的 3 倍，小数是几？A 是小数，B 是大数。先猜：小数大概是多少？再画图。',
    build: bm({ story: '两个数的和是 48，大数是小数的 3 倍，小数是几？', gk: 0, gv: '48', tq: 0, truth: '1,3,0,0', sa: 1, sb: 1, ea: 0, eb: 0 }),
    milestones: ms('画对了，小数是 12', ['小数是 1 份，大数是几份？', '一共几份？', 'B 调到 3 份：一共 4 份，4 份是 48。']),
    traps: [], goal: ['ok'],
    why: '小数是 1 份，大数是 3 份，一共 4 份，48 ÷ 4 = 12。每份 12，小数 12，大数 36。',
  });
  add({
    id: 'bm-diff-times', essence: ['E12', 'E3'], title: '差倍：哥哥比弟弟多 24 本，是弟弟的 4 倍', grade: 5, rung: 4, points: ['5.5'],
    topics: ['线段图', '差倍问题', '应用题'], alias: ['线段图', '差倍', '应用题', '画图'],
    hook: '哥哥比弟弟多 24 本书，哥哥的本数是弟弟的 4 倍，弟弟有几本？A 是弟弟，B 是哥哥。多出来的部分是几份？',
    build: bm({ story: '哥哥比弟弟多 24 本，是弟弟的 4 倍，弟弟有几本？', gk: 1, gv: '24', tq: 0, truth: '1,4,0,0', sa: 1, sb: 1, ea: 0, eb: 0 }),
    milestones: ms('画对了，弟弟有 8 本', ['B 比 A 多出来的是几份？', '4 倍减去 1 倍。', 'B 调到 4 份：多出来 3 份，是 24。']),
    traps: [], goal: ['ok'],
    why: '哥哥比弟弟多的 3 份是 24 本，1 份是 8 本，弟弟 8 本，哥哥 32 本。',
  });
  add({
    id: 'bm-sum-more', essence: ['E12', 'E3'], title: '和差：两个数的和是 45，B 比 A 多 5', grade: 5, rung: 4, points: ['5.5'],
    topics: ['线段图', '和差问题', '方程'], alias: ['线段图', '和差', '应用题', '方程'],
    hook: '两个数的和是 45，B 比 A 多 5，B 是几？画出来：两条一样长的线段，B 再多出 5。图转成的方程可以直接解。',
    build: bm({ story: '两个数的和是 45，B 比 A 多 5，B 是几？', gk: 0, gv: '45', tq: 1, truth: '1,1,0,5', sa: 1, sb: 1, ea: 0, eb: 0 }),
    milestones: ms('画对了，B 是 25', ['A 和 B 一样长的部分是几份？', 'B 比 A 多出的 5 怎么画？', 'B 额外 +5：2 份 + 5 = 45。']),
    traps: [], goal: ['ok'],
    why: '去掉多的 5，剩下 40，A 和 B 一样长，每份 20；A = 20，B = 25。',
  });
  for (const p of P) U.problems.push(p);
})(typeof globalThis !== 'undefined' ? globalThis : window);
