/* 器材包 areamodel：面积模型（docs/instrument-design.md 的样板操作台）。
 * 一块长方形，三种用法，全部在卡片上直接动手，不用开属性面板：
 *   整数乘法：拖右边和下边改长和宽；从左上角的 ✂ 拖出一刀，把长方形切成几块。每块的面积写在块里，
 *            下面的算式跟着变：13 × 7 = (10 + 3) × 7 = 70 + 21 = 91。这就是分配律，也是竖式乘法在做的事。
 *   分数乘法：整块是 1。竖着切 d1 份、涂 n1 份；横着切 d2 份、取 n2 份。重叠的格子就是积。拖涂色的边改分子，点 − ＋ 改分母。
 *   代数式：  边长是 x + a 和 x + b。拖边改 a、b，四块分别是 x²、ax、bx、ab，合起来就是展开式；反过来读就是因式分解。
 * 三种用法是同一件事：长方形的面积 = 长 × 宽，把边拆开，面积就拆成几块的和。
 * 把手（grips）用的是公共机制：器材声明把手在哪、拖到某处该把哪个属性改成什么；界面只负责画和转发（见 js/ui/stage-cards.js、stage-drag.js）。
 * 尺寸固定按格算（每格 CELL 像素），所以拖动时把手一直跟着鼠标。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', typeof n === 'number' ? Q(n) : n, { dim: null });
  const MODES = ['整数乘法', '分数乘法', '代数式'];
  const X0 = 46, Y0 = 44, CELL = 17, WMAX = 20, HMAX = 12, UNIT = 204, XLEN = 110, AMAX = 9;
  const COL = ['#cfe3fb', '#fde2c4', '#d6f0d6', '#ead9f7', '#fbd5dc', '#fff3bf'];
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  // "10,5" → 升序、去重、落在 (0, max) 里的整数
  function cuts(text, max) {
    const out = [];
    for (const s of String(text === undefined || text === null ? '' : text).split(/[,，\s]+/)) {
      const n = Number(s); if (s !== '' && Number.isInteger(n) && n > 0 && n < max && !out.includes(n)) out.push(n);
    }
    return out.sort((a, b) => a - b);
  }
  const segs = (cs, max) => { const e = [0].concat(cs, [max]); return e.slice(1).map((x, i) => x - e[i]); };
  // 一段“好算”：整十，或者不到十
  const easy = (n) => n < 10 || n % 10 === 0;

  function model(p) {
    if (p.mode === 1) {
      const d1 = clamp(p.d1, 1, 12), d2 = clamp(p.d2, 1, 12), n1 = clamp(p.n1, 0, d1), n2 = clamp(p.n2, 0, d2);
      return { mode: 1, d1, d2, n1, n2, cells: n1 * n2, total: d1 * d2, area: Q(n1 * n2, d1 * d2) };
    }
    if (p.mode === 2) {
      const a = clamp(p.a, 0, AMAX), b = clamp(p.b, 0, AMAX);
      return { mode: 2, a, b, p1: a + b, p0: a * b, square: a === b ? 1 : 0 };
    }
    const w = clamp(p.w, 1, WMAX), h = clamp(p.h, 1, HMAX), vc = cuts(p.vcuts, w), hc = cuts(p.hcuts, h);
    const ws = segs(vc, w), hs = segs(hc, h), parts = ws.length * hs.length;
    return { mode: 0, w, h, vc, hc, ws, hs, parts, area: w * h, perim: 2 * (w + h), square: w === h ? 1 : 0,
      friendly: parts >= 2 && ws.every(easy) && hs.every(easy) ? 1 : 0 };
  }

  // 下面的算式：一行一行，从“整块”到“拆开”到“每块”到“总数”
  function lines(m) {
    if (m.mode === 0) {
      const side = (s) => (s.length > 1 ? '(' + s.join(' + ') + ')' : String(s[0]));
      const out = [m.w + ' × ' + m.h + ' = ' + m.area];
      if (m.parts > 1) {
        const terms = [], vals = [];
        for (const hh of m.hs) for (const ww of m.ws) { terms.push(ww + '×' + hh); vals.push(ww * hh); }
        out[0] = m.w + ' × ' + m.h + ' = ' + side(m.ws) + ' × ' + side(m.hs);
        out.push('= ' + terms.join(' + '));
        out.push('= ' + vals.join(' + ') + ' = ' + m.area);
      }
      return out;
    }
    if (m.mode === 1) return [m.n1 + '/' + m.d1 + ' × ' + m.n2 + '/' + m.d2 + ' = ' + m.cells + '/' + m.total + (Q.show(m.area) !== m.cells + '/' + m.total ? ' = ' + Q.show(m.area) : ''),
      '整块切成 ' + m.d1 + ' × ' + m.d2 + ' = ' + m.total + ' 小格，两种颜色重叠的有 ' + m.n1 + ' × ' + m.n2 + ' = ' + m.cells + ' 格'];
    const t = (k, s) => (k === 0 ? '' : (k === 1 && s ? '' : k) + s);
    const sideA = 'x' + (m.a ? ' + ' + m.a : ''), sideB = 'x' + (m.b ? ' + ' + m.b : '');
    const exp = ['x²', t(m.a, 'x'), t(m.b, 'x'), m.p0 ? String(m.p0) : ''].filter(Boolean).join(' + ');
    const col = ['x²', t(m.p1, 'x'), m.p0 ? String(m.p0) : ''].filter(Boolean).join(' + ');
    return ['(' + sideA + ')(' + sideB + ') = ' + exp, exp === col ? '' : '= ' + col].filter(Boolean);
  }

  const rect = (x, y, w, h, fill, o) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + fill + '" stroke="' + ((o && o.stroke) || 'var(--ink)') + '" stroke-width="' + ((o && o.sw) || 1.2) + '"' + (o && o.op !== undefined ? ' fill-opacity="' + o.op + '"' : '') + '/>';
  const T = (x, y, s, o) => K.text(x, y, s, Object.assign({ size: 12, fill: 'var(--ink)' }, o || {}));
  const pickBtn = (x, y, tx, k, v, tip) => '<g data-pick-k="' + k + '" data-pick-v="' + v + '" style="cursor:pointer"><title>' + K.esc(tip) + '</title>' + K.rect(x, y, 22, 20, { fill: '#fff', stroke: '#8a94a8', r: 5 }) + T(x + 11, y + 15, tx, { size: 14, weight: 700 }) + '</g>';

  function drawInt(c, m) {
    let s = '';
    // 格线（淡），再画每一块
    for (let i = 1; i < m.w; i++) s += K.line(X0 + i * CELL, Y0, X0 + i * CELL, Y0 + m.h * CELL, { stroke: '#c5ccda', w: 0.6 });
    let y = 0, k = 0, blocks = '';
    for (const hh of m.hs) {
      let x = 0;
      for (const ww of m.ws) {
        const px = X0 + x * CELL, py = Y0 + y * CELL, pw = ww * CELL, ph = hh * CELL;
        blocks += rect(px, py, pw, ph, COL[k % COL.length], { op: 0.85 });
        if (m.parts > 1) {
          if (pw >= 50 && ph >= 34) blocks += T(px + pw / 2, py + ph / 2 - 2, ww + '×' + hh, { size: 12 }) + T(px + pw / 2, py + ph / 2 + 13, '= ' + ww * hh, { size: 13, weight: 700 });
          else if (pw >= 26 && ph >= 16) blocks += T(px + pw / 2, py + ph / 2 + 5, String(ww * hh), { size: 12, weight: 700 });
        }
        x += ww; k++;
      }
      y += hh;
    }
    let grid = '';
    for (let j = 1; j < m.h; j++) grid += K.line(X0, Y0 + j * CELL, X0 + m.w * CELL, Y0 + j * CELL, { stroke: '#8a94a8', w: 0.35 });
    for (let i = 1; i < m.w; i++) grid += K.line(X0 + i * CELL, Y0, X0 + i * CELL, Y0 + m.h * CELL, { stroke: '#8a94a8', w: 0.35 });
    s = blocks + grid;
    for (const v of m.vc) s += K.line(X0 + v * CELL, Y0 - 4, X0 + v * CELL, Y0 + m.h * CELL, { stroke: 'var(--blue)', w: 2.5 });
    for (const v of m.hc) s += K.line(X0 - 4, Y0 + v * CELL, X0 + m.w * CELL, Y0 + v * CELL, { stroke: 'var(--blue)', w: 2.5 });
    // 边上的长度：每一段写一个数
    let x = 0; for (const ww of m.ws) { s += T(X0 + (x + ww / 2) * CELL, Y0 + m.h * CELL + 16, String(ww), { size: 13, weight: 700 }); x += ww; }
    let yy = 0; for (const hh of m.hs) { s += T(X0 + m.w * CELL + 26, Y0 + (yy + hh / 2) * CELL + 5, String(hh), { size: 13, weight: 700 }); yy += hh; }
    if (m.parts === 1 && c.props.show) s += T(X0 + m.w * CELL / 2, Y0 + m.h * CELL / 2 + 5, m.w + ' × ' + m.h, { size: 14, weight: 700 });
    return s;
  }
  function drawFrac(c, m) {
    let s = rect(X0, Y0, UNIT, UNIT, '#fff');
    const cw = UNIT / m.d1, ch = UNIT / m.d2;
    if (m.n1) s += rect(X0, Y0, m.n1 * cw, UNIT, '#f5a25d', { op: 0.55, stroke: 'none' });
    if (m.n2) s += rect(X0, Y0, UNIT, m.n2 * ch, '#5b9bd5', { op: 0.5, stroke: 'none' });
    if (m.cells) s += rect(X0, Y0, m.n1 * cw, m.n2 * ch, '#7a4fb3', { op: 0.55, stroke: '#4c2a85', sw: 2.5 });
    for (let i = 1; i < m.d1; i++) s += K.line(X0 + i * cw, Y0, X0 + i * cw, Y0 + UNIT, { stroke: 'var(--ink)', w: 1 });
    for (let j = 1; j < m.d2; j++) s += K.line(X0, Y0 + j * ch, X0 + UNIT, Y0 + j * ch, { stroke: 'var(--ink)', w: 1 });
    s += rect(X0, Y0, UNIT, UNIT, 'none', { sw: 2 });
    // 右边：两个分数和改分母的按钮
    const bx = X0 + UNIT + 34;
    s += T(bx + 44, Y0 + 14, '竖着切 ' + m.d1 + ' 份，涂 ' + m.n1 + ' 份', { size: 12, fill: '#a85410', weight: 700 });
    s += pickBtn(bx, Y0 + 22, '−', 'd1', Math.max(1, m.d1 - 1), '竖着少切一份') + pickBtn(bx + 28, Y0 + 22, '＋', 'd1', Math.min(12, m.d1 + 1), '竖着多切一份');
    s += T(bx + 80, Y0 + 38, m.n1 + '/' + m.d1, { size: 15, weight: 700, fill: '#a85410' });
    s += T(bx + 44, Y0 + 74, '横着切 ' + m.d2 + ' 份，取 ' + m.n2 + ' 份', { size: 12, fill: '#1d5fa8', weight: 700 });
    s += pickBtn(bx, Y0 + 82, '−', 'd2', Math.max(1, m.d2 - 1), '横着少切一份') + pickBtn(bx + 28, Y0 + 82, '＋', 'd2', Math.min(12, m.d2 + 1), '横着多切一份');
    s += T(bx + 80, Y0 + 98, m.n2 + '/' + m.d2, { size: 15, weight: 700, fill: '#1d5fa8' });
    s += T(bx + 44, Y0 + 138, '重叠（紫色）：', { size: 12, fill: '#4c2a85', weight: 700 });
    s += T(bx + 44, Y0 + 160, c.masked ? '？' : m.cells + '/' + m.total, { size: 18, weight: 700, fill: '#4c2a85' });
    return s;
  }
  function drawAlg(c, m) {
    const aw = m.a * CELL, bh = m.b * CELL;
    let s = rect(X0, Y0, XLEN, XLEN, COL[0]) + T(X0 + XLEN / 2, Y0 + XLEN / 2 + 6, 'x²', { size: 17, weight: 700 });
    if (m.a) {
      s += rect(X0 + XLEN, Y0, aw, XLEN, COL[1]);
      for (let i = 1; i < m.a; i++) s += K.line(X0 + XLEN + i * CELL, Y0, X0 + XLEN + i * CELL, Y0 + XLEN, { stroke: '#8a94a8', w: 0.5 });
      if (aw >= 30) s += T(X0 + XLEN + aw / 2, Y0 + XLEN / 2 + 5, m.a + 'x', { size: 14, weight: 700 });
    }
    if (m.b) {
      s += rect(X0, Y0 + XLEN, XLEN, bh, COL[2]);
      for (let j = 1; j < m.b; j++) s += K.line(X0, Y0 + XLEN + j * CELL, X0 + XLEN, Y0 + XLEN + j * CELL, { stroke: '#8a94a8', w: 0.5 });
      if (bh >= 16) s += T(X0 + XLEN / 2, Y0 + XLEN + bh / 2 + 5, m.b + 'x', { size: 14, weight: 700 });
    }
    if (m.a && m.b) {
      s += rect(X0 + XLEN, Y0 + XLEN, aw, bh, COL[3]);
      for (let i = 1; i < m.a; i++) s += K.line(X0 + XLEN + i * CELL, Y0 + XLEN, X0 + XLEN + i * CELL, Y0 + XLEN + bh, { stroke: '#8a94a8', w: 0.5 });
      for (let j = 1; j < m.b; j++) s += K.line(X0 + XLEN, Y0 + XLEN + j * CELL, X0 + XLEN + aw, Y0 + XLEN + j * CELL, { stroke: '#8a94a8', w: 0.5 });
      if (aw >= 30 && bh >= 16) s += T(X0 + XLEN + aw / 2, Y0 + XLEN + bh / 2 + 5, String(m.p0), { size: 14, weight: 700 });
    }
    // 边上的长度
    s += T(X0 + XLEN / 2, Y0 - 8, 'x', { size: 14, weight: 700 }) + (m.a ? T(X0 + XLEN + aw / 2, Y0 - 8, String(m.a), { size: 14, weight: 700 }) : '');
    s += T(X0 - 14, Y0 + XLEN / 2 + 5, 'x', { size: 14, weight: 700 }) + (m.b ? T(X0 - 14, Y0 + XLEN + bh / 2 + 5, String(m.b), { size: 14, weight: 700 }) : '');
    return s;
  }
  // 画布里图形下面那几行算式从哪里开始
  const textTop = (m) => (m.mode === 0 ? Y0 + HMAX * CELL + 34 : m.mode === 1 ? Y0 + UNIT + 40 : Y0 + XLEN + AMAX * CELL + 30);

  // 把手：每个把手说明自己在哪、拖到 p（画布像素）时该把哪些属性改成什么
  function grips(c) {
    const p = c.props, m = model(p), out = [];
    if (m.mode === 0) {
      const toX = (q) => Math.round((q.x - X0) / CELL), toY = (q) => Math.round((q.y - Y0) / CELL);
      const txt = (list) => list.join(',');
      out.push({ id: 'w', x: X0 + m.w * CELL, y: Y0 + m.h * CELL / 2, shape: 'bar-v', cursor: 'ew-resize', tip: '左右拖：改长',
        drag: (c0, q) => { const w = clamp(toX(q), 1, WMAX); return { w, vcuts: txt(cuts(c0.props.vcuts, w)) }; }, say: (c1) => '长 ' + c1.props.w });
      out.push({ id: 'h', x: X0 + m.w * CELL / 2, y: Y0 + m.h * CELL, shape: 'bar-h', cursor: 'ns-resize', tip: '上下拖：改宽',
        drag: (c0, q) => { const h = clamp(toY(q), 1, HMAX); return { h, hcuts: txt(cuts(c0.props.hcuts, h)) }; }, say: (c1) => '宽 ' + c1.props.h });
      // 新切一刀：从角上的 ✂ 拖出来；已有的刀：拖着挪，拖到边上就是去掉
      out.push({ id: 'vnew', x: X0, y: Y0 - 18, r: 9, text: '✂', cursor: 'col-resize', tip: '往右拖：竖着切一刀',
        drag: (c0, q) => { const x = toX(q), w = model(c0.props).w; return x > 0 && x < w ? { vcuts: txt(cuts(c0.props.vcuts + ',' + x, w)) } : { vcuts: txt(cuts(c0.props.vcuts, w)) }; },
        say: (c1) => '竖着切在 ' + (cuts(c1.props.vcuts, WMAX + 1).join('、') || '（还没切）') });
      m.vc.forEach((v, i) => out.push({ id: 'v' + i, x: X0 + v * CELL, y: Y0 - 18, r: 7, cursor: 'col-resize', tip: '拖着挪这一刀；拖到边上就去掉',
        drag: (c0, q) => { const m0 = model(c0.props), rest = m0.vc.filter((_, j) => j !== i), x = toX(q); return { vcuts: txt(cuts(rest.concat(x > 0 && x < m0.w ? [x] : []).join(','), m0.w)) }; },
        say: (c1) => '竖着切在 ' + (cuts(c1.props.vcuts, WMAX + 1).join('、') || '（去掉了）') }));
      out.push({ id: 'hnew', x: X0 - 18, y: Y0, r: 9, text: '✂', cursor: 'row-resize', tip: '往下拖：横着切一刀',
        drag: (c0, q) => { const y = toY(q), h = model(c0.props).h; return y > 0 && y < h ? { hcuts: txt(cuts(c0.props.hcuts + ',' + y, h)) } : { hcuts: txt(cuts(c0.props.hcuts, h)) }; },
        say: (c1) => '横着切在 ' + (cuts(c1.props.hcuts, HMAX + 1).join('、') || '（还没切）') });
      m.hc.forEach((v, i) => out.push({ id: 'hc' + i, x: X0 - 18, y: Y0 + v * CELL, r: 7, cursor: 'row-resize', tip: '拖着挪这一刀；拖到边上就去掉',
        drag: (c0, q) => { const m0 = model(c0.props), rest = m0.hc.filter((_, j) => j !== i), y = toY(q); return { hcuts: txt(cuts(rest.concat(y > 0 && y < m0.h ? [y] : []).join(','), m0.h)) }; },
        say: (c1) => '横着切在 ' + (cuts(c1.props.hcuts, HMAX + 1).join('、') || '（去掉了）') }));
    } else if (m.mode === 1) {
      out.push({ id: 'n1', x: X0 + m.n1 * UNIT / m.d1, y: Y0 + UNIT + 12, shape: 'bar-v', cursor: 'ew-resize', tip: '左右拖：竖着涂几份',
        drag: (c0, q) => { const d = model(c0.props).d1; return { n1: clamp(Math.round((q.x - X0) / UNIT * d), 0, d) }; }, say: (c1) => '涂 ' + c1.props.n1 + '/' + c1.props.d1 });
      out.push({ id: 'n2', x: X0 - 12, y: Y0 + m.n2 * UNIT / m.d2, shape: 'bar-h', cursor: 'ns-resize', tip: '上下拖：横着取几份',
        drag: (c0, q) => { const d = model(c0.props).d2; return { n2: clamp(Math.round((q.y - Y0) / UNIT * d), 0, d) }; }, say: (c1) => '取 ' + c1.props.n2 + '/' + c1.props.d2 });
    } else {
      out.push({ id: 'a', x: X0 + XLEN + m.a * CELL, y: Y0 + XLEN / 2, shape: 'bar-v', cursor: 'ew-resize', tip: '左右拖：这条边是 x + 几',
        drag: (c0, q) => ({ a: clamp(Math.round((q.x - X0 - XLEN) / CELL), 0, AMAX) }), say: (c1) => 'x + ' + c1.props.a });
      out.push({ id: 'b', x: X0 + XLEN / 2, y: Y0 + XLEN + m.b * CELL, shape: 'bar-h', cursor: 'ns-resize', tip: '上下拖：这条边是 x + 几',
        drag: (c0, q) => ({ b: clamp(Math.round((q.y - Y0 - XLEN) / CELL), 0, AMAX) }), say: (c1) => 'x + ' + c1.props.b });
    }
    return out;
  }

  const I = (lo, hi, d, label, write) => ({ type: 'int', label, default: d, min: lo, max: hi, write: write !== false });
  U.registerPack({
    id: 'areamodel', version: 1,
    types: {
      areamodel: {
        workspaceRole: 'none', handles: true, compactPorts: true, essence: ['E5', 'E2'],
        label: '面积模型', prefix: '面积模型', group: '数与运算', grades: [2, 9],
        alias: ['乘法', '分配律', '面积', '竖式乘法', '分数乘法', '多项式乘法', '因式分解', '完全平方', '点阵', '代数砖'],
        props: {
          mode: { type: 'choice', label: '用来做什么', default: 0, choices: MODES, write: true },
          w: I(1, WMAX, 13, '长'), h: I(1, HMAX, 7, '宽'),
          vcuts: { type: 'text', label: '竖着切在（用逗号分开）', default: '', write: true },
          hcuts: { type: 'text', label: '横着切在（用逗号分开）', default: '', write: true },
          d1: I(1, 12, 2, '竖着切几份'), n1: I(0, 12, 1, '竖着涂几份'), d2: I(1, 12, 3, '横着切几份'), n2: I(0, 12, 1, '横着取几份'),
          a: I(0, AMAX, 2, '一条边是 x + 几'), b: I(0, AMAX, 3, '另一条边是 x + 几'),
          show: { type: 'bool', label: '显示算式', default: true, write: true },
        },
        outputs: {
          area: { dim: null, kind: 'num', label: '面积（积）' },
          parts: { dim: null, kind: 'num', label: '切成几块' },
          friendly: { dim: null, kind: 'num', label: '每段都好算（整十或不到十）：1 是，0 否' },
          perim: { dim: null, kind: 'num', label: '周长' },
          square: { dim: null, kind: 'num', label: '是正方形：1 是，0 否' },
          cells: { dim: null, kind: 'num', label: '重叠的格数（分数乘法的分子）' },
          total: { dim: null, kind: 'num', label: '总格数（分数乘法的分母）' },
          p1: { dim: null, kind: 'num', label: '展开后 x 的系数' },
          p0: { dim: null, kind: 'num', label: '展开后的常数' },
        },
        icon: () => K.rect(10, 8, 30, 28, { fill: COL[0], stroke: 'var(--ink)', r: 0 }) + K.rect(40, 8, 14, 28, { fill: COL[1], stroke: 'var(--ink)', r: 0 }),
        size: () => [430, 400],
        grips,
        compute: (c) => {
          const m = model(c.props);
          if (m.mode === 1) return { area: num(m.area), cells: num(m.cells), total: num(m.total), parts: num(m.total), friendly: num(0), perim: num(4), square: num(1), p1: num(0), p0: num(0) };
          if (m.mode === 2) return { p1: num(m.p1), p0: num(m.p0), square: num(m.square), parts: num((m.a ? 2 : 1) * (m.b ? 2 : 1)), friendly: num(0), cells: num(0), total: num(0) };
          return { area: num(m.area), parts: num(m.parts), friendly: num(m.friendly), perim: num(m.perim), square: num(m.square), cells: num(0), total: num(0), p1: num(0), p0: num(0) };
        },
        badge: (c) => { const m = model(c.props); return m.mode === 0 ? m.w + ' × ' + m.h + ' = ' + m.area : m.mode === 1 ? (c.masked ? '' : Q.show(m.area)) : ''; },
        draw: (c) => {
          const m = model(c.props);
          let s = m.mode === 0 ? drawInt(c, m) : m.mode === 1 ? drawFrac(c, m) : drawAlg(c, m);
          if (c.props.show) { const ls = lines(m), y0 = textTop(m); ls.forEach((t, i) => { s += K.text(X0 - 20, y0 + i * 20, t, { size: 14, weight: i === 0 ? 700 : 400, anchor: 'start', fill: 'var(--ink)' }); }); }
          return s;
        },
      },
    },
  });
  U.AreaModel = { model, cuts, lines, MODES };
})(typeof globalThis !== 'undefined' ? globalThis : window);
