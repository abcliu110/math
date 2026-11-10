/* 推理题（2.14b，next-steps.md §8.1）：谁是谁，用排除表（器材 deduce）。
 * 学生只用鼠标在表里标“不是”“是”；结论（谁是什么）由“是”的格子写出，判题用声明的结论条件（yes / no / solved）。
 * 答案：小明 蓝、猫；小红 红、兔；小刚 绿、狗。线索：① 小红穿红色 ② 养猫的人穿蓝色 ③ 小刚不穿蓝色 ④ 小红不养狗。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;

  U.problems.push(
    {
      id: 'deduce-who', workbench: 'deduce', essence: ['E2'], title: '谁是谁：每人穿什么颜色、养什么宠物？', grade: 2, domain: '数与运算',
      points: ['2.14b'], level: 'core', rung: 2, alias: ['推理', '排除法', '谁是谁', '排除', '表格'],
      hook: '小明、小红、小刚各穿一种颜色的衣服（红、蓝、绿），各养一只宠物（猫、狗、兔），每样都不一样。线索：① 小红穿红色衣服。② 养猫的人穿蓝色衣服。③ 小刚不穿蓝色衣服。④ 小红不养狗。在表里排除，把每个人的颜色和宠物都找出来。',
      shelf: ['deduce'],
      build: () => { const s = W.blank(); const id = W.add(s, 'deduce', 40, 40, { people: '小明,小红,小刚', groups: '颜色：红,蓝,绿；宠物：猫,狗,兔' }); s.entities[id].role = '排除表'; return s; },
      milestones: [
        { id: 'excl', say: '排除了一格：小刚不穿蓝色', score: 2, glow: ['deduce'],
          when: { deduce: { no: { person: '小刚', value: '蓝' } } },
          hints: ['线索③说了一件事：小刚不穿什么颜色？', '在小刚那一行、蓝那一列找到交叉的格子。', '点一下小刚的蓝，它就变灰了。'] },
        { id: 'red', say: '写出结论：小红穿红色', score: 3, glow: ['deduce'],
          when: { deduce: { yes: { person: '小红', value: '红' } } },
          hints: ['线索①说小红穿红色；她的蓝和绿要先排除。', '点小红的蓝、绿，各点一下，标“不是”。', '小红只剩红了，点小红的红，标“是”。'] },
        { id: 'cat', say: '写出结论：小明养猫', score: 3, glow: ['deduce'],
          when: { deduce: { yes: { person: '小明', value: '猫' } } },
          hints: ['线索②：养猫的人穿蓝色。小红穿红色，小刚不穿蓝色，他们都不养猫。', '先把小红、小刚的猫标“不是”。', '猫只剩小明一个人了，点小明的猫，标“是”。'] },
        { id: 'done', say: '每人的颜色和宠物都找出来了', score: 4, glow: ['deduce'],
          when: { deduce: { solved: true } },
          hints: ['每人的颜色和宠物都要标出一个“是”。', '线索④：小红不养狗，先把它标“不是”，她就只剩兔了。', '小明蓝、猫；小红红、兔；小刚绿、狗。'] },
      ],
      traps: [],
      goal: ['excl', 'red', 'cat', 'done'],
      why: '由线索①，小红穿红色；由线索③，小刚不穿蓝色，所以小刚穿绿色，小明穿蓝色。线索②养猫的人穿蓝色，只有小明穿蓝色，所以小明养猫。由线索④，小红不养狗，所以小红养兔，小刚养狗。',
    },
  );
})(typeof globalThis !== 'undefined' ? globalThis : window);
