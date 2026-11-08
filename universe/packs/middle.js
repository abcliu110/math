/* 器材包 middle：一元一次方程、三角形、圆、抛物线、硬币、数列。小升初到初中。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (q, dim, exact) => U.val('num', q, { dim: dim || null, exact: exact !== false });
  const isqrt = (n) => { const r = Math.round(Math.sqrt(n)); return r * r === n ? r : null; };
  const qsqrt = (q) => { const a = isqrt(q.n), b = isqrt(q.d); return q.n >= 0 && a !== null && b !== null ? Q(a, b) : null; };

  U.registerPack({
    id: 'middle', version: 1,
    types: {
      linsolve: {
        label: '解方程', prefix: '解', group: '关系', grades: [6, 8], alias: ['一元一次方程', 'ax+b=c', '移项'],
        props: {
          a: { type: 'num', label: 'x 前面的数 a', default: 1, min: -99, max: 99, step: 1 },
          b: { type: 'num', label: '加上 b', default: 0, min: -99, max: 99, step: 1 },
          c: { type: 'num', label: '等于 c', default: 0, min: -999, max: 999, step: 1 },
        },
        outputs: { x: { kind: 'num', label: 'x' }, ok: { kind: 'bool', label: '有唯一解' } },
        icon: () => K.text(32, 29, 'ax+b=c', { size: 14, weight: 700 }),
        size: () => [200, 110],
        compute: (c) => {
          const a = Q.fromNumber(c.props.a), b = Q.fromNumber(c.props.b), cc = Q.fromNumber(c.props.c);
          if (a.n === 0) { c.say('warn', 'a = 0：要么无解、要么有无数个解'); return { ok: U.val('bool', false) }; }
          const x = Q.div(Q.sub(cc, b), a);
          c.say('ok', 'x = (' + Q.show(cc) + ' − ' + Q.show(b) + ') ÷ ' + Q.show(a) + ' = ' + Q.show(x));
          return { x: num(x), ok: U.val('bool', true) };
        },
        badge: (c) => (c.out.x ? 'x = ' + U.showVal(c.out.x) : ''),
        draw: (c) => K.text(c.w / 2, c.h / 2 - 2, c.props.a + 'x ' + (c.props.b < 0 ? '− ' : '+ ') + Math.abs(c.props.b) + ' = ' + c.props.c, { size: 20, weight: 700 }) + K.text(c.w / 2, c.h / 2 + 28, c.out.x ? 'x = ' + Q.show(c.out.x.data) : '没有唯一的 x', { size: 18, fill: 'var(--accent)', weight: 700 }),
      },

      tri: {
        label: '三角形', prefix: '角', group: '图形', grades: [4, 9], alias: ['三边关系', '勾股', '周长', '面积'],
        props: {
          a: { type: 'num', label: '边 a', default: 3, min: 0.5, max: 50, step: 0.5 },
          b: { type: 'num', label: '边 b', default: 4, min: 0.5, max: 50, step: 0.5 },
          c: { type: 'num', label: '边 c', default: 5, min: 0.5, max: 50, step: 0.5 },
        },
        outputs: { ok: { kind: 'bool', label: '围得起来' }, right: { kind: 'bool', label: '是直角' }, perim: { kind: 'num', label: '周长' }, area: { kind: 'num', label: '面积' } },
        icon: () => '<path d="M8 36 L50 36 L24 8 Z" fill="#f08a1c33" stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round"/>',
        size: () => [220, 170],
        compute: (c) => {
          const a = Q.fromNumber(c.props.a), b = Q.fromNumber(c.props.b), cc = Q.fromNumber(c.props.c);
          const ok = Q.cmp(Q.add(a, b), cc) > 0 && Q.cmp(Q.add(a, cc), b) > 0 && Q.cmp(Q.add(b, cc), a) > 0;
          const out = { ok: U.val('bool', ok), perim: num(Q.add(Q.add(a, b), cc), 'length') };
          if (!ok) { c.say('warn', '围不起来：任意两边之和必须大于第三边'); return out; }
          const sq = [a, b, cc].map((x) => Q.mul(x, x)).sort(Q.cmp);
          out.right = U.val('bool', Q.eq(Q.add(sq[0], sq[1]), sq[2]));
          const s = Q.div(out.perim.data, Q(2)), A2 = Q.mul(Q.mul(s, Q.sub(s, a)), Q.mul(Q.sub(s, b), Q.sub(s, cc))), r = qsqrt(A2);
          out.area = r ? num(r, 'area') : num(Q.fromNumber(Math.sqrt(Q.num(A2))), 'area', false);
          c.say(out.right.data ? 'ok' : 'info', out.right.data ? '直角三角形：' + sq.map((x) => Q.show(x)).join(' + ').replace(' + ', ' + ') + '（平方）' : '围得起来，但不是直角');
          return out;
        },
        badge: (c) => (c.out.ok ? (c.out.ok.data ? (c.out.right && c.out.right.data ? '直角' : '能围') : '围不起来') : ''),
        draw: (c) => {
          const a = c.props.a, b = c.props.b, cc = c.props.c, ok = c.out.ok && c.out.ok.data;
          const mx = Math.max(a, b, cc), k = Math.min((c.w - 40) / mx, (c.h - 40) / mx * 1.4);
          if (!ok) return K.line(20, c.h - 20, 20 + cc * k, c.h - 20, { w: 4, stroke: 'var(--bad)' }) + K.line(20, c.h - 36, 20 + a * k, c.h - 36, { w: 4, stroke: 'var(--accent)' }) + K.line(20, c.h - 52, 20 + b * k, c.h - 52, { w: 4, stroke: 'var(--accent)' }) + K.text(c.w / 2, 24, '两边加起来够不着第三边', { size: 13, fill: 'var(--bad)' });
          const x = (b * b + cc * cc - a * a) / (2 * cc), y = Math.sqrt(Math.max(0, b * b - x * x)), ox = (c.w - cc * k) / 2, oy = c.h - 24;
          const P = [[ox, oy], [ox + cc * k, oy], [ox + x * k, oy - y * k]];
          return '<path d="M' + P.map((p) => p.join(',')).join(' L') + ' Z" fill="#f08a1c33" stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round"/>' +
            K.text((P[1][0] + P[2][0]) / 2 + 12, (P[1][1] + P[2][1]) / 2, a, { size: 12, weight: 700 }) + K.text((P[0][0] + P[2][0]) / 2 - 12, (P[0][1] + P[2][1]) / 2, b, { size: 12, weight: 700 }) + K.text(ox + cc * k / 2, oy + 16, cc, { size: 12, weight: 700 });
        },
      },

      circle: {
        label: '圆', prefix: '圆', group: '图形', grades: [6, 9], alias: ['圆周率', '周长', '面积', 'π'],
        props: {
          r: { type: 'num', label: '半径', default: 5, min: 0.5, max: 50, step: 0.5 },
          pi: { type: 'choice', label: 'π 取', default: 0, choices: ['3.14', '22/7', '3.14159…（近似）'] },
          show: { type: 'bool', label: '画直径', default: true },
        },
        outputs: { c: { kind: 'num', label: '周长' }, area: { kind: 'num', label: '面积' } },
        icon: () => K.circle(32, 22, 16, { stroke: 'var(--ink)', w: 2.5, fill: '#f08a1c33' }) + K.line(16, 22, 48, 22, { w: 1.5 }),
        size: () => [200, 160],
        compute: (c) => {
          const r = Q.fromNumber(c.props.r), ex = c.props.pi < 2, pi = c.props.pi === 0 ? Q(314, 100) : c.props.pi === 1 ? Q(22, 7) : Q.fromNumber(Math.PI);
          return { c: num(Q.mul(Q.mul(Q(2), pi), r), 'length', ex), area: num(Q.mul(pi, Q.mul(r, r)), 'area', ex) };
        },
        badge: (c) => (c.out.area ? '面积 ' + Q.showDec(c.out.area.data, 2) : ''),
        draw: (c) => {
          const R = Math.min(c.w, c.h) / 2 - 22, cx = c.w / 2, cy = c.h / 2 - 4;
          return K.circle(cx, cy, R, { stroke: 'var(--ink)', w: 2.5, fill: '#f08a1c33' }) + (c.props.show ? K.line(cx - R, cy, cx + R, cy, { w: 1.5, dash: '4 4' }) : '') + K.line(cx, cy, cx + R * 0.7, cy - R * 0.7, { w: 2.5, stroke: 'var(--accent)' }) + K.text(cx + R * 0.45, cy - R * 0.2, 'r=' + c.props.r, { size: 12, weight: 700, anchor: 'start' });
        },
      },

      quad: {
        label: '抛物线', prefix: '抛', group: '函数', grades: [8, 9], alias: ['二次函数', '顶点', '判别式', 'y=ax²+bx+c'],
        props: {
          a: { type: 'num', label: 'a（x² 前）', default: 1, min: -10, max: 10, step: 1 },
          b: { type: 'num', label: 'b（x 前）', default: 0, min: -20, max: 20, step: 1 },
          c: { type: 'num', label: 'c（常数）', default: 0, min: -20, max: 20, step: 1 },
        },
        outputs: { vx: { kind: 'num', label: '顶点 x' }, vy: { kind: 'num', label: '顶点 y' }, roots: { kind: 'num', label: '与 x 轴交点数' }, disc: { kind: 'num', label: 'b²−4ac' } },
        icon: () => '<path d="M10 10 Q32 56 54 10" fill="none" stroke="var(--good)" stroke-width="3"/>',
        size: () => [230, 190],
        compute: (c) => {
          const a = Q.fromNumber(c.props.a), b = Q.fromNumber(c.props.b), cc = Q.fromNumber(c.props.c);
          if (a.n === 0) { c.say('reject', 'a 不能是 0：那样就不是抛物线，是直线了'); return {}; }
          const vx = Q.neg(Q.div(b, Q.mul(Q(2), a))), vy = Q.add(Q.mul(a, Q.mul(vx, vx)), Q.add(Q.mul(b, vx), cc)), d = Q.sub(Q.mul(b, b), Q.mul(Q(4), Q.mul(a, cc)));
          c.say('ok', '顶点 (' + Q.show(vx) + ', ' + Q.show(vy) + ')，' + (d.n > 0 ? '与 x 轴有 2 个交点' : d.n === 0 ? '刚好碰到 x 轴' : '够不着 x 轴'));
          return { vx: num(vx), vy: num(vy), disc: num(d), roots: num(Q(d.n > 0 ? 2 : d.n === 0 ? 1 : 0)) };
        },
        badge: (c) => (c.out.vx ? '顶点(' + U.showVal(c.out.vx) + ',' + U.showVal(c.out.vy) + ')' : ''),
        draw: (c) => {
          const a = c.props.a, b = c.props.b, cc = c.props.c, R = 6, W = c.w, H = c.h, px = (x) => W / 2 + (x / R) * (W / 2 - 8), py = (y) => H / 2 - (y / (R * 1.4)) * (H / 2 - 8);
          let s = K.line(8, H / 2, W - 8, H / 2, { w: 1, stroke: 'var(--dim)' }) + K.line(W / 2, 6, W / 2, H - 6, { w: 1, stroke: 'var(--dim)' });
          if (a !== 0) {
            const pts = []; for (let i = -60; i <= 60; i++) { const x = (i / 60) * R, y = a * x * x + b * x + cc; if (Math.abs(y) < R * 3) pts.push(px(x).toFixed(1) + ',' + py(y).toFixed(1)); }
            s += '<polyline points="' + pts.join(' ') + '" fill="none" stroke="var(--good)" stroke-width="2.5"/>';
            if (c.out.vx) s += K.circle(px(Q.num(c.out.vx.data)), py(Q.num(c.out.vy.data)), 5, { fill: 'var(--accent)', stroke: '#fff', w: 2 });
          }
          return '<g><clipPath id="q' + c.ent.id + '"><rect width="' + W + '" height="' + H + '"/></clipPath><g clip-path="url(#q' + c.ent.id + ')">' + s + '</g></g>';
        },
      },

      coin: {
        label: '硬币', prefix: '币', group: '统计与概率', grades: [4, 9], alias: ['正反面', '概率', '随机'],
        props: {
          p: { type: 'num', label: '正面概率', default: 0.5, min: 0, max: 1, step: 0.05 },
          every: { type: 'int', label: '几拍抛一次', default: 1, min: 1, max: 20 },
          salt: { type: 'int', label: '种子偏移', default: 0, min: 0, max: 99 },
        },
        outputs: { v: { kind: 'num', label: '正面=1' } },
        icon: () => K.circle(32, 22, 15, { stroke: 'var(--ink)', w: 2.5, fill: '#f5c24233' }) + K.text(32, 29, '正', { size: 16, weight: 700 }),
        size: () => [120, 100],
        init: () => ({ v: -1, flips: 0, heads: 0 }),
        read: (c) => (c.state.v < 0 ? {} : { v: num(Q(c.state.v)) }),
        step: (c) => {
          const s = c.state; if (c.n % c.props.every !== 0) return s;
          const h = c.rand(c.props.salt) < c.props.p ? 1 : 0;
          return { v: h, flips: s.flips + 1, heads: s.heads + h };
        },
        sig: (c, say) => say('info', c.state.flips ? '抛了 ' + c.state.flips + ' 次，正面 ' + c.state.heads + ' 次' : '还没抛：让时钟走起来'),
        badge: (c) => (c.state.v < 0 ? '' : c.state.v ? '正面' : '反面'),
        draw: (c) => {
          const v = c.state.v, cx = c.w / 2, cy = c.h / 2;
          return K.circle(cx, cy, Math.min(cx, cy) - 8, { stroke: 'var(--ink)', w: 3, fill: v < 0 ? 'var(--card2)' : v ? '#f5c242' : '#c7ccd6' }) + K.text(cx, cy + 10, v < 0 ? '?' : v ? '正' : '反', { size: 30, weight: 700 });
        },
      },

      seq: {
        label: '数列', prefix: '列', group: '时间与变化', grades: [4, 9], alias: ['等差数列', '等比数列', '求和', '规律'],
        props: {
          first: { type: 'num', label: '第一项', default: 1, min: -999, max: 999, step: 1 },
          diff: { type: 'num', label: '公差 / 公比', default: 1, min: -99, max: 99, step: 1 },
          mode: { type: 'choice', label: '类型', default: 0, choices: ['等差', '等比'] },
        },
        reinit: ['first', 'diff', 'mode'],
        outputs: { v: { kind: 'num', label: '这一项' }, sum: { kind: 'num', label: '前几项的和' }, n: { kind: 'num', label: '第几项' } },
        icon: () => [0, 1, 2, 3].map((i) => K.rect(8 + i * 13, 34 - 6 - i * 6, 10, 6 + i * 6, { fill: 'var(--accent)', r: 1 })).join(''),
        size: () => [200, 110],
        init: (p) => ({ k: 1, term: Q.fromNumber(p.first), sum: Q.fromNumber(p.first), past: [Q.fromNumber(p.first)] }),
        read: (c) => ({ v: num(c.state.term), sum: num(c.state.sum), n: num(Q(c.state.k)) }),
        step: (c) => {
          const s = c.state, d = Q.fromNumber(c.props.diff), t = c.props.mode === 0 ? Q.add(s.term, d) : Q.mul(s.term, d);
          return { k: s.k + 1, term: t, sum: Q.add(s.sum, t), past: s.past.concat([t]).slice(-8) };
        },
        sig: (c, say) => say('ok', '第 ' + c.state.k + ' 项是 ' + Q.show(c.state.term) + '，前 ' + c.state.k + ' 项的和是 ' + Q.show(c.state.sum)),
        badge: (c) => '第 ' + c.state.k + ' 项',
        draw: (c) => {
          const ps = c.state.past, W = c.w - 16, k = W / 8;
          let s = ''; ps.forEach((t, i) => { const v = Math.abs(Q.num(t)), mx = Math.max(1, ...ps.map((x) => Math.abs(Q.num(x)))), h = Math.max(3, (v / mx) * (c.h - 40)); s += K.rect(8 + i * k + 2, c.h - 20 - h, k - 4, h, { fill: Q.num(t) < 0 ? 'var(--bad)' : 'var(--accent)', r: 2 }) + K.text(8 + i * k + k / 2, c.h - 6, Q.showDec(t, 1), { size: 10, fill: 'var(--dim)' }); });
          return s;
        },
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
