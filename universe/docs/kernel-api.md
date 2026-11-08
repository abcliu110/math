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
