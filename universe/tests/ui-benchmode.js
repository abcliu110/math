/* node tests/ui-benchmode.js —— 操作台模式（js/ui/stage-core.js 的 UI.benchMode，判定在 js/core/registry.js 的 U.benchModeOf）：真实鼠标。
 *  台面上只有一台操作台、没有连线、在做题时，卡片不画连线用的口（输入口、输出口、属性药丸、口旁边的字、记录仪的口），
 *  卡片按台面算大小、台面适应时不给口留边；卡片标题栏上有一个不显眼的“显示口”，点了口出来，再点藏起来。
 *  抽四台不同的操作台：高斯求和（开了记录仪，gr-gauss-n）、篱笆围地（gr-fence-20）、换一换（sw-8-26，19 个口）、天平（balance-12）：
 *   1. 没有口的 DOM，“显示口”在；输出照常算（S.D[id].out 读得到）；卡片底边在按钮栏上面；
 *   2. 台面上的按钮用真实鼠标点得到（点了属性真的变了）；
 *   3. 真实鼠标点“显示口”：口出来（记录仪题连记录仪的口一起），卡片在屏幕上不比操作台模式大；再点藏起来；
 *  再看不是操作台模式的：同一道题台面上再放一台器材 → 口画出来、“显示口”不见；自由探究里放一台操作台 → 口照常画。
 *  控制台 0 报错。SHOT_DIR 有值时存截图。 */
'use strict';
(async () => {
  const H = await require('./bench-harness.js')('gaussbench');
  const p = H.p, SP = process.env.SHOT_DIR;
  const shot = async (n) => { if (SP) await p.screenshot({ path: require('path').join(SP, n) }); };
  const portDom = () => p.evaluate(() => document.querySelectorAll('.card .port, .card .pl, .pill').length);
  const outPorts = () => p.evaluate(() => [...document.querySelectorAll('.card .port.out')].map((x) => x.dataset.port));
  const card = () => p.evaluate(() => { const r = document.querySelector('.card').getBoundingClientRect(); return { w: r.width, h: r.height, x: r.x, y: r.y }; });
  const bottomOk = () => p.evaluate(() => { const c = document.querySelector('.card').getBoundingClientRect(), f = Array.from(document.querySelectorAll('.fab')).map((x) => x.getBoundingClientRect().top).filter((t) => t > innerHeight / 2); return c.bottom <= Math.min.apply(null, f.concat([innerHeight])); });
  const bm = () => p.evaluate(() => UI.benchMode());
  const zp = () => p.evaluate(() => { const b = document.querySelector('.card .hd [data-ports]'); return b && b.offsetParent !== null ? b.textContent : null; });
  const outsOk = () => p.evaluate(() => { const id = (UI.benchMode() || [])[0]; const o = id && UI.S.D[id].out; return !!o && Object.keys(o).length > 0 && Object.values(o).some((v) => v && v.kind); });
  const props = () => p.evaluate(() => JSON.stringify(Object.values(UI.S.scene.entities)[0].props));

  const CASES = [
    { id: 'gr-gauss-n', name: '高斯求和（记录仪）', press: () => H.byTitle('把这串数倒过来写在下面'), rec: true },
    { id: 'gr-fence-20', name: '篱笆围地（记录仪）', press: () => H.byTitle('把这个长记到图上'), rec: true },
    { id: 'sw-8-26', name: '换一换（19 个口）' },
    { id: 'balance-12', name: '天平' },
  ];
  for (const C of CASES) {
    console.log(C.name + '（' + C.id + '）');
    await H.open(C.id);
    const bid = await bm();
    H.ok(!!bid && bid.length === 1 && bid[0] === Object.keys(await p.evaluate(() => UI.S.scene.entities))[0], '进了操作台模式（UI.benchMode() 是只有那台操作台的列表）');
    H.ok(await portDom() === 0, '没有口、口旁边的字、药丸的 DOM');
    H.ok(await zp() === '显示口', '卡片标题栏上有不显眼的“显示口”');
    H.ok(await outsOk(), '输出照常算（UI.S.D[id].out 读得到）');
    H.ok(await bottomOk(), '卡片底边在按钮栏上面');
    const c0 = await card();
    await shot('benchmode-' + C.id + '.png');
    // 台面上的按钮：真实鼠标点
    const before = await props();
    if (C.press) await C.press();
    else { await p.evaluate(() => { if (UI.Panels.closeDialog) UI.Panels.closeDialog(); }); await p.locator('.card svg.bdy g[data-pick-set]').first().click(); await p.waitForTimeout(160); }
    H.ok(await props() !== before, '真实鼠标点台面上的按钮：属性变了');
    H.ok(await portDom() === 0 && !!(await bm()), '点完还是操作台模式、没有口');
    // 切回显示口
    await p.evaluate(() => { if (UI.Panels.closeDialog) UI.Panels.closeDialog(); }); await p.click('.card .hd [data-ports]'); await p.waitForTimeout(200);
    const outs = await outPorts(), c1 = await card();
    H.ok(!(await bm()) && outs.length > 0 && await zp() === '藏起口', '点“显示口”：口出来了（' + outs.length + ' 个输出口），按钮变成“藏起口”');
    if (C.rec) H.ok(outs.includes('pts') && outs.includes('gok'), '记录仪的口（pts、gok）也画出来');
    H.ok(c1.w * c1.h <= c0.w * c0.h + 1, '显示口时卡片在屏幕上不比操作台模式大（' + Math.round(c0.w) + '×' + Math.round(c0.h) + ' ≥ ' + Math.round(c1.w) + '×' + Math.round(c1.h) + '）');
    H.ok(await bottomOk(), '显示口时卡片底边也在按钮栏上面');
    if (C.id === 'sw-8-26') {
      H.ok(c1.h / c1.w > c0.h / c0.w + 0.05, '换一换：显示口时卡片要给 19 个口留高度，操作台模式按台面算，矮一截');
      await shot('benchmode-sw-8-26-ports.png');
    }
    if (C.id === 'gr-gauss-n') await shot('benchmode-gr-gauss-n-ports.png');
    await p.evaluate(() => { if (UI.Panels.closeDialog) UI.Panels.closeDialog(); }); await p.click('.card .hd [data-ports]'); await p.waitForTimeout(200);
    H.ok(!!(await bm()) && await portDom() === 0 && await zp() === '显示口', '再点“藏起口”：回到操作台模式');
  }

  console.log('不是操作台模式');
  await H.open('gr-gauss-n');
  await p.evaluate(() => UI.App.act({ t: 'add', type: 'num', x: 900, y: 40, props: { n: 3 } })); await p.waitForTimeout(200);
  H.ok(!(await bm()) && (await outPorts()).length > 0 && await zp() === null, '台面上再放一台器材：口画出来，“显示口”不见了');
  await p.evaluate(() => UI.App.undo()); await p.waitForTimeout(200);
  H.ok(!!(await bm()) && await portDom() === 0, '撤销：又是操作台模式');
  await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); UI.App.act({ t: 'add', type: 'gaussbench', x: 100, y: 100, props: {} }); }); await p.waitForTimeout(300);
  H.ok(!(await bm()) && (await outPorts()).length > 0 && await zp() === null, '自由探究里放一台操作台：口照常画，没有“显示口”');
  await shot('benchmode-free.png');
  await H.end('操作台模式');
})();
