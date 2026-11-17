/* 器材包 rulerbench：尺子。
 *   - 量长度：一支铅笔（或纸条）放在厘米尺上，不一定从 0 开始。拖铅笔让它的头对准 0，才读得出长度；
 *     没对准时也能点“从这头数到那头”，一厘米一厘米地数格子（数出来的也对）。直接读尾巴所在的刻度是常见错误。
 *   - 米和厘米：一根绳子按米画在米尺上（每米 100 厘米，十厘米一大格）。拖剪刀剪下一段，写出剪下的和剩下的，
 *     都同时写成“几米几厘米”和“多少厘米”。
 * 这一版的边界（如实写）：量长度只到 15 厘米、整厘米；米和厘米的绳子最长 3 米，剪刀 5 厘米一格。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 700;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? Math.round(+v) : lo));
  const MODES = ['量长度', '米和厘米'];
  const X0 = 50, CM = 38, RY = 200;        // 量长度：1 厘米 38 像素
  const MX0 = 40, MX1 = 660, MY = 190;     // 米和厘米
  const mcm = (c) => (c >= 100 ? Math.floor(c / 100) + ' 米' + (c % 100 ? ' ' + (c % 100) + ' 厘米' : '') : c + ' 厘米');
  function model(p) {
    const mode = clamp(p.mode, 0, 1), len = clamp(p.len, 1, 15), at = clamp(p.at, 0, 15 - len), counted = !!p.counted;
    const L = clamp(p.L, 10, 300), cut = clamp(p.cut, 0, L);
    return { mode, len, at, counted, aligned: at === 0, L, cut, rest: L - cut };
  }
  function grips(c) {
    const m = model(c.props);
    if (m.mode === 0) return [{ id: 'pen', x: X0 + (m.at + m.len / 2) * CM, y: RY - 42, r: 12, cursor: 'grab', tip: '拖铅笔左右挪', drag: (c0, q) => { const m0 = model(c0.props); return { at: clamp((q.x - X0) / CM - m0.len / 2, 0, 15 - m0.len), counted: false }; }, say: (c1) => '铅笔头在 ' + model(c1.props).at + ' 厘米' }];
    const px = (v) => MX0 + (MX1 - MX0) * v / Math.max(m.L, 100);
    return [{ id: 'cut', x: px(m.cut), y: MY - 34, r: 12, cursor: 'ew-resize', tip: '拖剪刀：剪在哪里', drag: (c0, q) => { const m0 = model(c0.props); return { cut: clamp(Math.round((q.x - MX0) / (MX1 - MX0) * Math.max(m0.L, 100) / 5) * 5, 0, m0.L) }; }, say: (c1) => '剪下 ' + model(c1.props).cut + ' 厘米' }];
  }
  const btn = (x, y, w, label, patch, enabled, tip) => '<g' + (enabled ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' data-off="1"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 26, { fill: enabled ? '#fff' : '#f1f3f6', stroke: enabled ? 'var(--blue)' : '#b8c0cc', r: 7, w: 1.4 }) + K.text(x + w / 2, y + 17, label, { size: 12, weight: 700, fill: enabled ? 'var(--ink)' : '#5f6773' }) + '</g>';
  function draw(c) {
    const p = c.props, m = model(p); let s = '';
    if (m.mode === 0) {
      s += K.text(20, 26, '这支铅笔有多长？', { size: 16, weight: 700, anchor: 'start' }) + K.text(W - 20, 26, '拖铅笔，让铅笔头对准 0', { size: 12, anchor: 'end', fill: '#5a6478' });
      s += K.rect(X0 - 14, RY, 15 * CM + 28, 52, { fill: '#fff6d8', stroke: '#8a6d1a', r: 4, w: 1.4 });
      for (let mm = 0; mm <= 150; mm++) { const x = X0 + mm * CM / 10, big = mm % 10 === 0, mid = mm % 5 === 0; s += K.line(x, RY, x, RY + (big ? 18 : mid ? 12 : 7), { stroke: '#5a4a10', w: big ? 1.4 : 0.7 }); if (big) s += K.text(x, RY + 34, String(mm / 10), { size: 12, weight: 700, fill: '#5a4a10' }); }
      s += K.text(X0 + 15 * CM, RY + 48, '厘米', { size: 10, fill: '#5a4a10' });
      // 铅笔：身子 + 笔尖
      const x0 = X0 + m.at * CM, x1 = X0 + (m.at + m.len) * CM;
      s += K.rect(x0, RY - 56, x1 - x0 - 26, 28, { fill: '#f5c26b', stroke: '#8a5a00', r: 3, w: 1.4 }) + '<polygon points="' + [x1 - 26, RY - 56, x1, RY - 42, x1 - 26, RY - 28].join(',') + '" fill="#f3dfb0" stroke="#8a5a00" stroke-width="1.4"/>';
      s += K.line(x0, RY - 28, x0, RY, { stroke: 'var(--bad)', w: 1, dash: '3 2' }) + K.line(x1, RY - 42, x1, RY, { stroke: 'var(--bad)', w: 1, dash: '3 2' });
      s += K.text(x0, RY - 64, '头在 ' + m.at, { size: 11, fill: 'var(--bad)' }) + K.text(x1, RY - 64, '尖在 ' + (m.at + m.len), { size: 11, fill: 'var(--bad)' });
      if (m.counted) for (let i = 0; i < m.len; i++) { const x = X0 + (m.at + i + 0.5) * CM; s += K.circle(x, RY + 70, 11, { fill: '#d6ecff', stroke: 'var(--blue)', w: 1.2 }) + K.text(x, RY + 74, String(i + 1), { size: 11, weight: 700 }); }
      s += btn(20, 330, 170, '从这头数到那头', { counted: true }, !m.counted, '一厘米一厘米地数格子');
      if (m.aligned || m.counted) s += '<g data-read="1">' + K.text(220, 348, (m.aligned ? '头对准 0：尖指着 ' + m.len + '，就是 ' + m.len + ' 厘米' : '数出来 ' + m.len + ' 格：' + (m.at + m.len) + ' − ' + m.at + ' = ' + m.len + ' 厘米'), { size: 15, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
      else s += K.text(220, 348, '头没对准 0：尖指的 ' + (m.at + m.len) + ' 不是它的长度', { size: 13, weight: 700, anchor: 'start', fill: 'var(--bad)' });
    } else {
      const top = Math.max(m.L, 100), px = (v) => MX0 + (MX1 - MX0) * v / top;
      s += K.text(20, 26, '一根绳子长 ' + mcm(m.L), { size: 16, weight: 700, anchor: 'start' }) + K.text(W - 20, 26, '拖剪刀剪下一段', { size: 12, anchor: 'end', fill: '#5a6478' });
      for (let mtr = 0; mtr * 100 < top; mtr++) s += K.rect(px(mtr * 100), MY + 20, px(Math.min(top, (mtr + 1) * 100)) - px(mtr * 100), 30, { fill: mtr % 2 ? '#fff6d8' : '#fdf0c4', stroke: '#8a6d1a', r: 0, w: 1.2 }) + K.text((px(mtr * 100) + px(Math.min(top, (mtr + 1) * 100))) / 2, MY + 70, '第 ' + (mtr + 1) + ' 米', { size: 11, fill: '#5a4a10' });
      for (let v = 0; v <= top; v += 10) s += K.line(px(v), MY + 20, px(v), MY + 20 + (v % 100 === 0 ? 30 : v % 50 === 0 ? 16 : 9), { stroke: '#5a4a10', w: v % 100 === 0 ? 1.8 : 0.8 }) + (v % 50 === 0 ? K.text(px(v), MY + 14, String(v), { size: 9, fill: '#5a4a10' }) : '');
      s += K.rect(px(0), MY - 12, px(m.cut) - px(0), 10, { fill: '#e87a6b', stroke: 'none', r: 2 }) + K.rect(px(m.cut), MY - 12, px(m.L) - px(m.cut), 10, { fill: '#6fa3e0', stroke: 'none', r: 2 });
      s += K.text(px(m.cut), MY - 26, '✂', { size: 18 });
      s += '<g data-read="1">' + K.text(20, 300, '剪下：' + m.cut + ' 厘米' + (m.cut >= 100 ? ' = ' + mcm(m.cut) : ''), { size: 15, weight: 700, anchor: 'start', fill: '#b03a2e' }) + K.text(20, 326, '剩下：' + m.L + ' − ' + m.cut + ' = ' + m.rest + ' 厘米' + (m.rest >= 100 ? ' = ' + mcm(m.rest) : ''), { size: 15, weight: 700, anchor: 'start', fill: '#1d4fa3' }) + '</g>';
      s += K.text(20, 356, '1 米 = 100 厘米：米和厘米要换成同一种单位才能加减', { size: 12, anchor: 'start', fill: '#5a6478' });
    }
    return s;
  }
  const I = (lo, hi, d, label) => ({ type: 'int', label, default: d, min: lo, max: hi, write: true });
  U.registerPack({
    id: 'rulerbench', version: 1,
    types: {
      rulerbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E5', 'E3'],
        label: '尺子', prefix: '尺子', group: '图形', grades: [1, 3],
        alias: ['尺子', '量长度', '厘米', '米', '米和厘米', '单位换算', '长度单位', '刻度'],
        props: {
          mode: { type: 'choice', label: '做什么', default: 0, choices: MODES, write: true },
          len: I(1, 15, 6, '量长度：铅笔有几厘米'), at: I(0, 14, 2, '量长度：铅笔头在几厘米'), counted: { type: 'bool', label: '数过格子了', default: false, write: true },
          L: I(10, 300, 200, '米和厘米：绳子一共几厘米'), cut: I(0, 300, 0, '米和厘米：剪下几厘米'),
        },
        outputs: {
          len: { dim: null, kind: 'num', label: '量出的长度（对准 0 或数过格子才有）' }, tip: { dim: null, kind: 'num', label: '铅笔尖指着的刻度' },
          cut: { dim: null, kind: 'num', label: '剪下几厘米（剪了才有）' }, rest: { dim: null, kind: 'num', label: '剩下几厘米（剪了才有）' }, total: { dim: null, kind: 'num', label: '绳子一共几厘米' },
        },
        icon: () => K.rect(4, 22, 48, 14, { fill: '#fff6d8', stroke: '#8a6d1a', r: 2, w: 1 }) + [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => K.line(8 + i * 5, 22, 8 + i * 5, i % 2 ? 27 : 30, { stroke: '#5a4a10', w: 0.8 })).join(''),
        size: () => [W, 400],
        grips,
        compute: (c) => {
          const m = model(c.props), o = {};
          if (m.mode === 0) { o.tip = num(m.at + m.len); if (m.aligned || m.counted) o.len = num(m.len); }
          else { o.total = num(m.L); if (m.cut > 0) { o.cut = num(m.cut); o.rest = num(m.rest); } }
          return o;
        },
        badge: () => '',
        draw,
      },
    },
  });
  U.RulerBench = { model };
})(typeof globalThis !== 'undefined' ? globalThis : window);
