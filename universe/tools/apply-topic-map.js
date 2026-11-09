/* node tools/apply-topic-map.js —— 把题目里的主题词（points: ['频率与概率']）按 tools/topic-map.js 改写：
 *   points 只留能对上的知识点 id；原来的主题词保存在 topics 里，不丢。
 * 只做一次；以后新题直接写知识点 id。 */
'use strict';
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..', 'problems');
const map = require('./topic-map.js');
let files = 0, changed = 0;
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.js'))) {
  const p = path.join(dir, f); const src = fs.readFileSync(p, 'utf8'); files++;
  const out = src.replace(/points: *\[([^\]]*)\]/g, (whole, inner) => {
    const topics = [...inner.matchAll(/'([^']+)'|"([^"]+)"/g)].map((m) => m[1] || m[2]);
    if (!topics.length) return whole;
    const ids = topics.map((t) => map[t]).filter(Boolean);
    const uniq = [...new Set(ids)];
    changed++;
    const q = (s) => "'" + s + "'";
    return 'points: [' + uniq.map(q).join(', ') + '], topics: [' + topics.map(q).join(', ') + ']';
  });
  if (out !== src) fs.writeFileSync(p, out, 'utf8');
}
console.log('扫描 ' + files + ' 个题目文件，改写 ' + changed + ' 处 points');
