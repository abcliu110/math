/* 改规则的世界的题（docs/new-instruments.md 4.3）：球面三角形、出租车几何、换一种运算。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const mk = (type, props) => () => { const s = W.blank(); const id = W.add(s, type, 60, 60, props || {}); s.entities[id].role = 'w'; return s; };
  const P = [];
  const add = (o) => P.push(Object.assign({ domain: '图形', level: 'core', predict: null, traps: [] }, o));
  const ms = (id, say, score, port, op, value, hints) => ({ id, say, score, when: { role: 'w', port, op, value: String(value) }, hints });
  add({
    id: 'st-sum', essence: ['E5', 'E9'], title: '球上的三角形，内角和还是 180° 吗？', grade: 9, rung: 4, points: ['9.12'], shelf: ['spheretri'], build: mk('spheretri'),
    topics: ['球面几何', '内角和', '改规则'], alias: ['球面三角形', '内角和', '大圆', '180度'],
    hook: '平面上，三角形内角和是 180°。在球上，用最直的线（大圆弧）连三个点，内角和还是 180° 吗？先猜，再选三个点量一量。',
    milestones: [ms('made', '选好了一个球面三角形', 2, 'valid', '=', 1, ['点球上的小圆点，选 3 个。', '3 个点不能在同一个大圆上。', '北极、赤道 0°、赤道 90° 试一试。']), ms('big', '内角和大于 180°', 5, 'sum', '>', 180, ['看看角的度数加起来。', '换几个点再量一量。', '北极、赤道 0°、赤道 90°：三个角都是 90°。'])],
    goal: ['made', 'big'], why: '球面上的“直线”是大圆弧，球面三角形的内角和永远大于 180°，多出来的部分和三角形占球面的大小成正比：超出量 ÷ 720° = 占整个球面的比例。平面上的 180° 是“平”这个条件带来的。',
  });
  add({
    id: 'st-three-right', essence: ['E5', 'E9'], title: '做一个有三个直角的三角形', grade: 9, rung: 4, points: ['9.12'], shelf: ['spheretri'], build: mk('spheretri'),
    topics: ['球面几何', '直角', '改规则'], alias: ['球面三角形', '三个直角', '大圆'],
    hook: '平面上一个三角形最多有一个直角。在球上，能做出三个角都是直角的三角形吗？选三个点试试。',
    milestones: [ms('three', '三个角都是直角', 6, 'rights', '=', 3, ['北极是一个好起点。', '另外两个点放在赤道上，相隔多远？', '北极、赤道 0°、赤道 90°。'])],
    goal: ['three'], why: '北极加赤道上相隔 90° 的两点，三个角都是 90°，内角和 270°：它正好是球面的八分之一（超出 90° ÷ 720° = 1/8）。',
  });
  add({
    id: 'tx-circle', essence: ['E5', 'E9'], title: '出租车的“圆”长什么样？', grade: 6, rung: 3, points: ['6.12'], shelf: ['taxi'], build: mk('taxi', { mode: 0, r: 3 }),
    topics: ['出租车几何', '距离', '改规则', '圆'], alias: ['出租车几何', '曼哈顿距离', '圆', '格点'],
    hook: '城市里只能横着竖着走，距离 = 横向格数 + 纵向格数。把到中心恰好走 3 格的所有路口都标出来，它们围成什么形状？先猜。',
    milestones: [ms('all', '标对了全部 12 个路口', 6, 'ok', '=', 1, ['横着 3 格，竖着 0 格，是一个。', '横 2 竖 1 呢？横 1 竖 2 呢？', '每个方向、每种拆法都要，一共 4 × 3 = 12 个。'])],
    goal: ['all'], why: '到中心走 r 格的路口有 4r 个，连起来是斜放的正方形。出租车的“圆”周长 8r、直径 2r，周长 ÷ 直径 = 4，不是 π。',
  });
  add({
    id: 'tx-bisector', essence: ['E5', 'E9'], title: '到 A、B 距离相等的路口', grade: 8, rung: 4, points: ['8.12'], shelf: ['taxi'], build: mk('taxi', { mode: 1, pair: 1 }),
    topics: ['出租车几何', '垂直平分线', '改规则'], alias: ['出租车几何', '垂直平分线', '到两点距离相等'],
    hook: 'A(0,0)、B(2,2)。把到 A、B 走的格数相等的所有路口都标出来。它还是一条线吗？',
    milestones: [ms('all', '标对了全部', 6, 'ok', '=', 1, ['先标 A、B 连线中间的路口。', '往左上、右下看一看，会不会是一整片？', '右上和左下各有一片区域，都要标。'])],
    goal: ['all'], why: '平面上到两点距离相等的是一条线（垂直平分线）。出租车几何里，当 A、B 在 45° 方向上时，它是一片区域：改了距离的规则，“垂直平分线”就变了。',
  });
  add({
    id: 'nw-sub', essence: ['E9', 'E5'], title: '钟面减法：交换律成立吗？', grade: 7, rung: 4, points: ['7.2'], shelf: ['newop'], build: mk('newop', { op: 4 }),
    topics: ['运算', '反例', '改规则'], alias: ['交换律', '结合律', '反例', '运算表', '钟面减法'],
    hook: '钟面上 5 个数，减法绕着钟走。交换律、结合律成立吗？有没有“什么都不改变的数”？先答，再造例子；说“不成立”要拿出自己找到的反例。',
    milestones: [ms('found', '找到了反例', 3, 'found', '>=', 1, ['在“例子”里写 1,2，看 1−2 和 2−1。', '再试三个数：0,1,2。', '结果不一样，就是反例。']), ms('all', '四条都答对，不成立的都有反例', 4, 'allBacked', '=', 1, ['表里没有一个“右边一直不变”的数。', '交换律、结合律都有反例。', '没有单位元，所以谈不上逆元。'])],
    goal: ['found', 'all'], why: '钟面减法：交换律不成立（1−2 = 4，2−1 = 1），结合律不成立，也没有单位元。一个反例就足以说“不成立”；说“成立”则要把表里所有情况查完。',
  });
  add({
    id: 'nw-max', essence: ['E9', 'E5'], title: '取较大的数：哪几条成立？', grade: 7, rung: 4, points: ['7.2'], shelf: ['newop'], build: mk('newop', { op: 2 }),
    topics: ['运算', '单位元', '改规则'], alias: ['交换律', '结合律', '单位元', '逆元', '取较大的数'],
    hook: 'a ∨ b 取 a、b 里较大的。在 1~5 上，交换律、结合律成立吗？有“什么都不改变”的数吗？每个数都有“抵消它”的数吗？',
    milestones: [ms('all', '四条都答对', 6, 'all', '=', 1, ['先造几个例子看看。', '1 和任何数取较大，结果就是那个数，所以 1 什么都不改变。', '“抵消”要得到 1，可 3 ∨ b 最小也是 3。'])],
    goal: ['all'], why: '取较大数：交换律、结合律都成立；1 是单位元；但除了 1 以外没有数能“抵消”回 1，所以不是每个数都有逆元。',
  });
  for (const p of P) U.problems.push(p);
})(typeof globalThis !== 'undefined' ? globalThis : window);
