/* node tests/ui-timeline.js —— 时间条与动画（next-steps.md §10.5.9 第 7 条），真实鼠标和键盘。
 * 式子工作台（3x + 5 = 20）做两步：移项、合并，步骤历史写在台面上。
 * (a) 时间条出现在步骤历史上方，最大值等于步骤数；拖动它只读预览第 0 步：现在显示起点，历史（台面的步骤数）不变；
 * (b) 松手后出现两个选择：「回到当前步」和「停在第 k 步」；预览时编辑按钮隐藏（只读）；
 * (c) 回到当前步：显示回原来的式子，历史不变；键盘也能拨时间条；
 * (d) 停在第 1 步：历史真的撤掉之后的步骤（台面上 1 步），时间条重新对齐；
 * (e) 动画：新增一步时，「现在」的过渡时长在 0 到 300 毫秒之间；菜单里关掉动画后，过渡时长为 0；再打开恢复；
 * (f) 没有步骤时没有时间条；页面没有错误。
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

  const histLen = () => p.evaluate(() => { const wb = UI.S.scene.workbench; return wb ? wb.steps.length : 0; });
  const counts = () => p.evaluate(() => ({ n: Object.keys(UI.S.scene.entities).length, links: UI.S.scene.links.length }));
  const now = () => p.locator('#insp .wb-now').innerText().then((s) => norm(s.replace('现在：', ''))).catch(() => '');
  const slider = () => p.locator('#insp input[data-wb-tl]');
  const sliderVal = () => slider().evaluate((el) => +el.value).catch(() => -1);
  const sliderMax = () => slider().evaluate((el) => +el.max).catch(() => -1);
  const chip = (side, i) => p.locator('#insp [data-wb-term="' + side + ':' + i + '"]');
  const visible = (sel) => p.locator(sel).first().isVisible().catch(() => false);

  console.log('时间条与动画：3x + 5 = 20 做两步，真实鼠标');
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
  ok((await slider().count()) === 0, '没有步骤时，没有时间条');

  // 第 1 步：拖 5 过等号（移项）；第 2 步：点选右边两项合并
  const src = await chip('lhs', 1).boundingBox(), dst = await p.locator('#insp .wb-side[data-wb-side="rhs"]').boundingBox();
  await p.mouse.move(src.x + src.width / 2, src.y + src.height / 2); await p.mouse.down();
  await p.mouse.move(dst.x + dst.width / 2, dst.y + dst.height / 2, { steps: 12 }); await p.mouse.up(); await p.waitForTimeout(120);
  await chip('rhs', 0).click(); await chip('rhs', 1).click(); await p.waitForTimeout(60);
  await p.click('#insp [data-wb-tool="collect"]'); await p.waitForTimeout(150);
  ok(/^3x = 15$/.test(await now()) && (await histLen()) === 2, '两步做完：3x = 15，历史 2 步（' + (await now()) + '）');

  // (a) 时间条：最大值是 2，在最右边；拖到最左边只读预览第 0 步
  ok((await sliderMax()) === 2 && (await sliderVal()) === 2, '时间条出现：最大值 2，位置在最右（当前步）');
  const c0 = await counts();
  const bx = await slider().boundingBox();
  await p.mouse.move(bx.x + bx.width - 6, bx.y + bx.height / 2); await p.mouse.down();
  await p.mouse.move(bx.x + 2, bx.y + bx.height / 2, { steps: 10 }); await p.waitForTimeout(60);
  ok((await sliderVal()) === 0, '拖动时间条到最左：值为 0（' + (await sliderVal()) + '）');
  ok(/3x\s*\+\s*5\s*=\s*20/.test(await now()), '只读预览第 0 步：现在显示起点（' + (await now()) + '）');
  ok((await histLen()) === 2 && (await p.locator('#insp .wb-step').count()) === 2, '预览时历史没变：台面上仍是 2 步，历史列表仍是 2 行');
  const c1 = await counts();
  ok(c1.n === c0.n && c1.links === c0.links, '预览时台面的器材和连线数不变');
  ok(!(await visible('#insp [data-wb-tool="collect"]')), '预览时编辑按钮隐藏（只读）');
  await p.mouse.up(); await p.waitForTimeout(120);

  // (b) 松手后出现两个选择
  ok((await visible('#insp [data-wb-tl-back]')) && (await visible('#insp [data-wb-tl-stop]')), '松手后出现「回到当前步」和「停在第 0 步」两个选择');
  ok(/停在第 0 步/.test(await p.locator('#insp [data-wb-tl-stop]').innerText()), '停在所选步的按钮写明步数');

  // (c) 回到当前步：显示回原来的式子，历史不变
  await p.click('#insp [data-wb-tl-back]'); await p.waitForTimeout(120);
  ok(/^3x = 15$/.test(await now()) && (await sliderVal()) === 2, '回到当前步：显示 3x = 15，时间条回到最右');
  ok((await histLen()) === 2, '回到当前步：历史仍是 2 步');
  ok(await visible('#insp [data-wb-tool="collect"]'), '回到当前步：编辑按钮恢复');

  // 键盘也能拨时间条：左箭头预览第 1 步
  await slider().focus(); await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(60);
  ok((await sliderVal()) === 1 && /3x\s*=\s*20\s*−\s*5/.test(await now()), '键盘左箭头：预览第 1 步（' + (await now()) + '）');
  await p.click('#insp [data-wb-tl-back]'); await p.waitForTimeout(120);

  // (d) 停在第 1 步：之后的步骤撤掉（历史真的变了）
  await slider().evaluate((el) => { el.value = '1'; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); });
  await p.waitForTimeout(60);
  await p.click('#insp [data-wb-tl-stop]'); await p.waitForTimeout(150);
  ok((await histLen()) === 1, '停在第 1 步：台面上只剩 1 步');
  ok(/3x\s*=\s*20\s*−\s*5/.test(await now()) && (await sliderMax()) === 1, '停在第 1 步：显示 3x = 20 − 5，时间条最大值变成 1');

  // (e) 动画：新增一步（两边同除以 3），过渡时长在 0 到 300 毫秒之间；关掉后为 0；再打开恢复
  const dur = () => p.locator('#insp .wb-now').evaluate((el) => {
    const d = getComputedStyle(el).transitionDuration.split(',').map((x) => (/ms$/.test(x.trim()) ? parseFloat(x) : parseFloat(x) * 1000));
    return Math.max(0, ...d);
  }).catch(() => -1);
  await p.click('#insp [data-wb-act="divide-coef"]'); await p.waitForTimeout(150);
  ok((await histLen()) === 2, '两边同除以 3：新增一步，历史 2 步');
  const d1 = await dur();
  ok(d1 > 0 && d1 <= 300, '动画：过渡时长在 0 到 300 毫秒之间（' + d1 + ' 毫秒）');
  await p.click('#menubtn'); await p.waitForTimeout(60);
  await p.click('#animbtn'); await p.waitForTimeout(60);
  const d2 = await dur();
  ok(d2 === 0 && (await p.evaluate(() => document.documentElement.getAttribute('data-anim'))) === 'off', '菜单里关掉动画：过渡时长为 0（' + d2 + ' 毫秒）');
  await p.click('#menubtn'); await p.waitForTimeout(60);
  await p.click('#animbtn'); await p.waitForTimeout(60);
  const d3 = await dur();
  ok(d3 > 0 && d3 <= 300, '再打开动画：过渡时长恢复（' + d3 + ' 毫秒）');
  await p.evaluate(() => { try { localStorage.removeItem('universe.anim'); } catch (e) { /* 存储不可用 */ } });

  // (f) 页面没有错误
  ok(errs.length === 0, '没有页面错误和控制台错误' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n时间条与动画测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.log('FAIL 测试异常：' + e.message); process.exit(1); });
