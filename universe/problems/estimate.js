/* 估算器的题（docs/new-instruments.md 6.11）：先估再算，看差多少。
 * 估算器在估计填好之前不显示实际值（先猜后看，只遮界面）；猜错不扣分，只记 guess 事件。
 * 题目给数，学生自己放运算器和估算器，先把估计填进估算器，再接上运算器的结果。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const R = (s, id, role) => { s.entities[id].role = role; return id; };
  const P = [];

  P.push({
    id: 'est-29x31', essence: ['E3', 'E2'], title: '29 × 31 大约是多少？先估，再算', grade: 3, domain: '数与运算', points: ['3.11'], level: 'core', rung: 2,
    topics: ['估算', '凑整'], alias: ['估算', '大约', '凑整', '先估再算'],
    hook: '不要先算。想一想：29 接近几，31 接近几？先把你的估计写进估算器，再把运算器的结果接给它，看差多少。',
    shelf: ['num', 'op', 'estimate', 'meter'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 29 }), 'a'); R(s, W.add(s, 'num', 60, 200, { n: 31 }), 'b'); return s; },
    predict: { q: '先猜：29 × 31 大约是——', options: [{ v: 0, label: '600 左右' }, { v: 1, label: '900 左右' }, { v: 2, label: '1200 左右' }], reveal: () => ({ v: 1, label: '900 左右：29 ≈ 30，31 ≈ 30' }) },
    milestones: [
      { id: 'mul', say: '放一台运算器，运算选 ×，接上 29 和 31', score: 2, when: { type: 'op', port: 'r', op: '=', value: '899' },
        hints: ['要算两个数的积，用运算器。', '甲接 29，乙接 31，运算选 ×。', '运算器：甲 = 29，乙 = 31，运算选 ×。'] },
      { id: 'close', say: '估得准：你的估计和实际值相差不到 20%', score: 5, when: { type: 'estimate', port: 'pct', op: '<=', value: '20' },
        hints: ['把 29 和 31 都看成一个整十数。', '估算器的“我估”里写一个数，再把运算器的结果接到“实际值”。', '30 × 30 = 900，“我估”写 900。'] },
    ],
    traps: [], goal: ['mul', 'close'],
    why: '29 ≈ 30，31 ≈ 30，所以 29 × 31 大约是 30 × 30 = 900。实际是 899，只差 1。先把数凑整，再算，是估算最常用的办法。',
  });
  P.push({
    id: 'est-48x52', essence: ['E3', 'E7'], title: '4.8 × 0.52：先估，比 4.8 大还是小？', grade: 5, domain: '数与运算', points: ['5.1'], level: 'core', rung: 3,
    topics: ['小数乘法', '估算', '积与因数的大小'], alias: ['估算', '小数乘法', '大约', '先估再算'],
    hook: '0.52 比 1 小一点，大约是一半。4.8 乘一个比 1 小的数，积会比 4.8 大还是小？先估一个数写进估算器，再算，看差多少。',
    shelf: ['num', 'op', 'estimate', 'meter'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 24, d: 5 }), 'a'); R(s, W.add(s, 'num', 60, 200, { n: 13, d: 25 }), 'b'); return s; },
    predict: { q: '先猜：4.8 × 0.52 的积，比 4.8——', options: [{ v: 0, label: '大' }, { v: 1, label: '小' }, { v: 2, label: '一样' }], reveal: () => ({ v: 1, label: '小：乘一个比 1 小的数，积变小' }) },
    milestones: [
      { id: 'mul', say: '算出 4.8 × 0.52 = 2.496', score: 2, when: { type: 'op', port: 'r', op: '=', value: '2.496' },
        hints: ['两个小数相乘，用运算器。', '甲接 4.8，乙接 0.52，运算选 ×。', '运算器：甲 = 4.8，乙 = 0.52，运算选 ×。'] },
      { id: 'close', say: '估得准：相差不到 20%', score: 5, when: { type: 'estimate', port: 'pct', op: '<=', value: '20' },
        hints: ['0.52 大约是 0.5，也就是一半。', '估算器的“我估”写一个数。', '4.8 的一半是 2.4，“我估”写 2.4。'] },
    ],
    traps: [], goal: ['mul', 'close'],
    why: '0.52 ≈ 0.5，4.8 的一半是 2.4，所以积大约是 2.4。实际是 2.496。乘一个比 1 小的数，积比原来的数小；先估一估，就不会把小数点点错位置。',
  });
  P.push({
    id: 'est-circle', essence: ['E3', 'E7'], title: '半径 5 的圆，面积大约是多少？估一个范围', grade: 6, domain: '数与运算', points: ['6.5'], level: 'core', rung: 3,
    topics: ['圆的面积', '估算', '范围估计'], alias: ['估算', '圆的面积', '范围', '先估再算'],
    hook: '圆在边长 10 的正方形里面，比它小（面积 100）；圆又比里面那个以 5 为边长的正方形的 2 倍大一点……先不算，用估算器估一个范围：面积最少多少，最多多少？再把圆的面积接给估算器揭开。',
    shelf: ['circle', 'estimate', 'meter'],
    build() { const s = W.blank(); R(s, W.add(s, 'circle', 60, 60, { r: 5 }), 'c'); return s; },
    predict: { q: '先猜：半径 5 的圆，面积在——', options: [{ v: 0, label: '25 到 50 之间' }, { v: 1, label: '50 到 100 之间' }, { v: 2, label: '100 到 200 之间' }], reveal: () => ({ v: 1, label: '50 到 100：比里面的正方形（面积 50）大，比外面的正方形（面积 100）小' }) },
    milestones: [
      { id: 'inrange', say: '实际面积 78.5 落在你估的范围里', score: 3, when: { type: 'estimate', port: 'gap', op: '>=', value: '0' },
        hints: ['估算器可以估一个范围，估的方式选“一个范围”。', '“我估，最少”和“最多”各写一个数，再接上圆的面积。', '最少写 50，最多写 100，接上圆的“面积”。'] },
      { id: 'close', say: '估得准：范围的中点离实际值不到 20%', score: 4, when: { type: 'estimate', port: 'pct', op: '<=', value: '20' },
        hints: ['外面的正方形面积是 10 × 10 = 100，里面的是 50。', '圆在两个正方形之间。', '范围写 50 到 100，中点 75，离 78.5 不远。'] },
    ],
    traps: [], goal: ['inrange', 'close'],
    why: '圆在边长 10 的正方形里面，所以面积比 100 小；圆又包住了以半径为对角线一半的正方形（面积 50），所以比 50 大。面积在 50 到 100 之间，实际是 78.5。这样“夹”出来的范围，是估算的重要办法。',
  });
  U.problems.push(...P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
