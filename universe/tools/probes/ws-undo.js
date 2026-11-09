/* 真实鼠标探针：用 playwright 驱动真实页面，复现用户的操作。用法见 docs/ui-robustness.md 第 7 节。
 * 运行：NODE_PATH=<playwright 所在的 node_modules> node tools/probes/ws-undo.js [输出截图.png]
 * 浏览器：默认找系统 Chrome；可用环境变量 CHROME 指定路径。 */
'use strict';
const path = require('path');
const { chromium } = require('playwright');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PAGE = 'file:///' + path.join(__dirname, '..', '..', 'index.html').split(path.sep).join('/');
(async () => {
  const b = await chromium.launch({ executablePath: CHROME });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(PAGE); await p.waitForTimeout(400);
  const ws = await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); return UI.App.act({ t: 'add', type: 'gworkspace', x: 120, y: 60 }).id; });
  await p.waitForTimeout(150);
  const wb = await p.locator('.card[data-id="' + ws + '"] svg.wsbody').first().boundingBox();
  const t = p.locator('.tile[data-type="ftri"]').first(); await t.scrollIntoViewIfNeeded(); const tb = await t.boundingBox();
  await p.mouse.move(tb.x + 30, tb.y + 20); await p.mouse.down(); await p.mouse.move(wb.x + wb.width / 2, wb.y + wb.height / 2, { steps: 10 }); await p.mouse.up(); await p.waitForTimeout(250);
  const n = () => p.evaluate(() => Object.keys(UI.S.scene.entities).length);
  const hiddenN = () => p.evaluate(() => Object.values(UI.S.scene.entities).filter((e) => e.hidden).length);
  console.log('拖入后 实体数', await n(), '隐藏的', await hiddenN());
  await p.evaluate(() => UI.App.undo()); await p.waitForTimeout(150);
  console.log('撤销一次后 实体数', await n(), '（期望 1：只剩工作区）');
  await p.evaluate(() => UI.App.redo()); await p.waitForTimeout(150);
  console.log('重做后 实体数', await n());
  // 存档读回
  const saved = await p.evaluate(() => U.World.save(UI.S.scene));
  const back = await p.evaluate((s) => { const sc = U.World.load(s); return { n: Object.keys(sc.entities).length, hidden: Object.values(sc.entities).filter((e) => e.hidden).length }; }, saved);
  console.log('存档读回', JSON.stringify(back));
  // 视图范围（S.wsView）是否进了存档/撤销
  console.log('wsView 在存档里吗', await p.evaluate((s) => s.includes('wsView'), saved), '| 在 undo 快照里吗', await p.evaluate(() => { const f = UI.App.snapshot && UI.App.snapshot.toString(); return /wsView/.test(String(UI.S.undo && UI.S.undo.length ? JSON.stringify(UI.S.undo[UI.S.undo.length - 1]) : '')); }));
  // 刷新页面后是否还在（自由台面自动保存）
  await p.reload(); await p.waitForTimeout(500);
  console.log('刷新页面后 实体数', await p.evaluate(() => (UI.S.scene ? Object.keys(UI.S.scene.entities).length : -1)));
  console.log('errors', JSON.stringify(errs));
  await b.close();
})().catch((e) => { console.error('SCRIPT', e.message); process.exit(1); });
