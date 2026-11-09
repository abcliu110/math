/* 本质题：剪拼与不变量。剪开、平移，形状变了，面积不变。 */
(function (G) {
  'use strict';
  const U = G.U, mk = U.mkScene, P = [];
  const para = (props) => mk({ ents: [{ type: 'parallelogram', x: 120, y: 80, role: 'pg', props }] });

  P.push({
    id: 'para-area', essence: ['E5', 'E2'], title: '平行四边形的面积怎么求？', grade: 5, domain: '图形', points: ['8.12'], topics: ['平行四边形面积', '底乘高', '剪拼'],
    alias: ['平行四边形', '面积', '底乘高'], hook: '先把一端的直角三角形剪下来，平移到另一端，看看拼成了什么形状。然后把底改成 6、高改成 4，读“面积”。',
    shelf: ['parallelogram', 'meter', 'op'],
    build: para({ b: 5, h: 3, s: 2 }),
    predict: { q: '先猜：底 6、高 4 的平行四边形，面积是——', options: [{ v: 18, label: '18' }, { v: 24, label: '24' }, { v: 10, label: '10' }], reveal: () => ({ v: 24, label: '24' }) },
    milestones: [
      { id: 'set', say: '底 6、高 4', score: 3, when: (w) => w.some('parallelogram', (e) => e.props.b === 6 && e.props.h === 4), hints: ['属性有「底」「高」。', '底 = 6，高 = 4。', '两个都要改。'] },
      { id: 'area', say: '面积 24', score: 4, when: { role: 'pg', port: 'area', op: '=', value: '24' }, hints: ['面积 = 底 × 高。', '6 × 4。', '24。'] },
    ],
    traps: [], why: '把平行四边形一端的直角三角形剪下来，平移到另一端，就拼成一个长方形：长是底，宽是高。所以面积 = 底 × 高 = 6 × 4 = 24。斜着放、斜着剪，面积都不变。',
    ref: ['parallelogram|0'],
  });

  P.push({
    id: 'cut-invariant', essence: ['E5', 'E2'], title: '推斜了，面积会变吗？', grade: 5, domain: '图形', points: ['8.12'], topics: ['不变量', '平行四边形面积', '斜与高'],
    alias: ['不变量', '斜', '剪拼'], hook: '底 6、高 4，面积 24。现在把上边往右推，斜度改成 8。面积会变吗？先猜，再看读数。',
    shelf: ['parallelogram', 'meter', 'compare'],
    build: para({ b: 6, h: 4, s: 0 }),
    predict: { q: '先猜：斜度从 0 改到 8，面积——', options: [{ v: 0, label: '变大' }, { v: 1, label: '变小' }, { v: 2, label: '不变' }], reveal: () => ({ v: 2, label: '不变（仍是 24）' }) },
    milestones: [
      { id: 'slant', say: '斜度改成 8', score: 3, when: (w) => w.some('parallelogram', (e) => e.props.s === 8), hints: ['属性「斜度」是上边往右平移的距离。', '把斜度改成 8。', '斜度 = 8。'] },
      { id: 'keep', say: '斜度 8 时，面积仍是 24', score: 5, when: (w) => w.some('parallelogram', (e) => e.props.s === 8 && e.props.b === 6 && e.props.h === 4 && w.num(e, 'area') === 24), hints: ['看「面积」读数。', '斜度变了，底和高没变。', '面积 = 底 × 高 = 6 × 4。'] },
    ],
    traps: [], why: '上边往右推，形状变斜了，但高没变，底也没变。仍可以像上一题那样剪一个直角三角形、平移，拼回底 6、高 4 的长方形。变的是形状，不变的是面积：这就是不变量。',
    ref: ['parallelogram|0'],
  });

  U.problems.push(...P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
