/* node tests/ui-snap2.js —— 拖动吸附到构造点（V4 剩余，docs/ui-geometry-feedback.md 1.3 和第 3 节 V4）。
 * 用真实鼠标和键盘。工作区里有：
 *   A(0,0)、B(6,3)、C(1,4)、D(5,0)、R(6,0)、X(-4,-4)；线段 AB、CD、XA。
 *   AB 的中点 (3, 3/2)；CD 的中点 (3, 2)；AB 和 CD 的交点 (10/3, 5/3)；R 到直线 AB 的垂足 (24/5, 12/5)。
 *   (1) 拖动自由点 X 靠近 AB 的中点：松手后 X 不见了，背后建了中点器材 gmid（接 A、B），X 原来的线接在 gmid 的输出上，
 *       线在连线列表里的位置不变（多边形的顶点顺序不变）；一个撤销项；撤销后 X 回来；
 *   (2) 靠近两条线的交点：建交点器材 gcross（接 A、B、C、D）；
 *   (3) 靠近 R 到 AB 的垂足：建垂足器材 gperp（接 R、A、B）；
 *   (4) 拖动时，靠近构造点会在画布上写出是哪一种（“AB 的中点”）；
 *   (5) 吸附开关（工具条上的“吸附”）关闭时，拖动不吸附；
 *   (6) 按住 Alt 拖动，不吸附；
 *   (7) 离构造点远时，不吸附，X 落在拖动的位置（取整）。
 * 圆心、重心、三等分点：当前的器材里没有对应的构造器材（geo 包里没有声明），这里不测，见报告。
 * 需要 playwright（NODE_PATH 指向它的 node_modules）。 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const G = require('./gestures');
const url = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const near = (u, v) => !!u && !!v && Math.abs(u[0] - v[0]) < 1e-6 && Math.abs(u[1] - v[1]) < 1e-6;

(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  G.attachErrorCollector(p);
  await p.goto(url); await p.waitForTimeout(300);
  await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); });
  await p.waitForTimeout(150);

  console.log('搭场景：A(0,0)、B(6,3)、C(1,4)、D(5,0)、R(6,0)、X(-4,-4)；线段 AB、CD、XA');
  const ids = await p.evaluate(() => {
    const A = UI.App;
    const ws = A.act({ t: 'add', type: 'gworkspace', x: 120, y: 60 }).id;
    const pt = (name, x, y) => {
      const n = A.act({ t: 'add', type: 'gpt', x: 0, y: 0, props: { x, y, mark: name } }).id;
      A.act({ t: 'put', id: n, parent: ws, slot: 'items' });
      return n;
    };
    const seg = (p1, p2) => {
      const s = A.act({ t: 'add', type: 'gseg', x: 0, y: 0 }).id;
      A.act({ t: 'link', from: p1, fromPort: 'p', to: s, toPort: 'a' });
      A.act({ t: 'link', from: p2, fromPort: 'p', to: s, toPort: 'b' });
      A.act({ t: 'put', id: s, parent: ws, slot: 'items' });
      return s;
    };
    const a = pt('A', 0, 0), bb = pt('B', 6, 3), c = pt('C', 1, 4), d = pt('D', 5, 0), r = pt('R', 6, 0), x = pt('X', -4, -4);
    const ab = seg(a, bb), cd = seg(c, d), xa = seg(x, a);
    UI.Stage.fit(); UI.Stage.render();
    return { ws, a, b: bb, c, d, r, x, ab, cd, xa };
  });
  await p.waitForTimeout(250);
  ok(!!ids.ws && !!ids.x, '工作区和点、线段放好');

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
  const hintsOnCanvas = () => p.evaluate(() => [...document.querySelectorAll('svg.wsbody text')].map((t) => t.textContent).join('|'));
  const handle = (id) => p.evaluate((id) => { const el = document.querySelector('circle[data-drag="' + id + '"]'); if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, id);

  // 拖动 X 到屏幕位置 to：真实鼠标按下、分步移动、（可选）中途按住 Alt、松手
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

  // 工作区里 X 之后的状态检查（不变量）
  const inv = (label) => G.assertInvariants(p, label);

  try {
    // ---------- (1) 中点 ----------
    const [pm] = await scr([{ x: 3, y: 1.5 }]);
    const u0 = await undoLen();
    let seen = '';
    await dragX(pm, { hold: async () => { seen = await hintsOnCanvas(); } });
    await inv('拖动 X 到 AB 的中点');
    const gms = await ents('gmid');
    ok(gms.length === 1, '(1) 松手后背后建了一个中点器材（gmid），实际 ' + gms.length + ' 个');
    const gm = gms[0] || null;
    const feeds = gm ? await linksInto(gm) : [];
    ok(feeds.some((f) => f.from === ids.a && f.toPort === 'a') && feeds.some((f) => f.from === ids.b && f.toPort === 'b'), '(1) 中点器材的输入 a、b 分别接在 A、B 上');
    ok(!(await exists(ids.x)), '(1) X 被换成了构造点（X 这个自由点不在了）');
    const xaFrom = await p.evaluate((xa) => { const l = UI.S.scene.links.find((x) => x.to === xa && x.toPort === 'a'); return l ? l.from : null; }, ids.xa);
    ok(!!gm && xaFrom === gm, '(1) 原来接在 X 上的线改接到中点器材的输出上');
    ok((await undoLen()) - u0 === 1, '(1) 整串（中点器材 + 改接）是一个撤销项（撤销栈增加 ' + ((await undoLen()) - u0) + '）');
    ok(seen.indexOf('AB 的中点') >= 0, '(4) 拖动到中点时画布上写出“AB 的中点”：「' + seen + '」');

    // 撤销：X 回来，中点器材没有了
    await back();
    await inv('撤销中点吸附');
    ok((await exists(ids.x)) && (await ents('gmid')).length === 0 && (await xy(ids.x)) !== null, '(1) 撤销后 X 回来，中点器材没有了');

    // ---------- (2) 交点：AB 和 CD 的交点 (10/3, 5/3) ----------
    const [pc] = await scr([{ x: 10 / 3, y: 5 / 3 }]);
    await dragX(pc);
    await inv('拖动 X 到交点');
    const gcs = await ents('gcross');
    ok(gcs.length === 1, '(2) 靠近两条线的交点：建了交点器材（gcross），实际 ' + gcs.length + ' 个');
    if (gcs[0]) {
      const f = await linksInto(gcs[0]);
      const want = [ids.a, ids.b, ids.c, ids.d];
      ok(['a', 'b', 'c', 'd'].every((port, i) => f.some((x) => x.toPort === port && x.from === want[i])), '(2) 交点器材的 a、b、c、d 分别接 A、B、C、D');
    }
    ok(!(await exists(ids.x)), '(2) X 被换成了交点');
    await back();
    await inv('撤销交点吸附');

    // ---------- (3) 垂足：R 到直线 AB 的垂足 (24/5, 12/5) ----------
    const [pf] = await scr([{ x: 24 / 5, y: 12 / 5 }]);
    await dragX(pf);
    await inv('拖动 X 到垂足');
    const gps = await ents('gperp');
    ok(gps.length === 1, '(3) 靠近 R 到 AB 的垂足：建了垂足器材（gperp），实际 ' + gps.length + ' 个');
    if (gps[0]) {
      const f = await linksInto(gps[0]);
      ok(f.some((x) => x.toPort === 'p' && x.from === ids.r) && f.some((x) => x.toPort === 'a' && x.from === ids.a) && f.some((x) => x.toPort === 'b' && x.from === ids.b), '(3) 垂足器材的 p 接 R，a、b 分别接 A、B');
    }
    await back();
    await inv('撤销垂足吸附');

    // ---------- (5) 吸附开关：关闭时拖动不吸附 ----------
    const btn = p.locator('[data-fbar="snap"][data-ws="' + ids.ws + '"]').first();
    ok((await btn.count()) === 1, '(5) 工作区工具条里有“吸附”开关');
    await btn.click(); await p.waitForTimeout(150);
    ok((await btn.getAttribute('aria-pressed')) !== 'true', '(5) 点一下，吸附开关关了（aria-pressed=' + (await btn.getAttribute('aria-pressed')) + '）');
    const [pm2] = await scr([{ x: 3, y: 1.5 }]);
    await dragX(pm2);
    await inv('吸附关闭时拖动到中点');
    ok((await ents('gmid')).length === 0 && (await exists(ids.x)), '(5) 吸附关闭：拖到中点也不建中点器材，X 还在');
    const xy5 = await xy(ids.x);
    ok(!!xy5 && Number.isInteger(xy5[0]) && Number.isInteger(xy5[1]), '(5) 吸附关闭：X 落在整数格点上：' + JSON.stringify(xy5));
    await p.locator('[data-fbar="snap"][data-ws="' + ids.ws + '"]').first().click(); await p.waitForTimeout(150);
    ok((await p.locator('[data-fbar="snap"][data-ws="' + ids.ws + '"]').first().getAttribute('aria-pressed')) === 'true', '(5) 再点一下，吸附开关开了');

    // ---------- (6) 按住 Alt 拖动：不吸附 ----------
    await back();   // 撤销“吸附关闭时拖动”那一步，X 回到原来的地方
    const [pm3] = await scr([{ x: 3, y: 1.5 }]);
    await dragX(pm3, { alt: true });
    await inv('按住 Alt 拖动到中点');
    ok((await ents('gmid')).length === 0 && (await exists(ids.x)), '(6) 按住 Alt 拖到中点：不吸附，没有建中点器材');

    // ---------- (7) 远离构造点：不吸附 ----------
    await back();
    const [pfar] = await scr([{ x: -1, y: -3 }]);
    const countBefore = (await p.evaluate(() => Object.keys(UI.S.scene.entities).length));
    await dragX(pfar);
    await inv('拖到远离构造点的地方');
    const countAfter = (await p.evaluate(() => Object.keys(UI.S.scene.entities).length));
    ok(countAfter === countBefore && (await exists(ids.x)), '(7) 远离构造点：不建新器材，X 还在自由点的位置');
    await back();

    // ---------- (1b) 顶点的顺序：连线列表里的位置不变 ----------
    const idxBefore = await p.evaluate((xa) => UI.S.scene.links.findIndex((l) => l.to === xa && l.toPort === 'a'), ids.xa);
    const linkCountBefore = await p.evaluate(() => UI.S.scene.links.length);
    await dragX(pm);
    await inv('拖动 X 到中点（顺序检查）');
    const idxAfter = await p.evaluate((xa) => UI.S.scene.links.findIndex((l) => l.to === xa && l.toPort === 'a'), ids.xa);
    const linkCountAfter = await p.evaluate(() => UI.S.scene.links.length);
    // X 原来的一根线（XA）改接到中点器材上，线的条数不变；新增的是中点器材的两根输入线（A、B 接进去）
    ok(idxBefore === idxAfter && idxAfter >= 0 && linkCountAfter === linkCountBefore + 2, '(1b) 改接之后线的位置不变（' + idxBefore + ' → ' + idxAfter + '）；线的条数只多了中点器材的两根输入线（' + linkCountBefore + ' → ' + linkCountAfter + '）');
  } catch (e) {
    fail++; console.log('  FAIL 测试中断：' + e.message);
  }

  ok(errs.length === 0, '没有控制台错误' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n拖动吸附到构造点测试 2：' + pass + ' 通过，' + fail + ' 失败');
  await b.close();
  process.exit(fail ? 1 : 0);
})();
