/* node tests/ui-stat.js —— 数据与统计图：真实鼠标测试。
 *  1. 中位数（6、2、9、4、4）：没排队时“中位数”按钮是灰的；点“从小到大排队”变成 2、4、4、6、9；点“中位数”，正中间一根变绿，读出 4；撤销一次回到没排队；
 *  2. 众数（5、5、2、5、3）：点“众数”，三根 5 变成橙色，写“众数 = 5（出现 3 次）”；
 *  3. 极差：点“最多 − 最少”，写出 60 − 38 = 22；
 *  4. 平均数和中位数谁动得多（3、4、4、5、40）：点开平均数和中位数，把 40 那根柱子往下拖到 4：平均数从 11.2 掉到 4，中位数还是 4；
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
  const props = () => p.evaluate(() => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'statbench'); return Object.assign({}, e.props); });
  const out = (port) => p.evaluate((port) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'statbench'), v = UI.S.D[e.id].out[port]; return v ? U.Q.show(v.data) : null; }, port);
  const btn = async (text) => { await closeDlg(); await p.locator('.card svg.bdy [data-pick-set]', { hasText: text }).first().click(); await p.waitForTimeout(200); };
  const enabled = (text) => p.evaluate((text) => [...document.querySelectorAll('.card svg.bdy g')].some((g) => g.hasAttribute('data-pick-set') && g.querySelector(':scope > text') && g.querySelector(':scope > text').textContent === text), text);
  const fill = (i) => p.evaluate((i) => document.querySelector('.card svg.bdy [data-bar="' + i + '"]').getAttribute('fill'), i);
  const done = (id) => p.evaluate((id) => !!(UI.S.run && UI.S.run.ms[id] && UI.S.run.ms[id].done), id);
  const text = () => p.evaluate(() => document.querySelector('.card svg.bdy').textContent);
  const grip = (id) => p.evaluate((id) => { const g = document.querySelector('.card svg.bdy [data-grip="' + id + '"]'); const r = g.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, id);
  const zoom = () => p.evaluate(() => { const sv = document.querySelector('.card svg.bdy'); return sv.getBoundingClientRect().width / +sv.getAttribute('width'); });

  console.log('1. 中位数要先排队');
  await open('g8-median-core');
  ok(!(await enabled('中位数')) && (await enabled('从小到大排队')), '没排队时“中位数”是灰的，“排队”可以点');
  await btn('从小到大排队');
  ok((await props()).vals === '2, 4, 4, 6, 9' && await out('sorted') === '1' && await done('sort'), '点“从小到大排队”：2、4、4、6、9');
  ok(await enabled('中位数'), '排好队以后“中位数”可以点了');
  await btn('中位数');
  ok(await out('median') === '4' && await fill(2) === '#9fd5ad' && await done('mid') && (await text()).includes('中位数 = 4（第 3 个）'), '点“中位数”：正中间一根变绿，中位数 = 4（第 3 个）');
  await p.keyboard.press('Control+z'); await p.waitForTimeout(150); await p.keyboard.press('Control+z'); await p.waitForTimeout(200);
  ok((await props()).vals === '6, 2, 9, 4, 4' && await out('median') === null, '撤销两次：回到没排队，中位数没有了');

  console.log('2. 众数');
  await open('g2-data-mode-core');
  await btn('众数');
  ok(await out('mode') === '5' && await out('modecount') === '3' && await done('mode'), '点“众数”：众数 5，出现 3 次');
  ok(await fill(0) === '#f5a25d' && await fill(1) === '#f5a25d' && await fill(3) === '#f5a25d' && await fill(2) === '#9fb7d9', '三根 5 是橙色，其余是蓝色');
  ok((await text()).includes('众数 = 5（出现 3 次）') && (await text()).includes('5：3 次'), '写着“众数 = 5（出现 3 次）”和每个数出现几次');

  console.log('3. 极差');
  await open('g4-bar-range-core');
  await btn('最多 − 最少');
  ok(await out('range') === '22' && await done('range') && (await text()).includes('60 − 38 = 22'), '点“最多 − 最少”：60 − 38 = 22');

  console.log('4. 拖一根柱子：平均数和中位数谁动');
  await open('mean-vs-median');
  await btn('平均数'); await btn('中位数');
  ok(await out('mean') === '56/5' && await out('median') === '4' && await done('mean') && await done('med'), '平均数 56/5（11.2），中位数 4');
  {
    const g = await grip('b4'), z = await zoom(), dy = (40 - 4) / 45 * (300 - 76) * z;
    await closeDlg(); await p.mouse.move(g.x, g.y); await p.mouse.down(); await p.mouse.move(g.x, g.y + dy / 2, { steps: 5 }); await p.mouse.move(g.x, g.y + dy, { steps: 5 }); await p.mouse.up(); await p.waitForTimeout(250);
  }
  ok((await props()).vals === '3, 4, 4, 5, 4' && await out('mean') === '4' && await done('fix'), '把 40 拖到 4：平均数掉到 4');
  ok(await out('median') === null && (await text()).includes('中位数：先排队'), '拖完顺序乱了：中位数要重新排队才看得到');
  await btn('从小到大排队');
  ok(await out('median') === '4', '再排一次队：中位数还是 4（几乎没动）');
  ok(await p.evaluate(() => !UI.S.inspOpen), '全程没有打开属性面板');
  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n数据与统计图测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close(); process.exit(fail ? 1 : 0);
})();
