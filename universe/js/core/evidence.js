/* 证据等级（设计 v2 §2.7）：系统根据学习事件判定结论有哪一级证据，学生不能自选。
 *   ① 举例（默认）  ② 没找到反例  ③ 穷举证明  ④ 结构证明；另有 refuted：找到了反例，结论已被推翻。
 * 证明类器材（猜想板、参数扫描器、反例构造器、系统枚举器、证明脚手架、归纳阶梯……）通过 emit 记录事件，
 * 这里只负责从事件判定等级、给出措辞。事件 kind 与要求：
 *   counterexample {found:true, where}            → refuted
 *   scan           {range:[a,b], counterexamples:0} → ②（扫过的范围）
 *   enumerate      {count, expected}（count === expected）→ ③
 *   proof          {steps, filled}（filled === steps）→ ④
 *   induction      {base:true, step:true}         → ④
 * 近似值参与的结论最高只到 ②（§2.7 规则）。 */
(function (G) {
  'use strict';
  const U = G.U;

  const LEVEL_NAME = { 1: '举例', 2: '没找到反例', 3: '穷举证明', 4: '结构证明', refuted: '已被推翻' };

  U.Evidence = {
    LEVEL_NAME,
    // 记录一条证据事件（证明类器材调用）
    emit(kind, data) { return U.Events.push('evidence', Object.assign({ kind }, data || {})); },

    // 从一组事件（默认是整个事件流，可按题目过滤）判定等级。
    // opts.pid：只看这道题；opts.approx：结论用到了近似值
    levelOf(events, opts) {
      opts = opts || {};
      const list = (events || U.Events.log).filter((e) => e.type === 'evidence' && (!opts.pid || e.pid === opts.pid));
      const why = [];
      let level = 1;
      const refuted = list.some((e) => e.data.kind === 'counterexample' && e.data.found === true);
      if (refuted) return { level: 'refuted', refuted: true, why: ['找到了反例，结论已被推翻'], range: null };
      let range = null;
      for (const e of list) {
        const d = e.data;
        if (d.kind === 'scan' && d.counterexamples === 0 && Array.isArray(d.range)) {
          if (level < 2) level = 2; range = d.range; why.push('在 ' + d.range[0] + ' 到 ' + d.range[1] + ' 里扫过，没有例外');
        } else if (d.kind === 'enumerate' && d.count === d.expected && d.count > 0) {
          if (level < 3) level = 3; why.push('列出了全部 ' + d.count + ' 种情况，逐一验证');
        } else if (d.kind === 'proof' && d.steps > 0 && d.filled === d.steps) {
          if (level < 4) level = 4; why.push('证明的 ' + d.steps + ' 步都已填完');
        } else if (d.kind === 'induction' && d.base && d.step) {
          if (level < 4) level = 4; why.push('归纳：起点和每一级推下一级都已验证');
        }
      }
      if (opts.approx && level > 2) { level = 2; why.push('台面上的计算是近似的，结论最高到 ②'); }
      return { level, refuted: false, why, range };
    },

    // 措辞跟着等级走（§2.7）：① 到目前为止都对；② 在范围里没找到例外；③④ 一定成立
    wording(res) {
      if (res.refuted || res.level === 'refuted') return '这个结论已被推翻：有一个反例。';
      if (res.level === 1) return '到目前为止都对。';
      if (res.level === 2) return res.range ? '在 ' + res.range[0] + ' 到 ' + res.range[1] + ' 里没找到例外。' : '在试过的范围里没找到例外。';
      return '一定成立。';
    },
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);

/* 证明类器材的计算内核（§2.7）：每个函数是纯计算，算完把证据事件记入事件流，返回结果。
 * 器材（参数扫描器、反例构造器、系统枚举器、证明脚手架、归纳阶梯）只负责把台面上的条件交给这里。 */
(function (G) {
  'use strict';
  const U = G.U;
  const EV = U.Evidence;

  // 参数扫描器：在 [from, to] 的每个整数上检查 pred(n)。没有例外 → scan 事件（②）；找到例外 → counterexample（推翻）
  EV.scanRange = function (from, to, pred, opts) {
    opts = opts || {};
    let counter = null, checked = 0;
    for (let n = from; n <= to; n++) { checked++; if (!pred(n)) { counter = n; break; } }
    if (counter !== null) {
      EV.emit('counterexample', { found: true, where: 'n=' + counter, pid: opts.pid });
      return { found: true, counter, checked };
    }
    EV.emit('scan', { range: [from, to], counterexamples: 0, checked, pid: opts.pid });
    return { found: false, counter: null, checked };
  };

  // 反例构造器：在 [from, to] 里找第一个反例（找不到就是 ② 的扫描结论）
  EV.findCounterexample = function (from, to, pred, opts) { return EV.scanRange(from, to, pred, opts); };

  // 系统枚举器：列出全部情况（items），逐一检查 pred，数量与 expected 对上才是 ③
  EV.enumerate = function (items, expected, pred, opts) {
    opts = opts || {};
    const bad = items.filter((x) => !pred(x));
    const complete = items.length === expected;
    if (bad.length) { EV.emit('counterexample', { found: true, where: String(bad[0]), pid: opts.pid }); return { complete, count: items.length, failed: bad.length, refuted: true }; }
    EV.emit('enumerate', { count: items.length, expected, pid: opts.pid });
    return { complete, count: items.length, failed: 0, refuted: false };
  };

  // 证明脚手架：steps 是 [{ text, ref }]，ref 指向台面上已验证的事实或已学的规律；没写 ref 的步不算填完
  EV.proof = function (steps, opts) {
    opts = opts || {};
    const filled = steps.filter((s) => s && s.ref).length;
    EV.emit('proof', { steps: steps.length, filled, pid: opts.pid });
    return { steps: steps.length, filled, complete: steps.length > 0 && filled === steps.length };
  };

  // 归纳阶梯：base 是第一级是否成立；stepOk(k) 检查“第 k 级推出第 k+1 级”，检查 [1, upto) 的每一级
  EV.induction = function (base, stepOk, upto, opts) {
    opts = opts || {};
    let step = true, failedAt = null;
    for (let k = 1; k < upto; k++) { if (!stepOk(k)) { step = false; failedAt = k; break; } }
    EV.emit('induction', { base: !!base, step, upto, pid: opts.pid });
    return { base: !!base, step, failedAt, complete: !!base && step };
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
