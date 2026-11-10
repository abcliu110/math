/* 导出图片（PNG）：把当前看到的工作区或台面画成一张 PNG，触发下载（docs/ui-geometry-feedback.md 2.12、第 3 节 V10）。
 * 两种范围：
 *   - 专注中的工作区（UI.State.focusedId()）：导出它的画布（svg.wsbody），就是屏幕上看到的那一块；
 *   - 否则导出整个台面：所有卡片（标题、标签、画布）、连线、连线上的数值。
 * 颜色和标签保留（样式在导出时从 getComputedStyle 读出来写进图里，var(--x) 都已解析）。
 * 不导出界面：按钮、把手（data-hdl、顶点把手）、透明的点击层、端口和药丸、工作区的侧栏面板、连线的 ✕ 和 ？。
 * 只读界面状态，不改台面。 */
(function (G) {
  'use strict';
  const U = G.U, UI = (G.UI = G.UI || {}), esc = U.kit.esc;
  const SVGNS = 'http://www.w3.org/2000/svg';
  const SCALE = 2;          // 像素倍数（打印用，比屏幕清楚）
  const MAX_PX = 4096;      // 最长边上限（浏览器的画布上限之内）
  const MARGIN = 16;        // 台面四周留白
  // 从界面样式里抄进图里的属性（SVG 外部图片拿不到页面的 CSS，所以要写成行内样式）
  const PROPS = ['fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin',
    'stroke-opacity', 'opacity', 'font-family', 'font-size', 'font-weight', 'paint-order', 'text-anchor', 'visibility'];

  const el = (tag, attrs) => {
    const e = document.createElementNS(SVGNS, tag);
    Object.keys(attrs || {}).forEach((k) => e.setAttribute(k, String(attrs[k])));
    return e;
  };

  // 不导出的界面元素：把手（wsHandles、wsEdges 用 data-hdl 标）、透明的点击层、顶点把手（自由点的白圈，r 4.5）、连线的点击层和流动动画
  function isChrome(e) {
    if (e.hasAttribute('data-hdl')) return true;
    if (e.getAttribute('stroke') === 'transparent') return true;
    if (e.classList.contains('hit') || e.classList.contains('flow')) return true;
    return e.tagName.toLowerCase() === 'circle' && e.hasAttribute('data-drag') && e.getAttribute('r') === '4.5';
  }

  // live 和 clone 的结构一样：逐个把 live 上算出来的样式写进 clone 的行内样式，去掉隐藏的和界面元素，去掉 var() 属性
  function copyLive(live, clone) {
    const L = [live].concat([...live.querySelectorAll('*')]), C = [clone].concat([...clone.querySelectorAll('*')]);
    for (let i = 0; i < L.length; i++) {
      const c = C[i];
      if (i > 0 && isChrome(L[i])) { c.remove(); continue; }
      const cs = getComputedStyle(L[i]);
      if (cs.display === 'none') { c.remove(); continue; }
      for (const a of [...c.attributes]) if (a.value.indexOf('var(') >= 0) c.removeAttribute(a.name);
      for (const p of PROPS) { const v = cs.getPropertyValue(p); if (v) c.style.setProperty(p, v); }
    }
  }

  // 图的底色：台面的背景色；拿不到（透明）就用页面的，再不行就白
  function solidBg() {
    const pick = (id) => { const e = document.getElementById(id) || document.body; return getComputedStyle(e).backgroundColor; };
    for (const c of [pick('stage'), getComputedStyle(document.body).backgroundColor]) {
      if (c && !/rgba\(\s*0,\s*0,\s*0,\s*0\s*\)|transparent/.test(c)) return c;
    }
    return '#ffffff';
  }

  function svgRoot(x0, y0, w, h, bg) {
    const svg = el('svg', { xmlns: SVGNS, width: w, height: h, viewBox: x0 + ' ' + y0 + ' ' + w + ' ' + h });
    svg.appendChild(el('rect', { x: x0, y: y0, width: w, height: h, fill: bg }));
    return svg;
  }

  // 工作区（专注中）：它的画布，和屏幕上看到的一样
  function workspaceJob(bg) {
    const live = document.querySelector('.wsf-main svg.wsbody');
    if (!live) throw new Error('专注中的工作区还没有画出来，请稍等一下再试');
    const W = +live.getAttribute('width'), H = +live.getAttribute('height');
    const bc = live.cloneNode(true);
    copyLive(live, bc);
    const svg = svgRoot(0, 0, W, H, bg);
    [...bc.childNodes].forEach((n) => svg.appendChild(n));
    return { svg, w: W, h: H, name: workspaceName() };
  }

  function workspaceName() {
    const id = UI.State.focusedId(), e = id && UI.S.scene.entities[id];
    return e && e.name ? e.name : '工作区';
  }

  // 台面：卡片（标题、标签、画布）、连线、连线上的数值
  function stageJob(bg) {
    const world = document.getElementById('world');
    const cards = world ? [...world.querySelectorAll(':scope > .sec > .card[data-id]')] : [];
    const links = world ? world.querySelector(':scope > .sec > svg#links') : null;
    const labels = world ? [...world.querySelectorAll(':scope > .sec > .lb')] : [];
    if (!cards.length) throw new Error('台面上还没有东西，搭一点再导出');

    // 范围：卡片、连线、数值标签
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    const grow = (x, y, w, h) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x + w); y1 = Math.max(y1, y + h); };
    cards.forEach((c) => grow(parseFloat(c.style.left), parseFloat(c.style.top), parseFloat(c.style.width), parseFloat(c.style.height)));
    const paths = links ? [...links.children].filter((p) => !isChrome(p) && !p.classList.contains('flow')) : [];
    paths.forEach((p) => { try { const b = p.getBBox(); grow(b.x, b.y, b.width, b.height); } catch (e) { /* 没有形状的路径不算 */ } });
    const labelTexts = labels.map((lb) => ({ lb, text: [...lb.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim(), x: parseFloat(lb.style.left), y: parseFloat(lb.style.top) }));
    labelTexts.forEach((t) => grow(t.x - 40, t.y - 12, 80, 24));

    const ox = x0 - MARGIN, oy = y0 - MARGIN, W = Math.max(1, x1 - x0 + 2 * MARGIN), H = Math.max(1, y1 - y0 + 2 * MARGIN);
    const svg = svgRoot(ox, oy, W, H, bg);

    // 连线（世界坐标，和卡片同一个坐标系）
    if (paths.length) {
      const g = el('g', {});
      paths.forEach((p) => { const c = p.cloneNode(true); copyLive(p, c); g.appendChild(c); });
      svg.appendChild(g);
    }

    // 卡片：圆角底色 + 标题 + 步数标记 + 画布（画布的位置 = 卡片位置 + 边框 + offset）
    cards.forEach((c) => {
      const left = parseFloat(c.style.left), top = parseFloat(c.style.top), w = parseFloat(c.style.width), h = parseFloat(c.style.height);
      const cs = getComputedStyle(c), bw = parseFloat(cs.borderTopWidth) || 0;
      svg.appendChild(el('rect', { x: left, y: top, width: w, height: h, rx: 12, fill: cs.backgroundColor, stroke: bw ? cs.borderTopColor : 'none', 'stroke-width': bw }));
      const hd = c.querySelector(':scope > .hd'), nm = hd && hd.querySelector('.nm'), bd = hd && hd.querySelector('.bd');
      if (nm) {
        const hs = getComputedStyle(nm), cy = top + (hd.offsetHeight || 28) / 2 + 5;
        const t = el('text', { x: left + 12, y: cy, fill: hs.color, 'font-size': hs.fontSize, 'font-weight': hs.fontWeight, 'font-family': hs.fontFamily });
        t.textContent = nm.textContent; svg.appendChild(t);
      }
      if (bd && bd.textContent.trim()) {
        const bs = getComputedStyle(bd), cy = top + (hd.offsetHeight || 28) / 2 + 5;
        const t = el('text', { x: left + w - 12, y: cy, 'text-anchor': 'end', fill: bs.color, 'font-size': bs.fontSize, 'font-weight': bs.fontWeight, 'font-family': bs.fontFamily });
        t.textContent = bd.textContent.trim(); svg.appendChild(t);
      }
      const bdy = c.querySelector(':scope > svg.bdy');
      if (bdy) {
        // 画布紧跟在标题栏后面（卡片没有内边距）：位置 = 卡片位置 + 边框 + 标题栏高度（SVG 元素没有 offsetLeft/Top）
        const bx = left + c.clientLeft, by = top + c.clientTop + (hd ? hd.offsetHeight : 0);
        const bc = bdy.cloneNode(true);
        copyLive(bdy, bc);
        const nested = el('svg', { x: bx, y: by, width: bdy.getAttribute('width'), height: bdy.getAttribute('height'), viewBox: bdy.getAttribute('viewBox') });
        [...bc.childNodes].forEach((n) => nested.appendChild(n));
        svg.appendChild(nested);
      }
    });

    // 连线上的数值（和线的颜色一样，用白色描边托底）
    labelTexts.forEach((t) => {
      if (!t.text) return;
      const cs = getComputedStyle(t.lb);
      const txt = el('text', { x: t.x, y: t.y + 4, 'text-anchor': 'middle', fill: cs.color, 'font-size': cs.fontSize, 'font-weight': cs.fontWeight, 'font-family': cs.fontFamily, stroke: bg, 'stroke-width': 4, 'paint-order': 'stroke' });
      txt.textContent = t.text; svg.appendChild(txt);
    });
    return { svg, w: W, h: H, name: '台面' };
  }

  // 生成导出用的 svg（不改台面）
  function build() {
    const bg = solidBg();
    return UI.State.focusedId() ? workspaceJob(bg) : stageJob(bg);
  }

  // svg → canvas → PNG。canvas 上只有 svg 图片本身，没有外部资源，不会被污染
  function toPng(job) {
    return new Promise((resolve, reject) => {
      const s = Math.min(SCALE, MAX_PX / Math.max(job.w, job.h));
      const svg = job.svg;
      svg.setAttribute('width', job.w); svg.setAttribute('height', job.h);
      const xml = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      img.onload = () => {
        const cv = document.createElement('canvas');
        cv.width = Math.ceil(job.w * s); cv.height = Math.ceil(job.h * s);
        const cx = cv.getContext('2d');
        cx.drawImage(img, 0, 0, cv.width, cv.height);
        cv.toBlob((b) => (b ? resolve(b) : reject(new Error('浏览器没有生成图片'))), 'image/png');
      };
      img.onerror = () => reject(new Error('图形没能转成图片'));
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
    });
  }

  function download(name, blob) {
    const url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function fileName(base) {
    return String(base).replace(/[\\/:*?"<>|\r\n]/g, '_').slice(0, 40) + '-' + new Date().toISOString().slice(0, 10) + '.png';
  }

  function fail(msg) {
    UI.Panels.dialog('<h3>导出图片</h3><p>' + esc(msg) + '</p><div class="btnrow"><button class="btn" id="dlg-close">知道了</button></div>');
  }

  // 菜单里的“导出图片”按钮调用这里
  function run() {
    let job;
    try { job = build(); } catch (e) { fail(e.message); return Promise.resolve(false); }
    return toPng(job).then((blob) => { download(fileName(job.name), blob); return true; }, (e) => { fail(e.message); return false; });
  }

  UI.Export = { build, toPng, run, fileName };
})(window);
