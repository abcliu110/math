/* node tests/ui-conj.js —— 猜想与反例：真实鼠标测试。
 *  1. 前 n 个奇数的和：先选 2n − 1，n = 1 对；点“下一个 n”，n = 2 是反例；换成 n²，试到 5 都对；右边画出拐角拼成的正方形；撤销一次回到 n = 4；
 *  2. n² + n + 41：已经试到 30 全对；点“一直试到 100”，停在第一个反例 n = 40，写着 1681 = 41 × 41；点“不一定”；
 *  3. 质数都是奇数：从第 2 个质数看起都对；把把手拖到 1：反例 2；
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
  const props = () => p.evaluate(() => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'conjbench'); return Object.assign({}, e.props); });
  const out = (port) => p.evaluate((port) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'conjbench'), v = UI.S.D[e.id].out[port]; return v ? U.Q.show(v.data) : null; }, port);
  const btn = async (text) => { await closeDlg(); await p.locator('.card svg.bdy [data-pick-set]', { hasText: text }).first().click(); await p.waitForTimeout(180); };
  const done = (id) => p.evaluate((id) => !!(UI.S.run && UI.S.run.ms[id] && UI.S.run.ms[id].done), id);
  const msg = () => p.evaluate(() => document.querySelector('.card svg.bdy [data-msg]').textContent);
  const text = () => p.evaluate(() => document.querySelector('.card svg.bdy').textContent);

  console.log('1. 猜公式');
  await open('g6-odd-sum-trap');
  ok((await props()).pick === 0 && await out('ok') === '1', '开场选的是 2n − 1，n = 1 对');
  await btn('下一个 n');
  ok(await out('cex') === '2' && await done('bad') && (await msg()).includes('找到反例：n = 2'), '点“下一个 n”：n = 2 是反例');
  await btn('n²');
  for (let i = 0; i < 3; i++) await btn('下一个 n');
  ok((await props()).n === 5 && await out('good') === '1' && await done('ans'), '换成 n²，试到 5 都对，里程碑完成');
  ok(await p.locator('.card svg.bdy rect[width][fill="#9fb7d9"]').count() > 0 && (await text()).includes('拼成 5 × 5'), '右边画出拐角拼成 5 × 5 的正方形');
  await p.keyboard.press('Control+z'); await p.waitForTimeout(200);
  ok((await props()).n === 4, '撤销一次：回到 n = 4（一次点击一步）');

  console.log('2. 一直试下去');
  await open('euler-prime');
  ok(await out('tested') === '30' && await out('cex') === null, '已经试到 30，全对');
  await btn('一直试到 100');
  ok((await props()).n === 40 && await out('cex') === '40' && await done('forty') && (await text()).includes('1681 = 41 × 41'), '一直试：停在 n = 40，1681 = 41 × 41');
  await btn('不一定');
  ok(await out('verdict') === '2' && await done('judge'), '点“不一定”');

  console.log('3. 别漏了最小的');
  await open('pf-prime-odd');
  ok(await out('cex') === null && (await text()).includes('11 是奇数'), '从第 2 个质数看起：3、5、7、11 都是奇数');
  {
    const g = await p.evaluate(() => { const r = document.querySelector('.card svg.bdy [data-grip="n"]').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
    const x1 = await p.evaluate(() => { const sv = document.querySelector('.card svg.bdy'), r = sv.getBoundingClientRect(); return r.x + 40 * r.width / +sv.getAttribute('width'); });
    await closeDlg(); await p.mouse.move(g.x, g.y); await p.mouse.down(); await p.mouse.move((g.x + x1) / 2, g.y, { steps: 5 }); await p.mouse.move(x1, g.y, { steps: 5 }); await p.mouse.up(); await p.waitForTimeout(250);
  }
  ok((await props()).n === 1 && await out('cexv') === '2' && await done('two') && (await text()).includes('2 是偶数！'), '把把手拖到 1：第 1 个质数 2 是偶数，反例');
  ok(await p.evaluate(() => !UI.S.inspOpen), '全程没有打开属性面板');
  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n猜想与反例测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close(); process.exit(fail ? 1 : 0);
})();
