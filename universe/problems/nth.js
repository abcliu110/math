/* 取第 n 项：时钟驱动，每拍取一个数。 */
(function (G) {
  'use strict';
  const U = G.U, mk = U.mkScene, P = [];
  P.push({
    id: 'nth-tenth', title: '第 10 拍，取到的数是 21？', grade: 6, domain: '时间与变化', essence: ['E6', 'E8'], points: ['数列', '通项'],
    alias: ['数列', '规律'], hook: '这个器材每一拍都看“现在是第几拍”，再按规则算出一个数。把规则设成 2×n + 1，让时钟走到第 10 拍，看它取到多少。',
    shelf: ['nth', 'meter', 'compare'],
    build: mk({ ents: [{ type: 'nth', x: 140, y: 100, role: 'g', props: { a: 1, b: 0, mode: 0 } }] }),
    predict: { q: '先猜：规则 2n+1，第 10 拍取到——', options: [{ v: 11, label: '11' }, { v: 21, label: '21' }, { v: 10, label: '10' }], reveal: () => ({ v: 21, label: '21（2×10+1）' }) },
    goal: ['rule', 'ten'],
    milestones: [
      { id: 'rule', say: '把规则设成 2n + 1', score: 3, when: (w) => w.some('nth', (e) => e.props.a === 2 && e.props.b === 1 && e.props.mode === 0), hints: ['看属性 a（系数）和 b（常数）。', 'a 填 2，b 填 1。', '2×n + 1。'] },
      { id: 'ten', say: '走到第 10 拍，取到 21', score: 7, when: (w) => w.some('nth', (e) => e.props.a === 2 && e.props.b === 1 && w.num(e, 'v') === 21), hints: ['点播放，或者单步前进。', '每拍 n 加 1，要数到第 10 拍。', '2×10+1 = 21。'] },
    ],
    traps: [], why: '第 n 项由 n 决定，与上一项无关：这是通项公式。时钟的拍数 n 就是“第几项”，取数就是代入。',
    ref: ['nth|0'],
  });
  U.problems.push(...P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
