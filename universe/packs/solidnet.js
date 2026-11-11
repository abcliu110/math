/* 器材包 solidnet：展开图和小方块搭建（docs/new-instruments.md 6.8）。两个器材一个包：
 *   net（展开图）：6 个方格连成的图（35 种六连方一个个看，或自己点格子拼）。先猜：能折成正方体吗？再回答“能 / 不能”；系统用“把方块在格子上滚一遍”判：
 *     滚过的 6 个格子要落在 6 个不同的面上才能折成；落在同一个面上的格子标红（折起来叠在一起）。能折的，每个格子标上它是正方体的哪个面（上、下、前、后、左、右），点一个格子看和它相对的面。
 *     35 种逐个判断完、而且全对，是穷举（③）；恰好 11 种能折。
 *   cubes（小方块）：4 × 4 的底板，左半格加一块、右半格减一块。前视图、左视图、俯视图实时画出，读出块数、表面积（含底面）。
 *     给一个目标的三视图，搭出来对上；先猜最少要几块、最多几块（系统用搜索算出真正的最少和最多）。
 * 和设计文档的差别（如实写）：展开图没有 3D 折叠动画（用每个格子标“是哪个面”和叠在一起标红代替）；
 *   小方块没有选 target 以外的自由三视图输入（目标是 3 个预设）；表面积的“拿掉一个角上的方块”靠自己点着试，不单独做拆除题；先猜是在表面积/最少块数处，不是在三视图上。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', typeof n === 'number' ? Q(n) : n, { dim: null });
  const hit = (k, v, x, y, w, h) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="3" fill="transparent" data-pick-k="' + k + '" data-pick-v="' + v + '" style="cursor:pointer"/>';
  const btn = (x, y, w, h, tx, on) => K.rect(x, y, w, h, { fill: on ? 'var(--accent)' : 'var(--sel-bg)', r: 5 }) + K.text(x + w / 2, y + h * 0.72, tx, { size: 11, weight: 700, fill: on ? '#fff' : 'var(--ink)' });

  // ===== 六连方的枚举（旋转、翻转算同一种） =====
  const norm = (cells) => { let mx = Infinity, my = Infinity; for (const [x, y] of cells) { mx = Math.min(mx, x); my = Math.min(my, y); } return cells.map(([x, y]) => [x - mx, y - my]).sort((a, b) => a[1] - b[1] || a[0] - b[0]); };
  const key = (cells) => cells.map((c) => c.join(',')).join(';');
  const variants = (cells) => { const out = []; let c = cells; for (let f = 0; f < 2; f++) { for (let r = 0; r < 4; r++) { c = c.map(([x, y]) => [-y, x]); out.push(key(norm(c))); } c = c.map(([x, y]) => [-x, y]); } return out; };
  const canon = (cells) => variants(cells).sort()[0];
  const HEX = (() => {
    let cur = new Map([[canon([[0, 0]]), [[0, 0]]]]);
    for (let n = 1; n < 6; n++) {
      const nx = new Map();
      for (const cells of cur.values()) { const set = new Set(cells.map((c) => c.join(','))); for (const [x, y] of cells) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const q = [x + dx, y + dy]; if (set.has(q.join(','))) continue; const nc = norm(cells.concat([q])); const k = canon(nc); if (!nx.has(k)) nx.set(k, nc); } }
      cur = nx;
    }
    return Array.from(cur.entries()).sort((a, b) => (a[0] < b[0] ? -1 : 1)).map((e) => e[1]);
  })();
  // 把方块在格子上滚：[上, 下, 北, 南, 东, 西] 的面号；北 = y 减小
  const roll = (o, dx, dy) => { const [t, b, n, s, e, w] = o; if (dx === 1) return [w, e, n, s, t, b]; if (dx === -1) return [e, w, n, s, b, t]; if (dy === 1) return [n, s, b, t, e, w]; return [s, n, t, b, e, w]; };
  const FACE = ['上', '下', '前', '后', '右', '左'];
  function fold(cells) {
    const idx = new Map(cells.map((c, i) => [c.join(','), i])), face = new Array(cells.length).fill(-1), seen = [0];
    face[0] = 1; const st = [[0, [0, 1, 2, 3, 4, 5]]];     // 第 0 个格子压在“下”面上
    while (st.length) { const [i, o] = st.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const j = idx.get((cells[i][0] + dx) + ',' + (cells[i][1] + dy)); if (j === undefined || face[j] >= 0) continue; const o2 = roll(o, dx, dy); face[j] = o2[1]; st.push([j, o2]); } }
    const cnt = [0, 0, 0, 0, 0, 0]; face.forEach((f) => { if (f >= 0) cnt[f]++; });
    const over = face.map((f) => (f >= 0 && cnt[f] > 1 ? 1 : 0)), foldable = face.every((f) => f >= 0) && cnt.every((c) => c === 1);
    return { face, foldable, overlap: cnt.reduce((a, c) => a + Math.max(0, c - 1), 0), over };
  }
  const connected = (cells) => { if (!cells.length) return false; const set = new Set(cells.map((c) => c.join(','))), seen = new Set([cells[0].join(',')]), st = [cells[0]]; while (st.length) { const [x, y] = st.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = (x + dx) + ',' + (y + dy); if (set.has(k) && !seen.has(k)) { seen.add(k); st.push([x + dx, y + dy]); } } } return seen.size === cells.length; };
  const NG = 6;
  const cellsOf = (s) => String(s || '').split(';').filter(Boolean).map((t) => t.split(',').map(Number)).sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  const keyOf = (cells) => cells.map((c) => c.join(',')).join(';');
  function nJudge(p) {
    const cells = cellsOf(p.cells), valid = cells.length === 6 && connected(cells), F = valid ? fold(cells) : null;
    let mk = Number(p.mk) || 0, opp = 0; if (F && F.foldable && mk > 0 && mk <= 6) { const f = F.face[mk - 1], of = f ^ 1; opp = F.face.indexOf(of) + 1; }
    const A = String(p.ans || '').padEnd(35, '0').split('').map(Number), truth = HEX.map((c) => (fold(c).foldable ? 1 : 2));
    const judged = A.filter((a) => a > 0).length, right = A.filter((a, i) => a > 0 && a === truth[i]).length, foundFold = A.filter((a, i) => a === 1 && truth[i] === 1).length;
    return { cells, valid, F, foldable: F && F.foldable ? 1 : 0, overlap: F ? F.overlap : 0, mk, opp, judged, right, foundFold, all: judged === 35 && right === 35 ? 1 : 0 };
  }
  function nOnSet(p, k, v) {
    if (k === 'load') { if (!(v > 0)) return { load: 0 }; return { load: 0, idx: v - 1, cells: keyOf(HEX[(v - 1) % 35]), mk: 0 }; }
    if (k === 'cell') { if (!(v > 0)) return { cell: 0 }; const x = (v - 1) % NG, y = Math.floor((v - 1) / NG), c = cellsOf(p.cells), at = c.findIndex((q) => q[0] === x && q[1] === y); if (at >= 0) c.splice(at, 1); else if (c.length < 6) c.push([x, y]); return { cell: 0, cells: keyOf(c.sort((a, b) => a[1] - b[1] || a[0] - b[0])), mk: 0 }; }
    if (k === 'say') { if (!(v > 0)) return { say: 0 }; const a = String(p.ans || '').padEnd(35, '0').split(''); a[p.idx % 35] = String(v); return { say: 0, ans: a.join('') }; }
    return null;
  }
  function nDraw(c) {
    const p = c.props, J = nJudge(p), g = 24, ox = 12, oy = 12; let s = '', H = '';
    for (let y = 0; y < NG; y++) for (let x = 0; x < NG; x++) { const X = ox + x * g, Y = oy + y * g, at = J.cells.findIndex((q) => q[0] === x && q[1] === y), on = at >= 0; let fill = 'var(--card)'; if (on) fill = J.F && J.F.over[at] ? 'var(--bad)' : J.mk === at + 1 ? 'var(--accent)' : J.opp === at + 1 ? 'var(--good)' : 'var(--sel-bg)'; s += K.rect(X, Y, g - 2, g - 2, { fill, stroke: 'var(--dim)', w: 0.6, r: 3 }); if (on && !c.masked && J.F && J.F.foldable) s += K.text(X + g / 2 - 1, Y + g * 0.68, FACE[J.F.face[at]], { size: 11, weight: 700 }); H += hit('cell', y * NG + x + 1, X, Y, g - 2, g - 2); }
    const x1 = ox + NG * g + 14; s += K.text(x1, 20, '第 ' + ((p.idx % 35) + 1) + ' / 35 种', { size: 12, anchor: 'start', weight: 700 });
    [['◀', ((p.idx + 34) % 35) + 1], ['▶', ((p.idx + 1) % 35) + 1]].forEach(([tx, v], i) => { s += btn(x1 + i * 40, 28, 36, 20, tx, false); H += hit('load', v, x1 + i * 40, 28, 36, 20); });
    if (!J.valid) s += K.text(x1, 70, '要 6 个连着的格子（现在 ' + J.cells.length + ' 个）', { size: 10.5, anchor: 'start', fill: 'var(--dim)' });
    else if (c.masked) s += K.text(x1, 70, '先猜：能折成正方体吗？', { size: 11.5, anchor: 'start', weight: 700, fill: 'var(--accent)' });
    else { s += K.text(x1, 70, J.foldable ? '能折成正方体' : '不能：有 ' + J.overlap + ' 个面叠在一起（红色）', { size: 11.5, anchor: 'start', weight: 700, fill: J.foldable ? 'var(--good)' : 'var(--bad)' }); if (J.foldable) s += K.text(x1, 88, J.mk ? '蓝色的相对面是绿色的那个' : '点一个格子，看它的相对面', { size: 10.5, anchor: 'start', fill: 'var(--dim)' }); }
    s += K.text(x1, 112, '你说“能 / 不能”：', { size: 10.5, anchor: 'start' }); const cur = Number(String(p.ans || '').padEnd(35, '0')[p.idx % 35]);
    [[1, '能'], [2, '不能']].forEach(([v, tx], i) => { s += btn(x1 + i * 44, 118, 40, 20, tx, cur === v); H += hit('say', v, x1 + i * 44, 118, 40, 20); });
    s += K.text(x1, 158, '判了 ' + J.judged + ' / 35，对了 ' + J.right + (J.all ? '　全对！' : ''), { size: 11, anchor: 'start', weight: 700, fill: J.all ? 'var(--good)' : 'var(--ink)' });
    return s + H;
  }
  const netDef = {
    workspaceRole: 'none', handles: true, compactPorts: true, essence: ['E5', 'E1'], label: '展开图', prefix: '展', group: '图形', grades: [1, 9], alias: ['展开图', '正方体', '六连方', '折叠', '相对面', '穷举'],
    props: { cells: { hidden: true, type: 'text', label: '格子', default: keyOf(HEX[0]), write: false }, idx: { hidden: true, type: 'int', label: '第几种（0 起）', default: 0, min: 0, max: 34 }, load: { hidden: true, type: 'int', label: '看第几种（1 起）', default: 0, min: 0, max: 35 }, cell: { hidden: true, type: 'int', label: '点一个格子', default: 0, min: 0, max: 36 }, mk: { hidden: true, type: 'int', label: '看相对面的格子', default: 0, min: 0, max: 6 }, say: { hidden: true, type: 'int', label: '我说（1 能 2 不能）', default: 0, min: 0, max: 2 }, ans: { hidden: true, type: 'text', label: '35 种的回答', default: '', write: false }, gans: { type: 'int', label: '先猜（1 能折 2 不能）', default: 0, min: 0, max: 2 } },
    onSet: nOnSet,
    guess: { props: ['gans'], ports: ['foldable', 'overlap'], answered: (p) => p.gans > 0 },
    outputs: { foldable: { dim: null, kind: 'num', label: '能折成正方体（1/0）' }, overlap: { dim: null, kind: 'num', label: '叠在一起的面数' }, valid: { dim: null, kind: 'num', label: '是 6 个连着的格子（1/0）' }, judged: { dim: null, kind: 'num', label: '判了几种' }, right: { dim: null, kind: 'num', label: '判对了几种' }, all: { dim: null, kind: 'num', label: '35 种全判对（1/0）' }, lv: { dim: null, kind: 'num', label: '证据等级' } },
    icon: () => '<rect x="22" y="4" width="14" height="14" fill="var(--sel-bg)" stroke="var(--ink)"/><rect x="22" y="18" width="14" height="14" fill="var(--sel-bg)" stroke="var(--ink)"/><rect x="8" y="18" width="14" height="14" fill="var(--sel-bg)" stroke="var(--ink)"/><rect x="36" y="18" width="14" height="14" fill="var(--sel-bg)" stroke="var(--ink)"/><rect x="22" y="32" width="14" height="14" fill="var(--sel-bg)" stroke="var(--ink)"/><rect x="22" y="46" width="14" height="14" fill="var(--sel-bg)" stroke="var(--ink)"/>',
    size: () => [330, 205],
    compute: (c) => { const J = nJudge(c.props); c.say(J.all ? 'ok' : 'info', J.valid ? (J.foldable ? '能折成正方体' : '不能折成') : '拼 6 个连着的格子'); return { foldable: num(J.foldable), overlap: num(J.overlap), valid: num(J.valid ? 1 : 0), judged: num(J.judged), right: num(J.right), all: num(J.all), lv: num(J.all ? 3 : 0) }; },
    badge: (c) => (c.masked ? '？' : c.out.valid && Q.num(c.out.valid.data) ? (Q.num(c.out.foldable.data) ? '能折' : '不能折') : ''),
    draw: nDraw,
  };

  // ===== 小方块搭建 =====
  const NC = 4;
  const hs = (s) => { const a = String(s || '').padEnd(16, '0').split('').map(Number); return a.slice(0, 16); };
  const views = (h) => { const front = [0, 0, 0, 0], left = [0, 0, 0, 0], top = new Array(16).fill(0); for (let y = 0; y < NC; y++) for (let x = 0; x < NC; x++) { const v = h[y * NC + x]; front[x] = Math.max(front[x], v); left[y] = Math.max(left[y], v); if (v) top[y * NC + x] = 1; } return { front, left, top }; };
  const surface = (h) => { let s = 0; for (let y = 0; y < NC; y++) for (let x = 0; x < NC; x++) { const v = h[y * NC + x]; if (!v) continue; s += 2; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y + dy, w = X < 0 || Y < 0 || X >= NC || Y >= NC ? 0 : h[Y * NC + X]; s += Math.max(0, v - w); } } return s; };
  // 预设目标（只给三视图；学生搭任意一个符合的）
  const TGT = ['2100100000000000', '1210020000000000', '3200210010000000'];
  const TN = ['楼梯', '小塔', '角落'];
  const eqA = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
  const rangeCache = {};
  function range(t) {   // 符合这三个视图的最少块数和最多块数（搜索）
    if (rangeCache[t]) return rangeCache[t];
    const V = views(hs(TGT[t])), cells = []; for (let i = 0; i < 16; i++) if (V.top[i]) cells.push(i);
    const cap = cells.map((i) => Math.min(V.front[i % NC], V.left[Math.floor(i / NC)])); let mn = Infinity, mx = 0; const h = new Array(16).fill(0);
    const rec = (k, vol) => { if (vol >= mn && k < cells.length && false) return; if (k === cells.length) { const W = views(h); if (eqA(W.front, V.front) && eqA(W.left, V.left)) { mn = Math.min(mn, vol); mx = Math.max(mx, vol); } return; } for (let v = 1; v <= cap[k]; v++) { h[cells[k]] = v; rec(k + 1, vol + v); } h[cells[k]] = 0; };
    rec(0, 0); return (rangeCache[t] = [mn, mx]);
  }
  function cJudge(p) {
    const h = hs(p.h), V = views(h), T = views(hs(TGT[p.tgt])), vol = h.reduce((a, b) => a + b, 0), match = eqA(V.front, T.front) && eqA(V.left, T.left) && eqA(V.top, T.top) ? 1 : 0, R = range(p.tgt);
    return { h, V, T, vol, surface: surface(h), match, isMin: match && vol === R[0] ? 1 : 0, isMax: match && vol === R[1] ? 1 : 0, min: R[0], max: R[1] };
  }
  function cOnSet(p, k, v) { if (k === 'put') { if (!(v > 0)) return { put: 0 }; const i = Math.floor((v - 1) / 5), nh = (v - 1) % 5, h = hs(p.h); h[i] = nh; return { put: 0, h: h.join('') }; } if (k === 'tgt') return { h: '0'.repeat(16) }; return null; }
  function cDraw(c) {
    const p = c.props, J = cJudge(p), g = 30, ox = 10, oy = 10; let s = '', H = '';
    for (let y = 0; y < NC; y++) for (let x = 0; x < NC; x++) { const i = y * NC + x, h = J.h[i], X = ox + x * g, Y = oy + y * g; s += K.rect(X, Y, g - 3, g - 3, { fill: h ? 'var(--sel-bg)' : 'var(--card)', stroke: 'var(--dim)', w: 0.7, r: 4 }) + K.text(X + (g - 3) / 2, Y + g * 0.62, h ? String(h) : '', { size: 14, weight: 700 }); H += hit('put', i * 5 + Math.min(4, h + 1) + 1, X, Y, (g - 3) / 2, g - 3) + hit('put', i * 5 + Math.max(0, h - 1) + 1, X + (g - 3) / 2, Y, (g - 3) / 2, g - 3); }
    s += K.text(ox, oy + NC * g + 12, '左半格 +1，右半格 −1', { size: 10, anchor: 'start', fill: 'var(--dim)' });
    const small = (X0, Y0, lab, arr, vertical, top) => { s += K.text(X0, Y0 - 3, lab, { size: 10, anchor: 'start', weight: 700 }); for (let i = 0; i < 4; i++) { for (let k = 0; k < 4; k++) { const on = top ? arr[k * 4 + i] : (arr[i] > k); const hh = 12, yy = top ? Y0 + k * hh : Y0 + (3 - k) * hh; if (top || true) s += K.rect(X0 + i * hh, yy, hh - 1, hh - 1, { fill: on ? 'var(--accent)' : 'var(--card)', stroke: 'var(--dim)', w: 0.4, r: 1 }); } } };
    const x2 = ox + NC * g + 20; small(x2, 24, '前视图', J.V.front, false, false); small(x2 + 66, 24, '左视图', J.V.left, false, false); small(x2 + 132, 24, '俯视图', J.V.top, false, true);
    small(x2, 100, '目标·前', J.T.front, false, false); small(x2 + 66, 100, '目标·左', J.T.left, false, false); small(x2 + 132, 100, '目标·俯', J.T.top, false, true);
    s += K.text(x2, 166, c.masked ? '先猜：最少、最多要几块？' : '块数 ' + J.vol + '　表面积 ' + J.surface, { size: 12, anchor: 'start', weight: 700, fill: c.masked ? 'var(--accent)' : 'var(--ink)' });
    s += K.text(x2, 184, J.match ? '三个视图都对上了' + (c.masked ? '' : J.isMin ? '（最少）' : J.isMax ? '（最多）' : '') : '还没对上', { size: 11, anchor: 'start', fill: J.match ? 'var(--good)' : 'var(--dim)' });
    return s + H;
  }
  const cubesDef = {
    workspaceRole: 'none', handles: true, compactPorts: true, essence: ['E5', 'E1'], label: '小方块搭建', prefix: '块', group: '图形', grades: [1, 6], alias: ['小方块', '三视图', '搭建', '观察物体', '表面积', '最少几块'],
    props: { h: { hidden: true, type: 'text', label: '每格几层', default: '0'.repeat(16), write: false }, put: { hidden: true, type: 'int', label: '改一格（格号×5+层数+1）', default: 0, min: 0, max: 80 }, tgt: { type: 'choice', label: '目标', default: 0, choices: TN }, gcnt: { type: 'int', label: '先猜：最少几块（0 = 还没猜）', default: 0, min: 0, max: 64 } },
    onSet: cOnSet,
    guess: { props: ['gcnt'], ports: ['volume', 'surface', 'isMin', 'isMax'], answered: (p) => p.gcnt > 0 },
    outputs: { volume: { dim: null, kind: 'num', label: '一共几块' }, surface: { dim: null, kind: 'num', label: '表面积（含底面，单位：一个面）' }, match: { dim: null, kind: 'num', label: '三视图都对上（1/0）' }, isMin: { dim: null, kind: 'num', label: '对上了而且是最少的块数（1/0）' }, isMax: { dim: null, kind: 'num', label: '对上了而且是最多的块数（1/0）' }, min: { dim: null, kind: 'num', label: '这三个视图最少要几块' }, max: { dim: null, kind: 'num', label: '这三个视图最多能有几块' }, guessed: { dim: null, kind: 'num', label: '先猜对了最少块数（1/0）' } },
    icon: () => '<rect x="10" y="30" width="20" height="20" fill="var(--sel-bg)" stroke="var(--ink)"/><rect x="30" y="30" width="20" height="20" fill="var(--sel-bg)" stroke="var(--ink)"/><rect x="10" y="10" width="20" height="20" fill="var(--sel-bg)" stroke="var(--ink)"/>',
    size: () => [400, 225],
    compute: (c) => { const J = cJudge(c.props); c.say(J.match ? 'ok' : 'info', J.match ? '三个视图都对上了' : '搭到和目标一样'); return { volume: num(J.vol), surface: num(J.surface), match: num(J.match), isMin: num(J.isMin), isMax: num(J.isMax), min: num(J.min), max: num(J.max), guessed: num(c.props.gcnt === J.min ? 1 : 0) }; },
    badge: (c) => (c.masked ? '？' : c.out.volume ? c.out.volume.data.n + ' 块' : ''),
    draw: cDraw,
  };
  U.registerPack({ id: 'solidnet', version: 1, needs: [], types: { net: netDef, cubes: cubesDef } });
  U.SolidNet = { HEX, fold, connected, nJudge, cJudge, views, surface, range, TGT, FACE };
})(typeof globalThis !== 'undefined' ? globalThis : window);
