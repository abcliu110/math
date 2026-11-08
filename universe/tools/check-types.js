/* node tools/check-types.js —— 列出所有器材的 lint 结果（新增器材时先跑它）。 */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const files = ['js/core/rational.js', 'js/core/kinds.js', 'js/core/registry.js', 'js/core/world.js', 'js/core/kit.js', 'packs/core.js', 'packs/time.js', 'packs/stats.js', 'packs/geometry.js'];
const ctx = vm.createContext({ console }); ctx.globalThis = ctx;
for (const f of files) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
const U = ctx.U; let bad = 0;
for (const id of Object.keys(U.types)) {
  const d = U.types[id], r = U.lintType(d);
  const np = Object.keys(d.props).filter((k) => d.props[k].write).length;
  console.log((r.errors.length ? 'FAIL ' : 'ok   ') + id.padEnd(10) + d.group.padEnd(8) + ' 属性' + np + (d.stateful ? ' 有状态' : ' 无状态') + (r.exempt.length ? '  豁免：' + r.exempt[0] : '') + (r.errors.length ? '\n     ' + r.errors.join('\n     ') : ''));
  if (r.errors.length) bad++;
}
console.log('\n共 ' + Object.keys(U.types).length + ' 种器材，' + bad + ' 种不合格');
process.exit(bad ? 1 : 0);
