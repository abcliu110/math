/* 台面（D4 拆分）：工作区面板：工具行、选中、步骤清单、图层开关，以及工具、删除一步的动作。由 stage.js 拆出，只搬代码、不改逻辑；跨文件的名字经 UI.StageCtx（SG）访问。加载顺序见 index.html。 */
(function (G) {
  'use strict';
  const U = G.U, UI = (G.UI = G.UI || {}), W = U.World, K = U.kit, Q = U.Q;
  const $ = (s) => document.querySelector(s);
  const L = UI.LAYOUT, HD = L.HD, PORT_Y0 = L.PORT_Y0, PORT_DY = L.PORT_DY, PILL_DY = L.PILL_DY, PILL_W = L.PILL_W, MIN_W = L.MIN_W, MIN_H = L.MIN_H;
  const SG = UI.StageCtx;
  // 工作区底下的面板：工具行、选中的对象、消息、步骤历史、图层
  // dims：画布的宽高（专注模式里比卡片大）；inFocus：放在专注浮层的侧栏里，不用绝对定位
  function wsPanelHtml(ws, names, dims, inFocus) {
    const S = UI.S, g = SG.geom(ws), wd = SG.wsCfg(ws.type), hidden = UI.State.hiddenOf(ws);
    const pw = dims ? dims.w : g.w, ph = dims ? dims.h : g.h - HD;
    const vals = SG.wsValues(ws, names), steps = SG.wsSteps(ws), picks = S.wsSel || [];
    const pos = inFocus ? '' : ' style="width:' + g.w + 'px"';   // 位置由 UI.Layout.placePanels 在渲染后摆好（实测尺寸）
    let h = '<div class="wsx" data-ws="' + ws.id + '"' + pos + '>';
    // 收起/展开按钮：只在放不下、会压住卡片时显示（见 UI.Layout.placePanels）
    h += '<button class="wsx-fold" data-ws-fold="' + ws.id + '"><span class="wsx-fold-open">工作区 ▸</span><span class="wsx-fold-shut">收起 ▾</span></button>';
    const D = S.wsDraw && S.wsDraw.ws === ws.id ? S.wsDraw : null;
    // 工具说明从 UI.ToolHelp 读（悬停或聚焦时由 CSS 显示 data-tip）；没有说明的工具不带 data-tip
    h += '<div class="wsx-tools">' + wd.tools.map((t) => { const hp = UI.ToolHelp.of(t.id); return '<button data-ws-tool="' + t.id + '" data-ws="' + ws.id + '"' + (hp ? ' data-tip="' + SG.escA(hp.tip) + '"' : '') + (D && D.tool === t.id ? ' class="on" aria-pressed="true"' : '') + '>' + K.esc(t.label) + '</button>'; }).join('') +
      '<button data-ws-fit="' + ws.id + '" title="按内容选坐标范围，让图正好装下">适应</button></div>';
    h += '<div class="wsx-range">' + SG.rangeText(ws, pw, ph) + '</div>';
    h += '<div class="wsx-args">移动时：向右 <input type="number" data-ws-arg="dx" value="' + SG.escA(S.wsArgs.dx) + '"> 向上 <input type="number" data-ws-arg="dy" value="' + SG.escA(S.wsArgs.dy) + '"></div>';
    h += '<div class="wsx-sel">' + (D ? (D.tool === 'cut' ? '剪：选中要剪的图形，点两下画剪切线（Esc 退出）' : '连线：点两下画一条线（Esc 退出）') : picks.length ? '选中：' + picks.map((x) => K.esc(SG.pickLabel(x, vals))).join('、') : '点图形或点来选中（Shift 点可以多选）') + '</div>';
    // 选中的块：把手在这里（旋转、翻转、属性）；拖动是直接拖图形，R、F 键同样有效
    const pcs = SG.selPieceIds().filter((id) => S.scene.entities[id].parent === ws.id);
    if (pcs.length) h += '<div class="wsx-piece"><b>' + K.esc(pcs.length === 1 ? S.scene.entities[pcs[0]].props.name : pcs.length + ' 块') + '</b>' +
      '<button data-piece-act="turn" title="也可以按 R">转 90°</button><button data-piece-act="flip" title="也可以按 F">左右翻</button><button data-piece-act="insp">属性</button>' +
      '<span class="wsx-hint">拖动块可以移动；拖出工作区，松手就变成台面上的器材</span></div>';
    h += '<div class="wsx-foot' + (S.wsMsg ? ' bad' : '') + '">' + K.esc(S.wsMsg || '') + '</div>';
    h += '<div class="wsx-h">步骤</div>';
    if (!steps.length) h += '<div class="wsx-none">还没有步骤</div>';
    steps.forEach((st, i) => {
      const srcs = S.scene.links.filter((l) => l.to === st.id).map((l) => SG.pretty(names[l.from + '.' + l.fromPort]) || '?');
      h += '<div class="wsx-step" data-ws-step="' + st.id + '"><span>第 ' + (i + 1) + ' 步：' + K.esc(SG.stepLabel(st)) + '（' + K.esc(srcs.join('、')) + '）</span>' +
        '<button data-ws-del="' + st.id + '" title="删除这一步">✕</button></div>';
    });
    h += '<div class="wsx-h">图层</div>' + layersHtml(ws, vals, hidden);
    return h + '</div>';
  }
  // 图层列表（2.4）：图形不多（不超过 L.LAYER_FLAT）时平铺；多了就按类别分组（点、线、图形、块、辅助线），每组可以展开或收起，
  // 默认收起，列表不会随图形数量无限变长。组里的展开状态记在台面的会话状态 S.wsLayerOpen 里。类别按图形的种类和块的角色分，不按器材名。
  const LAYER_GROUPS = ['点', '线', '图形', '块', '辅助线'];
  function layerGroup(v) {
    const ent = UI.S.scene.entities[v.id];
    if (ent && SG.roleOf(ent) === 'piece') return '块';
    if (v.fig.type === 'point') return '点';
    if (v.fig.type === 'segment') return v.fig.dash ? '辅助线' : '线';
    return '图形';
  }
  function layersHtml(ws, vals, hidden) {
    if (!vals.length) return '<div class="wsx-layers"><span class="wsx-none">没有图形</span></div>';
    const box = (v) => '<label><input type="checkbox" data-ws-layer="' + SG.escA(v.key) + '" data-ws-of="' + ws.id + '"' + (hidden[v.key] ? '' : ' checked') + '> ' + K.esc(v.label) + '</label>';
    if (vals.length <= L.LAYER_FLAT) return '<div class="wsx-layers">' + vals.map(box).join('') + '</div>';
    const open = UI.S.wsLayerOpen || {};
    let h = '<div class="wsx-layers"><div class="wsx-layers-all"><button data-ws-layers="show" data-ws-of="' + ws.id + '">全部显示</button><button data-ws-layers="hide" data-ws-of="' + ws.id + '">全部隐藏</button></div>';
    for (const g of LAYER_GROUPS) {
      const items = vals.filter((v) => layerGroup(v) === g); if (!items.length) continue;
      const key = ws.id + '|' + g, on = !!open[key];
      h += '<button class="wsx-lgrp" data-ws-lgroup="' + SG.escA(key) + '" aria-expanded="' + (on ? 'true' : 'false') + '">' + (on ? '▾ ' : '▸ ') + g + '（' + items.length + '）</button>';
      if (on) h += '<div class="wsx-layers-grp">' + items.map(box).join('') + '</div>';
    }
    return h + '</div>';
  }
  // 点选：没有 Shift 就只选这一个，有 Shift 就加上 / 去掉
  function wsPick(name, shift) {
    const S = UI.S, cur = S.wsSel || [];
    S.wsSel = shift ? (cur.includes(name) ? cur.filter((x) => x !== name) : cur.concat([name])) : [name];
    S.wsMsg = '';   // 换了选择，上一条消息就不再适用
  }
  // 删除工作区里的一步（步骤清单的 ✕）：后面的步骤还用着它的结果，就不删，并在画布上说明是哪几步；
  // 剪开的那一步连它剪出来的块一起删，被剪的图形恢复显示
  function delWs(stId) {
    const S = UI.S, E = S.scene.entities, st = E[stId]; if (!st) return;
    const ws = E[st.parent]; if (!ws) return;
    const num = (x) => SG.wsSteps(ws).indexOf(x) + 1;
    const kids = S.scene.links.filter((l) => l.from === stId).map((l) => E[l.to]).filter(Boolean);
    const pieces = SG.defOf(st).splitsPieces ? kids.filter((k) => SG.roleOf(k) === 'piece') : [];
    const users = kids.filter((k) => SG.roleOf(k) !== 'piece');
    for (const pc of pieces) for (const l of S.scene.links) if (l.from === pc.id && E[l.to]) users.push(E[l.to]);
    const uniqUsers = users.filter((u, i) => users.indexOf(u) === i && SG.roleOf(u) === 'step');
    if (uniqUsers.length) {
      SG.setMsg('这一步的结果还被第 ' + uniqUsers.map(num).join('、') + ' 步用着：先删掉那些步骤，再删这一步（撤销也能回去）', false);
      return SG.render();
    }
    const src = SG.defOf(st).splitsPieces ? (S.scene.links.find((l) => l.to === stId && l.toPort === 'f') || {}).from : null;
    S.wsSel = [];
    // 连它剪出来的块一起删，被剪的图形重新显示（撤销时快照里已经是原来的样子）
    const r = UI.Intent.run('delete', { step: stId, pieces: pieces.map((pc) => pc.id), src });
    if (!r.ok) SG.setMsg(r.why, false); else SG.setMsg('', true);
    SG.render();
  }
  // 点工具：把选中的对象交给世界的 t:'tool' 动作（走 act，可以撤销）；失败就把原因放在画布上（和面板里）
  function wsRun(wsId, tool) {
    const S = UI.S, args = {}, picks = (S.wsSel || []).slice();
    const ws = S.scene.entities[wsId], T = ws && SG.wsCfg(ws.type).tools.find((x) => x.id === tool), rule = T && U.RULES[T.rule];
    // 连线、剪：没有选够两个对象，就进入「点两下画线」的模式（§10.5.8 B11）
    if ((tool === 'seg' || tool === 'cut') && picks.length !== 2) return SG.drawMode(wsId, tool);
    // 选的个数不够：先说清楚要选几个、现在选了几个（不去试，免得只在面板里说一句）
    if (rule && rule.device) {
      const fixed = rule.wire || [], need = rule.many ? Math.max(1, fixed.length) : fixed.length;
      if (rule.many ? picks.length < need : picks.length !== need) {
        SG.setMsg('「' + T.label + '」要选 ' + (rule.many ? '至少 ' : '') + need + ' 个对象，现在选了 ' + picks.length + ' 个。点图形或点来选中，Shift 点可以多选', false);
        return SG.render();
      }
    }
    if (tool === 'move') {
      const n = (v) => { const k = parseInt(v, 10); return Number.isFinite(k) ? k : 0; };
      args.dx = n(S.wsArgs.dx); args.dy = n(S.wsArgs.dy);
      if (!args.dx && !args.dy) { SG.setMsg('移动要有距离：直接拖动块，或者在「向右」「向上」里填几格再点移动', false); return SG.render(); }
    }
    // 对齐到目标：先算结论（拼对了没有、哪里不对），结论放在画布上（建步骤的同时也说给学生听）
    let verdict = null;
    if (tool === 'fit' && picks.length >= 2) {
      const rs = picks.map((n) => U.Names.resolve(S.scene, n));
      if (rs.every((x) => typeof x !== 'string' && x.value)) verdict = U.Geo.assemble(rs.slice(1).map((x) => x.value.data), rs[0].value.data);
    }
    const r = UI.Intent.run('tool', { ws: wsId, tool, picks, args });
    if (r && r.ok) {
      S.wsSel = [];
      if (verdict) SG.setMsg(verdict.ok ? verdict.why : '还没拼对：' + verdict.why, !!verdict.ok); else SG.setMsg('', true);
    } else SG.setMsg((r && r.why) || '这一步做不了', false);
    SG.render();
  }
  Object.assign(SG, { wsPanelHtml, wsPick, delWs, wsRun });
})(window);
