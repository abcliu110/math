/* “找次品（天平）”的题。点零件放左盘、右盘，点“称一下”。判分只看器材的输出。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const wb = (props) => () => { const s = W.blank(); const id = W.add(s, 'weighbench', 40, 50, props); s.entities[id].role = 'wt'; return s; };
  const P = [];
  const base = { domain: '关系', level: 'core', shelf: ['weighbench'], traps: [], predict: null };
  const add = (o) => P.push(Object.assign({}, base, o));
  const ms = (id, say, score, port, value, hints) => ({ id, say, score, when: { role: 'wt', port, op: '=', value: String(value) }, hints });
  add({
    id: 'wt-3', essence: ['E7', 'E2'], title: '3 个零件，称一次能找出轻的吗？', grade: 5, rung: 2, points: ['5.13'],
    topics: ['找次品'], alias: ['找次品', '天平'],
    hook: '3 个零件里有 1 个轻一点。左右各放 1 个，称一次：平了说明什么？不平说明什么？',
    build: wb({ n: 3 }),
    milestones: [ms('best', '称 1 次就找到', 6, 'best', 1, ['左盘放 1 号，右盘放 2 号。', '点“称一下”。', '平了就是 3 号，不平就是翘起来的那个。'])],
    goal: ['best'],
    why: '左右各放 1 个：不平，翘起来的轻，就是它；平了，没上秤的那个就是。一次就能分出 3 种情况，所以 3 个只要称 1 次。',
  });
  add({
    id: 'wt-27', essence: ['E7', 'E2'], title: '27 个零件，最少称几次一定能找出来？', grade: 5, rung: 4, points: ['5.13'],
    topics: ['找次品', '最不利原则'], alias: ['找次品', '分三份', '最少几次'],
    hook: '天平会按最不利的情况回答。每次怎么分，剩下的可疑零件最少？试试分成 3 份。',
    build: wb({ n: 27 }),
    predict: { q: '27 个最少称几次一定能找出来？', options: [{ v: '13', label: '13 次' }, { v: '5', label: '5 次' }, { v: '3', label: '3 次' }], answer: '3' },
    milestones: [ms('best', '称 3 次就保证找到', 8, 'best', 1, ['第 1 次：9 个对 9 个。', '剩下 9 个可疑：3 个对 3 个。', '剩下 3 个可疑：1 个对 1 个。'])],
    goal: ['best'],
    why: '每次把可疑的平均分成 3 份，两份上秤：不管结果怎样，可疑的都只剩 1/3。27 → 9 → 3 → 1，3 次。分成 2 份（13 对 13）最不利时还剩 13 个，要称更多次。',
  });
  U.problems.push.apply(U.problems, P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
