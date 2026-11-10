# 数学小宇宙（universe）

一个统一内核、多个专用工作台的数学学习产品。统一的是内核（精确的值、变换规则、来历追踪、判分与存档），不是界面。
以学习为主：每道题进入它所属领域的工作台（几何、式子、数位、数据，以及保留器材卡片和连线的关系画布），直接动手、猜想、对比；学会之后，打开工作台背后的连线，进入创作，搭出没人写过的东西。决策依据见 `docs/direction.md`。
本文件夹自包含（代码、题目、测试、文档），不依赖仓库里的其它目录，不需要构建，双击 `index.html` 即可运行。

```
index.html            入口
css/universe.css
js/core/              内核：有理数、值类型、器材注册表、世界(场景/求值/时钟)、判分、事件流、复习、学生出题
js/ui/                台面、面板、应用
packs/                器材包：core、time、stats、geometry、arith、middle、applied、numtheory、solid、angle、road、conjecture、variable、modclock、curved、eqscale、conserve、cutpaste、model、nth、symmetry、tenframe（共 50 种）
problems/             题库 64 道（starter、more、lowgrade、middle、applied、numbers、solids、angles、travel、essence、algebra、modular、curved、eqscale）
tests/run.js          内核测试（node，202 项，含每题参考解回归）
tests/ui.js           无头浏览器验收（playwright，25 项）
tools/check-types.js  新器材自检
tools/build-standalone.js  生成单文件版 dist/universe-standalone.html
docs/                 设计文档 v2、UI 对照表、内核接口、数学本质与器材计划（essence.md）
```

## 运行与测试
- 打开：双击 `index.html`
- 内核：`node tests/run.js`
- 界面：`node tests/ui.js`（需 playwright；截图写入 `tests/shots/`）
- 新器材自检：`node tools/check-types.js`

## 现状（第一个里程碑）
50 种器材、64 道题、练习/考试/自由三种模式。对照旧 NB 实验室的逐项状态见 `docs/ui-parity.md`，尚未做的内容见其中“没做到的”。
