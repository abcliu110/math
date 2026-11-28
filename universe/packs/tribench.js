/* 器材包 tribench：三角形（小棒与角）。
 *   - 小棒：三根小棒，拖每根的右端改长短。能围成三角形就画出来；围不成就画出两根短的“够不着”，写出 3 + 4 = 7 < 8。
 *     一直写着周长；最长的一根的平方等于另两根的平方和时，标出直角（勾股定理）；两根一样长时标出等腰。
 *   - 角：一个三角形，拖角 A、角 B 下面的把手改角度，角 C 跟着变：三个角加起来总是 180°。C 是 90° 时标出直角。
 * 这一版的边界（如实写）：小棒是 1 到 50 的整数；角是整数度；画出来的三角形是示意（按比例，但不能拖顶点）。
 * 大数（2026-11-28，试验台增强 7 第二轮）：以前小棒最长 20。现在到 50：勾股数 7、24、25，20、21、29，“30 厘米和 50 厘米的木条能不能围”都能摆。
 *   小棒按最长的那根分三档画：20 以内 1 = 16 像素（和以前一样），30 以内 1 = 10.7 像素，再长 1 = 6.4 像素；拖的时候用按下那一刻的比例，
 *   可以拖过刻度尺的头（右边是空的），松手后才换档。每根小棒在自己那一行，把手不会叠在一起。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 680, LMAX = 50, SX = 60, SY = [78, 128, 178];
  // 小棒按最长的那根分档：刻度尺一共 320 像素
  const rangeOf = (v) => (v <= 20 ? 20 : v <= 30 ? 30 : 50), suOf = (p) => { const m = model(p); return m.mode === 0 ? 320 / rangeOf(m.o[2]) : 16; };
  const suNow = (c) => suOf(c && c.drag && c.drag.p0 ? c.drag.p0 : c.props);   // 拖的时候用按下那一刻的比例
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? +v : lo));
  const COL = ['#d9782f', '#3b7cc4', '#3aa66b'];
  function model(p) {
    const mode = clamp(p.mode, 0, 1);
    if (mode === 0) {
      const s = [clamp(p.a, 1, LMAX), clamp(p.b, 1, LMAX), clamp(p.c, 1, LMAX)], o = s.slice().sort((x, y) => x - y);
      const ok = o[0] + o[1] > o[2], right = ok && o[0] * o[0] + o[1] * o[1] === o[2] * o[2], iso = s[0] === s[1] || s[1] === s[2] || s[0] === s[2];
      return { mode, s, o, ok, right, iso, eq: s[0] === s[1] && s[1] === s[2], perim: s[0] + s[1] + s[2] };
    }
    const A = clamp(p.A, 1, 178), B = clamp(p.B, 1, 179 - A), C = 180 - A - B;
    return { mode, A, B, C, right: C === 90 || A === 90 || B === 90 };
  }
  function draw(c) {
    const p = c.props, m = model(p), SU = suNow(c), RG = Math.round(320 / SU); let s = '';
    if (m.mode === 0) {
      const nm = ['a', 'b', 'c'];
      if (RG > 20) s += K.big.unitNote(SX + 320, 52, '小棒长了，缩小画');
      s += K.text(20, 28, '三根小棒：' + m.s.join('、'), { size: 16, weight: 700, anchor: 'start' });
      m.s.forEach((L, i) => { s += K.text(SX - 14, SY[i] + 5, nm[i], { size: 13, weight: 700, anchor: 'end', fill: COL[i] }) + K.rect(SX, SY[i] - 5, L * SU, 10, { fill: COL[i], stroke: 'var(--ink)', r: 4, w: 1 }) + K.text(SX + L * SU + 18, SY[i] + 5, String(L), { size: 13, weight: 700, anchor: 'start' }); });
      for (let k = 0; k <= RG; k += RG > 20 ? 10 : 5) s += K.text(SX + k * SU, 204, String(k), { size: 10, fill: '#5a6478' });
      // 右下：围一围
      const [x, y, z] = m.o, bx = 60, by = 352, px0 = (x * x - y * y + z * z) / (2 * z), py0 = m.ok ? Math.sqrt(Math.max(0, x * x - px0 * px0)) : z * 0.3, u = Math.min(30, 300 / z, 118 / Math.max(1, py0));   // 三角形画在小棒下面：宽不超过 300，高不超过 118
      if (m.ok) {
        const px = (x * x - y * y + z * z) / (2 * z), py = Math.sqrt(Math.max(0, x * x - px * px));
        const P0 = [bx, by], P1 = [bx + z * u, by], P2 = [bx + px * u, by - py * u];
        s += '<polygon data-tri="1" points="' + [P0, P1, P2].map((q) => q.map((v) => v.toFixed(1)).join(',')).join(' ') + '" fill="#eef3fb" stroke="var(--ink)" stroke-width="2"/>';
        if (m.right) { const R2 = P2, a1 = [P0[0] - R2[0], P0[1] - R2[1]], a2 = [P1[0] - R2[0], P1[1] - R2[1]], n1 = Math.hypot(...a1), n2 = Math.hypot(...a2), k = 12; s += '<path d="M' + (R2[0] + a1[0] / n1 * k) + ' ' + (R2[1] + a1[1] / n1 * k) + ' L' + (R2[0] + (a1[0] / n1 + a2[0] / n2) * k) + ' ' + (R2[1] + (a1[1] / n1 + a2[1] / n2) * k) + ' L' + (R2[0] + a2[0] / n2 * k) + ' ' + (R2[1] + a2[1] / n2 * k) + '" fill="none" stroke="var(--bad)" stroke-width="1.6"/>'; }
      } else {
        s += K.line(bx, by, bx + z * u, by, { w: 4, stroke: 'var(--ink)' }) + K.line(bx, by, bx + x * u * 0.94, by - x * u * 0.34, { w: 4, stroke: '#9fb7d9' }) + K.line(bx + z * u, by, bx + z * u - y * u * 0.94, by - y * u * 0.34, { w: 4, stroke: '#9fb7d9' });
        s += K.circle(bx + x * u * 0.94, by - x * u * 0.34, 4, { fill: 'var(--bad)' }) + K.circle(bx + z * u - y * u * 0.94, by - y * u * 0.34, 4, { fill: 'var(--bad)' });
      }
      const X = 400, lines = [];
      lines.push([m.ok ? '能围成三角形：' + x + ' + ' + y + ' = ' + (x + y) + ' > ' + z : '围不成：' + x + ' + ' + y + ' = ' + (x + y) + (x + y === z ? ' = ' : ' < ') + z + '，两根短的接不上', m.ok ? 'var(--good)' : 'var(--bad)']);
      if (m.ok) {
        lines.push(['周长：' + m.s.join(' + ') + ' = ' + m.perim, 'var(--ink)']);
        lines.push([x + '² + ' + y + '² = ' + (x * x + y * y) + (m.right ? ' = ' : ' ≠ ') + z + '² = ' + z * z, m.right ? 'var(--bad)' : '#5a6478']);
        if (m.right) lines.push(['是直角三角形（最长的一根对着直角）', 'var(--bad)']);
        if (m.eq) lines.push(['三边一样长：等边三角形', 'var(--blue)']); else if (m.iso) lines.push(['有两边一样长：等腰三角形', 'var(--blue)']);
      }
      lines.forEach(([t, col], i) => { s += K.text(X, 240 + i * 24, t, { size: 13, weight: 700, anchor: 'start', fill: col }); });
      s += K.text(SX, 52, '拖每根小棒的右端改长短', { size: 12, anchor: 'start', fill: '#5a6478' });
    } else {
      s += K.text(20, 28, '角 A = ' + m.A + '°，角 B = ' + m.B + '°，角 C = ' + m.C + '°', { size: 16, weight: 700, anchor: 'start' });
      s += '<g data-sum="1">' + K.text(20, 54, m.A + '° + ' + m.B + '° + ' + m.C + '° = 180°', { size: 14, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
      // 画三角形：底边 AB，角 A、角 B 给定
      const L = 300, ax = 80, ay = 330, ra = m.A * Math.PI / 180, rb = m.B * Math.PI / 180, t = L * Math.sin(rb) / Math.sin(ra + rb), cx = ax + t * Math.cos(ra), cy = ay - t * Math.sin(ra), sc = Math.min(1, 240 / Math.max(1, ay - cy));
      const P = (x, y) => [ax + (x - ax) * sc, ay - (ay - y) * sc], A2 = P(ax, ay), B2 = P(ax + L, ay), C2 = P(cx, cy);
      s += '<polygon points="' + [A2, B2, C2].map((q) => q.map((v) => v.toFixed(1)).join(',')).join(' ') + '" fill="#eef3fb" stroke="var(--ink)" stroke-width="2"/>';
      s += K.text(A2[0] - 12, A2[1] + 6, 'A', { size: 14, weight: 700 }) + K.text(B2[0] + 12, B2[1] + 6, 'B', { size: 14, weight: 700 }) + K.text(C2[0], C2[1] - 10, 'C', { size: 14, weight: 700, fill: m.C === 90 ? 'var(--bad)' : 'var(--ink)' });
      // 两个把手：A、B 的角度条
      const bar = (y, label, v, max) => K.text(440, y - 10, label + ' = ' + v + '°', { size: 13, weight: 700, anchor: 'start' }) + K.line(440, y, 640, y, { w: 3, stroke: '#c5ccda' }) + K.text(640, y + 16, String(max), { size: 10, anchor: 'end', fill: '#5a6478' });
      s += bar(120, '角 A', m.A, 178) + bar(190, '角 B', m.B, 179 - m.A);
      s += K.text(440, 250, '角 C = 180° − ' + m.A + '° − ' + m.B + '° = ' + m.C + '°', { size: 13, weight: 700, anchor: 'start', fill: m.C === 90 ? 'var(--bad)' : 'var(--ink)' });
      if (m.C === 90) s += K.text(440, 274, '角 C 是直角：直角三角形', { size: 13, weight: 700, anchor: 'start', fill: 'var(--bad)' });
      else if (m.C > 90) s += K.text(440, 274, '角 C 比直角大：钝角三角形', { size: 12, anchor: 'start', fill: '#5a6478' });
    }
    return s;
  }
  function grips(c) {
    const m = model(c.props), SU = suNow(c);
    if (m.mode === 0) return ['a', 'b', 'c'].map((k, i) => ({ id: k, x: SX + m.s[i] * SU, y: SY[i], r: 9, shape: 'bar-v', cursor: 'ew-resize', tip: '拖我：改这根小棒的长短',
      drag: (c0, q) => { const su = suOf(c0.props); return { [k]: clamp(Math.round((q.x - SX) / su), 1, Math.min(LMAX, Math.floor((W - SX - 44) / su))) }; }, say: (c1) => { const m1 = model(c1.props); return m1.s.join('、') + (m1.ok ? '：能围成' : '：围不成'); } }));
    const pos = (v, max) => 440 + v / max * 200;
    return [
      { id: 'A', x: pos(m.A, 178), y: 120, r: 9, shape: 'bar-v', cursor: 'ew-resize', tip: '拖我：改角 A', drag: (c0, q) => ({ A: clamp(Math.round((q.x - 440) / 200 * 178), 1, 178 - model(c0.props).B) }), say: (c1) => { const m1 = model(c1.props); return 'C = ' + m1.C + '°'; } },
      { id: 'B', x: pos(m.B, 179 - m.A), y: 190, r: 9, shape: 'bar-v', cursor: 'ew-resize', tip: '拖我：改角 B', drag: (c0, q) => { const A = model(c0.props).A; return { B: clamp(Math.round((q.x - 440) / 200 * (179 - A)), 1, 179 - A) }; }, say: (c1) => { const m1 = model(c1.props); return 'C = ' + m1.C + '°'; } },
    ];
  }
  const I = (lo, hi, d, label, o) => Object.assign({ type: 'int', label, default: d, min: lo, max: hi, write: true }, o || {});
  U.registerPack({
    id: 'tribench', version: 1,
    types: {
      tribench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E5', 'E4'],
        label: '三角形（小棒与角）', prefix: '三角形', group: '图形', grades: [1, 8],
        alias: ['三角形', '三边关系', '围三角形', '周长', '等腰三角形', '直角三角形', '勾股定理', '内角和', '三角形的角'],
        props: {
          mode: { type: 'choice', label: '看什么', default: 0, choices: ['小棒', '角'], write: true },
          a: I(1, LMAX, 3, '小棒 a', { qmax: 20 }), b: I(1, LMAX, 4, '小棒 b', { qmax: 20 }), c: I(1, LMAX, 5, '小棒 c', { qmax: 20 }),
          A: I(1, 178, 50, '角 A（度）'), B: I(1, 178, 60, '角 B（度）'),
        },
        outputs: {
          ok: { dim: null, kind: 'num', label: '能围成三角形：1 是，0 否' }, right: { dim: null, kind: 'num', label: '是直角三角形：1 是，0 否' },
          perim: { dim: null, kind: 'num', label: '周长（能围成才有）' }, iso: { dim: null, kind: 'num', label: '等腰：1 是，0 否' },
          C: { dim: null, kind: 'num', label: '角 C（角的看法）' },
        },
        icon: () => '<polygon points="10,40 54,40 22,10" fill="#eef3fb" stroke="var(--ink)" stroke-width="1.6"/>' + K.line(10, 46, 54, 46, { w: 2, stroke: COL[0] }),
        size: () => [W, 400],
        grips,
        compute: (c) => {
          const m = model(c.props);
          if (m.mode === 0) { const o = { ok: num(m.ok ? 1 : 0), right: num(m.right ? 1 : 0), iso: num(m.iso ? 1 : 0) }; if (m.ok) o.perim = num(m.perim); return o; }
          return { C: num(m.C), right: num(m.right ? 1 : 0) };
        },
        badge: () => '',
        draw,
      },
    },
  });
  U.TriBench = { model, suOf, LMAX };
})(typeof globalThis !== 'undefined' ? globalThis : window);
