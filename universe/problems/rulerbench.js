/* “尺子”的题。拖铅笔对准 0，或者数格子；拖剪刀剪绳子。判分只看器材的输出。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const rb = (props) => () => { const s = W.blank(); const id = W.add(s, 'rulerbench', 40, 50, props); s.entities[id].role = 'rl'; return s; };
  const P = [];
  const base = { domain: '图形', level: 'core', shelf: ['rulerbench'], traps: [], predict: null };
  const add = (o) => P.push(Object.assign({}, base, o));
  const ms = (id, say, score, port, value, hints) => ({ id, say, score, when: { role: 'rl', port, op: '=', value: String(value) }, hints });

  add({
    id: 'ru-pencil', essence: ['E5', 'E7'], title: '铅笔没从 0 开始放，它有多长？', grade: 2, rung: 2, points: ['2.6'],
    topics: ['量长度', '厘米'], alias: ['尺子', '量长度', '厘米', '从 0 开始'],
    hook: '铅笔头在 2 厘米，笔尖指着 8。它是 8 厘米长吗？拖铅笔让头对准 0，或者点“从这头数到那头”数一数。',
    build: rb({ mode: 0, len: 6, at: 2 }),
    predict: { q: '这支铅笔有几厘米？', options: [{ v: '8', label: '8 厘米' }, { v: '6', label: '6 厘米' }, { v: '10', label: '10 厘米' }], answer: '6' },
    milestones: [ms('len', '铅笔长 6 厘米', 6, 'len', 6, ['笔尖指的 8 不是长度：头不在 0。', '把铅笔拖到头对准 0。', '8 − 2 = 6。'])],
    goal: ['len'],
    why: '量长度要从 0 开始；不从 0 开始，就用尾巴的刻度减开头的刻度：8 − 2 = 6。数格子也一样：一格 1 厘米，6 格。',
  });
  U.problems.push.apply(U.problems, P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
