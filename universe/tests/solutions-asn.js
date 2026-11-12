/* 总是 / 有时 / 从不 题的参考解（problems/asn.js）。 */
'use strict';
// 通用：先造 5 个例子（有时：成立和不成立两边都有），再按真相判断
const go = (h) => {
  const a = h.role('a'), p = h.props(a), RL = h.U.RuleLib, c = RL.claims()[p.claim], T = RL.truth(c), pick = [];
  const take = (arr, n) => arr.slice(0, n).forEach((x) => pick.push(x));
  if (T.answer === '有时') { take(T.no, 1); take(T.yes, 4); } else take(c.space.items, 5);
  for (const x of pick.slice(0, 5)) h.set(a, 'ex', RL.show(c.domain, x));
  h.set(a, 'guess', { 总是: 1, 有时: 2, 从不: 3 }[T.answer]);
};
module.exports = { 'asn-mul-bigger': go, 'asn-sq': go, 'asn-perim': go, 'asn-n2n41': go };
