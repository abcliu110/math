/* 数轴操作台的题（docs/instrument-design.md 第 4 节）。开场都没到目标：学生自己拖起点、拖落点、改步长、拖端点。
 * 全部可以在图上直接完成。判分只看器材的输出（落点、步长、跳了几步、区间端点……）。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const nl = (props) => () => { const s = W.blank(); const id = W.add(s, 'numlinebench', 40, 60, props); s.entities[id].role = 'n'; return s; };
  const P = [];
  const base = { domain: '数与运算', level: 'core', shelf: ['numlinebench'], traps: [], predict: null };
  const add = (o) => P.push(Object.assign({}, base, o));
  const ms = (id, say, score, port, value, hints) => ({ id, say, score, when: { role: 'n', port, op: '=', value: String(value) }, hints });

  add({
    id: 'nl-3-plus-4', essence: ['E1', 'E2'], title: '3 + 4：在数轴上跳', grade: 1, rung: 1, points: ['1.6'],
    topics: ['10 以内的加法'], alias: ['加法', '数轴', '接着数'],
    hook: '把起点拖到 3，再拖着“跳”字往右跳 4 步。落在几？',
    build: nl({ from: 0, to: 12, a: 0, s: 1, n: 0 }),
    milestones: [
      ms('start', '从 3 出发', 3, 'start', 3, ['起点是那个圆点。', '把它拖到 3。', '松手。']),
      ms('land', '跳 4 步，落在 7', 5, 'value', 7, ['一步跳 1。', '拖“跳”字往右，数 4 步。', '3、4、5、6、7。']),
    ],
    goal: ['start', 'land'],
    why: '3 + 4 就是从 3 往右走 4 步，落在 7。加法在数轴上是“接着往右数”。',
  });
  add({
    id: 'nl-13-minus-5', essence: ['E1', 'E2'], title: '13 − 5：往左跳', grade: 1, rung: 2, points: ['1.11'],
    topics: ['20 以内的退位减法'], alias: ['减法', '数轴', '退位'],
    hook: '减法是往左走。先点 − 把“每一步跳”改成 −1，再从 13 往左跳 5 步。',
    build: nl({ from: 0, to: 20, a: 13, s: 1, n: 0 }),
    milestones: [
      ms('left', '步长改成 −1（往左）', 3, 'step', -1, ['现在每一步是 +1。', '点“每一步跳”旁边的 −。', '点一下：+1 变成 −1。']),
      ms('land', '落在 8', 5, 'value', 8, ['往左跳 5 步。', '拖“跳”字往左。', '13、12、11、10、9、8。']),
    ],
    goal: ['left', 'land'],
    why: '13 − 5 是从 13 往左走 5 步。走到 10 用了 3 步，再走 2 步到 8：这就是“破十”。',
  });
  add({
    id: 'nl-4x3', essence: ['E2', 'E5'], title: '4 个 3 是多少？', grade: 2, rung: 2, points: ['2.5'],
    topics: ['乘法的初步认识'], alias: ['乘法', '几个几', '连加'],
    hook: '把每一步改成跳 3，从 0 出发跳 4 步。',
    build: nl({ from: 0, to: 20, a: 0, s: 1, n: 0 }),
    predict: { q: '4 个 3 和 3 个 4，落点一样吗？', options: [{ v: 'y', label: '一样' }, { v: 'n', label: '不一样' }], answer: 'y' },
    milestones: [
      ms('step3', '每一步跳 3', 3, 'step', 3, ['点 ＋ 改步长。', '改到 3。', '点两下 ＋。']),
      ms('land', '跳 4 步，落在 12', 5, 'value', 12, ['数 4 道弧线。', '拖“跳”字。', '3、6、9、12。']),
    ],
    goal: ['step3', 'land'],
    why: '4 × 3 = 3 + 3 + 3 + 3 = 12。乘法是连续跳同样大的步子。把步长改成 4、跳 3 步，也落在 12。',
  });
  add({
    id: 'nl-20-div-4', essence: ['E2', 'E5'], title: '20 里面有几个 4？', grade: 2, rung: 2, points: ['2.8'],
    topics: ['除法的含义'], alias: ['除法', '包含除', '几个几'],
    hook: '每一步跳 4，从 0 出发，正好跳到 20 要几步？',
    build: nl({ from: 0, to: 24, a: 0, s: 4, n: 0 }),
    milestones: [ms('land', '落在 20', 4, 'value', 20, ['每步 4。', '一直跳到 20。', '4、8、12、16、20。']), ms('count', '跳了 5 步', 4, 'jumps', 5, ['数弧线。', '下面写着跳了几步。', '5 步。'])],
    goal: ['land', 'count'],
    why: '20 ÷ 4 = 5：20 里面有 5 个 4。除法可以看成“一步跳 4，几步到 20”。如果要跳到 22，就跳不到：会余 2。',
  });
  add({
    id: 'nl-three-quarters', essence: ['E3', 'E1'], title: '3/4 在数轴的哪里？', grade: 3, rung: 2, points: ['3.7'],
    topics: ['分数的初步认识'], alias: ['分数', '数轴', '几分之几'],
    hook: '每一格切成了 4 份。把点拖到 3/4 的位置。它在 0 和 1 之间，靠近谁？',
    build: nl({ mode: 1, from: 0, to: 4, d: 4, k: 0 }),
    milestones: [ms('put', '点在 3/4', 8, 'value', '3/4', ['0 到 1 之间有 4 小格。', '数到第 3 条线。', '把点拖过去。'])],
    goal: ['put'],
    why: '3/4 是把 0 到 1 平均分成 4 份，从 0 数第 3 条线。它比 1/2 大，比 1 小。',
  });
  add({
    id: 'nl-five-quarters', essence: ['E3', 'E1'], title: '5/4 比 1 大吗？', grade: 5, rung: 3, points: ['5.10'],
    topics: ['假分数', '带分数'], alias: ['假分数', '带分数', '数轴'],
    hook: '把点拖到 5/4。看它在 1 的左边还是右边，上面还会写出它的另外两种写法。',
    build: nl({ mode: 1, from: 0, to: 4, d: 4, k: 1 }),
    predict: { q: '5/4 和 1 比，谁大？', options: [{ v: 'a', label: '5/4 大' }, { v: 'b', label: '1 大' }, { v: 'c', label: '一样大' }], answer: 'a' },
    milestones: [ms('put', '点在 5/4', 8, 'value', '5/4', ['每小格是 1/4。', '从 0 数 5 小格。', '过了 1 再走一小格。'])],
    goal: ['put'],
    why: '5/4 = 1 又 1/4 = 1.25，在 1 的右边。分子比分母大的分数比 1 大，叫假分数；它和带分数是同一个点。',
  });
  add({
    id: 'nl-1p3', essence: ['E3', 'E1'], title: '1.3 在哪里？', grade: 3, rung: 2, points: ['3.14'],
    topics: ['小数的意义'], alias: ['小数', '十分之几', '数轴'],
    hook: '小数是十分之几。先把每一格切成 10 份，再把点拖到 1.3。',
    build: nl({ mode: 1, from: 0, to: 3, d: 4, k: 0 }),
    milestones: [ms('put', '点在 1.3', 8, 'value', '13/10', ['1.3 = 1 + 3/10。', '点 ＋ 把每格切成 10 份。', '从 1 往右数 3 小格。'])],
    goal: ['put'],
    why: '1.3 = 13/10 = 1 又 3/10：过了 1，再走 3 个十分之一。小数是分母为 10、100……的分数的另一种写法。',
  });
  add({
    id: 'nl-2-minus-5', essence: ['E1', 'E2'], title: '2 − 5 等于多少？', grade: 7, rung: 3, points: ['7.2', '6.8'],
    topics: ['负数的认识', '有理数的减法'], alias: ['负数', '减法', '数轴'],
    hook: '以前说“2 − 5 不够减”。这条数轴 0 的左边还有数。从 2 往左跳 5 步，看落在哪里。',
    build: nl({ from: -8, to: 8, a: 2, s: -1, n: 0 }),
    predict: { q: '2 − 5 的结果在 0 的哪一边？', options: [{ v: 'l', label: '左边' }, { v: 'r', label: '右边' }, { v: 'z', label: '就是 0' }], answer: 'l' },
    milestones: [ms('land', '落在 −3', 8, 'value', -3, ['每一步是 −1。', '拖“跳”字往左 5 步。', '2、1、0、−1、−2、−3。'])],
    goal: ['land'],
    why: '2 − 5 = −3。走了 2 步到 0，还差 3 步，就继续往左走到 −3。负数让减法总能做下去。',
  });
  add({
    id: 'nl-neg3-plus-5', essence: ['E1', 'E2'], title: '−3 + 5', grade: 7, rung: 3, points: ['7.2'],
    topics: ['有理数的加法'], alias: ['有理数', '加法', '负数'],
    hook: '把起点拖到 −3，每一步 +1，跳 5 步。',
    build: nl({ from: -8, to: 8, a: 0, s: 1, n: 0 }),
    milestones: [ms('start', '从 −3 出发', 3, 'start', -3, ['−3 在 0 的左边。', '拖起点。', '松手在 −3。']), ms('land', '落在 2', 5, 'value', 2, ['往右 5 步。', '拖“跳”字。', '−2、−1、0、1、2。'])],
    goal: ['start', 'land'],
    why: '−3 + 5 = 2。先用 3 步走回 0，还剩 2 步，落在 2。异号两数相加，就是“抵消”以后剩下的。',
  });
  add({
    id: 'nl-ineq', essence: ['E1', 'E4'], title: '−2 < x ≤ 3 有几个整数解？', grade: 7, rung: 3, points: ['7.15'],
    topics: ['不等式的解集', '不等式组'], alias: ['不等式', '解集', '数轴'],
    hook: '拖两个端点，画出 −2 < x ≤ 3。注意左边是“不含”，右边是“含”：点端点下面的按钮切换。',
    build: nl({ mode: 2, from: -6, to: 6, lo: 0, hi: 1, lc: 1, hc: 1 }),
    predict: { q: '−2 算不算这个不等式的解？', options: [{ v: 'y', label: '算' }, { v: 'n', label: '不算' }], answer: 'n' },
    milestones: [
      ms('lo', '左端是 −2', 2, 'lo', -2, ['拖左端点。', '到 −2。', '松手。']),
      ms('hi', '右端是 3', 2, 'hi', 3, ['拖右端点。', '到 3。', '松手。']),
      ms('ints', '里面有 5 个整数', 5, 'ints', 5, ['左端不含、右端含。', '点左端下面的按钮，改成“不含”。', '−1、0、1、2、3。']),
    ],
    traps: [{ id: 'both', wrong: '左边是 <，−2 不算在里面：如果两端都含，就数出 6 个整数了。', when: { role: 'n', port: 'ints', op: '=', value: '6' } }],
    goal: ['lo', 'hi', 'ints'],
    why: '−2 < x ≤ 3 的整数解是 −1、0、1、2、3，共 5 个。空心点表示不含（<），实心点表示含（≤）。',
  });
  U.problems.push.apply(U.problems, P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
