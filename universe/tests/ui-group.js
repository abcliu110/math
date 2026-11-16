/* node tests/ui-group.js —— 分一分（带余除法、抽屉原理）：真实鼠标测试。
 *  1. 17 个每 5 个一盒：把把手从 1 拖到 5，写出 17 ÷ 5 = 3 …… 2，3 个满的圈、1 个红色虚线圈；撤销一次回到每份 1 个；
 *  2. 91 试除：拖到 7，正好分完；
 *  3. 鸽笼：点“放一轮”三次，再点“放一个”：最挤的笼子 4 只，标红；点“倒出来”重新放；点 + 多一个笼子；
 *  4. 全程没有打开属性面板。
 * 需要 playwright（NODE_PATH 指向它的 node_modules）。 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const url = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(url); await p.waitForTimeout(400);
  const closeDlg = () => p.evaluate(() => { if (UI.Panels.closeDialog) UI.Panels.closeDialog(); });
  const open = async (id) => {
    await p.waitForTimeout(700); await closeDlg();
    await p.evaluate((id) => { UI.App.openProblem(id, 'practice'); }, id); await p.waitForTimeout(300);
    await p.evaluate(() => {
      document.querySelectorAll('button').forEach((x) => { if (/^(知道了|跳过|先不猜|开始)$/.test(x.textContent.trim())) x.click(); });
      for (const k of Object.keys(UI.S.help || {})) UI.S.help[k] = false;
      if (UI.S.run) UI.S.run.armed = true;
      UI.Stage.render();
    });
    await p.waitForTimeout(200);
  };
  const props = () => p.evaluate(() => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'groupbench'); return Object.assign({}, e.props); });
  const out = (port) => p.evaluate((port) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'groupbench'), v = UI.S.D[e.id].out[port]; return v ? U.Q.show(v.data) : null; }, port);
  const grip = () => p.evaluate(() => { const r = document.querySelector('.card svg.bdy [data-grip="g"]').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
  // 把手拖到“每份 g 个”（画布上 1 在 x = 40，20 在 x = 420）
  const dragTo = async (g) => { await closeDlg(); const a = await grip(), k = await p.evaluate(() => { const sv = document.querySelector('.card svg.bdy'); return sv.getBoundingClientRect().width / +sv.getAttribute('width'); }), cur = (await props()).g, x1 = a.x + (g - cur) * (380 / 19) * k; await p.mouse.move(a.x, a.y); await p.mouse.down(); await p.mouse.move((a.x + x1) / 2, a.y, { steps: 5 }); await p.mouse.move(x1, a.y, { steps: 5 }); await p.mouse.up(); await p.waitForTimeout(250); };
  const btn = async (text) => { await closeDlg(); await p.locator('.card svg.bdy [data-pick-set]', { hasText: text }).first().click(); await p.waitForTimeout(160); };
  const done = (id) => p.evaluate((id) => !!(UI.S.run && UI.S.run.ms[id] && UI.S.run.ms[id].done), id);
  const eqText = () => p.evaluate(() => document.querySelector('.card svg.bdy [data-eq]').textContent);

  console.log('1. 每份几个');
  await open('divmod-17-5');
  await dragTo(5);
  ok((await props()).g === 5 && await out('q') === '3' && await out('r') === '2' && await done('q3') && await done('r2'), '把手拖到 5：商 3、余数 2，两个里程碑完成');
  ok((await eqText()) === '17 ÷ 5 = 3 …… 2', '写出 17 ÷ 5 = 3 …… 2');
  ok(await p.locator('.card svg.bdy [data-group]').count() === 4 && await p.locator('.card svg.bdy [data-group][stroke-dasharray]').count() === 1, '3 个满的圈、1 个红色虚线圈（余数）');
  await p.keyboard.press('Control+z'); await p.waitForTimeout(200);
  ok((await props()).g === 1, '撤销一次：回到每份 1 个（一次拖动一步）');

  console.log('2. 试除');
  await open('prime-91');
  await dragTo(7);
  ok(await out('exact') === '1' && await out('q') === '13' && await done('factor'), '91 每组 7 个：正好 13 组，一个不剩');

  console.log('3. 鸽笼');
  await open('g6-pigeon-core');
  for (let i = 0; i < 3; i++) await btn('放一轮');
  ok((await props()).dealt === 9 && await out('max') === null, '放三轮：9 只，每个笼子 3 只，还没放完');
  await btn('放一个');
  ok(await out('max') === '4' && await done('ans') && await p.locator('.card svg.bdy [data-box][stroke="#c0392b"]').count() === 1, '再放一个：最挤的笼子 4 只，标红');
  ok((await eqText()).includes('10 ÷ 3 = 3 …… 1') && (await eqText()).includes('最多的盒子有 4 只'), '写出 10 ÷ 3 = 3 …… 1，最多的有 4 只');
  await btn('倒出来');
  ok((await props()).dealt === 0, '点“倒出来”：重新放');
  await btn('+');
  ok((await props()).k === 4 && await p.locator('.card svg.bdy [data-box]').count() === 4, '点 +：4 个笼子');
  ok(await p.evaluate(() => !UI.S.inspOpen), '全程没有打开属性面板');
  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n分一分测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close(); process.exit(fail ? 1 : 0);
})();
