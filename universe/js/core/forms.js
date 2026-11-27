/* 联动组（docs/essence-forms.md）：同一个数学对象摆成几种样子（几台操作台），在任何一台上做一步，其他台当场做同一步。
 *
 * 台面上：scene.groups = [{ id, form, state, members: [器材 id], log: [{ step, label, rule, by }] }]
 *   form：一类共享状态（第一个是 lineq：a·x + b = c·x + d，外加藏着的 x0）。
 *   state：这一组现在的状态，只存一份；器材的属性是它的影子。存档、撤销、重放都跟着台面走。
 *
 * 每种 form（defineForm）：keys（状态里会变的数）、check(state) → null | 为什么不行、diff(s0, s1) → 步子 | { why }、label(step)、rule(step)。
 * 每台器材对每种 form 写一个适配器（adapt）：
 *   toState(props, state) → 从这台器材的属性读出状态（只需给 keys）；
 *   fromState(state, props, step) → 状态变了，这台器材的属性补丁；
 *   can(state) → null | 这台器材为什么画不了这个状态。
 *
 * 内核动作 { t: 'settle' }（world.js）：一个手势做完以后调用（界面的事务在最后自动加上）。
 *   看哪一台的状态变了 → 认出是哪一步 → 问其他台画不画得了 → 都行就一起改，记进 log；
 *   有一台画不了、一次改了好几台、认不出是哪一步，都整个不做，说出原因（事务回滚整个手势）。 */
(function (G) {
  'use strict';
  const U = G.U;
  const FORMS = {}, ADAPT = {};
  const defineForm = (id, def) => { FORMS[id] = Object.assign({ id }, def); return FORMS[id]; };
  const adapt = (form, type, a) => { (ADAPT[form] = ADAPT[form] || {})[type] = a; };
  const adapterOf = (form, type) => (ADAPT[form] && ADAPT[form][type]) || null;
  const same = (form, a, b) => FORMS[form].keys.every((k) => a[k] === b[k]);
  const groupOf = (scene, id) => ((scene && scene.groups) || []).find((g) => g.members.includes(id)) || null;
  const pick = (form, s) => { const o = {}; for (const k of FORMS[form].keys) o[k] = s[k]; return o; };

  // 出题时用：把几台器材连成一组，按 state 把每台摆好。不合法直接抛错（出题的错，测试会发现）
  function join(scene, form, ids, state) {
    const F = FORMS[form]; if (!F) throw new Error('没有这种样子：' + form);
    if (!ids || ids.length < 2) throw new Error('联动组至少要两台器材');
    const st = Object.assign({}, state), bad = F.check ? F.check(st) : null;
    if (bad) throw new Error(bad);
    for (const id of ids) {
      const e = scene.entities[id];
      if (!e) throw new Error('找不到器材：' + id);
      const A = adapterOf(form, e.type); if (!A) throw new Error(e.type + ' 不能摆成 ' + form);
      if (groupOf(scene, id)) throw new Error(e.name + ' 已经在别的联动组里');
      const no = A.can(st); if (no) throw new Error(e.name + '：' + no);
      Object.assign(e.props, A.fromState(st, e.props, null));
    }
    scene.groups = scene.groups || [];
    let n = 1; while (scene.groups.some((g) => g.id === 'g' + n)) n++;
    const g = { id: 'g' + n, form, state: st, members: ids.slice(), log: [] };
    scene.groups.push(g);
    return g.id;
  }

  // 先把每一组要做的事算出来（不改台面），全部能做才一起改
  function plan(scene, g) {
    const F = FORMS[g.form], E = scene.entities, members = g.members.filter((id) => E[id]);
    if (members.length < 2) return null;
    const changed = [];
    for (const id of members) {
      const e = E[id], A = adapterOf(g.form, e.type); if (!A) continue;
      const s = A.toState(e.props, g.state);
      if (!same(g.form, s, g.state)) changed.push({ id, s });
    }
    if (!changed.length) return null;
    const s1 = changed[0].s;
    if (changed.some((c) => !same(g.form, c.s, s1))) return { why: '一次只在一块上做一步' };
    const st = Object.assign({}, g.state, pick(g.form, s1));
    const bad = F.check ? F.check(st) : null; if (bad) return { why: bad };
    const step = F.diff(g.state, st);
    if (!step) return null;
    if (step.why) return { why: step.why };
    const by = changed.map((c) => c.id), patches = [];
    for (const id of members) {
      if (by.includes(id)) continue;
      const e = E[id], A = adapterOf(g.form, e.type), no = A.can(st);
      if (no) return { why: e.name + '画不出来：' + no };
      patches.push({ id, patch: A.fromState(st, e.props, step) });
    }
    return { g, st, step, by: by[0], patches, members };
  }

  function settle(scene) {
    const plans = [];
    for (const g of scene.groups || []) { const p = plan(scene, g); if (!p) continue; if (p.why) return { ok: false, why: p.why }; plans.push(p); }
    const done = [];
    for (const p of plans) {
      const F = FORMS[p.g.form];
      for (const x of p.patches) Object.assign(scene.entities[x.id].props, x.patch);
      p.g.members = p.members; p.g.state = p.st;
      const rec = { step: p.step, label: F.label(p.step), rule: F.rule(p.step), by: p.by };
      p.g.log.push(rec); if (p.g.log.length > 40) p.g.log.shift();
      done.push(Object.assign({ group: p.g.id }, rec));
    }
    // 器材删掉以后只剩一台的组不再联动
    if (scene.groups) scene.groups = scene.groups.filter((g) => g.members.filter((id) => scene.entities[id]).length >= 2);
    if (scene.groups && !scene.groups.length) delete scene.groups;
    return { ok: true, steps: done };
  }

  // ---------- 第一种样子：一元一次等式 a·x + b = c·x + d（x0 是藏着的真实值）----------
  const isN = (v) => Number.isInteger(v) && v >= 0;
  const sideText = (x, c) => { const a = []; if (x) a.push((x === 1 ? '' : x) + 'x'); if (c || !x) a.push(String(c)); return a.join(' + '); };
  const LQ = {
    balanced: (s) => s.a * s.x0 + s.b === s.c * s.x0 + s.d,
    // 解出来了：一边只剩一个 x，另一边只剩数，而且平
    solved: (s) => (!LQ.balanced(s) ? null : s.a === 1 && s.b === 0 && s.c === 0 ? s.d : s.c === 1 && s.d === 0 && s.a === 0 ? s.b : null),
    text: (s) => sideText(s.a, s.b) + (LQ.balanced(s) ? ' = ' : ' ≠ ') + sideText(s.c, s.d),
    side: sideText,
  };
  const xs = (k) => (k === 1 ? 'x' : k + 'x');
  const what = (dx, dc) => { const a = []; if (dx) a.push((dx < 0 ? '减 ' : '加 ') + xs(Math.abs(dx))); if (dc) a.push((dc < 0 ? '减 ' : '加 ') + Math.abs(dc)); return a.join('、'); };
  defineForm('lineq', {
    keys: ['a', 'b', 'c', 'd'],
    check: (s) => (['a', 'b', 'c', 'd', 'x0'].every((k) => isN(s[k])) ? null : '这里只用 0 和正整数：不够减了'),
    diff(s0, s1) {
      const da = s1.a - s0.a, db = s1.b - s0.b, dc = s1.c - s0.c, dd = s1.d - s0.d;
      if (!da && !db && !dc && !dd) return null;
      const K = ['a', 'b', 'c', 'd'];
      for (let n = 2; n <= 60; n++) {
        if (K.every((k) => s1[k] * n === s0[k])) return { op: 'div', n };
        if (K.every((k) => s0[k] * n === s1[k])) return { op: 'mul', n };
      }
      if (da === dc && db === dd) {
        if (da && db) return { why: '一次做一步：先动 x，再动数' };
        return da ? { op: da < 0 ? 'sub' : 'add', what: 'x', k: Math.abs(da) } : { op: db < 0 ? 'sub' : 'add', what: 'c', k: Math.abs(db) };
      }
      if (!dc && !dd) return { op: 'lone', side: 'L', dx: da, dc: db };
      if (!da && !db) return { op: 'lone', side: 'R', dx: dc, dc: dd };
      if (da === -dc && db === -dd && (!da || !db)) {
        const k = Math.abs(da || db), from = (da || db) < 0 ? 'L' : 'R';
        return { op: 'move', from, what: da ? 'x' : 'c', k };
      }
      return { why: '一次做一步' };
    },
    label(st) {
      if (st.op === 'div') return '两边同时除以 ' + st.n;
      if (st.op === 'mul') return '两边同时乘 ' + st.n;
      if (st.op === 'sub' || st.op === 'add') return '两边同时' + (st.op === 'sub' ? '减 ' : '加 ') + (st.what === 'x' ? xs(st.k) : st.k);
      if (st.op === 'lone') return '只在' + (st.side === 'L' ? '左边' : '右边') + what(st.dx, st.dc);
      if (st.op === 'move') return '把 ' + (st.what === 'x' ? xs(st.k) : st.k) + ' 从' + (st.from === 'L' ? '左边挪到右边' : '右边挪到左边');
      return '';
    },
    rule: (st) => (st.op === 'lone' ? 'balance.lone' : st.op === 'move' ? 'balance.move' : 'eq.both-sides'),
  });

  U.Forms = { FORMS, defineForm, adapt, adapterOf, groupOf, join, settle, LQ };
})(typeof globalThis !== 'undefined' ? globalThis : window);
