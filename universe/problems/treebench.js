/* “枚举树”的题。先定第一位（先定大的），一枝一枝展开，不重不漏。判分只看器材的输出（全部展开才有 count）。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const tr = (props) => () => { const s = W.blank(); const id = W.add(s, 'treebench', 40, 50, props); s.entities[id].role = 'tr'; return s; };
  const P = [];
  const base = { domain: '统计与概率', level: 'core', shelf: ['treebench'], traps: [], predict: null, points: ['3.15b'], topics: ['枚举', '树形图', '奥数'] };
  const add = (o) => P.push(Object.assign({}, base, o));
  const ms = (id, say, score, value, hints) => ({ id, say, score, when: { role: 'tr', port: 'count', op: '=', value: String(value) }, hints });
  add({
    id: 'tr-123', essence: ['E1', 'E2'], title: '用 1、2、3 三张卡片，能排成几个不同的三位数？', grade: 3, rung: 2, alias: ['排三位数', '枚举树'],
    hook: '先定百位是几：1 打头的有哪些？一枝一枝展开。',
    build: tr({ mode: 0, m: 3, k: 3, zero: false, rep: false, cond: 0, open: 0 }),
    milestones: [ms('c', '一共 6 个', 8, 6, ['百位是 1：123、132。', '百位是 2、3 也各有 2 个。', '每一枝 2 个，3 枝：2 × 3 = 6。'])],
    goal: ['c'],
    why: '百位有 3 种选法；百位定了，十位只剩 2 种；十位定了，个位只剩 1 种。所以每一枝都是 2 个，一共 3 × 2 = 6 个。',
  });
  add({
    id: 'tr-0123', essence: ['E1', 'E2'], title: '用 0、1、2、3 四张卡片，能排成几个不同的两位数？', grade: 3, rung: 3, alias: ['有 0 的卡片', '枚举树'],
    hook: '0 能放在十位上吗？0 那一枝会怎么样？',
    build: tr({ mode: 0, m: 4, k: 2, zero: true, rep: false, cond: 0, open: 0 }),
    predict: { q: '先猜：4 张卡片，每张打头后面配 3 张，是 12 个吗？', options: [{ v: 0, label: '是 12 个' }, { v: 1, label: '比 12 个少' }, { v: 2, label: '比 12 个多' }], answer: 1 },
    milestones: [ms('c', '一共 9 个', 8, 9, ['0 不能打头：0 那一枝整枝剪掉。', '十位是 1：10、12、13。', '1、2、3 打头各 3 个：3 × 3 = 9。'])],
    goal: ['c'],
    why: '十位不能是 0，只有 1、2、3 三种；十位定了，个位从剩下的 3 张里选（0 可以放在个位）。所以是 3 × 3 = 9 个，不是 4 × 3 = 12 个。',
  });
  add({
    id: 'tr-even', essence: ['E1', 'E2'], title: '用 1、2、3、4 四张卡片排两位数，其中双数有几个？', grade: 3, rung: 3, alias: ['双数', '枚举树'],
    hook: '先全列出来，再把单数划掉。个位是几才是双数？',
    build: tr({ mode: 0, m: 4, k: 2, zero: false, rep: false, cond: 1, open: 0 }),
    milestones: [ms('c', '双数有 6 个', 8, 6, ['个位是 2 或 4 才是双数。', '十位是 1：12、14。十位是 2：24。', '2 + 1 + 2 + 1 = 6。'])],
    goal: ['c'],
    why: '每一枝的双数不一样多：十位是 1 或 3 时个位可以是 2、4（各 2 个）；十位是 2 或 4 时，这张已经用掉了，个位只剩一个双数（各 1 个）。2 + 1 + 2 + 1 = 6 个。',
  });
  add({
    id: 'tr-repeat', essence: ['E1', 'E2'], title: '用 1、2、3 排两位数，同一个数字可以重复用（比如 11）。能排几个？', grade: 3, rung: 3, alias: ['可以重复', '枚举树'],
    hook: '能重复用，十位用过的数个位还能用。每一枝有几个？',
    build: tr({ mode: 0, m: 3, k: 2, zero: false, rep: true, cond: 0, open: 0 }),
    milestones: [ms('c', '一共 9 个', 8, 9, ['十位是 1：11、12、13。', '每一枝 3 个。', '3 × 3 = 9。'])],
    goal: ['c'],
    why: '能重复用的时候，十位有 3 种，个位还是 3 种：3 × 3 = 9 个。不能重复时个位只剩 2 种，是 3 × 2 = 6 个。',
  });
  add({
    id: 'tr-coins-10', essence: ['E1', 'E2'], title: '用 1 元、2 元、5 元的钱（每种都足够多）凑 10 元，有几种凑法？', grade: 4, rung: 4, alias: ['凑钱', '分类枚举'],
    hook: '先定大的：5 元用几张？0 张、1 张、2 张。每一枝再看 2 元用几张。',
    build: tr({ mode: 1, set: 0, amt: 10, open: 0 }),
    milestones: [ms('c', '一共 10 种', 8, 10, ['5 元 0 张：2 元可以用 0 到 5 张，6 种。', '5 元 1 张：还剩 5 元，2 元用 0、1、2 张，3 种。', '5 元 2 张：1 种。6 + 3 + 1 = 10。'])],
    goal: ['c'],
    why: '按 5 元用几张分类：0 张时剩 10 元，2 元用 0 到 5 张（6 种）；1 张时剩 5 元，2 元用 0 到 2 张（3 种）；2 张时正好（1 种）。每一类不一样多，只能加：6 + 3 + 1 = 10 种。先定大的，就不会漏、不会重。',
  });
  U.problems.push.apply(U.problems, P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
