/* 器材包 vennbench：集合圈（重叠问题）。两个圈，左边是甲圈，右边是乙圈，中间重叠。
 * 全部在图上直接动手：
 *   - 把右边托盘里的一个一个拖进来：只在甲圈、只在乙圈、两个圈重叠的地方、两个圈外面。放错了可以再拖走。
 *   - 上面一直写着：甲圈里几个、乙圈里几个、中间几个、两个圈一共圈住几个。
 *   - 中间有东西时写出：甲圈 + 乙圈 = 多少，但中间的数了两次，要减掉一次。
 *   - 出题人可以给每个东西规定“应该在哪”（比如 2 的倍数、3 的倍数）：放错的会有红圈，并数出放对了几个。
 * 能做的题：重叠问题（两项都参加的只算一次）、分类（倍数、奇偶、图形的特征）、“两样都不”的有几个。
 * 大数（2026-11-28，docs/instrument-design.md 的“补旧上限的台”）：最多 50 个（一个班 40–50 人）。20 个以内和以前一样；
 *   再多就画小一点（圆片半径 7.5，一格 17 像素，每个区域按格子排满），托盘上面多一叠“10 个一起”：拖它，一次放进 10 个（不够 10 个就放剩下的）。
 * 这一版的边界（如实写）：只有两个圈；每个区域的位置有限（20 个以内：只在一个圈 15 个、重叠 10 个、圈外 15 个；更多时按格子算，重叠的地方 20 多个）。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 660, CA = { x: 222, y: 196 }, CB = { x: 362, y: 196 }, R = 112, FR = { x: 36, y: 66, w: 458, h: 284 }, TR = { x: 510, y: 66, w: 134, h: 284 }, SMALL = 20, NMAX = 50, STEP = 17, DR = 7.5;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  // 每个区域里摆东西的位置：0 托盘，1 只在甲，2 重叠，3 只在乙，4 两个圈外面
  const SLOTS = (() => {
    const s = [[], [], [], [], []], ys = [136, 166, 196, 226, 256];
    for (let i = 0; i < SMALL; i++) s[0].push({ x: TR.x + 22 + (i % 4) * 30, y: TR.y + 44 + Math.floor(i / 4) * 30 });
    for (const y of ys) for (const x of [142, 172, 202]) { s[1].push({ x, y }); s[3].push({ x: CA.x + CB.x - x, y }); }
    for (const y of ys) for (const x of [277, 307]) s[2].push({ x, y });
    for (let i = 0; i < 15; i++) s[4].push({ x: FR.x + 22 + i * 29.5, y: FR.y + FR.h - 18 });
    return s;
  })();
  // 多于 20 个：圆片小一点，按 17 像素的格子排满每个区域（离圈的边、框的边至少 9 像素，不压着圈名和“两个圈外面”几个字）
  const SLOTS_BIG = (() => {
    const s = [[], [], [], [], []], far = (x, y) => Math.abs(Math.hypot(x - CA.x, y - CA.y) - R) >= 9 && Math.abs(Math.hypot(x - CB.x, y - CB.y) - R) >= 9;
    const noLabel = (x, y) => !(x < FR.x + 92 && y > FR.y + FR.h - 54 && y < FR.y + FR.h - 26) && Math.hypot(x - (CA.x - 56), y - (CA.y - R + 18)) > 16 && Math.hypot(x - (CB.x + 56), y - (CB.y - R + 18)) > 16;
    for (let i = 0; i < 84; i++) s[0].push({ x: TR.x + 16 + (i % 7) * STEP, y: TR.y + 66 + Math.floor(i / 7) * STEP });
    for (let y = FR.y + 12; y <= FR.y + FR.h - 10; y += STEP) for (let x = FR.x + 12; x <= FR.x + FR.w - 10; x += STEP) { const r = regionAt({ x, y }); if (r > 0 && far(x, y) && noLabel(x, y)) s[r].push({ x, y }); }
    return s;
  })();
  const slotsOf = (n) => (n > SMALL ? SLOTS_BIG : SLOTS);
  const RNAME = (p) => ['托盘', '只在' + (p.na || '甲') + '圈', '两个圈重叠的地方', '只在' + (p.nb || '乙') + '圈', '两个圈外面'];
  function regionAt(q) {
    const inA = Math.hypot(q.x - CA.x, q.y - CA.y) <= R, inB = Math.hypot(q.x - CB.x, q.y - CB.y) <= R;
    if (inA && inB) return 2; if (inA) return 1; if (inB) return 3;
    if (q.x >= FR.x && q.x <= FR.x + FR.w && q.y >= FR.y && q.y <= FR.y + FR.h) return 4;
    return 0;
  }
  function model(p) {
    const labs = String(p.labels || '').split(/[,，]/).map((s) => s.trim()).filter(Boolean), n = clamp(labs.length || p.n, 1, NMAX);
    const where = [], ans = String(p.ans || '').replace(/[^0-4]/g, '');
    const w0 = String(p.where || '').replace(/[^0-4]/g, '');
    for (let i = 0; i < n; i++) where.push(+(w0[i] || 0));
    const cnt = [0, 0, 0, 0, 0]; where.forEach((r) => cnt[r]++);
    let right = 0, wrong = 0; const bad = [];
    if (ans.length >= n) where.forEach((r, i) => { if (r === 0) return; if (r === +ans[i]) right++; else { wrong++; bad.push(i); } });
    return { n, labs: Array.from({ length: n }, (_, i) => labs[i] || String(i + 1)), where, cnt, onlyA: cnt[1], both: cnt[2], onlyB: cnt[3], out: cnt[4], inA: cnt[1] + cnt[2], inB: cnt[3] + cnt[2], union: cnt[1] + cnt[2] + cnt[3], placed: n - cnt[0],
      checked: ans.length >= n, right, wrong, bad, allright: ans.length >= n && cnt[0] === 0 && wrong === 0 ? 1 : 0 };
  }
  // 每个东西画在哪：同一个区域里按编号顺序排
  function places(m) { const S = slotsOf(m.n), used = [0, 0, 0, 0, 0]; return m.where.map((r) => S[r][Math.min(used[r]++, S[r].length - 1)]); }
  function plan(p0, gid, q) {
    const m = model(p0), r = regionAt(q), S = slotsOf(m.n);
    // “10 个一起”：托盘里编号最小的 10 个（不够就剩下的）一起放进去，放不下的留在托盘
    if (gid === 'ten') {
      if (r === 0) return { patch: {}, fx: { i: -1, r, ten: 0 } };
      const w = m.where.slice(), room = S[r].length - m.cnt[r]; let k = 0;
      for (let j = 0; j < m.n && k < Math.min(10, room); j++) if (w[j] === 0) { w[j] = r; k++; }
      return k ? { patch: { where: w.join('') }, fx: { i: -1, r, ten: k } } : { patch: {}, fx: { i: -1, r, ten: 0, full: true } };
    }
    const i = +gid.slice(1);
    if (r === m.where[i]) return { patch: {}, fx: { i, r } };
    if (m.cnt[r] >= S[r].length) return { patch: {}, fx: { i, r, full: true } };
    const w = m.where.slice(); w[i] = r;
    return { patch: { where: w.join('') }, fx: { i, r } };
  }
  const dot = (x, y, tx, bad, small, big) => (big ? K.circle(x, y, DR, { fill: '#fde9a8', stroke: bad ? 'var(--bad)' : 'var(--ink)', w: bad ? 2.2 : 1 }) + K.text(x, y + 3, tx, { size: tx.length > 2 ? 6 : 8, weight: 700 })
    : K.circle(x, y, 12, { fill: '#fde9a8', stroke: bad ? 'var(--bad)' : 'var(--ink)', w: bad ? 2.6 : 1.3 }) + K.text(x, y + 4, tx, { size: tx.length > 2 ? 9 : small ? 10 : 12, weight: 700 }));
  // 托盘上面那一叠“10 个一起”（多于 20 个、托盘里还有的时候）
  const TEN = { x: TR.x + TR.w / 2, y: TR.y + 42 };
  const tenChip = (x, y, k) => '<g data-ten="' + k + '">' + K.rect(x - 40, y - 11, 80, 22, { fill: '#fff6d6', stroke: 'var(--ink)', r: 6, w: 1.2 }) + [0, 1, 2].map((j) => K.circle(x - 31 + j * 4, y, 5, { fill: '#fde9a8', stroke: 'var(--ink)', w: 0.8 })).join('') + K.text(x + 9, y + 4, k + ' 个一起', { size: 10, weight: 700 }) + '</g>';

  function draw(c) {
    const p = c.props, m = model(p), na = p.na || '甲', nb = p.nb || '乙', u = p.unit || '个', pl = places(m);
    const dg = c.drag ? plan(c.drag.p0, c.drag.grip, c.drag) : null, fx = dg && dg.fx;
    let s = '';
    s += K.text(20, 24, na + '圈里 ' + m.inA + ' ' + u + '　' + nb + '圈里 ' + m.inB + ' ' + u + '　中间 ' + m.both + ' ' + u + '　两个圈一共圈住 ' + m.union + ' ' + u, { size: 14, weight: 700, anchor: 'start' });
    const line2 = fx ? (fx.full ? '这里放不下了' : fx.ten !== undefined ? (fx.ten ? '放到：' + RNAME(p)[fx.r] + '（' + fx.ten + ' 个一起）' : '拖到一个圈里、中间，或者圈外面') : '放到：' + RNAME(p)[fx.r]) : m.checked && m.placed ? '放对 ' + m.right + ' 个' + (m.wrong ? '，放错 ' + m.wrong + ' 个（红圈）' : '') : m.both > 0 ? m.inA + ' + ' + m.inB + ' = ' + (m.inA + m.inB) + '，中间的 ' + m.both + ' ' + u + '数了两次：' + (m.inA + m.inB) + ' − ' + m.both + ' = ' + m.union
      : m.checked && m.placed ? '放对 ' + m.right + ' 个' + (m.wrong ? '，放错 ' + m.wrong + ' 个（红圈）' : '') : '把右边的一个一个拖进来';
    s += '<g data-line2="1">' + K.text(20, 48, line2, { size: 13, weight: 700, anchor: 'start', fill: fx ? 'var(--blue)' : m.wrong ? 'var(--bad)' : 'var(--ink)' }) + '</g>';
    s += K.rect(FR.x, FR.y, FR.w, FR.h, { fill: fx && fx.r === 4 ? '#f3f6fb' : 'none', stroke: '#8a94a8', r: 10, w: 1.2 });
    const hl = (r) => (fx && fx.r === r ? 0.34 : 0.16);
    s += '<circle cx="' + CA.x + '" cy="' + CA.y + '" r="' + R + '" fill="#f5a25d" fill-opacity="' + (fx && fx.r === 2 ? 0.26 : hl(1)) + '" stroke="#8a4a12" stroke-width="2"/>';
    s += '<circle cx="' + CB.x + '" cy="' + CB.y + '" r="' + R + '" fill="#5b9bd5" fill-opacity="' + (fx && fx.r === 2 ? 0.26 : hl(3)) + '" stroke="#2f4a73" stroke-width="2"/>';
    s += K.text(CA.x - 56, CA.y - R + 22, na, { size: 14, weight: 700, fill: '#8a4a12' }) + K.text(CB.x + 56, CB.y - R + 22, nb, { size: 14, weight: 700, fill: '#2f4a73' });
    s += K.text(FR.x + 10, FR.y + FR.h - 38, '两个圈外面', { size: 11, anchor: 'start', fill: '#5a6478' });
    s += K.rect(TR.x, TR.y, TR.w, TR.h, { fill: fx && fx.r === 0 ? '#f3f6fb' : 'none', stroke: '#8a94a8', r: 10, w: 1.2 }) + K.text(TR.x + TR.w / 2, TR.y + 20, '还没放的：' + m.cnt[0], { size: 12, weight: 700 });
    const big = m.n > SMALL, tenK = Math.min(10, m.cnt[0]);
    m.where.forEach((r, i) => { if (c.drag && c.drag.grip === 'i' + i) return; s += dot(pl[i].x, pl[i].y, m.labs[i], m.bad.includes(i), false, big); });
    if (big && tenK > 1 && !(c.drag && c.drag.grip === 'ten')) s += tenChip(TEN.x, TEN.y, tenK);
    if (c.drag && c.drag.grip === 'ten') { const k0 = Math.min(10, model(c.drag.p0).cnt[0]); s += '<g data-carry="1">' + tenChip(c.drag.x, c.drag.y, k0) + '</g>'; }
    else if (c.drag) { const i = +c.drag.grip.slice(1); s += '<g data-carry="1">' + dot(c.drag.x, c.drag.y, m.labs[i] || '', false, false, big) + '</g>'; }
    return s;
  }
  function grips(c) {
    const m = model(c.props), pl = places(m), names = RNAME(c.props);
    const big = m.n > SMALL, out = m.where.map((r, i) => ({ id: 'i' + i, x: pl[i].x, y: pl[i].y, r: big ? DR : 12, ghost: true, cursor: 'grab', tip: '拖到一个圈里、中间，或者圈外面',
      drag: (c0, q) => plan(c0.props, 'i' + i, q).patch,
      say: (c1) => names[model(c1.props).where[i]] }));
    // 多于 20 个：托盘上那一叠，一次拖 10 个
    if (big && m.cnt[0] > 1) out.push({ id: 'ten', x: TEN.x, y: TEN.y, r: 13, ghost: true, cursor: 'grab', tip: '拖这一叠：一次放进 ' + Math.min(10, m.cnt[0]) + ' 个',
      drag: (c0, q) => plan(c0.props, 'ten', q).patch, say: () => '一次放 ' + Math.min(10, m.cnt[0]) + ' 个' });
    return out;
  }
  const I = (lo, hi, d, label, o) => Object.assign({ type: 'int', label, default: d, min: lo, max: hi, write: true }, o || {});
  const T = (d, label, o) => Object.assign({ type: 'text', label, default: d, write: true }, o || {});
  U.registerPack({
    id: 'vennbench', version: 1,
    types: {
      vennbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E7', 'E2'],
        label: '集合圈（重叠问题）', prefix: '集合圈', group: '关系', grades: [3, 8],
        alias: ['集合', '韦恩图', '重叠问题', '容斥', '分类', '交集', '并集', '两样都'],
        props: {
          n: I(1, NMAX, 12, '一共几个（没写名字时用）', { qmax: SMALL }), labels: T('', '每个东西上写什么（用逗号隔开，可以不填）'),
          na: T('甲', '左边的圈叫什么'), nb: T('乙', '右边的圈叫什么'), unit: T('个', '数的是什么'),
          where: T('', '每个东西现在在哪（自动记录）', { hidden: true }), ans: T('', '每个东西应该在哪（出题人设：1 只在左圈，2 重叠，3 只在右圈，4 圈外）', { hidden: true }),
        },
        outputs: {
          inA: { dim: null, kind: 'num', label: '左圈里一共几个（含重叠）' }, inB: { dim: null, kind: 'num', label: '右圈里一共几个（含重叠）' }, both: { dim: null, kind: 'num', label: '重叠的地方几个' },
          union: { dim: null, kind: 'num', label: '两个圈一共圈住几个' }, out: { dim: null, kind: 'num', label: '两个圈外面几个' }, placed: { dim: null, kind: 'num', label: '已经放了几个' },
          right: { dim: null, kind: 'num', label: '放对几个（有标准答案时）' }, wrong: { dim: null, kind: 'num', label: '放错几个' }, allright: { dim: null, kind: 'num', label: '全部放对：1 是，0 否' },
        },
        icon: () => '<circle cx="24" cy="24" r="14" fill="#f5a25d" fill-opacity="0.35" stroke="var(--ink)" stroke-width="1.4"/><circle cx="40" cy="24" r="14" fill="#5b9bd5" fill-opacity="0.35" stroke="var(--ink)" stroke-width="1.4"/>',
        size: () => [W, 396],
        grips,
        compute: (c) => { const m = model(c.props); return { inA: num(m.inA), inB: num(m.inB), both: num(m.both), union: num(m.union), out: num(m.out), placed: num(m.placed), right: num(m.right), wrong: num(m.wrong), allright: num(m.allright) }; },
        badge: () => '',
        draw,
      },
    },
  });
  U.VennBench = { model, plan, regionAt, SLOTS, SLOTS_BIG, slotsOf, places };
})(typeof globalThis !== 'undefined' ? globalThis : window);
