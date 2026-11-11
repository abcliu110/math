/* node tests/ui-theme.js —— 主题与色觉障碍的第二种区分手段（V10，docs/ui-geometry-feedback.md 2.11、2.6b）。
 *   (A) 令牌（不开浏览器）：css/universe.css 里深色（:root）和浅色（:root[data-theme="light"]）两套令牌都定义了同一组变量；
 *       台面和卡片上的文字组合（文字 / 背景）在两套里都 >= 4.5:1。
 *   (B) 页面（playwright）：
 *       (1) 系统是浅色 / 深色时，<html data-theme> 和台面背景跟着变（跟随系统）；
 *       (2) 菜单里的“外观”按钮：跟随系统 → 浅色 → 深色 循环，选择记在 localStorage，刷新后还在；选回“跟随系统”就清掉记录；
 *       (3) localStorage 读写抛异常（隐私模式）时页面照常打开、没有报错，按钮照常能用；
 *   (C) 色觉障碍（2.6b）：打开高对比度时，工作区里不同颜色的线段和多边形的边，线型（stroke-dasharray）也不同（平时都是实线，2026-11）；
 *       同一个工作区里，任意两个颜色不同的线或边，线型都不同（只靠颜色区分的情况不允许）。
 * 需要 playwright（NODE_PATH 指向它的 node_modules）。 */
'use strict';
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const { contrastRatio, hexToRgb, MIN } = require('../tools/contrast');
const G = require('./gestures');
const root = path.join(__dirname, '..');
const url = 'file:///' + path.join(root, 'index.html').split(path.sep).join('/');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

// ---------- (A) 令牌 ----------
// 台面和卡片上的文字组合：[文字令牌, 背景令牌]。两套主题都要 >= MIN
const PAIRS = [
  ['--txt', '--bg'], ['--txt', '--panel'], ['--txt2', '--panel'], ['--txt3', '--panel'], ['--txt3', '--bg'],
  ['--txt', '--panel2'], ['--txt2', '--panel2'], ['--txt', '--sel-bg'], ['--blue-ink', '--panel'],
  ['--orange', '--panel2'], ['--orange', '--sel-bg'], ['--ink', '--card'], ['--dim', '--card'],
  ['--txt', '--lb-bg'], ['--txt', '--sig-bg'], ['--txt', '--sig-err'], ['--txt', '--sig-ok'], ['--ok-ink', '--sel-bg'], ['--bad-ink', '--panel'],
  ['--off-ink', '--off-bg'], ['--off-ink2', '--off-bg'], ['--warnbox-ink', '--warnbox-bg'], ['--new-ink', '--new-bg'], ['--msg-good-ink', '--msg-good-bg'], ['--msg-bad-ink', '--msg-bad-bg'],
];
function blocks() {
  const css = fs.readFileSync(path.join(root, 'css', 'universe.css'), 'utf8');
  const get = (sel) => {
    const re = new RegExp('(^|\\s)' + sel.replace(/[\[\]()"=]/g, (c) => '\\' + c) + '\\s*\\{([^}]*)\\}', 'm');
    const m = re.exec(css); if (!m) return null;
    const raw = {};
    for (const d of m[2].matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) raw['--' + d[1]] = d[2].trim();
    return raw;
  };
  return { dark: get(':root'), light: get(':root[data-theme="light"]') };
}
function resolveColor(raw, v) {
  const r = /^var\((--[\w-]+)\)$/.exec(v);
  return r && raw[r[1]] ? resolveColor(raw, raw[r[1]]) : v;
}

(() => {
  const B = blocks();
  ok(!!B.dark && !!B.light, '深色（:root）和浅色（:root[data-theme="light"]）两套令牌都存在');
  if (!B.dark || !B.light) return;
  // --font 只在深色块里定义（字体两套主题相同）；其余变量两套必须一样
  const keysD = Object.keys(B.dark).filter((k) => k !== '--font').sort().join(','), keysL = Object.keys(B.light).sort().join(',');
  ok(keysD === keysL, '两套令牌定义的变量完全相同（深色 ' + Object.keys(B.dark).length + ' 个，浅色 ' + Object.keys(B.light).length + ' 个，字体除外）');
  for (const [name, set] of [['深色', B.dark], ['浅色', B.light]]) {
    const worst = [];
    for (const [t, bg] of PAIRS) {
      // 带透明度的 #rrggbbaa 只取前六位（不透明部分）；真实的合成对比度由 tools/contrast.js 在页面里量
      const tc = hexToRgb(resolveColor(set, set[t] || '').slice(0, 7)), bc = hexToRgb(resolveColor(set, set[bg] || '').slice(0, 7));
      if (!tc || !bc) { worst.push(t + '/' + bg + ' 不是十六进制色值'); continue; }
      const r = contrastRatio(tc, bc);
      if (r < MIN) worst.push(t + ' 在 ' + bg + ' 上 ' + r.toFixed(2) + ':1');
    }
    ok(worst.length === 0, name + '主题：文字组合全部 >= ' + MIN + ':1' + (worst.length ? '（' + worst.join('；') + '）' : ''));
  }
})();

(async () => {
  const b = await chromium.launch();
  const bgOf = (p) => p.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const toRgbStr = (hex) => { const c = hexToRgb(hex); return 'rgb(' + c.join(', ') + ')'; };
  const tokenOf = (theme, name) => (B_TOK[theme] || {})[name];
  const B_TOK = blocks();

  // ---------- (B) 页面 ----------
  // (1) 跟随系统
  for (const scheme of ['light', 'dark']) {
    const ctx = await b.newContext({ colorScheme: scheme, viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage(), errs = [];
    p.on('pageerror', (e) => errs.push(e.message));
    p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
    await p.goto(url); await p.waitForTimeout(300);
    const theme = await p.evaluate(() => document.documentElement.getAttribute('data-theme'));
    const want = scheme;
    ok(theme === want, '系统是' + (scheme === 'light' ? '浅色' : '深色') + '时，<html data-theme> = ' + want + '（实际 ' + theme + '）');
    const bg = await bgOf(p);
    const wantBg = toRgbStr(tokenOf(want, '--bg'));
    ok(bg === wantBg, '台面背景跟着主题变：' + bg + '（期望 ' + wantBg + '）');
    ok(errs.length === 0, scheme + ' 系统偏好下没有页面错误' + (errs.length ? '（' + errs[0] + '）' : ''));
    await ctx.close();
  }

  // (2) 手动切换并记住。系统是浅色，所以“跟随系统”的结果是浅色，便于看出手动设置生效
  {
    const ctx = await b.newContext({ colorScheme: 'light', viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage(), errs = [];
    p.on('pageerror', (e) => errs.push(e.message));
    p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
    await p.goto(url); await p.waitForTimeout(300);
    await p.evaluate(() => { try { localStorage.removeItem('universe.theme'); } catch (e) {} });
    await p.reload(); await p.waitForTimeout(300);
    const clickTheme = async () => { await p.click('#menubtn'); await p.click('#themebtn'); await p.waitForTimeout(150); };
    const stored = () => p.evaluate(() => { try { return localStorage.getItem('universe.theme'); } catch (e) { return 'ERR'; } });
    ok((await p.evaluate(() => document.documentElement.getAttribute('data-theme'))) === 'light', '未设置时跟随系统（浅色）');
    await clickTheme();   // 跟随系统 → 浅色
    ok((await p.evaluate(() => document.documentElement.getAttribute('data-theme'))) === 'light' && (await stored()) === 'light', '菜单切到“浅色”：记住 light');
    await clickTheme();   // 浅色 → 深色
    const dark = await p.evaluate(() => document.documentElement.getAttribute('data-theme'));
    ok(dark === 'dark' && (await bgOf(p)) === toRgbStr(tokenOf('dark', '--bg')), '菜单切到“深色”：台面变深色（系统是浅色，手动生效）');
    ok((await stored()) === 'dark', '记录为 dark');
    await p.reload(); await p.waitForTimeout(300);
    ok((await p.evaluate(() => document.documentElement.getAttribute('data-theme'))) === 'dark', '刷新后仍是手动选的深色');
    const label = await p.textContent('#themebtn');
    ok(label.indexOf('深色') >= 0, '按钮文字显示当前选择：' + label);
    await clickTheme();   // 深色 → 跟随系统
    ok((await p.evaluate(() => document.documentElement.getAttribute('data-theme'))) === 'light' && (await stored()) === null, '选回“跟随系统”：清掉记录，回到系统的浅色');
    ok(errs.length === 0, '切换主题期间没有页面错误' + (errs.length ? '（' + errs[0] + '）' : ''));
    await ctx.close();
  }

  // (3) localStorage 读写抛异常：页面照常打开，没有错误，按钮照常切换（只在内存里生效）
  {
    const ctx = await b.newContext({ colorScheme: 'light', viewport: { width: 1440, height: 900 } });
    await ctx.addInitScript(() => {
      // 隐私模式下读写 localStorage 会抛异常：这里把 Storage 的方法全部换成抛异常的版本
      const bad = () => { throw new Error('storage blocked'); };
      Storage.prototype.getItem = bad; Storage.prototype.setItem = bad; Storage.prototype.removeItem = bad;
    });
    const p = await ctx.newPage(), errs = [];
    p.on('pageerror', (e) => errs.push(e.message));
    p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
    await p.goto(url); await p.waitForTimeout(300);
    ok((await p.evaluate(() => !!UI && !!UI.App)) && (await p.evaluate(() => document.documentElement.getAttribute('data-theme'))) === 'light', 'localStorage 不可用时页面照常打开，跟随系统');
    await p.click('#menubtn'); await p.click('#themebtn'); await p.waitForTimeout(150);
    ok((await p.evaluate(() => document.documentElement.getAttribute('data-theme'))) === 'light', '不可用存储时点“外观”不报错（循环到浅色）');
    ok(errs.length === 0, 'localStorage 抛异常时没有页面错误' + (errs.length ? '（' + errs[0] + '）' : ''));
    await ctx.close();
  }

  // ---------- (C) 色觉障碍：线型 ----------
  {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    G.attachErrorCollector(p);
    await p.goto(url); await p.waitForTimeout(300);
    await p.evaluate(() => { UI.App.openFree(); UI.App.act({ t: 'clear' }); });
    // 工作区：5 条线段（每条颜色不同）+ 1 个三角形（它的边也用颜色区分）
    await p.evaluate(() => {
      const A = UI.App;
      const ws = A.act({ t: 'add', type: 'gworkspace', x: 60, y: 40 }).id;
      const pt = (name, x, y) => { const n = A.act({ t: 'add', type: 'gpt', x: 0, y: 0, props: { x, y, mark: name } }).id; A.act({ t: 'rename', id: n, name }); A.act({ t: 'put', id: n, parent: ws, slot: 'items' }); return n; };
      const seg = (p1, p2) => { const s = A.act({ t: 'add', type: 'gseg', x: 0, y: 0 }).id; A.act({ t: 'link', from: p1, fromPort: 'p', to: s, toPort: 'a' }); A.act({ t: 'link', from: p2, fromPort: 'p', to: s, toPort: 'b' }); A.act({ t: 'put', id: s, parent: ws, slot: 'items' }); return s; };
      const P = [pt('A', 0, 0), pt('B', 4, 0), pt('C', 0, 3), pt('D', 6, 0), pt('E', 9, 4), pt('F', 2, 6)];
      seg(P[0], P[1]); seg(P[1], P[2]); seg(P[2], P[0]); seg(P[3], P[4]); seg(P[4], P[5]);
      const poly = A.act({ t: 'add', type: 'gpoly', x: 0, y: 0 }).id;
      for (const q of [P[3], P[5], P[1]]) A.act({ t: 'link', from: q, fromPort: 'p', to: poly, toPort: 'pts' });
      A.act({ t: 'put', id: poly, parent: ws, slot: 'items' });
      UI.Stage.fit(); UI.Stage.render();
    });
    await p.waitForTimeout(300);
    // 2026-11：平时线都是实线（好看）；打开高对比度时才按颜色换线型。先看平时，再打开高对比度检查线型
    const plain = await p.evaluate(() => [...document.querySelector('svg.wsbody').querySelectorAll('line[data-pick], path[data-pick]')].filter((el) => el.getAttribute('stroke') && el.getAttribute('stroke') !== 'transparent').map((el) => el.getAttribute('stroke-dasharray') || ''));
    ok(plain.length >= 6 && plain.every((d) => d === '' || d === '5 5'), '平时（高对比度关）：线和边都是实线（辅助线是虚线）');
    await p.evaluate(() => { document.documentElement.setAttribute('data-contrast', 'high'); UI.Stage.render(); });
    await p.waitForTimeout(200);
    // 每个线段 / 多边形边的（颜色，线型）：取可见的线和路径（透明的命中线不算）
    const strokes = await p.evaluate(() => {
      const wb = document.querySelector('svg.wsbody');
      return [...wb.querySelectorAll('line[data-pick], path[data-pick]')]
        .filter((el) => el.getAttribute('stroke') && el.getAttribute('stroke') !== 'transparent')
        .map((el) => ({ tag: el.tagName, pick: el.dataset.pick, color: el.getAttribute('stroke'), dash: el.getAttribute('stroke-dasharray') || '' }));
    });
    ok(strokes.length >= 6, '工作区里有 ' + strokes.length + ' 条可见的线或边（5 条线段 + 三角形的边）');
    const colors = new Set(strokes.map((s) => s.color));
    ok(colors.size >= 5, '颜色不同的线至少有 5 种（实际 ' + colors.size + ' 种）');
    // 两条颜色不同的线，线型必须不同
    const bad = [];
    for (let i = 0; i < strokes.length; i++) for (let j = i + 1; j < strokes.length; j++) {
      const a = strokes[i], c = strokes[j];
      if (a.color !== c.color && a.dash === c.dash) bad.push(a.pick + '(' + a.color + ')=' + c.pick + '(' + c.color + ')');
    }
    ok(bad.length === 0, '颜色不同的线，线型（stroke-dasharray）都不同' + (bad.length ? '（相同的：' + bad.slice(0, 4).join('；') + '）' : ''));
    const dashes = new Set(strokes.map((s) => s.dash));
    ok(dashes.size >= 4, '线型至少有 4 种（实线、虚线、点线、点划线等，实际 ' + dashes.size + ' 种）');
    ok(strokes.some((s) => s.tag === 'path') && strokes.some((s) => s.tag === 'line'), '线段（line）和多边形的边（path）都有线型');
    await ctx.close();
  }

  await b.close();
  console.log('主题与线型测试：' + (fail ? '不合格' : '通过') + '（' + pass + ' 通过，' + fail + ' 失败）');
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.log('主题与线型测试：不合格（脚本异常：' + e.message.split('\n')[0] + '）'); process.exit(1); });
