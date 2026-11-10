/* node tests/ui-cross2.js —— 跨工作台（D7 剩余：分数的公式、几何面积读数作为数据源），真实鼠标写一道示例题。
 * 示例题：三角形面积 S = ½ × a × h。几何台面上是直角三角形 ABC（A(0,0)、B(6,0)、C(0,4)）：
 *   (a) 真实鼠标单击三角形，台面读数写着面积 12，两条直角边的读数是 6 和 4（学生从读数里得到 a = 6、h = 4）；
 *   (b) 真实鼠标拖出「面积读数」「式子工作台」「代数式卡」并连线：三角形 → 面积读数 → 式子工作台的「几何的面积」口，
 *       代数式卡写 ½ × a × h → 式子工作台的「公式的右边」口；式子工作台写着 S = ½·a·h（不用手动抄数字）；
 *   (c) 双击式子工作台，代入 a = 6、h = 4（真实键盘输入、点按钮）：S = 12，写着「解：S = 12」，解出来了；
 *       检查器里写着「几何台面的面积是 12，和式子算出的 S 一致」；
 *   (d) 真实鼠标拖动顶点 C 到 (0, 5)：台面读数变成面积 15，面积读数的输出变成 15，式子工作台立刻写着「对不上」，解不再算数；
 *   (e) 撤销到第 1 步（只代入了 a），再代入 h = 5：S = 15，写着「一致」，解出来了；
 *   (f) 没有页面错误和控制台错误。
 * 需要 playwright（NODE_PATH 指向它的 node_modules）。 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const G = require('./gestures');
const url = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();

(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  G.attachErrorCollector(p);
  await p.goto(url); await p.waitForTimeout(300);
  await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); });
  await p.waitForTimeout(150);

  // 工作区坐标 → 屏幕坐标（和 ui-readout 一样）
  const ro = (ws, kind) => p.evaluate(({ ws, kind }) => [...document.querySelectorAll('.card[data-id="' + ws + '"] svg.wsbody [data-ro' + (kind ? '="' + kind + '"' : '') + ']')].map((t) => t.textContent), { ws, kind });
  const pickOf = (ws, id) => p.evaluate(([ws, id]) => { const v = UI.StageCtx.wsVisible(UI.S.scene.entities[ws]).find((x) => x.id === id); return v ? UI.StageCtx.pickOf(v) : null; }, [ws, id]);
  const hitPoint = (ws, pick) => p.evaluate(([ws, pick]) => {
    const wb = document.querySelector('.card[data-id="' + ws + '"] svg.wsbody'), r = wb.getBoundingClientRect();
    for (let y = r.top + 6; y < r.bottom - 6; y += 4) for (let x = r.left + 6; x < r.right - 6; x += 4) {
      const el = document.elementFromPoint(x, y), pk = el && el.closest && el.closest('[data-pick]');
      if (pk && pk.dataset.pick === pick && pk.closest('svg.wsbody') === wb && !el.closest('[data-hdl]')) return { x, y };
    }
    return null;
  }, [ws, pick]);
  // 真实拖一个器材瓦片到台面上的某一点，返回新出现的卡片 id
  const dropTile = async (type, x, y) => {
    const before = await p.evaluate(() => Object.keys(UI.S.scene.entities));
    const t = p.locator('.tile[data-type="' + type + '"]').first(); await t.scrollIntoViewIfNeeded();
    const bb = await t.boundingBox(); await p.mouse.move(bb.x + 30, bb.y + 20); await p.mouse.down(); await p.mouse.move(x, y, { steps: 10 }); await p.mouse.up();
    await p.waitForTimeout(200);
    const after = await p.evaluate(() => Object.keys(UI.S.scene.entities));
    return after.find((id) => before.indexOf(id) < 0) || null;
  };
  // 真实鼠标连线：出口（fromId 的 fromPort）拖到入口（toId 的 toPort）
  const link = async (fromId, fromPort, toId, toPort) => {
    const a = await p.locator('.port.out[data-id="' + fromId + '"][data-port="' + fromPort + '"]').first().boundingBox();
    await p.mouse.move(a.x + 9, a.y + 9); await p.mouse.down();
    const t = await p.locator('.port.in[data-id="' + toId + '"][data-port="' + toPort + '"]').first().boundingBox();
    await p.mouse.move(t.x + t.width / 2, t.y + t.height / 2, { steps: 10 }); await p.mouse.up();
    await p.waitForTimeout(200);
  };
  const linked = (from, fromPort, to, toPort) => p.evaluate(([from, fromPort, to, toPort]) => UI.S.scene.links.some((l) => l.from === from && l.fromPort === fromPort && l.to === to && l.toPort === toPort), [from, fromPort, to, toPort]);

  console.log('搭场景：直角三角形 ABC（A(0,0)、B(6,0)、C(0,4)），放在几何台面上（点和多边形用画布的数据，和 ui-readout 一样）');
  const ids = await p.evaluate(() => {
    const A = UI.App;
    const ws = A.act({ t: 'add', type: 'gworkspace', x: 120, y: 60 }).id;
    const pt = (name, x, y) => { const n = A.act({ t: 'add', type: 'gpt', x: 0, y: 0, props: { x, y, mark: name } }).id; A.act({ t: 'rename', id: n, name }); A.act({ t: 'put', id: n, parent: ws, slot: 'items' }); return n; };
    const a = pt('A', 0, 0), bb = pt('B', 6, 0), c = pt('C', 0, 4);
    const poly = A.act({ t: 'add', type: 'gpoly', x: 0, y: 0 }).id;
    for (const q of [a, bb, c]) A.act({ t: 'link', from: q, fromPort: 'p', to: poly, toPort: 'pts' });
    A.act({ t: 'put', id: poly, parent: ws, slot: 'items' });
    UI.Stage.fit(); UI.Stage.render();
    return { ws, poly, c };
  });
  await p.waitForTimeout(250);
  // 器材从右边的器材架拖到台面外面（工作区右边）
  const area = await dropTile('garea', 1000, 260);
  const x = await dropTile('exprbench', 1000, 520);
  const alg = await dropTile('algebra', 1000, 640);
  ok(!!area && !!x && !!alg, '拖出面积读数、式子工作台、代数式卡各一个');
  // 第一次进入几何工作区的引导挡住台面：点「知道了」关掉；代数式卡拖到台面下方空的地方，连线的口露在外面
  if (await p.locator('button:has-text("知道了")').first().isVisible().catch(() => false)) await p.locator('button:has-text("知道了")').first().click();
  const algHd = await p.locator('.card[data-id="' + alg + '"] .hd').first().boundingBox();
  await G.dragPath(p, { x: algHd.x + algHd.width / 2, y: algHd.y + algHd.height / 2 }, { x: 800, y: 770 });

  console.log('(a) 真实鼠标单击三角形：读数写着面积 12，两条直角边 6 和 4');
  const polyPick = await pickOf(ids.ws, ids.poly);
  const tp = await hitPoint(ids.ws, polyPick);
  ok(!!tp, '三角形上有一个可以点的位置');
  await G.clickAt(p, tp.x, tp.y, '单击三角形');
  const areaTexts = await ro(ids.ws, 'area');
  ok(JSON.stringify(areaTexts) === JSON.stringify(['面积 12']), '读数写着「面积 12」（实际 ' + JSON.stringify(areaTexts) + '）');
  const sides = (await ro(ids.ws, 'side')).sort();
  ok(sides.indexOf('6') >= 0 && sides.indexOf('4') >= 0, '两条直角边的读数是 6 和 4（实际 ' + JSON.stringify(sides) + '）；学生据此写 a = 6、h = 4');

  console.log('(b) 真实鼠标连线：面积读数 → 式子工作台；代数式卡 → 式子工作台');
  // 三角形在工作区里，它的输出口不在卡片上，鼠标拖不到；这一根线由代码连（和 ui-readout 的搭场景一样）
  await p.evaluate(([from, to]) => UI.App.act({ t: 'link', from, fromPort: 'f', to, toPort: 'f' }), [ids.poly, area]);
  ok(await linked(ids.poly, 'f', area, 'f'), '三角形 → 面积读数 连上了（代码连的，见注释）');
  await link(area, 's', x, 'g');
  ok(await linked(area, 's', x, 'g'), '面积读数 → 式子工作台「几何来的面积」口 连上了');
  await link(alg, 'p', x, 'f');
  ok(await linked(alg, 'p', x, 'f'), '代数式卡 → 式子工作台「公式的右边」口 连上了');
  await p.dblclick('.card[data-id="' + alg + '"] .hd'); await p.waitForTimeout(150);
  const txt = p.locator('#insp input[data-k="text"]').first();
  await txt.click(); await txt.fill(''); await p.keyboard.type('½ × a × h'); await p.keyboard.press('Enter');
  await p.waitForTimeout(150);
  ok((await p.evaluate((id) => UI.S.scene.entities[id].props.text, alg)) === '½ × a × h', '代数式卡的式子写成 ½ × a × h');

  console.log('(c) 双击式子工作台：S = ½·a·h；代入 a = 6、h = 4，得到 S = 12');
  await p.dblclick('.card[data-id="' + x + '"] .hd'); await p.waitForTimeout(150);
  const now = () => p.locator('#insp .wb-now').innerText().then((s) => norm(s.replace('现在：', ''))).catch(() => '');
  const sub = () => p.locator('#insp [data-wb-field="sub"]');
  const steps = () => p.locator('#insp .wb-step').count();
  ok(/^S = (½|1\/2)·?a·?h$/.test(await now()), '式子工作台写着 S = ½·a·h，没有手动抄数字（实际：' + (await now()) + '）');
  await sub().click(); await sub().fill('a=6');
  await p.click('#insp [data-wb-tool="substitute"]'); await p.waitForTimeout(150);
  ok(/^S = 3·?h$/.test(await now()) && (await steps()) === 1, '代入 a = 6：S = 3h（实际：' + (await now()) + '）');
  await sub().click(); await sub().fill('h=4');
  await p.click('#insp [data-wb-tool="substitute"]'); await p.waitForTimeout(150);
  ok((await now()) === 'S = 12', '代入 h = 4：S = 12（实际：' + (await now()) + '）');
  ok(/解：S = 12/.test(await p.locator('#insp .wb-sol').innerText().catch(() => '')), '写着「解：S = 12」');
  ok(/几何台面的面积是 12，和式子算出的 S 一致/.test(await p.locator('#insp').innerText()), '写着「几何台面的面积是 12，和式子算出的 S 一致」');
  ok(await p.evaluate((id) => UI.S.D[id].out.solved.data === true, x), '「解出来了」输出为真');

  console.log('(d) 真实鼠标拖动顶点 C：(0, 4) → (0, 5)，读数和式子同步变化');
  const unit = await p.evaluate((ws) => document.querySelector('svg.wsbody[data-wsid="' + ws + '"]').getBoundingClientRect().width / UI.Stage.rangeOf(ws).span, ids.ws);
  const bx = await p.locator('circle[data-drag="' + ids.c + '"]').first().boundingBox();
  const cx = bx.x + bx.width / 2, cy = bx.y + bx.height / 2;
  await p.mouse.move(cx, cy); await p.mouse.down(); await p.mouse.move(cx, cy - unit, { steps: 10 }); await p.mouse.up();
  await p.waitForTimeout(300);
  // 读数只在选中时写出来：再真实鼠标点一下三角形
  const tp2 = await hitPoint(ids.ws, polyPick);
  await G.clickAt(p, tp2.x, tp2.y, '再单击三角形');
  ok((await ro(ids.ws, 'area')).join() === '面积 15', '拖动后读数写着「面积 15」（实际 ' + JSON.stringify(await ro(ids.ws, 'area')) + '）');
  ok(await p.evaluate((id) => String(UI.S.D[id].out.s.data.n) === '15', area), '面积读数的输出随之变成 15');
  const note = await p.locator('#insp [data-wb-area="off"]').innerText().catch(() => '');
  ok(/15/.test(note) && /12/.test(note) && /对不上/.test(note), '式子工作台立刻写着「对不上」（' + norm(note) + '）');
  ok(await p.evaluate((id) => UI.S.D[id].out.solved.data === false, x), '对不上时「解出来了」为假（解不再算数）');

  console.log('(e) 撤销到第 1 步（只代入了 a），再代入 h = 5：S = 15，一致');
  await p.click('#insp [data-wb-undo="1"]'); await p.waitForTimeout(150);
  await sub().click(); await sub().fill('h=5');
  await p.click('#insp [data-wb-tool="substitute"]'); await p.waitForTimeout(150);
  ok((await now()) === 'S = 15', '代入 h = 5：S = 15（实际：' + (await now()) + '）');
  ok(/几何台面的面积是 15，和式子算出的 S 一致/.test(await p.locator('#insp').innerText()), '写着「一致」');
  ok(await p.evaluate((id) => UI.S.D[id].out.solved.data === true, x), '「解出来了」为真');

  ok(errs.length === 0, '没有页面错误和控制台错误' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n跨工作台界面测试（真实鼠标）：' + pass + ' 通过，' + fail + ' 失败');
  await b.close();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.log('FAIL 测试异常：' + e.message); process.exit(1); });
