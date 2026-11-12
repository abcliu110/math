/* 海龟作图的题（docs/new-instruments.md 5.3）：画正方形、画正三角形（陷阱：转 60°）、画任意正 n 边形、五角星为什么转了 720°。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const tu = (props) => () => { const s = W.blank(); const id = W.add(s, 'turtle', 40, 40, props || {}); s.entities[id].role = 't'; return s; };
  const P = [];
  const add = (o) => P.push(Object.assign({ domain: '图形', level: 'core', shelf: ['turtle'], predict: null, traps: [] }, o));
  const ms = (id, say, score, port, op, value, hints) => ({ id, say, score, when: { role: 't', port, op, value: String(value) }, hints });
  add({
    id: 'tu-square', essence: ['E6', 'E8', 'E5'], title: '让海龟画一个正方形', grade: 3, rung: 2, points: ['3.12'], build: tu({ tgt: 1 }),
    topics: ['角', '正方形', '重复', '海龟'], alias: ['海龟作图', '正方形', '重复', '直角'],
    hook: '点积木，给海龟写一段程序，让它画出灰色的正方形。边长 100，每个角转多少度？不想写四遍，可以用“重复”。',
    milestones: [ms('closed', '海龟回到了起点', 2, 'closed', '=', 1, ['前进 100，然后转一个角，再前进……', '正方形的角是直角。', '前进 100、左转 90°，做 4 次。']), ms('match', '画出了正方形', 5, 'match', '=', 1, ['边长都是 100。', '转的角度是 90°。', '重复 4 次 [前进 100、左转 90°]。'])],
    goal: ['closed', 'match'], why: '正方形有 4 条一样长的边，每个拐角转 90°，4 个角一共转了 360°，海龟回到起点，还朝着出发的方向。',
  });
  add({
    id: 'tu-triangle', essence: ['E6', 'E8', 'E5'], title: '让海龟画一个正三角形', grade: 4, rung: 3, points: ['4.9'], build: tu({ tgt: 2, a: 60, k: 3 }),
    topics: ['角', '正三角形', '外角', '海龟'], alias: ['海龟作图', '正三角形', '外角', '重复'],
    hook: '让海龟画灰色的正三角形，边长 100。正三角形的每个角是 60°，那海龟每个拐角就转 60° 吗？先试一试，看看它回得到起点吗。',
    milestones: [ms('closed', '海龟回到了起点', 3, 'closed', '=', 1, ['转 60° 的话，海龟回得到起点吗？', '拐弯转的角，不是图形里面的角。', '三个拐角一共要转一圈，360° 平分成 3 份。']), ms('match', '画出了正三角形', 5, 'match', '=', 1, ['每个拐角转 120°。', '重复 3 次 [前进 100、左转 120°]。', '内角 60°，海龟要转的是 180° − 60° = 120°。'])],
    goal: ['closed', 'match'], traps: [{ id: 'turn60', wrong: '转 60° 是图形里面的角。海龟拐弯，转的是“外角”：180° − 60° = 120°。', when: { role: 't', port: 'turned', op: '=', value: '180' } }],
    why: '海龟在每个拐角转的是外角：180° − 内角 = 120°。三个拐角转了 3 × 120° = 360°，正好一圈，所以回到起点。转 60° 只转了半圈（180°），没有闭合。',
  });
  add({
    id: 'tu-ngon', essence: ['E6', 'E8', 'E5'], title: '正九边形：每次转多少度？', grade: 7, rung: 4, points: ['7.12'], build: tu({ k: 9, a: 30 }),
    topics: ['多边形', '外角和', '重复', '海龟'], alias: ['海龟作图', '外角和', '正多边形', '360度'],
    hook: '用“重复 9 次 [前进 100、左转 a°]”让海龟画正九边形。a 是多少，海龟才恰好回到起点？提示：海龟走完一圈，一共转了多少度？',
    milestones: [ms('rep', '用了“重复 9 次”', 2, 'rep', '=', 9, ['先把“重复 9 次 [ … ]”做出来。', '点“重复 k [”，把 k 调成 9。', '里面放前进和转弯，最后点“]”。']), ms('closed', '海龟回到了起点', 4, 'closed', '=', 1, ['走完一圈，海龟一共转了多少度？', '9 个拐角平分 360°。', '360 ÷ 9 = 40°。'])],
    goal: ['rep', 'closed'], why: '任何正 n 边形，海龟每个拐角转 360° ÷ n，n 个拐角转一整圈 360°（外角和）。n = 9 时每次转 40°。n = 7 时 360/7 不是整数，整数度的积木只能近似、回不到起点。',
  });
  add({
    id: 'tu-star', essence: ['E6', 'E8', 'E5'], title: '五角星：海龟为什么转了 720°？', grade: 7, rung: 4, points: ['7.12'], build: tu({ tgt: 3, a: 144, k: 5 }),
    topics: ['五角星', '外角和', '重复', '海龟'], alias: ['海龟作图', '五角星', '720度', '外角和'],
    hook: '画灰色的五角星：重复 5 次 [前进 100、转 144°]。海龟回到了起点，可它一共转了多少度？为什么不是 360°？',
    milestones: [ms('match', '画出了五角星', 6, 'match', '=', 1, ['每次转 144°，重复 5 次。', '5 × 144 = 720°。', '海龟绕着中心转了两圈才回到出发的方向。'])],
    goal: ['match'], why: '五角星每个拐角转 144°，5 个拐角共 720°，是两圈：海龟绕五角星中心走了两圈才回到起点和方向。正五边形转 72°，一圈。',
  });
  for (const p of P) U.problems.push(p);
})(typeof globalThis !== 'undefined' ? globalThis : window);
