/* node tests/ui-chips.js —— 正负数（零对）台面：真实鼠标测试。
 *  1. (−2) + 5：放进以后有 2 对零对，读数说“消掉再读”，没有结果；消掉两对：3；
 *  2. 3 − 5：直接拿被拦住并说明“先放进 2 对零对”；放 2 对再拿：−2；
 *  3. (−3) × (−4)：空台面拿不了；放 4 对、拿一组，重复 3 次：12；
 *  4. −(−4)：全部翻过来：4；−12 ÷ 4：每份发一个，发 3 次：−3；
 *  5. 全程没有打开属性面板。 */
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
  const out = (port) => p.evaluate((port) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'chipbench'), v = UI.S.D[e.id].out[port]; return v ? U.Q.show(v.data) : null; }, port);
  const press = async (label) => { await closeDlg(); await p.locator('.card svg.bdy g[data-pick-set]').filter({ hasText: label }).first().click(); await p.waitForTimeout(130); };
  const read = () => p.evaluate(() => { const g = document.querySelector('.card svg.bdy [data-read]'); return g ? g.textContent : ''; });
  const res = () => p.evaluate(() => { const g = document.querySelector('.card svg.bdy [data-res]'); return g ? g.textContent : ''; });
  const text = () => p.evaluate(() => Array.from(document.querySelectorAll('.card svg.bdy text')).map((t) => t.textContent).join('|'));
  const done = (id) => p.evaluate((id) => !!(UI.S.run && UI.S.run.ms[id] && UI.S.run.ms[id].done), id);

  console.log('1. 加法：零对抵消');
  await open('zp-neg2-plus5');
  await press('放进 5 个 +1');
  ok((await read()).includes('还有 2 对零对') && await out('result') === null, '放进来：有 2 对零对，先消掉才有结果');
  await press('消掉一对'); await press('消掉一对');
  ok(await out('result') === '3' && (await res()).includes('(−2) + 5 = 3') && await done('res'), '消掉两对：3');

  console.log('2. 减法：不够拿先放零对');
  await open('zp-3-minus-5');
  await press('拿走 5 个 +1');
  ok((await text()).includes('不够拿 5 个：先放进 2 对零对'), '直接拿：被拦住，说先放进 2 对零对');
  await press('放进一对 +1 −1'); await press('放进一对 +1 −1');
  ok(await out('value') === '3', '放了 2 对零对：台面上还是 3');
  await press('拿走 5 个 +1');
  ok(await out('result') === '-2' && await done('res'), '再拿：−2');

  console.log('3. 乘法：负负得正');
  await open('g6-neg-times-core');
  await press('拿走一组');
  ok((await text()).includes('不够拿 4 个：先放零对'), '空台面拿不了：说先放零对');
  for (let i = 0; i < 3; i++) { await press('放进 4 对零对'); await press('拿走一组'); }
  ok(await out('result') === '12' && (await res()).includes('(−3) × (−4) = 12') && await done('res'), '放 4 对、拿一组，3 次：12');

  console.log('4. 相反数、除法');
  await open('g7-rational-opposite-trap');
  await press('全部翻过来');
  ok(await out('result') === '4' && await done('res'), '−(−4)：翻过来是 4');
  await open('g7-rational-divsign-core');
  for (let i = 0; i < 3; i++) await press('每份发一个');
  ok(await out('each') === '-3' && (await res()).includes('(−12) ÷ 4 = −3') && await done('each'), '−12 平均分 4 份：每份 −3');
  ok(await p.evaluate(() => !UI.S.inspOpen), '全程没有打开属性面板');
  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n正负数（零对）测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close(); process.exit(fail ? 1 : 0);
})();
