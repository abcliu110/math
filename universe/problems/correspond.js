/* 一一对应（E1）题：用点阵、比较、读数这些现成器材，把两组东西配成对，看“够不够配”。 */
(function (G) {
  'use strict';
  const U = G.U, mk = U.mkScene, P = [];
  const arrOf = (w, e) => w.sources(e).filter((s) => s.type === 'array');

  P.push({
    id: 'match-pairs', essence: ['E1', 'E2'], title: '5 个学生配 5 个座位：每人正好一个座位', grade: 2, domain: '数与运算', points: ['1.1'], topics: ['一一对应', '数量相等', '排队计数'],
    alias: ['配对', '一一对应', '排队'], hook: '5 个学生，5 个座位。把学生排成一排，再把座位排成一排，让两排一个对一个。',
    shelf: ['num', 'array', 'compare', 'meter'],
    build: mk({ ents: [
      { type: 'num', x: 60, y: 90, role: 'students', props: { n: 5 } },
      { type: 'num', x: 60, y: 230, role: 'seats', props: { n: 5 } },
    ] }),
    predict: {
      q: '动手之前先猜：5 个学生和 5 个座位，能做到每人正好坐一个吗？',
      options: [{ v: 'y', label: '能：每人一个，刚好配完' }, { v: 'n', label: '不能：总有人没位子' }],
      reveal: () => ({ v: 'y', label: '能：5 对 5，刚好配完' }),
    },
    milestones: [
      { id: 'row', say: '把 5 个学生排成点阵', score: 3, glow: ['array'], when: (w) => w.ofType('array').some((e) => e.props.rows * e.props.cols === 5), hints: ['每个学生用一个点来代表。', '器材架里的「点阵」，几行几个可以自己设。', '点阵设为 1 行 5 个（或 5 行 1 个）。'] },
      { id: 'match', say: '第二排座位也是 5 个，两排的数相等', score: 5, glow: ['compare'], when: (w) => w.some('compare', (e) => arrOf(w, e).filter((s) => s.props.rows * s.props.cols === 5).length >= 2 && w.bool(e, 'ok') === true), hints: ['再摆一个点阵代表座位，也是 5 个。', '两个点阵的「一共」都接到「比较」，关系选 =。', '学生点阵 → 比较甲口；座位点阵 → 比较乙口。'] },
    ],
    traps: [], goal: ['row', 'match'],
    why: '一一对应的意思是：每个学生配一个座位，不多也不少。把两排排好，一个对一个，刚好配完，所以两组人数相等。',
    ref: ['array,array,compare,num,num|2'],
  });

  P.push({
    id: 'count-by-match', essence: ['E1', 'E2'], title: '4 个人两两握手一次（甲和乙握过，乙和甲不再算），一共握几次？', grade: 5, domain: '数与运算', points: [], topics: ['配对计数', '不重复'],
    alias: ['握手', '配对计数'], hook: '4 个人，每两个人握一次手。把每一次握手，对应到一对人身上，再数一数一共几对。',
    shelf: ['num', 'array', 'meter', 'compare'],
    build: mk({ ents: [
      { type: 'num', x: 60, y: 110, role: 'people', props: { n: 4 } },
      { type: 'meter', x: 420, y: 110, role: 'show' },
    ] }),
    predict: {
      q: '动手之前先猜：4 个人两两握手一次，一共握几次？',
      options: [{ v: 4, label: '4' }, { v: 6, label: '6' }, { v: 12, label: '12' }],
      reveal: () => ({ v: 6, label: '6' }),
    },
    milestones: [
      { id: 'pairs', say: '用点阵表示这些握手：每个点是一次握手', score: 3, glow: ['array'], when: (w) => w.ofType('array').some((e) => e.props.rows === 3 && e.props.cols === 2), hints: ['每一次握手对应一对人，用一个点记下来。', '点阵：几行几列，才有 6 个点？', '3 行，每行 2 个。'] },
      { id: 'read6', say: '读数器读出 6', score: 4, glow: ['meter'], when: { type: 'meter', port: 'v', op: '=', value: '6' }, hints: ['把点阵的「一共」接到读数器上。', '读数器的「值」接点阵的输出。', '点阵 → 读数。'] },
    ],
    traps: [
      { id: 'people4', when: { type: 'meter', port: 'v', op: '=', value: '4' }, wrong: '4 是人数，不是握手次数：握手是“两个人之间”的事。' },
      { id: 'twice12', when: { type: 'meter', port: 'v', op: '=', value: '12' }, wrong: '12 把甲和乙、乙和甲各算了一次——同一次握手被数了两遍。' },
    ],
    goal: ['pairs', 'read6'],
    why: '每一对人只握一次手，所以数握手就是数“配对”。4 人的配对：甲与乙、丙、丁（3 次），乙与丙、丁（2 次），丙与丁（1 次），共 6 次。每次握手配一个点，6 个点，正好 6 次。',
    ref: ['array,meter,num|1'],
  });

  P.push({
    id: 'no-extra-seat', essence: ['E1', 'E4'], title: '5 位客人，只有 4 个座位：能一人一座吗？', grade: 3, domain: '数与运算', points: ['1.1'], topics: ['一一对应', '数量不等', '找不配对的'],
    alias: ['配不上', '多出一个'], hook: '5 位客人要坐 4 把椅子。试着把客人和椅子一个对一个地配起来，看看会剩下什么。',
    shelf: ['num', 'array', 'compare', 'meter'],
    build: mk({ ents: [
      { type: 'num', x: 60, y: 90, role: 'guests', props: { n: 5 } },
      { type: 'num', x: 60, y: 230, role: 'seats', props: { n: 4 } },
    ] }),
    predict: {
      q: '动手之前先猜：5 位客人、4 把椅子，能做到一人一座吗？',
      options: [{ v: 'y', label: '能' }, { v: 'n', label: '不能' }],
      reveal: () => ({ v: 'n', label: '不能：5 人 4 座，差 1 人' }),
    },
    milestones: [
      { id: 'both', say: '客人和椅子各排成一排（5 和 4）', score: 3, glow: ['array'], when: (w) => w.ofType('array').some((e) => e.props.rows * e.props.cols === 5) && w.ofType('array').some((e) => e.props.rows * e.props.cols === 4), hints: ['客人和椅子各用一个点阵表示。', '一个点阵 5 个点，一个点阵 4 个点。', '两个「点阵」：一个 1×5，一个 1×4。'] },
      { id: 'differ', say: '比较读出：客人数和座位数不相等', score: 7, glow: ['compare'], when: (w) => w.some('compare', (e) => { const src = arrOf(w, e); return src.some((s) => s.props.rows * s.props.cols === 5) && src.some((s) => s.props.rows * s.props.cols === 4) && w.bool(e, 'ok') === true; }), hints: ['用「比较」，关系选 =，并勾上「反过来」。', '两个点阵的「一共」分别接甲口和乙口。', '比较：甲 = 客人点阵，乙 = 椅子点阵，反过来 = 是。'] },
    ],
    traps: [], goal: ['both', 'differ'],
    why: '一一对应要求两边的个数相同。5 位客人配 4 把椅子，配到第 4 位时椅子用完了，第 5 位客人没有位子：这一对配不上，就说明两组数量不等。',
    ref: ['array,array,compare,num,num|2'],
  });

  U.problems.push(...P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
