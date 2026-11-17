/* “折纸与对称”的题。拖折痕转、挪，点“折一下”看两半重合不重合。判分只看器材的输出。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const fb = (props) => () => { const s = W.blank(); const id = W.add(s, 'foldbench', 40, 50, props); s.entities[id].role = 'fd'; return s; };
  const P = [];
  const base = { domain: '图形', level: 'core', shelf: ['foldbench'], traps: [], predict: null };
  const add = (o) => P.push(Object.assign({}, base, o));
  const ms = (id, say, score, port, value, hints) => ({ id, say, score, when: { role: 'fd', port, op: '=', value: String(value) }, hints });

  add({
    id: 'fd-rect-axes', essence: ['E5', 'E7'], title: '长方形有几条对称轴？对角线是吗？', grade: 4, rung: 3, points: ['4.14'],
    topics: ['轴对称', '对称轴'], alias: ['对称轴', '长方形', '对角线'],
    hook: '把折痕转到各个方向，折一下试试。长方形的对角线是对称轴吗？一共找到几条？',
    build: fb({ shape: 1, angle: 30, off: 0 }),
    predict: { q: '长方形有几条对称轴？', options: [{ v: '2', label: '2 条' }, { v: '4', label: '4 条（加上两条对角线）' }], answer: '2' },
    milestones: [ms('all', '找全了：长方形有 2 条对称轴', 6, 'all', 1, ['横着、竖着对折都能重合。', '沿对角线折，两个角对不上。', '只有 2 条。'])],
    goal: ['all'],
    why: '长方形沿对角线折，长边和短边不一样长，角对不上：对角线不是对称轴。只有过两组对边中点的 2 条直线是对称轴；正方形四边一样长，才多出两条对角线，有 4 条。',
  });
  add({
    id: 'fd-pgram-none', essence: ['E5', 'E7'], title: '平行四边形有对称轴吗？', grade: 4, rung: 4, points: ['4.14'],
    topics: ['轴对称', '平行四边形'], alias: ['对称轴', '平行四边形', '中心对称'],
    hook: '平行四边形看起来很“整齐”。转着折痕多试几次：能找到一条让两半重合的折痕吗？找不到就点“它没有对称轴”。',
    build: fb({ shape: 4, angle: 90, off: 0 }),
    milestones: [ms('none', '平行四边形没有对称轴', 6, 'all', 1, ['竖着折：斜边对不上。', '沿对角线折也对不上。', '点“它没有对称轴”。'])],
    goal: ['none'],
    why: '一般的平行四边形，怎么折两半都对不齐，没有对称轴。但它绕中心转半圈能和自己重合，这叫中心对称。（菱形、长方形、正方形是特殊的平行四边形，才有对称轴。）',
  });
  U.problems.push.apply(U.problems, P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
