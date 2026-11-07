/* BenchViews — 实验台视图注册表与选择规则（纯函数，不碰 DOM）。
   台上拿什么，台子就换成能显示它的视图：
     直线 -> 坐标系；数 -> 数轴（也能在坐标系上画成 x 轴上的点）；分数 -> 分数条。
   多个对象同时在台上时，选大家都能显示的视图。找不到共同视图就用算式，永远不空白。
   Browser: window.BenchViews. Node: module.exports. */
(function (root) {
  'use strict';

  // 每种对象：默认视图 def，以及它能画成的全部视图 views（按偏好排序）。
  const OBJECT_VIEWS = {
    line: { def: 'coord', views: ['coord', 'formula'] },
    num: { def: 'numline', views: ['numline', 'coord', 'fracbar', 'formula'] },
    frac: { def: 'fracbar', views: ['fracbar', 'numline', 'coord', 'formula'] },
    balance: { def: 'balance', views: ['balance', 'formula'] },
  };
  const VIEW_LABEL = { coord: '坐标系', numline: '数轴', fracbar: '分数条', balance: '天平', formula: '算式' };

  function viewsFor(kind) {
    return OBJECT_VIEWS[kind] ? OBJECT_VIEWS[kind].views.slice() : ['formula'];
  }

  // 台上的数（来自实验台的 items）加上直线（如果直线放在台上）变成对象列表。
  // 整数是 num，其余是 frac。
  function benchObjects(items, lineOn, balanceOn) {
    const objs = (items || []).map(function (it) {
      return { kind: (it.q && it.q.d === 1) ? 'num' : 'frac', id: it.id, str: it.str };
    });
    if (lineOn) objs.push({ kind: 'line', id: 'line', str: '直线' });
    if (balanceOn) objs.push({ kind: 'balance', id: 'balance', str: '天平' });
    return objs;
  }

  // 选择规则：
  // 1. 所有对象都支持的视图叫"共同视图"（按第一个对象的偏好排序）。
  // 2. 如果第一个对象的默认视图在共同视图里，就用它（一条直线 + 数 -> 坐标系）。
  // 3. 否则用共同视图里偏好最高的那个。
  // 4. 学生指定的视图只要在共同视图里，就优先（preferred）。
  // 5. 没有共同视图时用算式（算式对所有对象都成立，所以正常不会走到这里）。
  function chooseView(objects, preferred) {
    const objs = (objects || []).filter(function (o) { return OBJECT_VIEWS[o.kind]; });
    if (!objs.length) return { view: 'formula', reason: 'empty', label: VIEW_LABEL.formula, views: ['formula'] };
    let common = OBJECT_VIEWS[objs[0].kind].views.slice();
    objs.forEach(function (o) {
      const vs = OBJECT_VIEWS[o.kind].views;
      common = common.filter(function (v) { return vs.indexOf(v) >= 0; });
    });
    if (!common.length) common = ['formula'];
    let view, reason;
    if (preferred && common.indexOf(preferred) >= 0) { view = preferred; reason = 'chosen'; }
    else if (common.indexOf(OBJECT_VIEWS[objs[0].kind].def) >= 0) { view = OBJECT_VIEWS[objs[0].kind].def; reason = 'default'; }
    else { view = common[0]; reason = 'common'; }
    return { view: view, reason: reason, label: VIEW_LABEL[view], views: common };
  }

  const api = { OBJECT_VIEWS: OBJECT_VIEWS, VIEW_LABEL: VIEW_LABEL, viewsFor: viewsFor, benchObjects: benchObjects, chooseView: chooseView };
  root.BenchViews = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
