/* 七年级内容补充：没有题或题少于 2 道的知识点（7.1、7.2、7.3、7.4、7.5、7.7、7.8、7.10、7.11、7.13、7.16）。每点写一道核心题和一道陷阱题；延伸题需要证据 ④ 的器材，七年级现有器材做不到，暂缺。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const R = (s, id, role) => { s.entities[id].role = role; return id; };
  // 代数式卡的台面状态：某张代数式卡输出的多项式，显示成指定的写法
  const polyIs = (text) => (J) => J.ofType('algebra').some((e) => { const v = J.out(e, 'p'); return !!v && v.kind === 'poly' && U.Poly.show(v.data) === text; });

  // 7.1 有理数（核心）：负数比较大小
  U.problems.push({
    id: 'g7-rational-compare-core', title: '−3 和 2，哪个在数轴的左边？', grade: 7, domain: '数与运算', essence: ['E2'], points: ['7.1'], level: 'core', rung: 2,
    alias: ['负数', '有理数', '大小', '数轴'], hook: '数轴上越往右越大。负数都在 0 的左边。用比较器判断 −3 是不是小于 2。',
    shelf: ['num', 'compare'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: -3 }), 'a'); R(s, W.add(s, 'num', 60, 200, { n: 2 }), 'b'); return s; },
    predict: null,
    milestones: [
      { id: 'put', say: '放一台比较器', score: 2, when: { count: { type: 'compare', ge: 1 } },
        hints: ['要比大小，先要一台比较器。', '「比较」器材可以判断两个数的关系。', '放一台比较器，关系先选“<”。'] },
      { id: 'less', say: '比较结果：−3 < 2 成立', score: 4, when: { type: 'compare', port: 'ok', op: '=', value: true },
        hints: ['把 −3 接甲口，2 接乙口。', '关系选“<”（小于）：−3 在 2 的左边。', '甲接 −3，乙接 2，关系设为 <。'] },
    ],
    traps: [], goal: ['less'],
    why: '负数都比 0 小，比 2 小的数在数轴上更靠左。−3 < 2，所以 −3 在 2 的左边。',
  });

  // 7.1 有理数（陷阱）：相反数与负号
  U.problems.push({
    id: 'g7-rational-opposite-trap', title: '−(−4) 等于几？', grade: 7, domain: '数与运算', essence: ['E2'], points: ['7.1'], level: 'trap', rung: 3,
    alias: ['相反数', '负号', '负数', '减法'], hook: '−(−4) 是 −4 的相反数。它是正的还是负的？能不能写成 0 − (−4)，用运算器算一算？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 0 }), 'zero'); R(s, W.add(s, 'num', 60, 200, { n: -4 }), 'neg'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器，选 −', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['−(−4) 可以看成 0 − (−4)。', '要做减法，运算器选 −。', '放一台运算器，运算选 −。'] },
      { id: 'four', say: '结果是 4', score: 4, when: { type: 'op', port: 'r', op: '=', value: '4' },
        hints: ['把 0 接甲口，−4 接乙口。', '减去一个负数，等于加上它的相反数。', '甲接 0，乙接 −4，运算选 −。'] },
    ],
    traps: [{ id: 'neg-four', wrong: '把 −(−4) 写成 −4：两个负号要变成正的，减去负数结果是正数。', when: { type: 'op', port: 'r', op: '=', value: '-4' } }],
    goal: ['four'],
    why: '−(−4) 是 −4 的相反数，等于 4。两个负号抵消，结果为正。0 − (−4) = 0 + 4 = 4。',
  });

  // 7.2 有理数的加减法（核心）：异号相加
  U.problems.push({
    id: 'g7-rational-addsub-core', title: '温度从 −3℃ 上升 5℃，现在是几度？', grade: 7, domain: '数与运算', essence: ['E2'], points: ['7.2'], level: 'core', rung: 2,
    alias: ['有理数', '加法', '异号', '温度'], hook: '温度是 −3℃，又上升了 5℃。现在是几度？用运算器算 (−3) + 5。',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: -3 }), 'a'); R(s, W.add(s, 'num', 60, 200, { n: 5 }), 'b'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器，运算选 +', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['上升是加法。', '运算器默认就是 +。', '放一台运算器，运算选 +。'] },
      { id: 'two', say: '结果是 2℃', score: 4, when: { type: 'op', port: 'r', op: '=', value: '2' },
        hints: ['把 −3 接甲口，5 接乙口。', '从 −3 向右数 5 格，到达 2。', '甲接 −3，乙接 5，运算选 +。'] },
    ],
    traps: [], goal: ['two'],
    why: '(−3) + 5：从 −3 向右走 5 个单位，到 2。异号相加，用较大的绝对值减去较小的绝对值，符号跟着绝对值较大的那个数。',
  });

  // 7.2 有理数的加减法（陷阱）：减去负数
  U.problems.push({
    id: 'g7-rational-subneg-trap', title: '(−3) − (−5) 等于几？', grade: 7, domain: '数与运算', essence: ['E2'], points: ['7.2'], level: 'trap', rung: 3,
    alias: ['有理数', '减法', '减去负数'], hook: '减去一个负数，结果会变大还是变小？用运算器算 (−3) − (−5)。',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: -3 }), 'a'); R(s, W.add(s, 'num', 60, 200, { n: -5 }), 'b'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器，运算选 −', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['这是减法，不是加法。', '运算器要选 −。', '放一台运算器，运算选 −。'] },
      { id: 'two', say: '结果是 2', score: 4, when: { type: 'op', port: 'r', op: '=', value: '2' },
        hints: ['把 −3 接甲口，−5 接乙口。', '减去一个负数，等于加上它的相反数：−3 + 5。', '甲接 −3，乙接 −5，运算选 −。'] },
    ],
    traps: [{ id: 'plus', wrong: '把减号当成加号：(−3) + (−5) = −8。减去负数要加上它的相反数，结果是 2。', when: { type: 'op', port: 'r', op: '=', value: '-8' } }],
    goal: ['two'],
    why: '(−3) − (−5) = (−3) + 5 = 2。减去一个负数，等于加上它的相反数，所以结果比 −3 大。',
  });

  // 7.3 有理数的乘除法（核心）：负数除以正数
  U.problems.push({
    id: 'g7-rational-divsign-core', title: '−12 平均分成 4 份，每份是几？', grade: 7, domain: '数与运算', essence: ['E2'], points: ['7.3'], level: 'core', rung: 2,
    alias: ['有理数', '除法', '符号'], hook: '−12 平均分成 4 份，每份是多少？用运算器算 (−12) ÷ 4。',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: -12 }), 'a'); R(s, W.add(s, 'num', 60, 200, { n: 4 }), 'b'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器，运算选 ÷', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['平均分成几份，要用除法。', '运算器选 ÷。', '放一台运算器，运算选 ÷。'] },
      { id: 'quot', say: '每份是 −3', score: 4, when: { type: 'op', port: 'r', op: '=', value: '-3' },
        hints: ['先不管符号，12 ÷ 4 是几？', '负数除以正数，商是负数。', '把 −12 接甲口，4 接乙口，运算选 ÷。'] },
    ],
    traps: [], goal: ['quot'],
    why: '12 ÷ 4 = 3，异号两数相除，商为负，所以 (−12) ÷ 4 = −3。',
  });

  // 7.3 有理数的乘除法（陷阱）：负数乘负数的符号
  U.problems.push({
    id: 'g7-rational-mulneg-trap', title: '(−4) × (−3) 等于几？', grade: 7, domain: '数与运算', essence: ['E2'], points: ['7.3'], level: 'trap', rung: 3,
    alias: ['有理数', '乘法', '同号'], hook: '两个负数相乘，积是正数还是负数？用运算器算 (−4) × (−3)。',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: -4 }), 'a'); R(s, W.add(s, 'num', 60, 200, { n: -3 }), 'b'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器，运算选 ×', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['相乘要用乘法。', '运算器选 ×。', '放一台运算器，运算选 ×。'] },
      { id: 'prod', say: '积是 12', score: 4, when: { type: 'op', port: 'r', op: '=', value: '12' },
        hints: ['把 −4 接甲口，−3 接乙口。', '同号得正：两个负数相乘，积是正数。', '甲接 −4，乙接 −3，运算选 ×。'] },
    ],
    traps: [{ id: 'neg-prod', wrong: '把积写成负数：同号得正，(−4) × (−3) = 12，不是 −12。', when: { type: 'op', port: 'r', op: '=', value: '-12' } }],
    goal: ['prod'],
    why: '同号得正，异号得负。两个负数相乘，积为正：(−4) × (−3) = 12。',
  });

  // 7.4 整式（核心）：按次数从高到低排列多项式
  U.problems.push({
    id: 'g7-poly-order-core', title: '把 2x + x² − 3 按次数从高到低排好', grade: 7, domain: '代数', essence: ['E8'], points: ['7.4'], level: 'core', rung: 2,
    alias: ['整式', '多项式', '次数', '降幂'], hook: '一个式子里有 x²、2x 和常数项。整理时，次数高的项放在前面，你能把它写成标准形式吗？',
    shelf: ['algebra'],
    build() { const s = W.blank(); R(s, W.add(s, 'algebra', 60, 60, { text: 'x', name: '' }), 'card'); return s; },
    predict: null,
    milestones: [
      { id: 'sorted', say: '代数式卡上是 x² + 2x − 3', score: 4, when: polyIs('x² + 2x − 3'), why_code: '多项式的值不是数，器材的输出没有可直接比较的形式，只能用写法判断',
        hints: ['整理的规则：次数高的项放在前面。', '次数分别是：x² 是 2 次，2x 是 1 次，−3 是 0 次。', '把代数式卡的式子改成 2x + x^2 - 3，看它按什么顺序排。'] },
    ],
    traps: [], goal: ['sorted'],
    why: '整式的标准形式按次数从高到低排列：x² + 2x − 3。次数最高的项是 x²，常数项 −3 放在最后。',
  });

  // 7.4 整式（陷阱）：负号不能丢
  U.problems.push({
    id: 'g7-poly-minus-trap', title: '−x 和 x：负号不能丢', grade: 7, domain: '代数', essence: ['E8'], points: ['7.4'], level: 'trap', rung: 3,
    alias: ['整式', '系数', '负号'], hook: '在式子 −x 里，x 前面的负号表示系数是 −1。如果把负号丢了，式子就变了。把 −x 写进代数式卡。',
    shelf: ['algebra'],
    build() { const s = W.blank(); R(s, W.add(s, 'algebra', 60, 60, { text: '2', name: '' }), 'card'); return s; },
    predict: null,
    milestones: [
      { id: 'neg', say: '代数式卡上是 −x', score: 4, when: polyIs('−x'), why_code: '多项式的值不是数，只能用写法判断',
        hints: ['x 前面没有写数，系数是 1。负号要保留。', '−x 的系数是 −1，不是 1。', '在代数式卡里写 -x。'] },
    ],
    traps: [{ id: 'drop', wrong: '把负号丢了：写成 x，系数就变成了 1，和 −x 不是同一个式子。', when: polyIs('x'), why_code: '多项式的值不是数，只能用写法判断' }],
    goal: ['neg'],
    why: '−x 的系数是 −1。去掉负号写成 x，系数就变成 1，两个式子的值正好相反。',
  });

  // 7.5 整式的加减（核心）：合并同类项
  U.problems.push({
    id: 'g7-like-terms-core', title: '2x + 3x − x 合并后是几？', grade: 7, domain: '代数', essence: ['E8'], points: ['7.5'], level: 'core', rung: 2,
    alias: ['整式', '同类项', '合并'], hook: '2x、3x、−x 都是 x 的项。把它们合并成一项，写进代数式卡。',
    shelf: ['algebra'],
    build() { const s = W.blank(); R(s, W.add(s, 'algebra', 60, 60, { text: 'x', name: '' }), 'card'); return s; },
    predict: null,
    milestones: [
      { id: 'merged', say: '代数式卡上是 4x', score: 4, when: polyIs('4x'), why_code: '多项式的值不是数，只能用写法判断',
        hints: ['同类项是字母和指数都相同的项。', '2x、3x 和 −x 都是 x 的项，可以合并。', '把系数加起来：2 + 3 − 1 = 4，写成 2x + 3x - x。'] },
    ],
    traps: [], goal: ['merged'],
    why: '2x + 3x − x = (2 + 3 − 1)x = 4x。同类项合并时只把系数相加，字母和指数不变。',
  });

  // 7.5 整式的加减（陷阱）：去括号要变号
  U.problems.push({
    id: 'g7-like-terms-trap', title: '3x − (x − 2) 去括号后是几？', grade: 7, domain: '代数', essence: ['E8'], points: ['7.5'], level: 'trap', rung: 3,
    alias: ['整式', '去括号', '变号'], hook: '括号前面是减号，括号里的每一项都要变号。把 3x − (x − 2) 化简，写进代数式卡。',
    shelf: ['algebra'],
    build() { const s = W.blank(); R(s, W.add(s, 'algebra', 60, 60, { text: '2', name: '' }), 'card'); return s; },
    predict: null,
    milestones: [
      { id: 'right', say: '代数式卡上是 2x + 2', score: 4, when: polyIs('2x + 2'), why_code: '多项式的值不是数，只能用写法判断',
        hints: ['括号前面是减号，括号里的每一项都要变号。', '−(x − 2) = −x + 2，−2 变成了 +2。', '在代数式卡里写 3x - (x - 2)。'] },
    ],
    traps: [{ id: 'forgot', wrong: '只变了 x 的符号，忘了 −2 也要变号：3x − x − 2 = 2x − 2，不对。', when: polyIs('2x − 2'), why_code: '多项式的值不是数，只能用写法判断' }],
    goal: ['right'],
    why: '3x − (x − 2) = 3x − x + 2 = 2x + 2。括号前是减号，括号里的 x 和 −2 都要变号。',
  });

  // 7.7 实际问题与一元一次方程（核心）：设未知数，列方程
  U.problems.push({
    id: 'g7-equation-word-core', title: '买 3 支笔共 27 元，每支多少钱？', grade: 7, domain: '代数', essence: ['E4', 'E8'], points: ['7.7'], level: 'core', rung: 2,
    alias: ['方程', '应用题', '设未知数'], hook: '设每支笔 x 元，3 支共 27 元。用方程卡写出方程，再接一台解，求出 x。',
    shelf: ['eqcard', 'solve'],
    build() { return W.blank(); },
    predict: null,
    milestones: [
      { id: 'equation', say: '放一张方程卡，把方程写下来', score: 2, when: { count: { type: 'eqcard', ge: 1 } },
        hints: ['要解方程，先要把方程写下来。', '「方程卡」整行写方程，例如 2x + 1 = 7。', '放一张方程卡，写出 3x = 27。'] },
      { id: 'solve', say: '解得 x = 9，每支 9 元', score: 4, when: { type: 'solve', port: 'x', op: '=', value: '9' },
        hints: ['3 支笔的钱是 3x，等于总价 27。', '方程卡里写 3x = 27，再把它接到「解」上。', '3x = 27，两边同除以 3。'] },
    ],
    traps: [], goal: ['solve'],
    why: '设每支笔 x 元，3x = 27，x = 9。列方程的关键是找出等量关系：3 支笔的钱等于总价。',
  });

  // 7.7 实际问题与一元一次方程（陷阱）：移项要变号
  U.problems.push({
    id: 'g7-equation-sign-trap', title: '2x + 5 = 17：移项时 +5 要变号', grade: 7, domain: '代数', essence: ['E4', 'E8'], points: ['7.7'], level: 'trap', rung: 3,
    alias: ['方程', '移项', '变号'], hook: '把 +5 移到右边，它要变成几？算出 x，再用「验根」检查一遍。',
    shelf: ['eqcard', 'eqstep', 'solve', 'eqcheck', 'num'],
    build() { return W.blank(); },
    predict: null,
    milestones: [
      { id: 'equation', say: '放一张方程卡，写出 2x + 5 = 17', score: 2, when: { count: { type: 'eqcard', ge: 1 } },
        hints: ['要解方程，先要把方程写下来。', '「方程卡」整行写方程。', '放一张方程卡，写出 2x + 5 = 17。'] },
      { id: 'solve', say: '解得 x = 6', score: 4, when: { type: 'solve', port: 'x', op: '=', value: '6' },
        hints: ['移项：+5 移到右边要变成 −5。', '2x = 17 − 5 = 12，所以 x = 6。', '把方程卡接到「解」上；也可以先接「变形」：两边同时减 5。'] },
    ],
    traps: [{ id: 'nosign', wrong: '移项时 +5 没有变号，写成了 2x = 17 + 5，解得 x = 11。', when: { type: 'solve', port: 'x', op: '=', value: '11' } }],
    goal: ['solve'],
    why: '2x + 5 = 17，移项得 2x = 17 − 5 = 12，x = 6。移项要变号：+5 移到另一边变成 −5。',
  });

  // 7.8 几何图形（核心）：线段的长度
  U.problems.push({
    id: 'g7-segment-length-core', title: '数轴上点 A 在 2，点 B 在 7：线段 AB 多长？', grade: 7, domain: '图形', essence: ['E5', 'E3'], points: ['7.8'], level: 'core', rung: 2,
    alias: ['线段', '直线', '射线', '长度'], hook: '线段有两个端点。它的长度等于右端点减左端点。用运算器算一算。',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 2 }), 'A'); R(s, W.add(s, 'num', 60, 200, { n: 7 }), 'B'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器，运算选 −', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['求长度要用减法。', '用大数减小数，运算器选 −。', '放一台运算器，运算选 −。'] },
      { id: 'len', say: '线段 AB 长 5', score: 4, when: { type: 'op', port: 'r', op: '=', value: '5' },
        hints: ['长度 = 右端点 − 左端点。', '把 B（7）接甲口，A（2）接乙口。', '甲接 B，乙接 A，运算选 −。'] },
    ],
    traps: [], goal: ['len'],
    why: '线段 AB 的长度 = 7 − 2 = 5。线段的长度是正数，要用右边的点减左边的点。',
  });

  // 7.8 几何图形（陷阱）：线段的和差
  U.problems.push({
    id: 'g7-segment-sum-trap', title: '线段 AB 上有一点 C：AC = 3，CB = 4，AB 多长？', grade: 7, domain: '图形', essence: ['E5', 'E3'], points: ['7.8'], level: 'trap', rung: 3,
    alias: ['线段', '和差', '长度'], hook: '点 C 在线段 AB 上，AB 的长度等于 AC 加 CB。能用减法吗？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 3 }), 'AC'); R(s, W.add(s, 'num', 60, 200, { n: 4 }), 'CB'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['整条线段被点 C 分成两段，要把两段合起来。', '合起来用加法。', '放一台运算器，运算选 +。'] },
      { id: 'whole', say: 'AB 长 7', score: 4, when: { type: 'op', port: 'r', op: '=', value: '7' },
        hints: ['AB = AC + CB。', '把 AC（3）接甲口，CB（4）接乙口。', '甲接 AC，乙接 CB，运算选 +。'] },
    ],
    traps: [{ id: 'minus', wrong: '用减法：3 − 4 = −1，线段的长度不可能是负数。两段要相加。', when: { type: 'op', port: 'r', op: '=', value: '-1' } }],
    goal: ['whole'],
    why: 'AB = AC + CB = 3 + 4 = 7。整条线段等于各部分相加，不能相减。',
  });

  // 7.10 相交线（核心）：邻补角
  U.problems.push({
    id: 'g7-adjacent-angle-core', title: '一个角是 70°，它的邻补角是几度？', grade: 7, domain: '图形', essence: ['E5', 'E3'], points: ['7.10'], level: 'core', rung: 2,
    alias: ['相交线', '邻补角', '互补'], hook: '两条直线相交，一个角是 70°。和它相邻的角合起来是一条直线，也就是 180°。用运算器算出它的邻补角。',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 180 }), 'straight'); R(s, W.add(s, 'num', 60, 200, { n: 70 }), 'a1'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器，运算选 −', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['一条直线是 180°，要从中去掉 70°。', '从 180° 里去掉一部分，用减法。', '放一台运算器，运算选 −。'] },
      { id: 'adj', say: '邻补角是 110°', score: 4, when: { type: 'op', port: 'r', op: '=', value: '110' },
        hints: ['把 180 接甲口，70 接乙口。', '邻补角互补，和为 180°。', '甲接 180，乙接 70，运算选 −。'] },
    ],
    traps: [], goal: ['adj'],
    why: '邻补角的和为 180°，所以 180° − 70° = 110°。',
  });

  // 7.10 相交线（陷阱）：对顶角相等，不互补
  U.problems.push({
    id: 'g7-vertical-angle-trap', title: '对顶角：两个 70° 的角，是相等还是互补？', grade: 7, domain: '图形', essence: ['E5', 'E3'], points: ['7.10'], level: 'trap', rung: 3,
    alias: ['相交线', '对顶角', '相等'], hook: '两条直线相交，形成 4 个角。相对的一对角叫对顶角。对顶角之间是什么关系？用比较器检验。',
    shelf: ['num', 'compare'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 70 }), 'a1'); R(s, W.add(s, 'num', 60, 200, { n: 70 }), 'a3'); return s; },
    predict: null,
    milestones: [
      { id: 'equal', say: '比较结果：两个角相等', score: 4, when: { type: 'compare', port: 'ok', op: '=', value: true },
        hints: ['对顶角有什么关系？', '对顶角相等；互补的是邻补角。', '放一台比较器，关系选“=”，把两个 70 分别接甲口、乙口。'] },
    ],
    traps: [{ id: 'supp', wrong: '用 180° 去减：180 − 70 = 110，那是邻补角，不是对顶角。对顶角直接相等。', when: { type: 'op', port: 'r', op: '=', value: '110' } }],
    goal: ['equal'],
    why: '对顶角相等。两条直线相交时，相对的两个角都是对顶角，大小相同；相邻的角才互补。',
  });

  // 7.11 平行线与平移（核心）：同旁内角互补
  U.problems.push({
    id: 'g7-parallel-sameside-core', title: '两条平行线被截，同旁内角有一个是 65°，另一个是几度？', grade: 7, domain: '图形', essence: ['E5', 'E3'], points: ['7.11'], level: 'core', rung: 2,
    alias: ['平行线', '同旁内角', '互补'], hook: '两条平行线被第三条直线截出一对同旁内角，它们的和是 180°。用运算器算出另一个角。',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 180 }), 'straight'); R(s, W.add(s, 'num', 60, 200, { n: 65 }), 'a'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器，运算选 −', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['同旁内角互补，和为 180°。', '已知一个角，求另一个，用减法。', '放一台运算器，运算选 −。'] },
      { id: 'sup', say: '另一个角是 115°', score: 4, when: { type: 'op', port: 'r', op: '=', value: '115' },
        hints: ['把 180 接甲口，65 接乙口。', '180° − 65° = 115°。', '甲接 180，乙接 65，运算选 −。'] },
    ],
    traps: [], goal: ['sup'],
    why: '两条平行线被截，同旁内角互补：和为 180°，所以另一个角是 180° − 65° = 115°。',
  });

  // 7.11 平行线与平移（陷阱）：平移方向决定加减
  U.problems.push({
    id: 'g7-translate-down-trap', title: '点的纵坐标是 1，向下平移 2 格，变成几？', grade: 7, domain: '图形', essence: ['E5', 'E3'], points: ['7.11'], level: 'trap', rung: 3,
    alias: ['平移', '坐标', '方向'], hook: '图形平移时，向上移纵坐标要加，向下移要减。点向下移 2 格，纵坐标怎么变？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 1 }), 'y'); R(s, W.add(s, 'num', 60, 200, { n: 2 }), 'down'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器，运算选 −', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['向下移，纵坐标变小。', '变小用减法。', '放一台运算器，运算选 −。'] },
      { id: 'moved', say: '纵坐标变成 −1', score: 4, when: { type: 'op', port: 'r', op: '=', value: '-1' },
        hints: ['把 1 接甲口，2 接乙口。', '1 − 2 = −1。', '甲接 1，乙接 2，运算选 −。'] },
    ],
    traps: [{ id: 'up', wrong: '向下平移却用了加法：1 + 2 = 3，那是向上移的结果。', when: { type: 'op', port: 'r', op: '=', value: '3' } }],
    goal: ['moved'],
    why: '向下平移 2 格，纵坐标减 2：1 − 2 = −1。平移只改变一个方向的坐标，另一个方向的坐标不变。',
  });

  // 7.13 平面直角坐标系（核心）：用符号判断象限
  U.problems.push({
    id: 'g7-quadrant-core', title: '点 P(−2, 3) 在第几象限？', grade: 7, domain: '图形', essence: ['E5', 'E3'], points: ['7.13'], level: 'core', rung: 2,
    alias: ['坐标', '象限', '符号'], hook: '横坐标为负、纵坐标为正，点在哪个象限？用比较器把两个坐标分别和 0 比较。',
    shelf: ['num', 'compare'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: -2 }), 'x'); R(s, W.add(s, 'num', 60, 200, { n: 3 }), 'y'); R(s, W.add(s, 'num', 200, 60, { n: 0 }), 'zero'); return s; },
    predict: null,
    milestones: [
      { id: 'sign', say: '放两台比较器', score: 2, when: { count: { type: 'compare', ge: 2 } },
        hints: ['判断符号，就是和 0 比较。', '要两台比较器，一台判断横坐标，一台判断纵坐标。', '放两台比较器，都把 0 接到乙口。'] },
      { id: 'quad', say: '横坐标为负，纵坐标为正：第二象限', score: 4, when: (J) => J.ofType('compare').filter((e) => J.bool(e, 'ok') === true).length >= 2, why_code: '要两台比较器同时成立，数据形式表达不了“两个都成立”',
        hints: ['x 小于 0，纵坐标 y 大于 0。', '第一台比较器：−2 < 0；第二台：3 > 0。', '甲接 −2、乙接 0，关系选 <；甲接 3、乙接 0，关系选 >。'] },
    ],
    traps: [], goal: ['quad'],
    why: '横坐标为负、纵坐标为正的点在第二象限。判断坐标的符号，就是把它和 0 比较。',
  });

  // 7.13 平面直角坐标系（陷阱）：关于 x 轴对称只变纵坐标
  U.problems.push({
    id: 'g7-symmetry-x-axis-trap', title: '点 (3, −2) 关于 x 轴对称的点的纵坐标是几？', grade: 7, domain: '图形', essence: ['E5', 'E3'], points: ['7.13'], level: 'trap', rung: 3,
    alias: ['坐标', '对称', 'x 轴'], hook: '关于 x 轴对称：横坐标不变，纵坐标变成相反数。用运算器算出对称点的纵坐标。',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 3 }), 'x'); R(s, W.add(s, 'num', 60, 200, { n: -2 }), 'y'); R(s, W.add(s, 'num', 200, 60, { n: 0 }), 'zero'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器，运算选 −', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['求相反数，可以用 0 减去它。', '运算器选 −。', '放一台运算器，运算选 −。'] },
      { id: 'sym', say: '对称点的纵坐标是 2', score: 4, when: { type: 'op', port: 'r', op: '=', value: '2' },
        hints: ['把 0 接甲口，−2 接乙口。', '0 − (−2) = 2。', '甲接 0，乙接 −2，运算选 −。'] },
    ],
    traps: [{ id: 'flip-x', wrong: '把横坐标变号了：关于 x 轴对称时，横坐标 3 不变，变号的是纵坐标。', when: { type: 'op', port: 'r', op: '=', value: '-3' } }],
    goal: ['sym'],
    why: '关于 x 轴对称的点，横坐标相同，纵坐标互为相反数。(3, −2) 的对称点是 (3, 2)。',
  });

  // 7.16 统计（核心）：平均数
  U.problems.push({
    id: 'g7-survey-mean-core', title: '5 个同学的身高（厘米）：平均身高是多少？', grade: 7, domain: '统计与概率', essence: ['E7'], points: ['7.16'], level: 'core', rung: 2,
    alias: ['统计', '平均数', '调查'], hook: '调查了 5 个同学的身高：150、152、154、156、158 厘米。用数据表算出平均身高。',
    shelf: ['data'],
    build() { return W.blank(); },
    predict: null,
    milestones: [
      { id: 'put', say: '放一个数据表，输入 5 个数', score: 2, when: { count: { type: 'data', ge: 1 } },
        hints: ['要算平均数，先把数据放进数据表。', '「数据表」可以输入一组数，自动算平均数。', '放一个数据表，在“一组数”里填 150, 152, 154, 156, 158。'] },
      { id: 'avg', say: '平均身高是 154 厘米', score: 4, when: { type: 'data', port: 'mean', op: '=', value: '154' },
        hints: ['平均数 = 所有数相加 ÷ 个数。', '这组数的平均数正好是中间那个数。', '数据表的“一组数”填 150, 152, 154, 156, 158。'] },
    ],
    traps: [], goal: ['avg'],
    why: '平均数 = 总和 ÷ 个数 = (150 + 152 + 154 + 156 + 158) ÷ 5 = 154。',
  });

  // 7.16 统计（陷阱）：平均数不等于中位数
  U.problems.push({
    id: 'g7-survey-median-trap', title: '一组数 1、2、2、3、100 的中位数是几？', grade: 7, domain: '统计与概率', essence: ['E7'], points: ['7.16'], level: 'trap', rung: 3,
    alias: ['统计', '中位数', '平均数', '异常值'], hook: '把数从小到大排好，正中间的那个数是中位数。100 这么大，会影响中位数吗？',
    shelf: ['data'],
    build() { return W.blank(); },
    predict: null,
    milestones: [
      { id: 'put', say: '放一个数据表', score: 2, when: { count: { type: 'data', ge: 1 } },
        hints: ['要找中位数，先把数据放进数据表。', '数据表会同时算出平均数和中位数。', '放一个数据表，“一组数”填 1, 2, 2, 3, 100。'] },
      { id: 'median', say: '中位数是 2', score: 4, when: { type: 'data', port: 'median', op: '=', value: '2' },
        hints: ['先排队：1、2、2、3、100。', '5 个数，正中间的是第 3 个。', '数据表读“中位数”那个输出，应该是 2。'] },
    ],
    traps: [{ id: 'mean', wrong: '把平均数当成中位数：平均数被 100 拉高到 108 ÷ 5 = 21.6，不是中位数。', when: { type: 'data', port: 'mean', op: '=', value: '108/5' } }],
    goal: ['median'],
    why: '排好队是 1、2、2、3、100，正中间是 2，中位数是 2。平均数会被 100 拉高，但中位数不受极端值的影响。',
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
