/* 器材包 proof：证明类器材（设计 v2 §2.7）。
 * 器材只做台面上的计算，把结论放在输出口 lv（证据等级 0–4）和 refuted（是否推翻）里。
 * 证据等级由台面上的证明器材决定（U.Evidence.fromScene），学生不能自选。
 *  猜想板：把一条猜想写成文字，等级 ①（记录）
 *  参数扫描器：在范围里逐个检查一条规则，没有例外 → ②
 *  反例构造器：同一范围找反例，找到就推翻
 *  系统枚举器：列出全部情况并逐一检查，数量对上 → ③
 *  不变量追踪器：检查一个变换前后某个量是否不变（单独不给等级）
 *  证明脚手架：三步推理，每步都要引用台面上已验证的事实，全部填完 → ④
 *  归纳阶梯：起点 + 每一级推下一级（检查 1 到 upto），全部成立 → ④ */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit, E = U.Evidence;
  const num = (q) => U.val('num', q, { dim: null });

  // ---- 规则库：器材里选的规则名 → 对整数 n 的检查（纯计算）----
  const isPrime = (n) => { if (n < 2) return false; for (let d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; };
  const RULES = {
    '平方不小于本身': (n) => n * n >= n,
    '偶数（≥4）是两个质数之和': (n) => { if (n % 2 !== 0 || n < 4) return true; for (let p = 2; p <= n / 2; p++) if (isPrime(p) && isPrime(n - p)) return true; return false; },
    '2ⁿ 大于 n': (n) => n < 0 || Math.pow(2, n) > n,
    '质数都是奇数': (n) => !isPrime(n) || n % 2 === 1,                 // 不成立：2 是质数又是偶数（反例构造器能找到）
    // 以下是后加的规则（顺序在前面的规则之后，旧存档的选项编号不变）
    '偶数的一半也是偶数': (n) => n % 2 !== 0 || (n / 2) % 2 === 0,      // 不成立：n = 2 时一半是 1
    '2n+1 是质数': (n) => isPrime(2 * n + 1),                           // 不成立：n = 4 时 9
    '4n+1 是质数': (n) => isPrime(4 * n + 1),                           // 不成立：n = 2 时 9
    '1+2+…+n 小于 n²': (n) => { let s = 0; for (let i = 1; i <= n; i++) s += i; return s < n * n; }, // 不成立：n = 1 时 1 不小于 1
    '质数 n 使 n²+2 也是质数': (n) => !isPrime(n) || isPrime(n * n + 2), // 不成立：n = 2 时 6
  };
  const RULE_NAMES = Object.keys(RULES).concat(['自己写的规则']);
  const CUSTOM = RULE_NAMES.length - 1;   // 最后一个选项：用“自定义规则”文本框里写的规则
  // 规则的选项顺序固定：0 平方不小于本身，1 偶数（≥4）是两个质数之和，2 2ⁿ 大于 n，3 质数都是奇数，其余见上
  // 枚举器的全集（可选）
  const SETS = {
    '两个骰子（36 种）': { items: (() => { const r = []; for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) r.push([a, b]); return r; })(), value: (x) => x[0] + x[1] },
    '两枚硬币（4 种，数正面）': { items: (() => { const r = []; for (let a = 0; a <= 1; a++) for (let b = 0; b <= 1; b++) r.push([a, b]); return r; })(), value: (x) => x[0] + x[1] },
    '三个骰子（216 种）': { items: (() => { const r = []; for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) for (let c = 1; c <= 6; c++) r.push([a, b, c]); return r; })(), value: (x) => x[0] + x[1] + x[2] },
  };
  const SET_NAMES = Object.keys(SETS);

  // 归纳阶梯：每个式子用多项式写出 S(n)（前 n 项的和）和第 n 项 t(n)。
  // 第 k 级推第 k+1 级，就是恒等式 S(n+1) − S(n) − t(n+1) = 0，对所有 n 成立（symbolic），不靠具体数。
  // S(n) 是前 n 项的和，t(n) 是第 n 项。式子直接写成文字（分式、指数式都可以，见 js/core/seq.js）。
  const INDUCT_DEFS = {
    '1+3+…+(2n−1) = n²': { S: 'n^2', t: '2n-1' },
    '1+2+…+n = n(n+1)/2': { S: 'n(n+1)/2', t: 'n' },
    '2+4+…+2n = n(n+1)': { S: 'n(n+1)', t: '2n' },
    '1+2+4+…+2^(n−1) = 2^n − 1': { S: '2^n-1', t: '2^(n-1)' },
  };
  const INDUCT_NAMES = Object.keys(INDUCT_DEFS);
  const atN = (poly, k) => P.evalQ(poly, { n: Q(k) });
  const INDUCT = {};
  for (const name of INDUCT_NAMES) {
    const S = U.Seq.parse(INDUCT_DEFS[name].S), t = U.Seq.parse(INDUCT_DEFS[name].t);
    const identity = U.Seq.sub(U.Seq.sub(U.Seq.shift(S), S), U.Seq.shift(t));
    INDUCT[name] = {
      identity: identity.length === 0,
      base: () => U.Seq.at(S, 1).n === U.Seq.at(t, 1).n && U.Seq.at(S, 1).d === U.Seq.at(t, 1).d,
      step: (k) => U.Q.eq(U.Q.add(U.Seq.at(S, k), U.Seq.at(t, k + 1)), U.Seq.at(S, k + 1)),
    };
  }

  const sc = (c) => (c.props && c.props.rule ? RULE_NAMES[c.props.rule] : RULE_NAMES[0]);
  // 规则函数：选了预设规则就用预设，选了“自己写的规则”就编译文本框里的规则（写错时抛出说明）
  const ruleOf = (c) => (c.props.rule === CUSTOM ? U.Seq.compileRule(c.props.custom) : RULES[sc(c)]);

  // 扫描（纯计算，不记事件）：返回 { found, counter, checked }
  const scan = (from, to, pred) => {
    let checked = 0;
    for (let n = from; n <= to; n++) { checked++; if (!pred(n)) return { found: true, counter: n, checked }; }
    return { found: false, counter: null, checked };
  };

  // 结论的提示：被推翻 → 红色拒绝；证据到 ② 以上 → 绿色；其余只是信息。注意 refuted 和 lv 都是 {kind,data} 形式
  const verdict = (c, out) => {
    const ref = !!(out.refuted && out.refuted.data), lv = out.lv ? Number(out.lv.data.n / out.lv.data.d) : 0;
    c.say(ref ? 'warn' : lv >= 2 ? 'ok' : 'info', out.text);
    return out;
  };

  U.registerPack({
    id: 'proof', version: 1,
    types: {
      // ---------------- 猜想板：把一条发现写成“如果……那么……”，等级 ①（记录）----------------
      conjecture_board: {
        essence: ['E1', 'E6'],
        label: '猜想板', prefix: '猜', group: '关系', grades: [5, 9], alias: ['猜想', '假设', '记下来'],
        props: {
          text: { type: 'text', label: '猜想（如果……那么……）', default: '如果 n 是偶数，那么 n+2 也是偶数' },
          ok: { type: 'bool', label: '我已经验证过例子', default: false },
          who: { type: 'text', label: '谁提的', default: '我' },
        },
        outputs: { lv: { dim: null, kind: 'num', label: '证据等级' }, refuted: { dim: null, kind: 'bool', label: '被推翻' } },
        icon: () => K.rect(10, 8, 44, 28, { stroke: 'var(--ink)', r: 3 }) + K.text(32, 27, '?', { size: 18, weight: 700 }),
        size: () => [220, 110],
        compute: (c) => verdict(c, { lv: num(Q(c.props.ok ? 1 : 0)), refuted: U.val('bool', false), text: '猜想：' + c.props.text + '（还没有证据，只是记录）' }),
        badge: (c) => '猜想',
        draw: (c) => K.text(c.w / 2, c.h / 2 + 6, c.props.text.slice(0, 18), { size: 12, weight: 700 }),
      },

      // ---------------- 参数扫描器：在 [从, 到] 的每个整数上检查规则，没有例外 → ② ----------------
      scanner: {
        essence: ['E6', 'E8'],
        label: '参数扫描器', prefix: '扫', group: '关系', grades: [5, 9], alias: ['扫描', '试很多个', '范围'],
        props: {
          rule: { type: 'choice', label: '检查的规则', default: 0, choices: RULE_NAMES },
          custom: { type: 'text', label: '自己写的规则（如 2n+1 是质数，或 2^n > n）', default: '2n+1 是质数' },
          from: { type: 'int', label: '从', default: 1, min: -50, max: 50 },
          to: { type: 'int', label: '到', default: 100, min: 1, max: 1000 },
        },
        outputs: {
          lv: { dim: null, kind: 'num', label: '证据等级' }, refuted: { dim: null, kind: 'bool', label: '被推翻' },
          checked: { dim: null, kind: 'num', label: '检查了几个' }, counter: { dim: null, kind: 'num', label: '第一个例外' },
        },
        icon: () => K.line(8, 30, 56, 30, { w: 2 }) + [14, 26, 38, 50].map((x) => K.circle(x, 22, 3, { fill: 'var(--accent)' })).join(''),
        size: () => [220, 120],
        compute: (c) => {
          let pred; try { pred = ruleOf(c); } catch (e) { c.say('reject', '规则写不对：' + e.message); return {}; }
          const r = scan(c.props.from, c.props.to, pred);
          if (r.found) return verdict(c, { lv: num(Q(0)), refuted: U.val('bool', true), checked: num(Q(r.checked)), counter: num(Q(r.counter)), text: '在 ' + c.props.from + ' 到 ' + c.props.to + ' 里找到例外：' + r.counter + '，结论被推翻' });
          return verdict(c, { lv: num(Q(2)), refuted: U.val('bool', false), checked: num(Q(r.checked)), counter: num(Q(-1)), text: '在 ' + c.props.from + ' 到 ' + c.props.to + ' 里没找到例外（' + r.checked + ' 个）' });
        },
        badge: (c) => (c.out.lv ? '②' : ''),
        draw: (c) => K.text(c.w / 2, c.h / 2 + 4, sc(c), { size: 12 }) + K.text(c.w / 2, c.h - 12, c.props.from + ' .. ' + c.props.to, { size: 11, fill: 'var(--dim)' }),
      },

      // ---------------- 反例构造器：在范围里找反例，找到就推翻并把它摆出来 ----------------
      counterex: {
        essence: ['E6', 'E8'],
        label: '反例构造器', prefix: '反', group: '关系', grades: [5, 9], alias: ['反例', '推翻', '找例外'],
        props: {
          rule: { type: 'choice', label: '要推翻的规则', default: 2, choices: RULE_NAMES },
          custom: { type: 'text', label: '自己写的规则（如 2n+1 是质数，或 2^n > n）', default: '2n+1 是质数' },
          from: { type: 'int', label: '从', default: 1, min: -50, max: 50 },
          to: { type: 'int', label: '到', default: 50, min: 1, max: 1000 },
        },
        outputs: {
          lv: { dim: null, kind: 'num', label: '证据等级' }, refuted: { dim: null, kind: 'bool', label: '被推翻' },
          counter: { dim: null, kind: 'num', label: '反例' },
        },
        icon: () => K.text(32, 28, '✕', { size: 26, weight: 700, fill: 'var(--bad)' }),
        size: () => [200, 110],
        compute: (c) => {
          let pred; try { pred = ruleOf(c); } catch (e) { c.say('reject', '规则写不对：' + e.message); return {}; }
          const r = scan(c.props.from, c.props.to, pred);
          if (r.found) return verdict(c, { lv: num(Q(0)), refuted: U.val('bool', true), counter: num(Q(r.counter)), text: '反例找到了：' + r.counter + '，猜想被推翻' });
          return verdict(c, { lv: num(Q(2)), refuted: U.val('bool', false), counter: num(Q(-1)), text: '在范围里没有找到反例，证据到 ②' });
        },
        badge: (c) => (c.out.refuted && c.out.refuted.data ? '推翻' : ''),
        draw: (c) => K.text(c.w / 2, c.h / 2 + 4, sc(c), { size: 12 }),
      },

      // ---------------- 系统枚举器：列出两个骰子的全部 36 种情况，检查和为某个数的有几种 ----------------
      enumerator: {
        essence: ['E1', 'E2'],
        label: '系统枚举器', prefix: '枚', group: '统计与概率', grades: [5, 9], alias: ['列全', '全部情况', '枚举'],
        props: {
          set: { type: 'choice', label: '全部情况', default: 0, choices: SET_NAMES },
          target: { type: 'int', label: '和是几', default: 7, min: 0, max: 18 },
          expected: { type: 'int', label: '应有几种情况', default: 36, min: 1, max: 216 },
          show: { type: 'bool', label: '列出每一种', default: false },
        },
        outputs: {
          lv: { dim: null, kind: 'num', label: '证据等级' }, count: { dim: null, kind: 'num', label: '和为目标的情况数' },
          total: { dim: null, kind: 'num', label: '全部情况数' },
        },
        icon: () => [[12, 14], [32, 14], [52, 14], [12, 30], [32, 30], [52, 30]].map(([x, y]) => K.circle(x, y, 3, { fill: 'var(--ink)' })).join(''),
        size: () => [200, 110],
        compute: (c) => {
          const S = SETS[SET_NAMES[c.props.set]] || SETS[SET_NAMES[0]];
          const hit = S.items.filter((x) => S.value(x) === c.props.target).length;
          const complete = S.items.length === c.props.expected;
          const lv = complete ? 3 : 1;
          return verdict(c, { lv: num(Q(lv)), refuted: U.val('bool', false), count: num(Q(hit)), total: num(Q(S.items.length)),
            text: '列出 ' + S.items.length + ' 种情况，' + '和为 ' + c.props.target + ' 的有 ' + hit + ' 种' + (complete ? '（列全了，证据到 ③）' : '（应有 ' + c.props.expected + ' 种，没列全）') });
        },
        badge: (c) => (c.out.count ? c.out.count.data.n + ' 种' : ''),
        draw: (c) => K.text(c.w / 2, c.h / 2 + 4, '和为 ' + c.props.target + ' 的情况', { size: 12 }),
      },

      // ---------------- 不变量追踪器：一个变换前后某个量是否不变（单独不给等级）----------------
      invariant: {
        essence: ['E5'],
        label: '不变量追踪器', prefix: '变', group: '关系', grades: [5, 9], alias: ['不变', '守恒', '变换'],
        props: {
          change: { type: 'int', label: '变换加上多少', default: 3, min: -20, max: 20 },
          times: { type: 'int', label: '变换几次', default: 4, min: 0, max: 20 },
          start: { type: 'num', label: '起点', default: 5, min: -50, max: 50, step: 1 },
        },
        outputs: {
          lv: { dim: null, kind: 'num', label: '证据等级' }, refuted: { dim: null, kind: 'bool', label: '被推翻' },
          kept: { dim: null, kind: 'bool', label: '每次都不变吗' }, end: { dim: null, kind: 'num', label: '最后的值' },
        },
        icon: () => K.line(10, 30, 54, 30, { w: 2 }) + K.line(44, 24, 54, 30, { w: 2 }) + K.text(32, 20, '不变', { size: 11 }),
        size: () => [200, 110],
        compute: (c) => {
          let v = Q.fromNumber(c.props.start);
          const sums = [v];
          for (let i = 0; i < c.props.times; i++) { v = Q.add(v, Q.fromNumber(c.props.change)); sums.push(v); }
          const kept = sums.every((s) => Q.eq(s, sums[0]));
          return verdict(c, { lv: num(Q(0)), refuted: U.val('bool', false), kept: U.val('bool', kept), end: num(v),
            text: kept ? '每次变换后这个量都不变' : '这个量变了：从 ' + Q.show(sums[0]) + ' 变到 ' + Q.show(v) + '，它不是不变量（不给证据等级）' });
        },
        badge: (c) => (c.out.kept ? (c.out.kept.data ? '不变' : '变了') : ''),
        draw: (c) => K.text(c.w / 2, c.h / 2 + 4, '每次 +' + c.props.change, { size: 12 }),
      },

      // ---------------- 证明脚手架：三步推理，每步引用台面上已验证的事实（输入口 a、b、c），全部填完 → ④ ----------------
      scaffold: {
        essence: ['E4', 'E5'],
        label: '证明脚手架', prefix: '证', group: '关系', grades: [6, 9], alias: ['证明', '推理', '步骤'],
        late: true,
        props: {
          s1: { type: 'text', label: '第一步', default: '设 n 是偶数，写成 n = 2k' },
          r1: { type: 'text', label: '第一步的依据（台面上选一条事实）', default: '', control: 'fact' },
          s2: { type: 'text', label: '第二步', default: 'n + 2 = 2k + 2 = 2(k + 1)' },
          r2: { type: 'text', label: '第二步的依据（台面上选一条事实）', default: '', control: 'fact' },
          s3: { type: 'text', label: '第三步', default: '所以 n + 2 是偶数' },
          r3: { type: 'text', label: '第三步的依据（台面上选一条事实）', default: '', control: 'fact' },
        },
        outputs: { lv: { dim: null, kind: 'num', label: '证据等级' }, filled: { dim: null, kind: 'num', label: '填完的步数' }, refuted: { dim: null, kind: 'bool', label: '被推翻' } },
        icon: () => [0, 1, 2].map((i) => K.rect(8 + i * 18, 14 + i * 4, 14, 14, { stroke: 'var(--ink)', r: 2 })).join(''),
        size: () => [230, 130],
        compute: (c) => {
          // 依据必须是台面上真正成立的事实（选出来的事实在台面上不成立，这一步不算）
          const steps = [1, 2, 3].map((i) => ({ text: c.props['s' + i], ref: c.props['r' + i] && c.fact && c.fact(c.props['r' + i]) ? c.props['r' + i] : '' }));
          const r = E.proof(steps);
          const lv = r.complete ? 4 : 1;
          return verdict(c, { lv: num(Q(lv)), refuted: U.val('bool', false), filled: num(Q(r.filled)),
            text: '证明：填完 ' + r.filled + ' / ' + r.steps + ' 步' + (r.complete ? '，每一步的依据都是台面上成立的事实，证据到 ④' : '，还有步骤的依据没有成立') });
        },
        badge: (c) => (c.out.filled ? c.out.filled.data.n + '/3 步' : ''),
        draw: (c) => K.text(c.w / 2, c.h / 2 + 4, '证明', { size: 14, weight: 700 }),
      },

      // ---------------- 归纳阶梯：起点成立 + 每一级推下一级（检查 1 到 upto），全部成立 → ④ ----------------
      induction: {
        essence: ['E6', 'E4'],
        label: '归纳阶梯', prefix: '阶', group: '关系', grades: [7, 9], alias: ['归纳', '数学归纳法', '一级一级'],
        props: {
          rule: { type: 'choice', label: '要证明的式子', default: 0, choices: INDUCT_NAMES },
          upto: { type: 'int', label: '检查到第几级', default: 20, min: 2, max: 200 },
          base: { type: 'bool', label: '第一级成立（已验证）', default: true },
        },
        outputs: {
          lv: { dim: null, kind: 'num', label: '证据等级' }, refuted: { dim: null, kind: 'bool', label: '被推翻' },
          failedAt: { dim: null, kind: 'num', label: '推不下去的那一级' },
          identity: { dim: null, kind: 'bool', label: '步骤是恒等式' },
        },
        icon: () => [0, 1, 2, 3].map((i) => K.rect(6 + i * 13, 34 - i * 8, 12, 8 + i * 8, { stroke: 'var(--ink)', r: 1 })).join(''),
        size: () => [220, 120],
        compute: (c) => {
          const name = INDUCT_NAMES[c.props.rule] || INDUCT_NAMES[0];
          const d = INDUCT[name];
          const baseOk = !!c.props.base && d.base();
          const r = E.induction(baseOk, (k) => d.step(k), c.props.upto);
          const failedAt = r.failedAt === null || r.failedAt === undefined ? -1 : r.failedAt;
          const lv = r.complete ? 4 : 1;
          return verdict(c, { lv: num(Q(lv)), refuted: U.val('bool', false), failedAt: num(Q(failedAt)),
            identity: U.val('bool', d.identity),
            text: r.complete ? name + ' 对所有检查的级都成立，证据到 ④（起点与每一级推下一级都已验证' + (d.identity ? '；且 S(n+1) − S(n) = 第 n+1 项 是恒等式' : '') + '）' : (baseOk ? '第 ' + failedAt + ' 级推不下去' : '起点（第一级）没有验证') });
        },
        badge: (c) => (c.out.lv ? '④' : ''),
        draw: (c) => K.text(c.w / 2, c.h / 2 + 4, INDUCT_NAMES[c.props.rule] || '', { size: 11 }),
      },
    },
  });
  // 台面上的事实（证明脚手架的依据从这里选）：布尔输出，以及证据等级输出（≥ ② 算成立）
  U.Facts = {
    list(scene, D) {
      const out = [];
      for (const e of Object.values(scene.entities)) {
        const node = D && D[e.id]; if (!node) continue;
        for (const port of Object.keys(node.out || {})) {
          const v = node.out[port];
          if (!v) continue;
          if (v.kind === 'bool') out.push({ key: e.id + '.' + port, label: e.name + '：' + U.kit.esc(port) + ' = ' + (v.data ? '是' : '否'), verified: v.data === true });
          else if (v.kind === 'num' && port === 'lv') out.push({ key: e.id + '.' + port, label: e.name + '：证据等级 ' + (v.data.n / v.data.d), verified: v.data.n / v.data.d >= 2 });
        }
      }
      return out;
    },
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
