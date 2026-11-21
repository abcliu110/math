/* 器材包 statebench：状态图（谜题的每一种局面是一个点，每一步是一条线）。
 * 左边玩谜题，右边一边玩一边长出“状态图”：走到过的局面亮起来，现在在哪里标出来，目标局面是绿圈，走不下去的（比如羊被狼吃了）是红点。
 * 点“看全部”，所有可能的局面都画出来，最少几步就是图上从起点到目标最短的那条路（标成蓝色）。
 * 四种谜题，用同一张图：
 *   倒水（puz 0）：两个没刻度的杯子 A、B 升，量出 t 升。
 *   过河（puz 1）：农夫带狼、羊、菜过河，船上只能带一样；农夫不在，狼会吃羊、羊会吃菜。
 *   汉诺塔（puz 2）：n 个盘子从左柱搬到右柱，大盘不能压小盘。
 *   取石子（puz 3）：n 颗石子，两人轮流拿 1 到 m 颗，拿到最后一颗的赢。你先拿，电脑跟着拿。
 *     “从 0 往回标”：0 颗时轮到谁谁就输了（必败），能一步拿到必败局面的是必胜……一颗一颗往回标，规律就出来了。
 * 这一版的边界（如实写）：状态最多画 64 个。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 760, GX0 = 330, GX1 = 744, GY0 = 56, GY1 = 352, CAP = 64;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? Math.round(+v) : lo));
  // ---------- 四种谜题 ----------
  function pour(p) {
    const A = clamp(p.pa, 2, 12), B = clamp(p.pb, 1, A - 1), t = clamp(p.pt, 1, A);
    const OP = [['fA', '装满甲'], ['fB', '装满乙'], ['eA', '倒空甲'], ['eB', '倒空乙'], ['AB', '甲倒进乙'], ['BA', '乙倒进甲']];
    const nx = ([a, b], id) => { if (id === 'fA') return [A, b]; if (id === 'fB') return [a, B]; if (id === 'eA') return [0, b]; if (id === 'eB') return [a, 0]; if (id === 'AB') { const m = Math.min(a, B - b); return [a - m, b + m]; } const m = Math.min(b, A - a); return [a + m, b - m]; };
    return { name: '只用 ' + A + ' 升和 ' + B + ' 升的杯子量出 ' + t + ' 升', start: [0, 0], key: (s) => s.join(','), label: (s) => s.join(','),
      acts: (s) => OP.map(([id, lab]) => { const n = nx(s, id); return { id, label: lab, next: n, ok: n[0] !== s[0] || n[1] !== s[1], why: '这样做杯子里的水不会变' }; }),
      goal: (s) => s[0] === t || s[1] === t, dead: () => false,
      show: (s) => { const H = 120, cup = (x, cap, v, nm) => { const h = H * cap / A, lv = h * v / cap; return K.rect(x, 200 - h, 60, h, { fill: '#fff', stroke: 'var(--ink)', r: 3, w: 2 }) + (v ? K.rect(x + 2, 200 - lv, 56, lv - 1, { fill: '#9fc3ea', stroke: 'none', r: 2, w: 0 }) : '') + K.text(x + 30, 218, nm + ' ' + v + ' / ' + cap, { size: 12, weight: 700 }); }; return cup(40, A, s[0], '甲') + cup(150, B, s[1], '乙'); } };
  }
  const ITEMS = ['农夫', '狼', '羊', '菜'];
  function river() {
    const eat = (s) => { const f = s[0]; return (s[1] === s[2] && s[1] !== f) || (s[2] === s[3] && s[2] !== f); };
    return { name: '农夫带狼、羊、菜过河：船上只能带一样', start: [0, 0, 0, 0], key: (s) => s.join(''), label: (s) => ITEMS.filter((_, i) => s[i]).map((x) => x[0]).join('') || '—',
      acts: (s) => [0, 1, 2, 3].map((i) => { const n = s.slice(); n[0] = 1 - s[0]; if (i) n[i] = 1 - s[i]; return { id: 'c' + i, label: i ? '带' + ITEMS[i] + '过河' : '自己过河', next: n, ok: !eat(s) && (i === 0 || s[i] === s[0]), why: eat(s) ? '已经出事了：退一步' : ITEMS[i] + '不在农夫这边' }; }),
      goal: (s) => s.every((x) => x === 1), dead: eat,
      show: (s) => { let h = K.rect(130, 60, 50, 160, { fill: '#cfe3f7', stroke: 'none', r: 0, w: 0 }) + K.text(60, 56, '这边', { size: 12, weight: 700 }) + K.text(250, 56, '对岸', { size: 12, weight: 700 });
        ITEMS.forEach((nm, i) => { const x = s[i] ? 250 : 60, y = 80 + i * 34; h += K.rect(x - 34, y, 68, 26, { fill: s[i] ? '#e6f6ea' : '#fff', stroke: 'var(--ink)', r: 6, w: 1.2 }) + K.text(x, y + 18, nm, { size: 13, weight: 700 }); });
        if (eat(s)) h += K.text(155, 240, s[1] === s[2] && s[1] !== s[0] ? '狼把羊吃了！' : '羊把菜吃了！', { size: 15, weight: 700, fill: 'var(--bad)' });
        return h; } };
  }
  function hanoi(p) {
    const n = clamp(p.pa, 2, 3), PEG = ['左', '中', '右'];
    const tops = (s) => [0, 1, 2].map((g) => { for (let d = 0; d < n; d++) if (s[d] === g) return d; return -1; });
    return { name: n + ' 个盘子从左柱搬到右柱，大盘不能压小盘', start: Array(n).fill(0), key: (s) => s.join(''), label: (s) => s.join(''),
      acts: (s) => { const t = tops(s), out = []; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (i !== j) { const d = t[i], ok = d >= 0 && (t[j] < 0 || t[j] > d), nx = s.slice(); if (d >= 0) nx[d] = j; out.push({ id: 'm' + i + j, label: PEG[i] + ' → ' + PEG[j], next: nx, ok, why: d < 0 ? PEG[i] + '柱上没有盘子' : '大盘不能压在小盘上' }); } return out; },
      goal: (s) => s.every((g) => g === 2), dead: () => false,
      show: (s) => { let h = ''; for (let g = 0; g < 3; g++) { const x = 60 + g * 95; h += K.line(x, 90, x, 200, { w: 3 }) + K.text(x, 220, PEG[g], { size: 12, weight: 700 }); let k = 0; for (let d = n - 1; d >= 0; d--) if (s[d] === g) { const w = 24 + d * 18; h += K.rect(x - w / 2, 184 - k * 18, w, 16, { fill: ['#f5c26b', '#9fc3ea', '#a8d5a2'][d], stroke: 'var(--ink)', r: 4, w: 1 }); k++; } } return h + K.line(20, 200, 300, 200, { w: 3 }); } };
  }
  function nim(p) {
    const n = clamp(p.pa, 3, 15), m = clamp(p.pb, 2, 4);
    return { name: n + ' 颗石子，两人轮流拿 1 到 ' + m + ' 颗，拿到最后一颗的赢', start: [n], key: (s) => String(s[0]), label: (s) => String(s[0]), nim: true, n, m,
      acts: (s) => Array.from({ length: m }, (_, i) => i + 1).map((k) => ({ id: 't' + k, label: '拿 ' + k + ' 颗', next: [s[0] - k], ok: s[0] >= k, why: '不够 ' + k + ' 颗' })),
      goal: (s) => s[0] === 0, dead: () => false,
      show: (s) => { let h = ''; for (let i = 0; i < s[0]; i++) h += K.circle(40 + (i % 8) * 32, 100 + Math.floor(i / 8) * 34, 12, { fill: '#c9b48a', stroke: 'var(--ink)', w: 1 }); return h + K.text(150, 200, '还剩 ' + s[0] + ' 颗', { size: 14, weight: 700 }); } };
  }
  const PUZ = [pour, river, hanoi, nim];
  // ---------- 状态图 ----------
  function space(P) {
    const map = new Map(), order = [], q = [P.start]; map.set(P.key(P.start), { s: P.start, d: 0, out: [] }); order.push(P.key(P.start));
    while (q.length && order.length < CAP) {
      const s = q.shift(), k = P.key(s), node = map.get(k); if (P.dead(s) || (!P.nim && P.goal(s))) continue;
      for (const a of P.acts(s)) { if (!a.ok) continue; const nk = P.key(a.next); node.out.push(nk); if (!map.has(nk) && order.length < CAP) { map.set(nk, { s: a.next, d: node.d + 1, out: [] }); order.push(nk); q.push(a.next); } }
    }
    const goals = order.filter((k) => P.goal(map.get(k).s)), best = goals.length ? Math.min(...goals.map((k) => map.get(k).d)) : -1;
    return { map, order, goals, best };
  }
  // 电脑拿石子：留下 (m + 1) 的倍数；做不到就拿 1 颗
  const compTake = (left, m) => { const r = left % (m + 1); return r ? r : 1; };
  function model(p) {
    const puz = clamp(p.puz, 0, 3), P = PUZ[puz](p), path = String(p.path || '').split(',').filter(Boolean);
    const states = [P.start], ids = [];
    for (const id of path) { const s = states[states.length - 1]; if (P.dead(s) || (P.goal(s))) break; const a = P.acts(s).find((x) => x.id === id && x.ok); if (!a) break; states.push(a.next); ids.push(id); }
    const cur = states[states.length - 1], sp = space(P);
    const seen = new Set(String(p.seen || '').split(';').filter((k) => sp.map.has(k))); states.forEach((s) => seen.add(P.key(s)));
    const reached = !P.nim && P.goal(cur), steps = ids.length;
    // 取石子：路径上第奇数步是你，第偶数步是电脑
    const won = P.nim && cur[0] === 0 && steps % 2 === 1, lost = P.nim && cur[0] === 0 && steps % 2 === 0 && steps > 0;
    const mark = clamp(p.mark, 0, P.nim ? P.n + 1 : 0);
    return { puz, P, ids, states, cur, sp, seen, reached, steps, won, lost, mark, reveal: !!p.reveal };
  }
  const btn = (x, y, w, label, patch, enabled, tip) => '<g' + (enabled ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' data-off="1"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 26, { fill: enabled ? '#fff' : '#f1f3f6', stroke: enabled ? 'var(--blue)' : '#b8c0cc', r: 7, w: 1.4 }) + K.text(x + w / 2, y + 17, label, { size: 12, weight: 700, fill: enabled ? 'var(--ink)' : '#5f6773' }) + '</g>';
  function draw(c) {
    const p = c.props, m = model(p), P = m.P; let s = '';
    s += K.text(20, 26, P.name, { size: 15, weight: 700, anchor: 'start' });
    s += P.show(m.cur);
    // 操作按钮
    const over = P.dead(m.cur) || m.reached || (P.nim && m.cur[0] === 0), acts = P.acts(m.cur), seenAdd = (k) => [...new Set([...m.seen, k])].join(';');
    acts.forEach((a, i) => {
      const x = 20 + (i % 3) * 100, y = 244 + Math.floor(i / 3) * 32, ok = a.ok && !over;
      let patch = { path: m.ids.concat([a.id]).join(','), seen: seenAdd(P.key(a.next)), msg: '' };
      if (P.nim && ok && a.next[0] > 0) { const k = compTake(a.next[0], P.m), after = [a.next[0] - k]; patch = { path: m.ids.concat([a.id, 't' + k]).join(','), seen: [...new Set([...m.seen, P.key(a.next), P.key(after)])].join(';'), msg: '电脑拿了 ' + k + ' 颗' }; }
      s += btn(x, y, 94, a.label, ok ? patch : { msg: over ? '已经结束了：退一步或者重来' : a.why }, true, a.label);
    });
    const yb = 244 + Math.ceil(acts.length / 3) * 32;
    s += btn(20, yb, 70, '退一步', { path: m.ids.slice(0, P.nim ? Math.max(0, m.ids.length - (m.ids.length % 2 ? 1 : 2)) : -1).join(','), msg: '' }, m.ids.length > 0, '退一步');
    s += btn(96, yb, 60, '重来', { path: '', msg: '' }, m.ids.length > 0, '重来');
    s += btn(162, yb, 80, m.reveal ? '收起' : '看全部', { reveal: !m.reveal }, true, m.reveal ? '只看走过的' : '看全部局面');
    if (P.nim) s += btn(248, yb, 70, '往回标', { mark: m.mark + 1 }, m.mark <= P.n, '从 0 往回标必胜必败');
    // 状态图
    const sp = m.sp, layers = {}; sp.order.forEach((k) => { const d = sp.map.get(k).d; (layers[d] = layers[d] || []).push(k); });
    const D = Math.max(...Object.keys(layers).map(Number)), pos = {};
    Object.keys(layers).forEach((d) => { const ks = layers[d]; ks.forEach((k, i) => { pos[k] = { x: GX0 + (D ? (GX1 - GX0) * d / D : 0), y: GY0 + (i + 0.5) * (GY1 - GY0) / ks.length }; }); });
    const show = (k) => m.reveal || m.seen.has(k);
    s += K.rect(GX0 - 14, GY0 - 22, GX1 - GX0 + 28, GY1 - GY0 + 44, { fill: '#fbfcfe', stroke: '#dfe4ee', r: 8, w: 1 });
    s += K.text(GX0 - 6, GY0 - 8, '状态图：走过 ' + m.seen.size + ' 种局面' + (m.reveal ? '，一共 ' + sp.order.length + ' 种' : ''), { size: 12, weight: 700, anchor: 'start' });
    // 最短的路（看全部以后）
    const bestPath = new Set();
    if (m.reveal && sp.goals.length) { let k = sp.goals.find((g) => sp.map.get(g).d === sp.best); while (k) { bestPath.add(k); const d = sp.map.get(k).d; if (!d) break; k = sp.order.find((x) => sp.map.get(x).d === d - 1 && sp.map.get(x).out.includes(k)); } }
    sp.order.forEach((k) => { if (!show(k)) return; sp.map.get(k).out.forEach((nk) => { if (!show(nk) || !pos[nk]) return; const on = bestPath.has(k) && bestPath.has(nk) && sp.map.get(nk).d === sp.map.get(k).d + 1; s += K.line(pos[k].x, pos[k].y, pos[nk].x, pos[nk].y, { stroke: on ? 'var(--blue)' : '#c5ccda', w: on ? 2.4 : 1 }); }); });
    const ck = P.key(m.cur);
    // 取石子的必胜必败：0 颗必败；能一步拿到必败的是必胜
    const lose = new Set(); if (P.nim) for (let v = 0; v < m.mark; v++) { let w = false; for (let k = 1; k <= P.m; k++) if (v - k >= 0 && lose.has(v - k)) w = true; if (!w) lose.add(v); }
    sp.order.forEach((k) => {
      if (!show(k)) return; const st = sp.map.get(k).s, g = P.goal(st), dd = P.dead(st), here = k === ck, vis = m.seen.has(k);
      let fill = vis ? '#d6ecff' : '#fff'; if (dd) fill = '#f8c9c4'; if (g && !P.nim) fill = '#bfe6c6';
      if (P.nim && st[0] < m.mark) fill = lose.has(st[0]) ? '#f8c9c4' : '#bfe6c6';
      s += K.circle(pos[k].x, pos[k].y, here ? 10 : 7, { fill, stroke: here ? 'var(--ink)' : g && !P.nim ? '#1f6a34' : '#8a94a8', w: here ? 2.6 : 1.2 });
      if (sp.order.length <= 20) s += K.text(pos[k].x, pos[k].y - 12, P.label(st), { size: 9, fill: '#3a4a63' });
    });
    // 结果
    let y = 404; const note = (t, col) => { s += '<g data-read="1">' + K.text(20, y, t, { size: 14, weight: 700, anchor: 'start', fill: col }) + '</g>'; };
    if (m.reached) note('到了！走了 ' + m.steps + ' 步' + (m.steps === sp.best ? '：最少就是 ' + sp.best + ' 步' : '；最少 ' + sp.best + ' 步就够（点“看全部”找最短的路）'), m.steps === sp.best ? 'var(--blue)' : 'var(--bad)');
    else if (P.dead(m.cur)) note('出事了：这个局面是红点，走不下去。退一步换个走法', 'var(--bad)');
    else if (m.won) note('你拿到了最后一颗：你赢了！', 'var(--blue)');
    else if (m.lost) note('电脑拿到了最后一颗。看看状态图：哪些局面留给对方，对方就输？', 'var(--bad)');
    if (P.nim && m.mark > 0) s += K.text(20, 428, '标了 ' + Math.min(m.mark, P.n + 1) + ' 个：必败（红）是 ' + [...lose].sort((a, b) => a - b).join('、'), { size: 12, anchor: 'start' });
    if (p.msg) s += K.text(20, P.nim && m.mark > 0 ? 450 : 428, p.msg, { size: 12, weight: 700, anchor: 'start', fill: p.msg.startsWith('电脑') ? '#3a4a63' : 'var(--bad)' });
    return s;
  }
  U.registerPack({
    id: 'statebench', version: 1,
    types: {
      statebench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E7', 'E6'],
        label: '状态图', prefix: '状态图', group: '关系', grades: [3, 9],
        alias: ['状态图', '最少几步', '最短路', '过河', '狼羊菜', '汉诺塔', '取石子', '必胜', '必败', '倒水', '谜题', '搜索'],
        props: {
          puz: { type: 'choice', label: '谜题', default: 0, choices: ['倒水', '过河', '汉诺塔', '取石子'], write: true },
          pa: { type: 'int', label: '参数 1（倒水：甲杯；汉诺塔：几个盘；取石子：几颗）', default: 5, min: 2, max: 15, write: true },
          pb: { type: 'int', label: '参数 2（倒水：乙杯；取石子：最多拿几颗）', default: 3, min: 1, max: 12, write: true },
          pt: { type: 'int', label: '倒水：量出几升', default: 4, min: 1, max: 12, write: true },
          path: { type: 'text', label: '走过的步（自动）', default: '', write: true }, seen: { type: 'text', label: '见过的局面（自动）', default: '', write: true },
          reveal: { type: 'bool', label: '画出全部局面', default: false, write: true }, mark: { type: 'int', label: '取石子：往回标了几个（自动）', default: 0, min: 0, max: 16, write: true },
          msg: { type: 'text', label: '提示（自动）', default: '', write: true, hidden: true },
        },
        outputs: {
          steps: { dim: null, kind: 'num', label: '走了几步' }, seen: { dim: null, kind: 'num', label: '见过几种局面' }, total: { dim: null, kind: 'num', label: '一共几种局面（看全部以后才有）' },
          reached: { dim: null, kind: 'num', label: '到目标了 1（到了才有）' }, fewest: { dim: null, kind: 'num', label: '用最少的步数到了 1（做到才有）' }, best: { dim: null, kind: 'num', label: '最少几步（到了或看全部以后才有）' },
          dead: { dim: null, kind: 'num', label: '走进死路了 1（出事才有）' }, won: { dim: null, kind: 'num', label: '取石子：你赢了 1（赢了才有）' }, marked: { dim: null, kind: 'num', label: '取石子：往回标了几个' },
        },
        icon: () => K.line(10, 30, 26, 14, { w: 1.4 }) + K.line(10, 30, 26, 46, { w: 1.4 }) + K.line(26, 14, 46, 22, { w: 1.4 }) + K.line(26, 46, 46, 38, { w: 1.4 }) + K.circle(10, 30, 5, { fill: '#d6ecff', stroke: 'var(--ink)', w: 1.2 }) + K.circle(26, 14, 4, { fill: '#fff', stroke: 'var(--ink)', w: 1 }) + K.circle(26, 46, 4, { fill: '#fff', stroke: 'var(--ink)', w: 1 }) + K.circle(46, 22, 4, { fill: '#bfe6c6', stroke: 'var(--ink)', w: 1 }) + K.circle(46, 38, 4, { fill: '#fff', stroke: 'var(--ink)', w: 1 }),
        size: () => [W, 470],
        grips: () => [],
        compute: (c) => {
          const m = model(c.props), o = { steps: num(m.steps), seen: num(m.seen.size), marked: num(m.mark) };
          if (m.reveal) o.total = num(m.sp.order.length);
          if (m.reached) { o.reached = num(1); if (m.steps === m.sp.best) o.fewest = num(1); }
          if (m.reached || m.reveal) o.best = num(m.sp.best);
          if (m.P.dead(m.cur)) o.dead = num(1);
          if (m.won) o.won = num(1);
          return o;
        },
        badge: () => '',
        draw,
      },
    },
  });
  U.StateBench = { model, space, PUZ, compTake };
})(typeof globalThis !== 'undefined' ? globalThis : window);
