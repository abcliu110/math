/* 器材包 compass：尺规作图（docs/new-instruments.md 6.12）。只有直尺和圆规，作出垂直平分线、正三角形、角平分线、垂线。
 *   四个工具：圆规（点圆心，再点圆上一点）、直尺（点两个点连一条直线）、取交点（点圈出来的候选交点）、自己放点（凭眼睛放一个点）。
 *   最关键的检验：作完以后，系统把已知的点换到另外 3 个位置，用同样的步骤重新作一遍，看结论还成不成立。真正的作法跟着变、依然成立；
 *   凭眼睛放的点留在原地，换位置就散了。4 个位置都成立才算作对。
 * 和设计文档的差别（如实写）：这是一台独立的器材（不是几何工作区的工具配置，也没有 gcircle2/gmeet 步骤）；圆和圆、圆和线的交点用浮点数算，
 *   容差 1e-9，没有按 U.Real 精确（所以只记 ②“没找到反例”，不记 ④ 证明；4 个位置不能代替一般性的证明）；“圆规半径带到另一个圆心”这种等长传递没做（要用就自己再画圆）；
 *   没有接“为什么这条线上的点到 A、B 一样远”的证明排序（那是 ps-* 题）。*/
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', typeof n === 'number' ? Q(n) : n, { dim: null });
  const TOL = 1e-9, SC = 22, CX = 150, CY = 105;
  const TASKS = [
    { name: '作线段 AB 的垂直平分线', given: [['A', -2, 0], ['B', 2, 0]] },
    { name: '以线段 AB 为边作正三角形', given: [['A', -2, 0], ['B', 2, 0]] },
    { name: '作 ∠AOB 的平分线', given: [['O', 0, 0], ['A', 4, 0], ['B', 3, 3]] },
    { name: '过直线 AB 外一点 C，作 AB 的垂线', given: [['A', -3, -1], ['B', 3, -1], ['C', 1, 2]] },
  ];
  // 把已知点换到另外 3 个位置（相似变换：旋转、放缩、平移）
  const MAPS = [[0, 1, 0, 0], [17, 1.3, 0.5, -0.3], [-40, 0.8, -1, 0.7], [75, 1.15, 0.2, 0.4]];
  const place = (g, m) => { const a = m[0] * Math.PI / 180, c = Math.cos(a) * m[1], s = Math.sin(a) * m[1]; return g.map(([, x, y]) => [x * c - y * s + m[2], x * s + y * c + m[3]]); };
  const givOf = (task) => place(TASKS[task].given, MAPS[0]);
  const steps = (s) => String(s || '').split(';').filter(Boolean);
  const hit = (k, v, x, y, w, h, extra) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="4" fill="transparent" data-pick-k="' + k + '" data-pick-v="' + v + '" style="cursor:pointer"' + (extra || '') + '/>';
  const btn = (x, y, w, h, tx, on) => K.rect(x, y, w, h, { fill: on ? 'var(--accent)' : 'var(--sel-bg)', r: 5 }) + K.text(x + w / 2, y + h * 0.72, tx, { size: 10.5, weight: 700, fill: on ? '#fff' : 'var(--ink)' });
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  // 两个对象的交点：which 0、1 的顺序跟图形一起转（圆圆：从圆心 1 指向圆心 2，左边的是 0；圆线：沿着线从第一个点到第二个点）
  function inter(P, A, B) {
    const circ = (o) => o.t === 'c', R = (o) => dist(P[o.c], P[o.p]);
    if (circ(A) && circ(B)) {
      const c1 = P[A.c], c2 = P[B.c], r1 = R(A), r2 = R(B), d = dist(c1, c2); if (d < 1e-12) return [];
      const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d), h2 = r1 * r1 - a * a; if (h2 < -1e-12) return [];
      const u = [(c2[0] - c1[0]) / d, (c2[1] - c1[1]) / d], m = [c1[0] + a * u[0], c1[1] + a * u[1]], h = Math.sqrt(Math.max(0, h2));
      if (h < 1e-9) return [m];
      return [[m[0] - h * u[1], m[1] + h * u[0]], [m[0] + h * u[1], m[1] - h * u[0]]];
    }
    if (circ(A) !== circ(B)) {
      const C = circ(A) ? A : B, L = circ(A) ? B : A, c = P[C.c], r = R(C), p = P[L.a], q = P[L.b], d = dist(p, q); if (d < 1e-12) return [];
      const u = [(q[0] - p[0]) / d, (q[1] - p[1]) / d], t0 = (c[0] - p[0]) * u[0] + (c[1] - p[1]) * u[1], f = [p[0] + t0 * u[0], p[1] + t0 * u[1]], e2 = r * r - dist(c, f) ** 2;
      if (e2 < -1e-12) return []; const e = Math.sqrt(Math.max(0, e2)); if (e < 1e-9) return [f];
      return [[f[0] - e * u[0], f[1] - e * u[1]], [f[0] + e * u[0], f[1] + e * u[1]]];
    }
    const p = P[A.a], q = P[A.b], r = P[B.a], s = P[B.b], d1 = [q[0] - p[0], q[1] - p[1]], d2 = [s[0] - r[0], s[1] - r[1]], den = d1[0] * d2[1] - d1[1] * d2[0];
    if (Math.abs(den) < 1e-12) return []; const t = ((r[0] - p[0]) * d2[1] - (r[1] - p[1]) * d2[0]) / den; return [[p[0] + t * d1[0], p[1] + t * d1[1]]];
  }
  // 按步骤重新作一遍
  function build(S, giv) {
    const P = giv.map((g) => g.slice()), O = []; let bad = '';
    for (const st of S) {
      const kind = st[0], a = st.slice(2).split(',').map(Number);
      if (kind === 'c') O.push({ t: 'c', c: a[0], p: a[1] }); else if (kind === 'l') O.push({ t: 'l', a: a[0], b: a[1] });
      else if (kind === 'f') P.push([a[0], a[1], 'free']);
      else if (kind === 'm') { const I = O[a[0]] && O[a[1]] ? inter(P, O[a[0]], O[a[1]]) : []; if (!I[a[2]]) { bad = '换了位置以后，这个交点不存在了'; P.push([NaN, NaN]); } else P.push(I[a[2]]); }
    }
    return { P, O, bad };
  }
  // 现在能取的交点（去掉已经是点的，同一个位置只留一个）
  function cands(S, giv) {
    const B = build(S, giv), out = [];
    for (let i = 0; i < B.O.length; i++) for (let j = i + 1; j < B.O.length; j++) inter(B.P, B.O[i], B.O[j]).forEach((q, w) => { if (B.P.some((p) => dist(p, q) < 1e-7) || out.some((o) => dist(o.q, q) < 1e-7)) return; out.push({ i, j, w, q }); });
    return out;
  }
  const lineThrough = (P, o, X) => { const p = P[o.a], q = P[o.b], d = dist(p, q); if (!(d > 1e-9)) return Infinity; return Math.abs((q[0] - p[0]) * (X[1] - p[1]) - (q[1] - p[1]) * (X[0] - p[0])) / d; };
  const dirOf = (P, o) => { const d = dist(P[o.a], P[o.b]); return d > 1e-9 ? [(P[o.b][0] - P[o.a][0]) / d, (P[o.b][1] - P[o.a][1]) / d] : null; };
  const unit = (a, b) => { const d = dist(a, b); return [(b[0] - a[0]) / d, (b[1] - a[1]) / d]; };
  function passTask(task, S, m) {
    const giv = place(TASKS[task].given, m), B = build(S, giv); if (B.bad || B.P.some((p) => !isFinite(p[0]))) return false;
    const sc = Math.max(1, dist(giv[0], giv[1])), tol = 1e-7 * sc;
    if (task === 0) { const M = [(giv[0][0] + giv[1][0]) / 2, (giv[0][1] + giv[1][1]) / 2], u = unit(giv[0], giv[1]); return B.O.some((o) => { if (o.t !== 'l') return false; const d = dirOf(B.P, o); return d && Math.abs(d[0] * u[0] + d[1] * u[1]) < 1e-7 && lineThrough(B.P, o, M) < tol; }); }
    if (task === 1) { const L = dist(giv[0], giv[1]); return B.P.slice(2).some((p) => Math.abs(dist(p, giv[0]) - L) < tol && Math.abs(dist(p, giv[1]) - L) < tol); }
    if (task === 2) { const u1 = unit(giv[0], giv[1]), u2 = unit(giv[0], giv[2]), w = [u1[0] + u2[0], u1[1] + u2[1]], wn = Math.hypot(w[0], w[1]); return B.O.some((o) => { if (o.t !== 'l') return false; const d = dirOf(B.P, o); return d && lineThrough(B.P, o, giv[0]) < tol && Math.abs(d[0] * w[1] - d[1] * w[0]) / wn < 1e-7; }); }
    const u = unit(giv[0], giv[1]); return B.O.some((o) => { if (o.t !== 'l') return false; const d = dirOf(B.P, o); return d && Math.abs(d[0] * u[0] + d[1] * u[1]) < 1e-7 && lineThrough(B.P, o, giv[2]) < tol; });
  }
  function judge(p) {
    const S = steps(p.steps), cfg = MAPS.map((m) => passTask(p.task, S, m) ? 1 : 0), n = cfg.reduce((a, b) => a + b, 0), free = S.filter((s) => s[0] === 'f').length;
    return { S, cfg, passed: n, ok: n === MAPS.length ? 1 : 0, free, objs: S.filter((s) => s[0] === 'c' || s[0] === 'l').length, first: cfg[0] };
  }
  function onSet(p, k, v) {
    const S = steps(p.steps), giv = givOf(p.task), B = build(S, giv), cap = S.length >= 24;
    if (k === 'tool') return { tool: v, pend: '', msg: '' };
    if (k === 'task') return { steps: '', pend: '', msg: '', tool: 0 };
    if (k === 'undo') return v > 0 ? { undo: 0, steps: S.slice(0, -1).join(';'), pend: '', msg: '' } : { undo: 0 };
    if (k === 'clear') return v > 0 ? { clear: 0, steps: '', pend: '', msg: '' } : { clear: 0 };
    if (cap && (k === 'pt' || k === 'cand' || k === 'free')) return { pt: 0, cand: 0, free: 0, msg: '步骤太多了（最多 24 步）' };
    if (k === 'pt') {
      if (!(v > 0)) return { pt: 0 }; const i = v - 1; if (!B.P[i] || p.tool < 1 || p.tool > 2) return { pt: 0, msg: p.tool ? '' : '先选一个工具' };
      if (p.pend === '') return { pt: 0, pend: String(i), msg: p.tool === 1 ? '再点圆上的一个点' : '再点直线经过的另一个点' };
      const j = Number(p.pend); if (j === i) return { pt: 0, pend: '', msg: '' };
      const st = (p.tool === 1 ? 'c:' : 'l:') + j + ',' + i; if (S.includes(st)) return { pt: 0, pend: '', msg: '这一步已经做过了' };
      return { pt: 0, pend: '', steps: S.concat([st]).join(';'), msg: '' };
    }
    if (k === 'cand') { if (!(v > 0) || p.tool !== 3) return { cand: 0 }; const C = cands(S, giv)[v - 1]; if (!C) return { cand: 0 }; return { cand: 0, steps: S.concat(['m:' + C.i + ',' + C.j + ',' + C.w]).join(';'), msg: '' }; }
    if (k === 'free') { if (!(v > 0) || p.tool !== 4) return { free: 0 }; const gx = (v - 1) % 14 - 7, gy = Math.floor((v - 1) / 14) - 5; return { free: 0, steps: S.concat(['f:' + gx + ',' + gy]).join(';'), msg: '' }; }
    return null;
  }
  const X = (x) => CX + x * SC, Y = (y) => CY - y * SC;
  function draw(c) {
    const p = c.props, J = judge(p), giv = givOf(p.task), names = TASKS[p.task].given, B = build(J.S, giv), H = []; let s = '';
    const cv = 12, cvw = 300, cvh = 210; s += K.rect(0, 0, cvw, cvh, { fill: 'var(--card)', stroke: 'var(--dim)', w: 0.8, r: 6 });
    B.O.forEach((o, i) => { if (o.t === 'c') { const r = dist(B.P[o.c], B.P[o.p]) * SC; if (isFinite(r)) s += K.circle(X(B.P[o.c][0]), Y(B.P[o.c][1]), r, { fill: 'none', stroke: 'var(--accent)', w: 1.2 }); } else { const a = B.P[o.a], b = B.P[o.b], d = dist(a, b); if (d > 1e-9) { const u = [(b[0] - a[0]) / d, (b[1] - a[1]) / d]; s += '<line x1="' + X(a[0] - 30 * u[0]) + '" y1="' + Y(a[1] - 30 * u[1]) + '" x2="' + X(a[0] + 30 * u[0]) + '" y2="' + Y(a[1] + 30 * u[1]) + '" stroke="var(--ink)" stroke-width="1.4"/>'; } } });
    B.P.forEach((q, i) => { if (!isFinite(q[0])) return; const free = q[2] === 'free', pend = p.pend !== '' && Number(p.pend) === i; s += K.circle(X(q[0]), Y(q[1]), pend ? 6 : 4, { fill: free ? 'none' : i < giv.length ? 'var(--bad)' : 'var(--ink)', stroke: free ? 'var(--bad)' : pend ? 'var(--accent)' : 'none', w: 1.8 }); s += K.text(X(q[0]) + 7, Y(q[1]) - 6, i < giv.length ? names[i][0] : free ? '·' : 'P' + (i - giv.length + 1), { size: 10, anchor: 'start', fill: 'var(--dim)' }); });
    if (p.tool === 3) cands(J.S, giv).forEach((o, i) => { if (!isFinite(o.q[0])) return; s += K.circle(X(o.q[0]), Y(o.q[1]), 4.5, { fill: 'none', stroke: 'var(--good)', w: 1.5 }); H.push(hit('cand', i + 1, X(o.q[0]) - 9, Y(o.q[1]) - 9, 18, 18)); });
    if (p.tool === 1 || p.tool === 2) B.P.forEach((q, i) => { if (isFinite(q[0])) H.push(hit('pt', i + 1, X(q[0]) - 9, Y(q[1]) - 9, 18, 18)); });
    if (p.tool === 4) for (let gy = -5; gy <= 4; gy++) for (let gx = -7; gx <= 6; gx++) H.push(hit('free', (gy + 5) * 14 + gx + 8, X(gx) - 11, Y(gy) - 11, 22, 22));
    const y0 = cvh + 8; s += K.text(0, y0 + 10, TASKS[p.task].name, { size: 11.5, anchor: 'start', weight: 700 });
    [['圆规', 1], ['直尺', 2], ['取交点', 3], ['自己放点', 4]].forEach(([tx, v], i) => { const x = i * 62; s += btn(x, y0 + 18, 58, 20, tx, p.tool === v); H.push(hit('tool', p.tool === v ? 0 : v, x, y0 + 18, 58, 20)); });
    s += btn(252, y0 + 18, 48, 20, '撤销', false); H.push(hit('undo', 1, 252, y0 + 18, 48, 20));
    s += K.text(0, y0 + 56, p.msg || (p.tool === 1 ? '圆规：点圆心，再点圆上一点' : p.tool === 2 ? '直尺：点两个点' : p.tool === 3 ? '绿圈是能取的交点' : p.tool === 4 ? '点一个位置放点（凭眼睛）' : '先选一个工具'), { size: 10.5, anchor: 'start', fill: 'var(--dim)' });
    s += K.text(0, y0 + 74, c.masked ? '' : (J.ok ? '换 3 个新位置，作法都成立：作对了' : J.S.length ? '换位置检验：' + J.passed + ' / 4 个位置成立' + (J.free ? '（凭眼睛放的点会散掉）' : '') : '开始作图'), { size: 11.5, anchor: 'start', weight: 700, fill: J.ok ? 'var(--good)' : 'var(--ink)' });
    return s + H.join('');
  }
  U.registerPack({
    id: 'compass', version: 1, needs: [], types: {
      compass: {
        workspaceRole: 'none', handles: true, compactPorts: true, essence: ['E9', 'E10', 'E5'], label: '尺规作图', prefix: '规', group: '图形', grades: [7, 9], alias: ['尺规作图', '圆规', '直尺', '垂直平分线', '角平分线', '垂线', '作图'],
        props: { task: { type: 'choice', label: '作什么', default: 0, choices: TASKS.map((t) => t.name) }, steps: { hidden: true, type: 'text', label: '步骤', default: '', write: false }, tool: { hidden: true, type: 'int', label: '工具（1 圆规 2 直尺 3 取交点 4 自己放点）', default: 0, min: 0, max: 4 }, pend: { hidden: true, type: 'text', label: '选了的点', default: '', write: false }, msg: { hidden: true, type: 'text', label: '提示', default: '', write: false }, pt: { hidden: true, type: 'int', label: '点一个点', default: 0, min: 0, max: 40 }, cand: { hidden: true, type: 'int', label: '点一个交点', default: 0, min: 0, max: 200 }, free: { hidden: true, type: 'int', label: '放一个点', default: 0, min: 0, max: 140 }, undo: { hidden: true, type: 'int', label: '撤销', default: 0, min: 0, max: 1 }, clear: { hidden: true, type: 'int', label: '清空', default: 0, min: 0, max: 1 } },
        onSet,
        outputs: { ok: { dim: null, kind: 'num', label: '作对了（1/0）' }, passed: { dim: null, kind: 'num', label: '几个位置上成立（共 4 个）' }, first: { dim: null, kind: 'num', label: '原来的位置上成立（1/0）' }, free: { dim: null, kind: 'num', label: '凭眼睛放了几个点' }, objs: { dim: null, kind: 'num', label: '画了几个圆和线' }, lv: { dim: null, kind: 'num', label: '证据等级' } },
        icon: () => '<circle cx="32" cy="32" r="18" fill="none" stroke="var(--accent)" stroke-width="2.5"/><line x1="32" y1="6" x2="32" y2="58" stroke="var(--ink)" stroke-width="2"/>',
        size: () => [300, 342],
        compute: (c) => { const J = judge(c.props); c.say(J.ok ? 'ok' : 'info', J.ok ? '作对了' : J.S.length ? J.passed + ' / 4 个位置成立' : '选一个工具开始'); return { ok: num(J.ok), passed: num(J.passed), first: num(J.first), free: num(J.free), objs: num(J.objs), lv: num(J.ok ? 2 : 0) }; },
        badge: (c) => (c.out.ok && Q.num(c.out.ok.data) ? '作对了' : ''),
        draw,
      },
    },
  });
  U.Compass = { givOf, TASKS, MAPS, build, cands, inter, judge, passTask, place };
})(typeof globalThis !== 'undefined' ? globalThis : window);
