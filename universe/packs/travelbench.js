/* 器材包 travelbench：行程（两个人在一条路上）。一条直路，甲在路的上面走，乙在路的下面走。
 * 全部在图上直接动手：
 *   - 拖时间条：时间往前走，两个人各走各的；走过的路留下一条粗线。
 *   - 拖每个人的箭头尖：箭头的长短就是“一小时走多远”（速度）；拖到出发点的另一边就是掉头。
 *   - 拖出发点的小圆圈：改从哪里出发。
 *   - 上面一直写着：各走了多少（速度 × 时间）、两人相距多少、每过 1 小时近了（或远了）多少。
 *   - 右下角同时画“位置—时间”图：两条直线，交点就是相遇；竖线是现在的时间。
 * 能做的题：速度 × 时间 = 路程、相遇、追及、背向而行、反过来求速度。
 * 这一版的边界（如实写）：只有两个人、一条直路；速度不变；时间、速度、位置都是整数；走到路的尽头就停下。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 690, X0 = 50, X1 = 640, RY = 126, TW = 290, TY = 240, VMAX = 30, LMAX = 400;
  const GB = { x: 400, y: 212, w: 240, h: 120 };
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  function model(p) {
    const L = clamp(p.len, 10, LMAX), tmax = clamp(p.tmax, 1, 24), t = clamp(p.t, 0, tmax), solo = p.solo === true || p.solo === 1;
    const A = { p: clamp(p.pa, 0, L), v: clamp(p.va, 0, VMAX), d: p.da === 1 ? -1 : 1 }, B = { p: clamp(p.pb, 0, L), v: clamp(p.vb, 0, VMAX), d: p.db === 1 ? -1 : 1 };
    const at = (m, tt) => clamp(m.p + m.d * m.v * tt, 0, L);
    A.x = at(A, t); B.x = at(B, t);
    const gap = solo ? 0 : Math.abs(A.x - B.x), gap1 = solo ? 0 : Math.abs(at(A, t + 1) - at(B, t + 1)), gapStart = Math.abs(A.p - B.p), gapOne = Math.abs(at(A, 1) - at(B, 1));
    return { L, tmax, t, solo, A, B, at, gap, rate: gapOne - gapStart, sa: A.v * t, sb: B.v * t, sc: (X1 - X0) / L, gap1 };
  }
  function plan(p0, gid, q) {
    const m = model(p0), px = (v) => X0 + v * m.sc, o = {};
    if (gid === 't') o.t = clamp(Math.round((q.x - X0) / (TW / m.tmax)), 0, m.tmax);
    else if (gid === 'sa' || gid === 'sb') o[gid === 'sa' ? 'pa' : 'pb'] = clamp(Math.round((q.x - X0) / m.sc), 0, m.L);
    else if (gid === 'va' || gid === 'vb') {
      const M = gid === 'va' ? m.A : m.B, dx = (q.x - px(M.p)) / m.sc, k = gid === 'va' ? 'a' : 'b';
      o['v' + k] = clamp(Math.round(Math.abs(dx)), 1, VMAX); if (Math.abs(dx) >= 0.5) o['d' + k] = dx < 0 ? 1 : 0;
    }
    return { patch: o };
  }
  const COL = ['#d9782f', '#3b7cc4'];
  const arrow = (x1, y, x2, col) => { const d = x2 >= x1 ? 1 : -1; return K.line(x1, y, x2, y, { w: 2.5, stroke: col }) + '<path d="M' + x2 + ' ' + y + ' l' + (-8 * d) + ' -5 v10 z" fill="' + col + '"/>'; };

  function draw(c) {
    const p = c.props, m = model(p), na = p.na || '甲', nb = p.nb || '乙', du = p.du || '千米', tu = p.tu || '小时', px = (v) => X0 + v * m.sc, lock = p.lock === true || p.lock === 1;
    let s = '';
    s += K.text(20, 26, na + '走了 ' + m.A.v + ' × ' + m.t + ' = ' + m.sa + ' ' + du + (m.solo ? '' : '　' + nb + '走了 ' + m.B.v + ' × ' + m.t + ' = ' + m.sb + ' ' + du), { size: 14, weight: 700, anchor: 'start' });
    if (!m.solo) {
      const met = m.gap === 0;
      s += K.text(20, 48, '两人相距 ' + m.gap + ' ' + du + (met ? '：碰上了！' : '') + '　' + (m.rate < 0 ? '每过 1 ' + tu + '近 ' + (-m.rate) + ' ' + du : m.rate > 0 ? '每过 1 ' + tu + '远 ' + m.rate + ' ' + du : '距离不变'), { size: 14, weight: 700, anchor: 'start', fill: met ? 'var(--good)' : 'var(--ink)' });
    } else s += K.text(20, 48, '速度 × 时间 = 路程', { size: 13, anchor: 'start' });
    // 路
    s += K.line(X0, RY, X1, RY, { w: 4 }) + K.text(X0, RY + 64, '0', { size: 11 }) + K.text(X1, RY + 64, String(m.L), { size: 11 });
    const step = m.L <= 60 ? 10 : m.L <= 150 ? 20 : 50; for (let v = step; v < m.L; v += step) s += K.line(px(v), RY - 3, px(v), RY + 3, { w: 1 }) + K.text(px(v), RY + 64, String(v), { size: 10, fill: '#5a6478' });
    [[m.A, na, -1, 0], [m.B, nb, 1, 1]].forEach(([M, name, side, i]) => {
      if (i === 1 && m.solo) return;
      const col = COL[i], y = RY + side * 14, ya = RY + side * 36;
      s += K.line(px(M.p), RY + side * 6, px(M.x), RY + side * 6, { w: 5, stroke: col });
      s += K.circle(px(M.p), y, 5, { fill: '#fff', stroke: col, w: 2 });
      s += K.circle(px(M.x), y, 11, { fill: col, stroke: 'var(--ink)', w: 1.3 }) + K.text(px(M.x), y + 4, name.slice(0, 1), { size: 12, weight: 700, fill: '#fff' });
      const tip = px(M.p) + M.d * Math.max(M.v, 0.001) * m.sc;
      s += arrow(px(M.p), ya, tip, col) + K.text((px(M.p) + tip) / 2, ya + (side < 0 ? -7 : 16), '每' + tu + ' ' + M.v, { size: 11, weight: 700, fill: col });
    });
    // 时间条
    s += K.text(X0, TY - 16, '时间：' + m.t + ' ' + tu, { size: 14, weight: 700, anchor: 'start' }) + K.line(X0, TY, X0 + TW, TY, { w: 3 });
    for (let k = 0; k <= m.tmax; k++) { const x = X0 + k * TW / m.tmax; s += K.line(x, TY - 4, x, TY + 4, { w: 1 }) + (m.tmax <= 12 || k % 2 === 0 ? K.text(x, TY + 18, String(k), { size: 10 }) : ''); }
    s += K.text(X0, TY + 44, '拖时间条让时间往前走。' + (lock ? '' : '拖箭头尖改速度，拖小圆圈改出发点。'), { size: 12, anchor: 'start' });
    // 位置—时间图
    const gx = (k) => GB.x + k * GB.w / m.tmax, gy = (v) => GB.y + GB.h - v * GB.h / m.L;
    s += K.rect(GB.x, GB.y, GB.w, GB.h, { fill: 'none', stroke: '#8a94a8', r: 0, w: 1 }) + K.text(GB.x, GB.y - 6, '位置', { size: 10, anchor: 'start', fill: '#5a6478' }) + K.text(GB.x + GB.w, GB.y + GB.h + 14, '时间', { size: 10, anchor: 'end', fill: '#5a6478' });
    [[m.A, 0], [m.B, 1]].forEach(([M, i]) => {
      if (i === 1 && m.solo) return;
      let d = ''; for (let k = 0; k <= m.tmax; k++) d += (k ? 'L' : 'M') + gx(k).toFixed(1) + ' ' + gy(m.at(M, k)).toFixed(1);
      s += '<path d="' + d + '" fill="none" stroke="' + COL[i] + '" stroke-width="2"/>' + K.circle(gx(m.t), gy(M.x), 4, { fill: COL[i], stroke: '#fff', w: 1 });
    });
    s += K.line(gx(m.t), GB.y, gx(m.t), GB.y + GB.h, { w: 1, dash: '3 3' });
    return s;
  }
  function grips(c) {
    const p = c.props, m = model(p), px = (v) => X0 + v * m.sc, lock = p.lock === true || p.lock === 1, out = [];
    const mk = (id, x, y, o) => out.push(Object.assign({ id, x, y, drag: (c0, q) => plan(c0.props, id, q).patch }, o));
    mk('t', X0 + m.t * TW / m.tmax, TY, { shape: 'bar-v', cursor: 'ew-resize', tip: '拖我：时间往前走', say: (c1) => { const m1 = model(c1.props); return '时间 ' + m1.t + (m1.solo ? '：走了 ' + m1.sa : '：相距 ' + m1.gap); } });
    if (!lock) [[m.A, 'a', -1], [m.B, 'b', 1]].forEach(([M, k, side]) => {
      if (k === 'b' && m.solo) return;
      mk('v' + k, px(M.p) + M.d * M.v * m.sc, RY + side * 36, { r: 8, cursor: 'ew-resize', tip: '拖我：箭头多长，一小时就走多远', say: (c1) => '每小时 ' + c1.props['v' + k] });
      mk('s' + k, px(M.p), RY + side * 14, { r: 7, ghost: true, cursor: 'ew-resize', tip: '拖我：改出发点', say: (c1) => '从 ' + c1.props['p' + k] + ' 出发' });
    });
    return out;
  }
  const I = (lo, hi, d, label, o) => Object.assign({ type: 'int', label, default: d, min: lo, max: hi, write: true }, o || {});
  const T = (d, label, o) => Object.assign({ type: 'text', label, default: d, write: true }, o || {});
  const DIR = (label, d) => ({ type: 'choice', label, default: d, choices: ['往右', '往左'], write: true });
  U.registerPack({
    id: 'travelbench', version: 1,
    types: {
      travelbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E4', 'E7'],
        label: '行程（相遇与追及）', prefix: '行程', group: '时间与变化', grades: [3, 8],
        alias: ['行程', '相遇', '追及', '速度', '路程', '时间', '相向', '背向', '同向'],
        props: {
          len: I(10, LMAX, 90, '路有多长'), t: I(0, 24, 0, '现在的时间'), tmax: I(1, 24, 10, '时间条最多到几'),
          pa: I(0, LMAX, 0, '甲从哪里出发'), va: I(0, VMAX, 10, '甲的速度'), da: DIR('甲往哪边走', 0),
          pb: I(0, LMAX, 90, '乙从哪里出发'), vb: I(0, VMAX, 5, '乙的速度'), db: DIR('乙往哪边走', 1),
          na: T('甲', '甲叫什么'), nb: T('乙', '乙叫什么'), du: T('千米', '路程的单位'), tu: T('小时', '时间的单位'),
          solo: { type: 'bool', label: '只有甲一个人', default: false, write: true },
          lock: { type: 'bool', label: '速度和出发点已经给好（只能拖时间）', default: false, write: true },
        },
        outputs: {
          t: { dim: null, kind: 'num', label: '时间' }, gap: { dim: null, kind: 'num', label: '两人相距多少' }, sa: { dim: null, kind: 'num', label: '甲走了多少' }, sb: { dim: null, kind: 'num', label: '乙走了多少' },
          xa: { dim: null, kind: 'num', label: '甲现在的位置' }, xb: { dim: null, kind: 'num', label: '乙现在的位置' }, va: { dim: null, kind: 'num', label: '甲的速度' }, vb: { dim: null, kind: 'num', label: '乙的速度' },
          near: { dim: null, kind: 'num', label: '每过 1 个时间单位近多少（远了是负数）' },
        },
        icon: () => K.line(8, 26, 56, 26, { w: 2.5 }) + K.circle(18, 18, 6, { fill: COL[0], stroke: 'var(--ink)', w: 1 }) + K.circle(46, 34, 6, { fill: COL[1], stroke: 'var(--ink)', w: 1 }) + K.line(26, 18, 36, 18, { w: 1.5, stroke: COL[0] }) + K.line(38, 34, 28, 34, { w: 1.5, stroke: COL[1] }),
        size: () => [W, 384],
        grips,
        compute: (c) => { const m = model(c.props); return { t: num(m.t), gap: num(m.gap), sa: num(m.sa), sb: num(m.sb), xa: num(m.A.x), xb: num(m.B.x), va: num(m.A.v), vb: num(m.B.v), near: num(-m.rate) }; },
        badge: () => '',
        draw,
      },
    },
  });
  U.TravelBench = { model, plan };
})(typeof globalThis !== 'undefined' ? globalThis : window);
