/* 器材包 clockbench：钟面。拖分针，时针跟着慢慢走；拖时针，一次走一大段。
 * 全部在图上直接动手：
 *   - 拖分针（长针）：转一圈是 60 分，时针同时走一大格。可以一直转下去，转过 12 也接得上。
 *   - 拖时针（短针）：时针走一大格是 1 时，分针跟着转一整圈。
 *   - 点“从这里开始计时”：记下现在的时刻；之后钟面上用浅色扇形画出分针走过的路，右边写“经过了几时几分 = 多少分”。
 *   - 右边一直写着现在是几时几分，和从开始计时到现在一共走了多少分钟（分针转了几圈）。
 * 这一版的边界（如实写）：分针一次至少走 1 分（拖的时候按 1 分对齐）；时刻只到 24 时，不分上午下午以外的日期；没有秒针。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 640, CX = 170, CY = 190, R = 140, TMAX = 1440;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? +v : lo));
  const pol = (deg, r) => ({ x: CX + r * Math.sin(deg * Math.PI / 180), y: CY - r * Math.cos(deg * Math.PI / 180) });
  function model(p) {
    const t = clamp(p.t, 0, TMAX), start = clamp(p.start, 0, TMAX), h24 = Math.floor(t / 60) % 24, m = t % 60, h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return { t, start, h24, h12, m, el: t - start, mdeg: m * 6, hdeg: (t % 720) / 2 };
  }
  const hm = (mins) => { const a = Math.abs(mins), h = Math.floor(a / 60), m = a % 60; return (mins < 0 ? '−' : '') + (h ? h + ' 时' : '') + (h && m ? ' ' : '') + (m || !h ? m + ' 分' : ''); };
  const clock = (m) => m.h12 + ':' + String(m.m).padStart(2, '0');
  // 拖动时的“接着转”：从上一次预览的时刻出发，找离它最近的同一个指针位置（这样转过 12 也接得上）
  function nearest(prev, base, period, want) {
    const k = Math.round((prev - want - base) / period); let best = null;
    for (const j of [k - 1, k, k + 1]) { const v = want + base + j * period; if (v < 0 || v > TMAX) continue; if (best === null || Math.abs(v - prev) < Math.abs(best - prev)) best = v; }
    return best === null ? clamp(prev, 0, TMAX) : best;
  }
  const btn = (x, y, w, label, patch, enabled, tip) => '<g' + (enabled ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' data-off="1"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 26, { fill: enabled ? '#fff' : '#f1f3f6', stroke: enabled ? 'var(--blue)' : '#b8c0cc', r: 8, w: 1.5 }) + K.text(x + w / 2, y + 17, label, { size: 12, weight: 700, fill: enabled ? 'var(--ink)' : '#5f6773' }) + '</g>';

  function draw(c) {
    const p = c.props, m = model(p), on = p.timing === true || p.timing === 1; let s = '';
    s += K.circle(CX, CY, R, { fill: '#fffdf6', stroke: 'var(--ink)', w: 3 });
    // 走过的路：分针从开始计时的位置转到现在（超过一圈就整盘淡色，再叠一层）
    if (on && m.el > 0) {
      const turns = Math.floor(m.el / 60), rest = m.el % 60, a0 = (m.start % 60) * 6;
      if (turns) s += K.circle(CX, CY, R - 6, { fill: '#cfe0f5', stroke: 'none' });
      if (rest) { const a1 = a0 + rest * 6, P0 = pol(a0, R - 6), P1 = pol(a1, R - 6); s += '<path data-swept="1" d="M' + CX + ' ' + CY + ' L' + P0.x.toFixed(1) + ' ' + P0.y.toFixed(1) + ' A' + (R - 6) + ' ' + (R - 6) + ' 0 ' + (rest > 30 ? 1 : 0) + ' 1 ' + P1.x.toFixed(1) + ' ' + P1.y.toFixed(1) + ' Z" fill="' + (turns ? '#9fc0ea' : '#cfe0f5') + '"/>'; }
    }
    for (let i = 0; i < 60; i++) { const a = pol(i * 6, R - 4), b = pol(i * 6, R - (i % 5 ? 10 : 18)); s += K.line(a.x, a.y, b.x, b.y, { w: i % 5 ? 1 : 2.4 }); }
    for (let i = 1; i <= 12; i++) { const q = pol(i * 30, R - 34); s += K.text(q.x, q.y + 7, String(i), { size: 20, weight: 700 }); }
    for (let i = 0; i < 12; i++) { const q = pol(i * 30, R + 12); s += K.text(q.x, q.y + 4, String(i * 5), { size: 9, fill: '#5a6478' }); }   // 外圈：分针指着的分钟数
    const H = pol(m.hdeg, R * 0.5), M = pol(m.mdeg, R * 0.82);
    s += K.line(CX, CY, H.x, H.y, { w: 8, stroke: '#2f4a73' }) + K.line(CX, CY, M.x, M.y, { w: 4, stroke: '#c0392b' }) + K.circle(CX, CY, 7, { fill: 'var(--ink)' });
    // 右边
    const X = 340;
    s += K.text(X, 60, '现在：' + m.h12 + ' 时 ' + m.m + ' 分', { size: 18, weight: 700, anchor: 'start' }) + K.text(X, 86, '（' + clock(m) + '）', { size: 14, anchor: 'start', fill: '#5a6478' });
    s += K.text(X, 118, '分针（红、长）：一大格 5 分，一圈 60 分', { size: 12, anchor: 'start' }) + K.text(X, 138, '时针（蓝、短）：一大格 1 时，一圈 12 时', { size: 12, anchor: 'start' });
    s += btn(X, 156, 140, '从这里开始计时', { timing: true, start: m.t }, !on || m.el !== 0, '记下现在的时刻，看之后走了多久');
    s += btn(X + 146, 156, 120, '回到 12 时', { t: 0, start: 0, timing: false }, m.t !== 0 || on, '把钟拨回 12 时整');
    if (on) {
      const st = model({ t: m.start, start: 0 });
      s += K.text(X, 210, '从 ' + st.h12 + ' 时 ' + st.m + ' 分开始', { size: 13, anchor: 'start' });
      s += '<g data-elapsed="' + m.el + '">' + K.text(X, 238, '经过了 ' + hm(m.el) + ' = ' + m.el + ' 分', { size: 16, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
      if (m.el >= 60) s += K.text(X, 262, '分针转了 ' + Math.floor(m.el / 60) + ' 圈' + (m.el % 60 ? '还多 ' + (m.el % 60) + ' 分' : ''), { size: 12, anchor: 'start', fill: '#5a6478' });
    } else s += K.text(X, 220, '点“从这里开始计时”，再拨钟，看走了多久', { size: 12, anchor: 'start', fill: '#5a6478' });
    return s;
  }
  function grips(c) {
    const m = model(c.props), M = pol(m.mdeg, R * 0.82), H = pol(m.hdeg, R * 0.5);
    const angle = (q) => { let d = Math.atan2(q.x - CX, -(q.y - CY)) * 180 / Math.PI; if (d < 0) d += 360; return d; };
    const prevT = (c0) => clamp((c0.ent && c0.ent.props ? c0.ent.props.t : c0.props.t), 0, TMAX);
    const say = (c1) => { const m1 = model(c1.props); return clock(m1) + ((c1.props.timing === true || c1.props.timing === 1) ? '，经过 ' + m1.el + ' 分' : ''); };
    return [
      { id: 'min', x: M.x, y: M.y, r: 10, cursor: 'grab', tip: '拖分针：一圈 60 分，时针跟着走一大格', say,
        drag: (c0, q) => { const prev = prevT(c0), want = Math.round(angle(q) / 6) % 60; return { t: nearest(prev, 0, 60, want) }; } },
      { id: 'hour', x: H.x, y: H.y, r: 10, ghost: true, cursor: 'grab', tip: '拖时针：一大格 1 时', say,
        drag: (c0, q) => { const prev = prevT(c0), want = Math.round(angle(q) / 30) % 12 * 60; return { t: nearest(prev, prev % 60, 720, want) }; } },
    ];
  }
  const I = (lo, hi, d, label, o) => Object.assign({ type: 'int', label, default: d, min: lo, max: hi, write: true }, o || {});
  U.registerPack({
    id: 'clockbench', version: 1,
    types: {
      clockbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E6', 'E2'],
        label: '钟面', prefix: '钟面', group: '时间与变化', grades: [1, 4],
        alias: ['钟表', '认识钟表', '时间', '时刻', '经过时间', '时分', '分针', '时针'],
        props: {
          t: I(0, TMAX, 0, '现在的时刻（从 0 时起的分钟数）'), start: I(0, TMAX, 0, '开始计时的时刻（分钟数）'),
          timing: { type: 'bool', label: '在计时（显示经过了多久）', default: false, write: true },
        },
        outputs: {
          h: { dim: null, kind: 'num', label: '几时（1 到 12）' }, m: { dim: null, kind: 'num', label: '几分' }, t: { dim: null, kind: 'num', label: '从 0 时起的分钟数' },
          elapsed: { dim: null, kind: 'num', label: '开始计时以后经过了几分钟（在计时才有）' },
        },
        icon: () => K.circle(32, 24, 16, { fill: '#fffdf6', stroke: 'var(--ink)', w: 1.6 }) + K.line(32, 24, 32, 12, { w: 2, stroke: '#c0392b' }) + K.line(32, 24, 40, 28, { w: 3, stroke: '#2f4a73' }),
        size: () => [W, 380],
        grips,
        compute: (c) => { const m = model(c.props), o = { h: num(m.h12), m: num(m.m), t: num(m.t) }; if (c.props.timing === true || c.props.timing === 1) o.elapsed = num(m.el); return o; },
        badge: () => '',
        draw,
      },
    },
  });
  U.ClockBench = { model, nearest };
})(typeof globalThis !== 'undefined' ? globalThis : window);
