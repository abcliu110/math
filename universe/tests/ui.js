/* node tests/ui.js —— 无头浏览器验收：拖器材、连线、改属性、时钟、撤销、练习通关、考试交卷。需要 playwright。
 * 截图写到 tests/shots/。 */
'use strict';
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const url = 'file://' + path.join(__dirname, '..', 'index.html');
const shots = path.join(__dirname, 'shots'); fs.mkdirSync(shots, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1440, height: 860 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(url); await p.waitForTimeout(300);
  const shot = (n) => p.screenshot({ path: path.join(shots, n + '.png') });
  const ents = () => p.evaluate(() => Object.keys(UI.S.scene.entities).length);
  const links = () => p.evaluate(() => UI.S.scene.links.length);

  console.log('自由探究');
  // 拖「数字」「数字」「运算器」到台面
  const drag = async (type, x, y) => { const t = p.locator('.tile[data-type="' + type + '"]'); await t.scrollIntoViewIfNeeded(); const bb = await t.boundingBox(); await p.mouse.move(bb.x + 30, bb.y + 20); await p.mouse.down(); await p.mouse.move(x, y, { steps: 8 }); await p.mouse.up(); };
  await drag('num', 450, 200); await drag('num', 450, 420); await drag('op', 800, 300);
  ok((await ents()) === 3, '拖 3 个器材上台面');
  await p.evaluate(() => { const S = UI.S, ids = Object.keys(S.scene.entities); UI.App.act({ t: 'set', id: ids[0], k: 'n', v: 2 }); UI.App.act({ t: 'set', id: ids[0], k: 'd', v: 5 }); UI.App.act({ t: 'set', id: ids[1], k: 'd', v: 3 }); });
  // 用鼠标连线：数1 输出口 → 运算器 甲口
  const dragLink = async (fromId, toId, port) => {
    const a = await p.locator('.port.out[data-id="' + fromId + '"]').boundingBox();
    await p.mouse.move(a.x + 9, a.y + 9); await p.mouse.down();
    const t = await p.locator(port ? '.port.in[data-id="' + toId + '"][data-port="' + port + '"]' : '.card[data-id="' + toId + '"]').first().boundingBox();
    await p.mouse.move(t.x + t.width / 2, t.y + t.height / 2, { steps: 10 }); const tipVis = await p.locator('#tip').isVisible(); await p.mouse.up(); return tipVis;
  };
  const [e1, e2, e3] = await p.evaluate(() => Object.keys(UI.S.scene.entities));
  const t1 = await dragLink(e1, e3, 'a'); ok(t1, '拖线悬停时出现提示'); await dragLink(e2, e3, 'b');
  ok((await links()) === 2, '鼠标连了 2 根线');
  const res = await p.evaluate(() => { const S = UI.S, id = Object.keys(S.scene.entities)[2]; return U.Q.show(S.D[id].out.r.data); });
  ok(res === '11/15', '2/5 + 1/3 = ' + res);
  // 非法连线被拒绝并说原因：运算器输出接回自己的甲口
  await dragLink(e3, e3, 'a'); const msg = await p.locator('#banner').innerText().catch(() => '');
  ok(/记忆/.test(msg) && (await links()) === 2, '无记忆的环被拒绝并解释：' + msg.slice(0, 20));
  // 属性面板
  await p.dblclick('.card[data-id="' + e3 + '"] .hd'); await p.waitForTimeout(100);
  ok(await p.locator('#insp.open').count() === 1, '双击打开属性面板');
  await p.click('#insp .sg[data-k="op"][data-seg="2"]'); await p.waitForTimeout(100);
  const r2 = await p.evaluate((id) => U.Q.show(UI.S.D[id].out.r.data), e3);
  ok(r2 === '2/15', '改成 × 后得 ' + r2);
  await shot('ui-free');
  // 撤销
  await p.click('#undo'); const r3 = await p.evaluate((id) => U.Q.show(UI.S.D[id].out.r.data), e3);
  ok(r3 === '11/15', '撤销回到 + ');
  // 整理
  await p.click('#tidy'); ok((await ents()) === 3, '整理不丢器材');

  console.log('时钟与记忆器');
  await p.click('#clear'); await p.waitForTimeout(50);
  const ids = await p.evaluate(() => { const A = UI.App, S = UI.S; const m = A.act({ t: 'add', type: 'memory', x: 300, y: 200 }).id, o = A.act({ t: 'add', type: 'op', x: 620, y: 200 }).id, n = A.act({ t: 'add', type: 'num', x: 300, y: 380 }).id; A.act({ t: 'link', from: m, to: o, toPort: 'a' }); A.act({ t: 'link', from: n, to: o, toPort: 'b' }); A.act({ t: 'link', from: o, to: m, toPort: 'in' }); return { m, o, n }; });
  await p.click('#rew'); await p.click('[data-rate="20"]'); await p.click('#go'); await p.waitForTimeout(1500); await p.click('#go');
  const mv = await p.evaluate((id) => U.Q.num(UI.S.D[id].out.v.data), ids.m);
  ok(mv >= 10, '时钟 20× 跑 1.5 秒，记忆器数到 ' + mv);
  await shot('ui-loop');

  console.log('练习通关');
  await p.evaluate(() => UI.App.openProblem('frac-add-unlike', 'practice')); await p.waitForTimeout(200);
  await p.click('[data-pred="1"]');
  await drag('op', 800, 330);
  const [a, bb] = await p.evaluate(() => Object.keys(UI.S.scene.entities).filter((k) => UI.S.scene.entities[k].type === 'num'));
  const opid = await p.evaluate(() => Object.keys(UI.S.scene.entities).find((k) => UI.S.scene.entities[k].type === 'op'));
  await dragLink(a, opid, 'a'); await dragLink(bb, opid, 'b'); await p.waitForTimeout(1200);
  ok(await p.locator('#dlg.open').count() === 1, '做完后出现结果对话框');
  const txt = await p.locator('#dlg .box').innerText(); ok(/10 \/ 10/.test(txt), '满分 10/10：' + txt.replace(/\s+/g, ' ').slice(0, 60));
  ok(/11\/15/.test(txt) && /你的猜想/.test(txt), '猜想与结果并排');
  await shot('ui-finish');
  await p.click('#dlg-inquiry'); await p.waitForTimeout(100);
  ok(await p.locator('#dlg .rep2 .pcard').count() === 4 && /实验报告/.test(await p.locator('#dlg .box').innerText()), '结果里可以打开实验报告，四栏齐全');
  await p.click('#dlg-close');
  console.log('考试交卷');
  await p.click('[data-mode="exam"]'); await p.waitForTimeout(200);
  ok(await p.locator('#submit').isVisible(), '考试模式有交卷按钮');
  ok(!(await p.locator('.step').count()), '考试模式没有步骤清单');
  await p.click('#submit'); await p.waitForTimeout(100);
  const ex = await p.locator('#dlg .box').innerText(); ok(/交卷结果/.test(ex) && /0 \/ 10/.test(ex), '空白交卷 0 分：' + ex.replace(/\s+/g, ' ').slice(0, 30));
  await p.click('#dlg-close');
  console.log('两骰子');
  await p.evaluate(() => UI.App.openProblem('two-dice', 'practice')); await p.waitForTimeout(100);
  await shot('ui-dice-start');

  console.log('学习报告');
  await p.evaluate(() => { U.Events.clear(); U.Events.ctx = { pid: 'frac-add-unlike', mode: 'practice' }; U.Events.push('trap', { id: 'bad38' }); U.Events.push('finish', { score: 6, max: 10, traps: [], usedSec: 120 }); UI.Panels.renderLeft(); });
  await p.click('[data-tab="lab"]'); await p.waitForTimeout(100);
  ok(/该复习/.test(await p.locator('#leftbody').innerText()), '实验库顶部出现“该复习”');
  await p.click('#menubtn'); await p.click('[data-m="report"]'); await p.waitForTimeout(100);
  const rp = await p.locator('#dlg .box').innerText(); ok(/学习报告/.test(rp) && /1 \/ /.test(rp), '学习报告对话框有进度：' + rp.replace(/\s+/g, ' ').slice(0, 40));
  await shot('ui-report'); await p.click('#dlg-close');
  console.log('删线');
  await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); const n = UI.App.act({ t: 'add', type: 'num', x: 100, y: 100, props: { n: 2 } }).id, o = UI.App.act({ t: 'add', type: 'op', x: 400, y: 100 }).id; UI.App.act({ t: 'link', from: n, to: o, toPort: 'a' }); });
  await p.waitForTimeout(150);
  const hitBb = await p.locator('path.hit').first().boundingBox(); await p.mouse.click(hitBb.x + hitBb.width / 2, hitBb.y + hitBb.height / 2); await p.waitForTimeout(100);
  await p.click('.lbdel'); await p.waitForTimeout(100);
  ok((await links()) === 0, '点选连线后点 ✕ 可以删除这根线');
  console.log('学生出题');
  await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); for (const n of [5, 7, 2]) UI.App.act({ t: 'add', type: 'num', x: 60, y: 60 + n * 10, props: { n } }); });
  await p.click('#menubtn'); await p.click('[data-m="author"]'); await p.waitForTimeout(100);
  ok((await p.inputValue('#au-givens')).replace(/\s/g, '') === '5,7,2', '出题对话框自动带入台面上的数');
  await p.fill('#au-title', '用 5、7、2 凑 24'); await p.fill('#au-target', '100'); await p.click('#au-ok');
  ok(/凑不出/.test(await p.locator('#au-msg').innerText()), '凑不出的题被拒绝并说原因');
  await p.fill('#au-target', '24'); await p.click('#au-ok'); await p.waitForTimeout(150);
  ok(await p.locator('#leftbody .it', { hasText: '用 5、7、2 凑 24' }).count() === 1, '题目出现在「我的题」里');
  await shot('ui-author');
  await p.click('#leftbody .it:has-text("用 5、7、2 凑 24")'); await p.waitForTimeout(200);
  ok(/用 5、7、2 凑 24/.test(await p.locator('#ptitle').innerText()), '点开就能做');
  await p.click('[data-tab="lab"]'); await p.click('[data-del]'); await p.waitForTimeout(100);
  ok(await p.locator('#leftbody .it', { hasText: '凑 24' }).count() === 0, '可以删除自己的题');
  // 容器：拖筹码进十格阵、满十拒绝、拖出来取出、删容器时询问
  console.log('容器');
  await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); window.__tf = UI.App.act({ t: 'add', type: 'tenframe', x: 200, y: 200, props: {} }).id; window.__c = []; for (let i = 0; i < 11; i++) window.__c.push(UI.App.act({ t: 'add', type: 'counter', x: 40 + i * 60, y: 90, props: {} }).id); });
  await p.waitForTimeout(200);
  const dragCard = async (id, tx, ty) => {
    const c = await p.locator('.card[data-id="' + id + '"] .hd').first().boundingBox();
    await p.mouse.move(c.x + 10, c.y + 10); await p.mouse.down(); await p.mouse.move(tx, ty, { steps: 12 }); await p.mouse.up(); await p.waitForTimeout(120);
  };
  const tfBox = await p.locator('.card[data-id="' + (await p.evaluate(() => window.__tf)) + '"]').boundingBox();
  await dragCard(await p.evaluate(() => window.__c[0]), tfBox.x + 60, tfBox.y + 70);
  ok(await p.evaluate(() => UI.S.scene.entities[window.__c[0]].parent === window.__tf), '拖筹码到十格阵上，它就放进去了');
  await dragCard(await p.evaluate(() => window.__c[0]), 60, 780);
  ok(await p.evaluate(() => UI.S.scene.entities[window.__c[0]].parent === null), '拖出十格阵，它就取出来了');
  await p.evaluate(() => { for (let i = 0; i < 10; i++) UI.App.act({ t: 'put', id: window.__c[i + 1], parent: window.__tf, slot: 'cells' }); });
  await p.evaluate(() => { UI.S.inspOpen = false; UI.S.sel = null; UI.Panels.renderInsp(); });
  await p.evaluate(() => { window.__c[0] = UI.App.act({ t: 'add', type: 'counter', x: 40, y: 300, props: {} }).id; });
  await dragCard(await p.evaluate(() => window.__c[0]), tfBox.x + 60, tfBox.y + 70);
  ok(/满十就要换成 1 个十/.test(await p.evaluate(() => document.querySelector('#banner').textContent)), '满十时拖入被拒绝，并说明原因');
  await p.evaluate(() => UI.App.act({ t: 'clear' })); await p.waitForTimeout(80);
  const tf2 = await p.evaluate(() => UI.App.act({ t: 'add', type: 'tenframe', x: 300, y: 200, props: {} }).id);
  const cc = await p.evaluate(() => UI.App.act({ t: 'add', type: 'counter', x: 60, y: 300, props: {} }).id);
  await p.evaluate((id) => { UI.App.act({ t: 'put', id: window.__c[0], parent: id, slot: 'cells' }); }, tf2).catch(() => {});
  await p.evaluate((x) => { window.__k = UI.App.act({ t: 'add', type: 'counter', x: 330, y: 230, props: {} }).id; UI.App.act({ t: 'put', id: window.__k, parent: x, slot: 'cells' }); }, tf2);
  await p.evaluate((x) => UI.App.removeEntity(x), tf2); await p.waitForTimeout(120);
  ok(await p.locator('#dlg.open #dlg-delout').count() === 1, '删除有东西的容器时出现询问');
  const kidId = await p.evaluate(() => window.__k);
  await p.click('#dlg-delout'); await p.waitForTimeout(120);
  ok(await p.evaluate((x) => !UI.S.scene.entities[x], tf2) && await p.evaluate((x) => !!UI.S.scene.entities[x], kidId), '选“倒到台面上”：容器删了，东西还在');
  console.log('属性控件');
  await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); window.__n = UI.App.act({ t: 'add', type: 'num', x: 200, y: 200, props: { n: 3 } }).id; UI.S.sel = window.__n; UI.S.inspOpen = true; UI.Panels.renderInsp(); });
  await p.waitForTimeout(100);
  ok(await p.locator('#insp input[type="range"][data-k="n"]').count() === 1, '数字的分子是滑杆（有范围）');
  await p.evaluate(() => { const r = document.querySelector('#insp input[type="range"][data-k="n"]'); r.value = '7'; r.dispatchEvent(new Event('change', { bubbles: true })); });
  await p.waitForTimeout(100);
  ok(await p.evaluate(() => UI.S.scene.entities[window.__n].props.n === 7), '拖滑杆会改变属性值');
  await p.click('#insp button[data-step="1"][data-k="n"]'); await p.waitForTimeout(100);
  ok(await p.evaluate(() => UI.S.scene.entities[window.__n].props.n === 8), '+ 按钮仍然可用（取数字框的值）');
  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n' + pass + ' 通过，' + fail + ' 失败'); await b.close(); process.exit(fail ? 1 : 0);
})();
