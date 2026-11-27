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

  // ---------- 四种样子一起做（道理地图 → 两边一样）：天平、式子、线段图、数轴连成一组 ----------
  // 初始位置 2×2：上面天平、式子，下面线段图、数轴（右边一列对齐在 780）。台面适应以后的排版由界面层管。
  // 追问挂在式子台上（ask / pick，和研究台同一套），做过一步才能答；right 是对的那一项是第几个。
  const ASK_Q = '在天平上做的和在式子上做的，是同一件事吗？为什么？';
  const ASK_OPTS = ['*是：都是两边做同样的事', '不是：砝码和数不一样', '是：答案一样就是同一件事'];
  const askOf = (right) => { const o = ASK_OPTS.slice(1); o.splice(right - 1, 0, ASK_OPTS[0]); return ASK_Q + '|' + o.join('|'); };
  const quad = (a, b, c, d, x0, right) => () => {
    const s = W.blank(), bal = W.add(s, 'balancebench', 40, 40, {}), eq = W.add(s, 'eqstepbench', 780, 40, { ask: askOf(right) });
    const tp = W.add(s, 'tapebench', 40, 520, {}), nl = W.add(s, 'numlinebench', 780, 560, {});
    s.entities[bal].role = 'b'; s.entities[eq].role = 'e'; s.entities[tp].role = 't'; s.entities[nl].role = 'n';
    U.Forms.join(s, 'lineq', [bal, eq, tp, nl], { a, b, c, d, x0 });
    return s;
  };
  const why4 = { id: 'why', say: '说清楚了：天平上做的和式子上做的是同一件事', score: 3 };
  const whyHints = ['想一想：天平两边各拿走 3 个砝码，式子上是哪一步？', '两边做同样的事：天平还平，式子还写 =。', '选“是：都是两边做同样的事”。'];
  const base4 = { shelf: ['balancebench', 'eqstepbench', 'tapebench', 'numlinebench'], chain: false, grade: 5, points: ['5.5'], topics: ['等式的性质', '解简易方程'] };
  const tilt4 = { id: 'tilt', wrong: '只动了一边：四块一起“不平”了（天平歪、式子写 ≠、线段对不齐、落点分开）。在另一边做同样的事，四块又一起回来。', when: { role: 'e', port: 'okn', op: '=', value: '0' } };
  const add4 = (o) => add(Object.assign({}, base4, o));

  add4({
    id: 'ef4-2x3-11', essence: ['E4', 'E8'], title: '四种样子一起做： 2x + 3 = 11', rung: 3,
    alias: ['两边一样', '四种样子', '天平', '式子', '线段图', '数轴'],
    hook: '同一个等式 2x + 3 = 11 摆成四种样子：天平、式子、线段图、数轴。在哪一块上做一步，另外三块当场做同一步。四块各做一步试试，最后解出 x。',
    build: quad(2, 3, 0, 11, 4, 1),
    predict: { q: '在线段图上两条右端各剪掉 3，天平会怎样？', options: [{ v: 'a', label: '两盘各少 3 个砝码，还平' }, { v: 'b', label: '只有左盘少 3 个，歪了' }, { v: 'c', label: '天平不动' }], answer: 'a' },
    milestones: [
      ms('solve', '四块一起解出来了： x = 4', 5, 'e', 'solved', 4, ['先让 x 那一边只剩 x：两边同时减 3。', '再两边同时除以 2。', '在哪一块做都行：天平平分成 2 份、线段图平分成 2 份、式子点“两边 ÷ 2”。']),
      Object.assign({}, why4, { when: { role: 'e', port: 'q1', op: '=', value: '1' }, hints: whyHints }),
    ],
    traps: [tilt4], goal: ['solve', 'why'],
    why: '天平上两边各拿走 3 个砝码、式子上两边同时减 3、线段图两条各剪掉 3、数轴上两个落点一起往左 3，是同一件事：两边做同样的事，所以还一样。只动一边，四块一起不平。',
  });
  add4({
    id: 'ef4-x5-12', essence: ['E4', 'E8'], title: '四种样子一起做： x + 5 = 12', rung: 2,
    alias: ['两边一样', '四种样子', '天平', '式子', '线段图', '数轴'],
    hook: 'x + 5 = 12 摆成四种样子。先在数轴上拖 g 试一试，再在任意一块上做一步：另外三块跟着做。',
    build: quad(1, 5, 0, 12, 7, 2),
    predict: { q: '式子上两边同时减 5，数轴上两个落点会怎样？', options: [{ v: 'a', label: '一起往左走 5，差不变' }, { v: 'b', label: '只有上面的往左走' }, { v: 'c', label: '不动' }], answer: 'a' },
    milestones: [
      ms('solve', '四块一起解出来了： x = 7', 5, 'e', 'solved', 7, ['要让左边只剩一个 x。', '两边同时减 5。', '天平两盘各拿走 5 个砝码，或者点式子里的 5，再点“两边都减 5”。']),
      Object.assign({}, why4, { when: { role: 'e', port: 'q1', op: '=', value: '2' }, hints: whyHints }),
    ],
    traps: [tilt4], goal: ['solve', 'why'],
    why: '四块做的都是“两边同时减 5”：天平两盘各拿走 5 个砝码，式子写 x = 7，线段图两条各剪掉 5，数轴两个落点一起往左 5，差不变。样子不一样，做的是同一件事。',
  });
  add4({
    id: 'ef4-3x2-x10', essence: ['E4', 'E8'], title: '四种样子一起做： 3x + 2 = x + 10', grade: 6, rung: 3,
    alias: ['两边一样', '四种样子', '两边都有 x', '天平', '式子', '线段图', '数轴'],
    hook: '两边都有 x：3x + 2 = x + 10。四块各做一步：线段图剪掉一段 x、天平拿走砝码、数轴落点往左走、式子两边除以 2，看另外三块怎么跟着变。',
    build: quad(3, 2, 1, 10, 4, 3),
    predict: { q: '线段图上两条各剪掉一段 x，天平会怎样？', options: [{ v: 'a', label: '两盘各拿走一个盒子，还平' }, { v: 'b', label: '只有左盘少一个盒子，歪了' }, { v: 'c', label: '天平不动' }], answer: 'a' },
    milestones: [
      ms('onex', 'x 只在一边了： 2x + 2 = 10', 3, 'e', 'xsides', 1, ['两边都有 x：先让一边没有 x。', '两边同时减 x。', '线段图点“两条都剪掉一段 x”，或者天平两盘各拿走一个盒子。']),
      ms('solve', '四块一起解出来了： x = 4', 5, 'e', 'solved', 4, ['再两边同时减 2。', '然后两边同时除以 2。', '式子上点“两边 ÷ 2”。']),
      Object.assign({}, why4, { when: { role: 'e', port: 'q1', op: '=', value: '3' }, hints: whyHints }),
    ],
    traps: [tilt4], goal: ['onex', 'solve', 'why'],
    why: '两边各去掉一个 x：天平两盘各拿走一个盒子，线段图两条各剪掉一段 x，数轴两边各少跳一下，式子写 2x + 2 = 10。四种样子，同一步。再两边同时减 2、除以 2，得 x = 4。',
  });

  U.problems.push.apply(U.problems, P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
