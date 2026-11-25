/* 器材包 areabench：面积公式推导。方格纸上一个图形，拖角改底、高、斜度；再一步一步剪、移、拼，变成已经会算的图形。
 *   - 平行四边形：点“沿高剪下来”，左边剪下一个三角形；点“移到右边”，拼成长方形：长就是底，宽就是高，面积 = 底 × 高。
 *     推斜了再剪拼一次（“重来”以后拖斜度），面积还是一样：记下拼过几种斜度。
 *   - 三角形：点“再拿一个一样的”，点“转过来拼上”，两个拼成平行四边形：三角形是它的一半，面积 = 底 × 高 ÷ 2。
 *   - 梯形：同样两个拼成平行四边形，底是上底 + 下底：面积 = (上底 + 下底) × 高 ÷ 2。
 * 拼好以前读不出面积（面积要靠拼出来）。
 * 这一版的边界（如实写）：边长都是整格；平行四边形的斜度不超过底（剪下的三角形落在底边上）；圆的切拼在“剪拼”器材里。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit, RS = K.research;
  const qv = (q) => U.val('num', q, { dim: null });
  const W = 700, X0 = 40, YB = 290, UN = 22;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? Math.round(+v) : lo));
  const SHAPES = ['平行四边形', '三角形', '梯形', '篱笆围地'];
  const X = (u) => X0 + u * UN, Y = (v) => YB - v * UN;
  function model(p) {
    const shape = clamp(p.shape, 0, 3) === 3 ? 0 : clamp(p.shape, 0, 2), b = clamp(p.b, 2, 12), h = clamp(p.h, 1, 8), t = clamp(p.t, 1, 10);
    const s = shape === 0 ? clamp(p.s, 0, b) : shape === 1 ? clamp(p.s, 0, b) : clamp(p.s, 0, 6), step = clamp(p.step, 0, 2);
    const seen = [...new Set(String(p.seen || '').split(',').filter((x) => x !== '').map(Number))];
    const base = shape === 2 ? b + t : b, area = shape === 0 ? Q(b * h) : Q(base * h, 2);
    return { shape, b, h, t, s, step, seen, base, area };
  }
  const poly = (pts, fill, o) => '<polygon points="' + pts.map(([u, v]) => X(u) + ',' + Y(v)).join(' ') + '" fill="' + fill + '" stroke="' + ((o && o.stroke) || '#3a4a63') + '" stroke-width="' + ((o && o.w) || 1.8) + '"' + (o && o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') + '/>';
  const btn = (x, y, w, label, patch, enabled, tip) => '<g' + (enabled ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' data-off="1"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 26, { fill: enabled ? '#fff' : '#f1f3f6', stroke: enabled ? 'var(--blue)' : '#b8c0cc', r: 7, w: 1.4 }) + K.text(x + w / 2, y + 17, label, { size: 12, weight: 700, fill: enabled ? 'var(--ink)' : '#5f6773' }) + '</g>';
  const CA = '#cfe3fb', CB = '#fde2c4';
  function grips(c) {
    if (+c.props.shape === 3) { const f = fenceModel(c.props); return [{ id: 'w', x: X(f.w), y: Y(Math.min(f.h, 8) / 2), r: 10, cursor: 'ew-resize', tip: '拖：改长', drag: (c0, q) => ({ w: Math.max(1, Math.min(fenceModel(c0.props).P / 2 - 1, Math.round((q.x - X0) / UN))), guess: -1, peek: false }), say: (c1) => { const f1 = fenceModel(c1.props); return f1.w + ' × ' + f1.h + ' = ' + (f1.hidden ? '？' : f1.area); } }]; }
    const m = model(c.props); if (m.step) return [];
    const u = (q) => (q.x - X0) / UN, v = (q) => (YB - q.y) / UN, out = [];
    out.push({ id: 'b', x: X(m.b), y: Y(0), r: 9, cursor: 'ew-resize', tip: '拖：改底', drag: (c0, q) => ({ b: clamp(u(q), 2, 12) }), say: (c1) => '底 ' + model(c1.props).b });
    const topX = m.shape === 1 ? m.s : m.s + (m.shape === 0 ? m.b : m.t) / 2;
    out.push({ id: 'h', x: X(topX), y: Y(m.h), r: 9, cursor: 'ns-resize', tip: '拖：改高', drag: (c0, q) => ({ h: clamp(v(q), 1, 8) }), say: (c1) => '高 ' + model(c1.props).h });
    if (m.shape !== 1) out.push({ id: 's', x: X(m.s), y: Y(m.h), r: 9, cursor: 'ew-resize', tip: '拖：推斜一点', drag: (c0, q) => ({ s: clamp(u(q), 0, m.shape === 0 ? model(c0.props).b : 6) }), say: (c1) => '斜度 ' + model(c1.props).s });
    else out.push({ id: 's', x: X(m.s) - 0.01, y: Y(m.h) - 16, r: 8, cursor: 'ew-resize', tip: '拖：顶点往左右挪', drag: (c0, q) => ({ s: clamp(u(q), 0, model(c0.props).b) }), say: (c1) => '顶点在 ' + model(c1.props).s });
    if (m.shape === 2) out.push({ id: 't', x: X(m.s + m.t), y: Y(m.h), r: 9, cursor: 'ew-resize', tip: '拖：改上底', drag: (c0, q) => ({ t: clamp(u(q) - model(c0.props).s, 1, 10) }), say: (c1) => '上底 ' + model(c1.props).t });
    return out;
  }
  // ---------- 篱笆围地（shape 3）：篱笆一共 P 米，围一个长方形；拖右边改长，宽自动是 P ÷ 2 − 长 ----------
  function fenceModel(p) {
    const P = Math.max(8, Math.min(28, Math.round(+p.P || 20) & ~1)), w = Math.max(1, Math.min(P / 2 - 1, Math.round(+p.w || 1))), h = P / 2 - w;
    const tried = [...new Set(String(p.tried || '').split(',').filter((x) => x !== '').map(Number))].filter((x) => x >= 1 && x < P / 2).sort((a, b) => a - b);
    let maxA = 0; for (let x = 1; x < P / 2; x++) maxA = Math.max(maxA, x * (P / 2 - x));
    // 记下来（graph）：记满 3 个以后，换到没记过的长，面积先藏起来：先在蓝线上猜面积，或者“不猜，直接看”
    const graph = !!p.graph, has = tried.includes(w), guess = Number.isInteger(+p.guess) && +p.guess >= 0 ? +p.guess : -1;
    const hidden = graph && tried.length >= 3 && !has && guess < 0 && !p.peek;
    const cnt = (v) => Math.max(0, Math.min(99, Math.round(+v) || 0));
    const areas = [...new Set(Array.from({ length: P / 2 - 1 }, (_, i) => (i + 1) * (P / 2 - i - 1)))].sort((a, b) => a - b);
    return { P, w, h, area: w * h, tried, maxA, best: w * h === maxA, graph, has, guess, hidden, peek: !!p.peek, gok: cnt(p.gok), gtry: cnt(p.gtry), all: !!p.all, areas, asks: RS.parseAsk(p.ask, p.pick, tried.length >= 3) };
  }
  const FY = 372, FGH = 250;
  const fLay = (m) => { const yg = FY, ya = yg + FGH + 8; return { yg, ya, end: ya + RS.asksH(m.asks) }; };
  function drawFenceGraph(m) {
    const L = fLay(m), half = m.P / 2;
    const P = RS.plot({ fx: 14, fy: L.yg, fw: 672, fh: FGH, xa: 0, xb: half, ya: 0, yb: Math.ceil(m.maxA / 5) * 5 + (m.maxA % 5 ? 0 : 5), bottom: 30, title: '📈 记下来：横着是长（米），竖着是面积（平方米）；篱笆一共 ' + m.P + ' 米' });
    const { X, Y } = P; let s = P.s;
    if (m.all) for (let x = 1; x < half; x++) s += K.circle(X(x), Y(x * (half - x)), 3, { fill: '#9cc3ee', stroke: 'none' });
    for (const x of m.tried) s += K.circle(X(x), Y(x * (half - x)), 5, { fill: x * (half - x) === m.maxA ? '#5cb85c' : 'var(--blue)', stroke: 'var(--ink)', w: 1.1 });
    s += K.line(X(m.w), P.Y0 - 4, X(m.w), P.Y1 + 2, { w: 1.4, stroke: 'var(--blue)', dash: '4 3' });
    // 猜的格子：只放能围出来的那几种面积，一种一格
    // 挨得太近的（比如 24 和 25）往旁边错开一格，高度不变；格子朝图中间错开，免得出界
    if (m.hidden) {
      const dir = m.w > half / 2 ? -1 : 1, last = [];
      for (const a of m.areas) {
        let k = 0; while (last[k] !== undefined && Math.abs(last[k] - Y(a)) < 16) k++; last[k] = Y(a);
        const cx = X(m.w) + dir * k * 36;
        if (k) s += K.line(X(m.w), Y(a), cx, Y(a), { w: 1, stroke: 'var(--blue)', dash: '2 2' });
        s += '<g data-pick-set="' + encodeURIComponent(JSON.stringify({ guess: a })) + '" style="cursor:pointer"><title>猜面积 ' + a + '</title>' + K.rect(cx - 16, Y(a) - 7, 32, 14, { fill: '#fff', stroke: 'var(--blue)', w: 1, r: 3 }) + K.text(cx, Y(a) + 4, String(a), { size: 9.5, weight: 700, fill: 'var(--blue)' }) + '</g>';
      }
    }
    if (m.guess >= 0 && !m.has) s += K.rect(X(m.w) - 7, Y(m.guess) - 7, 14, 14, { fill: 'none', stroke: 'var(--blue)', w: 1.8, r: 2, dash: '3 2' });
    let say = m.tried.length < 3 ? '再记 ' + (3 - m.tried.length) + ' 个，就要先猜再看（拖长，点“记下来”）' : m.has ? '这个长图上已经有了：拖一下换个长' : m.hidden ? '先猜：长 ' + m.w + ' 米，面积是几？点蓝线上的一格' : m.guess >= 0 ? '你猜面积 ' + m.guess + '，' + (m.guess === m.area ? '猜对了！' : '其实是 ' + m.area + '。') + '点“记下来”' : '';
    if (m.gtry) say += (say ? '　' : '') + '猜了 ' + m.gtry + ' 次，猜对 ' + m.gok + ' 次';
    s += K.text(24, L.yg + 36, say, { size: 11, anchor: 'start', fill: 'var(--blue)', weight: 700 });
    s += RS.btn(556, L.yg + 4, 116, '全部试一遍', { all: !m.all }, m.tried.length >= 5 || m.all, m.tried.length >= 5 ? (m.all ? '收起全部' : '每个长都画上') : '图上有 5 个点以后才能全部试一遍', m.all);
    return s + RS.drawAsks(L.ya, m.asks, m.tried.length >= 3);
  }
  function drawFence(c) {
    const m = fenceModel(c.props); let s = '';
    s += K.text(20, 26, '篱笆一共 ' + m.P + ' 米，围成长方形：怎样围面积最大？', { size: 16, weight: 700, anchor: 'start' });
    for (let i = 0; i <= 14; i++) s += K.line(X(i), Y(0), X(i), Y(8), { stroke: '#e3e7ef', w: 1 });
    for (let j = 0; j <= 8; j++) s += K.line(X(0), Y(j), X(14), Y(j), { stroke: '#e3e7ef', w: 1 });
    const hh = Math.min(m.h, 8);
    s += K.rect(X(0), Y(hh), m.w * UN, hh * UN, { fill: m.best && !m.hidden ? '#d6f0d6' : '#cfe3fb', stroke: '#8a5a00', r: 0, w: 3 });
    s += K.text(X(m.w / 2), Y(0) + 18, '长 ' + m.w + ' 米', { size: 12, weight: 700 }) + K.text(X(m.w) + 18, Y(hh / 2) - 14, '宽 ' + m.h + ' 米', { size: 12, weight: 700, anchor: 'start' });
    const R0 = 400;
    s += K.text(R0, 70, '长 + 宽 = ' + m.P + ' ÷ 2 = ' + m.P / 2, { size: 13, anchor: 'start' }) + K.text(R0, 96, '面积 = ' + m.w + ' × ' + m.h + ' = ' + (m.hidden ? '？' : m.area + ' 平方米'), { size: 15, weight: 700, anchor: 'start', fill: 'var(--blue)' });
    if (m.graph) {
      const rec = { tried: [...new Set(m.tried.concat([m.w]))].join(','), guess: -1 };
      if (m.guess >= 0) Object.assign(rec, { gtry: m.gtry + 1, gok: m.gok + (m.guess === m.area ? 1 : 0) });
      s += RS.btn(R0, 112, 110, '记下来', rec, !m.hidden && !m.has, m.has ? '这个长已经记过了' : m.hidden ? '先猜面积，或者点“不猜，直接看”' : '把这个长记到图上');
      if (m.hidden) s += RS.btn(R0 + 120, 112, 120, '不猜，直接看', { peek: true }, true, '不猜，直接看');
    } else s += '<g data-pick-set="' + encodeURIComponent(JSON.stringify({ tried: [...new Set(m.tried.concat([m.w]))].join(',') })) + '" style="cursor:pointer"><title>记下这一种</title>' + K.rect(R0, 112, 110, 26, { fill: '#fff', stroke: 'var(--blue)', r: 7, w: 1.4 }) + K.text(R0 + 55, 129, '记下这一种', { size: 12, weight: 700 }) + '</g>';
    // 开了图，记下的都在图上；不再列算式（列出 4 × 6 = 24，长 6 的面积就不用猜了）
    if (!m.graph) s += K.text(R0, 166, '记下的：', { size: 12, weight: 700, anchor: 'start' });
    if (!m.graph) m.tried.forEach((x, i) => { s += K.text(R0 + (i % 2) * 140, 188 + Math.floor(i / 2) * 20, x + ' × ' + (m.P / 2 - x) + ' = ' + x * (m.P / 2 - x), { size: 12, anchor: 'start', fill: x * (m.P / 2 - x) === m.maxA ? 'var(--blue)' : 'var(--ink)' }); });
    if (m.best && !m.hidden) s += '<g data-read="1">' + K.text(20, 352, '面积最大：' + m.area + ' 平方米。' + (m.w === m.h ? '围成正方形面积最大' : '长和宽越接近，面积越大'), { size: 14, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
    else s += K.text(20, 352, '周长一样，面积不一定一样：拖右边的圆点换一种长', { size: 12, anchor: 'start', fill: '#5a6478' });
    if (m.graph) s += drawFenceGraph(m);
    return s;
  }
  function draw(c) {
    if (+c.props.shape === 3) return drawFence(c);
    const p = c.props, m = model(p); let s = '';
    // 方格
    for (let i = 0; i <= 28; i++) s += K.line(X(i), Y(0), X(i), Y(8), { stroke: '#e3e7ef', w: 1 });
    for (let j = 0; j <= 8; j++) s += K.line(X(0), Y(j), X(28), Y(j), { stroke: '#e3e7ef', w: 1 });
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
          b: I(2, 12, 6, '底（梯形是下底）'), t: I(1, 10, 3, '梯形的上底'), h: I(1, 8, 4, '高'), s: I(0, 12, 2, '斜度（三角形是顶点的位置）'),
          step: I(0, 2, 0, '剪拼到第几步'), seen: { type: 'text', label: '平行四边形：拼成长方形时的斜度（自动记）', default: '', write: true },
          P: I(8, 28, 20, '篱笆：一共几米'), w: I(1, 13, 1, '篱笆：长几米'), tried: { type: 'text', label: '篱笆：记下的长（自动）', default: '', write: true },
          graph: { type: 'bool', label: '篱笆：记下来，画成长 → 面积的图', default: false, write: true },
          guess: I(-1, 99, -1, '篱笆图上猜的面积（-1 没猜）', { hidden: true }), peek: { type: 'bool', label: '不猜，直接看', default: false, write: true, hidden: true },
          gok: I(0, 99, 0, '猜对几次（自动）', { hidden: true }), gtry: I(0, 99, 0, '猜了几次（自动）', { hidden: true }),
          all: { type: 'bool', label: '全部试一遍', default: false, write: true, hidden: true },
          ask: { type: 'text', label: '追问（题干|选项|*对的选项~…）', default: '', write: true }, pick: { type: 'text', label: '追问选了第几个', default: '', write: true },
        },
        outputs: {
          area: { dim: null, kind: 'num', label: '面积（拼好了才有）' }, base: { dim: null, kind: 'num', label: '拼成的图形的底（拼好了才有）' }, seen: { dim: null, kind: 'num', label: '平行四边形：拼过几种斜度' }, best: { dim: null, kind: 'num', label: '篱笆：围出了最大面积 1' },
          pts: { dim: null, kind: 'num', label: '篱笆：图上记了几个长' }, gok: { dim: null, kind: 'num', label: '篱笆：先猜再看，猜对几次' }, gtry: { dim: null, kind: 'num', label: '篱笆：先猜再看，猜了几次' }, all: { dim: null, kind: 'num', label: '篱笆：全部试一遍了 1' },
          q1: { dim: null, kind: 'num', label: '追问 1 选了第几个' }, q2: { dim: null, kind: 'num', label: '追问 2 选了第几个' },
        },
        icon: () => '<polygon points="8,36 34,36 46,14 20,14" fill="' + CA + '" stroke="#3a4a63" stroke-width="1.4"/>' + K.line(20, 14, 20, 36, { stroke: 'var(--bad)', w: 1.4, dash: '3 2' }),
        size: (e) => { const p = (e && e.props) || {}; if (+p.shape === 3 && p.graph) return [W, fLay(fenceModel(p)).end + 30]; return [W, 400]; },
        grips,
        // 篱笆换了总长，原来记下的长是另一圈篱笆的：清空图，重新记（猜的次数留着）
        onSet: (p, k, v) => (k === 'P' && Math.round(+v) !== Math.round(+p.P) ? { tried: '', guess: -1, peek: false, all: false } : null),
        compute: (c) => {
          if (+c.props.shape === 3) { const f = fenceModel(c.props), o = { seen: qv(Q(f.tried.length)) }; if (!f.hidden) o.area = qv(Q(f.area)); if (f.best && !f.hidden) o.best = qv(Q(1));
            if (f.graph) { o.pts = qv(Q(f.tried.length)); o.gok = qv(Q(f.gok)); o.gtry = qv(Q(f.gtry)); o.all = qv(Q(f.all ? 1 : 0)); f.asks.forEach((a, i) => { if (a.pick) o['q' + (i + 1)] = qv(Q(a.pick)); }); }
            return o; }
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
