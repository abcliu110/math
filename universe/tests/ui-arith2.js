/* node tests/ui-arith2.js —— 算术工作台遗留（H4）：凑整、两位数乘两位数、减法允许负数结果，真实鼠标。
 * (a) 凑整（自由台面，47 + 38）：点选 47，点「凑整」得到 47 + 3 + 35，步骤写一步「凑整」；竖式算到 85；
 *     没点选时提示先点选；整十数（40 + 38）和另一个数不够凑（47 + 2）被拒绝并说明，不记步骤；
 * (b) 两位数乘两位数（自由台面，23 × 14）：只出现「算个位的部分积」，点了十位的按钮会提示先算个位；
 *     点「算个位的部分积」得 92，「算十位的部分积」得 230（向左移一位），「相加」得 322；每一步记在历史里；
 *     相加以后不能再算部分积；撤销到第 2 步，结果消失，重做到 322；三位数的乘数（23 × 123）说明原因；
 * (c) 负数结果（自由台面，23 − 47）：不再报错，竖式把 47 写在上面；个位 7 − 3 = 4，十位 4 − 2 = 2；
 *     结果显示 −24（负号）；页面没有错误。
 * 需要 playwright（NODE_PATH 指向它的 node_modules）。 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const url = 'file://' + path.join(__dirname, '..', 'index.html');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();

(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1440, height: 860 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(url); await p.waitForTimeout(300);

  const cellText = async (name) => norm(await p.locator('#insp [data-ar-cell="' + name + '"]').innerText().catch(() => ''));
  const btn = (sel) => p.locator('#insp ' + sel);
  const now = () => p.locator('#insp .wb-now').innerText().then((s) => norm(s.replace('现在：', ''))).catch(() => '');
  const records = () => p.evaluate(() => { const wb = UI.S.scene.workbench; return wb ? wb.steps.map((s) => s.rule) : []; });
  const msg = () => p.locator('#insp .wb-msg').innerText().catch(() => '');
  const sol = () => p.locator('#insp .wb-sol').innerText().then((s) => norm(s.replace(/^结果：/, ''))).catch(() => '');
  const logText = () => p.locator('#insp .wb-step').allInnerTexts().catch(() => []);
  const query = (c) => p.evaluate((c) => U.Judge.compile(c)(U.Judge.makeW(UI.S.scene, UI.S.D, {})), c);
  const openCard = async (id) => { await p.dblclick('.card[data-id="' + id + '"] .hd'); await p.waitForTimeout(150); };
  // 点选一个数（只点没有选中的：同一个 id 的台面可能留着上一次的选择）
  const pickTerm = async (k) => { if ((await btn('[data-ar-term="' + k + '"]').getAttribute('aria-pressed')) !== 'true') await btn('[data-ar-term="' + k + '"]').click(); await p.waitForTimeout(60); };
  const freeBench = (props) => p.evaluate((props) => {
    UI.App.openFree(); UI.App.act({ t: 'clear' });
    return UI.App.act({ t: 'add', type: 'arithbench', x: 300, y: 200, props }).id;
  }, props);

  console.log('算术工作台遗留（H4）：凑整、两位数乘两位数、负数结果，真实鼠标');

  // (a) 凑整：点选 47，点「凑整」→ 47 + 3 + 35；竖式算到 85
  const ca = await freeBench({ a: 47, b: 38, op: 0 });
  await openCard(ca);
  ok(/^47 \+ 38$/.test(await now()), '自由台面的竖式：47 + 38');
  await btn('[data-ar-tool="round"]').click(); await p.waitForTimeout(100);
  ok(/点选|先/.test(await msg()), '没点选要凑整的数：提示先点选');
  ok((await records()).length === 0, '没有点选，不记步骤');
  await pickTerm(0);
  await btn('[data-ar-tool="round"]').click(); await p.waitForTimeout(120);
  ok(/^47 \+ 3 \+ 35$/.test(await now()), '点选 47，凑整：47 + 3 + 35（' + (await now()) + '）');
  ok((await records()).join() === 'arith.round', '台面上 1 步：凑整');
  ok(/凑整：47 \+ 38 = 47 \+ 3 \+ 35/.test((await logText()).join('\n')), '步骤写着：凑整：47 + 38 = 47 + 3 + 35');
  await btn('[data-ar-col="0"]').click(); await p.waitForTimeout(60);
  ok((await cellText('ans-0')) === '5' && (await cellText('carry-1')) === '1', '个位 7 + 3 + 5 = 15，写 5 进 1');
  await btn('[data-ar-col="1"]').click(); await p.waitForTimeout(60);
  ok((await sol()) === '85', '结果：85（' + (await sol()) + '）');
  ok((await records()).join() === 'arith.round,arith.column,arith.column', '台面上 3 步：凑整、两列');
  ok(await query({ steps: { used: 'arith.round', allKept: true } }), 'steps 查询：用过凑整，每步保持了不变量 → 真');

  // (a 续) 整十数 40 + 38 不用凑；47 + 2 另一个数不够凑：都拒绝并说明，不记步骤
  const cz = await freeBench({ a: 40, b: 38, op: 0 });
  await openCard(cz);
  await pickTerm(0);
  await btn('[data-ar-tool="round"]').click(); await p.waitForTimeout(100);
  ok(/整十/.test(await msg()), '40 是整十数：凑整被拒绝，提示说明（' + (await msg()) + '）');
  ok((await records()).length === 0, '被拒绝的凑整不记步骤');
  const cy = await freeBench({ a: 47, b: 2, op: 0 });
  await openCard(cy);
  await pickTerm(0);
  await btn('[data-ar-tool="round"]').click(); await p.waitForTimeout(100);
  ok(/不够凑/.test(await msg()), '47 + 2：另一个数 2 不够凑 3，被拒绝并说明（' + (await msg()) + '）');
  ok((await records()).length === 0, '47 + 2 的凑整不记步骤');

  // (b) 两位数乘两位数：23 × 14，部分积 92、230，相加 322
  const cm = await freeBench({ a: 23, b: 14, op: 2 });
  await openCard(cm);
  ok(/^23 × 14$/.test(await now()), '自由台面：23 × 14（' + (await now()) + '）');
  ok((await btn('[data-ar-col="0"]').count()) === 0, '两位数乘两位数不用一列一列算（没有「算个位」按钮）');
  ok((await btn('[data-ar-part="1"]').count()) === 0, '还没算个位的部分积，十位的按钮不出现');
  await btn('[data-ar-part="0"]').click(); await p.waitForTimeout(120);
  ok((await cellText('pp-0-0')) === '2' && (await cellText('pp-0-1')) === '9', '个位的部分积：23 × 4 = 92，竖式里写着 92');
  ok(/个位：23 × 4 = 92/.test((await logText()).join('\n')), '步骤写着：个位：23 × 4 = 92');
  await btn('[data-ar-part="1"]').click(); await p.waitForTimeout(120);
  ok((await cellText('pp-1-2')) === '2' && (await cellText('pp-1-1')) === '3', '十位的部分积：23 × 1 = 23，向左移一位，得 230');
  ok(/十位：23 × 1 = 23，向左移一位，得 230/.test((await logText()).join('\n')), '步骤写着十位的移位');
  await btn('[data-ar-tool="sum"]').click(); await p.waitForTimeout(120);
  ok((await sol()) === '322', '相加：92 + 230 = 322（' + (await sol()) + '）');
  ok((await records()).join() === 'arith.partial,arith.partial,arith.sum-partial', '台面上 3 步：两个部分积、相加');
  ok((await cellText('ans-2')) === '3' && (await cellText('ans-0')) === '2', '竖式最下面一行写着 322');
  ok(await query({ steps: { used: 'arith.partial', allKept: true } }), 'steps 查询：用过部分积，每步保持了不变量 → 真');
  await p.evaluate(() => UI.Panels.closeDialog()).catch(() => {});
  await btn('[data-ar-undo="2"]').click(); await p.waitForTimeout(120);
  ok(!(await sol()) && (await records()).length === 2, '撤销到第 2 步：结果消失，台面上剩 2 步');
  await btn('[data-ar-tool="sum"]').click(); await p.waitForTimeout(120);
  ok((await sol()) === '322', '重做相加：又得到 322');

  // (b 续) 相加要等部分积算完；三位数的乘数被拒绝并说明
  const cn2 = await freeBench({ a: 23, b: 14, op: 2 });
  await openCard(cn2);
  await btn('[data-ar-part="0"]').click(); await p.waitForTimeout(60);
  await btn('[data-ar-undo="1"]').click(); await p.waitForTimeout(60);
  const cbig = await freeBench({ a: 23, b: 123, op: 2 });
  await openCard(cbig);
  ok(/两位数乘两位数|一位数/.test(await p.locator('#insp .wb-msg').innerText().catch(() => '')), '乘数 123 是三位数：提示竖式这里只做到两位数（' + (await p.locator('#insp .wb-msg').innerText().catch(() => '')) + '）');

  // (c) 负数结果：23 − 47，大数写在上面，结果 −24
  const cneg = await freeBench({ a: 23, b: 47, op: 1 });
  await openCard(cneg);
  ok(/^23 − 47$/.test(await now()), '自由台面：23 − 47，不再报错（' + (await now()) + '）');
  ok((await cellText('row-0-1')) === '4' && (await cellText('row-0-0')) === '7', '竖式上面一行是 47（大数写在上面）');
  await btn('[data-ar-col="0"]').click(); await p.waitForTimeout(60);
  ok((await cellText('ans-0')) === '4', '个位 7 − 3 = 4');
  await btn('[data-ar-col="1"]').click(); await p.waitForTimeout(60);
  ok((await cellText('ans-1')) === '2', '十位 4 − 2 = 2');
  ok((await sol()) === '−24', '结果：−24，带负号（' + (await sol()) + '）');
  ok(await query({ steps: { used: 'arith.column', allKept: true } }), 'steps 查询：竖式减法每步保持了不变量 → 真');

  ok(errs.length === 0, '没有页面错误和控制台错误' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n算术工作台遗留测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.log('FAIL 测试异常：' + e.message); process.exit(1); });
