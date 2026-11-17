/* “估一估”的题。点每个数离它近的那一端，再“算一算”看差多少。判分只看器材的输出。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const eb = (props) => () => { const s = W.blank(); const id = W.add(s, 'estbench', 40, 50, props); s.entities[id].role = 'e'; return s; };
  const P = [];
  const base = { domain: '数与运算', level: 'core', shelf: ['estbench'], traps: [], predict: null };
  const add = (o) => P.push(Object.assign({}, base, o));
  const ms = (id, say, score, port, value, hints) => ({ id, say, score, when: { role: 'e', port, op: '=', value: String(value) }, hints });

  add({
    id: 'es-503-198', essence: ['E3', 'E2'], title: '503 − 198 大约是多少？', grade: 3, rung: 2, points: ['3.11'],
    topics: ['估算', '整百数'], alias: ['估算', '大约', '整百数'],
    hook: '先不算。503 离 500 近还是离 600 近？198 呢？都看成整百数，估一估，再算一算看差多少。',
    build: eb({ mode: 0, op: 1, a: '503', b: '198', ua: '100', ub: '100' }),
    milestones: [ms('est', '估计：500 − 200 = 300', 5, 'est', 300, ['503 离 500 只差 3。', '198 离 200 只差 2。', '500 − 200 = 300。']), ms('exact', '准确是 305，只差 5', 3, 'exact', 305, ['点“算一算”。', '503 − 198 = 305。', '估计 300，差得很少。'])],
    goal: ['est', 'exact'],
    traps: [{ id: 'far', wrong: '把 503 看成 600，就差了将近 100：要看成离它最近的整百数。', when: { role: 'e', port: 'est', op: '=', value: '400' } }],
    why: '503 ≈ 500，198 ≈ 200，500 − 200 = 300，准确是 305。看成离它最近的整百数，估得又快又准。',
  });
  U.problems.push.apply(U.problems, P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
