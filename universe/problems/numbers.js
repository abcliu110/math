/* 数论与幂：公因数公倍数、质数、开方、乘方。 */
(function (G) {
  'use strict';
  const U = G.U, mk = U.mkScene;
  const P = [];

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

  U.problems.push(...P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
