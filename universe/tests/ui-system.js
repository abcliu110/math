/* node tests/ui-system.js —— 两架天平（方程组）：真实鼠标测试。
 *  1. x + y = 7、2x + y = 10：把上面的天平拖到下面，下面变成 x = 3（消元）；撤销一次回到拖之前；
 *  2. 再把下面（x = 3）拖到上面：圆盒换成 3 个砝码（代入）；点“两边拿走一样的东西”，y = 4；两个里程碑完成；
 *  3. 鸡兔同笼：直接把下面拖到上面拿不出来，被拦住并说明原因；先翻倍，再拖，再平分，得 y = 5；
 *  4. 代入一个式子：x = y + 2 拖到 x + y = 8 上，变成 2y + 2 = 8；
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
  ok(await p.locator('.card svg.bdy [data-grip]').count() === 2, '两架天平各有一个把手');
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
  ok(await p.evaluate(() => !UI.S.inspOpen), '全程没有打开属性面板');
  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n两架天平测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close(); process.exit(fail ? 1 : 0);
})();
