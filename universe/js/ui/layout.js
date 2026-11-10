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
    TOOL_STATUS_X: 10, TOOL_STATUS_Y: 12, SEL_HINT_Y: 30, SEL_HINT_PAD: 14,   // 画线时台面上的当前工具状态：离工作区画布左边、下边的距离（2.5）
    LINK_CURVE_MIN: 40,           // 连线曲线控制点的最小伸出长度
    MIN_W: 120, MIN_H: 90,        // 卡片最小尺寸
    DEFAULT_CARD: [150, 90],      // 没有 size() 的器材用的卡片尺寸
    COORD_MAX: 10,                // 自由点坐标的范围 ±这么多（gpt 的 min、max）
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
    FIT: { padL: 110, padR: 60, padT: 0, padB: 50, wsPad: 0 },  // 适应台面时，图形外面留的空（世界单位）；只有工作区时四周不留（wsPad）
    FIT_SCREEN: { x: 40, y: 75 }, // 适应台面时，台面四周留的屏幕像素（左右各 x，上下各 y）
    FIT_TOP_MIN: 50, FIT_TOP_NUDGE: 20,  // 适应台面时，顶边的最小距离和微调
    ZOOM: { fitMin: 0.35, fitMax: 1.15, wsMax: 2.6, min: 0.3, max: 2.5 },  // 适应时的缩放范围（有工作区时可以放得更大，画布才占得下台面）；手动缩放的范围
    FOCUS: { side: 300, padX: 72, minW: 200, hdH: 32, padY: 56, minH: 160 },  // 专注模式：抽屉展开时的侧栏宽（收起时画布占满，不留侧栏）、留白、最小尺寸
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
    // 尺子、量角器、标注（§10.5.9 第 6 条）：把手半径、线宽、刻度（长、粗细）、吸附的半径（屏幕像素）、量角器弧的最大半径、
    // 尺子和量角器放上去时离工作区中心的比例（占可见范围），以及有标注时浮动条的高度
    MARK: { HDL: 7, RULER_W: 4, RULER_W_ON: 6, TICK_LEN: 6, TICK_PX: 6, TICK_MAX: 60, SNAP_PX: 10, ARC_R: 40, DEF_FRAC: 0.2, NOTE_H: 70 },
    // 块的旋转（V9，2.10）：拖动时总角度吸附的步长（度）；按住 Shift 时的粗步长
    ROT: { step: 1, coarse: 15 },
    LAYER_FLAT: 6,                 // 工作区的图层不超过这么多个，就平铺；超过就按类别分组、默认收起（2.4）
    // 工作区的抽屉（图层、步骤、范围）：展开时是画布右边的一栏（宽 px 屏幕像素，离画布 gap）；窗口宽到 wideBP 才默认展开，窄窗口默认收起，让画布占满（V2）
    DRAWER: { px: 240, gap: 12, wideBP: 1200 },
    // 工作区的浮动工具条：贴在画布上方（屏幕像素）；离台面顶边 top，高 h，离画布 gap；适应台面时顶部就留出这一段，不挤占画布
    BAR: { top: 4, h: 28, gap: 6, fabGap: 4 },   // fabGap：适应台面时，底部浮动条和画布之间的间距（比摆抽屉时小，画布能多占一点）
    // 左右栏收成窄条的宽度（屏幕像素）；只在桌面宽度（超过 overlayBP，窄屏的栏是盖在上面的）生效；几何工作区打开、窗口窄于 autoBP 时自动收起（V2）
    RAIL: { w: 30, overlayBP: 960, autoBP: 1100 },
    // 触屏（V8，2.7）：把手和点击区至少 min 像素（CSS 像素，只在触屏的按下时放大点击范围，画面不变）；
    // 长按 longMs 毫秒弹出菜单，移动超过 slop 像素就不算长按；双指按下后 recentMs 毫秒内的右键菜单（系统长按）不弹
    TOUCH: { min: 24, longMs: 500, slop: 10, recentMs: 1000 },
    // 键盘（V8，2.8）：方向键移动选中图形的步长（格）；按住 Shift 的大步
    KEY: { step: 1, big: 5 },
  });
  UI.LAYOUT = LAYOUT;

  const clamp = (v, lo, hi) => (hi < lo ? lo : Math.max(lo, Math.min(hi, v)));
  // 矩形 (x,y,w,h) 和范围 B 的重叠面积
  const area = (x, y, w, h, B) => Math.max(0, Math.min(x + w, B.x1) - Math.max(x, B.x0)) * Math.max(0, Math.min(y + h, B.y1) - Math.max(y, B.y0));

  // 纯函数（不碰 DOM）：card 是卡片的世界矩形，size 是面板的尺寸，B 是可视区的世界范围。
  // order 是候选位置的先后（默认下方、右边、上方；抽屉展开时先试右边）。
  // 返回 { x, y, side, fits }：side 是 below / right / above；fits 为 false 表示放不下，已经夹进可视区。
  function anchor(card, size, B, gap, order) {
    const g = gap === undefined ? LAYOUT.WS_PANEL_GAP : gap;
    const pos = {
      below: [card.x, card.y + card.h + g],
      right: [card.x + card.w + g, card.y],
      above: [card.x, card.y - g - size.h],
    };
    let best = null;
    for (const side of order || ['below', 'right', 'above']) {
      const [x, y] = pos[side];
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
  // 抽屉的展开状态：用户点过的记在这里（true 展开、false 收起）；没点过就按窗口宽度定（见 drawerOpen）。键是工作区 id。
  const expanded = {};
  // 抽屉是否展开：点过就听用户的；没点过时，窗口够宽（DRAWER.wideBP）默认展开，否则默认收起（画布占满，V2）
  function drawerOpen(id) { return expanded[id] === undefined ? G.innerWidth >= LAYOUT.DRAWER.wideBP : expanded[id]; }
  // 抽屉的收起/展开按钮：先读出当前是什么状态，再翻过来。调用方接着要重新适应台面（展开时要给抽屉让出位置）
  function toggleFold(id) { expanded[id] = !drawerOpen(id); }
  // 台面底部浮动条（缩放、时钟、为什么）占的屏幕高度（含和它的间距 gap，默认 BAR_GAP）
  function bottomReserve(stageEl, gap) {
    const r = stageEl.getBoundingClientRect(), g = gap === undefined ? LAYOUT.BAR_GAP : gap;
    let bottom = LAYOUT.EDGE;
    stageEl.parentNode.querySelectorAll('.fab').forEach((f) => {
      const fr = f.getBoundingClientRect();
      if (fr.height && fr.top > r.top + r.height / 2) bottom = Math.max(bottom, r.bottom - fr.top + g);
    });
    return bottom;
  }
  // 渲染后调用：worldEl 里每个工作区面板（抽屉），用 DOM 实测尺寸，按 anchor 摆好。
  // 展开：先试画布右边（不压住画布），放不下才试下方、上方；收起（或放不下）：收成可视区右下角的一个按钮。
  function placePanels(worldEl, stageEl, view, geomOf) {
    const B = visibleBounds(stageEl, view), availW = B.x1 - B.x0, availH = B.y1 - B.y0;
    const D = LAYOUT.DRAWER;
    worldEl.querySelectorAll('.wsx[data-ws]').forEach((el) => {
      const id = el.dataset.ws, card = geomOf(id);
      if (!card) return;
      const open = drawerOpen(id);
      // 展开的抽屉宽 D.px 屏幕像素（换算成世界长度，不溢出可视区）；高度超出就在面板里滚动
      el.style.width = open ? Math.min(UI.Space.stageDelta(D.px, view.z), Math.max(LAYOUT.PANEL_MIN_W, availW)) + 'px' : '';
      el.style.maxHeight = Math.max(LAYOUT.PANEL_MIN_H, availH) + 'px';
      el.style.overflowY = 'auto';
      const gap = open ? UI.Space.stageDelta(D.gap, view.z) : LAYOUT.WS_PANEL_GAP;
      let size = { w: el.offsetWidth, h: el.offsetHeight };   // offset* 不受 transform 缩放影响，是世界单位
      let p = anchor(card, size, B, gap, open ? ['right', 'below', 'above'] : ['below', 'right', 'above']);
      // 整块放不下（都要夹进可视区，就会压住卡片本身，图形点不到）：把面板的高度限制成卡片下方的空间，里面滚动
      const room = B.y1 - (card.y + card.h + gap);
      if (!p.fits && room >= LAYOUT.PANEL_SQUEEZE_H && room < size.h) {
        el.style.maxHeight = room + 'px';
        size = { w: el.offsetWidth, h: el.offsetHeight };
        p = anchor(card, size, B, gap, ['below', 'right', 'above']);
      }
      // 会压住卡片（图形点不到）的抽屉，不管是不是用户展开的，都收成一个按钮：展开不能盖住画布（V2）
      const tight = p.x < card.x + card.w && p.x + size.w > card.x && p.y < card.y + card.h && p.y + size.h > card.y;
      const folded = !open || tight;
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
  UI.Layout = { anchor, visibleBounds, placePanels, panelRect, toggleFold, drawerOpen, bottomReserve, clamp };
})(typeof globalThis !== 'undefined' ? globalThis : window);
