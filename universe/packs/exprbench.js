/* 器材包 exprbench（任务 H 第 3b 步，见 next-steps.md §10.5.3–10.5.6）：式子工作台。
 * 工作台的步骤历史不在台面上（台面保持可以存档）：界面层把它放在 U.ExprBench.states[器材 id] 里，
 * 这里只按它算 solved 输出。方程换了（输入口的方程和记下的不一样）时，旧的历史就不再用。 */
(function (G) {
  'use strict';
  const U = G.U, K = U.kit;

  const eqnIn = (inp) => { const v = K.first(inp && inp.e); return v && v.kind === 'eqn' ? v : null; };
  const eqText = (v) => U.KINDS.eqn.show(v.data);   // 方程的记号：工作台的状态跟着它走

  // 器材 id 对应的工作台状态：方程和记下的一致才算数；否则返回 null
  const stateOf = (id, eq) => {
    const s = U.ExprBench.states[id];
    return s && eq && s.key === eqText(eq) ? s.state : null;
  };
  // 当前的工作台（没有记下的历史时，从方程本身开始）
  const currentOf = (id, eq) => stateOf(id, eq) || U.Workbench.create(eq);
  const showState = (st) => {
    const v = st.current;
    if (v.kind !== 'eqn') return U.Form.show(v.data);
    return U.Form.show(v.data.lhs) + ' ' + v.data.rel + ' ' + U.Form.show(v.data.rhs);
  };

  U.ExprBench = {
    states: {},
    stateOf, currentOf, showState, eqnIn, keyOf: eqText,
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
        icon: () => K.text(32, 24, 'x=?', { size: 15, weight: 700 }) + K.text(32, 40, '移项 · 除', { size: 9 }),
        size: () => [210, 110],
        compute: (c) => {
          const eq = eqnIn(c.inp);
          if (!eq) { c.say('info', '接一个方程'); return { solved: U.val('bool', false) }; }
          const solved = U.Workbench.solution(currentOf(c.ent.id, eq)).solved;
          return { solved: U.val('bool', solved) };
        },
        badge: (c) => (c.out && c.out.solved && c.out.solved.data ? '解出来了' : ''),
        draw: (c) => {
          const eq = eqnIn(c.d && c.d.inp);
          const txt = eq ? showState(currentOf(c.ent.id, eq)) : '接一个方程';
          return K.text(c.w / 2, c.h / 2 - 6, c.props.label || '式子工作台', { size: 12, weight: 700, fill: 'var(--dim)' }) +
            K.text(c.w / 2, c.h / 2 + 16, txt, { size: 15, weight: 700 });
        },
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
