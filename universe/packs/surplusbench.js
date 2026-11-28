/* 器材包 surplusbench：盈亏问题（分东西：两种分法，一种多出来，一种不够）。
 *   上下两排画的是同一群人：上面每人分 a 个，下面每人分 b 个。每人一列，点子一个一个画出来。
 *   上面多出来的（盈）画在右边；下面不够的（亏）画成空的虚线圈。
 *   点 − + 改有几个人：两排需要的东西一样多（都等于真正的总数）时，人数就对了。
 *   下面一直写着“两种分法每人差 b − a 个，一共差 盈 + 亏 个”：一共差的，就是每人差的攒起来的。
 * 支持三种：一盈一亏、两次都盈、两次都亏（r1、r2 是正数表示多，负数表示少）。
 * 大数（2026-11-28，docs/instrument-design.md 的“补旧上限的台”）：人数 1–99、每人 1–99 个、多或少 ±999（几十人、每辆车坐 45 人这类题）。
 *   12 人以内和以前一样一人一列；再多就折叠：头 8 人、“……中间还有几人”、尾 3 人。每人多于 12 个时格子里写数；多的、少的多于 30 个只画 12 个再写数。
 *   人数按钮多了“−10”“+10”，一次改 10 人。
 * 这一版的边界（如实写）：人数只能点按钮改（没有拖）。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 700, NMAX = 99, PMAX = 99, RMAX = 999, COLMAX = 12;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? Math.round(+v) : lo));
  function model(p) {
    const a = clamp(p.a, 1, PMAX), b = clamp(p.b, 1, PMAX), r1 = clamp(p.r1, -RMAX, RMAX), r2 = clamp(p.r2, -RMAX, RMAX), n = clamp(p.n, 1, NMAX), item = p.item || '个';
    const t1 = a * n + r1, t2 = b * n + r2, match = t1 === t2;
    const N = b !== a && (r1 - r2) % (b - a) === 0 ? (r1 - r2) / (b - a) : null, total = N !== null ? a * N + r1 : null;
    return { a, b, r1, r2, n, t1, t2, match, N, total, item, who: p.who || '人' };
  }
  const btn = (x, y, w, label, patch, enabled, tip) => '<g' + (enabled ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' data-off="1"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 26, { fill: enabled ? '#fff' : '#f1f3f6', stroke: enabled ? 'var(--blue)' : '#b8c0cc', r: 7, w: 1.4 }) + K.text(x + w / 2, y + 17, label, { size: 12, weight: 700, fill: enabled ? 'var(--ink)' : '#5f6773' }) + '</g>';
  const say = (r, it) => (r > 0 ? '多 ' + r + ' ' + it : r < 0 ? '少 ' + (-r) + ' ' + it : '正好分完');
  function draw(c) {
    const m = model(c.props); let s = '';
    s += K.text(20, 26, '每' + m.who + ' ' + m.a + ' ' + m.item + '，' + say(m.r1, m.item) + '；每' + m.who + ' ' + m.b + ' ' + m.item + '，' + say(m.r2, m.item) + '。有几' + m.who + '？', { size: 15, weight: 700, anchor: 'start' });
    // 人多了（大数）折叠：头 8 人、“……”、尾 3 人，一共 12 列
    const F = K.big.fold(m.n, COLMAX, 8, 3), CW = Math.min(44, 440 / F.idx.length), D = 6, X0 = 80;
    const row = (y, per, r, col, label) => {
      let h = K.text(20, y + 30, label, { size: 13, weight: 700, anchor: 'start' });
      for (let i = 0; i < F.idx.length; i++) {
        const x = X0 + i * CW;
        if (F.idx[i] === null) { h += '<g data-fold="' + F.omitted + '">' + K.text(x + CW / 2 - 2, y + 36, '……', { size: 13, weight: 700, fill: '#5a6478' }) + K.text(x + CW / 2 - 2, y + 76, '中间 ' + F.omitted + ' ' + m.who, { size: 10, fill: '#5a6478', weight: 700 }) + '</g>'; continue; }
        h += K.rect(x, y, CW - 4, 64, { fill: '#f6f8fc', stroke: '#c5ccda', r: 4, w: 1 });
        if (per > 12) { h += '<g data-per="' + per + '">' + K.circle(x + CW / 2 - 2, y + 26, 13, { fill: col, stroke: 'var(--ink)', w: 0.6 }) + K.text(x + CW / 2 - 2, y + 30.5, String(per), { size: 12, weight: 700 }) + K.text(x + CW / 2 - 2, y + 56, m.item, { size: 10, fill: '#5a6478' }) + '</g>'; continue; }
        for (let j = 0; j < per; j++) { const cx = x + 8 + (j % 3) * ((CW - 16) / 3 + 0.01), cy = y + 8 + Math.floor(j / 3) * 13; h += K.circle(Math.min(cx, x + CW - 10), cy, D / 1.3, { fill: col, stroke: 'var(--ink)', w: 0.6 }); }
      }
      // 多的、少的超过 30 个：只画两排 12 个，后面打“…”（下面写着多几、少几）
      const xr = X0 + F.idx.length * CW + 10, rd = Math.abs(r) > 30 ? 12 : Math.abs(r);
      if (rd < Math.abs(r)) h += K.text(xr + 6 * 12 + 4, y + 16, '…', { size: 14, weight: 700, anchor: 'start', fill: r > 0 ? '#8a5a00' : 'var(--bad)' });
      if (r > 0) { for (let j = 0; j < rd; j++) h += K.circle(xr + (j % 6) * 12, y + 8 + Math.floor(j / 6) * 12, 4.5, { fill: col, stroke: 'var(--ink)', w: 0.6 }); h += K.text(xr, y + 76, '多 ' + r, { size: 12, weight: 700, anchor: 'start', fill: '#8a5a00' }); }
      if (r < 0) { for (let j = 0; j < rd; j++) h += K.circle(xr + (j % 6) * 12, y + 8 + Math.floor(j / 6) * 12, 4.5, { fill: 'none', stroke: 'var(--bad)', w: 1.2 }); h += K.text(xr, y + 76, '少 ' + (-r), { size: 12, weight: 700, anchor: 'start', fill: 'var(--bad)' }); }
      return h;
    };
    s += row(44, m.a, m.r1, '#f5c26b', '每' + m.who + ' ' + m.a) + row(132, m.b, m.r2, '#9fc3ea', '每' + m.who + ' ' + m.b);
    s += K.text(20, 232, m.n + ' ' + m.who + '：上面要 ' + m.a + ' × ' + m.n + (m.r1 > 0 ? ' + ' + m.r1 : m.r1 < 0 ? ' − ' + (-m.r1) : '') + ' = ' + m.t1 + '，下面要 ' + m.b + ' × ' + m.n + (m.r2 > 0 ? ' + ' + m.r2 : m.r2 < 0 ? ' − ' + (-m.r2) : '') + ' = ' + m.t2, { size: 13, anchor: 'start' });
    s += K.text(20, 256, m.match ? '一样多：东西的总数对上了' : m.t1 > m.t2 ? '上面多 ' + (m.t1 - m.t2) + '：' + m.who + '数不对' : '下面多 ' + (m.t2 - m.t1) + '：' + m.who + '数不对', { size: 13, weight: 700, anchor: 'start', fill: m.match ? 'var(--blue)' : 'var(--bad)' });
    // 人数：−10、−、+、+10（大数一次改 10 个）
    s += btn(20, 270, 38, '−10', { n: Math.max(1, m.n - 10) }, m.n > 1, '一次少 10 ' + m.who) + btn(62, 270, 30, '−', { n: m.n - 1 }, m.n > 1, '少一' + m.who) + K.text(114, 288, m.n + ' ' + m.who, { size: 13, weight: 700 }) +
      btn(136, 270, 30, '+', { n: m.n + 1 }, m.n < NMAX, '多一' + m.who) + btn(170, 270, 38, '+10', { n: Math.min(NMAX, m.n + 10) }, m.n < NMAX, '一次多 10 ' + m.who);
    const per = Math.abs(m.b - m.a), gap = Math.abs(m.r1 - m.r2);
    s += '<g data-rel="1">' + K.text(220, 288, '两种分法每' + m.who + '差 ' + per + ' ' + m.item + '，一共差 ' + gap + ' ' + m.item + (m.r1 * m.r2 < 0 ? '（多的 ' + Math.abs(m.r1) + ' + 少的 ' + Math.abs(m.r2) + '）' : '（' + Math.max(Math.abs(m.r1), Math.abs(m.r2)) + ' − ' + Math.min(Math.abs(m.r1), Math.abs(m.r2)) + '）'), { size: 13, anchor: 'start' }) + '</g>';
    if (m.match) s += '<g data-read="1">' + K.text(20, 324, m.n + ' ' + m.who + '，一共 ' + m.t1 + ' ' + m.item + '：一共差的 ' + gap + ' 里有 ' + (per ? gap / per : '?') + ' 个 ' + per, { size: 15, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
    return s;
  }
  U.registerPack({
    id: 'surplusbench', version: 1,
    types: {
      surplusbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E4', 'E7'],
        label: '盈亏问题', prefix: '盈亏', group: '关系', grades: [4, 6],
        alias: ['盈亏', '分东西', '多了', '少了', '不够', '每人分', '差'],
        props: {
          a: { type: 'int', label: '第一种：每人几个', default: 5, min: 1, max: PMAX, qmax: 12, write: true }, r1: { type: 'int', label: '第一种：多几个（负数是少）', default: 3, min: -RMAX, max: RMAX, qmin: -30, qmax: 30, write: true },
          b: { type: 'int', label: '第二种：每人几个', default: 7, min: 1, max: PMAX, qmax: 12, write: true }, r2: { type: 'int', label: '第二种：多几个（负数是少）', default: -5, min: -RMAX, max: RMAX, qmin: -30, qmax: 30, write: true },
          n: { type: 'int', label: '现在试的人数', default: 1, min: 1, max: NMAX, qmax: 12, write: true },
          item: { type: 'text', label: '分的东西的量词', default: '个', write: true }, who: { type: 'text', label: '分给谁（人、组、班）', default: '人', write: true },
        },
        outputs: {
          n: { dim: null, kind: 'num', label: '现在试的人数' }, t1: { dim: null, kind: 'num', label: '第一种分法要几个' }, t2: { dim: null, kind: 'num', label: '第二种分法要几个' },
          match: { dim: null, kind: 'num', label: '两种对上了 1（对上才有）' }, total: { dim: null, kind: 'num', label: '东西一共几个（对上才有）' },
        },
        icon: () => [0, 1, 2].map((i) => K.rect(6 + i * 14, 10, 12, 16, { fill: '#f6f8fc', stroke: 'var(--ink)', r: 2, w: 1 }) + K.circle(12 + i * 14, 16, 3, { fill: '#f5c26b', stroke: 'var(--ink)', w: 0.6 })).join('') + K.circle(50, 16, 3, { fill: '#f5c26b', stroke: 'var(--ink)', w: 0.6 }) + [0, 1, 2].map((i) => K.rect(6 + i * 14, 32, 12, 16, { fill: '#f6f8fc', stroke: 'var(--ink)', r: 2, w: 1 })).join('') + K.circle(50, 38, 3, { fill: 'none', stroke: 'var(--bad)', w: 1 }),
        size: () => [W, 370],
        grips: () => [],
        compute: (c) => { const m = model(c.props), o = { n: num(m.n), t1: num(m.t1), t2: num(m.t2) }; if (m.match) { o.match = num(1); o.total = num(m.t1); } return o; },
        badge: () => '',
        draw,
      },
    },
  });
  U.SurplusBench = { model };
})(typeof globalThis !== 'undefined' ? globalThis : window);
