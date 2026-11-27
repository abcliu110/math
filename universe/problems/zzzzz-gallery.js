/* 解法图鉴（docs/knob-graph-and-gallery.md 第二节）：一页一道母题，每格一种做法，都用同一组数。
 * 一格对应一道题，那道题拿到星星就算点亮；两格都点亮了，中间的“桥”才能走（桥是一道把两种做法对起来的题）。
 * 第一页：鸡兔同笼，8 个头、26 条腿（兔 5 只、鸡 3 只）。选这组数是因为每台都放得下：两架天平每盘最多 30 个砝码。
 * 这一页里有四格用的是已有的题（换一换的假设、先假设全是兔、抬腿，两架天平），这里补三格（分步算式、方程、面积图）和两座桥。
 * 第二页：连加，1 + 2 + … + 7 = 28。选 7 是因为“移多补少”那台最多 8 堆，1 到 7 的平均正好是整数 4。四格：
 * 一个一个加、换个顺序凑 8（都在代数式操作台的“运算顺序”）、倒过来再写一行（高斯求和）、搬成一样高（平均数），两座桥。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const one = (type, props, role) => () => { const s = W.blank(); const id = W.add(s, type, 60, 50, props); s.entities[id].role = role; return s; };
  const R = (s, id, role) => { s.entities[id].role = role; return id; };
  const base = { domain: '关系', level: 'core', traps: [], predict: null, grade: 4, points: ['4.16'], essence: ['E7', 'E4'], topics: ['鸡兔同笼'], family: 'chick-rabbit' };
  const add = (o) => U.problems.push(Object.assign({}, base, o, { alias: ['鸡兔同笼', '解法图鉴'].concat(o.alias || []) }));
  const on = (role, port, value) => ({ role, port, op: '=', value: String(value) });

  // ---- 分步算式：运算器一台接一台 ----
  add({
    id: 'gal-cr-steps', way: 'steps', title: '鸡兔同笼 · 分步算式：8 个头、26 条腿', rung: 6, shelf: ['num', 'op'],
    hook: '8 个头、26 条腿，兔几只？这回不换动物，用运算器一步一步算：先当全是鸡，有几条腿？差几条？每只兔多几条？',
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 40, { n: 8 }), 'heads'); R(s, W.add(s, 'num', 60, 160, { n: 26 }), 'legs'); R(s, W.add(s, 'num', 60, 280, { n: 2 }), 'two'); return s; },
    milestones: [
      { id: 'all', say: '全是鸡：16 条腿', score: 2, when: { type: 'op', port: 'r', op: '=', value: '16' }, hints: ['8 只鸡有几条腿？', '头数 × 2。', '放一台运算器，甲接 8，乙接 2，运算选 ×。'] },
      { id: 'gap', say: '差 10 条腿', score: 2, when: { type: 'op', port: 'r', op: '=', value: '10' }, hints: ['实际 26 条，比 16 多几条？', '26 − 16。', '再放一台运算器，甲接 26，乙接第一台的结果，运算选 −。'] },
      { id: 'rabbit', say: '兔 5 只', score: 4, when: { type: 'op', port: 'r', op: '=', value: '5' }, hints: ['每把一只鸡换成兔，多 2 条腿。', '差的 10 条要除以 2。', '再放一台运算器，运算选 ÷。'] },
    ],
    goal: ['rabbit'],
    why: '8 × 2 = 16（全是鸡的腿），26 − 16 = 10（差的腿），10 ÷ 2 = 5（每只兔多 2 条）。三步算式，就是换一换台上“全是鸡、差几条、换几只”这三件事。',
  });

  // ---- 方程：设兔有 x 只 ----
  add({
    id: 'gal-cr-eq', way: 'eq', title: '鸡兔同笼 · 方程：设兔有 x 只', grade: 5, rung: 6, points: ['5.5'], shelf: ['balancebench'], topics: ['鸡兔同笼', '解简易方程'],
    hook: '8 个头、26 条腿。设兔有 x 只。8 只先都算 2 条腿，一共 16 条；每只兔再多 2 条，就是 2x。所以 2x + 16 = 26：左盘 2 个盒子和 16 个砝码，右盘 26 个砝码。盒子有多重？',
    build: one('balancebench', { lx: 2, lc: 16, rx: 0, rc: 26, x0: 5 }, 'b'),
    milestones: [{ id: 'solve', say: '盒子单独在一边：x = 5', score: 8, when: on('b', 'solved', 5), hints: ['先让左盘只剩盒子：两边各拿走 16 个砝码。', '剩下 2x = 10。', '两边都平分成 2 份：x = 5。'] }],
    traps: [{ id: 'tilt', wrong: '只动一边，天平就歪了。等式两边要做同样的事。', when: on('b', 'okn', 0) }],
    goal: ['solve'],
    why: '2x + 16 = 26，两边减 16 得 2x = 10，再平分得 x = 5。方程里的 16 就是“假设全是鸡”的 16 条腿，2x 就是兔多出来的腿：方程和假设法在算同一笔账。',
  });

  // ---- 面积图：头数是长，每只的腿数是宽 ----
  add({
    id: 'gal-cr-area', way: 'area', title: '鸡兔同笼 · 面积图：长是头数，宽是腿数', grade: 5, rung: 6, shelf: ['areamodel'],
    hook: '长方形的长是 8（8 个头），宽是 4（每只最多 4 条腿）：如果全是兔，面积 32。每只动物都有下面 2 条腿：从下往上数 2 格，横着切一刀。上面那一层只有兔才有：竖着切一刀，让上面左边那块正好是 26 − 16 = 10。',
    build: one('areamodel', { mode: 0, w: 8, h: 4, vcuts: '', hcuts: '' }, 'm'),
    milestones: [
      { id: 'legs2', say: '横着切在 2：下面一层是 8 × 2 = 16', score: 3, when: on('m', 'ch', 2), hints: ['每只都有的 2 条腿，是下面那一层。', '从左上角的 ✂ 往下拖，横着切。', '切在第 2 格。'] },
      { id: 'rabbit', say: '竖着切在 5：上面左边是 5 × 2 = 10，兔 5 只', score: 5, when: { all: [on('m', 'ch', 2), on('m', 'cv', 5)] }, hints: ['上面一层只有兔有，实际腿数 26，减去下面的 16，上面只要 10。', '宽是 2，10 是长几？', '竖着切在第 5 格。'] },
    ],
    goal: ['rabbit'],
    why: '面积 = 腿数。下面一层 8 × 2 = 16，是每只都有的 2 条腿；上面一层只有兔才有，宽 2，面积要 26 − 16 = 10，长就是 10 ÷ 2 = 5，所以兔 5 只。右上角空着的 3 × 2 是鸡没有的腿：32 − 6 = 26。',
  });

  // ---- 桥：带着一个“对一对”的问题，在另一台上再做一遍 ----
  add({
    id: 'gal-br-area', way: null, bridge: true, title: '桥 · 面积图和假设法：哪一块是“全是鸡”？', grade: 5, rung: 6, shelf: ['areamodel'],
    hook: '还是 8 个头、26 条腿。这回刀已经切好了：横着切在 2，竖着切在 5。先回答上面的问题，再把每一块和假设法里的一步对起来。最后把长方形的宽改成 2，看剩下的是什么。',
    build: one('areamodel', { mode: 0, w: 8, h: 4, vcuts: '5', hcuts: '2' }, 'm'),
    predict: { q: '下面那一层 8 × 2 = 16，是假设法里的哪一步？', options: [{ v: 'a', label: '假设全是鸡，有 16 条腿' }, { v: 'b', label: '兔的腿数' }, { v: 'c', label: '还差的腿数' }], answer: 'a' },
    milestones: [{ id: 'chick', say: '只留下面一层：8 × 2 = 16，就是“全是鸡”', score: 6, when: on('m', 'area', 16), hints: ['“全是鸡”就是每只都只有 2 条腿。', '把下边往上拖，宽改成 2。', '面积 16：正好是全是鸡的腿数。'] }],
    goal: ['chick'],
    why: '面积图的下面一层 = 假设全是鸡的 16 条腿；上面左边那块 10 = 还差的腿；它的长 5 = 换成兔的只数。两种做法每一步都对得上。',
  });
  add({
    id: 'gal-br-eq', way: null, bridge: true, title: '桥 · 方程和假设法：16 个砝码是什么？', grade: 5, rung: 6, points: ['5.5'], shelf: ['balancebench'], topics: ['鸡兔同笼', '解简易方程'],
    hook: '8 个头、26 条腿，写成 2x + 16 = 26。先回答上面的问题：左盘的 16 个砝码，在假设法里是什么？然后两边各拿走 16 个：剩下的 2x = 10，又是假设法里的哪一步？',
    build: one('balancebench', { lx: 2, lc: 16, rx: 0, rc: 26, x0: 5 }, 'b'),
    predict: { q: '左盘的 16 个砝码，在假设法里是什么？', options: [{ v: 'a', label: '假设全是鸡，8 只的腿' }, { v: 'b', label: '兔的腿' }, { v: 'c', label: '还差的腿' }], answer: 'a' },
    milestones: [
      { id: 'gap', say: '两边各拿走 16：剩 2x = 10，就是“还差 10 条”', score: 3, when: { all: [on('b', 'stage', 1), on('b', 'lbal', 2)] }, hints: ['两边各拿走 16 个砝码。', '左盘只剩 2 个盒子。', '右盘剩 10：还差的 10 条腿。'] },
      { id: 'solve', say: 'x = 5：每只兔多 2 条，换了 5 只', score: 5, when: on('b', 'solved', 5), hints: ['2x = 10。', '两边都平分成 2 份。', 'x = 5。'] },
    ],
    goal: ['solve'],
    why: '16 是全是鸡的腿；拿走 16 剩下的 10 是还差的腿；2x = 10 里的 2 是每只兔多的 2 条，x = 5 就是换成兔的只数。解方程和假设法，每一步都对得上。',
  });

  // ---- 往深处走：换个数会怎样，画成图（docs/knob-graph-and-gallery.md 第一节，换一换台的“记下来”） ----
  const ge = (port, value) => ({ role: 's', port, op: '>=', value: String(value) });
  add({
    id: 'gal-cr-graph', way: null, deeper: true, title: '鸡兔同笼 · 画成图：头数不变，腿数换一换', grade: 5, rung: 6, shelf: ['swapbench'], topics: ['鸡兔同笼', '找规律'],
    hook: '还是 8 个头，腿数不一定是 26 了：点目标旁边的 − +，换成 20、21、22……每凑出一个（或者说对凑不出来），研究本记一条，下面的图上就多一个点。图上有 3 个点以后，换到新的腿数先猜：点蓝线上的一格，再去换。',
    build: one('swapbench', { n: 8, k: 0, target: 20, la: 2, lb: 4, adj: 'T', graph: true, ask: '头数不变，腿每多 2 条，兔多几只？|*1 只|2 只|4 只~为什么有的腿数凑不出来（图上的 ✕）？|*每只都是双数条腿，加起来一定是双数|腿太多了|运气不好' }, 's'),
    milestones: [
      { id: 'three', say: '图上有 3 个点', score: 2, when: ge('pts', 3), hints: ['点一只鸡换成兔，换到腿数正好，研究本就记一条，图上多一个点。', '点目标旁边的 + ，换一个腿数再做。', '20、22、24：每个都凑出来。'] },
      { id: 'hole', say: '说对一次“凑不出来”', score: 2, when: { role: 's', port: 'no', op: '=', value: '1' }, hints: ['试试单数的腿数，比如 21。', '怎么换都差 1 条。', '点“凑不出来”。'] },
      { id: 'guess', say: '先猜再换，猜对一次', score: 2, when: ge('gok', 1), hints: ['图上有 3 个点以后，换到一个新的腿数。', '先点蓝线上你猜的那一格，再去换。', '看看前面几个点：腿多 2 条，点往上走几格？'] },
      { id: 'all', say: '全部试一遍：看出是一条线', score: 1, when: { role: 's', port: 'all', op: '=', value: '1' }, hints: ['图上有 5 个点以后，右上角的按钮就能点了。', '点“全部试一遍”。', '浅色的点连成一条斜线，中间隔一个缺一个。'] },
      { id: 'q1', say: '腿每多 2 条，兔多 1 只', score: 1, when: { role: 's', port: 'q1', op: '=', value: '1' }, hints: ['看图：横着走 2 格，点往上走几格？', '多一只兔、少一只鸡，腿多 2 条。', '1 只。'] },
      { id: 'q2', say: '说出为什么有的凑不出来', score: 1, when: { role: 's', port: 'q2', op: '=', value: '1' }, hints: ['✕ 都在哪些腿数上？', '21、23、25……都是单数。', '每只都是双数条腿，加起来只能是双数。'] },
    ],
    goal: ['three', 'hole', 'guess', 'all', 'q1', 'q2'],
    why: '头数不变时，兔每多 1 只（鸡少 1 只），腿多 2 条：图上的点排成一条斜线，横着走 2 格往上走 1 格。每只都是双数条腿，所以单数的腿数一个也凑不出来，线上隔一个缺一个；腿比 16 少、比 32 多也凑不出来，线到那里就断了。',
  });

  // ======== 第二页：1 + 2 + 3 + 4 + 5 + 6 + 7 ========
  const gbase = { domain: '数与运算', level: 'core', traps: [], predict: null, grade: 4, rung: 6, points: ['4.10'], essence: ['E2', 'E4'], topics: ['连加', '高斯求和'], family: 'sum-1-7', chain: false };   // 从图鉴里走，不进闯关链（不挤掉各台原来的关）
  const gadd = (o) => U.problems.push(Object.assign({}, gbase, o, { alias: ['连加', '高斯', '解法图鉴'].concat(o.alias || []) }));
  const gs7 = () => { const s = W.blank(); const id = W.add(s, 'gaussbench', 40, 50, { a: 1, d: 1, n: 7 }); s.entities[id].role = 'gs'; return s; };
  gadd({
    id: 'gal-gs-add', way: 'add', title: '1 加到 7 · 一个一个加', grade: 3, shelf: ['termsbench'],
    hook: '1 + 2 + 3 + 4 + 5 + 6 + 7 等于几？先老老实实一个一个加：点一个加号，就先算那一步。要点几次？',
    build: one('termsbench', { mode: 1, toks: '1,+,2,+,3,+,4,+,5,+,6,+,7' }, 't'),
    milestones: [{ id: 'sum', say: '加完了：28', score: 6, when: on('t', 'value', 28), hints: ['从左边开始：1 + 2 = 3。', '再加 3 得 6，再加 4 得 10……', '一共要点 6 次加号：28。'] }],
    goal: ['sum'],
    why: '1 + 2 = 3，+ 3 = 6，+ 4 = 10，+ 5 = 15，+ 6 = 21，+ 7 = 28。7 个数要加 6 次。要是加到 100，就得加 99 次：另外几种做法都是在想办法少加几次。',
  });
  gadd({
    id: 'gal-gs-pair', way: 'pair', title: '1 加到 7 · 换个顺序，凑成 8', shelf: ['termsbench'],
    hook: '还是 1 到 7，这回顺序换了：1 和 7 挨着，2 和 6 挨着，3 和 5 挨着，4 落单。先把挨着的两个加起来，看看都是几。',
    build: one('termsbench', { mode: 1, toks: '1,+,7,+,2,+,6,+,3,+,5,+,4' }, 't'),
    predict: { q: '换了顺序，加起来的和会变吗？', options: [{ v: 'same', label: '不变，还是那几个数' }, { v: 'diff', label: '会变' }], answer: 'same' },
    milestones: [
      // 2026-11-26 起查真的配对：三对，每对是开头的两个数、加起来都是 8，每个数只用一次（以前只看算式里有三个 8）
      { id: 'eights', say: '凑出三个 8：1 和 7、2 和 6、3 和 5 配成对，4 落单', score: 3, when: { all: [on('t', 'pairs', 3), on('t', 'pairsum', 8), on('t', 'alone', 1)] }, hints: ['先点 1 和 7 中间的加号。', '再点 2 和 6 中间的、3 和 5 中间的。', '每一对都是两个数加成 8，算式变成 8 + 8 + 8 + 4。'] },
      { id: 'sum', say: '三个 8 再加 4：28', score: 3, when: on('t', 'value', 28), hints: ['8 + 8 + 8 = 24。', '再加落单的 4。', '28。'] },
    ],
    goal: ['eights', 'sum'],
    why: '加法换了顺序，和不变。1 + 7、2 + 6、3 + 5 都是 8：一头多 1，另一头少 1。三个 8 是 24，再加中间落单的 4，一共 28。',
  });
  gadd({
    id: 'gal-gs-rev', way: 'rev', title: '1 加到 7 · 倒过来再写一行', shelf: ['gaussbench'],
    hook: '1 到 7 写一行，再倒过来写一行（7 到 1），上下对齐。每一列加起来是几？一共几列？两行合起来，是要求的和的几倍？',
    build: gs7,
    milestones: [{ id: 'sum', say: '7 列 8，再除以 2：28', score: 6, when: on('gs', 'total', 28), hints: ['点“倒过来写一行”。', '再点“上下对齐相加”：每一列都是 8。', '7 个 8 是 56，同一串数写了两遍：56 ÷ 2 = 28。'] }],
    goal: ['sum'],
    why: '倒过来写一行，上下对齐，每一列都是 1 + 7 = 8，一共 7 列：56。两行是同一串数写了两遍，所以和是 56 ÷ 2 = 28。不管几个数，都只要乘一次、除一次。',
  });
  gadd({
    id: 'gal-gs-mean', way: 'mean', title: '1 加到 7 · 搬成一样高', shelf: ['meanbench'],
    hook: '7 堆方块，从 1 块到 7 块，像台阶。把高的搬给矮的，搬到每堆一样高：每堆几块？7 堆一共几块？',
    build: one('meanbench', { vals: '1,2,3,4,5,6,7', askTotal: true }, 'm'),
    milestones: [{ id: 'level', say: '每堆 4 块，7 堆：4 × 7 = 28', score: 6, when: on('m', 'level', 1), hints: ['7 那堆搬 3 块给 1 那堆。', '6 给 2 搬 2 块，5 给 3 搬 1 块。', '每堆都是 4 块：7 × 4 = 28。'] }],
    goal: ['level'],
    why: '搬来搬去总数不变。7 给 1 搬 3 块，6 给 2 搬 2 块，5 给 3 搬 1 块，每堆都是 4 块（正好是中间那个数）。7 堆 × 4 块 = 28。和 = 平均数 × 个数。',
  });
  gadd({
    id: 'gal-gs-br-rev', way: null, bridge: true, title: '桥 · 凑成 8 和倒过来写：是一回事吗？', shelf: ['gaussbench'],
    hook: '还是 1 到 7。先回答上面的问题。然后倒过来写一行，上下对齐相加：每一列是哪两个数？和“凑成 8”里的哪一对一样？落单的 4 到哪去了？',
    build: gs7,
    predict: { q: '凑成 8 的时候，4 落单了。倒过来写一行，4 下面是几？', options: [{ v: 'a', label: '还是 4：自己和自己凑成 8' }, { v: 'b', label: '没有数' }, { v: 'c', label: '是 7' }], answer: 'a' },
    milestones: [{ id: 'sum', say: '每列都是 8，4 和 4 也是 8：7 个 8 的一半是 28', score: 6, when: on('gs', 'total', 28), hints: ['点“倒过来写一行”。', '中间那一列是 4 + 4。', '“凑成 8”每一对只算一次；倒过来写，每一对算了两次，所以要除以 2。'] }],
    goal: ['sum'],
    why: '凑成 8 是 1 和 7 一对、2 和 6 一对……倒过来写把每一对都写了两遍（上 1 下 7，上 7 下 1），落单的 4 也和自己凑成了 8。所以是 7 个 8 的一半，和 3 个 8 加 4 一样：28。',
  });
  gadd({
    id: 'gal-gs-br-mean', way: null, bridge: true, title: '桥 · 倒过来写和搬成一样高：8 的一半是几？', shelf: ['meanbench'],
    hook: '还是 1 到 7。先回答上面的问题。倒过来写的时候，每一列都是 8，是两个数加起来。那把 7 堆搬成一样高，每堆该是几块？搬一搬看。',
    build: one('meanbench', { vals: '1,2,3,4,5,6,7', askTotal: true }, 'm'),
    predict: { q: '倒过来写，每一列是 8（两个数）。搬成一样高，每堆几块？', options: [{ v: '4', label: '4 块：8 的一半' }, { v: '8', label: '8 块' }, { v: '7', label: '7 块' }], answer: '4' },
    milestones: [
      { id: 'level', say: '每堆 4 块：就是每一列 8 的一半', score: 5, when: on('m', 'level', 1), hints: ['高的给矮的：7 给 1，6 给 2，5 给 3。', '1 和 7 搬成 4 和 4：一对还是 8。', '每堆 4 块。'] },
      // 加分，不算在过关里：一块也不白搬，正好是每一对自己搬平（7 给 1 三块、6 给 2 两块、5 给 3 一块）
      { id: 'six', say: '只搬了 6 块：每一对自己搬平，一块也没白搬', score: 2, when: { all: [on('m', 'level', 1), { role: 'm', port: 'moves', op: '<=', value: '6' }] }, hints: ['只从线上面搬到线下面，别搬回去。', '7 给 1 搬 3 块，6 给 2 搬 2 块，5 给 3 搬 1 块。', '3 + 2 + 1 = 6 块。多搬了就点“重来”再试。'] },
    ],
    goal: ['level'],
    why: '倒过来写，每一列是 首 + 末 = 8；搬成一样高，就是把每一对 8 平分成 4 和 4。所以 (首 + 末) ÷ 2 就是平均数，和 = 平均数 × 个数 = (首 + 末) × 个数 ÷ 2。两种做法是同一个公式。',
  });

  // ---- 图鉴的页 ----
  const PAGES = [{
    id: 'chick-rabbit', icon: '🐔', title: '鸡兔同笼', q: '8 个头、26 条腿，兔几只？', ans: '兔 5 只，鸡 3 只',
    ways: [
      { id: 'assume', name: '假设全是鸡，一只一只换', pid: 'sw-8-26' },
      { id: 'assumeR', name: '反过来，假设全是兔', pid: 'sw-from-rabbits' },
      { id: 'lift', name: '每只都抬起 2 条腿', pid: 'sw-lift' },
      { id: 'steps', name: '分步算式', pid: 'gal-cr-steps' },
      { id: 'system', name: '两架天平', pid: 'sy-chicken' },
      { id: 'eq', name: '方程：设兔 x 只', pid: 'gal-cr-eq' },
      { id: 'area', name: '面积图', pid: 'gal-cr-area' },
    ],
    bridges: [
      { a: 'assume', b: 'system', pid: 'sw-as-system' },
      { a: 'assume', b: 'area', pid: 'gal-br-area' },
      { a: 'assume', b: 'eq', pid: 'gal-br-eq' },
    ],
    deeper: [{ pid: 'gal-cr-graph', name: '换个腿数会怎样：画成图' }],
    more: '同一道题、同一组数，换一种做法，答案还是兔 5 只。找到两种做法以后，走中间的桥，看它们哪一步对着哪一步。',
    after: '哪种做法换成 100 个头、316 条腿也最省事？',
  }, {
    id: 'sum-1-7', icon: '➕', title: '连加', q: '1 + 2 + 3 + 4 + 5 + 6 + 7 = ?', ans: '28',
    ways: [
      { id: 'add', name: '一个一个加', pid: 'gal-gs-add' },
      { id: 'pair', name: '换个顺序，凑成 8', pid: 'gal-gs-pair' },
      { id: 'rev', name: '倒过来再写一行', pid: 'gal-gs-rev' },
      { id: 'mean', name: '搬成一样高', pid: 'gal-gs-mean' },
    ],
    bridges: [
      { a: 'pair', b: 'rev', pid: 'gal-gs-br-rev' },
      { a: 'rev', b: 'mean', pid: 'gal-gs-br-mean' },
    ],
    deeper: [{ pid: 'gs-1-100', name: '换成 1 加到 100' }, { pid: 'gs-odd', name: '换成 1 + 3 + 5 + … + 19' }],
    more: '同一串数，四种加法，答案都是 28。一个一个加最笨，但最先想到；另外三种都是在想办法少加几次。',
    after: '加到 100，哪种做法最省事？一个一个加要加几次？',
  }];
  // 已有的题也标上它属于哪一页、哪一格
  for (const pg of PAGES) for (const w of pg.ways) { const p = U.problems.find((x) => x.id === w.pid); if (p) { p.family = pg.id; p.way = w.id; } }
  const byId = (id) => U.problems.find((p) => p.id === id);
  U.Gallery = {
    pages: () => PAGES,
    get: (id) => PAGES.find((p) => p.id === id),
    // 每格点亮没有、每座桥能不能走；lit 是点亮的格数
    status(id, best) {
      const pg = U.Gallery.get(id), ways = pg.ways.map((w) => Object.assign({ stars: best(w.pid), title: (byId(w.pid) || {}).title || '' }, w, { lit: best(w.pid) > 0 }));
      const lit = (wid) => ways.some((w) => w.id === wid && w.lit), nm = (wid) => (pg.ways.find((w) => w.id === wid) || {}).name;
      const bridges = pg.bridges.map((b) => Object.assign({ stars: best(b.pid), open: lit(b.a) && lit(b.b), an: nm(b.a), bn: nm(b.b) }, b));
      const n = ways.filter((w) => w.lit).length, deeper = (pg.deeper || []).map((d) => Object.assign({ stars: best(d.pid), open: n > 0 }, d));
      return { ways, bridges, deeper, lit: n, crossed: bridges.filter((b) => b.stars > 0).length };
    },
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
