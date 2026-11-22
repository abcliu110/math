/* “高斯求和”的题。倒过来写一行、上下对齐相加：每一列一样大，和 = (首 + 末) × 个数 ÷ 2。判分只看器材的输出（和只有配对以后才有）。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const gb = (props) => () => { const s = W.blank(); const id = W.add(s, 'gaussbench', 40, 50, props); s.entities[id].role = 'gs'; return s; };
  const P = [];
  const base = { domain: '数与运算', level: 'core', shelf: ['gaussbench'], traps: [], predict: null, points: ['4.10', '1.16'], topics: ['高斯求和', '等差数列'] };
  const add = (o) => P.push(Object.assign({}, base, o));
  const ms = (id, say, score, port, value, hints) => ({ id, say, score, when: { role: 'gs', port, op: '=', value: String(value) }, hints });
  add({
    id: 'gs-1-100', essence: ['E2', 'E4'], title: '1 + 2 + 3 + … + 100 等于多少？', grade: 3, rung: 2, alias: ['高斯', '1 加到 100'],
    hook: '一个一个加要加 99 次。把这串数倒过来写在下面，上下两个数一对一对地看。',
    build: gb({ a: 1, d: 1, n: 100 }),
    predict: { q: '先猜：大约是多少？', options: [{ v: 0, label: '一千多' }, { v: 1, label: '五千多' }, { v: 2, label: '一万多' }], answer: 1 },
    milestones: [ms('t', '和是 5050', 8, 'total', 5050, ['点“倒过来写一行”。', '再点“上下对齐相加”：每一列都是 101。', '100 列 101，两行是同一串数写了两遍：101 × 100 ÷ 2 = 5050。'])],
    goal: ['t'],
    why: '1 和 100 一对、2 和 99 一对……每一对都是 101：上面多 1，下面就少 1，和不变。两行一共 100 个 101，是这串数的两倍，所以和是 101 × 100 ÷ 2 = 5050。',
  });
  add({
    id: 'gs-odd', essence: ['E2', 'E4'], title: '1 + 3 + 5 + … + 19 等于多少？', grade: 4, rung: 3, alias: ['奇数的和', '高斯'],
    hook: '先把这串数摆出来：从 1 开始，每次加几？一共几个数？最后一个要是 19。再倒过来配对。',
    build: gb({ a: 1, d: 1, n: 2 }),
    milestones: [
      ms('l', '摆对了：1、3、5……19，一共 10 个数', 4, 'last', 19, ['每次加 2。', '数一数 1 到 19 有几个奇数。', '每次加 2、10 个数，最后一个是 1 + 9 × 2 = 19。']),
      { id: 't', say: '和是 100', score: 4, when: { all: [{ role: 'gs', port: 'last', op: '=', value: '19' }, { role: 'gs', port: 'total', op: '=', value: '100' }] }, hints: ['倒过来、对齐相加。', '每一列 1 + 19 = 20。', '20 × 10 ÷ 2 = 100。'] },
    ],
    goal: ['l', 't'],
    why: '每次加 2，10 个数，最后一个是 1 + 9 × 2 = 19。每一对是 1 + 19 = 20，和是 20 × 10 ÷ 2 = 100。前 10 个奇数的和正好是 10 × 10。',
  });
  add({
    id: 'gs-seats', essence: ['E2', 'E4'], title: '剧场第一排 20 个座位，往后每排多 2 个，一共 15 排。一共多少个座位？', grade: 5, rung: 4, alias: ['剧场座位', '等差数列'],
    hook: '把每排的座位数摆成一串数：从几开始？每次加几？几个数？再倒过来配对。',
    build: gb({ a: 1, d: 1, n: 2 }),
    milestones: [
      ms('l', '最后一排 48 个座位', 4, 'last', 48, ['从 20 开始，每次加 2，15 个数。', '最后一排是 20 + 14 × 2。', '48。']),
      { id: 't', say: '一共 510 个座位', score: 4, when: { all: [{ role: 'gs', port: 'last', op: '=', value: '48' }, { role: 'gs', port: 'n', op: '=', value: '15' }, { role: 'gs', port: 'total', op: '=', value: '510' }] }, hints: ['倒过来、对齐相加。', '每一列 20 + 48 = 68。', '68 × 15 ÷ 2 = 510。'] },
    ],
    goal: ['l', 't'],
    why: '第 15 排是 20 + 14 × 2 = 48 个。第一排和最后一排一对是 68，第二排和倒数第二排也是 68……15 排配成的两行一共 68 × 15，一行就是 68 × 15 ÷ 2 = 510 个。',
  });
  add({
    id: 'gs-find-n', essence: ['E2', 'E4'], title: '5 + 9 + 13 + … + 81：一共几个数？和是多少？', grade: 5, rung: 5, alias: ['项数', '高斯'],
    hook: '从 5 开始每次加 4，最后一个要正好是 81：先调个数。再倒过来配对。',
    build: gb({ a: 5, d: 4, n: 2 }),
    milestones: [
      ms('l', '一共 20 个数', 4, 'last', 81, ['从 5 到 81 一共加了几次 4？', '(81 − 5) ÷ 4 = 19 次，数的个数比加的次数多 1。', '20 个数。']),
      { id: 't', say: '和是 860', score: 4, when: { all: [{ role: 'gs', port: 'last', op: '=', value: '81' }, { role: 'gs', port: 'total', op: '=', value: '860' }] }, hints: ['倒过来、对齐相加。', '每一列 5 + 81 = 86。', '86 × 20 ÷ 2 = 860。'] },
    ],
    goal: ['l', 't'],
    why: '从 5 到 81 加了 (81 − 5) ÷ 4 = 19 次 4，所以有 19 + 1 = 20 个数（像植树：间隔比棵数少 1）。和是 (5 + 81) × 20 ÷ 2 = 860。',
  });
  U.problems.push.apply(U.problems, P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
