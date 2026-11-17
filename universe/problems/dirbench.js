/* “方向与路线”的题。点方向、点 ↑↓←→ 走路线、拖射线定方向角。判分只看器材的输出。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const db = (props) => () => { const s = W.blank(); const id = W.add(s, 'dirbench', 40, 50, props); s.entities[id].role = 'dr'; return s; };
  const P = [];
  const base = { domain: '图形', level: 'core', shelf: ['dirbench'], traps: [], predict: null };
  const add = (o) => P.push(Object.assign({}, base, o));
  const ms = (id, say, score, port, value, hints) => ({ id, say, score, when: { role: 'dr', port, op: '=', value: String(value) }, hints });
  add({
    id: 'dr-reverse', essence: ['E5', 'E6'], title: '医院在学校的东北，学校在医院的什么方向？', grade: 3, rung: 3, points: ['3.9'],
    topics: ['东南西北', '方向是相对的'], alias: ['方向', '东北', '西南'],
    hook: '地图上方是北。医院在学校的东北。站到医院往学校看，学校在哪个方向？',
    build: db({ mode: 0, target: 1, rev: true }),
    milestones: [ms('right', '学校在医院的西南', 6, 'right', 1, ['从医院往学校看。', '东北反过来是西南。', '点“西南”。'])],
    goal: ['right'],
    traps: [{ id: 'same', wrong: '方向是相对的：医院在学校的东北，学校就在医院的西南，不是东北。', when: { role: 'dr', port: 'right', op: '=', value: '0' } }],
    why: '方向要说“谁在谁的哪边”。站的地方换了，方向就反过来：东北的反面是西南。',
  });
  add({
    id: 'dr-route', essence: ['E5', 'E6'], title: '从家走到学校：怎么走最近？', grade: 3, rung: 2, points: ['3.9'],
    topics: ['路线图', '东南西北'], alias: ['路线', '向东走', '向北走'],
    hook: '点 ↑ ↓ ← → 一格一格走（↑ 是北）。走到学校，下面会把路线写出来。最近要走几格？',
    build: db({ mode: 1, sx: 1, sy: 5, tx: 7, ty: 1 }),
    milestones: [ms('short', '走最短的路到学校：10 格', 6, 'shortest', 1, ['学校在家的东北。', '向东走 6 格，再向北走 4 格。', '只往东、往北走，就是最短的。'])],
    goal: ['short'],
    why: '学校在家的东边 6 格、北边 4 格。只往东和往北走，一共 6 + 4 = 10 格；往回走一步就多两步。路线可以先东后北，也可以先北后东。',
  });
  add({
    id: 'dr-bearing', essence: ['E5', 'E6'], title: '北偏东 30°，300 米', grade: 6, rung: 3, points: ['6.3'],
    topics: ['方向角', '位置与方向'], alias: ['北偏东', '方向角', '距离'],
    hook: '目标在观测点的北偏东 30°、300 米。从正北往东转 30°，再拖到 300 米。',
    build: db({ mode: 2, deg: 0, dist: 1, tdeg: 30, tdist: 3 }),
    milestones: [ms('hit', '对上了：北偏东 30°，300 米', 6, 'hit', 1, ['先从正北往东转。', '转两格（15° 一格）。', '再拖到第 3 圈。'])],
    goal: ['hit'],
    why: '方向角从正北（或正南）量起：北偏东 30° 是从北往东转 30°。说位置要两样：方向和距离。',
  });
  U.problems.push.apply(U.problems, P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
