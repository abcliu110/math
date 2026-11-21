/* 器材包 ringbench：跳格钟（同余）。一圈 m 个格子，编号 0 到 m − 1，指针从起点出发。
 *   - 加法钟：每一拍往前走 k 格（过了 m − 1 就绕回 0）。能走到几个格、几拍回到起点？试不同的 k：和 m 互质的 k 才能走遍。
 *   - 乘法钟：指针从 1 出发，每一拍乘 k，只看除以 m 的余数（m = 10 就是只看个位）。几拍一轮？第 100 拍停在哪？
 * 按钮：步长 − +（换步长从头走）、走一拍、走 10 拍、走一圈（走到回到起点）、重来。走完一圈的步长记在右边的表里：步长 k 走到几个格。
 * 这一版的边界（如实写）：m 是 2–20；最多走 200 拍。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 660, CX = 170, CY = 200, RR = 120, MAXB = 200;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? Math.round(+v) : lo));
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  function model(p) {
    const m = clamp(p.m, 2, 20), op = +p.op === 1 ? 1 : 0, k = clamp(p.k, op ? 0 : 1, m - 1), beats = clamp(p.beats, 0, MAXB), gb = clamp(p.gb, 0, MAXB);
    const start = op ? 1 % m : 0, nx = (v) => (op ? (v * k) % m : (v + k) % m);
    const path = [start]; let v = start; for (let i = 0; i < beats; i++) { v = nx(v); path.push(v); }
    // 几拍回到起点（乘法钟可能永远回不来，比如 k 和 m 有公因数：那就记“进了圈就不出来”的那一段）
    let period = 0, w = start; const seen = new Set([start]);
    for (let i = 1; i <= m + 1; i++) { w = nx(w); if (w === start) { period = i; break; } if (seen.has(w)) break; seen.add(w); }
    const looped = period > 0 && beats >= period, reach = looped ? period : null;
    const tried = String(p.tried || '').split(',').filter((x) => /^\d+:\d+$/.test(x)).map((x) => x.split(':').map(Number));
    return { m, op, k, beats, gb, start, path, pos: v, period, looped, reach, tried, visited: new Set(path) };
  }
  const btn = (x, y, w, label, patch, enabled, tip) => '<g' + (enabled ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' data-off="1"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 26, { fill: enabled ? '#fff' : '#f1f3f6', stroke: enabled ? 'var(--blue)' : '#b8c0cc', r: 7, w: 1.4 }) + K.text(x + w / 2, y + 17, label, { size: 12, weight: 700, fill: enabled ? 'var(--ink)' : '#5f6773' }) + '</g>';
  // 走到第 nb 拍：走完一圈的话把这个步长记进表里
  function walk(m, nb) {
    const b = Math.min(MAXB, nb), patch = { beats: b };
    if (m.period > 0 && b >= m.period && !m.tried.some(([k]) => k === m.k)) patch.tried = m.tried.concat([[m.k, m.period]]).map((x) => x.join(':')).join(',');
    return patch;
  }
  function draw(c) {
    const p = c.props, m = model(p); let s = '';
    s += K.text(20, 26, m.op ? m.m + ' 格的乘法钟：从 1 出发，每拍乘 ' + m.k + '，只看除以 ' + m.m + ' 的余数' : m.m + ' 格的钟：每拍走 ' + m.k + ' 格，能走到几个格？', { size: 15, weight: 700, anchor: 'start' });
    const at = (i, r) => { const a = -Math.PI / 2 + 2 * Math.PI * i / m.m; return [CX + r * Math.cos(a), CY + r * Math.sin(a)]; };
    s += K.circle(CX, CY, RR, { fill: 'none', stroke: '#c5ccda', w: 1.4 });
    const tail = m.path.slice(-Math.min(m.path.length, (m.period || m.m) + 1));
    for (let i = 1; i < tail.length; i++) { const [x1, y1] = at(tail[i - 1], RR - 14), [x2, y2] = at(tail[i], RR - 14); s += K.line(x1, y1, x2, y2, { stroke: 'var(--blue)', w: 1.6 }); }
    for (let i = 0; i < m.m; i++) {
      const [x, y] = at(i, RR), on = m.visited.has(i);
      s += K.circle(x, y, 14, { fill: i === m.pos ? 'var(--blue)' : on ? '#d6ecff' : '#fff', stroke: on ? 'var(--blue)' : '#b8c0cc', w: 1.4 }) + K.text(x, y + 4, String(i), { size: 11, weight: 700, fill: i === m.pos ? '#fff' : 'var(--ink)' });
    }
    s += K.text(CX, CY + 4, '第 ' + m.beats + ' 拍', { size: 13, weight: 700 }) + K.text(CX, CY + 22, '停在 ' + m.pos, { size: 12, fill: 'var(--blue)' });
    const RX = 330;
    s += K.text(RX, 62, (m.op ? '乘数 ' : '步长 ') + m.k, { size: 14, weight: 700, anchor: 'start' });
    s += btn(RX + 80, 46, 34, '−', { k: m.k - 1, beats: 0 }, m.k > (m.op ? 2 : 1), (m.op ? '乘数' : '步长') + '少 1') + btn(RX + 120, 46, 34, '+', { k: m.k + 1, beats: 0 }, m.k < m.m - 1, (m.op ? '乘数' : '步长') + '多 1');
    s += btn(RX, 82, 70, '走一拍', walk(m, m.beats + 1), m.beats < MAXB, '走一拍') + btn(RX + 76, 82, 70, '走 10 拍', walk(m, m.beats + 10), m.beats < MAXB, '走 10 拍');
    s += btn(RX + 152, 82, 70, '走一圈', walk(m, Math.max(m.beats, m.period || m.m)), m.period > 0 && m.beats < m.period, '走到回到起点') + btn(RX + 228, 82, 56, '重来', { beats: 0 }, m.beats > 0, '回到起点');
    const seq = m.path.slice(0, 11).join(' → ') + (m.path.length > 11 ? ' → …' : '');
    s += K.text(RX, 132, seq, { size: 12, anchor: 'start', fill: '#3a4a63' });
    if (m.looped) s += '<g data-read="1">' + K.text(RX, 160, m.period + ' 拍回到起点：' + (m.op ? '一轮 ' + m.period + ' 个数' : '走到 ' + m.reach + ' 个格' + (m.reach === m.m ? '，走遍了！' : '，没走遍')), { size: 14, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
    else if (m.period === 0) s += K.text(RX, 160, '回不到起点：进了一个小圈就出不来', { size: 13, weight: 700, anchor: 'start', fill: 'var(--bad)' });
    if (m.gb > 0) s += K.text(RX, 184, m.beats === m.gb ? '第 ' + m.gb + ' 拍：停在 ' + m.pos : '要看第 ' + m.gb + ' 拍停在哪' + (m.looped ? '：' + m.gb + ' 里有几个 ' + m.period + '？' : ''), { size: 13, weight: 700, anchor: 'start', fill: m.beats === m.gb ? 'var(--blue)' : '#5a6478' });
    if (m.tried.length) {
      s += K.text(RX, 214, (m.op ? '乘数' : '步长') + '　' + (m.op ? '一轮几个' : '走到几格'), { size: 12, weight: 700, anchor: 'start' });
      m.tried.slice(-7).forEach(([k, r], i) => { s += K.text(RX, 234 + i * 18, k + '　　' + r + (!m.op && r === m.m ? '（走遍）' : ''), { size: 12, anchor: 'start', fill: !m.op && r === m.m ? 'var(--blue)' : 'var(--ink)' }); });
      if (!m.op) s += K.text(RX + 160, 234, '和 ' + m.m + ' 的最大公因数？', { size: 11, anchor: 'start', fill: '#5a6478' });
    }
    return s;
  }
  U.registerPack({
    id: 'ringbench', version: 1,
    types: {
      ringbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E6', 'E2'],
        label: '跳格钟', prefix: '跳格钟', group: '数与运算', grades: [5, 7],
        alias: ['钟', '同余', '余数', '周期', '互质', '最大公因数', '个位', '循环', '走遍'],
        props: {
          m: { type: 'int', label: '一圈几个格', default: 12, min: 2, max: 20, write: true },
          op: { type: 'choice', label: '每拍', default: 0, choices: ['加（走 k 格）', '乘（乘 k）'], write: true },
          k: { type: 'int', label: '步长（乘法钟是乘数）', default: 4, min: 0, max: 19, write: true },
          beats: { type: 'int', label: '走了几拍（自动）', default: 0, min: 0, max: MAXB, write: true },
          gb: { type: 'int', label: '要看第几拍（0 不看）', default: 0, min: 0, max: MAXB, write: true },
          tried: { type: 'text', label: '走完一圈的步长（自动）', default: '', write: true },
        },
        outputs: {
          pos: { dim: null, kind: 'num', label: '指针停在几' }, beats: { dim: null, kind: 'num', label: '走了几拍' }, k: { dim: null, kind: 'num', label: '步长' },
          period: { dim: null, kind: 'num', label: '几拍回到起点（走完一圈才有）' }, reach: { dim: null, kind: 'num', label: '走到几个格（走完一圈才有）' },
          all: { dim: null, kind: 'num', label: '走遍了 1、没走遍 0（走完一圈才有）' }, atv: { dim: null, kind: 'num', label: '要看的那一拍停在几（走到那一拍才有）' },
        },
        icon: () => K.circle(28, 28, 20, { fill: 'none', stroke: 'var(--ink)', w: 2 }) + [0, 1, 2, 3, 4, 5].map((i) => { const a = -Math.PI / 2 + i * Math.PI / 3; return K.circle(28 + 20 * Math.cos(a), 28 + 20 * Math.sin(a), 3.5, { fill: i % 2 ? '#fff' : 'var(--blue)', stroke: 'var(--ink)', w: 1 }); }).join(''),
        size: () => [W, 380],
        grips: () => [],
        compute: (c) => {
          const m = model(c.props), o = { pos: num(m.pos), beats: num(m.beats), k: num(m.k) };
          if (m.looped) { o.period = num(m.period); o.reach = num(m.reach); o.all = num(m.reach === m.m ? 1 : 0); }
          if (m.gb > 0 && m.beats === m.gb) o.atv = num(m.pos);
          return o;
        },
        badge: () => '',
        draw,
      },
    },
  });
  U.RingBench = { model, gcd };
})(typeof globalThis !== 'undefined' ? globalThis : window);
