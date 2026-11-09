/* 几何规则（任务 H1，见 next-steps.md §10.5）：剪、摆放、合并、中点登记成可执行规则，并给出稳定的名字。
 *
 * 规则的输入是一个对象：{ 输入口名: 值 }，口名就是器材的输入口（f、line、a、b、pieces）。
 * match(input, at, args) / apply(input, at, args) / check(input, out) 与 rules.js 的约定一致（at 恒为 []）。
 * 额外声明（工作区的 t:'tool' 动作用到）：
 *   device：建步骤用的器材 id；wire：固定接的输入口（按选中的先后顺序）；
 *   many：剩下的选中对象都接进这个口（合并用）；props(args)：步骤器材的属性。
 * 不走 U.applyRule：它只认式子（form / num / poly），图形由这里的规则自己判定。
 *
 * U.Names：稳定名字（§10.5.5）。名字由来历算出（原点用角色字母，构造出来的点用来历），
 * 不依赖坐标，也不依赖创建顺序（操作数先排序）。U.Names.resolve(scene, name) 找回对象。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q, F = U.Fig, Geo = U.Geo;

  const sorted = (xs) => xs.slice().sort();
  const isPoly = (f) => !!f && f.type === 'polygon';
  const isPt = (f) => !!f && f.type === 'point' && f.pts && f.pts.length === 1;
  const a2 = (f) => Q.abs(F.area2(f));                       // 面积的两倍（精确），比较面积用
  const pick = (o, ks) => { const r = {}; for (const k of ks) if (o && o[k] !== undefined) r[k] = o[k]; return r; };

  // ---------- 规则 ----------
  const R = (id, def) => U.defineRule(id, Object.assign({ on: 'fig', essence: [], grade: [5, 9] }, def));

  R('geo.cut', {
    label: '剪：沿一条线把图形剪成两块，面积不变', essence: ['E5', 'E2'], grade: [5, 9], keeps: 'area',
    device: 'gcut', wire: ['f', 'line'],
    match(input) {
      if (!isPoly(input.f)) return '只能剪多边形';
      if (!input.line || input.line.type !== 'segment') return '剪刀要沿一条线段剪';
      const r = Geo.cut(input.f, input.line.pts[0], input.line.pts[1]);
      if (!r.pieces) return r.why;
    },
    apply(input) { return { pieces: Geo.cut(input.f, input.line.pts[0], input.line.pts[1]).pieces }; },
    check(input, out) { return Q.eq(Q.add(a2(out.pieces[0]), a2(out.pieces[1])), a2(input.f)); },
  });

  R('geo.place', {
    label: '摆放：翻转、旋转或移动，形状和大小不变', essence: ['E5'], grade: [3, 9], keeps: 'congruence',
    device: 'gplace', wire: ['f'],
    props: (args) => pick(args, ['flip', 'turn', 'dx', 'dy']),
    match(input) { if (!input.f || !input.f.pts) return '只能摆放一块图形'; },
    apply(input, at, args) { return Geo.place(input.f, { flip: args.flip || 0, turn: args.turn || 0, dx: args.dx || 0, dy: args.dy || 0 }); },
    check(input, out) { return F.congruent(input.f, out); },
  });

  R('geo.merge', {
    label: '合并：几块边对边贴起来，拼成一个图形，面积不变', essence: ['E2', 'E5'], grade: [5, 9], keeps: 'area',
    device: 'gasm', wire: [], many: 'pieces',
    match(input) {
      const ps = input.pieces || [];
      if (!ps.length || !ps.every(isPoly)) return '只能合并多边形';
      const m = Geo.merge(ps);
      if (!m.ok) return m.why;
    },
    apply(input) { return Geo.merge(input.pieces).poly; },
    check(input, out) { return Q.eq(input.pieces.reduce((s, f) => Q.add(s, a2(f)), Q(0)), a2(out)); },
  });

  R('geo.midpoint', {
    label: '中点：线段两端的中点，两半等长', essence: ['E2', 'E5'], grade: [5, 9], keeps: 'congruence',
    device: 'gmid', wire: ['a', 'b'],
    match(input) { if (!isPt(input.a) || !isPt(input.b)) return '中点要两个点'; },
    apply(input) { return { type: 'point', pts: [Geo.midpoint(input.a.pts[0], input.b.pts[0])] }; },
    check(input, out) { return Q.eq(F.d2(input.a.pts[0], out.pts[0]), F.d2(out.pts[0], input.b.pts[0])); },
  });

  // 运行一条几何规则（不改场景）。返回 { ok, value, kept, why }
  const run = (id, input, args) => {
    const rule = U.RULES[id];
    if (!rule || typeof rule.apply !== 'function' || typeof rule.match !== 'function') return { ok: false, value: null, kept: false, why: '没有这条规则：' + id };
    const a = args || {};
    let m;
    try { m = rule.match(input, [], a); } catch (e) { return { ok: false, value: null, kept: false, why: '这一步不能用：' + e.message }; }
    if (typeof m === 'string') return { ok: false, value: null, kept: false, why: m };
    if (m === false) return { ok: false, value: null, kept: false, why: '这一步不能用在这里' };
    let out;
    try { out = rule.apply(input, [], a); } catch (e) { return { ok: false, value: null, kept: false, why: '这一步算不出来：' + e.message }; }
    let kept = false;
    try { kept = typeof rule.check === 'function' && !!rule.check(input, out); } catch (e) { kept = false; }
    return { ok: true, value: out, kept, why: kept ? rule.label : '这一步破坏了不变量（' + rule.keeps + '）' };
  };
  U.GeoRules = { run };

  // ---------- 稳定名字 ----------
  const nameOfOrigin = (role) => String(role);
  const nameOfMidpoint = (a, b) => 'M(' + sorted([a, b]).join('') + ')';
  const nameOfSegment = (a, b) => 'seg(' + sorted([a, b]).join(',') + ')';
  const nameOfIntersection = (lineA, lineB) => 'X(' + sorted([lineA, lineB]).join(',') + ')';
  const nameOfPolygon = (names) => 'poly(' + sorted(names).join(',') + ')';
  const nameOfCut = (stepId, side) => 'cut:' + stepId + ':' + side;
  const nameOfStep = (stepId, port) => 'step:' + stepId + ':' + port;

  // 每个 输出口 的名字（由来历算出，算不出时为 null）。返回 get(id, port)
  function portNamer(scene) {
    const E = scene.entities, into = {}, memo = new Map(), busy = new Set();
    for (const l of scene.links) if (E[l.from] && E[l.to]) (into[l.to] = into[l.to] || []).push(l);
    const get = (id, port) => {
      const key = id + '.' + port;
      if (memo.has(key)) return memo.get(key);
      if (busy.has(key)) return null;
      busy.add(key);
      const v = derive(id, port);
      busy.delete(key);
      memo.set(key, v);
      return v;
    };
    const feeds = (id, port) => (into[id] || []).filter((l) => l.toPort === port).map((l) => get(l.from, l.fromPort));
    const one = (id, port) => { const xs = feeds(id, port); return xs.length && xs[0] ? xs[0] : null; };
    const all = (id, port) => { const xs = feeds(id, port); return xs.length && xs.every(Boolean) ? xs : null; };
    const derive = (id, port) => {
      const e = E[id]; if (!e) return null;
      switch (e.type) {
        case 'gpt': return port === 'p' && e.role ? nameOfOrigin(e.role) : null;
        case 'gmid': { const a = one(id, 'a'), b = one(id, 'b'); return port === 'p' && a && b ? nameOfMidpoint(a, b) : null; }
        case 'gseg': { const a = one(id, 'a'), b = one(id, 'b'); return port === 's' && a && b ? nameOfSegment(a, b) : null; }
        case 'gint': { const s = one(id, 's'), t = one(id, 't'); return port === 'p' && s && t ? nameOfIntersection(s, t) : null; }
        case 'gpoly': { const ns = all(id, 'pts'); return port === 'f' && ns && ns.length >= 3 ? nameOfPolygon(ns) : null; }
        case 'gcut': { const f = one(id, 'f'), l = one(id, 'line'); return (port === 'a' || port === 'b') && f && l ? nameOfCut(id, port) : null; }
        case 'gplace': return port === 'f' && one(id, 'f') ? nameOfStep(id, port) : null;
        case 'gasm': return port === 'merged' && all(id, 'pieces') ? nameOfStep(id, port) : null;
        default: return null;
      }
    };
    return get;
  }

  const indexOf = (scene) => {
    const get = portNamer(scene), map = new Map();
    for (const id of Object.keys(scene.entities)) {
      const def = U.types[scene.entities[id].type]; if (!def) continue;
      for (const port of Object.keys(def.outputs)) { const n = get(id, port); if (n && !map.has(n)) map.set(n, { id, port }); }
    }
    return map;
  };

  U.Names = {
    nameOfOrigin, nameOfMidpoint, nameOfSegment, nameOfIntersection, nameOfPolygon, nameOfCut, nameOfStep,
    // 找回一个名字对应的对象：{ name, id, port, ent, value }（value 为 null 表示现在算不出来）。
    // 名字不存在时返回 'missing: <名字>'，步骤可以直接把这句话说给学生。
    resolve(scene, name) {
      const hit = indexOf(scene).get(String(name));
      if (!hit) return 'missing: ' + name;
      const D = U.World.evaluate(scene), node = D[hit.id];
      return { name: String(name), id: hit.id, port: hit.port, ent: scene.entities[hit.id], value: (node && node.out[hit.port]) || null };
    },
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
