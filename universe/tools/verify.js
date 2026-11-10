/* node tools/verify.js —— 一条命令跑完全部检查，任一步失败就退出非零（不再往下跑）。
 * 顺序：tests/run.js → tools/check-types.js → tests/ui.js → tests/ui-probes.js（如果存在）→ tests/ui-layout.js → tests/ui-space.js → tests/ui-roles.js → tests/ui-deps.js → tests/ui-workbench.js → tests/ui-select.js → tests/ui-snap.js → tests/ui-shapes.js → tests/ui-export.js → tests/ui-labels.js → tests/ui-space-focus.js → tests/ui-feedback.js → tests/ui-readout.js → tools/lint-ui.js → tools/contrast.js → tools/build-standalone.js → dist 文件加载检查。
 * 界面测试和 dist 检查需要环境变量 PW_NODE_PATH：playwright 所在的 node_modules 目录。
 * 用法：PW_NODE_PATH=<.../node_modules> node tools/verify.js */
'use strict';
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
const root = path.join(__dirname, '..');
const PW = process.env.PW_NODE_PATH || '';
const SUMMARY = /通过|不合格|写入|FAIL/;

function fmt(name, status, detail) { console.log('[' + status + '] ' + name.padEnd(22) + detail); }

// 运行一个 node 脚本，取它输出里最后一条“汇总”行作为摘要
function runScript(name, script, extraEnv) {
  const r = spawnSync(process.execPath, [path.join(root, script)], {
    cwd: root, env: Object.assign({}, process.env, extraEnv || {}), encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
  });
  const lines = ((r.stdout || '') + '\n' + (r.stderr || '')).split(/\r?\n/).filter((l) => l.trim());
  const summary = [...lines].reverse().find((l) => SUMMARY.test(l)) || lines[lines.length - 1] || '(无输出)';
  if (r.status === 0) { fmt(name, 'ok  ', summary.trim()); return true; }
  fmt(name, 'FAIL', (summary.trim() || '退出码 ' + r.status));
  lines.filter((l) => /FAIL|UNEXPECTED|Error|报错/.test(l)).slice(0, 12).forEach((l) => console.log('        ' + l.trim()));
  return false;
}

// dist 文件用 playwright 打开（file://），不能有控制台错误、页面要能初始化
async function checkDist() {
  const file = path.join(root, 'dist', 'universe-standalone.html');
  if (!fs.existsSync(file)) { fmt('dist 加载检查', 'FAIL', '找不到 ' + path.relative(root, file)); return false; }
  const { chromium } = require(path.join(PW, 'playwright'));
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  try {
    await p.goto('file:///' + file.split(path.sep).join('/'));
    await p.waitForTimeout(800);
    const initialized = await p.evaluate(() => typeof UI !== 'undefined' && !!UI.App && !!UI.S);
    const kb = (fs.statSync(file).size / 1024).toFixed(0);
    if (errs.length || !initialized) {
      fmt('dist 加载检查', 'FAIL', (errs[0] || '页面没有初始化') + (errs.length > 1 ? '（另有 ' + (errs.length - 1) + ' 条）' : ''));
      return false;
    }
    fmt('dist 加载检查', 'ok  ', 'universe-standalone.html（' + kb + ' KB）加载完成，0 报错');
    return true;
  } finally { await b.close(); }
}

(async () => {
  const bail = () => { console.log('\n验证失败，已停止。'); process.exit(1); };

  if (!runScript('tests/run.js', 'tests/run.js')) bail();
  if (!runScript('tools/check-types.js', 'tools/check-types.js')) bail();

  if (!PW) {
    fmt('tests/ui.js', 'FAIL', '缺少环境变量 PW_NODE_PATH（playwright 所在的 node_modules 目录），无法运行界面测试');
    console.log('设置方法示例：PW_NODE_PATH="<路径>/node_modules" node tools/verify.js');
    bail();
  }
  const pwEnv = { NODE_PATH: PW };
  if (!runScript('tests/ui.js', 'tests/ui.js', pwEnv)) bail();
  if (!runScript('tests/ui-layout.js', 'tests/ui-layout.js', pwEnv)) bail();   // U5：布局（两种视口、右下角、台面缩放、避让）
  if (!runScript('tests/ui-space.js', 'tests/ui-space.js', pwEnv)) bail();    // U6：坐标换算（互逆、缩放锚点、50%–250% 拖动落点、工作区真值）
  if (!runScript('tests/ui-roles.js', 'tests/ui-roles.js', pwEnv)) bail();     // U7：声明式角色（假容器、假块、假步骤只靠声明被界面正确处理）
  if (!runScript('tests/ui-deps.js', 'tests/ui-deps.js', pwEnv)) bail();       // V5：删除与依赖（删除被依赖的点要确认、取消不变、一起删除、撤销一次恢复；清空台面先确认）
  if (!runScript('tests/ui-workbench.js', 'tests/ui-workbench.js', pwEnv)) bail();   // D2：题目声明工作台（几何题只列几何工作台的器材；旧题器材架不变；workbench 的 lint）
  if (!runScript('tests/ui-select.js', 'tests/ui-select.js', pwEnv)) bail();         // V3：工作区选择（同一位置双击依次选中重叠的图形，单击选最上面的）
  if (!runScript('tests/ui-snap.js', 'tests/ui-snap.js', pwEnv)) bail();             // V4：吸附到构造点（画线吸附到中点，背后建 gmid；拖动端点后跟着动）
  if (!runScript('tests/ui-shapes.js', 'tests/ui-shapes.js', pwEnv)) bail();         // 常见图形、顶点编辑、直接拖出辅助线（真实鼠标和键盘）；含画布横纵比例回归
  if (!runScript('tests/ui-export.js', 'tests/ui-export.js', pwEnv)) bail();         // 2.12/V10：导出图片（真实鼠标点菜单，台面和专注工作区各一次下载，.png、大小 > 0）
  if (!runScript('tests/ui-labels.js', 'tests/ui-labels.js', pwEnv)) bail();         // V6：标签避让（2.3）、图层分组（2.4）、点的命名与双击改名（2.6），真实鼠标
  if (!runScript('tests/ui-space-focus.js', 'tests/ui-space-focus.js', pwEnv)) bail();   // V2：空间（1024×768 画布 ≥ 60%、抽屉不压画布、浮动条收起展开、专注进入退出、左右栏窄条）
  if (!runScript('tests/ui-feedback.js', 'tests/ui-feedback.js', pwEnv)) bail();     // 2.5/2.13/V7：工具说明与当前工具状态、新手引导（弹一次、关闭后刷新不再弹、菜单可再开）
  if (!runScript('tests/ui-readout.js', 'tests/ui-readout.js', pwEnv)) bail();       // 2.9/2.10/V9：读数（线段长、三角形面积与各边各角）、块的任意整数角度旋转（近似，1° / Shift 15° 吸附）、撤销
  if (!runScript('tools/lint-ui.js', 'tools/lint-ui.js')) bail();              // 界面代码的意图层、状态分层、布局数字、坐标换算、器材判断（U3–U7）
  if (!runScript('tools/contrast.js', 'tools/contrast.js', pwEnv)) bail();          // V1：界面文字对比度 >= 4.5:1（light/dark 两种主题，playwright 实测）
  if (fs.existsSync(path.join(root, 'tests', 'ui-probes.js'))) {
    if (!runScript('tests/ui-probes.js', 'tests/ui-probes.js', pwEnv)) bail();
  }

  if (!runScript('tools/build-standalone.js', 'tools/build-standalone.js')) bail();

  if (!PW) {
    fmt('dist 加载检查', 'skip', '警告：未设置 PW_NODE_PATH，跳过 dist 加载检查');
  } else {
    if (!(await checkDist())) bail();
  }
  console.log('\n全部通过。');
  process.exit(0);
})().catch((e) => { console.log('[FAIL] verify 脚本异常：' + e.message); process.exit(1); });
