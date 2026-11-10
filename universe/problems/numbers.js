/* 数论与幂：公因数公倍数、质数、开方、乘方。 */
(function (G) {
  'use strict';
  const U = G.U, mk = U.mkScene;
  const P = [];

  P.push({
    id: 'arith-carry-47-38', essence: ['E2'], title: '用竖式算 47 + 38', grade: 2, domain: '数与运算', points: ['2.3'], topics: ['两位数加法', '进位'],
    alias: ['竖式', '进位', '两位数加法'], workbench: 'arith', rung: 2, level: 'core',
    hook: '把 47 和 38 竖着写，个位对个位。从个位算起：个位满十要进到十位。',
    shelf: ['arithbench'],
    build: mk({ ents: [{ type: 'arithbench', x: 300, y: 200, role: 'bench', props: { a: 47, op: 0, b: 38 } }] }),
    milestones: [
      { id: 'col1', say: '竖式里算出个位', score: 2, when: { steps: { used: 'arith.column', allKept: true } },
        hints: ['从个位算起：7 + 8 等于多少？', '点竖式下面的「算个位」。', '15 写 5，向十位进 1。'] },
      { id: 'result', say: '竖式算出 47 + 38 = 85', score: 4, when: { type: 'arithbench', port: 'result', op: '=', value: '85' },
        hints: ['十位上还要加上进位的 1。', '点「算十位」：4 + 3 + 1 = 8。', '十位写 8，结果是 85。'] },
    ],
    traps: [], goal: ['col1', 'result'],
    why: '个位 7 + 8 = 15，写 5，进 1；十位 4 + 3 + 1 = 8，写 8。结果 85。竖式的要点：相同数位对齐，从个位算起，满十就进位。',
  });

  P.push({
    id: 'gcd-12-18', essence: ['E2'], title: '12 和 18 的最大公因数、最小公倍数', grade: 5, domain: '数与运算', points: ['5.8'], topics: ['最大公因数', '最小公倍数'],
    alias: ['公因数', '公倍数'], hook: '把 12 和 18 接进「数的性质」，读出两个结果，想想它们是怎么来的。',
    shelf: ['num', 'numtheory', 'meter', 'op'],
    build: mk({ ents: [{ type: 'num', x: 60, y: 60, role: 'a', props: { n: 12 } }, { type: 'num', x: 60, y: 220, role: 'b', props: { n: 18 } }] }),
    predict: { q: '先猜：最大公因数是——', options: [{ v: 2, label: '2' }, { v: 6, label: '6' }, { v: 36, label: '36' }], reveal: () => ({ v: 6, label: '6' }) },
    milestones: [
      { id: 'wire', say: '12 接甲、18 接乙', score: 3, glow: ['numtheory'], when: (w) => w.some('numtheory', (e) => w.sources(e).length >= 2), hints: ['要一台懂“数的性质”的器材。', '「数的性质」，两个数都接。', '甲口 12，乙口 18。'] },
      { id: 'g6', say: '最大公因数 = 6', score: 3, when: { type: 'numtheory', port: 'gcd', op: '=', value: '6' }, hints: ['12 和 18 都能被谁整除？', '2、3、6 都行，哪个最大？', '6。'] },
      { id: 'l36', say: '最小公倍数 = 36', score: 4, when: { type: 'numtheory', port: 'lcm', op: '=', value: '36' }, hints: ['公倍数：12、24、36…18、36…', '第一个公共的。', '36。'] },
    ],
    traps: [], why: '12 = 2×2×3，18 = 2×3×3。公共部分 2×3 = 6 是最大公因数；合起来 2×2×3×3 = 36 是最小公倍数。',
    ref: ['num,num,numtheory|2'],
  });

  P.push({
    id: 'prime-91', essence: ['E2'], title: '91 是质数吗？', grade: 5, domain: '数与运算', points: ['5.8'], topics: ['质数与合数', '因数'],
    alias: ['质数'], hook: '91 看起来像质数，但它真的是吗？让器材说话。',
    shelf: ['num', 'numtheory', 'divmod', 'meter'],
    build: mk({ ents: [{ type: 'num', x: 60, y: 120, role: 'n', props: { n: 91 } }] }),
    predict: { q: '先猜：91 是质数吗？', options: [{ v: 'y', label: '是质数' }, { v: 'n', label: '不是（是合数）' }], reveal: () => ({ v: 'n', label: '不是：91 = 7 × 13' }) },
    milestones: [
      { id: 'wire', say: '把 91 接进「数的性质」', score: 3, glow: ['numtheory'], when: (w) => w.some('numtheory', (e) => w.sources(e).length >= 1), hints: ['「数的性质」。', '91 接甲口。', '甲口 91。'] },
      { id: 'comp', say: '它说 91 不是质数', score: 3, when: (w) => w.some('numtheory', (e) => w.bool(e, 'prime') === false), hints: ['看“甲是质数”这个输出。', '读数里不会写“质数”。', '看信号条的分解式。'] },
      { id: 'div7', say: '用带余除法验证：91 ÷ 7 余 0', score: 4, glow: ['divmod'], when: (w) => w.some('divmod', (e) => w.num(e, 'r') === 0 && e.id && w.sources(e).length >= 2), hints: ['光信他不够，自己验证一下。', '「带余除法」，91 ÷ 7。', '再放一个数字 7，接除数口，看余数。'] },
    ],
    traps: [], why: '91 = 7 × 13，除了 1 和它自己，还有因数 7 和 13，所以是合数。看上去像质数的数，要真的试除才知道。',
    ref: ['divmod,num,num,numtheory|3'],
  });

  P.push({
    id: 'sqrt-2', essence: ['E7'], title: '面积是 2 的正方形，边长是多少？', grade: 8, domain: '数与运算', points: ['7.12', '4.1'], topics: ['平方根', '无理数', '近似值'],
    alias: ['根号2', '无理数'], hook: '边长 × 边长 = 2。把 2 放进开方器，看它是整数、分数，还是别的什么。',
    shelf: ['num', 'sqrt', 'power', 'compare', 'meter'],
    build: mk({ ents: [{ type: 'num', x: 60, y: 120, role: 'a', props: { n: 2 } }] }),
    predict: { q: '先猜：边长是——', options: [{ v: '1.5', label: '正好 1.5' }, { v: '1.4', label: '正好 1.4' }, { v: 'ir', label: '一个写不尽的数' }], reveal: () => ({ v: 'ir', label: '写不尽：≈ 1.414…' }) },
    milestones: [
      { id: 'wire', say: '2 接进开方器', score: 3, glow: ['sqrt'], when: (w) => w.some('sqrt', (e) => w.sources(e).length >= 1), hints: ['「开方」。', '2 接被开方数。', '模式选平方根。'] },
      { id: 'irr', say: '开方器说：开不尽', score: 3, when: (w) => w.some('sqrt', (e) => w.bool(e, 'exact') === false), hints: ['看“开得尽”。', '1.4² = 1.96，1.5² = 2.25，都不是 2。', '它是无限不循环小数。'] },
      { id: 'sq', say: '把结果平方回去，得到的接近 2', score: 4, glow: ['power'], when: (w) => w.some('power', (e) => e.props.e === 2 && w.sources(e).some((s) => s.type === 'sqrt') && Math.abs(w.num(e, 'r') - 2) < 0.001), hints: ['验证：边长²是不是 2？', '「乘方」，2 次方，接在开方器后面。', '开方器 → 乘方（e = 2）。'] },
    ],
    traps: [], why: '√2 ≈ 1.41421356…，不能写成两个整数的比，所以是无理数。平方回去只能“约等于” 2——近似值永远差一点点。',
    ref: ['num,power,sqrt|2'],
  });

  P.push({
    id: 'power-2-10', essence: ['E6'], title: '2 的 10 次方，比 1000 大还是小？', grade: 7, domain: '数与运算', points: ['7.3'], topics: ['乘方', '增长速度'],
    alias: ['指数'], hook: '连乘 10 个 2。再问问比较器：它超过 1000 了吗？',
    shelf: ['num', 'power', 'compare', 'meter'],
    build: mk({ ents: [{ type: 'num', x: 60, y: 60, role: 'two', props: { n: 2 } }, { type: 'num', x: 60, y: 230, role: 'k', props: { n: 1000 } }] }),
    predict: { q: '先猜：2^10 ——', options: [{ v: 'lt', label: '比 1000 小' }, { v: 'gt', label: '比 1000 大' }], reveal: () => ({ v: 'gt', label: '比 1000 大：1024' }) },
    milestones: [
      { id: 'pw', say: '2 接进乘方器，设成 10 次方', score: 4, glow: ['power'], when: (w) => w.some('power', (e) => e.props.e === 10 && w.sources(e).length >= 1), hints: ['「乘方」。', '2 接底数，“几次方”填 10。', 'e = 10。'] },
      { id: 'v', say: '结果是 1024', score: 3, when: { type: 'power', port: 'r', op: '=', value: '1024' }, hints: ['看读数。', '2×2×2…共 10 个。', '1024。'] },
      { id: 'gt', say: '比较器说它 > 1000', score: 3, glow: ['compare'], when: (w) => w.some('compare', (e) => e.props.op === 2 && w.bool(e, 'ok') === true), hints: ['用「比较」，关系 >。', '乘方结果接甲，1000 接乙。', '关系选 >。'] },
    ],
    traps: [], why: '2^10 = 1024 > 1000。乘方增长很快：每多乘一次翻一倍。',
    ref: ['compare,num,num,power|3'],
  });

  // H4 遗留（§10.5.6）：凑整、两位数乘两位数、减法的负数结果，都在竖式工作台上做
  P.push({
    id: 'arith-round-47-38', essence: ['E2'], title: '用凑整算 47 + 38', grade: 2, domain: '数与运算', points: ['2.2'], topics: ['凑整', '两位数加法'],
    alias: ['凑整', '凑整算', '整十'], workbench: 'arith', rung: 2, level: 'core',
    hook: '47 离 50 只差 3。先从 38 里拿出 3，把 47 凑成 50，再用竖式算。',
    shelf: ['arithbench'],
    build: mk({ ents: [{ type: 'arithbench', x: 300, y: 200, role: 'bench', props: { a: 47, op: 0, b: 38 } }] }),
    milestones: [
      { id: 'round', say: '用凑整把 47 凑成 50', score: 3, when: { steps: { used: 'arith.round', allKept: true } },
        hints: ['47 离下一个整十还差几？', '点选 47，再点「凑整」。', '47 + 3 + 35：47 + 3 = 50。'] },
      { id: 'result', say: '竖式算出 47 + 38 = 85', score: 4, when: { type: 'arithbench', port: 'result', op: '=', value: '85' },
        hints: ['现在算 50 + 35。', '点「算个位」，再点「算十位」。', '结果是 85。'] },
    ],
    traps: [], goal: ['round', 'result'],
    why: '47 + 38 = 47 + 3 + 35 = 50 + 35 = 85。凑整是先把一个数凑到整十，再把剩下的加上去；差的部分要从另一个数里拿出来。',
  });

  P.push({
    id: 'arith-mul-23-14', essence: ['E2'], title: '用竖式算 23 × 14', grade: 3, domain: '数与运算', points: ['3.11'], topics: ['两位数乘两位数', '部分积'],
    alias: ['两位数乘两位数', '部分积', '乘法竖式'], workbench: 'arith', rung: 3, level: 'core',
    hook: '把 14 拆成 4 和 10，分别乘 23，再把两个部分积加起来。',
    shelf: ['arithbench'],
    build: mk({ ents: [{ type: 'arithbench', x: 300, y: 200, role: 'bench', props: { a: 23, op: 2, b: 14 } }] }),
    milestones: [
      { id: 'p0', say: '算出个位的部分积：23 × 4 = 92', score: 3, when: { steps: { used: 'arith.partial', allKept: true } },
        hints: ['先用 14 的个位 4 去乘 23。', '点「算个位的部分积」。', '23 × 4 = 92。'] },
      { id: 'result', say: '竖式算出 23 × 14 = 322', score: 4, when: { type: 'arithbench', port: 'result', op: '=', value: '322' },
        hints: ['十位的部分积要向左移一位：23 × 10 = 230。', '点「算十位的部分积」，再点「相加（部分积）」。', '92 + 230 = 322。'] },
    ],
    traps: [], goal: ['p0', 'result'],
    why: '23 × 14 = 23 × 4 + 23 × 10 = 92 + 230 = 322。两位数乘两位数：每个数位乘一次，十位的部分积末尾补 0，再相加。',
  });

  P.push({
    id: 'arith-sub-negative', essence: ['E2'], title: '23 − 47 是多少？', grade: 7, domain: '数与运算', points: ['7.2'], topics: ['有理数的减法', '负数'],
    alias: ['负数', '减法负数', '小减大'], workbench: 'arith', rung: 3, level: 'core',
    hook: '23 比 47 小，减不了。竖式把大数写在上面，算出差，再决定结果的正负。',
    shelf: ['arithbench'],
    build: mk({ ents: [{ type: 'arithbench', x: 300, y: 200, role: 'bench', props: { a: 23, op: 1, b: 47 } }] }),
    milestones: [
      { id: 'cols', say: '竖式算出个位和十位', score: 2, when: { steps: { used: 'arith.column', allKept: true } },
        hints: ['大数 47 写在上面，小数 23 在下面。', '点「算个位」：7 − 3 = 4。', '再点「算十位」：4 − 2 = 2。'] },
      { id: 'result', say: '结果是 −24', score: 4, when: { type: 'arithbench', port: 'result', op: '=', value: '-24' },
        hints: ['47 − 23 = 24，比 0 大；原题是 23 − 47。', '差的前面要加负号。', '−24。'] },
    ],
    traps: [], goal: ['cols', 'result'],
    why: '23 − 47 = −(47 − 23) = −24。减数比被减数大时，结果是负数：先算大数减小数的差，再在前面加负号。',
  });

  U.problems.push(...P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
