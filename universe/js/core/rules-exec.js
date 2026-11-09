/* 可执行的变换规则（任务 G，见 next-steps.md §10.4）。
 * U.applyRule(id, value, at, args) → { ok, value, why, kept, rule }
 *  - value：{ kind:'form' }；num / poly 会先用 U.convertVal 转成 form。
 *    on:'eqn' 的规则：{ kind:'eqn', data:{ lhs: form, rhs: form, rel } }，两边都是形式（不是多项式）。
 *  - at：形式树里的路径（下标数组），[] 表示整棵树。on:'eqn' 的规则，at 指向左边的形式。
 *  - rule.match(f, at, args)：返回字符串时即为不能用的原因（ok 为 false）；返回 false 也算不能用。
 *  - rule.apply(f, at, args)：返回新的形式（on:'eqn' 时返回 { lhs, rhs, rel }）。
 *  - rule.keeps：
 *      'value'：U.Form.equivalent(旧, 新)；
 *      'equation'：两边的值解出同一个解（一元一次，用 U.Eqn.solveLinear）；
 *      'area' / 'congruence'：调用 rule.check(旧, 新)，返回 true 才算保持；没有 check 时 kept 为 false。
 *  - 不变量不成立时 ok 仍为 true（这一步确实执行了），但 kept 为 false，测试或 lint 据此抓出来。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, P = U.Poly, F = U.Form;

  const isPoly = (v) => !!v && Array.isArray(v.terms);
  const polyOf = (v) => (isPoly(v) ? v : P.const(v));

  // ---- 形式树的读写（只读输入，写入时复制） ----
  const nodeAt = (f, at) => {
    let n = f;
    for (const i of at) { if (!n || !n.args || !n.args[i]) return null; n = n.args[i]; }
    return n;
  };
  const setAt = (f, at, node) => {
    if (!at.length) return node;
    const [i, ...rest] = at;
    const args = f.args.slice();
    args[i] = setAt(f.args[i], rest, node);
    return Object.assign({}, f, { args });
  };
  const monoKey = (m) => Object.keys(m).sort().map((v) => v + '^' + m[v]).join('*');
  const num = (n) => ({ op: 'num', n: BigInt(n) });
  // 稳定标签（§10.5.5）：规则创建的项带上 kind#stepIndex；没有 stepIndex（直接调用时）就不打标签
  const tagNode = (node, kind, a) => (a && a.stepIndex !== undefined ? Object.assign({}, node, { tag: kind + '#' + a.stepIndex }) : node);
  const FLIP = { '<': '>', '>': '<', '≤': '≥', '≥': '≤', '=': '=' };
  // 规则参数里的数：整数、BigInt、{n,d}、"3" 或 "3/4"；不是数时返回 null
  const qArg = (x) => {
    try {
      if (x && typeof x === 'object' && 'n' in x) return Q(BigInt(x.n), BigInt(x.d === undefined ? 1 : x.d));
      if (typeof x === 'string') return Q.parse(x);
      if (typeof x === 'number') return Number.isInteger(x) ? Q(BigInt(x)) : Q.fromNumber(x);
      if (typeof x === 'bigint') return Q(x);
    } catch (e) { return null; }
    return null;
  };

  // ---- 值 → 形式 / 方程两边 ----
  const toForm = (v) => {
    if (!v) return null;
    if (v.kind === 'form') return v.data;
    if (v.kind === 'num' || v.kind === 'poly') {
      const c = U.convertVal(v, 'form');
      return c ? c.data : null;
    }
    return null;
  };
  const sideForm = (x) => (isPoly(x) ? F.fromPoly(x) : x);
  const sidesOf = (v) => {
    if (!v || v.kind !== 'eqn' || !v.data || !v.data.lhs || !v.data.rhs) return null;
    return { lhs: sideForm(v.data.lhs), rhs: sideForm(v.data.rhs), rel: v.data.rel || '=' };
  };
  // 方程的两边按值算成多项式，供解集比较
  const eqnOf = (e) => ({ lhs: polyOf(F.value(e.lhs)), rhs: polyOf(F.value(e.rhs)), rel: e.rel });

  // 两个一元一次（或不等式）方程的解集是否相同
  function sameSolutions(a, b) {
    const ea = eqnOf(a), eb = eqnOf(b);
    const vars = new Set([].concat(P.vars(ea.lhs), P.vars(ea.rhs), P.vars(eb.lhs), P.vars(eb.rhs)));
    if (vars.size > 1) return { same: false, why: '方程里不止一个未知数，没法比较解集' };
    const v = vars.size ? [...vars][0] : 'x';
    // 不比较原始的不等号：两边同乘负数时不等号会反向，解集仍可能相同；解的形式（x rel value）由 solveLinear 统一给出
    const sa = U.Eqn.solveLinear(ea, v), sb = U.Eqn.solveLinear(eb, v);
    if (sa.kind === 'error' || sb.kind === 'error') return { same: false, why: '这个方程不是一元一次，无法比较解集' };
    if (sa.kind !== sb.kind) return { same: false, why: '变形前后的解不一样' };
    if (sa.kind === 'solution') {
      const same = Q.eq(sa.value, sb.value) && sa.rel === sb.rel;
      return { same, why: same ? '解都是 ' + Q.show(sa.value) : '解从 ' + Q.show(sa.value) + ' 变成了 ' + Q.show(sb.value) };
    }
    return { same: true, why: '解集相同' };
  }

  function keptBy(rule, old, out, eqnMode) {
    const k = rule.keeps;
    if (eqnMode) {
      if (k !== 'equation') return { kept: false, why: '方程上的规则只能保持解集（equation）' };
      const r = sameSolutions(old, out);
      return { kept: r.same, why: r.why };
    }
    if (k === 'value') {
      const same = F.equivalent(old, out);
      return { kept: same, why: same ? '值没有变' : '值变了：' + F.show(old) + ' 与 ' + F.show(out) + ' 不相等' };
    }
    if (k === 'area' || k === 'congruence') {
      if (typeof rule.check !== 'function') return { kept: false, why: '没有 check 函数，无法确认' + (k === 'area' ? '面积' : '全等') + '是否保持' };
      const same = !!rule.check(old, out);
      return { kept: same, why: same ? (k === 'area' ? '面积没有变' : '全等关系保持') : (k === 'area' ? '面积变了' : '全等关系被破坏了') };
    }
    return { kept: false, why: '不认识的不变量：' + k };
  }

  // 执行一条规则。返回 { ok, value, why, kept, rule }
  U.applyRule = function (id, value, at, args) {
    const rule = U.RULES[id];
    const path = at || [];
    const a = args || {};
    const refuse = (why) => ({ ok: false, value, why, kept: false, rule: id });
    if (!rule || typeof rule.apply !== 'function' || typeof rule.match !== 'function') return refuse('没有这条可执行的规则：' + id);

    const eqnMode = rule.on === 'eqn';
    let old;
    if (eqnMode) {
      old = sidesOf(value);
      if (!old) return refuse('这条规则要作用在一个方程上');
    } else {
      old = toForm(value);
      if (!old) return refuse('这个值不能转成式子，没法用这条规则');
      if (!nodeAt(old, path)) return refuse('这个位置上没有式子');
    }

    let m;
    try { m = rule.match(old, path, a); } catch (e) { return refuse('这一步不能用：' + e.message); }
    if (typeof m === 'string') return refuse(m);
    if (m === false) return refuse('这一步不能用在这里');

    let out;
    try { out = rule.apply(old, path, a); } catch (e) { return refuse('这一步算不出来：' + e.message); }
    if (!out) return refuse('这一步没有得到新的式子');

    const newValue = eqnMode
      ? U.val('eqn', out)
      : U.val('form', out, { dim: value && value.dim, exact: !(value && value.exact === false) });

    let kept = false, detail = '';
    try { ({ kept, why: detail } = keptBy(rule, old, out, eqnMode)); } catch (e) { kept = false; detail = e.message; }
    return {
      ok: true,
      value: newValue,
      why: kept ? rule.label : '这一步破坏了不变量（' + (rule.keeps) + '）：' + detail,
      kept,
      rule: id,
    };
  };

  const R = (id, def) => U.defineRule(id, Object.assign({ on: 'form' }, def));

  // ---- 算术 ----
  R('arith.split', {
    label: '拆数：把一个数拆成几个数相加', essence: ['E2'], grade: [1, 3], keeps: 'value',
    match(f, at, args) {
      const n = nodeAt(f, at);
      if (!n || n.op !== 'num') return '只能拆一个整数';
      const parts = args.parts;
      if (!Array.isArray(parts) || parts.length < 2) return '请说明拆成几个部分（至少两个）';
      if (!parts.every((p) => Number.isInteger(p) && p > 0)) return '每一部分都要是正整数';
      const s = parts.reduce((x, y) => x + y, 0);
      if (String(s) !== String(n.n)) return '拆开的部分加起来是 ' + s + '，不等于原来的 ' + String(n.n);
    },
    apply(f, at, args) {
      return setAt(f, at, { op: 'add', args: args.parts.map(num) });
    },
  });

  R('arith.make-ten', {
    label: '凑十：先把一个加数凑成 10，再把剩下的加上去', essence: ['E2'], grade: [1, 2], keeps: 'value',
    match(f, at) {
      const n = nodeAt(f, at);
      if (!n || n.op !== 'add' || n.args.length !== 2) return '凑十要在两个加数的加法上做';
      const [x, y] = n.args;
      if (x.op !== 'num' || y.op !== 'num') return '凑十的两个加数都要是整数';
      const p = Number(x.n), q = Number(y.n);
      if (!(Number.isInteger(p) && p >= 1 && p <= 9)) return '第一个数要在 1 到 9 之间，才好凑十';
      if (p + q < 10) return '两数合起来不到 10，用不着凑十';
      if (p + q === 10) return '两数合起来已经是 10，不用再凑';
    },
    apply(f, at) {
      const n = nodeAt(f, at);
      const [x, y] = n.args;
      const need = 10 - Number(x.n), rest = Number(y.n) - need;
      return setAt(f, at, { op: 'add', args: [x, num(need), num(rest)] });
    },
  });

  R('arith.commute', {
    label: '交换律：两个数交换位置，和（积）不变', essence: ['E2'], grade: [1, 2], keeps: 'value',
    match(f, at) {
      const n = nodeAt(f, at);
      if (!n || (n.op !== 'add' && n.op !== 'mul') || n.args.length !== 2) return '只有两个数的加法和乘法能交换';
    },
    apply(f, at) {
      const n = nodeAt(f, at);
      return setAt(f, at, Object.assign({}, n, { args: [n.args[1], n.args[0]] }));
    },
  });

  R('arith.reduce-fraction', {
    label: '约分：分子分母同时除以公因数', essence: ['E3'], grade: [5, 6], keeps: 'value',
    match(f, at) {
      const n = nodeAt(f, at);
      if (!n || n.op !== 'frac') return '只能约分一个分数';
      let q;
      try { q = Q(n.n, n.d); } catch (e) { return '分母不能是 0'; }
      if (q.n === BigInt(n.n) && q.d === BigInt(n.d)) return '已经是最简分数，不用约分';
    },
    apply(f, at) {
      const n = nodeAt(f, at);
      const q = Q(n.n, n.d);
      return setAt(f, at, q.d === 1n ? { op: 'num', n: q.n } : { op: 'frac', n: q.n, d: q.d });
    },
  });

  // ---- 代数 ----
  // 移项：左边的第 at[0] 项移到右边，变号。右边 rhs' = rhs − 项。方程的解集不变。
  R('alg.move-term', {
    on: 'eqn', label: '移项：左边的一项移到右边，要变号，两边的解不变', essence: ['E4'], grade: [6, 9], keeps: 'equation',
    match(eq, at) {
      if (at.length !== 1) return '请指明要移的是左边哪一项';
      const L = eq.lhs;
      if (L.op !== 'add') return '左边只有一项，没有可以移的项';
      if (!L.args[at[0]]) return '位置不对，左边没有这一项';
    },
    apply(eq, at, args) {
      const L = eq.lhs, i = at[0];
      const term = tagNode(L.args[i], 'moved', args);
      const rest = L.args.filter((_, j) => j !== i);
      return {
        lhs: rest.length === 1 ? rest[0] : { op: 'add', args: rest },
        rhs: { op: 'sub', args: [eq.rhs, term] },
        rel: eq.rel,
      };
    },
  });

  // 两边同除以 / 同乘以一个不为 0 的数：两边的解不变。不等式乘除负数时不等号反向。
  const scaleRule = (op) => ({
    on: 'eqn', label: op === 'divide' ? '两边同除以一个不为 0 的数，解不变' : '两边同乘以一个不为 0 的数，解不变',
    essence: ['E4'], grade: [6, 9], keeps: 'equation',
    match(eq, at, args) {
      const k = qArg(args && args.by);
      if (!k) return '请说明' + (op === 'divide' ? '除以' : '乘以') + '几（要是一个数）';
      if (k.n === 0n) return op === 'divide' ? '不能两边同除以 0' : '两边同乘 0 会丢掉全部信息，不能这样做';
      try { F.value(eq.lhs); F.value(eq.rhs); } catch (e) { return '方程的一边算不出来：' + e.message; }
    },
    apply(eq, at, args) {
      const k = qArg(args.by);
      const f = op === 'divide' ? Q.div(Q(1), k) : k;
      const side = (x) => F.fromPoly(P.mul(polyOf(F.value(x)), P.const(f)));
      const rel = k.n < 0n ? FLIP[eq.rel] : eq.rel;
      return { lhs: side(eq.lhs), rhs: side(eq.rhs), rel };
    },
  });
  R('alg.divide', scaleRule('divide'));
  R('alg.multiply', scaleRule('multiply'));

  // 合并同类项：add 里的几项必须是同类项，合成一项。
  R('alg.collect', {
    label: '合并同类项：同类的项相加，字母部分不变', essence: ['E2'], grade: [5, 7], keeps: 'value',
    match(f, at) {
      const n = nodeAt(f, at);
      if (!n || n.op !== 'add' || n.args.length < 2) return '只有加法里的同类项才能合并';
      let key = null;
      for (const t of n.args) {
        let p;
        try { p = polyOf(F.value(t)); } catch (e) { return '这一项算不出来：' + e.message; }
        if (p.terms.length !== 1) return '这一项不是单独的一项，不能合并';
        const k = monoKey(p.terms[0].m);
        if (key === null) key = k; else if (k !== key) return '这几项不是同类项，不能合并';
      }
    },
    apply(f, at, args) {
      const n = nodeAt(f, at);
      const sum = n.args.reduce((acc, t) => P.add(acc, polyOf(F.value(t))), P.const(Q(0)));
      return setAt(f, at, tagNode(F.fromPoly(sum), 'collected', args));
    },
  });

  // 展开：乘法里有括号（或加减式）时，乘开成一个多项式。
  R('alg.expand', {
    label: '展开：去括号，每一项都乘一遍', essence: ['E2'], grade: [7, 9], keeps: 'value',
    match(f, at) {
      const n = nodeAt(f, at);
      if (!n || n.op !== 'mul' || n.args.length < 2) return '只有乘法才能展开';
      if (!n.args.some((x) => x.op === 'group' || x.op === 'add' || x.op === 'sub')) return '没有括号，用不着展开';
      try { n.args.forEach((x) => F.value(x)); } catch (e) { return '这个乘法算不出多项式：' + e.message; }
    },
    apply(f, at) {
      const n = nodeAt(f, at);
      const prod = n.args.reduce((acc, x) => P.mul(acc, polyOf(F.value(x))), P.const(Q(1)));
      return setAt(f, at, F.fromPoly(prod));
    },
  });

  // 作中点（geo.midpoint）未做：几何规则作用在图形（fig）上，而 geo.js 的线段没有形式表示，需要先改 geo.js。
})(typeof globalThis !== 'undefined' ? globalThis : window);
