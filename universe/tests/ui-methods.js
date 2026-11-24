/* node tests/ui-methods.js —— 思想方法：真实鼠标测试。
 *  0. 实验库最上面是“⭐ 思维主线”：不用点开就列着假设、枚举、极端、不变量四条，写着“0 / 8 级”；点开一条，叫“第 1 级”，第 1 级开着；
 *  1. 实验库有“🧠 按思想方法闯关”：点开是其它方法（主线不在这里重复），加上主线一共 12 种以上，每种写着一句话说明；
 *  2. 点“枚举”：展开这条链，第 1 关开着，其余锁着；方法的做法说明在最上面；
 *  3. 打开第 1 关：题目卡片上标着“💡 枚举”；
 *  4. 前面几关当作有星，打开链里的一道“找全”随机题，一种一种做完：弹窗有“下一关”，点了走到“枚举”链的下一关
 *     （这道题也在分一分的操作台关卡链里，但现在是从方法链来的，下一关按方法链走）；
 *  5. 没有报错。 */
'use strict';
(async () => {
  const H = await require('./bench-harness.js')('vertbench');
  const p = H.p;
  const settle = () => p.evaluate(() => { document.querySelectorAll('button').forEach((x) => { if (/^(知道了|跳过|先不猜|开始)$/.test(x.textContent.trim())) x.click(); }); for (const k of Object.keys(UI.S.help || {})) UI.S.help[k] = false; if (UI.S.run) UI.S.run.armed = true; UI.Stage.render(); });

  console.log('1. 实验库：按思想方法闯关');
  await H.open('vt-47-38');
  await p.evaluate(() => { UI.Panels.closeDialog(); UI.S.tab = 'lab'; UI.S.mchainOpen = null; UI.Panels.renderLeft(); });
  const main = await p.evaluate(() => Array.from(document.querySelectorAll('#left [data-main] [data-mchain]')).map((x) => x.dataset.mchain).join(','));
  H.ok(main === 'm:assume,m:enum,m:extreme,m:invariant' && /思维主线/.test(await p.locator('#left').textContent()), '最上面是思维主线，不用点开：' + main);
  H.ok(await p.evaluate(() => { const g = Array.from(document.querySelectorAll('#left .grp')).map((x) => x.textContent); return g.findIndex((x) => x.includes('思维主线')) < g.findIndex((x) => x.includes('闯关（每个操作台')); }), '思维主线在操作台闯关的前面');
  H.ok((await p.locator('#left [data-mchain="m:extreme"]').textContent()).includes('0 / 8 级'), '每条写着“0 / 8 级”');
  await p.locator('#left [data-mchain="m:extreme"]').click(); await p.waitForTimeout(200);
  H.ok(/^第 1 级 · 摸袜子/.test((await p.locator('#left .it.lvl[data-pid]').first().textContent()).trim()) && await p.locator('#left .it.lvl[data-pid]').count() === 1, '点开“极端”：第 1 级 · 摸袜子开着，其余锁着');
  await p.locator('#left [data-mchain="m:extreme"]').click(); await p.waitForTimeout(150);
  await p.evaluate(() => { UI.S.mchainOpen = null; UI.Panels.renderLeft(); });
  H.ok(/按思想方法闯关/.test(await p.locator('#left').textContent()), '实验库有“按思想方法闯关”');
  await p.locator('#left [data-mchain="__list"]').click(); await p.waitForTimeout(150);
  const n = await p.locator('#left [data-mchain^="m:"]').count();
  H.ok(await p.locator('#left [data-mchain="m:enum"]').count() === 1 && await p.locator('#left [data-mchain="m:back"]').count() === 1, '主线不在下面重复，倒推等其它方法在下面');
  H.ok(n >= 12 && /有顺序地一个一个列出来/.test(await p.locator('#left [data-mchain="m:enum"]').textContent()), '点开：' + n + ' 种思想方法，每种有一句话说明');

  console.log('2. 枚举这条链');
  await p.locator('#left [data-mchain="m:enum"]').click(); await p.waitForTimeout(200);
  const L = await p.evaluate(() => U.Chain.of('m:enum'));
  H.ok(await p.locator('#left .it.lvl[data-pid]').count() === 1 && await p.locator('#left .it.lvl.lock').count() === L.length - 1, '展开“枚举”：' + L.length + ' 关，只有第 1 关开着');
  H.ok(/先定一个顺序/.test(await p.locator('#left .it.lvl.mnote').textContent()), '最上面写着怎么枚举');

  console.log('3. 第 1 关：题目上标着用到的思想');
  await p.locator('#left .it.lvl[data-pid="' + L[0].id + '"]').click(); await p.waitForTimeout(300); await settle();
  await p.evaluate(() => { UI.S.tab = 'steps'; UI.Panels.renderLeft(); });
  H.ok(await p.evaluate(() => UI.S.problem.id) === L[0].id && /💡 枚举/.test(await p.locator('#left .pcard .tags').first().textContent()), '打开第 1 关：' + L[0].title + '，卡片上有“💡 枚举”');

  console.log('4. 链里的“找全”随机题：做完按方法链走下一关');
  const i = L.findIndex((x, j) => j + 1 < L.length && /^quiz:[a-z]+:\d+:7$/.test(x.id));
  H.ok(i > 0, '链里有一道找全题：第 ' + (i + 1) + ' 关 ' + (L[i] || {}).title);
  await p.evaluate(([ids]) => { for (const id of ids) { U.Events.ctx = { pid: id, mode: 'practice' }; U.Events.push('finish', { stars: { n: 2 } }); U.Events.ctx = {}; } UI.S.tab = 'lab'; UI.Panels.renderLeft(); }, [L.slice(0, i).map((x) => x.id)]);
  await p.locator('#left .it.lvl[data-pid="' + L[i].id + '"]').click(); await p.waitForTimeout(300); await settle();
  const q = await p.evaluate(() => ({ id: UI.S.problem.id, sols: UI.S.problem.quiz.sols, type: UI.S.problem.quiz.type }));
  H.ok(q.id === L[i].id && q.sols && q.sols.length >= 2, '打开第 ' + (i + 1) + ' 关：' + q.sols.length + ' 种做法要找全');
  for (const s of q.sols) { await p.evaluate(([type, sol]) => { UI.Panels.closeDialog(); const e = Object.values(UI.S.scene.entities).find((x) => x.type === type); for (const k of Object.keys(sol)) UI.App.act({ t: 'set', id: e.id, k, v: sol[k] }); }, [q.type, s]); await p.waitForTimeout(150); }
  await p.waitForTimeout(1300);
  H.ok(await p.evaluate(() => Object.values(UI.S.run.ms).every((x) => x.done)) && await p.evaluate(() => !!document.querySelector('#dlg-nextlvl')), '全部找到：弹窗有“下一关 ▶”');
  await p.locator('#dlg-nextlvl').click(); await p.waitForTimeout(400);
  H.ok(await p.evaluate(() => UI.S.problem && UI.S.problem.id) === L[i + 1].id && await p.evaluate(() => UI.S.mchainOpen) === 'm:enum', '点“下一关”：到枚举链的第 ' + (i + 2) + ' 关 ' + L[i + 1].title);
  await H.end('思想方法');
})();
