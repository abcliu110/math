/* 器材包 polytools：整式的因式分解、整式运算，以及把两个式子造成方程。
 *   因式分解（factor）：把一个式子写成“常数 × 若干因式的乘积”，例如 x² − 5x + 6 = (x − 2)(x − 3)，2x² − 8 = 2(x − 2)(x + 2)，
 *     x³ − x = x(x − 1)(x + 1)，a² − b² = (a − b)(a + b)。在有理数范围内找一次因式（有理根）、提公因式、平方差；
 *     分解不动的部分原样留着，并说明。结果是“因式”值，能直接当式子用（自动展开回去），所以可以接“比较”检验分解对不对。
 *   整式运算（polyop）：两个式子相加、相减、相乘；相除得商和余式（只含一个字母）；求最大公因式。
 *   造方程（eqmake）：左边、右边各接一个式子，选 = < > ≤ ≥，得到方程（接解、变形、验根）。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit, P = U.Poly, E = U.Eqn;

  // ---------- 因式分解 ----------
  const big = (x) => (x < 0n ? -x : x);
  const gcdB = (a, b) => { a = big(a); b = big(b); while (b) { [a, b] = [b, a % b]; } return a; };
  const divisors = (n) => {   // n 的正约数（n 不太大才枚举）
    n = Number(big(n)); if (!isFinite(n) || n > 1e12) return null;
    const out = [];
    for (let d = 1; d * d <= n; d++) if (n % d === 0) { out.push(d); if (d * d !== n) out.push(n / d); }
    return out;
  };
  // 单字母多项式 ↔ 系数数组（下标是次数）
  const coeffsOf = (p, v) => { const a = []; for (const t of p.terms) { const k = t.m[v] || 0; a[k] = Q.add(a[k] || Q(0), t.c); } for (let i = 0; i < a.length; i++) if (!a[i]) a[i] = Q(0); return a; };
  const fromCoeffs = (a, v) => P.norm(a.map((c, i) => ({ c, m: i ? { [v]: i } : {} })));
  const evalAt = (a, r) => a.reduceRight((s, c) => Q.add(Q.mul(s, r), c), Q(0));
  const divLinear = (a, r) => {   // a(x) ÷ (x − r)，余数为 0 时返回商的系数
    const n = a.length - 1, q = new Array(n);
    let carry = Q(0);
    for (let i = n; i >= 1; i--) { carry = Q.add(a[i], Q.mul(carry, r)); q[i - 1] = carry; }
    return q;
  };
  // 本原化：返回 { c: 有理常数, p: 各系数是互素整数、首项为正的多项式 }（p 的“首项”按最高次数）
  const primitive = (p, v) => {
    const cs = p.terms.map((t) => t.c);
    let num = 0n, den = 1n;
    for (const c of cs) { num = gcdB(num, c.n); den = (den / gcdB(den, c.d)) * c.d; }
    if (num === 0n) return { c: Q(1), p };
    let c = Q.div({ n: num, d: den }, Q(1));
    const lead = p.terms.reduce((best, t) => ((t.m[v] || 0) > (best.m[v] || 0) || !best ? t : best), p.terms[0]);
    if (lead.c.n < 0n) c = Q.neg(c);
    return { c, p: P.mul(p, P.const(Q.div(Q(1), c))) };
  };
  const squareRoot = (q) => {   // 非负有理数的有理平方根，没有返回 null
    if (q.n < 0n) return null;
    const rt = (x) => { if (x < 2n) return x; let lo = 1n, hi = x; while (lo < hi) { const m = (lo + hi + 1n) / 2n; if (m * m <= x) lo = m; else hi = m - 1n; } return lo; };
    const a = rt(q.n), b = rt(q.d);
    return a * a === q.n && b * b === q.d ? { n: a, d: b } : null;
  };

  // 返回 { c, fs: [{p, e}], note }：p 是首项为正的本原因式
  const factor = (p) => {
    if (!p.terms.length) return { c: Q(0), fs: [], note: '0 不用分解' };
    const fs = [], add = (f, e) => { const hit = fs.find((x) => P.eq(x.p, f)); if (hit) hit.e += e || 1; else fs.push({ p: f, e: e || 1 }); };
    let notes = [];
    // 1. 常数
    const vs = P.vars(p);
    if (!vs.length) return { c: p.terms[0].c, fs: [], note: '' };
    // 2. 单项式公因式
    let q = p, c = Q(1);
    const mins = {};
    for (const v of vs) mins[v] = Math.min(...p.terms.map((t) => t.m[v] || 0));
    const mono = vs.filter((v) => mins[v] > 0);
    if (mono.length) {
      const m = {}; for (const v of mono) m[v] = mins[v];
      q = P.divExact(p, P.norm([{ c: Q(1), m }]));
      for (const v of mono) add(P.variable(v), mins[v]);
    }
    // 3. 常数内容，首项取正
    const vs2 = P.vars(q);
    const v1 = vs2[0] || 'x';
    const pr = primitive(q, v1); c = Q.mul(c, pr.c); q = pr.p;
    const vs3 = P.vars(q);
    if (vs3.length === 0) return { c: Q.mul(c, q.terms.length ? q.terms[0].c : Q(1)), fs, note: '' };
    if (vs3.length === 1) {
      const v = vs3[0];
      let a = coeffsOf(q, v);
      // 有理根逐个剥
      for (let guard = 0; guard < 60 && a.length > 2; guard++) {
        const a0 = a[0], an = a[a.length - 1];
        const ds0 = divisors(a0.n), dsn = divisors(an.n);
        if (!ds0 || !dsn) { notes.push('系数太大，只做了能做的部分'); break; }
        let found = null;
        outer: for (const pp of ds0) for (const qq of dsn) for (const s of [1, -1]) {
          const r = Q.div(Q(s * pp), Q(qq));
          if (evalAt(a, r).n === 0n) { found = r; break outer; }
        }
        if (!found) break;
        const quot = divLinear(a, found);
        // (x − r) = (qx − p)/q：因式取本原的 (q x − p)，常数部分吸收进 q 里
        const lin = primitive(fromCoeffs([Q.neg(found), Q(1)], v), v);
        add(lin.p, 1); c = Q.mul(c, lin.c); a = quot;
      }
      let rest = fromCoeffs(a, v);
      let prr = primitive(rest, v); c = Q.mul(c, prr.c); rest = prr.p;
      if (P.degree(rest) >= 4) {   // 没有有理根的四次及以上：试着分出整系数的二次因式
        const sp = E.splitQuadratics(coeffsOf(rest, v));
        for (const qd of sp.quads) { const pq = primitive(fromCoeffs(qd, v), v); add(pq.p, 1); c = Q.mul(c, pq.c); }
        if (sp.quads.length) { rest = fromCoeffs(sp.rest, v); prr = primitive(rest, v); c = Q.mul(c, prr.c); rest = prr.p; }
      }
      if (P.degree(rest) >= 1) {
        add(rest, 1);
        const d = P.degree(rest);
        if (d >= 4) notes.push('剩下的 ' + P.show(rest) + ' 没有有理根，也没找到整系数的二次因式，在有理数范围内分不下去了');
        else if (d >= 2) notes.push(P.show(rest) + ' 在有理数范围内分不下去了');
      } else c = Q.mul(c, rest.terms.length ? rest.terms[0].c : Q(1));
    } else {
      // 多个字母：试平方差（两项，系数一正一负、各项是平方）
      let done = false;
      if (q.terms.length === 2) {
        const [t1, t2] = q.terms, pos = t1.c.n > 0n ? t1 : t2, neg = t1.c.n > 0n ? t2 : t1;
        const sp = squareRoot(pos.c), sn = squareRoot(Q.neg(neg.c));
        const ev = (m) => Object.keys(m).every((k) => m[k] % 2 === 0);
        if (pos.c.n > 0n && neg.c.n < 0n && sp && sn && ev(pos.m) && ev(neg.m)) {
          const half = (m) => { const o = {}; for (const k of Object.keys(m)) o[k] = m[k] / 2; return o; };
          const A = P.norm([{ c: sp, m: half(pos.m) }]), B = P.norm([{ c: sn, m: half(neg.m) }]);
          add(P.sub(A, B), 1); add(P.add(A, B), 1); done = true;
        }
      }
      if (!done) { add(q, 1); notes.push('含多个字母，只提了公因式、试了平方差'); }
    }
    // 因式的内部排序：按次数、再按文字
    // 排序：单项式（x、y）在前，其余按次数、常数项的绝对值、负的在前，最后按文字
    const lin = (x) => { const t = x.p.terms.find((u) => Object.keys(u.m).length === 1 && Object.values(u.m)[0] === 1); return t ? t.c : Q(0); };
    const cst = (x) => { const t = x.p.terms.find((u) => !Object.keys(u.m).length); return t ? t.c : Q(0); };
    fs.sort((x, y) => (y.p.terms.length === 1) - (x.p.terms.length === 1) || P.degree(x.p) - P.degree(y.p) ||
      Q.cmp(Q.abs(cst(x)), Q.abs(cst(y))) || Q.cmp(cst(x), cst(y)) || Q.cmp(lin(x), lin(y)) || P.show(x.p).localeCompare(P.show(y.p)));
    return { c, fs, note: notes.join('；') };
  };

  const SUP = { 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
  const factShow = (f) => {
    if (!f.fs.length) return Q.show(f.c);
    const parts = f.fs.map((x) => {
      const s = P.show(x.p), single = x.p.terms.length === 1;
      return (single ? s : '(' + s + ')') + (x.e > 1 ? (SUP[x.e] || '^' + x.e) : '');
    });
    const c = f.c;
    const pre = Q.eq(c, Q(1)) ? '' : Q.eq(c, Q(-1)) ? '−' : c.d === 1n ? Q.show(c) : '(' + Q.show(c) + ')';
    return pre + parts.join('');
  };
  const factExpand = (f) => {
    let r = P.const(f.c);
    for (const x of f.fs) r = P.mul(r, P.pow(x.p, x.e));
    return r;
  };
  const P0 = { factor, factShow, factExpand };
  U.PolyTools = P0;

  // ---------- 整式运算 ----------
  const divmod = (a, b, v) => {   // 单字母多项式长除法：返回 { q, r }
    const A = coeffsOf(a, v), B = coeffsOf(b, v);
    const nb = B.length - 1;
    if (!b.terms.length) return null;
    let r = A.slice(), q = new Array(Math.max(A.length - nb, 1)).fill(Q(0));
    for (let i = A.length - 1; i >= nb; i--) {
      const f = Q.div(r[i], B[nb]); q[i - nb] = f;
      for (let j = 0; j <= nb; j++) r[i - nb + j] = Q.sub(r[i - nb + j], Q.mul(f, B[j]));
    }
    r = r.slice(0, Math.max(nb, 1));
    return { q: fromCoeffs(q, v), r: fromCoeffs(r, v) };
  };

  const OPS = ['加', '减', '乘', '除（商和余式）', '最大公因式'];
  const polyIn = (c, port) => { const v = K.first(c.inp[port]); return v && (v.kind === 'poly' || v.kind === 'expr') ? v.data : null; };

  U.registerPack({
    id: 'polytools', version: 1, needs: ['core@1', 'algebra@1', 'equation@1'],
    kinds: {
      fact: {
        label: '因式', color: '#f97316',
        eq: (a, b) => P.eq(factExpand(a), factExpand(b)) && factShow(a) === factShow(b),
        show: (f) => factShow(f),
        brief: (f) => factShow(f),
        to: { poly: (f) => factExpand(f), expr: (f) => factExpand(f) },
      },
    },
    types: {
      factor: {
        workspaceRole: 'none', handles: true, essence: ['E4', 'E8'],
        label: '因式分解', prefix: '因', group: '数与运算', grades: [8, 9], alias: ['分解因式', '提公因式', '平方差', '十字相乘', '有理根'],
        lint: { minProps: 1, why: '因式分解只有标签一个属性' },
        props: { label: { type: 'text', label: '标签', default: '' } },
        inputs: { p: { kind: 'poly', label: '式子' } },
        outputs: { f: { dim: null, kind: 'fact', label: '分解后' }, n: { dim: null, kind: 'num', label: '因式个数' } },
        icon: () => K.text(32, 30, '(x−a)', { size: 14, weight: 700 }) + K.text(32, 46, '(x+b)', { size: 14, weight: 700 }),
        size: () => [300, 120],
        compute: (c) => {
          const v = polyIn(c, 'p');
          if (!v) { c.say('info', '接一个式子（代数式卡、整式运算的结果都行）'); return {}; }
          if (!v.terms.length) { c.say('info', '0 不用分解'); return {}; }
          const r = factor(v);
          c.say(r.note ? 'info' : 'ok', factShow(r) + (r.note ? '（' + r.note + '）' : ''));
          return { f: U.val('fact', { c: r.c, fs: r.fs }), n: U.val('num', Q(r.fs.reduce((s, x) => s + x.e, 0))) };
        },
        badge: (c) => (c.out.f ? U.showVal(c.out.f) : ''),
        draw: (c) => K.text(c.w / 2, c.h / 2 + 8, c.out.f ? U.showVal(c.out.f) : '—', { size: 20, weight: 700, fill: c.out.f ? 'var(--ink)' : 'var(--dim)' }),
      },

      polyop: {
        workspaceRole: 'none', handles: true, essence: ['E4'],
        label: '整式运算', prefix: '整', group: '数与运算', grades: [7, 9], alias: ['整式加减', '整式乘法', '多项式除法', '展开', '去括号', '最大公因式', '商和余式'],
        props: { op: { type: 'choice', label: '运算', default: 2, choices: OPS }, label: { type: 'text', label: '标签', default: '' } },
        lint: { minProps: 2, why: '整式运算只有“运算”和标签两个属性' },
        inputs: { a: { kind: 'poly', label: 'A' }, b: { kind: 'poly', label: 'B' } },
        outputs: { r: { dim: null, kind: 'poly', label: '结果' }, rem: { dim: null, kind: 'poly', label: '余式' } },
        icon: () => K.text(32, 34, 'A·B', { size: 20, weight: 700 }),
        size: () => [230, 110],
        compute: (c) => {
          const a = polyIn(c, 'a'), b = polyIn(c, 'b');
          if (!a || !b) { c.say('info', '接两个式子'); return {}; }
          const op = c.props.op;
          if (op === 0) return { r: U.val('poly', P.add(a, b)) };
          if (op === 1) return { r: U.val('poly', P.sub(a, b)) };
          if (op === 2) return { r: U.val('poly', P.mul(a, b)) };
          if (op === 4) return { r: U.val('poly', P.gcd(a, b)) };
          if (!b.terms.length) { c.say('info', '不能除以 0'); return {}; }
          const vs = [...new Set(P.vars(a).concat(P.vars(b)))];
          if (vs.length > 1) { c.say('info', '带余除法只能用在只含一个字母的式子上，现在有：' + vs.join('、')); return {}; }
          const d = divmod(a, b, vs[0] || 'x');
          c.say('ok', '商 ' + P.show(d.q) + '，余式 ' + P.show(d.r));
          return { r: U.val('poly', d.q), rem: U.val('poly', d.r) };
        },
        badge: (c) => (c.out.r ? U.showVal(c.out.r) : ''),
        draw: (c) => K.text(c.w / 2, c.h / 2 + 4, c.out.r ? U.showVal(c.out.r) : '—', { size: 18, weight: 700, fill: c.out.r ? 'var(--ink)' : 'var(--dim)' }) +
          K.text(c.w / 2, c.h - 14, OPS[c.props.op] + (c.out.rem ? ' · 余 ' + U.showVal(c.out.rem) : ''), { size: 12, fill: 'var(--dim)' }),
      },

      eqmake: {
        workspaceRole: 'none', handles: true, essence: ['E4', 'E8'],
        label: '造方程', prefix: '造', group: '关系', grades: [7, 9], alias: ['方程', '不等式', '左边右边', '列方程', '把两个式子连成方程'],
        props: { rel: { type: 'choice', label: '关系', default: 0, choices: ['=', '<', '>', '≤', '≥'] }, label: { type: 'text', label: '标签', default: '' } },
        lint: { minProps: 2, why: '造方程只有“关系”和标签两个属性' },
        inputs: { l: { kind: 'poly', label: '左边' }, r: { kind: 'poly', label: '右边' } },
        outputs: { eq: { dim: null, kind: 'eqn', label: '方程' } },
        icon: () => K.text(32, 34, '□ = □', { size: 18, weight: 700 }),
        size: () => [270, 100],
        compute: (c) => {
          const l = polyIn(c, 'l'), r = polyIn(c, 'r');
          if (!l || !r) { c.say('info', '左边、右边各接一个式子（数字卡也行）'); return {}; }
          return { eq: U.val('eqn', E.make(l, r, ['=', '<', '>', '≤', '≥'][c.props.rel])) };
        },
        badge: (c) => (c.out.eq ? U.showVal(c.out.eq) : ''),
        draw: (c) => K.text(c.w / 2, c.h / 2 + 8, c.out.eq ? U.showVal(c.out.eq) : '—', { size: 20, weight: 700, fill: c.out.eq ? 'var(--ink)' : 'var(--dim)' }),
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
