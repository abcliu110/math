/* “间隔与植树”的题。开场都没到目标：学生自己拖间隔、拖路长、点两头的树、点“围成一圈”。
 * 全部可以在图上直接完成。判分只看器材的输出（几棵、几个间隔、两头种了几棵）。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const gp = (props) => () => { const s = W.blank(); const id = W.add(s, 'gapbench', 40, 60, props); s.entities[id].role = 'g'; return s; };
  const P = [];
  const base = { domain: '数与运算', level: 'core', shelf: ['gapbench'], traps: [], predict: null, points: ['5.7'] };
  const add = (o) => P.push(Object.assign({}, base, o));
  const ms = (id, say, score, port, value, hints) => ({ id, say, score, when: { role: 'g', port, op: '=', value: String(value) }, hints });

  add({
    id: 'gp-20-5', essence: ['E2', 'E7'], title: '20 米的路，每隔 5 米种一棵', grade: 5, rung: 2,
    topics: ['植树问题'], alias: ['植树问题', '两端都种', '间隔'],
    hook: '路长 20 米，两头都种。把“隔”字拖到 5 米的地方，数一数有几个间隔、几棵树。',
    build: gp({ len: 20, gap: 10, le: 1, re: 1 }),
    predict: { q: '20 ÷ 5 = 4。种几棵？', options: [{ v: '4', label: '4 棵' }, { v: '5', label: '5 棵' }, { v: '3', label: '3 棵' }], answer: '5' },
    milestones: [ms('gaps', '4 个间隔', 3, 'gaps', 4, ['每隔 5 米。', '拖“隔”字到 5。', '20 ÷ 5 = 4。']), ms('trees', '5 棵树', 5, 'trees', 5, ['数树，不是数间隔。', '两头都种。', '4 + 1 = 5。'])],
    goal: ['gaps', 'trees'],
    why: '20 ÷ 5 = 4 是间隔的个数。两头都种时，每个间隔的左边一棵，最后还要多一棵：4 + 1 = 5 棵。',
  });
  add({
    id: 'gp-one-end', essence: ['E2', 'E7'], title: '一头是房子：只种一头', grade: 5, rung: 3,
    topics: ['植树问题'], alias: ['植树问题', '只种一端'],
    hook: '路的右头是房子，不能种树。点一下右头的那棵树把它拔掉。现在树和间隔，哪个多？',
    build: gp({ len: 20, gap: 5, le: 1, re: 1 }),
    milestones: [ms('one', '只种一头：4 棵', 8, 'trees', 4, ['右头不种。', '点右头的树。', '树和间隔一样多：4。'])],
    goal: ['one'],
    why: '只种一头时，每个间隔正好配一棵树：棵数 = 间隔数 = 4。',
  });
  add({
    id: 'gp-no-ends', essence: ['E2', 'E7'], title: '两头都是房子', grade: 5, rung: 3,
    topics: ['植树问题'], alias: ['植树问题', '两端都不种'],
    hook: '路的两头都是房子，都不能种。把两头的树都拔掉。',
    build: gp({ len: 20, gap: 5, le: 1, re: 1 }),
    predict: { q: '4 个间隔，两头都不种，种几棵？', options: [{ v: '3', label: '3 棵' }, { v: '4', label: '4 棵' }, { v: '5', label: '5 棵' }], answer: '3' },
    milestones: [ms('none', '两头都不种：3 棵', 8, 'trees', 3, ['点左头的树。', '再点右头的树。', '4 − 1 = 3。'])],
    goal: ['none'],
    why: '两头都不种时，树只在间隔和间隔之间：4 个间隔中间有 3 个接头，所以 3 棵。',
  });
  add({
    id: 'gp-saw', essence: ['E2', 'E7'], title: '一根木头锯成 5 段，要锯几次？', grade: 5, rung: 3,
    topics: ['植树问题', '锯木头'], alias: ['锯木头', '间隔', '植树问题'],
    hook: '木头长 10 米，每 2 米锯一下，锯成 5 段。每棵“树”是锯的一刀。两头不用锯：把两头的拔掉。',
    build: gp({ len: 10, gap: 5, le: 1, re: 1, name: '刀', mw: '次', unit: '米' }),
    milestones: [ms('five', '锯成 5 段', 3, 'gaps', 5, ['每段 2 米。', '拖“隔”字到 2。', '10 ÷ 2 = 5 段。']), ms('four', '锯 4 次', 5, 'trees', 4, ['两头不用锯。', '点两头，拔掉。', '5 − 1 = 4。'])],
    goal: ['five', 'four'],
    why: '锯成 5 段只要锯 4 次：段数是间隔数，锯的刀数是“两头都不种”的棵数，少 1。',
  });
  add({
    id: 'gp-lamps', essence: ['E2', 'E7'], title: '装 11 盏路灯，路有多长？', grade: 5, rung: 4,
    topics: ['植树问题'], alias: ['路灯', '植树问题', '反过来求'],
    hook: '每隔 6 米装一盏路灯，两头都装，一共装了 11 盏。拖路的右端，找到这条路有多长。',
    build: gp({ len: 30, gap: 6, le: 1, re: 1, name: '路灯', mw: '盏' }),
    predict: { q: '11 盏灯之间有几个间隔？', options: [{ v: '10', label: '10 个' }, { v: '11', label: '11 个' }, { v: '12', label: '12 个' }], answer: '10' },
    milestones: [ms('eleven', '正好 11 盏', 8, 'trees', 11, ['11 盏灯有 10 个间隔。', '10 × 6。', '把路拖到 60 米。'])],
    goal: ['eleven'],
    why: '两头都装，11 盏灯之间有 10 个间隔，路长 10 × 6 = 60 米。反过来求路长，要先把棵数减 1 变成间隔数。',
  });
  add({
    id: 'gp-ring', essence: ['E2', 'E7'], title: '围着池塘种一圈', grade: 5, rung: 3,
    topics: ['植树问题', '封闭图形'], alias: ['环形', '封闭', '植树问题'],
    hook: '池塘一周 40 米，每隔 5 米种一棵。先看直路上两头都种是几棵，再点“围成一圈”，看棵数怎么变。',
    build: gp({ len: 40, gap: 5, le: 1, re: 1 }),
    predict: { q: '围成一圈以后，树会多、会少，还是不变？', options: [{ v: 'less', label: '少 1 棵' }, { v: 'same', label: '不变' }, { v: 'more', label: '多 1 棵' }], answer: 'less' },
    milestones: [ms('ring', '围成一圈：8 棵', 8, 'ringed', 1, ['直路上两头都种是 9 棵。', '点“围成一圈”。', '头和尾是同一棵：8 棵。'])],
    goal: ['ring'],
    why: '围成一圈，路的头和尾接在一起，两头的树变成同一棵，所以比直路少 1 棵：棵数 = 间隔数 = 40 ÷ 5 = 8。',
  });
  U.problems.push.apply(U.problems, P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
