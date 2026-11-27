/* 器材包 groupbench：分一分（带余除法、抽屉原理）。一堆圆片，两种分法：
 *   - 每份几个（包含除）：拖下面的把手改“每份几个”，圆片每这么多个圈一圈；圈不满的就是余数（标红）。
 *   - 平均分给几份（等分除）：点 + − 改有几个盒子；点“放一个”“放一轮”“全放完”，圆片一个一个轮流放进盒子。放完以后看最多的盒子有几个。
 * 上面的算式跟着变：17 ÷ 5 = 3 …… 2。余数永远比除数小。
 *   记下来（graph，只在“每份几个”里有；docs/knob-graph-and-gallery.md 第一节）：每份几个不动，台面上改总数（− +），点“记下来”，
 *     图上多两个点：商（橙，一级一级的台阶）和余数（红，一格一格涨上去、到除数就掉回 0 的锯齿）。
 *     图上有 3 个点以后，换到图上还没有的总数，圈和算式先藏起来：在蓝线旁边点一格猜商、一格猜余数，或者点“不猜，直接看”；猜了再记下来，算一次猜没猜对。
 *     有 5 个点以后可以“全部试一遍”：从 1 到最大的总数，商和余数都画上（浅色）。换了每份几个，图上只留这个“每份几个”的点。
 * 这一版的边界（如实写）：最多 100 个圆片；每份最多 20 个、最多 10 个盒子；三位数除以两位数那种大数，圆片画不下，还在用旧器材。
 *   先猜时商和余数都要猜（2026-11-26 起；以前只猜余数，商跟着一起揭开）：蓝线左边一列橙圈猜商，右边一列红方块猜余数，两个都点了才揭开；两个都对才算猜对一次。
 *   记下来也在“平均分给几份”里（2026-11-25）：盒子数不动，改总数，全放完以后点“记下来”，图上多一个点：最多的盒子有几个。
 *     点排成台阶，但和“每份几个”的商不一样：总数刚过 3 的倍数（3 个盒子时）就往上跳一级，这就是抽屉原理“至少有一个盒子放了 ⌈总数 ÷ 盒子数⌉ 个”。
 *     图上有 3 个点以后，换到新的总数，放的按钮先锁住：先在蓝线上猜最多的盒子有几个，或者“不猜，直接看”。记录存在 rec1（总数,盒子数;…）。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit, RS = K.research;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 660, NMAX = 100, GMAX = 20, BMAX = 10, X0 = 30, Y0 = 92, D = 22, SX = 40, SX1 = 420, SY = 340;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? +v : lo));
  function model(p) {
    const n = clamp(p.n, 1, NMAX), mode = clamp(p.mode, 0, 1);
    if (mode === 0) {
      const g = clamp(p.g, 1, Math.min(GMAX, n)), graph = !!p.graph;
      const rec = String(p.rec || '').split(';').map((e) => e.split(',').map(Number)).filter((a) => a.length === 2 && a.every(Number.isInteger) && a[0] >= 1 && a[0] <= NMAX && a[1] >= 1 && a[1] <= GMAX);
      const pts = rec.filter((a) => a[1] === g).map((a) => a[0]).filter((x, i, a) => a.indexOf(x) === i).sort((a, b) => a - b);
      const guess = Number.isInteger(+p.guess) && +p.guess >= 0 ? +p.guess : -1, gq = Number.isInteger(+p.gq) && +p.gq >= 0 ? +p.gq : -1, has = pts.includes(n);
      const hidden = graph && pts.length >= 3 && !has && (guess < 0 || gq < 0) && !p.peek;   // 商和余数都猜了才揭开
      const asks = RS.parseAsk(p.ask, p.pick, pts.length >= 3);
      return { mode, n, g, q: Math.floor(n / g), r: n % g, graph, rec, pts, guess, gq, has, hidden, peek: !!p.peek, gok: clamp(p.gok, 0, 99), gtry: clamp(p.gtry, 0, 99), all: !!p.all, asks };
    }
    const k = clamp(p.k, 1, BMAX), dealt = clamp(p.dealt, 0, n), box = Array.from({ length: k }, (_, i) => Math.floor(dealt / k) + (i < dealt % k ? 1 : 0));
    const graph = !!p.graph, rec1 = String(p.rec1 || '').split(';').map((e) => e.split(',').map(Number)).filter((a) => a.length === 2 && a.every(Number.isInteger) && a[0] >= 1 && a[0] <= NMAX && a[1] >= 1 && a[1] <= BMAX);
    const pts = rec1.filter((a) => a[1] === k).map((a) => a[0]).filter((x, i, a) => a.indexOf(x) === i).sort((a, b) => a - b);
    const guess = Number.isInteger(+p.guess) && +p.guess >= 0 ? +p.guess : -1, has = pts.includes(n);
    const hidden = graph && pts.length >= 3 && !has && guess < 0 && !p.peek && dealt === 0;
    return { mode, n, k, dealt, box, max: Math.max.apply(null, box), min: Math.min.apply(null, box), top: Math.ceil(n / k), q: Math.floor(n / k), r: n % k,
      graph, rec1, pts, guess, has, hidden, peek: !!p.peek, gok: clamp(p.gok, 0, 99), gtry: clamp(p.gtry, 0, 99), all: !!p.all, asks: RS.parseAsk(p.ask, p.pick, pts.length >= 3) };
  }
  const btn = (x, y, w, label, patch, enabled, tip) => '<g' + (enabled ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' data-off="1"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 26, { fill: enabled ? '#fff' : '#f1f3f6', stroke: enabled ? 'var(--blue)' : '#b8c0cc', r: 8, w: 1.5 }) + K.text(x + w / 2, y + 17, label, { size: 12, weight: 700, fill: enabled ? 'var(--ink)' : '#5f6773' }) + '</g>';
  const chip = (x, y, col) => K.circle(x, y, 8, { fill: col, stroke: 'var(--ink)', w: 1.1 });

  // ---- 记下来：总数 → 商、余数 ----
  const GY0 = SY + 40, GH = 236, HIDE = '？';
  const gLay = (m) => { const yb = GY0 + 36, ya = yb + GH; return { yb, yg: yb + 34, ya, end: ya + RS.asksH(m.asks) }; };
  const xEnd = (m) => Math.min(NMAX, Math.max(20, m.n, ...m.pts));
  function drawGraph(m, p) {
    const u = p.unit || '个', L = gLay(m), xb = xEnd(m), yb = Math.max(m.g - 1, Math.floor(xb / m.g), 1);
    let s = K.text(20, L.yb + 17, '总数', { size: 12, weight: 700, anchor: 'start' }) + RS.btn(54, L.yb, 26, '−', { n: m.n - 1, guess: -1, gq: -1, peek: false }, m.n > 1, '总数少 1') +
      K.text(104, L.yb + 17, String(m.n), { size: 14, weight: 700 }) + RS.btn(128, L.yb, 26, '+', { n: m.n + 1, guess: -1, gq: -1, peek: false }, m.n < NMAX, '总数多 1');
    // 商和余数都猜了才算猜了一次；两个都对才算猜对
    const both = m.guess >= 0 && m.gq >= 0, qok = m.gq === m.q, rok = m.guess === m.r;
    const rec = { rec: m.rec.map((a) => a.join(',')).concat([m.n + ',' + m.g]).join(';'), guess: -1, gq: -1 };
    if (both) Object.assign(rec, { gtry: m.gtry + 1, gok: m.gok + (qok && rok ? 1 : 0) });
    s += RS.btn(170, L.yb, 110, '记下来', rec, !m.hidden && !m.has, m.has ? '这个总数已经记过了' : m.hidden ? '先猜商和余数，或者点“不猜，直接看”' : '把这个总数记到图上');
    if (m.hidden) s += RS.btn(290, L.yb, 120, '不猜，直接看', { peek: true }, true, '不猜，直接看');
    const P = RS.plot({ fx: 14, fy: L.yg, fw: 620, fh: GH - 44, xa: 0, xb, ya: 0, yb, title: '📈 记下来：横着是一共几' + u + '，竖着是商（橙）和余数（红）；每份 ' + m.g + ' ' + u });
    const { X, Y, ys } = P; s += P.s;
    // 商的点往左挪一点、余数的往右挪一点：两个一样大时也都看得见
    const dq = -3.5, dr = 3.5;
    if (m.all) for (let x = 1; x <= xb; x++) s += K.circle(X(x) + dq, Y(Math.floor(x / m.g)), 2.8, { fill: '#efc08a', stroke: 'none' }) + K.rect(X(x) + dr - 2.5, Y(x % m.g) - 2.5, 5, 5, { fill: '#eda39a', r: 0 });
    for (const x of m.pts) s += K.circle(X(x) + dq, Y(Math.floor(x / m.g)), 4.6, { fill: '#f5a25d', stroke: 'var(--ink)', w: 1.1 }) + K.rect(X(x) + dr - 4, Y(x % m.g) - 4, 8, 8, { fill: '#e0645a', stroke: 'var(--ink)', w: 1.1, r: 1 });
    s += K.line(X(m.n), P.Y0 - 4, X(m.n), P.Y1 + 2, { w: 1.4, stroke: 'var(--blue)', dash: '4 3' });
    // 先猜：蓝线左边一列橙圈猜商（台阶），右边一列红方块猜余数（锯齿）；两个都点了才揭开
    const qx = X(m.n) + dq * 2.6, rx = X(m.n) + dr * 2.6, hh = Math.max(8, ys);
    if (m.hidden) {
      for (let v = 0; v <= yb; v++) s += '<g data-pick-set="' + encodeURIComponent(JSON.stringify({ gq: v })) + '" style="cursor:pointer"><title>猜商 ' + v + '</title><rect x="' + (qx - 9) + '" y="' + (Y(v) - hh / 2) + '" width="18" height="' + hh + '" fill="transparent"/>' + K.circle(qx, Y(v), 2.4, { fill: '#fff', stroke: '#f5a25d', w: 1.2 }) + '</g>';
      for (let v = 0; v < m.g; v++) s += '<g data-pick-set="' + encodeURIComponent(JSON.stringify({ guess: v })) + '" style="cursor:pointer"><title>猜余数 ' + v + '</title><rect x="' + (rx - 9) + '" y="' + (Y(v) - hh / 2) + '" width="18" height="' + hh + '" fill="transparent"/>' + K.rect(rx - 2.2, Y(v) - 2.2, 4.4, 4.4, { fill: '#fff', stroke: '#e0645a', w: 1.2, r: 0 }) + '</g>';
      s += K.text(qx - 4, P.Y0 - 8, '商', { size: 10, weight: 700, anchor: 'end', fill: '#c46a1a' }) + K.text(rx + 4, P.Y0 - 8, '余数', { size: 10, weight: 700, anchor: 'start', fill: '#c0392b' });
    }
    if (m.gq >= 0 && !m.has) s += '<g data-gq="' + m.gq + '">' + K.circle(qx, Y(m.gq), 6.5, { fill: 'none', stroke: 'var(--blue)', w: 1.8 }) + '</g>';
    if (m.guess >= 0 && !m.has) s += '<g data-gr="' + m.guess + '">' + K.rect(rx - 6, Y(m.guess) - 6, 12, 12, { fill: 'none', stroke: 'var(--blue)', w: 1.8, r: 2, dash: '3 2' }) + '</g>';
    const told = both ? '你猜商 ' + m.gq + '、余数 ' + m.guess + '，' + (qok && rok ? '都猜对了！' : qok ? '商对了，余数其实是 ' + m.r + '。' : rok ? '余数对了，商其实是 ' + m.q + '。' : '其实商是 ' + m.q + '、余数是 ' + m.r + '。') + '点“记下来”' : '';
    let say = m.pts.length < 3 ? '再记 ' + (3 - m.pts.length) + ' 个，就要先猜再看（改总数，点“记下来”）' : m.has ? '这个总数图上已经有了：改一下总数'
      : m.hidden && m.gq >= 0 ? '商猜了 ' + m.gq + '，再猜余数：点蓝线右边的红方块' : m.hidden && m.guess >= 0 ? '余数猜了 ' + m.guess + '，再猜商：点蓝线左边的橙圈'
      : m.hidden ? '先猜：一共 ' + m.n + ' ' + u + '，商和余数各是几？蓝线左边的橙圈猜商，右边的红方块猜余数' : told;
    if (m.gtry) say += (say ? '　' : '') + '猜了 ' + m.gtry + ' 次，猜对 ' + m.gok + ' 次';
    s += K.text(24, L.yg + 34, say, { size: 11, anchor: 'start', fill: 'var(--blue)', weight: 700 });
    s += RS.btn(504, L.yg + 4, 116, '全部试一遍', { all: !m.all }, m.pts.length >= 5 || m.all, m.pts.length >= 5 ? (m.all ? '收起全部' : '每个总数都画上') : '图上有 5 个点以后才能全部试一遍', m.all);
    return s + RS.drawAsks(L.ya, m.asks, m.pts.length >= 3);
  }
  // ---- 记下来（平均分给几份）：总数 → 最多的盒子有几个 ----
  function drawGraph1(m, p) {
    const u = p.unit || '个', L = gLay(m), xb = xEnd(m), yb = Math.max(1, Math.ceil(xb / m.k)), reset = { dealt: 0, guess: -1, peek: false };
    let s = K.text(20, L.yb + 17, '总数', { size: 12, weight: 700, anchor: 'start' }) + RS.btn(54, L.yb, 26, '−', Object.assign({ n: m.n - 1 }, reset), m.n > 1, '总数少 1') +
      K.text(104, L.yb + 17, String(m.n), { size: 14, weight: 700 }) + RS.btn(128, L.yb, 26, '+', Object.assign({ n: m.n + 1 }, reset), m.n < NMAX, '总数多 1');
    const rec = { rec1: m.rec1.map((a) => a.join(',')).concat([m.n + ',' + m.k]).join(';'), guess: -1 };
    if (m.guess >= 0) Object.assign(rec, { gtry: m.gtry + 1, gok: m.gok + (m.guess === m.top ? 1 : 0) });
    const full = m.dealt === m.n;
    s += RS.btn(170, L.yb, 110, '记下来', rec, full && !m.has, m.has ? '这个总数已经记过了' : !full ? '先全放完，才知道最多的盒子有几个' : '把这个总数记到图上');
    if (m.hidden) s += RS.btn(290, L.yb, 120, '不猜，直接看', { peek: true }, true, '不猜，直接看');
    const P = RS.plot({ fx: 14, fy: L.yg, fw: 620, fh: GH - 44, xa: 0, xb, ya: 0, yb, title: '📈 记下来：横着是一共几' + u + '，竖着是最多的盒子有几' + u + '；' + m.k + ' 个盒子' });
    const { X, Y, ys } = P; s += P.s;
    if (m.all) for (let x = 1; x <= xb; x++) s += K.circle(X(x), Y(Math.ceil(x / m.k)), 2.8, { fill: '#efc08a', stroke: 'none' });
    for (const x of m.pts) s += K.circle(X(x), Y(Math.ceil(x / m.k)), 4.6, { fill: '#f5a25d', stroke: 'var(--ink)', w: 1.1 });
    s += K.line(X(m.n), P.Y0 - 4, X(m.n), P.Y1 + 2, { w: 1.4, stroke: 'var(--blue)', dash: '4 3' });
    if (m.hidden) for (let r = 0; r <= yb; r++) s += '<g data-pick-set="' + encodeURIComponent(JSON.stringify({ guess: r })) + '" style="cursor:pointer"><title>猜最多的盒子 ' + r + ' 个</title><rect x="' + (X(m.n) - 9) + '" y="' + (Y(r) - ys / 2) + '" width="18" height="' + ys + '" fill="transparent"/></g>';
    if (m.guess >= 0 && !m.has) s += K.rect(X(m.n) - 6, Y(m.guess) - 6, 12, 12, { fill: 'none', stroke: 'var(--blue)', w: 1.8, r: 2, dash: '3 2' });
    let say = m.pts.length < 3 ? '再记 ' + (3 - m.pts.length) + ' 个，就要先猜再放（改总数，全放完，点“记下来”）' : m.has ? '这个总数图上已经有了：改一下总数'
      : m.hidden ? '先猜：' + m.n + ' ' + u + '放进 ' + m.k + ' 个盒子，最多的盒子有几' + u + '？点蓝线上的一格' : m.guess >= 0 && !full ? '你猜 ' + m.guess + ' ' + u + '：放完看看'
      : m.guess >= 0 ? '你猜 ' + m.guess + '，' + (m.guess === m.top ? '猜对了！' : '其实是 ' + m.top + '。') + '点“记下来”' : '';
    if (m.gtry) say += (say ? '　' : '') + '猜了 ' + m.gtry + ' 次，猜对 ' + m.gok + ' 次';
    s += K.text(24, L.yg + 34, say, { size: 11, anchor: 'start', fill: 'var(--blue)', weight: 700 });
    s += RS.btn(504, L.yg + 4, 116, '全部试一遍', { all: !m.all }, m.pts.length >= 5 || m.all, m.pts.length >= 5 ? (m.all ? '收起全部' : '每个总数都画上') : '图上有 5 个点以后才能全部试一遍', m.all);
    return s + RS.drawAsks(L.ya, m.asks, m.pts.length >= 3);
  }
  function draw(c) {
    const p = c.props, m = model(p), u = p.unit || '个', gname = p.gname || (m.mode ? '盒' : '份'); let s = '';
    if (m.mode === 0 && m.hidden) {
      // 先猜：圈和算式藏起来，圆片一排 25 个摆着
      s += K.text(20, 28, m.n + ' ' + u + '，每 ' + m.g + ' ' + u + '一' + gname, { size: 16, weight: 700, anchor: 'start' });
      s += '<g data-eq="1">' + K.text(20, 54, m.n + ' ÷ ' + m.g + ' = ' + HIDE + ' …… ' + HIDE, { size: 18, weight: 700, anchor: 'start' }) + '</g>';
      s += K.text(260, 54, '先猜商和余数，再看圈', { size: 13, anchor: 'start', fill: 'var(--blue)', weight: 700 });
      for (let i = 0; i < m.n; i++) s += chip(X0 + (i % 25) * 22, Y0 + Math.floor(i / 25) * D, '#d9dee8');
    } else if (m.mode === 0) {
      s += K.text(20, 28, m.n + ' ' + u + '，每 ' + m.g + ' ' + u + '一' + gname, { size: 16, weight: 700, anchor: 'start' });
      s += '<g data-eq="1">' + K.text(20, 54, m.n + ' ÷ ' + m.g + ' = ' + m.q + (m.r ? ' …… ' + m.r : ''), { size: 18, weight: 700, anchor: 'start', fill: m.r ? 'var(--ink)' : 'var(--good)' }) + '</g>';
      s += K.text(260, 54, m.q + ' ' + gname + (m.r ? '，还剩 ' + m.r + ' ' + u + '（不够一' + gname + '）' : '，正好分完'), { size: 13, anchor: 'start', fill: m.r ? 'var(--bad)' : 'var(--good)' });
      // 每一组排成一行（组太多就折成两列）
      const ng = m.q + (m.r ? 1 : 0), cols = Math.ceil(ng / 11), colW = 610 / cols, st = Math.min(19, (colW - 24) / m.g);   // 组多就折成几列，圆片挤一点
      for (let gi = 0; gi < m.q + (m.r ? 1 : 0); gi++) {
        const cx = X0 + (gi % cols) * colW, cy = Y0 + Math.floor(gi / cols) * D, cnt = gi < m.q ? m.g : m.r, full = gi < m.q;
        s += '<rect data-group="' + gi + '" x="' + (cx - 11) + '" y="' + (cy - 10) + '" width="' + (cnt * st + 4) + '" height="20" rx="10" fill="none" stroke="' + (full ? 'var(--blue)' : 'var(--bad)') + '" stroke-width="1.6"' + (full ? '' : ' stroke-dasharray="4 3"') + '/>';
        for (let j = 0; j < cnt; j++) s += chip(cx + j * st, cy, full ? '#f5c26b' : '#f7a8a8');
      }
      // 把手：每份几个
      const sx = (g) => SX + (g - 1) * (SX1 - SX) / (GMAX - 1);
      s += K.line(SX, SY, SX1, SY, { w: 3, stroke: '#c5ccda' }) + K.text(SX, SY - 12, '每' + gname + '几' + u + '：拖蓝色把手', { size: 12, anchor: 'start', fill: '#5a6478' });
      for (const g of [1, 5, 10, 15, 20]) s += K.text(sx(g), SY + 18, String(g), { size: 10, fill: '#5a6478' });
    }
    if (m.mode === 0 && m.graph) s += drawGraph(m, p);
    if (m.mode === 0) {
      // 上面已经画完
    } else {
      s += K.text(20, 28, m.n + ' ' + u + '，平均放进 ' + m.k + ' 个' + (p.gname || '盒子'), { size: 16, weight: 700, anchor: 'start' });
      s += K.text(20, 54, '已经放了 ' + m.dealt + ' ' + u + '，还剩 ' + (m.n - m.dealt) + ' ' + u, { size: 13, anchor: 'start' });
      const go = m.dealt < m.n && !m.hidden, lockTip = '先在下面的图上猜最多的盒子有几个，或者点“不猜，直接看”';
      s += btn(20, 64, 72, '放一个', { dealt: m.dealt + 1 }, go, m.hidden ? lockTip : '把一个放进下一个盒子');
      s += btn(98, 64, 72, '放一轮', { dealt: Math.min(m.n, m.dealt + m.k) }, go, m.hidden ? lockTip : '每个盒子各放一个');
      s += btn(176, 64, 72, '全放完', { dealt: m.n }, go, m.hidden ? lockTip : '一直轮流放，直到放完');
      s += btn(254, 64, 60, '倒出来', { dealt: 0 }, m.dealt > 0, '重新放');
      s += K.text(330, 82, '盒子：', { size: 12, anchor: 'start' }) + btn(372, 64, 28, '−', { k: m.k - 1, dealt: 0, guess: -1, peek: false }, m.k > 1, '少一个盒子') + btn(404, 64, 28, '+', { k: m.k + 1, dealt: 0, guess: -1, peek: false }, m.k < BMAX, '多一个盒子');
      const bw = Math.min(58, 600 / m.k - 6);
      m.box.forEach((cnt, i) => {
        const x = 20 + i * (bw + 6), hot = m.dealt === m.n && cnt === m.max && m.max > m.min;
        s += '<rect data-box="' + i + '" x="' + x + '" y="110" width="' + bw + '" height="200" rx="6" fill="' + (hot ? '#fde9d2' : '#f6f8fc') + '" stroke="' + (hot ? '#c0392b' : 'var(--ink)') + '" stroke-width="' + (hot ? 2.2 : 1.4) + '"/>';
        for (let j = 0; j < cnt; j++) s += chip(x + 12 + (j % 3) * 17, 296 - Math.floor(j / 3) * 17, '#f5c26b');
        s += K.text(x + bw / 2, 328, String(cnt), { size: 13, weight: 700, fill: hot ? '#c0392b' : 'var(--ink)' });
      });
      if (m.dealt === m.n) s += '<g data-eq="1">' + K.text(20, 354, m.n + ' ÷ ' + m.k + ' = ' + m.q + (m.r ? ' …… ' + m.r + '：多出来的 ' + m.r + ' ' + u + '又放进了 ' + m.r + ' 个盒子，最多的盒子有 ' + m.max + ' ' + u : '：每个盒子正好 ' + m.q + ' ' + u), { size: 14, weight: 700, anchor: 'start', fill: m.r ? '#c0392b' : 'var(--good)' }) + '</g>';
      if (m.graph) s += drawGraph1(m, p);
    }
    return s;
  }
  function grips(c) {
    const m = model(c.props); if (m.mode !== 0 || m.hidden) return [];
    const sx = (g) => SX + (g - 1) * (SX1 - SX) / (GMAX - 1);
    return [{ id: 'g', x: sx(m.g), y: SY, r: 10, shape: 'bar-v', cursor: 'ew-resize', tip: '拖我：每份几个',
      drag: (c0, q) => ({ g: clamp(Math.round((q.x - SX) / ((SX1 - SX) / (GMAX - 1))) + 1, 1, Math.min(GMAX, model(c0.props).n)), guess: -1, gq: -1, peek: false }),
      say: (c1) => { const m1 = model(c1.props); return m1.n + ' ÷ ' + m1.g + ' = ' + m1.q + (m1.r ? ' …… ' + m1.r : ''); } }];
  }
  const I = (lo, hi, d, label, o) => Object.assign({ type: 'int', label, default: d, min: lo, max: hi, write: true }, o || {});
  U.registerPack({
    id: 'groupbench', version: 1,
    types: {
      groupbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E2', 'E7'],
        label: '分一分（带余除法）', prefix: '分一分', group: '数与运算', grades: [2, 6],
        alias: ['除法', '有余数的除法', '带余除法', '平均分', '包含除', '抽屉原理', '鸽巢原理', '余数'],
        props: {
          mode: { type: 'choice', label: '怎么分', default: 0, choices: ['每份几个', '平均分给几份'], write: true },
          n: I(1, NMAX, 17, '一共几个'), g: I(1, GMAX, 5, '每份几个'), k: I(1, BMAX, 3, '分给几份（盒子）'), dealt: I(0, NMAX, 0, '已经放了几个（自动）', { hidden: true }),
          unit: { type: 'text', label: '东西的单位', default: '个', write: true }, gname: { type: 'text', label: '一份叫什么', default: '', write: true },
          graph: { type: 'bool', label: '记下来：每份几个是总数 → 商、余数的图；平均分是总数 → 最多的盒子的图', default: false, write: true },
          rec: { type: 'text', label: '图上记了哪些（总数,每份几个;…）', default: '', write: true, hidden: true },
          rec1: { type: 'text', label: '平均分：图上记了哪些（总数,盒子数;…）', default: '', write: true, hidden: true },
          guess: I(-1, 99, -1, '图上猜的余数（-1 没猜）', { hidden: true }), gq: I(-1, 99, -1, '每份几个：图上猜的商（-1 没猜）', { hidden: true }), peek: { type: 'bool', label: '不猜，直接看', default: false, write: true, hidden: true },
          gok: I(0, 99, 0, '猜对几次（自动）', { hidden: true }), gtry: I(0, 99, 0, '猜了几次（自动）', { hidden: true }),
          all: { type: 'bool', label: '图上全部试一遍', default: false, write: true },
          ask: { type: 'text', label: '追问（题干|选项|*对的选项~…）', default: '', write: true }, pick: { type: 'text', label: '追问选了第几个', default: '', write: true },
        },
        outputs: {
          q: { dim: null, kind: 'num', label: '商' }, r: { dim: null, kind: 'num', label: '余数' }, exact: { dim: null, kind: 'num', label: '正好分完：1 是，0 否' },
          g: { dim: null, kind: 'num', label: '每份几个（每份几个的分法）' }, max: { dim: null, kind: 'num', label: '最多的盒子有几个（放完了才有）' },
          pts: { dim: null, kind: 'num', label: '图上有几个总数（这个每份几个、这么多盒子的）' }, gok: { dim: null, kind: 'num', label: '先猜再看，猜对几次' }, gtry: { dim: null, kind: 'num', label: '先猜再看，猜了几次' }, all: { dim: null, kind: 'num', label: '全部试一遍了：1 是，0 否' },
          q1: { dim: null, kind: 'num', label: '追问 1 选了第几个' }, q2: { dim: null, kind: 'num', label: '追问 2 选了第几个' },
        },
        icon: () => '<rect x="8" y="14" width="34" height="14" rx="7" fill="none" stroke="var(--blue)" stroke-width="1.5"/>' + K.circle(15, 21, 4, { fill: '#f5c26b', stroke: 'var(--ink)', w: 1 }) + K.circle(25, 21, 4, { fill: '#f5c26b', stroke: 'var(--ink)', w: 1 }) + K.circle(35, 21, 4, { fill: '#f5c26b', stroke: 'var(--ink)', w: 1 }) + K.circle(50, 21, 4, { fill: '#f7a8a8', stroke: 'var(--ink)', w: 1 }),
        size: (e) => { const m = model((e && e.props) || {}); return [W, m.graph ? gLay(m).end + 30 : 412]; },
        grips,
        compute: (c) => { const m = model(c.props), o = { q: num(m.q), r: num(m.r), exact: num(m.r === 0 ? 1 : 0) }; if (m.mode === 0) { o.g = num(m.g); o.pts = num(m.pts.length); o.gok = num(m.gok); o.gtry = num(m.gtry); o.all = num(m.all ? 1 : 0); m.asks.forEach((a, i) => { if (a.pick) o['q' + (i + 1)] = num(a.pick); }); } else { if (m.dealt === m.n) o.max = num(m.max); if (m.graph) { o.pts = num(m.pts.length); o.gok = num(m.gok); o.gtry = num(m.gtry); o.all = num(m.all ? 1 : 0); m.asks.forEach((a, i) => { if (a.pick) o['q' + (i + 1)] = num(a.pick); }); } } return o; },
        badge: () => '',
        draw,
      },
    },
  });
  U.GroupBench = { model };
})(typeof globalThis !== 'undefined' ? globalThis : window);
