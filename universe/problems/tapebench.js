/* “线段图（和差倍）”的题。学生自己搭出几段、拖一段的长短，让“一共”或“相差”对上目标。
 * 全部可以在图上直接完成。判分只看器材的输出（甲、乙、几段、对没对上）。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const tp = (props) => () => { const s = W.blank(); const id = W.add(s, 'tapebench', 40, 50, props); s.entities[id].role = 't'; return s; };
  const P = [];
  const base = { domain: '关系', level: 'core', shelf: ['tapebench'], traps: [], predict: null, points: ['3.4'] };
  const add = (o) => P.push(Object.assign({}, base, o));
  const ms = (id, say, score, port, value, hints) => ({ id, say, score, when: { role: 't', port, op: '=', value: String(value) }, hints });

  add({
    id: 'tp-times-3', essence: ['E4', 'E7'], title: '“3 倍”画出来是什么样？', grade: 3, rung: 2,
    topics: ['倍的认识'], alias: ['倍', '几倍', '线段图'],
    hook: '小红有 6 朵花，小明的花是小红的 3 倍。现在两条线段都只有 1 段。点小明那条右边的 +，搭出“3 倍”，再把一段拖到 6。',
    build: tp({ ka: 1, kb: 1, u: 4, tk: 2, na: '小明', nb: '小红', unit: '朵' }),
    predict: { q: '小明有几朵？', options: [{ v: '9', label: '9 朵' }, { v: '18', label: '18 朵' }, { v: '3', label: '3 朵' }], answer: '18' },
    milestones: [ms('three', '小明 3 段', 3, 'ka', 3, ['3 倍就是 3 个那么多。', '点小明右边的 +。', '点两次。']), ms('val', '小明 18 朵', 5, 'a', 18, ['一段是小红的 6 朵。', '拖蓝色把手到 6。', '3 × 6 = 18。'])],
    goal: ['three', 'val'],
    why: '“小明是小红的 3 倍”：把小红的看成 1 段，小明就是这样的 3 段。3 × 6 = 18。倍说的是“几个那么多”，不是“多几个”。',
  });
  add({
    id: 'tp-sum-times', essence: ['E4', 'E7'], title: '和倍：一共 48，甲是乙的 3 倍', grade: 4, rung: 3,
    topics: ['和倍问题', '倍的认识'], alias: ['和倍', '线段图'],
    hook: '甲和乙一共 48，甲是乙的 3 倍。线段已经搭好了：甲 3 段、乙 1 段。拖蓝色把手改一段的长短，让“一共”正好是 48。先看下面“合起来看”那一行。',
    build: tp({ ka: 3, kb: 1, u: 5, tk: 0, tv: 48, lock: true }),
    predict: { q: '合起来一共有几段？', options: [{ v: '3', label: '3 段' }, { v: '4', label: '4 段' }, { v: '2', label: '2 段' }], answer: '4' },
    milestones: [ms('hit', '一共正好 48', 4, 'hit', 1, ['合起来是 4 段。', '4 段 = 48。', '一段 12。']), ms('a', '甲 36', 4, 'a', 36, ['一段 12。', '甲有 3 段。', '3 × 12 = 36。'])],
    goal: ['hit', 'a'],
    why: '甲 3 段、乙 1 段，合起来 4 段是 48，所以一段是 48 ÷ 4 = 12。乙 12，甲 36。和倍问题的关键是：和里面有“倍数 + 1”段。',
  });
  add({
    id: 'tp-diff-times', essence: ['E4', 'E7'], title: '差倍：甲比乙多 24，甲是乙的 4 倍', grade: 4, rung: 3,
    topics: ['差倍问题', '倍的认识'], alias: ['差倍', '线段图'],
    hook: '甲比乙多 24，甲是乙的 4 倍。先把甲搭成 4 段，再拖把手让“相差”正好是 24。多出来的是几段？',
    build: tp({ ka: 1, kb: 1, u: 5, tk: 1, tv: 24 }),
    predict: { q: '甲 4 段、乙 1 段，甲多出来几段？', options: [{ v: '3', label: '3 段' }, { v: '4', label: '4 段' }, { v: '5', label: '5 段' }], answer: '3' },
    milestones: [ms('four', '甲 4 段', 2, 'ka', 4, ['4 倍。', '点甲右边的 +。', '点 3 次。']), ms('b', '乙 8', 6, 'b', 8, ['多出来 3 段。', '3 段 = 24。', '一段 8。'])],
    goal: ['four', 'b'],
    why: '甲 4 段、乙 1 段，甲多出来 3 段，3 段是 24，一段是 8。乙 8，甲 32。差倍问题的关键是：差里面有“倍数 − 1”段。',
  });
  add({
    id: 'tp-sum-diff', essence: ['E4', 'E7'], title: '和差：一共 30，甲比乙多 6', grade: 4, rung: 3,
    topics: ['和差问题'], alias: ['和差', '线段图'],
    hook: '甲和乙一共 30，甲比乙多 6。线段图：乙是 1 段，甲是同样长的 1 段再加一截 6。拖把手让“一共”正好是 30。',
    build: tp({ ka: 1, kb: 1, ea: 6, u: 5, tk: 0, tv: 30, lock: true }),
    predict: { q: '把多出来的 6 拿掉，剩下的两段一共是多少？', options: [{ v: '24', label: '24' }, { v: '30', label: '30' }, { v: '36', label: '36' }], answer: '24' },
    milestones: [ms('hit', '一共正好 30', 4, 'hit', 1, ['合起来：2 段 + 6 = 30。', '2 段 = 24。', '一段 12。']), ms('a', '甲 18', 4, 'a', 18, ['一段 12。', '甲再加 6。', '12 + 6 = 18。'])],
    goal: ['hit', 'a'],
    why: '2 段 + 6 = 30。把多出来的 6 拿掉，两段一样长，一共 24，一段 12。乙 12，甲 12 + 6 = 18。这和天平上“两边同时拿走 6”是同一件事。',
  });
  add({
    id: 'tp-age', essence: ['E4', 'E7'], title: '年龄：爸爸比儿子大 27 岁，是儿子的 4 倍', grade: 5, rung: 4,
    topics: ['年龄问题', '差倍问题'], alias: ['年龄问题', '差倍', '线段图'],
    hook: '爸爸比儿子大 27 岁，爸爸的年龄是儿子的 4 倍。自己搭线段图，求两个人的年龄。',
    build: tp({ ka: 1, kb: 1, u: 5, tk: 1, tv: 27, na: '爸爸', nb: '儿子', unit: '岁' }),
    milestones: [ms('four', '爸爸 4 段', 2, 'ka', 4, ['4 倍。', '点爸爸右边的 +。', '点 3 次。']), ms('son', '儿子 9 岁', 3, 'b', 9, ['多出来 3 段 = 27。', '一段 9。', '拖把手到 9。']), ms('dad', '爸爸 36 岁', 3, 'a', 36, ['一段 9。', '4 段。', '4 × 9 = 36。'])],
    goal: ['four', 'son', 'dad'],
    why: '年龄差一直是 27。爸爸 4 段、儿子 1 段，差 3 段 = 27，一段 9。儿子 9 岁，爸爸 36 岁。年龄问题里不变的是“差”，所以常常是差倍问题。',
  });
  add({
    id: 'tp-times-more', essence: ['E4', 'E7'], title: '几倍多几：甲是乙的 2 倍多 3，一共 33', grade: 5, rung: 4,
    topics: ['和倍问题', '几倍多几'], alias: ['几倍多几', '和倍', '线段图'],
    hook: '甲是乙的 2 倍还多 3，两个一共 33。甲那条已经带着多出来的 3。把甲搭成 2 段，再拖把手。',
    build: tp({ ka: 1, kb: 1, ea: 3, u: 5, tk: 0, tv: 33 }),
    predict: { q: '合起来看是：', options: [{ v: 'a', label: '3 段 + 3 = 33' }, { v: 'b', label: '3 段 = 33' }, { v: 'c', label: '2 段 + 3 = 33' }], answer: 'a' },
    milestones: [ms('two', '甲 2 段', 2, 'ka', 2, ['2 倍。', '点甲右边的 +。', '点 1 次。']), ms('b', '乙 10', 6, 'b', 10, ['3 段 + 3 = 33。', '3 段 = 30。', '一段 10。'])],
    goal: ['two', 'b'],
    why: '3 段 + 3 = 33，先拿走多出来的 3：3 段 = 30，一段 10。乙 10，甲 2 × 10 + 3 = 23。先把“多出来的”去掉，剩下的就是整段。',
  });
  // 下面两道原来在旧的“线段图”器材上（编号不变）
  add({
    id: 'bm-more5', essence: ['E4', 'E7'], title: '小明有 8 个，小红比他多 5 个', grade: 2, rung: 2, points: ['2.5'],
    topics: ['线段图', '求比一个数多几的数'], alias: ['线段图', '多几', '应用题', '画图'],
    hook: '小明有 8 个，小红比他多 5 个，小红有几个？下面那条是小明，上面那条是小红：和小明一样长的一段，再接一截 5。把一段拖到 8。',
    build: tp({ ka: 1, kb: 1, ea: 5, u: 3, tk: 2, na: '小红', nb: '小明', unit: '个', lock: true }),
    milestones: [ms('ok', '小红有 13 个', 8, 'a', 13, ['小明是 8：把一段拖到 8。', '小红是同样的一段再接 5。', '8 + 5 = 13。'])],
    traps: [{ id: 'five-times', wrong: '“多 5”不是“是 5 倍”：多 5 是在 8 的后面再接 5，不是把 8 重复 5 次。', when: { role: 't', port: 'a', op: '=', value: '40' } }],
    goal: ['ok'],
    why: '小红 = 小明 + 5 = 8 + 5 = 13。线段图里，“多几”是在一条线段后面多出一截，这一截的长度就是 5。',
  });
  add({
    id: 'bm-times3', essence: ['E4', 'E7'], title: '哥哥 12 本，是弟弟的 3 倍', grade: 3, rung: 3, points: ['3.4'],
    topics: ['线段图', '倍的认识', '求一份数'], alias: ['线段图', '倍', '应用题', '画图'],
    hook: '哥哥有 12 本书，是弟弟的 3 倍，弟弟有几本？先把哥哥搭成 3 段，再拖把手改一段的长，让哥哥正好是 12。',
    build: tp({ ka: 1, kb: 1, u: 2, tk: 2, na: '哥哥', nb: '弟弟', unit: '本' }),
    predict: { q: '弟弟有几本？', options: [{ v: '4', label: '4 本' }, { v: '36', label: '36 本' }, { v: '9', label: '9 本' }], answer: '4' },
    milestones: [ms('three', '哥哥 3 段', 3, 'ka', 3, ['3 倍就是 3 段。', '点哥哥右边的 +。', '点两次。']), ms('ok', '哥哥 12 本', 5, 'a', 12, ['3 段一共 12。', '12 ÷ 3。', '把一段拖到 4。'])],
    traps: [{ id: 'times', wrong: '哥哥是弟弟的 3 倍，哥哥多、弟弟少：弟弟不是 12 × 3 = 36。', when: { role: 't', port: 'b', op: '=', value: '36' } }],
    goal: ['three', 'ok'],
    why: '哥哥是 3 段，一共 12 本，所以一段是 12 ÷ 3 = 4 本，弟弟就是这一段。知道几倍的那个数，求一倍数，用除法。',
  });
  U.problems.push.apply(U.problems, P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
