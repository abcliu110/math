/* “数的特征”的题。点数字卡片拼数，看个位和数字和；奇偶用点子配对。判分只看器材的输出。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const fb = (props) => () => { const s = W.blank(); const id = W.add(s, 'featbench', 40, 50, props); s.entities[id].role = 'ft'; return s; };
  const P = [];
  const base = { domain: '数与运算', level: 'core', shelf: ['featbench'], traps: [], predict: null };
  const add = (o) => P.push(Object.assign({}, base, o));
  const ms = (id, say, score, port, value, hints) => ({ id, say, score, when: { role: 'ft', port, op: '=', value: String(value) }, hints });
  add({
    id: 'ft-max-10', essence: ['E3', 'E7'], title: '用 0、3、5、7 拼一个最大的三位数，要同时是 2 和 5 的倍数', grade: 5, rung: 3, points: ['5.8'],
    topics: ['2、5 的倍数特征'], alias: ['倍数特征', '个位是 0', '最大'],
    hook: '同时是 2 和 5 的倍数，个位一定是几？个位定了，剩下的两张卡片怎么放才最大？',
    build: fb({ cards: '0,3,5,7', tpl: '???', cond: 4, gk: 1 }),
    milestones: [ms('ok', '拼出一个同时是 2 和 5 的倍数', 3, 'ok', 1, ['2 的倍数个位是双数，5 的倍数个位是 0 或 5。', '两个都要：个位只能是 0。', '比如 350。']), ms('best', '最大的是 750', 5, 'best', 1, ['个位放 0。', '百位放最大的 7。', '750。'])],
    goal: ['best'],
    why: '2 的倍数个位是 0、2、4、6、8，5 的倍数个位是 0 或 5，两个都要，个位只能是 0。剩下 3、5、7 里挑大的放前面：750。',
    traps: [{ id: 'five', wrong: '个位是 5 只是 5 的倍数，不是 2 的倍数（5 是单数）。', when: { role: 'ft', port: 'n', op: '=', value: '735' } }],
  });
  add({
    id: 'ft-3-all', essence: ['E3', 'E7'], title: '从 2、4、7 里拿两张拼两位数，哪些是 3 的倍数？', grade: 5, rung: 3, points: ['5.8'],
    topics: ['3 的倍数特征', '有序列举'], alias: ['3 的倍数', '数字和', '找全'],
    hook: '3 的倍数看数字和。先想：哪两张卡片的数字和是 3 的倍数？再把它们正着、倒着都拼一次，点“记下这个”。',
    build: fb({ cards: '2,4,7', tpl: '??', cond: 1, gk: 3 }),
    milestones: [ms('all', '找全了：24、42、27、72', 6, 'all', 1, ['2 + 4 = 6，2 + 7 = 9：都是 3 的倍数。', '4 + 7 = 11：不是。', '24、42、27、72。'])],
    goal: ['all'],
    why: '一个数是不是 3 的倍数，只看各位数字加起来。2 + 4 = 6、2 + 7 = 9 都是 3 的倍数，4 + 7 = 11 不是。两张卡片换个位置，数字和不变，所以 24、42、27、72 一共 4 个。',
  });
  add({
    id: 'ft-fill-3', essence: ['E3', 'E7'], title: '4□2 是 3 的倍数，□ 里可以填几？', grade: 5, rung: 4, points: ['5.8'],
    topics: ['3 的倍数特征', '数字谜'], alias: ['填数字', '3 的倍数', '数字和'],
    hook: '4 + 2 = 6，再加上 □ 里的数，和要是 3 的倍数。数字可以随便用，一个一个试，符合的点“记下这个”。',
    build: fb({ cards: '0,1,2,3,4,5,6,7,8,9', tpl: '4?2', reuse: true, cond: 1, gk: 3 }),
    milestones: [ms('all', '找全了：□ 填 0、3、6、9', 6, 'all', 1, ['4 + 2 = 6 已经是 3 的倍数。', '再加的数也要是 3 的倍数。', '0、3、6、9。'])],
    goal: ['all'],
    why: '4□2 = 4 × 99 + □ × 9 + (4 + □ + 2)，前两块一定是 3 的倍数，所以只看 4 + □ + 2 = 6 + □。□ 是 0、3、6、9 时和是 3 的倍数。',
  });
  add({
    id: 'ft-odd-odd', essence: ['E3', 'E5'], title: '奇数 + 奇数，一定是偶数吗？', grade: 5, rung: 3, points: ['5.8'],
    topics: ['奇数和偶数'], alias: ['奇偶', '奇数', '偶数', '配对'],
    hook: '点子两个两个配成对，奇数总有一个落单。点“合起来”，看两个落单的点会怎样。换 3 组不同的奇数试试。',
    build: fb({ mode: 1, a: 3, b: 5 }),
    milestones: [ms('one', '3 + 5 = 8：偶数', 2, 'even', 1, ['点“合起来”。', '两个落单的点配成一对。', '8 是偶数。']), ms('three', '试了 3 组奇 + 奇，都是偶数', 5, 'oo', 3, ['用 − + 换成别的奇数。', '再点“合起来”。', '每一组都是偶数。'])],
    goal: ['three'],
    why: '奇数两个两个配对，总剩一个落单。两个奇数合起来，两个落单的正好配成一对，就没有落单的了：奇数 + 奇数 = 偶数。不管多大的奇数都是这样，这是“配对”说明的道理，不是试出来的巧合。',
  });
  U.problems.push.apply(U.problems, P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
