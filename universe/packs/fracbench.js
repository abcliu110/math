/* 器材包 fracbench：分数运算台（通分加减、分数除法、倒数）。分数乘法在“面积模型”的分数乘法里做。
 *   - 加减（通分）：上下两根一样长的分数条，a/b 和 c/d。格子大小不一样，不能直接合起来（按钮是灰的，写着为什么）。
 *     点“每格再切成 2 份”“3 份”……把格子切小（分子分母一起乘）。两根条的格子一样大了，才能“合起来”（加）或“拿走”（减）。
 *     得数以后可以点“约分”：几格并成一格，直到不能再并。
 *   - 除法（包含除）：上面一根条是被除数（几个 1 或几分之几），下面一根“量尺”是除数。点“量一次”，把量尺往后放一段；
 *     最后放不下一整根时，写出最后那段是量尺的几分之几。量了几次（含最后的几分之几）就是商。
 *   - 倒数：a/b 乘几等于 1？点“上下翻过来”，变成 b/a，旁边写出 a/b × b/a = 1。
 * 这一版的边界（如实写）：分母不超过 12，切细以后的格数不超过 60；被除数不超过 4。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const qv = (q) => U.val('num', q, { dim: null });
  const W = 700, X0 = 40, X1 = 640, BL = X1 - X0;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? Math.round(+v) : lo));
  const MODES = ['加减（通分）', '除法（量一量）', '倒数', '比大小'];
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  function model(p) {
    const mode = clamp(p.mode, 0, 3), op = clamp(p.op, 0, 1);
    const a = clamp(p.a, 0, 48), b = clamp(p.b, 1, 12), c = clamp(p.c, 0, 48), d = clamp(p.d, 1, 12), ka = clamp(p.ka, 1, 12), kc = clamp(p.kc, 1, 12);
    const A = { n: a * ka, d: b * ka }, C = { n: c * kc, d: d * kc }, same = A.d === C.d, done = !!p.done && same;
    let res = null; if (done) res = { n: op === 0 ? A.n + C.n : A.n - C.n, d: A.d };
    const red = clamp(p.red, 1, 60), rv = res && res.n % red === 0 && res.d % red === 0 ? { n: res.n / red, d: res.d / red } : res, lowest = rv ? gcd(rv.n, rv.d) === 1 : false;
    const times = clamp(p.times, 0, 60), flip = !!p.flip;
    const div = Q.div(Q(a, b), Q(c || 1, d));
    return { mode, op, a, b, c, d, ka, kc, A, C, same, done, res, red, rv, lowest, times, flip, div };
  }
  const btn = (x, y, w, label, patch, enabled, tip, active) => '<g' + (enabled ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' data-off="1"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 24, { fill: active ? 'var(--blue)' : enabled ? '#fff' : '#f1f3f6', stroke: enabled || active ? 'var(--blue)' : '#b8c0cc', r: 7, w: 1.4 }) + K.text(x + w / 2, y + 16, label, { size: 12, weight: 700, fill: active ? '#fff' : enabled ? 'var(--ink)' : '#5f6773' }) + '</g>';
  // 一根分数条：长度 len 个“1”，分成 den 格，涂 num 格
  function bar(x, y, wOne, num, den, units, col) {
    let s = ''; const cw = wOne / den;
    for (let i = 0; i < den * units; i++) s += K.rect(x + i * cw, y, cw, 30, { fill: i < num ? col : '#fff', stroke: '#8a94a6', r: 0, w: den * units > 36 ? 0.5 : 1 });
    for (let u = 0; u <= units; u++) s += K.line(x + u * wOne, y - 4, x + u * wOne, y + 34, { stroke: 'var(--ink)', w: 2 });
    return s;
  }
  const fr = (n, d) => (d === 1 ? String(n) : n + '/' + d);
  // ---------- 比大小（mode 3）：两根条，可以切细；点 > = < 回答 ----------
  function drawCmp(c, m) {
    const p = c.props; let s = '';
    MODES.forEach((t, i) => { s += btn(20 + i * 120, 8, 112, t, { mode: i }, m.mode !== i, '换到“' + t + '”', m.mode === i); });
    s += K.text(520, 26, fr(m.a, m.b) + ' ○ ' + fr(m.c, m.d), { size: 16, weight: 700, anchor: 'start' });
    const units = Math.max(1, Math.ceil(Math.max(m.a / m.b, m.c / m.d))), wOne = BL / units;
    s += K.text(X0, 58, fr(m.a, m.b) + (m.ka > 1 ? ' = ' + fr(m.A.n, m.A.d) : ''), { size: 13, weight: 700, anchor: 'start', fill: '#1d4fa3' }) + bar(X0, 66, wOne, m.A.n, m.A.d, units, '#9fc3ea');
    s += K.text(X0, 128, fr(m.c, m.d) + (m.kc > 1 ? ' = ' + fr(m.C.n, m.C.d) : ''), { size: 13, weight: 700, anchor: 'start', fill: '#a35a00' }) + bar(X0, 136, wOne, m.C.n, m.C.d, units, '#f5c26b');
    [2, 3, 4, 5].forEach((k, i) => { s += btn(X0 + i * 70, 196, 64, '上 ×' + k, { ka: m.ka * k }, m.A.d * k <= 60, '上面的条每格再切成 ' + k + ' 份') + btn(X0 + 300 + i * 70, 196, 64, '下 ×' + k, { kc: m.kc * k }, m.C.d * k <= 60, '下面的条每格再切成 ' + k + ' 份'); });
    s += btn(X0, 226, 90, '重新切', { ka: 1, kc: 1 }, m.ka > 1 || m.kc > 1, '回到原来的格子');
    const truth = Q.cmp(Q(m.a, m.b), Q(m.c, m.d)), ans = p.ans === '' || p.ans === undefined ? null : +p.ans;
    ['>', '=', '<'].forEach((sy, i) => { const v = [1, 0, -1][i]; s += btn(X0 + 120 + i * 60, 226, 50, sy, { ans: v }, true, '选“' + sy + '”', ans === v); });
    s += K.text(X0 + 320, 243, m.same ? '格子一样大了：比格数' : m.a === m.c ? '分子一样：比格子大小' : '格子不一样大：切成一样大再比', { size: 12, anchor: 'start', fill: '#5a6478' });
    if (ans !== null) s += '<g data-read="1">' + K.text(X0, 290, ans === truth ? '对：' + fr(m.a, m.b) + ' ' + ['<', '=', '>'][truth + 1] + ' ' + fr(m.c, m.d) : '不对：再看看两根条，涂色的哪个长？', { size: 15, weight: 700, anchor: 'start', fill: ans === truth ? 'var(--blue)' : 'var(--bad)' }) + '</g>';
    return s;
  }
  function draw(c) {
    const p = c.props, m = model(p); let s = '';
    if (m.mode === 3) return drawCmp(c, m);
    MODES.forEach((t, i) => { s += btn(20 + i * 120, 8, 112, t, { mode: i }, m.mode !== i, '换到“' + t + '”', m.mode === i); });
    if (m.mode === 0) {
      const S = m.op === 0 ? '+' : '−';
      s += K.text(400, 26, m.a + '/' + m.b + ' ' + S + ' ' + m.c + '/' + m.d + ' = ?', { size: 16, weight: 700, anchor: 'start' });
      const units = Math.max(1, Math.ceil(Math.max(m.a / m.b, m.c / m.d))), wOne = BL / units;
      s += K.text(X0, 58, fr(m.a, m.b) + (m.ka > 1 ? ' = ' + fr(m.A.n, m.A.d) : '') + '（每格是 1/' + m.A.d + '）', { size: 13, weight: 700, anchor: 'start', fill: '#1d4fa3' }) + bar(X0, 66, wOne, m.A.n, m.A.d, units, '#9fc3ea');
      s += K.text(X0, 128, fr(m.c, m.d) + (m.kc > 1 ? ' = ' + fr(m.C.n, m.C.d) : '') + '（每格是 1/' + m.C.d + '）', { size: 13, weight: 700, anchor: 'start', fill: '#a35a00' }) + bar(X0, 136, wOne, m.C.n, m.C.d, units, '#f5c26b');
      [2, 3, 4, 5].forEach((k, i) => { s += btn(X0 + i * 70, 196, 64, '上 ×' + k, { ka: m.ka * k, done: false, red: 1 }, m.A.d * k <= 60 && !m.done, '上面的条每格再切成 ' + k + ' 份') + btn(X0 + 300 + i * 70, 196, 64, '下 ×' + k, { kc: m.kc * k, done: false, red: 1 }, m.C.d * k <= 60 && !m.done, '下面的条每格再切成 ' + k + ' 份'); });
      s += btn(X0, 226, 90, '重新切', { ka: 1, kc: 1, done: false, red: 1 }, (m.ka > 1 || m.kc > 1), '回到原来的格子');
      s += btn(X0 + 100, 226, 140, m.op === 0 ? '合起来（加）' : '拿走（减）', { done: true, red: 1 }, m.same && !m.done && (m.op === 0 || m.A.n >= m.C.n), m.same ? '格子一样大了，可以' + (m.op === 0 ? '合起来' : '拿走') : '格子大小不一样，不能直接' + (m.op === 0 ? '加' : '减'));
      if (!m.same) s += K.text(X0 + 250, 243, '格子大小不一样：1/' + m.A.d + ' 和 1/' + m.C.d + '，先切成一样大', { size: 12, weight: 700, anchor: 'start', fill: 'var(--bad)' });
      if (m.done) {
        const rk = []; for (let k = 2; k <= 12; k++) if (m.rv.n % k === 0 && m.rv.d % k === 0) rk.push(k);
        s += bar(X0, 258, wOne, m.res.n, m.res.d, units, '#9fd5ad');
        rk.slice(0, 4).forEach((k, i) => { s += btn(X0 + i * 96, 294, 90, '约分 ÷' + k, { red: m.red * k }, true, '每 ' + k + ' 格并成一格'); });
        s += '<g data-read="1">' + K.text(X0, 336, m.a + '/' + m.b + ' ' + S + ' ' + m.c + '/' + m.d + ' = ' + m.A.n + '/' + m.A.d + ' ' + S + ' ' + m.C.n + '/' + m.C.d + ' = ' + fr(m.res.n, m.res.d) + (m.red > 1 ? ' = ' + fr(m.rv.n, m.rv.d) : ''), { size: 15, weight: 700, anchor: 'start', fill: 'var(--blue)' }) +
          K.text(X0, 356, m.lowest ? '已经是最简分数' : '还能约分', { size: 12, anchor: 'start', fill: m.lowest ? 'var(--blue)' : '#5a6478' }) + '</g>';
      }
    } else if (m.mode === 1) {
      s += K.text(400, 26, fr(m.a, m.b) + ' ÷ ' + fr(m.c, m.d) + ' = ?', { size: 16, weight: 700, anchor: 'start' });
      const units = Math.max(1, Math.ceil(m.a / m.b)), wOne = BL / Math.max(units, 1);
      s += K.text(X0, 58, '被除数 ' + fr(m.a, m.b) + '：里面有几个 ' + fr(m.c, m.d) + '？', { size: 13, weight: 700, anchor: 'start' }) + bar(X0, 66, wOne, m.a, m.b, units, '#9fc3ea');
      const stick = wOne * m.c / m.d, total = wOne * m.a / m.b;
      for (let i = 0; i < m.times; i++) { const x = X0 + i * stick, w = Math.min(stick, Math.max(0, total - i * stick)); if (w <= 0.5) break; s += K.rect(x, 108, w, 22, { fill: i % 2 ? '#f5c26b' : '#fde2c4', stroke: '#8a5a00', r: 2, w: 1.2 }) + K.text(x + w / 2, 124, String(i + 1), { size: 11, weight: 700 }); }
      const fits = Q.num(m.div), whole = Math.floor(fits + 1e-9), left = Q.sub(m.div, Q(whole));
      const covered = m.times * Q.num(Q(m.c, m.d)) >= Q.num(Q(m.a, m.b)) - 1e-9;
      s += K.text(X0, 156, '量尺：' + fr(m.c, m.d) + '（下面一段一段的就是它）', { size: 12, anchor: 'start', fill: '#8a5a00' });
      s += btn(X0, 170, 110, '量一次', { times: m.times + 1 }, !covered && m.times < 60, '把量尺往后放一段') + btn(X0 + 120, 170, 90, '重来', { times: 0 }, m.times > 0, '拿走量尺');
      if (covered) s += '<g data-read="1">' + K.text(X0, 230, left.n === 0n || Q.num(left) === 0 ? '正好量了 ' + whole + ' 次：' + fr(m.a, m.b) + ' 里有 ' + whole + ' 个 ' + fr(m.c, m.d) : '量了 ' + whole + ' 次，最后一段只有量尺的 ' + Q.show(left) + '：一共 ' + Q.show(m.div) + ' 个', { size: 15, weight: 700, anchor: 'start', fill: 'var(--blue)' }) +
        K.text(X0, 256, fr(m.a, m.b) + ' ÷ ' + fr(m.c, m.d) + ' = ' + fr(m.a, m.b) + ' × ' + fr(m.d, m.c) + ' = ' + Q.show(m.div), { size: 14, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + K.text(X0, 280, '除以一个分数，等于乘它的倒数', { size: 12, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
      else s += K.text(X0, 230, '已经量了 ' + m.times + ' 次', { size: 13, anchor: 'start', fill: '#5a6478' });
    } else {
      s += K.text(400, 26, fr(m.a, m.b) + ' × ? = 1', { size: 16, weight: 700, anchor: 'start' });
      const top = m.flip ? m.b : m.a, bot = m.flip ? m.a : m.b;
      s += K.text(200, 140, String(top), { size: 44, weight: 700 }) + K.line(160, 156, 240, 156, { w: 3 }) + K.text(200, 200, String(bot), { size: 44, weight: 700 });
      s += btn(300, 150, 140, '上下翻过来', { flip: !m.flip }, true, '分子分母换个位置');
      if (m.flip && m.a) s += '<g data-read="1">' + K.text(X0, 270, fr(m.a, m.b) + ' 的倒数是 ' + fr(m.b, m.a) + '：' + fr(m.a, m.b) + ' × ' + fr(m.b, m.a) + ' = ' + (m.a * m.b) + '/' + (m.a * m.b) + ' = 1', { size: 15, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
      if (m.flip && !m.a) s += K.text(X0, 270, '0 没有倒数：0 乘什么都是 0', { size: 14, weight: 700, anchor: 'start', fill: 'var(--bad)' });
    }
    return s;
  }
  const I = (lo, hi, d, label, o) => Object.assign({ type: 'int', label, default: d, min: lo, max: hi, write: true }, o || {});
  U.registerPack({
    id: 'fracbench', version: 1,
    types: {
      fracbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E3', 'E2'],
        label: '分数运算', prefix: '分数', group: '分数', grades: [5, 6],
        alias: ['分数加法', '分数减法', '通分', '异分母', '约分', '分数除法', '倒数', '包含除', '最简分数'],
        props: {
          mode: { type: 'choice', label: '做什么', default: 0, choices: MODES, write: true }, op: { type: 'choice', label: '加减：加还是减', default: 0, choices: ['+', '−'], write: true },
          a: I(0, 48, 1, '第一个分数的分子'), b: I(1, 12, 2, '第一个分数的分母'), c: I(0, 48, 1, '第二个分数的分子'), d: I(1, 12, 3, '第二个分数的分母'),
          ka: I(1, 12, 1, '上面的条每格又切成几份'), kc: I(1, 12, 1, '下面的条每格又切成几份'), done: { type: 'bool', label: '合起来（拿走）了', default: false, write: true }, red: I(1, 60, 1, '约分：几格并成一格'),
          times: I(0, 60, 0, '除法：量了几次'), flip: { type: 'bool', label: '倒数：翻过来了', default: false, write: true }, ans: { type: 'text', label: '比大小：选的（1 大于、0 等于、−1 小于）', default: '', write: true },
        },
        outputs: {
          result: { dim: null, kind: 'num', label: '加减的结果（合起来以后才有）' }, lowest: { dim: null, kind: 'num', label: '结果约成最简了：1' }, common: { dim: null, kind: 'num', label: '切成一样大以后的分母（一样大才有）' },
          quot: { dim: null, kind: 'num', label: '除法的商（量完才有）' }, recip: { dim: null, kind: 'num', label: '倒数（翻过来才有）' }, cmpok: { dim: null, kind: 'num', label: '比大小：选对 1、选错 0（选了才有）' },
        },
        icon: () => K.rect(6, 10, 44, 12, { fill: '#fff', stroke: 'var(--ink)', r: 0, w: 1 }) + K.rect(6, 10, 22, 12, { fill: '#9fc3ea', stroke: 'var(--ink)', r: 0, w: 1 }) + K.rect(6, 28, 44, 12, { fill: '#fff', stroke: 'var(--ink)', r: 0, w: 1 }) + K.rect(6, 28, 15, 12, { fill: '#f5c26b', stroke: 'var(--ink)', r: 0, w: 1 }),
        size: () => [W, 400],
        grips: () => [],
        compute: (c) => {
          const m = model(c.props), o = {};
          if (m.mode === 0) { if (m.same) o.common = qv(Q(m.A.d)); if (m.done) { o.result = qv(Q(m.res.n, m.res.d)); if (m.lowest) o.lowest = qv(Q(1)); } }
          if (m.mode === 1 && m.c > 0 && m.times * Q.num(Q(m.c, m.d)) >= Q.num(Q(m.a, m.b)) - 1e-9 && m.times > 0) o.quot = qv(m.div);
          if (m.mode === 2 && m.flip && m.a) o.recip = qv(Q(m.b, m.a));
          if (m.mode === 3 && c.props.ans !== '' && c.props.ans !== undefined) o.cmpok = qv(Q(+c.props.ans === Q.cmp(Q(m.a, m.b), Q(m.c, m.d)) ? 1 : 0));
          return o;
        },
        badge: () => '',
        draw,
      },
    },
  });
  U.FracBench = { model };
})(typeof globalThis !== 'undefined' ? globalThis : window);
