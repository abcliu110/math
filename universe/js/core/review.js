/* 复习与学习报告：只读事件流，现算。没有任何额外存储——事件流是唯一的真相。
 *   U.Review.summarize(log, problems, now) -> { byProblem, domains, due, totals }
 * 到期规则：最近一次没拿满分、或踩过陷阱 → 马上复习；否则按 1/3/7/14 天的间隔。 */
(function (G) {
  'use strict';
  const U = G.U, DAY = 86400000, GAP = [1, 3, 7, 14];

  U.Review = {
    summarize(log, problems, now) {
      now = now || Date.now();
      const by = {};
      const get = (pid) => (by[pid] = by[pid] || { pid, finishes: 0, exams: 0, best: 0, last: null, lastTs: 0, traps: {}, hints: 0, usedSec: 0, newWay: 0 });
      for (const e of log) {
        if (!e.pid) continue;
        const r = get(e.pid);
        if (e.type === 'finish' || e.type === 'submit') {
          if (e.type === 'finish') r.finishes++; else r.exams++;
          const ratio = e.data.max ? e.data.score / e.data.max : 0;
          r.best = Math.max(r.best, ratio);
          if (e.ts >= r.lastTs) { r.last = ratio; r.lastTs = e.ts; r.lastTraps = (e.data.traps || []).length; }
          r.usedSec += e.data.usedSec || 0; if (e.data.newWay) r.newWay++;
        } else if (e.type === 'trap') r.traps[e.data.id] = (r.traps[e.data.id] || 0) + 1;
        else if (e.type === 'hint') r.hints++;
      }
      const due = [], domains = {};
      for (const p of problems) {
        const r = by[p.id];
        const d = (domains[p.domain] = domains[p.domain] || { domain: p.domain, total: 0, done: 0, mastered: 0 });
        d.total++;
        if (!r || !(r.finishes + r.exams)) continue;
        d.done++;
        if (r.best >= 1 && !Object.keys(r.traps).length) d.mastered++;
        const n = r.finishes + r.exams, trapN = Object.keys(r.traps).length;
        let why = null, gapDays = 0;
        if (r.last < 1) why = '上次没拿满分';
        else if (trapN) why = '踩过陷阱：' + (p.traps.find((t) => r.traps[t.id]) || { wrong: '' }).wrong;
        else { gapDays = GAP[Math.min(n - 1, GAP.length - 1)]; if (now - r.lastTs >= gapDays * DAY) why = '隔了 ' + Math.floor((now - r.lastTs) / DAY) + ' 天，该温习了'; }
        if (why) due.push({ pid: p.id, title: p.title, why, urgent: r.last < 1 || trapN > 0 });
      }
      due.sort((a, b) => b.urgent - a.urgent);
      const totals = { problems: problems.length, tried: Object.keys(by).filter((k) => by[k].finishes + by[k].exams).length, trapsHit: Object.values(by).reduce((s, r) => s + Object.keys(r.traps).length, 0), hints: Object.values(by).reduce((s, r) => s + r.hints, 0), minutes: Math.round(Object.values(by).reduce((s, r) => s + r.usedSec, 0) / 60), newWay: Object.values(by).reduce((s, r) => s + r.newWay, 0) };
      return { byProblem: by, domains: Object.values(domains), due, totals };
    },
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
