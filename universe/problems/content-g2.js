/* 二年级内容补充：14 个没有题（或只有 1 道题）的知识点。每点写一道核心题和一道陷阱题；
 * 2.4 只有核心题（器材没有办法表示“比角的大小”和错误的角判断）；2.5 已有核心题（lowgrade.js），只补陷阱题；
 * 2.6 观察物体、2.14b 推理暂缺：现有器材里没有“从前面、侧面、上面看”或“排除法 / 谁是谁”的表格。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const R = (s, id, role) => { s.entities[id].role = role; return id; };

  // 2.1 长度单位、线段（核心）：先把米换成厘米，再相减
  U.problems.push({
    id: 'g2-length-cut-core', title: '一根绳子 2 米，剪下 80 厘米，还剩几厘米？', grade: 2, domain: '图形', essence: ['E3'], points: ['2.1'], level: 'core', rung: 1,
    alias: ['长度单位', '米', '厘米', '换算'], hook: '1 米 = 100 厘米。绳子是按米量的，剪掉的是按厘米量的，先统一单位再减。',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 40, { n: 2, unit: 2 }), 'rope'); R(s, W.add(s, 'num', 60, 150, { n: 100 }), 'hundred'); R(s, W.add(s, 'num', 60, 260, { n: 80, unit: 2 }), 'cut'); return s; },
    predict: null,
    milestones: [
      { id: 'conv', say: '先把 2 米换成 200 厘米', score: 2, when: { type: 'op', port: 'r', op: '=', value: '200' },
        hints: ['1 米是几厘米？2 米是几厘米？', '用运算器做乘法：2 乘 100。', '甲接绳子的 2，乙接 100，运算选 ×，结果是 200。'] },
      { id: 'left', say: '200 厘米减 80 厘米，还剩 120 厘米', score: 4, when: { type: 'op', port: 'r', op: '=', value: '120' },
        hints: ['单位统一以后，再减去剪掉的 80 厘米。', '再放一台运算器：甲接第一步的结果，乙接 80，运算选 −。', '第二台：200 − 80，结果是 120。'] },
    ],
    traps: [], goal: ['left'],
    why: '1 米 = 100 厘米，2 米 = 200 厘米。200 − 80 = 120，所以还剩 120 厘米。先把单位统一，才能相减。',
  });

  // 2.1 长度单位（陷阱）：2 米和 80 厘米不能直接相减
  U.problems.push({
    id: 'g2-length-direct-trap', title: '2 米和 80 厘米，能直接相减吗？', grade: 2, domain: '图形', essence: ['E3'], points: ['2.1'], level: 'trap', rung: 1,
    alias: ['长度单位', '单位不同', '换算'], hook: '绳子长 2 米，剪掉 80 厘米。两个数直接相减，得到的结果对吗？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 40, { n: 2, unit: 2 }), 'rope'); R(s, W.add(s, 'num', 60, 150, { n: 100 }), 'hundred'); R(s, W.add(s, 'num', 60, 260, { n: 80, unit: 2 }), 'cut'); return s; },
    predict: null,
    milestones: [
      { id: 'conv', say: '先把 2 米换成 200 厘米', score: 2, when: { type: 'op', port: 'r', op: '=', value: '200' },
        hints: ['1 米是几厘米？', '用运算器做乘法：2 乘 100。', '甲接绳子的 2，乙接 100，运算选 ×，结果是 200。'] },
      { id: 'left', say: '200 厘米减 80 厘米，还剩 120 厘米', score: 4, when: { type: 'op', port: 'r', op: '=', value: '120' },
        hints: ['单位统一以后，再减 80 厘米。', '再放一台运算器：甲接第一步的结果，乙接 80，运算选 −。', '第二台：200 − 80，结果是 120。'] },
    ],
    traps: [{ id: 'no-convert', wrong: '直接用 2 减 80 得 −78：单位不一样，要先把米换成厘米（2 米 = 200 厘米）。', when: { type: 'op', port: 'r', op: '=', value: '-78' } }],
    goal: ['left'],
    why: '2 和 80 的单位不同，不能直接减。先把 2 米换成 200 厘米，再减 80 厘米，得 120 厘米。',
  });

  // 2.2 100 以内加减法（二）（核心）：两位数加两位数，个位对个位，十位对十位
  U.problems.push({
    id: 'g2-two-digit-add-core', title: '34 加 52 是多少？', grade: 2, domain: '数与运算', essence: ['E2'], points: ['2.2'], level: 'core', rung: 1,
    alias: ['两位数加法', '100以内', '个位', '十位'], hook: '个位和个位相加，十位和十位相加。',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 34 }), 'a'); R(s, W.add(s, 'num', 60, 200, { n: 52 }), 'b'); return s; },
    predict: null,
    milestones: [
      { id: 'put', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['两个两位数合在一起，用加法。', '运算器选 +。', '放一台运算器。'] },
      { id: 'sum', say: '34 + 52 = 86', score: 4, when: { type: 'op', port: 'r', op: '=', value: '86' },
        hints: ['34 放甲口，52 放乙口。', '先算个位 4 + 2 = 6，再算十位 3 + 5 = 8。', '甲接 34，乙接 52，运算选 +，结果是 86。'] },
    ],
    traps: [], goal: ['sum'],
    why: '个位对个位：4 + 2 = 6；十位对十位：3 + 5 = 8。所以 34 + 52 = 86。',
  });

  // 2.2 估算（陷阱）：一律去尾会把估算结果算得太小
  U.problems.push({
    id: 'g2-estimate-trap', title: '估算 47 + 38 大约是多少？', grade: 2, domain: '数与运算', essence: ['E2'], points: ['2.2'], level: 'trap', rung: 1,
    alias: ['估算', '整十数', '近似', '取整'], hook: '估算时，把每个数改成最接近的整十数，再相加。',
    shelf: ['num', 'round', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 47 }), 'a'); R(s, W.add(s, 'num', 60, 200, { n: 38 }), 'b'); return s; },
    predict: null,
    milestones: [
      { id: 'round', say: '把两个数都取整到十位', score: 2, when: { count: { type: 'round', ge: 2 } },
        hints: ['估算就是先把数改成整十数。', '「取整」器材可以设定“精确到”十位。', '放两台取整器，精确到十位，方法选四舍五入。'] },
      { id: 'est', say: '估算的结果是 90', score: 4, when: { type: 'op', port: 'r', op: '=', value: '90' },
        hints: ['47 最接近 50，38 最接近 40。', '把两个整十数相加。', '再放一台运算器：甲接 47 取整后的 50，乙接 38 取整后的 40，选 +，结果是 90。'] },
    ],
    traps: [{ id: 'down', wrong: '一律去尾（47 变成 40，38 变成 30）只得 70，比实际的 85 差得太多。', when: { type: 'op', port: 'r', op: '=', value: '70' } }],
    goal: ['est'],
    why: '估算：47 ≈ 50，38 ≈ 40，50 + 40 = 90，和实际的 85 很接近。一律去尾会得到 70，偏差太大。',
  });

  // 2.3 进位加法（核心）：个位满十进一
  U.problems.push({
    id: 'g2-carry-add-core', title: '46 加 27 是多少？个位要满十进一。', grade: 2, domain: '数与运算', essence: ['E2'], points: ['2.3'], level: 'core', rung: 1,
    alias: ['进位加法', '满十进一', '100以内'], hook: '个位 6 + 7 = 13，要满十进一。',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 46 }), 'a'); R(s, W.add(s, 'num', 60, 200, { n: 27 }), 'b'); return s; },
    predict: null,
    milestones: [
      { id: 'put', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['两个数合在一起，用加法。', '运算器选 +。', '放一台运算器。'] },
      { id: 'sum', say: '46 + 27 = 73', score: 4, when: { type: 'op', port: 'r', op: '=', value: '73' },
        hints: ['先看个位：6 + 7 = 13，写 3，向十位进 1。', '甲接 46，乙接 27，运算选 +。', '结果是 73。'] },
    ],
    traps: [], goal: ['sum'],
    why: '个位 6 + 7 = 13，满十进一，个位写 3；十位 4 + 2 + 1 = 7，所以是 73。',
  });

  // 2.3 退位减法（陷阱）：个位 0 不够减，要从十位借 1
  U.problems.push({
    id: 'g2-borrow-sub-trap', title: '60 减 25 是多少？', grade: 2, domain: '数与运算', essence: ['E2'], points: ['2.3'], level: 'trap', rung: 1,
    alias: ['退位减法', '借位', '100以内'], hook: '60 的个位是 0，不够减 5。该怎么办？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 60 }), 'a'); R(s, W.add(s, 'num', 60, 200, { n: 25 }), 'b'); return s; },
    predict: null,
    milestones: [
      { id: 'put', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['拿走一部分，用减法。', '运算器选 −。', '放一台运算器，选 −。'] },
      { id: 'res', say: '60 − 25 = 35', score: 4, when: { type: 'op', port: 'r', op: '=', value: '35' },
        hints: ['个位 0 不够减 5，要从十位借 1 个十，变成 10 个一。', '十位还剩 5 个十，减去 2 个十，还剩 3 个十。', '甲接 60，乙接 25，运算选 −，结果是 35。'] },
    ],
    traps: [{ id: 'no-borrow', wrong: '个位 0 − 5 直接当成 5，得 45：这是没有借位的错误。正确答案是 35。', when: { type: 'op', port: 'r', op: '=', value: '45' } }],
    goal: ['res'],
    why: '60 − 25：个位 0 不够减 5，从十位借 1（即 10 个一），个位是 10 − 5 = 5；十位 5 − 2 = 3，所以是 35。',
  });

  // 2.4 角的初步认识、直角（核心，只写一道）：三角形的第三个角是直角
  U.problems.push({
    id: 'g2-right-angle-core', title: '三角形里一个角是 30°，另一个角是 45°，要让第三个角是直角，另一个角要改成几度？', grade: 2, domain: '图形', essence: ['E5', 'E3'], points: ['2.4'], level: 'core', rung: 1,
    alias: ['直角', '角', '90度', '三角形的角'], hook: '三角形三个角加起来是 180°。直角是 90°。',
    shelf: ['angles'],
    build() { const s = W.blank(); R(s, W.add(s, 'angles', 60, 60, { A: 30, B: 45 }), 'tri'); return s; },
    predict: null,
    milestones: [
      { id: 'right', say: '第三个角是 90°，就是直角', score: 4, when: { type: 'angles', port: 'C', op: '=', value: '90' },
        hints: ['三角形三个角加起来是 180°，第三个角 = 180° − 30° − 另一个角。', '器材的 B 现在是 45°，试着改成别的度数。', '把 B 改成 60°，第三个角 C 就是 90°，是直角。'] },
    ],
    traps: [], goal: ['right'],
    why: '三角形三个角的和是 180°。第三个角 = 180° − 30° − 60° = 90°，是直角。直角就是 90°。',
  });

  // 2.5 乘法初步认识（陷阱，核心题已在 lowgrade.js）：几个几相加要用乘法
  U.problems.push({
    id: 'g2-times-trap', title: '3 盒，每盒 6 个，一共几个？', grade: 2, domain: '数与运算', essence: ['E1', 'E2'], points: ['2.5'], level: 'trap', rung: 1,
    alias: ['乘法', '几个几', '表内乘法'], hook: '3 个 6 相加，是几？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 6 }), 'each'); R(s, W.add(s, 'num', 60, 200, { n: 3 }), 'boxes'); return s; },
    predict: null,
    milestones: [
      { id: 'put', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['几个几相加，用乘法。', '运算器选 ×。', '放一台运算器，选 ×。'] },
      { id: 'total', say: '一共 18 个', score: 4, when: { type: 'op', port: 'r', op: '=', value: '18' },
        hints: ['3 盒，每盒 6 个：6 + 6 + 6。', '这是 3 个 6 相加，可以写成 3 × 6。', '甲接 6，乙接 3，运算选 ×，结果是 18。'] },
    ],
    traps: [{ id: 'add', wrong: '6 + 3 = 9 是错的：3 个 6 相加要用乘法，不是把 6 和 3 加起来。', when: { type: 'op', port: 'r', op: '=', value: '9' } }],
    goal: ['total'],
    why: '3 盒，每盒 6 个，就是 3 个 6 相加：6 + 6 + 6 = 18，可以写成 3 × 6 = 18。',
  });

  // 2.7 认识时间（核心）：1 时 = 60 分
  U.problems.push({
    id: 'g2-hour-minute-core', title: '2 时 30 分是多少分钟？', grade: 2, domain: '时间与变化', essence: ['E3', 'E1'], points: ['2.7'], level: 'core', rung: 1,
    alias: ['认识时间', '时', '分', '1时=60分'], hook: '1 时等于 60 分。先把 2 时换成分钟，再加上 30 分。',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 40, { n: 2, unit: 7 }), 'hours'); R(s, W.add(s, 'num', 60, 150, { n: 60 }), 'per'); R(s, W.add(s, 'num', 60, 260, { n: 30, unit: 7 }), 'mins'); return s; },
    predict: null,
    milestones: [
      { id: 'hours', say: '2 时 = 120 分', score: 2, when: { type: 'op', port: 'r', op: '=', value: '120' },
        hints: ['1 时等于几分？', '2 时就是 2 个 60 分，用乘法。', '甲接 2，乙接 60，运算选 ×，结果是 120。'] },
      { id: 'all', say: '2 时 30 分 = 150 分', score: 4, when: { type: 'op', port: 'r', op: '=', value: '150' },
        hints: ['再把 30 分加上去。', '再放一台运算器：甲接第一步的 120，乙接 30，运算选 +。', '结果是 150 分。'] },
    ],
    traps: [], goal: ['all'],
    why: '1 时 = 60 分，2 时 = 120 分，再加上 30 分，得 150 分。',
  });

  // 2.7 认识时间（陷阱）：1 时不是 100 分
  U.problems.push({
    id: 'g2-hour-100-trap', title: '3 时是多少分钟？', grade: 2, domain: '时间与变化', essence: ['E3', 'E1'], points: ['2.7'], level: 'trap', rung: 1,
    alias: ['认识时间', '1时=60分', '换算'], hook: '1 时是几分？不是 100 分。',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 3, unit: 7 }), 'hours'); R(s, W.add(s, 'num', 60, 200, { n: 60 }), 'per'); return s; },
    predict: null,
    milestones: [
      { id: 'put', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['把时换成分，要用乘法。', '运算器选 ×。', '放一台运算器，选 ×。'] },
      { id: 'min', say: '3 时 = 180 分', score: 4, when: { type: 'op', port: 'r', op: '=', value: '180' },
        hints: ['1 时是 60 分，不是 100 分。', '甲接 3，乙接 60。', '运算选 ×，结果是 180。'] },
    ],
    traps: [{ id: 'hundred', wrong: '3 × 100 = 300 是错的：1 时是 60 分，不是 100 分。', when: { type: 'op', port: 'r', op: '=', value: '300' } }],
    goal: ['min'],
    why: '1 时 = 60 分，3 时 = 3 × 60 = 180 分。把 1 时当成 100 分，就会算成 300 分。',
  });

  // 2.8 除法初步认识（核心）：平均分
  U.problems.push({
    id: 'g2-divide-share-core', title: '12 个苹果平均分给 3 个小朋友，每人分几个？', grade: 2, domain: '数与运算', essence: ['E7', 'E1'], points: ['2.8'], level: 'core', rung: 1,
    alias: ['除法', '平均分', '口诀'], hook: '平均分，就是看 12 里面有几个 3。',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 12 }), 'apples'); R(s, W.add(s, 'num', 60, 200, { n: 3 }), 'kids'); return s; },
    predict: null,
    milestones: [
      { id: 'put', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['平均分，要用除法。', '运算器选 ÷。', '放一台运算器，选 ÷。'] },
      { id: 'each', say: '每人分到 4 个', score: 4, when: { type: 'op', port: 'r', op: '=', value: '4' },
        hints: ['12 个平均分成 3 份，每份是几个？', '甲接 12，乙接 3，运算选 ÷。', '结果是 4 个。'] },
    ],
    traps: [], goal: ['each'],
    why: '平均分：12 ÷ 3 = 4，每人分到 4 个。12 里面有 4 个 3，所以是 4。',
  });

  // 2.8 除法（陷阱）：被分的数要放在前面
  U.problems.push({
    id: 'g2-divide-order-trap', title: '一根 12 厘米的线，平均剪成 3 段，每段几厘米？', grade: 2, domain: '数与运算', essence: ['E7', 'E1'], points: ['2.8'], level: 'trap', rung: 1,
    alias: ['除法', '平均分', '顺序'], hook: '被分的总长在前，份数在后。',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 3 }), 'segs'); R(s, W.add(s, 'num', 60, 200, { n: 12, unit: 2 }), 'rope'); return s; },
    predict: null,
    milestones: [
      { id: 'put', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['平均分，要用除法。', '运算器选 ÷。', '放一台运算器，选 ÷。'] },
      { id: 'each', say: '每段 4 厘米', score: 4, when: { type: 'op', port: 'r', op: '=', value: '4' },
        hints: ['被分的是总长 12 厘米，份数 3 是除数。', '甲接总长 12，乙接段数 3。', '运算选 ÷，结果是 4 厘米。'] },
    ],
    traps: [{ id: 'swap', wrong: '3 ÷ 12 = 1/4 是把顺序倒过来了：应该用总长 12 ÷ 段数 3。', when: { type: 'op', port: 'r', op: '=', value: '1/4' } }],
    goal: ['each'],
    why: '总长 12 厘米平均分成 3 段，每段 12 ÷ 3 = 4 厘米。除法里被分的数（总数）要写在前面。',
  });

  // 2.9 图形的运动（核心）：沿中间的线对折，两边重合
  U.problems.push({
    id: 'g2-fold-symmetric-core', title: '正方形纸沿中间竖着对折，两边能对齐吗？', grade: 2, domain: '图形', essence: ['E5', 'E3'], points: ['2.9'], level: 'core', rung: 1,
    alias: ['轴对称', '对折', '重合', '对称轴'], hook: '沿中间的线对折，左边和右边会不会重合？',
    shelf: ['fold'],
    build() { const s = W.blank(); R(s, W.add(s, 'fold', 60, 60, { w: 4, ht: 4, fold: 0, angle: 90, offset: 0 }), 'paper'); return s; },
    predict: null,
    milestones: [
      { id: 'same', say: '折一次后，两半完全重合', score: 4, when: { type: 'fold', port: 'same', op: '=', value: '1' },
        hints: ['把「折不折」改成「折一次」。', '折痕竖直（角度 90），并且在正中间（离中心 0）。', '两半完全重合时，「两半重合」会变成 1。'] },
    ],
    traps: [], goal: ['same'],
    why: '正方形沿中间的竖线对折，左右两边的每个点都能对上，两半重合，这就是轴对称。',
  });

  // 2.9 图形的运动（陷阱）：折痕偏了，两边对不齐
  U.problems.push({
    id: 'g2-fold-offset-trap', title: '折痕没有在正中间，两边还能对齐吗？', grade: 2, domain: '图形', essence: ['E5', 'E3'], points: ['2.9'], level: 'trap', rung: 1,
    alias: ['轴对称', '折痕', '对称轴'], hook: '折痕离中心偏了一格，折过去还能对上吗？',
    shelf: ['fold'],
    build() { const s = W.blank(); R(s, W.add(s, 'fold', 60, 60, { w: 4, ht: 4, fold: 1, angle: 90, offset: 1 }), 'paper'); return s; },
    predict: null,
    milestones: [
      { id: 'same', say: '折痕回到中间，两半重合', score: 4, when: { type: 'fold', port: 'same', op: '=', value: '1' },
        hints: ['折痕偏了一格，所以两半对不上。', '把「折痕离中心」改成 0。', '折痕在中间时，「两半重合」是 1。'] },
    ],
    traps: [{ id: 'offset', wrong: '折痕偏离中心，两边对不齐：这不是轴对称，要把折痕移回中间。', when: { type: 'fold', port: 'same', op: '=', value: '0' } }],
    goal: ['same'],
    why: '轴对称要求折痕正好穿过图形的中间。折痕偏了一格，两边就错开，不能重合。',
  });

  // 2.10 混合运算（核心）：先乘后加
  U.problems.push({
    id: 'g2-mixed-core', title: '2 加 3 乘 4，先算哪一步？结果是几？', grade: 2, domain: '数与运算', essence: ['E2'], points: ['2.10'], level: 'core', rung: 1,
    alias: ['混合运算', '先乘除后加减'], hook: '先算乘法，再算加法。',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 40, { n: 2 }), 'two'); R(s, W.add(s, 'num', 60, 150, { n: 3 }), 'three'); R(s, W.add(s, 'num', 60, 260, { n: 4 }), 'four'); return s; },
    predict: null,
    milestones: [
      { id: 'mul', say: '先算 3 × 4 = 12', score: 2, when: { type: 'op', port: 'r', op: '=', value: '12' },
        hints: ['先算乘法：3 乘 4。', '放一台运算器，选 ×，甲接 3，乙接 4。', '结果是 12。'] },
      { id: 'all', say: '再算 2 + 12 = 14', score: 4, when: { type: 'op', port: 'r', op: '=', value: '14' },
        hints: ['最后把 2 和 12 相加。', '再放一台运算器，选 +，甲接 2，乙接第一步的结果 12。', '结果是 14。'] },
    ],
    traps: [], goal: ['all'],
    why: '混合运算先算乘除，再算加减：3 × 4 = 12，2 + 12 = 14。',
  });

  // 2.10 混合运算（陷阱）：有括号先算括号
  U.problems.push({
    id: 'g2-mixed-brackets-trap', title: '(2 + 3) × 4 = ？括号里的要先算', grade: 2, domain: '数与运算', essence: ['E2'], points: ['2.10'], level: 'trap', rung: 1,
    alias: ['混合运算', '小括号', '先算括号'], hook: '括号里的要先算。',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 40, { n: 2 }), 'two'); R(s, W.add(s, 'num', 60, 150, { n: 3 }), 'three'); R(s, W.add(s, 'num', 60, 260, { n: 4 }), 'four'); return s; },
    predict: null,
    milestones: [
      { id: 'in', say: '先算括号里的 2 + 3 = 5', score: 2, when: { type: 'op', port: 'r', op: '=', value: '5' },
        hints: ['括号里的先算。', '放一台运算器，选 +，甲接 2，乙接 3。', '结果是 5。'] },
      { id: 'all', say: '再算 5 × 4 = 20', score: 4, when: { type: 'op', port: 'r', op: '=', value: '20' },
        hints: ['把括号的结果再乘 4。', '再放一台运算器，选 ×：甲接第一步的结果 5，乙接 4。', '结果是 20。'] },
    ],
    traps: [{ id: 'ignore-bracket', wrong: '忘了括号，先算 3 × 4 = 12，再 2 + 12 = 14，这是错的。', when: { type: 'op', port: 'r', op: '=', value: '14' } }],
    goal: ['all'],
    why: '有括号先算括号：2 + 3 = 5，5 × 4 = 20。去掉括号就变成 2 + 3 × 4 = 14，结果不一样。',
  });

  // 2.13 克和千克（核心）：1 千克 = 1000 克
  U.problems.push({
    id: 'g2-kg-to-g-core', title: '2 千克是多少克？', grade: 2, domain: '数与运算', essence: ['E2'], points: ['2.13'], level: 'core', rung: 1,
    alias: ['克', '千克', '1千克=1000克', '换算'], hook: '1 千克 = 1000 克。',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 2, unit: 5 }), 'kg'); R(s, W.add(s, 'num', 60, 200, { n: 1000 }), 'k'); return s; },
    predict: null,
    milestones: [
      { id: 'put', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['千克换成克，要用乘法。', '运算器选 ×。', '放一台运算器，选 ×。'] },
      { id: 'g', say: '2 千克 = 2000 克', score: 4, when: { type: 'op', port: 'r', op: '=', value: '2000' },
        hints: ['1 千克是 1000 克。', '2 千克就是 2 个 1000 克：2 × 1000。', '甲接 2，乙接 1000，运算选 ×，结果是 2000。'] },
    ],
    traps: [], goal: ['g'],
    why: '1 千克 = 1000 克，所以 2 千克 = 2 × 1000 = 2000 克。',
  });

  // 2.13 克和千克（陷阱）：1 千克不是 100 克
  U.problems.push({
    id: 'g2-kg-trap', title: '3 千克是多少克？', grade: 2, domain: '数与运算', essence: ['E2'], points: ['2.13'], level: 'trap', rung: 1,
    alias: ['克', '千克', '换算', '百'], hook: '1 千克是 1000 克，不是 100 克。',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 40, { n: 3, unit: 5 }), 'kg'); R(s, W.add(s, 'num', 60, 150, { n: 1000 }), 'k'); R(s, W.add(s, 'num', 60, 260, { n: 100 }), 'hundred'); return s; },
    predict: null,
    milestones: [
      { id: 'put', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['千克换成克，要用乘法。', '运算器选 ×。', '放一台运算器。'] },
      { id: 'g', say: '3 千克 = 3000 克', score: 4, when: { type: 'op', port: 'r', op: '=', value: '3000' },
        hints: ['1 千克是 1000 克，不是 100 克。', '甲接 3 千克，乙接 1000，运算选 ×。', '结果是 3000 克。'] },
    ],
    traps: [{ id: 'hundred', wrong: '3 × 100 = 300 不对：1 千克是 1000 克，要乘 1000。', when: { type: 'op', port: 'r', op: '=', value: '300' } }],
    goal: ['g'],
    why: '1 千克 = 1000 克，3 千克 = 3 × 1000 = 3000 克。把 1 千克当成 100 克，就会得到 300 克，差了 10 倍。',
  });

  // 2.14a 数据收集整理（核心）：找出出现次数最多的数
  U.problems.push({
    id: 'g2-data-mode-core', title: '5 个同学选的数字是 5、5、2、5、3，哪个数字选的人最多？', grade: 2, domain: '统计与概率', essence: ['E2'], points: ['2.14a'], level: 'core', rung: 1,
    alias: ['数据收集', '整理', '众数', '条形图', '数一数'], hook: '数一数，每个数字出现了几次。',
    shelf: ['data', 'stats'],
    build() { const s = W.blank(); R(s, W.add(s, 'data', 60, 60, { list: '5, 5, 2, 5, 3', lo: 0, hi: 10 }), 'data'); return s; },
    predict: null,
    milestones: [
      { id: 'pick', say: '放一台统计量器材', score: 2, when: { count: { type: 'stats', ge: 1 } },
        hints: ['要找出“最多的是哪个数”，用统计量。', '「统计量」器材的“求什么”选“众数”。', '放一台统计量器材。'] },
      { id: 'mode', say: '选得最多的是 5', score: 4, when: { type: 'stats', port: 'v', op: '=', value: '5' },
        hints: ['数据表的“分布”要接到统计量上。', '统计量的“求什么”选“众数”（出现次数最多的数）。', '数据表的分布接统计量，求什么选众数，结果是 5。'] },
    ],
    traps: [], goal: ['mode'],
    why: '5 出现了 3 次，是出现次数最多的数，所以众数是 5。先数一数每个数出现几次，再找次数最多的。',
  });

  // 2.14a 数据收集整理（陷阱）：问的是次数，不是那个数
  U.problems.push({
    id: 'g2-data-count-trap', title: '数据 5、5、2、5、3 中，出现次数最多的是几次？', grade: 2, domain: '统计与概率', essence: ['E2'], points: ['2.14a'], level: 'trap', rung: 1,
    alias: ['数据', '次数', '数一数'], hook: '问的是“出现了几次”，不是“哪个数”。',
    shelf: ['data', 'stats'],
    build() { const s = W.blank(); R(s, W.add(s, 'data', 60, 60, { list: '5, 5, 2, 5, 3', lo: 0, hi: 10 }), 'data'); return s; },
    predict: null,
    milestones: [
      { id: 'pick', say: '放一台统计量器材', score: 2, when: { count: { type: 'stats', ge: 1 } },
        hints: ['这里问的是出现了几次。', '统计量的“求什么”选“最大次数”。', '数据表的分布接统计量，求什么选最大次数。'] },
      { id: 'times', say: '出现次数最多的是 3 次', score: 4, when: { type: 'stats', port: 'v', op: '=', value: '3' },
        hints: ['先数每个数出现几次：5 有 3 次，2 和 3 各 1 次。', '最多的是几次？', '统计量求“最大次数”，结果是 3。'] },
    ],
    traps: [{ id: 'value', wrong: '5 是那个数，不是次数。问的是出现了几次，答案是 3。', when: { type: 'stats', port: 'v', op: '=', value: '5' } }],
    goal: ['times'],
    why: '数据里 5 出现了 3 次，出现次数最多的是 3 次。“哪个数最多”和“最多出现几次”是两个问题。',
  });

  // 2.15 搭配（一）（核心）：每件上衣配每条裤子，用乘法
  U.problems.push({
    id: 'g2-combo-multiply-core', title: '2 件上衣，配 3 条裤子，一共有几种搭配？', grade: 2, domain: '数与运算', essence: ['E2'], points: ['2.15'], level: 'core', rung: 1,
    alias: ['搭配', '排列组合', '乘法'], hook: '每件上衣都能配每条裤子。',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 2 }), 'tops'); R(s, W.add(s, 'num', 60, 200, { n: 3 }), 'pants'); return s; },
    predict: null,
    milestones: [
      { id: 'put', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['每件上衣都要配每条裤子。', '搭配的种数用乘法。', '放一台运算器，选 ×。'] },
      { id: 'all', say: '一共 6 种搭配', score: 4, when: { type: 'op', port: 'r', op: '=', value: '6' },
        hints: ['2 件上衣，每件配 3 条裤子。', '甲接上衣 2，乙接裤子 3，运算选 ×。', '结果是 6 种。'] },
    ],
    traps: [], goal: ['all'],
    why: '2 件上衣各配 3 条裤子，一共 2 × 3 = 6 种搭配。',
  });

  // 2.15 搭配（陷阱）：不能把两种数量相加
  U.problems.push({
    id: 'g2-combo-add-trap', title: '帽子 3 顶，围巾 2 条，一共有几种搭配？', grade: 2, domain: '数与运算', essence: ['E2'], points: ['2.15'], level: 'trap', rung: 1,
    alias: ['搭配', '乘法', '相加'], hook: '每顶帽子都能配每条围巾。',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 3 }), 'hats'); R(s, W.add(s, 'num', 60, 200, { n: 2 }), 'scarves'); return s; },
    predict: null,
    milestones: [
      { id: 'put', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['每顶帽子配每条围巾，要算几个几。', '搭配用乘法：3 × 2。', '放一台运算器，选 ×。'] },
      { id: 'all', say: '一共 6 种搭配', score: 4, when: { type: 'op', port: 'r', op: '=', value: '6' },
        hints: ['每顶帽子都要和每条围巾各配一次。', '甲接帽子 3，乙接围巾 2，运算选 ×。', '结果是 6 种。'] },
    ],
    traps: [{ id: 'add', wrong: '3 + 2 = 5 是错的：搭配要数每一种组合，要用乘法。', when: { type: 'op', port: 'r', op: '=', value: '5' } }],
    goal: ['all'],
    why: '每顶帽子都能和 2 条围巾各配一次，3 顶帽子就是 3 × 2 = 6 种。把两个数相加只会得到 5，漏掉了很多组合。',
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
