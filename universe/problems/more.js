/* 第二批题：分数比大小、周长相同面积不同、直线过点、平均数。 */
(function (G) {
  'use strict';
  const U = G.U, mk = U.mkScene;
  const P = [];

  P.push({
    id: 'frac-compare', title: '1/2 和 3/5，谁大？', grade: 4, domain: '分数', points: ['异分母比大小', '分数条'],
    alias: ['比大小'], hook: '两个分数，分母不一样，眼睛看不出来。用分数条把它们“量”出来，再让比较器下结论。',
    shelf: ['num', 'fracbar', 'compare', 'op', 'meter'],
    build: mk({ ents: [
      { type: 'num', x: 60, y: 70, role: 'a', props: { n: 1, d: 2 } },
      { type: 'num', x: 60, y: 250, role: 'b', props: { n: 3, d: 5 } },
    ] }),
    predict: { q: '先猜：哪个大？', options: [{ v: 'a', label: '1/2 大' }, { v: 'b', label: '3/5 大' }, { v: 'eq', label: '一样大' }],
      reveal: () => ({ v: 'b', label: '3/5 大' }) },
    milestones: [
      { id: 'bars', say: '给两个分数各配一条分数条', score: 3, glow: ['fracbar'], when: (w) => w.ofType('fracbar').filter((e) => w.sources(e).length).length >= 2, hints: ['看得见，才比得出。', '用「分数条」，把分数接进去。', '数字 → 分数条，两个都要；把“平均分成几份”调成 10 更容易对齐。'] },
      { id: 'cmp', say: '用比较器问：1/2 < 3/5 吗？', score: 3, glow: ['compare'], when: (w) => w.some('compare', (e) => w.sources(e).length >= 2), hints: ['光看图还不够，让器材给个结论。', '「比较」器材，设成 <。', '1/2 接甲口，3/5 接乙口，关系选 <。'] },
      { id: 'yes', say: '比较器说“成立”', score: 4, when: { all: [{ type: 'compare', port: 'ok', op: '=', value: true }, { count: { type: 'compare', ge: 1 } }] }, hints: ['结论要“成立”。', '甲是小的那个。', '甲=1/2，乙=3/5，关系 <。'] },
    ],
    traps: [{ id: 'big-den', when: { type: 'compare', port: 'ok', op: '=', value: false }, wrong: '“分母 5 比 2 大，所以 3/5 小”？分母越大，每一份越小，但 3/5 有 3 份。再看看分数条。' }],
    why: '通分后 1/2=5/10，3/5=6/10，同样大的份，6 份比 5 份多。',
    ref: ['compare,fracbar,fracbar,num,num|4'],
  });

  P.push({
    id: 'rect-perimeter', title: '周长 20，面积最大能到多少？', grade: 5, domain: '图形', points: ['长方形面积', '周长', '最值'],
    alias: ['面积', '周长'], hook: '一根 20 米长的绳子围长方形。怎么围面积最大？调长和宽试试。',
    shelf: ['rect', 'meter', 'compare', 'num'],
    build: mk({ ents: [{ type: 'rect', x: 120, y: 100, role: 'r', props: { w: 8, h: 2 } }] }),
    predict: { q: '先猜：面积最大的围法是——', options: [{ v: 'long', label: '又长又窄（9×1）' }, { v: 'sq', label: '正方形（5×5）' }, { v: 'mid', label: '差不多的都一样' }], reveal: () => ({ v: 'sq', label: '正方形（5×5）' }) },
    milestones: [
      { id: 'p20', say: '让周长等于 20', score: 3, when: { type: 'rect', port: 'perim', op: '=', value: '20' }, hints: ['周长 = (长+宽)×2。', '长 + 宽 要等于 10。', '长 6、宽 4，或者长 7、宽 3……' ] },
      { id: 'a24', say: '面积超过 24', score: 3, when: { all: [{ type: 'rect', port: 'perim', op: '=', value: '20' }, { type: 'rect', port: 'area', op: '>', value: '24' }] }, hints: ['长和宽越接近，面积越大。', '试试 6×4=24 再往中间靠。', '长 5.5 × 宽 4.5 = 24.75。'] },
      { id: 'a25', say: '面积达到 25', score: 4, when: { all: [{ type: 'rect', port: 'perim', op: '=', value: '20' }, { type: 'rect', port: 'area', op: '=', value: '25' }] }, hints: ['再往中间靠。', '长=宽的时候。', '长 5，宽 5。'] },
    ],
    traps: [], why: '周长一定时，长和宽越接近面积越大，相等（正方形）时最大：5×5=25。',
    ref: ['rect|0'],
  });

  P.push({
    id: 'line-through', title: '让直线 y = 2x + 1 经过点 x=3，y 是多少？', grade: 8, domain: '函数', points: ['一次函数', '代入求值'],
    alias: ['y=kx+b'], hook: '放一条直线，把 k 调成 2、b 调成 1，再用代入器看 x=3 时 y 是几。',
    shelf: ['line', 'at', 'meter', 'num'],
    build: mk({ ents: [] }),
    predict: { q: '先猜：x=3 时，y 等于——', options: [{ v: 5, label: '5' }, { v: 7, label: '7' }, { v: 9, label: '9' }], reveal: (w) => { const a = w.ofType('at')[0]; const y = a ? w.num(a, 'y') : null; return { v: y === null ? 7 : y, label: String(y === null ? 7 : y) }; } },
    milestones: [
      { id: 'line', say: '放一条 y = 2x + 1', score: 3, glow: ['line'], when: (w) => w.some('line', (e) => e.props.k === 2 && e.props.b === 1), hints: ['先有直线。', '「直线」器材，改 k 和 b。', '斜率 k=2，截距 b=1。'] },
      { id: 'at', say: '用代入器，x = 3', score: 3, glow: ['at'], when: (w) => w.some('at', (e) => w.sources(e).some((s) => s.type === 'line') && e.props.x === 3), hints: ['把 x 代进去。', '「代入器」接在直线后面。', '直线 → 代入器；代入器的 x 设 3。'] },
      { id: 'y7', say: 'y = 7', score: 4, when: { type: 'at', port: 'y', op: '=', value: '7' }, hints: ['看代入器的读数。', '2×3+1。', '确认直线和 x 都对。'] },
    ],
    traps: [{ id: 'y9', when: { type: 'at', port: 'y', op: '=', value: '9' }, wrong: '9 是 2×(3+1)+1 吗？y = 2x + 1，是先乘 3 再加 1：2×3=6，6+1=7。' }],
    why: '代入就是把 x 换成数再算：2×3+1=7。图像上，x=3 的竖线与直线交在高度 7。',
    ref: ['at,line|1'],
  });

  P.push({
    id: 'dice-mean', title: '两个骰子的点数和，平均是多少？', grade: 8, domain: '统计与概率', points: ['平均数', '期望', '大数规律'],
    alias: ['期望'], hook: '把两个骰子的和送进直方图，再用统计量算平均数。次数越多，它越稳。',
    shelf: ['dice', 'op', 'hist', 'stats', 'meter'],
    build: mk({ ents: [{ type: 'dice', x: 60, y: 60, role: 'd1' }, { type: 'dice', x: 60, y: 230, role: 'd2', props: { salt: 1 } }] }),
    predict: { q: '先猜：很多次之后，点数和的平均数接近——', options: [{ v: 6, label: '6' }, { v: 7, label: '7' }, { v: 8, label: '8' }], reveal: () => ({ v: 7, label: '7' }) },
    milestones: [
      { id: 'hist', say: '两个骰子的和进直方图', score: 3, glow: ['hist'], when: (w) => w.some('hist', (e) => w.sources(e).some((s) => s.type === 'op' && w.sources(s).filter((x) => x.type === 'dice').length >= 2)), hints: ['先得到“点数和”的分布。', '骰子→运算器(+)→直方图。', '两个骰子都接运算器，运算器接直方图。'] },
      { id: 'stats', say: '分布接进统计量，求平均数', score: 3, glow: ['stats'], when: (w) => w.some('stats', (e) => w.sources(e).some((s) => s.type === 'hist') && e.props.want === 0), hints: ['要把分布变成一个数。', '「统计量」，求“平均数”。', '直方图的分布口 → 统计量。'] },
      { id: 'near7', say: '跑够 300 次，平均数在 6.8 到 7.2 之间', score: 4, when: (w) => w.some('stats', (e) => { const v = w.num(e, 'v'); const h = w.ofType('hist')[0]; return v !== null && v >= 6.8 && v <= 7.2 && h && w.num(h, 'n') >= 300; }), hints: ['要等数据够多。', '点 ▶，调到 20×。', '等总次数过 300，平均数会贴近 7。'] },
    ],
    traps: [], why: '每个骰子平均 3.5，两个就是 7。这不是巧合：期望可以相加。次数越多，实际平均数越贴近它。',
    ref: ['dice,dice,hist,op,stats|4'],
  });

  U.problems.push(...P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
