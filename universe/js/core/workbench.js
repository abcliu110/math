/* 式子工作台的内核（任务 H 第 3a 步，见 next-steps.md §10.5.3–10.5.6）。纯逻辑，不碰界面。
 * 每个工具就是一条可执行规则（U.applyRule），每一步都记进历史；撤销和重算都从 start 重放。
 *  - U.Workbench.create(value) → state { start, steps, current, lastError }
 *      value：方程 { lhs, rhs, rel }（两边是形式），或一个形式；也接受 U.val 包装的值。
 *  - U.Workbench.tools(value) → [{ id, label }]
 *  - U.Workbench.step(state, toolId, ref, args) → 新 state；不能用或破坏不变量时 lastError 说明原因，steps 不变。
 *  - U.Workbench.undo(state, k)：保留前 k 步，从 start 重放得到 current。
 *  - U.Workbench.replay(start, steps)：重放一串步骤（undo 用它；测试用它检查结果一致）。
 *  - U.Workbench.bake(state)：定型（§10.5.6 第 5 步）：上次定型后的步骤折成一步（tool/rule 为 'bake'，值不变）。
 *    折叠（folds）内部不能拆开撤销：undo 撤到折叠中间会被拒绝；撤到定型那一步之前就是撤销定型。pending 是还没定型的步数。
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
  // 只在「从几何来」的式子（state.formula）上出现的工具（D7）：代入字母、算出数
  const FORMULA_TOOLS = [
    { id: 'substitute', label: '代入', rule: 'alg.substitute' },
    { id: 'compute', label: '算出数', rule: 'alg.compute' },
  ];
  // 因式分解（任务 I）不在方程的工具表里（工具表是既有的界面约定）：界面按规则 id 直接执行，见 stepRule
  // 在方程的某一边上作用的形式规则（引用的第一个元素是 lhs 或 rhs）
  const SIDE_RULES = ['alg.collect', 'alg.expand', 'arith.reduce-fraction', 'alg.factor'];
  // 不需要引用位置的规则（代入的字母和数放在 args 里；算出数两边都看）
  const NO_REF_RULES = ['alg.divide', 'alg.multiply', 'alg.substitute', 'alg.compute'];

  // 定型（§10.5.6 第 5 步）：一步，值不变，把它之前（上次定型之后）的步骤折成一步、不能再拆开改。
  // 步骤里它记作 tool/rule 为 'bake'、args.n 为折叠的步数；它不是规则，重放时原样通过。
  const BAKE = 'bake';
  const isBake = (s) => !!s && s.tool === BAKE;
  // 每次定型给一个折叠：{ from, bake }，折叠的是下标 [from, bake) 的步骤，bake 是定型那一步的下标
  function foldsOf(steps) {
    const out = []; let a = 0;
    steps.forEach((s, i) => { if (isBake(s)) { out.push({ from: a, bake: i }); a = i + 1; } });
    return out;
  }
  // 撤销到前 k 步：k 落在某个折叠的中间（from < k < bake）时拆开了它，不行
  const splitsFold = (steps, k) => foldsOf(steps).some((f) => f.from < k && k < f.bake);
  // 上次定型之后还没有折叠的步数
  const pendingOf = (steps) => { let a = 0; steps.forEach((s, i) => { if (isBake(s)) a = i + 1; }); return steps.length - a; };

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
  // formula：这个式子是从几何来的（S = 公式），多出 FORMULA_TOOLS 里的工具
  const tableOf = (v, formula) => (norm(v).kind === 'eqn' ? EQN_TOOLS.concat(formula ? FORMULA_TOOLS : []) : FORM_TOOLS);
  // 状态里带 formula 标记时才写进去（没有就不写，已有的状态形状不变）
  const flagged = (out, formula) => (formula ? Object.assign(out, { formula: true }) : out);
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
  function replay(start, steps, formula) {
    let cur = start;
    const out = [];
    for (const s of steps) {
      if (isBake(s)) {
        const n = (s.args && s.args.n) || 0;
        out.push({ tool: BAKE, rule: BAKE, ref: null, args: { n }, before: cur, after: cur, why: '前 ' + n + ' 步固定成一步，不能再改' });
        continue;
      }
      const r = applyStep(cur, s.rule, s.ref, s.args);
      if (!r.ok || !r.kept) throw new Error('重放第 ' + (out.length + 1) + ' 步失败：' + (r.why || BROKEN));
      out.push({ tool: s.tool, rule: s.rule, ref: s.ref, args: s.args, before: cur, after: r.value, why: r.why });
      cur = r.value;
    }
    return flagged({ start, steps: out, current: cur, lastError: null }, formula);
  }

  // 按规则 id 执行一步（step 用它；测试也可以用它执行没有列在工具表里的规则）
  function record(state, tool, rule, ref, args) {
    const a = Object.assign({}, args || {}, { stepIndex: state.steps.length + 1 });
    const r = applyStep(state.current, rule, ref, a);
    if (!r.ok) return fail(state, r.why);
    if (!r.kept) return fail(state, BROKEN);
    const step = { tool, rule, ref, args: a, before: state.current, after: r.value, why: r.why };
    return flagged({ start: state.start, steps: state.steps.concat([step]), current: r.value, lastError: null }, state.formula);
  }

  const Workbench = {
    // 一个值的文字（方程是「左 = 右」，形式是它的写法）；步骤图的起点用它
    show: showVal,

    // opts.formula：式子是从几何来的（S = 公式），工具表里多出「代入」「算出数」
    create(value, opts) {
      const v = norm(value);
      return flagged({ start: v, steps: [], current: v, lastError: null }, !!(opts && opts.formula));
    },

    tools(value, formula) {
      return tableOf(value, !!formula).map((t) => ({ id: t.id, label: t.label }));
    },

    step(state, toolId, ref, args) {
      const t = tableOf(state.current, !!state.formula).find((x) => x.id === toolId);
      if (!t) return fail(state, '这个工具用在这里不合适：' + toolId);
      return record(state, t.id, t.rule, ref, args);
    },

    // 按规则 id 直接执行（不经过工具表）；工作台的工具都走 step
    stepRule(state, rule, ref, args) {
      return record(state, rule, rule, ref, args);
    },

    undo(state, k) {
      const n = Math.max(0, Math.min(k, state.steps.length));
      if (splitsFold(state.steps, n)) return fail(state, '定型过的步骤不能拆开撤销：要撤销请撤销到定型那一步（撤销定型）之前');
      return replay(state.start, state.steps.slice(0, n), state.formula);
    },

    // 定型：把上次定型之后的步骤折成一步（值不变）。没有新步骤时说明原因，步骤不变。
    bake(state) {
      const n = pendingOf(state.steps);
      if (n <= 0) return fail(state, '没有可以定型的步骤：上次定型后还没有新的步骤');
      const step = { tool: BAKE, rule: BAKE, ref: null, args: { n }, before: state.current, after: state.current, why: '前 ' + n + ' 步固定成一步，不能再改', kept: true };
      return flagged({ start: state.start, steps: state.steps.concat([step]), current: state.current, lastError: null }, state.formula);
    },

    // 折叠（每次定型一个）和还没定型的步数：界面据此折叠步骤列表、决定要不要显示「定型」
    folds: (state) => foldsOf(state.steps),
    pending: (state) => pendingOf(state.steps),

    replay,

    stepLog(state) {
      return state.steps.map((s, i) => {
        if (isBake(s)) return '第 ' + (i + 1) + ' 步：定型：' + showVal(s.before) + '（前 ' + ((s.args && s.args.n) || 0) + ' 步固定成一步）';
        const t = tableOf(s.before, true).find((x) => x.id === s.tool);
        const label = t ? t.label : ((U.RULES[s.rule] || {}).label || s.tool);
        return '第 ' + (i + 1) + ' 步：' + label + '：' + showVal(s.before) + ' → ' + showVal(s.after);
      });
    },

    // 方程的左边只有一项 kx（k 不是 0 也不是 1）时返回 k（一个有理数），界面用它做「两边同除以 k」的按钮
    coef(state) {
      const v = state.current;
      if (v.kind !== 'eqn' || v.data.rel !== '=') return null;
      let L;
      try { L = F.value(v.data.lhs); } catch (e) { return null; }
      if (!L || !Array.isArray(L.terms) || L.terms.length !== 1) return null;
      const t = L.terms[0];
      if (Object.keys(t.m).length !== 1 || String(t.m.x) !== '1') return null;
      if (t.c.n === 0n || (t.c.n === 1n && t.c.d === 1n)) return null;
      return t.c;
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
      // 左边只是一个字母（x，或 D7 里的 S），右边是数
      const vars = P.vars(L);
      if (vars.length !== 1) return { solved: false };
      if (!P.eq(L, P.variable(vars[0]))) return { solved: false };
      return { solved: true, x: R };
    },
  };
  U.Workbench = Workbench;
})(typeof globalThis !== 'undefined' ? globalThis : window);
