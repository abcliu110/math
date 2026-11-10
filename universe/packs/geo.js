/* 器材包 geo（原型）：几何构造、剪切、拼合、几何画板。底层见 js/core/geo.js。
 * 每个点、每条线是一个小器材，由谁构造就和谁连线；画板把连进来的图形画在同一个坐标系里，
 * 自由点可以在画板上直接拖动。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit, F = U.Fig, Geo = U.Geo;
  const fig = (f) => U.val('fig', f, { dim: null });
  const ptFig = (p, tag) => Object.assign({ type: 'point', pts: [p] }, tag ? { tag } : {});
  const figIn = (c, port, type) => { const v = (c.inp[port] || []).find((x) => x && x.kind === 'fig' && (!type || x.data.type === type)); return v ? v.data : null; };
  const figsIn = (c, port) => (c.inp[port] || []).filter((x) => x && (x.kind === 'fig' || x.kind === 'figs')).flatMap((x) => (x.kind === 'figs' ? x.data : [x.data]));
  const two = (c, a, b, type) => [figIn(c, a, type), figIn(c, b, type)];
  const S = (txt) => K.text(35, 26, txt, { size: 18, weight: 700 });
  const ex = (why) => ({ minProps: 0, why });
  const pointIn = { kind: 'fig', label: '点' };
  const segIn = { kind: 'fig', label: '线段' };

  U.registerPack({
    id: 'geo', version: 1,
    types: {
      // ---------------- 自由点：坐标是属性，可以在画板上拖 ----------------
      gpt: {
        workspaceRole: 'point',
        workbenches: ['geometry'],
        handles: true,
        pointShape: 'circle',
        essence: ['E1', 'E3'],
        label: '自由点', prefix: '点', group: '图形', grades: [4, 9],
        props: { x: { type: 'int', label: 'x', default: 0, min: -10, max: 10 }, y: { type: 'int', label: 'y', default: 0, min: -10, max: 10 }, mark: { type: 'text', label: '名字', default: '' } },
        outputs: { p: { dim: null, kind: 'fig', label: '点' } },
        icon: () => K.circle(32, 22, 5, { fill: 'var(--ink)' }),
        size: () => [120, 70],
        compute: (c) => ({ p: fig(ptFig({ x: Q(c.props.x), y: Q(c.props.y) }, c.ent.id)) }),
        badge: (c) => (c.props.mark || '') + '(' + c.props.x + ', ' + c.props.y + ')',
        draw: (c) => K.text(c.w / 2, c.h / 2 + 4, (c.props.mark ? c.props.mark + ' ' : '') + '(' + c.props.x + ', ' + c.props.y + ')', { size: 14, weight: 700 }),
      },

      // ---------------- 连线：两点连成线段 ----------------
      gseg: {
        workspaceRole: 'step',
        workbenches: ['geometry'],
        handles: true,
        stepLabel: '连线',
        hidden: true,
        essence: ['E1'],
        label: '连线', prefix: '线段', group: '图形', grades: [4, 9],
        props: { dash: { type: 'bool', label: '画成虚线（辅助线）', default: true }, showLen: { type: 'bool', label: '显示长度', default: true }, mark: { type: 'text', label: '名字', default: '' } },
        inputs: { a: pointIn, b: pointIn },
        outputs: { s: { dim: null, kind: 'fig', label: '线段' } },
        icon: () => K.line(10, 34, 54, 10, { w: 2 }),
        size: () => [120, 70],
        compute: (c) => {
          const [a, b] = two(c, 'a', 'b', 'point'); if (!a || !b) { c.say('info', '接两个点进来'); return {}; }
          const s = { type: 'segment', pts: [a.pts[0], b.pts[0]] }; if (c.props.dash) s.dash = true;
          if (c.props.showLen) c.say('info', '长 ' + U.Real.show(F.len(a.pts[0], b.pts[0])));
          return { s: fig(s) };
        },
        draw: (c) => K.line(14, c.h / 2, c.w - 14, c.h / 2 - 10, { w: 2, dash: c.props.dash ? '5 4' : '' }),
      },

      // ---------------- 中点 ----------------
      gmid: {
        workspaceRole: 'step',
        workbenches: ['geometry'],
        handles: true,
        stepLabel: '中点',
        hidden: true,
        pointShape: 'square',
        essence: ['E2', 'E5'],
        label: '中点', prefix: '中点', group: '图形', grades: [5, 9], lint: ex('只由两个点决定，没有可调的属性'),
        // 吸附声明（V4）：画线、放点时，靠近一条边的中点就吸附到它；吸附的结果是建这个器材（接 wire 里的两个点），用它的 out 口
        snap: { kind: 'mid', label: '中点', mark: '△', of: 'edge', wire: ['a', 'b'], out: 'p', at: (p, q) => Geo.midpoint(p, q) },
        props: {},
        inputs: { a: pointIn, b: pointIn },
        outputs: { p: { dim: null, kind: 'fig', label: '中点' } },
        icon: () => K.line(8, 30, 56, 30, { w: 2 }) + K.circle(32, 30, 4, { fill: 'var(--ink)' }),
        size: () => [110, 60],
        compute: (c) => { const [a, b] = two(c, 'a', 'b', 'point'); if (!a || !b) { c.say('info', '接两个点进来'); return {}; } return { p: fig(ptFig(Geo.midpoint(a.pts[0], b.pts[0]))) }; },
        draw: (c) => (c.out.p ? K.text(c.w / 2, c.h / 2 + 4, U.Fig.show(c.out.p.data).replace('点 ', ''), { size: 13 }) : ''),
      },

      // ---------------- 交点：两条线（看成直线）的交点 ----------------
      gint: {
        workspaceRole: 'none',
        workbenches: ['geometry'],
        handles: true,
        hidden: true,
        essence: ['E1'],
        label: '交点', prefix: '交点', group: '图形', grades: [7, 9], lint: ex('只由两条线决定，没有可调的属性'),
        pointShape: 'triangle',
        props: {},
        inputs: { s: segIn, t: segIn },
        outputs: { p: { dim: null, kind: 'fig', label: '交点' } },
        icon: () => K.line(10, 10, 54, 36, { w: 2 }) + K.line(10, 36, 54, 10, { w: 2 }),
        size: () => [110, 60],
        compute: (c) => {
          const [s, t] = two(c, 's', 't', 'segment'); if (!s || !t) { c.say('info', '接两条线进来'); return {}; }
          const p = Geo.lineIntersect(s.pts[0], s.pts[1], t.pts[0], t.pts[1]);
          if (!p) { c.say('warn', '两条线平行，没有交点'); return {}; }
          return { p: fig(ptFig(p)) };
        },
        draw: (c) => (c.out.p ? K.text(c.w / 2, c.h / 2 + 4, U.Fig.show(c.out.p.data).replace('点 ', ''), { size: 13 }) : ''),
      },

      // ---------------- 垂足：过点作直线的垂线 ----------------
      gfoot: {
        workspaceRole: 'step',
        workbenches: ['geometry'],
        handles: true,
        stepLabel: '垂线',
        hidden: true,
        pointShape: 'diamond',
        essence: ['E1', 'E3'],
        label: '垂足', prefix: '垂足', group: '图形', grades: [7, 9], lint: ex('只由一个点和一条线决定'),
        props: {},
        inputs: { p: pointIn, s: segIn },
        outputs: { p: { dim: null, kind: 'fig', label: '垂足' }, h: { dim: null, kind: 'fig', label: '垂线段' } },
        icon: () => K.line(8, 36, 56, 36, { w: 2 }) + K.line(32, 8, 32, 36, { w: 2, dash: '4 3' }),
        size: () => [110, 60],
        compute: (c) => {
          const p = figIn(c, 'p', 'point'), s = figIn(c, 's', 'segment'); if (!p || !s) { c.say('info', '接一个点和一条线进来'); return {}; }
          const f = Geo.foot(p.pts[0], s.pts[0], s.pts[1]);
          return { p: fig(ptFig(f)), h: fig({ type: 'segment', pts: [p.pts[0], f], dash: true }) };
        },
        draw: (c) => (c.out.p ? K.text(c.w / 2, c.h / 2 + 4, U.Fig.show(c.out.p.data).replace('点 ', ''), { size: 13 }) : ''),
      },

      // ---------------- 垂足（三个点）：画线时自动找垂足用。点 p 到直线 ab 的垂足 ----------------
      gperp: {
        workspaceRole: 'step',
        workbenches: ['geometry'],
        handles: true,
        stepLabel: '垂足',
        hidden: true,
        pointShape: 'diamond',
        essence: ['E1', 'E3'],
        label: '垂足（点到线）', prefix: '垂足', group: '图形', grades: [7, 9], lint: ex('只由一个点和线上的两个点决定'),
        // 吸附声明：已经按下了起点 p（start），指针靠近「p 到某条边所在直线的垂足」就吸附；结果是建这个器材，起点接 p，边的两端接 a、b
        snap: { kind: 'foot', label: '垂足（画出垂线）', mark: '⊥', of: 'foot', wire: ['a', 'b'], extra: ['p'], out: 'p', at: (a, b, start) => Geo.foot(start, a, b) },
        props: {},
        inputs: { p: pointIn, a: pointIn, b: pointIn },
        outputs: { p: { dim: null, kind: 'fig', label: '垂足' } },
        icon: () => K.line(8, 36, 56, 36, { w: 2 }) + K.line(32, 8, 32, 36, { w: 2, dash: '4 3' }),
        size: () => [110, 60],
        compute: (c) => {
          const p = figIn(c, 'p', 'point'), a = figIn(c, 'a', 'point'), b = figIn(c, 'b', 'point');
          if (!p || !a || !b) { c.say('info', '接三个点进来：要作垂线的点，和直线上的两个点'); return {}; }
          if (Q.num(F.d2(a.pts[0], b.pts[0])) === 0) { c.say('warn', '直线上的两个点重合了'); return {}; }
          return { p: fig(ptFig(Geo.foot(p.pts[0], a.pts[0], b.pts[0]))) };
        },
        draw: (c) => (c.out.p ? K.text(c.w / 2, c.h / 2 + 4, U.Fig.show(c.out.p.data).replace('点 ', ''), { size: 13 }) : ''),
      },

      // ---------------- 交点（四个点）：画线时自动找两条线的交点用 ----------------
      gcross: {
        workspaceRole: 'step',
        workbenches: ['geometry'],
        handles: true,
        stepLabel: '交点',
        hidden: true,
        pointShape: 'triangle',
        essence: ['E1'],
        label: '交点（两条线）', prefix: '交点', group: '图形', grades: [7, 9], lint: ex('只由两条线（四个点）决定'),
        // 吸附声明：两条线段（边、对角线）在里面相交，指针靠近交点就吸附；线 ab、线 cd
        snap: { kind: 'cross', label: '交点', mark: '×', of: 'cross', wire: ['a', 'b', 'c', 'd'], out: 'p', at: (a, b, c2, d) => Geo.lineIntersect(a, b, c2, d) },
        props: {},
        inputs: { a: pointIn, b: pointIn, c: pointIn, d: pointIn },
        outputs: { p: { dim: null, kind: 'fig', label: '交点' } },
        icon: () => K.line(10, 10, 54, 36, { w: 2 }) + K.line(10, 36, 54, 10, { w: 2 }),
        size: () => [110, 60],
        compute: (c) => {
          const [a, b, c2, d] = ['a', 'b', 'c', 'd'].map((k) => figIn(c, k, 'point'));
          if (!a || !b || !c2 || !d) { c.say('info', '接四个点进来：第一条线的两端和第二条线的两端'); return {}; }
          const p = Geo.lineIntersect(a.pts[0], b.pts[0], c2.pts[0], d.pts[0]);
          if (!p) { c.say('warn', '两条线平行，没有交点'); return {}; }
          return { p: fig(ptFig(p)) };
        },
        draw: (c) => (c.out.p ? K.text(c.w / 2, c.h / 2 + 4, U.Fig.show(c.out.p.data).replace('点 ', ''), { size: 13 }) : ''),
      },

      // ---------------- 三角形的重心：三个顶点的平均（V4 构造点；画线、拖点时靠近就吸附）----------------
      gcentroid: {
        workspaceRole: 'step',
        workbenches: ['geometry'],
        handles: true,
        stepLabel: '重心',
        hidden: true,
        pointShape: 'tdown',
        essence: ['E1', 'E5'],
        label: '重心', prefix: '重心', group: '图形', grades: [7, 9], lint: ex('只由三个顶点决定，没有可调的属性'),
        // 吸附声明：三角形的三个顶点（工作区里的多边形恰好三个顶点，且都是自由点）；结果建这个器材，接 a、b、c
        snap: { kind: 'centroid', label: '重心', mark: '▽', of: 'tri', wire: ['a', 'b', 'c'], out: 'p', at: (a, b, c2) => Geo.centroid(a, b, c2) },
        props: {},
        inputs: { a: pointIn, b: pointIn, c: pointIn },
        outputs: { p: { dim: null, kind: 'fig', label: '重心' } },
        icon: () => K.circle(32, 26, 3, { fill: 'var(--ink)' }) + K.line(12, 40, 52, 40, { w: 1.5 }),
        size: () => [120, 60],
        compute: (c) => {
          const [a, b, c2] = ['a', 'b', 'c'].map((k) => figIn(c, k, 'point'));
          if (!a || !b || !c2) { c.say('info', '接三个点进来：三角形的三个顶点'); return {}; }
          return { p: fig(ptFig(Geo.centroid(a.pts[0], b.pts[0], c2.pts[0]))) };
        },
        draw: (c) => (c.out.p ? K.text(c.w / 2, c.h / 2 + 4, U.Fig.show(c.out.p.data).replace('点 ', ''), { size: 13 }) : ''),
      },

      // ---------------- 三角形的圆心（外心，外接圆的圆心）：三边中垂线的交点（V4 构造点）----------------
      gcircum: {
        workspaceRole: 'step',
        workbenches: ['geometry'],
        handles: true,
        stepLabel: '圆心',
        hidden: true,
        pointShape: 'cross',
        essence: ['E1', 'E5'],
        label: '圆心（外接圆）', prefix: '圆心', group: '图形', grades: [7, 9], lint: ex('只由三个顶点决定，没有可调的属性'),
        // 吸附声明：三角形的三个顶点；三点共线时没有外接圆，不吸附
        snap: { kind: 'circum', label: '圆心（外接圆）', mark: '◎', of: 'tri', wire: ['a', 'b', 'c'], out: 'p', at: (a, b, c2) => Geo.circumcenter(a, b, c2) },
        props: {},
        inputs: { a: pointIn, b: pointIn, c: pointIn },
        outputs: { p: { dim: null, kind: 'fig', label: '圆心' } },
        icon: () => K.circle(32, 28, 12, { stroke: 'var(--ink)' }) + K.line(26, 28, 38, 28, { w: 1.5 }),
        size: () => [120, 60],
        compute: (c) => {
          const [a, b, c2] = ['a', 'b', 'c'].map((k) => figIn(c, k, 'point'));
          if (!a || !b || !c2) { c.say('info', '接三个点进来：三角形的三个顶点'); return {}; }
          const p = Geo.circumcenter(a.pts[0], b.pts[0], c2.pts[0]);
          if (!p) { c.say('warn', '三个点在一条直线上，没有外接圆'); return {}; }
          return { p: fig(ptFig(p)) };
        },
        draw: (c) => (c.out.p ? K.text(c.w / 2, c.h / 2 + 4, U.Fig.show(c.out.p.data).replace('点 ', ''), { size: 13 }) : ''),
      },

      // ---------------- 线段的三等分点（靠近第一个端点、靠近第二个端点各一个）（V4 构造点）----------------
      gtri1: {
        workspaceRole: 'step',
        workbenches: ['geometry'],
        handles: true,
        stepLabel: '三分之一点',
        hidden: true,
        pointShape: 'star',
        essence: ['E1', 'E2'],
        label: '三分之一点', prefix: '三分点', group: '图形', grades: [5, 9], lint: ex('只由线段的两个端点决定，没有可调的属性'),
        snap: { kind: 'trisect', label: '三分之一点', mark: '⅓', of: 'edge', wire: ['a', 'b'], out: 'p', at: (p, q) => Geo.trisect(p, q, 1) },
        props: {},
        inputs: { a: pointIn, b: pointIn },
        outputs: { p: { dim: null, kind: 'fig', label: '三分之一点' } },
        icon: () => K.line(8, 30, 56, 30, { w: 2 }) + K.circle(22, 30, 3.5, { fill: 'var(--ink)' }),
        size: () => [120, 60],
        compute: (c) => { const [a, b] = two(c, 'a', 'b', 'point'); if (!a || !b) { c.say('info', '接两个点进来'); return {}; } return { p: fig(ptFig(Geo.trisect(a.pts[0], b.pts[0], 1))) }; },
        draw: (c) => (c.out.p ? K.text(c.w / 2, c.h / 2 + 4, U.Fig.show(c.out.p.data).replace('点 ', ''), { size: 13 }) : ''),
      },
      gtri2: {
        workspaceRole: 'step',
        workbenches: ['geometry'],
        handles: true,
        stepLabel: '三分之二点',
        hidden: true,
        pointShape: 'star',
        essence: ['E1', 'E2'],
        label: '三分之二点', prefix: '三分点', group: '图形', grades: [5, 9], lint: ex('只由线段的两个端点决定，没有可调的属性'),
        snap: { kind: 'trisect', label: '三分之二点', mark: '⅔', of: 'edge', wire: ['a', 'b'], out: 'p', at: (p, q) => Geo.trisect(p, q, 2) },
        props: {},
        inputs: { a: pointIn, b: pointIn },
        outputs: { p: { dim: null, kind: 'fig', label: '三分之二点' } },
        icon: () => K.line(8, 30, 56, 30, { w: 2 }) + K.circle(42, 30, 3.5, { fill: 'var(--ink)' }),
        size: () => [120, 60],
        compute: (c) => { const [a, b] = two(c, 'a', 'b', 'point'); if (!a || !b) { c.say('info', '接两个点进来'); return {}; } return { p: fig(ptFig(Geo.trisect(a.pts[0], b.pts[0], 2))) }; },
        draw: (c) => (c.out.p ? K.text(c.w / 2, c.h / 2 + 4, U.Fig.show(c.out.p.data).replace('点 ', ''), { size: 13 }) : ''),
      },

      // ---------------- 围成多边形：按连线顺序把点围起来 ----------------
      gpoly: {
        workspaceRole: 'none',
        workbenches: ['geometry'],
        handles: true,
        essence: ['E2'],
        label: '围成多边形', prefix: '多边形', group: '图形', grades: [4, 9], lint: ex('顶点由连进来的点决定'),
        // 填充（V10，2.6b）：纯色之外可以选斜线或点阵，和颜色一起区分（三角形也是多边形）
        props: { tex: { type: 'choice', label: '填充', default: 0, choices: ['纯色', '斜线', '点阵'] } },
        inputs: { pts: { kind: 'fig', label: '顶点', many: true } },
        outputs: { f: { dim: null, kind: 'fig', label: '多边形' } },
        icon: () => '<path d="M10 36 L54 36 L40 8 Z" fill="none" stroke="var(--ink)" stroke-width="1.5"/>',
        size: () => [120, 60],
        compute: (c) => {
          const ps = (c.inp.pts || []).filter((x) => x && x.kind === 'fig' && x.data.type === 'point').map((x) => x.data.pts[0]);
          if (ps.length < 3) { c.say('info', '至少接 3 个点（按连线的先后围起来）'); return {}; }
          const f = { type: 'polygon', pts: ps };
          if (c.props.tex) f.tex = ['', 'hatch', 'dots'][c.props.tex];
          if (F.area2(f).n === 0n) { c.say('warn', '这些点在一条直线上，围不成图形'); return {}; }
          return { f: fig(f) };
        },
        draw: (c) => (c.out.f ? K.text(c.w / 2, c.h / 2 + 4, F.name(c.out.f.data), { size: 14, weight: 700 }) : ''),
      },

      // ---------------- 剪刀：沿一条线把多边形剪成两块 ----------------
      gcut: {
        workspaceRole: 'step',
        workbenches: ['geometry'],
        handles: true,
        stepLabel: '剪',
        splitsPieces: true,
        hidden: true,
        essence: ['E2', 'E5'],
        label: '剪刀', prefix: '剪刀', group: '图形', grades: [5, 9], lint: ex('剪在哪里由连进来的线决定'),
        props: {},
        inputs: { f: { kind: 'fig', label: '图形' }, line: { kind: 'fig', label: '沿这条线剪' } },
        outputs: { a: { dim: null, kind: 'fig', label: '第一块' }, b: { dim: null, kind: 'fig', label: '第二块' }, all: { dim: null, kind: 'figs', label: '两块' } },
        icon: () => S('✂'),
        size: () => [130, 70],
        compute: (c) => {
          const f = figIn(c, 'f', 'polygon'), l = figIn(c, 'line', 'segment');
          if (!f || !l) { c.say('info', '接一个多边形和一条剪切线'); return {}; }
          const r = Geo.cut(f, l.pts[0], l.pts[1]); if (!r.pieces) { c.say('warn', r.why); return {}; }
          const [a, b] = r.pieces;
          c.say('info', '剪成两块：面积 ' + U.Real.show(F.area(a)) + ' 和 ' + U.Real.show(F.area(b)));
          return { a: fig(a), b: fig(b), all: U.val('figs', r.pieces, { dim: null }) };
        },
        draw: (c) => K.text(c.w / 2, c.h / 2 + 4, c.out.a ? F.name(c.out.a.data) + ' + ' + F.name(c.out.b.data) : '✂', { size: 13, weight: 700 }),
      },

      // ---------------- 摆放：翻转、旋转、移动一块 ----------------
      gplace: {
        workspaceRole: 'step',
        workbenches: ['geometry'],
        handles: true,
        stepLabel: (e) => (e.props.flip ? '翻转' : e.props.turn ? '旋转' : '移动'),
        figEdit: 'place',
        hidden: true,
        essence: ['E5'],
        label: '摆放（翻转 / 旋转 / 移动）', prefix: '摆放', group: '图形', grades: [3, 9],
        props: {
          flip: { type: 'choice', label: '翻转', default: 0, choices: ['不翻', '左右翻', '上下翻'] },
          turn: { type: 'choice', label: '旋转', default: 0, choices: ['不转', '转 90°', '转 180°', '转 270°'] },
          dx: { type: 'int', label: '向右移', default: 0, min: -20, max: 20 },
          dy: { type: 'int', label: '向上移', default: 0, min: -20, max: 20 },
        },
        inputs: { f: { kind: 'fig', label: '一块' } },
        outputs: { f: { dim: null, kind: 'fig', label: '摆好的' } },
        icon: () => '<path d="M8 34 L24 34 L8 18 Z" fill="none" stroke="var(--ink)" stroke-width="1.5"/><path d="M56 34 L40 34 L56 18 Z" fill="rgba(59,155,255,.25)" stroke="var(--ink)" stroke-width="1.5"/>',
        size: () => [150, 70],
        compute: (c) => {
          const f = figIn(c, 'f'); if (!f) { c.say('info', '接一块图形进来；在几何画板上可以直接拖它'); return {}; }
          const g = Geo.place(f, { flip: c.props.flip, turn: c.props.turn, dx: c.props.dx, dy: c.props.dy });
          if (F.congruent(f, g)) c.say('info', '翻转、旋转、移动都不改变形状和大小：和原来全等');
          return { f: fig(Object.assign({}, g, { tag: c.ent.id })) };
        },
        draw: (c) => K.text(c.w / 2, c.h / 2 + 4, ['', '左右翻 ', '上下翻 '][c.props.flip] + ['', '转90° ', '转180° ', '转270° '][c.props.turn] + '移(' + c.props.dx + ', ' + c.props.dy + ')', { size: 13 }),
      },

      // ---------------- 拼合：这些块能不能正好拼成目标 ----------------
      gasm: {
        workspaceRole: 'step',
        workbenches: ['geometry'],
        handles: true,
        stepLabel: (e, scene) => (scene.links.some((l) => l.to === e.id && l.toPort === 'target') ? '对齐到目标' : '合并'),
        hidden: true,
        essence: ['E5', 'E2'],
        label: '拼合（粘贴）', prefix: '拼合', group: '图形', grades: [5, 9], lint: ex('只检查连进来的块和目标'),
        props: {},
        inputs: { pieces: { kind: 'fig', label: '块', many: true }, target: { kind: 'fig', label: '目标' } },
        outputs: { ok: { dim: null, kind: 'bool', label: '正好拼成目标' }, merged: { dim: null, kind: 'fig', label: '粘成的图形' } },
        icon: () => S('⧉'),
        size: () => [150, 80],
        compute: (c) => {
          const ps = figsIn(c, 'pieces').filter((f) => f.type === 'polygon'), t = figIn(c, 'target', 'polygon');
          if (!ps.length) { c.say('info', '接几块进来（可以再接一个目标图形）'); return {}; }
          const out = {}, m = Geo.merge(ps);
          if (m.ok) out.merged = fig(m.poly); else c.say('warn', '粘不成一个：' + m.why);
          if (t) { const r = Geo.assemble(ps, t); c.say(r.ok ? 'ok' : 'warn', r.why); out.ok = U.val('bool', r.ok); }
          else if (m.ok) c.say('ok', m.why);
          return out;
        },
        draw: (c) => K.text(c.w / 2, c.h / 2 + 4, c.out.ok ? (c.out.ok.data ? '正好拼成 ✓' : '还没拼对') : c.out.merged ? '粘成' + F.name(c.out.merged.data) : '—', { size: 14, weight: 700 }),
      },

      // ---------------- 面积读数（D7）：多边形的面积作为数据源输出，可以接进式子工作台（S = a × h）----------------
      garea: {
        workspaceRole: 'none',
        workbenches: ['geometry'],
        handles: true,
        essence: ['E5', 'E2'],
        label: '面积读数', prefix: '面积', group: '图形', grades: [5, 9], lint: ex('只读连进来的图形的面积，没有可调的属性'),
        props: {},
        inputs: { f: { kind: 'fig', label: '图形' } },
        outputs: { s: { dim: 'area', kind: 'num', label: '面积' } },
        icon: () => K.text(32, 26, 'S', { size: 18, weight: 700 }),
        size: () => [120, 60],
        compute: (c) => {
          const f = figIn(c, 'f', 'polygon'); if (!f) { c.say('info', '接一个多边形进来'); return {}; }
          const a = Q.div(Q.abs(F.area2(f)), Q(2));
          c.say('info', '面积 ' + Q.show(a));
          return { s: U.val('num', a, { dim: 'area' }) };
        },
        draw: (c) => K.text(c.w / 2, c.h / 2 + 4, c.out.s ? '面积 ' + Q.show(c.out.s.data) : '面积 ?', { size: 14, weight: 700 }),
      },

      // ---------------- 几何画板：把连进来的图形画在同一个坐标系里，自由点可以拖 ----------------
      gboard: {
        workspaceRole: 'none',
        workbenches: ['geometry'],
        handles: true,
        hidden: true,
        essence: ['E1', 'E5'],
        label: '几何画板', prefix: '画板', group: '图形', grades: [4, 9],
        props: { range: { type: 'int', label: '坐标范围（±）', default: 8, min: 4, max: 10 }, grid: { type: 'bool', label: '画格点', default: true }, title: { type: 'text', label: '标题', default: '' } },
        inputs: { figs: { kind: 'fig', label: '图形', many: true }, pts: { kind: 'spoint', label: '符号点', many: true } },
        outputs: { n: { dim: null, kind: 'num', label: '图形个数' } },
        icon: () => K.rect(8, 6, 48, 32, { stroke: 'var(--ink)', r: 3 }) + '<path d="M16 32 L46 32 L22 12 Z" fill="none" stroke="var(--ink)"/>',
        size: () => [300, 300],
        compute: (c) => ({ n: U.val('num', Q(figsIn(c, 'figs').length), { dim: null }) }),
        draw: (c) => {
          const R = c.props.range, w = c.w - 8, h = c.h - 8, s = Math.min(w, h) / (2 * R), ox = 4 + (w - 2 * R * s) / 2, oy = 4 + (h - 2 * R * s) / 2;
          const X = (q) => ox + (Q.num(q) + R) * s, Y = (q) => oy + (R - Q.num(q)) * s;
          const colors = ['#1d4ed8', '#c2410c', '#047857', '#7e22ce', '#b91c1c'];   // 与 js/ui/stage.js 的 WS_COL 同一组（对比度合格）
          let g = K.texDefs(colors);   // 纹理图案的定义（V10，2.6b）
          if (c.props.grid) for (let i = -R; i <= R; i++) for (let j = -R; j <= R; j++) g += '<circle cx="' + X(Q(i)).toFixed(1) + '" cy="' + Y(Q(j)).toFixed(1) + '" r="0.9" fill="var(--line, #bbb)"/>';
          g += '<line x1="' + X(Q(-R)) + '" y1="' + Y(Q(0)) + '" x2="' + X(Q(R)) + '" y2="' + Y(Q(0)) + '" stroke="var(--line, #bbb)"/><line x1="' + X(Q(0)) + '" y1="' + Y(Q(-R)) + '" x2="' + X(Q(0)) + '" y2="' + Y(Q(R)) + '" stroke="var(--line, #bbb)"/>';
          const fs = ((c.d && c.d.inp && c.d.inp.figs) || []).filter((x) => x && x.kind === 'fig').map((x) => x.data);
          let shapes = '', handles = '';
          fs.forEach((f, i) => {
            const col = colors[i % colors.length];
            if (f.type === 'polygon') {
              const d = f.pts.map((p, k) => (k ? 'L' : 'M') + X(p.x).toFixed(1) + ' ' + Y(p.y).toFixed(1)).join(' ') + ' Z';
              // 摆放器材输出的块带 tag：整块可以拖（改的是摆放器材的 dx、dy）
              shapes += '<path d="' + d + '" fill="' + (f.tex ? K.texFill(f, col) : col + (f.tag ? '44' : '22')) + '" stroke="' + col + '" stroke-width="2"' + (f.tag ? ' data-drag="' + f.tag + '" data-kx="dx" data-ky="dy" data-s="' + s.toFixed(4) + '" style="cursor:grab"' : '') + '/>';
            }
            else if (f.type === 'segment') shapes += '<line x1="' + X(f.pts[0].x) + '" y1="' + Y(f.pts[0].y) + '" x2="' + X(f.pts[1].x) + '" y2="' + Y(f.pts[1].y) + '" stroke="' + col + '" stroke-width="2"' + (f.dash ? ' stroke-dasharray="6 4"' : '') + '/>';
            else if (f.type === 'circle') shapes += '<circle cx="' + X(f.pts[0].x) + '" cy="' + Y(f.pts[0].y) + '" r="' + Math.sqrt(Q.num(f.r2)) * s + '" fill="none" stroke="' + col + '" stroke-width="2"/>';
            else if (f.type === 'point') {
              // 自由点（带 tag）画成可拖的把手；构造出来的点画成实心小点
              if (f.tag) handles += '<circle class="gpt" data-drag="' + f.tag + '" data-kx="x" data-ky="y" data-s="' + s.toFixed(4) + '" cx="' + X(f.pts[0].x) + '" cy="' + Y(f.pts[0].y) + '" r="7" fill="#fff" stroke="' + col + '" stroke-width="2.5" style="cursor:grab"/>';
              else shapes += K.mark(X(f.pts[0].x), Y(f.pts[0].y), 'circle', 4, { fill: col });
            }
          });
          // 符号点（任务 J，§10.7）：抛物线的交点、顶点等精确坐标，画在坐标系上。位置用近似值（只定像素），
          // 旁边的文字是精确的（2 + √3）。data-sp 是精确文字，界面和测试都从这里读。
          const sps = ((c.d && c.d.inp && c.d.inp.pts) || []).filter((x) => x && x.kind === 'spoint');
          sps.forEach((v) => {
            const px = ox + (U.Real.approx(v.data.x) + R) * s, py = oy + (R - U.Real.approx(v.data.y)) * s;
            const txt = (v.exact === false ? '≈' : '') + U.Real.show(v.data.x);   // 点在 x 轴上时写 x 坐标（2 + √3）；一般的点写整个符号点
            shapes += '<circle data-sp="' + K.esc(txt) + '" cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="4" fill="var(--ink)" stroke="var(--card)" stroke-width="1.5"/>';
            shapes += K.text(px, py - 9, txt, { size: 12, weight: 700 });
          });
          return g + shapes + handles;
        },
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
