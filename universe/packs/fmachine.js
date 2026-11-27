/* 器材包 fmachine：函数机和四联动（docs/new-instruments.md 6.5）。
 *   机器：里面藏着一个函数（× 3、× 2 + 1、x² + x + 1……）。学生喂一个数，先猜吐出几，再看（猜对连续 3 次，才有资格写规则）；
 *   觉得知道了就挑一条规则：它和真规则在 0 到 20 的整数上有不一样的地方，系统就喂那个数来区分（只喂 0 和 1 被骗的那种）。
 *   四联动：表格（x = 0 和 x = 1 两行）、图像（一条直线）、式子（y = kx + b）、情境（水箱注水），改任何一个，其余三个跟着变。
 * 和设计文档的差别（如实写）：函数库是固定的 8 条（不是任意式子）；四联动只做一次函数，表格只有 x = 0、x = 1 两行可改；
 * 规则相同的判定在 0–20 的整数上穷举（证据 ①，不是代数恒等）。
 * 全部在卡片上操作（2026-11-26）：点数字卡片喂数 → 出口先盖着，用 −10 / −1 / +1 / +10 调“我猜”，点“看看”揭开；喂过的数自动按大小排成表；
 *   四联动：情境是分段按钮，k、b 和表格 x = 0、x = 1 两格都有 − / +，图上 x = 0、x = 1 的两个点可以上下拖（grips）。孩子用不着属性面板，属性全是 hidden。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', typeof n === 'number' ? Q(n) : n, { dim: null });
  const FN = [
    { say: '× 3', f: (x) => 3 * x }, { say: '× 2 + 1', f: (x) => 2 * x + 1 }, { say: 'x² + x + 1', f: (x) => x * x + x + 1 }, { say: '+ 5', f: (x) => x + 5 },
    { say: '× 2', f: (x) => 2 * x }, { say: '× 3 − 2', f: (x) => 3 * x - 2 }, { say: 'x²', f: (x) => x * x }, { say: '× 2 + 3', f: (x) => 2 * x + 3 },
  ];
  const STORY = ['每分钟注水 k 升，水箱里原来有 b 升（y = 现在的水量）', '每千克 k 元，另收 b 元包装费（y = 一共付多少元）', '每走 1 小时走 k 千米，出发时离家 b 千米（y = 离家多远）'];
  const toks = (s) => String(s || '').split(',').filter(Boolean).map((t) => { const m = t.split(':'); return { x: Number(m[0]), g: Number(m[1]), y: Number(m[2]) }; });
  const same = (a, b) => { for (let x = 0; x <= 20; x++) if (a.f(x) !== b.f(x)) return x; return -1; };
  const sec = (p) => FN[Math.max(0, Math.min(p.secret, FN.length - 1))];
  function onSet(p, k, v) {
    if (p.view === 0 && k === 'gy') {
      const t = String(v).trim(); if (t === '') return null;
      const x = Number(String(p.ex).trim()); if (!/^-?\d+$/.test(String(p.ex).trim()) || Math.abs(x) > 99) return { gy: '', msg: '先写一个要喂的整数（−99 到 99）' };
      const g = Number(t); if (!Number.isFinite(g)) return { gy: '', msg: '猜的结果写成一个数' };
      const y = sec(p).f(x);
      return { tried: p.tried ? p.tried + ',' + x + ':' + g + ':' + y : x + ':' + g + ':' + y, ex: '', gy: '', msg: x + ' 进去，出来 ' + y + (g === y ? '：猜对了' : '（你猜 ' + g + '）'), $guess: { right: g === y, gap: Math.abs(g - y) } };
    }
    if (k === 'k' || k === 'b') { const kk = k === 'k' ? v : p.k, bb = k === 'b' ? v : p.b; return { y0: bb, y1: kk + bb }; }
    if (k === 'y0' || k === 'y1') { const a = k === 'y0' ? v : p.y0, c = k === 'y1' ? v : p.y1; return { b: a, k: c - a }; }
    if (k === 'secret') return { tried: '', hyp: 0, ex: '', gy: '', gv: 0, msg: '' };
    return null;
  }
  function judge(p) {
    const t = toks(p.tried), r = sec(p); let streak = 0; for (let i = t.length - 1; i >= 0 && t[i].g === t[i].y; i--) streak++;
    const o = { tried: t.length, streak, solved: 0, counter: -1, msg: null };
    if (p.hyp >= 1 && p.hyp <= FN.length) {
      const H = FN[p.hyp - 1], bad = t.find((q) => H.f(q.x) !== q.y);
      if (bad) o.msg = '“' + H.say + '”放 ' + bad.x + ' 进去是 ' + H.f(bad.x) + '，可你试过：出来的是 ' + bad.y;
      else { const d = same(H, r); if (d >= 0) { o.counter = d; o.msg = '你试过的都对得上，但喂 ' + d + '：你的规则说 ' + H.f(d) + '，机器说 ' + r.f(d) + '。'; } else if (streak >= 3) { o.solved = 1; o.msg = '猜对了：' + r.say + '。在 0 到 20 的每个整数上都和机器一样（你是靠举例猜出来的）'; } else o.msg = '规则像是对的，但先连续猜对 3 次再说（现在连续 ' + streak + ' 次）'; }
    }
    return o;
  }
  const hit = (H, x, y, w, h, k, v) => H.push('<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="4" fill="transparent" data-pick-k="' + k + '" data-pick-v="' + v + '" style="cursor:pointer"/>');
  // ---- 画：全部在卡片上点、拖（不用属性面板）----
  // 一个按钮：底色 + 字 + 透明的点击区（data-pick-set，一次改几个属性，是一步）；off 时画灰、点不动
  const NUMS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const pset = (o) => ' data-pick-set="' + encodeURIComponent(JSON.stringify(o)) + '" style="cursor:pointer"';
  function pbtn(H, x, y, w, h, label, patch, o) {
    o = o || {}; const on = !!o.on, off = !!o.off, sz = o.size || 12;
    const s = K.rect(x, y, w, h, { fill: on ? 'var(--accent)' : off ? 'var(--card)' : o.fill || 'var(--sel-bg)', stroke: off ? 'var(--dim)' : o.stroke || 'none', w: 0.8, r: o.r === undefined ? 6 : o.r }) +
      K.text(x + w / 2, y + h / 2 + sz * 0.36, label, { size: sz, weight: 700, fill: on ? '#fff' : off ? 'var(--dim)' : 'var(--ink)' });
    if (!off && patch) H.push('<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="5" fill="transparent"' + pset(patch) + (o.tag ? ' data-fm="' + o.tag + '"' : '') + '/>');
    return s;
  }
  // 喂过的数排成表：按输入从小到大，同一个数只留最后一次
  function table(t) { const m = new Map(); t.forEach((q) => m.set(q.x, q)); return [...m.values()].sort((a, b) => a.x - b.x); }
  function drawMachine(c, H) {
    const p = c.props, W = c.w, J = judge(p), t = toks(p.tried), ex = String(p.ex).trim(), has = /^-?\d+$/.test(ex), last = t[t.length - 1];
    const fed = new Set(t.map((q) => q.x));
    let s = K.text(8, 14, '① 点一个数，喂进机器', { size: 11.5, weight: 700, anchor: 'start' });
    NUMS.forEach((n, i) => {
      const x = 8 + i * 28, on = has && Number(ex) === n;
      s += pbtn(H, x, 20, 26, 24, String(n), on ? { ex: '' } : { ex: String(n), gv: n }, { on, fill: fed.has(n) ? '#dfe9f5' : 'var(--sel-bg)', tag: 'n' + n });
      if (fed.has(n) && !on) s += K.circle(x + 13, 47, 2, { fill: 'var(--accent)' });
    });
    // 机器：入口 → 机器 → 出口（出口先盖住）
    s += K.rect(16, 56, 62, 40, { fill: has ? '#fff' : 'var(--card)', stroke: has ? 'var(--accent)' : 'var(--dim)', w: has ? 2 : 1, r: 8 }) + K.text(47, 82, has ? ex : '?', { size: 18, weight: 700, fill: has ? 'var(--ink)' : 'var(--dim)' });
    s += K.text(96, 82, '→', { size: 18 }) + K.rect(112, 52, 116, 48, { fill: 'var(--accent)', r: 10 }) + K.text(170, 74, '函数机', { size: 13, weight: 700, fill: '#fff' }) + K.text(170, 92, has ? '咕噜……' : '等你喂数', { size: 10.5, fill: '#fff' }) + K.text(244, 82, '→', { size: 18 });
    if (has) s += K.rect(262, 56, 96, 40, { fill: '#5a6478', r: 8 }) + K.text(310, 82, '盖着 ?', { size: 14, weight: 700, fill: '#fff' });
    else if (last) s += K.rect(262, 56, 96, 40, { fill: '#fff', stroke: last.g === last.y ? 'var(--good)' : 'var(--bad)', w: 2, r: 8 }) + K.text(310, 82, String(last.y), { size: 18, weight: 700, fill: last.g === last.y ? 'var(--good)' : 'var(--bad)' });
    else s += K.rect(262, 56, 96, 40, { fill: 'var(--card)', stroke: 'var(--dim)', r: 8 }) + K.text(310, 81, '出口', { size: 12, fill: 'var(--dim)' });
    // 先猜：− / + 调，再点“看看”揭开
    const gv = Number(p.gv) || 0;
    s += K.text(8, 126, '② 先猜：', { size: 11.5, weight: 700, anchor: 'start', fill: has ? 'var(--ink)' : 'var(--dim)' });
    s += pbtn(H, 66, 108, 34, 26, '−10', { gv: gv - 10 }, { off: !has, size: 11, tag: 'm10' }) + pbtn(H, 102, 108, 28, 26, '−1', { gv: gv - 1 }, { off: !has, size: 11, tag: 'm1' });
    s += K.rect(132, 108, 54, 26, { fill: '#fff', stroke: has ? 'var(--accent)' : 'var(--dim)', w: has ? 2 : 1, r: 6 }) + K.text(159, 127, has ? String(gv) : '—', { size: 15, weight: 700 });
    s += pbtn(H, 188, 108, 28, 26, '+1', { gv: gv + 1 }, { off: !has, size: 11, tag: 'p1' }) + pbtn(H, 218, 108, 34, 26, '+10', { gv: gv + 10 }, { off: !has, size: 11, tag: 'p10' });
    s += pbtn(H, 262, 108, 96, 26, '看看 ▶', { gy: String(gv) }, { off: !has, on: has, tag: 'look' });
    // 喂过的数自动成表
    const T = table(t).slice(-10), cw = Math.min(32, Math.floor((W - 48) / Math.max(1, T.length)));
    s += K.text(8, 158, '③ 喂过的数（自动排好）：已喂 ' + t.length + ' 个，连续猜对 ' + J.streak + ' 次', { size: 11.5, weight: 700, anchor: 'start' });
    s += K.text(20, 179, '进', { size: 11, fill: 'var(--dim)' }) + K.text(20, 199, '出', { size: 11, fill: 'var(--dim)' });
    if (!T.length) s += K.text(40, 190, '还没喂：上面点一个数', { size: 11, anchor: 'start', fill: 'var(--dim)' });
    T.forEach((q, i) => {
      const x = 32 + i * cw, okk = q.g === q.y;
      s += K.rect(x, 166, cw - 2, 18, { fill: 'var(--sel-bg)', r: 0 }) + K.text(x + cw / 2 - 1, 179, String(q.x), { size: 11, weight: 700 });
      s += K.rect(x, 186, cw - 2, 18, { fill: okk ? '#e3f4e8' : '#fbe4e4', stroke: okk ? 'var(--good)' : 'var(--bad)', w: 1, r: 0 }) + K.text(x + cw / 2 - 1, 199, String(q.y), { size: 11, weight: 700, fill: okk ? 'var(--good)' : 'var(--bad)' });
    });
    if (last) s += K.text(8, 222, '上一个：' + last.x + ' → ' + last.y + (last.g === last.y ? '（猜对了 ✓）' : '（你猜 ' + last.g + '，差 ' + Math.abs(last.g - last.y) + '）'), { size: 11.5, anchor: 'start', weight: 700, fill: last.g === last.y ? 'var(--good)' : 'var(--bad)' });
    // 挑规则
    let y = 246; s += K.text(8, y, '④ 觉得知道了？点一条规则：', { size: 11.5, weight: 700, anchor: 'start' }); y += 8;
    let x = 8; FN.forEach((q, i) => { const wd = q.say.length * 9 + 22; if (x + wd > W - 8) { x = 8; y += 24; } const on = p.hyp === i + 1; s += K.rect(x, y, wd, 20, { fill: on ? 'var(--accent)' : 'var(--sel-bg)', r: 10 }) + K.text(x + wd / 2, y + 14, q.say, { size: 11, weight: on ? 700 : 400, fill: on ? '#fff' : 'var(--ink)' }); hit(H, x, y, wd, 20, 'hyp', on ? 0 : i + 1); x += wd + 5; });
    y += 38; const m = J.msg || (!last && p.msg ? p.msg : '');
    if (m) { const col = J.solved ? 'var(--good)' : 'var(--bad)'; s += K.text(8, y, m.slice(0, 34), { size: 11.5, anchor: 'start', weight: 700, fill: col }); if (m.length > 34) s += K.text(8, y + 16, m.slice(34, 70), { size: 11.5, anchor: 'start', weight: 700, fill: col }); }
    return s;
  }
  // 四联动的图像：x 从 0 到 4，y 的范围固定（−10 到 40），拖点时刻度不跟着跳
  const GY = { lo: -10, hi: 40 };
  const geo = (W) => { const gx = 40, gy = 192, gw = W - 64, gh = 116; return { gx, gy, gw, gh, X: (x) => gx + x / 4 * gw, Y: (y) => gy + gh - (y - GY.lo) / (GY.hi - GY.lo) * gh, Yi: (py) => GY.lo + (gy + gh - py) / gh * (GY.hi - GY.lo) }; };
  const clampN = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  function drawLinked(c, H) {
    const p = c.props, W = c.w; let s = '';
    s += K.text(8, 22, '情境', { size: 11, anchor: 'start', fill: 'var(--dim)' });
    ['水箱注水', '买东西', '走路'].forEach((n, i) => { s += pbtn(H, 40 + i * 92, 6, 88, 24, n, { story: i }, { on: p.story === i, tag: 'story' + i }); });
    s += K.text(8, 48, STORY[p.story], { size: 11, anchor: 'start', fill: 'var(--dim)' });
    const stp = (x, lab, k, val, lo, hi) => {
      const dn = {}, up = {}; dn[k] = Math.max(lo, val - 1); up[k] = Math.min(hi, val + 1);
      s += K.text(x, 75, lab, { size: 11, anchor: 'start', fill: 'var(--dim)' });
      s += pbtn(H, x + 80, 58, 24, 24, '−', dn, { size: 14, off: val <= lo, tag: k + 'm' }) + K.text(x + 122, 76, String(val), { size: 15, weight: 700 }) + pbtn(H, x + 140, 58, 24, 24, '+', up, { size: 14, off: val >= hi, tag: k + 'p' });
    };
    stp(8, 'k（每多 1）', 'k', p.k, -9, 9); stp(196, 'b（x = 0 时）', 'b', p.b, -20, 40);
    s += K.text(8, 106, '式子：y = ' + (p.k === 1 ? '' : p.k === -1 ? '−' : p.k) + 'x ' + (p.b >= 0 ? '+ ' : '− ') + Math.abs(p.b), { size: 13.5, weight: 700, anchor: 'start' });
    // 表格：x = 0、x = 1 两格可以直接 − / +（改表格，k 和 b 跟着变）
    s += K.text(8, 138, '表格', { size: 11, anchor: 'start', fill: 'var(--dim)' });
    let xx = 44;
    for (let x = 0; x <= 4; x++) {
      const wd = x < 2 ? 72 : 48, v = p.k * x + p.b, key = x === 0 ? 'y0' : 'y1';
      s += K.rect(xx, 114, wd, 40, { fill: x < 2 ? 'var(--sel-bg)' : 'var(--card)', stroke: 'var(--dim)', w: 0.8, r: 0 }) + K.text(xx + wd / 2, 127, 'x = ' + x, { size: 10, fill: 'var(--dim)' }) + K.text(xx + wd / 2, 148, String(v), { size: 12.5, weight: 700 });
      if (x < 2) { const dn = {}, up = {}; dn[key] = v - 1; up[key] = v + 1; s += pbtn(H, xx + 3, 133, 16, 18, '−', dn, { size: 11, r: 3, fill: '#fff', tag: key + 'm' }) + pbtn(H, xx + wd - 19, 133, 16, 18, '+', up, { size: 11, r: 3, fill: '#fff', tag: key + 'p' }); }
      xx += wd;
    }
    s += K.text(8, 176, '每多 1，多 ' + p.k + '；x = 0 时，是 ' + p.b + (p.b === 0 ? '（正比例）' : '') + '　图上两个圆点可以上下拖', { size: 11, anchor: 'start' });
    const G2 = geo(W), X = G2.X, Y = G2.Y;
    for (let v = GY.lo; v <= GY.hi; v += 10) s += K.line(G2.gx, Y(v), G2.gx + G2.gw, Y(v), { stroke: v === 0 ? 'var(--dim)' : '#e3e7ee', w: v === 0 ? 1.2 : 0.8 }) + K.text(G2.gx - 4, Y(v) + 4, String(v), { size: 9.5, anchor: 'end', fill: 'var(--dim)' });
    for (let x = 0; x <= 4; x++) s += K.text(X(x), G2.gy + G2.gh + 13, String(x), { size: 9.5, fill: 'var(--dim)' });
    s += K.line(X(0), G2.gy, X(0), G2.gy + G2.gh, { stroke: 'var(--dim)', w: 1.2 });
    // 直线裁到图框里
    const f = (x) => p.k * x + p.b; let a = 0, z = 4;
    if (p.k !== 0) { const xa = (GY.lo - p.b) / p.k, xb = (GY.hi - p.b) / p.k; a = Math.max(0, Math.min(xa, xb)); z = Math.min(4, Math.max(xa, xb)); }
    const mid = f((a + z) / 2);
    if (a < z && mid >= GY.lo && mid <= GY.hi) s += K.line(X(a), Y(f(a)), X(z), Y(f(z)), { stroke: 'var(--accent)', w: 2.5 });
    for (let x = 2; x <= 4; x++) if (f(x) >= GY.lo && f(x) <= GY.hi) s += K.circle(X(x), Y(f(x)), 3.5, { fill: 'var(--accent)' });
    return s;
  }
  // 图上的两个把手：x = 0 的点上下拖改 b，x = 1 的点上下拖改 k（表格、式子一起变）
  function grips(c) {
    const p = c.props; if (p.view !== 1) return [];
    const G2 = geo(c.w), yb = clampN(p.b, GY.lo, GY.hi), y1 = clampN(p.k + p.b, GY.lo, GY.hi);
    return [
      { id: 'b', x: G2.X(0), y: G2.Y(yb), r: 8, cursor: 'ns-resize', tip: '上下拖：x = 0 时的值（b）', ghost: yb !== p.b,
        drag: (c0, q) => { const b = clampN(Math.round(geo(c0.w).Yi(q.y)), -10, 40); return { b, y0: b, y1: c0.props.k + b }; }, say: (c1) => 'x = 0 时 y = ' + c1.props.b + '（b = ' + c1.props.b + '）' },
      { id: 'k1', x: G2.X(1), y: G2.Y(y1), r: 8, cursor: 'ns-resize', tip: '上下拖：x = 1 时的值（直线跟着转，k 变）', ghost: y1 !== p.k + p.b,
        drag: (c0, q) => { const b = c0.props.b, k = clampN(Math.round(geo(c0.w).Yi(q.y)) - b, -9, 9); return { k, y0: b, y1: k + b }; }, say: (c1) => 'x = 1 时 y = ' + (c1.props.k + c1.props.b) + '：每多 1，多 ' + c1.props.k },
    ];
  }
  function draw(c) { const H = []; const s = c.props.view === 0 ? drawMachine(c, H) : drawLinked(c, H); return s + H.join(''); }
  U.registerPack({
    id: 'fmachine', version: 1, needs: [],
    types: {
      fmachine: {
        workspaceRole: 'none', handles: true, compactPorts: true, essence: ['E1', 'E8', 'E12'],
        label: '函数机', prefix: '机', group: '函数', grades: [3, 9], alias: ['函数机', '函数', '规则', '正比例', '一次函数', '四联动', '表格图像式子'],
        props: {
          secret: { hidden: true, type: 'int', label: '机器里的规则（出题人设）', default: 0, min: 0, max: FN.length - 1 },
          view: { hidden: true, type: 'choice', label: '看', default: 0, choices: ['机器', '四联动'] }, story: { hidden: true, type: 'choice', label: '情境', default: 0, choices: ['水箱注水', '买东西', '走路'] },
          ex: { hidden: true, type: 'text', label: '喂的数', default: '' }, gy: { hidden: true, type: 'text', label: '我猜吐出几', default: '' }, gv: { hidden: true, type: 'int', label: '正在猜的数（卡片上 − / + 调）', default: 0, min: -9999, max: 99999 },
          tried: { hidden: true, type: 'text', label: '记录', default: '', write: false }, hyp: { hidden: true, type: 'int', label: '我的规则（第几条）', default: 0, min: 0, max: FN.length }, msg: { hidden: true, type: 'text', label: '提示', default: '', write: false },
          k: { hidden: true, type: 'int', label: 'k（每多 1 多几）', default: 1, min: -999, max: 999 }, b: { hidden: true, type: 'int', label: 'b（x = 0 时）', default: 0, min: -9999, max: 9999 },
          y0: { hidden: true, type: 'int', label: '表格：x = 0 时的 y', default: 0, min: -99999, max: 99999 }, y1: { hidden: true, type: 'int', label: '表格：x = 1 时的 y', default: 1, min: -99999, max: 99999 },
        },
        onSet,
        outputs: {
          tried: { dim: null, kind: 'num', label: '喂了几个' }, streak: { dim: null, kind: 'num', label: '连续猜对几次' }, solved: { dim: null, kind: 'num', label: '规则猜对了（1/0）' },
          counter: { dim: null, kind: 'num', label: '能区分的数（没有是 −1）' }, slope: { dim: null, kind: 'num', label: '斜率 k' }, intercept: { dim: null, kind: 'num', label: 'x = 0 时的值 b' }, direct: { dim: null, kind: 'num', label: '是正比例（1/0）' },
        },
        icon: () => K.rect(10, 18, 44, 28, { fill: 'var(--accent)', r: 6 }) + K.text(32, 38, 'f', { size: 18, weight: 700, fill: '#fff' }),
        size: (c) => (c.props.view === 0 ? [380, 392] : [380, 362]),
        compute: (c) => {
          const J = judge(c.props), p = c.props; c.say(J.solved ? 'ok' : 'info', J.msg || (p.view === 0 ? '喂一个数进去' : 'y = ' + p.k + 'x + ' + p.b));
          return { tried: num(J.tried), streak: num(J.streak), solved: num(J.solved), counter: num(J.counter), slope: num(p.k), intercept: num(p.b), direct: num(p.b === 0 && p.k !== 0 ? 1 : 0) };
        },
        badge: (c) => (c.out.solved && Q.num(c.out.solved.data) ? '猜对了' : ''),
        grips,
        draw,
      },
    },
  });
  U.FMachine = { FN, judge };
})(typeof globalThis !== 'undefined' ? globalThis : window);
