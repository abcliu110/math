/* 代数式操作台的题（docs/instrument-design.md 第 4 节）。开场都没到目标：学生自己把同类项拖到一起，或者点运算符决定先算哪一步。
 * 全部可以在图上直接完成。判分只看器材的输出（还有几项、各项的系数、算式的结果、被拦住几次）。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const tb = (props) => () => { const s = W.blank(); const id = W.add(s, 'termsbench', 40, 60, Object.assign({}, props, props.terms ? { orig: props.terms } : {})); s.entities[id].role = 't'; return s; };
  const P = [];
  const base = { domain: '关系', level: 'core', shelf: ['termsbench'], traps: [], predict: null };
  const add = (o) => P.push(Object.assign({}, base, o));
  const ms = (id, say, score, port, value, hints) => ({ id, say, score, when: { role: 't', port, op: '=', value: String(value) }, hints });

  add({
    id: 'tb-3x-2x', essence: ['E4', 'E2'], title: '3x + 2x 等于多少？', grade: 7, rung: 2, points: ['7.4'],
    topics: ['合并同类项'], alias: ['合并同类项', '同类项', '整式的加减'],
    hook: '3 个 x 和 2 个 x。把一块拖到另一块上，合成一块。',
    build: tb({ terms: '3x,2x' }),
    predict: { q: '3x + 2x 等于？', options: [{ v: 'a', label: '5x' }, { v: 'b', label: '5x²' }, { v: 'c', label: '6x' }], answer: 'a' },
    milestones: [ms('one', '合成一项：5x', 8, 'terms', 1, ['两块颜色一样，是同类项。', '把一块拖到另一块上。', '3 个 x 加 2 个 x 是 5 个 x。'])],
    goal: ['one'],
    why: '3x + 2x = (3 + 2)x = 5x。3 个苹果加 2 个苹果是 5 个苹果：数的是个数，东西没变，所以是 5x，不是 5x²。',
  });
  add({
    id: 'tb-mixed', essence: ['E4', 'E2'], title: '化简 3x + 2 + 2x + 5', grade: 7, rung: 2, points: ['7.4'],
    topics: ['合并同类项'], alias: ['合并同类项', '化简'],
    hook: '四项里有两种：带 x 的，和不带 x 的。同一种的拖到一起。',
    build: tb({ terms: '3x,2,2x,5' }),
    milestones: [ms('x', 'x 的项合成 5x', 4, 'terms', 3, ['颜色一样的是同类项。', '把 2x 拖到 3x 上。', '5x。']), ms('done', '化到最简：5x + 7', 5, 'terms', 2, ['两个常数也能合并。', '把 5 拖到 2 上。', '5x + 7。'])],
    goal: ['done'],
    why: '3x + 2 + 2x + 5 = 5x + 7。5x 和 7 不是同类项，不能再合并：5x + 7 不等于 12x。代入 x = 2 检查：两边都是 17。',
  });
  add({
    id: 'tb-4x-minus-x', essence: ['E4', 'E2'], title: '4x − x 等于多少？', grade: 7, rung: 3, points: ['7.4'],
    topics: ['合并同类项'], alias: ['合并同类项', '系数是 1'],
    hook: '−x 的系数是多少？把它拖到 4x 上看看。',
    build: tb({ terms: '4x,-x' }),
    predict: { q: '4x − x 等于？', options: [{ v: 'a', label: '4' }, { v: 'b', label: '3x' }, { v: 'c', label: '3' }], answer: 'b' },
    milestones: [ms('three', '合成一项：3x', 8, 'terms', 1, ['x 就是 1 个 x。', '4 个 x 去掉 1 个 x。', '3x。'])],
    goal: ['three'],
    why: '4x − x = 4x − 1x = 3x。x 前面没写数，系数是 1，不是 0。所以结果是 3x，不是 4。',
  });
  add({
    id: 'tb-two-letters', essence: ['E4', 'E2'], title: '化简 2x + 3y + x − y', grade: 7, rung: 3, points: ['7.4'],
    topics: ['合并同类项'], alias: ['合并同类项', '两个字母'],
    hook: '有 x 的项，也有 y 的项。x 和 y 是不同的东西，各合各的。',
    build: tb({ terms: '2x,3y,x,-y' }),
    milestones: [ms('x', '先合并一对：还剩 3 项', 4, 'terms', 3, ['2x 和 x 是同类项。', '把 x 拖到 2x 上。', '3x。']), ms('done', '化到最简：3x + 2y', 5, 'terms', 2, ['3y 和 −y 是同类项。', '把 −y 拖到 3y 上。', '2y。'])],
    goal: ['x', 'done'],
    why: '2x + 3y + x − y = 3x + 2y。x 的项和 y 的项不能合并：试试把 3x 拖到 2y 上，它会告诉你不行。',
  });
  add({
    id: 'tb-square', essence: ['E4', 'E2'], title: 'x² 和 x 是同类项吗？', grade: 7, rung: 3, points: ['7.4'],
    topics: ['合并同类项', '同类项的概念'], alias: ['同类项', '次数'],
    hook: '化简 x² + 3x + 2x² − x。先试试把 3x 拖到 x² 上，看会发生什么。',
    build: tb({ terms: 'x2,3x,2x2,-x' }),
    predict: { q: 'x² 和 3x 能合并吗？', options: [{ v: 'y', label: '能，都有 x' }, { v: 'n', label: '不能' }], answer: 'n' },
    milestones: [ms('sq', '先合并一对：还剩 3 项', 4, 'terms', 3, ['x² 和 2x² 是同类项。', '拖到一起。', '3x²。']), ms('done', '化到最简：3x² + 2x', 5, 'terms', 2, ['3x 和 −x 是同类项。', '拖到一起。', '2x。'])],
    goal: ['done'],
    why: '同类项要字母相同、字母的次数也相同。x² 是 x 乘 x，和 x 不是一种东西：面积和长度不能相加。',
  });
  add({
    id: 'tb-refuse', essence: ['E4', 'E3'], title: '3x + 2 为什么不能再化简？', grade: 7, rung: 3, points: ['7.4'],
    topics: ['合并同类项'], alias: ['同类项', '常见错误'],
    hook: '有同学把 3x + 2 写成 5x。把 2 拖到 3x 上试一次，再看下面“代入 x = 2”的检验：3x + 2 是 8，5x 是 10。',
    build: tb({ terms: '3x,2' }),
    predict: { q: '3x + 2 能写成 5x 吗？', options: [{ v: 'y', label: '能' }, { v: 'n', label: '不能' }], answer: 'n' },
    milestones: [ms('try', '试着合并一次：合不了', 8, 'refused', 1, ['把 2 拖到 3x 上。', '看它怎么说。', '不是同类项。'])],
    goal: ['try'],
    why: '3x 是“3 个 x”，2 是一个数，不是同类项。x = 2 时 3x + 2 = 8，而 5x = 10，不相等，所以 3x + 2 已经是最简了。',
  });
  add({
    id: 'tb-order-mul', essence: ['E2', 'E4'], title: '6 + 2 × 5 先算哪一步？', grade: 4, rung: 2, points: ['4.9'],
    topics: ['四则混合运算'], alias: ['运算顺序', '先乘除后加减', '混合运算'],
    hook: '点一个运算符，先算那一步。先点加号试试，看它让不让。',
    build: tb({ mode: 1, toks: '6,+,2,*,5' }),
    predict: { q: '6 + 2 × 5 等于？', options: [{ v: 'a', label: '40' }, { v: 'b', label: '16' }], answer: 'b' },
    milestones: [ms('v', '算出 16', 8, 'value', 16, ['有乘法。', '先点 ×。', '6 + 10 = 16。'])],
    goal: ['v'],
    why: '先乘除，后加减：6 + 2 × 5 = 6 + 10 = 16。乘法是“几个几”，2 × 5 是一个整体，要先合起来，才能和 6 相加。',
  });
  add({
    id: 'tb-order-paren', essence: ['E2', 'E4'], title: '(6 + 2) × 5：括号改变了什么？', grade: 4, rung: 2, points: ['4.9'],
    topics: ['四则混合运算', '括号'], alias: ['括号', '运算顺序'],
    hook: '和上一题只差一对括号。这回先算哪一步？',
    build: tb({ mode: 1, toks: '(,6,+,2,),*,5' }),
    milestones: [ms('v', '算出 40', 8, 'value', 40, ['有括号。', '先点括号里的 +。', '8 × 5 = 40。'])],
    goal: ['v'],
    why: '括号里的先算：(6 + 2) × 5 = 8 × 5 = 40。括号的作用就是改变顺序，所以它和 6 + 2 × 5 = 16 不一样。',
  });
  add({
    id: 'tb-order-div', essence: ['E2', 'E4'], title: '20 − 12 ÷ 4', grade: 4, rung: 2, points: ['4.9'],
    topics: ['四则混合运算'], alias: ['运算顺序', '先乘除后加减'],
    hook: '从左往右顺着算，还是先算除法？',
    build: tb({ mode: 1, toks: '20,-,12,/,4' }),
    milestones: [ms('v', '算出 17', 8, 'value', 17, ['有除法。', '先点 ÷。', '20 − 3 = 17。'])],
    traps: [{ id: 'left', wrong: '不能从左往右顺着算：(20 − 12) ÷ 4 = 2，那是另一道题。', when: { role: 't', port: 'value', op: '=', value: '2' } }],
    goal: ['v'],
    why: '20 − 12 ÷ 4 = 20 − 3 = 17。除法先算。',
  });
  add({
    id: 'tb-order-sub', essence: ['E2', 'E4'], title: '30 − 10 − 5 能先算后面吗？', grade: 4, rung: 3, points: ['4.10'],
    topics: ['减法的性质', '运算顺序'], alias: ['连减', '从左往右', '结合律'],
    hook: '连加可以先算后面，连减行不行？先点后面那个减号试试。',
    build: tb({ mode: 1, toks: '30,-,10,-,5' }),
    predict: { q: '30 − 10 − 5 和 30 − (10 − 5) 一样吗？', options: [{ v: 'y', label: '一样' }, { v: 'n', label: '不一样' }], answer: 'n' },
    milestones: [ms('v', '算出 15', 8, 'value', 15, ['连减从左往右。', '先点前面的 −。', '20 − 5 = 15。'])],
    goal: ['v'],
    why: '30 − 10 − 5 = 20 − 5 = 15。如果先算 10 − 5 = 5，就成了 30 − 5 = 25：少减了。连减没有结合律，可以写成 30 − (10 + 5)。',
  });
  U.problems.push.apply(U.problems, P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
