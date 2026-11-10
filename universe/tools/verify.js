/* node tools/verify.js —— 一条命令跑完全部检查，任一步失败就退出非零（不再往下跑）。
 * 顺序：tests/run.js → tools/check-types.js → tests/ui.js → tests/ui-probes.js（如果存在）→ tests/ui-layout.js → tests/ui-space.js → tests/ui-roles.js → tests/ui-deps.js → tests/ui-workbench.js → tests/ui-expr.js → tests/ui-stepgraph.js → tests/ui-steps.js → tests/ui-arith.js → tests/ui-digit.js → tests/ui-data.js → tests/ui-cross.js → tests/ui-cross2.js → tests/ui-extend.js → tests/ui-select.js → tests/ui-snap.js → tests/ui-shapes.js → tests/ui-export.js → tests/ui-labels.js → tests/ui-space-focus.js → tests/ui-touch-keys.js → tests/ui-feedback.js → tests/ui-readout.js → tests/ui-robust.js → tests/ui-random.js → tests/ui-theme.js → tests/ui-perf.js → tests/ui-s105.js → tools/lint-ui.js → tools/contrast.js → tools/build-standalone.js → dist 文件加载检查。
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
  if (!runScript('tests/ui-expr.js', 'tests/ui-expr.js', pwEnv)) bail();             // D5：式子工作台（真实鼠标：点选、拖过等号移项、点两项合并、两边同除；历史和撤销）
  if (!runScript('tests/ui-stepgraph.js', 'tests/ui-stepgraph.js', pwEnv)) bail();   // D6：看背后的连线（式子 3 步的依赖图、几何剪的依赖图；点节点回到那一步，真实鼠标和键盘）
  if (!runScript('tests/ui-steps.js', 'tests/ui-steps.js', pwEnv)) bail();           // I：工作台的步骤写进台面（真实鼠标：移项、合并、两边同除、因式分解；steps 查询；撤销）
  if (!runScript('tests/ui-arith.js', 'tests/ui-arith.js', pwEnv)) bail();   // H4：算术工作台（竖式，真实鼠标）：加减乘竖式、进位退位、凑十、拆数、撤销；题目 workbench 为 arith
  if (!runScript('tests/ui-digit.js', 'tests/ui-digit.js', pwEnv)) bail();           // D8：数位竖式（真实鼠标：拖数字进列、退位、进位、点选；撤销；判题 digits 查询）
  if (!runScript('tests/ui-data.js', 'tests/ui-data.js', pwEnv)) bail();             // D8：数据图表台（真实鼠标和键盘：录数据、画散点图、拟合直线；删行作废；撤销）
  if (!runScript('tests/ui-cross.js', 'tests/ui-cross.js', pwEnv)) bail();      // D7：跨工作台（几何台面的面积读数接进式子工作台，S = a×h，真实鼠标代入、算出数，得到 S = 24）
  if (!runScript('tests/ui-cross2.js', 'tests/ui-cross2.js', pwEnv)) bail();     // D7 剩余：真实鼠标写示例题（三角形的面积读数接进式子工作台，½ × a × h，代入得到 S = 12；图形改了，式子对照面积写出「对不上」）
  if (!runScript('tests/ui-extend.js', 'tests/ui-extend.js', pwEnv)) bail();   // J：二次扩域坐标（抛物线的顶点、交点在台面上精确显示）、增量求值（改无关器材求值 0 次；300 个对象增量中位数 < 16 毫秒）、文件清单一致
  if (!runScript('tests/ui-select.js', 'tests/ui-select.js', pwEnv)) bail();         // V3：工作区选择（同一位置双击依次选中重叠的图形，单击选最上面的）
  if (!runScript('tests/ui-snap.js', 'tests/ui-snap.js', pwEnv)) bail();             // V4：吸附到构造点（画线吸附到中点，背后建 gmid；拖动端点后跟着动）
  if (!runScript('tests/ui-select2.js', 'tests/ui-select2.js', pwEnv)) bail();       // V3 剩余：选中提示、Alt 点击选第二个、Tab 切换、优先级（线段 > 填充），真实鼠标和键盘
  if (!runScript('tests/ui-snap2.js', 'tests/ui-snap2.js', pwEnv)) bail();           // V4 剩余：拖动吸附到中点、交点、垂足（建构造器材、改接、一步撤销）、吸附开关、Alt 不吸附，真实鼠标
  if (!runScript('tests/ui-shapes.js', 'tests/ui-shapes.js', pwEnv)) bail();         // 常见图形、顶点编辑、直接拖出辅助线（真实鼠标和键盘）；含画布横纵比例回归
  if (!runScript('tests/ui-export.js', 'tests/ui-export.js', pwEnv)) bail();         // 2.12/V10：导出图片（真实鼠标点菜单，台面和专注工作区各一次下载，.png、大小 > 0）
  if (!runScript('tests/ui-labels.js', 'tests/ui-labels.js', pwEnv)) bail();         // V6：标签避让（2.3）、图层分组（2.4）、点的命名与双击改名（2.6），真实鼠标
  if (!runScript('tests/ui-space-focus.js', 'tests/ui-space-focus.js', pwEnv)) bail();   // V2：空间（1024×768 画布 ≥ 60%、抽屉不压画布、浮动条收起展开、专注进入退出、左右栏窄条）
  if (!runScript('tests/ui-touch-keys.js', 'tests/ui-touch-keys.js', pwEnv)) bail();   // V8：触屏（24 像素点击区、双指缩放、长按菜单，CDP 真实触摸）与键盘（Tab、方向键、Delete、Ctrl+Z、Esc）、aria-label
  if (!runScript('tests/ui-feedback.js', 'tests/ui-feedback.js', pwEnv)) bail();     // 2.5/2.13/V7：工具说明与当前工具状态、新手引导（弹一次、关闭后刷新不再弹、菜单可再开）
  if (!runScript('tests/ui-readout.js', 'tests/ui-readout.js', pwEnv)) bail();       // 2.9/2.10/V9：读数（线段长、三角形面积与各边各角）、块的任意整数角度旋转（近似，1° / Shift 15° 吸附）、撤销
  if (!runScript('tests/ui-robust.js', 'tests/ui-robust.js', pwEnv)) bail();        // U8/P6–P8/P11：端口不挡标题栏、十格阵只放筹码、删除工作区不留残留、题目里的重放、复制留在容器里（真实鼠标）
  if (!runScript('tests/ui-random.js', 'tests/ui-random.js', pwEnv)) bail();        // U8：随机手势 200 步（固定种子 20260509），每步不变量成立
  if (!runScript('tests/ui-theme.js', 'tests/ui-theme.js', pwEnv)) bail();          // V10/2.11/2.6b：深浅色令牌（两套对比度）、跟随系统、菜单切换并记住、存储不可用、线型（颜色不同线型不同）
  if (!runScript('tests/ui-perf.js', 'tests/ui-perf.js', pwEnv)) bail();            // V10/2.15：性能（50 个图形，真实鼠标拖动一次，单次处理和到下一帧 < 200 毫秒；实测数字在输出里）
  if (!runScript('tests/ui-s105.js', 'tests/ui-s105.js', pwEnv)) bail();            // §10.5.9 剩余项：复制粘贴（Ctrl+C/V）、镜像复制（M）、多选编组（Ctrl+G）、拖动幽灵对照（真实鼠标和键盘）
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
