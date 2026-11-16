/* 器材包 chancebench：可能性（抛硬币、掷骰子、摸球、转盘）。点按钮做很多次，看每种结果出现的次数和频率怎么变。
 * 全部在图上直接动手：
 *   - 点“做 1 次”“做 10 次”“做 100 次”：结果一条一条记下来，下面的条形图是每种结果出现了几次。
 *   - 右边的折线是“盯着的那个结果”的频率：次数少时晃得厉害，次数多了稳在一条线附近。
 *   - 点“理论上”：在条形图上画出每种结果“应该”占多少（虚线），折线图上画出理论概率那条线。
 *   - 摸球：点袋子旁边的 + − 改红球、白球的个数；转盘：拖转盘上的分界线改红色那一块的大小。改了以后重新开始数。
 *   - 点一根柱子：改成盯着这个结果。
 *   - 掷骰子的时候点“列出所有情况”：两个骰子的 36 种（三个骰子的 216 种）一格一格列出来，点数和等于你选的数的那几格亮起来，写出“几种 / 一共几种”。
 *     这和做很多次的频率是同一个数：频率越做越靠近它。
 * 结果是用“种子 + 第几次”算出来的伪随机数：同样的种子、同样的次数，结果永远一样（方便检查和撤销）。“换一批”换种子。
 * 这一版的边界（如实写）：最多做 2000 次；骰子最多两个（看点数和）；摸球是放回的；转盘只有红、蓝两块。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null }), qv = (q) => U.val('num', q, { dim: null });
  const W = 700, NMAX = 2000, CX0 = 40, CX1 = 400, CB = 300, CT = 150, LX0 = 440, LX1 = 680, LB = 300, LT = 150;
  const on = (v) => v === true || v === 1;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? +v : lo));
  const MODES = ['抛硬币', '掷两个骰子', '摸球', '转盘', '掷三个骰子'];
  // 伪随机：mulberry32，种子和第几次一起决定
  const rnd = (seed, i) => { let t = (seed * 2654435761 + i * 40503 + 0x6D2B79F5) >>> 0; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  function model(p) {
    const mode = clamp(p.mode, 0, 4), n = clamp(p.n, 0, NMAX), seed = clamp(p.seed, 1, 9999);
    const red = clamp(p.red, 0, 12), white = clamp(p.white, 0, 12), deg = clamp(p.deg, 10, 350);
    let outs, pr, roll;
    if (mode === 0) { outs = ['正面', '反面']; pr = [Q(1, 2), Q(1, 2)]; roll = (i) => (rnd(seed, i) < 0.5 ? 0 : 1); }
    else if (mode === 1) { outs = []; pr = []; for (let s = 2; s <= 12; s++) { outs.push(String(s)); pr.push(Q(6 - Math.abs(s - 7), 36)); } roll = (i) => Math.floor(rnd(seed, 2 * i) * 6) + Math.floor(rnd(seed, 2 * i + 1) * 6); }
    else if (mode === 2) { const tot = Math.max(1, red + white); outs = ['红球', '白球']; pr = [Q(red, tot), Q(white, tot)]; roll = (i) => (rnd(seed, i) * tot < red ? 0 : 1); }
    else if (mode === 4) { outs = []; pr = []; const w = Array(19).fill(0); for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) for (let c = 1; c <= 6; c++) w[a + b + c]++; for (let s = 3; s <= 18; s++) { outs.push(String(s)); pr.push(Q(w[s], 216)); } roll = (i) => Math.floor(rnd(seed, 3 * i) * 6) + Math.floor(rnd(seed, 3 * i + 1) * 6) + Math.floor(rnd(seed, 3 * i + 2) * 6); }
    else { outs = ['红色', '蓝色']; pr = [Q(deg, 360), Q(360 - deg, 360)]; roll = (i) => (rnd(seed, i) * 360 < deg ? 0 : 1); }
    const k = clamp(p.target, 0, outs.length - 1), cnt = outs.map(() => 0), path = []; let sum = 0;
    const every = Math.max(1, Math.ceil(n / 120));
    for (let i = 0; i < n; i++) { const r = roll(i); cnt[r]++; sum += mode === 1 ? r + 2 : mode === 4 ? r + 3 : r; if ((i + 1) % every === 0 || i === n - 1) path.push([i + 1, cnt[k] / (i + 1)]); }
    const last = n ? outs[roll(n - 1)] : null, top = n ? cnt.indexOf(Math.max.apply(null, cnt)) : -1;
    return { mode, n, seed, red, white, deg, outs, pr, cnt, k, path, last, top, freq: n ? Q(cnt[k], n) : null, mean: n ? Q(mode === 1 || mode === 4 ? sum : 0, n) : null, ...listing(p, mode) };
  }
  // 列出所有情况：骰子个数 d（2 或 3），点数和等于 sv 的有几种
  function listing(p, mode) {
    const dice = mode === 1 ? 2 : mode === 4 ? 3 : 0; if (!dice) return { dice: 0 };
    const sv = clamp(p.sumv, 2, 19), all = Math.pow(6, dice); let ways = 0;
    if (dice === 2) { for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (a + b === sv) ways++; }
    else for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) for (let c = 1; c <= 6; c++) if (a + b + c === sv) ways++;
    return { dice, sv, all, ways, list: p.list === true || p.list === 1 };
  }
  const fmt = (q) => { const v = Q.num(q); return Number.isInteger(v) ? String(v) : (Math.round(v * 1000) / 1000).toString(); };
  const btn = (x, y, w, label, patch, active, enabled, tip) => '<g' + (enabled ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' data-off="1"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 26, { fill: active ? 'var(--blue)' : enabled ? '#fff' : '#f1f3f6', stroke: enabled ? 'var(--blue)' : '#b8c0cc', r: 8, w: 1.5 }) + K.text(x + w / 2, y + 17, label, { size: 12, weight: 700, fill: active ? '#fff' : enabled ? 'var(--ink)' : '#5f6773' }) + '</g>';   // 不能点：灰底、深灰字（不用透明度，字的对比度够）
  const SPIN = { x: 600, y: 74, r: 46 };
  const ang = (d) => (d - 90) * Math.PI / 180;

  function draw(c) {
    const p = c.props, m = model(p), sp = on(p.showp); let s = '';
    s += K.text(20, 26, MODES[m.mode] + '：做了 ' + m.n + ' 次' + (m.last ? '，最后一次是“' + m.last + '”' : ''), { size: 15, weight: 700, anchor: 'start' });
    s += btn(20, 40, 76, '做 1 次', { n: m.n + 1 }, false, m.n < NMAX, '再做一次');
    s += btn(102, 40, 82, '做 10 次', { n: Math.min(NMAX, m.n + 10) }, false, m.n < NMAX, '再做 10 次');
    s += btn(190, 40, 90, '做 100 次', { n: Math.min(NMAX, m.n + 100) }, false, m.n < NMAX, '再做 100 次');
    s += btn(286, 40, 72, '清零', { n: 0 }, false, m.n > 0, '从头开始数');
    s += btn(364, 40, 72, '换一批', { n: 0, seed: (m.seed * 7 + 13) % 9973 + 1 }, false, true, '换一组随机数，从头开始');
    s += btn(20, 74, 96, '理论上', { showp: !sp }, sp, true, '画出每种结果“应该”占多少');
    // 摸球：袋子和 + −；转盘：画转盘
    if (m.mode === 2) {
      s += K.text(130, 92, '袋子里：', { size: 12, anchor: 'start' });
      const pm = (x, label, patch, en, tip) => btn(x, 76, 26, label, patch, false, en, tip);
      s += K.text(186, 92, '红 ' + m.red, { size: 13, weight: 700, anchor: 'start', fill: '#c0392b' }) + pm(222, '−', { red: m.red - 1, n: 0 }, m.red > 0, '少一个红球') + pm(250, '+', { red: m.red + 1, n: 0 }, m.red < 12, '多一个红球');
      s += K.text(290, 92, '白 ' + m.white, { size: 13, weight: 700, anchor: 'start' }) + pm(326, '−', { white: m.white - 1, n: 0 }, m.white > 0, '少一个白球') + pm(354, '+', { white: m.white + 1, n: 0 }, m.white < 12, '多一个白球');
      for (let i = 0; i < m.red + m.white; i++) s += K.circle(400 + (i % 8) * 13, 80 + Math.floor(i / 8) * 13, 5, { fill: i < m.red ? '#e57373' : '#fff', stroke: 'var(--ink)', w: 1 });
    }
    if (m.mode === 3) {
      const a = ang(m.deg), x2 = SPIN.x + SPIN.r * Math.cos(a), y2 = SPIN.y + SPIN.r * Math.sin(a), big = m.deg > 180 ? 1 : 0;
      s += K.circle(SPIN.x, SPIN.y, SPIN.r, { fill: '#9fb7d9', stroke: 'var(--ink)', w: 1.4 });
      s += '<path d="M' + SPIN.x + ' ' + SPIN.y + ' L' + SPIN.x + ' ' + (SPIN.y - SPIN.r) + ' A' + SPIN.r + ' ' + SPIN.r + ' 0 ' + big + ' 1 ' + x2.toFixed(1) + ' ' + y2.toFixed(1) + ' Z" fill="#e57373" stroke="var(--ink)" stroke-width="1.2"/>';
      s += K.text(SPIN.x - SPIN.r - 8, SPIN.y + 4, '红 ' + m.deg + '°', { size: 11, weight: 700, anchor: 'end', fill: '#c0392b' });
    }
    // 列出所有情况（骰子）：替换左边的条形图
    if (m.dice) {
      s += btn(122, 74, 124, m.list ? '收起所有情况' : '列出所有情况', { list: !m.list }, m.list, true, '把所有可能的结果一个一个列出来');
      s += K.text(256, 92, '和是', { size: 12, anchor: 'start' }) + btn(284, 76, 24, '−', { sumv: m.sv - 1 }, false, m.sv > 2, '小一点') + K.text(324, 93, String(m.sv), { size: 14, weight: 700 }) + btn(340, 76, 24, '+', { sumv: m.sv + 1 }, false, m.sv < 19, '大一点');
      s += btn(372, 76, 92, m.dice === 2 ? '换成三个骰子' : '换成两个骰子', { mode: m.dice === 2 ? 4 : 1, n: 0, target: 0 }, false, true, '换骰子的个数，从头开始');
    }
    if (m.dice && m.list) {
      s += '<g data-list="1">' + K.text(CX0, CT - 22, '全部 ' + m.all + ' 种，和是 ' + m.sv + ' 的有 ' + m.ways + ' 种：' + m.ways + '/' + m.all + (m.ways ? ' = ' + U.Q.show(Q(m.ways, m.all)) : ' = 0（不可能）'), { size: 13, weight: 700, anchor: 'start', fill: m.ways ? 'var(--blue)' : 'var(--bad)' }) + '</g>';
      if (m.dice === 2) {
        const c = 22; for (let a = 1; a <= 6; a++) { s += K.text(CX0 + 16 + a * c - c / 2, CT + 4, String(a), { size: 10, weight: 700, fill: '#5a6478' }); s += K.text(CX0 + 8, CT + 8 + a * c - 4, String(a), { size: 10, weight: 700, fill: '#5a6478' }); }
        for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) { const hot = a + b === m.sv, x = CX0 + 16 + (b - 1) * c, y = CT + 8 + (a - 1) * c; s += '<rect' + (hot ? ' data-way="1"' : '') + ' x="' + x + '" y="' + y + '" width="' + (c - 2) + '" height="' + (c - 2) + '" rx="3" fill="' + (hot ? '#f5a25d' : '#eef3fb') + '" stroke="var(--ink)" stroke-width="0.8"/>' + K.text(x + c / 2 - 1, y + c / 2 + 3, String(a + b), { size: 10, weight: hot ? 700 : 400 }); }
        s += K.text(CX0 + 200, CT + 60, '每一格是（第一个，第二个）', { size: 11, anchor: 'start', fill: '#5a6478' }) + K.text(CX0 + 200, CT + 80, '一共 6 × 6 = 36 格', { size: 11, anchor: 'start', fill: '#5a6478' });
      } else {
        const c = 9; for (let a = 1; a <= 6; a++) { const gx = CX0 + (a - 1) * 60, gy = CT + 6; s += K.text(gx + 27, gy - 2, '第一个是 ' + a, { size: 9, fill: '#5a6478' });
          for (let b = 1; b <= 6; b++) for (let cc = 1; cc <= 6; cc++) { const hot = a + b + cc === m.sv; s += '<rect' + (hot ? ' data-way="1"' : '') + ' x="' + (gx + (cc - 1) * c) + '" y="' + (gy + 4 + (b - 1) * c) + '" width="' + (c - 1) + '" height="' + (c - 1) + '" fill="' + (hot ? '#f5a25d' : '#eef3fb') + '" stroke="#8a94a8" stroke-width="0.4"/>'; } }
        s += K.text(CX0, CT + 84, '一共 6 × 6 × 6 = 216 种', { size: 11, anchor: 'start', fill: '#5a6478' });
      }
    } else {
    // 条形图：每种结果出现了几次（理论值画成虚线）
    const nb = m.outs.length, slot = (CX1 - CX0) / nb, bw = Math.min(40, slot * 0.7), cmax = Math.max(1, ...m.cnt, ...(sp ? m.pr.map((q) => Q.num(q) * m.n) : []));
    s += K.line(CX0 - 4, CB, CX1, CB, { w: 2 }) + K.text(CX0, CT - 10, '每种出现了几次（点一根柱子：盯着它）', { size: 11, anchor: 'start', fill: '#5a6478' });
    m.outs.forEach((o, i) => {
      const x = CX0 + i * slot + (slot - bw) / 2, h = (m.cnt[i] / cmax) * (CB - CT), hot = i === m.k;
      s += '<g data-pick-set="' + encodeURIComponent(JSON.stringify({ target: i })) + '" style="cursor:pointer"><title>盯着“' + K.esc(o) + '”</title>' +
        '<rect x="' + (x - 2) + '" y="' + CT + '" width="' + (bw + 4) + '" height="' + (CB - CT + 26) + '" fill="transparent"/>' +
        '<rect data-cbar="' + i + '" x="' + x + '" y="' + (CB - h) + '" width="' + bw + '" height="' + h + '" fill="' + (hot ? '#f5a25d' : '#9fb7d9') + '" stroke="var(--ink)" stroke-width="1"/>' +
        K.text(x + bw / 2, CB + 14, o, { size: nb > 6 ? 10 : 11, weight: hot ? 700 : 400 }) + (m.cnt[i] ? K.text(x + bw / 2, CB - h - 4, String(m.cnt[i]), { size: 10 }) : '') + '</g>';
      if (sp && m.n) { const y = CB - (Q.num(m.pr[i]) * m.n / cmax) * (CB - CT); s += K.line(x - 3, y, x + bw + 3, y, { w: 2, stroke: 'var(--good)', dash: '4 3' }); }
    });
    }
    // 折线：盯着的结果的频率
    s += K.line(LX0, LB, LX1, LB, { w: 1.4 }) + K.line(LX0, LT, LX0, LB, { w: 1.4 }) + K.text(LX0, LT - 10, '“' + m.outs[m.k] + '”的频率', { size: 11, anchor: 'start', fill: '#5a6478' }) + K.text(LX0 - 4, LT + 4, '1', { size: 10, anchor: 'end' }) + K.text(LX0 - 4, LB, '0', { size: 10, anchor: 'end' });
    if (m.path.length) { const X = (i) => LX0 + (i / Math.max(m.n, 1)) * (LX1 - LX0), Y = (f) => LB - f * (LB - LT); s += '<path data-freq="1" d="' + m.path.map(([i, f], j) => (j ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(f).toFixed(1)).join(' ') + '" fill="none" stroke="#e07b22" stroke-width="2"/>'; }
    if (sp) { const y = LB - Q.num(m.pr[m.k]) * (LB - LT); s += K.line(LX0, y, LX1, y, { w: 1.6, stroke: 'var(--good)', dash: '6 4' }) + K.text(LX1, y - 4, '理论 ' + U.Q.show(m.pr[m.k]), { size: 11, anchor: 'end', weight: 700, fill: 'var(--good)' }); }
    // 读数
    const lines = [];
    if (m.n) lines.push('“' + m.outs[m.k] + '”出现 ' + m.cnt[m.k] + ' 次，频率 ' + m.cnt[m.k] + '/' + m.n + ' ≈ ' + fmt(m.freq));
    if (m.n && m.dice) lines.push('点数和的平均 ≈ ' + fmt(m.mean) + (sp ? '（理论上是 ' + (m.dice === 2 ? '7' : '10.5') + '）' : ''));
    if (m.n && m.top >= 0) lines.push('出现得最多的是“' + m.outs[m.top] + '”');
    lines.forEach((t, i) => { s += K.text(20, 340 + i * 20, t, { size: 13, weight: i === 0 ? 700 : 400, anchor: 'start' }); });
    return s;
  }
  function grips(c) {
    const m = model(c.props); if (m.mode !== 3) return [];
    const a = ang(m.deg);
    return [{ id: 'deg', x: SPIN.x + SPIN.r * Math.cos(a), y: SPIN.y + SPIN.r * Math.sin(a), r: 8, cursor: 'grab', tip: '拖我：改红色那一块的大小',
      drag: (c0, q) => { let d = Math.atan2(q.y - SPIN.y, q.x - SPIN.x) * 180 / Math.PI + 90; if (d < 0) d += 360; return { deg: clamp(Math.round(d / 10) * 10, 10, 350), n: 0 }; },
      say: (c1) => '红色 ' + c1.props.deg + '°：占 ' + U.Q.show(Q(c1.props.deg, 360)) }];
  }
  const I = (lo, hi, d, label, o) => Object.assign({ type: 'int', label, default: d, min: lo, max: hi, write: true }, o || {});
  U.registerPack({
    id: 'chancebench', version: 1,
    types: {
      chancebench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E9', 'E7'],
        label: '可能性（做很多次）', prefix: '可能性', group: '统计与概率', grades: [4, 9],
        alias: ['可能性', '概率', '频率', '硬币', '骰子', '摸球', '转盘', '随机'],
        props: {
          mode: { type: 'choice', label: '做什么', default: 0, choices: MODES, write: true },
          n: I(0, NMAX, 0, '做了几次'), seed: I(1, 9999, 7, '种子（自动）', { hidden: true }), target: I(0, 10, 0, '盯着第几种结果'),
          red: I(0, 12, 3, '摸球：红球几个'), white: I(0, 12, 1, '摸球：白球几个'), deg: I(10, 350, 90, '转盘：红色占几度'),
          showp: { type: 'bool', label: '显示理论上的值', default: false, write: true },
          list: { type: 'bool', label: '掷骰子：列出所有情况', default: false, write: true }, sumv: I(2, 19, 7, '掷骰子：看点数和是几的情况'),
        },
        outputs: {
          n: { dim: null, kind: 'num', label: '做了几次' }, count: { dim: null, kind: 'num', label: '盯着的结果出现了几次' },
          freq: { dim: null, kind: 'num', label: '盯着的结果的频率（做过才有）' }, p: { dim: null, kind: 'num', label: '盯着的结果的理论概率（点开“理论上”才有）' },
          top: { dim: null, kind: 'num', label: '出现得最多的是第几种（从 0 数）' }, mean: { dim: null, kind: 'num', label: '掷骰子：点数和的平均（做过才有）' },
          ways: { dim: null, kind: 'num', label: '列出所有情况时：点数和是那个数的有几种' }, all: { dim: null, kind: 'num', label: '列出所有情况时：一共几种' }, pways: { dim: null, kind: 'num', label: '列出所有情况时：几种 ÷ 一共几种' },
        },
        icon: () => K.rect(10, 12, 18, 18, { fill: '#fff', stroke: 'var(--ink)', w: 1.4, r: 3 }) + K.circle(15, 17, 1.8, { fill: 'var(--ink)' }) + K.circle(23, 25, 1.8, { fill: 'var(--ink)' }) + K.circle(42, 24, 12, { fill: '#9fb7d9', stroke: 'var(--ink)', w: 1.2 }) + '<path d="M42 24 L42 12 A12 12 0 0 1 54 24 Z" fill="#e57373"/>',
        size: () => [W, 424],
        grips,
        compute: (c) => {
          const m = model(c.props), o = { n: num(m.n), count: num(m.cnt[m.k]) };
          if (m.n) { o.freq = qv(m.freq); o.top = num(m.top); if (m.dice) o.mean = qv(m.mean); }
          if (m.dice && m.list) { o.ways = num(m.ways); o.all = num(m.all); o.pways = qv(Q(m.ways, m.all)); }
          if (on(c.props.showp)) o.p = qv(m.pr[m.k]);
          return o;
        },
        badge: () => '',
        draw,
      },
    },
  });
  U.ChanceBench = { model, rnd };
})(typeof globalThis !== 'undefined' ? globalThis : window);
