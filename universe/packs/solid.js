/* 器材包 solid：正多边形。（长方体、数据表已经删掉：长方体在“积木与三视图”操作台上搭，数据在“数据与统计图”上。） */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (q, dim, exact) => U.val('num', q, { dim: dim || null, exact: exact !== false });

  U.registerPack({
    id: 'solid', version: 1,
    types: {
      polygon: {
        hidden: true, retired: true,   // 已经有操作台代替：不上器材架、搜不到；只留给内核测试当样板
        workspaceRole: 'none',
        handles: true,
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

    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
