/* node tests/ui-extend.js —— 任务 J（next-steps.md §10.7）的界面部分，真实页面。
 * (a) 抛物线的精确坐标在台面上显示：y = 2x² − 8x + 5 的顶点 (2, −3)，x² − 4x + 1 的交点 2 ± √3；改 a 以后显示跟着变（(4/3, −1/3)）；
 * (b) 界面的求值走增量路径（台面缓存 S.evalCache）：改一台无关器材，其他器材的求值次数为 0（计数）；
 * (c) 工作区里 300 个对象，改一个点，增量求值的中位数 < 16 毫秒（真实页面里计时）；
 * (d) 文件清单：页面里加载的 packs 脚本和 U.PACK_FILES 一致；清单检查在不一致时报错；
 * (e) 页面没有报错。
 * 需要 playwright（NODE_PATH 指向它的 node_modules）。 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const url = 'file://' + path.join(__dirname, '..', 'index.html');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(url); await p.waitForTimeout(300);
  await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); });

  // (a) 抛物线的精确坐标
  const vid = await p.evaluate(() => UI.App.act({ t: 'add', type: 'quad-vertex', x: 120, y: 120, props: { a: 2, b: -8, c: 5 } }).id);
  const xid = await p.evaluate(() => UI.App.act({ t: 'add', type: 'quad-xint', x: 120, y: 300, props: { a: 1, b: -4, c: 1 } }).id);
  await p.evaluate(() => { UI.Stage.fit(); UI.Stage.render(); });
  const html = () => p.evaluate(() => document.body.innerHTML);
  let h = await html();
  ok(h.includes('顶点 (2, −3)'), '顶点 (2, −3) 显示在台面上（精确）');
  ok(h.includes('2 + √3') && h.includes('2 − √3'), 'x 轴交点 2 + √3、2 − √3 显示在台面上（精确）');

  // 改 a：显示跟着变（顶点 (4/3, −1/3)）
  await p.evaluate((id) => UI.App.act({ t: 'set', id, k: 'a', v: 3 }), vid);
  h = await html();
  ok(h.includes('顶点 (4/3, −1/3)'), '改 a = 3 以后，顶点显示为 (4/3, −1/3)');

  // (b) 界面的求值走增量路径：先改一台无关的器材（只改台面，不刷新），再用台面缓存求值，计数
  const iso = await p.evaluate(() => UI.App.act({ t: 'add', type: 'num', x: 500, y: 500, props: { n: 1 } }).id);
  await p.evaluate(() => UI.App.refresh(false));
  ok(!!(await p.evaluate(() => UI.S.evalCache && UI.S.evalCache.D)), '界面保存了求值缓存（S.evalCache）');
  const counts = await p.evaluate((iso) => {
    UI.S.scene.entities[iso].props.n = 9;           // 只改无关的一台
    const count = {};
    U.World.evaluateCached(UI.S.scene, UI.S.evalCache, { count });
    const others = Object.keys(count).filter((id) => id !== iso);
    return { others: others.length, self: count[iso] || 0 };
  }, iso);
  ok(counts.others === 0, '改一台无关器材：其他器材的求值次数为 0（实测 ' + counts.others + ' 台）');
  ok(counts.self === 1, '被改的那台求值 1 次');

  // (c) 300 个对象，改一个点，增量求值中位数 < 16 毫秒（真实页面里计时）
  await p.evaluate(() => {
    UI.App.act({ t: 'clear' });
    for (let i = 0; i < 100; i++) {
      const x = 40 + (i % 20) * 60, y = 40 + Math.floor(i / 20) * 60;
      const a = UI.App.act({ t: 'add', type: 'num', x, y, props: { n: i } }).id;
      const o1 = UI.App.act({ t: 'add', type: 'op', x, y, props: { op: 0 } }).id;
      const o2 = UI.App.act({ t: 'add', type: 'op', x, y, props: { op: 0 } }).id;
      UI.App.act({ t: 'link', from: a, fromPort: 'v', to: o1, toPort: 'a' });
      UI.App.act({ t: 'link', from: a, fromPort: 'v', to: o1, toPort: 'b' });
      UI.App.act({ t: 'link', from: o1, fromPort: 'r', to: o2, toPort: 'a' });
      UI.App.act({ t: 'link', from: a, fromPort: 'v', to: o2, toPort: 'b' });
    }
  });
  const perf = await p.evaluate(() => {
    const heads = Object.values(UI.S.scene.entities).filter((e) => e.type === 'num').map((e) => e.id);
    const times = [];
    for (let i = 0; i < 9; i++) {
      UI.S.scene.entities[heads[i]].props.n = i + 200;
      const t0 = performance.now();
      U.World.evaluateCached(UI.S.scene, UI.S.evalCache);
      times.push(performance.now() - t0);
    }
    times.sort((x, y) => x - y);
    const t1 = performance.now(); U.World.evaluate(UI.S.scene); const full = performance.now() - t1;
    return { n: Object.keys(UI.S.scene.entities).length, links: UI.S.scene.links.length, med: times[4], full };
  });
  console.log('       ' + perf.n + ' 个对象：全量 ' + perf.full.toFixed(2) + ' 毫秒，增量中位数 ' + perf.med.toFixed(3) + ' 毫秒');
  ok(perf.n >= 300 && perf.links >= 300, '台面上有 300 个以上对象、300 根以上连线（实际 ' + perf.n + ' 个，' + perf.links + ' 根）');
  ok(perf.med < 16, '增量求值中位数 < 16 毫秒（实测 ' + perf.med.toFixed(3) + '）');

  // (d) 文件清单：页面里加载的 packs 脚本与 U.PACK_FILES 一致；清单检查对不一致会报错
  const man = await p.evaluate(() => {
    const srcs = [...document.scripts].map((s) => s.getAttribute('src')).filter((s) => s && s.startsWith('packs/'));
    const bad = U.checkPackManifest(U.PACK_FILES, srcs, Object.values(U.PACK_FILES));
    const broken = U.checkPackManifest(U.PACK_FILES, srcs.slice(1), Object.values(U.PACK_FILES));
    return { n: srcs.length, bad, broken: broken.length };
  });
  ok(man.n > 0 && man.bad.length === 0, '页面加载的 ' + man.n + ' 个 packs 脚本和清单一致');
  ok(man.broken > 0, '少加载一个包时，清单检查报错');

  // (e) 页面没有报错
  ok(errs.length === 0, '页面没有报错' + (errs.length ? '（' + errs[0] + '）' : ''));

  await b.close();
  console.log('\n' + pass + ' 通过，' + fail + ' 失败');
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.log('FAIL 异常：' + e.message); process.exit(1); });
