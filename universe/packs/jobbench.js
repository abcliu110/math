/* 器材包 jobbench：工程问题（合作、注水放水）。
 *   整件工作画成一长条，切成 a、b 的最小公倍数那么多小格：甲单独 a 天做完，一天做 1/a，也就是这么多格；乙同理。
 *   - 合作：点甲、乙上面的开关选谁来做；点“过一天”，这一天做的格子涂上颜色（甲蓝、乙橙）。涂满了写出一共几天——
 *     最后一天用不满一整天的，写出要几分之几天，总天数精确到分数。
 *   - 注水放水：甲是进水管（a 小时注满），乙是出水管（b 小时放完）。两个一起开，每小时净多 1/a − 1/b。
 * 这一版的边界（如实写）：a、b 都不超过 20；最多 60 小格。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const qv = (q) => U.val('num', q, { dim: null });
  const W = 700;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? Math.round(+v) : lo));
  const MODES = ['合作', '注水放水'];
  const gcd = (x, y) => (y ? gcd(y, x % y) : x);
  function model(p) {
    const mode = clamp(p.mode, 0, 1), a = clamp(p.a, 1, 20), b = clamp(p.b, 1, 20), useA = p.useA !== false, useB = p.useB !== false, t = clamp(p.t, 0, 200);
    const L = a * b / gcd(a, b), pa = useA ? L / a : 0, pb = useB ? (mode === 1 ? -L / b : L / b) : 0, rate = pa + pb;
    const filled = Math.max(0, Math.min(L, t * rate)), done = rate > 0 && t * rate >= L;
    const days = rate > 0 ? Q(L, rate) : null;   // 精确天数 L / rate
    return { mode, a, b, useA, useB, t, L, pa, pb, rate, filled, done, days };
  }
  const btn = (x, y, w, label, patch, enabled, tip, active) => '<g' + (enabled ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' data-off="1"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 26, { fill: active ? 'var(--blue)' : enabled ? '#fff' : '#f1f3f6', stroke: enabled || active ? 'var(--blue)' : '#b8c0cc', r: 7, w: 1.4 }) + K.text(x + w / 2, y + 17, label, { size: 12, weight: 700, fill: active ? '#fff' : enabled ? 'var(--ink)' : '#5f6773' }) + '</g>';
  const CA = '#7fb0e8', CB = '#f5b26b';
  function draw(c) {
    const p = c.props, m = model(p); let s = '';
    const A = m.mode === 0 ? '甲' : '进水管', B = m.mode === 0 ? '乙' : '出水管', unit = m.mode === 0 ? '天' : '小时';
    s += K.text(20, 26, m.mode === 0 ? '甲单独做 ' + m.a + ' 天完成，乙单独做 ' + m.b + ' 天完成' : '进水管 ' + m.a + ' 小时注满，出水管 ' + m.b + ' 小时放完', { size: 16, weight: 700, anchor: 'start' });
    s += K.text(20, 50, '整件工作（整池水）切成 ' + m.L + ' 小格：' + A + '每' + unit + ' ' + m.L / m.a + ' 格，' + B + '每' + unit + ' ' + m.L / m.b + ' 格', { size: 12, anchor: 'start', fill: '#5a6478' });
    s += btn(20, 64, 120, (m.useA ? '✓ ' : '') + A + '来' + (m.mode ? '开' : '做'), { useA: !m.useA, t: 0 }, true, '选不选' + A, m.useA) + btn(150, 64, 120, (m.useB ? '✓ ' : '') + B + (m.mode ? '也开' : '来做'), { useB: !m.useB, t: 0 }, true, '选不选' + B, m.useB);
    // 长条：按天涂色
    const X0 = 20, X1 = 680, cw = (X1 - X0) / m.L, Y = 120;
    for (let i = 0; i < m.L; i++) s += K.rect(X0 + i * cw, Y, cw, 40, { fill: '#fff', stroke: '#c5ccda', r: 0, w: 0.6 });
    if (m.mode === 0) {
      let x = 0; for (let d = 1; d <= m.t && x < m.L; d++) { const take = (n, col) => { const w = Math.min(n, m.L - x); if (w > 0) s += K.rect(X0 + x * cw, Y, w * cw, 40, { fill: col, stroke: '#3a4a63', r: 0, w: 0.8 }); x += w; }; if (m.pa) take(m.pa, CA); if (m.pb) take(m.pb, CB); s += K.text(X0 + Math.min(x, m.L) * cw - 4, Y + 56, '第 ' + d + ' 天', { size: 9, anchor: 'end', fill: '#5a6478' }); }
    } else if (m.filled > 0) s += K.rect(X0, Y, m.filled * cw, 40, { fill: '#9fd5ec', stroke: '#2f6db5', r: 0, w: 1 });
    s += K.rect(X0, Y, X1 - X0, 40, { fill: 'none', stroke: 'var(--ink)', r: 0, w: 1.6 });
    s += btn(20, 190, 110, '过一' + unit, { t: m.t + 1 }, m.rate > 0 && !m.done && m.t < 200, m.rate > 0 ? '再过一' + unit : '没有人在做，或者放得比进得快') + btn(140, 190, 90, '重来', { t: 0 }, m.t > 0, '回到开始');
    const per = Q(m.rate, m.L);
    s += K.text(250, 208, '每' + unit + '一共做 ' + (m.mode && m.useB ? m.L / m.a + ' − ' + m.L / m.b + ' = ' : '') + m.rate + ' 格 = 整件的 ' + Q.show(per) + '；已经过了 ' + m.t + ' ' + unit, { size: 13, anchor: 'start' });
    if (m.rate <= 0 && (m.useA || m.useB)) s += K.text(20, 250, '出水比进水快：永远注不满', { size: 14, weight: 700, anchor: 'start', fill: 'var(--bad)' });
    if (m.done) {
      const whole = Math.floor(m.L / m.rate), r = m.L - whole * m.rate;
      s += '<g data-read="1">' + K.text(20, 260, '做完了：' + m.L + ' ÷ ' + m.rate + ' = ' + Q.show(m.days) + ' ' + unit, { size: 16, weight: 700, anchor: 'start', fill: 'var(--blue)' }) +
        (r ? K.text(20, 286, '前 ' + whole + ' ' + unit + '做了 ' + whole * m.rate + ' 格，最后只剩 ' + r + ' 格：只要 ' + Q.show(Q(r, m.rate)) + ' ' + unit, { size: 13, anchor: 'start', fill: 'var(--blue)' }) : '') +
        K.text(20, 312, '也就是 1 ÷ (' + (m.useA ? '1/' + m.a : '') + (m.useA && m.useB ? (m.mode ? ' − ' : ' + ') : '') + (m.useB ? '1/' + m.b : '') + ') = ' + Q.show(m.days) + ' ' + unit, { size: 13, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
    }
    return s;
  }
  const I = (lo, hi, d, label) => ({ type: 'int', label, default: d, min: lo, max: hi, write: true });
  U.registerPack({
    id: 'jobbench', version: 1,
    types: {
      jobbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E4', 'E3'],
        label: '工程问题', prefix: '工程', group: '关系', grades: [6, 7],
        alias: ['工程问题', '合作', '工作效率', '工作总量', '注水', '放水', '水管', '单位 1'],
        props: {
          mode: { type: 'choice', label: '做什么', default: 0, choices: MODES, write: true },
          a: I(1, 20, 6, '甲（进水管）单独几天（小时）'), b: I(1, 20, 3, '乙（出水管）单独几天（小时）'),
          useA: { type: 'bool', label: '甲在做', default: true, write: true }, useB: { type: 'bool', label: '乙在做', default: true, write: true }, t: I(0, 200, 0, '过了几天（小时）'),
        },
        outputs: {
          days: { dim: null, kind: 'num', label: '一共几天（几小时）做完（做完了才有）' }, rate: { dim: null, kind: 'num', label: '每天做整件的几分之几' },
        },
        icon: () => K.rect(6, 18, 44, 14, { fill: '#fff', stroke: 'var(--ink)', r: 0, w: 1 }) + K.rect(6, 18, 14, 14, { fill: CA, stroke: 'none', r: 0 }) + K.rect(20, 18, 8, 14, { fill: CB, stroke: 'none', r: 0 }),
        size: () => [W, 400],
        grips: () => [],
        compute: (c) => { const m = model(c.props), o = { rate: qv(Q(m.rate, m.L)) }; if (m.done) o.days = qv(m.days); return o; },
        badge: () => '',
        draw,
      },
    },
  });
  U.JobBench = { model };
})(typeof globalThis !== 'undefined' ? globalThis : window);
