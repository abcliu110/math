/* node tests/ui-feedback.js —— 反馈（V7，docs/ui-geometry-feedback.md 2.5、2.13 和第 3 节 V7）。用真实鼠标：
 *   2.13 新手引导：
 *     (a) 第一次出现几何工作区时弹出引导；
 *     (b) 真实点“知道了”关闭；刷新以后不再自动弹出（本地存储记住了）；
 *     (c) 菜单里的“几何工作区引导”可以再打开，关闭后仍然可以正常操作台面。
 *   2.5 工具说明与状态：
 *     (d) 每个工作区工具都有说明（UI.ToolHelp，表里有、且 tip 不空）；
 *     (e) 悬停工具按钮，说明出现（CSS 的 data-tip 伪元素）；
 *     (f) 点“连线”“剪”进入画线模式：工具按钮高亮，画布上出现“当前工具：…”状态提示，指针是十字；按 Esc 后状态消失。
 *   每次手势之后检查不变量（tests/gestures.js）；没有页面错误和控制台错误。
 * 需要 playwright（NODE_PATH 指向它的 node_modules）。 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const G = require('./gestures');
const url = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

// 引导卡片是否可见（computed display，不看 DOM 里有没有）
const guideShown = (p) => p.evaluate(() => { const g = document.querySelector('#guide'); return !!g && getComputedStyle(g).display !== 'none'; });
// 台面上有没有某段文字（画布 SVG 里的文字）
const canvasHas = (p, ws, text) => p.evaluate(([ws, text]) => { const wb = document.querySelector('svg.wsbody[data-wsid="' + ws + '"]'); return !!wb && wb.textContent.includes(text); }, [ws, text]);
const addWs = (p) => p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); return UI.App.act({ t: 'add', type: 'gworkspace', x: 120, y: 60 }).id; });

(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  G.attachErrorCollector(p);
  await p.goto(url); await p.waitForTimeout(300);

  console.log('(a) 第一次出现几何工作区：弹出引导');
  ok(!(await guideShown(p)), '没有工作区时不弹引导（新手页面）');
  const ws = await addWs(p);
  await p.waitForTimeout(250);
  await G.assertInvariants(p, '放入几何工作区');
  ok(await guideShown(p), '第一次出现几何工作区，引导弹出');
  const guideText = await p.evaluate(() => document.querySelector('#guide').textContent);
  ok(['拖入器材', '画线', '剪', '删除'].every((w) => guideText.includes(w)), '引导说明了拖入器材、画线、剪、删除（四步）');

  console.log('(b) 真实点“知道了”关闭；刷新后不再自动弹出');
  await p.click('#guide-close');
  await p.waitForTimeout(150);
  ok(!(await guideShown(p)), '点“知道了”后引导收起');
  const remembered = await p.evaluate(() => { try { return localStorage.getItem('universe-guide-ws-v1'); } catch (e) { return 'err'; } });
  ok(remembered === '1', '关闭后记住（本地存储 universe-guide-ws-v1 = 1）');
  await p.reload(); await p.waitForTimeout(400);
  await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); return UI.App.act({ t: 'add', type: 'gworkspace', x: 120, y: 60 }).id; });
  await p.waitForTimeout(250);
  ok(!(await guideShown(p)), '刷新后再放入几何工作区，引导不再自动弹出');

  console.log('(c) 菜单里可以再打开');
  await p.click('#menubtn');
  await p.locator('#menu button', { hasText: '几何工作区引导' }).waitFor({ state: 'visible' });
  await p.locator('#menu button', { hasText: '几何工作区引导' }).click();
  await p.waitForTimeout(150);
  ok(await guideShown(p), '菜单 → 几何工作区引导：引导再次打开');
  await p.click('#guide-close');
  await p.waitForTimeout(150);
  await G.assertInvariants(p, '关闭引导后');

  console.log('(d) 每个工作区工具都有说明');
  const toolIds = await p.evaluate(() => U.types.gworkspace.workspace.tools.map((t) => t.id));
  const missing = await p.evaluate((ids) => ids.filter((id) => { const h = UI.ToolHelp.of(id); return !h || !h.tip; }), toolIds);
  ok(toolIds.length > 0 && missing.length === 0, '说明表覆盖全部 ' + toolIds.length + ' 个工具' + (missing.length ? '，缺：' + missing.join('、') : ''));
  const btnTips = await p.evaluate(() => [...document.querySelectorAll('.wsx-tools [data-ws-tool]')].map((x) => x.getAttribute('data-tip') || ''));
  ok(btnTips.length === toolIds.length && btnTips.every((t) => t.length > 0), '每个工具按钮都带 data-tip（' + btnTips.filter(Boolean).length + '/' + btnTips.length + '）');

  console.log('(e) 悬停工具按钮，说明出现');
  await p.hover('.wsx-tools [data-ws-tool="seg"]');
  await p.waitForTimeout(120);
  const shownTip = await p.evaluate(() => getComputedStyle(document.querySelector('.wsx-tools [data-ws-tool="seg"]'), '::after').content);
  ok(shownTip.includes('点两下画一条线'), '悬停“连线”，说明显示：' + shownTip.slice(0, 40));
  await p.mouse.move(2, 2);

  console.log('(f) 选中“连线”：按钮高亮、台面出现当前工具状态、指针变十字；Esc 后消失');
  await p.click('[data-ws-tool="seg"]');
  await p.waitForTimeout(150);
  await G.assertInvariants(p, '点连线（进入画线模式）');
  const onSeg = await p.evaluate(() => { const x = document.querySelector('[data-ws-tool="seg"]'); return x.classList.contains('on') && x.getAttribute('aria-pressed') === 'true'; });
  ok(onSeg, '“连线”按钮高亮（class on，aria-pressed）');
  ok(await canvasHas(p, ws, '当前工具：连线'), '台面（画布）上出现“当前工具：连线……”状态提示');
  const crossOn = await p.evaluate((ws) => document.querySelector('svg.wsbody[data-wsid="' + ws + '"]').classList.contains('drawing'), ws);
  ok(crossOn, '画线时画布带 drawing 类（指针是十字）');

  await p.keyboard.press('Escape');
  await p.waitForTimeout(150);
  await G.assertInvariants(p, 'Esc 取消画线');
  ok(!(await canvasHas(p, ws, '当前工具：连线')), 'Esc 后台面上的状态提示消失');
  const offSeg = await p.evaluate(() => !document.querySelector('[data-ws-tool="seg"]').classList.contains('on'));
  ok(offSeg, 'Esc 后“连线”不再高亮');

  await p.click('[data-ws-tool="cut"]');
  await p.waitForTimeout(150);
  ok(await canvasHas(p, ws, '当前工具：剪'), '选中“剪”：台面上出现“当前工具：剪……”');
  await p.keyboard.press('Escape');
  await p.waitForTimeout(100);
  await G.assertInvariants(p, '剪之后 Esc');

  ok(errs.length === 0, '没有页面错误和控制台错误' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n反馈测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.log('  FAIL 脚本异常：' + e.message); process.exit(1); });
