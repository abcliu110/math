/* 展开图和小方块的题（docs/new-instruments.md 6.8）。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const mk = (type, props) => () => { const s = W.blank(); const id = W.add(s, type, 40, 40, props || {}); s.entities[id].role = 'n'; return s; };
  const P = [];
  const add = (o) => P.push(Object.assign({ domain: '图形', level: 'core', predict: null, traps: [] }, o));
  const ms = (id, say, score, port, op, value, hints) => ({ id, say, score, when: { role: 'n', port, op, value: String(value) }, hints });
  add({
    id: 'sn-net-build', essence: ['E5', 'E1'], title: '拼一个能折成正方体的展开图', grade: 5, rung: 3, points: ['5.8'], shelf: ['net'], build: mk('net', { cells: '' }),
    topics: ['展开图', '正方体'], alias: ['展开图', '正方体', '六连方', '折叠'],
    hook: '点格子，拼出 6 个连在一起的方格，让它能折成一个正方体。能折的话，每个格子会标出它是正方体的哪个面。注意：“田”字再加两格，折得起来吗？',
    milestones: [ms('valid', '拼好了 6 个连着的格子', 2, 'valid', '=', 1, ['点格子，一共 6 个，要连着。', '先拼一横排的 4 个。', '上面一个、下面一个，凑成 6 个。']), ms('fold', '拼出了能折成正方体的展开图', 4, 'foldable', '=', 1, ['红色是折起来叠在一起的面。', '横着 4 个排一行，上下各一个。', '1-4-1：一行 4 个，上面 1 个，下面 1 个。'])],
    goal: ['valid', 'fold'], why: '正方体的展开图要让 6 个格子折起来正好各占一个面。一行 4 个、上下各 1 个（1-4-1）总是能折；有 2×2 的“田”字则一定不行：4 个面围一个顶点，正方体的顶点只有 3 个面。',
  });
  add({
    id: 'sn-net-all', essence: ['E5', 'E1'], title: '35 种六连方，哪 11 种能折成正方体？', grade: 5, rung: 4, points: ['5.8'], shelf: ['net'], build: mk('net', {}),
    topics: ['展开图', '穷举', '正方体'], alias: ['展开图', '35种', '11种', '穷举', '正方体'],
    hook: '6 个方格连成的图一共有 35 种（旋转、翻转算同一种）。一个一个看，每个判断“能”还是“不能”，看完 35 个，你就找全了能折成正方体的 11 种。先猜，再看系统怎么说。',
    milestones: [ms('half', '判了 12 种以上', 2, 'judged', '>=', 12, ['点 ▶ 看下一种。', '每种点“能”或“不能”。', '不确定就看右边系统说的。']), ms('all', '35 种全判对', 6, 'all', '=', 1, ['有没有“田”字？有就不能折。', '一行 4 个、上下各 1 个：能折。', '先猜后看：猜对的才算，不能蒙。'])],
    goal: ['half', 'all'], why: '35 种六连方里，恰好 11 种能折成正方体（1-4-1 型 6 种、2-3-1 型 3 种、2-2-2 型 1 种、3-3 型 1 种）。把所有可能一个不漏地看完，就是穷举。',
  });
  const cu = (tgt) => mk('cubes', { tgt });
  add({
    id: 'sn-cubes-min', essence: ['E5', 'E1'], title: '按三视图搭：最少几块？', grade: 4, rung: 3, points: ['4.5'], shelf: ['cubes'], build: cu(0),
    topics: ['观察物体', '三视图', '小方块'], alias: ['三视图', '小方块', '最少几块', '观察物体'],
    hook: '照“目标”的前视图、左视图、俯视图搭小方块。会有不止一种搭法，块数不一样。先猜：最少要几块？再搭一个最少的。',
    milestones: [ms('match', '三个视图都对上了', 3, 'match', '=', 1, ['先看俯视图：哪几个格子有方块。', '再看前视图：每一列最高几层。', '左视图：每一行最高几层。']), ms('min', '用最少的块数搭出来', 4, 'isMin', '=', 1, ['有些格子不用搭到最高。', '每一列、每一行的最高层只要有一个格子到就行。', '多余的格子只放一块。'])],
    goal: ['match', 'min'], why: '三个视图只规定了每一列、每一行的最高层，和哪些格子有方块。每个有方块的格子至少 1 块；为了让每列每行的最高层够，把最高层放在能同时满足一列一行的格子上，块数就最少。',
  });
  add({
    id: 'sn-cubes-max', essence: ['E5', 'E1'], title: '按三视图搭：最多几块？', grade: 4, rung: 4, points: ['4.5'], shelf: ['cubes'], build: cu(1),
    topics: ['观察物体', '三视图', '小方块'], alias: ['三视图', '小方块', '最多几块', '观察物体'],
    hook: '还是照三个视图搭。这次搭一个块数最多的：每个有方块的格子，最高能搭几层，又不会改变视图？',
    milestones: [ms('match', '三个视图都对上了', 3, 'match', '=', 1, ['先对上三个视图。', '看前视图和左视图。', '格子的层数不能超过它那一列和那一行的最高层。']), ms('max', '用最多的块数搭出来', 4, 'isMax', '=', 1, ['每个有方块的格子都放到最高。', '最高 = 这一列最高和这一行最高里较小的。', '不会改变前视图和左视图。'])],
    goal: ['match', 'max'], why: '一个格子最高能放 min(这一列的最高层，这一行的最高层) 层，再高就会改变视图。每个格子都放到这个高度，就是最多的块数。',
  });
  for (const p of P) U.problems.push(p);
})(typeof globalThis !== 'undefined' ? globalThis : window);
