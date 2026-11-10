/* 台面（D4 拆分）：台面共用部分：共用的可变状态、几何、工作区的基础判断（不画、不改）。由 stage.js 拆出，只搬代码、不改逻辑；跨文件的名字经 UI.StageCtx（SG）访问。加载顺序见 index.html。 */
(function (G) {
  'use strict';
  const U = G.U, UI = (G.UI = G.UI || {}), W = U.World, K = U.kit, Q = U.Q;
  const $ = (s) => document.querySelector(s);
  const L = UI.LAYOUT, HD = L.HD, PORT_Y0 = L.PORT_Y0, PORT_DY = L.PORT_DY, PILL_DY = L.PILL_DY, PILL_W = L.PILL_W, MIN_W = L.MIN_W, MIN_H = L.MIN_H;
  const SG = UI.StageCtx = { stageEl: null, worldEl: null, focusEl: null, drag: null, linking: null, lastClick: { id: null, t: 0 }, dblKey: null, dblT: 0, wsPress: null, wsCyc: null, msgTimer: 0 };   // 台面各模块共用的可变状态，用 SG.xxx 读写

  const def = (e) => U.types[e.type];
  // 大小：实体上的 e.w、e.h（拖柄改的）优先，没有才用器材的 size()（§10.5.8 A1）
  const geom = (e) => { const sz = def(e).size(e); return { x: e.x, y: e.y, w: e.w > 0 ? e.w : sz[0], h: e.h > 0 ? e.h : sz[1] }; };
  // 同一个东西 400 毫秒内按两次：返回 true，并忘掉这一次，免得第三下又算一次
  function dbl(key) { const now = Date.now(); if (SG.dblKey === key && now - SG.dblT < 400) { SG.dblKey = null; return true; } SG.dblKey = key; SG.dblT = now; return false; }
  const SIGLV = ['err', 'reject', 'warn', 'ok', 'info'];

  // ---------- 几何工作区（任务 H1，§10.5）----------
  // 工作区里的器材不显示成卡片；它们输出的 fig / figs 画在工作区的画布里，带名字，可以选、可以拖（自由点）。
  // 器材在工作区里是什么角色、叫什么、剪开要不要画块，都由器材定义声明（workspaceRole、stepLabel、splitsPieces…，见 js/core/registry.js）。
  // 界面不认具体器材名：加一种新器材，只写它自己的声明。
  const defOf = (e) => (e && U.types[e.type]) || {};
  const roleOf = (e) => U.roleOf(e);
  // 点名与图形配色：深色一组，白底（卡片）上文字对比度都 >= 4.5:1（V1，tools/contrast.js）
  const WS_COL = ['#1d4ed8', '#c2410c', '#047857', '#7e22ce', '#b91c1c'];
  // 线型（V10，2.6b）：颜色之外的第二种区分手段。颜色按序号 i % 5 轮换，线型也按 i % 5 轮换，所以颜色不同的线线型一定不同。
  //   “线”（实线家族）和“辅助线”（虚线家族，f.dash）两组的线型互不相同，两种线也分得开。
  const LINE_DASH = {
    line: ['', '2 3', '10 3 2 3', '16 5 2 5', '1 4'],    // 实线、点线、点划线、长划点线、稀点线
    aux: ['6 4', '9 4', '4 2 1 2', '12 3 3 3', '3 6'],    // 虚线家族（辅助线）
  };
  const escA = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const numOf = (id) => +String(id).slice(1);
  // 容器：workspaceRole 为 container 的器材。它的显示和工具写在 workspace 配置里，没写的按默认（显示图形、没有工具）
  const isWsDef = (type) => !!(U.types[type] && U.types[type].workspaceRole === 'container');
  const wsCfg = (type) => U.types[type].workspace || { shows: ['fig', 'figs'], tools: [] };
  // 器材是不是放在某个工作区里面（是的话不画卡片，也不画连线）
  const inWs = (e) => { const p = e.parent && UI.S.scene.entities[e.parent]; return !!(p && isWsDef(p.type)); };
  const wsKids = (ws) => Object.values(UI.S.scene.entities).filter((x) => x.parent === ws.id).sort((a, b) => numOf(a.id) - numOf(b.id));
  const wsNames = () => { const m = {}; for (const x of U.Names.list(UI.S.scene)) m[x.id + '.' + x.port] = x.name; return m; };
  // 选中用的名字：有稳定名字的用名字；没有的（自由点围成的图形）用 '#' 加上它的输出口的键，选中以后照样能拖、能翻、能放缩
  const pickOf = (v) => v.name || '#' + v.key;
  // 找回选中的对象：'#' 开头的按键找（实体 id 和口），其余按稳定名字找。返回和 U.Names.resolve 一样的形状
  const resolvePick = (name) => { if (name[0] !== '#') return U.Names.resolve(UI.S.scene, name); const [id, port] = name.slice(1).split('.'); const e = UI.S.scene.entities[id]; if (!e) return 'missing: ' + name; const node = (UI.S.D || {})[id]; return { name, id, port, ent: e, value: (node && node.out[port]) || null }; };
  Object.assign(SG, { def, geom, dbl, SIGLV, defOf, roleOf, WS_COL, LINE_DASH, escA, numOf, isWsDef, wsCfg, inWs, wsKids, wsNames, pickOf, resolvePick });
})(window);
