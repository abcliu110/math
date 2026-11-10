/* node tests/ui-bake.js —— 分步定型（bake，next-steps.md §10.5.6 第 5 步）：只用真实鼠标解 3x + 5 = 20，然后定型。
 * (a) 移项、两边同除以 3（两步）后，历史里出现「定型」按钮；
 * (b) 点「定型」：两步折成一个折叠（展开看得到两步，但没有撤销按钮），外面只剩一行「定型」；按钮消失（没有新步骤）；
 * (c) 台面（scene.workbench）里的步骤记下了定型前的两步和定型那一步，判题的步骤查询读得到；
 * (d) 「撤销定型」回到定型前：两步回来，解回来了，「定型」按钮回来；
 * (e) 页面没有错误。
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

  console.log('分步定型：只用真实鼠标解 3x + 5 = 20，然后定型');
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

  const now = () => p.locator('#insp .wb-now').innerText().then((s) => s.replace('现在：', '')).catch(() => '');
  const topSteps = () => p.locator('#insp .wb-step:not(.wb-folded)').count();
  const bakeBtn = () => p.locator('#insp [data-wb-bake]').count();
  const chip = (side, i) => p.locator('#insp [data-wb-term="' + side + ':' + i + '"]');
  const sol = () => p.locator('#insp .wb-sol').innerText().catch(() => '');

  // 先做两步：拖 5 过等号（移项），再点「两边同除以 3」
  const src = await chip('lhs', 1).boundingBox(), dst = await p.locator('#insp .wb-side[data-wb-side="rhs"]').boundingBox();
  await p.mouse.move(src.x + src.width / 2, src.y + src.height / 2); await p.mouse.down();
  await p.mouse.move(dst.x + dst.width / 2, dst.y + dst.height / 2, { steps: 12 }); await p.mouse.up(); await p.waitForTimeout(120);
  await p.click('#insp [data-wb-act="divide-coef"]'); await p.waitForTimeout(120);
  ok(/x = 5/.test(norm(await sol())), '两步后解出 x = 5（' + norm(await sol()) + '）');

  // (a) 有没有折叠的步骤时，历史里有「定型」按钮
  ok((await bakeBtn()) === 1, '有两步没有定型：历史里有「定型」按钮');
  ok((await p.locator('#insp .wb-bake').count()) === 0, '还没定型：没有定型那一行');

  // (b) 点定型：两步折成一个折叠，外面只剩定型那一行
  await p.click('#insp [data-wb-bake]'); await p.waitForTimeout(150);
  ok((await p.locator('#insp details.wb-fold').count()) === 1, '定型后：两步收在一个折叠里');
  ok((await p.locator('#insp .wb-fold .wb-folded').count()) === 2, '折叠里能看到定型前的两步（' + (await p.locator('#insp .wb-fold .wb-folded').count()) + ' 行）');
  ok((await p.locator('#insp .wb-fold [data-wb-undo]').count()) === 0, '折叠里的步骤没有撤销按钮（不能拆开撤销）');
  ok((await p.locator('#insp .wb-bake').count()) === 1, '外面只剩一行定型');
  ok((await topSteps()) === 1, '列表顶层只有 1 行（定型）');
  ok((await bakeBtn()) === 0, '没有新步骤：「定型」按钮不在');
  ok(/x = 5/.test(norm(await sol())) && /x = 5/.test(norm(await now())), '定型不改值：解还是 x = 5');

  // (c) 台面上记下了定型前的两步和定型那一步；判题的步骤查询读得到
  const rules = await p.evaluate(() => UI.S.scene.workbench.steps.map((s) => s.rule));
  ok(JSON.stringify(rules) === JSON.stringify(['alg.move-term', 'alg.divide', 'bake']), '台面（scene.workbench）：移项、两边同除、定型（' + rules.join(' / ') + '）');
  const judged = await p.evaluate(() => {
    const sc = UI.S.scene, D = U.World.evaluate(sc);
    return U.Judge.compile({ steps: { used: 'alg.move-term', allKept: true } })(U.Judge.makeW(sc, D, {}));
  });
  ok(judged === true, '判题的步骤查询：定型后仍能读到定型前用过的移项');

  // (d) 撤销定型：回到定型前，两步回来，定型按钮回来
  await p.click('#insp .wb-bake [data-wb-undo]'); await p.waitForTimeout(150);
  ok((await p.locator('#insp .wb-bake').count()) === 0 && (await topSteps()) === 2, '撤销定型：回到两步（顶层 ' + (await topSteps()) + ' 行）');
  ok((await p.locator('#insp .wb-step [data-wb-undo]').count()) === 2, '两步各自又有撤销按钮');
  ok(/x = 5/.test(norm(await sol())), '撤销定型后解回来了');
  ok((await bakeBtn()) === 1, '「定型」按钮回来了');

  ok(errs.length === 0, '没有页面错误和控制台错误' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n分步定型界面测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.log('FAIL 测试异常：' + e.message); process.exit(1); });
