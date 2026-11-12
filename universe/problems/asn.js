/* 总是 / 有时 / 从不 的题（docs/new-instruments.md 4.3）：一句话，造例子去检验，再判断它总是对、有时对、还是从不对。
 * 开场一个例子都没试，判断也没选，里程碑都要学生自己做出来。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const as = (id) => () => { const s = W.blank(); const e = W.add(s, 'asn', 60, 60, { claim: U.RuleLib.claims().findIndex((c) => c.id === id) }); s.entities[e].role = 'a'; return s; };
  const ms = (id, say, score, port, op, value, hints) => ({ id, say, score, when: { role: 'a', port, op, value: String(value) }, hints });
  const P = [];
  const base = { domain: '关系', level: 'core', shelf: ['asn'], predict: null, traps: [] };
  const three = (a, b, c) => [
    ms('tests', '试了 5 个例子', 2, 'tests', '>=', 5, a),
    ms('counter', '找到了一个反例', 3, 'counter', '>=', 1, b),
    ms('ok', '判断对了，而且有依据', 5, 'ok', '=', 1, c),
  ];

  P.push(Object.assign({}, base, {
    id: 'asn-mul-bigger', essence: ['E9', 'E8'], title: '乘出来的数，一定比原来大吗？', grade: 4, rung: 3, points: ['4.9'],
    topics: ['总是有时从不', '反例', '乘法'], alias: ['总是有时从不', '反例', '乘法', '举例'],
    hook: '“一个数乘以另一个整数，结果比原来大。”两个数都在 1 到 6 里取，第二个数还可以是 0。造例子试试：它总是对、有时对，还是从不对？',
    build: as('c.mul-bigger'),
    milestones: three(['在右边“例子”里写一对数，比如 3,2。', '试几个，再试一个“× 0”和“× 1”。', '写 3,0 和 3,1。']),
    goal: ['ok'],
    why: '“有时”：3×2=6 比 3 大，3×1=3 不比 3 大，3×0=0 比 3 小。只要有一个反例，“总是”就不成立；只要有一个成立的例子，“从不”也不成立。',
  }));
  P.push(Object.assign({}, base, {
    id: 'asn-sq', essence: ['E9', 'E8'], title: 'n × n 不小于 n？整数和分数不一样', grade: 5, rung: 3, points: ['5.8'],
    topics: ['总是有时从不', '反例', '分数'], alias: ['总是有时从不', '反例', '平方', '分数'],
    hook: '“n × n 不小于 n。”这句话里 n 可以是分数。造例子试：它总是对、有时对，还是从不对？别只试整数。',
    build: as('c.sq-ge-rat'),
    milestones: three(['写一个数，整数或分数都行。', '试试比 1 小的分数。', '写 1/2：1/2 × 1/2 = 1/4，比 1/2 小。']),
    goal: ['ok'],
    why: '整数时 n×n ≥ n 总是对的；但分数 1/2 × 1/2 = 1/4 < 1/2，所以放宽到分数后，是“有时”。一句话在多大的范围里说，会改变答案。',
  }));
  P.push(Object.assign({}, base, {
    id: 'asn-perim', essence: ['E9', 'E8'], title: '周长相等，面积也相等吗？', grade: 3, rung: 3, points: ['3.12'],
    topics: ['总是有时从不', '周长', '面积'], alias: ['总是有时从不', '周长面积', '长方形', '反例'],
    hook: '“周长是 24 厘米的长方形，面积是 36 平方厘米。”长和宽都是整数厘米，写“长,宽”。它总是对、有时对，还是从不对？',
    build: as('c.perim24-area36'),
    milestones: three(['长 + 宽 = 12。写一对数，比如 6,6。', '再试一对不是 6,6 的。', '写 4,8：面积是 32。']),
    goal: ['ok'],
    why: '长 6 宽 6 时面积是 36；长 4 宽 8 时面积是 32，不是 36。周长一样，面积会不一样：是“有时”。',
  }));
  P.push(Object.assign({}, base, {
    id: 'asn-n2n41', essence: ['E9', 'E8'], title: 'n × n + n + 41 总是质数？', grade: 7, rung: 4, points: ['7.1'],
    topics: ['总是有时从不', '反例', '质数', '举例不是证明'], alias: ['总是有时从不', '反例', '质数', '欧拉'],
    hook: '“n × n + n + 41 总是质数。”n 从 1 到 100。n 取 1 是 43，取 2 是 47，取 3 是 53……都是质数。你的判断呢？',
    build: as('c.n2n41'),
    milestones: three(['试几个 n，再试大一点的 n。', '把 n 取成 40 试试。', '40×40+40+41 = 1681 = 41×41，不是质数。']),
    goal: ['ok'],
    why: 'n = 40 时，值是 1681 = 41 × 41，不是质数。前面 39 个全是质数，也救不了“总是”；一个反例就够推翻。',
  }));
  for (const p of P) U.problems.push(p);
})(typeof globalThis !== 'undefined' ? globalThis : window);
