/* 器材包 dissect：勾股剪拼和圆面积切拼（docs/new-instruments.md 6.6）。用剪和拼，把“面积相等”做成看得见的证明。
 *   勾股：直角三角形（两条直角边 a、b）三边上各一个正方形。弦图：边长 a + b 的大正方形，里面放 4 个全等的直角三角形，空出来的是 c²；
 *   换一种放法，空出来的是 a² 和 b²——两种放法的大正方形一样大、三角形一样多，所以 c² = a² + b²。把夹角改成 60° 或 120°，两边就不相等了，差是 ±ab（精确）。
 *   圆：把圆切成 n 个扇形，交错拼成近似的平行四边形：底边近似半个周长，高近似半径；n 翻倍，拼出的面积越来越接近圆面积（逼近，标 ≈）。
 * 和设计文档的差别（如实写）：这是一台独立的器材，不是几何工作区上的预置题；勾股只做弦图一种拼法（不是 5 块切法），也不用符号边长做“对任意直角三角形”的验证，
 * 只对夹角 60°、90°、120° 三种精确算（cos 是 1/2、0、−1/2）；圆的拼合是示意图，没有拖动。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n, ex) => U.val('num', typeof n === 'number' ? Q(n) : n, ex === false ? { dim: null, exact: false } : { dim: null });
  const ANG = [60, 90, 120], COS = [Q(1, 2), Q(0), Q(-1, 2)];
  const apx = (x) => Q.fromNumber(+x.toFixed(8));
  function judge(p) {
    if (p.scene === 0) {
      const a2 = p.a * p.a, b2 = p.b * p.b, ab = p.a * p.b, c2 = Q.sub(Q(a2 + b2), Q.mul(Q(2 * ab), COS[p.angle])), gap = Q.sub(c2, Q(a2 + b2));
      return { a2, b2, c2, gap, fits: Q.cmp(gap, Q(0)) === 0 ? 1 : 0, guessed: p.gans === 0 ? 0 : (p.gans === 3) === (Q.cmp(gap, Q(0)) === 0) ? 1 : 0 };
    }
    const n = p.n, r = p.r, area = Math.PI * r * r, base = n * r * Math.sin(Math.PI / n), height = r * Math.cos(Math.PI / n), got = base * height;
    return { n, base, height, area, got, wobble: (area - got) / area, guessed: p.gans === 0 ? 0 : p.gans === 1 ? 1 : 0 };
  }
  function draw(c) {
    const p = c.props, J = judge(p), W = c.w; let s = '';
    const hit = (x, y, w, h, k, v) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="5" fill="transparent" data-pick-k="' + k + '" data-pick-v="' + v + '" style="cursor:pointer"/>';
    let H = '';
    if (p.scene === 0) {
      const a = p.a, b = p.b, m = Math.max(a + b, 1), u = Math.min(11, 120 / m), x0 = 20, y0 = 14, T = (x, y, c1, c2, c3) => K.line(x0 + x * u, y0 + y * u, x0 + c1 * u, y0 + c2 * u, {});
      // 弦图：边长 a+b 的正方形，四个角各一个直角三角形（两直角边 a、b），中间是 c²
      const L = (a + b) * u, fill = (pts, col) => '<polygon points="' + pts.map((q) => (x0 + q[0] * u).toFixed(1) + ',' + (y0 + q[1] * u).toFixed(1)).join(' ') + '" fill="' + col + '" fill-opacity="0.55" stroke="var(--ink)" stroke-width="1"/>';
      s += K.rect(x0, y0, L, L, { fill: 'none', stroke: 'var(--ink)', w: 1.5, r: 0 });
      s += fill([[0, 0], [a, 0], [0, b]], '#5b9bd5') + fill([[a, 0], [a + b, 0], [a + b, a]], '#5b9bd5') + fill([[a + b, a], [a + b, a + b], [b, a + b]], '#5b9bd5') + fill([[0, b], [0, a + b], [b, a + b]], '#5b9bd5');
      s += fill([[a, 0], [a + b, a], [b, a + b], [0, b]], '#f5a25d');
      s += K.text(x0 + L / 2, y0 + L / 2 + 4, 'c²', { size: 14, weight: 700 });
      const x1 = x0 + L + 40;
      s += K.rect(x1, y0, a * u, a * u, { fill: '#7fc17f', stroke: 'var(--ink)', r: 0 }) + K.text(x1 + a * u / 2, y0 + a * u / 2 + 4, 'a² = ' + J.a2, { size: 11.5, weight: 700 });
      s += K.rect(x1, y0 + a * u + 10, b * u, b * u, { fill: '#c9a0dc', stroke: 'var(--ink)', r: 0 }) + K.text(x1 + b * u / 2, y0 + a * u + 10 + b * u / 2 + 4, 'b² = ' + J.b2, { size: 11.5, weight: 700 });
      const y = y0 + L + 24;
      s += K.text(10, y, '三角形：两直角边 ' + a + '、' + b + '，夹角 ' + ANG[p.angle] + '°', { size: 12, anchor: 'start', weight: 700 });
      s += K.text(10, y + 20, c.masked ? '先猜：a² + b² 和 c² 谁大？' : 'a² + b² = ' + (J.a2 + J.b2) + '，c² = ' + Q.show(J.c2) + (J.fits ? '：相等，弦图拼得满' : '：差 ' + Q.show(J.gap) + '，拼不满（只有直角才行）'), { size: 12, anchor: 'start', weight: 700, fill: c.masked ? 'var(--accent)' : J.fits ? 'var(--good)' : 'var(--bad)' });
      if (p.angle !== 1) { /* 钝角 / 锐角：弦图画的是直角的样子，在下面写明 */ s += K.text(10, y + 38, '（图画的是直角时的样子）', { size: 10.5, anchor: 'start', fill: 'var(--dim)' }); }
    } else {
      const R = 52, cx = 70, cy = 74, n = Math.min(p.n, 128);
      s += K.circle(cx, cy, R, { fill: 'none', stroke: 'var(--ink)', w: 1.5 });
      for (let i = 0; i < n; i++) { const a = 2 * Math.PI * i / n; s += K.line(cx, cy, cx + R * Math.sin(a), cy - R * Math.cos(a), { stroke: 'var(--dim)', w: 0.8 }); }
      // 拼成的近似平行四边形：n 个扇形交错，底边 ≈ 半个周长，高 ≈ 半径
      const bw = Math.min(190, J.base * (R / p.r)), bh = Math.min(70, J.height * (R / p.r)), x0 = 150, y0 = 44;
      for (let i = 0; i < Math.min(n, 32); i++) { const w = bw / Math.min(n, 32); s += '<polygon points="' + (x0 + i * w) + ',' + (i % 2 ? y0 : y0 + bh) + ' ' + (x0 + (i + 1) * w) + ',' + (i % 2 ? y0 : y0 + bh) + ' ' + (x0 + (i + 0.5) * w) + ',' + (i % 2 ? y0 + bh : y0) + '" fill="' + (i % 2 ? '#5b9bd5' : '#f5a25d') + '" fill-opacity="0.6" stroke="var(--card)" stroke-width="0.4"/>'; }
      s += K.text(x0 + bw / 2, y0 + bh + 16, '底边 ≈ 半个周长 πr', { size: 10.5 }) + K.text(x0 - 6, y0 + bh / 2, '高≈r', { size: 10.5, anchor: 'end' });
      const y = 160; s += K.text(10, y, '把圆切成 ' + n + ' 个扇形，交错拼起来', { size: 12, anchor: 'start', weight: 700 });
      s += K.text(10, y + 20, c.masked ? '先猜：拼出来的面积和圆比，变了没有？' : '拼出的面积 ≈ ' + J.got.toFixed(4) + '，圆面积 = ' + J.area.toFixed(4) + '，差 ' + (J.wobble * 100).toFixed(2) + '%', { size: 11.5, anchor: 'start', weight: 700, fill: c.masked ? 'var(--accent)' : 'var(--ink)' });
      const bt = (x, tx, v) => { s += K.rect(x, y + 32, 70, 22, { fill: 'var(--sel-bg)', r: 5 }) + K.text(x + 35, y + 47, tx, { size: 11.5, weight: 700 }); H += hit(x, y + 32, 70, 22, 'n', v); };
      bt(10, '少切一半', Math.max(4, p.n / 2)); bt(90, '多切一倍', Math.min(128, p.n * 2));
    }
    return s + H;
  }
  U.registerPack({
    id: 'dissect', version: 1, needs: [],
    types: {
      dissect: {
        workspaceRole: 'none', handles: true, compactPorts: true, essence: ['E5', 'E7'], label: '剪拼', prefix: '拼', group: '图形', grades: [5, 8], alias: ['剪拼', '勾股定理', '弦图', '圆面积', '切拼', '割补'],
        props: {
          scene: { type: 'choice', label: '场景', default: 0, choices: ['勾股', '圆面积'] }, a: { type: 'int', label: '直角边 a', default: 3, min: 1, max: 12 }, b: { type: 'int', label: '直角边 b', default: 4, min: 1, max: 12 },
          angle: { type: 'choice', label: '两边的夹角', default: 1, choices: ['60°', '90°（直角）', '120°（钝角）'] }, r: { type: 'int', label: '半径', default: 5, min: 1, max: 20 }, n: { type: 'int', label: '切成几个扇形（4–128）', default: 4, min: 4, max: 128 },
          gans: { type: 'int', label: '先猜（勾股：1 a²+b²大 2 c²大 3 一样；圆：1 没变 2 变大 3 变小）', default: 0, min: 0, max: 3 },
        },
        guess: { props: ['gans'], ports: ['c2', 'gap', 'fits', 'area', 'got', 'wobble'], answered: (p) => p.gans > 0 },
        outputs: {
          a2: { dim: null, kind: 'num', label: 'a²' }, b2: { dim: null, kind: 'num', label: 'b²' }, c2: { dim: null, kind: 'num', label: 'c²' }, gap: { dim: null, kind: 'num', label: 'c² − a² − b²' }, fits: { dim: null, kind: 'num', label: '弦图拼得满（1/0）' },
          base: { dim: null, kind: 'num', label: '拼出的底边（≈）' }, height: { dim: null, kind: 'num', label: '拼出的高（≈）' }, area: { dim: null, kind: 'num', label: '圆面积（≈）' }, got: { dim: null, kind: 'num', label: '拼出的面积（≈）' }, wobble: { dim: null, kind: 'num', label: '拼出的面积比圆少百分之几（≈，小数）' },
          guessed: { dim: null, kind: 'num', label: '先猜对了（1/0）' },
        },
        icon: () => '<polygon points="10,10 54,10 54,54" fill="var(--accent)" fill-opacity="0.5" stroke="var(--ink)" stroke-width="1.5"/>',
        size: (c) => (c.props.scene === 0 ? [380, 60 + Math.max(1, c.props.a + c.props.b) * Math.min(11, 120 / (c.props.a + c.props.b)) + 60] : [380, 240]),
        compute: (c) => {
          const J = judge(c.props); c.say('info', c.props.scene === 0 ? (J.fits ? 'a² + b² = c²' : 'a² + b² ≠ c²') : '切 ' + c.props.n + ' 份');
          if (c.props.scene === 0) return { a2: num(J.a2), b2: num(J.b2), c2: num(J.c2), gap: num(J.gap), fits: num(J.fits), guessed: num(J.guessed) };
          return { base: num(apx(J.base), false), height: num(apx(J.height), false), area: num(apx(J.area), false), got: num(apx(J.got), false), wobble: num(apx(J.wobble), false), guessed: num(J.guessed) };
        },
        badge: (c) => (c.masked ? '？' : ''),
        draw,
      },
    },
  });
  U.Dissect = { judge };
})(typeof globalThis !== 'undefined' ? globalThis : window);
