/* 器材包 conjbench：猜想与反例。一个说法（或者一个要猜的公式），n 一个一个试：对的打 ✓，第一个不对的就是反例。
 * 全部在图上直接动手：
 *   - 猜公式的题：下面有几个候选公式，点一个，表里每一行都比一比“真的是多少”和“公式算出来是多少”。
 *   - 拖 n 的把手，或者点“下一个 n”，一个一个试；点“一直试到 100”：一路试下去，碰到第一个反例就停在那里。
 *   - 右边画“为什么”：奇数的和是一圈一圈的拐角拼成正方形；多边形从一个顶点切成三角形。
 *   - 最后自己判断：点“一定成立”或“不一定”。试了 100 个都对也只是证据，不是证明；一个反例就能推翻。
 * 这一版的边界（如实写）：说法和候选公式是出题人给的几种（不能自己写公式）；n 最多试到 100。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 700, NMAX = 100, SX = 40, SX1 = 400, SY = 330;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? +v : lo));
  const isPrime = (x) => { if (x < 2) return false; for (let d = 2; d * d <= x; d++) if (x % d === 0) return false; return true; };
  const nthPrime = (() => { const ps = []; for (let x = 2; ps.length < NMAX + 1; x++) if (isPrime(x)) ps.push(x); return (n) => ps[n - 1]; })();
  const factorText = (x) => { for (let d = 2; d * d <= x; d++) if (x % d === 0) return x + ' = ' + d + ' × ' + (x / d); return String(x); };
  // 说法：formula 类给“真值”和候选公式；always 类给每个 n 的检验
  const CLAIMS = [
    { id: 'odd', title: '前 n 个奇数的和', n0: 1, show: (n) => Array.from({ length: Math.min(n, 4) }, (_, i) => 2 * i + 1).join(' + ') + (n > 4 ? ' + … + ' + (2 * n - 1) : ''), val: (n) => n * n, pic: 'odd',
      cands: [['2n − 1', (n) => 2 * n - 1], ['2n', (n) => 2 * n], ['n + 1', (n) => n + 1], ['n²', (n) => n * n], ['n × (n + 1)', (n) => n * (n + 1)]] },
    { id: 'poly', title: 'n 边形的内角和（度）', n0: 3, show: (n) => n + ' 边形', val: (n) => (n - 2) * 180, pic: 'poly',
      cands: [['180 × n', (n) => 180 * n], ['180 × (n − 1)', (n) => 180 * (n - 1)], ['180 × (n − 2)', (n) => 180 * (n - 2)], ['360 × (n − 2)', (n) => 360 * (n - 2)]] },
    { id: 'sum3', title: '连续三个整数 n、n + 1、n + 2 的和', n0: 1, show: (n) => n + ' + ' + (n + 1) + ' + ' + (n + 2), val: (n) => 3 * n + 3,
      cands: [['3n', (n) => 3 * n], ['n + 3', (n) => n + 3], ['3n + 3', (n) => 3 * n + 3], ['3 × (n + 1)', (n) => 3 * (n + 1)]] },
    { id: 'euler', title: 'n × n + n + 41 总是质数', n0: 1, test: (n) => { const v = n * n + n + 41; return { v, ok: isPrime(v), tx: v + (isPrime(v) ? ' 是质数' : '：' + factorText(v)) }; } },
    { id: '2n1', title: '2n + 1 总是质数', n0: 1, test: (n) => { const v = 2 * n + 1; return { v, ok: isPrime(v), tx: v + (isPrime(v) ? ' 是质数' : '：' + factorText(v)) }; } },
    { id: 'primeodd', title: '质数都是奇数（第 n 个质数）', n0: 1, test: (n) => { const v = nthPrime(n); return { v, ok: v % 2 === 1, tx: v + (v % 2 ? ' 是奇数' : ' 是偶数！') }; } },
    { id: 'halfeven', title: '偶数的一半也是偶数（第 n 个偶数 2n）', n0: 1, test: (n) => { const v = 2 * n, h = n; return { v, ok: h % 2 === 0, tx: v + ' 的一半是 ' + h + (h % 2 ? '，不是偶数！' : '') }; } },
  ];
  function check(cl, pick, n) {
    if (cl.test) return cl.test(n);
    const real = cl.val(n), cd = cl.cands[pick];
    if (!cd) return { v: real, ok: null, tx: cl.show(n) + ' = ' + real };
    const f = cd[1](n); return { v: real, f, ok: f === real, tx: cl.show(n) + ' = ' + real + (f === real ? '，公式也是 ' + f : '，公式算出 ' + f) };
  }
  function model(p) {
    const cl = CLAIMS[clamp(p.claim, 0, CLAIMS.length - 1)], pick = cl.cands ? clamp(p.pick, -1, cl.cands.length - 1) : -1;
    const n = clamp(p.n, cl.n0, NMAX), upto = clamp(p.upto, 0, NMAX), tested = Math.max(n, upto), from = Math.min(n, p.from > 0 ? clamp(p.from, cl.n0, NMAX) : cl.n0);   // from：从第几个开始试过（出题人可以让学生先看到“好看”的例子）
    let cex = null; for (let k = from; k <= tested; k++) { const r = check(cl, pick, k); if (r.ok === false) { cex = k; break; } }
    const formulaReady = !cl.cands || pick >= 0;
    return { cl, pick, n, upto, tested, from, cex, cur: check(cl, pick, n), formulaReady, good: formulaReady && cex === null && tested - from + 1 >= 5 ? 1 : 0 };
  }
  // 一直试下去：从头试到 100，碰到第一个反例就停
  function scan(p) { const m = model(p); for (let k = m.cl.n0; k <= NMAX; k++) if (check(m.cl, m.pick, k).ok === false) return { n: k, upto: k, from: m.cl.n0 }; return { n: NMAX, upto: NMAX, from: m.cl.n0 }; }
  const btn = (x, y, w, label, patch, active, enabled, tip) => '<g' + (enabled ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' data-off="1"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 26, { fill: active ? 'var(--blue)' : enabled ? '#fff' : '#f1f3f6', stroke: enabled ? 'var(--blue)' : '#b8c0cc', r: 8, w: 1.5 }) + K.text(x + w / 2, y + 17, label, { size: 12, weight: 700, fill: active ? '#fff' : enabled ? 'var(--ink)' : '#5f6773' }) + '</g>';
  // “为什么”的图
  function picture(m) {
    const n = m.n; let s = '';
    if (m.cl.pic === 'odd') {
      const k = Math.min(n, 8), c = Math.min(18, 150 / k), x0 = 540, y0 = 70, cols = ['#9fb7d9', '#f5c26b', '#9fd5ad', '#f7a8a8'];
      for (let i = 0; i < k; i++) for (let j = 0; j < k; j++) s += K.rect(x0 + j * c, y0 + i * c, c - 1, c - 1, { fill: cols[Math.max(i, j) % 4], stroke: 'var(--ink)', r: 0, w: 0.6 });
      s += K.text(x0 + k * c / 2, y0 + k * c + 18, '一圈一圈的拐角拼成 ' + k + ' × ' + k, { size: 11 });
    } else if (m.cl.pic === 'poly') {
      const k = Math.min(n, 12), cx = 580, cy = 150, r = 70, pts = Array.from({ length: k }, (_, i) => [cx + r * Math.sin(2 * Math.PI * i / k), cy - r * Math.cos(2 * Math.PI * i / k)]);
      s += '<polygon points="' + pts.map((q) => q.map((v) => v.toFixed(1)).join(',')).join(' ') + '" fill="#eef3fb" stroke="var(--ink)" stroke-width="1.5"/>';
      for (let i = 2; i < k - 1; i++) s += K.line(pts[0][0], pts[0][1], pts[i][0], pts[i][1], { w: 1.2, stroke: 'var(--blue)', dash: '4 3' });
      s += K.text(cx, cy + r + 22, '从一个顶点切成 ' + (k - 2) + ' 个三角形', { size: 11 });
    }
    return s;
  }

  function draw(c) {
    const p = c.props, m = model(p), cl = m.cl; let s = '';
    s += K.text(20, 26, (cl.cands ? '猜一个公式：' : '这个说法对吗？') + cl.title, { size: 15, weight: 700, anchor: 'start' });
    if (cl.cands) cl.cands.forEach(([t], i) => { s += btn(20 + i * 92, 38, 86, t, { pick: i }, m.pick === i, true, '用这个公式试'); });
    // 表：从头几个 n 和现在的 n
    const rows = []; for (let k = m.from; k <= Math.min(m.tested, m.from + 5); k++) rows.push(k);
    if (m.cex !== null && !rows.includes(m.cex)) rows.push(m.cex);
    if (!rows.includes(m.n)) rows.push(m.n);
    rows.sort((a, b) => a - b).slice(-8).forEach((k, i) => {
      const r = check(cl, m.pick, k), y = 92 + i * 24, hot = k === m.n;
      s += '<g data-row="' + k + '">' + K.text(20, y, 'n = ' + k, { size: 12, weight: hot ? 700 : 400, anchor: 'start' }) + K.text(78, y, r.tx, { size: 12, weight: hot ? 700 : 400, anchor: 'start' }) +
        (r.ok === null ? '' : K.text(452, y, r.ok ? '✓' : '✗ 反例', { size: 13, weight: 700, anchor: 'start', fill: r.ok ? 'var(--good)' : 'var(--bad)' })) + '</g>';
    });
    s += picture(m);
    // 试一试
    const sx = (k) => SX + (k - 1) * (SX1 - SX) / (NMAX - 1);
    s += K.line(SX, SY, SX1, SY, { w: 3, stroke: '#c5ccda' }) + K.text(SX, SY - 12, 'n = ' + m.n + '（拖蓝色把手试别的 n）', { size: 12, anchor: 'start', fill: '#5a6478' });
    if (m.cex !== null) s += K.circle(sx(m.cex), SY, 5, { fill: 'var(--bad)', stroke: 'none' });
    s += btn(420, SY - 30, 96, '下一个 n', { n: Math.min(NMAX, m.n + 1) }, false, (m.formulaReady) && m.n < NMAX, 'n 加 1，再试一个');
    s += btn(522, SY - 30, 120, '一直试到 100', scan(p), false, m.formulaReady, '一路试下去，碰到第一个反例就停');
    // 结论和判断
    let msg = '';
    if (!m.formulaReady) msg = '先点一个公式';
    else if (m.cex !== null) msg = '找到反例：n = ' + m.cex + '。一个反例就能推翻“总是”。';
    else if (m.tested >= NMAX) msg = '从 ' + m.from + ' 试到 100 都成立。这是很强的证据，但还不是证明。';
    else msg = '试到 n = ' + m.tested + ' 都成立。';
    s += '<g data-msg="1">' + K.text(20, 372, msg, { size: 13, weight: 700, anchor: 'start', fill: m.cex !== null ? 'var(--bad)' : 'var(--ink)' }) + '</g>';
    s += K.text(420, 392, '你的判断：', { size: 12, anchor: 'start' }) + btn(486, 376, 80, '一定成立', { verdict: 1 }, p.verdict === 1, true, '对所有的 n 都成立') + btn(572, 376, 70, '不一定', { verdict: 2 }, p.verdict === 2, true, '有的 n 不成立');
    return s;
  }
  function grips(c) {
    const m = model(c.props); if (!m.formulaReady) return [];
    const sx = (k) => SX + (k - 1) * (SX1 - SX) / (NMAX - 1);
    return [{ id: 'n', x: sx(m.n), y: SY, r: 10, shape: 'bar-v', cursor: 'ew-resize', tip: '拖我：换一个 n 试',
      drag: (c0, q) => ({ n: clamp(Math.round((q.x - SX) / ((SX1 - SX) / (NMAX - 1))) + 1, model(c0.props).cl.n0, NMAX) }),
      say: (c1) => { const m1 = model(c1.props); return 'n = ' + m1.n + '：' + (m1.cur.ok === false ? '不成立' : '成立'); } }];
  }
  const I = (lo, hi, d, label, o) => Object.assign({ type: 'int', label, default: d, min: lo, max: hi, write: true }, o || {});
  U.registerPack({
    id: 'conjbench', version: 1,
    types: {
      conjbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E10', 'E7'],
        label: '猜想与反例', prefix: '猜想', group: '关系', grades: [4, 9],
        alias: ['猜想', '反例', '规律', '证明', '总是', '一定', '找规律', '归纳'],
        props: {
          claim: { type: 'choice', label: '哪个说法', default: 0, choices: CLAIMS.map((x) => x.title), write: true },
          pick: I(-1, 5, -1, '选了哪个公式（−1 是还没选）'), n: I(1, NMAX, 1, '现在试的 n'), upto: I(0, NMAX, 0, '一直试到了几（自动）', { hidden: true }), from: I(0, NMAX, 0, '从第几个开始试（0 是从头）', { hidden: true }),
          verdict: I(0, 2, 0, '你的判断：1 一定成立，2 不一定'),
        },
        outputs: {
          n: { dim: null, kind: 'num', label: '现在试的 n' }, tested: { dim: null, kind: 'num', label: '试到了几' }, ok: { dim: null, kind: 'num', label: '现在这个 n 成立：1 是，0 否' },
          cex: { dim: null, kind: 'num', label: '第一个反例的 n（找到了才有）' }, cexv: { dim: null, kind: 'num', label: '第一个反例那个数（找到了才有）' },
          good: { dim: null, kind: 'num', label: '公式试过的都对、至少试了 5 个：1 是，0 否' }, pick: { dim: null, kind: 'num', label: '选了哪个公式' }, verdict: { dim: null, kind: 'num', label: '你的判断' },
        },
        icon: () => K.text(32, 22, 'n = ?', { size: 12, weight: 700 }) + K.text(20, 38, '✓✓', { size: 11, weight: 700, fill: '#1f6a34' }) + K.text(42, 38, '✗', { size: 12, weight: 700, fill: '#a12a1f' }),
        size: () => [W, 432],
        grips,
        compute: (c) => {
          const m = model(c.props), o = { n: num(m.n), tested: num(m.tested), good: num(m.good), pick: num(m.pick), verdict: num(c.props.verdict || 0) };
          if (m.cur.ok !== null) o.ok = num(m.cur.ok ? 1 : 0);
          if (m.cex !== null) { o.cex = num(m.cex); o.cexv = num(check(m.cl, m.pick, m.cex).v); }
          return o;
        },
        badge: () => '',
        draw,
      },
    },
  });
  U.ConjBench = { model, scan, CLAIMS, isPrime };
})(typeof globalThis !== 'undefined' ? globalThis : window);
