/* 四年级内容补充：知识点 4.2、4.3、4.4、4.5、4.6、4.7、4.8、4.9、4.10、4.11、4.13、4.14、4.16 没有题（或只有 1 题）。每点写一道核心题和一道陷阱题；延伸题需要证据 ④ 的器材，四年级现有器材做不到，暂缺。4.3 只写了核心题，4.5 只覆盖平行四边形，4.14 只写了核心题，4.17 暂缺（见报告）。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const R = (s, id, role) => { s.entities[id].role = role; return id; };

  // 4.2 公顷和平方千米（核心）：1 平方千米 = 100 公顷，大单位换小单位用乘法
  U.problems.push({
    id: 'g4-area-km2-core', title: '3 平方千米是多少公顷？', grade: 4, domain: '数与运算', essence: ['E3'], points: ['4.2'], level: 'core', rung: 1,
    alias: ['公顷', '平方千米', '面积单位', '进率'], hook: '1 平方千米 = 100 公顷。3 平方千米是多少公顷？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 3 }), 'km2'); R(s, W.add(s, 'num', 60, 200, { n: 100 }), 'rate'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['从平方千米换成公顷，单位变小，数会变大。', '每 1 平方千米有 100 公顷，要用乘法。', '放一台运算器，运算选 ×。'] },
      { id: 'ha', say: '3 平方千米 = 300 公顷', score: 4, when: { type: 'op', port: 'r', op: '=', value: '300' },
        hints: ['3 里面有几个 100 公顷？', '甲接 3（平方千米），乙接 100（进率）。', '甲接 3，乙接 100，运算选 ×。'] },
    ],
    traps: [], goal: ['ha'],
    why: '1 平方千米 = 100 公顷，所以 3 平方千米 = 3 × 100 = 300 公顷。从大单位换成小单位，要乘进率。',
  });

  // 4.2 公顷和平方千米（陷阱）：从小单位换成大单位，要除以进率，不能乘
  U.problems.push({
    id: 'g4-area-ha-trap', title: '2 公顷是多少平方千米？', grade: 4, domain: '数与运算', essence: ['E3'], points: ['4.2'], level: 'trap', rung: 1,
    alias: ['公顷', '平方千米', '进率', '换算'], hook: '1 平方千米 = 100 公顷。2 公顷是多少平方千米？结果应该比 2 大还是比 2 小？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 2 }), 'ha'); R(s, W.add(s, 'num', 60, 200, { n: 100 }), 'rate'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['公顷比平方千米小，换成平方千米后数应该变小。', '1 公顷 = 1/100 平方千米，要用除法。', '放一台运算器，运算选 ÷。'] },
      { id: 'km2', say: '2 公顷 = 0.02 平方千米', score: 4, when: { type: 'op', port: 'r', op: '=', value: '0.02' },
        hints: ['2 里面有几个 100？', '甲接 2（公顷），乙接 100（进率）。', '甲接 2，乙接 100，运算选 ÷。'] },
    ],
    traps: [{ id: 'times', wrong: '用了乘法：2 × 100 = 200，结果变大了。公顷比平方千米小，应该除以 100。', when: { type: 'op', port: 'r', op: '=', value: '200' } }],
    goal: ['km2'],
    why: '1 公顷 = 1/100 平方千米，所以 2 公顷 = 2 ÷ 100 = 0.02 平方千米。小单位换大单位，数变小，要除。',
  });

  // 4.4 三位数乘两位数（核心）：125 × 24
  U.problems.push({
    id: 'g4-mul-3x2-core', title: '125 × 24 等于多少？', grade: 4, domain: '数与运算', essence: ['E2'], points: ['4.4'], level: 'core', rung: 1,
    alias: ['三位数乘两位数', '乘法', '竖式'], hook: '一箱饮料 125 瓶，24 箱一共多少瓶？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 125 }), 'a'); R(s, W.add(s, 'num', 60, 200, { n: 24 }), 'b'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['几箱、每箱几瓶，求一共，用什么运算？', '求总数用乘法。', '放一台运算器，运算选 ×。'] },
      { id: 'prod', say: '125 × 24 = 3000', score: 4, when: { type: 'op', port: 'r', op: '=', value: '3000' },
        hints: ['甲接 125，乙接 24。', '可以先算 125 × 8 = 1000，再乘 3。', '甲接 125，乙接 24，运算选 ×。'] },
    ],
    traps: [], goal: ['prod'],
    why: '125 × 24 = 3000。可以把 24 拆成 8 × 3，125 × 8 = 1000，1000 × 3 = 3000。',
  });

  // 4.4 三位数乘两位数（陷阱）：十位上是 0 时，末尾的 0 不能漏
  U.problems.push({
    id: 'g4-mul-zero-trap', title: '123 × 40 等于多少？', grade: 4, domain: '数与运算', essence: ['E2'], points: ['4.4'], level: 'trap', rung: 1,
    alias: ['三位数乘两位数', '积的末尾', '0'], hook: '40 的个位是 0。算 123 × 40 时，结果的末尾要注意什么？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 123 }), 'a'); R(s, W.add(s, 'num', 60, 200, { n: 40 }), 'b'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['两个数相乘，要用哪种运算？', '运算器选 ×。', '放一台运算器，运算选 ×。'] },
      { id: 'prod', say: '123 × 40 = 4920', score: 4, when: { type: 'op', port: 'r', op: '=', value: '4920' },
        hints: ['40 = 4 个十，积要看成 123 × 4 个十。', '先算 123 × 4 = 492，再补上一个 0。', '甲接 123，乙接 40，运算选 ×。'] },
    ],
    traps: [{ id: 'drop-zero', wrong: '漏写了末尾的 0：123 × 4 = 492，忘了 40 里的 10 要补上一个 0。', when: { type: 'op', port: 'r', op: '=', value: '492' } }],
    goal: ['prod'],
    why: '40 是 4 个十，所以 123 × 40 = 123 × 4 × 10 = 492 × 10 = 4920。积的末尾要补上 0。',
  });

  // 4.3 角的度量（核心）：两个角合起来是一个平角（180°）
  U.problems.push({
    id: 'g4-angle-straight-core', title: '130° 的角和 50° 的角拼在一起，是平角吗？', grade: 4, domain: '图形', essence: ['E3'], points: ['4.3'], level: 'core', rung: 1,
    alias: ['角', '度', '平角', '量角'], hook: '平角是一条直线所成的角，是 180°。130° 加 50° 是不是正好一个平角？',
    shelf: ['num', 'op', 'compare'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 130 }), 'a'); R(s, W.add(s, 'num', 60, 200, { n: 50 }), 'b'); R(s, W.add(s, 'num', 60, 340, { n: 180 }), 'straight'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器，把两个角加起来', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['两个角合在一起，是把度数加起来。', '合起来的度数要和平角比。', '放一台运算器，运算选 +，甲接 130，乙接 50。'] },
      { id: 'cmp', say: '放一台比较器，和 180° 比', score: 2, when: { count: { type: 'compare', ge: 1 } },
        hints: ['要问“是不是 180°”，用比较器。', '比较器的关系选 =。', '放一台比较器，关系选 =。'] },
      { id: 'yes', say: '比较器说“成立”：是平角', score: 4, when: { type: 'compare', port: 'ok', op: '=', value: true },
        hints: ['甲接运算器的结果，乙接 180。', '运算器的结果是 180，和平角一样大。', '甲接运算器的结果，乙接 180，关系选 =。'] },
    ],
    traps: [], goal: ['yes'],
    why: '平角是 180°。130° + 50° = 180°，所以这两个角合起来正好是一个平角。角的大小看两条边张开的程度，用度数来比。',
  });

  // 4.5 平行四边形和梯形（核心）：面积 = 底 × 高
  U.problems.push({
    id: 'g4-parallelogram-core', title: '平行四边形底 6 厘米，高 4 厘米，面积是多少？', grade: 4, domain: '图形', essence: ['E5'], points: ['4.5'], level: 'core', rung: 1,
    alias: ['平行四边形', '底', '高', '面积'], hook: '图中现在的高是 2 厘米。把高改成 4 厘米，面积变成多少？',
    shelf: ['parallelogram'],
    build() { const s = W.blank(); R(s, W.add(s, 'parallelogram', 60, 60, { b: 6, h: 2, s: 2 }), 'shape'); return s; },
    predict: null,
    milestones: [
      { id: 'area', say: '面积是 24 平方厘米', score: 4, when: { type: 'parallelogram', port: 'area', op: '=', value: '24' },
        hints: ['平行四边形的面积 = 底 × 高，要用的是垂直的高。', '底是 6，高要改成 4。', '把“高”改成 4，面积就是 6 × 4 = 24。'] },
    ],
    traps: [], goal: ['area'],
    why: '平行四边形的面积 = 底 × 高 = 6 × 4 = 24 平方厘米。高是垂直底边的距离，不是斜着的边。',
  });

  // 4.5 平行四边形和梯形（陷阱）：斜度不是高
  U.problems.push({
    id: 'g4-parallelogram-slant-trap', title: '平行四边形底 6 厘米，斜度 2 厘米，高 4 厘米，面积是多少？', grade: 4, domain: '图形', essence: ['E5'], points: ['4.5'], level: 'trap', rung: 1,
    alias: ['平行四边形', '高', '斜', '面积'], hook: '图里有三个数：底、斜度和高。面积要用哪两个数相乘？',
    shelf: ['parallelogram'],
    build() { const s = W.blank(); R(s, W.add(s, 'parallelogram', 60, 60, { b: 6, h: 3, s: 2 }), 'shape'); return s; },
    predict: null,
    milestones: [
      { id: 'area', say: '面积是 24 平方厘米', score: 4, when: { type: 'parallelogram', port: 'area', op: '=', value: '24' },
        hints: ['面积 = 底 × 高。斜度不是高。', '高是 4 厘米，要改高。', '把“高”改成 4，面积 = 6 × 4 = 24。'] },
    ],
    traps: [{ id: 'slant', wrong: '把斜度 2 当成了高：6 × 2 = 12，这是错的。斜度只说明边歪了多少，不是高。', when: { type: 'parallelogram', port: 'area', op: '=', value: '12' } }],
    goal: ['area'],
    why: '面积 = 底 × 高 = 6 × 4 = 24。斜度 2 只表示上边向右错开了多少，不是垂直距离，不能拿来当高。',
  });

  // 4.6 除数是两位数的除法（核心）：480 ÷ 24
  U.problems.push({
    id: 'g4-div-2digit-core', title: '480 ÷ 24 等于多少？', grade: 4, domain: '数与运算', essence: ['E2'], points: ['4.6'], level: 'core', rung: 1,
    alias: ['除数是两位数', '除法', '商'], hook: '480 个苹果，每 24 个装一箱，能装几箱？',
    shelf: ['num', 'divmod'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 480 }), 'a'); R(s, W.add(s, 'num', 60, 200, { n: 24 }), 'b'); return s; },
    predict: null,
    milestones: [
      { id: 'div', say: '放一台带余除法器', score: 2, when: { count: { type: 'divmod', ge: 1 } },
        hints: ['每箱装几个，求几箱，用什么运算？', '要算商，用带余除法。', '放一台带余除法器。'] },
      { id: 'q', say: '商是 20', score: 4, when: { type: 'divmod', port: 'q', op: '=', value: '20' },
        hints: ['被除数接甲，除数接乙。', '24 × 20 = 480，正好除尽。', '甲接 480，乙接 24。'] },
    ],
    traps: [], goal: ['q'],
    why: '除数是两位数，可以先想 24 大约是 25 的一部分：480 ÷ 24 = 20，因为 24 × 20 = 480。',
  });

  // 4.6 除数是两位数的除法（陷阱）：试商偏大
  U.problems.push({
    id: 'g4-div-trial-trap', title: '556 ÷ 28，商是几？余数是几？', grade: 4, domain: '数与运算', essence: ['E2', 'E6'], points: ['4.6'], level: 'trap', rung: 1,
    alias: ['除数是两位数', '试商', '余数'], hook: '28 × 20 等于 560，比 556 还大。商应该是 20 还是比 20 小？',
    shelf: ['num', 'divmod'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 556 }), 'a'); R(s, W.add(s, 'num', 60, 200, { n: 28 }), 'b'); return s; },
    predict: null,
    milestones: [
      { id: 'div', say: '放一台带余除法器', score: 2, when: { count: { type: 'divmod', ge: 1 } },
        hints: ['要算商和余数，用带余除法。', '器材是“带余除法”。', '放一台带余除法器。'] },
      { id: 'q', say: '商是 19，余数是 24', score: 4, when: { type: 'divmod', port: 'q', op: '=', value: '19' },
        hints: ['试一试 28 × 20 = 560，比 556 大，商要小一点。', '商不能太大，要比 20 小。', '甲接 556，乙接 28，看商是不是 19。'] },
    ],
    traps: [{ id: 'too-big', wrong: '试商偏大：28 × 20 = 560 > 556，商不能是 20，要调成 19。', when: { type: 'divmod', port: 'q', op: '=', value: '20' } }],
    goal: ['q'],
    why: '28 × 19 = 532，556 − 532 = 24，所以商是 19，余数是 24。试商时积超过被除数，就要把商调小。',
  });

  // 4.7 条形统计图（核心）：最多和最少相差几人（极差）
  U.problems.push({
    id: 'g4-bar-range-core', title: '四个班的人数，最多的比最少的多几人？', grade: 4, domain: '统计与概率', essence: ['E11'], points: ['4.7'], level: 'core', rung: 1,
    alias: ['条形统计图', '极差', '最多', '最少'], hook: '条形统计图里，四个班的人数是 45、52、38、60。最多的比最少的多几人？',
    shelf: ['data', 'stats'],
    build() { const s = W.blank(); R(s, W.add(s, 'data', 60, 60, { list: '45, 52, 38, 60', lo: 0, hi: 60 }), 'classes'); return s; },
    predict: null,
    milestones: [
      { id: 'stats', say: '放一台统计量器', score: 2, when: { count: { type: 'stats', ge: 1 } },
        hints: ['求“多几人”，要算最多和最少的差。', '这个差在统计里叫“极差”。', '放一台统计量器，接数据表的分布。'] },
      { id: 'range', say: '极差是 22', score: 4, when: { type: 'stats', port: 'v', op: '=', value: '22' },
        hints: ['最多是 60，最少是 38。', '统计量器的“求什么”选“极差”。', '接数据表的分布，求什么选“极差”。'] },
    ],
    traps: [], goal: ['range'],
    why: '最多 60 人，最少 38 人，相差 60 − 38 = 22 人。这个差叫极差，用来看一组数的波动范围。',
  });

  // 4.7 条形统计图（陷阱）：纵轴每格代表的人数要乘上
  U.problems.push({
    id: 'g4-bar-scale-trap', title: '条形高 9 格，每格代表 5 人，这个班有几人？', grade: 4, domain: '统计与概率', essence: ['E3'], points: ['4.7'], level: 'trap', rung: 1,
    alias: ['条形统计图', '纵轴', '每格代表'], hook: '纵轴上每格代表 5 人。条形有 9 格高，人数是几？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 9 }), 'bars'); R(s, W.add(s, 'num', 60, 200, { n: 5 }), 'scale'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['格数要换成人数，每格代表 5 人。', '几个 5 合起来，用什么运算？', '放一台运算器，运算选 ×。'] },
      { id: 'ppl', say: '这个班有 45 人', score: 4, when: { type: 'op', port: 'r', op: '=', value: '45' },
        hints: ['甲接格数 9，乙接每格代表的人数 5。', '9 个 5 是多少？', '甲接 9，乙接 5，运算选 ×。'] },
    ],
    traps: [{ id: 'add', wrong: '把格数和每格的人数加起来：9 + 5 = 14，这是错的。每格代表 5 人，要用乘法。', when: { type: 'op', port: 'r', op: '=', value: '14' } }],
    goal: ['ppl'],
    why: '每格代表 5 人，9 格就是 9 个 5：9 × 5 = 45 人。格数和人数是两种东西，不能相加。',
  });

  // 4.8 优化（核心）：烧水时同时做别的事，总时间 = 烧水 + 泡茶
  U.problems.push({
    id: 'g4-optimize-boil-core', title: '烧水要 15 分钟，泡茶要 1 分钟，最少几分钟能喝上茶？', grade: 4, domain: '数与运算', essence: ['E2'], points: ['4.8'], level: 'core', rung: 1,
    alias: ['优化', '沏茶', '烧水', '最少时间'], hook: '烧水的时候，可以去洗茶杯、拿茶叶，这些事不用等。最少要几分钟？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 15 }), 'boil'); R(s, W.add(s, 'num', 60, 200, { n: 1 }), 'brew'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['烧水的时候别的事可以同时做，哪些时间要加在一起？', '必须一件件等的时间要加起来。', '放一台运算器，运算选 +。'] },
      { id: 'min', say: '最少 16 分钟', score: 4, when: { type: 'op', port: 'r', op: '=', value: '16' },
        hints: ['烧水 15 分钟，泡茶 1 分钟必须在水开以后做。', '只把必须等的两件事加起来。', '甲接 15（烧水），乙接 1（泡茶），运算选 +。'] },
    ],
    traps: [], goal: ['min'],
    why: '烧水时可以同时洗茶杯、拿茶叶，这些不占用烧水的时间。最少时间 = 烧水 15 + 泡茶 1 = 16 分钟。',
  });

  // 4.8 优化（陷阱）：不能把所有事的时间全部加起来
  U.problems.push({
    id: 'g4-optimize-sum-trap', title: '沏茶要做 5 件事，最少几分钟？', grade: 4, domain: '数与运算', essence: ['E2'], points: ['4.8'], level: 'trap', rung: 1,
    alias: ['优化', '沏茶', '同时做', '统筹'], hook: '烧水 15 分钟，洗茶壶 2 分钟，洗茶杯 1 分钟，拿茶叶 1 分钟，泡茶 1 分钟。哪些事可以同时做？',
    shelf: ['num', 'op'],
    build() {
      const s = W.blank();
      R(s, W.add(s, 'num', 60, 40, { n: 15 }), 'boil'); W.add(s, 'num', 60, 130, { n: 2 });
      W.add(s, 'num', 60, 220, { n: 1 }); W.add(s, 'num', 60, 310, { n: 1 }); R(s, W.add(s, 'num', 60, 400, { n: 1 }), 'brew');
      return s;
    },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['洗茶壶、洗茶杯、拿茶叶可以在烧水时做，不一定要排在后面。', '只有烧水和泡茶必须一件接一件。', '放一台运算器，运算选 +。'] },
      { id: 'min', say: '最少 16 分钟', score: 4, when: { type: 'op', port: 'r', op: '=', value: '16' },
        hints: ['先算必须排队的：烧水和泡茶。', '其他的在烧水时同时做。', '甲接烧水 15，乙接泡茶 1，运算选 +。'] },
    ],
    traps: [{ id: 'all', wrong: '把 5 件事的时间全加起来：15 + 2 + 1 + 1 + 1 = 20，这是错的。能同时做的事不用加。', when: { type: 'op', port: 'r', op: '=', value: '20' } }],
    goal: ['min'],
    why: '洗茶壶、洗茶杯、拿茶叶都可以在烧水的 15 分钟里完成，只有烧水和泡茶要排队。最少 15 + 1 = 16 分钟。',
  });

  // 4.9 四则运算（核心）：先乘后加，3 + 4 × 5
  U.problems.push({
    id: 'g4-order-mul-core', title: '3 + 4 × 5 等于多少？先算哪一步？', grade: 4, domain: '数与运算', essence: ['E2'], points: ['4.9'], level: 'core', rung: 1,
    alias: ['四则运算', '运算顺序', '先乘后加'], hook: '没有括号时，乘法要先算。先算 4 × 5，还是先算 3 + 4？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 40, { n: 3 }), 'a'); R(s, W.add(s, 'num', 60, 160, { n: 4 }), 'b'); R(s, W.add(s, 'num', 60, 280, { n: 5 }), 'c'); return s; },
    predict: null,
    milestones: [
      { id: 'mul', say: '先算 4 × 5', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['没有括号，先算乘法。', '4 和 5 先相乘，要用运算器的 ×。', '放一台运算器，甲接 4，乙接 5，运算选 ×。'] },
      { id: 'add', say: '再把 3 加上去，结果是 23', score: 4, when: { type: 'op', port: 'r', op: '=', value: '23' },
        hints: ['第二步是把 3 和刚才的积加起来。', '再放一台运算器，运算选 +。', '第二台运算器：甲接 3，乙接第一台的结果，运算选 +。'] },
    ],
    traps: [], goal: ['add'],
    why: '3 + 4 × 5 中先乘后加：4 × 5 = 20，再 3 + 20 = 23。如果从左往右算，就会得到 35，是错的。',
  });

  // 4.9 四则运算（陷阱）：不能从左往右直接算
  U.problems.push({
    id: 'g4-order-left-trap', title: '12 − 4 ÷ 2 等于多少？', grade: 4, domain: '数与运算', essence: ['E2'], points: ['4.9'], level: 'trap', rung: 1,
    alias: ['四则运算', '运算顺序', '先除后减'], hook: '没有括号，除法要先算。12 − 4 ÷ 2 等于多少？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 40, { n: 12 }), 'a'); R(s, W.add(s, 'num', 60, 160, { n: 4 }), 'b'); R(s, W.add(s, 'num', 60, 280, { n: 2 }), 'c'); return s; },
    predict: null,
    milestones: [
      { id: 'div', say: '先算 4 ÷ 2', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['先算除法，不先算减法。', '4 ÷ 2 要用运算器的 ÷。', '放一台运算器，甲接 4，乙接 2，运算选 ÷。'] },
      { id: 'ten', say: '再用 12 减去结果，得到 10', score: 4, when: { type: 'op', port: 'r', op: '=', value: '10' },
        hints: ['第二步是 12 减去刚才的商。', '再放一台运算器，运算选 −。', '第二台运算器：甲接 12，乙接第一台的结果，运算选 −。'] },
    ],
    traps: [{ id: 'left', wrong: '从左往右算：12 − 4 = 8，8 ÷ 2 = 4，这是错的。没有括号时，要先算除法。', when: { type: 'op', port: 'r', op: '=', value: '4' } }],
    goal: ['ten'],
    why: '先算 4 ÷ 2 = 2，再算 12 − 2 = 10。没有括号时，乘除要先于加减，不能从左往右直接算。',
  });

  // 4.10 运算定律（核心）：乘法结合律，25 × 4 × 8
  U.problems.push({
    id: 'g4-assoc-mul-core', title: '25 × 4 × 8 怎么算最快？', grade: 4, domain: '数与运算', essence: ['E2'], points: ['4.10'], level: 'core', rung: 1,
    alias: ['运算定律', '结合律', '简便运算'], hook: '25 和 4 相乘正好是 100。先算哪两个数最简单？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 40, { n: 25 }), 'a'); R(s, W.add(s, 'num', 60, 160, { n: 4 }), 'b'); R(s, W.add(s, 'num', 60, 280, { n: 8 }), 'c'); return s; },
    predict: null,
    milestones: [
      { id: 'first', say: '先算 25 × 4', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['乘法可以先把哪两个数乘起来，结果不变。', '25 × 4 = 100，凑整最方便。', '放一台运算器，甲接 25，乙接 4，运算选 ×。'] },
      { id: 'all', say: '再乘 8，结果是 800', score: 4, when: { type: 'op', port: 'r', op: '=', value: '800' },
        hints: ['第二步是把刚才的 100 再乘 8。', '再放一台运算器，运算选 ×。', '第二台运算器：甲接第一台的结果，乙接 8，运算选 ×。'] },
    ],
    traps: [], goal: ['all'],
    why: '乘法满足结合律：25 × 4 × 8 = (25 × 4) × 8 = 100 × 8 = 800。先凑出整十、整百，计算更简单。',
  });

  // 4.10 运算定律（陷阱）：减法没有结合律
  U.problems.push({
    id: 'g4-assoc-sub-trap', title: '17 − 8 − 2 等于多少？能不能先算 8 − 2？', grade: 4, domain: '数与运算', essence: ['E2'], points: ['4.10'], level: 'trap', rung: 1,
    alias: ['运算定律', '减法', '结合律'], hook: '加法和乘法可以任意结合，减法呢？先算 8 − 2 对不对？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 40, { n: 17 }), 'a'); R(s, W.add(s, 'num', 60, 160, { n: 8 }), 'b'); R(s, W.add(s, 'num', 60, 280, { n: 2 }), 'c'); return s; },
    predict: null,
    milestones: [
      { id: 'first', say: '先算 17 − 8', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['减法要从左往右一步一步算。', '先把 17 减去 8。', '放一台运算器，甲接 17，乙接 8，运算选 −。'] },
      { id: 'seven', say: '再减 2，结果是 7', score: 4, when: { type: 'op', port: 'r', op: '=', value: '7' },
        hints: ['第二步是从 9 里再减去 2。', '再放一台运算器，运算选 −。', '第二台运算器：甲接第一台的结果，乙接 2，运算选 −。'] },
    ],
    traps: [{ id: 'group', wrong: '先算 8 − 2 = 6，再用 17 − 6 = 11，这是错的。减法不能随便加括号改变顺序。', when: { type: 'op', port: 'r', op: '=', value: '11' } }],
    goal: ['seven'],
    why: '17 − 8 − 2 = 9 − 2 = 7。减法没有结合律：17 − (8 − 2) = 11，结果不同。加法和乘法才能任意结合。',
  });

  // 4.11 小数的意义和性质（核心）：0.5 和 0.50 一样大
  U.problems.push({
    id: 'g4-decimal-equal-core', title: '0.5 和 0.50 一样大吗？', grade: 4, domain: '数与运算', essence: ['E3'], points: ['4.11'], level: 'core', rung: 1,
    alias: ['小数', '小数的性质', '末尾的 0', '大小比较'], hook: '小数末尾添上 0 或去掉 0，小数的大小会变吗？',
    shelf: ['num', 'compare'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 1, d: 2 }), 'a'); R(s, W.add(s, 'num', 60, 240, { n: 50, d: 100 }), 'b'); return s; },
    predict: null,
    milestones: [
      { id: 'cmp', say: '放一台比较器', score: 2, when: { count: { type: 'compare', ge: 1 } },
        hints: ['要比大小，用比较器。', '比较器的关系先选 =，问“一样大吗”。', '放一台比较器，关系选 =。'] },
      { id: 'eq', say: '比较器说“成立”：一样大', score: 4, when: { type: 'compare', port: 'ok', op: '=', value: true },
        hints: ['0.5 是 5 个十分之一，0.50 是 50 个百分之一。', '把两个数分别接到甲、乙。', '甲接 0.5，乙接 0.50，关系选 =。'] },
    ],
    traps: [], goal: ['eq'],
    why: '小数的末尾添上 0 或去掉 0，大小不变：0.5 = 0.50。小数的性质就是这样。',
  });

  // 4.11 小数的意义和性质（陷阱）：小数点向右移一位，是乘 10，不是加 10
  U.problems.push({
    id: 'g4-decimal-shift-trap', title: '0.25 的小数点向右移动一位，是多少？', grade: 4, domain: '数与运算', essence: ['E3'], points: ['4.11'], level: 'trap', rung: 1,
    alias: ['小数', '小数点移动', '扩大', '10 倍'], hook: '小数点向右移动一位，数会扩大 10 倍。0.25 变成了多少？（结果写法可以选“小数”）',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 1, d: 4 }), 'x'); R(s, W.add(s, 'num', 60, 240, { n: 10 }), 'ten'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['小数点向右移一位，数变成原来的几倍？', '扩大 10 倍，要用哪种运算？', '放一台运算器，运算选 ×。'] },
      { id: 'two-five', say: '0.25 变成 2.5', score: 4, when: { type: 'op', port: 'r', op: '=', value: '2.5' },
        hints: ['甲接 0.25（1/4），乙接 10。', '结果写法选“小数”，看起来更清楚。', '甲接 0.25，乙接 10，运算选 ×。'] },
    ],
    traps: [{ id: 'plus', wrong: '用了加法：0.25 + 10 = 10.25，这是错的。小数点移动是扩大 10 倍，要乘 10。', when: { type: 'op', port: 'r', op: '=', value: '10.25' } }],
    goal: ['two-five'],
    why: '小数点向右移动一位，数扩大到原来的 10 倍：0.25 × 10 = 2.5。扩大 10 倍是乘，不是加。',
  });

  // 4.13 小数的加法和减法（核心）：3.6 + 0.45
  U.problems.push({
    id: 'g4-decimal-add-core', title: '3.6 + 0.45 等于多少？', grade: 4, domain: '数与运算', essence: ['E3'], points: ['4.13'], level: 'core', rung: 1,
    alias: ['小数加法', '小数点对齐', '进位'], hook: '一根绳子 3.6 米，又接了 0.45 米。一共多少米？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 18, d: 5 }), 'a'); R(s, W.add(s, 'num', 60, 240, { n: 9, d: 20 }), 'b'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['求一共是多少，用什么运算？', '小数相加，小数点要对齐。', '放一台运算器，运算选 +。'] },
      { id: 'sum', say: '3.6 + 0.45 = 4.05', score: 4, when: { type: 'op', port: 'r', op: '=', value: '4.05' },
        hints: ['甲接 3.6，乙接 0.45。', '结果写法可以选“小数”。', '甲接 3.6，乙接 0.45，运算选 +。'] },
    ],
    traps: [], goal: ['sum'],
    why: '3.6 + 0.45：小数点对齐，3.60 + 0.45 = 4.05。',
  });

  // 4.13 小数的加法和减法（陷阱）：小数点没有对齐
  U.problems.push({
    id: 'g4-decimal-align-trap', title: '2.4 − 0.08 等于多少？', grade: 4, domain: '数与运算', essence: ['E3'], points: ['4.13'], level: 'trap', rung: 1,
    alias: ['小数减法', '小数点对齐', '退位'], hook: '2.4 减 0.08。注意两个数的小数点要对齐。',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 12, d: 5 }), 'a'); R(s, W.add(s, 'num', 60, 240, { n: 2, d: 25 }), 'b'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['从一个数里拿走一部分，用什么运算？', '减数是 0.08，不是 0.8。', '放一台运算器，运算选 −。'] },
      { id: 'diff', say: '2.4 − 0.08 = 2.32', score: 4, when: { type: 'op', port: 'r', op: '=', value: '2.32' },
        hints: ['甲接 2.4，乙接 0.08。', '小数点对齐：2.40 − 0.08。', '甲接 2.4，乙接 0.08，运算选 −。'] },
    ],
    traps: [{ id: 'misalign', wrong: '小数点没有对齐，把 0.08 当成了 0.8：2.4 − 0.8 = 1.6，这是错的。', when: { type: 'op', port: 'r', op: '=', value: '1.6' } }],
    goal: ['diff'],
    why: '2.4 − 0.08 = 2.40 − 0.08 = 2.32。小数点对齐后，数位才能对齐相减。',
  });

  // 4.14 图形的运动（二）（核心）：平移后的图形和原来全等
  U.problems.push({
    id: 'g4-translate-congruent-core', title: '三角形向右平移 3 格、向上平移 1 格，和原来一样吗？', grade: 4, domain: '图形', essence: ['E5'], points: ['4.14'], level: 'core', rung: 1,
    alias: ['平移', '全等', '图形的运动'], hook: '平移只改变位置，不改变形状和大小。用图形关系器材来检验。',
    shelf: ['ftri', 'xform', 'figrel'],
    build() { const s = W.blank(); R(s, W.add(s, 'ftri', 60, 60, {}), 'tri'); return s; },
    predict: null,
    milestones: [
      { id: 'move', say: '放一台变换器，设为平移', score: 2, when: { count: { type: 'xform', ge: 1 } },
        hints: ['要把三角形挪一个位置，用图形变换。', '变换器的“怎么变”选“平移”。', '放一台图形变换器，选平移，接入三角形。'] },
      { id: 'same', say: '平移后的图形和原来全等', score: 4, when: { type: 'figrel', port: 'cong', op: '=', value: true },
        hints: ['关系器材要同时接入原来的三角形和平移后的三角形。', '图形关系器材看“全等”。', '图形关系：甲接原三角形，乙接变换器的输出。'] },
    ],
    traps: [], goal: ['same'],
    why: '平移只把图形整体挪动，各边长和各角大小都不变，所以平移前后的两个图形全等。',
  });

  // 4.16 鸡兔同笼（核心）：假设全是鸡，再算兔子
  U.problems.push({
    id: 'g4-chicken-rabbit-core', title: '35 个头，94 条腿，兔有几只？', grade: 4, domain: '数与运算', essence: ['E2'], points: ['4.16'], level: 'core', rung: 1,
    alias: ['鸡兔同笼', '假设法', '头', '腿'], hook: '假设 35 只全是鸡，腿一共是 70 条。比实际的 94 条少了多少？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 40, { n: 35 }), 'heads'); R(s, W.add(s, 'num', 60, 160, { n: 94 }), 'legs'); R(s, W.add(s, 'num', 60, 280, { n: 2 }), 'two'); return s; },
    predict: null,
    milestones: [
      { id: 'all-chicken', say: '假设全是鸡：腿是 70 条', score: 2, when: { type: 'op', port: 'r', op: '=', value: '70' },
        hints: ['每只鸡 2 条腿，35 只鸡有几条腿？', '用乘法：头数 × 2。', '放一台运算器，甲接 35，乙接 2，运算选 ×。'] },
      { id: 'gap', say: '少了 24 条腿', score: 2, when: { type: 'op', port: 'r', op: '=', value: '24' },
        hints: ['实际腿是 94 条，比 70 多多少？', '用实际的腿数减去假设的腿数。', '再放一台运算器，甲接 94，乙接第一台的结果，运算选 −。'] },
      { id: 'rabbit', say: '兔有 12 只', score: 4, when: { type: 'op', port: 'r', op: '=', value: '12' },
        hints: ['每把一只鸡换成兔，多 2 条腿。', '少的 24 条腿，每只兔多出 2 条，要除以 2。', '再放一台运算器，运算选 ÷，甲接 24，乙接 2。'] },
    ],
    traps: [], goal: ['rabbit'],
    why: '假设 35 只全是鸡，有 70 条腿，比实际少 94 − 70 = 24 条。每把一只鸡换成兔，多 2 条腿，所以兔有 24 ÷ 2 = 12 只。',
  });

  // 4.16 鸡兔同笼（陷阱）：先求鸡的数量，不能直接拿腿数减头数
  U.problems.push({
    id: 'g4-chicken-rabbit-trap', title: '35 个头，94 条腿，鸡有几只？', grade: 4, domain: '数与运算', essence: ['E2'], points: ['4.16'], level: 'trap', rung: 1,
    alias: ['鸡兔同笼', '假设法', '头', '腿'], hook: '先求出兔的只数，再求鸡。不要直接拿腿数减头数。',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 40, { n: 35 }), 'heads'); R(s, W.add(s, 'num', 60, 160, { n: 94 }), 'legs'); R(s, W.add(s, 'num', 60, 280, { n: 2 }), 'two'); return s; },
    predict: null,
    milestones: [
      { id: 'rabbit', say: '先求出兔有 12 只', score: 4, when: { type: 'op', port: 'r', op: '=', value: '12' },
        hints: ['假设 35 只全是鸡，腿比实际少 24 条。', '每只兔比鸡多 2 条腿，24 ÷ 2 = 12。', '先用 35 × 2、94 − 70、再 ÷ 2，得到兔的只数。'] },
      { id: 'chicken', say: '鸡有 23 只', score: 4, when: { type: 'op', port: 'r', op: '=', value: '23' },
        hints: ['总共 35 只，减去兔的只数，剩下的是鸡。', '鸡 = 头数 − 兔。', '再放一台运算器，甲接 35，乙接第一步得到的兔数，运算选 −。'] },
    ],
    traps: [{ id: 'legs-minus-heads', wrong: '直接用腿数减头数：94 − 35 = 59，这不是鸡的只数。腿和头不是一一对应的。', when: { type: 'op', port: 'r', op: '=', value: '59' } }],
    goal: ['chicken'],
    why: '兔 12 只，鸡 = 35 − 12 = 23 只。直接拿腿数减头数没有意义，因为每只鸡和兔的腿数不同。',
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
