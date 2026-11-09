/* 三视图题（观察物体、投影与视图）：用“三视图”器材，把积木的样子录入台面，再读出从前面、侧面、上面看到的。
 * 台面一开始是空的（全 0），学生按题目描述把积木录入 grid；里程碑从“不成立”变成“成立”才算达成。
 * 列表输出（前面、侧面、上面）用 test 函数判断，原因见 why_code：数据形式的 when 只能比一个数。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World, Q = U.Q;

  // 取三视图器材的某个输出：seq 变成数字数组，num 变成数
  const seqOf = (w, port) => { const e = w.ofType('views')[0]; const v = e ? w.out(e, port) : null; return v && v.kind === 'seq' ? v.data.map((x) => Q.num(x)) : null; };
  const same = (a, b) => !!a && a.length === b.length && a.every((x, i) => x === b[i]);
  const empty = (s) => { const id = W.add(s, 'views', 80, 80, { grid: '0,0;0,0' }); s.entities[id].role = 'v'; return s; };

  // ---------------- 2.6 观察物体（二年级）----------------
  U.problems.push({
    id: 'vw-front-core', title: '从前面看这堆积木，是什么样子？', grade: 2, domain: '图形', essence: ['E2'], points: ['2.6'], level: 'core', rung: 1,
    alias: ['观察物体', '从前面看', '前面', '积木', '三视图'], hook: '一堆积木排成两排：前排是 1 块、2 块，后排是 1 块、1 块。从前面看，每一列要看最高的那一叠。台面上先是空的，把积木录入“积木”属性（每行一排，行之间用分号）。',
    shelf: ['views'],
    build() { return empty(W.blank()); },
    predict: null,
    milestones: [
      { id: 'stack', say: '录入 5 块积木：1,2;1,1', score: 2, when: { type: 'views', port: 'total', op: '=', value: '5' },
        hints: ['先数一数：一共有几块积木？', '接一台三视图，在“积木”里按排录入每个位置的块数。', '第一排 1,2，第二排 1,1，行之间用分号隔开。'] },
      { id: 'front', say: '从前面看：第一列 1，第二列 2', score: 4, why_code: '列表输出，数据形式的 when 只能比一个数',
        test: (w) => same(seqOf(w, 'front'), [1, 2]),
        hints: ['从前面看，每一列只能看见最高的那一叠。', '看“从前面看”的输出，列数要和积木的列数一样。', '第一列最高是 1，第二列最高是 2，应该得到 1、2。'] },
    ],
    traps: [],
    goal: ['stack', 'front'],
    why: '从前面看，每一列只能看见最高的那一叠：第一列的两块都是 1，最高是 1；第二列是 2 和 1，最高是 2。所以前面看是 1、2，不是把每列的块数加起来。',
  });

  U.problems.push({
    id: 'vw-front-trap', title: '从前面看：每一列要加起来，还是只看最高的？', grade: 2, domain: '图形', essence: ['E2'], points: ['2.6'], level: 'trap', rung: 1,
    alias: ['观察物体', '从前面看', '最高', '相加'], hook: '第一列有两块，叠起来高 3 和 1。从前面看，这一列是看“叠了几块”，还是看“最高的那一块有多高”？台面先是空的，把积木录入“积木”属性。',
    shelf: ['views'],
    build() { return empty(W.blank()); },
    predict: null,
    milestones: [
      { id: 'stack', say: '录入 6 块积木：3,1;1,1', score: 2, when: { type: 'views', port: 'total', op: '=', value: '6' },
        hints: ['第一列的上下两排分别是 3 和 1，第二列是 1 和 1。', '接一台三视图，把积木录入“积木”。', '第一排 3,1，第二排 1,1。'] },
      { id: 'front', say: '从前面看：第一列 3，第二列 1', score: 4, why_code: '列表输出，数据形式的 when 只能比一个数',
        test: (w) => same(seqOf(w, 'front'), [3, 1]),
        hints: ['从前面看，要比较的是每一列的高，不是把它们加起来。', '看“从前面看”的输出，每一列只留最大的数。', '第一列的最大是 3，第二列的最大是 1，应该得到 3、1。'] },
    ],
    traps: [
      { id: 'front-sum', wrong: '从前面看时把每一列的块数加起来（得到 4、2），而不是只看最高的', why_code: '列表输出，数据形式的 when 只能比一个数',
        test: (w) => same(seqOf(w, 'front'), [4, 2]) },
    ],
    goal: ['stack', 'front'],
    why: '从前面看，每一列只看最高的那一叠。第一列 3 和 1 最高是 3，第二列 1 和 1 最高是 1，所以是 3、1。把块数加起来（4、2）是把所有块都算上，不是前面看到的样子。',
  });

  // ---------------- 4.17 观察物体（二）：侧面看 ----------------
  U.problems.push({
    id: 'vw-side-core', title: '从侧面看组合体：每一排看最高的', grade: 4, domain: '图形', essence: ['E2'], points: ['4.17'], level: 'core', rung: 2,
    alias: ['观察物体', '从侧面看', '侧面', '组合体'], hook: '组合体有两排：第一排是 2 块和 0 块，第二排是 1 块和 3 块。从侧面看，每一排看最高的那一叠。台面先是空的，把积木录入“积木”属性。',
    shelf: ['views'],
    build() { return empty(W.blank()); },
    predict: null,
    milestones: [
      { id: 'stack', say: '录入 6 块积木：2,0;1,3', score: 2, when: { type: 'views', port: 'total', op: '=', value: '6' },
        hints: ['两排一共有几块？', '接一台三视图，按排录入“积木”。', '第一排 2,0，第二排 1,3。'] },
      { id: 'side', say: '从侧面看：第一排 2，第二排 3', score: 4, why_code: '列表输出，数据形式的 when 只能比一个数',
        test: (w) => same(seqOf(w, 'side'), [2, 3]),
        hints: ['从侧面看，每一排只看最高的那一叠。', '看“从侧面看”的输出，每一排一个数。', '第一排最高是 2，第二排最高是 3，应该得到 2、3。'] },
    ],
    traps: [],
    goal: ['stack', 'side'],
    why: '从侧面看，每一排只看最高的一叠：第一排是 2 和 0，最高 2；第二排是 1 和 3，最高 3。所以侧面看是 2、3。',
  });

  U.problems.push({
    id: 'vw-side-trap', title: '从侧面看：是数有几排，还是看每排的高？', grade: 4, domain: '图形', essence: ['E2'], points: ['4.17'], level: 'trap', rung: 2,
    alias: ['观察物体', '从侧面看', '排', '最高'], hook: '组合体有两排：第一排是 3 块和 0 块，第二排是 2 块和 2 块。从侧面看，要数“有几排”，还是看每一排的高？台面先是空的，把积木录入“积木”属性。',
    shelf: ['views'],
    build() { return empty(W.blank()); },
    predict: null,
    milestones: [
      { id: 'stack', say: '录入 7 块积木：3,0;2,2', score: 2, when: { type: 'views', port: 'total', op: '=', value: '7' },
        hints: ['两排一共有几块？', '接一台三视图，按排录入“积木”。', '第一排 3,0，第二排 2,2。'] },
      { id: 'side', say: '从侧面看：第一排 3，第二排 2', score: 4, why_code: '列表输出，数据形式的 when 只能比一个数',
        test: (w) => same(seqOf(w, 'side'), [3, 2]),
        hints: ['从侧面看，每一排看的是最高的那一叠，不是排数。', '看“从侧面看”的输出，每排一个数。', '第一排最高 3，第二排最高 2，应该得到 3、2。'] },
    ],
    traps: [
      { id: 'side-row-count', wrong: '只数有几排（得到 1、1），没有看每排的高', why_code: '列表输出，数据形式的 when 只能比一个数',
        test: (w) => same(seqOf(w, 'side'), [1, 1]) },
    ],
    goal: ['stack', 'side'],
    why: '侧面看每一排只看最高的一叠。第一排 3 和 0 最高 3，第二排 2 和 2 最高 2，所以是 3、2。只数排数（1、1）丢掉了每排的高度。',
  });

  // ---------------- 5.14 观察物体（三）：上面看 ----------------
  U.problems.push({
    id: 'vw-top-core', title: '从上面看：看得见几个正方形？', grade: 5, domain: '图形', essence: ['E2'], points: ['5.14'], level: 'core', rung: 2,
    alias: ['观察物体', '从上面看', '俯视', '正方形'], hook: '两块积木分别在左上和右下，其余位置没有积木。从上面看，有积木的位置都是一个正方形。台面先是空的，把积木录入“积木”属性。',
    shelf: ['views'],
    build() { return empty(W.blank()); },
    predict: null,
    milestones: [
      { id: 'stack', say: '录入 2 块积木：1,0;0,1', score: 2, when: { type: 'views', port: 'total', op: '=', value: '2' },
        hints: ['两块积木分别在哪两个位置？', '接一台三视图，按排录入“积木”。', '第一排 1,0，第二排 0,1。'] },
      { id: 'top', say: '从上面看：有积木的位置各一个正方形', score: 4, why_code: '列表输出，数据形式的 when 只能比一个数',
        test: (w) => same(seqOf(w, 'top'), [1, 0, 0, 1]),
        hints: ['从上面看，只看每个位置有没有积木。', '看“从上面看”的输出，按排展开，有积木记 1，没有记 0。', '应该得到 1、0、0、1，一共 2 个正方形。'] },
    ],
    traps: [],
    goal: ['stack', 'top'],
    why: '从上面看，每个位置有积木就是一个正方形。左上和右下各有一块，所以看得见 2 个正方形，按排展开是 1、0、0、1。',
  });

  U.problems.push({
    id: 'vw-top-trap', title: '从上面看：高 3 的一叠，上面只算一个正方形吗？', grade: 5, domain: '图形', essence: ['E2'], points: ['5.14'], level: 'trap', rung: 2,
    alias: ['观察物体', '从上面看', '高度', '叠'], hook: '左上角是一叠 3 块，右下角是 1 块。从上面看，左上角那一叠要数几个正方形？台面先是空的，把积木录入“积木”属性。',
    shelf: ['views'],
    build() { return empty(W.blank()); },
    predict: null,
    milestones: [
      { id: 'stack', say: '录入 4 块积木：3,0;0,1', score: 2, when: { type: 'views', port: 'total', op: '=', value: '4' },
        hints: ['左上角一叠是 3 块，右下角是 1 块。', '接一台三视图，按排录入“积木”。', '第一排 3,0，第二排 0,1。'] },
      { id: 'top', say: '从上面看：左上一个，右下一个', score: 4, why_code: '列表输出，数据形式的 when 只能比一个数',
        test: (w) => same(seqOf(w, 'top'), [1, 0, 0, 1]),
        hints: ['从上面看，一叠不管多高，只能看见顶上一个正方形。', '看“从上面看”的输出，有积木记 1，不论高矮。', '应该得到 1、0、0、1，只有 2 个正方形。'] },
    ],
    traps: [
      { id: 'height-as-square', wrong: '把高度也当成正方形数（得到 3、0、0、1），高 3 的一叠看成三个正方形', why_code: '列表输出，数据形式的 when 只能比一个数',
        test: (w) => same(seqOf(w, 'top'), [3, 0, 0, 1]) },
    ],
    goal: ['stack', 'top'],
    why: '从上面看，一叠积木只能看见最上面一个正方形，不论有几层高。左上 3 块仍然只算 1 个，右下 1 块算 1 个，一共看见 2 个。',
  });

  // ---------------- 9.16 投影与视图（九年级）----------------
  U.problems.push({
    id: 'vw-total-core', title: '2×2 的积木一共有几块？', grade: 9, domain: '图形', essence: ['E2'], points: ['9.16'], level: 'core', rung: 3,
    alias: ['投影', '视图', '块数', '三视图'], hook: '一个 2 行 2 列的立方体组合，每个位置都堆了 2 块。三视图只能看到外形，要算出总块数，需要把每个位置的块数加起来。台面先是空的，把积木录入“积木”属性。',
    shelf: ['views'],
    build() { return empty(W.blank()); },
    predict: null,
    milestones: [
      { id: 'stack', say: '录入 8 块积木：2,2;2,2', score: 2, when: { type: 'views', port: 'total', op: '=', value: '8' },
        hints: ['每个位置堆了几块？一共有几个位置？', '接一台三视图，按排录入“积木”。', '两排都是 2,2，一共 8 块。'] },
    ],
    traps: [],
    goal: ['stack'],
    why: '每个位置堆了 2 块，有 4 个位置，总块数是 2 × 4 = 8。三视图看到的正方形只有 4 个，不等于积木数。',
  });

  U.problems.push({
    id: 'vw-total-trap', title: '看得见的面数，等于积木块数吗？', grade: 9, domain: '图形', essence: ['E2'], points: ['9.16'], level: 'trap', rung: 3,
    alias: ['投影', '视图', '块数', '面'], hook: '一个 2×2 的组合，左上 2 块，右上 1 块，左下 1 块，右下 2 块。从上面看能看见 4 个正方形，那积木一共有几块？台面先是空的，把积木录入“积木”属性。',
    shelf: ['views'],
    build() { return empty(W.blank()); },
    predict: null,
    milestones: [
      { id: 'stack', say: '录入 6 块积木：2,1;1,2', score: 2, when: { type: 'views', port: 'total', op: '=', value: '6' },
        hints: ['每个位置各堆了几块？把它们都加起来。', '接一台三视图，按排录入“积木”。', '第一排 2,1，第二排 1,2，一共 6 块。'] },
    ],
    traps: [
      { id: 'visible-as-total', wrong: '把从上面看见的 4 个正方形当成积木数（得到 4 块）', why_code: '这个判断需要对比两个数，数据形式的 when 不能写“两个数相等”',
        test: (w) => { const e = w.ofType('views')[0]; const t = e ? w.num(e, 'total') : null; const top = seqOf(w, 'top'); return t !== null && top !== null && t === top.reduce((a, b) => a + b, 0); } },
    ],
    goal: ['stack'],
    why: '积木数是每个位置堆的块数加起来：2+1+1+2 = 6。从上面看见的 4 个正方形只说明有积木的位置有 4 个，不是积木数。',
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
