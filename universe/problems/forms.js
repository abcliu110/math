/* 一个道理，几种样子（docs/essence-forms.md）：同一个等式同时摆成天平和式子（以后还有线段图、数轴），连成一个联动组。
 * 在哪一台上做一步，另一台当场做同一步；只动一边，两台一起“不平”。判分看两台的输出都解出来。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  // 天平在左，式子在右；两台连成一组（U.Forms 的 lineq），按 a·x + b = c·x + d 摆好
  const pair = (a, b, c, d, x0) => () => {
    const s = W.blank(), bal = W.add(s, 'balancebench', 40, 40, {}), eq = W.add(s, 'eqstepbench', 720, 40, {});
    s.entities[bal].role = 'b'; s.entities[eq].role = 'e';
    U.Forms.join(s, 'lineq', [bal, eq], { a, b, c, d, x0 });
    return s;
  };
  const P = [];
  const base = { domain: '关系', level: 'core', shelf: ['balancebench', 'eqstepbench'], traps: [] };
  const add = (o) => P.push(Object.assign({}, base, o));
  const ms = (id, say, score, role, port, value, hints) => ({ id, say, score, when: { role, port, op: '=', value: String(value) }, hints });
  const tilt = { id: 'tilt', wrong: '只动了一边：天平歪了，式子也写成了 ≠。在另一边做同样的事，两边又一样。', when: { role: 'e', port: 'okn', op: '=', value: '0' } };

  add({
    id: 'ef-2x3-11', essence: ['E4', 'E8'], title: '天平和式子一起做： 2x + 3 = 11', grade: 5, rung: 3, points: ['5.5'],
    topics: ['等式的性质', '解简易方程'], alias: ['方程', '等式的性质', '天平', '式子', '两边同时'],
    hook: '左边是天平，右边是式子，说的是同一件事：2x + 3 = 11。在天平上拿走砝码，看式子怎么往下写；在式子上点一项做一步，看天平怎么动。',
    build: pair(2, 3, 0, 11, 4),
    predict: { q: '在天平上两边各拿走 1 个砝码，式子会写成什么？', options: [{ v: 'a', label: '2x + 2 = 10' }, { v: 'b', label: '2x + 2 = 11' }, { v: 'c', label: '2x + 3 = 10' }], answer: 'a' },
    milestones: [
      ms('apart', '盒子和砝码分开了： 2x = 8', 4, 'e', 'stage', 1, ['先让左边只剩 x。', '两边同时减 3：天平上两边各拿走 3 个砝码，或者在式子上点 3。', '点式子里的 3，再点“两边都减 3”。']),
      ms('solve', '两台都解出来了： x = 4', 5, 'b', 'solved', 4, ['2x = 8，一个 x 是多少？', '两边同时除以 2。', '点“两边 ÷ 2”，或在天平上点“两边都平分成 2 份”。']),
    ],
    traps: [tilt], goal: ['apart', 'solve'],
    why: '天平上“两边各拿走 3 个砝码”和式子上“两边同时减 3”是同一步：两边做同样的事，所以还一样。再两边同时除以 2，得 x = 4。只动一边，天平歪、式子写成 ≠，也是同一件事。',
  });

  U.problems.push.apply(U.problems, P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
