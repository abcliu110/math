/* node tools/extract-curriculum.js —— 从 ../content/grades/grade-1..9.js 抽取全部知识点，写入 js/core/curriculum.js。
 * 每个知识点：{ title, subtitle, grade, unit, essences, essenceSource }。
 * essences 先按标题关键词给出草稿（essenceSource: 'draft'），人工核对后改成 'reviewed'，并写进 OVERRIDES。 */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..', '..');           // 仓库根（含 content/）
const outFile = path.join(__dirname, '..', 'js', 'core', 'curriculum.js');

// 人工核对过的结果写在这里，优先于关键词草稿：{ '4.6': ['E2', 'E4'] }
const OVERRIDES = {};

// 关键词 → 本质（草稿规则，按顺序匹配，取前两个命中的本质）
const RULES = [
  [/方程|等式|解/, ['E4', 'E8']],
  [/字母|代数|式|整式|恒等|乘法公式/, ['E8']],
  [/面积|周长|体积|剪|拼|平行四边形|梯形|三角形|圆|图形|对称|旋转|平移|角/, ['E5', 'E3']],
  [/分数|小数|百分|比|单位|近似|四舍五入|π|量|长度|重量|时间|钱/, ['E3']],
  [/概率|频率|统计|平均|抽样|可能/, ['E7']],
  [/规律|周期|数列|循环|等差|等比|周期/, ['E6']],
  [/对应|数数|计数|一一|数的认识|认识/, ['E1']],
  [/乘|除|因数|倍数|质数|合数|约分|通分|分解/, ['E2']],
];
const pick = (text) => {
  const hits = [];
  for (const [re, es] of RULES) if (re.test(text)) for (const e of es) if (!hits.includes(e)) hits.push(e);
  return hits.length ? hits.slice(0, 2) : ['E2'];
};

const table = {};
for (let g = 1; g <= 9; g++) {
  const src = fs.readFileSync(path.join(root, 'content', 'grades', 'grade-' + g + '.js'), 'utf8');
  const ctx = {}; vm.createContext(ctx);
  vm.runInContext(src + '\n;globalThis.__G = GRADE' + g + '_CONTENT;', ctx, { filename: 'grade-' + g + '.js' });
  for (const u of ctx.__G.units) for (const p of u.points) {
    if (table[p.id]) throw new Error('知识点 id 重复：' + p.id);
    const text = p.title + ' ' + (p.subtitle || '');
    table[p.id] = {
      title: p.title, subtitle: p.subtitle || '', grade: g, unit: u.unit,
      essences: OVERRIDES[p.id] || pick(text),
      essenceSource: OVERRIDES[p.id] ? 'reviewed' : 'draft',
    };
  }
}
const ids = Object.keys(table);
const body = '/* 知识点表（设计 v2 §5.2）。由 tools/extract-curriculum.js 生成，请勿手改；要改本质请写进脚本的 OVERRIDES。\n' +
  ' * 共 ' + ids.length + ' 个知识点。essenceSource: draft = 关键词草稿，reviewed = 人工核对。 */\n' +
  "(function (G) {\n  'use strict';\n  G.U.CURRICULUM = " + JSON.stringify(table, null, 1) + ';\n})(typeof globalThis !== \'undefined\' ? globalThis : window);\n';
fs.writeFileSync(outFile, body, 'utf8');
console.log('写入 ' + path.relative(path.join(__dirname, '..'), outFile) + '：' + ids.length + ' 个知识点');
