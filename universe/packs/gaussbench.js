/* 器材包 gaussbench：高斯求和（倒序相加）。
 *   上面一行是一串等差的数：从 a 开始，每次加 d，一共 n 个。
 *   点“倒过来写一行”：下面同样的数从大到小写一遍；再点“上下对齐相加”：每一列都是 首 + 末，一样大。
 *   两行合起来是 n 个（首 + 末），一行就是它的一半：和 = (首 + 末) × n ÷ 2。
 *   和（total）只有配对以后才有：要的是这个想法，不是一个一个加。
 *   项数多的时候（多于 14 个）中间画成“……”，只画头 6 个和尾 6 个。
 * 这一版的边界（如实写）：首项 0–50，每次加 1–9，项数 2–100。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 700, NMAX = 100, SHOW = 14;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? Math.round(+v) : lo));
  function model(p) {
    const a = clamp(p.a, 0, 50), d = clamp(p.d, 1, 9), n = clamp(p.n, 2, NMAX), last = a + (n - 1) * d;
    const flip = !!p.flip, pair = flip && !!p.pair;
    return { a, d, n, last, flip, pair, ps: a + last, total: (a + last) * n / 2 };
  }
  const btn = (x, y, w, label, patch, enabled, tip) => '<g' + (enabled ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' data-off="1"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 26, { fill: enabled ? '#fff' : '#f1f3f6', stroke: enabled ? 'var(--blue)' : '#b8c0cc', r: 7, w: 1.4 }) + K.text(x + w / 2, y + 17, label, { size: 12, weight: 700, fill: enabled ? 'var(--ink)' : '#5f6773' }) + '</g>';
  // 要画出来的列：项数少全画，多了画头 6 个、“……”、尾 6 个（null 表示省略号那一列）
  const cols = (n) => (n <= SHOW ? Array.from({ length: n }, (_, i) => i) : [0, 1, 2, 3, 4, 5, null, n - 6, n - 5, n - 4, n - 3, n - 2, n - 1]);
  function draw(c) {
    const m = model(c.props); let s = '';
    const term = (i) => m.a + i * m.d;
    s += K.text(20, 26, m.a + ' + ' + term(1) + ' + ' + term(2) + ' + … + ' + m.last + '（' + m.n + ' 个数）', { size: 15, weight: 700, anchor: 'start' });
    const C = cols(m.n), CW = Math.min(46, 620 / C.length), X0 = 30, Y1 = 50, Y2 = 96, Y3 = 150;
    C.forEach((i, j) => {
      const x = X0 + j * CW;
      if (i === null) { s += K.text(x + CW / 2 - 2, Y1 + 22, '……', { size: 13 }); if (m.flip) s += K.text(x + CW / 2 - 2, Y2 + 22, '……', { size: 13 }); if (m.pair) s += K.text(x + CW / 2 - 2, Y3 + 22, '……', { size: 13 }); return; }
      s += K.rect(x, Y1, CW - 4, 32, { fill: '#fff3d6', stroke: '#c9a24a', r: 5, w: 1 }) + K.text(x + (CW - 4) / 2, Y1 + 21, String(term(i)), { size: CW < 40 ? 11 : 13, weight: 700 });
      if (m.flip) s += K.rect(x, Y2, CW - 4, 32, { fill: '#dcebfb', stroke: '#6f9fd4', r: 5, w: 1 }) + K.text(x + (CW - 4) / 2, Y2 + 21, String(term(m.n - 1 - i)), { size: CW < 40 ? 11 : 13, weight: 700 });
      if (m.pair) s += K.line(x + (CW - 4) / 2, Y2 + 34, x + (CW - 4) / 2, Y3 - 2, { stroke: '#8a93a3', w: 1 }) + K.rect(x, Y3, CW - 4, 32, { fill: '#e3f4e6', stroke: '#4c9a5b', r: 5, w: 1.2 }) + K.text(x + (CW - 4) / 2, Y3 + 21, String(m.ps), { size: CW < 40 ? 11 : 13, weight: 700 });
    });
    s += K.text(X0 + C.length * CW + 4, Y1 + 21, '正着', { size: 12, anchor: 'start' });
    if (m.flip) s += K.text(X0 + C.length * CW + 4, Y2 + 21, '倒着', { size: 12, anchor: 'start' });
    if (m.pair) s += K.text(X0 + C.length * CW + 4, Y3 + 21, '每列', { size: 12, anchor: 'start' });
    let y = 206;
    if (!m.flip) s += K.text(20, y, '一个一个加太慢了。把这串数倒过来，写在下面试试？', { size: 13, anchor: 'start', fill: '#5f6773' });
    else if (!m.pair) s += K.text(20, y, '上下两个数对齐看：第一列 ' + m.a + ' 和 ' + m.last + '，第二列 ' + term(1) + ' 和 ' + term(m.n - 2) + '……加起来呢？', { size: 13, anchor: 'start' });
    else {
      s += K.text(20, y, '每一列都是 ' + m.a + ' + ' + m.last + ' = ' + m.ps + '：上面多 ' + m.d + '，下面就少 ' + m.d + '，和不变。', { size: 13, anchor: 'start' });
      s += K.text(20, y + 22, '两行一共 ' + m.n + ' 列，是 ' + m.ps + ' × ' + m.n + ' = ' + m.ps * m.n + '；两行是同一串数写了两遍。', { size: 13, anchor: 'start' });
      s += '<g data-read="1">' + K.text(20, y + 50, '和 = (' + m.a + ' + ' + m.last + ') × ' + m.n + ' ÷ 2 = ' + m.total, { size: 16, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
    }
    // 控制：项数、首项、每次加几；倒过来、对齐相加
    const yb = 290;
    s += K.text(20, yb + 17, '几个数', { size: 12, weight: 700, anchor: 'start' }) + btn(70, yb, 34, '−10', { n: m.n - 10, pair: false }, m.n > 11, '少 10 个数') + btn(108, yb, 26, '−', { n: m.n - 1, pair: false }, m.n > 2, '少一个数') + K.text(160, yb + 17, String(m.n), { size: 14, weight: 700 }) + btn(186, yb, 26, '+', { n: m.n + 1, pair: false }, m.n < NMAX, '多一个数') + btn(216, yb, 34, '+10', { n: m.n + 10, pair: false }, m.n + 10 <= NMAX, '多 10 个数');
    s += K.text(270, yb + 17, '从几开始', { size: 12, weight: 700, anchor: 'start' }) + btn(330, yb, 26, '−', { a: m.a - 1, pair: false }, m.a > 0, '第一个数小 1') + K.text(374, yb + 17, String(m.a), { size: 14, weight: 700 }) + btn(392, yb, 26, '+', { a: m.a + 1, pair: false }, m.a < 50, '第一个数大 1');
    s += K.text(436, yb + 17, '每次加', { size: 12, weight: 700, anchor: 'start' }) + btn(484, yb, 26, '−', { d: m.d - 1, pair: false }, m.d > 1, '每次少加 1') + K.text(526, yb + 17, String(m.d), { size: 14, weight: 700 }) + btn(542, yb, 26, '+', { d: m.d + 1, pair: false }, m.d < 9, '每次多加 1');
    s += btn(20, yb + 36, 120, m.flip ? '收起倒着的一行' : '倒过来写一行', { flip: !m.flip, pair: false }, true, m.flip ? '收起倒着写的一行' : '把这串数倒过来写在下面');
    s += btn(150, yb + 36, 120, '上下对齐相加', { pair: true }, m.flip && !m.pair, '上下两个数加起来');
    s += K.text(290, yb + 53, '最后一个数是 ' + m.last + '（' + m.a + ' + ' + (m.n - 1) + ' × ' + m.d + '）', { size: 13, anchor: 'start' });
    return s;
  }
  U.registerPack({
    id: 'gaussbench', version: 1,
    types: {
      gaussbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E2', 'E4'],
        label: '高斯求和', prefix: '高斯', group: '数与运算', grades: [3, 6],
        alias: ['高斯', '求和', '等差数列', '倒序相加', '1 加到 100', '首项', '末项', '项数', '配对'],
        props: {
          a: { type: 'int', label: '第一个数', default: 1, min: 0, max: 50, write: true },
          d: { type: 'int', label: '每次加几', default: 1, min: 1, max: 9, write: true },
          n: { type: 'int', label: '一共几个数', default: 10, min: 2, max: NMAX, write: true },
          flip: { type: 'bool', label: '倒过来写了一行', default: false, write: true },
          pair: { type: 'bool', label: '上下对齐相加了', default: false, write: true },
        },
        outputs: {
          n: { dim: null, kind: 'num', label: '一共几个数' }, last: { dim: null, kind: 'num', label: '最后一个数' },
          ps: { dim: null, kind: 'num', label: '每一对的和（配对才有）' }, total: { dim: null, kind: 'num', label: '这串数的和（配对才有）' },
        },
        icon: () => [0, 1, 2, 3].map((i) => K.rect(4 + i * 12, 8, 10, 12, { fill: '#fff3d6', stroke: 'var(--ink)', r: 2, w: 0.8 }) + K.rect(4 + i * 12, 26, 10, 12, { fill: '#dcebfb', stroke: 'var(--ink)', r: 2, w: 0.8 })).join('') + K.text(28, 52, '=', { size: 10, weight: 700 }),
        size: () => [W, 380],
        grips: () => [],
        compute: (c) => { const m = model(c.props), o = { n: num(m.n), last: num(m.last) }; if (m.pair) { o.ps = num(m.ps); o.total = num(m.total); } return o; },
        badge: (c) => { const m = model(c.props); return m.pair ? '和 ' + m.total : ''; },
        draw,
      },
    },
  });
  U.GaussBench = { model };
})(typeof globalThis !== 'undefined' ? globalThis : window);
