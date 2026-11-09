/* 数据表与拟合（任务 C.2–C.4，见 next-steps.md §4）。
 *  - kind table：{ cols: [{ name, dim }], rows: [[有理数…], …] }，每一列可以带量纲（U.Dim）。
 *    实测数据录入时用 Q.fromNumber 转成有理数：数据本身按精确算，拟合结果按精确或近似标记。
 *  - U.Table.fitProportional(t, xi, yi)：正比例 y = kx，k = Σxy / Σx²，精确有理数。
 *  - U.Table.fitLinear(t, xi, yi)：一次 y = kx + b，最小二乘的正规方程，精确有理数。
 *    返回 { kind:'fn', k, b, residuals, steps }，并给出与手算一致的步骤。
 *  - U.Table.model(problem)：建模题模板 lint（§4.3）。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q;

  const sum = (xs) => xs.reduce((s, x) => Q.add(s, x), Q(0));
  const col = (t, i) => t.rows.map((r) => r[i]);

  const T = {
    // 录入：cols 是 [{name, dim}] 或字符串数组；rows 里的数可以是小数（转成精确有理数）
    make(cols, rows) {
      const cs = cols.map((c) => (typeof c === 'string' ? { name: c, dim: null } : { name: c.name, dim: c.dim || null }));
      return { cols: cs, rows: rows.map((r) => r.map((x) => (x && typeof x === 'object' && 'n' in x ? x : Q.fromNumber(+x)))) };
    },
    // 文字录入：'1,60;2,120;3,180'
    parseRows(text) {
      const out = [];
      for (const part of String(text || '').split(/[;；\n]/)) {
        const p = part.trim(); if (!p) continue;
        const cells = p.split(/[,，\s]+/).map((x) => { try { return Q.parse(x); } catch (e) { throw new Error('数不对：' + x); } });
        out.push(cells);
      }
      return out;
    },
    // 正比例：k = Σxy / Σx²
    fitProportional(t, xi, yi) {
      const xs = col(t, xi), ys = col(t, yi), steps = [];
      const sxy = sum(xs.map((x, i) => Q.mul(x, ys[i]))), sxx = sum(xs.map((x) => Q.mul(x, x)));
      if (sxx.n === 0) return { kind: 'error', why: 'x 全是 0，求不出 k' };
      const k = Q.div(sxy, sxx);
      steps.push({ say: 'Σxy = ' + Q.show(sxy) + '，Σx² = ' + Q.show(sxx) + '，k = Σxy / Σx² = ' + Q.show(k), rule: 'eq.both-sides' });
      const residuals = xs.map((x, i) => Q.sub(ys[i], Q.mul(k, x)));
      return { kind: 'fn', k, b: Q(0), residuals, steps };
    },
    // 一次：正规方程 k = (nΣxy − ΣxΣy) / (nΣx² − (Σx)²)，b = (Σy − kΣx) / n
    fitLinear(t, xi, yi) {
      const xs = col(t, xi), ys = col(t, yi), n = Q(xs.length), steps = [];
      const Sx = sum(xs), Sy = sum(ys), Sxy = sum(xs.map((x, i) => Q.mul(x, ys[i]))), Sxx = sum(xs.map((x) => Q.mul(x, x)));
      const den = Q.sub(Q.mul(n, Sxx), Q.mul(Sx, Sx));
      if (den.n === 0) return { kind: 'error', why: 'x 都一样，画不出一条直线' };
      const k = Q.div(Q.sub(Q.mul(n, Sxy), Q.mul(Sx, Sy)), den);
      const b = Q.div(Q.sub(Sy, Q.mul(k, Sx)), n);
      steps.push({ say: '数据个数 n = ' + xs.length + '，Σx = ' + Q.show(Sx) + '，Σy = ' + Q.show(Sy) + '，Σxy = ' + Q.show(Sxy) + '，Σx² = ' + Q.show(Sxx), rule: 'eq.both-sides' });
      steps.push({ say: '斜率 k = (nΣxy − ΣxΣy) / (nΣx² − (Σx)²) = ' + Q.show(k), rule: 'eq.both-sides' });
      steps.push({ say: '截距 b = (Σy − kΣx) / n = ' + Q.show(b), rule: 'eq.both-sides' });
      const residuals = xs.map((x, i) => Q.sub(ys[i], Q.add(Q.mul(k, x), b)));
      return { kind: 'fn', k, b, residuals, steps };
    },
    // 残差平方和（精确）
    sse(res) { return sum(res.map((r) => Q.mul(r, r))); },
  };
  U.Table = T;

  U.defineKind('table', {
    label: '数据表', color: '#facc15',
    eq: (a, b) => a.cols.length === b.cols.length && a.rows.length === b.rows.length &&
      a.cols.every((c, i) => c.name === b.cols[i].name && c.dim === b.cols[i].dim) &&
      a.rows.every((r, i) => r.every((x, j) => Q.eq(x, b.rows[i][j]))),
    show: (t) => t.rows.length + ' 行 × ' + t.cols.length + ' 列（' + t.cols.map((c) => c.name).join('、') + '）',
  });

  // ---- C.4 建模题模板（§4.3）：题目可以带 model 字段，lint 检查三步是否都有里程碑 ----
  const MODEL_STEPS = ['choose', 'function', 'check'];
  T.lintModel = function (p) {
    const errors = [], warnings = [];
    const m = p.model;
    if (m === undefined || m === null) return { errors, warnings };
    if (typeof m.situation !== 'string' || !m.situation) errors.push('model.situation 要写情境');
    if (!Array.isArray(m.quantities) || m.quantities.length < 2) errors.push('model.quantities 至少要有两个量');
    if (typeof m.relation !== 'string' || !m.relation) errors.push('model.relation 要写关系（linear / proportional / inverse …）');
    if (typeof m.check !== 'string' || !m.check) errors.push('model.check 要写回到情境检验的做法');
    const steps = m.steps || {};
    const ids = (p.milestones || []).map((x) => x.id);
    for (const s of MODEL_STEPS) {
      if (!steps[s]) errors.push('model.steps 缺少「' + s + '」（选模型 / 得到函数 / 回到情境检验）对应的里程碑');
      else if (!ids.includes(steps[s])) errors.push('model.steps.' + s + ' 指向不存在的里程碑：' + steps[s]);
    }
    if (p.evidence !== undefined && p.evidence > 1) errors.push('模型对数据的拟合最高只能到 ①（举例），措辞写“和这些数据吻合”');
    return { errors, warnings };
  };
  const base = U.problemLint;
  U.problemLint = function (p) {
    const r = base(p);
    const m = T.lintModel(p);
    return { errors: r.errors.concat(m.errors), warnings: r.warnings.concat(m.warnings), fnCount: r.fnCount, condCount: r.condCount };
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
