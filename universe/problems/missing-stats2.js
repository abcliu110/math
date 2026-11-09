/* 三年级统计题（3.15a 复式统计表）：每组数据一道核心题、一道陷阱题。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;

  // 数据 A：3,2;1,4，总数 10
  U.problems.push({
    id: 'g3-twoway-total-core', title: '复式统计表：所有的数加起来是几？', grade: 3, domain: '统计与概率', essence: ['E8', 'E7'], points: ['3.15a'], level: 'core', rung: 1,
    alias: ['复式统计表', '总数', '合计', '统计'], hook: '一张统计表记录了两组人数：第一行是 3 和 2，第二行是 1 和 4。把表里所有的数加起来，一共是多少？',
    shelf: ['twoway'],
    build() { return W.blank(); },
    predict: null,
    milestones: [
      { id: 'place', say: '放一张复式统计表', score: 2, when: { count: { type: 'twoway', ge: 1 } },
        hints: ['要把整张表录进来，用“复式统计表”器材。', '数据要按行录入：每行的格子用逗号隔开，行之间用分号。', '放一张复式统计表，数据填 3,2;1,4。'] },
      { id: 'total', say: '总数是 10', score: 4, when: { type: 'twoway', port: 'total', op: '=', value: '10' },
        hints: ['总数是表里所有格子的和，每一格都要算进去。', '把第一行和第二行的数都加起来。', '数据填 3,2;1,4，总数输出就是 10。'] },
    ],
    traps: [{ id: 'one-short', wrong: '漏加了一个格子，得到 9。每一格都要算进去。', when: { type: 'twoway', port: 'total', op: '=', value: '9' } }],
    goal: ['total'],
    why: '复式统计表的总数是所有格子的和：3 + 2 + 1 + 4 = 10。',
  });

  // 数据 A（陷阱）：不要只看一行，第二行也要加进去
  U.problems.push({
    id: 'g3-twoway-total-trap', title: '复式统计表：别只加了一行', grade: 3, domain: '统计与概率', essence: ['E8', 'E7'], points: ['3.15a'], level: 'trap', rung: 1,
    alias: ['复式统计表', '总数', '陷阱', '漏加'], hook: '表里有两行：第一行 3 和 2，第二行 1 和 4。有人只加了一个格子就得到了 9。整张表的总数应该是多少？',
    shelf: ['twoway'],
    build() { return W.blank(); },
    predict: null,
    milestones: [
      { id: 'place', say: '放一张复式统计表', score: 2, when: { count: { type: 'twoway', ge: 1 } },
        hints: ['要把整张表录进来，用“复式统计表”器材。', '两行的数都要录进去，行之间用分号隔开。', '放一张复式统计表，数据填 3,2;1,4。'] },
      { id: 'total', say: '整张表的总数是 10', score: 4, when: { type: 'twoway', port: 'total', op: '=', value: '10' },
        hints: ['第二行的 1 和 4 也要加进去。', '不要只看一行或漏掉一个格子。', '数据填 3,2;1,4，总数输出是 10，不是 9。'] },
    ],
    traps: [{ id: 'one-short', wrong: '漏加了一个格子，得到 9。', when: { type: 'twoway', port: 'total', op: '=', value: '9' } }],
    goal: ['total'],
    why: '总数要把每一行、每一格都加上：3 + 2 + 1 + 4 = 10。只加一部分会得到 9 之类的错误答案。',
  });

  // 数据 B：2,0,1;0,3,0，三列，总数 6
  U.problems.push({
    id: 'g3-twoway-zero-core', title: '三列的统计表：总数是几？', grade: 3, domain: '统计与概率', essence: ['E8', 'E7'], points: ['3.15a'], level: 'core', rung: 1,
    alias: ['复式统计表', '总数', '列', '0'], hook: '一张统计表有三列：第一行是 2、0、1，第二行是 0、3、0。整张表的总数是多少？',
    shelf: ['twoway'],
    build() { return W.blank(); },
    predict: null,
    milestones: [
      { id: 'place', say: '放一张复式统计表', score: 2, when: { count: { type: 'twoway', ge: 1 } },
        hints: ['要把整张表录进来，用“复式统计表”器材。', '表有三列，每行三个数，格子之间用逗号隔开。', '放一张复式统计表，数据填 2,0,1;0,3,0。'] },
      { id: 'total', say: '总数是 6', score: 4, when: { type: 'twoway', port: 'total', op: '=', value: '6' },
        hints: ['总数是所有格子的和，0 也要算进去（它不改变和，但格子要录全）。', '把 2、0、1、0、3、0 都加起来。', '数据填 2,0,1;0,3,0，总数输出是 6。'] },
    ],
    traps: [],
    goal: ['total'],
    why: '总数是所有格子的和：2 + 0 + 1 + 0 + 3 + 0 = 6。0 的格子也是表的一部分，录入时不能漏掉。',
  });

  // 数据 B（陷阱）：0 格子也要算对，总数是 6 不是 5
  U.problems.push({
    id: 'g3-twoway-zero-trap', title: '有 0 的统计表：总数不要算少了', grade: 3, domain: '统计与概率', essence: ['E8', 'E7'], points: ['3.15a'], level: 'trap', rung: 1,
    alias: ['复式统计表', '总数', '陷阱', '0'], hook: '一张统计表：第一行 2、0、1，第二行 0、3、0。有人算出总数是 5。这个结果对吗？',
    shelf: ['twoway'],
    build() { return W.blank(); },
    predict: null,
    milestones: [
      { id: 'place', say: '放一张复式统计表', score: 2, when: { count: { type: 'twoway', ge: 1 } },
        hints: ['要把整张表录进来，用“复式统计表”器材。', '0 也是一个格子，要和其他数一样录进去。', '放一张复式统计表，数据填 2,0,1;0,3,0。'] },
      { id: 'total', say: '总数是 6，不是 5', score: 4, when: { type: 'twoway', port: 'total', op: '=', value: '6' },
        hints: ['看看有没有哪个格子没有加进去。', '2 + 1 + 3 = 6，0 不影响和，但 2、1、3 都要算。', '数据填 2,0,1;0,3,0，总数输出是 6。'] },
    ],
    traps: [{ id: 'short-five', wrong: '少加了一个格子，得到 5。', when: { type: 'twoway', port: 'total', op: '=', value: '5' } }],
    goal: ['total'],
    why: '把所有格子加起来是 2 + 0 + 1 + 0 + 3 + 0 = 6。算成 5 通常是漏掉了某个非零的格子。',
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
