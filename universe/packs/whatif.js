/* 器材包 whatif：改规则的世界（docs/new-instruments.md 4.3）。改掉一条习以为常的规则，看数学变成什么样。三个器材一个包：
 *   spheretri（球面三角形）：在球上选三个点，系统用大圆弧连成三角形，读出三个角和内角和。内角和不是 180°，从略大于 180° 涨到 540°；
 *     北极加赤道上相隔 90° 的两点，三个角都是直角，内角和 270°。“内角和 − 180°”正比于三角形占整个球面的比例（超出量 ÷ 720°）。
 *     一般位置的值是浮点（标 ≈，证据最高到 ②）；整数度的预设位置给精确值。
 *   taxi（出租车几何）：格点城市只能横着竖着走，距离 = 横向格数 + 纵向格数。标出“到中心距离是 r 的所有路口”，它们围成一个斜放的正方形（4r 个路口）；
 *     再标“到两点距离相等的所有路口”：有时是一条线，有时是一片区域。路口有限，全部列出就是穷举（③）。
 *   newop（换一种运算）：给一张有限的运算表，问：交换律还成立吗？结合律呢？有没有“什么都不改变的数”（单位元）？每个数都有“抵消它的数”吗？先猜，再找例子或反例；表是有限的，系统全部检查（③）。
 * 和设计文档的差别（如实写）：球面只能选 11 个预设点（不能在球上任意点），球可以左右转；出租车的格点城市是 11 × 11（−5 到 5）；
 * 换一种运算只有 5 张表（钟面加法 / 乘法 / 减法、取较大数、差的绝对值），“和同余钟联动”没做。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n, exact) => U.val('num', typeof n === 'number' ? Q(n) : n, exact === false ? { dim: null, exact: false } : { dim: null });
  const apx = (x) => Q.fromNumber(+x.toFixed(6));
  const hit = (k, v, x, y, w, h) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="4" fill="transparent" data-pick-k="' + k + '" data-pick-v="' + v + '" style="cursor:pointer"/>';
  const btn = (x, y, w, h, tx, on) => K.rect(x, y, w, h, { fill: on ? 'var(--accent)' : 'var(--sel-bg)', r: 5 }) + K.text(x + w / 2, y + h * 0.72, tx, { size: 11, weight: 700, fill: on ? '#fff' : 'var(--ink)' });
  const ids = (s) => String(s || '').split(',').filter(Boolean).map(Number);
  const toggle = (S, i) => { const at = S.indexOf(i); if (at >= 0) S.splice(at, 1); else S.push(i); return S.sort((a, b) => a - b); };

  // ================= 球面三角形 =================
  // 预设点（纬度，经度），度
  const SP = [['北极', 90, 0], ['赤道 0°', 0, 0], ['赤道 90°', 0, 90], ['赤道 180°', 0, 180], ['赤道 270°', 0, 270], ['北纬 45°·0°', 45, 0], ['北纬 45°·90°', 45, 90], ['北纬 45°·180°', 45, 180], ['南纬 45°·45°', -45, 45], ['南纬 45°·225°', -45, 225], ['南极', -90, 0]];
  const vec = (lat, lon) => { const a = lat * Math.PI / 180, b = lon * Math.PI / 180; return [Math.cos(a) * Math.cos(b), Math.cos(a) * Math.sin(b), Math.sin(a)]; };
  const cr = (u, v) => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]], dt = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2], nm = (u) => Math.sqrt(dt(u, u));
  function sJudge(p) {
    const S = ids(p.pts).slice(0, 3), o = { S, n: S.length, ok: 0, angles: null, sum: 0, excess: 0, frac: 0, exact: false, degenerate: false };
    if (S.length < 3) return o;
    const V = S.map((i) => vec(SP[i][1], SP[i][2])), ang = [];
    for (let k = 0; k < 3; k++) { const A = V[k], B = V[(k + 1) % 3], C = V[(k + 2) % 3], u = cr(B, A), w = cr(C, A); if (nm(u) < 1e-9 || nm(w) < 1e-9) { o.degenerate = true; return o; } ang.push(Math.acos(Math.max(-1, Math.min(1, dt(u, w) / (nm(u) * nm(w))))) * 180 / Math.PI); }
    const area = Math.abs(dt(V[0], cr(V[1], V[2])));   // 三点共大圆时行列式为 0
    if (area < 1e-9) { o.degenerate = true; return o; }
    o.ok = 1; o.angles = ang.map((a) => (Math.abs(a - Math.round(a)) < 1e-7 ? Math.round(a) : a)); o.exact = o.angles.every(Number.isInteger);
    o.sum = o.angles.reduce((a, b) => a + b, 0); o.excess = o.sum - 180; o.frac = o.excess / 720; return o;
  }
  const sOnSet = (p, k, v) => { if (k === 'pk') { if (!(v > 0)) return { pk: 0 }; const S = ids(p.pts), i = v - 1, at = S.indexOf(i); if (at >= 0) S.splice(at, 1); else if (S.length < 3) S.push(i); else S.shift(), S.push(i); return { pk: 0, pts: S.join(',') }; } if (k === 'clear') return { clear: 0, pts: '' }; return null; };
  function sDraw(c) {
    const p = c.props, J = sJudge(p), W = c.w, H = [], R = 62, cx = 82, cy = 80, rot = p.rot * Math.PI / 180; let s = '';
    const proj = (lat, lon) => { const a = lat * Math.PI / 180, b = lon * Math.PI / 180 - rot, x = Math.cos(a) * Math.sin(b), y = Math.sin(a), z = Math.cos(a) * Math.cos(b), T = 0.4363, y2 = y * Math.cos(T) - z * Math.sin(T), z2 = y * Math.sin(T) + z * Math.cos(T); return [cx + R * x, cy - R * y2, z2]; };
    s += K.circle(cx, cy, R, { fill: 'var(--card)', stroke: 'var(--ink)', w: 1.5 });
    // 赤道线
    { let d = '', pv = false; for (let lon = 0; lon <= 360; lon += 6) { const q = proj(0, lon); if (q[2] > 0) { d += (pv ? 'L' : 'M') + q[0].toFixed(1) + ',' + q[1].toFixed(1); pv = true; } else pv = false; } s += '<path d="' + d + '" fill="none" stroke="var(--dim)" stroke-width="0.8"/>'; }
    // 大圆弧
    if (J.S.length >= 2) for (let k = 0; k < (J.S.length === 3 ? 3 : 1); k++) {
      const A = vec(SP[J.S[k]][1], SP[J.S[k]][2]), B = vec(SP[J.S[(k + 1) % J.S.length]][1], SP[J.S[(k + 1) % J.S.length]][2]), om = Math.acos(Math.max(-1, Math.min(1, dt(A, B)))); let d = '', pv = false;
      for (let t = 0; t <= 1.0001; t += 0.02) { const a = Math.sin((1 - t) * om) / Math.sin(om || 1), b = Math.sin(t * om) / Math.sin(om || 1), v = [a * A[0] + b * B[0], a * A[1] + b * B[1], a * A[2] + b * B[2]], lat = Math.asin(v[2]) * 180 / Math.PI, lon = Math.atan2(v[1], v[0]) * 180 / Math.PI, q = proj(lat, lon); if (q[2] > 0) { d += (pv ? 'L' : 'M') + q[0].toFixed(1) + ',' + q[1].toFixed(1); pv = true; } else pv = false; }
      s += '<path d="' + d + '" fill="none" stroke="var(--accent)" stroke-width="2.5"/>';
    }
    SP.forEach((pt, i) => { const q = proj(pt[1], pt[2]); if (q[2] <= 0.02) return; const on = J.S.includes(i); s += K.circle(q[0], q[1], on ? 6 : 4, { fill: on ? 'var(--accent)' : 'var(--dim)', stroke: 'var(--card)', w: 1 }) + (on ? K.text(q[0] + 8, q[1] - 6, String(J.S.indexOf(i) + 1), { size: 11, weight: 700, anchor: 'start' }) : ''); H.push(hit('pk', i + 1, q[0] - 9, q[1] - 9, 18, 18)); });
    s += btn(10, 152, 36, 20, '◀', false) + hit('rot', (p.rot + 315) % 360, 10, 152, 36, 20) + btn(52, 152, 36, 20, '▶', false) + hit('rot', (p.rot + 45) % 360, 52, 152, 36, 20) + btn(94, 152, 52, 20, '重选', false) + hit('clear', 1, 94, 152, 52, 20);
    const x = 160; s += K.text(x, 20, '点球上的点，选 3 个', { size: 11.5, anchor: 'start', weight: 700 });
    if (J.degenerate) s += K.text(x, 44, '这三个点在同一个大圆上，围不成三角形', { size: 11, anchor: 'start', fill: 'var(--bad)' });
    else if (!J.ok) s += K.text(x, 44, '已选 ' + J.n + ' 个', { size: 11.5, anchor: 'start', fill: 'var(--dim)' });
    else if (c.masked) s += K.text(x, 44, '先猜：三个角加起来是多少度？', { size: 12, anchor: 'start', weight: 700, fill: 'var(--accent)' });
    else { J.angles.forEach((a, i) => { s += K.text(x, 44 + i * 18, '角 ' + (i + 1) + ' = ' + (J.exact ? a + '°' : '≈ ' + a.toFixed(2) + '°'), { size: 12, anchor: 'start' }); }); s += K.text(x, 106, '内角和 ' + (J.exact ? J.sum + '°' : '≈ ' + J.sum.toFixed(2) + '°'), { size: 13, anchor: 'start', weight: 700, fill: J.sum > 180 + 1e-9 ? 'var(--bad)' : 'var(--ink)' }); s += K.text(x, 126, '比 180° 多 ' + (J.exact ? J.excess : J.excess.toFixed(2)) + '°，占整个球面的 ' + (J.exact ? Q.show(Q(J.excess, 720)) : (J.frac * 100).toFixed(2) + '%'), { size: 11, anchor: 'start', fill: 'var(--dim)' }); }
    return s + H.join('');
  }
  const sphereDef = {
    workspaceRole: 'none', handles: true, compactPorts: true, essence: ['E5', 'E9'], label: '球面三角形', prefix: '球', group: '图形', grades: [5, 9], alias: ['球面三角形', '大圆', '内角和', '球面几何', '改规则', '三个直角'],
    props: { pts: { hidden: true, type: 'text', label: '选的点', default: '', write: false }, pk: { hidden: true, type: 'int', label: '点球上的点', default: 0, min: 0, max: 11 }, clear: { hidden: true, type: 'int', label: '重选', default: 0, min: 0, max: 1 }, rot: { hidden: true, type: 'int', label: '球转了多少度', default: 45, min: 0, max: 359 }, gans: { type: 'text', label: '先猜内角和', default: '' } },
    onSet: sOnSet,
    guess: { props: ['gans'], ports: ['sum', 'excess', 'frac'], answered: (p) => String(p.gans).trim() !== '' },
    outputs: { sum: { dim: null, kind: 'num', label: '内角和（度）' }, excess: { dim: null, kind: 'num', label: '比 180° 多几度' }, frac: { dim: null, kind: 'num', label: '占球面的比例' }, valid: { dim: null, kind: 'num', label: '选好了三角形（1/0）' }, rights: { dim: null, kind: 'num', label: '直角的个数' } },
    icon: () => K.circle(32, 32, 24, { fill: 'none', stroke: 'var(--ink)', w: 1.5 }) + '<path d="M32 8 L32 40 L56 32 Z" fill="var(--accent)" fill-opacity="0.4" stroke="var(--accent)" stroke-width="2"/>',
    size: () => [380, 200],
    compute: (c) => { const J = sJudge(c.props); c.say(J.ok ? 'info' : 'info', J.ok ? '内角和 ' + (J.exact ? J.sum + '°' : '≈' + J.sum.toFixed(2) + '°') : '选 3 个点'); const ex = J.exact ? true : false; return { sum: J.ok ? num(J.exact ? Q(J.sum) : apx(J.sum), ex) : num(0), excess: J.ok ? num(J.exact ? Q(J.excess) : apx(J.excess), ex) : num(0), frac: J.ok ? num(J.exact ? Q(J.excess, 720) : apx(J.frac), ex) : num(0), valid: num(J.ok), rights: num(J.ok ? J.angles.filter((a) => a === 90).length : 0) }; },
    badge: (c) => (c.masked ? '？' : c.out.valid && Q.num(c.out.valid.data) ? U.showVal(c.out.sum) + '°' : ''),
    draw: sDraw,
  };

  // ================= 出租车几何 =================
  const N = 11, OFF = 5;
  const PAIRS = [[[0, 0], [4, 0]], [[0, 0], [2, 2]]];
  const td = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
  function tTruth(p) { const r = []; for (let y = -OFF; y <= OFF; y++) for (let x = -OFF; x <= OFF; x++) { if (p.mode === 0 ? td([x, y], [0, 0]) === p.r : td([x, y], PAIRS[p.pair][0]) === td([x, y], PAIRS[p.pair][1])) r.push((y + OFF) * N + (x + OFF)); } return r; }
  function tJudge(p) { const T = tTruth(p), S = ids(p.marks), ok = T.length === S.length && T.every((i) => S.includes(i)) ? 1 : 0, right = S.filter((i) => T.includes(i)).length; return { T, S, ok, right, wrong: S.length - right }; }
  const tOnSet = (p, k, v) => { if (k === 'cell') { if (!(v > 0)) return { cell: 0 }; return { cell: 0, marks: toggle(ids(p.marks), v - 1).join(',') }; } if (k === 'mode' || k === 'r' || k === 'pair') return { marks: '', gans: p.gans }; return null; };
  function tDraw(c) {
    const p = c.props, J = tJudge(p), W = c.w, g = 22, ox = 14, oy = 12, H = []; let s = '';
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const idx = y * N + x, on = J.S.includes(idx), X = ox + x * g, Y = oy + (N - 1 - y) * g;
      s += K.rect(X, Y, g - 2, g - 2, { fill: on ? 'var(--accent)' : 'var(--card)', stroke: 'var(--dim)', w: 0.6, r: 3 });
      H.push(hit('cell', idx + 1, X, Y, g - 2, g - 2));
    }
    const mark = (pt, lab) => { const X = ox + (pt[0] + OFF) * g + g / 2 - 1, Y = oy + (N - 1 - (pt[1] + OFF)) * g + g / 2 - 1; return K.circle(X, Y, 8, { fill: 'var(--bad)' }) + K.text(X, Y + 4, lab, { size: 10, weight: 700, fill: '#fff' }); };
    if (p.mode === 0) s += mark([0, 0], '中'); else s += mark(PAIRS[p.pair][0], 'A') + mark(PAIRS[p.pair][1], 'B');
    const x = ox + N * g + 12; s += K.text(x, 20, p.mode === 0 ? '到中心走 ' + p.r + ' 格' : 'A、B 距离相等', { size: 11.5, anchor: 'start', weight: 700 }) + K.text(x, 38, '的所有路口：点格子标出来', { size: 11, anchor: 'start', fill: 'var(--dim)' });
    s += K.text(x, 62, '标了 ' + J.S.length + ' 个', { size: 12, anchor: 'start', weight: 700 });
    s += K.text(x, 84, c.masked ? '先猜：它们围成什么形状？' : J.ok ? '全对：共 ' + J.T.length + ' 个' + (p.mode === 0 ? '（4 × ' + p.r + '）' : '') : '对了 ' + J.right + ' 个，错了 ' + J.wrong + ' 个', { size: 11.5, anchor: 'start', weight: 700, fill: J.ok && !c.masked ? 'var(--good)' : 'var(--ink)' });
    if (p.mode === 0 && J.ok && !c.masked) s += K.text(x, 104, '“圆”的周长 ÷ 直径 = ' + (8 * p.r) + ' ÷ ' + (2 * p.r) + ' = 4', { size: 11, anchor: 'start', fill: 'var(--dim)' });
    return s + H.join('');
  }
  const taxiDef = {
    workspaceRole: 'none', handles: true, compactPorts: true, essence: ['E5', 'E9'], label: '出租车几何', prefix: '租', group: '图形', grades: [6, 9], alias: ['出租车几何', '曼哈顿距离', '格点', '圆', '垂直平分线', '改规则'],
    props: { mode: { type: 'choice', label: '标什么', default: 0, choices: ['到中心距离是 r', '到 A、B 距离相等'] }, r: { type: 'int', label: 'r（走几格）', default: 3, min: 1, max: 5 }, pair: { type: 'choice', label: '哪一对点', default: 0, choices: ['A(0,0) B(4,0)', 'A(0,0) B(2,2)'] }, marks: { hidden: true, type: 'text', label: '标的路口', default: '', write: false }, cell: { hidden: true, type: 'int', label: '点一个路口', default: 0, min: 0, max: 121 }, gans: { type: 'int', label: '先猜形状（1 圆形 2 斜放的正方形 3 一条线 4 一片区域）', default: 0, min: 0, max: 4 } },
    onSet: tOnSet,
    guess: { props: ['gans'], ports: ['ok', 'count', 'right'], answered: (p) => p.gans > 0 },
    outputs: { marked: { dim: null, kind: 'num', label: '标了几个' }, right: { dim: null, kind: 'num', label: '标对了几个' }, ok: { dim: null, kind: 'num', label: '全部标对（1/0）' }, count: { dim: null, kind: 'num', label: '应该有几个' }, lv: { dim: null, kind: 'num', label: '证据等级' } },
    icon: () => '<polygon points="32,10 54,32 32,54 10,32" fill="var(--accent)" fill-opacity="0.35" stroke="var(--accent)" stroke-width="2"/>',
    size: () => [420, 295],
    compute: (c) => { const J = tJudge(c.props); c.say(J.ok ? 'ok' : 'info', J.ok ? '全部标对' : '标了 ' + J.S.length + ' 个'); return { marked: num(J.S.length), right: num(J.right), ok: num(J.ok), count: num(J.T.length), lv: num(J.ok ? 3 : 0) }; },
    badge: (c) => (c.masked ? '？' : c.out.ok && Q.num(c.out.ok.data) ? '全对' : ''),
    draw: tDraw,
  };

  // ================= 换一种运算 =================
  const OPS = [
    { name: '钟面加法（模 5）', els: [0, 1, 2, 3, 4], f: (a, b) => (a + b) % 5, sym: '＋' }, { name: '钟面乘法（模 6）', els: [0, 1, 2, 3, 4, 5], f: (a, b) => (a * b) % 6, sym: '×' },
    { name: '取较大的数', els: [1, 2, 3, 4, 5], f: (a, b) => Math.max(a, b), sym: '∨' }, { name: '差的绝对值', els: [0, 1, 2, 3, 4], f: (a, b) => Math.abs(a - b), sym: '★' }, { name: '钟面减法（模 5）', els: [0, 1, 2, 3, 4], f: (a, b) => (a - b + 5) % 5, sym: '−' },
  ];
  function nTruth(o) {
    const E = o.els, f = o.f, T = { comm: true, assoc: true, id: null, inv: true, commEx: [], assocEx: [] };
    for (const a of E) for (const b of E) { if (f(a, b) !== f(b, a)) { T.comm = false; if (T.commEx.length < 4) T.commEx.push([a, b]); } }
    for (const a of E) for (const b of E) for (const c of E) if (f(f(a, b), c) !== f(a, f(b, c))) { T.assoc = false; if (T.assocEx.length < 4) T.assocEx.push([a, b, c]); }
    T.id = E.find((e) => E.every((a) => f(e, a) === a && f(a, e) === a));
    T.inv = T.id !== undefined && E.every((a) => E.some((b) => f(a, b) === T.id && f(b, a) === T.id));
    T.hasId = T.id !== undefined; return T;
  }
  function nJudge(p) {
    const o = OPS[p.op], T = nTruth(o), tk = String(p.tried || '').split(';').filter(Boolean).map((t) => t.split(',').map(Number));
    let commFound = 0, assocFound = 0; tk.forEach((t) => { if (t.length === 2 && o.f(t[0], t[1]) !== o.f(t[1], t[0])) commFound++; if (t.length === 3 && o.f(o.f(t[0], t[1]), t[2]) !== o.f(t[0], o.f(t[1], t[2]))) assocFound++; });
    const q = [p.qc, p.qa, p.qi, p.qv], truth = [T.comm, T.assoc, T.hasId, T.inv].map((b) => (b ? 1 : 2));
    const right = q.map((a, i) => (a === 0 ? 0 : a === truth[i] ? 1 : -1)), nr = right.filter((x) => x === 1).length;
    // 说“不成立”要有自己试出的反例（交换律、结合律）；说“成立”只有“没找到反例”（②）；全部检查是系统做的（③）
    const backed = (p.qc !== 2 || commFound > 0 || T.comm) && (p.qa !== 2 || assocFound > 0 || T.assoc);
    return { o, T, tk, commFound, assocFound, right, nr, all: nr === 4 ? 1 : 0, allBacked: nr === 4 && backed ? 1 : 0, truth };
  }
  const nOnSet = (p, k, v) => {
    if (k === 'op') return { tried: '', qc: 0, qa: 0, qi: 0, qv: 0, msg: '' };
    if (k === 'ex') {
      const o = OPS[p.op], t = String(v).replace(/[，\s]+/g, ',').split(',').filter((x) => x !== '').map(Number); if (!t.length) return { ex: '' };
      if ((t.length !== 2 && t.length !== 3) || t.some((x) => !o.els.includes(x))) return { ex: '', msg: '写两个数（检查交换律）或三个数（检查结合律），要在表里：' + o.els.join('、') };
      const key = t.join(','); if (String(p.tried || '').split(';').includes(key)) return { ex: '', msg: '这个例子试过了' };
      const f = o.f; let msg;
      if (t.length === 2) msg = t[0] + ' ' + o.sym + ' ' + t[1] + ' = ' + f(t[0], t[1]) + '；' + t[1] + ' ' + o.sym + ' ' + t[0] + ' = ' + f(t[1], t[0]) + (f(t[0], t[1]) === f(t[1], t[0]) ? '：一样' : '：不一样，是反例');
      else msg = '(' + t[0] + o.sym + t[1] + ')' + o.sym + t[2] + ' = ' + f(f(t[0], t[1]), t[2]) + '；' + t[0] + o.sym + '(' + t[1] + o.sym + t[2] + ') = ' + f(t[0], f(t[1], t[2])) + (f(f(t[0], t[1]), t[2]) === f(t[0], f(t[1], t[2])) ? '：一样' : '：不一样，是反例');
      return { ex: '', tried: p.tried ? p.tried + ';' + key : key, msg };
    }
    return null;
  };
  function nDraw(c) {
    const p = c.props, J = nJudge(p), o = J.o, W = c.w, H = []; let s = '', cw = 26, x0 = 14, y0 = 28;
    s += K.text(10, 16, o.name + '：a ' + o.sym + ' b', { size: 12, anchor: 'start', weight: 700 });
    s += K.rect(x0, y0, cw, cw, { fill: 'var(--sel-bg)', r: 0 }) + K.text(x0 + cw / 2, y0 + cw * 0.68, o.sym, { size: 11, weight: 700 });
    o.els.forEach((a, i) => { s += K.rect(x0 + (i + 1) * cw, y0, cw, cw, { fill: 'var(--sel-bg)', r: 0 }) + K.text(x0 + (i + 1) * cw + cw / 2, y0 + cw * 0.68, String(a), { size: 11, weight: 700 }) + K.rect(x0, y0 + (i + 1) * cw, cw, cw, { fill: 'var(--sel-bg)', r: 0 }) + K.text(x0 + cw / 2, y0 + (i + 1) * cw + cw * 0.68, String(a), { size: 11, weight: 700 }); o.els.forEach((b, j) => { s += K.rect(x0 + (j + 1) * cw, y0 + (i + 1) * cw, cw, cw, { fill: 'var(--card)', stroke: 'var(--dim)', w: 0.6, r: 0 }) + K.text(x0 + (j + 1) * cw + cw / 2, y0 + (i + 1) * cw + cw * 0.68, String(o.f(a, b)), { size: 11 }); }); });
    const x1 = x0 + (o.els.length + 1) * cw + 20; s += K.text(x1, 40, '回答（点一下）：', { size: 11, anchor: 'start', weight: 700 });
    [['qc', '交换律成立吗'], ['qa', '结合律成立吗'], ['qi', '有“什么都不改变”的数吗'], ['qv', '每个数都有“抵消它”的数吗']].forEach(([k, lab], i) => {
      const y = 50 + i * 36, v = p[k]; s += K.text(x1, y + 4, lab, { size: 10.5, anchor: 'start' });
      [[1, '是'], [2, '否']].forEach(([val, tx], j) => { const x = x1 + j * 40, on = v === val; s += btn(x, y + 9, 36, 18, tx, on) + (c.masked ? '' : on ? K.text(x + 18, y + 38, J.right[i] === 1 ? '✓' : '✗', { size: 9, fill: J.right[i] === 1 ? 'var(--good)' : 'var(--bad)' }) : ''); H.push(hit(k, on ? 0 : val, x, y + 9, 36, 18)); });
    });
    const y = y0 + (o.els.length + 1) * cw + 20; s += K.text(10, y, '造例子检验：在右边“例子”写 a,b（交换律）或 a,b,c（结合律）', { size: 10.5, anchor: 'start', fill: 'var(--dim)' });
    if (p.msg) s += K.text(10, y + 18, p.msg.slice(0, 40), { size: 11, anchor: 'start', weight: 700, fill: p.msg.includes('反例') ? 'var(--bad)' : 'var(--ink)' });
    s += K.text(10, y + 38, '试了 ' + J.tk.length + ' 个例子，找到反例 ' + (J.commFound + J.assocFound) + ' 个' + (J.all ? '　四条都答对了' : ''), { size: 11.5, anchor: 'start', weight: 700, fill: J.all ? 'var(--good)' : 'var(--ink)' });
    return s + H.join('');
  }
  const newopDef = {
    workspaceRole: 'none', handles: true, compactPorts: true, essence: ['E9', 'E5'], label: '换一种运算', prefix: '算', group: '数与运算', grades: [4, 9], alias: ['换一种运算', '交换律', '结合律', '单位元', '运算表', '改规则', '反例'],
    props: { op: { type: 'choice', label: '哪种运算', default: 0, choices: OPS.map((o) => o.name) }, qc: { hidden: true, type: 'int', label: '交换律（1 成立 2 不成立）', default: 0, min: 0, max: 2 }, qa: { hidden: true, type: 'int', label: '结合律（1 成立 2 不成立）', default: 0, min: 0, max: 2 }, qi: { hidden: true, type: 'int', label: '有单位元（1 有 2 没有）', default: 0, min: 0, max: 2 }, qv: { hidden: true, type: 'int', label: '每个数有逆元（1 是 2 否）', default: 0, min: 0, max: 2 }, ex: { type: 'text', label: '例子（a,b 或 a,b,c）', default: '' }, tried: { hidden: true, type: 'text', label: '试过的例子', default: '', write: false }, msg: { hidden: true, type: 'text', label: '提示', default: '', write: false } },
    onSet: nOnSet,
    guess: { props: ['qc', 'qa', 'qi', 'qv'], ports: ['correct', 'all', 'allBacked'], answered: (p) => p.qc > 0 && p.qa > 0 && p.qi > 0 && p.qv > 0 },
    outputs: { correct: { dim: null, kind: 'num', label: '答对了几条' }, all: { dim: null, kind: 'num', label: '四条都对（1/0）' }, allBacked: { dim: null, kind: 'num', label: '四条都对而且说“不成立”的有反例（1/0）' }, tried: { dim: null, kind: 'num', label: '试了几个例子' }, found: { dim: null, kind: 'num', label: '找到几个反例' }, lv: { dim: null, kind: 'num', label: '证据等级' } },
    icon: () => K.text(32, 40, '★', { size: 30, weight: 700, fill: 'var(--accent)' }),
    size: (c) => [380, 130 + (OPS[c.props.op].els.length + 1) * 26 + 40],
    compute: (c) => { const J = nJudge(c.props); c.say(J.all ? 'ok' : 'info', J.all ? '四条都答对了' : '造例子试试'); return { correct: num(J.nr), all: num(J.all), allBacked: num(J.allBacked), tried: num(J.tk.length), found: num(J.commFound + J.assocFound), lv: num(J.all ? 3 : 0) }; },
    badge: (c) => (c.masked ? '？' : c.out.correct ? c.out.correct.data.n + ' / 4' : ''),
    draw: nDraw,
  };

  U.registerPack({ id: 'whatif', version: 1, needs: [], types: { spheretri: sphereDef, taxi: taxiDef, newop: newopDef } });
  U.WhatIf = { sJudge, tTruth, tJudge, nTruth, nJudge, OPS, SP };
})(typeof globalThis !== 'undefined' ? globalThis : window);
