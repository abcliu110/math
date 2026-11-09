/* 补充题：数对（5.2）、绕点旋转（5.12、9.5）、反比例（9.11）、直线与圆（9.7）。每个知识点一道核心题、一道陷阱题。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;

  // 点是有理数对，数据形式的 when 不比较点，用函数读输出口里的点
  const pointAt = (type, port, x, y) => (w) => w.some(type, (e, d) => {
    const v = d.out[port];
    return !!v && v.kind === 'point' && U.Q.eq(v.data.x, U.Q(x)) && U.Q.eq(v.data.y, U.Q(y));
  });
  const WHY_POINT = '点是一对有理数，数据形式的 when 不能直接比较点的坐标，用函数读输出的点';

  // 5.2 位置：数对先列后行
  U.problems.push({
    id: 'g5-pair-pos-core', title: '数对 (4, 3) 表示的点在哪里？先数列，再数行', grade: 5, domain: '图形', essence: ['E2'], points: ['5.2'], level: 'core', rung: 2,
    alias: ['数对', '位置', '第几列', '第几行'], hook: '教室里的座位常用“第几列、第几行”来表示。第 4 列第 3 行，是哪一个点？',
    shelf: ['pair-pos'],
    build() { return W.blank(); },
    predict: null,
    milestones: [
      { id: 'place', say: '放一台数对器材', score: 2, when: { count: { type: 'pair-pos', ge: 1 } },
        hints: ['这一题要用“数对”器材。', '器材里“第几列”填 4，“第几行”填 3。', '放一台数对，把列设成 4、行设成 3。'] },
      { id: 'point', say: '得到点 (4, 3)', score: 4, when: pointAt('pair-pos', 'p', 4, 3), why_code: WHY_POINT,
        hints: ['数对的顺序是：先列后行。', '看数对器材输出的点，第一个数是列，第二个数是行。', '“第几列”填 4，“第几行”填 3。'] },
    ],
    traps: [], goal: ['point'],
    why: '数对先写列、后写行：第 4 列第 3 行写作 (4, 3)。',
  });

  U.problems.push({
    id: 'g5-pair-pos-trap', title: '第 3 列第 4 行是哪个点？（别和 (4, 3) 混了）', grade: 5, domain: '图形', essence: ['E2'], points: ['5.2'], level: 'trap', rung: 2,
    alias: ['数对', '位置', '列行', '颠倒'], hook: '第 3 列第 4 行和第 4 列第 3 行，是同一个点吗？',
    shelf: ['pair-pos'],
    build() { return W.blank(); },
    predict: null,
    milestones: [
      { id: 'place', say: '放一台数对器材', score: 2, when: { count: { type: 'pair-pos', ge: 1 } },
        hints: ['这一题要用“数对”器材。', '先找第几列，再找第几行。', '放一台数对器材。'] },
      { id: 'point', say: '得到点 (3, 4)', score: 4, when: pointAt('pair-pos', 'p', 3, 4), why_code: WHY_POINT,
        hints: ['数对先写列，再写行。', '第 3 列是 x 的 3，第 4 行是 y 的 4。', '“第几列”填 3，“第几行”填 4。'] },
    ],
    traps: [{ id: 'swap-rc', wrong: '把列和行颠倒，得到了 (4, 3)', when: pointAt('pair-pos', 'p', 4, 3), why_code: WHY_POINT }],
    goal: ['point'],
    why: '第 3 列第 4 行写作 (3, 4)：先数列（3），再数行（4）。(4, 3) 是另一个点。',
  });

  // 5.12 图形的运动（三）：旋转
  U.problems.push({
    id: 'g5-rotate-core', title: '点 (1, 0) 绕原点逆时针转 90°，到了哪里？', grade: 5, domain: '图形', essence: ['E5', 'E3'], points: ['5.12'], level: 'core', rung: 2,
    alias: ['旋转', '逆时针', '绕点', '90°'], hook: '一根小棒的一端在 (1, 0)，绕原点逆时针转 90°，它的另一端会到哪里？',
    shelf: ['pair-pos', 'rotate-about'],
    build() { return W.blank(); },
    predict: null,
    milestones: [
      { id: 'place', say: '放一台绕点旋转器材', score: 2, when: { count: { type: 'rotate-about', ge: 1 } },
        hints: ['这一题要用“绕点旋转”器材。', '点要从数对器材接进来，中心默认是原点。', '放一台绕点旋转，并接一台数对器材（列 1、行 0）。'] },
      { id: 'point', say: '旋转后得到 (0, 1)', score: 4, when: pointAt('rotate-about', 'q', 0, 1), why_code: WHY_POINT,
        hints: ['逆时针转 90°：横坐标和纵坐标互换，再改一个符号。', '看“绕点旋转”的输出，它是转完后的点。', '角度选 90°，中心 (0, 0) 不用改。'] },
    ],
    traps: [], goal: ['point'],
    why: '逆时针转 90°，(x, y) 变成 (−y, x)：(1, 0) 变成 (0, 1)。',
  });

  U.problems.push({
    id: 'g5-rotate-trap', title: '点 (2, 1) 绕 (1, 1) 逆时针转 180°，到了哪里？（中心不是原点）', grade: 5, domain: '图形', essence: ['E5', 'E3'], points: ['5.12'], level: 'trap', rung: 2,
    alias: ['旋转', '中心', '180°', '绕点'], hook: '旋转的中心不一定是原点。先看点和中心的相对位置。',
    shelf: ['pair-pos', 'rotate-about'],
    build() { return W.blank(); },
    predict: null,
    milestones: [
      { id: 'place', say: '放一台绕点旋转器材', score: 2, when: { count: { type: 'rotate-about', ge: 1 } },
        hints: ['这一题要用“绕点旋转”器材。', '中心不是原点，要把“中心 x、中心 y”填上。', '放一台绕点旋转，中心填 (1, 1)，角度选 180°。'] },
      { id: 'point', say: '旋转后得到 (0, 1)', score: 4, when: pointAt('rotate-about', 'q', 0, 1), why_code: WHY_POINT,
        hints: ['先算点相对中心的位置：(2, 1) − (1, 1)。', '转 180°：相对位置的两个数都变成相反数。', '中心 (1, 1) 、角度 180°，接入数对 (2, 1)。'] },
    ],
    traps: [{ id: 'wrong-center', wrong: '答成 (1, 0)：没有以 (1, 1) 为中心，点的位置算错了', when: pointAt('rotate-about', 'q', 1, 0), why_code: WHY_POINT }],
    goal: ['point'],
    why: '先平移到以中心为原点：(2, 1) − (1, 1) = (1, 0)；逆时针转 180° 得 (−1, 0)；再加回中心 (1, 1)，得 (0, 1)。',
  });

  // 9.5 图形的旋转与中心对称
  U.problems.push({
    id: 'g9-rotate-core', title: '点 (3, 1) 关于原点中心对称（绕原点转 180°），新的点是几？', grade: 9, domain: '图形', essence: ['E5', 'E3'], points: ['9.5'], level: 'core', rung: 3,
    alias: ['中心对称', '旋转', '180°', '原点'], hook: '关于原点中心对称，就是绕原点旋转 180°。(3, 1) 对称过去是哪一点？',
    shelf: ['pair-pos', 'rotate-about'],
    build() { return W.blank(); },
    predict: null,
    milestones: [
      { id: 'place', say: '放一台绕点旋转器材', score: 2, when: { count: { type: 'rotate-about', ge: 1 } },
        hints: ['这一题要用“绕点旋转”器材。', '点从数对器材来，角度选 180°。', '放一台绕点旋转，接入数对 (3, 1)。'] },
      { id: 'point', say: '中心对称得到 (−3, −1)', score: 4, when: pointAt('rotate-about', 'q', -3, -1), why_code: WHY_POINT,
        hints: ['转 180°：两个坐标都变成相反数。', '看“绕点旋转”的输出。', '角度选 180°，中心 (0, 0)，接入数对 (3, 1)。'] },
    ],
    traps: [], goal: ['point'],
    why: '绕原点转 180°，(x, y) 变成 (−x, −y)：(3, 1) 变成 (−3, −1)，两个点关于原点对称。',
  });

  U.problems.push({
    id: 'g9-rotate-trap', title: '点 (1, 0) 绕原点逆时针转 90°：点真的会动吗？', grade: 9, domain: '图形', essence: ['E5', 'E3'], points: ['9.5'], level: 'trap', rung: 3,
    alias: ['旋转', '90°', '原点', '旋转角'], hook: '旋转会改变点的位置吗？如果旋转角不是 0°，答案是肯定的。',
    shelf: ['pair-pos', 'rotate-about'],
    build() { return W.blank(); },
    predict: null,
    milestones: [
      { id: 'place', say: '放一台绕点旋转器材', score: 2, when: { count: { type: 'rotate-about', ge: 1 } },
        hints: ['这一题要用“绕点旋转”器材。', '点从数对器材来，中心是原点，角度选 90°。', '放一台绕点旋转，接入数对 (1, 0)。'] },
      { id: 'point', say: '旋转 90° 后得到 (0, 1)', score: 4, when: pointAt('rotate-about', 'q', 0, 1), why_code: WHY_POINT,
        hints: ['逆时针 90°：(x, y) 变成 (−y, x)。', '看“绕点旋转”的输出，它是转完后的点。', '角度 90°，中心 (0, 0)，接入数对 (1, 0)。'] },
    ],
    traps: [{ id: 'no-move', wrong: '以为旋转 90° 后点不动，仍是 (1, 0)', when: pointAt('rotate-about', 'q', 1, 0), why_code: WHY_POINT }],
    goal: ['point'],
    why: '绕原点旋转 90°，(x, y) 变成 (−y, x)：(1, 0) 变成 (0, 1)。只有旋转 0° 或 360° 时点才不动。',
  });

  // 9.11 反比例函数
  U.problems.push({
    id: 'g9-inverse-core', title: 'k = 6，y = 6 / x。x 取 3 时，y 是几？', grade: 9, domain: '函数', essence: ['E3'], points: ['9.11'], level: 'core', rung: 3,
    alias: ['反比例', 'y=k/x', '乘积', '代入'], hook: '反比例函数 y = k / x 中，x 与 y 的乘积 k 是固定的。x 取 3，y 是多少？',
    shelf: ['inverse-prop'],
    build() { return W.blank(); },
    predict: null,
    milestones: [
      { id: 'place', say: '放一台反比例器材', score: 2, when: { count: { type: 'inverse-prop', ge: 1 } },
        hints: ['这一题要用“反比例”器材。', 'k 已经是 6，只要把 x 填成 3。', '放一台反比例器材，x 填 3。'] },
      { id: 'answer', say: '读出 y = 2', score: 4, when: { type: 'inverse-prop', port: 'y', op: '=', value: '2' },
        hints: ['y = k ÷ x，先想想 6 除以 3 是几。', '看“反比例”器材的输出 y。', 'x 填 3，y 就会是 6 ÷ 3。'] },
    ],
    traps: [], goal: ['answer'],
    why: 'y = k / x，k = 6，x = 3，y = 2。',
  });

  U.problems.push({
    id: 'g9-inverse-trap', title: 'y = 6 / x，x 取 −2 时，y 是几？（x 能取 0 吗？）', grade: 9, domain: '函数', essence: ['E3'], points: ['9.11'], level: 'trap', rung: 3,
    alias: ['反比例', 'y=k/x', '负数', '零'], hook: '反比例函数的 x 可以取负数，但不能取 0。试一试 x = −2 时 y 是多少。',
    shelf: ['inverse-prop'],
    build() { return W.blank(); },
    predict: null,
    milestones: [
      { id: 'place', say: '放一台反比例器材', score: 2, when: { count: { type: 'inverse-prop', ge: 1 } },
        hints: ['这一题要用“反比例”器材。', 'k 是 6，x 要填一个负数。', '放一台反比例器材，x 填 −2。'] },
      { id: 'answer', say: '读出 y = −3', score: 4, when: { type: 'inverse-prop', port: 'y', op: '=', value: '-3' },
        hints: ['y = k ÷ x：6 除以一个负数，结果是负数。', '看“反比例”器材的输出 y。', 'x 填 −2，y 就是 6 ÷ (−2)。'] },
    ],
    traps: [{ id: 'zero', wrong: '把 x 填成 0：反比例里 x 不能是 0，器材会拒绝', when: (w) => w.some('inverse-prop', (e, d) => (d.sig || []).some((s) => s.lv === 'reject')), why_code: '拒绝的理由写在信号条里，数据形式的 when 读不到信号条' }],
    goal: ['answer'],
    why: 'y = 6 ÷ (−2) = −3。x 不能为 0，因为 k ÷ 0 没有意义。',
  });

  // 9.7 点、直线和圆的位置关系
  U.problems.push({
    id: 'g9-circle-core', title: '半径 3 的圆，圆心到直线的距离是 5：直线和圆是什么位置关系？', grade: 9, domain: '图形', essence: ['E5', 'E3'], points: ['9.7'], level: 'core', rung: 3,
    alias: ['相离', '相切', '相交', '直线与圆'], hook: '比较圆心到直线的距离 d 和半径 r，就能判断直线和圆的位置关系。',
    shelf: ['circle-line'],
    build() { return W.blank(); },
    predict: null,
    milestones: [
      { id: 'place', say: '放一台直线与圆器材', score: 2, when: { count: { type: 'circle-line', ge: 1 } },
        hints: ['这一题要用“直线与圆”器材。', '半径 r 填 3，圆心到直线的距离 d 填 5。', '放一台直线与圆器材，d 填 5。'] },
      { id: 'answer', say: '判断为相离', score: 4, when: { type: 'circle-line', port: 'rel', op: '=', value: '0' },
        hints: ['d 比 r 大，直线和圆没有公共点。', '看“直线与圆”器材的输出：0 是相离。', 'r 保持 3，d 填 5。'] },
    ],
    traps: [], goal: ['answer'],
    why: 'd = 5 > r = 3，直线和圆相离（没有公共点）。',
  });

  U.problems.push({
    id: 'g9-circle-trap', title: '半径 3，圆心到直线的距离是 3：直线和圆相切还是相交？', grade: 9, domain: '图形', essence: ['E5', 'E3'], points: ['9.7'], level: 'trap', rung: 3,
    alias: ['相切', '相交', '切线', '直线与圆'], hook: 'd 和 r 相等时，直线和圆是什么关系？不要只看“碰到”两个字。',
    shelf: ['circle-line'],
    build() { return W.blank(); },
    predict: null,
    milestones: [
      { id: 'place', say: '放一台直线与圆器材', score: 2, when: { count: { type: 'circle-line', ge: 1 } },
        hints: ['这一题要用“直线与圆”器材。', 'r 填 3，d 填 3，比较两者。', '放一台直线与圆器材。'] },
      { id: 'answer', say: '判断为相切', score: 4, when: { type: 'circle-line', port: 'rel', op: '=', value: '1' },
        hints: ['d 等于 r：直线只碰到圆一次。', '看“直线与圆”器材的输出：1 是相切。', 'r 填 3，d 填 3。'] },
    ],
    traps: [{ id: 'far', wrong: '以为相离（d 比 r 大）', when: { type: 'circle-line', port: 'rel', op: '=', value: '0' } }],
    goal: ['answer'],
    why: 'd = r = 3，直线和圆只有一个公共点，是相切。',
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
