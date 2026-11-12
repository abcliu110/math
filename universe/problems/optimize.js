/* 最优化沙盘的题（docs/new-instruments.md 5.2）：先猜，再一个一个试；n ≥ 5 才算真的试过。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const op = (scene) => () => { const s = W.blank(); const id = W.add(s, 'optimize', 60, 60, { scene }); s.entities[id].role = 'o'; return s; };
  const P = [];
  const add = (o) => P.push(Object.assign({ domain: '图形', level: 'core', shelf: ['optimize'], predict: null, traps: [] }, o));
  const ms = (id, say, score, port, op2, value, hints) => ({ id, say, score, when: { role: 'o', port, op: op2, value: String(value) }, hints });
  add({
    id: 'op-fence', essence: ['E5', 'E10', 'E12'], title: '周长 20 的长方形，哪个面积最大？', grade: 3, rung: 3, points: ['3.12'], build: op(0),
    topics: ['最优化', '周长', '面积'], alias: ['最大面积', '周长', '长方形', '围篱笆'],
    hook: '用 20 米篱笆围一个长方形，长取几，面积最大？先猜，再一个一个试：每试一个，右边的图上多一个点。',
    milestones: [ms('five', '试了 5 个以上', 2, 'n', '>=', 5, ['点下面的数字，一个一个试。', '至少试 5 个不同的。', '长 1、3、5、7、9 试一试。']), ms('hit', '试到了面积最大的：长 5 宽 5，面积 25', 6, 'hit', '=', 1, ['长和宽差得越少，面积越大？', '试长 5。', '长 5 宽 5，是正方形。'])],
    goal: ['five', 'hit'], why: '长 + 宽 = 10：长 5 宽 5 时面积 25 最大；长宽相差 2d 时，面积是 25 − d²，少 d²。周长一样，越接近正方形，面积越大。',
  });
  add({
    id: 'op-wall', essence: ['E5', 'E10', 'E12'], title: '靠墙围篱笆：怎么围面积最大？', grade: 9, rung: 4, points: ['9.4'], build: op(1),
    topics: ['最优化', '二次函数', '建模'], alias: ['最大面积', '靠墙', '二次函数', '围篱笆'],
    hook: '一面靠墙，用 20 米篱笆围三边。垂直墙的边（宽）取几，面积最大？先猜，再试，看看散点连起来像什么。',
    milestones: [ms('five', '试了 5 个以上', 2, 'n', '>=', 5, ['点下面的数字。', '至少试 5 个。', '1、3、5、7、9。']), ms('hit', '试到了最大：宽 5，长 10，面积 50', 6, 'hit', '=', 1, ['宽 × (20 − 2 × 宽)。', '散点连起来像一座山，山顶在哪？', '宽 5。'])],
    goal: ['five', 'hit'], why: '面积 = x(20 − 2x) = −2x² + 20x，顶点在 x = 5，最大 50。散点连起来是一条开口向下的抛物线。',
  });
  add({
    id: 'op-horse', essence: ['E5', 'E10', 'E12'], title: '将军饮马：取水点在哪，路程最短？', grade: 8, rung: 4, points: ['8.12'], build: op(2),
    topics: ['最优化', '轴对称', '最短路径'], alias: ['将军饮马', '最短路径', '轴对称', '最优化'],
    hook: '将军从 A 出发，先到河边取水，再去 B。取水点 P 在河上的哪里，A → P → B 的路程最短？先猜，再试。“取水点在正中间”对吗？',
    milestones: [ms('five', '试了 5 个以上', 2, 'n', '>=', 5, ['点下面的数字，一个一个试。', '至少试 5 个。', '0、2、4、6、8。']), ms('hit', '试到了最短的：取水点 x = 3', 6, 'hit', '=', 1, ['把 B 翻到河的另一边。', 'A 到 B′ 连一条直线，和河的交点就是 P。', 'x = 3。'])],
    goal: ['five', 'hit'], why: '把 B 沿河翻到对岸 B′(7，−4)：PB = PB′，A → P → B′ 连成直线最短，路程 = AB′ = 6√2 ≈ 8.485，直线和河交在 x = 3。',
  });
  for (const p of P) U.problems.push(p);
})(typeof globalThis !== 'undefined' ? globalThis : window);
