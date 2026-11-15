/* node tests/ui-ratio.js —— 分数条与比：真实鼠标测试。
 *  1. 1/2 和 1/3：拖两条的把手各涂 1 份，比出 1/2 > 1/3；撤销一次回到上一步；
 *  2. 3/4 写成八分之几：点 ＋ 把乙切成 8 份，拖到 6 份，两条一样长；
 *  3. 3/4 和 2/3 相差 1/12（通分那一行写出 9/12 和 8/12）；
 *  4. 双数轴：3 个 12 元，把点拖到 5，下面对着 20；
 *  5. 百分数：拖到 25%，对着 20（每小格 5%，落点吸到刻度上）；
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
  const props = () => p.evaluate(() => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'ratiobench'); return Object.assign({}, e.props); });
  const out = (port) => p.evaluate((port) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'ratiobench'), v = UI.S.D[e.id].out[port]; return v ? U.Q.show(v.data) : null; }, port);
  const grip = (id) => p.evaluate((id) => { const g = document.querySelector('.card svg.bdy [data-grip="' + id + '"]'); if (!g) return null; const r = g.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, id);
  const px = (n) => p.evaluate((n) => { const sv = document.querySelector('.card svg.bdy'), r = sv.getBoundingClientRect(); return n * r.width / +sv.getAttribute('width'); }, n);
  const closeDlg = () => p.evaluate(() => { if (UI.Panels.closeDialog) UI.Panels.closeDialog(); });
  // 把一个把手横向拖 dx 个画布像素
  const dragBy = async (id, dx) => { await closeDlg(); const g = await grip(id), d = await px(dx); await p.mouse.move(g.x, g.y); await p.mouse.down(); await p.mouse.move(g.x + d / 2, g.y, { steps: 5 }); await p.mouse.move(g.x + d, g.y, { steps: 5 }); await p.mouse.up(); await p.waitForTimeout(250); };
  const pick = async (k, nth) => { await closeDlg(); await p.locator('.card svg.bdy [data-pick-k="' + k + '"]').nth(nth).click(); await p.waitForTimeout(160); };
  const done = (id) => p.evaluate((id) => !!(UI.S.run && UI.S.run.ms[id] && UI.S.run.ms[id].done), id);
  const text = () => p.evaluate(() => document.querySelector('.card svg.bdy').textContent);
  const BW = 400;

  console.log('1. 1/2 和 1/3');
  await open('rb-half-third');
  ok(await p.locator('.card svg.bdy [data-grip]').count() === 2, '两条各有一个把手');
  await dragBy('n1', BW / 2);
  ok(await out('a') === '1/2', '甲的把手往右拖半条：1/2');
  await dragBy('n2', BW / 3);
  ok(await out('b') === '1/3' && await out('cmp') === '1', '乙往右拖三分之一条：1/3；1/2 比它大');
  ok((await text()).includes('1/2 > 1/3') && await done('cmp'), '写出 1/2 > 1/3，里程碑完成');
  await p.keyboard.press('Control+z'); await p.waitForTimeout(200);
  ok((await props()).n2 === 0 && (await props()).n1 === 1, '撤销一次：乙回到没涂，甲不变（一次拖动一步）');

  console.log('2. 3/4 = 6/8');
  await open('rb-eighths');
  for (let i = 0; i < 4; i++) await pick('d2', 1);
  ok((await props()).d2 === 8 && await done('cut8'), '点 4 下 ＋：乙切成 8 份');
  await dragBy('n2', BW * 6 / 8);
  ok((await props()).n2 === 6 && await out('cmp') === '0', '拖到 6 份：6/8，和 3/4 一样长');
  ok((await text()).includes('等值分数') && await done('eq'), '说明是等值分数，里程碑完成');

  console.log('3. 相差 1/12');
  await open('rb-diff');
  await dragBy('n1', BW * 3 / 4); await dragBy('n2', BW * 2 / 3);
  ok(await out('diff') === '1/12', '3/4 和 2/3 相差 1/12');
  ok((await text()).includes('9/12 和 8/12'), '通分那一行：9/12 和 8/12');

  console.log('4. 双数轴');
  await open('rb-apples');
  const W = 600, span = W - 50 - 44;
  await dragBy('t', span * 5 / 10);
  ok((await props()).t === 5 && await out('b') === '20', '把上面的点拖到 5：下面对着 20');
  ok((await text()).includes('5 × 4 = 20') && await done('five'), '写出 5 × 4 = 20，里程碑完成');

  console.log('5. 百分数');
  await open('rb-percent');
  await dragBy('t', span * 0.26);
  ok((await props()).t === 25 && await out('b') === '20', '拖到 26% 附近：吸到 25%，对着 20');
  ok(await p.evaluate(() => !UI.S.inspOpen), '全程没有打开属性面板');
  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n分数条与比测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close(); process.exit(fail ? 1 : 0);
})();
