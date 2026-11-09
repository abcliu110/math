/* 器材包 piece（§10.5.10）：剪开以后，每一块都是一个独立的器件“块”（gpiece）。
 * 块的形状来自剪切步骤的一个输出口（f 口），块自己的平移 dx/dy、旋转 turn、翻转 flip、放缩 scale、名字、颜色、锁定
 * 都是它自己的属性。拖动、旋转、翻转、放缩一块，改的是这块的属性（world 动作 t:'piece'），不再新建摆放器材。
 * 剪的工具（geo.cut 的 after 钩子）建两块：U.Piece.cutInto。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, K = U.kit, F = U.Fig, Geo = U.Geo;
  const PROP = 'p.';
  const fig = (f) => U.val('fig', f, { dim: null });
  const figIn = (c, port) => { const v = (c.inp[port] || []).find((x) => x && x.kind === 'fig'); return v ? v.data : null; };
  const fail = (why) => ({ ok: false, why });
  const ok = (x) => Object.assign({ ok: true }, x || {});

  // 两块的颜色轮流用这组（不同的块颜色各不相同，颜色可以再改）
  const COLORS = ['#f6c177', '#9ccfd8', '#c4a7e7', '#eb6f92', '#a3be8c', '#ebcb8b'];

  // 剪的工具：把 gcut 的两个输出口各接一块 gpiece，放进同一个工作区；被剪的图形在画面上隐藏（entity.hidden = true）。
  // ctx = { id: 剪切步骤 id, ws: 工作区实体, wires: [{ r: 选中对象的解析结果, port }] }
  function cutInto(scene, ctx) {
    const W = U.World;
    const src = scene.entities[ctx.wires[0].r.id];
    if (src) src.hidden = true;
    const ws = ctx.ws, base = scene.seq.gpiece || 0, made = [];
    for (let i = 0; i < 2; i++) {
      const k = base + i + 1, name = '块 ' + k;
      const id = W.add(scene, 'gpiece', ws.x + 24 + i * 12, ws.y + 44 + i * 12, { name, color: COLORS[(k - 1) % COLORS.length] });
      scene.entities[id].name = name;
      const l = W.act(scene, { t: 'link', from: ctx.id, fromPort: i === 0 ? 'a' : 'b', to: id, toPort: 'f' });
      if (!l.ok) return fail(l.why);
      const p = W.act(scene, { t: 'put', id, parent: ws.id, slot: 'items' });
      if (!p.ok) return fail(p.why);
      made.push(id);
    }
    return ok({ pieces: made });
  }

  // 块的动作：{ t:'piece', id, what:'move'|'turn'|'flip'|'scale', value }
  //   move：value = { dx, dy }（相对移动）；turn：value = 转几个 90°（默认 1，即 +90°，模 360）；
  //   flip：value = 1 左右翻、2 上下翻（再翻一次同一种就翻回去）；scale：value 是有理数字符串，乘到现在的比例上。
  // 锁住的块、被连线驱动的属性不能动。成功返回 ok；这一条动作就是一步（撤销由界面的快照栈负责）。
  function act(scene, a) {
    const e = scene.entities[a.id];
    if (!e || e.type !== 'gpiece') return fail('找不到这块');
    const def = U.types.gpiece, p = e.props;
    if (p.locked) return fail('「' + p.name + '」锁住了，先解开才能动');
    const next = {};
    switch (a.what) {
      case 'move': {
        const v = a.value || {};
        const dx = Math.round(Number(v.dx) || 0), dy = Math.round(Number(v.dy) || 0);
        next.dx = p.dx + dx; next.dy = p.dy + dy; break;
      }
      case 'turn': {
        const k = a.value === undefined ? 1 : Math.round(Number(a.value));
        if (!Number.isFinite(k)) return fail('转几个 90° 要填整数');
        next.turn = (((p.turn + k) % 4) + 4) % 4; break;
      }
      case 'flip': {
        const v = a.value === undefined ? 1 : Math.round(Number(a.value));
        if (v !== 1 && v !== 2) return fail('翻转只有左右（1）和上下（2）');
        next.flip = p.flip === v ? 0 : v; break;
      }
      case 'scale': {
        let f;
        try { f = Q.parse(String(a.value)); } catch (err) { return fail('放缩比例要填有理数，例如 2 或 1/2'); }
        if (Q.cmp(f, Q(0)) <= 0) return fail('放缩比例要大于 0');
        next.scale = Q.show(Q.mul(Q.parse(p.scale), f)); break;
      }
      default: return fail('不认识的块操作：' + a.what);
    }
    for (const k of Object.keys(next)) {
      if (scene.links.some((l) => l.to === a.id && l.toPort === PROP + k)) return fail('「' + def.props[k].label + '」正由连线驱动，先断开连线再动');
    }
    const prev = {};
    for (const k of Object.keys(next)) {
      const r = U.coerceProp(def.props[k], next[k]);
      if (!r.ok) return fail(r.why);
      prev[k] = e.props[k]; e.props[k] = r.v;
    }
    let bad = null;
    try { const D = U.World.evaluate(scene); const rj = D[e.id].sig.find((s) => s.lv === 'reject'); if (rj) bad = rj.tx; } catch (err) { bad = '这样动算不出来'; }
    if (bad) { for (const k of Object.keys(prev)) e.props[k] = prev[k]; return fail(bad); }
    return ok({ step: { t: 'piece', id: a.id, what: a.what, value: a.value === undefined ? null : a.value } });
  }

  // 放进工作区的统一入口（从器材架拖、拖台面上的卡片、工具创建，都走这里）。
  // a = { id: 要放的器材, ws: 工作区 id, x, y: 落点（工作区坐标；不给就不挪位置） }
  // 产生图形的器材：建一块 gpiece 接在它的图形口上，块的平移让图形的中心落在 (x, y)；
  // 器材自己在画面上隐藏（和剪开一样），避免同一个图形画两次。不产生图形的器材只是放进去。
  const FIG_LABEL = { ftri: '三角形', fquad: '四边形', fcirc: '圆', rect: '长方形', parallelogram: '平行四边形', tri: '三角形', quad: '四边形' };
  function dropInto(scene, a) {
    const W = U.World, E = scene.entities, e = E[a.id], ws = E[a.ws];
    if (!e) return fail('找不到要放的器材');
    if (!ws || U.roleOf(ws) !== 'container') return fail('这里不是工作区');
    if (e.parent === ws.id) return ok({ already: true });
    const p = W.act(scene, { t: 'put', id: e.id, parent: ws.id, slot: 'items' });
    if (!p.ok) return p;
    const def = U.types[e.type], port = Object.keys(def.outputs).find((k) => def.outputs[k].kind === 'fig');
    if (!port || U.roleOf(e) === 'piece' || U.roleOf(e) === 'point') return ok({ placed: e.id });
    // 图形口接一块：块的 dx、dy 让图形的中心落在落点上
    const piece = W.add(scene, 'gpiece', ws.x + 24, ws.y + 44, {});
    const k = (scene.seq.gpiece || 0), label = (FIG_LABEL[e.type] || def.label) + ' ' + (scene.seq[e.type] || 1);
    const pe = E[piece]; pe.name = label; pe.props.name = label; pe.props.color = COLORS[(k - 1) % COLORS.length];
    const l = W.act(scene, { t: 'link', from: e.id, fromPort: port, to: piece, toPort: 'f' });
    if (!l.ok) { delete E[piece]; return l; }
    const q = W.act(scene, { t: 'put', id: piece, parent: ws.id, slot: 'items' });
    if (!q.ok) return q;
    e.hidden = true;
    if (a.x !== undefined && a.y !== undefined) {
      let D; try { D = W.evaluate(scene); } catch (err) { D = null; }
      const v = D && D[e.id] && D[e.id].out[port], f = v && v.data;
      if (f && f.pts && f.pts.length) {
        const xs = f.pts.map((t) => Q.num(t.x)), ys = f.pts.map((t) => Q.num(t.y)), r = f.type === 'circle' ? Math.sqrt(Q.num(f.r2)) : 0;
        const cx = (Math.min(...xs) - r + Math.max(...xs) + r) / 2, cy = (Math.min(...ys) - r + Math.max(...ys) + r) / 2;
        const clamp = (n) => Math.max(-200, Math.min(200, Math.round(n)));
        pe.props.dx = clamp(a.x - cx); pe.props.dy = clamp(a.y - cy);
      }
    }
    return ok({ placed: e.id, piece });
  }

  U.Piece = { COLORS, cutInto, act, dropInto };

  // 块的形状：先按放缩比例放大（以左下角为中心，同摆放），再翻、转、移
  U.registerPack({
    id: 'piece', version: 1, needs: ['geo'],
    types: {
      gpiece: {
        workspaceRole: 'piece',
        handles: true,
        essence: ['E2', 'E5'],
        label: '块', prefix: '块', group: '图形', grades: [5, 9],
        props: {
          dx: { type: 'int', label: '向右移', default: 0, min: -200, max: 200 },
          dy: { type: 'int', label: '向上移', default: 0, min: -200, max: 200 },
          turn: { type: 'choice', label: '旋转', default: 0, choices: ['不转', '转 90°', '转 180°', '转 270°'] },
          flip: { type: 'choice', label: '翻转', default: 0, choices: ['不翻', '左右翻', '上下翻'] },
          scale: { type: 'text', label: '放缩（倍数）', default: '1' },
          name: { type: 'text', label: '名字', default: '块 1' },
          color: { type: 'text', label: '颜色', default: COLORS[0] },
          locked: { type: 'bool', label: '锁住（不能动）', default: false },
        },
        inputs: { f: { kind: 'fig', label: '剪下的一块' } },
        outputs: { f: { dim: null, kind: 'fig', label: '块的形状' } },
        icon: () => '<path d="M10 40 L30 40 L10 14 Z" fill="var(--ink)" fill-opacity=".25" stroke="var(--ink)" stroke-width="1.5"/>',
        size: () => [150, 70],
        compute: (c) => {
          const f = figIn(c, 'f'); if (!f) { c.say('info', '剪开以后，这块会自动接上剪下的一块'); return {}; }
          let k;
          try { k = Q.parse(c.props.scale); } catch (err) { c.say('warn', '放缩比例不对：' + c.props.scale); return {}; }
          if (Q.cmp(k, Q(0)) <= 0) { c.say('warn', '放缩比例要大于 0'); return {}; }
          let g = f;
          if (!Q.eq(k, Q(1)) && f.pts) {
            const xs = f.pts.map((p) => p.x), ys = f.pts.map((p) => p.y);
            const min = (a) => a.reduce((m, q) => (Q.cmp(q, m) < 0 ? q : m));
            g = F.scale(f, { x: min(xs), y: min(ys) }, k);
          }
          g = Geo.place(g, { flip: c.props.flip, turn: c.props.turn, dx: c.props.dx, dy: c.props.dy });
          return { f: fig(Object.assign({}, g, { tag: c.ent.id })) };
        },
        badge: (c) => c.props.name || '',
        draw: (c) => K.text(c.w / 2, c.h / 2 + 4, (c.props.name || '块') + (c.props.scale !== '1' ? ' ×' + c.props.scale : ''), { size: 13, weight: 700 }),
      },
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
