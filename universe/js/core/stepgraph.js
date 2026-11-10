/* 步骤图（D6，docs/direction.md 第 4 节和第 7 节 D6）：把一串步骤画成依赖图。纯数据，不碰界面。
 *
 * 图的形状：节点 = 每一步（第 k 步，k 从 1 数）；边 = 「这一步用了第 j 步的结果」（j < k，图没有环）。
 * 原来的图形或式子不是节点：用的是它的步骤，在节点的 note 里写明（式子：「用的是原式」；几何：列出输入的名字）。
 * 节点：{ id, k, title, lines, note, ent?, role? }；id 是 's' + k；lines 是要显示的文字；note 是一行说明。
 * 边：{ from, to }（节点 id）。
 *
 * U.StepGraph.ofExpr(state) → { nodes, edges }
 *   式子工作台：一步用到的是前面某一步产生的项，那一项带着那一步的稳定标签（form.js，形如 moved#1、collected#2），
 *   这一步的输入里有这个标签、输出里它已经不是原来的样子（被合并、移走或重写），就是用了那一步的结果。
 * U.StepGraph.ofScene(scene, steps, opts) → { nodes, edges }
 *   几何工作台：steps 是工作区里的步骤器材（按顺序）。一步的输入来源如果是某一步，或者是某一步连出去的东西
 *   （例如剪出来的块），就是用了那一步的结果。opts：{ label(ent, scene) → 步骤名, srcName(link) → 输入的名字 }。 */
(function (G) {
  'use strict';
  const U = G.U;
  const idOfStep = (k) => 's' + k;

  // 一棵式子树里所有带标签的节点：tag → 节点
  const tagsIn = (x, out) => {
    if (!x || typeof x !== 'object') return out;
    if (typeof x.tag === 'string') out[x.tag] = x;
    for (const key of Object.keys(x)) if (key !== 'tag') tagsIn(x[key], out);
    return out;
  };
  const ser = (n) => JSON.stringify(n, (k, v) => (typeof v === 'bigint' ? v.toString() : v));
  // 标签 kind#j 里的 j 是产生它的那一步的序号
  const stepOfTag = (tag) => { const m = /#(\d+)$/.exec(tag); return m ? +m[1] : 0; };
  const addEdge = (edges, from, to) => { if (!edges.some((e) => e.from === from && e.to === to)) edges.push({ from, to }); };

  function ofExpr(state) {
    const log = U.Workbench.stepLog(state);
    const nodes = [], edges = [];
    state.steps.forEach((s, i) => {
      const k = i + 1, id = idOfStep(k);
      const before = tagsIn(s.before, {}), after = tagsIn(s.after, {});
      // 用到的前面步骤的结果：输入里带的标签，输出里已经不是原样
      const used = Object.keys(before).filter((t) => !(t in after) || ser(after[t]) !== ser(before[t]));
      const from = [];
      for (const t of used) {
        const j = stepOfTag(t);
        if (j >= 1 && j < k && !from.includes(j)) from.push(j);
      }
      from.sort((a, b) => a - b).forEach((j) => addEdge(edges, idOfStep(j), id));
      // 日志是「第 k 步：移项：前 → 后」：第一行放做了什么（移项），第二行放变化（前 → 后）
      const rest = log[i] ? log[i].replace(/^第 \d+ 步：/, '') : '', cut = rest.indexOf('：');
      const lines = cut >= 0 ? [rest.slice(0, cut), rest.slice(cut + 1)] : [rest];
      const note = from.length ? '用了第 ' + from.join('、') + ' 步的结果' : '用的是原式';
      nodes.push({ id, k, title: '第 ' + k + ' 步', lines, note });
    });
    return { nodes, edges };
  }

  function ofScene(scene, steps, opts) {
    const o = opts || {}, E = scene.entities;
    const idx = new Map(steps.map((s, i) => [s.id, i + 1]));
    // 一个来源是哪一步产生的：来源本身是步骤，或者它是某一步连出去的东西（例如剪出来的块）
    const producerOf = (eid) => {
      if (idx.has(eid)) return eid;
      const l = scene.links.find((x) => x.to === eid && idx.has(x.from));
      return l ? l.from : null;
    };
    const nodes = [], edges = [];
    steps.forEach((st, i) => {
      const k = i + 1, id = idOfStep(k);
      const ins = scene.links.filter((l) => l.to === st.id && E[l.from]);
      const from = [];
      for (const l of ins) {
        const p = producerOf(l.from);
        if (p && p !== st.id && !from.includes(idx.get(p))) from.push(idx.get(p));
      }
      from.sort((a, b) => a - b).forEach((j) => addEdge(edges, idOfStep(j), id));
      const srcs = ins.map((l) => (o.srcName ? o.srcName(l) : '') || '').filter(Boolean);
      const label = o.label ? o.label(st, scene) : ((U.types[st.type] && U.types[st.type].label) || st.type);
      const note = srcs.length ? '用了：' + srcs.join('、') : '';
      nodes.push({ id, k, title: '第 ' + k + ' 步', lines: [label], note, ent: st.id, role: U.roleOf(st) });
    });
    return { nodes, edges };
  }

  U.StepGraph = { ofExpr, ofScene };
})(typeof globalThis !== 'undefined' ? globalThis : window);
