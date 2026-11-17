/* 器材包 decbench：小数。用“一”（大方块）、“十分之一”（长条）、“百分之一”（小方块）摆小数；也可以换成元、角、分。
 *   - 摆小数：点 + − 放、拿“一”“十分之一”“百分之一”；10 个百分之一可以换成 1 个十分之一，1 个十分之一也能拆成 10 个百分之一（一和十分之一同理）。
 *     旁边一直写着：几个一、几个十分之一、几个百分之一 = 多少；右边的百格图画出小数部分。
 *   - 合起来（加法、小数乘整数）：点“放进来”，把第二个数的方块放进同一堆；满十的要自己换，换整齐了才读得出和。
 *   - 拿走（减法、除法）：点“拿走”，哪一位不够拿就说明，要先把前一位拆开；可以一次一次拿，正好拿完时拿了几次就是商。
 *   - 小数点移动：数字在数位表里不动，点 ← → 挪小数点：右移一位是 10 倍，左移一位是十分之一。
 *   - 百格乘法：拖宽和高（各是几个十分之一），重叠的小格就是积：0.2 × 0.3 = 6 个百分之一。
 * 这一版的边界（如实写）：只到百分位；一最多 15 个、十分之一最多 40 个、百分之一最多 100 个；小数除法用“拿走”一次一次拿（3.6 ÷ 0.9：拿几次 0.9 正好拿完）。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const qv = (q) => U.val('num', q, { dim: null }), num = (n) => qv(Q(n));
  const W = 700, MAXS = [15, 40, 100];
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? +v : lo));
  const MODES = ['摆小数', '合起来（加法、乘整数）', '拿走（减法、除法）', '小数点移动', '百格乘法'];
  const NAMES = [['一', '十分之一', '百分之一'], ['元', '角', '分']];
  // "3.65" → [3, 6, 5]（个位、十分位、百分位）
  const split = (s) => { const n = Math.round(Number(s || 0) * 100); return [Math.floor(n / 100), Math.floor(n / 10) % 10, n % 10]; };
  const valOf = (c) => Q(c[0] * 100 + c[1] * 10 + c[2], 100);
  const show = (q) => { const v = Q.num(q); return String(Math.round(v * 1000) / 1000); };
  function model(p) {
    const mode = clamp(p.mode, 0, 4), skin = p.skin === 1 || p.skin === true ? 1 : 0, c = [clamp(p.u, 0, MAXS[0]), clamp(p.t, 0, MAXS[1]), clamp(p.h, 0, MAXS[2])];
    const tidy = c.every((x) => x < 10), b = split(p.b), a = split(p.a), shift = clamp(p.shift, -2, 2), gw = clamp(p.gw, 0, 10), gh = clamp(p.gh, 0, 10), k = clamp(p.k, 0, 9);
    return { mode, skin, c, tidy, value: valOf(c), a, b, shift, gw, gh, k, step: clamp(p.step, 0, 99), nm: NAMES[skin] };
  }
  const btn = (x, y, w, label, patch, enabled, tip, active) => '<g' + (enabled ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' data-off="1"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 24, { fill: active ? 'var(--blue)' : enabled ? '#fff' : '#f1f3f6', stroke: enabled ? 'var(--blue)' : '#b8c0cc', r: 7, w: 1.4 }) + K.text(x + w / 2, y + 16, label, { size: 12, weight: 700, fill: active ? '#fff' : enabled ? 'var(--ink)' : '#5f6773' }) + '</g>';
  // 一堆方块：三栏（一、十分之一、百分之一）
  function pile(m, x0, y0) {
    const [u, t, h] = m.c, cw = 150; let s = '';
    m.nm.forEach((n, i) => { s += K.rect(x0 + i * cw, y0, cw - 10, 210, { fill: '#f6f8fc', stroke: '#c5ccda', r: 8, w: 1 }) + K.text(x0 + i * cw + (cw - 10) / 2, y0 - 8, n + '：' + m.c[i] + ' 个', { size: 12, weight: 700, fill: m.c[i] >= 10 ? 'var(--bad)' : 'var(--ink)' }); });
    for (let i = 0; i < u; i++) s += K.rect(x0 + 8 + (i % 3) * 42, y0 + 8 + Math.floor(i / 3) * 40, 38, 36, { fill: '#9fb7d9', stroke: '#2f4a73', r: 2, w: 1.2 });
    for (let i = 0; i < t; i++) s += K.rect(x0 + cw + 8 + (i % 10) * 12, y0 + 8 + Math.floor(i / 10) * 50, 9, 44, { fill: '#f5c26b', stroke: '#8a5a00', r: 1, w: 1 });
    for (let i = 0; i < h; i++) s += K.rect(x0 + 2 * cw + 8 + (i % 10) * 12, y0 + 8 + Math.floor(i / 10) * 20, 9, 9, { fill: '#9fd5ad', stroke: '#1f6a34', r: 1, w: 1 });
    return s;
  }
  // 百格图：小数部分涂色（tidy 时）
  function grid(x0, y0, cells, cols, rows) {
    let s = ''; const c = 12;
    for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) { const on = cols !== undefined ? (j < cols && i >= 10 - rows) : i * 10 + j < cells; s += K.rect(x0 + j * c, y0 + i * c, c, c, { fill: on ? '#f5c26b' : '#fff', stroke: '#c5ccda', r: 0, w: 0.6 }); }
    return s + K.rect(x0, y0, 10 * c, 10 * c, { fill: 'none', stroke: 'var(--ink)', r: 0, w: 1.4 });
  }
  const exch = (m, y) => {
    const [u, t, h] = m.c, P = (o) => Object.assign({ u, t, h }, o);
    return btn(20, y, 212, '10 个' + m.nm[2] + ' → 1 个' + m.nm[1], P({ t: t + 1, h: h - 10 }), h >= 10 && t < MAXS[1], '满十换一个') + btn(240, y, 212, '1 个' + m.nm[1] + ' → 10 个' + m.nm[2], P({ t: t - 1, h: h + 10 }), t >= 1 && h + 10 <= MAXS[2], '拆开') +
      btn(20, y + 30, 212, '10 个' + m.nm[1] + ' → 1 个' + m.nm[0], P({ u: u + 1, t: t - 10 }), t >= 10 && u < MAXS[0], '满十换一个') + btn(240, y + 30, 212, '1 个' + m.nm[0] + ' → 10 个' + m.nm[1], P({ u: u - 1, t: t + 10 }), u >= 1 && t + 10 <= MAXS[1], '拆开');
  };
  const readout = (m) => m.c[0] + ' 个' + m.nm[0] + '、' + m.c[1] + ' 个' + m.nm[1] + '、' + m.c[2] + ' 个' + m.nm[2] + (m.tidy ? ' = ' + show(m.value) + (m.skin ? ' 元' : '') : '：还有满十的没换，先换整齐');

  function draw(c) {
    const p = c.props, m = model(p); let s = '';
    if (m.mode <= 2) {
      const [u, t, h] = m.c, P = (o) => Object.assign({ u, t, h }, o);
      s += '<g data-read="1">' + K.text(20, 26, readout(m), { size: 15, weight: 700, anchor: 'start', fill: m.tidy ? 'var(--ink)' : 'var(--bad)' }) + '</g>';
      s += pile(m, 20, 66);
      if (m.tidy) s += K.text(560, 56, '小数部分', { size: 11, fill: '#5a6478' }) + grid(500, 66, m.c[1] * 10 + m.c[2]);
      if (m.mode === 0) {
        m.nm.forEach((n, i) => { const key = ['u', 't', 'h'][i]; s += btn(20 + i * 150, 284, 34, '−', P({ [key]: m.c[i] - 1 }), m.c[i] > 0, '拿走一个' + n) + btn(58 + i * 150, 284, 34, '+', P({ [key]: m.c[i] + 1 }), m.c[i] < MAXS[i], '放一个' + n); });
        s += exch(m, 318);
      } else if (m.mode === 1) {
        const bs = show(valOf(m.b));
        s += btn(500, 200, 180, '把 ' + bs + ' 放进来（第 ' + Math.min(m.step + 1, m.k || 1) + ' 份）', P({ u: u + m.b[0], t: t + m.b[1], h: h + m.b[2], step: m.step + 1 }), m.step < (m.k || 1) && u + m.b[0] <= MAXS[0] && t + m.b[1] <= MAXS[1] && h + m.b[2] <= MAXS[2], '把第二个数的方块放进同一堆');
        s += K.text(500, 244, '放进来了 ' + m.step + ' / ' + (m.k || 1) + ' 份', { size: 12, anchor: 'start', fill: '#5a6478' });
        s += exch(m, 300);
      } else {
        const bs = show(valOf(m.b)), can = m.c.every((x, i) => x >= m.b[i]), empty = m.c.every((x) => x === 0), why = m.nm.map((n, i) => (m.c[i] < m.b[i] ? n + '不够拿' + (i ? '：先拆开一个' + m.nm[i - 1] : '') : '')).filter(Boolean)[0] || '';
        s += btn(500, 200, 180, '拿走 ' + bs, can ? P({ u: u - m.b[0], t: t - m.b[1], h: h - m.b[2], step: m.step + 1, msg: '' }) : { msg: why }, !empty && Q.num(valOf(m.b)) > 0, '把第二个数拿走：每一位都要够');
        if (p.msg) s += K.text(500, 244, p.msg, { size: 12, weight: 700, anchor: 'start', fill: 'var(--bad)' });
        else if (m.step) s += K.text(500, 244, '拿走了 ' + m.step + ' 次 ' + bs + (empty ? '：正好拿完' : ''), { size: 12, weight: empty ? 700 : 400, anchor: 'start', fill: empty ? 'var(--blue)' : '#5a6478' });
        s += exch(m, 300);
      }
    } else if (m.mode === 3) {
      const v = Q.mul(valOf(m.a), Q(Math.pow(10, m.shift + 2), 100)), labels = ['百', '十', '个', '十分', '百分', '千分', '万分'], vs = Q.num(v).toFixed(4).replace(/0+$/, '').replace(/\.$/, ''), [ip, fp] = (vs.includes('.') ? vs : vs + '.').split('.');
      // 数字固定在“个、十分、百分”三格，小数点跟着 shift 左右挪
      s += K.text(20, 26, show(valOf(m.a)) + ' 的小数点' + (m.shift > 0 ? '向右移 ' + m.shift + ' 位' : m.shift < 0 ? '向左移 ' + (-m.shift) + ' 位' : '没有动') + ' = ' + show(v), { size: 16, weight: 700, anchor: 'start' });
      const X0 = 90, cw = 70;
      labels.forEach((l, i) => { s += K.rect(X0 + i * cw, 70, cw - 4, 90, { fill: '#f6f8fc', stroke: '#c5ccda', r: 6, w: 1 }) + K.text(X0 + i * cw + cw / 2 - 2, 62, l + '位', { size: 11, fill: '#5a6478' }); });
      // 数字移动：右移一位 = 每个数字往左挪一格
      ip.split('').reverse().forEach((d, i) => { const col = 2 - i; if (col >= 0) s += K.text(X0 + col * cw + cw / 2 - 2, 128, d, { size: 32, weight: 700 }); });
      fp.split('').forEach((d, i) => { const col = 3 + i; if (col < labels.length) s += K.text(X0 + col * cw + cw / 2 - 2, 128, d, { size: 32, weight: 700 }); });
      s += K.circle(X0 + 3 * cw - 4, 150, 6, { fill: 'var(--bad)' });
      s += btn(90, 190, 110, '小数点 →', { shift: m.shift + 1 }, m.shift < 2, '向右移一位') + btn(210, 190, 110, '← 小数点', { shift: m.shift - 1 }, m.shift > -2, '向左移一位');
      s += K.text(90, 250, m.shift > 0 ? '向右移 ' + m.shift + ' 位：扩大到 ' + Math.pow(10, m.shift) + ' 倍' : m.shift < 0 ? '向左移 ' + (-m.shift) + ' 位：缩小到 1/' + Math.pow(10, -m.shift) : '（小数点固定在个位后面：挪的其实是数字，每挪一格大 10 倍或小 10 倍）', { size: 13, weight: 700, anchor: 'start', fill: 'var(--blue)' });
    } else {
      s += K.text(20, 26, '0.' + m.gw + ' × 0.' + m.gh + '：宽 ' + m.gw + ' 个十分之一，高 ' + m.gh + ' 个十分之一', { size: 15, weight: 700, anchor: 'start' });
      s += grid(60, 60, 0, m.gw, m.gh) + K.rect(60, 60 + (10 - m.gh) * 12, m.gw * 12, m.gh * 12, { fill: 'none', stroke: 'var(--bad)', r: 0, w: 2 });
      s += btn(60, 200, 30, '−', { gw: m.gw - 1 }, m.gw > 0, '窄一点') + K.text(110, 217, '宽 ' + m.gw, { size: 12, weight: 700 }) + btn(130, 200, 30, '+', { gw: m.gw + 1 }, m.gw < 10, '宽一点');
      s += btn(200, 200, 30, '−', { gh: m.gh - 1 }, m.gh > 0, '矮一点') + K.text(250, 217, '高 ' + m.gh, { size: 12, weight: 700 }) + btn(270, 200, 30, '+', { gh: m.gh + 1 }, m.gh < 10, '高一点');
      s += '<g data-read="1">' + K.text(330, 100, '重叠的小格：' + m.gw + ' × ' + m.gh + ' = ' + m.gw * m.gh + ' 个百分之一', { size: 14, weight: 700, anchor: 'start', fill: 'var(--bad)' }) + K.text(330, 126, '0.' + m.gw + ' × 0.' + m.gh + ' = ' + show(Q(m.gw * m.gh, 100)), { size: 16, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
      s += K.text(330, 152, '十分之一乘十分之一，是百分之一：积有两位小数', { size: 12, anchor: 'start', fill: '#5a6478' });
    }
    return s;
  }
  const I = (lo, hi, d, label, o) => Object.assign({ type: 'int', label, default: d, min: lo, max: hi, write: true }, o || {});
  U.registerPack({
    id: 'decbench', version: 1,
    types: {
      decbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E3', 'E2'],
        label: '小数', prefix: '小数', group: '数与运算', grades: [3, 6],
        alias: ['小数', '十分之一', '百分之一', '元角分', '小数加法', '小数减法', '小数点对齐', '小数点移动', '小数乘法', '百格图'],
        props: {
          mode: { type: 'choice', label: '做什么', default: 0, choices: MODES, write: true },
          skin: { type: 'choice', label: '用什么摆', default: 0, choices: ['方块', '元角分'], write: true },
          u: I(0, MAXS[0], 0, '一（元）有几个'), t: I(0, MAXS[1], 0, '十分之一（角）有几个'), h: I(0, MAXS[2], 0, '百分之一（分）有几个'),
          a: { type: 'text', label: '第一个数', default: '0.25', write: true }, b: { type: 'text', label: '第二个数（放进来、拿走的数）', default: '0.1', write: true },
          k: I(0, 20, 1, '合起来：放进来几份'), step: I(0, 99, 0, '已经放了几份 / 拿走了几次（自动）', { hidden: true }), msg: { type: 'text', label: '提示（自动）', default: '', write: true, hidden: true },
          shift: I(-2, 2, 0, '小数点挪了几位（右是正）'), gw: I(0, 10, 0, '百格乘法：宽'), gh: I(0, 10, 0, '百格乘法：高'),
        },
        outputs: {
          value: { dim: null, kind: 'num', label: '这一堆是多少（换整齐了才有）' }, tidy: { dim: null, kind: 'num', label: '换整齐了：1 是，0 否' }, hcount: { dim: null, kind: 'num', label: '百分之一有几个' }, tcount: { dim: null, kind: 'num', label: '十分之一有几个' },
          step: { dim: null, kind: 'num', label: '放进来了几份 / 拿走了几次' }, times: { dim: null, kind: 'num', label: '正好拿完：拿了几次（拿完才有）' }, shifted: { dim: null, kind: 'num', label: '小数点移动以后的数' }, prod: { dim: null, kind: 'num', label: '百格乘法的积' },
        },
        icon: () => K.rect(8, 12, 20, 20, { fill: '#9fb7d9', stroke: 'var(--ink)', w: 1 }) + K.rect(32, 12, 5, 20, { fill: '#f5c26b', stroke: 'var(--ink)', w: 1 }) + K.rect(40, 12, 5, 20, { fill: '#f5c26b', stroke: 'var(--ink)', w: 1 }) + K.rect(48, 26, 5, 5, { fill: '#9fd5ad', stroke: 'var(--ink)', w: 1 }) + K.text(20, 44, '0.25', { size: 9, weight: 700 }),
        size: () => [W, 400],
        grips: () => [],
        compute: (c) => {
          const m = model(c.props), o = { tidy: num(m.tidy ? 1 : 0), hcount: num(m.c[2]), tcount: num(m.c[1]), step: num(m.step) };
          if (m.tidy) o.value = qv(m.value);
          if (m.mode === 2 && m.step > 0 && m.c.every((x) => x === 0)) o.times = num(m.step);
          if (m.mode === 3) o.shifted = qv(Q.mul(valOf(m.a), Q(Math.pow(10, m.shift + 2), 100)));
          if (m.mode === 4) o.prod = qv(Q(m.gw * m.gh, 100));
          return o;
        },
        badge: () => '',
        draw,
      },
    },
  });
  U.DecBench = { model, split };
})(typeof globalThis !== 'undefined' ? globalThis : window);
