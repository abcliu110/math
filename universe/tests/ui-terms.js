/* node tests/ui-terms.js —— 代数式操作台：真实鼠标测试。
 *  1. 化简 3x + 2 + 2x + 5：把 2x 拖到 3x 上合成 5x，把 5 拖到 2 上合成 7；下面的代入检验一直相等；撤销一次回到上一步；
 *  2. 不是同类项合不了：把 2 拖到 3x 上，式子不变，说明原因，记一次；
 *  3. 6 + 2 × 5：先点加号被拦住并说明“先算乘除”；点乘号算出 6 + 10，再点加号得 16；
 *  4. (6 + 2) × 5：括号外的乘号被拦住；先点括号里的加号，再点乘号得 40；
 *  5. 30 − 10 − 5：先点后面的减号被拦住；从左往右得 15；
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
  const props = () => p.evaluate(() => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'termsbench'); return Object.assign({}, e.props); });
  const out = (port) => p.evaluate((port) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'termsbench'), v = UI.S.D[e.id].out[port]; return v ? U.Q.show(v.data) : null; }, port);
  const grip = (id) => p.evaluate((id) => { const g = document.querySelector('.card svg.bdy [data-grip="' + id + '"]'); if (!g) return null; const r = g.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, id);
  const closeDlg = () => p.evaluate(() => { if (UI.Panels.closeDialog) UI.Panels.closeDialog(); });
  const dragOnto = async (a, c) => { await closeDlg(); const g = await grip(a), t = await grip(c); await p.mouse.move(g.x, g.y); await p.mouse.down(); await p.mouse.move((g.x + t.x) / 2, (g.y + t.y) / 2 - 10, { steps: 5 }); await p.mouse.move(t.x, t.y, { steps: 5 }); await p.mouse.up(); await p.waitForTimeout(220); };
  // 点第 n 个运算符（从 0 数）
  const clickOp = async (n) => { await closeDlg(); await p.locator('.card svg.bdy [data-pick-set]').nth(n).click(); await p.waitForTimeout(180); };
  const done = (id) => p.evaluate((id) => !!(UI.S.run && UI.S.run.ms[id] && UI.S.run.ms[id].done), id);
  const text = () => p.evaluate(() => document.querySelector('.card svg.bdy').textContent);

  console.log('1. 化简 3x + 2 + 2x + 5');
  await open('tb-mixed');
  ok(await p.locator('.card svg.bdy [data-grip]').count() === 4, '四项，每项都能拖');
  await dragOnto('t2', 't0');
  ok((await props()).terms === '5x,2,5' && await done('x'), '把 2x 拖到 3x 上：5x + 2 + 5');
  await dragOnto('t2', 't1');
  ok((await props()).terms === '5x,7' && await out('simplified') === '1' && await done('done'), '把 5 拖到 2 上：5x + 7，最简');
  ok((await text()).includes('原式 = 17，现在 = 17'), '代入 x = 2 检验：原式和现在都是 17');
  await p.keyboard.press('Control+z'); await p.waitForTimeout(200);
  ok((await props()).terms === '5x,2,5', '撤销一次：回到 5x + 2 + 5（一次拖动一步）');

  console.log('2. 不是同类项合不了');
  await open('tb-refuse');
  await dragOnto('t1', 't0');
  ok((await props()).terms === '3x,2' && await out('refused') === '1', '把 2 拖到 3x 上：式子不变，记一次');
  ok((await text()).includes('不是同类项') && await done('try'), '说明“不是同类项，不能合并”，里程碑完成');

  console.log('3. 6 + 2 × 5');
  await open('tb-order-mul');
  await clickOp(0);
  ok((await props()).toks === '6,+,2,*,5' && (await props()).wrong === 1 && (await text()).includes('先算乘除'), '先点加号：被拦住，说明“先算乘除，再算加减”');
  await clickOp(1);
  ok((await props()).toks === '6,+,10' && (await text()).includes('6 + 2 × 5'), '点乘号：变成 6 + 10，上面留着原来的算式');
  await clickOp(0);
  ok(await out('value') === '16' && await done('v'), '再点加号：16，里程碑完成');

  console.log('4. (6 + 2) × 5');
  await open('tb-order-paren');
  await clickOp(1);
  ok((await props()).wrong === 1 && (await text()).includes('先算括号里的'), '先点括号外的乘号：被拦住，说明“先算括号里的”');
  await clickOp(0);
  ok((await props()).toks === '8,*,5', '点括号里的加号：变成 8 × 5，括号去掉了');
  await clickOp(0);
  ok(await out('value') === '40' && await done('v'), '再点乘号：40');

  console.log('5. 30 − 10 − 5');
  await open('tb-order-sub');
  await clickOp(1);
  ok((await props()).wrong === 1 && (await text()).includes('从左往右算'), '先点后面的减号：被拦住，说明“从左往右算”');
  await clickOp(0); await clickOp(0);
  ok(await out('value') === '15' && await done('v'), '从左往右：15');
  ok(await p.evaluate(() => !UI.S.inspOpen), '全程没有打开属性面板');
  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n代数式操作台测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close(); process.exit(fail ? 1 : 0);
})();
