/* node tools/build-standalone.js —— 把 index.html 里引用的 CSS 和 JS 全部内联，生成一个可以离线双击打开的单文件。
 * 输出：dist/universe-standalone.html（dist/ 不入库，随时可以重新生成）。
 * 内核 + index.html 里列出的器材包 + 题目全部内联；单文件大小会打印出来，方便对照 widget 6 MB 的上限。 */
'use strict';
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const inlineCss = (html) => html.replace(/<link\s+rel="stylesheet"\s+href="([^"]+)"\s*\/?>/g, (m, href) => {
  const body = fs.readFileSync(path.join(root, href), 'utf8');
  return '<style>\n' + body + '\n</style>';
});
const inlineJs = (html) => html.replace(/<script\s+src="([^"]+)"\s*><\/script>/g, (m, file) => {
  const body = fs.readFileSync(path.join(root, file), 'utf8');
  if (/<\/script/i.test(body)) throw new Error(file + ' 里有 </script>，不能内联');
  return '<script>/* ' + file + ' */\n' + body + '\n</script>';
});

const out = inlineJs(inlineCss(src));
const leftover = out.match(/<(script|link)[^>]+(src|href)="[^"]+"/g) || [];
if (leftover.length) throw new Error('还有没内联的外部引用：' + leftover.join(' '));

const dir = path.join(root, 'dist');
fs.mkdirSync(dir, { recursive: true });
const file = path.join(dir, 'universe-standalone.html');
fs.writeFileSync(file, out, 'utf8');
console.log('写入 ' + path.relative(root, file) + '，' + (Buffer.byteLength(out, 'utf8') / 1048576).toFixed(2) + ' MB');
