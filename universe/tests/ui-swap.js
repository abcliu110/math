/* node tests/ui-swap.js —— 换一换（鸡兔同笼）：真实鼠标测试。
 *  1. 8 个头 26 条腿：点一只鸡变成兔，腿数 16 → 18；再点同一个位置（现在是兔）变回鸡；撤销回到上一步；
 *  2. 一只一只点到 5 只兔：腿数正好 26，里程碑完成；右边的表记下试过的每一种；
 *  3. 换过头（6 只兔）：标出“多了 2”；
 *  4. 35 个头 94 条腿：拖把手到第 12 个后面，一次换 12 只，腿数 94；把手可以跨行拖；
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
  const props = () => p.evaluate(() => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'swapbench'); return Object.assign({}, e.props); });
  const out = (port) => p.evaluate((port) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'swapbench'), v = UI.S.D[e.id].out[port]; return v ? U.Q.show(v.data) : null; }, port);
  const closeDlg = () => p.evaluate(() => { if (UI.Panels.closeDialog) UI.Panels.closeDialog(); });
  // 点第 i 个头（从 0 数）
  const clickHead = async (i) => { await closeDlg(); await p.locator('.card svg.bdy [data-pick-set]').nth(i).click(); await p.waitForTimeout(150); };
  // 画布坐标在屏幕上的位置
  const at = (x, y) => p.evaluate(([x, y]) => { const sv = document.querySelector('.card svg.bdy'), r = sv.getBoundingClientRect(), k = r.width / +sv.getAttribute('width'); return { x: r.x + x * k, y: r.y + y * k }; }, [x, y]);
  const grip = () => p.evaluate(() => { const g = document.querySelector('.card svg.bdy [data-grip="k"]'), r = g.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
  const done = (id) => p.evaluate((id) => !!(UI.S.run && UI.S.run.ms[id] && UI.S.run.ms[id].done), id);
  const text = () => p.evaluate(() => document.querySelector('.card svg.bdy').textContent);

  console.log('1. 点一只换一只');
  await open('sw-8-26');
  ok(await out('total') === '16' && (await text()).includes('还差 10'), '全是鸡：16 条腿，还差 10');
  await clickHead(3);
  ok((await props()).k === 1 && await out('total') === '18', '点一只鸡：变成兔，腿数 18');
  await clickHead(0);
  ok((await props()).k === 0 && await out('total') === '16', '点那只兔：变回鸡，腿数 16');
  await p.keyboard.press('Control+z'); await p.waitForTimeout(200);
  ok((await props()).k === 1, '撤销一次：回到 1 只兔（一次点击一步）');

  console.log('2. 换到正好');
  for (let i = 0; i < 4; i++) await clickHead(7);
  ok((await props()).k === 5 && await out('ok') === '1', '再点 4 只鸡：5 只兔，腿数正好 26');
  ok(await done('hit') && await done('five') && (await text()).includes('正好'), '两个里程碑完成，写着“正好”');
  ok(Number(await out('tries')) >= 5, '右边的表记下了试过的每一种（' + await out('tries') + ' 种）');

  console.log('3. 换过头');
  await clickHead(7);
  ok((await props()).k === 6 && (await text()).includes('多了 2'), '6 只兔：28 条腿，标出“多了 2”');

  console.log('4. 拖把手');
  await open('g4-chicken-rabbit-core');
  ok(await out('total') === '70', '35 个头全是鸡：70 条腿');
  const g = await grip(), to = await at(24 + 2 * 38, 186 + 1 * 46 + 22);   // 第 2 行、第 2 个后面：10 + 2 = 12
  await closeDlg(); await p.mouse.move(g.x, g.y); await p.mouse.down(); await p.mouse.move((g.x + to.x) / 2, (g.y + to.y) / 2, { steps: 6 }); await p.mouse.move(to.x, to.y, { steps: 6 }); await p.mouse.up(); await p.waitForTimeout(250);
  ok((await props()).k === 12 && await out('total') === '94', '把手拖到第 2 行第 2 个后面：一次换 12 只，腿数 94');
  ok(await done('rabbit'), '里程碑完成：兔 12 只');
  await p.keyboard.press('Control+z'); await p.waitForTimeout(200);
  ok((await props()).k === 0, '撤销一次：回到全是鸡（一次拖动一步）');

  console.log('5. 天平、差距条、每个都少算');
  await open('sw-lift');
  ok((await text()).includes('现在 16') && (await text()).includes('目标 26') && await p.locator('.card svg.bdy [data-gap="5"]').count() === 1, '天平左边写“现在 16”、右边“目标 26”；还差的 10 条切成 5 段');
  {
    const g = await grip(), to = await at(24 + 3 * 38, 186 + 22);
    await closeDlg(); await p.mouse.move(g.x, g.y); await p.mouse.down(); await p.mouse.move((g.x + to.x) / 2, (g.y + to.y) / 2, { steps: 6 }); await p.mouse.move(to.x, to.y, { steps: 6 }); await p.waitForTimeout(120);
    ok(await p.locator('.card svg.bdy [data-chg]').count() === 3 && (await text()).includes('这一下换了 3 个') && (await text()).includes('3 × 2'), '把手拖过 3 个（还没松手）：这 3 个头上各写着 +2，下面写“这一下换了 3 个……3 × 2”');
    ok(await p.locator('.card svg.bdy [data-gap="2"]').count() === 1, '差距条跟着变：还剩 2 段');
    await p.mouse.up(); await p.waitForTimeout(250);
    ok((await props()).k === 3 && await p.locator('.card svg.bdy [data-chg]').count() === 0, '松手：3 只兔，头上的 +2 收起来');
  }
  await closeDlg(); await p.locator('.card svg.bdy [data-pick-set]', { hasText: '每个都少算' }).click(); await p.waitForTimeout(200);
  ok((await props()).lift === true && (await text()).includes('现在 6') && (await text()).includes('目标 10') && (await text()).includes('两边同时减去 8 × 2 = 16'), '点“每个都少算 2”：天平变成 现在 6、目标 10，写着“两边同时减去 8 × 2 = 16”');
  ok(await out('gap') === '4' && await done('lift') && await p.locator('.card svg.bdy [data-gap="2"]').count() === 1, '差的还是 4（2 段），歪的样子不变；里程碑完成');
  await clickHead(7); await clickHead(7);
  ok(await out('ok') === '1' && await done('hit') && (await text()).includes('两边一样重'), '再换 2 只：天平平了，兔 5 只');

  console.log('6. 写成两架天平');
  await open('sw-as-system'); await p.waitForTimeout(900); await closeDlg();
  const sbtn = async (text, nth) => { await closeDlg(); await p.locator('.card svg.bdy [data-pick-set]', { hasText: text }).nth(nth || 0).click(); await p.waitForTimeout(220); };
  const sgrip = (id) => p.evaluate((id) => { const g = document.querySelector('.card svg.bdy [data-grip="' + id + '"]'), r = g.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, id);
  const onto = async () => { await closeDlg(); const g = await sgrip('b0'), t = await sgrip('b1'); await p.mouse.move(g.x, g.y); await p.mouse.down(); await p.mouse.move((g.x + t.x) / 2 + 20, (g.y + t.y) / 2, { steps: 6 }); await p.mouse.move(t.x + 20, t.y + 30, { steps: 6 }); await p.waitForTimeout(100); const mid = await text(); await p.mouse.up(); await p.waitForTimeout(250); return mid; };
  await sbtn('写成两架天平');
  ok((await props()).view === 1 && (await props()).e0 === '1,1,0,0,0,8' && (await props()).e1 === '2,4,0,0,0,26' && await done('sys'), '点“写成两架天平”：上面 x + y = 8，下面 2x + 4y = 26');
  ok((await text()).includes('x + y = 8') && (await text()).includes('2x + 4y = 26') && (await text()).includes('圆盒 x：鸡的个数') && await p.locator('.card svg.bdy [data-grip^="b"]').count() === 2, '卡片变成两架天平，写着“圆盒 x：鸡的个数”，两架各有把手');
  const mid = await onto();
  ok(mid.includes('− (x + y)') && mid.includes('− 8') && (await props()).e1 === '1,3,0,0,0,18', '把上面的拖到下面（没松手时写着 − (x + y) 和 − 8）：下面变成 x + 3y = 18');
  await onto();
  ok((await props()).e1 === '0,2,0,0,0,10', '再拖一次：下面剩 2y = 10');
  await sbtn('平分成 2 份');
  ok(await out('sy') === '5' && await done('y') && (await text()).includes('回到换一换：兔 5 个'), '平分成 2 份：y = 5；右上角的按钮写着“回到换一换：兔 5 个”');
  await sbtn('回到换一换');
  ok((await props()).view === 0 && (await props()).k === 5 && await out('ok') === '1' && await done('back') && (await text()).includes('两边一样重'), '点“回到换一换”：兔 5 只带回来了，天平平了');
  await p.keyboard.press('Control+z'); await p.waitForTimeout(200);
  ok((await props()).view === 1 && (await props()).k === 0, '撤销一次：回到两架天平（一次点击一步）');
  await open('g4-chicken-rabbit-core');
  // 2026-11-28 起两架天平每盘 999 个砝码（增强 7 第二轮；以前 30 个，这里按钮是灰的）：35 个头、94 条腿也摆得下
  ok(await p.locator('.card svg.bdy [data-pick-set]', { hasText: '写成两架天平' }).count() === 1, '35 个头、94 条腿：两架天平放大了，按钮能点');
  await sbtn('写成两架天平');
  ok((await props()).view === 1 && await p.locator('.card svg.bdy [data-ten]').count() > 0, '写成两架天平：砝码 10 个一条画');
  ok(await p.evaluate(() => !UI.S.inspOpen), '全程没有打开属性面板');
  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n换一换测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close(); process.exit(fail ? 1 : 0);
})();
