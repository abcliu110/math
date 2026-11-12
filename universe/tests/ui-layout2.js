/* node tests/ui-layout2.js —— 布局和几何工作区的移动（2026-11）。窗口 1288×610（笔记本常见的大小）。
 *  1. 放上几何工作区：左边的实验库自动收成窄条，窄条上竖着写「实验库」，点一下能展开、再点能收起；
 *  2. 进专注模式（全屏）：两侧栏都收起，画布占窗口宽度一半以上；标题栏不挤（「工作区1」不竖排，「还原」在窗口里）；
 *     退出专注：右边的器材架回来；
 *  3. 拖动整个图形往画布外拖很远：图形停在画布看得到的范围里（不会拖出窗口看不见），提示「到画布边了」；
 *  4. 器材架：台面上有几何工作区时，第一组是「图形」；组里按年级从低到高；点过的器材出现在最上面的「最近用过」；
 *  5. 控制台 0 报错。
 * 需要 playwright（NODE_PATH 指向它的 node_modules）。 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const url = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1288, height: 610 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(url); await p.waitForTimeout(400);
  await p.evaluate(() => { try { localStorage.clear(); } catch (e) { /* 没有就算了 */ } UI.App.openFree(); UI.App.act({ t: 'clear' }); UI.App.act({ t: 'add', type: 'gworkspace', x: 0, y: 0 }); UI.App.refresh(); });
  await p.evaluate(() => { const g = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === '知道了'); if (g) g.click(); });
  await p.waitForTimeout(200);
  const W = (s) => p.evaluate((sel) => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, r: r.right, b: r.bottom }; }, s);
  const cls = () => p.evaluate(() => document.body.className);

  console.log('1. 两侧栏');
  ok(/rail-l/.test(await cls()) && !/rail-r/.test(await cls()), '有工作区、窗口 1288 宽：实验库自动收起，器材架还在（' + (await cls()) + '）');
  ok(/实验库/.test(await p.evaluate(() => document.querySelector('#lrail').textContent)), '窄条上写着「实验库」');
  ok(/收起/.test(await p.evaluate(() => document.querySelector('#rrail').textContent)), '器材架上有「收起」按钮');
  await p.click('#lrail'); await p.waitForTimeout(200);
  ok(!/rail-l/.test(await cls()) && (await W('#left')).w > 200, '点窄条：实验库展开');
  await p.click('#lrail'); await p.waitForTimeout(200);
  ok(/rail-l/.test(await cls()), '再点：又收起');
  await p.click('#rrail'); await p.waitForTimeout(200);
  ok(/rail-r/.test(await cls()) && (await W('#right')).w < 50, '点「收起」：器材架收成窄条');
  await p.click('#rrail'); await p.waitForTimeout(200);
  ok(!/rail-r/.test(await cls()), '再点：器材架展开');

  // 放一个长方形
  await p.locator('.wsmini .shape-menu summary').first().click();
  await p.locator('.wsmini .shape-pop button[data-ws-shape="frect"]').first().click();
  await p.waitForTimeout(250);

  console.log('2. 专注模式');
  await p.locator('button', { hasText: '全屏' }).first().click(); await p.waitForTimeout(400);
  ok(/rail-l/.test(await cls()) && /rail-r/.test(await cls()), '进专注：两侧栏都收起（' + (await cls()) + '）');
  const sv = await W('#wsfocus svg.wsbody');
  ok(sv && sv.w >= 1288 * 0.5, '画布宽 ' + (sv && Math.round(sv.w)) + ' 像素（≥ 窗口的一半）');
  const ttl = await W('#wsfocus .wsf-hd b'), rb = await W('#wsfocus [data-fbar="focus"]');
  ok(ttl && ttl.h < 30, '标题「工作区1」没有被挤成竖排（高 ' + (ttl && Math.round(ttl.h)) + '）');
  ok(rb && rb.r <= 1288 && rb.b <= 610, '「还原」按钮在窗口里');
  ok(sv && sv.b <= 610 + 1, '画布没有超出窗口底边');

  console.log('3. 拖动图形不出画布');
  const center = async () => { const v = await p.evaluate(() => [...document.querySelectorAll('#wsfocus svg.wsbody [data-drag]')].map((e) => { const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; })); return [v.reduce((s, q) => s + q[0], 0) / v.length, v.reduce((s, q) => s + q[1], 0) / v.length]; };
  const [cx, cy] = await center();
  await p.mouse.move(cx + 15, cy + 20); await p.mouse.down();
  await p.mouse.move(cx + 15 + 900, cy + 20 - 500, { steps: 20 });
  const tip = await p.evaluate(() => { const t = document.querySelector('#tip'); return t ? t.textContent : ''; });
  await p.mouse.up(); await p.waitForTimeout(250);
  ok(/画布边/.test(tip), '拖到画布外：提示「到画布边了」（' + tip + '）');
  const inside = await p.evaluate(() => {
    const svg = document.querySelector('#wsfocus svg.wsbody').getBoundingClientRect();
    return [...document.querySelectorAll('#wsfocus svg.wsbody [data-drag]')].every((e) => { const r = e.getBoundingClientRect(), x = r.x + r.width / 2, y = r.y + r.height / 2; return x >= svg.left - 1 && x <= svg.right + 1 && y >= svg.top - 1 && y <= svg.bottom + 1; });
  });
  ok(inside, '松手后长方形的四个顶点都还在画布里');
  await p.mouse.move(cx + 15, cy + 20); await p.waitForTimeout(50);
  await p.keyboard.press('Escape'); await p.waitForTimeout(150);
  if (await p.evaluate(() => !!UI.State.focusedId())) { await p.keyboard.press('Escape'); await p.waitForTimeout(250); }
  ok(!(await p.evaluate(() => UI.State.focusedId())), '退出专注');
  ok(!/rail-r/.test(await cls()), '退出专注：器材架回来了');

  console.log('4. 器材架的顺序');
  const grps = await p.evaluate(() => [...document.querySelectorAll('#shelfbody .grp')].map((g) => g.textContent));
  ok(grps[0] === '图形', '有几何工作区时第一组是「图形」（' + grps.slice(0, 3).join('、') + '）');
  const grades = await p.evaluate(() => { const g = [...document.querySelectorAll('#shelfbody .grp')].find((x) => x.textContent === '图形'); return [...g.nextElementSibling.querySelectorAll('.tile')].map((t) => (U.types[t.dataset.type].grades || [1])[0]); });
  ok(grades.length > 3 && grades.every((x, i) => i === 0 || grades[i - 1] <= x), '「图形」组里按年级从低到高（' + grades.join(',') + '）');
  const first = await p.evaluate(() => { const t = [...document.querySelectorAll('#shelfbody .tile')].find((x) => x.dataset.type !== 'gworkspace'); return t.dataset.type; });
  await p.locator('#shelfbody .tile[data-type="' + first + '"]').first().click(); await p.waitForTimeout(300);
  const g2 = await p.evaluate(() => { const g = [...document.querySelectorAll('#shelfbody .grp')][0]; return [g.textContent, g.nextElementSibling.querySelector('.tile').dataset.type]; });
  ok(g2[0] === '最近用过' && g2[1] === first, '点过的器材出现在最上面的「最近用过」（' + g2.join('：') + '）');
  ok(errs.length === 0, '控制台 0 报错' + (errs.length ? '：' + errs.slice(0, 3).join('；') : ''));
  await b.close();
  console.log('\n布局与移动测试：' + pass + ' 通过，' + fail + ' 失败');
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.log('布局与移动测试：不合格（脚本异常：' + e.message.split('\n')[0] + '）'); process.exit(1); });
