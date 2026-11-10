/* node tests/ui-arith.js —— 算术工作台（竖式，任务 H 第 4 步，next-steps.md §10.5.6），真实鼠标。
 * (a) 题目 workbench: 'arith'：器材架只列算术工作台声明过的器材（竖式工作台）；台面上有 47 + 38 的竖式；
 * (b) 竖式：从个位算起，一列一列点「算个位」「算十位」（只出现下一列的按钮）；
 *     7 + 8 = 15 写 5 进 1，4 + 3 + 1 = 8，得 85；每一步记在台面的 scene.workbench 上，器材和连线数不变；
 *     里程碑 result 通过；判题的 steps 查询为真；
 * (c) 撤销到第 1 步：结果消失，个位的数回到空的；重做到 85；
 * (d) 凑十（自由台面，8 + 5）：点「凑十」得到 8 + 2 + 3，个位 3 进 1，十位 1，得 13；
 * (e) 拆数（47 + 38）：点选 38，点「拆」得到 47 + 30 + 8，竖式 3 行，得 85；没点选时拆会提示先点选；
 * (f) 退位（52 − 27）：个位 2 − 7 不够减，借 1 当 10 写 5；十位 5 − 2 − 1 = 2，得 25；
 * (g) 页面没有错误。
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

  const cell = (name) => p.locator('#insp [data-ar-cell="' + name + '"]');
  const cellText = async (name) => norm(await cell(name).innerText().catch(() => '') ) ;
  const btn = (sel) => p.locator('#insp ' + sel);
  const now = () => p.locator('#insp .wb-now').innerText().then((s) => norm(s.replace('现在：', ''))).catch(() => '');
  const records = () => p.evaluate(() => { const wb = UI.S.scene.workbench; return wb ? wb.steps.map((s) => s.rule) : []; });
  const counts = () => p.evaluate(() => ({ n: Object.keys(UI.S.scene.entities).length, links: UI.S.scene.links.length }));
  const query = (c) => p.evaluate((c) => U.Judge.compile(c)(U.Judge.makeW(UI.S.scene, UI.S.D, {})), c);
  const sol = () => p.locator('#insp .wb-sol').innerText().catch(() => '');
  const logText = () => p.locator('#insp .wb-step').allInnerTexts().catch(() => []);
  const openCard = async (id) => { await p.dblclick('.card[data-id="' + id + '"] .hd'); await p.waitForTimeout(150); };
  const freeBench = (props) => p.evaluate((props) => {
    UI.App.openFree(); UI.App.act({ t: 'clear' });
    return UI.App.act({ t: 'add', type: 'arithbench', x: 300, y: 200, props }).id;
  }, props);

  console.log('算术工作台（竖式）：题目 workbench 为 arith，真实鼠标');
  // (a) 题目进入算术工作台：器材架只列它声明过的器材；台面上有竖式器材（47 + 38）
  await p.evaluate(() => UI.App.openProblem('arith-carry-47-38', 'practice')); await p.waitForTimeout(200);
  const shelf = await p.locator('#shelfbody .tile').evaluateAll((els) => els.map((el) => el.dataset.type));
  ok(shelf.length === 1 && shelf[0] === 'arithbench', '器材架只列竖式工作台（' + shelf.join('、') + '）');
  const bid = await p.evaluate(() => Object.values(UI.S.scene.entities).find((e) => e.type === 'arithbench').id);
  ok(!!bid, '台面上放着竖式器材');
  await openCard(bid);
  ok(/^47 \+ 38$/.test(await now()), '打开竖式：现在是 47 + 38（' + (await now()) + '）');
  ok((await btn('[data-ar-col="1"]').count()) === 0, '还没算个位，十位的按钮不出现（列要从个位算起）');

  // (b) 竖式：先算个位，再算十位
  const c0 = await counts();
  await btn('[data-ar-col="0"]').click(); await p.waitForTimeout(120);
  ok((await cellText('ans-0')) === '5', '个位写 5（' + (await cellText('ans-0')) + '）');
  ok((await cellText('carry-1')) === '1', '进位的 1 写在十位上方');
  ok(/个位：7 \+ 8 = 15，写 5，进 1/.test((await logText()).join('\n')), '步骤写着：个位：7 + 8 = 15，写 5，进 1');
  ok((await btn('[data-ar-col="1"]').count()) === 1, '个位算完，十位的按钮出现');
  await btn('[data-ar-col="1"]').click(); await p.waitForTimeout(120);
  ok((await cellText('ans-1')) === '8', '十位写 8（4 + 3 + 1）');
  ok(/^85$/.test(await sol().then((s) => norm(s.replace(/^结果：/, '')))), '结果：85（' + (await sol()) + '）');
  ok((await records()).join() === 'arith.column,arith.column', '台面上 2 步，都是竖式的一列');
  const c1 = await counts();
  ok(c1.n === c0.n && c1.links === c0.links, '台面的器材和连线数不变（步骤不是器材）');
  const done = await p.evaluate(() => !!(UI.S.run && UI.S.run.ms && UI.S.run.ms.result && UI.S.run.ms.result.done));
  ok(done, '里程碑「竖式算出 85」通过');
  await p.evaluate(() => UI.Panels.closeDialog()); await p.waitForTimeout(80);   // 通关的提示框挡住台面，关掉再继续（同一个学生的操作）
  ok(await query({ steps: { used: 'arith.column', allKept: true } }), 'steps 查询：用过竖式，且每步保持了不变量 → 真');

  // (c) 撤销到第 1 步：结果消失；重做到 85
  await btn('[data-ar-undo="1"]').click(); await p.waitForTimeout(120);
  ok((await records()).length === 1 && !(await sol()), '撤销到第 1 步：结果消失，台面上剩 1 步');
  ok((await cellText('ans-1')) === '', '撤销后十位的数也回到空的');
  await p.evaluate(() => UI.Panels.closeDialog()); await p.waitForTimeout(80);   // 通关的提示框在里程碑已达成后又会出现，先关掉
  await btn('[data-ar-col="1"]').click(); await p.waitForTimeout(120);
  ok(/^85$/.test(await sol().then((s) => norm(s.replace(/^结果：/, '')))), '重做十位：又得到 85');

  // (d) 凑十（自由台面，8 + 5）：凑十 → 8 + 2 + 3，个位 3 进 1，十位 1，得 13
  const cz = await freeBench({ a: 8, b: 5, op: 0 });
  await openCard(cz);
  ok(/^8 \+ 5$/.test(await now()), '自由台面的竖式：8 + 5');
  await btn('[data-ar-tool="make-ten"]').click(); await p.waitForTimeout(120);
  ok(/^8 \+ 2 \+ 3$/.test(await now()), '凑十：8 + 5 → 8 + 2 + 3（' + (await now()) + '）');
  await btn('[data-ar-col="0"]').click(); await p.waitForTimeout(120);
  ok((await cellText('ans-0')) === '3' && (await cellText('carry-1')) === '1', '个位 8 + 2 + 3 = 13，写 3 进 1');
  await btn('[data-ar-col="1"]').click(); await p.waitForTimeout(120);
  ok(/^13$/.test(await sol().then((s) => norm(s.replace(/^结果：/, '')))), '结果：13');
  ok(await query({ steps: { used: 'arith.make-ten', allKept: true } }), 'steps 查询：用过凑十，每步保持了不变量 → 真');

  // (e) 拆数（47 + 38）：没点选时提示先点选；点选 38，拆成 30 + 8
  const cs = await freeBench({ a: 47, b: 38, op: 0 });
  await openCard(cs);
  await btn('[data-ar-tool="split"]').click(); await p.waitForTimeout(120);
  ok(/点选|先/.test(await p.locator('#insp .wb-msg').innerText().catch(() => '')), '没点选要拆的数：提示先点选');
  ok((await records()).length === 0, '没有点选，不记步骤');
  await btn('[data-ar-term="1"]').click(); await p.waitForTimeout(60);
  ok(await btn('[data-ar-term="1"]').getAttribute('aria-pressed') === 'true', '点选 38（选中的数是按下的样子）');
  await btn('[data-ar-tool="split"]').click(); await p.waitForTimeout(120);
  ok(/^47 \+ 30 \+ 8$/.test(await now()), '拆 38 = 30 + 8：47 + 30 + 8（' + (await now()) + '）');
  await btn('[data-ar-col="0"]').click(); await p.waitForTimeout(60);
  await btn('[data-ar-col="1"]').click(); await p.waitForTimeout(60);
  ok(/^85$/.test(await sol().then((s) => norm(s.replace(/^结果：/, '')))), '三行竖式：个位 7 + 0 + 8 = 15，十位 4 + 3 + 1 = 8，得 85');
  ok((await records()).join() === 'arith.split,arith.column,arith.column', '台面上 3 步：拆数、两列');

  // (f) 退位（52 − 27）：个位 2 − 7 不够减，借 1 当 10 写 5；十位 5 − 2 − 1 = 2，得 25
  const cd = await freeBench({ a: 52, b: 27, op: 1 });
  await openCard(cd);
  ok(/^52 − 27$/.test(await now()), '自由台面的竖式：52 − 27');
  await btn('[data-ar-col="0"]').click(); await p.waitForTimeout(120);
  ok((await cellText('ans-0')) === '5' && (await cellText('carry-1')) === '1', '个位 2 − 7 不够减：写 5，十位借 1');
  ok(/借 1/.test((await logText()).join('\n')), '步骤写着借位');
  await btn('[data-ar-col="1"]').click(); await p.waitForTimeout(120);
  ok(/^25$/.test(await sol().then((s) => norm(s.replace(/^结果：/, '')))), '十位 5 − 2 − 1 = 2，得 25');

  ok(errs.length === 0, '没有页面错误和控制台错误' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n算术工作台测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.log('FAIL 测试异常：' + e.message); process.exit(1); });
