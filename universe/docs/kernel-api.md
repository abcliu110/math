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
