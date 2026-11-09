/* 学习数据层（设计 v2 第 3 节）：全部从事件流现算，不另存。
 *  - 复习规则（3.2）：只有这一套。nextReview / mastery
 *  - 错题本（3.1）：wrongBook
 *  - 考试报告（3.4）：错因标签、自动错因、下一步练什么、体检表
 *  - 改进清单（3.5）：improvements（按 问题 × 里程碑 / 陷阱 / 放弃率 聚合，给出规则化建议）
 *  - 家长端周报（3.1）：parentWeek
 * finish / submit 事件的 data 是 Judge.report 的结果：
 *   { score, max, items:[{id, say, score, done, half}], guess, actual, match, traps:[文字], ops, errors, usedSec, newWay } */
(function (G) {
  'use strict';
  const U = G.U, DAY = 86400000;

  // 6 个错因标签（学生自选，3.4）
  const REASONS = ['算错了', '概念没弄清', '步骤漏了', '看错题', '没思路', '粗心'];

  const finals = (events, pid) => events.filter((e) => (!pid || e.pid === pid) && (e.type === 'finish' || e.type === 'submit'));
  const latest = (list) => list.reduce((a, e) => (!a || e.ts >= a.ts ? e : a), null);

  U.Learning = {
    REASONS, DAY,

    // ---- 3.2 复习规则（只有这一套）----
    // r = { ratio, trapped, trapRepeat, thirdHint, rejects, variantOk }
    nextReview(r) {
      if (r.ratio < 1 || r.trapped) return { days: 1, mastered: false, repeat: !!r.trapRepeat, why: r.trapped ? '踩中了陷阱' : '目标没达成' };
      if (r.thirdHint || r.rejects >= 3) return { days: 2, mastered: false, repeat: false, why: '达成了，但用了完整提示或被拒绝较多' };
      if (r.variantOk) return { days: 7, mastered: true, repeat: false, why: '干净达成，变式也做对' };
      return { days: 4, mastered: false, repeat: false, why: '干净达成' };
    },

    // 每道题取最近一次结果，算出下次复习。
    // 返回 { byProblem, due:[{pid,title,days,dueInDays,why,repeat}], mastered:[pid] }
    mastery(events, problems, now) {
      now = now || Date.now();
      const byP = {}, mastered = [], due = [];
      const hits = {}; // pid → { 陷阱文字: 次数 }
      for (const e of events) if (e.type === 'finish' || e.type === 'submit') {
        const m = (hits[e.pid] = hits[e.pid] || {});
        for (const t of e.data.traps || []) m[t] = (m[t] || 0) + 1;
      }
      const clean = {}; // 知识点 → [{pid, ok}]
      for (const p of problems) {
        const f = latest(finals(events, p.id)); if (!f) continue;
        const d = f.data, ratio = d.max ? d.score / d.max : 0;
        const trapped = (d.traps || []).length > 0;
        const trapRepeat = (d.traps || []).some((t) => (hits[p.id][t] || 0) >= 2);
        byP[p.id] = { ratio, trapped, trapRepeat, thirdHint: (d.items || []).some((i) => i.half), rejects: d.errors || 0, variantOk: false, ts: f.ts };
        for (const pt of p.points || []) (clean[pt] = clean[pt] || []).push({ pid: p.id, ok: ratio >= 1 && !trapped });
      }
      for (const p of problems) {
        const r = byP[p.id]; if (!r) continue;
        // 同一知识点上另一道题也干净达成，视为变式做对
        r.variantOk = (p.points || []).some((pt) => (clean[pt] || []).some((c) => c.pid !== p.id && c.ok));
        const n = U.Learning.nextReview(r);
        r.next = n;
        const dueIn = Math.ceil((r.ts + n.days * DAY - now) / DAY);
        if (n.mastered) mastered.push(p.id);
        if (dueIn <= 0) due.push({ pid: p.id, title: p.title, days: n.days, dueInDays: dueIn, why: n.why, repeat: n.repeat });
      }
      due.sort((a, b) => a.days - b.days);
      return { byProblem: byP, due, mastered };
    },

    // ---- 3.1 错题本：每道题最近一次没达成的里程碑和踩过的陷阱 ----
    wrongBook(events, problems) {
      const out = [];
      for (const p of problems) {
        const f = latest(finals(events, p.id)); if (!f) continue;
        const missed = (f.data.items || []).filter((i) => !i.done).map((i) => ({ id: i.id, say: i.say }));
        const traps = f.data.traps || [];
        if (missed.length || traps.length) out.push({ pid: p.id, title: p.title, missed, traps, ts: f.ts });
      }
      return out.sort((a, b) => b.ts - a.ts);
    },

    // ---- 3.4 考试报告的错因 ----
    // 有陷阱解释的，错因自动给出；没达成且没有陷阱解释的里程碑，要学生从 REASONS 里选一个
    examReport(rep, picks) {
      picks = picks || {};
      const missed = (rep.items || []).filter((i) => !i.done);
      const auto = (rep.traps || []).map((t) => ({ kind: 'trap', text: t }));
      const needPick = rep.traps && rep.traps.length ? [] : missed.map((i) => i.id);
      const chosen = {};
      for (const id of needPick) if (REASONS.includes(picks[id])) chosen[id] = picks[id];
      return { auto, needPick, chosen, complete: needPick.every((id) => chosen[id]) };
    },

    // 下一步练什么：同一知识点的其他题优先（陷阱题排前），其次同领域；只在有没达成的里程碑时推荐
    nextPractice(problem, rep, problems) {
      if (!(rep.items || []).some((i) => !i.done)) return [];
      const shares = (p) => (p.points || []).some((pt) => (problem.points || []).includes(pt));
      const same = problems.filter((p) => p.id !== problem.id && shares(p));
      same.sort((a, b) => (a.level === 'trap' ? 0 : 1) - (b.level === 'trap' ? 0 : 1));
      const dom = problems.filter((p) => p.id !== problem.id && p.domain === problem.domain && !same.includes(p));
      return [...same, ...dom].slice(0, 2).map((p) => ({ pid: p.id, title: p.title }));
    },

    // 体检表（知识点页和家长端）：里程碑达成率、最常踩的陷阱、自选错因分布、证据等级最高到几
    healthCard(events, problems, point) {
      const ps = problems.filter((p) => (p.points || []).includes(point));
      const rows = [], trapCount = {}, reasons = {};
      let top = 1;
      for (const p of ps) {
        const fs = finals(events, p.id); if (!fs.length) continue;
        const rate = {};
        for (const m of p.milestones) rate[m.id] = fs.filter((f) => (f.data.items || []).some((i) => i.id === m.id && i.done)).length / fs.length;
        rows.push({ pid: p.id, title: p.title, attempts: fs.length, rate });
        for (const f of fs) for (const t of f.data.traps || []) trapCount[t] = (trapCount[t] || 0) + 1;
        const lv = U.Evidence.levelOf(events, { pid: p.id }).level;
        if (typeof lv === 'number') top = Math.max(top, lv);
      }
      for (const e of events) if (e.type === 'reason' && ps.some((p) => p.id === e.pid)) reasons[e.data.label] = (reasons[e.data.label] || 0) + 1;
      const traps = Object.entries(trapCount).sort((a, b) => b[1] - a[1]).map(([text, n]) => ({ text, n }));
      return { point, rows, traps, reasons, topEvidence: top };
    },

    // ---- 3.5 改进清单：按问题聚合，给出规则化建议 ----
    improvements(events, problems) {
      const out = [];
      for (const p of problems) {
        const starts = events.filter((e) => e.pid === p.id && e.type === 'start' && e.mode === 'practice').length;
        const fs = finals(events, p.id);
        if (!starts && !fs.length) continue;
        const add = (kind, severity, advice) => out.push({ pid: p.id, title: p.title, kind, severity, advice });
        const abandon = starts ? Math.max(0, starts - fs.length) / starts : 0;
        if (starts >= 3 && abandon > 0.3) add('abandon', 3, '放弃率 ' + Math.round(abandon * 100) + '%：题太难或太长，检查预算约束、减少里程碑');
        const n = fs.length;
        if (n >= 3) {
          for (const m of p.milestones) {
            const done = fs.filter((f) => (f.data.items || []).some((i) => i.id === m.id && i.done)).length;
            const half = fs.filter((f) => (f.data.items || []).some((i) => i.id === m.id && i.half)).length;
            if (done / n < 0.5) add('milestone-low', 3, '里程碑「' + m.say + '」达成率 ' + Math.round(done / n * 100) + '%：题面或开场台面可能有歧义，检查提示第一层是否给了方向');
            else if (done && half / done > 0.5) add('milestone-hint3', 2, '里程碑「' + m.say + '」大多用到第三层提示：这一步跨度太大，拆成两个里程碑');
            else if (done / n > 0.95 && half === 0) add('milestone-easy', 1, '里程碑「' + m.say + '」达成率超过 95%：太简单，考虑去掉或升台阶');
          }
          const trapHits = {};
          for (const f of fs) for (const t of f.data.traps || []) trapHits[t] = (trapHits[t] || 0) + 1;
          for (const [t, c] of Object.entries(trapHits)) if (c / n > 0.6) add('trap-common', 3, '陷阱「' + t + '」踩中率 ' + Math.round(c / n * 100) + '%：误解很普遍，加一道专打它的陷阱题，或在核心题前加观察台阶');
        }
      }
      return out.sort((a, b) => b.severity - a.severity);
    },

    // ---- 家长端周报：本周练了什么、哪里没懂、孩子的原话 ----
    parentWeek(events, problems, now) {
      now = now || Date.now();
      const since = now - 7 * DAY, mine = events.filter((e) => e.ts >= since);
      const byP = {};
      for (const e of mine) if (e.pid && (e.type === 'finish' || e.type === 'submit')) byP[e.pid] = e;
      const practiced = Object.keys(byP).map((pid) => {
        const p = problems.find((x) => x.id === pid), d = byP[pid].data;
        return { pid, title: p ? p.title : pid, score: d.score, max: d.max, missed: (d.items || []).filter((i) => !i.done).map((i) => i.say), traps: d.traps || [] };
      });
      const quotes = mine.filter((e) => e.type === 'explain').map((e) => ({ pid: e.pid, text: e.data.text }));
      const repeated = U.Learning.mastery(events, problems, now).due.filter((d) => d.repeat);
      return { practiced, quotes, repeated, count: practiced.length };
    },
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
