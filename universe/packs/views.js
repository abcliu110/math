/* 器材包 views：三视图（观察物体、投影与视图）。
 * 台面上的积木用文字录入：每行是一排，行之间用分号；每个数是那个位置堆了几块（可以是 0）。
 * 输出：从前面看（每一列最高的）、从侧面看（每一行最高的）、从上面看（每个位置有没有积木，按行展开）、总块数。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;

  // "1,2;1,1" → [[1,2],[1,1]]；不合法就说为什么（不悄悄改）
  const parseGrid = (text) => {
    const s = String(text === undefined || text === null ? '' : text).trim();
    if (!s) return { ok: false, why: '还没有积木：每行写一排的高度，数之间用逗号，行之间用分号' };
    const rows = s.split(';').map((r) => r.split(',').map((x) => x.trim()));
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].length !== rows[0].length) return { ok: false, why: '第 ' + (i + 1) + ' 行的数不够或多了：每行的数要一样多' };
      for (const x of rows[i]) if (!/^\d+$/.test(x)) return { ok: false, why: '“' + x + '”不是整数：每个位置的块数要写 0 或正整数' };
    }
    return { ok: true, grid: rows.map((r) => r.map(Number)) };
  };

  U.registerPack({
    id: 'views', version: 1,
    types: {
      // ---------------- 三视图：积木排列 → 前面、侧面、上面看到的，以及总块数 ----------------
      views: {
        workspaceRole: 'none',
        handles: true,
        essence: ['E2'],
        label: '三视图', prefix: '视', group: '图形', grades: [2, 9], alias: ['观察物体', '前面', '侧面', '上面', '投影', '视图', '积木'],
        props: {
          grid: { type: 'text', control: 'grid', label: '积木（每行一排的块数，行之间用分号）', default: '1,2;1,1' },
          label: { type: 'text', label: '标签', default: '' },
        },
        lint: { minProps: 2, why: '三视图只有积木排列和标签两个可写属性' },
        outputs: {
          front: { dim: null, kind: 'seq', label: '从前面看（每列最高）' },
          side: { dim: null, kind: 'seq', label: '从侧面看（每行最高）' },
          top: { dim: null, kind: 'seq', label: '从上面看（有块为 1，按行展开）' },
          total: { dim: null, kind: 'num', label: '总块数' },
        },
        icon: () => K.rect(10, 10, 20, 20, { stroke: 'var(--ink)', r: 2 }) + K.rect(32, 10, 20, 20, { stroke: 'var(--ink)', r: 2 }) + K.rect(10, 32, 20, 4, { stroke: 'var(--ink)', r: 1 }),
        size: () => [200, 120],
        compute: (c) => {
          const g = parseGrid(c.props.grid);
          if (!g.ok) { c.say('reject', g.why); return {}; }
          const grid = g.grid, R = grid.length, C = grid[0].length;
          const front = [], side = [], top = [];
          let total = 0;
          for (let j = 0; j < C; j++) front.push(Math.max(...grid.map((r) => r[j])));
          for (let i = 0; i < R; i++) side.push(Math.max(...grid[i]));
          for (let i = 0; i < R; i++) for (let j = 0; j < C; j++) { top.push(grid[i][j] > 0 ? 1 : 0); total += grid[i][j]; }
          c.say('ok', '共 ' + total + ' 块（' + R + ' 排 × ' + C + ' 列）');
          return {
            front: U.val('seq', front.map((x) => Q(x))),
            side: U.val('seq', side.map((x) => Q(x))),
            top: U.val('seq', top.map((x) => Q(x))),
            total: U.val('num', Q(total)),
          };
        },
        badge: (c) => (c.out.total ? '共 ' + Q.show(c.out.total.data) + ' 块' : ''),
        draw: (c) => K.text(c.w / 2, c.h / 2 + 6, c.out.total ? '前 ' + c.out.front.data.length + ' 列 · 共 ' + Q.show(c.out.total.data) + ' 块' : '还没有积木', { size: 14, fill: c.out.total ? 'var(--ink)' : 'var(--dim)' }),
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
