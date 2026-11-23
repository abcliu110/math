/* 器材包 invbench：不变量放大镜。做一种操作很多次，用放大镜盯住一个量：它变不变？不变的量叫不变量，用它回答“最后会怎样”“能不能做到”。
 *   game 0 擦数写数：黑板上写着 1、2、…、n。点两个数，擦掉，写上它们的和（op 0）或者差（op 1，大减小）。一直做到只剩一个数。
 *     题目可以问更大的 1 到 N：在小的上找到不变量，再推到 N（ans：1 最后是单数，2 最后是双数）。
 *   game 1 翻杯子：n 个杯子都杯口朝下，每次正好翻 k 个（点 k 个杯子，再点“翻”）。能不能全部朝上（allup）？
 *     k 是双数、n 是单数时永远做不到：朝上的个数每次变 0、±2、±4……，单双不变（ans 2：不能）。
 *   game 2 变色龙：红、黄、蓝变色龙各有几只。两只不同颜色的相遇，都变成第三种颜色。能不能全变成同一种颜色（mono）？
 *     两种颜色只数的差，每次变 0 或 ±3：除以 3 的余数不变。三组差都不是 3 的倍数，就永远做不到。
 *   放大镜分两步选：看哪个量（lens），怎么看（view：它本身 / 它的单双 / 它除以 3 的余数）。按钮上不直接写答案，要孩子自己配。
 *     下面一排画出每一步放大镜里的值：一直一样、而且这个量真的是不变量（至少做了 2 步）时才算“找到了”（found）。
 *     碰巧几步没变、但其实会变的量，只说“到现在还没变，再多做几步”，不算找到。结论按钮要先找到不变量才点得动。
 *   研究本（book）：做成了的（擦完、全部朝上、变成同一种颜色）、用不变量证明了做不到的，都自动记下来，换了情况也不丢。
 *     孩子可以自己换情况（adj：擦数换 n，翻杯子换 n、k，变色龙换一组 starts），把研究本记满，再找规律。
 *   ask：题目给的追问（“1 到 10 剩几？”“什么时候不能？”），选项里带 * 的是对的；做过一点（找到不变量或研究本里有记录）才能答。
 *   hist 记下每一步的局面（用 | 隔开），sel 记下点选了哪几个；可以退一步、重来（重来不清研究本）。
 * 这一版的边界（如实写）：黑板最多 10 个数，杯子最多 11 个、每次翻 1–5 个，变色龙每种最多 60 只；只有这三种游戏。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit, RS = K.research;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 700;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? Math.round(+v) : lo));
  const LENS = [['个数', '和', '最大的数'], ['朝上的个数', '朝下的个数'], ['红的只数', '黄的只数', '蓝的只数', '红比黄多几', '黄比蓝多几']];
  const VIEWS = ['它本身', '它的单双', '它除以 3 的余数'], VSHORT = ['它本身', '它的单双', '除以 3 的余数'];
  const CN = ['红', '黄', '蓝'], CC = ['#e05a4f', '#f2c14e', '#4f86d9'];
  const lensName = (game, lens, view) => { const q = LENS[game][lens - 1]; return view === 1 ? q + '的单双' : view === 2 ? q + '除以 3 的余数' : q; };
  const par = (v) => (v % 2 ? '单' : '双');
  const mod3 = (v) => ((v % 3) + 3) % 3;
  const sgn = (v) => (v < 0 ? '−' + -v : String(v));
  function parseStarts(p) { const L = String(p.starts || '').split('|').map((s) => s.split(',').map((x) => clamp(x, 0, 60))).filter((a) => a.length === 3 && a[0] + a[1] + a[2] >= 2); return L.length ? L : [[4, 5, 6]]; }
  const start = (game, n, tri) => (game === 0 ? Array.from({ length: n }, (_, i) => i + 1).join(',') : game === 1 ? '0'.repeat(n) : tri.join(','));
  // 翻杯子：只看朝上的个数，宽度优先找全部朝上的最少步数，再还原出一串真实的局面（参考做法、判断能不能）
  function solveCups(n, k) {
    const prev = new Map([[0, null]]), q = [0];
    while (q.length) { const u = q.shift(); if (u === n) break; for (let j = Math.max(0, k - (n - u)); j <= Math.min(k, u); j++) { const v = u - j + (k - j); if (!prev.has(v)) { prev.set(v, [u, j]); q.push(v); } } }
    if (!prev.has(n)) return null;
    const path = []; for (let u = n; prev.get(u); u = prev.get(u)[0]) path.unshift(prev.get(u)[1]);
    let s = Array(n).fill(0); const out = [s.join('')];
    for (const j of path) { const ups = [], dns = []; s.forEach((c, i) => (c ? ups : dns).push(i)); ups.slice(0, j).concat(dns.slice(0, k - j)).forEach((i) => { s[i] = 1 - s[i]; }); out.push(s.join('')); }
    return out;
  }
  // 变色龙：宽度优先找变成同一种颜色的最少步数，返回一串局面；做不到返回 null
  const MEET = [[0, 1, 2], [0, 2, 1], [1, 2, 0]];
  function solveCham(tri) {
    const key = (s) => s.join(','), mono = (s) => s.filter((x) => x === 0).length >= 2;
    const prev = new Map([[key(tri), null]]), q = [tri];
    while (q.length) {
      const s = q.shift();
      if (mono(s)) { const out = []; for (let k = key(s); k; k = prev.get(k)) out.unshift(k); return out; }
      for (const [i, j, c] of MEET) if (s[i] && s[j]) { const t = s.slice(); t[i]--; t[j]--; t[c] += 2; const K2 = key(t); if (!prev.has(K2)) { prev.set(K2, key(s)); q.push(t); } }
    }
    return null;
  }
  function model(p) {
    const game = clamp(p.game, 0, 2), op = clamp(p.op, 0, 1), n = clamp(p.n, game === 1 ? 3 : 2, game === 1 ? 11 : 10), k = clamp(p.k, 1, Math.min(5, n)), N = clamp(p.N, n, 9999);
    const starts = parseStarts(p), si = clamp(p.si, 0, starts.length - 1), tri = starts[si];
    const ok = (s) => (game === 0 ? /^\d+(,\d+)*$/.test(s) : game === 1 ? new RegExp('^[01]{' + n + '}$').test(s) : /^\d+,\d+,\d+$/.test(s));
    const s0 = start(game, n, tri);
    let hist = String(p.hist || '').split('|').filter(ok); if (!hist.length || hist[0] !== s0) hist = [s0];
    const cur = hist[hist.length - 1], nums = game === 1 ? cur.split('').map(Number) : cur.split(',').map(Number);
    const sel = String(p.sel || '').split(',').filter((x) => x !== '').map(Number).filter((i, j, a) => i >= 0 && i < nums.length && a.indexOf(i) === j);
    const lens = clamp(p.lens, 0, LENS[game].length), view = clamp(p.view, 0, 2);
    const raw = (s) => {
      if (game === 0) { const a = s.split(',').map(Number); return lens === 1 ? a.length : lens === 2 ? a.reduce((x, y) => x + y, 0) : Math.max(...a); }
      if (game === 1) { const up = s.split('').filter((c) => c === '1').length; return lens === 1 ? up : n - up; }
      const [r, y, b] = s.split(',').map(Number); return [r, y, b, r - y, y - b][lens - 1];
    };
    const val = (s) => { const v = raw(s); return view === 1 ? par(Math.abs(v)) : view === 2 ? mod3(v) : sgn(v); };
    const vals = lens ? hist.map(val) : [];
    // 真的不变的量：写和时“和”怎么看都不变；写差时只有和的单双不变；每次翻双数个杯子，朝上、朝下个数的单双都不变；变色龙两种颜色的差除以 3 的余数不变
    const real = game === 0 ? (op === 0 ? lens === 2 : lens === 2 && view === 1) : game === 1 ? (k % 2 === 0 && view === 1) : (lens >= 4 && view === 2);
    const same = vals.length >= 3 && vals.every((v) => v === vals[0]);
    const found = same && real;
    const up = game === 1 ? nums.filter((c) => c === 1).length : 0;
    const mono = game === 2 && nums.filter((x) => x === 0).length >= 2;
    const right = game === 0 ? ((N * (N + 1) / 2) % 2 ? 1 : 2) : game === 1 ? (solveCups(n, k) ? 0 : 2) : (solveCham(tri) ? 0 : 2);
    const ans = found ? clamp(p.ans, 0, 2) : 0;
    // 研究本
    const book = String(p.book || '').split(';').filter((e) => /^(0:[01]:[\d,|]+|1:\d+:\d+:(ok|no)|2:\d+,\d+,\d+:(ok|no))$/.test(e)).filter((e, i, a) => a.indexOf(e) === i).slice(-40);
    const caseKey = game === 1 ? '1:' + n + ':' + k : game === 2 ? '2:' + tri.join(',') : '';
    const plays = book.filter((e) => e.startsWith('0:' + op + ':' + start(0, n) + '|')).length;
    const cases = {}; book.forEach((e) => { if (game && e[0] === String(game)) cases[e.slice(0, e.lastIndexOf(':'))] = e.slice(-2); });
    const nCase = Object.keys(cases).length, nCan = Object.values(cases).filter((v) => v === 'ok').length;
    const canAsk = found || book.length > 0, asks = RS.parseAsk(p.ask, p.pick, canAsk);
    return { game, op, n, k, N, starts, si, tri, hist, cur, nums, sel, lens, view, name: lens ? lensName(game, lens, view) : '', vals, real, same, found, ans, up, mono, right,
      steps: hist.length - 1, last: game === 0 && nums.length === 1 ? nums[0] : null, allup: game === 1 && up === n,
      book, caseKey, plays, nCase, nCan, nCannot: nCase - nCan, asks, canAsk, adj: !!p.adj };
  }
  const addBook = (m, e) => m.book.concat(m.book.includes(e) ? [] : [e]).join(';');
  const btn = (x, y, w, label, patch, enabled, tip, on) => '<g' + (enabled ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' data-off="1"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 26, { fill: on ? '#dcebfb' : enabled ? '#fff' : '#f1f3f6', stroke: enabled || on ? 'var(--blue)' : '#b8c0cc', r: 7, w: on ? 2.2 : 1.4 }) + K.text(x + w / 2, y + 17, label, { size: 12, weight: 700, fill: enabled || on ? 'var(--ink)' : '#5f6773' }) + '</g>';
  const pick = (patch, tip, inner) => '<g data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"><title>' + K.esc(tip) + '</title>' + inner + '</g>';
  const tw = RS.tw;
  // 研究本里的一条，写成孩子读得懂的话
  function bookSay(e) {
    const a = e.split(':');
    if (a[0] === '0') { const h = a[2].split('|'), n = h[0].split(',').length; return '1–' + n + ' 写' + (a[1] === '1' ? '差' : '和') + '：剩 ' + h[h.length - 1]; }
    if (a[0] === '1') return a[1] + ' 个翻 ' + a[2] + '：' + (a[3] === 'ok' ? '能' : '不能');
    return a[1].replace(/,/g, '、') + '：' + (a[2] === 'ok' ? '能' : '不能');
  }
  const items = (m) => m.book.map((e) => ({ say: bookSay(e), no: /:no$/.test(e) }));
  // 版面：上面的局面、放大镜两排、值和说明、结论、按钮行、研究本、追问。size 和 draw 用同一套
  function lay(m) {
    const L = { yl: 160, yv: 192, yt: 228, ya: 300, yb: 350 }; let y = L.yb + 40;
    L.ybook = y; y += RS.bookH(items(m));
    L.yask = y; y += RS.asksH(m.asks);
    L.end = y; return L;
  }
  function draw(c) {
    const m = model(c.props), L = lay(m); let s = '';
    const H = m.hist.join('|');
    const reset = { hist: '', sel: '', ans: 0 };
    if (m.game === 0) {
      s += K.text(20, 26, '黑板上写着 1 到 ' + m.n + '。每次擦掉两个数，写上它们的' + (m.op ? '差（大减小）' : '和') + '。', { size: 15, weight: 700, anchor: 'start' });
      if (m.N !== m.n) s += K.text(20, 48, '题目问的是 1 到 ' + m.N + '：先在小的上找不变的量，再推过去。', { size: 12, anchor: 'start', fill: '#5f6773' });
      m.nums.forEach((v, i) => {
        const x = 24 + i * 56, y = 62, on = m.sel.includes(i);
        let patch, tip;
        if (m.nums.length < 2) { s += K.rect(x, y, 48, 40, { fill: '#fff3d6', stroke: '#c9a24a', r: 8, w: 1.4 }) + K.text(x + 24, y + 26, String(v), { size: 16, weight: 700 }); return; }
        if (on) { patch = { sel: '' }; tip = '不选 ' + v; }
        else if (!m.sel.length) { patch = { sel: String(i) }; tip = '选第 ' + (i + 1) + ' 个数 ' + v; }
        else {
          const j = m.sel[0], a = m.nums[j], r = m.op ? Math.abs(a - v) : a + v, nx = m.nums.filter((_, t) => t !== i && t !== j); nx.splice(Math.min(i, j), 0, r);
          const h2 = H + '|' + nx.join(',');
          patch = { hist: h2, sel: '' }; if (nx.length === 1) patch.book = addBook(m, '0:' + m.op + ':' + h2);
          tip = '和第 ' + (i + 1) + ' 个数 ' + v + ' 一起擦掉';
        }
        s += pick(patch, tip, K.rect(x, y, 48, 40, { fill: on ? '#dcebfb' : '#fff3d6', stroke: on ? 'var(--blue)' : '#c9a24a', r: 8, w: on ? 2.4 : 1.4 }) + K.text(x + 24, y + 26, String(v), { size: 16, weight: 700 }));
      });
    } else if (m.game === 1) {
      s += K.text(20, 26, m.n + ' 个杯子都杯口朝下。每次正好翻 ' + m.k + ' 个。能全部翻成杯口朝上吗？', { size: 15, weight: 700, anchor: 'start' });
      m.nums.forEach((v, i) => {
        const x = 24 + i * 56, y = 58, on = m.sel.includes(i);
        const patch = on ? { sel: m.sel.filter((t) => t !== i).join(',') } : m.sel.length < m.k ? { sel: m.sel.concat(i).join(',') } : null;
        // 杯子：梯形，杯口那一边画粗线
        const pts = v ? [[x + 6, y + 6], [x + 42, y + 6], [x + 36, y + 44], [x + 12, y + 44]] : [[x + 12, y + 6], [x + 36, y + 6], [x + 42, y + 44], [x + 6, y + 44]];
        const shape = '<polygon points="' + pts.map((q) => q.join(',')).join(' ') + '" fill="' + (v ? '#e3f4e6' : '#eef1f6') + '" stroke="' + (on ? 'var(--blue)' : 'var(--ink)') + '" stroke-width="' + (on ? 2.6 : 1.2) + '"/>' + K.line(x + 6, v ? y + 6 : y + 44, x + 42, v ? y + 6 : y + 44, { stroke: '#4c9a5b', w: 3.2 }) + K.text(x + 24, y + 60, v ? '朝上' : '朝下', { size: 10, fill: '#5f6773' });
        s += patch ? pick(patch, (on ? '不选' : '选') + '第 ' + (i + 1) + ' 个杯子', shape) : shape;
      });
      const nx = m.nums.map((v, i) => (m.sel.includes(i) ? 1 - v : v)), patch = { hist: H + '|' + nx.join(''), sel: '' };
      if (nx.every((v) => v === 1)) patch.book = addBook(m, m.caseKey + ':ok');
      s += btn(24, 128, 130, '翻这 ' + m.k + ' 个', patch, m.sel.length === m.k, '把选好的杯子翻过来');
      s += K.text(166, 145, '选了 ' + m.sel.length + ' 个，要正好 ' + m.k + ' 个', { size: 12, anchor: 'start', fill: '#5f6773' });
    } else {
      s += K.text(20, 26, '变色龙：两只不同颜色的相遇，都变成第三种颜色。能全变成同一种颜色吗？', { size: 14, weight: 700, anchor: 'start' });
      m.nums.forEach((v, i) => {
        const y = 44 + i * 24;
        s += K.text(20, y + 13, CN[i] + ' ' + v, { size: 13, weight: 700, anchor: 'start', fill: i === 1 ? '#a87d12' : CC[i] });
        for (let t = 0; t < Math.min(v, 50); t++) s += K.circle(76 + t * 11, y + 9, 4.2, { fill: CC[i], stroke: 'var(--ink)', w: 0.5 });
        if (v > 50) s += K.text(76 + 50 * 11 + 4, y + 13, '…', { size: 12, anchor: 'start' });
      });
      MEET.forEach(([i, j, c2], t) => {
        const nx = m.nums.slice(); nx[i]--; nx[j]--; nx[c2] += 2;
        const patch = { hist: H + '|' + nx.join(','), sel: '' };
        if (nx.filter((x) => x === 0).length >= 2) patch.book = addBook(m, m.caseKey + ':ok');
        s += btn(24 + t * 176, 122, 168, CN[i] + CN[j] + '相遇 → 都变' + CN[c2], patch, m.nums[i] > 0 && m.nums[j] > 0 && !m.mono, CN[i] + '和' + CN[j] + '相遇');
      });
    }
    // 放大镜：两排，看哪个量 × 怎么看
    const Ls = LENS[m.game], lw = m.game === 2 ? 104 : 120;
    s += K.text(20, L.yl + 17, '🔍 盯住', { size: 13, weight: 700, anchor: 'start' });
    Ls.forEach((nm, i) => { s += btn(80 + i * (lw + 6), L.yl, lw, nm, { lens: i + 1 }, true, '放大镜看' + nm, m.lens === i + 1); });
    s += K.text(20, L.yv + 17, '怎么看', { size: 13, weight: 700, anchor: 'start' });
    VIEWS.forEach((nm, i) => { s += btn(80 + i * 126, L.yv, 120, VSHORT[i], { view: i }, true, '看' + nm, m.view === i); });
    const yt = L.yt;
    if (!m.lens) s += K.text(20, yt + 18, '做几步，用放大镜盯住一个量：它每一步变不变？', { size: 13, anchor: 'start', fill: '#5f6773' });
    else {
      const show = m.vals.length > 10 ? m.vals.slice(-10) : m.vals, off = m.vals.length - show.length;
      s += K.text(20, yt + 18, m.name.length > 7 ? m.name.slice(0, 7) + '…' : m.name, { size: 12, weight: 700, anchor: 'start' });
      show.forEach((v, i) => {
        const x = 120 + i * 56, chg = i + off > 0 && v !== m.vals[i + off - 1];
        if (i) s += K.text(x - 10, yt + 18, '→', { size: 12, fill: '#8a93a3' });
        s += K.rect(x, yt + 2, 36, 24, { fill: chg ? '#fde3dc' : '#eef6ff', stroke: chg ? '#c0392b' : '#6f9fd4', r: 5, w: 1 }) + K.text(x + 18, yt + 19, String(v), { size: 12, weight: 700, fill: chg ? '#c0392b' : 'var(--ink)' });
      });
      let msg, col = 'var(--ink)';
      if (m.vals.length < 3) msg = '再做 ' + (3 - m.vals.length) + ' 步看看它变不变。';
      else if (m.found) { msg = '不管怎么做，' + m.name + '都不变：这就是不变量。'; col = '#2f7d3a'; }
      else if (m.same) msg = '到现在还没变——它真的永远不变吗？换几种做法再看看。';
      else { msg = m.name + '变了：它不是不变量。换一个量，或者换一种看法。'; col = '#c0392b'; }
      s += K.text(20, yt + 46, msg, { size: 13, anchor: 'start', fill: col });
    }
    // 现在怎样、结论
    const ya = L.ya;
    let ansBtns = false;
    if (m.game === 0) {
      if (m.last !== null) s += '<g data-read="1">' + K.text(20, ya - 8, '只剩一个数：' + m.last + '（' + par(m.last) + '数）', { size: 14, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
      if (!m.asks.length) {
        ansBtns = true;
        s += K.text(20, ya + 30, '1 到 ' + m.N + '：', { size: 13, weight: 700, anchor: 'start' });
        s += btn(100, ya + 13, 130, '最后剩单数', { ans: 1 }, m.found, '1 到 ' + m.N + ' 最后剩单数', m.ans === 1) + btn(236, ya + 13, 130, '最后剩双数', { ans: 2 }, m.found, '1 到 ' + m.N + ' 最后剩双数', m.ans === 2);
      }
    } else {
      if (m.game === 1) s += m.allup ? '<g data-read="1">' + K.text(20, ya - 8, '全部朝上了！翻了 ' + m.steps + ' 次。', { size: 14, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + '</g>' : K.text(20, ya - 8, '现在朝上 ' + m.up + ' 个，朝下 ' + (m.n - m.up) + ' 个。', { size: 13, anchor: 'start' });
      else s += m.mono ? '<g data-read="1">' + K.text(20, ya - 8, '全变成' + CN[m.nums.findIndex((x) => x > 0)] + '色了！相遇了 ' + m.steps + ' 次。', { size: 14, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + '</g>' : K.text(20, ya - 8, '开始时红 ' + m.tri[0] + '、黄 ' + m.tri[1] + '、蓝 ' + m.tri[2] + '。', { size: 13, anchor: 'start' });
      ansBtns = true;
      const say = m.game === 1 ? '永远不能全部朝上（有理由）' : '永远不能变成同一种颜色（有理由）', patch = { ans: 2 };
      if (m.right === 2) patch.book = addBook(m, m.caseKey + ':no');
      s += btn(20, ya + 13, 260, say, patch, m.found, m.game === 1 ? '不能全部朝上' : '不能变成同一种颜色', m.ans === 2);
    }
    if (ansBtns) {
      if (!m.found) s += K.text(400, ya + 30, '先找到不变量，才能下结论', { size: 12, anchor: 'start', fill: '#8a93a3' });
      else if (m.ans) s += K.text(400, ya + 30, m.ans === m.right ? '对：不变量说了算。' + (m.game ? '记进研究本了。' : '') : '再想想：开头时不变量是几？最后要是几？', { size: 12, weight: 700, anchor: 'start', fill: m.ans === m.right ? '#2f7d3a' : '#c0392b' });
    }
    // 退一步、重来、换情况
    const yb = L.yb;
    s += btn(20, yb, 80, '退一步', { hist: m.hist.slice(0, -1).join('|'), sel: '' }, m.steps > 0, '退一步') + btn(106, yb, 80, '重来', Object.assign({}, reset), m.steps > 0, '从头再来');
    s += K.text(196, yb + 17, '做了 ' + m.steps + ' 步', { size: 12, anchor: 'start', fill: '#5f6773' });
    if (m.adj) {
      const pm = (x, label, k, v, lo, hi, tipD, tipU, extra) => K.text(x, yb + 17, label, { size: 12, weight: 700, anchor: 'start' }) + btn(x + tw(label) + 6, yb, 26, '−', Object.assign({ [k]: v - 1 }, reset, extra ? extra(v - 1) : {}), v > lo, tipD) + K.text(x + tw(label) + 46, yb + 17, String(v), { size: 14, weight: 700 }) + btn(x + tw(label) + 60, yb, 26, '+', Object.assign({ [k]: v + 1 }, reset, extra ? extra(v + 1) : {}), v < hi, tipU);
      if (m.game === 0) s += pm(300, '黑板上到', 'n', m.n, 2, 10, '少一个数', '多一个数', (v) => (m.N === m.n ? { N: v } : {}));
      else if (m.game === 1) s += pm(270, '杯子', 'n', m.n, 3, 11, '少一个杯子', '多一个杯子', (v) => ({ k: Math.min(m.k, v, 5) })) + pm(440, '每次翻', 'k', m.k, 1, Math.min(5, m.n), '每次少翻一个', '每次多翻一个');
      else if (m.starts.length > 1) s += btn(300, yb, 170, '换一组（第 ' + (m.si + 1) + ' / ' + m.starts.length + ' 组）', Object.assign({ si: (m.si + 1) % m.starts.length }, reset), true, '换一组');
    }
    // 研究本、追问
    s += RS.drawBook(L.ybook, items(m), '研究本（做成了的、证明做不到的，都记在这里）');
    s += RS.drawAsks(L.yask, m.asks, m.canAsk);
    return s;
  }
  U.registerPack({
    id: 'invbench', version: 3,
    types: {
      invbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E2', 'E7'],
        label: '不变量放大镜', prefix: '放大镜', group: '数与运算', grades: [3, 6],
        alias: ['不变量', '奇偶性', '单双', '擦数', '黑板上的数', '翻杯子', '变色龙', '除以 3 的余数', '能不能', '奥数', '研究本'],
        props: {
          game: { type: 'choice', label: '玩什么', default: 0, choices: ['擦数写数', '翻杯子', '变色龙'], write: true },
          op: { type: 'choice', label: '写上', default: 0, choices: ['和', '差'], write: true },
          n: { type: 'int', label: '几个数（几个杯子）', default: 6, min: 2, max: 11, write: true },
          k: { type: 'int', label: '每次翻几个', default: 2, min: 1, max: 5, write: true },
          N: { type: 'int', label: '题目问到 1 到几', default: 6, min: 2, max: 9999, write: true },
          starts: { type: 'text', label: '变色龙的几组开头（红,黄,蓝|…）', default: '13,15,17', write: true },
          si: { type: 'int', label: '变色龙第几组', default: 0, min: 0, max: 9, write: true },
          adj: { type: 'bool', label: '台面上能换情况', default: false, write: true },
          lens: { type: 'int', label: '放大镜看第几个量', default: 0, min: 0, max: 5, write: true },
          view: { type: 'int', label: '怎么看（0 本身，1 单双，2 除以 3 的余数）', default: 0, min: 0, max: 2, write: true },
          hist: { type: 'text', label: '每一步的局面', default: '', write: true },
          sel: { type: 'text', label: '点选了哪几个', default: '', write: true },
          ans: { type: 'int', label: '下的结论', default: 0, min: 0, max: 2, write: true },
          book: { type: 'text', label: '研究本', default: '', write: true },
          ask: { type: 'text', label: '追问（题干|选项|*对的选项~…）', default: '', write: true },
          pick: { type: 'text', label: '追问选了第几个', default: '', write: true },
        },
        outputs: {
          steps: { dim: null, kind: 'num', label: '做了几步' }, last: { dim: null, kind: 'num', label: '最后剩的数' },
          up: { dim: null, kind: 'num', label: '朝上的杯子' }, allup: { dim: null, kind: 'num', label: '全部朝上了（1 是）' },
          mono: { dim: null, kind: 'num', label: '变成同一种颜色了（1 是）' },
          found: { dim: null, kind: 'num', label: '找到不变量了（1 是）' }, ans: { dim: null, kind: 'num', label: '结论（1 单数，2 双数 / 不能）' },
          n: { dim: null, kind: 'num', label: '几个数 / 几个杯子' }, k: { dim: null, kind: 'num', label: '每次翻几个' }, si: { dim: null, kind: 'num', label: '变色龙第几组' },
          plays: { dim: null, kind: 'num', label: '这块黑板擦完了几种擦法' }, cases: { dim: null, kind: 'num', label: '研究本里有几种情况' },
          can: { dim: null, kind: 'num', label: '其中做得到的' }, cannot: { dim: null, kind: 'num', label: '其中证明做不到的' },
          q1: { dim: null, kind: 'num', label: '追问 1 选了第几个' }, q2: { dim: null, kind: 'num', label: '追问 2 选了第几个' },
        },
        icon: () => K.circle(22, 22, 12, { stroke: 'var(--ink)', w: 2 }) + K.line(31, 31, 42, 42, { w: 3 }) + K.text(22, 27, '=', { size: 12, weight: 700 }),
        size: (c) => [W, Math.max(400, lay(model((c && c.props) || {})).end + 30)],
        grips: () => [],
        compute: (c) => {
          const m = model(c.props), o = { steps: num(m.steps), found: num(m.found ? 1 : 0), n: num(m.n) };
          if (m.last !== null) o.last = num(m.last);
          if (m.game === 1) { o.up = num(m.up); o.allup = num(m.allup ? 1 : 0); o.k = num(m.k); }
          if (m.game === 2) { o.mono = num(m.mono ? 1 : 0); o.si = num(m.si + 1); }
          if (m.game === 0) o.plays = num(m.plays);
          else { o.cases = num(m.nCase); o.can = num(m.nCan); o.cannot = num(m.nCannot); }
          if (m.ans) o.ans = num(m.ans);
          m.asks.forEach((a, i) => { if (a.pick) o['q' + (i + 1)] = num(a.pick); });
          return o;
        },
        badge: (c) => { const m = model(c.props); return m.found ? '找到不变量' : m.book.length ? '研究本 ' + m.book.length + ' 条' : ''; },
        draw,
      },
    },
  });
  U.InvBench = { model, solveCups, solveCham, start, lensName };
})(typeof globalThis !== 'undefined' ? globalThis : window);
