/* node tools/lint-ui.js —— 界面代码的意图层检查（U3）、界面状态分层检查（U4）和布局数字检查（U5）。
 * U3 规则：js/ui/stage.js、panels.js、app.js 里不许直接写修改类动作（{ t: 'put' … }），也不许直接调用事务/动作入口
 * （act、actMany、build、preview、tx）。用户手势一律走 UI.Intent.run(kind, payload)，动作只在 js/ui/intent.js 里出现。
 * 例外：app.js 的事务层（“改动入口”一节）是动作入口本身，不检查其中的 act/tx 调用。
 * U4 规则：界面代码里出现的 S.xxx（即 UI.S 的字段）都要登记在 js/ui/state.js 的 UI.STATE_SPEC.fields，并且类别合法。
 * U5 规则：界面代码（stage.js、panels.js、app.js）里不写死布局数字。布局行 = 含布局语境的行：inline style 的 width/height/top/left/
 *   right/bottom（含 min-/max-），或 getBoundingClientRect / offsetWidth / innerWidth / clientX 等 DOM 尺寸，或 .x/.y/.w/.h/.width/.height/.left/.top 等几何属性。
 *   布局行里 3 及以上的数字（包括 12px 这种）是违规，要改用 UI.LAYOUT（js/ui/layout.js）或实测值。0、1、2 不算。
 *   例外写在 LAYOUT_ALLOW：文件 + 原文子串，并写明原因。
 * 输出每一处违规和总数；有违规就退出码 1。 */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
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

// U5：布局语境、布局数字（见文件头）
const LAYOUT_CTX = /\b(?:width|height|top|left|right|bottom|min-width|min-height|max-width|max-height)\s*:|getBoundingClientRect|offset(?:Width|Height|Top|Left)|client(?:Width|Height|X|Y)|innerWidth|innerHeight|\.(?:x|y|w|h|width|height|left|top|right|bottom|x0|x1|y0|y1)\b/;
// SVG 绘图指令（<line、<circle…）里的数字是图形本身（点的半径、线宽、字的偏移），不是布局，不查
const SVG_DRAW = /<(?:line|circle|path|text|rect|polyline|polygon|svg|use|g)[\s>]/;
const NUM = /(?<![\w.])(\d+)(?![\w.%])|(?<![\w.])(\d+)(?=px)/g;   // 整数才查（小数多是文字或比例）；带 % 的是百分比，不查
// 允许的例外：[文件, 原文子串, 原因]。子串命中的那一行不查布局数字。
const LAYOUT_ALLOW = [
  ['js/ui/stage.js', '(d.corner + 2) % 4', '矩形有四个角，% 4 是角的编号，不是布局'],
];

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

// U5：布局数字
const layoutBad = [];
for (const rel of FILES) {
  const lines = fs.readFileSync(path.join(root, rel), 'utf8').split(/\r?\n/);
  lines.forEach((line, i) => {
    const t = line.trim();
    if (!t || t.startsWith('//') || t.startsWith('*') || t.startsWith('/*')) return;
    if (!LAYOUT_CTX.test(line)) return;
    if (SVG_DRAW.test(line)) return;
    if (LAYOUT_ALLOW.some(([f, sub]) => f === rel && line.includes(sub))) return;
    let m; NUM.lastIndex = 0;
    while ((m = NUM.exec(line))) {
      const v = Number(m[1] || m[2]);
      if (v === 100 && /\*\s*100\b/.test(line)) continue;   // 百分比换算（乘 100），不是布局
      if (v >= 3) { layoutBad.push(rel + ':' + (i + 1) + '  写死的布局数字 ' + (m[1] || m[2]) + (m[2] ? 'px' : '') + '  ←  ' + t.slice(0, 120)); break; }
    }
  });
}

// U4：读 js/ui/state.js 里的 UI.STATE_SPEC（在一个独立的沙箱里执行，不需要浏览器）
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, 'js/ui/state.js'), 'utf8'), sandbox);
const SPEC = sandbox.UI.STATE_SPEC;
const STATE_FILES = ['js/ui/stage.js', 'js/ui/panels.js', 'js/ui/app.js', 'js/ui/intent.js'];
const FIELD = /(?:^|[^\w$])S\.([A-Za-z_]\w*)/g;   // S 是 UI.S 的别名，UI.S.xxx 也匹配
const unreg = [];
for (const rel of STATE_FILES) {
  const lines = fs.readFileSync(path.join(root, rel), 'utf8').split(/\r?\n/);
  lines.forEach((line, i) => {
    const t = line.trim();
    if (!t || t.startsWith('//') || t.startsWith('*') || t.startsWith('/*')) return;
    let m; FIELD.lastIndex = 0;
    while ((m = FIELD.exec(line))) {
      const cls = Object.prototype.hasOwnProperty.call(SPEC.fields, m[1]) ? SPEC.fields[m[1]] : null;
      if (!cls) unreg.push(rel + ':' + (i + 1) + '  未登记的界面状态字段 S.' + m[1] + '  ←  ' + t.slice(0, 120));
      else if (!Object.prototype.hasOwnProperty.call(SPEC.classes, cls)) unreg.push(rel + ':' + (i + 1) + '  S.' + m[1] + ' 的类别 ' + cls + ' 不合法');
    }
  });
}

const total = Object.values(counts).reduce((a, b) => a + b, 0);
problems.forEach((p) => console.log('  ' + p));
unreg.forEach((p) => console.log('  ' + p));
layoutBad.forEach((p) => console.log('  ' + p));
console.log('lint-ui：界面代码里直接写动作的地方 ' + total + ' 处（' + FILES.map((f) => path.basename(f) + ' ' + counts[f]).join('，') + '），未登记的界面状态字段 ' + unreg.length + ' 处，写死的布局数字 ' + layoutBad.length + ' 处' + ((total + unreg.length + layoutBad.length) ? '，不合格' : '，通过'));
process.exit(total + unreg.length + layoutBad.length ? 1 : 0);
