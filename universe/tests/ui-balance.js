/* node tests/ui-balance.js —— 天平与方程：真实鼠标测试。
 *  1. x + 5 = 12：只从左盘拖走一个砝码，天平歪、式子变成 ≠；右盘也拖走一个，重新平衡；撤销两次回到开头；
 *  2. 用“两边各拿走 1 个砝码”按钮拿 5 次：x = 7，里程碑完成，步骤栏记下每一步；
 *  3. 3x + 2 = x + 8：两边各拖走一个盒子、按钮拿走砝码、平分，x = 3；
 *  4. 从托盘往盘里拖：加一个砝码；把一个砝码从左盘拖到右盘：挪过去；
 *  5. 两个盘连着（bb-linked）：拖走左盘一个砝码，拖到一半时画面上右盘的砝码跟着走、式子写成“x + 6 − 1 = 10 − 1”；松手两边各少一个，仍然平衡，是一步；
 *     另一个盘里没有同样的东西时只能拿这一边，会歪；点“两边一起动”可以关掉；
 *  6. 全程没有打开属性面板，标题栏没有“填写”入口。
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
  const props = () => p.evaluate(() => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'balancebench'); return Object.assign({}, e.props); });
  const out = (port) => p.evaluate((port) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'balancebench'), v = UI.S.D[e.id].out[port]; return v ? U.Q.show(v.data) : null; }, port);
  const grip = (id) => p.evaluate((id) => { const g = document.querySelector('.card svg.bdy [data-grip="' + id + '"]'); if (!g) return null; const r = g.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, id);
  const px = (n) => p.evaluate((n) => { const sv = document.querySelector('.card svg.bdy'), r = sv.getBoundingClientRect(); return n * r.width / +sv.getAttribute('width'); }, n);
  const dragTo = async (a, c) => { await p.evaluate(() => { if (UI.Panels.closeDialog) UI.Panels.closeDialog(); }); await p.mouse.move(a.x, a.y); await p.mouse.down(); await p.mouse.move((a.x + c.x) / 2, (a.y + c.y) / 2, { steps: 5 }); await p.mouse.move(c.x, c.y, { steps: 5 }); await p.mouse.up(); await p.waitForTimeout(250); };
  const btn = async (text) => { await p.evaluate(() => { if (UI.Panels.closeDialog) UI.Panels.closeDialog(); }); await p.locator('.card svg.bdy [data-pick-set]', { hasText: text }).first().click(); await p.waitForTimeout(180); };
  const done = (id) => p.evaluate((id) => !!(UI.S.run && UI.S.run.ms[id] && UI.S.run.ms[id].done), id);
  const text = () => p.evaluate(() => document.querySelector('.card svg.bdy').textContent);
  // “外面”：盘的正下方、托盘右边的空白处
  const outside = async (g) => ({ x: g.x + await px(60), y: g.y + await px(190) });

  console.log('1. 只动一边会歪');
  await open('bb-x-plus-5');
  ok(await p.locator('.card svg.bdy [data-grip]').count() >= 5, '卡片上有把手（两个盘里最上面的砝码和盒子、托盘里的两样）');
  ok(await p.locator('.card .gchip[data-card-insp]').count() === 0, '标题栏没有“填写”入口');
  let g = await grip('lw');
  await dragTo(g, await outside(g));
  ok((await props()).lc === 4 && await out('okn') === '0', '从左盘拖走一个砝码：左盘剩 4 个，天平歪了');
  ok((await text()).includes('≠') && (await text()).includes('天平歪了'), '式子变成 ≠，并说明原因');
  g = await grip('rw'); await dragTo(g, await outside(g));
  ok((await props()).rc === 11 && await out('okn') === '1', '右盘也拖走一个：重新平衡（x + 4 = 11）');
  await p.keyboard.press('Control+z'); await p.waitForTimeout(150); await p.keyboard.press('Control+z'); await p.waitForTimeout(200);
  ok((await props()).lc === 5 && (await props()).rc === 12, '撤销两次：回到 x + 5 = 12（一次拖动一步）');

  console.log('2. 两边一起做');
  for (let i = 0; i < 5; i++) await btn('两边各拿走 1 个砝码');
  ok((await props()).lc === 0 && (await props()).rc === 7, '点 5 次：左盘只剩盒子，右盘 7 个砝码');
  ok(await out('solved') === '7' && await done('solve'), 'x = 7，里程碑完成');
  ok(await out('moves') === '5' && (await text()).includes('x = 7'), '步骤栏记了 5 步，最后一步是 x = 7');

  console.log('3. 两边都有盒子');
  await open('bb-both-sides');
  g = await grip('rb'); await dragTo(g, await outside(g));
  ok(await out('okn') === '0', '只拿走右盘的盒子：歪了');
  g = await grip('lb'); await dragTo(g, await outside(g));
  ok((await props()).lx === 2 && (await props()).rx === 0 && await out('okn') === '1', '左盘也拿走一个盒子：2x + 2 = 8，平衡');
  await btn('两边各拿走 1 个砝码'); await btn('两边各拿走 1 个砝码');
  ok(await out('stage') === '1' && await done('apart'), '两边各拿走 2 个砝码：2x = 6，盒子和砝码分开了');
  await btn('两边都平分成 2 份');
  ok(await out('solved') === '3' && await done('solve'), '平分成 2 份：x = 3');

  console.log('4. 加一个、挪过去');
  await open('bb-make-4');
  const sw = await grip('sw'), rw = await grip('rw'), lb = await grip('lb');
  await dragTo(sw, { x: lb.x + await px(60), y: lb.y - await px(20) });
  ok((await props()).lc === 1 && (await props()).rc === 5 && await out('okn') === '1', '从托盘把一个砝码拖进左盘：两个盘连着，两边各多一个（x + 1 = 5），还是平的');
  g = await grip('lw'); await dragTo(g, { x: rw.x, y: rw.y - await px(30) });
  ok((await props()).lc === 0 && (await props()).rc === 6 && await out('okn') === '0', '把它从左盘拖到右盘：挪过去了（右盘 6 个），这不是两边做同样的事，歪了');

  console.log('5. 两个盘连着：拖的时候两边一起动');
  await open('bb-linked');
  ok((await text()).includes('两边一起动：开'), '卡片上写着“两边一起动：开”');
  g = await grip('lw'); let o = await outside(g);
  await p.mouse.move(g.x, g.y); await p.mouse.down(); await p.mouse.move((g.x + o.x) / 2, (g.y + o.y) / 2, { steps: 5 }); await p.mouse.move(o.x, o.y, { steps: 5 }); await p.waitForTimeout(120);
  ok(await p.locator('.card svg.bdy [data-twin]').count() === 1, '拖到一半（还没松手）：画面上另一个盘的砝码也被提起来了');
  ok((await text()).includes('x + 6 − 1 = 10 − 1') && (await text()).includes('两边同时拿走 1 个砝码'), '式子写成 x + 6 − 1 = 10 − 1，并写着“两边同时拿走 1 个砝码”');
  ok(await out('okn') === '1', '拖动中的天平是平的');
  await p.mouse.up(); await p.waitForTimeout(250);
  ok((await props()).lc === 5 && (await props()).rc === 9 && await out('okn') === '1', '松手：左盘 5 个、右盘 9 个，仍然平衡');
  ok((await text()).includes('两边−1'), '步骤栏在这一步后面写着“两边−1”');
  await p.keyboard.press('Control+z'); await p.waitForTimeout(200);
  ok((await props()).lc === 6 && (await props()).rc === 10, '撤销一次：两边一起回来（一次拖动一步）');
  for (let i = 0; i < 6; i++) { g = await grip('lw'); await dragTo(g, await outside(g)); }
  ok(await out('solved') === '4' && await done('solve'), '拖 6 次：x = 4，里程碑完成');
  g = await grip('lb'); await dragTo(g, await outside(g));
  ok((await props()).lx === 0 && (await props()).rx === 0 && await out('okn') === '0' , '右盘没有盒子可以一起拿走：只拿了左边的盒子，天平歪了');
  await p.keyboard.press('Control+z'); await p.waitForTimeout(200);
  await btn('两边一起动');
  ok((await props()).sync === false && (await text()).includes('两边一起动：关'), '点“两边一起动”：关掉了');
  g = await grip('rw'); await dragTo(g, await outside(g));
  ok((await props()).rc === 3 && (await props()).lx === 1 && await out('okn') === '0', '关掉以后拖走右盘一个砝码：只动一边，歪了');
  ok(await p.evaluate(() => !UI.S.inspOpen), '全程没有打开属性面板');
  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n天平与方程测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close(); process.exit(fail ? 1 : 0);
})();
