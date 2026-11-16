/* node tests/ui-system.js —— 两架天平（方程组）：真实鼠标测试。
 *  1. x + y = 7、2x + y = 10：把上面的天平拖到下面，下面变成 x = 3（消元）；撤销一次回到拖之前；
 *  2. 再把下面（x = 3）拖到上面：圆盒换成 3 个砝码（代入）；点“两边拿走一样的东西”，y = 4；两个里程碑完成；
 *  3. 鸡兔同笼：直接把下面拖到上面拿不出来，被拦住并说明原因；先翻倍，再拖，再平分，得 y = 5；
 *  4. 代入一个式子：x = y + 2 拖到 x + y = 8 上，变成 2y + 2 = 8；
 *  5. 拖的时候两边一起动：把一架拖到另一架上，没松手时画面上就画出两个盘各拿走什么；
 *     盘里的砝码拖出来，另一个盘的砝码跟着走；另一个盘里没有同样的东西就拿不了；从托盘往天平上拖，两个盘各加一个；
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
    await p.evaluate((id) => { UI.App.openProblem(id, 'practice'); }, id); await p.waitForTimeout(300);
    await p.evaluate(() => {
      document.querySelectorAll('button').forEach((x) => { if (/^(知道了|跳过|先不猜|开始)$/.test(x.textContent.trim())) x.click(); });
      for (const k of Object.keys(UI.S.help || {})) UI.S.help[k] = false;
      if (UI.S.run) UI.S.run.armed = true;
      UI.Stage.render();
    });
    await p.waitForTimeout(200);
  };
  const props = () => p.evaluate(() => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'systembench'); return Object.assign({}, e.props); });
  const out = (port) => p.evaluate((port) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'systembench'), v = UI.S.D[e.id].out[port]; return v ? U.Q.show(v.data) : null; }, port);
  const grip = (id) => p.evaluate((id) => { const g = document.querySelector('.card svg.bdy [data-grip="' + id + '"]'); if (!g) return null; const r = g.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, id);
  const closeDlg = () => p.evaluate(() => { if (UI.Panels.closeDialog) UI.Panels.closeDialog(); });
  // 把第 a 架天平拖到第 c 架上（拖到那一架的盘子附近）
  const dragOnto = async (a, c) => { await closeDlg(); const g = await grip('b' + a), t = await grip('b' + c); const ty = t.y + (g.y < t.y ? 30 : 30); await p.mouse.move(g.x, g.y); await p.mouse.down(); await p.mouse.move((g.x + t.x) / 2 + 20, (g.y + ty) / 2, { steps: 6 }); await p.mouse.move(t.x + 20, ty, { steps: 6 }); await p.mouse.up(); await p.waitForTimeout(250); };
  // 点第 i 架天平旁边的按钮（按文字找，i = 0 上面、1 下面）
  const btn = async (i, text) => { await closeDlg(); await p.locator('.card svg.bdy [data-pick-set]', { hasText: text }).nth(await p.evaluate(([i, text]) => { const all = [...document.querySelectorAll('.card svg.bdy g')].filter((g) => g.textContent.includes(text) && g.querySelector('rect') && g.children.length <= 3); const on = all.filter((g) => g.hasAttribute('data-pick-set')); const want = all[i]; return Math.max(0, on.indexOf(want)); }, [i, text])).click(); await p.waitForTimeout(200); };
  const done = (id) => p.evaluate((id) => !!(UI.S.run && UI.S.run.ms[id] && UI.S.run.ms[id].done), id);
  const text = () => p.evaluate(() => document.querySelector('.card svg.bdy').textContent);

  console.log('1. 消元');
  await open('sy-7-10');
  ok(await p.locator('.card svg.bdy [data-grip^="b"]').count() === 2, '两架天平各有一个把手');
  await dragOnto(0, 1);
  ok((await props()).e1 === '1,0,0,0,0,3' && await out('x') === '3', '把上面的拖到下面：下面变成 x = 3');
  ok(await done('x') && (await text()).includes('一个圆盒 = 3'), '里程碑完成，写着“一个圆盒 = 3”');
  await p.keyboard.press('Control+z'); await p.waitForTimeout(200);
  ok((await props()).e1 === '2,1,0,0,0,10', '撤销一次：下面回到 2x + y = 10（一次拖动一步）');
  await dragOnto(0, 1);

  console.log('2. 代入');
  await dragOnto(1, 0);
  ok((await props()).e0 === '0,1,3,0,0,7', '把下面（x = 3）拖到上面：圆盒换成 3 个砝码，y + 3 = 7');
  await btn(0, '两边拿走一样的东西');
  ok((await props()).e0 === '0,1,0,0,0,4' && await out('y') === '4', '点上面的“两边拿走一样的东西”：y = 4');
  ok(await done('y') && await out('both') === '1' && (await text()).includes('解出来了'), '两个都解出来，里程碑完成');

  console.log('3. 先翻倍再消元（鸡兔同笼）');
  await open('sy-chicken');
  await dragOnto(1, 0);
  ok((await props()).e0 === '1,1,0,0,0,8' && (await props()).refused === 1 && (await text()).includes('没有这么多东西可以拿走'), '把下面（腿）拖到上面（头）：拿不出来，被拦住并说明原因');
  await btn(0, '翻倍');
  ok((await props()).e0 === '2,2,0,0,0,16', '上面翻倍：2x + 2y = 16');
  await dragOnto(0, 1);
  ok((await props()).e1 === '0,2,0,0,0,10', '把上面的拖到下面：剩 2y = 10');
  await btn(1, '平分');
  ok((await props()).e1 === '0,1,0,0,0,5' && await out('y') === '5' && await done('y'), '下面平分成 2 份：y = 5');

  console.log('4. 代入一个式子');
  await open('sy-subst');
  await dragOnto(0, 1);
  ok((await props()).e1 === '0,2,2,0,0,8', '把 x = y + 2 拖到 x + y = 8 上：变成 2y + 2 = 8');

  console.log('5. 拖的时候两边一起动');
  await open('sy-7-10');
  {
    const g = await grip('b0'), t = await grip('b1');
    await closeDlg(); await p.mouse.move(g.x, g.y); await p.mouse.down(); await p.mouse.move((g.x + t.x) / 2 + 20, (g.y + t.y) / 2, { steps: 6 }); await p.mouse.move(t.x + 20, t.y + 30, { steps: 6 }); await p.waitForTimeout(120);
    ok(await p.locator('.card svg.bdy [data-rem]').count() === 2 && await p.locator('.card svg.bdy [data-carry]').count() === 1, '拖到下面那架上（还没松手）：两个盘上方各画出要拿走的东西，式子跟着鼠标');
    ok((await text()).includes('− (x + y)') && (await text()).includes('− 7') && (await text()).includes('两边拿走的一样重'), '盘下面写着左盘 − (x + y)、右盘 − 7，并说明“两边拿走的一样重”');
    await p.mouse.up(); await p.waitForTimeout(250);
    ok((await props()).e1 === '1,0,0,0,0,3', '松手：下面变成 x = 3');
  }
  await dragOnto(1, 0);
  ok((await props()).e0 === '0,1,3,0,0,7', '代入以后上面是 y + 3 = 7');
  {
    const g = await grip('i0Lc');
    await closeDlg(); await p.mouse.move(g.x, g.y); await p.mouse.down(); await p.mouse.move(g.x + 10, g.y - 40, { steps: 5 }); await p.mouse.move(g.x + 20, g.y - 75, { steps: 5 }); await p.waitForTimeout(120);
    ok(await p.locator('.card svg.bdy [data-twin]').count() === 1 && (await text()).includes('两边同时拿走 1 个砝码'), '把左盘的一个砝码拖出来（还没松手）：右盘的一个砝码跟着走，写着“两边同时拿走 1 个砝码”');
    await p.mouse.up(); await p.waitForTimeout(250);
    ok((await props()).e0 === '0,1,2,0,0,6', '松手：两个盘各少一个砝码，y + 2 = 6');
    await p.keyboard.press('Control+z'); await p.waitForTimeout(200);
    ok((await props()).e0 === '0,1,3,0,0,7', '撤销一次：两边一起回来（一次拖动一步）');
  }
  {
    const g = await grip('i0Ly'), r0 = (await props()).refused;
    await closeDlg(); await p.mouse.move(g.x, g.y); await p.mouse.down(); await p.mouse.move(g.x + 10, g.y - 40, { steps: 5 }); await p.mouse.move(g.x + 20, g.y - 75, { steps: 5 }); await p.mouse.up(); await p.waitForTimeout(250);
    ok((await props()).e0 === '0,1,3,0,0,7' && (await props()).refused === r0 + 1 && (await text()).includes('另一个盘里没有方盒'), '把左盘的方盒拖出来：右盘没有方盒，拿不了，并说明原因');
  }
  {
    const g = await grip('tc'), t = await grip('b0');
    await closeDlg(); await p.mouse.move(g.x, g.y); await p.mouse.down(); await p.mouse.move((g.x + t.x) / 2, (g.y + t.y) / 2, { steps: 6 }); await p.mouse.move(t.x + 20, t.y + 40, { steps: 6 }); await p.waitForTimeout(120);
    ok((await text()).includes('两边同时加上 1 个砝码'), '从托盘把一个砝码拖到上面那架（还没松手）：写着“两边同时加上 1 个砝码”');
    await p.mouse.up(); await p.waitForTimeout(250);
    ok((await props()).e0 === '0,1,4,0,0,8', '松手：两个盘各多一个砝码，y + 4 = 8');
  }
  ok(await p.evaluate(() => !UI.S.inspOpen), '全程没有打开属性面板');
  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n两架天平测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close(); process.exit(fail ? 1 : 0);
})();
