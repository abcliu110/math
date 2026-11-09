/* node tools/essence-map.js —— 按本质统计：哪个本质有多少器材、多少题，缺什么一眼看出。 */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const pk = (d) => fs.readdirSync(path.join(root, d)).filter((f) => f.endsWith('.js')).sort().map((f) => d + '/' + f);
const files = ['js/core/rational.js', 'js/core/essences.js', 'js/core/kinds.js', 'js/core/registry.js', 'js/core/world.js', 'js/core/kit.js', 'js/core/judge.js', 'js/core/events.js', 'js/core/review.js', 'js/core/author.js'].concat(pk('packs')).concat(['problems/starter.js'], pk('problems').filter((f) => !/starter/.test(f)));
const ctx = vm.createContext({ console }); ctx.globalThis = ctx;
for (const f of files) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
const U = ctx.U;
const devs = Object.entries(U.types), probs = U.problems;
console.log('本质'.padEnd(16) + '主器材  含器材  主题  含题   （主＝第一个本质）');
for (const id of U.ESSENCE_IDS) {
  const e = U.ESSENCES[id];
  const dMain = devs.filter(([, d]) => d.essence[0] === id).length, dAll = devs.filter(([, d]) => d.essence.includes(id)).length;
  const pMain = probs.filter((p) => p.essence[0] === id).length, pAll = probs.filter((p) => p.essence.includes(id)).length;
  const flag = pMain < 3 || dMain < 2 ? '  ← 薄弱' : '';
  console.log((id + ' ' + e.name).padEnd(18) + String(dMain).padStart(4) + String(dAll).padStart(8) + String(pMain).padStart(7) + String(pAll).padStart(6) + flag);
}
