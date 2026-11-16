/* node tests/ui-venn.js —— 集合圈（重叠问题）：真实鼠标测试。
 *  1. 跳绳 8、踢毽 6、都参加 3：拖 3 个到中间、5 个到只跳绳、3 个到只踢毽；写出 8 + 6 = 14，中间的 3 人数了两次：14 − 3 = 11；托盘里剩 3 个；
 *  2. 拖到一半时写着“放到：两个圈重叠的地方”；撤销一次回去（一次拖动一步）；
 *  3. 分类（2 的倍数、3 的倍数）：把 6 拖到中间是对的；把 5 拖进左圈是错的，有红圈提示；再拖到圈外就对了；
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
  const props = () => p.evaluate(() => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'vennbench'); return Object.assign({}, e.props); });
  const out = (port) => p.evaluate((port) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'vennbench'), v = UI.S.D[e.id].out[port]; return v ? U.Q.show(v.data) : null; }, port);
  const grip = (id) => p.evaluate((id) => { const g = document.querySelector('.card svg.bdy [data-grip="' + id + '"]'); if (!g) return null; const r = g.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, id);
  // 区域 r 的第 k 个位置在屏幕上的哪里
  const slot = (r, k) => p.evaluate(([r, k]) => { const s = U.VennBench.SLOTS[r][k], sv = document.querySelector('.card svg.bdy'), b = sv.getBoundingClientRect(), z = b.width / +sv.getAttribute('width'); return { x: b.x + s.x * z, y: b.y + s.y * z }; }, [r, k]);
  const hold = async (a, c) => { await closeDlg(); await p.mouse.move(a.x, a.y); await p.mouse.down(); await p.mouse.move((a.x + c.x) / 2, (a.y + c.y) / 2, { steps: 5 }); await p.mouse.move(c.x, c.y, { steps: 5 }); await p.waitForTimeout(80); };
  const put = async (i, r, k) => { await hold(await grip('i' + i), await slot(r, k)); await p.mouse.up(); await p.waitForTimeout(160); };
  const done = (id) => p.evaluate((id) => !!(UI.S.run && UI.S.run.ms[id] && UI.S.run.ms[id].done), id);
  const text = () => p.evaluate(() => document.querySelector('.card svg.bdy').textContent);

  console.log('1. 重叠问题');
  await open('vn-8-6-3');
  ok(await p.locator('.card svg.bdy [data-grip]').count() === 14 && (await text()).includes('还没放的：14'), '托盘里 14 个人，每个都能拖');
  await hold(await grip('i0'), await slot(2, 0));
  ok((await text()).includes('放到：两个圈重叠的地方') && await p.locator('.card svg.bdy [data-carry]').count() === 1, '拖到中间（还没松手）：写着“放到：两个圈重叠的地方”');
  await p.mouse.up(); await p.waitForTimeout(160);
  ok(await out('both') === '1' && await out('inA') === '1' && await out('inB') === '1', '松手：中间 1 人，跳绳圈、踢毽圈里各算 1 人');
  await p.keyboard.press('Control+z'); await p.waitForTimeout(200);
  ok(await out('both') === '0' && (await props()).where.replace(/0/g, '') === '', '撤销一次：回到托盘（一次拖动一步）');
  for (let i = 0; i < 3; i++) await put(i, 2, i);
  ok(await out('both') === '3' && await done('both'), '拖 3 个到中间：里程碑完成');
  for (let i = 3; i < 8; i++) await put(i, 1, i - 3);
  ok(await out('inA') === '8' && await done('a'), '再拖 5 个到只跳绳：跳绳圈里 8 人');
  for (let i = 8; i < 11; i++) await put(i, 3, i - 8);
  ok(await out('inB') === '6' && await done('b') && await out('union') === '11', '再拖 3 个到只踢毽：踢毽圈里 6 人，两个圈一共圈住 11 人');
  ok((await text()).includes('8 + 6 = 14，中间的 3 人数了两次：14 − 3 = 11') && (await text()).includes('还没放的：3'), '写出“8 + 6 = 14，中间的 3 人数了两次：14 − 3 = 11”，托盘里剩 3 个');

  console.log('2. 分类：放错有红圈');
  await open('vn-sort-2-3');
  await put(5, 2, 0);
  ok(await out('right') === '1' && await out('wrong') === '0', '把 6 拖到中间：放对 1 个');
  await put(4, 1, 0);
  ok(await out('wrong') === '1' && (await text()).includes('放错 1 个') && await p.locator('.card svg.bdy circle[stroke="var(--bad)"]').count() === 1, '把 5 拖进“2 的倍数”：放错 1 个，有红圈');
  await put(4, 4, 0);
  ok(await out('wrong') === '0' && await out('out') === '1' && await out('right') === '2', '再把 5 拖到圈外：对了');
  ok(await p.evaluate(() => !UI.S.inspOpen), '全程没有打开属性面板');
  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n集合圈测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close(); process.exit(fail ? 1 : 0);
})();
