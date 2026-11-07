# 数学实验室现状分析（2026-11-07，第 1 阶段前）

改造目标：改成像 NB 实验室（NOBOOK 理化生虚拟实验室）那样。本文只写现状——
世界模型、器材、实验台、评分、记录各是什么水平、缺什么。第 1 阶段改了什么见
`math-world-model-20261106.md` 的 V0.9 一节和第 1 阶段汇报。

读过的材料：`docs/design/math-world-model-20261106.md`（168 行）、
`apps/web/math-world.js`（v0.8.0，959 行）、`apps/web/apparatus.js`（980 行）、
`apps/web/bench-views.js`（58 行）、`app.js` 实验室部分（约 3100–4600 行）、
`index.html` 的 `#lab` 一节（3434–3860 行）、三个 smoke 工具、
NB 第 4/5 轮研究报告、NB 功能研究报告
`~/workspace/research_notes/nb-lab-features-20261107/report.md`。

## 1. 世界模型 MathWorld v0.8.0：强、纯，但每题重置

**水平：已经是纯函数模型（这是 NB 式改造最关键的底子）。**
- `create` / `apply` / `derived` / `goalMet` 四层分工清楚；世界里不放函数
  （流程的 `check` 放在 `LAB_PROCEDURES` 里）；`deepClone` 用 JSON；
  `addPiece` 的 id 是 `Date.now()+random`，跨世界不撞。
- 精确有理数 `Q`：只接受整数，拒绝非整数/分母 0；`apply` 兜底成
  `bad-number`，永远不崩。
- 世界状态：`pieces`（id → {kind, at}）、`tray`（最多 3 个）、`tenframe {A,B}`、
  `balance {L,R}`、`numline {pts, min 0, max 2}`、`fracboard {A=1/2, B=1/3}`、
  `linefn {k:2, b:8}`、`chicken`、`log`（上限 80）、`meta`、`bench`（最多 6 个）、
  `dice {A: []}`、`benchLine`、`benchBalance`、`rect {perim: 20, w: 1}`。
- `derived()` 是唯一算后果的地方：天平两边和/差（精确 Q）、倾斜角
  `clamp(−15..15, −diff×3)`、是否相等；十格阵合计；数轴两点距离；
  分数板“笨加法”（分子加分子/分母加分母）对真和 + 差距；直线 x=0..5 的 y 值；
  鸡兔可行性（头不对/腿太少/腿太多/腿是奇数）+ `solutionRabbits = (L−2H)/2`、
  `legGap`；长方形最大面积（周长能被 4 整除时正方形，否则宽取
  floor(周长/4)）；骰子公平性（和 2–12 各有 6−|s−7| 种，共 36 种，pA 精确分数）。
  还有结构化 `signals`（领域/级别/代码/文字/余量）：天平、分数板笨加错、
  数轴放不下/距离、鸡兔不可行/解出/腿差、直线斜率、长方形最大面积/还能更大、
  骰子公平/不公平、十格阵合计。
- `goalMet`：天平相等、分数真和已知/探索过、数轴拒绝过/有点、直线、鸡兔解出、
  十格阵合计、长方形最大面积、骰子公平。
- 动作（`apply`）：reset、makePiece、trayAdd/trayClear、tenframeMint、place
  （天平盘拒绝负数；数轴放不下返回一个带 `meta.lastNumlineReject=true` 的
  克隆世界 + 原因 `numline-out-of-range`；分数板要先有分数零件）、take、
  balanceClear、balanceAddQty、numlineClear、tenframeSet/Toggle、fracboardSet、
  fracCombine（设 combined；笨和与真和由 derived 对比）、fracMint（把拼出的和
  变成真分数零件进托盘）、procedureStart（练习/考试）、benchPut/Take/Merge
  （真分数加法，合出来的零件替换原零件）/Split（平均拆成 2–6 份）/
  benchLineToggle/benchBalanceToggle、diceToggle（和 2–12，在 A/B 之间换边）、
  rectSet（宽是整数，1 到 周长/2−1）、linefnFromPoints（k=Δy/Δx，b=y1−k·x1；
  拒绝 x1===x2 的竖线）、linefnSet、chickenSeed/chickenSetRabbits。
- 流程（v0.3，NB 式）：`LAB_PROCEDURES` 5 个流程——q-fracadd（拼 1 + 铸币 2 +
  对比 1 = 4 分）、q-balfrac（加右边 1 + 相等 2 = 3 分）、q-numline（拒绝 1 +
  放点 1 + 距离 2 = 4 分）、q-funcline（变负 1 + 目标 2 = 3 分）、q-chicken
  （试 1 + 解出 2 = 3 分）。每步有 id、标签、分数、`via`（允许的动作类型）、
  `after`（前置步骤）、`check(world)`。`track()` 只有在“现在状态对 + 刚做的
  动作在允许类型里 + 前置已得分”时才给分——只摆好初始状态不得分；得分记
  操作序号。`procedureReport(world)`：得分/满分、完成情况、每步得分/操作序号、
  丢的步骤、操作数、错误数、错误原因、练习模式才给 `nextHint`（考试模式
  永远不透露下一步）。
- 实验台（v0.4）：`benchView`（台上的数、精确合计、分母是否混了，满 6 个）。
  台面操作不计入流程（执行前先剥掉流程状态）；挑战模式在台面玩不加操作数/
  错误数。台面存在 `math-bench-v1` 里，跨问题/模式/刷新都在。
  拖拽用 pointer 事件（平板/触摸能用；移动 <6px 算点击）；分母 >8 或值 >3 的
  分数条只画数字；平均拆分就是“平均分”的意思。
- 跨次统计（v0.3 收尾）：考试模式挑战提交后把 `procedureReport` 写进
  `math-lab-proc-v1`（考过几次、最近分数、每步丢分次数；一次报告只写一次；
  练习不算）。面板显示“考过 N 次，最近 x/y，总丢分最多：某一步”。
  数轴面板提交后不再清空（流程状态保留）。
- 几何（v0.6）：只有周长一定的长方形——`rectSet {w}`，derived 给面积/最大面积/
  是否正方形。概率（v0.7）：只有两个骰子点数之和分 A/B——`diceToggle`，
  公平 = pA == 1/2。鸡兔可行性（v0.5）、由两点定直线（v0.5）、整数校验（v0.5）。
- `LAB_SEEDS` / `LAB_GOALS`：7 道题——q-fracadd、q-balfrac、q-numline、q-funcline、
  q-chicken、q-maxarea、q-fairgame。（旧实验室有 13 道题；只有 7 道有
  MathWorld 种子/流程。）

**缺什么（第 1 阶段前）：**
- (a) **每题重置**：`labSeedWorld(qid)` 每次换题都建全新世界；台面只能靠
  localStorage 从头捡。`labSync*` 从旧数组重建世界。双份 DOM/双份状态。
- (b) 零件盒太薄：6 个数 + 2 个开关；没有十格阵/数位块、图形、骰子/转盘/
  数据表做台面零件，没有角度/量角器、面积砖。
- (c) 台面是“每题一个世界”，不是一张一直存在的台。
- (d) 流程只覆盖 5 道题；maxarea/fairgame 有目标没流程；9 个创意实验根本
  不走世界引擎。
- (e) 错误可视化不均匀：signals 在 derived 里有，但 UI 露得不均匀（分数板
  笨和与真和的对比条在旧工作间里有，新世界分数板只有一行小红字/小条；
  天平倾斜有；数轴拒绝有横幅）；`worldDerivedOut` 是给开发者看的调试
  dump，露着 `goalMet(...)` 内部状态。
- (f) 问题入口：14 道题没按“如果……会怎样？”分领域排；没有每题的
  为什么（发现之后才讲）；注册表只靠 LAB_QUESTIONS.points 挂知识点。
- (g) 留痕：labTrace 只在内存里（刷新就没）；流程丢的步骤不进错题本的
  错因分组；家长端看不到实验室流程统计（`math-lab-proc-v1` 只在流程
  面板里画）。
- (h) 几何/概率引擎：只有长方形 + 骰子；没有三角形/角度/面积砖引擎，
  没有转盘/数据表，没有符号 x 的方程引擎（天平是数量，不是符号 x）。
- (i) 台面视图：两条数轴（世界数轴卡片 0..2 vs 台面数轴视图 −1..7）、
  两个坐标范围（台面坐标 x −1..7, y −2..12 vs 直线卡片 x −5..6,
  y −10..24）。
- (j) 挑战模式没有计时器、没有考试感。
- (k) 十格阵没有 MathWorld 卡片（只在旧 lab-tenframe 工具小站里）。

## 2. 器材 apparatus.js v0.3.0：画画 + 发意图，不算数

- SVG 视图 + pointer 交互；规律留在 MathWorld，这文件只画画和发意图。
- 画：分数板（拖填充手柄、分母芯片 2/3/4/6/8、“拼一拼”按钮、笨和与真和
  对比条）、天平（拖砝码 1/2、1/3、1/4、1/6、1；梁按倾斜角转；877f003 修过
  的按矩形算落点）、数轴（拖 7、1、1/2、0、2 几个筹码；放不下出横幅）、
  鸡兔（点动物换、滑杆）、直线（拖 b 手柄和 k 手柄（x=2 处）；坐标轴
  x −5..6，y −10..24）。
- `renderAll` 拖动中途不重建；`bind(root, handler)` 管 pointerdown/move/up +
  点击（分数段、分母芯片、动物）。模块状态 `lastWorld`/`lastDerived` 只是
  视图缓存，不是模型状态。
- 死代码：`renderFracboard` 里分母芯片那块有个画不出东西的 no-op forEach 循环。

## 3. bench-views.js：视图注册表（58 行）

- `OBJECT_VIEWS`：line → [coord, formula]，num → [numline, coord, fracbar,
  formula]，frac → [fracbar, numline, coord, formula]，balance → [balance,
  formula]。`benchObjects(items, lineOn, balanceOn)`；`chooseView(objects,
  preferred)` 选所有物体都支持的公共视图（第一个物体的默认视图如果在公共
  视图里就用它，否则取公共视图里优先级最高的；学生选过的视图如果在公共
  视图里就优先；最后 fallback 是 formula，永远不画空白）。
- 缺：长方形没有坐标平面；分数上数轴已经在注册表里（frac → numline），但
  台面视图没补长方形。

## 4. app.js 实验室胶水（约 3100–4600 行）

- `labWorld` + `mwPlay`（同一个世界）；`labHasWorld()`；`labSeedWorld(qid)`
  （旧行为：每次换题从 `LAB_SEEDS[qid]` 建全新世界；`benchRestore()` 再从
  localStorage 把台面捡回来）；`worldPlayStartProcedure`；`labCarryProcedure`
  （重建时保留台面 + 流程）；`procHistLoad/Save/Record`（`math-lab-proc-v1`，
  只记考试，`labProcRecorded` 去重）；`renderProcedurePanel` +
  `procReportHtml`（考试模式藏清单；`nextHint` 只在练习模式）+ `procSnapHtml`；
  `benchRun`（台面操作先剥掉流程状态再执行）/`benchApply`；
  `benchSave/benchRestore`（`math-bench-v1`）；`benchViewSvg`（坐标
  x −1..7，y −2..12；数轴 −1..7；分数条；天平；公式）；`worldBenchRender`
  （架子芯片 + `benchPieceSvg`、合计行、视图按钮、坐标视图下 k/b 步进器）；
  `worldBenchBind` 点击处理（拿/选/合并/拆分/天平/直线/视图/清空）；
  `worldBenchDrag`（pointer 拖拽：拿 → 架子，选 → 垃圾桶，按矩形算落点）；
  `labSyncFracBoardToWorld` / `labSyncBalanceToWorld` / `labSyncLinefnToWorld`
  （从旧数组重建世界，保留台面 + 流程）；`labAutoMarkBench`（挑战自动判分，
  经 `goalMet`；`labSubmitChallenge` 约 4112 行调用）；旧托盘
  （`labTray`，最多 3 个，`labTraySend`）+ 3 张组合台（分数加法/天平/数轴）+
  旧数组 `labFaA/labFaB/labWbL/labWbR/labTfA/labLinePts`；`labTrace`
  （app.js 约 14288 行：内存里的 `labTraceLog`，上限 40 条，`#labTraceList`
  里显示最近 12 条——**不持久化，刷新就没**）；`labFocusStation`
  （5 张卡片加 `.lab-mw-focus` + scrollIntoView）；`labChallengeRenderLive`
  （挑战做过的题实时列出来——911801d 修过）；`labEnterQuestion`（演示题 →
  `goDemoFromHere`；台面题 → `labSeedWorld(qid)` + 旧数组重置 +
  `worldPlayStartProcedure` + `labFocusStation`）；`labFreePlay`
  （`labSeedWorld(null)`）；`labSetMode`（自由玩/挑战；挑战盒子显隐切换；
  **实验室挑战模式没有计时器**——模拟测的 10 分钟计时器是另一套）；
  `labSubmitChallenge` → `labFinishChallenge`（自评 + 台面题经 `LAB_GOALS`
  自动判分；错了 → `recordAttempt(q.primary, false, false)`——**只记到
  知识点，不记丢的是哪一步**；丢分小结只点名知识点，不点名步骤；
  考试流程快照走 `procHistRecord`）。

## 5. index.html 的 #lab 一节（3434–3860 行）

- 模式行（`labModeSeg` 自由玩/挑战模式 + `labModeTx` + `labFreePlayBtn`）→
  `labCurrentQ` → `worldIntentMsg` → `labMwTitle`“实验台” +
  `.world-layout#labMwWorkbench`（左列：`.bench-choose`“先选一个问题” +
  `#labQuestions` 14 张卡片，再是器材卡片 `worldFracCard/worldBalCard/
  worldChickenCard/worldLineCard/worldFnCard/worldBenchCard/worldRectCard/
  worldDiceCard`；右列：`<aside class="world-panel">`，里面是
  `<pre id="worldDerivedOut">` 调试 dump + `#worldProcOut`）→“更多器材
  （托盘 · 组合台）”旧工作间（`#labWorkbench`：`#labTray` + 3 张组合台
  lab-fracadd/lab-balance2/lab-numline）→ `#labChallengeBox`（隐藏）→
  `.lab-traces`（`#labTraceList` + 清空记录）→“四个工具小站”
  （lab-fraction、lab-tenframe、lab-balance、lab-function）。
- 台面零件盒（`#worldBenchBox`）是平的：1/2、1/3、1/4、1/6、1、2 + 直线 +
  天平两个开关。台面视图 svg `#worldBenchView` 520×260。
  `Apparatus.bind` 的根是 `#labMwWorkbench`。
- `LAB_QUESTIONS`（14 道）：9 道演示题（q-thirteen 13 有几种凑法？demo
  thirteen，知识点 1.6/1.9/1.11，主 1.9；q-twentyfour 24 点 demo twentyfour
  4.9；q-monty 换一扇门 demo monty 9.9；q-maxarea 周长一定面积最大 demo
  maxarea 3.12；q-matches 动 1 根火柴 demo matches 4.9；q-mobius 莫比乌斯带
  demo mobius 6.5；q-shopweek 开店一周 demo shopweek 6.6；q-fairgame 公平游戏
  demo fairgame 5.4；q-makerule 造规律 demo makerule 1.16）+ 5 道台面题
  （q-fracadd 分母不一样，分数能直接加吗？台面 fracadd 站 worldFracCard
  5.11；q-balfrac 天平一边放 1/2 台面 balfrac worldBalCard 5.5；q-numline
  7 在数轴上是哪里？台面 numline worldLineCard 1.9；q-funcline k 变成负数，
  直线往哪倒？台面 funcline worldFnCard 8.15；q-chicken 头 35，腿 94 台面
  chicken worldChickenCard 5.5）。问题列表没有搜索/筛选（静态 2 列网格）。
  maxarea/fairgame 是演示题，但也有 LAB_SEEDS/LAB_GOALS（rect/dice）——
  两头各一：演示打开了，世界里的长方形/骰子卡片是另一套。

## 6. 和 NB 模型比，缺什么（对照 NB 功能研究报告 §5–§6）

| NB 机制 | 我们的水平 | 缺口 |
|---|---|---|
| 一张会算的桌子 + 器材架 | 有模型、有台面，但每题重置；零件盒平的，只有 6 个数 + 2 开关 | 一张一直存在的台；器材架按领域分组；器材随取随用 |
| 属性检查器贴在物体旁边 | 无（属性只在各卡片自己的滑杆/按钮里改，远离物体） | 点物体 → 旁边出检查器 → 2–4 属性 → 滑杆+数字双通道 → 立刻重算 |
| 四种手势就是操作词典 | 有拖拽（pointer，<6px 算点击），但手势含义没统一 | 点整体/点部位/拖整体/拖部位四种；倾倒按钮对应“把量的一部分挪过去” |
| 操作本身就是运行 | derived() 已经是这个机制 | 保持；不要加“运行”按钮 |
| 练习模式 = 每步提醒 + 错一步改一步记一步 | 有流程和 nextHint，但下一步只在角落一行字；没有练习菜单 | 下一步在台面上高亮；左上角菜单三项；右下角为什么+我的发现；丢分报告可收起/按住隐藏 |
| 考试模式 = 没提示 + 提交后按步骤给分 + 丢分位置 | 有流程报告和跨次统计，但挑战模式没有计时器、没有考试感；丢分只记到知识点 | 计时可见、干净台面、提交后按步骤给分并写进错题本（第 2 阶段） |
| 找实验：搜索 + 章节/知识点筛选 + 详情 | 无搜索/筛选，静态列表 | 搜索 + 年级/领域筛选（第 1 阶段轻量版）；按教材章节组织（第 3 阶段） |
| 保存进个人资源 | 只有台面 localStorage 自动保存，没有“我的实验” | 起名字保存台面快照（第 1 阶段）；分享（第 3 阶段） |
| 留痕：试过的方法、错的地方、家长端 | labTrace 只在内存；丢分只记知识点；家长端看不到实验室 | 持久化记录、错因分组、家长端可见（第 3 阶段） |
| 5 步学习（拆成 5 个小步骤，看得见进度） | 流程是 3–4 步，没有 5 步进度条 | 第 3 阶段再看要不要按 NB 的 5 步拆 |
| 发现时刻/探究作业 | 已有（发现时刻故事、探究作业 6 题、我的发现进 math-inquiry-v1） | 实验室的“我的发现”要接进同一条线 |

**明确不抄**（NB 报告 §5 末尾）：收藏/消息通知/独立笔记、付费墙、
重度 RPG、名师视频、3D 高仿真、化学/物理特有内容、实验报告“选择题+
填空”的形式、把数学做成“实验步骤背诵”。
