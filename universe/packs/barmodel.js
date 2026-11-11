/* 器材包 barmodel：线段图（docs/new-instruments.md 6.3）。把应用题画成两条线段 A、B：每条 = 若干个“一份”（等长）+ 一个额外的数。
 *   题面给出一个已知条件（和 / 差 / A 是几 / B 是几），问 A、B 或“一份”是多少。学生调整每条线段有几份、额外多几少几，
 *   图自动转成方程（等长的段是同一个未知数 u），解出来；先猜答案再看。
 *   不直接说“画错了”：把按学生的图算出来的结果放回题面——“按你的图，哥哥 12 岁，弟弟 60 岁”，让学生自己发现不对。
 * 和设计文档的差别（如实写）：这一版是一台普通器材（两条线段、整数份），不是新工作台；也没有双数轴模式。
 * 标准画法（truth）是出题人设的“份数,份数,额外,额外”，判分按“学生的图算出的答案 = 标准答案”，不要求画得和参考解一样。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit, E = U.Eqn, P = U.Poly;
  const num = (n) => U.val('num', typeof n === 'number' ? Q(n) : n, { dim: null });
  const GK = ['和（A+B）', '差（B−A）', 'A 是', 'B 是'], ASK = ['A', 'B', '每份'];
  const rat = (t) => { try { const q = Q.parse(String(t)); return q || null; } catch (e) { return null; } };
  const parseTruth = (t) => { const a = String(t || '').split(',').map((x) => Number(x)); return a.length === 4 && a.every(Number.isFinite) ? a : null; };

  // 系数：k·u + c = g。无解（k = 0）返回 null
  function model(sa, sb, ea, eb, gk, g) {
    const k = gk === 0 ? sa + sb : gk === 1 ? sb - sa : gk === 2 ? sa : sb;
    const c = gk === 0 ? ea + eb : gk === 1 ? eb - ea : gk === 2 ? ea : eb;
    const lhs = P.add(P.mul(P.const(Q(k)), P.variable('u')), P.const(Q(c)));
    const eqn = E.make(lhs, P.const(g), '=');
    if (k === 0) return { eqn, k, c, u: null };
    const u = Q.div(Q.sub(g, Q(c)), Q(k));
    return { eqn, k, c, u, A: Q.add(Q.mul(Q(sa), u), Q(ea)), B: Q.add(Q.mul(Q(sb), u), Q(eb)) };
  }
  const pick = (m, ask) => (!m || m.u === null ? null : ask === 0 ? m.A : ask === 1 ? m.B : m.u);
  function judge(p) {
    const g = rat(p.gv) || Q(0), m = model(p.sa, p.sb, p.ea, p.eb, p.gk, g), t = parseTruth(p.truth);
    const mine = pick(m, p.tq), std = t ? pick(model(t[0], t[1], t[2], t[3], p.gk, g), p.tq) : null;
    const ok = mine && std && Q.cmp(mine, std) === 0 ? 1 : 0;
    return { m, mine, std, ok, g };
  }

  const btn = (H, s, x, y, tx, k, v) => { s.push(K.rect(x, y, 20, 18, { fill: 'var(--sel-bg)', r: 4 }) + K.text(x + 10, y + 13, tx, { size: 13, weight: 700 })); H.push('<rect x="' + x + '" y="' + y + '" width="20" height="18" fill="transparent" data-pick-k="' + k + '" data-pick-v="' + v + '" style="cursor:pointer"/>'); };
  function draw(c) {
    const p = c.props, J = judge(p), W = c.w, H = [], S = []; let s = '';
    const story = String(p.story || ''), per = Math.max(12, Math.floor((W - 20) / 13)), lines = [];
    for (let i = 0; i < story.length && lines.length < 3; i += per) lines.push(story.slice(i, i + per));
    lines.forEach((ln, i) => { s += K.text(10, 18 + i * 17, ln, { size: 12.5, weight: 700, anchor: 'start' }); });
    let y = 18 + lines.length * 17 + 8;
    const uw = Math.max(14, Math.min(34, Math.floor((W - 90) / (Math.max(p.sa, p.sb, 1) + 1.5))));
    [['A', p.sa, p.ea, 'sa', 'ea', 'var(--accent)'], ['B', p.sb, p.eb, 'sb', 'eb', 'var(--good)']].forEach(([nm, n, ex, ks, ke, col]) => {
      s += K.text(10, y + 17, nm, { size: 13, weight: 700, anchor: 'start' });
      for (let i = 0; i < n; i++) s += K.rect(28 + i * uw, y, uw - 2, 24, { fill: col, r: 3 });
      if (ex) s += K.rect(28 + n * uw, y, Math.min(60, Math.abs(ex) * 6 + 10), 24, { fill: 'none', stroke: ex > 0 ? 'var(--bad)' : 'var(--dim)', w: 2, r: 3 }) + K.text(28 + n * uw + 4, y + 16, (ex > 0 ? '+' : '') + ex, { size: 11, anchor: 'start', weight: 700 });
      y += 30;
      s += K.text(10, y + 12, '份数', { size: 10.5, anchor: 'start', fill: 'var(--dim)' }); btn(H, S, 46, y, '−', ks, Math.max(0, n - 1)); s += K.text(76, y + 13, String(n), { size: 12, weight: 700 }); btn(H, S, 88, y, '+', ks, Math.min(9, n + 1));
      s += K.text(130, y + 12, '额外', { size: 10.5, anchor: 'start', fill: 'var(--dim)' }); btn(H, S, 166, y, '−', ke, ex - 1); s += K.text(204, y + 13, (ex > 0 ? '+' : '') + ex, { size: 12, weight: 700 }); btn(H, S, 224, y, '+', ke, ex + 1);
      y += 26;
    });
    s += S.join('');
    s += K.text(10, y + 6, '已知：' + GK[p.gk] + ' = ' + (p.gv || '?') + '　求：' + ASK[p.tq], { size: 11.5, anchor: 'start', weight: 700 });
    y += 22;
    const m = J.m;
    s += K.text(10, y, m.k === 0 ? '这张图里“一份”消掉了，解不出来' : '方程：' + P.show(m.eqn.lhs) + ' = ' + Q.show(J.g), { size: 11.5, anchor: 'start', fill: 'var(--dim)' }); y += 18;
    if (m.u !== null && !c.masked) s += K.text(10, y, '按你的图：A = ' + Q.show(m.A) + '，B = ' + Q.show(m.B) + '，每份 ' + Q.show(m.u), { size: 12, anchor: 'start', weight: 700, fill: J.ok ? 'var(--good)' : 'var(--ink)' });
    else if (m.u !== null) s += K.text(10, y, '先猜：答案大概是多少？（填在“我猜”里）', { size: 12, anchor: 'start', weight: 700, fill: 'var(--accent)' });
    return s + H.join('');
  }
  const answered = (p) => rat(p.gans) !== null;

  U.registerPack({
    id: 'barmodel', version: 1, needs: [],
    types: {
      barmodel: {
        workspaceRole: 'none', handles: true, compactPorts: true, essence: ['E12', 'E3'],
        label: '线段图', prefix: '线', group: '数与运算', grades: [1, 7], alias: ['线段图', '应用题', '和倍', '差倍', '倍数', '画图'],
        props: {
          story: { type: 'text', label: '题面', default: '' },
          gk: { type: 'choice', label: '已知（出题人设）', default: 0, choices: GK },
          gv: { type: 'text', label: '已知的数（出题人设）', default: '10' },
          tq: { type: 'choice', label: '求（出题人设）', default: 0, choices: ASK },
          truth: { type: 'text', label: '标准画法 份A,份B,额外A,额外B（出题人设）', default: '1,1,0,0' },
          sa: { hidden: true, type: 'int', label: 'A 几份', default: 1, min: 0, max: 9 }, sb: { hidden: true, type: 'int', label: 'B 几份', default: 1, min: 0, max: 9 },
          ea: { hidden: true, type: 'int', label: 'A 额外', default: 0, min: -99, max: 99 }, eb: { hidden: true, type: 'int', label: 'B 额外', default: 0, min: -99, max: 99 },
          gans: { type: 'text', label: '我猜答案', default: '' },
        },
        guess: { props: ['gans'], ports: ['answer', 'a', 'b'], answered },
        outputs: {
          model: { dim: null, kind: 'eqn', label: '方程（图的等量关系）' }, answer: { dim: null, kind: 'num', label: '答案（按你的图）' },
          a: { dim: null, kind: 'num', label: 'A（按你的图）' }, b: { dim: null, kind: 'num', label: 'B（按你的图）' }, ok: { dim: null, kind: 'num', label: '图对了（1/0）' },
        },
        icon: () => K.rect(8, 12, 48, 12, { fill: 'var(--accent)', r: 3 }) + K.rect(8, 30, 30, 12, { fill: 'var(--good)', r: 3 }),
        size: (c) => [380, 215 + Math.ceil(String(c.props.story || '').length / 26) * 17],
        compute: (c) => {
          const J = judge(c.props), m = J.m, out = { model: U.val('eqn', m.eqn), ok: num(J.ok) };
          if (m.u === null) { c.say('info', '这张图里“一份”消掉了，解不出来'); return out; }
          out.a = num(m.A); out.b = num(m.B); out.answer = num(J.mine);
          c.say(J.ok ? 'ok' : 'info', '按你的图：A = ' + Q.show(m.A) + '，B = ' + Q.show(m.B));
          return out;
        },
        badge: (c) => (c.out.ok && Q.num(c.out.ok.data) ? '图对了' : ''),
        draw,
      },
    },
  });
  U.BarModel = { model, judge };
})(typeof globalThis !== 'undefined' ? globalThis : window);
