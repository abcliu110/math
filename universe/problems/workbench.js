/* 两道工作台示例题（D8，docs/direction.md 第 7 节 D8）：数位竖式（place-value）和数据图表台（data）。
 * 两道都通过题目的 workbench 字段进入对应的工作台，学生只用鼠标完成。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;

  U.problems.push(
    {
      id: 'place-sub', workbench: 'place-value', essence: ['E2'], title: '用竖式算 62 − 37', grade: 2, domain: '数与运算',
      points: ['2.3'], level: 'core', rung: 1, alias: ['竖式', '退位', '减法', '个位不够减', '位值'],
      hook: '62 减 37 是多少？个位 2 不够减 7，怎么办？按列写竖式：先从十位借 1 到个位，再一列一列写出差。',
      shelf: ['colbench'],
      build: () => { const s = W.blank(); const id = W.add(s, 'colbench', 40, 40, { a: 62, b: 37, op: 1 }); s.entities[id].role = '竖式'; return s; },
      milestones: [
        { id: 'borrow', say: '个位不够减，先退位', score: 3, glow: ['colbench'],
          when: { steps: { used: 'digit.borrow' } },
          hints: ['个位上 2 比 7 小，要先想办法。', '点竖式下面的「退位」，从十位借 1。', '借来的 1 变成 10，个位就是 12。'] },
        { id: 'write', say: '按列写出每一位的差', score: 3, glow: ['colbench'],
          when: { steps: { used: 'digit.write', allKept: true } },
          hints: ['从个位开始，一列一列写。', '把数字拖到结果那一行对应的列上。', '个位 12 − 7 = 5，十位 5 − 3 = 2。'] },
        { id: 'done', say: '竖式写完，结果是 25', score: 4, glow: ['colbench'],
          when: { digits: { solved: true } },
          hints: ['两列都写好了，结果那一行就是答案。', '检查：25 + 37 应该等于 62。', '写完了，结果是 25。'] },
      ],
      traps: [],
      goal: ['borrow', 'write', 'done'],
      why: '个位不够减的时候，十位借 1 变成 10，个位就变成 12；12 − 7 = 5，十位借走 1 后是 5，5 − 3 = 2。所以 62 − 37 = 25。',
    },
    {
      id: 'data-fit', workbench: 'data', essence: ['E3', 'E7'], title: '录数据、画图、拟合：小车走了多远？', grade: 8, domain: '统计与概率',
      points: ['8.15'], level: 'core', rung: 3, alias: ['拟合', '散点图', '一次函数', '最小二乘', '直线'],
      hook: '小车每过 1 秒记一次走过的路程（米）：(1, 58)、(2, 121)、(3, 179)、(4, 242)。把它们录进数据图表台，画出散点图，拟合一条直线。',
      shelf: ['databench'],
      build: () => { const s = W.blank(); const id = W.add(s, 'databench', 40, 40, { title: '小车的路程' }); s.entities[id].role = '图表'; return s; },
      milestones: [
        { id: 'rows', say: '录入 4 组数据', score: 2, glow: ['databench'],
          when: { data: { minRows: 4 } },
          hints: ['每组数据写 x 和 y，点「加一行」。', '在两个输入框里分别填 x 和 y。', '4 组都录进去：1、58；2、121；3、179；4、242。'] },
        { id: 'plot', say: '画出散点图', score: 2, glow: ['databench'],
          when: { data: { minRows: 4, plotted: true } },
          hints: ['数据录好了，要先把点画出来。', '点「画散点图」。', '图上应该有 4 个点。'] },
        { id: 'fit', say: '拟合出一条直线', score: 4, glow: ['databench'],
          when: { data: { minRows: 4, plotted: true, fitted: true } },
          hints: ['点的大致排成一条直线，要找最接近它们的那条。', '点「拟合直线」。', '斜率就是小车每秒走的路程。'] },
      ],
      traps: [],
      goal: ['rows', 'plot', 'fit'],
      why: '拟合出的直线是 y = 61x − 2.5：斜率 61 说明小车大约每秒走 61 米。数据并不正好在一条直线上，拟合给出的是最接近它们的那条直线。',
    },
  );
})(typeof globalThis !== 'undefined' ? globalThis : window);
