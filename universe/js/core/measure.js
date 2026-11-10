/* 尺子、量角器（标记）和标注（docs/next-steps.md §10.5.9 第 6 条）。内核部分，不碰界面。
 * 它们不是器材，存在台面的顶层字段上（和 scene.workbench 一样），撤销、存档、断点续做都走台面的整体快照：
 *  - scene.marks：[{ id, ws, kind, pts }]，pts 是工作区坐标的点（整数或 1/1000 精度）。
 *      ruler 两个点（尺子的两端）；protractor 三个点：pts[0] 第一条边的端点，pts[1] 顶点，pts[2] 第二条边的端点。
 *  - scene.notes：[{ id, ws, ref, text }]，ref 是线段器材的 id（gseg），或量角器标记的 id。
 * 标记和标注只读图形的坐标，不改图形。动作：{ t: 'mark', op: 'add' | 'move' | 'del', … }、{ t: 'note', op: 'add' | 'del', … }。 */
(function (G) {
  'use strict';
  const U = G.U;
  const KINDS = { ruler: 2, protractor: 3 };   // 每种标记要几个点
  const LIM = 1e6;                              // 坐标绝对值的上限（工作区的坐标范围远小于它）
  const NOTE_MAX = 40;                          // 标注最多几个字
  const ok = (x) => Object.assign({ ok: true }, x || {});
  const fail = (why) => ({ ok: false, why });
  const find = (list, id) => (list || []).find((x) => x.id === id);
  const isWs = (scene, id) => { const e = scene.entities[id]; return !!(e && U.types[e.type] && U.types[e.type].workspace); };
  // 点：有限的数，四舍五入到 1/1000；+ 0 把 −0 变成 0（存档和比较都用 JSON）
  function cleanPt(p) {
    if (!p || typeof p !== 'object') return null;
    const x = Number(p.x), y = Number(p.y);
    if (!Number.isFinite(x) || !Number.isFinite(y) || Math.abs(x) > LIM || Math.abs(y) > LIM) return null;
    return { x: Math.round(x * 1000) / 1000 + 0, y: Math.round(y * 1000) / 1000 + 0 };
  }

  function act(scene, a) {
    if (a.t === 'mark') return markAct(scene, a);
    if (a.t === 'note') return noteAct(scene, a);
    return fail('没有这种动作');
  }

  function markAct(scene, a) {
    const marks = scene.marks || [];
    if (a.op === 'add') {
      if (!isWs(scene, a.ws)) return fail('找不到工作区');
      if (!KINDS[a.kind]) return fail('没有这种标记');
      const pts = (a.pts || []).map(cleanPt);
      if (pts.length !== KINDS[a.kind] || pts.some((p) => !p)) return fail('标记的点不对');
      const id = 'm' + scene.nid++;
      scene.marks = marks.concat([{ id, ws: a.ws, kind: a.kind, pts }]);
      return ok({ id });
    }
    const m = find(marks, a.id);
    if (!m) return fail('找不到这把尺子或量角器');
    if (a.op === 'move') {
      const p = cleanPt({ x: a.x, y: a.y }), i = a.i;
      if (!p || !(i >= 0 && i < m.pts.length)) return fail('把手的位置不对');
      scene.marks = marks.map((x) => (x.id === m.id ? Object.assign({}, x, { pts: x.pts.map((q, k) => (k === i ? p : q)) }) : x));
      return ok();
    }
    // 整把挪动（按住尺子或量角器拖）：每个点都挪 dx、dy（整数，所以坐标还是精确的）
    if (a.op === 'shift') {
      const dx = Number(a.dx), dy = Number(a.dy);
      if (!Number.isFinite(dx) || !Number.isFinite(dy)) return fail('挪动的距离不对');
      const moved = m.pts.map((q) => cleanPt({ x: q.x + dx, y: q.y + dy }));
      if (moved.some((q) => !q)) return fail('挪出了坐标范围');
      scene.marks = marks.map((x) => (x.id === m.id ? Object.assign({}, x, { pts: moved }) : x));
      return ok();
    }
    if (a.op === 'del') {
      // 量角器删了，它的标注一起删（标注引用它）
      scene.marks = marks.filter((x) => x.id !== m.id);
      scene.notes = (scene.notes || []).filter((n) => n.ref !== m.id);
      return ok();
    }
    return fail('没有这种标记操作');
  }

  function noteAct(scene, a) {
    const notes = scene.notes || [];
    if (a.op === 'add') {
      if (!isWs(scene, a.ws)) return fail('找不到工作区');
      const text = String(a.text || '').trim().slice(0, NOTE_MAX);
      if (!text) return fail('标注的文字不能空着');
      const e = scene.entities[a.ref], m = find(scene.marks, a.ref);
      const onSeg = !!e && e.type === 'gseg' && e.parent === a.ws;
      const onAngle = !!m && m.ws === a.ws && m.kind === 'protractor';
      if (!onSeg && !onAngle) return fail('标注只能写在工作区里的线段或量角器的角上');
      const id = 'n' + scene.nid++;
      scene.notes = notes.concat([{ id, ws: a.ws, ref: a.ref, text }]);
      return ok({ id });
    }
    if (a.op === 'del') {
      const n = find(notes, a.id);
      if (!n) return fail('找不到这条标注');
      scene.notes = notes.filter((x) => x.id !== n.id);
      return ok();
    }
    return fail('没有这种标注操作');
  }

  U.Measure = { act, KINDS, NOTE_MAX };
})(typeof globalThis !== 'undefined' ? globalThis : window);
