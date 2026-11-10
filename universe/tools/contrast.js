/* node tools/contrast.js —— 界面文字对比度检查（V1，docs/ui-geometry-feedback.md 1.1 第 5 条）。
 * 用 playwright 打开几个有代表性的页面（自由台面、几道几何题、分数题、骰子题），每个页面按 light 和 dark 两种
 * prefers-color-scheme 各跑一遍。对每一处可见文字（HTML 文字、带值的输入框、SVG <text>），算出它的实际颜色和背后的实际背景色，
 * 再按 WCAG 2 公式（sRGB 相对亮度）算对比度。
 *
 * 规则：
 *   - 普通文字（包括 12px 以下的小字）要求 >= 4.5:1，低于就失败，退出码 1；
 *   - 背景 = 文字的祖先元素背景（background-color，逐层叠加透明度）+ 同一个 SVG 里排在文字前面、且文字中心落在其填充内的图形
 *     （用 isPointInFill 判断）+ 文字自己的描边（如果有描边，当作文字身后的一圈底色）；
 *   - 颜色：getComputedStyle 已经把 var(--x) 解析成实际色值。本文件还读取 css/universe.css 的 :root 令牌，
 *     失败时在报告里写出颜色对应的令牌名；
 *   - 透明度：元素及其祖先的 opacity 连乘后作用在它的颜色和背景上（例如 .off 被压暗的器材架）。
 * 主题：universe.css 目前只有一套 :root 令牌（深色台面 + 浅色卡片），代码里没有 prefers-color-scheme 或 data-theme。
 *   检查仍按 light 和 dark 两种 colorScheme 各跑一遍；结果相同的同一处文字会在两种主题下各计一次，
 *   汇总的“去重后”数字把它们合并为一处。
 * 另外报告 12px 以下的文字数（只作提示，不计入失败）。
 * 需要 playwright：NODE_PATH 指向它的 node_modules（和 tests/ 一样）。
 * 用法：NODE_PATH=<.../node_modules> node tools/contrast.js */
'use strict';
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const MIN = 4.5;          // 普通文字的最低对比度（含小字）
const SMALL = 12;         // 小于这个字号的文字只做提示

// 代表性页面：每个页面的 setup 在页面里执行
const PAGES = [
  { name: '自由台面', setup: () => {
    UI.App.openFree(); UI.App.act({ t: 'clear' });
    const n = UI.App.act({ t: 'add', type: 'num', x: 100, y: 100, props: { n: 2 } }).id;
    const o = UI.App.act({ t: 'add', type: 'op', x: 400, y: 100 }).id;
    UI.App.act({ t: 'link', from: n, to: o, toPort: 'a' });
  } },
  { name: '平行四边形剪拼', setup: () => UI.App.openProblem('geo-pgram-cut', 'practice') },
  { name: '中线面积', setup: () => UI.App.openProblem('geo-median-area', 'practice') },
  { name: '分数加法', setup: () => UI.App.openProblem('frac-add-unlike', 'practice') },
  { name: '两个骰子', setup: () => UI.App.openProblem('two-dice', 'practice') },
  { name: '属性面板', setup: () => {
    UI.App.openFree(); UI.App.act({ t: 'clear' });
    const id = UI.App.act({ t: 'add', type: 'num', x: 200, y: 200, props: { n: 3 } }).id;
    UI.S.sel = id; UI.S.inspOpen = true; UI.Panels.renderInsp();
  } },
  { name: '对话框', setup: () => {
    UI.Panels.dialog('<h3>示例对话框</h3><p class="note-hint">说明文字</p><div class="plist"><div class="it"><span class="tt">示例条目</span></div></div><div class="btnrow"><button class="btn pri">保存</button><button class="btn">关闭</button></div>');
  } },
];
const SCHEMES = ['light', 'dark'];

// ---------- 对比度公式（WCAG 2，sRGB 相对亮度） ----------
function lum(rgb) {
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(rgb[0]) + 0.7152 * f(rgb[1]) + 0.0722 * f(rgb[2]);
}
function contrastRatio(a, b) {
  const x = lum(a), y = lum(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
const hex = (rgb) => '#' + rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
function hexToRgb(h) {
  const m = /^#([0-9a-f]{6})$/i.exec(String(h).trim());
  if (!m) return null;
  const v = parseInt(m[1], 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

// ---------- 读取 :root 令牌（把 var(--x) 链解析成色值，用来给颜色起名字） ----------
function readTokens() {
  const css = fs.readFileSync(path.join(root, 'css', 'universe.css'), 'utf8');
  const block = /:root\s*\{([^}]*)\}/.exec(css);
  const raw = {};
  if (block) for (const m of block[1].matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) raw[m[1]] = m[2].trim();
  const resolve = (v, depth) => {
    const r = /^var\(--([\w-]+)\)$/.exec(v);
    return r && raw[r[1]] && depth < 10 ? resolve(raw[r[1]], depth + 1) : v;
  };
  const rgb = {};
  for (const k of Object.keys(raw)) { const c = hexToRgb(resolve(raw[k], 0)); if (c) rgb['--' + k] = c; }
  return rgb;
}
function tokenName(tokens, rgb) {
  const hits = Object.keys(tokens).filter((k) => tokens[k].every((v, i) => Math.round(v) === rgb[i]));
  return hits.length ? hits.join('/') : '';
}

// ---------- 在页面里收集文字与背景（会被 playwright 序列化到页面执行，不能引用外部变量） ----------
function collectInPage() {
  const css = (e) => getComputedStyle(e);
  const cx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  // 把任意 CSS 颜色字符串统一成 [r,g,b,a]（a 为 0..1）
  const rgba = (s) => {
    cx.clearRect(0, 0, 1, 1); cx.fillStyle = '#000'; cx.fillStyle = s; cx.fillRect(0, 0, 1, 1);
    const d = cx.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255];
  };
  // 元素及其祖先的 opacity 连乘
  const opac = (e) => { let o = 1; for (let n = e; n && n.nodeType === 1; n = n.parentElement) o *= parseFloat(css(n).opacity); return o; };
  const shown = (e) => {
    for (let n = e; n && n.nodeType === 1; n = n.parentElement) if (css(n).display === 'none') return false;
    return e.getClientRects().length > 0 && css(e).visibility !== 'hidden' && opac(e) > 0;
  };
  // 元素自己和祖先的背景层，从外到内排列
  const layersAbove = (e) => {
    const arr = [];
    for (let n = e; n && n.nodeType === 1; n = n.parentElement) {
      const s = css(n), c = rgba(s.backgroundColor);
      if (c[3] > 0) arr.unshift({ c, o: opac(n), img: s.backgroundImage !== 'none' });
    }
    return arr;
  };
  // 同一个 SVG 里排在文字前面、且文字中心落在其填充内的图形
  const shapesBelow = (t, x, y) => {
    const svg = t.ownerSVGElement, out = [];
    if (!svg) return out;
    svg.querySelectorAll('rect,circle,ellipse,polygon,polyline,path').forEach((s) => {
      if (s === t || s.contains(t)) return;
      if (!(s.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING)) return;   // s 必须排在文字前面
      const s2 = css(s);
      if (s2.fill === 'none' || !shown(s) || typeof s.isPointInFill !== 'function') return;
      const c = rgba(s2.fill); c[3] *= parseFloat(s2.fillOpacity);
      if (c[3] <= 0) return;
      const m = s.getScreenCTM(); if (!m) return;
      if (s.isPointInFill(new DOMPoint(x, y).matrixTransform(m.inverse()))) out.push({ c, o: opac(s), img: false });
    });
    return out;
  };
  // 把一个半透明层叠在不透明底色上
  const over = (L, bot) => { const a = L.c[3] * L.o; return [0, 1, 2].map((i) => L.c[i] * a + bot[i] * (1 - a)); };
  const describe = (e) => {
    const cls = (e.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean).join('.');
    return e.tagName.toLowerCase() + (cls ? '.' + cls : '');
  };

  // 文字目标：HTML 元素（自己有直接文字，或是带值的输入框）+ SVG <text>
  const targets = [];
  document.querySelectorAll('body *').forEach((e) => {
    if (e.namespaceURI !== 'http://www.w3.org/1999/xhtml') return;
    const direct = [...e.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim()).map((n) => n.textContent.trim()).join(' ');
    const isInput = (e.tagName === 'INPUT' && !/^(button|submit|checkbox|radio|hidden|range|color|file)$/.test(e.type)) || e.tagName === 'TEXTAREA';
    const val = isInput ? (e.value || '').trim() : '';
    if (direct || val) targets.push({ e, text: direct || val, html: true });
  });
  document.querySelectorAll('svg text').forEach((e) => {
    const t = e.textContent.trim();
    if (t) targets.push({ e, text: t, html: false });
  });

  const out = [];
  for (const { e, text, html } of targets) {
    if (!shown(e)) continue;
    const s = css(e), box = e.getBoundingClientRect();
    const size = parseFloat(s.fontSize);
    let fg, bgLayers, halo = null;
    if (html) {
      fg = rgba(s.color);
      bgLayers = layersAbove(e);
    } else {
      const cx0 = (box.left + box.right) / 2, cy0 = (box.top + box.bottom) / 2;
      bgLayers = layersAbove(e).concat(shapesBelow(e, cx0, cy0));
      const sw = parseFloat(s.strokeWidth);
      if (s.stroke !== 'none' && sw > 0) { halo = rgba(s.stroke); halo[3] *= parseFloat(s.strokeOpacity); }
      if (s.fill === 'none') {
        if (!halo) continue;               // 既没填充也没描边，画不出字
        fg = halo; halo = null;
      } else {
        fg = rgba(s.fill); fg[3] *= parseFloat(s.fillOpacity);
      }
    }
    if (halo && halo[3] > 0) bgLayers.push({ c: halo, o: opac(e), img: false });
    if (fg[3] <= 0) continue;              // 透明文字不计
    let base = [255, 255, 255];
    for (const L of bgLayers) base = over(L, base);
    const fgOpaque = over({ c: fg, o: opac(e) }, base);
    out.push({
      desc: describe(e) + (e.parentElement ? ' < ' + describe(e.parentElement) : ''),
      text: text.replace(/\s+/g, ' ').slice(0, 24),
      pos: [Math.round(box.left), Math.round(box.top)],
      size,
      fg: fgOpaque.map((v) => Math.round(v)),
      bg: base.map((v) => Math.round(v)),
      bgImg: bgLayers.some((L) => L.img),
    });
  }
  return out;
}

async function run() {
  const { chromium } = require('playwright');
  const url = 'file:///' + path.join(root, 'index.html').split(path.sep).join('/');
  const tokens = readTokens();
  const b = await chromium.launch();
  const rows = [];        // 每一处文字（页面 × 主题）
  const errors = [];      // 页面报错、打开失败
  let checked = 0;
  try {
    for (const scheme of SCHEMES) {
      const ctx = await b.newContext({ colorScheme: scheme, viewport: { width: 1440, height: 900 } });
      for (const pg of PAGES) {
        const p = await ctx.newPage();
        p.on('pageerror', (e) => errors.push(pg.name + '（' + scheme + '）页面报错：' + e.message));
        try {
          await p.goto(url); await p.waitForTimeout(300);
          await p.evaluate(pg.setup); await p.waitForTimeout(250);
          const items = await p.evaluate(collectInPage);
          checked += items.length;
          for (const it of items) rows.push(Object.assign({ page: pg.name, scheme }, it));
        } catch (e) {
          errors.push(pg.name + '（' + scheme + '）打开失败：' + e.message.split('\n')[0]);
        }
        await p.close();
      }
      await ctx.close();
    }
  } finally { await b.close(); }

  // 按“页面 + 位置 + 文字 + 颜色”去重：同一处文字在两种主题下只算一处
  const keyOf = (r) => [r.page, r.desc, r.text, r.pos.join(','), r.fg.join(','), r.bg.join(',')].join('|');
  const groups = new Map();
  for (const r of rows) {
    const ratio = contrastRatio(r.fg, r.bg);
    const k = keyOf(r);
    if (!groups.has(k)) groups.set(k, { r, ratio, schemes: [] });
    groups.get(k).schemes.push(r.scheme);
  }
  const bad = [...groups.values()].filter((g) => g.ratio < MIN).sort((a, b) => a.ratio - b.ratio);
  const small = [...groups.values()].filter((g) => g.r.size < SMALL);
  const pagesN = PAGES.length, schemesN = SCHEMES.length;

  for (const g of bad) {
    const r = g.r;
    const fgTok = tokenName(tokens, r.fg), bgTok = tokenName(tokens, r.bg);
    console.log('  FAIL ' + r.page + ' | ' + g.schemes.join('/') + ' | ' + r.desc + ' | "' + r.text + '" @' + r.pos.join(',') +
      ' | ' + r.size + 'px | 文字 ' + hex(r.fg) + (fgTok ? '（' + fgTok + '）' : '') + ' 背景 ' + hex(r.bg) + (bgTok ? '（' + bgTok + '）' : '') +
      ' | 对比度 ' + g.ratio.toFixed(2) + ':1' + (r.bgImg ? ' [背景含图片或渐变，按纯色估算]' : ''));
  }
  for (const e of errors) console.log('  FAIL ' + e);
  console.log('  提示：12px 以下的文字 ' + small.length + ' 处（只作提示，不计入失败）');
  if (process.env.CONTRAST_VERBOSE) for (const g of small) console.log('        小字 ' + g.r.page + ' | ' + g.r.desc + ' | "' + g.r.text + '" @' + g.r.pos.join(',') + ' | ' + g.r.size + 'px');
  const fails = bad.length + errors.length;
  const scope = '共检查 ' + checked + ' 处文字（去重后 ' + groups.size + ' 处），' + pagesN + ' 个页面 × ' + schemesN + ' 种主题';
  if (fails) console.log('文字对比度：不合格 ' + bad.length + ' 处，' + errors.length + ' 个页面错误（' + scope + '；低于 ' + MIN + ':1）');
  else console.log('文字对比度：通过（' + scope + '；最低 ' + (groups.size ? [...groups.values()].reduce((m, g) => Math.min(m, g.ratio), Infinity).toFixed(2) : '-') + ':1）');
  return fails;
}

module.exports = { lum, contrastRatio, hexToRgb, readTokens, MIN };

if (require.main === module) {
  run().then((fails) => process.exit(fails ? 1 : 0)).catch((e) => {
    console.log('文字对比度：不合格（检查脚本异常：' + e.message.split('\n')[0] + '）');
    process.exit(1);
  });
}
