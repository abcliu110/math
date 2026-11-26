/* 通用记录仪（docs/knob-graph-and-gallery.md“三、通用记录仪”）：任何操作台都能开“📈 记下来”，不改操作台自己的代码。
 * 做法是包装器：操作台注册时（bench: true、用 compute 算、属性名和输出口名不和记录仪撞），自动加上
 *   属性（都藏着，跟着存档、撤销、重放走）：
 *     rcfg 题目给的配置（JSON；空着就是没开）   rclog 记下的点（横,竖,这一组;…）   rcg 猜的第几格（−1 没猜）
 *     rcpeek 不猜，直接看   rcgok / rcgtry 猜对 / 猜了几次   rcall 全部试一遍   rcpick 追问选了第几个
 *   输出（给里程碑判分，名字和四个手写的记录仪一样）：pts gok gtry all q1 q2；先猜的时候，配置里的那个输出口不给
 *   画法：台面下面接一块“记下来”：旋钮的 − +、记下来、坐标图、追问；先猜的时候台面盖上“先猜一猜”，只露出旋钮
 *   尺寸：卡片加高；把手：先猜的时候收起来；标题栏读数：先猜的时候不写
 *   onSet：拧了旋钮或换了 keep 里的属性，猜的清掉；拧旋钮时再把 reset 里的属性复位
 * rcfg 空着时，操作台和以前一模一样（输出口不画，卡片不变高，界面见 stage-cards.js 和 howto.js 的 outOrder）。
 * 配置（build 里写 U.Recorder.props({ … })）：
 *   knob 旋钮（整数属性）  out 读哪个输出口（数）  keep 这一组不动的属性  range [最小, 最大]（旋钮只在这里拧）
 *   guess 'values'（只放能出现的值，一格一个）| 数（格子间隔，落在最近的一格算对）| 省略（能出现的值不超过 12 个用 values，否则自动定间隔）
 *   asks ['题干|选项|*对的选项', …]（最多 2 个）  names [横轴叫什么, 竖轴叫什么]（可选，默认用属性和输出口的名字）
 *   done { 属性: 值 }（可选：全部试一遍、判猜按“做完的样子”算，'$' 是旋钮的值）  reset { 属性: 值 }（可选：拧旋钮时一起复位）  mark 'max'（可选：最高的点画成绿的）
 * 操作台可以声明 recHide: true：先猜时不盖台面，draw 和 grips 收到 c.recHidden，自己藏答案（篱笆围地只把面积写成“？”）。
 * 这一版的边界（如实写）：一个旋钮、一个输出；整数旋钮；有状态的操作台（step）不包；和记录仪撞名的操作台（换一换、分一分、跳格钟、带追问的研究台）不包。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit, RS = K.research;
  const HD = 28, ROW = 34, GH = 236, MINW = 660, MIN_PTS = 3, ALL_PTS = 5, VALUES_MAX = 12, CELLS_MAX = 16, SPAN_MAX = 100;
  const STEPS = [1, 2, 5, 10, 20, 25, 50, 100, 200, 500, 1000];
  const T = (label, d) => ({ type: 'text', label, default: d === undefined ? '' : d, write: true, hidden: true });
  const PROPS = {
    rcfg: T('记录仪：题目给的配置'), rclog: T('记录仪：记下的点（横,竖,这一组;…）'),
    rcg: { type: 'int', label: '记录仪：猜的第几格（−1 没猜）', default: -1, min: -1, max: 999, write: true, hidden: true },
    rcpeek: { type: 'bool', label: '记录仪：不猜，直接看', default: false, write: true, hidden: true },
    rcgok: { type: 'int', label: '记录仪：猜对几次', default: 0, min: 0, max: 99, write: true, hidden: true },
    rcgtry: { type: 'int', label: '记录仪：猜了几次', default: 0, min: 0, max: 99, write: true, hidden: true },
    rcall: { type: 'bool', label: '记录仪：全部试一遍', default: false, write: true, hidden: true },
    rcpick: T('记录仪：追问选了第几个'),
  };
  const OUTS = {
    pts: '图上有几个点（这一组的）', gok: '先猜再看，猜对几次', gtry: '先猜再看，猜了几次', all: '全部试一遍了：1 是，0 否', q1: '追问 1 选了第几个', q2: '追问 2 选了第几个',
  };
  const CFG_KEYS = ['knob', 'out', 'keep', 'range', 'guess', 'asks', 'names', 'done', 'reset', 'mark'];
  const num = (n) => U.val('num', Q(n), { dim: null });
  const int = (v, d) => (Number.isInteger(+v) && String(v).trim() !== '' ? +v : d);
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const round = (v) => Math.round(v * 1e6) / 1e6;
  // 数写给孩子看：整数照写；小数最多两位；负号用 −
  const fmt = (v) => (v === null || v === undefined ? '？' : String(Number.isInteger(v) ? v : Math.round(v * 100) / 100).replace('-', '−'));
  // “一共几个数（配对才有）”→“一共几个数”；“篱笆：一共几米”→“一共几米”
  const clean = (s) => { const a = String(s || '').replace(/（[^）]*）|\([^)]*\)/g, '').trim(), i = a.lastIndexOf('：'); if (i < 0) return a; const r = a.slice(i + 1).trim(); return r && !/^\d/.test(r) ? r : a.slice(0, i).trim(); };
  const isRc = (k) => Object.prototype.hasOwnProperty.call(PROPS, k);

  // ---- 配置 ----
  function check(def, r) {
    const errs = [], e = (m) => errs.push(m);
    if (!def) return ['没有这种操作台'];
    if (!r || typeof r !== 'object' || Array.isArray(r)) return ['配置要是一个对象'];
    for (const k of Object.keys(r)) if (!CFG_KEYS.includes(k)) e('不认识的配置：' + k + '（只认 ' + CFG_KEYS.join('、') + '）');
    const P = def.props[r.knob];
    if (!P || isRc(r.knob) || !(P.type === 'int' || P.type === 'num')) e('knob 要是这台操作台的整数属性：' + r.knob);
    const O = def.outputs[r.out];
    if (!O || O.rec || O.kind !== 'num') e('out 要是这台操作台的数的输出口：' + r.out);
    if (r.keep !== undefined && !(Array.isArray(r.keep) && r.keep.every((k) => def.props[k] && !isRc(k) && k !== r.knob))) e('keep 要是这台操作台别的属性的数组');
    const g = r.range;
    if (!(Array.isArray(g) && g.length === 2 && g.every(Number.isInteger) && g[0] < g[1] && g[1] - g[0] <= SPAN_MAX)) e('range 要是 [最小, 最大] 两个整数，最多跨 ' + SPAN_MAX);
    else if (P && ((P.min !== undefined && g[0] < P.min) || (P.max !== undefined && g[1] > P.max))) e('range 超出了旋钮「' + P.label + '」的范围');
    if (r.guess !== undefined && r.guess !== 'values' && !(typeof r.guess === 'number' && r.guess > 0)) e("guess 要是 'values' 或者正数（格子间隔）");
    if (r.asks !== undefined) {
      if (!Array.isArray(r.asks) || r.asks.length > 2) e('asks 最多 2 个');
      else r.asks.forEach((a, i) => { const o = String(a).split('|').slice(1); if (typeof a !== 'string' || /~/.test(a) || o.length < 2 || o.filter((x) => x[0] === '*').length !== 1) e('asks 第 ' + (i + 1) + ' 个要写成“题干|选项|*对的选项”，正好一个 *'); });
    }
    if (r.names !== undefined && !(Array.isArray(r.names) && r.names.length === 2 && r.names.every((x) => typeof x === 'string' && x))) e('names 要是 [横轴名, 竖轴名]');
    if (r.mark !== undefined && r.mark !== 'max') e("mark 只认 'max'（最高的点画成绿的）");
    for (const k of ['done', 'reset']) {
      const o = r[k]; if (o === undefined) continue;
      if (!o || typeof o !== 'object' || Array.isArray(o) || !Object.keys(o).every((p) => def.props[p] && !isRc(p) && p !== r.knob)) e(k + ' 要是 { 别的属性: 值 }');
    }
    return errs;
  }
  const cache = new Map();
  function cfgOf(def, s) {
    if (!s) return null;
    const key = def.id + '\u0001' + s;
    if (cache.has(key)) return cache.get(key);
    let c = null;
    try { const r = JSON.parse(s); if (!check(def, r).length) c = norm(def, r); } catch (x) { c = null; }
    if (cache.size > 300) cache.clear();
    cache.set(key, c);
    return c;
  }
  function norm(def, r) {
    const nm = r.names || [];
    return { knob: r.knob, out: r.out, keep: r.keep || [], lo: r.range[0], hi: r.range[1], guess: r.guess, asks: (r.asks || []).join('~'),
      xn: nm[0] || clean(def.props[r.knob].label), yn: nm[1] || clean(def.outputs[r.out].label), done: r.done || {}, reset: r.reset || {}, mark: r.mark || '' };
  }

  // ---- 读数：用操作台自己的 compute 算（纯函数，给它一份新的 ctx） ----
  function read(B, def, cfg, q) {
    const inp = {}; for (const k in def.inputs) inp[k] = [];
    let o = null;
    try { o = B.compute({ ent: { id: 'rec', type: def.id, props: q }, props: q, inp, t: 0, n: 0, seed: 1, say() {}, kids: () => [] }); } catch (x) { o = null; }
    const v = o && o[cfg.out];
    if (!v || v.kind !== 'num' || !v.data || typeof v.data !== 'object') return null;
    const f = Q.num(v.data); return Number.isFinite(f) ? round(f) : null;
  }
  // 旋钮拧到 x、按“做完的样子”算出来的结果（全部试一遍、判猜用）
  function solve(B, def, cfg, p, x) {
    const q = Object.assign({}, p, { [cfg.knob]: x });
    for (const k of Object.keys(cfg.done)) q[k] = cfg.done[k] === '$' ? x : cfg.done[k];
    return read(B, def, cfg, q);
  }
  // 这一组：keep 里的属性现在的值
  const sigOf = (cfg, p) => cfg.keep.map((k) => String(p[k] === undefined ? '' : p[k]).replace(/[,;/]/g, '_')).join('/');
  function parseLog(s) {
    const out = [], seen = new Set();
    for (const e of String(s || '').split(';')) {
      const m = /^(-?\d+),(-?\d+(?:\.\d+)?),(.*)$/.exec(e); if (!m) continue;
      const key = m[1] + ',' + m[3]; if (seen.has(key)) continue; seen.add(key);
      out.push({ x: +m[1], y: +m[2], sig: m[3] });
    }
    return out;
  }
  const logStr = (log) => log.map((a) => a.x + ',' + a.y + ',' + a.sig).join(';');

  // 现在的样子。full：再算出画图要的（每个 x 的值、猜的格子、台面上现在的读数）
  function state(def, B, p, full) {
    const cfg = cfgOf(def, p && p.rcfg); if (!cfg) return null;
    const x = +p[cfg.knob], sig = sigOf(cfg, p), log = parseLog(p.rclog);
    const group = log.filter((a) => a.sig === sig).sort((a, b) => a.x - b.x);
    const has = group.some((a) => a.x === x), inRange = Number.isInteger(x) && x >= cfg.lo && x <= cfg.hi;   // 旋钮是小数（比如半径 2.5）时不记
    const gi = int(p.rcg, -1), peek = !!p.rcpeek, gok = clamp(int(p.rcgok, 0), 0, 99), gtry = clamp(int(p.rcgtry, 0), 0, 99), all = !!p.rcall;
    const ans = inRange ? solve(B, def, cfg, p, x) : null;
    const hidden = group.length >= MIN_PTS && !has && gi < 0 && !peek && ans !== null;
    const canAsk = group.length >= MIN_PTS, asks = RS.parseAsk(cfg.asks, p.rcpick, canAsk);
    const st = { cfg, x, sig, log, group, has, inRange, gi, peek, gok, gtry, all, ans, hidden, canAsk, asks };
    if (!full) return st;
    const ys = {}; for (let v = cfg.lo; v <= cfg.hi; v++) ys[v] = solve(B, def, cfg, p, v);
    const vals = [...new Set(Object.values(ys).filter((v) => v !== null))].sort((a, b) => a - b);
    const all2 = vals.concat(group.map((a) => a.y));
    let ya = Math.min(0, ...all2), yb = Math.max(1, ...all2);
    const tk = RS.tick(yb - ya); ya = Math.floor(ya / tk) * tk; yb = (Math.floor(yb / tk + 1e-9) + 1) * tk;
    let mode = cfg.guess === 'values' || (cfg.guess === undefined && vals.length <= VALUES_MAX) ? 'values' : 'grid', cells, step = 0;
    if (mode === 'values') cells = vals;
    else { step = typeof cfg.guess === 'number' ? cfg.guess : STEPS.find((g) => (yb - ya) / g <= CELLS_MAX) || STEPS[STEPS.length - 1]; cells = []; for (let v = ya; v <= yb + 1e-9; v += step) cells.push(round(v)); }
    const ansIdx = ans === null ? -1 : mode === 'values' ? cells.findIndex((v) => Math.abs(v - ans) < 1e-6) : clamp(Math.round((ans - ya) / step), 0, cells.length - 1);
    return Object.assign(st, { ys, vals, ya, yb, mode, cells, step, ansIdx, live: inRange ? read(B, def, cfg, p) : null });
  }

  // ---- 画法 ----
  function cover(W0, H0, st) {
    const c = st.cfg, cx = W0 / 2, cy = Math.max(70, Math.min(H0 / 2, 180));
    return '<g data-rec-cover="1">' + K.rect(2, 2, W0 - 4, Math.max(40, H0 + 2), { fill: '#f4f6fa', stroke: '#9fb3d1', r: 10, w: 1.5, dash: '6 4' }) +
      K.text(cx, cy - 24, '🤔 先猜一猜', { size: 20, weight: 700, fill: 'var(--blue)' }) +
      K.text(cx, cy + 6, c.xn + ' 是 ' + fmt(st.x) + ' 时，' + c.yn + '是几？', { size: 15, weight: 700 }) +
      K.text(cx, cy + 32, '在下面的图上点一格猜一猜；或者点“不猜，直接看”。猜了，台面才打开。', { size: 12, fill: '#5a6478' }) + '</g>';
  }
  function panel(def, st, p, W0, y0) {
    const c = st.cfg, xn = c.xn, yn = c.yn, n = st.group.length;
    let s = '';
    // 旋钮：− 数 +（拧了，onSet 会清掉猜的，并复位 reset 里的属性）
    const lx = 20 + RS.tw(xn) + 10, step = (v) => ({ [c.knob]: v });
    s += '<g data-rec-knob="1">' + K.text(20, y0 + 17, xn, { size: 12, weight: 700, anchor: 'start' }) +
      RS.btn(lx, y0, 26, '−', step(Math.min(Math.ceil(st.x) - 1, c.hi)), st.x > c.lo, xn + '少 1') + K.text(lx + 50, y0 + 17, fmt(st.x), { size: 14, weight: 700 }) +
      RS.btn(lx + 74, y0, 26, '+', step(Math.max(Math.floor(st.x) + 1, c.lo)), st.x < c.hi, xn + '多 1') + '</g>';
    const bx = lx + 116, can = !st.hidden && !st.has && st.inRange && st.live !== null;
    const rec = can ? { rclog: logStr(st.log.concat([{ x: st.x, y: st.live, sig: st.sig }])), rcg: -1 } : {};
    const tip = st.has ? '这个' + xn + '已经记过了' : !st.inRange ? xn + '要是 ' + c.lo + ' 到 ' + c.hi + ' 的整数' : st.hidden ? '先猜' + yn + '，或者点“不猜，直接看”' : st.live === null ? '先在台面上做出来，才知道' + yn : '把这个' + xn + '记到图上';
    s += RS.btn(bx, y0, 110, '记下来', rec, can, tip);
    if (st.hidden) s += RS.btn(bx + 120, y0, 120, '不猜，直接看', { rcpeek: true }, true, '不猜，直接看');
    // 坐标图
    const fy = y0 + ROW, fw = Math.min(W0, 720) - 28, xa = c.lo >= 1 ? c.lo - 1 : c.lo;
    const keep = c.keep.map((k) => clean(def.props[k].label) + ' = ' + (typeof p[k] === 'number' ? fmt(p[k]) : String(p[k]))).join('，');
    const P = RS.plot({ fx: 14, fy, fw, fh: GH, xa, xb: c.hi, ya: st.ya, yb: st.yb, bottom: 30, title: '📈 记下来：横着是' + xn + '，竖着是' + yn + (keep ? '（' + keep + '，不动）' : '') });
    const { X, Y, ys } = P; s += P.s;
    if (st.all) for (let v = c.lo; v <= c.hi; v++) s += st.ys[v] === null ? K.text(X(v), P.Y1 + 4, '×', { size: 10, fill: '#e6b4ab' }) : K.circle(X(v), Y(st.ys[v]), 3, { fill: '#9cc3ee', stroke: 'none' });
    const top = c.mark === 'max' && st.vals.length ? st.vals[st.vals.length - 1] : null;   // mark: 'max'：最高的点画成绿的（篱笆围地的最大面积）
    for (const a of st.group) s += '<g data-rec-pt="' + a.x + '">' + K.circle(X(a.x), Y(a.y), 5, { fill: top !== null && Math.abs(a.y - top) < 1e-6 ? '#5cb85c' : 'var(--blue)', stroke: 'var(--ink)', w: 1.1 }) + '</g>';
    if (st.inRange) s += K.line(X(st.x), P.Y0 - 4, X(st.x), P.Y1 + 2, { w: 1.4, stroke: 'var(--blue)', dash: '4 3' });
    // 猜的格子：values 是一格一个能出现的值（挨得太近的往旁边错开）；grid 是蓝线上一格一格
    const pick = (i) => ({ rcg: i, rcgtry: st.gtry + 1, rcgok: st.gok + (i === st.ansIdx ? 1 : 0) });
    if (st.hidden && st.mode === 'values') {
      const dir = st.x > (c.lo + c.hi) / 2 ? -1 : 1, last = [];
      st.cells.forEach((v, i) => {
        let k = 0; while (last[k] !== undefined && Math.abs(last[k] - Y(v)) < 16) k++; last[k] = Y(v);
        const w = Math.max(32, RS.tw(fmt(v)) + 10), cx = X(st.x) + dir * k * (w + 4);
        if (k) s += K.line(X(st.x), Y(v), cx, Y(v), { w: 1, stroke: 'var(--blue)', dash: '2 2' });
        s += '<g data-pick-set="' + encodeURIComponent(JSON.stringify(pick(i))) + '" style="cursor:pointer"><title>猜' + K.esc(yn) + ' ' + fmt(v) + '</title>' + K.rect(cx - w / 2, Y(v) - 7, w, 14, { fill: '#fff', stroke: 'var(--blue)', w: 1, r: 3 }) + K.text(cx, Y(v) + 4, fmt(v), { size: 9.5, weight: 700, fill: 'var(--blue)' }) + '</g>';
      });
    } else if (st.hidden) {
      const hh = Math.max(8, st.step * ys);
      st.cells.forEach((v, i) => { s += '<g data-pick-set="' + encodeURIComponent(JSON.stringify(pick(i))) + '" style="cursor:pointer"><title>猜' + K.esc(yn) + ' ' + fmt(v) + '</title><rect x="' + (X(st.x) - 10) + '" y="' + (Y(v) - hh / 2) + '" width="20" height="' + hh + '" fill="transparent"/>' + K.circle(X(st.x), Y(v), 2.2, { fill: '#9fb3d1' }) + '</g>'; });
    }
    const gv = st.gi >= 0 && st.gi < (st.cells || []).length ? st.cells[st.gi] : null;
    if (gv !== null && !st.has) s += K.rect(X(st.x) - 7, Y(gv) - 7, 14, 14, { fill: 'none', stroke: 'var(--blue)', w: 1.8, r: 2, dash: '3 2' });
    const right = st.gi === st.ansIdx, near = right && st.mode === 'grid' && st.live !== null && Math.abs(st.live - gv) > 1e-6;
    let say = n < MIN_PTS ? '再记 ' + (MIN_PTS - n) + ' 个，就要先猜再看（拧' + xn + '，点“记下来”）' : st.has ? '这个' + xn + '图上已经有了：换一个' + xn
      : st.hidden ? '先猜：' + xn + ' ' + fmt(st.x) + ' 时，' + yn + '是几？点蓝线上的一格'
      : gv !== null && st.live === null ? '你猜' + yn + ' ' + fmt(gv) + '：在台面上做出来看看'
      : gv !== null ? '你猜' + yn + ' ' + fmt(gv) + '，' + (right ? '猜对了！' + (near ? '（是 ' + fmt(st.live) + '，就在这一格）' : '') : '其实是 ' + fmt(st.live) + '。') + '点“记下来”'
      : !st.inRange ? xn + '要是 ' + c.lo + ' 到 ' + c.hi + ' 的整数，才能记' : st.live === null ? '在台面上做出来，“记下来”才能点' : '';
    if (st.gtry) say += (say ? '　' : '') + '猜了 ' + st.gtry + ' 次，猜对 ' + st.gok + ' 次';
    s += K.text(24, fy + 36, say, { size: 11, anchor: 'start', fill: 'var(--blue)', weight: 700 });
    s += RS.btn(14 + fw - 130, fy + 4, 116, '全部试一遍', { rcall: !st.all }, n >= ALL_PTS || st.all, n >= ALL_PTS ? (st.all ? '收起全部' : '每个' + xn + '都画上') : '图上有 ' + ALL_PTS + ' 个点以后才能全部试一遍', st.all);
    s += RS.drawAsks(fy + GH + 8, st.asks, st.canAsk, 'rcpick');
    return s;
  }
  const panelH = (cfg, p) => 14 + ROW + GH + 8 + RS.asksH(RS.parseAsk(cfg.asks, p.rcpick, false)) + 16;

  // ---- 包装 ----
  const done = new WeakSet(), orig = new WeakMap();
  function why(def) {
    if (!def || def.bench !== true) return '不是操作台';
    if (typeof def.compute !== 'function' || def.stateful) return '有状态的操作台（step）不包';
    if (def.recorder === false) return '操作台声明了 recorder: false';
    const p = Object.keys(PROPS).filter((k) => def.props[k]), o = Object.keys(OUTS).filter((k) => def.outputs[k] && !def.outputs[k].rec);
    if (p.length || o.length) return '和记录仪撞名：' + p.concat(o).join('、');
    return '';
  }
  function wrap(def) {
    if (!def || done.has(def) || why(def)) return false;
    done.add(def);
    const B = { compute: def.compute, draw: def.draw, size: def.size, grips: def.grips, badge: def.badge, onSet: def.onSet };
    orig.set(def, B);
    for (const k of Object.keys(PROPS)) def.props[k] = Object.assign({ k }, PROPS[k]);
    for (const k of Object.keys(OUTS)) def.outputs[k] = { dim: null, kind: 'num', label: OUTS[k], rec: true };
    const hideSelf = def.recHide === true;
    def.compute = function (c) {
      const o = B.compute(c), st = state(def, B, c.props, false); if (!st) return o;
      const r = Object.assign({}, o);
      if (st.hidden) delete r[st.cfg.out];
      r.pts = num(st.group.length); r.gok = num(st.gok); r.gtry = num(st.gtry); r.all = num(st.all ? 1 : 0);
      st.asks.forEach((a, i) => { if (a.pick) r['q' + (i + 1)] = num(a.pick); });
      return r;
    };
    def.draw = function (c) {
      const st = state(def, B, c.props, true); if (!st) return B.draw(c);
      const H0 = B.size(c.ent || { props: c.props })[1] - HD, W0 = Math.max(c.w || 0, B.size(c.ent || { props: c.props })[0], MINW);
      let s = B.draw(Object.assign({}, c, { rec: st, recHidden: st.hidden && hideSelf }));
      if (st.hidden && !hideSelf) s += cover(Math.min(W0, B.size(c.ent || { props: c.props })[0]), H0, st);
      return s + K.line(14, H0 + 7, W0 - 14, H0 + 7, { w: 1, stroke: '#d5dce8' }) + panel(def, st, c.props, W0, H0 + 14);   // 一条细线隔开台面和记录仪
    };
    def.size = function (e) {
      const sz = B.size(e), p = (e && e.props) || {}, cfg = cfgOf(def, p.rcfg);
      return cfg ? [Math.max(sz[0], MINW), sz[1] + panelH(cfg, p)] : sz;
    };
    if (B.grips) def.grips = function (c) { const st = state(def, B, c.props, false); if (st && st.hidden && !hideSelf) return []; return B.grips(st ? Object.assign({}, c, { rec: st, recHidden: st.hidden }) : c); };
    if (B.badge) def.badge = function (c) { const st = state(def, B, c.props, false); return st && st.hidden ? '' : B.badge(c); };
    def.onSet = function (p, k, v) {
      const base = B.onSet ? B.onSet(p, k, v) : null, cfg = cfgOf(def, p && p.rcfg);
      if (!cfg || (k !== cfg.knob && !cfg.keep.includes(k))) return base;
      return Object.assign({}, base || {}, k === cfg.knob ? cfg.reset : {}, { rcg: -1, rcpeek: false });
    };
    return true;
  }

  U.Recorder = {
    PROPS: Object.keys(PROPS), OUTS: Object.keys(OUTS), MIN_PTS, ALL_PTS,
    // build 里用：把配置写进实体属性
    props: (cfg) => ({ rcfg: JSON.stringify(cfg) }),
    check: (type, cfg) => { const d = U.types[type]; if (!d) return ['没有这种操作台：' + type]; return done.has(d) ? check(d, cfg) : [type + ' 开不了记录仪：' + why(d)]; },
    on: (props) => !!(props && props.rcfg),
    why: (type) => (done.has(U.types[type]) ? '' : why(U.types[type])),
    wrapped: (type) => done.has(U.types[type]),
    state: (type, props, full) => { const d = U.types[type]; return d && orig.has(d) ? state(d, orig.get(d), props || {}, !!full) : null; },
    fmt,
  };
  // 以后注册的操作台也包上（包是按需加载的）；已经注册的现在就包
  const define0 = U.define;
  U.define = function (id, def) { const d = define0.apply(this, arguments); if (d === def) wrap(d); return d; };
  for (const id of Object.keys(U.types)) wrap(U.types[id]);
})(typeof globalThis !== 'undefined' ? globalThis : window);
