/* 式子工作台的内核（任务 H 第 3a 步，见 next-steps.md §10.5.3–10.5.6）。纯逻辑，不碰界面。
 * 每个工具就是一条可执行规则（U.applyRule），每一步都记进历史；撤销和重算都从 start 重放。
 *  - U.Workbench.create(value) → state { start, steps, current, lastError }
 *      value：方程 { lhs, rhs, rel }（两边是形式），或一个形式；也接受 U.val 包装的值。
 *  - U.Workbench.tools(value) → [{ id, label }]
 *  - U.Workbench.step(state, toolId, ref, args) → 新 state；不能用或破坏不变量时 lastError 说明原因，steps 不变。
 *  - U.Workbench.undo(state, k)：保留前 k 步，从 start 重放得到 current。
 *  - U.Workbench.replay(start, steps)：重放一串步骤（undo 用它；测试用它检查结果一致）。
 *  - U.Workbench.stepLog(state) → ['第 1 步：移项：… → …', …]
 *  - U.Workbench.solution(state) → { solved: true, x } 当 current 是 x = 数；否则 { solved: false }
 *  - 引用 ref：形式用路径（下标数组）或标签（字符串，见 U.Form.find）；方程上的形式规则用 ['lhs'|'rhs', …路径]
 *    或标签；移项用左边的下标或左边的标签；两边同除/同乘不需要引用。找不到标签时说明原因，不会悄悄算错。
 */
(function (G) {
  'use strict';
  const U = G.U, F = U.Form, P = U.Poly;

  const BROKEN = '这一步破坏了不变量，已拒绝';

  // 工具表：id、标签、对应的规则。方程上的工具和形式上的工具分开列。
  const FORM_TOOLS = [
    { id: 'collect', label: '合并同类项', rule: 'alg.collect' },
    { id: 'expand', label: '去括号', rule: 'alg.expand' },
    { id: 'reduce-fraction', label: '约分', rule: 'arith.reduce-fraction' },
  ];
  const EQN_TOOLS = [
    { id: 'move-term', label: '移项', rule: 'alg.move-term' },
    { id: 'divide', label: '两边同除', rule: 'alg.divide' },
    { id: 'multiply', label: '两边同乘', rule: 'alg.multiply' },
    { id: 'collect', label: '合并同类项', rule: 'alg.collect' },
  ];
  // 在方程的某一边上作用的形式规则（引用的第一个元素是 lhs 或 rhs）
  const SIDE_RULES = ['alg.collect', 'alg.expand', 'arith.reduce-fraction'];
  // 不需要引用位置的规则
  const NO_REF_RULES = ['alg.divide', 'alg.multiply'];

  const isEqnData = (d) => !!d && !d.op && 'lhs' in d && 'rhs' in d;
  // 多项式两边换成形式（规则只认形式）
  const sideOf = (x) => (x && Array.isArray(x.terms) ? F.fromPoly(x) : x);
  // 统一成 U.val：{ kind:'form', data } 或 { kind:'eqn', data:{ lhs, rhs, rel } }
  function norm(v) {
    if (v && (v.kind === 'form' || v.kind === 'eqn') && v.data !== undefined) {
      if (v.kind === 'form') return U.val('form', v.data);
      return U.val('eqn', { lhs: sideOf(v.data.lhs), rhs: sideOf(v.data.rhs), rel: v.data.rel || '=' });
    }
    if (isEqnData(v)) return U.val('eqn', { lhs: sideOf(v.lhs), rhs: sideOf(v.rhs), rel: v.rel || '=' });
    return U.val('form', v);
  }
  const tableOf = (v) => (norm(v).kind === 'eqn' ? EQN_TOOLS : FORM_TOOLS);
  const showVal = (v) => (v.kind === 'eqn' ? F.show(v.data.lhs) + ' ' + v.data.rel + ' ' + F.show(v.data.rhs) : F.show(v.data));
  const fail = (state, why) => Object.assign({}, state, { lastError: why });

  // 把引用解析成路径。找不到标签时返回 null。
  function resolve(cur, rule, ref) {
    if (cur.kind === 'eqn') {
      if (NO_REF_RULES.includes(rule)) return [];
      if (SIDE_RULES.includes(rule)) {
        if (typeof ref === 'string') {
          for (const s of ['lhs', 'rhs']) { const p = F.find(cur.data[s], ref); if (p) return [s].concat(p); }
          return null;
        }
        return Array.isArray(ref) ? ref : null;
      }
      // 移项等：只在左边找
      if (typeof ref === 'string') return F.find(cur.data.lhs, ref);
      if (typeof ref === 'number') return [ref];
      return Array.isArray(ref) ? ref : [];
    }
    if (typeof ref === 'string') return F.find(cur.data, ref);
    return Array.isArray(ref) ? ref : [];
  }

  // 对一个值执行一步（不记录）。返回 { ok, kept, why, value }
  function applyStep(cur, rule, ref, args) {
    const at = resolve(cur, rule, ref);
    if (at === null) return { ok: false, kept: false, why: '找不到引用的对象（' + ref + '）：前面的步骤可能已经改变了它', value: cur };
    if (cur.kind === 'eqn' && SIDE_RULES.includes(rule)) {
      const side = at[0];
      if (side !== 'lhs' && side !== 'rhs') return { ok: false, kept: false, why: '请指明是等号左边还是右边', value: cur };
      const r = U.applyRule(rule, U.val('form', cur.data[side]), at.slice(1), args);
      if (!r.ok) return { ok: false, kept: false, why: r.why, value: cur };
      return { ok: true, kept: r.kept, why: r.why, value: U.val('eqn', Object.assign({}, cur.data, { [side]: r.value.data })) };
    }
    const r = U.applyRule(rule, cur, at, args);
    return { ok: r.ok, kept: r.kept, why: r.why, value: r.value };
  }

  // 从 start 重放一串步骤。步骤里的 ref 和 args 是原样保存的，重放结果必须相同。
  function replay(start, steps) {
    let cur = start;
    const out = [];
    for (const s of steps) {
      const r = applyStep(cur, s.rule, s.ref, s.args);
      if (!r.ok || !r.kept) throw new Error('重放第 ' + (out.length + 1) + ' 步失败：' + (r.why || BROKEN));
      out.push({ tool: s.tool, rule: s.rule, ref: s.ref, args: s.args, before: cur, after: r.value, why: r.why });
      cur = r.value;
    }
    return { start, steps: out, current: cur, lastError: null };
  }

  // 按规则 id 执行一步（step 用它；测试也可以用它执行没有列在工具表里的规则）
  function record(state, tool, rule, ref, args) {
    const a = Object.assign({}, args || {}, { stepIndex: state.steps.length + 1 });
    const r = applyStep(state.current, rule, ref, a);
    if (!r.ok) return fail(state, r.why);
    if (!r.kept) return fail(state, BROKEN);
    const step = { tool, rule, ref, args: a, before: state.current, after: r.value, why: r.why };
    return { start: state.start, steps: state.steps.concat([step]), current: r.value, lastError: null };
  }

  const Workbench = {
    create(value) {
      const v = norm(value);
      return { start: v, steps: [], current: v, lastError: null };
    },

    tools(value) {
      return tableOf(value).map((t) => ({ id: t.id, label: t.label }));
    },

    step(state, toolId, ref, args) {
      const t = tableOf(state.current).find((x) => x.id === toolId);
      if (!t) return fail(state, '这个工具用在这里不合适：' + toolId);
      return record(state, t.id, t.rule, ref, args);
    },

    // 按规则 id 直接执行（不经过工具表）；工作台的工具都走 step
    stepRule(state, rule, ref, args) {
      return record(state, rule, rule, ref, args);
    },

    undo(state, k) {
      const n = Math.max(0, Math.min(k, state.steps.length));
      return replay(state.start, state.steps.slice(0, n));
    },

    replay,

    stepLog(state) {
      return state.steps.map((s, i) => {
        const t = tableOf(s.before).find((x) => x.id === s.tool);
        const label = t ? t.label : ((U.RULES[s.rule] || {}).label || s.tool);
        return '第 ' + (i + 1) + ' 步：' + label + '：' + showVal(s.before) + ' → ' + showVal(s.after);
      });
    },

    // current 是 x = 数（一个未知数 x，右边没有字母）时给出解
    solution(state) {
      const v = state.current;
      if (v.kind !== 'eqn' || v.data.rel !== '=') return { solved: false };
      let L, R;
      try { L = F.value(v.data.lhs); R = F.value(v.data.rhs); } catch (e) { return { solved: false }; }
      // 左边是多项式且只含 x；右边是有理数（没有字母）
      const isPoly = (p) => !!p && Array.isArray(p.terms);
      if (!isPoly(L) || isPoly(R)) return { solved: false };
      const vars = P.vars(L);
      if (vars.length !== 1 || vars[0] !== 'x') return { solved: false };
      if (!P.eq(L, P.variable('x'))) return { solved: false };
      return { solved: true, x: R };
    },
  };
  U.Workbench = Workbench;
})(typeof globalThis !== 'undefined' ? globalThis : window);
