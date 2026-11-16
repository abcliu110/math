/* 器材包 fitbench：数据找规律（一次函数建模）。一张数据表画成点，学生拖一条直线穿过这些点，再用它预测。
 * 全部在图上直接动手：
 *   - 直线上有两个蓝色把手，拖它们（会对齐到格子）。直线穿过几个数据点，旁边的表就打几个 ✓。
 *   - 直线的式子一直写在上面：y = 3x + 5。每多 1，多几（斜率）；x 是 0 的时候是几（截距）。
 *   - 拖下面的探针改 x：直线上对着的 y 就是预测；表里多一行“预测”。
 * 这一版的边界（如实写）：只有直线（没有曲线拟合）；把手对齐到出题人给的格子（x 每格、y 每格）；
 *   数据点不在一条直线上时，没有“最小二乘”那种最好的线，只数穿过了几个点。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const qv = (q) => U.val('num', q, { dim: null }), num = (n) => qv(Q(n));
  const W = 700, X0 = 70, X1 = 420, Y0 = 330, Y1 = 60;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? +v : lo));
  const parse = (t) => String(t || '').split(';').map((r) => r.split(',').map(Number)).filter((r) => r.length === 2 && r.every(Number.isFinite));
  function model(p) {
    const pts = parse(p.data), xmax = clamp(p.xmax, 1, 1000), ymax = clamp(p.ymax, 1, 10000), xs = clamp(p.xstep, 1, 100), ys = clamp(p.ystep, 1, 1000);
    const ax = clamp(p.ax, 0, xmax), ay = clamp(p.ay, 0, ymax), bx = clamp(p.bx, 0, xmax), by = clamp(p.by, 0, ymax), px = clamp(p.px, 0, xmax);
    const m = { pts, xmax, ymax, xs, ys, ax, ay, bx, by, px };
    if (ax !== bx) { m.k = Q(by - ay, bx - ax); m.b = Q.sub(Q(ay), Q.mul(m.k, Q(ax))); m.at = (x) => Q.add(Q.mul(m.k, Q(x)), m.b); m.hits = pts.filter(([x, y]) => Q.eq(m.at(x), Q(y))).length; m.py = m.at(px); }
    else m.hits = 0;
    m.all = pts.length > 0 && m.hits === pts.length ? 1 : 0;
    return m;
  }
  const SX = (m, x) => X0 + x / m.xmax * (X1 - X0), SY = (m, y) => Y0 - y / m.ymax * (Y0 - Y1);
  const fmt = (q) => U.Q.show(q);
  const eqText = (m) => { if (m.k === undefined) return '两个把手不能在一条竖线上'; const k = fmt(m.k), b = Q.num(m.b); return 'y = ' + (k === '0' ? '' : (k === '1' ? '' : k === '-1' ? '−' : k.replace('-', '−')) + 'x') + (b === 0 ? (k === '0' ? '0' : '') : (k === '0' ? fmt(m.b).replace('-', '−') : (b > 0 ? ' + ' : ' − ') + fmt(Q.abs(m.b)))); };

  function draw(c) {
    const p = c.props, m = model(p), xn = p.xname || 'x', yn = p.yname || 'y'; let s = '';
    s += '<g data-eq="1">' + K.text(20, 26, eqText(m), { size: 17, weight: 700, anchor: 'start', fill: m.all ? 'var(--good)' : 'var(--ink)' }) + '</g>';
    if (m.k !== undefined) s += K.text(200, 26, '每多 1，多 ' + fmt(m.k).replace('-', '−') + '；x 是 0 时是 ' + fmt(m.b).replace('-', '−'), { size: 12, anchor: 'start', fill: '#5a6478' });
    // 坐标轴和格子
    for (let x = 0; x <= m.xmax; x += m.xs) s += K.line(SX(m, x), Y0, SX(m, x), Y1, { w: 0.6, stroke: '#e3e7ef' }) + (Math.round(x / m.xs) % Math.max(1, Math.ceil(m.xmax / m.xs / 10)) === 0 ? K.text(SX(m, x), Y0 + 14, String(x), { size: 10, fill: '#5a6478' }) : '');
    for (let y = 0; y <= m.ymax; y += m.ys) s += K.line(X0, SY(m, y), X1, SY(m, y), { w: 0.6, stroke: '#e3e7ef' }) + (Math.round(y / m.ys) % Math.max(1, Math.ceil(m.ymax / m.ys / 8)) === 0 ? K.text(X0 - 6, SY(m, y) + 4, String(y), { size: 10, anchor: 'end', fill: '#5a6478' }) : '');
    s += K.line(X0, Y0, X1 + 8, Y0, { w: 1.6 }) + K.line(X0, Y0, X0, Y1 - 8, { w: 1.6 }) + K.text(X1 + 8, Y0 + 28, xn, { size: 11, anchor: 'end' }) + K.text(X0 - 6, Y1 - 14, yn, { size: 11, anchor: 'start' });
    // 直线（裁到画框里）
    if (m.k !== undefined) {
      const kk = Q.num(m.k), bb = Q.num(m.b), ends = [];
      for (const x of [0, m.xmax]) { const y = kk * x + bb; if (y >= 0 && y <= m.ymax) ends.push([x, y]); }
      if (kk !== 0) for (const y of [0, m.ymax]) { const x = (y - bb) / kk; if (x > 0 && x < m.xmax) ends.push([x, y]); }
      if (ends.length >= 2) s += K.line(SX(m, ends[0][0]), SY(m, ends[0][1]), SX(m, ends[1][0]), SY(m, ends[1][1]), { w: 2.4, stroke: 'var(--blue)' });
    }
    // 数据点
    m.pts.forEach(([x, y]) => { const hit = m.k !== undefined && Q.eq(m.at(x), Q(y)); s += K.circle(SX(m, x), SY(m, y), 6, { fill: hit ? 'var(--good)' : '#f5a25d', stroke: 'var(--ink)', w: 1.2 }); });
    // 探针：预测
    if (m.k !== undefined) { const y = Q.num(m.py); s += K.line(SX(m, m.px), Y0 + 30, SX(m, m.px), SY(m, clamp(y, 0, m.ymax)), { w: 1.4, stroke: '#c0392b', dash: '4 3' }) + (y >= 0 && y <= m.ymax ? K.circle(SX(m, m.px), SY(m, y), 5, { fill: '#c0392b', stroke: 'none' }) : ''); }
    // 表
    const TX = 452;
    s += K.text(TX, 60, xn, { size: 12, weight: 700, anchor: 'start' }) + K.text(TX + 110, 60, yn, { size: 12, weight: 700, anchor: 'start' }) + K.text(TX + 200, 60, '线上', { size: 12, weight: 700, anchor: 'start' });
    m.pts.forEach(([x, y], i) => { const on = m.k !== undefined ? m.at(x) : null, hit = on && Q.eq(on, Q(y)); s += K.text(TX, 84 + i * 22, String(x), { size: 13, anchor: 'start' }) + K.text(TX + 110, 84 + i * 22, String(y), { size: 13, anchor: 'start' }) + K.text(TX + 200, 84 + i * 22, on ? fmt(on) + (hit ? ' ✓' : '') : '', { size: 13, anchor: 'start', fill: hit ? 'var(--good)' : 'var(--bad)', weight: 700 }); });
    const ry = 84 + m.pts.length * 22 + 10;
    if (m.k !== undefined) s += '<g data-pred="1">' + K.text(TX, ry, '预测：' + m.px + ' → ' + fmt(m.py).replace('-', '−'), { size: 13, weight: 700, anchor: 'start', fill: '#c0392b' }) + '</g>';
    s += K.text(TX, ry + 26, m.all ? '直线穿过了所有的点：规律找到了' : '穿过了 ' + m.hits + ' / ' + m.pts.length + ' 个点', { size: 12, weight: 700, anchor: 'start', fill: m.all ? 'var(--good)' : 'var(--ink)' });
    s += K.text(20, 384, '拖蓝色把手让直线穿过所有的点；拖红色探针改 ' + xn + '，读出预测。', { size: 12, anchor: 'start', fill: '#5a6478' });
    return s;
  }
  function grips(c) {
    const m = model(c.props), snapX = (q, m0) => clamp(Math.round((q.x - X0) / (X1 - X0) * m0.xmax / m0.xs) * m0.xs, 0, m0.xmax), snapY = (q, m0) => clamp(Math.round((Y0 - q.y) / (Y0 - Y1) * m0.ymax / m0.ys) * m0.ys, 0, m0.ymax);
    const say = (c1) => eqText(model(c1.props));
    const out = [
      { id: 'a', x: SX(m, m.ax), y: SY(m, m.ay), r: 9, cursor: 'grab', tip: '拖我：直线经过这一点', drag: (c0, q) => { const m0 = model(c0.props); return { ax: snapX(q, m0), ay: snapY(q, m0) }; }, say },
      { id: 'b', x: SX(m, m.bx), y: SY(m, m.by), r: 9, cursor: 'grab', tip: '拖我：直线经过这一点', drag: (c0, q) => { const m0 = model(c0.props); return { bx: snapX(q, m0), by: snapY(q, m0) }; }, say },
    ];
    if (m.k !== undefined) out.push({ id: 'p', x: SX(m, m.px), y: Y0 + 30, r: 9, shape: 'bar-v', cursor: 'ew-resize', tip: '拖我：预测这个 x 对着的 y', drag: (c0, q) => ({ px: snapX(q, model(c0.props)) }), say: (c1) => { const m1 = model(c1.props); return 'x = ' + m1.px + '：y = ' + fmt(m1.py); } });
    return out;
  }
  const I = (lo, hi, d, label, o) => Object.assign({ type: 'int', label, default: d, min: lo, max: hi, write: true }, o || {});
  U.registerPack({
    id: 'fitbench', version: 1,
    types: {
      fitbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E8', 'E4'],
        label: '数据找规律（直线）', prefix: '找规律', group: '函数', grades: [6, 9],
        alias: ['一次函数', '建模', '数据', '预测', '规律', '正比例', '拟合', '散点图'],
        props: {
          data: { type: 'text', label: '数据（每组 x,y，组之间用分号）', default: '1,8;2,11;3,14;4,17', write: true },
          xname: { type: 'text', label: '横轴叫什么', default: 'x', write: true }, yname: { type: 'text', label: '纵轴叫什么', default: 'y', write: true },
          xmax: I(1, 1000, 10, '横轴到几'), ymax: I(1, 10000, 40, '纵轴到几'), xstep: I(1, 100, 1, '横轴每格'), ystep: I(1, 1000, 1, '纵轴每格'),
          ax: I(0, 1000, 0, '把手 A 的 x'), ay: I(0, 10000, 0, '把手 A 的 y'), bx: I(0, 1000, 5, '把手 B 的 x'), by: I(0, 10000, 10, '把手 B 的 y'), px: I(0, 1000, 0, '探针的 x'),
        },
        outputs: {
          k: { dim: null, kind: 'num', label: '斜率：每多 1，多几' }, b: { dim: null, kind: 'num', label: '截距：x 是 0 时是几' },
          hits: { dim: null, kind: 'num', label: '直线穿过了几个数据点' }, all: { dim: null, kind: 'num', label: '穿过了所有的点：1 是，0 否' },
          px: { dim: null, kind: 'num', label: '探针的 x' }, py: { dim: null, kind: 'num', label: '直线上对着的 y（预测）' },
        },
        icon: () => K.line(8, 40, 56, 8, { w: 2, stroke: 'var(--blue)' }) + K.circle(16, 35, 3.5, { fill: 'var(--good)', stroke: 'var(--ink)', w: 1 }) + K.circle(32, 24, 3.5, { fill: 'var(--good)', stroke: 'var(--ink)', w: 1 }) + K.circle(48, 13, 3.5, { fill: 'var(--good)', stroke: 'var(--ink)', w: 1 }),
        size: () => [W, 430],
        grips,
        compute: (c) => { const m = model(c.props), o = { hits: num(m.hits), all: num(m.all), px: num(m.px) }; if (m.k !== undefined) { o.k = qv(m.k); o.b = qv(m.b); o.py = qv(m.py); } return o; },
        badge: () => '',
        draw,
      },
    },
  });
  U.FitBench = { model, eqText };
})(typeof globalThis !== 'undefined' ? globalThis : window);
