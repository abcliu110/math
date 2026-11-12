/* 器材包 exprbench（任务 H 第 3b 步，见 next-steps.md §10.5.3–10.5.6；任务 I：步骤写进台面；D7：几何来的 S）：式子工作台。
 * 工作台的步骤历史写在台面（scene）上：scene.workbench = { host: 工作台器材 id, key: 步骤开始时方程的记号, steps: [{ tool, rule, ref, args, kept }] }。
 * 它不是器材：不改台面的器材和连线（所以「步骤不改台面」仍然成立），判题的 steps 查询读 scene.workbench.steps（judge.js）。
 * 工作台的状态从步骤重算（U.Workbench.replay）；撤销 = 把步骤截短后整体写回（一条撤销记录）。方程换了，旧步骤不再用。
 * D7：接了「几何的面积」（g）和「公式的右边」（f，如 a×h）时，方程是 S = f（S 从几何来，eq.geo 标记）；
 * 只接了 g 时没有方程，界面写着「S = ?」。e（方程台来的方程）优先。 */
(function (G) {
  'use strict';
  const U = G.U, K = U.kit;

  const eqnIn = (inp) => { const v = K.first(inp && inp.e); return v && v.kind === 'eqn' ? v : null; };
  const eqText = (v) => U.KINDS.eqn.show(v.data);   // 方程的记号：步骤跟着它走

  // D7：从几何来的 S。
  const areaIn = (inp) => { const v = K.first(inp && inp.g); return v && v.kind === 'num' ? v : null; };
  const formulaIn = (inp) => { const v = K.first(inp && inp.f); return v && v.kind === 'poly' ? v : null; };
  // 工作台用的方程：e 优先；否则 g 和 f 都接上时是 S = f。两边用多项式（和方程台一样；工作台的 norm 会换成形式）。
  // geo：标记这个方程是从几何来的（工作台据此多出「代入」「算出数」）
  const workEqnIn = (inp) => {
    const e = eqnIn(inp);
    if (e) return e;
    const f = formulaIn(inp);
    if (!areaIn(inp) || !f) return null;
    return Object.assign(U.val('eqn', { lhs: U.Poly.variable('S'), rhs: f.data, rel: '=' }), { geo: true });
  };

  // D7：几何台面的面积（现在的读数）和式子算出的 S 对照。读数变了，这里跟着变（每次求值都重算）。
  // 没有面积返回 null；式子还没解出来时 same 为 null；解出来了就比较：same 为真或假，text 写出两个数。
  const areaNote = (st, area) => {
    if (!area) return null;
    const sol = U.Workbench.solution(st), now = U.Q.show(area.data);
    if (!sol.solved) return { same: null, text: '几何台面的面积是 ' + now + '（式子还没有解）' };
    if (U.Q.eq(sol.x, area.data)) return { same: true, text: '几何台面的面积是 ' + now + '，和式子算出的 S 一致' };
    return { same: false, text: '几何台面现在的面积是 ' + now + '，式子算出的 S 是 ' + U.Q.show(sol.x) + '，对不上：几何变了，请重新代入' };
  };

  // 这个工作台记下的步骤（台面上的 scene.workbench 指向它时才算）
  const stepsOf = (scene, id) => {
    const wb = scene && scene.workbench;
    return wb && wb.host === id && Array.isArray(wb.steps) ? wb.steps : [];
  };
  // 从步骤重算工作台状态：没有步骤、或步骤的方程和现在的不一样，返回 null（旧历史不用）
  const stateOf = (scene, id, eq) => {
    const wb = scene && scene.workbench;
    if (!eq || !wb || wb.host !== id || !stepsOf(scene, id).length || wb.key !== eqText(eq)) return null;
    const start = U.Workbench.create(eq, { formula: !!eq.geo });
    try { return U.Workbench.replay(start.start, wb.steps, !!eq.geo); } catch (err) { return null; }
  };
  // 当前的工作台（没有记下的历史时，从方程本身开始）
  const currentOf = (scene, id, eq) => stateOf(scene, id, eq) || U.Workbench.create(eq, { formula: !!eq.geo });
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
    stepsOf, stateOf, currentOf, saveAction, showState, eqnIn, workEqnIn, areaIn, formulaIn, areaNote, keyOf: eqText,
  };

  U.registerPack({
    id: 'exprbench', version: 1,
    types: {
      exprbench: {
        workspaceRole: 'none',
        readsScene: true, // 读台面上的工作台步骤（scene.workbench），不全在连线上：增量求值时每次都算（任务 J）
        handles: true,
        inspector: 'workbench',
        essence: ['E4', 'E8'],
        label: '式子工作台', prefix: '工作台', group: '数与运算', grades: [6, 9], alias: ['解方程', '移项', '工作台'],
        props: {
          label: { type: 'text', label: '标签', default: '' },
        },
        lint: { minProps: 1, why: '式子工作台只有一个标签；方程从输入口来，步骤在检查器里做' },
        inputs: {
          e: { kind: 'eqn', label: '方程' },
          g: { kind: 'num', label: '面积 S' },
          f: { kind: 'poly', label: '公式右边' },
        },
        outputs: { solved: { dim: null, kind: 'bool', label: '解出来了' } },
        icon: () => K.text(32, 24, 'x=?', { size: 15, weight: 700 }) + K.text(32, 40, '移项 · 除', { size: 12 }),
        size: () => [210, 110],
        compute: (c) => {
          const eq = workEqnIn(c.inp);
          if (!eq) {
            c.say('info', areaIn(c.inp) ? '再接一个公式（如 a×h）' : '接一个方程');
            return { solved: U.val('bool', false) };
          }
          // 几何来的式子：解出来还要和几何台面的面积一致（读数变了，就不算解出来了）
          const st = currentOf(c.scene, c.ent.id, eq), area = eq.geo ? areaIn(c.inp) : null;
          const note = areaNote(st, area);
          const solved = U.Workbench.solution(st).solved && (!note || note.same === true);
          return { solved: U.val('bool', solved) };
        },
        badge: (c) => (c.out && c.out.solved && c.out.solved.data ? '解出来了' : ''),
        draw: (c) => {
          const inp = c.d && c.d.inp;
          const eq = workEqnIn(inp);
          const txt = eq ? showState(currentOf(c.scene, c.ent.id, eq)) : areaIn(inp) ? 'S = ?' : '接一个方程';
          return K.text(c.w / 2, c.h / 2 - 6, c.props.label || '式子工作台', { size: 12, weight: 700, fill: 'var(--dim)' }) +
            K.text(c.w / 2, c.h / 2 + 16, txt, { size: 15, weight: 700 });
        },
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
