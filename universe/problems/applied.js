/* 应用题批次：折扣、按比分配、鸡兔同笼（方程组）、摸球概率。 */
(function (G) {
  'use strict';
  const U = G.U, mk = U.mkScene;
  const P = [];

  P.push({
    id: 'discount-80', essence: ['E3', 'E12'], title: '原价 80 元的书，打八折，现价多少？', grade: 6, domain: '数与运算', points: [], topics: ['百分数应用', '折扣'],
    alias: ['折扣', '打折'], hook: '八折就是原价的 80%，也就是便宜了 20%。接上百分数器，选对“求什么”。',
    shelf: ['num', 'percent', 'meter', 'compare'],
    build: mk({ ents: [{ type: 'num', x: 60, y: 60, role: 'pct', props: { n: 20 } }, { type: 'num', x: 60, y: 210, role: 'price', props: { n: 80, unit: 6 } }] }),
    predict: { q: '先猜：现价是——', options: [{ v: 16, label: '16 元' }, { v: 64, label: '64 元' }, { v: 100, label: '100 元' }], reveal: () => ({ v: 64, label: '64 元' }) },
    milestones: [
      { id: 'wire', say: '把 20 和 80 接进百分数器', score: 3, glow: ['percent'], when: (w) => w.some('percent', (e) => w.sources(e).length >= 2), hints: ['需要「百分数」器材。', '20 接甲，80 接乙。', '甲口 20，乙口 80。'] },
      { id: 'mode', say: '选“乙减少 甲%”', score: 3, when: (w) => w.some('percent', (e) => e.props.mode === 3), hints: ['便宜了 20% → 现价是减少后的。', '“求什么”选最后一项。', 'mode = 乙减少 甲%。'] },
      { id: 'ans', say: '现价 64 元', score: 4, when: { type: 'percent', port: 'r', op: '=', value: '64' }, hints: ['80 × (1 − 20%)。', '80 × 0.8。', '64。'] },
    ],
    traps: [{ id: 'off16', when: { type: 'percent', port: 'r', op: '=', value: '16' }, wrong: '16 元是“便宜的钱”（80 的 20%），不是现价。现价 = 原价 − 便宜的钱。' }],
    why: '八折 = 原价的 80%：80 × 0.8 = 64。也可以先算便宜的 80×20%=16，再 80−16=64。',
    ref: ['num,num,percent|2'],
  });

  P.push({
    id: 'ratio-share-50', essence: ['E3'], title: '50 个苹果按 3 : 2 分给甲乙，各得几个？', grade: 6, domain: '数与运算', points: ['6.4'], topics: ['比的应用', '按比分配'],
    alias: ['按比分配'], hook: '3 : 2 共有 5 份。先把比接进来，再告诉比器一共要分 50。',
    shelf: ['num', 'ratio', 'meter'],
    build: mk({ ents: [{ type: 'num', x: 60, y: 60, role: 'a', props: { n: 3 } }, { type: 'num', x: 60, y: 210, role: 'b', props: { n: 2 } }] }),
    predict: { q: '先猜：甲分到——', options: [{ v: 20, label: '20 个' }, { v: 25, label: '25 个' }, { v: 30, label: '30 个' }], reveal: () => ({ v: 30, label: '30 个' }) },
    milestones: [
      { id: 'wire', say: '3 和 2 接进比器', score: 3, glow: ['ratio'], when: (w) => w.some('ratio', (e) => w.sources(e).length >= 2), hints: ['「比」器材。', '3 接甲，2 接乙。', '甲口 3，乙口 2。'] },
      { id: 'tot', say: '“一共要分”设成 50', score: 3, when: (w) => w.some('ratio', (e) => e.props.total === 50), hints: ['比器还不知道有多少苹果。', '属性「一共要分」。', '填 50。'] },
      { id: 'sa', say: '甲分到 30、乙分到 20', score: 4, when: { type: 'ratio', port: 'sa', op: '=', value: '30' }, hints: ['一共 5 份，每份 10。', '50 ÷ 5 = 10。', '甲 3 份=30，乙 2 份=20。'] },
    ],
    traps: [], why: '3 : 2 一共 5 份，每份 50 ÷ 5 = 10 个。甲 3 份 = 30，乙 2 份 = 20。',
    ref: ['num,num,ratio|2'],
  });

  P.push({
    id: 'chicken-rabbit', essence: ['E12', 'E4'], title: '鸡兔同笼：35 个头，94 条腿，鸡和兔各几只？', grade: 8, domain: '函数', points: ['7.14'], topics: ['二元一次方程组', '图像法', '直线交点'],
    alias: ['鸡兔同笼', '方程组'], hook: '设鸡 x 只，兔 y 只：x + y = 35，2x + 4y = 94。每个方程都是一条直线，解就是两条线的交点。',
    shelf: ['line', 'cross', 'meter'],
    build: mk({ ents: [{ type: 'line', x: 60, y: 40, role: 'l1', props: { k: 1, b: 0 } }, { type: 'line', x: 60, y: 260, role: 'l2', props: { k: 1, b: 0 } }] }),
    predict: { q: '先猜：兔有几只？', options: [{ v: 10, label: '10 只' }, { v: 12, label: '12 只' }, { v: 15, label: '15 只' }], reveal: () => ({ v: 12, label: '12 只（鸡 23 只）' }) },
    milestones: [
      { id: 'l1', say: '第一条线：y = −x + 35', score: 3, when: (w) => w.some('line', (e) => e.props.k === -1 && e.props.b === 35), hints: ['x + y = 35 → y = 35 − x。', '斜率 −1，截距 35。', 'k = −1，b = 35。'] },
      { id: 'l2', say: '第二条线：y = −0.5x + 23.5', score: 3, when: (w) => w.some('line', (e) => e.props.k === -0.5 && e.props.b === 23.5), hints: ['2x + 4y = 94 → y = (94 − 2x) / 4。', '化简：y = 23.5 − 0.5x。', 'k = −0.5，b = 23.5。'] },
      { id: 'cr', say: '两条线接进交点器，读出 (23, 12)', score: 4, glow: ['cross'], when: { type: 'cross', port: 'y', op: '=', value: '12' }, hints: ['两条线的交点就是解。', '「交点」器材，直线 1、直线 2 各接一条。', '看读数：x = 23，y = 12。'] },
    ],
    traps: [], why: '交点同时在两条线上，所以同时满足两个方程：鸡 23 只、兔 12 只，头 35、腿 46+48=94。',
    ref: ['cross,line,line|2'],
  });

  P.push({
    id: 'bag-red-ratio', essence: ['E11'], title: '袋里 3 红 1 白，摸很多次，红球占多少？', grade: 7, domain: '统计与概率', points: [], topics: ['频率与概率', '有放回摸球'],
    alias: ['摸球', '概率'], hook: '每次摸一个、看完放回。摸几百次后，红球的比例会稳定在哪里？',
    shelf: ['bag', 'hist', 'stats', 'meter'],
    build: mk({ ents: [{ type: 'bag', x: 60, y: 120, role: 'b' }] }),
    predict: { q: '先猜：红球比例大约是——', options: [{ v: '0.5', label: '0.5' }, { v: '0.75', label: '0.75' }, { v: '0.25', label: '0.25' }], reveal: () => ({ v: '0.75', label: '接近 0.75（3 / 4）' }) },
    milestones: [
      { id: 'hist', say: '摸球袋接直方图，范围设成 0 到 1', score: 4, glow: ['hist'], when: (w) => w.some('hist', (e) => w.sources(e).some((s) => s.type === 'bag') && e.props.lo === 0 && e.props.hi === 1), hints: ['直方图默认只数 2～12。', '最小值 0、最大值 1。', '先改最小值。'] },
      { id: 'st', say: '接统计量求平均数', score: 2, glow: ['stats'], when: (w) => w.some('stats', (e) => w.sources(e).some((s) => s.type === 'hist') && e.props.want === 0), hints: ['平均数 = 红球的比例。', '「统计量」，求平均数。', '直方图的分布口 → 统计量。'] },
      { id: 'near', say: '摸够 400 次，比例在 0.7 到 0.8', score: 4, when: (w) => w.some('stats', (e) => { const v = w.num(e, 'v'), h = w.ofType('hist')[0]; return v !== null && v >= 0.7 && v <= 0.8 && h && w.num(h, 'n') >= 400; }), hints: ['次数要够。', '点 ▶ 调到 20×。', '等总次数过 400。'] },
    ],
    traps: [], why: '袋里红球占 3/4，摸得足够多，红球的频率就稳定在 0.75 附近。',
    ref: ['bag,hist,stats|2'],
  });

  U.problems.push(...P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
