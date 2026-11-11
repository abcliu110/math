/* 器材包 turtle：海龟作图（docs/new-instruments.md 5.3）。用“前进、左转、右转、重复 k 次 [ … ]”的积木让小海龟画图。
 *   点积木按钮往程序里加一块（不打字）；前进多远 n、转多少度 a、重复几次 k 用 − / + 调。先猜：海龟画完会回到起点吗？
 *   读出：回到起点了吗 closed、一共转了多少度 turned（不看方向）、走了多远 len、有没有画出目标图 match（形状和边长都相同，转向镜像也算）。
 *   最有价值的错：画正三角形时转 60°（内角）而不是 120°（外角）——图形不闭合，缺口看得见。
 * 和设计文档的差别（如实写）：运行是一次画完（没有接世界时钟的逐步动画和单步）；没有变量和“自己定义的指令”，“重复 k 次”里的 k 就是唯一的变量；
 *   坐标用浮点数（容差 1e-6 判“回到起点”和“相同”），没有按 15° 的倍数走 U.Real 精确值；输出没有 fig（不能放进几何工作区）；
 *   “任意正 n 边形都转 360°”靠一道题（k = 7）逐个换 k 去试，不做自动扫描。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', typeof n === 'number' ? Q(n) : n, { dim: null });
  const TG = ['（没有目标）', '正方形', '正三角形', '五角星', '正六边形'];
  const TP = [null, 'T4;F100;R90;E', 'T3;F100;R120;E', 'T5;F100;R144;E', 'T6;F100;R60;E'];
  const MAXSTEP = 4000;
  const hit = (k, v, x, y, w, h) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="4" fill="transparent" data-pick-k="' + k + '" data-pick-v="' + v + '" style="cursor:pointer"/>';
  const btn = (x, y, w, h, tx, on) => K.rect(x, y, w, h, { fill: on ? 'var(--accent)' : 'var(--sel-bg)', r: 5 }) + K.text(x + w / 2, y + h * 0.7, tx, { size: 10.5, weight: 700, fill: on ? '#fff' : 'var(--ink)' });
  const toks = (s) => String(s || '').split(';').filter(Boolean).map((t) => ({ c: t[0], v: +t.slice(1) || 0 }));
  // 把 tokens 解析成树；括号没配好时 err
  function parse(T) {
    const root = [], st = [root]; let err = '';
    for (const t of T) {
      if (t.c === 'T') { const b = { rep: t.v, body: [] }; st[st.length - 1].push(b); st.push(b.body); } else if (t.c === 'E') { if (st.length > 1) st.pop(); else err = '多了一个“]”'; } else st[st.length - 1].push(t);
    }
    if (st.length > 1) err = '“重复”的方括号没合上';
    return { tree: root, err };
  }
  function run(prog) {
    const P = parse(toks(prog)); let x = 0, y = 0, h = 90, steps = 0, turned = 0, net = 0, len = 0; const pts = [[0, 0]];
    const go = (list) => { for (const n of list) { if (steps > MAXSTEP) return; steps++; if (n.rep !== undefined) { for (let i = 0; i < n.rep; i++) go(n.body); } else if (n.c === 'F') { x += n.v * Math.cos(h * Math.PI / 180); y += n.v * Math.sin(h * Math.PI / 180); len += n.v; pts.push([x, y]); } else if (n.c === 'L') { h += n.v; turned += n.v; net += n.v; } else if (n.c === 'R') { h -= n.v; turned += n.v; net -= n.v; } } };
    go(P.tree);
    const closed = len > 0 && Math.abs(x) < 1e-6 && Math.abs(y) < 1e-6 && steps <= MAXSTEP;
    return { pts, closed, turned, net, len, steps, err: P.err, capped: steps > MAXSTEP, top: P.tree.length === 1 && P.tree[0].rep !== undefined ? P.tree[0].rep : 0 };
  }
  // 闭合折线的“签名”：去掉共线的中间点，记每条边的长度和每个顶点的转角（环形、可镜像）
  function sig(pts) {
    let Pn = pts.slice(); if (Pn.length > 1 && Math.hypot(Pn[0][0] - Pn[Pn.length - 1][0], Pn[0][1] - Pn[Pn.length - 1][1]) < 1e-6) Pn.pop();
    const keep = []; const n = Pn.length; if (n < 3) return null;
    for (let i = 0; i < n; i++) { const a = Pn[(i + n - 1) % n], b = Pn[i], c = Pn[(i + 1) % n], cr = (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]); if (Math.abs(cr) > 1e-6 * Math.max(1, Math.hypot(b[0] - a[0], b[1] - a[1]) * Math.hypot(c[0] - b[0], c[1] - b[1]))) keep.push(b); }
    const m = keep.length; if (m < 3) return null; const S = [];
    for (let i = 0; i < m; i++) { const b = keep[i], c = keep[(i + 1) % m], d = keep[(i + 2) % m]; const l = Math.hypot(c[0] - b[0], c[1] - b[1]); const a1 = Math.atan2(c[1] - b[1], c[0] - b[0]), a2 = Math.atan2(d[1] - c[1], d[0] - c[0]); let t = (a2 - a1) * 180 / Math.PI; t = ((t + 540) % 360) - 180; S.push([l, t]); }
    return S;
  }
  function same(A, B) {
    if (!A || !B || A.length !== B.length) return false; const n = A.length;
    for (const sg of [1, -1]) for (let s = 0; s < n; s++) { let ok = true; for (let i = 0; i < n && ok; i++) { const a = A[i], b = B[(s + i) % n]; if (Math.abs(a[0] - b[0]) > 1e-6 || Math.abs(a[1] - sg * b[1]) > 1e-6) ok = false; } if (ok) return true; }
    return false;
  }
  function judge(p) {
    const R = run(p.prog); let match = 0;
    if (p.tgt > 0 && R.closed) { const T = run(TP[p.tgt]); match = same(sig(R.pts), sig(T.pts)) ? 1 : 0; }
    return Object.assign({ match }, R);
  }
  function onSet(p, k, v) {
    if (k === 'add') {
      if (!(v > 0)) return { add: 0 };
      const T = String(p.prog || '').split(';').filter(Boolean);
      if (v === 6) { T.pop(); return { add: 0, prog: T.join(';') }; }
      if (v === 7) return { add: 0, prog: '' };
      if (T.length >= 24) return { add: 0 };
      const open = T.filter((t) => t[0] === 'T').length - T.filter((t) => t[0] === 'E').length;
      if (v === 5 && open <= 0) return { add: 0 };
      T.push(v === 1 ? 'F' + p.n : v === 2 ? 'L' + p.a : v === 3 ? 'R' + p.a : v === 4 ? 'T' + p.k : 'E');
      return { add: 0, prog: T.join(';') };
    }
    return null;
  }
  function show(T) { const out = []; let ind = 0; for (const t of T) { if (t.c === 'E') ind = Math.max(0, ind - 1); out.push([ind, t.c === 'F' ? '前进 ' + t.v : t.c === 'L' ? '左转 ' + t.v + '°' : t.c === 'R' ? '右转 ' + t.v + '°' : t.c === 'T' ? '重复 ' + t.v + ' 次 [' : ']']); if (t.c === 'T') ind++; } return out; }
  function draw(c) {
    const p = c.props, J = judge(p), H = []; let s = '';
    // 左：积木；中：程序；右：画布
    [['前进 n', 1], ['左转 a', 2], ['右转 a', 3], ['重复 k [', 4], [']', 5], ['撤销', 6], ['清空', 7]].forEach(([tx, v], i) => { s += btn(8, 8 + i * 24, 70, 20, tx, false); H.push(hit('add', v, 8, 8 + i * 24, 70, 20)); });
    const adj = (y, lab, k, val, d1, d2, lo, hi) => { s += K.text(8, y + 12, lab + ' ' + val, { size: 10.5, anchor: 'start', weight: 700 }); [[-d2, '−' + d2], [-d1, '−' + d1], [d1, '+' + d1], [d2, '+' + d2]].forEach(([d, tx], i) => { const x = 8 + i * 18; s += btn(x, y + 16, 17, 16, '', false) + K.text(x + 8.5, y + 28, tx.replace('−', '-'), { size: 8.5 }); H.push(hit(k, Math.max(lo, Math.min(hi, val + d)), x, y + 16, 17, 16)); }); };
    adj(180, 'n', 'n', p.n, 10, 50, 10, 200); adj(214, 'a', 'a', p.a, 1, 15, 1, 180); adj(248, 'k', 'k', p.k, 1, 2, 1, 12);
    s += K.text(88, 14, '程序', { size: 11, anchor: 'start', weight: 700 });
    show(toks(p.prog)).slice(0, 14).forEach(([ind, tx], i) => { s += K.text(88 + ind * 10, 30 + i * 15, tx, { size: 10, anchor: 'start' }); });
    const cx = 292, cy = 120, W2 = 220; let mx = 1; J.pts.forEach((q) => { mx = Math.max(mx, Math.abs(q[0]), Math.abs(q[1])); }); const sc = 85 / mx;
    s += K.rect(cx - 100, cy - 100, 200, 200, { fill: 'var(--card)', stroke: 'var(--dim)', w: 0.8, r: 6 });
    if (p.tgt > 0) { const T = run(TP[p.tgt]); let m2 = 1; T.pts.forEach((q) => { m2 = Math.max(m2, Math.abs(q[0]), Math.abs(q[1])); }); const d = T.pts.map((q, i) => (i ? 'L' : 'M') + (cx + q[0] * sc).toFixed(1) + ',' + (cy - q[1] * sc).toFixed(1)).join(''); s += '<path d="' + d + '" fill="none" stroke="var(--dim)" stroke-width="5" stroke-opacity="0.25"/>'; }
    if (J.pts.length > 1) s += '<path d="' + J.pts.map((q, i) => (i ? 'L' : 'M') + (cx + q[0] * sc).toFixed(1) + ',' + (cy - q[1] * sc).toFixed(1)).join('') + '" fill="none" stroke="var(--accent)" stroke-width="2.2"/>';
    const e = J.pts[J.pts.length - 1]; s += K.circle(cx + e[0] * sc, cy - e[1] * sc, 4, { fill: 'var(--bad)' }) + K.circle(cx, cy, 2.5, { fill: 'var(--ink)' });
    const x = cx - 100;
    s += K.text(x, 232, p.tgt > 0 ? '目标：' + TG[p.tgt] + (J.match ? '　画对了' : '') : '自己画', { size: 11, anchor: 'start', weight: 700, fill: J.match ? 'var(--good)' : 'var(--ink)' });
    if (J.err) s += K.text(x, 248, J.err, { size: 10.5, anchor: 'start', fill: 'var(--bad)' });
    else if (c.masked && J.len > 0) s += K.text(x, 248, '先猜：海龟画完能回到起点吗？', { size: 11, anchor: 'start', weight: 700, fill: 'var(--accent)' });
    else if (J.len > 0) s += K.text(x, 248, (J.closed ? '回到起点' : '没回到起点，缺口 ' + Math.hypot(e[0], e[1]).toFixed(1)) + '；共转 ' + J.turned + '°', { size: 11, anchor: 'start', fill: J.closed ? 'var(--good)' : 'var(--bad)' });
    return s + H.join('');
  }
  U.registerPack({
    id: 'turtle', version: 1, needs: [], types: {
      turtle: {
        workspaceRole: 'none', handles: true, compactPorts: true, essence: ['E6', 'E8', 'E5'], label: '海龟作图', prefix: '龟', group: '图形', grades: [3, 9], alias: ['海龟作图', '海龟', '编程', '重复', '外角和', '正多边形', '画图'],
        props: {
          prog: { hidden: true, type: 'text', label: '程序', default: '', write: false }, add: { hidden: true, type: 'int', label: '加一块积木（1 前进 2 左转 3 右转 4 重复 5 ] 6 撤销 7 清空）', default: 0, min: 0, max: 7 },
          n: { type: 'int', label: '前进多远 n', default: 100, min: 10, max: 200 }, a: { type: 'int', label: '转多少度 a', default: 90, min: 1, max: 180 }, k: { type: 'int', label: '重复几次 k', default: 4, min: 1, max: 12 },
          tgt: { type: 'choice', label: '目标图', default: 0, choices: TG }, gans: { type: 'int', label: '先猜：（1 会回到起点 2 不会）', default: 0, min: 0, max: 2 },
        },
        onSet,
        guess: { props: ['gans'], ports: ['closed', 'turned', 'match'], answered: (p) => p.gans > 0 },
        outputs: { closed: { dim: null, kind: 'num', label: '回到起点（1/0）' }, turned: { dim: null, kind: 'num', label: '一共转了多少度' }, len: { dim: null, kind: 'num', label: '一共走了多远' }, match: { dim: null, kind: 'num', label: '画出了目标图（1/0）' }, rep: { dim: null, kind: 'num', label: '只有一个“重复”时，重复了几次' }, lv: { dim: null, kind: 'num', label: '证据等级' } },
        icon: () => '<path d="M14 48 L14 16 L50 16 L50 48 Z" fill="none" stroke="var(--accent)" stroke-width="3"/><circle cx="14" cy="48" r="4" fill="var(--bad)"/>',
        size: () => [400, 316],
        compute: (c) => { const J = judge(c.props); c.say(J.err ? 'warn' : J.match ? 'ok' : 'info', J.err || (J.match ? '画对了' : J.len ? (J.closed ? '回到起点' : '没回到起点') : '点积木')); return { closed: num(J.closed ? 1 : 0), turned: num(J.turned), len: num(J.len), match: num(J.match), rep: num(J.top), lv: num(J.match ? 3 : 0) }; },
        badge: (c) => (c.masked ? '？' : c.out.closed && Q.num(c.out.closed.data) ? '闭合' : ''),
        draw,
      },
    },
  });
  U.Turtle = { run, sig, same, judge, TP, parse };
})(typeof globalThis !== 'undefined' ? globalThis : window);
