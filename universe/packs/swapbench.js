/* 器材包 swapbench：换一换（鸡兔同笼的假设法）。docs/instrument-design.md 第 10 节之后加的操作台。
 * 一共 n 个（头），每个要么是甲（鸡，每个 la 条腿），要么是乙（兔，每个 lb 条腿），总数要凑到 T。
 * 全部在图上直接动手：
 *   - 点一个甲，它变成乙（多 lb − la）；点一个乙，它变回甲。
 *   - 乙排在前面，甲排在后面，中间有一个把手：拖它，一次换好几个。
 *   - 上面一直写着现在的总数、离目标差多少、每换一个变多少；超过目标会标红。
 *   - 上面有一架天平：左盘是“现在的总数”，右盘是“目标”。不够就往右歪，多了就往左歪，换一个就正一点，正好就平了。
 *   - 天平下面把“还差的”切成一段一段，每段就是“换一个补上的数”：差 10、每换一只补 2，就是 5 段。段数自己数，这就是假设法的那一步除法。
 *   - “每个都少算”按钮：每只都少算 2 条腿（天平两边同时减去 8 × 2）。鸡剩 0 条、兔剩 2 条，天平歪的样子不变——差的全是兔多出来的腿。
 *   - 拖把手的时候，被换掉的每一个头上写着 +2，一眼看出这一下一共变了多少。
 *   - “写成两架天平”：同一道题换一种写法。上面一架是个数（x + y = 8），下面一架是总数（2x + 4y = 26），圆盒 x 是甲的个数、方盒 y 是乙的个数。
 *     这时卡片上就是“两架天平”操作台（同一套画法和拖法），解出来以后点“回到换一换”，乙的个数带回来。数太大（每盘超过 30 个砝码或 6 个盒子）摆不下，按钮是灰的。
 *   - 右边的表记下试过的每一种：乙几个、甲几个、总数多少。表里相邻两行总是差同一个数——这就是假设法的依据。
 * 同一个台面可以换皮：大船小船、2 分球 3 分球、5 元 10 元、三轮车自行车。出题人改名字和每个的数就行。
 *   研究本（book）：凑对了、或者正确地说出“凑不出来”，自动记一条（换了一组也不丢）。
 *   换情况（adj，逗号隔开）：set 换一组（sets 里的几组“头数,甲,乙,总数|…”，si 第几组）、T 目标多 1 / 少 1。有 adj 就有“从头再来”和“凑不出来”两个按钮。
 *   from：从头再来时回到全是甲（0）还是全是乙（1）。题目可带追问（ask / pick）。
 *   甲的数可以是负数（答错倒扣分）；这时没有“每个都少算”，也不能写成两架天平。
 *   记下来（graph = 1，docs/knob-graph-and-gallery.md 第一节）：研究本里个数和每个的数都一样的那几条，画成一张图：横着是总数，竖着是乙的个数；
 *     凑出来的是实心点，说对“凑不出来”的画在下面一排的 ✕。不另外记数据：孩子做出一条，图上才多一个点。
 *     图上有 3 个点以后，换到一个新目标时可以先猜：点竖线上的一格（或“凑不出来”那一格），再去换；凑到了或说对凑不出来，就算猜没猜对。
 *     有 5 个点以后可以“全部试一遍”：每个总数都画上（浅色），看出是一条隔一个缺一个的直线。
 * 这一版的边界（如实写）：最多 40 个；两种东西。图只有“总数 → 乙的个数”这一种（头数不变）。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit, RS = K.research;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 640, GX = 24, GY = 186, PX = 205, PYV = 78, AR = 118, CW = 38, CH = 46, COLS = 10, NMAX = 40;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  function model(p) {
    const n = clamp(p.n, 1, NMAX), la = clamp(p.la, -99, 99), lb = clamp(p.lb, -99, 99), k = clamp(p.k, 0, n), T = p.target;
    const total = k * lb + (n - k) * la, tried = String(p.tried || '').split(',').filter((s) => s !== '').map(Number).filter((x) => Number.isInteger(x) && x >= 0 && x <= n);
    const lo = Math.min(la, lb), base = p.lift ? n * lo : 0;   // “每个都少算”：两边同时减去 n × 较小的那个数
    // 真正的答案：(总数 − 头数 × 甲) ÷ (乙 − 甲)，要是整数、在 0 到头数之间；不然凑不出来（ans 是 null）
    const q = lb !== la ? (T - n * la) / (lb - la) : NaN, ans = Number.isInteger(q) && q >= 0 && q <= n ? q : null;
    const sets = String(p.sets || '').split('|').map((s) => s.split(',').map(Number)).filter((a) => a.length === 4 && a.every(Number.isInteger) && a[0] >= 1 && a[0] <= NMAX && a[1] !== a[2]);
    const si = clamp(p.si, 0, Math.max(0, sets.length - 1)), af = String(p.adj || '').split(',').filter(Boolean);
    const book = String(p.book || '').split(';').filter((e) => /^\d+,-?\d+,-?\d+,-?\d+:(\d+|x)$/.test(e)).filter((e, i, a) => a.indexOf(e) === i).slice(-30);
    const canAsk = book.length > 0, asks = RS.parseAsk(p.ask, p.pick, canAsk);
    return { n, la, lb, k, T, total, diff: T - total, step: lb - la, tried, ok: total === T ? 1 : 0, lo, base, lift: !!p.lift && lo > 0, ans,
      key: n + ',' + la + ',' + lb + ',' + T, sets, si, adj: { any: af.length > 0, set: af.includes('set') && sets.length > 1, T: af.includes('T') }, from: p.from ? 1 : 0,
      claim: !!p.claim, book, canAsk, asks, graph: !!p.graph, guess: Number.isInteger(+p.guess) && +p.guess >= 0 ? +p.guess : -1, gok: clamp(+p.gok || 0, 0, 99), gtry: clamp(+p.gtry || 0, 0, 99), all: !!p.all,
      pts: ptsOf(book, n + ',' + la + ',' + lb + ',') };
  }
  // 研究本里同一个“个数、甲、乙”的几条：[{ T, k }]，k 是 null 就是凑不出来；同一个总数只留一个
  const HOLE = 99;
  function ptsOf(book, pre) {
    const o = {}; for (const e of book) if (e.startsWith(pre)) { const [h, r] = e.split(':'), T = +h.split(',')[3]; o[T] = r === 'x' ? null : +r; }
    return Object.keys(o).map(Number).sort((a, b) => a - b).map((T) => ({ T, k: o[T] }));
  }
  // 猜了的话，凑到（或说对凑不出来）时算一次：猜对没有
  const scored = (m, got) => (m.graph && m.guess >= 0 ? { gtry: m.gtry + 1, gok: m.gok + (m.guess === got ? 1 : 0), guess: -1 } : {});
  const addBook = (m, e) => m.book.concat(m.book.includes(e) ? [] : [e]).join(';');
  // 从头：全是甲或全是乙，试过的清空
  const fresh = (m, n) => ({ k: m.from ? n : 0, tried: '', claim: false, lift: false });
  // 换成 k 个乙，并把它记进“试过的”里
  function to(p, k) {
    const m = model(p), kk = clamp(k, 0, m.n); if (kk === m.k) return {};
    const tr = m.tried.length ? m.tried.slice() : [m.k]; if (tr[tr.length - 1] !== kk) tr.push(kk);
    const o = { k: kk, tried: tr.slice(-12).join(','), claim: false };
    if (kk * m.lb + (m.n - kk) * m.la === m.T) Object.assign(o, { book: addBook(m, m.key + ':' + kk) }, scored(m, kk));
    return o;
  }
  const cell = (i) => ({ x: GX + (i % COLS) * CW, y: GY + Math.floor(i / COLS) * CH });
  // 一个头：圆圈里写名字的第一个字，下面画腿（不超过 8 条就画线，多了就写数）
  function one(i, isB, m, p) {
    const c = cell(i), cx = c.x + CW / 2, cy = c.y + 14, legs = (isB ? m.lb : m.la) - (m.lift ? m.lo : 0), col = isB ? '#f5a25d' : '#9fb7d9', nm = String((isB ? p.nb : p.na) || '').slice(0, 1);
    let s = K.circle(cx, cy, 12, { fill: col, stroke: 'var(--ink)', w: 1.4 }) + K.text(cx, cy + 5, nm, { size: 12, weight: 700 });
    if (p.style === 0 && legs >= 0 && legs <= 8) for (let j = 0; j < legs; j++) { const lx = cx - (legs - 1) * 2.4 + j * 4.8; s += K.line(lx, cy + 12, lx, cy + 26, { w: 1.8 }); }
    else s += K.text(cx, cy + 27, String(legs).replace('-', '−'), { size: 12, weight: 700 });
    return '<g data-pick-set="' + encodeURIComponent(JSON.stringify(to(p, isB ? m.k - 1 : m.k + 1))) + '" style="cursor:pointer"><title>点一下：' + (isB ? '换回' + p.na : '换成' + p.nb) + '</title>' +
      '<rect x="' + c.x + '" y="' + c.y + '" width="' + CW + '" height="' + CH + '" fill="transparent"/>' + s + '</g>';
  }
  // ---- 写成两架天平：同一道题的方程组写法，画法和拖法都借“两架天平”操作台的 ----
  const SYS_TOP = 50;
  const sysOk = (m) => { const S = U.SystemBench; return !!S && m.la >= 1 && m.lb >= 1 && m.n <= S.CMAX && m.T <= S.CMAX && m.T >= 0 && m.la <= S.BMAX && m.lb <= S.BMAX; };
  const sysCtx = (c) => Object.assign({}, c, { drag: c.drag ? Object.assign({}, c.drag, { y: c.drag.y - SYS_TOP }) : null });
  function drawSys(c) {
    const p = c.props, m = model(p), S = U.SystemBench, sm = S.model(p), u = p.unit || '';
    const back = { view: 0, msg: '' }; if (sm.y !== null) Object.assign(back, to(p, sm.y));
    let s = K.text(16, 20, '圆盒 x：' + p.na + '的个数　方盒 y：' + p.nb + '的个数', { size: 13, weight: 700, anchor: 'start' });
    s += K.text(16, 40, '上面一架：一共 ' + m.n + ' 个。下面一架：一共 ' + m.T + ' ' + u + '（每个' + p.na + ' ' + m.la + '、每个' + p.nb + ' ' + m.lb + '）。把上面的拖到下面，就是“假设全是' + p.na + '”。', { size: 12, anchor: 'start' });
    s += '<g data-pick-set="' + encodeURIComponent(JSON.stringify(back)) + '" style="cursor:pointer"><title>回到一个一个换的样子' + (sm.y !== null ? '，并把' + K.esc(p.nb) + '换成 ' + sm.y + ' 个' : '') + '</title>' +
      K.rect(S.W - 176, 2, 160, 24, { fill: '#fff', stroke: 'var(--blue)', r: 8, w: 1.5 }) + K.text(S.W - 96, 18, sm.y !== null ? '回到换一换：' + p.nb + ' ' + sm.y + ' 个' : '回到换一换', { size: 12, weight: 700 }) + '</g>';
    return s + '<g data-sys="1" transform="translate(0,' + SYS_TOP + ')">' + S.draw(sysCtx(c)) + '</g>';
  }
  const bookSay = (e, p) => { const [h, r] = e.split(':'), [n, la, lb, T] = h.split(','); return n + ' 个（' + p.na + ' ' + la + '、' + p.nb + ' ' + lb + '）一共 ' + T + '：' + (r === 'x' ? '凑不出来' : p.nb + ' ' + r + ' 个'); };
  const items = (m, p) => m.book.map((e) => ({ say: bookSay(e, p).replace(/-/g, '−'), no: e.endsWith(':x') }));
  const lay = (m, p) => {
    const by = GY + Math.ceil(m.n / COLS) * CH + 18, yc = by + 48, yf = yc + (m.adj.any ? 34 : 0), yg = yf + (m.adj.any && m.claim ? 24 : 0) + (m.adj.any ? 14 : 0), yb = yg + (m.graph ? GH : 0);
    const ya = yb + RS.bookH(items(m, p)); return { by, yc, yf, yg, yb, ya, end: ya + RS.asksH(m.asks) };
  };
  // ---- 记下来：研究本画成图 ----
  const GH = 214;
  function drawGraph(m, p, y0, masked) {
    const u = p.unit || '', lo = m.n * Math.min(m.la, m.lb), hi = m.n * Math.max(m.la, m.lb);
    const xa = Math.min(lo, m.T, ...m.pts.map((q) => q.T)), xb = Math.max(hi, m.T, ...m.pts.map((q) => q.T)), span = Math.max(1, xb - xa);
    const X0 = GX + 44, X1 = GX + 572, Y0 = y0 + 42, Y1 = y0 + 160, YH = y0 + 186, xs = (X1 - X0) / span, ys = (Y1 - Y0) / m.n;
    const X = (T) => X0 + (T - xa) * xs, Y = (k) => Y1 - k * ys;
    let s = K.rect(GX - 6, y0, 600, GH - 12, { fill: '#fbfcfe', stroke: '#c9d3e3', r: 8, w: 1 });
    s += K.text(GX + 4, y0 + 18, '📈 记下来：横着是一共多少' + u + '，竖着是' + p.nb + '几个（研究本里的每一条就是一个点）', { size: 12, weight: 700, anchor: 'start' });
    // 格子和刻度
    const tk = span <= 24 ? 1 : span <= 48 ? 2 : span <= 120 ? 5 : 10, kt = m.n <= 12 ? 1 : m.n <= 24 ? 2 : 5;
    for (let T = Math.ceil(xa / tk) * tk; T <= xb; T += tk) s += K.line(X(T), Y0, X(T), Y1, { w: 0.6, stroke: '#e1e6ef' }) + K.text(X(T), Y1 + 13, String(T).replace('-', '−'), { size: 9, fill: '#5f6773' });
    for (let k = 0; k <= m.n; k += kt) s += K.line(X0, Y(k), X1, Y(k), { w: 0.6, stroke: '#e1e6ef' }) + K.text(X0 - 8, Y(k) + 3, String(k), { size: 9, anchor: 'end', fill: '#5f6773' });
    s += K.line(X0, Y1, X1, Y1, { w: 1.2 }) + K.line(X0, Y0, X0, Y1, { w: 1.2 });
    s += K.text(X0 - 8, YH + 4, '凑不出', { size: 9, anchor: 'end', fill: '#c0392b' }) + K.line(X0, YH, X1, YH, { w: 0.6, stroke: '#f0c9c2' });
    // 全部试一遍：每个总数都画上，浅色
    if (m.all) for (let T = xa; T <= xb; T++) { const q = (T - m.n * m.la) / (m.lb - m.la), ok = Number.isInteger(q) && q >= 0 && q <= m.n; s += ok ? K.circle(X(T), Y(q), 3, { fill: '#c9d3e3', stroke: 'none' }) : K.text(X(T), YH + 4, '×', { size: 10, fill: '#e6b4ab' }); }
    // 孩子做出来的点
    for (const q of m.pts) s += q.k === null ? K.text(X(q.T), YH + 5, '✕', { size: 13, weight: 700, fill: '#c0392b' }) : K.circle(X(q.T), Y(q.k), 5, { fill: '#f5a25d', stroke: 'var(--ink)', w: 1.2 });
    // 现在的目标：一条竖线；有 3 个点、这个总数还没做过，就可以先猜
    const done = m.pts.some((q) => q.T === m.T), canGuess = m.pts.length >= 3 && !done && !m.ok && !masked;
    if (m.T >= xa && m.T <= xb) s += K.line(X(m.T), Y0 - 4, X(m.T), YH + 6, { w: 1.4, stroke: 'var(--blue)', dash: '4 3' });
    let say = m.pts.length < 3 ? '再做 ' + (3 - m.pts.length) + ' 个，就可以先猜再换（改目标，凑到了或说对凑不出来，图上就多一个点）' : done ? '这个总数图上已经有了：改一下目标' : m.guess >= 0 ? '你猜' + (m.guess === HOLE ? '凑不出来' : p.nb + ' ' + m.guess + ' 个') + '。去换换看！' : canGuess ? '先猜：一共 ' + m.T + ' 时，' + p.nb + '几个？点蓝线上的一格' : '';
    if (canGuess) {
      for (let k = 0; k <= m.n; k++) s += '<g data-pick-set="' + encodeURIComponent(JSON.stringify({ guess: k })) + '" style="cursor:pointer"><title>猜' + K.esc(p.nb) + ' ' + k + ' 个</title><rect x="' + (X(m.T) - 9) + '" y="' + (Y(k) - ys / 2) + '" width="18" height="' + ys + '" fill="transparent"/></g>';
      s += '<g data-pick-set="' + encodeURIComponent(JSON.stringify({ guess: HOLE })) + '" style="cursor:pointer"><title>猜凑不出来</title><rect x="' + (X(m.T) - 9) + '" y="' + (YH - 9) + '" width="18" height="18" fill="transparent"/></g>';
    }
    if (m.guess >= 0 && !done) s += m.guess === HOLE ? K.circle(X(m.T), YH, 7, { fill: 'none', stroke: 'var(--blue)', w: 1.6, dash: '3 2' }) : K.circle(X(m.T), Y(m.guess), 6, { fill: 'none', stroke: 'var(--blue)', w: 1.8, dash: '3 2' });
    if (m.gtry) say += (say ? '　' : '') + '猜了 ' + m.gtry + ' 次，猜对 ' + m.gok + ' 次';
    s += K.text(GX + 4, y0 + 34, say, { size: 11, anchor: 'start', fill: 'var(--blue)', weight: 700 });
    s += RS.btn(GX + 470, y0 + 4, 116, '全部试一遍', { all: !m.all }, m.pts.length >= 5 || m.all, m.pts.length >= 5 ? (m.all ? '收起全部' : '每个总数都画上') : '图上有 5 个点以后才能全部试一遍', m.all);
    return s;
  }
  function draw(c) {
    if (c.props.view === 1 && U.SystemBench) return drawSys(c);
    const p = c.props, m = model(p), u = p.unit || ''; let s = '';
    const over = m.step > 0 ? m.total > m.T : m.total < m.T;
    s += K.text(GX, 26, m.n + ' 个，' + p.nb + ' ' + m.k + ' 个、' + p.na + ' ' + (m.n - m.k) + ' 个', { size: 15, weight: 700, anchor: 'start' });
    s += K.text(GX, 50, (c.masked ? '一共 ？' : '一共 ' + m.total + ' ' + u) + '　目标 ' + m.T + ' ' + u + (m.ok ? '　正好！' : c.masked ? '' : over ? '　多了 ' + Math.abs(m.diff) : '　还差 ' + Math.abs(m.diff)), { size: 15, weight: 700, anchor: 'start', fill: m.ok ? 'var(--good)' : over && !c.masked ? 'var(--bad)' : 'var(--ink)' });
    // 天平：左盘是现在的总数，右盘是目标。差得越多歪得越厉害；正好就平了
    const Lw = m.total - m.base, Rw = m.T - m.base, d = c.masked ? 0 : Lw - Rw, ang = (d / (Math.abs(d) + Math.max(4, Math.abs(Rw) * 0.2))) * 9 * Math.PI / 180;
    const dx = Math.cos(ang) * AR, dy = Math.sin(ang) * AR, ends = [{ x: PX - dx, y: PYV + dy }, { x: PX + dx, y: PYV - dy }];
    s += K.line(PX, PYV, PX, PYV + 50, { w: 4 }) + K.line(PX - 30, PYV + 52, PX + 30, PYV + 52, { w: 5 }) + K.line(ends[0].x, ends[0].y, ends[1].x, ends[1].y, { w: 5, stroke: m.ok && !c.masked ? 'var(--good)' : 'var(--ink)' }) + K.circle(PX, PYV, 5, { fill: 'var(--ink)' });
    ends.forEach((e, a) => {
      const tx = a === 0 ? '现在 ' + (c.masked ? '？' : Lw) : '目标 ' + Rw;
      s += K.line(e.x, e.y, e.x, e.y + 12, { w: 1.2 }) + K.rect(e.x - 50, e.y + 12, 100, 24, { fill: a === 0 ? '#fde9d2' : '#e3ecf8', stroke: 'var(--ink)', r: 6, w: 1.4 }) + K.text(e.x, e.y + 29, tx, { size: 13, weight: 700 });
    });
    if (m.lift) s += K.text(PX, PYV + 68, '两边同时减去 ' + m.n + ' × ' + m.lo + ' = ' + m.base + '：歪的样子不变', { size: 11, fill: 'var(--blue)', weight: 700 });
    // 还差的，切成一段一段：每段是“换一个”补上的数
    const gy = GY - 30;
    if (!c.masked && m.step !== 0) {
      const ad = Math.abs(m.diff), st = Math.abs(m.step), q = Math.floor(ad / st), r = ad % st, cnt = q + (r ? 1 : 0), x0 = GX + 62;
      if (m.ok) s += K.text(GX, gy + 13, '两边一样重：正好', { size: 12, weight: 700, anchor: 'start', fill: 'var(--good)' });
      else {
        const sw = Math.min(30, (COLS * CW - 62) / Math.max(cnt, 1)), col = over ? 'var(--bad)' : 'var(--blue)';
        s += K.text(GX, gy + 13, (over ? '多了 ' : '还差 ') + ad, { size: 12, weight: 700, anchor: 'start', fill: over ? 'var(--bad)' : 'var(--ink)' });
        let g = '';
        for (let i = 0; i < q; i++) g += K.rect(x0 + i * sw + 1, gy, sw - 2, 18, { fill: over ? '#fbe3e3' : '#e3ecf8', stroke: col, r: 3, w: 1.2 }) + (sw >= 20 ? K.text(x0 + i * sw + sw / 2, gy + 13, String(st), { size: 10, weight: 700 }) : '');
        if (r) g += K.rect(x0 + q * sw + 1, gy, Math.max(8, (sw - 2) * r / st), 18, { fill: '#fbe3e3', stroke: 'var(--bad)', r: 3, w: 1.2 });
        s += '<g data-gap="' + q + '"><title>每一段是换一个' + (over ? '少掉' : '补上') + '的 ' + st + ' ' + K.esc(u) + (r ? '；最后剩下的 ' + r + ' 不够一段' : '') + '</title>' + g + '</g>';
      }
    }
    // 正在拖把手：被换掉的每一个头上写着变了多少
    const k0 = c.drag ? clamp(c.drag.p0.k, 0, m.n) : m.k, chg = m.k - k0;
    for (let i = 0; i < m.n; i++) s += one(i, i < m.k, m, p);
    for (let i = Math.min(k0, m.k); i < Math.max(k0, m.k); i++) { const q = cell(i), v = chg > 0 ? m.step : -m.step; s += '<g data-chg="1">' + K.rect(q.x + 5, q.y - 9, CW - 10, 13, { fill: '#fff', stroke: 'var(--blue)', r: 4, w: 1 }) + K.text(q.x + CW / 2, q.y + 1, (v >= 0 ? '+' : '−') + Math.abs(v), { size: 10, weight: 700, fill: 'var(--blue)' }) + '</g>'; }
    const rows = Math.ceil(m.n / COLS), by = GY + rows * CH + 18;
    if (chg) s += K.text(GX, by, '这一下换了 ' + Math.abs(chg) + ' 个：总数' + (chg * m.step >= 0 ? '多 ' : '少 ') + Math.abs(chg * m.step) + ' ' + u + '（' + Math.abs(chg) + ' × ' + Math.abs(m.step) + '）', { size: 12, anchor: 'start', weight: 700, fill: 'var(--blue)' });
    else s += K.text(GX, by, '把一个' + p.na + '换成' + p.nb + '：' + (m.step >= 0 ? '多 ' : '少 ') + Math.abs(m.step) + ' ' + u + '。点一个就换一个；拖中间的把手，一次换好几个。', { size: 12, anchor: 'start' });
    // 每个都少算：天平两边同时减去同样多（甲是负数或 0 时没有）
    if (m.lo > 0) s += '<g data-pick-set="' + encodeURIComponent(JSON.stringify({ lift: !m.lift })) + '" style="cursor:pointer"><title>' + (m.lift ? '把少算的加回来：两边同时加上 ' + m.n * m.lo : '每个都少算 ' + m.lo + ' ' + K.esc(u) + '：天平两边同时减去 ' + m.n + ' × ' + m.lo) + '</title>' +
      K.rect(GX, by + 10, 250, 26, { fill: m.lift ? 'var(--blue)' : '#fff', stroke: 'var(--blue)', r: 8, w: 1.5 }) + K.text(GX + 125, by + 27, m.lift ? '把少算的加回来（两边同时加）' : '每个都少算 ' + m.lo + '（两边同时减 ' + m.n * m.lo + '）', { size: 12, weight: 700, fill: m.lift ? '#fff' : 'var(--ink)' }) + '</g>';
    // 写成两架天平：同一道题的方程组写法
    const sx = m.lo > 0 ? GX + 262 : GX, can = sysOk(m), go = { view: 1, e0: '1,1,0,0,0,' + m.n, e1: m.la + ',' + m.lb + ',0,0,0,' + m.T, steps: 0, refused: 0, msg: '' };
    s += '<g' + (can ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(go)) + '" style="cursor:pointer"' : ' opacity="0.4"') + '><title>' + (can ? '同一道题写成两个式子：个数一架，总数一架' : '数太大，天平上摆不下（每个盘最多 30 个砝码、6 个盒子）') + '</title>' +
      K.rect(sx, by + 10, 140, 26, { fill: '#fff', stroke: can ? 'var(--blue)' : '#8a94a8', r: 8, w: 1.5 }) + K.text(sx + 70, by + 27, '写成两架天平', { size: 12, weight: 700 }) + '</g>';
    // 换情况、从头再来、凑不出来
    const L = lay(m, p), sg = (v) => (v < 0 ? '−' + -v : String(v));
    if (m.adj.any) {
      let x = GX;
      if (m.adj.set) { const nx = (m.si + 1) % m.sets.length, a = m.sets[nx]; s += RS.btn(x, L.yc, 170, '换一组（第 ' + (m.si + 1) + ' / ' + m.sets.length + ' 组）', Object.assign({ si: nx, n: a[0], la: a[1], lb: a[2], target: a[3] }, fresh(m, a[0])), true, '换一组'); x += 180; }
      if (m.adj.T) {
        s += K.text(x, L.yc + 17, '目标', { size: 12, weight: 700, anchor: 'start' }) + RS.btn(x + 34, L.yc, 26, '−', Object.assign({ target: m.T - 1 }, fresh(m, m.n), { guess: -1 }), true, '目标少 1') + K.text(x + 84, L.yc + 17, sg(m.T), { size: 14, weight: 700 }) + RS.btn(x + 108, L.yc, 26, '+', Object.assign({ target: m.T + 1 }, fresh(m, m.n), { guess: -1 }), true, '目标多 1');
        x += 146;
      }
      s += RS.btn(x, L.yc, 90, '从头再来', fresh(m, m.n), m.tried.length > 0 || m.claim || m.k !== (m.from ? m.n : 0), m.from ? '从头再来：全部换回' + p.nb : '从头再来：全部换回' + p.na); x += 100;
      const cl = { claim: true }; if (m.ans === null) Object.assign(cl, { book: addBook(m, m.key + ':x') }, scored(m, HOLE));
      s += RS.btn(x, L.yc, 120, '凑不出来', cl, !m.ok, '怎么换都凑不出 ' + sg(m.T), m.claim);
      if (m.claim) s += K.text(GX, L.yf + 16, m.ans === null ? '对：怎么换都凑不出 ' + sg(m.T) + '。记进研究本了。' : '其实凑得出来，再换换看。', { size: 13, weight: 700, anchor: 'start', fill: m.ans === null ? '#2f7d3a' : 'var(--bad)' });
    }
    if (m.graph) s += drawGraph(m, p, L.yg, c.masked);
    s += RS.drawBook(L.yb, items(m, p), '研究本（凑对了、或说对凑不出来，就记一条）');
    s += RS.drawAsks(L.ya, m.asks, m.canAsk);
    // 试过的
    const tx = GX + COLS * CW + 26;
    s += K.text(tx, 26, p.nb, { size: 12, weight: 700, anchor: 'start' }) + K.text(tx + 50, 26, p.na, { size: 12, weight: 700, anchor: 'start' }) + K.text(tx + 100, 26, '一共', { size: 12, weight: 700, anchor: 'start' });
    const tr = m.tried.length ? m.tried : [m.k];
    tr.slice(-9).forEach((k, i) => {
      const tot = k * m.lb + (m.n - k) * m.la, hit = tot === m.T, y = 46 + i * 20;
      s += K.text(tx, y, String(k), { size: 13, anchor: 'start' }) + K.text(tx + 50, y, String(m.n - k), { size: 13, anchor: 'start' }) + K.text(tx + 100, y, c.masked ? '？' : String(tot), { size: 13, anchor: 'start', weight: hit ? 700 : 400, fill: hit ? 'var(--good)' : 'var(--ink)' });
    });
    return s;
  }
  function grips(c) {
    if (c.props.view === 1 && U.SystemBench) return U.SystemBench.grips(c).map((g) => Object.assign({}, g, { y: g.y + SYS_TOP, drag: (c0, q) => g.drag(c0, { x: q.x, y: q.y - SYS_TOP }) }));
    const m = model(c.props), at = cell(Math.min(m.k, m.n - 1)), x = m.k >= m.n ? at.x + CW : at.x, edge = m.k > 0 && m.k % COLS === 0 && m.k < m.n;
    const gx = edge ? cell(m.k - 1).x + CW : x, gy = (edge ? cell(m.k - 1).y : at.y) + CH / 2 - 2;
    return [{ id: 'k', x: gx, y: gy, shape: 'bar-v', cursor: 'ew-resize', tip: '拖我：把手左边的都是' + c.props.nb + '，右边的都是' + c.props.na,
      drag: (c0, q) => {
        const m0 = model(c0.props), row = clamp(Math.floor((q.y - GY) / CH), 0, Math.ceil(m0.n / COLS) - 1), col = clamp(Math.round((q.x - GX) / CW), 0, COLS);
        return to(c0.props, clamp(row * COLS + col, 0, m0.n));
      },
      say: (c1) => { const m1 = model(c1.props); return c1.props.nb + ' ' + m1.k + '，' + c1.props.na + ' ' + (m1.n - m1.k) + '：' + m1.total; } }];
  }
  const I = (lo, hi, d, label, o) => Object.assign({ type: 'int', label, default: d, min: lo, max: hi, write: true }, o || {});
  const T = (d, label, o) => Object.assign({ type: 'text', label, default: d, write: true }, o || {});
  U.registerPack({
    id: 'swapbench', version: 2,
    types: {
      swapbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E7', 'E4'],
        label: '换一换（鸡兔同笼）', prefix: '换一换', group: '关系', grades: [3, 7],
        alias: ['鸡兔同笼', '假设法', '列表法', '大船小船', '二元一次方程组', '替换'],
        props: {
          n: I(1, NMAX, 8, '一共几个'), k: I(0, NMAX, 0, '现在有几个是乙'), target: I(-9999, 9999, 26, '总数要凑到'),
          la: I(-99, 99, 2, '每个甲是几'), lb: I(-99, 99, 4, '每个乙是几'),
          na: T('鸡', '甲叫什么'), nb: T('兔', '乙叫什么'), unit: T('条腿', '数的是什么'),
          style: { type: 'choice', label: '画法', default: 0, choices: ['画腿', '写数'], write: true },
          view: { type: 'choice', label: '写法', default: 0, choices: ['换一换', '两架天平'], write: true, hidden: true },
          e0: T('1,1,0,0,0,8', '两架天平写法：上面一架（自动）', { hidden: true }), e1: T('2,4,0,0,0,26', '两架天平写法：下面一架（自动）', { hidden: true }),
          steps: I(0, 99, 0, '两架天平写法：做了几步（自动）', { hidden: true }), refused: I(0, 99, 0, '两架天平写法：被拦住几次（自动）', { hidden: true }), msg: T('', '两架天平写法：提示（自动）', { hidden: true }),
          lift: { type: 'bool', label: '每个都少算（两边同时减去“个数 × 较小的数”）', default: false, write: true },
          tried: T('', '试过的（自动记录）', { hidden: true }),
          sets: T('', '能换的几组（头数,甲,乙,总数|…）'), si: I(0, 9, 0, '第几组'), adj: T('', '台面上能换什么（set,T）'),
          from: { type: 'choice', label: '从头再来回到', default: 0, choices: ['全是甲', '全是乙'], write: true },
          claim: { type: 'bool', label: '说了“凑不出来”', default: false, write: true },
          graph: { type: 'bool', label: '记下来：研究本画成图（总数 → 乙的个数）', default: false, write: true },
          guess: I(-1, 99, -1, '图上猜的乙的个数（-1 没猜，99 猜凑不出来）', { hidden: true }), gok: I(0, 99, 0, '猜对几次（自动）', { hidden: true }), gtry: I(0, 99, 0, '猜了几次（自动）', { hidden: true }),
          all: { type: 'bool', label: '图上全部试一遍', default: false, write: true },
          book: T('', '研究本'), ask: T('', '追问（题干|选项|*对的选项~…）'), pick: T('', '追问选了第几个'),
        },
        outputs: {
          b: { dim: null, kind: 'num', label: '乙（兔）有几个' }, a: { dim: null, kind: 'num', label: '甲（鸡）有几个' },
          total: { dim: null, kind: 'num', label: '现在的总数' }, gap: { dim: null, kind: 'num', label: '离目标还差多少（多了是负数）' }, lifted: { dim: null, kind: 'num', label: '每个都少算了：1 是，0 否' },
          sys: { dim: null, kind: 'num', label: '写成两架天平了：1 是，0 否' }, sy: { dim: null, kind: 'num', label: '两架天平上解出来的乙的个数（解出来才有）' }, sx: { dim: null, kind: 'num', label: '两架天平上解出来的甲的个数（解出来才有）' }, ok: { dim: null, kind: 'num', label: '正好凑到：1 是，0 否' },
          tries: { dim: null, kind: 'num', label: '试了几种' },
          no: { dim: null, kind: 'num', label: '说对了凑不出来：1 是，0 否' }, si: { dim: null, kind: 'num', label: '第几组' },
          cases: { dim: null, kind: 'num', label: '研究本里有几条' }, pts: { dim: null, kind: 'num', label: '图上有几个点（这一组头数、甲、乙的）' }, gok: { dim: null, kind: 'num', label: '先猜再换，猜对几次' }, gtry: { dim: null, kind: 'num', label: '先猜再换，猜了几次' }, all: { dim: null, kind: 'num', label: '全部试一遍了：1 是，0 否' }, q1: { dim: null, kind: 'num', label: '追问 1 选了第几个' }, q2: { dim: null, kind: 'num', label: '追问 2 选了第几个' },
        },
        icon: () => K.circle(20, 16, 9, { fill: '#9fb7d9', stroke: 'var(--ink)' }) + K.line(17, 25, 17, 36, {}) + K.line(23, 25, 23, 36, {}) + K.circle(44, 16, 9, { fill: '#f5a25d', stroke: 'var(--ink)' }) + K.line(38, 25, 38, 36, {}) + K.line(42, 25, 42, 36, {}) + K.line(46, 25, 46, 36, {}) + K.line(50, 25, 50, 36, {}),
        size: (e) => (e && e.props && e.props.view === 1 && U.SystemBench ? [U.SystemBench.W, U.SystemBench.H + SYS_TOP] : [W, Math.max(296 + Math.ceil(clamp(((e && e.props && e.props.n) || 8), 1, NMAX) / COLS) * CH, (lay(model((e && e.props) || {}), (e && e.props) || {}).end + 50) || 0)]),
        grips,
        compute: (c) => { const m = model(c.props), o = { b: num(m.k), a: num(m.n - m.k), total: num(m.total), gap: num(m.diff), lifted: num(m.lift ? 1 : 0), ok: num(m.ok), tries: num(Math.max(1, m.tried.length)), no: num(m.claim && m.ans === null ? 1 : 0), si: num(m.si + 1), cases: num(m.book.length), pts: num(m.pts.length), gok: num(m.gok), gtry: num(m.gtry), all: num(m.all ? 1 : 0) }; m.asks.forEach((a, i) => { if (a.pick) o['q' + (i + 1)] = num(a.pick); }); o.sys = num(c.props.view === 1 ? 1 : 0); if (c.props.view === 1 && U.SystemBench) { const sm = U.SystemBench.model(c.props); if (sm.x !== null) o.sx = num(sm.x); if (sm.y !== null) o.sy = num(sm.y); } return o; },
        badge: () => '',
        draw,
      },
    },
  });
  U.SwapBench = { model, to };
})(typeof globalThis !== 'undefined' ? globalThis : window);
