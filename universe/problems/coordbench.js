/* 坐标与函数操作台的题（docs/instrument-design.md 第 4 节）。开场都没到目标：学生自己拖截距、拖斜率、拖点、拖顶点。
 * 全部可以在图上直接完成。判分只看器材的输出（斜率、截距、探针处的 y、顶点、交点个数……）。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const cb = (props) => () => { const s = W.blank(); const id = W.add(s, 'coordbench', 40, 40, props); s.entities[id].role = 'c'; return s; };
  const P = [];
  const base = { domain: '函数', level: 'core', shelf: ['coordbench'], traps: [], predict: null };
  const add = (o) => P.push(Object.assign({}, base, o));
  const ms = (id, say, score, port, value, hints) => ({ id, say, score, when: { role: 'c', port, op: '=', value: String(value) }, hints });

  add({
    id: 'cb-2x-plus-1', essence: ['E6', 'E2'], title: '画出 y = 2x + 1', grade: 8, rung: 2, points: ['8.9'],
    topics: ['一次函数的图像'], alias: ['一次函数', '斜率', '截距', '图像'],
    hook: '现在是 y = x。拖 y 轴上的点改截距，拖标着 k 的点改斜率，把它变成 y = 2x + 1。看右边的表怎么变。',
    build: cb({ kn: 1, kd: 1, b: 0 }),
    milestones: [ms('b', '截距是 1', 4, 'b', 1, ['截距是直线和 y 轴交在哪。', '拖 y 轴上的点。', '往上一格。']), ms('k', '斜率是 2', 4, 'k', 2, ['斜率是“向右 1，向上几”。', '拖标着 k 的点。', '让它比截距高 2 格。'])],
    goal: ['b', 'k'],
    why: 'y = 2x + 1：x 每增加 1，y 增加 2（斜率）；x = 0 时 y = 1（截距）。图上的直线、表里的数、这个式子，说的是同一件事。',
  });
  add({
    id: 'cb-shift-down', essence: ['E6', 'E5'], title: '把直线往下平移', grade: 8, rung: 2, points: ['8.9'],
    topics: ['一次函数的图像', '平移'], alias: ['平移', '截距', '一次函数'],
    hook: '直线 y = 2x + 1。只动截距，让它经过 (0, −3)。斜率变了吗？',
    build: cb({ kn: 2, kd: 1, b: 1 }),
    predict: { q: '上下平移一条直线，它的斜率会变吗？', options: [{ v: 'n', label: '不变' }, { v: 'y', label: '会变' }], answer: 'n' },
    milestones: [ms('b', '截距是 −3', 8, 'b', -3, ['拖 y 轴上的点。', '往下拖。', '到 −3。'])],
    traps: [{ id: 'tilt', wrong: '平移不改变倾斜的程度：你把斜率也改了。', when: { role: 'c', port: 'k', op: '=', value: '1' } }],
    goal: ['b'],
    why: 'y = 2x + 1 往下平移 4 格是 y = 2x − 3。两条线平行：斜率相同，截距不同。',
  });
  add({
    id: 'cb-negative', essence: ['E6', 'E2'], title: '往右走，往下降：y = −x + 2', grade: 8, rung: 3, points: ['8.9'],
    topics: ['一次函数的性质'], alias: ['斜率', '减函数', '一次函数'],
    hook: '斜率可以是负的。把直线变成 y = −x + 2：向右走 1 格，就往下 1 格。',
    build: cb({ kn: 1, kd: 1, b: 0 }),
    milestones: [ms('b', '截距是 2', 3, 'b', 2, ['先拖截距。', '到 2。', '(0, 2)。']), ms('k', '斜率是 −1', 5, 'k', -1, ['把 k 那个点拖到截距下面。', '低 1 格。', '(1, 1)。'])],
    goal: ['b', 'k'],
    why: '斜率是负数时，x 越大 y 越小，直线从左上到右下。斜率是 0 时直线是平的。',
  });
  add({
    id: 'cb-half', essence: ['E6', 'E3'], title: '斜率 1/2 的直线', grade: 8, rung: 3, points: ['8.9'],
    topics: ['一次函数的图像'], alias: ['斜率', '分数', '一次函数'],
    hook: '斜率 1/2 是“向右 2，向上 1”。先点分母的 ＋ 改成 2，再拖 k。做出 y = 1/2 x。',
    build: cb({ kn: 1, kd: 1, b: 0 }),
    milestones: [ms('k', '斜率是 1/2', 8, 'k', '1/2', ['分母改成 2。', 'k 的把手会挪到 x = 2 的地方。', '让它比截距高 1 格。'])],
    goal: ['k'],
    why: '斜率 = 竖着走的 ÷ 横着走的。向右 2 向上 1，和向右 4 向上 2 是同一个斜率：1/2 = 2/4。',
  });
  add({
    id: 'cb-two-points', essence: ['E6', 'E2'], title: '过 (1, 2) 和 (3, 6) 的直线', grade: 8, rung: 3, points: ['8.10'],
    topics: ['待定系数法', '两点确定一条直线'], alias: ['两点式', '斜率', '待定系数法'],
    hook: '把 A 拖到 (1, 2)，把 B 拖到 (3, 6)。直线的斜率和截距是多少？',
    build: cb({ mode: 1, ax: -2, ay: -1, bx: 2, by: 1 }),
    milestones: [ms('k', '斜率是 2', 5, 'k', 2, ['横着走 2，竖着走 4。', '4 ÷ 2。', '2。']), ms('b', '截距是 0', 4, 'b', 0, ['直线过原点。', 'y = 2x。', '0。'])],
    goal: ['k', 'b'],
    why: '从 A 到 B：x 增加 2，y 增加 4，斜率 4 ÷ 2 = 2。把 (1, 2) 代进 y = 2x + b 得 b = 0。两个点就确定了一条直线。',
  });
  add({
    id: 'cb-intercepts', essence: ['E6', 'E2'], title: '过 (0, 4) 和 (4, 0) 的直线', grade: 8, rung: 3, points: ['8.10'],
    topics: ['一次函数的图像'], alias: ['截距', '斜率', '两点'],
    hook: '把 A 拖到 y 轴上的 (0, 4)，B 拖到 x 轴上的 (4, 0)。',
    build: cb({ mode: 1, ax: -2, ay: -1, bx: 2, by: 1 }),
    predict: { q: '这条直线的斜率是正的还是负的？', options: [{ v: 'p', label: '正的' }, { v: 'n', label: '负的' }, { v: 'z', label: '是 0' }], answer: 'n' },
    milestones: [ms('k', '斜率是 −1', 5, 'k', -1, ['横着走 4，竖着走 −4。', '−4 ÷ 4。', '−1。']), ms('b', '截距是 4', 4, 'b', 4, ['和 y 轴交在 A。', '(0, 4)。', '4。'])],
    goal: ['k', 'b'],
    why: 'y = −x + 4。它和两条坐标轴围成一个等腰直角三角形。和 y 轴的交点就是截距。',
  });
  add({
    id: 'cb-zero', essence: ['E6', 'E4'], title: 'y = 2x − 4 什么时候等于 0？', grade: 8, rung: 3, points: ['8.11'],
    topics: ['一次函数与一元一次方程'], alias: ['零点', '方程的解', '一次函数与方程'],
    hook: '直线 y = 2x − 4。拖 x 轴上的探针，找到 y = 0 的地方。这就是方程 2x − 4 = 0 的解。',
    build: cb({ kn: 2, kd: 1, b: -4, x: -1 }),
    milestones: [ms('y0', '探针处 y = 0', 8, 'y', 0, ['看直线在哪里穿过 x 轴。', '拖探针。', 'x = 2。'])],
    goal: ['y0'],
    why: '2x − 4 = 0 的解 x = 2，就是直线 y = 2x − 4 和 x 轴的交点。解方程和找图像的零点是同一件事。',
  });
  add({
    id: 'cb-vertex', essence: ['E6', 'E5'], title: '把抛物线的顶点放到 (2, −1)', grade: 9, rung: 2, points: ['9.6'],
    topics: ['二次函数的图像', '顶点式'], alias: ['二次函数', '抛物线', '顶点', '平移'],
    hook: '现在是 y = x²，顶点在原点。拖顶点到 (2, −1)，看式子怎么变。',
    build: cb({ mode: 2, a2: 2, h: 0, v: 0 }),
    milestones: [ms('h', '顶点的 x 是 2', 4, 'h', 2, ['拖顶点。', '往右 2 格。', 'x = 2。']), ms('v', '顶点的 y 是 −1', 4, 'v', -1, ['再往下。', '1 格。', 'y = −1。'])],
    goal: ['h', 'v'],
    why: 'y = (x − 2)² − 1。往右移 2，括号里是 x − 2（减号）；往下移 1，后面是 −1。形状没变，只是挪了位置。',
  });
  add({
    id: 'cb-no-root', essence: ['E6', 'E4'], title: '让抛物线碰不到 x 轴', grade: 9, rung: 3, points: ['9.7'],
    topics: ['二次函数与一元二次方程', '判别式'], alias: ['抛物线', '交点', '判别式', '无实根'],
    hook: '现在抛物线和 x 轴有 2 个交点。只拖顶点，让它一个交点都没有。再想：刚好 1 个交点是什么时候？',
    build: cb({ mode: 2, a2: 2, h: 1, v: -2 }),
    predict: { q: '开口向上的抛物线，顶点在 x 轴上方，和 x 轴有几个交点？', options: [{ v: '0', label: '0 个' }, { v: '1', label: '1 个' }, { v: '2', label: '2 个' }], answer: '0' },
    milestones: [ms('none', '没有交点', 8, 'roots', 0, ['开口向上。', '把顶点拖到 x 轴上面。', '顶点的 y 大于 0。'])],
    goal: ['none'],
    why: '开口向上时，顶点是最低点：顶点在 x 轴上方就没有交点，正好在 x 轴上有 1 个，在下方有 2 个。这就是判别式小于、等于、大于 0 的三种情况。',
  });
  add({
    id: 'cb-flip', essence: ['E6', 'E5'], title: '开口向下：y = −(x + 1)² + 4', grade: 9, rung: 3, points: ['9.6'],
    topics: ['二次函数的图像', '顶点式'], alias: ['抛物线', '开口方向', '顶点式', '最大值'],
    hook: '把顶点拖到 (−1, 4)，再把标着 a 的把手拖到顶点下面 1 格，让开口朝下。',
    build: cb({ mode: 2, a2: 2, h: 0, v: 0 }),
    milestones: [ms('h', '顶点的 x 是 −1', 2, 'h', -1, ['拖顶点。', '往左 1 格。', 'x = −1。']), ms('v', '顶点的 y 是 4', 2, 'v', 4, ['往上。', '4 格。', 'y = 4。']), ms('a', 'a = −1，开口朝下', 5, 'a', -1, ['a 的把手在顶点右边一格。', '把它拖到比顶点低 1 格。', 'a = −1。'])],
    goal: ['h', 'v', 'a'],
    why: 'a 是负数时开口朝下，顶点是最高点，所以这个函数的最大值是 4。它和 x 轴交在 x = −3 和 x = 1。',
  });
  U.problems.push.apply(U.problems, P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
