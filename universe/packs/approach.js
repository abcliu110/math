/* 器材包 approach：逼近器（docs/new-instruments.md 5.4）。一步一步靠近一个到不了的数，看差距怎样变小。
 *   四个场景：取一半（1/2 + 1/4 + … → 1，差恰好是 1/2ⁿ）；割圆（圆内接正多边形边数翻倍 → π，同时给外切多边形的上界，夹在中间，是近似值）；
 *   0.999…（多写一个 9，差是 1/10ⁿ）；逼近 √2（二分：区间端点都是精确的有理数，宽度是 1/2ⁿ）。
 *   先猜：一直做下去，会到吗？会超过吗？点“下一步”看图和数一起变；再说一个很小的数 ε，答“差距要走几步才比它小”（极限的定义，用游戏碰到）。
 * 和设计文档的差别（如实写）：没有接时钟自动走（点“下一步”）；“夹在中间找不到数”的追问没做，只显示上下界和差。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const SC = ['取一半', '割圆', '0.999…', '逼近 √2'];
  const num = (n, ex) => U.val('num', typeof n === 'number' ? Q(n) : n, ex === false ? { dim: null, exact: false } : { dim: null });
  const apx = (x) => Q.fromNumber(+x.toFixed(8));
  const two = (n) => Q(1, 2n ** BigInt(n)), ten = (n) => Q(1, 10n ** BigInt(n));
  // 第 n 步的状态：{ lo, hi, exact, target }，lo ≤ 目标 ≤ hi；value 取 lo
  function at(scene, n) {
    if (scene === 0) return { lo: Q.sub(Q(1), two(n)), hi: Q(1), exact: true, target: 1, gap: two(n) };
    if (scene === 2) return { lo: Q.sub(Q(1), ten(n)), hi: Q(1), exact: true, target: 1, gap: ten(n) };
    if (scene === 3) { let lo = Q(1), hi = Q(2); for (let i = 0; i < n; i++) { const m = Q.div(Q.add(lo, hi), Q(2)); if (Q.cmp(Q.mul(m, m), Q(2)) < 0) lo = m; else hi = m; } return { lo, hi, exact: true, target: Math.SQRT2, gap: Q.sub(hi, lo) }; }
    const sides = 6 * 2 ** n, lo = sides * Math.sin(Math.PI / sides), hi = sides * Math.tan(Math.PI / sides);
    return { lo: apx(lo), hi: apx(hi), exact: false, target: Math.PI, gap: apx(hi - lo), sides, lof: lo, hif: hi };
  }
  const epsOf = (t) => { try { const q = Q.parse(String(t)); return q && q.n > 0n ? q : null; } catch (e) { return null; } };
  function stepsFor(scene, eps) {
    if (!eps) return null;
    for (let n = 0; n <= 40; n++) if (Q.cmp(at(scene, n).gap, eps) < 0) return n;
    return null;
  }
  const answered = (p) => p.gans > 0;
  function judge(p) {
    const A = at(p.scene, p.step), eps = epsOf(p.eps), sf = stepsFor(p.scene, eps);
    return { A, eps, sf, sfOk: sf !== null && p.sfg === sf ? 1 : 0, guessed: p.gans === 0 ? 0 : p.gans === 2 ? 1 : 0 };
  }
  function draw(c) {
    const p = c.props, J = judge(p), A = J.A, W = c.w; let s = '', y = 16;
    const nx = (q) => (Q.num(q) * 100).toFixed(1).replace(/\.0$/, '');
    s += K.text(10, y, SC[p.scene] + '　第 ' + p.step + ' 步', { size: 12.5, anchor: 'start', weight: 700 }); y += 14;
    const bar = (x0, y0, w, lo, hi, a, b) => { let t = K.rect(x0, y0, w, 20, { fill: 'var(--card)', stroke: 'var(--dim)', r: 3 }); t += K.rect(x0, y0, Math.max(1, w * (lo - a) / (b - a)), 20, { fill: 'var(--accent)', r: 3 }); return t; };
    if (p.scene === 0) {
      s += K.rect(10, y, W - 20, 26, { fill: 'var(--card)', stroke: 'var(--ink)', r: 3 }); let x = 10; for (let i = 1; i <= Math.min(p.step, 12); i++) { const w = (W - 20) / 2 ** i; s += K.rect(x, y, w, 26, { fill: i % 2 ? 'var(--accent)' : 'var(--good)', stroke: 'var(--card)', w: 0.5, r: 0 }); x += w; }
      s += K.text(W / 2, y + 44, '涂了 ' + Q.show(A.lo) + '，还剩 ' + Q.show(A.gap), { size: 12 }); y += 58;
    } else if (p.scene === 1) {
      const R = 54, cx = W / 2, cy = y + R + 6, sides = Math.min(A.sides, 96), pts = (rr) => Array.from({ length: sides }, (_, i) => (cx + rr * Math.sin(2 * Math.PI * i / sides)).toFixed(1) + ',' + (cy - rr * Math.cos(2 * Math.PI * i / sides)).toFixed(1)).join(' ');
      s += '<polygon points="' + pts(R / Math.cos(Math.PI / A.sides)) + '" fill="none" stroke="var(--bad)" stroke-width="1.2"/>' + K.circle(cx, cy, R, { stroke: 'var(--ink)', w: 1.5 }) + '<polygon points="' + pts(R) + '" fill="var(--accent)" fill-opacity="0.25" stroke="var(--accent)" stroke-width="1.5"/>';
      s += K.text(10, cy + R + 22, '正 ' + A.sides + ' 边形：内接周长 ÷ 直径 ≈ ' + A.lof.toFixed(5), { size: 11.5, anchor: 'start' }); y = cy + R + 40;
    } else if (p.scene === 2) {
      s += K.text(10, y + 18, '0.' + '9'.repeat(Math.min(p.step, 24)) + (p.step ? '' : '（还没写 9）'), { size: 15, weight: 700, anchor: 'start' }); s += K.text(10, y + 38, '1 − 它 = 1/10^' + p.step + ' = ' + (p.step <= 9 ? Q.show(A.gap) : '很小很小'), { size: 12, anchor: 'start' }); y += 52;
    } else {
      s += K.text(10, y + 14, '区间 [' + Q.show(A.lo) + '，' + Q.show(A.hi) + ']', { size: 11.5, anchor: 'start' }); s += K.text(10, y + 32, '≈ [' + Q.num(A.lo).toFixed(6) + '，' + Q.num(A.hi).toFixed(6) + ']', { size: 11.5, anchor: 'start', fill: 'var(--dim)' }); y += 46;
    }
    if (c.masked) s += K.text(10, y, '先猜：一直做下去，会到目标吗？会超过吗？', { size: 12, anchor: 'start', weight: 700, fill: 'var(--accent)' });
    else s += K.text(10, y, '下界 ' + (A.exact ? Q.show(A.lo) : '≈ ' + Q.num(A.lo).toFixed(6)) + '　上界 ' + (A.exact ? Q.show(A.hi) : '≈ ' + Q.num(A.hi).toFixed(6)), { size: 11.5, anchor: 'start', weight: 700 });
    y += 18; s += K.text(10, y, '差距（上界 − 下界）' + (A.exact && Q.num(A.gap) > 1e-4 ? Q.show(A.gap) : '≈ ' + Q.num(A.gap).toExponential(2)), { size: 11.5, anchor: 'start', fill: 'var(--dim)' }); y += 20;
    s += K.rect(10, y, 90, 24, { fill: 'var(--accent)', r: 6 }) + K.text(55, y + 16, '下一步 ▶', { size: 12.5, weight: 700, fill: '#fff' });
    s += '<rect x="10" y="' + y + '" width="90" height="24" rx="6" fill="transparent" data-pick-k="step" data-pick-v="' + Math.min(30, p.step + 1) + '" style="cursor:pointer"/>';
    s += K.rect(110, y, 60, 24, { fill: 'var(--sel-bg)', r: 6 }) + K.text(140, y + 16, '重来', { size: 12, weight: 700 });
    s += '<rect x="110" y="' + y + '" width="60" height="24" rx="6" fill="transparent" data-pick-k="step" data-pick-v="0" style="cursor:pointer"/>';
    if (J.eps) s += K.text(182, y + 16, '差距小于 ' + p.eps + ' 要走几步？', { size: 11, anchor: 'start', fill: 'var(--dim)' });
    return s;
  }
  U.registerPack({
    id: 'approach', version: 1, needs: [],
    types: {
      approach: {
        workspaceRole: 'none', handles: true, compactPorts: true, essence: ['E7'], label: '逼近器', prefix: '逼', group: '时间与变化', grades: [5, 9], alias: ['逼近', '极限', '割圆', '0.999', '取一半', '根号2', '二分'],
        props: {
          scene: { type: 'choice', label: '场景', default: 0, choices: SC }, step: { hidden: true, type: 'int', label: '走到第几步', default: 0, min: 0, max: 30 },
          gans: { type: 'int', label: '先猜：（1 会到目标 2 永远差一点 3 会超过）', default: 0, min: 0, max: 3 },
          eps: { type: 'text', label: '一个很小的数 ε（如 1/1000）', default: '' }, sfg: { type: 'int', label: '我说：要走几步差距才小于 ε', default: 0, min: 0, max: 60 },
        },
        guess: { props: ['gans'], ports: ['lower', 'upper', 'value'], answered },
        outputs: {
          value: { dim: null, kind: 'num', label: '现在的值（下界）' }, lower: { dim: null, kind: 'num', label: '下界' }, upper: { dim: null, kind: 'num', label: '上界' },
          gap: { dim: null, kind: 'num', label: '差距（上界 − 下界）' }, stepsFor: { dim: null, kind: 'num', label: '差距小于 ε 要几步' }, sfOk: { dim: null, kind: 'num', label: '步数说对了（1/0）' }, guessed: { dim: null, kind: 'num', label: '先猜对了（1/0）' },
        },
        icon: () => K.line(10, 50, 54, 14, { stroke: 'var(--accent)', w: 2.5 }) + K.line(10, 30, 54, 30, { stroke: 'var(--dim)', w: 1.5 }),
        size: (c) => [380, c.props.scene === 1 ? 250 : 190],
        compute: (c) => {
          const J = judge(c.props), A = J.A, ex = A.exact;
          c.say('info', c.props.step ? '第 ' + c.props.step + ' 步，差距 ' + (ex ? Q.show(A.gap) : '≈' + Q.num(A.gap).toExponential(2)) : '点“下一步”');
          const o = { value: num(A.lo, ex), lower: num(A.lo, ex), upper: num(A.hi, ex), gap: num(A.gap, ex), sfOk: num(J.sfOk), guessed: num(J.guessed) };
          if (J.sf !== null) o.stepsFor = num(J.sf); return o;
        },
        badge: (c) => (c.masked ? '？' : ''),
        draw,
      },
    },
  });
  U.Approach = { at, stepsFor };
})(typeof globalThis !== 'undefined' ? globalThis : window);
