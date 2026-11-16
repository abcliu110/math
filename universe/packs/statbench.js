/* 器材包 statbench：数据与统计图。一组数画成条形图，学生自己排队、找众数、找中位数、看平均线、看最多和最少差多少。
 * 全部在图上直接动手：
 *   - 点“从小到大排队”：柱子按高矮重新排好。只有排好队，“中位数”才能点：正中间那一根（或中间两根的平均）亮起来。
 *   - 点“众数”：一样高的柱子同一种颜色，下面数出每个数出现几次，次数最多的标出来。
 *   - 点“平均数”：画一条虚线，就是把柱子摊平以后的高度（和“平均数”操作台是一回事）。
 *   - 点“最多 − 最少”：最高和最低之间画一个括号，写出差（极差）。
 *   - 可以改数据的题：拖柱子的顶端改大小；加一根、去掉一根。拖的时候看平均线和中位数谁动得多。
 * 这四个量只有点开了才算出来（输出口才有值）：先自己想，再点开看。
 * 这一版的边界（如实写）：最多 12 个数，都是 0 到 999 的整数；只有条形图（没有折线图、扇形图、散点图）。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null }), qv = (q) => U.val('num', q, { dim: null });
  const W = 700, X0 = 64, X1 = 452, BASE = 300, TOP = 76, RX = 476, NMAX = 12;
  const on = (v) => v === true || v === 1;
  const parse = (t) => { const a = String(t || '').split(/[,，\s]+/).filter(Boolean).map(Number).filter((n) => Number.isInteger(n) && n >= 0 && n <= 999).slice(0, NMAX); return a.length ? a : [0]; };
  const ser = (a) => a.join(', ');
  function model(p) {
    const v = parse(p.vals), n = v.length, total = v.reduce((a, b) => a + b, 0), s = v.slice().sort((a, b) => a - b);
    const sorted = v.every((x, i) => i === 0 || v[i - 1] <= x);
    const cnt = {}; v.forEach((x) => { cnt[x] = (cnt[x] || 0) + 1; });
    const top = Math.max.apply(null, Object.values(cnt)), modes = Object.keys(cnt).map(Number).filter((k) => cnt[k] === top).sort((a, b) => a - b);
    const median = n % 2 ? Q(s[(n - 1) / 2]) : Q(s[n / 2 - 1] + s[n / 2], 2);
    const max = s[n - 1], min = s[0], vmax = p.vmax > 0 ? p.vmax : Math.max(10, Math.ceil(max * 1.15));
    return { v, n, total, mean: Q(total, n), median, sorted, cnt, top, modes, max, min, range: max - min, vmax };
  }
  const fmt = (q) => U.Q.show(q);
  const btn = (x, y, w, label, patch, active, enabled, tip) => '<g' + (enabled ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' data-off="1"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 26, { fill: active ? 'var(--blue)' : enabled ? '#fff' : '#f1f3f6', stroke: enabled ? 'var(--blue)' : '#b8c0cc', r: 8, w: 1.5 }) + K.text(x + w / 2, y + 17, label, { size: 12, weight: 700, fill: active ? '#fff' : enabled ? 'var(--ink)' : '#5f6773' }) + '</g>';   // 不能点：灰底、深灰字（不用透明度，字的对比度够）
  const geo = (m) => { const slot = (X1 - X0) / m.n, bw = Math.min(46, slot * 0.7); return { slot, bw, x: (i) => X0 + i * slot + (slot - bw) / 2, y: (v) => BASE - (v / m.vmax) * (BASE - TOP) }; };

  function draw(c) {
    const p = c.props, m = model(p), g = geo(m), u = p.unit || '', names = String(p.names || '').split(/[,，]/).map((s) => s.trim()).filter(Boolean);
    const sm = on(p.smean), sd = on(p.smed) && m.sorted, so = on(p.smode), sr = on(p.srange);
    let s = K.text(20, 26, m.n + ' 个数：' + m.v.join('、') + (u ? '（' + u + '）' : ''), { size: 15, weight: 700, anchor: 'start' });
    s += K.text(20, 48, m.sorted ? '已经从小到大排好了' : '还没排队', { size: 12, anchor: 'start', fill: m.sorted ? 'var(--good)' : '#5a6478' });
    // 坐标轴和刻度
    s += K.line(X0 - 8, BASE, X1 + 6, BASE, { w: 2 }) + K.line(X0 - 8, TOP - 8, X0 - 8, BASE, { w: 1.2 });
    const step = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500].find((k) => m.vmax / k <= 6) || 1000;
    for (let t = 0; t <= m.vmax; t += step) s += K.line(X0 - 12, g.y(t), X0 - 8, g.y(t), { w: 1 }) + K.text(X0 - 15, g.y(t) + 4, String(t), { size: 10, anchor: 'end', fill: '#5a6478' });
    // 中位数的位置（排好队才有）
    const midIdx = m.n % 2 ? [(m.n - 1) / 2] : [m.n / 2 - 1, m.n / 2];
    m.v.forEach((v, i) => {
      const isMode = so && m.top > 1 && m.modes.includes(v), isMid = sd && midIdx.includes(i), isMax = sr && v === m.max, isMin = sr && v === m.min;
      const fill = isMid ? '#9fd5ad' : isMode ? '#f5a25d' : '#9fb7d9', stroke = isMid ? '#1f6a34' : isMode ? '#8a4a12' : '#2f4a73';
      s += '<rect data-bar="' + i + '" x="' + g.x(i) + '" y="' + g.y(v) + '" width="' + g.bw + '" height="' + (BASE - g.y(v)) + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + (isMax || isMin ? 2.4 : 1.3) + '"/>';
      s += K.text(g.x(i) + g.bw / 2, g.y(v) - 6, String(v), { size: 12, weight: 700 });
      s += K.text(g.x(i) + g.bw / 2, BASE + 16, names[i] || String(i + 1), { size: 10, fill: '#5a6478' });
    });
    if (sm) { const y = g.y(Q.num(m.mean)); s += '<g data-meanline="1">' + K.line(X0 - 8, y, X1 + 6, y, { w: 2, stroke: 'var(--good)', dash: '7 5' }) + K.text(X1 + 4, y - 5, '平均 ' + fmt(m.mean), { size: 11, weight: 700, anchor: 'end', fill: 'var(--good)' }) + '</g>'; }
    if (sr) { const xb = X1 + 2, y1 = g.y(m.max), y2 = g.y(m.min); s += K.line(X0 - 8, y1, xb, y1, { w: 1, dash: '3 3', stroke: 'var(--bad)' }) + K.line(X0 - 8, y2, xb, y2, { w: 1, dash: '3 3', stroke: 'var(--bad)' }) + K.line(xb, y1, xb, y2, { w: 2, stroke: 'var(--bad)' }); }
    // 右边：四个按钮和读出来的量
    const lines = [];
    s += btn(RX, 64, 206, '从小到大排队', { vals: ser(m.v.slice().sort((a, b) => a - b)) }, false, !m.sorted, '把柱子按高矮排好：最矮的在左边');
    s += btn(RX, 98, 100, '平均数', { smean: !sm }, sm, true, '画出平均线：把柱子摊平以后的高度');
    s += btn(RX + 106, 98, 100, '中位数', { smed: !on(p.smed) }, sd, m.sorted, m.sorted ? '正中间那一根' : '先排队，才看得出哪一根在正中间');
    s += btn(RX, 132, 100, '众数', { smode: !so }, so, true, '哪个数出现的次数最多');
    s += btn(RX + 106, 132, 100, '最多 − 最少', { srange: !sr }, sr, true, '最大的数减最小的数（极差）');
    if (sm) lines.push(['平均数 = ' + m.total + ' ÷ ' + m.n + ' = ' + fmt(m.mean), 'var(--good)']);
    if (on(p.smed) && !m.sorted) lines.push(['中位数：先排队', 'var(--bad)']);
    if (sd) lines.push(['中位数 = ' + fmt(m.median) + (m.n % 2 ? '（第 ' + ((m.n + 1) / 2) + ' 个）' : '（中间两个的平均）'), '#1f6a34']);
    if (so) lines.push([m.top > 1 ? '众数 = ' + m.modes.join('、') + '（出现 ' + m.top + ' 次）' : '每个数都只出现 1 次', '#8a4a12']);
    if (sr) lines.push(['最多 − 最少 = ' + m.max + ' − ' + m.min + ' = ' + m.range, 'var(--bad)']);
    lines.forEach(([t, col], i) => { s += K.text(RX, 186 + i * 24, t, { size: 13, weight: 700, anchor: 'start', fill: col }); });
    if (so) { const keys = Object.keys(m.cnt).map(Number).sort((a, b) => a - b); s += K.text(RX, 300, keys.map((k) => k + '：' + m.cnt[k] + ' 次').join('　').slice(0, 60), { size: 11, anchor: 'start', fill: '#5a6478' }); }
    if (on(p.free)) {
      s += btn(20, 326, 96, '加一个数', { vals: ser(m.v.concat([Math.round(m.vmax / 2)])) }, false, m.n < NMAX, '多加一根柱子（再拖它的高度）');
      s += btn(122, 326, 108, '去掉最后一个', { vals: ser(m.v.slice(0, -1)) }, false, m.n > 1, '去掉最右边那一根');
      s += K.text(240, 343, '拖柱子的顶端改大小', { size: 12, anchor: 'start', fill: '#5a6478' });
    }
    return s;
  }
  function grips(c) {
    const p = c.props; if (!on(p.free)) return [];
    const m = model(p), g = geo(m);
    return m.v.map((v, i) => ({ id: 'b' + i, x: g.x(i) + g.bw / 2, y: g.y(v), r: 9, shape: 'bar-h', cursor: 'ns-resize', tip: '拖我：改这个数',
      drag: (c0, q) => { const m0 = model(c0.props), g0 = geo(m0), a = m0.v.slice(); a[i] = Math.max(0, Math.min(999, Math.round((BASE - q.y) / (BASE - TOP) * m0.vmax))); return { vals: ser(a), vmax: m0.vmax }; },
      say: (c1) => { const m1 = model(c1.props); return '这个数 ' + m1.v[i] + (on(c1.props.smean) ? '，平均 ' + fmt(m1.mean) : '') + (on(c1.props.smed) && m1.sorted ? '，中位数 ' + fmt(m1.median) : ''); } }));
  }
  const B = (label) => ({ type: 'bool', label, default: false, write: true });
  U.registerPack({
    id: 'statbench', version: 1,
    types: {
      statbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E7', 'E9'],
        label: '数据与统计图', prefix: '统计图', group: '统计与概率', grades: [2, 9],
        alias: ['统计', '条形统计图', '平均数', '中位数', '众数', '极差', '数据', '排序'],
        props: {
          vals: { type: 'text', label: '一组数（用逗号隔开）', default: '5, 5, 2, 5, 3', write: true },
          names: { type: 'text', label: '每根柱子下面写什么（用逗号隔开，可以不填）', default: '', write: true },
          unit: { type: 'text', label: '单位', default: '', write: true },
          vmax: { type: 'int', label: '纵轴最多到几（0 是自动）', default: 0, min: 0, max: 999, write: true },
          smean: B('显示平均数'), smed: B('显示中位数'), smode: B('显示众数'), srange: B('显示最多 − 最少'),
          free: B('可以改数据（拖柱子、加一个、去掉一个）'),
        },
        outputs: {
          n: { dim: null, kind: 'num', label: '有几个数' }, total: { dim: null, kind: 'num', label: '加起来' }, sorted: { dim: null, kind: 'num', label: '排好队了：1 是，0 否' },
          mean: { dim: null, kind: 'num', label: '平均数（点开了才有）' }, median: { dim: null, kind: 'num', label: '中位数（排好队并点开了才有）' },
          mode: { dim: null, kind: 'num', label: '众数（点开了才有；有几个时取最小的）' }, modecount: { dim: null, kind: 'num', label: '众数出现了几次（点开了才有）' },
          range: { dim: null, kind: 'num', label: '最多 − 最少（点开了才有）' }, max: { dim: null, kind: 'num', label: '最大的数' }, min: { dim: null, kind: 'num', label: '最小的数' },
        },
        icon: () => K.rect(10, 26, 9, 12, { fill: '#9fb7d9', stroke: 'var(--ink)', w: 1 }) + K.rect(23, 12, 9, 26, { fill: '#f5a25d', stroke: 'var(--ink)', w: 1 }) + K.rect(36, 20, 9, 18, { fill: '#9fb7d9', stroke: 'var(--ink)', w: 1 }) + K.line(6, 22, 52, 22, { w: 1.4, stroke: 'var(--good)', dash: '3 2' }),
        size: () => [W, 370],
        grips,
        compute: (c) => {
          const p = c.props, m = model(p), o = { n: num(m.n), total: num(m.total), sorted: num(m.sorted ? 1 : 0), max: num(m.max), min: num(m.min) };
          if (on(p.smean)) o.mean = qv(m.mean);
          if (on(p.smed) && m.sorted) o.median = qv(m.median);
          if (on(p.smode)) { o.mode = num(m.modes[0]); o.modecount = num(m.top); }
          if (on(p.srange)) o.range = num(m.range);
          return o;
        },
        badge: () => '',
        draw,
      },
    },
  });
  U.StatBench = { model, parse };
})(typeof globalThis !== 'undefined' ? globalThis : window);
