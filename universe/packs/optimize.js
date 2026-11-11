/* 器材包 optimize：最优化沙盘（docs/new-instruments.md 5.2）。在一个限制下，把某个量调到最大或最小；先试，再猜，再说明为什么。
 *   围篱笆：周长固定 20，长方形的长取 1 到 9，面积最大是多少？（正方形；长宽差 2d 时少 d²）
 *   靠墙围：三边共 20，一边靠墙，垂直墙的边（宽）取 1 到 9，面积最大是多少？（10 × 5 = 50）
 *   将军饮马：A(1，2) 和 B(7，4) 在河（x 轴）同侧，在河上取水点 P(x，0)，x 取 0 到 8，A → P → B 的路程最短在哪？（把 B 翻到对岸 B′(7，−4)，连直线，x = 3）
 * 每试一个参数就记一次（参数，目标值）；散点图在卡片上画出来，最高（最低）的点看得见。试遍所有整数参数，是穷举（③）。
 * 和设计文档的差别（如实写）：这是一台独立的器材，参数是整数、用点击选；不在几何工作区里拖，也没有“周长锁”约束和翻转工具的联动——
 * 将军饮马的“翻转”是在“为什么”里文字说明的；最短路程带根号，只给近似值（标 ≈）和精确的 6√2。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const SC = ['围篱笆', '靠墙围', '将军饮马'];
  const num = (n, ex) => U.val('num', typeof n === 'number' ? Q(n) : n, ex === false ? { dim: null, exact: false } : { dim: null });
  const apx = (x) => Q.fromNumber(+x.toFixed(6));
  const RANGE = [[1, 9], [1, 9], [0, 8]];
  const val = (sc, x) => (sc === 0 ? x * (10 - x) : sc === 1 ? x * (20 - 2 * x) : Math.hypot(x - 1, 2) + Math.hypot(7 - x, 4));
  const maxMode = (sc) => sc !== 2;
  const bestX = (sc) => { let b = RANGE[sc][0]; for (let x = RANGE[sc][0]; x <= RANGE[sc][1]; x++) if (maxMode(sc) ? val(sc, x) > val(sc, b) + 1e-9 : val(sc, x) < val(sc, b) - 1e-9) b = x; return b; };
  const trials = (s) => String(s || '').split(',').filter(Boolean).map(Number);
  function onSet(p, k, v) {
    if (k === 'scene') return { tr: '', x: 0, gx: 0 };
    if (k === 'x') { const r = RANGE[p.scene]; if (v < r[0] || v > r[1]) return { x: 0 }; const T = trials(p.tr); return T.includes(v) ? { x: v } : { x: v, tr: p.tr ? p.tr + ',' + v : String(v) }; }
    return null;
  }
  function judge(p) {
    const sc = p.scene, T = trials(p.tr), r = RANGE[sc], all = T.length === r[1] - r[0] + 1; let b = null;
    for (const x of T) if (b === null || (maxMode(sc) ? val(sc, x) > val(sc, b) + 1e-9 : val(sc, x) < val(sc, b) - 1e-9)) b = x;
    const bx = bestX(sc), hit = b !== null && b === bx ? 1 : 0;
    return { T, b, bx, best: b === null ? 0 : val(sc, b), hit, n: T.length, all: all ? 1 : 0, lv: all ? 3 : hit ? 2 : T.length ? 1 : 0, guessed: p.gx === 0 ? 0 : p.gx === bx ? 1 : 0 };
  }
  function draw(c) {
    const p = c.props, J = judge(p), W = c.w, sc = p.scene, r = RANGE[sc]; let s = '', H = '';
    const label = sc === 0 ? '周长 20：长是几？面积 = 长 × 宽' : sc === 1 ? '靠墙，三边共 20：垂直墙的边是几？面积最大？' : 'A(1，2)、B(7，4) 在河同侧：取水点 P 的位置 x 是几？路程最短？';
    s += K.text(10, 16, label, { size: 11.5, anchor: 'start', weight: 700 });
    // 示意图
    if (sc === 2) { s += K.line(14, 92, 200, 92, { stroke: '#5b9bd5', w: 3 }) + K.text(206, 96, '河', { size: 10.5, anchor: 'start', fill: '#5b9bd5' }); const X = (x) => 14 + x * 21, Y = (y) => 92 - y * 14; s += K.circle(X(1), Y(2), 4, { fill: 'var(--accent)' }) + K.text(X(1), Y(2) - 8, 'A', { size: 10.5 }) + K.circle(X(7), Y(4), 4, { fill: 'var(--accent)' }) + K.text(X(7), Y(4) - 8, 'B', { size: 10.5 }); const x = p.x || J.b; if (x !== null && x !== 0 || p.tr) { const px = p.x || (J.T.length ? J.T[J.T.length - 1] : null); if (px !== null) s += K.line(X(1), Y(2), X(px), 92, { stroke: 'var(--ink)', w: 1.5 }) + K.line(X(px), 92, X(7), Y(4), { stroke: 'var(--ink)', w: 1.5 }) + K.circle(X(px), 92, 4, { fill: 'var(--bad)' }); } }
    else { const x = p.x || (J.T.length ? J.T[J.T.length - 1] : 0), w = sc === 0 ? x : x, h = sc === 0 ? 10 - x : 20 - 2 * x, u = 9; if (x) { if (sc === 0) s += K.rect(14, 26, x * u, (10 - x) * u, { fill: '#f5a25d', stroke: 'var(--ink)', r: 0, w: 1.2 }); else { s += K.line(14, 26, 14 + h * u * 0.5, 26, { stroke: 'var(--dim)', w: 3 }); s += K.rect(14, 26, h * 4.5, x * u, { fill: '#f5a25d', stroke: 'var(--ink)', r: 0, w: 1.2 }) + K.line(10, 26, 10, 26 + x * u, { stroke: 'var(--dim)', w: 3 }); } } }
    // 散点：横轴参数，纵轴目标值
    const gx0 = 240, gy0 = 100, gw = W - gx0 - 12, gh = 70, vals = []; for (let x = r[0]; x <= r[1]; x++) vals.push(val(sc, x));
    const lo = Math.min.apply(null, vals) * 0.9, hi = Math.max.apply(null, vals) * 1.05, X = (x) => gx0 + (x - r[0]) / (r[1] - r[0]) * gw, Y = (v) => gy0 - 6 - (v - lo) / (hi - lo) * gh;
    s += K.line(gx0, gy0 - 4, gx0 + gw, gy0 - 4, { stroke: 'var(--dim)', w: 1 });
    J.T.forEach((x) => { s += K.circle(X(x), Y(val(sc, x)), 3.5, { fill: x === J.b ? 'var(--good)' : 'var(--accent)' }); });
    // 点击选参数
    let y = 126; s += K.text(10, y, '点一个数试试：', { size: 11, anchor: 'start', fill: 'var(--dim)' }); y += 6;
    for (let x = r[0]; x <= r[1]; x++) { const bx = 10 + (x - r[0]) * 36, tried = J.T.includes(x); s += K.rect(bx, y, 32, 24, { fill: p.x === x ? 'var(--accent)' : tried ? 'var(--sel-bg)' : 'var(--card)', stroke: 'var(--dim)', w: 0.8, r: 5 }) + K.text(bx + 16, y + 16, String(x), { size: 12, weight: 700, fill: p.x === x ? '#fff' : 'var(--ink)' }); H += '<rect x="' + bx + '" y="' + y + '" width="32" height="24" fill="transparent" data-pick-k="x" data-pick-v="' + x + '" style="cursor:pointer"/>'; }
    y += 42; const cur = p.x ? val(sc, p.x) : null;
    s += K.text(10, y, cur === null ? '还没试' : '这次：' + (sc === 2 ? '路程 ≈ ' + cur.toFixed(4) : '面积 = ' + cur), { size: 12, anchor: 'start', weight: 700 }); y += 18;
    s += K.text(10, y, c.masked ? '先猜：参数取几最好？（填“我猜”）' : '试了 ' + J.n + ' 个，最好的是 ' + (J.b === null ? '—' : J.b + '（' + (sc === 2 ? '≈' + J.best.toFixed(4) : J.best) + '）') + (J.hit ? '　✓ 就是最优' : ''), { size: 11.5, anchor: 'start', weight: 700, fill: J.hit ? 'var(--good)' : 'var(--ink)' });
    return s + H;
  }
  U.registerPack({
    id: 'optimize', version: 1, needs: [],
    types: {
      optimize: {
        workspaceRole: 'none', handles: true, compactPorts: true, essence: ['E5', 'E10', 'E12'], label: '最优化沙盘', prefix: '优', group: '图形', grades: [4, 9], alias: ['最优化', '最值', '围篱笆', '将军饮马', '最大面积', '最短路程', '周长一定'],
        props: {
          scene: { type: 'choice', label: '场景', default: 0, choices: SC }, x: { hidden: true, type: 'int', label: '这次试的参数', default: 0, min: 0, max: 9 }, tr: { hidden: true, type: 'text', label: '试过的参数', default: '', write: false },
          gx: { type: 'int', label: '先猜：参数取几最好（0 = 还没猜）', default: 0, min: 0, max: 9 },
        },
        onSet,
        guess: { props: ['gx'], ports: ['best', 'at', 'hit'], answered: (p) => p.gx > 0 },
        outputs: {
          best: { dim: null, kind: 'num', label: '试过的最好值' }, at: { dim: null, kind: 'num', label: '最好值的参数' }, n: { dim: null, kind: 'num', label: '试了几次' }, hit: { dim: null, kind: 'num', label: '试到了真正的最值（1/0）' },
          all: { dim: null, kind: 'num', label: '试遍了（1/0）' }, lv: { dim: null, kind: 'num', label: '证据等级' }, guessed: { dim: null, kind: 'num', label: '先猜对了（1/0）' },
        },
        icon: () => K.rect(12, 20, 40, 24, { fill: '#f5a25d', stroke: 'var(--ink)', r: 0 }),
        size: () => [380, 230],
        compute: (c) => { const J = judge(c.props), sc = c.props.scene; c.say(J.hit ? 'ok' : 'info', J.n ? '试了 ' + J.n + ' 个' : '点一个数试试'); return { best: num(apx(J.best), sc === 2 ? false : true), at: num(J.b === null ? 0 : J.b), n: num(J.n), hit: num(J.hit), all: num(J.all), lv: num(J.lv), guessed: num(J.guessed) }; },
        badge: (c) => (c.masked ? '？' : c.out.hit && Q.num(c.out.hit.data) ? '最优' : ''),
        draw,
      },
    },
  });
  U.Optimize = { val, bestX, judge };
})(typeof globalThis !== 'undefined' ? globalThis : window);
