/* 对称：折纸。折痕穿过中心，两半才可能重合。 */
(function (G) {
  'use strict';
  const U = G.U, mk = U.mkScene, P = [];
  const sheet = (props) => mk({ ents: [{ type: 'fold', x: 80, y: 60, role: 'f', props }] });
  // 折一次之后，两半是否重合；pred 检查折痕参数
  const halvesMatch = (pred) => (w) => w.some('fold', (e, d) => d && d.out && d.out.same && d.out.same.data.n === 1 && pred(e.props));
  const folded = (pred) => (w) => w.some('fold', (e, d) => e.props.fold === 1 && pred(e.props, d));

  P.push({
    id: 'fold-square-half', essence: ['E10'], title: '正方形纸对折，怎样折两半才完全重合？', grade: 3, domain: '图形', points: ['8.3'], topics: ['对折', '对称轴'],
    alias: ['对折', '对称', '折痕'], hook: '一张正方形纸，沿一条直线折一次。把「折不折」改成折一次，再调折痕的方向，让两半完全重合（same=1）。',
    shelf: ['fold', 'compare'],
    build: sheet({ w: 6, ht: 6, fold: 0, angle: 30, offset: 0 }),
    predict: { q: '先猜：哪种折法，两半能完全重合？', options: [{ v: 0, label: '斜着乱折' }, { v: 1, label: '沿中线折' }, { v: 2, label: '折痕离中心很远' }], reveal: () => ({ v: 1, label: '沿中线折（过中心的对称轴）' }) },
    milestones: [
      { id: 'fold', say: '把纸折一次', score: 3, when: (w) => w.some('fold', (e) => e.props.fold === 1), hints: ['属性「折不折」。', '选「折一次」。', 'fold 改成折一次。'] },
      { id: 'half', say: '两半完全重合（same=1）', score: 7, when: halvesMatch((p) => p.offset === 0 && (p.angle === 0 || p.angle === 90)), hints: ['折痕要穿过纸的中心：离中心 0。', '方向选水平（0°）或竖直（90°）。', '角度改成 90，same 变成 1。'] },
    ],
    traps: [], why: '沿过中心的对称轴折，两半的形状和大小一样，正好能叠合：这就是对称。折痕离开中心，两半的面积就不等，怎么折也对不齐。', ref: ['fold|0'],
  });

  P.push({
    id: 'fold-diagonal', essence: ['E10', 'E5'], title: '正方形沿对角线折，两半也重合吗？', grade: 6, domain: '图形', points: ['7.9', '8.3', '8.2'], topics: ['对角线', '对称', '全等三角形'],
    alias: ['对角线', '对称'], hook: '先在 30° 的折痕上折一次，看两半对不对得上；再找一个角度，让正方形的两半完全重合。',
    shelf: ['fold', 'compare'],
    build: sheet({ w: 6, ht: 6, fold: 0, angle: 30, offset: 0 }),
    predict: { q: '先猜：正方形沿对角线对折，两半重合吗？', options: [{ v: 0, label: '不重合' }, { v: 1, label: '重合' }], reveal: () => ({ v: 1, label: '重合：两半是两个全等的等腰直角三角形' }) },
    milestones: [
      { id: 'wrong', say: '30° 折一次：same=0', score: 3, when: folded((p, d) => p.angle === 30 && d.out.same.data.n === 0), hints: ['把「折不折」改成折一次。', '角度先设成 30°。', '两半对不齐，same 是 0。'] },
      { id: 'diag', say: '折痕 45°（对角线）：same=1', score: 7, when: halvesMatch((p) => p.angle === 45 && p.offset === 0), hints: ['折痕还是要过中心。', '正方形的对角线方向是 45°。', '角度改成 45，same 变成 1。'] },
    ],
    traps: [], why: '正方形沿对角线折，两个直角三角形全等，两半重合。对角线两边对称，这是“同样的结构换个位置”。30° 的折痕不过对称轴，两半对不上。', ref: ['fold|0'],
  });

  U.problems.push(...P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
