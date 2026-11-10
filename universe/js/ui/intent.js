/* 意图层（U3）：每个用户手势（拖、点、键盘、按钮）只说“用户想做什么”，由这里翻译成动作。
 * 一个手势只调用一次 UI.App.tx，所以一个手势就是一个撤销项、一条事件、一次存档。
 * stage.js、panels.js、app.js 不直接写动作（tools/lint-ui.js 检查）；动作只在这个文件里出现。
 * 例外：clock（时钟的开停、倒带）不是编辑，不进撤销，走 UI.App.clockAct；preview（拖动预览）只改台面，松手时才提交。 */
(function (G) {
  'use strict';
  const U = G.U, UI = (G.UI = G.UI || {}), W = U.World;

  // 把 id 放进 tgt（UI.Stage.dropTarget 的结果）：工作区 → wsdrop；槽位 → put；
  // 没有目标：out 有值就取出来放到 out 的位置（块拖出工作区），否则原来在容器里的就取出来
  function putTarget(A, id, tgt, out) {
    if (tgt && tgt.ws) return A({ t: 'wsdrop', id, ws: tgt.ws, x: tgt.x, y: tgt.y });
    if (tgt && tgt.parent) return A({ t: 'put', id, parent: tgt.parent, slot: tgt.slot });
    if (out) { A({ t: 'take', id }); return A({ t: 'move', id, x: Math.round(out.x), y: Math.round(out.y) }); }
    const e = UI.S.scene.entities[id];
    if (e && e.parent) return A({ t: 'take', id });
  }

  // 吸附到构造点（V4）：在工作区里建它的构造器材（con.type），两个输入口（con.wire）接上 con.ids 的自由点，放进工作区。
  // 已经有同样接法的器材（同一工作区）就直接用它，不重复建。整串在调用它的那一个手势里，是一个撤销项。
  function buildConstruct(A, ws, con) {
    const E = UI.S.scene.entities, L = UI.S.scene.links;
    // 要接的口：wire 按顺序接 ids，extra 是另外指定的（垂足的起点）。接线的来源口都是 p（点的输出口）
    const ports = con.wire.map((port, i) => ({ port, id: con.ids[i] })).concat(con.extra || []);
    const same = Object.values(E).find((e) => e.type === con.type && e.parent === ws.id && ports.every((q) => L.some((l) => l.to === e.id && l.toPort === q.port && l.from === q.id)));
    const d = same ? same.id : A({ t: 'add', type: con.type, x: 0, y: 0 }).id;
    if (!same) {
      ports.forEach((q) => A({ t: 'link', from: q.id, fromPort: 'p', to: d, toPort: q.port }));
      A({ t: 'put', id: d, parent: ws.id, slot: 'items' });
    }
    return { id: d, port: con.out };
  }

  // 约束器材（§10.5.9 第 1 条）：kind 0 定长（接 a、b），1 直角（接 a、b 顶点、c）；放进工作区，返回它的 id
  function addCon(A, ws, kind, len, ids) {
    const c = A({ t: 'add', type: 'gcon', x: 0, y: 0, props: { kind, len } }).id;
    ids.forEach((id, i) => A({ t: 'link', from: id, fromPort: 'p', to: c, toPort: ['a', 'b', 'c'][i] }));
    A({ t: 'put', id: c, parent: ws, slot: 'items' });
    return c;
  }

  // 点的名字（2.6）：新点自动叫下一个没用过的字母（A、B、C…，用完再用 A1、B1…）。用过的 = 所有点的名字属性、角色和名字。
  // 角色是点的器材声明（workspaceRole 为 point），不按器材名判断。
  const isPointType = (type) => !!(U.types[type] && U.types[type].workspaceRole === 'point');
  function nextPointName(scene) {
    const used = new Set();
    for (const e of Object.values(scene.entities)) {
      if (!isPointType(e.type)) continue;
      for (const v of [e.props && e.props.mark, e.role, e.name]) if (v) used.add(String(v));
    }
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let n = 0; ; n++) for (const ch of letters) { const nm = n ? ch + n : ch; if (!used.has(nm)) return nm; }
  }

  // ---- 复制、镜像复制（§10.5.9 第 4 条）----
  // 镜像的朝向：块的摆放是“翻转 → 转 → 平移”。镜像等于再沿竖直线翻一次：左右翻（1）和不翻（0）互换，转的角度取负；上下翻（2）等于左右翻再转 180°，所以转的角度是 2 − 转。
  function mirrorState(flip, turn) {
    const f = +flip || 0, t = +turn || 0;
    if (f === 0) return { flip: 1, turn: ((-t % 4) + 4) % 4 };
    if (f === 1) return { flip: 0, turn: ((-t % 4) + 4) % 4 };
    return { flip: 0, turn: ((2 - t) % 4 + 4) % 4 };
  }
  // 块的副本接着同一个剪切来源（同一条输入线）：形状、放缩一样；名字是新的，颜色按顺序换一个。
  // 普通复制：位置偏移 (2, −2)。镜像：副本是原图沿它右边界的镜像（左边贴着原图的右边，底边对齐）。
  function pasteOnePiece(A, it) {
    const S = UI.S, src = S.scene.entities[it.id];
    if (!src) throw { why: '找不到要复制的块' };
    const feed = S.scene.links.find((l) => l.to === it.id && l.toPort === 'f');
    const id = A({ t: 'copy', id: it.id }).id;
    if (feed) A({ t: 'link', from: feed.from, fromPort: feed.fromPort, to: id, toPort: 'f' });
    const k = S.scene.seq.gpiece, name = '块 ' + k;
    A({ t: 'rename', id, name });
    A({ t: 'set', id, k: 'name', v: name });
    A({ t: 'set', id, k: 'color', v: U.Piece.COLORS[(k - 1) % U.Piece.COLORS.length] });
    let dx = src.props.dx + (it.mirror ? 0 : 2), dy = src.props.dy + (it.mirror ? 0 : -2);
    if (it.mirror) { const m = mirrorState(src.props.flip, src.props.turn); A({ t: 'set', id, k: 'flip', v: m.flip }); A({ t: 'set', id, k: 'turn', v: m.turn }); }
    A({ t: 'set', id, k: 'dx', v: dx }); A({ t: 'set', id, k: 'dy', v: dy });
    if (it.mirror) {
      let pts = null;
      try { const D = U.World.evaluate(S.scene); pts = D[id] && D[id].out.f && D[id].out.f.data ? D[id].out.f.data.pts : null; } catch (err) { pts = null; }
      if (!pts) throw { why: '这一块现在算不出形状，镜像不了' };
      const minX = Math.min(...pts.map((q) => U.Q.num(q.x))), minY = Math.min(...pts.map((q) => U.Q.num(q.y)));
      A({ t: 'set', id, k: 'dx', v: dx + Math.round(it.edgeX - minX) }); A({ t: 'set', id, k: 'dy', v: dy + Math.round(it.bottomY - minY) });
    }
  }
  // 自由点围成的图形：新建同样的点和多边形，放进工作区。普通复制找一个放得下的偏移；镜像 x → 2×右边界 − x，贴着原图的右边
  function pasteOneFig(A, it, wsId) {
    const S = UI.S, E = S.scene.entities, ws = E[wsId], poly = E[it.poly], LIM = UI.LAYOUT.COORD_MAX;
    if (!poly || !ws) throw { why: '找不到要复制的图形' };
    const lim = (v) => Math.abs(v) <= LIM, V = it.verts.filter((g, i, a) => a.indexOf(g) === i);
    let off = [0, 0], edge = 0;
    if (it.mirror) {
      edge = Math.max(...V.map((g) => E[g].props.x));
      if (!V.every((g) => lim(2 * edge - E[g].props.x) && lim(E[g].props.y))) throw { why: '镜像会超出工作区的坐标范围（±' + LIM + '），先把图形挪近中间再镜像' };
    } else {
      const cand = [[2, -2], [-2, -2], [2, 2], [-2, 2], [4, 0], [-4, 0], [0, 4], [0, -4]];
      const found = cand.find(([dx, dy]) => V.every((g) => lim(E[g].props.x + dx) && lim(E[g].props.y + dy)));
      if (!found) throw { why: '工作区里放不下一份副本（坐标范围 ±' + LIM + '）' };
      off = found;
    }
    const map = {};
    for (const id of V) {
      const o = E[id].props;
      const x = it.mirror ? 2 * edge - o.x : o.x + off[0], y = it.mirror ? o.y : o.y + off[1];
      const n = A({ t: 'add', type: E[id].type, x: 0, y: 0, props: { x, y, mark: nextPointName(S.scene) } });
      A({ t: 'put', id: n.id, parent: ws.id, slot: 'items' }); map[id] = n.id;
    }
    const pid = A({ t: 'add', type: poly.type, x: 0, y: 0 }).id;
    for (const id of V) A({ t: 'link', from: map[id], fromPort: 'p', to: pid, toPort: 'pts' });
    A({ t: 'put', id: pid, parent: ws.id, slot: 'items' });
  }

  const KINDS = {
    // 点击器材架瓦片，或从器材架拖出来：新建一个器材；拖到容器上就直接放进去（一步完成）。新点自动命名（2.6）
    add: {
      label: 'add',
      fn(A, p, ctx) {
        const r = A({ t: 'add', type: p.type, x: p.x, y: p.y });
        ctx.id = r.id;
        if (isPointType(p.type)) A({ t: 'set', id: r.id, k: 'mark', v: nextPointName(UI.S.scene) });
        if (!p.ev) return;
        const tgt = UI.Stage.dropTarget(p.ev, r.id);
        if (tgt) return putTarget(A, r.id, tgt);
        // 落在台面上：不能盖住容器（工作区、十格阵）。和点击添加一样，找一个不重叠的空位（同一个事务，一个撤销项）
        const sp = UI.Stage.freeSpot(p.x, p.y, p.type, r.id);
        if (sp.x !== p.x || sp.y !== p.y) A({ t: 'move', id: r.id, x: sp.x, y: sp.y });
      },
      after(r, p, ctx) { if ((p.select || p.ev) && ctx.id) { UI.S.sel = ctx.id; UI.S.selLink = null; } },
    },
    // 松手：把台面上的卡片放进容器（工作区、槽位），或取出来；p.target 为空时用 UI.Stage.dropTarget 现算
    drop: {
      label: 'drop',
      fn(A, p) { putTarget(A, p.id, p.target !== undefined ? p.target : UI.Stage.dropTarget(p.ev, p.id, { piece: !!p.piece }), p.out); },
    },
    // 拖到工作区里（或工作区外）：图形落在鼠标松开的位置
    wsdrop: {
      label: 'wsdrop',
      fn(A, p) { A({ t: 'wsdrop', id: p.id, ws: p.ws, x: p.x, y: p.y }); },
    },
    // 拖动一个卡片：移到新位置；如果松手时落在容器上，就放进容器（一次拖动一个撤销项）
    move: {
      label: 'move',
      fn(A, p) {
        A({ t: 'move', id: p.id, x: p.x, y: p.y });
        const tgt = UI.Stage.dropTarget(p.ev, p.id);
        if (tgt) return putTarget(A, p.id, tgt);
        // 松手压在容器上却放不进去（不接受它）：挪到容器旁边不重叠的空位（同一事务）。
        // 容器自己被拖到别的卡片上，也挪开，免得把游离卡片盖住
        const e = UI.S.scene.entities[p.id];
        if (!e) return;
        if (e.parent) return putTarget(A, p.id, null);   // 从容器里拖出来：取出（原来的行为）
        const isCont = !!(U.types[e.type] && U.types[e.type].slots);
        if (!isCont && !UI.Stage.overContainer(p.x, p.y, e.type, p.id)) return;
        const sp = UI.Stage.freeSpot(p.x, p.y, e.type, p.id);
        if (sp.x !== p.x || sp.y !== p.y) A({ t: 'move', id: p.id, x: sp.x, y: sp.y });
      },
    },
    // 删除：一个器材（里面有东西时先问，见 pre）、一根线（p.link）、工作区里的一步（p.step，连它剪出来的块一起删）
    delete: {
      label: 'del',
      pre(p) {
        if (p.link) { UI.S.selLink = null; return null; }
        if (p.step) return null;
        // V5：别的器材依赖它（连线从它出发）→ 先列出受影响的器材，用户确认后才删（删除与依赖一起删）
        if (!p.confirmed) {
          const deps = W.dependentsOf(UI.S.scene, p.id);
          if (deps.length) {
            UI.App.askDeps(p.id, deps, () => run('delete', Object.assign({}, p, { confirmed: true })));
            return { ok: true, pending: true };
          }
        }
        if (p.keep !== undefined) return null;
        const kids = W.childrenOf(UI.S.scene, p.id);
        if (!kids.length) return null;
        UI.App.askDelete(p.id, kids.length);   // 1.10：里面有东西，先问连里面一起删还是倒到台面上
        return { ok: true, pending: true };
      },
      fn(A, p, ctx) {
        if (p.link) return A({ t: 'unlink', id: p.link });
        if (p.step) {
          for (const pc of p.pieces || []) A({ t: 'del', id: pc });
          A({ t: 'del', id: p.step });
          if (p.src && UI.S.scene.entities[p.src]) UI.S.scene.entities[p.src].hidden = false;   // 被剪的图形重新显示
          ctx.id = p.step; return;
        }
        ctx.id = p.id;
        // V5：用户已确认“删除并同时删除依赖”：先删依赖它的器材（直接和间接），再删它自己；整串是一个撤销项
        if (p.confirmed) for (const d of W.dependentsOf(UI.S.scene, p.id)) A({ t: 'del', id: d });
        // 只删容器（keep: 'out'）：里面的东西倒到台面上。它们原来的位置可能压在别的工作区上，
        // 所以和取出来一样，每一个都挪到不重叠的空位（同一个事务，一个撤销项）
        const outKids = p.keep === 'all' ? [] : W.childrenOf(UI.S.scene, p.id);
        A({ t: 'del', id: p.id, keep: p.keep });
        for (const k of outKids) {
          if (!UI.S.scene.entities[k.id]) continue;
          const sp = UI.Stage.freeSpot(k.x, k.y, k.type, k.id);
          if (sp.x !== k.x || sp.y !== k.y) A({ t: 'move', id: k.id, x: sp.x, y: sp.y });
        }
        // 删图形时顺带删它的顶点：别处（线、中点……）还连着的顶点留下
        for (const v of p.alsoVerts || []) if (UI.S.scene.entities[v] && !UI.S.scene.links.some((l) => l.from === v)) A({ t: 'del', id: v });
      },
      after(r, p, ctx) { if (ctx.id && UI.S.sel === ctx.id) UI.S.sel = null; },
    },
    // 工作区的工具（连线、剪、对齐、移动……）：选中的对象交给世界的 tool 动作
    tool: {
      label: 'tool',
      fn(A, p) { return A({ t: 'tool', ws: p.ws, tool: p.tool, picks: p.picks, args: p.args }); },
    },
    // 点两下画线（连线、剪）：建点（不是顶点的才建）、建线段；剪的模式再建剪刀、剪开。整串是一步
    draw: {
      label: 'draw',
      fn(A, p) {
        const S = UI.S, ws = S.scene.entities[p.ws];
        // 端点：自由点（顶点）直接用；构造点（吸附到的中点等）建它的器材，用它的输出；都不是就新建一个自由点
        const ends = [p.a, p.b].map((q) => {
          if (q.ref) return { id: q.ref, port: 'p' };
          if (q.con) return buildConstruct(A, ws, q.con);
          const n = A({ t: 'add', type: 'gpt', x: 0, y: 0, props: { x: q.x, y: q.y, mark: nextPointName(S.scene) } });
          A({ t: 'put', id: n.id, parent: ws.id, slot: 'items' });
          return { id: n.id, port: 'p' };
        });
        const sg = A({ t: 'add', type: 'gseg', x: 0, y: 0 }).id;
        A({ t: 'link', from: ends[0].id, fromPort: ends[0].port, to: sg, toPort: 'a' });
        A({ t: 'link', from: ends[1].id, fromPort: ends[1].port, to: sg, toPort: 'b' });
        A({ t: 'put', id: sg, parent: ws.id, slot: 'items' });
        if (p.cut) {
          const cut = p.cut, gc = A({ t: 'add', type: 'gcut', x: 0, y: 0 }).id;
          A({ t: 'link', from: cut.id, fromPort: cut.port, to: gc, toPort: 'f' });
          A({ t: 'link', from: sg, fromPort: 's', to: gc, toPort: 'line' });
          A({ t: 'put', id: gc, parent: ws.id, slot: 'items' });
          const pc = U.Piece.cutInto(S.scene, { id: gc, ws, wires: [{ r: { id: cut.id } }] });
          if (!pc.ok) throw { why: pc.why };
        }
      },
    },
    // 拖动自由点吸附到构造点（V4，§1.3）：自由点不能存分数坐标，所以它变成构造点：建构造器材（接它的两个点、或三个点），
    // 原来从这个点出去的线改接到构造器材的输出（relink，线的位置不变，多边形顶点顺序不变），再删掉这个点。整串是一步
    snapdrag: {
      label: 'snap',
      fn(A, p) {
        const S = UI.S, ws = S.scene.entities[p.ws], P = p.id;
        if (!ws || !S.scene.entities[P]) throw { why: '这个点已经不在了' };
        const c = buildConstruct(A, ws, p.con);
        for (const l of S.scene.links.filter((x) => x.from === P)) A({ t: 'relink', id: l.id, from: c.id, fromPort: c.port });
        A({ t: 'del', id: P });
      },
    },
    // 工作区里放一个常见图形（梯形、菱形……）：建器材，再放进工作区变成自由点和多边形。一步
    shape: {
      label: 'shape',
      fn(A, p) {
        const r = A({ t: 'add', type: p.type, x: 0, y: 0 });
        A({ t: 'wsdrop', id: r.id, ws: p.ws, x: p.x, y: p.y });
      },
    },
    // 复制、镜像复制（§10.5.9 第 4 条）：items 是要复制的图形（块或自由点图形），整批是一步（一次撤销）；ws 是放自由点图形的工作区
    paste: {
      label: 'paste',
      fn(A, p) {
        for (const it of p.items) { if (it.kind === 'piece') pasteOnePiece(A, it); else pasteOneFig(A, it, p.ws); }
      },
    },
    // 锁长 / 锁直角（§10.5.9 第 1 条）：约束器材接着它锁住的点，放进工作区。已经锁着就解锁（删掉约束）。
    // seg：线段（锁长，当前长度必须是整数）；poly + verts：多边形（锁住它所有的直角顶点，整批是一步）
    lock: {
      label: 'lock',
      fn(A, p) {
        const S = UI.S, LK = U.Geo.locks;
        if (p.seg) {
          const ends = LK.segEnds(S.scene, p.seg); if (!ends) throw { why: '线段的两端没接好，锁不了' };
          const old = LK.lenOf(S.scene, ends);
          if (old) return A({ t: 'del', id: old.id });
          const r = LK.canLen(S.scene, ends[0], ends[1]); if (!r.ok) throw { why: r.why };
          return addCon(A, S.scene.entities[p.seg].parent, 0, r.len, ends);
        }
        const tris = LK.rightAt(S.scene, p.verts || []);
        if (!tris.length) throw { why: '这个多边形没有直角可以锁' };
        const have = tris.map((t) => LK.rightOf(S.scene, t));
        if (have.every((c) => c)) return have.forEach((c) => A({ t: 'del', id: c.id }));
        for (const t of tris) if (!LK.rightOf(S.scene, t)) addCon(A, p.ws, 1, 1, t);
      },
    },
    // 尺寸驱动（§10.5.9 第 2 条）：直接输入线段的长度。没有锁就先锁住（一步），再把端点挪到长 len 的位置上（离原来最近的）。
    // 整串是一步：撤销一次回到原来的长。
    dim: {
      label: 'dim',
      fn(A, p) {
        const S = UI.S, LK = U.Geo.locks, ends = LK.segEnds(S.scene, p.seg);
        if (!ends) throw { why: '线段的两端没接好，改不了长' };
        let con = LK.lenOf(S.scene, ends);
        if (!con) con = { id: addCon(A, S.scene.entities[p.seg].parent, 0, p.len, ends) };
        else if (con.len === p.len) return;
        else A({ t: 'set', id: con.id, k: 'len', v: p.len });
        const r = LK.dim(S.scene, con.id, p.len);
        if (!r.ok) throw { why: r.why };
        A({ t: 'set', id: r.id, k: 'x', v: r.x });
        A({ t: 'set', id: r.id, k: 'y', v: r.y });
      },
    },
    // 编组（§10.5.9 第 3 条）：ids 记同一个组号 gid；gid 为空就取消编组
    group: { label: 'group', fn(A, p) { return A({ t: 'group', ids: p.ids, gid: p.gid || null }); } },
    // 连线：从一个输出口拉到一个输入口
    link: {
      label: 'link',
      fn(A, p) { return A({ t: 'link', from: p.from, fromPort: p.fromPort, to: p.to, toPort: p.toPort }); },
      after(r) { if (r && r.replaced) UI.App.say('这个口只能接一根线，旧的线换掉了', 'warn', 2200); },
    },
    unlink: { label: 'unlink', fn(A, p) { return A({ t: 'unlink', id: p.id }); } },
    // 改一个参数（属性面板里）
    set: { label: 'set', fn(A, p) { return A({ t: 'set', id: p.id, k: p.k, v: p.v }); } },
    // 一组参数（拖动松手、翻转）：ops 里 { id, k, v } 是参数，{ id, what, value } 是块的动作，按顺序做
    params: {
      label: 'params',
      fn(A, p) { for (const op of p.ops) { if (op.what !== undefined) A({ t: 'piece', id: op.id, what: op.what, value: op.value }); else A({ t: 'set', id: op.id, k: op.k, v: op.v }); } },
    },
    // 块的动作（转、翻、移动、缩放……）：ids 是要做的块，value 是参数
    piece: {
      label: 'piece',
      fn(A, p) { for (const id of p.ids) A({ t: 'piece', id, what: p.what, value: p.value }); },
    },
    // 块的旋转（V9，2.10）：转过 90° 的部分是块的转动（内核的 turn，一个动作，值为 0 也记一步），余下的 0–89 写在块的 approxDeg 上
    // （界面层的近似，不是属性，内核的数值语义不变）。撤销快照带着 approxDeg，所以撤销一次就回去。整串是一步。
    spin: {
      label: 'spin',
      fn(A, p) {
        A({ t: 'piece', id: p.id, what: 'turn', value: p.turn });
        const e = UI.S.scene.entities[p.id];
        if (p.approx) e.approxDeg = p.approx; else delete e.approxDeg;
      },
    },
    rename: {
      label: 'rename',
      fn(A, p) {
        const r = A({ t: 'rename', id: p.id, name: p.name });
        if (p.alsoProp) A({ t: 'set', id: p.id, k: p.alsoProp, v: p.name });   // 块：名字同时写到器材名和「名字」属性
        return r;
      },
    },
    resize: { label: 'resize', fn(A, p) { return A({ t: 'resize', id: p.id, w: p.w, h: p.h }); } },
    copy: { label: 'copy', fn(A, p) { return A({ t: 'copy', id: p.id }); } },
    reset: { label: 'reset', fn(A, p) { return A({ t: 'reset', id: p.id }); } },
    resetstate: { label: 'resetstate', fn(A, p) { return A({ t: 'resetstate', id: p.id }); } },
    tidy: { label: 'tidy', fn(A) { return A({ t: 'tidy' }); } },
    // 工作台的步骤写进台面（D8：竖式、数据图表台；式子工作台的 I 也是这一条）。内核先判断能不能做，这里只写回。
    wbsteps: { label: 'wb', fn(A, p) { return A({ t: 'wb', host: p.host, key: p.key, steps: p.steps }); } },
    // 定型（§10.5.6 第 5 步）：内核判断能不能做（没有新步骤就拒绝，说明原因）；写回台面是一个动作
    wbbake: {
      label: 'bake',
      fn(A, p) {
        const st = U.Workbench.bake(p.st);
        if (st.lastError) throw { why: st.lastError };
        return A(U.ExprBench.saveAction(p.id, p.eq, st));
      },
    },
    // 清空台面：先问（会删几个器材），确认后才清；撤销一次找回
    clear: {
      label: 'clear',
      pre(p) {
        if (p.confirmed) return null;
        UI.App.askClear(Object.keys(UI.S.scene.entities).length, () => run('clear', { confirmed: true }));
        return { ok: true, pending: true };
      },
      fn(A) { return A({ t: 'clear' }); },
      after() { UI.S.sel = null; UI.S.selLink = null; },
    },
  };

  // 执行一个手势：只调用一次 UI.App.tx。p.before 是拖动开始前的台面（拖动预览不进撤销），p.label 可改事件名
  function run(kind, p) {
    const K = KINDS[kind];
    if (!K) throw new Error('没有这种手势：' + kind);
    p = p || {};
    if (K.pre) { const early = K.pre(p); if (early) return early; }
    const ctx = {};
    return UI.App.tx(p.label || K.label, (A) => K.fn(A, p, ctx), {
      from: p.before,
      after: K.after ? (r) => K.after(r, p, ctx) : undefined,
    });
  }

  // 拖动中的预览：只改台面，不进撤销、不记事件、不存档（松手时用 run 提交）
  function preview(kind, p) {
    if (kind === 'resize') return UI.App.preview({ t: 'resize', id: p.id, w: p.w, h: p.h });
    if (kind === 'move') return UI.App.preview({ t: 'move', id: p.id, x: p.x, y: p.y });
    throw new Error('没有这种预览：' + kind);
  }

  // 时钟（开停、倒带、倍速）：不是编辑，不进撤销
  function clock(p) { return UI.App.clockAct(Object.assign({ t: 'clock' }, p)); }

  UI.Intent = { run, preview, clock, kinds: Object.keys(KINDS) };
})(window);
