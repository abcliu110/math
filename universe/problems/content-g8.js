/* 八年级内容补充：没有题（或题少于 2 道）的 8 年级知识点。每点写一道核心题和一道陷阱题；延伸题需要证据 ④，本年级不写。
 * 8.1 与 8.9 只写了核心题：现有器材没有办法做出“常见错误”的台面状态（见 tests/solutions-g8.js 旁的说明和报告）。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const R = (s, id, role) => { s.entities[id].role = role; return id; };

  // 8.1 三角形：多边形内角和 (n−2)×180°（只写核心题）
  U.problems.push({
    id: 'g8-polygon-sum-core', title: '六边形的内角和是多少？', grade: 8, domain: '图形', essence: ['E5', 'E3'], points: ['8.1'], level: 'core', rung: 1,
    alias: ['内角和', '多边形', '三角形'], hook: '多边形可以切成几个三角形。六边形能切成几个？每个三角形的内角和是 180°，它们的内角和一共是多少？',
    shelf: ['polygon'],
    build() { return W.blank(); },
    predict: null,
    milestones: [
      { id: 'put', say: '放一个多边形器材', score: 2, when: { count: { type: 'polygon', ge: 1 } },
        hints: ['要算多边形的内角和，先要一个多边形器材。', '「正多边形」器材可以设定边数。', '放一个多边形器材。'] },
      { id: 'sum', say: '六边形的内角和是 720°', score: 4, when: { type: 'polygon', port: 'sum', op: '=', value: '720' },
        hints: ['六边形能切成几个三角形？每个三角形是 180°。', '边数 n 的多边形内角和是 (n − 2) × 180°，把边数设成 6。', '多边形器材的“几条边”设成 6，内角和就是 720°。'] },
    ],
    traps: [], goal: ['sum'],
    why: '六边形能切成 4 个三角形，内角和 = 4 × 180° = 720°；公式 (6 − 2) × 180° = 720°。',
  });

  // 8.2 全等三角形的判定（核心）：三边对应相等 → 全等
  U.problems.push({
    id: 'g8-congruent-sss-core', title: '这两个三角形全等吗？', grade: 8, domain: '图形', essence: ['E5', 'E3'], points: ['8.2'], level: 'core', rung: 1,
    alias: ['全等', 'SSS', '三边相等'], hook: '两个三角形的三条边分别对应相等，它们就全等。用图形关系器材检查一下。',
    shelf: ['ftri', 'figrel'],
    build() {
      const s = W.blank();
      R(s, W.add(s, 'ftri', 60, 40, {}), 'p');
      R(s, W.add(s, 'ftri', 60, 220, { bx: 0, by: 4, cx: 3, cy: 0 }), 'q');
      return s;
    },
    predict: null,
    milestones: [
      { id: 'put', say: '放一台图形关系器材', score: 2, when: { count: { type: 'figrel', ge: 1 } },
        hints: ['要比较两个图形，先要一台“图形关系”器材。', '图形关系器材有两个输入口：甲和乙。', '放一台图形关系器材。'] },
      { id: 'cong', say: '判断结果：全等', score: 4, when: { type: 'figrel', port: 'cong', op: '=', value: true },
        hints: ['全等要看三组对应边是不是都相等。', '把左边的三角形接到甲口，右边的接到乙口。', '甲接第一个三角形，乙接第二个；“全等”输出为真，就是全等。'] },
    ],
    traps: [], goal: ['cong'],
    why: '甲的三边是 4、3、5（AB = 4，AC = 3，BC = 5），乙的三边也是 4、3、5，三组对应边都相等，所以全等（SSS）。',
  });

  // 8.2 全等三角形的判定（陷阱）：形状相同、大小不同 → 相似，不全等
  U.problems.push({
    id: 'g8-similar-not-congruent-trap', title: '形状一样、大小不同：全等还是相似？', grade: 8, domain: '图形', essence: ['E5', 'E3'], points: ['8.2'], level: 'trap', rung: 2,
    alias: ['全等', '相似', '放大'], hook: '乙三角形的每条边都是甲的 2 倍。它们的形状一样吗？大小一样吗？',
    shelf: ['ftri', 'figrel'],
    build() {
      const s = W.blank();
      R(s, W.add(s, 'ftri', 60, 40, {}), 'p');
      R(s, W.add(s, 'ftri', 60, 220, { bx: 6, by: 0, cx: 0, cy: 8 }), 'q');
      return s;
    },
    predict: null,
    milestones: [
      { id: 'put', say: '放一台图形关系器材', score: 2, when: { count: { type: 'figrel', ge: 1 } },
        hints: ['要比较形状和大小，先要一台“图形关系”器材。', '图形关系器材的甲、乙两口分别接两个三角形。', '放一台图形关系器材。'] },
      { id: 'notcong', say: '形状相同（相似）但大小不同（不全等）', score: 4,
        when: { all: [{ type: 'figrel', port: 'sim', op: '=', value: true }, { type: 'figrel', port: 'cong', op: '=', value: false }] },
        hints: ['先分清两个词：相似看形状，全等看形状和大小。', '把两个三角形分别接到图形关系器材的甲、乙口。', '看“相似”是真、“全等”是假：形状一样，大小不一样。'] },
    ],
    traps: [{ id: 'exact-copy', wrong: '把乙画成和甲一样大：那是全等，不是这题要的相似', when: { type: 'figrel', port: 'cong', op: '=', value: true } }],
    goal: ['notcong'],
    why: '乙的边是甲的 2 倍（3、4、5 对应 6、8、10），形状相同所以相似，但大小不同所以不全等。全等要求形状和大小都一样。',
  });

  // 8.4 等腰三角形（核心）：两腰相等，周长 = 两腰 + 底
  U.problems.push({
    id: 'g8-isosceles-perimeter-core', title: '腰长 5、底边 6 的等腰三角形，周长是多少？', grade: 8, domain: '图形', essence: ['E5', 'E3'], points: ['8.4'], level: 'core', rung: 1,
    alias: ['等腰三角形', '腰', '底边', '周长'], hook: '等腰三角形有两条边一样长，叫作腰。周长就是三条边加起来。',
    shelf: ['tri'],
    build() { return W.blank(); },
    predict: null,
    milestones: [
      { id: 'put', say: '放一个三角形器材', score: 2, when: { count: { type: 'tri', ge: 1 } },
        hints: ['要算三角形的周长，先要一个三角形器材。', '三角形器材有三条边 a、b、c。', '放一个三角形器材。'] },
      { id: 'perim', say: '周长是 16', score: 4, when: { type: 'tri', port: 'perim', op: '=', value: '16' },
        hints: ['等腰三角形有两条边一样长，它们是两条腰。', '三角形器材的 a、b 填腰长，c 填底边。', '把 a、b 设为 5，c 设为 6，周长就是 16。'] },
    ],
    traps: [], goal: ['perim'],
    why: '两条腰 5 + 5，底 6，周长 = 5 + 5 + 6 = 16。三边要能围成三角形：5 + 5 > 6，成立。',
  });

  // 8.4 等腰三角形（陷阱）：底边不能太长，两腰之和必须大于底边
  U.problems.push({
    id: 'g8-isosceles-base-trap', title: '腰长 5 的等腰三角形，底边取 4，周长是多少？', grade: 8, domain: '图形', essence: ['E5', 'E3'], points: ['8.4'], level: 'trap', rung: 2,
    alias: ['等腰三角形', '三边关系', '底边'], hook: '两条腰都是 5，底边该取多少？底边太长就围不成三角形。',
    shelf: ['tri'],
    build() { return W.blank(); },
    predict: null,
    milestones: [
      { id: 'put', say: '放一个三角形器材', score: 2, when: { count: { type: 'tri', ge: 1 } },
        hints: ['要算周长，先要一个三角形器材。', '三角形器材有三条边 a、b、c。', '放一个三角形器材。'] },
      { id: 'perim', say: '周长是 14', score: 4, when: { type: 'tri', port: 'perim', op: '=', value: '14' },
        hints: ['两条腰是 5 和 5，底边要比 5 + 5 = 10 小。', '把 a、b 设为 5，c（底边）设为 4。', '三边 5、5、4，周长是 14。'] },
    ],
    traps: [{ id: 'base-10', wrong: '底边取 10：5 + 5 = 10，两腰之和不大于底边，围不成三角形', when: { type: 'tri', port: 'ok', op: '=', value: false } }],
    goal: ['perim'],
    why: '底边要比两腰之和小：5 + 5 > 底。取 4，周长 = 5 + 5 + 4 = 14。取 10 时两腰之和正好等于底边，三角形压成一条线，围不成。',
  });

  // 8.5 幂的运算（核心）：同底数幂相乘，指数相加
  U.problems.push({
    id: 'g8-power-product-core', title: '2 的 3 次方乘以 2 的 4 次方，是多少？', grade: 8, domain: '数与运算', essence: ['E8', 'E2'], points: ['8.5'], level: 'core', rung: 1,
    alias: ['幂', '同底数幂', '指数'], hook: '2³ × 2⁴。可以先各自算出结果再相乘，也可以先看指数怎么变。',
    shelf: ['num', 'power', 'op'],
    build() {
      const s = W.blank();
      R(s, W.add(s, 'num', 60, 60, { n: 2 }), 'base');
      return s;
    },
    predict: null,
    milestones: [
      { id: 'put', say: '放两台乘方器材', score: 2, when: { count: { type: 'power', ge: 2 } },
        hints: ['两个幂要分别算，就要两台乘方器材。', '「乘方」器材的底数接 2，指数在器材里设定。', '放两台乘方器材，底数都接 2。'] },
      { id: 'prod', say: '2³ × 2⁴ = 128', score: 4, when: { type: 'op', port: 'r', op: '=', value: '128' },
        hints: ['两个幂相乘：先算出各自的结果，再做乘法。', '一台乘方器材指数设 3，另一台设 4；运算器接它们的结果，运算选 ×。', '一台乘方设 3（得 8），一台设 4（得 16），运算器选 ×，结果 128。'] },
    ],
    traps: [], goal: ['prod'],
    why: '2³ × 2⁴ = 8 × 16 = 128 = 2⁷。同底数幂相乘，底数不变、指数相加：3 + 4 = 7。',
  });

  // 8.5 幂的运算（陷阱）：幂的乘方，指数相乘而不是相加
  U.problems.push({
    id: 'g8-power-chain-trap', title: '(2³)²，等于多少？', grade: 8, domain: '数与运算', essence: ['E8', 'E2'], points: ['8.5'], level: 'trap', rung: 2,
    alias: ['幂的乘方', '指数', '乘方'], hook: '先算 2 的 3 次方，结果再平方。注意：这是幂的乘方。',
    shelf: ['num', 'power'],
    build() {
      const s = W.blank();
      R(s, W.add(s, 'num', 60, 60, { n: 2 }), 'base');
      return s;
    },
    predict: null,
    milestones: [
      { id: 'put', say: '放一台乘方器材', score: 2, when: { count: { type: 'power', ge: 1 } },
        hints: ['要算幂的乘方，先要一台乘方器材。', '乘方器材的底数接 2，指数先设 3。', '放一台乘方器材。'] },
      { id: 'six', say: '(2³)² = 64', score: 4, when: { type: 'power', port: 'r', op: '=', value: '64' },
        hints: ['先算 2 的 3 次方，再把结果平方。', '两台乘方器材可以串起来：第一台的结果接到第二台的底数。', '第一台指数设 3，第二台指数设 2；结果 64。'] },
    ],
    traps: [{ id: 'add-exp', wrong: '把指数 3 和 2 相加，算成 2⁵ = 32：幂的乘方是指数相乘，3 × 2 = 6', when: { type: 'power', port: 'r', op: '=', value: '32' } }],
    goal: ['six'],
    why: '(2³)² = 2^(3×2) = 2⁶ = 64。幂的乘方：底数不变，指数相乘。把指数相加得到 2⁵ = 32，是常见错误。',
  });

  // 8.8 分式及其运算（核心）：约分后代入求值
  U.problems.push({
    id: 'g8-fraction-eval-core', title: 'x = 3 时，(x² − 1)/(x − 1) 的值是多少？', grade: 8, domain: '数与运算', essence: ['E8', 'E2'], points: ['8.8'], level: 'core', rung: 1,
    alias: ['分式', '约分', '代入求值'], hook: '分子和分母都含 x。先想想能不能约分，再代入 x = 3。',
    shelf: ['fracnum', 'ratread'],
    build() { return W.blank(); },
    predict: null,
    milestones: [
      { id: 'put', say: '放一张分式卡', score: 2, when: { count: { type: 'fracnum', ge: 1 } },
        hints: ['要表示这个分式，先要一张分式卡。', '分式卡有分子和分母两格，都可以写含 x 的式子。', '放一张分式卡，分子写 x^2 - 1，分母写 x - 1。'] },
      { id: 'val', say: 'x = 3 时的值是 4', score: 4, when: { type: 'ratread', port: 'v', op: '=', value: '4' },
        hints: ['分母 x − 1 在 x = 3 时是 2，不为 0，可以代入。', '分式读数器的 x 设为 3，接在分式卡后面。', '分子 x² − 1 = 8，分母 2，8 ÷ 2 = 4。'] },
    ],
    traps: [], goal: ['val'],
    why: '分子 x² − 1 = (x + 1)(x − 1)，约去公因式 (x − 1) 得 x + 1；x = 3 时值为 4，直接代入 8 ÷ 2 也是 4。',
  });

  // 8.8 分式及其运算（陷阱）：不能把分子、分母的单项分别约掉
  U.problems.push({
    id: 'g8-fraction-cancel-trap', title: 'x = 4 时，(x² − 1)/(x − 1) 的值是多少？', grade: 8, domain: '数与运算', essence: ['E8', 'E2'], points: ['8.8'], level: 'trap', rung: 2,
    alias: ['分式', '约分', '公因式'], hook: '同一个分式换个 x。别急着约分，先看清哪些因式能约。',
    shelf: ['fracnum', 'ratread'],
    build() { return W.blank(); },
    predict: null,
    milestones: [
      { id: 'put', say: '放一张分式卡', score: 2, when: { count: { type: 'fracnum', ge: 1 } },
        hints: ['要表示这个分式，先要一张分式卡。', '分子、分母各写一个式子。', '放一张分式卡。'] },
      { id: 'val', say: 'x = 4 时的值是 5', score: 4, when: { type: 'ratread', port: 'v', op: '=', value: '5' },
        hints: ['分母 x − 1 在 x = 4 时是 3，可以代入。', '分式读数器的 x 设为 4。', '分子 x² − 1 = 15，分母 3，15 ÷ 3 = 5。'] },
    ],
    traps: [{ id: 'cancel-terms', wrong: '把 x² 和 x 约成 x，再把 −1 和 −1 约掉，得到 x，代入 x = 4 得 4：分式的项不能单独约掉', when: { type: 'ratread', port: 'v', op: '=', value: '4' } }],
    goal: ['val'],
    why: '(x² − 1)/(x − 1) = (x + 1)(x − 1)/(x − 1) = x + 1，x = 4 时为 5。只能约掉整个公因式 (x − 1)，不能把分子分母的单项分别约掉。',
  });

  // 8.9 分式方程（核心）：去分母后解方程，检验分母不为 0
  U.problems.push({
    id: 'g8-fraction-equation-core', title: '4/(x + 12) = x + 9：在 −10 到 10 之间有几个解？', grade: 8, domain: '数与运算', essence: ['E4', 'E8'], points: ['8.9'], level: 'core', rung: 1,
    alias: ['分式方程', '去分母', '检验'], hook: '分母不能是 0。把 x 从 −10 试到 10，数一数哪些 x 让两边相等。',
    shelf: ['variable'],
    build() { return W.blank(); },
    predict: null,
    milestones: [
      { id: 'put', say: '放一个变量盒', score: 2, when: { count: { type: 'variable', ge: 1 } },
        hints: ['要检验每个 x 是否让两边相等，先要一个变量盒。', '变量盒的左边和右边都可以写含 x 的式子。', '放一个变量盒。'] },
      { id: 'one', say: '范围内只有 1 个解', score: 4, when: { type: 'variable', port: 'hits', op: '=', value: '1' },
        hints: ['分母 x + 12 不能为 0，先看 x 的取值范围。', '变量盒左边写 4/(x+12)，右边写 x+9。', '范围用默认的 −10 到 10，相等的 x 有几个就是几个解。'] },
    ],
    traps: [], goal: ['one'],
    why: '去分母得 4 = (x + 9)(x + 12)，即 x² + 21x + 104 = 0，解得 x = −8 或 x = −13。x = −13 不在 −10 到 10 之间，所以范围内只有 1 个解 x = −8，且此时分母 x + 12 = 4 不为 0。',
  });

  // 8.10 二次根式（核心）：根号里是乘积，积开方
  U.problems.push({
    id: 'g8-sqrt-product-core', title: '√(16 × 9) 等于多少？', grade: 8, domain: '数与运算', essence: ['E8', 'E2'], points: ['8.10'], level: 'core', rung: 1,
    alias: ['二次根式', '开方', '根号'], hook: '先算根号里面的积，再开平方。',
    shelf: ['num', 'op', 'sqrt'],
    build() {
      const s = W.blank();
      R(s, W.add(s, 'num', 60, 40, { n: 16 }), 'a');
      R(s, W.add(s, 'num', 60, 220, { n: 9 }), 'b');
      return s;
    },
    predict: null,
    milestones: [
      { id: 'put', say: '放一台开方器', score: 2, when: { count: { type: 'sqrt', ge: 1 } },
        hints: ['要开平方，先要一台开方器材。', '开方器的输入接根号里的数。', '放一台开方器。'] },
      { id: 'root', say: '√(16 × 9) = 12', score: 4, when: { type: 'sqrt', port: 'r', op: '=', value: '12' },
        hints: ['根号里是两个数相乘：先做乘法。', '运算器的甲接 16，乙接 9，运算选 ×；结果再接到开方器。', '运算器选 ×，得 144，开方器输出 12。'] },
    ],
    traps: [], goal: ['root'],
    why: '√(16 × 9) = √144 = 12。根号里的积可以拆开：√16 × √9 = 4 × 3 = 12。但根号里的和不能拆开（见陷阱题）。',
  });

  // 8.10 二次根式（陷阱）：√(a + b) ≠ √a + √b
  U.problems.push({
    id: 'g8-sqrt-sum-trap', title: '√(9 + 16) 等于多少？', grade: 8, domain: '数与运算', essence: ['E8', 'E2'], points: ['8.10'], level: 'trap', rung: 2,
    alias: ['二次根式', '开方', '根号'], hook: '根号里是 9 加 16。先加，还是先把 9 和 16 各自开方？',
    shelf: ['num', 'op', 'sqrt'],
    build() {
      const s = W.blank();
      R(s, W.add(s, 'num', 60, 40, { n: 9 }), 'a');
      R(s, W.add(s, 'num', 60, 220, { n: 16 }), 'b');
      return s;
    },
    predict: null,
    milestones: [
      { id: 'put', say: '放一台开方器', score: 2, when: { count: { type: 'sqrt', ge: 1 } },
        hints: ['要开平方，先要一台开方器材。', '开方器的输入接根号里算出的数。', '放一台开方器。'] },
      { id: 'root', say: '√(9 + 16) = 5', score: 4, when: { type: 'sqrt', port: 'r', op: '=', value: '5' },
        hints: ['根号里是加法：先算 9 + 16。', '运算器选 +，甲接 9，乙接 16；结果接到开方器。', '运算器得 25，开方器输出 5。'] },
    ],
    traps: [{ id: 'root-first', wrong: '先把 √9 = 3 和 √16 = 4 加起来得 7：根号不能分给加法，√(a + b) ≠ √a + √b', when: { type: 'op', port: 'r', op: '=', value: '7' } }],
    goal: ['root'],
    why: '√(9 + 16) = √25 = 5。而 √9 + √16 = 3 + 4 = 7，两者不相等。根号对加法不能分配。',
  });

  // 8.11 勾股定理（核心）：用三边检验是否为直角三角形
  U.problems.push({
    id: 'g8-pythagoras-core', title: '5、12、13 能组成直角三角形吗？', grade: 8, domain: '图形', essence: ['E2'], points: ['8.11'], level: 'core', rung: 1,
    alias: ['勾股定理', '勾股数', '逆定理', '直角三角形'], hook: '三边满足 a² + b² = c²，就是直角三角形。用三角形器材检查。',
    shelf: ['tri'],
    build() { return W.blank(); },
    predict: null,
    milestones: [
      { id: 'put', say: '放一个三角形器材', score: 2, when: { count: { type: 'tri', ge: 1 } },
        hints: ['要检查三条边，先要一个三角形器材。', '三角形器材的 a、b、c 分别是三条边。', '放一个三角形器材。'] },
      { id: 'check', say: '5、12、13 是直角三角形', score: 4,
        when: { all: [{ type: 'tri', port: 'perim', op: '=', value: '30' }, { type: 'tri', port: 'right', op: '=', value: true }] },
        hints: ['先把三条边填进去：5、12、13。', '三角形器材的 a、b、c 分别填 5、12、13。', '三边 5、12、13，周长 30，“是直角”为真。'] },
    ],
    traps: [], goal: ['check'],
    why: '5² + 12² = 25 + 144 = 169 = 13²，满足勾股定理的逆定理，所以是直角三角形，斜边为 13。',
  });

  // 8.11 勾股定理（陷阱）：斜边不是两直角边之和
  U.problems.push({
    id: 'g8-pythagoras-trap', title: '两条直角边分别是 6 和 8，斜边是几？', grade: 8, domain: '图形', essence: ['E2'], points: ['8.11'], level: 'trap', rung: 2,
    alias: ['勾股定理', '斜边', '直角边'], hook: '斜边不是两条直角边直接相加。先算平方和，再开方。',
    shelf: ['tri'],
    build() { return W.blank(); },
    predict: null,
    milestones: [
      { id: 'put', say: '放一个三角形器材', score: 2, when: { count: { type: 'tri', ge: 1 } },
        hints: ['要检查三条边，先要一个三角形器材。', '三角形器材的 a、b 填直角边，c 填斜边。', '放一个三角形器材。'] },
      { id: 'check', say: '斜边是 10，三边 6、8、10 是直角三角形', score: 4,
        when: { all: [{ type: 'tri', port: 'perim', op: '=', value: '24' }, { type: 'tri', port: 'right', op: '=', value: true }] },
        hints: ['斜边满足 a² + b² = c²：6² + 8² = 36 + 64 = 100。', '三角形器材的 a、b 填 6、8，c 填斜边。', '斜边 √100 = 10，三边 6、8、10，周长 24。'] },
    ],
    traps: [{ id: 'add-legs', wrong: '把斜边当成 6 + 8 = 14：三边 6、8、14 围不成三角形（两边之和不大于第三边）', when: { type: 'tri', port: 'ok', op: '=', value: false } }],
    goal: ['check'],
    why: '斜边 c = √(6² + 8²) = √100 = 10，三边为 6、8、10，周长 24。把斜边算成 6 + 8 = 14 时，三边围不成三角形。',
  });

  // 8.13 特殊的平行四边形（核心）：正方形是长和宽相等的长方形
  U.problems.push({
    id: 'g8-square-area-core', title: '边长 5 的正方形，面积和周长各是多少？', grade: 8, domain: '图形', essence: ['E5', 'E3'], points: ['8.13'], level: 'core', rung: 1,
    alias: ['正方形', '矩形', '面积', '周长'], hook: '正方形的四条边都相等。用长方形器材，把长和宽都设成 5。',
    shelf: ['rect'],
    build() { return W.blank(); },
    predict: null,
    milestones: [
      { id: 'put', say: '放一个长方形器材', score: 2, when: { count: { type: 'rect', ge: 1 } },
        hints: ['要算面积和周长，先要一个长方形器材。', '长方形器材的“长”和“宽”各一个输入。', '放一个长方形器材。'] },
      { id: 'both', say: '面积 25，周长 20', score: 4,
        when: { all: [{ type: 'rect', port: 'area', op: '=', value: '25' }, { type: 'rect', port: 'perim', op: '=', value: '20' }] },
        hints: ['正方形的长和宽相等，都是边长 5。', '长方形器材的长、宽都设为 5。', '长 5、宽 5：面积 25，周长 20。'] },
    ],
    traps: [], goal: ['both'],
    why: '正方形的面积 = 边长 × 边长 = 25，周长 = 4 × 边长 = 20。长和宽都是 5 时，就是正方形。',
  });

  // 8.13 特殊的平行四边形（陷阱）：平行四边形的高是垂直距离，不是斜边
  U.problems.push({
    id: 'g8-rect-height-trap', title: '平行四边形底 5、高 3、斜边 2，面积是多少？', grade: 8, domain: '图形', essence: ['E5', 'E3'], points: ['8.13'], level: 'trap', rung: 2,
    alias: ['平行四边形', '面积', '高', '斜边'], hook: '算面积要用底和高，高是垂直的那条线段。斜边 2 不是高。用长方形器材算“底 × 高”。',
    shelf: ['rect'],
    build() { return W.blank(); },
    predict: null,
    milestones: [
      { id: 'put', say: '放一个长方形器材', score: 2, when: { count: { type: 'rect', ge: 1 } },
        hints: ['要算面积，先要一个长方形器材。', '长方形器材的长对应底，宽对应高。', '放一个长方形器材。'] },
      { id: 'area', say: '面积是 15', score: 4, when: { type: 'rect', port: 'area', op: '=', value: '15' },
        hints: ['面积 = 底 × 高，要找垂直的那条边。', '长填底 5，宽填垂直的高 3，不要填斜边 2。', '长 5、宽 3，面积 15。'] },
    ],
    traps: [{ id: 'slant', wrong: '用斜边 2 当高：5 × 2 = 10，斜边不是垂直距离', when: { type: 'rect', port: 'area', op: '=', value: '10' } }],
    goal: ['area'],
    why: '平行四边形的面积 = 底 × 高。高是垂直距离 3，斜边 2 不是高。5 × 3 = 15。',
  });

  // 8.14 函数与正比例函数（核心）：y = kx，b = 0
  U.problems.push({
    id: 'g8-proportional-core', title: '正比例函数 y = 2x，x = 3 时 y 是几？', grade: 8, domain: '函数', essence: ['E3'], points: ['8.14'], level: 'core', rung: 1,
    alias: ['正比例函数', '函数', '代入'], hook: '正比例函数 y = kx 的图象过原点。把 k 设成 2，再把 x = 3 代进去。',
    shelf: ['line', 'at'],
    build() { return W.blank(); },
    predict: null,
    milestones: [
      { id: 'put', say: '放一条直线', score: 2, when: { count: { type: 'line', ge: 1 } },
        hints: ['要表示函数，先要一条直线。', '直线器材可以设定斜率 k 和截距 b。', '放一条直线。'] },
      { id: 'y', say: 'x = 3 时 y = 6', score: 4, when: { type: 'at', port: 'y', op: '=', value: '6' },
        hints: ['把 x = 3 代入 y = 2x。', '直线器材 k 填 2、b 填 0；代入器的 x 填 3，并把直线接到代入器。', '直线 k = 2、b = 0 接到代入器，x = 3，得到 y = 6。'] },
    ],
    traps: [], goal: ['y'],
    why: '正比例函数 y = kx（b = 0）。y = 2 × 3 = 6。',
  });

  // 8.14 函数与正比例函数（陷阱）：有截距的不是正比例函数，漏掉截距会算错
  U.problems.push({
    id: 'g8-proportional-intercept-trap', title: 'y = 2x + 3，x = 3 时 y 是几？', grade: 8, domain: '函数', essence: ['E3'], points: ['8.14'], level: 'trap', rung: 2,
    alias: ['正比例函数', '一次函数', '截距'], hook: '这条直线不过原点：常数项 3 不能漏掉。',
    shelf: ['line', 'at'],
    build() { return W.blank(); },
    predict: null,
    milestones: [
      { id: 'put', say: '放一条直线', score: 2, when: { count: { type: 'line', ge: 1 } },
        hints: ['要表示函数，先要一条直线。', '直线器材的斜率 k 填 2，截距 b 填 3。', '放一条直线。'] },
      { id: 'y', say: 'x = 3 时 y = 9', score: 4, when: { type: 'at', port: 'y', op: '=', value: '9' },
        hints: ['代入 x = 3：2 × 3 = 6，别忘了后面的 + 3。', '直线 k 填 2、b 填 3；代入器 x 填 3，把直线接到代入器。', '直线 k = 2、b = 3，代入器 x = 3，得 y = 9。'] },
    ],
    traps: [{ id: 'drop-b', wrong: '漏掉 +3，算成 y = 2x，x = 3 时得 6：这不是正比例函数', when: { type: 'at', port: 'y', op: '=', value: '6' } }],
    goal: ['y'],
    why: 'y = 2x + 3 是一次函数，不是正比例函数（b ≠ 0）。x = 3 时 y = 6 + 3 = 9。漏掉截距得到 6，是常见错误。',
  });

  // 8.16 数据的分析（核心）：中位数
  U.problems.push({
    id: 'g8-median-core', title: '2、4、4、6、9 的中位数是多少？', grade: 8, domain: '统计与概率', essence: ['E7'], points: ['8.16'], level: 'core', rung: 1,
    alias: ['中位数', '平均数', '众数', '数据'], hook: '中位数：把数从小到大排好，正中间的那个数。',
    shelf: ['data', 'stats'],
    build() {
      const s = W.blank();
      R(s, W.add(s, 'data', 60, 60, { list: '2, 4, 4, 6, 9' }), 'd');
      return s;
    },
    predict: null,
    milestones: [
      { id: 'put', say: '放一个统计量器材', score: 2, when: { count: { type: 'stats', ge: 1 } },
        hints: ['要算一组数的统计量，先要一个统计量器材。', '统计量器材的输入接数据表。', '放一个统计量器材。'] },
      { id: 'mid', say: '中位数是 4', score: 4, when: { type: 'stats', port: 'v', op: '=', value: '4' },
        hints: ['先把数从小到大排好，正中间是第几个？', '统计量器材的“求什么”选“中位数”，输入接数据表。', '选中位数，结果是 4（不是平均数 5）。'] },
    ],
    traps: [], goal: ['mid'],
    why: '排好后是 2、4、4、6、9，共 5 个数，正中间（第 3 个）是 4。中位数不是平均数（平均数是 5）。',
  });

  // 8.16 数据的分析（陷阱）：众数不是中位数
  U.problems.push({
    id: 'g8-median-mode-trap', title: '1、1、2、3、4 的中位数是多少？', grade: 8, domain: '统计与概率', essence: ['E7'], points: ['8.16'], level: 'trap', rung: 2,
    alias: ['中位数', '众数', '数据'], hook: '1 出现了两次，但中位数要看正中间，不是看次数最多的数。',
    shelf: ['data', 'stats'],
    build() {
      const s = W.blank();
      R(s, W.add(s, 'data', 60, 60, { list: '1, 1, 2, 3, 4' }), 'd');
      return s;
    },
    predict: null,
    milestones: [
      { id: 'put', say: '放一个统计量器材', score: 2, when: { count: { type: 'stats', ge: 1 } },
        hints: ['要算统计量，先要一个统计量器材。', '统计量器材的输入接数据表。', '放一个统计量器材。'] },
      { id: 'mid', say: '中位数是 2', score: 4, when: { type: 'stats', port: 'v', op: '=', value: '2' },
        hints: ['先排序：1、1、2、3、4，正中间是哪个？', '统计量器材的“求什么”选“中位数”。', '选中位数，结果是 2。'] },
    ],
    traps: [{ id: 'mode', wrong: '选了“众数”：次数最多的是 1，得到 1。众数不是中位数', when: { type: 'stats', port: 'v', op: '=', value: '1' } }],
    goal: ['mid'],
    why: '排序后 1、1、2、3、4，正中间第 3 个是 2。众数是 1，平均数是 2.2，都不是中位数。',
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
