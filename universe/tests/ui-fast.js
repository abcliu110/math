/* node tests/ui-fast.js —— 速算原理（剪拼面积图）：真实鼠标测试。
 *  1. 拆补 99 × 37：把边拉到 100，出现红色的一条，写“多算了……37”；点红条拿掉，得 3663；撤销一次回到红条还在；
 *  2. 凑整 25 × 36：把手拖到每条 4，9 条都是 100，得 900；拖到每条 6 不好算，不写得数；
 *  3. 头同尾合十 23 × 27：把橙色那条拖到虚线框里，写出 20 × 30 = 600 和 3 × 7 = 21，得 621；拖回去又变回 4 块；
 *  4. 平方差 19 × 21：剪拼以后出现缺的角，得 399；
 *  5. 完全平方 35 × 35：切在 30，得 1225；切一刀 34 × 11：切在 10，得 374；
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
  const props = () => p.evaluate(() => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'fastbench'); return Object.assign({}, e.props); });
  const out = (port) => p.evaluate((port) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'fastbench'), v = UI.S.D[e.id].out[port]; return v ? U.Q.show(v.data) : null; }, port);
  const grip = (id) => p.evaluate((id) => { const g = document.querySelector('.card svg.bdy [data-grip="' + id + '"]'); if (!g) return null; const r = g.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, id);
  // 画布坐标在屏幕上的位置
  const at = (x, y) => p.evaluate(([x, y]) => { const sv = document.querySelector('.card svg.bdy'), r = sv.getBoundingClientRect(), k = r.width / +sv.getAttribute('width'); return { x: r.x + x * k, y: r.y + y * k }; }, [x, y]);
  const dragTo = async (id, to) => { await closeDlg(); const g = await grip(id); await p.mouse.move(g.x, g.y); await p.mouse.down(); await p.mouse.move((g.x + to.x) / 2, (g.y + to.y) / 2, { steps: 5 }); await p.mouse.move(to.x, to.y, { steps: 5 }); await p.mouse.up(); await p.waitForTimeout(250); };
  // 剪下来的那一块要放到哪（虚线框的中心）
  const zone = () => p.evaluate(() => { const z = document.querySelector('.card svg.bdy [data-zone]'), r = z.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
  const done = (id) => p.evaluate((id) => !!(UI.S.run && UI.S.run.ms[id] && UI.S.run.ms[id].done), id);
  const text = () => p.evaluate(() => document.querySelector('.card svg.bdy').textContent);

  console.log('1. 拆补');
  await open('fs-99x37');
  ok(await out('ok') === '0' && await out('value') === null, '开场：还不好算，没有得数');
  await dragTo('edge', await at(56 + 250 + 60, 78 + 174));
  ok((await props()).stage === 1 && await done('pull') && await p.locator('.card svg.bdy [data-strip]').count() === 1, '把边拉到 100：出现红色的一条');
  ok((await text()).includes('100 × 37 = 3700') && (await text()).includes('多算了红色的一条：1 × 37 = 37'), '写着 100 × 37 = 3700，多算了 1 × 37 = 37');
  await closeDlg(); await p.locator('.card svg.bdy g[data-pick-set]:has([data-strip])').click(); await p.waitForTimeout(220);
  ok((await props()).stage === 2 && await out('value') === '3663' && await done('ok') && (await text()).includes('= 3700 − 37'), '点红条拿掉：99 × 37 = 3700 − 37 = 3663');
  await p.keyboard.press('Control+z'); await p.waitForTimeout(200);
  ok((await props()).stage === 1, '撤销一次：红条回来了（一次点击一步）');

  console.log('2. 凑整');
  await open('fs-25x36');
  await dragTo('cut', await at(56 + 330 * 6 / 36, 78 - 8));
  ok((await props()).s === 6 && await out('ok') === '0' && (await text()).includes('每条 25 × 6 = 150') && (await text()).includes('换一种切法'), '切成每条 6：每条 150，不算好算，不写得数');
  await dragTo('cut', await at(56 + 330 * 4 / 36, 78 - 8));
  ok((await props()).s === 4 && await p.locator('.card svg.bdy [data-strip]').count() === 9 && await out('value') === '900' && await done('ok'), '切成每条 4：9 条，每条 100，得 900');
  ok((await text()).includes('9 个 100 = 900'), '写着“9 个 100 = 900”');

  console.log('3. 头同尾合十');
  await open('fs-23x27');
  await dragTo('piece', await zone());
  ok((await props()).stage === 1 && await p.locator('.card svg.bdy [data-placed]').count() === 1 && await out('value') === '621' && await done('ok'), '把橙色那条拖进虚线框：接上了，得 621');
  ok((await text()).includes('20 × (20 + 7 + 3)') && (await text()).includes('= 20 × 30 = 600') && (await text()).includes('3 × 7 = 21'), '写着左边一列 20 × 30 = 600，右下一小块 3 × 7 = 21');
  await dragTo('piece', await at(56 + 150 + 80, 78 + 40));
  ok((await props()).stage === 0 && await p.locator('.card svg.bdy [data-zone]').count() === 1, '拖回去：又变回 4 块');

  console.log('4. 平方差');
  await open('fs-19x21');
  await dragTo('piece', await zone());
  ok((await props()).stage === 1 && await p.locator('.card svg.bdy [data-corner]').count() === 1 && await out('value') === '399' && await done('ok'), '把上面那条拖到右边：拼成 20 × 20 缺一个角，得 399');
  ok((await text()).includes('缺的角：1 × 1 = 1') && (await text()).includes('400 − 1'), '写着缺的角 1 × 1 = 1，400 − 1');

  console.log('5. 完全平方、切一刀');
  await open('fs-35sq');
  await dragTo('cut', await at(56 + 230 * 30 / 35, 78 - 8));
  ok((await props()).s === 30 && await out('value') === '1225' && (await text()).includes('900 + 300 + 25') && await done('ok'), '35 × 35 切在 30：900 + 300 + 25 = 1225');
  await open('fs-34x11');
  await dragTo('cut', await at(56 - 8, 78 + 210 * 10 / 11));
  ok((await props()).s === 10 && await out('value') === '374' && (await text()).includes('340 + 34') && await done('ok'), '34 × 11 切在 10：340 + 34 = 374');
  ok(await p.evaluate(() => !UI.S.inspOpen), '全程没有打开属性面板');
  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n速算原理测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close(); process.exit(fail ? 1 : 0);
})();
