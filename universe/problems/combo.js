/* 综合示例：几个器材配合着用。每道题的 build 把器材摆好但先不接线，参考解（tests/solutions-combo.js）负责接线。
 * 里程碑看的是输出的数值，所以只有接对了线，才会通关。 */
(function (G) {
  'use strict';
  const U = G.U, mk = U.mkScene, P = U.problems;
  const E = (type, x, y, role, props) => ({ type, x, y, role, props: props || {} });

  // 1. 分式加法：两张分数卡 → 分式运算 → 分式读数 → 读数器
  P.push({
    id: 'combo-fraction-sum', essence: ['E3', 'E2'], title: '1/2 + 1/3 等于多少？用两张分数卡和一台读数器接起来看', grade: 6, domain: '数与运算', points: ['6.12'],
    topics: ['分数加法', '异分母分数'], alias: ['综合', '分数'], hook: '两张分数卡分别是 1/2 和 1/3。把它们接进分式运算，再用读数器看结果。接对了，读数器上会出现一个数。',
    shelf: ['fracnum', 'ratop', 'ratread', 'meter'],
    build: mk({ ents: [
      E('fracnum', 60, 80, 'f1', { num: 1, den: 2 }),
      E('fracnum', 60, 200, 'f2', { num: 1, den: 3 }),
      E('ratop', 240, 140, 'op', { op: 0 }),
      E('ratread', 420, 140, 'rd', {}),
      E('meter', 600, 140, 'show', { digits: 3 }),
    ] }),
    milestones: [
      { id: 'read', say: '读数器上出现 5/6 的小数（0.833）', score: 10, when: (w) => w.some('meter', (e) => { const v = w.num(e, 'v'); return v !== null && Math.abs(v - 5 / 6) < 1e-6; }), hints: ['分式运算要两个输入都接上。', '把两张分数卡分别接到运算的 a 和 b。', '运算 → 分式读数 → 读数器。'] },
    ],
    traps: [], why: '1/2 + 1/3 = 5/6：先通分（3/6 + 2/6），再相加。器材的顺序就是计算的顺序：两个数进，运算，读成小数，显示出来。', ref: ['ratio|0'],
  });

  // 2. 代入：代数式 → 代入器 → 读数器
  P.push({
    id: 'combo-substitute', essence: ['E8', 'E3'], title: '把 x = 3 代入 x²+1，结果是几？', grade: 7, domain: '关系', points: ['7.2'],
    topics: ['代入求值'], alias: ['综合', '代数式'], hook: '代数式卡上写着 x^2+1。代入器把 x 换成 3，读数器显示结果。',
    shelf: ['algebra', 'subst', 'meter'],
    build: mk({ ents: [
      E('algebra', 60, 120, 'p', { text: 'x^2+1' }),
      E('subst', 280, 120, 'sub', { var: 'x', value: 3, check: false }),
      E('meter', 500, 120, 'show', { digits: 0 }),
    ] }),
    milestones: [
      { id: 'ten', say: '读数器显示 10', score: 10, when: (w) => w.some('meter', (e) => w.num(e, 'v') === 10), hints: ['代数式要先接到代入器上。', '代入器输出的 v 接到读数器。', '3 的平方加 1。'] },
    ],
    traps: [], why: '代入就是把字母换成数再算。x²+1 的 x 换成 3，得到 9+1 = 10。', ref: ['variable|0'],
  });

  // 3. 方程组：两个方程 → 方程台 → 方程组台 → 读数器
  P.push({
    id: 'combo-system-interval', essence: ['E5', 'E8'], title: '2x+y=7 和 x−y=2 一起解：x 是几？', grade: 8, domain: '关系', points: ['8.11'],
    topics: ['二元一次方程组'], alias: ['综合', '方程组'], hook: '把两个方程分别用方程台接好，再交给方程组台。方程组台给出 x、y，读数器显示 x。',
    shelf: ['algebra', 'eqdesk', 'system2', 'numline_iv', 'meter'],
    build: mk({ ents: [
      E('algebra', 40, 60, 'a1', { text: '2*x+y' }),
      E('algebra', 40, 130, 'a2', { text: '7' }),
      E('eqdesk', 230, 95, 'e1', {}),
      E('algebra', 40, 260, 'a3', { text: 'x-y' }),
      E('algebra', 40, 330, 'a4', { text: '2' }),
      E('eqdesk', 230, 295, 'e2', {}),
      E('system2', 430, 190, 'sys', {}),
      E('numline_iv', 430, 340, 'nl', { probe: 1, lo: -5, hi: 5 }),
      E('meter', 640, 190, 'show', { digits: 0 }),
    ] }),
    milestones: [
      { id: 'sol', say: '读数器上是方程组的解 x = 3', score: 10, when: (w) => w.some('meter', (e) => w.num(e, 'v') === 3), hints: ['方程组台需要两个方程都接进来。', '两个方程台的 eq 输出，接到 A 和 B。', '解 x 从方程组台的 x 输出读出。'] },
    ],
    traps: [], why: '2x+y=7 和 x−y=2 相加得 3x=9，x=3，y=1。方程组台把两个方程合起来解。', ref: ['linsolve|0'],
  });

  // 4. 平移不改变面积：正方形 → 块（平移）→ 面积读数 → 读数器；圆的面积单独读
  P.push({
    id: 'combo-move-area', essence: ['E9', 'E3'], title: '一个正方形平移以后，面积还一样吗？', grade: 7, domain: '图形', points: ['5.8'],
    topics: ['平移不改变面积', '圆的面积'], alias: ['综合', '图形变换'], hook: '正方形 s=2 接进块，块向右平移 3。面积读数接在块后面，看平移后的面积。圆的面积也读出来。',
    shelf: ['frect', 'gpiece', 'garea', 'fcirc', 'meter'],
    build: mk({ ents: [
      E('frect', 60, 80, 'sq', { s: 2, ox: 0, oy: 0 }),
      E('gpiece', 260, 80, 'blk', { dx: 3, dy: 0, turn: 0, flip: 0, scale: '1', name: '块 1', color: '#f6c177', locked: false }),
      E('garea', 460, 80, 'ga', {}),
      E('meter', 640, 80, 'show', { digits: 2 }),
      E('fcirc', 60, 260, 'c', { cx: 0, cy: 0, r: 2 }),
      E('meter', 640, 260, 'circ', { digits: 2 }),
    ] }),
    milestones: [
      { id: 'area', say: '平移后的面积和平移前一样', score: 10, when: (w) => { const sq = w.ofType('frect')[0], target = sq ? w.num(sq, 'area') : null; return target !== null && w.some('meter', (e) => e.role === 'show' && w.num(e, 'v') === target); }, hints: ['正方形接进块，块接进面积读数。', '块的输出 f 接到面积读数的 f。', '面积读数的 s 接到读数器的 v。', '平移后的面积应该和正方形的面积一样。'] },
    ],
    traps: [], why: '平移只改变位置，不改变形状和面积：正方形面积是 2×2 = 4，移到哪里都一样。圆的面积是 πr² = 4π。', ref: ['circle|0'],
  });

  // 5. 不变量与证据检查：不变量追踪器 → 证据检查器
  P.push({
    id: 'combo-invariant-check', essence: ['E4', 'E9'], title: '每次加 0，这个数是不变量吗？不变量追踪器能下结论吗？用证据检查器看', grade: 9, domain: '关系', points: ['9.12'],
    topics: ['不变量', '证明'], alias: ['综合', '证明'], hook: '不变量追踪器记录每一步的变化，但它只看不证：证据等级是 0。证据检查器接上它，判断证据够不够。',
    shelf: ['invariant', 'proofcheck'],
    build: mk({ ents: [
      E('invariant', 60, 120, 'inv', { change: 0, times: 4, start: 5 }),
      E('proofcheck', 320, 120, 'pc', { want: 1, label: '不变量' }),
    ] }),
    milestones: [
      { id: 'linked', say: '把不变量的证据等级接到证据检查器', score: 5, when: (w) => { const a = w.ofType('invariant')[0], b = w.ofType('proofcheck')[0]; return !!a && !!b && w.linked(a, b); }, hints: ['证据检查要读不变量追踪器的结果。', '不变量的 lv 输出接到证据检查的 lv 输入。'] },
      { id: 'ok', say: '证据检查器判断：证据不够（追踪器只看不证）', score: 10, when: (w) => w.some('proofcheck', (e) => w.bool(e, 'ok') === false), hints: ['证据检查器要读不变量追踪器的等级。', '追踪器只记录看到的结果，等级是 0。', '检查器显示“不够”，说明还要用证明脚手架把道理写出来。'] },
    ],
    traps: [], why: '每次加 0，数始终是 5：这是事实，但追踪器只能看见、不能证明，所以证据等级是 0。证据检查器据此判断证据不够。要下结论，还要用证明脚手架写出理由。', ref: ['invariant|0'],
  });

  // 6. 二次函数：一个函数 → 顶点的 x、y 读出来；与坐标轴的交点是符号点，摆在台面上一起看
  P.push({
    id: 'combo-parabola-vertex', essence: ['E2', 'E5'], title: 'y = x²−2x−3：顶点的横坐标是几？', grade: 9, domain: '函数', points: ['9.12'],
    topics: ['二次函数的顶点', '与坐标轴的交点'], alias: ['综合', '抛物线'], hook: '抛物线 y=x²−2x−3。函数器读出顶点的 x、y；精确的顶点、与 x 轴的交点、与 y 轴的交点摆在旁边对照。',
    shelf: ['quad', 'quad-vertex', 'quad-xint', 'quad-yint', 'meter'],
    build: mk({ ents: [
      E('quad', 60, 120, 'q', { a: 1, b: -2, c: -3 }),
      E('quad-vertex', 300, 60, 'qv', { a: 1, b: -2, c: -3, label: '顶点' }),
      E('quad-xint', 300, 190, 'qx', { a: 1, b: -2, c: -3, label: '与 x 轴' }),
      E('quad-yint', 300, 320, 'qy', { a: 1, b: -2, c: -3, label: '与 y 轴' }),
      E('meter', 540, 80, 'mx', { digits: 0 }),
      E('meter', 540, 200, 'my', { digits: 0 }),
    ] }),
    milestones: [
      { id: 'vx', say: '读数器上是顶点的 x = 1', score: 10, when: (w) => w.some('meter', (e) => e.role === 'mx' && w.num(e, 'v') === 1), hints: ['函数的顶点 x 是哪个输出？', 'quad 的 vx 接到读数器。', '顶点 x 是 −b/(2a) = 1。'] },
      { id: 'vy', say: '读数器上是顶点的 y = −4', score: 10, when: (w) => w.some('meter', (e) => e.role === 'my' && w.num(e, 'v') === -4), hints: ['vy 是第二个输出。', '第二台读数器接 vy。', '把 x=1 代回去：1−2−3 = −4。'] },
    ],
    traps: [], why: '顶点式：y = (x−1)² − 4，顶点 (1, −4)。三个精确点（顶点、两个交点）是同一条抛物线的不同信息，函数器给出数，符号点给出精确的位置。', ref: ['quad|0'],
  });

  // 7. 三角形与四边形的面积比较：图形 → 面积 → 比较器 / 比例器；两个三角形是否全等
  P.push({
    id: 'combo-shapes-compare', essence: ['E9', 'E3'], title: '哪一个三角形的面积大？它们全等吗？', grade: 7, domain: '图形', points: ['5.8'],
    topics: ['三角形面积', '全等'], alias: ['综合', '面积'], hook: '直角三角形和等腰三角形各自的面积读出来，比较器判断谁大；图形关系器判断两个三角形是不是全等。',
    shelf: ['frtri', 'fisotri', 'fscalene', 'compare', 'figrel', 'ratio', 'meter'],
    build: mk({ ents: [
      E('frtri', 60, 60, 'rt', { s: 2, ox: 0, oy: 0 }),
      E('fisotri', 60, 220, 'it', { s: 2, ox: 0, oy: 0 }),
      E('fscalene', 60, 380, 'sc', { s: 3, ox: 0, oy: 0 }),
      E('compare', 320, 100, 'cmp', { op: 1 }),
      E('figrel', 320, 260, 'rel', { ask: 0, showMap: 0 }),
      E('ratio', 320, 400, 'rat', { total: 0, simplify: 1 }),
      E('meter', 560, 100, 'show', { digits: 2 }),
    ] }),
    milestones: [
      { id: 'cmp', say: '比较器判断：直角三角形面积比等腰三角形大（真）', score: 8, when: (w) => w.some('compare', (e) => w.bool(e, 'ok') === true), hints: ['比较器的 a 和 b 接两个面积。', '两个三角形的 area 输出。', 'a 接直角三角形，b 接等腰三角形。'] },
      { id: 'rel', say: '图形关系器读出两个三角形全等与否', score: 8, when: (w) => w.some('figrel', (e) => w.bool(e, 'cong') !== null), hints: ['图形关系器的 a、b 接两个图形。', '图形的 f 输出，接到 a 和 b。'] },
      { id: 'show', say: '读数器上是等腰三角形的面积', score: 4, when: (w) => w.some('meter', (e) => w.num(e, 'v') !== null), hints: ['面积输出接到读数器。'] },
    ],
    traps: [], why: '直角三角形 s=2 的面积是 2，等腰三角形 s=2 的面积是 2 ... 比较器用来比大小，图形关系器用来判断全等：面积相等不一定全等，全等一定面积相等。', ref: ['tri|0'],
  });

  // 8. 八种四边形：面积并排比较，比例器看它们的比
  P.push({
    id: 'combo-quad-family', essence: ['E9', 'E2'], title: '八种四边形：谁的面积是正方形的两倍？', grade: 8, domain: '图形', points: ['5.8'],
    topics: ['四边形面积', '图形分类'], alias: ['综合', '四边形'], hook: '正方形、平行四边形、菱形、梯形、等腰梯形、直角梯形、筝形……每一种都可以拖动。它们的面积读出来，比例器看它们的比。',
    shelf: ['fsquare', 'fpgram', 'frhomb', 'ftrap', 'fisotrap', 'frtrap', 'fkite', 'fquad4', 'ratio', 'meter'],
    build: mk({ ents: [
      E('fsquare', 40, 60, 'sq', { s: 2, ox: 0, oy: 0 }),
      E('fpgram', 220, 60, 'pg', { s: 2, ox: 0, oy: 0 }),
      E('frhomb', 400, 60, 'hb', { s: 2, ox: 0, oy: 0 }),
      E('ftrap', 40, 240, 'tz', { s: 2, ox: 0, oy: 0 }),
      E('fisotrap', 220, 240, 'it', { s: 2, ox: 0, oy: 0 }),
      E('frtrap', 400, 240, 'rt', { s: 2, ox: 0, oy: 0 }),
      E('fkite', 40, 420, 'kt', { s: 2, ox: 0, oy: 0 }),
      E('fquad4', 220, 420, 'qd', { s: 2, ox: 0, oy: 0 }),
      E('ratio', 420, 420, 'rat', { total: 0, simplify: 1 }),
      E('meter', 580, 420, 'show', { digits: 2 }),
    ] }),
    milestones: [
      { id: 'ratio', say: '比例器接上了正方形和平行四边形的面积', score: 10, when: (w) => w.some('ratio', (e) => w.num(e, 'ra') !== null && w.num(e, 'rb') !== null), hints: ['比例器的 a、b 接两个面积。', '正方形的 area 接到 a。', '平行四边形的 area 接到 b。'] },
      { id: 'show', say: '读数器上是比例 ra（正方形面积的比）', score: 5, when: (w) => w.some('meter', (e) => w.num(e, 'v') !== null), hints: ['比例器的 ra 接到读数器。'] },
    ],
    traps: [], why: '八种四边形的面积各不相同，但它们都能用底和高算。比例器把两个面积放在一起比，学生能看见“两倍”是怎么来的。',
    ref: ['quad|0'],
  });

  // 9. 分数与图形面积的凑数：tenframe 的数 → 读数器
  P.push({
    id: 'combo-tenframe-count', essence: ['E3', 'E1'], title: '十格阵里放了 3 个筹码，读数器上是几？', grade: 1, domain: '数与运算', points: ['4.9'],
    topics: ['凑十', '数的组成'], alias: ['综合', '数数'], hook: '十格阵已经放了 3 个筹码。把十格阵接到读数器上，读出里面有几个。',
    shelf: ['tenframe', 'counter', 'meter'],
    build: () => {
      const W = U.World, s = W.blank();
      const tf = W.add(s, 'tenframe', 60, 100, { label: '十格阵', show: true }); s.entities[tf].role = 'tf';
      for (let i = 0; i < 3; i++) { const c = W.add(s, 'counter', 300, 40 + i * 40, {}); W.act(s, { t: 'put', id: c, parent: tf, slot: 'cells' }); }
      const m = W.add(s, 'meter', 380, 100, { digits: 0 }); s.entities[m].role = 'show';
      return s;
    },
    milestones: [
      { id: 'count', say: '读数器上显示 3（十格阵里的筹码数）', score: 10, when: (w) => w.some('meter', (e) => w.num(e, 'v') === 3), hints: ['十格阵有个 count 输出。', '把 count 接到读数器。', '数一数里面的筹码（已经放进去 3 个）。'] },
    ],
    traps: [], why: '十格阵是 2×5 的格子。数一数有几个筹码，就是 count。把它接到读数器，数字就显示出来。',
    ref: ['counter|0'],
  });

  // 10. 运算器与代数式：代数式 → 代入器 → 代数读数器；表达式读数
  P.push({
    id: 'combo-expr-read', essence: ['E8', 'E4'], title: '一个式子和一个方程：式子读数是几？方程有没有解？', grade: 8, domain: '关系', points: ['8.11'],
    topics: ['代数式读数', '方程的解'], alias: ['综合', '式子'], hook: '式子工作台处理式子；代数式读数器读出一个代数式在某个 x 下的值。两个方程用方程台接好后，式子工作台判断它们是否同解。',
    shelf: ['exprbench', 'exprread', 'eqdesk', 'algebra', 'meter'],
    build: mk({ ents: [
      E('algebra', 40, 80, 'p', { text: 'x+1' }),
      E('eqdesk', 240, 80, 'e', {}),
      E('exprbench', 440, 80, 'wb', { label: '同解吗' }),
      E('exprread', 240, 260, 'er', { x: 2, y: 0, label: '读数' }),
    ] }),
    milestones: [
      { id: 'poly', say: '代数式接进式子工作台', score: 10, when: (w) => w.some('exprbench', (e) => w.linked(w.ofType('algebra')[0], e)), hints: ['式子工作台要接一个代数式。', '代数式卡的 p 输出接到式子工作台的 f。'] },
    ],
    traps: [], why: '式子工作台比较两个式子是否同解；代数式读数器给出一个式子在某点的值。两件事都要求把式子接进对应的器材。',
    ref: ['variable|0'],
  });

  // 11. 整数运算：除法、位数、最大公约数与幂
  P.push({
    id: 'combo-number-chain', essence: ['E3', 'E2'], title: '17 ÷ 5 的商和余数；2024 的数字和；12 和 18 的最大公约数；2 的 3 次方', grade: 5, domain: '数与运算', points: ['5.4'],
    topics: ['带余除法', '数位', '最大公约数', '乘方'], alias: ['综合', '整数'], hook: '四条小路各接一台器材：带余除法给商和余数，数位板数数字，数的性质找最大公约数，乘方算幂。读数器把结果显示出来。',
    shelf: ['divmod', 'digits', 'numtheory', 'power', 'num', 'meter'],
    build: mk({ ents: [
      E('num', 40, 60, 'n17', { n: 17 }), E('num', 40, 130, 'n5', { n: 5 }),
      E('divmod', 220, 95, 'dm', { mode: 0, show: 0 }),
      E('meter', 420, 40, 'mq', { digits: 0 }), E('meter', 420, 120, 'mr', { digits: 0 }),
      E('num', 40, 230, 'n2024', { n: 2024 }),
      E('digits', 220, 230, 'dg', { base: 10, width: 6, weights: true }),
      E('meter', 420, 230, 'msum', { digits: 0 }),
      E('num', 40, 320, 'x12', { n: 12 }), E('num', 40, 380, 'x18', { n: 18 }),
      E('numtheory', 220, 350, 'nt', { show: 0, limit: 100000 }),
      E('meter', 420, 340, 'mg', { digits: 0 }),
      E('num', 40, 440, 'two', { n: 2 }),
      E('power', 220, 440, 'pw', { e: 3, sci: false }),
      E('meter', 420, 440, 'mp', { digits: 0 }),
    ] }),
    milestones: [
      { id: 'div', say: '商 3、余数 2 都读出来了', score: 8, when: (w) => w.some('meter', (e) => e.role === 'mq' && w.num(e, 'v') === 3) && w.some('meter', (e) => e.role === 'mr' && w.num(e, 'v') === 2), hints: ['带余除法的 a 是被除数，b 是除数。', 'q 是商，r 是余数。', '17 = 5 × 3 + 2。'] },
      { id: 'digits', say: '2024 的数字和是 8', score: 6, when: (w) => w.some('meter', (e) => e.role === 'msum' && w.num(e, 'v') === 8), hints: ['数位板的 v 接 2024。', 'sum 输出是数字和。'] },
      { id: 'nt', say: '最大公约数 6 和 2 的 3 次方 8 都读出来了', score: 8, when: (w) => w.some('meter', (e) => e.role === 'mg' && w.num(e, 'v') === 6) && w.some('meter', (e) => e.role === 'mp' && w.num(e, 'v') === 8), hints: ['数的性质的 a、b 接 12、18，gcd 输出是最大公约数。', '乘方的 a 接 2，指数 e 是 3。'] },
    ],
    traps: [], why: '17 = 5×3 + 2，商 3 余 2；2024 的数字和是 2+0+2+4 = 8；12 和 18 的最大公约数是 6；2³ = 8。几台器材各算一件事，读数器把它们放在一起。', ref: ['numtheory|0'],
  });

  // 12. 百分数与分数条：比、百分数、分数条、估算
  P.push({
    id: 'combo-percent-bar', essence: ['E3', 'E9'], title: '3 是 4 的百分之几？用分数条画出来，再估一估', grade: 6, domain: '数与运算', points: ['6.12'],
    topics: ['百分数', '分数的意义'], alias: ['综合', '百分数'], hook: '百分数器算出 3 是 4 的百分之几；分数条把这个比例画成格子；估算器检查你猜的答案离多远。',
    shelf: ['num', 'percent', 'fracbar', 'estimate', 'meter'],
    build: mk({ ents: [
      E('num', 40, 60, 'a', { n: 3 }), E('num', 40, 140, 'b', { n: 4 }),
      E('percent', 220, 100, 'pc', { mode: 0, digits: 0, label: '百分之几' }),
      E('meter', 420, 60, 'mp', { digits: 0 }),
      E('fracbar', 220, 240, 'fb', { parts: 4, whole: 1, shade: true }),
      E('meter', 420, 240, 'mfb', { digits: 2 }),
      E('estimate', 220, 360, 'es', { mode: 0, guess: '75', lo: '70', hi: '80' }),
    ] }),
    milestones: [
      { id: 'pc', say: '百分数器算出 3 是 4 的 75%（读数器显示 75）', score: 8, when: (w) => w.some('meter', (e) => e.role === 'mp' && w.num(e, 'v') === 75), hints: ['百分数器的 a 是部分，b 是整体。', '百分数器的 r 输出接到读数器。'] },
      { id: 'bar', say: '分数条的读数器显示 0.75', score: 6, when: (w) => w.some('meter', (e) => e.role === 'mfb' && w.num(e, 'v') !== null), hints: ['分数条的 v 输入接百分数器的 r。'] },
      { id: 'est', say: '估算器判断：75 在范围 70–80 里', score: 6, when: (w) => w.some('estimate', (e) => w.bool(e, 'inRange') === true), hints: ['估算器的 actual 接百分数器的 r。'] },
    ],
    traps: [], why: '3 是 4 的 3/4，也就是 75%。分数条把 3/4 画成 4 格里涂 3 格。估算器用来检查猜测：75 在 70 到 80 的范围里。',
    ref: ['ratio|0'],
  });

  // 13. 直线、反比例、圆与符号点：直线 → 代入器 → 读数；反比例 → 读数；圆与直线；点的旋转
  P.push({
    id: 'combo-line-inverse-rotate', essence: ['E2', 'E5'], title: 'y = 2x + 1 在 x = 3 时是几？反比例 6/x 在 x = 2 时是几？点 (3,2) 绕原点转 90° 去哪里？', grade: 7, domain: '函数', points: ['7.6'],
    topics: ['一次函数', '反比例', '旋转'], alias: ['综合', '函数'], hook: '直线器画 y=2x+1，代入器取 x=3 的值；反比例器算 6/x；直线与圆判断关系；点的旋转器把点绕原点转 90°。',
    shelf: ['line', 'at', 'inverse-prop', 'circle-line', 'pair-pos', 'rotate-about', 'meter'],
    build: mk({ ents: [
      E('line', 40, 60, 'ln', { k: 2, b: 1, range: 5 }),
      E('at', 220, 60, 'at3', { x: 3 }),
      E('meter', 400, 60, 'm1', { digits: 0 }),
      E('inverse-prop', 40, 200, 'ip', { k: 6, x: 2 }),
      E('meter', 220, 200, 'm2', { digits: 0 }),
      E('circle-line', 40, 340, 'cl', { r: 3, d: 2 }),
      E('meter', 220, 340, 'm3', { digits: 0 }),
      E('pair-pos', 400, 200, 'pp', { col: 3, row: 2 }),
      E('rotate-about', 400, 340, 'rot', { cx: 0, cy: 0, angle: 0 }),
    ] }),
    milestones: [
      { id: 'line', say: '直线 y=2x+1 在 x=3 时是 7', score: 8, when: (w) => w.some('meter', (e) => e.role === 'm1' && w.num(e, 'v') === 7), hints: ['直线的 f 接代入器。', '代入器的 y 接读数器。', '2×3+1 = 7。'] },
      { id: 'inv', say: '反比例 6/x 在 x=2 时是 3', score: 6, when: (w) => w.some('meter', (e) => e.role === 'm2' && w.num(e, 'v') === 3), hints: ['反比例器直接读出 y。', '接到读数器的 v。'] },
      { id: 'rot', say: '点 (3,2) 绕原点转 90° 的位置接上了', score: 6, when: (w) => w.linked(w.ofType('pair-pos')[0], w.ofType('rotate-about')[0]), hints: ['点的 p 输出接到旋转器的 p 输入。'] },
    ],
    traps: [], why: 'y=2x+1 在 x=3 时 y=7；反比例 y=6/x 在 x=2 时 y=3；点 (3,2) 绕原点逆时针转 90° 到 (−2,3)。直线、反比例、旋转各是一种函数或变换，器材把它们的结果读出来。',
    ref: ['line|0'],
  });

  // 14. 图形测量：长方形 → 变换 → 测量；面积不变
  P.push({
    id: 'combo-measure-transform', essence: ['E9', 'E3'], title: '一个长方形旋转 90° 之后，面积和周长变了吗？', grade: 6, domain: '图形', points: ['5.8'],
    topics: ['图形变换', '面积与周长'], alias: ['综合', '图形测量'], hook: '长方形经过变换器旋转 90°，再接进测量器。读出面积和周长，和原来比一比。',
    shelf: ['frect', 'xform', 'figmeasure', 'meter'],
    build: mk({ ents: [
      E('frect', 40, 80, 'fr', { s: 2, ox: 0, oy: 0 }),
      E('xform', 240, 80, 'xf', { mode: 1 }),
      E('figmeasure', 440, 80, 'fm', { digits: 2, showWhy: true, note: '' }),
      E('meter', 640, 40, 'ma', { digits: 0 }),
      E('meter', 640, 140, 'mpm', { digits: 0 }),
    ] }),
    milestones: [
      { id: 'same', say: '旋转后的面积和原来的一样', score: 10, when: (w) => { const fr = w.ofType('frect')[0]; const target = fr ? w.num(fr, 'area') : null; return target !== null && w.some('meter', (e) => e.role === 'ma' && w.num(e, 'v') === target); }, hints: ['长方形接变换器，变换器接测量器。', '测量器的 area 接到读数器。', '旋转不改变面积。'] },
      { id: 'perim', say: '周长也读出来了', score: 5, when: (w) => w.some('meter', (e) => e.role === 'mpm' && w.num(e, 'v') !== null), hints: ['测量器的 perim 接到第二台读数器。'] },
    ],
    traps: [], why: '旋转只改变方向，面积和周长都不变。把两次测量的数放在一起，学生能看见“变的是位置，不变的是大小”。',
    ref: ['rect|0'],
  });

  // 15. 数据分析：数据表 → 拟合 → 预测；统计量与两路表
  P.push({
    id: 'combo-data-fit', essence: ['E5', 'E9'], title: '每分钟跑 60 米：拟合出直线，预测 5 分钟跑多远？', grade: 9, domain: '统计与概率', points: ['9.12'],
    topics: ['拟合', '预测', '统计量'], alias: ['综合', '数据'], hook: '数据表记录时间和路程；拟合器找出一条直线，预测器用它推 5 分钟的路程；统计器算平均数，两路表算总数。',
    shelf: ['datatable', 'column', 'scatter', 'fit', 'predict', 'data', 'stats', 'twoway', 'line', 'meter'],
    build: mk({ ents: [
      E('datatable', 40, 60, 'dt', { data: '1,60;2,120;3,180', xname: '时间', yname: '路程' }),
      E('column', 40, 200, 'col', { col: 1, label: '路程' }),
      E('fit', 240, 60, 'ft', { model: 0, xcol: 0, ycol: 1 }),
      E('meter', 420, 60, 'mk', { digits: 0 }),
      E('predict', 240, 200, 'pr', { x: 5, label: '5 分钟', note: true }),
      E('meter', 420, 200, 'my', { digits: 0 }),
      E('line', 240, 340, 'ln', { k: 1, b: 0, range: 5 }),
      E('scatter', 420, 340, 'sc', { xcol: 0, ycol: 1, label: '散点' }),
      E('data', 40, 360, 'd', { list: '3, 5, 5, 6, 9', lo: 0, hi: 20 }),
      E('stats', 220, 400, 'st', { want: 0, digits: 1, minN: 1 }),
      E('meter', 420, 440, 'mst', { digits: 1 }),
      E('twoway', 40, 500, 'tw', { data: '3,2;1,4', label: '两路表' }),
      E('meter', 240, 500, 'mtw', { digits: 0 }),
    ] }),
    milestones: [
      { id: 'slope', say: '拟合的斜率是 60（每分钟 60 米）', score: 8, when: (w) => w.some('meter', (e) => e.role === 'mk' && w.num(e, 'v') === 60), hints: ['拟合器的 t 接数据表。', '斜率 k 接到读数器。'] },
      { id: 'pred', say: '预测 5 分钟跑 300 米', score: 8, when: (w) => w.some('meter', (e) => e.role === 'my' && w.num(e, 'v') === 300), hints: ['预测器的 f 接拟合器的 f。', '预测器的 y 接读数器。'] },
      { id: 'stat', say: '两路表的总数是 10', score: 6, when: (w) => w.some('meter', (e) => e.role === 'mtw' && w.num(e, 'v') === 10), hints: ['两路表的 total 接读数器。'] },
    ],
    traps: [], why: '数据大致在一条直线上，拟合器给出斜率 60；预测器把 x=5 代入，得到 300。统计量和两路表是另外两种读法：平均数和总数。',
    ref: ['datatable|0'],
  });

  // 16. 循环与掷骰：记忆器加 1 循环，骰子的结果直方图
  P.push({
    id: 'combo-loop-dice', essence: ['E1', 'E4'], title: '记忆器每拍加 1，走 5 拍后是几？骰子掷 5 次，直方图怎样？', grade: 4, domain: '时间与变化', points: ['4.9'],
    topics: ['递推', '随机'], alias: ['综合', '循环'], hook: '记忆器的输出 +1 再送回记忆器，每走一拍数就涨 1。骰子的结果送进直方图，掷得越多，图越能说明问题。',
    shelf: ['memory', 'op', 'num', 'dice', 'hist', 'meter'],
    build: mk({ ents: [
      E('memory', 40, 60, 'mem', { init: 0, hold: 1, wrap: 0 }),
      E('num', 40, 180, 'one', { n: 1 }),
      E('op', 220, 120, 'op', { op: 0 }),
      E('meter', 420, 60, 'mm', { digits: 0 }),
      E('dice', 40, 320, 'dc', { sides: 6, every: 1, salt: 0 }),
      E('hist', 220, 320, 'hs', { lo: 1, hi: 6, mode: 0 }),
      E('meter', 420, 320, 'mh', { digits: 0 }),
    ] }),
    milestones: [
      { id: 'mem', say: '记忆器走 5 拍，数到 5', score: 8, when: (w) => w.some('memory', (e) => w.num(e, 'v') === 5), hints: ['记忆器的 v 接运算的 a；1 接 b。', '运算的 r 送回记忆器的 in。', '点“走一拍”五次。'] },
      { id: 'hist', say: '直方图已经记录了掷骰子的结果（至少 3 次）', score: 8, when: (w) => w.some('hist', (e) => { const n = w.num(e, 'n'); return n !== null && n >= 3; }), hints: ['骰子的 v 接直方图的 v。', '直方图的 n 是已经记下的次数。'] },
    ],
    traps: [], why: '记忆器加 1 的循环，每拍数就增加 1，走 5 拍得到 5。骰子每拍掷一次，直方图记录次数：掷得越多，形状越接近概率。',
    ref: ['memory|0'],
  });

  U.problemsCombo = P.filter((p) => /^combo-/.test(p.id));
})(typeof globalThis !== 'undefined' ? globalThis : window);
