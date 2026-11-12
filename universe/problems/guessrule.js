/* 猜规则台的题（docs/new-instruments.md 4.1）：系统藏着一条规则，学生靠例子去猜；最后一道换成“你出题、系统猜”。
 * 开场时一个例子都没试过，所以每个里程碑都得学生自己做出来。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const gr = (props) => () => { const s = W.blank(); const id = W.add(s, 'guessrule', 60, 60, props); s.entities[id].role = 'g'; return s; };
  const ms = (id, say, score, port, op, value, hints) => ({ id, say, score, when: { role: 'g', port, op, value: String(value) }, hints });
  const P = [];
  const base = { domain: '关系', level: 'core', shelf: ['guessrule'], predict: null };

  P.push(Object.assign({}, base, {
    id: 'gr-even', essence: ['E9', 'E8'], title: '猜一猜：系统心里的规则是什么？', grade: 2, rung: 2, points: ['1.16'],
    topics: ['猜规则', '例子与规律', '单数双数'], alias: ['猜规则', '找规律', '算不算', '单数', '双数'],
    hook: '系统心里藏着一条规则：有的数“算”，有的数“不算”。点一个数，先猜它算不算，再看答案。别只试你觉得“算”的，也试试“不算”的。',
    build: gr({ secret: 0 }),
    milestones: [
      ms('three', '试了 3 个例子', 2, 'tried', '>=', 3, ['点数字格子，再点“我猜：算”或“我猜：不算”。', '先试 1、2、3。', '每个数试一次。']),
      ms('neg', '试出了一个“不算”的例子', 2, 'negs', '>=', 1, ['有的数不算。哪些数不算？', '多试几个不同的数。', '试 1 或 3。']),
      ms('solved', '猜对了规则', 6, 'solved', '=', 1, ['看看“算”的数有什么共同点。', '在下面点一条猜想。', '点“双数”。']),
    ],
    traps: [], goal: ['solved'],
    why: '规则是“双数”。例子只能告诉你“这一个算不算”；想知道规则是不是对的，要找能把它推翻的例子，找不到，才比较放心。',
  }));
  P.push(Object.assign({}, base, {
    id: 'gr-mod3', essence: ['E9', 'E8'], title: '1、4、7 都算：是单数吗？', grade: 5, rung: 3, points: ['5.8'],
    topics: ['猜规则', '余数', '反例'], alias: ['猜规则', '余数', '反例', '算不算'],
    hook: '系统换了一条规则。试一试 1、4、7——它们都算。它们都是单数吗？别急着下结论：造一个能把你的想法推翻的例子。',
    build: gr({ secret: 5 }),
    milestones: [
      ms('info', '试了 3 个有信息量的例子', 3, 'informative', '>=', 3, ['有信息量：这个例子能让还没排除的规则分出算与不算。', '1、4、7 之后试试 2、3。', '试不同类型的数。']),
      ms('refute', '你的猜想被一个例子推翻了', 3, 'counter', '>', 0, ['先点一条猜想，比如“单数”。', '系统会找一个能区分它和真规则的例子。', '点“单数”。']),
      ms('solved', '猜对了规则', 4, 'solved', '=', 1, ['每个算的数，除以 3 余几？', '1、4、7 都比 3 的倍数多 1。', '点“除以 3 余 1 的数”。']),
    ],
    traps: [{ id: 'odd', wrong: '1、4、7 里有 4，4 是双数，所以不是“单数”。例子都符合，不等于规则对。', when: { role: 'g', port: 'counter', op: '>', value: '0' } }],
    goal: ['solved'],
    why: '规则是“除以 3 余 1 的数”：1、4、7、10……每次加 3。“都是单数”这样的猜想，一个反例（4）就推翻了；例子再多，也只能说“没找到反例”。',
  }));
  P.push(Object.assign({}, base, {
    id: 'gr-iso', essence: ['E9', 'E8'], title: '猜三角形的规则', grade: 4, rung: 3, points: ['4.12'],
    topics: ['猜规则', '三角形分类', '等腰三角形'], alias: ['猜规则', '三角形', '等腰三角形', '分类'],
    hook: '现在例子是 24 个画在格子上的三角形。点一个，猜它算不算。先试几个，再说规则。',
    build: gr({ secret: 15 }),
    milestones: [
      ms('four', '试了 4 个三角形', 2, 'tried', '>=', 4, ['点一个三角形，再点“我猜”。', '多试几个。', '试 4 个不同的。']),
      ms('neg', '试出了一个“不算”的三角形', 2, 'negs', '>=', 1, ['有的三角形不算，是哪些？', '多试几种形状。', '换个形状再试。']),
      ms('solved', '猜对了规则', 6, 'solved', '=', 1, ['“算”的三角形，边有什么共同点？', '量一量各边。', '点“有两条边相等的三角形”。']),
    ],
    traps: [], goal: ['solved'],
    why: '规则是“有两条边相等的三角形”（等腰三角形）。只有 24 个三角形，所以检查完了也能肯定：你的规则在这 24 个里和系统处处一致。',
  }));
  P.push(Object.assign({}, base, {
    id: 'gr-swap', essence: ['E9', 'E8'], title: '换你出题：让系统来猜', grade: 5, rung: 4, points: ['5.8'],
    topics: ['猜规则', '例子与规律', '互换角色'], alias: ['猜规则', '出题', '互换'],
    hook: '这回你是出题的人。选一条规则，系统会一个一个地问你：“这个数算不算？”你照实回答，看系统要问几个例子才能猜出来。答错了，系统会指出来。',
    build: gr({ secret: 0, mode: 1 }),
    milestones: [
      ms('sys', '系统用你的例子猜出了规则', 8, 'sysSolved', '=', 1, ['先在上面选一条规则。', '系统问“它算不算”，你点“算”或“不算”。', '一直答到系统猜出来为止。']),
    ],
    traps: [], goal: ['sys'],
    why: '系统每次问的例子，都是把“还没排除的规则”分成两半的那一个：你的每个回答排除一半。这就是为什么挑对例子，比多挑例子更重要。',
  }));
  for (const p of P) U.problems.push(p);
})(typeof globalThis !== 'undefined' ? globalThis : window);
