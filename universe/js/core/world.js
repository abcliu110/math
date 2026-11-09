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
  const clone = (s) => JSON.parse(JSON.stringify(s));
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
    return { v: 3, nid: 1, seq: {}, entities: {}, links: [], clock: { t: 0, n: 0, running: false, hz: 4, rate: 1, seed: 20261108 } };
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
  function evaluate(scene, opts) {
    const TRACE = !(opts && opts.trace === false);
    const E = scene.entities, ck = scene.clock, D = {};
    const ids = Object.keys(E);
    for (const id of ids) D[id] = { out: {}, sig: [], inp: {}, props: null, driven: {}, trace: null };
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
      if (!def.stateful) continue;
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
        } else (inp[l.toPort] = inp[l.toPort] || []).push(v);
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
    stateless.filter((id) => !done[id]).forEach((id) => D[id].sig.push({ lv: 'err', tx: '连成了没有记忆的环' }));

    for (const id of order) {
      const e = E[id], def = defOf(e), d = D[id];
      gather(id);
      const ctx = { ent: e, props: d.props, inp: d.inp, t: ck.t, n: ck.n, seed: ck.seed, say: sayFor(id), kids: (slot) => childrenOf(scene, id, slot),
        step: (say, value, rule) => { if (rule && !U.RULES[rule]) U.ruleErrors.push(e.type + ' 用了没登记的规则 ' + rule); if (d.trace) d.trace.steps.push({ say, value: value === undefined ? null : value, rule: rule || null }); },
        because: (port, say, rule) => { if (rule && !U.RULES[rule]) U.ruleErrors.push(e.type + ' 用了没登记的规则 ' + rule); if (d.trace) d.trace.outputs[port] = { say, rule: rule || null }; } };
      try { d.out = def.compute(ctx) || {}; if (!(def.exact !== false && !d.inexact)) approx(d.out); } catch (err) { d.out = {}; d.sig.push({ lv: 'err', tx: errText(err) }); }
      if (def.sig) { try { def.sig(Object.assign({}, ctx, { out: d.out }), sayFor(id)); } catch (err) { /* 信号条出错不影响计算 */ } }
    }

    // 有状态器材：此时才有输入可读
    for (const id of ids) {
      const e = E[id], def = defOf(e);
      if (!def.stateful) continue;
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

  function rewind(scene) {
    const ck = scene.clock; ck.t = 0; ck.n = 0; ck.running = false;
    for (const id in scene.entities) { const e = scene.entities[id], def = defOf(e); if (def.stateful) e.state = def.init(e.props); }
  }

  // ---------- act：唯一改动入口 ----------
  function link(scene, a) {
    const E = scene.entities, F = E[a.from], T = E[a.to];
    if (!F || !T) return fail('找不到器材');
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
      cols[c].forEach((id) => { const e = E[id], sz = defOf(e).size(e); e.x = x; e.y = y; y += sz[1] + 70; wmax = Math.max(wmax, sz[0]); });
      x += wmax + 130;
    });
  }

  function act(scene, a) {
    const E = scene.entities;
    switch (a.t) {
      case 'add': {
        if (!U.types[a.type]) return fail('没有这种器材');
        const id = add(scene, a.type, a.x || 0, a.y || 0, a.props);
        return ok({ id });
      }
      case 'move': {
        const e = E[a.id]; if (!e) return fail('找不到器材');
        const nx = Math.round(a.x), ny = Math.round(a.y), dx = nx - e.x, dy = ny - e.y;
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
          scene.links = scene.links.filter((l) => E[l.from] && E[l.to]);
          if (oldP) relayout(scene, oldP);
        } else {
          const old = E[a.id].parent;
          for (const k of kids) { k.parent = null; k.slot = null; }
          delete E[a.id];
          scene.links = scene.links.filter((l) => l.from !== a.id && l.to !== a.id);
          if (old) relayout(scene, old);
          return ok({ moved: kids.length });
        }
        return ok();
      }
      case 'copy': {
        const e = E[a.id]; if (!e) return fail('找不到器材');
        const id = add(scene, e.type, e.x + 36, e.y + 36, clone(e.props));
        if (e.role) E[id].role = e.role;
        if (e.state !== undefined) E[id].state = clone(e.state);
        return ok({ id });
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
      case 'clear': scene.entities = {}; scene.links = []; scene.nid = 1; scene.seq = {}; rewind(scene); return ok();
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
  const CURRENT_V = 3;
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
  };
  function migrate(s) {
    const from = s.v === undefined ? 0 : s.v;
    if (from > CURRENT_V) throw new Error('scene-too-new:' + from);
    for (let v = from; v < CURRENT_V; v++) { const step = MIGRATIONS[v + 1]; if (step) s = step(s); }
    s.v = CURRENT_V;
    return s;
  }
  function save(scene) { return JSON.stringify(scene); }
  function load(str) {
    const s0 = typeof str === 'string' ? JSON.parse(str) : str;
    if (!s0 || !s0.entities || !s0.links) throw new Error('bad-scene');
    const s = migrate(s0);
    for (const id in s.entities) if (!U.types[s.entities[id].type]) throw new Error('unknown-type:' + s.entities[id].type);
    return s;
  }

  U.World = { blank, clone, add, act, evaluate, explain, explainText, tick, rewind, dryLink, hasLoop, isStateful, save, load, migrate, CURRENT_V, createsUnsafeCycle, LOOP_WHY, PROP, isProp, childrenOf: (scene, id, slot) => childrenOf(scene, id, slot), isInside: (scene, c, anc) => isInside(scene, c, anc) };
})(typeof globalThis !== 'undefined' ? globalThis : window);
