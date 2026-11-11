/* 器材包 tiles：代数砖（docs/new-instruments.md 6.2）。三种砖：x²（x×x 的大方块）、x（x×1 的长条）、1（小方块）。
 *   给一个式子，取出对应数量的砖，再指定要拼的长方形的长和宽（w = wa·x + wp，h = ha·x + hp）；砖正好铺满才算拼成了——
 *   拼成了，长 × 宽就是因式分解；反过来数框里有几块什么砖，就是展开。x 的长度可以改（1–9）：拼法不随 x 变。
 *   先猜：能拼成长方形吗？（x² + 5x + 5 就拼不成：缺一块或多一块，看得见）
 * 和设计文档的差别（如实写）：这一版是一台独立的器材（用数量指定拼法），不是几何工作区里可拖的块；没有负砖。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', typeof n === 'number' ? Q(n) : n, { dim: null });
  // 读 “x^2+5x+6” / “x²+6x” / “2x^2+3x+1”：返回 [x²的系数, x的系数, 常数]；读不出来返回 null
  function parse(t) {
    const s = String(t || '').replace(/\s+/g, '').replace(/²/g, '^2').replace(/\*/g, ''); if (!s) return null;
    const c = [0, 0, 0]; const re = /([+-]?)(\d*)(x\^2|x)?/g; let m, used = 0;
    while ((m = re.exec(s)) && m[0] !== '') { const sign = m[1] === '-' ? -1 : 1, k = m[2] === '' ? 1 : Number(m[2]); if (m[3] === undefined && m[2] === '') return null; c[m[3] === 'x^2' ? 0 : m[3] === 'x' ? 1 : 2] += sign * k; used += m[0].length; }
    return used === s.length ? c : null;
  }
  const need = (wa, wp, ha, hp) => [wa * ha, wa * hp + ha * wp, wp * hp];   // 拼 (wa·x+wp)(ha·x+hp) 要的 x²、x、1 的砖数
  const same = (a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
  function factorable(c) {
    for (let wa = 1; wa <= 3; wa++) for (let ha = 1; ha <= 3; ha++) for (let wp = 0; wp <= 9; wp++) for (let hp = 0; hp <= 9; hp++) if (same(need(wa, wp, ha, hp), c)) return [wa, wp, ha, hp];
    return null;
  }
  function judge(p) {
    const have = [p.n2, p.n1x, p.n1], goal = parse(p.expr), nd = need(p.wa, p.wp, p.ha, p.hp), rect = same(have, nd) && nd[0] > 0 ? 1 : 0;
    const match = goal && same(have, goal) ? 1 : 0, fac = goal ? factorable(goal) : null;
    const square = rect && p.wa === p.ha && p.wp === p.hp ? 1 : 0;
    const guessed = p.gans === 0 ? 0 : (p.gans === 1) === (fac !== null) ? 1 : 0;
    return { have, goal, nd, rect, match, done: rect && match ? 1 : 0, square, fac, guessed, gap: [nd[0] - have[0], nd[1] - have[1], nd[2] - have[2]] };
  }
  const C2 = '#5b9bd5', C1 = '#f5a25d', C0 = '#7fc17f';
  function draw(c) {
    const p = c.props, J = judge(p), W = c.w, X = 10 + p.x * 4; let s = '', y = 8;
    const unit = Math.max(6, Math.min(22, Math.floor(200 / Math.max(1, (p.wa * X / 14 + p.wp) + 2))));
    const xl = p.x * unit, ux = unit;
    const wpx = p.wa * xl + p.wp * ux, hpx = p.ha * xl + p.hp * ux, x0 = 14;
    s += K.rect(x0, y, Math.max(wpx, 4), Math.max(hpx, 4), { fill: 'none', stroke: 'var(--ink)', w: 1.5, r: 0 });
    // 铺砖：先大方块，再长条（竖放在右、横放在下），最后小方块；有多少块画多少块，数不够留空
    let a2 = p.n2, a1 = p.n1x, a0 = p.n1;
    const put = (x, yy, w, h, f) => K.rect(x0 + x, y + yy, Math.max(w - 1, 1), Math.max(h - 1, 1), { fill: f, stroke: 'var(--card)', w: 0.5, r: 0 });
    for (let i = 0; i < p.wa; i++) for (let j = 0; j < p.ha; j++) { if (a2 > 0) { s += put(i * xl, j * xl, xl, xl, C2); a2--; } }
    for (let j = 0; j < p.ha; j++) for (let k = 0; k < p.wp; k++) if (a1 > 0) { s += put(p.wa * xl + k * ux, j * xl, ux, xl, C1); a1--; }
    for (let i = 0; i < p.wa; i++) for (let k = 0; k < p.hp; k++) if (a1 > 0) { s += put(i * xl, p.ha * xl + k * ux, xl, ux, C1); a1--; }
    for (let k = 0; k < p.wp; k++) for (let l = 0; l < p.hp; l++) if (a0 > 0) { s += put(p.wa * xl + k * ux, p.ha * xl + l * ux, ux, ux, C0); a0--; }
    const ty = y + Math.max(hpx, 4) + 16;
    s += K.text(x0, ty, '长 ' + (p.wa > 1 ? p.wa : '') + 'x' + (p.wp ? '+' + p.wp : '') + '　宽 ' + (p.ha > 1 ? p.ha : '') + 'x' + (p.hp ? '+' + p.hp : ''), { size: 11.5, anchor: 'start', weight: 700 });
    s += K.text(x0, ty + 17, '砖：x² ' + J.have[0] + ' 块　x ' + J.have[1] + ' 条　1 ' + J.have[2] + ' 个', { size: 11.5, anchor: 'start' });
    if (!c.masked) {
      s += K.text(x0, ty + 34, J.rect ? '拼成了长方形：面积 = 长 × 宽' : '拼不满：要 x² ' + J.nd[0] + '、x ' + J.nd[1] + '、1 ' + J.nd[2] + '（差 ' + J.gap.map((g) => (g > 0 ? '少' + g : g < 0 ? '多' + (-g) : '0')).join('、') + '）', { size: 11.5, anchor: 'start', weight: 700, fill: J.rect ? 'var(--good)' : 'var(--bad)' });
    } else s += K.text(x0, ty + 34, '先猜：这些砖能拼成长方形吗？', { size: 11.5, anchor: 'start', weight: 700, fill: 'var(--accent)' });
    return s;
  }
  const IN = (label, d, max) => ({ type: 'int', label, default: d, min: 0, max: max === undefined ? 30 : max });
  U.registerPack({
    id: 'tiles', version: 1, needs: [],
    types: {
      tiles: {
        workspaceRole: 'none', handles: true, compactPorts: true, essence: ['E2', 'E8'],
        label: '代数砖', prefix: '砖', group: '关系', grades: [6, 9], alias: ['代数砖', '因式分解', '展开', '配方', '完全平方', '拼长方形'],
        props: {
          expr: { type: 'text', label: '要拼的式子（如 x^2+5x+6）', default: '' },
          x: { type: 'int', label: 'x 的长度（1–9）', default: 3, min: 1, max: 9 },
          n2: IN('x² 砖几块', 0), n1x: IN('x 条几块', 0), n1: IN('1 小方块几块', 0),
          wa: IN('长里有几个 x', 1, 3), wp: IN('长里加几', 0, 9), ha: IN('宽里有几个 x', 1, 3), hp: IN('宽里加几', 0, 9),
          gans: { type: 'int', label: '先猜：能拼成长方形吗（1 能 2 不能）', default: 0, min: 0, max: 2 },
        },
        guess: { props: ['gans'], ports: ['rect', 'done', 'square'], answered: (p) => p.gans > 0 },
        outputs: {
          rect: { dim: null, kind: 'num', label: '拼成了长方形（1/0）' }, match: { dim: null, kind: 'num', label: '砖数等于式子（1/0）' }, done: { dim: null, kind: 'num', label: '拼成了而且就是这个式子（1/0）' },
          square: { dim: null, kind: 'num', label: '拼成了正方形（1/0）' }, judged: { dim: null, kind: 'num', label: '“能 / 不能”判断对了（1/0）' },
        },
        icon: () => K.rect(8, 8, 28, 28, { fill: C2, r: 0 }) + K.rect(38, 8, 10, 28, { fill: C1, r: 0 }) + K.rect(38, 38, 10, 10, { fill: C0, r: 0 }),
        size: () => [380, 280],
        compute: (c) => {
          const J = judge(c.props); c.say(J.done || J.rect ? 'ok' : 'info', J.rect ? '拼成了长方形' : '砖数和拼法对不上');
          return { rect: num(J.rect), match: num(J.match), done: num(J.done), square: num(J.square), judged: num(J.guessed) };
        },
        badge: (c) => (c.masked ? '？' : c.out.rect && Q.num(c.out.rect.data) ? '拼成了' : ''),
        draw,
      },
    },
  });
  U.Tiles = { parse, factorable, need, judge };
})(typeof globalThis !== 'undefined' ? globalThis : window);
