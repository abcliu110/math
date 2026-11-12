/* 两种解法对照的题（docs/new-instruments.md 5.6）：把两种解法每一步连起来，换个数看是不是跟着变。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const tw = (sc) => () => { const s = W.blank(); const id = W.add(s, 'twoways', 40, 40, { sc }); s.entities[id].role = 'w'; return s; };
  const P = [];
  const add = (o) => P.push(Object.assign({ domain: '关系', level: 'core', shelf: ['twoways'], predict: null }, o));
  const ms = (id, say, score, port, op, value, hints) => ({ id, say, score, when: { role: 'w', port, op, value: String(value) }, hints });
  const trap = [{ id: 'wrongpair', wrong: '连错的一对，换一个 n，两边的数就对不上了（红线）。换个数试试。', when: { role: 'w', port: 'wrong', op: '>=', value: '1' } }];
  add({
    id: 'tw-hunt', essence: ['E12', 'E3', 'E4'], title: '鸡兔同笼：假设法和列表法，一步一步对起来', grade: 3, rung: 3, points: ['3.14'], build: tw(0),
    topics: ['鸡兔同笼', '假设法', '列表法'], alias: ['鸡兔同笼', '假设法', '列表法', '两种解法'],
    hook: '同一道鸡兔同笼题，左边用假设法，右边用列表法。每一步在对方那里都有对应的一项：把它们连起来。拿不准就换个 n 试试：连对的，两边的数永远一样。',
    milestones: [ms('two', '连对了 2 对', 2, 'right', '>=', 2, ['先点左边一项，再点右边讲同一件事的一项。', '看数：它们随 n 一起变吗？', '“要换的只数”和“表里目标那一行”是同一个数。']), ms('all', '4 对全连对', 3, 'all', '=', 1, ['“多的脚数”和“比第一行多的脚数”，是同一个量。', '不随 n 变的两项：20 对 20，2 对 2。', '换 n，红线说明那一对连错了。']), ms('disc', '选对了“哪里一样”', 2, 'discOk', '=', 1, ['两种方法每一步的数一样吗？', '换了说法和顺序，数没变。', '选第一个。'])],
    goal: ['two', 'all', 'disc'], traps: trap, why: '假设法是在“算”，列表法是在“找”，但每一步对应的数相同：20 是“全是鸡”的脚数，也是表的第一行；每换一只多 2 只脚，也是表里每行多的脚数。两种方法是同一件事的两种写法。',
  });
  add({
    id: 'tw-sum', essence: ['E12', 'E3', 'E4'], title: '和倍问题：线段图和方程，一步一步对起来', grade: 5, rung: 4, points: ['5.14'], build: tw(1),
    topics: ['和倍问题', '线段图', '方程'], alias: ['和倍问题', '线段图', '方程', '两种解法'],
    hook: '乙是 n，甲是乙的 3 倍。左边用线段图（份数）解，右边用方程解。把两边每一项对起来，改 n 看看两边是不是总一样。',
    milestones: [ms('two', '连对了 2 对', 2, 'right', '>=', 2, ['“几份”对应方程里的什么？', '一份 = 一个 x。', '甲有几份，就是 x 前面的数。']), ms('all', '4 对全连对', 3, 'all', '=', 1, ['“一共几份”对应 x + 3x 里 x 的系数。', '“一份是多少”对应解出的 x。', '“甲是多少”对应 3x 的值。']), ms('disc', '选对了“哪里一样”', 2, 'discOk', '=', 1, ['线段图里的一份就是方程里的 x。', '两种方法的数一一对应。', '选第一个。'])],
    goal: ['two', 'all', 'disc'], traps: trap, why: '线段图里把乙看成 1 份，方程里把乙设成 x：1 份就是 x；甲 3 份就是 3x；一共 4 份就是 4x。除以 4 求一份，就是方程两边同除以 4 求 x。',
  });
  for (const p of P) U.problems.push(p);
})(typeof globalThis !== 'undefined' ? globalThis : window);
