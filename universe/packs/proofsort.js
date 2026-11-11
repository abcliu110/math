/* 器材包 proofsort：证明排序（docs/new-instruments.md 5.5）。把打乱的证明步骤卡排成一列，每一步选它的依据。
 *   上面是已知和要证的结论；下面是打乱的卡，其中 1–2 张是干扰卡（循环论证、举例当证明、逆命题）。点一张卡把它放到最后；点已放的卡把它拿回去。
 *   每一步系统都检查：它用到的步骤是不是已经出现在上面了（“这一步用到的『…』还没有出现”）；选依据时点它下面的小标签。
 *   排对、依据全对、没放干扰卡，记“解释清楚了”（explain，证据 ④）。
 * 和设计文档的差别（如实写）：没有几何图联动高亮；依据是“这一步用的是哪条规律”的单选，不是选“上面第几步”。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit, PL = U.ProofLib;
  const num = (n) => U.val('num', typeof n === 'number' ? Q(n) : n, { dim: null });
  const hash = (s) => { let h = 7; for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) >>> 0; return h; };
  const proofOf = (p) => { const L = PL.all(); return L[Math.max(0, Math.min(p.pid, L.length - 1))]; };
  // 卡片：步骤 + 干扰卡，按固定的顺序打乱（同一条证明永远一样）
  const cardsOf = (P) => P.steps.map((s) => Object.assign({ kind: 'step' }, s)).concat(P.distract.map((d) => Object.assign({ kind: 'dist', needs: [], rule: '' }, d))).sort((a, b) => hash(P.id + a.id) - hash(P.id + b.id));
  const ids = (s) => String(s || '').split(',').filter(Boolean);
  function onSet(p, k, v) {
    const P = proofOf(p), C = cardsOf(P);
    if (k === 'pid') return { order: '', rs: '', add: 0, del: 0, rr: 0 };
    if (k === 'add') { if (!(v > 0)) return { add: 0 }; const c = C[v - 1]; if (!c || ids(p.order).includes(c.id)) return { add: 0 }; return { add: 0, order: p.order ? p.order + ',' + c.id : c.id, rs: (p.rs || '') + '0' }; }
    if (k === 'del') { if (!(v > 0)) return { del: 0 }; const L = ids(p.order); L.splice(v - 1, 1); const r = (p.rs || '').split(''); r.splice(v - 1, 1); return { del: 0, order: L.join(','), rs: r.join('') }; }
    if (k === 'rr') { if (!(v > 0)) return { rr: 0 }; const pos = Math.floor(v / 10), r = v % 10, s = (p.rs || '').padEnd(ids(p.order).length, '0').split(''); if (pos >= s.length) return { rr: 0 }; s[pos] = String(r); return { rr: 0, rs: s.join('') }; }
    return null;
  }
  function judge(p) {
    const P = proofOf(p), L = ids(p.order), rs = (p.rs || '').padEnd(L.length, '0'), byId = {}; P.steps.concat(P.distract).forEach((s) => { byId[s.id] = s; });
    const placed = new Set(), notes = []; let ruleOk = 0, dist = 0, orderOk = true;
    L.forEach((id, i) => {
      const s = byId[id]; if (!s) return;
      if (id[0] === 'd') { dist++; notes.push(s.why); return; }
      const miss = s.needs.find((n) => !placed.has(n));
      if (miss) { orderOk = false; notes.push('第 ' + (i + 1) + ' 步用到的“' + byId[miss].text.slice(0, 14) + '”还没有出现'); }
      if (P.rules[Number(rs[i]) - 1] === s.rule) ruleOk++;
      placed.add(id);
    });
    const need = P.steps.length, all = placed.size === need;
    return { P, L, rs, notes, placed: placed.size, need, ruleOk, dist, orderOk, ok: all && orderOk && ruleOk === need && !dist ? 1 : 0, sorted: all && orderOk && !dist ? 1 : 0 };
  }
  const wrap = (t, n) => { const r = []; for (let i = 0; i < t.length; i += n) r.push(t.slice(i, i + n)); return r; };
  function draw(c) {
    const p = c.props, J = judge(p), P = J.P, W = c.w, H = [], per = Math.floor((W - 30) / 12.5); let s = '', y = 16;
    const hit = (x, yy, w, h, k, v) => H.push('<rect x="' + x + '" y="' + yy + '" width="' + w + '" height="' + h + '" rx="4" fill="transparent" data-pick-k="' + k + '" data-pick-v="' + v + '" style="cursor:pointer"/>');
    s += K.text(10, y, '已知：' + P.given.join('；'), { size: 11.5, anchor: 'start', weight: 700 }); y += 17;
    s += K.text(10, y, '求证：' + P.claim, { size: 11.5, anchor: 'start', weight: 700, fill: 'var(--accent)' }); y += 12;
    s += K.text(10, y + 6, '证明（点下面的卡放进来；点已放的卡拿回去）', { size: 10.5, anchor: 'start', fill: 'var(--dim)' }); y += 14;
    const byId = {}; P.steps.concat(P.distract).forEach((x) => { byId[x.id] = x; });
    J.L.forEach((id, i) => {
      const st = byId[id], lines = wrap(st.text, per - 4), h = lines.length * 15 + 26, rule = P.rules[Number(J.rs[i]) - 1];
      const bad = id[0] === 'd' || (st.needs || []).some((n) => !J.L.slice(0, i).includes(n));
      s += K.rect(10, y, W - 20, h, { fill: bad ? 'var(--bad)' : 'var(--sel-bg)', r: 6, opacity: 1 }) + K.text(18, y + 15, String(i + 1) + '.', { size: 11.5, anchor: 'start', weight: 700, fill: bad ? '#fff' : 'var(--ink)' });
      lines.forEach((ln, j) => { s += K.text(34, y + 15 + j * 15, ln, { size: 11.5, anchor: 'start', fill: bad ? '#fff' : 'var(--ink)' }); });
      hit(10, y, W - 20, lines.length * 15 + 6, 'del', i + 1);
      // 依据小标签
      let x = 18; const yy = y + lines.length * 15 + 8;
      P.rules.forEach((r, j) => { const wd = r.length * 9 + 10; if (x + wd > W - 14) return; const on = Number(J.rs[i]) === j + 1; s += K.rect(x, yy, wd, 14, { fill: on ? 'var(--accent)' : 'var(--card)', stroke: 'var(--dim)', w: 0.6, r: 7 }) + K.text(x + wd / 2, yy + 11, r, { size: 9, weight: on ? 700 : 400, fill: on ? '#fff' : 'var(--ink)' }); hit(x, yy, wd, 14, 'rr', i * 10 + j + 1); x += wd + 3; });
      y += h + 4;
    });
    y += 6; s += K.text(10, y, '待排的卡：', { size: 10.5, anchor: 'start', fill: 'var(--dim)' }); y += 6;
    cardsOf(P).forEach((cd, i) => {
      if (J.L.includes(cd.id)) return; const lines = wrap(cd.text, per - 2), h = lines.length * 15 + 8;
      s += K.rect(10, y, W - 20, h, { fill: 'var(--card)', stroke: 'var(--dim)', w: 1, r: 6 }); lines.forEach((ln, j) => { s += K.text(18, y + 14 + j * 15, ln, { size: 11.5, anchor: 'start' }); });
      hit(10, y, W - 20, h, 'add', i + 1); y += h + 4;
    });
    y += 8;
    s += K.text(10, y, J.ok ? '证明完整：顺序和依据都对（这是推理，不是举例）' : J.notes.length ? J.notes[0].slice(0, 36) : '已放 ' + J.placed + ' / ' + J.need + ' 步，依据对了 ' + J.ruleOk + ' 个', { size: 11.5, anchor: 'start', weight: 700, fill: J.ok ? 'var(--good)' : J.notes.length ? 'var(--bad)' : 'var(--dim)' });
    return s + H.join('');
  }
  U.registerPack({
    id: 'proofsort', version: 1, needs: [],
    types: {
      proofsort: {
        workspaceRole: 'none', handles: true, compactPorts: true, essence: ['E9'], label: '证明排序', prefix: '证', group: '关系', grades: [5, 9], alias: ['证明排序', '证明', '推理', '步骤', '依据', '排序'],
        props: {
          pid: { type: 'int', label: '证明编号（出题人设）', default: 0, min: 0, max: 20 }, order: { hidden: true, type: 'text', label: '已排的卡', default: '', write: false }, rs: { hidden: true, type: 'text', label: '各步的依据', default: '', write: false },
          add: { hidden: true, type: 'int', label: '放一张卡', default: 0, min: 0, max: 20 }, del: { hidden: true, type: 'int', label: '拿回一张卡', default: 0, min: 0, max: 20 }, rr: { hidden: true, type: 'int', label: '选依据', default: 0, min: 0, max: 99 },
        },
        onSet,
        outputs: { ok: { dim: null, kind: 'num', label: '证明完整（1/0）' }, placed: { dim: null, kind: 'num', label: '放了几步' }, steps: { dim: null, kind: 'num', label: '一共几步' }, sorted: { dim: null, kind: 'num', label: '顺序对了（1/0）' }, ruleOk: { dim: null, kind: 'num', label: '依据对了几个' }, dist: { dim: null, kind: 'num', label: '放了几张干扰卡' }, lv: { dim: null, kind: 'num', label: '证据等级' } },
        icon: () => K.rect(10, 10, 44, 10, { fill: 'var(--accent)', r: 3 }) + K.rect(10, 26, 44, 10, { fill: 'var(--sel-bg)', r: 3 }) + K.rect(10, 42, 44, 10, { fill: 'var(--sel-bg)', r: 3 }),
        size: (c) => [380, 322 + Math.min(300, c.props.order.length * 6)],
        compute: (c) => { const J = judge(c.props); c.say(J.ok ? 'ok' : J.notes.length ? 'info' : 'info', J.ok ? '证明完整' : J.notes[0] || '点卡片，一步一步排'); return { ok: num(J.ok), placed: num(J.placed), steps: num(J.need), sorted: num(J.sorted), ruleOk: num(J.ruleOk), dist: num(J.dist), lv: num(J.ok ? 4 : 0) }; },
        badge: (c) => (c.out.ok && Q.num(c.out.ok.data) ? '证明完整' : c.out.placed ? c.out.placed.data.n + ' / ' + c.out.steps.data.n : ''),
        draw,
      },
    },
  });
  U.Proofsort = { judge, cardsOf, proofOf };
})(typeof globalThis !== 'undefined' ? globalThis : window);
