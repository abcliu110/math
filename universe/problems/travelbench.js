/* “行程（相遇与追及）”的题。学生自己拖时间条、拖速度箭头、拖出发点，看两个人什么时候碰上。
 * 全部可以在图上直接完成。判分只看器材的输出（时间、相距多少、各走了多少、速度）。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const tv = (props) => () => { const s = W.blank(); const id = W.add(s, 'travelbench', 40, 50, props); s.entities[id].role = 'r'; return s; };
  const P = [];
  const base = { domain: '时间与变化', level: 'core', shelf: ['travelbench'], traps: [], predict: null, points: ['4.4'] };
  const add = (o) => P.push(Object.assign({}, base, o));
  const ms = (id, say, score, port, value, hints) => ({ id, say, score, when: { role: 'r', port, op: '=', value: String(value) }, hints });

  add({
    id: 'tv-solo', essence: ['E4', 'E7'], title: '每小时 4 千米，走 5 小时', grade: 3, rung: 2,
    topics: ['速度时间路程'], alias: ['速度', '时间', '路程', '行程'],
    hook: '小明每小时走 4 千米。箭头的长短就是“一小时走这么远”。拖时间条到 5 小时，看他走了多远。',
    build: tv({ len: 30, tmax: 6, pa: 0, va: 4, solo: true, lock: true, na: '小明' }),
    predict: { q: '5 小时走多远？', options: [{ v: '9', label: '9 千米' }, { v: '20', label: '20 千米' }, { v: '45', label: '45 千米' }], answer: '20' },
    milestones: [ms('go', '走了 20 千米', 8, 'sa', 20, ['每小时 4 千米。', '拖时间条到 5。', '4 × 5 = 20。'])],
    goal: ['go'],
    why: '每过 1 小时多走 4 千米，5 小时就是 5 个 4：4 × 5 = 20 千米。速度 × 时间 = 路程。右下角的图上是一条直线：时间多一格，位置高同样多。',
  });
  add({
    id: 'tv-meet', essence: ['E4', 'E7'], title: '相遇：相距 90 千米，面对面走', grade: 4, rung: 3,
    topics: ['相遇问题', '速度时间路程'], alias: ['相遇', '相向而行', '行程'],
    hook: '甲从左头出发，每小时 10 千米；乙从右头出发，每小时 5 千米，面对面走。两地相距 90 千米。拖时间条，看几小时碰上。注意上面写的“每过 1 小时近多少”。',
    build: tv({ len: 90, tmax: 8, pa: 0, va: 10, da: 0, pb: 90, vb: 5, db: 1, lock: true }),
    predict: { q: '每过 1 小时，两人之间近多少？', options: [{ v: '15', label: '15 千米' }, { v: '10', label: '10 千米' }, { v: '5', label: '5 千米' }], answer: '15' },
    milestones: [ms('meet', '碰上了：相距 0', 8, 'gap', 0, ['每小时近 10 + 5 = 15。', '90 ÷ 15。', '拖时间条到 6。'])],
    goal: ['meet'],
    why: '面对面走，每过 1 小时两人一共走 10 + 5 = 15 千米，距离就少 15。90 ÷ 15 = 6 小时碰上。相遇时间 = 路程 ÷ 速度和。右下角两条直线的交点就是相遇。',
  });
  add({
    id: 'tv-chase', essence: ['E4', 'E7'], title: '追及：乙先走了 24 千米', grade: 5, rung: 4,
    topics: ['追及问题', '速度时间路程'], alias: ['追及', '同向而行', '行程'],
    hook: '两人都往右走。乙在前面 24 千米的地方，每小时 5 千米；甲从 0 出发，每小时 9 千米。拖时间条，看甲几小时追上乙。',
    build: tv({ len: 80, tmax: 8, pa: 0, va: 9, da: 0, pb: 24, vb: 5, db: 0, lock: true }),
    predict: { q: '每过 1 小时，甲离乙近多少？', options: [{ v: '4', label: '4 千米' }, { v: '9', label: '9 千米' }, { v: '14', label: '14 千米' }], answer: '4' },
    milestones: [ms('catch', '追上了：相距 0', 8, 'gap', 0, ['每小时近 9 − 5 = 4。', '24 ÷ 4。', '拖时间条到 6。'])],
    goal: ['catch'],
    why: '同一个方向走，快的每小时只比慢的多走 9 − 5 = 4 千米，所以每小时只近 4。24 ÷ 4 = 6 小时追上。追及时间 = 路程差 ÷ 速度差。',
  });
  add({
    id: 'tv-apart', essence: ['E4', 'E7'], title: '背对背走，4 小时后相距多远？', grade: 4, rung: 3,
    topics: ['相遇问题', '速度时间路程'], alias: ['背向而行', '相背', '行程'],
    hook: '两人从同一个地方出发，甲往左每小时 6 千米，乙往右每小时 4 千米。拖时间条到 4 小时。',
    build: tv({ len: 100, tmax: 5, pa: 50, va: 6, da: 1, pb: 50, vb: 4, db: 0, lock: true }),
    predict: { q: '4 小时后两人相距多远？', options: [{ v: '8', label: '8 千米' }, { v: '40', label: '40 千米' }, { v: '24', label: '24 千米' }], answer: '40' },
    milestones: [ms('far', '相距 40 千米', 8, 'gap', 40, ['每小时远 6 + 4 = 10。', '拖时间条到 4。', '10 × 4 = 40。'])],
    goal: ['far'],
    why: '背对背走，每过 1 小时两人之间远 6 + 4 = 10 千米。4 小时远了 10 × 4 = 40 千米。和面对面走是同一个数“速度和”，只是一个越来越近、一个越来越远。',
  });
  add({
    id: 'tv-find-speed', essence: ['E4', 'E7'], title: '要 5 小时相遇，乙得走多快？', grade: 5, rung: 4,
    topics: ['相遇问题', '反过来求'], alias: ['相遇', '求速度', '行程'],
    hook: '两地相距 60 千米，甲每小时 4 千米，两人面对面走，要正好 5 小时相遇。拖乙的箭头尖改他的速度，再拖时间条到 5 检查。',
    build: tv({ len: 60, tmax: 8, pa: 0, va: 4, da: 0, pb: 60, vb: 2, db: 1 }),
    predict: { q: '5 小时相遇，两人每小时一共要走多少？', options: [{ v: '12', label: '12 千米' }, { v: '15', label: '15 千米' }, { v: '8', label: '8 千米' }], answer: '12' },
    milestones: [ms('vb', '乙每小时 8 千米', 4, 'vb', 8, ['60 ÷ 5 = 12，是两人的速度和。', '12 − 4。', '把乙的箭头拖到 8。']), ms('t5', '时间拖到 5', 1, 't', 5, ['检查一下。', '拖时间条。', '到 5。']), ms('meet', '5 小时正好碰上', 3, 'gap', 0, ['速度和 12。', '12 × 5 = 60。', '相距 0。'])],
    goal: ['vb', 't5', 'meet'],
    why: '5 小时一共要走完 60 千米，每小时两人合起来走 60 ÷ 5 = 12 千米。甲走 4，乙就要走 12 − 4 = 8。',
  });
  add({
    id: 'tv-graph', essence: ['E4', 'E2'], title: '看图：两条线在哪里交？', grade: 7, rung: 4, points: ['4.4'],
    topics: ['相遇问题', '函数图象'], alias: ['相遇', '图象', '交点', '行程'],
    hook: '甲从 0 出发每小时 7 千米往右，乙从 120 出发每小时 5 千米往左。先只看右下角的图：两条线大概在第几小时交？再拖时间条检查。',
    build: tv({ len: 120, tmax: 12, pa: 0, va: 7, da: 0, pb: 120, vb: 5, db: 1, lock: true }),
    predict: { q: '几小时相遇？', options: [{ v: '10', label: '10 小时' }, { v: '12', label: '12 小时' }, { v: '24', label: '24 小时' }], answer: '10' },
    milestones: [ms('meet', '相遇：相距 0', 8, 'gap', 0, ['每小时近 7 + 5 = 12。', '120 ÷ 12。', '拖时间条到 10。'])],
    goal: ['meet'],
    why: '甲的位置是 7t，乙的位置是 120 − 5t。相遇就是位置一样：7t = 120 − 5t，t = 10。图上两条直线的交点、方程的解、相遇的时间，是同一件事。',
  });
  U.problems.push.apply(U.problems, P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
