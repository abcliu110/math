/* 器材包 calbench：日历。
 *   - 月历：点 ◀ ▶ 翻月份，看这个月有几天、1 号是星期几；2 月会写出今年是不是闰年（四年一闰，整百年要能被 400 整除）。
 *     点日历上的两天：第一下是开始，第二下是结束，写出“经过了几天”（结束 − 开始）和“一共几天”（两头都算，再加 1）。
 *   - 几天后是星期几：一排七天的星期条。点“过 7 天”一次跳一整个星期（星期几不变），点“过 1 天”往后挪一天，数到要的天数。
 * 日期按公历精确计算（1900–2100 年）。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 700;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? Math.round(+v) : lo));
  const MODES = ['月历', '几天后是星期几'];
  const WK = ['日', '一', '二', '三', '四', '五', '六'];
  const leap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  const dim = (y, mo) => [31, leap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][mo - 1];
  const dow = (y, mo, d) => new Date(Date.UTC(y, mo - 1, d)).getUTCDay();
  function model(p) {
    const mode = clamp(p.mode, 0, 1), y = clamp(p.y, 1900, 2100), mo = clamp(p.mo, 1, 12), nd = dim(y, mo), d1 = clamp(p.d1, 0, nd), d2 = clamp(p.d2, 0, nd);
    const start = clamp(p.start, 0, 6), N = clamp(p.N, 1, 400), go = clamp(p.go, 0, 400);
    return { mode, y, mo, nd, first: dow(y, mo, 1), d1, d2, leap: leap(y), start, N, go, day: (start + go) % 7 };
  }
  const btn = (x, y, w, label, patch, enabled, tip) => '<g' + (enabled ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' data-off="1"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 26, { fill: enabled ? '#fff' : '#f1f3f6', stroke: enabled ? 'var(--blue)' : '#b8c0cc', r: 7, w: 1.4 }) + K.text(x + w / 2, y + 17, label, { size: 12, weight: 700, fill: enabled ? 'var(--ink)' : '#5f6773' }) + '</g>';
  function draw(c) {
    const p = c.props, m = model(p); let s = '';
    if (m.mode === 0) {
      const prev = m.mo === 1 ? { y: m.y - 1, mo: 12 } : { mo: m.mo - 1 }, next = m.mo === 12 ? { y: m.y + 1, mo: 1 } : { mo: m.mo + 1 };
      s += btn(20, 12, 36, '◀', Object.assign(prev, { d1: 0, d2: 0 }), m.y > 1900 || m.mo > 1, '上个月') + K.text(150, 31, m.y + ' 年 ' + m.mo + ' 月', { size: 17, weight: 700 }) + btn(244, 12, 36, '▶', Object.assign(next, { d1: 0, d2: 0 }), m.y < 2100 || m.mo < 12, '下个月');
      const CW = 52, CH = 40, X0 = 20, Y0 = 70;
      WK.forEach((w, i) => { s += K.text(X0 + i * CW + CW / 2, Y0 - 8, w, { size: 12, weight: 700, fill: i === 0 || i === 6 ? '#b03a2e' : '#5a6478' }); });
      const lo = Math.min(m.d1 || 99, m.d2 || 99), hi = Math.max(m.d1, m.d2);
      for (let d = 1; d <= m.nd; d++) {
        const k = m.first + d - 1, x = X0 + (k % 7) * CW, y = Y0 + Math.floor(k / 7) * CH, sel = d === m.d1 || d === m.d2, inr = m.d1 && m.d2 && d > lo && d < hi;
        const patch = !m.d1 || (m.d1 && m.d2) ? { d1: d, d2: 0 } : { d2: d };
        s += '<g data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"><title>' + m.mo + ' 月 ' + d + ' 日</title>' + K.rect(x + 2, y + 2, CW - 4, CH - 4, { fill: sel ? 'var(--blue)' : inr ? '#d6ecff' : '#fff', stroke: '#c5ccda', r: 6, w: 1 }) + K.text(x + CW / 2, y + CH / 2 + 5, String(d), { size: 14, weight: 700, fill: sel ? '#fff' : 'var(--ink)' }) + '</g>';
      }
      const R0 = 400;
      s += '<g data-read="1">' + K.text(R0, 90, m.mo + ' 月有 ' + m.nd + ' 天' + (m.mo === 2 ? (m.leap ? '：' + m.y + ' 年是闰年' : '：' + m.y + ' 年是平年') : [1, 3, 5, 7, 8, 10, 12].includes(m.mo) ? '（大月）' : '（小月）'), { size: 15, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
      if (m.mo === 2) s += K.text(R0, 114, m.y % 100 === 0 ? '整百年：要能被 400 整除才是闰年' : '能被 4 整除的年份一般是闰年', { size: 12, anchor: 'start', fill: '#5a6478' });
      s += K.text(R0, 150, '1 号是星期' + WK[m.first], { size: 13, anchor: 'start' });
      if (m.d1 && m.d2) s += '<g data-days="1">' + K.text(R0, 200, '从 ' + lo + ' 日到 ' + hi + ' 日：', { size: 14, weight: 700, anchor: 'start' }) + K.text(R0, 226, '经过了 ' + hi + ' − ' + lo + ' = ' + (hi - lo) + ' 天', { size: 14, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + K.text(R0, 252, '两头都算：一共 ' + (hi - lo + 1) + ' 天', { size: 14, weight: 700, anchor: 'start', fill: '#b03a2e' }) + '</g>';
      else s += K.text(R0, 200, m.d1 ? '再点一天：结束' : '点一天：开始', { size: 12, anchor: 'start', fill: '#5a6478' });
    } else {
      s += K.text(20, 28, '今天星期' + WK[m.start] + '，' + m.N + ' 天后是星期几？', { size: 16, weight: 700, anchor: 'start' });
      const X0 = 60, CW = 82, Y = 90;
      WK.forEach((w, i) => { const on = i === m.day; s += K.rect(X0 + i * CW, Y, CW - 6, 54, { fill: on ? 'var(--blue)' : '#fff', stroke: '#c5ccda', r: 8, w: 1.2 }) + K.text(X0 + i * CW + (CW - 6) / 2, Y + 33, '星期' + w, { size: 14, weight: 700, fill: on ? '#fff' : 'var(--ink)' }); });
      s += K.text(X0 + m.start * CW + (CW - 6) / 2, Y + 72, '今天', { size: 11, fill: '#5a6478' });
      const weeks = Math.floor(m.go / 7), rest = m.go % 7;
      s += btn(60, 190, 120, '过 7 天', { go: m.go + 7 }, m.go + 7 <= m.N, '过一整个星期：星期几不变') + btn(190, 190, 120, '过 1 天', { go: m.go + 1 }, m.go < m.N, '往后一天') + btn(320, 190, 100, '回到今天', { go: 0 }, m.go > 0, '重新数');
      s += K.text(60, 250, '已经过了 ' + m.go + ' 天 = ' + weeks + ' 个星期' + (rest ? ' 又 ' + rest + ' 天' : ''), { size: 14, anchor: 'start' });
      if (m.go === m.N) s += '<g data-read="1">' + K.text(60, 284, m.N + ' ÷ 7 = ' + Math.floor(m.N / 7) + ' …… ' + (m.N % 7) + '：整星期不改变星期几，只看多出来的 ' + (m.N % 7) + ' 天', { size: 13, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + K.text(60, 310, m.N + ' 天后是星期' + WK[m.day], { size: 17, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
    }
    return s;
  }
  const I = (lo, hi, d, label) => ({ type: 'int', label, default: d, min: lo, max: hi, write: true });
  U.registerPack({
    id: 'calbench', version: 1,
    types: {
      calbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E6', 'E2'],
        label: '日历', prefix: '日历', group: '时间与变化', grades: [3, 5],
        alias: ['日历', '年月日', '闰年', '平年', '大月', '小月', '经过几天', '星期几', '周期'],
        props: {
          mode: { type: 'choice', label: '做什么', default: 0, choices: MODES, write: true },
          y: I(1900, 2100, 2026, '年'), mo: I(1, 12, 11, '月'), d1: I(0, 31, 0, '点的第一天'), d2: I(0, 31, 0, '点的第二天'),
          start: I(0, 6, 3, '今天星期几（0 是星期日）'), N: I(1, 400, 100, '几天后'), go: I(0, 400, 0, '已经过了几天'),
        },
        outputs: {
          days: { dim: null, kind: 'num', label: '这个月有几天' }, between: { dim: null, kind: 'num', label: '经过了几天（点了两天才有）' }, inclusive: { dim: null, kind: 'num', label: '两头都算一共几天（点了两天才有）' },
          weekday: { dim: null, kind: 'num', label: '几天后是星期几（0 是星期日；数到了才有）' },
        },
        icon: () => K.rect(8, 10, 40, 34, { fill: '#fff', stroke: 'var(--ink)', r: 3, w: 1.2 }) + K.rect(8, 10, 40, 9, { fill: '#e87a6b', stroke: 'var(--ink)', r: 3, w: 1.2 }) + K.text(28, 38, '31', { size: 12, weight: 700 }),
        size: () => [W, 400],
        grips: () => [],
        compute: (c) => {
          const m = model(c.props), o = {};
          if (m.mode === 0) { o.days = num(m.nd); if (m.d1 && m.d2) { const d = Math.abs(m.d2 - m.d1); o.between = num(d); o.inclusive = num(d + 1); } }
          else if (m.go === m.N) o.weekday = num(m.day);
          return o;
        },
        badge: () => '',
        draw,
      },
    },
  });
  U.CalBench = { model };
})(typeof globalThis !== 'undefined' ? globalThis : window);
