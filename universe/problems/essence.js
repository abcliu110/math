/* 本质题：猜想与反例。“试了很多都对”不等于证明；一个反例就能推翻。 */
(function (G) {
  'use strict';
  const U = G.U, mk = U.mkScene, P = [];
  const conj = (props) => mk({ ents: [{ type: 'conjecture', x: 80, y: 80, role: 'c', props }] });
  P.push({
    id: 'odd-sum-law', essence: ['E9', 'E8'], title: '前 n 个奇数的和，有什么规律？', grade: 5, domain: '关系', points: ['1.16'], topics: ['找规律', '猜想', '平方数'],
    alias: ['规律', '猜想'], hook: '1，1+3，1+3+5……和是多少？写一个关于 n 的公式，器材会把 n 从 1 试到你指定的数。注意：试了很多都对，只是证据，不是证明。',
    shelf: ['conjecture', 'meter', 'op'],
    build: conj({ law: 0, expr: '2*n', upto: 10 }),
    predict: { q: '先猜：n 个奇数的和是——', options: [{ v: 0, label: '2n' }, { v: 1, label: 'n 乘 n' }, { v: 2, label: 'n + 1' }], reveal: () => ({ v: 1, label: 'n 乘 n（平方数）' }) },
    milestones: [
      { id: 'try', say: '改一个公式试试（不再是 2*n）', score: 2, when: (w) => w.some('conjecture', (e) => e.props.expr !== '2*n' && w.num(e, 'tested') !== null), hints: ['看红点：2*n 在 n=1 就错了。', '1 个奇数的和是 1。', '想想 1、4、9、16……'] },
      { id: 'good', say: '写出对的公式，并试到 20 以上', score: 8, when: (w) => w.some('conjecture', (e) => w.num(e, 'good') === 1 && e.props.upto >= 20), hints: ['1、4、9、16……是什么数？', '平方数：n 乘 n，也可以写 n^2。', '把公式改成 n*n，再把“试到”调到 20。'] },
    ],
    traps: [], why: '1+3+5+…+(2n−1)=n²。例子只能给证据；真正的“为什么”是：每次多加一圈（一个拐角形的奇数个小方块），正方形边长加 1。',
    ref: ['conjecture|0'],
  });
  P.push({
    id: 'polygon-law', essence: ['E9', 'E8'], title: 'n 边形的内角和公式是什么？', grade: 7, domain: '图形', points: ['7.9'], topics: ['多边形内角和', '猜想'],
    alias: ['内角和'], hook: '三角形 180°，四边形 360°，五边形 540°……写出 n 边形内角和的公式，让器材替你检验。',
    shelf: ['conjecture', 'polygon', 'meter'],
    build: conj({ law: 1, expr: '180*n', upto: 8 }),
    predict: { q: '先猜：内角和每多一条边——', options: [{ v: 0, label: '多 90°' }, { v: 1, label: '多 180°' }, { v: 2, label: '多 360°' }], reveal: () => ({ v: 1, label: '多 180°（多一个三角形）' }) },
    milestones: [
      { id: 'try', say: '改一个公式试试（不再是 180*n）', score: 2, when: (w) => w.some('conjecture', (e) => e.props.expr !== '180*n' && w.num(e, 'tested') !== null), hints: ['看红点：180*n 在 n=3 就错了。', '三角形的内角和是 180°。', '每多一条边多 180°。'] },
      { id: 'good', say: '找到对的公式，全部通过', score: 8, when: (w) => w.some('conjecture', (e) => w.num(e, 'good') === 1), hints: ['每多一条边，多 180°。', '三角形 n=3 时是 180，所以要减掉一些。', '180*(n-2)。'] },
    ],
    traps: [], why: 'n 边形可以从一个顶点分成 (n−2) 个三角形，每个 180°，所以内角和是 180×(n−2)。',
    ref: ['conjecture|0'],
  });
  P.push({
    id: 'euler-prime', essence: ['E9'], title: 'n×n+n+41 总是质数吗？', grade: 7, domain: '关系', points: ['5.8'], topics: ['质数', '反例', '证明与证据'],
    alias: ['反例', '质数'], hook: 'n=1 时 43，n=2 时 47，n=3 时 53……都是质数。试了 30 个，全对！那它总是质数吗？把“试到”调大，看看会发生什么。',
    shelf: ['conjecture', 'numtheory', 'meter'],
    build: conj({ law: 3, expr: '', upto: 30 }),
    predict: { q: '先猜：n×n+n+41 总是质数吗？', options: [{ v: 0, label: '总是' }, { v: 1, label: '不总是' }, { v: 2, label: '说不准' }], reveal: () => ({ v: 1, label: '不总是：n = 40 时不是质数' }) },
    milestones: [
      { id: 'cex', say: '把“试到”调大，找到反例', score: 7, when: (w) => w.some('conjecture', (e) => w.num(e, 'bad') !== null), hints: ['调大“试到 n =”。', '试到 40 以上。', 'n = 40 时是 1681 = 41×41。'] },
      { id: 'forty', say: '反例是 n = 40', score: 3, when: { role: 'c', port: 'bad', op: '=', value: '40' }, hints: ['看红色的点在哪里。', '第一个红点。', '40。'] },
    ],
    traps: [], why: '1681 = 41×41，不是质数。试了 39 个都对，一个反例就推翻：许多例子不能证明，一个反例就能证伪。数学要的是“为什么一定”。',
    ref: ['conjecture|0'],
  });
  U.problems.push(...P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
