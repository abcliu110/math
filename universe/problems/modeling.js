/* 建模批次：同一个情境用两种模型（猜 vs 图像/方程），以及一一对应、握手计数。全部用现有器材。 */
(function (G) {
  'use strict';
  const U = G.U, mk = U.mkScene, P = [];

  P.push({
    id: 'model-two-ways', essence: ['E12', 'E4'], title: '鸡兔同笼：35 个头，94 条腿。先用“猜”算，再用“线”解。', grade: 8, domain: '函数', points: ['7.14', '8.15'], topics: ['猜与验证', '二元一次方程组', '直线交点'],
    alias: ['鸡兔同笼', '建模', '方程组'], hook: '先用运算器“假设全是鸡”，算出多出来的腿，再用两条直线把同一件事画出来。两种方法必须得到同一个答案。',
    shelf: ['num', 'op', 'line', 'cross', 'meter'],
    build: mk({ ents: [
      { type: 'num', x: 40, y: 40, role: 'heads', props: { n: 35 } },
      { type: 'num', x: 40, y: 150, role: 'legs', props: { n: 94 } },
      { type: 'num', x: 40, y: 260, role: 'two', props: { n: 2 } },
      { type: 'line', x: 360, y: 40, role: 'l1', props: { k: 1, b: 0 } },
      { type: 'line', x: 360, y: 220, role: 'l2', props: { k: 1, b: 0 } },
      { type: 'cross', x: 600, y: 120, role: 'x' },
    ] }),
    predict: { q: '先猜：兔有几只？', options: [{ v: 10, label: '10 只' }, { v: 12, label: '12 只' }, { v: 15, label: '15 只' }], reveal: () => ({ v: 12, label: '12 只（鸡 23 只）' }) },
    milestones: [
      { id: 'g1', say: '假设 35 只全是鸡：35 × 2 = 70 条腿', score: 2, glow: ['op'], when: { type: 'op', port: 'r', op: '=', value: '70' }, hints: ['先做一个假设：全是鸡。', '鸡每只 2 条腿，用「运算器」乘法。', '35 接甲，2 接乙，结果 70。'] },
      { id: 'g2', say: '94 − 70 = 24：多出来的 24 条腿', score: 2, when: { type: 'op', port: 'r', op: '=', value: '24' }, hints: ['实际腿数比 70 多多少？', '用「运算器」减法：94 减去 70。', '把 70 接到减法的乙口，94 接甲口，结果 24。'] },
      { id: 'g3', say: '24 ÷ 2 = 12：猜 12 只兔', score: 2, when: { type: 'op', port: 'r', op: '=', value: '12' }, hints: ['每只兔比鸡多 2 条腿。', '多出的 24 条腿，每只兔贡献 2 条。', '24 ÷ 2 = 12。'] },
      { id: 'l1', say: '第一条线：y = −x + 35', score: 3, when: (w) => w.some('line', (e) => e.props.k === -1 && e.props.b === 35), hints: ['x + y = 35 → y = 35 − x。', '斜率 −1，截距 35。', 'k = −1，b = 35。'] },
      { id: 'l2', say: '第二条线：y = −0.5x + 23.5', score: 3, when: (w) => w.some('line', (e) => e.props.k === -0.5 && e.props.b === 23.5), hints: ['2x + 4y = 94 → y = (94 − 2x) / 4。', '化简：y = 23.5 − 0.5x。', 'k = −0.5，b = 23.5。'] },
      { id: 'cr', say: '两条线接进交点器，读出 y = 12', score: 4, glow: ['cross'], when: { type: 'cross', port: 'y', op: '=', value: '12' }, hints: ['两条线的交点同时满足两个方程。', '「交点」器材，直线 1、直线 2 各接一条。', '读数：x = 23（鸡），y = 12（兔）。'] },
    ],
    traps: [{ id: 'chicken12', when: { type: 'cross', port: 'x', op: '=', value: '12' }, wrong: '交点的横坐标是鸡的只数，不是兔。看清 x 表示什么。' }],
    why: '猜法：假设全是鸡，腿数多算了 70 → 94 − 70 = 24，每只兔多 2 条腿，所以兔 12 只。图法：两个方程各画成一条直线，交点就是唯一的解。两种方法一致，模型才可信。',
    ref: ['cross,line,line,num,num,num,op,op,op|8'],
  });

  P.push({
    id: 'model-rent', essence: ['E12', 'E8'], title: '电话套餐：A 月租 20 元、每分钟 0.1 元；B 无月租、每分钟 0.15 元。通话多少分钟两者一样？', grade: 7, domain: '函数', points: ['8.15'], topics: ['一次函数', '选变量与单位', '交点的意义'],
    alias: ['套餐', '一次函数', '建模'], hook: '每分钟的价格太小，不好画。把横轴改成“每格 10 分钟”：每 10 分钟的钱是多少？再画两条线。',
    shelf: ['line', 'cross', 'at', 'meter'],
    build: mk({ ents: [
      { type: 'line', x: 40, y: 40, role: 'a', props: { k: 1, b: 0 } },
      { type: 'line', x: 40, y: 220, role: 'b', props: { k: 1, b: 0 } },
      { type: 'cross', x: 360, y: 120, role: 'x', props: { range: 60 } },
    ] }),
    predict: { q: '先猜：通话多少分钟时，两种套餐一样多？', options: [{ v: 100, label: '100 分钟' }, { v: 200, label: '200 分钟' }, { v: 400, label: '400 分钟' }], reveal: () => ({ v: 400, label: '400 分钟（20 ÷ (0.15 − 0.1)）' }) },
    milestones: [
      { id: 'a', say: '套餐 A：y = x + 20（横轴每格 10 分钟，每格 1 元）', score: 3, when: (w) => w.some('line', (e) => e.props.k === 1 && e.props.b === 20), hints: ['A 先交 20 元月租。', '每 10 分钟 = 1 格：0.1 元 × 10 = 1 元，斜率是 1。', '截距 b = 20，斜率 k = 1。'] },
      { id: 'b', say: '套餐 B：y = 1.5x（每 10 分钟 1.5 元）', score: 3, when: (w) => w.some('line', (e) => e.props.k === 1.5 && e.props.b === 0), hints: ['B 没有月租，所以过原点。', '每 10 分钟 0.15 × 10 = 1.5 元。', 'k = 1.5，b = 0。'] },
      { id: 'x', say: '交点横坐标 40：即 400 分钟', score: 4, glow: ['cross'], when: { type: 'cross', port: 'x', op: '=', value: '40' }, hints: ['两条线相交的地方，两种套餐花的钱一样。', '「交点」器材，两条线各接一条。', '读出 x = 40，再乘 10 得 400 分钟。'] },
    ],
    traps: [{ id: 'perMin', when: (w) => w.some('line', (e) => (e.props.k === 0.1 && e.props.b === 20) || (e.props.k === 0.15 && e.props.b === 0)), wrong: '这里用的是“每分钟”的斜率 0.1 / 0.15，但横轴每格是 10 分钟，斜率要乘 10：应当是 1 和 1.5。' }],
    why: '设通话 x 个十分钟：A 花 20 + x，B 花 1.5x。两者相等：20 + x = 1.5x，x = 40，即 400 分钟。画成图，就是两条直线的交点。选哪个变量、用什么单位，本身就是建模的一部分。',
    ref: ['cross,line,line|2'],
  });

  P.push({
    id: 'one-to-one', essence: ['E1', 'E2'], title: '3 位客人，每人正好坐一把椅子：椅子要几把？', grade: 3, domain: '数与运算', points: ['1.1'], topics: ['一一对应', '数量相等'],
    alias: ['对应', '椅子', '一一对应'], hook: '椅子先摆了 2 把，客人有 3 位。让每位客人对应一把椅子，把两边的数量接进比较器看看。',
    shelf: ['array', 'compare', 'num', 'meter'],
    build: mk({ ents: [
      { type: 'array', x: 40, y: 60, role: 'chairs', props: { rows: 1, cols: 2, shape: 1 } },
      { type: 'array', x: 40, y: 230, role: 'guests', props: { rows: 1, cols: 3, shape: 0 } },
    ] }),
    predict: { q: '先猜：要让每人正好一把椅子，椅子要几把？', options: [{ v: 2, label: '2 把' }, { v: 3, label: '3 把' }, { v: 4, label: '4 把' }], reveal: () => ({ v: 3, label: '3 把' }) },
    milestones: [
      { id: 'cmp', say: '放一台比较器', score: 2, glow: ['compare'], when: { count: { type: 'compare', ge: 1 } }, hints: ['要比“两边一样多吗”，需要「比较」器材。', '器材架里的「比较」。', '把「比较」拖到台面上。'] },
      { id: 'wire', say: '椅子的数量、客人的数量都接进比较器', score: 3, when: (w) => w.some('compare', (e) => w.sources(e).length >= 2), hints: ['两边都要送进去。', '从每排的「一共」口拉线到比较器。', '椅子 → 比较甲口，客人 → 比较乙口。'] },
      { id: 'eq', say: '椅子 3 把 = 客人 3 位：一人一把', score: 5, glow: ['compare'], when: { type: 'compare', port: 'ok', op: '=', value: true }, hints: ['椅子和人要一一对应：每人一把，不多不少。', '把椅子的列数改成客人的人数。', '椅子：每行几个 改成 3。'] },
    ],
    traps: [{ id: 'short', when: { type: 'compare', port: 'ok', op: '=', value: false }, wrong: '椅子和客人数不一样：要么有人没椅子，要么有椅子空着。一一对应要求两边个数相等。' }],
    why: '一一对应：每位客人配一把椅子，没有人落单，也没有椅子空着。两边个数相等，就说明能一一配对。数数只是为了检查配对是否完整。',
    ref: ['array,array,compare|2'],
  });

  P.push({
    id: 'counting-matching', essence: ['E2', 'E1'], title: '5 个人两两握手一次（甲和乙握过，乙和甲就不再算），一共握几次？', grade: 5, domain: '数与运算', points: ['5.4'], topics: ['配对计数', '重复计数的修正'],
    alias: ['握手', '配对', '组合'], hook: '每人和其余 4 人各握一次手，先算“人人都握一遍”的总数。这样每次握手被数了几遍？',
    shelf: ['array', 'op', 'num', 'meter'],
    build: mk({ ents: [
      { type: 'array', x: 40, y: 60, role: 'grid', props: { rows: 5, cols: 1 } },
      { type: 'num', x: 300, y: 80, role: 'half', props: { n: 2 } },
    ] }),
    predict: { q: '先猜：5 个人两两握一次手，一共几次？', options: [{ v: 10, label: '10 次' }, { v: 20, label: '20 次' }, { v: 25, label: '25 次' }], reveal: () => ({ v: 10, label: '10 次（4 + 3 + 2 + 1）' }) },
    milestones: [
      { id: 'grid', say: '每人和其余 4 人各握一次：5 × 4 = 20', score: 3, glow: ['array'], when: { role: 'grid', port: 'n', op: '=', value: '20' }, hints: ['5 个人，每人要和其余的人握手。', '点阵：几行 = 人数，每行几个 = 每人握几次。', '每行 4 个，改成 4。'] },
      { id: 'half', say: '20 ÷ 2 = 10：每次握手被数了两遍', score: 5, glow: ['op'], when: { type: 'op', port: 'r', op: '=', value: '10' }, hints: ['甲握乙，乙握甲，这是同一次握手。', '用「运算器」除法：20 ÷ 2。', '点阵的一共 → 运算器甲口，2 → 乙口，设为 ÷。'] },
    ],
    traps: [{ id: 'self25', when: { role: 'grid', port: 'n', op: '=', value: '25' }, wrong: '25 = 5 × 5，把每人和自己也算进去了——人不跟自己握手。' }],
    why: '每人和其余 4 人握手：5 × 4 = 20。但甲和乙握手，在“甲的 4 次”和“乙的 4 次”里各数了一次，所以要除以 2：10。也就是 4 + 3 + 2 + 1 = 10。',
    ref: ['array,num,op|2'],
  });

  U.problems.push(...P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
