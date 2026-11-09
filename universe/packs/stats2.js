/* 器材包 stats2：复式统计表（二维统计表）。录入一张表的各行各列（文字：“3,2;1,4”），输出每行合计、每列合计和总数。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;

  // 解析文字表：行之间用分号，格子之间用逗号；每格必须是非负整数，每行格数相同
  const parseGrid = (src) => {
    const text = String(src == null ? '' : src).trim();
    if (!text) return { rows: [] };
    const rows = text.split(';').map((r) => r.trim()).filter((r) => r.length).map((r) => r.split(',').map((x) => x.trim()));
    for (let i = 0; i < rows.length; i++) {
      const bad = rows[i].findIndex((x) => !/^\d+$/.test(x));
      if (bad >= 0) return { error: '第 ' + (i + 1) + ' 行第 ' + (bad + 1) + ' 格“' + rows[i][bad] + '”不是非负整数' };
    }
    const width = rows.length ? rows[0].length : 0;
    const short = rows.findIndex((r) => r.length !== width);
    if (short >= 0) return { error: '第 ' + (short + 1) + ' 行的格数和第 1 行不一样（应为 ' + width + ' 格）' };
    return { rows: rows.map((r) => r.map((x) => parseInt(x, 10))) };
  };

  U.registerPack({
    id: 'stats2', version: 1,
    types: {
      // ---------------- 复式统计表：录入二维数据，输出行合计、列合计和总数 ----------------
      twoway: {
        essence: ['E8', 'E7'],
        label: '复式统计表', prefix: '表', group: '统计与概率', grades: [3, 9], alias: ['二维统计表', '行合计', '列合计', '总数', '统计表'],
        props: {
          data: { type: 'text', label: '数据（每行一组，行之间用分号；格子之间用逗号）', default: '3,2;1,4' },
          label: { type: 'text', label: '标签', default: '' },
        },
        lint: { minProps: 2, why: '复式统计表只有“数据”和标签两个属性' },
        outputs: {
          rowsum: { dim: null, kind: 'seq', label: '每行的合计' },
          colsum: { dim: null, kind: 'seq', label: '每列的合计' },
          total: { dim: null, kind: 'num', label: '总数' },
        },
        icon: () => K.rect(8, 8, 48, 28, { stroke: 'var(--ink)', r: 3 }) + K.line(8, 20, 56, 20, {}) + K.line(8, 28, 56, 28, {}) + K.line(28, 8, 28, 36, {}) + K.line(42, 8, 42, 36, {}),
        size: () => [230, 150],
        compute: (c) => {
          const g = parseGrid(c.props.data);
          if (g.error) { c.say('reject', g.error); return {}; }
          if (!g.rows.length) { c.say('info', '还没有数据：每行写一组数，行之间用分号，格子之间用逗号'); return {}; }
          const width = g.rows[0].length;
          const rowsum = g.rows.map((r) => r.reduce((a, b) => a + b, 0));
          const colsum = [];
          for (let j = 0; j < width; j++) colsum.push(g.rows.reduce((a, r) => a + r[j], 0));
          const total = rowsum.reduce((a, b) => a + b, 0);
          c.say('ok', g.rows.length + ' 行 × ' + width + ' 列，总数 ' + total);
          return {
            rowsum: U.val('seq', rowsum.map((n) => Q(n))),
            colsum: U.val('seq', colsum.map((n) => Q(n))),
            total: U.val('num', Q(total)),
          };
        },
        badge: (c) => (c.out.total ? '总数 ' + Q.show(c.out.total.data) : ''),
        draw: (c) => K.text(c.w / 2, c.h / 2 + 6, c.out.total ? '行合计 ' + c.out.rowsum.data.length + ' 个 · 总数 ' + Q.show(c.out.total.data) : '还没有数据', { size: 14, fill: c.out.total ? 'var(--ink)' : 'var(--dim)' }),
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
