/* 器材包 numlinebench：数轴操作台（docs/instrument-design.md 第 4 节）。一条数轴，三种用法，全部在图上直接拖：
 *   跳步：  拖起点；拖落点——每跳一步是一个“步长”，落点只能停在跳得到的地方。弧线和算式跟着变：3 + 4 × 2 = 11。
 *           步长可以是负的（往左跳，就是减法）；数轴可以从负数开始，所以 2 − 5 = −3 看得见。
 *   找位置：把每一格切成 d 份，拖一个点。它的位置同时写成分数、带分数和小数：5/4 = 1 又 1/4 = 1.25。
 *   区间：  拖两个端点，点端点下面的按钮切换“含 / 不含”。写成不等式 −2 < x ≤ 3，并数出里面有几个整数。
 * 尺寸按数轴的范围（from…to）固定，拖动时不变，所以把手一直跟着鼠标。
 * 这一版的边界（如实写）：数轴范围是整数，最长 40 格；找位置的分母最多 12；没有放大镜（不能一层层放大看更细的刻度）。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', typeof n === 'number' ? Q(n) : n, { dim: null });
  const MODES = ['跳步', '找位置', '区间', '最少跳几下'];
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
  function draw(c) {
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
        },
        icon: () => K.line(8, 26, 56, 26, { w: 2 }) + K.line(16, 21, 16, 31, {}) + K.line(32, 21, 32, 31, {}) + K.line(48, 21, 48, 31, {}) + K.circle(32, 26, 4, { fill: 'var(--blue)' }) + '<path d="M16 20 Q24 4 32 20" fill="none" stroke="var(--blue)" stroke-width="1.8"/>',
        size: () => [W, 290],
        grips,
        compute: (c) => {
          if (+c.props.mode === 3) { const j = jumpModel(c.props), o = { jumps: num(j.path.length), value: num(j.pos) }; if (j.there) { o.arrived = num(1); if (j.path.length === j.best) o.fewest = num(1); } return o; }
          const m = model(c.props), z = num(0);
          if (m.mode === 1) return { value: num(m.value), start: num(m.from), step: z, jumps: z, lo: z, hi: z, ints: z, closed: z, len: z };
          if (m.mode === 2) return { value: z, start: z, step: z, jumps: z, lo: num(m.lo), hi: num(m.hi), ints: num(m.ints), closed: num(m.lc + m.hc), len: num(m.len) };
          return { value: num(m.value), start: num(m.a), step: num(m.s), jumps: num(m.n), lo: z, hi: z, ints: z, closed: z, len: z };
        },
        badge: (c) => { if (+c.props.mode === 3) return ''; const m = model(c.props); return m.mode === 2 ? '' : c.masked ? '' : (m.mode === 1 ? forms(m.value)[0] : sgn(m.value)); },
        draw,
      },
    },
  });
  U.NumLineBench = { model, forms, MODES };
})(typeof globalThis !== 'undefined' ? globalThis : window);
