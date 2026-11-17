/* 器材包 factorbench：因数与倍数。上面三个标签页，点着换。
 *   - 找因数：n 个小方块，点“每行几个”（1、2、3……）把它们排成一行一行。正好排满就是一个长方形：每行个数 × 行数 = n，两个都是因数，记下来；
 *     排不满，最后一行多出来的标红。全部找到以后写出 n 有几个因数、是质数还是合数。
 *   - 公因数：1 到较小的数，一个一个点着试：分别写出能不能整除 a、b，两个都能整除的是公因数；最大的那个是最大公因数。
 *   - 公倍数：两条跳跳线，一条每次跳 a，一条每次跳 b。点上面一条的落点：下面那条也落在这里，就是公倍数；最小的那个是最小公倍数。
 * 这一版的边界（如实写）：找因数的 n 不超过 100；公因数、公倍数的两个数不超过 40。分解质因数、约分在“质因数积木”里。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 700;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? Math.round(+v) : lo));
  const MODES = ['找因数', '公因数', '公倍数'];
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
  function draw(c) {
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
        },
        outputs: {
          found: { dim: null, kind: 'num', label: '找因数：找到几个' }, count: { dim: null, kind: 'num', label: '找因数：一共几个（找全了才有）' }, prime: { dim: null, kind: 'num', label: '质数 1，合数 0（找全了才有）' },
          gcd: { dim: null, kind: 'num', label: '最大公因数（公因数找全了才有）' }, lcm: { dim: null, kind: 'num', label: '最小公倍数（点中了才有）' },
        },
        icon: () => [0, 1, 2, 3, 4, 5].map((i) => K.rect(8 + (i % 3) * 13, 10 + Math.floor(i / 3) * 13, 11, 11, { fill: '#9fc3ea', stroke: 'var(--ink)', r: 1, w: 1 })).join('') + K.text(28, 50, '2 × 3', { size: 9, weight: 700 }),
        size: () => [W, 400],
        grips: () => [],
        compute: (c) => {
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
