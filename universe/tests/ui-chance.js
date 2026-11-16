/* node tests/ui-chance.js —— 可能性（做很多次）：真实鼠标测试。
 *  1. 抛硬币：点“做 10 次”，记下 10 次；再点“做 100 次”四次，做到 410 次，正面频率在 0.45 到 0.55 之间；撤销一次回到 310 次；
 *  2. 两个骰子：做 100 次时最多的不是 7（次数少会骗人）；做到 300 次最多的是 7；点“理论上”，条形图上画出理论值，读出 1/6；
 *  3. 点一根柱子：改成盯着它（折线换成它的频率）；
 *  4. 转盘：拖红色那一块的分界线，红色从 90° 变成 180°，次数清零；
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
  const props = () => p.evaluate(() => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'chancebench'); return Object.assign({}, e.props); });
  const out = (port) => p.evaluate((port) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'chancebench'), v = UI.S.D[e.id].out[port]; return v ? U.Q.num(v.data) : null; }, port);
  const btn = async (text) => { await closeDlg(); await p.locator('.card svg.bdy [data-pick-set]', { hasText: text }).first().click(); await p.waitForTimeout(160); };
  const done = (id) => p.evaluate((id) => !!(UI.S.run && UI.S.run.ms[id] && UI.S.run.ms[id].done), id);
  const text = () => p.evaluate(() => document.querySelector('.card svg.bdy').textContent);

  console.log('1. 抛硬币');
  await open('coin-fair');
  await btn('做 10 次');
  ok((await props()).n === 10 && await done('ten'), '点“做 10 次”：做了 10 次');
  const f10 = await out('freq');
  ok(Math.abs(f10 - 0.5) >= 0.2, '10 次时正面频率离 0.5 很远（' + f10 + '）');
  for (let i = 0; i < 4; i++) await btn('做 100 次');
  const f = await out('freq');
  ok((await props()).n === 410 && f >= 0.45 && f <= 0.55 && await done('near'), '做到 410 次：正面频率 ' + f.toFixed(3) + '，在 0.45 到 0.55 之间');
  ok(await p.locator('.card svg.bdy [data-freq]').count() === 1, '右边画出频率的折线');
  await p.keyboard.press('Control+z'); await p.waitForTimeout(200);
  ok((await props()).n === 310, '撤销一次：回到 310 次（一次点击一步）');

  console.log('2. 两个骰子');
  await open('two-dice');
  await btn('做 100 次');
  ok(await out('top') !== 5, '做 100 次时，最多的还不是 7（次数少会骗人）');
  await btn('做 100 次'); await btn('做 100 次');
  ok(await out('top') === 5 && await done('many') && (await text()).includes('出现得最多的是“7”'), '做到 300 次：最多的是 7');
  await btn('理论上');
  ok(Math.abs(await out('p') - 1 / 6) < 1e-9 && await done('why') && (await text()).includes('理论 1/6'), '点“理论上”：7 的理论概率 1/6');
  const m = await out('mean');
  ok(m > 6.8 && m < 7.2, '点数和的平均 ' + m.toFixed(2) + '，在 7 附近');

  console.log('3. 点一根柱子');
  await closeDlg(); await p.locator('.card svg.bdy g[data-pick-set]:has([data-cbar="0"])').click(); await p.waitForTimeout(200);
  ok((await props()).target === 0 && (await text()).includes('“2”的频率') && Math.abs(await out('p') - 1 / 36) < 1e-9, '点“2”那根柱子：改成盯着 2，理论概率 1/36');

  console.log('4. 转盘');
  await p.evaluate(() => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'chancebench'); UI.Intent.run('params', { ops: [{ id: e.id, k: 'mode', v: 3 }, { id: e.id, k: 'target', v: 0 }] }); });
  await p.waitForTimeout(200);
  {
    const g = await p.evaluate(() => { const r = document.querySelector('.card svg.bdy [data-grip="deg"]').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
    const c = await p.evaluate(() => { const sv = document.querySelector('.card svg.bdy'), r = sv.getBoundingClientRect(), k = r.width / +sv.getAttribute('width'); return { x: r.x + 600 * k, y: r.y + 74 * k, k }; });
    await closeDlg(); await p.mouse.move(g.x, g.y); await p.mouse.down(); await p.mouse.move(c.x + 30 * c.k, c.y + 30 * c.k, { steps: 5 }); await p.mouse.move(c.x, c.y + 46 * c.k, { steps: 5 }); await p.mouse.up(); await p.waitForTimeout(250);
  }
  ok((await props()).deg === 180 && (await props()).n === 0, '把分界线拖到最下面：红色 180°，次数清零');
  ok(await p.evaluate(() => !UI.S.inspOpen), '全程没有打开属性面板');
  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n可能性测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close(); process.exit(fail ? 1 : 0);
})();
