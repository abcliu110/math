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
