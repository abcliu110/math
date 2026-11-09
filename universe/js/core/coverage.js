/* 知识点覆盖（任务 D，见 next-steps.md §5）。
 *  - U.CURRICULUM 由 tools/extract-curriculum.js 生成（142 个知识点）。
 *  - lint：题目的 points 必须都是表里存在的 id；没写 points 只给警告。
 *  - U.Coverage.summarize(problems)：按知识点、年级、本质统计题目数、级别、器材和最高证据等级。 */
(function (G) {
  'use strict';
  const U = G.U;
  U.CURRICULUM = U.CURRICULUM || {};

  U.CurriculumLint = function (p) {
    const errors = [], warnings = [];
    const pts = p.points || [];
    for (const id of pts) if (!U.CURRICULUM[id]) errors.push('知识点 ' + id + ' 不在知识点表里（tools/extract-curriculum.js）');
    if (!pts.length) warnings.push('没有对应的知识点（points 为空）');
    return { errors, warnings };
  };
  const base = U.problemLint;
  U.problemLint = function (p) {
    const r = base(p), c = U.CurriculumLint(p);
    return { errors: r.errors.concat(c.errors), warnings: r.warnings.concat(c.warnings), fnCount: r.fnCount, condCount: r.condCount };
  };

  // 统计：按知识点 / 年级 / 本质
  U.Coverage = {
    summarize(problems) {
      const byPoint = {}, byGrade = {}, byEssence = {}, noPoint = [];
      for (const id of Object.keys(U.CURRICULUM)) byPoint[id] = { id, title: U.CURRICULUM[id].title, grade: U.CURRICULUM[id].grade, core: 0, trap: 0, stretch: 0, devices: new Set(), best: 0, problems: [] };
      for (const p of problems) {
        const lvl = p.level || 'core', ev = p.evidence || 1;
        const devs = new Set(); try { const s = p.build(); for (const e of Object.values(s.entities)) devs.add(e.type); } catch (e) { /* 题目建不出来时不计器材 */ }
        const pts = p.points || [];
        if (!pts.length) noPoint.push(p.id);
        for (const id of pts) {
          const row = byPoint[id]; if (!row) continue;
          row[lvl] = (row[lvl] || 0) + 1; devs.forEach((d) => row.devices.add(d)); row.best = Math.max(row.best, ev); row.problems.push(p.id);
          const g = row.grade; byGrade[g] = byGrade[g] || { grade: g, points: 0, covered: 0, problems: 0 };
        }
        for (const e of p.essence || []) { byEssence[e] = byEssence[e] || { essence: e, problems: 0, devices: 0 }; byEssence[e].problems++; }
      }
      for (const row of Object.values(byPoint)) {
        const g = byGrade[row.grade] = byGrade[row.grade] || { grade: row.grade, points: 0, covered: 0, problems: 0 };
        g.points++; if (row.problems.length) g.covered++; g.problems += row.problems.length;
      }
      for (const t of Object.values(U.types)) for (const e of t.essence || []) { byEssence[e] = byEssence[e] || { essence: e, problems: 0, devices: 0 }; byEssence[e].devices++; }
      const essenceIds = U.ESSENCE_IDS || Object.keys(byEssence);
      const emptyEssence = essenceIds.filter((e) => !byEssence[e] || byEssence[e].devices === 0);
      const emptyProblemEssence = essenceIds.filter((e) => !byEssence[e] || byEssence[e].problems === 0);
      return {
        points: Object.values(byPoint).map((r) => Object.assign({}, r, { devices: [...r.devices] })),
        grades: Object.values(byGrade).sort((a, b) => a.grade - b.grade),
        essences: essenceIds.map((e) => Object.assign({ essence: e }, byEssence[e] || { problems: 0, devices: 0 })),
        noProblemPoints: Object.values(byPoint).filter((r) => !r.problems.length).map((r) => r.id),
        noPoint, emptyEssence, emptyProblemEssence,
      };
    },
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
