/* 器材包 circlebench：圆。拖半径、拖圆心角、拖高、拖直线，看面积、周长、扇形、圆柱圆锥的体积、直线和圆的位置、圆周角怎么变。
 *   - 圆：拖半径的把手。写出直径 = 2 × 半径、周长 = 2 × π × r、面积 = π × r × r（π 取 3.14）。
 *   - 扇形：再拖圆心角的把手。扇形占整圆的 θ ÷ 360：面积和弧长都按这个比例。
 *   - 圆柱和圆锥：拖底面半径和高；点“圆柱 / 圆锥”切换。圆锥是等底等高圆柱的三分之一。
 *   - 直线与圆：拖直线上下移动，看圆心到直线的距离 d 和半径 r 比：d > r 相离，d = r 相切，d < r 相交。
 *   - 圆周角：拖弧的端点改圆心角，圆周角一直是它的一半。
 * 这一版的边界（如实写）：半径、高、距离是 1 到 50 的整数（圆是 0.5 也行）；π 只取 3.14；圆周角的顶点固定在优弧的正中间。
 * 大数（2026-11-28，试验台增强 7 第二轮）：以前半径、高、距离最大 10。现在到 50（圆形花坛半径 20 米、水池直径 50 米、圆柱高 40 厘米这类题）。
 *   图按“最大的那个数”分三档缩放：10 以内 1 = 17 像素（和以前一样），20 以内 1 = 8.5 像素，再大 1 = 3.4 像素，图上写“数大了，图缩小画”。
 *   拖的时候用按下那一刻的比例（把手一直跟着鼠标），松手后才换档；1 = 3.4 像素时一步 2（一步至少 4 像素），10 以内半径还是 0.5 一步。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const qv = (q) => U.val('num', q, { dim: null }), num = (n) => qv(Q(n));
  const W = 700, CX = 220, CY = 222, PI = Q(314, 100), RMAX = 50;
  // 按最大的那个数分档：10 以内 1 = 17 像素，20 以内 8.5，再大 3.4（170 像素放得下这一档的最大数）
  const rangeOf = (v) => (v <= 10 ? 10 : v <= 20 ? 20 : 50);
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? +v : lo));
  const MODES = ['圆', '扇形', '圆柱和圆锥', '直线与圆', '圆周角'];
  function model(p) {
    const mode = clamp(p.mode, 0, 4), r2 = clamp(Math.round(p.r * 2), 1, 2 * RMAX), r = Q(r2, 2), th = clamp(Math.round(p.theta / 10) * 10, 10, 360), h = clamp(Math.round(p.h), 1, RMAX), d = clamp(Math.round(p.d), 0, RMAX), ca = clamp(Math.round(p.ca / 10) * 10, 20, 340);
    const area = Q.mul(PI, Q.mul(r, r)), c = Q.mul(Q(2), Q.mul(PI, r)), frac = Q(th, 360), cone = p.cone === true || p.cone === 1;
    const vcyl = Q.mul(area, Q(h)), vol = cone ? Q.div(vcyl, Q(3)) : vcyl, rn = r2 / 2, rel = d > rn ? 0 : d === rn ? 1 : 2;
    const big = mode === 2 ? Math.max(rn, h) : mode === 3 ? Math.max(rn, d) : rn, rg = rangeOf(big), UN = 170 / rg;
    // 拖动一步：10 以内的圆、扇形半径 0.5 一步；其余整数；一步不到 4 像素就按 2、5……取整
    const st = (half) => (half && UN * 0.5 >= 4 ? 0.5 : K.big.grain(UN, 4));
    return { mode, r, rn, th, h, d, ca, area, c, frac, sector: Q.mul(area, frac), arc: Q.mul(c, frac), cone, vcyl, vol, rel, ins: ca / 2, rg, UN, st };
  }
  const f2 = (q) => { const v = Q.num(q); return Number.isInteger(v) ? String(v) : String(Math.round(v * 100) / 100); };
  const btn = (x, y, w, label, patch, active, tip) => '<g data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 26, { fill: active ? 'var(--blue)' : '#fff', stroke: 'var(--blue)', r: 8, w: 1.5 }) + K.text(x + w / 2, y + 17, label, { size: 12, weight: 700, fill: active ? '#fff' : 'var(--ink)' }) + '</g>';
  const pol = (deg, R) => ({ x: CX + R * Math.sin(deg * Math.PI / 180), y: CY - R * Math.cos(deg * Math.PI / 180) });
  const RT = ['相离', '相切', '相交'];

  // 拖的时候用按下那一刻的比例（把手一直跟着鼠标），松手后再换档
  const unOf = (c, m) => (c && c.drag && c.drag.p0 ? model(c.drag.p0).UN : m.UN);
  function draw(c) {
    const p = c.props, m = model(p), UN = unOf(c, m), R = m.rn * UN, TX = 440; let s = '', lines = [];
    if (UN < 17) s += K.big.unitNote(TX - 16, 26, '数大了，图缩小画');
    s += K.text(20, 26, MODES[m.mode] + '：半径 ' + f2(m.r), { size: 16, weight: 700, anchor: 'start' });
    if (m.mode === 0 || m.mode === 1) {
      s += K.circle(CX, CY, R, { fill: m.mode === 1 ? '#f6f8fc' : '#eef3fb', stroke: 'var(--ink)', w: 2 });
      if (m.mode === 1) { const a = pol(m.th, R), big = m.th > 180 ? 1 : 0; s += m.th >= 360 ? K.circle(CX, CY, R, { fill: '#f5c26b', stroke: 'var(--ink)', w: 2 }) : '<path data-sector="1" d="M' + CX + ' ' + CY + ' L' + CX + ' ' + (CY - R) + ' A' + R + ' ' + R + ' 0 ' + big + ' 1 ' + a.x.toFixed(1) + ' ' + a.y.toFixed(1) + ' Z" fill="#f5c26b" stroke="var(--ink)" stroke-width="2"/>'; }
      s += K.line(CX - R, CY, CX + R, CY, { w: 1, stroke: '#5a6478', dash: '4 3' }) + K.line(CX, CY, CX + R, CY, { w: 2.4, stroke: 'var(--bad)' }) + K.circle(CX, CY, 3, { fill: 'var(--ink)' }) + K.text(CX + R / 2, CY - 8, 'r = ' + f2(m.r), { size: 12, weight: 700, fill: 'var(--bad)' });
      lines.push(['直径 = 2 × ' + f2(m.r) + ' = ' + f2(Q.mul(Q(2), m.r)), 'var(--ink)']);
      lines.push(['周长 = 2 × 3.14 × ' + f2(m.r) + ' = ' + f2(m.c), 'var(--ink)']);
      lines.push(['面积 = 3.14 × ' + f2(m.r) + ' × ' + f2(m.r) + ' = ' + f2(m.area), 'var(--blue)']);
      if (m.mode === 1) { lines.push(['扇形占 ' + m.th + ' ÷ 360 = ' + U.Q.show(m.frac), '#8a4a12']); lines.push(['扇形面积 = ' + f2(m.area) + ' × ' + U.Q.show(m.frac) + ' = ' + f2(m.sector), '#8a4a12']); lines.push(['弧长 = ' + f2(m.c) + ' × ' + U.Q.show(m.frac) + ' = ' + f2(m.arc) + '（弧长不是面积）', '#5a6478']); }
    } else if (m.mode === 2) {
      const ry = R * 0.3, H = m.h * UN, by = CY + 110, ty = by - H;
      s += '<ellipse cx="' + CX + '" cy="' + by + '" rx="' + R + '" ry="' + ry + '" fill="#cfdcf0" stroke="var(--ink)" stroke-width="2"/>';
      if (m.cone) s += '<polygon points="' + (CX - R) + ',' + by + ' ' + (CX + R) + ',' + by + ' ' + CX + ',' + ty + '" fill="#cfdcf0" fill-opacity="0.7" stroke="var(--ink)" stroke-width="2"/>';
      else s += K.rect(CX - R, ty, 2 * R, H, { fill: '#cfdcf0', stroke: 'none', r: 0 }) + K.line(CX - R, ty, CX - R, by, { w: 2 }) + K.line(CX + R, ty, CX + R, by, { w: 2 }) + '<ellipse cx="' + CX + '" cy="' + ty + '" rx="' + R + '" ry="' + ry + '" fill="#eef3fb" stroke="var(--ink)" stroke-width="2"/>';
      s += K.line(CX, by, CX + R, by, { w: 2.4, stroke: 'var(--bad)' }) + K.line(CX, by, CX, ty, { w: 1.6, stroke: 'var(--blue)', dash: '5 4' }) + K.text(CX - 10, (by + ty) / 2, 'h = ' + m.h, { size: 12, weight: 700, anchor: 'end', fill: 'var(--blue)' });
      s += btn(20, 40, 70, '圆柱', { cone: false }, !m.cone, '换成圆柱') + btn(96, 40, 70, '圆锥', { cone: true }, m.cone, '换成圆锥');
      lines.push(['底面积 = 3.14 × ' + f2(m.r) + ' × ' + f2(m.r) + ' = ' + f2(m.area), 'var(--ink)']);
      lines.push(['圆柱体积 = ' + f2(m.area) + ' × ' + m.h + ' = ' + f2(m.vcyl), m.cone ? '#5a6478' : 'var(--blue)']);
      if (m.cone) lines.push(['圆锥体积 = 圆柱的 1/3 = ' + f2(m.vol), 'var(--blue)']);
    } else if (m.mode === 3) {
      const ly = CY + m.d * UN;
      s += K.circle(CX, CY, R, { fill: '#eef3fb', stroke: 'var(--ink)', w: 2 }) + K.circle(CX, CY, 3, { fill: 'var(--ink)' }) + K.line(CX - 200, ly, CX + 200, ly, { w: 2.6, stroke: 'var(--blue)' }) + K.line(CX, CY, CX, ly, { w: 1.6, stroke: 'var(--bad)', dash: '4 3' }) + K.text(CX + 8, (CY + ly) / 2 + 4, 'd = ' + m.d, { size: 12, weight: 700, anchor: 'start', fill: 'var(--bad)' });
      lines.push(['半径 r = ' + f2(m.r) + '，圆心到直线 d = ' + m.d, 'var(--ink)']);
      lines.push([(m.rel === 0 ? 'd > r：' : m.rel === 1 ? 'd = r：' : 'd < r：') + RT[m.rel] + (m.rel === 1 ? '（只碰到一个点）' : m.rel === 2 ? '（有两个交点）' : '（没有交点）'), 'var(--blue)']);
    } else {
      const a = pol(180 - m.ca / 2, R), b = pol(180 + m.ca / 2, R), pp = pol(0, R);
      s += K.circle(CX, CY, R, { fill: '#eef3fb', stroke: 'var(--ink)', w: 2 }) + K.circle(CX, CY, 3, { fill: 'var(--ink)' });
      s += K.line(CX, CY, a.x, a.y, { w: 2, stroke: 'var(--bad)' }) + K.line(CX, CY, b.x, b.y, { w: 2, stroke: 'var(--bad)' }) + K.line(pp.x, pp.y, a.x, a.y, { w: 2, stroke: 'var(--blue)' }) + K.line(pp.x, pp.y, b.x, b.y, { w: 2, stroke: 'var(--blue)' });
      s += K.text(CX, CY - 10, 'O', { size: 13, weight: 700 }) + K.text(pp.x, pp.y - 10, 'P', { size: 13, weight: 700 }) + K.text(a.x - 12, a.y + 8, 'A', { size: 13, weight: 700 }) + K.text(b.x + 12, b.y + 8, 'B', { size: 13, weight: 700 });
      lines.push(['圆心角 ∠AOB = ' + m.ca + '°', 'var(--bad)']);
      lines.push(['圆周角 ∠APB = ' + m.ca + '° ÷ 2 = ' + m.ins + '°', 'var(--blue)']);
      lines.push(['同一条弧：圆周角是圆心角的一半', '#5a6478']);
    }
    s += '<g data-lines="1">' + lines.map(([t, col], i) => K.text(TX, 80 + i * 26, t, { size: 13, weight: 700, anchor: 'start', fill: col })).join('') + '</g>';
    return s;
  }
  function grips(c) {
    const m = model(c.props), UN = unOf(c, m), R = m.rn * UN, out = [];
    const say = (c1) => 'r = ' + f2(model(c1.props).r);
    const snap = (v, g) => Math.round(v / g) * g;
    // 半径的把手：圆和扇形可以是半格（0.5），直线与圆用整数；数大了按 m0.st 取整
    if (m.mode === 0 || m.mode === 1 || m.mode === 3) out.push({ id: 'r', x: CX + R, y: CY, r: 9, cursor: 'ew-resize', tip: '拖我：改半径', drag: (c0, q) => { const m0 = model(c0.props), x = Math.abs(q.x - CX) / m0.UN, g = m0.st(m0.mode !== 3); return { r: clamp(snap(x, g), g < 1 ? 0.5 : 1, RMAX) }; }, say });
    if (m.mode === 1) { const a = pol(m.th, R); out.push({ id: 'th', x: a.x, y: a.y, r: 9, cursor: 'grab', tip: '拖我：改圆心角', drag: (c0, q) => { let d = Math.atan2(q.x - CX, -(q.y - CY)) * 180 / Math.PI; if (d <= 0) d += 360; return { theta: clamp(Math.round(d / 10) * 10, 10, 360) }; }, say: (c1) => model(c1.props).th + '°' }); }
    if (m.mode === 2) { const by = CY + 110; out.push({ id: 'r', x: CX + R, y: by, r: 9, cursor: 'ew-resize', tip: '拖我：改底面半径', drag: (c0, q) => { const m0 = model(c0.props), g = m0.st(false); return { r: clamp(snap(Math.abs(q.x - CX) / m0.UN, g), 1, RMAX) }; }, say }, { id: 'h', x: CX, y: by - m.h * UN, r: 9, cursor: 'ns-resize', tip: '拖我：改高', drag: (c0, q) => { const m0 = model(c0.props), g = m0.st(false); return { h: clamp(snap((by - q.y) / m0.UN, g), 1, RMAX) }; }, say: (c1) => 'h = ' + model(c1.props).h }); }
    if (m.mode === 3) out.push({ id: 'd', x: CX + 200, y: CY + m.d * UN, r: 9, shape: 'bar-h', cursor: 'ns-resize', tip: '拖我：直线上下移动', drag: (c0, q) => { const m0 = model(c0.props), g = m0.st(false); return { d: clamp(snap((q.y - CY) / m0.UN, g), 0, RMAX) }; }, say: (c1) => { const m1 = model(c1.props); return 'd = ' + m1.d + '：' + RT[m1.rel]; } });
    if (m.mode === 4) { const b = pol(180 + m.ca / 2, R); out.push({ id: 'ca', x: b.x, y: b.y, r: 9, cursor: 'grab', tip: '拖我：改圆心角', drag: (c0, q) => { let d = Math.atan2(q.x - CX, -(q.y - CY)) * 180 / Math.PI; if (d < 0) d += 360; return { ca: clamp(Math.round(Math.abs(d - 180) * 2 / 10) * 10, 20, 340) }; }, say: (c1) => { const m1 = model(c1.props); return '圆心角 ' + m1.ca + '°，圆周角 ' + m1.ins + '°'; } }); }
    return out;
  }
  const I = (lo, hi, d, label, o) => Object.assign({ type: 'int', label, default: d, min: lo, max: hi, write: true }, o || {});
  U.registerPack({
    id: 'circlebench', version: 1,
    types: {
      circlebench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E5', 'E6'],
        label: '圆', prefix: '圆', group: '图形', grades: [5, 9],
        alias: ['圆', '半径', '直径', '周长', '面积', '扇形', '弧长', '圆柱', '圆锥', '体积', '直线与圆', '相切', '圆周角', '圆心角'],
        props: {
          mode: { type: 'choice', label: '看什么', default: 0, choices: MODES, write: true },
          r: { type: 'num', label: '半径', default: 3, min: 0.5, max: RMAX, step: 0.5, write: true, qmax: 10 },
          theta: I(10, 360, 90, '扇形：圆心角（度）'), h: I(1, RMAX, 3, '圆柱圆锥：高', { qmax: 10 }), cone: { type: 'bool', label: '是圆锥', default: false, write: true },
          d: I(0, RMAX, 1, '直线与圆：圆心到直线的距离', { qmax: 10 }), ca: I(20, 340, 100, '圆周角：圆心角（度）'),
        },
        outputs: {
          area: { dim: null, kind: 'num', label: '圆的面积（π 取 3.14）' }, c: { dim: null, kind: 'num', label: '周长' }, sector: { dim: null, kind: 'num', label: '扇形面积' }, arc: { dim: null, kind: 'num', label: '弧长' },
          vol: { dim: null, kind: 'num', label: '圆柱或圆锥的体积' }, rel: { dim: null, kind: 'num', label: '直线与圆：0 相离，1 相切，2 相交' }, ins: { dim: null, kind: 'num', label: '圆周角（度）' }, r: { dim: null, kind: 'num', label: '半径' },
        },
        icon: () => K.circle(30, 24, 16, { fill: '#eef3fb', stroke: 'var(--ink)', w: 1.6 }) + K.line(30, 24, 46, 24, { w: 2, stroke: '#a12a1f' }) + '<path d="M30 24 L30 8 A16 16 0 0 1 46 24 Z" fill="#f5c26b" fill-opacity="0.8"/>',
        size: () => [W, 440],
        grips,
        compute: (c) => { const m = model(c.props); return { area: qv(m.area), c: qv(m.c), sector: qv(m.sector), arc: qv(m.arc), vol: qv(m.vol), rel: num(m.rel), ins: num(m.ins), r: qv(m.r) }; },
        badge: () => '',
        draw,
      },
    },
  });
  U.CircleBench = { model, rangeOf, RMAX };
})(typeof globalThis !== 'undefined' ? globalThis : window);
