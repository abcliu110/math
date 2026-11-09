# 内核接口速查

加载顺序（index.html 同）：`rational → kinds → registry → world → kit → judge → events → packs/* → problems/* → ui/*`。内核无 DOM，node 可直接测（`tests/run.js` 用 `vm` 加载）。

## 场景
`{v:2, nid, seq, entities:{id:{id,type,name,x,y,props,state?,role?}}, links:[{id,from,fromPort,to,toPort}], clock:{t,n,running,hz,rate,seed}}`，全部 JSON 可序列化。

## 唯一改动入口 `U.World.act(scene, intent)`
`add / move / rename / set / link / unlink / del / copy / reset / resetstate / clear / tidy / clock`；返回 `{ok, why?, id?}`。失败时场景不变，`why` 是给学生看的一句话。

## 求值
- `evaluate(scene)` 纯函数 → `D[id] = {out, sig, inp, props, driven}`
- `tick(scene)` 世界走一拍：所有有状态器材同时 `step`，随机用 `U.rand(seed,id,n,k)`，同台面同拍数结果一致
- 规则：连线可成环，但环上必须有“有状态器材”；否则 `link` 拒绝并给出原因

## 加一种器材（只改一个文件）
```js
U.registerPack({ id:'mypack', types:{ foo:{
  label:'某器材', group:'数与运算', props:{...≥3个可写属性}, inputs:{...}, outputs:{...},
  compute(c){ return { out: U.val('num', U.Q(1)) }; },   // 或 init/step/read（有状态）
  icon(){ return '<svg 内容 64×44>'; }, size(){ return [150,90]; }, draw(c){ return '<svg 内容>'; }
}}});
```
不合 lint（缺 icon/draw/size、属性少于 3 且无豁免理由、compute 改了输入、默认值非法……）进不了注册表。`node tools/check-types.js` 先自检。

## 加一道题（problems/*.js）
`{id,title,grade,domain,points,hook,shelf,build(),predict?,milestones:[{id,say,score,when,hints:[3层],glow?}],traps,goal,why,ref}`。
`when` 用数据形式或函数；开场已满足的里程碑必须先变假再变真才给分。

## 参考解回归（新增题目必做）
`tests/solutions.js` 里每道题一条参考解（`h.add/link/set/role/run`）。`node tests/run.js` 会逐题自动搭一遍并要求通关；缺参考解的题目直接报错。
`tests/run.js`、`tools/check-types.js` 会自动加载 `packs/*.js` 和 `problems/*.js`；`index.html` 里的 `<script>` 仍需手动加一行。

## 复习与报告 `U.Review.summarize(log, problems, now)`
只读事件流现算，不另存。返回 `{byProblem, domains, due, totals}`。到期规则：最近一次没满分、或踩过陷阱 → 紧急；否则按 1/3/7/14 天间隔。界面：实验库顶部“今天该复习”、菜单 → 学习报告。

## 学生出题 `U.Author`
“最终检验是学生当作者”的第一步：学生出一道**凑数题**（给几个数 + 一个目标数）。
- `validate(spec)`：系统先用精确有理数把 + − × ÷ 的所有组合解一遍，**解不出来的题不让发布**，并给出参考做法
- `make(spec)` 生成和内置题同构的 problem；`add/remove/list/loadAll` 存在 localStorage（`universe-custom-v1`）
- 菜单：出一道凑数题… / 导出我的题 / 导入题目（JSON 文件可发给同学）
- 还没做：更一般的“出题”（任意目标性质、任意器材限制）、老师审核与布置。
- 属性可带 `hidden: true`：不在属性面板显示，但器材内部可用（例如天平里“盒子的真实重量”）。

## 打包器材（js/core/macro.js）

`U.defineMacro(id, spec)` 把一段无状态的台面封成一个新器材。
- `spec.scene`：W.blank() 形状的场景，里面的器材 id 指向 `scene.entities`。
- `spec.inputs` / `spec.outputs`：`{名: {id, port}}`，指向内部器材的口。输入口和输出口的类型取内部那个口的类型。
- 内部不能有有状态器材（记忆器、时钟、骰子…），否则抛错。
- 计算方式：克隆内部场景，给每个输入口加一个内部引脚（`pin_<类型>`，值从 `U.__pins` 取），然后 `W.evaluate` 一遍，取输出口。
- 引脚器材是隐藏的（`hidden: true`），不出现在器材架上。

**还没做**：学生在界面里把选中的器材封装成新器材（需要选择输入输出口的界面）；打包器材的保存（现在只在代码里定义，刷新后消失）。

## 第 1 阶段内核补充（设计 v2 第 1 节）

- **精确标记（1.9）**：输出值带 `exact`。上游只要有一个是近似的，下游输出也标为近似（显示 ≈）。有状态器材声明 `exact: false` 时，它的读出也是近似的。
- **值类型（1.7）**：每种 kind 默认带 `serialize/parse`（JSON 往返）。可选 `toProp(v, P)` 决定它能不能驱动属性，`showApprox` 决定近似时的显示。`U.lintKind` 检查注册是否合格。
- **符号精确数 real（1.7）**：`U.Real` 提供 `from / pi / sqrt / add / mul / approx / show`，值为 `{a, b, c, p}`，表示 `a + b√c + pπ`。不能精确表示的运算（如 √2 + √3）返回 `null`。
- **属性控件（1.1.1）**：`U.controlFor(P)` 按声明选控件（choice 2–5 个 → segment，bool → switch，小整数 → stepper，其余 → slider，角度 → dial，expr → expr）。器材可用 `control` 覆盖，lint 检查覆盖是否合法。界面已实现 segment、switch、select、text；有范围的数字用滑杆（slider）、角度用转盘（dial），数字框始终保留。expr 控件还没有器材用到，暂不做界面。
- **容器（1.10）**：器材声明 `slots: { 名: { accepts, max, layout, fullWhy?, rejectWhy? } }`。动作 `put {id, parent, slot}` 放入，`take {id}` 取出，`del {id, keep: 'out' | 'all'}` 删除容器（默认把里面的东西倒到台面上）。移动容器时子实体跟着动。布局：`grid2x5`、`onAxis`、`free`。计算时 `ctx.kids(slot)` 给出子实体。判分视图 `W.children(e, slot)`、`W.parentOf(e)`。
- **存档迁移（1.4）**：`W.load` 按版本逐级升级，当前版本 `W.CURRENT_V = 3`（v3 增加 parent/slot）。比当前版本新的台面拒绝打开。
- **器材包（1.8）**：`needs: ['core@1']` 缺失或版本太低时写入 `U.packErrors`。`U.packsFor(scene)` 给出台面需要的包。浏览器里的按需加载还没做，目前 index.html 仍一次加载全部包。
- **近似值判分（1.9）**：数据形式的 when 里，近似值用 `=` / `!=` 会记入 `U.inexactReads`，参考解回归测试据此失败；函数形式的 when 请用 `W.near(e, port, x, tol)`。
- **单文件版**：`node tools/build-standalone.js` 生成 `dist/universe-standalone.html`。

## 第 2 阶段框架（设计 v2 第 2.1、2.7 节）

- **问题结构 lint**：`U.problemLint(p)` 检查一道题的结构（id、title、里程碑、goal、台阶 rung 1–6、level、evidence、predict、claim）；`U.problemLintAll(list)` 检查整个题库，并统计函数形式条件的占比（上限 20%，超过给出警告）。错误不阻止运行，测试里题库必须 0 错误。
- **条件写法**：里程碑和陷阱的条件可以写 `when`（数据形式，首选）或 `test`（函数）。函数形式没写 `why_code` 会得到警告。
- **证据等级**：`U.Evidence.emit(kind, data)` 由证明类器材调用，写入事件流。`U.Evidence.levelOf(events, {pid, approx})` 判定等级（① 举例、② 没找到反例、③ 穷举、④ 结构证明、refuted 已被推翻），近似值最高到 ②。`U.Evidence.wording(res)` 给出跟等级走的措辞。
- **证据事件约定**：`counterexample {found}`、`scan {range, counterexamples}`、`enumerate {count, expected}`、`proof {steps, filled}`、`induction {base, step}`。
- **还没做**：证明类器材本身（猜想板、参数扫描器、反例构造器、系统枚举器、证明脚手架、归纳阶梯，属于 `pack-proof`）；六级台阶和句子卡的界面；2.3 多解指纹；88 个旧实验的迁移与改写。
- **搭法指纹（2.3）**：`U.Judge.fingerprint(scene)` = 器材类型多重集 + 每根线的“来源类型.端口 > 目标类型.端口”，与器材 id 和位置无关。完成时指纹不在 `problem.ref` 里，记为 `newWay`（你找到了一种新做法）。
- **误解信号（2.4）**：`U.Inquiry.misconceptions(events, problems)`：同一知识点上，同一个错误猜测（finish 事件 match 为 false）出现 ≥2 次，才返回误解。
- **实验报告（2.5）**：`U.Inquiry.report(events, pid, problems)` 返回四栏：我猜的（预填）、我试了什么（里程碑、提示、踩中的陷阱）、我发现了（证据等级与措辞，原话与笔记留给学生）、我还想问（空）。
- **参数化与变式（2.1）**：题目可写 `params: { 名: [最小, 最大] }`，`U.Variants.instantiate(p, seed)` 按种子生成确定的一组数，`build(values)` 收到这些值。种子打散后相邻种子也得到不同的数。
- **句子卡（2.5）**：`explain: { form: 'cards' | 'free', frame: '因为 __ × __ = __' }`，lint 检查 cards 形式至少有一个空，`U.Variants.blanks(frame)` 数空。
- **考试时长（2.1）**：`U.Variants.examMinutes(p)`：写了 `exam.minutes` 用它；否则里程碑数 × 2 分钟，最少 3 分钟。
- **证明计算内核（2.7）**：证明类器材只负责把台面条件交给这些纯计算函数，算完自动记入证据事件。`U.Evidence.scanRange(from, to, pred)`（参数扫描器 / 反例构造器）、`U.Evidence.enumerate(items, expected, pred)`（系统枚举器）、`U.Evidence.proof(steps)`（证明脚手架，每步要有 ref 才算填完）、`U.Evidence.induction(base, stepOk, upto)`（归纳阶梯）。找到反例即推翻。
- **实验报告界面（2.5）**：做完一道题的结果对话框里有“实验报告”按钮，打开四栏视图（我猜的、我试了什么、我发现了、我还想问）。第四栏只在当前页面里，还没有保存。
- **其余首批值类型（1.7）**：`set`（有理数的有序去重集合，`U.SetV.of / has / union / inter`）、`vec`（有理数分量的向量）、`expr`（一元多项式，`U.Expr.add / mul / eq / eval / show`，供方程和恒等式）、`graph`（n 个点的无向简单图，`U.Graph.of / degree`）。每种都有 eq / show / serialize / parse，并通过注册 lint。
- **器材包按需加载（1.8）**：`U.PACK_FILES` 是包清单（包 id → 脚本路径）；`U.ensurePacks(ids)` 只加载还没注册的包，清单里没有的报 missing；`U.packsNeeded(problem, scene)` 由题目的 shelf 和台面的器材类型算出需要的包。index.html 目前仍一次加载全部包。

## 第 3、4 节数据层（设计 v2）

- **复习规则（3.2）**：`U.Learning.nextReview(r)` 只有一套规则；`U.Learning.mastery(events, problems, now)` 按每题最近一次结果给出下次复习（同一陷阱第二次踩中标“反复出现”）。
- **错题本、考试报告、改进清单、家长周报（3.1 / 3.4 / 3.5）**：`U.Learning.wrongBook`、`examReport`（错因 6 个标签，没有陷阱解释的里程碑要学生自选）、`nextPractice`（只在丢分时推荐，陷阱题优先）、`healthCard`（体检表）、`improvements`（规则化建议）、`parentWeek`。
- **断点续做（3.2.1）**：`U.Session.start / record / replay / remaining / resume`。开场快照 + 操作序列重放得到同一台面；考试剩余时间 = 限时 − 已用时间，刷新时记 `resume`。
- **事件压缩（3.1）**：`U.Session.compact(log, now, days)` 过期事件只保留每题最近一次结果。
- **台面分享（4.1）**：`U.Share.encode(scene)` → base64url 文本（含用到的打包器材定义，`U.MACRO_SPECS`）；超过 8 KB 改为文件。`U.Share.decode(text)` 登记器材并载入台面。
- **作业（3.3）**：`U.Share.assignment(title, pids, due)` 生成作业码；`resultFile` 生成学生交回的结果；`classSummary` 按班汇总达成率与陷阱。
- **出题自检（4.2）**：`U.Share.selfCheck(goals, opening)`：台面满足目标才可以发布，空台面不能已经满足。
- **打包器材定义（4.3）**：`U.defineMacro` 把定义存进 `U.MACRO_SPECS`，分享时随台面带走。

**仍然没有的（需要界面或内容）**：学习数据和作业的界面（做完页、错因选择、老师导入、家长端页面）；台面分享与“我的实验”的界面；学生出题的界面；预测的三种免打字形式（pick / place / more-less）的界面；证明类器材的界面与行为；88 个旧实验的迁移。
- **做完页（3.4）**：交卷或做完后的结果对话框：没达成且没有陷阱解释的里程碑，要选一个错因（6 个标签，记 `reason` 事件）；下面列出“下一步练什么”；有没达成的里程碑时，默认按钮是“回去做这一步”。

## 图形对象模型（js/core/figure.js，packs/figure.js）

图形是一种能在连线上流动的值（kind `fig`），和数、点、函数一样。

- **值**：`{ type: 'point' | 'segment' | 'polygon' | 'circle', pts: [{x, y}…], r2? }`。坐标全部是精确有理数；圆用圆心和半径的平方表示（半径可以是无理数）。
- **原则**：全等、相似、直角、平行、垂直、点在线上这些判定，只用距离平方、叉积、点积做有理数运算，不开方、不用浮点。只有“显示一个角的度数”是近似值。
- **度量**：`U.Fig.area`（多边形用鞋带公式，圆是 π r²，都精确）、`perimeter`（根号能合并时精确，如 4 + 2√2；不同根号相加时只给近似值，并标 ≈）、`len`、`isRight`、`angle`。
- **变换**：`translate`、`rotate90`、`reflect`（关于过两点的直线）、`scale`（有理数倍）。有理数坐标进、有理数坐标出。
- **关系**：`congruent`、`similar`（返回相似比的平方 k2）、`parallel`、`perpendicular`、`onSegment`、`onCircle`。对应关系自动找（顶点起点和方向都试）。
- **器材**（图形组）：三角形 `ftri`、四边形 `fquad`、圆 `fcirc` 产生图形；图形变换 `xform`；量图形 `figmeasure`（面积、周长、顶点数、直角个数）；图形关系 `figrel`（全等、相似、相似比）。面积等读数是普通的数，可以继续接进运算器。
- **连线气泡**：kind 可以提供 `brief`，连线上只显示短名（如“三角形”），完整坐标在悬停和读数里。
- **器材 id 必须唯一**：`U.define` 遇到重名会保留先定义的，并记一条 `U.packErrors`（之前重名会被悄悄覆盖）。

旧几何器材已接入：长方形 `rect`、平行四边形 `parallelogram`（另有“剪拼成的长方形” `cut`）、三边定三角形 `tri`（第三个顶点坐标是有理数时才输出图形，否则说明原因）、折纸 `fold`（纸片）都多了一个图形输出口，原有读数不变。

没接入的及原因：按角度给的三角形 `angles` 和正多边形 `polygon` 的顶点坐标一般要用三角函数，不是有理数，放进图形值会破坏“判定全部精确”的原则，所以暂不输出图形。

还没做：一般角度的旋转（只有 90° 的倍数是精确的）、把一个多边形真正切开再拼、圆和直线的交点。
- **错题本界面（3.1）**：菜单 → 错题本，列出没达成的里程碑和踩中的陷阱，点一道题回去再做。

## 来历追踪（任务 A，见 next-steps.md）

- **规则登记**：`js/core/rules.js` 的 `U.RULES[id] = { label, essence, grade }`，`U.defineRule`。器材引用未登记的规则会记入 `U.ruleErrors`。
- **trace**：`evaluate(scene)` 的 `D[id].trace = { inputs, props, steps, outputs }`，纯数据。`evaluate(scene, { trace: false })` 不记追踪，求值结果不变。
- **器材里写步骤**：compute 的 `ctx` 有 `c.step(say, value, rule)` 与 `c.because(port, say, rule)`。已接入：运算器、带余除法、数位板、天平、三角形、量图形。
- **来历树**：`W.explain(scene, D, id, port, depth)`，遇到有状态器材停止并标“上一拍的值”；`W.explainText(tree)` 转成几行人话。
- **W.from(value, type, inputs)**：判断值是不是由某类器材、从这些输入算出来的（手填的同一个数不算）。
- **界面**：连线气泡上的“？”打开来历面板，逐层展开。
