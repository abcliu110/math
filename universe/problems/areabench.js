/* “面积公式推导”的题。拖角改底和高，再一步一步剪、移、拼。判分只看器材的输出（拼好以后的面积）。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const ab = (props) => () => { const s = W.blank(); const id = W.add(s, 'areabench', 40, 50, props); s.entities[id].role = 'ar'; return s; };
  const P = [];
  const base = { domain: '图形', level: 'core', shelf: ['areabench'], traps: [], predict: null };
  const add = (o) => P.push(Object.assign({}, base, o));
  const ms = (id, say, score, port, value, hints) => ({ id, say, score, when: { role: 'ar', port, op: '=', value: String(value) }, hints });

  add({
    id: 'ar-triangle', essence: ['E5', 'E4'], title: '三角形的面积：为什么要除以 2？', grade: 5, rung: 2, points: ['5.6'],
    topics: ['三角形面积', '转化', '剪拼'], alias: ['三角形的面积', '底乘高除以二'],
    hook: '底 6、高 4 的三角形。再拿一个一样的，转半圈拼上：拼成了什么？三角形占它的几分之几？',
    build: ab({ shape: 1, b: 6, h: 4, s: 2 }),
    milestones: [ms('area', '三角形面积 = 6 × 4 ÷ 2 = 12', 6, 'area', 12, ['点“再拿一个一样的”。', '再点“转过来拼上”：拼成平行四边形。', '平行四边形 24，三角形是一半：12。'])],
    goal: ['area'],
    why: '两个一样的三角形正好拼成一个平行四边形，底和高都和三角形一样。平行四边形面积 = 底 × 高，三角形是它的一半：底 × 高 ÷ 2。',
  });
  add({
    id: 'ar-trapezoid', essence: ['E5', 'E4'], title: '梯形的面积：上底加下底', grade: 5, rung: 3, points: ['5.6'],
    topics: ['梯形面积', '转化', '剪拼'], alias: ['梯形的面积', '上底加下底'],
    hook: '上底 3、下底 6、高 4 的梯形。再拿一个一样的倒过来拼上：拼成的平行四边形，底是多少？',
    build: ab({ shape: 2, b: 6, t: 3, h: 4, s: 1 }),
    milestones: [ms('base', '拼成的平行四边形，底是 3 + 6 = 9', 3, 'base', 9, ['点“再拿一个一样的”，再点“转过来拼上”。', '下面是一个下底接一个上底。', '6 + 3 = 9。']), ms('area', '梯形面积 = (3 + 6) × 4 ÷ 2 = 18', 5, 'area', 18, ['平行四边形 9 × 4 = 36。', '梯形是它的一半。', '18。'])],
    goal: ['area'],
    why: '两个一样的梯形，一正一倒，拼成平行四边形：底是上底 + 下底，高不变。梯形是一半：(上底 + 下底) × 高 ÷ 2。',
  });
  add({
    id: 'ar-fence-20', essence: ['E5', 'E7'], title: '20 米篱笆围长方形，怎样围面积最大？', grade: 3, rung: 4, points: ['3.12'],
    topics: ['周长与面积', '最大面积'], alias: ['篱笆', '周长一定', '面积最大'],
    hook: '篱笆一共 20 米，围成长方形。拖右边改长（宽跟着变）。周长一样，面积也一样吗？哪一种最大？',
    build: ab({ shape: 3, P: 20, w: 1 }),
    predict: { q: '周长都是 20 米的长方形，面积一样吗？', options: [{ v: 'same', label: '一样' }, { v: 'diff', label: '不一样' }], answer: 'diff' },
    milestones: [ms('best', '面积最大：5 × 5 = 25 平方米', 8, 'best', 1, ['长 + 宽 = 10。', '1 × 9 = 9，2 × 8 = 16，3 × 7 = 21……', '长和宽都是 5：25。'])],
    goal: ['best'],
    why: '周长 20 米，长 + 宽 = 10。1 × 9 = 9，2 × 8 = 16，3 × 7 = 21，4 × 6 = 24，5 × 5 = 25。周长一样，面积不一样：长和宽越接近，面积越大，围成正方形最大。',
  });
  U.problems.push.apply(U.problems, P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
