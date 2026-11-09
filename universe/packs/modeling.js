/* 器材包 modeling：数据表、取列、散点图、拟合器、预测器（任务 C.3，见 next-steps.md §4.2）。
 * 数据表的录入用文字（“1,60;2,120;3,180”），学生可以改文字增删行。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit, T = U.Table;

  const tableOf = (c) => { const v = K.first(c.inp.t); return v && v.kind === 'table' ? v.data : null; };

  U.registerPack({
    id: 'modeling', version: 1,
    types: {
      // ---------------- 数据表：录入实测数据，输出 table ----------------
      datatable: {
        essence: ['E3', 'E6'],
        label: '数据表', prefix: '表', group: '统计与概率', grades: [5, 9], alias: ['实验数据', '表格', '录入'],
        props: {
          data: { type: 'text', label: '数据（每行 x,y；行之间用分号）', default: '1,60;2,120;3,180' },
          xname: { type: 'text', label: 'x 是什么', default: '时间' },
          yname: { type: 'text', label: 'y 是什么', default: '路程' },
        },
        outputs: { t: { dim: null, kind: 'table', label: '表' } },
        icon: () => K.rect(8, 8, 48, 28, { stroke: 'var(--ink)', r: 3 }) + K.line(8, 20, 56, 20, {}) + K.line(28, 8, 28, 36, {}),
        size: () => [230, 150],
        compute: (c) => {
          try {
            const rows = T.parseRows(c.props.data);
            if (!rows.length) { c.say('info', '还没有数据：每行写 x,y，行之间用分号'); return {}; }
            const bad = rows.findIndex((r) => r.length !== 2);
            if (bad >= 0) { c.say('reject', '第 ' + (bad + 1) + ' 行要有两个数（x 和 y）'); return {}; }
            const t = { cols: [{ name: c.props.xname, dim: null }, { name: c.props.yname, dim: null }], rows };
            c.say('ok', rows.length + ' 组数据');
            return { t: U.val('table', t) };
          } catch (e) { c.say('reject', e.message); return {}; }
        },
        badge: (c) => (c.out.t ? c.out.t.data.rows.length + ' 行' : ''),
        draw: (c) => K.text(c.w / 2, c.h / 2 + 6, c.out.t ? c.out.t.data.rows.length + ' 行 × 2 列' : '还没有数据', { size: 14, fill: 'var(--dim)' }),
      },

      // ---------------- 取列：table → seq（某一列）----------------
      column: {
        essence: ['E3'],
        label: '取列', prefix: '列', group: '统计与概率', grades: [5, 9], alias: ['一列', '取数'],
        props: {
          col: { type: 'int', label: '第几列（0 是第一列）', default: 0, min: 0, max: 3 },
          label: { type: 'text', label: '标签', default: '' },
        },
        lint: { minProps: 2, why: '取列器材只有“第几列”和标签两个属性' },
        inputs: { t: { kind: 'table', label: '表' } },
        outputs: { s: { dim: null, kind: 'seq', label: '这一列' } },
        icon: () => K.line(32, 8, 32, 36, { w: 2 }) + K.text(32, 30, '列', { size: 13 }),
        size: () => [150, 90],
        compute: (c) => {
          const t = tableOf(c); if (!t) { c.say('info', '接一张数据表'); return {}; }
          if (c.props.col >= t.cols.length) { c.say('reject', '这张表只有 ' + t.cols.length + ' 列'); return {}; }
          return { s: U.val('seq', t.rows.map((r) => r[c.props.col])) };
        },
        badge: (c) => (c.out.s ? c.out.s.data.length + ' 个数' : ''),
        draw: (c) => K.text(c.w / 2, c.h / 2 + 6, c.out.s ? '第 ' + (c.props.col + 1) + ' 列' : '…', { size: 14 }),
      },

      // ---------------- 散点图：画两列的点，可以叠一条直线 ----------------
      scatter: {
        essence: ['E3', 'E7'],
        label: '散点图', prefix: '点', group: '统计与概率', grades: [5, 9], alias: ['描点', '画图'],
        props: {
          xcol: { type: 'int', label: 'x 用第几列', default: 0, min: 0, max: 3 },
          ycol: { type: 'int', label: 'y 用第几列', default: 1, min: 0, max: 3 },
          label: { type: 'text', label: '标签', default: '' },
        },
        inputs: { t: { kind: 'table', label: '表' }, line: { kind: 'fn', label: '直线（可选）' } },
        outputs: { n: { dim: null, kind: 'num', label: '点的个数' } },
        icon: () => [[10, 30], [24, 20], [38, 22], [52, 10]].map(([x, y]) => K.circle(x, y, 2.5, { fill: 'var(--accent)' })).join(''),
        size: () => [230, 150],
        compute: (c) => {
          const t = tableOf(c); if (!t) { c.say('info', '接一张数据表'); return {}; }
          return { n: U.val('num', Q(t.rows.length)) };
        },
        badge: (c) => (c.out.n ? c.out.n.data.n + ' 个点' : ''),
        draw: (c) => {
          const t = tableOf({ inp: (c.d && c.d.inp) || {} }); if (!t || !t.rows.length) return K.text(c.w / 2, c.h / 2, '没有数据', { fill: 'var(--dim)' });
          const xs = t.rows.map((r) => Q.num(r[c.props.xcol])), ys = t.rows.map((r) => Q.num(r[c.props.ycol]));
          const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
          const sx = (v) => 20 + (x1 === x0 ? 0.5 : (v - x0) / (x1 - x0)) * (c.w - 40), sy = (v) => c.h - 20 - (y1 === y0 ? 0.5 : (v - y0) / (y1 - y0)) * (c.h - 40);
          let s = K.line(20, c.h - 20, c.w - 16, c.h - 20, { w: 1.5 }) + K.line(20, 16, 20, c.h - 20, { w: 1.5 });
          xs.forEach((x, i) => { s += K.circle(sx(x), sy(ys[i]), 4, { fill: 'var(--accent)' }); });
          return s;
        },
      },

      // ---------------- 拟合器：table → 函数（正比例或一次），输出 k、b 与函数 ----------------
      fit: {
        essence: ['E8', 'E7'],
        label: '拟合器', prefix: '拟', group: '统计与概率', grades: [7, 9], alias: ['拟合', '最小二乘', '直线', '正比例'],
        props: {
          model: { type: 'choice', label: '模型', default: 1, choices: ['正比例 y = kx', '一次 y = kx + b'] },
          xcol: { type: 'int', label: 'x 用第几列', default: 0, min: 0, max: 3 },
          ycol: { type: 'int', label: 'y 用第几列', default: 1, min: 0, max: 3 },
        },
        inputs: { t: { kind: 'table', label: '表' } },
        outputs: {
          f: { dim: null, kind: 'fn', label: '拟合出的直线' },
          k: { dim: null, kind: 'num', label: '斜率 k' },
          b: { dim: null, kind: 'num', label: '截距 b' },
        },
        icon: () => K.line(10, 34, 56, 10, { w: 2.5, stroke: 'var(--accent)' }) + K.circle(20, 26, 2.5, { fill: 'var(--ink)' }) + K.circle(44, 16, 2.5, { fill: 'var(--ink)' }),
        size: () => [200, 120],
        compute: (c) => {
          const t = tableOf(c); if (!t) { c.say('info', '接一张数据表'); return {}; }
          const r = c.props.model === 0 ? T.fitProportional(t, c.props.xcol, c.props.ycol) : T.fitLinear(t, c.props.xcol, c.props.ycol);
          if (r.kind === 'error') { c.say('reject', r.why); return {}; }
          if (c.step) r.steps.forEach((s) => c.step(s.say, null, 'fit.least-squares'));
          const sse = T.sse(r.residuals);
          c.say(sse.n === 0 ? 'ok' : 'info', (sse.n === 0 ? '数据正好在这条直线上' : '数据大致在这条直线附近，残差平方和 ' + Q.show(sse)) + '（和这些数据吻合）');
          return { f: U.val('fn', { k: r.k, b: r.b }), k: U.val('num', r.k), b: U.val('num', r.b) };
        },
        badge: (c) => (c.out.f ? U.KINDS.fn.show(c.out.f.data) : ''),
        draw: (c) => K.text(c.w / 2, c.h / 2 + 6, c.out.f ? U.KINDS.fn.show(c.out.f.data) : '…', { size: 14, weight: 700 }),
      },

      // ---------------- 预测器：函数 + 一个 x → y；说明这是模型给的预测，不是测量值 ----------------
      predict: {
        essence: ['E8'],
        label: '预测器', prefix: '预', group: '统计与概率', grades: [7, 9], alias: ['预测', '代入'],
        props: {
          x: { type: 'num', label: '看 x 等于', default: 5, min: -50, max: 50, step: 1 },
          label: { type: 'text', label: '标签', default: '' },
          note: { type: 'bool', label: '写上“是预测”', default: true },
        },
        inputs: { f: { kind: 'fn', label: '直线' } },
        outputs: { y: { dim: null, kind: 'num', label: '预测的 y' } },
        icon: () => K.text(32, 28, 'y=?', { size: 18, weight: 700 }),
        size: () => [170, 100],
        compute: (c) => {
          const v = K.first(c.inp.f); if (!v || v.kind !== 'fn') { c.say('info', '接一条拟合出来的直线'); return {}; }
          const f = v.data, y = Q.add(Q.mul(f.k, Q.fromNumber(c.props.x)), f.b);
          if (c.step) c.step('代入 x = ' + c.props.x + '：y = ' + Q.show(f.k) + ' × ' + c.props.x + ' + ' + Q.show(f.b) + ' = ' + Q.show(y), null, 'model.predict');
          c.say('info', (c.props.note ? '这是模型给的预测，不是测量值：' : '') + 'y = ' + Q.show(y));
          return { y: U.val('num', y, { exact: true }) };
        },
        badge: (c) => (c.out.y ? '预测 ' + Q.show(c.out.y.data) : ''),
        draw: (c) => K.text(c.w / 2, c.h / 2 + 6, c.out.y ? '预测 y = ' + Q.show(c.out.y.data) : '…', { size: 14, weight: 700 }),
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
