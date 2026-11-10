/* 器材包 exprbench（任务 H 第 3b 步，见 next-steps.md §10.5.3–10.5.6；任务 I：步骤写进台面）：式子工作台。
 * 工作台的步骤历史写在台面（scene）上：scene.workbench = { host: 工作台器材 id, key: 步骤开始时方程的记号, steps: [{ tool, rule, ref, args, kept }] }。
 * 它不是器材：不改台面的器材和连线（所以「步骤不改台面」仍然成立），判题的 steps 查询读 scene.workbench.steps（judge.js）。
 * 工作台的状态从步骤重算（U.Workbench.replay）；撤销 = 把步骤截短后整体写回（一条撤销记录）。方程换了，旧步骤不再用。 */
(function (G) {
  'use strict';
  const U = G.U, K = U.kit;

  const eqnIn = (inp) => { const v = K.first(inp && inp.e); return v && v.kind === 'eqn' ? v : null; };
  const eqText = (v) => U.KINDS.eqn.show(v.data);   // 方程的记号：步骤跟着它走

  // 这个工作台记下的步骤（台面上的 scene.workbench 指向它时才算）
  const stepsOf = (scene, id) => {
    const wb = scene && scene.workbench;
    return wb && wb.host === id && Array.isArray(wb.steps) ? wb.steps : [];
  };
  // 从步骤重算工作台状态：没有步骤、或步骤的方程和现在的不一样，返回 null（旧历史不用）
  const stateOf = (scene, id, eq) => {
    const wb = scene && scene.workbench;
    if (!eq || !wb || wb.host !== id || !stepsOf(scene, id).length || wb.key !== eqText(eq)) return null;
    try { return U.Workbench.replay(U.Workbench.create(eq).start, wb.steps); } catch (err) { return null; }
  };
  // 当前的工作台（没有记下的历史时，从方程本身开始）
  const currentOf = (scene, id, eq) => stateOf(scene, id, eq) || U.Workbench.create(eq);
  const showState = (st) => {
    const v = st.current;
    if (v.kind !== 'eqn') return U.Form.show(v.data);
    return U.Form.show(v.data.lhs) + ' ' + v.data.rel + ' ' + U.Form.show(v.data.rhs);
  };
  // 把工作台的状态写到台面上：一个动作，整体写回（步骤为空就清掉）。撤销、换方程都靠它。
  const saveAction = (id, eq, st) => ({
    t: 'wb', host: id, key: eqText(eq),
    steps: st.steps.map((s) => ({ tool: s.tool, rule: s.rule, ref: s.ref === undefined ? null : s.ref, args: s.args || {}, kept: true })),
  });

  U.ExprBench = {
    stepsOf, stateOf, currentOf, saveAction, showState, eqnIn, keyOf: eqText,
  };

  U.registerPack({
    id: 'exprbench', version: 1,
    types: {
      exprbench: {
        workspaceRole: 'none',
        handles: true,
        inspector: 'workbench',
        essence: ['E4', 'E8'],
        label: '式子工作台', prefix: '工作台', group: '数与运算', grades: [6, 9], alias: ['解方程', '移项', '工作台'],
        props: {
          label: { type: 'text', label: '标签', default: '' },
        },
        lint: { minProps: 1, why: '式子工作台只有一个标签；方程从输入口来，步骤在检查器里做' },
        inputs: { e: { kind: 'eqn', label: '方程' } },
        outputs: { solved: { dim: null, kind: 'bool', label: '解出来了（x = 数）' } },
        icon: () => K.text(32, 24, 'x=?', { size: 15, weight: 700 }) + K.text(32, 40, '移项 · 除', { size: 12 }),
        size: () => [210, 110],
        compute: (c) => {
          const eq = eqnIn(c.inp);
          if (!eq) { c.say('info', '接一个方程'); return { solved: U.val('bool', false) }; }
          const solved = U.Workbench.solution(currentOf(c.scene, c.ent.id, eq)).solved;
          return { solved: U.val('bool', solved) };
        },
        badge: (c) => (c.out && c.out.solved && c.out.solved.data ? '解出来了' : ''),
        draw: (c) => {
          const eq = eqnIn(c.d && c.d.inp);
          const txt = eq ? showState(currentOf(c.scene, c.ent.id, eq)) : '接一个方程';
          return K.text(c.w / 2, c.h / 2 - 6, c.props.label || '式子工作台', { size: 12, weight: 700, fill: 'var(--dim)' }) +
            K.text(c.w / 2, c.h / 2 + 16, txt, { size: 15, weight: 700 });
        },
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
