/* 起步题库（第一版 4 题）。题目 = 一个开场台面 + 里程碑 + 陷阱 + 预测。
 * 里程碑按“台面的数学性质”判，不看操作顺序。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;

  function mk(spec) {
    return function build() {
      const s = W.blank();
      const ids = {};
      for (const e of spec.ents) {
        const id = W.add(s, e.type, e.x, e.y, e.props);
        if (e.role) s.entities[id].role = e.role;
        if (e.name) s.entities[id].name = e.name;
        ids[e.key || e.role || id] = id;
      }
      for (const l of spec.links || []) W.act(s, { t: 'link', from: ids[l[0]], to: ids[l[1]], toPort: l[2], fromPort: l[3] });
      s.clock.hz = spec.hz || 4;
      return s;
    };
  }

  const P = [];

  P.push({
    id: 'frac-add-unlike', essence: ['E3'], title: '2/5 + 1/3 等于多少？', grade: 5, domain: '分数', points: ['异分母分数加法', '通分'],
    alias: ['分数加法'], hook: '两个分数，分母不一样。台面上已经放好了它们，你来让它们“加”起来。',
    shelf: ['num', 'op', 'meter', 'compare'],
    build: mk({ ents: [
      { type: 'num', x: 60, y: 90, role: 'a', props: { n: 2, d: 5 } },
      { type: 'num', x: 60, y: 230, role: 'b', props: { n: 1, d: 3 } },
    ] }),
    predict: {
      q: '动手之前先猜：2/5 + 1/3 的结果会是——',
      options: [{ v: '3/8', label: '3/8（分子加分子，分母加分母）' }, { v: '11/15', label: '11/15' }, { v: '3/15', label: '3/15' }],
      reveal: (w) => { const o = w.ofType('op').map((e) => w.out(e, 'r')).find((v) => v && v.kind === 'num'); return o ? { v: U.Q.show(o.data), label: U.Q.show(o.data) } : { v: '11/15', label: '11/15' }; },
    },
    milestones: [
      { id: 'op', say: '放一台运算器', score: 2, glow: ['op'], when: { count: { type: 'op', ge: 1 } }, hints: ['两个数要“合”起来，需要一台能算的器材。', '器材架里的「运算器」。', '把「运算器」拖到台面上，设为 +。'] },
      { id: 'wire', say: '把两个分数都接进运算器', score: 3, when: (w) => w.some('op', (e) => w.sources(e).length >= 2), hints: ['两个分数都要送进去。', '从每个数字的输出口拉线到运算器的甲、乙口。', '数字甲 → 运算器 甲口；数字乙 → 运算器 乙口。'] },
      { id: 'res', say: '结果是 11/15', score: 5, when: { type: 'op', port: 'r', op: '=', value: '11/15' }, hints: ['想想：分母不一样，能直接加吗？', '运算器会通分——先看它的结果对不对。', '确认运算是 + ，两个数都接对。'] },
    ],
    traps: [{ id: 'bad38', when: { type: 'num', port: 'v', op: '=', value: '3/8' }, wrong: '把分子加分子、分母加分母得到 3/8——但 3/8 比 2/5 还小，两个数相加怎么会变小？' }],
    why: '分母不同，分的“份”大小不同，不能直接数份数。通分是把它们换成同样大的份：2/5=6/15，1/3=5/15，合起来 11/15。',
    ref: ['meter,num,num,op|3', 'num,num,op|2'],
  });

  P.push({
    id: 'balance-12', essence: ['E4'], title: '让天平平衡：右边凑出 12', grade: 3, domain: '数与运算', points: ['等式', '多种凑法'],
    alias: ['天平', '凑数'], hook: '左盘有一个 12。右盘什么都没有——想办法让它平衡。凑法不止一种。',
    shelf: ['num', 'op', 'balance', 'meter'],
    build: mk({ ents: [
      { type: 'num', x: 60, y: 120, role: 'target', props: { n: 12 } },
      { type: 'balance', x: 380, y: 100, role: 'bal' },
    ], links: [['target', 'bal', 'L']] }),
    predict: null,
    milestones: [
      { id: 'right', say: '往右盘放东西', score: 2, glow: ['num'], when: (w) => w.some('balance', (e) => w.linked(e, e) || w.scene.links.some((l) => l.to === e.id && l.toPort === 'R')), hints: ['右盘还是空的。', '给天平的「右盘」口拉一根线。', '放一个数字，把它接到天平的右盘。'] },
      { id: 'bal', say: '天平平衡', score: 6, when: { role: 'bal', port: 'ok', op: '=', value: true }, hints: ['平衡 = 左右同样重。', '右盘要凑出 12。', '改数字，或者用运算器：5+7、3×4、24÷2 都行。'] },
      { id: 'calc', say: '用运算器凑（不是直接放 12）', score: 2, when: { all: [{ role: 'bal', port: 'ok', op: '=', value: true }, { count: { type: 'op', ge: 1 } }] }, hints: ['再挑战：不直接放 12。', '用两个数加起来或乘起来。', '放运算器，把结果接进右盘。'] },
    ],
    traps: [], goal: ['right', 'bal'],
    why: '等式的意思是“两边一样多”。同一个 12 有很多种写法：5+7、3×4、24÷2……不同的搭法，是同一个事实的不同面孔。',
    ref: ['balance,num|1', 'balance,num,num,num,op|4'],
  });

  P.push({
    id: 'two-dice', essence: ['E11'], title: '两个骰子的点数和，谁最常出现？', grade: 6, domain: '统计与概率', points: ['可能性', '频数分布', '大数规律'],
    alias: ['骰子', '概率'], hook: '掷两个骰子，把点数加起来。哪个和最容易出现？先猜，再让它自己掷几百次。',
    shelf: ['dice', 'op', 'hist', 'clock', 'meter'],
    build: mk({ ents: [
      { type: 'dice', x: 60, y: 60, role: 'd1' },
      { type: 'dice', x: 60, y: 220, role: 'd2', props: { salt: 1 } },
    ] }),
    predict: {
      q: '动手之前先猜：两个骰子的点数和，哪个出现得最多？',
      options: [{ v: 6, label: '6' }, { v: 7, label: '7' }, { v: 8, label: '8' }, { v: 12, label: '一样多' }],
      reveal: (w) => {
        const h = w.ofType('hist').map((e) => w.out(e, 'dist')).find((v) => v && v.kind === 'dist');
        if (!h) return null;
        const cs = h.data.counts; let bi = 0; cs.forEach((c, i) => { if (c > cs[bi]) bi = i; });
        const tot = cs.reduce((s, x) => s + x, 0);
        return tot < 30 ? null : { v: h.data.lo + bi, label: String(h.data.lo + bi) };
      },
    },
    milestones: [
      { id: 'sum', say: '把两个骰子加起来', score: 3, glow: ['op'], when: (w) => w.some('op', (e) => w.sources(e).filter((s) => s.type === 'dice').length >= 2), hints: ['要的是“点数和”，不是单个点数。', '用「运算器」设为 +，两个骰子都接进去。', '骰子甲、骰子乙 → 运算器 → 直方图。'] },
      { id: 'hist', say: '把和送进直方图', score: 3, glow: ['hist'], when: (w) => w.some('hist', (e) => w.sources(e).some((s) => s.type === 'op')), hints: ['需要把每次的结果记下来。', '「直方图」会数每个值出现几次。', '运算器的结果 → 直方图。'] },
      { id: 'run', say: '让时钟走起来，累计 100 次以上', score: 4, when: (w) => w.some('hist', (e, d) => d.out.n && w.num(e, 'n') >= 100), hints: ['骰子要靠时钟才会掷。', '点右上角“▶”，可以调快。', '等直方图总次数超过 100。'] },
    ],
    traps: [], goal: ['sum', 'hist', 'run'],
    why: '和为 7 的搭配有 6 种（1+6、2+5……），和为 2 只有 1 种。次数多了，7 总是最高——这就是“大数规律”。',
    ref: ['dice,dice,hist,op|3'],
  });

  P.push({
    id: 'counter-loop', essence: ['E6'], title: '让它自己数数：1、2、3……', grade: 4, domain: '时间与变化', points: ['递推', '反馈', '数列'],
    alias: ['计数', '迭代', '循环'], hook: '你要做一台会自己加 1 的机器。提示：它要“记住”上一次的数，再加 1，再记住……',
    shelf: ['num', 'op', 'memory', 'meter', 'clock'],
    build: mk({ ents: [
      { type: 'num', x: 60, y: 260, role: 'one', props: { n: 1 } },
      { type: 'meter', x: 520, y: 120, role: 'show' },
    ] }),
    predict: {
      q: '动手之前先猜：把“记忆器”的输出 +1 再接回记忆器，让时钟走 10 拍，记忆器里是——',
      options: [{ v: 0, label: '还是 0' }, { v: 10, label: '10' }, { v: 11, label: '11' }],
      reveal: (w) => { const m = w.ofType('memory')[0]; if (!m) return null; const v = w.num(m, 'v'); return { v, label: String(v) }; },
    },
    milestones: [
      { id: 'mem', say: '放一台记忆器', score: 2, glow: ['memory'], when: { count: { type: 'memory', ge: 1 } }, hints: ['想让数留到下一拍，要有“记忆”。', '器材架里的「记忆器」。', '把「记忆器」拖到台面上。'] },
      { id: 'loop', say: '搭成一个回路：记忆器 → 运算器 → 记忆器', score: 4, glow: ['op'], when: { all: [{ loop: true }, { count: { type: 'op', ge: 1 } }] }, hints: ['输出要回到输入。', '记忆器的输出 +1，再送回记忆器的「新值」口。', '记忆器 → 运算器甲口；数字 1 → 运算器乙口；运算器 → 记忆器。'] },
      { id: 'ten', say: '记忆器数到 10', score: 4, when: (w) => w.some('memory', (e) => { const v = w.num(e, 'v'); return v !== null && v >= 10; }), hints: ['回路搭好后，让时钟走起来。', '点 ▶，或者“走一拍”。', '等记忆器里的数到 10。'] },
    ],
    traps: [], goal: ['mem', 'loop', 'ten'],
    why: '每一拍：新的数 = 旧的数 + 1。这就是递推，也是所有“会自己变的东西”的最小骨架。',
    ref: ['memory,num,op|3'],
  });

  U.mkScene = mk;
  U.problems = P;
  U.problemById = (id) => P.find((p) => p.id === id);
})(typeof globalThis !== 'undefined' ? globalThis : window);
