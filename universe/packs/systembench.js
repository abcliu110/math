/* 器材包 systembench：两架天平（二元一次方程组）。docs/instrument-design.md 第 10 节之后加的操作台。
 * 上下两架天平，都是平的。盘里有圆盒（x）、方盒（y）和砝码（每个重 1）；圆盒都一样重，方盒都一样重，重量藏着。
 * 全部在图上直接动手：
 *   - 把一架天平拖到另一架上：
 *       · 如果这一架已经是“一个盒子 = …”（盒子单独在一边），就是代入：把另一架里的这种盒子全换成和它一样重的东西；
 *       · 否则是消元：从另一架的两个盘里，各拿走这一架两个盘里的东西（它们一样重，所以拿走以后还是平的）。拿不出来就说明原因。
 *   - 盘里的盒子、砝码可以一个一个拖走：拖走左盘的一个，右盘里同样的一个跟着走（两边同时减）。另一个盘里没有同样的东西就拿不了。
 *   - 从下面的托盘往一架天平上拖：两个盘各加一个（两边同时加）。
 *   - 拖的时候（还没松手）画面就画出这一下会带来什么：哪些东西被拿走、两边各拿走多少、为什么还是平的。
 *   - 每架天平旁边的按钮：翻倍、平分、两边各拿走同样的东西。
 * 旁边的式子跟着变。两个盒子的重量都知道了，就解出来了。
 * 只动一边（2026-11-26 加）：下面的开关把“两个盘连着”关掉以后，拖出来的东西只拿走这一个、拖到另一个盘就是挪过去，托盘里的东西只加到放下的那个盘。
 *   这时天平会歪：按出题人设的真实重量（x0、y0）比两个盘，重的一边往下沉，式子写成 “>” 或 “<”，旁边写“歪了：左盘重”。
 *   歪的天平不能拿去消元或代入（它没说两边一样重），会被拦住并说明；往歪的天平上做两边一样的事（消元、翻倍、平分、两边拿走）可以，歪的方向不变。
 *   歪着的天平上“一个盒子 = 几”不算解出来。
 * 这一版的边界（如实写）：只有正整数个盒子和砝码，画不出负数：盒子的重量、砝码的个数都不能是负的，所以解是负数的方程组摆不出来；
 *   系数是负数的方程要先移项写成两边都是加号（x − y = 1 摆成 x = y + 1）。每个盘最多 6 个圆盒、6 个方盒、30 个砝码。
 *   歪只说歪向哪边，不说差多少（差多少要用到藏着的重量）。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 680, BH = 172, BX = 210, ARM = 110, PW = 170, BMAX = 6, CMAX = 30;
  const top = (i) => 14 + i * BH;
  const parse = (t) => { const a = String(t || '').split(/[,，]/).map((s) => Number(s.trim())); return a.length === 6 && a.every((n) => Number.isInteger(n) && n >= 0) ? a : [0, 0, 0, 0, 0, 0]; };   // [左x, 左y, 左砝码, 右x, 右y, 右砝码]
  const ser = (e) => e.join(',');
  const fits = (e) => e[0] <= BMAX && e[1] <= BMAX && e[3] <= BMAX && e[4] <= BMAX && e[2] <= CMAX && e[5] <= CMAX;
  const sideStr = (x, y, c) => { const a = []; if (x) a.push((x === 1 ? '' : x) + 'x'); if (y) a.push((y === 1 ? '' : y) + 'y'); if (c || !a.length) a.push(String(c)); return a.join(' + '); };
  // t：0 平，1 左盘重（写 >），−1 右盘重（写 <）
  const eqStr = (e, t) => sideStr(e[0], e[1], e[2]) + (t > 0 ? ' > ' : t < 0 ? ' < ' : ' = ') + sideStr(e[3], e[4], e[5]);
  // 真实重量（出题人设的 x0、y0）；没有设（比如“换一换”台借用这台的画法）就当它一直是平的
  const weightsOf = (p) => (p && p.x0 !== undefined && p.y0 !== undefined && Number.isFinite(+p.x0) && Number.isFinite(+p.y0) ? [+p.x0, +p.y0] : null);
  const lean = (e, w) => { if (!w) return 0; const L = e[0] * w[0] + e[1] * w[1] + e[2], R = e[3] * w[0] + e[4] * w[1] + e[5]; return L > R ? 1 : L < R ? -1 : 0; };
  const synced = (p) => p.sync !== false && p.sync !== 0;
  const TILT = 10;   // 歪的时候横梁一头往下几像素
  // 盒子单独在一边：返回 { v: 0（x）或 1（y）, expr: [x, y, c] }（另一边的东西，里面不含这种盒子）
  function isolated(e) {
    for (const [a, b] of [[0, 3], [3, 0]]) {
      for (const v of [0, 1]) {
        if (e[a + v] === 1 && e[a + 1 - v] === 0 && e[a + 2] === 0 && e[b + v] === 0) return { v, expr: [e[b], e[b + 1], e[b + 2]] };
      }
    }
    return null;
  }
  const known = (e) => { const s = isolated(e); return s && s.expr[0] === 0 && s.expr[1] === 0 ? { v: s.v, n: s.expr[2] } : null; };
  // 从 t 里拿走 s（左盘拿左盘的、右盘拿右盘的；不行就把 s 左右对调再试）
  function subtract(t, s) {
    for (const ss of [s, [s[3], s[4], s[5], s[0], s[1], s[2]]]) { const r = t.map((n, i) => n - ss[i]); if (r.every((n) => n >= 0)) return r; }
    return null;
  }
  function substitute(t, iso) {
    const r = t.slice();
    for (const a of [0, 3]) { const k = r[a + iso.v]; if (!k) continue; r[a + iso.v] = 0; r[a] += k * iso.expr[0]; r[a + 1] += k * iso.expr[1]; r[a + 2] += k * iso.expr[2]; }
    return r;
  }
  const scale = (e, k) => e.map((n) => n * k);
  const divisor = (e) => { for (let k = 6; k >= 2; k--) if (e.every((n) => n % k === 0) && e.some((n) => n > 0)) return k; return 0; };
  // 两边都有的东西，一次全拿走
  function cancel(e) { const r = e.slice(); let any = false; for (const j of [0, 1, 2]) { const m = Math.min(r[j], r[j + 3]); if (m) { r[j] -= m; r[j + 3] -= m; any = true; } } return any ? r : null; }
  // 把一架天平（from）拖到另一架（to）上：返回 { e: 新的 to, how } 或 { why }
  // leans（可不给）：两架天平各歪不歪；歪的那架不能拿去用
  function dropOn(es, from, to, leans) {
    if (leans && leans[from]) return { why: '这架天平是歪的：它没说两边一样重，不能拿它去消元或代入。先把它弄平' };
    const s = es[from], t = es[to], iso = isolated(s);
    if (iso && (t[iso.v] || t[3 + iso.v])) { const r = substitute(t, iso); return fits(r) ? { e: r, how: '代入：把' + (iso.v ? '方盒' : '圆盒') + '换成 ' + sideStr(iso.expr[0], iso.expr[1], iso.expr[2]) } : { why: '换完以后盘里放不下了' }; }
    const r = subtract(t, s);
    if (r) return { e: r, how: '消元：两边各拿走一样重的东西' };
    return { why: '另一架的盘里没有这么多东西可以拿走：试试先把这一架翻倍，或者先把那一架化简' };
  }
  function model(p) {
    const es = [parse(p.e0), parse(p.e1)], val = [null, null], w = weightsOf(p), leans = es.map((e) => lean(e, w));
    es.forEach((e, i) => { const k = leans[i] ? null : known(e); if (k && val[k.v] === null) val[k.v] = k.n; });
    return { es, x: val[0], y: val[1], leans };
  }

  const boxX = (x, y) => K.circle(x + 11, y + 11, 11, { fill: '#f5c26b', stroke: '#8a5a00', w: 1.6 }) + K.text(x + 11, y + 16, 'x', { size: 13, weight: 700, fill: '#5a3a00' });
  const boxY = (x, y) => K.rect(x, y, 22, 22, { fill: '#8fd19e', stroke: '#1f6a34', r: 3, w: 1.6 }) + K.text(x + 11, y + 16, 'y', { size: 13, weight: 700, fill: '#123f1e' });
  const wt = (x, y) => K.rect(x, y, 11, 11, { fill: '#9fb7d9', stroke: '#2f4a73', r: 2, w: 1 });
  // 盘里每样东西放在哪
  function layout(cx, y, nx, ny, nc) {
    const o = { xs: [], ys: [], cs: [] }; let x = cx - PW / 2 + 4;
    for (let i = 0; i < nx; i++) { o.xs.push({ x, y: y - 24 }); x += 24; }
    for (let i = 0; i < ny; i++) { o.ys.push({ x, y: y - 24 }); x += 24; }
    const cols = Math.max(1, Math.floor((cx + PW / 2 - 4 - x) / 12));
    for (let i = 0; i < nc; i++) o.cs.push({ x: x + (i % cols) * 12, y: y - 13 - Math.floor(i / cols) * 12 });
    return o;
  }
  const things = (cx, y, nx, ny, nc) => { const l = layout(cx, y, nx, ny, nc); return l.xs.map((q) => boxX(q.x, q.y)).join('') + l.ys.map((q) => boxY(q.x, q.y)).join('') + l.cs.map((q) => wt(q.x, q.y)).join(''); };
  const pan = (cx, y, nx, ny, nc) => K.rect(cx - PW / 2, y, PW, 6, { fill: 'var(--ink)', r: 3 }) + things(cx, y, nx, ny, nc);
  const PANX = [BX - ARM, BX + ARM], PY = (i) => top(i) + 104, TRAY = top(2) + 18;
  const panY = (i, a, t) => PY(i) + (a ? -t : t) * TILT;   // 第 i 架的左盘（a = 0）或右盘（a = 1）；t 是歪的方向
  const KIND = ['x', 'y', 'c'], KNAME = ['圆盒', '方盒', '砝码'], KSYM = ['x', 'y', '1'];
  const itemSvg = (j, x, y) => (j === 0 ? boxX(x - 11, y - 11) : j === 1 ? boxY(x - 11, y - 11) : wt(x - 5.5, y - 5.5));
  const balAt = (q) => { for (const i of [0, 1]) if (q.y >= top(i) && q.y <= top(i) + BH - 12) return i; return -1; };
  const panAt = (i, q) => { if (balAt(q) !== i || q.y > PY(i) + 18 || q.y < PY(i) - 62) return -1; for (const a of [0, 1]) if (Math.abs(q.x - PANX[a]) <= PW / 2 + 8) return a; return -1; };
  const unit = (j) => { const u = [0, 0, 0, 0, 0, 0]; u[j] = 1; u[j + 3] = 1; return u; };

  // 这一下拖动会做什么：返回 { patch: 要改的属性, fx: 画面上要表现的事 }
  function plan(p0, gid, q) {
    const es = [parse(p0.e0), parse(p0.e1)], ok = (i, e) => ({ ['e' + i]: ser(e), steps: p0.steps + 1, msg: '' }), no = (why) => ({ msg: why, refused: p0.refused + 1 });
    const w = weightsOf(p0), leans = es.map((e) => lean(e, w)), lone = !synced(p0), SIDE = ['左盘', '右盘'];
    // 只动一边以后会不会歪：写在说明里
    const after = (i, e) => { const t = lean(e, w); return t ? '天平歪了：' + SIDE[t > 0 ? 0 : 1] + '重，往下沉' : '天平是平的'; };
    if (gid[0] === 'b') {   // 整架天平拖到另一架上
      const i = +gid[1], to = 1 - i, fx = { carry: i };
      if (balAt(q) !== to) return { patch: { msg: '' }, fx };
      const r = dropOn(es, i, to, leans);
      if (r.why) return { patch: no(r.why), fx: Object.assign(fx, { i: to, refuse: true }) };
      const iso = isolated(es[i]), sub = !!(iso && (es[to][iso.v] || es[to][3 + iso.v]));
      if (sub) return { patch: ok(to, r.e), fx: Object.assign(fx, { i: to, sub: iso, note: r.how }) };
      const rem = es[to].map((n, k) => n - r.e[k]);
      return { patch: ok(to, r.e), fx: Object.assign(fx, { i: to, rem, lab: [0, 3].map((a) => { const tx = sideStr(rem[a], rem[a + 1], rem[a + 2]); return '− ' + (tx.includes('+') ? '(' + tx + ')' : tx); }), note: '那一架说 ' + eqStr(es[i]) + '：两边拿走的一样重，所以还是平的' }) };
    }
    if (gid[0] === 't') {   // 从托盘往一架天平上拖：两边各加一个
      const j = KIND.indexOf(gid[1]), i = balAt(q), fx = { item: j };
      if (i < 0) return { patch: { msg: '' }, fx };
      if (lone) {   // 只加到放下的那个盘
        const a = panAt(i, q);
        if (a < 0) return { patch: { msg: '' }, fx };
        const e = es[i].slice(); e[a * 3 + j]++;
        if (!fits(e)) return { patch: no('盘里放不下了'), fx: Object.assign(fx, { i, refuse: true }) };
        return { patch: ok(i, e), fx: Object.assign(fx, { i, lab: a ? ['', '+ ' + KSYM[j]] : ['+ ' + KSYM[j], ''], note: '只往' + SIDE[a] + '加了 1 个' + KNAME[j] + '：' + after(i, e) }) };
      }
      const e = es[i].map((n, k) => n + unit(j)[k]);
      if (!fits(e)) return { patch: no('盘里放不下了'), fx: Object.assign(fx, { i, refuse: true }) };
      return { patch: ok(i, e), fx: Object.assign(fx, { i, twin: true, lab: ['+ ' + KSYM[j], '+ ' + KSYM[j]], note: '两边同时加上 1 个' + KNAME[j] + '：还是平的' }) };
    }
    // 盘里的一样东西：拖出自己的盘，另一个盘里同样的一个跟着走
    const i = +gid[1], a = gid[2] === 'L' ? 0 : 1, j = KIND.indexOf(gid[3]), fx = { item: j };
    if (panAt(i, q) === a) return { patch: { msg: '' }, fx: null };
    if (lone) {   // 只动这一个：拖到另一个盘是挪过去，拖到别处是拿走
      const e = es[i].slice(), move = panAt(i, q) === 1 - a; e[a * 3 + j]--; if (move) e[(1 - a) * 3 + j]++;
      if (!fits(e)) return { patch: no('盘里放不下了'), fx: Object.assign(fx, { i, refuse: true }) };
      const lab = ['', '']; lab[a] = '− ' + KSYM[j]; if (move) lab[1 - a] = '+ ' + KSYM[j];
      return { patch: ok(i, e), fx: Object.assign(fx, { i, lab, note: (move ? '把 1 个' + KNAME[j] + '从' + SIDE[a] + '挪到' + SIDE[1 - a] : '只从' + SIDE[a] + '拿走 1 个' + KNAME[j]) + '：' + after(i, e) }) };
    }
    if (!es[i][(1 - a) * 3 + j]) return { patch: no('另一个盘里没有' + KNAME[j] + '：只拿这一边天平会歪，所以拿不了' + (p0.sync !== undefined ? '（想看它歪，点下面的开关改成只动一边）' : '')), fx: Object.assign(fx, { i, refuse: true }) };
    return { patch: ok(i, es[i].map((n, k) => n - unit(j)[k])), fx: Object.assign(fx, { i, twin: true, lab: ['− ' + KSYM[j], '− ' + KSYM[j]], note: '两边同时拿走 1 个' + KNAME[j] + '：还是平的' }) };
  }
  const setBtn = (x, y, w, label, patch, on, tip) => '<g' + (on ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' opacity="0.38"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 24, { fill: '#fff', stroke: on ? 'var(--blue)' : '#8a94a8', r: 7, w: 1.5 }) + K.text(x + w / 2, y + 16, label, { size: 12, weight: 700 }) + '</g>';

  function draw(c) {
    const p = c.props, m = model(p); let s = '';
    const dg = c.drag ? plan(c.drag.p0, c.drag.grip, c.drag) : null, fx = dg && dg.fx;
    m.es.forEach((e, i) => {
      const t = m.leans[i], y0 = top(i), by = y0 + 34, py = y0 + 104, k = t ? null : known(e), key = 'e' + i, pys = [panY(i, 0, t), panY(i, 1, t)];
      const step = (ne) => ({ [key]: ser(ne), steps: p.steps + 1, msg: '' });
      const src = fx && fx.carry === i, hit = fx && fx.i === i;
      s += K.rect(8, y0, W - 16, BH - 12, { fill: 'none', stroke: src ? 'var(--blue)' : hit && fx.refuse ? 'var(--bad)' : hit ? 'var(--good)' : '#c5ccda', r: 10, w: src || hit ? 2 : 1 });
      s += K.line(BX, by, BX, py + 26, { w: 4 }) + K.line(BX - 36, py + 28, BX + 36, py + 28, { w: 5 }) + '<g data-beam="' + t + '">' + K.line(BX - ARM, by + t * TILT, BX + ARM, by - t * TILT, { w: 5, stroke: t ? 'var(--bad)' : 'var(--good)' }) + '</g>';
      [0, 1].forEach((a) => { const cx = PANX[a], hy = by + (a ? -t : t) * TILT; s += K.line(cx, hy, cx - PW / 2 + 8, pys[a], { w: 1 }) + K.line(cx, hy, cx + PW / 2 - 8, pys[a], { w: 1 }); });
      s += pan(BX - ARM, pys[0], e[0], e[1], e[2]) + pan(BX + ARM, pys[1], e[3], e[4], e[5]);
      // 正在拖、而且这一架会变：被拿走的东西浮在盘的上方（虚的），盘下面写两边各拿走、各加上什么
      if (hit && !fx.refuse) {
        if (fx.rem) [0, 1].forEach((a) => { const r = fx.rem.slice(a * 3, a * 3 + 3); if (r[0] + r[1] + r[2]) s += '<g data-rem="' + a + '" opacity="0.5">' + things(PANX[a], pys[a] - 58, r[0], r[1], r[2]) + '</g>' + K.line(PANX[a] - PW / 2 + 4, pys[a] - 54, PANX[a] + PW / 2 - 4, pys[a] - 54, { w: 1, stroke: 'var(--blue)', dash: '3 3' }); });
        if (fx.lab) [0, 1].forEach((a) => { if (fx.lab[a]) s += K.text(PANX[a], pys[a] + 24, fx.lab[a], { size: 14, weight: 700, fill: 'var(--blue)' }); });
        if (fx.sub) [0, 1].forEach((a) => { if (parse(c.drag.p0['e' + i])[a * 3 + fx.sub.v]) s += K.text(PANX[a], pys[a] + 24, (fx.sub.v ? 'y' : 'x') + ' → ' + sideStr(fx.sub.expr[0], fx.sub.expr[1], fx.sub.expr[2]), { size: 14, weight: 700, fill: 'var(--blue)' }); });
      }
      const tx = BX + ARM + PW / 2 + 22;
      s += K.text(tx, y0 + 30, eqStr(e, t), { size: 18, weight: 700, anchor: 'start', fill: k ? 'var(--good)' : t ? 'var(--bad)' : 'var(--ink)' });
      if (t) s += '<g data-lean="' + t + '">' + K.text(tx, y0 + 50, '歪了：' + (t > 0 ? '左盘' : '右盘') + '重，往下沉', { size: 12, anchor: 'start', fill: 'var(--bad)', weight: 700 }) + '</g>';
      if (k) s += K.text(tx, y0 + 50, (k.v ? '一个方盒' : '一个圆盒') + ' = ' + k.n, { size: 12, anchor: 'start', fill: 'var(--good)', weight: 700 });
      const dbl = scale(e, 2), dv = divisor(e), cn = cancel(e);
      s += setBtn(tx, y0 + 62, 62, '翻倍', step(dbl), fits(dbl) && e.some((n) => n > 0), '两个盘里的东西都变成 2 倍：还是平的');
      s += setBtn(tx + 68, y0 + 62, 88, dv ? '平分成 ' + dv + ' 份' : '平分', dv ? step(e.map((n) => n / dv)) : {}, !!dv, '两个盘都平分成同样的份数，各留一份');
      s += setBtn(tx, y0 + 92, 156, '两边拿走一样的东西', cn ? step(cn) : {}, !!cn, '两个盘里都有的盒子或砝码，各拿走同样多');
    });
    // 托盘：往一架天平上拖，两边各加一个
    const sy = synced(p);
    s += K.text(20, TRAY + 16, sy ? '往一架天平上拖：两个盘各加一个' : '拖到一个盘里：只加这一个', { size: 12, anchor: 'start' }) + itemSvg(0, 236, TRAY + 12) + itemSvg(1, 276, TRAY + 12) + itemSvg(2, 312, TRAY + 12);
    s += K.text(340, TRAY + 16, sy ? '盘里的东西拖出来：两个盘各拿走一个' : '盘里的东西拖出来：只拿走这一个；拖到另一个盘：挪过去', { size: 12, anchor: 'start' });
    // 开关：两个盘连着 / 只动一边（“换一换”台借用这台的画法时没有这个属性，不画）
    if (p.sync !== undefined) s += '<g data-sync="' + (sy ? 1 : 0) + '">' + setBtn(20, TRAY + 32, 300, sy ? '两个盘连着（点一下：改成只动一边）' : '只动一边，天平会歪（点一下：连起来）', { sync: !sy, msg: '' }, true, sy ? '现在拖一个，另一个盘里同样的东西跟着走。点一下改成只动一边：天平会歪。' : '现在只动一边：天平会歪。点一下把两个盘连起来。') + '</g>';
    // 正在拖的东西跟着鼠标；两边一起动的时候，另一边的那一个对称地跟着
    if (dg && fx) {
      if (fx.carry !== undefined) { const tx = eqStr(parse(c.drag.p0['e' + fx.carry])), w = tx.length * 9 + 24; s += '<g data-carry="1" opacity="0.92">' + K.rect(c.drag.x - w / 2, c.drag.y + 14, w, 26, { fill: '#fff', stroke: 'var(--blue)', r: 8, w: 1.6 }) + K.text(c.drag.x, c.drag.y + 32, tx, { size: 14, weight: 700, fill: 'var(--blue)' }) + '</g>'; }
      else {
        s += itemSvg(fx.item, c.drag.x, c.drag.y);
        if (fx.twin) { const mx = 2 * BX - c.drag.x; s += '<g data-twin="1" opacity="0.75">' + itemSvg(fx.item, mx, c.drag.y) + '</g>' + K.line(c.drag.x, c.drag.y, mx, c.drag.y, { w: 1.5, stroke: 'var(--blue)', dash: '5 4' }); }
      }
    }
    if (p.msg) s += K.text(W / 2, top(2) + 2, p.msg, { size: 13, weight: 700, fill: 'var(--bad)' });
    else if (fx && fx.note && !fx.refuse) s += K.text(W / 2, top(2) + 2, fx.note, { size: 13, weight: 700, fill: 'var(--blue)' });
    else if (m.x !== null && m.y !== null) s += K.text(W / 2, top(2) + 2, '解出来了：x = ' + m.x + '，y = ' + m.y, { size: 15, weight: 700, fill: 'var(--good)' });
    else s += K.text(W / 2, top(2) + 2, '把一架天平拖到另一架上：两边拿走一样重的东西（消元），或者把盒子换掉（代入）。盘里的东西也可以一个一个拖', { size: 12 });
    return s;
  }

  function grips(c) {
    const es = [parse(c.props.e0), parse(c.props.e1)], out = [], w = weightsOf(c.props), sy = synced(c.props);
    const mk = (id, x, y, r, o) => out.push(Object.assign({ id, x, y, r, cursor: 'grab',
      drag: (c0, q) => plan(c0.props, id, q).patch,
      say: (c1) => c1.props.msg || '' }, o));
    [0, 1].forEach((i) => {
      mk('b' + i, BX, top(i) + 34, 11, { text: '拖', tip: '把这一架拖到另一架上', say: (c1) => c1.props.msg || eqStr(parse(c1.props['e' + (1 - i)])) });
      [0, 1].forEach((a) => {
        const e = es[i], l = layout(PANX[a], panY(i, a, lean(e, w)), e[a * 3], e[a * 3 + 1], e[a * 3 + 2]), last = [l.xs[l.xs.length - 1], l.ys[l.ys.length - 1], l.cs[l.cs.length - 1]];
        last.forEach((q, j) => { if (q) mk('i' + i + (a ? 'R' : 'L') + KIND[j], q.x + (j < 2 ? 11 : 5.5), q.y + (j < 2 ? 11 : 5.5), j < 2 ? 12 : 7, { ghost: true, tip: sy ? '拖出来：两个盘各拿走一个' + KNAME[j] : '拖出来：只拿走这个' + KNAME[j] + '；拖到另一个盘：挪过去' }); });
      });
    });
    [[0, 236], [1, 276], [2, 312]].forEach(([j, x]) => mk('t' + KIND[j], x, TRAY + 12, j < 2 ? 12 : 7, { ghost: true, tip: sy ? '拖到一架天平上：两个盘各加一个' + KNAME[j] : '拖到一个盘里：只加这一个' + KNAME[j] }));
    return out;
  }

  const I = (lo, hi, d, label, o) => Object.assign({ type: 'int', label, default: d, min: lo, max: hi, write: true }, o || {});
  const T = (d, label, o) => Object.assign({ type: 'text', label, default: d, write: true }, o || {});
  U.registerPack({
    id: 'systembench', version: 1,
    types: {
      systembench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E4', 'E7'],
        label: '两架天平（方程组）', prefix: '方程组', group: '关系', grades: [5, 9],
        alias: ['方程组', '二元一次方程组', '消元', '代入', '加减消元', '代入消元', '鸡兔同笼', '天平'],
        props: {
          e0: T('1,1,0,0,0,7', '上面的天平：左盘的圆盒、方盒、砝码，右盘的圆盒、方盒、砝码（六个数）'),
          e1: T('2,1,0,0,0,10', '下面的天平：同样六个数'),
          x0: I(0, 30, 3, '圆盒的真实重量（出题人设）', { hidden: true }), y0: I(0, 30, 4, '方盒的真实重量（出题人设）', { hidden: true }),
          steps: I(0, 99, 0, '做了几步（自动记录）', { hidden: true }), refused: I(0, 99, 0, '被拦住几次（自动记录）', { hidden: true }),
          msg: T('', '提示（自动）', { hidden: true }),
          sync: { type: 'bool', label: '两个盘连着（拖一个，另一个盘里同样的东西跟着走）；关掉就只动一边，天平会歪', default: true, write: true },
        },
        outputs: {
          x: { dim: null, kind: 'num', label: '圆盒的重量（知道了才有）' }, y: { dim: null, kind: 'num', label: '方盒的重量（知道了才有）' },
          both: { dim: null, kind: 'num', label: '两个都解出来了：1 是，0 否' },
          steps: { dim: null, kind: 'num', label: '做了几步' }, refused: { dim: null, kind: 'num', label: '被拦住几次' },
          lean0: { dim: null, kind: 'num', label: '上面的天平：0 平，1 左盘重，2 右盘重' }, lean1: { dim: null, kind: 'num', label: '下面的天平：0 平，1 左盘重，2 右盘重' },
        },
        icon: () => K.line(10, 12, 54, 12, { w: 2 }) + K.line(32, 12, 32, 20, { w: 2 }) + K.line(10, 30, 54, 30, { w: 2 }) + K.line(32, 30, 32, 38, { w: 2 }) + K.circle(16, 8, 4, { fill: '#f5c26b', stroke: 'var(--ink)', w: 1 }) + K.rect(44, 22, 8, 8, { fill: '#8fd19e', stroke: 'var(--ink)', w: 1, r: 1 }),
        size: () => [W, 2 * BH + 112],
        grips,
        compute: (c) => { const m = model(c.props), o = { both: num(m.x !== null && m.y !== null ? 1 : 0), steps: num(c.props.steps), refused: num(c.props.refused), lean0: num(m.leans[0] > 0 ? 1 : m.leans[0] < 0 ? 2 : 0), lean1: num(m.leans[1] > 0 ? 1 : m.leans[1] < 0 ? 2 : 0) }; if (m.x !== null) o.x = num(m.x); if (m.y !== null) o.y = num(m.y); return o; },
        badge: () => '',
        draw,
      },
    },
  });
  U.SystemBench = { draw, grips, W, H: 2 * BH + 112, BMAX, CMAX, parse, ser, eqStr, isolated, known, subtract, substitute, scale, divisor, cancel, dropOn, model, fits, plan, layout, lean, weightsOf, synced, panY };
})(typeof globalThis !== 'undefined' ? globalThis : window);
