# 知识点覆盖报告

> 由 `node tools/coverage.js` 生成，日期 2026-11-18。数据来自 `js/core/curriculum.js` 与 `problems/*.js`。

## 总览

- 知识点：142 个（设计目标 142）
- 有题的知识点：141 个（99%）
- 题目：601 道；没有对应知识点的题：1 道
- 没有器材的本质：无
- 没有题的本质：无

## 按年级

| 年级 | 知识点 | 有题 | 题目数 |
|---|---|---|---|
| 1 | 16 | 16（100%） | 50 |
| 2 | 16 | 16（100%） | 55 |
| 3 | 16 | 16（100%） | 84 |
| 4 | 17 | 17（100%） | 90 |
| 5 | 14 | 14（100%） | 99 |
| 6 | 15 | 14（93%） | 57 |
| 7 | 16 | 16（100%） | 78 |
| 8 | 16 | 16（100%） | 74 |
| 9 | 16 | 16（100%） | 40 |

## 按知识点

| 知识点 | 年级 | 名称 | 核心 | 陷阱 | 延伸 | 最高证据 | 器材 |
|---|---|---|---|---|---|---|---|
| 1.1 | 1 | 数数、一一对应、比多少 | 3 | 0 | 0 | 1 | pairbench |
| 1.2 | 1 | 位置 | 1 | 1 | 0 | 1 | numlinebench |
| 1.3 | 1 | 1–5的认识、分与合 | 2 | 1 | 0 | 1 | numlinebench、makebench |
| 1.4 | 1 | 5以内加减法、0 | 1 | 1 | 0 | 1 | numlinebench |
| 1.5 | 1 | 立体图形 | 1 | 1 | 0 | 1 | solidbench |
| 1.6 | 1 | 6–10的认识、连加连减 | 2 | 1 | 0 | 1 | termsbench、numlinebench |
| 1.7 | 1 | 11–20的认识、10加几 | 2 | 1 | 0 | 1 | blocksbench、groupbench |
| 1.8 | 1 | 认识钟表 | 1 | 1 | 0 | 1 | clockbench |
| 1.9 | 1 | 20以内进位加法、凑十法 | 4 | 1 | 0 | 1 | numlinebench、makebench |
| 1.10 | 1 | 平面图形、七巧板 | 1 | 1 | 0 | 1 | areamodel、tribench |
| 1.11 | 1 | 20以内退位减法、破十法 | 2 | 1 | 0 | 1 | numlinebench、makebench |
| 1.12 | 1 | 分类与整理 | 2 | 1 | 0 | 1 | sortbench |
| 1.13 | 1 | 100以内数的认识 | 4 | 0 | 0 | 1 | blocksbench、num |
| 1.14 | 1 | 认识人民币 | 4 | 1 | 0 | 1 | moneybench |
| 1.15 | 1 | 100以内加减法（一） | 1 | 1 | 0 | 1 | blocksbench |
| 1.16 | 1 | 找规律 | 6 | 0 | 0 | 1 | num、meter、conjbench、fmachine、guessrule、proofbench、seqbench |
| 2.1 | 2 | 长度单位、线段 | 2 | 1 | 0 | 1 | rulerbench |
| 2.2 | 2 | 100以内加减法（二） | 9 | 1 | 0 | 1 | vertbench、estbench、arithbench |
| 2.3 | 2 | 进位加法、退位减法 | 6 | 1 | 0 | 1 | blocksbench、arithbench、colbench |
| 2.4 | 2 | 角的初步认识、直角 | 2 | 1 | 0 | 1 | tribench、anglebench |
| 2.5 | 2 | 乘法初步认识、口诀 | 3 | 1 | 0 | 1 | numlinebench、areamodel、tapebench |
| 2.6 | 2 | 观察物体 | 1 | 1 | 0 | 1 | solidbench |
| 2.7 | 2 | 认识时间 | 1 | 1 | 0 | 1 | clockbench、ratiobench |
| 2.15 | 2 | 搭配（一） | 1 | 1 | 0 | 1 | areamodel |
| 2.14a | 2 | 数据收集整理 | 1 | 1 | 0 | 1 | statbench |
| 2.8 | 2 | 除法初步认识 | 2 | 1 | 0 | 1 | numlinebench |
| 2.9 | 2 | 图形的运动 | 2 | 1 | 0 | 1 | foldbench、euler |
| 2.10 | 2 | 混合运算 | 1 | 1 | 0 | 1 | termsbench |
| 2.11 | 2 | 有余数的除法 | 3 | 0 | 0 | 1 | groupbench、calbench、modclock |
| 2.12 | 2 | 万以内数的认识、近似数 | 4 | 0 | 0 | 1 | blocksbench、num、sqrt、round |
| 2.13 | 2 | 克和千克 | 1 | 1 | 0 | 1 | ratiobench |
| 2.14b | 2 | 推理 | 3 | 0 | 0 | 1 | logicbench、nim |
| 3.1 | 3 | 时、分、秒 | 1 | 1 | 0 | 1 | ratiobench、clockbench |
| 3.2 | 3 | 万以内加减法 | 3 | 1 | 0 | 1 | blocksbench、estbench |
| 3.3 | 3 | 测量 | 1 | 1 | 0 | 1 | ratiobench、rulerbench |
| 3.4 | 3 | 倍的认识 | 9 | 1 | 0 | 1 | tapebench、numlinebench |
| 3.5 | 3 | 多位数乘一位数 | 2 | 1 | 0 | 1 | areamodel、mulbench |
| 3.6 | 3 | 长方形和正方形 | 3 | 1 | 0 | 1 | areamodel |
| 3.7 | 3 | 分数的初步认识 | 5 | 1 | 0 | 1 | ratiobench、numlinebench |
| 3.8 | 3 | 集合 | 7 | 1 | 0 | 1 | vennbench |
| 3.9 | 3 | 位置与方向 | 3 | 1 | 0 | 1 | numlinebench、dirbench |
| 3.10 | 3 | 除数是一位数的除法 | 1 | 1 | 0 | 1 | vertbench |
| 3.15a | 3 | 复式统计表 | 2 | 2 | 0 | 1 | tablebench |
| 3.11 | 3 | 两位数乘两位数 | 9 | 1 | 0 | 1 | areamodel、mulbench、estbench、arithbench |
| 3.12 | 3 | 面积 | 12 | 0 | 0 | 1 | areabench、areamodel、asn、curved、geoboard、circlebench、optimize、solidbench、turtle |
| 3.13 | 3 | 年、月、日 | 4 | 1 | 0 | 1 | calbench |
| 3.14 | 3 | 小数的初步认识 | 3 | 1 | 0 | 1 | decbench、numlinebench、twoways |
| 3.15b | 3 | 搭配（二） | 3 | 1 | 0 | 1 | combobench、areamodel、euler |
| 4.1 | 4 | 大数的认识、近似数 | 5 | 0 | 0 | 1 | chancebench、num |
| 4.2 | 4 | 公顷和平方千米 | 1 | 1 | 0 | 1 | ratiobench |
| 4.3 | 4 | 角的度量 | 2 | 0 | 0 | 1 | anglebench |
| 4.4 | 4 | 三位数乘两位数 | 10 | 1 | 0 | 1 | mulbench、travelbench |
| 4.5 | 4 | 平行四边形和梯形 | 3 | 1 | 0 | 1 | areabench、cubes |
| 4.6 | 4 | 除数是两位数的除法 | 1 | 1 | 0 | 1 | vertbench |
| 4.7 | 4 | 条形统计图 | 1 | 1 | 0 | 1 | statbench、ratiobench |
| 4.8 | 4 | 优化 | 3 | 1 | 0 | 1 | optbench |
| 4.9 | 4 | 四则运算 | 10 | 1 | 0 | 1 | asn、termsbench、findbug、turtle |
| 4.17 | 4 | 观察物体（二） | 1 | 1 | 0 | 1 | solidbench |
| 4.10 | 4 | 运算定律 | 9 | 1 | 0 | 1 | termsbench、fastbench |
| 4.11 | 4 | 小数的意义和性质 | 1 | 1 | 0 | 1 | decbench |
| 4.12 | 4 | 三角形 | 6 | 0 | 0 | 1 | tribench、curved、areabench、guessrule |
| 4.13 | 4 | 小数的加法和减法 | 2 | 1 | 0 | 1 | decbench |
| 4.14 | 4 | 图形的运动（二） | 3 | 0 | 0 | 1 | gridbench、foldbench |
| 4.15 | 4 | 平均数 | 9 | 0 | 0 | 1 | hanoi、meanbench、chancebench、statbench |
| 4.16 | 4 | 鸡兔同笼 | 11 | 1 | 0 | 1 | swapbench |
| 5.1 | 5 | 小数乘法 | 2 | 1 | 0 | 1 | decbench、estbench |
| 5.2 | 5 | 位置 | 1 | 1 | 0 | 1 | gridbench |
| 5.3 | 5 | 小数除法 | 1 | 1 | 0 | 1 | decbench |
| 5.4 | 5 | 可能性 | 6 | 1 | 0 | 3 | chancebench、pairbench、ptree |
| 5.5 | 5 | 简易方程 | 13 | 0 | 0 | 1 | variable、balancebench、nim、costplan、seqbench、systembench |
| 5.6 | 5 | 多边形的面积 | 7 | 1 | 0 | 1 | areabench、gworkspace、gpt、gpoly、fquad |
| 5.7 | 5 | 植树问题 | 7 | 1 | 0 | 1 | gapbench |
| 5.14 | 5 | 观察物体（三） | 2 | 1 | 0 | 1 | solidbench、twoways |
| 5.8 | 5 | 因数与倍数 | 24 | 0 | 1 | 2 | asn、conjbench、factorbench、hanoi、guessrule、areamodel、modclock、groupbench、primeblocks、proofbench、proofsort、net |
| 5.9 | 5 | 长方体和正方体 | 3 | 1 | 0 | 1 | pour、solidbench |
| 5.10 | 5 | 分数的意义和性质 | 7 | 0 | 0 | 1 | areamodel、ratiobench、fracbench、numlinebench、primeblocks |
| 5.11 | 5 | 分数的加法和减法 | 10 | 1 | 0 | 1 | num、approach、ratiobench、findbug、fracbench |
| 5.12 | 5 | 图形的运动（三） | 1 | 1 | 0 | 1 | gridbench |
| 5.13 | 5 | 折线统计图、找次品 | 4 | 0 | 0 | 1 | weighbench |
| 6.1 | 6 | 分数乘法 | 4 | 1 | 0 | 1 | areamodel、num |
| 6.3 | 6 | 位置与方向（二） | 2 | 1 | 0 | 1 | gridbench、dirbench |
| 6.2 | 6 | 分数除法、倒数 | 7 | 1 | 0 | 1 | fracbench、findbug、jobbench |
| 6.4 | 6 | 比 | 4 | 0 | 0 | 1 | ratiobench、costplan |
| 6.5 | 6 | 圆 | 4 | 1 | 0 | 1 | approach、circlebench、dissect、estbench |
| 6.6 | 6 | 百分数（一） | 2 | 1 | 0 | 1 | ratiobench |
| 6.7a | 6 | 扇形统计图 | 1 | 1 | 0 | 1 | ratiobench |
| 6.7b | 6 | 数与形 | 2 | 1 | 2 | 4 | conjbench、nth、proofbench |
| 6.8 | 6 | 负数 | 2 | 1 | 0 | 1 | numlinebench |
| 6.9 | 6 | 负数运算——为什么负负得正 | 1 | 1 | 0 | 1 | chipbench |
| 6.10 | 6 | 百分数（二） | 2 | 1 | 0 | 1 | ratiobench |
| 6.11 | 6 | 圆柱与圆锥 | 1 | 1 | 0 | 1 | circlebench |
| 6.12 | 6 | 比例 | 9 | 1 | 0 | 1 | ratiobench、fitbench、fmachine、euler、scale、shadow、taxi |
| 6.13 | 6 | 鸽巢问题 | 1 | 1 | 0 | 1 | groupbench |
| 6.14 | 6 | 综合与实践 / 整理和复习 | 0 | 0 | 0 | — | — |
| 7.1 | 7 | 正数和负数、有理数与数轴 | 6 | 1 | 0 | 1 | approach、conjbench、chipbench、numlinebench、proofsort |
| 7.2 | 7 | 有理数的加减法 | 7 | 1 | 0 | 1 | numlinebench、findbug、arithbench、newop |
| 7.3 | 7 | 有理数的乘除法、乘方与科学记数法 | 3 | 1 | 0 | 1 | chipbench、hanoi、num |
| 7.4 | 7 | 整式 | 1 | 1 | 4 | 4 | algebra、proofbench |
| 7.5 | 7 | 整式的加减 | 7 | 1 | 0 | 1 | algebra、termsbench |
| 7.6 | 7 | 解一元一次方程 | 12 | 0 | 0 | 1 | balancebench、findbug |
| 7.7 | 7 | 实际问题与一元一次方程 | 1 | 1 | 0 | 1 | balancebench |
| 7.8 | 7 | 几何图形与直线、射线、线段 | 1 | 1 | 0 | 1 | numlinebench、num |
| 7.9 | 7 | 角 | 4 | 0 | 0 | 1 | curved、conjbench、anglebench、foldbench |
| 7.10 | 7 | 相交线 | 1 | 1 | 0 | 1 | anglebench |
| 7.11 | 7 | 平行线与平移 | 1 | 1 | 0 | 1 | num、coordbench |
| 7.12 | 7 | 实数 | 5 | 0 | 0 | 1 | compass、num、sqrt、round、turtle |
| 7.13 | 7 | 平面直角坐标系 | 1 | 1 | 0 | 1 | coordbench |
| 7.14 | 7 | 二元一次方程组与消元 | 9 | 0 | 0 | 1 | coordbench、swapbench、systembench |
| 7.15 | 7 | 不等式与一元一次不等式组 | 3 | 0 | 0 | 1 | num、balance、eqcard、numlinebench |
| 7.16 | 7 | 统计调查与直方图 | 1 | 1 | 0 | 1 | statbench |
| 8.1 | 8 | 三角形 | 1 | 0 | 0 | 1 | anglebench |
| 8.2 | 8 | 全等三角形的判定 | 2 | 1 | 0 | 1 | gridbench、foldbench |
| 8.3 | 8 | 轴对称 | 2 | 0 | 0 | 1 | foldbench |
| 8.4 | 8 | 等腰三角形 | 2 | 1 | 0 | 1 | tribench、proofsort |
| 8.5 | 8 | 幂的运算与整式的乘法 | 3 | 1 | 0 | 1 | areamodel、num、tilebench |
| 8.6 | 8 | 乘法公式 | 14 | 0 | 0 | 1 | variable、areamodel、fastbench、findbug、tilebench |
| 8.7 | 8 | 因式分解 | 3 | 0 | 0 | 1 | variable、areamodel、pour |
| 8.8 | 8 | 分式及其运算 | 1 | 1 | 0 | 1 | — |
| 8.9 | 8 | 分式方程 | 2 | 0 | 0 | 1 | approach |
| 8.10 | 8 | 二次根式 | 1 | 1 | 0 | 1 | num |
| 8.11 | 8 | 勾股定理与逆定理 | 6 | 1 | 0 | 1 | tribench、dissect、geoboard、proofsort |
| 8.12 | 8 | 平行四边形 | 7 | 0 | 0 | 1 | compass、areabench、optimize、taxi |
| 8.13 | 8 | 特殊的平行四边形 | 1 | 1 | 0 | 1 | areamodel |
| 8.14 | 8 | 函数与正比例函数 | 1 | 1 | 0 | 1 | coordbench |
| 8.15 | 8 | 一次函数 | 17 | 0 | 0 | 1 | coordbench、fmachine、costplan、fitbench、databench |
| 8.16 | 8 | 数据的分析 | 2 | 1 | 0 | 1 | statbench |
| 9.1 | 9 | 解一元二次方程 | 2 | 0 | 0 | 1 | tilebench |
| 9.2 | 9 | 一元二次方程的应用与根的判别式 | 2 | 1 | 0 | 1 | coordbench |
| 9.3 | 9 | 二次函数的图象和性质 | 4 | 1 | 0 | 1 | coordbench |
| 9.4 | 9 | 二次函数与方程及应用 | 4 | 0 | 0 | 1 | coordbench、fmachine、optimize |
| 9.5 | 9 | 图形的旋转与中心对称 | 1 | 1 | 0 | 1 | gridbench |
| 9.6 | 9 | 圆的有关性质 | 1 | 1 | 0 | 1 | circlebench |
| 9.7 | 9 | 点、直线和圆的位置关系 | 1 | 1 | 0 | 1 | circlebench |
| 9.8 | 9 | 弧长和扇形面积 | 1 | 1 | 0 | 1 | circlebench |
| 9.9 | 9 | 随机事件与概率 | 3 | 0 | 0 | 1 | chancebench、ptree |
| 9.10 | 9 | 列举法求概率与频率估计 | 1 | 1 | 0 | 1 | chancebench |
| 9.11 | 9 | 反比例函数 | 1 | 1 | 0 | 1 | — |
| 9.12 | 9 | 图形的相似与位似 | 4 | 1 | 0 | 1 | gridbench、scale、spheretri |
| 9.13 | 9 | 相似三角形 | 1 | 0 | 0 | 1 | gridbench |
| 9.14 | 9 | 锐角三角函数 | 1 | 1 | 0 | 1 | trig-table |
| 9.15 | 9 | 解直角三角形及其应用 | 1 | 0 | 0 | 1 | tribench |
| 9.16 | 9 | 投影与视图 | 1 | 1 | 0 | 1 | solidbench |

## 按本质（E1–E12）

| 本质 | 题目数 | 器材数 |
|---|---|---|
| E1 | 64 | 27 |
| E2 | 241 | 51 |
| E3 | 149 | 43 |
| E4 | 108 | 28 |
| E5 | 142 | 54 |
| E6 | 54 | 22 |
| E7 | 118 | 28 |
| E8 | 66 | 23 |
| E9 | 72 | 17 |
| E10 | 10 | 4 |
| E11 | 11 | 3 |
| E12 | 13 | 6 |

## 没有题的知识点

6.14 综合与实践 / 整理和复习

## 没有知识点的题目

seq-arith-20

