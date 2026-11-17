/* 器材包 chipbench：正负数（零对）。黄片是 +1，蓝片是 −1；一个 +1 和一个 −1 是一对“零对”，合起来是 0。
 *   - 加减与相反数：台面上先摆好第一个数。加：点“放进 …”；减：点“拿走 …”——要拿的片不够，就先放进几对零对（数不变），再拿；
 *     相反数：点“全部翻过来”。零对上下对齐画在一起，点“消掉一对”收走；没有零对了才读得出结果。
 *   - 乘法：a × b 是“放进（a 是正数）或拿走（a 是负数）|a| 组，每组 b”。(−3) × (−4)：拿走 3 组 4 个 −1——台面上本来什么也没有，得先放零对。
 *   - 除法：点“每份发一个”，把片平均发到几份里；发完了，每份是多少就是商。
 * 这一版的边界（如实写）：只有整数；每种片最多 40 个。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 700, MAX = 40, CP = '#f5c542', CN = '#7fb0e8';
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? Math.round(+v) : lo));
  const MODES = ['加减与相反数', '乘法', '除法'], OPS = ['+', '−', '相反数'];
  const fm = (n) => (n < 0 ? '−' + (-n) : String(n));
  const sg = (n) => (n < 0 ? '(−' + (-n) + ')' : String(n));
  function model(p) {
    const mode = clamp(p.mode, 0, 2), op = clamp(p.op, 0, 2), pos = clamp(p.pos, 0, MAX), neg = clamp(p.neg, 0, MAX), a = clamp(p.a, -20, 20), b = clamp(p.b, -20, 20), k = clamp(p.k, 1, 6), step = clamp(p.step, 0, 40);
    const dealt = clamp(p.dealt, 0, 40), value = pos - neg, pairs = Math.min(pos, neg);
    const each = Math.sign(a) * dealt;
    return { mode, op, pos, neg, a, b, k, step, dealt, value, pairs, each, need: mode === 1 ? Math.abs(a) : 1 };
  }
  const btn = (x, y, w, label, patch, enabled, tip) => '<g' + (enabled ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' data-off="1"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 24, { fill: enabled ? '#fff' : '#f1f3f6', stroke: enabled ? 'var(--blue)' : '#b8c0cc', r: 7, w: 1.4 }) + K.text(x + w / 2, y + 16, label, { size: 12, weight: 700, fill: enabled ? 'var(--ink)' : '#5f6773' }) + '</g>';
  const chip = (x, y, plus) => K.circle(x, y, 9, { fill: plus ? CP : CN, stroke: '#3a4a63', w: 1.2 }) + K.text(x, y + 4, plus ? '+' : '−', { size: 12, weight: 700 });
  // +1 一行一行在上，−1 在下；第 i 个 +1 和第 i 个 −1 上下对齐，成对的画一个虚线框
  function pile(m, x0, y0) {
    let s = ''; const cw = 24, per = 20;
    for (let i = 0; i < Math.max(m.pos, m.neg); i++) {
      const col = i % per, row = Math.floor(i / per), x = x0 + col * cw, yp = y0 + row * 56, yn = yp + 24;
      if (i < m.pairs) s += K.rect(x - 11, yp - 11, 22, 46, { fill: 'none', stroke: '#8a94a6', r: 6, w: 1, dash: '3 2' });
      if (i < m.pos) s += chip(x, yp, true);
      if (i < m.neg) s += chip(x, yn, false);
    }
    return s;
  }
  const opWord = (m) => (m.op === 0 ? '放进 ' : '拿走 ') + Math.abs(m.b) + ' 个 ' + (m.b < 0 ? '−1' : '+1');
  function draw(c) {
    const p = c.props, m = model(p); let s = '';
    const tidy = m.pairs === 0, read = m.pos + ' 个 +1、' + m.neg + ' 个 −1' + (tidy ? ' = ' + fm(m.value) : '：还有 ' + m.pairs + ' 对零对，消掉再读');
    s += '<g data-read="1">' + K.text(20, 24, read, { size: 15, weight: 700, anchor: 'start', fill: tidy ? 'var(--ink)' : '#8a5a00' }) + '</g>';
    if (m.mode === 0) s += K.text(W - 20, 24, m.op === 2 ? '−' + sg(m.a) + ' = ?' : sg(m.a) + ' ' + OPS[m.op] + ' ' + sg(m.b) + ' = ?', { size: 15, weight: 700, anchor: 'end', fill: 'var(--blue)' });
    if (m.mode === 1) s += K.text(W - 20, 24, sg(m.a) + ' × ' + sg(m.b) + '：' + (m.a < 0 ? '拿走 ' : '放进 ') + Math.abs(m.a) + ' 组，每组 ' + sg(m.b), { size: 14, weight: 700, anchor: 'end', fill: 'var(--blue)' });
    if (m.mode === 2) s += K.text(W - 20, 24, sg(m.a) + ' ÷ ' + m.k + '：平均分成 ' + m.k + ' 份', { size: 14, weight: 700, anchor: 'end', fill: 'var(--blue)' });
    s += pile(m, 34, 60);
    const P = (o) => Object.assign({ pos: m.pos, neg: m.neg, msg: '' }, o), y = 300;
    s += btn(20, y, 120, '放进一对 +1 −1', P({ pos: m.pos + 1, neg: m.neg + 1 }), m.pos < MAX && m.neg < MAX && m.mode !== 2, '一对零对是 0：放进去，数不变');
    s += btn(146, y, 100, '消掉一对', P({ pos: m.pos - 1, neg: m.neg - 1 }), m.pairs > 0, '一对零对是 0：收走，数不变');
    if (m.mode === 0) {
      const n = Math.abs(m.b), plus = m.b > 0, done = m.step >= 1;
      if (m.op === 0) s += btn(260, y, 160, opWord(m), P(plus ? { pos: m.pos + n, step: 1 } : { neg: m.neg + n, step: 1 }), !done && (plus ? m.pos + n : m.neg + n) <= MAX, '把第二个数放进来');
      else if (m.op === 1) { const have = plus ? m.pos : m.neg, can = have >= n; s += btn(260, y, 160, opWord(m), can ? P(plus ? { pos: m.pos - n, step: 1 } : { neg: m.neg - n, step: 1 }) : { msg: (plus ? '+1' : '−1') + ' 只有 ' + have + ' 个，不够拿 ' + n + ' 个：先放进 ' + (n - have) + ' 对零对' }, !done, '把第二个数拿走'); }
      else s += btn(260, y, 160, '全部翻过来', P({ pos: m.neg, neg: m.pos, step: 1 }), !done, '每个 +1 变 −1，每个 −1 变 +1：取相反数');
    } else if (m.mode === 1) {
      const n = Math.abs(m.b), plus = m.b > 0, take = m.a < 0, done = m.step >= m.need;
      if (!take) s += btn(260, y, 180, '放进一组 ' + sg(m.b) + '（第 ' + Math.min(m.step + 1, m.need) + ' 组）', P(plus ? { pos: m.pos + n, step: m.step + 1 } : { neg: m.neg + n, step: m.step + 1 }), !done && (plus ? m.pos + n : m.neg + n) <= MAX, '放进一组');
      else {
        const have = plus ? m.pos : m.neg, can = have >= n;
        s += btn(260, y, 180, '拿走一组 ' + sg(m.b) + '（第 ' + Math.min(m.step + 1, m.need) + ' 组）', can ? P(plus ? { pos: m.pos - n, step: m.step + 1 } : { neg: m.neg - n, step: m.step + 1 }) : { msg: (plus ? '+1' : '−1') + ' 只有 ' + have + ' 个，不够拿 ' + n + ' 个：先放零对' }, !done, '拿走一组');
        s += btn(446, y, 130, '放进 ' + n + ' 对零对', P({ pos: m.pos + n, neg: m.neg + n }), !done && m.pos + n <= MAX && m.neg + n <= MAX, '一次放进 ' + n + ' 对');
      }
      s += K.text(20, y + 50, (take ? '拿走了 ' : '放进了 ') + Math.min(m.step, m.need) + ' / ' + m.need + ' 组', { size: 12, anchor: 'start', fill: '#5a6478' });
    } else {
      const plus = m.a > 0, left = plus ? m.pos : m.neg;
      s += btn(260, y, 160, '每份发一个', P(plus ? { pos: m.pos - m.k, dealt: m.dealt + 1 } : { neg: m.neg - m.k, dealt: m.dealt + 1 }), left >= m.k, '给每一份各发一个');
      for (let g = 0; g < m.k; g++) {
        const gx = 440 + (g % 3) * 84, gy = 60 + Math.floor(g / 3) * 110;
        s += K.rect(gx, gy, 78, 100, { fill: '#f6f8fc', stroke: '#c5ccda', r: 8, w: 1 }) + K.text(gx + 39, gy + 96, '第 ' + (g + 1) + ' 份：' + fm(m.each), { size: 11, weight: 700 });
        for (let i = 0; i < m.dealt; i++) s += K.circle(gx + 12 + (i % 4) * 18, gy + 14 + Math.floor(i / 4) * 18, 7, { fill: plus ? CP : CN, stroke: '#3a4a63', w: 1 });
      }
    }
    const res = m.mode === 2 ? null : (m.step >= m.need && tidy ? m.value : null);
    if (p.msg) s += K.text(20, y + 74, p.msg, { size: 13, weight: 700, anchor: 'start', fill: 'var(--bad)' });
    else if (res !== null) s += '<g data-res="1">' + K.text(20, y + 74, (m.mode === 0 ? (m.op === 2 ? '−' + sg(m.a) : sg(m.a) + ' ' + OPS[m.op] + ' ' + sg(m.b)) : sg(m.a) + ' × ' + sg(m.b)) + ' = ' + fm(res), { size: 16, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
    else if (m.mode === 2 && m.pos === 0 && m.neg === 0 && m.dealt) s += '<g data-res="1">' + K.text(20, y + 74, sg(m.a) + ' ÷ ' + m.k + ' = ' + fm(m.each), { size: 16, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
    return s;
  }
  const I = (lo, hi, d, label, o) => Object.assign({ type: 'int', label, default: d, min: lo, max: hi, write: true }, o || {});
  U.registerPack({
    id: 'chipbench', version: 1,
    types: {
      chipbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E3', 'E2'],
        label: '正负数（零对）', prefix: '零对', group: '数与运算', grades: [6, 7],
        alias: ['正负数', '负数', '有理数', '零对', '相反数', '有理数加法', '有理数减法', '负负得正', '有理数乘法', '有理数除法'],
        props: {
          mode: { type: 'choice', label: '做什么', default: 0, choices: MODES, write: true },
          op: { type: 'choice', label: '加减与相反数：算什么', default: 0, choices: OPS, write: true },
          a: I(-20, 20, -3, '第一个数（乘法：几组；除法：被除数）'), b: I(-20, 20, 5, '第二个数（乘法：每组是几）'), k: I(1, 6, 4, '除法：分成几份'),
          pos: I(0, MAX, 0, '+1 有几个'), neg: I(0, MAX, 3, '−1 有几个'), step: I(0, 40, 0, '做了几步（自动）', { hidden: true }), dealt: I(0, 40, 0, '每份发了几个（自动）', { hidden: true }),
          msg: { type: 'text', label: '提示（自动）', default: '', write: true, hidden: true },
        },
        outputs: {
          value: { dim: null, kind: 'num', label: '台面上的数（+1 的个数 − −1 的个数）' }, pairs: { dim: null, kind: 'num', label: '有几对零对' },
          result: { dim: null, kind: 'num', label: '算完、零对消掉以后的结果（有了才有）' }, each: { dim: null, kind: 'num', label: '除法：发完以后每份是几（发完才有）' },
        },
        icon: () => K.circle(16, 16, 8, { fill: CP, stroke: 'var(--ink)', w: 1 }) + K.text(16, 20, '+', { size: 11, weight: 700 }) + K.circle(16, 36, 8, { fill: CN, stroke: 'var(--ink)', w: 1 }) + K.text(16, 40, '−', { size: 11, weight: 700 }) + K.circle(38, 26, 8, { fill: CN, stroke: 'var(--ink)', w: 1 }) + K.text(38, 30, '−', { size: 11, weight: 700 }),
        size: () => [W, 400],
        grips: () => [],
        compute: (c) => {
          const m = model(c.props), o = { value: num(m.value), pairs: num(m.pairs) };
          if (m.mode !== 2 && m.step >= m.need && m.pairs === 0) o.result = num(m.value);
          if (m.mode === 2 && m.dealt && m.pos === 0 && m.neg === 0) o.each = num(m.each);
          return o;
        },
        badge: () => '',
        draw,
      },
    },
  });
  U.ChipBench = { model };
})(typeof globalThis !== 'undefined' ? globalThis : window);
