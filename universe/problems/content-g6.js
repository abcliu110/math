/* 六年级内容补充：14 个没有题的知识点（6.1、6.2、6.5、6.6、6.7a、6.7b、6.8、6.9、6.10、6.11、6.12、6.13）。每点写一道核心题和一道陷阱题（6.5、6.10 已有核心题，只补陷阱题）。
 * 暂缺：6.3 位置与方向（二）——现有器材没有平面坐标或方向距离的器材；6.14 综合与实践——不是单一知识点，留到综合题批次。6.4 比已有 3 道题，不重复写。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const R = (s, id, role) => { s.entities[id].role = role; return id; };

  // 6.1 分数乘法（核心）：2/3 × 3/4
  U.problems.push({
    id: 'g6-frac-mul-core', title: '2/3 乘 3/4 是多少？', grade: 6, domain: '数与运算', essence: ['E3', 'E2'], points: ['6.1'], level: 'core', rung: 2,
    alias: ['分数乘法', '分数', '乘'], hook: '两个分数相乘：分子乘分子，分母乘分母。把 2/3 和 3/4 接进运算器，看结果是几分之几。',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 2, d: 3 }), 'a'); R(s, W.add(s, 'num', 60, 200, { n: 3, d: 4 }), 'b'); return s; },
    predict: null,
    milestones: [
      { id: 'pick', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['两个分数相乘，要用“乘”。', '运算器的运算可以选 ×。', '放一台运算器，运算选 ×。'] },
      { id: 'ans', say: '结果是 1/2', score: 4, when: { type: 'op', port: 'r', op: '=', value: '1/2' },
        hints: ['分子 2 × 3 = 6，分母 3 × 4 = 12。', '把 2/3 接甲口，3/4 接乙口，运算选 ×。', '6/12 约分后是 1/2。'] },
    ],
    traps: [], goal: ['ans'],
    why: '2/3 × 3/4 = (2×3)/(3×4) = 6/12 = 1/2。分数乘法：分子乘分子，分母乘分母，最后能约分就约分。',
  });

  // 6.1 分数乘法（陷阱）：整数乘分数，不要把分母也乘上去
  U.problems.push({
    id: 'g6-frac-mul-trap', title: '3 乘 2/5 是多少？', grade: 6, domain: '数与运算', essence: ['E3', 'E2'], points: ['6.1'], level: 'trap', rung: 3,
    alias: ['分数乘法', '整数乘分数', '分母'], hook: '3 可以看成 3/1。把 3 和 2/5 相乘，要怎么算？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 3, d: 1 }), 'a'); R(s, W.add(s, 'num', 60, 200, { n: 2, d: 5 }), 'b'); return s; },
    predict: null,
    milestones: [
      { id: 'pick', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['这是乘法，不是加法。', '运算器的运算选 ×。', '放一台运算器，运算选 ×。'] },
      { id: 'ans', say: '结果是 6/5', score: 4, when: { type: 'op', port: 'r', op: '=', value: '6/5' },
        hints: ['3 = 3/1，分子 3 × 2 = 6，分母 1 × 5 = 5。', '把 3 接甲口，2/5 接乙口，运算选 ×。', '6/5，也可以写成 1又1/5。'] },
    ],
    traps: [{ id: 'den', wrong: '把分母 5 也乘上了 3，得到 2/5：整数乘分数，分母不变，只乘分子。', when: { type: 'op', port: 'r', op: '=', value: '2/5' } }],
    goal: ['ans'],
    why: '3 × 2/5 = 3/1 × 2/5 = 6/5。整数乘分数只乘分子，分母不变。把分母也乘上去会得到 2/5，结果变小了，不合理。',
  });

  // 6.2 分数除法（核心）：3/4 ÷ 1/2
  U.problems.push({
    id: 'g6-frac-div-core', title: '3/4 除以 1/2 是多少？', grade: 6, domain: '数与运算', essence: ['E3', 'E2'], points: ['6.2'], level: 'core', rung: 2,
    alias: ['分数除法', '倒数', '除'], hook: '除以一个分数，等于乘这个分数的倒数。先把 1/2 的倒数找出来。',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 3, d: 4 }), 'a'); R(s, W.add(s, 'num', 60, 200, { n: 1, d: 2 }), 'b'); return s; },
    predict: null,
    milestones: [
      { id: 'pick', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['这里是除法。', '运算器的运算选 ÷。', '放一台运算器，运算选 ÷。'] },
      { id: 'ans', say: '结果是 3/2', score: 4, when: { type: 'op', port: 'r', op: '=', value: '3/2' },
        hints: ['3/4 ÷ 1/2 = 3/4 × 2/1。', '把 3/4 接甲口，1/2 接乙口，运算选 ÷。', '3/4 ÷ 1/2 = 3/2。'] },
    ],
    traps: [], goal: ['ans'],
    why: '3/4 ÷ 1/2 = 3/4 × 2 = 6/4 = 3/2。除以一个分数，等于乘它的倒数：1/2 的倒数是 2/1。',
  });

  // 6.2 分数除法（陷阱）：除以一个小于 1 的分数，结果会变大
  U.problems.push({
    id: 'g6-frac-div-trap', title: '4 除以 1/3 是多少？', grade: 6, domain: '数与运算', essence: ['E3', 'E2'], points: ['6.2'], level: 'trap', rung: 3,
    alias: ['分数除法', '倒数', '变大'], hook: '4 个苹果，每人分 1/3 个。能分给几个人？结果会比 4 大还是小？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 4, d: 1 }), 'a'); R(s, W.add(s, 'num', 60, 200, { n: 1, d: 3 }), 'b'); return s; },
    predict: null,
    milestones: [
      { id: 'pick', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['这是除法。', '运算器的运算选 ÷。', '放一台运算器，运算选 ÷。'] },
      { id: 'ans', say: '结果是 12', score: 4, when: { type: 'op', port: 'r', op: '=', value: '12' },
        hints: ['除以 1/3 等于乘 3。', '把 4 接甲口，1/3 接乙口，运算选 ÷。', '4 ÷ 1/3 = 4 × 3 = 12。'] },
    ],
    traps: [{ id: 'times', wrong: '4 × 1/3 = 4/3：把除号当成了乘号。除以一个小于 1 的数，结果反而变大。', when: { type: 'op', port: 'r', op: '=', value: '4/3' } }],
    goal: ['ans'],
    why: '4 ÷ 1/3 = 4 × 3 = 12。1/3 的倒数是 3。除以一个小于 1 的数，商比被除数大；4/3 是把除号错当成乘号算的结果。',
  });

  // 6.5 圆（陷阱）：给的是直径，要先除以 2 再当成半径
  U.problems.push({
    id: 'g6-circle-diameter-trap', title: '直径 10 厘米的圆，面积是多少？', grade: 6, domain: '图形', essence: ['E5', 'E3'], points: ['6.5'], level: 'trap', rung: 3,
    alias: ['圆', '直径', '半径', '面积'], hook: '题目给的是直径 10 厘米。圆的器材要填半径，先把它变成半径，再读面积。',
    shelf: ['num', 'circle'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 10 }), 'diam'); R(s, W.add(s, 'circle', 60, 180, { r: 1 }), 'c'); return s; },
    predict: null,
    milestones: [
      { id: 'half', say: '半径设成 5', score: 2, when: (w) => w.some('circle', (e) => e.props.r === 5), why_code: '圆的半径是器材属性，数据形式写不出“属性等于 5”', hints: ['直径是 10，半径是直径的一半。', '把圆的半径属性改成半径的数值。', '半径 r 设成 5。'] },
      { id: 'area', say: '面积 = 78.5（π 取 3.14）', score: 4, when: { role: 'c', port: 'area', op: '=', value: '157/2' }, hints: ['面积 = π × r × r。', '3.14 × 5 × 5。', '78.5 平方厘米。'] },
    ],
    traps: [{ id: 'diam', wrong: '直接把直径 10 当成半径，面积变成 314。半径是直径的一半。', when: { role: 'c', port: 'area', op: '=', value: '314' } }],
    goal: ['area'],
    why: '直径 10 厘米，半径是 5 厘米。面积 = 3.14 × 5 × 5 = 78.5 平方厘米。把直径直接当半径，面积会大 4 倍，变成 314。',
  });

  // 6.6 百分数（核心）：15 是 60 的百分之几
  U.problems.push({
    id: 'g6-percent-part-core', title: '15 是 60 的百分之几？', grade: 6, domain: '数与运算', essence: ['E3'], points: ['6.6'], level: 'core', rung: 2,
    alias: ['百分数', '百分之几', '百分率'], hook: '求一个数是另一个数的百分之几：用前一个数除以后一个数，再化成百分数。',
    shelf: ['num', 'percent'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 15 }), 'a'); R(s, W.add(s, 'num', 60, 200, { n: 60 }), 'b'); return s; },
    predict: null,
    milestones: [
      { id: 'pick', say: '放一台百分数器', score: 2, when: { count: { type: 'percent', ge: 1 } },
        hints: ['百分数的问题要用「百分数」器材。', '器材的“求什么”选“甲是乙的百分之几”。', '放一台百分数器。'] },
      { id: 'ans', say: '15 是 60 的 25%', score: 4, when: { type: 'percent', port: 'r', op: '=', value: '25' },
        hints: ['用 15 除以 60，再乘 100。', '甲接 15，乙接 60，求什么选第一项。', '15 ÷ 60 = 25%。'] },
    ],
    traps: [], goal: ['ans'],
    why: '15 ÷ 60 = 1/4 = 25%。“甲是乙的百分之几”要以乙为标准（除以乙），不是以甲为标准。',
  });

  // 6.6 百分数（陷阱）：多的部分是百分之几，标准是“少的那个数”
  U.problems.push({
    id: 'g6-percent-base-trap', title: '二班 60 人，一班 48 人。二班比一班多百分之几？', grade: 6, domain: '数与运算', essence: ['E3'], points: ['6.6'], level: 'trap', rung: 3,
    alias: ['百分数', '多百分之几', '标准量'], hook: '二班比一班多几人？多的部分是一班人数的百分之几？标准是哪个班？',
    shelf: ['num', 'op', 'percent'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 60 }), 'two'); R(s, W.add(s, 'num', 60, 200, { n: 48 }), 'one'); return s; },
    predict: null,
    milestones: [
      { id: 'diff', say: '二班比一班多 12 人', score: 2, when: { type: 'op', port: 'r', op: '=', value: '12' },
        hints: ['多的人数 = 大数 − 小数。', '运算器选 −，二班 60 接甲，一班 48 接乙。', '60 − 48 = 12。'] },
      { id: 'ans', say: '多 25%（标准是一班的 48 人）', score: 4, when: { type: 'percent', port: 'r', op: '=', value: '25' },
        hints: ['用多的 12 人，除以一班的 48 人。', '百分数器：甲接 12，乙接 48，求什么选“甲是乙的百分之几”。', '12 ÷ 48 = 25%。'] },
    ],
    traps: [{ id: 'over', wrong: '用 60 ÷ 48 = 125%：这是二班是一班的百分之几，不是“多百分之几”。多的部分要先减。', when: { type: 'percent', port: 'r', op: '=', value: '125' } }],
    goal: ['ans'],
    why: '多的部分 = 60 − 48 = 12，标准是一班的 48，所以 12 ÷ 48 = 25%。直接用 60 ÷ 48 得到的 125% 是二班占一班的百分比，要再减去 100% 才是“多百分之几”，而且标准仍是一班。',
  });

  // 6.7a 扇形统计图（核心）：扇形占 25%，圆心角是多少度
  U.problems.push({
    id: 'g6-sector-angle-core', title: '扇形占整个圆的 25%，圆心角是多少度？', grade: 6, domain: '统计与概率', essence: ['E5', 'E3'], points: ['6.7a'], level: 'core', rung: 2,
    alias: ['扇形统计图', '圆心角', '百分比'], hook: '整个圆是 360°。扇形占 25%，它的圆心角就是 360 的 25%。',
    shelf: ['num', 'percent'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 25 }), 'pct'); R(s, W.add(s, 'num', 60, 200, { n: 360 }), 'full'); return s; },
    predict: null,
    milestones: [
      { id: 'pick', say: '放一台百分数器', score: 2, when: { count: { type: 'percent', ge: 1 } },
        hints: ['要求“占 25% 的那部分是多少”，用百分数器。', '“求什么”选“乙的 甲% 是多少”。', '放一台百分数器。'] },
      { id: 'ans', say: '圆心角是 90°', score: 4, when: { type: 'percent', port: 'r', op: '=', value: '90' },
        hints: ['甲接 25（占的百分数），乙接 360（整圆的度数）。', '求什么选“乙的 甲% 是多少”。', '360 × 25% = 90。'] },
    ],
    traps: [], goal: ['ans'],
    why: '扇形统计图里，整个圆是 360°，每一部分的圆心角 = 360° × 它所占的百分数。25% 对应 360 × 25% = 90°。',
  });

  // 6.7a 扇形统计图（陷阱）：以 100 当成整圆，算出的圆心角是 25
  U.problems.push({
    id: 'g6-sector-whole-trap', title: '扇形占 25%，圆心角是多少度？（桌上有一张 100）', grade: 6, domain: '统计与概率', essence: ['E5', 'E3'], points: ['6.7a'], level: 'trap', rung: 3,
    alias: ['扇形统计图', '圆心角', '整圆'], hook: '桌上有一张 100 的卡片。圆心角要用哪个数当整圆？',
    shelf: ['num', 'percent'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 25 }), 'pct'); R(s, W.add(s, 'num', 60, 180, { n: 360 }), 'full'); R(s, W.add(s, 'num', 60, 300, { n: 100 }), 'hundred'); return s; },
    predict: null,
    milestones: [
      { id: 'pick', say: '放一台百分数器', score: 2, when: { count: { type: 'percent', ge: 1 } },
        hints: ['要求圆心角，用百分数器。', '“求什么”选“乙的 甲% 是多少”。', '放一台百分数器。'] },
      { id: 'ans', say: '圆心角是 90°', score: 4, when: { type: 'percent', port: 'r', op: '=', value: '90' },
        hints: ['整圆的度数是 360，不是 100。', '乙接 360，甲接 25。', '360 × 25% = 90。'] },
    ],
    traps: [{ id: 'hundred', wrong: '用 100 当整圆，得到 25°。圆心角的整圆是 360°，100 是百分数的单位，不是圆的度数。', when: { type: 'percent', port: 'r', op: '=', value: '25' } }],
    goal: ['ans'],
    why: '圆心角 = 360° × 25% = 90°。100 只是百分数的标准，不是圆的度数。用 100 算会得到 25°，那是把百分数直接当成了角度。',
  });

  // 6.7b 数与形（核心）：奇数之和是平方数
  U.problems.push({
    id: 'g6-odd-sum-core', title: '前 n 个奇数的和，是多少？', grade: 6, domain: '数与代数', essence: ['E5', 'E3'], points: ['6.7b'], level: 'core', rung: 2,
    alias: ['数与形', '奇数', '平方数', '规律'], hook: '1 = 1，1 + 3 = 4，1 + 3 + 5 = 9，1 + 3 + 5 + 7 = 16。猜一个公式，让猜想器材替你一个个试。',
    shelf: ['conjecture'],
    build() { return W.blank(); },
    predict: null,
    milestones: [
      { id: 'pick', say: '放一台猜想器材', score: 2, when: { count: { type: 'conjecture', ge: 1 } },
        hints: ['要检验一个猜想，用「猜想」器材。', '“要检验的”选“前 n 个奇数的和”。', '放一台猜想器材。'] },
      { id: 'ans', say: '公式对所有试到的 n 都成立', score: 4, when: { type: 'conjecture', port: 'good', op: '=', value: '1' },
        hints: ['和是 1、4、9、16……，是几的平方？', '在“我的公式”里用 n 写，比如 n 乘 n。', '公式填 n*n，器材试过的都对。'] },
    ],
    traps: [], goal: ['ans'],
    why: '前 n 个奇数的和等于 n 的平方：1 = 1²，1+3 = 2²，1+3+5 = 3²。器材只能说“试过的都对”，这是证据；要严格说对所有 n，需要进一步的证明。',
  });

  // 6.7b 数与形（陷阱）：第 n 个奇数 2n−1 不是前 n 个奇数的和
  U.problems.push({
    id: 'g6-odd-sum-trap', title: '有同学说：前 n 个奇数的和就是第 n 个奇数 2n−1。对吗？', grade: 6, domain: '数与代数', essence: ['E5', 'E3'], points: ['6.7b'], level: 'trap', rung: 3,
    alias: ['数与形', '奇数', '猜想', '反例'], hook: '这位同学的公式是 2n−1。用猜想器材试一试：它对 n = 1、2、3 吗？',
    shelf: ['conjecture'],
    build() { return W.blank(); },
    predict: null,
    milestones: [
      { id: 'pick', say: '放一台猜想器材', score: 2, when: { count: { type: 'conjecture', ge: 1 } },
        hints: ['要检验一个说法，用「猜想」器材。', '“要检验的”选“前 n 个奇数的和”。', '放一台猜想器材。'] },
      { id: 'ans', say: '换成对的公式，试过的都对', score: 4, when: { type: 'conjecture', port: 'good', op: '=', value: '1' },
        hints: ['2n−1 在 n = 2 时就错了：和是 4，不是 3。', '公式要算的是“前 n 个”的和，不是第 n 个。', '“我的公式”填 n*n。'] },
    ],
    traps: [{ id: 'last', wrong: '把第 n 个奇数 2n−1 当成前 n 个的和：n = 2 时，器材给出反例 n = 2。', when: { type: 'conjecture', port: 'bad', op: '=', value: '2' } }],
    goal: ['ans'],
    why: '前 2 个奇数的和是 1 + 3 = 4，而 2×2 − 1 = 3，所以 2n−1 不对。一个反例就能推翻一个猜想。正确的规律是 n²。',
  });

  // 6.8 负数（核心）：比较 −3 和 −1
  U.problems.push({
    id: 'g6-negative-order-core', title: '−3℃ 和 −1℃，哪个更冷？', grade: 6, domain: '数与代数', essence: ['E3', 'E1'], points: ['6.8'], level: 'core', rung: 2,
    alias: ['负数', '大小', '比较', '温度'], hook: '在数轴上，越往左越小。−3 和 −1，哪个在左边？',
    shelf: ['num', 'compare'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: -3 }), 'a'); R(s, W.add(s, 'num', 60, 200, { n: -1 }), 'b'); return s; },
    predict: null,
    milestones: [
      { id: 'pick', say: '放一台比较器', score: 2, when: { count: { type: 'compare', ge: 1 } },
        hints: ['比大小要用「比较」器材。', '关系选“<”（小于）。', '放一台比较器。'] },
      { id: 'ans', say: '−3 < −1 成立', score: 4, when: { type: 'compare', port: 'ok', op: '=', value: true },
        hints: ['把 −3 接甲口，−1 接乙口。', '关系选“<”，判断 −3 是否小于 −1。', '甲接 −3，乙接 −1，关系选 <。'] },
    ],
    traps: [], goal: ['ans'],
    why: '−3 比 −1 小，因为 −3 在数轴上离 0 更远、更靠左。温度 −3℃ 比 −1℃ 更冷。',
  });

  // 6.8 负数（陷阱）：−8 和 −2，负数越大，绝对值反而越小
  U.problems.push({
    id: 'g6-negative-order-trap', title: '−8℃ 和 −2℃，哪个温度高？', grade: 6, domain: '数与代数', essence: ['E3', 'E1'], points: ['6.8'], level: 'trap', rung: 3,
    alias: ['负数', '大小', '比较', '绝对值'], hook: '−8 的 8 比 2 大，所以 −8 比 −2 大？数轴上看一看。',
    shelf: ['num', 'compare'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: -8 }), 'a'); R(s, W.add(s, 'num', 60, 200, { n: -2 }), 'b'); return s; },
    predict: null,
    milestones: [
      { id: 'pick', say: '放一台比较器', score: 2, when: { count: { type: 'compare', ge: 1 } },
        hints: ['比大小要用「比较」器材。', '先想想，−8 和 −2，谁在数轴左边。', '放一台比较器。'] },
      { id: 'ans', say: '−8 < −2 成立，−8 温度更低', score: 4, when: { type: 'compare', port: 'ok', op: '=', value: true },
        hints: ['负数里，离 0 越远的越小。', '关系选“<”，甲接 −8，乙接 −2。', '甲接 −8，乙接 −2，关系选 <。'] },
    ],
    traps: [{ id: 'bigger', wrong: '看成 −8 > −2：只比了 8 和 2 的大小，忘了负号让大小反过来。', why_code: '关系符号和结果要一起看，数据形式写不出', when: (w) => w.some('compare', (e) => e.props.op === 2 && w.bool(e, 'ok') === false) }],
    goal: ['ans'],
    why: '负数中，绝对值越大的数越小。−8 在数轴上比 −2 更靠左，所以 −8 < −2，−8℃ 比 −2℃ 更冷。',
  });

  // 6.9 负数运算（核心）：(−3) × (−4)
  U.problems.push({
    id: 'g6-neg-times-core', title: '(−3) × (−4) 等于多少？', grade: 6, domain: '数与运算', essence: ['E2'], points: ['6.9'], level: 'core', rung: 2,
    alias: ['负数', '乘法', '负负得正'], hook: '两个负数相乘，积是正数还是负数？先用运算器试一试。',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: -3 }), 'a'); R(s, W.add(s, 'num', 60, 200, { n: -4 }), 'b'); return s; },
    predict: null,
    milestones: [
      { id: 'pick', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['这是乘法。', '运算器的运算选 ×。', '放一台运算器，运算选 ×。'] },
      { id: 'ans', say: '结果是 12', score: 4, when: { type: 'op', port: 'r', op: '=', value: '12' },
        hints: ['先不看符号，3 × 4 = 12。', '把 −3 接甲口，−4 接乙口，运算选 ×。', '负负得正，结果是 12。'] },
    ],
    traps: [], goal: ['ans'],
    why: '(−3) × (−4) = 12。负负得正：两个负数相乘，积为正。用规律理解：−3 × 2 = −6，−3 × 1 = −3，−3 × 0 = 0，每少乘一个 1，结果就多 3，所以 −3 × (−1) = 3，依此类推 (−3) × (−4) = 12。',
  });

  // 6.9 负数运算（陷阱）：(−6) × (−5)，不是 −30
  U.problems.push({
    id: 'g6-neg-times-trap', title: '(−6) × (−5) 等于多少？', grade: 6, domain: '数与运算', essence: ['E2'], points: ['6.9'], level: 'trap', rung: 3,
    alias: ['负数', '乘法', '负负得正', '符号'], hook: '两个负号相乘，结果的符号怎么定？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: -6 }), 'a'); R(s, W.add(s, 'num', 60, 200, { n: -5 }), 'b'); return s; },
    predict: null,
    milestones: [
      { id: 'pick', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['这是乘法。', '运算器的运算选 ×。', '放一台运算器，运算选 ×。'] },
      { id: 'ans', say: '结果是 30', score: 4, when: { type: 'op', port: 'r', op: '=', value: '30' },
        hints: ['先算 6 × 5。', '把 −6 接甲口，−5 接乙口，运算选 ×。', '负负得正，结果是 30。'] },
    ],
    traps: [{ id: 'neg', wrong: '得到 −30：以为两个负号相乘还是负的。负负得正。', when: { type: 'op', port: 'r', op: '=', value: '-30' } }],
    goal: ['ans'],
    why: '(−6) × (−5) = 30。负数乘负数，积为正；(−6) × 5 = −30 是一个负数乘正数的结果，不能套用到两个负数相乘上。',
  });

  // 6.10 百分数（二）（陷阱）：先涨 20% 再降 20%，不会回到原价
  U.problems.push({
    id: 'g6-percent-rebound-trap', title: '原价 100 元，先涨价 20%，再降价 20%，现价多少？', grade: 6, domain: '数与运算', essence: ['E3'], points: ['6.10'], level: 'trap', rung: 3,
    alias: ['百分数', '涨价', '降价', '折扣', '连续'], hook: '涨了 20%，又降了 20%，是不是又回到 100 元？两次百分数的标准量相同吗？',
    shelf: ['num', 'percent'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 100 }), 'price'); R(s, W.add(s, 'num', 60, 180, { n: 20 }), 'pct'); return s; },
    predict: null,
    milestones: [
      { id: 'up', say: '涨价后是 120 元', score: 2, when: { type: 'percent', port: 'r', op: '=', value: '120' },
        hints: ['涨价：原价 × (1 + 20%)。', '百分数器的“求什么”选“乙增加 甲%”。', '甲接 20，乙接原价 100。'] },
      { id: 'ans', say: '降价后是 96 元', score: 4, when: { type: 'percent', port: 'r', op: '=', value: '96' },
        hints: ['第二次降价的标准量是涨价后的 120，不是 100。', '再接一台百分数器：甲接 20，乙接上一步的结果，求什么选“乙减少 甲%”。', '120 × (1 − 20%) = 96。'] },
    ],
    traps: [{ id: 'back', wrong: '降价还是按 100 算，得到 80 元：两次百分数的标准量不同，要以涨价后的价格为标准。', when: { type: 'percent', port: 'r', op: '=', value: '80' } }],
    goal: ['ans'],
    why: '先涨 20%：100 × 1.2 = 120；再降 20%，标准是 120：120 × 0.8 = 96。两次百分数的标准量不同，所以涨了又降，结果比原价少 4 元。',
  });

  // 6.11 圆柱（核心）：底面半径 2、高 5 的圆柱体积
  U.problems.push({
    id: 'g6-cylinder-volume-core', title: '底面半径 2 厘米、高 5 厘米的圆柱，体积是多少？', grade: 6, domain: '图形', essence: ['E5', 'E3'], points: ['6.11'], level: 'core', rung: 2,
    alias: ['圆柱', '体积', '底面积'], hook: '圆柱的体积 = 底面积 × 高。底面是圆，先用圆的器材算底面积。',
    shelf: ['circle', 'num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'circle', 60, 60, { r: 2 }), 'base'); R(s, W.add(s, 'num', 60, 240, { n: 5 }), 'height'); return s; },
    predict: null,
    milestones: [
      { id: 'pick', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['底面积乘高，要用“乘”。', '运算器的运算选 ×。', '放一台运算器，运算选 ×。'] },
      { id: 'ans', say: '体积是 62.8 立方厘米', score: 4, when: { type: 'op', port: 'r', op: '=', value: '314/5' },
        hints: ['把圆的“面积”输出接到运算器的甲口。', '甲口接圆的面积输出，乙口接高 5。', '3.14 × 2 × 2 = 12.56，再乘 5 得 62.8。'] },
    ],
    traps: [], goal: ['ans'],
    why: '圆柱的体积 = 底面积 × 高 = 3.14 × 2² × 5 = 12.56 × 5 = 62.8 立方厘米。',
  });

  // 6.11 圆锥（陷阱）：圆锥的体积要再除以 3
  U.problems.push({
    id: 'g6-cone-volume-trap', title: '底面半径 3 厘米、高 4 厘米的圆锥，体积是多少？', grade: 6, domain: '图形', essence: ['E5', 'E3'], points: ['6.11'], level: 'trap', rung: 3,
    alias: ['圆锥', '体积', '三分之一'], hook: '和圆柱等底等高时，圆锥的体积是圆柱的几分之几？',
    shelf: ['circle', 'num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'circle', 60, 60, { r: 3 }), 'base'); R(s, W.add(s, 'num', 60, 240, { n: 3 }), 'three'); R(s, W.add(s, 'num', 60, 360, { n: 4 }), 'height'); return s; },
    predict: null,
    milestones: [
      { id: 'pick', say: '放两台运算器', score: 2, when: { count: { type: 'op', ge: 2 } },
        hints: ['圆锥的体积要先算底面积，再乘高，最后要除以 3。', '两步运算，要放两台运算器。', '第一台选 ÷（底面积 ÷ 3），第二台选 ×（乘高）。'] },
      { id: 'ans', say: '体积是 37.68 立方厘米', score: 4, when: { type: 'op', port: 'r', op: '=', value: '942/25' },
        hints: ['先把底面积除以 3，再乘高 4。', '第一台：底面积接甲，3 接乙，运算选 ÷。第二台：第一台结果接甲，高 4 接乙，运算选 ×。', '28.26 ÷ 3 = 9.42，9.42 × 4 = 37.68。'] },
    ],
    traps: [{ id: 'cyl', wrong: '得到 113.04：这是圆柱的体积。圆锥的体积是等底等高圆柱的 1/3，要再除以 3。', when: { type: 'op', port: 'r', op: '=', value: '2826/25' } }],
    goal: ['ans'],
    why: '圆锥的体积 = 1/3 × 底面积 × 高 = 3.14 × 3² × 4 ÷ 3 = 37.68 立方厘米。直接用底面积乘高得到的 113.04 是圆柱的体积，少除了 3。',
  });

  // 6.12 比例（核心）：2 : 3 = x : 9，求 x
  U.problems.push({
    id: 'g6-ratio-cross-core', title: '2 : 3 = x : 9，x 是多少？', grade: 6, domain: '数与运算', essence: ['E3'], points: ['6.12'], level: 'core', rung: 2,
    alias: ['比例', '外项', '内项', '基本性质'], hook: '比例的基本性质：两个外项的积等于两个内项的积。先算 2 × 9，再除以 3。',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 2 }), 'a'); R(s, W.add(s, 'num', 60, 180, { n: 3 }), 'b'); R(s, W.add(s, 'num', 60, 300, { n: 9 }), 'd'); return s; },
    predict: null,
    milestones: [
      { id: 'mul', say: '2 × 9 = 18', score: 2, when: (w) => w.some('op', (e) => e.props.op === 2 && w.num(e, 'r') === 18), why_code: '要区分是哪种运算产生的结果，数据形式无法指定运算符', hints: ['外项是 2 和 9，内项是 3 和 x。', '外项的积 = 内项的积：2 × 9。', '运算器选 ×，甲接 2，乙接 9。'] },
      { id: 'ans', say: 'x = 6', score: 4, when: (w) => w.some('op', (e) => e.props.op === 3 && w.num(e, 'r') === 6), why_code: '要区分是哪种运算产生的结果，数据形式无法指定运算符', hints: ['18 ÷ 3 = x。', '再接一台运算器：甲接上一步的 18，乙接 3，运算选 ÷。', 'x = 18 ÷ 3 = 6。'] },
    ],
    traps: [], goal: ['ans'],
    why: '比例的基本性质：2 × 9 = 3 × x，所以 x = 18 ÷ 3 = 6。检验：2 : 3 = 6 : 9，两个比都化成 2/3。',
  });

  // 6.12 比例（陷阱）：比的差相等，不等于比相等
  U.problems.push({
    id: 'g6-ratio-difference-trap', title: '2 : 3 = x : 9，有同学用差算，x 是多少？', grade: 6, domain: '数与运算', essence: ['E3'], points: ['6.12'], level: 'trap', rung: 3,
    alias: ['比例', '比', '差相等', '基本性质'], hook: '3 比 2 多 1，9 比 x 多几？这样算，比例对不对？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 2 }), 'a'); R(s, W.add(s, 'num', 60, 180, { n: 3 }), 'b'); R(s, W.add(s, 'num', 60, 300, { n: 9 }), 'd'); return s; },
    predict: null,
    milestones: [
      { id: 'mul', say: '2 × 9 = 18', score: 2, when: (w) => w.some('op', (e) => e.props.op === 2 && w.num(e, 'r') === 18), why_code: '要区分是哪种运算产生的结果，数据形式无法指定运算符', hints: ['比例的基本性质是“积”相等，不是“差”相等。', '外项的积：2 × 9。', '运算器选 ×，甲接 2，乙接 9。'] },
      { id: 'ans', say: 'x = 6', score: 4, when: (w) => w.some('op', (e) => e.props.op === 3 && w.num(e, 'r') === 6), why_code: '要区分是哪种运算产生的结果，数据形式无法指定运算符', hints: ['18 ÷ 3 = x。', '再接一台运算器：甲接 18，乙接 3，运算选 ÷。', 'x = 6。'] },
    ],
    traps: [{ id: 'diff', wrong: '用差算成 8：9 − 3 = 6，2 + 6 = 8。比例要看比值或积，不能看差。', when: { type: 'op', port: 'r', op: '=', value: '8' } }],
    goal: ['ans'],
    why: '比例看的是积相等：2 × 9 = 3 × 6，所以 x = 6。用差算（9−3 = 6，2+6 = 8）只是凑出一个“差相等”，比例 2 : 3 = 8 : 9 并不成立，因为 2 : 3 不等于 8 : 9。',
  });

  // 6.13 鸽巢问题（核心）：10 只鸽子放进 3 个笼子，至少有几只在同一个笼子
  U.problems.push({
    id: 'g6-pigeon-core', title: '10 只鸽子飞进 3 个笼子，至少有几只在同一个笼子里？', grade: 6, domain: '数与运算', essence: ['E2'], points: ['6.13'], level: 'core', rung: 2,
    alias: ['鸽巢', '最不利', '平均分', '至少'], hook: '最不利的情况：先把鸽子尽量平均分。剩下的那几只，必然挤到某个笼子里。',
    shelf: ['num', 'divmod', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 10 }), 'pigeons'); R(s, W.add(s, 'num', 60, 180, { n: 3 }), 'cages'); R(s, W.add(s, 'num', 60, 300, { n: 1 }), 'one'); return s; },
    predict: null,
    milestones: [
      { id: 'split', say: '放一台带余除法器', score: 2, when: { count: { type: 'divmod', ge: 1 } },
        hints: ['先算每个笼子平均放几只，还剩几只。', '要用「带余除法」器材。', '放一台带余除法器，鸽子 10 接甲，笼子 3 接乙。'] },
      { id: 'ans', say: '至少有 4 只在同一个笼子里', score: 4, when: { type: 'op', port: 'r', op: '=', value: '4' },
        hints: ['10 ÷ 3 = 3 余 1，商 3 是平均每个笼子的只数。', '余下的 1 只要再放进一个笼子，所以商加 1。', '运算器选 +：商接甲口，1 接乙口。'] },
    ],
    traps: [], goal: ['ans'],
    why: '10 ÷ 3 = 3 余 1。最不利的情况是每个笼子先放 3 只，还剩 1 只，无论放在哪个笼子，那个笼子至少有 3 + 1 = 4 只。',
  });

  // 6.13 鸽巢问题（陷阱）：正好分完时，不要多加 1
  U.problems.push({
    id: 'g6-pigeon-exact-trap', title: '12 只鸽子飞进 3 个笼子，至少有几只在同一个笼子里？', grade: 6, domain: '数与运算', essence: ['E2'], points: ['6.13'], level: 'trap', rung: 3,
    alias: ['鸽巢', '整除', '最不利', '至少'], hook: '12 ÷ 3 正好分完。还要不要再多加 1？',
    shelf: ['num', 'divmod', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 12 }), 'pigeons'); R(s, W.add(s, 'num', 60, 180, { n: 3 }), 'cages'); R(s, W.add(s, 'num', 60, 300, { n: 1 }), 'one'); return s; },
    predict: null,
    milestones: [
      { id: 'split', say: '放一台带余除法器', score: 2, when: { count: { type: 'divmod', ge: 1 } },
        hints: ['先算每个笼子平均放几只，看看有没有剩下。', '要用「带余除法」器材。', '放一台带余除法器，鸽子 12 接甲，笼子 3 接乙。'] },
      { id: 'ans', say: '至少有 4 只在同一个笼子里', score: 4, when: { type: 'divmod', port: 'q', op: '=', value: '4' },
        hints: ['12 ÷ 3 = 4，余数是 0。', '余数是 0，说明正好分完，不需要再加。', '答案就是商：4。'] },
    ],
    traps: [{ id: 'plus', wrong: '答成 5：余数是 0 时，每个笼子正好 4 只，不用再加 1。', when: { type: 'op', port: 'r', op: '=', value: '5' } }],
    goal: ['ans'],
    why: '12 ÷ 3 = 4，余数为 0，正好每个笼子 4 只，所以至少是 4 只。只有余数不为 0 时才需要加 1。',
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
