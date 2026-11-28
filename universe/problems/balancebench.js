/* 天平与方程的题（docs/instrument-design.md 第 4 节）。开场给一架平衡的天平，学生自己拖：拿走、加上、两边一起做。
 * 全部可以在卡片上直接完成。判分只看器材的输出（进度、解出来的重量、平不平衡），不规定先做哪一步。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const bb = (props) => () => { const s = W.blank(); const id = W.add(s, 'balancebench', 60, 50, props); s.entities[id].role = 'b'; return s; };
  const P = [];
  const base = { domain: '关系', level: 'core', shelf: ['balancebench'], traps: [] };
  const add = (o) => P.push(Object.assign({}, base, o));
  const ms = (id, say, score, port, value, hints) => ({ id, say, score, when: { role: 'b', port, op: '=', value: String(value) }, hints });
  const tilt = { id: 'tilt', wrong: '只动一边，天平就歪了，式子也不再相等。等式两边要做同样的事。', when: { role: 'b', port: 'okn', op: '=', value: '0' } };

  add({
    id: 'bb-x-plus-5', essence: ['E4', 'E2'], title: '盒子里有多重？ x + 5 = 12', grade: 5, rung: 2, points: ['5.5'],
    topics: ['等式的性质', '解简易方程'], alias: ['方程', '等式的性质', '解方程'],
    hook: '左盘有一个盒子和 5 个砝码，右盘有 12 个砝码，天平是平的。把砝码从盘里拖出来就是拿走。这一题两个盘没有连着：只拿一边，看看天平会怎样。怎样才能知道盒子有多重？',
    build: bb({ lx: 1, lc: 5, rx: 0, rc: 12, x0: 7, sync: false }),
    predict: { q: '只从左盘拿走 5 个砝码，天平会怎样？', options: [{ v: 'flat', label: '还是平的' }, { v: 'l', label: '左边翘起来' }, { v: 'r', label: '右边翘起来' }], answer: 'l' },
    milestones: [ms('solve', '盒子单独在一边：x = 7', 8, 'solved', 7, ['想办法让左盘只剩盒子。', '左边拿走一个砝码，右边也要拿走一个。', '两边各拿走 5 个砝码。'])],
    traps: [tilt], goal: ['solve'],
    why: 'x + 5 = 12，两边同时减 5，得 x = 7。只从一边拿，天平就歪了：两边不再一样重，式子也就不成立。',
  });
  add({
    id: 'bb-linked', essence: ['E4', 'E2'], title: '把两个盘连起来： x + 6 = 10', grade: 5, rung: 2, points: ['5.5'],
    topics: ['等式的性质', '解简易方程'], alias: ['等式的性质', '两边同时减', '方程'],
    hook: '这一题两个盘连着（“两边一起动：开”）。从左盘拖走一个砝码，眼睛看右盘：那边的一个砝码也跟着走了。拖的时候看下面的式子怎么写。',
    build: bb({ lx: 1, lc: 6, rx: 0, rc: 10, x0: 4 }),
    predict: { q: '两边连着。从左盘拖走 1 个砝码，右盘还剩几个？', options: [{ v: '10', label: '10 个' }, { v: '9', label: '9 个' }, { v: '4', label: '4 个' }], answer: '9' },
    milestones: [ms('solve', '盒子单独在一边：x = 4', 8, 'solved', 4, ['让左盘只剩盒子。', '一个一个拖走左盘的砝码，右盘跟着少。', '拖 6 次：x = 4。'])],
    traps: [tilt], goal: ['solve'],
    why: '拖走一个砝码时，两个盘各少一个：x + 6 − 1 = 10 − 1。两边做的是同一件事，所以天平一直是平的。做 6 次：x = 4。这就是“等式两边同时减去同一个数，等式仍然成立”。',
  });
  add({
    id: 'bb-2x-10', essence: ['E4', 'E2'], title: '两个盒子一样重： 2x = 10', grade: 5, rung: 2, points: ['5.5'],
    topics: ['等式的性质', '解简易方程'], alias: ['方程', '等式的性质', '平分'],
    hook: '两个一样重的盒子，和 10 个砝码一样重。一个盒子有多重？这回不能靠“拿走”。',
    build: bb({ lx: 2, lc: 0, rx: 0, rc: 10, x0: 5 }), predict: null,
    milestones: [ms('solve', '一个盒子 = 5', 8, 'solved', 5, ['两个盒子对 10 个砝码，一个盒子对几个？', '把两边都平分成 2 份。', '点“两边都平分成 2 份”。'])],
    goal: ['solve'],
    why: '2x = 10，两边同时除以 2，得 x = 5。两边都平分成同样的份数、各留一份，天平还是平的。',
  });
  add({
    id: 'bb-2x-3-11', essence: ['E4', 'E2'], title: '先拿走，再平分： 2x + 3 = 11', grade: 5, rung: 3, points: ['5.5'],
    topics: ['解简易方程'], alias: ['方程', '两步方程', '解方程'],
    hook: '左盘：2 个盒子和 3 个砝码。右盘：11 个砝码。分两步，把一个盒子单独留下来。',
    build: bb({ lx: 2, lc: 3, rx: 0, rc: 11, x0: 4 }), predict: null,
    milestones: [
      ms('apart', '盒子和砝码分开了： 2x = 8', 4, 'stage', 1, ['先让左盘只剩盒子。', '两边各拿走 3 个砝码。', '拿三次，每次两边各一个。']),
      ms('solve', '一个盒子 = 4', 5, 'solved', 4, ['2 个盒子对 8 个砝码。', '两边都平分成 2 份。', '点“两边都平分成 2 份”。']),
    ],
    traps: [tilt], goal: ['apart', 'solve'],
    why: '2x + 3 = 11 → 两边同时减 3 → 2x = 8 → 两边同时除以 2 → x = 4。先减后除：先把砝码拿干净，剩下的才好平分。',
  });
  add({
    id: 'bb-3x-12', essence: ['E4', 'E2'], title: '三个盒子： 3x = 12', grade: 5, rung: 2, points: ['5.5'],
    topics: ['解简易方程'], alias: ['方程', '平分', '除法'],
    hook: '3 个盒子和 12 个砝码一样重。一个盒子有多重？',
    build: bb({ lx: 3, lc: 0, rx: 0, rc: 12, x0: 4 }),
    predict: { q: '一个盒子有多重？', options: [{ v: '3', label: '3' }, { v: '4', label: '4' }, { v: '9', label: '9' }], answer: '4' },
    milestones: [ms('solve', '一个盒子 = 4', 8, 'solved', 4, ['3 个盒子平分 12 个砝码。', '两边都平分成 3 份。', '12 ÷ 3 = 4。'])],
    goal: ['solve'],
    why: '3x = 12，两边同时除以 3，x = 4。这就是除法：12 平均分成 3 份，每份是 4。',
  });
  add({
    id: 'bb-box-right', essence: ['E4', 'E2'], title: '盒子在右边： 9 = x + 4', grade: 5, rung: 2, points: ['5.5'],
    topics: ['等式的性质'], alias: ['方程', '等式的对称性'],
    hook: '这回盒子在右盘。解法变了吗？',
    build: bb({ lx: 0, lc: 9, rx: 1, rc: 4, x0: 5 }), predict: null,
    milestones: [ms('solve', '盒子单独在一边：x = 5', 8, 'solved', 5, ['让右盘只剩盒子。', '两边各拿走 4 个砝码。', '9 − 4 = 5。'])],
    traps: [tilt], goal: ['solve'],
    why: '9 = x + 4 和 x + 4 = 9 是同一架天平，只是换了个方向看。两边同时减 4，得 5 = x，也就是 x = 5。',
  });
  add({
    id: 'bb-both-sides', essence: ['E4', 'E2'], title: '两边都有盒子： 3x + 2 = x + 8', grade: 7, rung: 3, points: ['7.6'],
    topics: ['解一元一次方程', '移项'], alias: ['一元一次方程', '移项', '合并同类项'],
    hook: '两个盘里都有盒子。盒子也可以两边一起拿走吗？这一题两个盘没有连着：先只拿一边的盒子，看天平歪不歪；再把另一边也拿走一个。',
    build: bb({ lx: 3, lc: 2, rx: 1, rc: 8, x0: 3, sync: false }),
    predict: { q: '两边各拿走一个盒子，天平会怎样？', options: [{ v: 'flat', label: '还是平的' }, { v: 'tilt', label: '会歪' }, { v: 'dep', label: '要看盒子多重' }], answer: 'flat' },
    milestones: [
      ms('apart', '盒子只在一边、砝码只在另一边： 2x = 6', 5, 'stage', 1, ['先让右盘没有盒子，再让左盘没有砝码。', '两边各拿走 1 个盒子；再两边各拿走 2 个砝码。', '得到 2x = 6。']),
      ms('solve', '一个盒子 = 3', 5, 'solved', 3, ['2 个盒子对 6 个砝码。', '两边都平分成 2 份。', 'x = 3。']),
    ],
    traps: [tilt], goal: ['apart', 'solve'],
    why: '3x + 2 = x + 8 → 两边同时减 x → 2x + 2 = 8 → 两边同时减 2 → 2x = 6 → 两边同时除以 2 → x = 3。“移项要变号”就是“两边同时减去同一个东西”的简写。',
  });
  add({
    id: 'bb-4x1-2x9', essence: ['E4', 'E2'], title: '自己安排步骤： 4x + 1 = 2x + 9', grade: 7, rung: 3, points: ['7.6'],
    topics: ['解一元一次方程'], alias: ['一元一次方程', '移项'],
    hook: '没有提示先做哪一步。把一个盒子单独留在一边。',
    build: bb({ lx: 4, lc: 1, rx: 2, rc: 9, x0: 4 }), predict: null,
    milestones: [
      ms('apart', '盒子和砝码分开了', 4, 'stage', 1, ['盒子多的那一边留盒子。', '两边各拿走 2 个盒子、1 个砝码。', '得到 2x = 8。']),
      ms('solve', '一个盒子 = 4', 6, 'solved', 4, ['2x = 8。', '平分成 2 份。', 'x = 4。']),
    ],
    traps: [tilt], goal: ['apart', 'solve'],
    why: '4x + 1 = 2x + 9 → 2x + 1 = 9 → 2x = 8 → x = 4。先拿盒子还是先拿砝码都可以，顺序不影响结果。',
  });
  add({
    id: 'bb-5x-3x6', essence: ['E4', 'E2'], title: '5x = 3x + 6', grade: 7, rung: 3, points: ['7.6'],
    topics: ['解一元一次方程'], alias: ['一元一次方程', '移项'],
    hook: '左盘只有盒子，右盘有盒子也有砝码。',
    build: bb({ lx: 5, lc: 0, rx: 3, rc: 6, x0: 3 }), predict: null,
    milestones: [
      ms('apart', '右盘没有盒子了： 2x = 6', 4, 'stage', 1, ['右盘的盒子要拿走。', '两边各拿走 3 个盒子。', '2x = 6。']),
      ms('solve', '一个盒子 = 3', 6, 'solved', 3, ['2x = 6。', '平分成 2 份。', 'x = 3。']),
    ],
    traps: [tilt], goal: ['apart', 'solve'],
    why: '5x = 3x + 6，两边同时减 3x，得 2x = 6，x = 3。',
  });
  add({
    id: 'bb-make-4', essence: ['E4', 'E7'], title: '倒过来：把 x = 4 藏起来', grade: 5, rung: 4, points: ['5.5'],
    topics: ['等式的性质', '方程的意义'], alias: ['方程', '编方程', '等式的性质'],
    hook: '现在天平上是 x = 4：一个盒子对 4 个砝码。往两边加东西，把它变成一个看上去更复杂、但仍然平衡的式子：做到“左盘 3 个盒子”并且保持平衡，再交给别人解。',
    build: bb({ lx: 1, lc: 0, rx: 0, rc: 4, x0: 4, reveal: false }), predict: null,
    milestones: [ms('made', '左盘有 3 个盒子，天平仍然平衡', 8, 'lbal', 3, ['往两边加一样的东西。', '左边加一个盒子，右边加 4 个砝码（一个盒子重 4）或也加一个盒子。', '从托盘往盘里拖。'])],
    goal: ['made'],
    why: '解方程是把两边一步步化简；倒过来，往两边加同样重的东西，就能从 x = 4 造出许多方程，它们的解都是 4。',
  });
  add({
    id: 'bb-6x2-2x14', essence: ['E4', 'E2'], title: '6x + 2 = 2x + 14', grade: 7, rung: 4, points: ['7.6'],
    topics: ['解一元一次方程'], alias: ['一元一次方程', '系数化为 1'],
    hook: '盒子多、砝码也多。有没有比“一个一个拿”更快的办法？看看能不能先平分。',
    build: bb({ lx: 6, lc: 2, rx: 2, rc: 14, x0: 3 }), predict: null,
    milestones: [
      ms('apart', '盒子和砝码分开了', 4, 'stage', 1, ['四个数都是偶数。', '可以先两边平分成 2 份：3x + 1 = x + 7。', '再两边各拿走 1 个盒子、1 个砝码。']),
      ms('solve', '一个盒子 = 3', 6, 'solved', 3, ['2x = 6 或 4x = 12。', '平分。', 'x = 3。']),
    ],
    traps: [tilt], goal: ['apart', 'solve'],
    why: '6x + 2 = 2x + 14。先除以 2 再移项，或者先移项再除以 4，都得到 x = 3。走哪条路都行，只要每一步两边做的是同一件事。',
  });
  // 大数（2026-11-28，增强 7 第二轮：天平每盘 999 个砝码，100 一块、10 一条）
  add({
    id: 'bb-3x45-165', essence: ['E4', 'E2'], title: '砝码很多也一样： 3x + 45 = 165', grade: 5, rung: 3, points: ['5.5'],
    topics: ['解简易方程', '等式的性质'], alias: ['方程', '两步方程', '解方程', '大数'],
    hook: '左盘：3 个盒子和 45 个砝码；右盘：165 个砝码。砝码多了，10 个一条、100 个一块。拖一条就是两边各拿走 10 个。',
    build: bb({ lx: 3, lc: 45, rx: 0, rc: 165, x0: 40 }), predict: null,
    milestones: [
      ms('apart', '盒子和砝码分开了： 3x = 120', 4, 'stage', 1, ['先让左盘只剩盒子：左盘有 45 个砝码。', '两边各拿走 45 个：拖 4 条（每条 10 个），再拖 5 个。', '左盘的“10”一条一条拖出来，再把单个的拖出来。']),
      ms('solve', '一个盒子 = 40', 5, 'solved', 40, ['3 个盒子对 120 个砝码。', '两边都平分成 3 份。', '点“两边都平分成 3 份”。']),
    ],
    traps: [tilt], goal: ['apart', 'solve'],
    why: '3x + 45 = 165 → 两边同时减 45 → 3x = 120 → 两边同时除以 3 → x = 40。砝码多了按 10 个一条拿，和一个一个拿是同一件事：两边做的一样，天平一直平。',
  });
  U.problems.push.apply(U.problems, P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
