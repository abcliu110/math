/* node tests/ui-guessrule.js —— 猜规则台（4.1）和总是 / 有时 / 从不（4.3）的界面：真实鼠标点卡片上的格子、按钮、猜想。
 *   猜规则台：点数字格（选中高亮）→ 点“我猜”→ 格子变色、记一次；点猜想：被推翻时摆出反例，对了显示“猜对了”；互换：选规则后点“算 / 不算”，答错被指出；
 *   总是有时从不：写例子后显示 ✓ / ✗；点“有时”在没有两边例子时说明还缺什么；没有页面错误。 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const G = require('./gestures');
const url = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const body = (p, id) => p.evaluate((id) => { const c = document.querySelector('.card[data-id="' + id + '"]'); return c ? c.querySelector('svg.bdy').textContent : null; }, id);
const bdg = (p, id) => p.evaluate((id) => { const c = document.querySelector('.card[data-id="' + id + '"] .bd'); return c ? c.textContent : null; }, id);
const act = (p, a) => p.evaluate((a) => UI.App.act(a), a);
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1440, height: 900 } }), errs = [];
  p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  G.attachErrorCollector(p); await p.goto(url); await p.waitForTimeout(300); await p.evaluate(() => { UI.S.helpAuto = false; });
  await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); });
  console.log('猜规则台');
  const g = (await act(p, { t: 'add', type: 'guessrule', x: 40, y: 40, props: { secret: 5 } })).id; await p.waitForTimeout(150);
  const click = async (id, k, v) => { await p.locator('.card[data-id="' + id + '"] [data-pick-k="' + k + '"][data-pick-v="' + v + '"]').first().click(); await p.waitForTimeout(120); };
  const prop = (id, k) => p.evaluate(([id, k]) => UI.S.scene.entities[id].props[k], [id, k]);
  await click(g, 'ex', 4); ok((await prop(g, 'ex')) === 4, '点数字格 4：选中');
  await click(g, 'gs', 2); ok((await prop(g, 'tried')) === '4+-', '点“我猜：不算”：记下 4 算，我猜了不算');
  ok((await body(g ? p : p, g)).includes('猜错了'), '提示：猜错了，没关系');
  const ev = await p.evaluate(() => U.Events.log.filter((x) => x.type === 'guess').pop().data);
  ok(ev.right === false, '记了 guess 事件：猜错不扣分');
  await click(g, 'hyp', 2); let t = await body(p, g);
  ok(t.includes('你的规则说它') && (await bdg(p, g)) !== '猜对了', '猜“单数”：被反例推翻，摆出反例');
  await click(g, 'hyp', 6); ok((await bdg(p, g)) === '猜对了', '猜“除以 3 余 1”：猜对了');
  await click(g, 'ex', 9); await click(g, 'ex', 0); ok((await prop(g, 'ex')) === 0, '再点选中的格子：取消选中');
  console.log('互换');
  const sw = (await act(p, { t: 'add', type: 'guessrule', x: 40, y: 420, props: { secret: 0, mode: 1 } })).id; await p.waitForTimeout(150);
  await click(sw, 'mine', 1); t = await body(p, sw);
  ok(t.includes('系统已问 0 个例子'), '选了规则：系统开始问');
  const pend = await p.evaluate((id) => U.GuessRule.pending(UI.S.scene.entities[id].props), sw);
  await click(sw, 'ans', pend.truth ? 2 : 1); t = await body(p, sw);
  ok(t.includes('可按你选的规则'), '答错：指出矛盾');
  for (let i = 0; i < 30; i++) { const q = await p.evaluate((id) => U.GuessRule.pending(UI.S.scene.entities[id].props), sw); if (!q) break; await click(sw, 'ans', q.truth ? 1 : 2); }
  ok((await bdg(p, sw)) === '猜对了', '一直答到底：系统猜出了你的规则');
  console.log('总是 / 有时 / 从不');
  const a = (await act(p, { t: 'add', type: 'asn', x: 520, y: 40, props: { claim: 0 } })).id; await p.waitForTimeout(150);
  await act(p, { t: 'set', id: a, k: 'ex', v: '3' }); await act(p, { t: 'set', id: a, k: 'ex', v: '1/2' }); await p.waitForTimeout(120);
  t = await body(p, a);
  ok(t.includes('✓ 3') && !t.includes('1/2 '), '写 3：成立 ✓；1/2 不在范围里，不记');
  await click(a, 'guess', 2); t = await body(p, a);
  ok(t.includes('有时') && t.includes('还没有一个例子让它不成立'), '选“有时”：说明还缺一个不成立的例子');
  await act(p, { t: 'set', id: a, k: 'ex', v: '7' });
  ok(errs.length === 0 && (await G.assertInvariants(p, '猜规则台')) !== false, '没有页面错误：' + errs.slice(0, 2).join('|'));
  await b.close(); console.log(pass + ' 通过，' + fail + ' 失败'); process.exit(fail ? 1 : 0);
})();
