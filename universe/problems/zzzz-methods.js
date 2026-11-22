/* 思想方法：给题目标上用到的思想方法（枚举、倒推、假设、对应……），再按方法组织闯关链。
 *   一道题用到哪些方法，从四处来（都不用一道一道手写）：
 *     1. 题目自己写的 methods（手写的优先，可选）
 *     2. 题目所在的操作台：线段图就是画图、对应，换一换就是假设，倒水和状态图就是枚举、倒推……（BENCH）
 *     3. 随机题的档位：倒推 → 倒推，找全 → 枚举，最多最少 → 极端，推广 → 找规律，先猜 → 估算与检验（LEVEL）
 *        应用题引擎出的题再看题型：鸡兔同笼型 → 假设，年龄 → 不变量，归一 → 归一……（FAM）
 *     4. 题面里明明白白写出来的方法词：“假设”“倒过来”“规律”“奇数”“割补”……（WORDS，只认这些词，不猜）
 *   方法链：先是标了这个方法的操作台题（按年级、台阶排，轮流从不同的操作台取，不让一个台占满），
 *          再是随机题（同样轮流取，固定种子），上一关有星下一关才解锁（和操作台关卡链一样，接在 U.Chain 上，id 是 m:方法）。 */
(function (G) {
  'use strict';
  const U = G.U;
  const LIST = [
    { id: 'enum', name: '枚举', icon: '🔢', say: '有顺序地一个一个列出来，不重复、不遗漏。', more: '先定一个顺序（从小到大、先定第一个再看第二个），按顺序列，列完数一数。' },
    { id: 'back', name: '倒推', icon: '↩️', say: '从结果出发，一步一步往回想。', more: '最后是多少？上一步是多少？加变减、乘变除，倒着走回开头。' },
    { id: 'assume', name: '假设', icon: '🤔', say: '先假设都是一样的，再看差在哪里。', more: '假设全是鸡，腿少了几条？每换一只兔多几条腿？差几条就换几只。' },
    { id: 'draw', name: '画图', icon: '📏', say: '把数量关系画成线段图、关系图，一眼看清。', more: '一份画一段，几倍就画几段，多出来的单独画一截；关系画出来，算式就出来了。' },
    { id: 'corr', name: '对应', icon: '🔗', say: '找出“多少”和“几份”的对应。', more: '几个数量对应几份？两种分法差几个、对应差了几份？对上了，一份就求出来了。' },
    { id: 'unit', name: '归一', icon: '1️⃣', say: '先求一份是多少，再求几份。', more: '3 本 12 元，一本几元？先求“一份”，什么都好算了。' },
    { id: 'pattern', name: '找规律', icon: '🔁', say: '从几个例子找出规律，推广到一般。', more: '做几个，看每次变多少；照这个规律，第 100 个也能算出来，再验证一下。' },
    { id: 'extreme', name: '极端', icon: '📐', say: '看最大、最小、最边上（最坏）的情况。', more: '把所有可能比一比，最大最小常常在最边上；“一定能”要想最倒霉的情况。' },
    { id: 'invariant', name: '不变量', icon: '⚓', say: '变来变去，找那个不变的东西。', more: '年龄差不变，总数不变，零对放进去不改变数……抓住不变的，就有了等式。' },
    { id: 'parity', name: '奇偶', icon: '⚖️', say: '看奇数、偶数，一下子判断行不行。', more: '奇 + 奇 = 偶，偶 + 偶 = 偶；个位看 2 和 5，数字和看 3 和 9。' },
    { id: 'transform', name: '转化', icon: '🔄', say: '变成已经会做的问题。', more: '割一块补过去变成长方形，移多补少变成一样多，拆成整十整百好算。' },
    { id: 'classify', name: '分类', icon: '🗂️', say: '按一个标准分一分，一类一类地想。', more: '分的标准要一样；分完不重复、不遗漏；重叠的部分单独算。' },
    { id: 'equation', name: '等量与方程', icon: '🟰', say: '两边一样多，同时变还是一样多。', more: '天平两边同时拿走、同时平分，还是平的；一直做到一边只剩 x。' },
    { id: 'check', name: '估算与检验', icon: '✔️', say: '先估一估，做完再验一验。', more: '先猜个大概，做完对一对；别人的做法，一步一步重新算一遍找错。' },
  ];
  const BY = {}; LIST.forEach((m) => { BY[m.id] = m; });
  // 操作台本身用到的方法（这个台上的题都在用）。只放“这个台就是为这个方法做的”：数轴、统计表、日历、单位换算这类台不放，靠题面的方法词和题型
  const BENCH = {
    tapebench: ['draw', 'corr'], relbench: ['draw'], travelbench: ['draw'],
    swapbench: ['assume'], surplusbench: ['corr'], gapbench: ['corr'], pairbench: ['corr'],
    balancebench: ['equation'], systembench: ['equation'], termsbench: ['transform'],
    statebench: ['enum', 'back'], pourbench: ['enum'], combobench: ['enum'], chancebench: ['enum'],
    seqbench: ['pattern'], ringbench: ['pattern'],
    featbench: ['parity'], chipbench: ['invariant'], gaussbench: ['transform', 'invariant'], grassbench: ['invariant', 'corr'],
    weighbench: ['extreme'], optbench: ['extreme'],
    meanbench: ['transform'], areabench: ['transform'], circlebench: ['transform'], areamodel: ['transform'], fracbench: ['transform'], mulbench: ['transform'],
    vennbench: ['classify'], sortbench: ['classify'],
    jobbench: ['unit'], estbench: ['check'],
  };
  const LEVEL = { 4: ['back'], 5: ['check'], 6: ['check'], 7: ['enum'], 8: ['extreme'], 9: ['pattern'] };
  const FAM = { pair: ['draw'], age: ['invariant', 'draw'], swap: ['assume'], surplus: ['corr'], rate: ['unit'], meet: ['draw'] };
  const WORDS = [
    [/假设|假如全是|假如都是/, 'assume'], [/倒推|倒过来想|倒着想|往回想|往回推/, 'back'], [/列举|找全|一个不漏|有顺序地/, 'enum'],
    [/规律/, 'pattern'], [/奇数|偶数|奇偶/, 'parity'], [/最坏|最不利/, 'extreme'], [/不变/, 'invariant'],
    [/线段图/, 'draw'], [/割补|移多补少|转化|拼成长方形/, 'transform'], [/分类|分一分/, 'classify'], [/归一|先求一份|照这样/, 'unit'], [/方程|等量代换/, 'equation'],
  ];
  const benchOf = (p) => (p.quiz ? p.quiz.type : (p.shelf || [])[0]);
  function of(p) {
    if (!p) return [];
    const s = new Set((p.methods || []).filter((m) => BY[m]));
    (BENCH[benchOf(p)] || []).forEach((m) => s.add(m));
    if (p.quiz) { (LEVEL[p.quiz.level] || []).forEach((m) => s.add(m)); (FAM[p.quiz.fam] || []).forEach((m) => s.add(m)); }
    const txt = String(p.title || '') + ' ' + String(p.hook || '');
    for (const [re, m] of WORDS) if (re.test(txt)) s.add(m);
    return LIST.map((m) => m.id).filter((m) => s.has(m));
  }
  // 轮流从不同的操作台取：同一个台的题排成一队，每轮每个台取一道
  function spread(items, key, n) {
    const q = new Map(); for (const x of items) { const k = key(x); if (!q.has(k)) q.set(k, []); q.get(k).push(x); }
    const out = []; let more = true;
    while (out.length < n && more) { more = false; for (const L of q.values()) if (L.length && out.length < n) { out.push(L.shift()); more = true; } }
    return out;
  }
  const SEED = 900001, CACHE = {};
  const benchOk = (t) => !!U.types[t] && !!U.types[t].bench && !U.types[t].hidden;
  // 每个操作台：普通档（2、3，几个种子，题型会不一样）和特殊档（4–9，用 hasTask 试过的种子）各出一道，记下标签。只算一次
  let POOL = null;
  function quizPool() {
    if (POOL) return POOL;
    POOL = [];
    if (!U.Quiz) return POOL;
    for (const t of U.Quiz.types()) {
      if (!benchOk(t)) continue;
      const tries = [[2, SEED], [2, SEED + 2], [3, SEED + 3], [3, SEED + 5]].concat([4, 5, 6, 7, 8, 9].filter((lv) => U.Quiz.offers(t, lv)).map((lv) => [lv, SEED]));
      const seen = new Set();
      for (const [lv, seed] of tries) {
        const p = U.Quiz.make(t, seed, lv); if (!p) continue;
        const tags = of(p), k = lv + ':' + tags.join(','); if (lv <= 3 && seen.has(k)) continue; seen.add(k);
        POOL.push({ t, lv, id: p.id, tags });
      }
    }
    return POOL;
  }
  const pri = (x, mid) => ((LEVEL[x.lv] || []).includes(mid) ? 0 : x.lv <= 3 ? 1 : 2);   // 档位本身就是这个方法的最先，普通档其次，其它特殊档最后
  function chain(mid) {
    if (CACHE[mid]) return CACHE[mid];
    if (!BY[mid]) return [];
    const own = U.problems.filter((p) => benchOk(benchOf(p)) && of(p).includes(mid)).sort((a, b) => (a.grade || 9) - (b.grade || 9) || (a.rung || 0) - (b.rung || 0));
    const fixed = spread(own, benchOf, 6).sort((a, b) => (a.grade || 9) - (b.grade || 9) || (a.rung || 0) - (b.rung || 0)).map((p) => ({ id: p.id, title: p.title, kind: '题', type: benchOf(p) }));
    // 随机题：真的出一遍（固定种子），按出出来的题自己的标签挑（操作台本身的方法、档位、应用题引擎的题型：关系图出到鸡兔同笼型就是“假设”）
    const quiz = spread(quizPool().filter((x) => x.tags.includes(mid)).sort((a, b) => pri(a, mid) - pri(b, mid)), (x) => x.t, 4)
      .sort((a, b) => (a.lv <= 3 ? a.lv : 3.5) - (b.lv <= 3 ? b.lv : 3.5))
      .map((x) => ({ id: x.id, title: '随机 · ' + U.types[x.t].label + ' · ' + U.Quiz.LEVELS[x.lv - 1], kind: '随机', type: x.t }));
    CACHE[mid] = fixed.concat(quiz);
    return CACHE[mid];
  }
  U.Methods = {
    LIST, BENCH, LEVEL, FAM,
    get: (id) => BY[id] || null,
    of, chain,
    // 有方法链的方法（至少 4 关）
    chains: () => LIST.map((m) => m.id).filter((m) => chain(m).length >= 4),
  };
  // 接到 U.Chain 上：id 是 'm:方法' 的就是方法链；“下一关”先在当前这条链里找
  const C = U.Chain, of0 = C.of, next0 = C.next;
  C.of = (key) => (String(key).startsWith('m:') ? chain(String(key).slice(2)) : of0(key));
  C.next = (pid, pref) => {
    if (pref && String(pref).startsWith('m:')) { const L = C.of(pref), i = L.findIndex((x) => x.id === pid); if (i >= 0) return i + 1 < L.length ? { type: pref, id: L[i + 1].id, n: i + 2, of: L.length } : null; }
    return next0(pid);
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
