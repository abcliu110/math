/* 器材包的按需加载（设计 v2 §1.8）。
 * 包清单 PACK_FILES：包 id → 脚本路径。浏览器里 U.ensurePacks(ids) 只加载还没注册的包；
 * 单文件版（所有脚本已内联）里包已经存在，不会再加载。
 * index.html 目前仍一次性加载全部包（器材数量还不大）；这里提供的是按需加载的机制。 */
(function (G) {
  'use strict';
  const U = G.U;

  U.PACK_FILES = {};
  for (const f of ['core', 'time', 'stats', 'geometry', 'arith', 'middle', 'applied', 'numtheory', 'solid', 'angle', 'road',
    'conjecture', 'variable', 'modclock', 'curved', 'eqscale', 'cutpaste', 'symmetry', 'conserve', 'nth', 'model', 'tenframe', 'figure']) {
    U.PACK_FILES[f] = 'packs/' + f + '.js';
  }

  // 返回 { loaded: [已加载的], missing: [清单里没有的] }。只在浏览器里真正插入 <script>
  U.ensurePacks = function (ids) {
    const out = { loaded: [], pending: [], missing: [] };
    for (const id of ids) {
      if (U.packs[id]) continue;                       // 已注册（包括单文件版内联的）
      if (!U.PACK_FILES[id]) { out.missing.push(id); continue; }
      out.pending.push(id);
      if (G.document && G.document.createElement) {
        const s = G.document.createElement('script');
        s.src = U.PACK_FILES[id]; s.async = false;
        G.document.head.appendChild(s);
      }
    }
    return out;
  };

  // 打开问题或分享链接时，算出要加载哪些包：题目 shelf 里的器材类型 + 台面里的器材类型
  U.packsNeeded = function (problem, scene) {
    const types = new Set([...(problem && problem.shelf || []), ...Object.values((scene && scene.entities) || {}).map((e) => e.type)]);
    const want = new Set();
    for (const t of types) { const d = U.types[t]; if (d && d.pack) want.add(d.pack); }
    return [...want];
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
