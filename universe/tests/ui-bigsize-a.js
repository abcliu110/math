/* node tests/ui-bigsize-a.js —— 试验台增强 7 第二轮：补旧上限的台（真实鼠标）。
 *  1. 天平：3x + 45 = 165（bb-3x45-165）。砝码按 100 一块、10 一条画；左盘的“10”拖出来 4 次、单个的拖出来 5 次（两边一起），再点“两边都平分成 3 份”，x = 40；
 *  2. 两架天平：鸡兔同笼 35 头 94 足摆上去；从下面那架的左盘拖出一条 10（两个盘各少 10），托盘的“10”拖回去；再把上面那架拖到下面那架上：消元得 x + 3y = 59；
 *  3. 零对：35 − 62（zp-35-minus-62）。点“放进 10 对”两次、“放进一对”七次，再“拿走 62 个 +1”，得 −27；
 *  4. 因数：360 有几个因数（fb-360）。点每行 1 到 12、再点 + 到 18，排满的都记下，24 个找全；排长了折叠着画；
 *  5. 分一分：345 个，把每份几个拖到 20，“每盒几个：拖蓝色把手”这行字不被把手盖住；
 *  6. 面积模型：28 × 12 拖长到 50（超过 30），拖着的时候把手一直在鼠标下面；松手按新大小画，卡片不超过上限。
 *  每一步：卡片宽高不超过 U.kit.big.CARD_MAX（拖着的面积模型除外）；控制台 0 报错。
 *  设了环境变量 B2A_SHOTS（一个目录）时，把做完的卡片截图存进去（b2a-after-*.png）。
 * 需要 playwright（NODE_PATH 指向它的 node_modules）。 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const url = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/');
const SHOTS = process.env.B2A_SHOTS || '';
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(url); await p.waitForTimeout(400);
  const closeDlg = () => p.evaluate(() => { if (UI.Panels.closeDialog) UI.Panels.closeDialog(); });
  const open = async (id) => {
    await p.waitForTimeout(500); await closeDlg();
    await p.evaluate((id) => { UI.App.openProblem(id, 'practice'); }, id); await p.waitForTimeout(300);
    await p.evaluate(() => {
      document.querySelectorAll('button').forEach((x) => { if (/^(知道了|跳过|先不猜|开始)$/.test(x.textContent.trim())) x.click(); });
      for (const k of Object.keys(UI.S.help || {})) UI.S.help[k] = false;
      if (UI.S.run) UI.S.run.armed = true;
      UI.Stage.render();
    });
    await p.waitForTimeout(200);
  };
  // 开一道只有这一台的题，再把属性改成 props
  const openWith = async (type, props) => {
    const id = await p.evaluate((type) => (U.problems.find((x) => { const E = Object.values(x.build().entities); return E.length === 1 && E[0].type === type; }) || {}).id, type);
    await open(id);
    await p.evaluate(([type, props]) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === type); Object.assign(e.props, props); UI.S.D = U.World.evaluate(UI.S.scene); UI.Stage.render(); }, [type, props]);
    await p.waitForTimeout(200);
  };
  const ent = (type) => p.evaluate((type) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === type); return e ? { id: e.id, props: Object.assign({}, e.props) } : null; }, type);
  const out = (type, port) => p.evaluate(([type, port]) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === type), v = UI.S.D[e.id].out[port]; return v ? U.Q.show(v.data) : null; }, [type, port]);
  const allDone = () => p.evaluate(() => !!(UI.S.problem && UI.S.run && UI.S.problem.goal.every((g) => UI.S.run.ms[g] && UI.S.run.ms[g].done)));
  const text = () => p.evaluate(() => document.querySelector('.card svg.bdy').textContent);
  const toScreen = (type, cx, cy) => p.evaluate(([type, cx, cy]) => { const e = Object.values(UI.S.scene.entities).find((x) => x.type === type), sv = document.querySelector('.card[data-id="' + e.id + '"] svg.bdy'), r = sv.getBoundingClientRect(), k = r.width / +sv.getAttribute('width'); return { x: r.x + cx * k, y: r.y + cy * k }; }, [type, cx, cy]);
  const gripAt = (gid) => p.evaluate((gid) => { const g = document.querySelector('.card svg.bdy [data-grip="' + gid + '"]'); if (!g) return null; const r = g.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, gid);
  const dragTo = async (gid, to) => { await closeDlg(); const g = await gripAt(gid); if (!g) return false; await p.mouse.move(g.x, g.y); await p.mouse.down(); await p.mouse.move((g.x + to.x) / 2, (g.y + to.y) / 2, { steps: 6 }); await p.mouse.move(to.x, to.y, { steps: 6 }); await p.mouse.up(); await p.waitForTimeout(220); return true; };
  const cardOk = async (m) => { const r = await p.evaluate(() => { const c = document.querySelector('.card'), M = U.kit.big.CARD_MAX; return { w: c.offsetWidth, h: c.offsetHeight, M }; }); ok(r.w <= r.M[0] && r.h <= r.M[1], m + '：卡片 ' + r.w + '×' + r.h + ' 不超过 ' + r.M.join('×')); };
  const shot = async (name) => { if (!SHOTS) return; await closeDlg(); await p.waitForTimeout(150); await p.locator('.card').first().screenshot({ path: path.join(SHOTS, 'b2a-after-' + name + '.png') }); };
  const clickBtn = async (label) => { await closeDlg(); await p.locator('.card svg.bdy [data-pick-set]', { hasText: new RegExp(label.replace(/[+()]/g, '\\$&') + '$') }).first().click(); await p.waitForTimeout(140); };

  console.log('1. 天平：3x + 45 = 165');
  await open('bb-3x45-165'); await cardOk('天平开题');
  ok(/100 一块、10 一条/.test(await text()) && await p.locator('.card svg.bdy [data-ten]').count() >= 4 + 6, '砝码按 100 一块、10 一条画');
  const outB = await toScreen('balancebench', 580, 230);
  for (let i = 0; i < 4; i++) await dragTo('lt', outB);
  let bp = (await ent('balancebench')).props;
  ok(bp.lc === 5 && bp.rc === 125, '左盘的“10”拖出来 4 次：两边各少 40，' + bp.lx + 'x + ' + bp.lc + ' = ' + bp.rc);
  for (let i = 0; i < 5; i++) await dragTo('lw', outB);
  bp = (await ent('balancebench')).props;
  ok(bp.lc === 0 && bp.rc === 120 && await out('balancebench', 'stage') === '1', '单个的再拖 5 次：3x = 120');
  await clickBtn('两边都平分成 3 份');
  ok(await out('balancebench', 'solved') === '40' && await allDone(), '两边平分成 3 份：x = 40，做完了');
  await shot('balance'); await cardOk('天平做完');

  console.log('2. 两架天平：鸡兔同笼 35 头 94 足');
  await openWith('systembench', { e0: '1,1,0,0,0,35', e1: '2,4,10,0,0,104', x0: 23, y0: 12, steps: 0, refused: 0, msg: '', sync: true });
  await cardOk('两架天平开题');
  ok(await gripAt('i1Lt') && await gripAt('tt'), '下面那架左盘有一条“10”，托盘里也有一条“10”');
  await dragTo('i1Lt', await toScreen('systembench', 620, 470));
  ok((await ent('systembench')).props.e1 === '2,4,0,0,0,94', '拖出一条 10：两个盘各少 10，2x + 4y = 94');
  await dragTo('tt', await toScreen('systembench', 330, 14 + 104 - 30));
  ok((await ent('systembench')).props.e0 === '1,1,10,0,0,45', '托盘的“10”拖到上面那架：两个盘各加 10');
  await dragTo('i0Rt', await toScreen('systembench', 620, 470));
  ok((await ent('systembench')).props.e0 === '1,1,0,0,0,35', '再拖走：x + y = 35');
  await dragTo('b0', await toScreen('systembench', 210, 14 + 172 + 60));
  ok((await ent('systembench')).props.e1 === '1,3,0,0,0,59', '把上面那架拖到下面那架上：消元，x + 3y = 59');
  await shot('system'); await cardOk('两架天平');

  console.log('3. 零对：35 − 62');
  await open('zp-35-minus-62'); await cardOk('零对开题');
  await clickBtn('放进 10 对'); await clickBtn('放进 10 对');
  ok(/片多了：10 个一条、100 个一块/.test(await text()) && await p.locator('.card svg.bdy [data-rod]').count() >= 5, '放进 20 对以后 55 个 +1：10 个一条画，零对一列一列框起来');
  for (let i = 0; i < 7; i++) await clickBtn('放进一对 +1 −1');
  let zp = (await ent('chipbench')).props;
  ok(zp.pos === 62 && zp.neg === 27, '放进 27 对零对：62 个 +1、27 个 −1（' + zp.pos + '、' + zp.neg + '）');
  await clickBtn('拿走 62 个 +1');
  ok(await out('chipbench', 'result') === '-27' && await allDone(), '拿走 62 个 +1：剩 27 个 −1，35 − 62 = −27，做完了');
  await shot('chip'); await cardOk('零对做完');

  console.log('4. 因数：360 有几个因数');
  await open('fb-360'); await cardOk('因数开题');
  for (let k = 1; k <= 12; k++) await clickBtn(String(k));
  ok(/一共 30 行，每行 12 个/.test(await text()), '每行 12 个：30 行，中间折叠着画');
  for (let k = 13; k <= 18; k++) await clickBtn('+');
  ok(await out('factorbench', 'count') === '24' && await allDone(), '试到 18：24 个因数找全了');
  await shot('factor'); await cardOk('因数做完');

  console.log('5. 分一分：说明不被把手盖住');
  await openWith('groupbench', { mode: 0, n: 345, g: 7 });
  await dragTo('g', await toScreen('groupbench', 40 + 19 * 380 / 98, 340));
  ok((await ent('groupbench')).props.g === 20, '把每份几个拖到 20');
  const lap = await p.evaluate(() => { const a = document.querySelector('.card svg.bdy [data-grip="g"]').getBoundingClientRect(), b = document.querySelector('.card svg.bdy [data-slider-tip]').getBoundingClientRect(); return { lap: a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height }; });
  ok(!lap.lap, '“每盒几个：拖蓝色把手”这行字和把手不叠');
  await shot('group');

  console.log('6. 面积模型：拖长超过 30，把手跟着鼠标');
  await openWith('areamodel', { mode: 0, w: 28, h: 12, vcuts: '', hcuts: '' });
  await p.evaluate(() => { UI.S.view.z = 0.8; UI.Stage.render(); }); await p.waitForTimeout(150);
  const g0 = await gripAt('w'); await p.mouse.move(g0.x, g0.y); await p.mouse.down();
  let worst = 0;
  for (let i = 1; i <= 6; i++) { const mx = g0.x + i * 50; await p.mouse.move(mx, g0.y, { steps: 4 }); await p.waitForTimeout(60); const g = await gripAt('w'); worst = Math.max(worst, Math.abs(g.x - mx)); }
  ok(worst <= 8, '拖着的时候把手一直在鼠标下面（最多差 ' + worst.toFixed(1) + ' 像素）');
  await shot('area-drag');
  await p.mouse.up(); await p.waitForTimeout(250);
  const w1 = (await ent('areamodel')).props.w;
  ok(w1 > 30, '松手：长 ' + w1 + '，按新大小画'); await cardOk('面积模型松手以后');
  ok(/格子画小了/.test(await text()), '松手以后写着“格子画小了”');
  await shot('area-release');

  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs[0] : ''));
  console.log('\n补旧上限的台：' + pass + ' 通过，' + fail + ' 失败');
  await b.close(); process.exit(fail ? 1 : 0);
})();
