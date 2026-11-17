/* node tests/ui-factor.js —— 因数与倍数：真实鼠标测试。
 *  1. 24：点每行 5 个，排不满，标红；点 1、2、3、4：找全 8 个因数，合数；
 *  2. 29：点 1 到 5：只有 1 × 29，质数；
 *  3. 12 和 18：试 1 到 6，最大公因数 6；换到公倍数页，点 12 被说明“下面跳不到”，点 36：最小公倍数 36；
 *  4. 全程没有打开属性面板。 */
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
  const out = (port) => p.evaluate((port) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'factorbench'), v = UI.S.D[e.id].out[port]; return v ? U.Q.show(v.data) : null; }, port);
  const byTitle = async (title) => { await closeDlg(); await p.locator('.card svg.bdy g[data-pick-set]').filter({ has: p.locator('title', { hasText: new RegExp('^' + title + '$') }) }).first().click(); await p.waitForTimeout(140); };
  const read = () => p.evaluate(() => { const g = document.querySelector('.card svg.bdy [data-read]'); return g ? g.textContent : ''; });
  const text = () => p.evaluate(() => Array.from(document.querySelectorAll('.card svg.bdy text')).map((t) => t.textContent).join('|'));
  const done = (id) => p.evaluate((id) => !!(UI.S.run && UI.S.run.ms[id] && UI.S.run.ms[id].done), id);

  console.log('1. 找因数');
  await open('fb-24');
  await byTitle('每行 5 个');
  ok((await text()).includes('排不满：最后一行只有 4 个') && (await text()).includes('5 不是 24 的因数') && await out('found') === '0', '每行 5 个：排不满，5 不是因数');
  for (const k of [1, 2, 3, 4]) await byTitle('每行 ' + k + ' 个');
  ok(await out('count') === '8' && await out('prime') === '0' && (await read()).includes('24 有 8 个因数') && (await read()).includes('合数') && await done('all'), '点 1、2、3、4：找全 8 个，合数');

  console.log('2. 质数');
  await open('fb-29');
  for (const k of [1, 2, 3, 4, 5]) await byTitle('每行 ' + k + ' 个');
  ok(await out('prime') === '1' && (await read()).includes('质数') && await done('prime'), '试到 5：只有 1 × 29，质数');

  console.log('3. 公因数、公倍数');
  await open('gcd-12-18');
  for (const k of [1, 2, 3, 4, 5, 6]) await byTitle('试 ' + k);
  ok(await out('gcd') === '6' && (await read()).includes('最大公因数是 6') && await done('g6'), '试 1 到 6：最大公因数 6');
  await byTitle('换到“公倍数”');
  await byTitle('点 12');
  ok((await text()).includes('12 不是 18 的倍数') && await out('lcm') === null, '点 12：说明下面跳不到');
  await byTitle('点 36');
  ok(await out('lcm') === '36' && (await read()).includes('最小公倍数是 36') && await done('l36'), '点 36：最小公倍数 36');
  ok(await p.evaluate(() => !UI.S.inspOpen), '全程没有打开属性面板');
  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n因数与倍数测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close(); process.exit(fail ? 1 : 0);
})();
