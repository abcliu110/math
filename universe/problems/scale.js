/* 缩放对比和影子测高的题（docs/new-instruments.md 6.9）。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const mk = (type, props, role) => () => { const s = W.blank(); const id = W.add(s, type, 60, 60, props); s.entities[id].role = role; return s; };
  const P = [];
  const add = (o) => P.push(Object.assign({ domain: '图形', level: 'core', predict: null, traps: [] }, o));
  const ms = (role, id, say, score, port, op, value, hints) => ({ id, say, score, when: { role, port, op, value: String(value) }, hints });
  add({
    id: 'sc-area', essence: ['E3', 'E12', 'E5'], title: '边长放大 2 倍，面积放大几倍？', grade: 6, rung: 3, points: ['6.12'], shelf: ['scale'], build: mk('scale', { shape: 0, k: '1' }, 's'),
    topics: ['图形的放大与缩小', '面积比'], alias: ['放大', '缩小', '面积比', '图形的放大与缩小'],
    hook: '长方形的每条边放大 2 倍。先猜：面积是原来的几倍？再看读数，用原来大小的小方格铺一铺。再试 3 倍、3/2 倍。',
    milestones: [ms('s', 'two', '放大 2 倍：面积是 4 倍', 4, 'area', '=', 4, ['把 k 改成 2。', '用小方格铺满大长方形：每边 2 倍，横着 2 个、竖着 2 个。', '2 × 2 = 4。']), ms('s', 'half', '放大 3/2 倍：面积是 9/4 倍', 4, 'area', '=', '9/4', ['k 可以是分数。', '面积比是 k 的平方。', '(3/2)² = 9/4。'])],
    goal: ['two', 'half'], why: '边长 × k，长和宽都 × k，面积 × k × k = k²：不是 k 倍。用小方格铺满，k = 2 时横着 2 个、竖着 2 个，共 4 个。',
  });
  add({
    id: 'sc-cube', essence: ['E3', 'E12', 'E5'], title: '正方体放大 2 倍：体积放大几倍？', grade: 9, rung: 4, points: ['9.12'], shelf: ['scale'], build: mk('scale', { shape: 2, k: '1' }, 's'),
    topics: ['相似', '面积比', '体积比'], alias: ['相似比', '体积比', '放大', '立方'],
    hook: '立方体每条棱放大 2 倍。周长（棱长）、面积、体积各是原来的几倍？先猜面积，再看。',
    milestones: [ms('s', 'vol', '放大 2 倍：体积是 8 倍', 6, 'vol', '=', 8, ['把 k 改成 2。', '体积是 k 的几次方？', '2 × 2 × 2 = 8。'])],
    goal: ['vol'], why: '相似比是 k：线段比 k，面积比 k²，体积比 k³。',
  });
  add({
    id: 'sh-tree', essence: ['E3', 'E12', 'E5'], title: '用影子量树高', grade: 6, rung: 3, points: ['6.12'], shelf: ['shadow'], build: mk('shadow', { pole: 2, tree: 8, sun: 0 }, 'h'),
    topics: ['比例', '相似三角形', '影子测高'], alias: ['影子测高', '比例', '相似', '测高'],
    hook: '杆高 2 米，杆的影子和树的影子都量得到，树高量不到。先猜树高，再用比例算：杆高 ÷ 杆影 = 树高 ÷ 树影。换一个太阳的高度再量一次，比例变吗？',
    milestones: [ms('h', 'suns', '换了太阳高度，比例没变', 3, 'suns', '>=', 2, ['点上面的“高、中高、中低、低”。', '影子变长了，杆影 ÷ 树影变吗？', '至少看 2 个高度。']), ms('h', 'ok', '算对了：树高 8 米', 6, 'ok', '=', 1, ['杆高 ÷ 杆影 = 树高 ÷ 树影。', '树高 = 杆高 × 树影 ÷ 杆影。', '“我算出的树高”填 8。'])],
    goal: ['suns', 'ok'], why: '太阳光是平行的，杆和树都和地面垂直，所以两个三角形相似：杆高 ÷ 杆影 = 树高 ÷ 树影。无论太阳高低，比例不变：树高 = 2 × 树影 ÷ 杆影 = 8 米。',
  });
  for (const p of P) U.problems.push(p);
})(typeof globalThis !== 'undefined' ? globalThis : window);
