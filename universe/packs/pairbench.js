/* 器材包 pairbench：连一连（一一对应、握手）。用线把东西一对一对连起来，看有没有剩下的、一共连了几条。
 *   - 一一对应：上面一排（比如学生），下面一排（比如座位）。从上面的一个拖到下面的一个，连一条线；每个只能连一次。
 *     连不下去的时候，剩下的标红：哪边多、多几个，一眼看出来。旁边的 + − 改每排有几个。
 *   - 握手：几个人围成一圈。从一个人拖到另一个人，连一条线就是握一次手；同一对不能握两次（甲握乙就是乙握甲）。
 *     每个人旁边写着他握了几次；全握完以后写出 4 + 3 + 2 + 1 和 5 × 4 ÷ 2。
 *   - 点一条线：把它擦掉。
 * 这一版的边界（如实写）：每排最多 10 个；握手最多 8 个人；只能一对一连（没有“一个对两个”）。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 660, NMAX = 10, PMAX = 8, TY = 110, BY = 250, X0 = 96, DX = 54, CX = 330, CY = 196, R = 120;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? +v : lo));
  const parse = (t) => String(t || '').split(',').filter(Boolean).map((s) => s.split('-').map(Number)).filter((a) => a.length === 2 && a.every(Number.isInteger));
  const ser = (ps) => ps.map((a) => a.join('-')).join(',');
  function model(p) {
    const mode = clamp(p.mode, 0, 1);
    if (mode === 0) {
      const na = clamp(p.na, 1, NMAX), nb = clamp(p.nb, 1, NMAX), ps = parse(p.pairs).filter(([a, b]) => a < na && b < nb);
      const ua = new Set(ps.map((x) => x[0])), ub = new Set(ps.map((x) => x[1])), full = ps.length === Math.min(na, nb);
      return { mode, na, nb, ps, ua, ub, full, leftA: na - ua.size, leftB: nb - ub.size, eq: full && na === nb ? 1 : 0 };
    }
    const n = clamp(p.n, 2, PMAX), ps = parse(p.pairs).filter(([a, b]) => a < n && b < n && a < b), deg = Array(n).fill(0);
    ps.forEach(([a, b]) => { deg[a]++; deg[b]++; });
    return { mode, n, ps, deg, all: n * (n - 1) / 2, full: ps.length === n * (n - 1) / 2 };
  }
  const posA = (i) => ({ x: X0 + i * DX, y: TY }), posB = (i) => ({ x: X0 + i * DX, y: BY });
  const posP = (i, n) => ({ x: CX + R * Math.sin(2 * Math.PI * i / n), y: CY - R * Math.cos(2 * Math.PI * i / n) * 0.8 });
  const btn = (x, y, w, label, patch, enabled, tip) => '<g' + (enabled ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' data-off="1"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 24, { fill: enabled ? '#fff' : '#f1f3f6', stroke: enabled ? 'var(--blue)' : '#b8c0cc', r: 8, w: 1.5 }) + K.text(x + w / 2, y + 16, label, { size: 12, weight: 700, fill: enabled ? 'var(--ink)' : '#5f6773' }) + '</g>';
  const edge = (a, b, ps, i, col) => '<g data-pick-set="' + encodeURIComponent(JSON.stringify({ pairs: ser(ps.filter((_, j) => j !== i)) })) + '" style="cursor:pointer"><title>点一下：擦掉这条线</title>' +
    K.line(a.x, a.y, b.x, b.y, { w: 10, stroke: 'transparent' }) + K.line(a.x, a.y, b.x, b.y, { w: 2.4, stroke: col }) + '</g>';
  // 拖动中：鼠标下面是哪一个
  function hitA(m, q) { for (let i = 0; i < m.na; i++) { const a = posA(i, m.na); if (Math.hypot(q.x - a.x, q.y - a.y) < 24) return i; } return -1; }
  function hitB(m, q) { for (let i = 0; i < m.nb; i++) { const a = posB(i); if (Math.hypot(q.x - a.x, q.y - a.y) < 24) return i; } return -1; }
  function hitP(m, q) { for (let i = 0; i < m.n; i++) { const a = posP(i, m.n); if (Math.hypot(q.x - a.x, q.y - a.y) < 24) return i; } return -1; }

  function draw(c) {
    const p = c.props, m = model(p), A = p.na_name || '学生', B = p.nb_name || '座位', P = p.p_name || '人'; let s = '';
    if (m.mode === 0) {
      s += K.text(20, 26, A + ' ' + m.na + ' 个，' + B + ' ' + m.nb + ' 个：连了 ' + m.ps.length + ' 对', { size: 15, weight: 700, anchor: 'start' });
      m.ps.forEach(([a, b], i) => { s += edge(posA(a, m.na), posB(b), m.ps, i, 'var(--blue)'); });
      for (let i = 0; i < m.na; i++) { const q = posA(i, m.na), left = m.full && !m.ua.has(i); s += K.circle(q.x, q.y, 16, { fill: left ? '#f7a8a8' : '#f5c26b', stroke: left ? 'var(--bad)' : 'var(--ink)', w: left ? 2.4 : 1.3 }) + K.text(q.x, q.y + 5, A.slice(0, 1), { size: 13, weight: 700 }); }
      for (let i = 0; i < m.nb; i++) { const q = posB(i), left = m.full && !m.ub.has(i); s += K.rect(q.x - 16, q.y - 16, 32, 32, { fill: left ? '#f7a8a8' : '#9fb7d9', stroke: left ? 'var(--bad)' : 'var(--ink)', r: 5, w: left ? 2.4 : 1.3 }) + K.text(q.x, q.y + 5, B.slice(0, 1), { size: 13, weight: 700 }); }
      s += K.text(20, TY + 4, A, { size: 12, anchor: 'start', fill: '#5a6478' }) + K.text(20, BY + 4, B, { size: 12, anchor: 'start', fill: '#5a6478' });
      s += K.text(20, 62, A + '：', { size: 12, anchor: 'start' }) + btn(64, 46, 26, '−', { na: m.na - 1, pairs: ser(m.ps.filter(([a]) => a < m.na - 1)) }, m.na > 1, '少一个') + btn(94, 46, 26, '+', { na: m.na + 1 }, m.na < NMAX, '多一个');
      s += K.text(140, 62, B + '：', { size: 12, anchor: 'start' }) + btn(184, 46, 26, '−', { nb: m.nb - 1, pairs: ser(m.ps.filter(([, b]) => b < m.nb - 1)) }, m.nb > 1, '少一个') + btn(214, 46, 26, '+', { nb: m.nb + 1 }, m.nb < NMAX, '多一个');
      s += btn(260, 46, 110, '一个对一个连好', { pairs: ser(Array.from({ length: Math.min(m.na, m.nb) }, (_, i) => [i, i])) }, !m.full, '从左往右一对一对连') + btn(376, 46, 60, '擦掉', { pairs: '' }, m.ps.length > 0, '擦掉所有的线');
      let msg = '从上面拖到下面，连一条线';
      if (m.full) msg = m.leftA === 0 && m.leftB === 0 ? '一个对一个，正好连完：' + A + '和' + B + '一样多' : m.leftA ? A + '多了 ' + m.leftA + ' 个（红色的没有' + B + '）' : B + '多了 ' + m.leftB + ' 个（红色的空着）';
      s += '<g data-msg="1">' + K.text(20, 310, msg, { size: 14, weight: 700, anchor: 'start', fill: m.full ? (m.eq ? 'var(--good)' : 'var(--bad)') : 'var(--ink)' }) + '</g>';
      if (c.drag && c.drag.grip[0] === 'a') { const a = posA(+c.drag.grip.slice(1), m.na); s += K.line(a.x, a.y, c.drag.x, c.drag.y, { w: 2, stroke: 'var(--blue)', dash: '5 4' }); }
    } else {
      s += K.text(20, 26, m.n + ' 个' + P + '，每两个握一次手：握了 ' + m.ps.length + ' 次', { size: 15, weight: 700, anchor: 'start' });
      m.ps.forEach(([a, b], i) => { s += edge(posP(a, m.n), posP(b, m.n), m.ps, i, 'var(--blue)'); });
      for (let i = 0; i < m.n; i++) { const q = posP(i, m.n); s += K.circle(q.x, q.y, 18, { fill: '#f5c26b', stroke: 'var(--ink)', w: 1.3 }) + K.text(q.x, q.y + 5, '甲乙丙丁戊己庚辛'[i], { size: 13, weight: 700 }) + K.text(q.x + 26, q.y - 14, String(m.deg[i]), { size: 11, weight: 700, fill: 'var(--blue)' }); }
      s += K.text(20, 62, P + '：', { size: 12, anchor: 'start' }) + btn(52, 46, 26, '−', { n: m.n - 1, pairs: ser(m.ps.filter(([, b]) => b < m.n - 1)) }, m.n > 2, '少一个') + btn(82, 46, 26, '+', { n: m.n + 1 }, m.n < PMAX, '多一个');
      s += btn(120, 46, 70, '擦掉', { pairs: '' }, m.ps.length > 0, '擦掉所有的线');
      s += K.text(520, 80, '每个人旁边的蓝字：', { size: 11, anchor: 'start', fill: '#5a6478' }) + K.text(520, 96, '他握了几次', { size: 11, anchor: 'start', fill: '#5a6478' });
      let msg = '从一个人拖到另一个人：握一次手';
      if (p.msg) msg = p.msg;
      else if (m.full) msg = '全握完了：' + Array.from({ length: m.n - 1 }, (_, i) => m.n - 1 - i).join(' + ') + ' = ' + m.all + '，也就是 ' + m.n + ' × ' + (m.n - 1) + ' ÷ 2 = ' + m.all + '（每次握手数了两遍）';
      s += '<g data-msg="1">' + K.text(20, 350, msg, { size: 13, weight: 700, anchor: 'start', fill: m.full ? 'var(--good)' : p.msg ? 'var(--bad)' : 'var(--ink)' }) + '</g>';
      if (c.drag && c.drag.grip[0] === 'p') { const a = posP(+c.drag.grip.slice(1), m.n); s += K.line(a.x, a.y, c.drag.x, c.drag.y, { w: 2, stroke: 'var(--blue)', dash: '5 4' }); }
    }
    return s;
  }
  function grips(c) {
    const m = model(c.props), out = [];
    if (m.mode === 0) {
      for (let i = 0; i < m.na; i++) { if (m.ua.has(i)) continue; const q = posA(i, m.na); out.push({ id: 'a' + i, x: q.x, y: q.y, r: 16, ghost: true, cursor: 'grab', tip: '拖到下面的一个上：连一条线',
        drag: (c0, qq) => { const m0 = model(c0.props), j = hitB(m0, qq); if (j < 0 || m0.ub.has(j)) return { pairs: c0.props.pairs }; return { pairs: ser(m0.ps.concat([[i, j]])) }; } }); }
    } else {
      for (let i = 0; i < m.n; i++) { const q = posP(i, m.n); out.push({ id: 'p' + i, x: q.x, y: q.y, r: 18, ghost: true, cursor: 'grab', tip: '拖到另一个人身上：握一次手',
        drag: (c0, qq) => { const m0 = model(c0.props), j = hitP(m0, qq); if (j < 0 || j === i) return { pairs: c0.props.pairs, msg: '' }; const a = Math.min(i, j), b = Math.max(i, j);
          if (m0.ps.some(([x, y]) => x === a && y === b)) return { pairs: c0.props.pairs, msg: '他们已经握过了：甲握乙就是乙握甲，只算一次' };
          return { pairs: ser(m0.ps.concat([[a, b]]).sort((u, v) => u[0] - v[0] || u[1] - v[1])), msg: '' }; } }); }
    }
    return out;
  }
  const I = (lo, hi, d, label, o) => Object.assign({ type: 'int', label, default: d, min: lo, max: hi, write: true }, o || {});
  const T = (d, label, o) => Object.assign({ type: 'text', label, default: d, write: true }, o || {});
  U.registerPack({
    id: 'pairbench', version: 1,
    types: {
      pairbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E1', 'E7'],
        label: '连一连（对应与握手）', prefix: '连一连', group: '数与运算', grades: [1, 6],
        alias: ['一一对应', '配对', '同样多', '比多少', '握手', '搭配', '组合', '连线'],
        props: {
          mode: { type: 'choice', label: '连什么', default: 0, choices: ['一一对应', '握手'], write: true },
          na: I(1, NMAX, 5, '上面一排几个'), nb: I(1, NMAX, 5, '下面一排几个'), n: I(2, PMAX, 4, '握手：几个人'),
          na_name: T('学生', '上面一排是什么'), nb_name: T('座位', '下面一排是什么'), p_name: T('人', '握手的是谁'),
          pairs: T('', '连了哪些（自动）', { hidden: true }), msg: T('', '提示（自动）', { hidden: true }),
        },
        outputs: {
          pairs: { dim: null, kind: 'num', label: '连了几条线' }, full: { dim: null, kind: 'num', label: '连不下去了（一一对应）/ 全握完了（握手）：1 是，0 否' },
          eq: { dim: null, kind: 'num', label: '一一对应：两排一样多（连完才有）' }, leftA: { dim: null, kind: 'num', label: '一一对应：上面剩几个（连完才有）' }, leftB: { dim: null, kind: 'num', label: '一一对应：下面剩几个（连完才有）' },
          na: { dim: null, kind: 'num', label: '上面一排几个' }, nb: { dim: null, kind: 'num', label: '下面一排几个' },
        },
        icon: () => K.circle(16, 12, 6, { fill: '#f5c26b', stroke: 'var(--ink)', w: 1 }) + K.circle(40, 12, 6, { fill: '#f5c26b', stroke: 'var(--ink)', w: 1 }) + K.rect(10, 30, 12, 12, { fill: '#9fb7d9', stroke: 'var(--ink)', w: 1, r: 2 }) + K.rect(34, 30, 12, 12, { fill: '#9fb7d9', stroke: 'var(--ink)', w: 1, r: 2 }) + K.line(16, 18, 16, 30, { w: 1.6, stroke: 'var(--blue)' }) + K.line(40, 18, 40, 30, { w: 1.6, stroke: 'var(--blue)' }),
        size: () => [W, 384],
        grips,
        compute: (c) => {
          const m = model(c.props), o = { pairs: num(m.ps.length), full: num(m.full ? 1 : 0) };
          if (m.mode === 0) { o.na = num(m.na); o.nb = num(m.nb); if (m.full) { o.eq = num(m.eq); o.leftA = num(m.leftA); o.leftB = num(m.leftB); } }
          return o;
        },
        badge: () => '',
        draw,
      },
    },
  });
  U.PairBench = { model };
})(typeof globalThis !== 'undefined' ? globalThis : window);
