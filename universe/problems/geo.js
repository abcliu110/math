/* 几何构造原型的两道示例题：辅助线、剪切、移动、拼合（粘贴）。
 * 判分只看台面的构造和性质：作没作中点 / 高，剪开后面积是否相等，摆好后是否正好拼成目标。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World, F = U.Fig;

  // 开场台面：一个几何工作区，里面放着几个带角色的自由点和它们围成的多边形（点和图形都画在工作区里，不是卡片）
  function board(points, extra) {
    const s = W.blank(), ids = {};
    const ws = W.add(s, 'gworkspace', 0, 0, { title: '几何工作区' }); s.entities[ws].role = '工作区';
    const put = (id) => W.act(s, { t: 'put', id, parent: ws, slot: 'items' });
    for (const [role, x, y] of points) { const id = W.add(s, 'gpt', 0, 0, { x, y, mark: role }); s.entities[id].role = role; ids[role] = id; put(id); }
    const poly = W.add(s, 'gpoly', 0, 0, {}); s.entities[poly].role = '图形';
    for (const [role] of points) W.act(s, { t: 'link', from: ids[role], fromPort: 'p', to: poly, toPort: 'pts' });
    put(poly);
    if (extra) extra(s, ids, ws, put);
    W.act(s, { t: 'tidy' });
    return s;
  }
  const areaOf = (w, e, port) => { const v = w.out(e, port); return v && v.kind === 'fig' ? F.area(v.data) : null; };

  U.problems.push(
    {
      id: 'geo-median-area', workbench: 'geometry', essence: ['E2', 'E5'], title: '三角形的中线把面积分成两半吗？', grade: 5, domain: '图形与几何',
      points: ['5.6'], level: 'core', rung: 3, alias: ['中线', '辅助线', '剪开', '面积'],
      hook: '从顶点 A 连到对边 BC 上的一点，把三角形剪成两块。连到哪里，两块面积才正好相等？',
      shelf: ['gmid', 'gseg', 'gcut', 'gfoot', 'gint', 'gboard', 'figmeasure'],
      build: () => board([['A', 0, 0], ['B', 6, 0], ['C', 2, 4]]),
      predict: { q: '沿 A 和 BC 中点的连线剪开，两块面积怎样？', options: [{ v: 'eq', label: '一样大' }, { v: 'left', label: '靠 B 的大' }, { v: 'right', label: '靠 C 的大' }], answer: 'eq' },
      milestones: [
        { id: 'mid', say: '作出 BC 的中点', score: 3, glow: ['gmid'],
          when: { built: { rule: 'geo.midpoint', of: ['B', 'C'] } },
          hints: ['先找 BC 的正中间。', '用「中点」器材，把 B、C 两个点接进去。', '中点的两个输入口分别接 B 和 C。'] },
        { id: 'cut', say: '沿中线剪开，两块面积相等', score: 4, glow: ['gseg', 'gcut'], why_code: '要比较剪刀两个输出块的面积',
          test: (w) => w.ofType('gcut').some((e) => { const a = areaOf(w, e, 'a'), b = areaOf(w, e, 'b'); return a && b && U.KINDS.real.eq(a, b); }),
          hints: ['从 A 连到中点，就是一条中线。', '「连线」接 A 和中点，再把线接进「剪刀」的“沿这条线剪”。', '剪刀的图形口接三角形，切线口接中线。'] },
      ],
      traps: [{ id: 'notmid', wrong: '只有过对边中点的线才能把面积平分：两块等底同高', why_code: '要比较剪刀两个输出块的面积',
        test: (w) => w.ofType('gcut').some((e) => { const a = areaOf(w, e, 'a'), b = areaOf(w, e, 'b'); return a && b && !U.KINDS.real.eq(a, b); }) }],
      goal: ['mid', 'cut'],
      why: '两块三角形的底都是 BC 的一半，高都是 A 到 BC 的距离，所以面积相等。拖动 A、B、C 试试：只要是中线，两块永远一样大。',
    },
    {
      id: 'geo-pgram-cut', workbench: 'geometry', essence: ['E5', 'E2'], title: '平行四边形剪一刀，拼成长方形', grade: 5, domain: '图形与几何',
      points: ['5.6'], level: 'core', rung: 3, alias: ['平行四边形', '剪拼', '高', '移动', '粘贴'],
      hook: '沿着一条高把平行四边形剪开，把剪下的那块移过去，能不能正好拼成右边的长方形？',
      shelf: ['gseg', 'gfoot', 'gcut', 'gplace', 'gasm', 'gboard', 'figmeasure'],
      build: () => board([['A', 0, 0], ['B', 5, 0], ['C', 7, 3], ['D', 2, 3]], (s, ids, ws, put) => {
        const t = W.add(s, 'fquad', 0, 0, { ax: 2, ay: 0, bx: 7, by: 0, cx: 7, cy: 3, dx: 2, dy: 3 }); s.entities[t].role = '目标长方形';
        put(t);
      }),
      milestones: [
        { id: 'height', say: '从 D 作 AB 的垂线（高）', score: 3, glow: ['gseg', 'gfoot'],
          when: { built: { rule: 'geo.foot', of: ['D', 'seg(A,B)'] } },
          hints: ['剪的地方要和底边垂直。', '先「连线」连出 AB，再用「垂足」：点接 D，线接 AB。', '垂足的“垂线段”输出就是高。'] },
        { id: 'cut', say: '沿高剪开', score: 2, glow: ['gcut'], why_code: '要看剪刀有没有剪出两块',
          test: (w) => w.ofType('gcut').some((e) => !!w.out(e, 'a')),
          hints: ['把平行四边形和高接进剪刀。', '剪刀的图形口接平行四边形，切线口接高。', '高来自垂足的“垂线段”输出。'] },
        { id: 'fit', say: '移动后正好拼成长方形', score: 5, glow: ['gplace', 'gasm'], why_code: '要读拼合检查的结果',
          test: (w) => w.ofType('gasm').some((e) => { const v = w.out(e, 'ok'); return !!(v && v.data === true); }),
          hints: ['剪下的小三角形要挪到另一边。', '选中小三角形，向右移底边那么长（移动工具或拖动）。', '先选「目标长方形」，再选两块，用「对齐到目标」，看它报不报拼对。', '向右移 5 格（底边 AB 的长）。'] },
      ],
      traps: [],
      goal: ['height', 'cut', 'fit'],
      why: '剪下来的三角形只是换了位置，面积没变，所以平行四边形的面积 = 长方形的面积 = 底 × 高。形状变了，周长也变了，但面积是不变量。',
    },
  );
})(typeof globalThis !== 'undefined' ? globalThis : window);
