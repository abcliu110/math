/* node tests/ui-pair.js —— 连一连（一一对应、握手）：真实鼠标测试。
 *  1. 5 位客人 4 把椅子：从客人拖到椅子连 4 条线，连不下去了，剩下 1 位客人标红；撤销一次少一条线；
 *  2. 点一条线：擦掉；
 *  3. 2 把椅子 3 位客人：连 2 条，点“椅子 +”，再连 1 条，一样多；
 *  4. 握手 4 个人：连 6 条线全握完，写出 3 + 2 + 1 = 6；同一对再连一次被拦住并说明；
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
  const props = () => p.evaluate(() => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'pairbench'); return Object.assign({}, e.props); });
  const out = (port) => p.evaluate((port) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'pairbench'), v = UI.S.D[e.id].out[port]; return v ? U.Q.show(v.data) : null; }, port);
  // 画布坐标 → 屏幕
  const at = (x, y) => p.evaluate(([x, y]) => { const sv = document.querySelector('.card svg.bdy'), r = sv.getBoundingClientRect(), k = r.width / +sv.getAttribute('width'); return { x: r.x + x * k, y: r.y + y * k }; }, [x, y]);
  const drag = async (from, to) => { await closeDlg(); const a = await at(from[0], from[1]), c = await at(to[0], to[1]); await p.mouse.move(a.x, a.y); await p.mouse.down(); await p.mouse.move((a.x + c.x) / 2, (a.y + c.y) / 2, { steps: 5 }); await p.mouse.move(c.x, c.y, { steps: 5 }); await p.mouse.up(); await p.waitForTimeout(200); };
  const A = (i) => [96 + i * 54, 110], Bp = (i) => [96 + i * 54, 250];
  const P = (i, n) => [330 + 120 * Math.sin(2 * Math.PI * i / n), 196 - 120 * Math.cos(2 * Math.PI * i / n) * 0.8];
  const btn = async (text, nth) => { await closeDlg(); await p.locator('.card svg.bdy [data-pick-set]', { hasText: text }).nth(nth || 0).click(); await p.waitForTimeout(180); };
  const done = (id) => p.evaluate((id) => !!(UI.S.run && UI.S.run.ms[id] && UI.S.run.ms[id].done), id);
  const msg = () => p.evaluate(() => document.querySelector('.card svg.bdy [data-msg]').textContent);

  console.log('1. 一个对一个连');
  await open('no-extra-seat');
  for (let i = 0; i < 4; i++) await drag(A(i), Bp(i));
  ok(await out('pairs') === '4' && await out('full') === '1' && await out('leftA') === '1' && await done('left'), '连 4 条：连不下去了，剩 1 位客人');
  ok((await msg()).includes('客人多了 1 个'), '写着“客人多了 1 个”');
  await p.keyboard.press('Control+z'); await p.waitForTimeout(200);
  ok(await out('pairs') === '3', '撤销一次：少一条线（一次拖动一步）');

  console.log('2. 点线擦掉');
  await closeDlg(); await p.mouse.click((await at(96, 180)).x, (await at(96, 180)).y); await p.waitForTimeout(200);
  ok(await out('pairs') === '2' && !(await props()).pairs.includes('0-0'), '点第一条线：擦掉了');

  console.log('3. 加一把椅子');
  await open('one-to-one');
  await drag(A(0), Bp(0)); await drag(A(1), Bp(1));
  ok(await out('leftA') === '1' && await done('short'), '连 2 条：少 1 把椅子');
  await btn('+', 1);
  ok((await props()).nb === 3, '点“椅子 +”：3 把椅子');
  await drag(A(2), Bp(2));
  ok(await out('eq') === '1' && await done('eq') && (await msg()).includes('一样多'), '再连 1 条：一样多');

  console.log('4. 握手');
  await open('count-by-match');
  const pairs = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]];
  for (const [a, c] of pairs) await drag(P(a, 4), P(c, 4));
  ok(await out('pairs') === '6' && await out('full') === '1' && await done('all') && (await msg()).includes('3 + 2 + 1 = 6'), '连 6 条：全握完，3 + 2 + 1 = 6');
  await drag(P(1, 4), P(0, 4));
  ok(await out('pairs') === '6' && (await msg()).includes('甲握乙就是乙握甲'), '乙再拖到甲：被拦住，说明“甲握乙就是乙握甲”');
  ok(await p.evaluate(() => !UI.S.inspOpen), '全程没有打开属性面板');
  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n连一连测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close(); process.exit(fail ? 1 : 0);
})();
