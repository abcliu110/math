/* BenchViews — 实验台视图注册表与选择规则（纯函数，不碰 DOM）。
   台上拿什么，台子就换成能显示它的视图：
     直线 -> 坐标系；数 -> 数轴（也能在坐标系上画成 x 轴上的点）；分数 -> 分数条；
     长方形 -> 坐标系格子（宽、长、面积都在格子上读）。
   坐标系归属（只有“意思就是位置”的道具才要坐标系）：
     一维是数轴：数、分数、小数、负数、测量（尺子本身就是一维坐标系）；
     二维是坐标平面：函数图像、坐标点、图形（长方形的顶点和面积）；
     十格阵/面积模型的格子是离散格子（只为数数方便，不标轴），不是坐标系；
     不需要坐标系的：计数（十格阵、数位块、骰子点数）、天平（讲相等不是位置）、
     分数饼/条本身（讲占比）、骰子/转盘（讲随机；分布图是总结不是道具）。
   一次只出现一个坐标系：chooseView 永远只返回一个视图。台面本身（bench 视图）
   一次只画一种；只有问题本身要连通两种表示时（比如分数 → 数轴），才同时
   出现两个——那时是两张卡片各画各的，不是同一张图里叠两个坐标系。
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
    rect: { def: 'coord', views: ['coord', 'formula'] },
  };
  const VIEW_LABEL = { coord: '坐标系', numline: '数轴', fracbar: '分数条', balance: '天平', formula: '算式' };

  function viewsFor(kind) {
    return OBJECT_VIEWS[kind] ? OBJECT_VIEWS[kind].views.slice() : ['formula'];
  }

  // 台上的数（来自实验台的 items）加上直线（如果直线放在台上）变成对象列表。
  // 整数是 num，其余是 frac。长方形在台上时也算一个对象（画在坐标系格子上）。
  function benchObjects(items, lineOn, balanceOn, rectOn) {
    const objs = (items || []).map(function (it) {
      return { kind: (it.q && it.q.d === 1) ? 'num' : 'frac', id: it.id, str: it.str };
    });
    if (lineOn) objs.push({ kind: 'line', id: 'line', str: '直线' });
    if (balanceOn) objs.push({ kind: 'balance', id: 'balance', str: '天平' });
    if (rectOn) objs.push({ kind: 'rect', id: 'rect', str: '长方形' });
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
