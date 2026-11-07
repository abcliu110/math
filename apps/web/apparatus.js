/* Apparatus — SVG views + pointer interaction for MathWorld.
   Laws stay in MathWorld; this file only paints and emits intents.
   Browser: window.Apparatus. */
(function (root) {
  'use strict';

  function el(tag, attrs, kids) {
    const n = document.createElementNS('http://www.w3.org/2000/svg', tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (attrs[k] === undefined || attrs[k] === null) return;
      if (k === 'textContent') n.textContent = attrs[k];
      else n.setAttribute(k, String(attrs[k]));
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }

  function clear(node) {
    if (!node) return;
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function qStr(q) {
    if (!q) return '0';
    if (typeof MathWorld !== 'undefined' && MathWorld.Q) return MathWorld.Q.str(q);
    return q.d === 1 ? String(q.n) : (q.n + '/' + q.d);
  }

  function qNum(q) {
    if (!q) return 0;
    if (typeof MathWorld !== 'undefined' && MathWorld.Q) return MathWorld.Q.toNumber(q);
    return q.n / q.d;
  }

  function parseQty(s) {
    if (!s) return null;
    if (s.indexOf('/') >= 0) {
      const p = s.split('/');
      return { n: +p[0], d: +p[1] };
    }
    return { n: +s, d: 1 };
  }

  var lastWorld = null;
  var lastDerived = null;
  var lastBalTilt = null; // 上一次天平梁的倾斜角（做倾斜过渡用）
  var onIntent = null;
  var drag = null; // { kind, ... }
  var ghostEl = null;

  function ensureGhost() {
    if (ghostEl) return ghostEl;
    if (typeof document === 'undefined' || !document.body) return null;
    ghostEl = document.createElement('div');
    ghostEl.className = 'apparatus-ghost';
    ghostEl.setAttribute('aria-hidden', 'true');
    document.body.appendChild(ghostEl);
    return ghostEl;
  }

  function showGhost(label, x, y) {
    const g = ensureGhost();
    if (!g) return;
    g.textContent = label;
    g.style.display = 'block';
    g.style.left = (x + 12) + 'px';
    g.style.top = (y + 12) + 'px';
  }

  function hideGhost() {
    if (ghostEl) ghostEl.style.display = 'none';
  }

  function svgLocal(svg, clientX, clientY) {
    if (!svg || !svg.createSVGPoint || !svg.getScreenCTM) return null;
    try {
      const pt = svg.createSVGPoint();
      pt.x = clientX; pt.y = clientY;
      const m = svg.getScreenCTM();
      if (!m) return null;
      return pt.matrixTransform(m.inverse());
    } catch (e) { return null; }
  }

  function emit(intent, okText, failText) {
    if (typeof onIntent === 'function') onIntent(intent, okText, failText);
  }

  /* ---------- Fraction bars (drag fill handle) ---------- */
  function paintFracBar(host, frac, opts) {
    opts = opts || {};
    const W = 260, H = 40, x0 = 36, y0 = 4;
    const n = frac.n | 0, d = Math.max(1, frac.d | 0);
    const unit = W / d;
    const g = el('g', {});
    g.appendChild(el('rect', {
      x: x0, y: y0, width: W, height: H, rx: 8,
      fill: '#f1f5f9', stroke: '#94a3b8', 'stroke-width': 2,
    }));
    for (let i = 0; i < d; i++) {
      const filled = i < n;
      g.appendChild(el('rect', {
        x: x0 + i * unit + 1, y: y0 + 2, width: Math.max(2, unit - 2), height: H - 4, rx: 4,
        fill: filled ? (opts.color || '#fb923c') : '#263449',
        stroke: filled ? (opts.stroke || '#c2410c') : '#475569',
        'stroke-width': 1,
        'data-frac-seg': String(i),
        'data-frac-side': opts.side || '',
        style: 'cursor:pointer',
      }));
    }
    // draggable handle at fill edge
    const hx = x0 + (n / d) * W;
    g.appendChild(el('circle', {
      cx: hx, cy: y0 + H / 2, r: 11,
      fill: '#fff', stroke: opts.stroke || '#c2410c', 'stroke-width': 3,
      'data-frac-handle': opts.side || '',
      style: 'cursor:ew-resize',
    }));
    g.appendChild(el('text', {
      x: 8, y: y0 + 26, 'font-size': 14, 'font-weight': 700, fill: '#94a3b8',
      textContent: opts.side || '',
    }));
    g.appendChild(el('text', {
      x: x0 + W + 10, y: y0 + 26, 'font-size': 16, 'font-weight': 700,
      fill: '#f8fafc', textContent: qStr(frac),
    }));
    host.appendChild(g);
    return { x0: x0, W: W, y0: y0, H: H, side: opts.side, d: d };
  }

  function renderFracboard(svg, world, derived) {
    clear(svg);
    svg.setAttribute('viewBox', '0 0 360 230');
    const A = world.fracboard.A, B = world.fracboard.B;
    const gA = el('g', { transform: 'translate(0,12)' });
    paintFracBar(gA, A, { side: 'A', color: '#fb923c', stroke: '#c2410c' });
    svg.appendChild(gA);
    const gB = el('g', { transform: 'translate(0,70)' });
    paintFracBar(gB, B, { side: 'B', color: '#60a5fa', stroke: '#1d4ed8' });
    svg.appendChild(gB);

    // denom chips
    [['A', 2], ['A', 3], ['A', 4], ['A', 6], ['B', 2], ['B', 3], ['B', 4], ['B', 6]].forEach(function (pair, i) {
      const side = pair[0], d = pair[1];
      const x = 36 + (i % 4) * 54 + (side === 'B' ? 0 : 0);
      const y = side === 'A' ? 118 : 118;
      // two rows
      const row = side === 'A' ? 0 : 1;
      const col = i % 4;
      const xx = 36 + col * 70;
      const yy = 118 + row * 36;
      if (i < 4 && side === 'A' || i >= 4 && side === 'B') {
        /* painted below */
      }
    });
    // simpler: A denom row then B
    [2, 3, 4, 6, 8].forEach(function (d, i) {
      svg.appendChild(chipBtn(36 + i * 58, 122, 'A 分母' + d, {
        'data-frac-denom': 'A', 'data-frac-d': String(d),
      }, A.d === d));
      svg.appendChild(chipBtn(36 + i * 58, 158, 'B 分母' + d, {
        'data-frac-denom': 'B', 'data-frac-d': String(d),
      }, B.d === d));
    });
    svg.appendChild(chipBtn(130, 196, '拼一拼', { 'data-frac-add': '1' }, false, true));

    if (world.meta && world.meta.fracAdded) {
      const scale = Math.max(1.15, qNum(derived.fracboard.trueSum) * 1.05);
      const trackW = 200;
      svg.appendChild(el('text', {
        x: 36, y: 210, 'font-size': 11, fill: '#fca5a5',
        textContent: '错 ' + derived.fracboard.naiveStr,
      }));
      // keep compact comparison above add button area — draw at top right
      svg.appendChild(el('rect', {
        x: 250, y: 200, width: trackW * 0.4, height: 8, rx: 4, fill: '#f87171',
        width: Math.min(90, (qNum(derived.fracboard.naive) / scale) * 90),
      }));
    }
  }

  function chipBtn(x, y, label, dataAttrs, active, primary) {
    const g = el('g', Object.assign({
      transform: 'translate(' + x + ' ' + y + ')',
      style: 'cursor:pointer',
    }, dataAttrs));
    // put data on group
    Object.keys(dataAttrs || {}).forEach(function (k) { g.setAttribute(k, dataAttrs[k]); });
    g.appendChild(el('rect', {
      x: 0, y: 0, width: 54, height: 28, rx: 8,
      fill: primary ? '#ea580c' : (active ? '#ffedd5' : '#1a2438'),
      stroke: primary ? '#c2410c' : (active ? '#f97316' : '#94a3b8'),
      'stroke-width': 2,
    }));
    g.appendChild(el('text', {
      x: 27, y: 19, 'font-size': 11, 'text-anchor': 'middle', 'font-weight': 700,
      fill: primary ? '#fff' : (active ? '#0f172a' : '#e2e8f0'), textContent: label,
      style: 'pointer-events:none',
    }));
    return g;
  }

  /* ---------- Balance with weight shelf ---------- */
  function panWeights(world, side) {
    const ids = world.balance[side] || [];
    return ids.map(function (id) {
      const p = world.pieces[id];
      if (!p) return null;
      return p.kind === 'frac' ? { n: p.n, d: p.d, label: qStr(p) } : { n: p.v, d: 1, label: String(p.v) };
    }).filter(Boolean);
  }

  function weightChip(x, y, label, qtyStr) {
    const g = el('g', {
      transform: 'translate(' + x + ' ' + y + ')',
      'data-drag-weight': qtyStr,
      style: 'cursor:grab',
    });
    g.appendChild(el('rect', {
      x: 0, y: 0, width: 44, height: 28, rx: 6,
      fill: '#fff7ed', stroke: '#ea580c', 'stroke-width': 2,
      style: 'pointer-events:none',
    }));
    g.appendChild(el('text', {
      x: 22, y: 19, 'font-size': 12, 'text-anchor': 'middle', 'font-weight': 700,
      fill: '#9a3412', textContent: label, style: 'pointer-events:none',
    }));
    return g;
  }

  function renderBalance(svg, world, derived) {
    clear(svg);
    svg.setAttribute('viewBox', '0 0 340 250');
    const tilt = derived.balance.tilt || 0;
    // shelf
    svg.appendChild(el('text', {
      x: 12, y: 18, 'font-size': 12, fill: '#94a3b8',
      textContent: '拖砝码到左盘 / 右盘',
    }));
    [['1/2', '1/2'], ['1/3', '1/3'], ['1/4', '1/4'], ['1/6', '1/6'], ['1', '1']].forEach(function (w, i) {
      svg.appendChild(weightChip(12 + i * 52, 28, w[0], w[1]));
    });
    svg.appendChild(el('line', {
      x1: 20, y1: 220, x2: 320, y2: 220, stroke: '#94a3b8', 'stroke-width': 4,
    }));
    svg.appendChild(el('line', {
      x1: 170, y1: 220, x2: 170, y2: 110, stroke: '#cbd5e1', 'stroke-width': 5,
    }));
    const beam = el('g', {
      style: 'transition:transform .2s ease',
    });
    // 梁要“转过去”而不是“跳过去”：整幅 SVG 每次重建，写在 transform
    // 属性上的过渡永远跑不起来，而且属性和 style.transform 会叠加成双倍角
    // （2026-11-07 复测：点一下就到满倾斜，一次中间角度都没有）。所以角度
    // 只走 style.transform 一条路：先按上一次的角画出来（无过渡），强制重排，
    // 再用 style.transform 缓动到新角度；第一次画或角度没变就直接写到位。
    if (beam.style && typeof window !== 'undefined' && window.requestAnimationFrame
      && lastBalTilt !== null && lastBalTilt !== tilt) {
      beam.style.transformBox = 'view-box';
      beam.style.transformOrigin = '170px 110px';
      beam.style.transition = 'none';
      beam.style.transform = 'rotate(' + lastBalTilt + 'deg)';
      if (beam.getBoundingClientRect) void beam.getBoundingClientRect();
      window.requestAnimationFrame(function () {
        beam.style.transition = 'transform .35s ease';
        beam.style.transform = 'rotate(' + tilt + 'deg)';
      });
    } else if (beam.style) {
      beam.style.transformBox = 'view-box';
      beam.style.transformOrigin = '170px 110px';
      beam.style.transform = 'rotate(' + tilt + 'deg)';
    }
    lastBalTilt = tilt;
    beam.appendChild(el('line', {
      x1: 50, y1: 110, x2: 290, y2: 110, stroke: '#cbd5e1', 'stroke-width': 5,
      'stroke-linecap': 'round',
    }));
    function drawPan(cx, weights, side, fill) {
      const pan = el('g', { 'data-bal-pan': side });
      pan.appendChild(el('line', {
        x1: cx, y1: 110, x2: cx, y2: 145, stroke: '#94a3b8', 'stroke-width': 3,
      }));
      // big hit target
      pan.appendChild(el('ellipse', {
        cx: cx, cy: 158, rx: 48, ry: 22,
        fill: fill, stroke: '#94a3b8', 'stroke-width': 2,
        'data-bal-pan': side,
      }));
      pan.appendChild(el('path', {
        d: 'M' + (cx - 36) + ' 145 Q' + cx + ' 175 ' + (cx + 36) + ' 145 Z',
        fill: fill, stroke: '#94a3b8', 'stroke-width': 2,
        'data-bal-pan': side,
      }));
      weights.forEach(function (w, i) {
        const bx = cx - 28 + (i % 3) * 18;
        const by = 132 - Math.floor(i / 3) * 16;
        pan.appendChild(el('rect', {
          x: bx, y: by, width: 16, height: 14, rx: 2,
          fill: w.d === 1 ? '#94a3b8' : '#fb923c',
          stroke: '#cbd5e1', 'stroke-width': 1,
        }));
        pan.appendChild(el('text', {
          x: bx + 8, y: by + 11, 'font-size': 8, 'text-anchor': 'middle',
          fill: '#0f172a', textContent: w.label,
        }));
      });
      pan.appendChild(el('text', {
        x: cx, y: 198, 'font-size': 12, 'text-anchor': 'middle', fill: '#94a3b8',
        textContent: side === 'L' ? '左盘' : '右盘',
      }));
      return pan;
    }
    beam.appendChild(drawPan(80, panWeights(world, 'L'), 'L', derived.balance.equal ? '#bbf7d0' : '#e2e8f0'));
    beam.appendChild(drawPan(260, panWeights(world, 'R'), 'R', derived.balance.equal ? '#bbf7d0' : '#e2e8f0'));
    svg.appendChild(beam);
    svg.appendChild(el('circle', { cx: 170, cy: 110, r: 7, fill: '#f97316' }));
    svg.appendChild(el('text', {
      x: 170, y: 95, 'font-size': 13, 'text-anchor': 'middle', 'font-weight': 700,
      fill: derived.balance.equal ? '#4ade80' : '#fdba74',
      textContent: '左 ' + derived.balance.Lstr + ' ＝ 右 ' + derived.balance.Rstr,
    }));
    // clear hit
    svg.appendChild(chipBtn(270, 28, '清空', { 'data-bal-clear': '1' }, false, false));
  }

  /* ---------- Number line with drag chips ---------- */
  function renderNumline(svg, world, derived) {
    clear(svg);
    svg.setAttribute('viewBox', '0 0 340 150');
    const min = world.numline.min, max = world.numline.max;
    const x0 = 36, x1 = 300, y = 95;
    const span = Math.max(0.0001, max - min);
    function xOf(v) { return x0 + ((v - min) / span) * (x1 - x0); }
    function vOf(x) { return min + ((x - x0) / (x1 - x0)) * span; }

    svg.appendChild(el('text', {
      x: 12, y: 18, 'font-size': 12, fill: '#94a3b8',
      textContent: '拖下面的数到数轴上（只到 ' + max + '）',
    }));
    [['7', '7'], ['1', '1'], ['1/2', '1/2'], ['0', '0'], ['2', '2']].forEach(function (w, i) {
      const g = el('g', {
        transform: 'translate(' + (12 + i * 52) + ' 28)',
        'data-drag-num': w[1],
        style: 'cursor:grab',
      });
      g.appendChild(el('rect', {
        x: 0, y: 0, width: 44, height: 28, rx: 6,
        fill: '#eff6ff', stroke: '#3b82f6', 'stroke-width': 2,
        style: 'pointer-events:none',
      }));
      g.appendChild(el('text', {
        x: 22, y: 19, 'font-size': 13, 'text-anchor': 'middle', 'font-weight': 700,
        fill: '#1e3a8a', textContent: w[0], style: 'pointer-events:none',
      }));
      svg.appendChild(g);
    });

    // axis ray + arrow (textbook number line)
    svg.appendChild(el('rect', {
      x: x0 - 10, y: y - 24, width: (x1 - x0) + 36, height: 48, rx: 10,
      fill: '#0b1220', stroke: '#334155', 'stroke-width': 1,
      'data-numline-track': '1',
    }));
    svg.appendChild(el('line', {
      x1: x0, y1: y, x2: x1, y2: y, stroke: '#cbd5e1', 'stroke-width': 3,
      'stroke-linecap': 'round', 'data-numline-track': '1',
    }));
    svg.appendChild(el('polygon', {
      points: (x1 + 2) + ',' + y + ' ' + (x1 - 12) + ',' + (y - 8) + ' ' + (x1 - 12) + ',' + (y + 8),
      fill: '#cbd5e1', 'data-numline-track': '1',
    }));
    for (let t = min; t <= max + 1e-9; t += 0.5) {
      const xx = xOf(t);
      const major = Math.abs(t - Math.round(t)) < 1e-9;
      svg.appendChild(el('line', {
        x1: xx, y1: y - (major ? 10 : 6), x2: xx, y2: y + (major ? 10 : 6),
        stroke: '#cbd5e1', 'stroke-width': major ? 2.5 : 1.5,
      }));
      if (major) {
        svg.appendChild(el('text', {
          x: xx, y: y + 28, 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700,
          fill: '#f8fafc', textContent: String(Math.round(t)),
        }));
      }
    }
    (derived.numline.pts || []).forEach(function (p, i) {
      const xx = xOf(qNum(p));
      svg.appendChild(el('circle', {
        cx: xx, cy: y, r: 11,
        fill: i === 0 ? '#fb923c' : '#60a5fa',
        stroke: '#fff', 'stroke-width': 3,
        'data-numline-pt': String(i),
        style: 'cursor:grab',
      }));
      svg.appendChild(el('text', {
        x: xx, y: y - 18, 'font-size': 12, 'text-anchor': 'middle', 'font-weight': 700,
        fill: '#f8fafc', textContent: qStr(p),
      }));
    });
    if (world.meta && world.meta.lastNumlineReject) {
      svg.appendChild(el('rect', {
        x: 70, y: 62, width: 200, height: 20, rx: 8, fill: '#fee2e2', stroke: '#f87171',
      }));
      svg.appendChild(el('text', {
        x: 170, y: 76, 'font-size': 12, 'text-anchor': 'middle', fill: '#fca5a5',
        textContent: '越界：放不进这条数轴',
      }));
    }
    svg.appendChild(chipBtn(270, 28, '清空', { 'data-nl-clear': '1' }, false, false));
    svg._numlineMap = { xOf: xOf, vOf: vOf, x0: x0, x1: x1, y: y, min: min, max: max };
  }

  /* ---------- Chicken: click animals + drag slider ---------- */
  function animalIcon(kind, x, y, s, idx) {
    const g = el('g', {
      transform: 'translate(' + x + ' ' + y + ')',
      'data-ck-animal': kind,
      'data-ck-idx': String(idx),
      style: 'cursor:pointer',
    });
    if (kind === 'rabbit') {
      g.appendChild(el('ellipse', { cx: s * 0.5, cy: s * 0.62, rx: s * 0.32, ry: s * 0.28, fill: '#f5d0c5', stroke: '#9a3412', 'stroke-width': 1 }));
      g.appendChild(el('ellipse', { cx: s * 0.32, cy: s * 0.22, rx: s * 0.08, ry: s * 0.22, fill: '#f5d0c5', stroke: '#9a3412', 'stroke-width': 1 }));
      g.appendChild(el('ellipse', { cx: s * 0.48, cy: s * 0.18, rx: s * 0.08, ry: s * 0.24, fill: '#f5d0c5', stroke: '#9a3412', 'stroke-width': 1 }));
    } else {
      g.appendChild(el('ellipse', { cx: s * 0.5, cy: s * 0.58, rx: s * 0.34, ry: s * 0.28, fill: '#fde68a', stroke: '#a16207', 'stroke-width': 1 }));
      g.appendChild(el('circle', { cx: s * 0.78, cy: s * 0.42, r: s * 0.14, fill: '#fde68a', stroke: '#a16207', 'stroke-width': 1 }));
      g.appendChild(el('polygon', {
        points: (s * 0.88) + ',' + (s * 0.42) + ' ' + (s * 1.05) + ',' + (s * 0.38) + ' ' + (s * 0.88) + ',' + (s * 0.5),
        fill: '#f97316',
      }));
    }
    return g;
  }

  function renderChicken(svg, world, derived) {
    clear(svg);
    const ck = derived.chicken;
    svg.setAttribute('viewBox', '0 0 340 240');
    svg.appendChild(el('rect', {
      x: 8, y: 8, width: 324, height: 130, rx: 12,
      fill: '#fff7ed', stroke: '#fdba74', 'stroke-width': 2,
    }));
    if (!ck) {
      svg.appendChild(el('text', {
        x: 170, y: 80, 'font-size': 14, 'text-anchor': 'middle', fill: '#9a3412',
        textContent: '还没有鸡兔题',
      }));
      return;
    }
    const maxShow = 30;
    const rabbits = Math.min(ck.rabbits, maxShow);
    const chickens = Math.min(ck.chickens, maxShow - rabbits);
    const cols = 10;
    const s = (rabbits + chickens) > 20 ? 20 : 26;
    let idx = 0;
    for (let i = 0; i < rabbits; i++, idx++) {
      const col = i % cols, row = Math.floor(i / cols);
      svg.appendChild(animalIcon('rabbit', 16 + col * (s + 2), 14 + row * (s + 2), s, idx));
    }
    for (let i = 0; i < chickens; i++, idx++) {
      const j = rabbits + i;
      const col = j % cols, row = Math.floor(j / cols);
      svg.appendChild(animalIcon('chicken', 16 + col * (s + 2), 14 + row * (s + 2), s, idx));
    }
    svg.appendChild(el('text', {
      x: 170, y: 155, 'font-size': 12, 'text-anchor': 'middle', fill: '#fdba74',
      textContent: '点一只鸡→变兔；点一只兔→变鸡。或拖滑杆。',
    }));
    // slider
    const trackX = 40, trackW = 260, trackY = 180;
    const tHeads = Math.max(1, ck.targetHeads);
    const thumbX = trackX + (ck.rabbits / tHeads) * trackW;
    svg.appendChild(el('text', {
      x: trackX, y: trackY - 10, 'font-size': 12, fill: '#94a3b8', textContent: '兔 0',
    }));
    svg.appendChild(el('text', {
      x: trackX + trackW, y: trackY - 10, 'font-size': 12, 'text-anchor': 'end', fill: '#94a3b8',
      textContent: '兔 ' + tHeads,
    }));
    svg.appendChild(el('rect', {
      x: trackX, y: trackY - 6, width: trackW, height: 12, rx: 6,
      fill: '#334155', 'data-ck-track': '1',
    }));
    svg.appendChild(el('circle', {
      cx: thumbX, cy: trackY, r: 14,
      fill: '#f97316', stroke: '#fff', 'stroke-width': 3,
      'data-ck-thumb': '1', style: 'cursor:ew-resize',
    }));
    const ok = ck.solved;
    svg.appendChild(el('text', {
      x: 170, y: 215, 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700,
      fill: ok ? '#4ade80' : '#fdba74',
      textContent: '鸡 ' + ck.chickens + ' · 兔 ' + ck.rabbits + ' · 腿 ' + ck.legs + ' / ' + ck.targetLegs,
    }));
    svg._ckMap = { trackX: trackX, trackW: trackW, targetHeads: tHeads };
  }

  /* ---------- Linefn: same axis convention as drawFuncGraph in app.js ---------- */
  function renderLinefn(svg, world, derived) {
    clear(svg);
    // Match main demo ranges/padding so (0,0) and ticks look like a real plane.
    const W = 340, H = 260;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    const xMin = -5, xMax = 6, yMin = -10, yMax = 24;
    const left = 48, right = 24, top = 28, bottom = 36;
    function X(x) { return left + (x - xMin) / (xMax - xMin) * (W - left - right); }
    function Y(y) { return H - bottom - (y - yMin) / (yMax - yMin) * (H - top - bottom); }
    function yFrom(py) { return yMin + (H - bottom - py) / (H - top - bottom) * (yMax - yMin); }
    function xFrom(px) { return xMin + (px - left) / (W - left - right) * (xMax - xMin); }

    svg.appendChild(el('rect', { x: 0, y: 0, width: W, height: H, fill: '#0b1220', rx: 10 }));
    svg.appendChild(el('text', {
      x: W / 2, y: 16, 'font-size': 12, 'text-anchor': 'middle', fill: '#94a3b8',
      textContent: '拖蓝点改截距 b · 拖橙点改斜率（经 (2,y)）',
    }));

    // grid
    for (let xi = xMin; xi <= xMax; xi++) {
      svg.appendChild(el('line', {
        x1: X(xi), y1: Y(yMin), x2: X(xi), y2: Y(yMax),
        stroke: '#263449', 'stroke-width': 1,
      }));
    }
    for (let yi = -10; yi <= 20; yi += 5) {
      svg.appendChild(el('line', {
        x1: X(xMin), y1: Y(yi), x2: X(xMax), y2: Y(yi),
        stroke: '#263449', 'stroke-width': 1,
      }));
    }

    // axes through origin (explicit — not "thicker grid")
    svg.appendChild(el('line', {
      x1: X(xMin), y1: Y(0), x2: X(xMax), y2: Y(0),
      stroke: '#cbd5e1', 'stroke-width': 2.5, 'stroke-linecap': 'round',
    }));
    svg.appendChild(el('line', {
      x1: X(0), y1: Y(yMin), x2: X(0), y2: Y(yMax),
      stroke: '#cbd5e1', 'stroke-width': 2.5, 'stroke-linecap': 'round',
    }));
    // arrows
    svg.appendChild(el('polygon', {
      points: X(xMax) + ',' + Y(0) + ' ' + (X(xMax) - 10) + ',' + (Y(0) - 5) + ' ' + (X(xMax) - 10) + ',' + (Y(0) + 5),
      fill: '#cbd5e1',
    }));
    svg.appendChild(el('polygon', {
      points: X(0) + ',' + Y(yMax) + ' ' + (X(0) - 5) + ',' + (Y(yMax) + 10) + ' ' + (X(0) + 5) + ',' + (Y(yMax) + 10),
      fill: '#cbd5e1',
    }));
    svg.appendChild(el('text', {
      x: X(xMax) - 12, y: Y(0) - 10, 'font-size': 13, fill: '#94a3b8', textContent: 'x',
    }));
    svg.appendChild(el('text', {
      x: X(0) + 10, y: Y(yMax) + 14, 'font-size': 13, fill: '#94a3b8', textContent: 'y',
    }));
    // tick labels
    for (let xi = -4; xi <= 5; xi++) {
      if (xi === 0) continue;
      svg.appendChild(el('text', {
        x: X(xi), y: Y(0) + 16, 'font-size': 11, 'text-anchor': 'middle', fill: '#94a3b8',
        textContent: String(xi),
      }));
    }
    svg.appendChild(el('text', {
      x: X(0) - 10, y: Y(0) + 14, 'font-size': 11, 'text-anchor': 'end', fill: '#94a3b8',
      textContent: '0',
    }));
    for (let yi = -10; yi <= 20; yi += 5) {
      if (yi === 0) continue;
      svg.appendChild(el('text', {
        x: X(0) - 8, y: Y(yi) + 4, 'font-size': 11, 'text-anchor': 'end', fill: '#94a3b8',
        textContent: String(yi),
      }));
    }

    const k = world.linefn.k, b = world.linefn.b;
    // clip line endpoints to plot y-range for clean edges
    let x1 = xMin, y1 = k * xMin + b, x2 = xMax, y2 = k * xMax + b;
    svg.appendChild(el('line', {
      x1: X(x1), y1: Y(y1), x2: X(x2), y2: Y(y2),
      stroke: '#ff8a3d', 'stroke-width': 4, 'stroke-linecap': 'round',
      'data-fn-line': '1',
    }));

    // intercept (0,b) — blue, same as main demo
    svg.appendChild(el('circle', {
      cx: X(0), cy: Y(b), r: 8,
      fill: '#2563eb', stroke: '#fff', 'stroke-width': 2,
      'data-fn-handle': 'b', style: 'cursor:ns-resize',
    }));
    svg.appendChild(el('text', {
      x: X(0) + 12, y: Y(b) - 8, 'font-size': 13, fill: '#93c5fd', 'font-weight': 700,
      textContent: '(0, ' + b + ')',
    }));

    // slope handle at x=2
    const yAt2 = derived.linefn.yAt2;
    svg.appendChild(el('circle', {
      cx: X(2), cy: Y(yAt2), r: 8,
      fill: '#ff8a3d', stroke: '#fff', 'stroke-width': 2,
      'data-fn-handle': 'k', style: 'cursor:grab',
    }));
    svg.appendChild(el('text', {
      x: X(2) + 12, y: Y(yAt2) + 4, 'font-size': 12, fill: '#fdba74', 'font-weight': 700,
      textContent: '(2, ' + yAt2 + ')',
    }));

    const ks = k === 1 ? 'x' : k === -1 ? '-x' : (k + 'x');
    const bs = b >= 0 ? ' + ' + b : ' − ' + (-b);
    svg.appendChild(el('text', {
      x: 12, y: H - 10, 'font-size': 14, 'font-weight': 700, fill: '#f8fafc',
      textContent: 'y = ' + ks + bs,
    }));
    svg._fnMap = { X: X, Y: Y, xFrom: xFrom, yFrom: yFrom, k: k, b: b, yMin: yMin, yMax: yMax };
  }

  /* ---------- Public render ---------- */
  function renderAll(world, derived) {
    if (!world || !derived) return;
    lastWorld = world;
    lastDerived = derived;
    // Mid-drag full SVG rebuild kills the pointer target — skip until pointerup.
    if (drag) return;
    const map = {
      worldFracSvg: renderFracboard,
      worldBalSvg: renderBalance,
      worldLineSvg: renderNumline,
      worldCkSvg: renderChicken,
      worldFnSvg: renderLinefn,
    };
    Object.keys(map).forEach(function (id) {
      const svg = typeof document !== 'undefined' ? document.getElementById(id) : null;
      if (svg) map[id](svg, world, derived);
    });
  }

  function isDragging() { return !!drag; }

  function closestData(target, names) {
    let n = target;
    while (n && n.nodeType === 1) {
      if (n.getAttribute) {
        for (let i = 0; i < names.length; i++) {
          if (n.hasAttribute(names[i])) return { el: n, attr: names[i], val: n.getAttribute(names[i]) };
        }
      }
      n = n.parentNode || n.parentElement;
    }
    return null;
  }

  function pointInRect(clientX, clientY, el, pad) {
    if (!el || !el.getBoundingClientRect) return false;
    const r = el.getBoundingClientRect();
    const p = pad || 0;
    return clientX >= r.left - p && clientX <= r.right + p
      && clientY >= r.top - p && clientY <= r.bottom + p;
  }

  function dropAt(clientX, clientY) {
    if (typeof document === 'undefined') return null;
    const nodes = document.querySelectorAll('[data-drop]');
    for (let i = 0; i < nodes.length; i++) {
      if (pointInRect(clientX, clientY, nodes[i], 6)) {
        return { el: nodes[i], attr: 'data-drop', val: nodes[i].getAttribute('data-drop') };
      }
    }
    return null;
  }

  // 天平盘的几何落点：盘子本身就是落点（NB 式）。viewBox 340x250，
  // 左盘中心 x=80、右盘中心 x=260，盘面约在 y 80-190。
  function panHitAt(clientX, clientY) {
    const svg = document.getElementById('worldBalSvg');
    if (!svg || !svg.getBoundingClientRect) return null;
    const r = svg.getBoundingClientRect();
    if (!r.width || !r.height) return null;
    if (clientX < r.left || clientX > r.right || clientY < r.top || clientY > r.bottom) return null;
    const vx = ((clientX - r.left) / r.width) * 340;
    const vy = ((clientY - r.top) / r.height) * 250;
    if (vx >= 24 && vx <= 136 && vy >= 80 && vy <= 190) return 'L';
    if (vx >= 204 && vx <= 316 && vy >= 80 && vy <= 190) return 'R';
    return null;
  }

  function hitAt(clientX, clientY, names) {
    hideGhost();
    // 几何优先：盘子本身就是落点。elementsFromPoint 在内嵌浏览器里
    // 不可靠（缩放/滚动时失效），旧代码只有虚线框能接住、盘子图片
    // 接不住（2026-11-07 复测）。旧的“天平 SVG 内任意点都算盘”
    // 兜底也一并去掉：落在砝码架/文字上不再算放到盘里。
    if (names.indexOf('data-bal-pan') >= 0) {
      const side = panHitAt(clientX, clientY);
      if (side) {
        const svg = document.getElementById('worldBalSvg');
        return { el: svg, attr: 'data-bal-pan', val: side };
      }
    }
    // Prefer geometry hit for HTML drop docks — elementsFromPoint fails when
    // the page is scaled/scrolled inside embedded browsers.
    if (names.indexOf('data-drop') >= 0) {
      const d = dropAt(clientX, clientY);
      if (d) return d;
    }
    const stack = (document.elementsFromPoint
      ? document.elementsFromPoint(clientX, clientY)
      : (document.elementFromPoint ? [document.elementFromPoint(clientX, clientY)] : []));
    for (let i = 0; i < stack.length; i++) {
      if (!stack[i]) continue;
      const hit = closestData(stack[i], names);
      if (hit) return hit;
    }
    // SVG numline geometry fallback
    if (names.indexOf('data-numline-track') >= 0) {
      const svg = document.getElementById('worldLineSvg');
      const wide = document.getElementById('worldLineDrop');
      if ((wide && pointInRect(clientX, clientY, wide, 6))
        || (svg && pointInRect(clientX, clientY, svg, 0))) {
        return { el: svg || wide, attr: 'data-numline-track', val: '1' };
      }
    }
    return null;
  }

  function clearDropHot() {
    if (typeof document === 'undefined') return;
    const nodes = document.querySelectorAll('.apparatus-drop.is-hot');
    for (let i = 0; i < nodes.length; i++) nodes[i].classList.remove('is-hot');
    const balSvg = document.getElementById('worldBalSvg');
    if (balSvg) {
      const pans = balSvg.querySelectorAll('[data-bal-pan].is-hot');
      for (let i = 0; i < pans.length; i++) pans[i].classList.remove('is-hot');
    }
  }

  function markDropHot(clientX, clientY) {
    clearDropHot();
    // 盘子本身就是落点：拖到盘子上方时盘子先亮起来。
    const side = panHitAt(clientX, clientY);
    if (side) {
      const svg = document.getElementById('worldBalSvg');
      const pan = svg && svg.querySelector('[data-bal-pan="' + side + '"]');
      if (pan) pan.classList.add('is-hot');
      return;
    }
    const hit = dropAt(clientX, clientY);
    if (hit) hit.el.classList.add('is-hot');
  }

  function placeNumOnLine(qty) {
    emit({ type: 'ui-place-num', qty: qty }, null, null);
  }

  function captureOn(el, pointerId) {
    try { if (el && el.setPointerCapture) el.setPointerCapture(pointerId); } catch (err) {}
  }

  function releaseCap(el, pointerId) {
    try { if (el && el.releasePointerCapture) el.releasePointerCapture(pointerId); } catch (err) {}
  }

  function endDragSession(e) {
    if (!drag) return null;
    const finished = drag;
    drag = null;
    clearDropHot();
    hideGhost();
    if (finished.sourceEl) finished.sourceEl.classList.remove('is-dragging');
    releaseCap(finished.captureEl || finished.sourceEl, finished.pointerId);
    return finished;
  }

  function bind(root, handler) {
    onIntent = handler;
    if (!root || root._apparatusBound) return;
    root._apparatusBound = true;

    function onDown(e) {
      if (drag) return;
      const t = e.target;
      if (!t) return;

      // HTML chip dock (primary drag path)
      const chip = closestData(t, ['data-drag-chip']);
      if (chip) {
        const qty = chip.el.getAttribute('data-qty') || chip.el.textContent.trim();
        const kind = chip.val === 'num' ? 'num' : 'weight';
        drag = {
          kind: kind, qty: qty, label: qty, pointerId: e.pointerId,
          sourceEl: chip.el, captureEl: chip.el,
        };
        chip.el.classList.add('is-dragging');
        showGhost(qty, e.clientX, e.clientY);
        captureOn(chip.el, e.pointerId);
        e.preventDefault();
        return;
      }

      const fh = closestData(t, ['data-frac-handle']);
      if (fh && lastWorld) {
        const side = fh.val;
        const svg = document.getElementById('worldFracSvg');
        drag = {
          kind: 'frac-handle', side: side, svg: svg, pointerId: e.pointerId,
          captureEl: svg || root,
          pendingN: lastWorld.fracboard[side].n,
          pendingD: lastWorld.fracboard[side].d,
        };
        captureOn(drag.captureEl, e.pointerId);
        e.preventDefault();
        return;
      }

      const wt = closestData(t, ['data-drag-weight']);
      if (wt) {
        drag = {
          kind: 'weight', qty: wt.val, label: wt.val, pointerId: e.pointerId,
          // 指针捕获在砝码本身（不是根节点）：快拖时指针一出砝码就丢事件，浏览器就当成选文字了（2026-11-07 复测）。
          captureEl: wt.el, sourceEl: wt.el,
        };
        showGhost(wt.val, e.clientX, e.clientY);
        captureOn(wt.el, e.pointerId);
        e.preventDefault();
        return;
      }

      const nm = closestData(t, ['data-drag-num']);
      if (nm) {
        drag = {
          kind: 'num', qty: nm.val, label: nm.val, pointerId: e.pointerId,
          captureEl: nm.el, sourceEl: nm.el,
        };
        showGhost(nm.val, e.clientX, e.clientY);
        captureOn(nm.el, e.pointerId);
        e.preventDefault();
        return;
      }

      const th = closestData(t, ['data-ck-thumb', 'data-ck-track']);
      if (th) {
        const svg = document.getElementById('worldCkSvg');
        drag = {
          kind: 'ck-slider', svg: svg, pointerId: e.pointerId, captureEl: svg || root,
          pendingR: lastWorld && lastWorld.chicken ? lastWorld.chicken.rabbits : 0,
        };
        captureOn(drag.captureEl, e.pointerId);
        e.preventDefault();
        return;
      }

      const fn = closestData(t, ['data-fn-handle']);
      if (fn) {
        const svg = document.getElementById('worldFnSvg');
        drag = {
          kind: 'fn-' + fn.val, svg: svg, pointerId: e.pointerId, captureEl: svg || root,
          pendingK: lastWorld ? lastWorld.linefn.k : 0,
          pendingB: lastWorld ? lastWorld.linefn.b : 0,
        };
        captureOn(drag.captureEl, e.pointerId);
        e.preventDefault();
      }
    }

    function onMove(e) {
      if (!drag) return;
      if (drag.pointerId != null && e.pointerId !== drag.pointerId) return;

      if (drag.kind === 'weight' || drag.kind === 'num') {
        markDropHot(e.clientX, e.clientY);
        showGhost(drag.label, e.clientX, e.clientY);
        return;
      }

      if (drag.kind === 'frac-handle' && drag.svg && lastWorld) {
        const pt = svgLocal(drag.svg, e.clientX, e.clientY);
        if (!pt) return;
        const x0 = 36, W = 260;
        let ratio = (pt.x - x0) / W;
        ratio = Math.max(0, Math.min(1, ratio));
        const d = lastWorld.fracboard[drag.side].d;
        drag.pendingN = Math.round(ratio * d);
        drag.pendingD = d;
        return;
      }

      if (drag.kind === 'ck-slider' && drag.svg && drag.svg._ckMap) {
        const pt = svgLocal(drag.svg, e.clientX, e.clientY);
        if (!pt) return;
        const m = drag.svg._ckMap;
        let r = Math.round(((pt.x - m.trackX) / m.trackW) * m.targetHeads);
        drag.pendingR = Math.max(0, Math.min(m.targetHeads, r));
        const thumb = drag.svg.querySelector('[data-ck-thumb]');
        if (thumb) {
          const cx = m.trackX + (drag.pendingR / m.targetHeads) * m.trackW;
          thumb.setAttribute('cx', String(cx));
        }
        return;
      }

      if ((drag.kind === 'fn-b' || drag.kind === 'fn-k') && drag.svg && drag.svg._fnMap) {
        const pt = svgLocal(drag.svg, e.clientX, e.clientY);
        if (!pt) return;
        const m = drag.svg._fnMap;
        const y = m.yFrom(pt.y);
        if (drag.kind === 'fn-b') {
          drag.pendingB = Math.max(0, Math.min(15, Math.round(y)));
          const h = drag.svg.querySelector('[data-fn-handle="b"]');
          if (h) h.setAttribute('cy', String(m.Y(drag.pendingB)));
        } else {
          const b0 = drag.pendingB != null ? drag.pendingB : (lastWorld ? lastWorld.linefn.b : 0);
          let k = (y - b0) / 2;
          k = Math.round(k * 2) / 2;
          drag.pendingK = Math.max(-3, Math.min(4, k));
          const h = drag.svg.querySelector('[data-fn-handle="k"]');
          if (h) h.setAttribute('cy', String(m.Y(drag.pendingK * 2 + b0)));
        }
      }
    }

    function onUp(e) {
      if (!drag) return;
      if (drag.pointerId != null && e.pointerId !== drag.pointerId) return;
      const finished = endDragSession(e);
      if (!finished) return;

      if (finished.kind === 'weight') {
        const drop = hitAt(e.clientX, e.clientY, ['data-drop', 'data-bal-pan']);
        if (!drop) return;
        const qty = parseQty(finished.qty);
        let side = null;
        if (drop.attr === 'data-bal-pan') side = drop.val;
        else if (drop.val === 'balance.L') side = 'L';
        else if (drop.val === 'balance.R') side = 'R';
        if (side && qty) emit({ type: 'balanceAddQty', side: side, qty: qty });
        return;
      }

      if (finished.kind === 'num') {
        const drop = hitAt(e.clientX, e.clientY, ['data-drop', 'data-numline-track', 'data-numline-pt']);
        const svg = document.getElementById('worldLineSvg');
        const underSvg = !drop && svg && document.elementsFromPoint
          ? document.elementsFromPoint(e.clientX, e.clientY).some(function (n) { return svg.contains(n); })
          : false;
        if (drop || underSvg) placeNumOnLine(parseQty(finished.qty));
        return;
      }

      if (finished.kind === 'frac-handle' && finished.pendingN != null) {
        emit({
          type: 'fracboardSet',
          side: finished.side,
          n: finished.pendingN,
          d: finished.pendingD,
        });
        return;
      }

      if (finished.kind === 'ck-slider' && finished.pendingR != null) {
        emit({ type: 'chickenSetRabbits', rabbits: finished.pendingR });
        return;
      }

      if (finished.kind === 'fn-b') {
        emit({ type: 'linefnSet', b: finished.pendingB });
        return;
      }
      if (finished.kind === 'fn-k') {
        emit({ type: 'linefnSet', k: finished.pendingK });
      }
    }

    root.addEventListener('pointerdown', onDown);
    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerup', onUp);
    root.addEventListener('pointercancel', onUp);
    // 快拖时浏览器会把指针移动当成选文字：拖动中禁掉选区，拖完恢复（2026-11-07 复测：快拖砝码只选中文字）。
    root.addEventListener('selectstart', function (e) { if (drag) e.preventDefault(); });
    // Capture lost cases still finish via window.
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);

    root.addEventListener('click', function (e) {
      if (drag) return;
      const t = e.target;

      const seg = closestData(t, ['data-frac-seg']);
      if (seg && lastWorld) {
        const side = seg.el.getAttribute('data-frac-side');
        const i = parseInt(seg.val, 10);
        const d = lastWorld.fracboard[side].d;
        const cur = lastWorld.fracboard[side].n;
        const next = (i + 1 === cur) ? i : (i + 1);
        emit({ type: 'fracboardSet', side: side, n: Math.max(0, next), d: d });
        return;
      }
      const den = closestData(t, ['data-frac-denom']);
      if (den && lastWorld) {
        const side = den.val;
        const d = parseInt(den.el.getAttribute('data-frac-d'), 10);
        let n = lastWorld.fracboard[side].n;
        if (n > d) n = d;
        emit({ type: 'fracboardSet', side: side, n: n, d: d });
        return;
      }
      if (closestData(t, ['data-frac-add'])) {
        emit({ type: 'ui-frac-add' });
        return;
      }
      if (closestData(t, ['data-bal-clear'])) {
        emit({ type: 'ui-bal-clear' });
        return;
      }
      if (closestData(t, ['data-nl-clear'])) {
        emit({ type: 'numlineClear' });
        return;
      }
      const animal = closestData(t, ['data-ck-animal']);
      if (animal && lastWorld && lastWorld.chicken) {
        let r = lastWorld.chicken.rabbits | 0;
        if (animal.val === 'chicken') r = Math.min(lastWorld.chicken.targetHeads, r + 1);
        else r = Math.max(0, r - 1);
        emit({ type: 'chickenSetRabbits', rabbits: r });
      }
    });
  }

  const api = {
    render: renderAll,
    bind: bind,
    isDragging: isDragging,
    version: '0.3.0',
  };
  root.Apparatus = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
