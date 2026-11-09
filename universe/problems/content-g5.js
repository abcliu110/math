/* 五年级内容补充：没有题（或只有一道题）的知识点。每点写一道核心题和一道陷阱题；延伸题需要证据 ④，五年级现有器材做不到，不写。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const R = (s, id, role) => { s.entities[id].role = role; return id; };

  // 5.1 小数乘法（核心）：小数乘整数
  U.problems.push({
    id: 'g5-decimal-mul-core', title: '0.6 × 4 等于多少？', grade: 5, domain: '数与运算', essence: ['E3', 'E2'], points: ['5.1'], level: 'core', rung: 2,
    alias: ['小数乘法', '小数乘整数', '积'], hook: '一根绳子长 0.6 米，取 4 根，一共多长？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 3, d: 5 }), 'a'); R(s, W.add(s, 'num', 60, 200, { n: 4 }), 'b'); return s; },
    predict: null,
    milestones: [
      { id: 'mul', say: '放一台运算器，运算选 ×', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['4 根，每根 0.6 米，求一共多长，用什么运算？', '“每份是多少、要几份”用乘法。', '放一台运算器，运算选 ×。'] },
      { id: 'len', say: '得到 2.4 米', score: 4, when: { type: 'op', port: 'r', op: '=', value: '2.4' },
        hints: ['把 0.6 和 4 分别接到运算器的甲、乙。', '运算器的运算选 ×。', '甲接 0.6，乙接 4，运算选 ×。'] },
    ],
    traps: [], goal: ['len'],
    why: '0.6 × 4 = 2.4。可以看成 6 个十分之一 × 4 = 24 个十分之一 = 2.4。小数乘整数，就像整数乘法一样算，再点上小数点。',
  });

  // 5.1 小数乘法（陷阱）：小数乘小数，小数点要数对位数
  U.problems.push({
    id: 'g5-decimal-mul-trap', title: '0.2 × 0.3 等于多少？小数点点在哪里？', grade: 5, domain: '数与运算', essence: ['E3', 'E2'], points: ['5.1'], level: 'trap', rung: 2,
    alias: ['小数乘法', '小数点', '积的小数位数'], hook: '先把 0.2 和 0.3 当成 2 和 3 算，得到 6。小数点应该点在哪里？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 1, d: 5 }), 'a'); R(s, W.add(s, 'num', 60, 200, { n: 3, d: 10 }), 'b'); return s; },
    predict: null,
    milestones: [
      { id: 'mul', say: '放一台运算器，运算选 ×', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['两个小数相乘，要用乘法。', '运算器的运算选 ×。', '放一台运算器，运算选 ×。'] },
      { id: 'prod', say: '得到 0.06', score: 4, when: { type: 'op', port: 'r', op: '=', value: '0.06' },
        hints: ['先算 2 × 3 = 6，再想小数点。', '两个因数一共有几位小数？积也要有几位小数。', '甲接 0.2，乙接 0.3，运算选 ×。积是 0.06。'] },
    ],
    traps: [{ id: 'point', wrong: '得到 0.6：小数点点错了。0.2 和 0.3 一共有 2 位小数，积也要有 2 位小数。', when: { type: 'op', port: 'r', op: '=', value: '0.6' } }],
    goal: ['prod'],
    why: '2 × 3 = 6。0.2 有 1 位小数，0.3 有 1 位小数，一共 2 位，所以积是 0.06。',
  });

  // 5.3 小数除法（核心）：除数是小数
  U.problems.push({
    id: 'g5-decimal-div-core', title: '3.6 ÷ 0.9 等于多少？', grade: 5, domain: '数与运算', essence: ['E3', 'E6'], points: ['5.3'], level: 'core', rung: 2,
    alias: ['小数除法', '除数是小数', '商'], hook: '一共 3.6 米布，每 0.9 米做一个口袋，能做几个？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 18, d: 5 }), 'a'); R(s, W.add(s, 'num', 60, 200, { n: 9, d: 10 }), 'b'); return s; },
    predict: null,
    milestones: [
      { id: 'div', say: '放一台运算器，运算选 ÷', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['一共有多少，每份多少，求能分几份，用什么运算？', '“求有几份”用除法。', '放一台运算器，运算选 ÷。'] },
      { id: 'quot', say: '能做 4 个口袋', score: 4, when: { type: 'op', port: 'r', op: '=', value: '4' },
        hints: ['把 3.6 接甲口，0.9 接乙口。', '运算器的运算选 ÷。', '甲接 3.6，乙接 0.9，运算选 ÷。'] },
    ],
    traps: [], goal: ['quot'],
    why: '3.6 ÷ 0.9 = 4。除数是小数时，把被除数和除数的小数点同时向右移动相同的位数，变成 36 ÷ 9 = 4，商不变。',
  });

  // 5.3 小数除法（陷阱）：除数是小数，要先移动小数点
  U.problems.push({
    id: 'g5-decimal-div-trap', title: '1.2 ÷ 0.4 等于多少？别忘了移动小数点', grade: 5, domain: '数与运算', essence: ['E3', 'E6'], points: ['5.3'], level: 'trap', rung: 2,
    alias: ['小数除法', '移动小数点', '商'], hook: '有人直接用 1.2 除以 4 得到 0.3。这样对吗？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 6, d: 5 }), 'a'); R(s, W.add(s, 'num', 60, 200, { n: 2, d: 5 }), 'b'); return s; },
    predict: null,
    milestones: [
      { id: 'div', say: '放一台运算器，运算选 ÷', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['这是求一个数里有几个另一个数，用什么运算？', '运算器的运算选 ÷。', '放一台运算器，运算选 ÷。'] },
      { id: 'quot', say: '得到 3', score: 4, when: { type: 'op', port: 'r', op: '=', value: '3' },
        hints: ['除数 0.4 是小数，先把它变成整数。', '被除数和除数的小数点要同时向右移一位：12 ÷ 4。', '甲接 1.2，乙接 0.4，运算选 ÷，再看商是几。'] },
    ],
    traps: [{ id: 'no-move', wrong: '得到 0.3：只算了 1.2 ÷ 4。除数是 0.4，要先把 1.2 和 0.4 的小数点同时向右移动一位。', when: { type: 'op', port: 'r', op: '=', value: '0.3' } }],
    goal: ['quot'],
    why: '1.2 ÷ 0.4 = 12 ÷ 4 = 3。除数是小数时，先移动小数点，把除数变成整数，被除数同时移动相同的位数。',
  });

  // 5.4 可能性（核心）：用分数表示可能性
  U.problems.push({
    id: 'g5-chance-core', title: '掷两个骰子，点数和是 7 的可能性有多大？', grade: 5, domain: '统计与概率', essence: ['E11', 'E1'], points: ['5.4'], level: 'core', rung: 2,
    alias: ['可能性', '分数', '骰子'], hook: '两个骰子一共有几种可能的结果？其中点数和是 7 的有几种？',
    shelf: ['enumerator'],
    build() { const s = W.blank(); R(s, W.add(s, 'enumerator', 60, 60, { target: 12 }), 'e'); return s; },
    predict: null,
    milestones: [
      { id: 'hit', say: '和为 7 的情况有 6 种', score: 4, when: { type: 'enumerator', port: 'count', op: '=', value: '6' },
        hints: ['先想：和是 7 的情况有几种？可以一个一个数。', '“系统枚举器”能列出全部情况，并数出和为目标的情况数。', '把枚举器的“和是几”改成 7，看“和为目标的情况数”。'] },
    ],
    traps: [], goal: ['hit'],
    why: '两个骰子一共有 36 种等可能的结果，和是 7 的有 6 种：(1,6)(2,5)(3,4)(4,3)(5,2)(6,1)。可能性是 6/36 = 1/6。',
  });

  // 5.4 可能性（陷阱）：不可能的事件，可能性是 0
  U.problems.push({
    id: 'g5-chance-trap', title: '掷两个骰子，点数和是 13 的可能性是多少？', grade: 5, domain: '统计与概率', essence: ['E11', 'E1'], points: ['5.4'], level: 'trap', rung: 2,
    alias: ['可能性', '不可能', '0'], hook: '一个骰子最大是 6 点。两个骰子点数和最大是几？和是 13 会出现吗？',
    shelf: ['enumerator'],
    build() { const s = W.blank(); R(s, W.add(s, 'enumerator', 60, 60, { target: 12 }), 'e'); return s; },
    predict: null,
    milestones: [
      { id: 'none', say: '和为 13 的情况有 0 种', score: 4, when: { type: 'enumerator', port: 'count', op: '=', value: '0' },
        hints: ['两个骰子的点数和最大是几？', '接的是系统枚举器，把“和是几”改成要判断的那个数。', '把枚举器的“和是几”改成 13，看情况数是几。'] },
    ],
    traps: [{ id: 'seven', wrong: '把和写成了 7：和是 7 有 6 种情况，就不是不可能了。', when: { type: 'enumerator', port: 'count', op: '=', value: '6' } }],
    goal: ['none'],
    why: '两个骰子点数和最大只能是 12，和为 13 的情况有 0 种，所以可能性是 0。“不可能”的可能性是 0，不是 1/6。',
  });

  // 5.6 多边形的面积（核心）：三角形面积 = 底 × 高 ÷ 2
  U.problems.push({
    id: 'g5-polygon-tri-core', title: '底 6 厘米、高 4 厘米的三角形，面积是多少？', grade: 5, domain: '图形', essence: ['E5', 'E3'], points: ['5.6'], level: 'core', rung: 2,
    alias: ['三角形', '面积', '底', '高'], hook: '三角形的面积是和它等底等高的平行四边形的一半。',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 6 }), 'base'); R(s, W.add(s, 'num', 60, 160, { n: 4 }), 'h'); R(s, W.add(s, 'num', 60, 260, { n: 2 }), 'two'); return s; },
    predict: null,
    milestones: [
      { id: 'base-h', say: '放一台运算器，先算底 × 高', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['三角形面积 = 底 × 高 ÷ 2。', '先把底和高相乘，再除以 2。', '放一台运算器，运算选 ×，甲接底，乙接高。'] },
      { id: 'area', say: '面积是 12 平方厘米', score: 4, when: { type: 'op', port: 'r', op: '=', value: '12' },
        hints: ['底 × 高 得到的是平行四边形的面积，还要除以 2。', '再放一台运算器，运算选 ÷，甲接上一步的结果，乙接 2。', '第二台 ÷：甲接第一台的结果，乙接 2。'] },
    ],
    traps: [], goal: ['area'],
    why: '三角形面积 = 底 × 高 ÷ 2 = 6 × 4 ÷ 2 = 12（平方厘米）。少除以 2 就得到了平行四边形的面积。',
  });

  // 5.6 多边形的面积（陷阱）：平行四边形用斜边当高
  U.problems.push({
    id: 'g5-polygon-slant-trap', title: '平行四边形底 5 厘米、斜边 4 厘米、高 3 厘米，面积是多少？', grade: 5, domain: '图形', essence: ['E5', 'E3'], points: ['5.6'], level: 'trap', rung: 2,
    alias: ['平行四边形', '斜边', '高'], hook: '平行四边形的斜边不是高。面积要用底和对应的高。',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 5 }), 'base'); R(s, W.add(s, 'num', 60, 160, { n: 4 }), 'slant'); R(s, W.add(s, 'num', 60, 260, { n: 3 }), 'h'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器，运算选 ×', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['平行四边形面积 = 底 × 高。', '要找的是与底垂直的那条边。', '放一台运算器，运算选 ×。'] },
      { id: 'area', say: '面积是 15 平方厘米', score: 4, when: { type: 'op', port: 'r', op: '=', value: '15' },
        hints: ['底 5，对应的高是 3。斜边 4 不是高。', '把 5 和 3 接到运算器上。', '甲接底 5，乙接高 3，运算选 ×。'] },
    ],
    traps: [{ id: 'slant', wrong: '用了斜边：底 × 斜边 = 20，这不是面积。平行四边形的高要垂直于底。', when: { type: 'op', port: 'r', op: '=', value: '20' } }],
    goal: ['area'],
    why: '平行四边形面积 = 底 × 高 = 5 × 3 = 15（平方厘米）。斜边 4 比高 3 长，用斜边算出的 20 不是面积。',
  });

  // 5.7 植树问题（核心）：两端都种，棵数 = 段数 + 1
  U.problems.push({
    id: 'g5-tree-core', title: '路长 100 米，每隔 5 米种一棵，两端都种，要种几棵树？', grade: 5, domain: '数与运算', essence: ['E2'], points: ['5.7'], level: 'core', rung: 2,
    alias: ['植树问题', '段数', '棵数', '两端'], hook: '先数一数：路被分成几段？段数和棵数一样多吗？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 100 }), 'len'); R(s, W.add(s, 'num', 60, 160, { n: 5 }), 'gap'); R(s, W.add(s, 'num', 60, 260, { n: 1 }), 'one'); return s; },
    predict: null,
    milestones: [
      { id: 'seg', say: '分成 20 段', score: 2, when: { type: 'op', port: 'r', op: '=', value: '20' },
        hints: ['100 米每隔 5 米分一段，分成几段？', '段数 = 路长 ÷ 间隔。', '放一台运算器，运算选 ÷，甲接 100，乙接 5。'] },
      { id: 'all', say: '两端都种，要种 21 棵', score: 4, when: { type: 'op', port: 'r', op: '=', value: '21' },
        hints: ['两端都种，棵数比段数多 1。', '再放一台运算器，运算选 +。', '第二台 +：甲接第一台的结果，乙接 1。'] },
    ],
    traps: [], goal: ['all'],
    why: '分成 100 ÷ 5 = 20 段。两端都种，棵数比段数多 1，所以是 20 + 1 = 21 棵。',
  });

  // 5.7 植树问题（陷阱）：环形不用加 1
  U.problems.push({
    id: 'g5-tree-ring-trap', title: '环形花坛一周 100 米，每隔 5 米种一棵，要种几棵？', grade: 5, domain: '数与运算', essence: ['E2'], points: ['5.7'], level: 'trap', rung: 2,
    alias: ['植树问题', '环形', '封闭'], hook: '环形没有起点和终点。第一棵和最后一棵会是同一个位置吗？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 100 }), 'len'); R(s, W.add(s, 'num', 60, 160, { n: 5 }), 'gap'); R(s, W.add(s, 'num', 60, 260, { n: 1 }), 'one'); return s; },
    predict: null,
    milestones: [
      { id: 'div', say: '放一台运算器，运算选 ÷', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['环形一周的长度除以间隔，就是棵数。', '运算器的运算选 ÷。', '放一台运算器，运算选 ÷。'] },
      { id: 'ring', say: '要种 20 棵', score: 4, when: { type: 'op', port: 'r', op: '=', value: '20' },
        hints: ['甲接 100，乙接 5，运算选 ÷。', '环形没有两端，不用加 1。', '甲接 100，乙接 5，运算选 ÷。得到的 20 就是棵数。'] },
    ],
    traps: [{ id: 'plus-one', wrong: '得到 21：环形没有两端，不用加 1。21 是两端都种的直线答案。', when: { type: 'op', port: 'r', op: '=', value: '21' } }],
    goal: ['ring'],
    why: '环形的段数和棵数相等：100 ÷ 5 = 20 棵。只有两端都种的直线路，才要在段数上加 1。',
  });

  // 5.9 长方体和正方体（核心）：体积 = 长 × 宽 × 高
  U.problems.push({
    id: 'g5-cuboid-vol-core', title: '长 5 厘米、宽 4 厘米、高 3 厘米的长方体，体积是多少？', grade: 5, domain: '图形', essence: ['E5', 'E3'], points: ['5.9'], level: 'core', rung: 2,
    alias: ['长方体', '体积', '长宽高'], hook: '把长方体的长、宽、高调成 5、4、3，看看体积是多少。',
    shelf: ['cuboid'],
    build() { const s = W.blank(); R(s, W.add(s, 'cuboid', 60, 60, { l: 4, w: 3, h: 2 }), 'box'); return s; },
    predict: null,
    milestones: [
      { id: 'vol', say: '体积是 60 立方厘米', score: 4, when: { type: 'cuboid', port: 'vol', op: '=', value: '60' },
        hints: ['体积 = 长 × 宽 × 高。', '在长方体上改长、宽、高的数。', '长改成 5，宽改成 4，高改成 3。'] },
    ],
    traps: [], goal: ['vol'],
    why: '体积 = 长 × 宽 × 高 = 5 × 4 × 3 = 60（立方厘米）。',
  });

  // 5.9 长方体和正方体（陷阱）：体积相同，表面积不一定相同
  U.problems.push({
    id: 'g5-cuboid-same-vol-trap', title: '用 24 个小方块拼长方体：体积都是 24，表面积也一样吗？', grade: 5, domain: '图形', essence: ['E5', 'E3'], points: ['5.9'], level: 'trap', rung: 2,
    alias: ['长方体', '表面积', '体积'], hook: '每个小方块是 1 立方厘米。拼法不同，外面的面积会一样吗？',
    shelf: ['cuboid'],
    build() { const s = W.blank(); R(s, W.add(s, 'cuboid', 60, 60, { l: 1, w: 1, h: 1 }), 'box'); return s; },
    predict: null,
    milestones: [
      { id: 'vol', say: '体积是 24', score: 2, when: { type: 'cuboid', port: 'vol', op: '=', value: '24' },
        hints: ['体积 = 长 × 宽 × 高，三个数相乘得 24。', '试着把长、宽、高都改大一些。', '比如长 2、宽 3、高 4。'] },
      { id: 'surf', say: '表面积是 52 平方厘米', score: 4, when: { type: 'cuboid', port: 'surf', op: '=', value: '52' },
        hints: ['表面积是外面 6 个面的面积之和。', '表面积 = 2 ×（长×宽 + 长×高 + 宽×高）。', '长 2、宽 3、高 4 时，表面积是 52。'] },
    ],
    traps: [{ id: 'same-surf', wrong: '拼成 1 × 1 × 24 时，体积还是 24，表面积却是 98。体积相同，表面积不一定相同。', when: { type: 'cuboid', port: 'surf', op: '=', value: '98' } }],
    goal: ['surf'],
    why: '长 2、宽 3、高 4 时，表面积 = 2 ×（6 + 8 + 12）= 52。长 1、宽 1、高 24 时，表面积 = 2 ×（1 + 24 + 24）= 98。体积相同，表面积不一定相同。',
  });

  // 5.11 分数的加法和减法（核心）：同分母分数相加
  U.problems.push({
    id: 'g5-fraction-add-core', title: '1/4 + 2/4 等于多少？', grade: 5, domain: '分数', essence: ['E3'], points: ['5.11'], level: 'core', rung: 2,
    alias: ['分数加法', '同分母', '分数'], hook: '两块披萨：一块是 1/4，另一块是 2/4。合起来是几分之几？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 1, d: 4 }), 'a'); R(s, W.add(s, 'num', 60, 200, { n: 2, d: 4 }), 'b'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器，运算选 +', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['两块合起来，用什么运算？', '运算器默认的运算是 +。', '放一台运算器，运算选 +。'] },
      { id: 'sum', say: '合起来是 3/4', score: 4, when: { type: 'op', port: 'r', op: '=', value: '3/4' },
        hints: ['分母相同，分母不变，只把分子相加。', '把 1/4 和 2/4 分别接到甲、乙。', '甲接 1/4，乙接 2/4，运算选 +。'] },
    ],
    traps: [], goal: ['sum'],
    why: '分母相同，分母不变，分子相加：1 + 2 = 3，所以 1/4 + 2/4 = 3/4。',
  });

  // 5.11 分数的加法和减法（陷阱）：异分母，分子加分子是错的
  U.problems.push({
    id: 'g5-fraction-add-trap', title: '1/2 + 1/3 等于多少？', grade: 5, domain: '分数', essence: ['E3'], points: ['5.11'], level: 'trap', rung: 2,
    alias: ['分数加法', '异分母', '通分'], hook: '分母不同的分数相加，能直接分子加分子、分母加分母吗？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 1, d: 2 }), 'a'); R(s, W.add(s, 'num', 60, 200, { n: 1, d: 3 }), 'b'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器，运算选 +', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['这是两个分数相加，用什么运算？', '运算器默认的运算是 +。', '放一台运算器，运算选 +。'] },
      { id: 'sum', say: '得到 5/6', score: 4, when: { type: 'op', port: 'r', op: '=', value: '5/6' },
        hints: ['分母不同，先把两个分数化成同分母。', '1/2 = 3/6，1/3 = 2/6，分母都化成 6。', '甲接 1/2，乙接 1/3，运算选 +。结果要先通分再算。'] },
    ],
    traps: [{ id: 'add-tops', wrong: '得到 2/5：分子加分子、分母加分母是错的。要先通分，化成同分母再加。', when: { type: 'op', port: 'r', op: '=', value: '2/5' } }],
    goal: ['sum'],
    why: '1/2 = 3/6，1/3 = 2/6，3/6 + 2/6 = 5/6。异分母分数相加，要先通分，不能分子加分子、分母加分母。',
  });

  // 5.10 分数的意义和性质（核心）：分数的基本性质，约分
  U.problems.push({
    id: 'g5-fraction-equiv-core', title: '6/8 和 3/4 是同一个数吗？', grade: 5, domain: '分数', essence: ['E3', 'E2'], points: ['5.10'], level: 'core', rung: 2,
    alias: ['分数的基本性质', '约分', '相等'], hook: '分子和分母同时除以同一个数，分数的大小会变吗？',
    shelf: ['num', 'compare'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 6, d: 8 }), 'a'); R(s, W.add(s, 'num', 60, 200, { n: 3, d: 4 }), 'b'); return s; },
    predict: null,
    milestones: [
      { id: 'put', say: '放一台比较器', score: 2, when: { count: { type: 'compare', ge: 1 } },
        hints: ['要判断两个分数是不是同一个数，用什么器材？', '“比较”器材可以判断两个数是否相等。', '放一台比较器，运算选 =。'] },
      { id: 'same', say: '6/8 和 3/4 相等', score: 4, when: { type: 'compare', port: 'ok', op: '=', value: true },
        hints: ['把 6/8 和 3/4 分别接到比较器的甲、乙。', '分子分母都除以 2，6/8 变成几？', '甲接 6/8，乙接 3/4，关系选 =。'] },
    ],
    traps: [], goal: ['same'],
    why: '6/8 的分子分母都除以 2，得到 3/4，两个分数相等。分数的基本性质：分子和分母同时乘或除以同一个不为 0 的数，分数的大小不变。',
  });

  // 5.13 折线统计图、找次品（核心）：天平称一次，看哪边轻
  U.problems.push({
    id: 'g5-balance-core', title: '称一次：天平往哪边偏？', grade: 5, domain: '数与运算', essence: ['E4'], points: ['5.13'], level: 'core', rung: 2,
    alias: ['找次品', '天平', '称'], hook: '9 个零件，每个 10 克，其中 1 个轻 1 克。左边 3 个合计 30 克，右边 3 个合计 29 克。天平往哪边偏？',
    shelf: ['num', 'balance'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 30 }), 'L'); R(s, W.add(s, 'num', 60, 200, { n: 29 }), 'R'); return s; },
    predict: null,
    milestones: [
      { id: 'put', say: '放一台天平', score: 2, when: { count: { type: 'balance', ge: 1 } },
        hints: ['要比较两边的重量，用什么器材？', '“天平”器材可以比较左右两边。', '放一台天平。'] },
      { id: 'diff', say: '左边重 1 克，轻的一边有次品', score: 4, when: { type: 'balance', port: 'diff', op: '=', value: '1' },
        hints: ['把左边的 30 和右边的 29 分别接到天平的左、右。', '左边重，说明右边轻，次品在右边。', '天平的 L 接 30，R 接 29。'] },
    ],
    traps: [], goal: ['diff'],
    why: '左边 30 克，右边 29 克，左 − 右 = 1 克，左边重。轻的一边（右边）有次品，次品在右边这 3 个里。',
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
