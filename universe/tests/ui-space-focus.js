/* node tests/ui-space-focus.js —— 空间（V2，docs/ui-geometry-feedback.md 1.2 和第 3 节 V2）。全部用真实鼠标点按钮：
 *   (a) 1024×768：打开几何题，画布占台面的比例 ≥ 60%（修复前约 15%）；窗口窄时左右栏自动收成窄条、工作区抽屉默认收起。
 *   (b) 抽屉：真实点击“工作区”展开，抽屉和画布不相交、抽屉在台面里；真实点击“收起”收回去。
 *   (c) 浮动工具条：在画布上方，不压住画布；真实点击“收起”，连线、剪、删除、撤销都藏起来；再点“工具”展开。
 *   (d) 专注：1440×860 下真实点击浮动条的“全屏”，浮层出现；收起抽屉后画布占台面 ≥ 80%；浮层里的“连线”可用（画线亮起），
 *       Esc 先退出画线、再按一次 Esc 还原；“还原”按钮也能还原；进去之后拖动不会挪动台面（台面的缩放平移不变）。
 *   (e) 左右栏窄条：真实点击栏上的按钮，栏展开（宽度恢复）、再点收起；展开的状态记住（重新打开页面还在）。
 *   每个手势之后的页面错误都收集起来检查（tests/gestures.js 的 attachErrorCollector）。没有调用 assertInvariants：
 *   它要求工作区里每个图形都有 name 标签，而这道题的多边形没有 name（标签由顶点算出），所以这里不用它。
 *   需要 playwright（NODE_PATH 指向它的 node_modules）。 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const G = require('./gestures');
const url = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const pause = (p, ms) => p.waitForTimeout(ms);
const pct = (x) => Math.round(x * 1000) / 10 + '%';

// 屏幕上的矩形（只要位置和大小）
const box = (p, sel) => p.evaluate((s) => {
  const el = document.querySelector(s); if (!el) return null;
  const q = el.getBoundingClientRect(); return { l: q.left, t: q.top, r: q.right, b: q.bottom, w: q.width, h: q.height };
}, sel);
const overlap = (a, b) => !(a.r <= b.l + 0.5 || a.l >= b.r - 0.5 || a.b <= b.t + 0.5 || a.t >= b.b - 0.5);
const inside = (a, c) => a.l >= c.l - 0.5 && a.r <= c.r + 0.5 && a.t >= c.t - 0.5 && a.b <= c.b + 0.5;
// 画布占台面的比例：焦点里就量焦点里的画布，否则量卡片上的画布
const canvasRatio = (p) => p.evaluate(() => {
  const st = document.querySelector('#stage').getBoundingClientRect();
  const sel = UI.State.focusedId() ? '#wsfocus svg.wsbody' : 'svg.wsbody';
  const c = document.querySelector(sel).getBoundingClientRect();
  return { ratio: (c.width * c.height) / (st.width * st.height), canvas: { l: c.left, t: c.top, r: c.right, b: c.bottom, w: c.width, h: c.height }, stage: { l: st.left, t: st.top, r: st.right, b: st.bottom, w: st.width, h: st.height } };
});
const wsIdOf = (p) => p.evaluate(() => Object.values(UI.S.scene.entities).find((e) => U.types[e.type].workspace).id);

(async () => {
  const b = await chromium.launch();

  // ---------- (a)(b)(c)(e) 1024×768 ----------
  const p = await b.newPage({ viewport: { width: 1024, height: 768 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  G.attachErrorCollector(p);
  await p.goto(url); await pause(p, 300);
  await p.evaluate(() => UI.App.openProblem('geo-pgram-cut', 'practice')); await pause(p, 400);
  const ws = await wsIdOf(p);
  const drawerSel = '.wsx[data-ws="' + ws + '"]', barSel = '.fbar[data-wsbar="' + ws + '"]';

  console.log('(a) 1024×768：画布占台面的比例');
  const m1 = await canvasRatio(p);
  ok(m1.ratio >= 0.6, '(a1) 打开几何题后，画布占台面的 ' + pct(m1.ratio) + '（要求 ≥ 60%；修复前约 15.4%）');
  const leftW = await box(p, '#left'), rightW = await box(p, '#right');
  ok(leftW.w <= 40 && rightW.w <= 40, '(a2) 窗口窄（1024）时左右栏自动收成窄条（左 ' + Math.round(leftW.w) + '、右 ' + Math.round(rightW.w) + ' 像素）');
  const drawerFolded = await p.evaluate((s) => document.querySelector(s).classList.contains('wsx-folded'), drawerSel);
  ok(drawerFolded, '(a3) 窗口窄时抽屉默认收起，画布占满台面');
  const stage = m1.stage;
  ok(inside(m1.canvas, stage), '(a4) 画布完全在台面里');

  console.log('(b) 抽屉：真实点击展开和收起');
  await p.click(drawerSel + ' .wsx-fold'); await pause(p, 200);
  const drawerOpen = await box(p, drawerSel), m2 = await canvasRatio(p);
  ok(!(await p.evaluate((s) => document.querySelector(s).classList.contains('wsx-folded'), drawerSel)), '(b1) 点“工作区”后抽屉展开');
  ok(!overlap(drawerOpen, m2.canvas), '(b2) 展开的抽屉和画布不相交（抽屉没压住画布）');
  ok(inside(drawerOpen, m2.stage), '(b3) 展开的抽屉完全在台面里');
  ok(await p.locator(drawerSel + ' .wsx-layers').count() === 1, '(b4) 抽屉里有图层、步骤、范围（内容还在）');
  await p.click(drawerSel + ' .wsx-fold'); await pause(p, 200);
  ok(await p.evaluate((s) => document.querySelector(s).classList.contains('wsx-folded'), drawerSel), '(b5) 再点“收起”，抽屉收回右下角');
  const m3 = await canvasRatio(p);
  ok(m3.ratio >= 0.6, '(b6) 收起后画布又占满，比例 ' + pct(m3.ratio));

  console.log('(c) 浮动工具条：收起与展开');
  const barBox = await box(p, barSel), canvasBox = m3.canvas;
  ok(!!barBox && barBox.b <= canvasBox.t + 0.5 && barBox.l >= canvasBox.l - 40, '(c1) 浮动条在画布上方，不压住画布');
  ok(await p.locator(barSel + ' [data-fbar="seg"]').isVisible(), '(c2) 展开时“连线”在浮动条里');
  await p.click(barSel + ' .fbar-fold'); await pause(p, 150);
  const hiddenTools = await p.evaluate((s) => ['seg', 'cut', 'del', 'undo'].every((t) => { const x = document.querySelector(s + ' [data-fbar="' + t + '"]'); return !x || !x.offsetParent; }), barSel);
  ok(hiddenTools && (await p.locator(barSel + '.shut').count()) === 1, '(c3) 点“收起”：连线、剪、删除、撤销都藏起来，只剩“工具”');
  await p.click(barSel + ' .fbar-fold'); await pause(p, 150);
  ok(await p.locator(barSel + ' [data-fbar="cut"]').isVisible(), '(c4) 再点“工具”：工具条展开');

  console.log('(e) 左右栏窄条：真实点击，并记住');
  await p.click('#lrail'); await pause(p, 250);
  const leftOpen = await box(p, '#left');
  ok(leftOpen.w > 200, '(e1) 点左边的按钮：实验库展开（宽 ' + Math.round(leftOpen.w) + ' 像素）');
  await p.click('#lrail'); await pause(p, 250);
  ok((await box(p, '#left')).w <= 40, '(e2) 再点：收回窄条');
  await p.click('#rrail'); await pause(p, 250);
  ok((await box(p, '#right')).w > 200, '(e3) 点右边的按钮：器材架展开');
  await p.click('#rrail'); await pause(p, 250);
  await p.click('#lrail'); await pause(p, 250);   // 左边展开（记住）
  await p.reload(); await pause(p, 300);
  ok((await box(p, '#left')).w > 200, '(e4) 刷新页面后，左边的展开状态还在（记住）');
  ok(errs.length === 0, '1024×768 没有页面错误和控制台错误' + (errs.length ? '：' + errs[0] : ''));
  await p.close();

  // ---------- (d) 1440×860 专注 ----------
  console.log('(d) 专注：真实点击进入、收起抽屉、画线、退出');
  const q = await b.newPage({ viewport: { width: 1440, height: 860 } });
  const errs2 = [];
  q.on('pageerror', (e) => errs2.push(e.message));
  q.on('console', (m) => { if (m.type() === 'error') errs2.push(m.text()); });
  G.attachErrorCollector(q);
  await q.goto(url); await pause(q, 300);
  await q.evaluate(() => UI.App.openProblem('geo-pgram-cut', 'practice')); await pause(q, 400);
  const ws2 = await wsIdOf(q);
  const bar2 = '.fbar[data-wsbar="' + ws2 + '"]';
  const focusVisible = () => q.evaluate(() => { const f = document.querySelector('#wsfocus'); return !!f && f.style.display !== 'none' && !!f.offsetParent; });
  await q.click(bar2 + ' [data-fbar="focus"]'); await pause(q, 200);
  ok(await focusVisible(), '(d1) 真实点击浮动条的“全屏”，专注浮层出现');
  ok((await q.locator('#wsfocus .wsf-main svg.wsbody').count()) === 1, '(d2) 浮层里是同一个工作区的画布');
  await q.click('#wsfocus .wsf-hd [data-fbar="side"]'); await pause(q, 200);
  const fc = await canvasRatio(q);
  ok(fc.ratio >= 0.8, '(d3) 收起抽屉后，专注画布占台面的 ' + pct(fc.ratio) + '（要求 ≥ 80%）');
  await q.click('#wsfocus .wsf-hd [data-fbar="seg"]'); await pause(q, 150);
  ok(await q.locator('#wsfocus .wsf-hd [data-fbar="seg"].on').count() === 1, '(d4) 专注里点“连线”：按钮亮起，进入画线');
  await q.keyboard.press('Escape'); await pause(q, 120);
  ok(!(await q.evaluate(() => !!UI.S.wsDraw)) && (await focusVisible()), '(d5) Esc 先退出画线，浮层还在');
  await q.keyboard.press('Escape'); await pause(q, 120);
  ok(!(await focusVisible()), '(d6) 再按一次 Esc，专注还原');
  await q.click(bar2 + ' [data-fbar="focus"]'); await pause(q, 200);
  await q.click('#wsfocus .wsf-hd [data-fbar="focus"]'); await pause(q, 150);
  ok(!(await focusVisible()), '(d7) 专注里点“还原”，回到台面');
  const before = await q.evaluate(() => JSON.stringify(UI.S.view));
  await q.click(bar2 + ' [data-fbar="focus"]'); await pause(q, 200);
  ok((await q.evaluate(() => JSON.stringify(UI.S.view))) === before, '(d8) 进入和退出专注时，台面的缩放和平移不变');
  await q.keyboard.press('Escape'); await pause(q, 120);
  ok(errs2.length === 0, '1440×860 专注没有页面错误和控制台错误' + (errs2.length ? '：' + errs2[0] : ''));
  await q.close();

  console.log('\n空间测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.log('FAIL 测试异常：' + e.message); process.exit(1); });
