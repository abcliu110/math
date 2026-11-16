/* 器材包 solidbench：积木与三视图。用小正方体搭积木，看从前面、侧面、上面各是什么样子。
 * 全部在图上直接动手：
 *   - 左下是底板（从上往下看的格子，最下面一排是“前排”）。点一个格子：放一块；切到“拿走”再点：拿走一块。格子里写着这儿叠了几块。
 *   - 左上是立体图，跟着底板变。
 *   - 右边三个小窗：从前面看、从侧面（左边）看、从上面看。先自己想，再点“看一看”打开。
 *     前面看：每一列只看得见最高的那一叠；侧面看：每一排只看得见最高的那一叠；上面看：有积木的位置各是一个正方形，叠得再高也只算一个。
 *   - 一共几块写在立体图下面。
 * 这一版的边界（如实写）：底板最大 4 排 × 4 列，每格最多叠 5 块；没有“照着三视图搭、求最少和最多”的搜索（那是“小方块搭建”器材）；没有展开图。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 700, HMAX = 5, A = 30, IX = 90, IY = 228, BX = 40, BY = 286, BC = 26, VX = [372, 480, 588], VY = 72, VC = 16;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? +v : lo));
  const on = (v) => v === true || v === 1;
  // "1,2;1,1" → [[1,2],[1,1]]（第一行是前排）。不合法就当空的 2 × 2
  function parse(t, R, C) {
    const rows = String(t || '').split(';').map((r) => r.split(',').map((x) => clamp(parseInt(x, 10) || 0, 0, HMAX)));
    const g = []; for (let r = 0; r < R; r++) { g.push([]); for (let c = 0; c < C; c++) g[r].push(rows[r] && rows[r][c] !== undefined ? rows[r][c] : 0); }
    return g;
  }
  const ser = (g) => g.map((r) => r.join(',')).join(';');
  const code = (a) => Number('1' + a.join(''));   // 视图写成一个数：开头的 1 只是占位（免得 0 开头丢掉），后面一位是一个高度
  function model(p) {
    const R = clamp(p.rows, 1, 4), C = clamp(p.cols, 1, 4), g = parse(p.h, R, C);
    const front = Array.from({ length: C }, (_, c) => Math.max(...g.map((r) => r[c])));
    const side = g.map((r) => Math.max(...r));
    const top = g.map((r) => r.map((h) => (h > 0 ? 1 : 0)));
    const total = g.reduce((s, r) => s + r.reduce((a, b) => a + b, 0), 0), seen = top.flat().reduce((a, b) => a + b, 0);
    return { R, C, g, front, side, top, total, seen };
  }
  // 斜二测：往后一排，往右上挪半格
  const P = (c, d, z) => ({ x: IX + c * A + d * A * 0.5, y: IY - d * A * 0.5 - z * A });
  function cube(c, d, z, hot) {
    const p = P(c, d, z), q = A * 0.5, f = hot ? ['#f5c26b', '#fbe2ad', '#d9a441'] : ['#9fb7d9', '#cfdcf0', '#7f99c0'];
    return '<polygon points="' + [[p.x, p.y], [p.x + A, p.y], [p.x + A, p.y - A], [p.x, p.y - A]].map((v) => v.join(',')).join(' ') + '" fill="' + f[0] + '" stroke="var(--ink)" stroke-width="1"/>' +
      '<polygon points="' + [[p.x, p.y - A], [p.x + A, p.y - A], [p.x + A + q, p.y - A - q], [p.x + q, p.y - A - q]].map((v) => v.join(',')).join(' ') + '" fill="' + f[1] + '" stroke="var(--ink)" stroke-width="1"/>' +
      '<polygon points="' + [[p.x + A, p.y], [p.x + A + q, p.y - q], [p.x + A + q, p.y - A - q], [p.x + A, p.y - A]].map((v) => v.join(',')).join(' ') + '" fill="' + f[2] + '" stroke="var(--ink)" stroke-width="1"/>';
  }
  const btn = (x, y, w, label, patch, active, tip) => '<g data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 24, { fill: active ? 'var(--blue)' : '#fff', stroke: 'var(--blue)', r: 8, w: 1.5 }) + K.text(x + w / 2, y + 16, label, { size: 12, weight: 700, fill: active ? '#fff' : 'var(--ink)' }) + '</g>';
  // 一个视图：cols 根柱子，每根 hs[i] 格高（上面看是一张 0/1 的格子）
  function viewSvg(x, title, shown, key, body, tip) {
    let s = K.text(x, VY - 34, title, { size: 12, weight: 700, anchor: 'start' }) + btn(x, VY - 26, 88, shown ? '盖上' : '看一看', { [key]: !shown }, shown, tip);
    s += '<g data-view="' + key + '"' + (shown ? '' : ' data-hidden="1"') + '>' + (shown ? body : K.rect(x, VY + 8, 88, 88, { fill: '#f1f3f6', stroke: '#b8c0cc', r: 6, w: 1 }) + K.text(x + 44, VY + 58, '？', { size: 22, weight: 700, fill: '#5f6773' })) + '</g>';
    return s;
  }
  const sq = (x, y) => K.rect(x, y, VC, VC, { fill: '#cfdcf0', stroke: 'var(--ink)', r: 0, w: 1 });

  function draw(c) {
    const p = c.props, m = model(p), take = on(p.take); let s = '';
    // 立体图：从后往前、从下往上、从左往右画
    for (let r = m.R - 1; r >= 0; r--) for (let z = 0; z < HMAX; z++) for (let cc = 0; cc < m.C; cc++) if (m.g[r][cc] > z) s += cube(cc, r, z, false);
    s += K.text(IX, IY + 22, '一共 ' + m.total + ' 块', { size: 14, weight: 700, anchor: 'start' });
    // 底板
    s += K.text(BX, BY - 8, '底板（从上往下看）：点格子' + (take ? '拿走一块' : '放一块'), { size: 12, anchor: 'start', fill: '#5a6478' });
    for (let r = 0; r < m.R; r++) for (let cc = 0; cc < m.C; cc++) {
      const g2 = m.g.map((row) => row.slice()), h = m.g[r][cc]; g2[r][cc] = clamp(h + (take ? -1 : 1), 0, HMAX);
      const x = BX + cc * BC, y = BY + (m.R - 1 - r) * BC, can = take ? h > 0 : h < HMAX;
      s += '<g data-cell="' + r + '-' + cc + '"' + (can ? ' data-pick-set="' + encodeURIComponent(JSON.stringify({ h: ser(g2) })) + '" style="cursor:pointer"' : '') + '><title>第 ' + (r + 1) + ' 排（从前往后）第 ' + (cc + 1) + ' 列：' + h + ' 块</title>' +
        K.rect(x, y, BC - 2, BC - 2, { fill: h ? '#cfdcf0' : '#fff', stroke: 'var(--ink)', r: 3, w: 1.2 }) + (h ? K.text(x + BC / 2 - 1, y + BC / 2 + 4, String(h), { size: 12, weight: 700 }) : '') + '</g>';
    }
    s += K.text(BX + m.C * BC / 2, BY + m.R * BC + 12, '前', { size: 11, weight: 700, fill: '#5a6478' });
    const bx2 = BX + m.C * BC + 16;
    s += btn(bx2, BY, 64, '放', { take: false }, !take, '点格子是放一块') + btn(bx2, BY + 30, 64, '拿走', { take: true }, take, '点格子是拿走一块');
    // 三个视图
    const hmax = Math.max(1, ...m.front, ...m.side);
    let fb = ''; m.front.forEach((h, i) => { for (let z = 0; z < h; z++) fb += sq(VX[0] + i * VC, VY + 96 - (z + 1) * VC); });
    let sb = ''; m.side.forEach((h, i) => { for (let z = 0; z < h; z++) sb += sq(VX[1] + i * VC, VY + 96 - (z + 1) * VC); });
    let tb = ''; for (let r = 0; r < m.R; r++) for (let cc = 0; cc < m.C; cc++) if (m.top[r][cc]) tb += sq(VX[2] + cc * VC, VY + 8 + (m.R - 1 - r) * VC);
    void hmax;
    s += viewSvg(VX[0], '从前面看', on(p.sf), 'sf', fb + K.line(VX[0] - 2, VY + 96, VX[0] + 88, VY + 96, { w: 1.4 }), '每一列只看得见最高的那一叠');
    s += viewSvg(VX[1], '从左面看', on(p.ss), 'ss', sb + K.line(VX[1] - 2, VY + 96, VX[1] + 88, VY + 96, { w: 1.4 }), '每一排只看得见最高的那一叠（左边是前排）');
    s += viewSvg(VX[2], '从上面看', on(p.st), 'st', tb, '有积木的位置各是一个正方形');
    const lines = [];
    if (on(p.sf)) lines.push('从前面看：' + m.front.join('、') + '（每列最高的）');
    if (on(p.ss)) lines.push('从左面看：' + m.side.join('、') + '（每排最高的）');
    if (on(p.st)) lines.push('从上面看：' + m.seen + ' 个正方形，可是一共有 ' + m.total + ' 块');
    lines.forEach((t, i) => { s += K.text(VX[0], 210 + i * 22, t, { size: 12, weight: 700, anchor: 'start', fill: 'var(--blue)' }); });
    return s;
  }
  const I = (lo, hi, d, label, o) => Object.assign({ type: 'int', label, default: d, min: lo, max: hi, write: true }, o || {});
  const B = (label) => ({ type: 'bool', label, default: false, write: true });
  U.registerPack({
    id: 'solidbench', version: 1,
    types: {
      solidbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E2', 'E5'],
        label: '积木与三视图', prefix: '积木', group: '图形', grades: [2, 9],
        alias: ['观察物体', '三视图', '从前面看', '从侧面看', '从上面看', '积木', '小正方体', '组合体'],
        props: {
          rows: I(1, 4, 2, '底板有几排'), cols: I(1, 4, 2, '底板有几列'),
          h: { type: 'text', label: '每个位置叠几块（每排一行，行之间用分号；第一行是前排）', default: '0,0;0,0', write: true },
          take: B('点格子是拿走'), sf: B('打开“从前面看”'), ss: B('打开“从左面看”'), st: B('打开“从上面看”'),
        },
        outputs: {
          total: { dim: null, kind: 'num', label: '一共几块' }, grid: { dim: null, kind: 'num', label: '摆法（1 后面依次是每一格的块数）' },
          front: { dim: null, kind: 'num', label: '从前面看（1 后面依次是每列的高；打开了才有）' }, side: { dim: null, kind: 'num', label: '从左面看（1 后面依次是每排的高；打开了才有）' },
          top: { dim: null, kind: 'num', label: '从上面看（1 后面依次是每格有没有：1 有 0 没有；打开了才有）' }, seen: { dim: null, kind: 'num', label: '从上面看见几个正方形（打开了才有）' },
        },
        icon: () => K.rect(14, 22, 14, 14, { fill: '#9fb7d9', stroke: 'var(--ink)', w: 1 }) + K.rect(28, 22, 14, 14, { fill: '#9fb7d9', stroke: 'var(--ink)', w: 1 }) + K.rect(28, 8, 14, 14, { fill: '#9fb7d9', stroke: 'var(--ink)', w: 1 }) + K.rect(46, 22, 8, 14, { fill: '#cfdcf0', stroke: 'var(--ink)', w: 1 }),
        size: () => [W, 420],
        grips: () => [],
        compute: (c) => {
          const p = c.props, m = model(p), o = { total: num(m.total), grid: num(code(m.g.flat())) };
          if (on(p.sf)) o.front = num(code(m.front));
          if (on(p.ss)) o.side = num(code(m.side));
          if (on(p.st)) { o.top = num(code(m.top.flat())); o.seen = num(m.seen); }
          return o;
        },
        badge: () => '',
        draw,
      },
    },
  });
  U.SolidBench = { model, parse, ser, code };
})(typeof globalThis !== 'undefined' ? globalThis : window);
