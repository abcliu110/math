/* 证明排序的题（docs/new-instruments.md 5.5）：开场一张卡都没放。判分：排对、依据全对、没放干扰卡。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const ps = (pid) => () => { const s = W.blank(); const id = W.add(s, 'proofsort', 60, 60, { pid }); s.entities[id].role = 'p'; return s; };
  const P = [];
  const add = (o) => P.push(Object.assign({ domain: '关系', level: 'core', shelf: ['proofsort'], predict: null, traps: [] }, o));
  const ms = (say, hints) => [{ id: 'ok', say, score: 8, when: { role: 'p', port: 'ok', op: '=', value: '1' }, hints }];
  add({
    id: 'ps-odd-odd', essence: ['E9'], title: '证明：两个奇数的和是偶数', grade: 5, rung: 3, points: ['5.8'], build: ps(0),
    topics: ['证明排序', '奇数偶数', '代数表示'], alias: ['证明排序', '奇数偶数', '证明', '推理'],
    hook: '把打乱的步骤排成一个完整的证明，每一步选它的依据。注意：有两张卡是错的——一张只举了几个例子，一张用结论来证明结论，别放进来。',
    milestones: ms('排对了，依据也都对', ['第一步是“设”：先把奇数写成代数式。', '每一步都从上一步变出来。最后一步是“所以是偶数”。', '放卡的顺序：设 → 求和 → 合并 → 提 2 → 偶数的定义。']),
    goal: ['ok'], why: '把奇数写成 2a + 1，一次写下所有奇数，所以这是证明；举 3 + 5、7 + 9 只是例子。',
  });
  add({
    id: 'ps-vertical', essence: ['E9'], title: '证明：对顶角相等', grade: 7, rung: 3, points: ['7.1'], build: ps(1),
    topics: ['证明排序', '对顶角', '平角'], alias: ['证明排序', '对顶角', '证明'],
    hook: '∠1 和 ∠3 是对顶角。把证明排好：先用平角是 180°，再把两个式子放在一起比。有一张“量一量”的卡不能放。',
    milestones: ms('排对了，依据也都对', ['两个平角的式子先出来。', '把两个式子的左边连成等式，再两边减同一个数。', '依据：平角、平角、等量代换、等式性质。']),
    goal: ['ok'], why: '∠1 + ∠2 = 180° = ∠3 + ∠2，两边减 ∠2，得 ∠1 = ∠3。量一量只能说明这一幅图。',
  });
  add({
    id: 'ps-isosceles', essence: ['E9'], title: '证明：等腰三角形两底角相等', grade: 8, rung: 4, points: ['8.4'], build: ps(2),
    topics: ['证明排序', '等腰三角形', '全等三角形'], alias: ['证明排序', '等腰三角形', '全等', '证明'],
    hook: '△ABC 中 AB = AC，证 ∠B = ∠C。先作辅助线，再用全等。有一张卡是把结论当已知的逆命题，别放。',
    milestones: ms('排对了，依据也都对', ['先作辅助线，再列全等的条件。', '全等了，再说对应角相等。', '作顶角的平分线 AD → 条件 → SAS → 对应角。']),
    goal: ['ok'], why: '作 AD 平分顶角，△ABD ≌ △ACD（SAS），所以 ∠B = ∠C。',
  });
  add({
    id: 'ps-parallelogram', essence: ['E9'], title: '证明：平行四边形的对角线互相平分', grade: 8, rung: 4, points: ['8.11'], build: ps(3),
    topics: ['证明排序', '平行四边形', '全等三角形'], alias: ['证明排序', '平行四边形', '对角线', '证明'],
    hook: '要证 AO = CO，BO = DO。找一对全等三角形：△AOB 和 △COD 需要哪三个条件？先排好三个条件，再下结论。',
    milestones: ms('排对了，依据也都对', ['三个条件可以先后任意，但都要在“全等”前面。', '最后一步是对应边相等。', '内错角、对边、对顶角 → AAS → 对应边。']),
    goal: ['ok'], why: '∠BAO = ∠DCO（内错角）、AB = DC（对边）、∠AOB = ∠COD（对顶角），所以 △AOB ≌ △COD（AAS），对应边 AO = CO、BO = DO。',
  });
  for (const p of P) U.problems.push(p);
})(typeof globalThis !== 'undefined' ? globalThis : window);
