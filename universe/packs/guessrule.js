/* 器材包 guessrule：猜规则台（docs/new-instruments.md 4.1）。系统藏着一条规则（来自规则库）；学生挑例子去问“这个算不算”——
 * 先猜再看（猜错不扣分，只记 guess 事件），例子分进“算 / 不算”；觉得知道了就挑一条猜想，系统在整个例子空间里找能区分的例子：
 * 找到就摆出来（“你的规则说它算，可它不算”），找不到才算猜对。互换：学生挑一条规则，系统用“每次排除一半候选”的办法猜，学生回答算 / 不算，答错了指出矛盾。
 * 例子空间：数域 1–60；三角形域是固定的 24 个格点三角形。数域穷举完 → 证据 ③，三角形域 → ②。
 * 所有操作都是“设属性”（卡片上的可点区域 data-pick-k / data-pick-v）；提交例子、回答这类“一次点击改几处”由 onSet 完成。
 * 日志写在属性里：tried = “例子号 + 系统答案(+/−) + 我猜的(+/−)”，逗号分隔；slog = 系统问的例子和学生的回答。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit, RL = U.RuleLib;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const ALL = RL.rules(), N = ALL.length;
  const secretOf = (p) => ALL[Math.max(0, Math.min(p.secret, N - 1))];
  const domOf = (r) => ALL.filter((x) => x.domain === r.domain);
  const spaceN = (r) => (r.domain === 'tri' ? RL.triPool.length : 60);
  const exVal = (r, i) => (r.domain === 'tri' ? RL.triPool[i - 1] : i);
  const parseTok = (t) => { const m = /^(\d+)([+-])([+-])?$/.exec(t); return m ? { i: Number(m[1]), a: m[2] === '+', g: m[3] === undefined ? null : m[3] === '+' } : null; };
  const toks = (s) => String(s || '').split(',').filter(Boolean).map(parseTok).filter(Boolean);
  const tokStr = (i, a, g) => i + (a ? '+' : '-') + (g === undefined ? '' : g ? '+' : '-');
  const push = (s, t) => (s ? s + ',' + t : t);

  // 重放：逐个例子看当时“有信息量”吗（候选规则里两种答案都有），再按答案筛掉候选
  function replay(r, tokens) {
    let cands = domOf(r), info = 0, negs = 0, right = 0;
    for (const t of tokens) {
      const x = exVal(r, t.i), yes = cands.filter((c) => c.test(x)).length;
      if (yes > 0 && yes < cands.length) info++;
      if (!t.a) negs++; if (t.g === t.a) right++;
      cands = cands.filter((c) => c.test(x) === t.a);
    }
    return { cands, info, negs, right };
  }
  // 系统的下一问：让候选规则一分为二（两边人数最接近）；没有能区分的例子就返回 null
  function nextQuery(r, cands) {
    let best = null, bestGap = 1e9;
    for (let i = 1; i <= spaceN(r); i++) { const x = exVal(r, i), y = cands.filter((c) => c.test(x)).length, n = cands.length - y; if (y && n && Math.abs(y - n) < bestGap) { best = i; bestGap = Math.abs(y - n); } }
    return best;
  }
  const first = (r, H) => { for (let i = 1; i <= spaceN(r); i++) { const x = exVal(r, i); if (H.test(x) !== r.test(x)) return i; } return 0; };

  function onSet(p, k, v) {
    const r = secretOf(p);
    if (p.mode === 0 && k === 'gs') {
      if (!(v > 0) || !(p.ex >= 1 && p.ex <= spaceN(r))) return { gs: 0 };
      if (toks(p.tried).some((t) => t.i === p.ex)) return { ex: 0, gs: 0, msg: '这个例子已经试过了，换一个' };
      const a = r.test(exVal(r, p.ex)), g = v === 1;
      return { tried: push(p.tried, tokStr(p.ex, a, g)), ex: 0, gs: 0, msg: '', $guess: { right: a === g, gap: a === g ? 0 : 1 } };
    }
    if (p.mode === 1 && k === 'ans') {
      if (!(v > 0) || !(p.mine >= 1)) return { ans: 0 };
      const m = domOf(r)[p.mine - 1], R = replay(m, toks(p.slog).map((t) => ({ i: t.i, a: t.a, g: null }))), q = nextQuery(m, R.cands);
      if (q === null) return { ans: 0 };
      const truth = m.test(exVal(m, q));
      if ((v === 1) !== truth) return { ans: 0, msg: '你说它' + (v === 1 ? '算' : '不算') + '，可按你选的规则“' + m.say + '”，它' + (truth ? '算' : '不算') + '。再想想' };
      return { slog: push(p.slog, tokStr(q, truth)), ans: 0, msg: '' };
    }
    if (k === 'mine' || k === 'mode') return { slog: '', ans: 0, msg: '' };
    return null;
  }

  function judge(p) {
    const r = secretOf(p), o = { tried: 0, informative: 0, negs: 0, solved: 0, lv: 0, counter: 0, queries: 0, sysSolved: 0, msg: null, level: null };
    if (p.mode === 0) {
      const t = toks(p.tried), R = replay(r, t); o.tried = t.length; o.informative = R.info; o.negs = R.negs;
      const dom = domOf(r);
      if (p.hyp >= 1 && p.hyp <= dom.length) {
        const H = dom[p.hyp - 1], x = first(r, H);
        if (!x) { o.solved = 1; o.lv = r.domain === 'tri' ? 2 : 3; o.msg = '猜对了：' + r.say + '。在整个例子空间里，你的规则和它处处一致'; }
        else { o.counter = x; o.msg = '你的规则说它' + (H.test(exVal(r, x)) ? '算' : '不算') + '，可它' + (r.test(exVal(r, x)) ? '不算' : '算') + '：摆在上面了（第 ' + x + ' 号例子）'; }
      } else if (t.length >= 3 && o.negs === 0) o.msg = '你还没有试过一个你认为“不算”的例子。造一个想让规则说“不算”的试试';
      else if (!t.length) o.msg = '点一个例子，先猜它算不算';
    } else if (p.mine >= 1) {
      const m = domOf(r)[p.mine - 1], tk = toks(p.slog), R = replay(m, tk.map((t) => ({ i: t.i, a: t.a, g: null })));
      o.queries = tk.length; const q = nextQuery(m, R.cands);
      if (q === null) { o.sysSolved = R.cands.includes(m) ? 1 : 0; o.level = R.cands[0]; o.msg = '系统猜：' + R.cands[0].say + (R.cands.includes(m) ? '——猜对了，用了 ' + tk.length + ' 个例子' : ''); }
    }
    return o;
  }

  // ---- 画 ----
  const hitRect = (H, x, y, w, h, k, v) => H.push('<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="4" fill="transparent" data-pick-k="' + k + '" data-pick-v="' + v + '" style="cursor:pointer"/>');
  function triSvg(t, x, y, w, h, fill, stroke) {
    const sx = Math.min((w - 8) / 4, (h - 8) / 4), sy = sx, P = t.map((q) => [x + 4 + q[0] * sx, y + h - 4 - q[1] * sy]);   // 横竖一个单位一样长
    return '<polygon points="' + P.map((q) => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' ') + '" fill="' + (fill || 'none') + '" stroke="' + (stroke || 'var(--ink)') + '" stroke-width="1.5"/>';
  }
  function draw(c) {
    const p = c.props, r = secretOf(p), W = c.w, o = judge(p), H = [], tri = r.domain === 'tri';
    let s = '';
    const grid = (cx, y0, cols, cw, ch, status, k, pending) => {
      for (let i = 1; i <= spaceN(r); i++) {
        const cc = (i - 1) % cols, rr = Math.floor((i - 1) / cols), x = cx + cc * cw, y = y0 + rr * ch, st = status[i], on = pending === i;
        const fill = st === undefined ? 'var(--card)' : st ? 'var(--good)' : 'var(--bad)';
        s += K.rect(x + 1, y + 1, cw - 2, ch - 2, { fill, stroke: on ? 'var(--accent)' : 'var(--dim)', w: on ? 3 : 1, r: 4 });
        s += tri ? triSvg(RL.triPool[i - 1], x + 1, y + 1, cw - 2, ch - 2, 'none', st === undefined ? 'var(--ink)' : '#fff') : K.text(x + cw / 2, y + ch / 2 + 4, String(i), { size: 11, weight: 700, fill: st === undefined ? 'var(--ink)' : '#fff' });
        if (k) hitRect(H, x, y, cw, ch, k, on ? 0 : i);
      }
    };
    const pills = (y0, list, k, cur, w0) => {
      let x = 10, y = y0;
      list.forEach((q, i) => {
        const wd = q.say.length * 11 + 14; if (x + wd > W - 8) { x = 10; y += 22; }
        const on = cur === i + 1;
        s += K.rect(x, y, wd, 19, { fill: on ? 'var(--accent)' : 'var(--sel-bg)', r: 9 }) + K.text(x + wd / 2, y + 14, q.say, { size: 10.5, weight: on ? 700 : 400, fill: on ? '#fff' : 'var(--ink)' });
        hitRect(H, x, y, wd, 19, k, on ? 0 : i + 1); x += wd + 5;
      });
      return y + 24;
    };
    if (p.mode === 0) {
      const t = toks(p.tried), st = {}; t.forEach((q) => { st[q.i] = q.a; });
      s += K.text(10, 16, '系统藏了一条规则。点一个例子，先猜：算，还是不算？（已试 ' + t.length + ' 个）', { size: 11.5, weight: 700, anchor: 'start' });
      let y = 26;
      if (tri) { grid(10, y, 6, 58, 46, st, 'ex', p.ex); y += 4 * 46 + 8; } else { grid(10, y, 12, 30, 22, st, 'ex', p.ex); y += 5 * 22 + 8; }
      [[1, '我猜：算'], [2, '我猜：不算']].forEach(([v, tx], i) => { const x = 10 + i * 110, live = p.ex >= 1; s += K.rect(x, y, 102, 22, { fill: live ? 'var(--accent)' : 'var(--sel-bg)', r: 6 }) + K.text(x + 51, y + 15, tx, { size: 12, weight: 700, fill: live ? '#fff' : 'var(--dim)' }); hitRect(H, x, y, 102, 22, 'gs', v); });
      const last = t[t.length - 1];
      s += K.text(240, y + 15, last ? '上一个：' + (tri ? '第 ' + last.i + ' 号' : last.i) + ' → ' + (last.a ? '算' : '不算') + (last.g === null ? '' : last.g === last.a ? '（猜对了）' : '（猜错了，没关系）') : (p.msg || ''), { size: 11, anchor: 'start', fill: 'var(--dim)' });
      y += 34; s += K.text(10, y, '觉得知道了？点一条猜想：', { size: 11.5, weight: 700, anchor: 'start' });
      y = pills(y + 8, domOf(r), 'hyp', p.hyp);
      if (o.msg) s += K.text(10, y + 10, o.msg.slice(0, 40), { size: 11.5, anchor: 'start', weight: 700, fill: o.solved ? 'var(--good)' : 'var(--bad)' });
      if (o.counter && !o.solved) { const q = o.counter; s += tri ? triSvg(RL.triPool[q - 1], W - 80, y - 12, 70, 56, 'none', 'var(--bad)') : K.text(W - 40, y + 14, String(q), { size: 26, weight: 700, fill: 'var(--bad)' }); }
    } else {
      s += K.text(10, 16, '换你出题：选一条规则，系统来猜。系统问一个例子，你答“算”或“不算”', { size: 11.5, weight: 700, anchor: 'start' });
      let y = pills(24, domOf(r), 'mine', p.mine);
      if (p.mine >= 1) {
        const m = domOf(r)[p.mine - 1], tk = toks(p.slog), R = replay(m, tk.map((q) => ({ i: q.i, a: q.a, g: null }))), q = nextQuery(m, R.cands);
        s += K.text(10, y + 6, '系统已问 ' + tk.length + ' 个例子，候选还剩 ' + R.cands.length + ' 条', { size: 11, anchor: 'start', fill: 'var(--dim)' });
        if (q !== null) {
          s += tri ? triSvg(RL.triPool[q - 1], 10, y + 14, 90, 70, 'none', 'var(--accent)') : K.text(50, y + 60, String(q), { size: 40, weight: 700, fill: 'var(--accent)' });
          [[1, '算'], [2, '不算']].forEach(([v, tx], i) => { const x = 130 + i * 90; s += K.rect(x, y + 34, 80, 28, { fill: 'var(--accent)', r: 6 }) + K.text(x + 40, y + 53, tx, { size: 14, weight: 700, fill: '#fff' }); hitRect(H, x, y + 34, 80, 28, 'ans', v); });
        } else s += K.text(10, y + 40, o.msg || '', { size: 13, weight: 700, anchor: 'start', fill: 'var(--good)' });
        if (p.msg) s += K.text(10, y + 96, p.msg.slice(0, 44), { size: 11, anchor: 'start', fill: 'var(--bad)' });
      }
    }
    return s + H.join('');
  }

  U.registerPack({
    id: 'guessrule', version: 1, needs: [],
    types: {
      guessrule: {
        workspaceRole: 'none',
        handles: true, compactPorts: true,
        essence: ['E9', 'E8'],
        label: '猜规则台', prefix: '规', group: '关系', grades: [1, 9], alias: ['猜规则', '找规律', '猜想', '算不算', '例子', '规则'],
        props: {
          secret: { type: 'int', label: '规则编号（出题人设）', default: 0, min: 0, max: N - 1 },
          mode: { type: 'choice', label: '谁来猜', default: 0, choices: ['我来猜', '我出题'] },
          tried: { hidden: true, type: 'text', label: '例子记录', default: '', write: false },
          ex: { hidden: true, type: 'int', label: '选中的例子', default: 0, min: 0, max: 60 },
          gs: { hidden: true, type: 'int', label: '我猜（1 算 2 不算）', default: 0, min: 0, max: 2 },
          hyp: { hidden: true, type: 'int', label: '我的猜想（第几条）', default: 0, min: 0, max: 20 },
          mine: { hidden: true, type: 'int', label: '我出的规则（第几条）', default: 0, min: 0, max: 20 },
          slog: { hidden: true, type: 'text', label: '系统问的记录', default: '', write: false },
          ans: { hidden: true, type: 'int', label: '我的回答（1 算 2 不算）', default: 0, min: 0, max: 2 },
          msg: { hidden: true, type: 'text', label: '提示', default: '', write: false },
        },
        onSet,
        outputs: {
          tried: { dim: null, kind: 'num', label: '试了几个例子' }, informative: { dim: null, kind: 'num', label: '有信息量的例子' }, negs: { dim: null, kind: 'num', label: '“不算”的例子' },
          solved: { dim: null, kind: 'num', label: '猜对了（1/0）' }, lv: { dim: null, kind: 'num', label: '证据等级' }, counter: { dim: null, kind: 'num', label: '能区分的例子号' },
          queries: { dim: null, kind: 'num', label: '系统问了几个' }, sysSolved: { dim: null, kind: 'num', label: '系统猜对了（1/0）' },
        },
        icon: () => K.text(32, 30, '算?', { size: 22, weight: 700, fill: 'var(--accent)' }),
        size: () => [380, 375],
        compute: (c) => {
          const o = judge(c.props);
          c.say(o.solved || o.sysSolved ? 'ok' : 'info', o.msg || (c.props.mode === 1 ? '选一条你的规则，系统来猜' : '点一个例子'));
          return { tried: num(o.tried), informative: num(o.informative), negs: num(o.negs), solved: num(o.solved), lv: num(o.lv), counter: num(o.counter), queries: num(o.queries), sysSolved: num(o.sysSolved) };
        },
        badge: (c) => ((c.out.solved && Q.num(c.out.solved.data)) || (c.out.sysSolved && Q.num(c.out.sysSolved.data)) ? '猜对了' : c.out.tried ? '试了 ' + c.out.tried.data.n : ''),
        draw,
      },
    },
  });
  const pending = (p) => {
    if (p.mode !== 1 || !(p.mine >= 1)) return null;
    const m = domOf(secretOf(p))[p.mine - 1]; if (!m) return null;
    const R = replay(m, toks(p.slog).map((t) => ({ i: t.i, a: t.a, g: null }))), q = nextQuery(m, R.cands);
    return q === null ? null : { q, truth: m.test(exVal(m, q)) };
  };
  U.GuessRule = { ALL, replay, nextQuery, judge, pending };
})(typeof globalThis !== 'undefined' ? globalThis : window);
