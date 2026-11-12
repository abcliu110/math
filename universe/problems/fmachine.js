/* 函数机的题（docs/new-instruments.md 6.5）：机器里藏着规则，或者四联动里把情境调成对的。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const fm = (props) => () => { const s = W.blank(); const id = W.add(s, 'fmachine', 60, 60, props); s.entities[id].role = 'm'; return s; };
  const P = [];
  const base = { domain: '关系', level: 'core', shelf: ['fmachine'], predict: null };
  const ms = (id, say, score, port, op, value, hints) => ({ id, say, score, when: { role: 'm', port, op, value: String(value) }, hints });
  const add = (o) => P.push(Object.assign({}, base, o));

  add({
    id: 'fm-times3', essence: ['E1', 'E8'], title: '这台机器里是什么规则？', grade: 3, rung: 2, points: ['1.16'],
    topics: ['函数机', '找规律', '输入输出'], alias: ['函数机', '找规律', '规则', '输入输出'],
    hook: '往机器里喂一个数，它吐出另一个数。先猜它会吐出几，再看。连续猜对 3 次，就可以写出它的规则了。',
    build: fm({ secret: 0, view: 0 }),
    milestones: [
      ms('streak', '连续猜对了 3 次', 3, 'streak', '>=', 3, ['在“喂的数”写一个整数，再在“我猜”写你猜的结果。', '喂 1、2、3，看规律。', '每次都先猜。']),
      ms('solved', '写出了规则：× 3', 5, 'solved', '=', 1, ['每个数进去，出来的都是它的几倍？', '1 → 3，2 → 6。', '点“× 3”。']),
    ],
    traps: [], goal: ['solved'],
    why: '规则是“× 3”。先猜后看，猜错了不要紧：每次猜错，就知道自己想的规则哪里不对。',
  });
  add({
    id: 'fm-cheat', essence: ['E1', 'E8'], title: '只喂 0 和 1，会被骗', grade: 9, rung: 4, points: ['9.4'],
    topics: ['函数', '二次函数', '举例不是证明'], alias: ['函数机', '二次函数', '反例', '规则'],
    hook: '这台机器喂 0 吐 1，喂 1 吐 3。你想到的规则可能是“× 2 + 1”。点它试试：机器会告诉你，它和真规则在哪个数上不一样。',
    build: fm({ secret: 2, view: 0 }),
    milestones: [
      ms('refute', '“× 2 + 1”被一个数推翻了', 4, 'counter', '>', -1, ['先喂 0 和 1，各猜一次。', '点“× 2 + 1”：0 和 1 都对得上。', '它会指出：喂 2 就不一样了。']),
      ms('solved', '写出了真规则：x² + x + 1', 5, 'solved', '=', 1, ['喂 2、3，多看几个。', '2 → 7，3 → 13。', '点“x² + x + 1”（要连续猜对 3 次）。']),
    ],
    traps: [{ id: 'two-points', wrong: '只靠两个数就下结论：两点能连成一条直线，也能连成无数条曲线。', when: { role: 'm', port: 'counter', op: '>', value: '-1' } }],
    goal: ['solved'],
    why: '“× 2 + 1”和“x² + x + 1”在 0、1 处完全一样，在 2 处就分开了（5 对 7）。两个例子不够；一个规则要在没试过的数上也成立，才算数。',
  });
  add({
    id: 'fm-proportional', essence: ['E1', 'E8'], title: '买东西：什么时候是正比例？', grade: 6, rung: 3, points: ['6.12'],
    topics: ['正比例', '四联动', '一次函数'], alias: ['正比例', '四联动', '函数', '表格'],
    hook: '每千克 4 元，另收 5 元包装费。看表格：重量翻倍，价钱翻倍吗？把包装费去掉（b 调成 0），再看。',
    build: fm({ view: 1, story: 1, k: 4, b: 5, y0: 5, y1: 9 }),
    milestones: [ms('direct', '价钱和重量成正比例：b = 0', 6, 'direct', '=', 1, ['有包装费时，重量翻倍，价钱不翻倍。', '把 b 调成 0。', 'b 点减到 0。'])],
    traps: [], goal: ['direct'],
    why: '正比例的图像是过原点的直线，x = 0 时 y = 0。有 5 元包装费时，x = 0 对应 5，翻倍就不成立了。',
  });
  add({
    id: 'fm-tank', essence: ['E1', 'E8', 'E12'], title: '水箱注水：每分钟 3 升，原来有 5 升', grade: 8, rung: 3, points: ['8.15'],
    topics: ['一次函数', '四联动', '斜率'], alias: ['一次函数', '四联动', '水箱', '斜率'],
    hook: '水箱里原来有 5 升水，每分钟注入 3 升。把 k 和 b 调成对的，看表格、图像、式子一起变。“每多 1，多几”是图像上的什么？',
    build: fm({ view: 1, story: 0, k: 1, b: 0, y0: 0, y1: 1 }),
    milestones: [
      ms('slope', '斜率是 3（每分钟注 3 升）', 4, 'slope', '=', 3, ['每分钟多几升？', '“每多 1，多几”就是 k。', 'k 调到 3。']),
      ms('b', 'x = 0 时是 5（原来有 5 升）', 4, 'intercept', '=', 5, ['还没注水的时候，水箱里有多少？', 'x = 0 对应哪个数？', 'b 调到 5。']),
    ],
    traps: [], goal: ['slope', 'b'],
    why: 'y = 3x + 5：k = 3 是每分钟注入的水量，图像里是直线的倾斜程度；b = 5 是 x = 0 时的水量，图像里是直线和纵轴交的点。',
  });
  for (const p of P) U.problems.push(p);
})(typeof globalThis !== 'undefined' ? globalThis : window);
