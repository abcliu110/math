/* 改规则的世界：三角形的内角和。 */
(function (G) {
  'use strict';
  const U = G.U, mk = U.mkScene, P = [];
  const cv = () => mk({ ents: [{ type: 'curved', x: 100, y: 70, role: 'w', props: { space: 0, A: 60, B: 60, C: 60 } }] });
  P.push({
    id: 'sphere-right3', title: '三个角都是直角的三角形，存在吗？', grade: 8, domain: '图形', points: ['内角和', '球面三角形', '公理'],
    alias: ['内角和', '公理'], hook: '平面上三个角加起来永远是 180°。可是想想地球：从北极往下到赤道，转 90° 走赤道四分之一圈，再转 90° 回北极——三个角都是 90°！先在平面上试着把三个角都改成 90°，看看世界怎么说，再换到球面。',
    shelf: ['curved', 'meter', 'compare'],
    build: cv(),
    predict: { q: '先猜：三个角都是 90° 的三角形——', options: [{ v: 0, label: '不存在' }, { v: 1, label: '在平面上存在' }, { v: 2, label: '换个世界就存在' }], reveal: () => ({ v: 2, label: '在球面上存在' }) },
    milestones: [
      { id: 'sph', say: '把世界换成球面', score: 2, when: (w) => w.some('curved', (e) => e.props.space === 1), hints: ['属性「放在哪个世界」。', '选球面。', '球面。'] },
      { id: 'r3', say: '球面上三个角都是 90°，内角和 270°', score: 4, when: { role: 'w', port: 'sum', op: '=', value: '270' }, hints: ['三个角都改。', 'A、B、C 都是 90。', '90+90+90。'] },
      { id: 'frac', say: '读出它占整个球面的 1/8', score: 4, when: { role: 'w', port: 'frac', op: '=', value: '1/8' }, hints: ['看“占整个球面的几分之几”。', '多出的 90° 除以 720°。', '1/8：球面正好切成 8 块这样的三角形。'] },
    ],
    traps: [], why: '“内角和 180°”不是自然定律，是平面的规则。球面上三角形的内角和大于 180°，多出的部分正比于它的面积：多出 90°，占整个球面 90/720 = 1/8。三个直角的三角形，就是把球面切成 8 份的其中一份。', ref: ['curved|0'],
  });
  P.push({
    id: 'sphere-quarter', title: '要占整个球面的四分之一，三个角怎么取？', grade: 9, domain: '图形', points: ['球面三角形', '角盈与面积'],
    alias: ['球面'], hook: '换到球面。要让三角形占整个球面的 1/4，三个角的和应该是多少？试着让三个角相等。',
    shelf: ['curved', 'meter', 'compare'],
    build: cv(),
    predict: { q: '先猜：三个角的和是——', options: [{ v: 270, label: '270°' }, { v: 360, label: '360°' }, { v: 540, label: '540°' }], reveal: () => ({ v: 360, label: '360°（多出 180°，占 180/720 = 1/4）' }) },
    milestones: [
      { id: 'q', say: '占球面的 1/4', score: 10, when: { role: 'w', port: 'frac', op: '=', value: '1/4' }, hints: ['先换球面。', '多出的角度要是 720° 的 1/4。', '内角和 360°，如 120+120+120。'] },
    ],
    traps: [], why: '多出的角度 = 面积占比 × 720°。1/4 对应多出 180°，内角和 360°。三个角各 120° 就行。', ref: ['curved|0'],
  });
  U.problems.push(...P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
