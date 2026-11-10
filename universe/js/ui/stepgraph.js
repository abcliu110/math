/* 步骤图的界面（D6，docs/direction.md 第 7 节 D6）：把 U.StepGraph 给的节点和边画成一张只读的图，放在对话框里。
 * 每个方框是一步（起点是原来的式子或图形），箭头是「用了那一步的结果」。点一个方框：调用 onJump(k)，
 * 由工作台决定怎么回到第 k 步（式子工作台：保留前 k 步；几何工作台：撤销到第 k 步之后没有新步骤为止）。
 * 这里不改台面、不改历史：只画图，点击只把请求交给工作台。 */
(function (G) {
  'use strict';
  const U = G.U, UI = (G.UI = G.UI || {}), K = U.kit, esc = K.esc;
  const NW = 196, NH = 124, COLW = 250, ROWH = 144, PAD = 20;   // 方框宽高、列距、行距、四周留白（像素，只在这个文件里用）

  // 一段文字切成不超过 max 行、每行 n 个字；超出的行末尾加省略号
  const chunks = (s, n, max) => {
    const a = Array.from(String(s || '')), out = [];
    for (let i = 0; i < a.length; i += n) out.push(a.slice(i, i + n).join(''));
    if (out.length > max) { out.length = max; out[max - 1] = out[max - 1].slice(0, n - 1) + '…'; }
    return out;
  };

  // 布局：列 = 依赖的深度（起点在第 0 列，依赖越多越靠右）；同一列里按顺序从上往下排
  function layout(nodes, edges) {
    const depth = {}, row = {}, used = {};
    for (const n of nodes) {
      let d = 0;
      for (const e of edges) if (e.to === n.id && depth[e.from] !== undefined) d = Math.max(d, depth[e.from] + 1);
      depth[n.id] = d;
    }
    const pos = {};
    let maxCol = 0, maxRow = 0;
    for (const n of nodes) {
      const c = depth[n.id];
      row[n.id] = used[c] || 0; used[c] = row[n.id] + 1;
      pos[n.id] = { x: PAD + c * COLW, y: PAD + row[n.id] * ROWH };
      maxCol = Math.max(maxCol, c); maxRow = Math.max(maxRow, row[n.id]);
    }
    return { pos, w: PAD * 2 + maxCol * COLW + NW, h: PAD * 2 + maxRow * ROWH + NH };
  }

  // 图的 SVG（只读）。方框可点，带 data-sg-node（k）和键盘焦点
  function svgOf(model) {
    const L = layout(model.nodes, model.edges), P = L.pos;
    const edges = model.edges.map((e) => {
      const a = P[e.from], b = P[e.to];
      if (!a || !b) return '';
      const x1 = a.x + NW, y1 = a.y + NH / 2, x2 = b.x, y2 = b.y + NH / 2, c = COLW / 2;
      return '<path class="sg-edge" data-sg-from="' + e.from + '" data-sg-to="' + e.to + '" d="M' + x1 + ' ' + y1 + ' C' + (x1 + c) + ' ' + y1 + ' ' + (x2 - c) + ' ' + y2 + ' ' + x2 + ' ' + y2 + '" marker-end="url(#sg-arrow)"/>';
    }).join('');
    const nodes = model.nodes.map((n) => {
      const p = P[n.id];
      const text = (n.lines || []).join('，');
      const lines = [].concat(...(n.lines || []).map((s) => chunks(s, 13, 3))).slice(0, 4);
      const note = chunks(n.note || '', 14, 1)[0] || '';
      return '<g class="sg-node" data-sg-node="' + n.k + '" role="button" tabindex="0" aria-label="' + esc(n.title + '：' + text) + '">' +
        '<title>' + esc(n.title + '：' + text + (n.note ? '（' + n.note + '）' : '')) + '</title>' +
        '<rect x="' + p.x + '" y="' + p.y + '" width="' + NW + '" height="' + NH + '" rx="10"/>' +
        '<text class="sg-t" x="' + (p.x + 12) + '" y="' + (p.y + 22) + '">' + esc(n.title) + '</text>' +
        lines.map((l, i) => '<text class="sg-l" x="' + (p.x + 12) + '" y="' + (p.y + 42 + i * 18) + '">' + esc(l) + '</text>').join('') +
        (note ? '<text class="sg-n" x="' + (p.x + 12) + '" y="' + (p.y + NH - 10) + '">' + esc(note) + '</text>' : '') +
        '</g>';
    }).join('');
    return '<svg class="sg-svg" viewBox="0 0 ' + L.w + ' ' + L.h + '" role="group" aria-label="步骤图">' +
      '<defs><marker id="sg-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="sg-arrow" d="M0 0 L10 5 L0 10 z"/></marker></defs>' +
      edges + nodes + '</svg>';
  }

  // 打开步骤图（对话框）。model：U.StepGraph 给的 { nodes, edges }；opts：{ title, onJump(k) }
  function open(model, opts) {
    const body = model.nodes.length
      ? svgOf(model)
      : '<div class="sg-none">还没有步骤。做一步之后，这里会画出步骤之间的连线。</div>';
    const hint = '<p class="sg-hint">每个方框是一步，箭头表示「用了前面那一步的结果」。点一个方框，历史回到那一步（它之后的步骤撤销掉）。这里只看，不改台面。</p>';
    UI.Panels.dialog('<h3>' + esc(opts.title) + '</h3>' + hint + body + '<div class="btnrow"><button class="btn" id="dlg-close">关闭</button></div>');
    const box = document.querySelector('#dlg .box');
    box.classList.add('sg-wide');   // 步骤图要宽一些，字才看得清（关对话框时由 UI.Panels.closeDialog 去掉）
    const go = (k) => { UI.Panels.closeDialog(); opts.onJump(k); };
    box.onclick = (e) => { const n = e.target.closest && e.target.closest('[data-sg-node]'); if (n) go(+n.dataset.sgNode); };
    box.onkeydown = (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const n = e.target.closest && e.target.closest('[data-sg-node]');
      if (n) { e.preventDefault(); go(+n.dataset.sgNode); }
    };
  }

  // 式子工作台：state 是 U.ExprBench.currentOf 给的工作台状态；onJump(k) 保留前 k 步
  function openExpr(state, onJump) {
    open(U.StepGraph.ofExpr(state), { title: '式子工作台：背后的连线', onJump });
  }
  // 几何工作台：model 是 U.StepGraph.ofScene 给的；onJump(k) 撤销到第 k 步为止
  function openScene(model, title, onJump) {
    open(model, { title: title, onJump });
  }

  UI.StepGraph = { open, openExpr, openScene, svgOf, layout };
})(typeof globalThis !== 'undefined' ? globalThis : window);
