/* 器材包 ratio：分式卡、分式运算、分式读数（有理式，见 js/core/ratio.js）。
 * 分式卡的分子、分母用文字写（可以有多个字母）；分式运算两边都接分式口；分式读数只接分式口。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit, P = U.Poly, R = U.Ratio;

  const ratioOf = (c, port) => { const v = K.first(c.inp[port]); return v && v.kind === 'ratio' ? v.data : null; };
  const OPS = [
    { sym: '+', rule: 'frac.add', f: (a, b) => R.add(a, b) },
    { sym: '−', rule: 'op.sub', f: (a, b) => R.sub(a, b) },
    { sym: '×', rule: 'op.mul', f: (a, b) => R.mul(a, b) },
    { sym: '÷', rule: 'op.div', f: (a, b) => R.div(a, b) },
  ];

  U.registerPack({
    id: 'ratio', version: 1,
    types: {
      // ---------------- 分式卡：写上分子和分母，输出分式 ----------------
      fracnum: {
        workspaceRole: 'none',
        handles: true,
        essence: ['E8', 'E3'],
        label: '分式卡', prefix: '分', group: '数与运算', grades: [8, 9], alias: ['分式', '有理式', '分子分母'],
        props: {
          name: { type: 'text', label: '名字', default: '' },
          num: { type: 'text', label: '分子', default: 'x + 1' },
          den: { type: 'text', label: '分母', default: 'x − 1' },
        },
        outputs: { f: { dim: null, kind: 'ratio', label: '分式' } },
        icon: () => K.text(32, 22, 'x+1', { size: 12 }) + K.line(18, 30, 46, 30, { w: 1.5 }) + K.text(32, 42, 'x−1', { size: 12 }),
        size: () => [180, 110],
        compute: (c) => {
          let n, d;
          try { n = P.parse(c.props.num); } catch (e) { c.say('reject', '分子：' + e.message); return {}; }
          try { d = P.parse(c.props.den); } catch (e) { c.say('reject', '分母：' + e.message); return {}; }
          try { const f = R.make(n, d); c.say('ok', '分式 ' + R.show(f)); return { f: U.val('ratio', f) }; }
          catch (e) { c.say('reject', e.message); return {}; }
        },
        badge: (c) => (c.out.f ? R.show(c.out.f.data) : ''),
        draw: (c) => K.text(c.w / 2, c.h / 2 + 6, c.out.f ? R.show(c.out.f.data) : '…', { size: 14, weight: 700 }),
      },

      // ---------------- 分式运算：两个分式做加、减、乘、除 ----------------
      ratop: {
        workspaceRole: 'none',
        handles: true,
        essence: ['E8', 'E2'],
        label: '分式运算', prefix: '运', group: '数与运算', grades: [8, 9], alias: ['分式加减', '分式乘除', '通分'],
        props: {
          op: { type: 'choice', label: '运算', default: 0, choices: OPS.map((o) => o.sym) },
          label: { type: 'text', label: '标签', default: '' },
        },
        lint: { minProps: 2, why: '分式运算只需要运算种类和标签' },
        inputs: { a: { kind: 'ratio', label: '分式一' }, b: { kind: 'ratio', label: '分式二' } },
        outputs: { r: { dim: null, kind: 'ratio', label: '结果' } },
        icon: () => K.text(32, 30, 'a ? b', { size: 14, weight: 700 }),
        size: () => [190, 100],
        compute: (c) => {
          const a = ratioOf(c, 'a'), b = ratioOf(c, 'b');
          if (!a || !b) { c.say('info', '两边都接一个分式'); return {}; }
          const op = OPS[c.props.op] || OPS[0];
          try {
            const raw = op.f(a, b), r = R.simplify(raw);
            if (c.step) c.step('(' + R.show(a) + ') ' + op.sym + ' (' + R.show(b) + ')  =  ' + R.show(raw), null, op.rule);
            const reduced = R.show(r) !== R.show(raw);
            if (reduced && c.step) c.step('约分（分子分母同除以公因式）：' + R.show(r), null, 'frac.simplify');
            c.say('ok', '结果 ' + R.show(r) + (reduced ? '（已约分）' : ''));
            return { r: U.val('ratio', r) };
          } catch (e) { c.say('reject', e.message); return {}; }
        },
        badge: (c) => (c.out.r ? R.show(c.out.r.data) : ''),
        draw: (c) => K.text(c.w / 2, c.h / 2 + 6, OPS[c.props.op] ? OPS[c.props.op].sym : '', { size: 22, weight: 700 }),
      },

      // ---------------- 分式读数：只接分式口，代入 x、y 读出值；分母是 0 的地方没有值 ----------------
      ratread: {
        workspaceRole: 'none',
        handles: true,
        essence: ['E8'],
        label: '分式读数', prefix: '读', group: '数与运算', grades: [8, 9], alias: ['分式求值', '代入'],
        props: {
          x: { type: 'num', label: 'x 等于', default: 1, min: -99, max: 99, step: 1 },
          y: { type: 'num', label: 'y 等于', default: 0, min: -99, max: 99, step: 1 },
          label: { type: 'text', label: '标签', default: '' },
        },
        lint: { minProps: 2, why: '分式读数只需要 x、y 两个代入值和标签' },
        inputs: { f: { kind: 'ratio', label: '分式' } },
        outputs: { v: { dim: null, kind: 'num', label: '值' } },
        icon: () => K.text(32, 28, 'x,y', { size: 16, weight: 700 }),
        size: () => [170, 100],
        compute: (c) => {
          const f = ratioOf(c, 'f'); if (!f) { c.say('info', '接一个分式'); return {}; }
          const env = { x: Q.fromNumber(c.props.x), y: Q.fromNumber(c.props.y) };
          const extra = [...new Set(P.vars(f.n).concat(P.vars(f.d)))].filter((k) => !(k in env));
          if (extra.length) { c.say('reject', '分式里还有字母 ' + extra.join('、') + '，这台只代入 x、y'); return {}; }
          const r = R.evalQ(f, env);
          if (r === null) { c.say('reject', '分母是 0，这组数没有值'); return {}; }
          if (c.step) c.step(R.show(f) + '，代入 x = ' + c.props.x + '，y = ' + c.props.y + '，得 ' + Q.show(r), null, 'eq.both-sides');
          c.say('ok', '值是 ' + Q.show(r));
          return { v: U.val('num', r) };
        },
        badge: (c) => (c.out.v ? U.showVal(c.out.v) : ''),
        draw: (c) => K.text(c.w / 2, c.h / 2 + 6, c.out.v ? Q.show(c.out.v.data) : '…', { size: 20, weight: 700 }),
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
