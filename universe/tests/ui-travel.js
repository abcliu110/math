/* node tests/ui-travel.js —— 行程（相遇与追及）：真实鼠标测试。
 *  1. 相遇（相距 90，10 和 5，面对面）：写着“每过 1 小时近 15 千米”；时间条拖到 6，相距 0，写“碰上了”；撤销一次回去；
 *  2. 追及（9 追 5，差 24）：写着“每过 1 小时近 4 千米”；拖到 6 追上；
 *  3. 求速度：拖乙的箭头尖，速度改成 8；时间拖到 5，正好碰上；
 *  4. 速度和出发点给好的题只有时间条一个把手；
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
  const props = () => p.evaluate(() => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'travelbench'); return Object.assign({}, e.props); });
  const out = (port) => p.evaluate((port) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'travelbench'), v = UI.S.D[e.id].out[port]; return v ? U.Q.show(v.data) : null; }, port);
  const grip = (id) => p.evaluate((id) => { const g = document.querySelector('.card svg.bdy [data-grip="' + id + '"]'); if (!g) return null; const r = g.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, id);
  const zoom = () => p.evaluate(() => { const sv = document.querySelector('.card svg.bdy'); return sv.getBoundingClientRect().width / +sv.getAttribute('width'); });
  const dragBy = async (id, dx) => { await closeDlg(); const g = await grip(id), z = await zoom(), x1 = g.x + dx * z; await p.mouse.move(g.x, g.y); await p.mouse.down(); await p.mouse.move((g.x + x1) / 2, g.y, { steps: 5 }); await p.mouse.move(x1, g.y, { steps: 5 }); await p.mouse.up(); await p.waitForTimeout(250); };
  // 时间条：从现在拖到 t1（画布上 290 像素是整条）
  const timeTo = async (t1) => { const q = await props(); await dragBy('t', (t1 - q.t) * 290 / q.tmax); };
  const done = (id) => p.evaluate((id) => !!(UI.S.run && UI.S.run.ms[id] && UI.S.run.ms[id].done), id);
  const text = () => p.evaluate(() => document.querySelector('.card svg.bdy').textContent);

  console.log('1. 相遇');
  await open('tv-meet');
  ok(await p.locator('.card svg.bdy [data-grip]').count() === 1, '速度和出发点给好的题：只有时间条一个把手');
  ok((await text()).includes('两人相距 90 千米') && (await text()).includes('每过 1 小时近 15 千米'), '开场相距 90，写着“每过 1 小时近 15 千米”');
  await timeTo(2);
  ok((await props()).t === 2 && await out('gap') === '60' && await out('sa') === '20' && await out('sb') === '10', '时间拖到 2：甲走 20、乙走 10，相距 60');
  await timeTo(6);
  ok(await out('gap') === '0' && await done('meet') && (await text()).includes('碰上了'), '时间拖到 6：相距 0，写着“碰上了”，里程碑完成');
  await p.keyboard.press('Control+z'); await p.waitForTimeout(200);
  ok((await props()).t === 2, '撤销一次：时间回到 2（一次拖动一步）');

  console.log('2. 追及');
  await open('tv-chase');
  ok((await text()).includes('每过 1 小时近 4 千米'), '同方向走：写着“每过 1 小时近 4 千米”');
  await timeTo(6);
  ok(await out('gap') === '0' && await out('xa') === '54' && await out('xb') === '54' && await done('catch'), '时间拖到 6：两人都在 54，追上了');

  console.log('3. 反过来求速度');
  await open('tv-find-speed');
  ok(await p.locator('.card svg.bdy [data-grip]').count() === 5, '可以改的题：时间条、两个箭头尖、两个出发点');
  {
    const q = await props(), sc = 590 / q.len;   // 画布上每千米多少像素
    await dragBy('vb', -(8 - q.vb) * sc);        // 乙往左走：箭头尖再往左拖 6 千米那么远
  }
  ok((await props()).vb === 8 && await done('vb') && (await text()).includes('每过 1 小时近 12 千米'), '把乙的箭头尖往左拖：速度 8，每小时近 12');
  await timeTo(5);
  ok(await out('gap') === '0' && await done('meet') && await done('t5'), '时间拖到 5：正好碰上');
  ok(await p.evaluate(() => !UI.S.inspOpen), '全程没有打开属性面板');
  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n行程测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close(); process.exit(fail ? 1 : 0);
})();
