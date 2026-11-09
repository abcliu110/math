/* 断点续做、考试恢复与事件压缩（设计 v2 §3.1、§3.2.1）。
 *  - 开题时存一份开场台面快照，之后只追加事件；恢复 = 开场快照 + 重放操作（世界是确定的，结果一样）。
 *  - 考试计时：剩余时间 = 限时 − 已用时间；刷新本身不扣时间，记一条 resume 事件。
 *  - 事件压缩：超过 N 天的事件只保留每题最近一次结果（finish/submit），其余丢弃。 */
(function (G) {
  'use strict';
  const U = G.U, DAY = 86400000;

  U.Session = {
    // 开题：返回一份可以存进存储的会话（台面快照只存一次）
    start(problem, mode, scene, now) {
      return { pid: problem.id, mode, startScene: U.JSON.parse(U.JSON.stringify(scene)), acts: [], startedAt: now === undefined ? Date.now() : now, usedMs: 0, limitSec: mode === 'exam' ? U.Variants.examMinutes(problem) * 60 : null };
    },
    // 记录一次操作（intent 是 W.act 的参数，或 {tick:true} 表示走一拍）
    // 连续的走一拍合并成一条 {tick:true, n}，存档不会越存越大
    record(session, intent) {
      const last = session.acts[session.acts.length - 1];
      if (intent.tick && last && last.tick) last.n = (last.n || 1) + 1;
      else session.acts.push(intent.tick ? { tick: true, n: 1 } : U.JSON.parse(U.JSON.stringify(intent)));
      return session;
    },
    // 考试剩余秒数（limitSec 为空表示没有时限）
    remaining(session, now) {
      if (session.limitSec === null) return null;
      const used = session.usedMs + ((now === undefined ? Date.now() : now) - session.startedAt);
      return Math.max(0, session.limitSec - Math.floor(used / 1000));
    },
    // 刷新 / 重开：把已用时间累计进去，并记一条 resume（刷新本身不扣时间的说法靠这条事件给出依据）
    resume(session, now) {
      const t = now === undefined ? Date.now() : now;
      session.usedMs += t - session.startedAt; session.startedAt = t;
      return { session, event: { type: 'resume', pid: session.pid, data: { remaining: U.Session.remaining(session, t) } } };
    },
    // 重放：从开场快照出发，按顺序执行 acts，得到当前台面
    // onStep(sc, a)：每条生效的记录执行完后调用一次（恢复时用来重新判分）
    replay(session, onStep) {
      const sc = U.JSON.parse(U.JSON.stringify(session.startScene));
      for (const a of session.acts) {
        if (a.tick) { for (let i = 0; i < (a.n || 1); i++) U.World.tick(sc); }
        else { const r = U.World.act(sc, a); if (!r.ok) continue; } // 被拒绝的操作不改变台面
        if (onStep) onStep(sc, a);
      }
      return sc;
    },
    // 事件压缩：过了 days 天的事件只保留每题最近一次结果，其余丢弃；近期事件全部保留
    compact(log, now, days) {
      const cut = (now || Date.now()) - (days || 30) * DAY;
      const latest = {};
      for (const e of log) if ((e.type === 'finish' || e.type === 'submit') && e.pid) { if (!latest[e.pid] || e.ts >= latest[e.pid].ts) latest[e.pid] = e; }
      return log.filter((e) => e.ts >= cut || ((e.type === 'finish' || e.type === 'submit') && latest[e.pid] === e));
    },
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
