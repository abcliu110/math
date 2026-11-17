/* node tests/ui-vert.js —— 竖式（加减与除法）：真实鼠标测试。
 *  1. 47 + 38：个位写 5；十位没点“进 1”就写，被拦住并说明；点十位上面的小圆圈，再写 8：85；撤销一次回到没写十位；
 *  2. 52 − 27：个位不够减，被拦住；点十位“退 1”，十位上方写 4、个位上方写 12；写 5、2：25；
 *  3. 812 ÷ 4：先试 3，说明 3 × 4 = 12 比 8 大；试 2 对了；落下 1 不够除写 0；再写 3：203；
 *  4. 全程没有打开属性面板。
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
  const props = () => p.evaluate(() => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'vertbench'); return Object.assign({}, e.props); });
  const out = (port) => p.evaluate((port) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'vertbench'), v = UI.S.D[e.id].out[port]; return v ? U.Q.show(v.data) : null; }, port);
  const key = async (k) => { await closeDlg(); await p.locator('.card svg.bdy [data-key="' + k + '"]').click(); await p.waitForTimeout(130); };
  const mark = async (j) => { await closeDlg(); await p.locator('.card svg.bdy [data-mark="' + j + '"]').click(); await p.waitForTimeout(150); };
  const done = (id) => p.evaluate((id) => !!(UI.S.run && UI.S.run.ms[id] && UI.S.run.ms[id].done), id);
  const msg = () => p.evaluate(() => { const g = document.querySelector('.card svg.bdy [data-msg]'); return g ? g.textContent : ''; });
  const text = () => p.evaluate(() => document.querySelector('.card svg.bdy').textContent);

  console.log('1. 进位');
  await open('vt-47-38');
  await key(5);
  ok((await props()).res === '5', '个位写 5');
  await key(8);
  ok((await props()).res === '5' && (await msg()).includes('前一位满十了'), '十位没点“进 1”就写：被拦住，说明“前一位满十了”');
  await mark(1); await key(8);
  ok((await props()).res === '58' && await out('result') === '85' && await done('done') && (await text()).includes('47 + 38 = 85'), '点十位的“进 1”，再写 8：85');
  await p.keyboard.press('Control+z'); await p.waitForTimeout(200);
  ok((await props()).res === '5', '撤销一次：十位还没写（一次点击一步）');

  console.log('2. 退位');
  await open('vt-52-27');
  await key(5);
  ok((await props()).res === '' && (await msg()).includes('不够减'), '个位直接写：被拦住，说明 2 不够减 7');
  await mark(1);
  ok((await text()).includes('12') && (await text()).includes('4'), '点十位“退 1”：十位上方写 4，个位上方写 12');
  await key(5); await key(2);
  ok(await out('result') === '25' && await done('done'), '写 5、2：25');

  console.log('3. 除法');
  await open('g3-divide-zero-trap');
  await key(3);
  ok((await props()).qd === '' && (await msg()).includes('3 × 4 = 12，比 8 大'), '先试 3：说明 3 × 4 = 12 比 8 大');
  await key(2);
  ok((await props()).qd === '2' && (await text()).includes('1 比 4 小，不够除：商写 0'), '试 2 对了；落下 1，写着“不够除：商写 0”');
  await key(0); await key(3);
  ok(await out('q') === '203' && await out('r') === '0' && await done('q') && (await text()).includes('812 ÷ 4 = 203'), '写 0、3：812 ÷ 4 = 203');
  ok(await p.evaluate(() => !UI.S.inspOpen), '全程没有打开属性面板');
  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n竖式（加减与除法）测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close(); process.exit(fail ? 1 : 0);
})();
