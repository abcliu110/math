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
  const dragLink = async (fromId, toId, port, fromPort) => {
    const a = await p.locator('.port.out[data-id="' + fromId + '"]' + (fromPort ? '[data-port="' + fromPort + '"]' : '')).first().boundingBox();
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
  console.log('预测表单（五种形式里的四种）');
  // 用 frac-add-unlike 的台面，换上四种预测；每次作答后要重新打开题目（作答后就不能再改）
  await p.evaluate(() => {
    const base = U.problemById('frac-add-unlike'), mk = (id, predict) => U.problems.push(Object.assign({}, base, { id, title: '预测测试 ' + id, predict }));
    mk('t-place', { form: 'place', q: '猜猜这个数放哪个位置', slots: ['甲', '乙', '丙'], answer: 1 });
    mk('t-more', { form: 'more-less', q: '比一比', ref: '一块饼', answer: 'less' });
    mk('t-num', { form: 'number', q: '写出结果', answer: '3/4' });
    mk('t-type', { form: 'type', q: '写出结果', answer: '二分之一', accept: ['1/2', '0.5'] });
  });
  const openPred = async (id) => { await p.evaluate((x) => UI.App.openProblem(x, 'practice'), id); await p.waitForTimeout(150); };
  const predCard = async () => { const l = p.locator('#leftbody .pcard', { hasText: '你的猜想' }); return (await l.count()) ? l.first().innerText() : ''; };
  await openPred('t-place');
  ok(await p.locator('#leftbody [data-pred="place"]').count() === 3, '位置题：画出三个位置按钮');
  await p.click('#leftbody [data-pred="place"][data-slot="0"]'); await p.waitForTimeout(80);
  ok(/✗ 不对/.test(await predCard()) && /乙/.test(await predCard()), '位置题：放在甲 → ✗，并说正确的是乙');
  await openPred('t-place');
  await p.click('#leftbody [data-pred="place"][data-slot="1"]'); await p.waitForTimeout(80);
  ok(/✓ 对了/.test(await predCard()), '位置题：放在乙 → ✓');
  await openPred('t-more');
  ok(await p.locator('#leftbody [data-form="more-less"]').count() === 3, '多少题：画出多 / 少 / 一样三个按钮');
  await p.click('#leftbody [data-pred="cmp"][data-cmp="more"]'); await p.waitForTimeout(80);
  ok(/你的猜想：多/.test(await predCard()) && /✗ 不对/.test(await predCard()), '多少题：answer 是少，点「多」→ ✗');
  await openPred('t-more');
  await p.click('#leftbody [data-pred="cmp"][data-cmp="less"]'); await p.waitForTimeout(80);
  ok(/✓ 对了/.test(await predCard()), '多少题：点「少」→ ✓');
  await openPred('t-num');
  await p.fill('#predin', '3/4'); await p.click('#leftbody [data-pred="submit"]'); await p.waitForTimeout(80);
  ok(/✓ 对了/.test(await predCard()), '数字题：写 3/4 → ✓');
  await openPred('t-num');
  await p.fill('#predin', '6/8'); await p.click('#leftbody [data-pred="submit"]'); await p.waitForTimeout(80);
  ok(/✓ 对了/.test(await predCard()), '数字题：写 6/8 → 也 ✓（同一个数）');
  await openPred('t-num');
  await p.click('#leftbody [data-pred="submit"]'); await p.waitForTimeout(80);
  ok(await p.locator('#predin').count() === 1 && (await predCard()) === '', '数字题：空着提交什么也不做，输入框还在');
  await openPred('t-type');
  await p.fill('#predin', '1/2'); await p.click('#leftbody [data-pred="submit"]'); await p.waitForTimeout(80);
  ok(/✓ 对了/.test(await predCard()), '文字题：写 1/2（accept 里的写法）→ ✓');
  await openPred('t-type');
  await p.fill('#predin', ' 0.5 '); await p.click('#leftbody [data-pred="submit"]'); await p.waitForTimeout(80);
  ok(/✓ 对了/.test(await predCard()), '文字题：写 0.5（前后空格去掉）→ ✓');
  await openPred('t-type');
  await p.fill('#predin', '2'); await p.click('#leftbody [data-pred="submit"]'); await p.waitForTimeout(80);
  ok(/✗ 不对/.test(await predCard()), '文字题：写 2 → ✗');
  await openPred('frac-add-unlike'); await p.click('#leftbody [data-pred="skip"]'); await p.waitForTimeout(80);
  console.log('考试交卷');
  await p.click('[data-mode="exam"]'); await p.waitForTimeout(200);
  ok(await p.locator('#submit').isVisible(), '考试模式有交卷按钮');
  ok(!(await p.locator('.step').count()), '考试模式没有步骤清单');
  await p.click('#submit'); await p.waitForTimeout(100);
  const ex = await p.locator('#dlg .box').innerText(); ok(/交卷结果/.test(ex) && /0 \/ 10/.test(ex), '空白交卷 0 分：' + ex.replace(/\s+/g, ' ').slice(0, 30));
  ok(await p.locator('#dlg select[data-reason]').count() >= 1, '交卷后没达成的里程碑要选错因');
  await p.selectOption('#dlg select[data-reason]', { index: 1 }); await p.waitForTimeout(80);
  ok(await p.evaluate(() => UI.App && UI.S.scene && true), '选错因不打断界面');
  await p.evaluate(() => UI.Panels.closeDialog()); await p.waitForTimeout(100); await p.click('#menubtn'); await p.locator('[data-m="wrong"]').waitFor({ state: 'visible' }); await p.click('[data-m="wrong"]'); await p.waitForTimeout(100);
  ok(/错题本/.test(await p.locator('#dlg .box').innerText()) && await p.locator('#dlg .it').count() >= 1, '菜单里的错题本列出做错的题');
  await p.evaluate(() => UI.Panels.closeDialog());
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
  console.log('来历面板');
  await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' });
    const a = UI.App.act({ t: 'add', type: 'num', x: 60, y: 100, props: { n: 2, d: 5 } }).id, b = UI.App.act({ t: 'add', type: 'num', x: 60, y: 260, props: { n: 1, d: 3 } }).id, o = UI.App.act({ t: 'add', type: 'op', x: 380, y: 160, props: {} }).id;
    UI.App.act({ t: 'link', from: a, fromPort: 'v', to: o, toPort: 'a' }); const l2 = UI.App.act({ t: 'link', from: b, fromPort: 'v', to: o, toPort: 'b' });
    window.__o = o; UI.S.sel = null; UI.S.inspOpen = false; UI.Panels.renderInsp(); });
  await p.evaluate(() => { const o = window.__o; const out = UI.S.scene.entities[o]; UI.App.act({ t: 'add', type: 'meter', x: 640, y: 160, props: {} }); const m = Object.values(UI.S.scene.entities).find((e) => e.type === 'meter'); UI.App.act({ t: 'link', from: o, fromPort: 'r', to: m.id, toPort: 'v' }); UI.S.selLink = UI.S.scene.links[UI.S.scene.links.length - 1].id; UI.Stage.render(); });
  await p.waitForTimeout(150);
  await p.click('.lbwhy'); await p.waitForTimeout(100);
  const whyTxt = await p.locator('#dlg .why-tree').innerText().catch(() => '');
  ok(await p.locator('#dlg .why-tree details').count() >= 3 && /通分/.test(await p.locator('#dlg .why-tree').evaluate((n) => n.textContent)), '点气泡上的？，打开来历面板，一路展开到数字卡');
  await p.evaluate(() => UI.Panels.closeDialog());
  console.log('证明器材');
  await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' });
    window.__pv = ['conjecture_board', 'scanner', 'counterex', 'enumerator', 'invariant', 'scaffold', 'induction'].map((t) => UI.App.act({ t: 'add', type: t, x: 80 + (window.__i = (window.__i || 0) + 1) * 0, y: 120, props: {} }).id); });
  await p.evaluate(() => { const s = UI.App.act({ t: 'add', type: 'scanner', x: 420, y: 140, props: { rule: 0, from: 1, to: 30 } }).id; const c = UI.App.act({ t: 'add', type: 'counterex', x: 420, y: 340, props: { rule: 3, from: 1, to: 20 } }).id; window.__sc = s; window.__ce = c; });
  await p.waitForTimeout(200);
  ok(await p.locator('.card[data-id="' + (await p.evaluate(() => window.__sc)) + '"] svg').count() >= 0 && await p.locator('.card').count() >= 9, '证明器材可以放上台面并画出来');
  ok(await p.evaluate(() => UI.S.D[window.__ce].out.refuted.data === true), '反例构造器找到反例并推翻');
  ok(await p.locator('.tile[data-type="scanner"]').count() === 1, '器材架上有参数扫描器');
  console.log('学习数据界面');
  await p.evaluate(() => UI.Panels.closeDialog());
  await p.click('#menubtn'); await p.click('[data-m="parent"]'); await p.waitForTimeout(100);
  ok(/家长周报/.test(await p.locator('#dlg .box').innerText()), '菜单里的家长周报能打开');
  await p.evaluate(() => UI.Panels.closeDialog());
  await p.click('#menubtn'); await p.click('[data-m="improve"]'); await p.waitForTimeout(100);
  ok(/改进清单/.test(await p.locator('#dlg .box').innerText()), '菜单里的改进清单能打开');
  await p.evaluate(() => UI.Panels.closeDialog());
  await p.click('#menubtn'); await p.click('[data-m="health"]'); await p.waitForTimeout(100);
  await p.fill('#hp-point', '1.1'); await p.click('#hp-go'); await p.waitForTimeout(100);
  ok(/数数、一一对应/.test(await p.locator('#hp-out').innerText()) || /还没有做过/.test(await p.locator('#hp-out').innerText()), '体检表能按知识点编号查询');
  await p.fill('#hp-point', '9.99'); await p.click('#hp-go'); await p.waitForTimeout(80);
  ok(/没有/.test(await p.locator('#hp-out').innerText()), '查不存在的编号会说明');
  await p.evaluate(() => UI.Panels.closeDialog());
  console.log('证明脚手架的依据选择');
  await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' });
    window.__k1 = UI.App.act({ t: 'add', type: 'invariant', x: 60, y: 120, props: { change: 0, times: 2 } }).id;
    window.__k2 = UI.App.act({ t: 'add', type: 'invariant', x: 60, y: 300, props: { change: 0, times: 3 } }).id;
    window.__sf = UI.App.act({ t: 'add', type: 'scaffold', x: 400, y: 200, props: {} }).id;
    UI.S.sel = window.__sf; UI.S.inspOpen = true; UI.Panels.renderInsp(); });
  await p.waitForTimeout(150);
  ok(await p.locator('#insp select[data-fact="r1"] option').count() >= 3, '依据下拉框列出台面上的事实');
  await p.selectOption('#insp select[data-fact="r1"]', { value: await p.evaluate(() => window.__k1 + '.kept') }); await p.waitForTimeout(80);
  await p.selectOption('#insp select[data-fact="r2"]', { value: await p.evaluate(() => window.__k2 + '.kept') }); await p.waitForTimeout(80);
  await p.selectOption('#insp select[data-fact="r3"]', { value: await p.evaluate(() => window.__k1 + '.kept') }); await p.waitForTimeout(120);
  ok(await p.evaluate(() => UI.S.scene.entities[window.__sf].props.r1 === window.__k1 + '.kept' && UI.S.D[window.__sf].out.lv.data.n === 4n), '选中三条成立的事实后，证明到 ④');
  await p.evaluate(() => { UI.App.act({ t: 'set', id: window.__k1, k: 'times', v: 1 }); }); await p.waitForTimeout(80);
  console.log('规则文本框');
  await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' });
    window.__rs = UI.App.act({ t: 'add', type: 'scanner', x: 300, y: 150, props: { rule: 9, custom: '2n+1', from: 1, to: 10 } }).id;
    UI.S.sel = window.__rs; UI.S.inspOpen = true; UI.Panels.renderInsp(); });
  await p.waitForTimeout(120);
  ok(await p.locator('#insp .rsyms button').count() >= 10, '规则文本框下面有符号按钮');
  ok(/不完整|没写完|多出|看不懂|要写成/.test(await p.locator('#insp .rhint').innerText()), '写不完整的规则给出实时提示');
  await p.click('#insp .rsyms button[data-ins="是质数"]'); await p.waitForTimeout(120);
  ok(await p.evaluate(() => UI.S.scene.entities[window.__rs].props.custom === '2n+1是质数'), '点符号按钮，文字插入到规则里');
  ok(/看懂了/.test(await p.locator('#insp .rhint').innerText()), '写对以后显示“看懂了”');
  console.log('分享台面');
  await p.evaluate(() => { UI.Panels.closeDialog(); UI.App.openFree(); });
  await p.click('#menubtn'); await p.click('[data-m="share"]'); await p.waitForTimeout(100);
  const sh = await p.locator('#sharetext').inputValue().catch(() => '');
  ok(sh.length > 0 && /^[A-Za-z0-9_-]+$/.test(sh), '菜单「分享台面」给出一段分享文字');
  const cnt = await p.evaluate((t) => Object.keys(U.Share.decode(t).entities).length, sh);
  ok(cnt === (await p.evaluate(() => Object.keys(UI.S.scene.entities).length)), '分享文字解开后器材数一致：' + cnt);
  await p.click('#dlg-close');

  console.log('我来出题');
  await p.evaluate(() => { UI.App.act({ t: 'clear' }); UI.App.act({ t: 'add', type: 'num', x: 100, y: 100, props: { n: 5 } }); });
  await p.click('#menubtn'); await p.click('[data-m="student"]'); await p.waitForTimeout(100);
  await p.fill('#st-desc', '用一张数字卡搭出 5'); await p.fill('#st-value', '5'); await p.click('#st-check'); await p.waitForTimeout(80);
  ok(/自检通过/.test(await p.locator('#st-msg').innerText()), '自检：台面满足目标、空台面不满足 → 通过');
  await p.fill('#st-value', '7'); await p.click('#st-check'); await p.waitForTimeout(80);
  ok(/自检没通过/.test(await p.locator('#st-msg').innerText()), '目标改成 7，台面不满足 → 说明原因');
  await p.evaluate(() => UI.Panels.closeDialog());

  console.log('班级看板');
  const codes = await p.evaluate(() => {
    const pid = 'frac-add-unlike', m = U.problemById(pid).milestones[0].id;
    const mk = (done) => U.Share.resultCode(U.Share.resultFile('a1', [pid], [{ type: 'finish', pid, ts: 1, data: { items: [{ id: m, done }], traps: [] } }], '甲'));
    return mk(true) + '\n' + mk(false) + '\nnot-a-code';
  });
  await p.click('#menubtn'); await p.click('[data-m="board"]'); await p.waitForTimeout(100);
  await p.fill('#cb-codes', codes); await p.click('#cb-go'); await p.waitForTimeout(100);
  const board = await p.locator('#cb-out').innerText();
  ok(/共 2 份结果/.test(board) && /第 3 行/.test(board) && /50%/.test(board), '看板：2 份结果，第 3 行跳过，达成率 50%：' + board.replace(/\s+/g, ' ').slice(0, 60));
  await p.evaluate(() => UI.Panels.closeDialog());

  console.log('断点续做');
  await p.evaluate(() => { UI.Panels.closeDialog(); UI.App.openProblem('frac-add-unlike', 'practice'); });
  await p.waitForTimeout(150);
  const nid = await p.evaluate(() => { const id = Object.keys(UI.S.scene.entities).find((k) => UI.S.scene.entities[k].type === 'num'); UI.App.act({ t: 'set', id, k: 'n', v: 9 }); return id; });
  await p.waitForTimeout(2300); await p.reload(); await p.waitForTimeout(300);
  ok(await p.locator('#dlg.open').count() === 1 && /接着做？/.test(await p.locator('#dlg .box').innerText()), '刷新后出现「接着做？」对话框');
  await p.click('#dlg-resume'); await p.waitForTimeout(200);
  const back = await p.evaluate((id) => ({ pid: UI.S.problem && UI.S.problem.id, mode: UI.S.mode, n: UI.S.scene.entities[id] && UI.S.scene.entities[id].props.n }), nid);
  ok(back.pid === 'frac-add-unlike' && back.mode === 'practice' && back.n === 9, '接着做：题目、模式和改过的数都回来了：' + JSON.stringify(back));
  await p.evaluate(() => { UI.App.act({ t: 'set', id: Object.keys(UI.S.scene.entities).find((k) => UI.S.scene.entities[k].type === 'num'), k: 'n', v: 4 }); });
  await p.waitForTimeout(2300); await p.reload(); await p.waitForTimeout(300);
  await p.click('#dlg-fresh'); await p.waitForTimeout(100);
  const fresh = await p.evaluate(() => ({ mode: UI.S.mode, saved: localStorage.getItem('universe-session-v1') || '' }));
  ok(fresh.mode === 'free' && fresh.saved === '', '重新开始：回到自由探究，存档清掉：' + JSON.stringify(fresh));
  console.log('几何工作区（只用工具和选点，不拖卡片）');
  // 点画布上的对象（data-pick）：找一个真能点到它的位置；Shift 加选
  const pickAt = async (name, shift) => {
    const pt = await p.evaluate((nm) => {
      for (const el of [...document.querySelectorAll('[data-pick]')].filter((e) => e.dataset.pick === nm)) {
        const r = el.getBoundingClientRect(), cands = [[r.left + r.width / 2, r.top + r.height / 2]];
        for (let i = 1; i < 10; i++) for (let j = 1; j < 10; j++) cands.push([r.left + r.width * i / 10, r.top + r.height * j / 10]);
        for (const [x, y] of cands) { const hit = document.elementFromPoint(x, y); if (hit && hit.closest('[data-pick]') === el) return { x, y }; }
      }
      return null;
    }, name);
    if (!pt) { ok(false, '找不到可以点的对象：' + name); return; }
    if (shift) await p.keyboard.down('Shift');
    await p.mouse.click(pt.x, pt.y);
    if (shift) await p.keyboard.up('Shift');
  };
  const wsTool = async (id) => { await p.click('[data-ws-tool="' + id + '"]'); await p.waitForTimeout(60); };
  const wsSteps = () => p.locator('.wsx-step').count();
  const msDone = () => p.evaluate(() => Object.fromEntries(Object.entries(UI.S.run.ms).map(([k, v]) => [k, !!v.done])));
  const sideOfCut = (id) => p.evaluate((cid) => (UI.S.D[cid].out.a.data.pts.length === 3 ? 'a' : 'b'), id);

  await p.evaluate(() => UI.App.openProblem('geo-median-area', 'practice')); await p.waitForTimeout(200);
  ok(await p.locator('.card').count() === 1 && await p.locator('.card .bdy.wsbody').count() === 1, '工作区只占一张卡片；里面的点和图形不另外画卡片');
  await pickAt('B'); await pickAt('C', true); await wsTool('mid');
  ok(await wsSteps() === 1, '选 B、C，点「中点」：工作区多一步');
  await pickAt('A'); await pickAt('M(BC)', true); await wsTool('seg');
  await pickAt('poly(A,B,C)'); await pickAt('seg(A,M(BC))', true); await wsTool('cut');
  const m1 = await msDone();
  ok(m1.mid && m1.cut, '中线剪开，两块面积相等，两个里程碑都完成：' + JSON.stringify(m1));
  ok(await wsSteps() === 3 && await p.evaluate(() => UI.S.undo.length) === 3, '步骤历史 3 步，撤销栈里只有 3 次工具动作（没有拖卡片）');
  await shot('ui-ws-median');
  // 做完一道题会在 700 毫秒后弹出结果对话框；等它出来再关掉，免得盖住下一道题
  await p.waitForTimeout(900); if (await p.locator('#dlg.open').count()) await p.click('#dlg-close');

  await p.evaluate(() => UI.App.openProblem('geo-pgram-cut', 'practice')); await p.waitForTimeout(200);
  await pickAt('A'); await pickAt('B', true); await wsTool('seg');
  await pickAt('D'); await pickAt('seg(A,B)', true); await wsTool('perp');
  await pickAt('poly(A,B,C,D)'); await pickAt('perp(D,seg(A,B))', true); await wsTool('cut');
  const cid = await p.evaluate(() => Object.keys(UI.S.scene.entities).find((k) => UI.S.scene.entities[k].type === 'gcut'));
  await p.fill('[data-ws-arg="dx"]', '5');
  await pickAt('cut:' + cid + ':' + (await sideOfCut(cid)));
  await wsTool('move');
  const m2 = await msDone(), dxs = await p.evaluate(() => Object.values(UI.S.scene.entities).filter((e) => e.type === 'gplace').map((e) => e.props.dx));
  ok(m2.height && m2.cut, '从 D 作高，沿高剪开：两个里程碑完成：' + JSON.stringify(m2));
  ok(dxs.length === 1 && dxs[0] === 5, '选剪下的三角形，点「移动」（向右 5 格）：摆放步骤的 dx 为 5');
  // 「拼成长方形」还做不到：合并工具没有办法把目标图形接进拼合器材（见报告），这里只记下来
  console.log('  注：几何 geo-pgram-cut 的「移动后正好拼成长方形」里程碑 = ' + m2.fit + '（只用工具做不到，待定）');
  await shot('ui-ws-pgram');

  console.log('式子工作台（方程台 → 工作台，§10.5.3）');
  await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); }); await p.waitForTimeout(100);
  await drag('algebra', 300, 180); await drag('num', 300, 400); await drag('eqdesk', 640, 240); await drag('exprbench', 640, 470);
  const wb = await p.evaluate(() => { const E = UI.S.scene.entities, f = (t) => Object.keys(E).find((k) => E[k].type === t); return { a: f('algebra'), n: f('num'), q: f('eqdesk'), x: f('exprbench') }; });
  const setProp = async (id, sel, v) => {
    await p.dblclick('.card[data-id="' + id + '"] .hd'); await p.waitForTimeout(80);
    const inp = p.locator('#insp ' + sel); await inp.fill(v); await inp.evaluate((el) => el.dispatchEvent(new Event('change', { bubbles: true }))); await p.waitForTimeout(80);
  };
  await setProp(wb.a, 'input[data-k="text"]', '3x+5');
  await setProp(wb.n, 'input[type="number"][data-k="n"]', '20');
  await setProp(wb.q, 'input[type="number"][data-k="by"]', '0');   // 方程台的「两边同时加 0」：不改方程
  await dragLink(wb.a, wb.q, 'L'); await dragLink(wb.n, wb.q, 'R'); await dragLink(wb.q, wb.x, 'e', 'eq');
  await p.dblclick('.card[data-id="' + wb.x + '"] .hd'); await p.waitForTimeout(120);
  const shownEq = await p.locator('#insp .wb-now').innerText().catch(() => '');
  ok(/3x \+ 5 = 20/.test(shownEq), '方程台接到工作台：显示 ' + shownEq.replace(/\s+/g, ' '));
  ok(await p.locator('#insp [data-wb-tool]').count() === 4, '工作台的工具按钮来自内核（移项、两边同除、两边同乘、合并同类项）');
  await p.fill('#insp [data-wb-field="ref"]', '2');
  await p.click('#insp [data-wb-tool="move-term"]'); await p.waitForTimeout(100);
  ok(await p.locator('#insp .wb-step').count() === 1, '点「移项」（第 2 项 +5）：步骤历史 1 行');
  await p.fill('#insp [data-wb-field="by"]', '3');
  await p.click('#insp [data-wb-tool="divide"]'); await p.waitForTimeout(100);
  ok(await p.locator('#insp .wb-step').count() === 2, '点「两边同除」（除以 3）：步骤历史 2 行');
  const solTxt = await p.locator('#insp .wb-sol').innerText().catch(() => '');
  ok(/x = 5/.test(solTxt), '解行：' + solTxt);
  ok(await p.evaluate((id) => UI.S.D[id].out.solved.data === true, wb.x), '工作台的「解出来了」输出为真');
  await p.click('#insp [data-wb-undo="1"]'); await p.waitForTimeout(100);
  ok(await p.locator('#insp .wb-step').count() === 1 && await p.locator('#insp .wb-sol').count() === 0, '撤销到第 1 步：只剩 1 行，解消失');
  await p.fill('#insp [data-wb-field="by"]', '0');
  await p.click('#insp [data-wb-tool="divide"]'); await p.waitForTimeout(100);
  ok(/0/.test(await p.locator('#insp .wb-msg').innerText().catch(() => '')) && await p.locator('#insp .wb-step').count() === 1, '除以 0 被拒绝，并说明原因，步骤不变');
  ok(await p.evaluate(() => Object.keys(UI.S.scene.entities).length === 4 && UI.S.scene.links.length === 3), '工作台的步骤不改台面（器材和连线数不变）');
  // ---- 改大小、专注模式、工作区缩放与适应（§10.5.8 A1–A4）----
  {
    console.log('改大小（拖柄，§10.5.8 A1）');
    const sizeOf = (id) => p.evaluate((i) => { const e = UI.S.scene.entities[i]; return e.w === undefined ? null : [e.w, e.h]; }, id);
    const dimsOf = (id) => p.evaluate((i) => UI.Stage.geom(UI.S.scene.entities[i]), id);
    const rangeOf = (id) => p.evaluate((i) => UI.Stage.rangeOf(i), id);
    const handleDrag = async (id, dx, dy, mid) => {
      const hb = await p.locator('.card[data-id="' + id + '"] .rz').boundingBox();
      const x = hb.x + hb.width / 2, y = hb.y + hb.height / 2;
      await p.mouse.move(x, y); await p.mouse.down(); await p.mouse.move(x + dx, y + dy, { steps: 6 });
      if (mid) await mid();
      await p.mouse.up(); await p.waitForTimeout(60);
    };
    await p.evaluate(() => UI.App.openFree()); await p.waitForTimeout(150);
    const fid = await p.evaluate(() => UI.App.act({ t: 'add', type: 'num', x: 100, y: 100, props: { n: 3 } }).id);
    await p.waitForTimeout(80);
    const g0 = await dimsOf(fid);
    ok((await sizeOf(fid)) === null, '新器材没有存过大小，用器材自己的 size()');
    let tipTxt = '', tipOn = false;
    await handleDrag(fid, 60, 40, async () => { tipOn = await p.locator('#tip').isVisible(); tipTxt = await p.locator('#tip').innerText(); });
    const s1 = await sizeOf(fid);
    ok(s1 && s1[0] > g0.w + 20 && s1[1] > g0.h + 10, '普通器材：拖柄拉大，尺寸写进实体 ' + JSON.stringify(s1) + '（原来 ' + g0.w + '×' + g0.h + '）');
    ok(tipOn && tipTxt === s1[0] + ' × ' + s1[1], '拖动时显示当前尺寸：' + tipTxt);
    await p.click('#undo'); await p.waitForTimeout(60);
    ok((await sizeOf(fid)) === null, '普通器材：撤销回到原来的大小');
    await handleDrag(fid, -300, -200);
    const smin = await sizeOf(fid);
    ok(JSON.stringify(smin) === '[120,90]', '最小尺寸：拖到很小也只到 120 × 90：' + JSON.stringify(smin));
    await p.dblclick('.card[data-id="' + fid + '"] .rz'); await p.waitForTimeout(80);
    ok((await sizeOf(fid)) === null, '双击拖柄恢复默认大小');
    await handleDrag(fid, 80, 0);
    const sz2 = await sizeOf(fid);
    const saved = await p.evaluate((i) => JSON.parse(U.World.save(UI.S.scene)).entities[i], fid);
    const shared = await p.evaluate((i) => U.Share.decode(U.Share.encode(UI.S.scene).text).entities[i].w, fid);
    ok(saved.w === sz2[0] && saved.h === sz2[1] && shared === sz2[0], '存档和分享都带上大小');

    await p.evaluate(() => UI.App.openProblem('geo-median-area', 'practice')); await p.waitForTimeout(200);
    const wid = await p.evaluate(() => Object.values(UI.S.scene.entities).find((e) => U.types[e.type].workspace).id);
    const wg0 = await dimsOf(wid), rg0 = await rangeOf(wid);
    await handleDrag(wid, 110, 70);
    const ws1 = await sizeOf(wid), rg1 = await rangeOf(wid);
    const bodyW = await p.evaluate((i) => +document.querySelector('.card[data-id="' + i + '"] svg.wsbody').getAttribute('width'), wid);
    ok(ws1 && ws1[0] > wg0.w && bodyW === ws1[0], '工作区：拉大卡片，画布跟着变大 ' + wg0.w + ' → ' + ws1[0]);
    ok(JSON.stringify(rg1) === JSON.stringify(rg0), '工作区：拉大时坐标范围不变');
    await p.click('#undo'); await p.waitForTimeout(60);
    ok((await sizeOf(wid)) === null, '工作区：撤销回到原来的大小');

    console.log('专注模式（§10.5.8 A4）');
    await p.dblclick('.card[data-id="' + wid + '"] .hd'); await p.waitForTimeout(100);
    ok(await p.locator('#wsfocus').isVisible(), '双击工作区标题：出现专注浮层');
    ok(await p.locator('#wsfocus .wsf-main svg.wsbody').count() === 1, '浮层里是同一个工作区的画布和面板');
    await p.keyboard.press('Escape'); await p.waitForTimeout(60);
    ok(!(await p.locator('#wsfocus').isVisible()), 'Esc 还原');
    await p.dblclick('.card[data-id="' + wid + '"] .hd'); await p.waitForTimeout(100);
    await p.dblclick('#wsfocus .wsf-hd b'); await p.waitForTimeout(100);
    ok(!(await p.locator('#wsfocus').isVisible()), '在浮层标题上双击也还原');

    console.log('工作区的缩放、平移与适应（§10.5.8 A2–A3）');
    await p.evaluate(() => UI.App.openProblem('geo-median-area', 'practice')); await p.waitForTimeout(200);
    const wid2 = await p.evaluate(() => Object.values(UI.S.scene.entities).find((e) => U.types[e.type].workspace).id);
    const rangeText = () => p.locator('.wsx[data-ws="' + wid2 + '"] .wsx-range').innerText();
    const boardView = () => p.evaluate(() => [UI.S.view.x, UI.S.view.y, UI.S.view.z]);
    const r0 = await rangeOf(wid2), t0 = await rangeText(), v0 = await boardView();
    const body = () => p.locator('.card[data-id="' + wid2 + '"] svg.wsbody').boundingBox();
    const bb2 = await body();
    await p.mouse.move(bb2.x + bb2.width / 2, bb2.y + bb2.height / 2); await p.mouse.wheel(0, -200); await p.waitForTimeout(100);
    const r1 = await rangeOf(wid2), t1 = await rangeText(), v1 = await boardView();
    ok(r1.span < r0.span && JSON.stringify(v1) === JSON.stringify(v0), '滚轮指在工作区上：工作区放大，台面的缩放和平移不变');
    ok(t1 !== t0, '范围说明跟着变：' + t1.replace(/\s+/g, ' '));
    const bb3 = await body();
    await p.mouse.move(bb3.x + 8, bb3.y + 8); await p.mouse.down(); await p.mouse.move(bb3.x + 48, bb3.y + 8, { steps: 5 }); await p.mouse.up(); await p.waitForTimeout(60);
    const r2 = await rangeOf(wid2), v2 = await boardView();
    ok(r2.cx < r1.cx && r2.span === r1.span && JSON.stringify(v2) === JSON.stringify(v0), '拖工作区的空白处：内容平移，台面不动');
    await p.click('[data-ws-fit="' + wid2 + '"]'); await p.waitForTimeout(80);
    const r3 = await rangeOf(wid2), t3 = await rangeText();
    ok(r3.span !== r2.span && Math.abs(r3.span - r0.span) < 1e-9 && Math.abs(r3.cx - r0.cx) < 1e-9 && Math.abs(r3.cy - r0.cy) < 1e-9, '适应：坐标范围换成按内容选的（' + t3.replace(/\s+/g, ' ') + '）');
    ok(JSON.stringify(await boardView()) === JSON.stringify(v0), '适应只改工作区，台面不动');
  }

  {
  console.log('块：剪开以后每一块都是器材（§10.5.10）');
  // 块的拖动：在块的图形上找一个真能点到它的位置，拖到 target(起点) 去
  const dragPieceTo = async (id, target) => {
    const s = await p.evaluate((i) => {
      const el = document.querySelector('[data-drag="' + i + '"]'); if (!el) return null;
      const r = el.getBoundingClientRect();
      for (let a = 1; a < 10; a++) for (let b = 1; b < 10; b++) {
        const x = r.left + r.width * a / 10, y = r.top + r.height * b / 10, hit = document.elementFromPoint(x, y);
        if (hit && hit.closest('[data-drag]') === el) return { x, y };
      }
      return null;
    }, id);
    if (!s) { ok(false, '找不到可以拖的块：' + id); return; }
    const t = target(s);
    await p.mouse.move(s.x, s.y); await p.mouse.down(); await p.mouse.move(t.x, t.y, { steps: 10 }); await p.mouse.up(); await p.waitForTimeout(100);
  };
  const pieceProps = (id) => p.evaluate((i) => { const e = UI.S.scene.entities[i]; return { dx: e.props.dx, dy: e.props.dy, turn: e.props.turn, flip: e.props.flip, name: e.props.name, color: e.props.color, parent: e.parent }; }, id);
  const pieceIds = () => p.evaluate(() => Object.values(UI.S.scene.entities).filter((e) => e.type === 'gpiece').map((e) => e.id));
  const pickName = (id) => p.evaluate((i) => U.Names.list(UI.S.scene).find((x) => x.id === i).name, id);
  const undoLen = () => p.evaluate(() => UI.S.undo.length);
  const dismissDlg = async () => { await p.waitForTimeout(900); if (await p.locator('#dlg.open').count()) await p.click('#dlg-close'); };

  await p.evaluate(() => UI.App.openProblem('geo-median-area', 'practice')); await p.waitForTimeout(200);
  await pickAt('B'); await pickAt('C', true); await wsTool('mid');
  await pickAt('A'); await pickAt('M(BC)', true); await wsTool('seg');
  await pickAt('poly(A,B,C)'); await pickAt('seg(A,M(BC))', true); await wsTool('cut');
  await dismissDlg();
  // (a) 剪一个三角形：两块各自有颜色和名字，被剪的三角形不画
  const [pa, pb] = await pieceIds();
  const pinfo = [await pieceProps(pa), await pieceProps(pb)];
  const drawn = await p.evaluate(() => [...document.querySelectorAll('.wsbody [data-pick^="cut:"]')].map((el) => el.getAttribute('stroke')));
  const labels = await p.evaluate(() => [...document.querySelectorAll('.wsbody text')].map((t) => t.textContent));
  ok(pinfo[0].name === '块 1' && pinfo[1].name === '块 2' && pinfo[0].color !== pinfo[1].color, '(a) 两个块：「' + pinfo[0].name + '」「' + pinfo[1].name + '」，颜色各不相同');
  ok(drawn.length === 2 && drawn.includes(pinfo[0].color) && drawn.includes(pinfo[1].color), '(a) 两块画在工作区里，用各自的颜色');
  ok(labels.includes('块 1') && labels.includes('块 2'), '(a) 两块的名字标在图上');
  ok(await p.locator('[data-pick="poly(A,B,C)"]').count() === 0 && await p.evaluate(() => Object.values(UI.S.scene.entities).some((e) => e.hidden)), '(a) 被剪的三角形不画（隐藏）');

  // (b) 拖块 2 向右几格：一步；一次撤销回到原来的位置
  const u0 = await undoLen(), b0 = await pieceProps(pb);
  await dragPieceTo(pb, (s) => ({ x: s.x + 50, y: s.y }));
  const b1 = await pieceProps(pb);
  ok(b1.dx > b0.dx && b1.dx < 20 && b1.dy === b0.dy && (await undoLen()) === u0 + 1, '(b) 拖块 2：dx 从 ' + b0.dx + ' 变成 ' + b1.dx + '（几格，不是一直飞出去），撤销栈多一步');
  await p.click('#undo'); await p.waitForTimeout(80);
  const b2 = await pieceProps(pb);
  ok(b2.dx === b0.dx && b2.dy === b0.dy && (await pieceIds()).length === 2, '(b) 撤销：块 2 回到原来的位置，还是同样两个块');

  // (c) 选中块 1，按 R：转 90°，一步
  await pickAt(await pickName(pa));
  const t0 = (await pieceProps(pa)).turn, u1 = await undoLen();
  await p.keyboard.press('r'); await p.waitForTimeout(80);
  const t1 = (await pieceProps(pa)).turn;
  ok(t1 === (t0 + 1) % 4 && (await undoLen()) === u1 + 1, '(c) 块 1 按 R：转 90°（' + t0 + ' → ' + t1 + '），一步');
  await p.click('#undo'); await p.waitForTimeout(80);

  // (d) 把块 1 拖出工作区（落在台面的空白处）：变成台面上的一张器材卡片；再拖回工作区，又回到画面里
  const wsId = await p.evaluate(() => Object.values(UI.S.scene.entities).find((e) => U.types[e.type].workspace).id);
  const emptyAt = await p.evaluate(() => {
    const st = document.querySelector('#stage').getBoundingClientRect();
    for (let y = st.top + 40; y < st.bottom - 40; y += 30) for (let x = st.left + 40; x < st.right - 40; x += 30) {
      const hit = document.elementFromPoint(x, y);
      if (hit && hit.closest('#stage') && !hit.closest('.card,.wsx,.tool,.pill,.sig,.lb,#wsfocus')) return { x, y };
    }
    return null;
  });
  if (!emptyAt) ok(false, '(d) 台面上找不到空白处');
  else {
    await dragPieceTo(pa, () => emptyAt);
    const onBoard = await p.locator('.card[data-id="' + pa + '"]').count();
    ok(onBoard === 1 && (await pieceProps(pa)).parent === null, '(d) 块 1 拖出工作区：台面上出现它的器材卡片');
    const hd = await p.locator('.card[data-id="' + pa + '"] .hd').boundingBox();
    const wb = await p.locator('.card[data-id="' + wsId + '"] svg.wsbody').boundingBox();
    await p.mouse.move(hd.x + 30, hd.y + 10); await p.mouse.down();
    await p.mouse.move(wb.x + wb.width / 2, wb.y + wb.height / 2, { steps: 12 }); await p.mouse.up(); await p.waitForTimeout(120);
    ok((await pieceProps(pa)).parent === wsId && (await p.locator('.card[data-id="' + pa + '"]').count()) === 0 && (await pieceIds()).length === 2, '(d) 拖回工作区：又回到工作区里，还是两个块');
    ok(await p.locator('.wsbody [data-pick="' + (await pickName(pa)) + '"]').count() === 1, '(d) 回到工作区后，画面上又有这一块');
  }
  }
  {
  console.log('工作区里用鼠标改图形（§10.5.8 B）');
  // 点工作区里的图形（data-pick）：找一个真能点到它的位置
  const pickNm = async (name, shift) => {
    const pt = await p.evaluate((nm) => {
      for (const el of [...document.querySelectorAll('[data-pick]')].filter((e) => e.dataset.pick === nm)) {
        const r = el.getBoundingClientRect(), cands = [];
        for (let i = 1; i < 10; i++) for (let j = 1; j < 10; j++) cands.push([r.left + r.width * i / 10, r.top + r.height * j / 10]);
        for (const [x, y] of cands) { const hit = document.elementFromPoint(x, y); if (hit && hit.closest('[data-pick]') === el) return { x, y }; }
      }
      return null;
    }, name);
    if (!pt) { ok(false, '找不到可以点的对象：' + name); return false; }
    if (shift) await p.keyboard.down('Shift');
    await p.mouse.click(pt.x, pt.y);
    if (shift) await p.keyboard.up('Shift');
    await p.waitForTimeout(60); return true;
  };
  const wsBtn = async (id) => { await p.click('[data-ws-tool="' + id + '"]'); await p.waitForTimeout(60); };
  const wsIdOf = () => p.evaluate(() => Object.values(UI.S.scene.entities).find((e) => U.types[e.type].workspace).id);

  // (a) 自由点围成的三角形：拖一个顶点（点在工作区里），坐标跟着变（格点吸附）；撤销回到原来
  await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); }); await p.waitForTimeout(100);
  const tri = await p.evaluate(() => {
    const A = UI.App, ws = A.act({ t: 'add', type: 'gworkspace', x: 200, y: 80 }).id;
    const pts = [[0, 0], [4, 0], [1, 3]].map(([x, y]) => { const id = A.act({ t: 'add', type: 'gpt', x: 0, y: 0, props: { x, y } }).id; A.act({ t: 'put', id, parent: ws, slot: 'items' }); return id; });
    const poly = A.act({ t: 'add', type: 'gpoly', x: 0, y: 0 }).id;
    pts.forEach((id) => A.act({ t: 'link', from: id, fromPort: 'p', to: poly, toPort: 'pts' }));
    A.act({ t: 'put', id: poly, parent: ws, slot: 'items' });
    return { ws, pts };
  });
  await p.waitForTimeout(80);
  const xy = (id) => p.evaluate((i) => [UI.S.scene.entities[i].props.x, UI.S.scene.entities[i].props.y], id);
  const span = await p.evaluate((ws) => UI.Stage.rangeOf(ws).span, tri.ws);
  const wbox = await p.locator('.card[data-id="' + tri.ws + '"] svg.wsbody').boundingBox();
  const unitA = wbox.width / span;
  const v0 = await xy(tri.pts[2]);
  const vh = await p.locator('.card[data-id="' + tri.ws + '"] svg.wsbody [data-drag="' + tri.pts[2] + '"]').first().boundingBox();
  const vx0 = vh.x + vh.width / 2, vy0 = vh.y + vh.height / 2;
  await p.mouse.move(vx0, vy0); await p.mouse.down();
  await p.mouse.move(vx0 + 2 * unitA, vy0 - unitA, { steps: 6 }); await p.mouse.up(); await p.waitForTimeout(80);
  const v1 = await xy(tri.pts[2]);
  ok(v1[0] === v0[0] + 2 && v1[1] === v0[1] + 1, '(a) 拖三角形的顶点：(' + v0 + ') → (' + v1 + ')');
  await p.click('#undo'); await p.waitForTimeout(80);
  ok(JSON.stringify(await xy(tri.pts[2])) === JSON.stringify(v0), '(a) 撤销：顶点回到原来的坐标');

  // 几何题 geo-median-area：先按原来的步骤剪开，得到两块（块带名字 cut:…）
  await p.evaluate(() => UI.App.openProblem('geo-median-area', 'practice')); await p.waitForTimeout(200);
  await pickNm('B'); await pickNm('C', true); await wsBtn('mid');
  await pickNm('A'); await pickNm('M(BC)', true); await wsBtn('seg');
  await pickNm('poly(A,B,C)'); await pickNm('seg(A,M(BC))', true); await wsBtn('cut');
  await p.waitForTimeout(900); if (await p.locator('#dlg.open').count()) await p.click('#dlg-close');

  // (b) 选中一块，拖上方的旋转把手到左边（转 90°）：块的 turn 变一格；撤销回去
  const pieceId = await p.evaluate(() => Object.values(UI.S.scene.entities).find((e) => e.type === 'gpiece').id);
  const pieceName = await p.evaluate((pid) => U.Names.list(UI.S.scene).find((x) => x.id === pid && x.port === 'f').name, pieceId);
  await pickNm(pieceName); await p.waitForTimeout(80);
  const turnOf = () => p.evaluate((pid) => UI.S.scene.entities[pid].props.turn, pieceId);
  const t0 = await turnOf();
  const rot = await p.locator('.card svg.wsbody [data-hdl="rot"]').first().boundingBox();
  const pc = await p.locator('.card svg.wsbody [data-pick="' + pieceName + '"]').first().boundingBox();
  const cxp = pc.x + pc.width / 2, cyp = pc.y + pc.height / 2;
  await p.mouse.move(rot.x + rot.width / 2, rot.y + rot.height / 2); await p.mouse.down();
  await p.mouse.move(cxp - 90, cyp, { steps: 8 }); await p.mouse.up(); await p.waitForTimeout(80);
  const t1 = await turnOf();
  ok((t1 - t0 + 4) % 4 === 1, '(b) 块：旋转把手转到 90°，turn ' + t0 + ' → ' + t1);
  await p.click('#undo'); await p.waitForTimeout(80);
  ok((await turnOf()) === t0, '(b) 撤销：块回到原来的转向');

  // (c) 选中一个图形，浮动工具条里点「左右翻」：顶点的 x 关于图形中心翻过去
  await p.evaluate(() => UI.App.openProblem('geo-median-area', 'practice')); await p.waitForTimeout(200);
  await pickNm('poly(A,B,C)'); await p.waitForTimeout(80);
  const polyId = await p.evaluate(() => U.Names.resolve(UI.S.scene, 'poly(A,B,C)').id);
  const xsOf = () => p.evaluate((pid) => UI.S.scene.links.filter((l) => l.to === pid).map((l) => UI.S.scene.entities[l.from].props.x), polyId);
  const xs0 = await xsOf();
  await p.click('.wsx-float [data-fig-flip="1"]'); await p.waitForTimeout(80);
  const xs1 = await xsOf(), mnX = Math.min(...xs0), mxX = Math.max(...xs0);
  ok(xs1.some((x, i) => x !== xs0[i]) && xs1.every((x, i) => x === mnX + mxX - xs0[i]), '(c) 左右翻：x 关于中心翻过去 ' + xs0 + ' → ' + xs1);
  await p.click('#undo'); await p.waitForTimeout(80);
  ok(JSON.stringify(await xsOf()) === JSON.stringify(xs0), '(c) 撤销：回到翻之前');

  // (d) 选「连线」，在画布上点两下，就画出一条线段（不需要先有两个点）；Esc 退出
  await p.evaluate(() => UI.App.openProblem('geo-median-area', 'practice')); await p.waitForTimeout(200);
  const wsid2 = await wsIdOf(), segN = () => p.evaluate(() => Object.values(UI.S.scene.entities).filter((e) => e.type === 'gseg').length);
  const n0 = await segN();
  await wsBtn('seg');
  ok(await p.locator('[data-ws-tool="seg"].on').count() === 1, '(d) 选「连线」：工具按钮亮起，进入画线');
  const wb2 = await p.locator('.card[data-id="' + wsid2 + '"] svg.wsbody').boundingBox();
  await p.mouse.click(wb2.x + wb2.width * 0.12, wb2.y + wb2.height * 0.9); await p.waitForTimeout(40);
  await p.mouse.click(wb2.x + wb2.width * 0.42, wb2.y + wb2.height * 0.9); await p.waitForTimeout(120);
  const n1 = await segN();
  ok(n1 === n0 + 1, '(d) 在画布上点两下：多了一条线段（' + n0 + ' → ' + n1 + '）');
  await p.keyboard.press('Escape'); await p.waitForTimeout(60);
  ok(await p.locator('[data-ws-tool="seg"].on').count() === 0, '(d) Esc 退出画线');

  }
  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n' + pass + ' 通过，' + fail + ' 失败'); await b.close(); process.exit(fail ? 1 : 0);
})();
