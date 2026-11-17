/* “搭配”的题。点格子列出每一种搭法，不重不漏。判分只看器材的输出。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const cb = (props) => () => { const s = W.blank(); const id = W.add(s, 'combobench', 40, 50, props); s.entities[id].role = 'cb'; return s; };
  const P = [];
  const base = { domain: '统计与概率', level: 'core', shelf: ['combobench'], traps: [], predict: null };
  const add = (o) => P.push(Object.assign({}, base, o));
  const ms = (id, say, score, port, value, hints) => ({ id, say, score, when: { role: 'cb', port, op: '=', value: String(value) }, hints });
  add({
    id: 'cb-digits-012', essence: ['E1', 'E2'], title: '用 0、1、2 能排几个两位数？', grade: 3, rung: 3, points: ['3.15b'],
    topics: ['搭配', '数字卡片', '0 不能在最高位'], alias: ['排数', '两位数', '搭配'],
    hook: '十位、个位各放一张，一张不能用两次。0 能放在十位吗？点格子把能排的都列出来。',
    build: cb({ mode: 1, digits: '0,1,2' }),
    predict: { q: '能排几个两位数？', options: [{ v: '6', label: '6 个' }, { v: '4', label: '4 个' }, { v: '9', label: '9 个' }], answer: '4' },
    milestones: [ms('all', '一共 4 个：10、12、20、21', 6, 'pairs', 4, ['十位不能是 0。', '十位是 1：10、12。', '十位是 2：20、21。'])],
    goal: ['all'],
    why: '十位只能是 1 或 2（0 在十位就不是两位数了）；十位定了，个位从剩下的两张里选：2 × 2 = 4 个。',
  });
  U.problems.push.apply(U.problems, P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
