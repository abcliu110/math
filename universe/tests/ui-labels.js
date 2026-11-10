/* node tests/ui-labels.js —— 标签与图层（V6，docs/ui-geometry-feedback.md 2.3、2.4、2.6）。全部用真实鼠标：
 *   (a) 2.3 标签避让：工作区里放两个相邻的图形（器材架拖入，和 ui-select 一样），
 *       (a1) 两个标签的矩形互不相交；(a2) 标签不压住线和顶点圆圈（线、圆的采样点不落在标签矩形里）；
 *       (a3) 标签都在画布里面。
 *   (b) 2.4 图层分组：连四条线（真实鼠标点连线工具）后，图层按类别分组、默认收起，列表不随图形变长；
 *       点分组标题展开、点“全部隐藏”和“全部显示”、再收起。
 *   (c) 2.6 点的命名：拖一个自由点进工作区，它自动叫 A；连一条线，两个新点叫 B、C；
 *       双击点的标签改名为 P，标签变成 P，稳定的 id 不变。
 * 每个手势之后检查不变量（tests/gestures.js）。需要 playwright（NODE_PATH 指向它的 node_modules）。 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const G = require('./gestures');
const url = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const pause = (p, ms) => p.waitForTimeout(ms);

// 工作区坐标 → 屏幕坐标（和 ui-snap 同一种换算）
const scr = (p, ws, pts) => p.evaluate(({ ws, pts }) => {
  const wb = document.querySelector('svg.wsbody[data-wsid="' + ws + '"]');
  const r = wb.getBoundingClientRect(), vw = UI.Stage.rangeOf(ws), sc = UI.Space.canvasOf(r, vw.span);
  return pts.map((q) => UI.Space.workspaceToScreen(q, vw, sc));
}, { ws, pts });

// 工作区画布上的标签矩形、画布矩形，以及可见的线和圆（采样成屏幕上的点）
const geometry = (p, ws) => p.evaluate((ws) => {
  const wb = document.querySelector('svg.wsbody[data-wsid="' + ws + '"]');
  if (!wb) return null;
  const cr = wb.getBoundingClientRect();
  const labels = [...wb.querySelectorAll('text')].filter((t) => t.textContent.trim()).map((t) => {
    const q = t.getBoundingClientRect();
    return { s: t.textContent.trim(), l: q.left, r: q.right, t: q.top, b: q.bottom };
  });
  const pts = [];
  const P = (el, m, x, y) => { const q = wb.createSVGPoint(); q.x = x; q.y = y; const t = q.matrixTransform(m); return [t.x, t.y]; };
  wb.querySelectorAll('path, line, circle').forEach((el) => {
    const stroke = el.getAttribute('stroke'), fill = el.getAttribute('fill');
    const drawn = (stroke && stroke !== 'none' && stroke !== 'transparent') || (el.tagName === 'circle' && fill && fill !== 'none');
    if (!drawn || el.classList.contains('wsguide')) return;   // 透明的命中线、参考线不算
    const m = el.getScreenCTM(); if (!m) return;
    if (el.tagName === 'circle') {
      const cx = +el.getAttribute('cx'), cy = +el.getAttribute('cy'), rr = +el.getAttribute('r');
      for (let i = 0; i <= 72; i++) pts.push(P(el, m, cx + rr * Math.cos(i * Math.PI / 36), cy + rr * Math.sin(i * Math.PI / 36)));
    } else if (el.tagName === 'line') {
      const x1 = +el.getAttribute('x1'), y1 = +el.getAttribute('y1'), x2 = +el.getAttribute('x2'), y2 = +el.getAttribute('y2');
      const n = Math.max(2, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 1.5));
      for (let i = 0; i <= n; i++) pts.push(P(el, m, x1 + (x2 - x1) * i / n, y1 + (y2 - y1) * i / n));
    } else {
      const L = el.getTotalLength();
      for (let s = 0; s <= L; s += 1.5) { const q = el.getPointAtLength(s); pts.push(P(el, m, q.x, q.y)); }
    }
  });
  return { canvas: { l: cr.left, r: cr.right, t: cr.top, b: cr.bottom }, labels, pts };
}, ws);

const overlap = (a, b) => a.l < b.r - 1 && a.r > b.l + 1 && a.t < b.b - 1 && a.b > b.t + 1;
const inside = (L, q) => q[0] > L.l + 1 && q[0] < L.r - 1 && q[1] > L.t + 1 && q[1] < L.b - 1;

(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  G.attachErrorCollector(p);
  await p.goto(url); await p.waitForTimeout(300);

  // ---------- (a) 2.3 标签避让 ----------
  console.log('(a) 2.3 标签避让：工作区里放两个相邻的图形（真实鼠标从器材架拖入）');
  const wsA = await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); return UI.App.act({ t: 'add', type: 'gworkspace', x: 120, y: 60 }).id; });
  await p.waitForTimeout(200);
  await G.dragTileTo(p, 'ftri', wsA);
  await G.dragTileTo(p, 'rect', wsA);
  await G.assertInvariants(p, '放入两个相邻的图形');
  await pause(p, 300);
  // 两个相邻的图形之后，再用真实鼠标在它们中间画两条线（线的端点是自由点，有名字的标签），再检查一次
  const cbox = await p.locator('svg.wsbody[data-wsid="' + wsA + '"]').boundingBox();
  const fx = (f, g) => ({ x: cbox.x + cbox.width * f, y: cbox.y + cbox.height * g });
  const checkLabels = async (tag) => {
    const ga = await geometry(p, wsA);
    ok(!!ga && ga.labels.length >= 2, '(a' + tag + ') 画布里有两个以上的标签：' + (ga ? ga.labels.map((l) => l.s).join('、') : '无画布'));
    if (!ga) return;
    const bad = [];
    for (let i = 0; i < ga.labels.length; i++) for (let j = i + 1; j < ga.labels.length; j++) {
      if (overlap(ga.labels[i], ga.labels[j])) bad.push(ga.labels[i].s + ' 和 ' + ga.labels[j].s);
    }
    ok(bad.length === 0, '(a1' + tag + ') 两个标签的矩形互不相交' + (bad.length ? '：' + bad.join('；') : ''));
    const cover = ga.labels.map((L) => ({ s: L.s, n: ga.pts.filter((q) => inside(L, q)).length })).filter((x) => x.n > 0);
    ok(cover.length === 0, '(a2' + tag + ') 标签不压住线和顶点圆圈' + (cover.length ? '：' + cover.map((x) => x.s + '（' + x.n + ' 个采样点）').join('、') : ''));
    const out = ga.labels.filter((L) => L.l < ga.canvas.l - 1 || L.r > ga.canvas.r + 1 || L.t < ga.canvas.t - 1 || L.b > ga.canvas.b + 1);
    ok(out.length === 0, '(a3' + tag + ') 标签都在画布里面' + (out.length ? '：' + out.map((x) => x.s).join('、') : ''));
  };
  await checkLabels('');
  await p.locator('.wsx[data-ws="' + wsA + '"] [data-ws-tool="seg"]').click(); await pause(p, 150);
  for (const [f1, g1, f2, g2] of [[0.15, 0.35, 0.85, 0.75], [0.85, 0.25, 0.3, 0.65]]) {
    const s1 = fx(f1, g1), s2 = fx(f2, g2);
    await p.mouse.click(s1.x, s1.y); await pause(p, 150);
    await p.mouse.click(s2.x, s2.y); await pause(p, 250);
  }
  await p.keyboard.press('Escape'); await pause(p, 200);
  await checkLabels('，画了两条线之后');

  // ---------- (b) 2.4 图层分组 ----------
  console.log('(b) 2.4 图层分组：连四条线（真实鼠标点连线工具和画布），列表不随图形变长');
  const wsB = await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); return UI.App.act({ t: 'add', type: 'gworkspace', x: 120, y: 60 }).id; });
  await p.waitForTimeout(200);
  const drawSegs = async (segs) => {
    // 连线工具是“点两下画线”的模式：没有在画的时候才点工具按钮（再点一次会退出）
    const inMode = await p.evaluate(() => !!UI.S.wsDraw);
    if (!inMode) { await p.locator('.wsx[data-ws="' + wsB + '"] [data-ws-tool="seg"]').click(); await pause(p, 150); }
    for (const [a, c] of segs) {
      const [pa, pc] = await scr(p, wsB, [a, c]);
      await p.mouse.click(pa.x, pa.y); await pause(p, 150);
      await p.mouse.click(pc.x, pc.y); await pause(p, 250);
    }
  };
  await drawSegs([[{ x: -4, y: -3 }, { x: 4, y: -3 }], [{ x: -4, y: 0 }, { x: 4, y: 1 }]]);
  const layersBox = () => p.locator('.wsx[data-ws="' + wsB + '"] .wsx-layers').evaluate((el) => ({ height: el.getBoundingClientRect().height, content: el.scrollHeight }));
  const boxesCount = () => p.locator('.wsx[data-ws="' + wsB + '"] input[data-ws-layer]').evaluateAll((els) => els.filter((e) => e.offsetParent !== null).length);
  const groupCount = () => p.locator('.wsx[data-ws="' + wsB + '"] button[data-ws-lgroup]').count();
  await drawSegs([[{ x: -4, y: 3 }, { x: 4, y: 3 }], [{ x: -4, y: 5 }, { x: 4, y: 6 }]]);
  const total = await p.evaluate((ws) => Object.values(UI.S.scene.entities).filter((e) => e.parent === ws).length, wsB);
  const hBig = await layersBox();
  const groups = await groupCount();
  const shown = await boxesCount();
  ok(total >= 8, '(b) 工作区里有 8 个以上的图层对象（实际 ' + total + ' 个）');
  ok(groups >= 1 && groups <= 5, '(b1) 图层按类别分组，分组标题数 ' + groups + '（期望 1 到 5）');
  ok(shown === 0, '(b2) 分组默认收起：图层复选框没有铺开（可见 ' + shown + ' 个）');
  // 图形数量翻倍，列表高度不变
  await drawSegs([[{ x: -2, y: -6 }, { x: 5, y: -6 }], [{ x: -6, y: -7 }, { x: -6, y: -2 }]]);
  const hMore = await layersBox();
  ok(Math.abs(hMore.content - hBig.content) < 1, '(b3) 再加图形，图层列表的内容高度不变（' + Math.round(hBig.content) + ' → ' + Math.round(hMore.content) + '）');

  // 展开“点”分组（真实点击标题）
  const pointHead = p.locator('.wsx[data-ws="' + wsB + '"] button[data-ws-lgroup]', { hasText: '点' }).first();
  await pointHead.click(); await pause(p, 200);
  const shownAfterOpen = await boxesCount();
  ok(shownAfterOpen > 0, '(b4) 点“点”分组展开：复选框出现（' + shownAfterOpen + ' 个）');
  const picksOf = () => p.evaluate((ws) => document.querySelectorAll('svg.wsbody[data-wsid="' + ws + '"] [data-pick]').length, wsB);
  const picksBefore = await picksOf();
  // “全部隐藏”：画布上的图形都不画，复选框全不勾
  await p.locator('.wsx[data-ws="' + wsB + '"] [data-ws-layers="hide"]').click(); await pause(p, 250);
  const picksHidden = await picksOf();
  const checkedAfterHide = await p.locator('.wsx[data-ws="' + wsB + '"] input[data-ws-layer]:checked').count();
  ok(picksHidden === 0 && checkedAfterHide === 0, '(b5) 全部隐藏：画布上没有图形，复选框全部没勾（图形 ' + picksHidden + '，勾选 ' + checkedAfterHide + '）');
  // “全部显示”：图形数量和隐藏前一样
  await p.locator('.wsx[data-ws="' + wsB + '"] [data-ws-layers="show"]').click(); await pause(p, 250);
  const picksShown = await picksOf();
  const checkedAfterShow = await p.locator('.wsx[data-ws="' + wsB + '"] input[data-ws-layer]:checked').count();
  ok(picksShown > 0 && picksShown === picksBefore && checkedAfterShow > 0, '(b6) 全部显示：图形都画回来了（' + picksBefore + ' → ' + picksShown + '，勾选 ' + checkedAfterShow + '）');
  // 收起“点”分组
  await pointHead.click(); await pause(p, 200);
  const shownAfterClose = await boxesCount();
  ok(shownAfterClose === 0, '(b7) 再点标题，“点”分组收起（可见复选框 ' + shownAfterClose + ' 个）');

  // ---------- (c) 2.6 点的命名 ----------
  console.log('(c) 2.6 点的命名：新点自动叫 A、B、C，双击标签改名');
  const wsC = await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); return UI.App.act({ t: 'add', type: 'gworkspace', x: 120, y: 60 }).id; });
  await p.waitForTimeout(200);
  await G.dragTileTo(p, 'gpt', wsC);
  await pause(p, 250);
  const labelsOf = () => p.evaluate((ws) => [...document.querySelectorAll('svg.wsbody[data-wsid="' + ws + '"] text')].map((t) => t.textContent.trim()).filter(Boolean), wsC);
  let labs = await labelsOf();
  ok(labs.includes('A'), '(c1) 拖入的自由点自动叫 A（标签：' + labs.join('、') + '）');
  // 连一条线：两个新点自动叫 B、C（真实鼠标点连线工具，再点两下）
  const cbC = await p.locator('svg.wsbody[data-wsid="' + wsC + '"]').boundingBox();
  const pB = { x: cbC.x + cbC.width * 0.3, y: cbC.y + cbC.height * 0.7 }, pC = { x: cbC.x + cbC.width * 0.7, y: cbC.y + cbC.height * 0.4 };   // 画布里面的两个位置（单个点时坐标范围是自动的，不能用固定的工作区坐标）
  await p.locator('.wsx[data-ws="' + wsC + '"] [data-ws-tool="seg"]').click(); await pause(p, 150);
  await p.mouse.click(pB.x, pB.y); await pause(p, 150);
  await p.mouse.click(pC.x, pC.y); await pause(p, 300);
  labs = await labelsOf();
  ok(labs.includes('B') && labs.includes('C'), '(c2) 连线时的两个新点自动叫 B、C（标签：' + labs.join('、') + '）');
  await p.keyboard.press('Escape'); await pause(p, 200);   // 退出连线模式（Esc），双击才是改名
  const idA = await p.evaluate((ws) => Object.values(UI.S.scene.entities).find((e) => e.parent === ws && e.type === 'gpt' && e.props.mark === 'A').id, wsC);
  // 双击 A 的标签（真实鼠标）：弹出输入框，改成 P，回车
  const aBox = await p.evaluate((ws) => {
    const t = [...document.querySelectorAll('svg.wsbody[data-wsid="' + ws + '"] text')].find((x) => x.textContent.trim() === 'A');
    if (!t) return null;
    const r = t.getBoundingClientRect(); return { x: (r.left + r.right) / 2, y: (r.top + r.bottom) / 2 };
  }, wsC);
  ok(!!aBox, '(c3) 找得到 A 的标签');
  if (aBox) {
    await p.mouse.dblclick(aBox.x, aBox.y); await pause(p, 250);
    const input = p.locator('input.wsx-ren');
    ok((await input.count()) === 1, '(c3) 双击标签后出现改名的输入框');
    await input.first().fill('');
    await p.keyboard.type('P');
    await p.keyboard.press('Enter'); await pause(p, 300);
    labs = await labelsOf();
    ok(labs.includes('P') && !labs.includes('A'), '(c4) 改名后标签是 P（标签：' + labs.join('、') + '）');
    const idP = await p.evaluate((ws) => Object.values(UI.S.scene.entities).find((e) => e.parent === ws && e.type === 'gpt' && e.props.mark === 'P'), wsC);
    ok(!!idP && idP.id === idA, '(c5) 改名只改显示名字，id 不变');
  }

  ok(errs.length === 0, '没有页面错误和控制台错误' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n标签与图层测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.log('FAIL 测试异常：' + e.message); process.exit(1); });
