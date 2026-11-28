/* 器材包 gridbench：坐标与变换。方格纸上的点和三角形：用数对说位置、绕一个点旋转、平移和放大、比一比全等与相似。
 *   - 数对：拖点 P，旁边写着它在第几列、第几行，数对 (列, 行)。先写列，再写行。
 *   - 旋转：拖点 P 和旋转中心 O；点“逆时针 90°”“180°”“顺时针 90°”，画出转过去的点 P′ 和转过的圆弧。
 *   - 三角形：拖三角形甲的三个顶点；点“平移”后拖箭头尖决定往哪移、移多少；点“放大 2 倍 / 缩小一半”以原点为中心放大；
 *     点“自己摆乙”可以拖乙的三个顶点。点“比一比”：写出三条边各是多少、对应边的比，判断全等、相似、相似比。
 * 这一版的边界（如实写）：坐标都是 −6 到 6 的整数；旋转只有 90° 的倍数；边长用平方比较（不开方），相似比只在边长成整数或简单分数比时写出来。
 * 大数（2026-11-28，试验台增强 7 第二轮）：方格纸下面点“一格 = 1 / 2 / 5 / 10”换单位（属性 gu），方格纸还是 12 × 12 格、每格 25 像素，
 *   坐标能到 ±12、±30、±60（比如放大 2 倍以后的三角形、地图上的数对）。拖点都落在格点上（一格 = 5 时只落在 5 的倍数上）；平移的箭头尖也一样。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null }), qv = (q) => U.val('num', q, { dim: null });
  const W = 700, N = 6, CELL = 25, OX = 190, OY = 200, RX = 380;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? +v : lo));
  // 一格是几（属性 gu 是下标）：UU 是正在画（或正在拖）的那张卡片的一格；SX、SY 把坐标换成像素，gx、gy 反过来并落到格点上
  const UNITS = [1, 2, 5, 10], unitOf = (p) => UNITS[clamp(Math.round(+p.gu) || 0, 0, 3)];
  let UU = 1;
  const SX = (x) => OX + x * CELL / UU, SY = (y) => OY - y * CELL / UU, gx = (q) => clamp(Math.round((q.x - OX) / CELL) * UU, -N * UU, N * UU), gy = (q) => clamp(Math.round((OY - q.y) / CELL) * UU, -N * UU, N * UU);
  const MODES = ['数对', '旋转', '三角形'];
  const rot = (x, y, cx, cy, deg) => { const dx = x - cx, dy = y - cy; return deg === 90 ? [cx - dy, cy + dx] : deg === 180 ? [cx - dx, cy - dy] : deg === 270 ? [cx + dy, cy - dx] : [x, y]; };
  const d2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
  // 两个三角形：三边平方从小到大排，比一比
  function compare(A, B) {
    const sa = [d2(A[0], A[1]), d2(A[1], A[2]), d2(A[2], A[0])].sort((x, y) => x - y), sb = [d2(B[0], B[1]), d2(B[1], B[2]), d2(B[2], B[0])].sort((x, y) => x - y);
    if (sa.some((v) => v === 0) || sb.some((v) => v === 0)) return null;
    const r = Q(sb[0], sa[0]), sim = Q.eq(Q(sb[1], sa[1]), r) && Q.eq(Q(sb[2], sa[2]), r), cong = sim && Q.eq(r, Q(1));
    let k = null; if (sim) { const n = Number(r.n), d = Number(r.d), rn = Math.round(Math.sqrt(n)), rd = Math.round(Math.sqrt(d)); if (rn * rn === n && rd * rd === d) k = Q(rn, rd); }
    return { sa, sb, sim, cong, k };
  }
  function model(p) {
    const u = unitOf(p), NN = N * u;
    const mode = clamp(p.mode, 0, 2), P = [clamp(p.px, -NN, NN), clamp(p.py, -NN, NN)], O = [clamp(p.ox, -NN, NN), clamp(p.oy, -NN, NN)], deg = [0, 90, 180, 270].includes(+p.rot) ? +p.rot : 0;
    const A = [[clamp(p.ax, -NN, NN), clamp(p.ay, -NN, NN)], [clamp(p.bx, -NN, NN), clamp(p.by, -NN, NN)], [clamp(p.cx, -NN, NN), clamp(p.cy, -NN, NN)]];
    const tm = clamp(p.tm, 0, 3), dx = clamp(p.dx, -2 * NN, 2 * NN), dy = clamp(p.dy, -2 * NN, 2 * NN), kk = [1, 2, 3, 0.5].includes(+p.k) ? +p.k : 2;
    let B = null;
    if (tm === 1) B = A.map(([x, y]) => [x + dx, y + dy]);
    else if (tm === 2) B = A.map(([x, y]) => [x * kk, y * kk]);
    else if (tm === 3) B = [[clamp(p.qx1, -NN, NN), clamp(p.qy1, -NN, NN)], [clamp(p.qx2, -NN, NN), clamp(p.qy2, -NN, NN)], [clamp(p.qx3, -NN, NN), clamp(p.qy3, -NN, NN)]];
    const P2 = deg ? rot(P[0], P[1], O[0], O[1], deg) : null;
    return { mode, u, NN, P, O, deg, P2, A, B, tm, dx, dy, k: kk, cmp: B ? compare(A, B) : null };
  }
  const btn = (x, y, w, label, patch, active, tip) => '<g data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 26, { fill: active ? 'var(--blue)' : '#fff', stroke: 'var(--blue)', r: 8, w: 1.5 }) + K.text(x + w / 2, y + 17, label, { size: 12, weight: 700, fill: active ? '#fff' : 'var(--ink)' }) + '</g>';
  const poly = (T, fill, stroke, attr) => '<polygon' + (attr || '') + ' points="' + T.map(([x, y]) => SX(x) + ',' + SY(y)).join(' ') + '" fill="' + fill + '" fill-opacity="0.5" stroke="' + stroke + '" stroke-width="2"/>';
  const sq = (v) => (Number.isInteger(Math.sqrt(v)) ? String(Math.sqrt(v)) : '√' + v);

  function draw(c) {
    const p = c.props, m = model(p), on = (v) => v === true || v === 1, NN = m.NN; UU = m.u; let s = '';
    // 方格纸（12 × 12 格，每两格写一个数：数是 格数 × 一格）
    for (let j = -N; j <= N; j++) { const i = j * m.u; s += K.line(SX(i), SY(-NN), SX(i), SY(NN), { w: i ? 0.6 : 1.6, stroke: i ? '#d5dbe6' : 'var(--ink)' }) + K.line(SX(-NN), SY(i), SX(NN), SY(i), { w: i ? 0.6 : 1.6, stroke: i ? '#d5dbe6' : 'var(--ink)' }); if (j && j % 2 === 0) s += K.text(SX(i), SY(0) + 14, String(i), { size: 9, fill: '#5a6478' }) + K.text(SX(0) - 6, SY(i) + 3, String(i), { size: 9, anchor: 'end', fill: '#5a6478' }); }
    // 方格纸下面：一格 = 1 / 2 / 5 / 10
    { const y = SY(-NN) + 14, cur = clamp(Math.round(+p.gu) || 0, 0, 3); s += K.text(SX(-NN), y + 15, '一格 =', { size: 12, anchor: 'start', weight: 700 });
      // 换单位时坐标跟着放大（缩小）：图不动，数变了（3 → 一格 = 5 时是 15）
      const scaled = (u) => { const o = { gu: UNITS.indexOf(u) }; for (const k of ['px', 'py', 'ox', 'oy', 'ax', 'ay', 'bx', 'by', 'cx', 'cy', 'qx1', 'qy1', 'qx2', 'qy2', 'qx3', 'qy3', 'dx', 'dy']) if (p[k] !== undefined) { const lim = (k === 'dx' || k === 'dy' ? 2 : 1) * N * u; o[k] = clamp(Math.round(+p[k] / m.u * u), -lim, lim); } return o; };
      UNITS.forEach((u, i) => { const x = SX(-NN) + 50 + i * 34; s += '<g data-pick-set="' + encodeURIComponent(JSON.stringify(scaled(u))) + '" data-gu="' + i + '" style="cursor:pointer"><title>方格纸一格是 ' + u + '</title>' + K.rect(x, y, 28, 22, { fill: i === cur ? 'var(--blue)' : '#fff', stroke: '#8a94a8', r: 6 }) + K.text(x + 14, y + 16, String(u), { size: 13, weight: 700, fill: i === cur ? '#fff' : 'var(--ink)' }) + '</g>'; });
      if (m.u > 1) s += K.big.unitNote(SX(NN), y + 15, '一格 = ' + m.u); }
    if (m.mode === 0) {
      s += K.text(SX(NN) + 6, SY(0) + 4, '列', { size: 11, anchor: 'start', weight: 700 }) + K.text(SX(0), SY(NN) - 6, '行', { size: 11, weight: 700 });
      s += K.line(SX(m.P[0]), SY(0), SX(m.P[0]), SY(m.P[1]), { w: 1.4, stroke: 'var(--blue)', dash: '4 3' }) + K.line(SX(0), SY(m.P[1]), SX(m.P[0]), SY(m.P[1]), { w: 1.4, stroke: '#c0392b', dash: '4 3' }) + K.circle(SX(m.P[0]), SY(m.P[1]), 6, { fill: '#f5a25d', stroke: 'var(--ink)', w: 1.4 });
      s += K.text(20, 26, '点 P：第 ' + m.P[0] + ' 列、第 ' + m.P[1] + ' 行', { size: 16, weight: 700, anchor: 'start' });
      s += '<g data-pair="1">' + K.text(RX, 90, '数对 (' + m.P[0] + ', ' + m.P[1] + ')', { size: 22, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + '</g>' + K.text(RX, 118, '先写列（左右），再写行（上下）', { size: 12, anchor: 'start', fill: '#5a6478' });
    } else if (m.mode === 1) {
      s += K.circle(SX(m.O[0]), SY(m.O[1]), 6, { fill: 'var(--ink)' }) + K.text(SX(m.O[0]) - 10, SY(m.O[1]) - 8, 'O', { size: 12, weight: 700 }) + K.circle(SX(m.P[0]), SY(m.P[1]), 6, { fill: '#f5a25d', stroke: 'var(--ink)', w: 1.4 }) + K.text(SX(m.P[0]) + 10, SY(m.P[1]) - 8, 'P', { size: 12, weight: 700 });
      if (m.P2) { const r = Math.sqrt(d2(m.P, m.O)) * CELL / m.u, a0 = Math.atan2(-(m.P[1] - m.O[1]), m.P[0] - m.O[0]); let d = ''; for (let i = 0; i <= 24; i++) { const a = a0 - (m.deg * Math.PI / 180) * i / 24; d += (i ? 'L' : 'M') + (SX(m.O[0]) + r * Math.cos(a)).toFixed(1) + ' ' + (SY(m.O[1]) + r * Math.sin(a)).toFixed(1); }
        s += '<path d="' + d + '" fill="none" stroke="var(--blue)" stroke-width="1.6" stroke-dasharray="4 3"/>' + K.line(SX(m.O[0]), SY(m.O[1]), SX(m.P[0]), SY(m.P[1]), { w: 1.2, stroke: '#5a6478' }) + K.line(SX(m.O[0]), SY(m.O[1]), SX(m.P2[0]), SY(m.P2[1]), { w: 1.2, stroke: '#5a6478' }) + '<g data-image="1">' + K.circle(SX(m.P2[0]), SY(m.P2[1]), 6, { fill: 'var(--blue)', stroke: 'var(--ink)', w: 1.4 }) + K.text(SX(m.P2[0]) + 10, SY(m.P2[1]) - 8, 'P′', { size: 12, weight: 700, fill: 'var(--blue)' }) + '</g>'; }
      s += K.text(20, 26, 'P (' + m.P.join(', ') + ') 绕 O (' + m.O.join(', ') + ') 转', { size: 16, weight: 700, anchor: 'start' });
      s += btn(RX, 60, 104, '逆时针 90°', { rot: 90 }, m.deg === 90, '逆时针转 90°') + btn(RX + 110, 60, 64, '180°', { rot: 180 }, m.deg === 180, '转半圈') + btn(RX + 180, 60, 104, '顺时针 90°', { rot: 270 }, m.deg === 270, '顺时针转 90°');
      if (m.P2) s += K.text(RX, 120, 'P′ = (' + m.P2.join(', ') + ')', { size: 20, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + K.text(RX, 146, 'OP 和 OP′ 一样长，夹角 ' + (m.deg === 270 ? 90 : m.deg) + '°', { size: 12, anchor: 'start', fill: '#5a6478' });
      else s += K.text(RX, 120, '点一个按钮转一转', { size: 12, anchor: 'start', fill: '#5a6478' });
    } else {
      s += poly(m.A, '#f5c26b', '#8a4a12') + m.A.map(([x, y], i) => K.text(SX(x), SY(y) - 9, 'ABC'[i], { size: 11, weight: 700, fill: '#8a4a12' })).join('');
      if (m.B) s += poly(m.B, '#9fb7d9', '#2f4a73', ' data-imgtri="1"');
      if (m.tm === 1) s += K.line(SX(0), SY(0), SX(m.dx), SY(m.dy), { w: 2, stroke: 'var(--blue)' }) + K.circle(SX(m.dx), SY(m.dy), 4, { fill: 'var(--blue)' });
      s += K.text(20, 26, '三角形：甲（橙）' + (m.B ? '，乙（蓝）' : ''), { size: 16, weight: 700, anchor: 'start' });
      s += btn(RX, 40, 64, '平移', { tm: 1 }, m.tm === 1, '乙是甲平移过去的：拖原点的箭头尖') + btn(RX + 70, 40, 84, '放大 2 倍', { tm: 2, k: 2 }, m.tm === 2 && m.k === 2, '以原点为中心放大 2 倍') + btn(RX + 160, 40, 80, '缩小一半', { tm: 2, k: 0.5 }, m.tm === 2 && m.k === 0.5, '以原点为中心缩小一半') + btn(RX + 246, 40, 70, '自己摆乙', { tm: 3 }, m.tm === 3, '拖乙的三个顶点');
      s += btn(RX, 74, 80, on(p.cmp) ? '收起' : '比一比', { cmp: !on(p.cmp) }, on(p.cmp), '比较两个三角形的三条边');
      if (on(p.cmp) && m.cmp) {
        const C = m.cmp, L = [];
        L.push(['甲的三边：' + C.sa.map(sq).join('、'), '#8a4a12']); L.push(['乙的三边：' + C.sb.map(sq).join('、'), '#2f4a73']);
        L.push([C.cong ? '三边分别相等：全等' : C.sim ? '三边成同一个比例：相似，不全等' : '三边不成比例：不相似', C.sim ? 'var(--good)' : 'var(--bad)']);
        if (C.sim && C.k) L.push(['相似比（乙 : 甲）= ' + U.Q.show(C.k), 'var(--blue)']);
        s += '<g data-cmp="1">' + L.map(([t, col], i) => K.text(RX, 130 + i * 24, t, { size: 13, weight: 700, anchor: 'start', fill: col })).join('') + '</g>';
      } else if (on(p.cmp)) s += K.text(RX, 130, '先让乙出来（平移、放大或自己摆）', { size: 12, anchor: 'start', fill: '#5a6478' });
    }
    return s;
  }
  function grips(c) {
    const m = model(c.props); UU = m.u;
    // 拖的时候按按下那一刻的一格换算（UU 可能被别的卡片改过）
    const out = [], pt = (id, x, y, patch, tip, ghost) => out.push({ id, x: SX(x), y: SY(y), r: 9, ghost, cursor: 'grab', tip, drag: (c0, q) => { UU = model(c0.props).u; return patch(gx(q), gy(q)); }, say: (c1, q) => '' });
    if (m.mode === 0) pt('P', m.P[0], m.P[1], (x, y) => ({ px: x, py: y }), '拖我：换一个位置', true);
    else if (m.mode === 1) { pt('P', m.P[0], m.P[1], (x, y) => ({ px: x, py: y }), '拖我：换一个点', true); pt('O', m.O[0], m.O[1], (x, y) => ({ ox: x, oy: y }), '拖我：换旋转中心', true); }
    else {
      ['a', 'b', 'c'].forEach((k, i) => pt(k, m.A[i][0], m.A[i][1], (x, y) => ({ [k + 'x']: x, [k + 'y']: y }), '拖我：改甲的顶点', true));
      if (m.tm === 1) pt('t', m.dx, m.dy, (x, y) => ({ dx: x, dy: y }), '拖我：平移多少', false);
      if (m.tm === 3) [1, 2, 3].forEach((i) => pt('q' + i, m.B[i - 1][0], m.B[i - 1][1], (x, y) => ({ ['qx' + i]: x, ['qy' + i]: y }), '拖我：改乙的顶点', true));
    }
    return out;
  }
  const I = (lo, hi, d, label, o) => Object.assign({ type: 'int', label, default: d, min: lo, max: hi, write: true }, o || {});
  const NM = N * UNITS[UNITS.length - 1], QN = { qmin: -N, qmax: N };   // 一格 = 10 时到 ±60；随机出题只试 ±6（和以前一样）
  U.registerPack({
    id: 'gridbench', version: 1,
    types: {
      gridbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E5', 'E2'],
        label: '坐标与变换', prefix: '方格', group: '图形', grades: [5, 9],
        alias: ['数对', '位置', '坐标', '旋转', '绕点旋转', '中心对称', '平移', '位似', '放大', '全等', '相似', '相似比'],
        props: {
          mode: { type: 'choice', label: '看什么', default: 0, choices: MODES, write: true },
          gu: { type: 'choice', label: '方格纸一格是几', default: 0, choices: UNITS.map(String), write: true },
          px: I(-NM, NM, 1, '点 P 的列', QN), py: I(-NM, NM, 1, '点 P 的行', QN), ox: I(-NM, NM, 0, '旋转中心 O 的 x', QN), oy: I(-NM, NM, 0, '旋转中心 O 的 y', QN), rot: I(0, 270, 0, '转了几度（0、90、180、270）'),
          ax: I(-NM, NM, 0, '甲 A 的 x', QN), ay: I(-NM, NM, 0, '甲 A 的 y', QN), bx: I(-NM, NM, 4, '甲 B 的 x', QN), by: I(-NM, NM, 0, '甲 B 的 y', QN), cx: I(-NM, NM, 0, '甲 C 的 x', QN), cy: I(-NM, NM, 3, '甲 C 的 y', QN),
          tm: I(0, 3, 0, '乙怎么来（0 没有，1 平移，2 放大，3 自己摆）'), dx: I(-2 * NM, 2 * NM, 0, '平移：右几', { qmin: -12, qmax: 12 }), dy: I(-2 * NM, 2 * NM, 0, '平移：上几', { qmin: -12, qmax: 12 }), k: { type: 'num', label: '放大几倍', default: 2, min: 0.5, max: 3, step: 0.5, write: true },
          qx1: I(-NM, NM, 0, '乙 1 的 x', QN), qy1: I(-NM, NM, 0, '乙 1 的 y', QN), qx2: I(-NM, NM, 4, '乙 2 的 x', QN), qy2: I(-NM, NM, 0, '乙 2 的 y', QN), qx3: I(-NM, NM, 0, '乙 3 的 x', QN), qy3: I(-NM, NM, 3, '乙 3 的 y', QN),
          cmp: { type: 'bool', label: '比一比（全等、相似）', default: false, write: true },
        },
        outputs: {
          px: { dim: null, kind: 'num', label: '点 P 的列' }, py: { dim: null, kind: 'num', label: '点 P 的行' }, qx: { dim: null, kind: 'num', label: '转过去的点的 x（转了才有）' }, qy: { dim: null, kind: 'num', label: '转过去的点的 y（转了才有）' },
          cong: { dim: null, kind: 'num', label: '全等：1 是，0 否（比一比才有）' }, sim: { dim: null, kind: 'num', label: '相似：1 是，0 否（比一比才有）' }, k: { dim: null, kind: 'num', label: '相似比（比一比、相似才有）' },
        },
        icon: () => K.line(8, 40, 56, 40, { w: 1.4 }) + K.line(12, 44, 12, 6, { w: 1.4 }) + K.circle(36, 18, 4, { fill: '#f5a25d', stroke: 'var(--ink)', w: 1 }) + '<path d="M36 18 A16 16 0 0 0 20 26" fill="none" stroke="var(--blue)" stroke-width="1.4" stroke-dasharray="3 2"/>',
        size: () => [W, 424],   // 2026-11-28：下面多一行“一格 = 1 / 2 / 5 / 10”
        grips,
        compute: (c) => {
          const m = model(c.props), o = { px: num(m.P[0]), py: num(m.P[1]) };
          if (m.P2 && m.mode === 1) { o.qx = num(m.P2[0]); o.qy = num(m.P2[1]); }
          if (m.mode === 2 && (c.props.cmp === true || c.props.cmp === 1) && m.cmp) { o.cong = num(m.cmp.cong ? 1 : 0); o.sim = num(m.cmp.sim ? 1 : 0); if (m.cmp.k) o.k = qv(m.cmp.k); }
          return o;
        },
        badge: () => '',
        draw,
      },
    },
  });
  U.GridBench = { model, compare, rot, UNITS };
})(typeof globalThis !== 'undefined' ? globalThis : window);
