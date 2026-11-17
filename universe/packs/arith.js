/* 器材包 arith：点阵（乘法的样子）、带余除法、取整、数位板（可换进制）。低年级到小升初。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (q, dim) => U.val('num', q, { dim: dim || null });
  const intOf = (v) => (v && v.data.d === 1n ? Number(v.data.n) : null);

  U.registerPack({
    id: 'arith', version: 1,
    types: {
      round: {
        workspaceRole: 'none',
        handles: true,
        essence: ['E3', 'E7'],
        label: '取整', prefix: '取', group: '数与运算', grades: [3, 6], alias: ['四舍五入', '近似数', '凑整'],
        props: {
          place: { type: 'int', label: '精确到（10的几次方）', default: 0, min: -4, max: 4 },
          mode: { type: 'choice', label: '方法', default: 0, choices: ['四舍五入', '进一法', '去尾法'] },
          show: { type: 'choice', label: '写法', default: 0, choices: ['分数', '小数'] },
        },
        inputs: { v: { kind: 'num', label: '原数' } },
        outputs: { r: { dim: null, kind: 'num', label: '近似数' } },
        icon: () => K.text(32, 29, '≈', { size: 30, weight: 700 }),
        size: () => [160, 96],
        compute: (c) => {
          const v = K.first(c.inp.v); if (!v) { c.say('info', '接一个数'); return {}; }
          const unit = c.props.place >= 0 ? Q(10 ** c.props.place) : Q(1, 10 ** -c.props.place);
          const t = Q.div(v.data, unit), fl = Number(t.n >= 0n ? t.n / t.d : -((-t.n + t.d - 1n) / t.d)), exact = t.d === 1n;
          const k = c.props.mode === 0 ? Math.floor(Q.num(t) + 0.5) : c.props.mode === 1 ? (exact ? fl : fl + 1) : (t.n < 0n && !exact ? fl + 1 : fl);
          const r = Q.mul(Q(k), unit);
          c.say('ok', Q.showDec(v.data, 4) + ' ≈ ' + Q.showDec(r, 4));
          return { r: num(r, v.dim) };
        },
        badge: (c) => (c.out.r ? Q.showDec(c.out.r.data, 4) : ''),
        draw: (c) => (c.out.r ? K.text(c.w / 2, c.h / 2 + 8, c.props.show ? Q.showDec(c.out.r.data, 4) : Q.show(c.out.r.data), { size: 26, weight: 700 }) : K.text(c.w / 2, c.h / 2 + 8, '？', { size: 26, fill: 'var(--dim)' })),
      },

      digits: {
        workspaceRole: 'none',
        handles: true,
        essence: ['E3', 'E6'],
        label: '数位板', prefix: '位', group: '数与运算', grades: [1, 6], alias: ['进制', '二进制', '个十百', '位值'],
        props: {
          base: { type: 'int', label: '几进制', default: 10, min: 2, max: 16 },
          width: { type: 'int', label: '显示几位', default: 6, min: 1, max: 12 },
          weights: { type: 'bool', label: '标出位值', default: true },
        },
        inputs: { v: { kind: 'num', label: '整数' } },
        outputs: { count: { dim: null, kind: 'num', label: '有几位' }, sum: { dim: null, kind: 'num', label: '数字和' } },
        icon: () => [0, 1, 2].map((i) => K.rect(8 + i * 16, 10, 14, 24, { stroke: 'var(--ink)', r: 2 }) + K.text(15 + i * 16, 28, [1, 0, 1][i], { size: 14, weight: 700 })).join(''),
        size: () => [260, 110],
        compute: (c) => {
          const v = K.first(c.inp.v); if (!v) { c.say('info', '接一个整数'); return {}; }
          const n = intOf(v);
          if (n === null || n < 0) { c.say('reject', '数位板只接非负整数'); return {}; }
          const ds = n === 0 ? [0] : []; let m = n; while (m > 0) { ds.unshift(m % c.props.base); m = Math.floor(m / c.props.base); }
          c.say('ok', n + ' 写成 ' + c.props.base + ' 进制：' + ds.map((x) => x.toString(16).toUpperCase()).join(''));
          if (c.step) {
            for (let t = n; t > 0; t = Math.floor(t / c.props.base)) c.step(t + ' ÷ ' + c.props.base + ' = ' + Math.floor(t / c.props.base) + ' …… ' + (t % c.props.base) + '，这一位是 ' + (t % c.props.base).toString(16).toUpperCase(), null, 'place.carry');
            c.because('count', '数一数一共有几位', 'place.carry'); c.because('sum', '每一位上的数字加起来', 'place.carry');
          }
          return { count: num(Q(ds.length)), sum: num(Q(ds.reduce((s, x) => s + x, 0))) };
        },
        badge: (c) => c.props.base + ' 进制',
        draw: (c) => {
          const v = K.first(c.d && c.d.inp && c.d.inp.v), n = intOf(v), B = c.props.base, W = c.props.width, k = Math.min(34, (c.w - 16) / W), x0 = (c.w - k * W) / 2;
          let ds = []; if (n !== null && n >= 0) { let m = n; if (m === 0) ds = [0]; while (m > 0) { ds.unshift(m % B); m = Math.floor(m / B); } }
          let s = '';
          for (let i = 0; i < W; i++) {
            const idx = W - 1 - i, d = ds[ds.length - 1 - idx], x = x0 + i * k;
            s += K.rect(x + 2, 14, k - 4, k + 6, { stroke: 'var(--ink)', r: 4, fill: d === undefined ? 'none' : '#f08a1c22' });
            if (d !== undefined) s += K.text(x + k / 2, 14 + k * 0.78, d.toString(16).toUpperCase(), { size: k * 0.55, weight: 700 });
            if (c.props.weights) s += K.text(x + k / 2, 14 + k + 22, B ** idx >= 1e5 ? B + '^' + idx : B ** idx, { size: 10, fill: 'var(--dim)' });
          }
          return s;
        },
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
