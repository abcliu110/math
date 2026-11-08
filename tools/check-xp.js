// 实验（XP）静态检查，对应 docs/research/nb-bench-20261108/10-unification-sop.md 第 7 节。
// 用法：node tools/check-xp.js            全部检查；有实验不过则退出码 1
//       node tools/check-xp.js --quiet    只打印汇总
// 只读 apps/web/lab-nb.html 的源码，按 `{id:'...'` 切出每个实验的文字块再逐条检查。
// 规则：
//   1. 至少 3 步
//   2. 有预测步（步骤标题或提示里有“预测”）
//   3. why 讲推理（含因为/所以/就是/先/再/用，或有 + − × ÷ = 之一），不只给答案
//   4. 不匹配信号文字（没有 .tx=== / .tx.includes / .tx.startsWith）
//   5. 不按插入顺序取器材（没有 filter(...)[N]）
//   6. 每步有 id，格式 xpId:sN

const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'apps', 'web', 'lab-nb.html');
const src = fs.readFileSync(file, 'utf8');
const quiet = process.argv.includes('--quiet');

const starts = [];
// 实验定义都有 grade 字段；输出口定义（如 {id:'tot',label:...}）没有，不算实验。
const re = /\{id:'([a-z0-9_]+)',grade:/g;
let m;
while ((m = re.exec(src))) starts.push({ id: m[1], at: m.index });

const results = [];
const skipped = [];
starts.forEach((s, i) => {
  const end = i + 1 < starts.length ? starts[i + 1].at : src.length;
  const block = src.slice(s.at, end);
  // 只检查内联了 steps 数组的实验；步骤由函数生成的（如 wt06）单独计数，不判不过。
  if (!/\bsteps:\s*\[/.test(block)) { skipped.push(s.id); return; }
  const stepsPart = block.slice(block.search(/\bsteps:\s*\[/));
  const labels = (stepsPart.match(/label:'[^']*'/g) || []);
  const hints = (stepsPart.match(/hint:'[^']*'/g) || []);
  const stepIds = (stepsPart.match(/id:'[a-z0-9_]+:s\d+'/g) || []);
  const why = (block.match(/why:'([^']*)'/) || [])[1] || '';
  const problems = [];

  if (labels.length < 3) problems.push(`只有 ${labels.length} 步（要求至少 3 步）`);
  if (!labels.concat(hints).some((t) => /预测|predict/.test(t))) problems.push('没有预测步');
  if (!/因为|所以|因此|就是|先|再|用|[+\-−×÷=]/.test(why)) problems.push('why 只给答案，没讲推理');
  if (/\.tx(===|\.includes|\.startsWith)/.test(block)) problems.push('用信号文字判分（.tx===/.tx.includes）');
  if (/filter\([^)]*\)\[\d\]/.test(block)) problems.push('按插入顺序取器材（filter(...)[N]）');
  if (stepIds.length < labels.length) problems.push(`步骤没有 id（${stepIds.length}/${labels.length}，要求 xpId:sN）`);

  results.push({ id: s.id, problems });
});

const failed = results.filter((r) => r.problems.length);
if (!quiet) {
  failed.forEach((r) => console.log(`FAIL ${r.id}: ${r.problems.join('；')}`));
}
console.log(`检查 ${results.length} 个实验：通过 ${results.length - failed.length}，不过 ${failed.length}；未内联步骤（跳过）${skipped.length}`);
process.exit(failed.length ? 1 : 0);
