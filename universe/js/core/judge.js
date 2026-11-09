/* 判分：按“台面的数学性质”判，不按操作顺序、不读信号文字、不按插入顺序取器材。
 *
 * 问题 = { id, title, grade, domain, points, alias, hook, scene(w), shelf, predict, milestones, traps, goal, why, exam, hints… }
 * 里程碑 = { id, say, score, when, hints:[方向, 哪个器材, 具体做法] }
 *   when 可以是函数 W=>bool，或数据形式（首选）：
 *     {type|role, port, op:'='|'>'|'<'|'>='|'<=', value}  台面上某台器材的某个输出满足条件
 *     {count:{type, ge}} / {loop:true} / {ticks:{ge}} / {all:[…]} / {any:[…]} / {not:…}
 * 规则：
 *   · 开场台面里已经满足的里程碑，必须先变假、再变真才给分（开场摆好的不算分）
 *   · 第一次操作之前不给分
 *   · 预测不判对错，只和结果并排对比
 *   · 用到第 3 层提示的里程碑只给一半分 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q;
  // 判分时读到的近似值记录在这里；参考解回归测试据此检查“没有对近似值做精确判断”
  U.inexactReads = U.inexactReads || [];

  // 预测的回答（或标准答案）写成给人看的文字：place 是位置名，more-less 是 多/少/一样，number、type 是原文
  function predLabel(pr, v) {
    if (v === undefined || v === null) return null;
    const form = pr.form || 'pick';
    if (form === 'place') return Array.isArray(pr.slots) && pr.slots[Number(v)] !== undefined ? pr.slots[Number(v)] : null;
    if (form === 'more-less') return Object.prototype.hasOwnProperty.call(U.Predict.CMP, v) ? U.Predict.CMP[v] : null;
    if (form === 'number' || form === 'type') return String(v);
    const o = (pr.options || []).find((x) => String(x.v) === String(v));
    return o ? o.label : null;
  }

  function makeW(scene, D, run) {
    const E = scene.entities;
    const idOf = (e) => (typeof e === 'string' ? e : e && e.id);
    const W = {
      scene, D, run, t: scene.clock.t, n: scene.clock.n,
      ents: () => Object.values(E),
      ofType: (t) => Object.values(E).filter((e) => e.type === t),
      byRole: (r) => Object.values(E).find((e) => e.role === r) || null,
      out(e, port) {
        const id = idOf(e); const ent = E[id]; if (!ent) return null;
        const p = port || Object.keys(U.types[ent.type].outputs)[0];
        return (D[id] && D[id].out[p]) || null;
      },
      q(e, port) {
        const v = W.out(e, port);
        return v && v.kind === 'num' ? v.data : null;
      },
      // 近似值的容差比较（1.9）：|值 − x| ≤ tol。函数形式的 when 判近似值请用它，不要用 === 。
      near(e, port, x, tol) { const v = W.out(e, port); return !!(v && v.kind === 'num' && Math.abs(Q.num(v.data) - x) <= tol); },
      num(e, port) { const q = W.q(e, port); return q ? Q.num(q) : null; },
      bool(e, port) { const v = W.out(e, port); return v && v.kind === 'bool' ? v.data : null; },
      // 来历（任务 A）：这个值是不是由 type 这类器材、从这些输入算出来的。手填的同一个数不算。
      from(val, type, inputs) {
        const toQ = (v) => (v && v.kind === 'num' ? v.data : v && typeof v === 'object' && 'n' in v ? v : Q.fromNumber(+v));
        const target = toQ(val), want = (inputs || []).map((x) => toQ(x));
        const key = (q) => q.n + '/' + q.d;
        return Object.values(E).some((ent) => {
          if (ent.type !== type || !D[ent.id] || !D[ent.id].trace) return false;
          if (!Object.values(D[ent.id].out).some((o) => o && o.kind === 'num' && Q.eq(o.data, target))) return false;
          const got = D[ent.id].trace.inputs.map((i) => i.value).filter((v) => v && v.kind === 'num').map((v) => key(v.data)).sort();
          return got.length === want.length && got.join() === want.map(key).sort().join();
        });
      },
      // 容器（1.10）：子实体与所在容器
      children: (e, slot) => U.World.childrenOf(scene, idOf(e), slot),
      parentOf: (e) => { const ent = E[idOf(e)]; return ent && ent.parent ? E[ent.parent] || null : null; },
      props: (e) => (E[idOf(e)] ? E[idOf(e)].props : null),
      linked: (a, b) => scene.links.some((l) => l.from === idOf(a) && l.to === idOf(b)),
      sources: (e) => scene.links.filter((l) => l.to === idOf(e)).map((l) => E[l.from]).filter(Boolean),
      upstream(e) {
        const seen = {}, st = [idOf(e)];
        while (st.length) { const c = st.pop(); for (const l of scene.links) if (l.to === c && !seen[l.from]) { seen[l.from] = 1; st.push(l.from); } }
        return Object.keys(seen).map((id) => E[id]).filter(Boolean);
      },
      some: (type, pred) => W.ofType(type).some((e) => pred(e, D[e.id], W)),
      count: (type) => (type ? W.ofType(type).length : Object.keys(E).length),
      hasLoop: () => U.World.hasLoop(scene),
      sig: (e) => (D[idOf(e)] ? D[idOf(e)].sig : []),
    };
    return W;
  }

  const OPS = { '=': (c) => c === 0, '>': (c) => c > 0, '<': (c) => c < 0, '>=': (c) => c >= 0, '<=': (c) => c <= 0, '!=': (c) => c !== 0 };
  function cmpVal(v, op, want) {
    if (!v) return false;
    if (v.kind === 'bool') return op === '=' ? v.data === want : v.data !== want;
    if (v.kind === 'num') {
      // 1.9：近似值不能用精确相等判定（“= / !=”），要用 near 带容差
      if (v.exact === false && (op === '=' || op === '!=')) U.inexactReads.push({ op, want });
      let w; try { w = Q.parse(want); } catch (e) { return false; } return OPS[op](Q.cmp(v.data, w));
    }
    return false;
  }
  function compile(c) {
    if (typeof c === 'function') return c;
    if (c.all) { const f = c.all.map(compile); return (W) => f.every((g) => g(W)); }
    if (c.any) { const f = c.any.map(compile); return (W) => f.some((g) => g(W)); }
    if (c.not) { const f = compile(c.not); return (W) => !f(W); }
    if (c.loop) return (W) => W.hasLoop();
    if (c.ticks) return (W) => W.n >= (c.ticks.ge || 0);
    if (c.count) return (W) => W.count(c.count.type) >= (c.count.ge || 0);
    if (c.type || c.role) {
      const op = c.op || '=';
      return (W) => {
        const list = c.role ? [W.byRole(c.role)].filter(Boolean) : W.ofType(c.type);
        return list.some((e) => cmpVal(W.out(e, c.port), op, c.value));
      };
    }
    return () => false;
  }

  // 一种搭法的“指纹”：器材类型多重集 + 连线数。与参考解不同 → “你找到了一种新做法”
  // 指纹 = 器材类型多重集 + 连线结构（每根线：来源器材类型.端口 → 目标器材类型.端口），与器材 id 和摆放位置无关
  function fingerprint(scene) {
    const E = scene.entities, t = Object.values(E).map((e) => e.type).sort().join(',');
    const ls = scene.links.map((l) => (E[l.from] ? E[l.from].type : '?') + '.' + l.fromPort + '>' + (E[l.to] ? E[l.to].type : '?') + '.' + l.toPort).sort().join(',');
    return t + '|' + ls;
  }

  const Judge = {
    compile, makeW, fingerprint,

    start(problem, mode) {
      const run = {
        pid: problem.id, mode, ops: 0, errors: 0, t0: Date.now(), armed: false, finished: false,
        pred: undefined, trapsHit: {}, ms: {}, hintLevel: {}, newWay: false,
      };
      for (const m of problem.milestones) run.ms[m.id] = { done: false, seenFalse: false, op: null };
      return run;
    },

    // 每次操作或时钟走拍之后调用；返回这次新达成的里程碑和新踩中的陷阱
    check(problem, run, scene, D) {
      const W = makeW(scene, D, run), res = { newly: [], traps: [] };
      for (const m of problem.milestones) {
        const st = run.ms[m.id]; if (!m._f) m._f = compile(m.when !== undefined ? m.when : m.test);
        let v = false; try { v = !!m._f(W); } catch (e) { v = false; }
        if (!v) st.seenFalse = true;
        else if (run.armed && st.seenFalse && !st.done) { st.done = true; st.op = run.ops; st.at = scene.clock.n; res.newly.push(m); }
      }
      if (run.armed) {
        for (const tr of problem.traps || []) {
          if (run.trapsHit[tr.id]) continue;
          if (!tr._f) tr._f = compile(tr.when !== undefined ? tr.when : tr.test);
          let v = false; try { v = !!tr._f(W); } catch (e) { v = false; }
          if (v) { run.trapsHit[tr.id] = { op: run.ops }; res.traps.push(tr); }
        }
      }
      const goal = problem.goal || problem.milestones.map((m) => m.id);
      if (!run.finished && run.mode === 'practice' && goal.every((id) => run.ms[id].done)) {
        run.finished = true;
        const fp = fingerprint(scene);
        if (problem.ref && problem.ref.length && !problem.ref.includes(fp)) run.newWay = true;
      }
      return res;
    },

    score(problem, run) {
      let got = 0, max = 0;
      for (const m of problem.milestones) {
        max += m.score;
        const st = run.ms[m.id];
        if (st.done) got += (run.hintLevel[m.id] || 0) >= 3 ? m.score / 2 : m.score;
      }
      return { got, max };
    },

    // 提示分三层：方向 → 用哪个器材 → 具体做法。返回要显示的提示，并记下层数
    nextHint(problem, run) {
      const m = problem.milestones.find((x) => !run.ms[x.id].done); if (!m) return null;
      const lv = Math.min(3, (run.hintLevel[m.id] || 0) + 1);
      run.hintLevel[m.id] = lv;
      const hs = m.hints || [];
      return { m, level: lv, text: hs[lv - 1] || hs[hs.length - 1] || '再看一眼题目：这一步要让台面上出现什么？' };
    },

    report(problem, run, scene, D) {
      const sc = Judge.score(problem, run), W = makeW(scene, D, run);
      const pr = problem.predict, isPick = !pr || (pr.form || 'pick') === 'pick';
      let actual = null;
      if (pr) {
        try { actual = typeof pr.reveal === 'function' ? pr.reveal(W) : { v: pr.answer, label: String(pr.answer) }; } catch (e) { actual = null; }
      }
      // 报告里写给人看的文字：pick 仍用选项名（原样），其他形式用 predLabel
      const guessLabel = pr && run.pred !== undefined ? predLabel(pr, run.pred) : null;
      const actualLabel = actual ? (isPick ? actual.label : predLabel(pr, actual.v)) : null;
      const match = guessLabel !== null && actual ? (isPick ? String(run.pred) === String(actual.v) : U.Predict.check(pr, run.pred).ok) : null;
      return {
        score: sc.got, max: sc.max,
        items: problem.milestones.map((m) => ({ id: m.id, say: m.say, score: m.score, done: run.ms[m.id].done, half: (run.hintLevel[m.id] || 0) >= 3 })),
        guess: guessLabel, actual: actualLabel,
        match,
        traps: Object.keys(run.trapsHit).map((id) => (problem.traps.find((t) => t.id === id) || {}).wrong).filter(Boolean),
        ops: run.ops, errors: run.errors, usedSec: Math.round((Date.now() - run.t0) / 1000), newWay: run.newWay,
      };
    },
  };
  U.Judge = Judge;
})(typeof globalThis !== 'undefined' ? globalThis : window);
