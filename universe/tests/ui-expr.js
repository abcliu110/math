/* node tests/ui-expr.js —— 式子工作台（D5，docs/direction.md 第 7 节 D5）：只用真实鼠标解 3x + 5 = 20。
 * (a) 左右两边的项都是可以点选的，被选中的项有明显标记（class sel、aria-pressed）；
 * (b) 把左边的 5 拖过等号到右边松手：一步「移项」，变成 3x = 20 − 5；
 * (c) 点选右边两项，点「合并同类项」：一步，变成 3x = 15；
 * (d) 点「两边同除以 3」：一步，解出 x = 5，「解出来了」输出为真；
 * (e) 历史每一步有说明，撤销到第 2 步后只剩 2 行，解消失；
 * (f) 拖到左边（不过等号）不记步骤；页面没有错误。
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

  console.log('式子工作台：只用真实鼠标解 3x + 5 = 20');
  await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); }); await p.waitForTimeout(100);
  const ids = await p.evaluate(() => {
    const A = UI.App;
    const a = A.act({ t: 'add', type: 'algebra', x: 300, y: 180, props: { text: '3x+5' } }).id;
    const n = A.act({ t: 'add', type: 'num', x: 300, y: 400, props: { n: 20 } }).id;
    const q = A.act({ t: 'add', type: 'eqdesk', x: 640, y: 240, props: { by: 0 } }).id;   // 方程台：两边同时加 0，不改方程
    const x = A.act({ t: 'add', type: 'exprbench', x: 640, y: 470 }).id;
    A.act({ t: 'link', from: a, to: q, toPort: 'L' });
    A.act({ t: 'link', from: n, to: q, toPort: 'R' });
    A.act({ t: 'link', from: q, to: x, fromPort: 'eq', toPort: 'e' });
    return { x };
  });
  await p.dblclick('.card[data-id="' + ids.x + '"] .hd'); await p.waitForTimeout(150);

  const now = () => p.locator('#insp .wb-now').innerText().then((s) => s.replace('现在：', '')).catch(() => '');
  const steps = () => p.locator('#insp .wb-step').count();
  const chip = (side, i) => p.locator('#insp [data-wb-term="' + side + ':' + i + '"]');
  const sol = () => p.locator('#insp .wb-sol').innerText().catch(() => '');

  ok(/3x \+ 5 = 20/.test(norm(await now())), '方程台接到工作台：' + norm(await now()));
  ok(await p.locator('#insp .wb-side[data-wb-side="lhs"] .wb-chip').count() === 2, '左边的两项（3x、5）各是一个可以点的项');
  ok(await p.locator('#insp .wb-side[data-wb-side="rhs"] .wb-chip').count() === 1, '右边的一项（20）是一个可以点的项');

  // (a) 点选 5：有明显标记
  await chip('lhs', 1).click(); await p.waitForTimeout(80);
  const marked = await chip('lhs', 1).evaluate((el) => el.classList.contains('sel') && el.getAttribute('aria-pressed') === 'true');
  ok(marked, '点选 5：被选中的项有标记（class sel、aria-pressed）');
  await chip('lhs', 1).click(); await p.waitForTimeout(80);
  ok(!(await chip('lhs', 1).evaluate((el) => el.classList.contains('sel'))), '再点一次取消选中');
  await chip('lhs', 1).click(); await p.waitForTimeout(80);

  // (b) 拖过等号：从左边的 5 拖到右边松手，一步移项
  const src = await chip('lhs', 1).boundingBox(), dst = await p.locator('#insp .wb-side[data-wb-side="rhs"]').boundingBox();
  await p.mouse.move(src.x + src.width / 2, src.y + src.height / 2); await p.mouse.down();
  await p.mouse.move(dst.x + dst.width / 2, dst.y + dst.height / 2, { steps: 12 }); await p.mouse.up(); await p.waitForTimeout(120);
  ok(/^3x = 20 − 5$/.test(norm(await now())), '拖 5 过等号：变成 3x = 20 − 5（' + norm(await now()) + '）');
  ok((await steps()) === 1, '拖过等号是一步：历史 1 行');
  ok(/移项/.test(norm(await p.locator('#insp .wb-step').first().innerText().catch(() => ''))), '历史这一步写着「移项」');

  // (c) 点选右边两项（20 和 − 5），点合并
  await chip('rhs', 0).click(); await chip('rhs', 1).click(); await p.waitForTimeout(60);
  await p.click('#insp [data-wb-tool="collect"]'); await p.waitForTimeout(120);
  ok(/^3x = 15$/.test(norm(await now())), '点选右边两项后点「合并同类项」：3x = 15（' + norm(await now()) + '）');
  ok((await steps()) === 2, '合并是一步：历史 2 行');

  // (d) 两边同除以 3（一个按钮，不用打字）
  await p.click('#insp [data-wb-act="divide-coef"]'); await p.waitForTimeout(120);
  ok(/x = 5/.test(norm(await sol())), '点「两边同除以 3」：解 ' + norm(await sol()));
  ok((await steps()) === 3, '除法是一步：历史 3 行');
  ok(await p.evaluate((id) => UI.S.D[id].out.solved.data === true, ids.x), '工作台的「解出来了」输出为真');

  // (e) 每一步有说明；撤销到第 2 步
  const says = await p.locator('#insp .wb-step small').allInnerTexts();
  ok(says.length === 3 && says.every((t) => t.trim().length > 0), '历史每一步都有说明（' + says.length + ' 条）');
  await p.click('#insp [data-wb-undo="2"]'); await p.waitForTimeout(120);
  ok((await steps()) === 2 && (await p.locator('#insp .wb-sol').count()) === 0, '撤销到第 2 步：剩 2 行，解消失');
  ok(/^3x = 15$/.test(norm(await now())), '撤销后回到 3x = 15');

  // (f) 拖到左边（不过等号）不记步骤
  const s2 = await chip('lhs', 0).boundingBox(), l2 = await p.locator('#insp .wb-side[data-wb-side="lhs"]').boundingBox();
  await p.mouse.move(s2.x + s2.width / 2, s2.y + s2.height / 2); await p.mouse.down();
  await p.mouse.move(l2.x + l2.width / 2, l2.y + l2.height / 2 + 2, { steps: 8 }); await p.mouse.up(); await p.waitForTimeout(100);
  ok((await steps()) === 2, '拖到同一边（没有过等号）不记步骤');

  ok(errs.length === 0, '没有页面错误和控制台错误' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n式子工作台界面测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.log('FAIL 测试异常：' + e.message); process.exit(1); });
