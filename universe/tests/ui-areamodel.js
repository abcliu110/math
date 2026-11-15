/* node tests/ui-areamodel.js —— 面积模型（样板操作台）和器材把手（grips）的真实鼠标测试。
 *  1. 打开「13 × 7」：从 ✂ 拖出一刀到 10，切成两块，两个里程碑都完成；全程没有打开属性面板；
 *  2. 一次拖动是一步：撤销一次回到没切；拖已有的刀可以挪，拖到边上就去掉；
 *  3. 拖右边的把手改长：面积跟着变，把手跟着鼠标（落点就是鼠标所在的格线）；
 *  4. 分数乘法：点 ＋ 改分母，拖把手改分子，得到 1/6；
 *  5. 代数式：拖两条边到 x+3、x+4，得到 x² + 7x + 12。
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
  // 打开一道题，关掉“先猜”“怎么玩”这些开场的浮层（这里测的是拖动，不是开场流程）
  const open = async (id) => {
    await p.evaluate((id) => { UI.App.openProblem(id, 'practice'); }, id); await p.waitForTimeout(300);
    await p.evaluate(() => {
      document.querySelectorAll('button').forEach((x) => { if (/^(知道了|跳过|先不猜|开始)$/.test(x.textContent.trim())) x.click(); });
      for (const k of Object.keys(UI.S.help || {})) UI.S.help[k] = false;
      if (UI.S.run) UI.S.run.armed = true;
      UI.Stage.render();
    });
    await p.waitForTimeout(200);
  };
  const props = () => p.evaluate(() => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'areamodel'); return Object.assign({}, e.props); });
  const out = (port) => p.evaluate((port) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'areamodel'), v = UI.S.D[e.id].out[port]; return v ? U.Q.show(v.data) : null; }, port);
  const grip = (id) => p.evaluate((id) => { const g = document.querySelector('.card svg.bdy [data-grip="' + id + '"]'); if (!g) return null; const r = g.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, id);
  // 画布上 n 个画布像素占多少屏幕像素（台面可能缩放过）
  const px = (n) => p.evaluate((n) => { const sv = document.querySelector('.card svg.bdy'), r = sv.getBoundingClientRect(); return n * r.width / +sv.getAttribute('width'); }, n);
  // 做完一道题会弹出“完成”的对话框，盖住台面：拖之前先关掉
  const dragTo = async (a, c) => { await p.evaluate(() => { if (UI.Panels.closeDialog) UI.Panels.closeDialog(); }); await p.mouse.move(a.x, a.y); await p.mouse.down(); await p.mouse.move((a.x + c.x) / 2, (a.y + c.y) / 2, { steps: 5 }); await p.mouse.move(c.x, c.y, { steps: 5 }); await p.mouse.up(); await p.waitForTimeout(250); };
  const done = (id) => p.evaluate((id) => !!(UI.S.run && UI.S.run.ms[id] && UI.S.run.ms[id].done), id);

  console.log('1. 13 × 7：拖出一刀');
  await open('am-13x7');
  ok(await p.locator('.card svg.bdy [data-grip]').count() >= 4, '卡片上有把手（长、宽、两把 ✂）');
  let c = await px(17), g = await grip('vnew');
  await dragTo(g, { x: g.x + 10 * c, y: g.y + 30 });
  ok((await props()).vcuts === '10', '从 ✂ 往右拖 10 格：切在 10（vcuts = ' + (await props()).vcuts + '）');
  ok(await out('parts') === '2' && await out('friendly') === '1', '切成 2 块，两块都好算');
  ok(await done('cut') && await done('tens'), '两个里程碑都完成了');
  ok(await p.evaluate(() => !UI.S.inspOpen), '全程没有打开属性面板');
  ok(await p.evaluate(() => document.querySelector('.card svg.bdy').textContent.includes('70 + 21 = 91')), '算式跟着变：… = 70 + 21 = 91');

  console.log('2. 一步、挪、去掉');
  await p.keyboard.press('Control+z'); await p.waitForTimeout(200);
  ok((await props()).vcuts === '', '撤销一次：回到没切');
  g = await grip('vnew'); await dragTo(g, { x: g.x + 6 * c, y: g.y + 20 });
  ok((await props()).vcuts === '6', '切在 6');
  g = await grip('v0'); await dragTo(g, { x: g.x + 4 * c, y: g.y });
  ok((await props()).vcuts === '10', '拖着已有的刀挪到 10');
  g = await grip('v0'); await dragTo(g, { x: g.x - 12 * c, y: g.y });
  ok((await props()).vcuts === '', '把刀拖到边上：去掉了');

  console.log('3. 拖边改长');
  g = await grip('w'); await dragTo(g, { x: g.x + 3 * c, y: g.y });
  ok((await props()).w === 16 && await out('area') === '112', '右边往右拖 3 格：长 16，面积 112');
  const g2 = await grip('w');
  ok(Math.abs(g2.x - (g.x + 3 * c)) < 3, '把手停在鼠标松开的格线上（差 ' + Math.abs(g2.x - (g.x + 3 * c)).toFixed(1) + ' 像素）');
  g = await grip('h'); await dragTo(g, { x: g.x, y: g.y - 2 * c });
  ok((await props()).h === 5 && await out('area') === '80', '下边往上拖 2 格：宽 5，面积 80');

  console.log('4. 分数乘法');
  await open('am-half-third');
  await p.locator('.card svg.bdy [data-pick-k="d2"]').nth(1).click(); await p.waitForTimeout(150);
  await p.locator('.card svg.bdy [data-pick-k="d2"]').nth(1).click(); await p.waitForTimeout(150);
  ok((await props()).d2 === 3 && await out('total') === '6', '点两下 ＋：横着切 3 份，一共 6 格');
  g = await grip('n2'); const unit = await px(204);
  await dragTo(g, { x: g.x, y: g.y + unit / 3 });
  ok((await props()).n2 === 1 && await out('area') === '1/6', '把手往下拖一格：取 1/3，重叠 1/6');
  ok(await done('six') && await done('one'), '两个里程碑都完成了');

  console.log('5. 代数式');
  await open('am-factor');
  c = await px(17);
  g = await grip('a'); await dragTo(g, { x: g.x + 2 * c, y: g.y });
  g = await grip('b'); await dragTo(g, { x: g.x, y: g.y + 3 * c });
  ok((await props()).a === 3 && (await props()).b === 4, '拖到 x + 3 和 x + 4');
  ok(await out('p1') === '7' && await out('p0') === '12', '展开是 x² + 7x + 12');
  ok(await done('c12') && await done('l7'), '两个里程碑都完成了');
  ok(await p.evaluate(() => !UI.S.inspOpen), '全程没有打开属性面板');
  console.log('6. 操作台的题不画输出口；器材架最上面有“操作台”一组');
  ok(await p.locator('.card .port.out').count() === 0, '操作台的题里：卡片右边没有一排输出口');
  await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); UI.App.act({ t: 'add', type: 'areamodel', x: 100, y: 80 }); UI.Stage.render(); UI.Panels.renderShelf(); }); await p.waitForTimeout(250);
  ok(await p.locator('.card .port.out').count() >= 5, '自由探究里：输出口照常画（那里要接线）');
  const grp = await p.evaluate(() => { const g = [...document.querySelectorAll('#shelfbody .grp')].find((x) => x.textContent.includes('操作台')); return g ? [...g.nextElementSibling.querySelectorAll('.tile')].map((t) => t.dataset.type) : []; });
  ok(grp.length >= 6 && grp.includes('areamodel') && grp.includes('balancebench') && grp.includes('numlinebench'), '器材架有“操作台”一组：' + grp.length + ' 个');
  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n面积模型测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close(); process.exit(fail ? 1 : 0);
})();
