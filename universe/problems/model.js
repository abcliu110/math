/* 建模题（套餐）：同一个情境两个模型，读交点、比较大小。 */
(function (G) {
  'use strict';
  const U = G.U, mk = U.mkScene, P = [];

  P.push({
    id: 'plan-breakeven', essence: ['E12', 'E8'], title: '电话套餐：甲 月租 20 元、每分钟 0.1 元；乙 无月租、每分钟 0.15 元。通话多少分钟，两个套餐一样多？', grade: 7, domain: '函数', points: ['8.15', '5.5'], topics: ['一次函数', '交点的意义', '解方程'],
    alias: ['套餐', '一次函数', '交点', '建模'], hook: '乙的每分钟价格先被设成了 0.2，不对。把它改成 0.15，再读出“一样多”的分钟数：两条线相交的地方就是答案。',
    shelf: ['costplan', 'num'],
    build: mk({ ents: [{ type: 'costplan', x: 60, y: 60, role: 'c', props: { base1: 20, rate1: 0.1, base2: 0, rate2: 0.2, x: 0 } }] }),
    predict: { q: '先猜：通话多少分钟，两个套餐一样多？', options: [{ v: 100, label: '100 分钟' }, { v: 200, label: '200 分钟' }, { v: 400, label: '400 分钟' }], reveal: () => ({ v: 400, label: '400 分钟（20 ÷ (0.15 − 0.1)）' }) },
    milestones: [
      { id: 'setB', say: '乙每分钟 0.15 元', score: 3, when: (w) => w.ofType('costplan').some((e) => e.props.rate2 === 0.15), hints: ['乙的每分钟价格不是 0.2。', '在「套餐对比」的属性里找到「乙 每分钟（元）」。', '把它改成 0.15。'] },
      { id: 'be', say: '读出交点：一样多的分钟数是 400', score: 7, when: { role: 'c', port: 'breakeven', op: '=', value: '400' }, glow: ['costplan'], hints: ['两个套餐一样多，就是两条线相交：甲的钱 = 乙的钱。', '看「套餐对比」的输出「交点」。', '设通话 x 分钟：20 + 0.1x = 0.15x，x = 400。读数应为 400。'] },
    ],
    traps: [{ id: 'same', when: (w) => w.ofType('costplan').some((e) => e.props.rate2 === 0.1), wrong: '乙的每分钟和甲一样（都是 0.1），两条线平行，不会相交，所以没有“一样多”的时刻。' }],
    why: '设通话 x 分钟：甲花 20 + 0.1x，乙花 0.15x。两者相等：20 = 0.05x，x = 400。两条直线的交点，就是两种模型给出同样结果的地方；平行则没有交点。',
    ref: ['costplan|0'],
  });

  P.push({
    id: 'plan-choose', essence: ['E12', 'E4'], title: '同样两个套餐（甲：20 + 0.1x；乙：0.15x）。通话 300 分钟哪个便宜？通话 600 分钟呢？', grade: 7, domain: '函数', points: ['6.4'], topics: ['代入求值', '比较大小', '结论依赖条件'],
    alias: ['套餐', '比较', '代入', '建模'], hook: '先把通话设成 300 分钟，看哪个套餐的钱少；再改成 600 分钟，看结论会不会变。',
    shelf: ['costplan', 'num'],
    build: mk({ ents: [{ type: 'costplan', x: 60, y: 60, role: 'c', props: { base1: 20, rate1: 0.1, base2: 0, rate2: 0.15, x: 500 } }] }),
    predict: { q: '先猜：通话 300 分钟时，哪个套餐便宜？', options: [{ v: 1, label: '甲' }, { v: 2, label: '乙' }, { v: 0, label: '一样' }], reveal: () => ({ v: 2, label: '乙：45 元，甲：50 元' }) },
    milestones: [
      { id: 'x300', say: '通话 300 分钟：乙更便宜（cheaper = 2）', score: 4, when: (w) => w.ofType('costplan').some((e) => e.props.x === 300 && w.num(e, 'cheaper') === 2), hints: ['要比的是同一通话时间下两个套餐花多少钱。', '在「套餐对比」的「通话（分钟）」里改，然后看输出「便宜」。', '把通话改成 300，读出 cheaper = 2（乙）。'] },
      { id: 'x600', say: '通话 600 分钟：甲更便宜（cheaper = 1）', score: 6, when: (w) => w.ofType('costplan').some((e) => e.props.x === 600 && w.num(e, 'cheaper') === 1), hints: ['通话变长，结论可能会变，换一个更大的分钟数再看。', '把通话改成 600：甲 80 元，乙 90 元。', '读出 cheaper = 1（甲）。'] },
    ],
    traps: [],
    why: '甲 = 20 + 0.1x，乙 = 0.15x。300 分钟：甲 50 元、乙 45 元，乙便宜。600 分钟：甲 80 元、乙 90 元，甲便宜。两者在 400 分钟相等，所以少于 400 分钟选乙，多于 400 分钟选甲。结论依赖条件，要先找出分界点。',
    ref: ['costplan|0'],
  });

  U.problems.push(...P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
