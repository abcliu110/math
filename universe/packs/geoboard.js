/* 器材包 geoboard：钉板（docs/new-instruments.md 6.7）。在格点上围多边形，数格点，自己发现面积公式。
 *   7 × 7 的钉板（0 到 6）。依次点格点围出多边形，点第一个点封口。系统标出边上的格点数 B、内部的格点数 I（面积可以先藏起来，自己割补算）；
 *   把（B、I、面积）记进表；攒够几行，试一个公式 面积 = α·I + β·B + γ：先对表里的行，再对系统内置的 60 个格点多边形扫一遍（②）。
 * 和设计文档的差别（如实写）：这是一台独立的器材（不是几何工作区的模式）；表就放在器材里（最多 12 行），不接数据表器材；
 * 皮克公式只验证、不证明（题目里明说：这是一个定理，证明要到大学）。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const S = 7;
  const num = (n) => U.val('num', typeof n === 'number' ? Q(n) : n, { dim: null });
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  const pts = (s) => String(s || '').split(';').filter(Boolean).map((t) => t.split(',').map(Number));
  // 鞋带公式（整数的二倍面积）；是否简单多边形（边不相交）
  const area2 = (P) => { let a = 0; for (let i = 0; i < P.length; i++) { const p = P[i], q = P[(i + 1) % P.length]; a += p[0] * q[1] - q[0] * p[1]; } return Math.abs(a); };
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const onSeg = (p, q, r) => Math.min(p[0], r[0]) <= q[0] && q[0] <= Math.max(p[0], r[0]) && Math.min(p[1], r[1]) <= q[1] && q[1] <= Math.max(p[1], r[1]);
  const segX = (a, b, c, d) => { const d1 = cross(a, b, c), d2 = cross(a, b, d), d3 = cross(c, d, a), d4 = cross(c, d, b); if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) return true; return (d1 === 0 && onSeg(a, c, b)) || (d2 === 0 && onSeg(a, d, b)) || (d3 === 0 && onSeg(c, a, d)) || (d4 === 0 && onSeg(c, b, d)); };
  function simple(P) {
    const n = P.length; if (n < 3 || area2(P) === 0) return false;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const a = P[i], b = P[(i + 1) % n], c = P[j], d = P[(j + 1) % n];
      if (j === i + 1 || (i === 0 && j === n - 1)) {   // 相邻的两条边：只许共用一个端点，不许重叠
        const sh = j === i + 1 ? b : a, u = j === i + 1 ? a : b, w = j === i + 1 ? d : c;
        if (cross(sh, u, w) === 0 && (u[0] - sh[0]) * (w[0] - sh[0]) + (u[1] - sh[1]) * (w[1] - sh[1]) > 0) return false;
      } else if (segX(a, b, c, d)) return false;
    }
    return true;
  }
  function count(P) {
    let B = 0; for (let i = 0; i < P.length; i++) { const p = P[i], q = P[(i + 1) % P.length]; B += gcd(q[0] - p[0], q[1] - p[1]); }
    const A2 = area2(P);   // 内部点是独立扫描数出来的，不是用皮克公式算的
    let I = 0; for (let x = 0; x < S; x++) for (let y = 0; y < S; y++) if (inside(P, x, y) === 1) I++;
    return { B, I, A2 };
  }
  // 点在多边形内部（1）、边上（0）、外面（-1）
  function inside(P, x, y) {
    let c = false;
    for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; if (cross(a, b, [x, y]) === 0 && onSeg(a, [x, y], b)) return 0; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c; }
    return c ? 1 : -1;
  }
  // 内置的 60 个格点多边形（固定生成）：矩形、直角三角形、L 形、斜三角形、梯形……用来扫公式
  const TEST = (() => {
    const r = [];
    for (let w = 1; w <= 4; w++) for (let h = 1; h <= 4; h++) { r.push([[0, 0], [w, 0], [w, h], [0, h]]); r.push([[0, 0], [w, 0], [0, h]]); }
    for (let a = 1; a <= 3; a++) for (let b = 1; b <= 3; b++) { r.push([[0, 0], [a + b, 0], [a, b]]); r.push([[0, 0], [4, 1], [a, b + 2]]); r.push([[0, 0], [a + 2, 0], [a + 1, b], [1, b]]); }
    r.push([[0, 0], [2, 1], [4, 0], [2, 4]], [[0, 0], [3, 0], [3, 1], [1, 1], [1, 3], [0, 3]], [[1, 0], [3, 1], [2, 3], [0, 2]], [[0, 0], [6, 0], [0, 6]], [[0, 0], [5, 2], [2, 5]]);
    return r.filter((P) => simple(P));
  })();
  const rq = (t) => { try { return Q.parse(String(t)); } catch (e) { return null; } };
  function fits(f, rows) { const al = rq(f[0]), be = rq(f[1]), ga = rq(f[2]); if (!al || !be || !ga) return false; return rows.every((r) => Q.cmp(Q.add(Q.add(Q.mul(al, Q(r.I)), Q.mul(be, Q(r.B))), ga), Q(r.A2, 2)) === 0); }
  function judge(p) {
    const P = pts(p.verts), closed = p.closed === 1 && P.length >= 3, sim = closed && simple(P), rows = String(p.rows || '').split(';').filter(Boolean).map((t) => { const q = t.split(',').map(Number); return { B: q[0], I: q[1], A2: q[2], rect: q[3] === 1 }; });
    const c = sim ? count(P) : null;
    const rect = sim && P.length === 4 && P.every((q, i) => { const a = P[(i + 3) % 4], b = P[(i + 1) % 4]; return (q[0] - a[0]) * (b[0] - q[0]) + (q[1] - a[1]) * (b[1] - q[1]) === 0; });
    const nonRect = rows.filter((r) => !r.rect).length, f = [p.fa, p.fb, p.fc];
    const testRows = TEST.map((Q2) => { const k = count(Q2); return { B: k.B, I: k.I, A2: k.A2 }; });
    const rowsFit = rows.length >= 5 && nonRect >= 1 && fits(f, rows) ? 1 : 0, scan = fits(f, testRows) ? 1 : 0;
    let perim = 0, axis = sim; if (sim) P.forEach((q, i) => { const b = P[(i + 1) % P.length]; if (q[0] !== b[0] && q[1] !== b[1]) axis = false; perim += Math.abs(q[0] - b[0]) + Math.abs(q[1] - b[1]); });
    return { P, closed, sim, c, rect, rows, nonRect, rowsFit, scan, perim: axis ? perim : 0, formula: rowsFit && scan ? 1 : 0 };
  }
  function onSet(p, k, v) {
    if (k === 'pt') {
      if (!(v > 0)) return { pt: 0 };
      const x = (v - 1) % S, y = Math.floor((v - 1) / S), P = pts(p.verts);
      if (p.closed === 1) return { pt: 0, verts: x + ',' + y, closed: 0, msg: '重新围一个' };
      if (P.length >= 3 && P[0][0] === x && P[0][1] === y) return { pt: 0, closed: 1, msg: simple(P) ? '' : '边交叉了，不是一个普通的多边形' };
      if (P.some((q) => q[0] === x && q[1] === y)) return { pt: 0, msg: '这个点已经用过了' };
      return { pt: 0, verts: (p.verts ? p.verts + ';' : '') + x + ',' + y, msg: '' };
    }
    if (k === 'rec') {
      if (!(v > 0)) return { rec: 0 }; const J = judge(p); if (!J.sim) return { rec: 0, msg: '先围出一个封好口的多边形' };
      const rows = String(p.rows || '').split(';').filter(Boolean); if (rows.length >= 12) return { rec: 0, msg: '表满了（12 行）' };
      return { rec: 0, rows: rows.concat([J.c.B + ',' + J.c.I + ',' + J.c.A2 + ',' + (J.rect ? 1 : 0)]).join(';'), msg: '记进表了' };
    }
    if (k === 'clear') return { clear: 0, verts: '', closed: 0, msg: '' };
    return null;
  }
  function draw(c) {
    const p = c.props, J = judge(p), W = c.w, H = []; let s = '', g = 28, ox = 18, oy = 10;
    const X = (x) => ox + x * g, Y = (y) => oy + (S - 1 - y) * g;
    if (J.P.length >= 3 && J.closed) s += '<polygon points="' + J.P.map((q) => X(q[0]) + ',' + Y(q[1])).join(' ') + '" fill="' + (J.sim ? 'var(--accent)' : 'var(--bad)') + '" fill-opacity="0.28" stroke="none"/>';
    for (let i = 0; i + 1 < J.P.length + (J.closed ? 1 : 0); i++) { const a = J.P[i], b = J.P[(i + 1) % J.P.length]; s += K.line(X(a[0]), Y(a[1]), X(b[0]), Y(b[1]), { stroke: J.closed && !J.sim ? 'var(--bad)' : 'var(--accent)', w: 2.5 }); }
    for (let x = 0; x < S; x++) for (let y = 0; y < S; y++) { const use = J.P.some((q) => q[0] === x && q[1] === y), st = J.closed && J.sim ? inside(J.P, x, y) : -1; s += K.circle(X(x), Y(y), use ? 4.5 : 2.5, { fill: use ? 'var(--accent)' : st === 1 ? 'var(--good)' : st === 0 ? 'var(--accent)' : 'var(--dim)' }); H.push('<rect x="' + (X(x) - 12) + '" y="' + (Y(y) - 12) + '" width="24" height="24" fill="transparent" data-pick-k="pt" data-pick-v="' + (y * S + x + 1) + '" style="cursor:pointer"/>'); }
    const tx = ox + S * g - 4;
    s += K.text(tx, 24, J.sim ? 'B（边上）= ' + J.c.B : '点格点围多边形', { size: 12, anchor: 'start', weight: 700 }); if (J.sim) s += K.text(tx, 44, 'I（里面）= ' + J.c.I, { size: 12, anchor: 'start', weight: 700, fill: 'var(--good)' });
    if (J.sim) s += K.text(tx, 64, c.masked ? '面积：先猜' : '面积 = ' + J.c.A2 / 2, { size: 12, anchor: 'start', weight: 700 });
    if (p.msg) s += K.text(tx, 86, p.msg.slice(0, 12), { size: 10.5, anchor: 'start', fill: 'var(--bad)' });
    [['rec', '记进表', 102], ['clear', '重围', 150]].forEach(([k, tx2, yy]) => { s += K.rect(tx, yy - 14, 56, 20, { fill: 'var(--sel-bg)', r: 5 }) + K.text(tx + 28, yy, tx2, { size: 11, weight: 700 }); H.push('<rect x="' + tx + '" y="' + (yy - 14) + '" width="56" height="20" fill="transparent" data-pick-k="' + k + '" data-pick-v="1" style="cursor:pointer"/>'); });
    let y = oy + S * g + 12; s += K.text(10, y, '表（B，I，面积）：' + J.rows.slice(-6).map((r) => r.B + ',' + r.I + ',' + r.A2 / 2).join('　'), { size: 11, anchor: 'start' }); y += 17;
    s += K.text(10, y, '试公式：面积 = ' + p.fa + ' × I + ' + p.fb + ' × B + ' + p.fc + '　（在右边 fa、fb、fc 里写）', { size: 11, anchor: 'start', fill: 'var(--dim)' }); y += 17;
    s += K.text(10, y, J.rows.length ? '表里 ' + J.rows.length + ' 行' + (J.rowsFit ? '：公式都对得上' : '') + (J.scan ? '　在 ' + TEST.length + ' 个多边形上也对' : '') : '', { size: 11.5, anchor: 'start', weight: 700, fill: J.formula ? 'var(--good)' : 'var(--dim)' });
    return s + H.join('');
  }
  U.registerPack({
    id: 'geoboard', version: 1, needs: [],
    types: {
      geoboard: {
        workspaceRole: 'none', handles: true, compactPorts: true, essence: ['E9', 'E2'], label: '钉板', prefix: '钉', group: '图形', grades: [3, 8], alias: ['钉板', '格点', '皮克公式', '格点多边形', '数格点', '面积'],
        props: {
          verts: { hidden: true, type: 'text', label: '围的点', default: '', write: false }, closed: { hidden: true, type: 'int', label: '封口了吗', default: 0, min: 0, max: 1, write: false }, pt: { hidden: true, type: 'int', label: '点一个格点', default: 0, min: 0, max: 49 },
          rec: { hidden: true, type: 'int', label: '记进表', default: 0, min: 0, max: 1 }, clear: { hidden: true, type: 'int', label: '重围', default: 0, min: 0, max: 1 }, rows: { hidden: true, type: 'text', label: '表', default: '', write: false }, msg: { hidden: true, type: 'text', label: '提示', default: '', write: false },
          fa: { type: 'text', label: '公式：I 的系数', default: '1' }, fb: { type: 'text', label: '公式：B 的系数', default: '1' }, fc: { type: 'text', label: '公式：常数', default: '0' },
          gans: { type: 'text', label: '先猜面积', default: '' },         },
        onSet,
        guess: { props: ['gans'], ports: ['area'], answered: (p) => String(p.gans).trim() !== '' },
        outputs: {
          B: { dim: null, kind: 'num', label: '边上的格点数' }, I: { dim: null, kind: 'num', label: '里面的格点数' }, area: { dim: null, kind: 'num', label: '面积' }, valid: { dim: null, kind: 'num', label: '围好了一个多边形（1/0）' },
          perim: { dim: null, kind: 'num', label: '周长（只有横竖边时）' }, isRect: { dim: null, kind: 'num', label: '是长方形（1/0）' }, rowsN: { dim: null, kind: 'num', label: '表里几行' }, formula: { dim: null, kind: 'num', label: '公式对了（1/0）' },
        },
        icon: () => K.circle(14, 14, 3, { fill: 'var(--dim)' }) + K.circle(32, 14, 3, { fill: 'var(--dim)' }) + K.circle(50, 14, 3, { fill: 'var(--dim)' }) + K.circle(14, 32, 3, { fill: 'var(--accent)' }) + K.circle(32, 32, 3, { fill: 'var(--accent)' }) + K.circle(14, 50, 3, { fill: 'var(--accent)' }),
        size: () => [380, 290],
        compute: (c) => { const J = judge(c.props); c.say(J.sim ? 'ok' : 'info', J.sim ? 'B = ' + J.c.B + '，I = ' + J.c.I : '点格点围多边形，点第一个点封口'); return { B: num(J.c ? J.c.B : 0), I: num(J.c ? J.c.I : 0), area: num(J.c ? Q(J.c.A2, 2) : Q(0)), valid: num(J.sim ? 1 : 0), perim: num(J.perim), isRect: num(J.rect ? 1 : 0), rowsN: num(J.rows.length), formula: num(J.formula) }; },
        badge: (c) => (c.masked ? '？' : c.out.valid && Q.num(c.out.valid.data) ? '面积 ' + U.showVal(c.out.area) : ''),
        draw,
      },
    },
  });
  U.Geoboard = { judge, count, simple, TEST, area2 };
})(typeof globalThis !== 'undefined' ? globalThis : window);
