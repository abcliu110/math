/* node tests/ui-gap.js —— 间隔与植树：真实鼠标测试。
 *  1. 20 米每隔 5 米：把“隔”字拖到 5，4 个间隔、5 棵树；撤销一次回到拖之前；
 *  2. 点右头的树拔掉：4 棵（和间隔一样多）；再点左头：3 棵；
 *  3. 点“围成一圈”：棵数等于间隔数；
 *  4. 路灯：拖路的右端到 60 米，正好 11 盏；
 *  5. 全程没有打开属性面板。
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
  const props = () => p.evaluate(() => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'gapbench'); return Object.assign({}, e.props); });
  const out = (port) => p.evaluate((port) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'gapbench'), v = UI.S.D[e.id].out[port]; return v ? U.Q.show(v.data) : null; }, port);
  const grip = (id) => p.evaluate((id) => { const g = document.querySelector('.card svg.bdy [data-grip="' + id + '"]'); if (!g) return null; const r = g.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, id);
  // 路上 1 个单位占多少屏幕像素
  const unit = () => p.evaluate(() => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'gapbench'), m = U.GapBench.model(e.props), sv = document.querySelector('.card svg.bdy'), r = sv.getBoundingClientRect(); return m.u * r.width / +sv.getAttribute('width'); });
  const closeDlg = () => p.evaluate(() => { if (UI.Panels.closeDialog) UI.Panels.closeDialog(); });
  const dragBy = async (id, units) => { await closeDlg(); const g = await grip(id), u = await unit(); await p.mouse.move(g.x, g.y); await p.mouse.down(); await p.mouse.move(g.x + units * u / 2, g.y, { steps: 5 }); await p.mouse.move(g.x + units * u, g.y, { steps: 5 }); await p.mouse.up(); await p.waitForTimeout(250); };
  const pick = async (k) => { await closeDlg(); await p.locator('.card svg.bdy [data-pick-k="' + k + '"]').first().click(); await p.waitForTimeout(180); };
  const done = (id) => p.evaluate((id) => !!(UI.S.run && UI.S.run.ms[id] && UI.S.run.ms[id].done), id);
  const text = () => p.evaluate(() => document.querySelector('.card svg.bdy').textContent);

  console.log('1. 拖间隔');
  await open('gp-20-5');
  ok(await out('gaps') === '2' && await out('trees') === '3', '开场每隔 10 米：2 个间隔、3 棵树');
  await dragBy('gap', -5);
  ok((await props()).gap === 5 && await out('gaps') === '4' && await out('trees') === '5', '把“隔”字拖到 5 米：4 个间隔、5 棵树');
  ok((await text()).includes('20 ÷ 5 = 4 个间隔') && (await text()).includes('比间隔多 1') && await done('trees'), '写出 20 ÷ 5 = 4 个间隔、“比间隔多 1”，里程碑完成');
  await p.keyboard.press('Control+z'); await p.waitForTimeout(200);
  ok((await props()).gap === 10, '撤销一次：回到每隔 10 米（一次拖动一步）');

  console.log('2. 点两头的树');
  await open('gp-no-ends');
  await pick('re');
  ok((await props()).re === 0 && await out('trees') === '4' && (await text()).includes('一样多'), '点右头的树：拔掉，4 棵，和间隔一样多');
  await pick('le');
  ok((await props()).le === 0 && await out('trees') === '3' && (await text()).includes('少 1') && await done('none'), '再点左头：3 棵，比间隔少 1，里程碑完成');

  console.log('3. 围成一圈');
  await open('gp-ring');
  ok(await out('trees') === '9', '直路 40 米每隔 5 米、两头都种：9 棵');
  await pick('ring');
  ok((await props()).ring === 1 && await out('trees') === '8' && await done('ring'), '点“围成一圈”：8 棵，等于间隔数');
  ok(await p.locator('.card svg.bdy [data-grip]').count() === 0 && (await text()).includes('头和尾是同一棵'), '圈上没有可拖的端点，写着“头和尾是同一棵”');

  console.log('4. 反过来求路长');
  await open('gp-lamps');
  await dragBy('len', 30);
  ok((await props()).len === 60 && await out('trees') === '11' && await done('eleven'), '把路的右端拖到 60 米：正好 11 盏');
  await dragBy('len', 2);
  ok((await text()).includes('不够一个间隔'), '拖到 62 米：提示最后一段不够一个间隔');
  ok(await p.evaluate(() => !UI.S.inspOpen), '全程没有打开属性面板');
  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n间隔与植树测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close(); process.exit(fail ? 1 : 0);
})();
