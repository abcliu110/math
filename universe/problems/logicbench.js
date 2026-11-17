/* “推理台”的题。点格子标 ✗ ✓，点线索划掉。判分只看器材的输出和标记。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const lb = (props) => () => { const s = W.blank(); const id = W.add(s, 'logicbench', 40, 50, props); s.entities[id].role = 'lg'; return s; };
  const P = [];
  const base = { domain: '数与运算', level: 'core', shelf: ['logicbench'], traps: [], predict: null };
  const add = (o) => P.push(Object.assign({}, base, o));

  add({
    id: 'lg-jobs', essence: ['E2', 'E9'], title: '老师、医生、司机：谁是谁？', grade: 3, rung: 3, points: ['2.14b'],
    topics: ['推理', '排除法'], alias: ['推理', '排除法', '谁是谁'],
    hook: '张、王、李三人，一个是老师，一个是医生，一个是司机。看线索，在表里标 ✗ 和 ✓。',
    build: lb({ people: '张,王,李', groups: '职业：老师,医生,司机', clues: '张不是老师|王不是老师，也不是医生|', answer: '张:医生;王:司机;李:老师' }),
    milestones: [{ id: 'done', say: '张是医生，王是司机，李是老师', score: 8, when: { role: 'lg', port: 'solved', op: '=', value: '1' }, hints: ['线索 2：王只能是司机，点王的司机标 ✓。', '线索 1：张不是老师，司机又被王占了。', '张是医生，李是老师。'] }],
    goal: ['done'],
    why: '王不是老师也不是医生，只能是司机；张不是老师，司机已经是王，所以张是医生；剩下李是老师。每确定一个 ✓，同一行、同一列的别的格都是 ✗，这就是排除法。',
  });
  U.problems.push.apply(U.problems, P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
