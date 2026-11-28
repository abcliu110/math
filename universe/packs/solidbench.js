/* 器材包 solidbench：积木与三视图（也搭长方体）。用小正方体搭积木，看从前面、侧面、上面各是什么样子；搭成长方体时读出长宽高、体积、表面积、棱长总和。
 * 全部在图上直接动手：
 *   - 左下是底板（从上往下看的格子，最下面一排是“前排”）。点一个格子：放一块；切到“拿走”再点：拿走一块。格子里写着这儿叠了几块。
 *   - 底板旁边：“长 − +”“宽 − +”改底板有几列、几排；“铺满一层”在整块底板上各放一块；“全拿走”清空。
 *   - 左上是立体图，跟着底板变；大了会自动缩小。
 *   - 右边三个小窗：从前面看、从左面看、从上面看。先自己想，再点“看一看”打开。
 *   - 下面写着一共几块（体积）、露在外面的面有几个（表面积，底面也算）；每个位置一样高时，就是一个长方体，写出长、宽、高和棱长总和。
 * 这一版的边界（如实写）：底板最大 10 排 × 10 列，每格最多叠 10 块（10 × 10 × 10 = 1000 个小正方体就是 1 立方分米；1 × 1 × 24 那样的长条还是搭不出来）；
 *   没有“照着三视图搭、求最少和最多”的搜索（那是“小方块搭建”器材）；没有展开图。
 * 大数（2026-11-28，试验台增强 7 第二轮）：以前底板 6 × 6、高 6。现在底板 7 列（排）以上每格 16 像素（画出来 14 像素，还是好点），
 *   立体图每块跟着缩小（前、上、右三面都挨着别的方块的整块被挡住，不画），三个小窗按“最多几列、几排、几层”缩小每格。
 *   有一叠到了 10 块时，“摆法、从前面看、从左面看”这几个一格一位数字的读数不给（10 写不进一位），体积、表面积、长方体照常。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 700, NMAX = 10, HMAX = 10, IX = 40, IY = 236, BX = 30, BY = 290, VX = [372, 480, 588], VY = 72;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? +v : lo));
  const on = (v) => v === true || v === 1;
  // "1,2;1,1" → [[1,2],[1,1]]（第一行是前排）。缺的格子当 0
  function parse(t, R, C) {
    const rows = String(t || '').split(';').map((r) => r.split(',').map((x) => clamp(parseInt(x, 10) || 0, 0, HMAX)));
    const g = []; for (let r = 0; r < R; r++) { g.push([]); for (let c = 0; c < C; c++) g[r].push(rows[r] && rows[r][c] !== undefined ? rows[r][c] : 0); }
    return g;
  }
  const ser = (g) => g.map((r) => r.join(',')).join(';');
  const code = (a) => Number('1' + a.join(''));   // 视图写成一个数：开头的 1 只是占位（免得 0 开头丢掉），后面一位是一个高度
  const oneDigit = (a) => a.every((h) => h <= 9);   // 有一叠到了 10 块，一位数字写不下：这类读数不给
  // 底板每格多大（画出来少 2 像素）：4 以内 26、6 以内 20、再大 16（画出来 14，不小于 U.kit.big.MIN_HIT）
  const cellOf = (R, C) => (R > 6 || C > 6 ? 16 : R > 4 || C > 4 ? 20 : 26);
  // 卡片高：底板排多了往下长（6 排以内和以前一样 444）
  const heightOf = (p) => { const R = clamp(p.rows, 1, NMAX), C = clamp(p.cols, 1, NMAX); return R > 6 ? BY + R * cellOf(R, C) + 50 : 444; };   // 卡片头 28 像素也算在里面；6 排以内和以前一样
  function model(p) {
    const R = clamp(p.rows, 1, NMAX), C = clamp(p.cols, 1, NMAX), g = parse(p.h, R, C);
    const front = Array.from({ length: C }, (_, c) => Math.max(...g.map((r) => r[c])));
    const side = g.map((r) => Math.max(...r));
    const top = g.map((r) => r.map((h) => (h > 0 ? 1 : 0)));
    const total = g.reduce((s, r) => s + r.reduce((a, b) => a + b, 0), 0), seen = top.flat().reduce((a, b) => a + b, 0);
    // 露在外面的面：每一叠的上面和底面各 1 个，四周看比邻居高出多少
    const at = (r, c) => (r >= 0 && r < R && c >= 0 && c < C ? g[r][c] : 0);
    let surf = 0;
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) { const h = g[r][c]; if (!h) continue; surf += 2; for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) surf += Math.max(0, h - at(r + dr, c + dc)); }
    // 长方体：有块的格子正好占满一个长方形，而且一样高（不一定占满整块底板）
    const flat = g.flat(), cells = []; g.forEach((row, i) => row.forEach((h, j) => { if (h > 0) cells.push([i, j, h]); }));
    let box = null;
    if (cells.length) { const r0 = Math.min(...cells.map((x) => x[0])), r1 = Math.max(...cells.map((x) => x[0])), c0 = Math.min(...cells.map((x) => x[1])), c1 = Math.max(...cells.map((x) => x[1])), h0 = cells[0][2];
      if (cells.length === (r1 - r0 + 1) * (c1 - c0 + 1) && cells.every((x) => x[2] === h0)) box = { l: c1 - c0 + 1, w: r1 - r0 + 1, h: h0 }; }
    return { R, C, g, front, side, top, total, seen, surf, box, hmax: Math.max(...flat) };
  }
  // 斜二测：往后一排，往右上挪半格；模块边长 a 按大小缩放
  const sizeA = (m) => Math.min(30, 290 / (m.C + m.R * 0.5 + 0.6), 200 / (Math.max(1, m.hmax) + m.R * 0.5 + 0.4));
  const P = (a, c, d, z) => ({ x: IX + c * a + d * a * 0.5, y: IY - d * a * 0.5 - z * a });
  function cube(a, c, d, z) {
    const p = P(a, c, d, z), q = a * 0.5, f = ['#9fb7d9', '#cfdcf0', '#7f99c0'], pts = (arr) => arr.map((v) => v[0].toFixed(1) + ',' + v[1].toFixed(1)).join(' ');
    return '<polygon points="' + pts([[p.x, p.y], [p.x + a, p.y], [p.x + a, p.y - a], [p.x, p.y - a]]) + '" fill="' + f[0] + '" stroke="var(--ink)" stroke-width="1"/>' +
      '<polygon points="' + pts([[p.x, p.y - a], [p.x + a, p.y - a], [p.x + a + q, p.y - a - q], [p.x + q, p.y - a - q]]) + '" fill="' + f[1] + '" stroke="var(--ink)" stroke-width="1"/>' +
      '<polygon points="' + pts([[p.x + a, p.y], [p.x + a + q, p.y - q], [p.x + a + q, p.y - a - q], [p.x + a, p.y - a]]) + '" fill="' + f[2] + '" stroke="var(--ink)" stroke-width="1"/>';
  }
  const btn = (x, y, w, label, patch, active, enabled, tip) => '<g' + (enabled ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' data-off="1"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 24, { fill: active ? 'var(--blue)' : enabled ? '#fff' : '#f1f3f6', stroke: enabled ? 'var(--blue)' : '#b8c0cc', r: 8, w: 1.5 }) + K.text(x + w / 2, y + 16, label, { size: 12, weight: 700, fill: active ? '#fff' : enabled ? 'var(--ink)' : '#5f6773' }) + '</g>';
  function viewSvg(x, title, shown, key, body, tip) {
    let s = K.text(x, VY - 34, title, { size: 12, weight: 700, anchor: 'start' }) + btn(x, VY - 26, 88, shown ? '盖上' : '看一看', { [key]: !shown }, shown, true, tip);
    s += '<g data-view="' + key + '"' + (shown ? '' : ' data-hidden="1"') + '>' + (shown ? body : K.rect(x, VY + 8, 88, 88, { fill: '#f1f3f6', stroke: '#b8c0cc', r: 6, w: 1 }) + K.text(x + 44, VY + 58, '？', { size: 22, weight: 700, fill: '#5f6773' })) + '</g>';
    return s;
  }
  const resize = (m, R, C) => ser(parse(ser(m.g), R, C));

  function draw(c) {
    const p = c.props, m = model(p), take = on(p.take), a = sizeA(m), BC = cellOf(m.R, m.C), VC = Math.min(14, 88 / Math.max(m.C, m.R, m.hmax, 1)); let s = '';
    // 前面、上面、右边都挨着别的方块：这一块整个被挡住，不画（10 × 10 × 10 时少画七百多块）
    const at = (r, cc) => (r >= 0 && r < m.R && cc >= 0 && cc < m.C ? m.g[r][cc] : 0);
    for (let r = m.R - 1; r >= 0; r--) for (let z = 0; z < HMAX; z++) for (let cc = 0; cc < m.C; cc++) if (m.g[r][cc] > z && !(at(r - 1, cc) > z && m.g[r][cc] > z + 1 && at(r, cc + 1) > z)) s += cube(a, cc, r, z);
    // 底板
    s += K.text(BX, BY - 8, '底板（从上往下看）：点格子' + (take ? '拿走一块' : '放一块'), { size: 12, anchor: 'start', fill: '#5a6478' });
    for (let r = 0; r < m.R; r++) for (let cc = 0; cc < m.C; cc++) {
      const g2 = m.g.map((row) => row.slice()), h = m.g[r][cc]; g2[r][cc] = clamp(h + (take ? -1 : 1), 0, HMAX);
      const x = BX + cc * BC, y = BY + (m.R - 1 - r) * BC, can = take ? h > 0 : h < HMAX;
      s += '<g data-cell="' + r + '-' + cc + '"' + (can ? ' data-pick-set="' + encodeURIComponent(JSON.stringify({ h: ser(g2) })) + '" style="cursor:pointer"' : '') + '><title>第 ' + (r + 1) + ' 排（从前往后）第 ' + (cc + 1) + ' 列：' + h + ' 块</title>' +
        K.rect(x, y, BC - 2, BC - 2, { fill: h ? '#cfdcf0' : '#fff', stroke: 'var(--ink)', r: 3, w: 1.2 }) + (h ? K.text(x + BC / 2 - 1, y + BC / 2 + (BC < 20 ? 3 : 4), String(h), { size: BC < 20 ? 9.5 : 11, weight: 700 }) : '') + '</g>';
    }
    s += K.text(BX + m.C * BC / 2, BY + m.R * BC + 12, '前', { size: 11, weight: 700, fill: '#5a6478' });
    const bx2 = BX + Math.max(m.C * BC, 104) + 14, full = ser(m.g.map((row) => row.map((h) => Math.min(HMAX, h + 1))));
    s += btn(bx2, BY, 50, '放', { take: false }, !take, true, '点格子是放一块') + btn(bx2 + 56, BY, 56, '拿走', { take: true }, take, true, '点格子是拿走一块');
    s += btn(bx2, BY + 30, 106, '铺满一层', { h: full }, false, m.g.some((row) => row.some((h) => h < HMAX)), '整块底板上每格各放一块');
    const wide = bx2 + 182 > VX[0] - 6, yl = wide ? BY + 90 : BY + 60;   // 底板宽了：“全拿走”挪到下一行（免得盖住右边的字），长、宽的 − + 再往下
    s += btn(wide ? bx2 : bx2 + 112, wide ? BY + 60 : BY + 30, 70, '全拿走', { h: ser(m.g.map((row) => row.map(() => 0))) }, false, m.total > 0, '把积木都拿走');
    s += K.text(bx2, yl + 16, '长', { size: 12, anchor: 'start' }) + btn(bx2 + 16, yl, 26, '−', { cols: m.C - 1, h: resize(m, m.R, m.C - 1) }, false, m.C > 1, '底板少一列') + btn(bx2 + 46, yl, 26, '+', { cols: m.C + 1, h: resize(m, m.R, m.C + 1) }, false, m.C < NMAX, '底板多一列');
    s += K.text(bx2 + 86, yl + 16, '宽', { size: 12, anchor: 'start' }) + btn(bx2 + 102, yl, 26, '−', { rows: m.R - 1, h: resize(m, m.R - 1, m.C) }, false, m.R > 1, '底板少一排') + btn(bx2 + 132, yl, 26, '+', { rows: m.R + 1, h: resize(m, m.R + 1, m.C) }, false, m.R < NMAX, '底板多一排');
    // 三个视图
    let fb = ''; m.front.forEach((h, i) => { for (let z = 0; z < h; z++) fb += K.rect(VX[0] + i * VC, VY + 96 - (z + 1) * VC, VC, VC, { fill: '#cfdcf0', stroke: 'var(--ink)', r: 0, w: 1 }); });
    let sb = ''; m.side.forEach((h, i) => { for (let z = 0; z < h; z++) sb += K.rect(VX[1] + i * VC, VY + 96 - (z + 1) * VC, VC, VC, { fill: '#cfdcf0', stroke: 'var(--ink)', r: 0, w: 1 }); });
    let tb = ''; for (let r = 0; r < m.R; r++) for (let cc = 0; cc < m.C; cc++) if (m.top[r][cc]) tb += K.rect(VX[2] + cc * VC, VY + 8 + (m.R - 1 - r) * VC, VC, VC, { fill: '#cfdcf0', stroke: 'var(--ink)', r: 0, w: 1 });
    s += viewSvg(VX[0], '从前面看', on(p.sf), 'sf', fb + K.line(VX[0] - 2, VY + 96, VX[0] + 88, VY + 96, { w: 1.4 }), '每一列只看得见最高的那一叠');
    s += viewSvg(VX[1], '从左面看', on(p.ss), 'ss', sb + K.line(VX[1] - 2, VY + 96, VX[1] + 88, VY + 96, { w: 1.4 }), '每一排只看得见最高的那一叠（左边是前排）');
    s += viewSvg(VX[2], '从上面看', on(p.st), 'st', tb, '有积木的位置各是一个正方形');
    const lines = [];
    // 列、排多了（7 个以上）不写括号里的说明，免得写出卡片
    if (on(p.sf)) lines.push('从前面看：' + m.front.join('、') + (m.C <= 6 ? '（每列最高的）' : ''));
    if (on(p.ss)) lines.push('从左面看：' + m.side.join('、') + (m.R <= 6 ? '（每排最高的）' : ''));
    if (on(p.st)) lines.push('从上面看：' + m.seen + ' 个正方形，可是一共有 ' + m.total + ' 块');
    lines.forEach((t, i) => { s += K.text(VX[0], 190 + i * 20, t, { size: 12, weight: 700, anchor: 'start', fill: 'var(--blue)' }); });
    // 一共几块、表面积、长方体
    const yI = 262;
    s += K.text(VX[0], yI, '一共 ' + m.total + ' 块（体积 ' + m.total + '）', { size: 14, weight: 700, anchor: 'start' });
    if (m.total) s += K.text(VX[0], yI + 22, '露在外面的面：' + m.surf + ' 个（表面积 ' + m.surf + '，底面也算）', { size: 12, anchor: 'start' });
    if (m.box) s += '<g data-box="1">' + K.text(VX[0], yI + 46, '是一个长方体：长 ' + m.box.l + '、宽 ' + m.box.w + '、高 ' + m.box.h, { size: 13, weight: 700, anchor: 'start', fill: 'var(--good)' }) +
      K.text(VX[0], yI + 66, '体积 ' + m.box.l + ' × ' + m.box.w + ' × ' + m.box.h + ' = ' + m.total, { size: 12, anchor: 'start', fill: 'var(--good)' }) +
      K.text(VX[0], yI + 84, '表面积 2 × (' + m.box.l * m.box.w + ' + ' + m.box.l * m.box.h + ' + ' + m.box.w * m.box.h + ') = ' + m.surf, { size: 12, anchor: 'start', fill: 'var(--good)' }) +
      K.text(VX[0], yI + 102, '棱长总和 4 × (' + m.box.l + ' + ' + m.box.w + ' + ' + m.box.h + ') = ' + 4 * (m.box.l + m.box.w + m.box.h), { size: 12, anchor: 'start', fill: 'var(--good)' }) + '</g>';
    return s;
  }
  const I = (lo, hi, d, label, o) => Object.assign({ type: 'int', label, default: d, min: lo, max: hi, write: true }, o || {});
  const B = (label) => ({ type: 'bool', label, default: false, write: true });
  U.registerPack({
    id: 'solidbench', version: 1,
    types: {
      solidbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E2', 'E5'],
        label: '积木与三视图', prefix: '积木', group: '图形', grades: [1, 9],
        alias: ['观察物体', '三视图', '从前面看', '从侧面看', '从上面看', '积木', '小正方体', '组合体', '长方体', '正方体', '体积', '表面积', '棱长'],
        props: {
          rows: I(1, NMAX, 2, '底板有几排', { qmax: 6 }), cols: I(1, NMAX, 2, '底板有几列', { qmax: 6 }),
          h: { type: 'text', label: '每个位置叠几块（每排一行，行之间用分号；第一行是前排）', default: '0,0;0,0', write: true },
          take: B('点格子是拿走'), sf: B('打开“从前面看”'), ss: B('打开“从左面看”'), st: B('打开“从上面看”'),
        },
        outputs: {
          total: { dim: null, kind: 'num', label: '一共几块（体积）' }, surf: { dim: null, kind: 'num', label: '露在外面的面（表面积，底面也算）' },
          grid: { dim: null, kind: 'num', label: '摆法（1 后面依次是每一格的块数）' },
          front: { dim: null, kind: 'num', label: '从前面看（1 后面依次是每列的高；打开了才有）' }, side: { dim: null, kind: 'num', label: '从左面看（1 后面依次是每排的高；打开了才有）' },
          top: { dim: null, kind: 'num', label: '从上面看（1 后面依次是每格有没有：1 有 0 没有；打开了才有）' }, seen: { dim: null, kind: 'num', label: '从上面看见几个正方形（打开了才有）' },
          isbox: { dim: null, kind: 'num', label: '是一个长方体：1 是，0 否' }, l: { dim: null, kind: 'num', label: '长方体的长（是长方体才有）' }, w: { dim: null, kind: 'num', label: '长方体的宽' }, hgt: { dim: null, kind: 'num', label: '长方体的高' },
          edges: { dim: null, kind: 'num', label: '棱长总和（是长方体才有）' },
        },
        icon: () => K.rect(14, 22, 14, 14, { fill: '#9fb7d9', stroke: 'var(--ink)', w: 1 }) + K.rect(28, 22, 14, 14, { fill: '#9fb7d9', stroke: 'var(--ink)', w: 1 }) + K.rect(28, 8, 14, 14, { fill: '#9fb7d9', stroke: 'var(--ink)', w: 1 }) + K.rect(46, 22, 8, 14, { fill: '#cfdcf0', stroke: 'var(--ink)', w: 1 }),
        size: (e) => [W, heightOf((e && e.props) || {})],
        grips: () => [],
        compute: (c) => {
          const p = c.props, m = model(p), d1 = oneDigit(m.g.flat()), o = { total: num(m.total), surf: num(m.surf), isbox: num(m.box ? 1 : 0) };
          if (d1) o.grid = num(code(m.g.flat()));
          if (on(p.sf) && d1) o.front = num(code(m.front));
          if (on(p.ss) && d1) o.side = num(code(m.side));
          if (on(p.st)) { o.top = num(code(m.top.flat())); o.seen = num(m.seen); }
          if (m.box) { o.l = num(m.box.l); o.w = num(m.box.w); o.hgt = num(m.box.h); o.edges = num(4 * (m.box.l + m.box.w + m.box.h)); }
          return o;
        },
        badge: () => '',
        draw,
      },
    },
  });
  U.SolidBench = { model, parse, ser, code, cellOf, heightOf, NMAX, HMAX };
})(typeof globalThis !== 'undefined' ? globalThis : window);
