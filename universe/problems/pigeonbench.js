/* “摸球保证”的题（抽屉原理、最不利原则）。自己当最倒霉的人：摸到卡住，再摸一个就一定成功。判分只看器材的输出（卡住才有 guar）。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const pg = (props) => () => { const s = W.blank(); const id = W.add(s, 'pigeonbench', 40, 50, props); s.entities[id].role = 'pg'; return s; };
  const P = [];
  const base = { domain: '统计与概率', level: 'core', shelf: ['pigeonbench'], traps: [], predict: null, points: ['6.13'], topics: ['抽屉原理', '最不利原则', '奥数'] };
  const add = (o) => P.push(Object.assign({}, base, o));
  const ms = (id, say, score, value, hints) => ({ id, say, score, when: { role: 'pg', port: 'guar', op: '=', value: String(value) }, hints });
  add({
    id: 'pg-socks', essence: ['E2', 'E7'], title: '抽屉里有红袜子、黄袜子、蓝袜子各 5 只。黑着灯摸，至少摸几只才能保证有一双同色的？', grade: 5, rung: 3, alias: ['摸袜子', '抽屉原理'],
    hook: '“保证”是说运气再坏也能做到。你来当最倒霉的人：一只一只摸，尽量不让两只同色。',
    build: pg({ c1: 5, c2: 5, c3: 5, c4: 0, want: 0, m: 2 }),
    predict: { q: '先猜：要摸几只？', options: [{ v: 0, label: '2 只' }, { v: 1, label: '4 只' }, { v: 2, label: '6 只' }], answer: 1 },
    milestones: [ms('g', '至少摸 4 只', 8, 4, ['最倒霉：每种颜色先各摸到 1 只。', '红、黄、蓝各 1 只，3 只还没成双。', '再摸一只，不管什么颜色都成双：3 + 1 = 4。'])],
    goal: ['g'],
    why: '最倒霉的时候，3 种颜色各摸到 1 只，摸了 3 只还没有同色的。这时候再摸一只，它一定和其中一只同色：3 种颜色是 3 个抽屉，4 只袜子放进 3 个抽屉，总有一个抽屉放了 2 只。',
  });
  add({
    id: 'pg-three-same', essence: ['E2', 'E7'], title: '袋里红、黄、蓝、绿球各 6 个。至少摸几个，才能保证有 3 个同色的？', grade: 6, rung: 4, alias: ['摸球', '最不利原则'],
    hook: '要 3 个同色。最倒霉的人会怎么摸，才能拖得最久？',
    build: pg({ c1: 6, c2: 6, c3: 6, c4: 6, want: 0, m: 3 }),
    milestones: [ms('g', '至少摸 9 个', 8, 9, ['要 3 个同色，最倒霉时每种颜色只摸到 2 个。', '4 种颜色各 2 个：8 个。', '再摸一个就有 3 个同色：9 个。'])],
    goal: ['g'],
    why: '最倒霉的时候每种颜色都摸到 2 个，还差一个，4 × 2 = 8 个都不成功。第 9 个不管是什么颜色，都会让那种颜色变成 3 个。',
  });
  add({
    id: 'pg-short-color', essence: ['E2', 'E7'], title: '袋里有红球 6 个、黄球 1 个、蓝球 2 个。至少摸几个，才能保证有 3 个同色的？', grade: 6, rung: 5, alias: ['最不利原则', '陷阱'],
    hook: '黄球只有 1 个，最倒霉的人能摸到 2 个黄的吗？',
    build: pg({ c1: 6, c2: 1, c3: 2, c4: 0, want: 0, m: 3 }),
    predict: { q: '先猜：3 种颜色 × 2 + 1 = 7 个，对吗？', options: [{ v: 0, label: '对，7 个' }, { v: 1, label: '不用那么多' }, { v: 2, label: '要更多' }], answer: 1 },
    milestones: [ms('g', '至少摸 6 个', 8, 6, ['黄球全摸完也只有 1 个，蓝球全摸完只有 2 个。', '最倒霉：红 2 个、黄 1 个、蓝 2 个，5 个还不成功。', '剩下的全是红的：再摸一个就是 3 个红的，5 + 1 = 6。'])],
    goal: ['g'],
    why: '黄球、蓝球加起来只有 3 个，它们全被摸出来也凑不成 3 个同色。最倒霉是红 2、黄 1、蓝 2 一共 5 个；袋里剩下的都是红的，第 6 个一定让红的变成 3 个。“每种 2 个”只有在每种都够 2 个时才对。',
  });
  add({
    id: 'pg-every-color', essence: ['E2', 'E7'], title: '袋里有红球 6 个、黄球 4 个、蓝球 3 个。至少摸几个，才能保证三种颜色都有？', grade: 6, rung: 5, alias: ['最不利原则', '每种都有'],
    hook: '最倒霉的人会先把哪几种颜色全摸完？试几种摸法，比一比哪种卡住时摸得最多。',
    build: pg({ c1: 6, c2: 4, c3: 3, c4: 0, want: 1, m: 1 }),
    milestones: [ms('g', '至少摸 11 个', 8, 11, ['最倒霉：一直摸不到某一种颜色。', '缺哪种最倒霉？把多的两种全摸完。', '红 6 个、黄 4 个全摸完还没有蓝的：10 个，再摸一个：11。'])],
    goal: ['g'],
    why: '最倒霉的是把最多的两种颜色全摸完，还没见到第三种：6 + 4 = 10 个。袋里剩下的只有蓝的了，第 11 个一定是蓝的。要是先把红和蓝摸完（9 个），并不是最倒霉的。',
  });
  add({
    id: 'pg-three-red', essence: ['E2', 'E7'], title: '袋里有红球 5 个、黄球 4 个、蓝球 3 个。至少摸几个，才能保证摸到 3 个红球？', grade: 6, rung: 5, alias: ['最不利原则', '指定颜色'],
    hook: '最倒霉的人先摸到的都是什么颜色？红的又摸到几个就停？',
    build: pg({ c1: 5, c2: 4, c3: 3, c4: 0, want: 2, m: 3 }),
    milestones: [ms('g', '至少摸 10 个', 8, 10, ['最倒霉：别的颜色全被摸出来。', '黄 4 个、蓝 3 个，红的只摸到 2 个。', '4 + 3 + 2 = 9 个还不成功，再摸一个：10。'])],
    goal: ['g'],
    why: '最倒霉的时候黄的、蓝的全摸出来了（7 个），红的也摸到了 2 个，一共 9 个还没有 3 个红的。袋里剩下的都是红的，第 10 个一定是红的。',
  });
  U.problems.push.apply(U.problems, P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
