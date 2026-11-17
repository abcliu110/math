/* “优化（安排时间）”的题。按顺序点事情排进时间线；烙饼一锅一锅选。判分只看器材的输出。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const ob = (props) => () => { const s = W.blank(); const id = W.add(s, 'optbench', 40, 50, props); s.entities[id].role = 'op'; return s; };
  const P = [];
  const base = { domain: '时间与变化', level: 'core', shelf: ['optbench'], traps: [], predict: null };
  const add = (o) => P.push(Object.assign({}, base, o));
  const ms = (id, say, score, port, value, hints) => ({ id, say, score, when: { role: 'op', port, op: '=', value: String(value) }, hints });
  add({
    id: 'opt-pancake-3', essence: ['E4', 'E7'], title: '烙 3 张饼，最少几分钟？', grade: 4, rung: 3, points: ['4.8'],
    topics: ['烙饼问题', '优化'], alias: ['烙饼', '优化', '最省时间'],
    hook: '锅里一次放 2 张饼，每面烙 3 分钟。3 张饼一共 6 面。点饼选这一锅烙哪两张，再点“烙一锅”。怎样不让锅空着？',
    build: ob({ mode: 1, n: 3, m: 3 }),
    predict: { q: '3 张饼最少几分钟？', options: [{ v: '12', label: '12 分钟' }, { v: '9', label: '9 分钟' }, { v: '6', label: '6 分钟' }], answer: '9' },
    milestones: [ms('best', '最少 9 分钟：每一锅都放满 2 面', 8, 'best', 1, ['第 1 锅：饼 1、饼 2。', '第 2 锅：饼 1 的另一面、饼 3。', '第 3 锅：饼 2、饼 3 的另一面。'])],
    goal: ['best'],
    why: '3 张饼 6 面，每锅 2 面，最少 3 锅 = 9 分钟。先烙 1、2，再烙 1 和 3，最后烙 2 和 3：每一锅都没空着。先把 1、2 两面都烙完再烙 3，就有一锅只放了 1 面，要 12 分钟。',
  });
  U.problems.push.apply(U.problems, P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
