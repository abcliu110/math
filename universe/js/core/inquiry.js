/* 探究的数据层（设计 v2 §2.4、§2.5）：
 * - 误解信号：同一知识点上，同一种错误预测出现 2 次以上，才标记为误解，进入复习。
 * - 实验报告：四栏（我猜的、我试了什么、我发现了、我还想问）。前三栏从事件流预填，学生改写或补充。
 * 只读事件流现算，不另存。 */
(function (G) {
  'use strict';
  const U = G.U;

  U.Inquiry = {
    MISCONCEPTION_MIN: 2,

    // 错误预测：finish 事件里 match 为 false 的，记“知识点 + 学生猜的答案”
    misconceptions(events, problems) {
      const byId = {}; (problems || U.problems).forEach((p) => { byId[p.id] = p; });
      const seen = {};
      for (const e of (events || U.Events.log)) {
        if (e.type !== 'finish' || e.data.match !== false || e.data.guess == null) continue;
        const p = byId[e.pid]; if (!p) continue;
        for (const point of p.points || []) {
          const key = point + '\u0001' + e.data.guess;
          if (!seen[key]) seen[key] = { point, wrongGuess: e.data.guess, count: 0, pids: [] };
          seen[key].count++;
          if (!seen[key].pids.includes(p.id)) seen[key].pids.push(p.id);
        }
      }
      return Object.values(seen).filter((x) => x.count >= U.Inquiry.MISCONCEPTION_MIN);
    },

    // 一次探究的报告（pid 的最近一次 start 之后的事件）
    report(events, pid, problems) {
      const all = events || U.Events.log;
      let startIdx = -1;
      all.forEach((e, i) => { if (e.pid === pid && e.type === 'start') startIdx = i; });
      const mine = startIdx < 0 ? [] : all.slice(startIdx).filter((e) => e.pid === pid);
      const fin = [...mine].reverse().find((e) => e.type === 'finish' || e.type === 'submit');
      const preds = mine.filter((e) => e.type === 'predict');
      const ops = mine.filter((e) => e.type === 'milestone').length;
      const hints = mine.filter((e) => e.type === 'hint').length;
      const traps = mine.filter((e) => e.type === 'trap').map((e) => e.data.id);
      const p = (problems || U.problems).find((x) => x.id === pid);
      const ev = U.Evidence.levelOf(all, { pid, approx: false });
      return {
        pid, title: p ? p.title : pid,
        cols: {
          guess: { prefill: preds.length ? preds[preds.length - 1].data.v : null, actual: fin ? fin.data.actual : null, conjecture: '' },
          tried: { milestones: mine.filter((e) => e.type === 'milestone').map((e) => e.data.id), hints, opsCount: ops, traps, snapshot: null },
          found: { evidence: ev.level, wording: U.Evidence.wording(ev), quote: '', note: '' },
          asks: { text: '' },
        },
        finished: !!fin,
      };
    },
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
