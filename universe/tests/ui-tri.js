/* node tests/ui-tri.js —— 三角形（小棒与角）：真实鼠标测试。
 *  1. 3、4、8：围不成，写出 3 + 4 = 7 < 8；把第三根拖到 6：围成了，画出三角形；拖到 5：直角，写出 3² + 4² = 25 = 5²；撤销一次回到 6；
 *  2. 腰长 5：底边拖到 6，周长 16，等腰；
 *  3. 角：35° 和 60°，把角 B 拖到 55°，角 C 是 90°，写出 35° + 55° + 90° = 180°；
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
  const props = () => p.evaluate(() => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'tribench'); return Object.assign({}, e.props); });
  const out = (port) => p.evaluate((port) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'tribench'), v = UI.S.D[e.id].out[port]; return v ? U.Q.show(v.data) : null; }, port);
  const grip = (id) => p.evaluate((id) => { const r = document.querySelector('.card svg.bdy [data-grip="' + id + '"]').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, id);
  const zoom = () => p.evaluate(() => { const sv = document.querySelector('.card svg.bdy'); return sv.getBoundingClientRect().width / +sv.getAttribute('width'); });
  const dragBy = async (id, dx) => { await closeDlg(); const g = await grip(id), z = await zoom(), x1 = g.x + dx * z; await p.mouse.move(g.x, g.y); await p.mouse.down(); await p.mouse.move((g.x + x1) / 2, g.y, { steps: 5 }); await p.mouse.move(x1, g.y, { steps: 5 }); await p.mouse.up(); await p.waitForTimeout(250); };
  const stick = async (k, to) => { const cur = (await props())[k]; await dragBy(k, (to - cur) * 16); };
  const done = (id) => p.evaluate((id) => !!(UI.S.run && UI.S.run.ms[id] && UI.S.run.ms[id].done), id);
  const text = () => p.evaluate(() => document.querySelector('.card svg.bdy').textContent);

  console.log('1. 小棒');
  await open('triangle-348');
  ok(await out('ok') === '0' && (await text()).includes('3 + 4 = 7 < 8') && await p.locator('.card svg.bdy [data-tri]').count() === 0, '3、4、8：围不成，写出 3 + 4 = 7 < 8');
  await stick('c', 6);
  ok((await props()).c === 6 && await out('ok') === '1' && await p.locator('.card svg.bdy [data-tri]').count() === 1 && await done('ok'), '第三根拖到 6：围成了，画出三角形');
  await stick('c', 5);
  ok(await out('right') === '1' && await done('right') && (await text()).includes('3² + 4² = 25 = 5² = 25'), '拖到 5：直角三角形，3² + 4² = 25 = 5²');
  await p.keyboard.press('Control+z'); await p.waitForTimeout(200);
  ok((await props()).c === 6, '撤销一次：回到 6（一次拖动一步）');

  console.log('2. 等腰');
  await open('g8-isosceles-perimeter-core');
  await stick('c', 6);
  ok(await out('perim') === '16' && await out('iso') === '1' && await done('perim') && (await text()).includes('等腰三角形'), '底边拖到 6：周长 16，等腰三角形');

  console.log('3. 角');
  await open('triangle-right');
  { const m = await props(); await dragBy('B', (55 - m.B) / (179 - m.A) * 200); }
  ok((await props()).B === 55 && await out('C') === '90' && await done('c90') && (await text()).includes('35° + 55° + 90° = 180°'), '角 B 拖到 55°：角 C 是 90°，35° + 55° + 90° = 180°');
  ok(await p.evaluate(() => !UI.S.inspOpen), '全程没有打开属性面板');
  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n三角形测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close(); process.exit(fail ? 1 : 0);
})();
