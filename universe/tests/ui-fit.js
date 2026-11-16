/* node tests/ui-fit.js —— 数据找规律（直线）：真实鼠标测试。
 *  1. 出租车：把两个把手拖到 (1, 8) 和 (4, 17)：直线穿过四个点，写出 y = 3x + 5；撤销一次回到拖之前；
 *  2. 拖红色探针到 10：预测 35 元；
 *  3. 水箱：直线往下斜，y = −5x + 100；探针拖到 10 剩 50 升；
 *  4. 全程没有打开属性面板。
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
  const props = () => p.evaluate(() => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'fitbench'); return Object.assign({}, e.props); });
  const out = (port) => p.evaluate((port) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'fitbench'), v = UI.S.D[e.id].out[port]; return v ? U.Q.show(v.data) : null; }, port);
  const grip = (id) => p.evaluate((id) => { const r = document.querySelector('.card svg.bdy [data-grip="' + id + '"]').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, id);
  // 数据坐标 (x, y) 在屏幕上的位置（画框：x 从 70 到 420，y 从 330 到 60）
  const at = (x, y) => p.evaluate(([x, y]) => { const e = Object.values(UI.S.scene.entities).find((q) => q.type === 'fitbench'), sv = document.querySelector('.card svg.bdy'), r = sv.getBoundingClientRect(), k = r.width / +sv.getAttribute('width'); return { x: r.x + (70 + x / e.props.xmax * 350) * k, y: r.y + (330 - y / e.props.ymax * 270) * k }; }, [x, y]);
  const drag = async (id, to) => { await closeDlg(); const g = await grip(id); await p.mouse.move(g.x, g.y); await p.mouse.down(); await p.mouse.move((g.x + to.x) / 2, (g.y + to.y) / 2, { steps: 5 }); await p.mouse.move(to.x, to.y, { steps: 5 }); await p.mouse.up(); await p.waitForTimeout(250); };
  const done = (id) => p.evaluate((id) => !!(UI.S.run && UI.S.run.ms[id] && UI.S.run.ms[id].done), id);
  const eq = () => p.evaluate(() => document.querySelector('.card svg.bdy [data-eq]').textContent);

  console.log('1. 让直线穿过所有的点');
  await open('taxi-model-linear');
  ok(await out('all') === '0', '开场直线没有穿过这些点');
  await drag('a', await at(1, 8));
  ok((await props()).ax === 1 && (await props()).ay === 8, '把手 A 拖到 (1, 8)');
  await drag('b', await at(4, 17));
  ok(await out('all') === '1' && await out('hits') === '4' && await done('fit') && await done('function') && (await eq()) === 'y = 3x + 5', '把手 B 拖到 (4, 17)：穿过四个点，y = 3x + 5');
  await p.keyboard.press('Control+z'); await p.waitForTimeout(200);
  ok((await props()).bx === 4 && (await props()).by === 8, '撤销一次：B 回到拖之前（一次拖动一步）');
  await drag('b', await at(4, 17));

  console.log('2. 预测');
  await drag('p', await at(10, 0));
  ok(await out('px') === '10' && await out('py') === '35' && await done('check'), '探针拖到 10：预测 35 元');

  console.log('3. 往下斜的直线');
  await open('tank-model-linear-decrease');
  await drag('a', await at(0, 100)); await drag('b', await at(6, 70));
  ok(await out('all') === '1' && await out('k') === '-5' && (await eq()) === 'y = −5x + 100', '穿过四个点：y = −5x + 100');
  await drag('p', await at(10, 0));
  ok(await out('py') === '50' && await done('check'), '探针拖到 10：剩 50 升');
  ok(await p.evaluate(() => !UI.S.inspOpen), '全程没有打开属性面板');
  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n数据找规律测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close(); process.exit(fail ? 1 : 0);
})();
