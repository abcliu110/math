/* 器材包 ratiobench：分数条与比（docs/instrument-design.md 第 4 节）。两种用法，全部在图上直接拖：
 *   分数条：两条一样长的条（都是 1）。点 − ＋ 改每条切成几份，拖涂色的右边改涂几份。
 *           两条上下对齐，所以谁长谁短一眼看得出；一样长就是等值分数。上面写出比较的结果、相差多少、通分以后各是多少。
 *   双数轴：上下两条数轴对齐，上面一个量、下面一个量，它们成正比例（上面的 pa 对着下面的 pb）。
 *           拖上面的点，下面跟着走：3 个 12 元，5 个就对着 20 元。百分数就是上面那条是 0 到 100。
 * 这一版的边界（如实写）：分数条只到 1（没有假分数的条）；双数轴只拖上面那条的整刻度；没有反比例。
 * 和旧器材的关系：“分数条”（fracbar）、“比”（ratio）、“百分数”（percent）是只能填数的卡片，先保留；题目没搬完。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', typeof n === 'number' ? Q(n) : n, { dim: null });
  const MODES = ['分数条', '双数轴'];
  const W = 600, X0 = 44, BW = 400, YA = 86, YB = 156, BH = 40, X1 = W - 50, TY = 104, BY = 176;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const gcd = (a, b) => (b ? gcd(b, a % b) : a), lcm = (a, b) => a / gcd(a, b) * b;

  function model(p) {
    if (p.mode === 1) {
      const pa = clamp(p.pa, 1, 1000), pb = clamp(p.pb, 1, 100000), tstep = clamp(p.tstep, 1, 100), tmax = clamp(p.tmax, tstep, 1000);
      const t = clamp(Math.round(p.t / tstep) * tstep, 0, tmax), rate = Q(pb, pa), u = (X1 - X0) / tmax;
      return { mode: 1, pa, pb, tstep, tmax, t, rate, bottom: Q.mul(Q(t), rate), u, X: (v) => X0 + v * u, inv: (x) => (x - X0) / u };
    }
    const d1 = clamp(p.d1, 1, 12), d2 = clamp(p.d2, 1, 12), n1 = clamp(p.n1, 0, d1), n2 = clamp(p.n2, 0, d2), a = Q(n1, d1), b = Q(n2, d2), c = Q.cmp(a, b), L = lcm(d1, d2);
    return { mode: 0, d1, d2, n1, n2, a, b, cmp: c, diff: Q.abs(Q.sub(a, b)), sum: Q.add(a, b), L };
  }
  const pickBtn = (x, y, tx, k, v, tip) => '<g data-pick-k="' + k + '" data-pick-v="' + v + '" style="cursor:pointer"><title>' + K.esc(tip) + '</title>' + K.rect(x, y, 24, 22, { fill: '#fff', stroke: '#8a94a8', r: 6 }) + K.text(x + 12, y + 16, tx, { size: 14, weight: 700 }) + '</g>';
  const R = (x, y, w, h, fill, op) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + fill + '" fill-opacity="' + (op === undefined ? 1 : op) + '"/>';
  const qs = (q) => Q.show(q);

  function bar(y, d, n, col, key, label) {
    let s = R(X0, y, BW, BH, '#fff') + (n ? R(X0, y, BW * n / d, BH, col, 0.6) : '');
    for (let i = 1; i < d; i++) s += K.line(X0 + BW * i / d, y, X0 + BW * i / d, y + BH, { w: 1.2 });
    s += K.rect(X0, y, BW, BH, { stroke: 'var(--ink)', r: 0, w: 2 });
    s += K.text(X0 - 18, y + BH / 2 + 5, label, { size: 13, weight: 700 });
    const bx = X0 + BW + 18;
    s += pickBtn(bx, y + 9, '−', key, Math.max(1, d - 1), '少切一份') + K.text(bx + 50, y + 26, n + '/' + d, { size: 16, weight: 700 }) + pickBtn(bx + 76, y + 9, '＋', key, Math.min(12, d + 1), '多切一份');
    return s;
  }
  function drawBars(c, m) {
    let s = bar(YA, m.d1, m.n1, '#f5a25d', 'd1', '甲') + bar(YB, m.d2, m.n2, '#5b9bd5', 'd2', '乙');
    // 两条涂色的右边各拉一条虚线，上下一比就知道谁长
    const xa = X0 + BW * m.n1 / m.d1, xb = X0 + BW * m.n2 / m.d2;
    s += K.line(xa, YA - 8, xa, YB + BH + 8, { w: 1.4, dash: '4 3', stroke: '#a85410' }) + K.line(xb, YA - 8, xb, YB + BH + 8, { w: 1.4, dash: '4 3', stroke: '#1d5fa8' });
    const A = m.n1 + '/' + m.d1, B = m.n2 + '/' + m.d2, rel = m.cmp > 0 ? ' > ' : m.cmp < 0 ? ' < ' : ' = ';
    s += K.text(W / 2, 46, c.masked ? A + ' ？ ' + B : A + rel + B, { size: 21, weight: 700 });
    if (!c.masked) {
      const same = m.cmp === 0 ? (m.d1 === m.d2 ? '两条一样' : '等值分数：切法不同，一样长') : '相差 ' + qs(m.diff);
      s += K.text(W / 2, 232, same + '　　通分（都切成 ' + m.L + ' 份）：' + m.n1 * m.L / m.d1 + '/' + m.L + ' 和 ' + m.n2 * m.L / m.d2 + '/' + m.L, { size: 13 });
      s += K.text(W / 2, 254, '合起来：' + A + ' + ' + B + ' = ' + qs(m.sum), { size: 13 });
    }
    return s;
  }
  function drawLines(c, m) {
    const p = c.props; let s = '';
    s += K.line(X0 - 10, TY, X1 + 12, TY, { w: 2.2 }) + K.line(X0 - 10, BY, X1 + 12, BY, { w: 2.2 });
    s += K.text(X1 + 30, TY + 5, p.ua || '', { size: 12, weight: 700 }) + K.text(X1 + 30, BY + 5, p.ub || '', { size: 12, weight: 700 });
    const nt = m.tmax / m.tstep, every = nt <= 12 ? 1 : nt <= 24 ? 2 : 5;
    for (let i = 0; i <= nt; i++) {
      const v = i * m.tstep, x = m.X(v), big = i % every === 0;
      s += K.line(x, TY - (big ? 7 : 4), x, TY + (big ? 7 : 4), { w: 1.2 }) + K.line(x, BY - (big ? 7 : 4), x, BY + (big ? 7 : 4), { w: 1.2 });
      if (big) s += K.text(x, TY - 12, String(v), { size: 12 }) + (c.masked && v !== 0 && v !== m.pa ? '' : K.text(x, BY + 22, qs(Q.mul(Q(v), m.rate)), { size: 12 }));
    }
    // 已知的那一对
    if (m.pa <= m.tmax) s += K.line(m.X(m.pa), TY, m.X(m.pa), BY, { w: 2, stroke: 'var(--good)' }) + K.text(m.X(m.pa), TY - 28, '已知', { size: 11, fill: 'var(--good)', weight: 700 });
    s += K.line(m.X(m.t), TY, m.X(m.t), BY, { w: 2, dash: '5 3', stroke: 'var(--blue)' }) + K.circle(m.X(m.t), BY, 6, { fill: 'var(--blue)' });
    s += K.text(W / 2, 40, m.pa + ' ' + (p.ua || '') + ' 对着 ' + m.pb + ' ' + (p.ub || '') + '　→　' + m.t + ' ' + (p.ua || '') + ' 对着 ' + (c.masked ? '？' : qs(m.bottom)) + ' ' + (p.ub || ''), { size: 17, weight: 700 });
    if (!c.masked) s += K.text(W / 2, 232, '每 1 ' + (p.ua || '') + ' 对着 ' + qs(m.rate) + ' ' + (p.ub || '') + '；' + m.t + ' × ' + qs(m.rate) + ' = ' + qs(m.bottom), { size: 13 });
    return s;
  }

  function grips(c) {
    const m = model(c.props), out = [];
    if (m.mode === 0) {
      out.push({ id: 'n1', x: X0 + BW * m.n1 / m.d1, y: YA + BH / 2, shape: 'bar-v', cursor: 'ew-resize', tip: '左右拖：甲涂几份',
        drag: (c0, q) => { const d = model(c0.props).d1; return { n1: clamp(Math.round((q.x - X0) / BW * d), 0, d) }; }, say: (c1) => '甲 ' + c1.props.n1 + '/' + c1.props.d1 });
      out.push({ id: 'n2', x: X0 + BW * m.n2 / m.d2, y: YB + BH / 2, shape: 'bar-v', cursor: 'ew-resize', tip: '左右拖：乙涂几份',
        drag: (c0, q) => { const d = model(c0.props).d2; return { n2: clamp(Math.round((q.x - X0) / BW * d), 0, d) }; }, say: (c1) => '乙 ' + c1.props.n2 + '/' + c1.props.d2 });
    } else {
      out.push({ id: 't', x: m.X(m.t), y: TY, r: 9, cursor: 'ew-resize', tip: '左右拖：上面取多少，下面跟着走',
        drag: (c0, q) => { const m0 = model(c0.props); return { t: clamp(Math.round(m0.inv(q.x) / m0.tstep) * m0.tstep, 0, m0.tmax) }; },
        say: (c1) => { const m1 = model(c1.props); return m1.t + ' ↔ ' + qs(m1.bottom); } });
    }
    return out;
  }

  const I = (lo, hi, d, label, o) => Object.assign({ type: 'int', label, default: d, min: lo, max: hi, write: true }, o || {});
  U.registerPack({
    id: 'ratiobench', version: 1,
    types: {
      ratiobench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E3', 'E6'],
        label: '分数条与比', prefix: '分数条', group: '分数', grades: [3, 7],
        alias: ['分数', '比较分数', '等值分数', '通分', '比', '比例', '百分数', '正比例', '双数轴', '单价', '打折'],
        props: {
          mode: { type: 'choice', label: '用来做什么', default: 0, choices: MODES, write: true },
          d1: I(1, 12, 2, '甲切成几份'), n1: I(0, 12, 1, '甲涂几份'), d2: I(1, 12, 3, '乙切成几份'), n2: I(0, 12, 1, '乙涂几份'),
          pa: I(1, 1000, 3, '已知：上面的量'), pb: I(1, 100000, 12, '已知：下面对着的量'),
          tmax: I(1, 1000, 10, '上面的数轴到几'), tstep: I(1, 100, 1, '上面每一小格是几'), t: I(0, 1000, 0, '上面的点在几'),
          ua: { type: 'text', label: '上面的单位', default: '个', write: true }, ub: { type: 'text', label: '下面的单位', default: '元', write: true },
        },
        outputs: {
          a: { dim: null, kind: 'num', label: '甲（分数）/ 上面的点' },
          b: { dim: null, kind: 'num', label: '乙（分数）/ 下面对着的数' },
          cmp: { dim: null, kind: 'num', label: '甲比乙：1 大，0 一样，−1 小' },
          diff: { dim: null, kind: 'num', label: '相差多少' },
          sum: { dim: null, kind: 'num', label: '合起来' },
          db: { dim: null, kind: 'num', label: '乙切成几份' },
          rate: { dim: null, kind: 'num', label: '每 1 对着多少（双数轴）' },
        },
        icon: () => K.rect(8, 10, 48, 10, { stroke: 'var(--ink)', r: 0 }) + R(8, 10, 24, 10, '#f5a25d', 0.7) + K.rect(8, 26, 48, 10, { stroke: 'var(--ink)', r: 0 }) + R(8, 26, 16, 10, '#5b9bd5', 0.7),
        size: () => [W, 300],
        grips,
        compute: (c) => {
          const m = model(c.props), z = num(0);
          if (m.mode === 1) return { a: num(m.t), b: num(m.bottom), rate: num(m.rate), cmp: z, diff: z, sum: z, db: z };
          return { a: num(m.a), b: num(m.b), cmp: num(m.cmp), diff: num(m.diff), sum: num(m.sum), db: num(m.d2), rate: z };
        },
        badge: () => '',
        draw: (c) => { const m = model(c.props); return m.mode === 1 ? drawLines(c, m) : drawBars(c, m); },
      },
    },
  });
  U.RatioBench = { model, MODES };
})(typeof globalThis !== 'undefined' ? globalThis : window);
