/* 器材包 gapbench：间隔与植树。一条路（或围成一圈），每隔一段种一棵树。
 * 全部在图上直接动手：
 *   - 拖路的右端：改路有多长；拖第二棵树：改每隔多远种一棵（间隔）。
 *   - 点路两头的树：种上或拔掉。两头都种、只种一头、两头都不种，棵数各差 1。
 *   - 点“围成一圈”：首尾接上，头和尾是同一棵。
 * 上面一直写着：几个间隔、几棵树、它们差几。间隔数 = 路长 ÷ 间隔；棵数和间隔数的关系看两头种不种。
 * 换个皮就是别的题：锯木头（锯几次）、爬楼梯（几层间隔）、敲钟、排队、路灯。
 * 这一版的边界（如实写）：路长最多 120，间隔是整数；间隔除不尽路长时最后一段不够长，会提示。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 640, X0 = 40, X1 = W - 40, RY = 150, LMAX = 120;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  function model(p) {
    const L = clamp(p.len, 1, LMAX), d = clamp(p.gap, 1, L), gaps = Math.floor(L / d), exact = L % d === 0, ring = !!p.ring;
    const le = p.le ? 1 : 0, re = p.re ? 1 : 0;
    const trees = ring ? gaps : gaps - 1 + le + (exact ? re : 1);   // 除不尽时最后一棵不在路的尽头，算中间的
    return { L, d, gaps, exact, ring, le, re, trees: Math.max(0, trees), u: (X1 - X0) / LMAX };
  }
  const tree = (x, y, on, ghost) => (on ? '<path d="M' + x + ' ' + (y - 30) + ' l9 16 h-18 z" fill="#3aa66b" stroke="#1f6a34" stroke-width="1.2"/>' + K.line(x, y - 14, x, y, { w: 2.5, stroke: '#7a4a12' })
    : '<path d="M' + x + ' ' + (y - 30) + ' l9 16 h-18 z" fill="none" stroke="#8a94a8" stroke-width="1.2" stroke-dasharray="3 2"/>' + (ghost ? '' : ''));
  const toggle = (x, y, on, k, tip) => '<g data-pick-k="' + k + '" data-pick-v="' + (on ? 0 : 1) + '" style="cursor:pointer"><title>' + tip + '</title><rect x="' + (x - 13) + '" y="' + (y - 34) + '" width="26" height="38" fill="transparent"/>' + tree(x, y, on) + '</g>';
  const pill = (x, y, w, tx, k, v, on, tip) => '<g data-pick-k="' + k + '" data-pick-v="' + v + '" style="cursor:pointer"><title>' + tip + '</title>' + K.rect(x, y, w, 24, { fill: on ? 'var(--blue)' : '#fff', stroke: on ? 'var(--blue)' : '#8a94a8', r: 8 }) + K.text(x + w / 2, y + 16, tx, { size: 12, weight: 700, fill: on ? '#fff' : 'var(--ink)' }) + '</g>';

  function draw(c) {
    const p = c.props, m = model(p), X = (v) => X0 + v * m.u, un = p.unit || '米', nm = p.name || '树'; let s = '';
    s += K.text(W / 2, 30, '路长 ' + m.L + ' ' + un + '，每隔 ' + m.d + ' ' + un + ' 一' + (p.mw || '棵'), { size: 16, weight: 700 });
    s += K.text(W / 2, 54, m.L + ' ÷ ' + m.d + ' = ' + m.gaps + ' 个间隔' + (m.exact ? '' : '（还剩 ' + (m.L % m.d) + ' ' + un + '，不够一个间隔）') + '　→　' + (c.masked ? '？' : m.trees) + ' ' + (p.mw || '棵') + nm, { size: 14, weight: 700, fill: m.exact ? 'var(--ink)' : 'var(--bad)' });
    if (m.ring) {
      // 圈：周长 L，画成一个椭圆，树均匀排在上面
      const cx = W / 2, cy = RY + 20, rx = 190, ry = 62;
      s += '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="none" stroke="#7a4a12" stroke-width="5"/>';
      for (let i = 0; i < m.gaps; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI * m.d / m.L; s += tree(cx + rx * Math.cos(a), cy + ry * Math.sin(a) + 4, true); }
      s += K.text(cx, cy + 6, '围成一圈：头和尾是同一棵，' + m.gaps + ' 个间隔 ' + m.trees + ' ' + (p.mw || '棵'), { size: 13, weight: 700 });
    } else {
      s += K.line(X(0), RY, X(m.L), RY, { w: 6, stroke: '#7a4a12' });
      for (let i = 1; i * m.d < m.L; i++) s += tree(X(i * m.d), RY, true);
      if (!m.exact) { /* 最后一棵已经画了；尽头没有树 */ }
      s += toggle(X(0), RY, !!m.le, 'le', '点一下：这一头种不种') + (m.exact ? toggle(X(m.L), RY, !!m.re, 're', '点一下：这一头种不种') : '');
      // 间隔的标记：第一段下面标长度
      s += K.line(X(0), RY + 14, X(m.d), RY + 14, { w: 1.2 }) + K.line(X(0), RY + 9, X(0), RY + 19, { w: 1.2 }) + K.line(X(m.d), RY + 9, X(m.d), RY + 19, { w: 1.2 }) + K.text(X(m.d / 2), RY + 32, m.d + ' ' + un, { size: 12 });
      const rel = m.le && m.re ? '两头都种：' + nm + '比间隔多 1' : m.le || m.re ? '只种一头：' + nm + '和间隔一样多' : '两头都不种：' + nm + '比间隔少 1';
      s += K.text(W / 2, RY + 62, m.exact ? rel : '最后一段不够长', { size: 13, weight: 700 });
    }
    s += pill(W / 2 - 60, RY + (m.ring ? 100 : 76), 120, m.ring ? '拉直成一条路' : '围成一圈', 'ring', m.ring ? 0 : 1, m.ring, '首尾接上，或者拉直');
    return s;
  }
  function grips(c) {
    const m = model(c.props), X = (v) => X0 + v * m.u, out = [];
    if (m.ring) return out;
    out.push({ id: 'len', x: X(m.L), y: RY, shape: 'bar-v', cursor: 'ew-resize', tip: '左右拖：路有多长',
      drag: (c0, q) => { const m0 = model(c0.props), L = clamp(Math.round((q.x - X0) / m0.u), 1, LMAX); return { len: L, gap: Math.min(m0.d, L) }; }, say: (c1) => '路长 ' + c1.props.len });
    out.push({ id: 'gap', x: X(m.d), y: RY - 40, r: 9, text: '隔', cursor: 'ew-resize', tip: '左右拖：每隔多远种一棵',
      drag: (c0, q) => { const m0 = model(c0.props); return { gap: clamp(Math.round((q.x - X0) / m0.u), 1, m0.L) }; }, say: (c1) => '每隔 ' + c1.props.gap });
    return out;
  }
  const I = (lo, hi, d, label, o) => Object.assign({ type: 'int', label, default: d, min: lo, max: hi, write: true }, o || {});
  const T = (d, label) => ({ type: 'text', label, default: d, write: true });
  U.registerPack({
    id: 'gapbench', version: 1,
    types: {
      gapbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E2', 'E7'],
        label: '间隔与植树', prefix: '植树', group: '数与运算', grades: [3, 6],
        alias: ['植树问题', '间隔', '锯木头', '爬楼梯', '敲钟', '两端都种', '封闭图形'],
        props: {
          len: I(1, LMAX, 20, '路长'), gap: I(1, LMAX, 5, '每隔多远'), le: I(0, 1, 1, '左头种不种（1 种）'), re: I(0, 1, 1, '右头种不种（1 种）'), ring: I(0, 1, 0, '围成一圈（1 是）'),
          unit: T('米', '长度单位'), name: T('树', '种的是什么'), mw: T('棵', '量词'),
        },
        outputs: {
          trees: { dim: null, kind: 'num', label: '一共几棵' }, gaps: { dim: null, kind: 'num', label: '几个间隔' },
          ends: { dim: null, kind: 'num', label: '两头种了几棵（0、1、2；围成圈是 0）' }, exact: { dim: null, kind: 'num', label: '间隔正好排满：1 是，0 否' },
          ringed: { dim: null, kind: 'num', label: '围成一圈：1 是，0 否' },
        },
        icon: () => K.line(8, 34, 56, 34, { w: 3, stroke: '#7a4a12' }) + [14, 32, 50].map((x) => '<path d="M' + x + ' 10 l7 13 h-14 z" fill="#3aa66b" stroke="var(--ink)" stroke-width="1"/>' + K.line(x, 23, x, 34, { w: 2 })).join(''),
        size: () => [W, 300],
        grips,
        compute: (c) => { const m = model(c.props); return { trees: num(m.trees), gaps: num(m.gaps), ends: num(m.ring ? 0 : m.le + m.re), exact: num(m.exact ? 1 : 0), ringed: num(m.ring ? 1 : 0) }; },
        badge: () => '',
        draw,
      },
    },
  });
  U.GapBench = { model };
})(typeof globalThis !== 'undefined' ? globalThis : window);
