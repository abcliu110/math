/* “量角器与角”的题。转量角器、拖射线、点角量出来、连对角线。判分只看器材的输出。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const ab = (props) => () => { const s = W.blank(); const id = W.add(s, 'anglebench', 40, 50, props); s.entities[id].role = 'an'; return s; };
  const P = [];
  const base = { domain: '图形', level: 'core', shelf: ['anglebench'], traps: [], predict: null };
  const add = (o) => P.push(Object.assign({}, base, o));
  const ms = (id, say, score, port, value, hints) => ({ id, say, score, when: { role: 'an', port, op: '=', value: String(value) }, hints });

  add({
    id: 'an-inner-scale', essence: ['E5', 'E7'], title: '开口朝左的角：读内圈还是外圈？', grade: 4, rung: 3, points: ['4.6'],
    topics: ['量角', '量角器的内圈外圈'], alias: ['量角器', '内圈', '外圈', '量角'],
    hook: '这个角的一条边朝左。转量角器，让 0° 线压在一条边上；从压着的那边的 0 开始读。读出来是 40° 还是 140°？',
    build: ab({ mode: 0, a1: 40, a2: 180, prot: 100 }),
    predict: { q: '这个角看起来是——', options: [{ v: 'a', label: '锐角' }, { v: 'o', label: '钝角' }], answer: 'o' },
    milestones: [ms('deg', '读出 140°：钝角', 6, 'deg', 140, ['0° 线可以压在朝左的那条边上。', '从左边的 0 开始数。', '140°。'])],
    goal: ['deg'],
    why: '量角器有两圈数，都从 0 开始，一圈从右数，一圈从左数。哪条边压着 0° 线，就从那边的 0 开始读。这个角比直角大，读 40° 一定读错了圈。',
  });
  U.problems.push.apply(U.problems, P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
