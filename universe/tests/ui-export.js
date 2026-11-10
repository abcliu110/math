/* node tests/ui-export.js —— 导出图片（2.12、第 3 节 V10）。用真实鼠标点菜单里的「导出图片（PNG）」：
 *   (a) 台面：放一个数字卡片和一个运算卡片、连一根线，点“菜单 → 导出图片”，触发一次下载，文件名以 .png 结尾，
 *       文件大小大于 0，文件头是 PNG；
 *   (b) 专注中的工作区：放一个工作区，里面有两个点和一条线，专注后再导出，同样断言一次下载、.png、大小 > 0、PNG 头；
 *   (c) 导出不改台面（卡片数、撤销栈长度不变），没有控制台错误。
 * 需要 playwright（NODE_PATH 指向它的 node_modules）。 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const G = require('./gestures');
const url = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const PNG_HEAD = [0x89, 0x50, 0x4e, 0x47];

// 用真实鼠标点“菜单 → 导出图片（PNG）”，等一次下载，返回下载的信息
async function exportByMouse(p) {
  await p.click('#menubtn');
  await p.locator('#menu button', { hasText: '导出图片' }).waitFor({ state: 'visible' });
  const [dl] = await Promise.all([
    p.waitForEvent('download', { timeout: 15000 }),
    p.locator('#menu button', { hasText: '导出图片' }).click(),
  ]);
  await p.waitForTimeout(200);
  const file = await dl.path();
  const buf = fs.readFileSync(file);
  return { name: dl.suggestedFilename(), size: buf.length, head: [...buf.slice(0, 4)] };
}

(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  G.attachErrorCollector(p);
  let downloads = 0;
  p.on('download', () => { downloads++; });
  await p.goto(url); await p.waitForTimeout(300);

  try {
    // ---- (a) 台面 ----
    console.log('(a) 台面：一个数字卡片、一个运算卡片，连一根线');
    await p.evaluate(() => {
      UI.App.openFree(); UI.App.act({ t: 'clear' });
      const n = UI.App.act({ t: 'add', type: 'num', x: 100, y: 100, props: { n: 2 } }).id;
      const o = UI.App.act({ t: 'add', type: 'op', x: 400, y: 100 }).id;
      UI.App.act({ t: 'link', from: n, fromPort: 'v', to: o, toPort: 'a' });
      UI.Stage.render();
    });
    await p.waitForTimeout(250);
    const cardsBefore = await p.evaluate(() => document.querySelectorAll('#world .card[data-id]').length);
    const undoBefore = await p.evaluate(() => UI.S.undo.length);
    downloads = 0;
    const a = await exportByMouse(p);
    ok(downloads === 1, '(a) 点一次“导出图片”，触发了一次下载（实际 ' + downloads + ' 次）');
    ok(/\.png$/.test(a.name), '(a) 文件名以 .png 结尾：' + a.name);
    ok(a.size > 0, '(a) 文件大小大于 0：' + a.size + ' 字节');
    ok(a.head.every((v, i) => v === PNG_HEAD[i]), '(a) 文件头是 PNG');
    const cardsAfter = await p.evaluate(() => document.querySelectorAll('#world .card[data-id]').length);
    const undoAfter = await p.evaluate(() => UI.S.undo.length);
    ok(cardsAfter === cardsBefore && undoAfter === undoBefore, '(c) 导出不改台面（卡片 ' + cardsBefore + '→' + cardsAfter + '，撤销栈 ' + undoBefore + '→' + undoAfter + '）');

    // ---- (b) 专注中的工作区 ----
    console.log('(b) 专注中的工作区：两个点和一条线');
    const wsId = await p.evaluate(() => {
      const A = UI.App;
      UI.App.act({ t: 'clear' });
      const ws = A.act({ t: 'add', type: 'gworkspace', x: 120, y: 60 }).id;
      const pt = (x, y, mark) => {
        const n = A.act({ t: 'add', type: 'gpt', x: 0, y: 0, props: { x, y, mark } }).id;
        A.act({ t: 'put', id: n, parent: ws, slot: 'items' });
        return n;
      };
      const q = pt(0, 0, 'A'), r = pt(5, 1, 'B');
      const s = A.act({ t: 'add', type: 'gseg', x: 0, y: 0 }).id;
      A.act({ t: 'link', from: q, fromPort: 'p', to: s, toPort: 'a' });
      A.act({ t: 'link', from: r, fromPort: 'p', to: s, toPort: 'b' });
      A.act({ t: 'put', id: s, parent: ws, slot: 'items' });
      UI.State.setFocusId(ws);
      UI.Stage.fit(); UI.Stage.render();
      return ws;
    });
    await p.waitForTimeout(300);
    const focusOk = await p.evaluate(() => !!document.querySelector('.wsf-main svg.wsbody'));
    ok(focusOk && !!wsId, '(b) 工作区已专注（专注层里有画布）');
    downloads = 0;
    const bres = await exportByMouse(p);
    ok(downloads === 1, '(b) 专注中点“导出图片”，触发了一次下载（实际 ' + downloads + ' 次）');
    ok(/\.png$/.test(bres.name), '(b) 文件名以 .png 结尾：' + bres.name);
    ok(bres.size > 0 && bres.head.every((v, i) => v === PNG_HEAD[i]), '(b) 文件大小大于 0，文件头是 PNG：' + bres.size + ' 字节');
  } catch (e) {
    fail++; console.log('  FAIL 测试中断：' + e.message);
  }

  ok(errs.length === 0, '没有控制台错误' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n导出图片测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close();
  process.exit(fail ? 1 : 0);
})();
