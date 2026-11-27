/* 一个道理，几种样子（docs/essence-forms.md）：同一个等式同时摆成天平、线段图、数轴和式子，两台连成一个联动组。
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
  // 别的样子在左，式子在右：tape 线段图（角色 t）、numline 数轴两边各走（角色 n）
  const withEq = (type, role, w, a, b, c, d, x0) => () => {
    const s = W.blank(), o = W.add(s, type, 40, 40, {}), eq = W.add(s, 'eqstepbench', 40 + w + 40, 40, {});
    s.entities[o].role = role; s.entities[eq].role = 'e';
    U.Forms.join(s, 'lineq', [o, eq], { a, b, c, d, x0 });
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

  add({
    id: 'ef-3x2-x10', essence: ['E4', 'E8'], title: '线段图和式子一起做： 3x + 2 = x + 10', grade: 6, rung: 3, points: ['5.5'], shelf: ['tapebench', 'eqstepbench'],
    topics: ['等式的性质', '解简易方程'], alias: ['方程', '线段图', '两边都有 x', '两边同时减 x', '式子'],
    hook: '左边是线段图，右边是式子：3x + 2 = x + 10。上面一条是 3 段 x 和一截 2，下面一条是 1 段 x 和一截 10，两条一样长。两边都有 x，怎么办？',
    build: withEq('tapebench', 't', 700, 3, 2, 1, 10, 4),
    predict: { q: '两条线段都剪掉一段 x，式子会写成什么？', options: [{ v: 'a', label: '2x + 2 = 10' }, { v: 'b', label: '2x + 2 = x + 10' }, { v: 'c', label: '3x + 2 = 10' }], answer: 'a' },
    milestones: [
      ms('onex', 'x 只在一边了： 2x + 2 = 10', 4, 'e', 'xsides', 1, ['两边都有 x：先让一边没有 x。', '两边同时减 x：两条线段各剪掉一段 x。', '点线段图下面的“两条都剪掉一段 x”，或者点式子右边的 x，再点“两边都减 x”。']),
      ms('apart', 'x 和数分开了： 2x = 8', 3, 'e', 'stage', 1, ['再把左边那一截 2 去掉。', '两边同时减 2：两条右端各剪掉 2。', '把上面那条右端的把手往左拖 2 格（两条一起剪开着）。']),
      ms('solve', '解出来了： x = 4', 5, 'e', 'solved', 4, ['2 段 x 和 8 一样长，一段是多少？', '两边同时除以 2。', '点“两条都平分成 2 份留一份”，或者式子上的“两边 ÷ 2”。']),
    ],
    traps: [{ id: 'tilt', wrong: '只剪了一条：两条对不齐了，式子也写成了 ≠。另一条也剪掉同样长，就又对齐了。', when: { role: 'e', port: 'okn', op: '=', value: '0' } }], goal: ['onex', 'apart', 'solve'],
    why: '两条线段一样长，各剪掉一段 x，剩下的还一样长：这就是“两边同时减 x”，3x + 2 = x + 10 变成 2x + 2 = 10。再两边同时减 2、同时除以 2，得 x = 4。两边都有 x 的方程，先把一边的 x 去掉。',
  });
  add({
    id: 'ef-x5-12', essence: ['E4', 'E8'], title: '数轴和式子一起做： x + 5 = 12', grade: 5, rung: 2, points: ['5.5'], shelf: ['numlinebench', 'eqstepbench'],
    topics: ['等式的性质', '解简易方程', '数轴'], alias: ['方程', '数轴', '试一试', '两边同时', '式子'],
    hook: '左边是数轴：上面一条从 0 跳一下 x、再跳 5；下面一条一下跳到 12。x 是几的时候两条落在同一点？先拖 g 试一试，再一步一步解。',
    build: withEq('numlinebench', 'n', 620, 1, 5, 0, 12, 7),
    predict: { q: '两个落点一起往左走 5，差会怎样？', options: [{ v: 'a', label: '不变' }, { v: 'b', label: '少 5' }, { v: 'c', label: '多 5' }], answer: 'a' },
    milestones: [
      ms('meet', '试出来了：g 拖到解，两个落点重合', 4, 'n', 'meet', 1, ['拖上面的 g：两个落点差多少？', '差变小就是方向对了；差 0 就重合了。', '把 g 拖到 7：左边 7 + 5 = 12，和右边一样。']),
      ms('solve', '式子也解出来了： x = 7', 5, 'e', 'solved', 7, ['要让左边只剩一个 x。', '两边同时减 5：两个落点一起往左走 5。', '把上面的落点往左拖 5 格（两边一起动开着），或者点式子里的 5，再点“两边都减 5”。']),
    ],
    traps: [{ id: 'tilt', wrong: '只动了一边：式子写成了 ≠，数轴上两个落点也分开了。另一边也做同样的事，就又一样了。', when: { role: 'e', port: 'okn', op: '=', value: '0' } }], goal: ['meet', 'solve'],
    why: '数轴上试 g：x + 5 和 12 落在同一点，就说明 g 是解。两边同时减 5，两个落点一起往左走 5，差不变，所以落在一起的还落在一起：x = 7。',
  });

  U.problems.push.apply(U.problems, P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
