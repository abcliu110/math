/* 布局（U5，docs/ui-robustness.md 4.6）。
 * UI.LAYOUT：所有布局尺寸集中在这里（卡片标题高、端口间距、面板间距、适应范围的留白……），界面代码不再写死数字。
 * UI.Layout：
 *   anchor(card, size, bounds)  纯函数：工作区面板放在卡片下方；放不下换右边、再换上边；都放不下就夹进可视区，取可见面积最大的一个。
 *   placePanels(worldEl, stageEl, view, geomOf)  渲染后调用：用 DOM 实测面板尺寸，把面板摆好（面板不溢出可视区，也不压住底部的浮动条）。
 *   panelRect(id, card)  面板在世界坐标里的矩形：渲染过就用实测值（相对卡片的位置和尺寸），没渲染过用 LAYOUT.WS_PANEL_H 估计。
 *                        freeSpot（找空位）和 fit（适应范围）都用它，所以避让的就是面板真实占的地方。
 * 可视区 = 台面（#stage）的屏幕矩形，减去底部浮动条占的高度；换算到世界坐标用台面的 view（x、y、z）。 */
(function (G) {
  'use strict';
  const UI = (G.UI = G.UI || {});

  const LAYOUT = Object.freeze({
    HD: 28,                       // 卡片标题栏高度
    PORT_Y0: 40, PORT_DY: 22,     // 端口：第一个口离卡片顶边的距离；口与口之间的间距
    PILL_DY: 26, PILL_W: 92,      // 属性药丸：间距、宽度
    PILL_GAP: 8,                  // 属性药丸离卡片左边的距离
    PORT_LABEL_X: 12,             // 端口旁边的文字离卡片边的距离
    SIG_GAP: 8,                   // 信号条离卡片底边的距离
    TIP_OFFSET: 14,               // 提示框离鼠标的距离
    TOOL_STATUS_X: 10, TOOL_STATUS_Y: 12,   // 画线时台面上的当前工具状态：离工作区画布左边、下边的距离（2.5）
    LINK_CURVE_MIN: 40,           // 连线曲线控制点的最小伸出长度
    MIN_W: 120, MIN_H: 90,        // 卡片最小尺寸
    DEFAULT_CARD: [150, 90],      // 没有 size() 的器材用的卡片尺寸
    TOOL_GAP: 14,                 // 选中卡片时，工具条离卡片右边的距离
    CARD_PAD: 12,                 // 找空位时，已有卡片四周留的空隙
    SPOT_STEP: 40, SPOT_RINGS: 30, // 找空位：每一圈的步长、最多几圈
    WS_PANEL_GAP: 36,             // 工作区卡片和它下面的面板之间的距离
    WS_PANEL_H: 255,              // 面板高度的估计值：空工作区的面板实测约 255（渲染过之后换成实测值）
    PANEL_MIN_W: 200, PANEL_MIN_H: 120,  // 面板在视口很小时的最小宽、高（再小就不好用了）
    PANEL_SQUEEZE_H: 60,          // 卡片下方的空间不够放下整块面板时，面板最矮压到这么高（里面滚动），保证卡片本身不被压住
    EDGE: 8,                      // 面板离可视区边缘的距离（屏幕像素）
    BAR_GAP: 12,                  // 底部浮动条离台面底边的距离（屏幕像素）
    FLOAT: { h: 34, halfW: 72, edge: 4, top: 2, dy: 8 },  // 图形旁边的浮动工具条
    AUTO_MARGIN: 1.15,            // 按内容自动适应时，四周多留的比例
    EMPTY_VIEW: { dx: 200, dy: 120 },   // 台面没有图形时，原点离台面中心的偏移
    FIT: { padL: 110, padR: 60, padT: 0, padB: 50 },  // 适应台面时，图形外面留的空（世界单位）
    FIT_SCREEN: { x: 40, y: 75 }, // 适应台面时，台面四周留的屏幕像素（左右各 x，上下各 y）
    FIT_TOP_MIN: 50, FIT_TOP_NUDGE: 20,  // 适应台面时，顶边的最小距离和微调
    ZOOM: { fitMin: 0.35, fitMax: 1.15, min: 0.3, max: 2.5 },  // 适应时的缩放范围；手动缩放的范围
    FOCUS: { side: 300, padX: 72, minW: 200, hdH: 32, padY: 56, minH: 160 },  // 专注模式：侧栏宽、留白、最小尺寸
    PIECE_DROP: { x: 40, y: 20 },  // 块拖出工作区时，落点离鼠标的偏移
    ADD_CENTER: { x: 70, y: 40 },  // 从器材架拖进台面：卡片中心离鼠标的偏移
    ADD_CLICK: { x: 70, y: 60 },   // 点器材架添加：卡片离台面中心的偏移
    GHOST: { x: 48, y: 33, w: 96, h: 66 },  // 拖器材时跟着鼠标的小图：离鼠标的偏移，和它的尺寸
    DRAG_SLOP: 4,                  // 拖动超过这么多像素才算拖动
    NARROW_BP: 640,                // 窄屏断点（小于等于这个宽度时，图层抽屉和器材架收起）
    // 标签（V6，2.3）：标签的矩形 = 基线上方 up、下方 down（按实测的字高，CJK 12px 粗体约 17 像素）；pad 是离线和圆的最小距离；
    // grid 是找不到候选位置时，在画布里按格子搜索的步长；dot、vertex 是点和顶点圆圈的半径（障碍）
    LABEL: { up: 13, down: 5, pad: 2, grid: 6, dot: 8, vertex: 6 },
    // 读数（V9，2.9）：读数文字离图形边的距离（near 近、far 远）、离顶点的距离（corner）、区域读数离名字的行距（line）
    // base 是文字的基线相对锚点的下移量；rot 是图形的旋转读数（在面积读数的下面）离中心的两个候选距离
    READOUT: { near: 14, far: 28, corner: 16, line: 18, base: 4, rot: [36, 54] },
    // 块的旋转（V9，2.10）：拖动时总角度吸附的步长（度）；按住 Shift 时的粗步长
    ROT: { step: 1, coarse: 15 },
    LAYER_FLAT: 6,                 // 工作区的图层不超过这么多个，就平铺；超过就按类别分组、默认收起（2.4）
  });
  UI.LAYOUT = LAYOUT;

  const clamp = (v, lo, hi) => (hi < lo ? lo : Math.max(lo, Math.min(hi, v)));
  // 矩形 (x,y,w,h) 和范围 B 的重叠面积
  const area = (x, y, w, h, B) => Math.max(0, Math.min(x + w, B.x1) - Math.max(x, B.x0)) * Math.max(0, Math.min(y + h, B.y1) - Math.max(y, B.y0));

  // 纯函数（不碰 DOM）：card 是卡片的世界矩形，size 是面板的尺寸，B 是可视区的世界范围。
  // 返回 { x, y, side, fits }：side 是 below / right / above；fits 为 false 表示放不下，已经夹进可视区。
  function anchor(card, size, B, gap) {
    const g = gap === undefined ? LAYOUT.WS_PANEL_GAP : gap;
    const cands = [
      ['below', card.x, card.y + card.h + g],
      ['right', card.x + card.w + g, card.y],
      ['above', card.x, card.y - g - size.h],
    ];
    let best = null;
    for (const [side, x, y] of cands) {
      if (x >= B.x0 && y >= B.y0 && x + size.w <= B.x1 && y + size.h <= B.y1) return { x, y, side, fits: true };
      const cx = clamp(x, B.x0, B.x1 - size.w), cy = clamp(y, B.y0, B.y1 - size.h);
      const a = area(cx, cy, size.w, size.h, B);
      if (!best || a > best.a) best = { x: cx, y: cy, side, fits: false, a };
    }
    return { x: best.x, y: best.y, side: best.side, fits: false };
  }

  // 可视区的世界范围：台面的屏幕矩形，减去底部浮动条（缩放、时钟、为什么）占的高度
  function visibleBounds(stageEl, view) {
    const r = stageEl.getBoundingClientRect();
    let bottom = LAYOUT.EDGE;
    stageEl.parentNode.querySelectorAll('.fab').forEach((f) => {
      const fr = f.getBoundingClientRect();
      if (fr.height && fr.top > r.top + r.height / 2) bottom = Math.max(bottom, r.bottom - fr.top + LAYOUT.BAR_GAP);
    });
    // 台面局部像素（离边缘 EDGE、离底部浮动条 bottom）→ 世界坐标（换算在 UI.Space 里）
    const a = UI.Space.localToStage(view, { x: LAYOUT.EDGE, y: LAYOUT.EDGE }), b = UI.Space.localToStage(view, { x: r.width - LAYOUT.EDGE, y: r.height - bottom });
    return { x0: a.x, y0: a.y, x1: b.x, y1: b.y };
  }

  // 面板相对卡片左上角的位置和实测尺寸（最近一次渲染）。键是工作区 id。
  const placed = {};
  // 用户手动展开过的面板（放不下时默认收起；展开后照常摆，会压住卡片，由用户自己选）。键是工作区 id。
  const expanded = {};
  // 面板的收起/展开按钮：放不下时收起的面板只剩这个按钮；展开的面板里也有它，用来收起
  function toggleFold(id) { expanded[id] = !expanded[id]; }
  // 渲染后调用：worldEl 里每个工作区面板，用 DOM 实测尺寸，按 anchor 摆好
  function placePanels(worldEl, stageEl, view, geomOf) {
    const B = visibleBounds(stageEl, view), availW = B.x1 - B.x0, availH = B.y1 - B.y0;
    worldEl.querySelectorAll('.wsx[data-ws]').forEach((el) => {
      const id = el.dataset.ws, card = geomOf(id);
      if (!card) return;
      // 放大台面时，面板可能比可视区还宽、还高：宽度不超过可视区（但不窄于 PANEL_MIN_W），高度超出就在面板里滚动
      el.style.width = Math.min(card.w, Math.max(LAYOUT.PANEL_MIN_W, availW)) + 'px';
      el.style.maxHeight = Math.max(LAYOUT.PANEL_MIN_H, availH) + 'px';
      el.style.overflowY = 'auto';
      let size = { w: el.offsetWidth, h: el.offsetHeight };   // offset* 不受 transform 缩放影响，是世界单位
      let p = anchor(card, size, B);
      // 整块放不下（都要夹进可视区，就会压住卡片本身，图形点不到）：把面板的高度限制成卡片下方的空间，里面滚动
      const room = B.y1 - (card.y + card.h + LAYOUT.WS_PANEL_GAP);
      if (!p.fits && room >= LAYOUT.PANEL_SQUEEZE_H && room < size.h) {
        el.style.maxHeight = room + 'px';
        size = { w: el.offsetWidth, h: el.offsetHeight };
        p = anchor(card, size, B);
      }
      // 面板会压住卡片（图形点不到）时：默认收起成可视区右下角的一个小按钮，用户点了才展开。只留在间距里不算压住
      const tight = p.x < card.x + card.w && p.x + size.w > card.x && p.y < card.y + card.h && p.y + size.h > card.y;
      const folded = tight && !expanded[id];
      el.classList.toggle('wsx-tight', tight);
      el.classList.toggle('wsx-folded', folded);
      if (folded) {
        el.style.width = ''; el.style.maxHeight = '';
        size = { w: el.offsetWidth, h: el.offsetHeight };
        p = { x: B.x1 - size.w, y: B.y1 - size.h, side: 'corner', fits: false };
      }
      el.style.left = p.x + 'px'; el.style.top = p.y + 'px';
      placed[id] = { dx: p.x - card.x, dy: p.y - card.y, w: size.w, h: size.h, side: p.side, fits: p.fits, folded };
    });
  }
  // 面板在世界坐标里的矩形。card：卡片的世界矩形 {x, y, w, h}
  function panelRect(id, card) {
    const pl = placed[id];
    if (pl) return { x: card.x + pl.dx, y: card.y + pl.dy, w: pl.w, h: pl.h };
    return { x: card.x, y: card.y + card.h + LAYOUT.WS_PANEL_GAP, w: card.w, h: LAYOUT.WS_PANEL_H };
  }

  UI.Layout = { anchor, visibleBounds, placePanels, panelRect, toggleFold, clamp };
})(typeof globalThis !== 'undefined' ? globalThis : window);
