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
  const drag = async (type, x, y) => { const t = p.locator('.tile[data-type="' + type + '"]'); const bb = await t.boundingBox(); await p.mouse.move(bb.x + 30, bb.y + 20); await p.mouse.down(); await p.mouse.move(x, y, { steps: 8 }); await p.mouse.up(); };
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
  await p.selectOption('#insp select[data-k="op"]', '2'); await p.waitForTimeout(100);
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
  await shot('ui-finish'); await p.click('#dlg-close');
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

  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n' + pass + ' 通过，' + fail + ' 失败'); await b.close(); process.exit(fail ? 1 : 0);
})();
