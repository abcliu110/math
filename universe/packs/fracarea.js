/* 器材包 fracarea：分数面积模型和数轴上的分数（docs/new-instruments.md 6.4）。
 *   一个分数：单位正方形竖着切 b 份、涂 a 份。乘：先竖着涂 b，再横着取其中的 a，重叠的格子就是积（先猜积比被乘数大还是小）。
 *   加：两个正方形切法不同，数不起来；“再切”到同样大的小格（通分）才能数。除：a 里面能量出几个 b。比大小：两条一样长的条并排。
 *   数轴：同一个分数放在数轴上，5/4 超过 1，等值分数落在同一个点。
 * 分数按学生写的样子切（2/4 就切 4 份，不先约分），所以“等值分数”是看得见的。分母最多 12。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const OPS = ['一个分数', '乘', '加', '除', '比大小'], VIEWS = ['面积', '数轴', '都要'];
  const num = (n) => U.val('num', typeof n === 'number' ? Q(n) : n, { dim: null });
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  // 学生写的分数，保留分子分母原样：'2/4' → {n:2, d:4}；整数 '3' → {n:3, d:1}
  function frac(t) {
    const m = /^\s*(\d+)\s*(?:\/\s*(\d+))?\s*$/.exec(String(t === undefined ? '' : t)); if (!m) return null;
    const n = Number(m[1]), d = m[2] === undefined ? 1 : Number(m[2]); if (!d || d > 9999 || n > 999999999) return null;
    return { n, d, q: Q(n, d) };
  }
  const answered = (p) => { try { return U.Q.parse(String(p.gans)) !== null && String(p.gans).trim() !== ''; } catch (e) { return false; } };
  function judge(p, ai, bi) {
    const a = ai || frac(p.a), b = bi || frac(p.b); if (!a) return { err: '分数写成 3/4 的样子，分母不超过 9999' };
    if (p.op !== 0 && !b) return { err: '第二个分数写成 1/8 的样子' };
    const o = { a, b, result: a.q, cells: a.n, total: a.d, bigger: 0, common: 0 };
    if (p.op === 1) { o.result = Q.mul(a.q, b.q); o.cells = a.n * b.n; o.total = a.d * b.d; }
    else if (p.op === 2) { const c = p.cut > 0 ? p.cut : (p.st >= 2 ? lcmOf(a.d, b.d) : 0); o.result = Q.add(a.q, b.q); if (c > 0 && c % a.d === 0 && c % b.d === 0) { o.common = 1; o.cells = a.n * (c / a.d) + b.n * (c / b.d); o.total = c; } else { o.cells = 0; o.total = 0; } }
    else if (p.op === 3) { if (b.n === 0) return { err: '不能除以 0' }; o.result = Q.div(a.q, b.q); o.cells = o.result; o.total = 1; }
    else if (p.op === 4) { o.result = Q.cmp(a.q, b.q); o.cells = a.n; o.total = a.d; }
    if (p.op === 1 || p.op === 3) o.bigger = Q.cmp(o.result, a.q) > 0 ? 1 : 0;
    if (p.op === 4) o.bigger = Q.cmp(a.q, b.q) > 0 ? 1 : 0;
    return o;
  }
  const A_COL = '#f5a25d', B_COL = '#5b9bd5', BOTH = '#7a4fb3';
  const R = (x, y, w, h, fill, op, stroke) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + (fill || 'none') + '" fill-opacity="' + (op === undefined ? 1 : op) + '" stroke="' + (stroke || 'none') + '" stroke-width="0.8"/>';
  const lcmOf = (x, y) => { let m = x; while (m % y) m += x; return m; };
  // 把“为什么”画成一步一步的图：每种运算分几个画面，卡片右边的 ◀ ▶ 一步一步看（不是读文字）。
  // 返回 { svg, last, cap }：last＝最后一个画面的编号，cap＝这个画面的一句短话
  const LAST = [2, 5, 3, 4, 2];
  function stage(p, J, x0, y0, S, masked, st) {
    const a = J.a, b = J.b; let s = '', cap = '';
    const vl = (x, y, h, n, w, dash) => { let t = ''; if (n > 80) return t;   // 分得太细，不画格线（只看涂色）
      for (let i = 1; i < n; i++) t += K.line(x + i * w / n, y, x + i * w / n, y + h, { stroke: 'var(--dim)', w: 0.9, dash: dash ? '3 2' : '' }); return t; };
    const hl = (x, y, w, n, h, dash) => { let t = ''; if (n > 80) return t;
      for (let j = 1; j < n; j++) t += K.line(x, y + j * h / n, x + w, y + j * h / n, { stroke: 'var(--dim)', w: 0.9, dash: dash ? '3 2' : '' }); return t; };
    const frame = (x, y, w, h) => R(x, y, w, h, 'var(--card)', 1, 'var(--ink)');
    if (p.op === 0) {
      s += frame(x0, y0, S, S); cap = ['整体 = 1', '平均切成 ' + a.d + ' 份', '涂 ' + a.n + ' 份'][st];
      if (st >= 2) s += R(x0, y0, Math.min(a.n, a.d) * S / a.d, S, A_COL, 1);   // 超过 1 的分数，方块里只画满 1，多的部分看数轴
      if (st >= 1) s += vl(x0, y0, S, a.d, S) + K.rect(x0, y0, S, S, { stroke: 'var(--ink)', w: 1.2, r: 0 });
    } else if (p.op === 1) {
      // “a/b × c/d ＝ 取 c/d 的 a/b”：先涂 c/d（蓝条），再只把蓝条横着切开、取其中的 a/b（紫），最后放回整体数格子
      const cw = S / b.d, bw = Math.min(b.n, b.d) * cw, rh = S / a.d, an = Math.min(a.n, a.d);
      s += frame(x0, y0, S, S);
      cap = ['整体 = 1', '竖着切 ' + b.d + ' 份', '涂 ' + b.n + ' 份（蓝）', '把蓝的横着切 ' + a.d + ' 份', '取其中 ' + a.n + ' 份（紫）', '放回整体：数格子'][st];
      if (st >= 2) s += R(x0, y0, bw, S, B_COL, st >= 4 ? 0.35 : 1);
      if (st >= 4) s += R(x0, y0, bw, an * rh, BOTH, 1);
      if (st >= 1) s += vl(x0, y0, S, b.d, S);
      if (st === 3 || st === 4) s += hl(x0, y0, bw, a.d, S, st === 3);
      if (st >= 5) s += hl(x0, y0, S, a.d, S);
      s += K.rect(x0, y0, S, S, { stroke: 'var(--ink)', w: 1.2, r: 0 });
      if (st >= 2 && st <= 4) s += K.text(x0 + bw / 2, y0 - 4, b.n + '/' + b.d, { size: 11, weight: 700, fill: B_COL });
      if (st >= 5) {
        s += K.text(x0, y0 + S + 16, '紫 ' + a.n + '×' + b.n + ' = ' + J.cells + ' 格　整体 ' + a.d + '×' + b.d + ' = ' + J.total + ' 格', { size: 12, weight: 700, fill: BOTH, anchor: 'start' });
        if (!masked) s += K.text(x0, y0 + S + 34, a.n + '/' + a.d + ' × ' + b.n + '/' + b.d + ' = ' + Q.show(J.result), { size: 13, weight: 700, fill: BOTH, anchor: 'start' });
      }
    } else if (p.op === 2) {
      const L = lcmOf(a.d, b.d), w = (S - 16) / 2, ya = y0 + 10;
      cap = ['格子大小不一样', '都再切成 ' + L + ' 份', '每格一样大了', '格子拼到一起'][st];
      const one = (xx, f, col) => {
        let t = frame(xx, ya, w, w);
        if (st < 2) { t += R(xx, ya, Math.min(f.n, f.d) * w / f.d, w, col, 1); t += vl(xx, ya, w, f.d, w); }
        else { const k = Math.min(f.n, f.d) * (L / f.d); t += R(xx, ya, k * w / L, w, col, 1); t += vl(xx, ya, w, L, w); }
        if (st === 1) t += vl(xx, ya, w, L, w, true);
        return t + K.rect(xx, ya, w, w, { stroke: 'var(--ink)', w: 1.2, r: 0 });
      };
      if (st < 3) {
        s += one(x0, a, A_COL) + K.text(x0 + w + 8, ya + w / 2 + 6, '+', { size: 18, weight: 700 }) + one(x0 + w + 16, b, B_COL);
        s += K.text(x0 + w / 2, ya + w + 15, a.n + '/' + a.d, { size: 11, fill: A_COL, weight: 700 }) + K.text(x0 + w + 16 + w / 2, ya + w + 15, b.n + '/' + b.d, { size: 11, fill: B_COL, weight: 700 });
        if (st === 0) s += K.text(x0 + S / 2, ya + w + 40, '大格 ≠ 小格', { size: 12, fill: 'var(--bad)', weight: 700 });
      } else {
        const ka = a.n * (L / a.d), kb = b.n * (L / b.d), cw = S / Math.max(L, ka + kb), bw = cw * L;
        let t = frame(x0, ya + 30, bw, 28);
        t += R(x0, ya + 30, ka * cw, 28, A_COL, 1);
        t += R(x0 + ka * cw, ya + 30, kb * cw, 28, B_COL, 1);
        t += vl(x0, ya + 30, 28, L, bw) + K.rect(x0, ya + 30, bw, 28, { stroke: 'var(--ink)', w: 1.2, r: 0 });
        s += t + K.text(x0 + bw / 2, ya + 76, ka + ' 格 + ' + kb + ' 格 = ' + (ka + kb) + ' 格', { size: 12, weight: 700 });
        s += K.text(x0 + bw / 2, ya + 94, '每格 1/' + L + (masked ? '' : ' → ' + Q.show(J.result)), { size: 12, weight: 700, fill: BOTH });
      }
    } else if (p.op === 3) {
      // “a ÷ b ＝ a 里量出几个 b”：用 b 当尺子量 a；最后看 1 里有几个 b，所以 a 里有 a × (1 里的个数)
      if (Q.num(a.q) > 12 || Q.num(a.q) / Q.num(b.q) > 40) return { svg: K.text(x0 + S / 2, y0 + 50, '数太大，图画不下', { size: 13, weight: 700, fill: 'var(--dim)' }) + K.text(x0 + S / 2, y0 + 76, a.n + '/' + a.d + ' ÷ ' + b.n + '/' + b.d + (masked ? '' : ' = ' + Q.show(J.result)), { size: 13, weight: 700, fill: BOTH }) + K.text(x0 + S / 2, y0 + 100, '换小一点的数，再看图', { size: 11.5, fill: 'var(--dim)' }), cap: '数太大：看算式', last: LAST[3] };
      const N = Math.max(1, Math.ceil(Q.num(a.q))), uw = S / N, y = y0 + 22, h = 34, bl = Q.num(b.q) * uw, aw = Q.num(a.q) * uw, per = Q.div(Q(1), b.q);
      cap = ['先涂出被除数 ' + a.n + '/' + a.d, '拿 ' + b.n + '/' + b.d + ' 当尺子', '一块一块量', '数：共 ' + (masked ? '？' : Q.show(J.result)) + ' 块', '1 里有 ' + Q.show(per) + ' 块'][st];
      s += K.text(x0, y0 + 10, '格线：每 1 个整体', { size: 10.5, anchor: 'start', fill: 'var(--dim)' });
      s += R(x0, y, aw, h, A_COL, st === 4 ? 0.35 : 1);
      for (let u = 0; u <= N; u++) s += K.line(x0 + u * uw, y - 3, x0 + u * uw, y + h + 3, { w: 1.6 });
      s += K.rect(x0, y, S, h, { stroke: 'var(--ink)', w: 1.2, r: 0 });
      const blk = (i, yy, op, lab) => R(x0 + i * bl, yy, Math.max(1, bl - 1.5), 24, B_COL, op) + (lab ? K.text(x0 + i * bl + bl / 2, yy + 17, lab, { size: 12, weight: 700, fill: '#fff' }) : '');
      if (st >= 1 && st <= 3) {
        const full = st === 1 ? 1 : Math.floor(Q.num(a.q) / Q.num(b.q) + 1e-9), rem = Q.num(a.q) - full * Q.num(b.q), yy = y + h + 10;
        for (let i = 0; i < full; i++) s += blk(i, yy, 1, st >= 3 ? String(i + 1) : '');
        if (st >= 2 && rem > 1e-9) { s += R(x0 + full * bl, yy, rem * uw - 1.5, 24, B_COL, 0.3, B_COL) + (st >= 3 ? K.text(x0 + full * bl + rem * uw / 2, yy + 17, Q.show(Q.div(Q.sub(a.q, Q.mul(Q(full), b.q)), b.q)), { size: 11, weight: 700, fill: B_COL }) : ''); }
        if (st === 3) s += K.text(x0 + S / 2, yy + 48, masked ? '数一数几块？' : Q.show(J.result) + ' 块', { size: 14, weight: 700, fill: BOTH });
      }
      if (st === 4) {
        // 为什么乘倒数：整体 1 里有 1/b 个 b（比如 3 块），a 只占整体的 a 这么多，所以 a 里就有 a × 3 块
        const yy = y + h + 10, k = Math.ceil(Q.num(per) - 1e-9);
        for (let i = 0; i < k; i++) { const w1 = Math.min(bl, uw - i * bl); if (w1 > 0.5) s += R(x0 + i * bl, yy, w1 - 1.5, 24, B_COL, 1) + K.text(x0 + i * bl + w1 / 2, yy + 17, String(i + 1), { size: 12, weight: 700, fill: '#fff' }); }
        s += K.line(x0, yy + 32, x0 + uw, yy + 32, { w: 2 }) + K.text(x0 + uw / 2, yy + 48, '1 个整体 = ' + Q.show(per) + ' 块', { size: 12, weight: 700 });
        s += K.text(x0 + S / 2, yy + 68, a.n + '/' + a.d + ' 个整体 → ' + a.n + '/' + a.d + ' × ' + Q.show(per) + ' 块', { size: 12, weight: 700, fill: BOTH });
      }
    } else {
      const L = lcmOf(a.d, b.d);
      cap = ['两条一样长', '切成同样小的格', '数一数涂了几格'][st];
      [[a, 0, A_COL], [b, 1, B_COL]].forEach(([f, k, col]) => {
        const y = y0 + 14 + k * 54, cells = st >= 1 ? L : f.d, filled = st >= 1 ? f.n * (L / f.d) : f.n;
        s += R(x0, y, Math.min(filled, cells) * S / cells, 34, col, 1);
        s += vl(x0, y, 34, cells, S) + K.rect(x0, y, S, 34, { stroke: 'var(--ink)', w: 1.2, r: 0 }) + K.text(x0 + S + 6, y + 22, f.n + '/' + f.d, { size: 11, anchor: 'start', weight: 700, fill: col });
        if (st >= 2) s += K.text(x0 + S / 2, y + 50, filled + ' 格', { size: 11.5, weight: 700 });
      });
      if (st >= 2) s += K.text(x0 + S / 2, y0 + 128, masked ? '先猜：哪个多？' : Q.cmp(a.q, b.q) > 0 ? '第一个涂得多' : Q.cmp(a.q, b.q) < 0 ? '第二个涂得多' : '一样多', { size: 12, weight: 700, fill: BOTH });
    }
    return { svg: s, cap, last: LAST[p.op] };
  }
  function line(p, J, x0, y0, S, masked) {
    const pts = [J.a.q]; if (p.op !== 0 && J.b) pts.push(J.b.q); if (p.op === 1 || p.op === 2 || p.op === 3) pts.push(J.result);
    const maxv = Math.max(2, Math.ceil(Math.max.apply(null, pts.map((q) => Q.num(q))))), W = S;
    let s = K.line(x0, y0 + 20, x0 + W, y0 + 20, {});
    const den = Math.min(24, J.a.d * (J.b ? J.b.d : 1));
    for (let i = 0; i <= maxv * J.a.d; i++) s += K.line(x0 + (i / J.a.d) / maxv * W, y0 + 15, x0 + (i / J.a.d) / maxv * W, y0 + 25, { w: i % J.a.d === 0 ? 2 : 1 });
    for (let i = 0; i <= maxv; i++) s += K.text(x0 + i / maxv * W, y0 + 40, String(i), { size: 11, fill: 'var(--dim)' });
    [[J.a.q, A_COL, '第一个'], [J.b && p.op !== 0 ? J.b.q : null, B_COL, '第二个'], [(p.op === 1 || p.op === 2 || p.op === 3) && !masked ? J.result : null, BOTH, '结果']].forEach(([q, col, lab], k) => { if (q) s += K.circle(x0 + Q.num(q) / maxv * W, y0 + 20, 6, { fill: col, stroke: 'var(--ink)', w: 1 }) + K.text(x0 + Q.num(q) / maxv * W, y0 + 56 + k * 12, lab + ' ' + Q.show(q), { size: 10.5, fill: col }); });
    return s;
  }
  function draw(c) {
    const p = c.props, J = judge(p); if (J.err) return K.text(10, 24, J.err, { size: 12, anchor: 'start', fill: 'var(--bad)' });
    const S = 140, masked = !!c.masked, W = c.w; let s = '', y = 40;
    // 卡片上直接选“做什么”（不用进属性面板找）
    OPS.forEach((nm, i) => { const x = 10 + i * 72; s += K.rect(x, 6, 66, 22, { fill: p.op === i ? 'var(--accent)' : 'var(--sel-bg)', r: 11 }) + K.text(x + 33, 21, nm, { size: 12, weight: 700, fill: p.op === i ? '#fff' : 'var(--ink)' }) + '<rect x="' + x + '" y="6" width="66" height="22" rx="11" fill="transparent" data-pick-k="op" data-pick-v="' + i + '" style="cursor:pointer"/>'; });
    if (p.view !== 1) {
      const last = LAST[p.op], st = Math.max(0, Math.min(p.st, last)), g = stage(p, J, 20, y, S, masked, st);
      s += g.svg;
      // 右边：这一步的一句话 + 小圆点（第几步）+ ◀ ▶
      const rx = 200;
      s += K.text(rx, y + 22, g.cap, { size: 14, weight: 700, anchor: 'start' });
      for (let i = 0; i <= last; i++) s += K.circle(rx + 6 + i * 16, y + 44, 5, { fill: i === st ? 'var(--accent)' : i < st ? 'var(--dim)' : 'none', stroke: 'var(--dim)', w: 1 });
      const btn = (x, lab, v, on) => K.rect(x, y + 62, 56, 28, { fill: on ? 'var(--accent)' : 'var(--sel-bg)', r: 14 }) + K.text(x + 28, y + 81, lab, { size: 14, weight: 700, fill: on ? '#fff' : 'var(--dim)' }) + (on ? '<rect x="' + x + '" y="' + (y + 62) + '" width="56" height="28" rx="14" fill="transparent" data-pick-k="st" data-pick-v="' + v + '" style="cursor:pointer"/>' : '');
      s += btn(rx, '◀', st - 1, st > 0) + btn(rx + 64, '▶', st + 1, st < last);
      if (st < last) s += K.text(rx, y + 112, '点 ▶ 一步一步看', { size: 11.5, anchor: 'start', fill: 'var(--dim)' });
      y += 200;
    }
    if (p.view !== 0) { s += line(p, J, 20, y + 6, W - 40, masked); }
    return s;
  }
    U.registerPack({
    id: 'fracarea', version: 1, needs: [],
    types: {
      fracarea: {
        workspaceRole: 'none', handles: true, compactPorts: true, essence: ['E3', 'E2'],
        label: '分数面积模型', prefix: '分', group: '分数', grades: [3, 6], alias: ['分数面积', '分数乘法', '通分', '分数除法', '数轴上的分数', '面积模型'],
        props: {
          a: { type: 'text', label: '第一个分数（如 2/3）', default: '1/2' }, b: { type: 'text', label: '第二个分数', default: '1/3' },
          op: { type: 'choice', label: '做什么', default: 0, choices: OPS }, view: { type: 'choice', label: '看', default: 0, choices: VIEWS },
          st: { hidden: true, type: 'int', label: '看到第几步', default: 0, min: 0, max: 6 }, cut: { hidden: true, type: 'int', label: '再切成几份（通分）', default: 0, min: 0, max: 48 }, gans: { type: 'text', label: '我猜结果', default: '' },
        },
        guess: { props: ['gans'], ports: ['result', 'cells', 'bigger'], answered },
        outputs: {
          result: { dim: null, kind: 'num', label: '结果' }, cells: { dim: null, kind: 'num', label: '涂的格数' }, total: { dim: null, kind: 'num', label: '一共几格' },
          bigger: { dim: null, kind: 'num', label: '结果比第一个分数大（1/0）' }, common: { dim: null, kind: 'num', label: '切成同样大的小格（1/0）' },
        },
        icon: () => K.rect(10, 10, 44, 44, { fill: 'none', stroke: 'var(--ink)', w: 1.5, r: 2 }) + K.rect(10, 10, 30, 30, { fill: A_COL, r: 0 }),
        size: (c) => [380, (c.props.view === 1 ? 0 : 200) + 70 + (c.props.view === 0 ? 0 : 110)],
        compute: (c) => {
          const J = judge(c.props); if (J.err) { c.say('reject', J.err); return {}; }
          c.say('info', c.props.op === 2 && !J.common ? '分母不同：格子大小不一样，要再切' : '结果 ' + (c.props.op === 4 ? (J.result === 0 ? '一样大' : '') : Q.show(J.result)));
          return { result: c.props.op === 4 ? num(J.result) : num(J.result), cells: num(J.cells), total: num(J.total), bigger: num(J.bigger), common: num(J.common) };
        },
        badge: (c) => (c.masked ? '？' : c.out.result ? U.showVal(c.out.result) : ''),
        draw,
      },
    },
  });
  U.FracArea = { judge, frac };
})(typeof globalThis !== 'undefined' ? globalThis : window);
