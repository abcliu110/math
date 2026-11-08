/* 学生当作者：出一道“凑数题”。
 *   spec = { title, hook, target: '24' | '3/2' | 24, givens: [{n,d?,unit?}, ...最多 5 个] }
 *   U.Author.validate(spec) -> { ok, why?, target(Q), solution }   系统先自己解一遍：解不出来的题不让发布
 *   U.Author.make(spec)     -> 一道和内置题同构的 problem（可直接进 U.problems）
 * 解题器：对给定的数做 + − × ÷ 的所有组合（精确有理数），按子集记忆，找出一种做法的算式。 */
(function (G) {
  'use strict';
  const U = G.U, Q = U.Q;
  const KEY = 'universe-custom-v1';
  const key = (q) => q.n + '/' + q.d;

  function solve(vals, target) {
    const n = vals.length, memo = new Array(1 << n).fill(null), CAP = 4000;
    for (let i = 0; i < n; i++) { const m = new Map(); m.set(key(vals[i]), { q: vals[i], e: Q.show(vals[i]) }); memo[1 << i] = m; }
    const full = (1 << n) - 1;
    const get = (mask) => {
      if (memo[mask]) return memo[mask];
      const out = new Map();
      for (let a = (mask - 1) & mask; a > 0; a = (a - 1) & mask) {
        const b = mask ^ a; if (a < b) continue;
        for (const x of get(a).values()) for (const y of get(b).values()) {
          const cand = [[Q.add(x.q, y.q), '(' + x.e + ' + ' + y.e + ')'], [Q.mul(x.q, y.q), '(' + x.e + ' × ' + y.e + ')'], [Q.sub(x.q, y.q), '(' + x.e + ' − ' + y.e + ')'], [Q.sub(y.q, x.q), '(' + y.e + ' − ' + x.e + ')']];
          if (y.q.n !== 0) cand.push([Q.div(x.q, y.q), '(' + x.e + ' ÷ ' + y.e + ')']);
          if (x.q.n !== 0) cand.push([Q.div(y.q, x.q), '(' + y.e + ' ÷ ' + x.e + ')']);
          for (const [q, e] of cand) { const k = key(q); if (!out.has(k) && out.size < CAP) out.set(k, { q, e }); }
        }
      }
      return (memo[mask] = out);
    };
    // 允许只用其中几个数：对每个子集看一遍
    for (let mask = 1; mask <= full; mask++) { const hit = get(mask).get(key(target)); if (hit) return hit.e.replace(/^\((.*)\)$/, '$1'); }
    return null;
  }

  const Author = {
    KEY,
    validate(spec) {
      const title = String(spec.title || '').trim();
      if (!title) return { ok: false, why: '给题目起个名字' };
      if (!Array.isArray(spec.givens) || spec.givens.length < 2) return { ok: false, why: '至少要给 2 个数' };
      if (spec.givens.length > 5) return { ok: false, why: '最多给 5 个数' };
      let target, vals;
      try { target = Q.parse(spec.target); vals = spec.givens.map((g) => Q(g.n, g.d || 1)); } catch (e) { return { ok: false, why: '目标或给定的数不合法' }; }
      if (vals.some((v) => Q.eq(v, target))) return { ok: false, why: '目标数已经摆在台面上了，题就没意思了' };
      let sol = null; try { sol = solve(vals, target); } catch (e) { sol = null; }
      if (!sol) return { ok: false, why: '用这些数、只靠 + − × ÷，凑不出目标。换个目标或再多给一个数试试' };
      return { ok: true, target, solution: sol };
    },

    make(spec) {
      const v = Author.validate(spec); if (!v.ok) throw new Error(v.why);
      const T = v.target, tk = key(T), tShow = Q.show(T);
      return {
        id: spec.id || 'my-' + Date.now().toString(36), custom: true, title: String(spec.title).trim(), grade: spec.grade || 0, domain: '我的题',
        points: ['凑数', '四则运算'], alias: [], hook: spec.hook || '用台面上的数，连出运算，让某一台器材的结果等于 ' + tShow + '。',
        shelf: ['num', 'op', 'meter', 'compare'], spec: { title: spec.title, hook: spec.hook, target: tShow, givens: spec.givens },
        build() {
          const s = U.World.blank();
          spec.givens.forEach((g, i) => { const id = U.World.add(s, 'num', 60, 60 + i * 150, { n: g.n, d: g.d || 1 }); s.entities[id].role = 'g'; });
          return s;
        },
        predict: null,
        milestones: [
          { id: 'op', say: '放一台运算器', score: 2, glow: ['op'], when: { count: { type: 'op', ge: 1 } }, hints: ['想把几个数合起来，要运算器。', '用「运算器」，选 + − × ÷。', '参考做法：' + v.solution] },
          { id: 'hit', say: '让某个结果等于 ' + tShow, score: 8, when: (w) => w.ofType('op').some((e) => { const o = w.out(e, 'r'); return o && key(o.data) === tk; }), hints: ['把运算器的结果接着再运算。', '可以一步步来，结果再接下一台运算器。', '参考做法：' + v.solution] },
        ],
        traps: [], goal: ['hit'], why: '这是同学出的题。参考做法：' + v.solution + ' = ' + tShow + '。你的做法和它不一样吗？不一样才有意思。', ref: [],
        _solution: v.solution,
      };
    },

    // ---- 存取（浏览器里用 localStorage） ----
    list() { try { return JSON.parse(G.localStorage.getItem(KEY)) || []; } catch (e) { return []; } },
    saveAll(arr) { try { G.localStorage.setItem(KEY, JSON.stringify(arr)); } catch (e) { /* ignore */ } },
    add(spec) {
      const p = Author.make(spec); const arr = Author.list(); arr.push(Object.assign({ id: p.id }, p.spec)); Author.saveAll(arr);
      U.problems.push(p); return p;
    },
    remove(id) { Author.saveAll(Author.list().filter((s) => s.id !== id)); const i = U.problems.findIndex((p) => p.id === id); if (i >= 0) U.problems.splice(i, 1); },
    loadAll() { for (const s of Author.list()) { try { if (!U.problems.some((p) => p.id === s.id)) U.problems.push(Author.make(s)); } catch (e) { /* 坏题跳过 */ } } },
    exportJson() { return JSON.stringify(Author.list(), null, 1); },
    importJson(text) {
      const arr = JSON.parse(text); if (!Array.isArray(arr)) throw new Error('不是题目文件'); let n = 0;
      for (const s of arr) { s.id = 'my-' + Date.now().toString(36) + n; Author.add(s); n++; }
      return n;
    },
  };
  U.Author = Author;
})(typeof globalThis !== 'undefined' ? globalThis : window);
