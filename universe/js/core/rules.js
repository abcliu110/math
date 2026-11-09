/* 规则登记（来历追踪用）：每个值是怎么算出来的，由器材在 compute 里用 c.step / c.because 说出来，
 * 规则 id 统一在这里登记。判分、报告、解释都按 rule id 聚合。
 * U.RULES[id] = { label, essence: ['E4'], grade: [低, 高] }
 * 器材引用了没登记的 rule，会记入 U.ruleErrors，测试会检查。 */
(function (G) {
  'use strict';
  const U = G.U;

  U.RULES = {};
  U.ruleErrors = [];
  U.defineRule = (id, def) => { U.RULES[id] = Object.assign({ essence: [], grade: [1, 9] }, def); return U.RULES[id]; };

  const R = U.defineRule;
  // 分数与四则运算
  R('frac.add', { label: '分母相同，分子相加', essence: ['E3', 'E2'], grade: [3, 6] });
  R('frac.common-denominator', { label: '通分：化成同样大小的份', essence: ['E3'], grade: [5, 6] });
  R('frac.simplify', { label: '约分：分子分母同时除以公因数', essence: ['E3'], grade: [5, 6] });
  R('op.sub', { label: '减法：拿走一部分', essence: ['E2'], grade: [1, 6] });
  R('op.mul', { label: '乘法：几个几相加', essence: ['E2'], grade: [2, 6] });
  R('op.div', { label: '除法：平均分，或看里面有几个', essence: ['E2'], grade: [2, 6] });
  // 位值与进位
  R('place.carry', { label: '满进位：这一位满了，向上一位进 1', essence: ['E2'], grade: [1, 4] });
  R('place.borrow', { label: '不够减：向上一位借 1', essence: ['E2'], grade: [1, 4] });
  // 除法
  R('div.trial-quotient', { label: '试商：先估一个商', essence: ['E2'], grade: [3, 5] });
  R('div.remainder-lt-divisor', { label: '余数一定比除数小', essence: ['E2'], grade: [3, 5] });
  // 平衡与等价
  R('balance.compare', { label: '两边比一比：差多少，哪边重', essence: ['E4'], grade: [1, 9] });
  R('eq.both-sides', { label: '两边同时做同一件事，等式不变', essence: ['E4'], grade: [5, 9] });
  // 图形
  R('fig.shoelace', { label: '鞋带公式：用坐标求多边形面积', essence: ['E2', 'E5'], grade: [6, 9] });
  R('tri.inequality', { label: '三角形任意两边之和大于第三边', essence: ['E2'], grade: [4, 7] });
  R('tri.pythagoras', { label: '勾股：两直角边的平方和等于斜边的平方', essence: ['E5'], grade: [8, 9] });
  // 兜底：器材没有更细的说法时用
  R('device.output', { label: '这台器材按它的规则算出的结果', essence: [], grade: [1, 9] });
})(typeof globalThis !== 'undefined' ? globalThis : window);
