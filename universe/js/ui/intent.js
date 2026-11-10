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
        A({ t: 'del', id: p.id, keep: p.keep });
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
    // 复制一个自由点围成的图形：新建同样的点（偏移 dx、dy）和多边形，放进工作区。一步
    copyfig: {
      label: 'copyfig',
      fn(A, p, ctx) {
        const S = UI.S, E = S.scene.entities, ws = E[p.ws];
        const map = {};
        for (const id of p.verts) {
          if (map[id]) continue;
          const o = E[id].props, n = A({ t: 'add', type: E[id].type, x: 0, y: 0, props: { x: o.x + p.dx, y: o.y + p.dy, mark: nextPointName(S.scene) } });
          A({ t: 'put', id: n.id, parent: ws.id, slot: 'items' }); map[id] = n.id;
        }
        const poly = A({ t: 'add', type: E[p.poly].type, x: 0, y: 0 }).id;
        for (const id of p.verts) A({ t: 'link', from: map[id], fromPort: 'p', to: poly, toPort: 'pts' });
        A({ t: 'put', id: poly, parent: ws.id, slot: 'items' });
        ctx.id = poly;
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
