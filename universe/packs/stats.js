/* 器材包 stats：把“分布”变成数——平均数、众数、总次数。分布 → 数，是值类型之间的桥。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  U.registerPack({
    id: 'stats', version: 1, needs: ['time'],
    types: {
      stats: {
        label: '统计量', prefix: '计', group: '统计与概率', grades: [5, 9], alias: ['平均数', '众数', '期望'],
        props: {
          want: { type: 'choice', label: '求什么', default: 0, choices: ['平均数', '众数', '最大次数', '中位数', '极差'] },
          digits: { type: 'int', label: '保留小数', default: 2, min: 0, max: 6 },
          minN: { type: 'int', label: '至少几次才算', default: 1, min: 1, max: 100000 },
        },
        inputs: { d: { kind: 'dist', label: '分布' } },
        outputs: { v: { kind: 'num', label: '结果' } },
        icon: () => K.text(32, 22, 'x̄', { size: 24, weight: 700 }) + K.line(12, 34, 52, 34, { w: 2 }),
        size: () => [160, 100],
        compute: (c) => {
          const d = K.first(c.inp.d);
          if (!d) { c.say('info', '接一个直方图的分布'); return {}; }
          const cs = d.data.counts, tot = cs.reduce((s, x) => s + x, 0);
          if (tot < c.props.minN) { c.say('info', '数据还不够：' + tot + ' / ' + c.props.minN); return {}; }
          let mi = 0; cs.forEach((x, i) => { if (x > cs[mi]) mi = i; });
          if (c.props.want === 1) return { v: U.val('num', Q(d.data.lo + mi)) };
          if (c.props.want === 2) return { v: U.val('num', Q(cs[mi])) };
          if (c.props.want >= 3) {
            const xs = []; cs.forEach((x, i) => { for (let k = 0; k < x; k++) xs.push(d.data.lo + i); });
            if (c.props.want === 4) return { v: U.val('num', Q(xs[xs.length - 1] - xs[0])) };
            const m = xs.length; return { v: U.val('num', m % 2 ? Q(xs[(m - 1) / 2]) : Q.div(Q(xs[m / 2 - 1] + xs[m / 2]), Q(2))) };
          }
          let sum = 0; cs.forEach((x, i) => { sum += x * (d.data.lo + i); });
          const f = 10 ** c.props.digits;
          return { v: U.val('num', Q(Math.round((sum / tot) * f), f), { exact: false }) };
        },
        badge: (c) => (c.out.v ? U.showVal(c.out.v) : ''),
        draw: (c) => K.text(c.w / 2, c.h / 2 + 10, c.out.v ? Q.showDec(c.out.v.data, 3) : '—', { size: 28, weight: 700, fill: c.out.v ? 'var(--ink)' : 'var(--dim)' }),
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
