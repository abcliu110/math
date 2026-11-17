/* node tests/ui-dec.js —— 小数台面：真实鼠标测试。
 *  1. 3.6 + 0.45：点“放进来”，十分之一满 10 个，读数变红“先换整齐”；点“10 个十分之一 → 1 个一”：4.05；
 *  2. 2.4 − 0.08：直接拿，被拦住并说明“百分之一不够拿”；拆开一个十分之一再拿：2.32；
 *  3. 3.6 ÷ 0.9：拆、拿、拆、拿……正好拿完，拿了 4 次；
 *  4. 0.25 小数点右移一位：2.5；百格乘法 0.2 × 0.3 = 0.06；
 *  5. 全程没有打开属性面板。
 * 需要 playwright（NODE_PATH 指向它的 node_modules）。 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const url = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(url); await p.waitForTimeout(400);
  const closeDlg = () => p.evaluate(() => { if (UI.Panels.closeDialog) UI.Panels.closeDialog(); });
  const open = async (id) => {
    await p.waitForTimeout(700); await closeDlg();
    await p.evaluate((id) => { UI.App.openProblem(id, 'practice'); }, id); await p.waitForTimeout(300);
    await p.evaluate(() => {
      document.querySelectorAll('button').forEach((x) => { if (/^(知道了|跳过|先不猜|开始)$/.test(x.textContent.trim())) x.click(); });
      for (const k of Object.keys(UI.S.help || {})) UI.S.help[k] = false;
      if (UI.S.run) UI.S.run.armed = true;
      UI.Stage.render();
    });
    await p.waitForTimeout(200);
  };
  const out = (port) => p.evaluate((port) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'decbench'), v = UI.S.D[e.id].out[port]; return v ? U.Q.show(v.data) : null; }, port);
  const props = () => p.evaluate(() => Object.assign({}, Object.values(UI.S.scene.entities).find((x) => x.type === 'decbench').props));
  // 按按钮上的字点（按钮是 <g data-pick-set> 里的 <text>）
  const press = async (label) => {
    await closeDlg();
    const g = p.locator('.card svg.bdy g[data-pick-set]').filter({ hasText: label }).first();
    await g.click(); await p.waitForTimeout(150);
  };
  const read = () => p.evaluate(() => { const g = document.querySelector('.card svg.bdy [data-read]'); return g ? g.textContent : ''; });
  const text = () => p.evaluate(() => Array.from(document.querySelectorAll('.card svg.bdy text')).map((t) => t.textContent).join('|'));
  const done = (id) => p.evaluate((id) => !!(UI.S.run && UI.S.run.ms[id] && UI.S.run.ms[id].done), id);

  console.log('1. 合起来');
  await open('g4-decimal-add-core');
  ok(await out('value') === '18/5', '开始是 3.6');
  await press('放进来');
  ok(await out('value') === null && (await read()).includes('先换整齐'), '放进来以后十分之一有 10 个：没有读数，提示先换整齐');
  await press('10 个十分之一 → 1 个一');
  ok(await out('value') === '81/20' && (await read()).includes('= 4.05') && await done('sum'), '换一换：4.05');

  console.log('2. 拿走（减法）');
  await open('g4-decimal-align-trap');
  await press('拿走 0.08');
  ok((await props()).h === 0 && (await text()).includes('百分之一不够拿：先拆开一个十分之一'), '直接拿：被拦住，说明百分之一不够拿');
  await press('1 个十分之一 → 10 个百分之一');
  await press('拿走 0.08');
  ok(await out('value') === '58/25' && (await read()).includes('2.32') && await done('diff'), '拆开再拿：2.32');

  console.log('3. 拿走（除法）');
  await open('g5-decimal-div-core');
  for (let i = 0; i < 3; i++) { await press('1 个一 → 10 个十分之一'); await press('拿走 0.9'); }
  ok(await out('times') === null, '拿了 3 次，还剩 9 个十分之一：还没拿完');
  await press('拿走 0.9');
  ok(await out('times') === '4' && (await text()).includes('拿走了 4 次 0.9：正好拿完') && await done('q'), '拆一个、拿一次，4 次正好拿完');

  console.log('4. 小数点移动、百格乘法');
  await open('g4-decimal-shift-trap');
  await press('小数点 →');
  ok(await out('shifted') === '5/2' && (await text()).includes('扩大到 10 倍') && await done('x10'), '0.25 右移一位：2.5，扩大到 10 倍');
  await open('g5-decimal-mul-trap');
  const plus = p.locator('.card svg.bdy g[data-pick-set]').filter({ hasText: '+' });
  await closeDlg(); await plus.nth(0).click(); await p.waitForTimeout(120); await plus.nth(0).click(); await p.waitForTimeout(120);
  for (let i = 0; i < 3; i++) { await plus.nth(1).click(); await p.waitForTimeout(120); }
  ok(await out('prod') === '3/50' && (await read()).includes('0.2 × 0.3 = 0.06') && await done('prod'), '宽 2、高 3：重叠 6 格，0.06');
  ok(await p.evaluate(() => !UI.S.inspOpen), '全程没有打开属性面板');
  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n小数台面测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close(); process.exit(fail ? 1 : 0);
})();
