/* 器材包 core：数与运算、分数、关系、函数。
 * 每台器材：属性 ≥3（或写明豁免理由）、器材架缩略图 icon、卡片 draw、有读数 badge。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit, D = U.Dim;
  const num = (q, dim) => U.val('num', q, { dim: dim || null });
  const OPS = ['+', '−', '×', '÷'];
  const CMP = ['=', '<', '>', '≤', '≥'];
  const FORMS = ['分数', '带分数', '小数'];

  U.registerPack({
    id: 'core', version: 1,
    types: {
      // ---------------- 数字 ----------------
      num: {
        label: '数字', prefix: '数', group: '分数', grades: [1, 9],
        props: {
          n: { type: 'int', label: '分子', default: 1, min: -999, max: 999 },
          d: { type: 'int', label: '分母', default: 1, min: 1, max: 999 },
          unit: { type: 'choice', label: '单位', default: 0, choices: D.names },
        },
        outputs: { v: { kind: 'num', label: '值' } },
        icon: () => K.frac(32, 18, Q(1, 2), 22),
        size: () => [150, 92],
        compute: (c) => ({ v: num(Q(c.props.n, c.props.d), D.key(c.props.unit)) }),
        badge: (c) => (c.out.v ? U.showVal(c.out.v) : ''),
        draw: (c) => {
          const q = Q(c.props.n, c.props.d);
          return K.frac(c.w / 2, c.h / 2 - 4, q, 26) + (c.props.unit ? K.text(c.w - 8, c.h - 6, D.names[c.props.unit], { size: 11, anchor: 'end', fill: 'var(--dim)' }) : '');
        },
      },

      // ---------------- 运算器 ----------------
      op: {
        label: '运算器', prefix: '算', group: '数与运算', grades: [1, 9], alias: ['加', '减', '乘', '除'],
        props: {
          op: { type: 'choice', label: '运算', default: 0, choices: OPS },
          units: { type: 'bool', label: '检查单位', default: true },
          form: { type: 'choice', label: '结果写法', default: 0, choices: FORMS },
        },
        inputs: { a: { kind: 'num', label: '甲' }, b: { kind: 'num', label: '乙' } },
        outputs: { r: { kind: 'num', label: '结果' } },
        icon: () => K.circle(32, 22, 16, { stroke: 'var(--ink)' }) + K.text(32, 29, '+', { size: 22, weight: 700 }),
        size: () => [160, 112],
        compute: (c) => {
          const a = K.first(c.inp.a), b = K.first(c.inp.b);
          if (!a || !b) { c.say('info', '等两个数都接上'); return {}; }
          const o = c.props.op;
          let dim, r;
          if (o <= 1) {
            const dd = D.add(a.dim, b.dim);
            if (!dd.ok) {
              c.say(c.props.units ? 'reject' : 'warn', '「' + D.name(a.dim) + '」和「' + D.name(b.dim) + '」不能直接' + (o ? '相减' : '相加') + '：单位不一样');
              if (c.props.units) return {};
            }
            dim = dd.ok ? dd.dim : null;
            r = o ? Q.sub(a.data, b.data) : Q.add(a.data, b.data);
          } else if (o === 2) { dim = D.mul(a.dim, b.dim); r = Q.mul(a.data, b.data); }
          else {
            if (b.data.n === 0) { c.say('err', '除数不能是 0'); return {}; }
            dim = D.div(a.dim, b.dim); r = Q.div(a.data, b.data);
          }
          c.say('ok', Q.show(a.data) + ' ' + OPS[o] + ' ' + Q.show(b.data) + ' = ' + Q.show(r));
          return { r: num(r, dim) };
        },
        badge: (c) => (c.out.r ? K.showForm(c.out.r.data, c.props.form) : ''),
        draw: (c) => {
          const r = c.out.r;
          return K.text(c.w / 2, 28, OPS[c.props.op], { size: 28, weight: 700, fill: 'var(--accent)' }) +
            (r ? K.frac(c.w / 2, c.h - 30, r.data, 22) : K.text(c.w / 2, c.h - 16, '？', { size: 20, fill: 'var(--dim)' }));
        },
      },

      // ---------------- 读数 ----------------
      meter: {
        label: '读数', prefix: '读', group: '数与运算', grades: [1, 9],
        props: {
          form: { type: 'choice', label: '写法', default: 0, choices: FORMS },
          digits: { type: 'int', label: '小数位', default: 3, min: 0, max: 6 },
          label: { type: 'text', label: '标签', default: '' },
        },
        inputs: { v: { kind: 'num', label: '值' } },
        outputs: { v: { kind: 'num', label: '原样输出' } },
        icon: () => K.rect(8, 8, 48, 28, { stroke: 'var(--ink)', r: 6 }) + K.text(32, 29, '0.5', { size: 16, weight: 700 }),
        size: () => [150, 80],
        compute: (c) => {
          const v = K.first(c.inp.v);
          if (!v) { c.say('info', '接一个数进来'); return {}; }
          return { v };
        },
        badge: (c) => c.props.label,
        draw: (c) => {
          const v = c.out.v;
          return v ? K.text(c.w / 2, c.h / 2 + 8, K.showForm(v.data, c.props.form, c.props.digits), { size: 24, weight: 700 }) : K.text(c.w / 2, c.h / 2 + 8, '—', { size: 24, fill: 'var(--dim)' });
        },
      },

      // ---------------- 比较 ----------------
      compare: {
        label: '比较', prefix: '比', group: '关系', grades: [1, 9],
        props: {
          op: { type: 'choice', label: '关系', default: 0, choices: CMP },
          tol: { type: 'num', label: '允许差', default: 0, min: 0, step: 0.01 },
          invert: { type: 'bool', label: '反过来', default: false },
        },
        inputs: { a: { kind: 'num', label: '甲' }, b: { kind: 'num', label: '乙' } },
        outputs: { ok: { kind: 'bool', label: '成立' } },
        icon: () => K.text(32, 30, '≟', { size: 28, weight: 700 }),
        size: () => [150, 80],
        compute: (c) => {
          const a = K.first(c.inp.a), b = K.first(c.inp.b);
          if (!a || !b) { c.say('info', '等两个数都接上'); return {}; }
          const cm = Q.cmp(a.data, b.data), tol = Q.fromNumber(c.props.tol);
          const diff = Q.sub(a.data, b.data), ad = diff.n < 0 ? Q.neg(diff) : diff;
          const o = c.props.op;
          let ok = o === 0 ? Q.cmp(ad, tol) <= 0 : o === 1 ? cm < 0 : o === 2 ? cm > 0 : o === 3 ? cm <= 0 : cm >= 0;
          if (c.props.invert) ok = !ok;
          c.say(ok ? 'ok' : 'info', ok ? '成立' : '不成立');
          return { ok: U.val('bool', ok) };
        },
        badge: (c) => (c.out.ok ? (c.out.ok.data ? '成立' : '不成立') : ''),
        draw: (c) => {
          const ok = c.out.ok;
          return K.text(c.w / 2, c.h / 2 + 10, CMP[c.props.op], { size: 30, weight: 700, fill: ok ? (ok.data ? 'var(--good)' : 'var(--bad)') : 'var(--dim)' });
        },
      },

      // ---------------- 天平 ----------------
      balance: {
        label: '天平', prefix: '平', group: '关系', grades: [1, 9], alias: ['方程', '等式'],
        props: {
          tol: { type: 'num', label: '允许差', default: 0, min: 0, step: 0.01 },
          scale: { type: 'int', label: '倾斜灵敏度', default: 4, min: 1, max: 10 },
          grid: { type: 'bool', label: '显示刻度', default: false },
        },
        inputs: { L: { kind: 'num', label: '左盘', many: true }, R: { kind: 'num', label: '右盘', many: true } },
        outputs: { ok: { kind: 'bool', label: '平衡' }, diff: { kind: 'num', label: '左−右' } },
        icon: () => K.line(32, 8, 32, 34, { w: 2 }) + K.line(10, 14, 54, 14, { w: 2.5 }) + K.line(6, 14, 14, 24, {}) + K.line(58, 14, 50, 24, {}) + K.line(16, 36, 48, 36, { w: 3 }),
        size: () => [220, 130],
        compute: (c) => {
          const l = K.nums(c.inp.L), r = K.nums(c.inp.R);
          if (!l.length && !r.length) { c.say('info', '往两个盘里放东西'); return {}; }
          const sl = K.sum(l), sr = K.sum(r);
          if (sl.bad || sr.bad) { c.say('reject', '同一个盘里的东西单位不一样，不能放在一起称'); return {}; }
          if (l.length && r.length && !D.add(sl.dim, sr.dim).ok) { c.say('reject', '左边是「' + D.name(sl.dim) + '」，右边是「' + D.name(sr.dim) + '」，称不了'); return {}; }
          const diff = Q.sub(sl.q, sr.q), ad = diff.n < 0 ? Q.neg(diff) : diff;
          const ok = Q.cmp(ad, Q.fromNumber(c.props.tol)) <= 0;
          c.say(ok ? 'ok' : 'info', ok ? '平衡了：' + Q.show(sl.q) + ' = ' + Q.show(sr.q) : '左 ' + Q.show(sl.q) + '，右 ' + Q.show(sr.q) + (diff.n > 0 ? '：左边重' : '：右边重'));
          return { ok: U.val('bool', ok), diff: num(diff, D.add(sl.dim, sr.dim).dim) };
        },
        badge: (c) => (c.out.ok ? (c.out.ok.data ? '平衡' : '不平') : ''),
        draw: (c) => {
          const d = c.out.diff ? Q.num(c.out.diff.data) : 0;
          const ang = Math.max(-1, Math.min(1, d / (Math.abs(d) + 6))) * (c.props.scale * 3.5) * Math.PI / 180;
          const cx = c.w / 2, cy = 30, L = 80, sin = Math.sin(ang), cos = Math.cos(ang);
          const lx = cx - L * cos, ly = cy + L * sin * 0.9, rx = cx + L * cos, ry = cy - L * sin * 0.9;
          let s = K.line(cx, cy, cx, c.h - 8, { w: 3 }) + K.line(cx - 28, c.h - 6, cx + 28, c.h - 6, { w: 4 });
          s += K.line(lx, ly, rx, ry, { w: 4, stroke: 'var(--accent)' });
          s += K.line(lx, ly, lx - 14, ly + 28, {}) + K.line(lx, ly, lx + 14, ly + 28, {}) + K.line(lx - 18, ly + 28, lx + 18, ly + 28, { w: 3 });
          s += K.line(rx, ry, rx - 14, ry + 28, {}) + K.line(rx, ry, rx + 14, ry + 28, {}) + K.line(rx - 18, ry + 28, rx + 18, ry + 28, { w: 3 });
          if (c.props.grid) for (let i = -4; i <= 4; i++) s += K.line(cx + i * 16, cy - 3, cx + i * 16, cy + 3, { w: 1, stroke: 'var(--dim)' });
          const ls = c.d && c.d.inp && c.d.inp.L ? K.nums(c.d.inp.L) : [], rs = c.d && c.d.inp && c.d.inp.R ? K.nums(c.d.inp.R) : [];
          const ss = (a) => { const t = K.sum(a); return t.q ? Q.show(t.q) : ''; };
          s += K.text(lx, ly + 44, ls.length ? ss(ls) : '', { size: 13, weight: 700 }) + K.text(rx, ry + 44, rs.length ? ss(rs) : '', { size: 13, weight: 700 });
          return s;
        },
      },

      // ---------------- 直线 ----------------
      line: {
        label: '直线', prefix: '线', group: '函数', grades: [7, 9], alias: ['一次函数', 'y=kx+b'],
        props: {
          k: { type: 'num', label: '斜率 k', default: 1, min: -100, max: 100, step: 0.5 },
          b: { type: 'num', label: '截距 b', default: 0, min: -100, max: 100, step: 0.5 },
          range: { type: 'int', label: '画多大', default: 5, min: 2, max: 20 },
        },
        outputs: { f: { kind: 'fn', label: '直线' } },
        icon: () => K.line(6, 38, 58, 6, { w: 3, stroke: 'var(--good)' }) + K.line(6, 22, 58, 22, { w: 1, stroke: 'var(--dim)' }),
        size: () => [180, 150],
        compute: (c) => ({ f: U.val('fn', { k: Q.fromNumber(c.props.k), b: Q.fromNumber(c.props.b) }) }),
        badge: (c) => (c.out.f ? U.showVal(c.out.f) : ''),
        draw: (c) => {
          const k = c.props.k, b = c.props.b, R = Math.max(c.props.range, Math.abs(b) * 1.2, 1), W = c.w, H = c.h;
          const px = (x) => W / 2 + (x / R) * (W / 2 - 8), py = (y) => H / 2 - (y / R) * (H / 2 - 8);
          let s = K.line(8, H / 2, W - 8, H / 2, { w: 1, stroke: 'var(--dim)' }) + K.line(W / 2, 6, W / 2, H - 6, { w: 1, stroke: 'var(--dim)' });
          const y0 = k * -R + b, y1 = k * R + b;
          s += '<polyline points="' + px(-R) + ',' + py(y0) + ' ' + px(R) + ',' + py(y1) + '" fill="none" stroke="var(--good)" stroke-width="2.5" stroke-linecap="round"/>';
          return '<g clip-path="url(#clip' + c.ent.id + ')"><clipPath id="clip' + c.ent.id + '"><rect x="0" y="0" width="' + W + '" height="' + H + '"/></clipPath>' + s + '</g>';
        },
      },

      // ---------------- 代入器 ----------------
      at: {
        label: '代入器', prefix: '代', group: '函数', grades: [7, 9], alias: ['求函数值'],
        lint: { minProps: 1, why: '代入器只做一件事：把 x 代进直线求 y' },
        props: { x: { type: 'num', label: 'x', default: 0, step: 1 } },
        inputs: { f: { kind: 'fn', label: '直线' } },
        outputs: { y: { kind: 'num', label: 'y' } },
        icon: () => K.text(32, 29, 'f(x)', { size: 17, weight: 700 }),
        size: () => [150, 88],
        compute: (c) => {
          const f = K.first(c.inp.f);
          if (!f) { c.say('info', '接一条直线'); return {}; }
          const x = Q.fromNumber(c.props.x), y = Q.add(Q.mul(f.data.k, x), f.data.b);
          c.say('ok', 'x = ' + Q.show(x) + ' 时 y = ' + Q.show(y));
          return { y: num(y) };
        },
        badge: (c) => (c.out.y ? 'y=' + U.showVal(c.out.y) : ''),
        draw: (c) => (c.out.y ? K.frac(c.w / 2, c.h / 2 - 2, c.out.y.data, 24) : K.text(c.w / 2, c.h / 2 + 8, '？', { size: 24, fill: 'var(--dim)' })),
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
