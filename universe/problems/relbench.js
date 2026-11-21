/* “关系图”的题：先连关系（点对的关系卡），再一步一步算（点关系圈）。判分只看器材的输出。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const rb = (props) => () => { const s = W.blank(); const id = W.add(s, 'relbench', 40, 50, props); s.entities[id].role = 'rl'; return s; };
  const P = [];
  const base = { domain: '关系', level: 'core', shelf: ['relbench'], traps: [], predict: null };
  const add = (o) => P.push(Object.assign({}, base, o));
  const ms = (id, say, score, port, value, hints) => ({ id, say, score, when: { role: 'rl', port, op: '=', value: String(value) }, hints });
  add({
    id: 'rl-times-sum', essence: ['E4', 'E2'], title: '苹果是梨的 3 倍，两种一共 16 千克。苹果有多少千克？', grade: 3, rung: 3, points: ['3.4'],
    topics: ['和倍问题', '分析法'], alias: ['关系图', '和倍', '一共几份'],
    hook: '方框是量，小圆圈是关系。先点右边对的关系卡把关系连上（不对的会告诉你为什么）。再点关系圈：三个量只差一个，就算得出来。',
    build: rb({ qs: '苹果|0|12;梨|0|4;一共|1|16;倍数|1|3;1 份|1|1;一共几份|0|4', rels: '5=3+4;1=2/5;0=1*3', cand: '1=2/3;5=3+4;0=1*3;1=2/5;0=1+3', ask: 0 }),
    milestones: [ms('model', '关系连好了', 3, 'modeled', 1, ['苹果 3 份、梨 1 份：一共几份 = 倍数 + 1 份。', '梨就是 1 份：梨 = 一共 ÷ 一共几份。', '苹果 = 梨 × 倍数。']), ms('ans', '苹果 12 千克', 5, 'ans', 12, ['先算一共几份：3 + 1 = 4。', '梨 = 16 ÷ 4 = 4。', '苹果 = 4 × 3 = 12。'])],
    goal: ['ans'],
    why: '“一共”里有几份，不是 3 份而是 3 + 1 = 4 份（梨自己也是 1 份）。16 ÷ 4 = 4 是 1 份，也就是梨；苹果 3 份是 12。关系图把“先求什么、再求什么”画出来了：要求苹果，得先知道梨；要求梨，得先知道一共几份。',
    traps: [{ id: 'div3', wrong: '16 ÷ 3 不是一份：一共有 3 + 1 = 4 份。', when: { role: 'rl', port: 'wrong', op: '=', value: '1' } }],
  });
  add({
    id: 'rl-unit', essence: ['E4', 'E2'], title: '买 4 支铅笔花了 12 元，照这样买 7 支要多少元？', grade: 3, rung: 2, points: ['3.5'],
    topics: ['归一问题', '综合法'], alias: ['关系图', '归一', '单价'],
    hook: '关系已经连好了。从知道的量出发：哪个关系圈只差一个量？点它。',
    build: rb({ qs: '数量（4）|1|4;总价（4 支）|1|12;单价|0|3;数量（7）|1|7;总价（7 支）|0|21', rels: '2=1/0;4=2*3', ask: 4 }),
    milestones: [ms('ans', '7 支要 21 元', 6, 'ans', 21, ['先求 1 支多少元。', '单价 = 12 ÷ 4 = 3。', '3 × 7 = 21。'])],
    goal: ['ans'],
    why: '先求“一份”是多少（单价 12 ÷ 4 = 3 元），再求 7 份（3 × 7 = 21 元）。这就是归一：先归到 1，再去求别的。',
  });
  U.problems.push.apply(U.problems, P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
