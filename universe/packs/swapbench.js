/* 器材包 swapbench：换一换（鸡兔同笼的假设法）。docs/instrument-design.md 第 10 节之后加的操作台。
 * 一共 n 个（头），每个要么是甲（鸡，每个 la 条腿），要么是乙（兔，每个 lb 条腿），总数要凑到 T。
 * 全部在图上直接动手：
 *   - 点一个甲，它变成乙（多 lb − la）；点一个乙，它变回甲。
 *   - 乙排在前面，甲排在后面，中间有一个把手：拖它，一次换好几个。
 *   - 上面一直写着现在的总数、离目标差多少、每换一个变多少；超过目标会标红。
 *   - 右边的表记下试过的每一种：乙几个、甲几个、总数多少。表里相邻两行总是差同一个数——这就是假设法的依据。
 * 同一个台面可以换皮：大船小船、2 分球 3 分球、5 元 10 元、三轮车自行车。出题人改名字和每个的数就行。
 * 这一版的边界（如实写）：最多 40 个；两种东西；每个的数是正整数（没有“答错倒扣分”那种负数）。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 640, GX = 24, GY = 78, CW = 38, CH = 46, COLS = 10, NMAX = 40;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  function model(p) {
    const n = clamp(p.n, 1, NMAX), la = clamp(p.la, 1, 99), lb = clamp(p.lb, 1, 99), k = clamp(p.k, 0, n), T = p.target;
    const total = k * lb + (n - k) * la, tried = String(p.tried || '').split(',').filter((s) => s !== '').map(Number).filter((x) => Number.isInteger(x) && x >= 0 && x <= n);
    return { n, la, lb, k, T, total, diff: T - total, step: lb - la, tried, ok: total === T ? 1 : 0 };
  }
  // 换成 k 个乙，并把它记进“试过的”里
  function to(p, k) {
    const m = model(p), kk = clamp(k, 0, m.n); if (kk === m.k) return {};
    const tr = m.tried.length ? m.tried.slice() : [m.k]; if (tr[tr.length - 1] !== kk) tr.push(kk);
    return { k: kk, tried: tr.slice(-12).join(',') };
  }
  const cell = (i) => ({ x: GX + (i % COLS) * CW, y: GY + Math.floor(i / COLS) * CH });
  // 一个头：圆圈里写名字的第一个字，下面画腿（不超过 8 条就画线，多了就写数）
  function one(i, isB, m, p) {
    const c = cell(i), cx = c.x + CW / 2, cy = c.y + 14, legs = isB ? m.lb : m.la, col = isB ? '#f5a25d' : '#9fb7d9', nm = String((isB ? p.nb : p.na) || '').slice(0, 1);
    let s = K.circle(cx, cy, 12, { fill: col, stroke: 'var(--ink)', w: 1.4 }) + K.text(cx, cy + 5, nm, { size: 12, weight: 700 });
    if (p.style === 0 && legs <= 8) for (let j = 0; j < legs; j++) { const lx = cx - (legs - 1) * 2.4 + j * 4.8; s += K.line(lx, cy + 12, lx, cy + 26, { w: 1.8 }); }
    else s += K.text(cx, cy + 27, String(legs), { size: 12, weight: 700 });
    return '<g data-pick-set="' + encodeURIComponent(JSON.stringify(to(p, isB ? m.k - 1 : m.k + 1))) + '" style="cursor:pointer"><title>点一下：' + (isB ? '换回' + p.na : '换成' + p.nb) + '</title>' +
      '<rect x="' + c.x + '" y="' + c.y + '" width="' + CW + '" height="' + CH + '" fill="transparent"/>' + s + '</g>';
  }
  function draw(c) {
    const p = c.props, m = model(p), u = p.unit || ''; let s = '';
    const over = m.step > 0 ? m.total > m.T : m.total < m.T;
    s += K.text(GX, 26, m.n + ' 个，' + p.nb + ' ' + m.k + ' 个、' + p.na + ' ' + (m.n - m.k) + ' 个', { size: 15, weight: 700, anchor: 'start' });
    s += K.text(GX, 50, (c.masked ? '一共 ？' : '一共 ' + m.total + ' ' + u) + '　目标 ' + m.T + ' ' + u + (m.ok ? '　正好！' : c.masked ? '' : over ? '　多了 ' + Math.abs(m.diff) : '　还差 ' + Math.abs(m.diff)), { size: 15, weight: 700, anchor: 'start', fill: m.ok ? 'var(--good)' : over && !c.masked ? 'var(--bad)' : 'var(--ink)' });
    for (let i = 0; i < m.n; i++) s += one(i, i < m.k, m, p);
    const rows = Math.ceil(m.n / COLS), by = GY + rows * CH + 18;
    s += K.text(GX, by, '把一个' + p.na + '换成' + p.nb + '：' + (m.step >= 0 ? '多 ' : '少 ') + Math.abs(m.step) + ' ' + u + '。点一个就换一个；拖中间的把手，一次换好几个。', { size: 12, anchor: 'start' });
    // 试过的
    const tx = GX + COLS * CW + 26;
    s += K.text(tx, 26, p.nb, { size: 12, weight: 700, anchor: 'start' }) + K.text(tx + 50, 26, p.na, { size: 12, weight: 700, anchor: 'start' }) + K.text(tx + 100, 26, '一共', { size: 12, weight: 700, anchor: 'start' });
    const tr = m.tried.length ? m.tried : [m.k];
    tr.slice(-9).forEach((k, i) => {
      const tot = k * m.lb + (m.n - k) * m.la, hit = tot === m.T, y = 46 + i * 20;
      s += K.text(tx, y, String(k), { size: 13, anchor: 'start' }) + K.text(tx + 50, y, String(m.n - k), { size: 13, anchor: 'start' }) + K.text(tx + 100, y, c.masked ? '？' : String(tot), { size: 13, anchor: 'start', weight: hit ? 700 : 400, fill: hit ? 'var(--good)' : 'var(--ink)' });
    });
    return s;
  }
  function grips(c) {
    const m = model(c.props), at = cell(Math.min(m.k, m.n - 1)), x = m.k >= m.n ? at.x + CW : at.x, edge = m.k > 0 && m.k % COLS === 0 && m.k < m.n;
    const gx = edge ? cell(m.k - 1).x + CW : x, gy = (edge ? cell(m.k - 1).y : at.y) + CH / 2 - 2;
    return [{ id: 'k', x: gx, y: gy, shape: 'bar-v', cursor: 'ew-resize', tip: '拖我：把手左边的都是' + c.props.nb + '，右边的都是' + c.props.na,
      drag: (c0, q) => {
        const m0 = model(c0.props), row = clamp(Math.floor((q.y - GY) / CH), 0, Math.ceil(m0.n / COLS) - 1), col = clamp(Math.round((q.x - GX) / CW), 0, COLS);
        return to(c0.props, clamp(row * COLS + col, 0, m0.n));
      },
      say: (c1) => { const m1 = model(c1.props); return c1.props.nb + ' ' + m1.k + '，' + c1.props.na + ' ' + (m1.n - m1.k) + '：' + m1.total; } }];
  }
  const I = (lo, hi, d, label, o) => Object.assign({ type: 'int', label, default: d, min: lo, max: hi, write: true }, o || {});
  const T = (d, label, o) => Object.assign({ type: 'text', label, default: d, write: true }, o || {});
  U.registerPack({
    id: 'swapbench', version: 1,
    types: {
      swapbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E7', 'E4'],
        label: '换一换（鸡兔同笼）', prefix: '换一换', group: '关系', grades: [3, 7],
        alias: ['鸡兔同笼', '假设法', '列表法', '大船小船', '二元一次方程组', '替换'],
        props: {
          n: I(1, NMAX, 8, '一共几个'), k: I(0, NMAX, 0, '现在有几个是乙'), target: I(0, 9999, 26, '总数要凑到'),
          la: I(1, 99, 2, '每个甲是几'), lb: I(1, 99, 4, '每个乙是几'),
          na: T('鸡', '甲叫什么'), nb: T('兔', '乙叫什么'), unit: T('条腿', '数的是什么'),
          style: { type: 'choice', label: '画法', default: 0, choices: ['画腿', '写数'], write: true },
          tried: T('', '试过的（自动记录）', { hidden: true }),
        },
        outputs: {
          b: { dim: null, kind: 'num', label: '乙（兔）有几个' }, a: { dim: null, kind: 'num', label: '甲（鸡）有几个' },
          total: { dim: null, kind: 'num', label: '现在的总数' }, ok: { dim: null, kind: 'num', label: '正好凑到：1 是，0 否' },
          tries: { dim: null, kind: 'num', label: '试了几种' },
        },
        icon: () => K.circle(20, 16, 9, { fill: '#9fb7d9', stroke: 'var(--ink)' }) + K.line(17, 25, 17, 36, {}) + K.line(23, 25, 23, 36, {}) + K.circle(44, 16, 9, { fill: '#f5a25d', stroke: 'var(--ink)' }) + K.line(38, 25, 38, 36, {}) + K.line(42, 25, 42, 36, {}) + K.line(46, 25, 46, 36, {}) + K.line(50, 25, 50, 36, {}),
        size: (e) => [W, 150 + Math.ceil(clamp(((e && e.props && e.props.n) || 8), 1, NMAX) / COLS) * CH],
        grips,
        compute: (c) => { const m = model(c.props); return { b: num(m.k), a: num(m.n - m.k), total: num(m.total), ok: num(m.ok), tries: num(Math.max(1, m.tried.length)) }; },
        badge: () => '',
        draw,
      },
    },
  });
  U.SwapBench = { model, to };
})(typeof globalThis !== 'undefined' ? globalThis : window);
