/* 器材包 algebra：代数式与方程（任务 B.4，见 next-steps.md §3.4）。
 * 代数式卡 → poly；方程台 / 代入器 / 方程组台 / 不等式数轴 之间用 poly、eqn、interval 连线。
 * 每一步变形都通过 c.step 记下来（来历追踪）。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit, P = U.Poly, E = U.Eqn, I = U.Interval;
  const RELS = ['=', '<', '>', '≤', '≥'];
  const OPS = ['两边同时加', '两边同时减', '两边同时乘', '两边同时除以'];

  const polyOf = (c, port) => { const v = K.first(c.inp[port]); return v && v.kind === 'poly' ? v.data : v && v.kind === 'num' ? P.const(v.data) : null; };
  const eqnOf = (c, port) => { const v = K.first(c.inp[port]); return v && v.kind === 'eqn' ? v.data : null; };
  const ivOf = (c, port) => { const v = K.first(c.inp[port]); return v && v.kind === 'interval' ? v.data : null; };

  U.registerPack({
    id: 'algebra', version: 1,
    types: {
      // ---------------- 代数式卡：输入一个式子（有字母），输出多项式 ----------------
      algebra: {
        essence: ['E8', 'E2'],
        label: '代数式卡', prefix: '式', group: '数与运算', grades: [6, 9], alias: ['式子', '整式', '多项式'],
        props: {
          text: { type: 'text', label: '式子', default: 'x + 1' },
          name: { type: 'text', label: '名字', default: '' },
          show: { type: 'choice', label: '写法', default: 0, choices: ['按次数降序', '原样'] },
        },
        outputs: { p: { dim: null, kind: 'poly', label: '代数式' } },
        icon: () => K.text(32, 28, 'x²+1', { size: 16, weight: 700 }),
        size: () => [180, 100],
        compute: (c) => {
          try {
            const p = P.parse(c.props.text);
            c.say('ok', '式子 ' + P.show(p));
            if (c.step) c.step('整理成标准形式：' + P.show(p), null, 'eq.both-sides');
            return { p: U.val('poly', p) };
          } catch (e) { c.say('reject', e.message); return {}; }
        },
        badge: (c) => (c.out.p ? P.show(c.out.p.data) : ''),
        draw: (c) => K.text(c.w / 2, c.h / 2 + 6, c.out.p ? P.show(c.out.p.data) : c.props.text, { size: 18, weight: 700 }),
      },

      // ---------------- 方程台：两个式子 → 方程；两边同时做一件事 ----------------
      eqdesk: {
        essence: ['E4', 'E8'],
        label: '方程台', prefix: '程', group: '关系', grades: [6, 9], alias: ['解方程', '等式变形'],
        props: {
          rel: { type: 'choice', label: '关系', default: 0, choices: RELS },
          op: { type: 'choice', label: '两边同时', default: 0, choices: OPS },
          by: { type: 'num', label: '做多少', default: 1, min: -50, max: 50, step: 1 },
          var: { type: 'text', label: '未知数', default: 'x' },
        },
        inputs: { L: { kind: 'poly', label: '左边' }, R: { kind: 'poly', label: '右边' } },
        outputs: {
          eq: { dim: null, kind: 'eqn', label: '方程' },
          x: { dim: null, kind: 'num', label: '解' },
          iv: { dim: null, kind: 'interval', label: '解集（区间）' },
          ident: { dim: null, kind: 'bool', label: '恒等式' },
          r1: { dim: null, kind: 'real', label: '二次方程的第一个根（精确）' },
          r2: { dim: null, kind: 'real', label: '二次方程的第二个根（精确）' },
        },
        icon: () => K.text(32, 28, '=', { size: 26, weight: 700 }),
        size: () => [200, 110],
        compute: (c) => {
          const L = polyOf(c, 'L'), R = polyOf(c, 'R');
          if (!L || !R) { c.say('info', '接左边和右边两个式子'); return {}; }
          let e = E.make(L, R, RELS[c.props.rel]);
          const by = Q.fromNumber(c.props.by);
          if (c.props.op >= 2) {
            const r = E.apply(e, { op: c.props.op === 2 ? 'mul' : 'div', by: P.const(by) });
            if (r.error) { c.say('reject', r.error); return {}; }
            e = r.eqn; if (c.step) c.step(r.say, null, r.rule);
          } else {
            const r = E.apply(e, { op: c.props.op === 0 ? 'add' : 'sub', by: P.const(by) });
            e = r.eqn; if (c.step) c.step(r.say, null, r.rule);
          }
          const out = { eq: U.val('eqn', e), ident: U.val('bool', E.isIdentity(e)) };
          if (E.isIdentity(e)) c.say('ok', '恒等式：对所有取值都成立');
          const sol = E.solveLinear(e, c.props.var);
          if (sol.kind === 'solution') { out.x = U.val('num', sol.value); out.iv = U.val('interval', I.fromLinear(sol)); if (c.step) sol.steps.slice(1).forEach((s) => c.step(s.say, null, s.rule)); c.say('ok', c.props.var + ' ' + sol.rel + ' ' + Q.show(sol.value)); }
          else if (sol.kind === 'error') {
            // 不是一次式：试二次方程，给出两个精确根（可能是 1 ± √2 这样的数）
            const q = E.solveQuadratic(e, c.props.var);
            if (q.kind === 'roots') {
              out.r1 = U.val('real', q.roots[0]); out.r2 = U.val('real', q.roots[1]);
              if (c.step) q.steps.forEach((s) => c.step(s.say, null, s.rule));
              c.say('ok', c.props.var + ' 的两个根：' + U.showVal(out.r1) + '，' + U.showVal(out.r2));
            }
            else if (q.kind === 'none') c.say('info', '没有实数根（判别式小于 0）');
            // 其他情况（多个未知数、不等式）保持沉默，和原来一样：不是这台器材能解的方程
          }
          else if (sol.kind === 'all') c.say('info', '对所有 ' + c.props.var + ' 都成立');
          else if (sol.kind === 'none') c.say('info', '无解');
          return out;
        },
        badge: (c) => (c.out.eq ? U.KINDS.eqn.show(c.out.eq.data) : ''),
        draw: (c) => K.text(c.w / 2, c.h / 2 + 6, c.out.eq ? U.KINDS.eqn.show(c.out.eq.data) : '…', { size: 14, weight: 700 }),
      },

      // ---------------- 代数式读数：只接受代数式口，代入 x、y 两个字母后读出值（任务 B 遗留：有多个字母的代数式）----------------
      exprread: {
        essence: ['E8'],
        label: '代数式读数', prefix: '读', group: '数与运算', grades: [7, 9], alias: ['代数式', '多个字母', '求值'],
        props: {
          x: { type: 'num', label: 'x 等于', default: 0, min: -99, max: 99, step: 1 },
          y: { type: 'num', label: 'y 等于', default: 0, min: -99, max: 99, step: 1 },
          label: { type: 'text', label: '标签', default: '' },
        },
        lint: { minProps: 2, why: '代数式读数只需要 x、y 两个代入值和标签' },
        inputs: { e: { kind: 'expr', label: '代数式' } },
        outputs: { v: { dim: null, kind: 'num', label: '值' } },
        icon: () => K.text(32, 28, 'x,y', { size: 16, weight: 700 }),
        size: () => [170, 100],
        compute: (c) => {
          const v = K.first(c.inp.e); if (!v || v.kind !== 'expr') { c.say('info', '接一个代数式'); return {}; }
          const p = v.data, env = { x: Q.fromNumber(c.props.x), y: Q.fromNumber(c.props.y) };
          const extra = P.vars(p).filter((k) => !(k in env));
          if (extra.length) { c.say('reject', '式子里还有字母 ' + extra.join('、') + '，这台只代入 x、y'); return {}; }
          const r = P.evalQ(p, env);
          if (c.step) c.step(P.show(p) + '，代入 x = ' + c.props.x + '，y = ' + c.props.y + '，得 ' + Q.show(r), null, 'eq.both-sides');
          c.say('ok', '值是 ' + Q.show(r));
          return { v: U.val('num', r) };
        },
        badge: (c) => (c.out.v ? U.showVal(c.out.v) : ''),
        draw: (c) => K.text(c.w / 2, c.h / 2 + 6, c.out.v ? Q.show(c.out.v.data) : '…', { size: 20, weight: 700 }),
      },

      // ---------------- 代入器：把字母换成数，输出数（或真假）----------------
      subst: {
        essence: ['E8'],
        label: '代入器', prefix: '代', group: '数与运算', grades: [6, 9], alias: ['代入', '求值'],
        props: {
          var: { type: 'text', label: '字母', default: 'x' },
          value: { type: 'num', label: '代入的数', default: 0, min: -99, max: 99, step: 1 },
          check: { type: 'bool', label: '判断是否为 0', default: false },
        },
        inputs: { p: { kind: 'poly', label: '式子' } },
        outputs: { v: { dim: null, kind: 'num', label: '值' }, zero: { dim: null, kind: 'bool', label: '是 0 吗' } },
        icon: () => K.text(32, 28, 'x=2', { size: 16, weight: 700 }),
        size: () => [170, 100],
        compute: (c) => {
          const p = polyOf(c, 'p'); if (!p) { c.say('info', '接一个式子'); return {}; }
          const env = {}; for (const v of P.vars(p)) env[v] = v === c.props.var ? Q.fromNumber(c.props.value) : null;
          if (Object.values(env).some((x) => x === null)) { c.say('reject', '式子里还有别的字母，只代入「' + c.props.var + '」不够'); return {}; }
          const r = P.evalQ(p, env);
          if (c.step) c.step(P.show(p) + '，把 ' + c.props.var + ' = ' + Q.show(Q.fromNumber(c.props.value)) + ' 代入，得 ' + Q.show(r), null, 'eq.both-sides');
          c.say('ok', '值是 ' + Q.show(r));
          return { v: U.val('num', r), zero: U.val('bool', r.n === 0n) };
        },
        badge: (c) => (c.out.v ? U.showVal(c.out.v) : ''),
        draw: (c) => K.text(c.w / 2, c.h / 2 + 6, c.out.v ? Q.show(c.out.v.data) : '…', { size: 20, weight: 700 }),
      },

      // ---------------- 方程组台：两个方程 → 解 ----------------
      system2: {
        essence: ['E4', 'E8'],
        label: '方程组台', prefix: '组', group: '关系', grades: [7, 9], alias: ['二元一次', '消元'],
        props: {
          x: { type: 'text', label: '第一个未知数', default: 'x' },
          y: { type: 'text', label: '第二个未知数', default: 'y' },
          show: { type: 'choice', label: '写法', default: 0, choices: ['解出来', '只说方法'] },
        },
        inputs: { A: { kind: 'eqn', label: '方程一' }, B: { kind: 'eqn', label: '方程二' } },
        outputs: { x: { dim: null, kind: 'num', label: 'x 的值' }, y: { dim: null, kind: 'num', label: 'y 的值' } },
        icon: () => K.text(32, 24, '{', { size: 26 }) + K.text(40, 36, '=', { size: 12 }),
        size: () => [200, 110],
        compute: (c) => {
          const A = eqnOf(c, 'A'), B = eqnOf(c, 'B');
          if (!A || !B) { c.say('info', '接两个方程'); return {}; }
          const r = E.solveSystem2(A, B, c.props.x, c.props.y);
          if (r.kind === 'error') { c.say('reject', r.why); return {}; }
          if (c.step) r.steps.forEach((s) => c.step(s.say, null, s.rule));
          if (r.kind !== 'solution') { c.say('info', '没有唯一解'); return {}; }
          c.say('ok', c.props.x + ' = ' + Q.show(r.x) + '，' + c.props.y + ' = ' + Q.show(r.y));
          return { x: U.val('num', r.x), y: U.val('num', r.y) };
        },
        badge: (c) => (c.out.x && c.out.y ? c.props.x + '=' + Q.show(c.out.x.data) + '，' + c.props.y + '=' + Q.show(c.out.y.data) : ''),
        draw: (c) => K.text(c.w / 2, c.h / 2 + 6, c.out.x && c.out.y ? 'x=' + Q.show(c.out.x.data) + ' y=' + Q.show(c.out.y.data) : '…', { size: 14, weight: 700 }),
      },

      // ---------------- 不等式数轴：把解集画在数轴上 ----------------
      numline_iv: {
        essence: ['E4', 'E3'],
        label: '解集数轴', prefix: '轴', group: '关系', grades: [6, 9], alias: ['不等式', '区间', '数轴'],
        props: {
          probe: { type: 'num', label: '试一个数', default: 0, min: -20, max: 20, step: 1 },
          lo: { type: 'num', label: '画出的最小值', default: -5, min: -20, max: 20, step: 1 },
          hi: { type: 'num', label: '画出的最大值', default: 5, min: -20, max: 20, step: 1 },
        },
        inputs: { iv: { kind: 'interval', label: '解集' } },
        outputs: { inside: { dim: null, kind: 'bool', label: '试的数在解集里吗' } },
        icon: () => K.line(6, 26, 58, 26, { w: 2 }) + K.line(34, 20, 34, 32, { w: 2 }),
        size: () => [220, 100],
        compute: (c) => {
          const iv = ivOf(c, 'iv'); if (!iv) { c.say('info', '接一个解集（区间）'); return {}; }
          const inside = I.contains(iv, Q.fromNumber(c.props.probe));
          c.say(inside ? 'ok' : 'info', I.show(iv) + '；' + c.props.probe + (inside ? ' 在里面' : ' 不在里面'));
          return { inside: U.val('bool', inside) };
        },
        badge: (c) => (c.out.inside ? (c.out.inside.data ? '在里面' : '不在里面') : ''),
        draw: (c) => {
          const iv = ivOf({ inp: (c.d && c.d.inp) || {} }, 'iv'), x0 = 14, x1 = c.w - 14, y = c.h / 2 + 4, sc = (v) => x0 + (v - c.props.lo) / (c.props.hi - c.props.lo) * (x1 - x0);
          let s = K.line(x0, y, x1, y, { w: 2 });
          if (iv) {
            const a = iv.lo ? sc(Q.num(iv.lo)) : x0, b = iv.hi ? sc(Q.num(iv.hi)) : x1;
            s += K.line(a, y, b, y, { w: 6, stroke: 'var(--accent)' });
          }
          return s;
        },
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
