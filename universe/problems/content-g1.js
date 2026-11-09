/* 一年级内容补充：13 个没有题的知识点（1.2–1.12、1.14、1.15）。每点写一道核心题和一道陷阱题；延伸题需要证据 ④ 的器材，一年级现有器材做不到，暂缺。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const R = (s, id, role) => { s.entities[id].role = role; return id; };

  // 1.2 位置：用数的大小表示左右（数轴上越靠右越大）
  U.problems.push({
    id: 'g1-position-compare-core', title: '4 在 2 的左边还是右边？', grade: 1, domain: '图形', essence: ['E2'], points: ['1.2'], level: 'core', rung: 1,
    alias: ['左右', '位置', '比较'], hook: '数轴上，数字越往右越大。4 和 2 放在一起，4 在 2 的哪一边？',
    shelf: ['num', 'compare'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 4 }), 'a'); R(s, W.add(s, 'num', 60, 200, { n: 2 }), 'b'); return s; },
    predict: null,
    milestones: [
      { id: 'put', say: '放一个比较器', score: 2, when: { count: { type: 'compare', ge: 1 } },
        hints: ['要比谁在哪边，先要一台比较器。', '「比较」器材可以判断两个数的大小关系。', '放一台比较器。'] },
      { id: 'right', say: '比较结果：4 比 2 大，4 在右边', score: 4, when: { type: 'compare', port: 'ok', op: '=', value: true },
        hints: ['把 4 和 2 分别接到比较器的甲、乙。', '关系选“>”（大于），成立就说明 4 比 2 大。', '比较器：甲接 4，乙接 2，关系设为 >。'] },
    ],
    traps: [], goal: ['right'],
    why: '数轴上数越大越靠右。4 > 2，所以 4 在 2 的右边。比较器的“>”就是在问“是不是在右边”。',
  });

  // 1.2 位置（陷阱）：数轴范围要包住所有的点
  U.problems.push({
    id: 'g1-position-numline-trap', title: '数轴 0 到 5，点 3 和点 7 都要标出来', grade: 1, domain: '图形', essence: ['E2'], points: ['1.2'], level: 'trap', rung: 1,
    alias: ['数轴', '位置', '范围'], hook: '把 3 和 7 都放到数轴上。画出来的数轴够长吗？',
    shelf: ['num', 'numline'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 3 }), 'p3'); R(s, W.add(s, 'num', 60, 200, { n: 7 }), 'p7'); return s; },
    predict: null,
    milestones: [
      { id: 'line', say: '放一条数轴', score: 2, when: { count: { type: 'numline', ge: 1 } },
        hints: ['要画一条数轴，用「数轴」器材。', '数轴接收“点”，每个点接到它的输入口。', '放一条数轴。'] },
      { id: 'both', say: '数轴上能看到 2 个点', score: 4, when: { type: 'numline', port: 'n', op: '=', value: '2' },
        hints: ['数轴只能显示范围内的点，看看范围有没有包住 7。', '把数轴的终点调大到能看到 7。', '终点改成 10，两个点都在范围内。'] },
    ],
    traps: [{ id: 'range', wrong: '7 画在数轴外面了：终点 5 太小，把数轴的终点调大才看得到 7。', when: { type: 'numline', port: 'n', op: '=', value: '1' } }],
    goal: ['both'],
    why: '数轴的范围要包住所有要标的点。点 3 在 0–5 之间，点 7 超出了 5，所以数轴的终点要改到 10 以上。',
  });

  // 1.3 分与合（核心）：两部分合起来是几
  U.problems.push({
    id: 'g1-split-merge-core', title: '2 个和 3 个合起来，一共几个？', grade: 1, domain: '数与运算', essence: ['E3', 'E1'], points: ['1.3'], level: 'core', rung: 1,
    alias: ['分与合', '合', '加法'], hook: '一部分是 2 个，另一部分是 3 个。把它们合在一起，是几个？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 2 }), 'x'); R(s, W.add(s, 'num', 60, 200, { n: 3 }), 'y'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['合在一起要用加法。', '「运算器」可以做加减乘除。', '放一台运算器，运算选 +。'] },
      { id: 'five', say: '2 和 3 合起来是 5', score: 4, when: { type: 'op', port: 'r', op: '=', value: '5' },
        hints: ['把 2 接甲口，3 接乙口。', '运算器默认就是 +。', '甲接 2，乙接 3。'] },
    ],
    traps: [], goal: ['five'],
    why: '5 可以分成 2 和 3，反过来 2 和 3 合起来就是 5。分与合是同一件事的两个方向。',
  });

  // 1.3 分与合（陷阱）：求另一部分要用减法
  U.problems.push({
    id: 'g1-split-minus-trap', title: '5 个苹果，拿走 2 个，还剩几个？', grade: 1, domain: '数与运算', essence: ['E3', 'E1'], points: ['1.3'], level: 'trap', rung: 1,
    alias: ['分与合', '减', '另一部分'], hook: '5 个苹果分成两份，一份是 2 个。另一份是几个？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 5 }), 'all'); R(s, W.add(s, 'num', 60, 200, { n: 2 }), 'part'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['已知整体和一部分，要求另一部分。', '要“拿走”，应该用减法。', '放一台运算器，运算选 −。'] },
      { id: 'rest', say: '另一部分是 3 个', score: 4, when: { type: 'op', port: 'r', op: '=', value: '3' },
        hints: ['整体 5 放甲口，一部分 2 放乙口。', '运算器选“−”（减）。', '甲接 5，乙接 2，运算选 −。'] },
    ],
    traps: [{ id: 'add', wrong: '把 5 和 2 加起来了：分开是减，合起来才是加。', when: { type: 'op', port: 'r', op: '=', value: '7' } }],
    goal: ['rest'],
    why: '5 = 2 + 3，所以另一部分是 5 − 2 = 3。已知合和一部分，求另一部分用减法。',
  });

  // 1.4 5 以内加减法、0（核心）：减去同样多，就是 0
  U.problems.push({
    id: 'g1-zero-subtract-core', title: '5 个苹果吃掉 5 个，还剩几个？', grade: 1, domain: '数与运算', essence: ['E1'], points: ['1.4'], level: 'core', rung: 1,
    alias: ['减法', '0', '5以内'], hook: '5 个苹果全部吃掉，还剩几个？0 也是一个数。',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 5 }), 'a'); R(s, W.add(s, 'num', 60, 200, { n: 5 }), 'b'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['吃掉，要用减法。', '运算器的运算选 −。', '放一台运算器，选 −。'] },
      { id: 'zero', say: '还剩 0 个', score: 4, when: { type: 'op', port: 'r', op: '=', value: '0' },
        hints: ['5 减 5，结果是几？', '把两个 5 分别接甲口、乙口。', '甲接 5，乙接 5，运算选 −。'] },
    ],
    traps: [], goal: ['zero'],
    why: '5 − 5 = 0。0 表示“一个也没有”，它也是一个数。',
  });

  // 1.4 5 以内加减法、0（陷阱）：减 0 结果不变
  U.problems.push({
    id: 'g1-zero-trap', title: '3 个苹果，一个也没拿走，还剩几个？', grade: 1, domain: '数与运算', essence: ['E1'], points: ['1.4'], level: 'trap', rung: 1,
    alias: ['0', '减法', '不变'], hook: '3 个苹果，减去 0 个。结果是几？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 3 }), 'c'); R(s, W.add(s, 'num', 60, 200, { n: 0 }), 'z'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['拿走，用减法。', '运算器选 −。', '放一台运算器，选 −。'] },
      { id: 'three', say: '还剩 3 个', score: 4, when: { type: 'op', port: 'r', op: '=', value: '3' },
        hints: ['3 减 0 是几？', '甲接 3，乙接 0。', '甲接 3，乙接 0，运算选 −。'] },
    ],
    traps: [{ id: 'zero-result', wrong: '3 减 0 不是 0：0 表示没拿走，所以还是 3。', when: { type: 'op', port: 'r', op: '=', value: '0' } }],
    goal: ['three'],
    why: '3 − 0 = 3。减去 0 等于没减，数不变。',
  });

  // 1.5 立体图形（核心）：长方体的棱长总和
  U.problems.push({
    id: 'g1-solid-edges-core', title: '长 3、宽 2、高 1 的长方体，所有棱加起来多长？', grade: 1, domain: '图形', essence: ['E5', 'E3'], points: ['1.5'], level: 'core', rung: 1,
    alias: ['立体图形', '长方体', '棱'], hook: '长方体有 12 条棱，分成 4 条长、4 条宽、4 条高。把它们加起来是多少？',
    shelf: ['cuboid'],
    build() { const s = W.blank(); R(s, W.add(s, 'cuboid', 60, 60, { l: 4, w: 3, h: 2 }), 'box'); return s; },
    predict: null,
    milestones: [
      { id: 'edges', say: '棱长总和是 24', score: 4, when: { type: 'cuboid', port: 'edges', op: '=', value: '24' },
        hints: ['长方体的棱分三组，每组 4 条。', '棱长总和 = 4 ×（长 + 宽 + 高）。', '把长、宽、高改成 3、2、1。'] },
    ],
    traps: [], goal: ['edges'],
    why: '长方体有 4 条长、4 条宽、4 条高，棱长总和 = 4 ×（长 + 宽 + 高）= 4 × 6 = 24。',
  });

  // 1.5 立体图形（陷阱）：体积相同，表面积不一定相同
  U.problems.push({
    id: 'g1-solid-volume-trap', title: '6 个小方块拼长方体：体积都是 6，表面积一样吗？', grade: 1, domain: '图形', essence: ['E5', 'E3'], points: ['1.5'], level: 'trap', rung: 1,
    alias: ['立体图形', '体积', '表面积'], hook: '用 6 个相同的小方块拼一个长方体。拼法不同，外面的面积一样吗？',
    shelf: ['cuboid'],
    build() { const s = W.blank(); R(s, W.add(s, 'cuboid', 60, 60, { l: 1, w: 1, h: 1 }), 'box'); return s; },
    predict: null,
    milestones: [
      { id: 'vol', say: '体积是 6', score: 2, when: { type: 'cuboid', port: 'vol', op: '=', value: '6' },
        hints: ['体积是 长 × 宽 × 高。', '6 = 2 × 3 × 1，找三个数相乘得 6。', '把长改成 2，宽改成 3，高是 1。'] },
      { id: 'surf', say: '表面积是 22', score: 4, when: { type: 'cuboid', port: 'surf', op: '=', value: '22' },
        hints: ['表面积看外面的 6 个面。', '表面积 = 2 ×（长×宽 + 长×高 + 宽×高）。', '长 2、宽 3、高 1 时，表面积是 22。'] },
    ],
    traps: [{ id: 'same-surf', wrong: '体积相同，表面积不一定相同：拼成 1×1×6 时，表面积是 26。', when: { type: 'cuboid', port: 'surf', op: '=', value: '26' } }],
    goal: ['surf'],
    why: '体积都是 6，但拼法不同，外面的面积不同。1×1×6 的表面积是 26，2×3×1 的表面积是 22。',
  });

  // 1.6 6–10 的认识、连加（核心）
  U.problems.push({
    id: 'g1-chain-add-core', title: '2 加 3 再加 4，一共几个？', grade: 1, domain: '数与运算', essence: ['E1'], points: ['1.6'], level: 'core', rung: 1,
    alias: ['连加', '6–10'], hook: '一次加一堆：先加前两个，再加第三个。',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 40, { n: 2 }), 'a'); R(s, W.add(s, 'num', 60, 150, { n: 3 }), 'b'); R(s, W.add(s, 'num', 60, 260, { n: 4 }), 'c'); return s; },
    predict: null,
    milestones: [
      { id: 'two', say: '先算 2 + 3 = 5', score: 2, when: { type: 'op', port: 'r', op: '=', value: '5' },
        hints: ['先把前两个数加起来。', '放一台运算器，甲接 2，乙接 3。', '运算选 +，结果是 5。'] },
      { id: 'all', say: '再加 4，得到 9', score: 4, when: { type: 'op', port: 'r', op: '=', value: '9' },
        hints: ['第一步的结果再加第三个数。', '再放一台运算器，甲接第一步的结果，乙接 4。', '第二台运算器：甲接第一步的结果，乙接 4，运算选 +。'] },
    ],
    traps: [], goal: ['all'],
    why: '连加就是一个一个往后加：(2 + 3) + 4 = 9。',
  });

  // 1.6 连加连减（陷阱）：连减要从左往右算
  U.problems.push({
    id: 'g1-chain-sub-trap', title: '9 减 3 再减 2，还剩几个？', grade: 1, domain: '数与运算', essence: ['E1'], points: ['1.6'], level: 'trap', rung: 1,
    alias: ['连减', '从左往右'], hook: '9 个球，先拿走 3 个，再拿走 2 个。还剩几个？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 40, { n: 9 }), 'a'); R(s, W.add(s, 'num', 60, 150, { n: 3 }), 'b'); R(s, W.add(s, 'num', 60, 260, { n: 2 }), 'c'); return s; },
    predict: null,
    milestones: [
      { id: 'two-ops', say: '放两台运算器', score: 2, when: { count: { type: 'op', ge: 2 } },
        hints: ['要做两次减法。', '每次减一个数，就要一台运算器。', '放两台运算器，都选 −。'] },
      { id: 'four', say: '还剩 4 个', score: 4, when: { type: 'op', port: 'r', op: '=', value: '4' },
        hints: ['先拿走 3 个：9 − 3 = ?', '第一台的结果，再减 2。', '第一台：9 − 3；第二台：第一台的结果 − 2。'] },
    ],
    traps: [{ id: 'wrong-order', wrong: '先算 3 − 2 = 1，再 9 − 1 = 8 是错的：连减要从左往右，9 − 3 = 6，6 − 2 = 4。', when: { type: 'op', port: 'r', op: '=', value: '8' } }],
    goal: ['four'],
    why: '连减要从左往右一步一步算：9 − 3 = 6，6 − 2 = 4。不能先算后面两个数。',
  });

  // 1.7 11–20 的认识、10 加几（核心）
  U.problems.push({
    id: 'g1-ten-plus-core', title: '10 加 6 是几？它是两位数吗？', grade: 1, domain: '数与运算', essence: ['E1'], points: ['1.7'], level: 'core', rung: 1,
    alias: ['十几', '10加几', '两位数'], hook: '1 个十和 6 个一合起来是几？这个数有几位？',
    shelf: ['num', 'op', 'digits'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 10 }), 'ten'); R(s, W.add(s, 'num', 60, 200, { n: 6 }), 'six'); return s; },
    predict: null,
    milestones: [
      { id: 'sum', say: '10 加 6 得 16', score: 3, when: { type: 'op', port: 'r', op: '=', value: '16' },
        hints: ['10 和 6 合起来，用加法。', '放一台运算器，甲接 10，乙接 6。', '运算选 +，结果是 16。'] },
      { id: 'digits', say: '16 是两位数', score: 4, when: { type: 'digits', port: 'count', op: '=', value: '2' },
        hints: ['看看 16 有几位，用「数位板」。', '把运算器的结果接到数位板。', '数位板接运算器的结果，它会数出位数 2。'] },
    ],
    traps: [], goal: ['digits'],
    why: '10 加几，就是 1 个十加上几个一。10 + 6 = 16，是两位数。',
  });

  // 1.7 11–20 的认识（陷阱）：12 里有几个十
  U.problems.push({
    id: 'g1-teen-tens-trap', title: '12 个点，每 10 个圈一圈，圈了几圈？还剩几个？', grade: 1, domain: '数与运算', essence: ['E1'], points: ['1.7'], level: 'trap', rung: 1,
    alias: ['十几', '一个十', '余数'], hook: '12 里面有 1 个十和几个一？用“每 10 个一圈”来分。',
    shelf: ['num', 'divmod'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 12 }), 'a'); R(s, W.add(s, 'num', 60, 200, { n: 10 }), 'b'); return s; },
    predict: null,
    milestones: [
      { id: 'put', say: '放一台带余除法', score: 2, when: { count: { type: 'divmod', ge: 1 } },
        hints: ['要看 12 里有几个 10，还剩几个。', '「带余除法」能同时给出商和余数。', '放一台带余除法。'] },
      { id: 'tens', say: '12 里有 1 个十', score: 3, when: { type: 'divmod', port: 'q', op: '=', value: '1' },
        hints: ['被除数接 12，除数接 10。', '商就是几个十。', '甲接 12，乙接 10，看商。'] },
      { id: 'ones', say: '剩 2 个一', score: 3, when: { type: 'divmod', port: 'r', op: '=', value: '2' },
        hints: ['余数就是还剩下的一个一的数量。', '12 − 10 = ?', '余数是 2。'] },
    ],
    traps: [{ id: 'two-tens', wrong: '12 不是 2 个十（那是 20）：12 里只有 1 个十和 2 个一。', when: { type: 'divmod', port: 'q', op: '=', value: '2' } }],
    goal: ['ones'],
    why: '12 = 10 + 2：有 1 个十，还剩 2 个一。商是十的个数，余数是剩下的个数。',
  });

  // 1.8 认识钟表（核心）：整时
  U.problems.push({
    id: 'g1-clock-hour-core', title: '从 12 时开始，时针走 3 大格，是几时？', grade: 1, domain: '时间与变化', essence: ['E1'], points: ['1.8'], level: 'core', rung: 1,
    alias: ['钟表', '整时', '时针'], hook: '时针走一大格是 1 时。从 12 时走 3 大格，是几时？',
    shelf: ['clock'],
    build() { const s = W.blank(); R(s, W.add(s, 'clock', 60, 60, { every: 1, scale: 1, offset: 0 }), 'hands'); return s; },
    predict: null,
    milestones: [
      { id: 'three', say: '时针走到 3 时', score: 4, when: { type: 'clock', port: 'n', op: '=', value: '3' },
        hints: ['每走一拍，时针就走一大格。', '要走 3 大格，就等 3 拍。', '让钟走 3 拍。'] },
    ],
    traps: [], goal: ['three'],
    why: '钟面上每大格代表 1 时。从 12 时开始走 3 大格，就是 3 时。',
  });

  // 1.8 认识钟表（陷阱）：一大格是 5 分，不是 1 时
  U.problems.push({
    id: 'g1-clock-minute-trap', title: '分针走一圈是几分钟？', grade: 1, domain: '时间与变化', essence: ['E1'], points: ['1.8'], level: 'trap', rung: 1,
    alias: ['钟表', '分针', '分钟'], hook: '分针每走一大格是 5 分。走完一圈要走 12 大格，是多少分钟？',
    shelf: ['clock'],
    build() { const s = W.blank(); R(s, W.add(s, 'clock', 60, 60, { every: 1, scale: 5, offset: 0 }), 'hands'); return s; },
    predict: null,
    milestones: [
      { id: 'hour', say: '分针走满一圈，是 60 分钟', score: 4, when: { type: 'clock', port: 'n', op: '=', value: '60' },
        hints: ['每一拍，分针走一大格，这一格是 5 分。', '一圈是 12 大格。', '让钟走 12 拍，看它显示多少分钟。'] },
    ],
    traps: [{ id: 'one-hour', wrong: '一大格是 5 分，不是 1 小时：分针的一大格是 5 分钟。', when: { type: 'clock', port: 'n', op: '=', value: '5' } }],
    goal: ['hour'],
    why: '分针一圈 12 大格，每大格 5 分钟，所以一圈是 60 分钟，也就是 1 时。',
  });

  // 1.9 20 以内进位加法（核心）
  U.problems.push({
    id: 'g1-carry-add-core', title: '9 加 5 是几？', grade: 1, domain: '数与运算', essence: ['E2'], points: ['1.9'], level: 'core', rung: 1,
    alias: ['进位加法', '20以内'], hook: '9 个苹果再加 5 个，一共几个？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 9 }), 'a'); R(s, W.add(s, 'num', 60, 200, { n: 5 }), 'b'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['合起来，用加法。', '运算器选 +。', '放一台运算器。'] },
      { id: 'fourteen', say: '9 + 5 = 14', score: 4, when: { type: 'op', port: 'r', op: '=', value: '14' },
        hints: ['9 和 5 放进运算器。', '甲接 9，乙接 5。', '甲接 9，乙接 5，运算选 +，结果是 14。'] },
    ],
    traps: [], goal: ['fourteen'],
    why: '9 + 5 = 14，个位 9 + 5 = 14，满十进一，写作 1 个十和 4 个一。',
  });

  // 1.9 凑十法（陷阱）：把 6 拆成 1 和 5，先凑 10
  U.problems.push({
    id: 'g1-make-ten-trap', title: '9 加 6：先把 6 拆开，凑成 10 再加', grade: 1, domain: '数与运算', essence: ['E2'], points: ['1.9'], level: 'trap', rung: 1,
    alias: ['凑十法', '拆数'], hook: '9 + 6 不好直接算。先从 6 里拿 1 个给 9，凑成 10，再加剩下的 5。',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 40, { n: 9 }), 'a'); R(s, W.add(s, 'num', 60, 150, { n: 1 }), 'one'); R(s, W.add(s, 'num', 60, 260, { n: 5 }), 'five'); return s; },
    predict: null,
    milestones: [
      { id: 'ten', say: '9 + 1 = 10', score: 2, when: { type: 'op', port: 'r', op: '=', value: '10' },
        hints: ['先凑成整十：9 需要几个才到 10？', '把 6 拆成 1 和 5，1 给 9。', '第一台运算器：9 + 1。'] },
      { id: 'fifteen', say: '10 + 5 = 15', score: 4, when: { type: 'op', port: 'r', op: '=', value: '15' },
        hints: ['凑成 10 以后，再加剩下的 5。', '第二台运算器：甲接第一步的结果，乙接 5。', '第二台：10 + 5，结果是 15。'] },
    ],
    traps: [{ id: 'drop-one', wrong: '9 + 6 不是 14：拆 6 的时候 1 不能丢，应该是 15。', when: { type: 'op', port: 'r', op: '=', value: '14' } }],
    goal: ['fifteen'],
    why: '9 + 6：6 = 1 + 5，9 + 1 = 10，10 + 5 = 15。凑十法先凑满 10，再接着加。',
  });

  // 1.10 平面图形（核心）：长方形的周长
  U.problems.push({
    id: 'g1-rect-perimeter-core', title: '长 4、宽 2 的长方形，周长和面积各是多少？', grade: 1, domain: '图形', essence: ['E5', 'E3'], points: ['1.10'], level: 'core', rung: 1,
    alias: ['平面图形', '长方形', '周长'], hook: '长方形有 4 条边，对边相等。它的周长是绕一圈的长度。',
    shelf: ['rect'],
    build() { const s = W.blank(); R(s, W.add(s, 'rect', 60, 60, { w: 6, h: 4 }), 'r'); return s; },
    predict: null,
    milestones: [
      { id: 'area', say: '面积是 8', score: 2, when: { type: 'rect', port: 'area', op: '=', value: '8' },
        hints: ['面积就是长乘宽。', '把长改成 4，宽改成 2。', '4 × 2 = 8。'] },
      { id: 'perim', say: '周长是 12', score: 4, when: { type: 'rect', port: 'perim', op: '=', value: '12' },
        hints: ['周长是绕一圈的长度，等于 2 倍（长 + 宽）。', '长和宽都改成刚才的数。', '长 4、宽 2 时，周长是 12。'] },
    ],
    traps: [], goal: ['perim'],
    why: '长方形的周长 = 2 ×（长 + 宽）= 2 × 6 = 12；面积 = 长 × 宽 = 8。',
  });

  // 1.10 平面图形（陷阱）：三条边要能围成三角形
  U.problems.push({
    id: 'g1-triangle-sides-trap', title: '3、4、8 三根小棒，能围成三角形吗？', grade: 1, domain: '图形', essence: ['E5', 'E3'], points: ['1.10'], level: 'trap', rung: 1,
    alias: ['三角形', '三边'], hook: '三根小棒围三角形，最长的一根不能太长。把 8 改成几，就能围成？',
    shelf: ['tri'],
    build() { const s = W.blank(); R(s, W.add(s, 'tri', 60, 60, { a: 3, b: 4, c: 8 }), 't'); return s; },
    predict: null,
    milestones: [
      { id: 'ok', say: '能围成三角形', score: 3, when: { type: 'tri', port: 'ok', op: '=', value: true },
        hints: ['三角形的两根短的加起来，要比最长的那根长。', '3 + 4 = 7，比 8 短，所以围不成。', '把第三根改成比 7 短的数，比如 5。'] },
      { id: 'right', say: '是直角三角形', score: 4, when: { type: 'tri', port: 'right', op: '=', value: true },
        hints: ['直角三角形满足：两根短边的平方和等于长边的平方。', '3、4 是两根短边，看 3² + 4² 等于几。', '把第三根改成 5，3、4、5 是直角三角形。'] },
    ],
    traps: [{ id: 'too-long', wrong: '8 太长：3 + 4 = 7 < 8，两根短的接不到一起，围不成。', when: { type: 'tri', port: 'ok', op: '=', value: false } }],
    goal: ['right'],
    why: '三角形任意两边之和要大于第三边。3 + 4 = 7 < 8，所以 8 太长；改成 5 时可以围成三角形，并且是直角三角形。',
  });

  // 1.11 20 以内退位减法（核心）
  U.problems.push({
    id: 'g1-minus-core', title: '13 减 9 是几？', grade: 1, domain: '数与运算', essence: ['E2'], points: ['1.11'], level: 'core', rung: 1,
    alias: ['退位减法', '20以内'], hook: '13 个苹果吃掉 9 个，还剩几个？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 13 }), 'a'); R(s, W.add(s, 'num', 60, 200, { n: 9 }), 'b'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['拿走，用减法。', '运算器选 −。', '放一台运算器，选 −。'] },
      { id: 'four', say: '13 − 9 = 4', score: 4, when: { type: 'op', port: 'r', op: '=', value: '4' },
        hints: ['13 放甲口，9 放乙口。', '甲接 13，乙接 9。', '甲接 13，乙接 9，运算选 −，结果是 4。'] },
    ],
    traps: [], goal: ['four'],
    why: '13 − 9 = 4。减得多的时候，可以先看 10 与 9 的关系。',
  });

  // 1.11 破十法（陷阱）：13 − 9 先减 3 到 10，再减 6
  U.problems.push({
    id: 'g1-minus-break-trap', title: '13 减 9：先减到 10，再减剩下的', grade: 1, domain: '数与运算', essence: ['E2'], points: ['1.11'], level: 'trap', rung: 1,
    alias: ['破十法', '退位减法'], hook: '13 减 9 不好直接算。把 9 拆成 3 和 6，先从 13 减 3 得到整十数，再减 6。',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 40, { n: 13 }), 'a'); R(s, W.add(s, 'num', 60, 150, { n: 3 }), 'b'); R(s, W.add(s, 'num', 60, 260, { n: 6 }), 'c'); return s; },
    predict: null,
    milestones: [
      { id: 'ten', say: '13 − 3 = 10', score: 2, when: { type: 'op', port: 'r', op: '=', value: '10' },
        hints: ['先凑整十：从 13 里先减去多少就到 10？', '第一台运算器：13 − 3。', '甲接 13，乙接 3，运算选 −。'] },
      { id: 'four', say: '10 − 6 = 4', score: 4, when: { type: 'op', port: 'r', op: '=', value: '4' },
        hints: ['第一步得到 10，再减剩下的 6。', '第二台运算器：甲接第一步的结果，乙接 6。', '第二台：10 − 6，结果是 4。'] },
    ],
    traps: [{ id: 'sub-six', wrong: '13 − 6 = 7：这是只减了 6，没有减 9。', when: { type: 'op', port: 'r', op: '=', value: '7' } }],
    goal: ['four'],
    why: '9 = 3 + 6。13 − 3 = 10，10 − 6 = 4。先减到整十，再减剩下的，就是破十法。',
  });

  // 1.12 分类与整理（核心）：分类后数一数，再用总数校验
  U.problems.push({
    id: 'g1-classify-count-core', title: '5 个筹码，3 红 2 蓝：分完类数一数，总数对吗？', grade: 1, domain: '数与运算', essence: ['E2'], points: ['1.12'], level: 'core', rung: 1,
    alias: ['分类', '整理', '总数'], hook: '先按颜色分，再把每一类数出来，最后和总数核对。',
    shelf: ['counter', 'op', 'num', 'compare'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 5 }), 'total'); return s; },
    predict: null,
    milestones: [
      { id: 'put', say: '放 5 个筹码', score: 2, when: { count: { type: 'counter', ge: 5 } },
        hints: ['每个筹码代表一个东西。', '放进台面，每个筹码 1 个。', '放 5 个筹码，3 个红色、2 个蓝色。'] },
      { id: 'sum', say: '把筹码的数加起来，得到 5', score: 2, when: { type: 'op', port: 'r', op: '=', value: '5' },
        hints: ['把筹码一个一个加起来。', '用运算器，把两个筹码接在一起，再接下一个。', '4 台运算器串起来，最后结果是 5。'] },
      { id: 'check', say: '和总数 5 一样', score: 4, when: { type: 'compare', port: 'ok', op: '=', value: true },
        hints: ['总数是 5，把数出来的结果和它比一比。', '放一台比较器：甲接数出来的结果，乙接总数 5。', '比较器关系选 =，成立就对了。'] },
    ],
    traps: [], goal: ['check'],
    why: '分类后数一数，再用总数核对：3 + 2 = 5，和总数一致，说明没有漏数也没有重复数。',
  });

  // 1.12 分类与整理（陷阱）：漏数了，总数对不上
  U.problems.push({
    id: 'g1-classify-check-trap', title: '6 个筹码分完类，数出来的总数对吗？', grade: 1, domain: '数与运算', essence: ['E2'], points: ['1.12'], level: 'trap', rung: 1,
    alias: ['分类', '总数校验', '漏数'], hook: '一共 6 个筹码，4 红 2 蓝。如果漏数了，总数就对不上。',
    shelf: ['counter', 'op', 'num', 'compare'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 6 }), 'total'); return s; },
    predict: null,
    milestones: [
      { id: 'put', say: '放 6 个筹码', score: 2, when: { count: { type: 'counter', ge: 6 } },
        hints: ['每个筹码都要放进台面。', '一共 6 个，别漏掉。', '放 6 个筹码。'] },
      { id: 'check', say: '数出来的总数和 6 一样', score: 4, when: { type: 'compare', port: 'ok', op: '=', value: true },
        hints: ['把所有筹码加起来，再和总数 6 比。', '先用运算器把筹码串起来，再接比较器。', '比较器关系选 =，成立说明没有漏数。'] },
    ],
    traps: [{ id: 'miscount', wrong: '数出来的总数和题目不一样：有没有漏数，或者把同一个筹码数了两次？', when: { type: 'compare', port: 'ok', op: '=', value: false } }],
    goal: ['check'],
    why: '总数校验：分类后数出来的总数必须和题目的总数一样。不一样，就说明漏数或者重复数了。',
  });

  // 1.14 认识人民币（核心）：同单位的钱可以相加
  U.problems.push({
    id: 'g1-money-add-core', title: '买文具：铅笔 5 元，橡皮 3 元，一共多少钱？', grade: 1, domain: '数与运算', essence: ['E5', 'E3'], points: ['1.14'], level: 'core', rung: 1,
    alias: ['人民币', '元', '购物'], hook: '买了一支铅笔和一块橡皮，各付了多少钱？一共是多少元？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 5, unit: 6 }), 'pencil'); R(s, W.add(s, 'num', 60, 200, { n: 3, unit: 6 }), 'eraser'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['两样东西的钱合在一起，用加法。', '运算器选 +。', '放一台运算器。'] },
      { id: 'eight', say: '一共 8 元', score: 4, when: { type: 'op', port: 'r', op: '=', value: '8' },
        hints: ['铅笔 5 元放甲口，橡皮 3 元放乙口。', '甲接铅笔，乙接橡皮。', '甲接铅笔，乙接橡皮，运算选 +，结果是 8 元。'] },
    ],
    traps: [], goal: ['eight'],
    why: '钱的单位相同（都是元），可以直接相加：5 元 + 3 元 = 8 元。',
  });

  // 1.14 人民币（陷阱）：3 角不是 3 元
  U.problems.push({
    id: 'g1-money-jiao-trap', title: '一支笔 5 元 3 角，要写成几元？', grade: 1, domain: '数与运算', essence: ['E5', 'E3'], points: ['1.14'], level: 'trap', rung: 1,
    alias: ['人民币', '角', '元'], hook: '5 元 3 角 = 5 元 + 3 角。1 角是几元？',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 5, unit: 6 }), 'yuan'); R(s, W.add(s, 'num', 60, 200, { n: 3, unit: 6 }), 'jiao'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['5 元和 3 角合在一起，用加法。', '3 角要先换成元，1 角 = 0.1 元。', '先把“3 角”改成 3/10 元，再放运算器。'] },
      { id: 'five-three', say: '5 元 3 角 = 5.3 元', score: 4, when: { type: 'op', port: 'r', op: '=', value: '53/10' },
        hints: ['1 角是 1/10 元，3 角就是 3/10 元。', '把“3 角”的分母改成 10。', '分母改成 10 后，甲接 5，乙接 3/10，运算选 +。'] },
    ],
    traps: [{ id: 'jiao-as-yuan', wrong: '3 角不是 3 元：3 角 = 0.3 元，5 元 3 角 = 5.3 元。', when: { type: 'op', port: 'r', op: '=', value: '8' } }],
    goal: ['five-three'],
    why: '1 元 = 10 角，所以 3 角 = 0.3 元。5 元 3 角 = 5.3 元，而不是 8 元。',
  });

  // 1.15 100 以内加减法（核心）
  U.problems.push({
    id: 'g1-add-two-digit-core', title: '45 加 38 是多少？', grade: 1, domain: '数与运算', essence: ['E2'], points: ['1.15'], level: 'core', rung: 1,
    alias: ['两位数', '加法', '100以内'], hook: '两位数加两位数，个位和十位分开算。',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 45 }), 'a'); R(s, W.add(s, 'num', 60, 200, { n: 38 }), 'b'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['合起来，用加法。', '运算器选 +。', '放一台运算器。'] },
      { id: 'eighty-three', say: '45 + 38 = 83', score: 4, when: { type: 'op', port: 'r', op: '=', value: '83' },
        hints: ['45 放甲口，38 放乙口。', '甲接 45，乙接 38。', '甲接 45，乙接 38，运算选 +，结果是 83。'] },
    ],
    traps: [], goal: ['eighty-three'],
    why: '45 + 38 = 83。个位 5 + 8 = 13，满十进一，十位 4 + 3 + 1 = 8。',
  });

  // 1.15 100 以内加减法（陷阱）：个位不够减，要向十位借 1
  U.problems.push({
    id: 'g1-sub-borrow-trap', title: '52 减 27 是多少？个位不够减怎么办？', grade: 1, domain: '数与运算', essence: ['E2'], points: ['1.15'], level: 'trap', rung: 1,
    alias: ['退位减法', '两位数', '借位'], hook: '个位 2 不够减 7，要从十位借 1 当作 10。',
    shelf: ['num', 'op'],
    build() { const s = W.blank(); R(s, W.add(s, 'num', 60, 60, { n: 52 }), 'a'); R(s, W.add(s, 'num', 60, 200, { n: 27 }), 'b'); return s; },
    predict: null,
    milestones: [
      { id: 'op', say: '放一台运算器', score: 2, when: { count: { type: 'op', ge: 1 } },
        hints: ['拿走一部分，用减法。', '运算器选 −。', '放一台运算器，选 −。'] },
      { id: 'twenty-five', say: '52 − 27 = 25', score: 4, when: { type: 'op', port: 'r', op: '=', value: '25' },
        hints: ['52 放甲口，27 放乙口。', '甲接 52，乙接 27。', '甲接 52，乙接 27，运算选 −，结果是 25。'] },
    ],
    traps: [{ id: 'wrong-27', wrong: '算成 35 是把 27 当成 17 减了（52 − 17 = 35）：个位不够减，要向十位借 1。', when: { type: 'op', port: 'r', op: '=', value: '35' } }],
    goal: ['twenty-five'],
    why: '52 − 27：个位 2 不够减 7，从十位借 1，变成 12 − 7 = 5；十位 4 − 1 − 2 = 1，所以是 25。',
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
