/* 器材包 invbench：不变量放大镜。做一种操作很多次，用放大镜盯住一个量：它变不变？不变的量叫不变量，用它回答“最后会怎样”“能不能做到”。
 *   game 0 擦数写数：黑板上写着 1、2、…、n。点两个数，擦掉，写上它们的和（op 0）或者差（op 1，大减小）。一直做到只剩一个数。
 *     题目可以问更大的 1 到 N：在小的上找到不变量，再推到 N（ans：1 最后是单数，2 最后是双数）。
 *   game 1 翻杯子：n 个杯子都杯口朝下，每次正好翻 k 个（点 k 个杯子，再点“翻”）。能不能全部朝上（allup）？
 *     k 是双数、n 是单数时永远做不到：朝上的个数每次变 0、±2、±4……，单双不变（ans 2：不能）。
 *   放大镜（lens）：擦数写数看 个数 / 和 / 和的单双；翻杯子看 朝上的个数 / 朝下的个数 / 朝上个数的单双。
 *   下面一排画出每一步放大镜里的值：一直一样、而且这个量真的是不变量（至少做了 2 步）时才算“找到了”（found）。
 *   碰巧几步没变、但其实会变的量，只说“到现在还没变，再多做几步”，不算找到。答案按钮要先找到不变量才点得动。
 *   hist 记下每一步的局面（用 | 隔开），sel 记下点选了哪几个；可以退一步、重来。
 * 这一版的边界（如实写）：黑板最多 10 个数，杯子最多 11 个、每次翻 1–5 个；只有这两种游戏。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 700;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? Math.round(+v) : lo));
  const LENS = [['个数', '和', '和的单双'], ['朝上的个数', '朝下的个数', '朝上个数的单双']];
  const par = (v) => (v % 2 ? '单' : '双');
  const start = (game, n) => (game === 0 ? Array.from({ length: n }, (_, i) => i + 1).join(',') : '0'.repeat(n));
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
  function model(p) {
    const game = clamp(p.game, 0, 1), op = clamp(p.op, 0, 1), n = clamp(p.n, game ? 3 : 2, game ? 11 : 10), k = clamp(p.k, 1, Math.min(5, n)), N = clamp(p.N, n, 9999);
    const ok = (s) => (game === 0 ? /^\d+(,\d+)*$/.test(s) : new RegExp('^[01]{' + n + '}$').test(s));
    let hist = String(p.hist || '').split('|').filter(ok); if (!hist.length || hist[0] !== start(game, n)) hist = [start(game, n)];
    const cur = hist[hist.length - 1], nums = game === 0 ? cur.split(',').map(Number) : cur.split('').map(Number);
    const sel = String(p.sel || '').split(',').filter((x) => x !== '').map(Number).filter((i, j, a) => i >= 0 && i < nums.length && a.indexOf(i) === j);
    const lens = clamp(p.lens, 0, 3);
    const val = (s) => {
      if (game === 0) { const a = s.split(',').map(Number), sum = a.reduce((x, y) => x + y, 0); return lens === 1 ? a.length : lens === 2 ? sum : par(sum); }
      const up = s.split('').filter((c) => c === '1').length; return lens === 1 ? up : lens === 2 ? n - up : par(up);
    };
    const vals = lens ? hist.map(val) : [];
    const real = game === 0 ? (op === 0 ? [2, 3] : [3]) : (k % 2 === 0 ? [3] : []);   // 真的不变的量
    const same = vals.length >= 3 && vals.every((v) => v === vals[0]);
    const found = same && real.includes(lens);
    const ans = found ? clamp(p.ans, 0, 2) : 0;
    const up = game === 1 ? nums.filter((c) => c === 1).length : 0;
    const right = game === 0 ? ((N * (N + 1) / 2) % 2 ? 1 : 2) : (solveCups(n, k) ? 0 : 2);
    return { game, op, n, k, N, hist, cur, nums, sel, lens, vals, real, same, found, ans, up, steps: hist.length - 1, last: game === 0 && nums.length === 1 ? nums[0] : null, allup: game === 1 && up === n, right };
  }
  const btn = (x, y, w, label, patch, enabled, tip, on) => '<g' + (enabled ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' data-off="1"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 26, { fill: on ? '#dcebfb' : enabled ? '#fff' : '#f1f3f6', stroke: enabled || on ? 'var(--blue)' : '#b8c0cc', r: 7, w: on ? 2.2 : 1.4 }) + K.text(x + w / 2, y + 17, label, { size: 12, weight: 700, fill: enabled || on ? 'var(--ink)' : '#5f6773' }) + '</g>';
  const pick = (patch, tip, inner) => '<g data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"><title>' + K.esc(tip) + '</title>' + inner + '</g>';
  function draw(c) {
    const m = model(c.props); let s = '';
    const H = m.hist.join('|');
    if (m.game === 0) {
      s += K.text(20, 26, '黑板上写着 1 到 ' + m.n + '。每次擦掉两个数，写上它们的' + (m.op ? '差（大减小）' : '和') + '。', { size: 15, weight: 700, anchor: 'start' });
      if (m.N !== m.n) s += K.text(20, 48, '题目问的是 1 到 ' + m.N + '：先在小的上找不变的量，再推过去。', { size: 12, anchor: 'start', fill: '#5f6773' });
      m.nums.forEach((v, i) => {
        const x = 24 + i * 56, y = 62, on = m.sel.includes(i);
        let patch, tip;
        if (m.nums.length < 2) { s += K.rect(x, y, 48, 40, { fill: '#fff3d6', stroke: '#c9a24a', r: 8, w: 1.4 }) + K.text(x + 24, y + 26, String(v), { size: 16, weight: 700 }); return; }
        if (on) { patch = { sel: '' }; tip = '不选 ' + v; }
        else if (!m.sel.length) { patch = { sel: String(i) }; tip = '选第 ' + (i + 1) + ' 个数 ' + v; }
        else { const j = m.sel[0], a = m.nums[j], r = m.op ? Math.abs(a - v) : a + v, nx = m.nums.filter((_, t) => t !== i && t !== j); nx.splice(Math.min(i, j), 0, r); patch = { hist: H + '|' + nx.join(','), sel: '' }; tip = '和第 ' + (i + 1) + ' 个数 ' + v + ' 一起擦掉'; }
        s += pick(patch, tip, K.rect(x, y, 48, 40, { fill: on ? '#dcebfb' : '#fff3d6', stroke: on ? 'var(--blue)' : '#c9a24a', r: 8, w: on ? 2.4 : 1.4 }) + K.text(x + 24, y + 26, String(v), { size: 16, weight: 700 }));
      });
    } else {
      s += K.text(20, 26, m.n + ' 个杯子都杯口朝下。每次正好翻 ' + m.k + ' 个。能全部翻成杯口朝上吗？', { size: 15, weight: 700, anchor: 'start' });
      m.nums.forEach((v, i) => {
        const x = 24 + i * 56, y = 58, on = m.sel.includes(i);
        const patch = on ? { sel: m.sel.filter((t) => t !== i).join(',') } : m.sel.length < m.k ? { sel: m.sel.concat(i).join(',') } : null;
        // 杯子：梯形，杯口那一边画粗线
        const pts = v ? [[x + 6, y + 6], [x + 42, y + 6], [x + 36, y + 44], [x + 12, y + 44]] : [[x + 12, y + 6], [x + 36, y + 6], [x + 42, y + 44], [x + 6, y + 44]];
        const shape = '<polygon points="' + pts.map((q) => q.join(',')).join(' ') + '" fill="' + (v ? '#e3f4e6' : '#eef1f6') + '" stroke="' + (on ? 'var(--blue)' : 'var(--ink)') + '" stroke-width="' + (on ? 2.6 : 1.2) + '"/>' + K.line(v ? x + 6 : x + 6, v ? y + 6 : y + 44, v ? x + 42 : x + 42, v ? y + 6 : y + 44, { stroke: '#4c9a5b', w: 3.2 }) + K.text(x + 24, y + 60, v ? '朝上' : '朝下', { size: 10, fill: '#5f6773' });
        s += patch ? pick(patch, (on ? '不选' : '选') + '第 ' + (i + 1) + ' 个杯子', shape) : shape;
      });
      s += btn(24, 128, 130, '翻这 ' + m.k + ' 个', { hist: H + '|' + m.nums.map((v, i) => (m.sel.includes(i) ? 1 - v : v)).join(''), sel: '' }, m.sel.length === m.k, '把选好的杯子翻过来');
      s += K.text(166, 145, '选了 ' + m.sel.length + ' 个，要正好 ' + m.k + ' 个', { size: 12, anchor: 'start', fill: '#5f6773' });
    }
    // 放大镜
    const yl = 160, L = LENS[m.game];
    s += K.text(20, yl + 17, '🔍 盯住', { size: 13, weight: 700, anchor: 'start' });
    L.forEach((nm, i) => { s += btn(84 + i * 132, yl, 126, nm, { lens: i + 1 }, true, '放大镜看' + nm, m.lens === i + 1); });
    const yt = 196;
    if (!m.lens) s += K.text(20, yt + 18, '做几步，用放大镜盯住一个量：它每一步变不变？', { size: 13, anchor: 'start', fill: '#5f6773' });
    else {
      const show = m.vals.length > 10 ? m.vals.slice(-10) : m.vals, off = m.vals.length - show.length;
      s += K.text(20, yt + 18, L[m.lens - 1], { size: 12, weight: 700, anchor: 'start' });
      show.forEach((v, i) => {
        const x = 120 + i * 56, chg = i + off > 0 && v !== m.vals[i + off - 1];
        if (i) s += K.text(x - 10, yt + 18, '→', { size: 12, fill: '#8a93a3' });
        s += K.rect(x, yt + 2, 36, 24, { fill: chg ? '#fde3dc' : '#eef6ff', stroke: chg ? '#c0392b' : '#6f9fd4', r: 5, w: 1 }) + K.text(x + 18, yt + 19, String(v), { size: 12, weight: 700, fill: chg ? '#c0392b' : 'var(--ink)' });
      });
      let msg, col = 'var(--ink)';
      if (m.vals.length < 3) msg = '再做' + (3 - m.vals.length) + ' 步看看它变不变。';
      else if (m.found) { msg = '不管怎么做，' + L[m.lens - 1] + '都不变：这就是不变量。'; col = '#2f7d3a'; }
      else if (m.same) msg = '到现在还没变——它真的永远不变吗？换几种做法再看看。';
      else { msg = L[m.lens - 1] + '变了：它不是不变量。换一个量盯住。'; col = '#c0392b'; }
      s += K.text(20, yt + 46, msg, { size: 13, anchor: 'start', fill: col });
    }
    // 结果和答案
    const ya = 270;
    if (m.game === 0) {
      if (m.last !== null) s += '<g data-read="1">' + K.text(20, ya - 8, '只剩一个数：' + m.last + '（' + par(m.last) + '数）', { size: 14, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
      s += K.text(20, ya + 30, '1 到 ' + m.N + '：', { size: 13, weight: 700, anchor: 'start' });
      s += btn(100, ya + 13, 130, '最后剩单数', { ans: 1 }, m.found, '1 到 ' + m.N + ' 最后剩单数', m.ans === 1) + btn(236, ya + 13, 130, '最后剩双数', { ans: 2 }, m.found, '1 到 ' + m.N + ' 最后剩双数', m.ans === 2);
    } else {
      if (m.allup) s += '<g data-read="1">' + K.text(20, ya - 8, '全部朝上了！翻了 ' + m.steps + ' 次。', { size: 14, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
      else s += K.text(20, ya - 8, '现在朝上 ' + m.up + ' 个，朝下 ' + (m.n - m.up) + ' 个。', { size: 13, anchor: 'start' });
      s += btn(20, ya + 13, 230, '永远不能全部朝上（有理由）', { ans: 2 }, m.found, '不能全部朝上', m.ans === 2);
    }
    if (!m.found) s += K.text(400, ya + 30, '先找到不变量，才能下结论', { size: 12, anchor: 'start', fill: '#8a93a3' });
    else if (m.ans) s += K.text(400, ya + 30, m.ans === m.right ? '对：不变量说了算。' : '再想想：开头时不变量是几？最后要是几？', { size: 12, weight: 700, anchor: 'start', fill: m.ans === m.right ? '#2f7d3a' : '#c0392b' });
    const yb = 318;
    s += btn(20, yb, 90, '退一步', { hist: m.hist.slice(0, -1).join('|'), sel: '' }, m.steps > 0, '退一步') + btn(116, yb, 90, '重来', { hist: m.hist[0], sel: '', ans: 0 }, m.steps > 0, '从头再来');
    s += K.text(226, yb + 17, '做了 ' + m.steps + ' 步', { size: 12, anchor: 'start', fill: '#5f6773' });
    return s;
  }
  U.registerPack({
    id: 'invbench', version: 1,
    types: {
      invbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E2', 'E7'],
        label: '不变量放大镜', prefix: '放大镜', group: '数与运算', grades: [4, 6],
        alias: ['不变量', '奇偶性', '单双', '擦数', '黑板上的数', '翻杯子', '能不能', '奥数'],
        props: {
          game: { type: 'choice', label: '玩什么', default: 0, choices: ['擦数写数', '翻杯子'], write: true },
          op: { type: 'choice', label: '写上', default: 0, choices: ['和', '差'], write: true },
          n: { type: 'int', label: '几个数（几个杯子）', default: 6, min: 2, max: 11, write: true },
          k: { type: 'int', label: '每次翻几个', default: 2, min: 1, max: 5, write: true },
          N: { type: 'int', label: '题目问到 1 到几', default: 6, min: 2, max: 9999, write: true },
          lens: { type: 'int', label: '放大镜看第几个量', default: 0, min: 0, max: 3, write: true },
          hist: { type: 'text', label: '每一步的局面', default: '', write: true },
          sel: { type: 'text', label: '点选了哪几个', default: '', write: true },
          ans: { type: 'int', label: '下的结论', default: 0, min: 0, max: 2, write: true },
        },
        outputs: {
          steps: { dim: null, kind: 'num', label: '做了几步' }, last: { dim: null, kind: 'num', label: '最后剩的数' },
          up: { dim: null, kind: 'num', label: '朝上的杯子' }, allup: { dim: null, kind: 'num', label: '全部朝上了（1 是）' },
          found: { dim: null, kind: 'num', label: '找到不变量了（1 是）' }, ans: { dim: null, kind: 'num', label: '结论（1 单数，2 双数 / 不能）' },
        },
        icon: () => K.circle(22, 22, 12, { stroke: 'var(--ink)', w: 2 }) + K.line(31, 31, 42, 42, { w: 3 }) + K.text(22, 27, '=', { size: 12, weight: 700 }),
        size: () => [W, 380],
        grips: () => [],
        compute: (c) => {
          const m = model(c.props), o = { steps: num(m.steps), found: num(m.found ? 1 : 0) };
          if (m.last !== null) o.last = num(m.last);
          if (m.game === 1) { o.up = num(m.up); o.allup = num(m.allup ? 1 : 0); }
          if (m.ans) o.ans = num(m.ans);
          return o;
        },
        badge: (c) => { const m = model(c.props); return m.found ? '找到不变量' : ''; },
        draw,
      },
    },
  });
  U.InvBench = { model, solveCups, start };
})(typeof globalThis !== 'undefined' ? globalThis : window);
