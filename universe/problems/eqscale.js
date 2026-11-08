/* 解方程天平：等式的性质，从“拿走一样的”到“两边都有盒子”。 */
(function (G) {
  'use strict';
  const U = G.U, mk = U.mkScene, P = [];
  const sc = (props) => mk({ ents: [{ type: 'eqscale', x: 100, y: 70, role: 's', props }] });
  const bal = (f) => (w) => w.some('eqscale', (e) => w.bool(e, 'ok') === true && f(e.props));
  P.push({
    id: 'eq-take-away', title: '盒子加 5 个砝码，和 12 一样重。盒子多重？', grade: 5, domain: '关系', points: ['等式的性质', '方程'],
    alias: ['方程'], hook: '左盘：一个盒子 + 5。右盘：12。盒子里的重量藏起来了。想知道盒子多重，就得让盒子单独待在一边。你只能改盘里的东西——两边要一起改，天平才不会歪。',
    shelf: ['eqscale', 'meter', 'compare'],
    build: sc({ lx: 1, lc: 5, rx: 0, rc: 12, x0: 7 }),
    predict: { q: '先猜：盒子重——', options: [{ v: 5, label: '5' }, { v: 7, label: '7' }, { v: 12, label: '12' }], reveal: () => ({ v: 7, label: '7' }) },
    milestones: [
      { id: 'left', say: '把左盘的砝码拿光，天平还平衡（右盘也要拿 5 个）', score: 5, when: bal((p) => p.lc === 0 && p.lx === 1), hints: ['只拿左边，天平会歪。', '左右两边同时拿走 5。', '左 lc=0，右 rc=7。'] },
      { id: 'solved', say: '读出盒子的重量', score: 5, when: { role: 's', port: 'solved', op: '=', value: '7' }, hints: ['盒子单独一边，另一边就是答案。', '12 − 5。', '7。'] },
    ],
    traps: [], why: '等式的性质：两边同时减去同一个数，天平仍然平衡。x + 5 = 12 两边同减 5，得 x = 7。如果只减一边，天平就歪了。', ref: ['eqscale|0'],
  });
  P.push({
    id: 'eq-divide', title: '两个盒子和 10 一样重。一个盒子多重？', grade: 6, domain: '关系', points: ['等式的性质', '除以同一个数'],
    alias: ['方程'], hook: '左盘：两个盒子。右盘：10。把两个盒子变成一个，右边也要跟着变。',
    shelf: ['eqscale', 'meter', 'compare'],
    build: sc({ lx: 2, lc: 0, rx: 0, rc: 10, x0: 5 }),
    predict: { q: '先猜：一个盒子重——', options: [{ v: 2, label: '2' }, { v: 5, label: '5' }, { v: 10, label: '10' }], reveal: () => ({ v: 5, label: '5' }) },
    milestones: [
      { id: 'half', say: '两边都减半，天平仍然平衡', score: 5, when: bal((p) => p.lx === 1 && p.rc === 5), hints: ['左边变成 1 个盒子。', '右边怎么变才不歪？', '左 lx=1，右 rc=5。'] },
      { id: 'solved', say: '读出盒子的重量 5', score: 5, when: { role: 's', port: 'solved', op: '=', value: '5' }, hints: ['盒子单独一边。', '10 ÷ 2。', '5。'] },
    ],
    traps: [], why: '等式的性质：两边同时除以同一个数（不为 0），等式仍然成立。2x = 10 两边都除以 2，得 x = 5。', ref: ['eqscale|0'],
  });
  P.push({
    id: 'eq-both-sides', title: '3 个盒子 + 2 = 1 个盒子 + 8，盒子多重？', grade: 7, domain: '关系', points: ['一元一次方程', '移项', '等式的性质'],
    alias: ['方程', '移项'], hook: '两边都有盒子。先想办法让盒子只留在一边：两边同时拿走一个盒子。再拿走砝码，最后分一分。',
    shelf: ['eqscale', 'meter', 'compare'],
    build: sc({ lx: 3, lc: 2, rx: 1, rc: 8, x0: 3 }),
    predict: { q: '先猜：盒子重——', options: [{ v: 1, label: '1' }, { v: 3, label: '3' }, { v: 6, label: '6' }], reveal: () => ({ v: 3, label: '3' }) },
    milestones: [
      { id: 'drop1', say: '两边各拿走 1 个盒子，天平还平', score: 3, when: bal((p) => p.lx === 2 && p.rx === 0 && p.lc === 2 && p.rc === 8), hints: ['右边盒子清掉，左边也要少一个。', '盒子数两边各减 1。', '左 lx=2，右 rx=0。'] },
      { id: 'drop2', say: '两边各拿走 2 个砝码，天平还平', score: 3, when: bal((p) => p.lx === 2 && p.lc === 0 && p.rc === 6), hints: ['左边砝码清掉。', '两边各减 2。', '左 lc=0，右 rc=6。'] },
      { id: 'solved', say: '最后两边都除以 2，读出盒子的重量 3', score: 4, when: { role: 's', port: 'solved', op: '=', value: '3' }, hints: ['左边还有 2 个盒子。', '两边一起除以 2。', 'lx=1，rc=3。'] },
    ],
    traps: [], why: '解方程就是反复用等式的性质：两边同减盒子，同减砝码，同除一个数。3x+2=x+8 → 2x+2=8 → 2x=6 → x=3。课本里的“移项”，其实就是“两边同时减去”的简写。', ref: ['eqscale|0'],
  });
  U.problems.push(...P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
