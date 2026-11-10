/* node tests/ui-cross.js —— 跨工作台连接（D7，docs/direction.md 第 7 节 D7）：几何的面积接进式子工作台，写出 S = a × h。
 * 示例题：一个长 6、宽 4 的长方形（几何台面），面积读数接进式子工作台（S 从几何来），公式 a×h 从代数式卡接进来。
 * (a) 几何台面：面积读数器材输出 24（面积，dim 为 area）；
 * (b) 只接了几何的面积时，式子工作台写着「S = ?」，历史为空，还没有解；
 * (c) 再接上公式 a×h：式子工作台写着 S = a·h，两边的项可以点；
 * (d) 真实鼠标：在「代入」输入框写 a=6，点「代入」：S = 6h，历史 1 步；再写 h=4 代入：S = 24，历史 2 步；
 * (e) S = 24，写着「解：S = 24」，「解出来了」输出为真，与几何台面的面积一致；
 * (f) 撤销到第 1 步：式子回到 S = 6h，解消失；
 * (g) 写一个式子里没有的字母（z=3）：说明原因，历史不变；
 * (h) 页面没有错误。
 * 需要 playwright（NODE_PATH 指向它的 node_modules）。 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const url = 'file://' + path.join(__dirname, '..', 'index.html');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();

(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(url); await p.waitForTimeout(300);

  console.log('跨工作台：几何的面积接进式子工作台，写出 S = a × h，代入后得到 S 的数值');
  await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); }); await p.waitForTimeout(100);

  // 搭场景：几何台面上的长方形 (0,0)(6,0)(6,4)(0,4)，接到面积读数；面积读数接到式子工作台的「几何来的面积」口；
  // 公式 a×h 从代数式卡接到「公式」口。先只接几何的面积，看到 S = ?，再接公式。
  const ids = await p.evaluate(() => {
    const A = UI.App;
    const pt = (x, y, X, Y) => A.act({ t: 'add', type: 'gpt', x: X, y: Y, props: { x, y } }).id;
    const pts = [pt(0, 0, 60, 60), pt(6, 0, 260, 60), pt(6, 4, 260, 240), pt(0, 4, 60, 240)];
    const poly = A.act({ t: 'add', type: 'gpoly', x: 420, y: 80 }).id;
    pts.forEach((id) => A.act({ t: 'link', from: id, fromPort: 'p', to: poly, toPort: 'pts' }));
    const area = A.act({ t: 'add', type: 'garea', x: 420, y: 330 }).id;
    A.act({ t: 'link', from: poly, fromPort: 'f', to: area, toPort: 'f' });
    const x = A.act({ t: 'add', type: 'exprbench', x: 760, y: 470 }).id;
    A.act({ t: 'link', from: area, fromPort: 's', to: x, toPort: 'g' });
    const f = A.act({ t: 'add', type: 'algebra', x: 760, y: 240, props: { text: 'ah' } }).id;
    UI.Stage.fit(); UI.Stage.render();
    return { area, x, f, poly };
  });

  // (a) 几何台面：面积读数是 24，单位是面积
  const area = await p.evaluate((id) => {
    const d = UI.S.D[id]; const v = d && d.out && d.out.s;
    return v ? { s: String(v.data.n) + '/' + String(v.data.d), dim: v.dim } : null;
  }, ids.area);
  ok(area && area.s === '24/1' && area.dim === 'area', '几何台面：面积读数输出 24（dim 为 area）（' + JSON.stringify(area) + '）');

  await p.dblclick('.card[data-id="' + ids.x + '"] .hd'); await p.waitForTimeout(150);
  const now = () => p.locator('#insp .wb-now').innerText().then((s) => norm(s.replace('现在：', ''))).catch(() => '');
  const steps = () => p.locator('#insp .wb-step').count();
  const sol = () => p.locator('#insp .wb-sol').innerText().then(norm).catch(() => '');
  const msg = () => p.locator('#insp .wb-msg').innerText().then(norm).catch(() => '');
  const sub = () => p.locator('#insp [data-wb-field="sub"]');

  // (b) 只接了几何的面积：S = ?，没有步骤，没有解
  ok(/^S = \?$/.test(await now()), '只接几何的面积：式子工作台写着「S = ?」（' + (await now()) + '）');
  ok((await steps()) === 0 && (await sol()) === '', '只接几何的面积：历史为空，还没有解');

  // (c) 接上公式 a×h：S = a·h，两边的项可以点
  await p.evaluate((ids) => { UI.App.act({ t: 'link', from: ids.f, fromPort: 'p', to: ids.x, toPort: 'f' }); }, ids);
  await p.waitForTimeout(120);
  ok(/^S = a·h$|^S = ah$/.test(await now()), '接上公式 a×h：式子工作台写着 S = a·h（' + (await now()) + '）');
  ok((await p.locator('#insp .wb-side[data-wb-side="rhs"] .wb-chip').count()) === 1, '右边是一项（a·h），是一个可以点的项');

  // (d) 真实鼠标：代入 a = 6，再代入 h = 4
  await sub().click(); await sub().fill('a=6');
  await p.click('#insp [data-wb-tool="substitute"]'); await p.waitForTimeout(120);
  ok(/^S = 6h$|^S = 6·h$/.test(await now()), '代入 a = 6：S = 6h（' + (await now()) + '）');
  ok((await steps()) === 1, '代入是一步：历史 1 行');
  await sub().click(); await sub().fill('h=4');
  await p.click('#insp [data-wb-tool="substitute"]'); await p.waitForTimeout(120);
  // (e) 代入 h = 4：两边都是数，S = 24，解出来了，和几何台面的面积一致
  ok(/^S = 24$/.test(await now()), '代入 h = 4：S = 24（' + (await now()) + '）');
  ok(/解：S = 24/.test(await sol()), '写着「解：S = 24」（' + (await sol()) + '）');
  ok((await steps()) === 2, '两次代入，历史 2 行');
  ok(await p.evaluate((id) => UI.S.D[id].out.solved.data === true, ids.x), '工作台的「解出来了」输出为真');
  ok(/几何台面的面积是 24/.test(await p.locator('#insp').innerText()), '检查器里写着「几何台面的面积是 24」，与 S 一致');

  // (f) 撤销到第 1 步：回到 S = 6h，解消失
  await p.click('#insp [data-wb-undo="1"]'); await p.waitForTimeout(120);
  ok(/^S = 6h$|^S = 6·h$/.test(await now()) && (await steps()) === 1 && (await sol()) === '', '撤销到第 1 步：回到 S = 6h，解消失');

  // (g) 式子里没有的字母：说明原因，历史不变
  await sub().click(); await sub().fill('z=3');
  await p.click('#insp [data-wb-tool="substitute"]'); await p.waitForTimeout(120);
  ok((await steps()) === 1 && /没有|不在|字母/.test(await msg()), '代入式子里没有的字母 z：说明原因，历史不变（' + (await msg()) + '）');

  ok(errs.length === 0, '没有页面错误和控制台错误' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n跨工作台界面测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.log('FAIL 测试异常：' + e.message); process.exit(1); });
