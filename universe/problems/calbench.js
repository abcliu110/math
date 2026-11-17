/* “日历”的题。翻月份、点两天、一周一周往后跳。判分只看器材的输出。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const cb = (props) => () => { const s = W.blank(); const id = W.add(s, 'calbench', 40, 50, props); s.entities[id].role = 'cl'; return s; };
  const P = [];
  const base = { domain: '时间与变化', level: 'core', shelf: ['calbench'], traps: [], predict: null };
  const add = (o) => P.push(Object.assign({}, base, o));
  const ms = (id, say, score, port, value, hints) => ({ id, say, score, when: { role: 'cl', port, op: '=', value: String(value) }, hints });

  add({
    id: 'cal-feb-2024', essence: ['E6'], title: '2024 年 2 月有几天？', grade: 3, rung: 2, points: ['3.13'],
    topics: ['闰年', '平年', '年月日'], alias: ['闰年', '二月', '几天'],
    hook: '日历现在是 2024 年 1 月。翻到 2 月看看有几天。2024 年是闰年还是平年？',
    build: cb({ mode: 0, y: 2024, mo: 1 }),
    milestones: [ms('feb', '2024 年 2 月有 29 天：闰年', 6, 'days', 29, ['点 ▶ 翻到 2 月。', '2024 能被 4 整除。', '闰年的 2 月有 29 天。'])],
    goal: ['feb'],
    why: '四年一闰：年份能被 4 整除（整百年要能被 400 整除）就是闰年，2 月有 29 天；平年 2 月 28 天。2024 ÷ 4 = 506，是闰年。',
  });
  add({
    id: 'cal-may-days', essence: ['E6', 'E7'], title: '5 月 1 日到 5 月 31 日，一共几天？', grade: 3, rung: 3, points: ['3.13'],
    topics: ['经过几天', '两头都算'], alias: ['经过几天', '一共几天', '植树问题'],
    hook: '点 5 月 1 日，再点 5 月 31 日。“经过了几天”和“一共几天”不一样：一共几天要把头尾两天都算上。',
    build: cb({ mode: 0, y: 2026, mo: 5 }),
    milestones: [ms('all', '两头都算：一共 31 天', 6, 'inclusive', 31, ['点 1 日，再点 31 日。', '31 − 1 = 30 是经过的天数。', '头尾都算再加 1：31 天。'])],
    goal: ['all'],
    why: '从 1 日到 31 日“经过”了 30 天，但 1 日、2 日……31 日一共是 31 天：两头都算，要再加 1。这和植树问题“两头都种，棵数 = 段数 + 1”是一回事。',
  });
  U.problems.push.apply(U.problems, P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
