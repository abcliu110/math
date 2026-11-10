/* 界面状态分层（U4，docs/ui-robustness.md 4.3）。
 * 界面里的每个状态只属于下面四类之一，登记在 UI.STATE_SPEC；tools/lint-ui.js 检查 UI.S 的每个字段都登记了类别。
 *   world    世界数据：器材、连线、时钟。进存档、进撤销、进分享。
 *   view     持久的视图状态：工作区的坐标范围、图层开关、专注。存在实体的 ui 字段里（entity.ui），
 *            进存档、刷新后保留；不进撤销（撤销、重做、失败回滚都不把视图回退）。
 *   session  会话状态：选中、拖动中、提示、面板草稿、撤销栈。不存。
 *   derived  派生状态：求值结果 S.D、签名缓存。随时可重算，不存。
 * entity.ui 的字段：view（{cx, cy, span}，没有就按内容自动适应）、hiddenLayers（{ 图形键: true }，表示隐藏）、focus（true 表示专注中）。 */
(function (G) {
  'use strict';
  const UI = (G.UI = G.UI || {});

  const CLASSES = {
    world: '世界数据：进存档、进撤销、进分享',
    view: '视图状态：进存档（entity.ui）、不进撤销',
    session: '会话状态：不存',
    derived: '派生状态：不存，随时可重算',
  };
  // UI.S 的每个字段都要登记（界面代码里出现的 S.xxx 都要在这里）
  const FIELDS = {
    scene: 'world',
    // 台面自己的缩放平移（S.view）打开时就 fit()，所以不存；工作区的视图在 entity.ui 里
    view: 'session', mode: 'session', problem: 'session', run: 'session', session: 'session', freeScene: 'session',
    tab: 'session', inspOpen: 'session', glow: 'session', showSig: 'session', q1: 'session', wbDraft: 'session',
    sel: 'session', selLink: 'session', undo: 'session', redo: 'session',
    wsSel: 'session', wsArgs: 'session', wsMsg: 'session', wsMsgKind: 'session', wsBoardUntil: 'session', wsDraw: 'session', wsArm: 'session', wsFit: 'session', wsLayerOpen: 'session', snapOn: 'session',
    D: 'derived', wsSig: 'derived',
  };
  const ENTITY_UI = {
    view: '工作区的坐标范围 {cx, cy, span}；没有就按内容自动适应',
    hiddenLayers: '图层开关：{ 图形键: true } 表示隐藏',
    focus: '专注模式：true 表示这个工作区正放大覆盖台面',
  };

  UI.STATE_SPEC = { classes: CLASSES, fields: FIELDS, entityUi: ENTITY_UI };

  const uiOf = (e) => (e && e.ui) || {};
  const getUi = (e, k) => { const v = uiOf(e)[k]; return v === undefined ? null : v; };
  // 视图字段的写法：不进撤销；置脏，下一次渲染时存档（UI.App.persistView）。值为 null 或 undefined 时删掉这个字段
  let dirty = false;
  function setUi(e, k, v) {
    if (!e) return;
    const ui = Object.assign({}, e.ui || {});
    if (v === null || v === undefined) delete ui[k]; else ui[k] = v;
    if (Object.keys(ui).length) e.ui = ui; else delete e.ui;
    dirty = true;
  }
  const viewOf = (e) => getUi(e, 'view');
  const hiddenOf = (e) => getUi(e, 'hiddenLayers') || {};
  const scene = () => (UI.S && UI.S.scene) || { entities: {} };
  // 专注中的工作区 id（最多一个）
  function focusedId() {
    const E = scene().entities;
    for (const id of Object.keys(E)) if (E[id].ui && E[id].ui.focus) return id;
    return null;
  }
  function setFocusId(id) {
    const E = scene().entities;
    for (const k of Object.keys(E)) if (k !== id && E[k].ui && E[k].ui.focus) setUi(E[k], 'focus', null);
    if (id && E[id]) setUi(E[id], 'focus', true);
  }
  // 撤销快照：去掉每个实体的 ui。撤销、重做、失败回滚用它，视图不跟着回退
  function stripView(sc) {
    const out = Object.assign({}, sc, { entities: {} });
    for (const id of Object.keys(sc.entities)) { const e = Object.assign({}, sc.entities[id]); delete e.ui; out.entities[id] = e; }
    return out;
  }
  // 取走“视图有没有改过”的标记：有改过就要存档一次
  function flush() { const d = dirty; dirty = false; return d; }

  UI.State = { viewOf, hiddenOf, getUi, setUi, focusedId, setFocusId, stripView, flush };
})(typeof globalThis !== 'undefined' ? globalThis : window);
