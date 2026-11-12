/* 证明类器材的题（docs/new-instruments.md 第 7 节，批次 0）。
 * 之前反例构造器、参数扫描器、归纳阶梯、证明脚手架、猜想板一道题都没有，证据等级 ②③④ 在题库里没有出现过。
 * 每道题的开场台面都“还没达到目标”（目标要学生自己改出来），目标等级写在 evidence 里：
 *   推翻（反例）、② 没找到反例、③ 穷举、④ 结构证明。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const add = (type, props, role) => { const s = W.blank(); const id = W.add(s, type, 60, 60, props); s.entities[id].role = role; return s; };
  const P = [];

  // ---- 反例构造器：一个反例就够推翻 ----
  // 规则的选项顺序见 packs/proof.js：0 平方不小于本身，3 质数都是奇数，4 偶数的一半也是偶数，5 2n+1 是质数
  P.push({
    id: 'pf-2n1-prime', essence: ['E9'], title: '2n + 1 总是质数吗？找第一个反例', grade: 5, domain: '关系', points: ['5.8'], level: 'core', rung: 3, evidence: 2,
    topics: ['质数', '反例', '证明与证据'], alias: ['反例', '质数', '总是', '推翻'],
    hook: 'n = 1、2、3 时，2n + 1 是 3、5、7，都是质数。有人说：2n + 1 总是质数。反例构造器现在检查的是别的规则——换成“2n+1 是质数”，看它在哪一个 n 上出错。',
    shelf: ['counterex', 'meter'],
    build: () => add('counterex', { rule: 0, from: 1, to: 50 }, 'c'),
    predict: { q: '先猜：2n + 1 在 n = 1 到 50 里，会出错吗？', options: [{ v: 0, label: '不会，总是质数' }, { v: 1, label: '会，有例外' }, { v: 2, label: '说不准' }], reveal: () => ({ v: 1, label: '会：n = 4 时是 9 = 3 × 3' }) },
    milestones: [
      { id: 'found', say: '换成“2n+1 是质数”，找到了反例', score: 4, when: { role: 'c', port: 'counter', op: '>=', value: '0' },
        hints: ['反例构造器要检查的规则不是现在这一条。', '“要推翻的规则”里选“2n+1 是质数”。', '把规则改成“2n+1 是质数”。'] },
      { id: 'four', say: '第一个反例是 n = 4', score: 3, when: { role: 'c', port: 'counter', op: '=', value: '4' },
        hints: ['看“反例”读数。', '算一算 n = 4 时 2n + 1 是几。', '2 × 4 + 1 = 9 = 3 × 3，不是质数。'] },
    ],
    traps: [], goal: ['found', 'four'],
    why: '2n + 1 在 n = 1、2、3 时都是质数，但 n = 4 时是 9 = 3 × 3。试了 3 个都对，不等于总是对；一个反例就足够推翻“总是”。',
    ref: ['counterex|0'],
  });
  P.push({
    id: 'pf-prime-odd', essence: ['E9'], title: '质数都是奇数吗？', grade: 5, domain: '关系', points: ['5.8'], level: 'core', rung: 3, evidence: 2,
    topics: ['质数', '奇数', '反例'], alias: ['反例', '质数', '奇数', '2'],
    hook: '3、5、7、11、13、17……质数好像都是奇数。有人说：质数都是奇数。让反例构造器去找，看它找到的是哪一个。',
    shelf: ['counterex', 'meter'],
    build: () => add('counterex', { rule: 0, from: 1, to: 50 }, 'c'),
    predict: { q: '先猜：质数都是奇数吗？', options: [{ v: 0, label: '都是' }, { v: 1, label: '不都是' }], reveal: () => ({ v: 1, label: '不都是：2 是质数，也是偶数' }) },
    milestones: [
      { id: 'found', say: '换成“质数都是奇数”，找到了反例', score: 4, when: { role: 'c', port: 'counter', op: '>=', value: '0' },
        hints: ['反例构造器现在检查的不是这一句话。', '“要推翻的规则”里选“质数都是奇数”。', '把规则改成“质数都是奇数”。'] },
      { id: 'two', say: '反例是 2', score: 3, when: { role: 'c', port: 'counter', op: '=', value: '2' },
        hints: ['看“反例”读数。', '最小的质数是几？', '2：它是质数，但不是奇数。'] },
    ],
    traps: [], goal: ['found', 'two'],
    why: '2 是质数，又是偶数，所以“质数都是奇数”不对。只有一个例外，也足够推翻“都是”。',
    ref: ['counterex|0'],
  });
  P.push({
    id: 'pf-half-even', essence: ['E9'], title: '偶数的一半也是偶数吗？', grade: 5, domain: '关系', points: ['5.8'], level: 'core', rung: 3, evidence: 2,
    topics: ['偶数', '反例'], alias: ['反例', '偶数', '一半'],
    hook: '4 的一半是 2，8 的一半是 4，12 的一半是 6，都是偶数。有人说：偶数的一半也是偶数。检查一下，它是真的吗？',
    shelf: ['counterex', 'meter'],
    build: () => add('counterex', { rule: 0, from: 1, to: 50 }, 'c'),
    predict: { q: '先猜：偶数的一半也是偶数吗？', options: [{ v: 0, label: '总是' }, { v: 1, label: '不总是' }], reveal: () => ({ v: 1, label: '不总是：2 的一半是 1' }) },
    milestones: [
      { id: 'found', say: '换成“偶数的一半也是偶数”，找到了反例', score: 4, when: { role: 'c', port: 'counter', op: '>=', value: '0' },
        hints: ['先把要检查的规则换成这句话。', '“要推翻的规则”里选“偶数的一半也是偶数”。', '规则选“偶数的一半也是偶数”。'] },
      { id: 'two', say: '反例是 2', score: 3, when: { role: 'c', port: 'counter', op: '=', value: '2' },
        hints: ['看“反例”读数。', '最小的正偶数是几？它的一半呢？', '2 的一半是 1，是奇数。'] },
    ],
    traps: [], goal: ['found', 'two'],
    why: '2 的一半是 1，不是偶数。例子里 4、8、12 都对，只因为它们是 4 的倍数。',
    ref: ['counterex|4'],
  });

  // ---- 参数扫描器：扫过 1 到 100 没有例外，是证据 ②，不是证明 ----
  P.push({
    id: 'pf-sum3-scan', essence: ['E9', 'E8'], title: '连续三个整数的和，等于什么？扫 1 到 100 检查', grade: 5, domain: '关系', points: ['5.8'], level: 'core', rung: 3, evidence: 2,
    topics: ['倍数', '规律', '证据'], alias: ['扫描', '连续整数', '三个连续', '倍数'],
    hook: '1 + 2 + 3 = 6，2 + 3 + 4 = 9，3 + 4 + 5 = 12，都是 3 的倍数。有人写了一个式子：n + (n+1) + (n+2) = 3n。参数扫描器说它不对。改正这个式子，让它在 1 到 100 里都对。',
    shelf: ['scanner', 'meter'],
    build: () => add('scanner', { rule: 9, custom: 'n+(n+1)+(n+2) = 3n', from: 1, to: 100 }, 's'),
    predict: { q: '先猜：n + (n+1) + (n+2) 等于——', options: [{ v: 0, label: '3n' }, { v: 1, label: '3n + 3' }, { v: 2, label: '3n + 2' }], reveal: () => ({ v: 1, label: '3n + 3，也就是 3(n + 1)' }) },
    milestones: [
      { id: 'wrong', say: '看到“3n”有例外：n = 1 时 6 ≠ 3', score: 2, when: { role: 's', port: 'counter', op: '=', value: '1' },
        hints: ['看“第一个例外”读数。', 'n = 1 时，1 + 2 + 3 = 6，而 3n = 3。', '3n 少了一部分。'] },
      { id: 'ok', say: '改对式子，1 到 100 都没有例外（证据 ②）', score: 6, when: { role: 's', port: 'lv', op: '>=', value: '2' },
        hints: ['等号右边要比 3n 大一点。', '“自己写的规则”里改右边。', '写成 n+(n+1)+(n+2) = 3n+3。'] },
    ],
    traps: [], goal: ['ok'],
    why: 'n + (n+1) + (n+2) = 3n + 3 = 3(n + 1)，所以连续三个整数的和是 3 的倍数。扫描器在 1 到 100 里没有找到例外：这是证据 ②，不是证明；真正的“为什么”要看式子：左边化简就是 3(n+1)。',
    ref: ['scanner|9'],
  });

  // ---- 系统枚举器：列全才算 ③ ----
  P.push({
    id: 'pf-three-dice', essence: ['E9', 'E11'], title: '三个骰子，点数和是 10 的有几种？', grade: 6, domain: '统计与概率', points: ['5.4'], level: 'core', rung: 4, evidence: 3,
    topics: ['列举', '可能性', '穷举'], alias: ['枚举', '骰子', '三个骰子', '全部情况'],
    hook: '现在摆的是两个骰子的 36 种情况。三个骰子一共有多少种情况？把“全部情况”换成三个骰子，再告诉器材应有几种，让它列全后数出和为 10 的有几种。',
    shelf: ['enumerator', 'op', 'meter'],
    build: () => add('enumerator', { set: 0, target: 10, expected: 36 }, 'e'),
    predict: { q: '先猜：三个骰子一共有多少种情况？', options: [{ v: 0, label: '18 种（6 + 6 + 6）' }, { v: 1, label: '36 种' }, { v: 2, label: '216 种（6 × 6 × 6）' }], reveal: () => ({ v: 2, label: '216 种：每个骰子 6 种，6 × 6 × 6' }) },
    milestones: [
      { id: 'count', say: '三个骰子和为 10 的有 27 种', score: 4, when: { role: 'e', port: 'count', op: '=', value: '27' },
        hints: ['把“全部情况”换成三个骰子。', '属性「全部情况」选“三个骰子”。', '选三个骰子，数出来是 27 种。'] },
      { id: 'full', say: '把“应有几种”改成 216，列全了（证据 ③）', score: 5, when: { role: 'e', port: 'total', op: '=', value: '216' },
        hints: ['列全的意思是：你知道应该有多少种，列出的也一样多。', '每个骰子 6 种，三个骰子一共是……', '“应有几种情况”填 216。'] },
    ],
    traps: [], goal: ['count', 'full'],
    why: '三个骰子的情况是 6 × 6 × 6 = 216 种，和为 10 的有 27 种。只有“应有的数量”和“列出的数量”对上，才能说没有漏：这是穷举（证据 ③）。',
    ref: ['enumerator|0'],
  });

  // ---- 归纳阶梯：起点成立 + 每一级推下一级 ----
  const induct = (id, rule, title, hook, grade, point, why, first) => P.push({
    id, essence: ['E9', 'E6'], title, grade, domain: '关系', points: [point], level: 'stretch', rung: 5, evidence: 4,
    topics: ['数学归纳法', '证明', '规律'], alias: ['归纳', '一级一级', '证明', '规律'],
    hook,
    shelf: ['induction', 'meter'],
    build: () => add('induction', { rule, upto: 20, base: false }, 'i'),
    predict: null,
    milestones: [
      { id: 'proved', say: '第一级成立，每一级都能推到下一级（证据 ④）', score: 8, when: { role: 'i', port: 'lv', op: '>=', value: '4' },
        hints: ['证明要两件事：起点成立，每一级能推到下一级。现在缺哪一件？', '“第一级成立（已验证）”还没有勾。', '先验证 ' + first + '，再勾上“第一级成立”。'] },
    ],
    traps: [], goal: ['proved'],
    why,
    ref: ['induction|' + rule],
  });
  induct('pf-induct-odd', 0, '1 + 3 + … + (2n − 1) 等于 n²：证明它', '1 = 1²，1 + 3 = 2²，1 + 3 + 5 = 3²……归纳阶梯会检查“每一级能不能推到下一级”：S(n+1) − S(n) 是不是下一个奇数 2n + 1。起点还没验证。', 7, '6.7b',
    '起点：n = 1 时 1 = 1²。推下一级：n² + (2n + 1) = (n + 1)²——每次多加一个拐角形的奇数个小方块，正方形边长加 1。这样每一级都推到下一级，对所有 n 成立。', 'n = 1 时 1 = 1²');
  induct('pf-induct-gauss', 1, '1 + 2 + … + n 等于 n(n+1)/2：证明它', '高斯算 1 加到 100。归纳阶梯检查：n(n+1)/2 加上下一项 n + 1，是不是 (n+1)(n+2)/2。起点还没验证。', 7, '7.4',
    '起点：n = 1 时 1 = 1 × 2 ÷ 2。推下一级：n(n+1)/2 + (n+1) = (n+1)(n+2)/2。每一级都能推到下一级，所以对所有 n 成立。', 'n = 1 时 1 = 1 × 2 ÷ 2');
  induct('pf-induct-pow2', 3, '1 + 2 + 4 + … + 2^(n−1) 等于 2ⁿ − 1：证明它', '1，1 + 2 = 3，1 + 2 + 4 = 7，1 + 2 + 4 + 8 = 15，总比 2 的幂少 1。归纳阶梯检查每一级能不能推到下一级。起点还没验证。', 7, '7.4',
    '起点：n = 1 时 1 = 2¹ − 1。推下一级：(2ⁿ − 1) + 2ⁿ = 2ⁿ⁺¹ − 1。每一级都能推到下一级，所以对所有 n 成立。', 'n = 1 时 1 = 2¹ − 1');

  // ---- 证明脚手架：每一步的依据必须是台面上成立的事实（这里是归纳阶梯算出的“步骤是恒等式”）----
  P.push({
    id: 'pf-scaffold-odd', essence: ['E9', 'E4'], title: '写出证明：前 n 个奇数的和是 n²', grade: 7, domain: '关系', points: ['6.7b'], level: 'stretch', rung: 6, evidence: 4,
    topics: ['证明', '恒等式', '归纳'], alias: ['证明', '脚手架', '推理', '依据'],
    hook: '台面上的归纳阶梯已经算出：S(n+1) − S(n) 恰好等于下一个奇数，这个步骤是恒等式。证明脚手架有三步，每一步都要说出依据——依据只能是台面上已经成立的事实。把每一步的依据选上。',
    shelf: ['induction', 'scaffold', 'proofcheck'],
    build: () => {
      const s = W.blank();
      const i = W.add(s, 'induction', 40, 40, { rule: 0, upto: 20, base: true }); s.entities[i].role = 'i';
      const f = W.add(s, 'scaffold', 300, 40, { s1: '起点：n = 1 时，1 = 1²', s2: '推下一级：n² + (2n + 1) = (n + 1)²，每一级加下一个奇数刚好到下一个平方数', s3: '所以对所有 n，前 n 个奇数的和都是 n²', r1: '', r2: '', r3: '' }); s.entities[f].role = 's';
      return s;
    },
    predict: null,
    milestones: [
      { id: 'two', say: '至少有两步写上了成立的依据', score: 3, when: { role: 's', port: 'filled', op: '>=', value: '2' },
        hints: ['每一步右边都有一个“依据”下拉框。', '依据要选台面上已经成立的事实，带 ✓ 的那些。', '在“归纳阶梯：步骤是恒等式”前面带 ✓，选它。'] },
      { id: 'proved', say: '三步的依据都成立，证明完成（证据 ④）', score: 6, when: { role: 's', port: 'lv', op: '>=', value: '4' },
        hints: ['三步都要有依据，缺一步就不算证明。', '第三步“所以对所有 n”的依据也要选。', '三个依据都选“归纳阶梯：步骤是恒等式”。'] },
    ],
    traps: [], goal: ['proved'],
    why: '证明有三步：起点成立；每一级加下一个奇数，n² + (2n+1) = (n+1)²，恰好推到下一级；所以所有 n 都成立。归纳阶梯算出了“步骤是恒等式”，它是第二步的依据。例子只能给证据，这样的推理才是证明。',
    ref: ['induction|0', 'scaffold|0'],
  });

  // ---- 猜想板：每道“找规律”题的收尾——把发现写成“如果……那么……”----
  P.push({
    id: 'pf-board-pattern', essence: ['E9', 'E1'], title: '把你发现的规律写成“如果……那么……”', grade: 3, domain: '关系', points: ['1.16'], level: 'core', rung: 2, evidence: 1,
    topics: ['找规律', '猜想', '表达'], alias: ['猜想板', '找规律', '如果那么', '记下来'],
    hook: '1，3，5，7……每个数都比前一个多 2。把发现写在猜想板上，写成“如果……那么……”，检查过几个例子以后勾上“我已经验证过例子”。猜想板只做记录：它只是“到目前为止都对”，还不是证明。',
    shelf: ['conjecture_board'],
    build: () => add('conjecture_board', { text: '', ok: false, who: '我' }, 'b'),
    predict: null,
    milestones: [
      { id: 'write', say: '写出一条“如果……那么……”的猜想，并勾上已验证例子', score: 4,
        when: (w) => w.some('conjecture_board', (e) => /如果.+那么.+/.test(String(e.props.text || '')) && e.props.ok === true),
        why_code: '要检查学生写的文字里有没有“如果……那么……”的形状，数据形式的 when 只能比较数值',
        hints: ['猜想要写成“如果……那么……”。', '在猜想板的“猜想”里写，比如“如果前一个数是 5，那么后一个数是 7”。', '写好以后勾上“我已经验证过例子”。'] },
    ],
    traps: [], goal: ['write'],
    why: '“如果……那么……”让发现有了条件和结论，别人才能检验它、反驳它。猜想板只记录，证据等级是 ①（举例）；要更高的等级，要用扫描器、枚举器或证明。',
    ref: ['conjecture_board|0'],
  });

  U.problems.push(...P);
})(typeof globalThis !== 'undefined' ? globalThis : window);
