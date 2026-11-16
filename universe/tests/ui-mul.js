/* node tests/ui-mul.js —— 竖式乘法（对着面积图）：真实鼠标测试。
 *  1. 23 × 14：开场选中第一块（20 × 4）；点 8、0，变绿，自动跳到下一块；撤销一次回到只填了 8；
 *  2. 填错：在 3 × 4 那一块点 1、3，红框、写“不对”；点退格再点 2，变绿；
 *  3. 把 4 块填完；点竖式第一行，面积图下面一条两块亮起来，下面写“23 × 4 = 20 × 4 + 3 × 4”；填 92 以后写出进位过程；
 *  4. 填完第二行和得数：全部填对，322，里程碑完成；
 *  5. 只写竖式的题：面积图里没有可填的格子；
 *  6. 全程没有打开属性面板，标题栏没有“填写”入口。
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
  const props = () => p.evaluate(() => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'mulbench'); return Object.assign({}, e.props); });
  const out = (port) => p.evaluate((port) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'mulbench'), v = UI.S.D[e.id].out[port]; return v ? U.Q.show(v.data) : null; }, port);
  const key = async (k) => { await closeDlg(); await p.locator('.card svg.bdy [data-key="' + k + '"]').click(); await p.waitForTimeout(120); };
  const type = async (s) => { for (const ch of String(s)) await key(ch); };
  const box = async (i) => { await closeDlg(); await p.locator('.card svg.bdy [data-box="' + i + '"]').click(); await p.waitForTimeout(140); };
  const st = (i) => p.evaluate((i) => document.querySelector('.card svg.bdy [data-box="' + i + '"]').dataset.st, i);
  const hot = () => p.evaluate(() => [...document.querySelectorAll('.card svg.bdy [data-area][data-hot="1"]')].map((x) => x.dataset.area).sort().join(' '));
  const note = () => p.evaluate(() => document.querySelector('.card svg.bdy [data-note]').textContent);
  const done = (id) => p.evaluate((id) => !!(UI.S.run && UI.S.run.ms[id] && UI.S.run.ms[id].done), id);
  const text = () => p.evaluate(() => document.querySelector('.card svg.bdy').textContent);

  console.log('1. 填一块');
  await open('cm-23x14');
  ok(await p.locator('.card svg.bdy [data-box]').count() === 7 && await p.locator('.card .gchip[data-card-insp]').count() === 0, '7 个格子（4 块、2 行、得数）；标题栏没有“填写”入口');
  ok((await props()).sel === 0 && await hot() === '0-0' && (await note()).includes('20 × 4'), '开场选中 20 × 4 那一块，它亮着');
  await type('80');
  ok((await props()).vals.split(',')[0] === '80' && await st(0) === 'ok' && (await props()).sel === 1, '点 8、0：变绿，自动跳到下一块');
  await p.keyboard.press('Control+z'); await p.waitForTimeout(200);
  ok((await props()).vals.split(',')[0] === '8' && (await props()).sel === 0, '撤销一次：回到只填了 8（一次点击一步）');
  await key('0');

  console.log('2. 填错');
  await type('13');
  ok(await st(1) === 'wrong' && (await text()).includes('不对') && await out('wrong') === '1', '3 × 4 填 13：红框，写着“不对”');
  await key('back'); await key('2');
  ok(await st(1) === 'ok' && await out('wrong') === '0', '退格再点 2：12，变绿');

  console.log('3. 竖式的一行就是面积图的一条');
  await type('200'); await type('30');
  ok(await out('cellsok') === '4' && await done('cells') && (await props()).sel === 4, '4 块都填对，自动跳到竖式第一行');
  ok(await hot() === '0-0 0-1' && (await note()).includes('23 × 4 = 20 × 4 + 3 × 4'), '竖式第一行选中：面积图下面一条两块亮着，写着 23 × 4 = 20 × 4 + 3 × 4');
  await type('92');
  await box(4);
  ok(await st(4) === 'ok' && (await note()).includes('写 2 进 1') && (await note()).includes('2 × 4 + 1 = 9'), '填 92 以后再点这一行：写出“3 × 4 = 12（写 2 进 1）；2 × 4 + 1 = 9”');
  await box(5);
  ok(await hot() === '1-0 1-1', '点第二行：上面一条两块亮着');

  console.log('4. 填完');
  await type('230');
  ok(await out('rowsok') === '2' && await done('rows') && (await props()).sel === 6 && await hot() === '0-0 0-1 1-0 1-1', '两行都对，跳到得数：4 块全亮');
  await type('322');
  ok(await out('done') === '1' && await out('product') === '322' && await done('done') && (await text()).includes('全部填对了'), '填 322：全部填对，里程碑完成');

  console.log('5. 只写竖式');
  await open('cm-34x12-rows');
  ok(await p.locator('.card svg.bdy [data-box]').count() === 3 && await p.locator('.card svg.bdy [data-area]').count() === 4, '只有 2 行和得数要填；面积图 4 块还在，但不用填');
  await type('68'); await type('340'); await type('408');
  ok(await out('done') === '1' && await done('done'), '68、340、408：全部填对');
  ok(await p.evaluate(() => !UI.S.inspOpen), '全程没有打开属性面板');
  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n竖式乘法测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close(); process.exit(fail ? 1 : 0);
})();
