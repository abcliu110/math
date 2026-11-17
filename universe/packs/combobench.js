/* 器材包 combobench：搭配（排列组合入门）。
 *   上衣 a 件（一行一件）、裤子 b 条（一列一条），中间是 a × b 的格子。点一个格子就是“这件上衣配这条裤子”，记下一种搭法。
 *   一行一行点，不漏不重：每件上衣都能配 b 条裤子，一共 a × b 种。全部点满写出 a × b。
 *   还有鞋（c 双）：格子点满以后点“再配鞋”，每一种搭法又能配 c 双鞋，一共 a × b × c 种。
 *   另一种玩法（数字卡片）：用几张数字卡排两位数，十位一个、个位一个，同一张不能用两次，点格子列出来。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 700;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? Math.round(+v) : lo));
  const MODES = ['衣服搭配', '数字卡片排两位数'];
  const TOP = ['#e87a6b', '#f5c542', '#6fa3e0', '#7fc17f', '#c9a0dc'], PANT = ['#3a4a63', '#8a6d1a', '#5b7fa8', '#6b8e5a', '#a35a7a'];
  function model(p) {
    const mode = clamp(p.mode, 0, 1), a = clamp(p.a, 1, 5), b = clamp(p.b, 1, 5), c = clamp(p.c, 0, 4);
    const digits = String(p.digits || '1,2,3').split(',').filter((x) => /^\d$/.test(x)).slice(0, 5).map(Number);
    const rows = mode === 0 ? a : digits.length, cols = mode === 0 ? b : digits.length;
    const ok = (i, j) => mode === 0 || (i !== j && digits[i] !== 0);   // 数字卡：同一张不能用两次，十位不能是 0
    const cells = [...new Set(String(p.cells || '').split(',').filter((x) => /^\d+-\d+$/.test(x)))].filter((x) => { const [i, j] = x.split('-').map(Number); return i < rows && j < cols && ok(i, j); });
    let need = 0; for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) if (ok(i, j)) need++;
    const full = cells.length === need, shoes = mode === 0 && c > 0 && !!p.shoes && full;
    return { mode, a, b, c, digits, rows, cols, ok, cells, need, full, shoes, total: shoes ? need * c : need };
  }
  const btn = (x, y, w, label, patch, enabled, tip, active) => '<g' + (enabled ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' data-off="1"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 26, { fill: active ? 'var(--blue)' : enabled ? '#fff' : '#f1f3f6', stroke: enabled || active ? 'var(--blue)' : '#b8c0cc', r: 7, w: 1.4 }) + K.text(x + w / 2, y + 17, label, { size: 12, weight: 700, fill: active ? '#fff' : enabled ? 'var(--ink)' : '#5f6773' }) + '</g>';
  const shirt = (x, y, col) => '<path d="M' + (x - 14) + ' ' + (y - 10) + ' l8 -6 h12 l8 6 l-5 6 h-3 v18 h-12 v-18 h-3 z" fill="' + col + '" stroke="#3a4a63" stroke-width="1.2"/>';
  const pant = (x, y, col) => '<path d="M' + (x - 10) + ' ' + (y - 14) + ' h20 l2 28 h-8 l-4 -18 l-4 18 h-8 z" fill="' + col + '" stroke="#3a4a63" stroke-width="1.2"/>';
  function draw(c) {
    const p = c.props, m = model(p); let s = '';
    MODES.forEach((t, i) => { s += btn(20 + i * 170, 8, 160, t, { mode: i, cells: '', shoes: false }, m.mode !== i, '换到“' + t + '”', m.mode === i); });
    const X0 = 110, Y0 = 92, CW = 62, CH = 44;
    if (m.mode === 0) {
      s += K.text(370, 26, m.a + ' 件上衣、' + m.b + ' 条裤子' + (m.c ? '、' + m.c + ' 双鞋' : '') + '：有几种穿法？', { size: 14, weight: 700, anchor: 'start' });
      for (let i = 0; i < m.a; i++) s += shirt(X0 - 40, Y0 + i * CH + CH / 2, TOP[i]);
      for (let j = 0; j < m.b; j++) s += pant(X0 + j * CW + CW / 2, Y0 - 22, PANT[j]);
    } else {
      s += K.text(370, 26, '用 ' + m.digits.join('、') + ' 排两位数（一张只能用一次）', { size: 14, weight: 700, anchor: 'start' });
      m.digits.forEach((d, i) => { s += K.text(X0 - 40, Y0 + i * CH + CH / 2 + 6, '十位 ' + d, { size: 12, weight: 700 }); s += K.text(X0 + i * CW + CW / 2, Y0 - 12, '个位 ' + d, { size: 12, weight: 700 }); });
    }
    const got = new Set(m.cells);
    for (let i = 0; i < m.rows; i++) for (let j = 0; j < m.cols; j++) {
      const x = X0 + j * CW, y = Y0 + i * CH, k = i + '-' + j, on = got.has(k);
      if (!m.ok(i, j)) { s += K.rect(x + 2, y + 2, CW - 4, CH - 4, { fill: '#eceff4', stroke: '#c5ccda', r: 6, w: 1 }) + K.text(x + CW / 2, y + CH / 2 + 4, '不行', { size: 10, fill: '#8a94a6' }); continue; }
      const label = m.mode === 0 ? (on ? '✓' : '') : (on ? String(m.digits[i]) + m.digits[j] : '');
      const body = K.rect(x + 2, y + 2, CW - 4, CH - 4, { fill: on ? '#d6ecff' : '#fff', stroke: on ? 'var(--blue)' : '#b8c0cc', r: 6, w: 1.2 }) + K.text(x + CW / 2, y + CH / 2 + 5, label, { size: 14, weight: 700, fill: '#1d4fa3' });
      s += '<g data-pick-set="' + encodeURIComponent(JSON.stringify({ cells: (on ? m.cells.filter((x2) => x2 !== k) : m.cells.concat([k])).join(','), shoes: false })) + '" style="cursor:pointer"><title>' + (m.mode === 0 ? '上衣 ' + (i + 1) + ' 配裤子 ' + (j + 1) : '十位 ' + m.digits[i] + '、个位 ' + m.digits[j]) + '</title>' + body + '</g>';
    }
    const R0 = X0 + m.cols * CW + 30;
    s += K.text(R0, 110, '已经列出 ' + m.cells.length + ' 种', { size: 13, weight: 700, anchor: 'start' });
    if (m.full) s += '<g data-read="1">' + K.text(R0, 140, m.mode === 0 ? m.a + ' × ' + m.b + ' = ' + m.need + ' 种' : '一共 ' + m.need + ' 个两位数', { size: 15, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + K.text(R0, 162, m.mode === 0 ? '每件上衣都能配 ' + m.b + ' 条裤子' : '十位有几种选法，个位就少一种', { size: 12, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
    if (m.mode === 0 && m.c > 0) {
      s += btn(R0, 186, 150, '再配鞋（' + m.c + ' 双）', { shoes: true }, m.full && !m.shoes, m.full ? '每一种穿法再配一双鞋' : '先把上衣和裤子的搭法列全');
      if (m.shoes) s += '<g data-shoes="1">' + K.text(R0, 240, m.need + ' × ' + m.c + ' = ' + m.total + ' 种', { size: 16, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + K.text(R0, 262, '每一种穿法都能配 ' + m.c + ' 双鞋', { size: 12, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
    }
    return s;
  }
  const I = (lo, hi, d, label) => ({ type: 'int', label, default: d, min: lo, max: hi, write: true });
  U.registerPack({
    id: 'combobench', version: 1,
    types: {
      combobench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E1', 'E2'],
        label: '搭配', prefix: '搭配', group: '统计与概率', grades: [2, 3],
        alias: ['搭配', '有几种', '排列', '组合', '衣服搭配', '数字卡片', '不重不漏'],
        props: {
          mode: { type: 'choice', label: '做什么', default: 0, choices: MODES, write: true },
          a: I(1, 5, 3, '上衣几件'), b: I(1, 5, 2, '裤子几条'), c: I(0, 4, 0, '鞋几双（0 就是不配鞋）'), digits: { type: 'text', label: '数字卡片（逗号分开）', default: '1,2,3', write: true },
          cells: { type: 'text', label: '点过的格子（自动）', default: '', write: true }, shoes: { type: 'bool', label: '配了鞋', default: false, write: true },
        },
        outputs: {
          listed: { dim: null, kind: 'num', label: '已经列出几种' }, pairs: { dim: null, kind: 'num', label: '列全了：一共几种（列全才有）' }, all: { dim: null, kind: 'num', label: '配上鞋一共几种（配了才有）' },
        },
        icon: () => K.rect(6, 8, 44, 32, { fill: '#fff', stroke: 'var(--ink)', r: 2, w: 1 }) + K.line(20, 8, 20, 40, { w: 1 }) + K.line(35, 8, 35, 40, { w: 1 }) + K.line(6, 24, 50, 24, { w: 1 }) + K.text(13, 20, '✓', { size: 9, weight: 700 }),
        size: () => [W, 400],
        grips: () => [],
        compute: (c) => { const m = model(c.props), o = { listed: num(m.cells.length) }; if (m.full) o.pairs = num(m.need); if (m.shoes) o.all = num(m.total); return o; },
        badge: () => '',
        draw,
      },
    },
  });
  U.ComboBench = { model };
})(typeof globalThis !== 'undefined' ? globalThis : window);
