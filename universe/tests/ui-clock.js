/* node tests/ui-clock.js —— 钟面：真实鼠标测试。
 *  1. 拖时针：从 12 时拖到 3，变成 3 时整（分针跟着回到 12）；撤销一次回到 12 时；
 *  2. 拖分针转一整圈：先点“从这里开始计时”，分针沿着钟面拖一圈回到 12，经过 60 分，时针走到 1；钟面上画出分针走过的路；
 *  3. 2 时 30 分：分针连续拖两圈半，经过 150 分（转过 12 接得上，不会跳回去）；
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
  const props = () => p.evaluate(() => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'clockbench'); return Object.assign({}, e.props); });
  const out = (port) => p.evaluate((port) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'clockbench'), v = UI.S.D[e.id].out[port]; return v ? U.Q.show(v.data) : null; }, port);
  const grip = (id) => p.evaluate((id) => { const r = document.querySelector('.card svg.bdy [data-grip="' + id + '"]').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, id);
  // 钟面上角度 deg、半径 rr 的点在屏幕上的位置（钟心在画布 (170, 190)）
  const at = (deg, rr) => p.evaluate(([deg, rr]) => { const sv = document.querySelector('.card svg.bdy'), r = sv.getBoundingClientRect(), k = r.width / +sv.getAttribute('width'), a = deg * Math.PI / 180; return { x: r.x + (170 + rr * Math.sin(a)) * k, y: r.y + (190 - rr * Math.cos(a)) * k }; }, [deg, rr]);
  // 从一个把手出发，沿着钟面一路拖过这些角度（每 15° 一步），松手
  const sweep = async (id, rr, from, to) => { await closeDlg(); const g = await grip(id); await p.mouse.move(g.x, g.y); await p.mouse.down(); for (let d = from + 15; d <= to; d += 15) { const q = await at(d, rr); await p.mouse.move(q.x, q.y, { steps: 2 }); } await p.mouse.up(); await p.waitForTimeout(250); };
  const btn = async (text) => { await closeDlg(); await p.locator('.card svg.bdy [data-pick-set]', { hasText: text }).first().click(); await p.waitForTimeout(200); };
  const done = (id) => p.evaluate((id) => !!(UI.S.run && UI.S.run.ms[id] && UI.S.run.ms[id].done), id);
  const text = () => p.evaluate(() => document.querySelector('.card svg.bdy').textContent);

  console.log('1. 拖时针');
  await open('g1-clock-hour-core');
  await sweep('hour', 70, 0, 90);
  ok((await props()).t === 180 && await out('h') === '3' && await out('m') === '0' && await done('three'), '时针拖到 3：3 时整，分针在 12');
  ok((await text()).includes('现在：3 时 0 分'), '写着“现在：3 时 0 分”');
  await p.keyboard.press('Control+z'); await p.waitForTimeout(200);
  ok((await props()).t === 0, '撤销一次：回到 12 时（一次拖动一步）');

  console.log('2. 分针转一整圈');
  await open('g1-clock-minute-trap');
  await btn('从这里开始计时');
  ok((await props()).timing === true && await out('elapsed') === '0' && await done('start'), '点“从这里开始计时”：经过 0 分');
  await sweep('min', 115, 0, 360);
  ok(await out('elapsed') === '60' && await out('h') === '1' && await done('hour'), '分针拖一整圈回到 12：经过 60 分，时针走到 1');
  ok((await text()).includes('经过了 1 时 = 60 分') && (await text()).includes('分针转了 1 圈'), '写着“经过了 1 时 = 60 分”“分针转了 1 圈”');

  console.log('3. 两圈半');
  await open('g2-hour-minute-core');
  await sweep('min', 115, 0, 900);
  ok(await out('elapsed') === '150' && await out('h') === '2' && await out('m') === '30' && await done('all'), '分针连续拖两圈半：2 时 30 分，经过 150 分');
  ok(await p.locator('.card svg.bdy [data-swept]').count() === 1, '钟面上画出分针走过的那半圈');
  ok(await p.evaluate(() => !UI.S.inspOpen), '全程没有打开属性面板');
  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n钟面测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close(); process.exit(fail ? 1 : 0);
})();
