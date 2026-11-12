/* 树状图的题（docs/new-instruments.md 6.10）：先猜概率，再点出路径相加；放回和不放回不一样。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const pt = (props) => () => { const s = W.blank(); const id = W.add(s, 'ptree', 60, 60, props); s.entities[id].role = 't'; return s; };
  const P = [];
  const add = (o) => P.push(Object.assign({ domain: '统计与概率', level: 'core', shelf: ['ptree'], predict: null, traps: [] }, o));
  const ms = (id, say, score, port, op, value, hints) => ({ id, say, score, when: { role: 't', port, op, value: String(value) }, hints });
  add({
    id: 'pt-coin', essence: ['E11', 'E2', 'E1'], title: '掷两次硬币，一正一反的可能性是多少？', grade: 5, rung: 3, points: ['5.4'], build: pt({ exp: 0, ev: 1 }),
    topics: ['可能性', '树状图', '概率'], alias: ['树状图', '可能性', '硬币', '概率'],
    hook: '掷两次硬币，“一正一反”的可能性是多少？有人说：结果有“两正、两反、一正一反”三种，所以是 1/3。先猜，再点出树上属于“一正一反”的路径。',
    milestones: [ms('ok', '选对了：正反、反正两条路径', 4, 'eventOk', '=', 1, ['“一正一反”有几条路径？', '先正后反，先反后正，是两条。', '点“正反”和“反正”。']), ms('half', '概率是 1/2', 4, 'p', '=', '1/2', ['每条路径的概率是 1/4。', '两条加起来。', '1/4 + 1/4 = 1/2。'])],
    traps: [],
    goal: ['ok', 'half'], why: '两次硬币有 4 条等可能的路径：正正、正反、反正、反反。一正一反占 2 条，概率 2/4 = 1/2。',
  });
  add({
    id: 'pt-noreplace', essence: ['E11', 'E2', 'E1'], title: '摸两次球：放回和不放回，两次同色一样吗？', grade: 9, rung: 4, points: ['9.9'], build: pt({ exp: 1, ev: 0 }),
    topics: ['概率', '树状图', '放回与不放回'], alias: ['树状图', '概率', '放回', '不放回'],
    hook: '袋里 2 个红球 1 个白球，摸两次。放回的时候，“两次同色”的概率是 5/9。把试验换成“不放回”，第二步的概率变了。先猜：不放回时，“两次同色”的概率是多少？再点出路径加一加。',
    milestones: [ms('sw', '换成了不放回', 2, 'paths', '=', 4, ['“试验”选“摸两次（不放回）”。', '第二步的概率会变。', '路径数还是 4，但概率不同。']), ms('p', '不放回，两次同色的概率是 1/3', 8, 'p', '=', '1/3', ['两次同色：红红、白白。', '红红 = 2/3 × 1/2；白白 = 1/3 × 0。', '1/3 + 0 = 1/3。'])],
    goal: ['p'], why: '不放回时，摸走一个红球后，袋里剩 1 红 1 白，第二步红的概率是 1/2；摸走白球后只剩红球。红红 = 1/3，白白 = 0（摸不到第二个白球），两次同色 = 1/3，小于放回时的 5/9。',
  });
  for (const p of P) U.problems.push(p);
})(typeof globalThis !== 'undefined' ? globalThis : window);
