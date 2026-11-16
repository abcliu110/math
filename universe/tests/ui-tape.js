/* node tests/ui-tape.js —— 线段图（和差倍）：真实鼠标测试。
 *  1. 和倍（一共 48，甲是乙的 3 倍）：下面写着“4 段 = 48”；把一段拖到 12，一共正好 48，甲 36；撤销一次回去；
 *  2. 差倍：点甲的 + 三次搭成 4 段，下面变成“3 段 = 24”；把一段拖到 8，乙 8；
 *  3. 和差：下面写着“2 段 + 6 = 30”；一段拖到 12，甲 18；
 *  4. 段数给好的题没有 + 和 −；
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
  const props = () => p.evaluate(() => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'tapebench'); return Object.assign({}, e.props); });
  const out = (port) => p.evaluate((port) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'tapebench'), v = UI.S.D[e.id].out[port]; return v ? U.Q.show(v.data) : null; }, port);
  const grip = () => p.evaluate(() => { const g = document.querySelector('.card svg.bdy [data-grip="u"]'), r = g.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
  // 按下那一刻的比例尺下，1 个单位占多少屏幕像素
  const unit = () => p.evaluate(() => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'tapebench'), sc = U.TapeBench.scaleOf(U.TapeBench.model(e.props)), sv = document.querySelector('.card svg.bdy'), r = sv.getBoundingClientRect(); return sc * r.width / +sv.getAttribute('width'); });
  const dragTo = async (u1) => { await closeDlg(); const g = await grip(), k = await unit(), u0 = (await props()).u, x1 = g.x + (u1 - u0) * k; await p.mouse.move(g.x, g.y); await p.mouse.down(); await p.mouse.move((g.x + x1) / 2, g.y, { steps: 5 }); await p.mouse.move(x1, g.y, { steps: 5 }); await p.mouse.up(); await p.waitForTimeout(250); };
  const plus = async (which) => { await closeDlg(); await p.locator('.card svg.bdy [data-pick-set]', { hasText: '+' }).nth(which).click(); await p.waitForTimeout(180); };
  const done = (id) => p.evaluate((id) => !!(UI.S.run && UI.S.run.ms[id] && UI.S.run.ms[id].done), id);
  const text = () => p.evaluate(() => document.querySelector('.card svg.bdy').textContent);
  const rel = () => p.evaluate(() => { const g = document.querySelector('.card svg.bdy [data-rel]'); return g ? g.textContent : ''; });

  console.log('1. 和倍');
  await open('tp-sum-times');
  ok(await rel() === '4 段 = 48' && (await text()).includes('一共要 48'), '下面“合起来看”写着 4 段 = 48');
  ok(await p.locator('.card svg.bdy [data-pick-set]').count() === 0, '段数给好的题：没有 + 和 −');
  await dragTo(12);
  ok((await props()).u === 12 && await out('sum') === '48' && await out('hit') === '1', '把一段拖到 12：一共正好 48');
  ok(await out('a') === '36' && await out('b') === '12' && await done('hit') && await done('a') && (await text()).includes('对上了'), '甲 36、乙 12，两个里程碑完成，写着“对上了”');
  await p.keyboard.press('Control+z'); await p.waitForTimeout(200);
  ok((await props()).u === 5, '撤销一次：一段回到 5（一次拖动一步）');

  console.log('2. 差倍：自己搭段数');
  await open('tp-diff-times');
  ok(await rel() === '0 = 24', '开场两条都是 1 段：多出来的是 0');
  await plus(0); await plus(0); await plus(0);
  ok((await props()).ka === 4 && await rel() === '3 段 = 24' && await done('four'), '点甲的 + 三次：甲 4 段，多出来的 3 段 = 24');
  await dragTo(8);
  ok(await out('b') === '8' && await out('a') === '32' && await out('diff') === '24' && await done('b'), '把一段拖到 8：乙 8、甲 32，相差 24');

  console.log('3. 和差');
  await open('tp-sum-diff');
  ok(await rel() === '2 段 + 6 = 30', '下面写着 2 段 + 6 = 30');
  await dragTo(12);
  ok(await out('a') === '18' && await out('b') === '12' && await done('a'), '把一段拖到 12：甲 18、乙 12');
  ok(await p.evaluate(() => !UI.S.inspOpen), '全程没有打开属性面板');
  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n线段图测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close(); process.exit(fail ? 1 : 0);
})();
