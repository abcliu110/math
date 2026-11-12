/* 质因数积木的题（docs/new-instruments.md 5.7）：每个质数一种颜色的积木，一个数就是一摞积木。
 * 开场台面都还没达到目标，要学生自己改出来（改数、加第二个数、换模式、写先猜）。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const pb = (props) => () => { const s = W.blank(); const id = W.add(s, 'primeblocks', 60, 60, props); s.entities[id].role = 'p'; return s; };
  const P = [];

  P.push({
    id: 'pb-split-36', essence: ['E2'], title: '把 36 拆到不能再拆', grade: 5, domain: '数与运算', points: ['5.8'], level: 'core', rung: 2,
    topics: ['质数', '合数', '分解质因数'], alias: ['质因数', '分解质因数', '积木', '质数'],
    hook: '现在摆的是 12：2、2、3 三块积木。把数改成 36，看它由哪些质数积木搭成。积木都是质数，不能再拆了。',
    shelf: ['primeblocks', 'meter'],
    build: pb({ a: 12, b: 0, mode: 0 }),
    predict: { q: '先猜：36 由几块质数积木搭成？', options: [{ v: 0, label: '2 块（6 × 6）' }, { v: 1, label: '4 块（2 × 2 × 3 × 3）' }, { v: 2, label: '3 块' }], reveal: () => ({ v: 1, label: '4 块：6 还能拆成 2 × 3，所以不是 6 × 6' }) },
    milestones: [
      { id: 'four', say: '36 是 4 块质数积木：2 × 2 × 3 × 3', score: 6, when: { role: 'p', port: 'blocks', op: '=', value: '4' },
        hints: ['先把“数 a”改成 36。', '积木只能是质数，6 和 4 还能拆开。', '36 = 2 × 2 × 3 × 3，一共 4 块。'] },
    ],
    traps: [{ id: 'six', wrong: '把 36 拆成 6 × 6 就停了：6 不是质数，还能拆成 2 × 3。', when: { role: 'p', port: 'blocks', op: '=', value: '2' } }],
    goal: ['four'],
    why: '36 = 4 × 9 = 2 × 2 × 3 × 3。分解质因数要拆到每一块都是质数为止；6、4、9 都还能再拆。',
  });
  P.push({
    id: 'pb-gcd-24-36', essence: ['E2'], title: '24 和 36 的最大公因数：看共有的积木', grade: 5, domain: '数与运算', points: ['5.8'], level: 'core', rung: 3,
    topics: ['最大公因数', '最小公倍数', '分解质因数'], alias: ['最大公因数', '公因数', '最小公倍数', '积木'],
    hook: '24 是 2、2、2、3，36 是 2、2、3、3。把两摞并排，共有的积木对齐。共有的那些乘起来，就是最大公因数。',
    shelf: ['primeblocks', 'meter'],
    build: pb({ a: 24, b: 0, mode: 1 }),
    predict: { q: '先猜：24 和 36 的最大公因数是——', options: [{ v: 0, label: '6' }, { v: 1, label: '12' }, { v: 2, label: '72' }], reveal: () => ({ v: 1, label: '12：共有 2、2、3，乘起来是 12' }) },
    milestones: [
      { id: 'gcd', say: '最大公因数是 12', score: 4, when: { role: 'p', port: 'gcd', op: '=', value: '12' },
        hints: ['要有第二摞积木：把“数 b”改成 36。', '共有的积木是哪几块？', '共有 2、2、3，乘起来是 12。'] },
      { id: 'lcm', say: '最小公倍数是 72', score: 3, when: { role: 'p', port: 'lcm', op: '=', value: '72' },
        hints: ['最小公倍数：两摞合起来，共有的积木只算一次。', '2、2、2、3、3 一共五块。', '2 × 2 × 2 × 3 × 3 = 72。'] },
    ],
    traps: [], goal: ['gcd', 'lcm'],
    why: '24 = 2×2×2×3，36 = 2×2×3×3。共有的积木 2、2、3 乘起来是最大公因数 12；合起来共有的只算一次，2×2×2×3×3 = 72 是最小公倍数。',
  });
  P.push({
    id: 'pb-reduce-24-36', essence: ['E2', 'E3'], title: '约分 24/36：把共有的积木成对拿掉', grade: 5, domain: '数与运算', points: ['5.10'], level: 'core', rung: 3,
    topics: ['约分', '最简分数', '最大公因数'], alias: ['约分', '最简分数', '积木', '公因数'],
    hook: '分子 24 一摞，分母 36 一摞。分子分母里共有的积木，成对拿掉，剩下的就是最简分数。',
    shelf: ['primeblocks', 'meter'],
    build: pb({ a: 24, b: 0, mode: 3 }),
    predict: { q: '先猜：24/36 约成最简分数是——', options: [{ v: 0, label: '12/18' }, { v: 1, label: '2/3' }, { v: 2, label: '6/9' }], reveal: () => ({ v: 1, label: '2/3：12/18 和 6/9 还能再约' }) },
    milestones: [
      { id: 'num', say: '分子约成 2', score: 3, when: { role: 'p', port: 'rn', op: '=', value: '2' },
        hints: ['分母那一摞要有：把“数 b”改成 36。', '共有的积木拿掉以后，分子剩几？', '共有 2、2、3，拿掉以后分子剩 2。'] },
      { id: 'den', say: '分母约成 3，最简分数是 2/3', score: 4, when: { role: 'p', port: 'rd', op: '=', value: '3' },
        hints: ['分母 36 拿掉共有的积木以后剩几？', '拿掉共有的 2、2、3。', '36 拿掉 2、2、3 剩 3。'] },
    ],
    traps: [{ id: 'half', wrong: '只约了一部分：12/18、6/9 的分子分母还有共有的积木，没有拿完。', when: { role: 'p', port: 'gcd', op: '<', value: '12' } }],
    goal: ['num', 'den'],
    why: '24/36：分子分母共有 2、2、3，成对拿掉后剩 2/3。拿完共有的积木，就是用最大公因数 12 约分，一次约到最简。',
  });
  P.push({
    id: 'pb-count-divisors', essence: ['E2', 'E9'], title: '36 有几个因数？先猜，再看积木怎么搭', grade: 5, domain: '数与运算', points: ['5.8'], level: 'core', rung: 4,
    topics: ['因数', '因数个数', '先猜后看'], alias: ['因数', '因数个数', '全部因数', '先猜'],
    hook: '每块积木可以用，也可以不用，搭出的数就是 36 的因数。先猜：36 有几个因数？写在“先猜”里，积木才给你看。注意：不是数积木的块数。',
    shelf: ['primeblocks', 'meter'],
    build: pb({ a: 36, b: 0, mode: 2, guess: '' }),
    predict: null,
    milestones: [
      { id: 'guessed', say: '写下了你的猜测', score: 2, when: { role: 'p', port: 'gap', op: '>=', value: '0' },
        hints: ['“先猜”里写一个数。', '数一数 1、2、3、4、6、9、12、18、36 够不够你猜的数。', '写一个整数，比如 9。'] },
      { id: 'hit', say: '猜对了：36 有 9 个因数', score: 5, when: { role: 'p', port: 'gap', op: '=', value: '0' },
        hints: ['36 = 2×2×3×3：2 有 0、1、2 个三种选法，3 也是。', '三种选法 × 三种选法。', '3 × 3 = 9 个。'] },
    ],
    traps: [{ id: 'blocks', wrong: '把积木的块数 4 当成因数的个数。', when: { role: 'p', port: 'gap', op: '=', value: '5' } }],
    goal: ['guessed', 'hit'],
    why: '36 = 2² × 3²。2 可以用 0、1、2 块，3 可以用 0、1、2 块，所以因数有 3 × 3 = 9 个：1、2、3、4、6、9、12、18、36。块数是 4，因数个数是 9，不是一回事。',
  });
  P.push({
    id: 'pb-twelve-divisors', essence: ['E2', 'E9'], title: '有 12 个因数的最小的数是几？', grade: 6, domain: '数与运算', points: ['5.8'], level: 'core', rung: 5,
    topics: ['因数个数', '最小', '分解质因数'], alias: ['因数', '因数个数', '最小', '积木'],
    hook: '因数个数 = 每种积木（用 0 块到全部）的选法数相乘。想一想：搭出 12 个因数，怎样用最小的积木？试着改“数 a”，看“因数个数”。',
    shelf: ['primeblocks', 'meter'],
    build: pb({ a: 36, b: 0, mode: 0 }),
    predict: null,
    milestones: [
      { id: 'twelve', say: '找到一个有 12 个因数的数', score: 4, when: { role: 'p', port: 'count', op: '=', value: '12' },
        hints: ['12 = 3 × 4 = 2 × 6 = 2 × 2 × 3，对应每种积木的块数 + 1。', '块数少，数就小；小的质数用得多。', '2 用 5 块再加 3 用 1 块：2×2×2×2×2×3 = 96；还有更小的。'] },
      { id: 'min', say: '最小的是 60', score: 4, when: (w) => w.some('primeblocks', (e) => e.props.a === 60 && w.num(e, 'count') === 12),
        why_code: '“最小”要比较学生试过的数，只要判断是不是 60，数据形式写不出带条件的相等',
        hints: ['12 = 3 × 2 × 2：三种质数，块数分别 2、1、1。', '大的块数给最小的质数 2。', '2×2×3×5 = 60。'] },
    ],
    traps: [], goal: ['twelve', 'min'],
    why: '因数个数 = 各种质数块数加 1 的积。12 = 3 × 2 × 2，所以三种质数，块数 2、1、1；把多的块数给最小的质数：2² × 3 × 5 = 60。比 72、84、90、96 都小。',
  });
  U.problems.push(...P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
