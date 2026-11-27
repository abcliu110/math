/* node tests/ui-forms.js —— 一个道理，几种样子（联动组，docs/essence-forms.md）：真实鼠标测试，台面上有两台器材。
 *  1. ef-2x3-11（天平 + 式子）：天平上拖走一个砝码 → 两边各少 1，式子往下写一行；撤销一次两台一起退回；
 *     在式子上点 3 再点“两边都减 3” → 天平两盘各少 3；关掉“两边一起动”只拖一边 → 天平歪、式子写 ≠（两台都不平）。
 *  2. ef-3x2-x10（线段图 + 式子）：拖上面一条右端往左 2 格 → 两条一起剪 2，式子写 3x = x + 8；撤销一次两台一起退回；
 *     点“两条都剪掉一段 x” → 式子 2x + 2 = 10；关掉“两条一起剪”只剪一条 → 两条对不齐、式子写 ≠。
 *  3. ef-x5-12（数轴 + 式子）：拖 g 到 7 → 两个落点重合，式子不写新的一行（改 g 不算一步），里程碑完成；
 *     拖上面的落点往左 5 格 → 两个落点一起走，式子写 x = 7；撤销一次两台一起退回；关掉“两边一起动”只拖下面的落点 → 落点分开、式子写 ≠。
 *  4. 联动组的台面（第 3 批 A）：两台连成一组也是操作台模式（没有口、没有药丸，标题栏有“显示口”）；卡片自动排好，缩放不低于 0.75（UI.LAYOUT.GROUP.minZ，
 *     1440×900 和 1024×768 都量）；共用步骤栏写“第 n 步：……（在哪一台上做的）”，只动一边的标红；做一步以后另一台有闪动的元素、做这一步的那台没有；
 *     式子台点一项选中不进撤销（撤销一次就退回上一步）；数轴在组里“换一种”锁住，点了说为什么、用法不变。
 *  5. 全程没有打开属性面板；控制台 0 报错。SHOT_DIR 有值时存截图。
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
  await p.goto(url); await p.waitForTimeout(400);
  const closeDlg = () => p.evaluate(() => { if (UI.Panels.closeDialog) UI.Panels.closeDialog(); });
  const shot = async (n) => { if (SP) await p.screenshot({ path: path.join(SP, n) }); };
  const open = async (id) => {
    await p.waitForTimeout(700); await closeDlg();
    await p.evaluate((id) => { UI.App.openProblem(id, 'practice'); }, id); await p.waitForTimeout(300);
    await p.evaluate(() => {
      document.querySelectorAll('button').forEach((x) => { if (/^(知道了|跳过|先不猜|开始)$/.test(x.textContent.trim())) x.click(); });
      for (const k of Object.keys(UI.S.help || {})) UI.S.help[k] = false;
      if (UI.S.run) UI.S.run.armed = true;
      UI.Stage.render();
    });
    await p.waitForTimeout(250);
  };
  const idOf = (role) => p.evaluate((r) => Object.values(UI.S.scene.entities).find((x) => x.role === r).id, role);
  const props = async (role) => p.evaluate((id) => Object.assign({}, UI.S.scene.entities[id].props), await idOf(role));
  const out = async (role, port) => p.evaluate(([id, port]) => { const v = UI.S.D[id].out[port]; return v ? U.Q.show(v.data) : null; }, [await idOf(role), port]);
  const abcd = async (role) => { const q = await props(role); return (q.lx !== undefined ? [q.lx, q.lc, q.rx, q.rc] : q.ka !== undefined ? [q.ka, q.ea, q.kb, q.eb] : q.qa !== undefined && q.mode === 4 ? [q.qa, q.qb, q.qc, q.qd] : [q.a, q.b, q.c, q.d]).join(','); };
  const done = (id) => p.evaluate((id) => !!(UI.S.run && UI.S.run.ms[id] && UI.S.run.ms[id].done), id);
  const click = async (loc) => { await closeDlg(); try { await loc.click({ timeout: 2500 }); } catch (e) { await closeDlg(); await loc.click(); } await p.waitForTimeout(180); };
  const press = async (role, label) => click(p.locator('.card[data-id="' + (await idOf(role)) + '"] svg.bdy g[data-pick-set]').filter({ hasText: label }).first());
  const undo = async () => { await closeDlg(); await p.keyboard.press('Control+z'); await p.waitForTimeout(250); };
  // 卡片画布上 1 个单位多少屏幕像素：svg 的屏幕宽 / 画布宽
  const k = async (role) => p.evaluate((id) => { const sv = document.querySelector('.card[data-id="' + id + '"] svg.bdy'); return sv.getBoundingClientRect().width / +sv.getAttribute('width'); }, await idOf(role));
  const gripAt = async (role, gid) => p.evaluate(([id, gid]) => { const g = document.querySelector('.card[data-id="' + id + '"] svg.bdy [data-grip="' + gid + '"]'); if (!g) return null; const r = g.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, [await idOf(role), gid]);
  // 按住把手，往右挪 dx、往下挪 dy（卡片画布单位），中途停一下看“正在拖”的样子
  const dragGrip = async (role, gid, dx, dy, mid) => {
    await closeDlg();
    const g = await gripAt(role, gid), s = await k(role), x1 = g.x + dx * s, y1 = g.y + (dy || 0) * s;
    await p.mouse.move(g.x, g.y); await p.mouse.down(); await p.mouse.move((g.x + x1) / 2, (g.y + y1) / 2, { steps: 6 }); await p.mouse.move(x1, y1, { steps: 6 });
    if (mid) await mid();
    await p.mouse.up(); await p.waitForTimeout(250);
  };
  const tapeSc = async () => p.evaluate((id) => U.TapeBench.scaleOf(U.TapeBench.model(UI.S.scene.entities[id].props)), await idOf('t'));
  const cardText = async (role) => p.evaluate((id) => document.querySelector('.card[data-id="' + id + '"] svg.bdy').textContent, await idOf(role));
  // 联动组的台面：口的 DOM、卡片在屏幕上的缩放（svg 屏幕宽 / 画布宽）、步骤栏每一行、闪动的元素
  const ports = () => p.evaluate(() => document.querySelectorAll('.card .port, .card .pl, .pill').length);
  const scales = () => p.evaluate(() => [...document.querySelectorAll('.card svg.bdy')].map((sv) => sv.getBoundingClientRect().width / +sv.getAttribute('width')));
  const minZ = () => p.evaluate(() => UI.LAYOUT.GROUP.minZ);
  const barRows = () => p.evaluate(() => [...document.querySelectorAll('.stepbar .sbr')].map((x) => (x.classList.contains('lone') ? '!' : '') + x.textContent));
  const flashIn = async (role) => p.evaluate((id) => document.querySelectorAll('.card[data-id="' + id + '"] [data-flash]').length, await idOf(role));
  const undos = () => p.evaluate(() => UI.S.undo.length);
  const visible = async (role) => p.evaluate((id) => { const r = document.querySelector('.card[data-id="' + id + '"]').getBoundingClientRect(); return r.right <= innerWidth && r.bottom <= innerHeight + 400 && r.left >= 0; }, await idOf(role));

  console.log('1. 天平 + 式子：2x + 3 = 11');
  await open('ef-2x3-11');
  ok(await abcd('b') === '2,3,0,11' && await abcd('e') === '2,3,0,11', '开场两台都是 2x + 3 = 11');
  ok(await visible('b') && await visible('e'), '两台都在屏幕上');
  ok(await ports() === 0 && (await p.evaluate(() => (UI.benchMode() || []).length)) === 2, '联动组也是操作台模式：两台都不画口和药丸');
  ok(await p.evaluate(() => document.querySelectorAll('.card .hd [data-ports]').length) === 2, '两张卡片的标题栏都有“显示口”');
  { const z = await scales(), mz = await minZ(); ok(z.length === 2 && z.every((v) => v >= mz - 1e-6), '1440×900：卡片缩放不低于 ' + mz + '（' + z.map((v) => v.toFixed(2)).join('、') + '）'); }
  ok((await barRows()).length === 1 && /还没做步子/.test((await barRows())[0]), '共用步骤栏：还没做步子');
  await dragGrip('b', 'lw', 0, -200);
  ok(await abcd('b') === '2,2,0,10' && await abcd('e') === '2,2,0,10', '天平：拖走左盘一个砝码（两边一起动）→ 两盘各少 1，式子写 2x + 2 = 10');
  ok(/两边同时减 1/.test((await props('e')).rows), '式子旁边写着“两边同时减 1”');
  ok(JSON.stringify(await barRows()) === JSON.stringify(['第 1 步：两边同时减 1（在天平上做的）']), '共用步骤栏写“第 1 步：两边同时减 1（在天平上做的）”');
  ok(await flashIn('e') > 0 && await flashIn('b') === 0, '做完这一步：式子新的一行闪一下，天平（做这一步的那台）不闪');
  await undo();
  ok(await abcd('b') === '2,3,0,11' && await abcd('e') === '2,3,0,11' && !(await props('e')).rows, '撤销一次：两台一起退回 2x + 3 = 11');
  ok(await flashIn('e') === 0 && (await barRows()).length === 1 && /还没做步子/.test((await barRows())[0]), '撤销以后不闪，步骤栏也退回去');
  const u0 = await undos();
  const pick3 = async () => click(p.locator('.card[data-id="' + (await idOf('e')) + '"] svg.bdy g[data-pick-set]').filter({ has: p.locator('title', { hasText: '点一下：对这一项做一步' }) }).filter({ has: p.locator('text', { hasText: /^3$/ }) }).first());
  await pick3();
  ok((await props('e')).sel === 'Lc' && await undos() === u0, '式子上点 3：选中了，但不进撤销');
  await press('e', '两边都减 3');
  ok(await abcd('b') === '2,0,0,8', '再点“两边都减 3”：做了一步');
  await undo();
  ok(await abcd('b') === '2,3,0,11' && await abcd('e') === '2,3,0,11' && await undos() === u0, '撤销一次就退回上一步（不是只取消选中）');
  ok((await props('e')).sel === 'Lc', '退回的是做这一步之前的样子：3 还选着');
  await pick3();
  ok((await props('e')).sel === '' && await undos() === u0, '再点 3：取消选中，也不进撤销');
  await click(p.locator('.card[data-id="' + (await idOf('e')) + '"] svg.bdy g[data-pick-set]').filter({ has: p.locator('title', { hasText: '点一下：对这一项做一步' }) }).filter({ has: p.locator('text', { hasText: /^3$/ }) }).first());
  await press('e', '两边都减 3');
  ok(await abcd('e') === '2,0,0,8' && await abcd('b') === '2,0,0,8', '式子：点 3 再点“两边都减 3” → 天平两盘各少 3');
  ok(await flashIn('b') > 0 && await flashIn('e') === 0, '在式子上做的：天平把少掉的砝码闪一下，式子不闪');
  ok(/^第 1 步：两边同时减 3（在式子上做的）$/.test((await barRows()).slice(-1)[0]), '步骤栏写“在式子上做的”');
  ok(await done('apart'), '里程碑：盒子和砝码分开了');
  await press('b', '两边一起动：开');
  await dragGrip('b', 'rw', 0, -200);
  ok(await abcd('b') === '2,0,0,7' && await out('b', 'okn') === '0' && await out('e', 'okn') === '0', '关掉“两边一起动”，只拖走右盘一个砝码：天平歪、式子写 ≠（两台都不平）');
  ok((await cardText('e')).includes('≠'), '式子这一行写着 ≠');
  ok(/^!第 2 步：只在右边减 1（在天平上做的）/.test((await barRows()).slice(-1)[0]), '步骤栏：只动一边的这一步标红（' + (await barRows()).slice(-1)[0] + '）');
  await shot('forms-b2-balance.png');

  console.log('2. 线段图 + 式子：3x + 2 = x + 10');
  await open('ef-3x2-x10');
  ok(await abcd('t') === '3,2,1,10' && await abcd('e') === '3,2,1,10', '开场两台都是 3x + 2 = x + 10');
  const tp = await props('t');
  ok(tp.eqm === true && tp.u === 4 && !(await gripAt('t', 'u')) && !!(await gripAt('t', 'cb')) && !!(await gripAt('t', 'cd')), '线段图在等式模式：一段的长不能拖，两条右端各有一个把手');
  const tt = await cardText('t');
  ok(tt.includes('左边') && tt.includes('右边') && !tt.includes('一共要') && !/\b4\b/.test(tt.replace(/[0-9]+ 段/g, '')), '名字写左边右边，没有目标那一行，段上不写 4');
  let mid = '';
  await dragGrip('t', 'cb', -2 * (await tapeSc()), 0, async () => { mid = await p.evaluate((id) => document.querySelectorAll('.card[data-id="' + id + '"] svg.bdy [data-cut]').length, await idOf('t')); });
  ok(mid === 2, '拖的时候：两条都画出剪掉的那一截（两条一起变短）');
  ok(await abcd('t') === '3,0,1,8' && await abcd('e') === '3,0,1,8', '线段图：上面一条右端往左拖 2 格 → 两条各剪 2，式子写 3x = x + 8');
  await undo();
  ok(await abcd('t') === '3,2,1,10' && await abcd('e') === '3,2,1,10', '撤销一次：两台一起退回');
  await press('t', '两条都剪掉一段 x');
  ok(await abcd('t') === '2,2,0,10' && await abcd('e') === '2,2,0,10' && /两边同时减 x/.test((await props('e')).rows), '点“两条都剪掉一段 x” → 式子写 2x + 2 = 10，旁边写“两边同时减 x”');
  ok(await done('onex'), '里程碑：x 只在一边了');
  await press('t', '两条一起剪：开');
  await dragGrip('t', 'cb', -2 * (await tapeSc()), 0);
  ok(await abcd('t') === '2,0,0,10' && await out('e', 'okn') === '0', '关掉“两条一起剪”，只剪上面一条 2 格：式子写 ≠');
  ok(await p.evaluate((id) => !!document.querySelector('.card[data-id="' + id + '"] svg.bdy [data-gap]'), await idOf('t')), '线段图两条对不齐，差的那一截标出来');
  await shot('forms-b2-tape.png');

  console.log('3. 数轴 + 式子：x + 5 = 12');
  await open('ef-x5-12');
  ok(await abcd('n') === '1,5,0,12' && (await props('n')).g === 0 && await out('n', 'meet') === '0', '开场：数轴“两边各走”，g = 0，两个落点分开');
  await click(p.locator('.card[data-id="' + (await idOf('n')) + '"] .hd [data-sw-lock]'));
  ok((await props('n')).mode === 4 && /不能换成别的用法/.test(await p.evaluate(() => document.querySelector('#banner').textContent)), '数轴在组里：点“换一种”不换用法，说为什么');
  ok(await p.evaluate((id) => !document.querySelector('.card[data-id="' + id + '"] .hd [data-pick-k]'), await idOf('n')), '数轴在组里：标题栏没有能换用法的按钮');
  const u = await p.evaluate((id) => U.NumLineBench.eqModel(UI.S.scene.entities[id].props).u, await idOf('n'));
  await dragGrip('n', 'g', 7 * u, 0);
  ok((await props('n')).g === 7 && await out('n', 'meet') === '1' && (await cardText('n')).includes('x = 7 时两边一样'), '拖 g 到 7：两个落点重合，写“x = 7 时两边一样”');
  ok(!(await props('e')).rows && await done('meet'), '改 g 不算一步（式子没写新的一行）；里程碑“试出来了”完成');
  await shot('forms-b2-numline-meet.png');
  let midTx = '';
  await dragGrip('n', 'L', -5 * u, 0, async () => { midTx = await cardText('n'); });
  ok(/两个落点一起往左 5，差不变/.test(midTx), '拖的时候：写着“两个落点一起往左 5，差不变”');
  ok(await abcd('n') === '1,0,0,7' && await abcd('e') === '1,0,0,7' && await out('e', 'solved') === '7', '数轴：上面的落点往左拖 5 格 → 两边都少跳 5，式子写 x = 7');
  ok(await done('solve'), '里程碑：式子解出来了');
  await undo();
  ok(await abcd('n') === '1,5,0,12' && await abcd('e') === '1,5,0,12', '撤销一次：两台一起退回');
  await press('n', '两边一起动：开');
  await dragGrip('n', 'R', -2 * u, 0);
  ok(await abcd('n') === '1,5,0,10' && await out('e', 'okn') === '0' && await out('n', 'meet') === '0', '关掉“两边一起动”，只把下面的落点往左拖 2：两个落点分开、式子写 ≠');
  ok((await cardText('n')).includes('差 2'), '数轴上两点之间标“差 2”');
  await shot('forms-b2-numline-lone.png');

  console.log('4. 1024×768：三道题的卡片缩放都不低于下限');
  await p.setViewportSize({ width: 1024, height: 768 }); await p.waitForTimeout(300);
  for (const id of ['ef-2x3-11', 'ef-3x2-x10', 'ef-x5-12']) {
    await open(id);
    const z = await scales(), mz = await minZ();
    ok(z.length === 2 && z.every((v) => v >= mz - 1e-6) && await ports() === 0, id + '：1024×768 卡片缩放 ' + z.map((v) => v.toFixed(2)).join('、') + ' ≥ ' + mz + '，没有口');
    await shot('forms-b3-' + id + '-1024.png');
  }
  ok(await p.evaluate(() => !UI.S.inspOpen), '全程没有打开属性面板');
  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n联动组（线段图、数轴）测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close(); process.exit(fail ? 1 : 0);
})().catch((e) => { console.log('FAIL 测试异常：' + e.message); process.exit(1); });
