/* 器材包 ptree：树状图和概率面积模型（docs/new-instruments.md 6.10）。把“两步试验”画出来数。
 *   三个试验：掷两次硬币；袋里 2 红 1 白，摸两次放回；同一个袋，摸两次不放回。树上每条路径的概率 = 沿途相乘（精确分数）。
 *   先猜某个事件的概率，再点出属于这个事件的路径，把它们的概率加起来；所有路径加起来必须是 1（不是 1 系统标红）。
 *   面积模型（放回 / 独立时）：单位正方形，横边按第一步分、竖边按第二步分，每个小长方形的面积是一条路径的概率。
 *   事件由出题人设；路径全部列出就是穷举（③）。
 * 和设计文档的差别（如实写）：试验是固定的 3 个（不能自己画树）；没有接“真做 400 次”的实验对照；不放回时面积模型画不成长方形，只给树。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', typeof n === 'number' ? Q(n) : n, { dim: null });
  // 试验：branches(步骤 1) → [{ label, p }]，第二步依赖第一步的结果 first(label) → [{ label, p }]
  const EXPS = [
    { name: '掷两次硬币', s1: [['正', Q(1, 2)], ['反', Q(1, 2)]], s2: () => [['正', Q(1, 2)], ['反', Q(1, 2)]], events: [['至少一次正面', (a, b) => a === '正' || b === '正'], ['一正一反', (a, b) => a !== b], ['两次相同', (a, b) => a === b]] },
    { name: '摸两次（放回）：2 红 1 白', s1: [['红', Q(2, 3)], ['白', Q(1, 3)]], s2: () => [['红', Q(2, 3)], ['白', Q(1, 3)]], events: [['两次同色', (a, b) => a === b], ['一红一白', (a, b) => a !== b], ['至少一次红', (a, b) => a === '红' || b === '红']] },
    { name: '摸两次（不放回）：2 红 1 白', s1: [['红', Q(2, 3)], ['白', Q(1, 3)]], s2: (a) => (a === '红' ? [['红', Q(1, 2)], ['白', Q(1, 2)]] : [['红', Q(1)], ['白', Q(0)]]), events: [['两次同色', (a, b) => a === b], ['一红一白', (a, b) => a !== b], ['至少一次红', (a, b) => a === '红' || b === '红']] },
  ];
  const expOf = (p) => EXPS[Math.max(0, Math.min(p.exp, EXPS.length - 1))];
  const pathsOf = (E) => { const r = []; E.s1.forEach(([a, pa]) => E.s2(a).forEach(([b, pb]) => r.push({ a, b, p: Q.mul(pa, pb) }))); return r; };
  const sel = (p) => String(p.sel || '').split(',').filter(Boolean).map(Number);
  const ans = (t) => { try { return Q.parse(String(t)); } catch (e) { return null; } };
  function judge(p) {
    const E = expOf(p), paths = pathsOf(E), ev = E.events[Math.max(0, Math.min(p.ev, E.events.length - 1))], S = sel(p);
    let tot = Q(0); paths.forEach((x) => { tot = Q.add(tot, x.p); });
    let pr = Q(0); S.forEach((i) => { if (paths[i]) pr = Q.add(pr, paths[i].p); });
    const truth = paths.map((x, i) => (ev[1](x.a, x.b) && Q.cmp(x.p, Q(0)) > 0 ? i : -1)).filter((i) => i >= 0), eventOk = truth.length === S.length && truth.every((i) => S.includes(i)) ? 1 : 0;
    let truthP = Q(0); truth.forEach((i) => { truthP = Q.add(truthP, paths[i].p); });
    const g = ans(p.gans);
    return { E, paths, ev, S, tot, pr, eventOk, truthP, guessed: g && Q.cmp(g, truthP) === 0 ? 1 : 0 };
  }
  function onSet(p, k, v) {
    if (k === 'exp' || k === 'ev') return { sel: '', gans: p.gans };
    if (k === 'tg') { if (!(v > 0)) return { tg: 0 }; const i = v - 1, S = sel(p), at = S.indexOf(i); if (at >= 0) S.splice(at, 1); else S.push(i); S.sort((x, y) => x - y); return { tg: 0, sel: S.join(',') }; }
    return null;
  }
  function draw(c) {
    const p = c.props, J = judge(p), W = c.w, H = []; let s = '';
    s += K.text(10, 16, J.E.name + '　事件：' + J.ev[0], { size: 12, anchor: 'start', weight: 700 });
    // 树
    const x0 = 20, y0 = 36, rowH = 26, n1 = J.E.s1.length;
    s += K.circle(x0, y0 + rowH * 2, 5, { fill: 'var(--ink)' });
    let i = 0;
    J.E.s1.forEach(([a, pa], ai) => {
      const y1 = y0 + ai * rowH * 3 + rowH * 0.9;
      s += K.line(x0, y0 + rowH * 2, x0 + 70, y1, {}) + K.circle(x0 + 70, y1, 4, { fill: 'var(--ink)' }) + K.text(x0 + 40, y1 - 6 + (ai ? 14 : -4), a + ' ' + Q.show(pa), { size: 10.5 });
      J.E.s2(a).forEach(([b, pb], bi) => {
        const idx = i++, y2 = y1 + (bi ? 22 : -22), on = J.S.includes(idx), p2 = J.paths[idx].p, dead = Q.cmp(p2, Q(0)) === 0;
        s += K.line(x0 + 70, y1, x0 + 150, y2, { stroke: dead ? 'var(--dim)' : 'var(--ink)', w: dead ? 0.8 : 1.5 });
        s += K.rect(x0 + 150, y2 - 11, 120, 22, { fill: on ? 'var(--accent)' : 'var(--sel-bg)', r: 5 }) + K.text(x0 + 210, y2 + 4, a + b + '：' + Q.show(Q.mul(pa, pb)), { size: 11, weight: on ? 700 : 400, fill: on ? '#fff' : 'var(--ink)' });
        H.push('<rect x="' + (x0 + 150) + '" y="' + (y2 - 11) + '" width="120" height="22" fill="transparent" data-pick-k="tg" data-pick-v="' + (idx + 1) + '" style="cursor:pointer"/>');
      });
    });
    let y = y0 + n1 * rowH * 3 + 8;
    if (p.view !== 0 && p.exp !== 2) {   // 面积模型：横边第一步，竖边第二步
      const S = 80, bx = 290, by = 40; let cx = bx;
      J.E.s1.forEach(([a, pa], ai) => { let cy = by; const w = Q.num(pa) * S; J.E.s2(a).forEach(([b, pb], bi) => { const h = Q.num(pb) * S, idx = ai * J.E.s2(a).length + bi, on = J.S.includes(idx); s += K.rect(cx, cy, w, h, { fill: on ? 'var(--accent)' : '#dfe9f5', stroke: 'var(--ink)', w: 1, r: 0 }); cy += h; }); cx += w; });
      s += K.text(bx + S / 2, by + S + 14, '面积 = 概率', { size: 10.5, fill: 'var(--dim)' });
    }
    s += K.text(10, y, '所有路径加起来 = ' + Q.show(J.tot) + (Q.cmp(J.tot, Q(1)) === 0 ? ' ✓' : '　✗ 不是 1，哪里错了？'), { size: 11.5, anchor: 'start', weight: 700, fill: Q.cmp(J.tot, Q(1)) === 0 ? 'var(--good)' : 'var(--bad)' }); y += 18;
    s += K.text(10, y, c.masked ? '先猜：“' + J.ev[0] + '”的概率是多少？（填“我猜概率”）' : '点出属于事件的路径：选中 ' + J.S.length + ' 条，概率 = ' + Q.show(J.pr) + (J.eventOk ? '　✓ 选对了' : ''), { size: 11.5, anchor: 'start', weight: 700, fill: J.eventOk && !c.masked ? 'var(--good)' : 'var(--ink)' });
    return s + H.join('');
  }
  U.registerPack({
    id: 'ptree', version: 1, needs: [],
    types: {
      ptree: {
        workspaceRole: 'none', handles: true, compactPorts: true, essence: ['E11', 'E2', 'E1'], label: '树状图', prefix: '树', group: '统计与概率', grades: [5, 9], alias: ['树状图', '概率', '两步试验', '可能性', '放回', '不放回', '面积模型'],
        props: {
          exp: { type: 'choice', label: '试验', default: 0, choices: EXPS.map((e) => e.name) }, ev: { type: 'int', label: '事件（第几个，出题人设）', default: 0, min: 0, max: 2 }, view: { type: 'choice', label: '看', default: 2, choices: ['树', '面积', '都要'] },
          sel: { hidden: true, type: 'text', label: '选中的路径', default: '', write: false }, tg: { hidden: true, type: 'int', label: '点一条路径', default: 0, min: 0, max: 8 }, gans: { type: 'text', label: '我猜概率（如 1/2）', default: '' },
        },
        onSet,
        guess: { props: ['gans'], ports: ['p'], answered: (p) => ans(p.gans) !== null && String(p.gans).trim() !== '' },
        outputs: { p: { dim: null, kind: 'num', label: '选中的路径的概率' }, total: { dim: null, kind: 'num', label: '所有路径的概率之和（应为 1）' }, paths: { dim: null, kind: 'num', label: '路径数' }, eventOk: { dim: null, kind: 'num', label: '选对了事件的全部路径（1/0）' }, truth: { dim: null, kind: 'num', label: '事件的概率（答案）' }, guessed: { dim: null, kind: 'num', label: '先猜对了（1/0）' } },
        icon: () => K.line(10, 32, 32, 16, {}) + K.line(10, 32, 32, 48, {}) + K.line(32, 16, 54, 8, {}) + K.line(32, 16, 54, 24, {}) + K.line(32, 48, 54, 40, {}) + K.line(32, 48, 54, 56, {}),
        size: (c) => [380, 40 + expOf(c.props).s1.length * 78 + 56],
        compute: (c) => { const J = judge(c.props); c.say(J.eventOk ? 'ok' : 'info', '总概率 ' + Q.show(J.tot)); return { p: num(J.pr), total: num(J.tot), paths: num(J.paths.length), eventOk: num(J.eventOk), truth: num(J.truthP), guessed: num(J.guessed) }; },
        badge: (c) => (c.masked ? '？' : c.out.p ? U.showVal(c.out.p) : ''),
        draw,
      },
    },
  });
  U.PTree = { judge, EXPS, pathsOf };
})(typeof globalThis !== 'undefined' ? globalThis : window);
