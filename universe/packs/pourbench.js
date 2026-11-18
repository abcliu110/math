/* 器材包 pourbench：倒水（两个没有刻度的杯子）。
 *   下面一排按钮：装满甲、装满乙、倒空甲、倒空乙、甲倒进乙、乙倒进甲（倒到一个满了或另一个空了为止），还有退一步、重来。
 *   卡片上画出两杯水有多少，下面记下每一步以后两杯各有多少、总量多少。
 *   有目标（tgt > 0）时：甲或乙里正好有目标那么多就“量出来了”，再和最少要几步比（一层一层往外找）。
 *   只在两杯之间倒（不装、不倒空）时，总量一直不变：这就是守恒。
 * 这一版的边界（如实写）：两个杯子，容量 1–12 升，水量都是整数升。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 640;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? Math.round(+v) : lo));
  const OPS = { fA: '装满甲', fB: '装满乙', eA: '倒空甲', eB: '倒空乙', AB: '甲倒进乙', BA: '乙倒进甲' };
  const KEYS = Object.keys(OPS);
  function step(s, op, A, B) {
    let [a, b] = s;
    if (op === 'fA') a = A; else if (op === 'fB') b = B; else if (op === 'eA') a = 0; else if (op === 'eB') b = 0;
    else if (op === 'AB') { const t = Math.min(a, B - b); a -= t; b += t; } else if (op === 'BA') { const t = Math.min(b, A - a); b -= t; a += t; }
    return [a, b];
  }
  // 最少几步量出 t 升（甲或乙里正好 t）；量不出来是 −1。path 是一条最短的做法
  function fewest(A, B, a0, b0, t) {
    const k = (s) => s[0] + ',' + s[1], seen = new Map([[k([a0, b0]), []]]); let q = [[a0, b0]];
    if (a0 === t || b0 === t) return { n: 0, path: [] };
    while (q.length) {
      const nq = [];
      for (const s of q) for (const op of KEYS) {
        const ns = step(s, op, A, B), key = k(ns); if (seen.has(key)) continue;
        const path = seen.get(k(s)).concat([op]); seen.set(key, path);
        if (ns[0] === t || ns[1] === t) return { n: path.length, path };
        nq.push(ns);
      }
      q = nq;
    }
    return { n: -1, path: [] };
  }
  function model(p) {
    const A = clamp(p.A, 1, 12), B = clamp(p.B, 1, 12), a0 = clamp(p.a, 0, A), b0 = clamp(p.b, 0, B), tgt = clamp(p.tgt, 0, 12);
    const hist = String(p.hist || '').split(',').filter((x) => OPS[x]);
    const states = [[a0, b0]]; for (const op of hist) states.push(step(states[states.length - 1], op, A, B));
    const [a, b] = states[states.length - 1];
    const onlyPour = hist.length > 0 && hist.every((x) => x === 'AB' || x === 'BA');
    const hit = tgt > 0 && hist.length > 0 && (a === tgt || b === tgt);
    const best = tgt > 0 ? fewest(A, B, a0, b0, tgt) : { n: -1, path: [] };
    return { A, B, a0, b0, tgt, hist, states, a, b, total: a + b, onlyPour, hit, best };
  }
  const btn = (x, y, w, label, patch, enabled, tip) => '<g' + (enabled ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' data-off="1"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 28, { fill: enabled ? '#fff' : '#f1f3f6', stroke: enabled ? 'var(--blue)' : '#b8c0cc', r: 7, w: 1.4 }) + K.text(x + w / 2, y + 18, label, { size: 12, weight: 700, fill: enabled ? 'var(--ink)' : '#5f6773' }) + '</g>';
  function cup(x, name, cap, v, maxCap) {
    const H = 150, h = H * cap / maxCap, y0 = 220, w = 90, lv = h * v / cap;
    let s = K.rect(x, y0 - h, w, h, { fill: '#fff', stroke: 'var(--ink)', r: 3, w: 2 });
    if (v > 0) s += K.rect(x + 2, y0 - lv, w - 4, lv - 1, { fill: '#9fc3ea', stroke: 'none', r: 2, w: 0 });
    s += K.text(x + w / 2, y0 + 20, name + '杯（装 ' + cap + ' 升）', { size: 12, weight: 700 });
    s += K.text(x + w / 2, y0 - h - 8, v + ' 升', { size: 15, weight: 700, fill: 'var(--blue)' });
    return s;
  }
  function draw(c) {
    const m = model(c.props), hasT = m.tgt > 0; let s = '';
    s += K.text(20, 26, hasT ? '只用 ' + m.A + ' 升和 ' + m.B + ' 升的杯子（没有刻度），量出 ' + m.tgt + ' 升' : '甲杯、乙杯倒来倒去：每杯的水变了，总量呢？', { size: 15, weight: 700, anchor: 'start' });
    const mx = Math.max(m.A, m.B);
    s += cup(60, '甲', m.A, m.a, mx) + cup(200, '乙', m.B, m.b, mx);
    s += K.text(330, 70, '现在：甲 ' + m.a + ' 升，乙 ' + m.b + ' 升', { size: 14, weight: 700, anchor: 'start' });
    s += '<g data-total="1">' + K.text(330, 94, '总量：' + m.a + ' + ' + m.b + ' = ' + m.total + ' 升', { size: 14, anchor: 'start' }) + '</g>';
    // 每一步
    const rows = m.hist.map((op, i) => (i + 1) + '. ' + OPS[op] + ' → ' + m.states[i + 1][0] + ', ' + m.states[i + 1][1]);
    const shown = rows.slice(-6);
    shown.forEach((r, i) => { s += K.text(330, 122 + i * 18, r, { size: 12, anchor: 'start', fill: '#3a4a63' }); });
    if (rows.length > 6) s += K.text(330, 122 + 6 * 18, '（前面还有 ' + (rows.length - 6) + ' 步）', { size: 11, anchor: 'start', fill: '#5f6773' });
    const [a, b] = [m.a, m.b], push = (op) => ({ hist: m.hist.concat([op]).join(',') });
    const can = { fA: a < m.A, fB: b < m.B, eA: a > 0, eB: b > 0, AB: a > 0 && b < m.B, BA: b > 0 && a < m.A };
    const done = hasT && m.hit;
    KEYS.forEach((op, i) => { s += btn(20 + i * 100, 250, 92, OPS[op], push(op), can[op] && !done, OPS[op]); });
    s += btn(20, 284, 92, '退一步', { hist: m.hist.slice(0, -1).join(',') }, m.hist.length > 0, '退一步');
    s += btn(120, 284, 92, '重来', { hist: '' }, m.hist.length > 0, '重来');
    s += K.text(230, 303, '做了 ' + m.hist.length + ' 步', { size: 13, anchor: 'start' });
    if (!hasT && m.onlyPour) s += '<g data-read="1">' + K.text(20, 334, '只在两杯之间倒：甲 ' + m.a + ' + 乙 ' + m.b + ' = ' + m.total + '，总量和开始一样（' + (m.a0 + m.b0) + ' 升）', { size: 14, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
    if (done) s += '<g data-read="1">' + K.text(20, 334, '量出来了！' + (m.a === m.tgt ? '甲' : '乙') + '杯正好 ' + m.tgt + ' 升，做了 ' + m.hist.length + ' 步' + (m.hist.length === m.best.n ? '：最少就是 ' + m.best.n + ' 步' : '；最少 ' + m.best.n + ' 步就够'), { size: 14, weight: 700, anchor: 'start', fill: m.hist.length === m.best.n ? 'var(--blue)' : 'var(--bad)' }) + '</g>';
    return s;
  }
  U.registerPack({
    id: 'pourbench', version: 1,
    types: {
      pourbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E5', 'E2'],
        label: '倒水', prefix: '倒水', group: '数与运算', grades: [3, 6],
        alias: ['倒水', '量水', '守恒', '总量不变', '没有刻度', '量出', '杯子'],
        props: {
          A: { type: 'int', label: '甲杯装几升', default: 5, min: 1, max: 12, write: true }, B: { type: 'int', label: '乙杯装几升', default: 3, min: 1, max: 12, write: true },
          a: { type: 'int', label: '甲杯开始有几升', default: 0, min: 0, max: 12, write: true }, b: { type: 'int', label: '乙杯开始有几升', default: 0, min: 0, max: 12, write: true },
          tgt: { type: 'int', label: '要量出几升（0 不量）', default: 4, min: 0, max: 12, write: true },
          hist: { type: 'text', label: '做过的（自动）', default: '', write: true },
        },
        outputs: {
          a: { dim: null, kind: 'num', label: '甲杯现在几升' }, b: { dim: null, kind: 'num', label: '乙杯现在几升' }, total: { dim: null, kind: 'num', label: '两杯一共几升' },
          moves: { dim: null, kind: 'num', label: '做了几步' },
          kept: { dim: null, kind: 'num', label: '只在两杯间倒过：总量没变 1（倒过才有）' },
          hit: { dim: null, kind: 'num', label: '量出来了：1（量出来才有）' }, fewest: { dim: null, kind: 'num', label: '用最少的步数量出来：1（做到了才有）' },
        },
        icon: () => K.rect(8, 14, 18, 30, { fill: '#fff', stroke: 'var(--ink)', r: 2, w: 1.5 }) + K.rect(10, 30, 14, 12, { fill: '#9fc3ea', stroke: 'none', r: 1, w: 0 }) + K.rect(34, 24, 14, 20, { fill: '#fff', stroke: 'var(--ink)', r: 2, w: 1.5 }) + K.rect(36, 34, 10, 8, { fill: '#9fc3ea', stroke: 'none', r: 1, w: 0 }),
        size: () => [W, 380],
        grips: () => [],
        compute: (c) => {
          const m = model(c.props), o = { a: num(m.a), b: num(m.b), total: num(m.total), moves: num(m.hist.length) };
          if (m.onlyPour && m.total === m.a0 + m.b0) o.kept = num(1);
          if (m.hit) { o.hit = num(1); if (m.hist.length === m.best.n) o.fewest = num(1); }
          return o;
        },
        badge: () => '',
        draw,
      },
    },
  });
  U.PourBench = { model, fewest, step };
})(typeof globalThis !== 'undefined' ? globalThis : window);
