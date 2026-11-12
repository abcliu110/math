/* 九年级内容补充：能用现有器材表达的知识点补题（9.1、9.2、9.3、9.4、9.8、9.10、9.12、9.13）。每点写核心题和陷阱题；延伸题需要证据 ④，九年级暂不写。没有对应器材的知识点（9.5、9.6、9.7、9.11、9.14–9.16）暂缺，见 docs 报告。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const R = (s, id, role) => { s.entities[id].role = role; return id; };

  // 9.1 解一元二次方程（核心）：解读出两个精确根
  U.problems.push({
    id: 'g9-quad-solve-core', title: '解 x² − 5x + 6 = 0，两个根各是几？', grade: 9, domain: '关系', essence: ['E4', 'E8'], points: ['9.1'], level: 'core', rung: 3,
    alias: ['一元二次方程', '解方程', '因式分解', '两个根'], hook: '写出方程 x² − 5x + 6 = 0（方程卡里写 x^2 - 5x + 6 = 0），再接一台解。解集里有两个根吗？',
    shelf: ['eqcard', 'solve'],
    build() { return W.blank(); },
    predict: null,
    milestones: [
      { id: 'put', say: '放一张方程卡写出方程，再接一台解', score: 2, when: { count: { type: 'solve', ge: 1 } },
        hints: ['解方程要用「解」，方程要先用「方程卡」写下来。', '方程卡里写 x^2 - 5x + 6 = 0。', '把方程卡的输出接到解上。'] },
      { id: 'roots', say: '解集是两个根：2 和 3', score: 4,
        when: (w) => w.some('solve', (e, d) => !!(d.out.set && U.Solset.show(d.out.set.data) === 'x = 2 或 x = 3')),
        why_code: '解集里有两个根，数据形式的 when 只能比较一个数，不能直接读出“两个根是 2 和 3”',
        hints: ['二次方程可以试着分解成两个一次式的积。', '看解的“解集”：x = 几 或 x = 几。', '方程卡里写成 x^2 - 5x + 6 = 0。'] },
    ],
    traps: [], goal: ['roots'],
    why: 'x² − 5x + 6 = (x − 2)(x − 3)，所以两个根是 2 和 3。解在不是一次式时会给出两个精确根。',
  });

  // 9.2 一元二次方程的应用与根的判别式（核心）：判别式为 0 时只有一个根
  U.problems.push({
    id: 'g9-discriminant-core', title: 'y = x² − 4x + c，c 取几时，图象刚好和 x 轴只有一个交点？', grade: 9, domain: '函数', essence: ['E4', 'E8'], points: ['9.2'], level: 'core', rung: 3,
    alias: ['判别式', '根的判别式', '一个交点', '相切'], hook: '图象和 x 轴只有一个交点，就是方程 x² − 4x + c = 0 只有一个根。',
    shelf: ['quad'],
    build() { const s = W.blank(); R(s, W.add(s, 'quad', 60, 60, { a: 1, b: -4, c: 0 }), 'q'); return s; },
    predict: null,
    milestones: [
      { id: 'disc', say: '判别式 b² − 4ac 等于 0', score: 3, when: { role: 'q', port: 'disc', op: '=', value: '0' },
        hints: ['判别式 = b² − 4ac，只有一个根时它等于 0。', '代入 a = 1、b = −4：16 − 4c。', '让 16 − 4c = 0，解得 c = 4。'] },
      { id: 'touch', say: '图象刚好碰到 x 轴：只有 1 个交点', score: 4, when: { role: 'q', port: 'roots', op: '=', value: '1' },
        hints: ['看“与 x 轴交点数”的读数。', '把 c 调成判别式等于 0 的那个数。', 'c = 4，读数应为 1。'] },
    ],
    traps: [], goal: ['touch'],
    why: '判别式 b² − 4ac = 16 − 4c。只有一个交点时判别式为 0，所以 c = 4。判别式大于 0 有两个交点，小于 0 没有交点。',
  });

  // 9.2 陷阱：判别式的符号抄反
  U.problems.push({
    id: 'g9-discriminant-trap', title: '图象刚好碰到 x 轴，c 应该取多少？（小心判别式的符号）', grade: 9, domain: '函数', essence: ['E4', 'E8'], points: ['9.2'], level: 'trap', rung: 3,
    alias: ['判别式', '符号', '交点'], hook: 'y = x² − 4x + c。有人把 16 + 4c = 0 当成判别式为 0 的式子，算出的 c 对吗？',
    shelf: ['quad'],
    build() { const s = W.blank(); R(s, W.add(s, 'quad', 60, 60, { a: 1, b: -4, c: 0 }), 'q'); return s; },
    predict: null,
    milestones: [
      { id: 'disc', say: '判别式 b² − 4ac 等于 0', score: 3, when: { role: 'q', port: 'disc', op: '=', value: '0' },
        hints: ['判别式 = b² − 4ac，注意 c 前面有减号。', '代入 a = 1、b = −4：16 − 4c。', '让 16 − 4c = 0，解得 c = 4。'] },
      { id: 'touch', say: '图象刚好碰到 x 轴：只有 1 个交点', score: 4, when: { role: 'q', port: 'roots', op: '=', value: '1' },
        hints: ['看“与 x 轴交点数”的读数。', '把 c 调成判别式等于 0 的那个数。', 'c = 4，读数应为 1。'] },
    ],
    traps: [{ id: 'neg4', wrong: 'c = −4 是把判别式的符号抄反了：16 + 16 = 32 > 0，会有两个交点。判别式是 b² − 4ac，c 前面有减号。', when: { role: 'q', port: 'disc', op: '=', value: '32' } }],
    goal: ['touch'],
    why: '判别式 b² − 4ac = 16 − 4c。若误写成 16 + 4c = 0，会得到 c = −4，此时判别式为 32，图象和 x 轴有两个交点，不符合要求。',
  });

  // 9.3 二次函数的图象和性质（核心）：开口向下的顶点
  U.problems.push({
    id: 'g9-vertex-down-core', title: '抛物线 y = −x² + 2x + 3：最高点的 y 坐标是多少？', grade: 9, domain: '函数', essence: ['E8', 'E5'], points: ['9.3'], level: 'core', rung: 3,
    alias: ['二次函数', '顶点', '开口向下', '最大值'], hook: '这条抛物线开口朝下，顶点就是最高点。把它的系数设进抛物线器材，读出顶点。',
    shelf: ['quad'],
    build() { const s = W.blank(); R(s, W.add(s, 'quad', 60, 60, { a: 1, b: 0, c: 0 }), 'q'); return s; },
    predict: null,
    milestones: [
      { id: 'vx', say: '顶点的 x 坐标是 1', score: 3, when: { role: 'q', port: 'vx', op: '=', value: '1' },
        hints: ['顶点在对称轴上：x = −b ÷ (2a)。', '注意 a 是负数（开口朝下）。', 'a = −1，b = 2：−2 ÷ (−2) = 1。'] },
      { id: 'vy', say: '最高点的 y 坐标是 4', score: 4, when: { role: 'q', port: 'vy', op: '=', value: '4' },
        hints: ['把 x = 1 代回 y = −x² + 2x + 3。', '−1 + 2 + 3。', 'y = 4。'] },
    ],
    traps: [], goal: ['vy'],
    why: '开口向下时 a < 0，顶点是最高点。对称轴 x = −b ÷ (2a) = 1，代入得最高点 y = 4。',
  });

  // 9.3 陷阱：忘了 a 的负号
  U.problems.push({
    id: 'g9-vertex-down-trap', title: '抛物线 y = −x² + 2x + 3：顶点在哪里？（别漏了 a 的负号）', grade: 9, domain: '函数', essence: ['E8', 'E5'], points: ['9.3'], level: 'trap', rung: 3,
    alias: ['二次函数', '顶点', '符号', '对称轴'], hook: '算对称轴时，a 的正负号会改变结果。',
    shelf: ['quad'],
    build() { const s = W.blank(); R(s, W.add(s, 'quad', 60, 60, { a: 1, b: 0, c: 0 }), 'q'); return s; },
    predict: null,
    milestones: [
      { id: 'vx', say: '顶点的 x 坐标是 1', score: 3, when: { role: 'q', port: 'vx', op: '=', value: '1' },
        hints: ['顶点在对称轴上：x = −b ÷ (2a)。', '注意 a 是负数（开口朝下）。', 'a = −1，b = 2：−2 ÷ (−2) = 1。'] },
      { id: 'vy', say: '最高点的 y 坐标是 4', score: 4, when: { role: 'q', port: 'vy', op: '=', value: '4' },
        hints: ['把 x = 1 代回 y = −x² + 2x + 3。', '−1 + 2 + 3。', 'y = 4。'] },
    ],
    traps: [{ id: 'a-plus', wrong: '顶点 x = −1：忘了 a 是负数，算成了 −2 ÷ 2。开口朝下时 2a = −2，要带着负号。', when: { role: 'q', port: 'vx', op: '=', value: '-1' } }],
    goal: ['vy'],
    why: 'a = −1 时 2a = −2，对称轴 x = −b ÷ (2a) = −2 ÷ (−2) = 1。若把 a 当成 +1，会得到 x = −1，顶点就错了。',
  });

  // 9.4 二次函数与方程及应用（核心）：求最小值
  U.problems.push({
    id: 'g9-min-value-core', title: 'y = x² − 6x + 10 的最小值是多少？', grade: 9, domain: '函数', essence: ['E4', 'E8'], points: ['9.4'], level: 'core', rung: 3,
    alias: ['二次函数', '最值', '最小值', '顶点'], hook: 'a 是正数，抛物线开口朝上，最低点（顶点）的 y 坐标就是最小值。',
    shelf: ['quad'],
    build() { const s = W.blank(); R(s, W.add(s, 'quad', 60, 60, { a: 1, b: 0, c: 0 }), 'q'); return s; },
    predict: null,
    milestones: [
      { id: 'axis', say: '对称轴 x = 3（顶点的 x 坐标）', score: 3, when: { role: 'q', port: 'vx', op: '=', value: '3' },
        hints: ['先找顶点的 x 坐标：x = −b ÷ (2a)。', 'b 是 −6，a 是 1。', '−(−6) ÷ 2 = 3，把 b 调成 −6。'] },
      { id: 'min', say: '最小值是 1', score: 4, when: { role: 'q', port: 'vy', op: '=', value: '1' },
        hints: ['最小值 = 把顶点的 x 代回去。', '9 − 18 + 10。', '最小值是 1，把 c 调成 10。'] },
    ],
    traps: [], goal: ['min'],
    why: '函数 y = x² − 6x + 10 = (x − 3)² + 1，开口向上，最小值是 1，在 x = 3 时取到。',
  });

  // 9.8 弧长和扇形面积（核心）：扇形面积 = 圆面积 × 圆心角 ÷ 360
  U.problems.push({
    id: 'g9-sector-core', title: '半径 6 厘米、圆心角 90° 的扇形，面积是多少？（π 取 3.14）', grade: 9, domain: '图形', essence: ['E8', 'E5'], points: ['9.8'], level: 'core', rung: 3,
    alias: ['扇形面积', '弧长', '圆心角', '圆'], hook: '扇形是圆的一部分，圆心角 90° 占整圆的 90 ÷ 360。',
    shelf: ['circle', 'num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'circle', 60, 60, { r: 6, pi: 0 }), 'c'); return s; },
    predict: null,
    milestones: [
      { id: 'area', say: '整圆面积 113.04（π 取 3.14）', score: 3, when: { role: 'c', port: 'area', op: '=', value: '2826/25' },
        hints: ['整圆面积 = π × r × r。', '3.14 × 6 × 6。', '读出圆的“面积”输出：113.04。'] },
      { id: 'sector', say: '扇形面积 28.26', score: 4, when: { type: 'op', port: 'r', op: '=', value: '1413/50' },
        hints: ['扇形面积 = 整圆面积 × 圆心角 ÷ 360。', '先用乘法器把面积乘 90，再用除法器除以 360。', '113.04 × 90 ÷ 360 = 28.26。'] },
    ],
    traps: [], goal: ['sector'],
    why: '扇形面积 = 圆面积 × 圆心角 ÷ 360 = 3.14 × 6 × 6 × 90 ÷ 360 = 28.26 平方厘米。',
  });

  // 9.8 陷阱：把周长当成面积来算，结果是弧长
  U.problems.push({
    id: 'g9-sector-trap', title: '半径 6 厘米、圆心角 90° 的扇形，面积是多少？（别把弧长当面积）', grade: 9, domain: '图形', essence: ['E8', 'E5'], points: ['9.8'], level: 'trap', rung: 3,
    alias: ['扇形面积', '弧长', '周长', '圆心角'], hook: '圆的周长和面积都能算出来。扇形面积要用哪一个？',
    shelf: ['circle', 'num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'circle', 60, 60, { r: 6, pi: 0 }), 'c'); return s; },
    predict: null,
    milestones: [
      { id: 'area', say: '整圆面积 113.04（π 取 3.14）', score: 3, when: { role: 'c', port: 'area', op: '=', value: '2826/25' },
        hints: ['整圆面积 = π × r × r。', '3.14 × 6 × 6。', '读出圆的“面积”输出：113.04。'] },
      { id: 'sector', say: '扇形面积 28.26', score: 4, when: { type: 'op', port: 'r', op: '=', value: '1413/50' },
        hints: ['扇形面积 = 整圆面积 × 圆心角 ÷ 360。', '先用乘法器把面积乘 90，再用除法器除以 360。', '113.04 × 90 ÷ 360 = 28.26。'] },
    ],
    traps: [{ id: 'arc', wrong: '算出 9.42：用的是周长 37.68，乘 90 ÷ 360 得到的是弧长，不是扇形面积。', when: { type: 'op', port: 'r', op: '=', value: '471/50' } }],
    goal: ['sector'],
    why: '弧长 = 周长 × 圆心角 ÷ 360 = 37.68 × 90 ÷ 360 = 9.42。扇形面积要用圆的面积，不是周长。',
  });

  // 9.10 列举法求概率（核心）：列出所有情况，数出和为 7 的种数
  U.problems.push({
    id: 'g9-enum-prob-core', title: '掷两颗骰子，点数和是 7 的概率是多少？', grade: 9, domain: '统计与概率', essence: ['E7'], points: ['9.10'], level: 'core', rung: 3,
    alias: ['列举法', '概率', '骰子', '所有情况'], hook: '把两颗骰子的所有情况一一列出来，数出和为 7 的有几种，再除以总数。',
    shelf: ['enumerator', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'enumerator', 60, 60, { set: 0, target: 2, expected: 36 }), 'e'); return s; },
    predict: null,
    milestones: [
      { id: 'count', say: '和为 7 的情况有 6 种', score: 3, when: { role: 'e', port: 'count', op: '=', value: '6' },
        hints: ['把“和是几”设成 7。', '属性「和是几」。', '把 target 改成 7。'] },
      { id: 'prob', say: '概率是 1/6', score: 4, when: { type: 'op', port: 'r', op: '=', value: '1/6' },
        hints: ['概率 = 符合的情况数 ÷ 全部情况数。', '用除法器：甲接“和为 7 的情况数”，乙接“全部情况数”。', '6 ÷ 36 = 1/6。'] },
    ],
    traps: [], goal: ['prob'],
    why: '两颗骰子共有 36 种等可能的情况，其中和为 7 的有 6 种，概率为 6 ÷ 36 = 1/6。',
  });

  // 9.10 陷阱：分母写成 11（把和的种类当成等可能）
  U.problems.push({
    id: 'g9-enum-prob-trap', title: '掷两颗骰子，点数和是 7 的概率是多少？（分母要数哪些情况？）', grade: 9, domain: '统计与概率', essence: ['E7'], points: ['9.10'], level: 'trap', rung: 3,
    alias: ['列举法', '概率', '骰子', '等可能'], hook: '点数和一共有 2 到 12 这 11 种。能直接拿 11 当分母吗？',
    shelf: ['enumerator', 'op', 'num'],
    build() { const s = W.blank(); R(s, W.add(s, 'enumerator', 60, 60, { set: 0, target: 2, expected: 36 }), 'e'); return s; },
    predict: null,
    milestones: [
      { id: 'count', say: '和为 7 的情况有 6 种', score: 3, when: { role: 'e', port: 'count', op: '=', value: '6' },
        hints: ['把“和是几”设成 7。', '属性「和是几」。', '把 target 改成 7。'] },
      { id: 'prob', say: '概率是 1/6', score: 4, when: { type: 'op', port: 'r', op: '=', value: '1/6' },
        hints: ['概率 = 符合的情况数 ÷ 全部情况数。', '用除法器：甲接“和为 7 的情况数”，乙接“全部情况数”。', '6 ÷ 36 = 1/6。'] },
    ],
    traps: [{ id: 'eleven', wrong: '算出 6/11：把点数和的 11 种当成等可能，但 7 出现的机会远大于 2。全部情况是 36 种，不是 11 种。', when: { type: 'op', port: 'r', op: '=', value: '6/11' } }],
    goal: ['prob'],
    why: '点数和只有 11 种取值，但它们不等可能（和为 7 的有 6 种，和为 2 的只有 1 种）。要用 36 种等可能的情况作分母。',
  });

  // 9.12 图形的相似与位似（核心）：以原点放大 2 倍，相似比是 2
  U.problems.push({
    id: 'g9-similar-scale-core', title: '三角形以原点为位似中心放大：和原图相似吗？相似比是几？', grade: 9, domain: '图形', essence: ['E5', 'E3'], points: ['9.12'], level: 'core', rung: 3,
    alias: ['相似', '位似', '相似比', '放大'], hook: '位似放大：每个点的坐标都乘同一个数，放大后的图形与原图相似。',
    shelf: ['ftri', 'xform', 'figrel'],
    build() { const s = W.blank(); R(s, W.add(s, 'ftri', 60, 60, {}), 'a'); return s; },
    predict: null,
    milestones: [
      { id: 'xf', say: '放一台图形变换', score: 2, when: { count: { type: 'xform', ge: 1 } },
        hints: ['需要「图形变换」器材，把三角形接进去。', '“怎么变”选“以原点放大缩小”。', '放一台图形变换，选“以原点放大缩小”。'] },
      { id: 'scale', say: '相似比是 2', score: 4, when: { type: 'figrel', port: 'k', op: '=', value: '2' },
        hints: ['两个图形一个接原图、一个接放大后的图，用图形关系器材比较。', '放大倍数（分子）保持 2、分母 1。', '相似比 = 放大后的边 ÷ 原来的边 = 2。'] },
    ],
    traps: [], goal: ['scale'],
    why: '位似放大 2 倍时，每条边都变成原来的 2 倍，对应角不变，所以两图相似，相似比是 2。',
  });

  // 9.12 陷阱：只平移，相似比是 1
  U.problems.push({
    id: 'g9-similar-scale-trap', title: '三角形放大 2 倍（以原点为位似中心），相似比是几？', grade: 9, domain: '图形', essence: ['E5', 'E3'], points: ['9.12'], level: 'trap', rung: 3,
    alias: ['相似', '位似', '相似比', '平移', '全等'], hook: '变换器有好几种“怎么变”。哪一种才是位似放大？',
    shelf: ['ftri', 'xform', 'figrel'],
    build() { const s = W.blank(); R(s, W.add(s, 'ftri', 60, 60, {}), 'a'); return s; },
    predict: null,
    milestones: [
      { id: 'xf', say: '放一台图形变换', score: 2, when: { count: { type: 'xform', ge: 1 } },
        hints: ['需要「图形变换」器材，把三角形接进去。', '“怎么变”选“以原点放大缩小”。', '放一台图形变换，选“以原点放大缩小”。'] },
      { id: 'scale', say: '相似比是 2', score: 4, when: { type: 'figrel', port: 'k', op: '=', value: '2' },
        hints: ['两个图形一个接原图、一个接放大后的图，用图形关系器材比较。', '放大倍数（分子）保持 2、分母 1。', '相似比 = 放大后的边 ÷ 原来的边 = 2。'] },
    ],
    traps: [{ id: 'shift', wrong: '相似比是 1：平移不改变大小，只是全等，不是位似放大。', when: { type: 'figrel', port: 'k', op: '=', value: '1' } }],
    goal: ['scale'],
    why: '平移只改变位置，图形大小不变，相似比为 1（全等）。位似放大要用“以原点放大缩小”，倍数设为 2。',
  });

  // 9.13 相似三角形（核心）：对应边成比例时相似，相似比为对应边之比
  U.problems.push({
    id: 'g9-similar-tri-core', title: '甲是 3、4、5 的三角形，乙的 C 点移到哪里，才能和甲相似？相似比是几？', grade: 9, domain: '图形', essence: ['E5', 'E3'], points: ['9.13'], level: 'core', rung: 3,
    alias: ['相似三角形', '对应边', '相似比', '成比例'], hook: '乙的三条边要和甲的三条边成同一个比例。乙的 C 点 y 坐标应该是几？',
    shelf: ['ftri', 'figrel'],
    build() {
      const s = W.blank();
      R(s, W.add(s, 'ftri', 60, 60, {}), 'a');
      R(s, W.add(s, 'ftri', 260, 60, { bx: 8, cy: 5 }), 'b');
      return s;
    },
    predict: null,
    milestones: [
      { id: 'cmp', say: '放一台图形关系', score: 2, when: { count: { type: 'figrel', ge: 1 } },
        hints: ['比较两个图形要用「图形关系」器材。', '甲、乙各接一个口。', '放一台图形关系器材，甲、乙分别接两个三角形。'] },
      { id: 'sim', say: '两个三角形相似', score: 3, when: { type: 'figrel', port: 'sim', op: '=', value: true },
        hints: ['对应边要成同一个比例：甲的 3、4、5。', '乙的 8、5 不成比例，乙的 C 点 y 坐标要改。', '把乙的 C 点 y 改成 6：乙变成 8、6、10。'] },
      { id: 'k', say: '相似比是 2', score: 4, when: { type: 'figrel', port: 'k', op: '=', value: '2' },
        hints: ['相似比 = 乙的边 ÷ 甲的对应边。', '8 ÷ 4 = 2。', '相似比 2。'] },
    ],
    traps: [], goal: ['k'],
    why: '甲的边为 3、4、5，乙的边为 8、6、10，对应边之比都是 2，所以相似，相似比为 2。',
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
