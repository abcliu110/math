/* 器材包 mulbench：竖式乘法（和面积图对着看）。左边是竖式，右边是同一道题的面积图。
 * 23 × 14：把 23 拆成 20 和 3，把 14 拆成 10 和 4，面积图切成 4 块；竖式的每一行，是面积图里横着的一条。
 * 全部在图上直接动手：
 *   - 点一个格子（面积图里的一块、竖式里的一行、最后的得数），它变成蓝框；再点下面的数字键填数。
 *   - 填对了变绿，自动跳到下一个；填满了但不对是红框，按“退格”改。
 *   - 点竖式的一行，面积图里对应的那一条亮起来：这一行就是这几块加起来。点面积图的一块，下面写出它是哪两个数相乘。
 *   - 一行填对以后，下面写出这一行是怎么一位一位乘出来的（哪里进位）。
 * 这一版的边界（如实写）：只做乘法；上面的数最多三位，下面的数最多两位；填数是从左往右写整个数，不是一位一位从个位写起；
 *   面积图的大小只是示意，不按真实比例。加减法和除法的竖式还没有做。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 700, DX = 30, RX = 270, AX = 372, AY = 84, KY = 318;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const partsOf = (n) => { const s = String(n), out = []; for (let i = 0; i < s.length; i++) { const d = +s[i]; if (d) out.push(d * Math.pow(10, s.length - 1 - i)); } return out; };   // 205 → [200, 5]
  function model(p) {
    const a = clamp(p.a, 2, 999), b = clamp(p.b, 2, 99), pa = partsOf(a), pb = partsOf(b).reverse();   // pb：个位那一部分在前（竖式先乘个位）
    const useCells = p.cells !== false && p.cells !== 0, boxes = [];
    if (useCells) pb.forEach((y, r) => pa.forEach((x, k) => boxes.push({ kind: 'cell', r, k, want: x * y, x, y })));
    if (pb.length > 1) pb.forEach((y, r) => boxes.push({ kind: 'row', r, want: a * y, y }));
    boxes.push({ kind: 'sum', want: a * b });
    const raw = String(p.vals || '').split(',');
    boxes.forEach((bx, i) => {
      bx.v = String(raw[i] || '').replace(/\D/g, '').slice(0, 7); const w = String(bx.want);
      bx.st = bx.v === '' ? 'empty' : bx.v === w ? 'ok' : bx.v.length >= w.length ? 'wrong' : 'part';
    });
    const sel = clamp(p.sel, 0, boxes.length - 1), cnt = (kind, st) => boxes.filter((x) => (!kind || x.kind === kind) && x.st === st).length;
    return { a, b, pa, pb, boxes, sel, useCells, cellsok: cnt('cell', 'ok'), rowsok: cnt('row', 'ok'), wrong: cnt(null, 'wrong'), done: boxes.every((x) => x.st === 'ok') ? 1 : 0, sumok: boxes[boxes.length - 1].st === 'ok' };
  }
  const ser = (m, i, v) => m.boxes.map((x, j) => (j === i ? v : x.v)).join(',');
  // 在选中的格子里按一个键：返回要改的属性
  function press(p, key) {
    const m = model(p), i = m.sel, bx = m.boxes[i], w = String(bx.want);
    let v = bx.v;
    if (key === 'back') v = v.slice(0, -1); else { if (bx.st === 'ok' || v.length >= w.length + 1) return {}; v = v === '0' ? String(key) : v + key; }
    const o = { vals: ser(m, i, v) };
    if (v === w) { let nx = m.boxes.findIndex((x, j) => j > i && x.st !== 'ok'); if (nx < 0) nx = m.boxes.findIndex((x, j) => j !== i && x.st !== 'ok'); if (nx >= 0) o.sel = nx; }
    return o;
  }
  // 一行是怎么一位一位乘出来的
  function steps(a, d, tens) {
    const ds = String(a).split('').reverse().map(Number), out = []; let carry = 0;
    ds.forEach((x, i) => { const v = x * d + carry, last = i === ds.length - 1; out.push(x + ' × ' + d + (carry ? ' + ' + carry : '') + ' = ' + v + (v >= 10 && !last ? '（写 ' + (v % 10) + ' 进 ' + Math.floor(v / 10) + '）' : '')); carry = Math.floor(v / 10); });
    return out.join('；') + (tens ? '；乘的是 ' + d + ' 个十，末尾添 0' : '');
  }
  const pick = (patch, inner, tip) => '<g data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer">' + (tip ? '<title>' + K.esc(tip) + '</title>' : '') + inner + '</g>';
  const COLS = { empty: ['#fff', '#8a94a8'], part: ['#fff', '#8a94a8'], ok: ['#dff3e4', '#1f8a4c'], wrong: ['#fde8e8', '#c0392b'] };
  function boxSvg(m, i, x, y, w, h, size, anchorEnd) {
    const bx = m.boxes[i], on = m.sel === i, c = COLS[bx.st], tx = bx.v === '' ? '?' : bx.v;
    return pick({ sel: i }, '<rect data-box="' + i + '" data-st="' + bx.st + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="5" fill="' + c[0] + '" stroke="' + (on ? 'var(--blue)' : c[1]) + '" stroke-width="' + (on ? 3 : 1.4) + '"/>' +
      K.text(anchorEnd ? x + w - 8 : x + w / 2, y + h / 2 + size * 0.36, tx, { size, weight: 700, anchor: anchorEnd ? 'end' : 'middle', fill: bx.v === '' ? '#8a94a8' : 'var(--ink)', family: 'ui-monospace, Consolas, monospace' }), '点一下选中，再点下面的数字');
  }

  function draw(c) {
    const p = c.props, m = model(p), sb = m.boxes[m.sel], mono = { size: 22, weight: 700, anchor: 'end', family: 'ui-monospace, Consolas, monospace' };
    let s = '';
    // ---- 左边：竖式 ----
    s += K.text(DX, 30, '竖式', { size: 13, weight: 700, anchor: 'start' }) + K.text(RX - 8, 78, String(m.a), mono) + K.text(RX - 8, 110, String(m.b), mono) + K.text(RX - 118, 110, '×', { size: 22, weight: 700 }) + K.line(RX - 140, 120, RX, 120, { w: 2 });
    let y = 128; const rowsI = m.boxes.map((x, i) => (x.kind === 'row' ? i : -1)).filter((i) => i >= 0), sumI = m.boxes.length - 1;
    rowsI.forEach((i) => { const bx = m.boxes[i]; s += boxSvg(m, i, RX - 140, y, 140, 34, 22, true) + K.text(RX - 148, y + 23, m.a + ' × ' + bx.y, { size: 11, anchor: 'end', fill: '#5a6478' }); y += 40; });
    if (rowsI.length) { s += K.line(RX - 140, y, RX, y, { w: 2 }); y += 8; }
    s += boxSvg(m, sumI, RX - 140, y, 140, 34, 22, true) + K.text(RX - 148, y + 23, rowsI.length ? '加起来' : m.a + ' × ' + m.b, { size: 11, anchor: 'end', fill: '#5a6478' });
    // ---- 右边：面积图 ----
    const cw = m.pa.map((x, k) => (m.pa.length === 1 ? 240 : k === m.pa.length - 1 ? 84 : (300 - 84) / (m.pa.length - 1))), rh = m.pb.map((yv, r) => (m.pb.length === 1 ? 120 : r === 0 ? 72 : 112));
    const xs = []; let x = AX; cw.forEach((w) => { xs.push(x); x += w; });
    // 面积图里上面一条是十位那部分，下面一条是个位那部分（和 14 = 10 + 4 的写法顺序一样）
    const order = m.pb.map((_, r) => r).reverse(), ys = {}; let yy = AY; order.forEach((r) => { ys[r] = yy; yy += rh[r]; });
    s += K.text(AX, 30, '面积图：' + m.a + ' × ' + m.b + ' 切成 ' + m.pa.length * m.pb.length + ' 块', { size: 13, weight: 700, anchor: 'start' });
    m.pa.forEach((v, k) => { s += K.text(xs[k] + cw[k] / 2, AY - 10, String(v), { size: 14, weight: 700 }); });
    m.pb.forEach((v, r) => { s += K.text(AX - 10, ys[r] + rh[r] / 2 + 5, String(v), { size: 14, weight: 700, anchor: 'end' }); });
    m.pb.forEach((yv, r) => m.pa.forEach((xv, k) => {
      const hot = sb.kind === 'sum' || (sb.kind === 'row' && sb.r === r) || (sb.kind === 'cell' && sb.r === r && sb.k === k), i = m.useCells ? m.boxes.findIndex((b2) => b2.kind === 'cell' && b2.r === r && b2.k === k) : -1;
      s += '<rect data-area="' + r + '-' + k + '" data-hot="' + (hot ? 1 : 0) + '" x="' + xs[k] + '" y="' + ys[r] + '" width="' + cw[k] + '" height="' + rh[r] + '" fill="' + (hot ? '#dbe8fa' : '#f6f8fc') + '" stroke="var(--ink)" stroke-width="1.5"/>';
      s += K.text(xs[k] + 8, ys[r] + 18, xv + ' × ' + yv, { size: 11, anchor: 'start', fill: '#5a6478' });
      if (i >= 0) s += boxSvg(m, i, xs[k] + cw[k] / 2 - 34, ys[r] + rh[r] / 2 - 6, 68, 30, 17, false);
    }));
    // ---- 说明：选中的是什么 ----
    let note = '';
    if (sb.kind === 'cell') note = '这一块：' + sb.x + ' × ' + sb.y + (sb.st === 'ok' ? ' = ' + sb.want : '');
    else if (sb.kind === 'row') note = sb.st === 'ok' ? steps(m.a, +String(sb.y)[0], sb.y >= 10) : '这一行：' + m.a + ' × ' + sb.y + ' = ' + m.pa.map((v) => v + ' × ' + sb.y).join(' + ') + '（面积图里亮着的那一条）';
    else note = rowsI.length ? (sb.st === 'ok' ? m.a + ' × ' + m.b + ' = ' + sb.want + '：' + m.pa.length * m.pb.length + ' 块全部加起来' : '最后一行：把上面几行加起来，就是整块的面积') : (sb.st === 'ok' ? steps(m.a, +String(m.b)[0], m.b >= 10) : m.a + ' × ' + m.b + ' = ' + m.pa.map((v) => v + ' × ' + m.b).join(' + '));
    s += '<g data-note="1">' + K.text(DX, KY - 14, note, { size: 13, weight: 700, anchor: 'start', fill: sb.st === 'wrong' ? 'var(--bad)' : 'var(--blue)' }) + '</g>';
    if (sb.st === 'wrong') s += K.text(W - 20, KY - 14, '不对，按“退格”改', { size: 12, weight: 700, anchor: 'end', fill: 'var(--bad)' });
    // ---- 数字键 ----
    for (let d = 0; d <= 9; d++) { const kx = DX + d * 46, patch = press(p, d), on = Object.keys(patch).length > 0; s += '<g data-key="' + d + '"' + (on ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' opacity="0.4"') + '>' + K.rect(kx, KY, 40, 34, { fill: '#fff', stroke: 'var(--blue)', r: 7, w: 1.5 }) + K.text(kx + 20, KY + 23, String(d), { size: 17, weight: 700 }) + '</g>'; }
    const bp = press(p, 'back'), bon = sb.v !== '' && sb.st !== 'ok';
    s += '<g data-key="back"' + (bon ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(bp)) + '" style="cursor:pointer"' : ' opacity="0.4"') + '>' + K.rect(DX + 460, KY, 70, 34, { fill: '#fff', stroke: 'var(--blue)', r: 7, w: 1.5 }) + K.text(DX + 495, KY + 22, '退格', { size: 13, weight: 700 }) + '</g>';
    if (m.done) s += K.text(W - 20, KY + 23, '全部填对了', { size: 14, weight: 700, anchor: 'end', fill: 'var(--good)' });
    return s;
  }
  const I = (lo, hi, d, label, o) => Object.assign({ type: 'int', label, default: d, min: lo, max: hi, write: true }, o || {});
  U.registerPack({
    id: 'mulbench', version: 1,
    types: {
      mulbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E2', 'E7'],
        label: '竖式乘法（对着面积图）', prefix: '竖式乘法', group: '数与运算', grades: [3, 6],
        alias: ['竖式', '多位数乘法', '两位数乘两位数', '三位数乘两位数', '笔算乘法', '进位', '面积模型'],
        props: {
          a: I(2, 999, 23, '上面的数'), b: I(2, 99, 14, '下面的数'),
          cells: { type: 'bool', label: '面积图里的每一块也要填', default: true, write: true },
          vals: { type: 'text', label: '填的数（自动记录）', default: '', write: true, hidden: true },
          sel: I(0, 20, 0, '现在选中第几个格子（自动）', { hidden: true }),
        },
        outputs: {
          done: { dim: null, kind: 'num', label: '全部填对：1 是，0 否' }, product: { dim: null, kind: 'num', label: '得数（填对了才有）' },
          cellsok: { dim: null, kind: 'num', label: '面积图里填对几块' }, rowsok: { dim: null, kind: 'num', label: '竖式里填对几行' }, wrong: { dim: null, kind: 'num', label: '现在有几个格子填错了' },
        },
        icon: () => K.text(46, 16, '23', { size: 12, weight: 700, anchor: 'end' }) + K.text(46, 30, '×14', { size: 12, weight: 700, anchor: 'end' }) + K.line(18, 34, 48, 34, { w: 1.5 }),
        size: () => [W, 396],
        grips: () => [],
        compute: (c) => { const m = model(c.props), o = { done: num(m.done), cellsok: num(m.cellsok), rowsok: num(m.rowsok), wrong: num(m.wrong) }; if (m.sumok) o.product = num(m.a * m.b); return o; },
        badge: () => '',
        draw,
      },
    },
  });
  U.MulBench = { model, press, partsOf, steps, full: (p) => model(p).boxes.map((x) => x.want).join(',') };
})(typeof globalThis !== 'undefined' ? globalThis : window);
