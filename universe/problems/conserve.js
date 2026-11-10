/* 本质题：守恒与不变量。倒水：水的位置变了，水的总量没变。 */
(function (G) {
  'use strict';
  const U = G.U, mk = U.mkScene, P = [];
  const pour = (props) => mk({ ents: [{ type: 'pour', x: 120, y: 80, role: 'p', props }] });

  P.push({
    id: 'pour-conserve', essence: ['E5', 'E3'], title: '甲杯的水倒进乙杯，水变少了吗？', grade: 4, domain: '数与运算', points: ['5.9'], topics: ['守恒', '总量不变', '搬家'],
    alias: ['守恒', '倒水', '总量'], hook: '甲杯装满 10，乙杯空着，乙杯最多装 6。把“倒水”选成“甲倒进乙”，再读“总量”和两杯各剩多少。',
    shelf: ['pour', 'num', 'compare'],
    build: pour({ A: 10, B: 6, a: 10, b: 0, pour: 0 }),
    predict: { q: '先猜：倒完以后，两杯水的总量——', options: [{ v: 4, label: '4（甲剩下的）' }, { v: 10, label: '10' }, { v: 6, label: '6（乙的容量）' }], reveal: () => ({ v: 10, label: '10' }) },
    milestones: [
      { id: 'pour', say: '选「甲倒进乙」', score: 3, when: (w) => w.some('pour', (e) => e.props.pour === 1), hints: ['属性「倒水」。', '选「甲倒进乙」。', '选了以后，两杯水会重新分配。'] },
      { id: 'levels', say: '倒完：甲剩 4，乙是 6', score: 4, when: (w) => w.some('pour', (e) => e.props.pour === 1 && w.num(e, 'after_a') === 4 && w.num(e, 'after_b') === 6), hints: ['乙最多装 6，乙只能收 6 - 0 = 6。', '能倒过去的是 6：甲 10 − 6 = 4，乙 0 + 6 = 6。', '甲剩 4，乙是 6。'] },
      { id: 'total', say: '总量还是 10', score: 3, when: (w) => w.some('pour', (e) => e.props.pour === 1 && w.num(e, 'total') === 10 && w.num(e, 'after_a') + w.num(e, 'after_b') === 10), hints: ['看「总量」输出。', '甲的水 + 乙的水 = ?', '4 + 6 = 10：水换了位置，总量没变。'] },
    ],
    traps: [], why: '甲杯 10，乙杯最多装 6，所以只能倒过去 6：甲剩 4，乙是 6。总量 4 + 6 = 10，和倒之前一样。每一杯的水都变了，水的总量没变：这就是守恒。',
    ref: ['pour|0'],
  });

  P.push({
    id: 'pour-two-cups', essence: ['E5', 'E2'], title: '只用 5 升和 3 升的杯子，怎么量出 4 升？', grade: 5, domain: '数与运算', points: ['8.7'], topics: ['倒水', '守恒', '分解'],
    alias: ['倒水', '量出', '4 升'], hook: '甲杯 5 升，乙杯 3 升，杯上没有刻度。只能装满、倒空、从一个倒进另一个。想办法让甲或乙里正好剩 4 升。',
    shelf: ['pour', 'num', 'compare'],
    build: pour({ A: 5, B: 3, a: 0, b: 0, pour: 0 }),
    predict: { q: '先猜：只用这两个杯子量出 4 升，至少要倒几次？', options: [{ v: 2, label: '2 次' }, { v: 3, label: '3 次' }, { v: 5, label: '5 次' }], reveal: () => ({ v: 3, label: '3 次' }) },
    milestones: [
      { id: 'three', say: '倒完：乙杯正好 3 升，甲剩 2 升', score: 3, when: (w) => w.some('pour', (e) => e.props.pour === 1 && e.props.a > 0 && w.num(e, 'after_b') === 3 && w.num(e, 'after_a') === 2), hints: ['先把甲装满 5 升。', '甲倒进乙：乙只能收 3，甲剩 2。', '甲装了填 5，倒水选「甲倒进乙」。'] },
      { id: 'four', say: '甲或乙里正好 4 升', score: 7, when: (w) => w.some('pour', (e) => e.props.pour === 1 && e.props.a > 0 && (w.num(e, 'after_a') === 4 || w.num(e, 'after_b') === 4)), hints: ['把乙倒空，甲剩下的 2 升倒进乙（乙 2）。再把甲装满 5 升，倒进乙：乙只能收 1，甲剩 4。', '每倒一次，把“甲装了”“乙装了”改成倒完的读数，再接着倒。', '顺序：甲 5 → 倒进乙；乙倒空；甲 2 → 倒进乙；甲 5 → 倒进乙。'] },
    ],
    traps: [], why: '甲 5 倒进乙 3，甲剩 2；倒空乙，把甲的 2 倒进乙（乙 2）；甲再装满 5，倒进乙，乙只能再收 1，甲剩 4。4 升就量出来了。关键是每次倒水前后都算清两杯各有多少：总量只会在两杯之间搬家。',
    ref: ['pour|0'],
  });

  U.problems.push(...P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
