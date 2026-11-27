/* 器材包 numlinebench：数轴操作台（docs/instrument-design.md 第 4 节）。一条数轴，三种用法，全部在图上直接拖：
 *   跳步：  拖起点；拖落点——每跳一步是一个“步长”，落点只能停在跳得到的地方。弧线和算式跟着变：3 + 4 × 2 = 11。
 *           步长可以是负的（往左跳，就是减法）；数轴可以从负数开始，所以 2 − 5 = −3 看得见。
 *   找位置：把每一格切成 d 份，拖一个点。它的位置同时写成分数、带分数和小数：5/4 = 1 又 1/4 = 1.25。
 *   区间：  拖两个端点，点端点下面的按钮切换“含 / 不含”。写成不等式 −2 < x ≤ 3，并数出里面有几个整数。
 *   两边各走（联动组，docs/essence-forms.md 第二节）：等式 a·x + b = c·x + d 画成两条跳的路。拖上面的“试的数 g”：
 *           上面一条从 0 跳 a 下、每下 g，再跳 b，落在 L；下面一条跳 c 下 g、再跳 d，落在 R。两个落点重合，g 就是解。
 *           拖一个落点往左 k 格 = 两边都减 k（“两边一起动”开着时另一个落点同时动，差不变）；按钮：两边 ÷ n、两边都少跳一下 x。
 *           g 是这台自己的（不进联动组的状态，改 g 不算做一步）；g 从 0 拖到 G，G 和数轴长度只由 a、b、c、d 定（见 eqRange），拖 g 时不变。
 * 尺寸按数轴的范围（from…to）固定，拖动时不变，所以把手一直跟着鼠标。
 * 这一版的边界（如实写）：数轴范围是整数，最长 40 格；找位置的分母最多 12；没有放大镜（不能一层层放大看更细的刻度）。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', typeof n === 'number' ? Q(n) : n, { dim: null });
  const MODES = ['跳步', '找位置', '区间', '最少跳几下', '两边各走'];
  const W = 620, X0 = 36, X1 = W - 36, AY = 150, NMAX = 12;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  function model(p) {
    const from = clamp(p.from, -20, 0), to = clamp(p.to, from + 4, from + 40), u = (X1 - X0) / (to - from);
    const X = (v) => X0 + (v - from) * u, inv = (x) => from + (x - X0) / u;
    const m = { mode: p.mode, from, to, u, X, inv };
    if (p.mode === 1) {
      m.d = clamp(p.d, 1, 12); m.k = clamp(p.k, 0, (to - from) * m.d); m.value = Q.add(Q(from), Q(m.k, m.d));
    } else if (p.mode === 2) {
      m.lo = clamp(p.lo, from, to); m.hi = clamp(p.hi, m.lo, to); m.lc = p.lc ? 1 : 0; m.hc = p.hc ? 1 : 0;
      m.ints = m.lo === m.hi ? (m.lc && m.hc ? 1 : 0) : m.hi - m.lo - 1 + m.lc + m.hc;   // 两端之间的整数，加上算在里面的端点
      m.len = m.hi - m.lo;
    } else {
      m.a = clamp(p.a, from, to); m.s = p.s === 0 ? 1 : clamp(p.s, -10, 10);
      const room = m.s > 0 ? Math.floor((to - m.a) / m.s) : Math.floor((m.a - from) / -m.s);
      m.n = clamp(p.n, 0, Math.min(NMAX, room)); m.value = m.a + m.n * m.s;
    }
    return m;
  }
  const sgn = (n) => (n < 0 ? '−' + (-n) : String(n));
  // 分数的三种写法
  function forms(q) {
    const s = Q.show(q), f = Q.num(q), neg = f < 0, a = Q.abs(q), whole = Math.floor(Q.num(a)), rest = Q.sub(a, Q(whole));
    const out = [s.replace('-', '−')];
    if (whole > 0 && Q.num(rest) !== 0) out.push((neg ? '−' : '') + whole + ' 又 ' + Q.show(rest));
    const dec = Number(f.toFixed(6)); if (Math.abs(dec * 1000 - Math.round(dec * 1000)) < 1e-9 && String(dec) !== out[0]) out.push(String(dec).replace('-', '−'));
    return out;
  }

  function axis(m) {
    const span = m.to - m.from, every = span <= 20 ? 1 : span <= 30 ? 2 : 5;
    let s = K.line(X0 - 14, AY, X1 + 14, AY, { w: 2.5 }) + '<path d="M' + (X1 + 20) + ' ' + AY + ' l-9 -5 v10 z" fill="var(--ink)"/>';
    for (let v = m.from; v <= m.to; v++) {
      const big = v % every === 0 || v === 0;
      s += K.line(m.X(v), AY - (big ? 8 : 5), m.X(v), AY + (big ? 8 : 5), { w: v === 0 ? 2.5 : 1.4 });
      if (big) s += K.text(m.X(v), AY + 26, sgn(v), { size: 13, weight: v === 0 ? 700 : 400 });
    }
    return s;
  }
  const pickBtn = (x, y, w, tx, k, v, tip, on) => '<g data-pick-k="' + k + '" data-pick-v="' + v + '" style="cursor:pointer"><title>' + K.esc(tip) + '</title>' + K.rect(x, y, w, 22, { fill: on ? 'var(--blue)' : '#fff', stroke: on ? 'var(--blue)' : '#8a94a8', r: 6 }) + K.text(x + w / 2, y + 16, tx, { size: 13, weight: 700, fill: on ? '#fff' : 'var(--ink)' }) + '</g>';


  // ---------- 最少跳几下（mode 3）：steps 是能跳的步长（可以有负的），jt 是目标；path 是跳过的步长编号 ----------
  function jumpModel(p) {
    const steps = String(p.steps || '3,5').split(',').map(Number).filter((x) => Number.isInteger(x) && x !== 0 && Math.abs(x) <= 10).slice(0, 4);
    const from = Math.max(-10, Math.min(0, +p.from || 0)), to = Math.max(from + 10, Math.min(40, +p.to || 30)), jt = Math.max(from, Math.min(to, +p.jt || 23));
    const path = String(p.path || '').split(',').filter((x) => x !== '').map(Number).filter((i) => i >= 0 && i < steps.length);
    let pos = 0; const pts = [0]; for (const i of path) { pos += steps[i]; pts.push(pos); }
    // 最少几次：在 [from, to] 里一层一层往外找（广度优先）
    const dist = new Map([[0, 0]]); let q = [0];
    while (q.length && !dist.has(jt)) { const nq = []; for (const v of q) for (const s of steps) { const w = v + s; if (w >= from && w <= to && !dist.has(w)) { dist.set(w, dist.get(v) + 1); nq.push(w); } } q = nq; }
    const best = dist.has(jt) ? dist.get(jt) : -1, there = pos === jt && path.length > 0;
    return { steps, from, to, jt, path, pts, pos, best, there, out: pos < from || pos > to };
  }
  function drawJump(c) {
    const p = c.props, m = jumpModel(p); let s = '';
    const X = (v) => X0 + (X1 - X0) * (v - m.from) / (m.to - m.from);
    s += K.text(20, 26, '每次只能跳 ' + m.steps.map((x) => (x > 0 ? '+' : '−') + Math.abs(x)).join(' 或 ') + '：从 0 跳到 ' + m.jt + '，最少跳几下？', { size: 15, weight: 700, anchor: 'start' });
    s += K.line(X0, AY, X1, AY, { w: 2 });
    for (let v = m.from; v <= m.to; v++) s += K.line(X(v), AY - 5, X(v), AY + 5, { w: 1 }) + (v % 5 === 0 ? K.text(X(v), AY + 22, String(v), { size: 10, fill: '#5a6478' }) : '');
    s += K.circle(X(m.jt), AY, 9, { fill: '#f5c26b', stroke: '#8a5a00', w: 1.6 }) + K.text(X(m.jt), AY - 16, '目标 ' + m.jt, { size: 11, weight: 700, fill: '#8a5a00' });
    for (let k = 1; k < m.pts.length; k++) { const a = X(m.pts[k - 1]), b = X(m.pts[k]), h = 20 + Math.min(40, Math.abs(b - a) / 3); s += '<path d="M' + a + ' ' + AY + ' Q' + (a + b) / 2 + ' ' + (AY - h) + ' ' + b + ' ' + AY + '" fill="none" stroke="var(--blue)" stroke-width="2"/>'; }
    s += K.circle(X(Math.max(m.from, Math.min(m.to, m.pos))), AY, 6, { fill: 'var(--blue)' });
    m.steps.forEach((st, i) => { const x = 40 + i * 110; s += '<g data-pick-set="' + encodeURIComponent(JSON.stringify({ path: m.path.concat([i]).join(',') })) + '" style="cursor:pointer"><title>跳 ' + (st > 0 ? '+' : '−') + Math.abs(st) + '</title>' + K.rect(x, 184, 100, 30, { fill: '#fff', stroke: 'var(--blue)', r: 7, w: 1.4 }) + K.text(x + 50, 204, '跳 ' + (st > 0 ? '+' : '−') + Math.abs(st), { size: 13, weight: 700 }) + '</g>'; });
    s += '<g data-pick-set="' + encodeURIComponent(JSON.stringify({ path: m.path.slice(0, -1).join(',') })) + '" style="cursor:pointer"><title>退一步</title>' + K.rect(480, 184, 70, 30, { fill: '#fff', stroke: 'var(--blue)', r: 7, w: 1.4 }) + K.text(515, 204, '退一步', { size: 12, weight: 700 }) + '</g>';
    s += '<g data-pick-set="' + encodeURIComponent(JSON.stringify({ path: '' })) + '" style="cursor:pointer"><title>重跳</title>' + K.rect(556, 184, 56, 30, { fill: '#fff', stroke: 'var(--blue)', r: 7, w: 1.4 }) + K.text(584, 204, '重跳', { size: 12, weight: 700 }) + '</g>';
    s += K.text(20, 234, '跳了 ' + m.path.length + ' 下，现在在 ' + m.pos + (m.out ? '（跳出数轴了）' : ''), { size: 13, anchor: 'start' });
    if (m.there) s += '<g data-read="1">' + K.text(20, 256, '到了！跳了 ' + m.path.length + ' 下' + (m.path.length === m.best ? '：最少就是 ' + m.best + ' 下' : '：最少只要 ' + m.best + ' 下'), { size: 15, weight: 700, anchor: 'start', fill: m.path.length === m.best ? 'var(--blue)' : 'var(--bad)' }) + '</g>';
    return s;
  }
  // ---------- 两边各走（mode 4）：a·x + b = c·x + d，g 是孩子拖的“试的数” ----------
  // g 的范围 0…G、数轴 0…to 只由 a、b、c、d 定（不用藏着的 x0，不随 g 变）：
  //   a ≠ c 时解是 (d − b) / (a − c)，不会超过 max(b, d) / |a − c|，所以 G 取这个上界，至少 10、最多 20（题目的解都在 20 以内）；a = c 时 G = 10。
  //   数轴要放得下 g = G 时两个落点：to = max(a, c) × G + max(b, d)，至少 10。刻度：to ≤ 60 每 1 一格，再长每 5 一格；数字每 1、2、5、10 写一个。
  const EQ_TO = 200;
  const lq = (p) => ({ a: p.qa, b: p.qb, c: p.qc, d: p.qd });
  function eqRange(s) {
    const G = s.a === s.c ? 10 : Math.min(20, Math.max(10, Math.ceil(Math.max(s.b, s.d) / Math.abs(s.a - s.c))));
    return { G, to: Math.max(10, Math.max(s.a, s.c) * G + Math.max(s.b, s.d)) };
  }
  const linked = (p) => p.link !== false && p.link !== 0;
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const AY1 = 134, AY2 = 222, GY = 58;
  // r：定范围用的属性（拖落点时用按下那一刻的，数轴不跟着缩）
  function eqModel(p, r) {
    const s = lq(p), R0 = eqRange(lq(r || p)), u = (X1 - X0) / R0.to, g = clamp(Math.round(+p.g || 0), 0, R0.G);
    return { s, G: R0.G, to: R0.to, u, X: (v) => X0 + v * u, inv: (x) => (x - X0) / u, g, L: s.a * g + s.b, R: s.c * g + s.d };
  }
  // 说一句：重合、差多少；a = c 时 g 是几都一样（两边一模一样，或者永远差 |b − d|）
  function eqSay(p) {
    const m = eqModel(p), s = m.s;
    if (s.a === s.c && s.b === s.d) return { tx: '两边一模一样：g 是几，两个落点都重合', good: true, meet: true };
    if (s.a === s.c) return { tx: '两边每下跳得一样多，只差 ' + Math.abs(s.b - s.d) + '：g 是几都差这么多，落不到一起', good: false, meet: false };
    if (m.L === m.R) return { tx: '落在同一点：x = ' + m.g + ' 时两边一样', good: true, meet: true };
    return { tx: '两个落点差 ' + Math.abs(m.L - m.R) + '：换一个 g 试试', good: false, meet: false };
  }
  // 拖一个落点往左 k 格：这一边少跳 k；两边一起动时另一边也少跳 k（另一边不够就到它的 0 为止）
  function eqDrag(p0, gid, q) {
    const m0 = eqModel(p0), top = gid === 'L', me = top ? 'qb' : 'qd', ot = top ? 'qd' : 'qb', at = top ? m0.L : m0.R, both = linked(p0);
    let k = clamp(Math.round((m0.X(at) - q.x) / m0.u), 0, p0[me]);
    if (both) k = Math.min(k, p0[ot]);
    const patch = { [me]: p0[me] - k }; if (both) patch[ot] = p0[ot] - k;
    return { patch, k, both };
  }
  const eqBtn = (x, y, w, label, patch, on, tip) => '<g' + (on ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' opacity="0.4"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 26, { fill: '#fff', stroke: on ? 'var(--blue)' : '#8a94a8', r: 8, w: 1.6 }) + K.text(x + w / 2, y + 17, label, { size: 12, weight: 700 }) + '</g>';
  function drawEq(c) {
    const p = c.props, m = eqModel(p, c.drag ? c.drag.p0 : p), s = m.s, both = linked(p), say = eqSay(p);
    const dg = c.drag && (c.drag.grip === 'L' || c.drag.grip === 'R') ? eqDrag(c.drag.p0, c.drag.grip, c.drag) : null;
    const tick = m.to <= 60 ? 1 : 5, lab = m.to <= 12 ? 1 : m.to <= 30 ? 2 : m.to <= 60 ? 5 : 10;
    const xs = (k) => (k === 1 ? 'x' : k + 'x'), side = (k, e) => [k ? xs(k) : '', e || !k ? String(e) : ''].filter(Boolean).join(' + ');
    let h = K.text(20, 24, '两边各走：' + side(s.a, s.b) + ' 和 ' + side(s.c, s.d) + '，每一下 x 跳 g 那么远', { size: 14, weight: 700, anchor: 'start' });
    // 试的数 g：和下面两条数轴用同一个比例
    h += K.line(m.X(0), GY, m.X(m.G), GY, { w: 4, stroke: '#c9d2df' }) + K.text(m.X(m.G) + 8, GY + 4, '试的数 g：0 到 ' + m.G, { size: 11, anchor: 'start', fill: '#4a5568' });
    h += K.text(m.X(m.g), GY - 14, 'g = ' + m.g, { size: 12, weight: 700, fill: 'var(--blue)' }) + K.line(m.X(m.g), GY + 10, m.X(m.g), AY2, { w: 1, dash: '2 4', stroke: '#8a94a8' });
    const axis = (y, name) => {
      let a = K.text(14, y + 5, name, { size: 13, weight: 700 }) + K.line(X0 - 6, y, X1 + 14, y, { w: 2 }) + '<path d="M' + (X1 + 20) + ' ' + y + ' l-9 -5 v10 z" fill="var(--ink)"/>';
      for (let v = 0; v <= m.to; v += tick) { const big = v % lab === 0; a += K.line(m.X(v), y - (big ? 6 : 4), m.X(v), y + (big ? 6 : 4), { w: v === 0 ? 2.2 : 1.1 }); if (big) a += K.text(m.X(v), y + 19, String(v), { size: 11, fill: '#4a5568' }); }
      return a;
    };
    const path = (y, k, e, col) => {
      let a = '', x = 0;
      const arc = (v0, v1, tx) => { const x1 = m.X(v0), x2 = m.X(v1), r = Math.abs(x2 - x1) / 2, hg = Math.min(30, 8 + r * 0.5); a += '<path d="M' + x1 + ' ' + (y - 4) + ' Q' + (x1 + x2) / 2 + ' ' + (y - 4 - hg * 2) + ' ' + x2 + ' ' + (y - 4) + '" fill="none" stroke="' + col + '" stroke-width="2"/>'; if (r >= 7) a += K.text((x1 + x2) / 2, y - 8 - hg, tx, { size: 11, weight: 700, fill: col }); };
      for (let i = 0; i < k; i++) { if (m.g > 0) arc(x, x + m.g, 'x'); x += m.g; }
      if (e > 0) arc(x, x + e, '+' + e);
      return a;
    };
    h += axis(AY1, '左') + path(AY1, s.a, s.b, 'var(--blue)') + axis(AY2, '右') + path(AY2, s.c, s.d, '#b86a00');
    // 两个落点；不重合时两点之间标差
    const xl = m.X(m.L), xr = m.X(m.R);
    if (m.L !== m.R) { const by = AY2 + 34; h += K.line(xl, AY1, xl, by, { w: 1, dash: '3 3', stroke: 'var(--bad)' }) + K.line(xr, AY2, xr, by, { w: 1, dash: '3 3', stroke: 'var(--bad)' }) + '<g data-gap="1">' + K.line(xl, by, xr, by, { w: 2, stroke: 'var(--bad)' }) + K.text((xl + xr) / 2, by + 15, '差 ' + Math.abs(m.L - m.R), { size: 12, weight: 700, fill: 'var(--bad)' }) + '</g>'; }
    else h += K.line(xl, AY1, xl, AY2, { w: 2.5, stroke: 'var(--good)' });
    h += K.circle(xl, AY1, 7, { fill: 'var(--blue)', stroke: '#fff', w: 2 }) + K.circle(xr, AY2, 7, { fill: '#b86a00', stroke: '#fff', w: 2 });
    // 联动组里别的台刚做了一步（c.flash，见 js/ui/stage-forms.js）：两个落点从原来的位置移过去，画一段弧和原来的落点
    if (c.flash && !dg) {
      const o = c.flash.s0, cx = (v) => clamp(m.X(v), X0 - 6, X1 + 14);
      let f = '';
      for (const [y, v0, v1] of [[AY1, o.a * m.g + o.b, m.L], [AY2, o.c * m.g + o.d, m.R]]) {
        if (v0 === v1) continue;
        const x0 = cx(v0), x1 = cx(v1), hg = Math.min(26, 8 + Math.abs(x1 - x0) / 4);
        f += K.circle(x0, y, 7, { stroke: 'var(--blue)', w: 2 }) + '<path d="M' + x0 + ' ' + (y + 6) + ' Q' + (x0 + x1) / 2 + ' ' + (y + 6 + hg) + ' ' + x1 + ' ' + (y + 6) + '" fill="none" stroke="var(--blue)" stroke-width="2.5" stroke-dasharray="5 3"/>';
      }
      h += K.flash(c.flash, f);
    }
    // 说一句
    let tx = say.tx, fill = say.good ? 'var(--good)' : 'var(--ink)';
    if (dg && dg.k) { tx = dg.both ? '两边都少跳 ' + dg.k + '：两个落点一起往左 ' + dg.k + '，差不变' : '只这一边少跳 ' + dg.k + '：另一个落点不动'; fill = dg.both ? 'var(--blue)' : 'var(--bad)'; }
    h += '<g data-read="1">' + K.text(20, 284, tx, { size: 13, weight: 700, anchor: 'start', fill }) + '</g>';
    // 两边一起动：开 / 关；两边 ÷ n；两边都少跳一下 x
    const by = 298, n = s.a + s.c > 0 ? [s.a, s.b, s.c, s.d].reduce((g, v) => gcd(g, v), 0) : 0;
    h += '<g data-pick-set="' + encodeURIComponent(JSON.stringify({ link: !both })) + '" style="cursor:pointer"><title>' + (both ? '现在两边一起动：拖一个落点，另一个同时走一样远。点一下关掉。' : '现在只动一边：两个落点会分开。点一下打开。') + '</title>' +
      K.rect(20, by, 150, 26, { fill: both ? 'var(--blue)' : '#fff', stroke: 'var(--blue)', r: 13, w: 1.6 }) + K.text(95, by + 17, both ? '两边一起动：开' : '两边一起动：关', { size: 12, weight: 700, fill: both ? '#fff' : 'var(--ink)' }) + '</g>';
    h += eqBtn(182, by, 116, n > 1 ? '两边 ÷ ' + n : '两边 ÷ n', n > 1 ? { qa: s.a / n, qb: s.b / n, qc: s.c / n, qd: s.d / n } : {}, n > 1, n > 1 ? '两边同时除以 ' + n + '：落点和每一下都变成 1/' + n : '四个数没有公因数');
    h += eqBtn(306, by, 170, '两边都少跳一下 x', { qa: s.a - 1, qc: s.c - 1 }, s.a >= 1 && s.c >= 1, '两边同时减 x：各少跳一下');
    h += K.text(20, 346, '拖 g 试一个数；拖一个落点往左：' + (both ? '两边一起少跳（差不变）。' : '只这一边少跳。'), { size: 12, anchor: 'start' });
    return h;
  }
  function gripsEq(c) {
    const p = c.props, m = eqModel(p), out = [];
    out.push({ id: 'g', x: m.X(m.g), y: GY, r: 9, text: 'g', cursor: 'ew-resize', tip: '左右拖：试一个数 g',
      drag: (c0, q) => { const m0 = eqModel(c0.props); return { g: clamp(Math.round(m0.inv(q.x)), 0, m0.G) }; }, say: (c1) => { const m1 = eqModel(c1.props); return 'g = ' + m1.g + '：左边落在 ' + m1.L + '，右边落在 ' + m1.R; } });
    const say = (c1) => { const m1 = eqModel(c1.props); return '左边落在 ' + m1.L + '，右边落在 ' + m1.R; }, tip = linked(p) ? '往左拖：两边一起少跳' : '往左拖：只这一边少跳';
    if (p.qb > 0) out.push({ id: 'L', x: m.X(m.L), y: AY1, r: 10, ghost: true, cursor: 'ew-resize', tip, drag: (c0, q) => eqDrag(c0.props, 'L', q).patch, say });
    if (p.qd > 0) out.push({ id: 'R', x: m.X(m.R), y: AY2, r: 10, ghost: true, cursor: 'ew-resize', tip, drag: (c0, q) => eqDrag(c0.props, 'R', q).patch, say });
    return out;
  }

  function draw(c) {
    if (+c.props.mode === 4) return drawEq(c);
    if (+c.props.mode === 3) return drawJump(c);
    const p = c.props, m = model(p); let s = axis(m);
    if (m.mode === 0) {
      for (let i = 0; i < m.n; i++) {
        const x1 = m.X(m.a + i * m.s), x2 = m.X(m.a + (i + 1) * m.s), r = Math.abs(x2 - x1) / 2, hgt = Math.min(46, 14 + r * 0.9);
        s += '<path d="M' + x1 + ' ' + (AY - 10) + ' Q' + (x1 + x2) / 2 + ' ' + (AY - 10 - hgt * 2) + ' ' + x2 + ' ' + (AY - 10) + '" fill="none" stroke="var(--blue)" stroke-width="2.2"/>';
        if (r >= 9) s += K.text((x1 + x2) / 2, AY - 14 - hgt, (m.s > 0 ? '+' : '−') + Math.abs(m.s), { size: 12, weight: 700, fill: 'var(--blue)' });
      }
      s += K.text(m.X(m.a), AY - 14, '起点', { size: 11 });
      const step = Math.abs(m.s), op = m.s > 0 ? ' + ' : ' − ';
      const eq = m.n === 0 ? sgn(m.a) + '（还没跳）' : m.n === 1 ? sgn(m.a) + op + step + ' = ' + sgn(m.value) : step === 1 ? sgn(m.a) + op + m.n + ' = ' + sgn(m.value) : sgn(m.a) + op + step + ' × ' + m.n + ' = ' + sgn(m.value);
      s += K.text(W / 2, 46, eq, { size: 20, weight: 700 });
      s += K.text(X0 + 30, 232, '每一步跳', { size: 12 }) + pickBtn(X0 + 62, 216, 24, '−', 's', m.s - 1 === 0 ? -1 : Math.max(-10, m.s - 1), '步长减 1（减到负数就是往左跳）') +
        K.text(X0 + 106, 232, sgn(m.s), { size: 15, weight: 700 }) + pickBtn(X0 + 126, 216, 24, '＋', 's', m.s + 1 === 0 ? 1 : Math.min(10, m.s + 1), '步长加 1') +
        K.text(X0 + 300, 232, '跳了 ' + m.n + ' 步，落在 ' + sgn(m.value), { size: 13, weight: 700 });
    } else if (m.mode === 1) {
      if (m.d > 1) for (let i = 0; i <= (m.to - m.from) * m.d; i++) if (i % m.d) s += K.line(m.X(m.from + i / m.d), AY - 4, m.X(m.from + i / m.d), AY + 4, { w: 0.9, stroke: 'var(--blue)' });
      const f = forms(m.value);
      s += K.text(W / 2, 46, c.masked ? '？' : f.join('  =  '), { size: 20, weight: 700 });
      s += K.text(X0 + 44, 232, '每一格切成', { size: 12 }) + pickBtn(X0 + 82, 216, 24, '−', 'd', Math.max(1, m.d - 1), '少切一份') + K.text(X0 + 124, 232, m.d + ' 份', { size: 15, weight: 700 }) + pickBtn(X0 + 150, 216, 24, '＋', 'd', Math.min(12, m.d + 1), '多切一份');
      s += K.text(X0 + 330, 232, '从 ' + sgn(m.from) + ' 往右数了 ' + m.k + ' 小格', { size: 13 });
    } else {
      s += K.line(m.X(m.lo), AY, m.X(m.hi), AY, { w: 7, stroke: 'var(--blue)' });
      const rel = sgn(m.lo) + (m.lc ? ' ≤ ' : ' < ') + 'x' + (m.hc ? ' ≤ ' : ' < ') + sgn(m.hi);
      s += K.text(W / 2, 46, rel, { size: 20, weight: 700 });
      s += pickBtn(clamp(m.X(m.lo) - 26, 4, W - 60), AY + 40, 52, m.lc ? '含' : '不含', 'lc', m.lc ? 0 : 1, '点一下切换：这个端点算不算在里面', !!m.lc) +
        pickBtn(clamp(m.X(m.hi) - 26 + (m.X(m.hi) - m.X(m.lo) < 56 ? 56 : 0), 4, W - 60), AY + 40, 52, m.hc ? '含' : '不含', 'hc', m.hc ? 0 : 1, '点一下切换：这个端点算不算在里面', !!m.hc);
      s += K.text(W / 2, 232, '长度 ' + m.len + '，里面有 ' + m.ints + ' 个整数', { size: 13, weight: 700 });
      // 空心 / 实心端点画在把手下面（把手是透明的一圈）
      s += K.circle(m.X(m.lo), AY, 6, { fill: m.lc ? 'var(--blue)' : '#fff', stroke: 'var(--blue)', w: 2.5 }) + K.circle(m.X(m.hi), AY, 6, { fill: m.hc ? 'var(--blue)' : '#fff', stroke: 'var(--blue)', w: 2.5 });
    }
    return s;
  }

  function grips(c) {
    if (+c.props.mode === 4) return gripsEq(c);
    if (+c.props.mode === 3) return [];   // 最少跳几下：用按钮跳，没有把手
    const m = model(c.props), out = [];
    if (m.mode === 0) {
      out.push({ id: 'a', x: m.X(m.a), y: AY, r: 7, cursor: 'ew-resize', tip: '左右拖：改起点',
        drag: (c0, q) => { const m0 = model(c0.props); return { a: clamp(Math.round(m0.inv(q.x)), m0.from, m0.to) }; }, say: (c1) => '起点 ' + sgn(model(c1.props).a) });
      out.push({ id: 'end', x: m.X(m.value), y: AY - 30, r: 9, text: '跳', cursor: 'ew-resize', tip: '拖我：多跳几步或少跳几步',
        drag: (c0, q) => { const m0 = model(c0.props); return { n: clamp(Math.round((m0.inv(q.x) - m0.a) / m0.s), 0, NMAX) }; },
        say: (c1) => { const m1 = model(c1.props); return '跳 ' + m1.n + ' 步，到 ' + sgn(m1.value); } });
    } else if (m.mode === 1) {
      out.push({ id: 'p', x: m.X(Q.num(m.value)), y: AY, r: 8, cursor: 'ew-resize', tip: '左右拖：把点放到一个刻度上',
        drag: (c0, q) => { const m0 = model(c0.props); return { k: clamp(Math.round((m0.inv(q.x) - m0.from) * m0.d), 0, (m0.to - m0.from) * m0.d) }; },
        say: (c1) => forms(model(c1.props).value)[0] });
    } else {
      out.push({ id: 'lo', x: m.X(m.lo), y: AY, r: 10, ghost: true, cursor: 'ew-resize', tip: '左右拖：左端点',
        drag: (c0, q) => { const m0 = model(c0.props); return { lo: clamp(Math.round(m0.inv(q.x)), m0.from, m0.hi) }; }, say: (c1) => '左端 ' + sgn(model(c1.props).lo) });
      out.push({ id: 'hi', x: m.X(m.hi), y: AY, r: 10, ghost: true, cursor: 'ew-resize', tip: '左右拖：右端点',
        drag: (c0, q) => { const m0 = model(c0.props); return { hi: clamp(Math.round(m0.inv(q.x)), m0.lo, m0.to) }; }, say: (c1) => '右端 ' + sgn(model(c1.props).hi) });
    }
    return out;
  }

  const I = (lo, hi, d, label, o) => Object.assign({ type: 'int', label, default: d, min: lo, max: hi, write: true }, o || {});
  U.registerPack({
    id: 'numlinebench', version: 1,
    types: {
      numlinebench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E1', 'E2'],
        label: '数轴操作台', prefix: '数轴', group: '数与运算', grades: [1, 9],
        alias: ['数轴', '加法', '减法', '乘法', '跳步', '分数', '小数', '负数', '不等式', '区间', '解集'],
        props: {
          mode: { type: 'choice', label: '用来做什么', default: 0, choices: MODES, write: true },
          from: I(-20, 0, 0, '数轴从几开始'), to: I(4, 40, 20, '数轴到几'),
          a: I(-20, 40, 0, '起点'), s: I(-10, 10, 1, '每一步跳几（负数往左）'), n: I(0, NMAX, 0, '跳了几步'),
          d: I(1, 12, 4, '每一格切成几份'), k: I(0, 480, 0, '从左端数第几小格'),
          steps: { type: 'text', label: '最少跳几下：能跳的步长（逗号分开）', default: '3,5', write: true }, jt: I(-10, 40, 23, '最少跳几下：目标'), path: { type: 'text', label: '最少跳几下：跳过的（自动）', default: '', write: true },
          qa: I(0, 10, 2, '两边各走：左边几个 x'), qb: I(0, 60, 3, '两边各走：左边再跳几'), qc: I(0, 10, 0, '两边各走：右边几个 x'), qd: I(0, 60, 11, '两边各走：右边再跳几'),
          g: I(0, 20, 0, '两边各走：试的数 g'), link: { type: 'bool', label: '两边各走：两边一起动', default: true, write: true, hidden: true },
          lo: I(-20, 40, 1, '区间左端'), hi: I(-20, 40, 4, '区间右端'), lc: I(0, 1, 1, '左端含不含（1 含）'), hc: I(0, 1, 1, '右端含不含（1 含）'),
        },
        outputs: {
          value: { dim: null, kind: 'num', label: '落点 / 点的位置' },
          start: { dim: null, kind: 'num', label: '起点' },
          step: { dim: null, kind: 'num', label: '步长' },
          jumps: { dim: null, kind: 'num', label: '跳了几步' },
          lo: { dim: null, kind: 'num', label: '区间左端' },
          hi: { dim: null, kind: 'num', label: '区间右端' },
          ints: { dim: null, kind: 'num', label: '区间里有几个整数' },
          len: { dim: null, kind: 'num', label: '区间的长度' },
          closed: { dim: null, kind: 'num', label: '含的端点个数（0、1、2）' }, arrived: { dim: null, kind: 'num', label: '最少跳几下：到了 1（到了才有）' }, fewest: { dim: null, kind: 'num', label: '最少跳几下：用的次数最少 1' },
          meet: { dim: null, kind: 'num', label: '两边各走：两个落点重合 1，分开 0' }, gv: { dim: null, kind: 'num', label: '两边各走：试的数 g' },
        },
        icon: () => K.line(8, 26, 56, 26, { w: 2 }) + K.line(16, 21, 16, 31, {}) + K.line(32, 21, 32, 31, {}) + K.line(48, 21, 48, 31, {}) + K.circle(32, 26, 4, { fill: 'var(--blue)' }) + '<path d="M16 20 Q24 4 32 20" fill="none" stroke="var(--blue)" stroke-width="1.8"/>',
        size: (e) => [W, e && e.props && +e.props.mode === 4 ? 384 : 290],
        grips,
        compute: (c) => {
          if (+c.props.mode === 4) { const m = eqModel(c.props), z = num(0); return { value: num(m.L), start: z, step: num(m.g), jumps: num(m.s.a), lo: z, hi: z, ints: z, closed: z, len: z, meet: num(eqSay(c.props).meet ? 1 : 0), gv: num(m.g) }; }
          if (+c.props.mode === 3) { const j = jumpModel(c.props), o = { jumps: num(j.path.length), value: num(j.pos) }; if (j.there) { o.arrived = num(1); if (j.path.length === j.best) o.fewest = num(1); } return o; }
          const m = model(c.props), z = num(0);
          if (m.mode === 1) return { value: num(m.value), start: num(m.from), step: z, jumps: z, lo: z, hi: z, ints: z, closed: z, len: z };
          if (m.mode === 2) return { value: z, start: z, step: z, jumps: z, lo: num(m.lo), hi: num(m.hi), ints: num(m.ints), closed: num(m.lc + m.hc), len: num(m.len) };
          return { value: num(m.value), start: num(m.a), step: num(m.s), jumps: num(m.n), lo: z, hi: z, ints: z, closed: z, len: z };
        },
        badge: (c) => { if (+c.props.mode === 4) { const m = eqModel(c.props); return m.L === m.R ? '重合' : '差 ' + Math.abs(m.L - m.R); } if (+c.props.mode === 3) return ''; const m = model(c.props); return m.mode === 2 ? '' : c.masked ? '' : (m.mode === 1 ? forms(m.value)[0] : sgn(m.value)); },
        draw,
      },
    },
  });
  // 联动组（docs/essence-forms.md）：数轴的“两边各走”是等式 a·x + b = c·x + d 的一种样子。不用藏着的 x0（会泄露答案），用孩子拖的 g
  if (U.Forms) U.Forms.adapt('lineq', 'numlinebench', {
    toState: (p) => lq(p),
    fromState: (s, p, step) => Object.assign({ mode: 4, qa: s.a, qb: s.b, qc: s.c, qd: s.d }, step ? {} : { g: 0 }),
    can: (s) => (s.a > 10 || s.c > 10 ? '数轴上每边最多跳 10 下 x' : s.b > 60 || s.d > 60 ? '数轴上再跳最多跳 60' : eqRange(s).to > EQ_TO ? '数轴太长了（最多到 ' + EQ_TO + '）' : null),
  });
  U.NumLineBench = { model, forms, MODES, eqModel, eqRange, eqSay, eqDrag };
})(typeof globalThis !== 'undefined' ? globalThis : window);
