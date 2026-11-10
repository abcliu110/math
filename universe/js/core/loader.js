/* 器材包的按需加载（设计 v2 §1.8）。
 * 包清单 PACK_FILES：包 id → 脚本路径。浏览器里 U.ensurePacks(ids) 只加载还没注册的包；
 * 单文件版（所有脚本已内联）里包已经存在，不会再加载。
 * index.html 目前仍一次性加载全部包（器材数量还不大）；这里提供的是按需加载的机制。 */
(function (G) {
  'use strict';
  const U = G.U;

  U.PACK_FILES = {};
  for (const f of ['core', 'time', 'stats', 'geometry', 'arith', 'middle', 'applied', 'numtheory', 'solid', 'angle', 'road',
    'conjecture', 'variable', 'modclock', 'curved', 'eqscale', 'cutpaste', 'symmetry', 'conserve', 'nth', 'model', 'tenframe', 'figure', 'geo', 'algebra', 'modeling', 'proof', 'ratio', 'angletrig', 'stats2', 'views', 'coordsx', 'workspace', 'exprbench', 'piece', 'shapes']) {
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

  // 文件清单检查（任务 J）：PACK_FILES、index.html 里 packs/ 下的脚本、packs/ 目录里的文件，三者必须一致。
  // 返回错误文字的数组，空数组 = 一致。tests/run.js 用真实文件检查（不一致则 verify 失败）。
  U.checkPackManifest = function (packFiles, htmlSrcs, dirFiles) {
    const errs = [], files = packFiles || {}, html = htmlSrcs || [], dir = dirFiles || [];
    const listed = new Set(Object.keys(files).map((id) => files[id]));
    const inHtml = new Set(html), inDir = new Set(dir);
    for (const id of Object.keys(files)) {
      if (!inHtml.has(files[id])) errs.push('清单里的包 ' + id + '（' + files[id] + '）没有在 index.html 里加载');
      if (!inDir.has(files[id])) errs.push('清单里的包 ' + id + ' 的文件 ' + files[id] + ' 不存在');
    }
    for (const f of html) if (!listed.has(f)) errs.push('index.html 加载了 ' + f + '，但清单 PACK_FILES 里没有这个包');
    for (const f of dir) if (!listed.has(f)) errs.push('packs 里的 ' + f + ' 没有登记在清单 PACK_FILES 里');
    return errs;
  };

  // 打开问题或分享链接时，算出要加载哪些包：题目 shelf 里的器材类型 + 台面里的器材类型
  U.packsNeeded = function (problem, scene) {
    const types = new Set([...(problem && problem.shelf || []), ...Object.values((scene && scene.entities) || {}).map((e) => e.type)]);
    const want = new Set();
    for (const t of types) { const d = U.types[t]; if (d && d.pack) want.add(d.pack); }
    return [...want];
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
