/* 器材包 meanbench：平均数（移多补少）。几堆方块，高低不一样。
 * 全部在图上直接动手：
 *   - 拖一堆最上面的那块，放到另一堆上：搬一块。总数不变，只是换了地方。
 *   - 一条虚线标出“摊平以后每堆多高”。线上面多出来的块是橙色的，线下面空着的位置画成虚框：多出来的和空着的一样多。
 *   - 搬到每堆一样高，这个高度就是平均数。上面的算式同时写着：总数 ÷ 堆数。
 *   - “可以改数据”打开时：从托盘往一堆上拖是加一块，把一块拖到外面是拿走；还能加一堆、去掉一堆。看平均线怎么跟着动。
 * 换个皮就是别的题：几次考试的分数、几个人的身高、几天的气温。出题人改名字和单位就行。
 * 这一版的边界（如实写）：最多 8 堆，每堆最多 12 块，都是整数块；平均数不是整数时摊不平，线画在两块之间。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 640, X0 = 44, CWD = 54, BW = 40, BHT = 18, BASE = 290, NMAX = 8, HMAX = 12, TRAY = { x: 520, y: 250 };
  const parse = (t) => { const a = String(t || '').split(/[,，]/).map((s) => Number(s.trim())).filter((n) => Number.isInteger(n) && n >= 0).map((n) => Math.min(n, HMAX)).slice(0, NMAX); return a.length ? a : [0]; };
  const ser = (a) => a.join(',');
  function model(p) {
    const v = parse(p.vals), n = v.length, total = v.reduce((a, b) => a + b, 0), mean = Q(total, n);
    return { v, n, total, mean, meanN: total / n, level: v.every((x) => x === v[0]) ? 1 : 0, max: Math.max.apply(null, v), min: Math.min.apply(null, v) };
  }
  const colX = (i) => X0 + i * CWD;
  const colAt = (q, n) => { const i = Math.floor((q.x - X0 + (CWD - BW) / 2) / CWD); return i >= 0 && i < n && q.y <= BASE + 14 && q.y >= BASE - HMAX * BHT - 40 ? i : -1; };
  const free = (p) => p.free === true || p.free === 1;
  // 这一下拖动会做什么：{ patch, fx }
  function plan(p0, gid, q) {
    const v = parse(p0.vals), to = colAt(q, v.length), mv = (p0.moves || 0) + 1;
    if (gid === 'tray') {
      if (to < 0 || !free(p0)) return { patch: {}, fx: { carry: true } };
      if (v[to] >= HMAX) return { patch: {}, fx: { carry: true, note: '这一堆放满了' } };
      v[to]++; return { patch: { vals: ser(v) }, fx: { carry: true, to, note: '加了一块：总数多 1，平均线往上走' } };
    }
    const i = +gid.slice(1);
    if (to === i) return { patch: {}, fx: null };
    if (to < 0) {
      if (!free(p0)) return { patch: {}, fx: { carry: true, from: i, note: '这一题总数不能变：把它放到另一堆上' } };
      v[i]--; return { patch: { vals: ser(v) }, fx: { carry: true, from: i, note: '拿走一块：总数少 1，平均线往下走' } };
    }
    if (v[to] >= HMAX) return { patch: {}, fx: { carry: true, from: i, note: '这一堆放满了' } };
    v[i]--; v[to]++;
    return { patch: { vals: ser(v), moves: mv }, fx: { carry: true, from: i, to, note: '从第 ' + (i + 1) + ' 堆搬 1 块到第 ' + (to + 1) + ' 堆：总数不变，平均线不动' } };
  }
  const block = (x, y, kind) => K.rect(x, y, BW, BHT - 2, { fill: kind === 'over' ? '#f5a25d' : '#9fb7d9', stroke: kind === 'over' ? '#8a4a12' : '#2f4a73', r: 3, w: 1.2 });
  const hole = (x, y) => '<rect x="' + x + '" y="' + y + '" width="' + BW + '" height="' + (BHT - 2) + '" rx="3" fill="none" stroke="#8a94a8" stroke-width="1.2" stroke-dasharray="4 3"/>';
  const fmt = (m) => (Number.isInteger(m.meanN) ? String(m.meanN) : String(Math.round(m.meanN * 100) / 100));
  const setBtn = (x, y, w, label, patch, on, tip) => '<g' + (on ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' opacity="0.4"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 24, { fill: '#fff', stroke: on ? 'var(--blue)' : '#8a94a8', r: 7, w: 1.5 }) + K.text(x + w / 2, y + 16, label, { size: 12, weight: 700 }) + '</g>';

  function draw(c) {
    const p = c.props, m = model(p), u = p.unit || '块', mw = p.mw || '堆', names = String(p.names || '').split(/[,，]/).map((s) => s.trim()).filter(Boolean), line = p.showline !== false && p.showline !== 0;
    const dg = c.drag ? plan(c.drag.p0, c.drag.grip, c.drag) : null, fx = dg && dg.fx;
    let s = '', over = 0, under = 0;
    // askTotal：总数是要求的答案（比如 1 + 2 + … + 7），搬平以前写“？”，搬平以后写成 平均 × 堆数
    const tot = !p.askTotal ? String(m.total) : m.level ? m.v[0] + ' × ' + m.n + ' = ' + m.total : '？';
    s += K.text(20, 26, '一共 ' + tot + ' ' + u + '，' + m.n + ' ' + mw, { size: 16, weight: 700, anchor: 'start' });
    const msg = fx && fx.note ? fx.note : m.level ? m.total + ' ÷ ' + m.n + ' = ' + fmt(m) + '：每' + mw + '一样多，这就是平均数' : !Number.isInteger(m.meanN) ? '搬不成一样高：平均数不是整数，在两块之间' : line ? '把线上面多出来的，搬到线下面空着的地方' : '把高的搬给矮的，搬到一样高';
    s += K.text(20, 48, msg, { size: 13, weight: 700, anchor: 'start', fill: fx && fx.note ? 'var(--blue)' : m.level ? 'var(--good)' : 'var(--ink)' });
    s += K.line(X0 - 14, BASE, colX(m.n - 1) + BW + 14, BASE, { w: 3 });
    m.v.forEach((h, i) => {
      const x = colX(i);
      for (let b = 0; b < h; b++) { const ov = line && b >= m.meanN; if (ov) over++; s += block(x, BASE - (b + 1) * BHT, ov ? 'over' : 'in'); }
      if (line) for (let b = h; b < m.meanN && b + 1 <= Math.ceil(m.meanN); b++) { if (b + 1 <= m.meanN) { under++; s += hole(x, BASE - (b + 1) * BHT); } }
      s += K.text(x + BW / 2, BASE - h * BHT - 6, String(h), { size: 13, weight: 700, fill: fx && (fx.from === i || fx.to === i) ? 'var(--blue)' : 'var(--ink)' });
      s += K.text(x + BW / 2, BASE + 17, names[i] || String(i + 1), { size: 11 });
    });
    if (line) {
      const y = BASE - m.meanN * BHT, x1 = colX(m.n - 1) + BW + 18;
      s += '<g data-meanline="' + fmt(m) + '">' + K.line(X0 - 14, y, x1, y, { w: 2, stroke: 'var(--good)', dash: '7 5' }) + K.text(x1 + 6, y + 4, '平均 ' + fmt(m), { size: 13, weight: 700, anchor: 'start', fill: 'var(--good)' }) + '</g>';
      if (!m.level && Number.isInteger(m.meanN)) s += K.text(W - 20, 26, '线上多出来 ' + over + ' ' + u + '，线下空着 ' + under + ' ' + u, { size: 12, anchor: 'end' });
    }
    s += setBtn(W - 150, 36, 130, line ? '平均线：显示' : '平均线：隐藏', { showline: !line }, true, line ? '点一下把平均线藏起来，自己搬搬看' : '点一下显示平均线');
    if (free(p)) {
      s += K.text(TRAY.x, TRAY.y - 20, '往一堆上拖：加一块', { size: 12 }) + block(TRAY.x - BW / 2, TRAY.y - 8, 'in');
      s += setBtn(W - 150, 66, 62, '加一' + mw, { vals: ser(m.v.concat([0])) }, m.n < NMAX, '多一' + mw + '（先是空的）：平均数会变小');
      s += setBtn(W - 82, 66, 62, '去掉一' + mw, { vals: ser(m.v.slice(0, -1)) }, m.n > 1, '去掉最后一' + mw);
    }
    if (dg && fx && fx.carry) s += '<g data-carry="1">' + block(c.drag.x - BW / 2, c.drag.y - BHT / 2, 'in') + '</g>';
    return s;
  }
  function grips(c) {
    const p = c.props, m = model(p), out = [];
    m.v.forEach((h, i) => { if (h > 0) out.push({ id: 'c' + i, x: colX(i) + BW / 2, y: BASE - h * BHT + BHT / 2 - 1, r: 9, ghost: true, cursor: 'grab', tip: '拖到另一堆上：搬一块', drag: (c0, q) => plan(c0.props, 'c' + i, q).patch, say: (c1) => parse(c1.props.vals).join('、') }); });
    if (free(p)) out.push({ id: 'tray', x: TRAY.x, y: TRAY.y, r: 12, ghost: true, cursor: 'grab', tip: '拖到一堆上：加一块', drag: (c0, q) => plan(c0.props, 'tray', q).patch, say: (c1) => '一共 ' + model(c1.props).total });
    return out;
  }
  const T = (d, label, o) => Object.assign({ type: 'text', label, default: d, write: true }, o || {});
  U.registerPack({
    id: 'meanbench', version: 1,
    types: {
      meanbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E7', 'E2'],
        label: '平均数（移多补少）', prefix: '平均数', group: '统计与概率', grades: [3, 8],
        alias: ['平均数', '移多补少', '求平均', '摊平', '平均分'],
        props: {
          vals: T('3,7,5,9', '每一堆有几块（用逗号隔开）'),
          names: T('', '每一堆叫什么（用逗号隔开，可以不填）'), unit: T('块', '数的是什么'), mw: T('堆', '一“堆”叫什么'),
          showline: { type: 'bool', label: '显示平均线', default: true, write: true },
          free: { type: 'bool', label: '可以改数据（加一块、拿走一块、加一堆）', default: false, write: true },
          askTotal: { type: 'bool', label: '总数先不告诉：搬平了才写出来（平均 × 堆数）', default: false, write: true },
          moves: { type: 'int', label: '搬了几次（自动记录）', default: 0, min: 0, max: 999, write: true, hidden: true },
        },
        outputs: {
          mean: { dim: null, kind: 'num', label: '平均数' }, total: { dim: null, kind: 'num', label: '总数' }, n: { dim: null, kind: 'num', label: '有几堆' },
          level: { dim: null, kind: 'num', label: '每堆一样多：1 是，0 否' }, max: { dim: null, kind: 'num', label: '最多的一堆' }, min: { dim: null, kind: 'num', label: '最少的一堆' },
          moves: { dim: null, kind: 'num', label: '搬了几次' },
        },
        icon: () => K.rect(10, 22, 10, 16, { fill: '#9fb7d9', stroke: 'var(--ink)', w: 1 }) + K.rect(24, 10, 10, 28, { fill: '#9fb7d9', stroke: 'var(--ink)', w: 1 }) + K.rect(38, 16, 10, 22, { fill: '#9fb7d9', stroke: 'var(--ink)', w: 1 }) + K.line(6, 18, 56, 18, { w: 1.5, stroke: 'var(--good)', dash: '4 3' }),
        size: () => [W, 350],
        grips,
        compute: (c) => { const m = model(c.props); const o = { mean: U.val('num', m.mean, { dim: null }), total: num(m.total), n: num(m.n), level: num(m.level), max: num(m.max), min: num(m.min), moves: num(c.props.moves || 0) }; if (c.props.askTotal && !m.level) delete o.total; return o; },
        badge: () => '',
        draw,
      },
    },
  });
  U.MeanBench = { parse, ser, model, plan };
})(typeof globalThis !== 'undefined' ? globalThis : window);
