/* 器材包 solid：正多边形、长方体、数据表。图形与量、数据整理。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (q, dim, exact) => U.val('num', q, { dim: dim || null, exact: exact !== false });

  U.registerPack({
    id: 'solid', version: 1,
    types: {
      polygon: {
        essence: ['E2', 'E5'],
        label: '正多边形', prefix: '边', group: '图形', grades: [4, 9], alias: ['内角和', '对角线', '多边形', '正六边形'],
        props: {
          n: { type: 'int', label: '几条边', default: 5, min: 3, max: 20 },
          side: { type: 'num', label: '边长', default: 4, min: 0.5, max: 50, step: 0.5 },
          diag: { type: 'bool', label: '画对角线', default: false },
        },
        outputs: { sum: { dim: null, kind: 'num', label: '内角和' }, each: { dim: null, kind: 'num', label: '每个内角' }, perim: { dim: null, kind: 'num', label: '周长' }, diags: { dim: null, kind: 'num', label: '对角线条数' } },
        icon: () => { const p = []; for (let i = 0; i < 6; i++) p.push((32 + 16 * Math.cos(Math.PI / 3 * i - Math.PI / 2)).toFixed(1) + ',' + (22 + 16 * Math.sin(Math.PI / 3 * i - Math.PI / 2)).toFixed(1)); return '<polygon points="' + p.join(' ') + '" fill="#f08a1c33" stroke="var(--ink)" stroke-width="2.5"/>'; },
        size: () => [210, 190],
        compute: (c) => {
          const n = c.props.n, sum = (n - 2) * 180;
          c.say('ok', n + ' 边形：内角和 (n−2)×180° = ' + sum + '°，每个内角 ' + +(sum / n).toFixed(2) + '°');
          return { sum: num(Q(sum)), each: num(Q(sum, n)), perim: num(Q.mul(Q(n), Q.fromNumber(c.props.side)), 'length'), diags: num(Q((n * (n - 3)) / 2)) };
        },
        badge: (c) => c.props.n + ' 边形',
        draw: (c) => {
          const n = c.props.n, R = Math.min(c.w, c.h) / 2 - 18, cx = c.w / 2, cy = c.h / 2, P = [];
          for (let i = 0; i < n; i++) P.push([cx + R * Math.cos((2 * Math.PI * i) / n - Math.PI / 2), cy + R * Math.sin((2 * Math.PI * i) / n - Math.PI / 2)]);
          let s = '<polygon points="' + P.map((p) => p.map((x) => x.toFixed(1)).join(',')).join(' ') + '" fill="#f08a1c33" stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round"/>';
          if (c.props.diag) for (let i = 0; i < n; i++) for (let j = i + 2; j < n; j++) if (!(i === 0 && j === n - 1)) s += K.line(P[i][0], P[i][1], P[j][0], P[j][1], { w: 1, stroke: 'var(--dim)' });
          return s + K.text(cx, cy + 6, +((n - 2) * 180 / n).toFixed(1) + '°', { size: 16, weight: 700, fill: 'var(--accent)' });
        },
      },

      cuboid: {
        essence: ['E2', 'E3'],
        label: '长方体', prefix: '体', group: '图形', grades: [5, 6], alias: ['体积', '表面积', '正方体', '立方体'],
        props: {
          l: { type: 'num', label: '长', default: 4, min: 0.5, max: 30, step: 0.5 },
          w: { type: 'num', label: '宽', default: 3, min: 0.5, max: 30, step: 0.5 },
          h: { type: 'num', label: '高', default: 2, min: 0.5, max: 30, step: 0.5 },
        },
        outputs: { vol: { dim: null, kind: 'num', label: '体积' }, surf: { dim: null, kind: 'num', label: '表面积' }, edges: { dim: null, kind: 'num', label: '棱总长' } },
        icon: () => '<path d="M10 18 H38 V38 H10 Z M38 18 L52 10 V30 L38 38 M10 18 L24 10 H52" fill="#f08a1c33" stroke="var(--ink)" stroke-width="2" stroke-linejoin="round"/>',
        size: () => [230, 170],
        compute: (c) => {
          const l = Q.fromNumber(c.props.l), w = Q.fromNumber(c.props.w), h = Q.fromNumber(c.props.h);
          return { vol: num(Q.mul(Q.mul(l, w), h), 'volume'), surf: num(Q.mul(Q(2), Q.add(Q.add(Q.mul(l, w), Q.mul(l, h)), Q.mul(w, h))), 'area'), edges: num(Q.mul(Q(4), Q.add(Q.add(l, w), h)), 'length') };
        },
        badge: (c) => (c.out.vol ? '体积 ' + Q.showDec(c.out.vol.data, 2) : ''),
        draw: (c) => {
          const l = c.props.l, w = c.props.w, h = c.props.h, k = Math.min((c.w - 70) / (l + w * 0.5), (c.h - 50) / (h + w * 0.5)), dx = w * k * 0.5, dy = w * k * 0.35, x0 = 20, y0 = c.h - 26;
          const A = [x0, y0], B = [x0 + l * k, y0], C = [x0 + l * k, y0 - h * k], D = [x0, y0 - h * k];
          const sh = (p) => [p[0] + dx, p[1] - dy];
          const f = (arr, fill) => '<polygon points="' + arr.map((p) => p.map((x) => x.toFixed(1)).join(',')).join(' ') + '" fill="' + fill + '" stroke="var(--ink)" stroke-width="2" stroke-linejoin="round"/>';
          return f([D, C, sh(C), sh(D)], '#f08a1c55') + f([B, sh(B), sh(C), C], '#f08a1c22') + f([A, B, C, D], '#f08a1c33') + K.text(x0 + l * k / 2, y0 + 16, l, { size: 12, weight: 700 }) + K.text(x0 + l * k + dx / 2 + 12, y0 - dy / 2 + 4, w, { size: 12, weight: 700, anchor: 'start' }) + K.text(x0 - 6, y0 - h * k / 2, h, { size: 12, weight: 700, anchor: 'end' });
        },
      },

      data: {
        essence: ['E11'],
        label: '数据表', prefix: '据', group: '统计与概率', grades: [3, 9], alias: ['平均数', '中位数', '众数', '极差', '一组数据'],
        props: {
          list: { type: 'text', label: '一组数（逗号隔开）', default: '3, 5, 5, 6, 9' },
          lo: { type: 'int', label: '统计从', default: 0, min: -50, max: 50 },
          hi: { type: 'int', label: '统计到', default: 20, min: -49, max: 100 },
        },
        outputs: { dist: { dim: null, kind: 'dist', label: '分布' }, n: { dim: null, kind: 'num', label: '个数' }, mean: { dim: null, kind: 'num', label: '平均数' }, median: { dim: null, kind: 'num', label: '中位数' } },
        icon: () => [0, 1, 2].map((i) => K.line(10, 12 + i * 10, 54, 12 + i * 10, { w: 1.5, stroke: 'var(--dim)' })).join('') + K.text(32, 18, '3 5 9', { size: 11, weight: 700 }),
        size: () => [250, 130],
        compute: (c) => {
          const xs = String(c.props.list).split(/[,，\s]+/).filter(Boolean).map(Number);
          if (!xs.length || xs.some((x) => !Number.isFinite(x))) { c.say('reject', '「一组数」里只能写数字，用逗号隔开'); return {}; }
          if (xs.length > 200) { c.say('reject', '最多 200 个数'); return {}; }
          if (c.props.hi < c.props.lo) { c.say('reject', '“统计到”不能比“统计从”小'); return {}; }
          const srt = xs.slice().sort((a, b) => a - b), n = srt.length, med = n % 2 ? Q.fromNumber(srt[(n - 1) / 2]) : Q.div(Q.add(Q.fromNumber(srt[n / 2 - 1]), Q.fromNumber(srt[n / 2])), Q(2));
          const sum = xs.reduce((s, x) => Q.add(s, Q.fromNumber(x)), Q(0)), counts = new Array(c.props.hi - c.props.lo + 1).fill(0);
          xs.forEach((x) => { if (Number.isInteger(x) && x >= c.props.lo && x <= c.props.hi) counts[x - c.props.lo]++; });
          c.say('ok', n + ' 个数：平均 ' + Q.showDec(Q.div(sum, Q(n)), 3) + '，中位数 ' + Q.showDec(med, 3));
          return { dist: U.val('dist', { lo: c.props.lo, counts }), n: num(Q(n)), mean: num(Q.div(sum, Q(n))), median: num(med) };
        },
        badge: (c) => (c.out.n ? c.out.n.data.n + ' 个数' : ''),
        draw: (c) => {
          const xs = String(c.props.list).split(/[,，\s]+/).filter(Boolean).map(Number).filter(Number.isFinite);
          if (!xs.length) return K.text(c.w / 2, c.h / 2, '没有数据', { fill: 'var(--dim)' });
          const mn = Math.min(...xs), mx = Math.max(...xs), W = c.w - 30, X = (x) => 15 + (mx === mn ? W / 2 : ((x - mn) / (mx - mn)) * W), y = c.h / 2 + 4;
          let s = K.line(10, y, c.w - 10, y, { w: 1.5 }), seen = {};
          xs.forEach((x) => { const k = (seen[x] = (seen[x] || 0) + 1); s += K.circle(X(x), y - 6 - (k - 1) * 11, 5, { fill: 'var(--accent)', stroke: '#fff', w: 1.5 }); });
          [mn, mx].forEach((x) => { s += K.text(X(x), y + 16, x, { size: 11, fill: 'var(--dim)' }); });
          if (c.out.mean) s += '<path d="M' + X(Q.num(c.out.mean.data)) + ',' + (y + 4) + ' l-5,9 h10z" fill="var(--good)"/>' + K.text(X(Q.num(c.out.mean.data)), y + 30, '平均 ' + Q.showDec(c.out.mean.data, 2), { size: 11, fill: 'var(--good)', weight: 700 });
          return s;
        },
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
