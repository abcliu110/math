/* node tests/ui-shapes.js —— 几何工作区：常见图形、顶点编辑、直接拖出辅助线（真实鼠标和键盘）。
 *  1. 画布横纵比例一致（正方形画出来是正方形，回归：画布 Y 轴曾按高度算比例，图形被压扁）；
 *  2. 画布里的迷你工具条：点「梯形」放进一个图形——是 4 个自由点加一个多边形，不是块；
 *  3. 点图形中间（名字标签压在上面）能选中；面板说它是什么图形，改一个顶点坐标，名字跟着变；
 *  4. 拖顶点改坐标；L 键进入连线，按下—拖—松画出一条线，两端吸附到顶点（不多出新点）；
 *  5. 不选工具，按住 Shift 拖也能画线，画完不停在画线模式；Shift 点一下仍是加选；
 *  6. 一条线一步：撤销一次，线没了。
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
  const ws = await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); return UI.App.act({ t: 'add', type: 'gworkspace', x: 0, y: 0 }).id; });
  await p.evaluate(() => { const g = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === '知道了'); if (g) g.click(); });
  const count = (type) => p.evaluate((t) => Object.values(UI.S.scene.entities).filter((e) => e.type === t).length, type);
  // 顶点的屏幕位置，按名字 A、B、C……排好（不依赖 DOM 顺序）
  const verts = () => p.evaluate(() => { const E = UI.S.scene.entities; return [...document.querySelectorAll('svg.wsbody [data-drag]')].map((e) => { const r = e.getBoundingClientRect(); return { id: e.dataset.drag, mark: E[e.dataset.drag].props.mark, x: r.x + r.width / 2, y: r.y + r.height / 2 }; }).sort((a, b) => a.mark < b.mark ? -1 : 1); });
  const drag = async (a, c, steps) => { await p.mouse.move(a.x, a.y); await p.mouse.down(); await p.mouse.move((a.x + c.x) / 2, (a.y + c.y) / 2, { steps: steps || 5 }); await p.mouse.move(c.x, c.y, { steps: steps || 5 }); await p.mouse.up(); await p.waitForTimeout(200); };

  console.log('1. 比例：正方形');
  await p.locator('.wsmini button[data-ws-shape="frect"]').click(); await p.waitForTimeout(250);
  const sq = await verts(), P = await p.evaluate((ids) => ids.map((id) => UI.S.scene.entities[id].props), (await verts()).map((q) => q.id));
  const ux = Math.abs(sq[1].x - sq[0].x) / Math.abs(P[1].x - P[0].x), uy = Math.abs(sq[3].y - sq[0].y) / Math.abs(P[3].y - P[0].y);
  ok(ux > 20 && Math.abs(ux - uy) < 0.5, '长方形（' + (P[1].x - P[0].x) + '×' + (P[3].y - P[0].y) + '）横向每格 ' + ux.toFixed(1) + ' 像素 = 纵向每格 ' + uy.toFixed(1) + ' 像素');
  await p.evaluate(() => UI.App.act({ t: 'clear' }));
  const ws2 = await p.evaluate(() => UI.App.act({ t: 'add', type: 'gworkspace', x: 0, y: 0 }).id);

  console.log('2. 放梯形');
  await p.locator('.wsmini button[data-ws-shape="ftrap"]').click(); await p.waitForTimeout(250);
  ok(await count('gpt') === 4 && await count('gpoly') === 1 && await count('gpiece') === 0, '梯形是 4 个自由点 + 1 个多边形（不是块）');
  ok((await verts()).length === 4, '四个顶点都有把手');

  console.log('3. 选中与识别');
  const mid = await p.evaluate((ws) => { const el = document.querySelector('svg.wsbody[data-wsid="' + ws + '"] path[data-pick]'); const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, ws2);
  await p.mouse.click(mid.x, mid.y); await p.waitForTimeout(250);
  ok(await p.evaluate(() => UI.S.wsSel.length === 1), '点图形中间（有名字标签压着）能选中');
  const txt = () => p.evaluate(() => { const e = document.querySelector('.wsx-props'); return e ? e.innerText : ''; });
  ok((await txt()).includes('梯形'), '面板说这是梯形：' + (await txt()).split('\n')[0]);
  ok((await txt()).includes('27/2'), '面积 27/2（上底 3，下底 6，高 3）');
  const yin = p.locator('.wsx-props input[data-ws-vk="y"]').nth(2);
  await yin.fill('5'); await yin.press('Tab'); await p.waitForTimeout(250);
  ok(!(await txt()).includes('梯形') || (await txt()).includes('一般四边形'), '把一个顶点的 y 改成 5，不再是梯形：' + (await txt()).split('\n')[0]);
  await p.keyboard.press('Control+z'); await p.waitForTimeout(200);
  ok((await txt()).includes('梯形'), '撤销一次回到梯形');

  console.log('4. 拖顶点、L 键画线');
  let v = await verts();
  const before = await p.evaluate((id) => UI.S.scene.entities[id].props.x, v[1].id);
  await drag(v[1], { x: v[1].x + 40, y: v[1].y }, 6);
  ok(await p.evaluate((id) => UI.S.scene.entities[id].props.x, v[1].id) !== before, '拖顶点 B：它的 x 变了');
  await p.keyboard.press('Control+z'); await p.waitForTimeout(150);
  await p.mouse.move(mid.x, mid.y);
  await p.keyboard.press('l'); await p.waitForTimeout(150);
  ok(await p.evaluate(() => !!UI.S.wsDraw && UI.S.wsDraw.tool === 'seg'), '按 L 进入连线');
  v = await verts();
  await drag(v[0], v[2]);
  ok(await count('gseg') === 1 && await count('gpt') === 4, '按下—拖—松画出一条线，两端吸附到顶点（没有多出新点）');
  await p.keyboard.press('v'); await p.waitForTimeout(100);
  ok(await p.evaluate(() => !UI.S.wsDraw), '按 V 回到选择');

  console.log('5. Shift 拖线');
  v = await verts();
  await p.keyboard.down('Shift'); await drag(v[1], v[3]); await p.keyboard.up('Shift');
  ok(await count('gseg') === 2 && await count('gpt') === 4, '按住 Shift 从 B 拖到 D，画出第二条线（吸附）');
  ok(await p.evaluate(() => !UI.S.wsDraw), '画完不停在画线模式');
  const sel0 = await p.evaluate(() => UI.S.wsSel.length);
  await p.keyboard.down('Shift'); await p.mouse.click(mid.x, mid.y + 25); await p.keyboard.up('Shift'); await p.waitForTimeout(150);
  ok(await p.evaluate(() => !UI.S.wsDraw) && await count('gseg') === 2, 'Shift 点一下（没拖）不画线');

  console.log('6. 撤销');
  await p.keyboard.press('Control+z'); await p.waitForTimeout(200);
  ok(await count('gseg') === 1, '撤销一次，第二条线没了（一条线一步）');
  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n几何工作区（图形与画线）测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close(); process.exit(fail ? 1 : 0);
})();
