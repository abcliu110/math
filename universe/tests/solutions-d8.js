/* D8 两道工作台示例题的参考解：用 h.wb(台面上的器材, 记号, [[工具, 参数]…]) 写进工作台的步骤。
 * 每一步都用内核（U.Digits、U.DataBench）检查，和界面点的是同一条路。 */
'use strict';
module.exports = {
  // 62 − 37：个位退位，写个位 5，写十位 2
  'place-sub'(h) {
    h.wb(h.role('竖式'), 'digits|{"op":"−","a":62,"b":37}', [['borrow', { col: 0 }], ['write', { col: 0, d: 5 }], ['write', { col: 1, d: 2 }]]);
  },
  // 录 4 组数据，画图，拟合
  'data-fit'(h) {
    h.wb(h.role('图表'), 'data|{}', [
      ['row', { x: '1', y: '58' }], ['row', { x: '2', y: '121' }], ['row', { x: '3', y: '179' }], ['row', { x: '4', y: '242' }],
      ['plot', {}], ['fit', {}],
    ]);
  },
};
