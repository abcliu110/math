/* 缺口补题：6.3 位置与方向（二）各一道核心题、一道陷阱题（器材：数对、绕点旋转）。2.14b 推理暂缺：现有器材没有“排除法 / 谁是谁”的表格，跳过。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;

  // 点是有理数对，数据形式的 when 不比较点，用函数读输出口里的点
  const pointAt = (type, port, x, y) => (w) => w.some(type, (e, d) => {
    const v = d.out[port];
    return !!v && v.kind === 'point' && U.Q.eq(v.data.x, U.Q(x)) && U.Q.eq(v.data.y, U.Q(y));
  });
  const WHY_POINT = '点是一对有理数，数据形式的 when 不能直接比较点的坐标，用函数读输出的点';

  // 6.3 核心：数对先列后行，第 4 列第 3 行是 (4, 3)
  U.problems.push({
    id: 'gap-pair-pos-core', title: '第 4 列第 3 行的点用数对怎么写？', grade: 6, domain: '图形', essence: ['E2'], points: ['6.3'], level: 'core', rung: 2,
    alias: ['数对', '位置', '第几列', '第几行'], hook: '用数对表示位置时，先写第几列，再写第几行。第 4 列第 3 行的点，数对是几？',
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

  // 6.3 陷阱：绕原点逆时针转 90°，(1, 0) 会动到 (0, 1)，不是原地不动
  U.problems.push({
    id: 'gap-rotate-trap', title: '点 (1, 0) 绕原点逆时针转 90°，还在原来的地方吗？', grade: 6, domain: '图形', essence: ['E5', 'E3'], points: ['6.3'], level: 'trap', rung: 2,
    alias: ['旋转', '逆时针', '90°', '原点', '方向'], hook: '从 (1, 0) 出发，绕原点逆时针转 90°，点会停在原处吗？算一算它转到了哪里。',
    shelf: ['pair-pos', 'rotate-about'],
    build() { return W.blank(); },
    predict: null,
    milestones: [
      { id: 'place', say: '放一台绕点旋转器材', score: 2, when: { count: { type: 'rotate-about', ge: 1 } },
        hints: ['这一题要用“绕点旋转”器材。', '点要从数对器材接进来，中心默认是原点。', '放一台绕点旋转，并接一台数对器材（列 1、行 0）。'] },
      { id: 'point', say: '旋转后得到 (0, 1)', score: 4, when: pointAt('rotate-about', 'q', 0, 1), why_code: WHY_POINT,
        hints: ['逆时针转 90°：横坐标和纵坐标互换，再改一个符号。', '看“绕点旋转”的输出，它是转完后的点。', '角度选 90°，中心 (0, 0) 不用改。'] },
    ],
    traps: [{ id: 'no-move', wrong: '以为转 90° 后点不动，仍是 (1, 0)', when: pointAt('rotate-about', 'q', 1, 0), why_code: WHY_POINT }],
    goal: ['point'],
    why: '绕原点逆时针转 90°，(x, y) 变成 (−y, x)：(1, 0) 变成 (0, 1)。点只有转 0° 或 360° 时才不动。',
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
