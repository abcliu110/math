/* “工程问题”的题。选谁来做、点“过一天”，涂满长条。判分只看器材的输出。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const jb = (props) => () => { const s = W.blank(); const id = W.add(s, 'jobbench', 40, 50, props); s.entities[id].role = 'jb'; return s; };
  const P = [];
  const base = { domain: '关系', level: 'core', shelf: ['jobbench'], traps: [], predict: null };
  const add = (o) => P.push(Object.assign({}, base, o));
  const ms = (id, say, score, port, value, hints) => ({ id, say, score, when: { role: 'jb', port, op: '=', value: String(value) }, hints });

  add({
    id: 'jb-6-3', essence: ['E4', 'E3'], title: '甲 6 天、乙 3 天，合作几天完成？', grade: 6, rung: 3, points: ['6.2'],
    topics: ['工程问题', '合作'], alias: ['工程问题', '合作', '工作效率'],
    hook: '一件工作，甲单独 6 天做完，乙单独 3 天做完。两人一起做，点“过一天”，看几天涂满。是 (6 + 3) ÷ 2 = 4.5 天吗？',
    build: jb({ mode: 0, a: 6, b: 3 }),
    predict: { q: '两人合作要几天？', options: [{ v: '4.5', label: '4.5 天' }, { v: '2', label: '2 天' }, { v: '9', label: '9 天' }], answer: '2' },
    milestones: [ms('days', '合作 2 天完成', 6, 'days', 2, ['切成 6 格：甲每天 1 格，乙每天 2 格。', '一天一共 3 格。', '6 ÷ 3 = 2 天。'])],
    goal: ['days'],
    why: '把整件工作看成 1（这里切成 6 格）：甲一天做 1/6，乙一天做 1/3，一起一天做 1/6 + 1/3 = 1/2，2 天做完。合作比谁单独做都快，不会是两个天数的平均。',
  });
  add({
    id: 'jb-10-15', essence: ['E4', 'E3'], title: '10 天和 15 天：合作几天？', grade: 6, rung: 3, points: ['6.2'],
    topics: ['工程问题', '合作'], alias: ['工程问题', '合作'],
    hook: '甲单独 10 天，乙单独 15 天。长条切成 30 格：甲一天几格？乙一天几格？一起做几天涂满？',
    build: jb({ mode: 0, a: 10, b: 15 }),
    milestones: [ms('days', '合作 6 天完成', 6, 'days', 6, ['甲每天 3 格，乙每天 2 格。', '一天 5 格。', '30 ÷ 5 = 6 天。'])],
    goal: ['days'],
    why: '1 ÷ (1/10 + 1/15) = 1 ÷ 1/6 = 6 天。切成 30 格（10 和 15 的最小公倍数）来数，就不用算分数。',
  });
  add({
    id: 'jb-tank', essence: ['E4', 'E3'], title: '一边注水一边放水，几小时注满？', grade: 6, rung: 4, points: ['6.2'],
    topics: ['注水问题', '工程问题'], alias: ['注水', '放水', '水管'],
    hook: '进水管 4 小时注满一池水，出水管 6 小时放完。两个管子一起开，每小时净多几格？几小时注满？',
    build: jb({ mode: 1, a: 4, b: 6 }),
    milestones: [ms('hours', '12 小时注满', 6, 'days', 12, ['切成 12 格：进水每小时 3 格，出水每小时 2 格。', '每小时净多 1 格。', '12 格要 12 小时。'])],
    goal: ['hours'],
    why: '每小时注进 1/4、放掉 1/6，净多 1/4 − 1/6 = 1/12：12 小时注满。出水管比进水管慢，才注得满。',
  });
  U.problems.push.apply(U.problems, P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
