/* node tests/ui-geo-smart.js —— 几何工作区（2026-11）：旋转、放缩时和别的图形对齐，浮动条和快捷键（真实鼠标和键盘，专注模式）。
 *  1. 拖旋转把手，长方形的边转到和三角形的边平行时吸过去：提示写“∥”，画参考线；松手后两条边精确平行（叉积是 0）；
 *  2. 拖旋转把手经过 0° 附近：吸到“边水平”；
 *  3. 拖角上的把手放缩，经过“和三角形的边等长”的比例时吸过去，画“等长”参考线；经过“同一竖线”也有参考线；
 *  4. 浮动条：逆时针 15°、摆正（转回边水平，坐标回到整数）、角度框输入 30 回车、倍数框输入 3/2 回车；
 *  5. 键盘：[ 转 15°，− 缩小一半；形状（长方形、直角）始终不变；
 *  6. 平时线都是实线；拖动跟手（每一步处理 < 30 毫秒）；控制台 0 报错。
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
  // 工作区：一个 3-4-5 直角三角形 PQR（PQ 长 5，斜着），再从图形菜单放一个长方形（5×3）
  await p.evaluate(() => {
    const A = UI.App; A.openFree(); A.act({ t: 'clear' });
    const ws = A.act({ t: 'add', type: 'gworkspace', x: 0, y: 0 }).id;
    const pt = (name, x, y) => { const n = A.act({ t: 'add', type: 'gpt', x: 0, y: 0, props: { x, y, mark: name } }).id; A.act({ t: 'put', id: n, parent: ws, slot: 'items' }); return n; };
    const P = [pt('P', 1, -5), pt('Q', 5, -2), pt('R', 5, -5)];
    const poly = A.act({ t: 'add', type: 'gpoly', x: 0, y: 0 }).id;
    for (const q of P) A.act({ t: 'link', from: q, fromPort: 'p', to: poly, toPort: 'pts' });
    A.act({ t: 'put', id: poly, parent: ws, slot: 'items' });
  });
  await p.evaluate(() => { const g = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === '知道了'); if (g) g.click(); });
  await p.locator('.wsmini .shape-menu summary').first().click();
  await p.locator('.wsmini .shape-pop button[data-ws-shape="frect"]').first().click();
  await p.waitForTimeout(250);
  await p.locator('button', { hasText: '全屏' }).first().click(); await p.waitForTimeout(300);
  const F = '#wsfocus svg.wsbody ';
  const rectIds = await p.evaluate(() => Object.values(UI.S.scene.entities).filter((e) => e.type === 'gpt').slice(3).map((e) => e.id));
  const box = (sel) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, sel);
  const rectScr = () => p.evaluate((ids) => ids.map((id) => { const e = document.querySelector('#wsfocus svg.wsbody [data-drag="' + id + '"]'); const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }), rectIds);
  const center = async () => { const v = await rectScr(); return [v.reduce((s, q) => s + q[0], 0) / 4, v.reduce((s, q) => s + q[1], 0) / 4]; };
  const tipText = () => p.evaluate(() => { const t = document.querySelector('#tip'); return t && t.style.display !== 'none' ? t.textContent : ''; });
  const guideTexts = () => p.evaluate(() => [...document.querySelectorAll('#wsfocus svg.wsbody text')].map((t) => t.textContent).join('|'));
  // 长方形的状态：四条边长的平方、对角线的平方（精确），DE 和 PQ 的叉积
  const st = () => p.evaluate((ids) => {
    const Q = U.Q, E = UI.S.scene.entities, pt = (id) => ({ x: Q.parse(E[id].props.x), y: Q.parse(E[id].props.y) });
    const g = ids.map(pt), all = Object.values(E).filter((e) => e.type === 'gpt').map((e) => pt(e.id));
    const sub = (a, b) => ({ x: Q.sub(a.x, b.x), y: Q.sub(a.y, b.y) }), d2 = (a, b) => { const u = sub(a, b); return Q.show(Q.add(Q.mul(u.x, u.x), Q.mul(u.y, u.y))); };
    const u = sub(g[1], g[0]), w = sub(all[1], all[0]);
    return { sides: [d2(g[0], g[1]), d2(g[1], g[2]), d2(g[2], g[3]), d2(g[3], g[0]), d2(g[0], g[2])].join(' '), cross: Q.show(Q.sub(Q.mul(u.x, w.y), Q.mul(u.y, w.x))), ints: ids.every((id) => Number.isInteger(E[id].props.x) && Number.isInteger(E[id].props.y)) };
  }, rectIds);
  const s0 = await st();
  ok(s0.sides === '25 9 25 9 34', '开始：长方形 5×3（' + s0.sides + '）');
  // 选中长方形
  { const [cx, cy] = await center(); await p.mouse.click(cx + 15, cy + 20); await p.waitForTimeout(250); }
  ok(await p.evaluate(() => (UI.S.wsSel || []).length === 1), '选中了长方形');
  const dash = await p.evaluate(() => [...document.querySelectorAll('#wsfocus svg.wsbody path[data-pick]')].map((e) => e.getAttribute('stroke-dasharray') || ''));
  ok(dash.length >= 2 && dash.every((d) => d === ''), '多边形的边都是实线');

  console.log('1、2. 旋转：吸到和 PQ 平行、吸到水平');
  const rotSweep = async (from, to, stepDeg, stop) => {
    const [cx, cy] = await center(), r = await box(F + '[data-hdl="rot"]'), R = Math.hypot(r.x - cx, r.y - cy), a0 = Math.atan2(r.y - cy, r.x - cx);
    await p.mouse.move(r.x, r.y); await p.mouse.down();
    const seen = [];
    for (let d = from; stepDeg > 0 ? d <= to : d >= to; d += stepDeg) {
      const a = a0 - d * Math.PI / 180; await p.mouse.move(cx + R * Math.cos(a), cy + R * Math.sin(a));
      seen.push({ d, tip: await tipText(), g: await guideTexts() });
      if (stop && stop(seen[seen.length - 1])) break;
    }
    await p.mouse.up(); await p.waitForTimeout(250);
    return seen;
  };
  const s1 = await rotSweep(2, 45, 1, (x) => /∥/.test(x.tip) || /∥/.test(x.g));
  const hit = s1[s1.length - 1];
  ok(/∥/.test(hit.g), '转到 ' + hit.d + '° 附近：参考线写着平行（' + (hit.g.match(/[^|]*∥[^|]*/) || [''])[0] + '）');
  const a1 = await st();
  ok(a1.cross === '0', '松手后长方形的边和 PQ 精确平行（叉积 ' + a1.cross + '）');
  ok(a1.sides === s0.sides, '形状不变（' + a1.sides + '）');
  // 再往回转：经过“边水平”
  const s2 = await rotSweep(-1, -45, -1, (x) => /水平/.test(x.g));
  ok(s2.some((x) => /水平/.test(x.g)), '往回转：吸到「边水平」');
  const a2 = await st();
  ok(a2.ints && a2.sides === s0.sides, '松手：长方形回到正的（坐标是整数）');

  console.log('3. 放缩：吸到等长、同一竖线');
  {
    const c2 = await box(F + '[data-hdl="corner"][data-corner="2"]'), c0 = await box(F + '[data-hdl="corner"][data-corner="0"]');
    await p.mouse.move(c2.x, c2.y); await p.mouse.down();
    const seen = [];
    for (let k = 1.0; k >= 0.5; k -= 0.01) { await p.mouse.move(c0.x + (c2.x - c0.x) * k, c0.y + (c2.y - c0.y) * k); seen.push({ tip: await tipText(), g: await guideTexts() }); }
    await p.mouse.up(); await p.waitForTimeout(250);
    ok(seen.some((x) => /等长/.test(x.g)), '经过和三角形的边等长的比例：有「等长」参考线（' + ((seen.find((x) => /等长/.test(x.g)) || {}).tip || '') + '）');
    ok(seen.some((x) => /同一竖线|同一横线/.test(x.g)), '经过对齐的位置：有「同一竖线 / 横线」参考线');
    const a3 = await st(), r = a3.sides.split(' ');
    ok(r[0] !== '25' && r[0] === r[2] && r[1] === r[3], '放缩以后还是长方形，对边相等（' + a3.sides + '）');
  }
  // 放缩之后状态不定：直接把长方形放回 5×3（一步）
  await p.evaluate((ids) => { const xy = [[-5, 1], [0, 1], [0, 4], [-5, 4]]; ids.forEach((id, i) => { UI.App.act({ t: 'set', id, k: 'x', v: xy[i][0] }); UI.App.act({ t: 'set', id, k: 'y', v: xy[i][1] }); }); UI.Stage.render(); }, rectIds);
  await p.waitForTimeout(200);
  if (!(await p.evaluate(() => (UI.S.wsSel || []).length === 1))) { const [cx, cy] = await center(); await p.mouse.click(cx + 15, cy + 20); await p.waitForTimeout(250); }

  console.log('4. 浮动条');
  ok(await p.evaluate(() => !!document.querySelector('#wsfocus .wsx-float [data-fig-rot]')), '专注模式里有浮动条（转、摆正、放缩、角度、倍数）');
  await p.locator('#wsfocus [data-fig-rot="15"]').click(); await p.waitForTimeout(200);
  const b1 = await st();
  ok(!b1.ints && b1.sides === s0.sides, '↺：转了 15°，形状不变');
  await p.locator('#wsfocus [data-fig-straight]').click(); await p.waitForTimeout(200);
  const b2 = await st();
  ok(b2.ints && b2.sides === s0.sides, '摆正：边回到水平，坐标回到整数');
  await p.locator('#wsfocus [data-fig-ang]').fill('30'); await p.locator('#wsfocus [data-fig-ang]').press('Enter'); await p.waitForTimeout(200);
  ok((await st()).sides === s0.sides, '角度框输入 30 回车：转了，形状不变');
  await p.locator('#wsfocus [data-fig-k]').fill('3/2'); await p.locator('#wsfocus [data-fig-k]').press('Enter'); await p.waitForTimeout(200);
  const b4 = await st();
  ok(b4.sides === '225/4 81/4 225/4 81/4 153/2', '倍数框输入 3/2 回车：每条边乘 3/2（' + b4.sides + '）');

  console.log('5. 键盘');
  await p.mouse.move(5, 5);
  await p.keyboard.press('BracketLeft'); await p.waitForTimeout(150);
  ok((await st()).sides === b4.sides, '[：转 15°，形状不变');
  await p.keyboard.press('Minus'); await p.waitForTimeout(150);
  ok((await st()).sides === '225/16 81/16 225/16 81/16 153/8', '−：缩小一半');
  ok(/\[ \] 转/.test(await guideTexts()), '选中提示里写着快捷键');
  console.log('6. 拖动跟手：专注模式里拖动旋转把手，每一步的处理时间');
  await p.evaluate(() => { const SG = UI.StageCtx, f = SG.shapeMove; window.__t = []; SG.shapeMove = function () { const t0 = performance.now(); f.apply(this, arguments); window.__t.push(performance.now() - t0); }; });
  await rotSweep(1, 30, 1, null);
  const tm = (await p.evaluate(() => window.__t)).sort((a, b) => a - b), med = tm[tm.length >> 1] || 0;
  ok(tm.length >= 20 && med < 30, '每一步的中位数 ' + med.toFixed(1) + ' 毫秒（< 30，以前画布大时要 80–170 毫秒，跟不上鼠标）');
  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs.slice(0, 3).join('；') : ''));
  await b.close();
  console.log('\n几何工作区（对齐、浮动条、快捷键）测试：' + pass + ' 通过，' + fail + ' 失败');
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.log('几何工作区（对齐、浮动条、快捷键）测试：不合格（脚本异常：' + e.message.split('\n')[0] + '）'); process.exit(1); });
