/* 初中批次：解方程、三角形、圆、抛物线、概率、数列。 */
(function (G) {
  'use strict';
  const U = G.U, mk = U.mkScene;
  const P = [];

  P.push({
    id: 'linear-3x5', essence: ['E4'], title: '3x + 5 = 20，x 是多少？', grade: 7, domain: '关系', points: ['一元一次方程', '移项', '等式性质'],
    alias: ['方程'], hook: '台面上有一台解方程器。把它调成 3x + 5 = 20，看 x 是多少，再想想它是怎么算出来的。',
    shelf: ['linsolve', 'num', 'op', 'balance', 'meter'],
    build: mk({ ents: [{ type: 'linsolve', x: 120, y: 120, role: 's' }] }),
    predict: { q: '先猜：x 等于——', options: [{ v: 5, label: '5' }, { v: 25, label: '25' }, { v: '25/3', label: '25/3' }], reveal: () => ({ v: 5, label: '5' }) },
    milestones: [
      { id: 'a3', say: '把 a 调成 3', score: 2, when: (w) => w.some('linsolve', (e) => e.props.a === 3), hints: ['x 前面的数是 3。', '属性「x 前面的数 a」。', 'a = 3。'] },
      { id: 'bc', say: '把 b 调成 5、c 调成 20', score: 3, when: (w) => w.some('linsolve', (e) => e.props.b === 5 && e.props.c === 20), hints: ['+5，等于 20。', 'b = 5，c = 20。', '两个属性都要改。'] },
      { id: 'x5', say: 'x = 5', score: 5, when: { type: 'linsolve', port: 'x', op: '=', value: '5' }, hints: ['看读数。', '(20 − 5) ÷ 3。', 'x = 5。'] },
    ],
    traps: [{ id: 'x25', when: { type: 'linsolve', port: 'x', op: '=', value: '25/3' }, wrong: '25/3 是把 5 加到右边了。移项要变号：3x = 20 − 5 = 15。' }],
    why: '等式两边同时减 5：3x = 15；两边同时除以 3：x = 5。移项就是“两边同时做同一件事”的省略写法。',
    ref: ['linsolve|0'],
  });

  P.push({
    id: 'triangle-348', essence: ['E2'], title: '3、4、8 围不成三角形。把 8 改成几就能围成？再改成直角？', grade: 6, domain: '图形', points: ['三角形三边关系', '勾股定理'],
    alias: ['勾股'], hook: '三根小棒 3、4、8，怎么摆都围不成三角形。调第三根的长度，让它能围成，再让它变成直角三角形。',
    shelf: ['tri', 'meter'],
    build: mk({ ents: [{ type: 'tri', x: 120, y: 90, role: 't', props: { a: 3, b: 4, c: 8 } }] }),
    predict: { q: '先猜：第三根最长能到多少（整数）还围得成？', options: [{ v: 6, label: '6' }, { v: 7, label: '7' }, { v: 8, label: '8（不用改）' }], reveal: () => ({ v: 6, label: '6（3+4=7，必须小于 7）' }) },
    milestones: [
      { id: 'ok', say: '让三角形围得起来', score: 4, when: { role: 't', port: 'ok', op: '=', value: true }, hints: ['两边之和必须大于第三边。', '3 + 4 = 7，第三边要比 7 小。', '把 c 改成 6、5、4 都行。'] },
      { id: 'right', say: '让它成为直角三角形', score: 6, when: { role: 't', port: 'right', op: '=', value: true }, hints: ['勾股：两个小边的平方和 = 最长边的平方。', '9 + 16 = 25。', 'c = 5。'] },
    ],
    traps: [], why: '三角形任意两边之和大于第三边；3² + 4² = 5²，所以 3、4、5 是直角三角形。',
    ref: ['tri|0'],
  });

  P.push({
    id: 'circle-r5', essence: ['E7'], title: '半径 5 厘米的圆，面积是多少？', grade: 6, domain: '图形', points: ['圆的面积', '圆周率'],
    alias: ['圆'], hook: '先把半径设成 5，π 取 3.14，读出面积。再换换 π 的取法，看看差多少。',
    shelf: ['circle', 'meter', 'compare', 'num'],
    build: mk({ ents: [{ type: 'circle', x: 120, y: 90, role: 'c', props: { r: 2 } }] }),
    predict: { q: '先猜：面积是——', options: [{ v: '31.4', label: '31.4（这是周长）' }, { v: '78.5', label: '78.5' }, { v: '25', label: '25' }], reveal: () => ({ v: '78.5', label: '78.5' }) },
    milestones: [
      { id: 'r5', say: '半径设成 5', score: 3, when: (w) => w.some('circle', (e) => e.props.r === 5), hints: ['属性「半径」。', 'r = 5。', '半径是圆心到边上的距离。'] },
      { id: 'a', say: '面积 = 78.5（π 取 3.14）', score: 5, when: { role: 'c', port: 'area', op: '=', value: '157/2' }, hints: ['面积 = π × r × r。', '3.14 × 5 × 5。', 'π 取 3.14，半径 5。'] },
      { id: 'c', say: '周长 = 31.4', score: 2, when: { role: 'c', port: 'c', op: '=', value: '157/5' }, hints: ['周长 = 2 × π × r。', '2 × 3.14 × 5。', '31.4。'] },
    ],
    traps: [], why: '面积 = π r² = 3.14 × 25 = 78.5；周长 = 2πr = 31.4。注意单位：周长是厘米，面积是平方厘米。',
    ref: ['circle|0'],
  });

  P.push({
    id: 'quad-vertex', essence: ['E10'], title: 'y = x² − 4x + 3：顶点在哪？和 x 轴交几点？', grade: 9, domain: '函数', points: ['二次函数', '顶点', '判别式'],
    alias: ['抛物线'], hook: '把抛物线调成 y = x² − 4x + 3，读出顶点和与 x 轴的交点个数。',
    shelf: ['quad', 'meter', 'compare'],
    build: mk({ ents: [{ type: 'quad', x: 100, y: 70, role: 'q' }] }),
    predict: { q: '先猜：顶点的 x 是——', options: [{ v: -2, label: '−2' }, { v: 2, label: '2' }, { v: 4, label: '4' }], reveal: () => ({ v: 2, label: '2（x = −b/2a）' }) },
    milestones: [
      { id: 'set', say: '调成 a=1、b=−4、c=3', score: 3, when: (w) => w.some('quad', (e) => e.props.a === 1 && e.props.b === -4 && e.props.c === 3), hints: ['三个系数。', 'b 是 −4，c 是 3。', 'a=1, b=−4, c=3。'] },
      { id: 'vx', say: '顶点 x = 2', score: 3, when: { role: 'q', port: 'vx', op: '=', value: '2' }, hints: ['顶点在对称轴上。', 'x = −b ÷ 2a。', '4 ÷ 2 = 2。'] },
      { id: 'vy', say: '顶点 y = −1', score: 4, when: { role: 'q', port: 'vy', op: '=', value: '-1' }, hints: ['把 x=2 代回去。', '4 − 8 + 3。', 'y = −1。'] },
    ],
    traps: [{ id: 'sign', when: { role: 'q', port: 'vx', op: '=', value: '-2' }, wrong: '对称轴是 x = −b/(2a)，b = −4 时是 +2，不是 −2：别忘了 b 本身带负号。' }],
    why: '顶点横坐标 −b/2a = 2，代回 y = 4 − 8 + 3 = −1，所以顶点 (2, −1)。判别式 16 − 12 = 4 > 0，与 x 轴有 2 个交点（x=1 和 x=3）。',
    ref: ['quad|0'],
  });

  P.push({
    id: 'coin-fair', essence: ['E11'], title: '硬币抛很多次，正面占多少？', grade: 7, domain: '统计与概率', points: ['频率与概率', '大数规律'],
    alias: ['概率', '频率'], hook: '让硬币自己抛几百次。直方图要把 0（反面）和 1（正面）都装得下，再用统计量看平均数——它就是正面的比例。',
    shelf: ['coin', 'hist', 'stats', 'meter', 'clock'],
    build: mk({ ents: [{ type: 'coin', x: 60, y: 120, role: 'c' }] }),
    predict: { q: '先猜：抛 500 次后，正面比例大约是——', options: [{ v: '0.3', label: '0.3' }, { v: '0.5', label: '0.5' }, { v: '0.7', label: '0.7' }], reveal: () => ({ v: '0.5', label: '接近 0.5' }) },
    milestones: [
      { id: 'hist', say: '硬币接直方图，范围设成 0 到 1', score: 4, glow: ['hist'], when: (w) => w.some('hist', (e) => w.sources(e).some((s) => s.type === 'coin') && e.props.lo === 0 && e.props.hi === 1), hints: ['直方图默认只数 2～12。', '最小值 0，最大值 1。', '先改最小值再改最大值。'] },
      { id: 'st', say: '接统计量，求平均数', score: 2, glow: ['stats'], when: (w) => w.some('stats', (e) => w.sources(e).some((s) => s.type === 'hist') && e.props.want === 0), hints: ['平均数 = 正面的比例。', '「统计量」求“平均数”。', '直方图的分布口 → 统计量。'] },
      { id: 'near', say: '抛够 400 次，比例在 0.45 到 0.55', score: 4, when: (w) => w.some('stats', (e) => { const v = w.num(e, 'v'), h = w.ofType('hist')[0]; return v !== null && v >= 0.45 && v <= 0.55 && h && w.num(h, 'n') >= 400; }), hints: ['要抛够次数。', '点 ▶ 并调到 20×。', '等总次数过 400。'] },
    ],
    traps: [], why: '次数少时比例摇摆很大，次数多了稳定在 0.5 附近。这是“频率趋向概率”。',
    ref: ['coin,hist,stats|2'],
  });

  P.push({
    id: 'seq-arith-20', essence: ['E6'], title: '3、7、11、15……前 20 项加起来是多少？', grade: 8, domain: '时间与变化', points: ['等差数列', '求和'],
    alias: ['等差数列', '求和'], hook: '数列器每走一拍多出一项，并算出前几项的和。设好第一项和公差，让它走到第 20 项。',
    shelf: ['seq', 'meter', 'clock', 'compare'],
    build: mk({ ents: [{ type: 'seq', x: 120, y: 90, role: 's' }] }),
    predict: { q: '先猜：前 20 项的和——', options: [{ v: 800, label: '800' }, { v: 820, label: '820' }, { v: 840, label: '840' }], reveal: () => ({ v: 820, label: '820' }) },
    milestones: [
      { id: 'set', say: '第一项 3，公差 4', score: 3, when: (w) => w.some('seq', (e) => e.props.first === 3 && e.props.diff === 4 && e.props.mode === 0), hints: ['3、7、11……每次加 4。', '第一项 3，公差 4，类型等差。', '三个属性。'] },
      { id: 'sum', say: '走到第 20 项，和 = 820', score: 7, when: { type: 'seq', port: 'sum', op: '=', value: '820' }, hints: ['让时钟走起来，数着项数。', '用“走一拍”可以精确停在第 20 项。', '第 20 项是 79，和 = 20 × (3+79) ÷ 2。'] },
    ],
    traps: [], why: '等差数列求和：n 项和 = n × (首项 + 末项) ÷ 2 = 20 × (3 + 79) ÷ 2 = 820。',
    ref: ['seq|0'],
  });

  U.problems.push(...P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
