/* 器材包 seqbench：数列与规律（找规律、第 n 个）。
 *   - 摆一摆：火柴摆正方形、桌子拼起来坐人、火柴摆三角形。点“再摆一个”，下一个图出来，表里多一行（第几个、用了几个）。
 *   - 找规律：规律写成“第 1 个是 a，以后每个多 d”。点 − + 改 a 和 d；表里每一行都对上（打 ✓）才算找到了。
 *   - 第 n 个：规律找到以后，点 − + 改 n（也可以 ×10 跳），写出 a + (n − 1) × d，也写成 d × n + (a − d)。
 * 这一版的边界（如实写）：只做每次多同样多的规律（等差）；最多摆 5 个图。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 700;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? Math.round(+v) : lo));
  const KINDS = [
    { name: '火柴摆正方形', unit: '根火柴', a: 4, d: 3, what: '个正方形' },
    { name: '桌子拼起来坐人', unit: '个人', a: 4, d: 2, what: '张桌子' },
    { name: '火柴摆三角形', unit: '根火柴', a: 3, d: 2, what: '个三角形' },
  ];
  function model(p) {
    const kind = clamp(p.kind, 0, KINDS.length - 1), k = clamp(p.k, 1, 5), a = clamp(p.a, 0, 20), d = clamp(p.d, 0, 10), n = clamp(p.n, 1, 1000), KD = KINDS[kind];
    const val = (i) => KD.a + (i - 1) * KD.d, rows = []; for (let i = 1; i <= k; i++) rows.push({ i, v: val(i), ok: a + (i - 1) * d === val(i) });
    const found = k >= 3 && rows.every((r) => r.ok);
    return { kind, KD, k, a, d, n, rows, found, term: found ? a + (n - 1) * d : null };
  }
  const btn = (x, y, w, label, patch, enabled, tip) => '<g' + (enabled ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' data-off="1"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 24, { fill: enabled ? '#fff' : '#f1f3f6', stroke: enabled ? 'var(--blue)' : '#b8c0cc', r: 7, w: 1.4 }) + K.text(x + w / 2, y + 16, label, { size: 12, weight: 700, fill: enabled ? 'var(--ink)' : '#5f6773' }) + '</g>';
  const stick = (x1, y1, x2, y2) => K.line(x1, y1, x2, y2, { stroke: '#b5651d', w: 3 });
  // 画第 i 个图，左下角在 (x, y)，返回 [svg, 宽]
  function fig(kind, i, x, y) {
    let s = '', w = 0; const S = 16;
    if (kind === 0) { for (let j = 0; j <= i; j++) s += stick(x + j * S, y, x + j * S, y - S); for (let j = 0; j < i; j++) s += stick(x + j * S, y, x + (j + 1) * S, y) + stick(x + j * S, y - S, x + (j + 1) * S, y - S); w = i * S; }
    else if (kind === 1) { for (let j = 0; j < i; j++) { s += K.rect(x + 6 + j * 18, y - 22, 18, 12, { fill: '#e8d5b0', stroke: '#8a6d1a', r: 1, w: 1 }); s += K.circle(x + 15 + j * 18, y - 28, 3.5, { fill: '#6fa3e0' }) + K.circle(x + 15 + j * 18, y - 4, 3.5, { fill: '#6fa3e0' }); } s += K.circle(x + 2, y - 16, 3.5, { fill: '#6fa3e0' }) + K.circle(x + 10 + i * 18, y - 16, 3.5, { fill: '#6fa3e0' }); w = i * 18 + 12; }
    else { for (let j = 0; j < i; j++) { const mm = Math.floor(j / 2), L = x + mm * S, ax = L + S / 2; if (j === 0) s += stick(L, y, ax, y - S) + stick(ax, y - S, L + S, y) + stick(L, y, L + S, y); else if (j % 2) s += stick(ax, y - S, ax + S, y - S) + stick(L + S, y, ax + S, y - S); else s += stick(L, y, L + S, y) + stick(ax, y - S, L + S, y); } w = Math.ceil(i / 2) * S + S / 2; }
    return [s, w];
  }
  function draw(c) {
    const p = c.props, m = model(p); let s = '';
    s += K.text(20, 26, m.KD.name + '：第 n 个要几' + m.KD.unit + '？', { size: 16, weight: 700, anchor: 'start' });
    let x = 24; for (let i = 1; i <= m.k; i++) { const [f, w] = fig(m.kind, i, x, 104); s += f + K.text(x + w / 2, 124, '第 ' + i + ' 个', { size: 10, fill: '#5a6478' }); x += w + 26; }
    s += btn(560, 50, 120, '再摆一个', { k: m.k + 1 }, m.k < 5, '摆下一个图');
    // 表
    const TX = 24, TY = 150;
    s += K.text(TX, TY, '第几个', { size: 12, weight: 700, anchor: 'start' }) + K.text(TX, TY + 24, m.KD.unit.replace(/^[根个]/, '') + '数', { size: 12, weight: 700, anchor: 'start' }) + K.text(TX, TY + 48, '按规律算', { size: 12, weight: 700, anchor: 'start', fill: '#5a6478' });
    m.rows.forEach((r, j) => { const cx = TX + 90 + j * 56; s += K.text(cx, TY, String(r.i), { size: 13 }) + K.text(cx, TY + 24, String(r.v), { size: 14, weight: 700 }) + K.text(cx, TY + 48, (m.a + (r.i - 1) * m.d) + (r.ok ? ' ✓' : ' ✗'), { size: 12, weight: 700, fill: r.ok ? '#1f6a34' : '#a12a1f' }); if (j) s += K.text(cx - 28, TY + 12, '+' + (r.v - m.rows[j - 1].v), { size: 10, fill: 'var(--blue)' }); });
    // 规律
    const RY = 238;
    s += K.text(24, RY + 16, '规律：第 1 个是', { size: 13, weight: 700, anchor: 'start' }) + btn(130, RY, 30, '−', { a: m.a - 1 }, m.a > 0, '第 1 个少 1') + K.text(180, RY + 17, String(m.a), { size: 15, weight: 700 }) + btn(196, RY, 30, '+', { a: m.a + 1 }, m.a < 20, '第 1 个多 1');
    s += K.text(240, RY + 16, '以后每个多', { size: 13, weight: 700, anchor: 'start' }) + btn(318, RY, 30, '−', { d: m.d - 1 }, m.d > 0, '每次少多 1') + K.text(368, RY + 17, String(m.d), { size: 15, weight: 700 }) + btn(384, RY, 30, '+', { d: m.d + 1 }, m.d < 10, '每次多加 1');
    if (m.found) {
      s += K.text(430, RY + 16, '每一行都对上：规律找到了', { size: 12, weight: 700, anchor: 'start', fill: '#1f6a34' });
      const NY = 290;
      s += K.text(24, NY + 16, '第', { size: 13, weight: 700, anchor: 'start' }) + btn(44, NY, 30, '−', { n: m.n - 1 }, m.n > 1, 'n 少 1') + K.text(100, NY + 17, String(m.n), { size: 15, weight: 700 }) + btn(126, NY, 30, '+', { n: m.n + 1 }, m.n < 1000, 'n 多 1') + btn(162, NY, 44, '×10', { n: Math.min(1000, m.n * 10) }, m.n * 10 <= 1000, 'n 乘 10') + K.text(214, NY + 16, '个', { size: 13, weight: 700, anchor: 'start' });
      s += '<g data-read="1">' + K.text(24, NY + 52, '第 ' + m.n + ' 个：' + m.a + ' + (' + m.n + ' − 1) × ' + m.d + ' = ' + m.term + ' ' + m.KD.unit, { size: 15, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + K.text(24, NY + 76, '也就是 ' + m.d + ' × n ' + (m.a - m.d >= 0 ? '+ ' + (m.a - m.d) : '− ' + (m.d - m.a)) + '（n 是第几个）', { size: 12, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
    } else s += K.text(430, RY + 16, m.k < 3 ? '至少摆 3 个再找规律' : '有的行对不上（✗）：再改改', { size: 12, anchor: 'start', fill: m.k < 3 ? '#5a6478' : 'var(--bad)' });
    return s;
  }
  const I = (lo, hi, d, label) => ({ type: 'int', label, default: d, min: lo, max: hi, write: true });
  U.registerPack({
    id: 'seqbench', version: 1,
    types: {
      seqbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E6', 'E8'],
        label: '数列与规律', prefix: '找规律', group: '关系', grades: [3, 7],
        alias: ['找规律', '数列', '第 n 个', '火柴', '摆正方形', '桌子拼起来', '等差', '用字母表示'],
        props: {
          kind: { type: 'choice', label: '摆什么', default: 0, choices: KINDS.map((x) => x.name), write: true },
          k: I(1, 5, 1, '摆了几个图'), a: I(0, 20, 0, '规律：第 1 个是'), d: I(0, 10, 0, '规律：每个多'), n: I(1, 1000, 10, '求第几个'),
        },
        outputs: {
          found: { dim: null, kind: 'num', label: '规律找到了：1（找到才有）' }, d: { dim: null, kind: 'num', label: '每次多几（找到才有）' }, term: { dim: null, kind: 'num', label: '第 n 个（找到规律才有）' },
        },
        icon: () => [0, 1, 2].map((j) => K.line(8 + j * 14, 34, 8 + j * 14, 20, { stroke: '#b5651d', w: 2.5 })).join('') + K.line(8, 34, 36, 34, { stroke: '#b5651d', w: 2.5 }) + K.line(8, 20, 36, 20, { stroke: '#b5651d', w: 2.5 }) + K.text(46, 32, '…', { size: 14, weight: 700 }),
        size: () => [W, 400],
        grips: () => [],
        compute: (c) => { const m = model(c.props), o = {}; if (m.found) { o.found = num(1); o.d = num(m.d); o.term = num(m.term); } return o; },
        badge: () => '',
        draw,
      },
    },
  });
  U.SeqBench = { model };
})(typeof globalThis !== 'undefined' ? globalThis : window);
