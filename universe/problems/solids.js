/* 图形与数据：多边形内角、长方体、平均数 vs 中位数。 */
(function (G) {
  'use strict';
  const U = G.U, mk = U.mkScene;
  const P = [];

  P.push({
    id: 'hexagon-angle', title: '正六边形每个内角是多少度？', grade: 7, domain: '图形', points: ['多边形内角和', '正多边形'],
    alias: ['内角和'], hook: '把边数调成 6，读“每个内角”。再试试别的边数，找找规律。',
    shelf: ['polygon', 'meter', 'compare'],
    build: mk({ ents: [{ type: 'polygon', x: 120, y: 80, role: 'p', props: { n: 4 } }] }),
    predict: { q: '先猜：正六边形每个内角——', options: [{ v: 108, label: '108°' }, { v: 120, label: '120°' }, { v: 135, label: '135°' }], reveal: () => ({ v: 120, label: '120°' }) },
    milestones: [
      { id: 'six', say: '把边数调成 6', score: 3, when: (w) => w.some('polygon', (e) => e.props.n === 6), hints: ['属性「几条边」。', 'n = 6。', '六边形。'] },
      { id: 'sum', say: '内角和是 720°', score: 3, when: { role: 'p', port: 'sum', op: '=', value: '720' }, hints: ['内角和 = (n − 2) × 180。', '(6 − 2) × 180。', '720。'] },
      { id: 'each', say: '每个内角 120°', score: 4, when: { role: 'p', port: 'each', op: '=', value: '120' }, hints: ['720 ÷ 6。', '正多边形每个角一样大。', '120。'] },
    ],
    traps: [], why: 'n 边形可以分成 (n−2) 个三角形，内角和 (n−2)×180°。正六边形：4×180=720°，每个角 720÷6=120°。',
    ref: ['polygon|0'],
  });

  P.push({
    id: 'cuboid-vol', title: '长 6、宽 4、高 3 的长方体，体积和表面积？', grade: 6, domain: '图形', points: ['长方体体积', '表面积'],
    alias: ['体积'], hook: '把长宽高调成 6、4、3，读出体积和表面积。再想想：哪个是“占多大地方”，哪个是“包起来要多少纸”。',
    shelf: ['cuboid', 'meter', 'op'],
    build: mk({ ents: [{ type: 'cuboid', x: 120, y: 80, role: 'c' }] }),
    predict: { q: '先猜：体积是——', options: [{ v: 13, label: '13（6+4+3）' }, { v: 72, label: '72' }, { v: 108, label: '108' }], reveal: () => ({ v: 72, label: '72' }) },
    milestones: [
      { id: 'set', say: '长 6、宽 4、高 3', score: 3, when: (w) => w.some('cuboid', (e) => e.props.l === 6 && e.props.w === 4 && e.props.h === 3), hints: ['三个属性。', '长 6，宽 4，高 3。', '都要改。'] },
      { id: 'vol', say: '体积 72', score: 4, when: { role: 'c', port: 'vol', op: '=', value: '72' }, hints: ['长 × 宽 × 高。', '6×4×3。', '72。'] },
      { id: 'surf', say: '表面积 108', score: 3, when: { role: 'c', port: 'surf', op: '=', value: '108' }, hints: ['6 个面：上下、前后、左右。', '2×(24 + 18 + 12)。', '108。'] },
    ],
    traps: [{ id: 'sum', when: { role: 'c', port: 'vol', op: '=', value: '13' }, wrong: '体积是“占多大地方”，要三个数连乘，不是相加。' }],
    why: '体积 = 长×宽×高 = 6×4×3 = 72；表面积 = 2×(长宽 + 长高 + 宽高) = 2×(24+18+12) = 108。',
    ref: ['cuboid|0'],
  });

  P.push({
    id: 'mean-vs-median', title: '一个特别大的数，把平均数拉走了', grade: 8, domain: '统计与概率', points: ['平均数', '中位数', '极端值'],
    alias: ['平均数', '中位数'], hook: '五个人月收入：3、4、4、5、40（千元）。先把这组数填进数据表，再读平均数和中位数：哪个更能代表“一般水平”？',
    shelf: ['data', 'stats', 'meter', 'compare'],
    build: mk({ ents: [{ type: 'data', x: 100, y: 100, role: 'd', props: { list: '3', lo: 0, hi: 50 } }] }),
    predict: { q: '先猜：平均数是——', options: [{ v: 5, label: '5 左右' }, { v: 11, label: '11 左右' }, { v: 20, label: '20 左右' }], reveal: () => ({ v: 11.2, label: '11.2（被 40 拉高了）' }) },
    milestones: [
      { id: 'mean', say: '填入 3, 4, 4, 5, 40，平均数是 11.2', score: 3, when: { role: 'd', port: 'mean', op: '=', value: '56/5' }, hints: ['数据表自己就能读。', '看“平均数”输出。', '56 ÷ 5 = 11.2。'] },
      { id: 'med', say: '读出中位数 4', score: 3, when: { role: 'd', port: 'median', op: '=', value: '4' }, hints: ['排好序，站中间的那个。', '3、4、4、5、40 的第 3 个。', '4。'] },
      { id: 'fix', say: '把 40 改成 4，平均数降到 4 左右', score: 4, when: (w) => w.some('data', (e) => { const m = w.num(e, 'mean'); return m !== null && m < 5 && e.props.list !== '3, 4, 4, 5, 40'; }), hints: ['改“一组数”。', '把 40 换成一个正常的数。', '例如 3, 4, 4, 5, 4。'] },
    ],
    traps: [], why: '平均数会被极端值拉走：11.2 比五个人里的四个人都高；中位数 4 更能代表一般水平。数据里有特别大或特别小的数时，要看中位数。',
    ref: ['data|0'],
  });

  U.problems.push(...P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
