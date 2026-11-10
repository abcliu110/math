/* 数位竖式工作台的内核（D8，docs/direction.md 第 7 节 D8）。纯逻辑，不碰界面。
 * 竖式是两个数（0–999 的整数）的加法或减法，列从个位（0）、十位（1）、百位（2）算起。
 *  - params：{ op: '+' | '−', a, b }。减法要 a ≥ b。
 *  - state（从 params 和步骤重算，不存）：
 *      written[c]  第 c 列写下的数字（没写是 null）；
 *      carry[c]    加法：第 c 列满十，进了 1 到第 c+1 列；
 *      top[c]      上面那个数在第 c 列的值（减法借位后会变；加法就是 a 的这一位）；
 *      adj[c]      减法：第 c 列从右边借来加上的数（借一位是 10，借位链中间的列是 10，它自己再借出去）；
 *      dec[c]      减法：第 c 列借出去了，上面的数减 1。
 *  - 一步 = 写一个数字（tool 'write'，args { col, d }）、加法进位（'carry'，args { col }）、减法退位（'borrow'，args { col }）。
 *    列必须按顺序从个位写起；写下的数字必须是这一列算出来的个位数，不对就拒绝并说明原因（不记步骤）。
 *    加法：前一列满十，要先进位，才能写这一列。减法：这一列不够减，要先退位，才能写这一列。
 *  - 步骤记在台面 scene.workbench 上：{ host: 竖式器材 id, key: 'digits|' + JSON(params), steps: [{ tool, rule, args, kept }] }，
 *    rule 是 digit.write / digit.carry / digit.borrow。台面的器材和连线不变（步骤不是器材）。
 *  - U.Digits.paramsOf(props) → params（器材的属性：a、b、op 的下标，0 加 / 1 减）
 *  - U.Digits.keyOf(params) → 记在台面上的记号
 *  - U.Digits.start(params) → state；U.Digits.apply(state, tool, args) → { ok, why, state, step }
 *  - U.Digits.replay(params, steps) → state（步骤不对就抛错）
 *  - U.Digits.view(state) → 界面用的数据（列、下一步、能进位或退位的列、是否写完）
 *  - U.Digits.stateOf(scene, id, params) → state 或 null；U.Digits.current(scene, id, params) → 没有步骤时从头开始
 *  - U.Digits.judge(scene, q) → { ok, why }：q = { solved: true } 结果写完了（判题的 digits 查询）
 */
(function (G) {
  'use strict';
  const U = G.U;
  const COLS = 3;
  const NAMES = ['个位', '十位', '百位'];
  const F = false;

  const lenOf = (n) => String(n).length;
  const dig = (n) => { const s = []; let m = n; for (let c = 0; c < COLS; c++) { s.push(m % 10); m = Math.floor(m / 10); } return s; };
  const keyOf = (p) => 'digits|' + JSON.stringify(p);

  function paramsOf(props) {
    const pr = props || {};
    return { op: pr.op === 1 ? '−' : '+', a: Math.round(Number(pr.a)), b: Math.round(Number(pr.b)) };
  }
  // 参数能不能做：0–999 的整数；减法要 a ≥ b
  function badParams(p) {
    if (!p || (p.op !== '+' && p.op !== '−')) return '竖式只做加法或减法';
    if (!Number.isInteger(p.a) || !Number.isInteger(p.b) || p.a < 0 || p.b < 0 || p.a > 999 || p.b > 999) return '竖式的两个数要是 0–999 的整数';
    if (p.op === '−' && p.a < p.b) return '减法要大数减小数（' + p.a + ' 比 ' + p.b + ' 小）';
    return null;
  }
  // 从参数推出来的量：结果、结果的位数（写几列）、两个数的各位
  function derive(p) {
    const r = p.op === '+' ? p.a + p.b : p.a - p.b;
    return { r, N: Math.max(1, lenOf(r)), A: dig(p.a), B: dig(p.b) };
  }
  function start(p) {
    const why = badParams(p);
    if (why) throw new Error(why);
    return { p, written: [null, null, null], carry: [F, F, F], top: derive(p).A.slice(), adj: [0, 0, 0], dec: [F, F, F] };
  }
  const clone = (st) => ({ p: st.p, written: st.written.slice(), carry: st.carry.slice(), top: st.top.slice(), adj: st.adj.slice(), dec: st.dec.slice() });
  // 第 c 列的和（加法）：两个数的这一位加上从右边进来的 1
  const sumAt = (st, c) => { const d = derive(st.p); return d.A[c] + d.B[c] + (c > 0 && st.carry[c - 1] ? 1 : 0); };
  // 现在要写的列：从个位起第一个没写的列；都写完了是 -1
  function curOf(st) { const N = derive(st.p).N; for (let c = 0; c < N; c++) if (st.written[c] === null) return c; return -1; }
  // 借位的来源：第 c 列右边第一个上面还有数的列（中间的 0 都会变成 9）；没有返回 -1
  function lenderOf(st, c) { for (let k = c + 1; k < COLS; k++) if (st.top[k] > 0) return k; return -1; }

  function apply(st, tool, args) {
    const a = args || {}, c = a.col;
    const fail = (why) => ({ ok: false, why, state: st });
    const d = derive(st.p), cur = curOf(st);
    if (cur < 0) return fail('竖式已经写完了');
    if (!Number.isInteger(c) || c < 0 || c >= COLS) return fail('没有这一列');
    const plus = st.p.op === '+';

    if (tool === 'write') {
      const x = a.d;
      if (c >= d.N) return fail('这一列不用写');
      if (c < cur) return fail('这一列已经写好了');
      if (c > cur) return fail('先写' + NAMES[cur] + '，再写' + NAMES[c]);
      if (plus) {
        if (c > 0 && sumAt(st, c - 1) >= 10 && !st.carry[c - 1]) return fail(NAMES[c - 1] + '满十了，要先进位，再写' + NAMES[c]);
        const s = sumAt(st, c);
        if (x !== s % 10) return fail('这一列算出 ' + s + '，写在这里的应该是它的个位数字');
      } else {
        if (st.top[c] < d.B[c]) return fail('这一列不够减，先点「退位」，向左边借 1，再写');
        if (x !== st.top[c] - d.B[c]) return fail('这一列是 ' + st.top[c] + ' − ' + d.B[c] + '，写在这里的应该是它的个位数字');
      }
      const s2 = clone(st); s2.written[c] = x;
      return { ok: true, why: '', state: s2, step: { tool: 'write', rule: 'digit.write', args: { col: c, d: x }, kept: true } };
    }

    if (tool === 'carry') {
      if (!plus) return fail('减法用「退位」，不用进位');
      if (st.written[c] === null) return fail('先写' + NAMES[c] + '，再进位');
      if (c + 1 >= COLS) return fail('最高位不用进位');
      if (sumAt(st, c) < 10) return fail(NAMES[c] + '没有满十，不用进位');
      if (st.carry[c]) return fail(NAMES[c] + '已经进过位了');
      const s2 = clone(st); s2.carry[c] = true;
      return { ok: true, why: '', state: s2, step: { tool: 'carry', rule: 'digit.carry', args: { col: c }, kept: true } };
    }

    if (tool === 'borrow') {
      if (plus) return fail('加法用「进位」，不用退位');
      if (c !== cur) return fail('退位要从' + NAMES[cur] + '开始');
      if (st.top[c] >= d.B[c]) return fail('这一列够减，不用退位');
      const k = lenderOf(st, c);
      if (k < 0) return fail('左边没有可以借的数了');
      const s2 = clone(st);
      // 从 k 一位一位借下来：k 减 1，中间的列各加 10 再借出去一位（相当于 10 变成 9 加 10）
      for (let j = k - 1; j >= c; j--) { s2.top[j] += 10; s2.top[j + 1] -= 1; s2.dec[j + 1] = true; s2.adj[j] += 10; }
      return { ok: true, why: '', state: s2, step: { tool: 'borrow', rule: 'digit.borrow', args: { col: c }, kept: true } };
    }

    return fail('没有这个操作：' + tool);
  }

  // 从 start 重放一串步骤；步骤不对就抛错（不会悄悄算错）
  function replay(p, steps) {
    let st = start(p);
    for (const s of steps || []) {
      const r = apply(st, s.tool, s.args);
      if (!r.ok) throw new Error('重放失败：' + r.why);
      st = r.state;
    }
    return st;
  }

  const SYM = { '+': '+', '−': '−' };
  function view(st) {
    const d = derive(st.p), cur = curOf(st), plus = st.p.op === '+';
    const lenA = lenOf(st.p.a), lenB = lenOf(st.p.b);
    const cols = [];
    for (let c = 0; c < COLS; c++) {
      cols.push({
        c, name: NAMES[c], off: c >= d.N, cur: c === cur,
        top: (c < lenA || st.adj[c] || st.dec[c]) ? st.top[c] : null,
        bot: c < lenB ? d.B[c] : null,
        digit: st.written[c],
        carryIn: plus && c > 0 && st.carry[c - 1] ? 1 : 0,
        adj: st.adj[c], dec: st.dec[c] ? 1 : 0,
        sum: plus && c < d.N ? sumAt(st, c) : null,
      });
    }
    // 能进位的列：写好了、和满十、还没进过位
    const carryable = [];
    if (plus) for (let c = 0; c + 1 < COLS; c++) if (st.written[c] !== null && sumAt(st, c) >= 10 && !st.carry[c]) carryable.push(c);
    // 能退位的列：现在要写的这一列不够减
    const borrowable = !plus && cur >= 0 && st.top[cur] < d.B[cur] ? cur : -1;
    const done = cur < 0;
    let now;
    if (done) now = '结果 ' + d.r + '，写完了';
    else if (borrowable >= 0) now = '下一步：' + NAMES[cur] + '不够减，先退位';
    else if (plus && cur > 0 && sumAt(st, cur - 1) >= 10 && !st.carry[cur - 1]) now = '下一步：' + NAMES[cur - 1] + '满十，先进位';
    else now = '下一步：写' + NAMES[cur];
    return {
      op: st.p.op, a: st.p.a, b: st.p.b, title: st.p.a + ' ' + SYM[st.p.op] + ' ' + st.p.b,
      N: d.N, cols, cur, done, result: done ? d.r : null, carryable, borrowable, now,
    };
  }

  // 台面上记的步骤属于这台竖式（同一个器材、同一组参数）才算
  function stateOf(scene, id, p) {
    const wb = scene && scene.workbench;
    if (!wb || wb.host !== id || wb.key !== keyOf(p) || !Array.isArray(wb.steps) || !wb.steps.length) return null;
    try { return replay(p, wb.steps); } catch (e) { return null; }
  }
  const current = (scene, id, p) => stateOf(scene, id, p) || start(p);

  // 判题：台面上有没有这台竖式的记录，写完了没有
  function judge(scene, q) {
    const wb = scene && scene.workbench;
    if (!wb || typeof wb.key !== 'string' || wb.key.indexOf('digits|') !== 0) return { ok: false, why: '还没有用竖式工作台' };
    let st;
    try { st = replay(JSON.parse(wb.key.slice(7)), wb.steps); } catch (e) { return { ok: false, why: '竖式的步骤有错：' + e.message }; }
    if (q && q.solved && !view(st).done) return { ok: false, why: '竖式还没写完' };
    return { ok: true, why: '' };
  }

  U.Digits = { paramsOf, keyOf, start, apply, replay, view, stateOf, current, judge, NAMES, COLS };
})(typeof globalThis !== 'undefined' ? globalThis : window);
