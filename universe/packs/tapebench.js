/* 器材包 tapebench：线段图（和差倍）。两条线段，上面是甲，下面是乙。
 * 每条线段由“一样长的段”和“多出来的一截”拼成：甲是乙的 3 倍，就是甲 3 段、乙 1 段；甲比乙多 6，就是甲 1 段加一截 6、乙 1 段。
 * 全部在图上直接动手：
 *   - 点线段旁边的 + 和 −：加一段、去一段（搭出“几倍”）。
 *   - 拖第一段的右端：改一段有多长。所有的段一起变长变短，因为它们一样长。
 *   - 右上角写着目标（一共要多少，或者相差要多少）和现在是多少；对上了就标绿。
 *   - 下面“合起来看”把同样长的段排成一排：4 段 = 48，或者 2 段 + 6 = 30。这一行只摆出关系，不替你算。
 * 能做的题：和倍、差倍、和差、年龄问题、“几倍多几”。
 * 这一版的边界（如实写）：只有两条线段；每条最多 8 段；一段的长是 1 到 40 的整数；多出来的一截由出题人给，学生不能拖；“几倍少几”的少的那一截画成从最后一段里剪掉的虚线框。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 700, X0 = 84, SPAN = 440, YA = 92, YB = 152, BH = 28, KMAX = 8, UMAX = 40;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  function model(p) {
    const ka = clamp(p.ka, 0, KMAX), kb = clamp(p.kb, 0, KMAX), u = clamp(p.u, 1, UMAX), ea = clamp(p.ea, -60, 60), eb = clamp(p.eb, -60, 60);
    const a = ka * u + ea, b = kb * u + eb, sum = a + b, diff = Math.abs(a - b), tk = p.tk, tv = p.tv;
    const cur = tk === 0 ? sum : tk === 1 ? diff : null, hit = cur !== null && cur === tv ? 1 : 0;
    return { ka, kb, u, ea, eb, a, b, sum, diff, tk, tv, cur, hit };
  }
  const scaleOf = (m) => clamp(SPAN / Math.max(m.ka * m.u + Math.max(m.ea, 0), m.kb * m.u + Math.max(m.eb, 0), m.a, m.b, 1), 1.4, 14);   // 少的一截是从整段里剪掉的，整段要画得下
  function plan(p0, gid, q) {
    const m0 = model(p0), sc = scaleOf(m0);
    if (gid === 'u') return { patch: { u: clamp(Math.round((q.x - X0) / sc), 1, UMAX) }, sc };
    return { patch: {}, sc };
  }
  const seg = (x, y, w, tx, kind) => K.rect(x, y, w, BH, { fill: kind === 'x' ? '#fde9d2' : '#cfe0f5', stroke: 'var(--ink)', r: 2, w: 1.4 }) + (w >= 20 && tx ? K.text(x + w / 2, y + BH / 2 + 5, tx, { size: 12, weight: 700 }) : '');
  const pm = (x, y, label, patch, on, tip) => '<g' + (on ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' opacity="0.35"') + '><title>' + K.esc(tip) + '</title>' +
    K.circle(x, y, 10, { fill: '#fff', stroke: on ? 'var(--blue)' : '#8a94a8', w: 1.5 }) + K.text(x, y + 5, label, { size: 15, weight: 700 }) + '</g>';

  function draw(c) {
    const p = c.props, m = model(p), un = p.unit || '', na = p.na || '甲', nb = p.nb || '乙';
    const sc = c.drag ? plan(c.drag.p0, c.drag.grip, c.drag).sc : scaleOf(m);   // 拖的时候比例尺不变，线段才是真的在变长
    let s = '';
    const bar = (y, k, e, tot, name, key) => {
      let x = X0, h = K.text(X0 - 12, y + BH / 2 + 5, name, { size: 14, weight: 700, anchor: 'end' });
      for (let i = 0; i < k; i++) { h += seg(x, y, m.u * sc, c.masked ? '' : String(m.u), 'u'); x += m.u * sc; }
      if (e > 0) { h += seg(x, y, e * sc, String(e), 'x'); x += e * sc; }
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
    return s;
  }
  function grips(c) {
    const p = c.props, m = model(p), sc = scaleOf(m);
    if (!m.ka && !m.kb) return [];
    const y = (m.kb ? YB : YA) + BH / 2;
    return [{ id: 'u', x: X0 + m.u * sc, y, shape: 'bar-v', cursor: 'ew-resize', tip: '拖我：改一段有多长',
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
          ea: I(-60, 60, 0, '甲多出来的一截（负数是少的一截）'), eb: I(-60, 60, 0, '乙多出来的一截（负数是少的一截）'),
          tk: { type: 'choice', label: '目标是什么', default: 0, choices: ['一共（和）', '相差（差）', '没有目标'], write: true }, tv: I(0, 999, 48, '目标是多少'),
          na: T('甲', '上面那条叫什么'), nb: T('乙', '下面那条叫什么'), unit: T('', '单位'),
          lock: { type: 'bool', label: '段数已经给好（不显示 + 和 −）', default: false, write: true },
        },
        outputs: {
          a: { dim: null, kind: 'num', label: '甲是多少' }, b: { dim: null, kind: 'num', label: '乙是多少' }, sum: { dim: null, kind: 'num', label: '一共' }, diff: { dim: null, kind: 'num', label: '相差' },
          u: { dim: null, kind: 'num', label: '一段有多长' }, ka: { dim: null, kind: 'num', label: '甲有几段' }, kb: { dim: null, kind: 'num', label: '乙有几段' },
          hit: { dim: null, kind: 'num', label: '和目标对上了：1 是，0 否' },
        },
        icon: () => K.rect(8, 12, 46, 9, { fill: '#cfe0f5', stroke: 'var(--ink)', w: 1.2, r: 1 }) + K.line(23, 12, 23, 21, { w: 1 }) + K.line(38, 12, 38, 21, { w: 1 }) + K.rect(8, 28, 15, 9, { fill: '#cfe0f5', stroke: 'var(--ink)', w: 1.2, r: 1 }),
        size: () => [W, 320],
        grips,
        compute: (c) => { const m = model(c.props); return { a: num(m.a), b: num(m.b), sum: num(m.sum), diff: num(m.diff), u: num(m.u), ka: num(m.ka), kb: num(m.kb), hit: num(m.hit) }; },
        badge: () => '',
        draw,
      },
    },
  });
  U.TapeBench = { model, plan, scaleOf };
})(typeof globalThis !== 'undefined' ? globalThis : window);
