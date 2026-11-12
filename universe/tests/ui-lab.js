/* node tests/ui-lab.js —— 批次 5–6 器材的界面：真实鼠标点卡片上的点、格子、按钮。
 *   球面三角形：点 3 个点 → 先猜之前遮住 → 先猜后显示三个直角、内角和 270°；
 *   出租车几何：点格子标路口 → 标对全部显示“全对”；换对象清空；
 *   换一种运算：点“是/否”答题；写例子检验，找到反例；
 *   最优化：点参数试一试，记下试过的；逼近器：点“走一步”。 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const G = require('./gestures');
const url = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const body = (p, id) => p.evaluate((id) => { const c = document.querySelector('.card[data-id="' + id + '"]'); return c ? c.querySelector('svg.bdy').textContent : null; }, id);
const act = (p, a) => p.evaluate((a) => UI.App.act(a), a);
const prop = (p, id, k) => p.evaluate(([id, k]) => UI.S.scene.entities[id].props[k], [id, k]);
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1800, height: 1000 } }), errs = [];
  p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  G.attachErrorCollector(p); await p.goto(url); await p.waitForTimeout(300); await p.evaluate(() => { UI.S.helpAuto = false; });
  await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); });
  const click = async (id, k, v) => { await p.locator('.card[data-id="' + id + '"] [data-pick-k="' + k + '"][data-pick-v="' + v + '"]').first().click(); await p.waitForTimeout(120); };
  const add = async (type, x, y, props) => { const id = (await act(p, { t: 'add', type, x, y, props })).id; await p.waitForTimeout(150); return id; };
  const set = async (id, k, v) => { await act(p, { t: 'set', id, k, v }); await p.waitForTimeout(100); };

  console.log('球面三角形');
  const s = await add('spheretri', 20, 20, {});
  let t = await body(p, s); ok(t.includes('选 3 个'), '开场：提示选 3 个点');
  await click(s, 'pk', 1); await click(s, 'pk', 2); ok((await prop(p, s, 'pts')) === '0,1', '点北极、赤道 0°：记下两个点');
  await click(s, 'pk', 3); ok((await prop(p, s, 'pts')) === '0,1,2', '再点赤道 90°：三个点');
  t = await body(p, s); ok(t.includes('先猜'), '先猜之前：内角和被遮住');
  await set(s, 'gans', '270'); t = await body(p, s); ok(t.includes('内角和 270°') && t.includes('1/8'), '先猜以后：内角和 270°，占球面 1/8');
  await click(s, 'clear', 1); ok((await prop(p, s, 'pts')) === '', '重选：清空');

  await p.locator('.card[data-id="' + s + '"] .gchip:not(.hq)').first().click(); await p.waitForTimeout(300);
  ok(await p.evaluate(() => UI.S.inspOpen && document.querySelector('#insp').innerText.includes('先猜内角和') && !document.querySelector('#insp').innerText.includes('点球上的点')), '标题栏“先猜 / 填写”：打开属性面板，里面只有要填的，没有内部按钮');
  await p.evaluate(() => { UI.S.inspOpen = false; UI.Panels.renderInsp(); });

  console.log('出租车几何');
  const x = await add('taxi', 420, 20, { mode: 0, r: 1 });
  await set(x, 'gans', 2);
  // r=1：4 个路口 (1,0) (-1,0) (0,1) (0,-1)；格号 (y+5)*11+(x+5)+1
  for (const [a, c] of [[1, 0], [-1, 0], [0, 1]]) await click(x, 'cell', (c + 5) * 11 + (a + 5) + 1);
  t = await body(p, x); ok(t.includes('对了 3 个，错了 0 个'), '标 3 个：对了 3 个');
  await click(x, 'cell', (-1 + 5) * 11 + 5 + 1); t = await body(p, x); ok(t.includes('全对：共 4 个') && t.includes('= 4'), '标齐 4 个：全对，周长 ÷ 直径 = 4');
  await click(x, 'cell', 61); t = await body(p, x); ok(t.includes('错了 1 个'), '多标了中心：错了 1 个');

  console.log('换一种运算');
  const n = await add('newop', 420, 300, { op: 4 });
  await click(n, 'qc', 2); await click(n, 'qc', 0); ok((await prop(p, n, 'qc')) === 0, '再点一下取消回答');
  await click(n, 'qc', 2); await click(n, 'qa', 2); await click(n, 'qi', 2); await click(n, 'qv', 2);
  await set(n, 'ex', '1,2'); t = await body(p, n); ok(t.includes('是反例'), '写 1,2：出现反例');
  await set(n, 'ex', '9,9'); t = await body(p, n); ok(t.includes('要在表里') || (await prop(p, n, 'msg')).includes('要在表里'), '写表外的数：提示要在表里');
  await set(n, 'ex', '0,1,2'); t = await body(p, n); ok(t.includes('四条都答对了'), '结合律也有反例：四条都答对');

  console.log('最优化、逼近器');
  const o = await add('optimize', 820, 20, { scene: 0 });
  await set(o, 'gx', 5); await click(o, 'x', 3); await click(o, 'x', 5); ok((await prop(p, o, 'tr')) === '3,5', '点参数 3、5：记下试过的');
  const a = await add('approach', 820, 300, { scene: 0 });
  await set(a, 'gans', 1); await click(a, 'step', 1); ok((await prop(p, a, 'step')) === 1, '点“走一步”：走到第 1 步');
  console.log('怎么玩');
  const noHow = await p.evaluate(() => Object.keys(U.types).filter((k) => U.types[k].compactPorts && !(UI.Howto[k] && UI.Howto[k].length === 3)));
  ok(noHow.length === 0, '每台自己画交互的器材都有 3 步“怎么玩”：缺 ' + noHow.join('、'));
  await p.evaluate(() => { UI.S.helpAuto = true; UI.S.helpSeen = {}; UI.S.help = {}; });
  const hw = await add('twoways', 1180, 520, {});
  ok(await p.locator('.card[data-id="' + hw + '"] .howto').count() === 1, '第一次放到台面：自动展开“怎么玩”');
  await p.locator('.card[data-id="' + hw + '"] .hbtn').click(); await p.waitForTimeout(150);
  ok(await p.locator('.card[data-id="' + hw + '"] .howto').count() === 0, '点“收起”：收起');
  await p.locator('.card[data-id="' + hw + '"] .hq').click(); await p.waitForTimeout(150);
  ok(await p.locator('.card[data-id="' + hw + '"] .howto').count() === 1, '点标题栏“? 怎么玩”：再打开');
  const noWhy = await p.evaluate(() => Object.keys(U.types).filter((k) => U.types[k].compactPorts && !UI.Why[k]));
  ok(noWhy.length === 0, '每台自己画交互的器材都有“原理”页：缺 ' + noWhy.join('、'));
  await p.locator('.card[data-id="' + hw + '"] .htab').nth(1).dispatchEvent('pointerdown'); await p.waitForTimeout(150);
  ok(await p.locator('.card[data-id="' + hw + '"] .howto.demo svg').count() === 1 && (await p.locator('.card[data-id="' + hw + '"] .dcap').innerText()).length > 0, '点“看图：为什么这样”：显示一张图和一句话');
  await p.locator('.card[data-id="' + hw + '"] .dbtn:not(.off)').first().dispatchEvent('pointerdown'); await p.waitForTimeout(150);
  ok(await p.evaluate((id) => UI.S.demo[id], hw) === 1, '点 ▶：看下一个画面');
  const noDemo = await p.evaluate(() => Object.keys(U.types).filter((k) => U.types[k].compactPorts && k !== 'fracarea' && !UI.Demo[k]));
  ok(noDemo.length === 0, '每台自己画交互的器材（除分数面积自带演示外）都有看图演示：缺 ' + noDemo.join('、'));
  const badDemo = await p.evaluate(() => Object.keys(UI.Demo).filter((k) => { const d = UI.Demo[k]; try { return !d.caps.length || d.caps.some((_, i) => typeof d.draw(i) !== 'string' || d.draw(i).length < 40 || /NaN|undefined/.test(d.draw(i))); } catch (e) { return true; } }));
  ok(badDemo.length === 0, '每个演示的每个画面都能画出来、没有 NaN：' + badDemo.join('、'));
  await p.evaluate(() => { UI.S.helpAuto = false; });
  const fa = await add('fracarea', 1180, 160, { a: '1/2', b: '1/3', op: 0, view: 0 });
  await p.locator('.card[data-id="' + fa + '"] [data-pick-k="op"][data-pick-v="2"]').dispatchEvent('pointerdown'); await p.waitForTimeout(150);
  ok(await p.evaluate((id) => UI.S.scene.entities[id].props.op, fa) === 2, '分数面积：点卡片上的“加”直接切换运算');
  await p.locator('.card[data-id="' + fa + '"] [data-pick-k="st"]').first().dispatchEvent('pointerdown'); await p.waitForTimeout(150);
  ok(await p.evaluate((id) => UI.S.scene.entities[id].props.st, fa) === 1, '点卡片上的 ▶：看下一步（图变了，不是读文字）');
  const nA = await add('num', 780, 40, { n: 1, d: 3 }), nB = await add('num', 780, 160, { n: 3, d: 4 }), fw = await add('fracarea', 1000, 420, { op: 1, st: 5 });
  await p.evaluate(([a, b, f]) => { UI.App.act({ t: 'link', from: a, fromPort: 'v', to: f, toPort: 'p.a' }); UI.App.act({ t: 'link', from: b, fromPort: 'v', to: f, toPort: 'p.b' }); }, [nA, nB, fw]);
  await p.waitForTimeout(200);
  ok(/1×3 = 3 格/.test(await p.locator('.card[data-id="' + fw + '"]').innerText()), '数字卡连到两个分数口：图按 1/3 和 3/4 画出（1×3 = 3 格）');
  ok(await p.locator('.tool [data-act="copy"]').count() === 0 && !(await p.evaluate(() => document.body.innerHTML.includes('data-act="copy"') && !document.querySelector('.wsmini'))), '选中器材后，工具条上没有“复制”');
  const ordBad = await p.evaluate(() => Object.keys(UI.PortPrimary).filter((t) => { const d = U.types[t]; if (!d) return true; const o = UI.outOrder(t, d); return o.length !== Object.keys(d.outputs).length || UI.PortPrimary[t].some((k) => !d.outputs[k]); }));
  ok(ordBad.length === 0, '每台的输出口顺序都定了、没有写错名字：' + ordBad.join('、'));
  const sw = await add('optimize', 1180, 640, {});
  const sw0 = await p.evaluate((id) => UI.S.scene.entities[id].props.scene, sw);
  await p.locator('.card[data-id="' + sw + '"] .gchip.sw').dispatchEvent('pointerdown'); await p.waitForTimeout(150);
  ok(await p.evaluate((id) => UI.S.scene.entities[id].props.scene, sw) !== sw0, '标题栏的“换一种”：点一下换到下一种场景');
  ok(errs.length === 0, '没有页面错误：' + errs.slice(0, 2).join('|'));
  await G.assertInvariants(p, '改规则');
  await b.close(); console.log(pass + ' 通过，' + fail + ' 失败'); process.exit(fail ? 1 : 0);
})();
