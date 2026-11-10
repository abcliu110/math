/* node tools/gen-manifest.js —— 从 packs/ 目录生成器材包的两处清单（任务 J 遗留，next-steps.md §10.7）：
 *   1. index.html 里 <!-- packs:begin --> 与 <!-- packs:end --> 之间的 <script src="packs/…"> 行；
 *   2. js/core/loader.js 里 // packs:begin 与 // packs:end 之间的 U.PACK_FILES（包 id → 脚本路径）。
 * 包 id 就是文件名（去掉 .js）。新增一个包：把文件放进 packs/，然后运行 node tools/gen-manifest.js 写回两处。
 * 用法：
 *   node tools/gen-manifest.js          写回文件（文件有改动才写）
 *   node tools/gen-manifest.js --check  只检查，不一致就退出非零（tests/run.js 里也会检查，verify 里跟着失败）
 * 生成结果按文件原来的换行符（CRLF 或 LF）写，所以检查时不会因为换行不同而误报。 */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const HTML_BEGIN = '<!-- packs:begin -->', HTML_END = '<!-- packs:end -->';
const JS_BEGIN = '// packs:begin', JS_END = '// packs:end';

// 包声明的依赖：registerPack({ id, needs: ['geo', 'core@1'] }) 里的 needs（只看 registerPack 的头部，到 types 为止）
function needsOf(text) {
  const i = text.indexOf('registerPack('), j = text.indexOf('types:', i);
  const head = text.slice(i, j > i ? j : undefined);
  const m = /needs:\s*\[([^\]]*)\]/.exec(head);
  return m ? [...m[1].matchAll(/'([A-Za-z0-9_-]+)(?:@\d+)?'/g)].map((x) => x[1]) : [];
}
// 包的依赖关系：{ 包 id: [依赖的包 id…] }，包 id 就是文件名
function depsOf(root) {
  const deps = {};
  for (const f of fs.readdirSync(path.join(root, 'packs')).filter((x) => x.endsWith('.js')).sort()) {
    deps[f.slice(0, -3)] = needsOf(fs.readFileSync(path.join(root, 'packs', f), 'utf8'));
  }
  return deps;
}
// 包的加载顺序：依赖排在前面（同一层里按文件名排序）。依赖有环时报错。
// 注意：packs 的 needs 是在注册时检查的（U.packErrors），加载顺序错了会记下“还没加载”，所以不能只按文件名排。
function packIds(root) {
  const deps = depsOf(root), out = [], done = new Set();
  const visit = (id, stack) => {
    if (done.has(id)) return;
    if (stack.includes(id)) throw new Error('包的依赖有环：' + stack.concat(id).join(' → '));
    for (const d of deps[id] || []) if (deps[d]) visit(d, stack.concat(id));
    done.add(id); out.push(id);
  };
  for (const id of Object.keys(deps).sort()) visit(id, []);
  return out;
}
const eolOf = (text) => (text.includes('\r\n') ? '\r\n' : '\n');

function htmlBody(ids, eol) { return ids.map((id) => '<script src="packs/' + id + '.js"></script>').join(eol); }
function jsBody(ids, eol) {
  const lines = ['  // 由 tools/gen-manifest.js 生成：packs/ 目录里的每个文件一行。不要手改；增删 packs/ 里的文件后运行 node tools/gen-manifest.js'];
  lines.push('  U.PACK_FILES = {');
  for (const id of ids) lines.push("    '" + id + "': 'packs/" + id + ".js',");
  lines.push('  };');
  return lines.join(eol);
}

// 替换两个标记之间的内容（标记本身保留；结束标记的缩进也保留）。找不到标记就抛错。
function replaceBlock(text, begin, end, body) {
  const bi = text.indexOf(begin), ei = text.indexOf(end);
  if (bi < 0 || ei < 0 || ei < bi) throw new Error('缺少标记 ' + begin + ' / ' + end);
  const eol = eolOf(text);
  const lineStart = text.lastIndexOf('\n', ei) + 1;
  const indent = /^[ \t]*$/.test(text.slice(lineStart, ei)) ? text.slice(lineStart, ei) : '';
  return text.slice(0, bi + begin.length) + eol + body + eol + indent + text.slice(ei);
}

// 生成两处清单。cur 可以传入替代的文本（测试用）：{html, loader}
function render(root, cur) {
  const c = cur || {};
  const html = c.html !== undefined ? c.html : fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const loader = c.loader !== undefined ? c.loader : fs.readFileSync(path.join(root, 'js/core/loader.js'), 'utf8');
  const ids = packIds(root);
  const packFiles = {};
  for (const id of ids) packFiles[id] = 'packs/' + id + '.js';
  return {
    ids, packFiles,
    html: replaceBlock(html, HTML_BEGIN, HTML_END, htmlBody(ids, eolOf(html))),
    loader: replaceBlock(loader, JS_BEGIN, JS_END, jsBody(ids, eolOf(loader))),
  };
}

// 检查：返回错误文字的数组，空数组 = 一致。先指出具体哪个包缺了、多了，再看文本是否逐字一样。
function check(root, cur) {
  const errs = [];
  let r;
  try { r = render(root, cur); } catch (e) { return [e.message]; }
  const c = cur || {};
  const html = c.html !== undefined ? c.html : fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const loader = c.loader !== undefined ? c.loader : fs.readFileSync(path.join(root, 'js/core/loader.js'), 'utf8');
  const want = new Set(r.ids);
  const inHtml = [...html.matchAll(/<script src="packs\/([^"/]+)\.js"><\/script>/g)].map((m) => m[1]);
  for (const id of r.ids) if (!inHtml.includes(id)) errs.push('index.html 缺少 packs/' + id + '.js（运行 node tools/gen-manifest.js 生成）');
  for (const id of inHtml) if (!want.has(id)) errs.push('index.html 加载了 packs/' + id + '.js，但 packs/ 里没有这个文件');
  const inLoader = [...loader.matchAll(/'([A-Za-z0-9_-]+)': '(packs\/[^']+)'/g)].map((m) => [m[1], m[2]]);
  for (const id of r.ids) if (!inLoader.some(([k]) => k === id)) errs.push('js/core/loader.js 的 PACK_FILES 缺少包 ' + id + '（packs/' + id + '.js）');
  for (const [k, f] of inLoader) if (!want.has(k) || f !== 'packs/' + k + '.js') errs.push('js/core/loader.js 的 PACK_FILES 里有 ' + k + '（' + f + '），但 packs/ 里没有这个文件');
  if (!errs.length) {
    if (r.html !== html) errs.push('index.html 的 packs 脚本块和生成结果不一致（顺序或格式不同），运行 node tools/gen-manifest.js 重新生成');
    if (r.loader !== loader) errs.push('js/core/loader.js 的 PACK_FILES 和生成结果不一致（格式不同），运行 node tools/gen-manifest.js 重新生成');
  }
  return errs;
}

module.exports = { packIds, depsOf, needsOf, render, check, replaceBlock };

if (require.main === module) {
  if (process.argv.includes('--check')) {
    const errs = check(ROOT);
    if (errs.length) { errs.forEach((e) => console.log('FAIL ' + e)); console.log('清单不一致：' + errs.length + ' 处'); process.exit(1); }
    console.log('清单一致：' + packIds(ROOT).length + ' 个包，index.html 和 loader.js 与 packs/ 目录一致');
    process.exit(0);
  }
  const r = render(ROOT);
  const files = [['index.html', r.html], ['js/core/loader.js', r.loader]];
  for (const [f, text] of files) {
    const file = path.join(ROOT, f), old = fs.readFileSync(file, 'utf8');
    if (old !== text) { fs.writeFileSync(file, text, 'utf8'); console.log('写入 ' + f + '（' + r.ids.length + ' 个包）'); }
    else console.log(f + ' 已经是最新的');
  }
}
