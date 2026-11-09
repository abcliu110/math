/* 建模题（任务 C.4 补充）：两道一次函数情境题，数据精确落在直线上，便于学生核对。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;

  // 出租车：起步价 + 每千米单价，y = 3x + 5
  U.problems.push({
    id: 'taxi-model-linear',
    title: '出租车计价：起步价加上每千米的价格',
    grade: 8, domain: '建模', essence: ['E7', 'E8'], points: [],
    alias: ['一次函数', '建模', '预测', '起步价'],
    hook: '坐出租车，跑 1、2、3、4 千米分别付 8、11、14、17 元。你能找到计价规律，并算出跑 10 千米要付多少钱吗？',
    shelf: ['datatable', 'fit', 'predict', 'column', 'scatter'],
    model: {
      situation: '出租车计价：先付起步价，之后每千米付固定的钱',
      quantities: [{ name: '路程', dim: 'length' }, { name: '车费', dim: 'money' }],
      relation: 'linear',
      check: '用模型算 10 千米的车费，再和计价规则比较',
      steps: { choose: 'choose', function: 'function', check: 'check' },
    },
    evidence: 1,
    build() {
      const s = W.blank();
      const id = W.add(s, 'datatable', 80, 80, { data: '1,8;2,11;3,14;4,17', xname: '路程（千米）', yname: '车费（元）' });
      s.entities[id].role = 'data';
      return s;
    },
    predict: null,
    milestones: [
      { id: 'choose', say: '选模型：用拟合器，选“一次 y = kx + b”', score: 2, when: { count: { type: 'fit', ge: 1 } },
        hints: ['数据每多跑 1 千米，车费涨的是一样的吗？', '有起步价，所以直线不过原点，要选“一次”。', '接一台拟合器，模型选“一次 y = kx + b”。'] },
      { id: 'function', say: '得到函数：y = 3x + 5', score: 4, when: { type: 'fit', port: 'b', op: '=', value: '5' },
        hints: ['截距 b 是多少？它表示什么？', '看拟合器的“截距 b”输出，b 就是起步价。', '拟合器的 b 应该是 5。'] },
      { id: 'check', say: '回到情境：跑 10 千米要付 35 元', score: 4, when: { type: 'predict', port: 'y', op: '=', value: '35' },
        hints: ['用模型算 10 千米：代入 x = 10。', '接一台预测器，把拟合器的直线接进去。', '预测器里 x 填 10。'] },
    ],
    traps: [],
    goal: ['check'],
    why: '车费 = 起步价 + 每千米单价 × 路程。斜率是每千米单价 3 元，截距是起步价 5 元；这是一次函数，不能强行当成正比例。',
  });

  // 水箱放水：剩余水量随时间均匀减少，y = −5x + 100
  U.problems.push({
    id: 'tank-model-linear-decrease',
    title: '水箱放水：剩下的水量怎么变？',
    grade: 8, domain: '建模', essence: ['E7', 'E8'], points: [],
    alias: ['一次函数', '建模', '预测', '放水', '减少'],
    hook: '水箱开始有 100 升水，每隔 2 分钟量一次剩下的水：0、2、4、6 分钟后分别剩 100、90、80、70 升。什么时候会只剩 50 升？',
    shelf: ['datatable', 'fit', 'predict', 'column', 'scatter'],
    model: {
      situation: '水箱匀速放水，剩余水量随时间均匀减少',
      quantities: [{ name: '时间', dim: 'time' }, { name: '水量' }],
      relation: 'linear',
      check: '用模型算剩 50 升时的时间，再回到水箱检验是否合理',
      steps: { choose: 'choose', function: 'function', check: 'check' },
    },
    evidence: 1,
    build() {
      const s = W.blank();
      const id = W.add(s, 'datatable', 80, 80, { data: '0,100;2,90;4,80;6,70', xname: '时间（分钟）', yname: '剩余水量（升）' });
      s.entities[id].role = 'data';
      return s;
    },
    predict: null,
    milestones: [
      { id: 'choose', say: '选模型：用拟合器，选“一次 y = kx + b”', score: 2, when: { count: { type: 'fit', ge: 1 } },
        hints: ['水量是在变多还是变少？变化快慢一样吗？', '水量在减少，斜率应该是负的，而且开始时不是 0，要选“一次”。', '接一台拟合器，模型选“一次 y = kx + b”。'] },
      { id: 'function', say: '得到函数：y = −5x + 100', score: 4, when: { type: 'fit', port: 'k', op: '=', value: '-5' },
        hints: ['斜率 k 是多少？负号表示什么？', '看拟合器的“斜率 k”输出，负数表示在减少。', '拟合器的 k 应该是 −5。'] },
      { id: 'check', say: '回到情境：约 10 分钟后剩 50 升', score: 4, when: { type: 'predict', port: 'y', op: '=', value: '50' },
        hints: ['水量是 50 时，时间 x 是多少？这里要反过来想。', '预测器可以先试 x = 10：剩多少？', '预测器里 x 填 10，得到 50，说明剩 50 升是在第 10 分钟。'] },
    ],
    traps: [],
    goal: ['check'],
    why: '每分钟放水 5 升，开始有 100 升，所以 y = −5x + 100。剩 50 升时 x = 10 分钟。斜率为负表示量在减少；截距是开始时的水量。',
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
