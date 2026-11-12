/* 代数砖的题（docs/new-instruments.md 6.2）：开场的砖数、拼法都不对，要学生自己取砖、定长和宽。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const tl = (props) => () => { const s = W.blank(); const id = W.add(s, 'tiles', 60, 60, props); s.entities[id].role = 't'; return s; };
  const P = [];
  const base = { domain: '关系', level: 'core', shelf: ['tiles'], predict: null };
  const ms = (id, say, score, port, hints) => ({ id, say, score, when: { role: 't', port, op: '=', value: '1' }, hints });
  const add = (o) => P.push(Object.assign({}, base, o));

  add({
    id: 'tl-expand', essence: ['E2', 'E8'], title: '(x + 1)(x + 4) 里有几块什么砖？', grade: 7, rung: 3, points: ['8.5'],
    topics: ['整式的乘法', '代数砖', '展开'], alias: ['代数砖', '展开', '整式乘法', '面积'],
    hook: '长是 x + 1，宽是 x + 4 的长方形框已经画好了。需要几块 x² 的大方块、几条 x 的长条、几个 1 的小方块，才能正好铺满？把砖数填进去。',
    build: tl({ expr: '', wa: 1, wp: 1, ha: 1, hp: 4 }),
    milestones: [ms('rect', '正好铺满了：1 块 x²、5 条 x、4 个 1', 8, 'rect', ['大方块是 x × x：长里一个 x、宽里一个 x。', '长条：长里的 x 乘宽里的 4，加上宽里的 x 乘长里的 1。', 'x² 1 块，x 5 条，1 有 4 个。'])],
    traps: [], goal: ['rect'],
    why: '(x + 1)(x + 4) = x² + 4x + x + 4 = x² + 5x + 4。展开就是数面积：大方块 1 块，长条 4 + 1 = 5 条，小方块 1 × 4 = 4 个。',
  });
  add({
    id: 'tl-factor', essence: ['E2', 'E8'], title: 'x² + 5x + 6 能拼成什么长方形？', grade: 8, rung: 3, points: ['8.6'],
    topics: ['因式分解', '代数砖', '十字相乘'], alias: ['代数砖', '因式分解', '拼长方形'],
    hook: '先猜：1 块 x²、5 条 x、6 个 1，能拼成一个长方形吗？取出这些砖，再试着定长和宽。长和宽就是它的因式。',
    build: tl({ expr: 'x^2+5x+6', wa: 1, wp: 0, ha: 1, hp: 0 }),
    milestones: [ms('done', '拼成了：(x + 2)(x + 3)', 8, 'done', ['先取砖：x² 1，x 5，1 有 6 个。', '长和宽里的常数乘起来是 6，加起来是 5。', '长 x + 3，宽 x + 2。'])],
    traps: [], goal: ['done'],
    why: 'x² + 5x + 6 = (x + 2)(x + 3)：2 × 3 = 6，2 + 3 = 5。把 x 拖到别的长度，拼法一样成立——x 是“任意一个数”。',
  });
  add({
    id: 'tl-complete', essence: ['E2', 'E8'], title: 'x² + 6x 补几个小方块能成正方形？', grade: 9, rung: 4, points: ['9.1'],
    topics: ['配方法', '完全平方', '代数砖'], alias: ['配方法', '完全平方', '代数砖', '正方形'],
    hook: '1 块 x²、6 条 x。把 6 条 x 平分，放在大方块的两边。角上缺的小方块要几个，才能补成一个大正方形？',
    build: tl({ expr: 'x^2+6x', n2: 1, n1x: 6, n1: 0, wa: 1, wp: 3, ha: 1, hp: 3 }),
    milestones: [ms('square', '补 9 个小方块，拼成边长 x + 3 的正方形', 8, 'square', ['每边放 3 条 x，角上是 3 × 3 的空位。', '“1 小方块”加到正好铺满。', '加 9 个：x² + 6x + 9 = (x + 3)²。'])],
    traps: [], goal: ['square'],
    why: 'x² + 6x + 9 = (x + 3)²：一次项系数的一半是 3，补上 3² = 9。这就是配方。',
  });
  add({
    id: 'tl-trap', essence: ['E2', 'E8'], title: 'x² + 5x + 5 能拼成长方形吗？', grade: 8, rung: 4, points: ['8.6'],
    topics: ['因式分解', '代数砖', '有的式子分解不了'], alias: ['代数砖', '因式分解', '分解不了'],
    hook: '这回的砖是 1 块 x²、5 条 x、5 个 1。先猜，再动手试：能拼成一个长方形吗？不是每个式子都能拼。',
    build: tl({ expr: 'x^2+5x+5', n2: 1, n1x: 5, n1: 5, wa: 1, wp: 2, ha: 1, hp: 3 }),
    milestones: [ms('judged', '判断对了：拼不成（整数拼法里找不到）', 8, 'judged', ['长和宽的常数乘起来要是 5、加起来要是 5。', '1 × 5 和 5 × 1 加起来是 6，不是 5。', '“先猜”选“不能”。'])],
    traps: [], goal: ['judged'],
    why: '要找两个整数，乘起来是 5、加起来也是 5：1 × 5 的和是 6，没有别的。所以砖是缺一块或多一块，拼不成长方形——这个式子在整数范围内分解不了。',
  });
  for (const p of P) U.problems.push(p);
})(typeof globalThis !== 'undefined' ? globalThis : window);
