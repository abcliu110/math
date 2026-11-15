/* 把旧题搬到操作台上（docs/instrument-design.md 第 6 节，第一批 18 道）。
 * 这些题原来的做法是“放数字、接运算器、看读数”：学生在搭计算流程。这里按 id 把它们换成在操作台上直接动手：
 * 题目的编号、标题、年级、知识点、道理（why）都不变，换的是器材架、开场的台面、里程碑和提示。
 * 这个文件排在所有题目文件后面加载（文件名 zz 开头），找不到的 id 会记在 U.benchMigrateMissing 里（测试会查）。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const one = (type, role, props) => () => { const s = W.blank(); const id = W.add(s, type, 40, 50, props); s.entities[id].role = role; return s; };
  const ms = (role) => (id, say, score, port, value, hints) => ({ id, say, score, when: { role, port, op: '=', value: String(value) }, hints });
  const N = ms('n'), K = ms('k'), R = ms('r');
  const nl = (props) => one('numlinebench', 'n', props), bk = (props) => one('blocksbench', 'k', props), rb = (props) => one('ratiobench', 'r', props);
  const MOVES = {
    // ---- 数轴 ----
    'g1-split-merge-core': { shelf: ['numlinebench'], build: nl({ from: 0, to: 10, a: 0, s: 1, n: 0 }),
      hook: '一部分是 2 个，另一部分是 3 个。在数轴上：把起点拖到 2，再往右跳 3 步，落在几？',
      milestones: [N('start', '从 2 出发', 2, 'start', 2, ['起点是那个圆点。', '拖到 2。', '松手。']), N('five', '再跳 3 步，落在 5', 4, 'value', 5, ['一步跳 1。', '拖“跳”字往右 3 步。', '3、4、5。'])], goal: ['five'] },
    'g1-split-minus-trap': { shelf: ['numlinebench'], build: nl({ from: 0, to: 10, a: 5, s: 1, n: 0 }),
      hook: '5 个苹果，拿走 2 个。在数轴上从 5 出发：拿走是往左跳。先点 − 把每一步改成 −1，再跳 2 步。',
      milestones: [N('left', '往左跳（步长 −1）', 2, 'step', -1, ['拿走是变少。', '点“每一步跳”旁边的 −。', '点一下。']), N('three', '跳 2 步，落在 3', 4, 'value', 3, ['往左 2 步。', '拖“跳”字。', '4、3。'])], goal: ['three'],
      traps: [{ id: 'plus', wrong: '拿走是变少，要往左跳：往右跳 2 步到了 7，苹果反而变多了。', when: { role: 'n', port: 'value', op: '=', value: '7' } }] },
    'g1-zero-subtract-core': { shelf: ['numlinebench'], build: nl({ from: 0, to: 10, a: 5, s: -1, n: 0 }),
      hook: '5 个苹果全吃掉。从 5 出发，往左跳 5 步，落在哪里？',
      milestones: [N('zero', '落在 0', 6, 'value', 0, ['一步一个。', '拖“跳”字往左 5 步。', '4、3、2、1、0。'])], goal: ['zero'] },
    'g1-carry-add-core': { shelf: ['numlinebench'], build: nl({ from: 0, to: 20, a: 9, s: 1, n: 0 }),
      hook: '9 加 5。从 9 出发往右跳 5 步：先跳 1 步到 10，再跳 4 步。',
      milestones: [N('ten', '先跳 1 步到 10', 2, 'value', 10, ['9 再多 1 就是 10。', '拖“跳”字往右 1 步。', '到 10。']), N('fourteen', '一共跳 5 步，落在 14', 4, 'value', 14, ['还要跳 4 步。', '接着往右拖。', '11、12、13、14。'])], goal: ['fourteen'] },
    'g1-minus-core': { shelf: ['numlinebench'], build: nl({ from: 0, to: 20, a: 13, s: -1, n: 0 }),
      hook: '13 减 9。从 13 出发往左跳 9 步：先跳 3 步到 10，再跳 6 步。',
      milestones: [N('ten', '先跳 3 步到 10', 2, 'value', 10, ['13 到 10 是 3 步。', '拖“跳”字往左。', '12、11、10。']), N('four', '一共跳 9 步，落在 4', 4, 'value', 4, ['还要跳 6 步。', '接着往左拖。', '落在 4。'])], goal: ['four'] },
    'g2-times-trap': { shelf: ['numlinebench'], build: nl({ from: 0, to: 24, a: 0, s: 1, n: 0 }),
      hook: '3 盒，每盒 6 个。一盒是一大步：把每一步改成跳 6，从 0 出发跳 3 步。',
      milestones: [N('six', '每一步跳 6', 2, 'step', 6, ['一盒 6 个。', '点 ＋ 改步长。', '改到 6。']), N('eighteen', '跳 3 步，落在 18', 4, 'value', 18, ['3 盒就是 3 步。', '拖“跳”字。', '6、12、18。'])], goal: ['eighteen'],
      traps: [{ id: 'add', wrong: '3 盒每盒 6 个是 3 个 6 相加，不是 3 + 6 = 9。', when: { role: 'n', port: 'value', op: '=', value: '9' } }] },
    'g2-divide-share-core': { shelf: ['numlinebench'], build: nl({ from: 0, to: 15, a: 0, s: 3, n: 0 }),
      hook: '12 个苹果平均分给 3 个小朋友。换个问法：每次发 3 个（一人一个），发几次能发完 12 个？每一步跳 3，跳到 12。',
      milestones: [N('twelve', '跳到 12', 3, 'value', 12, ['每步 3。', '拖“跳”字到 12。', '3、6、9、12。']), N('four', '跳了 4 步：每人 4 个', 3, 'jumps', 4, ['数弧线。', '发了 4 次，每人拿到 4 个。', '4。'])], goal: ['twelve', 'four'] },
    'g7-rational-compare-core': { shelf: ['numlinebench'], build: nl({ mode: 2, from: -6, to: 6, lo: 0, hi: 1, lc: 1, hc: 1 }),
      hook: '把左端点拖到 −3，右端点拖到 2。在数轴上，左边的数总是比右边的小。',
      milestones: [N('lo', '左端在 −3', 3, 'lo', -3, ['−3 在 0 的左边。', '拖左端点。', '到 −3。']), N('hi', '右端在 2', 3, 'hi', 2, ['拖右端点。', '到 2。', '松手。'])], goal: ['lo', 'hi'] },
    'g7-rational-addsub-core': { shelf: ['numlinebench'], build: nl({ from: -8, to: 8, a: 0, s: 1, n: 0 }),
      hook: '温度从 −3℃ 上升 5℃。把起点拖到 −3，上升就是往右跳，跳 5 步。',
      milestones: [N('start', '从 −3 出发', 2, 'start', -3, ['−3 在 0 的左边 3 格。', '拖起点。', '到 −3。']), N('two', '上升 5，到 2', 4, 'value', 2, ['往右 5 步。', '拖“跳”字。', '−2、−1、0、1、2。'])], goal: ['two'] },
    'g7-segment-length-core': { shelf: ['numlinebench'], build: nl({ mode: 2, from: 0, to: 10, lo: 0, hi: 1, lc: 1, hc: 1 }),
      hook: '点 A 在 2，点 B 在 7。把两个端点拖过去，线段 AB 有多长？',
      milestones: [N('a', 'A 在 2', 2, 'lo', 2, ['拖左端点。', '到 2。', '松手。']), N('b', 'B 在 7', 2, 'hi', 7, ['拖右端点。', '到 7。', '松手。']), N('len', 'AB 长 5', 3, 'len', 5, ['数一数中间有几格。', '7 − 2。', '5。'])], goal: ['len'] },
    // ---- 计数块与数位 ----
    'g1-add-two-digit-core': { shelf: ['blocksbench'], build: bk({ mode: 1, a: 45, b: 38, h: 0, t: 7, o: 13 }),
      hook: '45 和 38 的块倒在了一起：十位 7 个，个位 13 个。把个位的块往左拖，十个捆成一根，整理到每一位都不超过 9。',
      milestones: [K('std', '整理好了', 3, 'standard', 1, ['个位 13 个，超过 9。', '把个位的块往左拖到十位。', '捆成 1 个十。']), K('v', '十位是 8：答案 83', 4, 'tens', 8, ['十位 7 + 1。', '8 个十、3 个一。', '83。'])], goal: ['std', 'v'] },
    'g2-carry-add-core': { shelf: ['blocksbench'], build: bk({ mode: 1, a: 46, b: 27, h: 0, t: 6, o: 13 }),
      hook: '46 + 27：十位 6 个，个位 13 个。个位满十了，捆成一根放到十位。',
      milestones: [K('std', '整理好了：73', 6, 'standard', 1, ['个位超过 9。', '往左拖。', '7 个十、3 个一。'])], goal: ['std'] },
    'g3-add-carry-core': { shelf: ['blocksbench'], build: bk({ mode: 1, a: 367, b: 485, h: 7, t: 14, o: 12 }),
      hook: '367 + 485：百位 7 个，十位 14 个，个位 12 个。两栏都满十了，一栏一栏整理。',
      milestones: [K('std', '整理好了：852', 6, 'standard', 1, ['个位捆一次。', '十位再捆一次。', '8 个百、5 个十、2 个一。'])], goal: ['std'] },
    'g1-sub-borrow-trap': { shelf: ['blocksbench'], build: bk({ mode: 1, a: 52, b: 0, h: 0, t: 5, o: 2 }),
      hook: '52 减 27，个位 2 不够减 7。把十位的一根往右拖到个位，拆成十个小方块：现在个位有几个？12 − 7 = 5，十位 4 − 2 = 2。',
      milestones: [K('o12', '拆开一个十：个位有 12 个', 6, 'ones', 12, ['个位不够，向十位借。', '把一根长条往右拖。', '4 个十、12 个一。'])], goal: ['o12'] },
    'g2-borrow-sub-trap': { shelf: ['blocksbench'], build: bk({ mode: 1, a: 60, b: 0, h: 0, t: 6, o: 0 }),
      hook: '60 减 25，个位是 0，不够减 5。把十位的一根往右拖，拆成十个：10 − 5 = 5，十位 5 − 2 = 3。',
      milestones: [K('o10', '拆开一个十：个位有 10 个', 6, 'ones', 10, ['个位一个也没有。', '把一根长条往右拖。', '5 个十、10 个一。'])], goal: ['o10'] },
    // ---- 分数条与比 ----
    'g5-fraction-equiv-core': { shelf: ['ratiobench'], build: rb({ d1: 8, n1: 6, d2: 4, n2: 0 }),
      hook: '甲是 6/8。乙条切成了 4 份：涂几份和甲一样长？它们是同一个数吗？',
      milestones: [R('eq', '两条一样长：6/8 = 3/4', 6, 'cmp', 0, ['让两条虚线对齐。', '拖乙条的把手。', '涂 3 份。'])], goal: ['eq'] },
    'g5-fraction-add-core': { shelf: ['ratiobench'], build: rb({ d1: 4, n1: 1, d2: 4, n2: 0 }),
      hook: '甲是 1/4。把乙涂成 2/4，两条合起来是多少？看下面“合起来”那一行。',
      milestones: [R('b', '乙是 2/4', 2, 'b', '1/2', ['拖乙条的把手。', '涂 2 份。', '2/4。']), R('sum', '合起来是 3/4', 4, 'sum', '3/4', ['都是四分之几，直接数份数。', '1 份加 2 份。', '3/4。'])], goal: ['sum'] },
    'g6-ratio-cross-core': { shelf: ['ratiobench'], build: rb({ mode: 1, pa: 3, pb: 2, tmax: 12, tstep: 1, t: 0, ua: '后项', ub: '前项' }),
      hook: '2 : 3 = x : 9。上面是后项，下面是前项：3 对着 2。把上面的点拖到 9，下面对着的就是 x。',
      milestones: [R('x', '9 对着 6：x = 6', 6, 'b', 6, ['3 变成 9，乘了几？', '乘 3。', '2 × 3 = 6。'])], goal: ['x'] },
  };
  const missing = [], moved = [];
  for (const id of Object.keys(MOVES)) {
    const p = U.problems.find((x) => x.id === id);
    if (!p) { missing.push(id); continue; }
    const m = MOVES[id];
    p.shelf = m.shelf; p.build = m.build; p.hook = m.hook; p.milestones = m.milestones; p.goal = m.goal; p.traps = m.traps || [];
    delete p.variant; delete p.params; delete p.explain;
    p.bench = m.shelf[0];   // 记一笔：这道题已经搬到哪个操作台
    moved.push(id);
  }
  U.benchMigrateMissing = missing; U.benchMigrated = moved;
})(typeof globalThis !== 'undefined' ? globalThis : window);
