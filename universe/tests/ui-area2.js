/* node tests/ui-area2.js —— 面积公式推导：真实鼠标测试。
 *  1. 平行四边形：高是 2，真实拖顶边到 4；拼好以前没有面积；剪下来、移到右边：24；
 *  2. 重来、拖左上角推斜，再剪拼：拼过 2 种斜度，面积都是 24；
 *  3. 三角形：再拿一个、转过来拼上：12；梯形：底 9、面积 18；
 *  4. 全程没有打开属性面板。 */
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
  const out = (port) => p.evaluate((port) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'areabench'), v = UI.S.D[e.id].out[port]; return v ? U.Q.show(v.data) : null; }, port);
  const props = () => p.evaluate(() => Object.assign({}, Object.values(UI.S.scene.entities).find((x) => x.type === 'areabench').props));
  const press = async (label) => { await closeDlg(); await p.locator('.card svg.bdy g[data-pick-set]').filter({ hasText: label }).first().click(); await p.waitForTimeout(150); };
  const read = () => p.evaluate(() => { const g = document.querySelector('.card svg.bdy [data-read]'); return g ? g.textContent : ''; });
  const done = (id) => p.evaluate((id) => !!(UI.S.run && UI.S.run.ms[id] && UI.S.run.ms[id].done), id);
  const toScreen = (x, y) => p.evaluate(([x, y]) => { const svg = document.querySelector('.card svg.bdy'), pt = svg.createSVGPoint(); pt.x = x; pt.y = y; const q = pt.matrixTransform(svg.getScreenCTM()); return [q.x, q.y]; }, [x, y]);
  const X = (u) => 40 + u * 22, Y = (v) => 290 - v * 22;
  const drag = async (from, to) => { await closeDlg(); const [x0, y0] = await toScreen(...from), [x1, y1] = await toScreen(...to); await p.mouse.move(x0, y0); await p.mouse.down(); await p.mouse.move((x0 + x1) / 2, (y0 + y1) / 2, { steps: 4 }); await p.mouse.move(x1, y1, { steps: 4 }); await p.mouse.up(); await p.waitForTimeout(200); };

  console.log('1. 平行四边形');
  await open('g4-parallelogram-core');
  await drag([X(2 + 3), Y(2)], [X(2 + 3), Y(4)]);
  ok((await props()).h === 4 && await out('area') === null, '真实拖顶边：高 4；还没拼，没有面积');
  await press('沿高剪下来'); await press('移到右边');
  ok(await out('area') === '24' && (await read()).includes('面积 = 底 × 高 = 6 × 4 = 24') && await done('area'), '剪下来、移到右边：拼成长方形，24');

  console.log('2. 推斜了再拼');
  await open('cut-invariant');
  await press('沿高剪下来'); await press('移到右边');
  await press('重来');
  await drag([X(1), Y(4)], [X(4), Y(4)]);
  ok((await props()).s === 4, '重来以后真实拖左上角：斜度 4');
  await press('沿高剪下来'); await press('移到右边');
  ok(await out('seen') === '2' && await out('area') === '24' && (await read()).includes('拼过 2 种斜度') && await done('keep'), '再剪拼：拼过 2 种斜度，面积都是 24');

  console.log('3. 三角形、梯形');
  await open('ar-triangle');
  await press('再拿一个一样的'); await press('转过来拼上');
  ok(await out('area') === '12' && (await read()).includes('底 × 高 ÷ 2 = 12') && await done('area'), '三角形：两个拼成平行四边形，12');
  await open('ar-trapezoid');
  await press('再拿一个一样的'); await press('转过来拼上');
  ok(await out('base') === '9' && await out('area') === '18' && await done('area'), '梯形：底 3 + 6 = 9，面积 18');
  ok(await p.evaluate(() => !UI.S.inspOpen), '全程没有打开属性面板');
  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n面积公式推导测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close(); process.exit(fail ? 1 : 0);
})();
