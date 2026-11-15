/* node tests/ui-numline.js —— 数轴操作台：真实鼠标测试。
 *  1. 3 + 4：拖起点到 3，拖“跳”字往右 4 格，落在 7；算式跟着变；撤销一次回到没跳；
 *  2. 4 个 3：点两下 ＋ 把步长改成 3，拖到 12，跳了 4 步（落点只停在跳得到的地方）；
 *  3. 2 − 5：往左拖 5 步，走过 0，落在 −3；
 *  4. 5/4：拖点到 1 右边一小格，显示三种写法；
 *  5. −2 < x ≤ 3：拖两个端点，点按钮把左端改成不含，数出 5 个整数；
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
  const props = () => p.evaluate(() => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'numlinebench'); return Object.assign({}, e.props); });
  const out = (port) => p.evaluate((port) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'numlinebench'), v = UI.S.D[e.id].out[port]; return v ? U.Q.show(v.data) : null; }, port);
  const grip = (id) => p.evaluate((id) => { const g = document.querySelector('.card svg.bdy [data-grip="' + id + '"]'); if (!g) return null; const r = g.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, id);
  // 数轴上一个单位占多少屏幕像素
  const unit = () => p.evaluate(() => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'numlinebench'), m = U.NumLineBench.model(e.props), sv = document.querySelector('.card svg.bdy'), r = sv.getBoundingClientRect(); return m.u * r.width / +sv.getAttribute('width'); });
  const closeDlg = () => p.evaluate(() => { if (UI.Panels.closeDialog) UI.Panels.closeDialog(); });
  const dragBy = async (id, units) => { await closeDlg(); const g = await grip(id), u = await unit(); await p.mouse.move(g.x, g.y); await p.mouse.down(); await p.mouse.move(g.x + units * u / 2, g.y, { steps: 5 }); await p.mouse.move(g.x + units * u, g.y, { steps: 5 }); await p.mouse.up(); await p.waitForTimeout(250); };
  const pick = async (k, nth) => { await closeDlg(); await p.locator('.card svg.bdy [data-pick-k="' + k + '"]').nth(nth).click(); await p.waitForTimeout(160); };
  const done = (id) => p.evaluate((id) => !!(UI.S.run && UI.S.run.ms[id] && UI.S.run.ms[id].done), id);
  const text = () => p.evaluate(() => document.querySelector('.card svg.bdy').textContent);

  console.log('1. 3 + 4');
  await open('nl-3-plus-4');
  ok(await p.locator('.card svg.bdy [data-grip]').count() === 2, '有两个把手：起点、落点');
  await dragBy('a', 3);
  ok((await props()).a === 3 && await done('start'), '把起点拖到 3');
  await dragBy('end', 4);
  ok((await props()).n === 4 && await out('value') === '7', '拖“跳”字往右 4 格：跳 4 步，落在 7');
  ok((await text()).includes('3 + 4 = 7') && await done('land'), '算式跟着变：3 + 4 = 7，里程碑完成');
  await p.keyboard.press('Control+z'); await p.waitForTimeout(200);
  ok((await props()).n === 0 && (await props()).a === 3, '撤销一次：回到没跳，起点还在 3（一次拖动一步）');

  console.log('2. 4 个 3');
  await open('nl-4x3');
  await pick('s', 1); await pick('s', 1);
  ok((await props()).s === 3, '点两下 ＋：每一步跳 3');
  await dragBy('end', 11.4);
  ok((await props()).n === 4 && await out('value') === '12', '拖到 11 多一点：落点停在跳得到的 12（4 步）');
  ok((await text()).includes('0 + 3 × 4 = 12'), '算式：0 + 3 × 4 = 12');

  console.log('3. 2 − 5');
  await open('nl-2-minus-5');
  await dragBy('end', -5);
  ok((await props()).n === 5 && await out('value') === '-3', '往左拖 5 格：走过 0，落在 −3');
  ok((await text()).includes('2 − 5 = −3') && await done('land'), '算式：2 − 5 = −3，里程碑完成');

  console.log('4. 5/4');
  await open('nl-five-quarters');
  await dragBy('p', 1);
  ok(await out('value') === '5/4', '把点往右拖一格（4 小格）：5/4');
  ok((await text()).includes('1 又 1/4') && (await text()).includes('1.25'), '三种写法：5/4 = 1 又 1/4 = 1.25');

  console.log('5. −2 < x ≤ 3');
  await open('nl-ineq');
  await dragBy('lo', -2); await dragBy('hi', 2);
  ok((await props()).lo === -2 && (await props()).hi === 3, '拖两个端点：−2 到 3');
  ok(await out('ints') === '6', '两端都含时有 6 个整数');
  await pick('lc', 0);
  ok((await props()).lc === 0 && await out('ints') === '5', '点左端的按钮改成“不含”：5 个整数');
  ok((await text()).includes('−2 < x ≤ 3') && await done('ints'), '写成 −2 < x ≤ 3，里程碑完成');
  ok(await p.evaluate(() => !UI.S.inspOpen), '全程没有打开属性面板');
  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n数轴操作台测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close(); process.exit(fail ? 1 : 0);
})();
