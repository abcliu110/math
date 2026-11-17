/* node tests/ui-grid.js —— 坐标与变换：真实鼠标测试。
 *  1. 数对：把 P 拖到第 4 列第 3 行，写出数对 (4, 3)；撤销一次回去；
 *  2. 旋转：中心 O 拖到 (1, 1)，点“180°”，P′ = (0, 1)；
 *  3. 平移：点“平移”，箭头尖拖到 (3, 1)，点“比一比”：全等；
 *  4. 位似：点“放大 2 倍”再比一比：相似比 2；
 *  5. 自己摆乙：拖乙的顶点让它和甲相似；
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
  const props = () => p.evaluate(() => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'gridbench'); return Object.assign({}, e.props); });
  const out = (port) => p.evaluate((port) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'gridbench'), v = UI.S.D[e.id].out[port]; return v ? U.Q.show(v.data) : null; }, port);
  const grip = (id) => p.evaluate((id) => { const r = document.querySelector('.card svg.bdy [data-grip="' + id + '"]').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, id);
  // 方格坐标 → 屏幕（原点在画布 (190, 200)，一格 25）
  const at = (x, y) => p.evaluate(([x, y]) => { const sv = document.querySelector('.card svg.bdy'), r = sv.getBoundingClientRect(), k = r.width / +sv.getAttribute('width'); return { x: r.x + (190 + x * 25) * k, y: r.y + (200 - y * 25) * k }; }, [x, y]);
  const drag = async (id, x, y) => { await closeDlg(); const g = await grip(id), to = await at(x, y); await p.mouse.move(g.x, g.y); await p.mouse.down(); await p.mouse.move((g.x + to.x) / 2, (g.y + to.y) / 2, { steps: 5 }); await p.mouse.move(to.x, to.y, { steps: 5 }); await p.mouse.up(); await p.waitForTimeout(250); };
  const btn = async (text) => { await closeDlg(); await p.locator('.card svg.bdy [data-pick-set]', { hasText: text }).first().click(); await p.waitForTimeout(200); };
  const done = (id) => p.evaluate((id) => !!(UI.S.run && UI.S.run.ms[id] && UI.S.run.ms[id].done), id);
  const text = () => p.evaluate(() => document.querySelector('.card svg.bdy').textContent);

  console.log('1. 数对');
  await open('g5-pair-pos-core');
  await drag('P', 4, 3);
  ok(await out('px') === '4' && await out('py') === '3' && await done('point') && (await text()).includes('数对 (4, 3)'), '把 P 拖到第 4 列第 3 行：数对 (4, 3)');
  await p.keyboard.press('Control+z'); await p.waitForTimeout(200);
  ok((await props()).px === 1 && (await props()).py === 1, '撤销一次：回到 (1, 1)（一次拖动一步）');

  console.log('2. 旋转');
  await open('g5-rotate-trap');
  await drag('O', 1, 1);
  await btn('180°');
  ok(await out('qx') === '0' && await out('qy') === '1' && await done('point') && await p.locator('.card svg.bdy [data-image]').count() === 1, 'O 拖到 (1, 1)，点“180°”：P′ = (0, 1)');

  console.log('3. 平移');
  await open('g4-translate-congruent-core');
  await btn('平移');
  await drag('t', 3, 1);
  ok((await props()).dx === 3 && (await props()).dy === 1 && await done('move'), '点“平移”，箭头尖拖到 (3, 1)');
  await btn('比一比');
  ok(await out('cong') === '1' && await done('same') && (await text()).includes('全等'), '比一比：全等');

  console.log('4. 位似');
  await open('g9-similar-scale-core');
  await btn('放大 2 倍'); await btn('比一比');
  ok(await out('k') === '2' && await out('sim') === '1' && await out('cong') === '0' && await done('scale'), '放大 2 倍再比一比：相似比 2，不全等');

  console.log('5. 自己摆乙');
  await open('g9-similar-tri-core');
  ok(await out('sim') === '0', '开场乙和甲不相似');
  await drag('q3', -6, 0);
  ok(await out('sim') === '1' && await out('k') === '2' && await done('sim') && await done('k'), '把乙的顶点拖到 (−6, 0)：相似，相似比 2');
  ok(await p.evaluate(() => !UI.S.inspOpen), '全程没有打开属性面板');
  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n坐标与变换测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close(); process.exit(fail ? 1 : 0);
})();
