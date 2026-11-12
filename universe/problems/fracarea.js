/* 分数面积模型的题（docs/new-instruments.md 6.4）：开场的设置都还没达到目标，要学生自己改分数、换运算、再切、写先猜。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const fa = (props) => () => { const s = W.blank(); const id = W.add(s, 'fracarea', 60, 60, props); s.entities[id].role = 'f'; return s; };
  const P = [];
  const base = { domain: '数与运算', level: 'core', shelf: ['fracarea', 'meter'] };
  const add = (o) => P.push(Object.assign({}, base, o));
  const ms = (id, say, score, port, value, hints) => ({ id, say, score, when: { role: 'f', port, op: '=', value: String(value) }, hints });

  add({
    id: 'fa-numberline', essence: ['E3', 'E2'], title: '把 3/4 放到数轴上', grade: 3, rung: 2, points: ['3.7'],
    topics: ['分数的初步认识', '数轴上的分数'], alias: ['分数', '数轴', '分数的初步认识'],
    hook: '现在数轴上放的是 1/2。把第一个分数改成 3/4，看看它落在哪里：在 0 和 1 之间，更靠近 1。',
    build: fa({ a: '1/2', b: '1/3', op: 0, view: 1 }), predict: null,
    milestones: [ms('three-q', '3/4 在数轴上：0 和 1 之间，切成 4 份的第 3 条线', 6, 'result', '3/4', ['点“第一个分数”改成 3/4。', '分母是 4：0 到 1 之间切成 4 份。', '写 3/4。'])],
    traps: [], goal: ['three-q'],
    why: '3/4 是把 0 到 1 平均分成 4 份，取第 3 份的位置。真分数都落在 0 和 1 之间。',
  });
  add({
    id: 'fa-add', essence: ['E3', 'E2'], title: '1/2 + 1/3：为什么不能直接数？', grade: 5, rung: 3, points: ['5.11'],
    topics: ['异分母分数加法', '通分'], alias: ['分数加法', '通分', '异分母'],
    hook: '1/2 和 1/3 切法不同，格子大小不一样。把运算换成“加”，再把两个都切成同样大的小格（“再切成几份”），然后才能数。',
    build: fa({ a: '1/2', b: '1/3', op: 0, view: 0, cut: 0 }), predict: null,
    milestones: [
      ms('plus', '换成“加”', 2, 'total', 0, ['“做什么”选“加”。', '看看两个图的格子一样大吗？', '选“加”：格子不一样大，总格数是 0。']),
      ms('common', '切成了同样大的小格', 6, 'common', 1, ['2 和 3 的公倍数是几？', '“再切成几份”试 6。', '填 6：1/2 = 3/6，1/3 = 2/6。']),
    ],
    traps: [{ id: 'twofifths', wrong: '1/2 + 1/3 ≠ 2/5：分母不能直接相加，格子大小不一样。', when: { role: 'f', port: 'total', op: '=', value: '5' } }],
    goal: ['common'],
    why: '切成 6 份：1/2 = 3/6，1/3 = 2/6，格子一样大，3 + 2 = 5 格，是 5/6。',
  });
  add({
    id: 'fa-mul', essence: ['E3', 'E2'], title: '2/3 × 4/5：积比 4/5 大还是小？', grade: 6, rung: 3, points: ['6.1'],
    topics: ['分数乘法', '面积模型', '乘法越乘越大？'], alias: ['分数乘法', '面积模型', '越乘越小'],
    hook: '先猜：2/3 × 4/5 比 4/5 大还是小？把“做什么”换成“乘”，竖着涂 4/5、横着取 2/3，重叠的部分就是积。先在“我猜结果”里写一个数。',
    build: fa({ a: '2/3', b: '4/5', op: 0, view: 0 }), predict: null,
    milestones: [
      ms('eight', '重叠的有 8 格，一共 15 格：积是 8/15', 6, 'cells', 8, ['“做什么”选“乘”。', '重叠部分有几格？', '2 × 4 = 8 格，3 × 5 = 15 格。']),
    ],
    traps: [{ id: 'bigger', wrong: '“乘法越乘越大”只对大于 1 的数成立：真分数相乘，积更小。', when: { role: 'f', port: 'bigger', op: '=', value: '1' } }],
    goal: ['eight'],
    why: '2/3 × 4/5 = 8/15，比 4/5 小：先取 4/5，再只取它的 2/3，当然更少。',
  });
  add({
    id: 'fa-div', essence: ['E3', 'E2'], title: '3/4 里有几个 1/8？', grade: 6, rung: 3, points: ['6.2'],
    topics: ['分数除法', '包含除'], alias: ['分数除法', '包含除', '有几个'],
    hook: '3/4 ÷ 1/8 是在问：3/4 里面，能量出几个 1/8？把第二个分数改成 1/8，“做什么”选“除”，数一数。',
    build: fa({ a: '3/4', b: '1/3', op: 0, view: 0 }), predict: null,
    milestones: [ms('six', '3/4 里有 6 个 1/8', 6, 'cells', 6, ['第二个分数改成 1/8。', '“做什么”选“除”。', '3/4 = 6/8，有 6 个 1/8。'])],
    traps: [], goal: ['six'],
    why: '3/4 = 6/8，里面有 6 个 1/8，所以 3/4 ÷ 1/8 = 6。',
  });
  for (const p of P) U.problems.push(p);
})(typeof globalThis !== 'undefined' ? globalThis : window);
