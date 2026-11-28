/* 器材包 tapebench：线段图（和差倍）。两条线段，上面是甲，下面是乙。
 * 每条线段由“一样长的段”和“多出来的一截”拼成：甲是乙的 3 倍，就是甲 3 段、乙 1 段；甲比乙多 6，就是甲 1 段加一截 6、乙 1 段。
 * 全部在图上直接动手：
 *   - 点线段旁边的 + 和 −：加一段、去一段（搭出“几倍”）。
 *   - 拖第一段的右端：改一段有多长。所有的段一起变长变短，因为它们一样长。
 *   - 右上角写着目标（一共要多少，或者相差要多少）和现在是多少；对上了就标绿。
 *   - 下面“合起来看”把同样长的段排成一排：4 段 = 48，或者 2 段 + 6 = 30。这一行只摆出关系，不替你算。
 * 能做的题：和倍、差倍、和差、年龄问题、“几倍多几”。
 * 和天平、式子连成一组时（等式模式，U.Forms 的 lineq，docs/essence-forms.md）：上面一条是等式左边 a 段 x + 一截 b，下面一条是右边 c 段 x + 一截 d。
 *   一段 x 按藏着的真实值画（真实长短，平的时候两条右端对齐），段上只写 x；没有目标那一行，一段的长不能拖。
 *   拖每条右端那一截的把手往左 k 格：剪掉 k。“两条一起剪：开”时另一条同时剪 k；关掉就只剪这一条（两条对不齐）。
 *   下面的按钮是快捷方式：两条都剪掉 1、两条都剪掉一段 x、两条都平分成 n 份留一份。
 * 这一版的边界（如实写）：只有两条线段；每条最多 12 段；一段的长是 1 到 9999 的整数，多出来的一截 −9999 到 9999（2026-11-27 起；以前 8 段、40、60）；
 *   按真实比例画：最长的一条占满 440 像素，有目标时比例尺也放得下对上目标的线段；一段不到 4 像素也画 4 像素宽，段里写不下的数写在线段上面；
 *   一像素不到一个单位时，拖一段的长度按 2、5、10……取整，旁边出 ±1、±10 微调按钮。多出来的一截由出题人给，学生不能拖；“几倍少几”的少的那一截画成从最后一段里剪掉的虚线框。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 700, X0 = 84, SPAN = 440, YA = 92, YB = 152, BH = 28, KMAX = 12, UMAX = 9999, EMAX = 9999, MINSEG = 4;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  function model(p) {
    const ka = clamp(p.ka, 0, KMAX), kb = clamp(p.kb, 0, KMAX), u = clamp(p.u, 1, UMAX), ea = clamp(p.ea, -EMAX, EMAX), eb = clamp(p.eb, -EMAX, EMAX);
    const a = ka * u + ea, b = kb * u + eb, sum = a + b, diff = Math.abs(a - b), tk = p.tk, tv = p.tv;
    const cur = tk === 0 ? sum : tk === 1 ? diff : null, hit = cur !== null && cur === tv ? 1 : 0;
    return { ka, kb, u, ea, eb, a, b, sum, diff, tk, tv, cur, hit };
  }
  // 按真实比例画（2026-11-27）：长短和数成比例；一段太短（不到 MINSEG 像素）也画 MINSEG 宽，数写在上面。
  // 有目标（一共 / 相差）时，比例尺也要放得下“对上目标”时的线段，所以拖一段的长度时比例尺不变、拖得到（不露答案：只影响比例尺）
  const pw = (v, sc) => (v > 0 ? Math.max(v * sc, MINSEG) : 0);
  const barPx = (m, sc, k, e) => k * pw(m.u, sc) + pw(Math.max(e, 0), sc);
  function need(m) {
    let u = 0;
    if (m.tk === 0 && m.ka + m.kb > 0) u = (m.tv - m.ea - m.eb) / (m.ka + m.kb);
    else if (m.tk === 1 && m.ka !== m.kb) { const D = m.ka - m.kb, e = m.ea - m.eb; u = Math.max((m.tv - e) / D, (-m.tv - e) / D); }
    return u > 0 ? Math.max(m.ka * u + Math.max(m.ea, 0), m.kb * u + Math.max(m.eb, 0)) : 0;
  }
  function scaleOf(m) {   // 少的一截是从整段里剪掉的，整段要画得下
    let sc = Math.min(14, SPAN / Math.max(m.ka * m.u + Math.max(m.ea, 0), m.kb * m.u + Math.max(m.eb, 0), m.a, m.b, need(m) * 1.1, 1));
    for (let i = 0; i < 6; i++) { const px = Math.max(barPx(m, sc, m.ka, m.ea), barPx(m, sc, m.kb, m.eb)); if (px <= SPAN + 0.5) break; sc *= Math.max(0.5, (SPAN - 2 * MINSEG) / px); }
    return sc;
  }
  // 拖一段的长度时取整的步长：比例尺小于 1 像素一个单位时，按 2、5、10……取整（再用旁边的 ±1、±10 微调）
  const grainOf = (sc) => (sc >= 1 ? 1 : K.big.grain(sc, 3));
  const eqm = (p) => p.eqm === true || p.eqm === 1;
  const cut2 = (p) => p.cut2 !== false && p.cut2 !== 0;
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  function plan(p0, gid, q) {
    const m0 = model(p0), sc = scaleOf(m0);
    if (gid === 'u') return { patch: { u: clamp(K.big.snap((q.x - X0) / sc, grainOf(sc)), 1, UMAX) }, sc };
    // 等式模式：拖一条右端那一截往左 k 格 = 剪掉 k（两条一起剪时另一条也剪 k，另一条不够剪就剪到它没有为止）
    if (gid === 'cb' || gid === 'cd') {
      const top = gid === 'cb', k0 = top ? m0.ka : m0.kb, e = top ? m0.ea : m0.eb, o = top ? m0.eb : m0.ea, both = cut2(p0);
      let k = clamp(Math.round((X0 + barPx(m0, sc, k0, e) - q.x) / sc), 0, Math.max(0, e));
      if (both) k = Math.min(k, Math.max(0, o));
      const patch = top ? { ea: e - k } : { eb: e - k };
      if (both) Object.assign(patch, top ? { eb: o - k } : { ea: o - k });
      return { patch, sc, k, both };
    }
    return { patch: {}, sc };
  }
  const fitW = (tx) => Math.max(20, String(tx).length * 7 + 4);   // 段里写得下这个数要多宽
  const seg = (x, y, w, tx, kind) => K.rect(x, y, w, BH, { fill: kind === 'x' ? '#fde9d2' : '#cfe0f5', stroke: 'var(--ink)', r: 2, w: 1.4 }) + (w >= fitW(tx) && tx ? K.text(x + w / 2, y + BH / 2 + 5, tx, { size: 12, weight: 700 }) : '');
  const pm = (x, y, label, patch, on, tip) => '<g' + (on ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' opacity="0.35"') + '><title>' + K.esc(tip) + '</title>' +
    K.circle(x, y, 10, { fill: '#fff', stroke: on ? 'var(--blue)' : '#8a94a8', w: 1.5 }) + K.text(x, y + 5, label, { size: 15, weight: 700 }) + '</g>';

  const btn = (x, y, w, label, patch, on, tip) => '<g' + (on ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' opacity="0.4"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 26, { fill: '#fff', stroke: on ? 'var(--blue)' : '#8a94a8', r: 8, w: 1.6 }) + K.text(x + w / 2, y + 17, label, { size: 12, weight: 700 }) + '</g>';
  const lqOf = (m) => ({ a: m.ka, b: m.ea, c: m.kb, d: m.eb, x0: m.u });
  const sideTx = (k, e) => (k ? k + ' 段 x' : '') + (e ? (k ? ' 和一截 ' : '一截 ') + e : '') + (!k && !e ? '0' : '');
  // 等式模式（联动组里）：段上写 x 不写数；没有目标那一行；一段的长不能拖；拖右端剪掉一截
  function drawEq(c) {
    const p = c.props, m = model(p), na = p.na || '左边', nb = p.nb || '右边', both = cut2(p);
    const dg = c.drag ? plan(c.drag.p0, c.drag.grip, c.drag) : null, sc = dg ? dg.sc : scaleOf(m), m0 = c.drag ? model(c.drag.p0) : null;
    const ok = m.a === m.b, sol = U.Forms.LQ.solved(lqOf(m));
    let s = '';
    const bar = (y, k, e, k0, e0, name) => {
      let x = X0, h = K.text(X0 - 12, y + BH / 2 + 5, name, { size: 14, weight: 700, anchor: 'end' });
      for (let i = 0; i < k; i++) { h += seg(x, y, pw(m.u, sc), 'x', 'u'); x += pw(m.u, sc); }
      if (e > 0) { h += seg(x, y, pw(e, sc), String(e), 'x'); x += pw(e, sc); }
      if (!k && e <= 0) h += K.text(X0 + 6, y + BH / 2 + 5, '0', { size: 12, anchor: 'start', fill: '#8a94a8' });
      if (m0) {   // 正在拖：剪掉的那一截画成虚线框，看得见变短了多少
        const end0 = X0 + barPx(m0, sc, k0, e0);
        if (end0 > x + 0.5) h += '<rect data-cut="1" x="' + x + '" y="' + (y - 3) + '" width="' + (end0 - x) + '" height="' + (BH + 6) + '" fill="none" stroke="var(--blue)" stroke-dasharray="4 3" stroke-width="1.6"/>' + K.text((x + end0) / 2, y - 7, '剪掉 ' + Math.round((end0 - x) / sc), { size: 11, weight: 700, fill: 'var(--blue)' });
      }
      return { h, end: x };
    };
    const A = bar(YA, m.ka, m.ea, m0 ? m0.ka : 0, m0 ? m0.ea : 0, na), B = bar(YB, m.kb, m.eb, m0 ? m0.kb : 0, m0 ? m0.eb : 0, nb);
    s += A.h + B.h;
    // 联动组里别的台刚做了一步（c.flash，见 js/ui/stage-forms.js）：剪掉的那一截画虚线框，接上的那一截画亮框
    if (c.flash && !m0) {
      const o = c.flash.s0, end0 = (k, e) => Math.min(W - 6, X0 + barPx(m, sc, k, e));
      let f = '';
      for (const [y, x1, x0] of [[YA, A.end, end0(o.a, o.b)], [YB, B.end, end0(o.c, o.d)]]) {
        if (x0 > x1 + 0.5) f += K.rect(x1, y - 3, x0 - x1, BH + 6, { stroke: 'var(--blue)', r: 2, w: 1.8, dash: '4 3' }) + K.text((x1 + x0) / 2, y - 7, '剪掉', { size: 11, weight: 700, fill: 'var(--blue)' });
        else if (x1 > x0 + 0.5) f += K.rect(x0, y - 3, x1 - x0, BH + 6, { stroke: 'var(--blue)', r: 2, w: 3 });
      }
      s += K.flash(c.flash, f);
    }
    // 对不齐：差的那一截。两边 x 的段数一样时差多少看得出来；不一样时差多少要用到 x 的真实值，不写数（不泄露答案）
    if (!ok) { const lo = Math.min(A.end, B.end), hi = Math.max(A.end, B.end), y = m.a > m.b ? YB : YA; s += '<g data-gap="1">' + '<rect x="' + lo + '" y="' + (y + 4) + '" width="' + (hi - lo) + '" height="' + (BH - 8) + '" fill="#fde2e0" fill-opacity="0.6" stroke="var(--bad)" stroke-dasharray="4 3"/>' + K.text(hi - lo >= 34 ? (lo + hi) / 2 : hi + 4, y + BH / 2 + 4, m.ka === m.kb ? '差 ' + m.diff : '差一截', { size: 11, weight: 700, fill: 'var(--bad)', anchor: hi - lo >= 34 ? 'middle' : 'start' }) + '</g>'; }
    s += K.text(20, 28, na + '：' + sideTx(m.ka, m.ea) + '　' + nb + '：' + sideTx(m.kb, m.eb) + '　每一段 x 一样长', { size: 14, weight: 700, anchor: 'start' });
    let say = '两条一样长：左边 = 右边', fill = 'var(--good)';
    if (dg && dg.k) { say = dg.both ? '两条一起剪掉 ' + dg.k + '：还是一样长' : '只剪这一条：两条要对不齐了'; fill = dg.both ? 'var(--blue)' : 'var(--bad)'; }
    else if (!ok) { say = '两条不一样长了：只剪了一条。另一条也剪掉同样长，就又对齐了'; fill = 'var(--bad)'; }
    else if (sol !== null) say = '一段 x 和 ' + sol + ' 一样长：x = ' + sol + '，解出来了';
    s += '<g data-read="1">' + K.text(20, 54, say, { size: 13, weight: 700, anchor: 'start', fill }) + '</g>';
    // 两条一起剪：开 / 关；两条一起做的快捷按钮
    const by = 204, n = m.ka + m.kb > 0 ? [m.ka, m.ea, m.kb, m.eb].reduce((g, v) => gcd(g, v), 0) : 0;
    s += '<g data-pick-set="' + encodeURIComponent(JSON.stringify({ cut2: !both })) + '" style="cursor:pointer"><title>' + (both ? '现在两条一起剪：拖一条的右端，另一条同时剪掉一样长。点一下关掉。' : '现在只剪一条：两条会对不齐。点一下打开。') + '</title>' +
      K.rect(20, by, 150, 26, { fill: both ? 'var(--blue)' : '#fff', stroke: 'var(--blue)', r: 13, w: 1.6 }) + K.text(95, by + 17, both ? '两条一起剪：开' : '两条一起剪：关', { size: 12, weight: 700, fill: both ? '#fff' : 'var(--ink)' }) + '</g>';
    s += btn(182, by, 116, '两条都剪掉 1', { ea: m.ea - 1, eb: m.eb - 1 }, m.ea >= 1 && m.eb >= 1, '两条右端各剪掉 1：还一样长');
    s += btn(306, by, 150, '两条都剪掉一段 x', { ka: m.ka - 1, kb: m.kb - 1 }, m.ka >= 1 && m.kb >= 1, '两条各剪掉一段 x：还一样长');
    s += btn(464, by, 216, n > 1 ? '两条都平分成 ' + n + ' 份留一份' : '两条都平分成几份留一份', n > 1 ? { ka: m.ka / n, ea: m.ea / n, kb: m.kb / n, eb: m.eb / n } : {}, n > 1, n > 1 ? '两条都平分成 ' + n + ' 份，各留一份：还一样长' : '段数和那一截没有公因数，平分不成整数');
    s += K.text(20, 256, '拖每条右端的蓝色把手往左：剪掉一截。' + (both ? '两条一起剪开着：另一条同时剪掉一样长。' : '两条一起剪关着：只剪这一条。'), { size: 12, anchor: 'start' });
    return s;
  }

  function draw(c) {
    if (eqm(c.props)) return drawEq(c);
    const p = c.props, m = model(p), un = p.unit || '', na = p.na || '甲', nb = p.nb || '乙';
    const sc = c.drag ? plan(c.drag.p0, c.drag.grip, c.drag).sc : scaleOf(m);   // 拖的时候比例尺不变，线段才是真的在变长
    let s = '';
    const bar = (y, k, e, tot, name, key) => {
      let x = X0, h = K.text(X0 - 12, y + BH / 2 + 5, name, { size: 14, weight: 700, anchor: 'end' });
      const wu = pw(m.u, sc);
      for (let i = 0; i < k; i++) { h += seg(x, y, wu, c.masked ? '' : String(m.u), 'u'); x += wu; }
      // 段太窄写不下数：数写在线段上面（一条只写一次）
      if (k && !c.masked && wu < fitW(String(m.u))) h += K.text(X0 + wu / 2, y - 5, '每段 ' + m.u, { size: 11, weight: 700, anchor: 'start', fill: '#3b6fb0' });
      if (e > 0) { const we = pw(e, sc); h += seg(x, y, we, String(e), 'x'); if (we < fitW(String(e))) h += K.text(x + we / 2, y + BH + 13, '+' + e, { size: 11, weight: 700, fill: '#a85410' }); x += we; }
      if (e < 0) { const w = Math.min(-e * sc, x - X0); x -= w; h += '<rect x="' + x + '" y="' + (y - 3) + '" width="' + w + '" height="' + (BH + 6) + '" fill="#fde2e0" fill-opacity="0.85" stroke="var(--bad)" stroke-dasharray="4 3" stroke-width="1.4"/>' + (w >= 20 ? K.text(x + w / 2, y + BH / 2 + 5, '−' + (-e), { size: 12, weight: 700, fill: 'var(--bad)' }) : ''); }   // 少的那一截：从最后一段里剪掉
      if (!k && !e) h += K.text(X0 + 6, y + BH / 2 + 5, '（空）', { size: 12, anchor: 'start', fill: '#8a94a8' });
      h += K.text(X0 + SPAN + 16, y + BH / 2 + 5, c.masked ? '？' : tot + ' ' + un, { size: 14, weight: 700, anchor: 'start' });
      if (!p.lock) h += pm(W - 62, y + BH / 2, '−', { [key]: k - 1 }, k > 0, name + '：去掉一段') + pm(W - 34, y + BH / 2, '+', { [key]: k + 1 }, k < KMAX, name + '：加一段（和别的段一样长）');
      return { h, end: x };
    };
    const A = bar(YA, m.ka, m.ea, m.a, na, 'ka'), B = bar(YB, m.kb, m.eb, m.b, nb, 'kb');
    s += A.h + B.h;
    // 相差的那一截：两条线段右端之间
    if (m.a !== m.b) { const lo = Math.min(A.end, B.end), hi = Math.max(A.end, B.end), y = m.a > m.b ? YB : YA; s += K.line(lo, y + 4, lo, y + BH - 4, { w: 1, dash: '3 3' }) + '<rect x="' + lo + '" y="' + (y + 4) + '" width="' + (hi - lo) + '" height="' + (BH - 8) + '" fill="none" stroke="#8a94a8" stroke-dasharray="4 3"/>' + (hi - lo >= 34 && !c.masked ? K.text((lo + hi) / 2, y + BH / 2 + 4, '差 ' + m.diff, { size: 11, fill: '#5a6478' }) : ''); }
    // 目标和现在
    s += K.text(20, 28, na + ' ' + (m.ka ? m.ka + ' 段' : '') + (m.ea > 0 ? (m.ka ? ' + ' : '') + m.ea : m.ea < 0 ? ' − ' + (-m.ea) : '') + (!m.ka && !m.ea ? '0' : '') + '，' + nb + ' ' + (m.kb ? m.kb + ' 段' : '') + (m.eb > 0 ? (m.kb ? ' + ' : '') + m.eb : m.eb < 0 ? ' − ' + (-m.eb) : '') + (!m.kb && !m.eb ? '0' : '') + '　每一段一样长', { size: 14, weight: 700, anchor: 'start' });
    if (m.tk === 0 || m.tk === 1) {
      const nm = m.tk === 0 ? '一共' : '相差';
      s += K.text(20, 52, nm + '要 ' + m.tv + ' ' + un + '　现在' + nm + ' ' + (c.masked ? '？' : m.cur) + (m.hit ? '　对上了！' : ''), { size: 14, weight: 700, anchor: 'start', fill: m.hit ? 'var(--good)' : 'var(--ink)' });
    }
    // 合起来看：同样长的段排成一排
    const kk = m.tk === 1 ? Math.abs(m.ka - m.kb) : m.ka + m.kb, ee = m.tk === 1 ? (m.ka >= m.kb ? m.ea - m.eb : m.eb - m.ea) : m.ea + m.eb, y = 214;
    if (m.tk === 0 || m.tk === 1) {
      s += K.text(20, y + 19, m.tk === 0 ? '合起来看：' : '多出来的：', { size: 13, weight: 700, anchor: 'start' });
      const n = kk + (ee ? 1 : 0), w = n ? Math.min(46, 380 / n) : 0; let x = 100;
      for (let i = 0; i < kk; i++) { s += K.rect(x, y, w - 2, 26, { fill: '#cfe0f5', stroke: 'var(--ink)', r: 2, w: 1.2 }) + K.text(x + w / 2 - 1, y + 18, '段', { size: 11 }); x += w; }
      if (ee) { s += K.rect(x, y, w - 2, 26, { fill: '#fde9d2', stroke: 'var(--ink)', r: 2, w: 1.2 }) + K.text(x + w / 2 - 1, y + 18, (ee < 0 ? '−' : '') + Math.abs(ee), { size: 11, weight: 700 }); x += w; }
      const eq = (kk ? kk + ' 段' : '') + (ee > 0 ? (kk ? ' + ' : '') + ee : ee < 0 ? ' − ' + (-ee) : '') + (!kk && !ee ? '0' : '') + ' = ' + m.tv;
      s += '<g data-rel="1">' + K.text(Math.max(x + 14, 120), y + 19, eq, { size: 15, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
    }
    s += K.text(20, 268, '拖蓝色把手：改一段有多长，所有的段一起变。' + (p.lock ? '' : '点右边的 + 和 −：加一段、去一段。'), { size: 12, anchor: 'start' });
    // 数大了，一像素不到一个单位：拖的时候按 2、5、10……取整，旁边给 ±1、±10 微调
    const gr = grainOf(sc);
    if (gr > 1 && (m.ka || m.kb)) {
      s += K.big.unitNote(20, 290, '数大了，按比例缩小画：拖一下变 ' + gr + '，再点 ±1、±10 微调', 'start');
      s += K.text(W - 226, 291, '一段', { size: 12, weight: 700, anchor: 'start' });
      [['−10', -10], ['−1', -1], ['+1', 1], ['+10', 10]].forEach(([tx, d], i) => { s += btn(W - 192 + i * 38, 272, 34, tx, { u: m.u + d }, m.u + d >= 1 && m.u + d <= UMAX, '一段' + (d > 0 ? '多 ' : '少 ') + Math.abs(d)); });
    }
    return s;
  }
  function grips(c) {
    const p = c.props, m = model(p), sc = scaleOf(m);
    if (eqm(p)) {   // 等式模式：每条右端那一截一个把手，往左拖是剪掉
      const out = [], say = (c1) => U.Forms.LQ.text(lqOf(model(c1.props)));
      const one = (id, y, k, e) => { if (e > 0) out.push({ id, x: X0 + barPx(m, sc, k, e), y: y + BH / 2, shape: 'bar-v', cursor: 'ew-resize', tip: cut2(p) ? '往左拖：两条一起剪掉一截' : '往左拖：只剪这一条', drag: (c0, q) => plan(c0.props, id, q).patch, say }); };
      one('cb', YA, m.ka, m.ea); one('cd', YB, m.kb, m.eb);
      return out;
    }
    if (!m.ka && !m.kb) return [];
    const y = (m.kb ? YB : YA) + BH / 2;
    return [{ id: 'u', x: X0 + pw(m.u, sc), y, shape: 'bar-v', cursor: 'ew-resize', tip: '拖我：改一段有多长',
      drag: (c0, q) => plan(c0.props, 'u', q).patch,
      say: (c1) => { const m1 = model(c1.props); return '一段 ' + m1.u + '：' + (c1.props.na || '甲') + ' ' + m1.a + '，' + (c1.props.nb || '乙') + ' ' + m1.b; } }];
  }
  const I = (lo, hi, d, label, o) => Object.assign({ type: 'int', label, default: d, min: lo, max: hi, write: true }, o || {});
  const T = (d, label, o) => Object.assign({ type: 'text', label, default: d, write: true }, o || {});
  U.registerPack({
    id: 'tapebench', version: 1,
    types: {
      tapebench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E4', 'E7'],
        label: '线段图（和差倍）', prefix: '线段图', group: '关系', grades: [3, 7],
        alias: ['线段图', '和倍', '差倍', '和差', '倍数', '年龄问题', '几倍多几', '画图'],
        props: {
          ka: I(0, KMAX, 3, '甲有几段'), kb: I(0, KMAX, 1, '乙有几段'), u: I(1, UMAX, 5, '一段有多长'),
          ea: I(-EMAX, EMAX, 0, '甲多出来的一截（负数是少的一截）'), eb: I(-EMAX, EMAX, 0, '乙多出来的一截（负数是少的一截）'),
          tk: { type: 'choice', label: '目标是什么', default: 0, choices: ['一共（和）', '相差（差）', '没有目标'], write: true }, tv: I(0, 99999, 48, '目标是多少'),
          na: T('甲', '上面那条叫什么'), nb: T('乙', '下面那条叫什么'), unit: T('', '单位'),
          lock: { type: 'bool', label: '段数已经给好（不显示 + 和 −）', default: false, write: true },
          eqm: { type: 'bool', label: '等式模式（和天平、式子连成一组时自动打开）', default: false, write: true, hidden: true },
          cut2: { type: 'bool', label: '等式模式：两条一起剪', default: true, write: true, hidden: true },
        },
        outputs: {
          a: { dim: null, kind: 'num', label: '甲是多少' }, b: { dim: null, kind: 'num', label: '乙是多少' }, sum: { dim: null, kind: 'num', label: '一共' }, diff: { dim: null, kind: 'num', label: '相差' },
          u: { dim: null, kind: 'num', label: '一段有多长' }, ka: { dim: null, kind: 'num', label: '甲有几段' }, kb: { dim: null, kind: 'num', label: '乙有几段' },
          hit: { dim: null, kind: 'num', label: '和目标对上了：1 是，0 否' },
        },
        icon: () => K.rect(8, 12, 46, 9, { fill: '#cfe0f5', stroke: 'var(--ink)', w: 1.2, r: 1 }) + K.line(23, 12, 23, 21, { w: 1 }) + K.line(38, 12, 38, 21, { w: 1 }) + K.rect(8, 28, 15, 9, { fill: '#cfe0f5', stroke: 'var(--ink)', w: 1.2, r: 1 }),
        size: (e) => { const p = (e && e.props) || {}; let big = false; try { big = !eqm(p) && grainOf(scaleOf(model(p))) > 1; } catch (x) { big = false; } return [W, big ? 334 : 320]; },
        grips,
        compute: (c) => { const m = model(c.props); return { a: num(m.a), b: num(m.b), sum: num(m.sum), diff: num(m.diff), u: num(m.u), ka: num(m.ka), kb: num(m.kb), hit: num(m.hit) }; },
        badge: (c) => (eqm(c.props) ? (model(c.props).a === model(c.props).b ? '一样长' : '对不齐') : ''),
        draw,
      },
    },
  });
  // 联动组（docs/essence-forms.md）：线段图是等式 a·x + b = c·x + d 的一种样子。上面一条 = a 段 x + 一截 b，下面一条 = c 段 x + 一截 d；一段 x 的长 = 藏着的 x0
  if (U.Forms) U.Forms.adapt('lineq', 'tapebench', {
    toState: (p) => ({ a: p.ka, b: p.ea, c: p.kb, d: p.eb }),
    fromState: (s) => ({ ka: s.a, ea: s.b, kb: s.c, eb: s.d, u: s.x0, eqm: true, tk: 2, na: '左边', nb: '右边' }),
    can: (s) => (s.a > KMAX || s.c > KMAX ? '线段图每条最多 ' + KMAX + ' 段 x' : s.b > EMAX || s.d > EMAX ? '线段图多出来的一截最多 ' + EMAX : s.x0 < 1 || s.x0 > UMAX ? '线段图一段 x 的长要在 1 到 ' + UMAX + ' 之间' : null),
  });
  U.TapeBench = { model, plan, scaleOf };
})(typeof globalThis !== 'undefined' ? globalThis : window);
