/* 角与三角函数补充题：2.4 直角（量角器）、9.6 圆周角（圆周角器材）、9.14 特殊角的三角函数（三角函数表）。每点一道核心题、一道陷阱题。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World, Q = U.Q, R = U.Real;
  const roleOf = (s, id, role) => { s.entities[id].role = role; return id; };

  // 2.4 核心：量出 90° 的角，它是直角
  U.problems.push({
    id: 'mt-right-angle-core', title: '量一量：这个角是直角吗？', grade: 2, domain: '图形', essence: ['E5', 'E3'], points: ['2.4'], level: 'core', rung: 1,
    alias: ['直角', '量角', '角'], hook: '把量角器的一边对准角的顶点，另一边指向角的一条边，读出角的度数。这是直角吗？',
    shelf: ['protractor-read'],
    build() { const s = W.blank(); roleOf(s, W.add(s, 'protractor-read', 60, 60, { angle: 0 }), 'ang'); return s; },
    predict: null,
    milestones: [
      { id: 'right', say: '读出：这是直角（90°）', score: 4, when: { type: 'protractor-read', port: 'kind', op: '=', value: '1' },
        hints: ['直角是多少度？', '把量角器的“角的度数”调到直角的度数。', '把角的度数改成 90，种类显示直角。'] },
    ],
    traps: [], goal: ['right'],
    why: '直角是 90°。量角器的读数是 90 时，角就是直角。',
  });

  // 2.4 陷阱：120° 看着接近直角，但它是钝角
  U.problems.push({
    id: 'mt-right-angle-trap', title: '这个角比直角大，它不是直角', grade: 2, domain: '图形', essence: ['E5', 'E3'], points: ['2.4'], level: 'trap', rung: 1,
    alias: ['钝角', '直角', '量角'], hook: '图中的角看起来有点大，有人说它是直角。用量角器量一量，它到底是哪一种角？',
    shelf: ['protractor-read'],
    build() { const s = W.blank(); roleOf(s, W.add(s, 'protractor-read', 60, 60, { angle: 0 }), 'ang'); return s; },
    predict: null,
    milestones: [
      { id: 'obtuse', say: '读出：这是钝角（120°），不是直角', score: 4, when: { type: 'protractor-read', port: 'kind', op: '=', value: '2' },
        hints: ['直角是 90°，比 90° 大的角叫什么角？', '把角的度数调到图中的角度，种类会显示它是哪一种角。', '把角的度数改成 120，种类显示钝角。'] },
    ],
    traps: [], goal: ['obtuse'],
    why: '直角是 90°。120° 比 90° 大，是钝角；比直角大的角不能叫直角。',
  });

  // 9.6 核心：同弧所对的圆周角是圆心角的一半，圆心角 60° 时圆周角 30°
  U.problems.push({
    id: 'mt-circle-angle-core', title: '圆心角是 60°，圆周角是多少？', grade: 9, domain: '图形', essence: ['E5', 'E3'], points: ['9.6'], level: 'core', rung: 2,
    alias: ['圆周角', '圆心角', '同弧'], hook: '在同一个圆里，同一条弧所对的圆心角是 60°。这条弧所对的圆周角是多少度？',
    shelf: ['circle-angle'],
    build() { const s = W.blank(); roleOf(s, W.add(s, 'circle-angle', 60, 60, { center_angle: 0 }), 'arc'); return s; },
    predict: null,
    milestones: [
      { id: 'half', say: '圆周角是 30°', score: 4, when: { type: 'circle-angle', port: 'inscribed', op: '=', value: '30' },
        hints: ['圆周角和圆心角的关系是什么？', '圆周角是圆心角的一半。', '把圆心角改成 60，圆周角显示 30。'] },
    ],
    traps: [], goal: ['half'],
    why: '同弧所对的圆周角等于圆心角的一半：60° ÷ 2 = 30°。',
  });

  // 9.6 陷阱：圆心角 120°，圆周角是 60°，不是 120°
  U.problems.push({
    id: 'mt-circle-angle-trap', title: '圆心角是 120°，圆周角不是 120°', grade: 9, domain: '图形', essence: ['E5', 'E3'], points: ['9.6'], level: 'trap', rung: 2,
    alias: ['圆周角', '圆心角', '一半'], hook: '同一条弧所对的圆心角是 120°。有人说圆周角也是 120°。算一算，它到底是多少度？',
    shelf: ['circle-angle'],
    build() { const s = W.blank(); roleOf(s, W.add(s, 'circle-angle', 60, 60, { center_angle: 0 }), 'arc'); return s; },
    predict: null,
    milestones: [
      { id: 'half', say: '圆周角是 60°，不是 120°', score: 4, when: { type: 'circle-angle', port: 'inscribed', op: '=', value: '60' },
        hints: ['圆周角和圆心角是什么关系？', '圆周角等于圆心角的一半，不是相等。', '把圆心角改成 120，圆周角显示 60。'] },
    ],
    traps: [], goal: ['half'],
    why: '圆周角是圆心角的一半：120° ÷ 2 = 60°。圆周角和圆心角相等是错误的说法。',
  });

  // 9.14 核心：sin 30° = 1/2
  U.problems.push({
    id: 'mt-trig-core', title: 'sin 30° 是多少？', grade: 9, domain: '图形', essence: ['E5', 'E3'], points: ['9.14'], level: 'core', rung: 2,
    alias: ['正弦', 'sin', '特殊角', '30°'], hook: '三角函数表里有 30°、45°、60° 三个特殊角的值。先把角选成 30°，读出 sin 的值。',
    shelf: ['trig-table'],
    build() { const s = W.blank(); roleOf(s, W.add(s, 'trig-table', 60, 60, { angle: 1 }), 'tb'); return s; },
    predict: null,
    milestones: [
      { id: 'sin30', say: '读出：sin 30° = 1/2', score: 4,
        when: (w) => w.some('trig-table', (e, d) => !!(d.out && d.out.sin && U.KINDS.real.eq(d.out.sin.data, R.from(Q(1, 2))))),
        why_code: '符号数（√）不能用数据形式表示，只能用函数判断是否精确等于 1/2',
        hints: ['sin 30° 的值是一个分数，不是根号。', '把“角”改成 30°，再看 sin 那一格。', '把角选成 30°，sin 显示 1/2。'] },
    ],
    traps: [], goal: ['sin30'],
    why: '在直角三角形中，30° 角所对的直角边是斜边的一半，所以 sin 30° = 1/2。',
  });

  // 9.14 陷阱：tan 45° = 1，不是 √2
  U.problems.push({
    id: 'mt-trig-trap', title: 'tan 45° 是多少？不是 √2', grade: 9, domain: '图形', essence: ['E5', 'E3'], points: ['9.14'], level: 'trap', rung: 2,
    alias: ['正切', 'tan', '特殊角', '45°'], hook: '有人说 tan 45° = √2，因为 sin 45° 和 cos 45° 是 √2/2。把角选成 45°，读出 tan 的值，看看对不对。',
    shelf: ['trig-table'],
    build() { const s = W.blank(); roleOf(s, W.add(s, 'trig-table', 60, 60, { angle: 0 }), 'tb'); return s; },
    predict: null,
    milestones: [
      { id: 'tan45', say: '读出：tan 45° = 1', score: 4,
        when: (w) => w.some('trig-table', (e, d) => !!(d.out && d.out.tan && U.KINDS.real.eq(d.out.tan.data, R.from(Q(1))))),
        why_code: '符号数（√）不能用数据形式表示，只能用函数判断是否精确等于 1',
        hints: ['tan 45° 是对边比邻边，不是 sin 或 cos 的值。', '把“角”改成 45°，再看 tan 那一格。', '把角选成 45°，tan 显示 1。'] },
    ],
    traps: [], goal: ['tan45'],
    why: 'tan 45° = sin 45° ÷ cos 45° = (√2/2) ÷ (√2/2) = 1。√2 是 sin 45° 或 cos 45° 的值，不是 tan 45°。',
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
