/* 尺规作图的题（docs/new-instruments.md 6.12）：作法要换了位置还成立，不能凭眼睛。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const cp = (task) => () => { const s = W.blank(); const id = W.add(s, 'compass', 40, 40, { task }); s.entities[id].role = 'c'; return s; };
  const P = [];
  const add = (o) => P.push(Object.assign({ domain: '图形', level: 'core', shelf: ['compass'], predict: null }, o));
  const ms = (id, say, score, port, op, value, hints) => ({ id, say, score, when: { role: 'c', port, op, value: String(value) }, hints });
  const eye = [{ id: 'eyeball', wrong: '凭眼睛放的点，换了位置就散了。作图要用圆和直线的交点，这样已知的点怎么动，作法都成立。', when: { role: 'c', port: 'free', op: '>=', value: '1' } }];
  add({
    id: 'cs-bisector', essence: ['E9', 'E10', 'E5'], title: '作线段 AB 的垂直平分线', grade: 8, rung: 4, points: ['8.12'], build: cp(0),
    topics: ['尺规作图', '垂直平分线', '轴对称'], alias: ['尺规作图', '垂直平分线', '圆规', '直尺'],
    hook: '只用圆规和直尺。作完以后，系统会把 A、B 换到 3 个新位置，照你的步骤再作一遍：真正的作法，换了位置也成立。',
    milestones: [ms('two', '画了两个圆或线', 1, 'objs', '>=', 2, ['选“圆规”，点圆心 A，再点 B。', '再以 B 为圆心，过 A 画一个圆。', '两个圆的半径要一样，都是 AB。']), ms('ok', '作对了：4 个位置上都成立', 5, 'ok', '=', 1, ['两个圆的交点有两个，都在垂直平分线上。', '选“取交点”，点绿圈。', '过两个交点画一条直线。'])],
    goal: ['two', 'ok'], traps: eye, why: '以 A、B 为圆心、AB 为半径各画一个圆，两个圆的交点 P、Q 到 A、B 的距离都等于 AB。到 A、B 距离相等的点在垂直平分线上，所以直线 PQ 就是 AB 的垂直平分线。',
  });
  add({
    id: 'cs-equilateral', essence: ['E9', 'E10', 'E5'], title: '以线段 AB 为边作正三角形', grade: 7, rung: 3, points: ['7.12'], build: cp(1),
    topics: ['尺规作图', '正三角形', '圆'], alias: ['尺规作图', '正三角形', '圆规'],
    hook: '只用圆规和直尺，找一个点 C，让 CA = CB = AB。找到后，系统把 A、B 换位置，检查还成不成立。',
    milestones: [ms('two', '画了两个圆', 1, 'objs', '>=', 2, ['以 A 为圆心，过 B 画圆。', '再以 B 为圆心，过 A 画圆。', '两个圆有两个交点。']), ms('ok', '作对了：4 个位置上都成立', 4, 'ok', '=', 1, ['取交点，选一个绿圈。', '它到 A、到 B 都是 AB（两个圆的半径）。', '不用再画线。'])],
    goal: ['two', 'ok'], traps: eye, why: '以 A 为圆心、AB 为半径的圆上，每个点到 A 的距离都是 AB；以 B 为圆心同样。两个圆的交点到 A、B 的距离都是 AB，和 AB 一起围成正三角形。',
  });
  add({
    id: 'cs-anglebisect', essence: ['E9', 'E10', 'E5'], title: '作 ∠AOB 的平分线', grade: 8, rung: 4, points: ['8.12'], build: cp(2),
    topics: ['尺规作图', '角平分线', '轴对称'], alias: ['尺规作图', '角平分线', '圆规'],
    hook: '作射线 OP，让 ∠AOP = ∠POB。先在两条边上截出等长的两段，再找到到这两个点距离相等的点。',
    milestones: [ms('some', '画了 3 个以上的圆和线', 1, 'objs', '>=', 3, ['以 O 为圆心，过 A 画圆。', '连直线 OB，和圆相交，得到 OB 上的点。', '再以 A 和那个点为圆心，用同样的半径画两个圆。']), ms('ok', '作对了：4 个位置上都成立', 5, 'ok', '=', 1, ['最后画一条过 O 的直线。', '另一个点是那两个圆的交点。', '两个圆半径相同，交点到两个点一样远。'])],
    goal: ['some', 'ok'], traps: eye, why: 'OA = OA′（同一个圆的半径），再作 AX = A′X（两个同样大的圆交点 X）。三角形 OAX 和 OA′X 的三边对应相等，所以 ∠AOX = ∠A′OX，OX 平分角。',
  });
  add({
    id: 'cs-perp', essence: ['E9', 'E10', 'E5'], title: '过直线外一点作垂线', grade: 8, rung: 4, points: ['8.12'], build: cp(3),
    topics: ['尺规作图', '垂线', '轴对称'], alias: ['尺规作图', '垂线', '圆规'],
    hook: '过 C 作 AB 的垂线。提示：以 C 为圆心画一个圆，和直线 AB 相交，然后在交点连线的垂直平分线上找 C。',
    milestones: [ms('some', '画了 3 个以上的圆和线', 1, 'objs', '>=', 3, ['先连直线 AB。', '以 C 为圆心，过 A 画圆，和直线 AB 又交于一点。', '以那两个交点为圆心，同样半径各画一个圆。']), ms('ok', '作对了：4 个位置上都成立', 5, 'ok', '=', 1, ['两个同样大的圆有两个交点。', '这条直线正好过 C。', '过这两个交点画直线。'])],
    goal: ['some', 'ok'], traps: eye, why: 'C 在以 C 为圆心的圆上，圆和 AB 交于 A、A′，CA = CA′，所以 C 在 AA′ 的垂直平分线上；作出 AA′ 的垂直平分线，它就是过 C 且垂直于 AB 的直线。',
  });
  for (const p of P) U.problems.push(p);
})(typeof globalThis !== 'undefined' ? globalThis : window);
