/* 器材包 termsbench：代数式操作台（docs/instrument-design.md 第 4 节）。两种用法，全部在图上直接动手：
 *   合并同类项：式子拆成一块一块的项。把一项拖到另一项上：是同类项就合并（系数相加），不是同类项合不了，会说明为什么。
 *               下面一直写着“代入 x = 2、y = 3，原式和现在的式子一样大”——合并只是换写法，值不变。
 *   运算顺序：  一串数和运算符。点哪个运算符，就先算哪一步。顺序不对（比如有乘法却先点加号）会被拦住并说明原因；
 *               顺序对了，这一步算出来，下面多一行“= …”。连加、连乘可以从任何一处先算（结合律），连减、连除只能从左往右。
 * 式子的写法：合并同类项用 "3x,2,2x,5,-x"（x2 表示 x²），运算顺序用 "2,+,3,*,4"（括号写成 ( 和 )）。
 * 这一版的边界（如实写）：项只有 x、x²、y、xy 和常数，系数是整数；没有去括号、提公因式和移项；运算顺序没有乘方。
 * 和旧器材的关系：“式子工作台”（exprbench）是按规则一步步变形的台面，先保留；这一台管的是“同类项”和“先算哪一步”这两件事本身。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', typeof n === 'number' ? Q(n) : n, { dim: null });
  const MODES = ['合并同类项', '运算顺序'];
  const W = 640, TY = 96, TW = 62, TH = 44, GAP = 16, PROBE = { x: 2, y: 3 };
  const KINDS = ['x2', 'xy', 'x', 'y', ''], KSHOW = { x2: 'x²', xy: 'xy', x: 'x', y: 'y', '': '' };
  const KCOL = { x2: '#cfe3fb', xy: '#ead9f7', x: '#fde2c4', y: '#d6f0d6', '': '#e6e9f0' };
  const KNAME = { x2: 'x² 的项', xy: 'xy 的项', x: 'x 的项', y: 'y 的项', '': '常数项' };

  // ---------- 合并同类项 ----------
  function parseTerms(t) {
    const out = [];
    for (const raw of String(t === undefined || t === null ? '' : t).split(/[,，]/)) {
      const s = raw.replace(/\s+/g, '').replace(/−/g, '-').replace(/²/g, '2'); if (!s) continue;
      const m = /^([+-]?)(\d*)(x2|xy|x|y|)$/.exec(s); if (!m || (m[2] === '' && m[3] === '')) continue;
      const c = (m[1] === '-' ? -1 : 1) * (m[2] === '' ? 1 : Number(m[2])); if (!Number.isFinite(c)) continue;
      out.push({ c, k: m[3] });
    }
    return out.slice(0, 8);
  }
  const termStr = (t) => (t.k === '' ? String(t.c) : (t.c === 1 ? '' : t.c === -1 ? '-' : t.c) + t.k);
  const serial = (list) => list.map(termStr).join(',');
  const termShow = (t, first) => { const a = Math.abs(t.c), body = (t.k === '' ? String(a) : (a === 1 ? '' : a) + KSHOW[t.k]); return (t.c < 0 ? (first ? '−' : '− ') : (first ? '' : '+ ')) + body; };
  const exprShow = (list) => (list.length ? list.map((t, i) => termShow(t, i === 0)).join(' ') : '0');
  const valAt = (list) => list.reduce((s, t) => s + t.c * (t.k === 'x2' ? PROBE.x * PROBE.x : t.k === 'xy' ? PROBE.x * PROBE.y : t.k === 'x' ? PROBE.x : t.k === 'y' ? PROBE.y : 1), 0);
  const simplified = (list) => new Set(list.map((t) => t.k)).size === list.length;
  const coef = (list, k) => list.filter((t) => t.k === k).reduce((s, t) => s + t.c, 0);
  // 把第 i 项并到第 j 项上；不是同类项返回 null
  function merge(list, i, j) {
    if (i === j || !list[i] || !list[j] || list[i].k !== list[j].k) return null;
    const out = list.map((t) => ({ c: t.c, k: t.k })); out[j].c += out[i].c; out.splice(i, 1);
    const jj = j > i ? j - 1 : j; if (out[jj].c === 0) out.splice(jj, 1);
    return out.length ? out : [{ c: 0, k: '' }];
  }
  const tileX = (i, n) => (W - (n * TW + (n - 1) * GAP)) / 2 + i * (TW + GAP);
  const tileAt = (q, n) => { if (q.y < TY - 16 || q.y > TY + TH + 16) return -1; for (let i = 0; i < n; i++) { const x = tileX(i, n); if (q.x >= x - GAP / 2 && q.x <= x + TW + GAP / 2) return i; } return -1; };

  // ---------- 运算顺序 ----------
  const OPS = { '+': '+', '-': '−', '*': '×', '/': '÷' }, isOp = (t) => Object.prototype.hasOwnProperty.call(OPS, t);
  function parseToks(t) {
    return String(t === undefined || t === null ? '' : t).split(/[,，]/).map((s) => s.trim().replace(/−/g, '-').replace(/×/g, '*').replace(/÷/g, '/')).filter((s) => s !== '');
  }
  const numOf = (s) => { try { return Q.parse(String(s)); } catch (e) { return null; } };
  // 哪些运算符现在可以先算。返回 { ok: Set(下标), why: { 下标: 原因 } }
  function allowed(toks) {
    const ok = new Set(), why = {}, ops = [], depth = [];
    let d = 0, maxd = 0;
    toks.forEach((t, i) => { if (t === '(') d++; else if (t === ')') d--; else if (isOp(t)) { ops.push(i); depth[i] = d; maxd = Math.max(maxd, d); } });
    // 每一段（同一对括号里、不跨括号）单独看
    const seg = (i) => { let a = i, b = i, dd = 0; for (a = i; a > 0; a--) { const t = toks[a - 1]; if (t === ')') dd++; else if (t === '(') { if (dd === 0) break; dd--; } } dd = 0; for (b = i; b < toks.length - 1; b++) { const t = toks[b + 1]; if (t === '(') dd++; else if (t === ')') { if (dd === 0) break; dd--; } } return ops.filter((k) => k >= a && k <= b && depth[k] === depth[i]); };
    for (const i of ops) {
      // 运算符两边必须都是数（括号还没算完的不能算）
      if (numOf(toks[i - 1]) === null || numOf(toks[i + 1]) === null || toks[i - 1] === ')' || toks[i + 1] === '(') { why[i] = '先算括号里的'; continue; }
      if (depth[i] < maxd) { why[i] = '先算括号里的'; continue; }
      const s = seg(i), muls = s.filter((k) => toks[k] === '*' || toks[k] === '/');
      const mine = toks[i] === '*' || toks[i] === '/';
      if (!mine && muls.length) { why[i] = '先算乘除，再算加减'; continue; }
      const level = mine ? muls : s, assoc = level.every((k) => toks[k] === (mine ? '*' : '+'));
      if (!assoc && level[0] !== i) { why[i] = mine ? '乘除混在一起，从左往右算' : '加减混在一起，从左往右算'; continue; }
      ok.add(i);
    }
    return { ok, why };
  }
  function applyOp(toks, i) {
    const a = numOf(toks[i - 1]), b = numOf(toks[i + 1]), op = toks[i];
    if (op === '/' && Q.num(b) === 0) return null;
    const r = op === '+' ? Q.add(a, b) : op === '-' ? Q.sub(a, b) : op === '*' ? Q.mul(a, b) : Q.div(a, b);
    const out = toks.slice(0, i - 1).concat([Q.show(r)], toks.slice(i + 2));
    // 括号里只剩一个数：去掉括号
    for (let k = 0; k + 2 < out.length; k++) if (out[k] === '(' && out[k + 2] === ')' && numOf(out[k + 1]) !== null) { out.splice(k + 2, 1); out.splice(k, 1); break; }
    return out;
  }
  const tokShow = (t) => (isOp(t) ? OPS[t] : t === '(' || t === ')' ? t : (String(t).startsWith('-') ? '(−' + String(t).slice(1) + ')' : String(t)));
  const toksShow = (toks) => toks.map(tokShow).join(' ');

  function model(p) {
    if (p.mode === 1) {
      const toks = parseToks(p.toks), single = toks.length === 1 ? numOf(toks[0]) : null;
      return { mode: 1, toks, value: single, hist: String(p.hist || '').split('|').filter(Boolean), steps: p.steps, wrong: p.wrong };
    }
    const list = parseTerms(p.terms), orig = parseTerms(p.orig || p.terms);
    return { mode: 0, list, orig, simplified: simplified(list) ? 1 : 0, value: valAt(list), origValue: valAt(orig) };
  }

  function draw(c) {
    const p = c.props, m = model(p); let s = '';
    if (m.mode === 0) {
      const n = m.list.length;
      s += K.text(W / 2, 36, '原式：' + exprShow(m.orig), { size: 14 });
      m.list.forEach((t, i) => {
        const x = tileX(i, n);
        s += K.rect(x, TY, TW, TH, { fill: KCOL[t.k], stroke: 'var(--ink)', r: 8, w: 1.6 }) + K.text(x + TW / 2, TY + TH / 2 + 7, termShow(t, true), { size: 19, weight: 700 });
        if (i < n - 1) s += K.text(x + TW + GAP / 2, TY + TH / 2 + 6, m.list[i + 1].c < 0 ? '' : '+', { size: 16 });
      });
      s += K.text(W / 2, TY + TH + 46, '= ' + exprShow(m.list), { size: 22, weight: 700 });
      s += K.text(W / 2, TY + TH + 76, m.simplified ? '没有同类项了：最简' : '还有同类项（颜色一样的）：把一块拖到另一块上', { size: 13, weight: 700, fill: m.simplified ? 'var(--good)' : 'var(--ink)' });
      if (p.msg) s += K.text(W / 2, TY - 22, p.msg, { size: 13, weight: 700, fill: 'var(--bad)' });
      s += K.text(W / 2, TY + TH + 104, '代入 x = ' + PROBE.x + '、y = ' + PROBE.y + '：原式 = ' + m.origValue + '，现在 = ' + m.value + (m.value === m.origValue ? '，一样' : '，不一样！'), { size: 13 });
    } else {
      const al = allowed(m.toks), n = m.toks.length, cw = 46, x0 = (W - n * cw) / 2;
      m.hist.slice(-4).forEach((h, i) => { s += K.text(W / 2, 30 + i * 20, (i === 0 ? '' : '= ') + h, { size: 14 }); });
      const y = 30 + Math.min(m.hist.length, 4) * 20 + 34;
      m.toks.forEach((t, i) => {
        const x = x0 + i * cw + cw / 2;
        if (isOp(t)) {
          let patch;
          if (al.ok.has(i)) { const nt = applyOp(m.toks, i); patch = nt ? { toks: nt.join(','), hist: m.hist.concat([toksShow(m.toks)]).slice(-8).join('|'), steps: p.steps + 1, msg: '' } : { msg: '不能除以 0', wrong: p.wrong + 1 }; }
          else patch = { msg: al.why[i] || '这一步现在还不能算', wrong: p.wrong + 1 };
          s += '<g data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"><title>点一下：先算这一步</title>' + K.circle(x, y - 7, 17, { fill: '#fff', stroke: 'var(--blue)', w: 2.2 }) + K.text(x, y, OPS[t], { size: 22, weight: 700, fill: 'var(--blue)' }) + '</g>';
        } else s += K.text(x, y + 1, tokShow(t), { size: 24, weight: 700 });
      });
      if (m.hist.length) s += K.text(x0 - 14, y + 1, '=', { size: 22, weight: 700 });
      if (p.msg) s += K.text(W / 2, y + 44, p.msg, { size: 14, weight: 700, fill: 'var(--bad)' });
      else if (m.value !== null) s += K.text(W / 2, y + 44, '算完了：' + Q.show(m.value).replace('-', '−'), { size: 15, weight: 700, fill: 'var(--good)' });
      else s += K.text(W / 2, y + 44, '点一个运算符：先算哪一步？', { size: 13 });
      s += K.text(W / 2, y + 72, '算了 ' + p.steps + ' 步' + (p.wrong ? '，被拦住 ' + p.wrong + ' 次' : ''), { size: 12 });
    }
    return s;
  }

  function grips(c) {
    const p = c.props, m = model(p), out = [];
    if (m.mode !== 0) return out;
    const n = m.list.length;
    m.list.forEach((t, i) => out.push({ id: 't' + i, x: tileX(i, n) + TW / 2, y: TY + TH / 2, r: 24, ghost: true, cursor: 'grab', tip: '拖到同类项上：合并',
      drag: (c0, q) => {
        const l0 = parseTerms(c0.props.terms), j = tileAt(q, l0.length);
        if (j < 0 || j === i) return { msg: '' };
        const r = merge(l0, i, j);
        if (!r) return { msg: KNAME[l0[i].k] + '和' + KNAME[l0[j].k] + '不是同类项，不能合并', refused: c0.props.refused + 1 };
        return { terms: serial(r), msg: '' };
      },
      say: (c1) => c1.props.msg || exprShow(parseTerms(c1.props.terms)) }));
    return out;
  }

  const I = (lo, hi, d, label, o) => Object.assign({ type: 'int', label, default: d, min: lo, max: hi, write: true }, o || {});
  const T = (d, label, o) => Object.assign({ type: 'text', label, default: d, write: true }, o || {});
  U.registerPack({
    id: 'termsbench', version: 1,
    types: {
      termsbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E4', 'E2'],
        label: '代数式操作台', prefix: '代数式', group: '关系', grades: [1, 9],
        alias: ['代数式', '合并同类项', '同类项', '整式', '化简', '运算顺序', '四则混合运算', '先乘除后加减', '括号', '结合律'],
        props: {
          mode: { type: 'choice', label: '用来做什么', default: 0, choices: MODES, write: true },
          terms: T('3x,2,2x,5', '合并同类项：现在的式子（用逗号分开各项，x2 表示 x²）'),
          orig: T('', '合并同类项：原式（出题人设；空着就用开场的式子）', { hidden: true }),
          toks: T('2,+,3,*,4', '运算顺序：现在的算式（数和运算符用逗号分开）'),
          hist: T('', '运算顺序：前面几步（自动记录）', { hidden: true }),
          steps: I(0, 99, 0, '算了几步（自动记录）', { hidden: true }), wrong: I(0, 99, 0, '被拦住几次（自动记录）', { hidden: true }),
          refused: I(0, 99, 0, '合并不了几次（自动记录）', { hidden: true }),
          msg: T('', '提示（自动）', { hidden: true }),
        },
        outputs: {
          value: { dim: null, kind: 'num', label: '算式的结果（算完才有）/ 代入后的值' },
          terms: { dim: null, kind: 'num', label: '现在有几项' },
          simplified: { dim: null, kind: 'num', label: '没有同类项了：1 是，0 否' },
          cx: { dim: null, kind: 'num', label: 'x 的系数' }, cy: { dim: null, kind: 'num', label: 'y 的系数' },
          cx2: { dim: null, kind: 'num', label: 'x² 的系数' }, c0: { dim: null, kind: 'num', label: '常数项' },
          refused: { dim: null, kind: 'num', label: '想合并不是同类项的，几次' },
          steps: { dim: null, kind: 'num', label: '算了几步' }, wrong: { dim: null, kind: 'num', label: '顺序不对被拦住几次' },
        },
        icon: () => K.rect(6, 12, 22, 20, { fill: '#fde2c4', stroke: 'var(--ink)', r: 4 }) + K.text(17, 27, '3x', { size: 11, weight: 700 }) + K.text(33, 27, '+', { size: 12 }) + K.rect(38, 12, 22, 20, { fill: '#fde2c4', stroke: 'var(--ink)', r: 4 }) + K.text(49, 27, '2x', { size: 11, weight: 700 }),
        size: () => [W, 300],
        grips,
        compute: (c) => {
          const m = model(c.props), z = num(0);
          if (m.mode === 1) { const o = { terms: z, simplified: z, cx: z, cy: z, cx2: z, c0: z, refused: z, steps: num(c.props.steps), wrong: num(c.props.wrong) }; if (m.value !== null) o.value = num(m.value); return o; }
          return { value: num(m.value), terms: num(m.list.length), simplified: num(m.simplified), cx: num(coef(m.list, 'x')), cy: num(coef(m.list, 'y')), cx2: num(coef(m.list, 'x2')), c0: num(coef(m.list, '')), refused: num(c.props.refused), steps: z, wrong: z };
        },
        badge: () => '',
        draw,
      },
    },
  });
  U.TermsBench = { parseTerms, merge, exprShow, simplified, parseToks, allowed, applyOp, toksShow, model, MODES };
})(typeof globalThis !== 'undefined' ? globalThis : window);
