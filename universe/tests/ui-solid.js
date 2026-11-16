/* node tests/ui-solid.js —— 积木与三视图：真实鼠标测试。
 *  1. 点底板搭出“前排 1、2，后排 1、1”：立体图画出 5 块；撤销一次少一块；
 *  2. 视图先盖着（问号）；点“看一看”：从前面看是 1、2（不是 2、3）；
 *  3. 切到“拿走”再点：拿走一块；
 *  4. 从上面看：3 块的一叠也只算一个正方形；
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
  const props = () => p.evaluate(() => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'solidbench'); return Object.assign({}, e.props); });
  const out = (port) => p.evaluate((port) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'solidbench'), v = UI.S.D[e.id].out[port]; return v ? U.Q.show(v.data) : null; }, port);
  const cell = async (r, c, times) => { for (let i = 0; i < (times || 1); i++) { await closeDlg(); await p.locator('.card svg.bdy [data-cell="' + r + '-' + c + '"]').click(); await p.waitForTimeout(120); } };
  const btn = async (text, nth) => { await closeDlg(); await p.locator('.card svg.bdy [data-pick-set]', { hasText: text }).nth(nth || 0).click(); await p.waitForTimeout(180); };
  const done = (id) => p.evaluate((id) => !!(UI.S.run && UI.S.run.ms[id] && UI.S.run.ms[id].done), id);
  const text = () => p.evaluate(() => document.querySelector('.card svg.bdy').textContent);
  const cubes = () => p.evaluate(() => document.querySelectorAll('.card svg.bdy polygon').length / 3);

  console.log('1. 点底板搭积木');
  await open('vw-front-core');
  ok(await cubes() === 0 && (await text()).includes('一共 0 块'), '开场底板是空的');
  await cell(0, 0); await cell(0, 1, 2); await cell(1, 0); await cell(1, 1);
  ok((await props()).h === '1,2;1,1' && await out('total') === '5' && await cubes() === 5 && await done('stack'), '点五下：前排 1、2，后排 1、1，立体图 5 块，里程碑完成');
  await p.keyboard.press('Control+z'); await p.waitForTimeout(200);
  ok((await props()).h === '1,2;1,0', '撤销一次：少了最后放的那一块（一次点击一步）');
  await cell(1, 1);

  console.log('2. 先想，再看');
  ok(await p.locator('.card svg.bdy [data-view="sf"][data-hidden]').count() === 1 && await out('front') === null, '“从前面看”先盖着');
  await btn('看一看', 0);
  ok(await out('front') === '112' && await done('front') && (await text()).includes('从前面看：1、2（每列最高的）'), '点“看一看”：从前面看 1、2（每列最高的）');

  console.log('3. 拿走');
  await btn('拿走');
  ok((await props()).take === true, '切到“拿走”');
  await cell(0, 1);
  ok((await props()).h === '1,1;1,1' && await out('front') === '111', '再点前排右边：拿走一块，从前面看变成 1、1');

  console.log('4. 从上面看');
  await open('vw-top-trap');
  await cell(0, 1); await cell(1, 0, 3);
  ok(await out('total') === '4' && await done('stack'), '搭好：一共 4 块');
  await btn('看一看', 2);
  ok(await out('seen') === '2' && await done('top') && (await text()).includes('从上面看：2 个正方形，可是一共有 4 块'), '从上面看：只有 2 个正方形，可是有 4 块');
  ok(await p.evaluate(() => !UI.S.inspOpen), '全程没有打开属性面板');
  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n积木与三视图测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close(); process.exit(fail ? 1 : 0);
})();
