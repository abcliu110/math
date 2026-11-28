/* 器材包 dirbench：方向与路线（东南西北、路线图、北偏东几度）。地图上方是北。
 *   - 认方向：中间是一个地方（学校），周围 8 个方向上有别的地方。题目问“A 在 B 的什么方向”，点 8 个方向里的一个。
 *     反过来问也可以：A 在 B 的东北，B 就在 A 的西南（方向相反）。答对、答错都说明。
 *   - 走路线：从起点出发，点 ↑ ↓ ← → 一步走一格（↑ 是向北）。走过的路画出来，下面自动写成“向东走 3 格，再向北走 2 格”。走到终点就到了。
 *   - 方向角：从中心出发，拖射线一头转（15° 一格，从正北或正南量起），拖距离。读成“北偏东 30°，300 米”。和目标重合就找到了。
 * 这一版的边界（如实写）：认方向只有 8 个方向；走路线在 10 × 7 的格子里；方向角一共 4 圈、15° 一格。
 * 大数（2026-11-28，试验台增强 7 第二轮）：方向角右边点“每圈 = 100 / 200 / 500 / 1000 米”换单位（属性 ru），最远 4 千米（“北偏东 45°，1500 米”）；
 *   拖射线还是一圈一圈落（距离 = 第几圈 × 每圈），所以把手不会变小。走路线的格子不放大：它是一步一格地数，格子多了只是多点几下（理由见 docs/instrument-design.md）。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 700;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? Math.round(+v) : lo));
  const MODES = ['认方向', '走路线', '方向角'];
  const DIRS = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];   // 编号 0–7，顺时针
  const DV = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];
  const RUS = [100, 200, 500, 1000], ruOf = (p) => RUS[clamp(p.ru, 0, 3)];
  const meters = (v) => (v >= 1000 && v % 1000 === 0 ? v / 1000 + ' 千米' : v + ' 米');
  const PLACES = ['图书馆', '医院', '公园', '超市', '邮局', '车站', '电影院', '体育馆'];
  // 方向角的说法：角度从正北顺时针 0–359
  function bearing(deg) {
    deg = ((deg % 360) + 360) % 360;
    if (deg === 0) return '正北'; if (deg === 90) return '正东'; if (deg === 180) return '正南'; if (deg === 270) return '正西';
    if (deg < 90) return '北偏东 ' + deg + '°'; if (deg < 180) return '南偏东 ' + (180 - deg) + '°'; if (deg < 270) return '南偏西 ' + (deg - 180) + '°'; return '北偏西 ' + (360 - deg) + '°';
  }
  function model(p) {
    const mode = clamp(p.mode, 0, 2);
    if (mode === 0) { const target = clamp(p.target, 0, 7), rev = !!p.rev, ans = clamp(p.ans, -1, 7), want = rev ? (target + 4) % 8 : target; return { mode, target, rev, ans, want, right: ans === want }; }
    if (mode === 1) {
      const sx = clamp(p.sx, 0, 9), sy = clamp(p.sy, 0, 6), tx = clamp(p.tx, 0, 9), ty = clamp(p.ty, 0, 6), path = String(p.path || '').replace(/[^NESW]/g, '');
      let x = sx, y = sy; const pts = [[x, y]]; for (const c of path) { const [dx, dy] = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] }[c]; x = clamp(x + dx, 0, 9); y = clamp(y + dy, 0, 6); pts.push([x, y]); }
      const runs = []; for (const c of path) { if (runs.length && runs[runs.length - 1][0] === c) runs[runs.length - 1][1]++; else runs.push([c, 1]); }
      const words = runs.map(([c, n], i) => (i ? '再' : '') + '向' + { N: '北', S: '南', E: '东', W: '西' }[c] + '走 ' + n + ' 格').join('，');
      return { mode, sx, sy, tx, ty, path, pts, x, y, words, arrived: x === tx && y === ty && path.length > 0, steps: path.length, best: Math.abs(tx - sx) + Math.abs(ty - sy) };
    }
    const deg = ((clamp(p.deg, -360, 720) % 360) + 360) % 360, dist = clamp(p.dist, 0, 4), tdeg = ((clamp(p.tdeg, 0, 359) % 360) + 360) % 360, tdist = clamp(p.tdist, 1, 4);
    return { mode, deg, dist, tdeg, tdist, ru: ruOf(p), hit: deg === tdeg && dist === tdist };
  }
  const btn = (x, y, w, label, patch, enabled, tip, active) => '<g' + (enabled ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' data-off="1"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 26, { fill: active ? 'var(--blue)' : enabled ? '#fff' : '#f1f3f6', stroke: enabled || active ? 'var(--blue)' : '#b8c0cc', r: 7, w: 1.4 }) + K.text(x + w / 2, y + 17, label, { size: 12, weight: 700, fill: active ? '#fff' : enabled ? 'var(--ink)' : '#5f6773' }) + '</g>';
  const compass = (x, y) => K.line(x, y + 16, x, y - 16, { w: 2 }) + '<polygon points="' + [x, y - 22, x - 5, y - 12, x + 5, y - 12].join(',') + '" fill="var(--ink)"/>' + K.text(x, y - 26, '北', { size: 11, weight: 700 });
  const C3 = { x: 230, y: 210 }, R3 = 40;
  function grips(c) {
    const m = model(c.props); if (m.mode !== 2) return [];
    const a = m.deg * Math.PI / 180, ex = C3.x + Math.sin(a) * Math.max(1, m.dist) * R3, ey = C3.y - Math.cos(a) * Math.max(1, m.dist) * R3;
    return [{ id: 'ray', x: ex, y: ey, r: 11, cursor: 'grab', tip: '拖：转方向、改距离', drag: (c0, q) => { const dx = q.x - C3.x, dy = C3.y - q.y; let d = Math.round(Math.atan2(dx, dy) * 180 / Math.PI / 15) * 15; d = ((d % 360) + 360) % 360; return { deg: d, dist: Math.max(1, Math.min(4, Math.round(Math.hypot(dx, dy) / R3))) }; }, say: (c1) => { const m1 = model(c1.props); return bearing(m1.deg) + '，' + meters(m1.dist * m1.ru); } }];
  }
  function draw(c) {
    const p = c.props, m = model(p); let s = '';
    MODES.forEach((t, i) => { s += btn(20 + i * 100, 8, 94, t, { mode: i }, m.mode !== i, '换到“' + t + '”', m.mode === i); });
    if (m.mode === 0) {
      const cx = 200, cy = 210, r = 110, other = PLACES[m.target];
      s += compass(40, 80);
      s += K.rect(cx - 34, cy - 16, 68, 32, { fill: '#fde2c4', stroke: '#8a5a00', r: 6, w: 1.4 }) + K.text(cx, cy + 5, '学校', { size: 13, weight: 700 });
      const [dx, dy] = DV[m.target], k = dx && dy ? 0.75 : 1;
      s += K.rect(cx + dx * r * k - 36, cy + dy * r * k - 16, 72, 32, { fill: '#cfe3fb', stroke: '#2f4a73', r: 6, w: 1.4 }) + K.text(cx + dx * r * k, cy + dy * r * k + 5, other, { size: 13, weight: 700 });
      const q = m.rev ? '学校在' + other + '的什么方向？' : other + '在学校的什么方向？';
      s += K.text(380, 70, q, { size: 15, weight: 700, anchor: 'start' });
      DIRS.forEach((d, i) => { const [ddx, ddy] = DV[i]; s += btn(500 + ddx * 64 - 28, 190 + ddy * 44 - 13, 56, d, { ans: i }, true, '选“' + d + '”', m.ans === i); });
      s += K.text(500, 195, '·', { size: 18 });
      if (m.ans >= 0) s += '<g data-read="1">' + K.text(20, 362, m.right ? '对：' + q.replace('什么方向？', DIRS[m.want]) : '不对。' + (m.rev ? '反过来问：' + other + '在学校的' + DIRS[m.target] + '，学校就在' + other + '的' + DIRS[m.want] + '（方向相反）' : '从学校往' + other + '看：上面是北，右边是东'), { size: 13, weight: 700, anchor: 'start', fill: m.right ? 'var(--blue)' : 'var(--bad)' }) + '</g>';
    } else if (m.mode === 1) {
      const X0 = 40, Y0 = 60, CS = 34, gx = (x) => X0 + x * CS + CS / 2, gy = (y) => Y0 + y * CS + CS / 2;
      for (let i = 0; i <= 10; i++) s += K.line(X0 + i * CS, Y0, X0 + i * CS, Y0 + 7 * CS, { stroke: '#e3e7ef', w: 1 });
      for (let j = 0; j <= 7; j++) s += K.line(X0, Y0 + j * CS, X0 + 10 * CS, Y0 + j * CS, { stroke: '#e3e7ef', w: 1 });
      s += compass(X0 + 10 * CS + 30, Y0 + 30);
      s += K.circle(gx(m.sx), gy(m.sy), 12, { fill: '#9fd5ad', stroke: '#1f6a34', w: 1.4 }) + K.text(gx(m.sx), gy(m.sy) + 4, '家', { size: 11, weight: 700 }) + K.circle(gx(m.tx), gy(m.ty), 12, { fill: '#f5c26b', stroke: '#8a5a00', w: 1.4 }) + K.text(gx(m.tx), gy(m.ty) + 4, '校', { size: 11, weight: 700 });
      if (m.pts.length > 1) s += '<polyline points="' + m.pts.map(([x, y]) => gx(x) + ',' + gy(y)).join(' ') + '" fill="none" stroke="var(--blue)" stroke-width="4" stroke-linejoin="round"/>';
      s += K.circle(gx(m.x), gy(m.y), 7, { fill: 'var(--blue)' });
      const BX = 470, BY = 120;
      s += btn(BX + 50, BY, 44, '↑ 北', { path: m.path + 'N' }, m.y > 0 && !m.arrived, '向北走一格') + btn(BX, BY + 32, 44, '← 西', { path: m.path + 'W' }, m.x > 0 && !m.arrived, '向西走一格') + btn(BX + 100, BY + 32, 44, '东 →', { path: m.path + 'E' }, m.x < 9 && !m.arrived, '向东走一格') + btn(BX + 50, BY + 64, 44, '↓ 南', { path: m.path + 'S' }, m.y < 6 && !m.arrived, '向南走一格');
      s += btn(BX, BY + 110, 70, '退一步', { path: m.path.slice(0, -1) }, m.path.length > 0, '撤回最后一步') + btn(BX + 80, BY + 110, 70, '重走', { path: '' }, m.path.length > 0, '回到家');
      s += K.text(40, 330, m.words ? '路线：' + m.words : '从家出发，走到学校', { size: 13, weight: 700, anchor: 'start' });
      if (m.arrived) s += '<g data-read="1">' + K.text(40, 356, '到学校了：走了 ' + m.steps + ' 格' + (m.steps === m.best ? '，是最短的路' : '，最短只要 ' + m.best + ' 格'), { size: 14, weight: 700, anchor: 'start', fill: m.steps === m.best ? 'var(--blue)' : 'var(--bad)' }) + '</g>';
    } else {
      s += compass(40, 80);
      for (let k = 1; k <= 4; k++) s += K.circle(C3.x, C3.y, k * R3, { fill: 'none', stroke: '#e3e7ef', w: 1 }) + K.text(C3.x + 4, C3.y - k * R3 + 12, meters(k * m.ru), { size: 9, fill: '#8a94a6', anchor: 'start' });
      s += K.line(C3.x, C3.y - 4 * R3 - 10, C3.x, C3.y + 4 * R3 + 10, { stroke: '#c5ccda', w: 1, dash: '4 3' }) + K.line(C3.x - 4 * R3 - 10, C3.y, C3.x + 4 * R3 + 10, C3.y, { stroke: '#c5ccda', w: 1, dash: '4 3' });
      const ta = m.tdeg * Math.PI / 180; s += K.circle(C3.x + Math.sin(ta) * m.tdist * R3, C3.y - Math.cos(ta) * m.tdist * R3, 9, { fill: '#f5c26b', stroke: '#8a5a00', w: 1.4 });
      const a = m.deg * Math.PI / 180, d = Math.max(1, m.dist); s += K.line(C3.x, C3.y, C3.x + Math.sin(a) * d * R3, C3.y - Math.cos(a) * d * R3, { stroke: 'var(--blue)', w: 3 });
      s += K.circle(C3.x, C3.y, 5, { fill: 'var(--ink)' }) + K.text(C3.x - 8, C3.y + 18, '观测点', { size: 10, anchor: 'end' });
      s += K.text(460, 80, '目标在：' + bearing(m.tdeg) + '，' + meters(m.tdist * m.ru), { size: 14, weight: 700, anchor: 'start' });
      s += K.text(460, 116, '你画的：' + bearing(m.deg) + '，' + meters(Math.max(1, m.dist) * m.ru), { size: 14, weight: 700, anchor: 'start', fill: 'var(--blue)' });
      // 每圈多少米（换单位）
      s += K.text(460, 228, '每圈多少米（换单位）', { size: 12, weight: 700, anchor: 'start' }) + RUS.map((v, i) => btn(460 + i * 54, 236, 50, String(v), { ru: i }, true, '每一圈是 ' + v + ' 米', m.ru === v)).join('');
      s += K.text(460, 144, '先看偏北还是偏南，再看偏东还是偏西', { size: 12, anchor: 'start', fill: '#5a6478' });
      if (m.hit) s += '<g data-read="1">' + K.text(460, 190, '找到了！方向和距离都对上', { size: 15, weight: 700, anchor: 'start', fill: 'var(--blue)' }) + '</g>';
    }
    return s;
  }
  const I = (lo, hi, d, label) => ({ type: 'int', label, default: d, min: lo, max: hi, write: true });
  U.registerPack({
    id: 'dirbench', version: 1,
    types: {
      dirbench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E5', 'E6'],
        label: '方向与路线', prefix: '方向', group: '图形', grades: [3, 6],
        alias: ['东南西北', '方向', '位置与方向', '路线图', '北偏东', '方向角', '东北', '西南'],
        props: {
          mode: { type: 'choice', label: '做什么', default: 0, choices: MODES, write: true },
          target: I(0, 7, 1, '认方向：那个地方在学校的哪个方向（0 北，顺时针）'), rev: { type: 'bool', label: '认方向：反过来问', default: false, write: true }, ans: I(-1, 7, -1, '认方向：选的方向'),
          sx: I(0, 9, 1, '走路线：家在第几列'), sy: I(0, 6, 5, '走路线：家在第几行'), tx: I(0, 9, 7, '走路线：学校在第几列'), ty: I(0, 6, 1, '走路线：学校在第几行'), path: { type: 'text', label: '走路线：走过的路（自动）', default: '', write: true },
          ru: { type: 'choice', label: '方向角：每圈多少米', default: 0, choices: RUS.map((v) => v + ' 米'), write: true },
          deg: I(-360, 720, 0, '方向角：射线的方向（从正北顺时针）'), dist: I(0, 4, 1, '方向角：距离（百米）'), tdeg: I(0, 359, 30, '方向角：目标的方向'), tdist: I(1, 4, 3, '方向角：目标的距离（百米）'),
        },
        outputs: {
          right: { dim: null, kind: 'num', label: '认方向：答对 1、答错 0（选了才有）' }, arrived: { dim: null, kind: 'num', label: '走路线：到了 1（到了才有）' }, steps: { dim: null, kind: 'num', label: '走路线：走了几格' },
          shortest: { dim: null, kind: 'num', label: '走路线：走的是最短的路 1（到了才有）' }, hit: { dim: null, kind: 'num', label: '方向角：对上了 1（对上才有）' },
        },
        icon: () => K.line(28, 40, 28, 10, { w: 2 }) + '<polygon points="28,6 23,15 33,15" fill="var(--ink)"/>' + K.line(14, 26, 42, 26, { w: 1.4 }) + K.text(28, 50, '北', { size: 9, weight: 700 }),
        size: () => [W, 400],
        grips,
        compute: (c) => {
          const m = model(c.props), o = {};
          if (m.mode === 0 && m.ans >= 0) o.right = num(m.right ? 1 : 0);
          if (m.mode === 1) { o.steps = num(m.steps); if (m.arrived) { o.arrived = num(1); if (m.steps === m.best) o.shortest = num(1); } }
          if (m.mode === 2 && m.hit) o.hit = num(1);
          return o;
        },
        badge: () => '',
        draw,
      },
    },
  });
  U.DirBench = { model, bearing, DIRS, RUS, meters };
})(typeof globalThis !== 'undefined' ? globalThis : window);
