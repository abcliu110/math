/* 世界：场景图 + 唯一的改动入口 act + 纯函数 evaluate + 世界时钟 tick。
 *
 * 场景 = { v, nid, seq, entities:{id:{id,type,name,x,y,props,state?,role?,k}}, links:[{id,from,fromPort,to,toPort}], clock }
 * 全部可 JSON 序列化：撤销、自动保存、分享、回放都是同一份数据。
 *
 * 属性即端口：toPort 以 'p.' 开头表示驱动该属性（例如 'p.n'）。
 *
 * 求值（一跳）：
 *   A. 有状态器材先按自己的状态读出输出（read），与本跳输入无关
 *   B. 无状态器材按拓扑序算（compute）。指向“有状态器材”的边不参与排序——它们在 C 阶段才被读
 *   C. 时钟走一拍时：所有有状态器材同时用本跳算出的输入走一步（step），再重算一遍
 * 世界规律：连线可以成环，但环上必须至少有一个有状态器材（记忆）。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q;
  const PROP = 'p.';
  const isProp = (p) => typeof p === 'string' && p.startsWith(PROP);
  const clone = (s) => U.JSON.parse(U.JSON.stringify(s));
  const ok = (x) => Object.assign({ ok: true }, x || {});
  const fail = (why) => ({ ok: false, why });

  // ---------- 容器与层级（1.10）----------
  // 布局：子实体的位置由它在容器槽位里的序号决定；free = 不重排，保留拖放的位置
  const LAYOUTS = {
    grid2x5: (i) => ({ dx: 14 + (i % 5) * 22, dy: 40 + Math.floor(i / 5) * 22 }),
    onAxis: (i) => ({ dx: 14 + i * 18, dy: 30 }),
    free: null,
  };
  U.LAYOUTS = LAYOUTS;
  // 直接子实体（可按槽位过滤）。顺序 = 放入的先后（对象键的插入顺序）
  function childrenOf(scene, id, slot) {
    return Object.values(scene.entities).filter((e) => e.parent === id && (slot === undefined || e.slot === slot));
  }
  // 谁依赖 id（V5）：沿连线（from → to）往下游找，直接和间接依赖它的器材（不含 id 自己），按找到的先后排列。
  // 删除前用它列出会受影响的器材：连线少了，依赖它的器材（如多边形的顶点）就会变
  function dependentsOf(scene, id) {
    const out = [], seen = { [id]: 1 }, queue = [id];
    while (queue.length) {
      const c = queue.shift();
      for (const l of scene.links) if (l.from === c && !seen[l.to] && scene.entities[l.to]) { seen[l.to] = 1; out.push(l.to); queue.push(l.to); }
    }
    return out;
  }
  // cand 是否在 anc 里面（含 cand === anc）；沿 parent 链往上走，防止成环
  function isInside(scene, cand, anc) {
    const seen = {}; let c = cand;
    while (c && !seen[c]) { if (c === anc) return true; seen[c] = 1; const e = scene.entities[c]; c = e ? e.parent : null; }
    return false;
  }
  // 按布局重排某个容器的所有子实体
  function relayout(scene, pid) {
    const p = scene.entities[pid]; if (!p) return;
    const slots = (U.types[p.type] && U.types[p.type].slots) || {};
    for (const sn of Object.keys(slots)) {
      const lay = LAYOUTS[slots[sn].layout]; if (!lay) continue;
      childrenOf(scene, pid, sn).forEach((k, i) => { const pos = lay(i); k.x = p.x + pos.dx; k.y = p.y + pos.dy; });
    }
  }
  const defOf = (e) => { const d = U.types[e.type]; if (!d) throw new Error('unknown-type:' + e.type); return d; };
  const errText = (err) => (err && err.message === 'overflow' ? '数太大，算不下' : err && err.message === 'bad-number' ? '这个数不合法' : err && err.message === 'div0' ? '除数不能是 0' : '算不出来');

  const LOOP_WHY = '这样连，数会自己追自己，永远算不完。中间放一个“记忆器”，让它一拍一拍地算。';

  function blank() {
    return { v: CURRENT_V, nid: 1, seq: {}, entities: {}, links: [], clock: { t: 0, n: 0, running: false, hz: 4, rate: 1, seed: 20261108 } };
  }

  function add(scene, type, x, y, props) {
    const def = U.types[type];
    const id = 'e' + scene.nid++;
    scene.seq[type] = (scene.seq[type] || 0) + 1;
    const p = U.defaultProps(def, props);
    const ent = { id, type, name: def.prefix + scene.seq[type], x: Math.round(x), y: Math.round(y), props: p, k: 1, parent: null, slot: null };
    if (def.stateful) ent.state = def.init(p);
    scene.entities[id] = ent;
    return id;
  }

  // ---------- 图 ----------
  function isStateful(scene, id) { const e = scene.entities[id]; return !!(e && U.types[e.type] && U.types[e.type].stateful); }

  // 新加一条 from→to 会不会形成“没有记忆的环”。指向有状态器材的边被切断，所以经过记忆的环是合法的。
  function createsUnsafeCycle(scene, from, to) {
    if (isStateful(scene, to)) return false;
    if (from === to) return true;
    const seen = {}, st = [to];
    while (st.length) {
      const c = st.pop();
      if (c === from) return true;
      if (seen[c]) continue; seen[c] = 1;
      for (const l of scene.links) {
        if (l.from !== c || !scene.entities[l.to] || isStateful(scene, l.to)) continue;
        st.push(l.to);
      }
    }
    return false;
  }

  function hasLoop(scene) {
    // 场景里有没有任何环（经过记忆的也算）
    const adj = {};
    for (const l of scene.links) (adj[l.from] = adj[l.from] || []).push(l.to);
    const state = {};
    const dfs = (u) => { state[u] = 1; for (const v of adj[u] || []) { if (state[v] === 1) return true; if (!state[v] && dfs(v)) return true; } state[u] = 2; return false; };
    return Object.keys(scene.entities).some((id) => !state[id] && dfs(id));
  }

  // ---------- 求值 ----------
  // 增量（任务 J）：opts.only 是要重算的器材集合（没有 = 全部）；其余器材沿用 opts.prevD 里的结果，不调用它们的 read/compute。
  // opts.count（对象）记下每台器材实际求值的次数，测试用它证明“无关器材求值次数为 0”。
  function evaluate(scene, opts) {
    const TRACE = !(opts && opts.trace === false);
    const E = scene.entities, ck = scene.clock, D = {};
    const ids = Object.keys(E);
    const only = opts && opts.only, prevD = opts && opts.prevD, count = opts && opts.count;
    const live = (id) => !only || only.has(id) || !prevD || !prevD[id];
    const bump = (id) => { if (count) count[id] = (count[id] || 0) + 1; };
    for (const id of ids) D[id] = live(id) ? { out: {}, sig: [], inp: {}, props: null, driven: {}, trace: null } : prevD[id];
    const into = {};
    for (const l of scene.links) if (E[l.from] && E[l.to]) (into[l.to] = into[l.to] || []).push(l);
    const sayFor = (id) => (lv, tx) => D[id].sig.push({ lv, tx });

    // 1.9 精确标记：输出只要有一个上游是近似的，它也是近似的（整条链都精确才精确）
    const approx = (out) => {
      for (const k of Object.keys(out)) { const v = out[k]; if (v && typeof v === 'object' && v.exact !== false) out[k] = Object.assign({}, v, { exact: false }); }
      return out;
    };

    // A. 有状态器材读出输出
    for (const id of ids) {
      const e = E[id], def = defOf(e);
      if (!def.stateful || !live(id)) continue;
      bump(id);
      try { D[id].out = def.read({ ent: e, props: e.props, state: e.state, t: ck.t, n: ck.n, say: sayFor(id), kids: (slot) => childrenOf(scene, id, slot) }) || {}; if (def.exact === false) approx(D[id].out); }
      catch (err) { D[id].out = {}; D[id].sig.push({ lv: 'err', tx: errText(err) }); }
    }

    // 收集某台器材的输入与生效属性
    const gather = (id) => {
      const e = E[id], def = defOf(e), d = D[id];
      const inp = {}; for (const k of Object.keys(def.inputs)) inp[k] = [];
      const props = Object.assign({}, e.props);
      d.driven = {}; d.inexact = false;
      const tr = TRACE ? { inputs: [], props: {}, steps: [], outputs: {} } : null;
      for (const l of (into[id] || [])) {
        const src = D[l.from], v = src ? src.out[l.fromPort] || null : null;
        if (tr && !isProp(l.toPort)) tr.inputs.push({ port: l.toPort, from: l.from, fromPort: l.fromPort, value: v });
        if (v && v.exact === false) d.inexact = true;
        if (isProp(l.toPort)) {
          const k = l.toPort.slice(PROP.length), P = def.props[k];
          if (!P) continue;
          d.driven[k] = { from: l.from, port: l.fromPort, link: l.id };
          if (!v) continue;
          const K = U.KINDS[v.kind];
          if (!K || !K.toProp) continue;
          const r = K.toProp(v, P);
          if (r.ok) props[k] = r.v;
          else if (!r.silent) d.sig.push({ lv: 'err', tx: E[l.from].name + ' 的值 ' + U.showVal(v) + ' 不能填进「' + P.label + '」：' + r.why });
        } else {
          // B.1 连线时的类型转换：源 kind 与口要的 kind 不同，按 to 表转换（转换不了就不送进去）
          let vv = v;
          const want = def.inputs[l.toPort] && def.inputs[l.toPort].kind;
          if (vv && want && vv.kind !== want && want !== 'any') {
            const cv = U.convertVal(vv, want);
            if (cv) vv = cv;
            else { d.sig.push({ lv: 'err', tx: E[l.from].name + ' 的值是「' + U.kindName(vv.kind) + '」，没法变成「' + U.kindName(want) + '」' }); vv = null; }
          }
          (inp[l.toPort] = inp[l.toPort] || []).push(vv);
        }
      }
      d.inp = inp; d.props = props;
      if (tr) { for (const k of Object.keys(props)) tr.props[k] = d.driven[k] ? { value: props[k], driven: true, from: d.driven[k].from } : { value: props[k], driven: false }; d.trace = tr; }
    };

    // B. 无状态器材按拓扑序算
    const stateless = ids.filter((id) => !defOf(E[id]).stateful);
    const indeg = {}, adj = {};
    stateless.forEach((id) => { indeg[id] = 0; adj[id] = []; });
    for (const l of scene.links) { if (!(l.from in indeg) || !(l.to in indeg)) continue; adj[l.from].push(l.to); indeg[l.to]++; }
    const queue = stateless.filter((id) => indeg[id] === 0), order = [];
    while (queue.length) { const c = queue.shift(); order.push(c); for (const t of adj[c]) if (--indeg[t] === 0) queue.push(t); }
    const done = {}; order.forEach((id) => (done[id] = 1));
    stateless.filter((id) => !done[id] && live(id)).forEach((id) => D[id].sig.push({ lv: 'err', tx: '连成了没有记忆的环' }));

    // 事实：台面上已经算出的结论，证明器材可以引用（key = 器材id.输出口）。真：布尔输出为真，或证据等级 ≥ ②。
    const factTrue = (key) => {
      const cut = key.lastIndexOf('.'); if (cut < 0) return false;
      const node = D[key.slice(0, cut)], v = node && node.out[key.slice(cut + 1)];
      if (!v) return false;
      if (v.kind === 'bool') return v.data === true;
      if (v.kind === 'num') return Q.cmp(v.data, Q(2)) >= 0;
      return false;
    };
    // late：要读别的器材结论的器材（证明脚手架），等所有普通器材算完以后再算
    const lateIds = [];
    const runOne = (id) => {
      const e = E[id], def = defOf(e), d = D[id];
      bump(id);
      gather(id);
      const ctx = { ent: e, props: d.props, inp: d.inp, t: ck.t, n: ck.n, seed: ck.seed, say: sayFor(id), kids: (slot) => childrenOf(scene, id, slot), fact: factTrue, scene,
        step: (say, value, rule) => { if (rule && !U.RULES[rule]) U.ruleErrors.push(e.type + ' 用了没登记的规则 ' + rule); if (d.trace) d.trace.steps.push({ say, value: value === undefined ? null : value, rule: rule || null }); },
        because: (port, say, rule) => { if (rule && !U.RULES[rule]) U.ruleErrors.push(e.type + ' 用了没登记的规则 ' + rule); if (d.trace) d.trace.outputs[port] = { say, rule: rule || null }; } };
      try { d.out = def.compute(ctx) || {}; if (!(def.exact !== false && !d.inexact)) approx(d.out); } catch (err) { d.out = {}; d.sig.push({ lv: 'err', tx: errText(err) }); }
      if (def.sig) { try { def.sig(Object.assign({}, ctx, { out: d.out }), sayFor(id)); } catch (err) { /* 信号条出错不影响计算 */ } }
    };
    for (const id of order) { if (!live(id)) continue; if (defOf(E[id]).late) lateIds.push(id); else runOne(id); }
    for (const id of lateIds) runOne(id);

    // 有状态器材：此时才有输入可读
    for (const id of ids) {
      const e = E[id], def = defOf(e);
      if (!def.stateful || !live(id)) continue;
      gather(id);
      if (def.sig) { try { def.sig({ ent: e, props: D[id].props, inp: D[id].inp, state: e.state, out: D[id].out, t: ck.t, n: ck.n, seed: ck.seed }, sayFor(id)); } catch (err) { /* ignore */ } }
    }
    return D;
  }

  // 世界时钟走一拍：所有有状态器材同时 step（读的是本跳算出的输入），然后重算
  function tick(scene) {
    const D = evaluate(scene), E = scene.entities, ck = scene.clock, dt = 1 / ck.hz;
    const next = {};
    for (const id of Object.keys(E)) {
      const e = E[id], def = defOf(e);
      if (!def.stateful) continue;
      const rid = id, n = ck.n;
      try {
        next[id] = def.step({
          ent: e, props: D[id].props, inp: D[id].inp, state: clone(e.state), dt, t: ck.t, n, seed: ck.seed,
          rand: (k) => U.rand(ck.seed, rid, n, k), say: () => {},
        });
      } catch (err) { next[id] = e.state; }
    }
    for (const id in next) E[id].state = next[id];
    ck.n += 1; ck.t = Math.round((ck.t + dt) * 1e6) / 1e6;
    return evaluate(scene);
  }

  // 影响范围（任务 J）：改了 ids 以后要重算的器材 = 它们自己 + 沿连线往下游的所有器材 + 父器材（容器可能读子器材）。
  // 另外：证明脚手架（late）和读台面其他部分的器材（readsScene）每次都算，它们的输入不全在连线上。
  function affected(scene, ids) {
    const E = scene.entities, out = new Set(), queue = [];
    const add = (id) => { if (E[id] && !out.has(id)) { out.add(id); queue.push(id); } };
    const outs = {};
    for (const l of scene.links) (outs[l.from] = outs[l.from] || []).push(l.to);
    ids.forEach(add);
    for (const id of Object.keys(E)) { const d = defOf(E[id]); if (d.late || d.readsScene) add(id); }
    while (queue.length) {
      const c = queue.shift();
      for (const t of outs[c] || []) add(t);
      if (E[c] && E[c].parent) add(E[c].parent);
    }
    return out;
  }

  // 增量求值（任务 J）：cache = {D, fp, clock}，第一次调用全量；之后只比较每台器材的指纹（类型、名字、属性、父子、状态、输入连线）
  // 和时钟，找出改过的器材，只重算它们的影响范围。时钟走过的（t、n 等变了）一律全量。结果和 evaluate 一样。
  function evaluateCached(scene, cache, opts) {
    const c = cache || {}, E = scene.entities;
    const inbound = {};
    for (const l of scene.links) (inbound[l.to] = inbound[l.to] || []).push(l.id + ':' + l.from + '.' + l.fromPort + '>' + l.toPort);
    const fp = {};
    // 工作台的步骤写在台面的 scene.workbench 上（不是器材）：它是工作台器材（host）的输入，步骤变了，host 要重算
    const wb = scene.workbench, wbHost = wb && wb.host;
    for (const id of Object.keys(E)) {
      const e = E[id], wbIn = id === wbHost ? [wb.key, wb.steps] : null;
      fp[id] = U.JSON.stringify([e.type, e.name, e.x, e.y, e.props, e.parent, e.slot, e.state, e.k, inbound[id] || [], wbIn]);
    }
    const clock = U.JSON.stringify(scene.clock);
    const full = !c.D || c.clock !== clock;
    // 被删掉的器材：它原来的父器材（容器）少了一个子器材，要重算
    const gone = full ? [] : Object.keys(c.fp).filter((id) => !E[id]).map((id) => c.par[id]).filter((p) => p && E[p]);
    const changed = full ? Object.keys(E) : Object.keys(E).filter((id) => c.fp[id] !== fp[id]).concat(gone);
    const only = full ? null : affected(scene, changed);
    const D = evaluate(scene, { only, prevD: c.D, count: opts && opts.count });
    const par = {};
    for (const id of Object.keys(E)) if (E[id].parent) par[id] = E[id].parent;
    c.D = D; c.fp = fp; c.clock = clock; c.par = par;
    return D;
  }

  function rewind(scene) {
    const ck = scene.clock; ck.t = 0; ck.n = 0; ck.running = false;
    for (const id in scene.entities) { const e = scene.entities[id], def = defOf(e); if (def.stateful) e.state = def.init(e.props); }
  }

  // ---------- act：唯一改动入口 ----------
  function link(scene, a) {
    const E = scene.entities, F = E[a.from], T = E[a.to];
    if (!F || !T) return fail('找不到器材');
    // 后算的器材（证明脚手架之类）的结论要等台面上的普通器材都算完才有，所以只能接到别的后算器材上，
    // 不能接到普通器材上（那样普通器材就要在后算之后再算，顺序会乱）
    if (defOf(F).late && !defOf(T).late) return fail(F.name + ' 的结论要等台面上的器材都算完才有，只能接到别的后算器材上');
    // 有状态器材的结论在后面才更新，后算器材读不到这一轮的结果
    if (defOf(T).late && defOf(F).stateful) return fail(F.name + ' 有记忆，它的结论后算器材读不到');
    const fd = defOf(F), td = defOf(T);
    const fp = a.fromPort || Object.keys(fd.outputs)[0];
    const fo = fd.outputs[fp];
    if (!fo) return fail(F.name + ' 没有输出口');
    let tp = a.toPort;
    if (!tp) {
      const ins = Object.keys(td.inputs);
      const fits = ins.filter((k) => U.kindOK(fo.kind, td.inputs[k].kind));
      tp = fits.find((k) => td.inputs[k].many || !scene.links.some((l) => l.to === T.id && l.toPort === k)) || fits[0] || ins[0];
    }
    if (!tp) return fail(T.name + ' 没有可以接线的输入口');
    let ti;
    if (isProp(tp)) {
      const P = td.props[tp.slice(PROP.length)];
      if (!P || !P.write) return fail(T.name + ' 的这个属性不能被连线驱动');
      ti = { kind: P.type === 'bool' ? 'bool' : 'num', many: false };
    } else ti = td.inputs[tp];
    if (!ti) return fail(T.name + ' 没有「' + tp + '」这个口');
    if (!U.kindOK(fo.kind, ti.kind)) return fail(F.name + ' 输出的是「' + U.kindName(fo.kind) + '」，' + T.name + ' 这个口要的是「' + U.kindName(ti.kind) + '」');
    if (scene.links.some((l) => l.from === F.id && l.fromPort === fp && l.to === T.id && l.toPort === tp)) return fail('这根线已经有了');
    if (createsUnsafeCycle(scene, F.id, T.id)) return fail(LOOP_WHY);
    const before = scene.links.slice();
    let replaced = null;
    if (!ti.many) {
      const old = scene.links.find((l) => l.to === T.id && l.toPort === tp);
      if (old) { replaced = old; scene.links = scene.links.filter((l) => l !== old); }
    }
    const nl = { id: 'l' + scene.nid++, from: F.id, fromPort: fp, to: T.id, toPort: tp };
    scene.links.push(nl);
    let bad = null;
    try { const D = evaluate(scene); const rj = D[T.id].sig.find((s) => s.lv === 'reject'); if (rj) bad = rj.tx; } catch (err) { bad = '这里连不上'; }
    if (bad) { scene.links = before; return fail(bad); }
    return ok({ id: nl.id, replaced });
  }

  function tidy(scene) {
    const E = scene.entities, depth = {}, visiting = {};
    const d = (id) => {
      if (id in depth) return depth[id];
      if (visiting[id]) return 0;
      visiting[id] = 1;
      let m = 0;
      for (const l of scene.links) if (l.to === id && l.from !== id && E[l.from] && !isStateful(scene, id)) m = Math.max(m, d(l.from) + 1);
      visiting[id] = 0; depth[id] = m; return m;
    };
    const cols = {};
    Object.keys(E).forEach((id) => { (cols[d(id)] = cols[d(id)] || []).push(id); });
    let x = 60;
    Object.keys(cols).map(Number).sort((a, b) => a - b).forEach((c) => {
      let y = 70, wmax = 0;
      cols[c].forEach((id) => { const e = E[id], sz = e.w > 0 && e.h > 0 ? [e.w, e.h] : defOf(e).size(e); e.x = x; e.y = y; y += sz[1] + 70; wmax = Math.max(wmax, sz[0]); });
      x += wmax + 130;
    });
  }

  // ---------- 工作区的工具（任务 H1，见 next-steps.md §10.5.4）----------
  // { t:'tool', ws, tool, picks:[稳定名字], args }：找到工具的规则，把选中的对象接进一个新的步骤器材，放进工作区。
  // 规则声明 device（器材）、wire（固定接的口）、many（剩下的选中对象接进的口）、props(args)（器材属性）。
  // 任何一步不成立（名字找不到、算不出来、规则不通过、接不上）都整体失败，场景不留下半截。
  function tool(scene, a) {
    const E = scene.entities, ws = E[a.ws];
    if (!ws) return fail('找不到工作区');
    const wd = defOf(ws);
    if (!wd.workspace) return fail(ws.name + ' 不是工作区');
    const T = (wd.workspace.tools || []).find((x) => x.id === a.tool);
    if (!T) return fail('这个工作区没有「' + a.tool + '」这个工具');
    const rule = U.RULES[T.rule];
    if (!rule || !rule.device || !U.types[rule.device]) return fail('「' + T.label + '」的规则还不能建步骤：' + T.rule);
    if (!U.Names) return fail('稳定名字没有加载');
    const picks = Array.isArray(a.picks) ? a.picks : [];
    const fixed = rule.wire || [];
    const need = rule.many ? Math.max(1, fixed.length) : fixed.length;
    if (rule.many ? picks.length < need : picks.length !== need) return fail('「' + T.label + '」要选 ' + (rule.many ? '至少 ' : '') + need + ' 个对象');
    const wires = [];
    for (let i = 0; i < picks.length; i++) {
      const r = U.Names.resolve(scene, picks[i]);
      if (typeof r === 'string') return fail(r);
      if (!r.value) return fail('「' + picks[i] + '」现在算不出来，先看看它前面的步骤');
      wires.push({ r, port: i < fixed.length ? fixed[i] : rule.many });
    }
    const input = {};
    fixed.forEach((p, i) => { input[p] = wires[i].r.value.data; });
    if (rule.many) input[rule.many] = wires.slice(fixed.length).map((w) => w.r.value.data);
    const args = Object.assign({}, T.defaults || {}, a.args || {});
    const why = rule.match ? rule.match(input, [], args) : null;
    if (typeof why === 'string') return fail(why);
    if (why === false) return fail('这一步不能用在这里');
    if (rule.guard) { const g = rule.guard(scene, wires); if (g) return fail(g); }
    const def = U.types[rule.device], props = {};
    const raw = rule.props ? rule.props(args) : {};
    for (const k of Object.keys(raw)) {
      const r = U.coerceProp(def.props[k], raw[k]);
      if (!r.ok) return fail(r.why);
      props[k] = r.v;
    }
    const id = add(scene, rule.device, ws.x + 24, ws.y + 44, props);
    const undo = () => { delete E[id]; scene.links = scene.links.filter((l) => l.from !== id && l.to !== id); };
    for (const w of wires) {
      const l = link(scene, { from: w.r.id, fromPort: w.r.port, to: id, toPort: w.port });
      if (!l.ok) { undo(); return fail(l.why); }
    }
    const put = act(scene, { t: 'put', id, parent: ws.id, slot: 'items' });
    if (!put.ok) { undo(); return fail(put.why); }
    // 规则还要做的后续事（剪：建块器材、隐藏原图形）。guard 已经在建步骤之前检查过，这里不再失败
    const extra = rule.after ? rule.after(scene, { id, ws, wires }) : null;
    return ok(Object.assign({ id, device: rule.device, rule: T.rule }, extra && extra.pieces ? { pieces: extra.pieces } : {}));
  }

  function act(scene, a) {
    const E = scene.entities;
    switch (a.t) {
      case 'tool': return tool(scene, a);
      // 尺子、量角器和标注（§10.5.9 第 6 条）：台面的顶层字段，不是器材（js/core/measure.js）
      case 'mark': case 'note': return U.Measure.act(scene, a);
      // 块（§10.5.10）：改块自己的属性，一条动作记一步（撤销由界面的快照栈负责）
      case 'piece': return U.Piece.act(scene, a);
      case 'wsdrop': return U.Piece.dropInto(scene, a);
      case 'add': {
        if (!U.types[a.type]) return fail('没有这种器材');
        const id = add(scene, a.type, a.x || 0, a.y || 0, a.props);
        return ok({ id });
      }
      // 式子工作台的步骤（任务 I）：写在台面的 scene.workbench 上（不是器材，不改器材和连线）。a.steps 为空时清掉。
      case 'wb': {
        if (!a.steps || !a.steps.length) { delete scene.workbench; return ok(); }
        scene.workbench = { host: a.host, key: a.key, steps: a.steps };
        return ok();
      }
      case 'move': {
        const e = E[a.id]; if (!e) return fail('找不到器材');
        // 台面卡片的位置保留到千分之一：整数取整在台面放大时会偏出 1 像素以上（缩放 250% 时 0.5 个单位 = 1.25 像素）
        const q = (v) => Math.round(v * 1000) / 1000, nx = q(a.x), ny = q(a.y), dx = nx - e.x, dy = ny - e.y;
        e.x = nx; e.y = ny;
        // 1.10：移动容器时，里面的子实体跟着动（递归）
        const moveKids = (pid) => { for (const k of childrenOf(scene, pid)) { k.x += dx; k.y += dy; moveKids(k.id); } };
        moveKids(a.id);
        return ok();
      }
      case 'put': {
        const e = E[a.id], p = E[a.parent];
        if (!e) return fail('找不到器材');
        if (!p) return fail('找不到容器');
        const pd = defOf(p), S = (pd.slots || {})[a.slot];
        if (!S) return fail(pd.label + ' 没有这个位置');
        if (a.parent === a.id || isInside(scene, p.id, e.id)) return fail('不能把东西放进它自己里面');
        if (S.accepts !== '*' && !S.accepts.includes(e.type)) return fail(S.rejectWhy || (pd.label + '里只能放' + S.accepts.map((t) => (U.types[t] ? U.types[t].label : t)).join('、')));
        const cur = childrenOf(scene, p.id, a.slot).filter((x) => x.id !== e.id);
        if (S.max !== null && S.max !== undefined && cur.length >= S.max) return fail(S.fullWhy || (pd.label + '已经满了'));
        e.parent = p.id; e.slot = a.slot;
        relayout(scene, p.id);
        return ok();
      }
      case 'take': {
        const e = E[a.id]; if (!e) return fail('找不到器材');
        if (!e.parent) return ok();
        const old = e.parent; e.parent = null; e.slot = null; relayout(scene, old);
        return ok();
      }
      // 改大小（§10.5.8 A1）：e.w、e.h 存在实体上，优先于器材的 size()。w、h 都是 null 时清掉，恢复默认大小
      case 'resize': {
        const e = E[a.id]; if (!e) return fail('找不到器材');
        if (a.w === null && a.h === null) { delete e.w; delete e.h; return ok(); }
        const w = Math.round(a.w), h = Math.round(a.h);
        if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return fail('大小不对');
        e.w = w; e.h = h;
        return ok();
      }
      case 'rename': { const e = E[a.id]; if (!e) return fail('找不到器材'); const n = String(a.name || '').trim().slice(0, 12); if (!n) return fail('名字不能空着'); e.name = n; return ok(); }
      case 'set': {
        const e = E[a.id]; if (!e) return fail('找不到器材');
        const def = defOf(e), P = def.props[a.k];
        if (!P) return fail(e.name + ' 没有这个属性');
        if (!P.write) return fail('「' + P.label + '」不能手动改');
        if (scene.links.some((l) => l.to === a.id && l.toPort === PROP + a.k)) return fail('「' + P.label + '」正由连线驱动，先断开连线再手动改');
        const r = U.coerceProp(P, a.v);
        if (!r.ok) return fail(r.why);
        const prev = e.props[a.k], prevState = e.state ? clone(e.state) : undefined;
        e.props[a.k] = r.v;
        if (def.reinit && def.reinit.includes(a.k)) e.state = def.init(e.props);
        let bad = null;
        try { const D = evaluate(scene); const rj = D[e.id].sig.find((s) => s.lv === 'reject'); if (rj) bad = rj.tx; for (const l of scene.links) if (l.from === e.id) { const x = D[l.to] && D[l.to].sig.find((s) => s.lv === 'reject'); if (x) bad = x.tx; } } catch (err) { bad = '这样改算不出来'; }
        if (bad) { e.props[a.k] = prev; if (prevState) e.state = prevState; return fail(bad); }
        return ok();
      }
      case 'link': return link(scene, a);
      // 改一根线的来源（V4，吸附到构造点时：原来接在自由点上的线改接到构造器材的输出）。线在连线列表里的位置不变，
      // 所以多边形的顶点顺序（按连线先后）不变；口和类型仍然要对，成环或者算出 reject 就不改
      case 'relink': {
        const l = scene.links.find((x) => x.id === a.id); if (!l) return fail('找不到这根线');
        const F = E[a.from], T = E[l.to];
        if (!F || !T) return fail('找不到器材');
        if (isProp(l.toPort)) return fail('这根线是属性驱动的，不能改接');
        const fo = defOf(F).outputs[a.fromPort], ti = defOf(T).inputs[l.toPort];
        if (!fo) return fail(F.name + ' 没有这个输出口');
        if (!ti) return fail(T.name + ' 没有「' + l.toPort + '」这个口');
        if (!U.kindOK(fo.kind, ti.kind)) return fail(F.name + ' 输出的类型对不上');
        if (scene.links.some((x) => x !== l && x.from === F.id && x.fromPort === a.fromPort && x.to === T.id && x.toPort === l.toPort)) return fail('这根线已经有了');
        if (createsUnsafeCycle(scene, F.id, T.id)) return fail(LOOP_WHY);
        const prev = { from: l.from, fromPort: l.fromPort };
        l.from = F.id; l.fromPort = a.fromPort;
        let bad = null;
        try { const D = evaluate(scene); const rj = D[T.id].sig.find((s) => s.lv === 'reject'); if (rj) bad = rj.tx; } catch (err) { bad = '这里连不上'; }
        if (bad) { l.from = prev.from; l.fromPort = prev.fromPort; return fail(bad); }
        return ok({ id: l.id });
      }
      case 'unlink': {
        const n = scene.links.length;
        scene.links = scene.links.filter((l) => l.id !== a.id);
        return scene.links.length < n ? ok() : fail('找不到这根线');
      }
      case 'del': {
        if (!E[a.id]) return fail('找不到器材');
        // 1.10：删容器时，里面的东西默认倒到台面上（keep:'out'）；keep:'all' 连里面一起删
        const kids = childrenOf(scene, a.id);
        if (a.keep === 'all') {
          const drop = (id) => { for (const k of childrenOf(scene, id)) drop(k.id); delete E[id]; };
          const oldP = E[a.id].parent;
          drop(a.id);
          if (scene.workbench && scene.workbench.host === a.id) delete scene.workbench;
          scene.links = scene.links.filter((l) => E[l.from] && E[l.to]);
          if (oldP) relayout(scene, oldP);
        } else {
          const old = E[a.id].parent;
          for (const k of kids) { k.parent = null; k.slot = null; }
          delete E[a.id];
          scene.links = scene.links.filter((l) => l.from !== a.id && l.to !== a.id);
          if (old) relayout(scene, old);
          if (scene.workbench && scene.workbench.host === a.id) delete scene.workbench;   // 工作台删了，它的步骤也没了
          return ok({ moved: kids.length });
        }
        return ok();
      }
      case 'copy': {
        const e = E[a.id]; if (!e) return fail('找不到器材');
        const id = add(scene, e.type, e.x + 36, e.y + 36, clone(e.props));
        if (e.role) E[id].role = e.role;
        if (e.state !== undefined) E[id].state = clone(e.state);
        // P8：工作区里的图形，复制品留在同一个工作区里（保留所属）。十格阵等其他容器的行为不变（tests/run.js 有断言）
        if (e.parent && E[e.parent] && defOf(E[e.parent]).workspace) {
          const r = act(scene, { t: 'put', id, parent: e.parent, slot: e.slot });
          if (!r.ok) { delete E[id]; return r; }
        }
        return ok({ id });
      }
      // 编组（§10.5.9 第 3 条）：一组器材记同一个组号（顶层字段 group，和 approxDeg 一样随快照撤销、随存档保存）；gid 为空就取消编组
      case 'group': {
        const ids = a.ids || [];
        for (const id of ids) if (!E[id]) return fail('找不到器材');
        for (const id of ids) { if (a.gid) E[id].group = a.gid; else delete E[id].group; }
        return ok();
      }
      case 'reset': {
        const e = E[a.id]; if (!e) return fail('找不到器材');
        const def = defOf(e);
        e.props = U.defaultProps(def); if (def.stateful) e.state = def.init(e.props);
        scene.links = scene.links.filter((l) => !(l.to === a.id && isProp(l.toPort)));
        return ok();
      }
      case 'resetstate': {
        const e = E[a.id]; if (!e) return fail('找不到器材'); const def = defOf(e);
        if (!def.stateful) return fail('这个器材没有记忆'); e.state = def.init(e.props); return ok();
      }
      case 'clear': scene.entities = {}; scene.links = []; scene.nid = 1; scene.seq = {}; delete scene.workbench; delete scene.marks; delete scene.notes; rewind(scene); return ok();
      case 'tidy': tidy(scene); return ok();
      case 'clock': {
        const ck = scene.clock;
        if (a.running !== undefined) ck.running = !!a.running;
        if (a.rate !== undefined) ck.rate = a.rate;
        if (a.rewind) rewind(scene);
        return ok();
      }
      default: return fail('不认识的操作：' + a.t);
    }
  }

  // 试连（不改场景）：拖线悬停时用
  function dryLink(scene, a) {
    const s = clone(scene);
    try { const r = link(s, a); return { ok: !!r.ok, why: r.why || '' }; } catch (err) { return { ok: false, why: '这里连不上' }; }
  }

  // ---------- 来历追踪（任务 A）----------
  // 一条输出是怎么来的：沿输入一层层追到没有输入的源器材。遇到有状态器材就停，标“上一拍的值”。
  function explain(scene, D, id, port, depth) {
    const maxDepth = depth === undefined ? 6 : depth;
    const walk = (id, port, d, path) => {
      const e = scene.entities[id]; if (!e) return null;
      const node = D[id], tr = node && node.trace, o = tr && tr.outputs[port];
      const res = { id, name: e.name, port, value: (node && node.out[port]) || null, rule: o ? o.rule : null, say: o ? o.say : null, steps: tr ? tr.steps.slice() : [], from: [] };
      if (defOf(e).stateful) { res.stateful = true; res.note = '上一拍的值'; return res; }
      if (d <= 0 || path[id]) return res;
      const next = Object.assign({}, path); next[id] = true;
      for (const inp of (tr ? tr.inputs : [])) { const child = walk(inp.from, inp.fromPort, d - 1, next); if (child) { child.via = inp.port; res.from.push(child); } }
      return res;
    };
    return walk(id, port, maxDepth, {});
  }
  // 来历树 → 几行人话
  function explainText(tree, indent) {
    indent = indent || 0;
    const pad = '  '.repeat(indent), lines = [];
    const rule = tree.rule && U.RULES[tree.rule] ? U.RULES[tree.rule].label : null;
    lines.push(pad + tree.name + '.' + tree.port + ' = ' + U.showVal(tree.value) + (tree.say ? '（' + tree.say + '）' : rule ? '（' + rule + '）' : '') + (tree.stateful ? '　［' + tree.note + '］' : ''));
    for (const st of tree.steps) lines.push(pad + '  · ' + st.say);
    for (const c of tree.from) lines.push(explainText(c, indent + 1));
    return lines.join('\n');
  }

  // 存档迁移（1.4）：按版本逐级升级，每一级只做一件事，升完的台面 v 等于 CURRENT_V。
  //   v0/无版本 → v1：补全 clock（t、n、running、rate、hz、seed），去掉 binds 字段（绑定已是连线）
  //   v1 → v2：器材补 props 默认空对象；台面补 nid/seq
  //   v2 → v3：器材补 parent / slot（容器与层级，1.10），没有容器的旧台面全部为 null
  //   v3 → v4：有理数的分子分母改成 BigInt
  //   v4 → v5：器材补 ui（界面的视图状态：工作区的坐标范围、图层开关、专注，U4）；旧台面没有视图，补成空对象，即按内容自动适应
  //   v5 → v6：块（gpiece）的平移 dx、dy 允许有理数（分数吸附）。旧台面的整数平移不变（整数存普通数字）；
  //            其余写法（{n, d} 对象、字符串、非整数的数）统一成规范形式：整数是普通数字，分数是 "n/d"（U.Q.store）
  const CURRENT_V = 6;
  const MIGRATIONS = {
    1: (s) => {
      const c = blank().clock; s.clock = Object.assign(c, s.clock || {});
      if (s.binds) delete s.binds;
      return s;
    },
    2: (s) => {
      for (const e of Object.values(s.entities)) if (!e.props) e.props = {};
      s.nid = s.nid || 1; s.seq = s.seq || {};
      return s;
    },
    3: (s) => {
      for (const e of Object.values(s.entities)) { if (e.parent === undefined) e.parent = null; if (e.slot === undefined) e.slot = null; }
      return s;
    },
    // v3 → v4：有理数的分子分母改成 BigInt。旧台面里 {n, d} 是普通数字，这里统一转成 BigInt（props 里的数仍是普通数字，不动）
    4: (s) => {
      const conv = (o) => {
        if (!o || typeof o !== 'object') return;
        for (const k of Object.keys(o)) {
          const v = o[k];
          if (!v || typeof v !== 'object') continue;
          if (k !== 'props' && Number.isInteger(v.n) && Number.isInteger(v.d) && Object.keys(v).length === 2) o[k] = { n: BigInt(v.n), d: BigInt(v.d) };
          else conv(v);
        }
      };
      conv(s);
      return s;
    },
    5: (s) => {
      for (const e of Object.values(s.entities)) if (e.ui === undefined) e.ui = {};
      return s;
    },
    // v5 → v6：块的平移量规范化（见上面的注释）。取不出有理数的值原样保留（界面和求值会报出来，不悄悄改成 0）
    6: (s) => {
      const Q = U.Q;
      const norm = (x) => {
        if (typeof x === 'number' && Number.isInteger(x)) return x;
        try { return Q.store(typeof x === 'number' ? Q.fromNumber(x) : Q.parse(x)); } catch (err) { return x; }
      };
      for (const e of Object.values(s.entities)) {
        if (e.type !== 'gpiece' || !e.props) continue;
        if (e.props.dx !== undefined) e.props.dx = norm(e.props.dx);
        if (e.props.dy !== undefined) e.props.dy = norm(e.props.dy);
      }
      return s;
    },
  };
  function migrate(s) {
    const from = s.v === undefined ? 0 : s.v;
    if (from > CURRENT_V) throw new Error('scene-too-new:' + from);
    for (let v = from; v < CURRENT_V; v++) { const step = MIGRATIONS[v + 1]; if (step) s = step(s); }
    s.v = CURRENT_V;
    return s;
  }
  function save(scene) { return U.JSON.stringify(scene); }
  function load(str) {
    const s0 = typeof str === 'string' ? U.JSON.parse(str) : str;
    if (!s0 || !s0.entities || !s0.links) throw new Error('bad-scene');
    const s = migrate(s0);
    for (const id in s.entities) if (!U.types[s.entities[id].type]) throw new Error('unknown-type:' + s.entities[id].type);
    return s;
  }

  U.World = { blank, clone, add, act, evaluate, evaluateCached, affected, explain, explainText, tick, rewind, dryLink, hasLoop, isStateful, save, load, migrate, CURRENT_V, createsUnsafeCycle, LOOP_WHY, PROP, isProp, childrenOf: (scene, id, slot) => childrenOf(scene, id, slot), dependentsOf: (scene, id) => dependentsOf(scene, id), isInside: (scene, c, anc) => isInside(scene, c, anc) };
})(typeof globalThis !== 'undefined' ? globalThis : window);
