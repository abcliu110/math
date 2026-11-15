/* 器材包 blocksbench：计数块与数位（docs/instrument-design.md 第 4 节）。一张数位板：百、十、个三栏，里面放着方块。
 * 全部在图上直接拖：
 *   - 把一栏里的块拖到左边一栏：满十个就捆成一个大的（进位）；不够十个，捆不了，会告诉你还差几个。
 *   - 把一栏里的块拖到右边一栏：一个拆成十个小的（退位）。
 *   - “摆数”的用法里，还可以从下面的托盘往栏里拖（加一个），或者把块拖到板子外面（拿走）。
 *   - “加法”的用法里，两个加数的块已经倒在一起了，块的总数不能变，只能捆和拆：把每一栏整理到不超过 9 个，就是答案。
 * 一栏里超过 9 个会标红：这个数位写不下两位数。上面的大数字和“几个百、几个十、几个一”跟着变。
 * 这一版的边界（如实写）：只到百位；每栏最多 19 个；没有减法的“拿走”流程（减法的题只做到“拆一个十”这一步）。
 * 和旧器材的关系：数位板（digits）、十格阵、竖式工作台各管一段，先保留；这一台管的是“十个捆一捆”这个动作本身。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const MODES = ['摆数', '加法'];
  const W = 600, CW = 160, CX = [34, 34 + CW + 8, 34 + 2 * (CW + 8)], MY = 64, MH = 180, CMAX = 19;
  const NAME = ['百', '十', '个'], KEY = ['h', 't', 'o'], UNIT = [100, 10, 1];
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const st = (p) => ({ h: clamp(p.h, 0, CMAX), t: clamp(p.t, 0, CMAX), o: clamp(p.o, 0, CMAX), mode: p.mode });
  const valueOf = (s) => 100 * s.h + 10 * s.t + s.o;
  const standard = (s) => s.h <= 9 && s.t <= 9 && s.o <= 9;

  // 每一栏里第 i 个块画在哪（返回左上角和大小）
  function slot(col, i) {
    const x0 = CX[col] + 8, y1 = MY + MH - 8;
    if (col === 2) return { x: x0 + (i % 10) * 14.4, y: y1 - 13 - Math.floor(i / 10) * 16, w: 12, h: 12 };
    if (col === 1) return { x: x0 + (i % 10) * 14.4, y: y1 - 62 - Math.floor(i / 10) * 68, w: 11, h: 60 };
    return { x: x0 + (i % 3) * 49, y: y1 - 44 - Math.floor(i / 3) * 48, w: 44, h: 44 };
  }
  function block(col, b) {
    const fill = ['#f5c26b', '#8fd19e', '#9fb7d9'][col], stroke = ['#8a5a00', '#1f6a34', '#2f4a73'][col];
    let s = K.rect(b.x, b.y, b.w, b.h, { fill, stroke, r: 2, w: 1.2 });
    if (col === 1) for (let j = 1; j < 10; j++) s += K.line(b.x, b.y + j * 6, b.x + b.w, b.y + j * 6, { w: 0.5, stroke });
    if (col === 0) for (let j = 1; j < 10; j++) s += K.line(b.x + j * 4.4, b.y, b.x + j * 4.4, b.y + b.h, { w: 0.35, stroke }) + K.line(b.x, b.y + j * 4.4, b.x + b.w, b.y + j * 4.4, { w: 0.35, stroke });
    return s;
  }
  const colAt = (q) => (q.y < MY - 10 || q.y > MY + MH + 10 ? -1 : q.x >= CX[0] && q.x <= CX[0] + CW ? 0 : q.x >= CX[1] && q.x <= CX[1] + CW ? 1 : q.x >= CX[2] && q.x <= CX[2] + CW ? 2 : -1);
  const TRAY_Y = MY + MH + 38, TRAY = [{ x: CX[0] + 58, y: TRAY_Y, w: 44, h: 44 }, { x: CX[1] + 74, y: TRAY_Y, w: 11, h: 60 }, { x: CX[2] + 74, y: TRAY_Y + 16, w: 12, h: 12 }];

  function draw(c) {
    const p = c.props, s = st(p), v = valueOf(s); let h = '';
    for (let col = 0; col < 3; col++) {
      const n = s[KEY[col]], over = n > 9;
      h += K.rect(CX[col], MY, CW, MH, { fill: over ? '#fde8e8' : '#fff', stroke: over ? 'var(--bad)' : '#8a94a8', r: 8, w: over ? 2.5 : 1.4 });
      h += K.text(CX[col] + CW / 2, MY - 10, NAME[col] + '位：' + n + ' 个' + (over ? '（超过 9，要捆）' : ''), { size: 13, weight: 700, fill: over ? 'var(--bad)' : 'var(--ink)' });
      for (let i = 0; i < n; i++) h += block(col, slot(col, i));
    }
    const parts = [s.h ? s.h + ' 个百' : '', s.t ? s.t + ' 个十' : '', s.o || (!s.h && !s.t) ? s.o + ' 个一' : ''].filter(Boolean).join(' + ');
    if (p.mode === 1) h += K.text(W / 2, 30, p.a + ' + ' + p.b + ' = ' + (standard(s) && !c.masked ? v : '？'), { size: 22, weight: 700 });
    else h += K.text(W / 2, 30, c.masked ? '？' : String(v), { size: 24, weight: 700 });
    h += K.text(W - 30, 30, standard(s) ? '' : '还没整理好', { size: 12, anchor: 'end', fill: 'var(--bad)', weight: 700 });
    h += K.text(W / 2, MY + MH + 22, parts + ' = ' + v, { size: 14 });
    if (p.mode === 0) {
      for (let col = 0; col < 3; col++) h += block(col, TRAY[col]);
      h += K.text(W / 2, TRAY_Y + 82, '从这里往栏里拖：加一个；把块拖到板子外面：拿走', { size: 12 });
    } else h += K.text(W / 2, TRAY_Y + 20, '块的总数不变：往左拖是“十个捆成一个”，往右拖是“一个拆成十个”', { size: 12 });
    return h;
  }

  function grips(c) {
    const p = c.props, s = st(p), out = [];
    for (let col = 0; col < 3; col++) {
      const n = s[KEY[col]]; if (!n) continue;
      const b = slot(col, n - 1);
      out.push({ id: 'c' + col, x: b.x + b.w / 2, y: b.y + b.h / 2, r: Math.max(9, Math.min(b.w, b.h) / 2 + 3), ghost: true, cursor: 'grab',
        tip: col === 0 ? '往右拖：一个百拆成十个十' : '往左拖：十个捆成一个；往右拖：一个拆成十个',
        drag: (c0, q) => {
          const s0 = st(c0.props), to = colAt(q), k = KEY[col], n0 = s0[k];
          if (to === col) return {};
          if (to === -1) { if (c0.props.mode !== 0) return {}; const o = {}; o[k] = n0 - 1; return o; }            // 拿走（只在“摆数”里）
          if (to === col - 1) { if (n0 < 10 || s0[KEY[to]] >= CMAX) return {}; const o = {}; o[k] = n0 - 10; o[KEY[to]] = s0[KEY[to]] + 1; return o; }   // 捆
          if (to === col + 1) { if (s0[KEY[to]] + 10 > CMAX) return {}; const o = {}; o[k] = n0 - 1; o[KEY[to]] = s0[KEY[to]] + 10; return o; }          // 拆
          return {};
        },
        say: (c1) => { const s1 = st(c1.props); return s1.h + ' 个百、' + s1.t + ' 个十、' + s1.o + ' 个一'; } });
    }
    if (p.mode === 0) for (let col = 0; col < 3; col++) {
      const b = TRAY[col];
      out.push({ id: 's' + col, x: b.x + b.w / 2, y: b.y + b.h / 2, r: Math.max(10, Math.min(b.w, b.h) / 2 + 4), ghost: true, cursor: 'grab', tip: '拖到' + NAME[col] + '位那一栏：加一个',
        drag: (c0, q) => { const s0 = st(c0.props); if (colAt(q) !== col || s0[KEY[col]] >= CMAX) return {}; const o = {}; o[KEY[col]] = s0[KEY[col]] + 1; return o; },
        say: (c1) => String(valueOf(st(c1.props))) });
    }
    return out;
  }

  const I = (lo, hi, d, label, o) => Object.assign({ type: 'int', label, default: d, min: lo, max: hi, write: true }, o || {});
  U.registerPack({
    id: 'blocksbench', version: 1,
    types: {
      blocksbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E1', 'E5'],
        label: '计数块与数位', prefix: '数位板', group: '数与运算', grades: [1, 4],
        alias: ['数位', '十进制', '进位', '退位', '计数块', '数的组成', '满十进一', '破十', '加法'],
        props: {
          mode: { type: 'choice', label: '用来做什么', default: 0, choices: MODES, write: true },
          h: I(0, CMAX, 0, '百位有几个块'), t: I(0, CMAX, 0, '十位有几个块'), o: I(0, CMAX, 0, '个位有几个块'),
          a: I(0, 999, 27, '加法：第一个加数（只用来写算式）'), b: I(0, 999, 15, '加法：第二个加数（只用来写算式）'),
        },
        outputs: {
          value: { dim: null, kind: 'num', label: '这些块表示的数' },
          hundreds: { dim: null, kind: 'num', label: '百位有几个' },
          tens: { dim: null, kind: 'num', label: '十位有几个' },
          ones: { dim: null, kind: 'num', label: '个位有几个' },
          standard: { dim: null, kind: 'num', label: '每一位都不超过 9：1 是，0 否' },
          blocks: { dim: null, kind: 'num', label: '一共用了几个块' },
        },
        icon: () => K.rect(8, 8, 20, 28, { fill: '#8fd19e', stroke: 'var(--ink)', r: 2 }) + K.rect(34, 26, 8, 8, { fill: '#9fb7d9', stroke: 'var(--ink)', r: 1 }) + K.rect(46, 26, 8, 8, { fill: '#9fb7d9', stroke: 'var(--ink)', r: 1 }),
        size: () => [W, 410],
        grips,
        compute: (c) => { const s = st(c.props); return { value: num(valueOf(s)), hundreds: num(s.h), tens: num(s.t), ones: num(s.o), standard: num(standard(s) ? 1 : 0), blocks: num(s.h + s.t + s.o) }; },
        badge: () => '',
        draw,
      },
    },
  });
  U.BlocksBench = { st, valueOf, standard, MODES };
})(typeof globalThis !== 'undefined' ? globalThis : window);
