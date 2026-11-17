/* “证明台”的题。看第 1 块、看推一级、推倒多米诺；给每步点依据；拼猜想试例子。判分只看器材的输出。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const pb = (props) => () => { const s = W.blank(); const id = W.add(s, 'proofbench', 40, 50, props); s.entities[id].role = 'pf'; return s; };
  const P = [];
  const base = { domain: '关系', level: 'stretch', shelf: ['proofbench'], traps: [], predict: null };
  const add = (o) => P.push(Object.assign({}, base, o));
  const ms = (id, say, score, port, value, hints) => ({ id, say, score, when: { role: 'pf', port, op: '=', value: String(value) }, hints });

  add({
    id: 'pd-false-base', essence: ['E9', 'E6'], title: '推一级没问题，就一定对吗？', grade: 8, rung: 5, points: ['7.4'],
    topics: ['数学归纳法', '起点'], alias: ['归纳', '多米诺', '起点'],
    hook: '有人说 1 + 3 + … + (2n − 1) = n² + 1。先看任意一块能不能推倒下一块，再看第 1 块。最后推一推。',
    build: pb({ mode: 0, rule: 4 }),
    milestones: [ms('step', '推一级是恒等式', 3, 'step', 1, ['点“看任意一块推下一块”。', '(k² + 1) + (2k + 1) = (k + 1)² + 1。', '两边一样：推一级没问题。']), ms('base', '可第 1 块不成立：1 ≠ 2', 5, 'base', 0, ['点“看第 1 块”。', '左边 1，右边 1² + 1 = 2。', '起点不对。'])],
    goal: ['step', 'base'],
    why: '推一级没问题，只说明“前一块倒了，后一块就倒”。可第 1 块根本不倒（1 ≠ 2），后面一块也不会倒。证明要两件事：起点成立，每一级推下一级，缺一不可。',
  });
  add({
    id: 'pd-breaks', essence: ['E9', 'E6'], title: 'n = 1、2 都对，就一直对吗？', grade: 8, rung: 5, points: ['7.4'],
    topics: ['数学归纳法', '例子不等于证明'], alias: ['归纳', '多米诺', '反例'],
    hook: '有人说 1 + 2 + … + n = n² − n + 1。n = 1：1 = 1，n = 2：3 = 3，都对！看第 1 块，看推一级，再推倒第一块：骨牌会一直倒下去吗？',
    build: pb({ mode: 0, rule: 5 }),
    milestones: [ms('stop', '骨牌停在第 2 块：n = 3 时不成立', 6, 'failedAt', 2, ['先看第 1 块，再看推一级。', '推一级两边不一样。', '推倒第一块：第 3 块没倒。'])],
    goal: ['stop'],
    why: 'n = 1、2 对，n = 3 时左边 6、右边 7。推一级不是恒等式，所以总有推不下去的地方。前几个例子对，不等于都对。',
  });
  add({
    id: 'pd-conj-prime', essence: ['E9', 'E1'], title: '“如果 n 是质数，那么 n 是奇数”对吗？', grade: 5, rung: 3, points: ['5.8'],
    topics: ['猜想', '反例', '质数'], alias: ['猜想', '反例', '质数'],
    hook: '3、5、7、11、13……质数好像都是奇数。拼出这条猜想，在 1 到 30 里试试。',
    build: pb({ mode: 2 }),
    milestones: [ms('counter', '找到反例：2 是质数，但不是奇数', 6, 'counter', 2, ['如果点“n 是质数”，那么点“n 是奇数”。', '点“在 1 到 30 里试例子”。', '最小的质数 2 是偶数。'])],
    goal: ['counter'],
    why: '一个反例就够推翻一条猜想：2 是质数，可它是偶数。所以“质数都是奇数”不对；除了 2 以外的质数都是奇数。',
  });
  U.problems.push.apply(U.problems, P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
