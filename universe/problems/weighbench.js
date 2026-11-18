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
  add({
    id: 'wt-12-unknown', essence: ['E7', 'E2'], title: '12 个零件里 1 个不一样重（可能重也可能轻），称 3 次能找出来吗？', grade: 5, rung: 5, points: ['5.13'],
    topics: ['找次品', '可轻可重'], alias: ['找次品', '12 个球', '可轻可重'],
    hook: '这回不知道次品是重还是轻。称完不但要找出是哪一个，还要说出它重还是轻。已经知道是好的零件，也可以放上去当砝码。',
    build: wb({ n: 12, dir: 1 }),
    milestones: [ms('best', '称 3 次找到，并且知道它是重还是轻', 10, 'best', 1, ['第 1 次：4 个对 4 个。', '平了：次品在剩下的 4 个里，前 8 个都是好的，可以当砝码。', '再用好的去比，看偏向哪边：既知道是哪个，也知道重还是轻。'])],
    goal: ['best'],
    why: '一次称有 3 种结果，3 次最多分出 27 种；12 个零件、每个可能重或轻，一共 24 种情况，再去掉没法分辨的，正好 3 次够。关键是每次都让三种结果剩下的情况差不多一样多，还要把已经知道是好的零件用起来。',
  });
  U.problems.push.apply(U.problems, P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
