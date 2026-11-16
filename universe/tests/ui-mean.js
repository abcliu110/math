/* node tests/ui-mean.js —— 平均数（移多补少）：真实鼠标测试。
 *  1. 3、7、5、9：把 9 那堆最上面的一块拖到 3 那堆；拖到一半时写着“总数不变，平均线不动”；松手 4、7、5、8；撤销一次回去；
 *  2. 搬到一样高：6、6、6、6，写出 24 ÷ 4 = 6，里程碑完成；平均线一直在 6；
 *  3. 总数不能变的题：把一块拖到外面，什么都不变；
 *  4. 可以改数据的题：点“加一人”，平均线从 8 掉到 6；从托盘往第四堆上拖，加一块；
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
  const props = () => p.evaluate(() => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'meanbench'); return Object.assign({}, e.props); });
  const out = (port) => p.evaluate((port) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'meanbench'), v = UI.S.D[e.id].out[port]; return v ? U.Q.show(v.data) : null; }, port);
  const grip = (id) => p.evaluate((id) => { const g = document.querySelector('.card svg.bdy [data-grip="' + id + '"]'); if (!g) return null; const r = g.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, id);
  const hold = async (a, c) => { await closeDlg(); await p.mouse.move(a.x, a.y); await p.mouse.down(); await p.mouse.move((a.x + c.x) / 2, (a.y + c.y) / 2, { steps: 5 }); await p.mouse.move(c.x, c.y, { steps: 5 }); await p.waitForTimeout(100); };
  const col = (j) => p.evaluate((j) => { const sv = document.querySelector('.card svg.bdy'), b = sv.getBoundingClientRect(), z = b.width / +sv.getAttribute('width'); return { x: b.x + (44 + j * 54 + 20) * z, y: b.y + 240 * z }; }, j);
  const move = async (i, j) => { const a = await grip('c' + i), c = await col(j); await hold(a, c); await p.mouse.up(); await p.waitForTimeout(220); };
  const done = (id) => p.evaluate((id) => !!(UI.S.run && UI.S.run.ms[id] && UI.S.run.ms[id].done), id);
  const text = () => p.evaluate(() => document.querySelector('.card svg.bdy').textContent);
  const line = () => p.evaluate(() => { const g = document.querySelector('.card svg.bdy [data-meanline]'); return g ? g.dataset.meanline : null; });

  console.log('1. 搬一块');
  await open('mn-3-7-5-9');
  ok(await p.locator('.card svg.bdy [data-grip]').count() === 4 && await line() === '6', '四堆各有一个把手；平均线在 6');
  ok((await text()).includes('线上多出来 4 块，线下空着 4 块'), '写着“线上多出来 4 块，线下空着 4 块”');
  {
    const a = await grip('c3'), c = await col(0);
    await hold(a, c);
    ok(await p.locator('.card svg.bdy [data-carry]').count() === 1 && (await text()).includes('总数不变，平均线不动') && await line() === '6', '拖到 3 那堆上（还没松手）：写着“总数不变，平均线不动”，线还在 6');
    await p.mouse.up(); await p.waitForTimeout(220);
  }
  ok((await props()).vals === '4,7,5,8' && await out('total') === '24', '松手：4、7、5、8，总数还是 24');
  await p.keyboard.press('Control+z'); await p.waitForTimeout(200);
  ok((await props()).vals === '3,7,5,9', '撤销一次：回到 3、7、5、9（一次拖动一步）');

  console.log('2. 搬到一样高');
  await move(3, 0); await move(3, 0); await move(3, 0); await move(1, 2);
  ok((await props()).vals === '6,6,6,6' && await out('level') === '1' && await done('level'), '搬 4 次：6、6、6、6，里程碑完成');
  ok((await text()).includes('24 ÷ 4 = 6') && await out('mean') === '6', '写出 24 ÷ 4 = 6');

  console.log('3. 总数不能变');
  await open('mn-3-7-5-9');
  {
    const a = await grip('c1');
    await hold(a, { x: a.x + 330, y: a.y + 10 });
    ok((await text()).includes('这一题总数不能变'), '把一块拖到外面（还没松手）：写着“这一题总数不能变”');
    await p.mouse.up(); await p.waitForTimeout(220);
    ok((await props()).vals === '3,7,5,9', '松手：什么都没变');
  }

  console.log('4. 可以改数据');
  await open('mn-add-zero');
  ok(await line() === '8', '三个人各 8 块：平均线在 8');
  await closeDlg(); await p.locator('.card svg.bdy [data-pick-set]', { hasText: '加一人' }).click(); await p.waitForTimeout(220);
  ok((await props()).vals === '8,8,8,0' && await line() === '6' && await done('four'), '点“加一人”：第四个人 0 块，平均线掉到 6');
  {
    const a = await grip('tray');
    await hold(a, await col(3));
    await p.mouse.up(); await p.waitForTimeout(220);
    ok((await props()).vals === '8,8,8,1' && await out('total') === '25', '从托盘往第四个人那里拖：加一块，总数 25');
  }
  await p.keyboard.press('Control+z'); await p.waitForTimeout(200);
  await move(0, 3); await move(0, 3); await move(1, 3); await move(1, 3); await move(2, 3); await move(2, 3);
  ok((await props()).vals === '6,6,6,6' && await done('six'), '每人给他 2 块：6、6、6、6，里程碑完成');
  ok(await p.evaluate(() => !UI.S.inspOpen), '全程没有打开属性面板');
  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n平均数测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close(); process.exit(fail ? 1 : 0);
})();
