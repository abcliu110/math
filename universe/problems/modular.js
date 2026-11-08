/* 同余钟：余数是圈上的位置；周期；步长与格数的公因数决定能走遍几格。 */
(function (G) {
  'use strict';
  const U = G.U, mk = U.mkScene, P = [];
  const clock = (props) => mk({ ents: [{ type: 'modclock', x: 90, y: 60, role: 'c', props }] });
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const has = (w, f) => w.some('modclock', (e) => f(e, (p) => w.num(e, p)));

  P.push({
    id: 'week-100', essence: ['E6', 'E5'], title: '今天周三，100 天后是周几？', grade: 5, domain: '数与运算', points: ['余数', '周期问题'],
    alias: ['星期几', '周期'], hook: '钟面 7 格，是一个星期（0 是周日），指针停在周三。让它每拍走 1 格，走满 100 拍看看停在哪。再想想：走一整圈（7 拍）和什么有关？',
    shelf: ['modclock', 'meter', 'op'],
    build: clock({ m: 7, s: 3, k: 0, mode: 0, N: 0 }),
    predict: { q: '先猜：100 天后是——', options: [{ v: 1, label: '周一' }, { v: 5, label: '周五' }, { v: 6, label: '周六' }], reveal: () => ({ v: 5, label: '周五' }) },
    milestones: [
      { id: 'step', say: '每拍走 1 格（k = 1）', score: 2, when: (w) => has(w, (e) => e.props.k === 1 && e.props.mode === 0), hints: ['一天过一格。', '改“每拍的步长 k”。', 'k = 1。'] },
      { id: 'rem', say: '把 N 设成 100，读出 100 除以 7 的余数是 2', score: 3, when: (w) => has(w, (e, o) => e.props.N === 100 && o('rem') === 2), hints: ['钟面还有个“N”属性。', 'N 填 100，看“余数”输出。', '100 ÷ 7 = 14 …… 2。'] },
      { id: 'day', say: '让时钟走到第 100 拍，指针在周五（第 5 格）', score: 5, when: (w) => has(w, (e, o) => e.props.k === 1 && o('tick') === 100 && o('pos') === 5), hints: ['时钟调到 20×，点播放。', '看“已走几拍”到 100。', '三 + 2 天 = 周五。'] },
    ],
    traps: [], why: '走满 7 拍刚好回到原位，所以 100 天里的 14 整圈（98 天）可以不管，只剩余数 2：周三再过 2 天是周五。余数就是“圈上的位置”。', ref: ['modclock|0'],
  });

  P.push({
    id: 'last-digit-cycle', essence: ['E6'], title: '3 的 100 次方，个位数字是几？', grade: 6, domain: '数与运算', points: ['个位数字', '周期'],
    alias: ['周期', '乘方'], hook: '把钟调成“乘”：从 1 出发，每拍乘 3，只看个位（钟面 10 格）。3、9、27、81、243……个位会不会重复？多久一轮？',
    shelf: ['modclock', 'power', 'meter'],
    build: clock({ m: 10, s: 1, k: 1, mode: 1, N: 0 }),
    predict: { q: '先猜：个位数字几拍重复一轮？', options: [{ v: 2, label: '2 拍' }, { v: 4, label: '4 拍' }, { v: 10, label: '10 拍' }], reveal: () => ({ v: 4, label: '4 拍：1、3、9、7，再回到 1' }) },
    milestones: [
      { id: 'set3', say: '“乘”钟，步长 3', score: 3, when: (w) => has(w, (e) => e.props.mode === 1 && e.props.k === 3), hints: ['“怎么走”选乘。', '步长 k 改成 3。', 'mode = 乘，k = 3。'] },
      { id: 'cycle', say: '发现 4 拍回到起点', score: 4, when: (w) => has(w, (e, o) => e.props.mode === 1 && e.props.k === 3 && o('back') === 4), hints: ['让时钟走几拍。', '看“回到起点用几拍”。', '1、3、9、7，再回到 1：4 拍。'] },
      { id: 'e100', say: '走到第 100 拍，指针停在第 1 格', score: 3, when: (w) => has(w, (e, o) => e.props.mode === 1 && e.props.k === 3 && o('tick') === 100 && o('pos') === 1), hints: ['调到 20×，一直走到 100 拍。', '100 是 4 的几倍？', '整整 25 轮，回到起点：个位是 1。'] },
    ],
    traps: [], why: '个位数字只由上一个个位决定：1→3→9→7→1，4 拍一轮。100 是 4 的整数倍，刚好走完 25 轮回到 1，所以 3 的 100 次方个位是 1。', ref: ['modclock|0'],
  });

  P.push({
    id: 'clock-gcd', essence: ['E5', 'E2'], title: '12 格的钟，步长 4 能走到几个格？', grade: 6, domain: '数与运算', points: ['最大公因数', '周期'],
    alias: ['公因数', '余数'], hook: '12 格的钟，每拍走 4 格。会走遍所有格吗？多试几个步长，看看哪些能走遍，哪些不能。',
    shelf: ['modclock', 'numtheory', 'meter'],
    build: clock({ m: 12, s: 0, k: 0, mode: 0 }),
    predict: { q: '先猜：步长 4 能走到几个不同的格？', options: [{ v: 3, label: '3 个' }, { v: 4, label: '4 个' }, { v: 12, label: '全部 12 个' }], reveal: () => ({ v: 3, label: '3 个：0、4、8' }) },
    milestones: [
      { id: 'k4', say: '步长 4：只走到 3 个格', score: 3, when: (w) => has(w, (e, o) => e.props.mode === 0 && e.props.k === 4 && o('visits') === 3), hints: ['k 改成 4，让时钟走几拍。', '看“走过几个不同的格”。', '0、4、8，然后回到 0。'] },
      { id: 'back3', say: '3 拍回到起点', score: 2, when: (w) => has(w, (e, o) => e.props.k === 4 && o('back') === 3), hints: ['继续走。', '看“回到起点用几拍”。', '3 拍。'] },
      { id: 'k6', say: '步长 6：只走到 2 个格', score: 2, when: (w) => has(w, (e, o) => e.props.mode === 0 && e.props.k === 6 && o('visits') === 2), hints: ['换一个步长再试。', 'k = 6。', '0、6，两个格。'] },
      { id: 'all12', say: '找一个步长（不是 1）能走遍 12 个格', score: 3, when: (w) => has(w, (e, o) => e.props.mode === 0 && e.props.k > 1 && gcd(e.props.k, 12) === 1 && o('visits') === 12), hints: ['多试几个步长，每个都走满 12 拍。', '能走遍的步长和 12 有什么关系？', '和 12 的最大公因数是 1：5、7、11 都行。'] },
    ],
    traps: [], why: '步长 k 的钟，能走到的格数是 m ÷ 最大公因数(k, m)。4 和 12 的最大公因数是 4，所以 12÷4=3 个格；6 和 12 是 6，所以 2 个格；和 12 互质（公因数 1）的步长才能走遍 12 个格。', ref: ['modclock|0'],
  });

  P.push({
    id: 'coprime-all', essence: ['E2', 'E5'], title: '10 格的钟：哪些步长能走遍？', grade: 7, domain: '数与运算', points: ['互质', '最大公因数'],
    alias: ['互质', '公因数'], hook: '10 格的钟，步长从 1 到 9 都试试。哪些步长能走遍 10 个格？把能走遍的找出来，再看它们和 10 有什么共同点。',
    shelf: ['modclock', 'numtheory', 'meter'],
    build: clock({ m: 10, s: 0, k: 0, mode: 0 }),
    predict: { q: '先猜：步长 3 能走遍 10 个格吗？', options: [{ v: 10, label: '能，走遍 10 个' }, { v: 5, label: '只走 5 个' }, { v: 3, label: '只走 3 个' }], reveal: () => ({ v: 10, label: '能：3、6、9、2、5、8、1、4、7、0' }) },
    milestones: [
      { id: 'k3', say: '步长 3：走遍 10 个格', score: 3, when: (w) => has(w, (e, o) => e.props.mode === 0 && e.props.k === 3 && o('visits') === 10), hints: ['k 改成 3，走满 10 拍。', '看“走过几个不同的格”。', '10 个。'] },
      { id: 'k7', say: '步长 7：也能走遍', score: 3, when: (w) => has(w, (e, o) => e.props.mode === 0 && e.props.k === 7 && o('visits') === 10), hints: ['再试一个。', 'k = 7。', '走满 10 拍。'] },
      { id: 'k9', say: '步长 9：也能走遍', score: 2, when: (w) => has(w, (e, o) => e.props.mode === 0 && e.props.k === 9 && o('visits') === 10), hints: ['再找一个。', '9 就是“往回走 1 格”。', 'k = 9。'] },
      { id: 'k5', say: '步长 5：只走 2 个格', score: 2, when: (w) => has(w, (e, o) => e.props.mode === 0 && e.props.k === 5 && o('visits') === 2), hints: ['有一个步长特别“偷懒”。', '试试 5。', '0、5，来回。'] },
    ],
    traps: [], why: '能走遍的步长是 1、3、7、9——它们和 10 的最大公因数都是 1（互质）。2、4、6、8 和 10 有公因数 2，5 和 10 有公因数 5，都只能走到一部分格子。', ref: ['modclock|0'],
  });

  U.problems.push(...P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
