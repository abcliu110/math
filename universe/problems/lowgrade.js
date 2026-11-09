/* 低年级批次：乘法的样子、带余除法、四舍五入、进制、小数加法。 */
(function (G) {
  'use strict';
  const U = G.U, mk = U.mkScene;
  const P = [];

  P.push({
    id: 'array-12', essence: ['E1', 'E2'], title: '12 个点，能排成几种整齐的队伍？', grade: 3, domain: '数与运算', points: ['乘法的意义', '因数', '多种排法'],
    alias: ['乘法', '因数'], hook: '12 个点排成整齐的长方形队伍，每行一样多。先排出一种，再想想还有没有别的。',
    shelf: ['array', 'meter', 'num', 'op'],
    build: mk({ ents: [] }),
    predict: { q: '先猜：12 个点，整齐的排法一共有几种（3×4 和 4×3 算同一种）？', options: [{ v: 2, label: '2 种' }, { v: 3, label: '3 种' }, { v: 4, label: '4 种' }], reveal: () => ({ v: 3, label: '3 种：1×12、2×6、3×4' }) },
    milestones: [
      { id: 'one', say: '排出 12 个点', score: 3, glow: ['array'], when: { type: 'array', port: 'n', op: '=', value: '12' }, hints: ['用「点阵」。', '行数 × 每行个数 = 一共。', '3 行，每行 4 个。'] },
      { id: 'two', say: '再排一种不同的 12', score: 4, when: (w) => { const a = w.ofType('array').filter((e) => w.num(e, 'n') === 12); const s = new Set(a.map((e) => Math.min(e.props.rows, e.props.cols) + 'x' + Math.max(e.props.rows, e.props.cols))); return s.size >= 2; }, hints: ['复制一个点阵，改改行和列。', '2 × 6 也是 12。', '再放一个点阵：2 行，每行 6 个。'] },
      { id: 'three', say: '找到第三种', score: 3, when: (w) => { const a = w.ofType('array').filter((e) => w.num(e, 'n') === 12); const s = new Set(a.map((e) => Math.min(e.props.rows, e.props.cols) + 'x' + Math.max(e.props.rows, e.props.cols))); return s.size >= 3; }, hints: ['还有一种排成一长条。', '1 行，每行 12 个。', '行 1，列 12。'] },
    ],
    traps: [], why: '12 = 1×12 = 2×6 = 3×4。能排成整齐队伍的行数，就是 12 的因数。',
    ref: ['array,array|0'],
  });

  P.push({
    id: 'divmod-17-5', essence: ['E2'], title: '17 个苹果，每 5 个一盒，几盒？还剩几个？', grade: 3, domain: '数与运算', points: ['有余数的除法', '商和余数'],
    alias: ['余数'], hook: '17 个苹果，5 个装一盒。装满的盒子是商，剩下的是余数。',
    shelf: ['num', 'divmod', 'meter', 'op', 'compare'],
    build: mk({ ents: [{ type: 'num', x: 60, y: 70, role: 'a', props: { n: 17, unit: 1 } }, { type: 'num', x: 60, y: 230, role: 'b', props: { n: 5 } }] }),
    predict: { q: '先猜：还剩几个？', options: [{ v: 2, label: '2 个' }, { v: 3, label: '3 个' }, { v: 4, label: '4 个' }], reveal: () => ({ v: 2, label: '2 个' }) },
    milestones: [
      { id: 'wire', say: '把 17 和 5 接进带余除法', score: 3, glow: ['divmod'], when: (w) => w.some('divmod', (e) => w.sources(e).length >= 2), hints: ['要一台会“带余”的除法器。', '「带余除法」，甲口放 17，乙口放 5。', '17 → 被除数；5 → 除数。'] },
      { id: 'q3', say: '商是 3', score: 3, when: { type: 'divmod', port: 'q', op: '=', value: '3' }, hints: ['看商。', '5×3=15，不超过 17。', '确认被除数和除数没接反。'] },
      { id: 'r2', say: '余数是 2', score: 4, when: { type: 'divmod', port: 'r', op: '=', value: '2' }, hints: ['17 − 15 = ?', '余数一定比除数小。', '余数 2。'] },
    ],
    traps: [{ id: 'swap', when: { type: 'divmod', port: 'q', op: '=', value: '0' }, wrong: '商是 0，说明被除数比除数小了——是不是把 5 和 17 接反了？' }],
    why: '17 = 5 × 3 + 2。商表示装满了几盒，余数表示不够装一盒的零头，余数必须比除数小。',
    ref: ['divmod,num,num|2'],
  });

  P.push({
    id: 'round-347', essence: ['E3', 'E7'], title: '3.47 精确到十分位，是多少？', grade: 4, domain: '数与运算', points: ['近似数', '四舍五入'],
    alias: ['四舍五入'], hook: '3.47 看百分位：7，要“入”。同一个数，用不同的取整方法，结果不一样。',
    shelf: ['num', 'round', 'meter', 'compare'],
    build: mk({ ents: [{ type: 'num', x: 60, y: 120, role: 'x', props: { n: 347, d: 100 } }] }),
    predict: { q: '先猜：3.47 四舍五入到十分位是——', options: [{ v: '3.4', label: '3.4' }, { v: '3.5', label: '3.5' }, { v: '3.0', label: '3.0' }], reveal: () => ({ v: '3.5', label: '3.5' }) },
    milestones: [
      { id: 'rd', say: '接一台取整器', score: 3, glow: ['round'], when: (w) => w.some('round', (e) => w.sources(e).length >= 1), hints: ['用「取整」。', '3.47 → 取整器。', '把“精确到”设成 −1（十分位）。'] },
      { id: 'place', say: '精确到十分位', score: 3, when: (w) => w.some('round', (e) => e.props.place === -1), hints: ['十分位是 10 的 −1 次方。', '“精确到”填 −1。', '属性里把 place 改成 −1。'] },
      { id: 'ans', say: '四舍五入得 3.5', score: 4, when: { type: 'round', port: 'r', op: '=', value: '7/2' }, hints: ['方法选“四舍五入”。', '看百分位 7，比 5 大要入。', '结果 3.5。'] },
    ],
    traps: [{ id: 'trunc', when: { type: 'round', port: 'r', op: '=', value: '17/5' }, wrong: '3.4 是“去尾法”的结果。题目要的是四舍五入：百分位 7 ≥ 5，要向前进一。' }],
    why: '精确到十分位，就看百分位。7 ≥ 5，十分位 4 进 1 变成 5，所以是 3.5。',
    ref: ['num,round|1'],
  });

  P.push({
    id: 'binary-13', essence: ['E3', 'E6'], title: '13 用二进制怎么写？', grade: 5, domain: '数与运算', points: ['位值', '进制'],
    alias: ['二进制', '进制'], hook: '十进制每满 10 进一位，二进制每满 2 进一位。把 13 放进数位板，换成二进制看看。',
    shelf: ['num', 'digits', 'meter'],
    build: mk({ ents: [{ type: 'num', x: 60, y: 120, role: 'x', props: { n: 13 } }] }),
    predict: { q: '先猜：13 写成二进制有几位？', options: [{ v: 3, label: '3 位' }, { v: 4, label: '4 位' }, { v: 5, label: '5 位' }], reveal: () => ({ v: 4, label: '4 位：1101' }) },
    milestones: [
      { id: 'pad', say: '把 13 接进数位板', score: 3, glow: ['digits'], when: (w) => w.some('digits', (e) => w.sources(e).length >= 1), hints: ['需要「数位板」。', '数字 → 数位板。', '13 接数位板的“整数”口。'] },
      { id: 'b2', say: '改成二进制', score: 3, when: (w) => w.some('digits', (e) => e.props.base === 2), hints: ['“几进制”现在是 10。', '改成 2。', '属性 base = 2。'] },
      { id: 'four', say: '13 是 4 位数（1101）', score: 4, when: (w) => w.some('digits', (e) => e.props.base === 2 && w.num(e, 'count') === 4), hints: ['8+4+0+1。', '位值：8、4、2、1。', '看“有几位”读数是 4。'] },
    ],
    traps: [], why: '13 = 8 + 4 + 1 = 1×8 + 1×4 + 0×2 + 1×1，所以二进制是 1101。每一位的位值是 2 的幂。',
    ref: ['digits,num|1'],
  });

  P.push({
    id: 'decimal-add', essence: ['E3'], title: '0.1 + 0.2 等于 0.3 吗？', grade: 5, domain: '数与运算', points: ['小数加法', '等于'],
    alias: ['小数'], hook: '有的计算机里 0.1 + 0.2 不等于 0.3。这里的数是精确的——你来验证。',
    shelf: ['num', 'op', 'compare', 'meter'],
    build: mk({ ents: [{ type: 'num', x: 60, y: 60, role: 'a', props: { n: 1, d: 10 } }, { type: 'num', x: 60, y: 200, role: 'b', props: { n: 1, d: 5 } }, { type: 'num', x: 60, y: 340, role: 'c', props: { n: 3, d: 10 } }] }),
    predict: { q: '先猜：0.1 + 0.2 = 0.3 吗？', options: [{ v: 'y', label: '等于' }, { v: 'n', label: '不等于，差一点点' }], reveal: () => ({ v: 'y', label: '等于（精确计算）' }) },
    milestones: [
      { id: 'sum', say: '把 0.1 和 0.2 加起来', score: 3, glow: ['op'], when: (w) => w.some('op', (e) => w.sources(e).length >= 2 && w.out(e, 'r') && e.props.op === 0), hints: ['用「运算器」，设为 +。', '1/10 和 1/5 都接进去。', '甲口 1/10，乙口 1/5。'] },
      { id: 'cmp', say: '和 0.3 比一比', score: 3, glow: ['compare'], when: (w) => w.some('compare', (e) => w.sources(e).length >= 2), hints: ['要问“相等吗”。', '「比较」，关系 =。', '运算器的结果和 3/10 都接进比较。'] },
      { id: 'eq', say: '比较器说“成立”', score: 4, when: { type: 'compare', port: 'ok', op: '=', value: true }, hints: ['允许差保持 0。', '结果应该是 3/10。', '成立。'] },
    ],
    traps: [], why: '0.1=1/10，0.2=2/10，加起来 3/10=0.3，精确相等。计算机里差一点点，是因为它用二进制近似小数，而这里的数用分数精确保存。',
    ref: ['compare,num,num,num,op|3'],
  });

  U.problems.push(...P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
