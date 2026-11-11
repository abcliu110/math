/* 器材包 model：套餐对比。两个模型（甲：月租 + 每分钟；乙：另一组）算同一个通话时长，比较、求交点。无状态：改属性就重算。
 * 同一个情境两种模型，交点是“两种模型给出同样结果”的地方；平行线则没有交点。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (q) => U.val('num', q);
  U.registerPack({
    id: 'model', version: 1,
    types: {
      costplan: {
        workspaceRole: 'none',
        handles: true,
        essence: ['E12', 'E8'],
        label: '套餐对比', prefix: '套', group: '关系', grades: [6, 9], alias: ['套餐', '一次函数', '交点', '建模', '月租', '电话费', '两种方案'],
        props: {
          base1: { type: 'num', label: '甲 月租（元）', default: 20, min: 0, max: 1000000, step: 1 },
          rate1: { type: 'num', label: '甲 每分钟（元）', default: 0.1, min: 0, max: 1000, step: 0.01 },
          base2: { type: 'num', label: '乙 月租（元）', default: 0, min: 0, max: 1000000, step: 1 },
          rate2: { type: 'num', label: '乙 每分钟（元）', default: 0.15, min: 0, max: 1000, step: 0.01 },
          x: { type: 'num', label: '通话（分钟）', default: 0, min: 0, max: 1000000, step: 1 },
        },
        outputs: {
          ca: { dim: null, kind: 'num', label: '甲要花' },
          cb: { dim: null, kind: 'num', label: '乙要花' },
          cheaper: { dim: null, kind: 'num', label: '便宜：1=甲，2=乙，0=一样' },
          breakeven: { dim: null, kind: 'num', label: '交点（一样多的分钟数）' },
        },
        icon: () => K.line(8, 38, 56, 10, { w: 2.5, stroke: 'var(--accent)' }) + K.line(8, 12, 56, 36, { w: 2.5, stroke: 'var(--good)' }) + K.circle(32, 24, 3.5, { fill: 'var(--ink)' }),
        size: () => [340, 200],
        compute: (c) => {
          const p = c.props;
          const B1 = Q.fromNumber(p.base1), R1 = Q.fromNumber(p.rate1), B2 = Q.fromNumber(p.base2), R2 = Q.fromNumber(p.rate2), X = Q.fromNumber(p.x);
          const ca = Q.add(B1, Q.mul(R1, X)), cb = Q.add(B2, Q.mul(R2, X)), cmp = Q.cmp(ca, cb);
          const o = { ca: num(ca), cb: num(cb), cheaper: num(Q(cmp < 0 ? 1 : cmp > 0 ? 2 : 0)), breakeven: null };
          if (!Q.eq(R1, R2)) o.breakeven = num(Q.div(Q.sub(B1, B2), Q.sub(R2, R1)));
          const a = Q.showDec(ca, 2), b = Q.showDec(cb, 2);
          if (cmp < 0) c.say('ok', '通话 ' + p.x + ' 分钟：甲 ' + a + ' 元 < 乙 ' + b + ' 元，甲便宜');
          else if (cmp > 0) c.say('ok', '通话 ' + p.x + ' 分钟：乙 ' + b + ' 元 < 甲 ' + a + ' 元，乙便宜');
          else c.say('info', '通话 ' + p.x + ' 分钟：两个套餐都是 ' + a + ' 元，一样多');
          if (!o.breakeven) c.say('info', '两个每分钟价格一样，两条线平行，没有交点');
          return o;
        },
        badge: (c) => (c.out.cheaper ? ['一样', '甲便宜', '乙便宜'][c.out.cheaper.data.n] : ''),
        draw: (c) => {
          const p = c.props, L = 44, T = 14, R = c.w - 100, B = c.h - 28, PW = R - L, PH = B - T;
          const B1 = p.base1, R1 = p.rate1, B2 = p.base2, R2 = p.rate2, bk = R1 !== R2 ? (B1 - B2) / (R2 - R1) : NaN;
          let XM = Math.max(100, p.x, Number.isFinite(bk) && bk > 0 ? bk : 0) * 1.25;
          XM = Math.min(10000, Math.ceil(XM / 50) * 50);
          const f1 = (x) => B1 + R1 * x, f2 = (x) => B2 + R2 * x;
          const ys = [0, f1(0), f2(0), f1(XM), f2(XM)];
          let lo = Math.min(...ys), hi = Math.max(...ys); if (hi === lo) hi = lo + 1;
          const pad = (hi - lo) * 0.05; lo -= pad; hi += pad;
          const X = (x) => L + (x / XM) * PW, Y = (y) => T + ((hi - y) / (hi - lo)) * PH;
          let g = K.line(L, T, L, B, { w: 1.5, stroke: 'var(--dim)' }) + K.line(L, B, R, B, { w: 1.5, stroke: 'var(--dim)' });
          g += K.text(L, B + 14, '0', { size: 10, fill: 'var(--dim)' }) + K.text(R, B + 14, XM + ' 分钟', { size: 10, fill: 'var(--dim)' });
          g += K.text(L - 6, Y(Math.max(lo, 0)) + 4, Math.round(Math.max(lo, 0)), { size: 10, fill: 'var(--dim)', anchor: 'end' });
          g += K.text(L - 6, T + 4, Math.round(hi), { size: 10, fill: 'var(--dim)', anchor: 'end' });
          if (Number.isFinite(bk) && bk >= 0 && bk <= XM) g += K.line(X(bk), T, X(bk), B, { w: 1, stroke: 'var(--dim)', dash: '4 4' }) + K.text(X(bk) + 4, B - 6, '交点 ' + +bk.toFixed(1), { size: 10, fill: 'var(--dim)', anchor: 'start' });
          g += K.line(X(0), Y(f1(0)), X(XM), Y(f1(XM)), { w: 2.5, stroke: 'var(--accent)' }) + K.line(X(0), Y(f2(0)), X(XM), Y(f2(XM)), { w: 2.5, stroke: 'var(--good)' });
          g += K.line(X(p.x), T, X(p.x), B, { w: 1, stroke: 'var(--ink)', dash: '2 3' });
          g += K.circle(X(p.x), Y(f1(p.x)), 5, { fill: 'var(--accent)', stroke: '#fff', w: 2 }) + K.circle(X(p.x), Y(f2(p.x)), 5, { fill: 'var(--good)', stroke: '#fff', w: 2 });
          g += K.text(X(p.x) + 4, T + 12, '现在 ' + p.x + ' 分钟', { size: 10, anchor: 'start' });
          return g + K.text(R, Y(f1(XM)) - 6, '甲', { size: 11, anchor: 'end', fill: 'var(--accent)', weight: 700 }) + K.text(R, Y(f2(XM)) + 14, '乙', { size: 11, anchor: 'end', fill: 'var(--good)', weight: 700 });
        },
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
