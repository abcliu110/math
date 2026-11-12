/* node tests/ui-rotate.js —— 几何工作区：任意角度旋转、旋转以后再放缩（真实鼠标）。
 *  1. 长方形拖旋转把手转 30°：四条边还是 5、3，对角线不变，面积还是 15（全等，不是把坐标四舍五入转歪）；
 *  2. 转过一次（顶点已经是分数坐标）还能再转 25°，形状仍然不变；
 *  3. 转过以后拖角上的把手放缩到 3/5：每条边都按同一个比例变（等比例，形状不变）；
 *  4. 放缩以后再转 −40°、再按方向键平移，都能做，形状不变；
 *  5. 控制台 0 报错（原来分数坐标会抛 bad-number）。
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
  await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); UI.App.act({ t: 'add', type: 'gworkspace', x: 0, y: 0 }); });
  await p.evaluate(() => { const g = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === '知道了'); if (g) g.click(); });
  await p.locator('.wsmini .shape-menu summary').first().click();
  await p.locator('.wsmini .shape-pop button[data-ws-shape="frect"]').first().click();
  await p.waitForTimeout(250);
  const box = (sel) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, sel);
  const center = async () => { const vs = await p.evaluate(() => [...document.querySelectorAll('svg.wsbody [data-drag]')].map((e) => { const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; })); return [vs.reduce((s, v) => s + v[0], 0) / vs.length, vs.reduce((s, v) => s + v[1], 0) / vs.length]; };
  const tipText = () => p.evaluate(() => { const t = document.querySelector('#tip'); return t ? t.textContent : ''; });
  // 边长（精确）：AB、BC、CD、DA 的平方，和对角线 AC 的平方，用有理数算，比较时不受浮点影响
  const shape = () => p.evaluate(() => {
    const Q = U.Q, g = Object.values(UI.S.scene.entities).filter((e) => e.type === 'gpt').map((e) => ({ x: Q.parse(e.props.x), y: Q.parse(e.props.y) }));
    const d2 = (a, b) => { const dx = Q.sub(a.x, b.x), dy = Q.sub(a.y, b.y); return Q.show(Q.add(Q.mul(dx, dx), Q.mul(dy, dy))); };
    return [d2(g[0], g[1]), d2(g[1], g[2]), d2(g[2], g[3]), d2(g[3], g[0]), d2(g[0], g[2])].join(' ');
  });
  const select = async () => { if (await p.evaluate(() => (UI.S.wsSel || []).length === 1)) return; const [cx, cy] = await center(); await p.mouse.click(cx + 20, cy + 25); await p.waitForTimeout(250); };
  const rotate = async (deg) => {
    await select();
    const [cx, cy] = await center(), r = await box('svg.wsbody [data-hdl="rot"]');
    if (!r) return '(没有旋转把手)';
    await p.mouse.move(r.x, r.y); await p.mouse.down();
    const R = Math.hypot(r.x - cx, r.y - cy), a0 = Math.atan2(r.y - cy, r.x - cx);
    for (let i = 1; i <= 12; i++) { const a = a0 - (deg * Math.PI / 180) * i / 12; await p.mouse.move(cx + R * Math.cos(a), cy + R * Math.sin(a)); }
    const t = await tipText(); await p.mouse.up(); await p.waitForTimeout(250); return t;
  };
  const scale = async (k) => {
    await select();
    const c1 = await box('svg.wsbody [data-hdl="corner"][data-corner="1"]'), c3 = await box('svg.wsbody [data-hdl="corner"][data-corner="3"]');
    if (!c1 || !c3) return '(没有放缩把手)';
    await p.mouse.move(c1.x, c1.y); await p.mouse.down();
    await p.mouse.move(c3.x + (c1.x - c3.x) * k, c3.y + (c1.y - c3.y) * k, { steps: 10 });
    const t = await tipText(); await p.mouse.up(); await p.waitForTimeout(250); return t;
  };
  const area = () => p.evaluate(() => [...document.querySelectorAll('svg.wsbody text')].map((t) => t.textContent).find((s) => s.indexOf('面积') === 0) || '');

  const s0 = await shape();
  ok(s0 === '25 9 25 9 34', '开始：长方形 5×3（边长平方 ' + s0 + '）');
  console.log('1. 转 30°');
  const t1 = await rotate(30);
  ok(/转 30°/.test(t1), '拖动时提示转的角度（' + t1 + '）');
  ok(await shape() === s0, '转完边长、对角线都不变（' + (await shape()) + '）');
  ok(await p.evaluate(() => Object.values(UI.S.scene.entities).filter((e) => e.type === 'gpt').some((e) => typeof e.props.x === 'string')), '顶点坐标是精确的分数');
  ok((await area()) === '面积 15', '面积还是 15（' + (await area()) + '）');
  console.log('2. 分数坐标的图形再转 25°');
  const t2 = await rotate(25);
  ok(/转 25°/.test(t2), '还能转（' + t2 + '）');
  ok(await shape() === s0, '形状不变');
  console.log('3. 转过以后放缩到 3/5');
  const t3 = await scale(0.6);
  ok(/放缩 3\/5 倍/.test(t3), '提示放缩 3/5 倍（' + t3 + '）');
  ok(await shape() === '9 81/25 9 81/25 306/25', '每条边都乘 3/5（等比例）：' + (await shape()));
  console.log('4. 再转 −40°、再按方向键平移');
  const t4 = await rotate(-40);
  ok(/转 -40°/.test(t4), '还能转（' + t4 + '）');
  ok(await shape() === '9 81/25 9 81/25 306/25', '形状不变');
  const before = await p.evaluate(() => Object.values(UI.S.scene.entities).filter((e) => e.type === 'gpt').map((e) => U.Q.num(U.Q.parse(e.props.x))));
  await p.keyboard.press('ArrowRight'); await p.waitForTimeout(200);
  const after = await p.evaluate(() => Object.values(UI.S.scene.entities).filter((e) => e.type === 'gpt').map((e) => U.Q.num(U.Q.parse(e.props.x))));
  ok(after.every((x, i) => Math.abs(x - before[i] - 1) < 1e-9), '方向键右移一格，分数坐标也能平移');
  ok(await shape() === '9 81/25 9 81/25 306/25', '平移后形状不变');
  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs.slice(0, 3).join('；') : ''));
  await b.close();
  console.log('\n旋转与放缩测试：' + pass + ' 通过，' + fail + ' 失败');
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.log('旋转与放缩测试：不合格（脚本异常：' + e.message.split('\n')[0] + '）'); process.exit(1); });
