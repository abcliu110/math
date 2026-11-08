/* 三角形的角、不等式。 */
(function (G) {
  'use strict';
  const U = G.U, mk = U.mkScene, P = [];
  P.push({
    id: 'triangle-right', title: '一个角 35°，要让三角形是直角三角形', grade: 7, domain: '图形', points: ['三角形内角和', '直角三角形'],
    alias: ['内角和'], hook: '角 A 是 35°。把角 B 调一调，让角 C 变成 90°。先猜 B 是多少。',
    shelf: ['angles', 'meter', 'compare'],
    build: mk({ ents: [{ type: 'angles', x: 120, y: 80, role: 't', props: { A: 35, B: 60 } }] }),
    predict: { q: '先猜：B 应该是——', options: [{ v: 35, label: '35°' }, { v: 55, label: '55°' }, { v: 65, label: '65°' }], reveal: () => ({ v: 55, label: '55°（35+55+90=180）' }) },
    milestones: [
      { id: 'c90', say: '角 C 变成 90°', score: 6, when: { role: 't', port: 'C', op: '=', value: '90' }, hints: ['三个角加起来是 180°。', '180 − 35 − 90 = ?', 'B = 55。'] },
      { id: 'b55', say: '角 B 是 55°', score: 4, when: (w) => w.some('angles', (e) => e.props.B === 55), hints: ['看属性「角 B」。', '把它改成 55。', '55。'] },
    ],
    traps: [{ id: 'big', when: (w) => w.some('angles', (e) => e.props.A + e.props.B >= 180), wrong: '两个角加起来不能到 180°——三角形的三个角一共才 180°。' }],
    why: '三角形内角和是 180°。C = 180 − 35 − B = 90，所以 B = 55°。', ref: ['angles|0'],
  });
  P.push({
    id: 'ineq-min-int', title: '2x + 1 > 7，最小的整数 x 是几？', grade: 8, domain: '代数', points: ['一元一次不等式', '解集'],
    alias: ['不等式'], hook: '先把不等式器材调成 2x + 1 > 7。它能试任何 x。找出分界点，再找最小的整数解——注意“>”不包括分界点本身。',
    shelf: ['ineq', 'meter', 'compare'],
    build: mk({ ents: [{ type: 'ineq', x: 120, y: 80, role: 'q', props: { a: 1, b: 0, dir: 0, c: 0, x: 0 } }] }),
    predict: { q: '先猜：最小整数解——', options: [{ v: 3, label: '3' }, { v: 4, label: '4' }, { v: 6, label: '6' }], reveal: () => ({ v: 4, label: '4（x = 3 刚好不成立）' }) },
    milestones: [
      { id: 'bound', say: '调成 2x+1>7，分界点是 3', score: 3, when: { role: 'q', port: 'bound', op: '=', value: '3' }, hints: ['2x + 1 = 7 的解。', '(7 − 1) ÷ 2。', '3。'] },
      { id: 'no3', say: '试 x = 3：不成立', score: 3, when: (w) => w.some('ineq', (e) => e.props.x === 3 && w.num(e, 'ok') === 0), hints: ['把“试一试 x”改成 3。', '看右上的 ✓/✗。', '3 取不到，因为是“>”。'] },
      { id: 'yes4', say: '试 x = 4：成立', score: 4, when: (w) => w.some('ineq', (e) => e.props.x === 4 && w.num(e, 'ok') === 1), hints: ['再试一个更大的整数。', '3 后面的整数。', '4。'] },
    ],
    traps: [], why: '2x+1>7 ⇒ x>3，空心圆表示 3 本身不算。大于 3 的最小整数是 4。', ref: ['ineq|0'],
  });
  U.problems.push(...P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
