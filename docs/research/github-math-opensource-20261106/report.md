# GitHub 开源数学学习项目调研报告

- 调研日期：2026-11-06
- 调研对象：GitHub 上的开源数学学习项目（以交互教具/虚拟实验室、K-12 数学应用、间隔重复、分步求解为主）
- 前置阅读：本次调研是 NB实验室调研（`docs/research/nb-lab-20261106/`）与 NB数学实验调研（`docs/research/nb-math-lab-20261106/`）的后续，回答"除了 NOBOOK，全网还有哪些可以学的东西"。
- 版权声明：本报告只记录**机制层面**的观察与公开资料的转述，**不复制任何项目的文案、图片、界面、代码**。每个项目的许可证都已逐项核对；**没有许可证的仓库默认保留所有权利，代码一律不可复制**，只能学习设计思想。借鉴清单中的机制均为通用教学方法或经许可的代码复用，实现时必须遵守对应许可证（MIT/Apache 需保留声明，CC-BY 需署名，GPL/AGPL 代码不可并入）。

---

## 0. 核心结论（先说最重要的发现）

**全网没有第二个"NB数学实验"——但有 15 个值得学的开源项目，而且其中 3 个的架构与我们几乎一模一样。**

- **最像我们的项目是 kenowong/math-mastery（MIT，409★）**：纯前端、零依赖、单文件可离线、localStorage 存进度，覆盖小学到高中 49+ 个解题方法，每个方法配一个 `qgen(n)` 参数化出题引擎（题目永不重样、答案由构造算出、分步解析 + SVG 配图）。它的出题引擎模式可以直接移植到我们的练一练/混着练/模拟测。
- **最值得升级的是我们的复习算法**：FSRS（`open-spaced-repetition/ts-fsrs`，MIT，852★）是 Anki 官方采用的间隔重复算法，有 UMD 构建可直接内联进单文件 HTML，能把我们的固定"错→1 天/对+自信→3 天/连对→7 天"换成记忆模型（难度/稳定性/可提取性）驱动的动态间隔。
- **最值得抄作业的设计规则在 edu-ai-builders/math-viz-kit（无许可证，90★）**：123 个单文件交互可视化 + 一套 8 条学习科学设计规则（每个工具只承载一个认知动作；反馈要揭示规律而不是只说对错）。代码因无许可证不能复制，但规则是思想，可以直接当作我们新演示的检查清单。
- **一个重要变化**：PhET 的各个模拟仓库（如 `phetsims/fractions-intro`）已**归档不再维护**，源码并入不公开的 monorepo——PhET 的代码现在拿不到，只能学交互设计、或按 CC BY 嵌入官方模拟。
- **许可证红线**：Mathigon 教材内容是 UNLICENSED（明确写着不要复制），GeoGebra 整体打包有商业限制，Anki 代码是 AGPL，algebra-3d 是 GPL-3.0，math-viz-kit 和 little-math-lab 没有许可证——这 6 个只能学思路，不能碰代码。

---

## 1. 项目总览表

星数与状态均为 2026-11-06 核查值。

| # | 项目 | Stars | 许可证 | 语言/栈 | 最后活动 | 一句话定位 |
|---|---|---|---|---|---|---|
| 1 | kenowong/math-mastery | 409 | MIT | 原生 JS，零依赖，单文件 | 2026-08 之后活跃（25 提交） | 参数化出题引擎 + 分步解析，小初高 49+ 方法 |
| 2 | edu-ai-builders/math-viz-kit | 90 | **无许可证** | 原生 HTML/CSS/JS，单文件 ×123 | 2026-04 创建，仅 2 提交 | 123 个单文件交互可视化 + 8 条设计规则 |
| 3 | davidpetry-cloud/grade6-singapore-math-cpa | 1 | CC-BY-4.0 | 原生 JS，无构建步骤 | 2026-09 创建，43 提交 | 六年级新加坡数学 CPA 课程，7 个核心教具 + 单元工具 |
| 4 | phetsims（PhET 模拟系列） | —（组织） | 模拟 CC BY；源码已归档 | JS/HTML5 | 旧仓库已归档，monorepo 不公开 | 全球最权威的免费交互模拟库（分数、天平等） |
| 5 | mathigon JS 库（core/boost/fermat/hilbert） | — | MIT | TypeScript | 2026-09 更新 | 分数运算、表达式解析等数学 JS 库；教材内容 UNLICENSED |
| 6 | jsxgraph/jsxgraph | 1,487 | MIT 或 LGPL-3.0（双许可） | 原生 JS（SVG/Canvas） | 活跃（9,499 提交） | 交互几何 + 函数作图库 |
| 7 | acidkeyxyz/algebra-3d | 0 | GPL-3.0 | Astro + Preact + Three.js | 2026-10 创建，14 提交 | 3D 天平解方程 + 分步求解器 + 游戏化学习路径 |
| 8 | bk4ice/KidsMathQuest | 25 | MIT | React + Node + Prisma | 2026-05 创建，39 提交 | 家长端 + 儿童端双端，错题本、试卷生成、AI 导师 |
| 9 | shanelau068-a11y/little-math-lab | 0 | **无许可证** | React + Vite | 2026-10 创建，5 提交 | 四年级错题本：每道错题配互动动画 + 分步解释 |
| 10 | open-spaced-repetition/ts-fsrs | 852 | MIT | TypeScript（ESM/CJS/UMD） | 2026-11-04 更新 | FSRS 间隔重复算法，Anki 官方采用 |
| 11 | josdejong/mathjs | （未在本次核查星数） | Apache-2.0 | JS | 活跃（v13.2.x，2026） | 表达式解析 + 分数 + 符号计算库 |
| 12 | nerdamer / nerdamer-prime | （npm 2.0.0） | MIT（原版）/ Apache-2.0（2.0） | JS | 2026-10 更新 | 轻量 CAS：解方程、因式分解、化简，可单文件内联 |
| 13 | ManimCommunity/manim | ~41,800 | MIT | Python | 活跃 | 3Blue1Brown 的数学动画引擎（离线生产动画用） |
| 14 | geogebra/geogebra | — | 源码 EUPL/GPL；整体非商业许可 | Java/JS | 活跃 | 动态几何 + 代数全功能平台（打包受限） |
| 15 | LReyes21/mmc-games-hub | （小） | MIT（hub 代码） | 静态站 | 2026-08 更新 | 嵌入 PhET 模拟的小学数学游戏中心 |

---

## 2. 逐项目详解

### 2.1 kenowong/math-mastery —— 最值得学的同类项目 ★★★

- 仓库：<https://github.com/kenowong/math-mastery>（另有 Gitee 镜像）
- Stars：409，Forks：128；创建 2026-08-27；25 提交；许可证 **MIT**；纯前端、零依赖、离线可用；`math-mastery-standalone.html` 单文件版与我们的 `homepage-standalone.html` 架构相同。
- 覆盖：小学 10 个核心方法（鸡兔同笼、植树问题、和差倍、盈亏、平均数、周期、归一、工程、相遇、追及）+ 初中 15 个 + 高中 24 个 + 拓展专题 45 个。
- **最好的交互：参数化出题引擎**。每个方法配一个 `qgen(n)` 生成器：第一遍、第二遍、第三遍题干都不同；正确答案由数学构造直接算出（正确性有保证，不靠题库）；每道生成题自带**分步解析 + SVG 配图**，配图只展示"题给数据与结构关系"，绝不泄露答案。另有学习路径（按依赖关系编排）、闯关模式（错题自动进薄弱点）、薄弱点复习、返回路径自动定位。
- **复用 verdict**：**最优先借鉴**。`qgen` 模式可直接移植：我们的练一练目前是每知识点固定 2 道题，混着练从固定题库抽——改成"每方法一个生成器"后题目永不重样，且分步解析天然对应我们正在做的"分步评分"。MIT 许可，代码可直接参考、改写后使用（保留 MIT 声明）。另可学它的"配图不泄露答案"原则和"返回路径自动定位"细节。

### 2.2 edu-ai-builders/math-viz-kit —— 最好的设计规则库 ★★★

- 仓库：<https://github.com/edu-ai-builders/math-viz-kit>
- Stars：90，Forks：33；创建 2026-04-16；仅 2 提交；**无 LICENSE 文件**；123 个工具各为单 HTML 文件，零外部依赖；附 `数学可视化-skill.md`（AI 生成技能，EVAL/PRD/CODE 三模式）与 `system/教学法规则库-v1.md`。
- 覆盖：小学 23（加减法、分数、面积、时间、进位）、初中 23（函数、方程、几何、勾股、概率）、高中 37、大学 44；目录页 `数学目录.html` 支持网格预览、按学段筛选、懒加载。
- **最好的设计：三条规则**。每个工具只回答三个问题：为什么要可视化（只做"静态图讲不清楚、动态一秒懂"的点）；让大脑做什么（每个工具只承载**一个认知动作**：比较/分解/变换/逼近/累积/模拟……）；反馈说什么（不只显示对错，而是**揭示数学规律**，如"无论你怎么改变三角形，a²+b² 始终等于 c²"）。规则来源标注为认知负荷理论、多表征研究、具身认知。
- **复用 verdict**：**规则照单全收，代码一律不碰**。无许可证 = 默认保留所有权利，复制代码即侵权。但 8 条设计规则是思想层面的东西，可以直接作为我们新演示/新小站的检查清单（尤其"一个工具一个认知动作"和"反馈揭示规律"这两条，正好对应我们正在做的错误可视化）。如需复用代码，应先联系作者确认许可证。

### 2.3 davidpetry-cloud/grade6-singapore-math-cpa —— CPA 教具的工程范本 ★★★

- 仓库：<https://github.com/davidpetry-cloud/grade6-singapore-math-cpa>，在线版：<https://davidpetry-cloud.github.io/grade6-singapore-math-cpa/>
- Stars：1，Forks：0；创建 2026-09-13；43 提交；许可证 **CC-BY-4.0**（可商用，需署名 David Petry）；无构建步骤，直接打开 HTML；Three.js 仅用于立体展开图且已打包成本地文件。
- **最好的交互（7 个核心教具 + 8 个单元工具）**：
  - `placeValue` 位值圆片：满十自动换位，×10/÷10 整体平移；
  - `barModel` 条形模型：部分-整体与比较两种模式，按比例画、求一份；
  - `fractionModel` 分数模型：等值（重新切分）、比较、通分加法、面积乘法四种模式；
  - `fractionDivide` 分数除法：度量模型——沿着被除数条摆除数大小的组，数出个数，从公共分母推出"除以一个数 = 乘它的倒数"；
  - `balanceScale` 天平：方程即天平，两边不对等处理就倾斜（与我们的天平演示同构，但它是从"等式性质"出发）；
  - `stepper` 运算顺序：每行算一步，并标注"为什么先算这一步"（**分步评分的现成范例**）；
  - `netFold` 展开图：先在网格上摆展开图（错了会说出违反了哪条规则），再 3D 折起来；
  - `distBuilder` 分布：同一组数据三联动（点图/直方图/统计量），拖异常值看平均数动、中位数不动。
- **工程上最值得学的三点**：① 工具注册表模式——`window.__EXTRA_TOOLS__` 定义单元工具，被第二个单元需要的工具就"晋升"进核心文件而不是复制；② 每个工具配独立 `.test.js`，且"工具里显示的每个数字都要在测试里断言"（他们的原话：教具里的错误答案比没有教具更糟）；③ 非功能性清单写进 README 当硬规则：CPA 顺序、每个 SVG 配同样信息的 `aria-label`、尊重减弱动效、颜色永远不是唯一线索、文本对比度 4.5:1。
- **复用 verdict**：CC-BY-4.0 允许改编（含商用），条件是署名。交互设计可直接学；代码改写后使用需保留署名。`stepper`（一步一标注为什么）和 `netFold`（错了说出违反哪条规则）是错误可视化 + 分步评分的两个现成范本。

### 2.4 phetsims / PhET —— 交互设计的标杆，但代码已拿不到 ★★

- 组织：<https://github.com/orgs/phetsims/repositories>；各模拟仓库（如 `phetsims/fractions-intro`）README 已写明 **"This Repository Is No Longer Maintained"**，源码并入不公开的 monorepo，旧仓库代码已过时。
- 许可证：模拟本身按 **CC BY 4.0** 免费提供（见 phet.colorado.edu/licensing），可在网页中嵌入/链接；但**源码现在无法获取**，不要再计划"把 PhET 代码拿来改"。
- **最值得学的交互（只学设计，不碰代码）**：
  - Fractions Intro / Build a Fraction / Fraction Matcher：拖动切分饼/条、等值分数匹配、多种表征并列；
  - Equality Explorer：代数天平探索（与我们 5.5/7.6 的天平演示同类，但它支持不等式与多变量）；
  - Balancing Act：力矩平衡（重量 × 距离），比单纯"左右相等"多一个维度；
  - Area Builder / Area Model Algebra：面积模型做乘法与因式分解；
  - Make a Ten：凑十（与我们十格阵同构）。
- **复用 verdict**：设计灵感来源；如需在页面里直接用某个模拟，可按 CC BY 嵌入官方模拟（需署名），但与我们"单文件离线"目标冲突，**建议只借鉴交互、不嵌入**。

### 2.5 mathigon JS 库 —— 小而专的数学零件 ★★

- 组织：<https://github.com/mathigon>；库：`mathigon/core.js`、`mathigon/boost.js`、`mathigon/fermat.js`、`mathigon/hilbert`，**全部 MIT**（jsDelivr 可查：`@mathigon/core` 1.1.24 MIT，`@mathigon/fermat` 1.1.23 MIT，`@mathigon/hilbert` MIT）。
- **注意红线**：`mathigon/textbooks`（互动教材内容）是 **UNLICENSED / 私有**，其 AGENTS.md 明确写着"do not copy content into other projects"——教材的文字、题目、互动设计一律不碰。Polypad 本体已移交 Amplify，源码不在 mathigon 组织内。
- **最有用的两个零件**：
  - `fermat.js`：数学与统计库，含**精确分数**、复数、矩阵、随机数——可替代我们手写分数通分/约分逻辑；
  - `hilbert`：表达式解析、化简、MathML 渲染——可用于分步评分里"学生输入的式子是否与标准步骤等价"的判断。
- **复用 verdict**：MIT，可直接用（保留声明）。但要注意体积与单文件目标的取舍：只取需要的函数思想或裁剪后内联，不要整个库塞进单文件。

### 2.6 jsxgraph/jsxgraph —— 几何演示的现成引擎 ★★

- 仓库：<https://github.com/jsxgraph/jsxgraph>；Stars：1,487；Forks：215；创建 2012-06；9,499 提交，持续活跃；**双许可 MIT 或 LGPL-3.0**（可任选 MIT，条件最宽松）。
- 是什么：纯 JS 的交互几何/函数作图/图表库，无任何依赖，SVG/Canvas 渲染，支持多点触控；用法是一行 `JXG.JSXGraph.initBoard` + `board.create('point', …)`。
- **最好的交互**：拖动几何点看不变量（拖三角形顶点，内角和恒为 180°；拖圆上的点，圆周角恒为圆心角一半）；函数图像与滑杆、表格联动；几何作图题可直接做成可拖动的"活图"。
- **复用 verdict**：我们 G7–G9 的几何点（7.10 平行线、8.2 全等、9.6 圆）目前只有文字描述，没有可拖动的几何演示——JSXGraph 是补这块的最短路径。MIT 许可，可内联使用；**唯一代价是体积**（压缩版约数百 KB，单文件会变大），建议只在需要几何演示的页面按需加载，或先只做一两个几何小站验证效果。

### 2.7 acidkeyxyz/algebra-3d —— 3D 解方程的步骤剧场 ★

- 仓库：<https://github.com/acidkeyxyz/algebra-3d>；Stars：0；创建 2026-10-03；14 提交；许可证 **GPL-3.0**；栈 Astro 6 + Preact + Three.js + KaTeX；双语（西/英）。
- **最好的交互：3D 分步求解器**。输入方程后一步步在 3D 场景里演出来：天平上的代数块（x³ 立方、x² 平板、x 长条、单位立方，红色 = 负数），块落下、零对抵消、除法时分成等份；因式分解 `x²+5x+6` 拼成 `(x+2)(x+3)` 的矩形；函数 `y=x+2` 同时给表、截距、斜率箭头；**步骤导航**（◀ ▶ 按钮、← → 键、空格自动播放、End 跳到最后），每步镜头飞到最佳视角。另有游戏化学习路径：36 关、五条线、按年龄定起点、5 颗心、星级、XP、徽章、日 streak，代数题有"See it in 3D"直通求解器。
- **复用 verdict**：**学设计，不碰代码**（GPL-3.0 会传染，抄进我们的仓库会迫使整个项目 GPL 化）。最值得学的是"步骤卡片 + 场景联动 + 步骤导航"这一套：我们的分步评分如果每步配一个小场景、能一步步播放，就是它的 2D 平价版。

### 2.8 bk4ice/KidsMathQuest —— 家长端的产品范本 ★

- 仓库：<https://github.com/bk4ice/KidsMathQuest>；Stars：25，Forks：6；创建 2026-05-18；39 提交；许可证 **MIT**（README 徽章）；栈 React 18 + TypeScript + Node/Express + Prisma（SQLite/PostgreSQL），Docker 部署。
- **最好的设计：家长端 + 儿童端双端分离**。家长端：管理孩子档案、定制每日练习（题量/难度/运算类型/小数位数）、生成可打印 A4 试卷、学习统计（正确率、连续打卡、历史记录）；儿童端：虚拟键盘答题、即时反馈动画、答错自动进错题本、积分与徽章、错题复习。另有可选 AI 导师"狸学长"（多轮对话、学习诊断、个性化试卷推荐，接 OpenAI/Anthropic/阿里 DashScope/vLLM）。
- **复用 verdict**：产品设计可学，代码架构不适用（我们是无后端单文件，它是前后端分离 + 数据库）。家长看板做到"轻量版"时照它的字段抄：练习配置、正确率统计、连续打卡、错题复习入口。AI 导师暂不做（见第 5 节）。

### 2.9 shanelau068-a11y/little-math-lab —— 错题本的最小实现 ★★

- 仓库：<https://github.com/shanelau068-a11y/little-math-lab>，在线版：<https://shanelau068-a11y.github.io/little-math-lab/>；Stars：0；创建 2026-10-14；5 提交；**无 LICENSE 文件**；React + Vite 静态站，GitHub Pages 自动发布。
- **最好的交互：每道错题 = 一个独立 lesson 文件 + 一个互动动画 + 分步解释**。首页只列题目，点开后才显示动画和分步解释，动手控件与小练习默认折叠。现有 4 道四年级角的题：风筝与角度（两根 30 米线、0°～90° 对比，高度用 `L·sin(angle)` 算）、认识角、角与边的长度（边伸长角不变）、放大镜里的角（图形放大角不变）。动画始终在"角度空间"计算再算坐标，保证线长不变——这个细节很专业。
- **复用 verdict**：**模式照搬，代码不抄**（无许可证）。它验证了我们错题本升级的最简形态：错题列表 → 点开 → 动画演示错因 → 分步解释 → 小练习。我们现在的错题本只有列表和复习入口，缺的正是中间这层"错题的动画解释"。

### 2.10 open-spaced-repetition/ts-fsrs —— 复习算法的升级件 ★★★

- 仓库：<https://github.com/open-spaced-repetition/ts-fsrs>；Stars：852；**MIT**；TypeScript，支持 ESM/CJS/**UMD**；2026-11-04 刚更新；同组织另有 `fsrs4anki`（4,116★，MIT）、`py-fsrs`（MIT，v6.3.2）。
- 是什么：FSRS（Free Spaced Repetition Scheduler）——Anki 自 23.10 起的默认间隔重复算法，基于 700M+ 条真实复习记录训练的记忆模型，用难度（Difficulty）、稳定性（Stability）、可提取性（Retrievability）三个参数预测遗忘并安排复习；实测比 SM-2 减少约 20–30% 的复习量且保持同等记忆率。注意区分：Anki 本体是 **AGPL**（32,192★），**绝不能用它的代码**；FSRS 的各语言实现是独立的 MIT 项目，可以用。
- **复用 verdict**：**最优先的算法升级**。我们的今天复习现在是固定规则（错→1 天，对+自信→3 天，连对→7 天），FSRS-6 的 UMD 构建可直接内联进单文件（或把核心公式移植成几十行原生 JS，算法本身是公开的），让每道题的下次复习时间由该题的历史表现决定。注意：FSRS 的参数优化器需要真实复习语料，初期用默认参数即可；另要保留"3 错降难度、21:00 后不推新课"等防疲劳规则（那是产品规则，不是算法）。

### 2.11 josdejong/mathjs —— 表达式解析器 ★

- 仓库：<https://github.com/josdejong/mathjs>，官网 <https://mathjs.org>；许可证 **Apache-2.0**；v13.2.x（2026）；含表达式解析器、分数（Fraction 类型）、大数、复数、矩阵、单位；符号计算靠插件。
- **复用 verdict**：Apache-2.0 可用（保留声明）。最有用的不是整个库，而是"表达式解析 + 精确分数"这两个能力：分步评分里判断学生输入的式子是否与标准答案等价、分数运算不丢精度。体积较大，建议只移植思路或按需裁剪，不要全量内联。

### 2.12 nerdamer / nerdamer-prime —— 轻量 CAS，可单文件内联 ★★

- 原项目 `jiggzson/nerdamer`（MIT）已归档；延续版 `nerdamer-prime`（npm，MIT）与 `nerdamer` 2.0.0（Apache-2.0，2026-10 更新）；官网 <https://nerdamer.com/>。
- 是什么：轻量计算机代数系统：表达式解析、化简、展开、因式分解、解方程、微积分，可在浏览器直接跑。已有先例：`mitchell-d00/Mitchell-Tech-V120.2`（MIT）把 Nerdamer 1.1.13 **整个打包进单个 HTML 文件**做离线科学计算器——证明了它能进我们这种单文件架构。
- **复用 verdict**：MIT/Apache-2.0 可用。最适合支撑"分步评分"的自动验算：学生做一步，CAS 判断这一步是否等价变形、错在哪一步。先在解方程类题目上试点。

### 2.13 ManimCommunity/manim —— 动画生产工具，不进运行时 ★

- 仓库：<https://github.com/ManimCommunity/manim>；Stars：~41,800；Forks：3,200；**MIT**；Python；3Blue1Brown 的 Grant Sanderson 原创的数学动画引擎的社区版（原版 `3b1b/manim` 约 88,000–95,000★）。
- **复用 verdict**：只用于**离线生产**讲解动画（例如"为什么"的动画演示），渲染成视频/GIF 后使用；绝不放进 App 运行时（Python + FFmpeg + LaTeX 太重）。我们的"为什么"目前是文字 + 静态图，个别难点（如进位、分数除法）可先用 Manim 做一两个动画验证效果。

### 2.14 geogebra/geogebra —— 参考产品，不要打包 ★

- 仓库：<https://github.com/geogebra/geogebra>；许可证复杂：**源码现为 EUPL v1.2（官网许可页）/ 历史版本 GPL-3.0，安装器、网络服务、界面图片样式与语言文件走 GeoGebra 自己的非商业许可**；商业用途需另签协议。2025 年起属印度 Byju's 旗下。
- **复用 verdict**：**不要打包、不要内联**。几何与代数联动的交互设计可以参考（拖动点、联动表/图/式），但许可证与体积都不适合我们的单文件免费 App。需要几何演示时用 JSXGraph（MIT）代替。

### 2.15 LReyes21/mmc-games-hub —— 嵌入式聚合的范本 ★

- 仓库：<https://github.com/lreyes21/mmc-games-hub>；在线版：<https://lreyes21.github.io/mmc-games-hub>；**hub 代码 MIT**；静态站，GitHub Pages 托管。
- 是什么：小学数学游戏中心，策展式聚合：内嵌 7 个 PhET 模拟（Arithmetic、Fraction Matcher、Fractions Introduction、Build a Fraction、Make a Ten、Number Line Operations、Equality Explorer），另链 Polypad、Toy Theater、Khan Academy Kids 等；按年级分流（K-2 / 3-5 / 6-8）；无需注册。
- **复用 verdict**：聚合模式本身对我们参考价值有限（我们是自研内容，不是聚合站），但它证明了"PhET 模拟 + 自研内容混排"是被广泛接受的做法；如果将来某个演示我们做不出来，嵌入一个 PhET 模拟是合规的备选（CC BY 署名）。

---

## 3. 其他值得知道的开源工具（非 GitHub 核心，但相关）

- **Mathigon Polypad**（<https://mathigon.org/polypad>，现属 Amplify，免费使用）：最完整的虚拟教具画布（多边形、数块、分数条、代数块、七巧板、骰子、转盘……），**源码不开放**，只能免费用、不能抄。设计参考价值最高：它的"教具自由组合 + 画布"就是我们数学实验室的升级版形态。
- **Math Learning Center（MLC）免费教具**（<https://www.mathlearningcenter.org/apps>）：分数、Geoboard、数轴、时钟等，免费使用、灵感来源；许可证未逐项核实，**只看不抄**。
- **Desmos**（<https://www.desmos.com/>）：函数作图标杆，专有产品，灵感来源；我们的函数演示可学它的"滑杆 + 表格 + 图像"三联动。
- **Khan Academy**：许可证冲突（帮助中心 CC BY-NC-SA vs OER 指南说法不一），沿用第一轮调研结论：**只做灵感与外链，不复制内容**。
- **Runestone Interactive**（<https://github.com/RunestoneInteractive/rs>）：互动教材平台（Parsons 问题、代码题、选择题），许可证本次未核实，列入未验证清单；其"可运行的交互题型"思路值得以后看。

---

## 4. 排名借鉴清单（按优先级，映射到我们的 App）

我们 App 的现状：单文件 HTML（index.html + styles.css + app.js + content/grades/grade-*.js），原生 JS + localStorage，无框架无后端，1–9 年级 142 个知识点，4 个演示 + 数学实验室沙盒，提取练习、间隔复习、交叉练习、自评 + 信心校准，免费无登录。以下每一项都按这个栈评过。

### 第 1 位：参数化出题引擎 `qgen(n)` —— 来源 math-mastery（MIT）

- 怎么借：每个方法/知识点配一个生成器函数，输入随机种子出题干、由数学构造算答案、附分步解析。先从三类题试点：鸡兔同笼/植树（小学方法）、一元一次方程（初中）、一次函数（初中）。我们的练一练从"固定 2 道题"变成"每练一次都不重样"，混着练和模拟测直接受益。
- 成本：中。每个生成器约 30–80 行原生 JS；MIT 代码可直接参考改写（保留声明）。
- 预期收益：最高——练习量从有限题库变成无限，且答案正确性由构造保证。

### 第 2 位：FSRS 升级今天复习 —— 来源 ts-fsrs（MIT）

- 怎么借：把固定 1/3/7 天规则换成 FSRS-6：每条复习记录存难度/稳定性/可提取性，下次时间由模型算出；UMD 构建可直接内联进单文件，或移植核心公式（公开算法，约 100–200 行）。初期用默认参数；保留防疲劳产品规则。
- 成本：中低。先只换调度公式，不动界面。
- 预期收益：高——复习量减少约 20–30% 且记忆效果不降；是第三轮调研（提取练习 + 间隔练习）结论的直接升级。

### 第 3 位：设计规则检查清单 —— 来源 math-viz-kit（无许可证，只学规则）

- 怎么借：把它的 8 条规则（尤其"一个工具一个认知动作"和"反馈揭示规律而不是只说对错"）写成我们新演示/新小站的验收清单，贴进仓库 docs。每个新演示立项时先回答它的三个问题：为什么要可视化？让大脑做什么？反馈说什么？
- 成本：极低（一页文档）。
- 预期收益：中高——防止以后做出来的演示变成"花哨但没教到点子上"。

### 第 4 位：工具注册表 + 每工具独立测试 —— 来源 grade6-singapore-math-cpa（CC-BY-4.0）

- 怎么借：我们的演示目前是散落在 app.js 里的函数；改成注册表（`DEMO_REGISTRY`：id → 挂载函数 + 适用知识点），新演示先登记再挂载；每个演示配一个 `tools/smoke.js` 检查（已有 62 项，继续加），并执行"演示里显示的每个数字都要在测试里断言"。
- 成本：低（重构 + 测试）。
- 预期收益：中——演示越多越需要这套纪律，否则回归成本失控。署名要求：如改写其代码，需署名 David Petry。

### 第 5 位：分步评分的自动验算 —— 来源 nerdamer（MIT/Apache-2.0）+ mathjs（Apache-2.0）+ grade6 的 `stepper`

- 怎么借：解方程类题目拆成"列式/移项/合并/系数化 1/检验"五步，学生每做一步，CAS 判断该步是否等价变形；错在哪一步就标在哪一步（与正在做的错误可视化合流）。先在 5.5/7.6（一元一次方程）试点。
- 成本：中。nerdamer 可整段内联进单文件（已有单文件先例）；或只取"等价判断"思路自己写。
- 预期收益：高——这是 NB 报告里排第一的借鉴点（分步评分 + 丢分定位）的技术底座。

### 第 6 位：几何可拖动演示 —— 来源 JSXGraph（MIT）

- 怎么借：G7–G9 的几何点（平行线、三角形全等、圆）加"活图"：拖动顶点看内角和不变、拖动圆上的点看圆周角不变。先做 1 个（三角形内角和）验证体积与体验。
- 成本：中。体积是主要代价，按需加载或只做一个。
- 预期收益：中——补齐我们目前几何只有文字描述的短板。

### 第 7 位：错题本的"动画解释层" —— 来源 little-math-lab（无许可证，学模式）

- 怎么借：错题本从"列表 + 复习入口"升级为"列表 → 点开 → 动画演示错因 → 分步解释 → 小练习"。先挑 3 道高频错题（如分数比较、进位加法、鸡兔同笼）做动画解释。
- 成本：中。每道错题一个独立小模块。
- 预期收益：中——错题本从"再练一遍"变成"弄懂为什么错"。

### 第 8 位：家长看板（轻量版） —— 来源 KidsMathQuest（MIT，学产品设计）

- 怎么借：不做账号与后端，只做本地轻量版：练习配置（每天几道、哪些年级）、正确率统计、连续打卡、错题复习入口。字段照它的家长端抄，存在 localStorage。
- 成本：中低。
- 预期收益：中——家长是实际的决策人与付费方（如果以后考虑），先给看板再谈其他。

---

## 5. 不要借鉴的

- **GeoGebra 整体打包**：许可证复杂（源码 EUPL/GPL + 整体非商业许可），体积大，与"单文件免费"冲突；几何需求用 JSXGraph。
- **Anki 的代码**：AGPL-3.0，传染性强；只用 MIT 的 FSRS 实现。
- **Khan Academy 的内容**：许可证冲突未解决，只做灵感与外链。
- **Mathigon 教材内容**：UNLICENSED，明确禁止复制；只用它的 MIT 库（fermat/hilbert）。
- **PhET 的源码**：旧仓库已归档、monorepo 不公开，拿不到；只学交互设计。
- **algebra-3d 的代码**：GPL-3.0，会传染；只学"步骤卡片 + 场景联动"。
- **math-viz-kit / little-math-lab 的代码**：无许可证，默认保留所有权利；只学规则与模式。
- **整站重构成 React/Three.js**：KidsMathQuest 与 algebra-3d 的栈都不适合我们"单文件、零依赖、离线可开"的定位；借鉴产品设计，不搬技术栈。
- **视频课堆量、重游戏化 RPG、付费墙**：与 NB 报告结论一致，不重复。

---

## 6. 未验证清单（必须如实记录）

1. `jangtrinh/design-os-svg-animation`（一年级 10 个 SVG 教具：数棒、天平、十格阵、数轴、钟表、分数饼等）：许可证与星数未核实——它与我们的低年级演示重合度最高，值得单独核查一次。
2. `zhangifonly/mathviz`（交互式数学可视化实验平台）：许可证、星数、最后活动未核实。
3. `Jia-Yee/math-knowledge-graph`（数学知识图谱，小学 2,215 节点）：许可证未核实；如为宽松许可，其"前置/后续知识"边数据可对照我们的"前置关系"维度。
4. `JeetChan/mini-classroom`（27–31★，小学轻量交互学习站）：许可证未核实。
5. `RunestoneInteractive/rs`（互动教材平台）：许可证未核实；Parsons 问题等题型思路值得以后看。
6. "Algebra 1 by Investigation"（fullstackeducator 2026 年实验：95 课 + 9 个共用教具 + Desmos 风格图形计算器，号称源码在 GitHub）：仓库地址本次未找到，未核实。
7. `math-mastery` 的 409★ 中有多少来自中文社区推荐 vs 自然增长，未区分；其 `qgen` 生成器的题目质量（尤其奥数层）未逐题抽查——移植前应先抽查 10 道生成题。
8. `math-viz-kit` 的 123 个工具由 AI 生成，逐个质量参差（作者自己也设了 EVAL 关）；借鉴前应对小学/初中段的工具抽查 5–10 个。
9. `nerdamer` 的版本线：原版 MIT 已归档，延续版 `nerdamer-prime`（MIT）与 npm `nerdamer` 2.0.0（Apache-2.0）的继承关系未完全理清；采用前应锁定一个版本并读其 LICENSE 文件。
10. PhET 模拟嵌入的具体署名要求（CC BY 4.0 的署名格式与链接方式）未逐条核对；如将来真要嵌入，需先读 <https://phet.colorado.edu/en/licensing>。
11. 本报告的星数均为 2026-11-06 的快照，GitHub 星数随时会变；引用时以报告日期为准。

---

## 7. 来源

### GitHub 仓库（已逐个打开核实）

- kenowong/math-mastery：<https://github.com/kenowong/math-mastery>（MIT，409★，2026-08-27 创建）
- edu-ai-builders/math-viz-kit：<https://github.com/edu-ai-builders/math-viz-kit>（无许可证，90★，2026-04-16 创建）
- davidpetry-cloud/grade6-singapore-math-cpa：<https://github.com/davidpetry-cloud/grade6-singapore-math-cpa>（CC-BY-4.0，1★，2026-09-13 创建）
- phetsims/fractions-intro（已归档）：<https://github.com/phetsims/fractions-intro>；组织：<https://github.com/orgs/phetsims/repositories>
- jsxgraph/jsxgraph：<https://github.com/jsxgraph/jsxgraph>（MIT/LGPL-3.0 双许可，1,487★）
- acidkeyxyz/algebra-3d：<https://github.com/acidkeyxyz/algebra-3d>（GPL-3.0，0★，2026-10-03 创建）
- bk4ice/KidsMathQuest：<https://github.com/bk4ice/KidsMathQuest>（MIT，25★，2026-05-18 创建）
- shanelau068-a11y/little-math-lab：<https://github.com/shanelau068-a11y/little-math-lab>（无许可证，0★，2026-10-14 创建）
- open-spaced-repetition/ts-fsrs：<https://github.com/open-spaced-repetition/ts-fsrs>（MIT，852★，2026-11-04 更新）
- open-spaced-repetition/fsrs4anki：<https://github.com/open-spaced-repetition/fsrs4anki>（MIT，4,116★）
- open-spaced-repetition/py-fsrs：<https://github.com/open-spaced-repetition/py-fsrs>（MIT，v6.3.2）
- josdejong/mathjs：<https://github.com/josdejong/mathjs>（Apache-2.0）
- ManimCommunity/manim：<https://github.com/ManimCommunity/manim>（MIT，~41,800★）
- geogebra/geogebra：<https://github.com/geogebra/geogebra>（许可证见第 2.14 节）
- LReyes21/mmc-games-hub：<https://github.com/lreyes21/mmc-games-hub>（hub 代码 MIT）

### 许可证与文档来源

- mathigon 各库许可证（jsDelivr）：`@mathigon/core` 1.1.24 MIT；`@mathigon/fermat` 1.1.23 MIT；`@mathigon/hilbert` MIT；`@mathigon/studio` MIT AND CC-BY-SA-4.0 AND OFL-1.1
- mathigon/textbooks 为 UNLICENSED：见其 AGENTS.md（fork liangdabiao/textbooks）
- GeoGebra 许可证：<https://www.geogebra.org/license>；另见 Wikipedia "GeoGebra" Licensing 一节
- PhET 许可：<https://phet.colorado.edu/en/licensing>（CC BY 4.0）
- nerdamer：<https://nerdamer.com/>（Apache-2.0）；延续版说明见 npm `nerdamer-prime`
- FSRS 算法说明：<https://github.com/open-spaced-repetition/awesome-fsrs/wiki/The-Algorithm>

### 前置报告

- 全球数学教程调研：`docs/research/best-math-tutorials-worldwide-20261106/`（PhET、Mathigon、GeoGebra、Manim 的首轮结论）
- NB实验室调研：`docs/research/nb-lab-20261106/report.md`
- NB数学实验调研：`docs/research/nb-math-lab-20261106/report.md`
