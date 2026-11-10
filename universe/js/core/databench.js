/* 数据图表台的内核（D8，docs/direction.md 第 7 节 D8）。纯逻辑，不碰界面。
 * 录数据 → 画散点图 → 拟合直线，每一步都记在台面上，撤销和判题都从头重放。
 *  - state（从步骤重算，不存）：rows（[{ xs, ys, x, y }]，x、y 是精确有理数）、plotted（画了图）、fit（{ k, b } 或 null）。
 *  - 一步 = 加一行（tool 'row'，args { x, y }，文字的数）、删一行（'del'，args { i }）、画散点图（'plot'）、拟合直线（'fit'）。
 *    改了数据（加行、删行）图和直线都作废，要重新画、重新拟合。
 *  - 步骤记在台面 scene.workbench 上：{ host: 图表台 id, key: 'data|{}', steps: [{ tool, rule, args, kept }] }，
 *    rule 是 data.row / data.del / data.plot / fit.least-squares。
 *  - U.DataBench.start() → state；U.DataBench.apply(state, tool, args) → { ok, why, state, step }
 *  - U.DataBench.replay(steps) → state（步骤不对就抛错）；U.DataBench.view(state) → 界面用的数据
 *  - U.DataBench.stateOf(scene, id) / current(scene, id)；U.DataBench.judge(scene, q)：q = { minRows, plotted, fitted }
 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, T = U.Table;
  const MAX_ROWS = 10;
  const NUM = /^-?\d+(\.\d+)?$/;
  const KEY = 'data|{}';

  const start = () => ({ rows: [], plotted: false, fit: null });
  const keyOf = () => KEY;

  // 把一个数的文字变成精确有理数；不是数就返回 null
  function parseNum(s) {
    const t = String(s === undefined || s === null ? '' : s).trim();
    if (!NUM.test(t)) return null;
    try { return Q.parse(t); } catch (e) { return null; }
  }
  const distinctX = (rows) => new Set(rows.map((r) => r.x.n.toString() + '/' + r.x.d.toString())).size;

  function apply(st, tool, args) {
    const a = args || {};
    const fail = (why) => ({ ok: false, why, state: st });
    const changed = (rows) => ({ rows, plotted: false, fit: null });
    if (tool === 'row') {
      const x = parseNum(a.x), y = parseNum(a.y);
      if (!x) return fail('x 要写数字（可以是小数）');
      if (!y) return fail('y 要写数字（可以是小数）');
      if (st.rows.length >= MAX_ROWS) return fail('最多 ' + MAX_ROWS + ' 组数据');
      const row = { xs: String(a.x).trim(), ys: String(a.y).trim(), x, y };
      const s2 = changed(st.rows.concat([row]));
      return { ok: true, why: '', state: s2, step: { tool: 'row', rule: 'data.row', args: { x: row.xs, y: row.ys }, kept: true } };
    }
    if (tool === 'del') {
      const i = a.i;
      if (!Number.isInteger(i) || i < 0 || i >= st.rows.length) return fail('没有这一行');
      const s2 = changed(st.rows.filter((_, j) => j !== i));
      return { ok: true, why: '', state: s2, step: { tool: 'del', rule: 'data.del', args: { i }, kept: true } };
    }
    if (tool === 'plot') {
      if (st.plotted) return fail('图已经画好了');
      if (st.rows.length < 2) return fail('至少要有两组数据才能画图');
      if (distinctX(st.rows) < 2) return fail('所有的 x 都一样，画不出直线');
      return { ok: true, why: '', state: Object.assign({}, st, { plotted: true }), step: { tool: 'plot', rule: 'data.plot', args: {}, kept: true } };
    }
    if (tool === 'fit') {
      if (!st.plotted) return fail('先画散点图，再拟合直线');
      if (st.fit) return fail('已经拟合过了');
      const r = T.fitLinear(T.make(['x', 'y'], st.rows.map((q) => [q.x, q.y])), 0, 1);
      if (r.kind === 'error') return fail(r.why);
      return { ok: true, why: '', state: Object.assign({}, st, { fit: { k: r.k, b: r.b } }), step: { tool: 'fit', rule: 'fit.least-squares', args: {}, kept: true } };
    }
    return fail('没有这个操作：' + tool);
  }

  function replay(steps) {
    let st = start();
    for (const s of steps || []) {
      const r = apply(st, s.tool, s.args);
      if (!r.ok) throw new Error('重放失败：' + r.why);
      st = r.state;
    }
    return st;
  }

  // 有理数的小数写法（能写成有限小数就写小数，比如 −2.5；不行就写分数）；减号用 −
  function dec(q) {
    let t = q.d, k = 0, f = 0;
    while (t % 2n === 0n) { t /= 2n; k++; }
    while (t % 5n === 0n) { t /= 5n; f++; }
    if (t !== 1n) return Q.show(q).replace(/-/g, '−');
    const m = Math.max(k, f), scale = 10n ** BigInt(m);
    const N = q.n * scale / q.d, neg = N < 0n, abs = neg ? -N : N;
    const ip = (abs / scale).toString();
    let fp = (abs % scale).toString().padStart(m, '0').replace(/0+$/, '');
    return (neg ? '−' : '') + ip + (fp ? '.' + fp : '');
  }
  function fitText(fit) {
    const k = dec(fit.k), kn = fit.k.n === 1n && fit.k.d === 1n ? '' : k;
    const bNeg = fit.b.n < 0n, bAbs = dec({ n: bNeg ? -fit.b.n : fit.b.n, d: fit.b.d });
    const b = fit.b.n === 0n ? '' : (bNeg ? ' − ' : ' + ') + bAbs;
    return 'y = ' + kn + 'x' + b;
  }

  function view(st) {
    return {
      rows: st.rows.map((r, i) => ({ i, x: r.xs, y: r.ys })),
      n: st.rows.length, plotted: st.plotted, fit: st.fit ? { text: fitText(st.fit), k: dec(st.fit.k), b: dec(st.fit.b) } : null,
      max: MAX_ROWS,
    };
  }

  function stateOf(scene, id) {
    const wb = scene && scene.workbench;
    if (!wb || wb.host !== id || wb.key !== KEY || !Array.isArray(wb.steps) || !wb.steps.length) return null;
    try { return replay(wb.steps); } catch (e) { return null; }
  }
  const current = (scene, id) => stateOf(scene, id) || start();

  function judge(scene, q) {
    const wb = scene && scene.workbench;
    if (!wb || wb.key !== KEY) return { ok: false, why: '还没有用数据图表台' };
    let st;
    try { st = replay(wb.steps); } catch (e) { return { ok: false, why: '数据图表台的步骤有错：' + e.message }; }
    const q2 = q || {};
    if (q2.minRows !== undefined && st.rows.length < q2.minRows) return { ok: false, why: '录入的数据还不够 ' + q2.minRows + ' 组' };
    if (q2.plotted && !st.plotted) return { ok: false, why: '还没有画散点图' };
    if (q2.fitted && !st.fit) return { ok: false, why: '还没有拟合直线' };
    return { ok: true, why: '' };
  }

  U.DataBench = { MAX_ROWS, start, keyOf, apply, replay, view, stateOf, current, judge, dec, fitText, parseNum };
})(typeof globalThis !== 'undefined' ? globalThis : window);
