/* “因数与倍数”的题。点每行几个排方块、点数字试除、点跳跳线的落点。判分只看器材的输出。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const fb = (props) => () => { const s = W.blank(); const id = W.add(s, 'factorbench', 40, 50, props); s.entities[id].role = 'f'; return s; };
  const P = [];
  const base = { domain: '数与运算', level: 'core', shelf: ['factorbench'], traps: [], predict: null };
  const add = (o) => P.push(Object.assign({}, base, o));
  const ms = (id, say, score, port, value, hints) => ({ id, say, score, when: { role: 'f', port, op: '=', value: String(value) }, hints });

  add({
    id: 'fb-24', essence: ['E2', 'E6'], title: '24 个方块能排成几种长方形？', grade: 5, rung: 2, points: ['5.8'],
    topics: ['因数', '找因数'], alias: ['因数', '找因数', '拼长方形'],
    hook: '24 个小方块，每行放 1 个、2 个、3 个……哪些能正好排满？排满一次就找到一对因数。',
    build: fb({ mode: 0, n: 24 }),
    milestones: [ms('all', '找全了：24 有 8 个因数', 6, 'count', 8, ['每行 1、2、3、4 个都能排满。', '每行 5 个排不满。', '1、2、3、4、6、8、12、24。'])],
    goal: ['all'],
    why: '每排满一次，“每行几个”和“几行”都是因数：1 × 24、2 × 12、3 × 8、4 × 6。试到 4 以后，再往上就是 6、8、12、24，已经成对找到了。',
  });
  add({
    id: 'fb-29', essence: ['E2', 'E6'], title: '29 是质数吗？排一排看', grade: 5, rung: 3, points: ['5.8'],
    topics: ['质数', '合数', '因数'], alias: ['质数', '合数', '找因数'],
    hook: '29 个小方块，除了排成一长条，还能排成别的长方形吗？试到每行几个就可以停了？',
    build: fb({ mode: 0, n: 29 }),
    predict: { q: '29 是质数吗？', options: [{ v: 'y', label: '是' }, { v: 'n', label: '不是' }], answer: 'y' },
    milestones: [ms('prime', '只能排成 1 × 29：质数', 6, 'prime', 1, ['每行 1 个：排满了。', '2、3、4、5 都排不满。', '5 × 5 = 25，6 × 6 = 36 已经比 29 大：试到 5 就够了。'])],
    goal: ['prime'],
    why: '29 只能排成一长条（1 × 29），除了 1 和 29 没有别的因数，所以是质数。只要试到 5：如果有更大的因数，它配对的那个就比 5 小，早就试出来了。',
  });
  U.problems.push.apply(U.problems, P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
