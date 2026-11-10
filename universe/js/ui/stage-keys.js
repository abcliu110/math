/* 台面（V8，2.8）：键盘操作（工作区里）。
 *   Tab / Shift+Tab：在图形之间循环（选中下一个 / 上一个）；
 *   Enter：选中的工作区进入专注模式；选中的图形打开它的属性；
 *   方向键：移动选中的图形（格，按住 Shift 移五格）；自由点、摆放、块都是改它的坐标或 dx、dy；
 *   Delete：删除选中的图形（台面上选中卡片时仍然是删卡片，见 app.js）；
 *   Esc：取消工作区的选择（画线、剪、专注、长按菜单由它们各自的 Esc 处理，这里不管）。
 * 改数据一律走 UI.Intent.run（和鼠标一样：一次按键是一个手势，一个撤销项）。这里只决定“要做什么”，不写数据。
 * 跨文件的名字经 UI.StageCtx（SG）访问。加载顺序见 index.html。 */
(function (G) {
  'use strict';
  const U = G.U, UI = (G.UI = G.UI || {}), Q = U.Q;
  const L = UI.LAYOUT, SG = UI.StageCtx;
  const ARROWS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };   // 数学坐标：y 向上为正

  // 工作区里能用键盘选中的图形名字（去重，按画布上的顺序；隐藏的不算）
  function kbNames(wsId) {
    const ws = UI.S.scene.entities[wsId], out = [];
    if (!ws) return out;
    for (const v of SG.wsVisible(ws)) { const n = SG.pickOf(v); if (!out.includes(n)) out.push(n); }
    return out;
  }
  // 当前只选中了一个图形时它的名字
  const oneSel = () => { const s = UI.S.wsSel || []; return s.length === 1 ? s[0] : null; };
  // 台面上选中的是一张卡片（不在工作区里）：方向键、Delete 留给卡片（鼠标拖、删卡片）。在工作区里的器材（Enter 打开的属性）不算
  const cardSel = () => { const id = UI.S.sel, e = id && UI.S.scene.entities[id]; return !!e && !SG.inWs(e); };

  // Tab：循环选中。没有选中的时候，Tab 选第一个，Shift+Tab 选最后一个
  function tabMove(wsId, back) {
    const names = kbNames(wsId);
    if (!names.length) return false;
    const cur = names.indexOf(oneSel()), n = names.length;
    const next = cur < 0 ? (back ? n - 1 : 0) : (cur + (back ? n - 1 : 1)) % n;
    UI.S.sel = null; UI.S.selLink = null;
    SG.hotWs = wsId;
    SG.wsPick(names[next], false);
    SG.render();
    return true;
  }

  // 方向键：选中的图形移动 (dx, dy) 格。每个顶点的 x、y 都要在坐标范围里，否则整步不动（说明一句）
  function nudge(wsId, dx, dy) {
    const name = oneSel(), fi = name ? SG.figByName(wsId, name) : null;
    if (!fi) return false;
    const ops = [];
    if (fi.kind === 'pts') {
      for (const g of SG.uniq(fi.verts)) {
        const tx = SG.tgt(g, 'x', 'y'), nx = Q.num(Q(tx.x0)) + dx, ny = Q.num(Q(tx.y0)) + dy;   // 属性里存的是整数，先包成有理数再读
        if (nx < tx.lo[0] || nx > tx.hi[0] || ny < tx.lo[1] || ny > tx.hi[1]) { SG.setMsg('再走就出坐标范围了', false); SG.render(); return true; }
        ops.push({ id: g, k: 'x', v: nx }, { id: g, k: 'y', v: ny });
      }
    } else if (fi.kind === 'place' || fi.kind === 'piece') {
      const p = fi.ent.props, id = fi.ent.id;
      ops.push({ id, k: 'dx', v: (Number(p.dx) || 0) + dx }, { id, k: 'dy', v: (Number(p.dy) || 0) + dy });
    } else return false;
    UI.Intent.run('params', { ops });
    return true;
  }

  // Delete：删除选中的图形（它的实体：多边形、线段、点、块……）。依赖检查和确认都在意图层里
  function removeFig(wsId) {
    const name = oneSel(), fi = name ? SG.figByName(wsId, name) : null;
    if (!fi) return false;
    UI.S.wsSel = [];
    UI.Intent.run('delete', { id: fi.ent.id });
    return true;
  }

  // Enter：选中的工作区进入专注；选中的图形打开属性（和双击标题、属性按钮一样）
  function enter(wsId) {
    const S = UI.S;
    const ent = S.sel && S.scene.entities[S.sel];
    if (ent && SG.isWsDef(ent.type)) { SG.setFocus(ent.id); return true; }
    const name = oneSel(), fi = name ? SG.figByName(wsId, name) : null;
    if (!fi) return false;
    S.sel = fi.ent.id; S.selLink = null; S.inspOpen = true;
    UI.Panels.renderInsp(); SG.render();
    return true;
  }

  // 键盘事件入口（app.js 的 keydown 先调用它）。返回 true：已经处理，调用方不要再处理。
  // 复制、粘贴、编组（§10.5.9 第 3、4 条）：Ctrl+C 复制选中的图形，Ctrl+V 粘贴，Ctrl+G 编组，Ctrl+Shift+G 取消编组。
  // 没有选中图形、或没有可以粘贴的：返回 false，让浏览器照常处理（比如复制选中的文字）
  function clipKeys(e, wsId) {
    const S = UI.S, k = e.key.toLowerCase(), sel = (S.wsSel || []).length > 0;
    if (!wsId) return false;
    if (k === 'c') { if (!sel) return false; e.preventDefault(); SG.clipCopy(wsId); return true; }
    if (k === 'v') { if (!(S.wsClip || []).length) return false; e.preventDefault(); SG.clipPaste(wsId); return true; }
    if (k === 'g') { if (!sel) return false; e.preventDefault(); SG.wsGroup(wsId, !e.shiftKey); return true; }
    return false;
  }

  function keyNav(e) {
    const S = UI.S;
    if (S && (e.ctrlKey || e.metaKey) && !e.altKey && /^[cvg]$/i.test(e.key)) return clipKeys(e, SG.activeWs());
    if (!S || e.ctrlKey || e.metaKey || e.altKey) return false;
    if (SG.ctxId) { if (e.key === 'Escape') { SG.closeCtx(); return true; } return false; }
    if (e.target && e.target.tagName === 'BUTTON') return false;   // 焦点在按钮上：Enter、空格照常是按按钮
    const wsId = SG.activeWs();
    // 每个分支：先做，做成了再 preventDefault（做不成的按键照常交给浏览器和 app.js）
    let done = false;
    // M：镜像复制选中的图形（§10.5.9 第 4 条）
    if ((e.key === 'm' || e.key === 'M') && wsId && !S.wsDraw && (S.wsSel || []).length) { e.preventDefault(); SG.wsAct(wsId, 'mirror'); return true; }
    // Tab 只在用户刚在工作区里操作过（鼠标停过或按过）时才归工作区；否则照常在按钮之间移动焦点
    const hot = SG.hotWs && S.scene.entities[SG.hotWs] && SG.isWsDef(S.scene.entities[SG.hotWs].type) ? SG.hotWs : null;
    if (e.key === 'Tab') done = !!hot && !S.wsDraw && tabMove(hot, e.shiftKey);
    else if (e.key === 'Enter') done = enter(wsId);
    else if (ARROWS[e.key]) {
      // 选中卡片时方向键不动（卡片的位置由鼠标拖）
      if (wsId && !S.wsDraw && !cardSel()) { const d = e.shiftKey ? L.KEY.big : L.KEY.step; done = nudge(wsId, ARROWS[e.key][0] * d, ARROWS[e.key][1] * d); }
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      if (wsId && !cardSel() && !S.selLink && !S.wsDraw) done = removeFig(wsId);
    } else if (e.key === 'Escape') {
      // Esc 同时把工作区的焦点交还（之后 Tab 回到浏览器的焦点顺序）
      if (!S.wsDraw && !UI.State.focusedId() && ((S.wsSel || []).length || SG.hotWs)) { S.wsSel = []; SG.hotWs = null; SG.render(); done = true; }
    }
    if (done) e.preventDefault();
    return done;
  }

  Object.assign(SG, { keyNav, kbNames });
})(window);
