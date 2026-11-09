/* 三年级内容补充：没有题（或题数不足 2）的知识点，每点写一道核心题和一道陷阱题。
 * 3.9 只能用数轴表示东西方向，3.15a（复式统计表）现有器材表示不了，暂缺。3.12 已有 4 道题，不在此列。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const R = (s, id, role) => { s.entities[id].role = role; return id; };

  // 3.1 时、分、秒（核心）：1 时 = 60 分
  U.problems.push({
    id: 'g3-time-hour-minute-core', title: '2 时等于多少分？', grade: 3, domain: '数与运算', essence: ['E3', 'E1'], points: ['3.1'], level: 'core', rung: 1,
    alias: ['时分秒', '时间', '单位换算', '1时=60分'], hook: '1 时等于 60 分。2 时等于多少分？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 2, unit: 7 }), 'h'); R(s, W.add(s, 'num', 60, 200, { n: 60 }), 'sixty'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['2 时换成分，要用乘法：每 1 时有 60 分。', '「运算器」可以做乘法，运算选 ×。', '放一台运算器，运算选 ×。'] },
      { id: 'min', say: '2 时 = 120 分', score: 4, when: { type: 'op', port: 'r', op: '=', value: '120' },
        hints: ['几个 60 分？2 个 60 分。', '把 2 时接甲口，60 接乙口。', '甲接 2（时间），乙接 60，运算选 ×。'] },
    ],
    traps: [], goal: ['min'],
    why: '1 时 = 60 分，所以 2 时 = 2 × 60 = 120 分。换单位时数字会变，时间的长短不变。',
  });

  // 3.1 时、分、秒（陷阱）：时和分不能直接相加
  U.problems.push({
    id: 'g3-time-add-trap', title: '2 时 30 分等于多少分？', grade: 3, domain: '数与运算', essence: ['E3', 'E1'], points: ['3.1'], level: 'trap', rung: 1,
    alias: ['时分秒', '单位', '时和分', '经过时间'], hook: '2 时 30 分里有 2 时和 30 分。先把 2 时换成分，再加上 30 分。一共是多少分？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 40, 60, { n: 2, unit: 7 }), 'h'); R(s, W.add(s, 'num', 40, 200, { n: 30, unit: 7 }), 'm'); R(s, W.add(s, 'num', 40, 340, { n: 60 }), 'sixty'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['先把 2 时换成分，再加 30 分。', '要用两台运算器：先乘，再加。', '放一台运算器，运算选 ×。'] },
      { id: 'total', say: '2 时 30 分 = 150 分', score: 4, when: { type: 'op', port: 'r', op: '=', value: '150' },
        hints: ['2 时是 120 分，再加上 30 分。', '第二台运算器接第一台的结果，运算选 +。', '第一台：2 × 60；第二台：甲接第一台的结果，乙接 30，运算选 +。'] },
    ],
    traps: [{ id: 'add', wrong: '直接 2 + 30 = 32：时和分不能直接相加，要先把 1 时换成 60 分。', when: { type: 'op', port: 'r', op: '=', value: '32' } }],
    goal: ['total'],
    why: '1 时 = 60 分，2 时 = 120 分，再加 30 分得 150 分。时和分是不同的单位，直接相加得到 32，是错的。',
  });

  // 3.2 万以内加减法（核心）：三位数加法，连续进位
  U.problems.push({
    id: 'g3-add-carry-core', title: '367 + 485 等于多少？', grade: 3, domain: '数与运算', essence: ['E2'], points: ['3.2'], level: 'core', rung: 1,
    alias: ['万以内', '加法', '进位', '三位数'], hook: '个位 7 + 5 = 12，要向十位进 1。367 加 485 等于多少？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 367 }), 'a'); R(s, W.add(s, 'num', 60, 200, { n: 485 }), 'b'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['个位、十位、百位分别相加，满十要进位。', '「运算器」默认是加法。', '放一台运算器，运算选 +。'] },
      { id: 'sum', say: '367 + 485 = 852', score: 4, when: { type: 'op', port: 'r', op: '=', value: '852' },
        hints: ['两个数都要接到运算器上。', '甲接 367，乙接 485。', '甲接 367，乙接 485，运算选 +。'] },
    ],
    traps: [], goal: ['sum'],
    why: '367 + 485 = 852。个位 7 + 5 = 12，写 2 进 1；十位 6 + 8 + 1 = 15，写 5 进 1；百位 3 + 4 + 1 = 8。',
  });

  // 3.2 万以内加减法（陷阱）：借位时漏掉百位
  U.problems.push({
    id: 'g3-subtract-zero-trap', title: '300 − 168 等于多少？', grade: 3, domain: '数与运算', essence: ['E2'], points: ['3.2'], level: 'trap', rung: 1,
    alias: ['万以内', '减法', '借位', '中间的 0'], hook: '十位和个位都不够减，要借位。300 减 168 等于多少？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 300 }), 'a'); R(s, W.add(s, 'num', 60, 200, { n: 168 }), 'b'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['大数减小数，拿走一部分，用减法。', '「运算器」可以选减法。', '放一台运算器，运算选 −。'] },
      { id: 'diff', say: '300 − 168 = 132', score: 4, when: { type: 'op', port: 'r', op: '=', value: '132' },
        hints: ['两个数都要接到运算器上，被减数在甲口。', '甲接 300，乙接 168。', '甲接 300，乙接 168，运算选 −。'] },
    ],
    traps: [{ id: 'borrow', wrong: '写成 232：把 168 的百位 1 漏掉了，只减去了 68。', when: { type: 'op', port: 'r', op: '=', value: '232' } }],
    goal: ['diff'],
    why: '300 − 168 = 132。十位是 0，要先从百位借 1 变成 10 个十，再向个位借位。借位时 0 容易被跳过。',
  });

  // 3.3 测量（核心）：1 米 = 100 厘米
  U.problems.push({
    id: 'g3-measure-m-to-cm-core', title: '3 米等于多少厘米？', grade: 3, domain: '图形', essence: ['E3'], points: ['3.3'], level: 'core', rung: 1,
    alias: ['测量', '米', '厘米', '单位换算'], hook: '1 米 = 100 厘米。3 米是多少厘米？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 3, unit: 2 }), 'm'); R(s, W.add(s, 'num', 60, 200, { n: 100 }), 'hundred'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['1 米里有 100 厘米，3 米就是几个 100 厘米？', '「运算器」可以做乘法。', '放一台运算器，运算选 ×。'] },
      { id: 'cm', say: '3 米 = 300 厘米', score: 4, when: { type: 'op', port: 'r', op: '=', value: '300' },
        hints: ['米换成厘米，要乘 100。', '把 3 米接甲口，100 接乙口。', '甲接 3 米，乙接 100，运算选 ×。'] },
    ],
    traps: [], goal: ['cm'],
    why: '1 米 = 100 厘米，所以 3 米 = 3 × 100 = 300 厘米。换单位时要乘或除，长度本身没有变。',
  });

  // 3.3 测量（陷阱）：米和厘米不能直接相加
  U.problems.push({
    id: 'g3-measure-m-cm-trap', title: '1 米 5 厘米是多少厘米？', grade: 3, domain: '图形', essence: ['E3'], points: ['3.3'], level: 'trap', rung: 1,
    alias: ['测量', '米', '厘米', '不能直接相加'], hook: '1 米和 5 厘米合起来是多少厘米？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 40, 60, { n: 1, unit: 2 }), 'm'); R(s, W.add(s, 'num', 40, 200, { n: 5, unit: 2 }), 'cm'); R(s, W.add(s, 'num', 40, 340, { n: 100 }), 'hundred'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['先统一单位：1 米要换成厘米。', '要两台运算器：先换算，再相加。', '放一台运算器，运算选 ×。'] },
      { id: 'total', say: '1 米 5 厘米 = 105 厘米', score: 4, when: { type: 'op', port: 'r', op: '=', value: '105' },
        hints: ['1 米 = 100 厘米，再加上 5 厘米。', '第二台运算器接第一台的结果，运算选 +。', '第一台：1 × 100；第二台：甲接第一台的结果，乙接 5 厘米，运算选 +。'] },
    ],
    traps: [{ id: 'plain', wrong: '直接 1 + 5 = 6：米和厘米是不同的单位，要先换成同一个单位。', when: { type: 'op', port: 'r', op: '=', value: '6' } }],
    goal: ['total'],
    why: '1 米 = 100 厘米，1 米 5 厘米 = 105 厘米。米和厘米不能直接相加，直接加得到 6，是错的。',
  });

  // 3.4 倍的认识（核心）：求一个数的几倍是多少，用乘法
  U.problems.push({
    id: 'g3-times-core', title: '文具盒的钱是铅笔的 4 倍，文具盒多少元？', grade: 3, domain: '数与运算', essence: ['E1'], points: ['3.4'], level: 'core', rung: 1,
    alias: ['倍', '几倍', '求几倍', '乘法'], hook: '铅笔 5 元。文具盒的钱是铅笔的 4 倍。文具盒多少元？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 5, unit: 6 }), 'pencil'); R(s, W.add(s, 'num', 60, 200, { n: 4 }), 'times'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['4 倍就是 4 个 5 元。', '求几倍是多少，用乘法。', '放一台运算器，运算选 ×。'] },
      { id: 'box', say: '文具盒 20 元', score: 4, when: { type: 'op', port: 'r', op: '=', value: '20' },
        hints: ['5 元的 4 倍是多少？', '甲接铅笔的 5 元，乙接倍数 4。', '甲接 5 元，乙接 4，运算选 ×。'] },
    ],
    traps: [], goal: ['box'],
    why: '求一个数的几倍是多少，用乘法：5 × 4 = 20 元。',
  });

  // 3.4 倍的认识（陷阱）：求几倍用除法，不是减法
  U.problems.push({
    id: 'g3-times-trap', title: '12 个是 3 个的几倍？', grade: 3, domain: '数与运算', essence: ['E1'], points: ['3.4'], level: 'trap', rung: 1,
    alias: ['倍', '几倍', '求倍数', '除法'], hook: '12 个是 3 个的几倍？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 12, unit: 1 }), 'big'); R(s, W.add(s, 'num', 60, 200, { n: 3, unit: 1 }), 'small'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['几倍就是看 12 里面有几个 3。', '看有几个一份，要用除法。', '放一台运算器，运算选 ÷。'] },
      { id: 'times', say: '12 是 3 的 4 倍', score: 4, when: { type: 'op', port: 'r', op: '=', value: '4' },
        hints: ['12 里面有几个 3？', '甲接 12，乙接 3。', '甲接 12，乙接 3，运算选 ÷。'] },
    ],
    traps: [{ id: 'minus', wrong: '写成 9：用 12 − 3 求的是“多了几个”，不是几倍。', when: { type: 'op', port: 'r', op: '=', value: '9' } }],
    goal: ['times'],
    why: '12 里面有 4 个 3，所以 12 是 3 的 4 倍。12 − 3 = 9 求的是相差多少，不是倍数。',
  });

  // 3.5 多位数乘一位数（核心）：三位数乘一位数，有进位
  U.problems.push({
    id: 'g3-multi-digit-core', title: '245 × 3 等于多少？', grade: 3, domain: '数与运算', essence: ['E2'], points: ['3.5'], level: 'core', rung: 1,
    alias: ['多位数', '乘一位数', '进位', '三位数'], hook: '三位数乘一位数：个位、十位、百位都要乘 3，满十要进位。245 × 3 等于多少？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 245 }), 'a'); R(s, W.add(s, 'num', 60, 200, { n: 3 }), 'b'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['每一位都要乘 3，满十要向前一位进。', '「运算器」可以做乘法。', '放一台运算器，运算选 ×。'] },
      { id: 'prod', say: '245 × 3 = 735', score: 4, when: { type: 'op', port: 'r', op: '=', value: '735' },
        hints: ['两个数都要接到运算器上。', '甲接 245，乙接 3。', '甲接 245，乙接 3，运算选 ×。'] },
    ],
    traps: [], goal: ['prod'],
    why: '245 × 3：个位 5 × 3 = 15，写 5 进 1；十位 4 × 3 + 1 = 13，写 3 进 1；百位 2 × 3 + 1 = 7。所以是 735。',
  });

  // 3.5 多位数乘一位数（陷阱）：末尾的 0 不能丢
  U.problems.push({
    id: 'g3-zero-place-trap', title: '20 × 4 等于多少？', grade: 3, domain: '数与运算', essence: ['E2'], points: ['3.5'], level: 'trap', rung: 1,
    alias: ['乘一位数', '末尾的 0', '估算', '占位'], hook: '20 是 2 个十，4 个 20 是多少？末尾的 0 不能丢。',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 20 }), 'a'); R(s, W.add(s, 'num', 60, 200, { n: 4 }), 'b'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['20 是 2 个十，4 个 20 就是 8 个十。', '「运算器」可以做乘法。', '放一台运算器，运算选 ×。'] },
      { id: 'prod', say: '20 × 4 = 80', score: 4, when: { type: 'op', port: 'r', op: '=', value: '80' },
        hints: ['两个数都要接到运算器上。', '甲接 20，乙接 4。', '甲接 20，乙接 4，运算选 ×。'] },
    ],
    traps: [{ id: 'drop0', wrong: '写成 8：把十位上的 0 丢掉了。20 × 4 的结果是 8 个十，就是 80。', when: { type: 'op', port: 'r', op: '=', value: '8' } }],
    goal: ['prod'],
    why: '20 × 4 = 80。2 × 4 = 8 个十，就是 80；末尾的 0 不能丢。',
  });

  // 3.6 长方形和正方形（核心）：正方形是长和宽相等的长方形
  U.problems.push({
    id: 'g3-rect-square-core', title: '边长 5 厘米的正方形，周长是多少？', grade: 3, domain: '图形', essence: ['E2'], points: ['3.6'], level: 'core', rung: 1,
    alias: ['长方形', '正方形', '周长', '特征'], hook: '正方形也是长方形，只是长和宽相等。边长 5 厘米的正方形，周长和面积各是多少？',
    shelf: ['rect'],
    build() { const s = W.blank(); R(s, W.add(s, 'rect', 60, 60, { w: 5, h: 3 }), 'r'); return s; },
    predict: null,
    milestones: [
      { id: 'square', say: '长和宽都是 5，面积是 25', score: 2, when: { type: 'rect', port: 'area', op: '=', value: '25' },
        hints: ['正方形的长和宽要一样长。', '把长方形的宽改成 5。', '在长方形器材上，把宽 h 改成 5。'] },
      { id: 'perim', say: '周长是 20 厘米', score: 4, when: { type: 'rect', port: 'perim', op: '=', value: '20' },
        hints: ['周长是四条边加起来。', '看长方形器材的周长输出。', '宽改成 5 之后，周长应该是 20。'] },
    ],
    traps: [], goal: ['perim'],
    why: '正方形的四条边一样长，它是特殊的长方形。周长 = 5 + 5 + 5 + 5 = 20 厘米，面积 = 5 × 5 = 25 平方厘米。',
  });

  // 3.6 长方形和正方形（陷阱）：周长要算四条边
  U.problems.push({
    id: 'g3-rect-perimeter-trap', title: '长 6 厘米、宽 4 厘米的长方形，周长是多少？', grade: 3, domain: '图形', essence: ['E2'], points: ['3.6'], level: 'trap', rung: 1,
    alias: ['长方形', '周长', '四条边', '长和宽'], hook: '长方形的周长要算四条边。长 6 厘米、宽 4 厘米，周长是多少？',
    shelf: ['rect', 'num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'rect', 40, 60, { w: 6, h: 2 }), 'r'); R(s, W.add(s, 'num', 40, 300, { n: 6, unit: 2 }), 'len'); R(s, W.add(s, 'num', 40, 400, { n: 4, unit: 2 }), 'wid'); return s; },
    predict: null,
    milestones: [
      { id: 'set', say: '把宽改成 4', score: 2, when: { type: 'rect', port: 'area', op: '=', value: '24' },
        hints: ['宽要是 4，面积就是 6 × 4。', '面积 = 长 × 宽，这里的宽要改对。', '在长方形器材上，把宽 h 改成 4。'] },
      { id: 'perim', say: '周长是 20 厘米', score: 4, when: { type: 'rect', port: 'perim', op: '=', value: '20' },
        hints: ['四条边：长 + 宽 + 长 + 宽。', '长方形器材直接给出周长，看它的周长输出。', '宽改成 4 以后，周长读数应该是 20。'] },
    ],
    traps: [{ id: 'add2', wrong: '写成 10：6 + 4 只是一条长加一条宽，周长要算四条边。', when: { type: 'op', port: 'r', op: '=', value: '10' } }],
    goal: ['perim'],
    why: '长方形的周长 = (长 + 宽) × 2 = 20 厘米。只加一次长和宽，得到的是半个周长 10 厘米，漏了另外两条边。',
  });

  // 3.7 分数的初步认识（核心）：同分母分数相加
  U.problems.push({
    id: 'g3-fraction-add-core', title: '平均分成 5 份，取 2 份再取 1 份，一共几分之几？', grade: 3, domain: '数与运算', essence: ['E3', 'E1'], points: ['3.7'], level: 'core', rung: 1,
    alias: ['分数', '同分母', '几分之几', '加法'], hook: '把一张纸平均分成 5 份，先取 2 份，再取 1 份。一共取了几分之几？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 2, d: 5 }), 'a'); R(s, W.add(s, 'num', 60, 200, { n: 1, d: 5 }), 'b'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['分母都是 5，分子相加，分母不变。', '「运算器」可以做加法。', '放一台运算器，运算选 +。'] },
      { id: 'sum', say: '2/5 + 1/5 = 3/5', score: 4, when: { type: 'op', port: 'r', op: '=', value: '3/5' },
        hints: ['两个分数都要接到运算器上。', '甲接 2/5，乙接 1/5。', '甲接 2/5，乙接 1/5，运算选 +。'] },
    ],
    traps: [], goal: ['sum'],
    why: '同分母分数相加：分母不变，分子相加。2/5 + 1/5 = 3/5。',
  });

  // 3.7 分数的初步认识（陷阱）：分母不能相加
  U.problems.push({
    id: 'g3-fraction-denom-trap', title: '1/4 加 2/4 等于多少？', grade: 3, domain: '数与运算', essence: ['E3', 'E1'], points: ['3.7'], level: 'trap', rung: 1,
    alias: ['分数', '同分母', '分母不能加', '几分之几'], hook: '一块饼平均分成 4 份，吃了 1 份，又吃了 2 份。一共吃了几分之几？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 1, d: 4 }), 'a'); R(s, W.add(s, 'num', 60, 200, { n: 2, d: 4 }), 'b'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['分母是 4，表示分成了 4 份，份数不会变。', '「运算器」可以做加法。', '放一台运算器，运算选 +。'] },
      { id: 'sum', say: '1/4 + 2/4 = 3/4', score: 4, when: { type: 'op', port: 'r', op: '=', value: '3/4' },
        hints: ['两个分数都要接到运算器上。', '甲接 1/4，乙接 2/4。', '甲接 1/4，乙接 2/4，运算选 +。'] },
    ],
    traps: [{ id: 'denom', wrong: '写成 3/8：分母也加了。分母表示平均分成几份，份数不能相加。', when: { type: 'op', port: 'r', op: '=', value: '3/8' } }],
    goal: ['sum'],
    why: '同分母分数相加，分母不变：1/4 + 2/4 = 3/4。分母是“平均分成几份”，不会因为两块饼而变成 8 份。',
  });

  // 3.8 集合（核心）：两门都喜欢的只数一次
  U.problems.push({
    id: 'g3-set-core', title: '喜欢数学或语文的，一共几人？', grade: 3, domain: '数与运算', essence: ['E2'], points: ['3.8'], level: 'core', rung: 1,
    alias: ['集合', '重叠', '只数一次', '韦恩图'], hook: '喜欢数学的有 20 人，喜欢语文的有 15 人，两门都喜欢的有 8 人。喜欢至少一门的一共几人？两门都喜欢的只数一次。',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 40, 60, { n: 20, unit: 1 }), 'math'); R(s, W.add(s, 'num', 40, 200, { n: 15, unit: 1 }), 'chi'); R(s, W.add(s, 'num', 40, 340, { n: 8, unit: 1 }), 'both'); return s; },
    predict: null,
    milestones: [
      { id: 'only', say: '只喜欢语文的：15 − 8 = 7 人', score: 2, when: { type: 'op', port: 'r', op: '=', value: '7' },
        hints: ['先找只喜欢语文、不喜欢数学的人：语文总人数减去两门都喜欢的。', '运算器选 −：甲接 15，乙接 8。', '甲接语文的 15，乙接两门都喜欢的 8，运算选 −。'] },
      { id: 'total', say: '一共 27 人', score: 4, when: { type: 'op', port: 'r', op: '=', value: '27' },
        hints: ['喜欢数学的 20 人，加上只喜欢语文的 7 人。', '再用一台运算器，把数学的 20 和上一步的 7 相加。', '第二台运算器：甲接数学的 20，乙接上一步的结果，运算选 +。'] },
    ],
    traps: [], goal: ['total'],
    why: '两门都喜欢的 8 人在“数学”和“语文”里各出现一次，只能数一次。只喜欢语文的有 15 − 8 = 7 人，一共 20 + 7 = 27 人。',
  });

  // 3.8 集合（陷阱）：重复的部分要减去
  U.problems.push({
    id: 'g3-set-trap', title: '跑步 12 人，跳绳 9 人，两样都喜欢 5 人，一共几人？', grade: 3, domain: '数与运算', essence: ['E2'], points: ['3.8'], level: 'trap', rung: 1,
    alias: ['集合', '重复', '只数一次', '韦恩图'], hook: '喜欢跑步的 12 人，喜欢跳绳的 9 人，两样都喜欢的 5 人。一共几人？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 40, 60, { n: 12, unit: 1 }), 'run'); R(s, W.add(s, 'num', 40, 200, { n: 9, unit: 1 }), 'rope'); R(s, W.add(s, 'num', 40, 340, { n: 5, unit: 1 }), 'both'); return s; },
    predict: null,
    milestones: [
      { id: 'only', say: '只喜欢跳绳的：9 − 5 = 4 人', score: 2, when: { type: 'op', port: 'r', op: '=', value: '4' },
        hints: ['两样都喜欢的 5 人，已经算在跳绳的 9 人里了。', '运算器选 −：甲接跳绳的 9，乙接两样都喜欢的 5。', '甲接 9，乙接 5，运算选 −。'] },
      { id: 'total', say: '一共 16 人', score: 4, when: { type: 'op', port: 'r', op: '=', value: '16' },
        hints: ['跑步的 12 人，加上只喜欢跳绳的 4 人。', '第二台运算器：甲接跑步的 12，乙接上一步的结果。', '第二台运算器选 +，甲接 12，乙接上一步的 4。'] },
    ],
    traps: [{ id: 'double', wrong: '写成 21：12 + 9 把两样都喜欢的 5 人算了两次。', when: { type: 'op', port: 'r', op: '=', value: '21' } }],
    goal: ['total'],
    why: '两样都喜欢的 5 人只能数一次。只喜欢跳绳的有 9 − 5 = 4 人，一共 12 + 4 = 16 人。直接 12 + 9 = 21 多算了 5 人。',
  });

  // 3.9 位置与方向（核心）：只用数轴表示东西方向
  U.problems.push({
    id: 'g3-direction-east-west-core', title: '先向东走 5 米，再向西走 3 米，现在在哪里？', grade: 3, domain: '图形', essence: ['E2'], points: ['3.9'], level: 'core', rung: 1,
    alias: ['位置', '方向', '东西', '数轴'], hook: '规定向东为正、向西为负，出发点是 0。先向东走 5 米，再向西走 3 米，现在在出发点的哪边，离多远？',
    shelf: ['num', 'op', 'numline'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 40, 60, { n: 5, unit: 2 }), 'east'); R(s, W.add(s, 'num', 40, 200, { n: 3, unit: 2 }), 'west'); R(s, W.add(s, 'numline', 300, 60, { lo: -10, hi: 10, tick: 1 }), 'line'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['向东走 5 米，再向西走 3 米，要用减法。', '「运算器」可以选减法。', '放一台运算器，运算选 −。'] },
      { id: 'pos', say: '现在在出发点东边 2 米', score: 4, when: { type: 'op', port: 'r', op: '=', value: '2' },
        hints: ['东边为正，西边为负。5 米减去 3 米。', '甲接向东的 5，乙接向西的 3，运算选 −。', '甲接 5 米，乙接 3 米，运算选 −；结果可以接到数轴上看位置。'] },
    ],
    traps: [], goal: ['pos'],
    why: '向东记作正，向西记作负：5 − 3 = 2，所以现在在出发点东边 2 米。数轴上 2 在 0 的右边，就是在东边。',
  });

  // 3.9 位置与方向（陷阱）：方向相反要抵消，不能把路程相加
  U.problems.push({
    id: 'g3-direction-back-trap', title: '先向西走 4 米，再向东走 4 米，现在离出发点多远？', grade: 3, domain: '图形', essence: ['E2'], points: ['3.9'], level: 'trap', rung: 1,
    alias: ['位置', '方向', '往回走', '东西'], hook: '规定向东为正、向西为负，出发点是 0。先向西走 4 米，再向东走 4 米，现在在哪里？',
    shelf: ['num', 'op', 'numline'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 40, 60, { n: 0, unit: 2 }), 'origin'); R(s, W.add(s, 'num', 40, 200, { n: 4, unit: 2 }), 'west'); R(s, W.add(s, 'num', 40, 340, { n: 4, unit: 2 }), 'east'); R(s, W.add(s, 'numline', 300, 60, { lo: -10, hi: 10, tick: 1 }), 'line'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['向西为负：从 0 减去 4，到 −4。', '「运算器」可以选减法或加法。', '放一台运算器，运算选 −。'] },
      { id: 'back', say: '回到出发点', score: 4, when: { type: 'op', port: 'r', op: '=', value: '0' },
        hints: ['再向东走 4 米，就是加上 4。', '第二台运算器接第一台的结果，运算选 +。', '第一台：0 − 4 = −4；第二台：甲接 −4，乙接 4，运算选 +。'] },
    ],
    traps: [{ id: 'sum', wrong: '写成 8：把两段路 4 + 4 加起来，忘了向西是负的，方向相反要抵消。', when: { type: 'op', port: 'r', op: '=', value: '8' } }],
    goal: ['back'],
    why: '向西记作负：0 − 4 = −4；再向东走 4 米：−4 + 4 = 0，回到出发点。方向相反的两段路会互相抵消，不能直接把长度加起来。',
  });

  // 3.10 除数是一位数的除法（核心）：平均分
  U.problems.push({
    id: 'g3-divide-core', title: '84 个苹果平均分给 4 个小朋友，每人分几个？', grade: 3, domain: '数与运算', essence: ['E2'], points: ['3.10'], level: 'core', rung: 1,
    alias: ['除法', '一位数', '平均分', '口算'], hook: '84 个苹果平均分成 4 份，每份是几个？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 84 }), 'apples'); R(s, W.add(s, 'num', 60, 200, { n: 4 }), 'kids'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['平均分，就是用除法：总数 ÷ 份数。', '「运算器」可以做除法。', '放一台运算器，运算选 ÷。'] },
      { id: 'each', say: '84 ÷ 4 = 21', score: 4, when: { type: 'op', port: 'r', op: '=', value: '21' },
        hints: ['两个数都要接到运算器上。', '甲接 84，乙接 4。', '甲接 84，乙接 4，运算选 ÷。'] },
    ],
    traps: [], goal: ['each'],
    why: '84 ÷ 4：8 ÷ 4 = 2，4 ÷ 4 = 1，所以 84 ÷ 4 = 21。',
  });

  // 3.10 除数是一位数的除法（陷阱）：商中间的 0 不能漏
  U.problems.push({
    id: 'g3-divide-zero-trap', title: '812 ÷ 4 等于多少？', grade: 3, domain: '数与运算', essence: ['E2'], points: ['3.10'], level: 'trap', rung: 1,
    alias: ['除法', '商中间有 0', '笔算', '占位'], hook: '812 ÷ 4 的商中间有一个 0，别漏掉。',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 812 }), 'a'); R(s, W.add(s, 'num', 60, 200, { n: 4 }), 'b'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['百位 8 ÷ 4 = 2；十位 1 不够除，商写 0；再算个位。', '「运算器」可以做除法。', '放一台运算器，运算选 ÷。'] },
      { id: 'q', say: '812 ÷ 4 = 203', score: 4, when: { type: 'op', port: 'r', op: '=', value: '203' },
        hints: ['两个数都要接到运算器上。', '甲接 812，乙接 4。', '甲接 812，乙接 4，运算选 ÷。'] },
    ],
    traps: [{ id: 'drop0', wrong: '写成 23：商中间的 0 被漏掉了。十位不够除时要写 0 占位。', when: { type: 'op', port: 'r', op: '=', value: '23' } }],
    goal: ['q'],
    why: '812 ÷ 4 = 203。百位 8 ÷ 4 = 2，十位 1 不够除，商 0，个位 12 ÷ 4 = 3。商中间的 0 不能漏。',
  });

  // 3.11 两位数乘两位数（核心）：四格面积模型
  U.problems.push({
    id: 'g3-area-parts-core', title: '23 × 15 拆成四个小积，和是多少？', grade: 3, domain: '数与运算', essence: ['E8', 'E5'], points: ['3.11'], level: 'core', rung: 1,
    alias: ['两位数乘两位数', '面积模型', '拆数', '四格'], hook: '把 23 拆成 20 + 3，15 拆成 10 + 5。四个小积是 20 × 10、20 × 5、3 × 10、3 × 5。它们的和是多少？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 40, 40, { n: 20 }), 't20'); R(s, W.add(s, 'num', 40, 180, { n: 3 }), 't3'); R(s, W.add(s, 'num', 40, 320, { n: 10 }), 'o10'); R(s, W.add(s, 'num', 40, 460, { n: 5 }), 'o5'); return s; },
    predict: null,
    milestones: [
      { id: 'parts', say: '四个小积都算出来', score: 2, when: { count: { type: 'op', ge: 4 } },
        hints: ['每个小积都是两个数相乘。', '运算器选 ×，每个小积用一台。', '四台 ×：20 × 10、20 × 5、3 × 10、3 × 5。'] },
      { id: 'total', say: '和是 345', score: 4, when: { type: 'op', port: 'r', op: '=', value: '345' },
        hints: ['把四个小积的结果依次相加。', '先加两个，再把结果加上第三个，最后加第四个。', '三台 +，依次把 200、100、30、15 加起来。'] },
    ],
    traps: [], goal: ['total'],
    why: '23 × 15 = (20 + 3) × (10 + 5)，拆成四个小积：200 + 100 + 30 + 15 = 345。面积模型就是把两位数乘法拆成几块矩形的面积。',
  });

  // 3.11 两位数乘两位数（陷阱）：竖式第二行要乘 10
  U.problems.push({
    id: 'g3-two-digit-trap', title: '23 × 15 等于多少？第二行别忘了乘 10', grade: 3, domain: '数与运算', essence: ['E8', 'E5'], points: ['3.11'], level: 'trap', rung: 1,
    alias: ['两位数乘两位数', '竖式', '乘 10', '进位'], hook: '竖式里第一行是 23 × 5 = 115；第二行是 23 × 10，要向左移一位。23 × 15 等于多少？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 40, 60, { n: 23 }), 'x'); R(s, W.add(s, 'num', 40, 200, { n: 15 }), 'y'); R(s, W.add(s, 'num', 40, 340, { n: 5 }), 'five'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['两个数相乘，用乘法。', '「运算器」可以选 ×。', '放一台运算器，运算选 ×。'] },
      { id: 'total', say: '23 × 15 = 345', score: 4, when: { type: 'op', port: 'r', op: '=', value: '345' },
        hints: ['直接算两个两位数的乘积。', '甲接 23，乙接 15。', '甲接 23，乙接 15，运算选 ×，结果就是 345。'] },
    ],
    traps: [{ id: 'forget0', wrong: '写成 138：第二行的 23 没有乘 10，直接加上了 23。', when: { type: 'op', port: 'r', op: '=', value: '138' } }],
    goal: ['total'],
    why: '23 × 15 = 345。竖式第二行是 23 × 10 = 230，要补 0。如果第二行没有乘 10，就会得到 115 + 23 = 138，这是错的。',
  });

  // 3.13 年、月、日（核心）：大月、小月和 2 月
  U.problems.push({
    id: 'g3-year-days-core', title: '一年一共有几天？', grade: 3, domain: '数与运算', essence: ['E2'], points: ['3.13'], level: 'core', rung: 1,
    alias: ['年', '月', '大月', '小月', '平年'], hook: '一年有 7 个大月（每月 31 天）、4 个小月（每月 30 天）和 2 月（平年 28 天）。一年一共几天？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 40, 40, { n: 7 }), 'nbig'); R(s, W.add(s, 'num', 40, 180, { n: 31 }), 'big'); R(s, W.add(s, 'num', 40, 320, { n: 4 }), 'nsmall'); R(s, W.add(s, 'num', 40, 460, { n: 30 }), 'small'); R(s, W.add(s, 'num', 240, 40, { n: 28 }), 'feb'); return s; },
    predict: null,
    milestones: [
      { id: 'months', say: '大月、小月的天数都算出来', score: 2, when: { count: { type: 'op', ge: 2 } },
        hints: ['大月的天数 = 大月的个数 × 每月天数。', '两次乘法，分别算大月和小月。', '两台 ×：7 × 31，4 × 30。'] },
      { id: 'total', say: '一年 365 天', score: 4, when: { type: 'op', port: 'r', op: '=', value: '365' },
        hints: ['把大月、小月和 2 月的天数依次相加。', '先加大月和小月，再加 2 月。', '两台 +：217 + 120，再加上 28。'] },
    ],
    traps: [], goal: ['total'],
    why: '7 × 31 = 217，4 × 30 = 120，217 + 120 + 28 = 365。平年 2 月是 28 天，所以一年是 365 天。',
  });

  // 3.13 年、月、日（陷阱）：2 月不是小月
  U.problems.push({
    id: 'g3-year-feb-trap', title: '一年有几天？2 月别当成小月', grade: 3, domain: '数与运算', essence: ['E2'], points: ['3.13'], level: 'trap', rung: 1,
    alias: ['年', '月', '2 月', '平年', '大月小月'], hook: '一年有 7 个大月（31 天）、4 个小月（30 天）和 2 月。平年的 2 月只有 28 天。一年一共几天？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 40, 40, { n: 7 }), 'nbig'); R(s, W.add(s, 'num', 40, 180, { n: 31 }), 'big'); R(s, W.add(s, 'num', 40, 320, { n: 4 }), 'nsmall'); R(s, W.add(s, 'num', 40, 460, { n: 30 }), 'small'); R(s, W.add(s, 'num', 240, 40, { n: 28 }), 'feb'); return s; },
    predict: null,
    milestones: [
      { id: 'months', say: '大月、小月的天数都算出来', score: 2, when: { count: { type: 'op', ge: 2 } },
        hints: ['先算大月的天数，再算小月的天数。', '两次乘法：大月的个数 × 31，小月的个数 × 30。', '两台 ×：7 × 31，4 × 30。'] },
      { id: 'total', say: '一年 365 天', score: 4, when: { type: 'op', port: 'r', op: '=', value: '365' },
        hints: ['2 月单独加上 28 天。', '把前面的结果依次相加。', '两台 +：先 217 + 120，再加上 28。'] },
    ],
    traps: [{ id: 'feb30', wrong: '写成 367：把 2 月当成 30 天的小月，算成了 5 × 30。平年 2 月只有 28 天。', when: { type: 'op', port: 'r', op: '=', value: '367' } }],
    goal: ['total'],
    why: '一年 12 个月：7 个大月、4 个小月、1 个 2 月。平年 2 月只有 28 天，一年是 365 天。如果把 2 月当成小月算，就多出 2 天，得到 367。',
  });

  // 3.14 小数的初步认识（核心）：角和元
  U.problems.push({
    id: 'g3-decimal-jiao-core', title: '3 角加 4 角，是几元？', grade: 3, domain: '数与运算', essence: ['E5', 'E3'], points: ['3.14'], level: 'core', rung: 1,
    alias: ['小数', '元角分', '一位小数', '角'], hook: '10 角 = 1 元。3 角就是 0.3 元，4 角就是 0.4 元。3 角加 4 角是几元？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 3, d: 10, unit: 6 }), 'jiao3'); R(s, W.add(s, 'num', 60, 200, { n: 4, d: 10, unit: 6 }), 'jiao4'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['角和角相加，直接把角的数加起来。', '「运算器」可以做加法，写法选“小数”。', '放一台运算器，运算选 +，结果写法选小数。'] },
      { id: 'sum', say: '3 角 + 4 角 = 0.7 元', score: 4, when: { type: 'op', port: 'r', op: '=', value: '7/10' },
        hints: ['两个数都要接到运算器上。', '甲接 3 角（0.3 元），乙接 4 角（0.4 元）。', '甲接 3/10 元，乙接 4/10 元，运算选 +。'] },
    ],
    traps: [], goal: ['sum'],
    why: '1 角 = 0.1 元。3 角 + 4 角 = 7 角 = 0.7 元。一位小数的分母是 10，可以写成分数，也可以写成小数。',
  });

  // 3.14 小数的初步认识（陷阱）：小数点的位置
  U.problems.push({
    id: 'g3-decimal-trap', title: '1 元 5 角是几元？', grade: 3, domain: '数与运算', essence: ['E5', 'E3'], points: ['3.14'], level: 'trap', rung: 1,
    alias: ['小数', '元角分', '小数点', '角'], hook: '1 元 5 角 = 1 元 + 5 角，5 角是 0.5 元。1 元 5 角写成小数是几元？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 1, unit: 6 }), 'yuan'); R(s, W.add(s, 'num', 60, 200, { n: 5, d: 10, unit: 6 }), 'jiao'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['1 元和 5 角怎么合起来？要先统一成元。', '「运算器」选 +，结果写法选小数。', '放一台运算器，运算选 +，结果写法选小数。'] },
      { id: 'sum', say: '1 元 5 角 = 1.5 元', score: 4, when: { type: 'op', port: 'r', op: '=', value: '1.5' },
        hints: ['5 角是几元？1 角 = 0.1 元。', '把 1 元和 0.5 元相加。', '甲接 1 元，乙接 5/10 元，运算选 +。'] },
    ],
    traps: [{ id: 'point', wrong: '写成 1.05：把 5 角当成了 0.05 元，小数点的位置写错了。', when: { type: 'op', port: 'r', op: '=', value: '1.05' } }],
    goal: ['sum'],
    why: '5 角 = 0.5 元，所以 1 元 5 角 = 1.5 元。5 角不是 0.05 元（0.05 元是 5 分），小数点后第一位才是角。',
  });

  // 3.15b 搭配（二）（核心）：分步计数用乘法
  U.problems.push({
    id: 'g3-combo-core', title: '3 件上衣、4 条裤子、2 双鞋，一共几种搭配？', grade: 3, domain: '数与运算', essence: ['E2'], points: ['3.15b'], level: 'core', rung: 1,
    alias: ['搭配', '乘法原理', '树形图', '分步'], hook: '每件上衣都可以配每条裤子，再配每双鞋。一共有几种不同的搭配？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 40, 60, { n: 3, unit: 1 }), 'shirt'); R(s, W.add(s, 'num', 40, 200, { n: 4, unit: 1 }), 'pants'); R(s, W.add(s, 'num', 40, 340, { n: 2, unit: 1 }), 'shoes'); return s; },
    predict: null,
    milestones: [
      { id: 'pairs', say: '上衣配裤子：3 × 4 = 12 种', score: 2, when: { type: 'op', port: 'r', op: '=', value: '12' },
        hints: ['先看上衣和裤子：每件上衣配 4 条裤子。', '运算器选 ×，甲接上衣 3，乙接裤子 4。', '甲接 3，乙接 4，运算选 ×。'] },
      { id: 'all', say: '再配鞋：12 × 2 = 24 种', score: 4, when: { type: 'op', port: 'r', op: '=', value: '24' },
        hints: ['每一种上衣裤子的搭配，再配 2 双鞋。', '再接一台 ×：甲接上一步的 12，乙接鞋 2。', '第二台 ×：甲接第一台的结果，乙接鞋的 2。'] },
    ],
    traps: [], goal: ['all'],
    why: '分步计数用乘法：3 × 4 = 12 种上衣裤子的搭配，每一种再配 2 双鞋，12 × 2 = 24 种。',
  });

  // 3.15b 搭配（陷阱）：搭配不是相加
  U.problems.push({
    id: 'g3-combo-add-trap', title: '2 件上衣、3 条裤子，一共几种搭配？', grade: 3, domain: '数与运算', essence: ['E2'], points: ['3.15b'], level: 'trap', rung: 1,
    alias: ['搭配', '乘法', '不能相加', '树形图'], hook: '2 件上衣，3 条裤子。每件上衣都能配每条裤子。一共几种搭配？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 2, unit: 1 }), 'shirt'); R(s, W.add(s, 'num', 60, 200, { n: 3, unit: 1 }), 'pants'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['每件上衣都要和每条裤子配一次。', '「运算器」可以选 ×。', '放一台运算器，运算选 ×。'] },
      { id: 'all', say: '一共 6 种搭配', score: 4, when: { type: 'op', port: 'r', op: '=', value: '6' },
        hints: ['两个数都要接到运算器上。', '甲接上衣 2，乙接裤子 3。', '甲接 2，乙接 3，运算选 ×。'] },
    ],
    traps: [{ id: 'plus', wrong: '写成 5：把上衣和裤子的数量加起来了。搭配要每件上衣和每条裤子都配一次，用乘法。', when: { type: 'op', port: 'r', op: '=', value: '5' } }],
    goal: ['all'],
    why: '每件上衣配 3 条裤子，2 件上衣一共 2 × 3 = 6 种搭配。2 + 3 = 5 只是数量的和，不是搭配的种数。',
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
