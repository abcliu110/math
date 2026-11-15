/* node tests/ui-blocks.js —— 计数块与数位：真实鼠标测试。
 *  1. 摆出 16：从托盘拖一根长条到十位、六个小方块到个位；把一个块拖到板子外面是拿走；
 *  2. 27 + 15：个位 12 个（红）；把个位的块往左拖到十位，十个捆成一个：4 个十、2 个一，答案 42；撤销一次回到捆之前；
 *  3. 不够十个捆不了：个位 2 个时往左拖，什么都不变；
 *  4. 52 − 7：把十位的一根往右拖到个位，拆成十个：4 个十、12 个一，数没变；
 *  5. 加法的用法里，把块拖到板子外面不会拿走（总数不变）；
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
  const props = () => p.evaluate(() => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'blocksbench'); return Object.assign({}, e.props); });
  const out = (port) => p.evaluate((port) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'blocksbench'), v = UI.S.D[e.id].out[port]; return v ? U.Q.show(v.data) : null; }, port);
  const grip = (id) => p.evaluate((id) => { const g = document.querySelector('.card svg.bdy [data-grip="' + id + '"]'); if (!g) return null; const r = g.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, id);
  // 画布坐标 (x, y) 在屏幕上的位置
  const at = (x, y) => p.evaluate(([x, y]) => { const sv = document.querySelector('.card svg.bdy'), r = sv.getBoundingClientRect(), k = r.width / +sv.getAttribute('width'); return { x: r.x + x * k, y: r.y + y * k }; }, [x, y]);
  const closeDlg = () => p.evaluate(() => { if (UI.Panels.closeDialog) UI.Panels.closeDialog(); });
  const dragTo = async (id, to) => { await closeDlg(); const g = await grip(id); await p.mouse.move(g.x, g.y); await p.mouse.down(); await p.mouse.move((g.x + to.x) / 2, (g.y + to.y) / 2, { steps: 5 }); await p.mouse.move(to.x, to.y, { steps: 5 }); await p.mouse.up(); await p.waitForTimeout(220); };
  const done = (id) => p.evaluate((id) => !!(UI.S.run && UI.S.run.ms[id] && UI.S.run.ms[id].done), id);
  // 三栏的中间，和板子外面（右边空白处）
  const COL = [await 0, 0, 0];
  const colMid = (i) => at(34 + i * 168 + 80, 150), outside = () => at(585, 150);

  console.log('1. 摆出 16');
  await open('bk-make-16');
  ok(await p.locator('.card svg.bdy [data-grip]').count() === 3, '空板子：只有托盘里的三样可以拖');
  await dragTo('s1', await colMid(1));
  for (let i = 0; i < 7; i++) await dragTo('s2', await colMid(2));
  ok((await props()).t === 1 && (await props()).o === 7 && await out('value') === '17', '拖一根长条到十位、七个小方块到个位：17');
  await dragTo('c2', await outside());
  ok(await out('value') === '16' && await done('v'), '把一个小方块拖到板子外面：拿走，剩 16，里程碑完成');
  await dragTo('s2', await colMid(1));
  ok(await out('value') === '16', '把小方块拖到十位那一栏：放不进去（什么都不变）');

  console.log('2. 27 + 15');
  await open('bk-27-15');
  ok(await out('standard') === '0' && await p.evaluate(() => document.querySelector('.card svg.bdy').textContent.includes('超过 9')), '个位 12 个：标出“超过 9，要捆”');
  await dragTo('c2', await colMid(1));
  ok((await props()).t === 4 && (await props()).o === 2, '把个位的块往左拖到十位：十个捆成一个，4 个十、2 个一');
  ok(await out('value') === '42' && await out('standard') === '1' && await done('std'), '答案 42，里程碑完成');
  ok(await p.evaluate(() => document.querySelector('.card svg.bdy').textContent.includes('27 + 15 = 42')), '算式写出 27 + 15 = 42');
  await p.keyboard.press('Control+z'); await p.waitForTimeout(200);
  ok((await props()).t === 3 && (await props()).o === 12, '撤销一次：回到捆之前（一次拖动一步）');

  console.log('3. 不够十个捆不了');
  await open('bk-break-ten');
  await dragTo('c2', await colMid(1));
  ok((await props()).t === 5 && (await props()).o === 2, '个位只有 2 个，往左拖：什么都不变');

  console.log('4. 拆一个十');
  await dragTo('c1', await colMid(2));
  ok((await props()).t === 4 && (await props()).o === 12 && await done('o12'), '把十位的一根往右拖到个位：拆成十个，4 个十、12 个一');
  ok(await out('value') === '52', '数没变，还是 52');

  console.log('5. 加法里不能拿走');
  await dragTo('c2', await outside());
  ok((await props()).o === 12 && await out('value') === '52', '把块拖到板子外面：不会拿走（总数不变）');
  ok(await p.evaluate(() => !UI.S.inspOpen), '全程没有打开属性面板');
  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n计数块与数位测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close(); process.exit(fail ? 1 : 0);
})();
