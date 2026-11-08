/* 器材包 applied：百分数、比、方程组（两直线交点）、摸球。应用题的骨架。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (q, dim, exact) => U.val('num', q, { dim: dim || null, exact: exact !== false });

  U.registerPack({
    id: 'applied', version: 1,
    types: {
      percent: {
        label: '百分数', prefix: '百', group: '数与运算', grades: [5, 6], alias: ['折扣', '打折', '增长率', '成数'],
        props: {
          mode: { type: 'choice', label: '求什么', default: 0, choices: ['甲是乙的百分之几', '乙的 甲% 是多少', '乙增加 甲%', '乙减少 甲%'] },
          digits: { type: 'int', label: '保留小数', default: 1, min: 0, max: 4 },
          label: { type: 'text', label: '标签', default: '' },
        },
        inputs: { a: { kind: 'num', label: '甲' }, b: { kind: 'num', label: '乙' } },
        outputs: { r: { kind: 'num', label: '结果' } },
        icon: () => K.text(32, 29, '%', { size: 28, weight: 700, fill: 'var(--accent)' }),
        size: () => [190, 104],
        compute: (c) => {
          const a = K.first(c.inp.a), b = K.first(c.inp.b);
          if (!a || !b) { c.say('info', '接甲和乙两个数'); return {}; }
          const m = c.props.mode, hund = Q(100);
          if (m === 0) { if (b.data.n === 0) { c.say('err', '乙不能是 0'); return {}; } return { r: num(Q.mul(Q.div(a.data, b.data), hund)) }; }
          const p = Q.div(a.data, hund);
          const r = m === 1 ? Q.mul(b.data, p) : m === 2 ? Q.mul(b.data, Q.add(Q(1), p)) : Q.mul(b.data, Q.sub(Q(1), p));
          c.say('ok', ['', Q.show(b.data) + ' 的 ' + Q.show(a.data) + '% = ', Q.show(b.data) + ' 增加 ' + Q.show(a.data) + '% = ', Q.show(b.data) + ' 减少 ' + Q.show(a.data) + '% = '][m] + Q.showDec(r, 3));
          return { r: num(r, b.dim) };
        },
        badge: (c) => c.props.label,
        draw: (c) => (c.out.r ? K.text(c.w / 2, c.h / 2 + 8, Q.showDec(c.out.r.data, c.props.digits) + (c.props.mode === 0 ? '%' : ''), { size: 28, weight: 700 }) : K.text(c.w / 2, c.h / 2 + 8, '？', { size: 28, fill: 'var(--dim)' })) + K.text(c.w / 2, c.h - 8, U.types.percent.props.mode.choices[c.props.mode], { size: 11, fill: 'var(--dim)' }),
      },

      ratio: {
        label: '比', prefix: '比', group: '数与运算', grades: [5, 6], alias: ['按比分配', '比例', '化简比'],
        props: {
          total: { type: 'num', label: '一共要分（0=不分）', default: 0, min: 0, max: 9999, step: 1 },
          simplify: { type: 'bool', label: '化成最简整数比', default: true },
          label: { type: 'text', label: '标签', default: '' },
        },
        inputs: { a: { kind: 'num', label: '甲' }, b: { kind: 'num', label: '乙' } },
        outputs: { ra: { kind: 'num', label: '比的前项' }, rb: { kind: 'num', label: '比的后项' }, sa: { kind: 'num', label: '甲分到' }, sb: { kind: 'num', label: '乙分到' } },
        icon: () => K.text(32, 29, '3 : 2', { size: 18, weight: 700 }),
        size: () => [200, 120],
        compute: (c) => {
          const a = K.first(c.inp.a), b = K.first(c.inp.b);
          if (!a || !b) { c.say('info', '接甲和乙'); return {}; }
          if (b.data.n === 0 || a.data.n < 0 || b.data.n < 0) { c.say('reject', '比的两项要是正数'); return {}; }
          const q = Q.div(a.data, b.data), ra = c.props.simplify ? q.n : a.data.n * b.data.d, rb = c.props.simplify ? q.d : b.data.n * a.data.d;
          const out = { ra: num(Q(ra)), rb: num(Q(rb)) };
          if (c.props.total > 0) { const T = Q.fromNumber(c.props.total), s = Q(ra + rb); out.sa = num(Q.mul(T, Q.div(Q(ra), s))); out.sb = num(Q.mul(T, Q.div(Q(rb), s))); c.say('ok', ra + ' : ' + rb + '，共 ' + (ra + rb) + ' 份，每份 ' + Q.showDec(Q.div(T, s), 3)); } else c.say('ok', ra + ' : ' + rb);
          return out;
        },
        badge: (c) => (c.out.ra ? c.out.ra.data.n + ' : ' + c.out.rb.data.n : ''),
        draw: (c) => {
          if (!c.out.ra) return K.text(c.w / 2, c.h / 2 + 8, '？', { size: 26, fill: 'var(--dim)' });
          const ra = c.out.ra.data.n, rb = c.out.rb.data.n, tot = ra + rb, W = c.w - 24;
          let s = K.text(c.w / 2, 34, ra + ' : ' + rb, { size: 26, weight: 700 });
          if (tot <= 24) { const w = W / tot; for (let i = 0; i < tot; i++) s += K.rect(12 + i * w + 1, 52, w - 2, 22, { fill: i < ra ? 'var(--accent)' : '#6aa7ff', r: 2 }); }
          if (c.out.sa) s += K.text(12, c.h - 8, '甲 ' + Q.show(c.out.sa.data), { anchor: 'start', size: 13, weight: 700 }) + K.text(c.w - 12, c.h - 8, '乙 ' + Q.show(c.out.sb.data), { anchor: 'end', size: 13, weight: 700 });
          return s;
        },
      },

      cross: {
        label: '交点', prefix: '交', group: '函数', grades: [7, 9], alias: ['方程组', '二元一次方程组', '鸡兔同笼', '联立'],
        props: {
          range: { type: 'int', label: '画多大', default: 30, min: 2, max: 100 },
          showPt: { type: 'bool', label: '标出交点', default: true },
          label: { type: 'text', label: '标签', default: '' },
        },
        inputs: { f: { kind: 'fn', label: '直线 1' }, g: { kind: 'fn', label: '直线 2' } },
        outputs: { x: { kind: 'num', label: 'x' }, y: { kind: 'num', label: 'y' }, ok: { kind: 'bool', label: '恰有一个交点' } },
        icon: () => K.line(8, 38, 56, 8, { w: 2.5, stroke: 'var(--good)' }) + K.line(8, 10, 56, 36, { w: 2.5, stroke: 'var(--accent)' }) + K.circle(32, 23, 4, { fill: '#fff', stroke: 'var(--ink)' }),
        size: () => [220, 180],
        compute: (c) => {
          const f = K.first(c.inp.f), g = K.first(c.inp.g);
          if (!f || !g) { c.say('info', '接两条直线'); return {}; }
          if (Q.eq(f.data.k, g.data.k)) { c.say('warn', Q.eq(f.data.b, g.data.b) ? '两条线重合：有无数个解' : '两条线平行：没有解'); return { ok: U.val('bool', false) }; }
          const x = Q.div(Q.sub(g.data.b, f.data.b), Q.sub(f.data.k, g.data.k)), y = Q.add(Q.mul(f.data.k, x), f.data.b);
          c.say('ok', '交点 (' + Q.show(x) + ', ' + Q.show(y) + ')');
          return { x: num(x), y: num(y), ok: U.val('bool', true) };
        },
        badge: (c) => (c.out.x ? '(' + U.showVal(c.out.x) + ', ' + U.showVal(c.out.y) + ')' : c.out.ok ? '无唯一解' : ''),
        draw: (c) => {
          const R = c.props.range, W = c.w, H = c.h, px = (x) => W / 2 + (x / R) * (W / 2 - 8), py = (y) => H / 2 - (y / R) * (H / 2 - 8);
          let s = K.line(8, H / 2, W - 8, H / 2, { w: 1, stroke: 'var(--dim)' }) + K.line(W / 2, 6, W / 2, H - 6, { w: 1, stroke: 'var(--dim)' });
          [['f', 'var(--good)'], ['g', 'var(--accent)']].forEach(([k, col]) => { const v = K.first(c.d && c.d.inp && c.d.inp[k]); if (v) s += '<polyline points="' + px(-R) + ',' + py(Q.num(v.data.k) * -R + Q.num(v.data.b)) + ' ' + px(R) + ',' + py(Q.num(v.data.k) * R + Q.num(v.data.b)) + '" fill="none" stroke="' + col + '" stroke-width="2.5"/>'; });
          if (c.props.showPt && c.out.x) s += K.circle(px(Q.num(c.out.x.data)), py(Q.num(c.out.y.data)), 5, { fill: '#fff', stroke: 'var(--ink)', w: 2 });
          return '<g><clipPath id="x' + c.ent.id + '"><rect width="' + W + '" height="' + H + '"/></clipPath><g clip-path="url(#x' + c.ent.id + ')">' + s + '</g></g>';
        },
      },

      bag: {
        label: '摸球袋', prefix: '袋', group: '统计与概率', grades: [5, 9], alias: ['摸球', '概率', '有放回', '不放回'],
        props: {
          red: { type: 'int', label: '红球几个', default: 3, min: 0, max: 50 },
          white: { type: 'int', label: '白球几个', default: 1, min: 0, max: 50 },
          replace: { type: 'bool', label: '摸完放回去', default: true },
        },
        reinit: ['red', 'white', 'replace'],
        outputs: { v: { kind: 'num', label: '红球=1' } },
        icon: () => '<path d="M18 14 Q32 6 46 14 L50 38 H14 Z" fill="#f08a1c33" stroke="var(--ink)" stroke-width="2.5"/>' + K.circle(28, 30, 4, { fill: 'var(--bad)' }) + K.circle(38, 30, 4, { fill: '#fff', stroke: 'var(--ink)' }),
        size: () => [150, 120],
        init: (p) => ({ r: p.red, w: p.white, v: -1, draws: 0, reds: 0 }),
        read: (c) => (c.state.v < 0 ? {} : { v: num(Q(c.state.v)) }),
        step: (c) => {
          const s = c.state, tot = s.r + s.w; if (tot <= 0) return s;
          const red = c.rand(0) * tot < s.r, o = { r: s.r, w: s.w, v: red ? 1 : 0, draws: s.draws + 1, reds: s.reds + (red ? 1 : 0) };
          if (!c.props.replace) { if (red) o.r -= 1; else o.w -= 1; }
          return o;
        },
        sig: (c, say) => (c.state.r + c.state.w === 0 ? say('warn', '袋子空了（没放回，摸光了）') : say('info', '袋里还有 ' + c.state.r + ' 红 ' + c.state.w + ' 白' + (c.state.draws ? '；摸了 ' + c.state.draws + ' 次，红 ' + c.state.reds : ''))),
        badge: (c) => (c.state.v < 0 ? '' : c.state.v ? '红' : '白'),
        draw: (c) => {
          let s = '<path d="M30 30 Q75 8 120 30 L132 ' + (c.h - 8) + ' H18 Z" fill="#f08a1c22" stroke="var(--ink)" stroke-width="2.5"/>';
          const n = c.state.r + c.state.w;
          for (let i = 0; i < Math.min(n, 30); i++) s += K.circle(36 + (i % 10) * 8.6, 52 + Math.floor(i / 10) * 14, 5, { fill: i < c.state.r ? 'var(--bad)' : '#fff', stroke: 'var(--ink)', w: 1.5 });
          return s;
        },
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
