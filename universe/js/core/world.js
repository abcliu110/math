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
  const defOf = (e) => { const d = U.types[e.type]; if (!d) throw new Error('unknown-type:' + e.type); return d; };
  const errText = (err) => (err && err.message === 'overflow' ? '数太大，算不下' : err && err.message === 'bad-number' ? '这个数不合法' : err && err.message === 'div0' ? '除数不能是 0' : '算不出来');

  const LOOP_WHY = '这样连，数会自己追自己，永远算不完。中间放一个“记忆器”，让它一拍一拍地算。';

  function blank() {
    return { v: 2, nid: 1, seq: {}, entities: {}, links: [], clock: { t: 0, n: 0, running: false, hz: 4, rate: 1, seed: 20261108 } };
  }

  function add(scene, type, x, y, props) {
    const def = U.types[type];
    const id = 'e' + scene.nid++;
    scene.seq[type] = (scene.seq[type] || 0) + 1;
    const p = U.defaultProps(def, props);
    const ent = { id, type, name: def.prefix + scene.seq[type], x: Math.round(x), y: Math.round(y), props: p, k: 1 };
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
  function evaluate(scene) {
    const E = scene.entities, ck = scene.clock, D = {};
    const ids = Object.keys(E);
    for (const id of ids) D[id] = { out: {}, sig: [], inp: {}, props: null, driven: {} };
    const into = {};
    for (const l of scene.links) if (E[l.from] && E[l.to]) (into[l.to] = into[l.to] || []).push(l);
    const sayFor = (id) => (lv, tx) => D[id].sig.push({ lv, tx });

    // A. 有状态器材读出输出
    for (const id of ids) {
      const e = E[id], def = defOf(e);
      if (!def.stateful) continue;
      try { D[id].out = def.read({ ent: e, props: e.props, state: e.state, t: ck.t, n: ck.n, say: sayFor(id) }) || {}; }
      catch (err) { D[id].out = {}; D[id].sig.push({ lv: 'err', tx: errText(err) }); }
    }

    // 收集某台器材的输入与生效属性
    const gather = (id) => {
      const e = E[id], def = defOf(e), d = D[id];
      const inp = {}; for (const k of Object.keys(def.inputs)) inp[k] = [];
      const props = Object.assign({}, e.props);
      d.driven = {};
      for (const l of (into[id] || [])) {
        const src = D[l.from], v = src ? src.out[l.fromPort] || null : null;
        if (isProp(l.toPort)) {
          const k = l.toPort.slice(PROP.length), P = def.props[k];
          if (!P) continue;
          d.driven[k] = { from: l.from, port: l.fromPort, link: l.id };
          if (!v) continue;
          if (P.type === 'bool' && v.kind === 'bool') props[k] = v.data;
          else if (v.kind === 'num') {
            const r = U.coerceProp(P, v.data);
            if (r.ok) props[k] = r.v;
            else d.sig.push({ lv: 'err', tx: E[l.from].name + ' 的值 ' + Q.show(v.data) + ' 不能填进「' + P.label + '」：' + r.why });
          }
        } else (inp[l.toPort] = inp[l.toPort] || []).push(v);
      }
      d.inp = inp; d.props = props;
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
      const ctx = { ent: e, props: d.props, inp: d.inp, t: ck.t, n: ck.n, seed: ck.seed, say: sayFor(id) };
      try { d.out = def.compute(ctx) || {}; } catch (err) { d.out = {}; d.sig.push({ lv: 'err', tx: errText(err) }); }
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
      case 'move': { const e = E[a.id]; if (!e) return fail('找不到器材'); e.x = Math.round(a.x); e.y = Math.round(a.y); return ok(); }
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
        delete E[a.id]; scene.links = scene.links.filter((l) => l.from !== a.id && l.to !== a.id);
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

  function save(scene) { return JSON.stringify(scene); }
  function load(str) {
    const s = typeof str === 'string' ? JSON.parse(str) : str;
    if (!s || !s.entities || !s.links) throw new Error('bad-scene');
    if (!s.clock) s.clock = blank().clock;
    s.v = 2;
    for (const id in s.entities) if (!U.types[s.entities[id].type]) throw new Error('unknown-type:' + s.entities[id].type);
    return s;
  }

  U.World = { blank, clone, add, act, evaluate, tick, rewind, dryLink, hasLoop, isStateful, save, load, createsUnsafeCycle, LOOP_WHY, PROP, isProp };
})(typeof globalThis !== 'undefined' ? globalThis : window);
