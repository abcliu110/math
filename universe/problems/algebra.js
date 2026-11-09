/* 变量盒：字母表示“任意数”，恒等式与方程的区别。 */
(function (G) {
  'use strict';
  const U = G.U, mk = U.mkScene, P = [];
  const vb = (left, right) => mk({ ents: [{ type: 'variable', x: 80, y: 80, role: 'v', props: { left, right } }] });
  P.push({
    id: 'square-expand', essence: ['E8'], title: '(x+1)² 展开，是 x²+几x+1？', grade: 7, domain: '关系', points: ['8.6'], topics: ['完全平方公式', '恒等式'],
    alias: ['乘法公式'], hook: '左边是 (x+1)^2，右边先写 x^2+1（很多人会这样“展开”）。看看哪些 x 让两边相等，再改右边，让所有 x 都相等（全绿）。',
    shelf: ['variable', 'meter', 'compare'],
    build: vb('(x+1)^2', 'x'),
    predict: { q: '先猜：(x+1)² 等于 x²+1 吗？', options: [{ v: 0, label: '总是相等' }, { v: 1, label: '只有个别 x 相等' }, { v: 2, label: '从不相等' }], reveal: () => ({ v: 1, label: '只有 x=0 相等' }) },
    milestones: [
      { id: 'only0', say: '右边写 x^2+1，只有一个 x 让两边相等', score: 3, when: { role: 'v', port: 'hits', op: '=', value: '1' }, hints: ['看红绿点。', '只有一个绿点。', 'x = 0。'] },
      { id: 'all', say: '改右边，让所有 x 都相等', score: 7, when: { role: 'v', port: 'all', op: '=', value: '1' }, hints: ['(x+1)(x+1) = x·x + x + x + 1。', '中间多了两个 x。', '右边写 x^2+2*x+1。'] },
    ],
    traps: [], why: '(x+1)² = x²+2x+1 对每个 x 都成立，这叫恒等式。x²+1 只在 x=0 时相等，那是方程。中间的 2x 是 x·1 + 1·x 两块长条。', ref: ['variable|0'],
  });
  P.push({
    id: 'diff-squares', essence: ['E8', 'E2'], title: 'x²−1 能拆成两个括号相乘吗？', grade: 8, domain: '关系', points: ['8.6', '8.7'], topics: ['平方差公式', '因式分解'],
    alias: ['乘法公式', '因式分解'], hook: '左边 x^2-1，右边先写 (x-1)*(x-1)。改右边，让所有 x 都相等。',
    shelf: ['variable', 'meter', 'compare'],
    build: vb('x^2-1', '(x-1)*(x-1)'),
    predict: { q: '先猜：x²−1 = (x−1)(x−1)？', options: [{ v: 0, label: '总是' }, { v: 1, label: '只有个别 x' }, { v: 2, label: '从不' }], reveal: () => ({ v: 1, label: '只有 x=1' }) },
    milestones: [
      { id: 'all', say: '改成 x²−1 的正确拆法（全绿）', score: 10, when: { role: 'v', port: 'all', op: '=', value: '1' }, hints: ['一个括号里是减，另一个呢？', '(x−1)(x+1)。', '右边写 (x-1)*(x+1)。'] },
    ],
    traps: [], why: '(x−1)(x+1) = x²+x−x−1 = x²−1，中间的 +x 和 −x 抵消。这就是平方差公式。', ref: ['variable|0'],
  });
  P.push({
    id: 'equation-vs-identity', essence: ['E8', 'E4'], title: '2x+1 = 7：是恒等，还是只有一个 x？', grade: 6, domain: '关系', points: ['5.5'], topics: ['方程的解', '字母表示数'],
    alias: ['方程'], hook: '把左边设成 2*x+1，右边设成 7。哪个 x 让两边相等？它是一个“解”，不是“所有 x”。',
    shelf: ['variable', 'meter', 'compare'],
    build: vb('x', 'x'),
    predict: { q: '先猜：2x+1=7 有几个 x 成立？', options: [{ v: 0, label: '没有' }, { v: 1, label: '一个' }, { v: 2, label: '所有' }], reveal: () => ({ v: 1, label: '一个：x=3' }) },
    milestones: [
      { id: 'set', say: '左边 2x+1，右边 7，只有一个 x 成立', score: 5, when: (w) => w.some('variable', (e) => e.props.left.replace(/\s/g, '') === '2*x+1' && e.props.right.trim() === '7' && w.num(e, 'hits') === 1), hints: ['改左边和右边的式子。', '乘号写 *。', '2*x+1 与 7。'] },
      { id: 'sol', say: '读出解 x = 3', score: 5, when: { role: 'v', port: 'first', op: '=', value: '3' }, hints: ['看绿点在哪。', '“第一个相等的 x”。', '3。'] },
    ],
    traps: [], why: '恒等式对所有 x 成立，方程只对少数 x 成立。解方程，就是在找那几个让两边相等的 x。', ref: ['variable|0'],
  });
  U.problems.push(...P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
