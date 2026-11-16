/* 器材包 groupbench：分一分（带余除法、抽屉原理）。一堆圆片，两种分法：
 *   - 每份几个（包含除）：拖下面的把手改“每份几个”，圆片每这么多个圈一圈；圈不满的就是余数（标红）。
 *   - 平均分给几份（等分除）：点 + − 改有几个盒子；点“放一个”“放一轮”“全放完”，圆片一个一个轮流放进盒子。放完以后看最多的盒子有几个。
 * 上面的算式跟着变：17 ÷ 5 = 3 …… 2。余数永远比除数小。
 * 这一版的边界（如实写）：最多 100 个圆片；每份最多 20 个、最多 10 个盒子；三位数除以两位数那种大数，圆片画不下，还在用旧器材。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 660, NMAX = 100, GMAX = 20, BMAX = 10, X0 = 30, Y0 = 92, D = 22, SX = 40, SX1 = 420, SY = 340;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? +v : lo));
  function model(p) {
    const n = clamp(p.n, 1, NMAX), mode = clamp(p.mode, 0, 1);
    if (mode === 0) { const g = clamp(p.g, 1, Math.min(GMAX, n)); return { mode, n, g, q: Math.floor(n / g), r: n % g }; }
    const k = clamp(p.k, 1, BMAX), dealt = clamp(p.dealt, 0, n), box = Array.from({ length: k }, (_, i) => Math.floor(dealt / k) + (i < dealt % k ? 1 : 0));
    return { mode, n, k, dealt, box, max: Math.max.apply(null, box), min: Math.min.apply(null, box), q: Math.floor(n / k), r: n % k };
  }
  const btn = (x, y, w, label, patch, enabled, tip) => '<g' + (enabled ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' data-off="1"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 26, { fill: enabled ? '#fff' : '#f1f3f6', stroke: enabled ? 'var(--blue)' : '#b8c0cc', r: 8, w: 1.5 }) + K.text(x + w / 2, y + 17, label, { size: 12, weight: 700, fill: enabled ? 'var(--ink)' : '#5f6773' }) + '</g>';
  const chip = (x, y, col) => K.circle(x, y, 8, { fill: col, stroke: 'var(--ink)', w: 1.1 });

  function draw(c) {
    const p = c.props, m = model(p), u = p.unit || '个', gname = p.gname || (m.mode ? '盒' : '份'); let s = '';
    if (m.mode === 0) {
      s += K.text(20, 28, m.n + ' ' + u + '，每 ' + m.g + ' ' + u + '一' + gname, { size: 16, weight: 700, anchor: 'start' });
      s += '<g data-eq="1">' + K.text(20, 54, m.n + ' ÷ ' + m.g + ' = ' + m.q + (m.r ? ' …… ' + m.r : ''), { size: 18, weight: 700, anchor: 'start', fill: m.r ? 'var(--ink)' : 'var(--good)' }) + '</g>';
      s += K.text(260, 54, m.q + ' ' + gname + (m.r ? '，还剩 ' + m.r + ' ' + u + '（不够一' + gname + '）' : '，正好分完'), { size: 13, anchor: 'start', fill: m.r ? 'var(--bad)' : 'var(--good)' });
      // 每一组排成一行（组太多就折成两列）
      const ng = m.q + (m.r ? 1 : 0), cols = Math.ceil(ng / 11), colW = 610 / cols, st = Math.min(19, (colW - 24) / m.g);   // 组多就折成几列，圆片挤一点
      for (let gi = 0; gi < m.q + (m.r ? 1 : 0); gi++) {
        const cx = X0 + (gi % cols) * colW, cy = Y0 + Math.floor(gi / cols) * D, cnt = gi < m.q ? m.g : m.r, full = gi < m.q;
        s += '<rect data-group="' + gi + '" x="' + (cx - 11) + '" y="' + (cy - 10) + '" width="' + (cnt * st + 4) + '" height="20" rx="10" fill="none" stroke="' + (full ? 'var(--blue)' : 'var(--bad)') + '" stroke-width="1.6"' + (full ? '' : ' stroke-dasharray="4 3"') + '/>';
        for (let j = 0; j < cnt; j++) s += chip(cx + j * st, cy, full ? '#f5c26b' : '#f7a8a8');
      }
      // 把手：每份几个
      const sx = (g) => SX + (g - 1) * (SX1 - SX) / (GMAX - 1);
      s += K.line(SX, SY, SX1, SY, { w: 3, stroke: '#c5ccda' }) + K.text(SX, SY - 12, '每' + gname + '几' + u + '：拖蓝色把手', { size: 12, anchor: 'start', fill: '#5a6478' });
      for (const g of [1, 5, 10, 15, 20]) s += K.text(sx(g), SY + 18, String(g), { size: 10, fill: '#5a6478' });
    } else {
      s += K.text(20, 28, m.n + ' ' + u + '，平均放进 ' + m.k + ' 个' + (p.gname || '盒子'), { size: 16, weight: 700, anchor: 'start' });
      s += K.text(20, 54, '已经放了 ' + m.dealt + ' ' + u + '，还剩 ' + (m.n - m.dealt) + ' ' + u, { size: 13, anchor: 'start' });
      s += btn(20, 64, 72, '放一个', { dealt: m.dealt + 1 }, m.dealt < m.n, '把一个放进下一个盒子');
      s += btn(98, 64, 72, '放一轮', { dealt: Math.min(m.n, m.dealt + m.k) }, m.dealt < m.n, '每个盒子各放一个');
      s += btn(176, 64, 72, '全放完', { dealt: m.n }, m.dealt < m.n, '一直轮流放，直到放完');
      s += btn(254, 64, 60, '倒出来', { dealt: 0 }, m.dealt > 0, '重新放');
      s += K.text(330, 82, '盒子：', { size: 12, anchor: 'start' }) + btn(372, 64, 28, '−', { k: m.k - 1, dealt: 0 }, m.k > 1, '少一个盒子') + btn(404, 64, 28, '+', { k: m.k + 1, dealt: 0 }, m.k < BMAX, '多一个盒子');
      const bw = Math.min(58, 600 / m.k - 6);
      m.box.forEach((cnt, i) => {
        const x = 20 + i * (bw + 6), hot = m.dealt === m.n && cnt === m.max && m.max > m.min;
        s += '<rect data-box="' + i + '" x="' + x + '" y="110" width="' + bw + '" height="200" rx="6" fill="' + (hot ? '#fde9d2' : '#f6f8fc') + '" stroke="' + (hot ? '#c0392b' : 'var(--ink)') + '" stroke-width="' + (hot ? 2.2 : 1.4) + '"/>';
        for (let j = 0; j < cnt; j++) s += chip(x + 12 + (j % 3) * 17, 296 - Math.floor(j / 3) * 17, '#f5c26b');
        s += K.text(x + bw / 2, 328, String(cnt), { size: 13, weight: 700, fill: hot ? '#c0392b' : 'var(--ink)' });
      });
      if (m.dealt === m.n) s += '<g data-eq="1">' + K.text(20, 354, m.n + ' ÷ ' + m.k + ' = ' + m.q + (m.r ? ' …… ' + m.r + '：多出来的 ' + m.r + ' ' + u + '又放进了 ' + m.r + ' 个盒子，最多的盒子有 ' + m.max + ' ' + u : '：每个盒子正好 ' + m.q + ' ' + u), { size: 14, weight: 700, anchor: 'start', fill: m.r ? '#c0392b' : 'var(--good)' }) + '</g>';
    }
    return s;
  }
  function grips(c) {
    const m = model(c.props); if (m.mode !== 0) return [];
    const sx = (g) => SX + (g - 1) * (SX1 - SX) / (GMAX - 1);
    return [{ id: 'g', x: sx(m.g), y: SY, r: 10, shape: 'bar-v', cursor: 'ew-resize', tip: '拖我：每份几个',
      drag: (c0, q) => ({ g: clamp(Math.round((q.x - SX) / ((SX1 - SX) / (GMAX - 1))) + 1, 1, Math.min(GMAX, model(c0.props).n)) }),
      say: (c1) => { const m1 = model(c1.props); return m1.n + ' ÷ ' + m1.g + ' = ' + m1.q + (m1.r ? ' …… ' + m1.r : ''); } }];
  }
  const I = (lo, hi, d, label, o) => Object.assign({ type: 'int', label, default: d, min: lo, max: hi, write: true }, o || {});
  U.registerPack({
    id: 'groupbench', version: 1,
    types: {
      groupbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E2', 'E7'],
        label: '分一分（带余除法）', prefix: '分一分', group: '数与运算', grades: [2, 6],
        alias: ['除法', '有余数的除法', '带余除法', '平均分', '包含除', '抽屉原理', '鸽巢原理', '余数'],
        props: {
          mode: { type: 'choice', label: '怎么分', default: 0, choices: ['每份几个', '平均分给几份'], write: true },
          n: I(1, NMAX, 17, '一共几个'), g: I(1, GMAX, 5, '每份几个'), k: I(1, BMAX, 3, '分给几份（盒子）'), dealt: I(0, NMAX, 0, '已经放了几个（自动）', { hidden: true }),
          unit: { type: 'text', label: '东西的单位', default: '个', write: true }, gname: { type: 'text', label: '一份叫什么', default: '', write: true },
        },
        outputs: {
          q: { dim: null, kind: 'num', label: '商' }, r: { dim: null, kind: 'num', label: '余数' }, exact: { dim: null, kind: 'num', label: '正好分完：1 是，0 否' },
          g: { dim: null, kind: 'num', label: '每份几个（每份几个的分法）' }, max: { dim: null, kind: 'num', label: '最多的盒子有几个（放完了才有）' },
        },
        icon: () => '<rect x="8" y="14" width="34" height="14" rx="7" fill="none" stroke="var(--blue)" stroke-width="1.5"/>' + K.circle(15, 21, 4, { fill: '#f5c26b', stroke: 'var(--ink)', w: 1 }) + K.circle(25, 21, 4, { fill: '#f5c26b', stroke: 'var(--ink)', w: 1 }) + K.circle(35, 21, 4, { fill: '#f5c26b', stroke: 'var(--ink)', w: 1 }) + K.circle(50, 21, 4, { fill: '#f7a8a8', stroke: 'var(--ink)', w: 1 }),
        size: () => [W, 412],
        grips,
        compute: (c) => { const m = model(c.props), o = { q: num(m.q), r: num(m.r), exact: num(m.r === 0 ? 1 : 0) }; if (m.mode === 0) o.g = num(m.g); else if (m.dealt === m.n) o.max = num(m.max); return o; },
        badge: () => '',
        draw,
      },
    },
  });
  U.GroupBench = { model };
})(typeof globalThis !== 'undefined' ? globalThis : window);
