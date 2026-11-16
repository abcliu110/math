/* 器材包 balancebench：天平与方程（docs/instrument-design.md 第 4 节的第二个操作台）。
 * 两个盘里放着“盒子”（重量藏起来了，都一样重，就是 x）和砝码（每个重 1）。全部在卡片上直接动手：
 *   - 从盘里把一个砝码或盒子拖出来：拿走；拖到另一个盘里：挪过去；从下面的托盘往盘里拖：加一个。
 *   - 两个盘可以“连起来”（两边一起动，默认开着）：拖走一个砝码，另一个盘里的一个砝码跟着一起走；往一个盘里加，另一个盘也加。
 *     拖的时候就能看见两边同时少、同时多，式子写成“x + 5 − 1 = 12 − 1”。另一个盘里没有同样的东西，就只能拿这一边，天平会歪。
 *   - 把“两边一起动”关掉：只动一边，天平马上歪（看得见的错）；再去另一边做同样的事，天平才回来。
 *   - 下面三个按钮是“两边一起做”的快捷方式：各拿走一个砝码、各拿走一个盒子、两边都平分成几份只留一份。
 *   - 天平下面的式子跟着变；右边记下每一步的式子，平衡的打 ✓，歪了的打 ✗。
 * 目标：把一个盒子单独留在一边，另一边的砝码数就是盒子的重量。
 * 这一版的边界（如实写）：只有正整数个盒子和砝码，没有负数、没有减法和括号；盒子的重量是整数。
 * 和旧的“解方程天平”（eqscale）的差别：那一台只能在属性面板里改四个数；这一台直接拖。旧的先保留，题目没搬完。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const BMAX = 6, WMAX = 24;
  const W = 640, CX = 220, BEAM_Y = 54, ARM = 120, PAN_DROP = 96, PAN_W = 180, TRAY_Y = 268;
  const BOX = 30, WT = 17;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const st = (p) => ({ lx: clamp(p.lx, 0, BMAX), lc: clamp(p.lc, 0, WMAX), rx: clamp(p.rx, 0, BMAX), rc: clamp(p.rc, 0, WMAX), x0: p.x0 });
  const weigh = (s) => ({ l: s.lx * s.x0 + s.lc, r: s.rx * s.x0 + s.rc });
  const balanced = (s) => { const w = weigh(s); return w.l === w.r; };
  // 解出来了：一边只有一个盒子，另一边只有砝码，而且平衡
  const solvedOf = (s) => (!balanced(s) ? null : s.lx === 1 && s.lc === 0 && s.rx === 0 ? s.rc : s.rx === 1 && s.rc === 0 && s.lx === 0 ? s.lc : null);
  // 进度：0 两边都还混着；1 盒子只在一边、砝码只在另一边（平衡）；2 解出来了
  const stageOf = (s) => (solvedOf(s) !== null ? 2 : balanced(s) && ((s.lc === 0 && s.rx === 0 && s.lx > 0) || (s.rc === 0 && s.lx === 0 && s.rx > 0)) ? 1 : 0);
  const side = (x, c) => { const a = []; if (x) a.push((x === 1 ? '' : x) + 'x'); if (c || !x) a.push(String(c)); return a.join(' + '); };
  const eqText = (s) => side(s.lx, s.lc) + (balanced(s) ? ' = ' : ' ≠ ') + side(s.rx, s.rc);
  const key = (s) => [s.lx, s.lc, s.rx, s.rc].join(',');
  const parseLog = (t) => String(t || '').split(';').filter(Boolean).map((r) => { const a = r.split(',').map(Number); return a.length === 4 && a.every((n) => Number.isInteger(n) && n >= 0) ? { lx: a[0], lc: a[1], rx: a[2], rc: a[3] } : null; }).filter(Boolean);
  // 改成新的状态，并把它记进步骤里（和上一步一样就不记）
  function to(p0, n) {
    const s0 = st(p0), s = st(Object.assign({}, p0, n));
    if (key(s) === key(s0)) return {};
    const log = parseLog(p0.steps).map(key); if (!log.length) log.push(key(s0));
    if (log[log.length - 1] !== key(s)) log.push(key(s));
    return { lx: s.lx, lc: s.lc, rx: s.rx, rc: s.rc, steps: log.slice(-12).join(';') };
  }

  const synced = (p) => p.sync !== false && p.sync !== 0;
  const NAME = { x: '盒子', 1: '砝码' };
  // 这一下拖动会做什么。返回 { n: 要改的数, fx: 画面上要表现的事 }
  //   fx.both：两边一起（sign −1 拿走、+1 加上）；fx.lone：只动了这一边；fx.move：从一个盘挪到另一个盘
  function plan(p0, gid, q) {
    const s0 = st(p0), at = where(q, geo(s0)), sync = synced(p0), n = {};
    if (gid === 'sb' || gid === 'sw') {
      const kind = gid === 'sb' ? 'x' : '1', suf = kind === 'x' ? 'x' : 'c', max = kind === 'x' ? BMAX : WMAX;
      if (at === 'out') return { n, fx: null, kind };
      const me = (at === 'L' ? 'l' : 'r') + suf, ot = (at === 'L' ? 'r' : 'l') + suf;
      if (s0[me] >= max || (sync && s0[ot] >= max)) return { n, fx: { full: true, kind }, kind };
      n[me] = s0[me] + 1; if (sync) n[ot] = s0[ot] + 1;
      return { n, fx: sync ? { both: true, sign: 1, kind } : { lone: true, sign: 1, kind, side: at }, kind };
    }
    const from = gid[0] === 'l' ? 'L' : 'R', kind = gid[1] === 'b' ? 'x' : '1', suf = kind === 'x' ? 'x' : 'c';
    const me = (from === 'L' ? 'l' : 'r') + suf, ot = (from === 'L' ? 'r' : 'l') + suf;
    if (at === from) return { n, fx: null, kind };
    n[me] = s0[me] - 1;
    if (at !== 'out') { n[ot] = s0[ot] + 1; return { n, fx: { move: true, kind, side: from }, kind }; }
    if (sync && s0[ot] > 0) { n[ot] = s0[ot] - 1; return { n, fx: { both: true, sign: -1, kind }, kind }; }
    return { n, fx: { lone: true, sign: -1, kind, side: from, noTwin: sync }, kind };
  }
  // 两步之间做了什么（步骤栏里写在式子后面）
  function opOf(a, b) {
    const d = [b.lx - a.lx, b.lc - a.lc, b.rx - a.rx, b.rc - a.rc];
    const part = (v, x) => (v ? (v > 0 ? '+' : '−') + (x && Math.abs(v) === 1 ? '' : Math.abs(v)) + x : '');
    if (d[0] === d[2] && d[1] === d[3]) return '两边' + part(d[0], 'x') + part(d[1], '');
    for (let k = 2; k <= 6; k++) if (b.lx * k === a.lx && b.lc * k === a.lc && b.rx * k === a.rx && b.rc * k === a.rc) return '两边÷' + k;
    if (b.lx + b.rx === a.lx + a.rx && b.lc + b.rc === a.lc + a.rc) return '挪过去';
    return '只动一边';
  }

  // ---- 画面的几何：天平歪多少、两个盘在哪、盘里每样东西放在哪 ----
  function geo(s) {
    const w = weigh(s), d = w.l - w.r, ang = clamp(d / (Math.abs(d) + 5), -1, 1) * 13 * Math.PI / 180;
    const dy = Math.sin(ang) * ARM, dx = Math.cos(ang) * ARM;
    const L = { x: CX - dx, y: BEAM_Y + dy + PAN_DROP }, R = { x: CX + dx, y: BEAM_Y - dy + PAN_DROP };
    return { ang, L, R, beamL: { x: CX - dx, y: BEAM_Y + dy }, beamR: { x: CX + dx, y: BEAM_Y - dy }, d };
  }
  // 盘里的东西：盒子排在盘底左边，砝码在右边一摞一摞（每摞 4 个）
  function items(pan, nx, nc) {
    const out = { boxes: [], weights: [] }, x0 = pan.x - PAN_W / 2 + 8;
    for (let i = 0; i < nx; i++) out.boxes.push({ x: x0 + (i % 3) * (BOX + 3), y: pan.y - BOX - Math.floor(i / 3) * (BOX + 3) });
    const wx = x0 + Math.min(nx, 3) * (BOX + 3) + (nx ? 4 : 0), cols = Math.max(1, Math.floor((pan.x + PAN_W / 2 - 6 - wx) / (WT + 2)));
    for (let i = 0; i < nc; i++) out.weights.push({ x: wx + (i % cols) * (WT + 2), y: pan.y - WT - Math.floor(i / cols) * (WT + 2) });
    return out;
  }
  // 鼠标在哪：左盘上方、右盘上方，还是外面
  function where(q, g) {
    const inPan = (pan) => Math.abs(q.x - pan.x) <= PAN_W / 2 + 14 && q.y <= pan.y + 22 && q.y >= pan.y - 150;
    return inPan(g.L) ? 'L' : inPan(g.R) ? 'R' : 'out';
  }

  const boxSvg = (x, y, shown, x0) => K.rect(x, y, BOX, BOX, { fill: '#f5c26b', stroke: '#8a5a00', r: 5, w: 1.8 }) + K.text(x + BOX / 2, y + BOX / 2 + 6, shown ? String(x0) : 'x', { size: 16, weight: 700, fill: '#5a3a00' });
  const wtSvg = (x, y) => K.rect(x, y, WT, WT, { fill: '#9fb7d9', stroke: '#2f4a73', r: 3, w: 1.4 }) + K.text(x + WT / 2, y + WT / 2 + 4, '1', { size: 11, weight: 700, fill: '#16284a' });
  const setBtn = (x, y, w, label, patch, on, tip) => '<g' + (on ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' opacity="0.4"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 26, { fill: '#fff', stroke: on ? 'var(--blue)' : '#8a94a8', r: 8, w: 1.6 }) + K.text(x + w / 2, y + 17, label, { size: 12, weight: 700 }) + '</g>';

  function draw(c) {
    const p = c.props, s = st(p), g = geo(s), ok = balanced(s), sol = solvedOf(s);
    let h = '';
    // 支架、横梁、吊线、盘
    h += K.line(CX, BEAM_Y, CX, 230, { w: 5 }) + K.line(CX - 46, 232, CX + 46, 232, { w: 6 });
    h += K.line(g.beamL.x, g.beamL.y, g.beamR.x, g.beamR.y, { w: 6, stroke: ok ? 'var(--good)' : 'var(--bad)' }) + K.circle(CX, BEAM_Y, 6, { fill: 'var(--ink)' });
    for (const [b, pan] of [[g.beamL, g.L], [g.beamR, g.R]]) {
      h += K.line(b.x, b.y, pan.x - PAN_W / 2 + 6, pan.y, { w: 1.2 }) + K.line(b.x, b.y, pan.x + PAN_W / 2 - 6, pan.y, { w: 1.2 });
      h += K.rect(pan.x - PAN_W / 2, pan.y, PAN_W, 7, { fill: 'var(--ink)', r: 3 });
    }
    const li = items(g.L, s.lx, s.lc), ri = items(g.R, s.rx, s.rc);
    for (const it of [li, ri]) { it.boxes.forEach((b) => { h += boxSvg(b.x, b.y, sol !== null && p.reveal, s.x0); }); it.weights.forEach((w) => { h += wtSvg(w.x, w.y); }); }
    // 式子：和天平是同一件事
    // 正在拖：画出被拖的那一个；两边连着时，另一边的那一个跟着一起动，式子写成“两边同时 − 1”
    const dg = c.drag ? plan(c.drag.p0, c.drag.grip, c.drag) : null, fx = dg && dg.fx;
    let eq = eqText(s), eqFill = ok ? 'var(--ink)' : 'var(--bad)', note = '', noteFill = 'var(--bad)';
    if (!ok) note = '天平歪了：两边要做同样的事';
    else if (sol !== null) { note = '一个盒子 = ' + sol + '，解出来了'; noteFill = 'var(--good)'; }
    if (dg) {
      const s0 = st(c.drag.p0), kx = dg.kind === 'x', half = kx ? BOX / 2 : WT / 2, one = (x, y) => (kx ? boxSvg(x - half, y - half, false, 0) : wtSvg(x - half, y - half));
      const sg = (v) => (v > 0 ? ' + ' : ' − ') + (kx ? 'x' : '1'), L0 = side(s0.lx, s0.lc), R0 = side(s0.rx, s0.rc);
      h += one(c.drag.x, c.drag.y);
      if (fx && fx.both) {
        const mx = 2 * CX - c.drag.x;
        h += '<g data-twin="1" opacity="0.75">' + one(mx, c.drag.y) + '</g>' + K.line(c.drag.x, c.drag.y, mx, c.drag.y, { w: 1.5, stroke: 'var(--blue)', dash: '5 4' });
        for (const pan of [g.L, g.R]) h += K.text(pan.x, pan.y + 26, (fx.sign > 0 ? '+ ' : '− ') + (kx ? 'x' : '1'), { size: 16, weight: 700, fill: 'var(--blue)' });
        eq = L0 + sg(fx.sign) + ' = ' + R0 + sg(fx.sign); eqFill = 'var(--blue)';
        note = '两边同时' + (fx.sign > 0 ? '加上' : '拿走') + ' 1 个' + NAME[dg.kind] + '：还是平的'; noteFill = 'var(--blue)';
      } else if (fx && fx.lone) {
        const pan = fx.side === 'L' ? g.L : g.R;
        h += K.text(pan.x, pan.y + 26, (fx.sign > 0 ? '+ ' : '− ') + (kx ? 'x' : '1'), { size: 16, weight: 700, fill: 'var(--bad)' });
        eq = (fx.side === 'L' ? L0 + sg(fx.sign) : L0) + (ok ? ' = ' : ' ≠ ') + (fx.side === 'R' ? R0 + sg(fx.sign) : R0);
        note = fx.noTwin ? '另一个盘里没有' + NAME[dg.kind] + '可以一起拿走：只拿这一边，天平会歪' : '只动了一边：天平歪了';
      } else if (fx && fx.full) { note = '盘里放不下了'; }
    }
    h += K.text(CX, 256, eq, { size: 20, weight: 700, fill: eqFill });
    if (note) h += K.text(CX, 276, note, { size: note.length > 22 ? 12 : 13, fill: noteFill, weight: 700 });
    // 托盘：往盘里拖是加
    const ty = TRAY_Y + 22;
    h += K.rect(40, ty, 360, 44, { fill: 'none', stroke: '#8a94a8', r: 10, w: 1.2 }) + K.text(92, ty + 27, '往盘里拖：', { size: 12 });
    h += boxSvg(150, ty + 7, false, 0) + wtSvg(232, ty + 14) + K.text(322, ty + 27, '从盘里拖出来：拿走', { size: 12 });
    // 两边连不连：连着时拖一个，另一边跟着走
    const sy = synced(p);
    h += '<g data-pick-set="' + encodeURIComponent(JSON.stringify({ sync: !sy })) + '" style="cursor:pointer"><title>' + (sy ? '现在两个盘连着：拖一个，另一个盘里同样的东西跟着走。点一下关掉。' : '现在只动一边：天平会歪。点一下把两个盘连起来。') + '</title>' +
      K.rect(412, ty + 9, 168, 26, { fill: sy ? 'var(--blue)' : '#fff', stroke: 'var(--blue)', r: 13, w: 1.6 }) + K.text(496, ty + 26, sy ? '两边一起动：开' : '两边一起动：关', { size: 12, weight: 700, fill: sy ? '#fff' : 'var(--ink)' }) + '</g>';
    if (sy && !dg) h += K.line(g.L.x, g.L.y + 12, g.R.x, g.R.y + 12, { w: 1.2, stroke: 'var(--blue)', dash: '2 5' });
    // 两边一起做
    const by = ty + 54, both = Math.min(s.lc, s.rc) > 0, bothX = Math.min(s.lx, s.rx) > 0;
    let n = 0; for (let k = 6; k >= 2; k--) if ([s.lx, s.lc, s.rx, s.rc].every((v) => v % k === 0) && s.lx + s.rx > 0) { n = k; break; }
    h += setBtn(40, by, 136, '两边各拿走 1 个砝码', to(p, { lc: s.lc - 1, rc: s.rc - 1 }), both, '两边同时减 1：天平还平衡');
    h += setBtn(184, by, 136, '两边各拿走 1 个盒子', to(p, { lx: s.lx - 1, rx: s.rx - 1 }), bothX, '两边同时减去一个 x：天平还平衡');
    h += setBtn(328, by, 150, n ? '两边都平分成 ' + n + ' 份' : '两边平分', n ? to(p, { lx: s.lx / n, lc: s.lc / n, rx: s.rx / n, rc: s.rc / n }) : {}, !!n, '两边同时除以同一个数：每边分成几份，只留一份');
    // 每一步的式子
    const log = parseLog(p.steps); if (!log.length) log.push(s);
    h += K.text(W - 140, 30, '每一步', { size: 12, weight: 700 });
    const shown = log.slice(-8), off = log.length - shown.length;
    shown.forEach((r, i) => {
      const rs = Object.assign({ x0: s.x0 }, r), good = balanced(rs), prev = log[off + i - 1];
      if (prev) h += K.text(W - 44, 52 + i * 22, opOf(prev, r), { size: 10, fill: good ? 'var(--blue)' : 'var(--bad)' });
      h += K.text(W - 140, 52 + i * 22, eqText(rs), { size: 12, weight: i === Math.min(log.length, 8) - 1 ? 700 : 400, fill: good ? 'var(--ink)' : 'var(--bad)' }) +
        K.text(W - 82, 52 + i * 22, good ? '✓' : '✗', { size: 12, weight: 700, fill: good ? 'var(--good)' : 'var(--bad)' });
    });
    return h;
  }

  // 把手：每个盘里最上面的那个砝码、最后一个盒子可以拖走；托盘里的两样可以拖进盘里
  function grips(c) {
    const p = c.props, s = st(p), g = geo(s), out = [];
    const li = items(g.L, s.lx, s.lc), ri = items(g.R, s.rx, s.rc);
    const take = (id, it, kind, from) => {
      if (!it) return;
      const half = kind === 'x' ? BOX / 2 : WT / 2;
      out.push({ id, x: it.x + half, y: it.y + half, r: half + 3, ghost: true, cursor: 'grab', tip: synced(p) ? '拖出来：两边各拿走一个' : '拖出来：拿走；拖到另一个盘：挪过去',
        drag: (c0, q) => to(c0.props, plan(c0.props, id, q).n),
        say: (c1) => eqText(st(c1.props)) });
    };
    take('lw', li.weights[li.weights.length - 1], '1', 'L'); take('lb', li.boxes[li.boxes.length - 1], 'x', 'L');
    take('rw', ri.weights[ri.weights.length - 1], '1', 'R'); take('rb', ri.boxes[ri.boxes.length - 1], 'x', 'R');
    const ty = TRAY_Y + 22;
    const give = (id, x, y, r) => out.push({ id, x, y, r: r + 4, ghost: true, cursor: 'grab', tip: synced(p) ? '拖到一个盘里：两边各加一个' : '拖到一个盘里：加一个',
      drag: (c0, q) => to(c0.props, plan(c0.props, id, q).n),
      say: (c1) => eqText(st(c1.props)) });
    give('sb', 150 + BOX / 2, ty + 7 + BOX / 2, BOX / 2 - 1); give('sw', 232 + WT / 2, ty + 14 + WT / 2, WT / 2 - 1);
    return out;
  }

  const I = (lo, hi, d, label, o) => Object.assign({ type: 'int', label, default: d, min: lo, max: hi, write: true }, o || {});
  U.registerPack({
    id: 'balancebench', version: 1,
    types: {
      balancebench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E4', 'E2'],
        label: '天平与方程', prefix: '天平', group: '关系', grades: [3, 9],
        alias: ['方程', '等式', '等式的性质', '解方程', '未知数', '移项', '天平', '平衡'],
        props: {
          lx: I(0, BMAX, 2, '左盘：几个盒子'), lc: I(0, WMAX, 3, '左盘：几个砝码'),
          rx: I(0, BMAX, 0, '右盘：几个盒子'), rc: I(0, WMAX, 11, '右盘：几个砝码'),
          x0: I(0, 20, 4, '盒子的真实重量（出题人设）', { hidden: true }),
          sync: { type: 'bool', label: '两边一起动（拖一个，另一个盘里同样的东西跟着走）', default: true, write: true },
          reveal: { type: 'bool', label: '解出来以后，盒子上显示重量', default: true, write: true },
          steps: { type: 'text', label: '每一步（自动记录）', default: '', write: true, hidden: true },
        },
        outputs: {
          solved: { dim: null, kind: 'num', label: '盒子的重量（解出来以后才有）' },
          stage: { dim: null, kind: 'num', label: '进度：0 还混着，1 盒子和砝码分开了，2 解出来了' },
          okn: { dim: null, kind: 'num', label: '平衡：1 是，0 否' },
          moves: { dim: null, kind: 'num', label: '做了几步' },
          lbal: { dim: null, kind: 'num', label: '平衡时左盘有几个盒子（歪了就是 0）' },
          eq: { dim: null, kind: 'eqn', label: '方程（左 = 右）' },
        },
        icon: () => K.line(10, 14, 54, 14, { w: 2.5 }) + K.line(32, 14, 32, 36, { w: 2 }) + K.rect(12, 16, 12, 10, { fill: '#f5c26b', stroke: 'var(--ink)', w: 1.5 }) + K.rect(42, 18, 8, 8, { fill: '#9fb7d9', stroke: 'var(--ink)', w: 1.2 }) + K.line(16, 36, 48, 36, { w: 3 }),
        size: () => [W, 412],
        grips,
        compute: (c) => {
          const s = st(c.props), sol = solvedOf(s), X = U.Poly.variable('x'), C = (n) => U.Poly.const(Q(n));
          const o = { stage: num(stageOf(s)), okn: num(balanced(s) ? 1 : 0), lbal: num(balanced(s) ? s.lx : 0), moves: num(Math.max(0, parseLog(c.props.steps).length - 1)),
            eq: U.val('eqn', U.Eqn.make(U.Poly.add(U.Poly.mul(C(s.lx), X), C(s.lc)), U.Poly.add(U.Poly.mul(C(s.rx), X), C(s.rc)), '=')) };
          if (sol !== null) o.solved = num(sol);
          return o;
        },
        badge: (c) => { const s = st(c.props), sol = solvedOf(s); return sol !== null ? 'x = ' + sol : balanced(s) ? '平衡' : '歪了'; },
        draw,
      },
    },
  });
  U.BalanceBench = { st, balanced, solvedOf, stageOf, eqText, to, parseLog, plan, opOf };
})(typeof globalThis !== 'undefined' ? globalThis : window);
