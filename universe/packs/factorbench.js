/* 器材包 factorbench：因数与倍数。上面三个标签页，点着换。
 *   - 找因数：n 个小方块，点“每行几个”（1、2、3……）把它们排成一行一行。正好排满就是一个长方形：每行个数 × 行数 = n，两个都是因数，记下来；
 *     排不满，最后一行多出来的标红。全部找到以后写出 n 有几个因数、是质数还是合数。
 *   - 公因数：1 到较小的数，一个一个点着试：分别写出能不能整除 a、b，两个都能整除的是公因数；最大的那个是最大公因数。
 *   - 公倍数：两条跳跳线，一条每次跳 a，一条每次跳 b。点上面一条的落点：下面那条也落在这里，就是公倍数；最小的那个是最小公倍数。
 * 这一版的边界（如实写）：找因数的 n 不超过 100；公因数、公倍数的两个数不超过 40。“质因数积木”（mode 4）：拆数（÷ 质数拆到 1）、搭数（× 质数，看因数个数）、约分（分子分母成对拿掉共有的积木）。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 700;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? Math.round(+v) : lo));
  const MODES = ['找因数', '公因数', '公倍数', '筛质数', '质因数积木'];
  const list = (t) => [...new Set(String(t || '').split(/[,，\s]+/).filter((x) => x !== '').map(Number).filter(Number.isInteger))];
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const divisors = (n) => { const d = []; for (let i = 1; i <= n; i++) if (n % i === 0) d.push(i); return d; };
  function model(p) {
    const mode = clamp(p.mode, 0, 2), n = clamp(p.n, 1, 100), w = clamp(p.w, 0, n), a = clamp(p.a, 1, 40), b = clamp(p.b, 1, 40);
    const ws = list(p.found).filter((x) => x >= 1 && x <= n && n % x === 0), fset = new Set(); ws.forEach((x) => { fset.add(x); fset.add(n / x); });
    const facs = [...fset].sort((x, y) => x - y), dn = divisors(n), allF = facs.length === dn.length;
    const g = gcd(a, b), l = a * b / g, lo = Math.min(a, b), tried = list(p.tried).filter((x) => x >= 1 && x <= lo).sort((x, y) => x - y);
    const commons = tried.filter((x) => a % x === 0 && b % x === 0), allC = commons.length === divisors(g).length;
    const L = Math.min(Math.max(2 * l, 2 * Math.max(a, b)), 160), cm = list(p.cm).filter((x) => x > 0 && x <= L && x % a === 0 && x % b === 0).sort((x, y) => x - y);
    return { mode, n, w, a, b, facs, dn, allF, ws, g, l, lo, tried, commons, allC, L, cm };
  }
  const btn = (x, y, w, label, patch, enabled, tip, active) => '<g' + (enabled ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' data-off="1"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 24, { fill: active ? 'var(--blue)' : enabled ? '#fff' : '#f1f3f6', stroke: enabled || active ? 'var(--blue)' : '#b8c0cc', r: 7, w: 1.4 }) + K.text(x + w / 2, y + 16, label, { size: 12, weight: 700, fill: active ? '#fff' : enabled ? 'var(--ink)' : '#5f6773' }) + '</g>';

  // ---------- 筛质数（mode 3）：1–N 的格子，点“划掉 k 的倍数”（k 自己留着），1 单独划掉；合数都划掉了，剩下的就是质数 ----------
  function sieveModel(p) {
    const N = +p.N === 50 ? 50 : 100, ks = [...new Set(String(p.sieved || '').split(',').filter((x) => x !== '').map(Number))].filter((k) => k >= 2 && k <= 10), one = !!p.one;
    const crossed = new Set(); if (one) crossed.add(1); ks.forEach((k) => { for (let v = 2 * k; v <= N; v += k) crossed.add(v); });
    const isP = (n) => { if (n < 2) return false; for (let d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; };
    const comps = []; for (let n = 2; n <= N; n++) if (!isP(n)) comps.push(n);
    const done = one && comps.every((n) => crossed.has(n)), primes = []; for (let n = 2; n <= N; n++) if (isP(n)) primes.push(n);
    const useless = ks.filter((k) => !isP(k));   // 合数的倍数早就被它的质因数划掉了
    return { N, ks, one, crossed, done, primes, useless };
  }
  function drawSieve(c) {
    const p = c.props, m = sieveModel(p); let s = '';
    const cs = m.N === 100 ? 30 : 34, cols = 10, X0 = 20, Y0 = 50;
    for (let n = 1; n <= m.N; n++) {
      const i = n - 1, x = X0 + (i % cols) * cs, y = Y0 + Math.floor(i / cols) * cs, x2 = m.crossed.has(n), prime = m.done && !x2;
      s += K.rect(x, y, cs - 2, cs - 2, { fill: prime ? '#d6ecff' : x2 ? '#f1f3f6' : '#fff', stroke: prime ? 'var(--blue)' : '#c5ccda', r: 3, w: prime ? 1.6 : 1 }) + K.text(x + (cs - 2) / 2, y + cs / 2 + 3, String(n), { size: 11, weight: prime ? 700 : 400, fill: x2 ? '#a0a8b8' : 'var(--ink)' });
      if (x2) s += K.line(x + 4, y + cs - 6, x + cs - 6, y + 4, { stroke: '#a12a1f', w: 1.2 });
    }
    const RX = X0 + cols * cs + 24;
    MODES.forEach((tt, i) => { s += btn(20 + i * 92, 8, 86, tt, { mode: i, msg: '' }, i !== 3, '换到“' + tt + '”', i === 3); });
    s += '<g data-pick-set="' + encodeURIComponent(JSON.stringify({ one: !m.one })) + '" style="cursor:pointer"><title>划掉 1</title>' + K.rect(RX, 46, 150, 26, { fill: m.one ? 'var(--blue)' : '#fff', stroke: 'var(--blue)', r: 7, w: 1.4 }) + K.text(RX + 75, 63, '1 不是质数：划掉', { size: 12, weight: 700, fill: m.one ? '#fff' : 'var(--ink)' }) + '</g>';
    for (let k = 2; k <= 10; k++) {
      const on = m.ks.includes(k), x = RX + ((k - 2) % 3) * 82, y = 84 + Math.floor((k - 2) / 3) * 32;
      s += '<g data-pick-set="' + encodeURIComponent(JSON.stringify({ sieved: (on ? m.ks.filter((z) => z !== k) : m.ks.concat([k])).join(',') })) + '" style="cursor:pointer"><title>划掉 ' + k + ' 的倍数</title>' + K.rect(x, y, 76, 26, { fill: on ? 'var(--blue)' : '#fff', stroke: 'var(--blue)', r: 7, w: 1.4 }) + K.text(x + 38, y + 17, k + ' 的倍数', { size: 12, weight: 700, fill: on ? '#fff' : 'var(--ink)' }) + '</g>';
    }
    if (m.useless.length) s += K.text(RX, 200, m.useless.join('、') + ' 的倍数早就划掉了：不用再划', { size: 12, anchor: 'start', fill: '#8a5a00' });
    s += K.text(RX, 226, '已经划掉 ' + m.crossed.size + ' 个', { size: 13, anchor: 'start' });
    if (m.done) s += '<g data-read="1">' + K.text(RX, 256, '剩下的都是质数：一共 ' + m.primes.length + ' 个', { size: 15, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + K.text(RX, 280, '只要划到 7：' + (m.N === 100 ? '11 × 11 = 121 已经比 100 大' : '7 × 7 = 49，下一个 11 × 11 比 50 大'), { size: 12, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
    else s += K.text(RX, 256, '还有合数没划掉', { size: 12, anchor: 'start', fill: '#5a6478' });
    return s;
  }

  // ---------- 质因数积木（mode 4）：pd > 0 约分；pn = 1 搭数；否则拆数。pk 是做过的（拆下的 / 搭上的 / 约掉的质数） ----------
  const PR = [2, 3, 5, 7, 11, 13];
  const factor = (n) => { const r = []; let x = n; for (let d = 2; d * d <= x; d++) while (x % d === 0) { r.push(d); x /= d; } if (x > 1) r.push(x); return r; };
  const ndivOf = (n) => { const c = {}; factor(n).forEach((q) => { c[q] = (c[q] || 0) + 1; }); return Object.values(c).reduce((a, e) => a * (e + 1), 1); };
  function primeModel(p) {
    const pn = clamp(p.pn, 1, 999), pd = clamp(p.pd, 0, 999), hist = String(p.pk || '').split(',').filter((x) => x !== '').map(Number).filter((q) => PR.includes(q));
    if (pd > 0) {
      const top = factor(pn), bot = factor(pd), used = [];
      for (const q of hist) { const i = top.indexOf(q), j = bot.indexOf(q); if (i < 0 || j < 0) break; top.splice(i, 1); bot.splice(j, 1); used.push(q); }
      const rn = top.reduce((a, b) => a * b, 1), rd = bot.reduce((a, b) => a * b, 1);
      return { kind: 'frac', pn, pd, used, top, bot, rn, rd, simplest: gcd(rn, rd) === 1, g: gcd(pn, pd) };
    }
    if (pn === 1) {
      const blocks = []; let v = 1; for (const q of hist) { if (v * q > 999) break; v *= q; blocks.push(q); }
      return { kind: 'build', blocks, value: v, ndiv: ndivOf(v) };
    }
    const blocks = []; let rest = pn; for (const q of hist) { if (rest % q !== 0) break; rest /= q; blocks.push(q); }
    return { kind: 'peel', pn, blocks, rest, done: rest === 1 };
  }
  const blk = (x, y, q, o) => K.rect(x, y, 40, 34, { fill: (o && o.off) ? '#eef1f6' : '#f5c26b', stroke: (o && o.off) ? '#c5ccda' : '#8a5a00', r: 5, w: 1.4 }) + K.text(x + 20, y + 22, String(q), { size: 15, weight: 700, fill: (o && o.off) ? '#8a93a3' : 'var(--ink)' }) + ((o && o.off) ? K.line(x + 4, y + 30, x + 36, y + 4, { stroke: 'var(--bad)', w: 2 }) : '');
  const prod = (a) => (a.length ? a.join(' × ') : '1');
  function drawPrime(c) {
    const p = c.props, m = primeModel(p); let s = '';
    const pick = (patch) => encodeURIComponent(JSON.stringify(patch));
    const pk = (arr) => arr.join(',');
    if (m.kind === 'peel') {
      s += K.text(20, 28, '把 ' + m.pn + ' 拆成质数积木：一块一块拆，拆到 1 为止', { size: 16, weight: 700, anchor: 'start' });
      m.blocks.forEach((q, i) => { s += blk(20 + i * 48, 56, q); });
      s += K.text(20, 120, m.pn + ' = ' + (m.blocks.length ? prod(m.blocks) + (m.done ? '' : ' × ' + m.rest) : m.pn), { size: 18, weight: 700, anchor: 'start', fill: 'var(--blue)' });
      if (!m.done) {
        s += K.text(20, 160, '还剩 ' + m.rest + '：用哪个质数去除？', { size: 13, anchor: 'start' });
        PR.forEach((q, i) => { const ok = m.rest % q === 0; s += btn(20 + i * 70, 172, 62, '÷ ' + q, ok ? { pk: pk(m.blocks.concat([q])), msg: '' } : { msg: m.rest + ' 不能被 ' + q + ' 整除：' + q + ' 不是它的因数' }, true, '除以 ' + q); });
      } else s += '<g data-read="1">' + K.text(20, 160, '拆完了：' + m.pn + ' = ' + prod(m.blocks) + '，一共 ' + m.blocks.length + ' 块，每一块都是质数', { size: 15, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
      s += btn(20, 216, 80, '退一步', { pk: pk(m.blocks.slice(0, -1)), msg: '' }, m.blocks.length > 0, '退一步') + btn(110, 216, 80, '重来', { pk: '', msg: '' }, m.blocks.length > 0, '重来');
    } else if (m.kind === 'build') {
      s += K.text(20, 28, '用质数积木搭一个数：看它有几个因数', { size: 16, weight: 700, anchor: 'start' });
      m.blocks.forEach((q, i) => { s += blk(20 + i * 48, 56, q); });
      s += K.text(20, 120, prod(m.blocks) + ' = ' + m.value, { size: 18, weight: 700, anchor: 'start', fill: 'var(--blue)' });
      const cnt = {}; m.blocks.forEach((q) => { cnt[q] = (cnt[q] || 0) + 1; }); const ks = Object.keys(cnt);
      s += '<g data-read="1">' + K.text(20, 150, m.value + ' 有 ' + m.ndiv + ' 个因数' + (ks.length ? '：' + ks.map((q) => '(' + cnt[q] + ' + 1)').join(' × ') + ' = ' + m.ndiv : ''), { size: 14, weight: 700, anchor: 'start' }) + '</g>';
      s += K.text(20, 172, '每种积木可以用 0 块到全部，选法相乘就是因数的个数', { size: 12, anchor: 'start', fill: '#5a6478' });
      PR.forEach((q, i) => { s += btn(20 + i * 70, 186, 62, '× ' + q, { pk: pk(m.blocks.concat([q])), msg: '' }, m.value * q <= 999, '乘 ' + q); });
      s += btn(20, 222, 80, '退一步', { pk: pk(m.blocks.slice(0, -1)), msg: '' }, m.blocks.length > 0, '退一步') + btn(110, 222, 80, '重来', { pk: '', msg: '' }, m.blocks.length > 0, '重来');
    } else {
      s += K.text(20, 28, '约分 ' + m.pn + '/' + m.pd + '：点分子里的一块积木，和分母里一样的一块成对拿掉', { size: 15, weight: 700, anchor: 'start' });
      const draws = (arr, used, y, top) => { let x = 80, out = ''; const u = used.slice();
        const all = arr.concat(used).sort((a, b) => a - b); const off = []; u.forEach((q) => off.push(q));
        for (const q of all) { const i = off.indexOf(q), isOff = i >= 0; if (isOff) off.splice(i, 1);
          const b = blk(x, y, q, { off: isOff });
          out += !isOff && top ? '<g data-pick-set="' + pick(m.bot.includes(q) ? { pk: pk(m.used.concat([q])), msg: '' } : { msg: '分母里没有 ' + q + ' 了，约不掉' }) + '" style="cursor:pointer"><title>约掉 ' + q + '</title>' + b + '</g>' : b; x += 48; }
        return out; };
      s += K.text(20, 82, '分子', { size: 13, weight: 700, anchor: 'start' }) + draws(m.top, m.used, 58, true);
      s += K.line(76, 104, 660, 104, { w: 2 });
      s += K.text(20, 138, '分母', { size: 13, weight: 700, anchor: 'start' }) + draws(m.bot, m.used, 114, false);
      s += K.text(20, 186, m.pn + '/' + m.pd + ' = ' + m.rn + '/' + m.rd + (m.used.length ? '（约掉了 ' + prod(m.used) + ' = ' + m.used.reduce((a, b) => a * b, 1) + '）' : ''), { size: 17, weight: 700, anchor: 'start', fill: 'var(--blue)' });
      if (m.simplest && m.used.length) s += '<g data-read="1">' + K.text(20, 214, '没有共有的积木了：' + m.rn + '/' + m.rd + ' 是最简分数。约掉的正好是最大公因数 ' + m.g, { size: 14, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
      s += btn(20, 230, 80, '退一步', { pk: pk(m.used.slice(0, -1)), msg: '' }, m.used.length > 0, '退一步') + btn(110, 230, 80, '重来', { pk: '', msg: '' }, m.used.length > 0, '重来');
    }
    if (p.msg) s += K.text(20, 290, p.msg, { size: 13, weight: 700, anchor: 'start', fill: 'var(--bad)' });
    return s;
  }
  function draw(c) {
    if (+c.props.mode === 3) return drawSieve(c);
    if (+c.props.mode === 4) return drawPrime(c);
    const p = c.props, m = model(p); let s = '';
    MODES.forEach((t, i) => { s += btn(20 + i * 92, 8, 86, t, { mode: i, msg: '' }, m.mode !== i, '换到“' + t + '”', m.mode === i); });
    if (m.mode === 0) {
      s += K.text(310, 26, m.n + ' 个小方块，每行放几个能正好排满？', { size: 14, weight: 700, anchor: 'start' });
      const set = (w) => ({ w, found: (m.n % w === 0 ? [...new Set(m.ws.concat([w]))] : m.ws).join(',') });
      for (let k = 1; k <= Math.min(12, m.n); k++) s += btn(20 + (k - 1) * 40, 44, 36, String(k), set(k), true, '每行 ' + k + ' 个', m.w === k);
      s += btn(500, 44, 40, '−', set(Math.max(1, m.w - 1)), m.w > 1, '每行少放 1 个') + K.text(565, 61, '每行 ' + (m.w || '?'), { size: 12, weight: 700 }) + btn(592, 44, 40, '+', set(Math.min(m.n, m.w + 1)), m.w < m.n, '每行多放 1 个');
      if (m.w) {
        const rows = Math.ceil(m.n / m.w), cs = Math.max(2, Math.min(16, 200 / rows, 380 / m.w)), full = m.n % m.w === 0, x0 = 30, y0 = 86;
        for (let i = 0; i < m.n; i++) { const r = Math.floor(i / m.w), col = i % m.w, extra = !full && r === rows - 1; s += K.rect(x0 + col * cs, y0 + r * cs, cs - (cs > 4 ? 1 : 0), cs - (cs > 4 ? 1 : 0), { fill: extra ? '#f4a6a0' : '#9fc3ea', stroke: cs > 4 ? '#3a4a63' : 'none', r: 1, w: 0.8 }); }
        s += K.text(430, 110, full ? '正好排满：' + m.w + ' × ' + m.n / m.w + ' = ' + m.n : '排不满：最后一行只有 ' + (m.n % m.w) + ' 个', { size: 14, weight: 700, anchor: 'start', fill: full ? 'var(--blue)' : 'var(--bad)' });
        s += K.text(430, 132, full ? m.w + ' 和 ' + m.n / m.w + ' 都是 ' + m.n + ' 的因数' : m.w + ' 不是 ' + m.n + ' 的因数', { size: 12, anchor: 'start', fill: full ? 'var(--blue)' : 'var(--bad)' });
      }
      s += K.text(430, 176, '找到的因数（' + m.facs.length + ' 个）：', { size: 13, weight: 700, anchor: 'start' }) + K.text(430, 198, m.facs.join('、') || '还没有', { size: 13, anchor: 'start' });
      if (m.allF) s += '<g data-read="1">' + K.text(430, 236, '找全了：' + m.n + ' 有 ' + m.dn.length + ' 个因数', { size: 14, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + K.text(430, 258, m.n === 1 ? '1 既不是质数也不是合数' : m.dn.length === 2 ? '只有 1 和它自己：质数' : '除了 1 和它自己还有别的：合数', { size: 13, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
      else if (m.facs.length) s += K.text(430, 236, '因数是一对一对的：试到哪里就可以停？', { size: 12, anchor: 'start', fill: '#5a6478' });
    } else if (m.mode === 1) {
      s += K.text(310, 26, m.a + ' 和 ' + m.b + ' 的公因数：一个一个试', { size: 14, weight: 700, anchor: 'start' });
      const tried = new Set(m.tried);
      for (let k = 1; k <= m.lo; k++) {
        const x = 20 + ((k - 1) % 10) * 66, y = 46 + Math.floor((k - 1) / 10) * 62, t = tried.has(k), da = m.a % k === 0, db = m.b % k === 0, both = da && db;
        const body = K.rect(x, y, 60, 54, { fill: t ? (both ? '#d6ecff' : '#f6f8fc') : '#fff', stroke: t && both ? 'var(--blue)' : '#b8c0cc', r: 7, w: t && both ? 2 : 1.2 }) + K.text(x + 30, y + 20, String(k), { size: 15, weight: 700 }) +
          (t ? K.text(x + 30, y + 36, m.a + (da ? ' ✓' : ' ✗'), { size: 10, fill: da ? '#1f6a34' : '#a12a1f' }) + K.text(x + 30, y + 48, m.b + (db ? ' ✓' : ' ✗'), { size: 10, fill: db ? '#1f6a34' : '#a12a1f' }) : '');
        s += t ? body : '<g data-pick-set="' + encodeURIComponent(JSON.stringify({ tried: m.tried.concat([k]).join(',') })) + '" style="cursor:pointer"><title>试 ' + k + '</title>' + body + '</g>';
      }
      const y = 46 + Math.ceil(m.lo / 10) * 62 + 16;
      s += K.text(20, y, '公因数：' + (m.commons.join('、') || '还没有'), { size: 14, weight: 700, anchor: 'start' });
      if (m.allC) s += '<g data-read="1">' + K.text(20, y + 26, '找全了：最大公因数是 ' + m.g, { size: 15, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + K.text(20, y + 48, '公因数正好都是 ' + m.g + ' 的因数', { size: 12, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
    } else {
      s += K.text(310, 26, m.a + ' 和 ' + m.b + ' 的公倍数：点上面的落点', { size: 14, weight: 700, anchor: 'start' });
      const X0 = 40, X1 = 660, Xv = (v) => X0 + (X1 - X0) * v / m.L, YA = 110, YB = 200, cms = new Set(m.cm);
      s += K.line(X0, YA, X1, YA, { w: 2 }) + K.line(X0, YB, X1, YB, { w: 2 }) + K.text(X0 - 8, YA - 20, '每次跳 ' + m.a, { size: 12, weight: 700, anchor: 'start', fill: '#c0392b' }) + K.text(X0 - 8, YB + 34, '每次跳 ' + m.b, { size: 12, weight: 700, anchor: 'start', fill: '#2f6db5' });
      for (let v = m.a; v <= m.L; v += m.a) s += '<path d="M' + Xv(v - m.a) + ' ' + YA + ' Q' + Xv(v - m.a / 2) + ' ' + (YA - 26) + ' ' + Xv(v) + ' ' + YA + '" fill="none" stroke="#c0392b" stroke-width="1.4"/>';
      for (let v = m.b; v <= m.L; v += m.b) s += '<path d="M' + Xv(v - m.b) + ' ' + YB + ' Q' + Xv(v - m.b / 2) + ' ' + (YB + 26) + ' ' + Xv(v) + ' ' + YB + '" fill="none" stroke="#2f6db5" stroke-width="1.4"/>';
      for (let v = m.b; v <= m.L; v += m.b) s += K.circle(Xv(v), YB, 4, { fill: '#2f6db5' }) + K.text(Xv(v), YB - 8, String(v), { size: 9, fill: '#2f6db5' });
      for (let v = m.a; v <= m.L; v += m.a) {
        const common = v % m.b === 0, on = cms.has(v);
        const body = K.circle(Xv(v), YA, on ? 8 : 6, { fill: on ? 'var(--blue)' : '#fff', stroke: '#c0392b', w: 2 }) + K.text(Xv(v), YA + 20, String(v), { size: 10, weight: 700, fill: '#c0392b' }) + (on ? K.line(Xv(v), YA + 8, Xv(v), YB - 6, { stroke: 'var(--blue)', w: 2, dash: '4 3' }) : '');
        s += on ? body : '<g data-pick-set="' + encodeURIComponent(JSON.stringify(common ? { cm: m.cm.concat([v]).join(','), msg: '' } : { msg: v + ' 不是 ' + m.b + ' 的倍数：下面那条跳不到 ' + v })) + '" style="cursor:pointer"><title>点 ' + v + '</title>' + K.circle(Xv(v), YA, 11, { fill: 'transparent' }) + body + '</g>';
      }
      s += K.text(20, 266, '公倍数：' + (m.cm.join('、') || '还没有'), { size: 14, weight: 700, anchor: 'start' });
      if (p.msg) s += K.text(20, 292, p.msg, { size: 13, weight: 700, anchor: 'start', fill: 'var(--bad)' });
      if (m.cm.includes(m.l)) s += '<g data-read="1">' + K.text(20, 318, '两条线第一次落在同一点：最小公倍数是 ' + m.l, { size: 15, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + K.text(20, 340, '公倍数都是 ' + m.l + ' 的倍数：' + m.l + '、' + 2 * m.l + '……', { size: 12, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
    }
    return s;
  }
  const I = (lo, hi, d, label, o) => Object.assign({ type: 'int', label, default: d, min: lo, max: hi, write: true }, o || {});
  U.registerPack({
    id: 'factorbench', version: 1,
    types: {
      factorbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E2', 'E6'],
        label: '因数与倍数', prefix: '因数倍数', group: '数与运算', grades: [4, 6],
        alias: ['因数', '倍数', '质数', '合数', '公因数', '最大公因数', '公倍数', '最小公倍数', '找因数', '拼长方形'],
        props: {
          mode: { type: 'choice', label: '做什么', default: 0, choices: MODES, write: true },
          n: I(1, 100, 12, '找因数：几个小方块'), w: I(0, 100, 0, '找因数：每行几个'), found: { type: 'text', label: '找因数：排满过的每行个数', default: '', write: true },
          a: I(1, 40, 12, '第一个数'), b: I(1, 40, 18, '第二个数'), tried: { type: 'text', label: '公因数：试过的数', default: '', write: true }, cm: { type: 'text', label: '公倍数：点中的公倍数', default: '', write: true },
          msg: { type: 'text', label: '提示（自动）', default: '', write: true, hidden: true },
          N: I(50, 100, 100, '筛质数：到几（50 或 100）'), sieved: { type: 'text', label: '筛质数：划了哪些数的倍数（自动）', default: '', write: true }, one: { type: 'bool', label: '筛质数：划掉了 1', default: false, write: true },
          pn: I(1, 999, 36, '质因数积木：要拆的数（1 是搭数；约分时是分子）'), pd: I(0, 999, 0, '质因数积木：约分的分母（0 不约分）'), pk: { type: 'text', label: '质因数积木：做过的（自动）', default: '', write: true },
        },
        outputs: {
          found: { dim: null, kind: 'num', label: '找因数：找到几个' }, count: { dim: null, kind: 'num', label: '找因数：一共几个（找全了才有）' }, prime: { dim: null, kind: 'num', label: '质数 1，合数 0（找全了才有）' },
          gcd: { dim: null, kind: 'num', label: '最大公因数（公因数找全了才有）' }, lcm: { dim: null, kind: 'num', label: '最小公倍数（点中了才有）' }, primes: { dim: null, kind: 'num', label: '筛质数：剩下几个质数（筛完才有）' }, rest: { dim: null, kind: 'num', label: '质因数积木：还剩几没拆' }, blocks: { dim: null, kind: 'num', label: '质因数积木：几块' }, split: { dim: null, kind: 'num', label: '质因数积木：拆完了 1（拆完才有）' }, value: { dim: null, kind: 'num', label: '质因数积木：搭出的数' }, ndiv: { dim: null, kind: 'num', label: '质因数积木：搭出的数有几个因数' }, rn: { dim: null, kind: 'num', label: '约分：现在的分子' }, rd: { dim: null, kind: 'num', label: '约分：现在的分母' }, simplest: { dim: null, kind: 'num', label: '约分：约成最简了 1（约过才有）' }, crossed: { dim: null, kind: 'num', label: '筛质数：划掉了几个' },
        },
        icon: () => [0, 1, 2, 3, 4, 5].map((i) => K.rect(8 + (i % 3) * 13, 10 + Math.floor(i / 3) * 13, 11, 11, { fill: '#9fc3ea', stroke: 'var(--ink)', r: 1, w: 1 })).join('') + K.text(28, 50, '2 × 3', { size: 9, weight: 700 }),
        size: () => [W, 400],
        grips: () => [],
        compute: (c) => {
          if (+c.props.mode === 4) { const q = primeModel(c.props); if (q.kind === 'peel') { const o = { rest: num(q.rest), blocks: num(q.blocks.length) }; if (q.done) o.split = num(1); return o; } if (q.kind === 'build') return { value: num(q.value), ndiv: num(q.ndiv), blocks: num(q.blocks.length) }; const o = { rn: num(q.rn), rd: num(q.rd) }; if (q.simplest && q.used.length) o.simplest = num(1); return o; }
          if (+c.props.mode === 3) { const q = sieveModel(c.props), o = { crossed: num(q.crossed.size) }; if (q.done) o.primes = num(q.primes.length); return o; }
          const m = model(c.props), o = { found: num(m.facs.length) };
          if (m.allF) { o.count = num(m.dn.length); if (m.n > 1) o.prime = num(m.dn.length === 2 ? 1 : 0); }
          if (m.allC) o.gcd = num(m.g);
          if (m.cm.includes(m.l)) o.lcm = num(m.l);
          return o;
        },
        badge: () => '',
        draw,
      },
    },
  });
  U.FactorBench = { model };
})(typeof globalThis !== 'undefined' ? globalThis : window);
