/* node tests/ui-scale.js —— 几何工作区：选中图形后拖四角的缩放把手（真实鼠标和键盘）。
 *  1. 选中多边形（三角形、矩形）后，四角都有把手，拖一个角：图形按比例变大（2 倍）；
 *  2. 偶数边的矩形拖到 1/2：图形变小，坐标仍是整数；撤销一次回到原样；
 *  3. 奇数边的矩形拖到 1/2：结果是分数坐标（有理数），图形真的缩小了，提示说明是 1/2 倍；
 *  4. 拖到 2 倍，但超出坐标范围（±10）：提示说超出范围，图形不会变成越界的坐标；
 *  5. 控制台 0 报错。
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
  await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); UI.App.act({ t: 'add', type: 'gworkspace', x: 0, y: 0 }); });
  await p.evaluate(() => { const g = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === '知道了'); if (g) g.click(); });
  const addShape = async (t) => { await p.locator('.wsmini .shape-menu summary').first().click(); await p.locator('.wsmini .shape-pop button[data-ws-shape="' + t + '"]').first().click(); await p.waitForTimeout(250); };
  // 把图形的顶点坐标设成指定的值（按顺序对应顶点 A、B、C……）
  const setCoords = async (pts) => {
    await p.evaluate((pts) => { const gp = Object.values(UI.S.scene.entities).filter((e) => e.type === 'gpt'); gp.forEach((e, i) => { UI.App.act({ t: 'set', id: e.id, k: 'x', v: pts[i][0] }); UI.App.act({ t: 'set', id: e.id, k: 'y', v: pts[i][1] }); }); }, pts);
    await p.waitForTimeout(200);
  };
  const coords = () => p.evaluate(() => Object.values(UI.S.scene.entities).filter((e) => e.type === 'gpt').map((e) => [e.props.x, e.props.y]));
  // 屏幕上每个顶点的位置（按工作区坐标）；用两个顶点求出换算比例，任意工作区坐标都能换成屏幕位置
  const verts = () => p.evaluate(() => [...document.querySelectorAll('svg.wsbody [data-drag]')].map((e) => { const r = e.getBoundingClientRect(), o = UI.S.scene.entities[e.dataset.drag].props; return { x: r.x + r.width / 2, y: r.y + r.height / 2, wx: o.x, wy: o.y }; }));
  const mapper = (vs) => {
    const a = vs[0], bx = vs.find((v) => v.wx !== a.wx), by = vs.find((v) => v.wy !== a.wy);
    const ux = (bx.x - a.x) / (bx.wx - a.wx), uy = (by.y - a.y) / (by.wy - a.wy);
    return (wx, wy) => ({ x: a.x + (wx - a.wx) * ux, y: a.y + (wy - a.wy) * uy });
  };
  // 选中图形：点它的中心（顶点的平均位置）；中心若压着标签，就换一个边上的点
  const selectShape = async () => {
    const vs = await verts(), cx = vs.reduce((s, v) => s + v.x, 0) / vs.length, cy = vs.reduce((s, v) => s + v.y, 0) / vs.length;
    await p.mouse.click(cx, cy); await p.waitForTimeout(250);
    return p.evaluate(() => (UI.S.wsSel || []).length === 1);
  };
  // 按住左下角（工作区里 x 最小、y 最小的角）的把手，拖到“锚点 + k × (这个角 − 锚点)”，k 是比例。
  // 锚点是对角（x 最大、y 最大）。拖动中记下提示文字，松手。
  const dragCorner = async (k) => {
    const cs = await p.evaluate(() => { const gp = Object.values(UI.S.scene.entities).filter((e) => e.type === 'gpt'); const xs = gp.map((e) => e.props.x), ys = gp.map((e) => e.props.y); return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) }; });
    const vs = await verts(), sc = mapper(vs);
    const A = sc(cs.x1, cs.y1), C = sc(cs.x0, cs.y0);
    const start = await p.evaluate(() => { const el = document.querySelector('svg.wsbody [data-hdl="corner"][data-corner="0"]'); if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
    if (!start) return { tip: '(没有左下角把手)', found: false };
    const target = { x: A.x + k * (C.x - A.x), y: A.y + k * (C.y - A.y) };
    await p.mouse.move(start.x, start.y); await p.mouse.down();
    await p.mouse.move((start.x + target.x) / 2, (start.y + target.y) / 2, { steps: 6 });
    await p.mouse.move(target.x, target.y, { steps: 6 });
    const tip = await p.evaluate(() => { const t = document.querySelector('#tip'); return t && t.style.display !== 'none' ? t.textContent : ''; });
    await p.mouse.up(); await p.waitForTimeout(250);
    return { tip, found: true };
  };
  const sameAs = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  console.log('1. 三角形：四角有把手，拖到 2 倍');
  await p.evaluate(() => { UI.S.wsDraw = null; UI.S.wsSel = []; UI.App.act({ t: 'clear' }); UI.App.act({ t: 'add', type: 'gworkspace', x: 0, y: 0 }); });
  await p.waitForTimeout(150);
  await addShape('frtri');
  await setCoords([[-2, -1], [2, -1], [-2, 2]]);
  ok(await selectShape(), '点三角形中心，选中它');
  const hdl = await p.evaluate(() => [...document.querySelectorAll('svg.wsbody [data-hdl="corner"]')].length);
  ok(hdl === 4, '选中后四个角都有缩放把手（' + hdl + ' 个）');
  const triBefore = await coords();
  const r1 = await dragCorner(2);
  ok(r1.found, '按住左下角把手拖动');
  const triAfter = await coords();
  // A(-2,-1) → 锚点(2,2) + 2 × ((-2,-1) − (2,2)) = (-6,-4)；B(2,-1) → (2,-4)；C(-2,2) → (-6,2)
  ok(sameAs(triAfter, [[-6, -4], [2, -4], [-6, 2]]), '三角形变成 2 倍大：' + JSON.stringify(triAfter) + '（之前 ' + JSON.stringify(triBefore) + '）');
  ok(r1.tip.includes('2') && r1.tip.includes('倍'), '拖动时提示当前比例：' + JSON.stringify(r1.tip));
  await p.keyboard.press('Control+z'); await p.waitForTimeout(250);
  ok(sameAs(await coords(), triBefore), '撤销一次，三角形回到原来的样子（一步）');

  console.log('2. 偶数边矩形：拖到 1/2，变小，坐标仍是整数');
  await p.evaluate(() => { UI.S.wsDraw = null; UI.S.wsSel = []; UI.App.act({ t: 'clear' }); UI.App.act({ t: 'add', type: 'gworkspace', x: 0, y: 0 }); });
  await p.waitForTimeout(150);
  await addShape('frect');
  await setCoords([[-4, -2], [4, -2], [4, 2], [-4, 2]]);
  ok(await selectShape(), '选中矩形');
  const rBefore = await coords();
  await dragCorner(0.5);
  const rHalf = await coords();
  ok(sameAs(rHalf, [[0, 0], [4, 0], [4, 2], [0, 2]]), '矩形缩到 1/2：' + JSON.stringify(rHalf));
  ok(rHalf.every(([x, y]) => Number.isInteger(x) && Number.isInteger(y)), '结果仍是整数坐标');
  await p.keyboard.press('Control+z'); await p.waitForTimeout(250);
  ok(sameAs(await coords(), rBefore), '撤销一次，矩形回到原来的大小');

  console.log('3. 奇数边矩形：拖到 1/2 得到分数坐标（有理数），图形真的缩小，提示说明');
  await p.evaluate(() => { UI.S.wsDraw = null; UI.S.wsSel = []; UI.App.act({ t: 'clear' }); UI.App.act({ t: 'add', type: 'gworkspace', x: 0, y: 0 }); });
  await p.waitForTimeout(150);
  await addShape('frect');
  await setCoords([[-2, -1], [3, -1], [3, 2], [-2, 2]]);
  ok(await selectShape(), '选中奇数边的矩形');
  const oBefore = await coords();
  const r3 = await dragCorner(0.5);
  ok(!sameAs(await coords(), oBefore), '拖到 1/2：图形真的缩小了（分数坐标）');
  ok(r3.tip.includes('1/2'), '提示说明是 1/2 倍：' + JSON.stringify(r3.tip));

  console.log('4. 拖到 2 倍但超出坐标范围（±10）：提示超出，不写入越界的坐标');
  await p.evaluate(() => { UI.S.wsDraw = null; UI.S.wsSel = []; UI.App.act({ t: 'clear' }); UI.App.act({ t: 'add', type: 'gworkspace', x: 0, y: 0 }); });
  await p.waitForTimeout(150);
  await addShape('frect');
  await setCoords([[-4, -2], [4, -2], [4, 2], [-4, 2]]);
  ok(await selectShape(), '选中矩形（-4..4，-2..2）');
  const r4 = await dragCorner(2);
  const big = await coords();
  ok(big.every(([x, y]) => Math.abs(x) <= 10 && Math.abs(y) <= 10), '结果都在坐标范围内：' + JSON.stringify(big));
  ok(r4.tip.includes('范围'), '拖动时提示超出了坐标范围：' + JSON.stringify(r4.tip));

  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n几何工作区（缩放把手）测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close(); process.exit(fail ? 1 : 0);
})();
