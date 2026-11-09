/* 器材包 conserve：量杯倒水。倒水时两杯的水都在变，总量不变：水只是搬了家。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (q, dim, exact) => U.val('num', q, { dim: dim || null, exact: exact !== false });
  const CH = ['不倒', '甲倒进乙'];
  const lo = (x, y) => (Q.cmp(x, y) <= 0 ? x : y);

  U.registerPack({
    id: 'conserve', version: 1,
    types: {
      pour: {
        essence: ['E5', 'E3'],
        label: '量杯倒水', prefix: '杯', group: '数与运算', grades: [3, 6], alias: ['守恒', '倒水', '总量', '量杯'],
        props: {
          A: { type: 'int', label: '甲杯容量', default: 10, min: 1, max: 50 },
          B: { type: 'int', label: '乙杯容量', default: 6, min: 1, max: 50 },
          a: { type: 'num', label: '甲装了', default: 10, min: 0, max: 50, step: 1 },
          b: { type: 'num', label: '乙装了', default: 0, min: 0, max: 50, step: 1 },
          pour: { type: 'choice', label: '倒水', default: 0, choices: CH },
        },
        outputs: { total: { kind: 'num', label: '总量' }, after_a: { kind: 'num', label: '甲剩' }, after_b: { kind: 'num', label: '乙剩' } },
        icon: () => '<rect x="12" y="10" width="16" height="30" rx="3" fill="none" stroke="var(--ink)" stroke-width="2"/><rect x="14" y="22" width="12" height="16" fill="#3b9bff88"/>' +
          '<rect x="36" y="16" width="16" height="24" rx="3" fill="none" stroke="var(--ink)" stroke-width="2"/><rect x="38" y="30" width="12" height="8" fill="#3b9bff88"/>',
        size: () => [250, 200],
        // 无状态：倒水的结果只看当前台面（甲、乙装了多少，倒不倒）。装不下的部分不算，并说明。
        compute: (c) => {
          const p = c.props, QA = Q(p.A), QB = Q(p.B);
          if (p.a > p.A || p.b > p.B) c.say('warn', '装不下的部分不算：甲最多 ' + p.A + '，乙最多 ' + p.B);
          const a0 = lo(Q.fromNumber(Math.max(0, p.a)), QA), b0 = lo(Q.fromNumber(Math.max(0, p.b)), QB);
          const t = p.pour === 1 ? lo(a0, Q.sub(QB, b0)) : Q(0);
          const na = Q.sub(a0, t), nb = Q.add(b0, t), total = Q.add(a0, b0);
          if (p.pour === 1) c.say('ok', '倒了 ' + Q.show(t) + '：甲剩 ' + Q.show(na) + '，乙 ' + Q.show(nb) + '，总量仍是 ' + Q.show(total));
          else c.say('info', '没有倒：甲 ' + Q.show(a0) + '，乙 ' + Q.show(b0) + '，总量 ' + Q.show(total));
          return { total: num(total), after_a: num(na), after_b: num(nb) };
        },
        badge: (c) => (c.out.total ? '总量 ' + Q.show(c.out.total.data) : ''),
        draw: (c) => {
          const p = c.props, M = Math.max(p.A, p.B), H = 110, bottom = c.h - 36;
          const a0 = Math.min(Math.max(0, p.a), p.A), b0 = Math.min(Math.max(0, p.b), p.B);
          let t = 0;
          if (p.pour === 1) t = Math.min(a0, p.B - b0);
          const na = a0 - t, nb = b0 + t;
          const cup = (x, name, cap, fill, after, color) => {
            const hgt = (H * cap) / M, top = bottom - hgt, W = 66, lvl = (v) => bottom - (hgt * v) / cap;
            let s = K.rect(x, top, W, hgt, { r: 6, stroke: 'var(--ink)', w: 2 });
            s += '<rect x="' + (x + 1) + '" y="' + lvl(fill).toFixed(1) + '" width="' + (W - 2) + '" height="' + (hgt * fill / cap).toFixed(1) + '" fill="' + color + '"/>';
            if (p.pour === 1 && after !== fill) s += K.line(x, lvl(after), x + W, lvl(after), { stroke: 'var(--accent)', w: 2, dash: '5 4' });
            s += K.text(x + W / 2, top - 8, name + ' ' + fill + '/' + cap, { size: 12, weight: 700 });
            return s;
          };
          const x1 = c.w / 2 - 84, x2 = c.w / 2 + 18;
          let s = cup(x1, '甲', p.A, a0, na, '#3b9bff88') + cup(x2, '乙', p.B, b0, nb, '#3b9bff88');
          s += K.text(c.w / 2, bottom + 20, p.pour === 1 ? '虚线：倒完后的水位' : '选「甲倒进乙」看水位怎么变', { size: 11, fill: 'var(--dim)' });
          return s;
        },
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
