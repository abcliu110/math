/* 真实鼠标探针：用 playwright 驱动真实页面，复现用户的操作。用法见 docs/ui-robustness.md 第 7 节。
 * 运行：NODE_PATH=<playwright 所在的 node_modules> node tools/probes/ws-drop.js [输出截图.png]
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
  await p.evaluate(() => { const S = UI.S; S.view.x = 0; S.view.y = 0; UI.Stage.render(); }).catch(() => {});
  await p.waitForTimeout(200);
  const wb = await p.locator('.card[data-id="' + ws + '"]').first().boundingBox();
  const state = () => p.evaluate((ws) => Object.values(UI.S.scene.entities).filter((e) => e.id !== ws).map((e) => e.type + ':parent=' + e.parent + ':' + e.x + ',' + e.y).join(' | '), ws);
  for (const type of ['ftri', 'rect', 'fcirc']) {
    const t = p.locator('.tile[data-type="' + type + '"]').first(); await t.scrollIntoViewIfNeeded(); const tb = await t.boundingBox();
    await p.mouse.move(tb.x + 30, tb.y + 20); await p.mouse.down(); await p.mouse.move(wb.x + wb.width / 2, wb.y + wb.height / 2, { steps: 15 }); await p.mouse.up(); await p.waitForTimeout(250);
    console.log('拖入 ' + type + ' →', await state());
  }
  // 点击瓦片（不拖）添加
  await p.locator('.tile[data-type="fquad"]').first().click(); await p.waitForTimeout(200);
  console.log('点击 fquad →', await state());
  const dom = await p.evaluate((ws) => { const svg = document.querySelector('svg.wsbody[data-wsid="' + ws + '"]'); return svg ? svg.querySelectorAll('[data-wskey],path,circle').length : -1; }, ws);
  console.log('工作区画布元素数', dom);
  await p.screenshot({ path: (process.argv[2] || path.join(require('os').tmpdir(), 'probe.png')) });
  console.log('errors', JSON.stringify(errs));
  await b.close();
})().catch((e) => { console.error('SCRIPT', e.message); process.exit(1); });
