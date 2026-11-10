/* node tests/ui-snap3.js —— 吸附的剩余部分（V4 剩余，docs/ui-geometry-feedback.md 1.3 和第 3 节 V4），真实鼠标。
 * 工作区里：A(0,0)、B(6,0)、C(2,6) 三个自由点，围成三角形 ABC（多边形 gpoly）。它是锐角三角形，所以
 *   重心 (8/3, 2)、外心 (3, 7/3)（不和任何边的中点重合）、AB 的三分之一点 (2, 0)、BC 的三分之二点 (10/3, 4)。
 * (A1) 构造点：自由点 X 拖到重心、外心、三分之一点上，松手后背后建对应的构造器材（gcentroid、gcircum、gtri1），
 *      器材接对的输入口（三角形的三个顶点，或线段的两端）；X 不见了；整串是一个撤销项；撤销后 X 回来；
 *      画线时，第二下点靠近重心，建 gcentroid 并接线；吸附时画布上写出“ABC 的重心”等名字；
 *      按住 Alt 不吸附；远离构造点不吸附。
 * (A2) 拖动：
 *      块（这里是自由点围成的三角形 T，整体拖动）：T 的顶点拖到 AC 的中点 (1, 3) 附近，松手后顶点正好在 (1, 3)，
 *           拖动时画布上写出“落在 AC 的中点 上”（中点进入对齐候选，见 stage-align.js）；
 *      卡片：一张数字卡片的中心靠近 BC 的中点（屏幕上 9 像素内），松手后中心落在中点上，拖动时提示“吸附到 BC 的中点”；
 *           按住 Alt：不吸附，卡片停在拖动的位置。
 * 需要 playwright（NODE_PATH 指向它的 node_modules）。 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const G = require('./gestures');
const url = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const near = (u, v, e) => !!u && !!v && Math.abs(u[0] - v[0]) < (e || 1e-6) && Math.abs(u[1] - v[1]) < (e || 1e-6);

(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  G.attachErrorCollector(p);
  await p.goto(url); await p.waitForTimeout(300);
  await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); });
  await p.waitForTimeout(150);

  console.log('搭场景：工作区里 A(0,0)、B(6,0)、C(2,6) 围成三角形 ABC；自由点 X(-4,-4)；另一个小三角形 T(-6,-6)、(-5,-6)、(-6,-5)；一张数字卡片 N');
  const ids = await p.evaluate(() => {
    const A = UI.App;
    const ws = A.act({ t: 'add', type: 'gworkspace', x: 120, y: 60 }).id;
    const pt = (name, x, y) => {
      const n = A.act({ t: 'add', type: 'gpt', x: 0, y: 0, props: { x, y, mark: name } }).id;
      A.act({ t: 'put', id: n, parent: ws, slot: 'items' });
      return n;
    };
    const poly = (ps) => {
      const g = A.act({ t: 'add', type: 'gpoly', x: 0, y: 0 }).id;
      ps.forEach((q) => A.act({ t: 'link', from: q, fromPort: 'p', to: g, toPort: 'pts' }));
      A.act({ t: 'put', id: g, parent: ws, slot: 'items' });
      return g;
    };
    const a = pt('A', 0, 0), bb = pt('B', 6, 0), c = pt('C', 2, 6);
    poly([a, bb, c]);
    const x = pt('X', -4, -4);
    const t1 = pt('P', -6, -6), t2 = pt('Q', -5, -6), t3 = pt('R', -6, -5);
    poly([t1, t2, t3]);
    const n = A.act({ t: 'add', type: 'num', x: -520, y: -260, props: { n: 2 } }).id;
    UI.Stage.fit(); UI.Stage.render();
    return { ws, a, b: bb, c, x, t1, t2, t3, n };
  });
  await p.waitForTimeout(250);
  ok(!!ids.ws && !!ids.x && !!ids.n, '工作区、三角形、自由点和卡片放好');

  const scr = (pts) => p.evaluate(({ ws, pts }) => {
    const wb = document.querySelector('svg.wsbody[data-wsid="' + ws + '"]');
    const r = wb.getBoundingClientRect(), vw = UI.Stage.rangeOf(ws), sc = UI.Space.canvasOf(r, vw.span);
    return pts.map((q) => UI.Space.workspaceToScreen(q, vw, sc));
  }, { ws: ids.ws, pts });
  const ents = (t) => p.evaluate((t) => Object.values(UI.S.scene.entities).filter((e) => e.type === t).map((e) => e.id), t);
  const exists = (id) => p.evaluate((id) => !!UI.S.scene.entities[id], id);
  const xy = (id) => p.evaluate((id) => { const e = UI.S.scene.entities[id]; return e ? [e.props.x, e.props.y] : null; }, id);
  const linksInto = (to) => p.evaluate((to) => UI.S.scene.links.filter((l) => l.to === to).map((l) => ({ from: l.from, fromPort: l.fromPort, toPort: l.toPort })), to);
  const undoLen = () => p.evaluate(() => UI.S.undo.length);
  const canvasText = () => p.evaluate(() => [...document.querySelectorAll('svg.wsbody text')].map((t) => t.textContent).join('|'));
  const handle = (id) => p.evaluate((id) => { const el = document.querySelector('circle[data-drag="' + id + '"]'); if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, id);

  // 拖动自由点 X 到屏幕位置 to：真实鼠标按下、分步移动、（可选）按住 Alt、（可选）中途回调、松手
  const dragX = async (to, o) => {
    o = o || {};
    const h0 = await handle(ids.x);
    await p.mouse.move(h0.x, h0.y); await p.mouse.down();
    if (o.alt) await p.keyboard.down('Alt');
    await p.mouse.move(to.x, to.y, { steps: 10 });
    await p.waitForTimeout(120);
    if (o.hold) await o.hold();
    await p.mouse.up();
    if (o.alt) await p.keyboard.up('Alt');
    await p.waitForTimeout(250);
  };
  const back = async () => { await G.undo(p); await p.waitForTimeout(150); };
  const inv = (label) => G.assertInvariants(p, label);

  // 三角形 ABC 的几个构造点（有理数，用浮点算屏幕位置）
  const CEN = [8 / 3, 2], CIR = [3, 7 / 3], TRI1 = [2, 0];

  try {
    // ---------- (A1-a) 重心 ----------
    const [pg] = await scr([{ x: CEN[0], y: CEN[1] }]);
    let seen = '';
    await dragX(pg, { hold: async () => { seen = await canvasText(); } });
    await inv('拖动 X 到重心');
    const cents = await ents('gcentroid');
    ok(cents.length === 1, '(A1) 拖到三角形的重心：建了重心器材（gcentroid），实际 ' + cents.length + ' 个');
    if (cents[0]) {
      const f = await linksInto(cents[0]);
      ok(['a', 'b', 'c'].every((port, i) => f.some((x) => x.toPort === port && x.from === [ids.a, ids.b, ids.c][i])), '(A1) 重心器材的 a、b、c 分别接 A、B、C');
    }
    ok(!(await exists(ids.x)), '(A1) X 被换成了重心（X 不见了）');
    ok(seen.indexOf('ABC 的重心') >= 0, '(A1) 拖到重心时画布上写出“ABC 的重心”：「' + seen.slice(0, 80) + '」');
    await back();
    await inv('撤销重心吸附');
    ok((await exists(ids.x)) && (await ents('gcentroid')).length === 0, '(A1) 撤销后 X 回来，重心器材没有了');

    // ---------- (A1-b) 外心（圆心） ----------
    const [pc] = await scr([{ x: CIR[0], y: CIR[1] }]);
    const u0 = await undoLen();
    seen = '';
    await dragX(pc, { hold: async () => { seen = await canvasText(); } });
    await inv('拖动 X 到外心');
    const circs = await ents('gcircum');
    ok(circs.length === 1, '(A1) 拖到三角形外接圆的圆心：建了圆心器材（gcircum），实际 ' + circs.length + ' 个');
    if (circs[0]) {
      const f = await linksInto(circs[0]);
      ok(['a', 'b', 'c'].every((port, i) => f.some((x) => x.toPort === port && x.from === [ids.a, ids.b, ids.c][i])), '(A1) 圆心器材的 a、b、c 分别接 A、B、C');
    }
    ok((await undoLen()) - u0 === 1, '(A1) 圆心吸附是一个撤销项（撤销栈增加 ' + ((await undoLen()) - u0) + '）');
    ok(seen.indexOf('ABC 的圆心') >= 0, '(A1) 拖到圆心时画布上写出“ABC 的圆心（外接圆）”：「' + seen.slice(0, 80) + '」');
    await back();
    await inv('撤销圆心吸附');

    // ---------- (A1-c) 三分之一点 ----------
    const [pt1] = await scr([{ x: TRI1[0], y: TRI1[1] }]);
    await dragX(pt1);
    await inv('拖动 X 到 AB 的三分之一点');
    const tri1 = await ents('gtri1');
    ok(tri1.length === 1, '(A1) 拖到 AB 的三分之一点：建了三分之一点器材（gtri1），实际 ' + tri1.length + ' 个');
    if (tri1[0]) {
      const f = await linksInto(tri1[0]);
      ok(f.some((x) => x.toPort === 'a' && x.from === ids.a) && f.some((x) => x.toPort === 'b' && x.from === ids.b), '(A1) 三分之一点器材的 a、b 分别接 A、B');
    }
    await back();
    await inv('撤销三分之一点吸附');

    // ---------- (A1-d) 远离构造点：不吸附 ----------
    const [pfar] = await scr([{ x: -2, y: -2.5 }]);
    const n0 = await p.evaluate(() => Object.keys(UI.S.scene.entities).length);
    await dragX(pfar);
    await inv('拖到远离构造点的地方');
    ok((await p.evaluate(() => Object.keys(UI.S.scene.entities).length)) === n0 && (await exists(ids.x)), '(A1) 远离构造点：不建新器材，X 还在');

    // ---------- (A1-e) 按住 Alt 拖到重心：不吸附 ----------
    await dragX(pg, { alt: true });
    await inv('按住 Alt 拖到重心');
    ok((await ents('gcentroid')).length === 0 && (await exists(ids.x)), '(A1) 按住 Alt 拖到重心：不吸附');

    // ---------- (A1-f) 画线：第二下点靠近重心，建重心器材并接线，一个撤销项 ----------
    // X 先挪开（不然 X 离重心太近，顶点优先于构造点，画线的第二下会接到 X 上）
    const [pfar2] = await scr([{ x: -3, y: -3 }]);
    await dragX(pfar2);
    await p.locator('[data-ws-tool="seg"][data-ws="' + ids.ws + '"]').first().click(); await p.waitForTimeout(120);
    const [pA, pG] = await scr([{ x: 0, y: 0 }, { x: CEN[0], y: CEN[1] }]);
    const uDraw = await undoLen();
    await p.mouse.move(pA.x, pA.y); await p.mouse.click(pA.x, pA.y); await p.waitForTimeout(80);
    await p.mouse.move(pG.x + 1, pG.y + 1); await p.waitForTimeout(80);
    seen = await canvasText();
    await p.mouse.click(pG.x + 1, pG.y + 1); await p.waitForTimeout(250);
    await inv('画线：A 到重心');
    const cents2 = await ents('gcentroid');
    ok(cents2.length === 1, '(A1) 画线：第二下吸附到重心，建了重心器材，实际 ' + cents2.length + ' 个');
    ok(seen.indexOf('ABC 的重心') >= 0 || seen.indexOf('的重心') >= 0, '(A1) 画线：吸附时写出重心的名字');
    ok((await undoLen()) - uDraw === 1, '(A1) 画线吸附是一个撤销项（撤销栈增加 ' + ((await undoLen()) - uDraw) + '）');
    await p.keyboard.press('Escape'); await p.waitForTimeout(100);
    await back();
    await inv('撤销画线吸附');
    ok((await ents('gcentroid')).length === 0, '(A1) 撤销后重心器材没有了');

    // ---------- (A2-块) 整块拖动：顶点落在 AC 的中点 (1, 3) 上 ----------
    // T 的顶点 P(-6,-6) 平移 (7, 9) 到 (1, 3)；鼠标多走 2 像素（在吸附半径里）
    const [tc] = await scr([{ x: (-6 - 5 - 6) / 3, y: (-6 - 6 - 5) / 3 }]);
    const sc = await p.evaluate(({ ws }) => { const wb = document.querySelector('svg.wsbody[data-wsid="' + ws + '"]'), r = wb.getBoundingClientRect(), vw = UI.Stage.rangeOf(ws); return UI.Space.canvasOf(r, vw.span).unit; }, { ws: ids.ws });
    const dx7 = 7 * sc, dy9 = -9 * sc;   // 屏幕上：x 右移 7 个单位，y 上移 9 个单位
    await p.mouse.move(tc.x, tc.y); await p.mouse.down();
    await p.mouse.move(tc.x + dx7 + 2, tc.y + dy9 + 1, { steps: 10 });
    await p.waitForTimeout(120);
    const holdTxt = await canvasText();
    await p.mouse.up(); await p.waitForTimeout(250);
    await inv('拖动三角形 T 到 AC 的中点');
    const pP = await p.evaluate((id) => { const e = UI.S.scene.entities[id]; return [e.props.x, e.props.y]; }, ids.t1);
    ok(pP[0] === 1 && pP[1] === 3, '(A2) 块拖动：顶点 P 落在 AC 的中点 (1, 3) 上：' + JSON.stringify(pP));
    ok(holdTxt.indexOf('的中点') >= 0 && holdTxt.indexOf('落在') >= 0, '(A2) 块拖动时画布上写出“落在 … 的中点 上”：「' + holdTxt.slice(0, 80) + '」');
    await back();
    await inv('撤销块拖动');

    // ---------- (A2-卡片) 卡片中心吸附到 BC 的中点 (4, 3) ----------
    const [mBC] = await scr([{ x: 4, y: 3 }]);
    const cardCenter = () => p.evaluate((id) => { const el = document.querySelector('.card[data-id="' + id + '"]'); if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, l: r.left, t: r.top }; }, ids.n);
    const c0 = await cardCenter();
    ok(!!c0, '(A2) 卡片在台面上');
    const grab = { x: c0.l + 14, y: c0.t + 14 };   // 卡片标题区（不是输入框）
    const off = { x: c0.x - grab.x, y: c0.y - grab.y };   // 卡片中心相对抓取点的偏移
    const target = { x: mBC.x - off.x + 3, y: mBC.y - off.y + 2 };   // 中心离中点 3–4 像素，在吸附半径里
    await p.mouse.move(grab.x, grab.y); await p.mouse.down();
    // 松手时卡片可能被放进它下面的容器（工作区是容器），所以中心的位置在松手前量（拖动中的位置）
    await p.mouse.move(target.x, target.y, { steps: 10 });
    await p.waitForTimeout(120);
    const c1 = await cardCenter();
    const tipTxt = await p.evaluate(() => { const t = document.querySelector('#tip'); return t && t.style.display !== 'none' ? t.textContent : ''; });
    await p.mouse.up(); await p.waitForTimeout(250);
    ok(!!c1 && Math.hypot(c1.x - mBC.x, c1.y - mBC.y) <= 1.5, '(A2) 卡片中心吸附到 BC 的中点：离中点 ' + (c1 ? Math.hypot(c1.x - mBC.x, c1.y - mBC.y).toFixed(2) : '?') + ' 像素');
    ok(tipTxt.indexOf('吸附到') >= 0 && tipTxt.indexOf('BC') >= 0, '(A2) 拖动时提示“吸附到 BC 的中点”：「' + tipTxt + '」');
    await back();
    await inv('撤销卡片吸附');

    const c2 = await cardCenter();
    const grab2 = { x: c2.l + 14, y: c2.t + 14 };
    const target2 = { x: mBC.x - off.x + 3, y: mBC.y - off.y + 2 };
    await p.keyboard.down('Alt');
    await p.mouse.move(grab2.x, grab2.y); await p.mouse.down();
    await p.mouse.move(target2.x, target2.y, { steps: 10 });
    await p.waitForTimeout(120);
    const c3 = await cardCenter();
    await p.mouse.up(); await p.keyboard.up('Alt'); await p.waitForTimeout(250);
    ok(!!c3 && Math.hypot(c3.x - (target2.x + off.x), c3.y - (target2.y + off.y)) <= 2.5 && Math.hypot(c3.x - mBC.x, c3.y - mBC.y) > 1.5, '(A2) 按住 Alt 拖卡片：不吸附，停在拖动的位置');
    await back();
    await inv('撤销 Alt 拖动卡片');
  } catch (e) {
    fail++; console.log('  FAIL 测试中断：' + e.message);
  }

  ok(errs.length === 0, '没有控制台错误' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n吸附剩余测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close();
  process.exit(fail ? 1 : 0);
})();
