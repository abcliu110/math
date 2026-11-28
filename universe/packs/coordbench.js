/* 器材包 coordbench：坐标与函数操作台（docs/instrument-design.md 第 4 节）。一张坐标格，三种用法，全部在图上直接拖：
 *   直线：  拖直线和 y 轴的交点改截距 b；拖直线上的另一个把手改斜率 k（它在 x = 分母 的地方，所以 1/2 这样的斜率也拖得出来）。
 *           右边的表和式子跟着变：图、表、式三样是同一条直线。x 轴上还有一个探针，拖它看这个 x 对着的 y。
 *   两点：  拖两个点，过它们的直线自动画出来；旁边画出“向右几、向上几”的台阶，斜率就是它们的比。
 *   两条直线：两条线各有截距和斜率两个把手。交点自动标出来，它的坐标同时满足两个式子——就是方程组的解；两条线平行就没有解。
 *   抛物线：拖顶点；拖顶点右边一格的把手改开口的大小和方向。写出顶点式和展开式，数出和 x 轴有几个交点。
 * 坐标格是 −6 到 6，每格 24 像素，固定不变，所以把手一直跟着鼠标。
 * 这一版的边界（如实写）：坐标只到 ±6；直线的斜率是分母不超过 4 的分数；抛物线的 a 是 1/2 的倍数；没有反比例和两条线求交点。
 * 大数（2026-11-28，试验台增强 7 第二轮）：坐标格下面点“一格 = 1 / 2 / 5 / 10”换单位（属性 gu），坐标格还是 12 × 12 格、每格 24 像素，
 *   能画到 ±12、±30、±60（比如 y = 2x + 20）。拖点、拖截距、拖探针都落在格点上（一格 = 5 时只落在 5 的倍数上）；斜率还是“向右 1 格、向上几格”，
 *   和单位无关。抛物线只用一格 = 1（a 是 1/2 的倍数，格子大了开口窄得看不出）。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', typeof n === 'number' ? Q(n) : n, { dim: null });
  const MODES = ['直线', '两点', '抛物线', '两条直线'];
  const W = 620, R = 6, CELL = 24, GX = 34, GY = 34, OX = GX + R * CELL, OY = GY + R * CELL, TX = GX + 2 * R * CELL + 30;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  // 一格是几（属性 gu 是下标）。画图、拖动都按“现在这一格是几”换算：X、Y 把坐标换成像素，ix、iy 反过来
  const UNITS = [1, 2, 5, 10], unitOf = (p) => (p.mode === 2 ? 1 : UNITS[clamp(Math.round(+p.gu) || 0, 0, 3)]);
  let UU = 1;   // 正在画的这张卡片的一格是几（draw、grips 一开头设好；拖动时用按下那一刻的 c0.props 重新算）
  const X = (x) => OX + x * CELL / UU, Y = (y) => OY - y * CELL / UU, ix = (px) => (px - OX) / CELL * UU, iy = (py) => (OY - py) / CELL * UU;
  const snapU = (v, u) => Math.round(v / u) * u;
  const qs = (q) => Q.show(q).replace('-', '−'), sg = (n) => (n < 0 ? '−' + (-n) : String(n));

  function model(p) {
    const u = unitOf(p), RR = R * u;
    if (p.mode === 1) {
      const ax = clamp(p.ax, -RR, RR), ay = clamp(p.ay, -RR, RR), bx = clamp(p.bx, -RR, RR), by = clamp(p.by, -RR, RR);
      const m = { mode: 1, u, RR, ax, ay, bx, by, vertical: ax === bx, same: ax === bx && ay === by };
      if (!m.vertical) { m.k = Q(by - ay, bx - ax); m.b = Q.sub(Q(ay), Q.mul(m.k, Q(ax))); }
      return m;
    }
    if (p.mode === 2) {
      const a2 = p.a2 === 0 ? 2 : clamp(p.a2, -6, 6), h = clamp(p.h, -R, R), v = clamp(p.v, -R, R), a = Q(a2, 2);
      const t = -v * 2 / a2;   // (x − h)² = −v/a
      return { mode: 2, u, RR, a2, a, h, v, roots: t > 0 ? 2 : t === 0 ? 1 : 0, B: Q.mul(Q(-2 * h), a), C: Q.add(Q.mul(a, Q(h * h)), Q(v)) };
    }
    if (p.mode === 3) {
      const kd = clamp(p.kd, 1, 4), kn = clamp(p.kn, -12, 12), b = clamp(p.b, -RR, RR), k = Q(kn, kd), k2i = clamp(p.k2, -6, 6), b2i = clamp(p.b2, -RR, RR);
      const m = { mode: 3, u, RR, kn, kd, k, b: Q(b), bi: b, k2: Q(k2i), k2i, b2: Q(b2i), b2i };
      if (Q.eq(k, m.k2)) m.meet = b === b2i ? 2 : 0;
      else { m.meet = 1; m.ix = Q.div(Q.sub(m.b2, m.b), Q.sub(k, m.k2)); m.iy = Q.add(Q.mul(k, m.ix), m.b); }
      return m;
    }
    const kd = clamp(p.kd, 1, 4), kn = clamp(p.kn, -12, 12), b = clamp(p.b, -RR, RR), k = Q(kn, kd), x = clamp(p.x, -RR, RR);
    return { mode: 0, u, RR, kn, kd, k, b: Q(b), bi: b, x, y: Q.add(Q.mul(k, Q(x)), Q(b)), root: kn === 0 ? null : Q.div(Q(-b), k) };
  }
  // y = kx + b 写成式子
  function lineEq(k, b) {
    const kn = Q.num(k), bn = Q.num(b);
    const kx = kn === 0 ? '' : kn === 1 ? 'x' : kn === -1 ? '−x' : qs(k) + 'x';
    if (!kx) return 'y = ' + qs(b);
    return 'y = ' + kx + (bn === 0 ? '' : bn > 0 ? ' + ' + qs(b) : ' − ' + qs(Q.abs(b)));
  }
  // 直线在坐标格里露出来的那一段
  function clipLine(k, b, col) {
    const RR = R * UU, pts = [], kn = Q.num(k), bn = Q.num(b), add = (x, y) => { if (x >= -RR - 1e-9 && x <= RR + 1e-9 && y >= -RR - 1e-9 && y <= RR + 1e-9) pts.push([x, y]); };
    add(-RR, -RR * kn + bn); add(RR, RR * kn + bn);
    if (kn !== 0) { add((-RR - bn) / kn, -RR); add((RR - bn) / kn, RR); }
    if (pts.length < 2) return '';
    pts.sort((u, v) => u[0] - v[0]);
    const a = pts[0], z = pts[pts.length - 1];
    return K.line(X(a[0]), Y(a[1]), X(z[0]), Y(z[1]), { w: 3, stroke: col || 'var(--blue)' });
  }
  function grid() {
    let s = K.rect(GX, GY, 2 * R * CELL, 2 * R * CELL, { fill: '#fff', stroke: '#8a94a8', r: 0 });
    for (let j = -R; j <= R; j++) {
      const i = j * UU;
      s += K.line(X(i), GY, X(i), GY + 2 * R * CELL, { w: i === 0 ? 2 : 0.5, stroke: i === 0 ? 'var(--ink)' : '#b9c2d3' }) + K.line(GX, Y(i), GX + 2 * R * CELL, Y(i), { w: i === 0 ? 2 : 0.5, stroke: i === 0 ? 'var(--ink)' : '#b9c2d3' });
      if (j !== 0 && j % 2 === 0) s += K.text(X(i), OY + 14, sg(i), { size: 10 }) + K.text(OX - (UU >= 5 ? 13 : 10), Y(i) + 4, sg(i), { size: 10 });
    }
    return s + K.text(GX + 2 * R * CELL + 10, OY + 4, 'x', { size: 12, weight: 700 }) + K.text(OX, GY - 8, 'y', { size: 12, weight: 700 });
  }
  const dot = (x, y, col) => K.circle(X(x), Y(y), 5, { fill: col || 'var(--blue)', stroke: '#fff', w: 1.5 });
  const pickBtn = (x, y, tx, k, v, tip) => '<g data-pick-k="' + k + '" data-pick-v="' + v + '" style="cursor:pointer"><title>' + K.esc(tip) + '</title>' + K.rect(x, y, 24, 22, { fill: '#fff', stroke: '#8a94a8', r: 6 }) + K.text(x + 12, y + 16, tx, { size: 14, weight: 700 }) + '</g>';
  const L = (i, t, o) => K.text(TX, GY + 16 + i * 22, t, Object.assign({ size: 14, anchor: 'start' }, o || {}));

  // 坐标格下面：一格 = 1 / 2 / 5 / 10（抛物线只用 1）
  function unitBtns(m, p) {
    const y = GY + 2 * R * CELL + 22, cur = clamp(Math.round(+p.gu) || 0, 0, 3);
    let s = K.text(GX, y + 15, m.mode === 2 ? '抛物线：一格 = 1' : '一格 =', { size: 12, anchor: 'start', weight: 700 });
    // 换单位时坐标跟着放大（缩小）：图不动，数变了（3 → 一格 = 5 时是 15）；斜率不变
    const scaled = (u) => { const o = { gu: UNITS.indexOf(u) }; for (const k of ['b', 'x', 'ax', 'ay', 'bx', 'by', 'b2']) if (p[k] !== undefined) o[k] = clamp(Math.round(+p[k] / m.u * u), -R * u, R * u); return o; };
    if (m.mode !== 2) UNITS.forEach((u, i) => { const x = GX + 50 + i * 34; s += '<g data-pick-set="' + encodeURIComponent(JSON.stringify(scaled(u))) + '" data-gu="' + i + '" style="cursor:pointer"><title>坐标格一格是 ' + u + '</title>' + K.rect(x, y, 28, 22, { fill: i === cur ? 'var(--blue)' : '#fff', stroke: '#8a94a8', r: 6 }) + K.text(x + 14, y + 16, String(u), { size: 13, weight: 700, fill: i === cur ? '#fff' : 'var(--ink)' }) + '</g>'; });
    if (m.u > 1) s += K.big.unitNote(W - 24, y + 15, '一格 = ' + m.u + '：能画到 ±' + m.RR);
    return s;
  }
  function draw(c) {
    const m = model(c.props); UU = m.u; let s = grid() + unitBtns(m, c.props);
    if (m.mode === 0) {
      s += clipLine(m.k, m.b);
      const yv = Q.num(m.y);
      if (Math.abs(yv) <= m.RR) s += K.line(X(m.x), OY, X(m.x), Y(yv), { w: 1.4, dash: '4 3', stroke: 'var(--accent)' }) + K.line(OX, Y(yv), X(m.x), Y(yv), { w: 1.4, dash: '4 3', stroke: 'var(--accent)' }) + dot(m.x, yv, 'var(--accent)');
      s += L(0, lineEq(m.k, m.b), { size: 19, weight: 700 });
      s += L(1.4, '斜率 k = ' + qs(m.k) + '：向右 ' + m.kd + '，' + (m.kn >= 0 ? '向上 ' : '向下 ') + Math.abs(m.kn));
      s += K.text(TX, GY + 16 + 2.6 * 22, '分母', { size: 12, anchor: 'start' }) + pickBtn(TX + 30, GY + 16 + 2.6 * 22 - 16, '−', 'kd', Math.max(1, m.kd - 1), '斜率的分母减 1') + K.text(TX + 70, GY + 16 + 2.6 * 22, String(m.kd), { size: 14, weight: 700 }) + pickBtn(TX + 84, GY + 16 + 2.6 * 22 - 16, '＋', 'kd', Math.min(4, m.kd + 1), '斜率的分母加 1（可以拖出 1/2、2/3 这样的斜率）');
      s += L(3.8, '截距 b = ' + qs(m.b) + '：和 y 轴交在 (0, ' + qs(m.b) + ')');
      s += L(5, m.root === null ? '和 x 轴平行，没有交点' : '和 x 轴交在 x = ' + qs(m.root));
      s += L(6.2, c.masked ? 'x = ' + sg(m.x) + ' 时，y = ？' : 'x = ' + sg(m.x) + ' 时，y = ' + qs(m.y), { weight: 700, fill: 'var(--accent)' });
      // 取值表
      const ty = GY + 16 + 7.6 * 22;
      s += K.text(TX, ty, 'x', { size: 13, anchor: 'start', weight: 700 }) + K.text(TX, ty + 22, 'y', { size: 13, anchor: 'start', weight: 700 });
      for (let i = -2; i <= 2; i++) s += K.text(TX + 44 + (i + 2) * 36, ty, sg(i * m.u), { size: 13 }) + K.text(TX + 44 + (i + 2) * 36, ty + 22, c.masked ? '？' : qs(Q.add(Q.mul(m.k, Q(i * m.u)), m.b)), { size: 13 });
    } else if (m.mode === 3) {
      s += clipLine(m.k, m.b) + clipLine(m.k2, m.b2, '#d9772b');
      s += L(0, lineEq(m.k, m.b), { size: 17, weight: 700, fill: 'var(--blue)' }) + L(1.2, lineEq(m.k2, m.b2), { size: 17, weight: 700, fill: '#a85410' });
      if (m.meet === 1) {
        const xn = Q.num(m.ix), yn = Q.num(m.iy);
        if (Math.abs(xn) <= m.RR && Math.abs(yn) <= m.RR) s += K.line(X(xn), OY, X(xn), Y(yn), { w: 1.2, dash: '4 3', stroke: 'var(--accent)' }) + K.line(OX, Y(yn), X(xn), Y(yn), { w: 1.2, dash: '4 3', stroke: 'var(--accent)' }) + K.circle(X(xn), Y(yn), 6, { fill: 'var(--accent)', stroke: '#fff', w: 1.5 });
        s += L(2.8, c.masked ? '交点在哪里？' : '交点 (' + qs(m.ix) + ', ' + qs(m.iy) + ')', { weight: 700, fill: 'var(--accent)' });
        if (!c.masked) s += L(4, 'x = ' + qs(m.ix) + '，y = ' + qs(m.iy)) + L(5, '同时满足两个式子：') + L(6, '这就是方程组的解');
      } else if (m.meet === 0) s += L(2.8, '两条线平行：没有交点', { weight: 700, fill: 'var(--bad)' }) + L(4, '斜率一样、截距不一样，') + L(5, '方程组没有解');
      else s += L(2.8, '两条线重合：处处是交点', { weight: 700, fill: 'var(--bad)' }) + L(4, '方程组有无数个解');
    } else if (m.mode === 1) {
      if (m.same) s += L(0, '两个点重合了，定不出直线', { fill: 'var(--bad)' });
      else if (m.vertical) s += K.line(X(m.ax), GY, X(m.ax), GY + 2 * R * CELL, { w: 3, stroke: 'var(--blue)' }) + L(0, 'x = ' + sg(m.ax), { size: 19, weight: 700 }) + L(1.4, '竖直的线：向右走 0，没有斜率');
      else {
        s += clipLine(m.k, m.b);
        // 台阶：从 A 向右 run，再向上 rise
        s += K.line(X(m.ax), Y(m.ay), X(m.bx), Y(m.ay), { w: 2, dash: '5 3', stroke: 'var(--accent)' }) + K.line(X(m.bx), Y(m.ay), X(m.bx), Y(m.by), { w: 2, dash: '5 3', stroke: 'var(--accent)' });
        const run = m.bx - m.ax, rise = m.by - m.ay;
        s += L(0, lineEq(m.k, m.b), { size: 19, weight: 700 });
        s += L(1.4, '从 A 到 B：横着走 ' + sg(run) + '，竖着走 ' + sg(rise));
        s += L(2.6, '斜率 k = ' + sg(rise) + ' ÷ ' + (run < 0 ? '(' + sg(run) + ')' : run) + ' = ' + qs(m.k), { weight: 700 });
        s += L(3.8, '截距 b = ' + qs(m.b));
      }
      s += K.text(X(m.ax) - 10, Y(m.ay) - 10, 'A', { size: 13, weight: 700 }) + K.text(X(m.bx) + 10, Y(m.by) - 10, 'B', { size: 13, weight: 700 });
      s += L(6.2, 'A (' + sg(m.ax) + ', ' + sg(m.ay) + ')　B (' + sg(m.bx) + ', ' + sg(m.by) + ')');
    } else {
      const an = Q.num(m.a); let d = '';
      for (let i = 0; i <= 96; i++) { const x = -m.RR + i * (2 * m.RR / 96), y = an * (x - m.h) * (x - m.h) + m.v; if (y < -m.RR - 0.01 || y > m.RR + 0.01) { d += ' '; continue; } d += (d && d[d.length - 1] !== ' ' ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Y(y).toFixed(1); }
      s += '<path d="' + d.trim().replace(/\s+/g, ' ') + '" fill="none" stroke="var(--blue)" stroke-width="3"/>';
      s += K.line(X(m.h), GY, X(m.h), GY + 2 * R * CELL, { w: 1.2, dash: '5 4', stroke: 'var(--accent)' });
      const hh = m.h === 0 ? 'x' : m.h > 0 ? '(x − ' + m.h + ')' : '(x + ' + (-m.h) + ')', aa = an === 1 ? '' : an === -1 ? '−' : qs(m.a);
      s += L(0, 'y = ' + aa + hh + '²' + (m.v === 0 ? '' : m.v > 0 ? ' + ' + m.v : ' − ' + (-m.v)), { size: 18, weight: 700 });
      const bn = Q.num(m.B), cn = Q.num(m.C);
      s += L(1.4, '展开：y = ' + (an === 1 ? '' : an === -1 ? '−' : qs(m.a)) + 'x²' + (bn === 0 ? '' : (bn > 0 ? ' + ' : ' − ') + (Math.abs(bn) === 1 ? '' : qs(Q.abs(m.B))) + 'x') + (cn === 0 ? '' : (cn > 0 ? ' + ' : ' − ') + qs(Q.abs(m.C))));
      s += L(2.6, '顶点 (' + sg(m.h) + ', ' + sg(m.v) + ')，对称轴 x = ' + sg(m.h));
      s += L(3.8, '开口' + (an > 0 ? '向上，顶点最低' : '向下，顶点最高') + '；a = ' + qs(m.a));
      s += L(5, c.masked ? '和 x 轴有几个交点？' : '和 x 轴有 ' + m.roots + ' 个交点', { weight: 700, fill: 'var(--accent)' });
    }
    return s;
  }

  function grips(c) {
    const m = model(c.props), out = [], u = m.u, RR = m.RR; UU = u;
    // 拖动时按按下那一刻的一格换算（UU 可能被别的卡片改过）
    const at0 = (c0) => { const m0 = model(c0.props); UU = m0.u; return m0; };
    const rx = (q) => clamp(snapU(ix(q.x), UU), -R * UU, R * UU), ry = (q) => clamp(snapU(iy(q.y), UU), -R * UU, R * UU);
    if (m.mode === 0) {
      out.push({ id: 'b', x: X(0), y: Y(m.bi), r: 8, cursor: 'ns-resize', tip: '上下拖：改截距（整条线平移）',
        drag: (c0, q) => { at0(c0); return { b: ry(q) }; }, say: (c1) => lineEq(model(c1.props).k, model(c1.props).b) });
      const sy = m.bi + m.kn * u;
      out.push({ id: 'k', x: X(m.kd * u), y: Y(clamp(sy, -RR - u, RR + u)), r: 8, text: 'k', cursor: 'ns-resize', tip: '上下拖：改斜率（线绕着和 y 轴的交点转）',
        drag: (c0, q) => { const m0 = at0(c0); return { kn: clamp(Math.round((iy(q.y) - m0.bi) / m0.u), -12, 12) }; }, say: (c1) => lineEq(model(c1.props).k, model(c1.props).b) });
      out.push({ id: 'x', x: X(m.x), y: OY, r: 7, cursor: 'ew-resize', tip: '左右拖：看这个 x 对着的 y',
        drag: (c0, q) => { at0(c0); return { x: rx(q) }; }, say: (c1) => { const m1 = model(c1.props); return 'x = ' + sg(m1.x) + '，y = ' + qs(m1.y); } });
    } else if (m.mode === 3) {
      const ey = (c0, q) => { at0(c0); return ry(q); };
      out.push({ id: 'b', x: X(0), y: Y(m.bi), r: 8, cursor: 'ns-resize', tip: '上下拖：蓝线的截距', drag: (c0, q) => ({ b: ey(c0, q) }), say: (c1) => lineEq(model(c1.props).k, model(c1.props).b) });
      out.push({ id: 'k', x: X(m.kd * u), y: Y(clamp(m.bi + m.kn * u, -RR - u, RR + u)), r: 8, text: 'k', cursor: 'ns-resize', tip: '上下拖：蓝线的斜率', drag: (c0, q) => { const m0 = at0(c0); return { kn: clamp(Math.round((iy(q.y) - m0.bi) / m0.u), -12, 12) }; }, say: (c1) => lineEq(model(c1.props).k, model(c1.props).b) });
      out.push({ id: 'b2', x: X(0) - 0.01, y: Y(m.b2i), r: 8, ghost: true, cursor: 'ns-resize', tip: '上下拖：橙线的截距', drag: (c0, q) => ({ b2: ey(c0, q) }), say: (c1) => lineEq(model(c1.props).k2, model(c1.props).b2) });
      out.push({ id: 'k2', x: X(-u), y: Y(clamp(m.b2i - m.k2i * u, -RR - u, RR + u)), r: 8, text: 'k', ghost: true, cursor: 'ns-resize', tip: '上下拖：橙线的斜率（这个把手在左边一格的地方）', drag: (c0, q) => { const m0 = at0(c0); return { k2: clamp(Math.round((m0.b2i - iy(q.y)) / m0.u), -6, 6) }; }, say: (c1) => lineEq(model(c1.props).k2, model(c1.props).b2) });
    } else if (m.mode === 1) {
      out.push({ id: 'A', x: X(m.ax), y: Y(m.ay), r: 8, cursor: 'move', tip: '拖点 A', drag: (c0, q) => { at0(c0); return { ax: rx(q), ay: ry(q) }; }, say: (c1) => 'A (' + sg(c1.props.ax) + ', ' + sg(c1.props.ay) + ')' });
      out.push({ id: 'B', x: X(m.bx), y: Y(m.by), r: 8, cursor: 'move', tip: '拖点 B', drag: (c0, q) => { at0(c0); return { bx: rx(q), by: ry(q) }; }, say: (c1) => 'B (' + sg(c1.props.bx) + ', ' + sg(c1.props.by) + ')' });
    } else {
      out.push({ id: 'v', x: X(m.h), y: Y(m.v), r: 8, cursor: 'move', tip: '拖顶点：整条抛物线平移', drag: (c0, q) => { at0(c0); return { h: rx(q), v: ry(q) }; }, say: (c1) => '顶点 (' + sg(c1.props.h) + ', ' + sg(c1.props.v) + ')' });
      const ay = m.v + Q.num(m.a);
      out.push({ id: 'a', x: X(m.h + 1), y: Y(clamp(ay, -R - 1, R + 1)), r: 8, text: 'a', cursor: 'ns-resize', tip: '上下拖：改开口的大小；拖到顶点下面，开口就朝下',
        drag: (c0, q) => { const m0 = at0(c0); let a2 = clamp(Math.round((iy(q.y) - m0.v) * 2), -6, 6); if (a2 === 0) a2 = m0.a2 > 0 ? 1 : -1; return { a2 }; },
        say: (c1) => 'a = ' + qs(model(c1.props).a) });
    }
    return out;
  }

  const I = (lo, hi, d, label, o) => Object.assign({ type: 'int', label, default: d, min: lo, max: hi, write: true }, o || {});
  const RM = R * UNITS[UNITS.length - 1], QR = { qmin: -R, qmax: R };   // 一格 = 10 时到 ±60；随机出题只试 ±6（和以前一样）
  U.registerPack({
    id: 'coordbench', version: 1,
    types: {
      coordbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E6', 'E2'],
        label: '坐标与函数', prefix: '坐标', group: '函数', grades: [5, 9],
        alias: ['坐标', '函数', '一次函数', '直线', '斜率', '截距', '正比例', '二次函数', '抛物线', '顶点', '图像'],
        props: {
          mode: { type: 'choice', label: '用来做什么', default: 0, choices: MODES, write: true },
          gu: { type: 'choice', label: '坐标格一格是几（抛物线只用 1）', default: 0, choices: UNITS.map(String), write: true },
          kn: I(-12, 12, 1, '斜率的分子'), kd: I(1, 4, 1, '斜率的分母'), b: I(-RM, RM, 0, '截距', QR), x: I(-RM, RM, 1, '探针的 x', QR),
          ax: I(-RM, RM, -2, 'A 的 x', QR), ay: I(-RM, RM, -1, 'A 的 y', QR), bx: I(-RM, RM, 2, 'B 的 x', QR), by: I(-RM, RM, 1, 'B 的 y', QR),
          k2: I(-6, 6, -1, '第二条直线的斜率（两条直线）'), b2: I(-RM, RM, 4, '第二条直线的截距（两条直线）', QR),
          a2: I(-6, 6, 2, '抛物线的 a 的 2 倍'), h: I(-R, R, 0, '顶点的 x'), v: I(-R, R, 0, '顶点的 y'),
        },
        outputs: {
          k: { dim: null, kind: 'num', label: '斜率（竖直线没有）' },
          b: { dim: null, kind: 'num', label: '截距' },
          y: { dim: null, kind: 'num', label: '探针处的 y' },
          root: { dim: null, kind: 'num', label: '直线和 x 轴的交点（平行时没有）' },
          a: { dim: null, kind: 'num', label: '抛物线的 a' },
          h: { dim: null, kind: 'num', label: '顶点的 x' },
          v: { dim: null, kind: 'num', label: '顶点的 y' },
          roots: { dim: null, kind: 'num', label: '抛物线和 x 轴的交点个数' },
          ix: { dim: null, kind: 'num', label: '两条直线交点的 x（有交点才有）' }, iy: { dim: null, kind: 'num', label: '两条直线交点的 y' },
          meet: { dim: null, kind: 'num', label: '两条直线：1 相交，0 平行，2 重合' },
          px: { dim: null, kind: 'num', label: '点 A 的横坐标（两点）' }, py: { dim: null, kind: 'num', label: '点 A 的纵坐标（两点）' },
          qx: { dim: null, kind: 'num', label: '点 B 的横坐标（两点）' }, qy: { dim: null, kind: 'num', label: '点 B 的纵坐标（两点）' },
        },
        icon: () => K.line(8, 36, 56, 36, { w: 1.5 }) + K.line(16, 6, 16, 40, { w: 1.5 }) + K.line(10, 34, 54, 10, { w: 2.5, stroke: 'var(--blue)' }),
        size: () => [W, 412],   // 2026-11-28：下面多一行“一格 = 1 / 2 / 5 / 10”
        grips,
        compute: (c) => {
          const m = model(c.props), z = num(0);
          if (m.mode === 3) { const o = { k: num(m.k), b: num(m.b), meet: num(m.meet), y: z, a: z, h: z, v: z, roots: z, px: z, py: z, qx: z, qy: z }; if (m.meet === 1) { o.ix = num(m.ix); o.iy = num(m.iy); } return o; }
          if (m.mode === 1) { const o = { y: z, a: z, h: z, v: z, roots: z, px: num(m.ax), py: num(m.ay), qx: num(m.bx), qy: num(m.by) }; if (!m.vertical) { o.k = num(m.k); o.b = num(m.b); if (Q.num(m.k) !== 0) o.root = num(Q.div(Q.neg ? Q.neg(m.b) : Q.sub(Q(0), m.b), m.k)); } return o; }
          if (m.mode === 2) return { a: num(m.a), h: num(m.h), v: num(m.v), roots: num(m.roots), k: z, b: z, y: z, px: z, py: z, qx: z, qy: z };
          const o = { k: num(m.k), b: num(m.b), y: num(m.y), a: z, h: z, v: z, roots: z, px: z, py: z, qx: z, qy: z }; if (m.root !== null) o.root = num(m.root); return o;
        },
        badge: () => '',
        draw,
      },
    },
  });
  U.CoordBench = { model, lineEq, MODES, UNITS };
})(typeof globalThis !== 'undefined' ? globalThis : window);
