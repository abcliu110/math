/* 器材包 systembench：两架天平（二元一次方程组）。docs/instrument-design.md 第 10 节之后加的操作台。
 * 上下两架天平，都是平的。盘里有圆盒（x）、方盒（y）和砝码（每个重 1）；圆盒都一样重，方盒都一样重，重量藏着。
 * 全部在图上直接动手：
 *   - 把一架天平拖到另一架上：
 *       · 如果这一架已经是“一个盒子 = …”（盒子单独在一边），就是代入：把另一架里的这种盒子全换成和它一样重的东西；
 *       · 否则是消元：从另一架的两个盘里，各拿走这一架两个盘里的东西（它们一样重，所以拿走以后还是平的）。拿不出来就说明原因。
 *   - 每架天平旁边的按钮：翻倍、平分、两边各拿走同样的东西。
 * 旁边的式子跟着变。两个盒子的重量都知道了，就解出来了。
 * 这一版的边界（如实写）：只有正整数个盒子和砝码，没有负数；每个盘最多 6 个圆盒、6 个方盒、30 个砝码；每一步都保持平衡（做不了的事会被拦住，不会让天平歪）。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', Q(n), { dim: null });
  const W = 680, BH = 172, BX = 210, ARM = 110, PW = 170, BMAX = 6, CMAX = 30;
  const top = (i) => 14 + i * BH;
  const parse = (t) => { const a = String(t || '').split(/[,，]/).map((s) => Number(s.trim())); return a.length === 6 && a.every((n) => Number.isInteger(n) && n >= 0) ? a : [0, 0, 0, 0, 0, 0]; };   // [左x, 左y, 左砝码, 右x, 右y, 右砝码]
  const ser = (e) => e.join(',');
  const fits = (e) => e[0] <= BMAX && e[1] <= BMAX && e[3] <= BMAX && e[4] <= BMAX && e[2] <= CMAX && e[5] <= CMAX;
  const sideStr = (x, y, c) => { const a = []; if (x) a.push((x === 1 ? '' : x) + 'x'); if (y) a.push((y === 1 ? '' : y) + 'y'); if (c || !a.length) a.push(String(c)); return a.join(' + '); };
  const eqStr = (e) => sideStr(e[0], e[1], e[2]) + ' = ' + sideStr(e[3], e[4], e[5]);
  // 盒子单独在一边：返回 { v: 0（x）或 1（y）, expr: [x, y, c] }（另一边的东西，里面不含这种盒子）
  function isolated(e) {
    for (const [a, b] of [[0, 3], [3, 0]]) {
      for (const v of [0, 1]) {
        if (e[a + v] === 1 && e[a + 1 - v] === 0 && e[a + 2] === 0 && e[b + v] === 0) return { v, expr: [e[b], e[b + 1], e[b + 2]] };
      }
    }
    return null;
  }
  const known = (e) => { const s = isolated(e); return s && s.expr[0] === 0 && s.expr[1] === 0 ? { v: s.v, n: s.expr[2] } : null; };
  // 从 t 里拿走 s（左盘拿左盘的、右盘拿右盘的；不行就把 s 左右对调再试）
  function subtract(t, s) {
    for (const ss of [s, [s[3], s[4], s[5], s[0], s[1], s[2]]]) { const r = t.map((n, i) => n - ss[i]); if (r.every((n) => n >= 0)) return r; }
    return null;
  }
  function substitute(t, iso) {
    const r = t.slice();
    for (const a of [0, 3]) { const k = r[a + iso.v]; if (!k) continue; r[a + iso.v] = 0; r[a] += k * iso.expr[0]; r[a + 1] += k * iso.expr[1]; r[a + 2] += k * iso.expr[2]; }
    return r;
  }
  const scale = (e, k) => e.map((n) => n * k);
  const divisor = (e) => { for (let k = 6; k >= 2; k--) if (e.every((n) => n % k === 0) && e.some((n) => n > 0)) return k; return 0; };
  // 两边都有的东西，一次全拿走
  function cancel(e) { const r = e.slice(); let any = false; for (const j of [0, 1, 2]) { const m = Math.min(r[j], r[j + 3]); if (m) { r[j] -= m; r[j + 3] -= m; any = true; } } return any ? r : null; }
  // 把一架天平（from）拖到另一架（to）上：返回 { e: 新的 to, how } 或 { why }
  function dropOn(es, from, to) {
    const s = es[from], t = es[to], iso = isolated(s);
    if (iso && (t[iso.v] || t[3 + iso.v])) { const r = substitute(t, iso); return fits(r) ? { e: r, how: '代入：把' + (iso.v ? '方盒' : '圆盒') + '换成 ' + sideStr(iso.expr[0], iso.expr[1], iso.expr[2]) } : { why: '换完以后盘里放不下了' }; }
    const r = subtract(t, s);
    if (r) return { e: r, how: '消元：两边各拿走一样重的东西' };
    return { why: '另一架的盘里没有这么多东西可以拿走：试试先把这一架翻倍，或者先把那一架化简' };
  }
  function model(p) {
    const es = [parse(p.e0), parse(p.e1)], val = [null, null];
    for (const e of es) { const k = known(e); if (k && val[k.v] === null) val[k.v] = k.n; }
    return { es, x: val[0], y: val[1] };
  }

  const boxX = (x, y) => K.circle(x + 11, y + 11, 11, { fill: '#f5c26b', stroke: '#8a5a00', w: 1.6 }) + K.text(x + 11, y + 16, 'x', { size: 13, weight: 700, fill: '#5a3a00' });
  const boxY = (x, y) => K.rect(x, y, 22, 22, { fill: '#8fd19e', stroke: '#1f6a34', r: 3, w: 1.6 }) + K.text(x + 11, y + 16, 'y', { size: 13, weight: 700, fill: '#123f1e' });
  const wt = (x, y) => K.rect(x, y, 11, 11, { fill: '#9fb7d9', stroke: '#2f4a73', r: 2, w: 1 });
  function pan(cx, y, nx, ny, nc) {
    let s = K.rect(cx - PW / 2, y, PW, 6, { fill: 'var(--ink)', r: 3 }), x = cx - PW / 2 + 4;
    for (let i = 0; i < nx; i++) { s += boxX(x, y - 24); x += 24; }
    for (let i = 0; i < ny; i++) { s += boxY(x, y - 24); x += 24; }
    const cols = Math.max(1, Math.floor((cx + PW / 2 - 4 - x) / 12));
    for (let i = 0; i < nc; i++) s += wt(x + (i % cols) * 12, y - 13 - Math.floor(i / cols) * 12);
    return s;
  }
  const setBtn = (x, y, w, label, patch, on, tip) => '<g' + (on ? ' data-pick-set="' + encodeURIComponent(JSON.stringify(patch)) + '" style="cursor:pointer"' : ' opacity="0.38"') + '><title>' + K.esc(tip) + '</title>' +
    K.rect(x, y, w, 24, { fill: '#fff', stroke: on ? 'var(--blue)' : '#8a94a8', r: 7, w: 1.5 }) + K.text(x + w / 2, y + 16, label, { size: 12, weight: 700 }) + '</g>';

  function draw(c) {
    const p = c.props, m = model(p); let s = '';
    m.es.forEach((e, i) => {
      const y0 = top(i), by = y0 + 34, py = y0 + 104, k = known(e), key = 'e' + i;
      const step = (ne) => ({ [key]: ser(ne), steps: p.steps + 1, msg: '' });
      s += K.rect(8, y0, W - 16, BH - 12, { fill: 'none', stroke: '#c5ccda', r: 10, w: 1 });
      s += K.line(BX, by, BX, py + 26, { w: 4 }) + K.line(BX - 36, py + 28, BX + 36, py + 28, { w: 5 }) + K.line(BX - ARM, by, BX + ARM, by, { w: 5, stroke: 'var(--good)' });
      for (const cx of [BX - ARM, BX + ARM]) s += K.line(cx, by, cx - PW / 2 + 8, py, { w: 1 }) + K.line(cx, by, cx + PW / 2 - 8, py, { w: 1 });
      s += pan(BX - ARM, py, e[0], e[1], e[2]) + pan(BX + ARM, py, e[3], e[4], e[5]);
      const tx = BX + ARM + PW / 2 + 22;
      s += K.text(tx, y0 + 30, eqStr(e), { size: 18, weight: 700, anchor: 'start', fill: k ? 'var(--good)' : 'var(--ink)' });
      if (k) s += K.text(tx, y0 + 50, (k.v ? '一个方盒' : '一个圆盒') + ' = ' + k.n, { size: 12, anchor: 'start', fill: 'var(--good)', weight: 700 });
      const dbl = scale(e, 2), dv = divisor(e), cn = cancel(e);
      s += setBtn(tx, y0 + 62, 62, '翻倍', step(dbl), fits(dbl) && e.some((n) => n > 0), '两个盘里的东西都变成 2 倍：还是平的');
      s += setBtn(tx + 68, y0 + 62, 88, dv ? '平分成 ' + dv + ' 份' : '平分', dv ? step(e.map((n) => n / dv)) : {}, !!dv, '两个盘都平分成同样的份数，各留一份');
      s += setBtn(tx, y0 + 92, 156, '两边拿走一样的东西', cn ? step(cn) : {}, !!cn, '两个盘里都有的盒子或砝码，各拿走同样多');
    });
    if (p.msg) s += K.text(W / 2, top(2) + 2, p.msg, { size: 13, weight: 700, fill: 'var(--bad)' });
    else if (m.x !== null && m.y !== null) s += K.text(W / 2, top(2) + 2, '解出来了：x = ' + m.x + '，y = ' + m.y, { size: 15, weight: 700, fill: 'var(--good)' });
    else s += K.text(W / 2, top(2) + 2, '把一架天平拖到另一架上：拿走一样重的东西（消元），或者把盒子换掉（代入）', { size: 12 });
    return s;
  }

  function grips(c) {
    return [0, 1].map((i) => ({ id: 'b' + i, x: BX, y: top(i) + 34, r: 11, text: '拖', cursor: 'grab', tip: '把这一架拖到另一架上',
      drag: (c0, q) => {
        const to = 1 - i, y0 = top(to); if (q.y < y0 || q.y > y0 + BH - 12) return { msg: '' };
        const es = [parse(c0.props.e0), parse(c0.props.e1)], r = dropOn(es, i, to);
        if (r.why) return { msg: r.why, refused: c0.props.refused + 1 };
        return { ['e' + to]: ser(r.e), steps: c0.props.steps + 1, msg: '' };
      },
      say: (c1) => c1.props.msg || eqStr(parse(c1.props['e' + (1 - i)])) }));
  }

  const I = (lo, hi, d, label, o) => Object.assign({ type: 'int', label, default: d, min: lo, max: hi, write: true }, o || {});
  const T = (d, label, o) => Object.assign({ type: 'text', label, default: d, write: true }, o || {});
  U.registerPack({
    id: 'systembench', version: 1,
    types: {
      systembench: {
        workspaceRole: 'none', handles: true, compactPorts: true, bench: true, essence: ['E4', 'E7'],
        label: '两架天平（方程组）', prefix: '方程组', group: '关系', grades: [5, 9],
        alias: ['方程组', '二元一次方程组', '消元', '代入', '加减消元', '代入消元', '鸡兔同笼', '天平'],
        props: {
          e0: T('1,1,0,0,0,7', '上面的天平：左盘的圆盒、方盒、砝码，右盘的圆盒、方盒、砝码（六个数）'),
          e1: T('2,1,0,0,0,10', '下面的天平：同样六个数'),
          x0: I(0, 30, 3, '圆盒的真实重量（出题人设）', { hidden: true }), y0: I(0, 30, 4, '方盒的真实重量（出题人设）', { hidden: true }),
          steps: I(0, 99, 0, '做了几步（自动记录）', { hidden: true }), refused: I(0, 99, 0, '被拦住几次（自动记录）', { hidden: true }),
          msg: T('', '提示（自动）', { hidden: true }),
        },
        outputs: {
          x: { dim: null, kind: 'num', label: '圆盒的重量（知道了才有）' }, y: { dim: null, kind: 'num', label: '方盒的重量（知道了才有）' },
          both: { dim: null, kind: 'num', label: '两个都解出来了：1 是，0 否' },
          steps: { dim: null, kind: 'num', label: '做了几步' }, refused: { dim: null, kind: 'num', label: '被拦住几次' },
        },
        icon: () => K.line(10, 12, 54, 12, { w: 2 }) + K.line(32, 12, 32, 20, { w: 2 }) + K.line(10, 30, 54, 30, { w: 2 }) + K.line(32, 30, 32, 38, { w: 2 }) + K.circle(16, 8, 4, { fill: '#f5c26b', stroke: 'var(--ink)', w: 1 }) + K.rect(44, 22, 8, 8, { fill: '#8fd19e', stroke: 'var(--ink)', w: 1, r: 1 }),
        size: () => [W, 2 * BH + 60],
        grips,
        compute: (c) => { const m = model(c.props), o = { both: num(m.x !== null && m.y !== null ? 1 : 0), steps: num(c.props.steps), refused: num(c.props.refused) }; if (m.x !== null) o.x = num(m.x); if (m.y !== null) o.y = num(m.y); return o; },
        badge: () => '',
        draw,
      },
    },
  });
  U.SystemBench = { parse, ser, eqStr, isolated, known, subtract, substitute, scale, divisor, cancel, dropOn, model, fits };
})(typeof globalThis !== 'undefined' ? globalThis : window);
