/* node tools/verify.js —— 一条命令跑完全部检查，任一步失败就退出非零（不再往下跑）。
 * 顺序：tests/run.js → tools/check-types.js → tests/ui.js → tests/ui-probes.js（如果存在）→ tests/ui-layout.js → tests/ui-space.js → tests/ui-roles.js → tests/ui-deps.js → tests/ui-workbench.js → tests/ui-expr.js → tests/ui-stepgraph.js → tests/ui-steps.js → tests/ui-arith.js → tests/ui-digit.js → tests/ui-data.js → tests/ui-cross.js → tests/ui-cross2.js → tests/ui-extend.js → tests/ui-select.js → tests/ui-snap.js → tests/ui-shapes.js → tests/ui-export.js → tests/ui-labels.js → tests/ui-space-focus.js → tests/ui-touch-keys.js → tests/ui-feedback.js → tests/ui-readout.js → tests/ui-robust.js → tests/ui-random.js → tests/ui-theme.js → tests/ui-perf.js → tests/ui-s105.js → tests/ui-arith2.js → tests/ui-align10.js → tests/ui-constraint.js → tests/ui-bake.js → tests/ui-digit2.js → tests/ui-data2.js → tests/ui-snap3.js → tests/ui-visual.js → tests/ui-measure.js → tools/lint-ui.js → tools/contrast.js → tests/ui-young.js → tools/build-standalone.js → dist 文件加载检查。
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
  if (!runScript('tests/ui-render.js', 'tests/ui-render.js', pwEnv)) bail();    // J 遗留：局部渲染（改一个器材只重画它的卡片，计数）、符号点画在几何画板上（2 ± √3 的位置和间距）
  if (!runScript('tests/ui-extend.js', 'tests/ui-extend.js', pwEnv)) bail();   // J：二次扩域坐标（抛物线的顶点、交点在台面上精确显示）、增量求值（改无关器材求值 0 次；300 个对象增量中位数 < 16 毫秒）、文件清单一致
  if (!runScript('tests/ui-select.js', 'tests/ui-select.js', pwEnv)) bail();         // V3：工作区选择（同一位置双击依次选中重叠的图形，单击选最上面的）
  if (!runScript('tests/ui-snap.js', 'tests/ui-snap.js', pwEnv)) bail();             // V4：吸附到构造点（画线吸附到中点，背后建 gmid；拖动端点后跟着动）
  if (!runScript('tests/ui-select2.js', 'tests/ui-select2.js', pwEnv)) bail();       // V3 剩余：选中提示、Alt 点击选第二个、Tab 切换、优先级（线段 > 填充），真实鼠标和键盘
  if (!runScript('tests/ui-snap2.js', 'tests/ui-snap2.js', pwEnv)) bail();           // V4 剩余：拖动吸附到中点、交点、垂足（建构造器材、改接、一步撤销）、吸附开关、Alt 不吸附，真实鼠标
  if (!runScript('tests/ui-balance.js', 'tests/ui-balance.js', pwEnv)) bail();       // 天平与方程：真实鼠标拖砝码、拖盒子、两边一起做
  if (!runScript('tests/ui-numline.js', 'tests/ui-numline.js', pwEnv)) bail();   // 数轴操作台：真实鼠标拖起点、拖落点、拖分数点、拖区间端点
  if (!runScript('tests/ui-ratio.js', 'tests/ui-ratio.js', pwEnv)) bail();   // 分数条与比：真实鼠标拖涂色的边、点 ＋ 切份、拖双数轴上的点
  if (!runScript('tests/ui-coord.js', 'tests/ui-coord.js', pwEnv)) bail();   // 坐标与函数：真实鼠标拖截距、斜率、探针、两点、顶点
  if (!runScript('tests/ui-blocks.js', 'tests/ui-blocks.js', pwEnv)) bail();   // 计数块与数位：真实鼠标拖块、十个捆成一个、一个拆成十个
  if (!runScript('tests/ui-terms.js', 'tests/ui-terms.js', pwEnv)) bail();   // 代数式操作台：真实鼠标把同类项拖到一起、点运算符决定先算哪一步
  if (!runScript('tests/ui-swap.js', 'tests/ui-swap.js', pwEnv)) bail();   // 换一换（鸡兔同笼）：真实鼠标点着换、拖把手一次换好几个
  if (!runScript('tests/ui-system.js', 'tests/ui-system.js', pwEnv)) bail();   // 两架天平（方程组）：真实鼠标把一架拖到另一架上（消元、代入），点翻倍、平分、拿走
  if (!runScript('tests/ui-gap.js', 'tests/ui-gap.js', pwEnv)) bail();   // 间隔与植树：真实鼠标拖间隔、拖路长、点两头的树、围成一圈
  if (!runScript('tests/ui-mean.js', 'tests/ui-mean.js', pwEnv)) bail();   // 平均数：真实鼠标搬方块、加一堆、从托盘加一块
  if (!runScript('tests/ui-tape.js', 'tests/ui-tape.js', pwEnv)) bail();   // 线段图：真实鼠标搭段数、拖一段的长
  if (!runScript('tests/ui-venn.js', 'tests/ui-venn.js', pwEnv)) bail();   // 集合圈：真实鼠标把人拖进圈里、中间、圈外
  if (!runScript('tests/ui-travel.js', 'tests/ui-travel.js', pwEnv)) bail();   // 行程：真实鼠标拖时间条、拖速度箭头
  if (!runScript('tests/ui-mul.js', 'tests/ui-mul.js', pwEnv)) bail();   // 竖式乘法：真实鼠标点格子、点数字键
  if (!runScript('tests/ui-fast.js', 'tests/ui-fast.js', pwEnv)) bail();   // 速算原理：真实鼠标拉长、切开、剪拼
  if (!runScript('tests/ui-stat.js', 'tests/ui-stat.js', pwEnv)) bail();   // 数据与统计图：真实鼠标排队、点开中位数众数平均数、拖柱子
  if (!runScript('tests/ui-chance.js', 'tests/ui-chance.js', pwEnv)) bail();   // 可能性：真实鼠标做很多次、看频率、点理论上、拖转盘
  if (!runScript('tests/ui-clock.js', 'tests/ui-clock.js', pwEnv)) bail();   // 钟面：真实鼠标拖时针、拖分针转圈、计时
  if (!runScript('tests/ui-group.js', 'tests/ui-group.js', pwEnv)) bail();   // 分一分：真实鼠标拖每份几个、一轮一轮放进盒子
  if (!runScript('tests/ui-solid.js', 'tests/ui-solid.js', pwEnv)) bail();   // 积木与三视图：真实鼠标点底板搭积木、打开三个视图
  if (!runScript('tests/ui-conj.js', 'tests/ui-conj.js', pwEnv)) bail();   // 猜想与反例：真实鼠标点公式、一个一个试、一直试、拖到最小的那个
  if (!runScript('tests/ui-fit.js', 'tests/ui-fit.js', pwEnv)) bail();   // 数据找规律：真实鼠标拖直线穿过数据点、拖探针预测
  if (!runScript('tests/ui-pair.js', 'tests/ui-pair.js', pwEnv)) bail();   // 连一连：真实鼠标连线、擦线、加椅子、握手
  if (!runScript('tests/ui-tri.js', 'tests/ui-tri.js', pwEnv)) bail();   // 三角形：真实鼠标拖小棒、拖角
  if (!runScript('tests/ui-circle.js', 'tests/ui-circle.js', pwEnv)) bail();   // 圆：真实鼠标拖半径、圆心角、高、直线、弧的端点
  if (!runScript('tests/ui-grid.js', 'tests/ui-grid.js', pwEnv)) bail();   // 坐标与变换：真实鼠标拖点、旋转、平移、放大、比一比
  if (!runScript('tests/ui-table.js', 'tests/ui-table.js', pwEnv)) bail();   // 复式统计表：真实鼠标圈格子、交答案、两种合计
  if (!runScript('tests/ui-vert.js', 'tests/ui-vert.js', pwEnv)) bail();   // 竖式（加减与除法）：真实鼠标写数、点进位退位、试商
  if (!runScript('tests/ui-dec.js', 'tests/ui-dec.js', pwEnv)) bail();   // 小数：真实鼠标放进来、换一换、拆开拿走、移小数点、百格乘法
  if (!runScript('tests/ui-tiles.js', 'tests/ui-tiles.js', pwEnv)) bail();   // 代数砖：真实鼠标调长宽拼长方形、拼不成、一块一块展开、配方、平方差剪拼
  if (!runScript('tests/ui-chips.js', 'tests/ui-chips.js', pwEnv)) bail();   // 正负数（零对）：真实鼠标放进拿走、放零对消零对、负负得正、翻过来、平均分
  if (!runScript('tests/ui-make.js', 'tests/ui-make.js', pwEnv)) bail();   // 凑十与拆数：真实鼠标挪片凑十、划片破十平十、点缝分与合
  if (!runScript('tests/ui-est.js', 'tests/ui-est.js', pwEnv)) bail();   // 估一估：真实鼠标点近的一端、算一算看误差、拖把手夹范围
  if (!runScript('tests/ui-area2.js', 'tests/ui-area2.js', pwEnv)) bail();   // 面积公式推导：真实鼠标拖高和斜度、剪移拼平行四边形、三角形梯形两个拼一个
  if (!runScript('tests/ui-factor.js', 'tests/ui-factor.js', pwEnv)) bail();   // 因数与倍数：真实鼠标排方块找因数、判质数、试公因数、点公倍数
  if (!runScript('tests/ui-angle.js', 'tests/ui-angle.js', pwEnv)) bail();   // 量角器与角：真实鼠标转量角器对边读数、读内圈、量邻补角对顶角、多边形连对角线
  if (!runScript('tests/ui-ruler.js', 'tests/ui-ruler.js', pwEnv)) bail();   // 尺子：真实鼠标拖铅笔对 0、数格子、拖剪刀剪绳子（米和厘米）
  if (!runScript('tests/ui-money.js', 'tests/ui-money.js', pwEnv)) bail();   // 钱币：真实鼠标点钱付钱、多付了拿回、1 元换 10 角、往上数找零
  if (!runScript('tests/ui-cal.js', 'tests/ui-cal.js', pwEnv)) bail();   // 日历：真实鼠标翻月份看闰年、点两天数经过几天、一周一周跳算星期几
  if (!runScript('tests/ui-seq.js', 'tests/ui-seq.js', pwEnv)) bail();   // 数列与规律：真实鼠标再摆一个、改规律对表、算第 n 个
  if (!runScript('tests/ui-job.js', 'tests/ui-job.js', pwEnv)) bail();   // 工程问题：真实鼠标选谁来做、过一天涂格子、注水放水
  if (!runScript('tests/ui-fold.js', 'tests/ui-fold.js', pwEnv)) bail();   // 折纸与对称：真实鼠标拖折痕挪回中心、转到对角线、找全对称轴、平行四边形没有对称轴
  if (!runScript('tests/ui-logic.js', 'tests/ui-logic.js', pwEnv)) bail();   // 推理台：真实鼠标点格子标 ✗ ✓、自动排除、划线索、发现矛盾
  if (!runScript('tests/ui-proof.js', 'tests/ui-proof.js', pwEnv)) bail();   // 证明台：真实鼠标看起点、看推一级、推倒多米诺，点依据写证明，拼猜想找反例
  if (!runScript('tests/ui-quiz.js', 'tests/ui-quiz.js', pwEnv)) bail();   // 随机出题：步骤栏三档、做完再来一题、实验库随机练习
  if (!runScript('tests/ui-frac2.js', 'tests/ui-frac2.js', pwEnv)) bail();   // 分数运算：真实鼠标切格子通分、合起来、约分、量一量做除法、翻过来找倒数
  if (!runScript('tests/ui-opt.js', 'tests/ui-opt.js', pwEnv)) bail();   // 优化：真实鼠标排沏茶的顺序、看等待、烙饼一锅一锅选
  if (!runScript('tests/ui-weigh.js', 'tests/ui-weigh.js', pwEnv)) bail();   // 找次品：真实鼠标放左右盘、两边要一样多、按最不利回答、分三份最少
  if (!runScript('tests/ui-sort.js', 'tests/ui-sort.js', pwEnv)) bail();   // 分类与整理：真实鼠标点卡片放框、放错说为什么、分完核对总数、换分法
  if (!runScript('tests/ui-combo.js', 'tests/ui-combo.js', pwEnv)) bail();   // 搭配：真实鼠标点格子列搭法、列全再配鞋、数字卡片 0 不在十位
  if (!runScript('tests/ui-dir.js', 'tests/ui-dir.js', pwEnv)) bail();   // 方向与路线：真实鼠标认方向（反过来问）、点箭头走路线、拖射线定方向角
  if (!runScript('tests/ui-methods.js', 'tests/ui-methods.js', pwEnv)) bail();   // 思想方法：按方法闯关、题目上标出用到的思想、下一关按方法链走
  if (!runScript('tests/ui-play.js', 'tests/ui-play.js', pwEnv)) bail();   // 三星挑战、倒推、闯关
  if (!runScript('tests/ui-play2.js', 'tests/ui-play2.js', pwEnv)) bail();   // 第二层新玩法：填缺数字、对对碰、最少张数、筛质数
  if (!runScript('tests/ui-play3.js', 'tests/ui-play3.js', pwEnv)) bail();   // 第二层新玩法第二批：篱笆围地、田忌赛马、分数比大小
  if (!runScript('tests/ui-play4.js', 'tests/ui-play4.js', pwEnv)) bail();   // 找错、可轻可重、推星期、最少跳几下
  if (!runScript('tests/ui-pour.js', 'tests/ui-pour.js', pwEnv)) bail();   // 倒水：真实鼠标装满、倒、倒空，总量守恒，量出 4 升、最少几步
  if (!runScript('tests/ui-ring.js', 'tests/ui-ring.js', pwEnv)) bail();   // 跳格钟：真实鼠标换步长、走一圈、走遍；乘法钟看个位的周期
  if (!runScript('tests/ui-feat.js', 'tests/ui-feat.js', pwEnv)) bail();   // 数的特征：真实鼠标拼数、看个位和数字和、找全；奇偶点子配对
  if (!runScript('tests/ui-surplus.js', 'tests/ui-surplus.js', pwEnv)) bail();   // 盈亏问题：真实鼠标改人数，两种分法对上
  if (!runScript('tests/ui-rel.js', 'tests/ui-rel.js', pwEnv)) bail();   // 关系图：真实鼠标连关系卡（错卡被拦）、分析法标“还缺”、一步一步算
  if (!runScript('tests/ui-state.js', 'tests/ui-state.js', pwEnv)) bail();   // 状态图：真实鼠标过河（死路、最少 7 步）、汉诺塔最少、取石子往回标并赢电脑
  if (!runScript('tests/ui-gauss.js', 'tests/ui-gauss.js', pwEnv)) bail();   // 高斯求和：真实鼠标倒过来写、对齐相加，摆出奇数串
  if (!runScript('tests/ui-grass.js', 'tests/ui-grass.js', pwEnv)) bail();   // 牛吃草：真实鼠标改每天长几份对上两次记录，再求天数；一天一天看
  if (!runScript('tests/ui-pigeon.js', 'tests/ui-pigeon.js', pwEnv)) bail();   // 摸球保证：真实鼠标当最倒霉的人摸到卡住；每种都有要比几种摸法
  if (!runScript('tests/ui-tree.js', 'tests/ui-tree.js', pwEnv)) bail();   // 枚举树：真实鼠标一枝一枝展开；0 打头剪枝、双数划掉、凑钱分类加
  if (!runScript('tests/ui-inv.js', 'tests/ui-inv.js', pwEnv)) bail();   // 不变量放大镜：真实鼠标擦数、换放大镜、找到不变量才能下结论；翻杯子做到 / 做不到
  if (!runScript('tests/ui-ladder.js', 'tests/ui-ladder.js', pwEnv)) bail();   // 不变量阶梯：真实鼠标走第 1、4、7 级，研究本、追问、换情况
  if (!runScript('tests/ui-ladder-enum.js', 'tests/ui-ladder-enum.js', pwEnv)) bail();   // 枚举阶梯：真实鼠标走第 1、4 级，自己列全、换情况、研究本、追问
  if (!runScript('tests/ui-ladder-ext.js', 'tests/ui-ladder-ext.js', pwEnv)) bail();   // 极端阶梯：真实鼠标走第 1、5、7 级，换一袋、换问法、摸完、研究本只记最倒霉的
  if (!runScript('tests/ui-ladder-assume.js', 'tests/ui-ladder-assume.js', pwEnv)) bail();   // 假设阶梯：真实鼠标走第 1、2、5、6 级，换一组、拖一下换对、从头再来、凑不出来、倒扣分
  if (!runScript('tests/ui-gallery.js', 'tests/ui-gallery.js', pwEnv)) bail();   // 解法图鉴：鸡兔同笼一页，七种做法、三座桥，面积图真实拖两刀点亮一格
  if (!runScript('tests/ui-graph.js', 'tests/ui-graph.js', pwEnv)) bail();   // 记下来：换一换台的研究本画成图，先猜再换、凑不出来的 ✕、全部试一遍
  if (!runScript('tests/ui-areamodel.js', 'tests/ui-areamodel.js', pwEnv)) bail();   // 面积模型（样板操作台）和器材把手：真实鼠标拖边、切、改分数
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
  if (!runScript('tests/ui-primeblocks.js', 'tests/ui-primeblocks.js', pwEnv)) bail();     // 质因数积木 + 找错台：积木、两摞对齐、先猜才揭开、先判断、点对错行、理由与改正
  if (!runScript('tests/ui-guessrule.js', 'tests/ui-guessrule.js', pwEnv)) bail();     // 猜规则台 + 总是有时从不：点格子、猜想、互换、写例子
  if (!runScript('tests/ui-teaching.js', 'tests/ui-teaching.js', pwEnv)) bail();     // 教具：线段图、分数面积、代数砖、函数机
  if (!runScript('tests/ui-games.js', 'tests/ui-games.js', pwEnv)) bail();     // 游戏：取石子、汉诺塔、一笔画
  if (!runScript('tests/ui-lab.js', 'tests/ui-lab.js', pwEnv)) bail();     // 改规则的世界 + 逼近器、最优化：球面三角形、出租车几何、换一种运算（真实鼠标）
  if (!runScript('tests/ui-lab2.js', 'tests/ui-lab2.js', pwEnv)) bail();     // 海龟作图、展开图、小方块、尺规作图、两种解法对照（真实鼠标）
  if (!runScript('tests/ui-snap3.js', 'tests/ui-snap3.js', pwEnv)) bail();       // V4 剩余：构造点（重心、圆心、三分之一点，真实鼠标拖动和画线）、块和卡片拖动吸附到中点（真实鼠标）
  if (!runScript('tests/ui-visual.js', 'tests/ui-visual.js', pwEnv)) bail();     // V10：填充纹理（斜线、点阵，属性面板）、点形状（按器材声明）、高对比度开关（菜单，两套主题 >= 4.5）
  if (!runScript('tests/ui-digit2.js', 'tests/ui-digit2.js', pwEnv)) bail();     // D8 遗留：竖式每一列的数字池（0–9，在列的正下方）、真实鼠标拖数字、拖退位和进位到格子上、拖错有提示不写入
  if (!runScript('tests/ui-data2.js', 'tests/ui-data2.js', pwEnv)) bail();       // D8 遗留：数据图表台每个数据格的数字盘（0–9、小数点、负号、⌫、清空），只点不打字，录入、画图、拟合
  if (!runScript('tests/ui-arith2.js', 'tests/ui-arith2.js', pwEnv)) bail();   // H4 遗留（真实鼠标）：凑整（点选、拒绝说明）、两位数乘两位数（部分积、相加、撤销）、减法负数结果（−24）
  if (!runScript('tests/ui-timeline.js', 'tests/ui-timeline.js', pwEnv)) bail();   // §10.5.9 第 7 条（真实鼠标和键盘）：时间条只读预览（不改历史）、松手后回到当前步或停在所选步、动画 ≤ 300 毫秒且菜单可关
  if (!runScript('tests/ui-teacher.js', 'tests/ui-teacher.js', pwEnv)) bail(); // §10.5.9 第 10 条：出题人控制（题目声明器材架和工具白名单；不许改名、不许删题目给的图形；真实鼠标和键盘）
  if (!runScript('tests/ui-measure.js', 'tests/ui-measure.js', pwEnv)) bail();   // §10.5.9 第 6 条：尺子、量角器（真实鼠标拖把手、吸附、精确读数）、标注（加、撤销、存档读回、删除）、不改图形
  if (!runScript('tests/ui-align10.js', 'tests/ui-align10.js', pwEnv)) bail();  // §10.5.9 第 3 条：多选对齐与等距分布工具条（真实鼠标）：八个按钮、每个一步撤销、精确的边缘与中心、等距的整数间距与说明
  if (!runScript('tests/ui-constraint.js', 'tests/ui-constraint.js', pwEnv)) bail();   // §10.5.9 第 1、2 条：约束锁定（真实鼠标锁长、拖动被锁的端点、锁直角、拖动直角顶点）、尺寸驱动（双击长度输入数字，撤销）
  if (!runScript('tests/ui-bake.js', 'tests/ui-bake.js', pwEnv)) bail();       // §10.5.6 第 5 步 定型（真实鼠标）：两步折成一个折叠、折叠里没有撤销、台面和判题仍读得到定型前的步骤、撤销定型回到两步
  if (!runScript('tests/ui-frac.js', 'tests/ui-frac.js', pwEnv)) bail();             // 块的分数吸附（真实鼠标）：顶点落在分数中点上、平移是精确的分数、Alt 不吸附、撤销；v5 旧存档迁移到 v6
  if (!runScript('tests/ui-scale.js', 'tests/ui-scale.js', pwEnv)) bail();     // 几何图形缩放把手（真实鼠标）：三角形放大 2 倍、矩形缩到 1/2、奇数边和超范围时的提示、撤销一步
  if (!runScript('tools/lint-ui.js', 'tools/lint-ui.js')) bail();              // 界面代码的意图层、状态分层、布局数字、坐标换算、器材判断（U3–U7）
  if (!runScript('tools/contrast.js', 'tools/contrast.js', pwEnv)) bail();          // V1：界面文字对比度 >= 4.5:1（light/dark 两种主题，playwright 实测）
  if (!runScript('tests/ui-young.js', 'tests/ui-young.js', pwEnv)) bail();   // §11 低年级模式（真实鼠标）：菜单开关、字号和按钮变大、记住、工作区工具行只留声明的几个、存储不可用
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
