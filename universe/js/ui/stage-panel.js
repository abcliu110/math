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
    // 收起/展开按钮（V2）：展开时是「收起」，收起时是右下角的「工作区」；专注模式里的抽屉用标题栏的“收起抽屉”按钮
    if (!inFocus) h += '<button class="wsx-fold" data-ws-fold="' + ws.id + '"><span class="wsx-fold-open">工作区 ▸</span><span class="wsx-fold-shut">收起 ▾</span></button>';
    const D = S.wsDraw && S.wsDraw.ws === ws.id ? S.wsDraw : null;
    // 工具说明从 UI.ToolHelp 读（悬停或聚焦时由 CSS 显示 data-tip）；没有说明的工具不带 data-tip
    // 出题人控制（§10.5.9 第 10 条）：题目 tools 白名单之外的工具不显示；低年级模式另外过滤（UI.Young.showTool）
    h += '<div class="wsx-tools">' + wd.tools.filter((t) => U.problemToolAllowed(S.problem, t.id) && UI.Young.showTool(t.id)).map((t) => { const hp = UI.ToolHelp.of(t.id); return '<button data-ws-tool="' + t.id + '" data-ws="' + ws.id + '"' + (hp ? ' data-tip="' + SG.escA(hp.tip) + '"' : '') + (D && D.tool === t.id ? ' class="on" aria-pressed="true"' : '') + '>' + K.esc(t.label) + '</button>'; }).join('') +
      '<button data-ws-fit="' + ws.id + '" title="按内容选坐标范围，让图正好装下">适应</button></div>' + (wd.tools.length && !UI.Young.get() ? '<div class="wsx-measure">' + SG.measureBtns(ws.id) + '</div>' : '');   // 尺子、量角器单独一行（不是器材声明的工具）；低年级模式不显示
    h += '<div class="wsx-range">' + SG.rangeText(ws, pw, ph) + '</div>';
    h += '<div class="wsx-args">移动时：向右 <input type="number" data-ws-arg="dx" value="' + SG.escA(S.wsArgs.dx) + '"> 向上 <input type="number" data-ws-arg="dy" value="' + SG.escA(S.wsArgs.dy) + '"></div>';
    h += '<div class="wsx-sel">' + (D ? (D.tool === 'cut' ? '剪：选中要剪的图形，点两下画剪切线（Esc 退出）' : '连线：点两下画一条线（Esc 退出）') : picks.length ? '选中：' + picks.map((x) => K.esc(SG.pickLabel(x, vals))).join('、') : '点图形或点来选中（Shift 点可以多选）') + '</div>';
    // 选中的块：把手在这里（旋转、翻转、属性）；拖动是直接拖图形，R、F 键同样有效
    const pcs = SG.selPieceIds().filter((id) => S.scene.entities[id].parent === ws.id);
    if (pcs.length) h += '<div class="wsx-piece"><b>' + K.esc(pcs.length === 1 ? S.scene.entities[pcs[0]].props.name : pcs.length + ' 块') + '</b>' +
      '<button data-piece-act="turn" title="也可以按 R">转 90°</button><button data-piece-act="flip" title="也可以按 F">左右翻</button><button data-piece-act="insp">属性</button>' +
      '<span class="wsx-hint">拖动块可以移动；拖出工作区，松手就变成台面上的器材</span></div>';
    h += propsHtml(ws, vals, picks);
    h += '<div class="wsx-foot' + (S.wsMsg ? ' bad' : '') + '">' + K.esc(S.wsMsg || '') + '</div>';
    h += '<div class="wsx-h">步骤 <button data-ws-graph="' + ws.id + '" title="看每一步的连线：剪、移、拼各用了哪一步的结果（只看，点一步回到那一步）">看背后的连线</button></div>';
    if (!steps.length) h += '<div class="wsx-none">还没有步骤</div>';
    steps.forEach((st, i) => {
      const srcs = S.scene.links.filter((l) => l.to === st.id).map((l) => SG.pretty(names[l.from + '.' + l.fromPort]) || '?');
      h += '<div class="wsx-step" data-ws-step="' + st.id + '"><span>第 ' + (i + 1) + ' 步：' + K.esc(SG.stepLabel(st)) + '（' + K.esc(srcs.join('、')) + '）</span>' +
        '<button data-ws-del="' + st.id + '" title="删除这一步" aria-label="删除这一步">✕</button></div>';
    });
    h += '<div class="wsx-h">图层</div>' + layersHtml(ws, vals, hidden);
    return h + '</div>';
  }
  // 放常见图形：一排按钮，点一下在当前视野的中央放一个（已经有图形就错开一点）。放进来的是自由点和多边形：顶点可拖，里面能画辅助线
  const plain = (t) => t.label.replace('（可编辑）', '');
  function shapesHtml(ws) {
    const list = U.Shapes ? U.Shapes.LIST : []; if (!list.length) return '';
    const grp = (n) => list.filter((t) => t.pts.length === n).map((t) => '<button data-ws-shape="' + t.id + '" data-ws="' + ws.id + '" title="放一个' + SG.escA(plain(t)) + '：顶点可以拖，里面可以画辅助线">' + K.esc(plain(t)) + '</button>').join('');
    return '<details class="shape-menu"><summary title="放一个图形：三角形、长方形、梯形、菱形……">图形 ▾</summary><div class="shape-pop"><div><span class="wsx-lbl">三角形</span>' + grp(3) + '</div><div><span class="wsx-lbl">四边形</span>' + grp(4) + '</div></div></details>';
  }
  function wsAddShape(wsId, type) {
    const S = UI.S, ws = S.scene.entities[wsId]; if (!ws || !U.types[type]) return;
    const g = SG.geom(ws), fr = SG.wsFrame(ws, g.w, g.h - HD);
    const n = SG.wsVisible(ws).filter((v) => v.fig.type === 'polygon').length, off = [[0, 0], [-3, 2], [3, -2], [-2, -3], [3, 3]][n % 5];
    const r = UI.Intent.run('shape', { ws: wsId, type, x: Math.round(fr.vw.cx) + off[0], y: Math.round(fr.vw.cy) + off[1] });
    if (r && r.ok === false) SG.setMsg(r.why || '放不进去', false); else SG.setMsg('', true);
    SG.render();
  }
  // 选中一个图形：它是什么图形（精确判断，改了顶点会跟着变）、边长、面积、周长；自由点围成的，还能直接改顶点坐标
  function propsHtml(ws, vals, picks) {
    if (picks.length !== 1 || !U.Shapes) return '';
    const v = vals.find((x) => SG.pickOf(x) === picks[0]);
    if (!v || !v.fig || v.fig.type !== 'polygon') return '';
    const d = U.Shapes.describe(v.fig); if (!d) return '';
    const fi = SG.figInfo(v);
    let h = '<div class="wsx-props"><b>' + K.esc(d.name) + '</b>' + (d.facts.length ? '<span class="wsx-facts">' + K.esc(d.facts.join('；')) + '</span>' : '');
    h += '<div>面积 ' + K.esc(d.area) + '　周长 ' + K.esc(d.perim) + '</div><div>边长 ' + K.esc(d.sides.join('、')) + '</div>';
    if (fi && fi.kind === 'pts') {
      const E = UI.S.scene.entities, rows = SG.uniq(fi.verts).map((id) => {
        const p = E[id]; if (!p) return '';
        const inp = (k) => '<input type="number" min="-10" max="10" step="1" data-ws-vx="' + id + '" data-ws-vk="' + k + '" value="' + SG.escA(p.props[k]) + '" aria-label="' + SG.escA((p.props.mark || '点') + ' 的 ' + k) + '">';
        return '<label class="wsx-vx">' + K.esc(p.props.mark || '点') + '（' + inp('x') + '，' + inp('y') + '）</label>';
      });
      h += '<div class="wsx-vxs">顶点：' + rows.join('') + '</div>';
    }
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
    // 组里的图形：点一个，整组一起选中（按住 Shift 点只加上或去掉这一个，§10.5.9 第 3 条）
    S.wsSel = shift ? (cur.includes(name) ? cur.filter((x) => x !== name) : cur.concat([name])) : groupNamesOf(name);
    S.wsMsg = '';   // 换了选择，上一条消息就不再适用
  }
  // 这个图形所在组的全部图形的名字（没有编组就只有它自己）
  function groupNamesOf(name) {
    for (const ws of Object.values(UI.S.scene.entities)) {
      if (!SG.isWsDef(ws.type)) continue;
      const fi = SG.figByName(ws.id, name); if (!fi || !fi.ent.group) continue;
      const gid = fi.ent.group;
      return SG.wsVisible(ws).filter((v) => { const x = SG.figInfo(v); return !!x && x.ent.group === gid; }).map((v) => SG.pickOf(v));
    }
    return [name];
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
    // 尺子、量角器：不是工具（不建步骤、不改图形），直接放一个标记（stage-measure.js）
    if (tool === 'ruler' || tool === 'protractor') return SG.addMark(wsId, tool);
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
  // ---- 浮动工具条（V2，1.2 第 2 条）：贴在画布上方，放连线、剪、删除、撤销和全屏；全部工具仍在抽屉里（移动、旋转……） ----
  // 专注模式的标题栏里也用这一组按钮（同一份标记）
  function barTools(ws) {
    const D = UI.S.wsDraw && UI.S.wsDraw.ws === ws.id ? UI.S.wsDraw : null;
    const btn = (id, label, tip) => '<button data-fbar="' + id + '" data-ws="' + ws.id + '"' + (D && D.tool === id ? ' class="on" aria-pressed="true"' : '') + ' title="' + SG.escA(tip) + '">' + label + '</button>';
    // 连线会自己找顶点、中点、垂足、交点；复制、旋转、翻转、删除作用在选中的图形上，没选就点一下要操作的图形（或只有一个图形时就是它）
    const A = UI.S.wsArm && UI.S.wsArm.ws === ws.id ? UI.S.wsArm.act : null;
    const acBtn = (id, label, tip) => '<button data-fbar="' + id + '" data-ws="' + ws.id + '"' + (A === id ? ' class="on" aria-pressed="true"' : '') + ' title="' + SG.escA(tip) + '">' + label + '</button>';
    return '<span class="fbar-tools">' + btn('seg', '连线', '连线（L）：拖出一条线，会自动吸到顶点、中点、垂足、交点；也可以点两下') + btn('cut', '剪', '剪（C）：先选一个图形，再拖出一条剪切线') +
      '<span class="wsmini-sep"></span>' + shapesHtml(ws) + acBtn('copy', '复制', '复制选中的图形（Ctrl+D；Ctrl+C 后 Ctrl+V 粘贴）') + acBtn('mirror', '镜像', '镜像复制选中的图形（M）：副本贴着它的右边，左右对称') + btn('group', '编组', '把选中的图形编成一组（Ctrl+G）：点一个，两个一起选中、一起拖动；Ctrl+Shift+G 取消编组') + acBtn('rot', '旋转', '把选中的图形转 90°（R）') + acBtn('flip', '翻转', '把选中的图形左右翻转（F）') +
      lockHtml(ws) + btn('del', '删除', '删除选中的图形或步骤（Delete）') + btn('undo', '撤销', '撤销上一步') +
      '<span class="wsmini-sep"></span>' + snapBtn(ws) + '</span>';
  }
  // 多选对齐与等距分布（§10.5.9 第 3 条）：这个工作区里选中两个以上的图形时，在主工具条上方再出一条对齐工具条（主工具条已经放满，不能挤进去）；
  // 每个按钮是一步撤销。收起工具条时不出现。
  function alignBar(ws, pos) {
    if (UI.Chrome.barShut() || !pos || (UI.S.wsSel || []).filter((n) => SG.figByName(ws.id, n)).length < 2) return '';
    const b = (op, label, tip) => '<button data-fbar="al-' + op + '" data-ws="' + ws.id + '" title="' + SG.escA(tip) + '">' + label + '</button>';
    const html = b('l', '左齐', '左对齐：所有选中的图形左边缘对齐到最左的那个') + b('r', '右齐', '右对齐：右边缘对齐到最右的那个') +
      b('t', '顶齐', '顶对齐：上边缘对齐到最高的那个') + b('b', '底齐', '底对齐：下边缘对齐到最低的那个') +
      b('hc', '水平居中', '水平居中：中心的横坐标对齐') + b('vc', '垂直居中', '垂直居中：中心的纵坐标对齐') +
      b('dh', '水平等距', '水平等距：两端不动，中间的横向间距相等（至少三个，间距要是整数格）') +
      b('dv', '垂直等距', '垂直等距：两端不动，中间的纵向间距相等（至少三个，间距要是整数格）');
    const top = pos.y - (UI.LAYOUT.BAR.h + UI.LAYOUT.BAR.gap);
    return '<div class="fbar wsalign" role="toolbar" aria-label="对齐与分布" data-wsalign="' + ws.id + '" style="left:' + pos.x + 'px;top:' + top + 'px">' + html + '</div>';
  }
  // 锁长 / 锁直角（§10.5.9 第 1 条）：选中一条线段或一个多边形时才有；按钮的字就是它现在能做的事
  function lockHtml(ws) {
    const T = SG.lockTarget(ws.id); if (!T) return '';
    return '<button data-fbar="lock" data-ws="' + ws.id + '" title="' + SG.escA(T.tip) + '">' + T.label + '</button>';
  }
  // 吸附开关（V4，§1.3 第 4 条）：关了，拖动和画线都不吸附到中点、交点、垂足；按住 Alt 暂时不吸附（和开关无关）
  function snapBtn(ws) {
    const on = UI.S.snapOn !== false;
    return '<button data-fbar="snap" data-ws="' + ws.id + '"' + (on ? ' class="on" aria-pressed="true"' : ' aria-pressed="false"') + ' title="' + SG.escA(on ? '吸附：拖动和画线靠近中点、交点、垂足时吸附（关掉以后不吸附；按住 Alt 也暂时不吸附）' : '吸附已关：拖动和画线不吸附（再点一下打开）') + '">吸附</button>';
  }
  // 浮动条的整块：收起时只剩一个“工具”按钮（偏好记在 UI.Chrome 里）
  // pos：浮动条在台面局部像素里的位置（画布上方）；专注标题栏里没有位置
  // 快捷图形（原来的画布迷你工具条里的四个，和抽屉里的“放一个图形”是同一批）
  // 选择（V）、快捷图形、连线、剪、删除、撤销、全屏：只有这一条工具条（原来的迷你工具条和它重复，已并进来）
  function barHtml(ws, pos) {
    const shut = UI.Chrome.barShut(), D = UI.S.wsDraw && UI.S.wsDraw.ws === ws.id ? UI.S.wsDraw : null;
    const quick = '<span class="fbar-quick"><button data-ws-mode="select" data-ws="' + ws.id + '"' + (!D ? ' class="on" aria-pressed="true"' : '') + ' title="选择、拖动点和图形（V）">选择 <kbd>V</kbd></button><span class="wsmini-sep"></span></span>';
    return alignBar(ws, pos) + '<div class="fbar wsmini' + (shut ? ' shut' : '') + '" data-wsbar="' + ws.id + '"' + (pos ? ' style="left:' + pos.x + 'px;top:' + pos.y + 'px"' : '') + '>' +
      '<button class="fbar-fold" data-fbar="fold" data-ws="' + ws.id + '" title="' + (shut ? '展开工具条' : '收起工具条') + '">' + (shut ? '工具 ▸' : '▾') + '</button>' +
      quick + barTools(ws) +
      '<button data-fbar="focus" data-ws="' + ws.id + '" title="放大到台面的全部，再点一次或按 Esc 还原">全屏</button></div>';
  }
  // 删除：删的是选中的步骤（连同它的结果，见 delWs）或选中的图形；没有选中就说明一下
  function barDelete(wsId) {
    const S = UI.S, id = S.sel, e = id && S.scene.entities[id];
    if (e && e.parent === wsId && SG.roleOf(e) === 'step') return delWs(id);   // 选中的步骤：连同它的结果一起删
    return SG.wsAct(wsId, 'del');   // 图形：选中的，或点一下要删的
  }
  // 浮动条和专注标题栏的按钮：走的还是原来的入口（连线、剪走工具，撤销走撤销按钮，删除走步骤清单的删除）
  function barAction(el) {
    const a = el.dataset.fbar, wsId = el.dataset.ws || UI.State.focusedId();
    if (a === 'fold') { UI.Chrome.toggleBar(); return SG.render(); }
    if (a === 'side') { UI.Chrome.toggleFocusSide(); return SG.render(); }
    if (a === 'focus') return SG.setFocus(UI.State.focusedId() ? null : wsId);
    if (a === 'seg' || a === 'cut') return SG.wsRun(wsId, a);
    if (a === 'del') return barDelete(wsId);
    if (a === 'copy' || a === 'mirror' || a === 'rot' || a === 'flip') return SG.wsAct(wsId, a);
    if (a === 'group') return SG.wsGroup(wsId, true);
    if (a.indexOf('al-') === 0) return SG.alignWs(wsId, a.slice(3));
    if (a === 'undo') { const u = document.getElementById('undo'); if (u) u.click(); }
    if (a === 'lock') return SG.wsLock(wsId);
    if (a === 'snap') { UI.S.snapOn = UI.S.snapOn === false; return SG.render(); }
  }
  // 看背后的连线（D6）：步骤图只读；点一步，撤销到那一步为止（之后的步骤撤掉）。撤销用的是台面的撤销按钮，历史照常记录
  function openGraph(wsId) {
    const S = UI.S, ws = S.scene.entities[wsId]; if (!ws) return;
    const names = SG.wsNames();
    const model = U.StepGraph.ofScene(S.scene, SG.wsSteps(ws), {
      label: (st) => SG.stepLabel(st),
      srcName: (l) => SG.pretty(names[l.from + '.' + l.fromPort]) || '',
    });
    UI.StepGraph.openScene(model, '几何工作区：背后的连线', (k) => wsGoto(wsId, k));
  }
  // 撤销到第 k 步为止：一直撤销，直到这个工作区的步骤只剩 k 步（或没有可撤的了）
  function wsGoto(wsId, k) {
    const btn = document.getElementById('undo');
    for (let guard = 0; guard < 1000 && btn && !btn.disabled; guard++) {
      const ws = UI.S.scene.entities[wsId];
      if (!ws || SG.wsSteps(ws).length <= k) break;
      btn.click();
    }
    SG.render();
  }
  Object.assign(SG, { wsPanelHtml, wsPick, delWs, wsRun, wsAddShape, barTools, barHtml, barDelete, barAction, openGraph, wsGoto });
})(window);
