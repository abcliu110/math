/* node tests/ui-gallery.js —— 解法图鉴：真实鼠标测试。
 *  1. 实验库有“📖 解法图鉴”，在思维主线下面、操作台闯关上面；鸡兔同笼一页写着“0 / 7 种做法”；
 *  2. 点开：7 种做法都能点（没点亮的是 ⬜），3 座桥都锁着；点锁着的桥，提示要先做对哪两种；
 *  3. 打开“面积图”：从 ✂ 拖出横着一刀到 2、竖着一刀到 5，两个里程碑都完成；
 *  4. 回到图鉴：面积图点亮了（1 / 7）；再当作“假设全是鸡”也做对了，“假设 ↔ 面积图”的桥打开，另外两座还锁着；
 *  5. 七格都题目存在、都标着 family；同一页的题都是 8 个头、26 条腿；没有报错。 */
'use strict';
(async () => {
  const H = await require('./bench-harness.js')('areamodel');
  const p = H.p;
  const lab = () => p.evaluate(() => { UI.Panels.closeDialog(); UI.S.tab = 'lab'; UI.Panels.renderLeft(); });
  const grip = (id) => p.evaluate((id) => { const g = document.querySelector('.card svg.bdy [data-grip="' + id + '"]'); if (!g) return null; const r = g.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, id);
  const px = (n) => p.evaluate((n) => { const sv = document.querySelector('.card svg.bdy'), r = sv.getBoundingClientRect(); return n * r.width / +sv.getAttribute('width'); }, n);
  const dragTo = async (a, c) => { await p.evaluate(() => { if (UI.Panels.closeDialog) UI.Panels.closeDialog(); }); await p.mouse.move(a.x, a.y); await p.mouse.down(); await p.mouse.move((a.x + c.x) / 2, (a.y + c.y) / 2, { steps: 5 }); await p.mouse.move(c.x, c.y, { steps: 5 }); await p.mouse.up(); await p.waitForTimeout(200); };

  console.log('1. 实验库里的解法图鉴');
  await H.open('am-13x7'); await lab();
  H.ok(await p.evaluate(() => { const g = Array.from(document.querySelectorAll('#left .grp')).map((x) => x.textContent); const i = g.findIndex((x) => x.includes('解法图鉴')); return i > g.findIndex((x) => x.includes('思维主线')) && i < g.findIndex((x) => x.includes('闯关（每个操作台')); }), '解法图鉴在思维主线下面、操作台闯关上面');
  H.ok((await p.locator('#left [data-gal="chick-rabbit"]').textContent()).includes('0 / 7 种做法'), '鸡兔同笼一页：0 / 7 种做法');

  console.log('2. 点开这一页');
  await p.locator('#left [data-gal="chick-rabbit"]').click(); await p.waitForTimeout(200);
  H.ok(await p.locator('#left [data-way]').count() === 7 && await p.locator('#left [data-way] .tt', { hasText: '⬜' }).count() === 7, '7 种做法都列着，都还没点亮');
  H.ok(await p.locator('#left .lock[data-bridge]').count() === 3, '3 座桥都锁着');
  await p.locator('#left .lock[data-bridge]').first().click(); await p.waitForTimeout(150);
  H.ok(/先用“假设全是鸡，一只一只换”和“两架天平”各做对一次/.test(await p.locator('body').textContent()), '点锁着的桥：说要先做对哪两种');

  console.log('3. 面积图：拖出两刀');
  await p.locator('#left [data-way="area"]').click(); await p.waitForTimeout(300);
  await p.evaluate(() => { document.querySelectorAll('button').forEach((x) => { if (/^(知道了|跳过|先不猜|开始)$/.test(x.textContent.trim())) x.click(); }); for (const k of Object.keys(UI.S.help || {})) UI.S.help[k] = false; if (UI.S.run) UI.S.run.armed = true; UI.Stage.render(); });
  await p.waitForTimeout(200);
  H.ok(await p.evaluate(() => UI.S.problem && UI.S.problem.id) === 'gal-cr-area', '打开的是面积图这一格');
  const c = await px(17);
  let g = await grip('hnew'); await dragTo(g, { x: g.x + 30, y: g.y + 2 * c });
  H.ok(await H.done('legs2'), '横着切在 2：下面一层 8 × 2 = 16（ch = ' + await H.out('ch') + '）');
  g = await grip('vnew'); await dragTo(g, { x: g.x + 5 * c, y: g.y + 30 });
  H.ok(await H.done('rabbit') && await H.out('cv') === '5', '竖着切在 5：兔 5 只（cv = ' + await H.out('cv') + '）');

  console.log('4. 回到图鉴');
  await p.waitForTimeout(300); await lab(); await p.evaluate(() => { UI.S.galOpen = 'chick-rabbit'; UI.Panels.renderLeft(); });
  H.ok((await p.locator('#left [data-gal="chick-rabbit"]').textContent()).includes('1 / 7 种做法') && (await p.locator('#left [data-way="area"]').textContent()).includes('✅'), '面积图点亮了：1 / 7');
  await p.evaluate(() => { U.Events.ctx = { pid: 'sw-8-26', mode: 'practice' }; U.Events.push('finish', { stars: { n: 2 } }); U.Events.ctx = {}; UI.Panels.renderLeft(); });
  H.ok(await p.locator('#left [data-bridge][data-pid="gal-br-area"]').count() === 1 && await p.locator('#left .lock[data-bridge]').count() === 2, '假设和面积图都点亮：这座桥开了，另外两座还锁着');

  console.log('5. 数据');
  const bad = await p.evaluate(() => { const out = []; for (const pg of U.Gallery.pages()) for (const x of pg.ways.map((w) => w.pid).concat(pg.bridges.map((b) => b.pid))) { const q = U.problems.find((y) => y.id === x); if (!q) { out.push(x + ' 不存在'); continue; } const t = q.title + q.hook; if (!/8 个头/.test(t) || !/26/.test(t)) out.push(x + ' 不是 8 头 26 腿'); } for (const pg of U.Gallery.pages()) for (const w of pg.ways) { const q = U.problems.find((y) => y.id === w.pid); if (q && (q.family !== pg.id || q.way !== w.id)) out.push(w.pid + ' 没标格子'); } return out; });
  H.ok(bad.length === 0, '每格、每座桥的题都在，都是 8 个头、26 条腿，都标着格子' + (bad.length ? '：' + bad.join('；') : ''));
  await H.end('ui-gallery');
})();
