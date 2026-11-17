/* “代数砖”的题。全部在台面上点按钮完成：调长和宽拼长方形、一块一块铺砖、补小方块、剪开拼过去。
 * 判分只看器材的输出（拼成了没有、补了几个）。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const tb = (props) => () => { const s = W.blank(); const id = W.add(s, 'tilebench', 40, 50, props); s.entities[id].role = 'tb'; return s; };
  const P = [];
  const base = { domain: '关系', level: 'core', shelf: ['tilebench'], traps: [], predict: null };
  const add = (o) => P.push(Object.assign({}, base, o));
  const ms = (id, say, score, port, value, hints) => ({ id, say, score, when: { role: 'tb', port, op: '=', value: String(value) }, hints });

  add({
    id: 'tlb-square', essence: ['E2', 'E8'], title: '(x + 3)² 为什么不是 x² + 9？', grade: 8, rung: 3, points: ['8.6'],
    topics: ['完全平方公式', '代数砖'], alias: ['完全平方', '乘法公式', '展开'],
    hook: '边长 x + 3 的正方形框已经画好了。一块一块铺砖：x² 几块？x 几条？小方块几个？',
    build: tb({ mode: 1, wa: 1, wp: 3, ha: 1, hp: 3 }),
    predict: { q: '(x + 3)² 等于什么？', options: [{ v: 'a', label: 'x² + 9' }, { v: 'b', label: 'x² + 6x + 9' }, { v: 'c', label: 'x² + 3x + 9' }], answer: 'b' },
    milestones: [ms('full', '铺满了：x² + 6x + 9', 8, 'done', 1, ['先放 1 块 x²。', '两边各 3 条 x：一共 6 条。', '角上 3 × 3 = 9 个小方块。'])],
    traps: [], goal: ['full'],
    why: '(x + 3)² 不只是 x² 和 9 两块：两边各有一条 3 × x 的长条，一共 6x。所以 (x + 3)² = x² + 6x + 9，(a + b)² = a² + 2ab + b²。',
  });
  add({
    id: 'tlb-factor2', essence: ['E2', 'E8'], title: '2x² + 7x + 3 拼成长方形', grade: 8, rung: 4, points: ['8.6'],
    topics: ['因式分解', '十字相乘', '代数砖'], alias: ['因式分解', '十字相乘', '拼长方形'],
    hook: '2 块 x²、7 条 x、3 个小方块。长里要有 2 个 x 还是宽里？常数怎么分？调长和宽，让砖正好铺满。',
    build: tb({ mode: 0, expr: '2x^2+7x+3' }),
    milestones: [ms('done', '拼成了：(2x + 1)(x + 3)', 8, 'done', 1, ['2 块 x²：长里放 2 个 x。', '小方块 3 个：长里 1、宽里 3，或者反过来。', '长 2x + 1，宽 x + 3：长条正好 6 + 1 = 7 条。'])],
    goal: ['done'],
    why: '(2x + 1)(x + 3)：大方块 2 × 1 = 2 块，长条 2x × 3 + 1 × x = 7 条，小方块 1 × 3 = 3 个。换成长 2x + 3、宽 x + 1，长条只有 2 + 3 = 5 条，铺不满。',
  });
  add({
    id: 'tlb-diff', essence: ['E2', 'E8'], title: 'a² − b²：剪开、拼过去', grade: 8, rung: 3, points: ['8.6'],
    topics: ['平方差公式', '乘法公式', '代数砖'], alias: ['平方差', '乘法公式', '因式分解'],
    hook: '大正方形挖掉右上角一个小正方形，剩下的面积是 a² − b²。沿虚线剪开，把上面一块拼到右边，拼成了什么样的长方形？',
    build: tb({ mode: 3, a: 8, b: 3, sym: 'a,b' }),
    milestones: [ms('done', '拼成长方形：a² − b² = (a + b)(a − b)', 8, 'done', 1, ['点“沿虚线剪开”。', '再点“拼过去”。', '长是 a + b，宽是 a − b。'])],
    goal: ['done'],
    why: '剩下的部分剪成两块：上面 (a − b) × b，下面 a × (a − b)。宽都是 a − b，接起来长是 a + b。面积没变：a² − b² = (a + b)(a − b)。改改边长，8² − 3² = 55 = 11 × 5，每次都对。',
  });
  U.problems.push.apply(U.problems, P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
