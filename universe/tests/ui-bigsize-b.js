/* node tests/ui-bigsize-b.js —— 补旧上限的台（2026-11-28，真实鼠标）。一个一个画人、画物的台放到大数，在卡片上点、拖做完：
 *  1. 换一换 35 头 94 足：拖把手到兔 12 只，正好；
 *  2. 换一换 100 头 280 足（十个一组）：点“+10”4 次，兔 40 只正好；再点一只鸡变兔、点一只兔变回来；
 *  3. 换一换 500 只玻璃瓶（好一只 3 元、碎一只倒扣 12 元，一共 1425 元，十个一条）：点第 1 条换到 10，点“−1”5 次，碎 5 只正好；
 *  4. 盈亏 40 人：从 1 人点“+10”3 次、“+”9 次，到 40 人对上，中间画成“……中间 29 人”；
 *  5. 集合圈 45 人：拖“10 个一起”进左圈（一次 10 个），再拖一个进重叠的地方；
 *  6. 连一连 握手 20 人：先拖一下（1 号和 2 号握手），再点“让 几 号和后面的都握”到全握完，190 次；
 *  7. 摸球 4 种花色各 13 张：每种摸 3 张卡住，选“摸 13 个”；
 *  8. 面积推导：底 12 拖到卡片边上松手（格子变小），再拖到 40；
 *  9. 篱笆 100 米：拖长到 24 附近（按 2 取整），点“+1”“−1”微调到 25，面积最大 625。
 *  每一步：卡片宽高不超过 U.kit.big.CARD_MAX；控制台 0 报错。
 *  设了环境变量 B2B_SHOTS（一个目录）时，把每台做完的卡片截图存进去（b2b-ui-*.png）。
 * 需要 playwright（NODE_PATH 指向它的 node_modules）。 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const url = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/');
const SHOTS = process.env.B2B_SHOTS || '';
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(url); await p.waitForTimeout(400);
  const closeDlg = () => p.evaluate(() => { if (UI.Panels.closeDialog) UI.Panels.closeDialog(); });
  // 自由台面上放一台（大数的属性），返回它的 id
  const place = async (type, props) => {
    await closeDlg();
    await p.evaluate(([type, props]) => { UI.App.openFree(); UI.App.act({ t: 'clear' }); UI.App.act({ t: 'add', type, x: 60, y: 40, props }); for (const k of Object.keys(UI.S.help || {})) UI.S.help[k] = false; UI.Stage.fit(); UI.Stage.render(); }, [type, props]);
    await p.waitForTimeout(250);
  };
  const props = (type) => p.evaluate((type) => Object.assign({}, Object.values(UI.S.scene.entities).find((x) => x.type === type).props), type);
  const out = (type, port) => p.evaluate(([type, port]) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === type), v = UI.S.D[e.id].out[port]; return v ? U.Q.show(v.data) : null; }, [type, port]);
  const text = () => p.evaluate(() => document.querySelector('.card svg.bdy').textContent);
  // 按 title 点（整句对上）；按卡片坐标拖
  const byTitle = async (title, n) => { await closeDlg(); await p.locator('.card svg.bdy g[data-pick-set]').filter({ has: p.locator('title', { hasText: typeof title === 'string' ? new RegExp('^' + title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$') : title }) }).nth(n || 0).click(); await p.waitForTimeout(140); };
  const toScreen = (cx, cy) => p.evaluate(([cx, cy]) => { const svg = document.querySelector('.card svg.bdy'), pt = svg.createSVGPoint(); pt.x = cx; pt.y = cy; const q = pt.matrixTransform(svg.getScreenCTM()); return { x: q.x, y: q.y }; }, [cx, cy]);
  const gripAt = (gid) => p.evaluate((gid) => { const g = document.querySelector('.card svg.bdy [data-grip="' + gid + '"]'); if (!g) return null; const r = g.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, gid);
  const dragTo = async (gid, to) => { await closeDlg(); const g = await gripAt(gid); await p.mouse.move(g.x, g.y); await p.mouse.down(); await p.mouse.move((g.x + to.x) / 2, (g.y + to.y) / 2, { steps: 6 }); await p.mouse.move(to.x, to.y, { steps: 6 }); await p.mouse.up(); await p.waitForTimeout(250); };
  const cardOk = async (m) => { const r = await p.evaluate(() => { const c = document.querySelector('.card'), M = U.kit.big.CARD_MAX; return { w: c.offsetWidth, h: c.offsetHeight, M }; }); ok(r.w <= r.M[0] && r.h <= r.M[1], m + '：卡片 ' + r.w + '×' + r.h + ' 不超过 ' + r.M.join('×')); };
  const shot = async (name) => { if (!SHOTS) return; await closeDlg(); await p.waitForTimeout(150); await p.locator('.card').first().screenshot({ path: path.join(SHOTS, 'b2b-ui-' + name + '.png') }); };

  console.log('1. 换一换：35 头 94 足');
  await place('swapbench', { n: 35, target: 94 }); await cardOk('35 头');
  await dragTo('k', await toScreen(24 + 2 * 38, 186 + 46 + 20));
  { const k1 = (await props('swapbench')).k; ok(k1 === 12 && await out('swapbench', 'ok') === '1', '拖把手到第二排第 3 个：兔 ' + k1 + ' 只（要 12），正好 94 条腿'); }
  await shot('swap-35');

  console.log('2. 换一换：100 头 280 足');
  await place('swapbench', { n: 100, target: 280 }); await cardOk('100 头');
  ok(/十个一组/.test(await text()), '写着“十个一组”');
  for (let i = 0; i < 4; i++) await byTitle('一次把 10 个鸡换成兔');
  ok((await props('swapbench')).k === 40 && await out('swapbench', 'ok') === '1', '点“+10”4 次：兔 40 只，正好 280 条腿');
  await byTitle('点一下：换成兔'); ok((await props('swapbench')).k === 41 && await out('swapbench', 'gap') === '-2', '点一只鸡：变成兔，多了 2 条腿');
  await byTitle('点一下：换回鸡'); ok((await props('swapbench')).k === 40 && await out('swapbench', 'ok') === '1', '点一只兔：变回鸡，又正好');
  await shot('swap-100');

  console.log('3. 换一换：500 只玻璃瓶');
  await place('swapbench', { n: 500, la: 3, lb: -12, target: 1425, na: '好的', nb: '碎的', unit: '元' }); await cardOk('500 个');
  ok(/十个一条/.test(await text()) && await p.locator('.card svg.bdy [data-strip]').count() === 50, '十个一条：50 条');
  await byTitle(/^第 1–10 个/); ok((await props('swapbench')).k === 10, '点第 1 条：碎的 10 只');
  for (let i = 0; i < 5; i++) await byTitle('一次把 1 个碎的换回好的');
  ok((await props('swapbench')).k === 5 && await out('swapbench', 'ok') === '1', '点“−1”5 次：碎 5 只，正好 1425 元');
  const g3 = await gripAt('k'); ok(!!g3, '把手在台上');
  await shot('swap-500');

  console.log('4. 盈亏：40 人');
  await place('surplusbench', { a: 3, b: 5, r1: 30, r2: -50, n: 1 });
  for (let i = 0; i < 3; i++) await byTitle('一次多 10 人');
  for (let i = 0; i < 9; i++) await byTitle('多一人');
  ok((await props('surplusbench')).n === 40 && await out('surplusbench', 'total') === '150', '40 人：两种分法都要 150 个，对上了');
  ok(/中间 29 人/.test(await text()), '中间画成“……中间 29 人”');
  await cardOk('盈亏 40 人'); await shot('surplus-40');

  console.log('5. 集合圈：45 人');
  await place('vennbench', { n: 45, na: '语文', nb: '数学', unit: '人' }); await cardOk('集合圈 45 人');
  ok(/10 个一起/.test(await text()), '托盘上有“10 个一起”');
  await dragTo('ten', await toScreen(150, 196));
  ok(await out('vennbench', 'inA') === '10' && await out('vennbench', 'placed') === '10', '拖“10 个一起”进左圈：一次放进 10 个');
  await dragTo('i10', await toScreen(292, 196));
  ok(await out('vennbench', 'both') === '1' && await out('vennbench', 'inA') === '11' && await out('vennbench', 'inB') === '1', '再拖一个进重叠的地方：两个圈都算它');
  await shot('venn-45');

  console.log('6. 连一连：20 人握手');
  await place('pairbench', { mode: 1, n: 20 }); await cardOk('握手 20 人');
  await dragTo('p0', await gripAt('p1'));
  ok(await out('pairbench', 'pairs') === '1', '拖：1 号和 2 号握了一次');
  for (let i = 0; i < 19; i++) await byTitle(/号和后面还没握过的 \d+ 个人各握一次$/);
  ok(await out('pairbench', 'pairs') === '190' && await out('pairbench', 'full') === '1' && /19 \+ 18 \+ 17 \+ … \+ 1 = 190/.test(await text()), '一个人一个人握完：19 + 18 + 17 + … + 1 = 190');
  await shot('shake-20');

  console.log('7. 摸球：4 种花色各 13 张');
  await place('pigeonbench', { c1: 13, c2: 13, c3: 13, c4: 13, want: 0, m: 4 }); await cardOk('摸球 13 张一种');
  for (const nm of ['红', '黄', '蓝', '绿']) for (let i = 0; i < 3; i++) await byTitle('摸一个' + nm + '的');
  await byTitle('保证要摸 13 个');
  ok(await out('pigeonbench', 'guar') === '13', '每种摸 3 张卡住，选“摸 13 个”：保证 13 张');
  await shot('pigeon-13');

  console.log('8. 面积推导：底拖到 40');
  await place('areabench', { shape: 0, b: 12, h: 8, s: 4 });
  await dragTo('b', await toScreen(696, 290));
  ok((await props('areabench')).b === 25, '拖到卡片边上：底 25（图不跟着缩）');
  ok(/格子画小了/.test(await text()), '松手：格子画小了');
  await dragTo('b', await toScreen(40 + 40 * 11, 290));
  ok((await props('areabench')).b === 40, '接着拖：底 40');
  await dragTo('h', await toScreen(200, 290 - 20 * 11));
  ok((await props('areabench')).h === 20, '拖高到 20');
  await byTitle('沿红虚线（高）剪下左边的三角形'); await byTitle('把三角形平移到右边');
  ok(await out('areabench', 'area') === '800', '剪拼成长方形：40 × 20 = 800');
  await cardOk('面积推导 40 × 20'); await shot('area-40');

  console.log('9. 篱笆 100 米');
  await place('areabench', { shape: 3, P: 100, w: 2 });
  const un = 176 / 49;
  await dragTo('w', await toScreen(40 + 24.3 * un, 200));
  const w1 = (await props('areabench')).w; ok(w1 === 24, '拖长：按 2 取整到 ' + w1);
  await byTitle('长多 1 米');
  ok((await props('areabench')).w === 25 && await out('areabench', 'best') === '1', '点“+1”：25 × 25 = 625，面积最大');
  await cardOk('篱笆 100 米'); await shot('fence-100');

  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n补旧上限测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close(); process.exit(fail ? 1 : 0);
})();
