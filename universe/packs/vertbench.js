/* 器材包 vertbench：竖式加减与除法。数位对齐，一位一位算；进位、退位要自己点出来；除法一步一步试商。
 *   - 加法：从个位起，点下面的数字键写这一位的得数。这一位满十，就要先点下一位上面的小圆圈“进 1”，下一位才写得进去。
 *   - 减法：这一位不够减，要先点前一位上面的小圆圈“退 1”：前一位少 1，这一位多 10，画在格子上方。前一位是 0 时也一样，0 退了要再向前借。
 *   - 除法：先看被除数前几位够不够除；点数字键试商：大了、小了都会说明（“4 × 3 = 12，比 8 大”“余下的 5 比除数 4 大，商可以再大”）；
 *     试对了，乘积和减出来的数自动写下去，再落下下一位。不够除的那一位商 0，也要写 0。
 *   - 写错了不会算进去，只说明为什么。
 * 这一版的边界（如实写）：加减最多 4 位数；除数最多两位数、被除数最多 4 位；没有小数（小数竖式在“小数”操作台里）。乘法竖式在“竖式乘法”。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 700, CW = 40, RX = 300, KY = 352;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? +v : lo));
  const dig = (n, j) => Math.floor(n / Math.pow(10, j)) % 10;
  const OPS = ['加法', '减法', '除法'];
  const set = (t) => new Set(String(t || '').split(',').filter(Boolean).map(Number));
  // ---- 加法、减法：从个位起一位一位 ----
  function addsub(p) {
    const sub = p.mode === 1, a = clamp(p.a, 0, 9999), b = clamp(p.b, 0, sub ? clamp(p.a, 0, 9999) : 9999), n = Math.max(String(a).length, String(b).length) + (sub ? 0 : 1), res = String(p.res || '').split('').map(Number), marks = set(p.marks);
    const col = (j) => {
      if (!sub) { const cin = marks.has(j) ? 1 : 0, s = dig(a, j) + dig(b, j) + cin, prevS = j > 0 ? dig(a, j - 1) + dig(b, j - 1) + (marks.has(j - 1) ? 1 : 0) : 0; return { top: dig(a, j), want: s % 10, carryOut: s >= 10, need: j > 0 && prevS >= 10 && !marks.has(j) ? '前一位满十了：先点这一位上面的小圆圈，进 1' : '' }; }
      const top0 = dig(a, j) - (marks.has(j) ? 1 : 0), borrow = top0 < dig(b, j);
      return { top: top0 + (marks.has(j + 1) ? 10 : 0), top0, want: top0 + (marks.has(j + 1) ? 10 : 0) - dig(b, j), need: borrow && !marks.has(j + 1) ? '这一位 ' + top0 + ' 不够减 ' + dig(b, j) + '：先点前一位上面的小圆圈，退 1' : '' };
    };
    const cur = res.length, total = sub ? a - b : a + b, len = String(total).length, done = cur >= (sub ? Math.max(1, len) : len) && res.every((d, j) => d === col(j).want);
    return { sub, a, b, n, res, marks, col, cur, total, done, len };
  }
  // ---- 除法：一步一步 ----
  function division(p) {
    const a = clamp(p.a, 1, 9999), b = clamp(p.b, 1, 99), D = String(a).split('').map(Number), q = String(p.qd || '').split('').map(Number);
    let i = 0, part = 0; while (i < D.length && part * 10 + D[i] < b && i < D.length - 1) { part = part * 10 + D[i]; i++; }
    part = part * 10 + D[i];
    const start = i, steps = []; let k = 0;
    for (let pos = start; pos < D.length; pos++) {
      const want = Math.floor(part / b), st = { pos, part, want, got: q[k] };
      steps.push(st);
      if (q[k] === undefined) break;
      const rem = part - want * b; st.prod = want * b; st.rem = rem; k++;
      if (pos + 1 < D.length) part = rem * 10 + D[pos + 1];
    }
    const done = q.length === D.length - start, last = steps[steps.length - 1];
    return { a, b, D, q, start, steps, cur: done ? null : last, done, quotient: Math.floor(a / b), r: a % b };
  }
  function model(p) { return p.mode === 2 ? Object.assign({ mode: 2 }, division(p)) : Object.assign({ mode: clamp(p.mode, 0, 1) }, addsub(p)); }
  // 按一个数字键
  function press(p, d) {
    const m = model(p);
    if (m.mode === 2) {
      if (m.done) return {};
      const c = m.cur; if (d === c.want) return { qd: String(p.qd || '') + d, msg: '' };
      return { msg: d * m.b > c.part ? d + ' × ' + m.b + ' = ' + d * m.b + '，比 ' + c.part + ' 大：商小一点' : '余下 ' + (c.part - d * m.b) + '，还比除数 ' + m.b + ' 大：商可以再大' };
    }
    if (m.done) return {};
    const c = m.col(m.cur); if (c.need) return { msg: c.need };
    if (d === c.want) return { res: String(p.res || '') + d, msg: '' };
    return { msg: m.sub ? c.top + ' − ' + dig(m.b, m.cur) + ' 不是 ' + d : '这一位 ' + dig(m.a, m.cur) + ' + ' + dig(m.b, m.cur) + (m.marks.has(m.cur) ? ' + 1（进的）' : '') + ' = ' + (dig(m.a, m.cur) + dig(m.b, m.cur) + (m.marks.has(m.cur) ? 1 : 0)) + '，个位是 ' + c.want + '，不是 ' + d };
  }
  const key = (x, y, label, patch, on, k) => '<g data-key="' + k + '"' + (on ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' data-off="1"') + '>' + K.rect(x, y, 40, 34, { fill: on ? '#fff' : '#f1f3f6', stroke: on ? 'var(--blue)' : '#b8c0cc', r: 7, w: 1.5 }) + K.text(x + 20, y + 23, label, { size: 17, weight: 700, fill: on ? 'var(--ink)' : '#5f6773' }) + '</g>';
  const MONO = 'ui-monospace, Consolas, monospace';
  const T = (x, y, s, o) => K.text(x, y, s, Object.assign({ size: 24, weight: 700, family: MONO }, o || {}));

  function draw(c) {
    const p = c.props, m = model(p); let s = '';
    if (m.mode !== 2) {
      const X = (j) => 230 - j * CW, op = m.sub ? '−' : '+';
      s += K.text(20, 28, m.a + ' ' + op + ' ' + m.b + '：从个位起，一位一位算', { size: 15, weight: 700, anchor: 'start' });
      for (let j = 0; j < m.n; j++) {
        const cc = m.col(j), hot = !m.done && j === m.cur, can = m.sub ? j > 0 && j < String(m.a).length : j > 0 && j < m.n, on = m.marks.has(j);
        const ms = new Set(m.marks); if (on) ms.delete(j); else ms.add(j);
        if (hot) s += K.rect(X(j) - CW / 2 + 2, 52, CW - 4, 196, { fill: '#eef3fb', stroke: 'none', r: 6 });
        if (can) s += '<g data-mark="' + j + '" data-pick-set="' + encodeURIComponent(JSON.stringify({ marks: [...ms].sort().join(','), msg: '' })) + '" style="cursor:pointer"><title>' + (m.sub ? '这一位退 1（给后一位）' : '进 1（前一位满十）') + '</title>' + K.circle(X(j), 64, 10, { fill: on ? '#f5a25d' : '#fff', stroke: on ? '#8a4a12' : '#8a94a8', w: 1.4 }) + (on ? K.text(X(j), 68, m.sub ? '·' : '1', { size: 12, weight: 700 }) : '') + '</g>';
        if (j < String(m.a).length) { const changed = m.sub && (m.marks.has(j) || m.marks.has(j + 1)); s += T(X(j), 116, String(dig(m.a, j)), { fill: changed ? '#8a94a8' : 'var(--ink)' }); if (changed) s += K.line(X(j) - 9, 108, X(j) + 9, 108, { w: 1.4, stroke: '#c0392b' }) + K.text(X(j), 92, String(cc.top), { size: 13, weight: 700, fill: '#c0392b' }); }
        if (j < String(m.b).length) s += T(X(j), 156, String(dig(m.b, j)));
        if (j < m.res.length) s += T(X(j), 216, String(m.res[j]), { fill: 'var(--good)' });
      }
      s += T(X(m.n - 1) - CW, 156, op) + K.line(X(m.n - 1) - CW - 10, 172, X(0) + CW / 2, 172, { w: 2.4 });
      if (m.done) s += K.text(20, 268, m.a + ' ' + op + ' ' + m.b + ' = ' + m.total, { size: 18, weight: 700, anchor: 'start', fill: 'var(--good)' });
      else { const cc = m.col(m.cur); s += K.text(RX, 80, ['个', '十', '百', '千', '万'][m.cur] + '位', { size: 14, weight: 700, anchor: 'start' }); if (cc.need) s += K.text(RX, 106, cc.need, { size: 12, weight: 700, anchor: 'start', fill: 'var(--bad)' }); }
    } else {
      const X0 = 150, X = (i) => X0 + i * CW, Y = (r) => 110 + r * 34;
      s += K.text(20, 28, m.a + ' ÷ ' + m.b + '：从高位起，一步一步试商', { size: 15, weight: 700, anchor: 'start' });
      // 除数、被除数、横线、商
      s += T(X0 - 30, Y(0), String(m.b), { anchor: 'end' }) + '<path d="M' + (X0 - 22) + ' ' + (Y(0) + 8) + ' Q' + (X0 - 10) + ' ' + (Y(0) - 10) + ' ' + (X0 - 16) + ' ' + (Y(0) - 26) + '" fill="none" stroke="var(--ink)" stroke-width="2"/>' + K.line(X0 - 16, Y(0) - 26, X(m.D.length - 1) + CW / 2, Y(0) - 26, { w: 2 });
      m.D.forEach((d, i) => { s += T(X(i), Y(0), String(d)); });
      m.q.forEach((d, k) => { s += T(X(m.start + k), Y(0) - 36, String(d), { fill: 'var(--good)' }); });
      let r = 1;
      m.steps.forEach((st, k) => {
        if (st.got === undefined) return;
        const right = X(st.pos) + CW / 2, ps = String(st.prod);
        if (st.want === 0 && k > 0) return;   // 商 0 的那一步：不写乘积（落下的数直接接着往下）
        ps.split('').forEach((d, i) => { s += T(right - (ps.length - i) * CW + CW / 2, Y(r), d, { size: 20, fill: '#5a6478' }); });
        s += K.line(right - Math.max(ps.length, String(st.part).length) * CW, Y(r) + 8, right, Y(r) + 8, { w: 1.6 });
        const nxt = st.pos + 1 < m.D.length ? String(st.rem * 10 + m.D[st.pos + 1]) : String(st.rem), nr = st.pos + 1 < m.D.length ? right + CW : right;
        nxt.split('').forEach((d, i) => { s += T(nr - (nxt.length - i) * CW + CW / 2, Y(r + 1), d, { size: 20 }); });
        r += 2;
      });
      if (m.cur) { s += K.rect(X(m.cur.pos) - CW / 2 + 2, Y(0) - 60, CW - 4, 30, { fill: 'none', stroke: 'var(--blue)', r: 6, w: 2 }) + K.text(RX + 120, 80, '这一步：' + m.cur.part + ' 里有几个 ' + m.b + '？', { size: 14, weight: 700, anchor: 'start' }); if (m.cur.part < m.b) s += K.text(RX + 120, 104, m.cur.part + ' 比 ' + m.b + ' 小，不够除：商写 0', { size: 12, weight: 700, anchor: 'start', fill: 'var(--blue)' }); }
      if (m.done) s += K.text(RX + 120, 80, m.a + ' ÷ ' + m.b + ' = ' + m.quotient + (m.r ? ' …… ' + m.r : ''), { size: 18, weight: 700, anchor: 'start', fill: 'var(--good)' });
    }
    if (p.msg) s += '<g data-msg="1">' + K.text(m.mode === 2 ? RX + 120 : RX, m.mode === 2 ? 130 : 136, p.msg, { size: 12, weight: 700, anchor: 'start', fill: 'var(--bad)' }) + '</g>';
    for (let d = 0; d <= 9; d++) s += key(20 + d * 46, KY, String(d), press(p, d), !m.done, d);
    const back = m.mode === 2 ? { qd: String(p.qd || '').slice(0, -1), msg: '' } : { res: String(p.res || '').slice(0, -1), msg: '' };
    s += '<g data-key="back" data-pick-set="' + encodeURIComponent(JSON.stringify(back)) + '" style="cursor:pointer">' + K.rect(484, KY, 70, 34, { fill: '#fff', stroke: 'var(--blue)', r: 7, w: 1.5 }) + K.text(519, KY + 22, '退一步', { size: 13, weight: 700 }) + '</g>';
    return s;
  }
  const I = (lo, hi, d, label, o) => Object.assign({ type: 'int', label, default: d, min: lo, max: hi, write: true }, o || {});
  const Tx = (d, label) => ({ type: 'text', label, default: d, write: true, hidden: true });
  U.registerPack({
    id: 'vertbench', version: 1,
    types: {
      vertbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E2', 'E7'],
        label: '竖式（加减与除法）', prefix: '竖式', group: '数与运算', grades: [2, 5],
        alias: ['竖式', '笔算', '进位', '退位', '借位', '加法', '减法', '除法', '试商', '商中间有 0', '余数'],
        props: {
          mode: { type: 'choice', label: '算什么', default: 0, choices: OPS, write: true },
          a: I(0, 9999, 47, '第一个数（被除数）'), b: I(1, 9999, 38, '第二个数（除数）'),
          res: Tx('', '加减：已经写下的得数（从个位起）'), marks: Tx('', '加减：点了进位、退位的数位'), qd: Tx('', '除法：已经写下的商'), msg: Tx('', '提示（自动）'),
        },
        outputs: {
          done: { dim: null, kind: 'num', label: '算完了：1 是，0 否' }, result: { dim: null, kind: 'num', label: '得数（加减算完才有）' },
          q: { dim: null, kind: 'num', label: '商（除法算完才有）' }, r: { dim: null, kind: 'num', label: '余数（除法算完才有）' }, written: { dim: null, kind: 'num', label: '已经写了几位' },
        },
        icon: () => K.text(46, 16, '47', { size: 12, weight: 700, anchor: 'end' }) + K.text(46, 30, '+38', { size: 12, weight: 700, anchor: 'end' }) + K.line(18, 34, 48, 34, { w: 1.5 }) + K.circle(26, 6, 3, { fill: '#f5a25d', stroke: 'var(--ink)', w: 1 }),
        size: () => [W, 420],
        grips: () => [],
        compute: (c) => {
          const m = model(c.props), o = { done: num(m.done ? 1 : 0), written: num(m.mode === 2 ? m.q.length : m.res.length) };
          if (m.done) { if (m.mode === 2) { o.q = num(m.quotient); o.r = num(m.r); } else o.result = num(m.total); }
          return o;
        },
        badge: () => '',
        draw,
      },
    },
  });
  U.VertBench = { model, press };
})(typeof globalThis !== 'undefined' ? globalThis : window);
