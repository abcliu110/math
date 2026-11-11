/* 器材包 games：取石子（nim）、汉诺塔（hanoi）、一笔画（euler）——三个器材一个包（docs/new-instruments.md 6.1）。
 * 对手由 js/core/game.js 提供（小状态空间穷举，难度 0 随机 / 1 偶尔走错 / 2 总走最好的；默认 1）。
 * 所有操作都是“设属性”（卡片上的可点区域 data-pick-k / data-pick-v），一次点击改几处由 onSet 完成。
 * 和设计文档的差别（如实写）：不是新工作台，三个都是普通器材；取石子的“表填错就让他输一次”没做，只告诉“表对到第几个”；
 * 一笔画的图库是固定的 5 张图，加边、删边在“改图”模式里点两个点。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit, Game = U.Game;
  const num = (n) => U.val('num', typeof n === 'number' ? Q(n) : n, { dim: null });
  const hit = (H, x, y, w, h, k, v) => H.push('<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="4" fill="transparent" data-pick-k="' + k + '" data-pick-v="' + v + '" style="cursor:pointer"/>');
  const clampTxt = (m, n) => String(m || '').slice(0, n);

  // ================= 取石子 =================
  const nimGame = (k, misere) => Game.define({
    id: 'nim-' + k + (misere ? 'm' : ''),
    moves: (s) => { const r = []; for (let i = 1; i <= Math.min(k, s.pile); i++) r.push(i); return r; },
    apply: (s, m) => ({ pile: s.pile - m, turn: 1 - s.turn, by: s.turn }),
    over: (s) => s.pile === 0,
    winner: (s) => (misere ? 1 - s.by : s.by),
  });
  const nimTruth = (n, k, misere) => { const g = nimGame(k, misere), t = []; for (let i = 0; i <= n; i++) t.push(Game.best(g, { pile: i, turn: 0, by: 1 }).win ? 'W' : 'L'); return t; };
  const nimOnSet = (p, k, v) => {
    if (k === 'n' || k === 'k' || k === 'last') return { pile: 0, phase: 0, log: '', msg: '', tbl: '', take: 0, tm: 0 };
    if (k === 'go' && v === 1) {
      const g = nimGame(p.k, p.last === 1); let st = { pile: p.n, turn: p.first === 1 ? 1 : 0, by: 1 - (p.first === 1 ? 1 : 0) }, log = '';
      if (p.first === 1) { const m = Game.opponent(g, st, p.level, p.n * 100 + p.games); st = g.apply(st, m); log = 'C' + m; st.turn = 0; }
      return { go: 0, pile: st.pile, phase: 1, log, msg: p.first === 1 ? '电脑先取了 ' + (log.slice(1)) + ' 颗' : '你先取', take: 0 };
    }
    if (k === 'take') {
      if (!(v > 0)) return { take: 0 };
      if (p.phase !== 1) return { take: 0, msg: '先点“开始一局”' };
      if (v > p.k || v > p.pile) return { take: 0, msg: '一次最多取 ' + Math.min(p.k, p.pile) + ' 颗' };
      const g = nimGame(p.k, p.last === 1); let st = { pile: p.pile, turn: 0, by: 1 }; st = g.apply(st, v); let log = p.log + (p.log ? ',' : '') + 'M' + v;
      if (g.over(st)) return nimEnd(p, st, g, log, 0);
      st.turn = 1; const m = Game.opponent(g, st, p.level, p.pile * 7 + p.games * 13 + v); st = g.apply(st, m); log += ',C' + m;
      if (g.over(st)) return nimEnd(p, st, g, log, 1);
      return { pile: st.pile, log, take: 0, msg: '你取 ' + v + '，电脑取 ' + m + '，还剩 ' + st.pile };
    }
    if (k === 'tm') {
      if (!(v > 0)) return { tm: 0 };
      const i = Math.floor((v - 1) / 3), m = (v - 1) % 3; if (i > p.n) return { tm: 0 };
      let t = (p.tbl || '').padEnd(p.n + 1, '.').slice(0, p.n + 1).split(''); t[i] = '.WL'[m]; return { tbl: t.join(''), tm: 0 };
    }
    if (k === 'gwin') return null;
    return null;
  };
  function nimEnd(p, st, g, log, by) {
    const iWon = g.winner({ pile: 0, turn: 0, by: by === 0 ? 0 : 1 }) === 0 ? true : false;   // by 0 = 我取了最后一颗
    const win = (by === 0) === (p.last !== 1);
    return { pile: 0, phase: 2, log, take: 0, games: p.games + 1, streak: win ? p.streak + 1 : 0, s2: win && p.level === 2 ? p.s2 + 1 : (p.level === 2 ? 0 : p.s2), wins: p.wins + (win ? 1 : 0), msg: win ? '你赢了' : '电脑赢了' };
  }
  function nimJudge(p) {
    const truth = nimTruth(p.n, p.k, p.last === 1), tbl = (p.tbl || '').padEnd(p.n + 1, '.'); let ok = 0; while (ok <= p.n && tbl[ok] === truth[ok]) ok++;
    const firstWins = truth[p.n] === 'W' ? 1 : 0;
    return { truth, tbl, tableOk: ok, full: ok === p.n + 1 ? 1 : 0, firstWins, lv: ok === p.n + 1 ? 3 : p.s2 >= 3 ? 2 : p.games ? 1 : 0 };
  }
  function nimDraw(c) {
    const p = c.props, J = nimJudge(p), W = c.w, H = []; let s = '';
    s += K.text(10, 18, '一堆 ' + p.n + ' 颗，每次取 1 到 ' + p.k + ' 颗，' + (p.last === 1 ? '取到最后一颗的输' : '取到最后一颗的赢') + '　难度 ' + p.level, { size: 11.5, anchor: 'start', weight: 700 });
    const cols = Math.min(p.n, 15), r = 7;
    for (let i = 0; i < p.pile; i++) s += K.circle(16 + (i % cols) * 17, 40 + Math.floor(i / cols) * 17, r, { fill: 'var(--accent)' });
    let y = 40 + Math.max(1, Math.ceil(Math.max(p.pile, 1) / cols)) * 17 + 6;
    s += K.text(10, y, p.phase === 0 ? '点“开始一局”' : '还剩 ' + p.pile + ' 颗　' + (p.msg || ''), { size: 12, anchor: 'start', weight: 700, fill: p.phase === 2 ? (p.msg === '你赢了' ? 'var(--good)' : 'var(--bad)') : 'var(--ink)' }); y += 10;
    if (p.phase === 1) for (let i = 1; i <= p.k; i++) { const x = 10 + (i - 1) * 56, live = i <= p.pile; s += K.rect(x, y, 50, 24, { fill: live ? 'var(--accent)' : 'var(--sel-bg)', r: 6 }) + K.text(x + 25, y + 16, '取 ' + i, { size: 12, weight: 700, fill: live ? '#fff' : 'var(--dim)' }); if (live) hit(H, x, y, 50, 24, 'take', i); }
    else { s += K.rect(10, y, 100, 24, { fill: 'var(--good)', r: 6 }) + K.text(60, y + 16, p.phase === 2 ? '再来一局' : '开始一局', { size: 12, weight: 700, fill: '#fff' }); hit(H, 10, y, 100, 24, 'go', 1); s += K.text(124, y + 16, '连赢 ' + p.streak + ' 局（对难度 2 连赢 ' + p.s2 + '）', { size: 11, anchor: 'start', fill: 'var(--dim)' }); }
    y += 40;
    s += K.text(10, y, '局面表：只剩 i 颗、轮到你取，你必胜（胜）还是必败（败）？点格子换标记', { size: 11, anchor: 'start', weight: 700 }); y += 8;
    const cw = Math.min(22, Math.floor((W - 20) / Math.min(p.n + 1, 16)));
    for (let i = 0; i <= p.n; i++) {
      const x = 10 + (i % 16) * cw, yy = y + Math.floor(i / 16) * (cw + 14), m = J.tbl[i], col = m === 'W' ? 'var(--good)' : m === 'L' ? 'var(--bad)' : 'var(--card)';
      s += K.text(x + cw / 2, yy + 9, String(i), { size: 9, fill: 'var(--dim)' }) + K.rect(x, yy + 11, cw - 2, cw - 4, { fill: col, stroke: 'var(--dim)', w: 0.8, r: 3 }) + K.text(x + cw / 2 - 1, yy + 11 + cw / 2, m === 'W' ? '胜' : m === 'L' ? '败' : '', { size: 10, weight: 700, fill: '#fff' });
      hit(H, x, yy + 11, cw - 2, cw - 4, 'tm', i * 3 + ((m === 'W' ? 1 : m === 'L' ? 2 : 0) + 1) % 3 + 1);
    }
    y += Math.ceil((p.n + 1) / 16) * (cw + 14) + 10;
    s += K.text(10, y, c.masked ? '先猜：先手能必赢吗？（填“我猜”）' : '表对到第 ' + J.tableOk + ' 个（共 ' + (p.n + 1) + ' 个）', { size: 11.5, anchor: 'start', weight: 700, fill: J.full ? 'var(--good)' : 'var(--dim)' });
    return s + H.join('');
  }
  const nimDef = {
    workspaceRole: 'none', handles: true, compactPorts: true, essence: ['E6', 'E9', 'E5'], label: '取石子', prefix: '石', group: '关系', grades: [2, 9], alias: ['取石子', '博弈', '游戏', '必胜策略', '对弈'],
    props: {
      n: { type: 'int', label: '一共几颗（5–30）', default: 10, min: 5, max: 30 }, k: { type: 'int', label: '每次最多取几颗（2–5）', default: 2, min: 2, max: 5 },
      first: { type: 'choice', label: '谁先', default: 0, choices: ['我先', '电脑先'] }, level: { type: 'int', label: '电脑的难度（0 随机，1 偶尔走错，2 总走最好的）', default: 1, min: 0, max: 2 },
      last: { type: 'choice', label: '规则', default: 0, choices: ['取到最后的赢', '取到最后的输'] }, gwin: { type: 'int', label: '先猜：先手赢吗（1 赢 2 输）', default: 0, min: 0, max: 2 },
      pile: { hidden: true, type: 'int', label: '现在还剩', default: 0, min: 0, max: 30, write: false }, phase: { hidden: true, type: 'int', label: '阶段', default: 0, min: 0, max: 2, write: false },
      go: { hidden: true, type: 'int', label: '开始', default: 0, min: 0, max: 1 }, take: { hidden: true, type: 'int', label: '我取几颗', default: 0, min: 0, max: 5 }, tm: { hidden: true, type: 'int', label: '点表格', default: 0, min: 0, max: 99 },
      tbl: { hidden: true, type: 'text', label: '局面表', default: '', write: false }, log: { hidden: true, type: 'text', label: '这一局', default: '', write: false }, msg: { hidden: true, type: 'text', label: '提示', default: '', write: false },
      games: { hidden: true, type: 'int', label: '下了几局', default: 0, min: 0, max: 999, write: false }, wins: { hidden: true, type: 'int', label: '赢了几局', default: 0, min: 0, max: 999, write: false },
      streak: { hidden: true, type: 'int', label: '连赢', default: 0, min: 0, max: 999, write: false }, s2: { hidden: true, type: 'int', label: '对难度 2 连赢', default: 0, min: 0, max: 999, write: false },
    },
    onSet: nimOnSet,
    guess: { props: ['gwin'], ports: ['firstWins'], answered: (p) => p.gwin > 0 },
    outputs: {
      won: { dim: null, kind: 'num', label: '这局赢了（1/0）' }, streak: { dim: null, kind: 'num', label: '连赢几局' }, s2: { dim: null, kind: 'num', label: '对难度 2 连赢几局' },
      tableOk: { dim: null, kind: 'num', label: '表对到第几个' }, full: { dim: null, kind: 'num', label: '表全对（1/0）' }, firstWins: { dim: null, kind: 'num', label: '先手必赢（1/0）' }, lv: { dim: null, kind: 'num', label: '证据等级' },
    },
    icon: () => K.circle(20, 38, 7, { fill: 'var(--accent)' }) + K.circle(36, 38, 7, { fill: 'var(--accent)' }) + K.circle(28, 24, 7, { fill: 'var(--accent)' }),
    size: (c) => [380, 190 + Math.ceil(Math.max(c.props.pile, 1) / Math.min(c.props.n, 15)) * 17 + Math.ceil((c.props.n + 1) / 16) * 36],
    compute: (c) => {
      const p = c.props, J = nimJudge(p); c.say(p.phase === 2 && p.msg === '你赢了' ? 'ok' : 'info', p.msg || '点“开始一局”');
      return { won: num(p.phase === 2 && p.msg === '你赢了' ? 1 : 0), streak: num(p.streak), s2: num(p.s2), tableOk: num(J.tableOk), full: num(J.full), firstWins: num(J.firstWins), lv: num(J.lv) };
    },
    badge: (c) => (c.masked ? '？' : c.out.streak ? '连赢 ' + c.out.streak.data.n : ''),
    draw: nimDraw,
  };

  // ================= 汉诺塔 =================
  const hStart = (n) => { let a = ''; for (let i = n; i >= 1; i--) a += i; return a + ';;'; };
  const hPegs = (s, n) => { const P = String(s || '').split(';').map((x) => x.split('').map(Number)); return P.length === 3 && P.reduce((a, x) => a + x.length, 0) === n ? P : hPegs(hStart(n), n); };
  const hOnSet = (p, k, v) => {
    if (k === 'n') return { pegs: hStart(v), moves: 0, sel: 0, msg: '', t1: 0, t2: 0, t3: 0, t4: 0 };
    if (k === 'reset') return { pegs: hStart(p.n), moves: 0, sel: 0, msg: '重新开始', reset: 0 };
    if (k === 'mv') {
      if (!(v > 0)) return { mv: 0 };
      const P = hPegs(p.pegs, p.n);
      if (!p.sel) { if (!P[v - 1].length) return { mv: 0, msg: '这根柱子上没有盘' }; return { mv: 0, sel: v, msg: '选了第 ' + v + ' 根，再点要放到哪根' }; }
      if (p.sel === v) return { mv: 0, sel: 0, msg: '' };
      const d = P[p.sel - 1][P[p.sel - 1].length - 1], top = P[v - 1][P[v - 1].length - 1];
      if (top !== undefined && top < d) return { mv: 0, sel: 0, msg: '大盘不能压在小盘上' };
      P[p.sel - 1].pop(); P[v - 1].push(d);
      return { mv: 0, sel: 0, pegs: P.map((a) => a.join('')).join(';'), moves: p.moves + 1, msg: '' };
    }
    return null;
  };
  const hJudge = (p) => {
    const P = hPegs(p.pegs, p.n), min = 2 ** p.n - 1, done = P[2].length === p.n ? 1 : 0;
    let tok = 0; for (let i = 1; i <= 4; i++) if (p['t' + i] === 2 ** i - 1) tok++; else break;
    return { P, min, done, optimal: done && p.moves === min ? 1 : 0, tok, guessed: p.gmin === min ? 1 : 0 };
  };
  const hDraw = (c) => {
    const p = c.props, J = hJudge(p), W = c.w, H = []; let s = '', pw = (W - 20) / 3;
    const dh = Math.min(16, 100 / Math.max(p.n, 3));
    for (let i = 0; i < 3; i++) {
      const cx = 10 + pw * i + pw / 2, sel = p.sel === i + 1;
      s += K.rect(10 + pw * i + 4, 14, pw - 8, 130, { fill: sel ? 'var(--sel-bg)' : 'none', stroke: sel ? 'var(--accent)' : 'var(--dim)', w: sel ? 2.5 : 0.8, r: 6 }) + K.line(cx, 24, cx, 136, { stroke: 'var(--dim)', w: 3 });
      J.P[i].forEach((d, j) => { const w = 14 + d * ((pw - 30) / p.n); s += K.rect(cx - w / 2, 136 - (j + 1) * dh, w, dh - 2, { fill: 'hsl(' + d * 45 + ',60%,60%)', r: 3 }); });
      s += K.text(cx, 158, '第 ' + (i + 1) + ' 根', { size: 10.5, fill: 'var(--dim)' }); hit(H, 10 + pw * i + 4, 14, pw - 8, 130, 'mv', i + 1);
    }
    s += K.text(10, 178, '走了 ' + p.moves + ' 步' + (c.masked ? '（先猜：最少几步？）' : '，最少要 ' + J.min + ' 步') + '　' + (p.msg || ''), { size: 11.5, anchor: 'start', weight: 700, fill: J.optimal ? 'var(--good)' : 'var(--ink)' });
    if (J.done && !c.masked) s += K.text(10, 196, J.optimal ? '用最少的步数搬完了' : '搬完了，但多走了 ' + (p.moves - J.min) + ' 步', { size: 11.5, anchor: 'start', weight: 700, fill: J.optimal ? 'var(--good)' : 'var(--bad)' });
    s += K.rect(W - 80, 168, 70, 20, { fill: 'var(--sel-bg)', r: 5 }) + K.text(W - 45, 182, '重来', { size: 11.5, weight: 700 }); hit(H, W - 80, 168, 70, 20, 'reset', 1);
    s += K.text(10, 218, '填表：n 个盘最少几步？（在右边 t1 到 t4 里写）　已对 ' + J.tok + ' 个', { size: 11, anchor: 'start', fill: 'var(--dim)' });
    return s + H.join('');
  };
  const hanoiDef = {
    workspaceRole: 'none', handles: true, compactPorts: true, essence: ['E6', 'E9'], label: '汉诺塔', prefix: '塔', group: '关系', grades: [4, 9], alias: ['汉诺塔', '递推', '2的n次方', '找规律', '移盘子'],
    props: {
      n: { type: 'int', label: '几个盘（1–7）', default: 3, min: 1, max: 7 }, gmin: { type: 'int', label: '先猜：最少几步', default: 0, min: 0, max: 200 },
      pegs: { hidden: true, type: 'text', label: '三根柱子', default: '321;;', write: false }, moves: { hidden: true, type: 'int', label: '走了几步', default: 0, min: 0, max: 9999, write: false }, sel: { hidden: true, type: 'int', label: '选中的柱子', default: 0, min: 0, max: 3, write: false },
      mv: { hidden: true, type: 'int', label: '点柱子', default: 0, min: 0, max: 3 }, reset: { hidden: true, type: 'int', label: '重来', default: 0, min: 0, max: 1 }, msg: { hidden: true, type: 'text', label: '提示', default: '', write: false },
      t1: { type: 'int', label: '填表：1 个盘', default: 0, min: 0, max: 99999 }, t2: { type: 'int', label: '填表：2 个盘', default: 0, min: 0, max: 99999 }, t3: { type: 'int', label: '填表：3 个盘', default: 0, min: 0, max: 99999 }, t4: { type: 'int', label: '填表：4 个盘', default: 0, min: 0, max: 99999 },
    },
    onSet: hOnSet,
    guess: { props: ['gmin'], ports: ['min', 'optimal'], answered: (p) => p.gmin > 0 },
    outputs: {
      moves: { dim: null, kind: 'num', label: '走了几步' }, min: { dim: null, kind: 'num', label: '最少几步' }, done: { dim: null, kind: 'num', label: '搬完了（1/0）' }, optimal: { dim: null, kind: 'num', label: '用最少步数搬完（1/0）' },
      tableOk: { dim: null, kind: 'num', label: '表填对了几个' }, guessed: { dim: null, kind: 'num', label: '猜对最少步数（1/0）' },
    },
    icon: () => K.rect(14, 40, 36, 6, { fill: 'var(--accent)', r: 2 }) + K.rect(20, 32, 24, 6, { fill: 'var(--good)', r: 2 }) + K.rect(26, 24, 12, 6, { fill: 'var(--bad)', r: 2 }),
    size: () => [380, 260],
    compute: (c) => { const J = hJudge(c.props); c.say(J.optimal ? 'ok' : 'info', J.done ? (J.optimal ? '用最少步数搬完了' : '搬完了，但不是最少') : '点一根柱子拿起最上面的盘，再点另一根放下'); return { moves: num(c.props.moves), min: num(J.min), done: num(J.done), optimal: num(J.optimal), tableOk: num(J.tok), guessed: num(J.guessed) }; },
    badge: (c) => (c.masked ? '？' : c.out.moves ? c.out.moves.data.n + ' 步' : ''),
    draw: hDraw,
  };

  // ================= 一笔画 =================
  // 图：点坐标（0–1）和边 [a, b]（点编号从 0 起）
  const GRAPHS = [
    { name: '日', v: [[0, 0], [1, 0], [0, 0.5], [1, 0.5], [0, 1], [1, 1]], e: [[0, 1], [0, 2], [1, 3], [2, 3], [2, 4], [3, 5], [4, 5]] },
    { name: '田', v: [[0, 0], [0.5, 0], [1, 0], [0, 0.5], [0.5, 0.5], [1, 0.5], [0, 1], [0.5, 1], [1, 1]], e: [[0, 1], [1, 2], [3, 4], [4, 5], [6, 7], [7, 8], [0, 3], [3, 6], [1, 4], [4, 7], [2, 5], [5, 8]] },
    { name: '七桥', v: [[0.5, 0.05], [0.1, 0.5], [0.9, 0.5], [0.5, 0.95]], e: [[0, 1], [0, 1], [0, 2], [0, 2], [0, 3], [1, 3], [2, 3]] },
    { name: '五角星', v: [[0.5, 0], [0.98, 0.35], [0.8, 0.95], [0.2, 0.95], [0.02, 0.35]], e: [[0, 2], [2, 4], [4, 1], [1, 3], [3, 0]] },
    { name: '信封', v: [[0, 1], [1, 1], [0, 0.4], [1, 0.4], [0.5, 0]], e: [[0, 1], [0, 2], [1, 3], [2, 3], [2, 4], [3, 4], [0, 3], [1, 2]] },
  ];
  const ex = (s) => String(s || '').split(',').filter(Boolean).map((t) => t.split('-').map(Number));
  // 当前的边：图库的边（去掉删掉的）+ 学生加的边；每条边有稳定的编号（图库的 0.. ，加的 100..）
  function edgesOf(p) {
    const G0 = GRAPHS[p.graph], rm = new Set(String(p.rm || '').split(',').filter(Boolean).map(Number)), r = [];
    G0.e.forEach((e, i) => { if (!rm.has(i)) r.push({ id: i, a: e[0], b: e[1] }); });
    ex(p.extra).forEach((e, i) => r.push({ id: 100 + i, a: e[0], b: e[1] }));
    return r;
  }
  function eulerStats(nv, E) {
    const deg = new Array(nv).fill(0); E.forEach((e) => { deg[e.a]++; deg[e.b]++; });
    const used = deg.map((d, i) => (d > 0 ? i : -1)).filter((i) => i >= 0); let conn = 1;
    if (used.length) { const seen = new Set([used[0]]); let ch = true; while (ch) { ch = false; for (const e of E) if (seen.has(e.a) !== seen.has(e.b)) { seen.add(e.a); seen.add(e.b); ch = true; } } conn = used.every((i) => seen.has(i)) ? 1 : 0; }
    const odd = deg.filter((d) => d % 2).length;
    return { deg, odd, possible: E.length && conn && (odd === 0 || odd === 2) ? 1 : 0, conn };
  }
  // 穷举一笔画的走法（小图）：返回一条走法（点的序列）或 null；cap 限制搜索量
  function findPath(nv, E) {
    let found = null, steps = 0; const used = new Array(E.length).fill(false);
    const dfs = (cur, path) => { if (found || ++steps > 500000) return; if (path.length === E.length + 1) { found = path.slice(); return; } for (let i = 0; i < E.length; i++) { if (used[i]) continue; const e = E[i], nx = e.a === cur ? e.b : e.b === cur ? e.a : -1; if (nx < 0) continue; used[i] = true; path.push(nx); dfs(nx, path); path.pop(); used[i] = false; } };
    for (let s0 = 0; s0 < nv && !found; s0++) dfs(s0, [s0]);
    return found;
  }
  const eOnSet = (p, k, v) => {
    if (k === 'graph') return { path: '', usedE: '', cur: 0, extra: '', rm: '', sel: 0, msg: '', showdeg: 0 };
    if (k === 'reset') return { path: '', usedE: '', cur: 0, msg: '重新画', reset: 0 };
    if (k === 'go') {
      if (!(v > 0)) return { go: 0 };
      const E = edgesOf(p), vv = v - 1;
      if (p.mode === 1) {   // 加边：点两个点
        if (!p.sel) return { go: 0, sel: v, msg: '再点要连到的点' };
        if (p.sel === v) return { go: 0, sel: 0, msg: '' };
        return { go: 0, sel: 0, extra: (p.extra ? p.extra + ',' : '') + (p.sel - 1) + '-' + vv, path: '', usedE: '', cur: 0, msg: '加了一条边' };
      }
      if (p.mode === 2) {   // 删边：点两个点，删掉它们之间编号最大的一条
        if (!p.sel) return { go: 0, sel: v, msg: '再点边的另一头' };
        const a = p.sel - 1, cand = E.filter((e) => (e.a === a && e.b === vv) || (e.a === vv && e.b === a)).pop();
        if (!cand) return { go: 0, sel: 0, msg: '这两个点之间没有边' };
        if (cand.id >= 100) { const L = ex(p.extra); L.splice(cand.id - 100, 1); return { go: 0, sel: 0, extra: L.map((e) => e.join('-')).join(','), path: '', usedE: '', cur: 0, msg: '删了一条边' }; }
        return { go: 0, sel: 0, rm: (p.rm ? p.rm + ',' : '') + cand.id, path: '', usedE: '', cur: 0, msg: '删了一条边' };
      }
      const usedIds = new Set(String(p.usedE || '').split(',').filter(Boolean).map(Number));
      if (!p.cur) return { go: 0, cur: v, path: String(vv), msg: '从这个点出发' };
      const cand = E.find((e) => !usedIds.has(e.id) && ((e.a === p.cur - 1 && e.b === vv) || (e.b === p.cur - 1 && e.a === vv)));
      if (!cand) return { go: 0, msg: '这条路走过了，或者这两个点之间没有路' };
      return { go: 0, cur: v, path: p.path + ',' + vv, usedE: (p.usedE ? p.usedE + ',' : '') + cand.id, msg: '' };
    }
    return null;
  };
  const eJudge = (p) => {
    const G0 = GRAPHS[p.graph], E = edgesOf(p), st = eulerStats(G0.v.length, E), usedN = String(p.usedE || '').split(',').filter(Boolean).length;
    return Object.assign({ G0, E, usedN, done: E.length && usedN === E.length ? 1 : 0, judged: p.gposs === 0 ? 0 : (p.gposs === 1) === (st.possible === 1) ? 1 : 0 }, st);
  };
  const eDraw = (c) => {
    const p = c.props, J = eJudge(p), W = c.w, H = [], G0 = J.G0; let s = '';
    const X = (q) => 30 + q[0] * (W - 60), Y = (q) => 22 + q[1] * 120, usedIds = new Set(String(p.usedE || '').split(',').filter(Boolean).map(Number));
    const cnt = {};
    J.E.forEach((e) => { const key = Math.min(e.a, e.b) + '-' + Math.max(e.a, e.b), i = cnt[key] = (cnt[key] || 0) + 1, A = G0.v[e.a], B = G0.v[e.b], dx = X(B) - X(A), dy = Y(B) - Y(A), len = Math.hypot(dx, dy) || 1, off = (i - 1) * 9 - ((J.E.filter((f) => Math.min(f.a, f.b) + '-' + Math.max(f.a, f.b) === key).length - 1) * 4.5); s += K.line(X(A) - dy / len * off, Y(A) + dx / len * off, X(B) - dy / len * off, Y(B) + dx / len * off, { stroke: usedIds.has(e.id) ? 'var(--accent)' : 'var(--dim)', w: usedIds.has(e.id) ? 4 : 2 }); });
    G0.v.forEach((q, i) => {
      const cur = p.cur === i + 1, sel = p.sel === i + 1;
      s += K.circle(X(q), Y(q), 10, { fill: cur ? 'var(--accent)' : 'var(--card)', stroke: sel ? 'var(--bad)' : 'var(--ink)', w: sel ? 3 : 1.5 });
      if (p.showdeg) s += K.text(X(q), Y(q) + 4, String(J.deg[i]), { size: 11, weight: 700, fill: J.deg[i] % 2 ? 'var(--bad)' : cur ? '#fff' : 'var(--ink)' });
      hit(H, X(q) - 14, Y(q) - 14, 28, 28, 'go', i + 1);
    });
    let y = 152; s += K.text(10, y, '已走 ' + J.usedN + ' / ' + J.E.length + ' 条边' + (c.masked ? '（先猜：能一笔画成吗？）' : p.showdeg ? '　奇点 ' + J.odd + ' 个' : '') + '　' + (p.msg || ''), { size: 11.5, anchor: 'start', weight: 700, fill: J.done ? 'var(--good)' : 'var(--ink)' });
    y += 8;
    [['reset', 1, '重画', 60], ['showdeg', p.showdeg ? 0 : 1, p.showdeg ? '收起点的度数' : '数每个点连几条边', 130]].forEach(([k, v, tx, w], i) => { const x = 10 + (i ? 70 : 0); s += K.rect(x, y, w, 20, { fill: 'var(--sel-bg)', r: 5 }) + K.text(x + w / 2, y + 14, tx, { size: 11, weight: 700 }); hit(H, x, y, w, 20, k, v); });
    return s + H.join('');
  };
  const eulerDef = {
    workspaceRole: 'none', handles: true, compactPorts: true, essence: ['E5', 'E9'], label: '一笔画', prefix: '笔', group: '关系', grades: [2, 9], alias: ['一笔画', '七桥问题', '奇点', '欧拉', '图论'],
    props: {
      graph: { type: 'choice', label: '图', default: 0, choices: GRAPHS.map((g) => g.name) }, mode: { type: 'choice', label: '做什么', default: 0, choices: ['画', '加边', '删边'] },
      gposs: { type: 'int', label: '先猜：能一笔画成吗（1 能 2 不能）', default: 0, min: 0, max: 2 }, showdeg: { hidden: true, type: 'int', label: '显示每个点的度数', default: 0, min: 0, max: 1 },
      go: { hidden: true, type: 'int', label: '点一个点', default: 0, min: 0, max: 99 }, reset: { hidden: true, type: 'int', label: '重画', default: 0, min: 0, max: 1 },
      cur: { hidden: true, type: 'int', label: '现在在哪个点', default: 0, min: 0, max: 99, write: false }, sel: { hidden: true, type: 'int', label: '选中的点', default: 0, min: 0, max: 99, write: false },
      path: { hidden: true, type: 'text', label: '走过的点', default: '', write: false }, usedE: { hidden: true, type: 'text', label: '走过的边', default: '', write: false }, extra: { hidden: true, type: 'text', label: '加的边', default: '' }, rm: { hidden: true, type: 'text', label: '删的边', default: '' }, msg: { hidden: true, type: 'text', label: '提示', default: '', write: false },
    },
    onSet: eOnSet,
    guess: { props: ['gposs'], ports: ['possible'], answered: (p) => p.gposs > 0 },
    outputs: {
      done: { dim: null, kind: 'num', label: '画完了（1/0）' }, odd: { dim: null, kind: 'num', label: '奇点个数' }, possible: { dim: null, kind: 'num', label: '能一笔画成（1/0）' },
      judged: { dim: null, kind: 'num', label: '“能 / 不能”判断对了（1/0）' }, edges: { dim: null, kind: 'num', label: '边数' }, used: { dim: null, kind: 'num', label: '走了几条边' },
    },
    icon: () => K.circle(14, 14, 4, { fill: 'var(--ink)' }) + K.circle(50, 14, 4, { fill: 'var(--ink)' }) + K.circle(32, 50, 4, { fill: 'var(--ink)' }) + K.line(14, 14, 50, 14, {}) + K.line(50, 14, 32, 50, {}) + K.line(32, 50, 14, 14, {}),
    size: () => [380, 215],
    compute: (c) => { const J = eJudge(c.props); c.say(J.done ? 'ok' : 'info', J.done ? '一笔画完了' : c.props.msg || '点一个点出发，再点相邻的点走过去'); return { done: num(J.done), odd: num(J.odd), possible: num(J.possible), judged: num(J.judged), edges: num(J.E.length), used: num(J.usedN) }; },
    badge: (c) => (c.out.done && Q.num(c.out.done.data) ? '画完了' : c.masked ? '？' : ''),
    draw: eDraw,
  };

  U.registerPack({ id: 'games', version: 1, needs: [], types: { nim: nimDef, hanoi: hanoiDef, euler: eulerDef } });
  U.Games = { nimTruth, GRAPHS, edgesOf, eulerStats, findPath, nimGame };
})(typeof globalThis !== 'undefined' ? globalThis : window);
