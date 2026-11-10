/* node tests/ui-visual.js —— 色觉障碍的第二种区分手段和高对比度（V10，docs/ui-geometry-feedback.md 2.6b、第 3 节 V10）。
 *   (B1) 填充纹理：多边形（三角形也是）的填充可以选“纹理”：纯色 / 斜线 / 点阵。真实鼠标在属性面板里选，
 *        画布上的填充变成 url(#…) 图案，图案的定义（pattern）在同一个 svg 里；选回纯色就是颜色填充。
 *   (B2) 点形状：不同器材产生的点用不同形状（自由点 圆、中点 方、重心 倒三角、圆心 十字、三分之一点 星、垂足 菱形），
 *        形状写在画布元素的 data-shape 上，并且和器材的 pointShape 声明一致；同一个工作区里，点的形状两两不同。
 *   (B3) 高对比度开关：菜单里的“高对比度”按钮（真实鼠标点开菜单、点开关）；打开后 <html data-contrast="high">，
 *        深色和浅色两套主题下，颜色令牌的文字组合都 >= 4.5:1；记在 localStorage，刷新后还在；关掉恢复。
 * 需要 playwright（NODE_PATH 指向它的 node_modules）。 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const G = require('./gestures');
const { contrastRatio, hexToRgb, MIN } = require('../tools/contrast');
const url = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

// 文字组合（和 tests/ui-theme.js 的 PAIRS 相同）：[文字令牌, 背景令牌]
const PAIRS = [
  ['--txt', '--bg'], ['--txt', '--panel'], ['--txt2', '--panel'], ['--txt3', '--panel'], ['--txt3', '--bg'],
  ['--txt', '--panel2'], ['--txt2', '--panel2'], ['--txt', '--sel-bg'], ['--blue-ink', '--panel'],
  ['--orange', '--panel2'], ['--orange', '--sel-bg'], ['--ink', '--card'], ['--dim', '--card'],
  ['--txt', '--sig-bg'], ['--txt', '--sig-err'], ['--txt', '--sig-ok'], ['--ok-ink', '--sel-bg'], ['--bad-ink', '--panel'],
  ['--off-ink', '--off-bg'], ['--off-ink2', '--off-bg'], ['--warnbox-ink', '--warnbox-bg'], ['--new-ink', '--new-bg'], ['--msg-good-ink', '--msg-good-bg'], ['--msg-bad-ink', '--msg-bad-bg'],
];

(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  G.attachErrorCollector(p);
  await p.goto(url); await p.waitForTimeout(300);
  await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); });
  await p.waitForTimeout(150);

  console.log('搭场景：工作区里 A(0,0)、B(6,0)、C(2,6) 围成三角形 ABC（多边形），再放 R(6,4)，用来取垂足');
  const ids = await p.evaluate(() => {
    const A = UI.App;
    const ws = A.act({ t: 'add', type: 'gworkspace', x: 120, y: 60 }).id;
    const put = (id) => A.act({ t: 'put', id, parent: ws, slot: 'items' });
    const pt = (name, x, y) => { const n = A.act({ t: 'add', type: 'gpt', x: 0, y: 0, props: { x, y, mark: name } }).id; put(n); return n; };
    const link = (from, to, port) => A.act({ t: 'link', from, fromPort: 'p', to, toPort: port });
    const a = pt('A', 0, 0), bb = pt('B', 6, 0), c = pt('C', 2, 6), r = pt('R', 6, 4);
    const tri = A.act({ t: 'add', type: 'gpoly', x: 0, y: 0 }).id;
    [a, bb, c].forEach((q) => link(q, tri, 'pts'));
    put(tri);
    const shape = (type, ports, ps) => { const s = A.act({ t: 'add', type, x: 0, y: 0 }).id; ps.forEach((q, i) => link(q, s, ports[i])); put(s); return s; };
    const mid = shape('gmid', ['a', 'b'], [a, bb]);
    const cen = shape('gcentroid', ['a', 'b', 'c'], [a, bb, c]);
    const cir = shape('gcircum', ['a', 'b', 'c'], [a, bb, c]);
    const t13 = shape('gtri1', ['a', 'b'], [a, bb]);
    const perp = shape('gperp', ['p', 'a', 'b'], [r, a, bb]);
    UI.Stage.fit(); UI.Stage.render();
    return { ws, tri, a, b: bb, c, r, mid, cen, cir, t13, perp };
  });
  await p.waitForTimeout(250);
  ok(!!ids.ws && !!ids.tri, '工作区、三角形和构造点放好');

  try {
    // ---------- (B1) 填充纹理：真实鼠标在属性面板里选 ----------
    // 三角形的填充属性（工作区里带 data-pick 的多边形路径，填充不是 none）
    const fillOf = () => p.evaluate((ws) => [...document.querySelectorAll('svg.wsbody[data-wsid="' + ws + '"] path[data-pick][fill]')].map((x) => x.getAttribute('fill')).filter((f) => f !== 'none').join(' '), ids.ws);
    const hasTexPattern = (kind) => p.evaluate((kind) => !!document.querySelector('pattern[id^="tex-' + kind + '-"]') && document.querySelectorAll('svg.wsbody path[fill^="url(#tex-' + kind + '-"]').length > 0, kind);
    // 面板里的“填充”控件：可能是分段按钮（data-seg），也可能是下拉框（select）
    const pickTex = async (idx) => {
      await p.evaluate((id) => { UI.S.sel = id; UI.S.inspOpen = true; UI.Panels.renderInsp(); }, ids.tri);
      await p.waitForTimeout(150);
      const seg = p.locator('[data-k="tex"][data-seg="' + idx + '"]');
      if ((await seg.count()) > 0) { await seg.first().click(); }
      else { await p.locator('select[data-k="tex"]').first().selectOption(String(idx)); }
      await p.waitForTimeout(250);
    };
    const before = await fillOf();
    ok(!/url\(/.test(before) && before.length > 0, '(B1) 默认是纯色填充：' + before.slice(0, 60));
    await pickTex(1);
    await G.assertInvariants(p, '选斜线纹理');
    ok(await hasTexPattern('hatch'), '(B1) 选“斜线”：三角形的填充变成斜线图案（url(#tex-hatch-…)），图案定义在 svg 里');
    await pickTex(2);
    await G.assertInvariants(p, '选点阵纹理');
    ok(await hasTexPattern('dots'), '(B1) 选“点阵”：三角形的填充变成点阵图案（url(#tex-dots-…)）');
    await pickTex(0);
    ok(!(await hasTexPattern('dots')) && !(await hasTexPattern('hatch')), '(B1) 选回“纯色”：没有纹理了，又是颜色填充');
    // 撤销：每一次选择是一个撤销项
    const u0 = await p.evaluate(() => UI.S.undo.length);
    await G.undo(p); await p.waitForTimeout(150);
    ok((await p.evaluate(() => UI.S.undo.length)) === u0 - 1, '(B1) 选填充是一步，可以撤销');

    // ---------- (B2) 点形状：不同器材的点用不同形状 ----------
    await p.waitForTimeout(150);
    const shapesOf = (id) => p.evaluate((id) => {
      const out = [];
      document.querySelectorAll('svg.wsbody [data-shape]').forEach((el) => {
        const pk = el.getAttribute('data-pick');
        if (pk) out.push({ shape: el.getAttribute('data-shape'), tag: el.tagName.toLowerCase(), pick: pk });
      });
      return out;
    }, id);
    const all = await shapesOf(ids.ws);
    const seen = [...new Set(all.map((s) => s.shape))].sort();
    const want = { mid: 'square', cen: 'tdown', cir: 'cross', t13: 'star', perp: 'diamond' };
    const pointsByShape = {};
    for (const s of all) pointsByShape[s.shape] = (pointsByShape[s.shape] || 0) + 1;
    ok(seen.length >= 5, '(B2) 工作区里的点有 ' + seen.length + ' 种形状：' + seen.join('、'));
    const dec = await p.evaluate(() => Object.fromEntries(Object.entries(window.U.types).filter(([k, v]) => v.pointShape).map(([k, v]) => [k, v.pointShape])));
    ok(dec.gmid === 'square' && dec.gcentroid === 'tdown' && dec.gcircum === 'cross' && dec.gtri1 === 'star' && dec.gperp === 'diamond' && dec.gpt === 'circle', '(B2) 形状写在器材的 pointShape 声明里：' + JSON.stringify(dec));
    const shapeTags = { square: 'rect', triangle: 'polygon', tdown: 'polygon', diamond: 'polygon', cross: 'path', star: 'polygon', circle: 'circle' };
    ok(Object.keys(want).every((k) => all.some((s) => s.shape === want[k] && s.tag === shapeTags[want[k]])), '(B2) 每种构造点的形状都画出来了（中点 方、重心 倒三角、圆心 十字、三分之一点 星、垂足 菱形）');
    const distinctTags = [...new Set(all.map((s) => s.tag + '/' + s.shape))];
    ok(seen.length === new Set(seen).size && Object.keys(pointsByShape).length === seen.length, '(B2) 不同形状两两不同：' + distinctTags.join('、'));
    // 自由点是圆（把手的圆，或 data-shape="circle"）：画布上存在圆形的点元素
    const freeCircles = await p.evaluate((ws) => document.querySelectorAll('svg.wsbody[data-wsid="' + ws + '"] circle[data-drag], svg.wsbody[data-wsid="' + ws + '"] circle[data-shape="circle"]').length, ids.ws);
    ok(freeCircles >= 4, '(B2) 自由点是圆（A、B、C、R 四个把手或圆形点）：' + freeCircles + ' 个');
    // 形状和颜色都要有（色觉障碍：只靠颜色不够）
    const fills = await p.evaluate((ws) => [...document.querySelectorAll('svg.wsbody[data-wsid="' + ws + '"] [data-shape]')].map((e) => (e.getAttribute('fill') !== 'none' ? e.getAttribute('fill') : e.getAttribute('stroke'))), ids.ws);
    ok(fills.length > 0 && fills.every((c) => !!c && c !== 'none'), '(B2) 每个形状都有颜色（形状加颜色，不是只靠颜色）');

    // ---------- (B3) 高对比度开关：菜单里的按钮，真实鼠标 ----------
    await p.locator('#menubtn').click(); await p.waitForTimeout(120);
    const btn = p.locator('#contrastbtn');
    ok((await btn.count()) === 1, '(B3) 菜单里有“高对比度”开关');
    ok((await btn.getAttribute('aria-pressed')) === 'false', '(B3) 默认关闭（aria-pressed=false）');
    await btn.click(); await p.waitForTimeout(150);
    ok((await p.evaluate(() => document.documentElement.getAttribute('data-contrast'))) === 'high', '(B3) 点一下，<html> 的 data-contrast 变成 high');
    ok((await btn.getAttribute('aria-pressed')) === 'true', '(B3) 开关显示“开”（aria-pressed=true）');

    const contrastOf = (tokens, pairs) => pairs.map(([a, c]) => {
      const x = hexToRgb(tokens[a]), y = hexToRgb(tokens[c]);
      return { pair: a + ' / ' + c, r: x && y ? contrastRatio(x, y) : 0, raw: [tokens[a], tokens[c]] };
    });
    const readTokens = () => p.evaluate((names) => {
      const cs = getComputedStyle(document.documentElement), out = {};
      for (const n of names) out[n] = cs.getPropertyValue(n).trim();
      return out;
    }, [...new Set(PAIRS.flat())]);
    for (const scheme of ['dark', 'light']) {
      await p.emulateMedia({ colorScheme: scheme }); await p.waitForTimeout(150);
      const theme = await p.evaluate(() => document.documentElement.getAttribute('data-theme'));
      const tokens = await readTokens();
      const res = contrastOf(tokens, PAIRS);
      const bad = res.filter((r) => !(r.r >= MIN));
      ok(bad.length === 0, '(B3) 高对比度 · ' + (theme === 'light' ? '浅色' : '深色') + '主题：文字组合全部 >= ' + MIN + ':1' + (bad.length ? '（不合格：' + bad.map((r) => r.pair + ' ' + r.r.toFixed(2)).join('；') + '）' : '（最低 ' + Math.min(...res.map((r) => r.r)).toFixed(2) + ':1）'));
    }
    // 记住：刷新后还是高对比度
    await p.reload(); await p.waitForTimeout(300);
    ok((await p.evaluate(() => document.documentElement.getAttribute('data-contrast'))) === 'high', '(B3) 刷新后仍然是高对比度（记在 localStorage）');
    await p.locator('#menubtn').click(); await p.waitForTimeout(120);
    await p.locator('#contrastbtn').click(); await p.waitForTimeout(150);
    ok((await p.evaluate(() => document.documentElement.getAttribute('data-contrast'))) === 'normal', '(B3) 再点一下：关闭，恢复普通对比度');
    const stored = await p.evaluate(() => { try { return localStorage.getItem('universe.contrast'); } catch (e) { return 'x'; } });
    ok(stored === null, '(B3) 关闭后 localStorage 里的记录清掉了');
  } catch (e) {
    fail++; console.log('  FAIL 测试中断：' + e.message);
  }

  ok(errs.length === 0, '没有控制台错误' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n视觉区分与高对比度测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close();
  process.exit(fail ? 1 : 0);
})();
