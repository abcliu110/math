/* node tests/ui-coord.js —— 坐标与函数操作台：真实鼠标测试。
 *  1. y = 2x + 1：拖截距往上 1 格、拖 k 往上，式子和取值表跟着变；撤销一次回到上一步；
 *  2. 斜率 1/2：点分母的 ＋，k 的把手挪到 x = 2，斜率变成 1/2；
 *  3. 零点：拖探针到 x = 2，y = 0；
 *  4. 两点：把 A 拖到 (1, 2)、B 拖到 (3, 6)，斜率 2、截距 0；
 *  5. 抛物线：拖顶点到 (2, −1)；把顶点拖到 x 轴上方，没有交点；把 a 拖到顶点下面，开口朝下；
 *  6. 全程没有打开属性面板。
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
  const open = async (id) => {
    await p.waitForTimeout(700); await p.evaluate(() => { if (UI.Panels.closeDialog) UI.Panels.closeDialog(); });   // 上一题做完会弹出结束的对话框：先等它出来再关掉
    await p.evaluate((id) => { UI.App.openProblem(id, 'practice'); }, id); await p.waitForTimeout(300);
    await p.evaluate(() => {
      document.querySelectorAll('button').forEach((x) => { if (/^(知道了|跳过|先不猜|开始)$/.test(x.textContent.trim())) x.click(); });
      for (const k of Object.keys(UI.S.help || {})) UI.S.help[k] = false;
      if (UI.S.run) UI.S.run.armed = true;
      UI.Stage.render();
    });
    await p.waitForTimeout(200);
  };
  const props = () => p.evaluate(() => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'coordbench'); return Object.assign({}, e.props); });
  const out = (port) => p.evaluate((port) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'coordbench'), v = UI.S.D[e.id].out[port]; return v ? U.Q.show(v.data) : null; }, port);
  const grip = (id) => p.evaluate((id) => { const g = document.querySelector('.card svg.bdy [data-grip="' + id + '"]'); if (!g) return null; const r = g.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, id);
  const cell = () => p.evaluate(() => { const sv = document.querySelector('.card svg.bdy'), r = sv.getBoundingClientRect(); return 24 * r.width / +sv.getAttribute('width'); });
  const closeDlg = () => p.evaluate(() => { if (UI.Panels.closeDialog) UI.Panels.closeDialog(); });
  // 把一个把手拖 (dx, dy) 格：dy 向上为正
  const dragBy = async (id, dx, dy) => { await closeDlg(); const g = await grip(id), c = await cell(), tx = g.x + dx * c, ty = g.y - dy * c; await p.mouse.move(g.x, g.y); await p.mouse.down(); await p.mouse.move((g.x + tx) / 2, (g.y + ty) / 2, { steps: 5 }); await p.mouse.move(tx, ty, { steps: 5 }); await p.mouse.up(); await p.waitForTimeout(250); };
  const pick = async (k, nth) => { await closeDlg(); await p.locator('.card svg.bdy [data-pick-k="' + k + '"]').nth(nth).click(); await p.waitForTimeout(160); };
  const done = (id) => p.evaluate((id) => !!(UI.S.run && UI.S.run.ms[id] && UI.S.run.ms[id].done), id);
  const text = () => p.evaluate(() => document.querySelector('.card svg.bdy').textContent);

  console.log('1. y = 2x + 1');
  await open('cb-2x-plus-1');
  ok(await p.locator('.card svg.bdy [data-grip]').count() === 3, '三个把手：截距、斜率、探针');
  await dragBy('b', 0, 1);
  ok(await out('b') === '1' && await out('k') === '1', '截距往上拖 1 格：b = 1，斜率没变（整条线平移）');
  await dragBy('k', 0, 1);
  ok(await out('k') === '2' && (await text()).includes('y = 2x + 1'), 'k 往上拖 1 格：斜率 2，式子是 y = 2x + 1');
  ok((await text()).replace(/\s/g, '').includes('−2−3−1−1011325') && await done('k') && await done('b'), '取值表跟着变（x = −2…2 对着 −3、−1、1、3、5），里程碑完成');
  await p.keyboard.press('Control+z'); await p.waitForTimeout(200);
  ok(await out('k') === '1' && await out('b') === '1', '撤销一次：斜率回到 1，截距还是 1（一次拖动一步）');

  console.log('2. 斜率 1/2');
  await open('cb-half');
  const k0 = await grip('k');
  await pick('kd', 1);
  const k1 = await grip('k');
  ok((await props()).kd === 2 && k1.x > k0.x + 5, '点分母的 ＋：分母 2，k 的把手挪到了 x = 2 的地方');
  ok(await out('k') === '1/2' && await done('k'), '斜率是 1/2，里程碑完成');

  console.log('3. 零点');
  await open('cb-zero');
  await dragBy('x', 3, 0);
  ok((await props()).x === 2 && await out('y') === '0' && await done('y0'), '探针从 −1 拖到 2：y = 0');

  console.log('4. 两点');
  await open('cb-two-points');
  await dragBy('A', 3, 3); await dragBy('B', 1, 5);
  ok((await props()).ax === 1 && (await props()).ay === 2 && (await props()).bx === 3 && (await props()).by === 6, 'A 拖到 (1, 2)，B 拖到 (3, 6)（斜着拖，两个坐标一起变）');
  ok(await out('k') === '2' && await out('b') === '0', '斜率 2，截距 0');
  ok((await text()).includes('y = 2x') && (await text()).includes('4 ÷ 2 = 2'), '写出 y = 2x 和“4 ÷ 2 = 2”');

  console.log('5. 抛物线');
  await open('cb-vertex');
  await dragBy('v', 2, -1);
  ok(await out('h') === '2' && await out('v') === '-1' && (await text()).includes('y = (x − 2)² − 1'), '顶点拖到 (2, −1)：y = (x − 2)² − 1');
  ok(await out('roots') === '2', '顶点在 x 轴下方、开口向上：2 个交点');
  await dragBy('v', 0, 3);
  ok(await out('roots') === '0', '顶点拖到 x 轴上方：没有交点');
  await dragBy('a', 0, -2);
  ok(await out('a') === '-1' && (await text()).includes('开口向下'), '把 a 拖到顶点下面 1 格：a = −1，开口向下');
  console.log('6. 两条直线');
  await open('cb-two-lines');
  ok(await p.locator('.card svg.bdy [data-grip]').count() === 4, '两条线各有截距、斜率两个把手');
  await dragBy('b2', 0, 5);
  ok((await props()).b2 === 5, '橙线的截距拖到 5');
  await dragBy('k2', 0, 2);
  ok((await props()).k2 === -1 && await out('ix') === '2' && await out('iy') === '3', '橙线的斜率拖成 −1：交点 (2, 3)');
  ok((await text()).includes('交点 (2, 3)') && (await text()).includes('方程组的解') && await done('x') && await done('y'), '写出交点和“这就是方程组的解”，里程碑完成');
  await open('cb-parallel');
  await dragBy('k2', 0, -2);
  ok((await props()).k2 === 1 && await out('meet') === '0' && (await text()).includes('平行') && await done('none'), '把橙线的斜率拖成和蓝线一样：平行，没有交点');
  ok(await p.evaluate(() => !UI.S.inspOpen), '全程没有打开属性面板');
  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n坐标与函数测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close(); process.exit(fail ? 1 : 0);
})();
