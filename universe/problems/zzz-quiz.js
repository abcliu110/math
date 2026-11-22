/* 随机出题（操作台）：每个操作台一个出题器，按种子和难度（1 容易、2 中等、3 难）出一道题，题还是在操作台上动手做。
 *   出题器 gen(R, level) 返回 { title, hook, props, goals: [[输出口, 值, 说法, 提示]], sol, why }：
 *     props 是台面开始的样子，goals 是要做到的输出，sol 是一份“做完以后”的属性（测试用它检查这道题做得出来）。
 *   题目的 id 是 quiz:器材:种子:难度，打开时现做（不放进题库，不算进知识点覆盖）。
 *   出出来的题如果一开始就已经达到目标（不用动手），换一个种子重出。
 * 测试（tests/run.js “随机出题”）：每个出题器、每个难度、几十个种子：题目 lint 通过；一开始没达到目标；套上 sol 以后达到目标。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World, Q = U.Q;
  const GENS = {}, GUESS = {}, TASKS = {};   // GUESS：哪些操作台能出“先猜”（算一次记住）
  const mkR = (seed) => { const r = U.Variants.rng(seed); const R = { r, int: (lo, hi) => lo + Math.floor(r() * (hi - lo + 1)), pick: (a) => a[Math.floor(r() * a.length)], bool: () => r() < 0.5 }; return R; };
  const qs = (n, d) => Q.show(Q(n, d || 1));
  const norm = (v) => { try { return Q.show(Q.parse(String(v))); } catch (e) { return String(v); } };
  const LEVELS = ['容易', '中等', '难', '倒推', '找错', '先猜', '找全', '最多最少', '推广'];   // 7–9 是通用任务层：不用每个操作台单写，从普通题自动变出来（见下面的 derive）
    // 第 6 档“先猜”：先估一估答案，再在操作台上做出来验证（每个出题器都有）   // 第 5 档“找错”：小明的做法里有一处错，找出来改对   // 第 4 档“倒推”：给结果，找条件（不是每个操作台都有）
  // 某个器材在题库里最常用的知识点、领域（给随机题当“归属”）
  function home(type) {
    const ps = U.problems.filter((p) => (p.shelf || [])[0] === type), cnt = {};
    ps.forEach((p) => (p.points || []).forEach((x) => { cnt[x] = (cnt[x] || 0) + 1; }));
    const pts = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a]);
    return { points: pts.slice(0, 1), domain: (ps[0] && ps[0].domain) || '数与运算', grade: ps.length ? Math.min(...ps.map((p) => p.grade || 9)) : 3 };
  }
  function build(type, props) { const s = W.blank(); const id = W.add(s, type, 40, 50, props); s.entities[id].role = 'q'; return s; }
  function reached(type, props, goals) {
    const s = build(type, props), D = W.evaluate(s), e = Object.values(s.entities).find((x) => x.type === type), out = (D[e.id] || {}).out || {};
    return goals.map(([port, value]) => !!out[port] && norm(U.Q.show(out[port].data)) === norm(value));
  }
  function answerOf(q) {
    if ('answer' in q) return q.answer === null || q.answer === undefined ? null : q.answer;   // 出题器写了 answer: null，就是这道题不适合先猜
    const g = q.goals[0]; if (!g || q.goals.length > 1) return null;   // 要做到好几件事的题（比如把点放到某处）不适合只猜一个数
    if (!(String(g[1]) === '1' || String(g[1]) === '0')) return g[1];
    const ns = String(g[2] || '').match(/−?\d+(\.\d+)?(\/\d+)?/g) || [];
    return ns.length === 1 ? ns[0].replace('−', '-') : null;
  }
  // 用操作台自己算出输出（出题时拿来求答案：转过去在哪里、过了多久……不用另外写公式）
  function sim(type, props) { const s = build(type, props), D = W.evaluate(s), e = Object.values(s.entities).find((x) => x.type === type), out = (D[e.id] || {}).out || {}, o = {}; for (const k of Object.keys(out)) o[k] = U.Q.show(out[k].data); return o; }
  // ===================== 通用任务层：从一道普通题变出 倒推、找全、最多最少、推广 =====================
  // 做法（不认操作台名字）：
  //   1. 取普通题“做完以后”的台面 F（props + sol），用操作台自己的画法和把手找出孩子在台面上改得到的整数属性（data-pick-set、grips）。
  //   2. 让这些属性一个一个（或两个一起）取遍附近的值，用操作台自己算输出（sim），得到“属性 → 输出”的表。
  //   3. 按表出题：
  //      倒推     只有一个值能让输出等于原来的结果：给结果，找这个条件（只挑普通题里“给定”的属性）
  //      找全     有 2–8 个值（或 2–10 对值）都行：一个一个找出来，每找到一种得一个里程碑
  //      最多最少 找全的那些做法里，另一个输出有大有小：哪一种让它最大 / 最小
  //      推广     输出随属性有规律地变（一次或二次）：先做三个，写下规律猜一个远一点的，再调过去验证
  //   出不来（台面上改不了数、没有好的规律）就不出，这个操作台在这一档没有按钮。
  // 名字不好读、或者扫出来没有数学意义的属性（显示用的序号、计数器、编码），在 TSKIP 里跳过；TNAME 给属性、输出起孩子读得懂的名字。
  const TSKIP = { estbench: '*', relbench: '*', statebench: '*', clockbench: '*', chancebench: '*', rulerbench: '*', seqbench: ['k'], solidbench: ['cols', 'rows'], ringbench: ['beats'], calbench: ['d1', 'd2'], pigeonbench: '*', treebench: ['open'] };
  const TNAME = { treebench: { m: '卡片张数', amt: '要凑的钱数' }, seqbench: { n: '第几个' }, numlinebench: { '>value': '落点' }, anglebench: { a: '∠1 的度数' } };
  const CONDT = ['', '其中双数', '其中单数'];
  const TNOX = ['calbench'];   // 输出不能比大小（星期几）：不出“最多最少”
  // 标签“一一对应：上面剩几个（连完才有）”→“上面剩几个”：去掉括号里的说明；有冒号时取冒号后面（后面是“1 是”这种开关说明就取前面）
  const cleanLab = (s) => { const a = String(s || '').replace(/（[^）]*）|\([^)]*\)/g, '').trim(), i = a.lastIndexOf('：'); if (i < 0) return a; const r = a.slice(i + 1).trim(); return r && !/^\d/.test(r) ? r : a.slice(0, i).trim(); };
  function reachable(type, props) {
    const s = build(type, props), D = W.evaluate(s), e = Object.values(s.entities).find((x) => x.type === type), d = U.types[type], dd = D[e.id] || {}, keys = new Set();
    const c = { ent: e, props: dd.props || e.props, d: dd, out: dd.out || {}, state: e.state, w: 600, h: 400, t: 0, n: 0, scene: s };
    let svg = ''; try { svg = String(d.draw(c)); } catch (x) { svg = ''; }
    // 按钮只给几个固定的值（比如“×2”“×3”）时，不是什么值都调得到：要有 +1 / −1 的按钮，或者一排按钮把整个范围都给全了，才算“能调到任意值”
    const vals = {};
    for (const m of svg.matchAll(/data-pick-set="([^"]+)"/g)) { try { const o = JSON.parse(decodeURIComponent(m[1])); for (const k of Object.keys(o)) (vals[k] = vals[k] || new Set()).add(+o[k]); } catch (x) { /* 不是 JSON */ } }
    for (const k of Object.keys(vals)) { const P = d.props[k], v = +(c.props[k] !== undefined ? c.props[k] : P && P.default); if (P && (vals[k].has(v + 1) || vals[k].has(v - 1) || (P.max !== undefined && P.min !== undefined && vals[k].size >= P.max - P.min))) keys.add(k); }
    let gs = []; try { gs = d.grips ? d.grips(c) || [] : []; } catch (x) { gs = []; }
    for (const g of gs) for (const [dx, dy] of [[30, 0], [-30, 0], [0, 30], [0, -30]]) { try { const p = g.drag && g.drag(c, { x: g.x + dx, y: g.y + dy }); if (p) Object.keys(p).forEach((k) => keys.add(k)); } catch (x) { /* 拖不动 */ } }
    const skip = TSKIP[type] || [];
    return [...keys].filter((k) => d.props[k] && d.props[k].type === 'int' && !d.props[k].hidden && !skip.includes(k)).sort();
  }
  function derive(type, q0, level, R) {
    if (TSKIP[type] === '*') return null;
    const d = U.types[type], F = Object.assign({}, q0.props, q0.sol), solKeys = Object.keys(q0.sol || {});
    const out = (patch) => { const o = sim(type, Object.assign({}, F, patch)), r = {}; for (const k of Object.keys(o)) if (/^−?-?\d+(\.\d+)?(\/\d+)?$/.test(o[k])) r[k] = norm(o[k]); return r; };
    const o0 = out({}), keys = reachable(type, F); if (!keys.length) return null;
    const nm = (k) => (TNAME[type] && TNAME[type][k]) || cleanLab(d.props[k].label);
    const on = (p) => (TNAME[type] && TNAME[type]['>' + p]) || cleanLab(d.outputs[p].label);
    const first = q0.goals.map((g) => g[0]);
    const ports = [...new Set(first.concat(Object.keys(d.outputs)))].filter((p) => p in o0 && on(p) && !/1 是|0 否|：1/.test(d.outputs[p].label || ''));
    const span = (k) => { const P = d.props[k], v = +F[k], lo = Math.max(P.min !== undefined ? P.min : v - 20, v - 30), hi = Math.min(P.max !== undefined ? P.max : v + 20, v + 30), a = []; for (let x = lo; x <= hi; x++) a.push(x); return a; };
    // 输出是不是“有意义”：至少 3 种值、不只是 0/1、不是把这个属性原样抄出来
    const good = (rows, p, k) => { const ys = rows.map((r) => r.o[p]), set = new Set(ys.filter((y) => y !== undefined)); return set.size >= 3 && ![...set].every((y) => y === '0' || y === '1') && !(k && rows.every((r) => r.o[p] === undefined || r.o[p] === norm(r.v))); };
    const start = (patch) => Object.assign({}, F, patch);
    const scan1 = {}; if (level === 4 || level === 9) for (const k of keys) scan1[k] = span(k).map((v) => ({ v, o: out({ [k]: v }) }));
    const tries = R.pick([0, 1]) ? keys.slice().reverse() : keys.slice();
    const hk = (k, v) => ['一个一个试：把“' + nm(k) + '”从小到大调。', '看操作台上的读数：' + nm(k) + '变了，结果跟着怎么变？', nm(k) + '是 ' + v + '。'];
    if (level === 4) {
      for (const k of tries) { if (solKeys.includes(k)) continue;
        for (const p of ports) { const rows = scan1[k], V = o0[p]; if (!good(rows, p, k)) continue; const hit = rows.filter((r) => r.o[p] === V); if (hit.length !== 1 || hit[0].v !== +F[k]) continue;
          const others = rows.filter((r) => r.o[p] !== undefined && r.o[p] !== V); if (!others.length) continue; const s0 = R.pick(others).v;
          return { task: 'rev', title: '倒过来想：要让「' + on(p) + '」正好是 ' + V + '，「' + nm(k) + '」应该是几？', hook: '先随便调一个，看结果比 ' + V + ' 大还是小，再往回调。条件找到了，结果才对。', props: start({ [k]: s0 }), goals: [[p, V, nm(k) + '是 ' + F[k], hk(k, F[k]), { [k]: +F[k] }, null, nm(k) + '是几？']], sol: { [k]: +F[k] }, answer: +F[k], why: '倒着想：从结果出发，找出是哪个条件让它成立。' }; } }
      return null;
    }
    if (level === 9) {
      for (const k of tries) for (const p of ports) { const rows = scan1[k].filter((r) => r.o[p] !== undefined && /^-?\d+$/.test(r.o[p])); if (rows.length < 8 || !good(rows, p, k)) continue;
        const xs = rows.map((r) => r.v), ys = rows.map((r) => +r.o[p]); if (!xs.every((x, i) => !i || x === xs[i - 1] + 1)) continue;
        const d2 = []; for (let i = 2; i < ys.length; i++) d2.push(ys[i] - 2 * ys[i - 1] + ys[i - 2]); if (!d2.every((x) => x === d2[0])) continue;
        const i0 = R.int(0, Math.max(0, Math.min(3, rows.length - 8))), smp = rows.slice(i0, i0 + 3), far = rows[rows.length - 1]; if (far.v - smp[2].v < 5) continue;
        const rest = rows.filter((r) => !smp.includes(r) && r !== far && r.v !== far.v); if (!rest.length) continue; const s0 = R.pick(rest).v;
        const g = smp.map((r) => [p, r.o[p], nm(k) + '是 ' + r.v + ' 时，' + on(p) + '是 ' + r.o[p], hk(k, r.v), { [k]: r.v }, null, nm(k) + '是 ' + r.v + ' 时，' + on(p) + '是几？']).concat([[p, far.o[p], nm(k) + '是 ' + far.v + ' 时，' + on(p) + '是 ' + far.o[p] + '（猜对了吗？）', ['先在上面写下你的猜想，再调过去看。', '前面三个，每次多几？', nm(k) + '调到 ' + far.v + '。'], { [k]: far.v }, null, nm(k) + '是 ' + far.v + ' 时，' + on(p) + '是几？（先写猜想，再调过去验证）']]);
        const lin = d2[0] === 0, step = ys[1] - ys[0];
        return { task: 'gen', title: '找规律：「' + nm(k) + '」是 ' + smp.map((r) => r.v).join('、') + ' 时，「' + on(p) + '」各是几？照这个规律，' + nm(k) + '是 ' + far.v + ' 时呢？', hook: '先在操作台上做出前三个，看每次' + (lin ? '变多少' : '多出来的又怎么变') + '。在上面写下你的猜想，再调到 ' + far.v + ' 验证。',
          props: start({ [k]: s0 }), goals: g, sol: { [k]: far.v }, sols: g.map((x) => x[4]), predict: { form: 'number', q: '做完前三个、找到规律以后再写：' + nm(k) + '是 ' + far.v + ' 时，' + on(p) + '是几？', answer: far.o[p] },
          why: lin ? '每次都' + (step >= 0 ? '多 ' + step : '少 ' + -step) + '：从第一个出发，加上“隔了几次 × 每次多几”。' + '这就是从几个例子推广到一般。' : '每次多出来的数也在有规律地变：先找“差”，再找“差的差”。这就是从几个例子推广到一般。' };
      }
      return null;
    }
    // 找全 / 最多最少：先试两个属性一起变，再试一个。说了“全部”就要真的全：只用取值范围有限（不超过 61 个）的属性，整个范围都扫
    const full = (k) => { const P = d.props[k]; if (P.min === undefined || P.max === undefined || P.max - P.min > 60) return null; const a = []; for (let x = P.min; x <= P.max; x++) a.push(x); return a; };
    const fk = keys.filter(full), sets = [];
    for (let i = 0; i < fk.length; i++) for (let j = i + 1; j < fk.length; j++) { const A = full(fk[i]), B = full(fk[j]), rows = []; if (A.length * B.length > 900) continue; for (const a of A) for (const b of B) rows.push({ v: [a, b], o: out({ [fk[i]]: a, [fk[j]]: b }) }); sets.push({ ks: [fk[i], fk[j]], rows, max: 10 }); }
    for (const k of fk) sets.push({ ks: [k], rows: full(k).map((v) => ({ v: [v], o: out({ [k]: v }) })), max: 8 });
    if (R.bool()) sets.reverse();
    for (const S of sets) for (const p of ports) {
      const V = o0[p], ks = S.ks, hit = S.rows.filter((r) => r.o[p] === V); if (hit.length < 2 || hit.length > S.max || hit.length * 3 > S.rows.length) continue;
      if (!good(S.rows, p, ks.length === 1 ? ks[0] : null) || ks.some((k, i) => S.rows.every((r) => r.o[p] === undefined || r.o[p] === norm(r.v[i])))) continue;
      if (level === 8 && TNOX.includes(type)) continue;
      const miss = S.rows.filter((r) => r.o[p] !== undefined && r.o[p] !== V); if (!miss.length) continue;
      const pat = (r) => { const o = {}; ks.forEach((k, i) => { o[k] = r.v[i]; }); return o; }, say = (r) => ks.map((k, i) => nm(k) + ' ' + r.v[i]).join('，');
      const names = ks.map((k) => '「' + nm(k) + '」').join('和'), s0 = pat(R.pick(miss));
      if (level === 7) return { task: 'all', title: '要让「' + on(p) + '」是 ' + V + '，' + names + '可以是几？把所有的都找出来（一共 ' + hit.length + ' 种）', hook: '有顺序地找：' + nm(ks[0]) + '从小到大一个一个试' + (ks.length > 1 ? '，每试一个，再看' + nm(ks[1]) + '要是几' : '') + '。这样不重复、不遗漏。',
        props: start(s0), goals: hit.map((r, i) => [p, V, say(r), ['按顺序试，别跳着找。', '已经找到的在下面打了勾，还差哪几种？', say(r) + '。'], pat(r), null, '第 ' + (i + 1) + ' 种：？']), sol: pat(hit[0]), sols: hit.map(pat), why: '有顺序地列举，才能找全：从小到大，一个不漏。' };
      for (const p2 of ports) { if (p2 === p) continue; const ys = hit.map((r) => r.o[p2]); if (ys.some((y) => y === undefined) || ks.some((k, i) => hit.every((r) => r.o[p2] === norm(r.v[i])))) continue; /* 把属性原样抄出来的输出不算 */ const vs = ys.map((y) => Q.num(Q.parse(y))); if (new Set(vs).size < 3) continue;
        const big = R.bool(), best = big ? Math.max(...vs) : Math.min(...vs), win = hit.filter((r, i) => vs[i] === best); if (win.length > 2) continue;
        const bv = hit[vs.indexOf(best)].o[p2];
        return { task: 'ext', title: '「' + on(p) + '」要是 ' + V + '，怎样让「' + on(p2) + '」' + (big ? '最大' : '最小') + '？最' + (big ? '大' : '小') + '是几？', hook: '先找出几种让' + on(p) + '是 ' + V + '的做法，比一比' + on(p2) + '。往哪边变，它会越来越' + (big ? '大' : '小') + '？',
          props: start(s0), goals: [[p2, bv, on(p) + '是 ' + V + '，' + on(p2) + (big ? '最大' : '最小') + '是 ' + bv, ['先让' + on(p) + '是 ' + V + '，再比一比不同做法的' + on(p2) + '。', '往一头调到底（最极端的那种）。', say(win[0]) + '。'], null, [p, V], on(p) + '是 ' + V + '，' + on(p2) + (big ? '最大' : '最小') + '是几？']],
          sol: pat(win[0]), answer: bv, why: '最大、最小常常在“最极端”的地方：把所有可能列出来比一比，就看清了。' };
      }
    }
    return null;
  }
  // 没做到之前，步骤栏不显示答案：说法里的目标值（和先猜的答案）换成“？”；0、1 这种开关值不换（“赢了”“对了”本来就不是答案）
  function hide(say, value, q) {
    let ans = null; try { ans = answerOf(q); } catch (e) { ans = null; }
    const vs = [value, ans].filter((v) => v !== undefined && v !== null && !/^[01]$/.test(norm(v))).map((v) => norm(v));
    let s = String(say || ''), hit = false;
    for (const v of vs) { const re = new RegExp('(^|[^0-9./])' + v.replace(/\./g, '\\.').replace(/^-/, '[-−]') + '(?![0-9./])', 'g'); s = s.replace(re, (m0, pre) => { hit = true; return pre + '？'; }); }
    return hit ? s : undefined;
  }
  function make(type, seed, level) {
    const g = GENS[type]; if (!g) return null;
    let q = null;
    const task = level >= 7 || (level === 4 && !g.rev);
    const fn = task ? g.gen : level === 5 ? g.bug : level === 4 ? g.rev : g.gen; if (!fn) return null;
    const lv = level === 6 || task ? 2 : level;
    for (let i = 0; i < (task ? 8 : 30); i++) { let c = fn.call(g, mkR(seed + i * 7919), lv); if (task) { c = derive(type, c, level, mkR(seed * 7 + i)); if (!c) continue; } else if (reached(type, c.props, c.goals).some(Boolean)) continue; if (level === 6 && answerOf(c) === null) continue; q = c; break; }
    if (!q) return null;
    // 光秃秃的算式（“47 + 38 用竖式算”）一半配上情境：同一个算式，讲成合并、比较、几倍、平均分……
    const R2 = mkR(seed * 31 + level), bare = /^(\d+(?:\.\d+)?) ([+−×÷]) (\d+(?:\.\d+)?)(.*)$/.exec(q.title);
    if (bare && level <= 3 && !/[+−×÷…]/.test(bare[4]) && R2.bool() && !(bare[2] === '−' && +bare[1] < +bare[3])) q = Object.assign({}, q, { title: U.Word.story(R2, bare[2], +bare[1], +bare[3]) + '（' + bare[1] + ' ' + bare[2] + ' ' + bare[3] + '）' });
    let predict = null;
    if (level === 6) { const ans = answerOf(q); predict = { form: 'number', q: '先想一想：答案是多少？写下你的答案，再在操作台上做出来验证。', answer: String(ans) }; }
    if (q.predict) predict = q.predict;
    const h = home(type), t = U.types[type];
    // 第 5 项 need：还要哪些属性正好是几（找全、推广）；第 6 项 also：[另一个输出口, 值] 也要同时做到（最多最少）
    const ms = q.goals.map(([port, value, say, hints, need, also, ask], i) => { const w = { role: 'q', port, op: '=', value: norm(value) }, more = Object.keys(need || {}).map((key) => ({ prop: { role: 'q', key, value: need[key] } })).concat(also ? [{ role: 'q', port: also[0], op: '=', value: norm(also[1]) }] : []); return { id: 'g' + i, say, ask: ask || hide(say, value, q), score: Math.max(q.goals.length > 4 ? 1 : 2, Math.round(8 / q.goals.length)), when: more.length ? { all: [w].concat(more) } : w, hints: hints || ['看看台面上的说明。', '一步一步来。', '答案是 ' + value + '。'] }; });
    return {
      id: 'quiz:' + type + ':' + seed + ':' + level, title: '🎲 ' + q.title, grade: h.grade, domain: h.domain, points: h.points, essence: t.essence || ['E2'], level: 'core', rung: level >= 6 ? 3 : level + 1,
      topics: ['随机练习'], alias: ['随机', '练习'], hook: q.hook, shelf: [type], build: () => build(type, q.props), milestones: ms, goal: ms.map((m) => m.id), traps: [], predict,
      why: q.why || '做对了。换一题再试试：同一种题，数不一样，想法一样。', quiz: { type, seed, level, sol: q.sol, sols: q.sols, props: q.props, task: q.task, fam: q.fam },
    };
  }
  U.Quiz = {
    LEVELS,
    add: (type, def) => { GENS[type] = def; },
    has: (type) => !!GENS[type] && !!U.types[type],
    hasRev: (type) => !!GENS[type] && !!U.types[type] && (!!GENS[type].rev || U.Quiz.hasTask(type, 4)),
    // 通用任务层这一档（4 倒推、7 找全、8 最多最少、9 推广）出不出得来：用固定种子试一次，记住
    hasTask: (type, lv) => { const k = type + ':' + lv; if (!(k in TASKS)) TASKS[k] = !!GENS[type] && !!U.types[type] && !!make(type, 900001, lv); return TASKS[k]; },
    // 这一档是不是通用任务层自动变出来的（不是每个种子都出得来，界面上会换种子重试）
    isTask: (type, lv) => lv >= 7 || (lv === 4 && !!GENS[type] && !GENS[type].rev),
    // 这一档在这个操作台上有没有按钮
    offers: (type, lv) => (lv <= 3 ? U.Quiz.has(type) : lv === 4 ? U.Quiz.hasRev(type) : lv === 5 ? U.Quiz.hasBug(type) : lv === 6 ? U.Quiz.hasGuess(type) : U.Quiz.hasTask(type, lv)),
    // 一道随机题在某个台面上做到了哪些里程碑（按判分的同一套条件）
    done(p, props) { const s = build(p.quiz.type, props), D = W.evaluate(s), Wd = U.Judge.makeW(s, D, {}); return p.milestones.map((m) => { try { return !!U.Judge.compile(m.when)(Wd); } catch (e) { return false; } }); },
    hasBug: (type) => !!GENS[type] && !!GENS[type].bug && !!U.types[type],
    types: () => Object.keys(GENS).filter((t) => U.types[t]),
    make, reached, answerOf, sim,
    hasGuess: (type) => { if (!(type in GUESS)) GUESS[type] = !!GENS[type] && !!U.types[type] && !!make(type, 900001, 6); return GUESS[type]; },
    id: (type, seed, level) => 'quiz:' + type + ':' + (seed >>> 0) + ':' + (level || 1),
    fromId(id) { const m = /^quiz:([a-z0-9_-]+):(\d+):([1-9])$/.exec(String(id)); return m ? make(m[1], +m[2], +m[3]) : null; },
  };
  const base = U.problemById;
  U.problemById = (id) => (String(id).startsWith('quiz:') ? U.Quiz.fromId(id) : base(id));

  // ===================== 出题器 =====================
  const add = U.Quiz.add;
  const digitsOf = (n) => String(n).split('').reverse().map(Number);
  // 竖式加法：要点进位的列；减法：要点退位的列
  function addMarks(a, b) { const A = digitsOf(a), B = digitsOf(b), ms = []; let c = 0; for (let j = 0; j < Math.max(A.length, B.length); j++) { const s = (A[j] || 0) + (B[j] || 0) + c; c = s >= 10 ? 1 : 0; if (c) ms.push(j + 1); } return ms; }
  function subMarks(a, b) { const A = digitsOf(a), B = digitsOf(b), ms = new Set(); for (let j = 0; j < A.length; j++) { const top = A[j] - (ms.has(j) ? 1 : 0); if (top < (B[j] || 0)) ms.add(j + 1); } return [...ms].sort(); }
  const rev = (n) => String(n).split('').reverse().join('');

  add('vertbench', { gen(R, lv) {
    if (lv === 1) { const a = R.int(15, 79), b = R.int(12, 99 - a); return { title: a + ' + ' + b + ' 用竖式算', hook: '从个位算起，一位一位点数字写；满十要先点上面的小圆圈进 1。', props: { mode: 0, a, b }, goals: [['result', a + b, a + ' + ' + b + ' = ' + (a + b)]], sol: { marks: addMarks(a, b).join(','), res: rev(a + b) } }; }
    if (lv === 2) { const a = R.int(120, 900), b = R.int(15, a - 10); return { title: a + ' − ' + b + ' 用竖式算', hook: '个位不够减就点前一位上面的小圆圈退 1；前一位是 0 要再往前借。', props: { mode: 1, a, b }, goals: [['result', a - b, a + ' − ' + b + ' = ' + (a - b)]], sol: { marks: subMarks(a, b).join(','), res: rev(a - b).replace(/0+$/, '') || '0' } }; }
    const b = R.int(2, 9), q = R.int(101, 299), r = R.int(0, b - 1), a = b * q + r; return { title: a + ' ÷ ' + b + ' 用竖式算', hook: '从高位起一步一步试商；不够除的那一位商写 0。', props: { mode: 2, a, b }, goals: [['q', Math.floor(a / b), '商是 ' + Math.floor(a / b) + (a % b ? '，余 ' + (a % b) : '')]], sol: { qd: String(Math.floor(a / b)) } };
  } });

  add('makebench', { gen(R, lv) {
    if (lv === 1 && R.bool()) {
      const k = R.int(2, 4), pairs = [], used = new Set(); while (pairs.length < k) { const a = R.int(1, 9); pairs.push([a, 10 - a]); }
      const pool = [1, 2, 3, 4, 6, 7, 8, 9].filter((x) => !pairs.some(([a, b]) => a === x || b === x)), dec = []; for (const x of pool) { if (dec.length < 2 && !dec.some((y) => x + y === 10)) dec.push(x); }
      const cards = [], taken = []; pairs.forEach(([a, b]) => { taken.push(cards.length, cards.length + 1); cards.push(a, b); }); dec.forEach((x) => cards.push(x));
      const order = cards.map((_, i) => i); for (let i = order.length - 1; i > 0; i--) { const j = R.int(0, i); [order[i], order[j]] = [order[j], order[i]]; }
      const inv = []; order.forEach((o, i) => { inv[o] = i; }); void used;
      return { title: '对对碰：找出加起来是 10 的两张', hook: '点两张：加起来是 10 就配成一对。把能配的都配完。', props: { mode: 3, cards: order.map((o) => cards[o]).join(',') }, goals: [['paired', 1, '配完了：' + k + ' 对']], sol: { taken: taken.map((x) => inv[x]).join(',') } };
    }
    if (lv === 1) { const n = R.int(4, 10); return { title: n + ' 可以分成几和几？', hook: '点两个圆片之间的缝，把它们分成两份。全部分法都找出来。', props: { mode: 2, n }, goals: [['all', 1, '找全了：' + n + ' 有 ' + (n - 1) + ' 种分法']], sol: { splits: Array.from({ length: n - 1 }, (_, i) => i + 1).join(',') } }; }
    if (lv === 2) { const a = R.int(5, 9), b = R.int(11 - a, 9); return { title: a + ' + ' + b + '：凑成十再加', hook: '点右边的蓝片挪进左边的空格，把左边凑满十。', props: { mode: 0, a, b }, goals: [['sum', a + b, a + ' + ' + b + ' = ' + (a + b)]], sol: { moved: 10 - a } }; }
    const a = R.int(11, 18), b = R.int(a - 9, 9); return { title: a + ' − ' + b + '：破十或平十', hook: '点圆片划掉它，一共划 ' + b + ' 个。可以都从十格框里划，也可以先划外面的。', props: { mode: 1, a, b }, goals: [['diff', a - b, a + ' − ' + b + ' = ' + (a - b)]], sol: { cross: Array.from({ length: b }, (_, i) => i).join(',') } };
  } });

  // 小数：u t h 是“一、十分之一、百分之一”的个数
  const dsplit = (c) => [Math.floor(c / 100), Math.floor(c / 10) % 10, c % 10];
  const dstr = (c) => (c / 100).toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  add('decbench', { gen(R, lv) {
    if (lv === 1) { const a = R.int(1, 9) * 10 + R.int(0, 2) * 100, b = R.int(1, 9) * 10; const [u, t, h] = dsplit(a), [U2, T2, H2] = dsplit(a + b); return { title: dstr(a) + ' + ' + dstr(b), hook: '台面上是 ' + dstr(a) + '。点“放进来”，满十的换一换。', props: { mode: 1, u, t, h, b: dstr(b), k: 1 }, goals: [['value', qs(a + b, 100), dstr(a) + ' + ' + dstr(b) + ' = ' + dstr(a + b)]], sol: { u: U2, t: T2, h: H2, step: 1 } }; }
    if (lv === 2) { const a = R.int(110, 600), b = R.int(5, Math.min(99, a - 10)); const [u, t, h] = dsplit(a), [U2, T2, H2] = dsplit(a - b); return { title: dstr(a) + ' − ' + dstr(b), hook: '台面上是 ' + dstr(a) + '，要拿走 ' + dstr(b) + '。哪一位不够拿，先拆开前一位。', props: { mode: 2, u, t, h, b: dstr(b) }, goals: [['value', qs(a - b, 100), dstr(a) + ' − ' + dstr(b) + ' = ' + dstr(a - b)]], sol: { u: U2, t: T2, h: H2, step: 1 } }; }
    const b = R.int(2, 9) * 10, k = R.int(2, 5), tot = b * k; const [U2, T2, H2] = dsplit(tot); return { title: dstr(b) + ' × ' + k, hook: '台面是空的。把 ' + dstr(b) + ' 放进来 ' + k + ' 次，满十的换一换。', props: { mode: 1, b: dstr(b), k }, goals: [['value', qs(tot, 100), dstr(b) + ' × ' + k + ' = ' + dstr(tot)]], sol: { u: U2, t: T2, h: H2, step: k } };
  } });

  // 估一估：末位不取 0 和 5（离两端一样远就不好说“近”）
  const fuzzy = (R, lo, hi, unit) => { for (;;) { const x = R.int(lo, hi), m = x % unit; if (m !== 0 && m * 2 !== unit) return x; } };
  const near = (x, u) => { const lo = Math.floor(x / u) * u; return x - lo < lo + u - x ? [lo, 1] : [lo + u, 2]; };
  add('estbench', { gen(R, lv) {
    const op = lv === 3 ? 2 : R.int(0, 1), u = lv === 2 ? 100 : 10;
    let a = lv === 2 ? fuzzy(R, 210, 890, 100) : fuzzy(R, 21, 89, 10), b = lv === 2 ? fuzzy(R, 110, a - 20, 100) : fuzzy(R, 12, lv === 3 ? 49 : 79, 10);
    if (op === 1 && b > a) [a, b] = [b, a];
    const [ra, pa] = near(a, u), [rb, pb] = near(b, u), est = op === 0 ? ra + rb : op === 1 ? ra - rb : ra * rb, S = ['+', '−', '×'][op];
    return { title: a + ' ' + S + ' ' + b + ' 大约是多少？', hook: '先不算：点每个数离它近的那一端，看成整' + (u === 100 ? '百' : '十') + '数再算。', props: { mode: 0, op, a: String(a), b: String(b), ua: String(u), ub: String(u) }, goals: [['est', est, '估计：' + ra + ' ' + S + ' ' + rb + ' = ' + est]], sol: { pa, pb } };
  } });

  // 钱币：盘子里每种钱的张数（1 角、5 角、1 元、5 元、10 元、20 元、50 元）
  const DEN = [1, 5, 10, 50, 100, 200, 500];
  const greedy = (j) => { const t = DEN.map(() => 0); for (let i = DEN.length - 1; i >= 0; i--) { while (j >= DEN[i]) { t[i]++; j -= DEN[i]; } } return t.join(','); };
  const yj = (j) => { const y = Math.floor(j / 10), a = j % 10; return (y ? y + ' 元' : '') + (a ? (y ? ' ' : '') + a + ' 角' : '') || '0 元'; };
  add('moneybench', { gen(R, lv) {
    if (lv === 1) { const p = R.int(3, 30) * 10; return { title: '正好付 ' + yj(p) + '，张数最少', hook: '从钱包里点钱放进盘子：正好付 ' + yj(p) + '，用的张数越少越好（先用大面额）。', props: { mode: 0, price: p }, goals: [['fewest', 1, '正好，而且张数最少']], sol: { tray: greedy(p) } }; }
    if (lv === 2) { const p = R.int(12, 99) * 10 + R.int(1, 9); return { title: '正好付 ' + yj(p), hook: '几元几角：元和角都要点够。', props: { mode: 0, price: p }, goals: [['exact', 1, '正好付了 ' + yj(p) + '（' + (p / 10) + ' 元）']], sol: { tray: greedy(p) } }; }
    const paid = R.pick([100, 200, 500]), p = R.int(Math.floor(paid / 4), paid - 3) * 1 - (R.bool() ? 5 : 0), price = Math.max(11, p); return { title: yj(price) + ' 的东西，付 ' + yj(paid) + '，找多少？', hook: '从 ' + (price / 10) + ' 元往上数，点钱包里的钱“数上去”，数到 ' + (paid / 10) + ' 元。', props: { mode: 1, price, paid }, goals: [['change', qs(paid - price, 10), '找零 ' + yj(paid - price)]], sol: { tray: greedy(paid - price) } };
  } });

  const DIM = (y, m) => [31, (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
  add('calbench', { gen(R, lv) {
    const WK = ['日', '一', '二', '三', '四', '五', '六'];
    if (lv === 3) { const s = R.int(0, 6), N = R.int(15, 150); return { title: '今天星期' + WK[s] + '，' + N + ' 天后是星期几？', hook: '点“过 7 天”一次跳一个星期（星期几不变），跳不了再一天一天过。', props: { mode: 1, start: s, N, go: 0 }, goals: [['weekday', (s + N) % 7, N + ' 天后是星期' + WK[(s + N) % 7]]], sol: { go: N } }; }
    if (lv === 2 && R.bool()) { const y = R.int(2024, 2030), mo = R.int(2, 12), d = R.int(1, DIM(y, mo)), w = new Date(Date.UTC(y, mo - 1, d)).getUTCDay(); return { title: y + ' 年 ' + mo + ' 月 ' + d + ' 日是星期几？', hook: '日历在 ' + y + ' 年 ' + (mo - 1) + ' 月。翻到 ' + mo + ' 月，点 ' + d + ' 日。', props: { mode: 0, y, mo: mo - 1 }, goals: [['dow', w, '是星期' + WK[w]]], sol: { mo, d1: d } }; }
    const y = R.int(2020, 2030), mo = R.int(1, 12), nd = DIM(y, mo), d1 = R.int(1, 10), d2 = R.int(d1 + 5, nd);
    if (lv === 1) return { title: mo + ' 月 ' + d1 + ' 日到 ' + d2 + ' 日，一共几天？', hook: '点开始那天，再点结束那天。“一共几天”要把头尾两天都算上。', props: { mode: 0, y, mo }, goals: [['inclusive', d2 - d1 + 1, '两头都算：一共 ' + (d2 - d1 + 1) + ' 天']], sol: { d1, d2 } };
    return { title: '从 ' + mo + ' 月 ' + d1 + ' 日到 ' + d2 + ' 日，经过了几天？', hook: '点两天：“经过了几天”是结束减开始，不加 1。', props: { mode: 0, y, mo }, goals: [['between', d2 - d1, '经过了 ' + (d2 - d1) + ' 天']], sol: { d1, d2 } };
  } });

  add('rulerbench', { gen(R, lv) {
    if (lv === 1) { const len = R.int(3, 9), at = R.int(1, 15 - len); return { title: '这根铅笔有多长？', hook: '铅笔头在 ' + at + ' 厘米。拖到对准 0，或者数格子。', props: { mode: 0, len, at }, goals: [['len', len, '铅笔长 ' + len + ' 厘米']], sol: { at: 0 } }; }
    const L = R.int(lv === 2 ? 11 : 15, lv === 2 ? 20 : 30) * 10, cut = R.int(2, L / 5 - 2) * 5, mcm = (c) => (c >= 100 ? Math.floor(c / 100) + ' 米' + (c % 100 ? ' ' + (c % 100) + ' 厘米' : '') : c + ' 厘米');
    return { title: mcm(L) + ' 的绳子剪下 ' + mcm(cut) + '，还剩多少？', hook: '1 米 = 100 厘米。拖剪刀剪下 ' + cut + ' 厘米。', props: { mode: 1, L }, goals: [['rest', L - cut, '还剩 ' + (L - cut) + ' 厘米']], sol: { cut } };
  } });

  add('anglebench', { gen(R, lv) {
    if (lv === 3 && R.bool()) { const n = R.pick([3, 4, 5, 6, 8, 9, 10, 12]); return { title: '正 ' + n + ' 边形每个内角是多少度？', hook: '先求内角和（切成几个三角形），再平均分给 ' + n + ' 个角。', props: { mode: 3, n }, goals: [['each', qs((n - 2) * 180, n), '每个角 ' + qs((n - 2) * 180, n) + '°']], sol: { split: true } }; }
    if (lv === 1) { const a1 = R.int(0, 10) * 5, ang = R.int(3, 33) * 5, a2 = a1 + ang, prot = (a1 + R.pick([20, 35, 50, 65])) % 360; return { title: '量一量这个角', hook: '拖量角器边上的圆点转它，0° 线压在角的一条边上才读得出。', props: { mode: 0, a1, a2, prot }, goals: [['deg', ang, '这个角是 ' + ang + '°']], sol: { prot: a1 } }; }
    if (lv === 2) { const a = R.int(3, 33) * 5; return { title: '∠1 是 ' + a + '°，∠2 是几度？', hook: '一条直线上的两个角合起来是一个平角。点 ∠2 量一量。', props: { mode: 1, a }, goals: [['other', 180 - a, '∠2 = 180° − ' + a + '° = ' + (180 - a) + '°']], sol: { seen: '2' } }; }
    const n = R.int(4, 10); return { title: n + ' 边形的内角和是多少？', hook: '从一个顶点连对角线，切成几个三角形？', props: { mode: 3, n }, goals: [['sum', (n - 2) * 180, (n - 2) + ' 个三角形：' + (n - 2) * 180 + '°']], sol: { split: true } };
  } });

  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const divs = (n) => { const d = []; for (let i = 1; i <= n; i++) if (n % i === 0) d.push(i); return d; };
  add('factorbench', { gen(R, lv) {
    if (lv === 1 && R.bool()) { const ps = []; let n = 1; while (ps.length < 4) { const q = R.pick([2, 2, 2, 3, 3, 5, 7]); if (n * q > 200) break; ps.push(q); n *= q; } ps.sort((x, y) => x - y); if (ps.length >= 3) return { title: '把 ' + n + ' 分解质因数', hook: '点“÷ 2”“÷ 3”……能除尽就拆下一块质数积木，拆到 1 为止。', props: { mode: 4, pn: n }, goals: [['split', 1, n + ' = ' + ps.join(' × ')]], sol: { pk: ps.join(',') } }; }
    if (lv === 2 && R.bool()) { for (;;) { const g = R.pick([2, 3, 4, 6, 9, 10, 12]), a = R.int(1, 7), b = R.int(2, 9); if (a >= b || gcd(a, b) !== 1) continue; const fac = (x) => { const r = []; for (let d = 2; d * d <= x; d++) while (x % d === 0) { r.push(d); x /= d; } if (x > 1) r.push(x); return r; }; return { title: '约分 ' + a * g + '/' + b * g, hook: '分子分母都拆成质数积木，共有的成对拿掉。', props: { mode: 4, pn: a * g, pd: b * g }, goals: [['simplest', 1, '最简分数 ' + a + '/' + b]], sol: { pk: fac(g).join(',') } }; } }
    if (lv === 1) { const n = R.pick([12, 16, 18, 20, 24, 28, 30, 32, 36, 40, 42, 45, 48]); return { title: n + ' 有几个因数？', hook: n + ' 个小方块，每行放几个能正好排满？排满一次找到一对因数。', props: { mode: 0, n }, goals: [['count', divs(n).length, n + ' 有 ' + divs(n).length + ' 个因数']], sol: { w: 1, found: divs(n).filter((d) => d * d <= n).join(',') } }; }
    for (;;) {
      const a = R.int(6, 40), b = R.int(6, 40); if (a === b) continue; const g = gcd(a, b), l = a * b / g;
      if (lv === 2 && g > 1) return { title: a + ' 和 ' + b + ' 的最大公因数', hook: '在“公因数”页一个一个试：能同时整除 ' + a + ' 和 ' + b + ' 的有哪些？', props: { mode: 1, a, b }, goals: [['gcd', g, '最大公因数是 ' + g]], sol: { tried: divs(g).join(',') } };
      if (lv === 3 && l <= 80 && g < Math.min(a, b)) return { title: a + ' 和 ' + b + ' 的最小公倍数', hook: '在“公倍数”页：两条跳跳线第一次落在同一点是哪里？', props: { mode: 2, a, b }, goals: [['lcm', l, '最小公倍数是 ' + l]], sol: { cm: String(l) } };
    }
  } });

  add('areabench', { gen(R, lv) {
    if (lv === 3 && R.bool()) { const P = R.pick([12, 16, 20, 24, 28]), w = P / 4; return { title: P + ' 米篱笆围长方形，怎样围面积最大？', hook: '拖右边改长，宽跟着变。长和宽越接近，面积越大吗？', props: { shape: 3, P, w: 1 }, goals: [['best', 1, '围成 ' + w + ' × ' + w + ' 的正方形：' + w * w + ' 平方米']], sol: { w } }; }
    const b = R.int(3, 10), h = R.int(2, 6);
    if (lv === 1) { const s = R.int(1, Math.min(b, 4)); return { title: '底 ' + b + '、高 ' + h + ' 的平行四边形，面积是多少？', hook: '沿高剪下来，移到右边，拼成长方形再读面积。', props: { shape: 0, b, h, s }, goals: [['area', b * h, '面积 = ' + b + ' × ' + h + ' = ' + b * h]], sol: { step: 2, seen: String(s) } }; }
    if (lv === 2) { const s = R.int(0, b); return { title: '底 ' + b + '、高 ' + h + ' 的三角形，面积是多少？', hook: '再拿一个一样的三角形，转过来拼成平行四边形。', props: { shape: 1, b, h, s }, goals: [['area', qs(b * h, 2), '面积 = ' + b + ' × ' + h + ' ÷ 2']], sol: { step: 2 } }; }
    const t = R.int(1, Math.max(1, b - 1)), s = R.int(0, 4); return { title: '上底 ' + t + '、下底 ' + b + '、高 ' + h + ' 的梯形，面积是多少？', hook: '再拿一个一样的梯形，倒过来拼成平行四边形。', props: { shape: 2, b, t, h, s }, goals: [['area', qs((b + t) * h, 2), '面积 = (' + t + ' + ' + b + ') × ' + h + ' ÷ 2']], sol: { step: 2 } };
  } });

  add('seqbench', { gen(R, lv) {
    if (lv >= 2 && R.bool()) { const KD = [[4, 3, '火柴摆正方形', '根火柴', '个'], [4, 2, '桌子拼起来坐人', '个人', '张桌子'], [3, 2, '火柴摆三角形', '根火柴', '个']], kind = R.int(0, 2), [a, d, name, unit, w] = KD[kind], n = R.int(8, 40), N = a + (n - 1) * d;
      return { title: name + '：' + (kind === 1 ? '一共坐 ' + N + ' 人' : '一共用了 ' + N + ' 根火柴') + '，是第几' + w + '？', hook: '先找规律：第 n 个是 ' + '“第 1 个 + (n − 1) × 每次多几”。再把 n 调到让它正好是 ' + N + '。', props: { kind, k: 1, a: 0, d: 0, n: 10 }, goals: [['term', N, '第 ' + n + ' 个']], sol: { k: 3, a, d, n }, answer: n }; }
    const KD = [[4, 3, '火柴摆正方形', '根火柴'], [4, 2, '桌子拼起来坐人', '个人'], [3, 2, '火柴摆三角形', '根火柴']], kind = lv === 1 ? R.int(0, 1) : R.int(0, 2), [a, d, name, unit] = KD[kind], n = lv === 1 ? R.int(5, 12) : lv === 2 ? R.int(15, 30) : R.int(40, 100);
    return { title: name + '：第 ' + n + ' 个要几' + unit + '？', hook: '先摆几个，找出“第 1 个是几、每次多几”，再算第 ' + n + ' 个。', props: { kind, k: 1, a: 0, d: 0, n }, goals: [['term', a + (n - 1) * d, '第 ' + n + ' 个：' + a + ' + (' + n + ' − 1) × ' + d + ' = ' + (a + (n - 1) * d)]], sol: { k: 3, a, d } };
  } });

  add('jobbench', { gen(R, lv) {
    if (lv === 3 && R.bool()) { const a = R.int(2, 8), b = R.int(a + 1, 12); return { title: '进水管 ' + a + ' 小时注满，出水管 ' + b + ' 小时放完，一起开几小时注满？', hook: '每小时净多几格？', props: { mode: 1, a, b }, goals: [['days', qs(a * b, b - a), '注满要 ' + qs(a * b, b - a) + ' 小时']], sol: { t: Math.ceil(a * b / (b - a)) } }; }
    const [job, A, B, u] = R.pick([['做一件工作', '甲', '乙', '天'], ['修一条路', '甲队', '乙队', '天'], ['做一批零件', '师傅', '徒弟', '天'], ['打一份稿件', '小王', '小李', '小时'], ['注满一池水', '甲管', '乙管', '小时'], ['读完一本书', '哥哥', '弟弟', '天']]);
    for (;;) { const a = R.int(2, lv === 1 ? 6 : 12), b = R.int(2, lv === 1 ? 6 : 15); if (lv > 1 && (a * b) % (a + b) === 0 && R.bool()) continue;
      return { title: job + '，' + A + '单独做要 ' + a + ' ' + u + '，' + B + '单独做要 ' + b + ' ' + u + '。两人合作几' + u + '完成？', hook: '把整件工作看成 1：' + A + '每' + u + '做 1/' + a + '，' + B + '每' + u + '做 1/' + b + '。点“过一' + u + '”，看几' + u + '涂满。', props: { mode: 0, a, b }, goals: [['days', qs(a * b, a + b), '合作 ' + qs(a * b, a + b) + ' ' + u + '完成']], sol: { t: Math.ceil(a * b / (a + b)) } }; }
  } });

  add('chipbench', { gen(R, lv) {
    if (lv <= 2 && R.bool()) { const sp = (v) => (v >= 0 ? { pos: v, neg: 0 } : { pos: 0, neg: -v }), a = R.int(-6, 6), b = R.int(2, 9), up = R.bool(); if (!up && a - b > -10 && a >= 0 || up) {
      const r = up ? a + b : a - b; return { title: R.pick(['早上气温 ' + a + '℃，' + (up ? '中午升高了 ' : '晚上下降了 ') + b + '℃，' + (up ? '中午' : '晚上') + '是多少℃？', '潜水员在 ' + a + ' 米处，' + (up ? '上浮 ' : '下潜 ') + b + ' 米，到了几米？']), hook: up ? '升高就是加：放进 ' + b + ' 个 +1，零对消掉。' : '下降就是减：拿走 ' + b + ' 个 +1，不够先放零对。', props: Object.assign({ mode: 0, op: up ? 0 : 1, a, b }, sp(a)), goals: [['result', r, (up ? a + ' + ' + b : a + ' − ' + b) + ' = ' + r]], sol: Object.assign({ step: 1 }, sp(r)) }; } }
    const sp = (v) => (v >= 0 ? { pos: v, neg: 0 } : { pos: 0, neg: -v });
    if (lv === 1) { const a = R.int(-6, -1), b = R.int(2, 9); return { title: '(' + a + ') + ' + b, hook: '放进来，再把零对一对一对消掉。', props: Object.assign({ mode: 0, op: 0, a, b }, sp(a)), goals: [['result', a + b, '(' + a + ') + ' + b + ' = ' + (a + b)]], sol: Object.assign({ step: 1 }, sp(a + b)) }; }
    if (lv === 2) { const a = R.int(1, 5), b = R.int(a + 1, 9); return { title: a + ' − ' + b, hook: '不够拿：先放进几对零对，再拿。', props: Object.assign({ mode: 0, op: 1, a, b }, sp(a)), goals: [['result', a - b, a + ' − ' + b + ' = ' + (a - b)]], sol: Object.assign({ step: 1 }, sp(a - b)) }; }
    const a = -R.int(2, 5), b = -R.int(2, 5); return { title: '(' + a + ') × (' + b + ')', hook: '拿走 ' + (-a) + ' 组，每组 ' + (-b) + ' 个 −1：先放零对再拿。', props: { mode: 1, a, b, pos: 0, neg: 0 }, goals: [['result', a * b, '(' + a + ') × (' + b + ') = ' + a * b]], sol: { pos: a * b, neg: 0, step: -a } };
  } });

  add('foldbench', { gen(R, lv) {
    const shape = lv === 1 ? R.pick([1, 2]) : lv === 2 ? 0 : R.pick([0, 4]), names = ['正方形', '长方形', '等腰三角形', '圆', '平行四边形'], axes = [[0, 45, 90, 135], [0, 90], [90], null, []][shape];
    return { title: names[shape] + '有几条对称轴？', hook: '转折痕、折一下，两半重合就是一条对称轴。都找出来' + (shape === 4 ? '；找不到就点“它没有对称轴”。' : '。'), props: { shape, angle: 30, off: 0 }, goals: [['all', 1, shape === 4 ? '平行四边形没有对称轴' : '找全了：' + axes.length + ' 条']], sol: shape === 4 ? { none: true } : { found: axes.join(',') } };
  } });

  add('blocksbench', { gen(R, lv) {
    const n = lv === 1 ? R.int(11, 49) : lv === 2 ? R.int(51, 99) : R.int(101, 399), hh = Math.floor(n / 100), t = Math.floor(n / 10) % 10, o = n % 10, v = R.int(0, 3);
    if (v === 0) return { title: '摆出 ' + n, hook: '用百板、十条、一块摆出 ' + n + '：' + (hh ? hh + ' 个百、' : '') + '几个十、几个一？', props: { mode: 0, h: 0, t: 0, o: 0 }, goals: [['value', n, '摆出了 ' + n]], sol: { h: hh, t, o } };
    if (v === 1) return { title: (hh ? hh + ' 个百、' : '') + t + ' 个十和 ' + o + ' 个一合起来是多少？摆出来', hook: '照着摆：百板、十条、一块各几个。', props: { mode: 0, h: 0, t: 0, o: 0 }, goals: [['value', n, '是 ' + n]], sol: { h: hh, t, o } };
    if (v === 2) { const [it, q, box, bq] = R.pick([['铅笔', '支', '捆', '捆'], ['鸡蛋', '个', '盒', '盒'], ['小棒', '根', '捆', '捆']]); return { title: '每 10 ' + q + it + '装一' + bq + (hh ? '，每 100 ' + q + '装一大箱' : '') + '：' + (hh ? hh + ' 大箱、' : '') + t + ' ' + box + '和 ' + o + ' ' + q + '，一共多少' + q + '？', hook: '一' + bq + '就是一个十，一大箱就是一个百。摆出来读一读。', props: { mode: 0, h: 0, t: 0, o: 0 }, goals: [['value', n, '一共 ' + n + ' ' + q]], sol: { h: hh, t, o } }; }
    for (;;) { const a = R.int(12, lv === 3 ? 89 : 59), b = R.int(12, 99 - a); if ((a % 10) + (b % 10) < 10 || a + b > 99) continue; const tt = Math.floor(a / 10) + Math.floor(b / 10), oo = (a % 10) + (b % 10);
      return { title: a + ' + ' + b + '：满十个一捆成一个十', hook: a + ' 和 ' + b + ' 的块倒在一起：十位 ' + tt + ' 根，个位 ' + oo + ' 块。个位超过 9，就把 10 块捆成一根十，往左拖。', props: { mode: 1, a, b, h: 0, t: tt, o: oo }, goals: [['standard', 1, a + ' + ' + b + ' = ' + (a + b)]], sol: { t: tt + 1, o: oo - 10 }, answer: a + b }; }
  } });

  add('clockbench', { gen(R, lv) {
    const v = lv === 1 ? 0 : R.int(0, 2), h = R.int(1, 11), m = lv === 1 ? 0 : lv === 2 ? R.pick([0, 15, 30, 45]) : R.int(0, 11) * 5, t = h * 60 + m, say = (x) => Math.floor(x / 60) % 12 + ' 时' + (x % 60 ? ' ' + x % 60 + ' 分' : '整');
    if (v === 0) return { title: '把钟拨到 ' + say(t), hook: '拖分针转，时针会跟着走。', props: { t: 0, start: 0, timing: false }, goals: [['t', t, say(t)]], sol: { t } };
    const d = R.pick(lv === 2 ? [15, 30, 45, 60, 90] : [20, 35, 50, 75, 100, 125]);
    if (v === 1) return { title: R.pick(['现在是 ' + say(t) + '，过 ' + d + ' 分钟是几时几分？', '电影 ' + say(t) + '开始，放了 ' + d + ' 分钟，几时几分结束？']), hook: '从现在往后拨分针：转一圈是 60 分。', props: { t, start: t, timing: true }, goals: [['t', t + d, say(t + d)]], sol: { t: t + d }, answer: null };
    return { title: R.pick(['从 ' + say(t) + '到 ' + say(t + d) + '，经过了多少分钟？', '小明 ' + say(t) + '开始写作业，' + say(t + d) + '写完，写了多少分钟？']), hook: '钟面已经开始计时了：把分针拨到 ' + say(t + d) + '，看经过了多久。', props: { t, start: t, timing: true }, goals: [['elapsed', d, '经过 ' + d + ' 分钟']], sol: { t: t + d } };
  } });

  add('numlinebench', { gen(R, lv) {
    if (lv === 3 && R.bool()) {
      for (;;) { const a = R.int(2, 4), b = R.int(a + 1, 7), jt = R.int(12, 29), dist = new Map([[0, []]]); let q = [0];
        while (q.length && !dist.has(jt)) { const nq = []; for (const v of q) [a, b].forEach((s, i) => { const w = v + s; if (w <= 30 && !dist.has(w)) { dist.set(w, dist.get(v).concat([i])); nq.push(w); } }); q = nq; }
        if (!dist.has(jt) || dist.get(jt).length < 3) continue; const path = dist.get(jt);
        return { title: '每次只能跳 ' + a + ' 或 ' + b + '，跳到 ' + jt + ' 最少几下？', hook: '从 0 出发。多用大步，最后看看差多少。', props: { mode: 3, steps: a + ',' + b, jt, from: 0, to: 30 }, goals: [['fewest', 1, '最少 ' + path.length + ' 下']], sol: { path: path.join(',') } }; }
    }
    if (lv === 3) { const a = R.int(11, 19), b = R.int(a - 9, 9); return { title: a + ' − ' + b + '：往左跳', hook: '从 ' + a + ' 出发往左跳 ' + b + ' 步。', props: { mode: 0, from: 0, to: 20, a: 0, s: -1, n: 0 }, goals: [['value', a - b, a + ' − ' + b + ' = ' + (a - b)]], sol: { a, n: b } }; }
    const a = R.int(1, lv === 1 ? 5 : 9), b = R.int(1, lv === 1 ? 10 - a : 9); return { title: a + ' + ' + b + '：往右跳', hook: '先把起点拖到 ' + a + '，再往右跳 ' + b + ' 步。', props: { mode: 0, from: 0, to: 20, a: 0, s: 1, n: 0 }, goals: [['value', a + b, a + ' + ' + b + ' = ' + (a + b)]], sol: { a, n: b } };
  } });

  add('meanbench', { gen(R, lv) {
    const k = lv === 1 ? 3 : lv === 2 ? 4 : 5, m = R.int(3, 9); let v; for (;;) { v = Array.from({ length: k - 1 }, () => R.int(1, 2 * m)); const last = k * m - v.reduce((s, x) => s + x, 0); if (last >= 1 && last <= 15) { v.push(last); if (new Set(v).size > 1) break; } }
    return { title: R.pick([v.join('、') + '：移多补少，平均每堆几块？', '小明 ' + k + ' 天看书的页数是 ' + v.join('、') + '，平均每天看几页？', k + ' 个小组种树，分别种了 ' + v.join('、') + ' 棵，平均每组种几棵？']), hook: '把多的搬给少的，搬到一样高。', props: { vals: v.join(','), showline: lv === 1 }, goals: [['level', 1, '一样高了：平均每堆 ' + m + ' 块']], sol: { vals: Array(k).fill(m).join(',') } };
  } });

  add('statbench', { gen(R, lv) {
    if (lv >= 2 && R.bool()) { const n = 5 + lv, v = Array.from({ length: n }, () => R.int(1, 12)), s = v.reduce((a, b) => a + b, 0), names = R.pick(['跳绳', '投篮', '口算']);
      if (R.bool()) { const srt = v.slice().sort((a, b) => a - b), med = n % 2 ? srt[(n - 1) / 2] : qs(srt[n / 2 - 1] + srt[n / 2], 2); return { title: n + ' 个同学' + names + '的成绩是 ' + v.join('、') + '，中位数是多少？', hook: '先点“从小到大排队”，再点“中位数”：正中间那一个（偶数个就是中间两个的平均）。', props: { vals: v.join(', ') }, goals: [['median', med, '中位数 ' + med]], sol: { vals: srt.join(', '), smed: true } }; }
      return { title: n + ' 个同学' + names + '的成绩是 ' + v.join('、') + '，平均数是多少？', hook: '点“平均数”：把柱子摊平以后的高度 = 总数 ÷ 个数。', props: { vals: v.join(', ') }, goals: [['mean', qs(s, n), '平均 ' + s + ' ÷ ' + n + ' = ' + qs(s, n)]], sol: { smean: true } }; }
    const n = 5 + lv, v = Array.from({ length: n }, () => R.int(1, 9)); if (lv === 1) v[R.int(0, n - 1)] = v[0];
    const cnt = {}; v.forEach((x) => { cnt[x] = (cnt[x] || 0) + 1; }); const top = Math.max(...Object.values(cnt)), modes = Object.keys(cnt).filter((x) => cnt[x] === top);
    if (lv === 1 && modes.length === 1) return { title: v.join('、') + '：出现最多的数（众数）是几？', hook: '点“众数”，看哪一个数出现得最多。', props: { vals: v.join(', ') }, goals: [['mode', modes[0], '众数是 ' + modes[0]]], sol: { smode: true } };
    const rng = Math.max(...v) - Math.min(...v); return { title: v.join('、') + '：最大和最小差多少（极差）？', hook: '点“极差”。', props: { vals: v.join(', ') }, goals: [['range', rng, '极差 = ' + Math.max(...v) + ' − ' + Math.min(...v) + ' = ' + rng]], sol: { srange: true } };
  } });

  add('swapbench', { gen(R, lv) {
    if (R.int(0, 2) > 0) { const w = (fam, bench, o) => { const q = U.Word.make(R, fam, bench, o); return { title: q.title, hook: q.hook, props: q.props, goals: q.goals, sol: q.sol, fam: q.struct && q.struct.family }; }; return w('swap', 'swapbench', { lv }); }
    const n = R.int(lv === 1 ? 5 : 10, lv === 1 ? 10 : lv === 2 ? 20 : 35), b = R.int(1, n - 1), target = 2 * (n - b) + 4 * b;
    return { title: '鸡兔同笼：' + n + ' 个头，' + target + ' 条腿，兔有几只？', hook: '先假设全是鸡，再一只一只把鸡换成兔：每换一只多 2 条腿。', props: { n, k: 0, target }, goals: [['b', b, '兔有 ' + b + ' 只']], sol: { k: b } };
  } });

  add('travelbench', { gen(R, lv) {
    if (R.bool()) { const w = (fam, bench, o) => { const q = U.Word.make(R, fam, bench, o); return { title: q.title, hook: q.hook, props: q.props, goals: q.goals, sol: q.sol, fam: q.struct && q.struct.family }; }; return w('meet', 'travelbench', { lv }); }
    const t = R.int(2, 6), va = R.int(3, 12), vb = R.int(2, 9);
    if (lv === 3) { const v1 = Math.max(va, vb) + 1, v2 = Math.min(va, vb), gap0 = (v1 - v2) * t; return { title: '追及：乙先走了 ' + gap0 + ' 千米，甲每小时 ' + v1 + '，乙每小时 ' + v2 + '，几小时追上？', hook: '拖时间条，看两人之间的距离每小时少多少。', props: { len: gap0 + v2 * (t + 2), t: 0, tmax: t + 3, pa: 0, va: v1, da: 0, pb: gap0, vb: v2, db: 0, solo: false, lock: true }, goals: [['gap', 0, t + ' 小时追上']], sol: { t } }; }
    const len = (va + vb) * t; return { title: '相遇：相距 ' + len + ' 千米，甲每小时 ' + va + '，乙每小时 ' + vb + '，几小时相遇？', hook: '拖时间条，两人面对面走，每小时一共走多少？', props: { len, t: 0, tmax: t + 3, pa: 0, va, da: 0, pb: len, vb, db: 1, solo: false, lock: true }, goals: [['gap', 0, t + ' 小时相遇']], sol: { t } };
  } });

  // 和差倍分：不是固定的几道题，而是一个题型引擎。
  //   关系：倍（A = k × B）、和差（A = B + d）、几倍多几 / 几倍少几（A = k × B ± c）、比（A : B = p : q）、年龄（差不变，几年后是几倍）；
  //   已知：和或者差；问：大的、小的随机；谁是“几倍”的那个也随机；情境、说法从几种里挑。线段图上段数已经摆好，学生拖一段的长度对上已知。
  const CTX = [['哥哥', '弟弟', '张', '邮票', '两人'], ['红花', '黄花', '朵', '', '两种花'], ['甲仓', '乙仓', '吨', '粮食', '两个仓'], ['故事书', '科技书', '本', '', '两种书'], ['男生', '女生', '人', '', '全班'],
    ['大桶', '小桶', '升', '油', '两桶'], ['长绳', '短绳', '米', '', '两根绳'], ['小明', '小红', '元', '钱', '两人'], ['苹果', '梨', '千克', '', '两种水果'], ['上午', '下午', '个', '零件', '一天']];
  const hasOf = (n, c) => n + (c[3] ? '的' + c[3] : '');
  add('tapebench', { gen(R, lv) {
    const w = (fam, bench, o) => { const q = U.Word.make(R, fam, bench, o); return { title: q.title, hook: q.hook, props: q.props, goals: q.goals, sol: q.sol, fam: q.struct && q.struct.family }; };
    if (lv === 1 && R.bool()) { const u = R.int(3, 15), ka = R.int(2, 3); return { title: '乙有 ' + u + '，甲是乙的 ' + ka + ' 倍，甲有几？', hook: '把甲的线段调成 ' + ka + ' 段。', props: { ka: 1, kb: 1, u, tk: 2, lock: false }, goals: [['a', ka * u, '甲有 ' + ka * u]], sol: { ka } }; }
    return w(lv === 3 && R.int(0, 3) === 0 ? 'age' : 'pair', 'tapebench', { lv, noise: lv === 3 && R.bool() });
  } });
  function gcdQ(x, y) { return y ? gcdQ(y, x % y) : x; }

  add('balancebench', { gen(R, lv) {
    if (lv >= 2 && R.bool()) { const w = (fam, bench, o) => { const q = U.Word.make(R, fam, bench, o); return { title: q.title, hook: q.hook, props: q.props, goals: q.goals, sol: q.sol, fam: q.struct && q.struct.family }; }; return w('pair', 'balancebench', { lv, kinds: ['times', 'more'] }); }
    const x = R.int(2, 12), a = lv === 1 ? 1 : R.int(2, 5), c = lv === 3 ? R.int(1, 9) : lv === 1 ? R.int(1, 9) : 0;
    const name = (a > 1 ? a : '') + 'x' + (c ? ' + ' + c : '') + ' = ' + (a * x + c);
    return { title: '解方程：' + name, hook: '天平两边同时拿走一样多、或者同时平分，一直保持平衡，直到一边只剩一个 x。', props: { lx: a, lc: c, rx: 0, rc: a * x + c, x0: x, sync: true, reveal: true }, goals: [['solved', x, 'x = ' + x]], sol: { lx: 1, lc: 0, rx: 0, rc: x } };
  } });

  add('termsbench', { gen(R, lv) {
    const a = R.int(2, 9), b = R.int(2, 9), c = R.int(2, 9);
    const [toks, val] = lv === 1 ? [[a, '+', b, '-', c], a + b - c] : lv === 2 ? [[a, '+', b, '*', c], a + b * c] : [[a * c, '-', a, '*', b, '+', c], a * c - a * b + c];
    if (val < 0) return this.gen(R, lv);
    const show = toks.join(' ').replace(/\*/g, '×').replace(/-/g, '−');
    return { title: show + ' = ?', hook: '按运算顺序，一步一步点着算：先乘除，后加减；同级从左往右。', props: { mode: 1, toks: toks.join(',') }, goals: [['value', val, show + ' = ' + val]], sol: { toks: String(val) } };
  } });

  // 竖式乘法：vals 是每一格的积（乘数从个位起，每一位乘被乘数的每一位，高位在前），再是每一行，再是总积
  add('mulbench', { gen(R, lv) {
    const a = lv === 1 ? R.int(12, 49) : lv === 2 ? R.int(21, 98) : R.int(102, 399), b = lv === 1 ? R.int(2, 9) : R.int(12, 49);
    const A = String(a).split('').map(Number), B = String(b).split('').map(Number).reverse(), cells = [], rows = [];
    B.forEach((bd, j) => { if (!bd) return; let row = 0; A.forEach((ad, i) => { if (!ad) return; const v = ad * Math.pow(10, A.length - 1 - i) * bd * Math.pow(10, j); cells.push(v); row += v; }); rows.push(row); });   // 是 0 的那一位整格、整行都不用算
    const vals = cells.concat(rows).concat(rows.length > 1 ? [a * b] : []);
    return { title: a + ' × ' + b, hook: '对着面积图，每一格先算，再一行一行加，最后相加。', props: { a, b }, goals: [['product', a * b, a + ' × ' + b + ' = ' + a * b]], sol: { vals: vals.join(',') } };
  } });

  add('solidbench', { gen(R, lv) {
    const grid = (rows, cols, hgt) => Array(rows).fill(Array(cols).fill(hgt).join(',')).join(';');
    if (lv >= 2 && R.bool()) {   // 开放题：用 N 块搭一个高 h 的长方体，底面怎么摆都行
      for (;;) { const hgt = R.int(1, lv === 3 ? 3 : 2), base = R.pick([6, 8, 10, 12]), N = base * hgt, pairs = []; for (let r = 1; r <= 5; r++) if (base % r === 0 && base / r <= 6) pairs.push([r, base / r]); if (pairs.length < 2) continue;
        const [rows, cols] = pairs[R.int(0, pairs.length - 1)]; return { title: '用 ' + N + ' 个小方块搭一个高 ' + hgt + ' 的长方体。底面可以怎么摆？', hook: '高是 ' + hgt + '：底面要摆几个？' + N + ' ÷ ' + hgt + ' = ?。底面可以摆成不同的长和宽，都对。', props: { rows: 5, cols: 6, h: grid(5, 6, 0) }, goals: [['total', N, '一共 ' + N + ' 块'], ['isbox', 1, '是长方体'], ['hgt', hgt, '高 ' + hgt]], sol: { h: Array.from({ length: 5 }, (_, i) => Array.from({ length: 6 }, (_, j) => (i < rows && j < cols ? hgt : 0)).join(',')).join(';') }, answer: base }; }
    }
    const rows = R.int(2, lv === 1 ? 3 : 4), cols = R.int(2, lv === 1 ? 3 : 5), hgt = R.int(1, lv === 3 ? 4 : 2), tot = rows * cols * hgt;
    const title = R.pick(['搭一个长 ' + cols + '、宽 ' + rows + '、高 ' + hgt + ' 的长方体，用几个小方块？', '一个长方体纸盒长 ' + cols + ' 厘米、宽 ' + rows + ' 厘米、高 ' + hgt + ' 厘米，能装几个 1 立方厘米的小方块？', '每层摆 ' + rows + ' 排、每排 ' + cols + ' 个，摆 ' + hgt + ' 层，一共几个？']);
    return { title, hook: '在每一格上点着往上摞，摞成 ' + hgt + ' 层。', props: { rows, cols, h: grid(rows, cols, 0) }, goals: [['total', tot, '一共 ' + tot + ' 个小方块']], sol: { h: grid(rows, cols, hgt) } };
  } });
  // ===================== 出题器（第二批） =====================
  const lcm2 = (a, b) => a * b / gcd(a, b);
  add('fracbench', { gen(R, lv) {
    if (lv === 1 && R.bool()) { for (;;) { const b = R.int(2, 9), d = R.int(2, 9), a = R.int(1, b - 1), c = R.int(1, d - 1); if (b === d || a * d === b * c) continue; const cmp = Q.cmp(Q(a, b), Q(c, d)); return { title: a + '/' + b + ' 和 ' + c + '/' + d + '，哪个大？', hook: '格子不一样大：切成一样大的格子再比。', props: { mode: 3, a, b, c, d }, goals: [['cmpok', 1, a + '/' + b + ' ' + (cmp > 0 ? '>' : '<') + ' ' + c + '/' + d]], sol: { ans: String(cmp) } }; } }
    if (lv === 3) { for (;;) { const b = R.int(1, 4), a = R.int(1, 3 * b), d = R.pick([2, 3, 4, 6, 8]), c = R.int(1, d - 1); if (a / b > 3 || gcd(c, d) !== 1) continue; const q = Q.div(Q(a, b), Q(c, d)), t = Math.ceil(Q.num(q) - 1e-9); if (t < 2 || t > 24) continue; return { title: (b === 1 ? a : a + '/' + b) + ' ÷ ' + c + '/' + d, hook: '里面有几个 ' + c + '/' + d + '？用量尺一段一段量。', props: { mode: 1, a, b, c, d }, goals: [['quot', Q.show(q), '商是 ' + Q.show(q)]], sol: { times: t } }; } }
    for (;;) {
      const b = R.int(2, 6), d = R.int(2, 6), a = R.int(1, b - 1), c = R.int(1, d - 1); if (b === d || gcd(a, b) !== 1 || gcd(c, d) !== 1) continue;
      const L = lcm2(b, d); if (L > 30) continue; const op = lv === 2 ? 1 : 0; if (op === 1 && a / b <= c / d) continue;
      const r = op === 0 ? Q.add(Q(a, b), Q(c, d)) : Q.sub(Q(a, b), Q(c, d)), S = op === 0 ? '+' : '−';
      return { title: a + '/' + b + ' ' + S + ' ' + c + '/' + d, hook: '格子不一样大：先把两根条切细，切到格子一样大，再' + (op === 0 ? '合起来' : '拿走') + '。', props: { mode: 0, op, a, b, c, d }, goals: [['result', Q.show(r), a + '/' + b + ' ' + S + ' ' + c + '/' + d + ' = ' + Q.show(r)]], sol: { ka: L / b, kc: L / d, done: true } };
    }
  } });

  add('groupbench', { gen(R, lv) {
    if (lv === 3 && R.bool()) { const k = R.int(3, 6), n = k * R.int(2, 4) + R.int(1, k - 1), mx = Math.ceil(n / k); const [a, b] = R.pick([['只鸽子', '个笼子'], ['个苹果', '个抽屉'], ['名同学', '个小组'], ['本书', '个书架']]);
      return { title: n + ' ' + a + '放进 ' + k + ' ' + b + '，至少有一' + b.slice(1) + '里不少于几' + a.slice(0, 1) + '？', hook: '最不利的情况：一个一个平均放下去，放完看最多的那个。', props: { mode: 1, n, k, dealt: 0 }, goals: [['max', mx, '至少 ' + mx]], sol: { dealt: n } }; }
    const [it, q] = R.pick([['苹果', '个'], ['铅笔', '支'], ['糖', '块'], ['本子', '本']]);
    if (R.bool()) {   // 平均分给几份（等分）
      const k = R.int(2, lv === 1 ? 4 : 6), each = R.int(2, lv === 1 ? 5 : 9), n = k * each;
      return { title: n + ' ' + q + it + '平均分给 ' + k + ' 个小朋友，每人分几' + q + '？', hook: '点“放一个”“放一轮”，一个一个轮流放进 ' + k + ' 个盒子，放完看每个盒子几个。', props: { mode: 1, n, k, dealt: 0, unit: q }, goals: [['max', each, '每人 ' + each + ' ' + q]], sol: { dealt: n } };
    }
    const g = R.int(lv === 1 ? 2 : 4, lv === 1 ? 5 : 9), n = g * R.int(2, lv === 1 ? 4 : 7) + R.int(1, g - 1), qq = Math.floor(n / g), r = n % g;
    return { title: R.pick([n + ' 个，每 ' + g + ' 个一份，能分几份？还剩几个？', n + ' ' + q + it + '，每 ' + g + ' ' + q + '装一袋，能装几袋？还剩几' + q + '？', '有 ' + n + ' 人坐船，每条船坐 ' + g + ' 人，坐满几条船？还剩几人？']), hook: '把“每份几个”调成 ' + g + '，看分成几份、剩几个。', props: { mode: 0, n, g: 1, k: 3, dealt: 0, unit: '个', gname: '份' }, goals: [['q', qq, n + ' ÷ ' + g + ' = ' + qq + ' …… ' + r], ['r', r, '余 ' + r]], sol: { g } };
  } });

  add('gapbench', { gen(R, lv) {
    const gap = R.pick([2, 3, 4, 5, 10]), k = R.int(3, 12), len = gap * k, ends = lv === 1 ? [1, 1] : lv === 2 ? R.pick([[1, 0], [0, 0]]) : null;
    if (lv === 3) return { title: '一圈长 ' + len + ' 米的花坛，每隔 ' + gap + ' 米种一棵，种几棵？', hook: '围成一圈：头和尾是同一个地方。先把“每隔几米”调对，再把路围成一圈。', props: { len, gap: 1, le: 1, re: 1, ring: 0 }, goals: [['trees', k, '围成一圈：' + k + ' 棵（棵数 = 段数）']], sol: { gap, ring: 1 } };
    const t = k + ends[0] + ends[1] - 1, how = ends[0] && ends[1] ? '两头都种' : ends[0] ? '只种一头' : '两头都不种';
    const [road, thing, verb] = R.pick([['路', '树', '种'], ['街道', '路灯', '装'], ['跑道', '彩旗', '插'], ['走廊', '盆花', '摆']]);
    return { title: len + ' 米的' + road + '，每隔 ' + gap + ' 米' + verb + '一' + (thing === '树' ? '棵' : thing === '路灯' ? '盏' : thing === '彩旗' ? '面' : '盆') + thing + '，' + how.replace('种', verb) + '，' + verb + '几' + (thing === '树' ? '棵' : thing === '路灯' ? '盏' : thing === '彩旗' ? '面' : '盆') + '？', hook: '把“每隔几米”调成 ' + gap + '：先数段数，再看两头。', props: { len, gap: 1, le: ends[0], re: ends[1], ring: 0 }, goals: [['trees', t, how + '：' + t + ' 棵']], sol: { gap } };
  } });

  add('vennbench', { gen(R, lv) {
    for (;;) {
      const both = R.int(1, 5), a = both + R.int(1, 7), b = both + R.int(1, 7), u = a + b - both; if (u > 20) continue;
      const names = R.pick([['跳绳', '踢毽'], ['数学', '语文'], ['画画', '唱歌'], ['跑步', '游泳']]);
      const goals = lv === 1 ? [['both', both, '两样都喜欢的 ' + both + ' 人放在中间']] : [['both', both, '中间放 ' + both + ' 人'], ['union', u, '一共 ' + u + ' 人']];
      return { title: '喜欢' + names[0] + ' ' + a + ' 人，喜欢' + names[1] + ' ' + b + ' 人，两样都喜欢 ' + both + ' 人' + (lv === 1 ? '' : '，一共几人？'), hook: '先把两样都喜欢的放进重叠的地方，再放只喜欢一样的。', props: { n: u, na: names[0], nb: names[1], unit: '人' }, goals, sol: { where: '2'.repeat(both) + '1'.repeat(a - both) + '3'.repeat(b - both) } };
    }
  } });

  add('tablebench', { gen(R, lv) {
    const c = lv === 1 ? 2 : 3, RN = R.pick([['男生', '女生'], ['上午', '下午'], ['借出', '还回']]), CN = R.pick([['一年级', '二年级', '三年级'], ['故事书', '科技书', '漫画书'], ['一班', '二班', '三班']]).slice(0, c);
    const d = Array.from({ length: 2 }, () => Array.from({ length: c }, () => R.int(lv === 3 ? 0 : 1, lv === 1 ? 9 : 30))), tot = d.flat().reduce((s, x) => s + x, 0);
    const props = { data: d.map((row) => row.join(',')).join(';'), rnames: RN.join(','), cnames: CN.join(',') }, v = lv === 1 ? 0 : R.int(0, 2);
    if (v === 1) { const r = R.int(0, 1), s = d[r].reduce((a, b) => a + b, 0); return { title: '复式统计表：' + RN[r] + '一共多少？', hook: '只圈' + RN[r] + '那一行的格子，再点“我数完了”。', props, goals: [['answer', s, RN[r] + '一共 ' + s]], sol: { picked: Array.from({ length: c }, (_, j) => r * c + j).join(','), done: true } }; }
    if (v === 2) { const j = R.int(0, c - 1), s = d[0][j] + d[1][j]; return { title: '复式统计表：' + CN[j] + '一共多少？', hook: '只圈' + CN[j] + '那一列，再点“我数完了”。', props, goals: [['answer', s, CN[j] + '一共 ' + s]], sol: { picked: [j, c + j].join(','), done: true } }; }
    return { title: '复式统计表：一共多少？', hook: '每一格都要算进去，一格也不能漏：点格子把它们圈起来，再点“我数完了”。', props, goals: [['answer', tot, '一共 ' + tot]], sol: { picked: Array.from({ length: 2 * c }, (_, i) => i).join(','), done: true } };
  } });

  add('pairbench', { gen(R, lv) {
    const v = lv === 1 ? R.int(0, 1) : R.int(0, 2);
    if (v === 2) { for (;;) { const na = R.int(4, 9), nb = R.int(4, 9); if (na === nb) continue; const [A, B] = R.pick([['学生', '座位'], ['小朋友', '苹果'], ['杯子', '盖子'], ['小兔', '萝卜']]), k = Math.min(na, nb), more = na > nb;
      return { title: A + ' ' + na + ' 个，' + B + ' ' + nb + ' 个，一个对一个连起来：哪个多？多几个？', hook: '一个' + A + '连一个' + B + '，连到连不下去为止，看哪一排还剩。', props: { mode: 0, na, nb, na_name: A, nb_name: B }, goals: [[more ? 'leftA' : 'leftB', Math.abs(na - nb), (more ? A : B) + '多 ' + Math.abs(na - nb) + ' 个']], sol: { pairs: Array.from({ length: k }, (_, i) => i + '-' + i).join(',') } }; } }
    const n = R.int(lv === 1 ? 3 : 4, lv === 1 ? 4 : lv === 2 ? 5 : 6), all = []; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) all.push(i + '-' + j);
    const ctx = v === 0 ? ['人', n + ' 个人，每两人握一次手，一共握几次？'] : R.pick([['队', n + ' 支球队，每两队比赛一场，一共比赛几场？'], ['点', '平面上 ' + n + ' 个点，每两点连一条线段，一共连几条？'], ['人', n + ' 个好朋友，每两人合一张影，一共拍几张？']]);
    return { title: ctx[1], hook: '点两个连一条线。每两个都要连上，不能重复，也不能漏。', props: { mode: 1, n, p_name: ctx[0] }, goals: [['full', 1, '一共 ' + n * (n - 1) / 2 + ' 次']], sol: { pairs: all.join(',') }, answer: n * (n - 1) / 2 };
  } });

  add('ratiobench', { gen(R, lv) {
    if (R.bool()) { const w = (fam, bench, o) => { const q = U.Word.make(R, fam, bench, o); return { title: q.title, hook: q.hook, props: q.props, goals: q.goals, sol: q.sol, fam: q.struct && q.struct.family }; }; return w('rate', 'ratiobench', { lv }); }
    const S = [['1 个', '元', '个', '元'], ['1 小时', '千米', '时', '千米'], ['1 时', '分', '时', '分']], [one, , ua, ub] = lv === 3 ? S[2] : R.pick(S.slice(0, 2));
    const pb = lv === 3 ? 60 : R.int(2, 9) * (lv === 1 ? 1 : 5), t = R.int(2, lv === 1 ? 5 : 9);
    return { title: one + ' 是 ' + pb + ' ' + ub + '，' + t + ' ' + ua + '是多少' + ub + '？', hook: '双数轴：上面是' + ua + '，下面是' + ub + '。拖着走到 ' + t + ' ' + ua + '，看下面对着几。', props: { mode: 1, pa: 1, pb, tmax: Math.max(10, t), tstep: 1, t: 0, ua, ub }, goals: [['b', t * pb, t + ' ' + ua + '是 ' + t * pb + ' ' + ub]], sol: { t } };
  } });

  add('circlebench', { gen(R, lv) {
    if (lv <= 2 && R.bool()) { const r = R.int(2, 9), v = R.int(0, 2);
      if (v === 0) return { title: '直径 ' + 2 * r + ' 的圆，' + (lv === 1 ? '面积' : '周长') + '是多少？（π 取 3.14）', hook: '先算半径：半径是直径的一半。把半径拖到 ' + r + '。', props: { mode: 0, r: 1 }, goals: [[lv === 1 ? 'area' : 'c', lv === 1 ? qs(314 * r * r, 100) : qs(628 * r, 100), '半径 ' + r]], sol: { r } };
      if (v === 1) return { title: '一个圆的周长是 ' + qs(628 * r, 100) + '，半径是多少？（π 取 3.14）', hook: '拖半径，看周长什么时候正好是 ' + qs(628 * r, 100) + '。周长 ÷ 3.14 ÷ 2 = 半径。', props: { mode: 0, r: 1 }, goals: [['c', qs(628 * r, 100), '半径 ' + r]], sol: { r }, answer: r };
      return { title: '圆形花坛的半径是 ' + r + ' 米，' + (lv === 1 ? '占地多少平方米' : '绕它走一圈是多少米') + '？（π 取 3.14）', hook: '把半径拖到 ' + r + '。', props: { mode: 0, r: 1 }, goals: [[lv === 1 ? 'area' : 'c', lv === 1 ? qs(314 * r * r, 100) : qs(628 * r, 100), lv === 1 ? '面积' : '周长']], sol: { r } }; }
    const r = R.int(2, 9);
    if (lv === 3) { const h = R.int(2, 8); return { title: '底面半径 ' + r + '、高 ' + h + ' 的圆柱，体积是多少？（π 取 3.14）', hook: '把半径拖到 ' + r + '，高拖到 ' + h + '。体积 = 底面积 × 高。', props: { mode: 2, r: 1, h: 1, cone: false }, goals: [['vol', qs(314 * r * r * h, 100), '体积 = 3.14 × ' + r + ' × ' + r + ' × ' + h]], sol: { r, h } }; }
    if (lv === 2) return { title: '半径 ' + r + ' 的圆，周长是多少？（π 取 3.14）', hook: '把半径拖到 ' + r + '。周长 = 2 × 3.14 × 半径。', props: { mode: 0, r: 1 }, goals: [['c', qs(628 * r, 100), '周长 = 2 × 3.14 × ' + r]], sol: { r } };
    return { title: '半径 ' + r + ' 的圆，面积是多少？（π 取 3.14）', hook: '把半径拖到 ' + r + '。面积 = 3.14 × 半径 × 半径。', props: { mode: 0, r: 1 }, goals: [['area', qs(314 * r * r, 100), '面积 = 3.14 × ' + r + ' × ' + r]], sol: { r } };
  } });

  add('chancebench', { gen(R, lv) {
    const v = lv === 1 ? R.int(0, 1) : R.int(0, 3);
    if (v === 1) { const red = R.int(1, 8), white = R.int(1, 8), tot = red + white; return { title: '袋子里有 ' + red + ' 个红球、' + white + ' 个白球，任意摸一个，摸到红球的可能性是多少？', hook: '点开“理论上”：红球占所有球的几分之几？', props: { mode: 2, red, white, target: 0, showp: false }, goals: [['p', qs(red, tot), '红球占 ' + red + '/' + tot]], sol: { showp: true }, answer: qs(red, tot) }; }
    if (v === 3) { const deg = R.pick([45, 60, 90, 120, 180, 240, 270]); return { title: '转盘上红色部分占 ' + deg + '°，转一次停在红色的可能性是多少？', hook: '一圈是 360°：红色占一圈的几分之几？点开“理论上”。', props: { mode: 3, deg, target: 0, showp: false }, goals: [['p', qs(deg, 360), deg + '/360']], sol: { showp: true }, answer: qs(deg, 360) }; }
    const three = v === 2 || lv === 3, s = three ? R.int(6, 14) : lv === 1 ? R.int(5, 9) : R.pick([2, 3, 4, 10, 11, 12]), mode = three ? 4 : 1;
    let w = 0; if (mode === 1) { for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (a + b === s) w++; } else { for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) for (let c = 1; c <= 6; c++) if (a + b + c === s) w++; }
    return { title: (mode === 1 ? '两' : '三') + '个骰子，点数和是 ' + s + ' 的有几种？', hook: '点“列出所有情况”，一种一种数。', props: { mode, sumv: s, list: false }, goals: [['ways', w, '和是 ' + s + ' 的有 ' + w + ' 种（一共 ' + (mode === 1 ? 36 : 216) + ' 种）']], sol: { list: true } };
  } });

  add('areamodel', { gen(R, lv) {
    if (lv === 3) { const w = R.int(11, 19), h = R.int(3, 9); return { title: w + ' × ' + h + '：切一刀，拆成好算的两块', hook: '从左上角的 ✂ 拖出一刀，把长 ' + w + ' 切成 10 和 ' + (w - 10) + '。', props: { mode: 0, w, h, vcuts: '', hcuts: '' }, goals: [['friendly', 1, w + ' × ' + h + ' = 10 × ' + h + ' + ' + (w - 10) + ' × ' + h + ' = ' + w * h]], sol: { vcuts: '10' } }; }
    const w = R.int(3, 12), h = R.int(2, 8);
    if (lv === 2) return { title: '长 ' + w + '、宽 ' + h + ' 的长方形，周长是多少？', hook: '拖右边、下边，把长方形拖成长 ' + w + '、宽 ' + h + '。', props: { mode: 0, w, h: h === 1 ? 2 : 1, vcuts: '', hcuts: '' }, goals: [['perim', 2 * (w + h), '周长 = (' + w + ' + ' + h + ') × 2 = ' + 2 * (w + h)]], sol: { h } };
    return { title: '长 ' + w + '、宽 ' + h + ' 的长方形，面积是多少？', hook: '拖下边，把宽拖到 ' + h + '：一行 ' + w + ' 格，有 ' + h + ' 行。', props: { mode: 0, w, h: 1, vcuts: '', hcuts: '' }, goals: [['area', w * h, '面积 = ' + w + ' × ' + h + ' = ' + w * h]], sol: { h } };
  } });

  add('gridbench', { gen(R, lv) {
    const v = lv === 1 ? R.int(0, 1) : R.int(0, 2);
    if (v === 0) { const x = R.int(1, 6), y = R.int(1, 6); return { title: '把点放到 (' + x + ', ' + y + ')', hook: '数对：先说第几列（横着数），再说第几行（竖着数）。拖点过去。', props: { mode: 0, px: 0, py: 0 }, goals: [['px', x, '第 ' + x + ' 列'], ['py', y, '第 ' + y + ' 行']], sol: { px: x, py: y } }; }
    if (v === 1) { for (;;) { const x = R.int(0, 4), y = R.int(0, 4), dx = R.int(-3, 4), dy = R.int(-3, 4); if (!dx && !dy || x + dx < 0 || y + dy < 0 || x + dx > 6 || y + dy > 6) continue; const say = (dx ? '向' + (dx > 0 ? '右' : '左') + '平移 ' + Math.abs(dx) + ' 格' : '') + (dx && dy ? '，再' : '') + (dy ? '向' + (dy > 0 ? '上' : '下') + '平移 ' + Math.abs(dy) + ' 格' : '');
      return { title: '点 P 在 (' + x + ', ' + y + ')，' + say + '，到了哪里？', hook: '平移只改位置：向右列数加，向上行数加。拖点 P 过去。', props: { mode: 0, px: x, py: y }, goals: [['px', x + dx, '列 ' + (x + dx)], ['py', y + dy, '行 ' + (y + dy)]], sol: { px: x + dx, py: y + dy } }; } }
    for (;;) { const px = R.int(-4, 4), py = R.int(-4, 4), ox = R.int(-2, 2), oy = R.int(-2, 2), rot = R.pick([90, 180, 270]); if (px === ox && py === oy) continue; const out = sim('gridbench', { mode: 1, px, py, ox, oy, rot });
      const nm = rot === 90 ? '逆时针旋转 90°' : rot === 180 ? '旋转 180°' : '顺时针旋转 90°';
      return { title: '点 P (' + px + ', ' + py + ') 绕点 O (' + ox + ', ' + oy + ') ' + nm + '，转到哪里？', hook: '转的时候 P 到 O 的距离不变，连线转过 ' + (rot === 180 ? 180 : 90) + '°。点按钮转一转，看看落在哪。', props: { mode: 1, px, py, ox, oy, rot: 0 }, goals: [['qx', out.qx, 'x = ' + out.qx], ['qy', out.qy, 'y = ' + out.qy]], sol: { rot }, answer: null }; }
  } });

  add('optbench', { gen(R, lv) {
    if (lv === 3 && R.bool()) {
      const t3 = R.int(2, 4), t2 = t3 + R.int(2, 3), t1 = t2 + R.int(2, 3), m1 = t1 - 1, m2 = t2 - 1, m3 = t3 - 1;   // 你的每一匹都比对方同等的慢 1，但比对方低一等的快
      return { title: '田忌赛马：你的马 ' + [m1, m2, m3].join('、') + '，对方 ' + [t1, t2, t3].join('、') + '，怎么派赢得多？', hook: '对方按 上、中、下 出场。点“派你的……”安排每一场。', props: { mode: 2, mine: [m1, m2, m3].join(','), theirs: [t1, t2, t3].join(',') }, goals: [['best', 1, '最多赢 2 场']], sol: { race: '2,0,1' } };
    }
    if (lv === 3) {
      const n = R.int(3, 5), m = R.int(2, 5), pots = [];
      if (n % 2 === 0) for (let i = 0; i < n; i += 2) { pots.push([i, i + 1]); pots.push([i, i + 1]); }
      else { for (let i = 0; i < n - 3; i += 2) { pots.push([i, i + 1]); pots.push([i, i + 1]); } const a = n - 3; pots.push([a, a + 1], [a, a + 2], [a + 1, a + 2]); }
      return { title: '烙 ' + n + ' 张饼，每面 ' + m + ' 分钟，锅里一次放 2 张，最少几分钟？', hook: '每一锅都放满 2 面，锅就不会空着。', props: { mode: 1, n, m }, goals: [['best', 1, '最少 ' + n * m + ' 分钟']], sol: { pots: pots.map((x) => x.join(',')).join(';') } };
    }
    const boil = R.int(6, 15), wash = R.int(1, 3), cup = R.int(1, 3), leaf = R.int(1, 2), brew = 1;
    const tasks = lv === 1 ? [['烧水', boil, '自', ''], ['洗茶杯', cup, '人', ''], ['拿茶叶', leaf, '人', ''], ['泡茶', brew, '人', '0+1+2']] : [['洗水壶', wash, '人', ''], ['烧水', boil, '自', '0'], ['洗茶杯', cup, '人', ''], ['拿茶叶', leaf, '人', ''], ['泡茶', brew, '人', '1+2+3']];
    const spec = tasks.map((t) => t.join(':')).join(';'), T = U.OptBench.parseTasks(spec), b = U.OptBench.best(T);
    let order = null; const used = [], go = (o) => { if (order) return; if (o.length === T.length) { const s = U.OptBench.schedule(T, o); if (s && s.total === b) order = o; return; } for (let i = 0; i < T.length; i++) if (!used[i]) { used[i] = true; go(o.concat([i])); used[i] = false; } }; go([]);
    return { title: '沏茶：' + tasks.map((t) => t[0] + ' ' + t[1] + ' 分').join('，') + '。最少几分钟？', hook: '烧水的时候人是空的。按顺序点事情，排进时间线。', props: { mode: 0, tasks: spec }, goals: [['best', 1, '最少 ' + b + ' 分钟']], sol: { order: order.join(',') } };
  } });

  add('weighbench', { gen(R, lv) {
    const n = lv === 1 ? R.int(3, 9) : lv === 2 ? R.int(10, 18) : R.int(19, 27), k = U.WeighBench.minW(n), hist = [];
    let cand = Array.from({ length: n }, (_, i) => i);
    while (cand.length > 1) {
      const c = Math.min(Math.ceil(cand.length / 3), Math.floor(cand.length / 2)), pan = Array(n).fill('0');
      cand.slice(0, c).forEach((i) => { pan[i] = '1'; }); cand.slice(c, 2 * c).forEach((i) => { pan[i] = '2'; });
      hist.push(pan.join('')); cand = U.WeighBench.model({ n, hist: hist.join(';') }).cand;
    }
    const thing = R.pick([['个零件', '轻一点'], ['枚硬币', '是假的（轻一点）'], ['盒饼干', '少了几块（轻一点）'], ['瓶药', '少了几粒（轻一点）']]);
    return { title: n + ' ' + thing[0] + '里有 1 ' + thing[0].slice(0, 1) + thing[1] + '，最少称几次一定能找出来？', hook: '天平按最不利的情况回答。把可疑的分成差不多的 3 份试试。', props: { n }, goals: [['best', 1, '称 ' + k + ' 次就保证找到']], sol: { hist: hist.join(';') } };
  } });

  add('ringbench', { gen(R, lv) {
    const g = (a, b) => (b ? g(b, a % b) : a);
    if (lv === 1) { for (;;) { const m = R.int(6, 15), k = R.int(2, m - 1), r = m / g(k, m); if (r === m && R.bool()) continue; return { title: m + ' 格的钟，每拍走 ' + k + ' 格，能走到几个格？', hook: '点“走一圈”，看几拍回到 0。', props: { m, k }, goals: [['reach', r, '走到 ' + r + ' 个格']], sol: { beats: r } }; } }
    for (;;) {
      const m = lv === 2 ? 10 : R.int(7, 13), k = R.int(2, m - 1), n = R.int(20, 80); if (g(k, m) !== 1) continue;
      let v = 1; for (let i = 0; i < n; i++) v = (v * k) % m;
      return { title: lv === 2 ? k + ' 的 ' + n + ' 次方，个位是几？' : k + ' 的 ' + n + ' 次方除以 ' + m + '，余数是几？', hook: m + ' 格的乘法钟，从 1 出发每拍乘 ' + k + '。先走一圈看几拍一轮，再走到第 ' + n + ' 拍。', props: { m, op: 1, k, gb: n }, goals: [['atv', v, '第 ' + n + ' 拍停在 ' + v]], sol: { beats: n } };
    }
  } });

  // 数的特征：卡片、要求、要几个都随机；拼不出来、太多就重出
  add('featbench', { gen(R, lv) {
    const C = U.FeatBench.CONDS;
    for (;;) {
      const fill = lv === 3 && R.bool(), len = fill ? R.int(3, 4) : lv === 1 ? 2 : 3;
      let cards, tpl, reuse = false;
      if (fill) { cards = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]; const h = R.int(0, len - 1); tpl = Array.from({ length: len }, (_, i) => (i === h ? '?' : String(i === 0 ? R.int(1, 9) : R.int(0, 9)))).join(''); reuse = true; }
      else { const pool = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]; cards = []; const nc = len + R.int(0, lv === 1 ? 1 : 2); while (cards.length < nc) { const d = pool.splice(R.int(0, pool.length - 1), 1)[0]; cards.push(d); } tpl = '?'.repeat(len); }
      const cond = lv === 1 ? R.pick([0, 2, 7, 8]) : R.int(0, C.length - 1), gk = fill ? 3 : lv === 1 ? R.pick([0, 1, 2]) : R.pick([1, 2, 3]);
      const props = { cards: cards.join(','), tpl, reuse, cond, gk }, m = U.FeatBench.model(props);
      if (!m.vs.length || m.vs.length < 2 || (gk === 3 && m.vs.length > 6)) continue;
      const target = gk === 1 ? m.max : gk === 2 ? m.min : m.vs[R.int(0, m.vs.length - 1)];
      const word = gk === 1 ? '最大的' : gk === 2 ? '最小的' : gk === 3 ? '所有' : '一个';
      const title = fill ? tpl.replace('?', '□') + ' 是 ' + C[cond][0] + '，□ 里可以填几？' : '用 ' + cards.join('、') + ' 拼' + word + (len === 2 ? '两' : '三') + '位数，要是 ' + C[cond][0];
      const hook = '2、5 看个位，3、9 看各位数字加起来。' + (gk === 3 ? '符合的点“记下这个”，找全为止。' : '');
      if (gk === 3) return { title, hook, props, goals: [['all', 1, '找全了：' + m.vs.join('、')]], sol: { found: m.vs.join(',') } };
      const ds = String(target).split('').map(Number), used = new Set(), pick = [];
      ds.forEach((d) => { const i = cards.findIndex((c, j) => c === d && !used.has(j)); used.add(i); pick.push(i); });
      return { title, hook, props, goals: [gk ? ['best', 1, word + '是 ' + target] : ['ok', 1, '比如 ' + target]], sol: { pick: pick.join(',') } };
    }
  } });

  add('surplusbench', { gen(R, lv) { const w = (fam, bench, o) => { const q = U.Word.make(R, fam, bench, o); return { title: q.title, hook: q.hook, props: q.props, goals: q.goals, sol: q.sol, fam: q.struct && q.struct.family }; }; return w('surplus', 'surplusbench', { lv }); } });

  // 关系图：从数量关系引擎拿结构（和倍、和差、归一、鸡兔、盈亏、相遇），画成“量 + 关系”，带几张常见的错卡
  add('relbench', { gen(R, lv) {
    const fam = lv === 1 ? R.pick(['pair', 'rate', 'meet']) : lv === 2 ? R.pick(['pair', 'rate', 'swap', 'meet']) : R.pick(['pair', 'swap', 'surplus']);
    const q = U.Word.make(R, fam, 'relbench', { lv, kinds: fam === 'pair' ? (lv === 1 ? ['times'] : ['times', 'sumdiff']) : undefined });
    return { title: q.title, hook: q.hook, props: q.props, goals: q.goals, sol: q.sol, fam: q.struct && q.struct.family };
  } });
  // 状态图：倒水（随机杯子和目标）、汉诺塔、取石子（随机几颗、最多拿几颗）、过河
  add('statebench', { gen(R, lv) {
    const SB = U.StateBench;
    const pathTo = (props, goal) => { const P = SB.PUZ[props.puz](props), sp = SB.space(P), g = sp.order.find(goal || ((k) => P.goal(sp.map.get(k).s) && sp.map.get(k).d === sp.best)), ids = []; let k = g;
      while (k && sp.map.get(k).d > 0) { const d = sp.map.get(k).d, pk = sp.order.find((x) => sp.map.get(x).d === d - 1 && sp.map.get(x).out.includes(k)), ps = sp.map.get(pk).s; ids.unshift(P.acts(ps).find((a) => a.ok && P.key(a.next) === k).id); k = pk; }
      return { ids, best: sp.best }; };
    const kind = lv === 1 ? R.pick(['pour', 'hanoi']) : lv === 2 ? R.pick(['pour', 'nim', 'river']) : R.pick(['pour', 'nim', 'hanoi']);
    if (kind === 'hanoi') { const n = lv === 1 ? 2 : 3, props = { puz: 2, pa: n }, r = pathTo(props); return { title: n + ' 个盘子的汉诺塔，最少几步搬到右柱？', hook: '大盘不能压小盘。走到以后看状态图：最短的路几步？', props, goals: [['fewest', 1, '最少 ' + r.best + ' 步']], sol: { path: r.ids.join(',') } }; }
    if (kind === 'river') { const props = { puz: 1 }, r = pathTo(props); return { title: '农夫带狼、羊、菜过河，最少几趟？', hook: '走错了会出现红点：退一步。', props, goals: [['fewest', 1, '最少 ' + r.best + ' 趟']], sol: { path: r.ids.join(',') } }; }
    if (kind === 'nim') {
      for (;;) { const m = R.int(2, 4), n = R.int(m + 2, 15); if (n % (m + 1) === 0) continue;
        const ids = []; let left = n; while (left > 0) { const k = left % (m + 1); ids.push('t' + k); left -= k; if (left > 0) { const c = SB.compTake(left, m); ids.push('t' + c); left -= c; } }
        return { title: n + ' 颗石子，轮流拿 1 到 ' + m + ' 颗，拿到最后一颗的赢。你先拿，赢电脑！', hook: '先“往回标”：留给对方几颗，对方一定输？', props: { puz: 3, pa: n, pb: m }, goals: [['won', 1, '赢了：每次留给对方 ' + (m + 1) + ' 的倍数']], sol: { path: ids.join(',') } }; }
    }
    for (;;) { const A = R.int(4, 11), B = R.int(2, A - 1), tg = R.int(1, A - 1), props = { puz: 0, pa: A, pb: B, pt: tg }; if (tg === B) continue; const r = pathTo(props); if (r.best < (lv === 1 ? 2 : 4) || r.best < 0) continue;
      return { title: '只用 ' + A + ' 升和 ' + B + ' 升的杯子，最少几步量出 ' + tg + ' 升？', hook: '每一种两杯的水量是一个点。走到以后点“看全部”，找最短的路。', props, goals: [['fewest', 1, '最少 ' + r.best + ' 步']], sol: { path: r.ids.join(',') } }; }
  } });

  // 高斯求和：容易 1 + 2 + … + n；中等 奇数、偶数、隔几个的和（自己摆出这串数）；难 给头、尾、每次加几（先求个数）或者情境（座位、堆木头）
  add('gaussbench', { gen(R, lv) {
    const fin = { flip: true, pair: true };
    if (lv === 1) { const n = R.pick([10, 20, 30, 40, 50, 60, 100]), t = n * (n + 1) / 2; return { title: '1 + 2 + 3 + … + ' + n + ' 等于多少？', hook: '倒过来写一行，上下对齐相加：每一列都一样大。', props: { a: 1, d: 1, n }, goals: [['total', t, '和是 ' + t]], sol: fin, answer: t }; }
    for (;;) {
      const a = lv === 2 ? R.pick([1, 2]) : R.int(2, 30), d = lv === 2 ? 2 : R.int(2, 6), n = lv === 2 ? R.int(8, 30) : R.int(8, 30), last = a + (n - 1) * d, t = (a + last) * n / 2;
      if (lv === 2) return { title: Array.from({ length: 3 }, (_, i) => a + i * d).join(' + ') + ' + … + ' + last + ' 等于多少？', hook: '先摆出这串数：从 ' + a + ' 开始，每次加几？几个数时最后一个是 ' + last + '？再倒过来配对。', props: { a, d: 1, n: 2 }, goals: [['last', last, '摆对了：最后一个是 ' + last], ['total', t, '和是 ' + t]], sol: Object.assign({ d, n }, fin), answer: t };
      if (R.bool()) return { title: a + ' + ' + (a + d) + ' + ' + (a + 2 * d) + ' + … + ' + last + '：一共几个数？和是多少？', hook: '从 ' + a + ' 到 ' + last + ' 加了几次 ' + d + '？数的个数比加的次数多 1。调好个数，再倒过来配对。', props: { a, d, n: 2 }, goals: [['n', n, '一共 ' + n + ' 个数'], ['total', t, '和是 ' + t]], sol: Object.assign({ n }, fin), answer: t };
      const [thing, unit, how] = R.pick([['剧场座位', '个座位', '第一排 ' + a + ' 个，往后每排多 ' + d + ' 个，一共 ' + n + ' 排'], ['堆木头', '根', '最上面一层 ' + a + ' 根，往下每层多 ' + d + ' 根，一共 ' + n + ' 层'], ['存钱', '元', '第一天存 ' + a + ' 元，以后每天比前一天多存 ' + d + ' 元，存了 ' + n + ' 天']]);
      return { title: thing + '：' + how + '。一共多少' + unit.replace(/^个/, '') + '？', hook: '把它摆成一串数：从几开始？每次加几？几个数？再倒过来配对。', props: { a: 1, d: 1, n: 2 }, goals: [['last', last, '最后一个是 ' + last], ['total', t, '一共 ' + t + ' ' + unit]], sol: Object.assign({ a, d, n }, fin), answer: t };
    }
  } });
  // 牛吃草：容易 一天一天看（几头牛正好几天吃完）；中等、难 两次记录找长速，再问第三种牛数吃几天。先定答案（长速、原有草量），再配牛数和天数，保证都是整数
  add('grassbench', { gen(R, lv) {
    if (lv === 1) for (;;) { const r = R.int(1, 6), days = R.int(3, 10), net = R.int(3, 12), g = days * net; if (g > 600) continue; const k = net + r; return { title: '原来有 ' + g + ' 份草，每天长 ' + r + ' 份。几头牛正好 ' + days + ' 天吃完？', hook: '一头牛一天吃 1 份。改牛的头数，看每天的草量柱子：第 ' + days + ' 天正好吃完。', props: { mode: 1, g, r, k: 1 }, goals: [['exact', days, k + ' 头牛']], sol: { k }, answer: k }; }
    const things = R.pick([['牛', '草'], ['羊', '草'], ['抽水机', '水']]);
    for (;;) {
      const r = R.int(lv === 2 ? 2 : 4, lv === 2 ? 8 : 15), d2 = R.int(4, 10), d1 = d2 + R.int(2, lv === 2 ? 10 : 8), L = d1 * d2 / gcd(d1, d2), g = L * R.int(1, 4);
      if (g > 600) continue;
      const k1 = g / d1 + r, k2 = g / d2 + r; if (k1 > 60 || k2 > 60 || k1 === k2) continue;
      const ts = []; for (let t = 2; t <= 30; t++) if (g % t === 0 && g / t + r <= 60 && t !== d1 && t !== d2) ts.push(t); if (!ts.length) continue;
      const t3 = R.pick(ts), k3 = g / t3 + r, [who, what] = things;
      const unit = who === '抽水机' ? '台' : '头', title = who === '抽水机' ? '井里的水一边往外冒一边被抽：' + k1 + ' 台抽水机 ' + d1 + ' 小时抽干，' + k2 + ' 台 ' + d2 + ' 小时抽干。' + k3 + ' 台几小时抽干？' : '一片' + what + '地：' + k1 + ' ' + unit + who + ' ' + d1 + ' 天吃完，' + k2 + ' ' + unit + who + ' ' + d2 + ' 天吃完。' + k3 + ' ' + unit + who + '几天吃完？';
      return { title, hook: '先比两次：多的那几天多吃的，就是那几天新长的。改“每天长几份”，让两根长条里“原来的”一样长；再改第三行的天数。', props: { mode: 0, r: 0, k1, d1, k2, d2, k3, t3: 1 }, goals: [['r', r, '每天长 ' + r + ' 份'], ['t3', t3, k3 + ' ' + unit + ' ' + t3 + (who === '抽水机' ? ' 小时' : ' 天')]], sol: { r, t3 }, answer: t3 };
    }
  } });

  // 摸球保证（最不利原则）：容易 2 个同色；中等 m 个同色（有的颜色不够 m − 1 个是陷阱）或 m 个红的；难 每种颜色都有。参考做法是最倒霉的那一种摸法
  add('pigeonbench', { gen(R, lv) {
    const NM = ['红', '黄', '蓝', '绿'];
    for (;;) {
      const nc = R.int(lv === 1 ? 2 : 3, 4), c = [0, 1, 2, 3].map((i) => (i < nc ? R.int(lv === 1 ? 3 : 1, lv === 3 ? 9 : 8) : 0));
      const [thing, unit, how, vb] = R.pick([['球', '个', '闭着眼睛摸', '摸'], ['袜子', '只', '黑着灯拿', '拿'], ['铅笔', '支', '闭着眼睛拿', '拿']]);
      const has = c.slice(0, nc).map((v, i) => NM[i] + thing + ' ' + v + ' ' + unit).join('、');
      const props = { c1: c[0], c2: c[1], c3: c[2], c4: c[3], x1: 0, x2: 0, x3: 0, x4: 0 };
      if (lv === 1 || (lv === 2 && R.bool())) {
        const m = lv === 1 ? 2 : R.int(3, 4); if (!c.some((v) => v >= m)) continue;
        if (lv === 2 && !c.slice(0, nc).some((v) => v < m - 1)) continue;   // 中等要有一种颜色不够 m − 1 个
        const x = c.map((v) => Math.min(v, m - 1)), ans = x.reduce((a, b) => a + b, 0) + 1;
        return { title: '盒子里有' + has + '。' + how + '，至少' + vb + '几' + unit + '才能保证有 ' + m + ' ' + unit + '同色的？', hook: '你来当最倒霉的人：一' + unit + '一' + unit + '地' + vb + '，尽量不让它成功。' + vb + '到卡住，再加 1。', props: Object.assign(props, { want: 0, m }), goals: [['guar', ans, '至少 ' + ans + ' ' + unit]], sol: { x1: x[0], x2: x[1], x3: x[2], x4: x[3] }, answer: ans };
      }
      if (lv === 2) {
        const m = R.int(2, Math.max(2, c[0])); if (c[0] < 2) continue;
        const x = c.map((v, i) => (i ? v : m - 1)), ans = x.reduce((a, b) => a + b, 0) + 1;
        return { title: '盒子里有' + has + '。' + how + '，至少' + vb + '几' + unit + '才能保证有 ' + m + ' ' + unit + '红的？', hook: '最倒霉的时候，先' + vb + '到的都是什么颜色？红的' + vb + '到几' + unit + '就卡住了？', props: Object.assign(props, { want: 2, m }), goals: [['guar', ans, '至少 ' + ans + ' ' + unit]], sol: { x1: x[0], x2: x[1], x3: x[2], x4: x[3] }, answer: ans };
      }
      if (c.slice(0, nc).some((v) => v < 1)) continue;
      const lo = c.slice(0, nc).indexOf(Math.min(...c.slice(0, nc))), x = c.map((v, i) => (i === lo ? 0 : v)), ans = x.reduce((a, b) => a + b, 0) + 1;
      if (c.slice(0, nc).filter((v) => v === c[lo]).length > 1 && R.bool()) continue;
      return { title: '盒子里有' + has + '。' + how + '，至少' + vb + '几' + unit + '才能保证每种颜色都有？', hook: '最倒霉的人会把哪几种颜色先全' + vb + '完？试几种' + vb + '法，比一比卡住时哪种' + vb + '得最多。', props: Object.assign(props, { want: 1, m: 1 }), goals: [['guar', ans, '至少 ' + ans + ' ' + unit]], sol: { x1: x[0], x2: x[1], x3: x[2], x4: x[3] }, answer: ans };
    }
  } });
  // 枚举树：容易 1…m 排两位数（不重复）；中等 带 0、可重复、或者三位数；难 只要双数 / 单数，或者凑钱。参考做法：全部展开
  add('treebench', { gen(R, lv) {
    const T = U.TreeBench.model, fin = { open: 6 };
    const mk = (p) => { const props = Object.assign({ mode: 0, m: 3, zero: false, k: 2, rep: false, cond: 0, set: 0, amt: 10, open: 0 }, p), n = T(Object.assign({}, props, fin)).count; return { props, n }; };
    if (lv === 3 && R.bool()) {
      const set = R.int(0, 1), amt = set ? R.pick([15, 20, 25, 30]) : R.int(6, 15), { props, n } = mk({ mode: 1, set, amt });
      const [b, mid] = set ? [10, 5] : [5, 2];
      return { title: '用 1 元、' + mid + ' 元、' + b + ' 元的钱（每种都足够多）凑 ' + amt + ' 元，有几种凑法？', hook: '先定大的：' + b + ' 元用几张？每一枝再看 ' + mid + ' 元用几张，剩下的用 1 元。', props, goals: [['count', n, '一共 ' + n + ' 种']], sol: fin, answer: n };
    }
    const p = lv === 1 ? { m: R.int(3, 5) } : lv === 2 ? R.pick([{ m: R.int(3, 5), zero: true }, { m: R.int(2, 4), rep: true }, { m: R.int(3, 4), k: 3 }]) : Object.assign({ m: R.int(3, 5), cond: R.int(1, 2) }, R.pick([{}, { zero: true }, { rep: true }]));
    const { props, n } = mk(p), cs = Array.from({ length: props.m }, (_, i) => (props.zero ? i : i + 1));
    const title = '用 ' + cs.join('、') + ' 这 ' + props.m + ' 个数字排' + (props.k === 2 ? '两' : '三') + '位数' + (props.rep ? '（同一个数字可以重复用）' : '（每个数字只能用一次）') + '，' + (props.cond ? CONDT[props.cond] + '有几个？' : '能排几个？');
    const hook = props.zero ? '0 能打头吗？先定最高位，一枝一枝展开。' : props.cond ? '先定十位，一枝一枝列出来；个位是几才是' + CONDT[props.cond].slice(2) + '？' : '先定最高位是几，一枝一枝展开：每一枝一样多吗？';
    return { title, hook, props, goals: [['count', n, '一共 ' + n + ' 个']], sol: fin, answer: n };
  } });

  add('pourbench', { gen(R, lv) {
    for (;;) {
      const A = R.int(4, 11), B = R.int(2, A - 1), tg = R.int(1, A - 1), r = U.PourBench.fewest(A, B, 0, 0, tg);
      if (r.n < 2 || (lv === 1 && r.n > 4) || (lv === 2 && (r.n < 5 || r.n > 6)) || (lv === 3 && r.n < 7)) continue;
      const goals = [['hit', 1, '量出 ' + tg + ' 升']]; if (lv === 3) goals.push(['fewest', 1, '最少 ' + r.n + ' 步']);
      const liq = R.pick(['水', '油', '牛奶', '果汁']);
      return { title: R.pick(['只用 ' + A + ' 升和 ' + B + ' 升的杯子，怎么量出 ' + tg + ' 升' + liq + '？', '客人要买 ' + tg + ' 升' + liq + '，店里只有 ' + A + ' 升和 ' + B + ' 升的两个空桶，怎么量？']), hook: '杯子没有刻度：只能装满、倒空、从一个倒进另一个。' + (lv === 3 ? '还要用最少的步数。' : ''), props: { A, B, tgt: tg }, goals, sol: { hist: r.path.join(',') } };
    }
  } });

  add('sortbench', { gen(R, lv) {
    const n = lv === 1 ? R.int(4, 6) : lv === 2 ? R.int(7, 10) : R.int(11, 14), crit = lv === 3 ? 1 : R.int(0, 1), colors = lv === 1 ? [0, 2] : [0, 1, 2];
    const items = Array.from({ length: n }, () => R.pick(colors) + '' + R.int(0, 2));
    const key = (x) => (crit === 0 ? x[0] : x[1]);
    return { title: R.pick([n + ' 张卡片，', '一堆积木（' + n + ' 块），', n + ' 张贴纸，']) + (crit === 0 ? '按颜色' : '按形状') + '分一分，每类几个？', hook: '点一张卡片，再点它该去的框。分完数一数，和总数核对。', props: { items: items.join(','), crit }, goals: [['check', 1, '分完了：一共 ' + n + ' 个，和总数一样']], sol: { place: items.map(key).join('') } };
  } });

  add('combobench', { gen(R, lv) {
    if (lv === 3) { const ds = R.pick([['1', '2', '3'], ['0', '1', '2'], ['0', '3', '5'], ['2', '4', '6', '8'], ['0', '1', '2', '3']]), cells = []; ds.forEach((d, i) => ds.forEach((e, j) => { if (i !== j && d !== '0') cells.push(i + '-' + j); }));
      return { title: '用 ' + ds.join('、') + ' 能排几个两位数？', hook: '十位、个位各放一张，一张不能用两次，0 不能在十位。', props: { mode: 1, digits: ds.join(',') }, goals: [['pairs', cells.length, '一共 ' + cells.length + ' 个']], sol: { cells: cells.join(',') } }; }
    const a = R.int(2, 4), b = R.int(2, 5), c = lv === 2 ? R.int(2, 3) : 0, cells = []; for (let i = 0; i < a; i++) for (let j = 0; j < b; j++) cells.push(i + '-' + j);
    return { title: a + ' 件上衣、' + b + ' 条裤子' + (c ? '、' + c + ' 双鞋' : '') + '，一共几种穿法？', hook: '点格子列出每一种：一行是一件上衣，一列是一条裤子。' + (c ? '列全了再配鞋。' : ''), props: { mode: 0, a, b, c }, goals: c ? [['all', a * b * c, a + ' × ' + b + ' × ' + c + ' = ' + a * b * c + ' 种']] : [['pairs', a * b, a + ' × ' + b + ' = ' + a * b + ' 种']], sol: c ? { cells: cells.join(','), shoes: true } : { cells: cells.join(',') } };
  } });
  add('dirbench', { gen(R, lv) {
    const D8 = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'], PL = ['图书馆', '医院', '公园', '超市', '邮局', '车站', '电影院', '体育馆'];
    if (lv === 1) { const t = R.int(0, 7), rev = R.bool(), want = rev ? (t + 4) % 8 : t; return { title: rev ? PL[t] + '在学校的' + D8[t] + '，学校在' + PL[t] + '的什么方向？' : PL[t] + '在学校的什么方向？', hook: '地图上方是北。点 8 个方向里的一个。', props: { mode: 0, target: t, rev }, goals: [['right', 1, '是' + D8[want]]], sol: { ans: want } }; }
    if (lv === 2) { for (;;) { const sx = R.int(0, 9), sy = R.int(0, 6), tx = R.int(0, 9), ty = R.int(0, 6), dx = tx - sx, dy = ty - sy; if (Math.abs(dx) + Math.abs(dy) < 4) continue; const path = (dx > 0 ? 'E' : 'W').repeat(Math.abs(dx)) + (dy > 0 ? 'S' : 'N').repeat(Math.abs(dy)); return { title: '从家走到学校，走最短的路', hook: '点 ↑ ↓ ← → 一格一格走（↑ 是北），不走回头路。', props: { mode: 1, sx, sy, tx, ty }, goals: [['shortest', 1, '最短 ' + path.length + ' 格']], sol: { path } }; } }
    for (;;) { const tdeg = R.int(1, 23) * 15, tdist = R.int(1, 4); if (tdeg % 90 === 0) continue; return { title: '找到 ' + U.DirBench.bearing(tdeg) + '，' + tdist * 100 + ' 米 的地方', hook: '拖射线一头：先转方向（15° 一格），再拉距离（一圈 100 米）。', props: { mode: 2, deg: 0, dist: 1, tdeg, tdist }, goals: [['hit', 1, U.DirBench.bearing(tdeg) + '，' + tdist * 100 + ' 米']], sol: { deg: tdeg, dist: tdist } }; }
  } });

  // ===================== 倒推题：给结果，找条件 =====================
  const addRev = (type, rev) => { if (GENS[type]) GENS[type].rev = rev; };
  addRev('areamodel', function (R) { const w = R.int(3, 12), h = R.int(2, 8); return { title: '长方形面积是 ' + w * h + '，长是 ' + w + '，宽是几？', hook: '长已经是 ' + w + ' 了。拖下边改宽，让面积正好是 ' + w * h + '。', props: { mode: 0, w, h: 1, vcuts: '', hcuts: '' }, goals: [['area', w * h, '宽是 ' + h + '：' + w + ' × ' + h + ' = ' + w * h]], sol: { h } }; });
  addRev('numlinebench', function (R) { const a = R.int(1, 10), n = R.int(2, 9); return { title: '从几出发，往右跳 ' + n + ' 步，落在 ' + (a + n) + '？', hook: '往右跳的步数已经定好了。拖起点，让最后落在 ' + (a + n) + '。', props: { mode: 0, from: 0, to: 20, a: 0, s: 1, n }, goals: [['value', a + n, '从 ' + a + ' 出发：' + a + ' + ' + n + ' = ' + (a + n)]], sol: { a } }; });
  addRev('clockbench', function (R) { const h = R.int(2, 10), m = R.int(1, 11) * 5, d = R.pick([20, 30, 40, 45]), t = h * 60 + m - d; const fmt = (x) => Math.floor(x / 60) + ' 时' + (x % 60 ? ' ' + (x % 60) + ' 分' : '整'); return { title: '再过 ' + d + ' 分钟是 ' + fmt(h * 60 + m) + '，现在是几时几分？', hook: '把钟拨到“现在”：从 ' + fmt(h * 60 + m) + ' 往回拨 ' + d + ' 分钟。', props: { t: 0, start: 0, timing: false }, goals: [['t', t, '现在是 ' + fmt(t)]], sol: { t } }; });
  addRev('seqbench', function (R) { const KD = [[4, 3, '火柴摆正方形', '根火柴'], [4, 2, '桌子拼起来坐人', '个人']], k = R.int(0, 1), [a, d, name, unit] = KD[k], n = R.int(6, 30), v = a + (n - 1) * d; return { title: name + '：第几个要 ' + v + ' ' + unit + '？', hook: '先摆几个找出规律，再改 n，让第 n 个正好是 ' + v + '。', props: { kind: k, k: 1, a: 0, d: 0, n: 1 }, goals: [['term', v, '第 ' + n + ' 个：' + a + ' + (' + n + ' − 1) × ' + d + ' = ' + v]], sol: { k: 3, a, d, n } }; });
  addRev('rulerbench', function (R) { const L = R.int(11, 30) * 10, rest = R.int(2, L / 5 - 2) * 5; return { title: '一根 ' + L + ' 厘米的绳子，剪下几厘米，正好剩下 ' + rest + ' 厘米？', hook: '拖剪刀：剩下的要正好是 ' + rest + ' 厘米。', props: { mode: 1, L }, goals: [['rest', rest, '剪下 ' + (L - rest) + ' 厘米']], sol: { cut: L - rest } }; });
  addRev('anglebench', function (R) { const a = R.int(3, 33) * 5; return { title: '∠2 是 ' + (180 - a) + '°，∠1 是几度？', hook: '一条直线上的两个角合起来是 180°。拖射线，让 ∠2 正好是 ' + (180 - a) + '°（点 ∠2 量一量）。', props: { mode: 1, a: a === 90 ? 60 : 90 }, goals: [['other', 180 - a, '∠1 = 180° − ' + (180 - a) + '° = ' + a + '°']], sol: { a, seen: '2' } }; });
  addRev('areabench', function (R) { const b = R.int(3, 10), h = R.int(2, 6); return { title: '平行四边形面积 ' + b * h + '，底 ' + b + '，高是几？', hook: '拖顶边改高，再剪下来、移过去拼成长方形，面积要正好是 ' + b * h + '。', props: { shape: 0, b, h: 1, s: 1 }, goals: [['area', b * h, '高是 ' + h + '：' + b + ' × ' + h + ' = ' + b * h]], sol: { h, step: 2, seen: '1' } }; });
  addRev('circlebench', function (R) { const r = R.int(2, 9); return { title: '圆的面积是 ' + (314 * r * r / 100) + '，半径是几？（π 取 3.14）', hook: '拖半径，让面积正好是 ' + (314 * r * r / 100) + '。', props: { mode: 0, r: 1 }, goals: [['area', qs(314 * r * r, 100), '半径是 ' + r]], sol: { r } }; });
  addRev('gapbench', function (R) { const gap = R.pick([2, 4, 5, 10]), k = R.int(4, 12), len = gap * k; return { title: len + ' 米的路，两头都种，一共种了 ' + (k + 1) + ' 棵，每隔几米种一棵？', hook: '调“每隔几米”，让棵数正好是 ' + (k + 1) + '。', props: { len, gap: 1, le: 1, re: 1, ring: 0 }, goals: [['trees', k + 1, '每隔 ' + gap + ' 米：' + k + ' 段，' + (k + 1) + ' 棵']], sol: { gap } }; });
  addRev('decbench', function (R) { const a = R.int(11, 99), sh = R.pick([1, 2]), sv = Math.round(a * Math.pow(10, sh)) / 100; return { title: (a / 100) + ' 变成 ' + sv + '，小数点向哪边移了几位？', hook: '点“小数点 →”“← 小数点”，让它正好变成 ' + sv + '。', props: { mode: 3, a: String(a / 100) }, goals: [['shifted', qs(a * Math.pow(10, sh), 100), '向右移 ' + sh + ' 位，扩大到 ' + Math.pow(10, sh) + ' 倍']], sol: { shift: sh } }; });
  addRev('vertbench', function (R) {
    for (;;) {
      const op = R.int(0, 1), a0 = R.int(21, 98), b0 = R.int(12, op ? a0 - 10 : 99 - a0), r0 = op ? a0 - b0 : a0 + b0;
      if (r0 < 10 || b0 < 10) continue;
      const rows = [String(a0), String(b0), String(r0)], cand = [];
      rows.forEach((r, i) => [...r].forEach((_, j) => { if (i < 2) cand.push([i, j]); }));
      const holes = []; while (holes.length < 2) { const h = R.pick(cand); if (!holes.some((x) => x[0] === h[0] && x[1] === h[1])) holes.push(h); }
      const masked = rows.map((r, i) => [...r].map((ch, j) => (holes.some((h) => h[0] === i && h[1] === j) ? '?' : ch)).join(''));
      // 只要唯一解
      let n = 0; const hs = []; masked.forEach((r, i) => [...r].forEach((ch, j) => { if (ch === '?') hs.push([i, j]); }));
      for (let x = 0; x < 100; x++) { const ds = [Math.floor(x / 10), x % 10], v = masked.map((r) => r.split('')); hs.forEach(([i, j], k) => { v[i][j] = String(ds[k]); }); if (v.some((r) => r.length > 1 && r[0] === '0')) continue; const nn = v.map((r) => +r.join('')); if (op ? nn[0] - nn[1] === nn[2] : nn[0] + nn[1] === nn[2]) n++; }
      if (n !== 1) continue;
      const fill = hs.map(([i, j]) => rows[i][j]).join('');
      return { title: masked.map((x) => x.replace(/\?/g, '□')).slice(0, 2).join(op ? ' − ' : ' + ') + ' = ' + rows[2] + '：□ 里是几？', hook: '先从能确定的那一位想：个位、进位、退位。点 □，再点数字键。', props: { mode: 3, fa: masked[0], fb: masked[1], fr: masked[2], fop: op }, goals: [['ok', 1, rows[0] + (op ? ' − ' : ' + ') + rows[1] + ' = ' + rows[2]]], sol: { fill } };
    }
  });
  // ===================== 找错题：小明的做法里有一处错 =====================
  GENS.vertbench.bug = function (R) {
    for (;;) {
      const sub = R.bool();
      if (!sub) { const a = R.int(15, 79), b = R.int(12, 99 - a); if ((a % 10) + (b % 10) < 10) continue; const right = a + b, wrong = right - 10, rs = String(right), ws = String(wrong); if (ws.length !== rs.length) continue; let diff = 0; for (let j = 0; j < rs.length; j++) if (rs[j] !== ws[j]) diff++; if (diff !== 1) continue;
        return { title: '小明算 ' + a + ' + ' + b + ' = ' + wrong + '：哪一位错了？', hook: '看小明的竖式：一位一位重新算一遍，找出写错的那一位，改对。', props: { mode: 4, a, b, bop: 0, wrong: String(wrong), why: '个位满十，进的 1 忘了加到十位上' }, goals: [['fixed', 1, '十位错了：' + a + ' + ' + b + ' = ' + right]], sol: { pickc: 1, fixd: Math.floor(right / 10) % 10 } }; }
      const a = R.int(31, 99), b = R.int(12, a - 10); if ((a % 10) >= (b % 10)) continue; const right = a - b, wrong = right + 10, rs = String(right), ws = String(wrong); if (ws.length !== rs.length) continue; let diff = 0; for (let j = 0; j < rs.length; j++) if (rs[j] !== ws[j]) diff++; if (diff !== 1) continue;
      return { title: '小明算 ' + a + ' − ' + b + ' = ' + wrong + '：哪一位错了？', hook: '看小明的竖式：个位不够减向十位借了 1，十位呢？找出写错的那一位，改对。', props: { mode: 4, a, b, bop: 1, wrong: String(wrong), why: '个位向十位借了 1，十位忘了减 1' }, goals: [['fixed', 1, '十位错了：' + a + ' − ' + b + ' = ' + right]], sol: { pickc: 1, fixd: Math.floor(right / 10) % 10 } };
    }
  };
  addRev('blocksbench', function (R) { const n = R.int(31, 89), d = R.pick([10, 20, 1, 2]); return { title: '比 ' + (n - d) + ' 多 ' + d + ' 的数是几？摆出来', hook: '用十条和一块摆出这个数。多 ' + d + ' 是多几个十，还是多几个一？', props: { mode: 0, h: 0, t: 0, o: 0 }, goals: [['value', n, '是 ' + n]], sol: { t: Math.floor(n / 10), o: n % 10 } }; });

  // ===================== 关卡链：每个操作台一条闯关路线 =====================
  // 先是这个操作台的题（按年级、难度排），再是随机题 容易 → 中等 → 难（种子固定，星星记得住），最后是倒推。
  // 上一关拿到至少 1 颗星，下一关才解锁。
  const CHAIN_SEED = 900001;
  U.Chain = {
    of(type) {
      if (!U.types[type] || !U.types[type].bench) return [];
      const own = U.problems.filter((p) => (p.shelf || [])[0] === type).sort((a, b) => (a.grade || 9) - (b.grade || 9) || (a.rung || 0) - (b.rung || 0)).slice(0, 6).map((p) => ({ id: p.id, title: p.title, kind: '题' }));
      const qs = GENS[type] ? [1, 2, 3].map((lv) => ({ id: U.Quiz.id(type, CHAIN_SEED + lv, lv), title: '随机 · ' + LEVELS[lv - 1], kind: '随机' })) : [];
      // 通用任务层出的关卡用 CHAIN_SEED（hasTask 就是用它试出来的，保证打得开）
      const tk = [[7, '找全：不止一种，全部找出来', '找全'], [9, '推广：做几个，找规律', '推广']].filter((x) => U.Quiz.hasTask(type, x[0])).map(([lv, title, kind]) => ({ id: U.Quiz.id(type, CHAIN_SEED, lv), title, kind }));
      const rv = U.Quiz.hasRev(type) ? [{ id: U.Quiz.id(type, GENS[type].rev ? CHAIN_SEED + 4 : CHAIN_SEED, 4), title: '倒推：给结果，找条件', kind: '倒推' }] : [];
      const bg = U.Quiz.hasBug(type) ? [{ id: U.Quiz.id(type, CHAIN_SEED + 5, 5), title: '找错：小明哪里错了', kind: '找错' }] : [];
      return own.concat(qs, tk, rv, bg);
    },
    // 每一关的星数、是否解锁；整条的进度
    status(type, best) {
      const L = U.Chain.of(type), st = L.map((x) => best(x.id));
      return { levels: L.map((x, i) => Object.assign({}, x, { stars: st[i], open: i === 0 || st[i - 1] > 0 })), stars: st.reduce((s, x) => s + x, 0), max: 3 * L.length, passed: st.filter((x) => x > 0).length };
    },
    types: () => Object.values(U.types).filter((t) => t.bench && !t.hidden && U.Chain.of(t.id).length >= 4).sort((a, b) => (a.grades[0] - b.grades[0]) || a.label.localeCompare(b.label)).map((t) => t.id),
    next(pid) { for (const type of U.Chain.types()) { const L = U.Chain.of(type), i = L.findIndex((x) => x.id === pid); if (i >= 0) return i + 1 < L.length ? { type, id: L[i + 1].id, n: i + 2, of: L.length } : null; } return null; },
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
