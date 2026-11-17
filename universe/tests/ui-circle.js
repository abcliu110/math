/* node tests/ui-circle.js —— 圆：真实鼠标测试。
 *  1. 拖半径到 5：面积 78.5、周长 31.4；撤销一次回去；
 *  2. 扇形：半径拖到 6，圆心角拖到 90°：扇形面积 28.26；
 *  3. 圆锥：点“圆柱 / 圆锥”切换，体积差 3 倍；
 *  4. 直线与圆：把直线拖到 d = 3：相切；
 *  5. 圆周角：拖 B 让圆心角 60°：圆周角 30°；
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
  const props = () => p.evaluate(() => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'circlebench'); return Object.assign({}, e.props); });
  const out = (port) => p.evaluate((port) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'circlebench'), v = UI.S.D[e.id].out[port]; return v ? U.Q.show(v.data) : null; }, port);
  const grip = (id) => p.evaluate((id) => { const r = document.querySelector('.card svg.bdy [data-grip="' + id + '"]').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, id);
  // 画布坐标（圆心 (220, 222)，1 个单位 17 像素）→ 屏幕
  const at = (x, y) => p.evaluate(([x, y]) => { const sv = document.querySelector('.card svg.bdy'), r = sv.getBoundingClientRect(), k = r.width / +sv.getAttribute('width'); return { x: r.x + x * k, y: r.y + y * k }; }, [x, y]);
  const drag = async (id, to) => { await closeDlg(); const g = await grip(id); await p.mouse.move(g.x, g.y); await p.mouse.down(); await p.mouse.move((g.x + to.x) / 2, (g.y + to.y) / 2, { steps: 5 }); await p.mouse.move(to.x, to.y, { steps: 5 }); await p.mouse.up(); await p.waitForTimeout(250); };
  const pol = (deg, R) => [220 + R * Math.sin(deg * Math.PI / 180), 222 - R * Math.cos(deg * Math.PI / 180)];
  const done = (id) => p.evaluate((id) => !!(UI.S.run && UI.S.run.ms[id] && UI.S.run.ms[id].done), id);
  const btn = async (text) => { await closeDlg(); await p.locator('.card svg.bdy [data-pick-set]', { hasText: text }).first().click(); await p.waitForTimeout(180); };

  console.log('1. 拖半径');
  await open('circle-r5');
  await drag('r', await at(220 + 5 * 17, 222));
  ok(await out('r') === '5' && await out('area') === '157/2' && await out('c') === '157/5' && await done('a') && await done('c'), '半径拖到 5：面积 78.5、周长 31.4');
  await p.keyboard.press('Control+z'); await p.waitForTimeout(200);
  ok((await props()).r === 2, '撤销一次：半径回到 2（一次拖动一步）');

  console.log('2. 扇形');
  await open('g9-sector-core');
  await drag('r', await at(220 + 6 * 17, 222));
  ok(await out('area') === '2826/25' && await done('area'), '半径拖到 6：整圆面积 113.04');
  await drag('th', await at(...pol(90, 6 * 17)));
  ok((await props()).theta === 90 && await out('sector') === '1413/50' && await done('sector'), '圆心角拖到 90°：扇形面积 28.26');

  console.log('3. 圆柱和圆锥');
  await open('g6-cone-volume-trap');
  await drag('r', await at(220 + 3 * 17, 222 + 110));
  await drag('h', await at(220, 222 + 110 - 4 * 17));
  ok(await out('vol') === '942/25' && await done('ans'), '半径 3、高 4 的圆锥：体积 37.68');
  await btn('圆柱');
  ok(await out('vol') === '2826/25', '点“圆柱”：体积 113.04，是圆锥的 3 倍');

  console.log('4. 直线与圆');
  await open('g9-circle-trap');
  { const g = await grip('d'); await drag('d', { x: g.x, y: (await at(0, 222 + 3 * 17)).y }); }
  ok((await props()).d === 3 && await out('rel') === '1' && await done('answer'), '直线拖到 d = 3：相切');

  console.log('5. 圆周角');
  await open('mt-circle-angle-core');
  await drag('ca', await at(...pol(210, 6 * 17)));
  ok((await props()).ca === 60 && await out('ins') === '30' && await done('half'), '拖 B 让圆心角 60°：圆周角 30°');
  ok(await p.evaluate(() => !UI.S.inspOpen), '全程没有打开属性面板');
  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n圆测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close(); process.exit(fail ? 1 : 0);
})();
