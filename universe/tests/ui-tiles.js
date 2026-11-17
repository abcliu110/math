/* node tests/ui-tiles.js —— 代数砖台面：真实鼠标测试。
 *  1. x² + 5x + 6：一开始缺、多都标红；点长、宽的“1 +”到 x + 3、x + 2：拼成了 (x + 3)(x + 2)；
 *  2. x² + 5x + 5：点“拼不成”，说对了；
 *  3. (x + 1)(x + 4)：放 x² 两次，第二次被拦住“已经铺满了”；铺满：x² + 5x + 4；
 *  4. x² + 6x：边长调到 x + 3，补 9 个小方块：(x + 3)²；
 *  5. 平方差：剪开、拼过去：a² − b² = (a + b)(a − b)；
 *  6. 全程没有打开属性面板。 */
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
  const out = (port) => p.evaluate((port) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'tilebench'), v = UI.S.D[e.id].out[port]; return v ? U.Q.show(v.data) : null; }, port);
  const btns = (label) => p.locator('.card svg.bdy g[data-pick-set]').filter({ hasText: label });
  const press = async (label, n) => { await closeDlg(); await btns(label).nth(n || 0).click(); await p.waitForTimeout(140); };
  const read = () => p.evaluate(() => { const g = document.querySelector('.card svg.bdy [data-read]'); return g ? g.textContent : ''; });
  const text = () => p.evaluate(() => Array.from(document.querySelectorAll('.card svg.bdy text')).map((t) => t.textContent).join('|'));
  const done = (id) => p.evaluate((id) => !!(UI.S.run && UI.S.run.ms[id] && UI.S.run.ms[id].done), id);

  console.log('1. 拼长方形');
  await open('tl-factor');
  ok((await text()).includes('多 5 块') && (await text()).includes('多 6 块') && await out('done') === '0', '一开始框里只有 x²：长条、小方块都多出来，标红');
  for (let i = 0; i < 3; i++) await press('1 +', 0);
  for (let i = 0; i < 2; i++) await press('1 +', 1);
  ok(await out('done') === '1' && (await read()).includes('x² + 5x + 6 = (x + 3)(x + 2)') && await done('done'), '长 x + 3、宽 x + 2：拼成了');

  console.log('2. 拼不成');
  await open('tl-trap');
  await press('拼不成');
  ok(await out('judged') === '1' && (await read()).includes('拼不成长方形') && await done('judged'), '点“拼不成”：说对了');

  console.log('3. 展开');
  await open('tl-expand');
  await press('放一块 x²'); await press('放一块 x²');
  ok((await text()).includes('x² 的位置已经铺满了'), '第二块 x²：被拦住，说已经铺满了');
  for (let i = 0; i < 5; i++) await press('放一条 x');
  for (let i = 0; i < 4; i++) await press('放一个 1');
  ok(await out('done') === '1' && (await read()).includes('= x² + 5x + 4') && await done('rect'), '铺满了：x² + 5x + 4');

  console.log('4. 配方');
  await open('tl-complete');
  for (let i = 0; i < 3; i++) await press('+');
  ok((await text()).includes('缺 9 块'), '边长调到 x + 3：长条正好平分两边，角上缺 9 块');
  for (let i = 0; i < 9; i++) await press('补一个小方块');
  ok(await out('added') === '9' && (await read()).includes('(x + 3)²') && await done('square'), '补 9 个：x² + 6x + 9 = (x + 3)²');

  console.log('5. 平方差');
  await open('tlb-diff');
  await press('沿虚线剪开'); await press('拼过去');
  ok(await out('done') === '1' && (await read()).includes('a² − b² = (a + b)(a − b)') && (await read()).includes('55 = 11 × 5') && await done('done'), '剪开、拼过去：(a + b)(a − b)，8² − 3² = 55 = 11 × 5');
  ok(await p.evaluate(() => !UI.S.inspOpen), '全程没有打开属性面板');
  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n代数砖测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close(); process.exit(fail ? 1 : 0);
})();
