/* 台面：联动组（js/core/forms.js，docs/essence-forms.md）的台面：卡片自动排版、共用步骤栏、刚改的地方闪一下。跨文件的名字经 UI.StageCtx（SG）访问。
 *
 * 排版（fitGroup，台面适应时调用；UI.benchGroup() 有值时才用）：联动组的几台卡片不用手拖，按下面的规则摆好、定缩放：
 *   1. 候选排法按先后试：两台“左右排”→“上下排”；三台以上“每行两台”（四台就是 2×2，第二行的两台也试一下换位置）→“上下排”。
 *   2. 每种排法算出台面放得下时的缩放 z = min(maxZ, 可用宽 / 总宽, 可用高 / 总高)。可用高要让开顶上的提示条、底下的按钮栏和共用步骤栏。
 *   3. 第一个 z ≥ minZ（LAYOUT.GROUP，最低可读的缩放）的排法就用它，整个放进台面、居中。
 *   4. 都不到 minZ：不再缩小，改成“一屏放不下，上下滚”：选列数最多、只按宽算也 ≥ minZ 的排法（都不行就上下排），
 *      缩放就用 minZ（反正要滚，一屏看到的最多；窗口窄到连 minZ 都放不下一列时按宽算），卡片从顶上排下去；滚轮上下滚台面（Ctrl + 滚轮照旧缩放）。
 *   卡片的位置写在实体的 x、y 上（和孩子拖卡片一样是世界数据）；同样的窗口、同样的卡片尺寸排出来总是一样，撤销回去也一样。
 *   卡片变高变宽（比如式子多写了一行）时再排一次（keepGroup），“上下滚”时保留滚到的位置。
 *
 * 共用步骤栏（renderStepBars）：每个联动组一条，在台面下方、按钮栏上面；读 scene.groups[].log（不另存），写最近 GROUP.steps 步：
 *   “第 3 步：两边同时减 2（在线段图上做的）”。只动一边（balance.lone）、挪过去（balance.move）的步子会让两边不再相等，标红。
 *
 * 闪一下（flashOf）：一步做完，UI.App.tx 从内核的 settle 拿到这一步，记下 S.flash = { gid, by, s0, s1, step, t0 }（会话状态：
 *   不进存档、不进撤销；撤销、重做、换题时清掉）。渲染时组里除了做这一步的那台（by），每台的 draw 拿到
 *   c.flash = { s0, s1, step, age }：s0、s1 是这一步前后组的状态（lineq 就是 a、b、c、d、x0），age 是过了多少毫秒。
 *   器材自己画出刚变的部分（天平少掉的砝码、式子新的一行、线段图剪掉的那截、数轴落点移过去的弧），用 U.kit.flash 包起来，
 *   CSS 动画 1 秒左右淡出。过了 GROUP.flashMs 就不再交给 draw。重放、撤销、换题不经过 tx 的 settle，所以不会闪。 */
(function (G) {
  'use strict';
  const U = G.U, UI = G.UI, K = U.kit, L = UI.LAYOUT, GL = L.GROUP, SG = UI.StageCtx;

  // ---------- 闪一下 ----------
  function flashOf(e) {
    const S = UI.S, f = S.flash; if (!f || f.by === e.id) return null;
    const g = (S.scene.groups || []).find((x) => x.id === f.gid); if (!g || !g.members.includes(e.id)) return null;
    const age = Date.now() - f.t0; if (age < 0 || age > GL.flashMs) return null;
    return { s0: f.s0, s1: f.s1, step: f.step, age };
  }

  // ---------- 排版 ----------
  // 按列数 cols 一行一行排：每列宽 = 这一列最宽的卡片，每行高 = 这一行最高的卡片；卡片在自己的格子里左右居中、靠上
  function arrange(es, cols) {
    const gs = es.map((e) => SG.geom(e)), rows = Math.ceil(es.length / cols), colW = [], rowH = [];
    gs.forEach((g, i) => { const c = i % cols, r = Math.floor(i / cols); colW[c] = Math.max(colW[c] || 0, g.w); rowH[r] = Math.max(rowH[r] || 0, g.h); });
    const W = colW.reduce((a, b) => a + b, 0) + GL.gap * (colW.length - 1), H = rowH.reduce((a, b) => a + b, 0) + GL.gap * (rows - 1), pos = {};
    gs.forEach((g, i) => {
      const c = i % cols, r = Math.floor(i / cols);
      const x = colW.slice(0, c).reduce((a, b) => a + b, 0) + GL.gap * c, y = rowH.slice(0, r).reduce((a, b) => a + b, 0) + GL.gap * r;
      pos[es[i].id] = { x: x + (colW[c] - g.w) / 2, y };
    });
    return { W, H, pos, cols };
  }
  // 候选排法：[列数, 卡片顺序]，按先后
  function candidates(es) {
    const n = es.length, out = [];
    if (n === 2) out.push([2, es]);
    else if (n >= 3) {
      out.push([2, es]);
      if (n === 4) out.push([2, [es[0], es[1], es[3], es[2]]]);   // 第二行的两台换一下位置，常常能窄一些
    }
    out.push([1, es]);
    return out;
  }
  // 可用的屏幕区域：左右留 padX；上面躲开提示条；下面躲开按钮栏和共用步骤栏
  function room() {
    const r = SG.stageEl.getBoundingClientRect(), top = L.FIT_TOP_MIN + L.FIT_TOP_NUDGE;
    const bottom = UI.Layout.bottomReserve(SG.stageEl, GL.barGap) + GL.barH + GL.barGap;
    return { r, top, bottom, w: r.width - 2 * GL.padX, h: r.height - top - bottom };
  }
  const sigOf = (es, R) => es.map((e) => { const g = SG.geom(e); return e.id + ':' + g.w + 'x' + g.h; }).join(',') + '|' + Math.round(R.r.width) + 'x' + Math.round(R.r.height);
  // o.keep：保留“上下滚”时滚到的位置（卡片尺寸变了再排一次时用）
  function fitGroup(o) {
    const S = UI.S, g = UI.benchGroup(); if (!g) return false;
    const es = g.members.map((id) => S.scene.entities[id]).filter(Boolean), R = room();
    let pick = null, over = null;
    for (const [cols, order] of candidates(es)) {
      const a = arrange(order, cols), zw = Math.min(GL.maxZ, R.w / a.W), z = Math.min(zw, R.h / a.H);
      if (z >= GL.minZ) { if (!pick || (pick.a.cols === cols && z > pick.z)) pick = { a, z }; continue; }
      if (pick) break;
      if (zw >= GL.minZ && (!over || (over.a.cols === cols && a.W < over.a.W))) over = { a, z: GL.minZ };   // 反正要滚：用最低可读的缩放，一屏看到的最多
    }
    const fits = !!pick;
    if (!pick) pick = over || (() => { const a = arrange(es, 1); return { a, z: Math.min(GL.minZ, R.w / a.W) }; })();
    const a = pick.a, z = pick.z, Sp = UI.Space;
    for (const e of es) { e.x = a.pos[e.id].x; e.y = a.pos[e.id].y; }
    const left = (R.r.width - Sp.scaleLen(a.W, z)) / 2, top = R.top + (fits ? Math.max(0, (R.h - Sp.scaleLen(a.H, z)) / 2) : 0);
    const old = S.view, v = Sp.viewAt(z, { x: 0, y: 0 }, { x: left, y: top });
    // 上下滚：最上面是 top（卡片顶边在提示条下面），最下面是最后一行的底边到可用区域的底边
    SG.groupScroll = fits ? null : { max: top, min: Math.min(top, R.top + R.h - Sp.scaleLen(a.H, z)) };
    if (o && o.keep && !fits && old && old.z === z) v.y = Math.max(SG.groupScroll.min, Math.min(SG.groupScroll.max, old.y));
    S.view = v; SG.groupLayout = { cols: a.cols, fits, z }; SG.groupSig = sigOf(es, R);
    return true;
  }
  // 卡片尺寸或台面尺寸变了：再排一次（只在视图是适应出来的时候）；返回 true 表示视图变了
  function keepGroup() {
    const S = UI.S, g = UI.benchGroup(); if (!g || !S.viewAuto) return false;
    const es = g.members.map((id) => S.scene.entities[id]).filter(Boolean);
    if (sigOf(es, room()) === SG.groupSig) return false;
    fitGroup({ keep: true }); return true;
  }
  // 滚轮上下滚（“上下滚”排法时）：返回 true 表示处理了
  function scrollGroup(dy) {
    const S = UI.S, sc = SG.groupScroll; if (!sc || !UI.benchGroup()) return false;
    S.view = Object.assign({}, S.view, { y: Math.max(sc.min, Math.min(sc.max, S.view.y - dy)) });
    SG.render(); return true;
  }

  // ---------- 共用步骤栏 ----------
  const byName = (S, id) => { const e = S.scene.entities[id], d = e && U.types[e.type]; return d ? d.prefix || d.label : '另一台'; };
  function stepBarHtml(S, g) {
    const log = g.log || [], from = Math.max(0, log.length - GL.steps);
    let h = '<div class="stepbar" data-stepbar="' + K.esc(g.id) + '" style="height:' + GL.barH + 'px"><div class="sbh">步骤：' + g.members.length + ' 台说的是同一个等式，在哪一台做一步，其他台跟着做同一步</div>';
    if (!log.length) h += '<div class="sbr">还没做步子：在任意一台上做一步试试。</div>';
    for (let i = from; i < log.length; i++) {
      const s = log[i], bad = s.rule === 'balance.lone' || s.rule === 'balance.move';
      h += '<div class="sbr' + (i === log.length - 1 ? ' now' : '') + (bad ? ' lone' : '') + '" data-step="' + (i + 1) + '">第 ' + (i + 1) + ' 步：' + K.esc(s.label) + '（在' + K.esc(byName(S, s.by)) + '上做的）' + (bad ? '　两边不再相等' : '') + '</div>';
    }
    return h + '</div>';
  }
  function renderStepBars() {
    const S = UI.S; if (!SG.stageEl) return;
    let el = SG.stepBarsEl;
    if (!el) { el = SG.stepBarsEl = document.createElement('div'); el.id = 'stepbars'; SG.stageEl.appendChild(el); }
    const gs = (!UI.State.focusedId() && S.scene.groups) || [];
    const html = gs.map((g) => stepBarHtml(S, g)).join('');
    if (SG.stepBarsHtml !== html) { el.innerHTML = html; SG.stepBarsHtml = html; }
    el.style.display = html ? '' : 'none';
    if (html) el.style.bottom = UI.Layout.bottomReserve(SG.stageEl, GL.barGap) + 'px';
  }

  Object.assign(SG, { flashOf, fitGroup, keepGroup, scrollGroup, renderStepBars, groupScroll: null });
})(window);
