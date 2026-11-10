/* node tests/ui-render.js —— 任务 J 遗留（next-steps.md §10.7）的界面部分，真实页面。
 * (a) 局部渲染：台面改一个器材，只重画它的卡片（UI.Stage.redrawCount() 是累计的重画节点数，这里数的是差）；
 *     改一个不连线的器材，其它卡片的 DOM 节点原封不动（打了标记的节点还是同一个）；没有改动时重画数为 0；
 * (b) 符号点画在坐标系上：y = x² − 4x + 1 的两个交点 2 ± √3 接进几何画板，画在 x 轴上，两点间距是 2√3 个单位；
 *     显示文字（2 + √3）仍保留在交点器材和画板的点旁边；系数改成 c = 3 以后，点跟着变成 1 和 3。
 * 需要 playwright（NODE_PATH 指向它的 node_modules）。 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const url = 'file://' + path.join(__dirname, '..', 'index.html');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(url); await p.waitForTimeout(300);
  await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); });

  // ---------- (a) 局部渲染 ----------
  const ids = await p.evaluate(() => {
    const out = [];
    for (let i = 0; i < 30; i++) out.push(UI.App.act({ t: 'add', type: 'num', x: 60 + (i % 6) * 150, y: 60 + Math.floor(i / 6) * 120, props: { n: i } }).id);
    return out;
  });
  const X = ids[0], Z = ids[7];   // 改 X，Z 是无关的器材（不连线）
  await p.evaluate((Z) => { document.querySelector('#world .card[data-id="' + Z + '"]').__mark = 1; }, Z);

  const idle = await p.evaluate(() => { const c0 = UI.Stage.redrawCount(); UI.App.refresh(false); return UI.Stage.redrawCount() - c0; });
  ok(idle === 0, '没有改动时重画数为 0（实测 ' + idle + '）');

  const one = await p.evaluate((X) => { const c0 = UI.Stage.redrawCount(); UI.App.act({ t: 'set', id: X, k: 'n', v: 77 }); return UI.Stage.redrawCount() - c0; }, X);
  ok(one === 1, '改一个器材的数：重画数为 1，只重画它自己的卡片（实测 ' + one + '，30 台器材）');
  const after = await p.evaluate(({ X, Z }) => ({
    kept: document.querySelector('#world .card[data-id="' + Z + '"]').__mark === 1,
    shows: document.querySelector('#world .card[data-id="' + X + '"]').textContent.includes('77'),
    cards: document.querySelectorAll('#world .card[data-id]').length,
  }), { X, Z });
  ok(after.kept, '无关的卡片的 DOM 节点没有换（标记还在）');
  ok(after.shows, '被改的卡片显示新的数（77）');
  ok(after.cards === 30, '卡片数不变（30）');

  const two = await p.evaluate(() => {
    const c0 = UI.Stage.redrawCount(); UI.App.act({ t: 'set', id: Object.keys(UI.S.scene.entities)[3], k: 'n', v: 5 });
    return UI.Stage.redrawCount() - c0;
  });
  ok(two === 1, '再改另一个器材：重画数也是 1（实测 ' + two + '）');

  // ---------- (b) 符号点画在坐标系上 ----------
  await p.evaluate(() => { UI.App.act({ t: 'clear' }); });
  const q = await p.evaluate(() => UI.App.act({ t: 'add', type: 'quad-xint', x: 60, y: 60, props: { a: 1, b: -4, c: 1 } }).id);
  const g = await p.evaluate(() => UI.App.act({ t: 'add', type: 'gboard', x: 420, y: 60, props: { range: 8, grid: true } }).id);
  await p.evaluate(({ q, g }) => {
    UI.App.act({ t: 'link', from: q, fromPort: 'p1', to: g, toPort: 'pts' });
    UI.App.act({ t: 'link', from: q, fromPort: 'p2', to: g, toPort: 'pts' });
  }, { q, g });
  await p.evaluate(() => UI.App.refresh(false));

  const read = (g) => p.evaluate((g) => {
    const card = document.querySelector('#world .card[data-id="' + g + '"]');
    const dots = [...card.querySelectorAll('circle[data-sp]')].map((c) => ({ sp: c.dataset.sp, cx: +c.getAttribute('cx'), cy: +c.getAttribute('cy') }));
    return { w: parseFloat(card.style.width), h: parseFloat(card.style.height), dots, text: card.textContent };
  }, g);
  const r1 = await read(g);
  ok(r1.dots.length === 2, '画板上画出两个符号点（实测 ' + r1.dots.length + ' 个）');
  const sps = r1.dots.map((d) => d.sp).sort();
  ok(sps.join('|') === '2 + √3|2 − √3', '两个点的文字是 2 + √3、2 − √3（实测 ' + sps.join('、') + '）');
  // 画板的比例：R = 8，画布 = 卡片减去边距，每单位像素 s = min(w, h) / (2R)
  // 卡片的画布高度要去掉标题栏（28 像素，LAYOUT.HD），和画板的画法一致
  const s = Math.min(r1.w - 8, r1.h - 28 - 8) / (2 * 8);
  const dx = Math.abs(r1.dots[0].cx - r1.dots[1].cx);
  ok(Math.abs(dx - 2 * Math.sqrt(3) * s) < 0.05, '两点间距 = 2√3 个单位（' + (2 * Math.sqrt(3) * s).toFixed(2) + ' 像素，实测 ' + dx.toFixed(2) + '）');
  ok(Math.abs(r1.dots[0].cy - r1.dots[1].cy) < 0.01, '两点都在 x 轴上（纵坐标相同）');
  const qText = await p.evaluate((q) => document.querySelector('#world .card[data-id="' + q + '"]').textContent, q);
  ok(qText.includes('2 + √3') && qText.includes('2 − √3'), '交点器材上的文字仍然显示 2 + √3、2 − √3');
  ok(r1.text.includes('2 + √3') && r1.text.includes('2 − √3'), '画板上每个点旁边写着精确的数');

  // 改系数：c = 3，两个交点变成 1 和 3（有理数，没有根式）
  await p.evaluate((q) => { UI.App.act({ t: 'set', id: q, k: 'c', v: 3 }); }, q);
  const r2 = await read(g);
  ok(r2.dots.map((d) => d.sp).sort().join('|') === '1|3', '改 c = 3 以后，画板上的点是 1 和 3（实测 ' + r2.dots.map((d) => d.sp).join('、') + '）');

  ok(errs.length === 0, '页面没有报错' + (errs.length ? '（' + errs[0] + '）' : ''));
  await b.close();
  console.log('\n' + pass + ' 通过，' + fail + ' 失败');
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.log('FAIL 异常：' + e.message); process.exit(1); });
