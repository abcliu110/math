/* node tests/ui-perf.js —— 性能测试（V10，docs/ui-geometry-feedback.md 2.15）。
 * 真实页面：几何工作区里放 50 个图形（30 个自由点 + 20 条线段），用真实鼠标拖动其中一个自由点（按下、分 12 步移动、松开）。
 * 量的是页面里的 performance.now：
 *   (1) 每一次 pointermove 的处理时间（捕获阶段到冒泡阶段，中间是台面的全部事件处理和重画，不含浏览器排版和绘制）；
 *   (2) 同一次移动到下一帧（requestAnimationFrame）的时间，包含浏览器的绘制；
 *   (3) 整台面全量重画（UI.Stage.render）的时间，取 5 次中位数。
 * 上限是宽松的：单次处理和单次到下一帧都必须 < 200 毫秒（LIMIT_MS）。2.15 的目标是 16 毫秒（一帧），这里只记录，不作为失败条件；
 * 超过 16 毫秒时在输出里写明，用于决定要不要做增量求值和局部重画（见文档 2.15）。
 * 需要 playwright（NODE_PATH 指向它的 node_modules）。 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const G = require('./gestures');
const url = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/');
const N_POINTS = 30, N_SEGS = 20;   // 共 50 个图形
const LIMIT_MS = 200;               // 宽松上限（单次）
const FRAME_MS = 16;                // 2.15 的目标，只记录

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const median = (a) => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : NaN; };
const fmt = (x) => (Math.round(x * 10) / 10).toFixed(1);

(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(url); await p.waitForTimeout(300);
  await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); });
  await p.waitForTimeout(150);

  // 搭场景：一个几何工作区，里面 30 个自由点（P1…P30，排成 6 行 5 列的网格）和 20 条线段（相邻两点连线）
  const ids = await p.evaluate(({ NP, NS }) => {
    const A = UI.App;
    const ws = A.act({ t: 'add', type: 'gworkspace', x: 60, y: 40 }).id;
    const pts = [];
    for (let i = 0; i < NP; i++) {
      const x = (i % 5) * 2 - 4, y = Math.floor(i / 5) * 2 - 5;
      const n = A.act({ t: 'add', type: 'gpt', x: 0, y: 0, props: { x, y, mark: 'P' + (i + 1) } }).id;
      A.act({ t: 'rename', id: n, name: 'P' + (i + 1) });
      A.act({ t: 'put', id: n, parent: ws, slot: 'items' });
      pts.push(n);
    }
    const segs = [];
    for (let i = 0; i < NS; i++) {
      const s = A.act({ t: 'add', type: 'gseg', x: 0, y: 0 }).id;
      A.act({ t: 'link', from: pts[i], fromPort: 'p', to: s, toPort: 'a' });
      A.act({ t: 'link', from: pts[i + 1], fromPort: 'p', to: s, toPort: 'b' });
      A.act({ t: 'put', id: s, parent: ws, slot: 'items' });
      segs.push(s);
    }
    UI.Stage.fit(); UI.Stage.render();
    return { ws, pts, segs };
  }, { NP: N_POINTS, NS: N_SEGS });
  await p.waitForTimeout(300);

  const count = await p.evaluate((ws) => UI.StageCtx.wsVisible(UI.S.scene.entities[ws]).length, ids.ws);
  ok(count === N_POINTS + N_SEGS, '工作区里有 ' + (N_POINTS + N_SEGS) + ' 个图形（实际 ' + count + '）');

  // 全量重画：5 次中位数（毫秒）
  const fullMs = await p.evaluate(() => {
    const xs = [];
    for (let i = 0; i < 5; i++) { const t0 = performance.now(); UI.Stage.render(); xs.push(performance.now() - t0); }
    return xs.sort((a, b) => a - b)[2];
  });

  // 找一个自由点的把手（有 data-drag 和 data-kx 的圆），取它的屏幕中心
  const handle = await p.evaluate((ws) => {
    const c = document.querySelector('.card[data-id="' + ws + '"] svg.wsbody circle[data-drag][data-kx]');
    if (!c) return null;
    const r = c.getBoundingClientRect();
    return { id: c.dataset.drag, x: r.left + r.width / 2, y: r.top + r.height / 2, cx0: c.getAttribute('cx') };
  }, ids.ws);
  ok(!!handle, '找到一个自由点的把手（可以拖）');

  // 记录拖动期间每次 pointermove：捕获阶段记开始，冒泡阶段（台面的处理都已经跑完）记结束，下一帧记完成
  await p.evaluate(() => {
    window.__perf = [];
    let t0 = 0;
    window.addEventListener('pointermove', () => { t0 = performance.now(); }, true);
    window.addEventListener('pointermove', () => {
      const h = performance.now() - t0;
      requestAnimationFrame(() => window.__perf.push({ h, f: performance.now() - t0 }));
    }, false);
  });

  if (handle) {
    const before = handle.cx0;
    await G.dragPath(p, { x: handle.x, y: handle.y }, { x: handle.x + 120, y: handle.y + 60 });
    await p.waitForTimeout(200);
    const after = await p.evaluate(({ ws, id }) => {
      const c = document.querySelector('.card[data-id="' + ws + '"] svg.wsbody circle[data-drag="' + id + '"]');
      return c ? c.getAttribute('cx') : null;
    }, { ws: ids.ws, id: handle.id });
    ok(after !== null && after !== before, '拖动一次：自由点的位置变了（cx ' + before + ' → ' + after + '）');
  }

  const perf = await p.evaluate(() => window.__perf.slice());
  const hs = perf.map((x) => x.h), fs = perf.map((x) => x.f);
  ok(perf.length >= 5, '拖动期间记录到 ' + perf.length + ' 次移动（至少 5 次）');
  const hMax = Math.max(...hs), fMax = Math.max(...fs);
  const hMed = median(hs), fMed = median(fs);

  console.log('  实测（毫秒）：');
  console.log('        全量重画 UI.Stage.render 中位数（5 次）：' + fmt(fullMs));
  console.log('        单次移动处理（pointermove 到台面处理完）：中位数 ' + fmt(hMed) + '，最大 ' + fmt(hMax));
  console.log('        单次移动到下一帧（含绘制）：中位数 ' + fmt(fMed) + '，最大 ' + fmt(fMax));
  console.log('        2.15 的目标 ' + FRAME_MS + ' 毫秒：' + (fMax <= FRAME_MS && hMax <= FRAME_MS ? '达到' : '未达到（只记录，上限是 ' + LIMIT_MS + ' 毫秒）'));

  ok(hMax < LIMIT_MS, '单次移动处理 < ' + LIMIT_MS + ' 毫秒（最大 ' + fmt(hMax) + '）');
  ok(fMax < LIMIT_MS, '单次移动到下一帧 < ' + LIMIT_MS + ' 毫秒（最大 ' + fmt(fMax) + '）');
  ok(fullMs < LIMIT_MS, '全量重画 < ' + LIMIT_MS + ' 毫秒（' + fmt(fullMs) + '）');
  ok(errs.length === 0, '没有页面错误和控制台错误' + (errs.length ? '（' + errs[0] + '）' : ''));

  await b.close();
  console.log('性能测试：' + (fail ? '不合格' : '通过') + '（50 个图形，拖动 ' + perf.length + ' 次移动，单次处理最大 ' + fmt(hMax) + ' 毫秒，到下一帧最大 ' + fmt(fMax) + ' 毫秒，上限 ' + LIMIT_MS + ' 毫秒；' + pass + ' 通过，' + fail + ' 失败）');
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.log('性能测试：不合格（脚本异常：' + e.message.split('\n')[0] + '）'); process.exit(1); });
