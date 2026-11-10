/* node tests/ui-teacher.js —— 出题人控制（§10.5.9 第 10 条）。全部用真实鼠标和键盘：
 *   示例题 geo-teacher-median（题目声明：器材架只列 shelf 里的、工作区工具只留连线和剪、不许改名、不许删题目给的图形）：
 *   (a) 器材架只列题目 shelf 里的器材，其它的不出现在页面里（不是变灰）；
 *   (b) 工作区工具栏只有题目 tools 里的按钮（连线、剪）；
 *   (c) 真实鼠标点工作区，名字输入框是禁用的，名字不变；
 *   (d) 真实键盘按 Delete 删题目给的工作区，被拒绝，说明原因，器材还在；
 *   (e) 学生自己从器材架拖进来的器材，可以删除（不受限制）。
 *   对照题 geo-median-area（没有出题人控制字段）：器材架和工具栏和以前一样，名字可以改。
 * 需要 playwright（NODE_PATH 指向它的 node_modules）。 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const G = require('./gestures');
const bannerText = G.bannerText;
const url = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  G.attachErrorCollector(p);
  await p.goto(url); await p.waitForTimeout(300);

  const EX = 'geo-teacher-median', OLD = 'geo-median-area';
  const open = async (pid) => { await p.evaluate((pid) => UI.App.openProblem(pid, 'practice'), pid); await p.waitForTimeout(300); };
  const tileTypes = () => p.evaluate(() => [...document.querySelectorAll('#shelfbody .tile')].map((t) => t.dataset.type));
  const wsToolLabels = () => p.evaluate(() => [...document.querySelectorAll('[data-ws-tool]')].map((b) => b.textContent.trim()));
  const wsId = () => p.evaluate(() => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'gworkspace'); return e ? e.id : null; });
  const nameOf = (id) => p.evaluate((id) => UI.S.scene.entities[id] ? UI.S.scene.entities[id].name : null, id);
  const exists = (id) => p.evaluate((id) => !!UI.S.scene.entities[id], id);

  console.log('示例题：器材架和工作区工具只留题目声明的');
  await open(EX);
  const shelfWant = await p.evaluate((pid) => U.problemById(pid).shelf.slice().sort(), EX);
  const shelfGot = (await tileTypes()).slice().sort();
  ok(JSON.stringify(shelfGot) === JSON.stringify(shelfWant), '器材架正好是题目 shelf 里的器材（' + shelfGot.join('、') + '）');
  ok((await p.locator('#shelfbody .tile.off').count()) === 0, '题目 shelf 之外的器材不显示（不是变灰，是隐藏）');
  const tools = await wsToolLabels();
  ok(JSON.stringify(tools) === JSON.stringify(['连线', '剪', '中点']), '工作区工具栏只有题目 tools 里的按钮：' + JSON.stringify(tools));

  console.log('真实鼠标：双击题目给的点的标签改名，被拒绝');
  const ws = await wsId();
  ok(!!ws, '示例题里有几何工作区（题目给的图形）');
  const idA = await p.evaluate(() => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === 'gpt' && x.props.mark === 'A'); return e ? e.id : null; });
  ok(!!idA, '题目给的点 A 存在');
  const aBox = await p.evaluate(() => {
    const t = [...document.querySelectorAll('svg.wsbody text')].find((x) => x.textContent.trim() === 'A');
    if (!t) return null;
    const r = t.getBoundingClientRect(); return { x: (r.left + r.right) / 2, y: (r.top + r.bottom) / 2 };
  });
  ok(!!aBox, '找得到 A 的标签');
  if (aBox) {
    await p.mouse.dblclick(aBox.x, aBox.y); await p.waitForTimeout(250);
    const input = p.locator('input.wsx-ren');
    if ((await input.count()) === 1) { await input.first().fill(''); await p.keyboard.type('P'); await p.keyboard.press('Enter'); }
    await p.waitForTimeout(300);
  }
  ok((await nameOf(idA)) === 'A' || (await p.evaluate((id) => UI.S.scene.entities[id].props.mark, idA)) === 'A', '点 A 的名字没有变');
  ok(await p.evaluate(() => [...document.querySelectorAll('svg.wsbody text')].some((x) => x.textContent.trim() === 'A')), '台面上的标签还是 A');
  ok(/题目不许改名/.test((await bannerText(p)) || ''), '说明了原因');

  console.log('真实键盘：删除题目给的工作区，被拒绝');
  await G.clickCard(p, ws);
  const r1 = await G.press(p, 'Delete');
  ok(await exists(ws), '题目给的工作区还在');
  ok(/题目给的|不许删/.test(r1.text || ''), '说明了原因：' + (r1.text || '（没有提示）'));

  console.log('真实鼠标：学生自己加的器材可以删除');
  const r2 = await G.dragTileTo(p, 'figmeasure', { x: 760, y: 420 });   // 工作区右边、器材架左边的空地
  const added = r2.added && r2.added[0];
  ok(!!added, '从器材架拖进一个量图形器材' + (added ? '' : '（没有新出现的卡片）'));
  if (added) {
    await G.clickCard(p, added);
    await G.press(p, 'Delete');
    ok(!(await exists(added)), '学生加的器材可以删除，台面上没有了');
  }

  console.log('对照题：没有出题人控制字段的题，和以前一样');
  await open(OLD);
  const oldWs = await wsId();
  ok(!!oldWs, '对照题里有几何工作区');
  const oldTools = await wsToolLabels();
  ok(oldTools.length === 9, '对照题的工作区工具栏还是 9 个按钮（' + oldTools.length + ' 个）');
  ok((await p.evaluate((ws) => UI.S.scene.entities[ws].type, oldWs)) === 'gworkspace', '对照题的工作区还在');
  const greyed = await p.locator('#shelfbody .tile.off').count();
  ok(greyed > 0, '对照题 shelf 之外的器材仍然变灰（' + greyed + ' 个）');

  ok(errs.length === 0, '没有页面错误和控制台错误' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n出题人控制测试：' + pass + ' 通过，' + fail + ' 失败');
  await b.close();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.log('FAIL 测试异常：' + e.message); process.exit(1); });
