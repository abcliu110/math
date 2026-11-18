/* “钱币”的题。点钱包里的钱放进盘子；找零从价钱往上数。判分只看器材的输出。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const mb = (props) => () => { const s = W.blank(); const id = W.add(s, 'moneybench', 40, 50, props); s.entities[id].role = 'mo'; return s; };
  const P = [];
  const base = { domain: '数与运算', level: 'core', shelf: ['moneybench'], traps: [], predict: null };
  const add = (o) => P.push(Object.assign({}, base, o));
  const ms = (id, say, score, port, value, hints) => ({ id, say, score, when: { role: 'mo', port, op: '=', value: String(value) }, hints });

  add({
    id: 'mn-pay-7-5', essence: ['E3', 'E2'], title: '7 元 5 角，怎么付正好？', grade: 1, rung: 2, points: ['1.14'],
    topics: ['人民币', '元角'], alias: ['付钱', '元角', '凑钱'],
    hook: '一本本子 7 元 5 角。从钱包里点钱放进盘子，正好付 7 元 5 角。可以用几张 1 元，也可以用 5 元……',
    build: mb({ mode: 0, price: 75 }),
    milestones: [ms('exact', '正好付了 7 元 5 角', 6, 'exact', 1, ['先放一张 5 元。', '再放两张 1 元：7 元。', '再放一个 5 角。'])],
    goal: ['exact'],
    why: '7 元 5 角 = 5 元 + 1 元 + 1 元 + 5 角，也可以是 7 张 1 元和 5 个 1 角。10 角 = 1 元：大钱小钱怎么凑都行，加起来正好就是付够了。',
  });
  add({
    id: 'mn-change-20', essence: ['E3', 'E2'], title: '13 元 5 角的东西，付 20 元，找多少？', grade: 2, rung: 3, points: ['1.14'],
    topics: ['找零', '人民币'], alias: ['找零', '找钱', '往上数'],
    hook: '店员找零常常是往上数：从 13 元 5 角开始，先数 5 角到 14 元，再数 1 元到 15 元，再数 5 元到 20 元。点钱包里的钱“数上去”。',
    build: mb({ mode: 1, price: 135, paid: 200 }),
    milestones: [ms('change', '找零 6 元 5 角', 6, 'change', '13/2', ['先数 5 角：到 14 元。', '再数 1 元到 15 元，再数 5 元到 20 元。', '5 角 + 1 元 + 5 元 = 6 元 5 角。'])],
    goal: ['change'],
    why: '20 − 13.5 = 6.5。往上数：13.5 → 14 → 15 → 20，数上去的是 0.5 + 1 + 5 = 6.5 元，就是找的零钱。',
  });
  add({
    id: 'mn-fewest', essence: ['E3', 'E2'], title: '8 元 7 角，最少用几张？', grade: 1, rung: 3, points: ['1.14'],
    topics: ['人民币', '最少张数'], alias: ['付钱', '最少几张', '凑钱'],
    hook: '正好付 8 元 7 角，张数要最少：先用大面额，大的用不了再用小的。',
    build: mb({ mode: 0, price: 87 }),
    milestones: [ms('few', '正好，而且最少：7 张', 8, 'fewest', 1, ['5 元 1 张，1 元 3 张：8 元。', '5 角 1 张，1 角 2 张：7 角。', '一共 7 张。'])],
    goal: ['few'],
    why: '先用大面额：5 元 1 张，剩 3 元用 3 张 1 元；7 角用 5 角 1 张、1 角 2 张。1 + 3 + 1 + 2 = 7 张。全用 1 元、1 角要 15 张。',
  });
  U.problems.push.apply(U.problems, P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
