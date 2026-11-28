/* 器材包 areabench：面积公式推导。方格纸上一个图形，拖角改底、高、斜度；再一步一步剪、移、拼，变成已经会算的图形。
 *   - 平行四边形：点“沿高剪下来”，左边剪下一个三角形；点“移到右边”，拼成长方形：长就是底，宽就是高，面积 = 底 × 高。
 *     推斜了再剪拼一次（“重来”以后拖斜度），面积还是一样：记下拼过几种斜度。
 *   - 三角形：点“再拿一个一样的”，点“转过来拼上”，两个拼成平行四边形：三角形是它的一半，面积 = 底 × 高 ÷ 2。
 *   - 梯形：同样两个拼成平行四边形，底是上底 + 下底：面积 = (上底 + 下底) × 高 ÷ 2。
 * 拼好以前读不出面积（面积要靠拼出来）。
 * 篱笆围地（shape 3）开图用的是通用记录仪（js/core/recorder.js，题目 gr-fence-20）：本台声明 recHide，先猜时不盖台面，只把面积写成“？”；开了记录仪就不画自己的“记下这一种”。
 * 大数（2026-11-28，docs/instrument-design.md 的“补旧上限的台”）：底 2–40、高 1–24、梯形上底 1–30、梯形斜度 0–10；篱笆 8–100 米。
 *   以前的范围（底 12、高 8、图宽 28 格以内）一格还是 22 像素，和以前一样；放不下就一格画成 11 像素、再放不下 7 像素（图上写“格子画小了”）。
 *   拖的时候按“按下那一刻”的格子大小算，图不跟着缩，最多拖到卡片边上；松手以后放不下就换小一号的格子，可以接着往外拖。
 *   篱笆 28 米以内和以前一样；更长按篱笆总长缩小画（整个长方形都画得下），拖的时候一步至少 4 像素（90 米以上按 2 取整），旁边有“长 −1 / +1”微调。
 * 这一版的边界（如实写）：边长都是整格；平行四边形的斜度不超过底（剪下的三角形落在底边上）；圆的切拼在“剪拼”器材里。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const qv = (q) => U.val('num', q, { dim: null });
  const W = 700, X0 = 40, YB = 290, BMAX = 40, HMAX = 24, TMAX = 30, TSMAX = 10, PMAX = 100;
  // 一格多少像素（大数）：放得下就 22（和以前一样），不然 11、7。FIT 是方格纸的大小，DRAG 是拖的时候最远能到哪（卡片边上）
  const TIERS = [22, 11, 7], FIT_W = 616, FIT_H = 176, DRAG_W = 650, DRAG_H = 230;
  let UN = 22;   // 现在用的格子大小：draw / grips / 拖动开头按属性设好（setUN），X、Y 跟着它
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? Math.round(+v) : lo));
  const SHAPES = ['平行四边形', '三角形', '梯形', '篱笆围地'];
  const X = (u) => X0 + u * UN, Y = (v) => YB - v * UN;
  const needW = (m) => m.b + m.s + (m.shape === 2 ? m.t : 0);
  const unOf = (m) => TIERS.find((k) => needW(m) * k <= FIT_W && m.h * k <= FIT_H) || TIERS[TIERS.length - 1];
  // 篱笆：28 米以内 22（长方形高超过 8 格只画 8 格，和以前一样）；更长按总长缩小，整个长方形都画得下
  const funOf = (f) => (f.P <= 28 ? 22 : FIT_H / (f.P / 2 - 1));
  // 拖的时候用按下那一刻的属性（c.drag.p0）定格子大小，图不跟着缩
  const setUN = (c) => { const p = c.drag && c.drag.p0 ? c.drag.p0 : c.props; UN = +p.shape === 3 ? funOf(fenceModel(p)) : unOf(model(p)); return UN; };
  function model(p) {
    const shape = clamp(p.shape, 0, 3) === 3 ? 0 : clamp(p.shape, 0, 2), b = clamp(p.b, 2, BMAX), h = clamp(p.h, 1, HMAX), t = clamp(p.t, 1, TMAX);
    const s = shape === 0 ? clamp(p.s, 0, b) : shape === 1 ? clamp(p.s, 0, b) : clamp(p.s, 0, TSMAX), step = clamp(p.step, 0, 2);
    const seen = [...new Set(String(p.seen || '').split(',').filter((x) => x !== '').map(Number))];
    const base = shape === 2 ? b + t : b, area = shape === 0 ? Q(b * h) : Q(base * h, 2);
    return { shape, b, h, t, s, step, seen, base, area };
  }
  const poly = (pts, fill, o) => '<polygon points="' + pts.map(([u, v]) => X(u) + ',' + Y(v)).join(' ') + '" fill="' + fill + '" stroke="' + ((o && o.stroke) || '#3a4a63') + '" stroke-width="' + ((o && o.w) || 1.8) + '"' + (o && o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') + '/>';
  const btn = (x, y, w, label, patch, enabled, tip) => '<g' + (enabled ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' data-off="1"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 26, { fill: enabled ? '#fff' : '#f1f3f6', stroke: enabled ? 'var(--blue)' : '#b8c0cc', r: 7, w: 1.4 }) + K.text(x + w / 2, y + 17, label, { size: 12, weight: 700, fill: enabled ? 'var(--ink)' : '#5f6773' }) + '</g>';
  const CA = '#cfe3fb', CB = '#fde2c4';
  function grips(c) {
    setUN(c);
    if (+c.props.shape === 3) { const f = fenceModel(c.props); return [{ id: 'w', x: X(f.w), y: Y((f.P <= 28 ? Math.min(f.h, 8) : f.h) / 2), r: 10, cursor: 'ew-resize', tip: '拖：改长', drag: (c0, q) => { const f0 = fenceModel(c0.props), un = funOf(f0), g = K.big.grain(un, K.big.GRAIN_PX); return { w: Math.max(1, Math.min(f0.P / 2 - 1, K.big.snap((q.x - X0) / un, g) || 1)) }; }, say: (c1) => { const f1 = fenceModel(c1.props), r = U.Recorder && U.Recorder.state('areabench', c1.props); return f1.w + ' × ' + f1.h + ' = ' + (r && r.hidden ? '？' : f1.area); } }]; }
    const m = model(c.props); if (m.step) return [];
    // 拖：按按下那一刻（c0）的格子大小换算；最多拖到卡片边上（DRAG_W、DRAG_H），松手后放不下就换小一号的格子
    const un0 = (c0) => unOf(model(c0.props)), u = (q, c0) => (q.x - X0) / un0(c0), v = (q, c0) => (YB - q.y) / un0(c0), room = (c0) => Math.floor(DRAG_W / un0(c0)), out = [];
    out.push({ id: 'b', x: X(m.b), y: Y(0), r: 9, cursor: 'ew-resize', tip: '拖：改底', drag: (c0, q) => { const m0 = model(c0.props); return { b: clamp(u(q, c0), 2, Math.max(2, Math.min(BMAX, room(c0) - m0.s - (m0.shape === 2 ? m0.t : 0)))) }; }, say: (c1) => '底 ' + model(c1.props).b });
    const topX = m.shape === 1 ? m.s : m.s + (m.shape === 0 ? m.b : m.t) / 2;
    out.push({ id: 'h', x: X(topX), y: Y(m.h), r: 9, cursor: 'ns-resize', tip: '拖：改高', drag: (c0, q) => ({ h: clamp(v(q, c0), 1, Math.min(HMAX, Math.floor(DRAG_H / un0(c0)))) }), say: (c1) => '高 ' + model(c1.props).h });
    if (m.shape !== 1) out.push({ id: 's', x: X(m.s), y: Y(m.h), r: 9, cursor: 'ew-resize', tip: '拖：推斜一点', drag: (c0, q) => { const m0 = model(c0.props); return { s: clamp(u(q, c0), 0, Math.max(0, m.shape === 0 ? Math.min(m0.b, room(c0) - m0.b) : Math.min(TSMAX, room(c0) - m0.b - m0.t))) }; }, say: (c1) => '斜度 ' + model(c1.props).s });
    else out.push({ id: 's', x: X(m.s) - 0.01, y: Y(m.h) - 16, r: 8, cursor: 'ew-resize', tip: '拖：顶点往左右挪', drag: (c0, q) => ({ s: clamp(u(q, c0), 0, model(c0.props).b) }), say: (c1) => '顶点在 ' + model(c1.props).s });
    if (m.shape === 2) out.push({ id: 't', x: X(m.s + m.t), y: Y(m.h), r: 9, cursor: 'ew-resize', tip: '拖：改上底', drag: (c0, q) => { const m0 = model(c0.props); return { t: clamp(u(q, c0) - m0.s, 1, Math.max(1, Math.min(TMAX, room(c0) - m0.b - m0.s))) }; }, say: (c1) => '上底 ' + model(c1.props).t });
    // 图小（格子小、边短）时把手挤在一起：后面的往上挪，彼此至少隔 MIN_HIT
    for (let i = 1; i < out.length; i++) for (let j = 0; j < i; j++) if (Math.hypot(out[i].x - out[j].x, out[i].y - out[j].y) < K.big.MIN_HIT) { out[i].y -= 16; j = -1; }
    return out;
  }
  // ---------- 篱笆围地（shape 3）：篱笆一共 P 米，围一个长方形；拖右边改长，宽自动是 P ÷ 2 − 长 ----------
  function fenceModel(p) {
    const P = Math.max(8, Math.min(PMAX, Math.round(+p.P || 20) & ~1)), w = Math.max(1, Math.min(P / 2 - 1, Math.round(+p.w || 1))), h = P / 2 - w;
    const tried = [...new Set(String(p.tried || '').split(',').filter((x) => x !== '').map(Number))].filter((x) => x >= 1 && x < P / 2).sort((a, b) => a - b);
    let maxA = 0; for (let x = 1; x < P / 2; x++) maxA = Math.max(maxA, x * (P / 2 - x));
    return { P, w, h, area: w * h, tried, maxA, best: w * h === maxA };
  }
  function drawFence(c) {
    const m = fenceModel(c.props), rec = !!c.rec; let s = '';
    m.hidden = !!c.recHidden;   // 通用记录仪先猜：面积写成“？”（recHide，不盖台面）
    s += K.text(20, 26, '篱笆一共 ' + m.P + ' 米，围成长方形：怎样围面积最大？', { size: 16, weight: 700, anchor: 'start' });
    setUN(c);
    const big = m.P > 28, gc = big ? Math.floor(308 / UN) : 14, gr = big ? Math.floor(FIT_H / UN) : 8, gs = UN >= 6 ? 1 : 5;
    for (let i = 0; i <= gc; i += gs) s += K.line(X(i), Y(0), X(i), Y(gr), { stroke: '#e3e7ef', w: 1 });
    for (let j = 0; j <= gr; j += gs) s += K.line(X(0), Y(j), X(gc), Y(j), { stroke: '#e3e7ef', w: 1 });
    if (big) s += K.big.unitNote(388, 26 + 22, gs > 1 ? '按比例缩小画：一格 5 米' : '按比例缩小画：一格 1 米');
    const hh = big ? m.h : Math.min(m.h, 8);
    s += K.rect(X(0), Y(hh), m.w * UN, hh * UN, { fill: m.best && !m.hidden ? '#d6f0d6' : '#cfe3fb', stroke: '#8a5a00', r: 0, w: 3 });
    s += K.text(X(m.w / 2), Y(0) + 18, '长 ' + m.w + ' 米', { size: 12, weight: 700 }) + K.text(X(m.w) + 18, Y(hh / 2) - 14, '宽 ' + m.h + ' 米', { size: 12, weight: 700, anchor: 'start' });
    const R0 = 400;
    s += K.text(R0, 70, '长 + 宽 = ' + m.P + ' ÷ 2 = ' + m.P / 2, { size: 13, anchor: 'start' }) + K.text(R0, 96, '面积 = ' + m.w + ' × ' + m.h + ' = ' + (m.hidden ? '？' : m.area + ' 平方米'), { size: 15, weight: 700, anchor: 'start', fill: 'var(--blue)' });
    if (!rec) s += '<g data-pick-set="' + encodeURIComponent(JSON.stringify({ tried: [...new Set(m.tried.concat([m.w]))].join(',') })) + '" style="cursor:pointer"><title>记下这一种</title>' + K.rect(R0, 112, 110, 26, { fill: '#fff', stroke: 'var(--blue)', r: 7, w: 1.4 }) + K.text(R0 + 55, 129, '记下这一种', { size: 12, weight: 700 }) + '</g>';
    // 篱笆长了（拖的时候可能按 2 取整）：长 −1 / +1 微调
    if (big) s += btn(R0 + 122, 112, 40, '−1', { w: m.w - 1 }, m.w > 1, '长少 1 米') + btn(R0 + 166, 112, 40, '+1', { w: m.w + 1 }, m.w < m.P / 2 - 1, '长多 1 米');
    // 开了记录仪，记下的都在图上；不再列算式（列出 4 × 6 = 24，长 6 的面积就不用猜了）
    if (!rec) s += K.text(R0, 166, '记下的：', { size: 12, weight: 700, anchor: 'start' });
    // 记下的太多（篱笆长）只列最后 14 种
    if (!rec) m.tried.slice(-14).forEach((x, i) => { s += K.text(R0 + (i % 2) * 140, 188 + Math.floor(i / 2) * 20, x + ' × ' + (m.P / 2 - x) + ' = ' + x * (m.P / 2 - x), { size: 12, anchor: 'start', fill: x * (m.P / 2 - x) === m.maxA ? 'var(--blue)' : 'var(--ink)' }); });
    if (m.best && !m.hidden) s += '<g data-read="1">' + K.text(20, 352, '面积最大：' + m.area + ' 平方米。' + (m.w === m.h ? '围成正方形面积最大' : '长和宽越接近，面积越大'), { size: 14, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
    else s += K.text(20, 352, '周长一样，面积不一定一样：拖右边的圆点换一种长', { size: 12, anchor: 'start', fill: '#5a6478' });
    return s;
  }
  function draw(c) {
    if (+c.props.shape === 3) return drawFence(c);
    const p = c.props, m = model(p); let s = '';
    // 方格（格子大小 UN：放得下 22，不然 11、7）
    setUN(c);
    const gc = Math.floor(FIT_W / UN), gr = Math.floor(FIT_H / UN);
    for (let i = 0; i <= gc; i++) s += K.line(X(i), Y(0), X(i), Y(gr), { stroke: '#e3e7ef', w: 1 });
    for (let j = 0; j <= gr; j++) s += K.line(X(0), Y(j), X(gc), Y(j), { stroke: '#e3e7ef', w: 1 });
    if (UN < 22) s += K.big.unitNote(W - 16, 26, '格子画小了：一小格还是 1');
    const { b, h, t } = m, sl = m.s;
    let title = '', lines = [];
    if (m.shape === 0) {
      title = '平行四边形：底 ' + b + '，高 ' + h + (sl ? '，斜度 ' + sl : '');
      if (m.step === 0) s += poly([[0, 0], [b, 0], [b + sl, h], [sl, h]], CA) + K.line(X(sl), Y(h), X(sl), Y(0), { stroke: 'var(--bad)', w: 1.6, dash: '5 4' });
      else if (m.step === 1) s += poly([[sl, 0], [b, 0], [b + sl, h], [sl, h]], CA) + poly([[0, 0], [sl, 0], [sl, h]], CB, { dash: '5 3' }) + K.text(X(sl / 2), Y(0) + 18, '剪下来的三角形', { size: 11, fill: '#8a5a00' });
      else s += poly([[sl, 0], [b, 0], [b + sl, h], [sl, h]], CA) + poly([[b, 0], [b + sl, 0], [b + sl, h]], CB) + poly([[sl, 0], [b + sl, 0], [b + sl, h], [sl, h]], 'none', { stroke: 'var(--blue)', w: 2.6 });
      s += btn(380, 330, 100, '沿高剪下来', { step: 1 }, m.step === 0 && sl > 0, sl > 0 ? '沿红虚线（高）剪下左边的三角形' : '已经是长方形了：先拖左上角推斜一点') + btn(486, 330, 100, '移到右边', { step: 2, seen: [...new Set(m.seen.concat([sl]))].join(',') }, m.step === 1, '把三角形平移到右边');
      if (m.step === 2) lines = ['拼成了长方形：长 = 底 = ' + b + '，宽 = 高 = ' + h, '面积 = 底 × 高 = ' + b + ' × ' + h + ' = ' + b * h, m.seen.length > 1 ? '拼过 ' + m.seen.length + ' 种斜度（' + m.seen.join('、') + '），面积都一样' : '“重来”以后推斜一点，再剪拼一次看看'];
    } else if (m.shape === 1) {
      title = '三角形：底 ' + b + '，高 ' + h;
      const tri = [[0, 0], [b, 0], [sl, h]], copy = [[b, 0], [sl, h], [b + sl, h]];
      s += poly(tri, CA) + K.line(X(sl), Y(h), X(sl), Y(0), { stroke: 'var(--bad)', w: 1.4, dash: '5 4' });
      if (m.step === 1) s += poly(copy, CB, { dash: '5 3', stroke: '#8a5a00' }) + K.text(X(b + sl / 2), Y(h) - 8, '一样的三角形转半圈，放在这里', { size: 11, fill: '#8a5a00' });
      if (m.step === 2) s += poly(copy, CB) + poly([[0, 0], [b, 0], [b + sl, h], [sl, h]], 'none', { stroke: 'var(--blue)', w: 2.6 });
      s += btn(380, 330, 120, '再拿一个一样的', { step: 1 }, m.step === 0, '再拿一个完全一样的三角形') + btn(506, 330, 100, '转过来拼上', { step: 2 }, m.step === 1, '转半圈，拼到斜边上');
      if (m.step === 2) lines = ['两个一样的三角形拼成平行四边形：底 ' + b + '，高 ' + h, '平行四边形面积 ' + b + ' × ' + h + ' = ' + b * h + '，三角形是它的一半', '三角形面积 = 底 × 高 ÷ 2 = ' + Q.show(m.area)];
    } else {
      title = '梯形：上底 ' + t + '，下底 ' + b + '，高 ' + h;
      const trap = [[0, 0], [b, 0], [sl + t, h], [sl, h]], copy = [[b, 0], [b + t, 0], [b + sl + t, h], [sl + t, h]];
      s += poly(trap, CA);
      if (m.step === 1) s += poly(copy, CB, { dash: '5 3', stroke: '#8a5a00' }) + K.text(X(b + (sl + t) / 2), Y(h) - 8, '一样的梯形转半圈，放在这里', { size: 11, fill: '#8a5a00' });
      if (m.step === 2) s += poly(copy, CB) + poly([[0, 0], [b + t, 0], [b + sl + t, h], [sl, h]], 'none', { stroke: 'var(--blue)', w: 2.6 });
      s += btn(380, 330, 120, '再拿一个一样的', { step: 1 }, m.step === 0, '再拿一个完全一样的梯形') + btn(506, 330, 100, '转过来拼上', { step: 2 }, m.step === 1, '转半圈，拼到右边的腰上');
      if (m.step === 2) lines = ['两个一样的梯形拼成平行四边形：底 = 上底 + 下底 = ' + t + ' + ' + b + ' = ' + (b + t), '平行四边形面积 ' + (b + t) + ' × ' + h + ' = ' + (b + t) * h + '，梯形是它的一半', '梯形面积 = (上底 + 下底) × 高 ÷ 2 = ' + Q.show(m.area)];
    }
    s += btn(612, 330, 70, '重来', { step: 0 }, m.step > 0, '回到原来的图形，可以再拖');
    s += K.text(20, 26, title, { size: 16, weight: 700, anchor: 'start' });
    if (lines.length) s += '<g data-read="1">' + lines.map((l, i) => K.text(20, 50 + i * 20, l, { size: 13, weight: i === 1 ? 700 : 400, anchor: 'start', fill: 'var(--blue)' })).join('') + '</g>';
    else s += K.text(20, 50, m.step === 0 ? '拖角改底、高' + (m.shape === 1 ? '、顶点' : '、斜度') + '；再剪一剪、拼一拼' : '还没拼好', { size: 12, anchor: 'start', fill: '#5a6478' });
    return s;
  }
  const I = (lo, hi, d, label, o) => Object.assign({ type: 'int', label, default: d, min: lo, max: hi, write: true }, o || {});
  U.registerPack({
    id: 'areabench', version: 1,
    types: {
      areabench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E5', 'E4'],
        label: '面积公式推导', prefix: '面积推导', group: '图形', grades: [4, 5],
        alias: ['平行四边形的面积', '三角形的面积', '梯形的面积', '面积公式', '剪拼', '割补', '底乘高', '转化', '等积变形'],
        props: {
          shape: { type: 'choice', label: '什么图形', default: 0, choices: SHAPES, write: true },
          b: I(2, BMAX, 6, '底（梯形是下底）', { qmax: 12 }), t: I(1, TMAX, 3, '梯形的上底', { qmax: 10 }), h: I(1, HMAX, 4, '高', { qmax: 8 }), s: I(0, BMAX, 2, '斜度（三角形是顶点的位置）', { qmax: 12 }),
          step: I(0, 2, 0, '剪拼到第几步'), seen: { type: 'text', label: '平行四边形：拼成长方形时的斜度（自动记）', default: '', write: true },
          P: I(8, PMAX, 20, '篱笆：一共几米', { qmax: 28 }), w: I(1, PMAX / 2 - 1, 1, '篱笆：长几米', { qmax: 13 }), tried: { type: 'text', label: '篱笆：记下的长（自动）', default: '', write: true },
        },
        outputs: {
          area: { dim: null, kind: 'num', label: '面积（拼好了才有）' }, base: { dim: null, kind: 'num', label: '拼成的图形的底（拼好了才有）' }, seen: { dim: null, kind: 'num', label: '平行四边形：拼过几种斜度' }, best: { dim: null, kind: 'num', label: '篱笆：围出了最大面积 1' },
        },
        icon: () => '<polygon points="8,36 34,36 46,14 20,14" fill="' + CA + '" stroke="#3a4a63" stroke-width="1.4"/>' + K.line(20, 14, 20, 36, { stroke: 'var(--bad)', w: 1.4, dash: '3 2' }),
        size: () => [W, 400],
        recHide: true,   // 开了通用记录仪先猜时，不盖台面：篱笆围地自己把面积写成“？”
        grips,
        // 篱笆换了总长，“记下这一种”的列表是另一圈篱笆的：清空（开了记录仪时，图上只显示这一圈的点，记录不丢）。
        //   p 里的 P 已经是新值了，要和改以前的值 was 比（2026-11-26 以前比的是 p.P，永远一样，一直没清空过）
        onSet: (p, k, v, was) => (k === 'P' && fenceModel({ P: v }).P !== fenceModel({ P: was }).P ? { tried: '' } : null),
        compute: (c) => {
          if (+c.props.shape === 3) { const f = fenceModel(c.props), o = { seen: qv(Q(f.tried.length)), area: qv(Q(f.area)) }; if (f.best) o.best = qv(Q(1)); return o; }
          const m = model(c.props), o = { seen: qv(Q(m.seen.length)) };
          if (m.step === 2) { o.area = qv(m.area); o.base = qv(Q(m.base)); }
          return o;
        },
        badge: () => '',
        draw,
      },
    },
  });
  U.AreaBench = { model };
})(typeof globalThis !== 'undefined' ? globalThis : window);
