/* 器材包 relbench：关系图（应用题建模和解题思路）。
 * 题目里的每个量是一个方框（知道的写着数，不知道的写 ?，要问的那个是双框）。量和量之间的关系是一个小圆圈（+ − × ÷），连着三个方框：
 * “一共 = 苹果 + 梨”就是一个 + 圈连着三个框。
 *   - 建模：右边有几张关系卡，有对的也有不对的。点一张：对的就连到图上；不对的会用真实的数说明为什么不对（比如 16 ÷ 3 不是一份）。
 *   - 解题：点图上的一个关系圈。三个量里只差一个不知道，就算出来（会自己倒过来：知道和与一个加数，就用减法）；
 *     差两个以上，就把缺的量标成橙色虚线框：“还缺它们”——这就是从问题往回想（分析法）。从知道的往下算，就是综合法。
 *   - 右下角一步一步记下算式，算出要问的那个就完成了。
 * 量的写法：qs = "名字|知道 1 不知道 0|真实的数;…"；关系写法："0=1+2" 表示 第 0 个 = 第 1 个 + 第 2 个（+ − * /）。
 * rels 是对的关系，cand 是摆在右边的关系卡（空着就是关系已经连好，只做解题）。
 * 这一版的边界（如实写）：最多 8 个量、6 个关系；数是整数或者有限小数。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q.fromNumber ? Q.fromNumber(n) : Q(n), { dim: null });
  const W = 740, GX = 470;
  const OPS = { '+': (b, c) => b + c, '-': (b, c) => b - c, '*': (b, c) => b * c, '/': (b, c) => b / c };
  const SYM = { '+': '+', '-': '−', '*': '×', '/': '÷' };
  const near = (x, y) => Math.abs(x - y) < 1e-9;
  const fmt = (v) => (Number.isInteger(v) ? String(v) : String(Math.round(v * 1000) / 1000));
  const parseRel = (s) => { const m = /^(\d+)=(\d+)([-+*/])(\d+)$/.exec(String(s).trim()); return m ? { a: +m[1], b: +m[2], op: m[3], c: +m[4], key: m[1] + '=' + m[2] + m[3] + m[4] } : null; };
  // 已知三个里的两个，求第三个（倒过来的时候换成逆运算）
  function solveFor(r, which, v) {
    const A = v[r.a], B = v[r.b], C = v[r.c];
    if (which === r.a) return { val: OPS[r.op](B, C), how: [r.b, r.op, r.c] };
    if (r.op === '+') return which === r.b ? { val: A - C, how: [r.a, '-', r.c] } : { val: A - B, how: [r.a, '-', r.b] };
    if (r.op === '-') return which === r.b ? { val: A + C, how: [r.a, '+', r.c] } : { val: B - A, how: [r.b, '-', r.a] };
    if (r.op === '*') return which === r.b ? { val: A / C, how: [r.a, '/', r.c] } : { val: A / B, how: [r.a, '/', r.b] };
    return which === r.b ? { val: A * C, how: [r.a, '*', r.c] } : { val: B / A, how: [r.b, '/', r.a] };
  }
  function model(p) {
    const qs = String(p.qs || '').split(';').filter(Boolean).slice(0, 8).map((t) => { const [name, kn, val] = t.split('|'); return { name: name || '?', known: kn === '1', val: +val }; });
    const n = qs.length, ok = (r) => r && r.a < n && r.b < n && r.c < n;
    const truth = String(p.rels || '').split(';').map(parseRel).filter(ok).slice(0, 6);
    const cand = String(p.cand || '').split(';').map(parseRel).filter(ok).slice(0, 7);
    // 关系卡：用真实的数一验，成立的就是对的关系（不一定是出题人想的那几张）
    const holds = (r) => near(qs[r.a].val, OPS[r.op](qs[r.b].val, qs[r.c].val));
    const chosenIdx = [...new Set(String(p.chosen || '').split(',').filter((x) => x !== '').map(Number))].filter((i) => i >= 0 && i < cand.length && holds(cand[i]));
    const rels = cand.length ? chosenIdx.map((i) => cand[i]) : truth;
    const ask = Math.max(0, Math.min(n - 1, +p.ask || 0));
    // 连好了：用连上的关系，从知道的量一步一步推，能推到要问的量
    const reach = qs.map((q) => q.known); for (let moved = true; moved;) { moved = false; for (const r of rels) { const miss = [r.a, r.b, r.c].filter((i) => !reach[i]); if (miss.length === 1) { reach[miss[0]] = true; moved = true; } } }
    const modeled = !cand.length || reach[ask];
    // 一步一步算出来的量：got = "量@关系,…"（关系按 rels 里的 key）
    const v = qs.map((q) => (q.known ? q.val : null)), steps = [];
    for (const t of String(p.got || '').split(',').filter(Boolean)) {
      const [qi, key] = t.split('@'), q = +qi, r = rels.find((x) => x.key === key);
      if (!r || v[q] !== null || ![r.a, r.b, r.c].includes(q)) continue;
      const others = [r.a, r.b, r.c].filter((x) => x !== q); if (others.some((x) => v[x] === null)) continue;
      const s = solveFor(r, q, v); v[q] = s.val; steps.push({ q, r, how: s.how, val: s.val });
    }
    const need = String(p.need || '').split(',').filter((x) => x !== '').map(Number).filter((i) => i < n && v[i] === null);
    // 布局：按“最早能算出来的轮次”分层
    const depth = qs.map((q) => (q.known ? 0 : null)); let changed = true;
    for (let round = 1; changed && round < 8; round++) { changed = false; const cur = depth.slice(); for (const r of truth) { const ids = [r.a, r.b, r.c], miss = ids.filter((x) => cur[x] === null); if (miss.length === 1) { depth[miss[0]] = round; changed = true; } } }
    depth.forEach((d, i) => { if (d === null) depth[i] = 4; });
    return { qs, n, truth, cand, chosenIdx, rels, modeled, ask, v, steps, need, depth, solved: v[ask] !== null, wrong: +p.wrong || 0 };
  }
  function layout(m) {
    const rows = {}; m.depth.forEach((d, i) => { (rows[d] = rows[d] || []).push(i); });
    const ds = Object.keys(rows).map(Number).sort((a, b) => a - b), pos = [];
    ds.forEach((d, ri) => { const ids = rows[d]; ids.forEach((i, k) => { pos[i] = { x: 30 + (k + 0.5) * (GX - 60) / ids.length, y: 70 + ri * Math.min(110, 250 / Math.max(1, ds.length - 1)) }; }); });
    return pos;
  }
  const relText = (m, r) => m.qs[r.a].name + ' = ' + m.qs[r.b].name + ' ' + SYM[r.op] + ' ' + m.qs[r.c].name;
  function draw(c) {
    const p = c.props, m = model(p), pos = layout(m); let s = '';
    const pick = (patch) => encodeURIComponent(JSON.stringify(patch));
    s += K.text(20, 26, m.modeled ? '点关系圈：三个量里只差一个，就能算出来' : '先把题目里的关系连上：点右边对的关系卡', { size: 15, weight: 700, anchor: 'start' });
    // 关系圈和连线
    m.rels.forEach((r, ri) => {
      const ids = [r.a, r.b, r.c], low = ids.reduce((b, i) => (pos[i].y > pos[b].y ? i : b), ids[0]), rest = ids.filter((i) => i !== low);
      let cx = ids.reduce((t, i) => t + pos[i].x, 0) / 3; const cy = (pos[low].y + rest.reduce((t, i) => t + pos[i].y, 0) / 2) / 2 + 4;
      const hit = (x) => m.qs.some((q, i) => Math.abs(pos[i].x - x) < Math.max(70, q.name.length * 14 + 16) / 2 + 16 && Math.abs(pos[i].y - cy) < 38);
      for (const dx of [0, 60, -60, 110, -110, 160]) if (!hit(cx + dx) && cx + dx > 20 && cx + dx < GX - 10) { cx += dx; break; }   // 不要压在方框上
      ids.forEach((i) => { s += K.line(cx, cy, pos[i].x, pos[i].y, { stroke: '#8a94a8', w: 1.4 }); });
      const miss = ids.filter((i) => m.v[i] === null);
      const patch = miss.length === 1 ? { got: String(p.got || '').split(',').filter(Boolean).concat([miss[0] + '@' + r.key]).join(','), msg: '' }
        : miss.length === 0 ? { msg: '这三个量都知道了' } : { need: [...new Set(m.need.concat(miss))].join(','), msg: '还缺 ' + miss.map((i) => m.qs[i].name).join('、') + '：先想办法求它们' };
      const ready = miss.length === 1;
      s += '<g data-pick-set="' + pick(patch) + '" style="cursor:pointer"><title>关系 ' + K.esc(relText(m, r)) + '</title>' + K.circle(cx, cy, 15, { fill: ready ? '#d6ecff' : miss.length ? '#fff' : '#eef1f6', stroke: ready ? 'var(--blue)' : '#8a94a8', w: ready ? 2.2 : 1.4 }) + K.text(cx, cy + 6, SYM[r.op], { size: 17, weight: 700 }) + '</g>';
    });
    // 量的方框
    m.qs.forEach((q, i) => {
      const { x, y } = pos[i], v = m.v[i], isAsk = i === m.ask, nd = m.need.includes(i), w = Math.max(70, q.name.length * 14 + 16);
      s += K.rect(x - w / 2, y - 22, w, 44, { fill: v === null ? (nd ? '#fff4e0' : '#fff') : q.known ? '#eef4fb' : '#e6f6ea', stroke: nd ? '#c07000' : isAsk ? 'var(--ink)' : '#5a6478', r: 6, w: isAsk ? 2.6 : 1.4, dash: nd ? '5 3' : undefined });
      if (isAsk) s += K.rect(x - w / 2 - 4, y - 26, w + 8, 52, { fill: 'none', stroke: 'var(--ink)', r: 8, w: 1 });
      s += K.text(x, y - 5, q.name, { size: 12, weight: 700 }) + K.text(x, y + 14, v === null ? '?' : fmt(v), { size: 14, weight: 700, fill: v === null ? '#8a94a8' : q.known ? 'var(--ink)' : 'var(--blue)' });
    });
    // 右边：关系卡
    let y = 50;
    if (m.cand.length) {
      s += K.text(GX + 10, y, '关系卡（点对的连上）', { size: 13, weight: 700, anchor: 'start' }); y += 10;
      m.cand.forEach((r, i) => {
        const on = m.chosenIdx.includes(i), tv = m.qs.map((q) => q.val), lhs = tv[r.a], rhs = OPS[r.op](tv[r.b], tv[r.c]), right = near(lhs, rhs);
        const patch = on ? { msg: '已经连上了' } : right ? { chosen: m.chosenIdx.concat([i]).join(','), msg: '' } : { wrong: m.wrong + 1, msg: '不对：' + m.qs[r.b].name + ' ' + SYM[r.op] + ' ' + m.qs[r.c].name + ' = ' + fmt(tv[r.b]) + ' ' + SYM[r.op] + ' ' + fmt(tv[r.c]) + ' = ' + fmt(rhs) + '，不是' + m.qs[r.a].name + '（' + fmt(lhs) + '）' };
        s += '<g data-pick-set="' + pick(patch) + '" style="cursor:pointer"><title>关系卡 ' + (i + 1) + '</title>' + K.rect(GX + 10, y, 250, 30, { fill: on ? '#e6f6ea' : '#fff', stroke: on ? '#1f6a34' : 'var(--blue)', r: 6, w: 1.4 }) + K.text(GX + 20, y + 20, relText(m, r) + (on ? '  ✓' : ''), { size: 12, weight: 700, anchor: 'start' }) + '</g>';
        y += 36;
      });
    }
    // 右下：算式
    y += 10; s += K.text(GX + 10, y, '算式', { size: 13, weight: 700, anchor: 'start' });
    m.steps.slice(-6).forEach((st) => { y += 20; s += K.text(GX + 10, y, m.qs[st.q].name + ' = ' + fmt(m.v[st.how[0]]) + ' ' + SYM[st.how[1]] + ' ' + fmt(m.v[st.how[2]]) + ' = ' + fmt(st.val), { size: 12, anchor: 'start' }); });
    if (!m.steps.length) { y += 20; s += K.text(GX + 10, y, '还没有算', { size: 12, anchor: 'start', fill: '#5a6478' }); }
    if (m.solved) s += '<g data-read="1">' + K.text(20, 380, '算出来了：' + m.qs[m.ask].name + ' = ' + fmt(m.v[m.ask]) + '（' + m.steps.length + ' 步）', { size: 15, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
    if (p.msg) s += K.text(20, m.solved ? 356 : 380, p.msg, { size: 13, weight: 700, anchor: 'start', fill: 'var(--bad)' });
    s += '<g data-pick-set="' + pick({ got: '', need: '', msg: '' }) + '" style="cursor:pointer"><title>重新算</title>' + K.rect(GX + 180, 352, 80, 26, { fill: '#fff', stroke: 'var(--blue)', r: 7, w: 1.4 }) + K.text(GX + 220, 369, '重新算', { size: 12, weight: 700 }) + '</g>';
    return s;
  }
  U.registerPack({
    id: 'relbench', version: 1,
    types: {
      relbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E4', 'E2'],
        label: '关系图', prefix: '关系图', group: '关系', grades: [3, 9],
        alias: ['关系图', '数量关系', '应用题', '分析法', '综合法', '解题思路', '建模', '已知', '未知'],
        props: {
          qs: { type: 'text', label: '量（名字|知道 1|数;…）', default: '苹果|0|12;梨|0|4;一共|1|16;倍数|1|3;一共几份|0|4;一份|0|4;梨的份数|1|1', write: true },
          rels: { type: 'text', label: '对的关系（0=1+2;…）', default: '4=3+6;5=2/4;1=5*6;0=1*3', write: true },
          cand: { type: 'text', label: '关系卡（空着就是已经连好）', default: '', write: true },
          ask: { type: 'int', label: '问的是第几个量（从 0 数）', default: 0, min: 0, max: 7, write: true },
          chosen: { type: 'text', label: '连上的关系卡（自动）', default: '', write: true }, got: { type: 'text', label: '算出来的（自动）', default: '', write: true },
          need: { type: 'text', label: '标成“还缺”的（自动）', default: '', write: true }, wrong: { type: 'int', label: '点错的关系卡（自动）', default: 0, min: 0, max: 99, write: true },
          msg: { type: 'text', label: '提示（自动）', default: '', write: true, hidden: true },
        },
        outputs: {
          modeled: { dim: null, kind: 'num', label: '关系都连对了 1（连好才有）' }, steps: { dim: null, kind: 'num', label: '算了几步' },
          ans: { dim: null, kind: 'num', label: '要问的量（算出来才有）' }, need: { dim: null, kind: 'num', label: '标成“还缺”的量有几个' }, wrong: { dim: null, kind: 'num', label: '点错几张关系卡' },
        },
        icon: () => K.rect(4, 6, 20, 12, { fill: '#eef4fb', stroke: 'var(--ink)', r: 2, w: 1 }) + K.rect(32, 6, 20, 12, { fill: '#eef4fb', stroke: 'var(--ink)', r: 2, w: 1 }) + K.rect(18, 38, 20, 12, { fill: '#fff', stroke: 'var(--ink)', r: 2, w: 1.4 }) + K.line(14, 18, 28, 28, { w: 1 }) + K.line(42, 18, 28, 28, { w: 1 }) + K.line(28, 28, 28, 38, { w: 1 }) + K.circle(28, 28, 5, { fill: '#d6ecff', stroke: 'var(--ink)', w: 1 }),
        size: () => [W, 430],
        grips: () => [],
        compute: (c) => { const m = model(c.props), o = { steps: num(m.steps.length), need: num(m.need.length), wrong: num(m.wrong) }; if (m.cand.length && m.modeled) o.modeled = num(1); if (m.solved && m.modeled) o.ans = num(m.v[m.ask]); return o; },
        badge: () => '',
        draw,
      },
    },
  });
  U.RelBench = { model, solveFor, parseRel };
})(typeof globalThis !== 'undefined' ? globalThis : window);
