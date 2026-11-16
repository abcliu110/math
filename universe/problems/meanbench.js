/* “平均数（移多补少）”的题。开场都是高低不一样的几堆：学生自己搬，搬到一样高。
 * 全部可以在图上直接完成。判分只看器材的输出（是不是一样高、平均数、有几堆、总数）。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const mb = (props) => () => { const s = W.blank(); const id = W.add(s, 'meanbench', 40, 50, props); s.entities[id].role = 'm'; return s; };
  const P = [];
  const base = { domain: '统计与概率', level: 'core', shelf: ['meanbench'], traps: [], predict: null, points: ['4.15'] };
  const add = (o) => P.push(Object.assign({}, base, o));
  const ms = (id, say, score, port, value, hints) => ({ id, say, score, when: { role: 'm', port, op: '=', value: String(value) }, hints });

  add({
    id: 'mn-3-7-5-9', essence: ['E7', 'E2'], title: '四堆方块，搬到一样高', grade: 4, rung: 2,
    topics: ['平均数', '移多补少'], alias: ['平均数', '移多补少'],
    hook: '四堆方块：3、7、5、9 块。拖最上面的一块放到别的堆上。绿色的线是“摊平以后”的高度：把线上面橙色的，搬到线下面空着的地方。',
    build: mb({ vals: '3,7,5,9' }),
    predict: { q: '搬到一样高，每堆几块？', options: [{ v: '5', label: '5 块' }, { v: '6', label: '6 块' }, { v: '7', label: '7 块' }], answer: '6' },
    milestones: [ms('level', '每堆一样高：6 块', 8, 'level', 1, ['高的给矮的。', '9 那堆搬 3 块给 3 那堆。', '7 那堆搬 1 块给 5 那堆。'])],
    goal: ['level'],
    why: '搬来搬去，总数一直是 24 块。摊平成 4 堆，每堆 24 ÷ 4 = 6 块。平均数就是“总数不变，摊成一样多”时每份的数。',
  });
  add({
    id: 'mn-no-line', essence: ['E7', 'E2'], title: '没有线，先算再搬', grade: 4, rung: 3,
    topics: ['平均数'], alias: ['平均数', '求平均数'],
    hook: '三个人套圈：小明 4 个、小红 10 个、小刚 7 个。这回平均线藏起来了。先算出平均每人几个，再搬搬看对不对。',
    build: mb({ vals: '4,10,7', names: '小明,小红,小刚', unit: '个', mw: '人', showline: false }),
    predict: { q: '平均每人套中几个？', options: [{ v: '7', label: '7 个' }, { v: '8', label: '8 个' }, { v: '10', label: '10 个' }], answer: '7' },
    milestones: [ms('level', '每人一样多：7 个', 8, 'level', 1, ['一共 4 + 10 + 7 = 21 个。', '21 ÷ 3 = 7。', '小红搬 3 个给小明。'])],
    goal: ['level'],
    why: '(4 + 10 + 7) ÷ 3 = 7。平均数 7 不是谁真的套中的个数，它在最多的 10 和最少的 4 之间。',
  });
  add({
    id: 'mn-between', essence: ['E7', 'E2'], title: '平均数会不会比最高的还高？', grade: 4, rung: 3,
    topics: ['平均数', '平均数的范围'], alias: ['平均数', '最大值', '最小值'],
    hook: '五堆：2、2、2、2、12。有一堆特别高。平均线在哪儿？搬到一样高看看。',
    build: mb({ vals: '2,2,2,2,12' }),
    predict: { q: '平均数是几？', options: [{ v: '2', label: '2' }, { v: '4', label: '4' }, { v: '7', label: '7' }, { v: '12', label: '12' }], answer: '4' },
    milestones: [ms('level', '每堆一样高：4 块', 8, 'level', 1, ['一共 20 块，5 堆。', '高的那堆要搬出 8 块。', '给每个矮的 2 块。'])],
    goal: ['level'],
    why: '平均数 4 比最小的 2 大，比最大的 12 小：平均数总在最大和最小之间。一个特别大的数会把平均数往上拉，所以“平均”不一定代表“大多数”。',
  });
  add({
    id: 'mn-add-zero', essence: ['E7', 'E4'], title: '又来了一个人，他一个都没有', grade: 4, rung: 4,
    topics: ['平均数'], alias: ['平均数', '0 也算一个'],
    hook: '三个人各有 8 块，已经一样多。点“加一人”：来了第四个人，他一块也没有。平均线怎么动？再搬到四个人一样多。',
    build: mb({ vals: '8,8,8', mw: '人', free: true }),
    predict: { q: '第四个人有 0 块。四个人的平均数是？', options: [{ v: '8', label: '还是 8' }, { v: '6', label: '6' }, { v: '0', label: '0' }], answer: '6' },
    milestones: [ms('four', '四个人了', 2, 'n', 4, ['来了一个新的人。', '点右上角的“加一人”。', '他是空的。']), ms('six', '平均数是 6', 6, 'mean', 6, ['总数还是 24。', '24 ÷ 4。', '每人给他 2 块。'])],
    goal: ['four', 'six'],
    why: '总数还是 24，但要分给 4 个人：24 ÷ 4 = 6。0 也算一个数，它把平均数拉低了。算平均数时，除数是“一共有几个”，不是“有东西的有几个”。',
  });
  add({
    id: 'mn-target', essence: ['E7', 'E4'], title: '第四次要考多少，平均才到 8？', grade: 5, rung: 4,
    topics: ['平均数', '反过来求'], alias: ['平均数', '求其中一个数'],
    hook: '前三次得了 6、9、7 分，第四次还没考（现在是 0）。从托盘往第四堆上加，加到平均线正好在 8。',
    build: mb({ vals: '6,9,7,0', names: '第一次,第二次,第三次,第四次', unit: '分', mw: '次', free: true }),
    predict: { q: '四次平均 8 分，四次一共要几分？', options: [{ v: '32', label: '32 分' }, { v: '30', label: '30 分' }, { v: '8', label: '8 分' }], answer: '32' },
    milestones: [ms('avg', '平均数是 8', 8, 'mean', 8, ['平均 8，四次一共 32。', '前三次一共 22。', '第四次要 10：往第四堆上拖 10 块。'])],
    goal: ['avg'],
    why: '平均 8 分、4 次，总分要 8 × 4 = 32。前三次是 6 + 9 + 7 = 22，所以第四次要 32 − 22 = 10 分。知道平均数，就等于知道了总数。',
  });
  add({
    id: 'mn-not-whole', essence: ['E7', 'E2'], title: '摊不平怎么办？', grade: 5, rung: 3,
    topics: ['平均数', '平均数可以不是整数'], alias: ['平均数', '小数'],
    hook: '两堆：4 块和 7 块。搬一块试试，看能不能一样高。平均线画在哪里？',
    build: mb({ vals: '4,7' }),
    predict: { q: '4 和 7 的平均数是？', options: [{ v: '5', label: '5' }, { v: '5.5', label: '5.5' }, { v: '6', label: '6' }], answer: '5.5' },
    milestones: [ms('close', '搬到只差一块（5 和 6）', 8, 'max', 6, ['7 那堆搬 1 块给 4 那堆。', '变成 5 和 6。', '再搬就反过来了。'])],
    goal: ['close'],
    why: '一共 11 块分成 2 堆，11 ÷ 2 = 5.5。整块的方块摊不平，但平均数还是有的：它在 5 和 6 的正中间。平均数可以不是整数，也可以不是任何一堆真有的数。',
  });
  U.problems.push.apply(U.problems, P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
