/* 道理地图（docs/essence-forms.md 第六节）：实验库里的一个入口，打开一个宽对话框。
 *   地图：12 个节点按 docs/essences.md 第三节那张图摆（位置、名字、一句话、箭头都在 js/core/essences.js 的 U.ESSENCE_KID / U.ESSENCE_ARROWS）。
 *   能点进去的节点（第一版只有“两边一样”）→ 它的那一页（“两边一样：四种样子”，列出四块题和先做的两块题）；
 *   其他节点灰一点，点开在地图下面列出“这个道理在哪些操作台里出现过”（从器材的 essence 字段来），点一个操作台去做它的一道题。
 * 题目那一行是 .it[data-pid]：点了由 app.js 的对话框点击统一处理（关对话框、开题）。 */
(function (G) {
  'use strict';
  const U = G.U, UI = (G.UI = G.UI || {}), esc = U.kit.esc;
  const NW = 186, NH = 76, DX = 210, DY = 116, X0 = 12, Y0 = 14, VW = 840, VH = 430;
  const box = (id) => { const k = U.ESSENCE_KID[id], w = k.span ? NW + (k.span - 1) * DX : NW, h = k.row === 3 ? 58 : NH; return { x: X0 + k.col * DX, y: Y0 + k.row * DY + (k.row === 3 ? 10 : 0), w, h }; };
  const wrap = (s, n) => { const out = []; let cur = ''; for (const ch of String(s)) { if (cur.length >= n) { out.push(cur); cur = ''; } cur += ch; } if (cur) out.push(cur); return out.slice(0, 2); };
  // 一页能点进去的页面：key → { title, say, groups: [[小标题, 题目 id 的筛选]] }
  const PAGES = {
    balance4: {
      title: '两边一样：四种样子',
      say: '同一个等式，摆成天平、式子、线段图、数轴四种样子。在哪一块上做一步，另外三块当场做同一步；只动一边，四块一起“不平”。',
      groups: [['四种样子一起做', (p) => /^ef4-/.test(p.id)], ['先两种样子', (p) => /^ef-/.test(p.id)]],
    },
  };
  // 这个道理在哪些操作台里出现过：主道理是它的排前面
  function benchesOf(id) {
    return Object.values(U.types).filter((t) => t.bench && !t.hidden && (t.essence || []).includes(id))
      .sort((a, b) => (a.essence[0] === id ? 0 : 1) - (b.essence[0] === id ? 0 : 1) || a.label.localeCompare(b.label));
  }
  // 去做这个操作台的一道题：先挑它打头的题（年级低的先），没有就挑用到它的题
  function problemOf(type) {
    const by = (a, b) => (a.grade || 9) - (b.grade || 9) || (a.rung || 0) - (b.rung || 0);
    return U.problems.filter((p) => (p.shelf || [])[0] === type && !p.custom).sort(by)[0] || U.problems.filter((p) => (p.shelf || []).includes(type) && !p.custom).sort(by)[0] || null;
  }
  function mapSvg(sel) {
    let s = '<svg class="dl-map" viewBox="0 0 ' + VW + ' ' + VH + '" width="100%" style="max-width:' + VW + 'px;display:block;margin:0 auto" xmlns="http://www.w3.org/2000/svg">';
    s += '<defs><marker id="dl-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#7a8599"/></marker></defs>';
    for (const [a, b] of U.ESSENCE_ARROWS) {
      const A = box(a), B = box(b);
      const [x1, y1, x2, y2] = U.ESSENCE_KID[a].row === U.ESSENCE_KID[b].row ? [A.x + A.w, A.y + A.h / 2, B.x - 3, B.y + B.h / 2] : [A.x + A.w / 2, A.y + A.h, B.x + B.w / 2, B.y - 3];
      s += '<line data-arrow="' + a + '-' + b + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="#7a8599" stroke-width="1.8" marker-end="url(#dl-arr)"/>';
    }
    s += '<text x="' + (VW / 2) + '" y="' + (Y0 + 3 * DY + 2) + '" text-anchor="middle" font-size="12" fill="#5f6773">下面两个横跨所有：每一条箭头都可以问“凭什么”，每一道应用题都要先变成数学题</text>';
    for (const id of U.ESSENCE_IDS) {
      const k = U.ESSENCE_KID[id], b = box(id), open = !!k.open, on = sel === id;
      const fill = open ? '#dcebfb' : on ? '#fff7e0' : '#f1f3f6', stroke = open ? 'var(--blue)' : on ? '#c08a00' : '#b8c0cc';
      s += '<g data-dl-node="' + id + '"' + (open ? ' data-open="1"' : '') + ' style="cursor:pointer"><title>' + esc(open ? '点进去：' + PAGES[k.open].title : '点一下：看这个道理在哪些操作台里出现过') + '</title>';
      s += '<rect x="' + b.x + '" y="' + b.y + '" width="' + b.w + '" height="' + b.h + '" rx="10" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + (open || on ? 2.4 : 1.4) + '"/>';
      s += '<text x="' + (b.x + 12) + '" y="' + (b.y + 24) + '" font-size="16" font-weight="700" fill="' + (open ? 'var(--ink)' : '#4a5568') + '">' + esc(k.name) + (open ? '　›' : '') + '</text>';
      wrap(k.one, Math.floor((b.w - 20) / 12.5)).forEach((ln, i) => { s += '<text x="' + (b.x + 12) + '" y="' + (b.y + 44 + i * 16) + '" font-size="12" fill="' + (open ? 'var(--ink)' : '#5f6773') + '">' + esc(ln) + '</text>'; });
      s += '</g>';
    }
    return s + '</svg>';
  }
  const row = (p) => { const b = U.Events.bestStars(p.id); return '<div class="it" data-pid="' + esc(p.id) + '"><span class="tt">' + esc(p.title) + '</span>' + (b ? '<span class="chip stars-chip">' + '★'.repeat(b) + '</span>' : '') + (p.grade ? '<span class="chip">' + p.grade + ' 年级</span>' : '') + '</div>'; };
  function infoHtml(id) {
    if (!id) return '<p class="dl-tip" style="margin:6px 4px;color:#5f6773">箭头读作：后面的道理常常要先懂前面的。第一版只有“两边一样”能点进去；别的道理点一下，看它在哪些操作台里出现过。</p>';
    const k = U.ESSENCE_KID[id], bs = benchesOf(id);
    let h = '<div class="dl-info" data-dl-info="' + id + '"><b>' + esc(k.name) + '</b>：' + esc(k.one) + '<div style="margin:6px 0 4px;color:#5f6773">这个道理在这些操作台里出现过（' + bs.length + ' 台），点一台去做它的一道题：</div><div class="plist">';
    for (const t of bs) { const p = problemOf(t.id); h += p ? '<div class="it" data-pid="' + esc(p.id) + '" data-dl-bench="' + t.id + '"><span class="tt">' + esc(t.label) + '<br><small>' + esc(p.title) + '</small></span></div>' : '<div class="it lock" data-dl-bench="' + t.id + '"><span class="tt">' + esc(t.label) + '<br><small>还没有题</small></span></div>'; }
    return h + '</div></div>';
  }
  function mapHtml(sel) {
    return '<h3 style="margin:0 0 6px">🗺️ 道理地图</h3>' + mapSvg(sel) + '<div id="dl-below" style="max-height:30vh;overflow:auto">' + infoHtml(sel) + '</div>' +
      '<div class="btnrow" style="margin-top:8px"><button class="btn" id="dlg-close">关上</button></div>';
  }
  function pageHtml(key) {
    const P = PAGES[key];
    let h = '<div data-dl-page="' + key + '"><h3 style="margin:0 0 6px">' + esc(P.title) + '</h3><p style="margin:0 0 8px">' + esc(P.say) + '</p>';
    for (const [name, f] of P.groups) h += '<div class="grp">' + esc(name) + '</div><div class="plist">' + U.problems.filter(f).map(row).join('') + '</div>';
    return h + '<div class="btnrow" style="margin-top:10px"><button class="btn" data-dl-back="1">← 回到道理地图</button><button class="btn" id="dlg-close">关上</button></div></div>';
  }
  let bound = false;
  function show(html) {
    UI.Panels.dialog(html);
    const bx = document.querySelector('#dlg .box'); if (bx) bx.classList.add('sg-wide');   // 关对话框时 closeDialog 去掉
    if (bound) return; bound = true;
    document.querySelector('#dlg').addEventListener('click', (e) => {
      const t = e.target, nd = t.closest && t.closest('[data-dl-node]');
      if (nd) { const id = nd.dataset.dlNode, k = U.ESSENCE_KID[id]; if (k.open) show(pageHtml(k.open)); else show(mapHtml(id)); return; }
      if (t.closest && t.closest('[data-dl-back]')) show(mapHtml(null));
    });
  }
  UI.Daoli = { open: () => show(mapHtml(null)), openPage: (key) => show(pageHtml(key || 'balance4')), benchesOf, problemOf, PAGES };
})(typeof globalThis !== 'undefined' ? globalThis : window);
