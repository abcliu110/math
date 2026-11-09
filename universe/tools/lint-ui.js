/* node tools/lint-ui.js —— 界面代码的意图层检查（U3）。
 * 规则：js/ui/stage.js、panels.js、app.js 里不许直接写修改类动作（{ t: 'put' … }），也不许直接调用事务/动作入口
 * （act、actMany、build、preview、tx）。用户手势一律走 UI.Intent.run(kind, payload)，动作只在 js/ui/intent.js 里出现。
 * 例外：app.js 的事务层（“改动入口”一节）是动作入口本身，不检查其中的 act/tx 调用。
 * 输出每一处违规和总数；有违规就退出码 1。 */
'use strict';
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const FILES = ['js/ui/stage.js', 'js/ui/panels.js', 'js/ui/app.js'];   // intent.js 本身不在检查范围内
// 修改类动作：和 js/core/world.js 的 act 分支一致
const MUTATING = ['add', 'clear', 'clock', 'copy', 'del', 'link', 'move', 'piece', 'put', 'rename', 'reset', 'resetstate', 'resize', 'set', 'take', 'tidy', 'tool', 'unlink', 'wsdrop'];
// 直接调用的事务/动作入口：裸调用 act(…)，或 UI.App.act(…)；W.act、UI.Intent.* 不算
const CALL = /(?:^|[^\w.$])(act|actMany|build|preview|tx)\s*\(|UI\.App\.(act|actMany|build|preview|tx)\s*\(/;
const LIT = /(?:^|[^\w$])t\s*:\s*(['"])(\w+)\1/g;

// 事务层本身（app.js 里“改动入口”一节：tx 和它的老接口 act/actMany/build 薄封装）不算违规：
// 它是动作入口的定义，不是用户手势。界面测试还直接调用 UI.App.act，所以老接口保留。
const LAYER = { file: 'js/ui/app.js', from: '// ---------- 改动入口', to: '// ---------- 开题 / 切模式' };

const counts = {}, problems = [];
for (const rel of FILES) {
  counts[rel] = 0;
  const lines = fs.readFileSync(path.join(root, rel), 'utf8').split(/\r?\n/);
  let inLayer = false;
  lines.forEach((line, i) => {
    const t = line.trim();
    if (rel === LAYER.file && line.includes(LAYER.from)) inLayer = true;
    if (rel === LAYER.file && line.includes(LAYER.to)) inLayer = false;
    if (!t || t.startsWith('//') || t.startsWith('*') || t.startsWith('/*')) return;   // 注释不算
    const hits = [];
    let m; LIT.lastIndex = 0;
    while ((m = LIT.exec(line))) if (MUTATING.includes(m[2])) hits.push("{ t: '" + m[2] + "' }");
    if (!inLayer && CALL.test(line) && !/function\s+(act|actMany|build|preview|tx)\s*\(/.test(line)) hits.push('直接调用动作入口');
    for (const h of hits) { counts[rel]++; problems.push(rel + ':' + (i + 1) + '  ' + h + '  ←  ' + t.slice(0, 120)); }
  });
}
const total = Object.values(counts).reduce((a, b) => a + b, 0);
problems.forEach((p) => console.log('  ' + p));
console.log('lint-ui：界面代码里直接写动作的地方 ' + total + ' 处（' + FILES.map((f) => path.basename(f) + ' ' + counts[f]).join('，') + '）' + (total ? '，不合格' : '，通过'));
process.exit(total ? 1 : 0);
