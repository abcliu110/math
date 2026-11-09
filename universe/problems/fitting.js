/* 建模示例题（任务 C.4）：一辆车匀速行驶，每隔 1 小时记一次路程，用数据拟合出规律，再预测第 5 小时。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;

  U.problems.push({
    id: 'car-model-proportional',
    title: '匀速行驶的车：路程和时间有什么关系？',
    grade: 7, domain: '建模', essence: ['E7', 'E8'], points: [],
    alias: ['拟合', '正比例', '建模', '预测'],
    hook: '每隔 1 小时记一次车跑的路程。你能找到规律，并预测第 5 小时跑了多远吗？',
    shelf: ['datatable', 'fit', 'predict', 'column', 'scatter'],
    model: {
      situation: '一辆车匀速行驶，每隔 1 小时记一次路程',
      quantities: [{ name: '时间', dim: 'time' }, { name: '路程', dim: 'length' }],
      relation: 'proportional',
      check: '用模型预测第 5 小时的路程，再和实测比较',
      steps: { choose: 'choose', function: 'function', check: 'check' },
    },
    evidence: 1,
    build() {
      const s = W.blank();
      const id = W.add(s, 'datatable', 80, 80, { data: '1,60;2,120;3,180', xname: '时间（小时）', yname: '路程（千米）' });
      s.entities[id].role = 'data';
      return s;
    },
    predict: null,
    milestones: [
      { id: 'choose', say: '选模型：用拟合器，选“正比例”', score: 2, when: { count: { type: 'fit', ge: 1 } },
        hints: ['数据是什么关系？每小时跑的路是一样的吗？', '接一台拟合器，把数据表接进去。', '模型选“正比例 y = kx”。'] },
      { id: 'function', say: '得到函数：k = 60', score: 4, when: { type: 'fit', port: 'k', op: '=', value: '60' },
        hints: ['拟合器算出的斜率 k 是多少？', '看拟合器的“斜率 k”输出。', '模型选正比例，斜率就是 60。'] },
      { id: 'check', say: '回到情境：预测第 5 小时跑了 300 千米', score: 4, when: { type: 'predict', port: 'y', op: '=', value: '300' },
        hints: ['用模型算第 5 小时：代入 x = 5。', '接一台预测器，把拟合器的直线接进去。', '预测器里 x 填 5。'] },
    ],
    traps: [],
    goal: ['check'],
    why: '每小时 60 千米，路程和时间成正比，比例系数就是速度。用模型预测的是“模型给的值”，要和实际测量比较，看模型是否可靠。',
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
