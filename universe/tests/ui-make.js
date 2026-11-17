/* node tests/ui-make.js —— 凑十与拆数：真实鼠标测试。
 *  1. 9 + 6：没凑满时没有得数；点 1 个蓝片挪过去：凑成十，6 拆成 1 和 5，15；
 *  2. 13 − 9：先点外面 3 个、再点框里 6 个：写着平十法，4；再点一个已划的取消、换成破十的划法：写着破十法；
 *  3. 7 的分与合：点 6 条缝，找全了；
 *  4. 全程没有打开属性面板。 */
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
  const out = (port) => p.evaluate((port) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'makebench'), v = UI.S.D[e.id].out[port]; return v ? U.Q.show(v.data) : null; }, port);
  const props = () => p.evaluate(() => Object.assign({}, Object.values(UI.S.scene.entities).find((x) => x.type === 'makebench').props));
  // 按 title 点：“挪进左边”“划掉”“从这里分开：1 和 6”
  const byTitle = async (title, n) => {
    await closeDlg();
    const i = await p.evaluate(([title, n]) => { const gs = Array.from(document.querySelectorAll('.card svg.bdy g[data-pick-set]')).filter((g) => g.querySelector('title') && g.querySelector('title').textContent === title); return gs.length > n ? n : -1; }, [title, n || 0]);
    if (i < 0) throw new Error('没有：' + title);
    await p.locator('.card svg.bdy g[data-pick-set]').filter({ has: p.locator('title', { hasText: title }) }).nth(i).click(); await p.waitForTimeout(140);
  };
  // 破十：点第 i 个片（编号 0–9 在框里，10 起在外面）。可点的片按编号排列，已划的也能点（取消）
  const hit = async (idx) => { await closeDlg(); const box = await p.evaluate((idx) => { const card = document.querySelector('.card svg.bdy'), gs = Array.from(card.querySelectorAll('g[data-pick-set]')).filter((g) => { const t = g.querySelector('title').textContent; return t === '划掉' || t === '不划这个了'; }); const r = gs[idx].getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }, idx); await p.mouse.click(box[0], box[1]); await p.waitForTimeout(140); };
  const read = () => p.evaluate(() => { const g = document.querySelector('.card svg.bdy [data-read]'); return g ? g.textContent : ''; });
  const done = (id) => p.evaluate((id) => !!(UI.S.run && UI.S.run.ms[id] && UI.S.run.ms[id].done), id);

  console.log('1. 凑十');
  await open('g1-make-ten-trap');
  ok(await out('sum') === null, '还没凑满：没有得数');
  await byTitle('挪进左边');
  ok(await out('sum') === '15' && (await read()).includes('9 + 1 = 10') && (await read()).includes('10 + 5 = 15') && await done('ten') && await done('fifteen'), '挪 1 个：凑成十，10 + 5 = 15');

  console.log('2. 破十、平十');
  await open('g1-minus-break-trap');
  for (const i of [10, 11, 12, 0, 1, 2, 3, 4, 5]) await hit(i);
  ok(await out('diff') === '4' && await out('method') === '2' && (await read()).includes('平十法') && await done('four'), '先划外面 3 个、再划框里 6 个：平十法，4');
  await open('mk-15-7');
  for (let i = 0; i < 7; i++) await hit(i);
  ok(await out('diff') === '8' && await out('method') === '1' && (await read()).includes('破十法：先从 10 里减 7') && await done('diff'), '框里划 7 个：破十法，3 + 5 = 8');
  await hit(0);
  ok(await out('diff') === null && (await props()).cross === '1,2,3,4,5,6', '点一个已划的：取消，划的不够了就没有得数');

  console.log('3. 分与合');
  await open('mk-split-7');
  for (let k = 1; k <= 6; k++) await byTitle('从这里分开：' + k + ' 和 ' + (7 - k));
  ok(await out('found') === '6' && await out('all') === '1' && (await read()).includes('找全了') && await done('all'), '点 6 条缝：找全了 6 种');
  ok(await p.evaluate(() => !UI.S.inspOpen), '全程没有打开属性面板');
  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n凑十与拆数测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close(); process.exit(fail ? 1 : 0);
})();
