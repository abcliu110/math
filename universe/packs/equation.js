/* 器材包 equation：方程与不等式，重新设计过的一套。
 *   以前：方程台一台管六件事（写方程、变形、解、判恒等式、两个二次根），六个口挤在一张卡上；解方程的器材有八台，各管一摊，
 *         互相接不上（四台能产出“方程”，只有两台能收）；“解”和“不等式”只能手填 a、b、c。
 *   现在：只有一种“方程”值（左边、关系、右边；关系可以是 = < > ≤ ≥，所以不等式不再单独做一台），每台器材只做一件事：
 *     方程卡（写）→ 变形（两边同时做一件事）→ 解（得到解集）→ 解集数轴（画出来）；验根（代一个数进去看成不看成立）；方程组（两个方程解出 x、y）。
 *   “解集”是统一的结果：几个孤立的解（含 1 ± √2 这样的精确根）、一个区间、所有数、无解。它能自动变成数（只有一个解时）或区间，
 *   所以可以直接接读数器、解集数轴、选择器、扫描变量……
 *   旧的方程台、方程组台、解方程、不等式四台器材还在（旧存档和旧题照样能打开），但不再放在器材架上。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit, P = U.Poly, E = U.Eqn, S = U.Solset;
  const OPS = ['两边同时加', '两边同时减', '两边同时乘', '两边同时除以'];
  const OPKEY = ['add', 'sub', 'mul', 'div'];
  const REL_TEXT = { '=': '等于', '<': '小于', '>': '大于', '≤': '小于或等于', '≥': '大于或等于' };

  // 一整行文字 → 方程：“2x + 1 = 7”“3x − 5 ≥ x + 1”“x^2 = 2”。等号或不等号恰好一个
  const parseEqn = (text) => {
    const s = String(text).replace(/[−–—]/g, '-').replace(/<=|≦|⩽/g, '≤').replace(/>=|≧|⩾/g, '≥').replace(/＝/g, '=').replace(/＜/g, '<').replace(/＞/g, '>');
    const marks = s.match(/[=<>≤≥]/g);
    if (!marks) throw new Error('要写一个等号或不等号（=、<、>、≤、≥）');
    if (marks.length > 1) throw new Error('只能有一个等号或不等号');
    const i = s.search(/[=<>≤≥]/);
    return E.make(P.parse(s.slice(0, i)), P.parse(s.slice(i + 1)), s[i]);
  };
  const eqnIn = (c, port) => { const v = K.first(c.inp[port]); return v && v.kind === 'eqn' ? v.data : null; };
  const showEq = (e) => U.KINDS.eqn.show(e);
  // 未知数：用学生填的；填的字母方程里没有、而方程里恰好只有一个字母，就自动用那个字母（不让一个字母名挡住整台器材）
  const pickVar = (e, want) => {
    const vars = P.vars(E.diff(e)).concat(P.vars(e.lhs), P.vars(e.rhs));
    const uniq = vars.filter((v, i) => vars.indexOf(v) === i);
    const w = String(want || '').trim();
    if (w && uniq.includes(w)) return w;
    if (uniq.length === 1) return uniq[0];
    return w || 'x';
  };
  const holds = (rel, cmp) => (rel === '=' ? cmp === 0 : rel === '<' ? cmp < 0 : rel === '>' ? cmp > 0 : rel === '≤' ? cmp <= 0 : cmp >= 0);

  U.registerPack({
    id: 'equation', version: 1, needs: ['core@1', 'algebra@1'],
    types: {
      // ---------------- 方程卡：整行写出方程或不等式 ----------------
      eqcard: {
        workspaceRole: 'none',
        handles: true,
        essence: ['E4', 'E8'],
        label: '方程卡', prefix: '程', group: '关系', grades: [6, 9], alias: ['方程', '不等式', '等式', '写方程', '解方程'],
        props: {
          text: { type: 'text', label: '方程或不等式', default: '2x + 1 = 7' },
          name: { type: 'text', label: '名字', default: '' },
        },
        lint: { minProps: 2, why: '方程卡只需要一行方程和一个名字' },
        outputs: { eq: { dim: null, kind: 'eqn', label: '方程' } },
        icon: () => K.text(32, 30, '2x=7', { size: 15, weight: 700 }),
        size: () => [230, 90],
        compute: (c) => {
          try {
            const e = parseEqn(c.props.text);
            c.say('ok', showEq(e));
            if (c.step) c.step('写出方程：' + showEq(e), null, 'eq.both-sides');
            return { eq: U.val('eqn', e) };
          } catch (err) { c.say('reject', err.message); return {}; }
        },
        badge: (c) => (c.out.eq ? showEq(c.out.eq.data) : ''),
        draw: (c) => K.text(c.w / 2, c.h / 2 + 8, c.out.eq ? showEq(c.out.eq.data) : c.props.text, { size: 20, weight: 700 }),
      },

      // ---------------- 变形：两边同时做同一件事 ----------------
      eqstep: {
        workspaceRole: 'none',
        handles: true,
        essence: ['E4'],
        label: '变形', prefix: '变', group: '关系', grades: [6, 9], alias: ['移项', '两边同时', '等式的性质', '化简'],
        props: {
          op: { type: 'choice', label: '两边同时', default: 0, choices: OPS },
          by: { type: 'text', label: '做多少（数或式子）', default: '1' },
          name: { type: 'text', label: '名字', default: '' },
        },
        inputs: { eq: { kind: 'eqn', label: '方程' } },
        outputs: { eq: { dim: null, kind: 'eqn', label: '新方程' } },
        icon: () => K.text(32, 28, '+1 ⇒', { size: 16, weight: 700 }),
        size: () => [230, 110],
        compute: (c) => {
          const e = eqnIn(c, 'eq');
          if (!e) { c.say('info', '接一个方程'); return {}; }
          let by; try { by = P.parse(String(c.props.by)); } catch (err) { c.say('reject', '「做多少」要写数或式子：' + err.message); return {}; }
          const r = E.apply(e, { op: OPKEY[c.props.op], by });
          if (r.error) { c.say('reject', r.error); return {}; }
          if (c.step) c.step(r.say + '，得 ' + showEq(r.eqn), null, r.rule);
          c.say('ok', r.say);
          return { eq: U.val('eqn', r.eqn) };
        },
        badge: (c) => (c.out.eq ? showEq(c.out.eq.data) : ''),
        draw: (c) => K.text(c.w / 2, 38, OPS[c.props.op] + ' ' + c.props.by, { size: 13, fill: 'var(--dim)' }) +
          K.text(c.w / 2, c.h / 2 + 16, c.out.eq ? showEq(c.out.eq.data) : '…', { size: 18, weight: 700 }),
      },

      // ---------------- 解：方程或不等式 → 解集 ----------------
      solve: {
        workspaceRole: 'none',
        handles: true,
        essence: ['E4', 'E8'],
        label: '解', prefix: '解', group: '关系', grades: [6, 9], alias: ['解方程', '解不等式', '求解', '解集', '根', '二次方程'],
        props: {
          var: { type: 'text', label: '未知数', default: 'x' },
          check: { type: 'bool', label: '代回去检验', default: true },
          name: { type: 'text', label: '名字', default: '' },
        },
        inputs: { eq: { kind: 'eqn', label: '方程' } },
        outputs: {
          set: { dim: null, kind: 'solset', label: '解集' },
          x: { dim: null, kind: 'num', label: '解' },
        },
        icon: () => K.text(32, 30, 'x = ?', { size: 17, weight: 700 }),
        size: () => [230, 110],
        compute: (c) => {
          const e = eqnIn(c, 'eq');
          if (!e) { c.say('info', '接一个方程'); return {}; }
          const v = pickVar(e, c.props.var);
          const r = E.solve(e, v);
          if (r.kind === 'error') { c.say('info', r.why); return {}; }
          if (c.step) r.steps.forEach((s) => c.step(s.say, null, s.rule));
          const ap = S.approx(r.set), ex = ap ? { exact: false } : {};   // 数值求出的近似根：结果标近似
          const out = { set: U.val('solset', r.set) };   // 解集里近似根自己带 ≈，不用再整体标近似
          const q = S.single(r.set);
          if (q) {
            out.x = U.val('num', q, ex);
            if (c.props.check && e.rel === '=' && !ap) {
              const env = {}; env[v] = q;
              const l = P.evalQ(e.lhs, env), rr = P.evalQ(e.rhs, env);
              if (c.step) c.step('代回去检验：左边 = ' + Q.show(l) + '，右边 = ' + Q.show(rr) + (Q.eq(l, rr) ? '，相等' : '，不相等！'), null, 'eq.both-sides');
            }
          }
          c.say('ok', S.show(r.set));
          return out;
        },
        badge: (c) => (c.out.set ? S.show(c.out.set.data) : ''),
        draw: (c) => K.text(c.w / 2, c.h / 2 + 10, c.out.set ? S.show(c.out.set.data) : '…', { size: 20, weight: 700, fill: c.out.set ? 'var(--ink)' : 'var(--dim)' }),
      },

      // ---------------- 验根：一个数是不是这个方程的解 ----------------
      eqcheck: {
        workspaceRole: 'none',
        handles: true,
        essence: ['E4', 'E8'],
        label: '验根', prefix: '验', group: '关系', grades: [6, 9], alias: ['代入检验', '检验', '是不是解', '成立吗'],
        props: {
          var: { type: 'text', label: '未知数', default: 'x' },
          name: { type: 'text', label: '名字', default: '' },
        },
        lint: { minProps: 2, why: '验根只需要未知数的名字和一个名字' },
        inputs: { eq: { kind: 'eqn', label: '方程' }, x: { kind: 'num', label: '试的数' } },
        outputs: {
          ok: { dim: null, kind: 'bool', label: '成立' },
          gap: { dim: null, kind: 'num', label: '左 − 右' },
        },
        icon: () => K.text(32, 30, '✓?', { size: 22, weight: 700 }),
        size: () => [230, 110],
        compute: (c) => {
          const e = eqnIn(c, 'eq'), xv = K.first(c.inp.x);
          if (!e || !xv) { c.say('info', '接一个方程，再接一个要试的数'); return {}; }
          const v = pickVar(e, c.props.var), env = {}; env[v] = xv.data;
          const others = P.vars(e.lhs).concat(P.vars(e.rhs)).filter((k, i, a) => k !== v && a.indexOf(k) === i);
          if (others.length) { c.say('info', '式子里还有别的字母：' + others.join('、')); return {}; }
          const l = P.evalQ(e.lhs, env), r = P.evalQ(e.rhs, env), ok = holds(e.rel, Q.cmp(l, r));
          if (c.step) c.step('把 ' + v + ' = ' + Q.show(xv.data) + ' 代进去：左边 ' + Q.show(l) + '，右边 ' + Q.show(r) + '，' + (ok ? '成立' : '不成立'), null, 'eq.both-sides');
          c.say(ok ? 'ok' : 'info', '左边 ' + Q.show(l) + ' ' + (ok ? REL_TEXT[e.rel] : '不' + REL_TEXT[e.rel]) + ' 右边 ' + Q.show(r));
          return { ok: U.val('bool', ok), gap: U.val('num', Q.sub(l, r)) };
        },
        badge: (c) => (c.out.ok ? (c.out.ok.data ? '成立' : '不成立') : ''),
        draw: (c) => K.text(c.w / 2, c.h / 2 + 12, c.out.ok ? (c.out.ok.data ? '✓ 成立' : '✗ 不成立') : '…', { size: 22, weight: 700, fill: c.out.ok ? (c.out.ok.data ? 'var(--good)' : 'var(--bad)') : 'var(--dim)' }),
      },

      // ---------------- 方程组：两个方程 → x、y ----------------
      eqsys: {
        workspaceRole: 'none',
        handles: true,
        essence: ['E4', 'E8'],
        label: '方程组', prefix: '组', group: '关系', grades: [7, 9], alias: ['二元一次', '消元', '联立', '方程组'],
        props: {
          x: { type: 'text', label: '第一个未知数', default: 'x' },
          y: { type: 'text', label: '第二个未知数', default: 'y' },
          z: { type: 'text', label: '第三个未知数（三个方程时用）', default: 'z' },
          name: { type: 'text', label: '名字', default: '' },
        },
        inputs: { eqs: { kind: 'eqn', many: true, label: '方程' } },
        outputs: {
          x: { dim: null, kind: 'num', label: '第一个解' },
          y: { dim: null, kind: 'num', label: '第二个解' },
          z: { dim: null, kind: 'num', label: '第三个解' },
        },
        icon: () => K.text(32, 24, '{', { size: 28 }) + K.text(42, 32, 'x,y', { size: 12, weight: 700 }),
        size: () => [230, 110],
        compute: (c) => {
          const es = (c.inp.eqs || []).filter((v) => v && v.kind === 'eqn').map((v) => v.data);
          if (es.length < 2) { c.say('info', '接两个方程（三个未知数就接三个）'); return {}; }
          if (es.length >= 3) {   // 三元一次方程组：高斯消元
            const three = es.slice(0, 3), names = [].concat(...three.map((e) => P.vars(e.lhs).concat(P.vars(e.rhs)))).filter((k, i, a) => a.indexOf(k) === i).sort();
            if (names.length !== 3) { c.say('info', '三个方程要正好三个未知数，现在是 ' + names.length + ' 个：' + names.join('、')); return {}; }
            let vs = [String(c.props.x).trim() || 'x', String(c.props.y).trim() || 'y', String(c.props.z).trim() || 'z'];
            if (!vs.every((v) => names.includes(v)) || new Set(vs).size !== 3) vs = names;   // 字母名对不上，就用方程里实际的三个字母
            const r3 = E.solveLinearSystem(three, vs);
            if (r3.kind === 'error') { c.say('info', r3.why); return {}; }
            if (c.step) r3.steps.forEach((s) => c.step(s.say, null, s.rule));
            if (r3.kind !== 'solution') { c.say('info', '没有唯一的解（有的方程是别的方程的组合，或者互相矛盾）'); return {}; }
            c.say('ok', vs.map((v, i) => v + ' = ' + Q.show(r3.values[i])).join('，'));
            return { x: U.val('num', r3.values[0]), y: U.val('num', r3.values[1]), z: U.val('num', r3.values[2]) };
          }
          const all = [].concat(...es.slice(0, 2).map((e) => P.vars(e.lhs).concat(P.vars(e.rhs)))).filter((k, i, a) => a.indexOf(k) === i).sort();
          let x = String(c.props.x).trim() || 'x', y = String(c.props.y).trim() || 'y';
          if (all.length === 2 && !(all.includes(x) && all.includes(y))) { x = all[0]; y = all[1]; }   // 字母名对不上，就用方程里实际的两个字母
          const r = E.solveSystem2(es[0], es[1], x, y);
          if (r.kind === 'error') { c.say('info', r.why); return {}; }
          if (c.step) r.steps.forEach((s) => c.step(s.say, null, s.rule));
          if (r.kind !== 'solution') { c.say('info', '没有唯一的解（两个方程重合，或者互相矛盾）'); return {}; }
          c.say('ok', x + ' = ' + Q.show(r.x) + '，' + y + ' = ' + Q.show(r.y));
          return { x: U.val('num', r.x), y: U.val('num', r.y) };
        },
        badge: (c) => (c.out.x && c.out.y ? Q.show(c.out.x.data) + '，' + Q.show(c.out.y.data) + (c.out.z ? '，' + Q.show(c.out.z.data) : '') : ''),
        draw: (c) => K.text(c.w / 2, c.h / 2 + 10, c.out.x && c.out.y ? 'x=' + Q.show(c.out.x.data) + '  y=' + Q.show(c.out.y.data) + (c.out.z ? '  z=' + Q.show(c.out.z.data) : '') : '…', { size: 20, weight: 700 }),
      },

      // ---------------- 解集运算：交（不等式组）、并、补、甲减乙 ----------------
      setop: {
        workspaceRole: 'none', handles: true, essence: ['E8', 'E4'],
        label: '解集运算', prefix: '集', group: '关系', grades: [7, 9], alias: ['不等式组', '交集', '并集', '补集', '公共部分', '同时成立', '至少一个成立'],
        props: {
          op: { type: 'choice', label: '运算', default: 0, choices: ['交（同时成立）', '并（至少一个成立）', '甲之外', '甲减乙'] },
          label: { type: 'text', label: '标签', default: '' },
        },
        lint: { minProps: 2, why: '解集运算只有“运算”和标签两个属性' },
        inputs: { a: { kind: 'solset', label: '甲' }, b: { kind: 'solset', label: '乙' } },
        outputs: { set: { dim: null, kind: 'solset', label: '结果' } },
        icon: () => K.circle(24, 32, 14, { stroke: 'var(--ink)', w: 2 }) + K.circle(40, 32, 14, { stroke: 'var(--ink)', w: 2 }),
        size: () => [230, 110],
        compute: (c) => {
          const a = K.first(c.inp.a), b = K.first(c.inp.b), S = U.Solset;
          if (!a) { c.say('info', '接一个解集作甲'); return {}; }
          const op = c.props.op;
          if (op === 2) return { set: U.val('solset', S.complement(a.data)) };
          if (!b) { c.say('info', '再接一个解集作乙'); return {}; }
          const A = a.data, B = b.data;
          const r = op === 0 ? S.intersect(A, B) : op === 1 ? S.union(A, B) : S.intersect(A, S.complement(B));
          c.say('ok', S.show(r));
          return { set: U.val('solset', r) };
        },
        badge: (c) => (c.out.set ? U.showVal(c.out.set) : ''),
        draw: (c) => K.text(c.w / 2, c.h / 2 + 6, c.out.set ? U.showVal(c.out.set) : '—', { size: 16, weight: 700, fill: c.out.set ? 'var(--ink)' : 'var(--dim)' }),
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
