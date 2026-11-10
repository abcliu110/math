/* node tests/ui-digit2.js —— 竖式拖数字（D8 遗留，docs/direction.md 第 7 节 D8），真实鼠标。
 * (a) 每一列有自己的数字池（0–9），池在这一列的正下方（和格子对齐）；现在要写的那一列的池是「当前」；
 * (b) 减法 62 − 37（place-sub）：拖 5 进个位（没退位）被拒绝、说明要先退位，不记步骤；
 *     把「退位」拖到个位的格子上（一步，个位 12、十位 5）；拖错的 6 被拒绝，说明写的应该是个位数字，格子空着；
 *     拖到竖式外面松手：不写入，提示「松手」；拖 5 进个位：按下后移到格子上，格子亮起，松手才写（一步）；
 *     拖 2 进十位（一步），结果 25；
 * (c) 加法 47 + 38（自由台面）：拖 4 进个位被拒绝（7 + 8 = 15 写 5）；拖 5 进个位（一步）；
 *     十位要先进位：把「进位」拖到十位的格子上（一步）；拖 8 进十位（一步），结果 85；解出来；
 * (d) 步骤写在台面 scene.workbench 上，器材和连线数不变；页面没有错误。
 * 需要 playwright（NODE_PATH 指向它的 node_modules）。 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const url = 'file://' + path.join(__dirname, '..', 'index.html');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();

(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1440, height: 860 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(url); await p.waitForTimeout(300);

  const steps = () => p.evaluate(() => (UI.S.scene.workbench && UI.S.scene.workbench.steps ? UI.S.scene.workbench.steps.map((s) => s.rule) : []));
  const counts = () => p.evaluate(() => ({ n: Object.keys(UI.S.scene.entities).length, links: UI.S.scene.links.length }));
  const query = (c) => p.evaluate((c) => U.Judge.compile(c)(U.Judge.makeW(UI.S.scene, UI.S.D, {})), c);
  const text = (sel) => p.locator(sel).first().innerText().then(norm).catch(() => '');
  const msg = () => text('#insp .dg-msg');
  const now = () => text('#insp .dg-now');
  const cen = (box) => ({ x: box.x + box.width / 2, y: box.y + box.height / 2 });
  // 真实鼠标：从 from 按下，移到 to 松手（中间分 12 步移动，让拖动真的发生）
  const drag = async (from, to) => {
    const s = cen(await p.locator(from).first().boundingBox()), d = cen(await p.locator(to).first().boundingBox());
    await p.mouse.move(s.x, s.y); await p.mouse.down();
    await p.mouse.move(d.x, d.y, { steps: 12 }); await p.mouse.up(); await p.waitForTimeout(120);
  };
  const settle = async () => { await p.waitForTimeout(800); await p.evaluate(() => UI.Panels.closeDialog()); };

  console.log('(a) 每一列有自己的数字池，在列的正下方');
  await p.evaluate(() => UI.App.openProblem('place-sub', 'practice')); await p.waitForTimeout(150);
  ok((await p.locator('#insp.open .dg').count()) === 1, '竖式工作台自动打开');
  for (const c of [0, 1, 2]) {
    const digits = await p.$$eval('#insp [data-dg-pool="' + c + '"] [data-dg-digit]', (els) => els.map((e) => e.dataset.dgDigit));
    ok(digits.join('') === '0123456789', '第 ' + c + ' 列的数字池是 0–9（' + digits.join('') + '）');
  }
  {
    const pb = await p.locator('#insp [data-dg-pool="1"]').first().boundingBox().catch(() => null);
    const cb = await p.locator('#insp [data-dg-cell="1"]').first().boundingBox().catch(() => null);
    const pc = pb ? cen(pb) : { x: -999, y: -999 }, cc = cb ? cen(cb) : { x: 0, y: 0 };
    ok(pb && Math.abs(pc.x - cc.x) < 30 && pc.y > cc.y, '十位的数字池在十位格子的正下方（横向差 ' + Math.round(Math.abs(pc.x - cc.x)) + ' 像素）');
  }
  ok((await p.locator('#insp [data-dg-pool="0"].cur').count()) === 1, '现在要写的个位，它的数字池是「当前」');

  console.log('(b) 减法 62 − 37：拖数字和拖操作');
  await drag('#insp [data-dg-pool="0"] [data-dg-digit="5"]', '#insp [data-dg-cell="0"]');
  ok((await steps()).length === 0 && /退位/.test(await msg()), '个位不够减，拖 5 进去被拒绝，说明要先退位（' + (await msg()) + '）');
  await drag('#insp [data-dg-borrow="0"]', '#insp [data-dg-cell="0"]');
  ok((await steps()).join() === 'digit.borrow', '把「退位」拖到个位的格子上：一步（' + (await steps()).join() + '）');
  ok((await text('#insp [data-dg-top="0"]')) === '12' && (await text('#insp [data-dg-top="1"]')) === '5', '个位变成 12，十位变成 5');
  await drag('#insp [data-dg-pool="0"] [data-dg-digit="6"]', '#insp [data-dg-cell="0"]');
  ok((await steps()).length === 1 && /个位数字/.test(await msg()) && (await text('#insp [data-dg-cell="0"]')) === '', '拖错的 6 被拒绝，说明写的应该是个位数字（' + (await msg()) + '），格子空着');
  await drag('#insp [data-dg-pool="0"] [data-dg-digit="5"]', '#insp .dg-title');
  ok((await steps()).length === 1 && /松手/.test(await msg()), '拖到竖式外面松手：不写入，提示（' + (await msg()) + '）');
  // 拖动中：移到格子上，格子亮起；松手前不写入
  {
    const s = cen(await p.locator('#insp [data-dg-pool="0"] [data-dg-digit="5"]').first().boundingBox());
    const d = cen(await p.locator('#insp [data-dg-cell="0"]').first().boundingBox());
    await p.mouse.move(s.x, s.y); await p.mouse.down();
    await p.mouse.move(d.x, d.y, { steps: 10 });
    ok((await p.locator('#insp [data-dg-cell="0"].dg-over').count()) === 1 && (await steps()).length === 1, '拖到个位的格子上：格子亮起，还没写入');
    await p.mouse.up(); await p.waitForTimeout(120);
  }
  ok((await steps()).join() === 'digit.borrow,digit.write', '松手：写 5 进个位（一步，12 − 7 = 5）');
  await drag('#insp [data-dg-pool="1"] [data-dg-digit="2"]', '#insp [data-dg-cell="1"]');
  ok((await steps()).length === 3 && /结果 25/.test(await now()), '拖 2 进十位：一步，结果 25（' + (await now()) + '）');
  ok(await query({ digits: { solved: true, allKept: true } }), 'digits 查询（解出来、每步保持）为真');

  console.log('(c) 加法 47 + 38：拖数字，拖「进位」');
  await settle();
  await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); }); await p.waitForTimeout(100);
  const add = await p.evaluate(() => UI.App.act({ t: 'add', type: 'colbench', x: 300, y: 200, props: { a: 47, b: 38, op: 0 } }).id);
  await p.dblclick('.card[data-id="' + add + '"] .hd'); await p.waitForTimeout(150);
  ok(/47 \+ 38/.test(await text('#insp .dg-title')), '竖式是 47 + 38');
  await drag('#insp [data-dg-pool="0"] [data-dg-digit="4"]', '#insp [data-dg-cell="0"]');
  ok((await steps()).length === 0 && (await msg()).length > 0, '个位 7 + 8 写 4 被拒绝（' + (await msg()) + '）');
  await drag('#insp [data-dg-pool="0"] [data-dg-digit="5"]', '#insp [data-dg-cell="0"]');
  ok((await steps()).join() === 'digit.write', '拖 5 进个位：一步（台面上的步骤：' + (await steps()).join() + '，提示：' + (await msg()) + '）');
  await drag('#insp [data-dg-pool="1"] [data-dg-digit="8"]', '#insp [data-dg-cell="1"]');
  ok((await steps()).length === 1 && (await msg()).length > 0, '十位要先进位，拖 8 进去被拒绝（' + (await msg()) + '）');
  await drag('#insp [data-dg-carry="0"]', '#insp [data-dg-cell="1"]');
  ok((await steps()).join() === 'digit.write,digit.carry', '把「进位」拖到十位的格子上：一步');
  await drag('#insp [data-dg-pool="1"] [data-dg-digit="8"]', '#insp [data-dg-cell="1"]');
  ok((await steps()).length === 3 && /结果 85/.test(await now()) && (await query({ digits: { solved: true } })), '拖 8 进十位：一步，结果 85，解出来了');

  console.log('(d) 步骤写在台面上，器材和连线数不变');
  ok((await p.evaluate(() => UI.S.scene.workbench.steps.length)) === 3, '台面上的步骤是 3 步');
  const c0 = await counts();
  ok(c0.n === 1 && c0.links === 0, '台面上只有一台竖式，没有连线');

  ok(errs.length === 0, '没有页面错误和控制台错误' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n竖式拖数字测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.log('FAIL 测试异常：' + e.message); process.exit(1); });
