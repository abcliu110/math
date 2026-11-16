/* 器材包 fastbench：速算原理。一张面积图，学生自己拉长、切开、剪下来转个方向拼过去，把不好算的乘法变成好算的。
 * 六种算法，都用同一个台面（出题人选）：
 *   - 拆补（99 × 37）：把 99 这条边拉到 100，多出来的一条标成红色；点红色那条把它拿掉。100 × 37 − 1 × 37。
 *   - 凑整（25 × 36）：拖把手决定把 36 切成每条多宽。切成每条 4，每条就是 25 × 4 = 100，一共 9 条。
 *   - 头同尾合十（23 × 27）：切成 4 块，把右上那条剪下来、转个方向接到左下面，左边一列就是 20 × 30。
 *   - 平方差（19 × 21）：把上面那条剪下来接到右边，拼成 20 × 20 缺一个 1 × 1 的角。
 *   - 完全平方（35 × 35）：拖把手决定在哪里切一刀。切在 30，四块是 900、150、150、25。
 *   - 切一刀（34 × 11）：拖把手把 11 切成 10 和 1：34 × 10 + 34 × 1。
 * 右边的式子跟着图变。只有切到“好算”的样子，最后的得数才写出来。
 * 这一版的边界（如实写）：图是示意，不按真实比例（1 和 99 没法按比例画）；只做乘法的速算；
 *   剪拼只有固定的那一块能拖、只有一个地方能放；加减法的凑整和乘 5、乘 25 的“先乘再除”还没有做。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 700, OX = 56, OY = 78, TX = 430;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const KINDS = ['拆补', '凑整', '头同尾合十', '平方差', '完全平方', '切一刀'];
  const roundUp = (a) => { const k = Math.pow(10, String(a).length - 1); return Math.ceil((a + 1) / k) * k; };
  const divisors = (n) => { const out = []; for (let i = 1; i <= n; i++) if (n % i === 0) out.push(i); return out; };
  const nice = (v) => v >= 10 && /^[1-9]0+$/.test(String(v));   // 10、100、1000、200、3000……一个数字带一串 0
  // 每种算法：现在的样子（几何 + 式子 + 做没做完）
  function model(p) {
    const kind = clamp(p.kind, 0, 5), a = clamp(p.a, 2, 999), b = kind === 4 ? a : clamp(p.b, 2, 999), stage = clamp(p.stage, 0, 2), m = { kind, a, b, stage, bad: '', ok: 0, lines: [] };
    if (kind === 0) {
      const R = roundUp(a), d = R - a; Object.assign(m, { R, d, stage, PA: 250, PD: 40, PH: 190 });
      m.ok = stage === 2 ? 1 : 0;
      m.lines = stage === 0 ? [a + ' × ' + b + ' 不好算', '把 ' + a + ' 这条边往右拉，拉到 ' + R] : stage === 1 ? [R + ' × ' + b + ' = ' + R * b, '多算了红色的一条：' + d + ' × ' + b + ' = ' + d * b, '点红色那一条，把它拿掉'] : [a + ' × ' + b + ' = ' + R + ' × ' + b + ' − ' + d + ' × ' + b, '= ' + R * b + ' − ' + d * b, '= ' + a * b];
    } else if (kind === 1) {
      const ds = divisors(b), s = ds.includes(p.s) ? p.s : b, n = b / s, good = nice(a * s) && n > 1; Object.assign(m, { ds, s, n, good, PW: 330, PH: 160 });
      m.ok = good ? 1 : 0;
      m.lines = [a + ' × ' + b, '把 ' + b + ' 切成每条 ' + s + '：一共 ' + n + ' 条', '每条 ' + a + ' × ' + s + ' = ' + a * s, good ? n + ' 个 ' + a * s + ' = ' + a * b : '每条好算吗？拖把手换一种切法'];
    } else if (kind === 2) {
      const T = Math.floor(a / 10) * 10, u = a - T, v = b - T;
      if (T < 10 || Math.floor(b / 10) * 10 !== T || u + v !== 10 || !u || !v) m.bad = '这种算法要“十位一样、个位加起来是 10”';
      const PT = T === 10 ? 110 : 150, f = (n) => Math.max(26, PT * n / T); Object.assign(m, { T, u, v, PT, PU: f(u), PV: f(v), st: stage ? 1 : 0 });
      m.ok = stage ? 1 : 0;
      m.lines = !stage ? [a + ' × ' + b + '：切成 4 块', '把右上那条（' + u + ' × ' + T + '）剪下来', '拖到左下面去，转个方向接上'] : ['左边一列：' + T + ' × (' + T + ' + ' + v + ' + ' + u + ')', '= ' + T + ' × ' + (T + 10) + ' = ' + T * (T + 10), '右下一小块：' + u + ' × ' + v + ' = ' + u * v, a + ' × ' + b + ' = ' + T * (T + 10) + ' + ' + u * v, '= ' + a * b];
    } else if (kind === 3) {
      const n = (a + b) / 2, d = (b - a) / 2;
      if (!Number.isInteger(n) || d <= 0) m.bad = '这种算法要“上面的数比下面的小，而且差是双数”';
      const PN = 176; Object.assign(m, { n, d, PN, PD: Math.max(28, PN * d / n), st: stage ? 1 : 0 });
      m.ok = stage ? 1 : 0;
      m.lines = !stage ? [a + ' × ' + b, '把上面那条（' + a + ' × ' + d + '）剪下来', '拖到右边去，转个方向接上'] : ['拼成 ' + n + ' × ' + n + '，缺一个角', '缺的角：' + d + ' × ' + d + ' = ' + d * d, a + ' × ' + b + ' = ' + n * n + ' − ' + d * d, '= ' + a * b];
    } else if (kind === 4) {
      const s = clamp(p.s, 1, a - 1), q = a - s, good = s % 10 === 0 || q % 10 === 0; Object.assign(m, { s, q, good, PS: 230 });
      m.ok = good ? 1 : 0;
      m.lines = [a + ' × ' + a + '：' + a + ' = ' + s + ' + ' + q, s + ' × ' + s + ' + 2 × ' + s + ' × ' + q + ' + ' + q + ' × ' + q, '= ' + s * s + ' + ' + 2 * s * q + ' + ' + q * q, good ? '= ' + a * a : '这四块好算吗？拖把手换个地方切'];
    } else {
      const s = clamp(p.s, 1, b - 1), q = b - s, good = s % 10 === 0 || q % 10 === 0 || s === 1 || q === 1; Object.assign(m, { s, q, good: good && (nice(s) || nice(q) || s % 10 === 0 || q % 10 === 0), PW: 300, PH: 210 });
      m.ok = m.good ? 1 : 0;
      m.lines = [a + ' × ' + b + '：' + b + ' = ' + s + ' + ' + q, a + ' × ' + s + ' + ' + a + ' × ' + q, m.good ? '= ' + a * s + ' + ' + a * q : '这两块好算吗？拖把手换个地方切', m.good ? '= ' + a * b : ''];
    }
    return m;
  }
  // 剪下来的那一块：原来在哪、要放到哪（kind 2、3）
  function piece(m) {
    if (m.kind === 2) return { home: { x: OX + m.PT, y: OY, w: m.PU, h: m.PT }, zone: { x: OX, y: OY + m.PT + m.PV, w: m.PT, h: m.PU }, lab: m.u + '×' + m.T, lab2: m.T + '×' + m.u };
    return { home: { x: OX, y: OY, w: m.PN - m.PD, h: m.PD }, zone: { x: OX + m.PN - m.PD, y: OY + 2 * m.PD, w: m.PD, h: m.PN - m.PD }, lab: m.a + '×' + m.d, lab2: m.d + '×' + m.a };
  }
  const inRect = (q, r, pad) => q.x >= r.x - pad && q.x <= r.x + r.w + pad && q.y >= r.y - pad && q.y <= r.y + r.h + pad;
  function plan(p0, gid, q) {
    const m = model(p0);
    if (m.bad) return { patch: {} };
    if (m.kind === 0 && gid === 'edge') return { patch: { stage: q.x > OX + m.PA + m.PD / 2 ? 1 : 0 } };
    if (m.kind === 1 && gid === 'cut') { const want = (q.x - OX) * m.b / m.PW; let best = m.ds[0]; for (const d of m.ds) if (Math.abs(d - want) < Math.abs(best - want)) best = d; return { patch: { s: best } }; }
    if ((m.kind === 2 || m.kind === 3) && gid === 'piece') { const pc = piece(m); return { patch: { stage: inRect(q, pc.zone, 26) ? 1 : 0 }, pc }; }
    if (m.kind === 4 && gid === 'cut') return { patch: { s: clamp(Math.round((q.x - OX) * m.a / m.PS), 1, m.a - 1) } };
    if (m.kind === 5 && gid === 'cut') return { patch: { s: clamp(Math.round((q.y - OY) * m.b / m.PH), 1, m.b - 1) } };
    return { patch: {} };
  }
  const FILL = ['#cfe0f5', '#fde9d2', '#dff3e4', '#f3e3f7'];
  const rc = (r, fill, lab, o) => { o = o || {}; const big = r.w >= 44 && r.h >= 20; return '<rect x="' + r.x + '" y="' + r.y + '" width="' + r.w + '" height="' + r.h + '" fill="' + fill + '" stroke="' + (o.stroke || 'var(--ink)') + '" stroke-width="' + (o.w || 1.5) + '"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') + (o.op ? ' opacity="' + o.op + '"' : '') + (o.attr || '') + '/>' + (lab && big ? K.text(r.x + r.w / 2, r.y + r.h / 2 + 5, lab, { size: o.size || 13, weight: 700 }) : ''); };
  const R = (x, y, w, h) => ({ x, y, w, h });
  const setG = (patch, inner, tip) => '<g data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"><title>' + K.esc(tip) + '</title>' + inner + '</g>';

  function draw(c) {
    const p = c.props, m = model(p), dragging = c.drag ? c.drag.grip : null; let s = '';
    s += K.text(20, 30, KINDS[m.kind] + '：' + m.a + ' × ' + m.b, { size: 16, weight: 700, anchor: 'start' });
    if (m.bad) return s + K.text(20, 60, m.bad, { size: 13, fill: 'var(--bad)', anchor: 'start' });
    if (m.kind === 0) {
      const main = R(OX, OY, m.PA, m.PH), strip = R(OX + m.PA, OY, m.PD, m.PH);
      s += rc(main, FILL[0], m.a + ' × ' + m.b) + K.text(OX + m.PA / 2, OY - 10, String(m.a), { size: 13, weight: 700 }) + K.text(OX - 10, OY + m.PH / 2 + 5, String(m.b), { size: 13, weight: 700, anchor: 'end' });
      if (m.stage === 0) s += rc(strip, 'none', '', { dash: '5 4', stroke: '#8a94a8' }) + K.text(OX + m.PA + m.PD / 2, OY - 10, '→ ' + m.R, { size: 12, fill: '#5a6478' });
      if (m.stage === 1) s += setG({ stage: 2 }, rc(strip, '#f7c8c8', '', { stroke: 'var(--bad)', w: 2, attr: ' data-strip="1"' }) + K.text(OX + m.PA + m.PD / 2, OY + m.PH / 2 + 5, m.d + '×' + m.b, { size: 11, weight: 700 }), '点一下：把多算的这一条拿掉') + K.text(OX + (m.PA + m.PD) / 2, OY + m.PH + 20, '一共 ' + m.R, { size: 13, weight: 700 });
      if (m.stage === 2) s += rc(strip, 'none', '', { dash: '5 4', stroke: 'var(--bad)' }) + K.text(OX + m.PA + m.PD / 2, OY + m.PH / 2 + 5, '−' + m.d * m.b, { size: 11, weight: 700, fill: 'var(--bad)' });
    } else if (m.kind === 1) {
      const w = m.PW / m.n;
      for (let i = 0; i < m.n; i++) s += rc(R(OX + i * w, OY, w, m.PH), m.good ? FILL[2] : FILL[0], w >= 44 ? String(m.a * m.s) : '', { attr: ' data-strip="1"' });
      s += K.text(OX + m.PW / 2, OY - 28, m.b + ' = ' + m.s + ' × ' + m.n, { size: 13, weight: 700 }) + K.text(OX + w / 2, OY + m.PH + 18, String(m.s), { size: 12, weight: 700 }) + K.text(OX - 10, OY + m.PH / 2 + 5, String(m.a), { size: 13, weight: 700, anchor: 'end' });
    } else if (m.kind === 2 || m.kind === 3) {
      const pc = piece(m), free = dragging === 'piece' && !m.st;
      if (m.kind === 2) {
        s += rc(R(OX, OY, m.PT, m.PT), FILL[0], m.T + '×' + m.T) + rc(R(OX, OY + m.PT, m.PT, m.PV), FILL[0], m.T + '×' + m.v) + rc(R(OX + m.PT, OY + m.PT, m.PU, m.PV), FILL[1], '') + K.text(OX + m.PT + m.PU + 8, OY + m.PT + m.PV / 2 + 5, m.u + '×' + m.v, { size: 12, weight: 700, anchor: 'start' });
        s += K.text(OX + m.PT / 2, OY - 10, String(m.T), { size: 13, weight: 700 }) + K.text(OX - 10, OY + m.PT / 2 + 5, String(m.T), { size: 13, weight: 700, anchor: 'end' }) + K.text(OX - 10, OY + m.PT + m.PV / 2 + 5, String(m.v), { size: 13, weight: 700, anchor: 'end' });
        if (m.st) s += K.text(OX - 10, pc.zone.y + pc.zone.h / 2 + 5, String(m.u), { size: 13, weight: 700, anchor: 'end' }) + K.line(OX - 34, OY, OX - 34, pc.zone.y + pc.zone.h, { w: 1.5, stroke: 'var(--blue)' }) + '<text x="' + (OX - 40) + '" y="' + (OY + (m.PT + m.PV + m.PU) / 2) + '" font-size="12" font-weight="700" fill="var(--blue)" text-anchor="middle" transform="rotate(-90 ' + (OX - 40) + ' ' + (OY + (m.PT + m.PV + m.PU) / 2) + ')">' + (m.T + 10) + '</text>';
        else s += K.text(OX + m.PT + m.PU / 2, OY - 10, String(m.u), { size: 13, weight: 700 });
      } else {
        s += rc(R(OX, OY + m.PD, m.PN - m.PD, m.PN), FILL[0], m.a + '×' + m.n) + K.text(OX - 10, OY + m.PD + m.PN / 2 + 5, String(m.n), { size: 13, weight: 700, anchor: 'end' }) + K.text(OX + (m.PN - m.PD) / 2, OY + m.PD + m.PN + 18, String(m.a), { size: 13, weight: 700 });
        if (m.st) s += rc(R(OX + m.PN - m.PD, OY + m.PD, m.PD, m.PD), 'none', '', { dash: '5 4', stroke: 'var(--bad)', attr: ' data-corner="1"' }) + K.text(OX + m.PN + 8, OY + m.PD + m.PD / 2 + 5, '缺 ' + m.d + '×' + m.d, { size: 12, weight: 700, anchor: 'start', fill: 'var(--bad)' }) + K.text(OX + m.PN / 2, OY + m.PD - 8, '整个是 ' + m.n + ' × ' + m.n, { size: 12, weight: 700, fill: 'var(--blue)' });
      }
      if (m.st) s += rc(pc.zone, FILL[1], pc.lab2, { size: 11, attr: ' data-placed="1"' });
      else { s += rc(pc.zone, 'none', '', { dash: '6 4', stroke: 'var(--blue)', attr: ' data-zone="1"' }); if (!free) s += rc(pc.home, FILL[1], pc.lab, { size: 11 }); else s += rc(pc.home, 'none', '', { dash: '3 3', stroke: '#8a94a8' }) + rc(R(c.drag.x - pc.home.w / 2, c.drag.y - pc.home.h / 2, pc.home.w, pc.home.h), FILL[1], pc.lab, { size: 11, op: 0.85 }); }
    } else if (m.kind === 4) {
      const ps = m.PS * m.s / m.a, pq = m.PS - ps, lab = (v, w, h) => (w >= 40 && h >= 20 ? String(v) : '');
      s += rc(R(OX, OY, ps, ps), FILL[0], lab(m.s * m.s, ps, ps)) + rc(R(OX + ps, OY, pq, ps), FILL[1], lab(m.s * m.q, pq, ps)) + rc(R(OX, OY + ps, ps, pq), FILL[1], lab(m.s * m.q, ps, pq)) + rc(R(OX + ps, OY + ps, pq, pq), FILL[2], lab(m.q * m.q, pq, pq));
      s += K.text(OX + ps / 2, OY - 26, String(m.s), { size: 13, weight: 700 }) + K.text(OX + ps + pq / 2, OY - 26, String(m.q), { size: 13, weight: 700 }) + K.text(OX - 10, OY + ps / 2 + 5, String(m.s), { size: 13, weight: 700, anchor: 'end' }) + K.text(OX - 10, OY + ps + pq / 2 + 5, String(m.q), { size: 13, weight: 700, anchor: 'end' });
    } else {
      const ps = m.PH * m.s / m.b, pq = m.PH - ps;
      s += rc(R(OX, OY, m.PW, ps), FILL[0], ps >= 20 ? m.a + ' × ' + m.s : '') + rc(R(OX, OY + ps, m.PW, pq), FILL[1], pq >= 20 ? m.a + ' × ' + m.q : '');
      s += K.text(OX + m.PW / 2, OY - 10, String(m.a), { size: 13, weight: 700 }) + K.text(OX + m.PW + 10, OY + ps / 2 + 5, String(m.s), { size: 13, weight: 700, anchor: 'start' }) + K.text(OX + m.PW + 10, OY + ps + pq / 2 + 5, String(m.q), { size: 13, weight: 700, anchor: 'start' });
    }
    // 右边：式子一行一行写出来
    m.lines.filter(Boolean).forEach((t, i, all) => { const last = i === all.length - 1; s += K.text(TX, 86 + i * 30, t, { size: last && m.ok ? 17 : 13, weight: last || i === 0 ? 700 : 400, anchor: 'start', fill: last ? (m.ok ? 'var(--good)' : 'var(--blue)') : 'var(--ink)' }); });
    s += '<g data-ok="' + m.ok + '"></g>';
    if ((m.kind === 0 || m.kind === 2 || m.kind === 3) && m.stage > 0) s += setG({ stage: 0 }, K.rect(TX, 250, 84, 26, { fill: '#fff', stroke: 'var(--blue)', r: 8, w: 1.5 }) + K.text(TX + 42, 267, '再做一遍', { size: 12, weight: 700 }), '回到开头，再做一遍');
    return s;
  }
  function grips(c) {
    const m = model(c.props), mk = (id, x, y, o) => Object.assign({ id, x, y, cursor: 'grab', drag: (c0, q) => plan(c0.props, id, q).patch, say: (c1) => { const m1 = model(c1.props); return m1.lines[m1.lines.length - 1] || m1.lines[m1.lines.length - 2] || ''; } }, o);
    if (m.bad) return [];
    if (m.kind === 0) return m.stage === 2 ? [] : [mk('edge', OX + m.PA + (m.stage ? m.PD : 0), OY + m.PH - 16, { shape: 'bar-v', cursor: 'ew-resize', tip: '拖我：把这条边拉长到 ' + m.R })];
    if (m.kind === 1) return [mk('cut', OX + m.PW * m.s / m.b, OY - 8, { shape: 'bar-v', cursor: 'ew-resize', tip: '拖我：每条切多宽' })];
    if (m.kind === 4) return [mk('cut', OX + m.PS * m.s / m.a, OY - 8, { shape: 'bar-v', cursor: 'ew-resize', tip: '拖我：在哪里切一刀' })];
    if (m.kind === 5) return [mk('cut', OX - 8, OY + m.PH * m.s / m.b, { shape: 'bar-h', cursor: 'ns-resize', tip: '拖我：在哪里切一刀' })];
    const pc = piece(m), r = m.st ? pc.zone : pc.home;
    return [mk('piece', r.x + r.w / 2, r.y + r.h / 2, { r: 12, ghost: true, tip: m.st ? '拖回去：放回原来的地方' : '拖我：剪下来，放到虚线框里' })];
  }
  const I = (lo, hi, d, label, o) => Object.assign({ type: 'int', label, default: d, min: lo, max: hi, write: true }, o || {});
  U.registerPack({
    id: 'fastbench', version: 1,
    types: {
      fastbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E2', 'E7'],
        label: '速算原理（剪拼面积图）', prefix: '速算', group: '数与运算', grades: [3, 8],
        alias: ['速算', '简便运算', '巧算', '凑整', '拆补', '头同尾合十', '平方差', '完全平方', '乘法分配律', '乘法结合律', '乘 11'],
        props: {
          kind: { type: 'choice', label: '哪一种算法', default: 0, choices: KINDS, write: true },
          a: I(2, 999, 99, '第一个数'), b: I(2, 999, 37, '第二个数（完全平方用不着）'),
          s: I(1, 999, 1, '切在哪里（自动）', { hidden: true }), stage: I(0, 2, 0, '做到第几步（自动）', { hidden: true }),
        },
        outputs: {
          ok: { dim: null, kind: 'num', label: '变成好算的样子了：1 是，0 否' }, value: { dim: null, kind: 'num', label: '得数（变成好算的样子才有）' },
          stage: { dim: null, kind: 'num', label: '做到第几步' }, s: { dim: null, kind: 'num', label: '切在哪里（每条多宽）' },
        },
        icon: () => K.rect(10, 12, 30, 24, { fill: '#cfe0f5', stroke: 'var(--ink)', w: 1.3, r: 1 }) + K.rect(40, 12, 10, 24, { fill: '#f7c8c8', stroke: 'var(--bad)', w: 1.3, r: 1 }),
        size: () => [W, 420],
        grips,
        compute: (c) => { const m = model(c.props), o = { ok: num(m.ok), stage: num(m.stage), s: num(m.s || 0) }; if (m.ok) o.value = num(m.a * m.b); return o; },
        badge: () => '',
        draw,
      },
    },
  });
  U.FastBench = { model, plan, piece, KINDS };
})(typeof globalThis !== 'undefined' ? globalThis : window);
