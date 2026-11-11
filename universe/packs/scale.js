/* 器材包 scale：缩放对比和影子测高（docs/new-instruments.md 6.9）。两个器材一个包。
 *   scale（缩放对比）：一个图形，放大 k 倍的副本并排。先猜：周长、面积、体积各是原来的几倍？再看读数；k 可以是 1/2、3/2 这样的分数。
 *     周长比是 k，面积比是 k²，体积比是 k³；面积比用“小方格铺满”看：大图形里有 k² 个原来大小的格子（k 是整数时数得出来）。
 *   shadow（影子测高）：一根已知高度的杆和它的影子，一棵树和它的影子；改变太阳的高度，两个影子一起变；量得到杆高、杆影、树影，量不到树高——先猜，再列比例。
 * 和设计文档的差别（如实写）：两个都是独立器材，不是几何工作区里的“放大副本”；缩放对比只有 3 种图形（长方形、正方形、立方体）；影子测高的太阳只取 4 个高度（影子长是有理数）。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit;
  const num = (n) => U.val('num', typeof n === 'number' ? Q(n) : n, { dim: null });
  const rq = (t) => { try { const q = Q.parse(String(t)); return q && Q.cmp(q, Q(0)) > 0 ? q : null; } catch (e) { return null; } };
  const SH = [{ name: '长方形 3 × 2', w: 3, h: 2, d: 0 }, { name: '正方形 2 × 2', w: 2, h: 2, d: 0 }, { name: '立方体 2 × 2 × 2', w: 2, h: 2, d: 2 }];
  const ans = (t) => { try { return Q.parse(String(t)); } catch (e) { return null; } };
  function sJudge(p) {
    const k = rq(p.k) || Q(1), sh = SH[p.shape], k2 = Q.mul(k, k), k3 = Q.mul(k2, k), g = ans(p.gans);
    return { k, sh, perim: k, area: k2, vol: sh.d ? k3 : null, guessed: g && Q.cmp(g, k2) === 0 ? 1 : 0, cells: Q.isInt(k) ? Number(k.n) ** 2 : 0 };
  }
  function sDraw(c) {
    const p = c.props, J = sJudge(p), W = c.w, sh = J.sh, kn = Q.num(J.k); let s = '';
    const u = 14, x0 = 14, y0 = 20, big = Math.min(150, sh.w * u * kn);
    s += K.rect(x0, y0 + 90 - sh.h * u, sh.w * u, sh.h * u, { fill: '#f5a25d', stroke: 'var(--ink)', r: 0 }) + K.text(x0 + sh.w * u / 2, y0 + 106, '原来', { size: 10.5, fill: 'var(--dim)' });
    const bw = Math.min(150, sh.w * u * kn), bh = Math.min(90, sh.h * u * kn), x1 = x0 + sh.w * u + 30;
    s += K.rect(x1, y0 + 90 - bh, bw, bh, { fill: '#5b9bd5', fillOpacity: 0.5, stroke: 'var(--ink)', r: 0 }) + K.text(x1 + bw / 2, y0 + 106, '放大 ' + p.k + ' 倍', { size: 10.5, fill: 'var(--dim)' });
    if (Q.isInt(J.k) && kn >= 1 && kn <= 5) for (let i = 0; i < kn * sh.w; i++) for (let j = 0; j < kn * sh.h; j++) s += K.rect(x1 + i * (bw / (kn * sh.w)), y0 + 90 - bh + j * (bh / (kn * sh.h)), bw / (kn * sh.w), bh / (kn * sh.h), { fill: 'none', stroke: 'var(--card)', w: 0.5, r: 0 });
    let y = y0 + 130; s += K.text(10, y, sh.name + '，放大 ' + p.k + ' 倍', { size: 12, anchor: 'start', weight: 700 }); y += 20;
    if (c.masked) s += K.text(10, y, '先猜：面积是原来的几倍？（填“我猜面积是几倍”）', { size: 12, anchor: 'start', weight: 700, fill: 'var(--accent)' });
    else { s += K.text(10, y, '周长 × ' + Q.show(J.perim) + '　面积 × ' + Q.show(J.area) + (sh.d ? '　体积 × ' + Q.show(J.vol) : ''), { size: 12.5, anchor: 'start', weight: 700 }); if (J.cells) s += K.text(10, y + 18, '用原来大小的小方格铺满：正好 ' + J.cells + ' 个', { size: 11, anchor: 'start', fill: 'var(--dim)' }); }
    return s;
  }
  const SUN = [Q(1), Q(3, 4), Q(1, 2), Q(1, 4)];   // 太阳高度的正切：影子 = 高 ÷ tan
  function hJudge(p) {
    const t = SUN[p.sun], ps = Q.div(Q(p.pole), t), ts = Q.div(Q(p.tree), t), g = ans(p.hgt), a = ans(p.myans);
    return { t, ps, ts, ratio: Q.div(ts, ps), height: Q.div(Q.mul(Q(p.pole), ts), ps), ok: a && Q.cmp(a, Q(p.tree)) === 0 ? 1 : 0, guessed: g && Q.cmp(g, Q(p.tree)) === 0 ? 1 : 0 };
  }
  function hDraw(c) {
    const p = c.props, J = hJudge(p), W = c.w, H = []; let s = '', gy = 124;
    const u = 10, sx = 8; const sunLen = (len) => Q.num(len) * u * 0.55;
    s += K.line(10, gy, W - 10, gy, { stroke: 'var(--dim)', w: 2 });
    const x1 = 30, ph = p.pole * u * 0.55 * 2, tx = 150, th = p.tree * u * 0.55 * 2;
    s += K.line(x1, gy, x1, gy - ph, { stroke: 'var(--ink)', w: 4 }) + K.line(x1, gy, x1 + sunLen(J.ps) * 2, gy, { stroke: 'var(--ink)', w: 3, opacity: 0.4 });
    s += K.line(tx, gy, tx, gy - th, { stroke: 'var(--good)', w: 7 }) + K.circle(tx, gy - th, 10, { fill: 'var(--good)' });
    s += K.line(tx, gy, tx + sunLen(J.ts) * 2, gy, { stroke: 'var(--good)', w: 3, opacity: 0.4 });
    s += K.text(x1, gy + 14, '杆 ' + p.pole + ' 米，影 ' + Q.show(J.ps) + ' 米', { size: 10.5, anchor: 'start' }) + K.text(tx - 10, gy + 14, '树影 ' + Q.show(J.ts) + ' 米', { size: 10.5, anchor: 'start' });
    s += K.text(10, 16, '太阳高度：点一下换', { size: 11, anchor: 'start', fill: 'var(--dim)' });
    SUN.forEach((q, i) => { const x = 110 + i * 56, on = p.sun === i; s += K.rect(x, 4, 50, 18, { fill: on ? 'var(--accent)' : 'var(--sel-bg)', r: 9 }) + K.text(x + 25, 17, ['高', '中高', '中低', '低'][i], { size: 11, weight: 700, fill: on ? '#fff' : 'var(--ink)' }); H.push('<rect x="' + x + '" y="4" width="50" height="18" fill="transparent" data-pick-k="sun" data-pick-v="' + i + '" style="cursor:pointer"/>'); });
    s += K.text(10, gy + 36, c.masked ? '先猜：树有多高？（填“我猜树高”）' : '杆影 ÷ 树影 = ' + Q.show(Q.div(J.ps, J.ts)) + '　树高 = 杆高 × 树影 ÷ 杆影 = ' + Q.show(J.height) + ' 米', { size: 11.5, anchor: 'start', weight: 700, fill: c.masked ? 'var(--accent)' : 'var(--ink)' });
    return s + H.join('');
  }
  U.registerPack({
    id: 'scale', version: 1, needs: [],
    types: {
      scale: {
        workspaceRole: 'none', handles: true, compactPorts: true, essence: ['E3', 'E12', 'E5'], label: '缩放对比', prefix: '缩', group: '图形', grades: [5, 9], alias: ['缩放', '放大', '相似', '面积比', '周长比', '体积比', 'k的平方'],
        props: { shape: { type: 'choice', label: '图形', default: 0, choices: SH.map((x) => x.name) }, k: { type: 'text', label: '放大几倍（可以是 1/2、3/2）', default: '1' }, gans: { type: 'text', label: '我猜面积是原来的几倍', default: '' } },
        guess: { props: ['gans'], ports: ['area', 'perim', 'vol', 'cells'], answered: (p) => ans(p.gans) !== null && String(p.gans).trim() !== '' },
        outputs: { k: { dim: null, kind: 'num', label: '放大倍数 k' }, perim: { dim: null, kind: 'num', label: '周长是原来的几倍' }, area: { dim: null, kind: 'num', label: '面积是原来的几倍' }, vol: { dim: null, kind: 'num', label: '体积是原来的几倍' }, cells: { dim: null, kind: 'num', label: '铺满要几个原来大小的格子' }, guessed: { dim: null, kind: 'num', label: '先猜对了（1/0）' } },
        icon: () => K.rect(10, 30, 16, 16, { fill: '#f5a25d', r: 0 }) + K.rect(30, 14, 28, 28, { fill: '#5b9bd5', r: 0 }),
        size: () => [380, 200],
        compute: (c) => { const J = sJudge(c.props); c.say('info', '面积是原来的 ' + Q.show(J.area) + ' 倍'); const o = { k: num(J.k), perim: num(J.perim), area: num(J.area), cells: num(J.cells), guessed: num(J.guessed) }; if (J.vol) o.vol = num(J.vol); return o; },
        badge: (c) => (c.masked ? '？' : ''),
        draw: sDraw,
      },
      shadow: {
        workspaceRole: 'none', handles: true, compactPorts: true, essence: ['E3', 'E12', 'E5'], label: '影子测高', prefix: '影', group: '图形', grades: [6, 9], alias: ['影子测高', '相似三角形', '比例', '测高', '影子'],
        props: { pole: { type: 'int', label: '杆高（米）', default: 2, min: 1, max: 10 }, tree: { type: 'int', label: '树高（米，出题人设）', default: 8, min: 1, max: 30 }, sun: { type: 'int', label: '太阳高度（0 最高）', default: 0, min: 0, max: 3 }, hgt: { type: 'text', label: '我猜树高', default: '' }, myans: { type: 'text', label: '我算出的树高', default: '' }, seen: { hidden: true, type: 'text', label: '看过的太阳', default: '', write: false } },
        onSet: (p, k, v) => (k === 'sun' ? { seen: String(p.seen || '').split('').includes(String(v)) ? p.seen : String(p.seen || '') + v } : null),
        guess: { props: ['hgt'], ports: ['height', 'ratio'], answered: (p) => ans(p.hgt) !== null && String(p.hgt).trim() !== '' },
        outputs: { poleShadow: { dim: null, kind: 'num', label: '杆影（米）' }, treeShadow: { dim: null, kind: 'num', label: '树影（米）' }, ratio: { dim: null, kind: 'num', label: '树影 ÷ 杆影' }, height: { dim: null, kind: 'num', label: '树高（按比例算）' }, ok: { dim: null, kind: 'num', label: '我算的树高对了（1/0）' }, suns: { dim: null, kind: 'num', label: '看过几个太阳高度' }, guessed: { dim: null, kind: 'num', label: '先猜对了（1/0）' } },
        icon: () => K.line(16, 50, 16, 20, { w: 3 }) + K.line(40, 50, 40, 10, { stroke: 'var(--good)', w: 6 }) + K.line(10, 50, 58, 50, { stroke: 'var(--dim)', w: 2 }),
        size: () => [380, 190],
        compute: (c) => { const J = hJudge(c.props); c.say(J.ok ? 'ok' : 'info', '杆影 ' + Q.show(J.ps) + ' 米，树影 ' + Q.show(J.ts) + ' 米'); return { poleShadow: num(J.ps), treeShadow: num(J.ts), ratio: num(J.ratio), height: num(J.height), ok: num(J.ok), suns: num(String(c.props.seen || '').length || 1), guessed: num(J.guessed) }; },
        badge: (c) => (c.masked ? '？' : ''),
        draw: hDraw,
      },
    },
  });
  U.ScaleLab = { sJudge, hJudge };
})(typeof globalThis !== 'undefined' ? globalThis : window);
