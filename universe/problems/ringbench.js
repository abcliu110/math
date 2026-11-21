/* “跳格钟”的题。点按钮换步长、走一拍、走一圈。判分只看器材的输出。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const rb = (props) => () => { const s = W.blank(); const id = W.add(s, 'ringbench', 40, 50, props); s.entities[id].role = 'rg'; return s; };
  const P = [];
  const base = { domain: '数与运算', level: 'core', shelf: ['ringbench'], traps: [], predict: null };
  const add = (o) => P.push(Object.assign({}, base, o));
  const ms = (id, say, score, port, value, hints) => ({ id, say, score, when: { role: 'rg', port, op: '=', value: String(value) }, hints });
  add({
    id: 'rg-8-steps', essence: ['E6', 'E2'], title: '8 格的钟，步长 6 能走遍吗？步长 3 呢？', grade: 5, rung: 3, points: ['5.4'],
    topics: ['公因数', '互质'], alias: ['跳格钟', '走遍', '公因数'],
    hook: '每拍走 6 格，点“走一圈”：几拍回到 0？走到几个格？再把步长改成 3 试试。',
    build: rb({ m: 8, k: 6 }),
    milestones: [
      { id: 'six', say: '步长 6：只走到 4 个格', score: 3, when: (w) => w.some('ringbench', (e) => w.num(e, 'k') === 6 && w.num(e, 'reach') === 4), hints: ['点“走一圈”。', '0、6、4、2、0。', '4 个格。'] },
      ms('all', '步长 3：走遍 8 个格', 5, 'all', 1, ['点 − 把步长改成 3。', '再点“走一圈”。', '3 和 8 没有公因数（除了 1）：走遍。']),
    ],
    goal: ['six', 'all'],
    why: '步长 6 和 8 有公因数 2，只能走到双数格：8 ÷ 2 = 4 个。步长 3 和 8 互质，每一格都能走到。走到的格数 = 8 ÷ 最大公因数(步长, 8)。',
  });
  add({
    id: 'rg-7-last', essence: ['E6', 'E2'], title: '7 的 50 次方，个位是几？', grade: 6, rung: 4, points: ['6.7b'],
    topics: ['个位', '周期'], alias: ['个位', '循环', '乘方'],
    hook: '10 格的乘法钟，从 1 出发，每拍乘 7，只看个位。先点“走一圈”：几拍一轮？再走到第 50 拍。',
    build: rb({ m: 10, op: 1, k: 7, gb: 50 }),
    milestones: [ms('cycle', '4 拍一轮：1、7、9、3', 3, 'period', 4, ['点“走一圈”。', '7、49、343、2401：个位 7、9、3、1。', '4 拍回到 1。']), ms('fifty', '第 50 拍停在 9', 5, 'atv', 9, ['50 = 4 × 12 + 2。', '走 12 轮回到 1，再走 2 拍。', '1 → 7 → 9。'])],
    goal: ['fifty'],
    why: '个位只由上一个个位决定：1 → 7 → 9 → 3 → 1，4 拍一轮。50 ÷ 4 = 12 …… 2，走完 12 轮回到 1，再走 2 拍到 9。所以 7 的 50 次方个位是 9。',
  });
  U.problems.push.apply(U.problems, P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
