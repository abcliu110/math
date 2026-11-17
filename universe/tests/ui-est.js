/* node tests/ui-est.js —— 估一估：真实鼠标测试。
 *  1. 47 + 38：都点小的一端，估 70，“算一算”写着差得多；改点大的一端：90；
 *  2. 4.8 × 0.52：5 × 0.5 = 2.5，算一算是 2.496；
 *  3. 半径 5 的圆：真实拖两个把手到 50 和 100，揭开：在范围里，中点差不到 20%；
 *  4. 全程没有打开属性面板。 */
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
  const out = (port) => p.evaluate((port) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'estbench'), v = UI.S.D[e.id].out[port]; return v ? U.Q.show(v.data) : null; }, port);
  const byTitle = async (title) => { await closeDlg(); await p.locator('.card svg.bdy g[data-pick-set]').filter({ has: p.locator('title', { hasText: title }) }).first().click(); await p.waitForTimeout(140); };
  const press = async (label) => { await closeDlg(); await p.locator('.card svg.bdy g[data-pick-set]').filter({ hasText: label }).first().click(); await p.waitForTimeout(140); };
  const read = () => p.evaluate(() => { const g = document.querySelector('.card svg.bdy [data-read]'); return g ? g.textContent : ''; });
  const done = (id) => p.evaluate((id) => !!(UI.S.run && UI.S.run.ms[id] && UI.S.run.ms[id].done), id);
  const trap = (id) => p.evaluate((id) => !!(UI.S.run && UI.S.run.traps && UI.S.run.traps[id]), id);
  // 把手：卡片坐标 → 屏幕坐标
  const toScreen = (x, y) => p.evaluate(([x, y]) => { const svg = document.querySelector('.card svg.bdy'), pt = svg.createSVGPoint(); pt.x = x; pt.y = y; const q = pt.matrixTransform(svg.getScreenCTM()); return [q.x, q.y]; }, [x, y]);
  const BX = (v, top) => 60 + 580 * v / top;

  console.log('1. 凑整加法');
  await open('g2-estimate-trap');
  await byTitle('把 47 看成 40'); await byTitle('把 38 看成 30');
  ok(await out('est') === '70', '都看成小的一端：估 70');
  await press('算一算');
  ok((await read()).includes('准确：85') && (await read()).includes('差得多'), '算一算：准确 85，写着“差得多”');
  await byTitle('把 47 看成 50'); await byTitle('把 38 看成 40');
  ok(await out('est') === '90' && await out('exact') === null && await done('est'), '改成离它近的一端：估 90（改了以后要重新算）');

  console.log('2. 小数乘法');
  await open('est-48x52');
  await byTitle('把 4.8 看成 5'); await byTitle('把 0.52 看成 0.5');
  await press('算一算');
  ok(await out('est') === '5/2' && await out('exact') === '312/125' && (await read()).includes('准确：2.496') && await done('exact'), '5 × 0.5 = 2.5，准确 2.496');

  console.log('3. 夹出范围');
  await open('est-circle');
  const top = 120;
  for (const [from, to] of [[0, 100], [0, 50]]) {
    // 两个把手都在 0：先拖一个到 100，再拖另一个到 50
    const [x0, y0] = await toScreen(BX(from, top), 250), [x1] = await toScreen(BX(to, top), 250);
    await closeDlg(); await p.mouse.move(x0, y0); await p.mouse.down(); await p.mouse.move((x0 + x1) / 2, y0, { steps: 4 }); await p.mouse.move(x1, y0, { steps: 4 }); await p.mouse.up(); await p.waitForTimeout(200);
  }
  ok(await p.evaluate(() => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'estbench'); const a = [e.props.lo, e.props.hi].sort((x, y) => x - y); return a[0] === 50 && a[1] === 100; }), '真实拖两个把手：50 到 100');
  await press('揭开');
  ok(await out('inrange') === '1' && await out('tight') === '1' && (await read()).includes('在你的范围里') && await done('close'), '揭开：78.5 在范围里，中点 75 差不到 20%');
  ok(await p.evaluate(() => !UI.S.inspOpen), '全程没有打开属性面板');
  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  void trap;
  console.log('\n估一估测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close(); process.exit(fail ? 1 : 0);
})();
