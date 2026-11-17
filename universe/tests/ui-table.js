/* node tests/ui-table.js —— 复式统计表：真实鼠标测试。
 *  1. 3、2、1、4：圈三格就点“我数完了”：交出 9，没圈的格子标红；撤销一次；
 *  2. 四格都圈上再交：10；
 *  3. 打开每行合计、每列合计：右下角总数 10，写出两种加法；
 *  4. 有 0 的表：0 也要圈，交出 6；
 *  5. 全程没有打开属性面板。
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
  const out = (port) => p.evaluate((port) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'tablebench'), v = UI.S.D[e.id].out[port]; return v ? U.Q.show(v.data) : null; }, port);
  const cell = async (k) => { await closeDlg(); await p.locator('.card svg.bdy [data-cell="' + k + '"]').click(); await p.waitForTimeout(150); };
  const btn = async (text) => { await closeDlg(); await p.locator('.card svg.bdy [data-pick-set]', { hasText: text }).first().click(); await p.waitForTimeout(180); };
  const done = (id) => p.evaluate((id) => !!(UI.S.run && UI.S.run.ms[id] && UI.S.run.ms[id].done), id);
  const text = () => p.evaluate(() => document.querySelector('.card svg.bdy').textContent);

  console.log('1. 漏了一格');
  await open('g3-twoway-total-core');
  await cell(0); await cell(1); await cell(3);
  ok(await out('sum') === '9', '圈了 3、2、4：加起来 9');
  await btn('我数完了');
  ok(await out('answer') === '9' && (await text()).includes('还有 1 格没圈') && await p.locator('.card svg.bdy [data-cell] rect[stroke="var(--bad)"]').count() === 1, '交出 9：没圈的那一格标红');
  await p.keyboard.press('Control+z'); await p.waitForTimeout(200);
  ok(await out('answer') === null, '撤销一次：还没交（一次点击一步）');

  console.log('2. 四格都圈');
  await cell(2); await btn('我数完了');
  ok(await out('answer') === '10' && await done('total') && (await text()).includes('每一格都算进去了'), '四格都圈再交：10');

  console.log('3. 两种合计');
  await btn('每行合计'); await btn('每列合计');
  ok(await out('total') === '10' && await p.locator('.card svg.bdy [data-grand]').count() === 1 && (await text()).includes('先按行加：5 + 5 = 10') && (await text()).includes('先按列加：4 + 6 = 10'), '打开两种合计：右下角 10，两种加法都是 10');

  console.log('4. 0 也是一格');
  await open('g3-twoway-zero-trap');
  for (const k of [0, 2, 4]) await cell(k);
  for (const k of [1, 3, 5]) await cell(k);
  await btn('我数完了');
  ok(await out('answer') === '6' && await done('total'), '六格都圈上（0 也圈）：交出 6');
  ok(await p.evaluate(() => !UI.S.inspOpen), '全程没有打开属性面板');
  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n复式统计表测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close(); process.exit(fail ? 1 : 0);
})();
