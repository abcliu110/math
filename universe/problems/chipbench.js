/* “正负数（零对）”的题。全部在台面上点按钮完成：放进、拿走、放零对、消零对、翻过来、每份发一个。
 * 判分只看器材的输出（零对消掉以后的结果）。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const zb = (props) => () => { const s = W.blank(); const id = W.add(s, 'chipbench', 40, 50, props); s.entities[id].role = 'z'; return s; };
  const P = [];
  const base = { domain: '数与运算', level: 'core', shelf: ['chipbench'], traps: [], predict: null };
  const add = (o) => P.push(Object.assign({}, base, o));
  const ms = (id, say, score, port, value, hints) => ({ id, say, score, when: { role: 'z', port, op: '=', value: String(value) }, hints });

  add({
    id: 'zp-neg2-plus5', essence: ['E3', 'E2'], title: '(−2) + 5：一对一对抵消', grade: 7, rung: 2, points: ['7.1'],
    topics: ['有理数加法', '零对'], alias: ['有理数加法', '零对', '抵消'],
    hook: '台面上是 2 个 −1。放进 5 个 +1，一个 +1 和一个 −1 是一对零对。消掉零对，还剩什么？',
    build: zb({ mode: 0, op: 0, a: -2, b: 5, pos: 0, neg: 2 }),
    milestones: [ms('res', '(−2) + 5 = 3', 6, 'result', 3, ['点“放进 5 个 +1”。', '有 2 对零对：点“消掉一对”两次。', '剩 3 个 +1：3。'])],
    goal: ['res'],
    why: '每一对 +1 和 −1 合起来是 0，消掉不影响结果。2 个 −1 和 5 个 +1 配成 2 对，剩 3 个 +1。异号相加：大的减小的，符号跟绝对值大的。',
  });
  add({
    id: 'zp-3-minus-5', essence: ['E3', 'E2'], title: '3 − 5：不够拿怎么办', grade: 7, rung: 3, points: ['7.1'],
    topics: ['有理数减法', '零对'], alias: ['有理数减法', '零对', '减去一个大数'],
    hook: '台面上是 3 个 +1，要拿走 5 个 +1，可只有 3 个。放进零对不改变台面上的数——放几对，就够拿了？',
    build: zb({ mode: 0, op: 1, a: 3, b: 5, pos: 3, neg: 0 }),
    predict: { q: '3 − 5 等于几？', options: [{ v: '2', label: '2' }, { v: '-2', label: '−2' }, { v: '0', label: '不够减，没法算' }], answer: '-2' },
    milestones: [ms('res', '3 − 5 = −2', 6, 'result', -2, ['还差 2 个 +1：放进 2 对零对。', '再点“拿走 5 个 +1”。', '剩 2 个 −1：−2。'])],
    goal: ['res'],
    why: '放进 2 对零对，台面上还是 3，但有 5 个 +1 了。拿走 5 个 +1，剩下 2 个 −1：3 − 5 = −2。不够减并不是不能减，结果是负数。',
  });
  U.problems.push.apply(U.problems, P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
