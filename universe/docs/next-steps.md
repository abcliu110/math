# 数学小宇宙：接下来要做的底层工作（交接文档）

> 读者：接手这个项目的其他模型或开发者。
> 写于 2026-11-08，对应 `main` 的 `ffa3c18`。
> 本文只讲**还没做的底层**。已做的接口见 `kernel-api.md`，总设计见 `design-v2.md`，数学本质见 `essences.md`。

---

## 0. 目标与现状

### 0.1 远景

一个统一的数学实验室：
1. 统一的底层数学原理；
2. 器材都能互相连线；
3. 系统能理解数学原理；
4. 能拆解初中及以下（1–9 年级）全部知识点；
5. 简单易用；
6. 实验过程中数学过程清晰可见；
7. 数学模型和现实世界连起来。

### 0.2 已经有的底层

| 能力 | 在哪里 |
|---|---|
| 场景图 + 纯函数求值 + 世界时钟；环上必须有有状态器材 | `js/core/world.js` |
| 精确有理数；符号精确数 a + b√c + pπ | `js/core/rational.js`、`js/core/kinds.js`（`U.Real`） |
| 值类型注册表：num、bool、dist、fn、point、seq、real、set、vec、expr（一元多项式）、graph、fig（图形） | `js/core/kinds.js`、`kinds-more.js`、`figure.js` |
| 近似标记沿连线传播，显示 ≈ | `world.js` 的 `approx` |
| 单位与量纲（不同单位不能相加） | `U.Dim`（`rational.js`） |
| 图形对象模型：度量、变换、全等相似，全部有理数判定 | `js/core/figure.js`、`packs/figure.js` |
| 器材注册 + lint（属性 ≥3、输出要声明 kind 和 dim、compute 必须是纯函数、id 不能重名） | `js/core/registry.js` |
| 容器与层级、打包器材、控件自动选型 | `world.js`、`macro.js`、`registry.js` |
| 按性质判分、陷阱、三层提示、证据等级、问题结构 lint、参数化变式 | `judge.js`、`evidence.js`、`problem.js`、`variants.js` |
| 学习数据层：事件流、复习、错题本、报告、断点续做、分享、作业 | `events.js`、`review.js`、`learning.js`、`session.js`、`share.js` |

规模：56 种器材，六十多道题。内核测试约 290 项，界面验收 37 项，全部通过。

### 0.3 还缺的四块底层

| 编号 | 任务 | 补的是远景里的哪一条 |
|---|---|---|
| A | 来历追踪：每个值记得自己是怎么算出来的 | 6 过程可见，3 理解原理 |
| B | 方程、多元代数式、区间，以及连线时真正执行类型转换 | 1 统一原理，2 器材互连，4 拆解知识 |
| C | 数据表、拟合器、建模题模板 | 7 连接现实世界 |
| D | 知识点覆盖表：做成数据，加工具和 lint | 4 拆解知识（可衡量） |

**按 A → B → C → D 的顺序做。** A 会改求值器，B 依赖 A 的追踪来展示变形步骤。C 和 D 互相独立，可以并行。

不在本文范围（以后再做）：低年级句子卡和免打字预测的界面、六级台阶界面、证明类器材的台面外形、触屏手势、88 个旧实验的迁移、大规模补充器材和题目。

---

## 1. 开工前必须知道的规则

### 1.1 精确优先

- 能精确就精确：有理数用 `Q`，根号和 π 用 `U.Real`。
- 只有物理模拟、三角函数数值、极限逼近允许近似。近似值必须带 `exact: false`（`U.val(kind, data, { exact: false })`），界面会自动显示 ≈。
- **判定**（相等、全等、平行……）一律用精确运算，不用浮点比较。图形模型就是这样做的：它只比距离的平方、叉积、点积。
- 判分里对近似值不能用精确相等。数据形式的 `when` 写 `=` 会被参考解回归测试拦下；函数形式请用 `W.near(e, port, x, tol)`。

### 1.2 加东西只改一处

- **新值类型**：调 `U.defineKind(id, { label, color, eq, show, … })`，自动获得 `serialize/parse`。可选 `toProp`（能否驱动属性）、`showApprox`、`brief`（连线气泡里的短名）、`to`（可以转换成哪些 kind）。
- **新器材**：写在 `packs/*.js` 里，通过 `U.registerPack({ id, version, types })` 注册。器材合同见 `kernel-api.md`。
- **新题目**：写在 `problems/*.js` 里。**每道题都必须**在 `tests/solutions.js` 里写一条参考解。

### 1.3 新增文件时要手动改的清单

很容易漏，漏了也不会马上报错：

1. `index.html`：加 `<script>`，注意顺序。core 在 packs 之前；新的 kind 文件放在 `registry.js` 之前。
2. `tests/run.js` 第 6 行的 `files` 列表：只列 core 文件，packs 和 problems 会自动加载。
3. `tools/check-types.js` 第 6 行的 `files` 列表：如果新器材用到新 kind，这里要加上 kind 文件。
4. `js/core/loader.js` 的 `PACK_FILES`：新增器材包时加上包名。
5. `docs/kernel-api.md`：写接口说明。

### 1.4 验证命令（每批改动都要全部跑）

```bash
cd universe
node tests/run.js                  # 内核测试（含每道题参考解回归、所有器材 lint、题库结构 lint）
node tools/check-types.js          # 器材自检
node tools/build-standalone.js     # 生成 dist/universe-standalone.html（dist/ 不入库）
node tests/ui.js                   # 界面验收（需要 playwright）
```

关于 playwright：
- 仓库里没有 `package.json`。请在临时目录 `npm install playwright@1.48.2`，用 `NODE_PATH` 指向它。
- 如果 Chromium 下载被网络拦住，可以用系统里的 Chrome：写一个包装脚本，把 `chromium.launch` 换成带 `executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe'` 的版本，再 `require('…/tests/ui.js')`。

### 1.5 提交规则

- 直接在 `main` 上提交，每一批改动一个提交，推送到 `git@github.com:abcliu110/math.git`（SSH）。
- **不要提交** `universe/tests/shots/*.png`（每次跑界面测试都会变），也不要提交仓库根目录下的 `*.bat`、`*.log`、`commit-msg*.txt`。
  可以用 `git add -- universe ':!universe/tests/shots'`。
- **同一时间只让一个会话改这个文件夹。** 之前有两个会话同时往 `main` 提交，一个会话的改动被另一个会话的提交顺手带走了。如果要并行，请用独立的 git worktree。

### 1.6 已经踩过的坑

| 坑 | 现状 / 做法 |
|---|---|
| 器材 id 重名会被悄悄覆盖（新三角形 `tri` 覆盖了旧的） | 已修：`U.define` 会保留先定义的，并记入 `U.packErrors`，测试会检查。起名前先 `grep -n "^      新名: {" packs/*.js` |
| 拖卡片时浏览器接管成原生拖放，之后的 `pointermove` 全被吞掉 | 已修：台面上禁止 `dragstart`，卡片 `user-select: none` |
| 界面测试里浮动属性面板（`#insp`）或选中卡片的名字输入框挡住落点 | 测试前先 `UI.S.inspOpen = false; UI.S.sel = null; UI.Panels.renderInsp()` |
| 器材架变长后，测试要拖的瓦片不在视口里 | `drag` 辅助函数里先 `scrollIntoViewIfNeeded()` |
| 开场就满足的里程碑不给分 | 要先变假再变真才算。写测试时，开场状态要先让条件不成立 |
| 属性少于 3 个过不了 lint | 写 `lint: { minProps: n, why: '理由' }` |
| 输出口没写 `dim` 过不了 lint | 无量纲写 `dim: null` |
| Windows 下 git 提示 LF/CRLF | 只是警告，可以忽略 |

---

## 2. 任务 A：来历追踪（provenance）

### 2.1 为什么要做

现在连线上只看得见结果。比如运算器直接给出 11/15，学生看不到“先通分成 6/15 + 5/15”这一步，系统也说不出这个值是怎么来的。

远景里的“过程清晰可见”和“理解原理”，都需要每个值记得：
- 它从哪些输入来；
- 经过了哪一步；
- 中间有哪些步骤。

### 2.2 数据结构

在 `evaluate` 的结果里，给每个器材加一份追踪：

```js
D[id].trace = {
  inputs: [ { port: 'a', from: 'e3', fromPort: 'v', value: <val> }, … ],   // gather 时就能记下
  props:  { k: { value: 3, driven: true, from: 'e5' } },                     // 生效属性与来源
  steps:  [ { say: '通分：2/5 = 6/15，1/3 = 5/15', value: <val 可选>, rule: 'frac.common-denominator' }, … ],
  outputs: { r: { rule: 'frac.add', say: '分母相同，分子相加' } }           // 每个输出由哪条规则得来
}
```

- `inputs` 和 `props` 由内核在 `gather` 里自动填，器材不用管。
- `steps` 和 `outputs` 由器材在 `compute` 里填。给 compute 的 `ctx` 加两个函数：
  - `c.step(say, value, rule)`：记一步中间过程；
  - `c.because(port, say, rule)`：说明某个输出的规则。
- `rule` 是一个稳定的字符串 id，例如 `'frac.add'`、`'eq.both-sides'`、`'fig.shoelace'`。约定：
  - 规则 id 统一登记在新文件 `js/core/rules.js` 里：`U.RULES[id] = { label, essence: ['E4'], grade: [5, 6] }`；
  - lint 检查器材引用的 rule 都已登记；
  - 判分、报告、解释都按 rule 聚合。
- **追踪必须是纯数据**（可以 JSON 序列化），不能放函数，不能影响计算结果。不开追踪时（`evaluate(scene, { trace: false })`），结果必须和现在完全一样。

### 2.3 接口

```js
U.World.explain(scene, D, id, port)
// 返回这条输出的来历树（递归到没有输入的源器材为止，最多 depth 层，默认 6）：
// { id, name, port, value, rule, say, steps: [...], from: [ <同结构的子树>… ] }

U.World.explainText(tree)   // 把树转成几行人话（给报告、家长端、提示用）
```

判分视图补上 `design-v2.md` §2.1 里写了但还没实现的 `W.from(value, type, inputs)`：判断“这个值是不是由某类器材、从这些输入算出来的”。它要基于 `trace` 实现。

### 2.4 首批要接入追踪的器材

不要一次改完 56 种。先改最能体现“过程”的几种：

| 器材 | 要记的步骤 |
|---|---|
| 运算器 `op` | 分数加减：通分、分子相加、约分。乘除：约分在前还是在后 |
| 数位板 / 竖式类 | 每一位的进位、退位 |
| 带余除法 | 试商、余数小于除数的检查 |
| 天平 `balance` | 左右各是多少、差多少 |
| 量图形 `figmeasure` | 鞋带公式的每一项 |
| 三边定三角形 `tri` | 两边之和与第三边的比较、勾股的平方和 |

其他器材至少要有 `outputs` 的 rule（一句话），lint 先只给警告，不当错误。

### 2.5 界面

- 点连线上的值气泡，或者点卡片读数，弹出“这个数是怎么来的”面板：
  - 一层一层展开来历树；
  - 每一层显示器材名、规则、中间步骤。
- 练习模式第二层提示可以引用来历：例如“你的 11/15 是从这里来的，看看通分那一步”。

### 2.6 验收

- `tests/run.js` 新增“来历追踪”一组测试：
  - 2/5 + 1/3：`trace.steps` 里有通分一步；`explain` 能追到两张数字卡。
  - 关掉追踪时，所有现有测试结果不变（可以对全部参考解比较 `evaluate` 的输出）。
  - 有环（经过记忆器）时 `explain` 不会死循环：遇到有状态器材就停，标记“上一拍的值”。
  - `W.from` 能区分“同样得 6，一个是 192÷32 算的，一个是手填的 6”。
- 界面验收新增：点气泡能打开来历面板，能展开到源头。

---

## 3. 任务 B：方程、多元代数式、区间，以及连线类型转换

### 3.1 连线时真正执行类型转换（先做，量小）

现状：
- `U.kindOK(src, dst)` 只**检查**源 kind 的 `to[dst]` 存在；
- `world.js` 的 `gather` 收集输入时**不做转换**；
- `kinds.js` 里写了 `num → real`，但实际不会转。

要做：
- `gather` 收集输入时，如果源 kind 和口要的 kind 不同，调用 `U.KINDS[src].to[dst](data)` 得到新值。精确标记照传，`dim` 照传。
- lint：`to` 里的每一项必须是函数；转换不得把精确值变成近似值。设计要求有损转换必须经过一个显式的“近似器”器材。
- 首批转换：
  - `num → real`；
  - `num → expr`（常数多项式）；
  - `point → fig`（点图形）；
  - `fig(point) → point`；
  - `seq → set`。

验收：一张数字卡能直接接进只收 `real` 或 `expr` 的口，结果正确；不允许的转换仍然被拒绝，并说明原因。

### 3.2 多元代数式（扩展现有 `expr`）

现在的 `expr` 是一元多项式（系数数组）。改成多元多项式：

```js
// 单项式用排好序的变量指数表示：'x^2*y' ；常数项用 ''
expr = { terms: { '': Q, 'x': Q, 'x^2': Q, 'x*y': Q, … } }   // 系数为 0 的项不存
```

- 兼容：旧的一元系数数组要能转换过来。可以给 `expr` 加版本字段，或者新开一个 kind `poly`，再提供 `expr → poly` 转换，二选一，写进文档。
- 运算：`add`、`sub`、`mul`、`pow(n)`、`subst(var, value)`、`eval(env)`、`eq`（规范化后逐项比较）、`degree`、`vars`、`show`（按次数降序，`x²y` 的写法）。
- 分式（有理式）先不做，在文档里写明。

### 3.3 方程与不等式

新 kind `eqn`：

```js
eqn = { lhs: <expr>, rhs: <expr>, rel: '=' | '<' | '>' | '≤' | '≥' }
```

- **变形步骤是值的一部分。** 天平思想（E4 平衡与等价）：两边同时做同一件事。
  - `U.Eqn.apply(e, { op: 'add' | 'sub' | 'mul' | 'div', by: <expr> })` 返回新方程；
  - 两边乘除负数时不等号要反向，用 `rel` 体现；
  - 乘除 0 要拒绝并说明原因。
  - 每一步都要用任务 A 的 `c.step` 记下来。
- `U.Eqn.solveLinear(e, var)`：一元一次方程给出解；无解或有无穷多解时说明。
- `U.Eqn.isIdentity(e)`：`lhs − rhs` 规范化后为 0，就是恒等式，对应 E8 变量与任意性：“对所有 x 成立”和“对某个 x 成立”的区别。
- 方程组：二元一次方程组用消元法求解，每一步都记录。
- 区间 kind `interval`：`{ lo, hi, loOpen, hiOpen }`，允许无穷端。不等式的解集用它表示。
- 一元二次方程：判别式和求根公式要用 `U.Real` 给出精确根（例如 1 ± √2）。

### 3.4 首批器材

| 器材 | 作用 |
|---|---|
| 代数式卡 | 输入一个式子（有字母），输出 `expr`。需要一个小的式子解析器，只支持整式，数字、字母、+ − ×、乘方、括号 |
| 方程台 | 输入两个 `expr`，输出 `eqn`；属性选“两边同时做什么”；输出变形后的方程和“现在 x = ?” |
| 代入器 | 把 `expr` 或 `eqn` 里的字母换成数，输出数或真假 |
| 方程组台 | 两个 `eqn` 进，解出来 |
| 不等式数轴 | 把 `interval` 画在数轴上 |

已有的“解方程天平”（`eqscale`）和“变量盒”（`variable`）：
- 能输出 `eqn` 或 `expr` 的，加输出口；
- 原有读数不变，参考解回归必须全部通过。做法同“旧几何器材输出图形值”那次提交 `ffa3c18`。

### 3.5 验收

- 规范化：`(x+1)(x−1)` 等于 `x² − 1`；`2(x+y)` 等于 `2x + 2y`。
- 3x + 5 = 20，经过“两边减 5”“两边除以 3”得到 x = 5，每一步都有追踪。
- −2x > 4，两边除以 −2，得到 x < −2，不等号反向。
- 两边乘 0 被拒绝并说明。
- x² − 2x − 1 = 0 的根精确显示为 `1 + √2` 和 `1 − √2`。
- `x + y = 5, x − y = 1` 解得 x = 3, y = 2。
- `(x+1)² = x² + 2x + 1` 判为恒等式；`x² = 4` 判为方程。

---

## 4. 任务 C：数据表、拟合器与建模

### 4.1 新 kind `table`

```js
table = { cols: [ { name: '时间', dim: 'time' }, { name: '路程', dim: 'length' } ], rows: [ [Q, Q], … ] }
```

- 每一列可以有量纲，用 `U.Dim`，这样单位能一路带下去。
- 实测数据可能是小数：录入时用 `Q.fromNumber` 转成有理数。数据本身算精确（它就是这么测的），拟合结果按 4.2 的规则标精确或近似。

### 4.2 器材

| 器材 | 作用 |
|---|---|
| 数据表 | 学生可以在卡片上增删行、改数；输出 `table`；也能接一个 `seq` 或时钟采样进来生成表 |
| 取列 | `table` → `seq`（某一列），方便接已有的统计器材 |
| 散点图 | `table` 进，画两列的散点；可以叠一条 `fn` |
| 拟合器 | `table` 进，选模型：正比例 y = kx、一次函数 y = kx + b，以后扩展到反比例、二次。输出 `fn` 和残差。最小二乘在有理数上可以精确求出：正规方程的解是有理数，所以拟合结果精确 |
| 预测器 | `fn` + 一个 x，输出 y，并说明“这是模型给的预测，不是测量值” |

### 4.3 建模题模板

`design-v2.md` 里的 E12（数学建模）。在题目结构里加一个可选字段：

```js
model: {
  situation: '一辆车匀速行驶，每隔 1 小时记一次路程',   // 情境
  quantities: [ { name: '时间', dim: 'time' }, { name: '路程', dim: 'length' } ],  // 量
  relation: 'linear',          // 关系：正比例 / 一次 / 反比例 / 二次……
  check: '用模型预测第 5 小时的路程，再和实测比较'          // 回到情境检验
}
```

- `problem.js` 的 lint：有 `model` 的题，里程碑必须覆盖“选模型”“得到函数”“回到情境检验”三步。
- 证据等级：模型对数据的拟合属于 ①（举例），措辞写“和这些数据吻合”，**不说“一定成立”**。

### 4.4 验收

- 表 (1,60) (2,120) (3,180) 拟合成正比例，k 精确等于 60，残差为 0。
- 带测量误差的表，拟合出的一次函数系数是有理数，并且与手算的最小二乘结果完全相等。
- 单位：时间列加路程列不允许，报量纲错误；拟合出的 k 的量纲是“路程 / 时间”。现状：`U.Dim.div('length', 'time')` 会得到 `'other:length/time'`，界面显示成“没有名字的量”。本任务要给常见的复合量纲起名（速度、单价、密度……），加进 `rational.js` 里 `DIM` 的 `keys`、`names` 和 `mul`/`div` 表，并补测试。
- 一道建模示例题（含参考解）通过题库 lint 和参考解回归。

---

## 5. 任务 D：知识点覆盖表

### 5.1 数据来源

- 仓库根目录 `content/grades/grade-1.js` … `grade-9.js`，每个知识点有形如 `"4.6"` 的 id。用 `grep` 能数出约 136 个，而设计文档写的是 142 个。**先核实总数和差异**，写进文档。
- 题目里的 `points` 字段引用这些 id（目前很多题没写，结构 lint 只给警告）。

### 5.2 要做的

1. `js/core/curriculum.js`：生成或手写知识点表 `U.CURRICULUM = { '4.6': { title, grade, essences: ['E2', 'E4'] }, … }`。
   - 从 `content/grades/*.js` 抽取 id 和标题，写一个一次性脚本 `tools/extract-curriculum.js`，结果入库。
   - `essences` 需要人工判断。先按 `essences.md` 里“出现在哪些知识点”那一栏填。
2. `tools/coverage.js`：输出每个年级、每个知识点：
   - 有几道题，按 core / trap / stretch 分开；
   - 用到哪些器材；
   - 达到的最高证据等级；
   - 每种本质（E1–E12）覆盖了哪些知识点。
   - 还要列出“没有题的知识点”和“没有器材的本质”。
3. lint，加进 `problem.js` 和 `tests/run.js`：
   - 题目的 `points` 必须是表里存在的 id；
   - 设计目标是每个知识点 3 道题（core、trap、stretch），先只做报告，不当错误。
4. 给现有六十多道题补 `points`。这是内容工作，可以和别的任务并行。

### 5.3 验收

- `node tools/coverage.js` 能跑出完整报告，数字和人工抽查一致。
- 所有题目的 `points` 都在表里，测试 0 错误。
- 报告写进 `docs/coverage.md`，并记录日期。

---

## 6. 总验收表

| 任务 | 必须通过 |
|---|---|
| A | 2.6 全部；关掉追踪时现有测试结果不变；内核、界面、器材自检全绿 |
| B | 3.1、3.5 全部；旧器材参考解回归不变 |
| C | 4.4 全部 |
| D | 5.3 全部 |
| 每一批 | `node tests/run.js`、`node tools/check-types.js`、`node tests/ui.js`、单文件版无控制台报错；`kernel-api.md` 更新；一个提交，推送 `main` |

## 7. 交接时请汇报

每完成一个任务，请写清楚：
- 做了什么、改了哪些文件；
- 新接口叫什么；
- 测试数量的变化；
- **哪些没做、为什么**，例如设计取舍、发现的新问题、和本文不一致的地方；
- 遇到和本文写法冲突的现状，以代码为准，并顺手更新本文。

---

## 8. 完成情况（交接汇报，2026-11-09）

| 任务 | 状态 | 提交 | 没做完的 |
|---|---|---|---|
| A 来历追踪 | 完成：trace、explain、W.from、rules.js、6 个器材写步骤、来历面板 | e874fe6 | 其余器材只有 outputs 的规则（未逐个写步骤）；“数位板”步骤是按位的，没有竖式的逐位进退位动画 |
| B 方程与区间 | 完成：连线转换（num→real/expr/poly、point↔fig、seq→set）、poly（多元）、eqn、interval、方程组、二次根、代数式卡 / 方程台 / 代入器 / 方程组台 / 解集数轴 | 91f23d4、95c5027、fd387f8 | 分式（有理式）未做；expr 只有一元，没有器材只收 expr 口（num→expr 转换已声明）；解方程天平的 eqn 输出只到 x 的一次式 |
| C 数据与建模 | 完成：table、正比例与一次拟合（精确）、复合量纲（速度、单价、密度）、数据表 / 取列 / 散点图 / 拟合器 / 预测器、建模模板 lint、示例题 | 4596034 | 散点图已能叠加拟合直线（接拟合器的 f 口到散点图的 line 口，坐标范围含直线两端）；数据表用文字录入，没有表格式编辑；建模题只有一道示例 |
| D 知识点覆盖表 | 完成：142 个知识点、生成脚本、lint、覆盖报告；第二批人工映射后 39 个知识点有题 | b855851、本次 | **只有 39 个知识点有题**；多数旧主题词（“守恒”“不变量”“反例”等）不是年级知识点，无法对应，题目 points 为空（只有警告）；本质的草稿需要人工核对（essenceSource: draft） |

**验证（每批）**：内核测试 359 项，界面验收 38 项，`check-types` 66 种器材，单文件版无控制台报错，`docs/coverage.md` 已更新。

**下一位接手的人请先做**：D 的内容工作——逐题人工把主题词对应到知识点 id，并核对 `js/core/curriculum.js` 里的本质草稿；然后每个知识点补到 3 道题（核心、陷阱、延伸）。
