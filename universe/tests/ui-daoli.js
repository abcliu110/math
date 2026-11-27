/* node tests/ui-daoli.js —— 道理地图和“两边一样：四种样子”（docs/essence-forms.md 第六节、第七节第 3 批 B）：真实鼠标。
 *  1. 实验库点“道理地图” → 12 个节点、12 条箭头；点灰的“拆开再拼” → 列出它出现过的操作台，点一台去做它的一道题。
 *  2. 再从实验库进地图 → 点“两边一样” → “两边一样：四种样子”那一页（3 道四块题 + 3 道“先两种样子”）→ 点 3x + 2 = x + 10。
 *  3. 四块（天平、式子、线段图、数轴）连成一组：“怎么玩”不自动展开；1440×900 下卡片缩放 ≥ 下限、步骤栏不挡卡片。
 *     四块上各用真实鼠标做一步：线段图剪掉一段 x、天平拖走一个砝码、数轴落点往左拖、式子点“两边 ÷ 2”，每一步另外三块跟着变；
 *     撤销一次四块一起退回；关掉天平的“两边一起动”只拖一边 → 四块都“不平”，撤销回来；解出来；答追问（先答错再答对）。
 *  4. 1024×768：地图放得下、字不缩小太多；四块题的卡片缩放 ≥ 下限。
 *  不检查卡片排版细节和步骤栏的文字（那是第 3 批 A，tests/ui-forms.js 查）。SHOT_DIR 有值时存截图（daoli-*.png）。
 * 需要 playwright（NODE_PATH 指向它的 node_modules）。 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const url = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/');
const SP = process.env.SHOT_DIR;
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(url); await p.waitForTimeout(500);
  const closeDlg = () => p.evaluate(() => { if (UI.Panels.closeDialog) UI.Panels.closeDialog(); });
  const shot = async (n) => { if (SP) await p.screenshot({ path: path.join(SP, n) }); };
  const dlgOpen = () => p.evaluate(() => document.querySelector('#dlg').classList.contains('open'));
  // 从实验库点“道理地图”（左栏收起时先展开）
  const openMap = async () => {
    await closeDlg();
    await p.evaluate(() => { if (UI.S.tab !== 'lab') { UI.S.tab = 'lab'; UI.Panels.renderLeft(); } });
    const it = p.locator('#leftbody [data-daoli="map"]');
    if (!(await it.isVisible())) { const lb = p.locator('#lrail, .lrail, [data-rail="left"]').first(); if (await lb.count()) await lb.click(); await p.waitForTimeout(200); }
    await it.scrollIntoViewIfNeeded(); await it.click(); await p.waitForTimeout(250);
  };
  // 开题后的引导：关掉开场的对话框、跳过预测，盯住里程碑
  const settleIntro = async () => {
    await p.waitForTimeout(300);
    await p.evaluate(() => { document.querySelectorAll('button').forEach((x) => { if (/^(知道了|跳过|先不猜|开始|先不猜，直接做)$/.test(x.textContent.trim())) x.click(); }); });
    await p.waitForTimeout(150); await closeDlg();
    await p.evaluate(() => { if (UI.S.run) UI.S.run.armed = true; UI.Stage.render(); });
    await p.waitForTimeout(200);
  };
  const idOf = (role) => p.evaluate((r) => Object.values(UI.S.scene.entities).find((x) => x.role === r).id, role);
  const props = async (role) => p.evaluate((id) => Object.assign({}, UI.S.scene.entities[id].props), await idOf(role));
  const out = async (role, port) => p.evaluate(([id, port]) => { const v = UI.S.D[id].out[port]; return v ? U.Q.show(v.data) : null; }, [await idOf(role), port]);
  const abcd = async (role) => { const q = await props(role); return (role === 'b' ? [q.lx, q.lc, q.rx, q.rc] : role === 't' ? [q.ka, q.ea, q.kb, q.eb] : role === 'n' ? [q.qa, q.qb, q.qc, q.qd] : [q.a, q.b, q.c, q.d]).join(','); };
  const all4 = async () => [await abcd('b'), await abcd('e'), await abcd('t'), await abcd('n')];
  const same4 = async (v) => (await all4()).every((x) => x === v);
  const lastLog = () => p.evaluate(() => { const g = (UI.S.scene.groups || [])[0], l = g && g.log[g.log.length - 1]; return l ? { label: l.label, rule: l.rule, by: l.by, n: g.log.length } : { n: 0 }; });
  const done = (id) => p.evaluate((id) => !!(UI.S.run && UI.S.run.ms[id] && UI.S.run.ms[id].done), id);
  const click = async (loc) => { await closeDlg(); try { await loc.click({ timeout: 2500 }); } catch (e) { await closeDlg(); await loc.click(); } await p.waitForTimeout(200); };
  const press = async (role, label) => click(p.locator('.card[data-id="' + (await idOf(role)) + '"] svg.bdy g[data-pick-set]').filter({ hasText: label }).first());
  const undo = async () => { await closeDlg(); await p.keyboard.press('Control+z'); await p.waitForTimeout(300); };
  const k = async (role) => p.evaluate((id) => { const sv = document.querySelector('.card[data-id="' + id + '"] svg.bdy'); return sv.getBoundingClientRect().width / +sv.getAttribute('width'); }, await idOf(role));
  const gripAt = async (role, gid) => p.evaluate(([id, gid]) => { const g = document.querySelector('.card[data-id="' + id + '"] svg.bdy [data-grip="' + gid + '"]'); if (!g) return null; const r = g.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, [await idOf(role), gid]);
  const dragGrip = async (role, gid, dx, dy) => {
    await closeDlg();
    const g = await gripAt(role, gid), s = await k(role), x1 = g.x + dx * s, y1 = g.y + (dy || 0) * s;
    await p.mouse.move(g.x, g.y); await p.mouse.down(); await p.mouse.move((g.x + x1) / 2, (g.y + y1) / 2, { steps: 6 }); await p.mouse.move(x1, y1, { steps: 6 });
    await p.mouse.up(); await p.waitForTimeout(300);
  };
  const scales = () => p.evaluate(() => [...document.querySelectorAll('.card svg.bdy')].map((sv) => sv.getBoundingClientRect().width / +sv.getAttribute('width')));
  const minZ = () => p.evaluate(() => UI.LAYOUT.GROUP.minZ);
  // 步骤栏和每张卡片（在屏幕上能看到的部分）不重叠
  const barClear = () => p.evaluate(() => {
    const bar = document.querySelector('.stepbar'); if (!bar) return false;
    const br = bar.getBoundingClientRect();
    return [...document.querySelectorAll('.card')].every((c) => { const r = c.getBoundingClientRect(); return r.bottom <= br.top + 1 || r.top >= br.bottom - 1 || r.right <= br.left || r.left >= br.right; });
  });

  console.log('1. 实验库 → 道理地图 → 灰的节点');
  await openMap();
  ok(await dlgOpen() && await p.evaluate(() => document.querySelectorAll('#dlg svg.dl-map [data-dl-node]').length) === 12, '实验库点“道理地图”：对话框里 12 个节点');
  ok(await p.evaluate(() => document.querySelectorAll('#dlg svg.dl-map [data-arrow]').length) === 12 && await p.evaluate(() => !!document.querySelector('#dlg [data-arrow="E3-E4"]') && !!document.querySelector('#dlg [data-arrow="E2-E4"]') && !!document.querySelector('#dlg [data-arrow="E4-E5"]')), '12 条箭头（按 essences.md 第三节：度量 → 两边一样、拆开再拼 → 两边一样、两边一样 → 变中不变……）');
  const mapTx = await p.evaluate(() => document.querySelector('#dlg .box').textContent);
  ok(mapTx.includes('两边一样') && mapTx.includes('配成对') && !mapTx.includes('本质'), '节点写孩子能懂的名字，没有“本质”两个字');
  ok(await p.evaluate(() => document.querySelectorAll('#dlg [data-dl-node][data-open]').length) === 1 && await p.evaluate(() => !!document.querySelector('#dlg [data-dl-node="E4"][data-open]')), '只有“两边一样”能点进去');
  await shot('daoli-1440-map.png');
  await p.locator('#dlg [data-dl-node="E2"]').click(); await p.waitForTimeout(200);
  const benches = await p.evaluate(() => [...document.querySelectorAll('#dlg [data-dl-info="E2"] [data-dl-bench]')].map((x) => ({ t: x.dataset.dlBench, pid: x.dataset.pid || '', e2: (U.types[x.dataset.dlBench].essence || []).includes('E2') })));
  ok(benches.length >= 3 && benches.every((x) => x.e2), '点灰的“拆开再拼”：列出它出现过的 ' + benches.length + ' 台操作台（都写了 E2）');
  const first = benches.find((x) => x.pid);
  await p.locator('#dlg [data-dl-bench="' + first.t + '"]').click(); await p.waitForTimeout(400);
  ok(await p.evaluate(() => UI.S.problem && UI.S.problem.id) === first.pid, '点一台（' + first.t + '）：去做它的一道题 ' + first.pid);
  await settleIntro();

  console.log('2. 道理地图 → 两边一样：四种样子 → 四块题');
  await openMap();
  await p.locator('#dlg [data-dl-node="E4"]').click(); await p.waitForTimeout(250);
  const page = await p.evaluate(() => { const pg = document.querySelector('#dlg [data-dl-page]'); return pg ? { tx: pg.textContent, ids: [...pg.querySelectorAll('.it[data-pid]')].map((x) => x.dataset.pid) } : null; });
  ok(page && page.tx.includes('两边一样：四种样子') && page.tx.includes('先两种样子'), '点“两边一样”：进到“两边一样：四种样子”那一页');
  ok(page && ['ef4-2x3-11', 'ef4-x5-12', 'ef4-3x2-x10', 'ef-2x3-11', 'ef-3x2-x10', 'ef-x5-12'].every((id) => page.ids.includes(id)), '列出 3 道四块题和 3 道两块题');
  await p.locator('#dlg [data-dl-back]').click(); await p.waitForTimeout(200);
  ok(await p.evaluate(() => !!document.querySelector('#dlg svg.dl-map')), '“回到道理地图”回得去');
  await p.locator('#dlg [data-dl-node="E4"]').click(); await p.waitForTimeout(250);
  await p.locator('#dlg .it[data-pid="ef4-3x2-x10"]').click(); await p.waitForTimeout(400);
  ok(await p.evaluate(() => UI.S.problem && UI.S.problem.id) === 'ef4-3x2-x10', '点“四种样子一起做： 3x + 2 = x + 10”：开题');
  ok(await p.evaluate(() => { const ids = (UI.S.scene.groups || [])[0].members; return ids.length === 4 && ids.every((id) => UI.S.help[id] === false) && !document.querySelector('.card .howto'); }), '四块连成一组；“怎么玩”不自动展开（不盖住下面一排卡片）');
  await settleIntro();

  console.log('3. 四块各做一步（1440×900）');
  ok(await same4('3,2,1,10'), '开场四块都是 3x + 2 = x + 10');
  ok(await p.evaluate(() => document.querySelectorAll('.card .port, .card .pl, .pill').length) === 0, '四块都不画口');
  { const z = await scales(), mz = await minZ(); ok(z.length === 4 && z.every((v) => v >= mz - 1e-6), '卡片缩放 ' + z.map((v) => v.toFixed(2)).join('、') + ' ≥ ' + mz); }
  ok(await barClear(), '步骤栏不挡卡片');
  const ids = { b: await idOf('b'), e: await idOf('e'), t: await idOf('t'), n: await idOf('n') };
  // 线段图
  await press('t', '两条都剪掉一段 x');
  let L = await lastLog();
  ok(await same4('2,2,0,10') && L.by === ids.t && L.label === '两边同时减 x', '线段图：点“两条都剪掉一段 x” → 天平、式子、数轴都变成 2x + 2 = 10（记作“两边同时减 x”，在线段图上做的）');
  ok(await done('onex'), '里程碑：x 只在一边了');
  await undo();
  ok(await same4('3,2,1,10') && (await lastLog()).n === 0, '撤销一次：四块一起退回 3x + 2 = x + 10');
  await press('t', '两条都剪掉一段 x');
  ok(await same4('2,2,0,10'), '再做一次：四块又是 2x + 2 = 10');
  // 天平
  await dragGrip('b', 'lw', 0, -200);
  L = await lastLog();
  ok(await same4('2,1,0,9') && L.by === ids.b && L.label === '两边同时减 1', '天平：拖走左盘一个砝码 → 式子、线段图、数轴都变成 2x + 1 = 9');
  // 数轴：先拖 g 到 4（不算一步），再把上面的落点往左拖 1
  const u = await p.evaluate((id) => U.NumLineBench.eqModel(UI.S.scene.entities[id].props).u, ids.n);
  await dragGrip('n', 'g', 4 * u, 0);
  ok((await props('n')).g === 4 && (await lastLog()).n === 2 && await out('n', 'meet') === '1', '数轴：拖 g 到 4，两个落点重合；改 g 不算一步');
  await dragGrip('n', 'L', -1 * u, 0);
  L = await lastLog();
  ok(await same4('2,0,0,8') && L.by === ids.n && L.label === '两边同时减 1', '数轴：上面的落点往左拖 1 → 天平、式子、线段图都变成 2x = 8');
  // 只动一边：四块都不平
  await press('b', '两边一起动：开');
  await dragGrip('b', 'rw', 0, -200);
  const tapeEq = () => p.evaluate((id) => { const m = U.TapeBench.model(UI.S.scene.entities[id].props); return m.a === m.b; }, ids.t);
  ok(await same4('2,0,0,7') && (await lastLog()).rule === 'balance.lone', '关掉“两边一起动”，只拖走右盘一个砝码：四块都变成 2x ≠ 7');
  ok(await out('b', 'okn') === '0' && await out('e', 'okn') === '0' && !(await tapeEq()) && await out('n', 'meet') === '0', '四块都“不平”：天平歪、式子写 ≠、线段对不齐、数轴落点分开');
  await shot('daoli-1440-lone.png');
  await undo();
  ok(await same4('2,0,0,8') && await out('b', 'okn') === '1' && await tapeEq() && await out('n', 'meet') === '1', '撤销一次：四块一起回到 2x = 8，又都平了');
  // 式子
  await press('e', '两边 ÷ 2');
  L = await lastLog();
  ok(await same4('1,0,0,4') && L.by === ids.e && L.label === '两边同时除以 2', '式子：点“两边 ÷ 2” → 天平、线段图、数轴都变成 x = 4');
  ok(await out('e', 'solved') === '4' && await out('b', 'solved') === '4' && await done('solve'), '解出来了：x = 4，里程碑完成');
  // 追问
  await press('e', '不是：砝码和数不一样');
  ok(!(await done('why')) && (await p.evaluate((id) => document.querySelector('.card[data-id="' + id + '"] svg.bdy').textContent, ids.e)).includes('再想想'), '追问答错（“不是：砝码和数不一样”）：写“再想想”，里程碑不算');
  await press('e', '是：都是两边做同样的事');
  ok(await done('why') && await out('e', 'q1') === '3', '追问答对（“是：都是两边做同样的事”）：里程碑完成');
  await p.waitForTimeout(900); await closeDlg(); await p.waitForTimeout(200);   // “做完了”的对话框关掉再截图
  await shot('daoli-1440-page.png');

  console.log('4. 1024×768');
  await p.setViewportSize({ width: 1024, height: 768 }); await p.waitForTimeout(400);
  await openMap();
  const mz = await p.evaluate(() => { const sv = document.querySelector('#dlg svg.dl-map'), r = sv.getBoundingClientRect(); return { right: r.right, k: r.width / 840 }; });
  ok(mz.right <= 1024 && mz.k >= 0.8, '地图放得下（右边 ' + Math.round(mz.right) + '），缩放 ' + mz.k.toFixed(2) + ' ≥ 0.8');
  await shot('daoli-1024-map.png');
  await p.locator('#dlg [data-dl-node="E4"]').click(); await p.waitForTimeout(250);
  await p.locator('#dlg .it[data-pid="ef4-2x3-11"]').click(); await p.waitForTimeout(400);
  await settleIntro();
  { const z = await scales(), m = await minZ(); ok(await p.evaluate(() => UI.S.problem.id) === 'ef4-2x3-11' && z.length === 4 && z.every((v) => v >= m - 1e-6), '1024×768 四块题：卡片缩放 ' + z.map((v) => v.toFixed(2)).join('、') + ' ≥ ' + m); }
  await dragGrip('b', 'lw', 0, -200);
  ok(await same4('2,2,0,10'), '1024×768：天平上拖走一个砝码，另外三块跟着变');
  await shot('daoli-1024-page.png');

  ok(await p.evaluate(() => !UI.S.inspOpen), '全程没有打开属性面板');
  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n道理地图和四种样子测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close(); process.exit(fail ? 1 : 0);
})().catch((e) => { console.log('FAIL 测试异常：' + e.message); process.exit(1); });
