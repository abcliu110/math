/* node tests/ui-layout.js —— 布局（U5，docs/ui-robustness.md 4.6 和第 5 节 U5 验收）。
 * 1280×800 和 900×700 两种视口（窗口缩小也要过）：工作区面板完全在视口和台面里，不压住底部浮动条，工作区卡片在台面上看得见；
 * 工作区放在屏幕右下角，台面缩放到 50% 和 200%，面板仍然在可视区里；freeSpot 避让用的是面板的实测高度。
 * 另有 UI.Layout.anchor 的纯函数检查（不需要浏览器里的布局）。
 * 需要 playwright（NODE_PATH 指向它的 node_modules）。 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const url = 'file://' + path.join(__dirname, '..', 'index.html');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(url); await p.waitForTimeout(300);
  await p.evaluate(() => UI.App.openProblem('geo-median-area', 'practice')); await p.waitForTimeout(300);

  // 量：台面、工作区卡片、它的面板、底部浮动条的屏幕矩形
  const measure = () => p.evaluate(() => {
    const r = (el) => { if (!el) return null; const q = el.getBoundingClientRect(); return { l: q.left, t: q.top, r: q.right, b: q.bottom, w: q.width, h: q.height }; };
    const ws = Object.values(UI.S.scene.entities).find((e) => U.types[e.type].workspace);
    return {
      ws: ws.id, stage: r(document.querySelector('#stage')), card: r(document.querySelector('.card[data-id="' + ws.id + '"]')),
      panel: r(document.querySelector('.wsx[data-ws="' + ws.id + '"]')),
      bars: ['#clockbar', '#zoom', '#fabr'].map((s) => r(document.querySelector(s))).filter((x) => x && x.h > 0),
      vw: innerWidth, vh: innerHeight,
    };
  });
  const inside = (a, c) => a.l >= c.l - 0.5 && a.r <= c.r + 0.5 && a.t >= c.t - 0.5 && a.b <= c.b + 0.5;
  const overlap = (a, c) => !(a.r <= c.l || a.l >= c.r || a.b <= c.t || a.t >= c.b);
  const check = async (label) => {
    const m = await measure();
    const viewport = { l: 0, t: 0, r: m.vw, b: m.vh };
    ok(!!m.panel && inside(m.panel, m.stage) && inside(m.panel, viewport), label + '：工作区面板完全在台面和视口里');
    ok(!!m.panel && m.bars.every((bb) => !overlap(m.panel, bb)), label + '：面板不压住底部的浮动条（缩放、时钟、为什么）');
    const cx = (m.card.l + m.card.r) / 2, cy = (m.card.t + m.card.b) / 2;
    ok(cx > m.stage.l && cx < m.stage.r && cy > m.stage.t && cy < m.stage.b, label + '：工作区卡片看得见（中心在台面里）');
    return m;
  };

  console.log('视口：1280×800');
  await check('1280×800，开局');

  console.log('视口：900×700（窗口缩小，不刷新）');
  await p.setViewportSize({ width: 900, height: 700 }); await p.waitForTimeout(200);
  await check('900×700，窗口缩小后');

  console.log('工作区放在屏幕右下角');
  await p.evaluate(() => {
    const S = UI.S, e = Object.values(S.scene.entities).find((x) => U.types[x.type].workspace);
    const B = UI.Layout.visibleBounds(document.querySelector('#stage'), S.view), g = UI.Stage.geom(e);
    e.x = B.x1 - g.w - 30; e.y = B.y1 - g.h - 30;
    UI.Stage.render();
  });
  await check('右下角');

  console.log('台面缩放：50% 和 200%（工作区居中）');
  for (const z of [0.5, 2]) {
    await p.evaluate((z) => {
      const S = UI.S, e = Object.values(S.scene.entities).find((x) => U.types[x.type].workspace);
      const g = UI.Stage.geom(e), st = document.querySelector('#stage').getBoundingClientRect();
      S.view = { z, x: st.width / 2 - (g.x + g.w / 2) * z, y: st.height / 2 - (g.y + g.h / 2) * z };
      UI.Stage.render();
    }, z);
    await check('台面 ' + Math.round(z * 100) + '%');
  }

  console.log('避让：找空位用的是面板的实测高度');
  const av = await p.evaluate(() => {
    const e = Object.values(UI.S.scene.entities).find((x) => U.types[x.type].workspace);
    const g = UI.Stage.geom(e), pr = UI.Layout.panelRect(e.id, g), dom = document.querySelector('.wsx[data-ws="' + e.id + '"]');
    const sz = U.types.num.size ? U.types.num.size({ props: {} }) : [150, 90];
    const sp = UI.Stage.freeSpot(pr.x + 10, pr.y + 10, 'num');   // 想放在面板里面：应该被挪到面板外面
    const P = 12;
    const hit = !(sp.x >= pr.x + pr.w + P || sp.x + sz[0] <= pr.x - P || sp.y >= pr.y + pr.h + P || sp.y + sz[1] <= pr.y - P);
    return { measured: pr.h === dom.offsetHeight, hit };
  });
  ok(av.measured, '避让区用的面板高度就是 DOM 实测高度');
  ok(!av.hit, 'freeSpot 把新卡片挪到了面板外面');

  console.log('纯函数 UI.Layout.anchor');
  const an = await p.evaluate(() => ({
    below: UI.Layout.anchor({ x: 0, y: 0, w: 100, h: 100 }, { w: 100, h: 50 }, { x0: -1000, y0: -1000, x1: 1000, y1: 1000 }, 36),
    right: UI.Layout.anchor({ x: 0, y: 0, w: 100, h: 100 }, { w: 100, h: 50 }, { x0: -1000, y0: -1000, x1: 1000, y1: 120 }, 36),
    none: UI.Layout.anchor({ x: 0, y: 0, w: 100, h: 100 }, { w: 100, h: 50 }, { x0: 0, y0: 0, x1: 150, y1: 120 }, 36),
  }));
  ok(an.below.side === 'below' && an.below.fits && an.below.y === 136, 'anchor：放得下就放在卡片下方（卡片底边加间距）');
  ok(an.right.side === 'right' && an.right.fits && an.right.x === 136, 'anchor：下方放不下就放右边');
  ok(!an.none.fits && an.none.x >= 0 && an.none.y >= 0 && an.none.x + 100 <= 150 && an.none.y + 50 <= 120, 'anchor：都放不下就夹进可视区');

  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  p.setViewportSize({ width: 1440, height: 860 }).catch(() => {});
  console.log('\n' + pass + ' 通过，' + fail + ' 失败');
  await b.close();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.log('布局测试异常：' + e.message); process.exit(1); });
