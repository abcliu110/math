/* 器材包 anglebench：量角器与角。
 *   - 量角：一个角画好了，量角器斜放着。拖量角器边上的圆点转它，让量角器的 0° 线和角的一条边重合，才读得出度数；
 *     重合的是哪条边，就从那边的 0 开始读（外圈还是内圈都写出来，标出该读的那一圈）。读出来以后说是锐角、直角、钝角还是平角。
 *   - 一条直线上的两个角：直线上一个点，拖中间那条射线；点一个角就量出它。两个都量了，写出“合起来是 180°，是平角”。
 *   - 对顶角：两条直线相交成 4 个角，拖其中一条转；点角量出来。量了相对的两个，写出“对顶角相等”；量了相邻的两个，写出“邻补角合起来 180°”。
 *   - 多边形内角和：点 + − 改边数，点“从一个顶点连对角线”，切成几个三角形，每个 180°，合起来就是内角和；正多边形每个角也写出来。
 * 这一版的边界（如实写）：角度按 5° 一格吸附；量角器只能转，不能平移（顶点已经对好）。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 700, R = 140, RAY = 170;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? Math.round(+v) : lo));
  const MODES = ['量角', '一条直线上的两个角', '对顶角', '多边形内角和'];
  const norm = (d) => ((d % 360) + 360) % 360;
  const rad = (d) => d * Math.PI / 180;
  const P = (V, d, r) => [V[0] + r * Math.cos(rad(d)), V[1] - r * Math.sin(rad(d))];
  const KIND = ['锐角', '直角', '钝角', '平角'];
  const kindOf = (d) => (d < 90 ? 0 : d === 90 ? 1 : d < 180 ? 2 : 3);
  const list = (t) => [...new Set(String(t || '').split(',').filter((x) => x !== '').map(Number))];
  function model(p) {
    const mode = clamp(p.mode, 0, 3), a1 = norm(clamp(p.a1, -360, 360)), a2 = norm(clamp(p.a2, -360, 360)), prot = norm(clamp(p.prot, -360, 360)), a = clamp(p.a, 5, 175), n = clamp(p.n, 3, 12), split = !!p.split, seen = list(p.seen);
    const ang = norm(a2 - a1) <= 180 ? norm(a2 - a1) : norm(a1 - a2);
    const lo = norm(a2 - a1) <= 180 ? a1 : a2, hi = lo === a1 ? a2 : a1;   // 从 lo 逆时针转 ang 到 hi
    const onLo = prot === lo, onHi = norm(prot + 180) === hi;           // 0° 线压在 lo 上（读外圈），或者 180° 那头压在 hi 上（读内圈）
    const aligned = onLo || onHi;
    return { mode, a1, a2, prot, ang, lo, hi, onLo, onHi, aligned, a, n, split, seen };
  }
  const btn = (x, y, w, label, patch, enabled, tip) => '<g' + (enabled ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' data-off="1"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 26, { fill: enabled ? '#fff' : '#f1f3f6', stroke: enabled ? 'var(--blue)' : '#b8c0cc', r: 7, w: 1.4 }) + K.text(x + w / 2, y + 17, label, { size: 12, weight: 700, fill: enabled ? 'var(--ink)' : '#5f6773' }) + '</g>';
  const arc = (V, r, d0, d1) => { const [x0, y0] = P(V, d0, r), [x1, y1] = P(V, d1, r), big = norm(d1 - d0) > 180 ? 1 : 0; return 'M' + x0.toFixed(1) + ' ' + y0.toFixed(1) + ' A' + r + ' ' + r + ' 0 ' + big + ' 0 ' + x1.toFixed(1) + ' ' + y1.toFixed(1); };
  const ray = (V, d, col) => { const [x, y] = P(V, d, RAY); return K.line(V[0], V[1], x, y, { stroke: col || 'var(--ink)', w: 2.6 }); };
  // 点一个角（扇形）就量出它
  function wedge(V, d0, d1, idx, seen, label, col) {
    const on = seen.includes(idx), mid = d0 + norm(d1 - d0) / 2, [tx, ty] = P(V, mid, 62), r = 46;
    const path = 'M' + V[0] + ' ' + V[1] + ' L' + P(V, d0, r).map((v) => v.toFixed(1)).join(' ') + ' A' + r + ' ' + r + ' 0 0 0 ' + P(V, d1, r).map((v) => v.toFixed(1)).join(' ') + ' Z';
    const body = '<path d="' + path + '" fill="' + (on ? col : 'rgba(120,140,170,0.12)') + '" stroke="' + (on ? 'var(--ink)' : '#a8b2c4') + '" stroke-width="1"/>' + K.text(tx, ty + 4, on ? label : '∠' + idx, { size: on ? 13 : 12, weight: 700, fill: on ? 'var(--ink)' : '#5a6478' });
    return on ? body : '<g data-pick-set="' + encodeURIComponent(JSON.stringify({ seen: seen.concat([idx]).join(',') })) + '" style="cursor:pointer"><title>量 ∠' + idx + '</title>' + body + '</g>';
  }
  function protractor(V, rot, m) {
    let s = '<path d="M' + P(V, rot, R).map((v) => v.toFixed(1)).join(' ') + ' ' + arc(V, R, rot, rot + 180).replace(/^M[^A]*/, '') + ' Z" fill="rgba(255,248,214,0.75)" stroke="#8a6d1a" stroke-width="1.6"/>';
    for (let d = 0; d <= 180; d += 10) { const [x0, y0] = P(V, rot + d, R), [x1, y1] = P(V, rot + d, R - (d % 30 === 0 ? 14 : 8)); s += K.line(x0, y0, x1, y1, { stroke: '#8a6d1a', w: 1 }); }
    for (let d = 0; d <= 180; d += 30) {
      const [ox, oy] = P(V, rot + d, R - 24), [ix, iy] = P(V, rot + d, R - 44);
      s += K.text(ox, oy + 4, String(d), { size: 10, weight: 700, fill: m.onLo ? '#1d4fa3' : '#5a4a10' }) + K.text(ix, iy + 4, String(180 - d), { size: 9, fill: m.onHi ? '#1d4fa3' : '#7a6a30' });
    }
    return s + K.circle(V[0], V[1], 3, { fill: '#8a6d1a' });
  }
  function grips(c) {
    const m = model(c.props), V = vtx(m);
    const dir = (q) => Math.round(norm(Math.atan2(V[1] - q.y, q.x - V[0]) * 180 / Math.PI) / 5) * 5;
    if (m.mode === 0) { const [x, y] = P(V, m.prot + 90, R + 12); return [{ id: 'prot', x, y, r: 10, cursor: 'grab', tip: '拖：转量角器', drag: (c0, q) => ({ prot: norm(dir(q) - 90) }), say: (c1) => { const m1 = model(c1.props); return m1.aligned ? '对好了：' + m1.ang + '°' : '还没对好'; } }]; }
    if (m.mode === 1 || m.mode === 2) { const [x, y] = P(V, m.a, RAY - 10); return [{ id: 'a', x, y, r: 10, cursor: 'grab', tip: '拖：转这条线', drag: (c0, q) => ({ a: clamp(dir(q), 5, 175), seen: '' }), say: (c1) => '∠1 = ' + model(c1.props).a + '°' }]; }
    return [];
  }
  const vtx = (m) => (m.mode === 0 ? [250, 270] : m.mode === 1 ? [300, 260] : [300, 210]);
  function draw(c) {
    const p = c.props, m = model(p), V = vtx(m); let s = '';
    if (m.mode === 0) {
      s += protractor(V, m.prot, m) + ray(V, m.a1) + ray(V, m.a2) + K.circle(V[0], V[1], 4, { fill: 'var(--ink)' });
      s += K.text(20, 26, '量一量这个角', { size: 16, weight: 700, anchor: 'start' }) + K.text(W - 20, 26, '拖量角器边上的圆点转它：0° 线要压在角的一条边上', { size: 12, anchor: 'end', fill: '#5a6478' });
      if (m.aligned) s += '<g data-read="1">' + K.text(480, 120, (m.onLo ? '0° 线压在一条边上：读外圈' : '0° 线压在另一条边上：读内圈'), { size: 13, weight: 700, anchor: 'start', fill: '#1d4fa3' }) + K.text(480, 150, '这个角是 ' + m.ang + '°', { size: 18, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + K.text(480, 176, '是' + KIND[kindOf(m.ang)] + (m.ang !== 90 ? (m.ang < 90 ? '（比直角小）' : m.ang < 180 ? '（比直角大）' : '') : ''), { size: 14, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
      else s += K.text(480, 140, '还没对好：读不出来', { size: 13, anchor: 'start', fill: 'var(--bad)' });
    } else if (m.mode === 1) {
      s += K.line(V[0] - RAY, V[1], V[0] + RAY, V[1], { w: 2.6 }) + ray(V, m.a);
      s += wedge(V, 0, m.a, 1, m.seen, m.a + '°', '#cfe3fb') + wedge(V, m.a, 180, 2, m.seen, (180 - m.a) + '°', '#fde2c4') + K.circle(V[0], V[1], 4, { fill: 'var(--ink)' });
      s += K.text(20, 26, '一条直线上的两个角', { size: 16, weight: 700, anchor: 'start' }) + K.text(W - 20, 26, '拖射线转；点一个角就量出它', { size: 12, anchor: 'end', fill: '#5a6478' });
      if (m.seen.includes(1) && m.seen.includes(2)) s += '<g data-read="1">' + K.text(20, 330, '∠1 + ∠2 = ' + m.a + '° + ' + (180 - m.a) + '° = 180°：合起来是一个平角', { size: 15, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + K.text(20, 354, '它们互为邻补角：知道一个，另一个就是 180° 减它', { size: 12, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
    } else if (m.mode === 2) {
      s += K.line(V[0] - RAY, V[1], V[0] + RAY, V[1], { w: 2.6 }) + K.line(...P(V, m.a + 180, RAY), ...P(V, m.a, RAY), { w: 2.6 });
      s += wedge(V, 0, m.a, 1, m.seen, m.a + '°', '#cfe3fb') + wedge(V, m.a, 180, 2, m.seen, (180 - m.a) + '°', '#fde2c4') + wedge(V, 180, 180 + m.a, 3, m.seen, m.a + '°', '#cfe3fb') + wedge(V, 180 + m.a, 360, 4, m.seen, (180 - m.a) + '°', '#fde2c4') + K.circle(V[0], V[1], 4, { fill: 'var(--ink)' });
      s += K.text(20, 26, '两条直线相交：4 个角', { size: 16, weight: 700, anchor: 'start' }) + K.text(W - 20, 26, '拖一条线转；点角量出来', { size: 12, anchor: 'end', fill: '#5a6478' });
      const has = (i) => m.seen.includes(i), vert = (has(1) && has(3)) || (has(2) && has(4)), adj = (has(1) && has(2)) || (has(2) && has(3)) || (has(3) && has(4)) || (has(4) && has(1));
      const ls = []; if (vert) ls.push('相对的两个角一样大：对顶角相等'); if (adj) ls.push('挨着的两个角合起来 180°：邻补角');
      if (ls.length) s += '<g data-read="1">' + ls.map((t, i) => K.text(20, 340 + i * 22, t, { size: 14, weight: 700, anchor: 'start', fill: 'var(--blue)' })).join('') + '</g>';
    } else {
      const C = [230, 215], r = 130, pts = []; for (let i = 0; i < m.n; i++) pts.push(P(C, 90 + 360 * i / m.n + 180 / m.n, r));
      const cols = ['#cfe3fb', '#fde2c4', '#d6f0d6', '#ead9f7', '#fbd5dc', '#fff3bf'];
      if (m.split) for (let i = 1; i < m.n - 1; i++) s += '<polygon points="' + [pts[0], pts[i], pts[i + 1]].map((q) => q.map((v) => v.toFixed(1)).join(',')).join(' ') + '" fill="' + cols[(i - 1) % cols.length] + '" stroke="#3a4a63" stroke-width="1.2"/>';
      s += '<polygon points="' + pts.map((q) => q.map((v) => v.toFixed(1)).join(',')).join(' ') + '" fill="' + (m.split ? 'none' : '#eef3fb') + '" stroke="var(--ink)" stroke-width="2.2"/>';
      if (m.split) s += K.circle(pts[0][0], pts[0][1], 5, { fill: 'var(--bad)' });
      s += K.text(20, 26, m.n + ' 边形的内角和', { size: 16, weight: 700, anchor: 'start' });
      s += btn(420, 60, 40, '−', { n: m.n - 1 }, m.n > 3, '少一条边') + K.text(490, 78, m.n + ' 条边', { size: 13, weight: 700 }) + btn(520, 60, 40, '+', { n: m.n + 1 }, m.n < 12, '多一条边');
      s += btn(420, 100, 220, '从一个顶点连对角线', { split: true }, !m.split, '从红点出发，连到不相邻的顶点') + btn(420, 132, 220, '擦掉对角线', { split: false }, m.split, '回到没切的样子');
      if (m.split) s += '<g data-read="1">' + K.text(420, 196, '切成了 ' + (m.n - 2) + ' 个三角形（边数 − 2）', { size: 14, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + K.text(420, 222, '内角和 = ' + (m.n - 2) + ' × 180° = ' + (m.n - 2) * 180 + '°', { size: 16, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + K.text(420, 248, '正 ' + m.n + ' 边形每个角：' + Q.show(Q((m.n - 2) * 180, m.n)) + '°', { size: 13, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
      else s += K.text(420, 196, '切成三角形就会算了：每个三角形 180°', { size: 12, anchor: 'start', fill: '#5a6478' });
    }
    return s;
  }
  const I = (lo, hi, d, label) => ({ type: 'int', label, default: d, min: lo, max: hi, write: true });
  U.registerPack({
    id: 'anglebench', version: 1,
    types: {
      anglebench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E5', 'E2'],
        label: '量角器与角', prefix: '角', group: '图形', grades: [4, 8],
        alias: ['量角器', '量角', '角的度量', '锐角', '直角', '钝角', '平角', '邻补角', '对顶角', '多边形内角和'],
        props: {
          mode: { type: 'choice', label: '做什么', default: 0, choices: MODES, write: true },
          a1: I(-360, 360, 20, '量角：一条边的方向（度）'), a2: I(-360, 360, 110, '量角：另一条边的方向（度）'), prot: I(-360, 360, 50, '量角器转到的方向（度）'),
          a: I(5, 175, 70, '射线的方向（∠1 的度数）'), seen: { type: 'text', label: '量过的角（编号）', default: '', write: true },
          n: I(3, 12, 5, '多边形的边数'), split: { type: 'bool', label: '连了对角线', default: false, write: true },
        },
        outputs: {
          deg: { dim: null, kind: 'num', label: '量角：读出的度数（对好了才有）' }, kind: { dim: null, kind: 'num', label: '量角：0 锐角、1 直角、2 钝角、3 平角（对好了才有）' },
          straight: { dim: null, kind: 'num', label: '两个角都量了，合起来是平角：1' }, other: { dim: null, kind: 'num', label: '∠2 的度数（量了才有）' },
          vert: { dim: null, kind: 'num', label: '量了一对对顶角：1' }, sum: { dim: null, kind: 'num', label: '内角和（连了对角线才有）' }, each: { dim: null, kind: 'num', label: '正多边形每个角（连了对角线才有）' },
        },
        icon: () => '<path d="M6 40 A22 22 0 0 1 50 40 Z" fill="#fff3bf" stroke="#8a6d1a" stroke-width="1.4"/>' + K.line(28, 40, 46, 20, { w: 2 }) + K.line(28, 40, 52, 40, { w: 2 }),
        size: () => [W, 400],
        grips,
        compute: (c) => {
          const m = model(c.props), o = {};
          if (m.mode === 0 && m.aligned) { o.deg = num(m.ang); o.kind = num(kindOf(m.ang)); }
          if (m.mode === 1) { if (m.seen.includes(2)) o.other = num(180 - m.a); if (m.seen.includes(1) && m.seen.includes(2)) o.straight = num(1); }
          if (m.mode === 2) { const h = (i) => m.seen.includes(i); if (h(2)) o.other = num(180 - m.a); if ((h(1) && h(3)) || (h(2) && h(4))) o.vert = num(1); }
          if (m.mode === 3 && m.split) { o.sum = num((m.n - 2) * 180); o.each = U.val('num', Q((m.n - 2) * 180, m.n), { dim: null }); }
          return o;
        },
        badge: () => '',
        draw,
      },
    },
  });
  U.AngleBench = { model };
})(typeof globalThis !== 'undefined' ? globalThis : window);
