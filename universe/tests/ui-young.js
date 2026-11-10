/* node tests/ui-young.js —— 低年级模式（next-steps 10.5.9 第二节第 11 条，§11）。真实鼠标：
 *   (A) 声明：UI.Young.TOOLS 是一个声明的工具 id 列表（移动、旋转、翻转、合并），每个都在工作区工具表里；不按器材名判断。
 *   (B) 菜单开关：菜单里的“低年级模式”按钮（真实鼠标点开菜单、点开关）；打开后 <html data-young="on">、字体和按钮变大；
 *       记在 localStorage（universe.young），刷新后还在；再点一下关掉，记录清掉，字号回到原来的大小。
 *   (C) 工具：打开低年级模式后，工作区的工具行只剩声明的几个（按 data-ws-tool 的 id 比对）；关掉后全部工具都回来。
 *       工具按钮的字号变大；真实鼠标点一个保留下来的工具，页面不报错。
 *   (D) localStorage 读写抛异常（隐私模式）：页面照常打开，开关照常能用，没有页面错误。
 * 对比度（两套主题）由 tools/contrast.js 的 young 模式检查（verify 里会跑）。
 * 需要 playwright（NODE_PATH 指向它的 node_modules）。 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const url = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

const YOUNG_TOOLS = ['move', 'rot', 'flip', 'merge'];
const isOn = (p) => p.evaluate(() => document.documentElement.getAttribute('data-young') === 'on');
const stored = (p) => p.evaluate(() => { try { return localStorage.getItem('universe.young'); } catch (e) { return 'ERR'; } });
const toolIds = (p) => p.evaluate(() => [...document.querySelectorAll('.wsx-tools button[data-ws-tool]')].map((b) => b.dataset.wsTool));
const fontOf = (p, sel) => p.evaluate((sel) => { const el = document.querySelector(sel); return el ? parseFloat(getComputedStyle(el).fontSize) : 0; }, sel);
const heightOf = (p, sel) => p.evaluate((sel) => { const el = document.querySelector(sel); return el ? el.getBoundingClientRect().height : 0; }, sel);
// 打开一个工作区（真实的台面状态），并让面板渲染出来
// 页面错误和控制台错误（和 tests/ui-feedback.js 一样直接收集）
const watch = (p) => { const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); }); return errs; };
const addWs = (p) => p.evaluate(() => {
  UI.App.openFree(); UI.App.act({ t: 'clear' });
  const id = UI.App.act({ t: 'add', type: 'gworkspace', x: 120, y: 60 }).id;
  UI.Stage.render();
  return id;
});
async function clickMenuYoung(p) {
  await p.locator('#menubtn').click(); await p.waitForTimeout(120);
  await p.locator('#youngbtn').click(); await p.waitForTimeout(150);
}

(async () => {
  const b = await chromium.launch();

  // ---------- (A) 声明 ----------
  {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    const errs = watch(p);
    await p.goto(url); await p.waitForTimeout(300);
    await p.evaluate(() => { try { localStorage.removeItem('universe.young'); } catch (e) { /* 存储不可用 */ } });
    await p.reload(); await p.waitForTimeout(300);
    const decl = await p.evaluate(() => (UI.Young && Array.isArray(UI.Young.TOOLS) ? UI.Young.TOOLS.slice() : null));
    ok(JSON.stringify(decl) === JSON.stringify(YOUNG_TOOLS), '(A) UI.Young.TOOLS 是声明的列表：' + JSON.stringify(decl));
    const known = await p.evaluate((ids) => {
      UI.App.openFree();
      const id = UI.App.act({ t: 'add', type: 'gworkspace', x: 0, y: 0 }).id;
      const cfg = UI.StageCtx.wsCfg(UI.S.scene.entities[id].type).tools.map((t) => t.id);
      UI.App.act({ t: 'del', id });
      return ids.every((x) => cfg.indexOf(x) >= 0);
    }, YOUNG_TOOLS);
    ok(known, '(A) 声明的每个工具 id 都在工作区的工具表里（packs/workspace.js）');
    // 开关默认关闭（没有存过）
    ok(!(await isOn(p)), '(A) 默认关闭：<html> 没有 data-young="on"');
    await ctx.close();
  }

  // ---------- (B) 菜单开关、字号、记住 ----------
  {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    const errs = watch(p);
    await p.goto(url); await p.waitForTimeout(300);
    await p.evaluate(() => { try { localStorage.removeItem('universe.young'); } catch (e) { /* 存储不可用 */ } });
    await p.reload(); await p.waitForTimeout(300);
    const fontOff = await fontOf(p, '#undo'), hOff = await heightOf(p, '#undo');
    await p.locator('#menubtn').click(); await p.waitForTimeout(120);
    const btn = p.locator('#youngbtn');
    ok((await btn.count()) === 1, '(B) 菜单里有“低年级模式”开关');
    ok((await btn.getAttribute('aria-pressed')) === 'false', '(B) 默认关闭（aria-pressed=false）');
    await btn.click(); await p.waitForTimeout(150);
    ok(await isOn(p), '(B) 点一下，<html> 的 data-young 变成 on');
    ok((await btn.getAttribute('aria-pressed')) === 'true', '(B) 开关显示“开”（aria-pressed=true）');
    ok((await btn.textContent()).indexOf('开') >= 0, '(B) 按钮文字写当前状态：' + (await btn.textContent()));
    ok((await stored(p)) === 'on', '(B) 记在 localStorage：universe.young = on');
    const fontOn = await fontOf(p, '#undo'), hOn = await heightOf(p, '#undo');
    ok(fontOn >= 18 && fontOn >= fontOff + 3, '(B) 顶栏按钮的字号变大：' + fontOff + 'px → ' + fontOn + 'px（至少 18px）');
    ok(hOn >= 40 && hOn > hOff, '(B) 顶栏按钮变高：' + Math.round(hOff) + 'px → ' + Math.round(hOn) + 'px（至少 40px）');
    await p.reload(); await p.waitForTimeout(300);
    ok(await isOn(p), '(B) 刷新后仍是低年级模式');
    await p.locator('#menubtn').click(); await p.waitForTimeout(120);
    await p.locator('#youngbtn').click(); await p.waitForTimeout(150);
    ok(!(await isOn(p)) && (await stored(p)) === null, '(B) 再点一下：关掉，记录清掉');
    ok(Math.abs((await fontOf(p, '#undo')) - fontOff) < 0.5, '(B) 关掉后字号回到原来的大小');
    ok(errs.length === 0, '(B) 切换期间没有页面错误' + (errs.length ? '（' + errs[0] + '）' : ''));
    await ctx.close();
  }

  // ---------- (C) 工具行只剩声明的几个；字号变大；真实鼠标点保留的工具 ----------
  {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    const errs = watch(p);
    await p.goto(url); await p.waitForTimeout(300);
    await p.evaluate(() => { try { localStorage.removeItem('universe.young'); } catch (e) { /* 存储不可用 */ } });
    await p.reload(); await p.waitForTimeout(300);
    await addWs(p); await p.waitForTimeout(200);
    const allBefore = await toolIds(p);
    ok(allBefore.length >= 9, '(C) 关闭时工作区工具行有全部工具：' + allBefore.length + ' 个');
    const toolFontOff = await fontOf(p, '.wsx-tools button[data-ws-tool]');
    await clickMenuYoung(p);
    ok(await isOn(p), '(C) 菜单里打开低年级模式');
    await p.evaluate(() => UI.Stage.render()); await p.waitForTimeout(150);
    const ids = await toolIds(p);
    ok(JSON.stringify(ids) === JSON.stringify(YOUNG_TOOLS), '(C) 工具行只剩声明的工具（按 id）：' + JSON.stringify(ids));
    const toolFontOn = await fontOf(p, '.wsx-tools button[data-ws-tool]');
    ok(toolFontOn >= 16 && toolFontOn >= toolFontOff + 2, '(C) 工作区工具按钮字号变大：' + toolFontOff + 'px → ' + toolFontOn + 'px（至少 16px）');
    // 真实鼠标点保留的“合并”工具（没选中图形时也要能点、不报错）
    const mergeBtn = p.locator('.wsx-tools button[data-ws-tool="merge"]');
    await mergeBtn.scrollIntoViewIfNeeded();
    const box = await mergeBtn.boundingBox();
    if (box) { await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await p.mouse.down(); await p.mouse.up(); await p.waitForTimeout(200); }
    ok(!!box, '(C) 真实鼠标点“合并”工具：按钮在屏幕上');
    // 关掉：工具回来
    await clickMenuYoung(p);
    await p.evaluate(() => UI.Stage.render()); await p.waitForTimeout(150);
    ok((await toolIds(p)).length === allBefore.length, '(C) 关掉后工具行回到全部工具');
    ok(errs.length === 0, '(C) 工具行的操作期间没有页面错误' + (errs.length ? '（' + errs[0] + '）' : ''));
    await ctx.close();
  }

  // ---------- (D) localStorage 不可用 ----------
  {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addInitScript(() => {
      const bad = () => { throw new Error('storage blocked'); };
      Storage.prototype.getItem = bad; Storage.prototype.setItem = bad; Storage.prototype.removeItem = bad;
    });
    const p = await ctx.newPage();
    const errs = watch(p);
    await p.goto(url); await p.waitForTimeout(300);
    ok(await p.evaluate(() => !!UI && !!UI.App), '(D) localStorage 不可用时页面照常打开');
    await clickMenuYoung(p);
    ok(await isOn(p), '(D) 存储不可用时，开关照常打开（只在内存里生效）');
    ok(errs.length === 0, '(D) 存储抛异常时没有页面错误' + (errs.length ? '（' + errs[0] + '）' : ''));
    await ctx.close();
  }

  await b.close();
  console.log('低年级模式测试：' + (fail ? '不合格' : '通过') + '（' + pass + ' 通过，' + fail + ' 失败）');
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.log('低年级模式测试：不合格（脚本异常：' + e.message.split('\n')[0] + '）'); process.exit(1); });
