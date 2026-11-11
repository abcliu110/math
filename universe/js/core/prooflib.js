/* 证明库（docs/new-instruments.md 5.5）：证明排序用。每条证明：
 *   { id, grade, title, given: [已知], claim: 结论, steps: [{ id, text, needs: [前面的步骤 id], rule: 依据 }], distract: [{ id, text, why }], rules: [依据选项] }
 * 步骤的顺序要满足：每一步用到的步骤（needs）都排在它前面（拓扑序）；每一步选的依据要和 rule 一样；干扰卡（循环论证、举例当证明、逆命题）不能放。
 * lint：needs 只指向本证明里存在的步骤、没有环、每一步都能从“已知”走到结论（结论步骤要用到所有步骤）。 */
(function (G) {
  'use strict';
  const U = G.U;
  const L = [];
  const add = (p) => { L.push(p); return p; };
  add({
    id: 'odd-odd-even', grade: 5, title: '两个奇数的和是偶数', given: ['a、b 是整数'], claim: '两个奇数的和是偶数',
    steps: [
      { id: 's1', text: '设两个奇数分别是 2a + 1 和 2b + 1', needs: [], rule: '奇数的写法' },
      { id: 's2', text: '它们的和是 (2a + 1) + (2b + 1)', needs: ['s1'], rule: '加法' },
      { id: 's3', text: '= 2a + 2b + 2', needs: ['s2'], rule: '合并同类项' },
      { id: 's4', text: '= 2(a + b + 1)', needs: ['s3'], rule: '乘法分配律' },
      { id: 's5', text: '它是 2 的倍数，所以是偶数', needs: ['s4'], rule: '偶数的定义' },
    ],
    distract: [{ id: 'd1', text: '3 + 5 = 8，7 + 9 = 16，都是偶数，所以对', why: '举几个例子不是证明：没试到的数呢？' }, { id: 'd2', text: '因为和是偶数，所以 2(a + b + 1) 是偶数', why: '用结论证明结论（循环论证）。' }],
    rules: ['奇数的写法', '加法', '合并同类项', '乘法分配律', '偶数的定义', '已知'],
  });
  add({
    id: 'vertical-angles', grade: 7, title: '对顶角相等', given: ['∠1 和 ∠3 是对顶角，∠2 是它们共同的邻补角'], claim: '∠1 = ∠3',
    steps: [
      { id: 's1', text: '∠1 + ∠2 = 180°', needs: [], rule: '平角是 180°' },
      { id: 's2', text: '∠3 + ∠2 = 180°', needs: [], rule: '平角是 180°' },
      { id: 's3', text: '∠1 + ∠2 = ∠3 + ∠2', needs: ['s1', 's2'], rule: '等量代换' },
      { id: 's4', text: '∠1 = ∠3', needs: ['s3'], rule: '等式两边减同一个数' },
    ],
    distract: [{ id: 'd1', text: '量一量，∠1 和 ∠3 都是 50°，所以相等', why: '量出来的是这一幅图，不是所有对顶角。' }],
    rules: ['平角是 180°', '等量代换', '等式两边减同一个数', '对顶角相等', '已知'],
  });
  add({
    id: 'isosceles-base-angles', grade: 8, title: '等腰三角形的两个底角相等', given: ['△ABC 中，AB = AC'], claim: '∠B = ∠C',
    steps: [
      { id: 's1', text: '作顶角的平分线 AD，交 BC 于 D，∠BAD = ∠CAD', needs: [], rule: '作辅助线' },
      { id: 's2', text: '在 △ABD 和 △ACD 中，AB = AC，∠BAD = ∠CAD，AD = AD', needs: ['s1'], rule: '已知和公共边' },
      { id: 's3', text: '△ABD ≌ △ACD', needs: ['s2'], rule: '边角边（SAS）' },
      { id: 's4', text: '∠B = ∠C', needs: ['s3'], rule: '全等三角形的对应角相等' },
    ],
    distract: [{ id: 'd1', text: '因为 ∠B = ∠C，所以 AB = AC', why: '这是逆命题：把要证的结论当成了已知。' }],
    rules: ['作辅助线', '已知和公共边', '边角边（SAS）', '全等三角形的对应角相等', '角边角（ASA）'],
  });
  add({
    id: 'parallelogram-diagonals', grade: 8, title: '平行四边形的对角线互相平分', given: ['平行四边形 ABCD，对角线 AC、BD 相交于 O'], claim: 'AO = CO，BO = DO',
    steps: [
      { id: 's1', text: 'AB ∥ DC，所以 ∠BAO = ∠DCO', needs: [], rule: '平行线内错角相等' },
      { id: 's2', text: 'AB = DC', needs: [], rule: '平行四边形的对边相等' },
      { id: 's3', text: '∠AOB = ∠COD', needs: [], rule: '对顶角相等' },
      { id: 's4', text: '△AOB ≌ △COD', needs: ['s1', 's2', 's3'], rule: '角角边（AAS）' },
      { id: 's5', text: 'AO = CO，BO = DO', needs: ['s4'], rule: '全等三角形的对应边相等' },
    ],
    distract: [{ id: 'd1', text: '平行四边形的对角线互相垂直，所以 AO = CO', why: '平行四边形的对角线不一定垂直（菱形才是），这一步是错的。' }],
    rules: ['平行线内错角相等', '平行四边形的对边相等', '对顶角相等', '角角边（AAS）', '全等三角形的对应边相等'],
  });
  // 检查：返回错误列表（空 = 合格）
  function lint(p) {
    const errs = [], ids = new Set(p.steps.map((s) => s.id));
    p.steps.forEach((s) => s.needs.forEach((n) => { if (!ids.has(n)) errs.push(p.id + '：' + s.id + ' 用到不存在的 ' + n); }));
    const pos = {}; p.steps.forEach((s, i) => { pos[s.id] = i; });
    p.steps.forEach((s) => s.needs.forEach((n) => { if (pos[n] !== undefined && pos[n] >= pos[s.id]) errs.push(p.id + '：' + s.id + ' 排在它用到的 ' + n + ' 前面或同位（有环，或写的顺序不对）'); }));
    const used = new Set(); p.steps.forEach((s) => s.needs.forEach((n) => used.add(n)));
    p.steps.forEach((s, i) => { if (i < p.steps.length - 1 && !used.has(s.id)) errs.push(p.id + '：' + s.id + ' 没有被后面任何一步用到'); });
    p.steps.forEach((s) => { if (!p.rules.includes(s.rule)) errs.push(p.id + '：' + s.id + ' 的依据不在选项里'); });
    if (!p.distract.length) errs.push(p.id + '：没有干扰卡');
    return errs;
  }
  U.ProofLib = { all: () => L.slice(), get: (id) => L.find((p) => p.id === id) || null, lint };
})(typeof globalThis !== 'undefined' ? globalThis : window);
