/* node tests/ui-steps.js —— 工作台的步骤写进台面（任务 I，next-steps.md §10.6），真实鼠标。
 * (a) 解 3x + 5 = 20：拖 5 过等号（移项）、点选右边两项合并、点「两边同除以 3」：每一步在台面上留下一条步骤记录
 *     （规则依次是 alg.move-term、alg.collect、alg.divide）写在台面的 scene.workbench 上，台面的器材和连线数不变；
 * (b) 判题器的 steps 查询在台面上读得到：用过移项且每步保持了不变量为真；没用过因式分解为假；
 * (c) 撤销到第 2 步：台面上只剩 2 步，除法的查询变假，移项还在；
 * (d) 因式分解（x² − 5x + 6 = 0）：两个根填错，说明相乘不等于原式、不记步骤；填对（2、3），记一条 alg.factor，
 *     方程变成 (x − 2)(x − 3) = 0，steps 查询「用过因式分解、每步保持」为真；
 * (e) 没有步骤的工作台，步骤图里写着「还没有步骤」；页面没有错误。
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

  // 台面上的步骤（scene.workbench.steps：规则，记在哪台工作台上）和判题查询
  const records = () => p.evaluate(() => { const wb = UI.S.scene.workbench; return wb ? wb.steps.map((s) => ({ rule: s.rule, host: wb.host })) : []; });
  const counts = () => p.evaluate(() => ({ n: Object.keys(UI.S.scene.entities).length, links: UI.S.scene.links.length }));
  const query = (c) => p.evaluate((c) => U.Judge.compile(c)(U.Judge.makeW(UI.S.scene, UI.S.D, {})), c);
  const now = () => p.locator('#insp .wb-now').innerText().then((s) => norm(s.replace('现在：', ''))).catch(() => '');
  const steps = () => p.locator('#insp .wb-step').count();
  const chip = (side, i) => p.locator('#insp [data-wb-term="' + side + ':' + i + '"]');

  console.log('工作台的步骤写进台面：解 3x + 5 = 20，真实鼠标');
  await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); }); await p.waitForTimeout(100);
  const ids = await p.evaluate(() => {
    const A = UI.App;
    const a = A.act({ t: 'add', type: 'algebra', x: 300, y: 180, props: { text: '3x+5' } }).id;
    const n = A.act({ t: 'add', type: 'num', x: 300, y: 400, props: { n: 20 } }).id;
    const q = A.act({ t: 'add', type: 'eqdesk', x: 640, y: 240, props: { by: 0 } }).id;
    const x = A.act({ t: 'add', type: 'exprbench', x: 640, y: 470 }).id;
    A.act({ t: 'link', from: a, to: q, toPort: 'L' });
    A.act({ t: 'link', from: n, to: q, toPort: 'R' });
    A.act({ t: 'link', from: q, to: x, fromPort: 'eq', toPort: 'e' });
    return { x };
  });
  await p.dblclick('.card[data-id="' + ids.x + '"] .hd'); await p.waitForTimeout(150);
  ok((await records()).length === 0, '开始时台面上没有步骤记录');

  // (a) 每做一步，台面上多一条步骤；台面的器材和连线数不变
  const c0 = await counts();
  await chip('lhs', 1).click(); await p.waitForTimeout(60);
  const src = await chip('lhs', 1).boundingBox(), dst = await p.locator('#insp .wb-side[data-wb-side="rhs"]').boundingBox();
  await p.mouse.move(src.x + src.width / 2, src.y + src.height / 2); await p.mouse.down();
  await p.mouse.move(dst.x + dst.width / 2, dst.y + dst.height / 2, { steps: 12 }); await p.mouse.up(); await p.waitForTimeout(120);
  ok(/^3x = 20 − 5$/.test(await now()), '拖 5 过等号：3x = 20 − 5（' + (await now()) + '）');
  let rs = await records();
  ok(rs.length === 1 && rs[0].rule === 'alg.move-term', '台面上多了一步：移项（' + rs.map((r) => r.rule).join('、') + '）');
  ok(rs.every((r) => r.host === ids.x), '步骤记在这台式子工作台上');
  const c1 = await counts();
  ok(c1.n === c0.n && c1.links === c0.links, '台面的器材和连线数不变（步骤不是器材）');

  await chip('rhs', 0).click(); await chip('rhs', 1).click(); await p.waitForTimeout(60);
  await p.click('#insp [data-wb-tool="collect"]'); await p.waitForTimeout(120);
  ok(/^3x = 15$/.test(await now()), '点选右边两项，合并：3x = 15（' + (await now()) + '）');
  ok((await records()).length === 2, '台面上 2 步');

  await p.click('#insp [data-wb-act="divide-coef"]'); await p.waitForTimeout(120);
  rs = await records();
  ok(/x = 5/.test(await p.locator('#insp .wb-sol').innerText().catch(() => '')), '两边同除以 3：解 x = 5');
  ok(rs.map((r) => r.rule).join() === 'alg.move-term,alg.collect,alg.divide', '三步，规则依次是移项、合并、两边同除');

  // (b) 判题的 steps 查询读得到台面上的记录
  ok(await query({ steps: { used: 'alg.move-term', allKept: true } }), 'steps 查询：用过移项，且每步都保持了不变量 → 真');
  ok(await query({ steps: { used: 'alg.divide' } }), 'steps 查询：用过两边同除 → 真');
  ok(!(await query({ steps: { used: 'alg.factor' } })), 'steps 查询：没用过因式分解 → 假');

  // (c) 撤销到第 2 步：台面上只剩 2 条记录，除法的查询变假
  await p.click('#insp [data-wb-undo="2"]'); await p.waitForTimeout(120);
  rs = await records();
  ok(rs.length === 2 && (await steps()) === 2, '撤销到第 2 步：台面上剩 2 步，历史剩 2 行');
  ok(!(await query({ steps: { used: 'alg.divide' } })) && (await query({ steps: { used: 'alg.move-term' } })), '撤销后：除法的查询为假，移项仍为真');

  // (d) 因式分解：x² − 5x + 6 = 0
  console.log('因式分解：x² − 5x + 6 = 0，两个根由输入框给');
  await p.evaluate(() => { UI.App.act({ t: 'clear' }); }); await p.waitForTimeout(100);
  const fx = await p.evaluate(() => {
    const A = UI.App;
    const a = A.act({ t: 'add', type: 'algebra', x: 300, y: 180, props: { text: 'x^2-5x+6' } }).id;
    const n = A.act({ t: 'add', type: 'num', x: 300, y: 400, props: { n: 0 } }).id;
    const q = A.act({ t: 'add', type: 'eqdesk', x: 640, y: 240, props: { by: 0 } }).id;
    const x = A.act({ t: 'add', type: 'exprbench', x: 640, y: 470 }).id;
    A.act({ t: 'link', from: a, to: q, toPort: 'L' });
    A.act({ t: 'link', from: n, to: q, toPort: 'R' });
    A.act({ t: 'link', from: q, to: x, fromPort: 'eq', toPort: 'e' });
    return { x };
  });
  await p.dblclick('.card[data-id="' + fx.x + '"] .hd'); await p.waitForTimeout(150);
  ok(/x² − 5x \+ 6 = 0/.test(await now()), '方程台接到工作台：' + (await now()));

  await p.fill('#insp input[data-wb-field="r1"]', '1'); await p.fill('#insp input[data-wb-field="r2"]', '3');
  await p.click('#insp [data-wb-rule="factor"]'); await p.waitForTimeout(120);
  ok(/不等于/.test(await p.locator('#insp .wb-msg').innerText().catch(() => '')), '根填 1、3：说明相乘不等于原式');
  ok((await records()).length === 0, '不对的根不记步骤');

  await p.fill('#insp input[data-wb-field="r1"]', '2'); await p.fill('#insp input[data-wb-field="r2"]', '3');
  await p.click('#insp [data-wb-rule="factor"]'); await p.waitForTimeout(120);
  ok(/^\(x − 2\)\(x − 3\) = 0$/.test(await now()), '根填 2、3：变成 (x − 2)(x − 3) = 0（' + (await now()) + '）');
  rs = await records();
  ok(rs.length === 1 && rs[0].rule === 'alg.factor', '台面上 1 步：因式分解');
  ok(await query({ steps: { used: 'alg.factor', allKept: true } }), 'steps 查询：用过因式分解，且保持了不变量 → 真');

  // (e) 没有记录的工作台：步骤图写着「还没有步骤」
  await p.evaluate(() => { UI.App.act({ t: 'clear' }); }); await p.waitForTimeout(100);
  const ex = await p.evaluate(() => {
    const A = UI.App;
    const a = A.act({ t: 'add', type: 'algebra', x: 300, y: 180, props: { text: '3x+5' } }).id;
    const n = A.act({ t: 'add', type: 'num', x: 300, y: 400, props: { n: 20 } }).id;
    const q = A.act({ t: 'add', type: 'eqdesk', x: 640, y: 240, props: { by: 0 } }).id;
    const x = A.act({ t: 'add', type: 'exprbench', x: 640, y: 470 }).id;
    A.act({ t: 'link', from: a, to: q, toPort: 'L' });
    A.act({ t: 'link', from: n, to: q, toPort: 'R' });
    A.act({ t: 'link', from: q, to: x, fromPort: 'eq', toPort: 'e' });
    return { x };
  });
  await p.dblclick('.card[data-id="' + ex.x + '"] .hd'); await p.waitForTimeout(150);
  await p.click('#insp [data-wb-graph]'); await p.waitForTimeout(120);
  ok(/还没有步骤/.test(await p.locator('#dlg .box').innerText()), '没有步骤记录时，步骤图写着「还没有步骤」');
  await p.click('#dlg-close'); await p.waitForTimeout(60);

  ok(errs.length === 0, '没有页面错误和控制台错误' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n工作台步骤写进台面测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.log('FAIL 测试异常：' + e.message); process.exit(1); });
