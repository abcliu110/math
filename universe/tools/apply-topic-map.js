/* node tools/apply-topic-map.js —— 按 tools/topic-map.js 重新计算题目的 points。
 * 题目的 topics（原来的主题词）是唯一来源：points = 映射得到的知识点 id（去重），topics 保留不动。
 * 题目里还没有 topics 的 points（原本就是 id）保持不变。可以反复运行。 */
'use strict';
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..', 'problems');
const map = require('./topic-map.js');
const q = (s) => "'" + s + "'";
let files = 0, changed = 0;
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.js'))) {
  const p = path.join(dir, f); const src = fs.readFileSync(p, 'utf8'); files++;
  const out = src.replace(/points: *\[([^\]]*)\], topics: *\[([^\]]*)\]/g, (whole, _pts, tinner) => {
    const topics = [...tinner.matchAll(/'([^']+)'|"([^"]+)"/g)].map((m) => m[1] || m[2]);
    const ids = [...new Set(topics.map((t) => map[t]).filter(Boolean))];
    changed++;
    return 'points: [' + ids.map(q).join(', ') + '], topics: [' + topics.map(q).join(', ') + ']';
  });
  if (out !== src) fs.writeFileSync(p, out, 'utf8');
}
console.log('扫描 ' + files + ' 个题目文件，重算 ' + changed + ' 处 points');
