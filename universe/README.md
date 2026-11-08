# 数学小宇宙（universe）

一个统一的数学实验室：学生在同一个世界里搭器材、连线、让世界的时钟走起来，猜想—动手—对比。
本文件夹自包含（代码、题目、测试、文档），不依赖仓库里的其它目录，不需要构建，双击 `index.html` 即可运行。

```
index.html            入口
css/universe.css
js/core/              内核：有理数、值类型、器材注册表、世界(场景/求值/时钟)、判分、事件流、复习、学生出题
js/ui/                台面、面板、应用
packs/                器材包：core、time、stats、geometry、arith、middle、applied、numtheory、solid、angle、road、conjecture、variable、modclock、curved、eqscale（共 43 种）
problems/             题库 50 道（starter、more、lowgrade、middle、applied、numbers、solids、angles、travel、essence、algebra、modular、curved、eqscale）
tests/run.js          内核测试（node，118 项，含每题参考解回归）
tests/ui.js           无头浏览器验收（playwright，24 项）
tools/check-types.js  新器材自检
docs/                 设计文档 v2、UI 对照表、内核接口、数学本质与器材计划（essence.md）
```

## 运行与测试
- 打开：双击 `index.html`
- 内核：`node tests/run.js`
- 界面：`node tests/ui.js`（需 playwright；截图写入 `tests/shots/`）
- 新器材自检：`node tools/check-types.js`

## 现状（第一个里程碑）
43 种器材、50 道题、练习/考试/自由三种模式。对照旧 NB 实验室的逐项状态见 `docs/ui-parity.md`，尚未做的内容见其中“没做到的”。
