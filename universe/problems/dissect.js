/* 剪拼的题（docs/new-instruments.md 6.6）：勾股的弦图、把直角改成钝角、圆面积的切拼。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const ds = (props) => () => { const s = W.blank(); const id = W.add(s, 'dissect', 60, 60, props); s.entities[id].role = 'd'; return s; };
  const P = [];
  const add = (o) => P.push(Object.assign({ domain: '图形', level: 'core', shelf: ['dissect'], predict: null, traps: [] }, o));
  const ms = (id, say, score, port, op, value, hints) => ({ id, say, score, when: { role: 'd', port, op, value: String(value) }, hints });
  add({
    id: 'dz-pyth', essence: ['E5', 'E7'], title: '弦图：两个小正方形拼成大正方形', grade: 8, rung: 3, points: ['8.11'], build: ds({ scene: 0, a: 3, b: 4, angle: 2 }),
    topics: ['勾股定理', '剪拼', '弦图'], alias: ['勾股定理', '弦图', '剪拼', '面积'],
    hook: '直角边是 3 和 4。弦图里，边长 a + b 的大正方形放 4 个三角形，中间空出 c²；换一种放法，空出 a² 和 b²。现在夹角被改成了 120°（钝角），拼不满。把夹角改回 90°，看 c² 是多少。',
    milestones: [ms('fit', '夹角是直角：弦图拼得满，c² = 25', 6, 'c2', '=', 25, ['“两边的夹角”选 90°（直角）。', '直角时 c² = a² + b²。', '9 + 16 = 25。']), ms('fits', '拼得满了', 2, 'fits', '=', 1, ['夹角改回 90°。', '看“拼得满”。', '选 90°（直角）。'])],
    goal: ['fit'], why: '直角三角形：两个小正方形的面积 a² + b² 正好等于大正方形 c²。弦图两种放法里，大正方形和 4 个三角形都一样，所以空出来的面积相等：c² = a² + b²。',
  });
  add({
    id: 'dz-obtuse', essence: ['E5', 'E7'], title: '不是直角，勾股定理还成立吗？', grade: 8, rung: 4, points: ['8.11'], build: ds({ scene: 0, a: 5, b: 12, angle: 1 }),
    topics: ['勾股定理', '定理的条件', '钝角三角形'], alias: ['勾股定理', '钝角', '定理条件', '反例'],
    hook: '直角边 5 和 12，夹角 90°：a² + b² = c² = 169。先猜：把夹角改成 120°（钝角），c² 会变大还是变小？改一改，看看相差多少。',
    milestones: [ms('gap', '钝角时 c² 比 a² + b² 大', 6, 'gap', '>', 0, ['“两边的夹角”改成 120°。', '夹角变大，对边变长。', '差是 ab = 60。']), ms('guess', '先猜对了：钝角时不再相等', 2, 'guessed', '=', 1, ['直角时才相等，钝角呢？', '先猜选“c² 大”。', '先猜里选 2。'])],
    goal: ['gap'], why: '夹角 120° 时，c² = a² + b² + ab：大了 ab。勾股定理的条件是“直角”——条件变了，结论就变了。',
  });
  add({
    id: 'dz-circle', essence: ['E5', 'E7'], title: '把圆切开拼成长方形：面积变了吗？', grade: 6, rung: 3, points: ['6.5'], build: ds({ scene: 1, r: 5, n: 4 }),
    topics: ['圆的面积', '剪拼', '逼近'], alias: ['圆的面积', '剪拼', '切拼', '逼近'],
    hook: '把圆切成 4 个扇形，交错拼起来，像一个歪歪的平行四边形。切得越细，越像长方形：底边是半个周长，高是半径。先猜：拼出来的面积和圆比，变了没有？再把扇形切得更细。',
    milestones: [ms('fine', '切成 32 份，拼出的面积和圆只差不到 1%', 6, 'wobble', '<', '0.01', ['点“多切一倍”。', '切得越细，越像长方形。', '切到 32 份。']), ms('right', '先猜对了：面积没变（只是重新拼了）', 2, 'guessed', '=', 1, ['剪开再拼，面积变吗？', '先猜选“没变”。', '先猜里选 1。'])],
    goal: ['fine'], why: '拼出的长方形：长 ≈ 半个周长 = πr，宽 = r，面积 = πr × r = πr²。切得越细，越接近长方形（这是逼近：n 再大，也只是更接近）。',
  });
  for (const p of P) U.problems.push(p);
})(typeof globalThis !== 'undefined' ? globalThis : window);
