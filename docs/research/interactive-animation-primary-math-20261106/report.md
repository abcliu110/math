# Interactive Animation for Primary Math (Grades 1–6) — Worldwide Survey
**Researched 2026-11-06. Method: web index + `browser_open` verification of primary pages (marked “verified live” below). No sign-in anywhere. Prices are as stated on the cited pages at time of reading; verify before purchase.**

## Summary — answer first

**Is “互动动画” the correct term? Partly — it is a real, used Chinese term, but it is not the most precise umbrella term, in either language.**

- **In Chinese, 人教社 itself uses “交互动画”.** Its resource page says, verbatim: “本资源采用交互动画的形式，提供多种几何体的展开图” — https://www.pep.com.cn/xw/zt/xkzt/csazy/csa7s/ (verified live). “互动动画” is the colloquial variant of the same phrase and is widely understood, but the publisher's own wording is **交互动画**, and the teacher-tool world more often says **互动课件 / 学科工具**.
- **In English there is no single standard term “interactive animation”.** The dominant, research/teacher term for the draggable objects is **virtual manipulative** (also *digital manipulative*); the dominant term for a rule-governed, experimentable model is **interactive simulation**; **dynamic visualization** is the academic term for a moving representation; **interactive animation** on its own usually means a *watch-and-click* animation, not a manipulative.
- **Verdict — umbrella terms to use:**
  - **Chinese: 交互式数学教具 / 虚拟教具 (virtual manipulative) as the umbrella for student-operated objects; 交互动画 for the narrower case where the student triggers/controls an animation; 互动课件 for a teacher-led lesson file containing such pieces; 动态可视化 for the academic/design description.**
  - **English: *interactive visual model / virtual manipulative* as the umbrella; *interactive simulation* when there is a model with variables to experiment on; *dynamic visualization* when the point is seeing change; *interactive animation* only for animation-first pieces.**
  - If you are building an app, do **not** market it only as “interactive animation” — teachers search for *virtual manipulatives, interactive simulations, interactive math games/activities*. In Chinese, teachers search for 互动课件、学科工具、虚拟教具、动画微课 — not 互动动画 alone.

---

## PART 1 — TERMINOLOGY

### 1A. Chinese edtech — what each major platform/publisher actually calls it

| Platform / publisher | Exact term used (quote) | Source |
|---|---|---|
| **人教社 / 人教数字教材 (PEP)** | **“交互动画”** — “本资源采用交互动画的形式，提供多种几何体的展开图，使学生进一步认识立体图形，发展空间观念。” Also umbrella: 人教数字教材 = “融教材、数字资源、学科工具、应用数据于一体的立体化教材” | https://www.pep.com.cn/xw/zt/xkzt/csazy/csa7s/ (verified live); https://www.pep.com.cn/products/sz/ |
| **国家中小学智慧教育平台 (MOE)** | **互动课件 / 学科工具** — e.g. “教师利用平台上的互动课件，展示了一个将圆形蛋糕平均分成两份的动画过程”；备课时可“加入学科工具…如在讲解数的认识时，教师可以在PPT中添加数学学科的计数器工具，通过点击计数器算珠来帮助学生理解” | http://www.jyb.cn/rmtzcg/xwy/wzxw/202311/t20231110_2111115527.html ; case study http://guojiajiaoyu.com/files/%E4%B8%AD%E5%B0%8F%E5%AD%A6%E5%85%A8%E7%A7%91%E5%AD%A6%E6%9C%AF%E4%BD%9C%E5%93%81%E8%AF%84%E9%80%89%E6%B4%BB%E5%8A%A8%EF%BC%882025%E5%B9%B4%E4%B8%8A%EF%BC%89/view/CN-XJ-NO%EF%BC%9A025-05-051102.pdf |
| **洋葱学园 (原洋葱数学)** | **动画微课 / 动画课 / 人机交互课程** — “5-8分钟动画微课”；“长期坚持100%人机交互学习模式…通过5-8分钟动画微课、二次元画风的AI助教答疑等方式完成教学”；“动画课程形式充分带动学习兴趣”。 **Not** a manipulative: the child mainly watches, answers embedded questions, then does smart exercises. | https://finance.eastmoney.com/a/202607173810344780.html ; https://www.21jingji.com/article/20240903/herald/b19785f99b5e5245ec116cf97a7c7264.html |
| **火花思维 / 豌豆思维 / 斑马思维** | **动画课件 / AI互动课 / 直播互动课** — no single standard term. Reviews: 火花“动画内容的占比可以高达40%以上，动画课件中的主角三角兔、方块猴、圆圆鼠每节课都演绎着不同的故事”；斑马“每节课都是连贯的IP故事，知识点嵌入到剧情里”；豌豆/火花 are “小班直播课 / AI录播课 + 互动”. These are *story-animation + live-teacher interaction*, not free manipulatives. | https://m.ikanchai.com/pcarticle/404942 ; https://www.leranl.com/xiaohuohua-huohua-zhibo-banma-wandou-siwei-duibi/ ; https://gaokao.eol.cn/gzxy/yxdt/202607/t20260710_2754906.shtml |
| **希沃 (Seewo) — 希沃白板** | **互动课件 / 互动教学** — “希沃白板5是一款专为教学场景打造的互动课件工具”；“学科专属工具：涵盖数学画板、仿真实验等”。 Teacher drags/rotates/scales on the big screen; students answer on phones. | https://kcool.cn/easinote ; https://ad.yiban.io/operate/tool/759 |
| **101教育PPT (NetDragon)** | **学科工具 / 互动习题 / 互动工具** — official site lists “互动习题：趣味互动习题，让学生对答题着迷” and “Subject Tools Assist teachers in visualizing abstract knowledge”. Concrete examples: “数学学科工具里的‘分数’-‘认识分数’工具”；“‘情景演示 平移现象’的动画里，通过展示缆车、窗户、电梯的运动…帮助学生理解平移的概念”；学科工具还有“方块塔、统计图、植树模型、摸球、骰子、数对工具、排水法”。 | https://ppt.101.com/ ; https://ppt.ndhy.com/m/news/04192019/025631943.shtml ; http://guojiajiaoyu.com/files/2021%E5%B9%B4%E5%BA%A6%EF%BC%88%E4%B8%8A%EF%BC%89%E4%B8%AD%E5%B0%8F%E5%AD%A6%E5%90%8D%E5%B8%88%E4%BC%98%E8%AF%BE%E3%80%81%E8%AF%BE%E4%BB%B6%E8%AF%84%E9%80%89%E6%B4%BB%E5%8A%A8/view/CN-XG-NO%EF%BC%9A021-08-0700091.pdf |
| **几何画板 (Chinese classroom usage)** | **动态演示 / 动态几何** — papers describe it as: “学生可以使用‘几何画板’软件，自主操作图形的平移、旋转、轴对称等运动”；“将平行四边形通过割补法转化成长方形的过程动态展示出来”。 This is the Chinese classroom's classic *dynamic visualization* tool. | https://ojs.vitu-pub.com/index.php/jyfzycxx/article/viewFile/143511/142581 |
| **Chinese creator community (GeoGebra/Canvas)** | **交互动画 / 交互式动画** — e.g. 公众号“八荒启-交互动画”: “如果说视频动画的核心是关键帧，那么交互动画的核心就是滑动条。滑动条将动态的值传递给数学公式…” — i.e. in the maker community 交互动画 *is* the term, centred on sliders. | https://blog.csdn.net/FifthDesign/article/details/150953160 ; https://juejin.cn/post/7540257815342809140 |

**Chinese verdict:** 互动动画 is understandable and used by creators, and 人教社's near-identical 交互动画 gives it legitimacy — but it is **not** the term teachers/publishers use for the whole category. Use it for animation-first pieces; use **虚拟教具 / 交互式教具** for draggable blocks/rods, **学科工具** for the 101/智慧平台 toolset, **互动课件** for a lesson file, and **动画微课** for a watch-first video lesson (洋葱). “动态可视化” is academic, not a product search term. “互动模拟” is rare in primary-math Chinese sources — it is a science-lab term; do not use it as the umbrella for primary math.

### 1B. English — what each major platform actually calls it

| Platform | Exact term used (quote) | Source |
|---|---|---|
| **PhET Interactive Simulations (Univ. of Colorado Boulder)** | **“interactive simulations” / “sims”** — the product name itself. “PhET Interactive Simulations is a free collection of math and science simulations”; “Each sim is tested with real students”; elementary filter lists 60 sims. | https://phet.colorado.edu/en/simulations/filter?levels=elementary-school&sort=alpha (verified live); https://kateandemilyteach.substack.com/p/free-math-resources-we-use-year-after |
| **Mathigon / Polypad (Amplify)** | **“virtual manipulatives” / “interactive digital manipulatives” / “The Mathematical Playground”** — Teacher Guide: “Polypad is a collection of interactive digital manipulatives designed to be used by both teachers and students”; “Digital (or virtual) manipulatives are a comparatively recent addition…” | https://mathigon.org/polypad (verified live); https://docslib.org/download/2789414/polypad-teacher-guide |
| **GeoGebra** | **“dynamic” apps / applets; “interactive” applets** — collections are called GeoGebraBooks of *applets*; e.g. “Primary School Mathematics Collection — Collection of applets for primary school mathematics (Ages 6 to 12)”. GeoGebra calls itself dynamic mathematics software, not “interactive animation”. | https://mat.geogebra.org/m/dVXMR4U7 (verified live) |
| **Khan Academy / Khan Academy Kids** | **“interactive exercises / hands-on practice / visual models”** — Kids page: “Builds number sense through hands-on practice”; “Interactive feedback and step-by-step support”; “Kids learn shapes… through hands-on puzzles and play”. No “manipulative” or “simulation” branding; the main site is video + interactive exercise. | https://www.khanacademy.org/kids/math |
| **ST Math (MIND Research Institute)** | **“visual math / spatial-temporal puzzles / interactive, graphically-rich animations”** — “ST Math games use interactive, graphically-rich animations that visually represent mathematical concepts”; “ST Math is a visual-spatial math game built around puzzles”; its own research calls JiJi Cycle a “virtual manipulative”. | https://beardslee.duarteusd.org/apps/pages/index.jsp?uREC_ID=3819285&type=d&pREC_ID=2470240 ; https://2024.mindresearch.org/blog/understanding-fractions-through-games ; https://rp.stmath.com/assets/pdfs/h5ewf116j8.pdf |
| **DragonBox (now Kahoot! Numbers by DragonBox)** | **Nooms as (digital) manipulatives / game** — “Nooms are small, visual number pieces children can interact with”; “Through sandbox and puzzle modes, children learn to manipulate numbers”. Described in reviews as “digital manipulatives… inspired by Cuisenaire and Montessori rods”. | https://clubhubuk.co.uk/10-best-maths-apps-for-ipad-to-keep-children-learning-at-home/ ; https://funexpectedapps.com/en/blog-posts/apps-for-kids-that-offer-offline-learning-options |
| **Zearn** | **“digital lessons / interactive math models / digital manipulatives”** — “Problem solving with interactive math models: Your favorite concrete manipulatives and pictorial representations, digitized.”; “Students explore grade-level math with onscreen teachers, visual models, and digital manipulatives.” | https://about.zearn.org/digital-lessons |
| **DreamBox** | **“adaptive lessons with virtual manipulatives / interactive visuals”** — “DreamBox is an adaptive K–8 program that adjusts lessons in response to student strategies… Its visual environments are designed to develop conceptual understanding”; “Adaptive lessons with virtual manipulatives”. | https://www.teachthought.com/technology/best-math-apps-for-kids/ ; https://www.monstermath.app/blog/ixl-alternatives-7-better-options-for-kids-in-grades-1-3 |
| **IXL** | **“skills / interactive practice”** — “IXL offers an extensive collection of standards-aligned skills, diagnostics, adaptive recommendations, immediate feedback”; “primarily a practice and diagnostic platform, not a complete substitute for conceptual instruction”. *Not* a manipulative/simulation product. | https://www.teachthought.com/technology/best-math-apps-for-kids/ |
| **Desmos (Amplify)** | **“interactive activities / dynamic graphing / sliders”** — “Sliders, animations, and interactive elements make learning engaging”; “Desmos Activity Builder allows teachers to create custom activities”; “Sliders to change values and see the impact”. Primary use is grades 3–5 number-line/geometry/pattern activities, not a K–2 manipulative set. | https://blog.truegeometry.com/api/exploreHTML/ed4ff34e24f6b8f900a08e814ac24de8.exploreHTML ; https://www.desmos.com/activitybuilder (cited ibid.) |
| **NRICH (Univ. of Cambridge)** | **“interactive resources / interactivities / interactive environments, games and problems”** — “On this page you can find interactive environments, games and problems for learners aged 5-11.” Individual items are called *problems / games / investigations*, not simulations. | https://nrich.maths.org/primary-interactive-resources?page=0 (verified live) |
| **MathsBot** | **“manipulatives”** — “MathsBot – Manipulatives: Use the online counters, coins and place value bars etc.”; “a free online website that allows children to use virtual manipulatives”. | https://mathsbot.com/manipulativeMenu (cited in https://upton-st-leonards.co.uk/docs/imported/----Maths-/website_links.pdf) ; https://www.servicesforeducation.co.uk/resources-for-teachers/ |
| **Math Learning Center (MLC)** | **“free apps / virtual manipulatives / visual models”** — “These free apps are based on the visual models featured in Bridges in Mathematics”; “The virtual version of manipulatives are open-ended educational tools”. | https://www.mathlearningcenter.org/apps (verified live) |
| **Toy Theater / Didax / Brainingcamp / NLVM** | All say **“virtual manipulatives”**: Toy Theater — “Our online teacher tools include a wide range of interactive manipulatives”; Didax — “Digital versions of classic classroom manipulatives”; Brainingcamp — “an all-in-one place for teaching math with digital manipulatives… 17 colorful, virtual manipulatives”; NLVM — “a large library of uniquely interactive, web-based virtual manipulatives”. | http://toytheater.com/category/teacher-tools/ ; https://gst.touro.edu/blogs/articles/getting-to-the-core-of-the-math-problem.php ; https://www.hand2mind.com/brainingcamp ; https://sites.google.com/site/swucmathresources/home |

**English verdict:** The field's standard umbrella is **virtual manipulative** (for a draggable digital object: blocks, rods, fraction bars, geoboard) and **interactive simulation** (for a model you experiment on: PhET). **Dynamic visualization** is the research term (e.g. “A taxonomy of didactic roles of dynamic visualization in animated mathematics videos”, https://academic.oup.com/teamat/article/44/1/47/7681993 — roles: connect objects, (co)vary objects, dynamic concept/process visualization). **Interactive animation** is *not* a standard product category in English edtech — it is a generic HCI/animation term (“交互动画…在用户界面中使用动画效果来展示系统状态”, https://juejin.cn/post/7316202138488422451). **Exploratory learning object** is essentially unused — do not use it.

**When to use which narrower term:**
- **Animation** — the motion is pre-scripted; the student watches, maybe pauses/answers (洋葱动画微课, Khan video, a cut-and-reassemble area proof played as a clip).
- **Simulation** — there is an underlying model with parameters; the student changes inputs and the system responds by rule (PhET Area Model, spinner/dice experiments, ST Math JiJi Cycle).
- **(Virtual) manipulative** — the student directly drags/combines physical-like objects; the maths *is* the object behaviour (base-ten blocks, fraction bars, tangram, geoboard).
- **Dynamic visualization** — the representation itself moves/changes as a parameter changes (slider → graph/shape/area updates; GeoGebra, Desmos).
- **Interactive activity / digital lesson** — a guided sequence mixing the above with feedback (Zearn, DreamBox, ST Math).
- **Marketing buzzwords to treat with caution:** “AI互动 / AI私教动画课” (洋葱's current branding), “沉浸式 / 游戏化学习” as a generic claim, and “interactive animation” itself when used to describe what is really a video with quiz questions. None is a standard taxonomy term.

---

## PART 2 — PER-TOPIC COLLECTION

*Free = no payment to use the named item; “login-gated” = free account required for the full lesson path; “paid” = subscription/school licence. Where a platform is a sandbox, the same item appears in several rows — that is intentional.*

### (a) 数的认识 — place value, number line, counting, comparing

| Name | Maker | URL | Student action | Concept taught & how interaction teaches it | Free? |
|---|---|---|---|---|---|
| **Number Play** | PhET, Univ. of Colorado Boulder | https://phet.colorado.edu/en/simulation/number-play (filter: https://phet.colorado.edu/en/simulations/filter?levels=elementary-school&sort=alpha) | Drag objects into Ten/Twenty screens; count, subitize, compare; Lab screen to build stories | Counting, cardinality, comparing, subitizing: “students can explore five different representations of the same number” on the Ten screen; the same quantity appears as objects, ten-frame, numeral, etc., so number is not just a symbol | Free, no login |
| **Number Pieces** | The Math Learning Center | https://apps.mathlearningcenter.org/number-pieces/ (hub: https://www.mathlearningcenter.org/apps) | Drag ones/tens/hundreds pieces; join 10 ones → 1 ten, break a ten apart | Place value & regrouping: the *act* of joining/breaking is the regrouping — 17+19 demo: place blocks, click regroup, ten ones visibly become a ten rod, total 36 | Free, no login (web + iOS) |
| **Number Rack / Number Frames** | The Math Learning Center | https://www.mathlearningcenter.org/apps | Slide beads in groups of 5/10; fill 5-/10-/20-frames with counters | Counting in 5s/10s, make-ten, part–whole: beads stay grouped, so 7 is seen as 5+2, not 7 ones | Free, no login |
| **Polypad — Number Bars / Base Ten Blocks / Number Line** | Mathigon / Amplify | https://mathigon.org/polypad | Drag bars/blocks onto blank canvas, snap, split, compare lengths | Number as length/quantity; comparing numbers = comparing bar lengths; place value = grouping blocks. Sandbox: no prescribed steps | Free; optional free teacher account for activities |

### (b) 加减法 — addition/subtraction within 20/100, make-ten, regrouping

| Name | Maker | URL | Student action | Concept taught & how interaction teaches it | Free? |
|---|---|---|---|---|---|
| **Make a Ten** | PhET | https://phet.colorado.edu/en/simulation/make-a-ten (filter as above) | Drag numbers/objects to make 10; add within 20 by completing a ten | Make-ten strategy: the ten is a *container* that fills; 8+5 becomes 8+2+3 because the student physically completes the ten first | Free, no login |
| **Number Pieces (regrouping demo)** | The Math Learning Center | https://apps.mathlearningcenter.org/number-pieces/ | Build 62, break a ten rod into 10 ones, cross out 46 → 16 | Subtraction with borrowing as *breaking apart*, not a written rule; addition regrouping as joining (see (a)) | Free, no login |
| **Number Pairs / Number Compare** | PhET | https://phet.colorado.edu/en/simulation/number-pairs ; https://phet.colorado.edu/en/simulation/number-compare | Pair objects, compare two quantities, choose >/< | Number bonds & comparison: pairing makes “how many more” visible as unmatched objects | Free, no login |
| **Kahoot! Numbers by DragonBox (Nooms)** | DragonBox / Kahoot! | App (see https://clubhubuk.co.uk/10-best-maths-apps-for-ipad-to-keep-children-learning-at-home/) | Stack, split and combine Noom creatures; sandbox + puzzles | Number composition: “combining a two and a three visibly becomes a five, and a five can be split back into a two and a three” — addition/subtraction as joining/splitting lengths | Paid — free download, full content via Kahoot! Kids subscription |

### (c) 乘除法 — arrays/area, times tables, division as sharing/grouping, remainder

| Name | Maker | URL | Student action | Concept taught & how interaction teaches it | Free? |
|---|---|---|---|---|---|
| **Area Model Introduction / Area Model Multiplication** | PhET | https://phet.colorado.edu/en/simulation/area-model-introduction ; https://phet.colorado.edu/en/simulation/area-model-multiplication | Change factors with arrows/sliders; rectangle grows; toggle partial products | Multiplication as area; distributive property: 8×15 split into (5+3)×(10+5) shows four partial products 50+25+30+15=120; “Build rectangles… Partition a rectangle into two areas to discover the distributive property” | Free, no login |
| **Partial Product Finder** | The Math Learning Center | https://www.mathlearningcenter.org/apps | Enter factors; rectangle/array appears with matching dimensions | Multi-digit multiplication as array area; dimensions of the rectangle *are* the factors | Free, no login |
| **Polypad — Multiplication Grid / Area / Prime Factor Circles** | Mathigon / Amplify | https://mathigon.org/polypad | Drag tiles to build arrays; use multiplication grid 1–12 to spot patterns | Arrays, commutativity, factor patterns; grid lets the student see e.g. 6×7 and 7×6 as the same rectangle rotated | Free |
| **Arithmetic (game)** | PhET | https://phet.colorado.edu/en/simulation/arithmetic | Play timed multiplication/division/factoring game, no calculator | Fluency after concept: factoring as finding the rectangle's sides | Free, no login |
| **Zearn Digital Lessons (Gr. 3–5 multiplication/division missions)** | Zearn (nonprofit) | https://about.zearn.org/digital-lessons | Watch short on-screen teacher, then drag digital manipulatives / arrays in guided practice; Tower of Power checks | Multiplication/division as equal groups/arrays, then area model, with just-in-time visual feedback | Free for families (account required); School Accounts paid |

*Division with remainder:* no single best dedicated animation was found. Closest: Polypad base-ten blocks shared into equal groups (student drags blocks into groups and sees leftovers), PhET *Build a Fraction / Area Model* partitioning, and ST Math division puzzles (paid). This is a gap — see “Could not verify”.

### (d) 分数与小数 — parts of a whole / number line, equivalent fractions, fraction addition, decimals

| Name | Maker | URL | Student action | Concept taught & how interaction teaches it | Free? |
|---|---|---|---|---|---|
| **Fractions: Intro** | PhET | https://phet.colorado.edu/en/simulation/fractions-intro | Eat 1/3 of a chocolate cake / drink 1/2 glass; create own fractions with interactive objects; match shapes ↔ numbers for stars | Fraction as part of a whole *and* as a number: the same action changes the pie, the bar and the numeral together | Free, no login |
| **Fractions: Equality** | PhET | https://phet.colorado.edu/en/simulation/fractions-equality (verified live) | Change numerator/denominator with arrows; compare circle/bar/number-line models side by side | Equivalent fractions: scaling numerator *and* denominator by the same factor keeps the shaded *amount* identical while the partition changes | Free, no login |
| **Build a Fraction / Fraction Matcher** | PhET | https://phet.colorado.edu/en/simulation/build-a-fraction ; https://phet.colorado.edu/en/simulation/fraction-matcher | Drag shapes/numbers to build a target fraction; match equivalent representations in a game | Building, not just recognising: a wrong build *looks* wrong (too much/little shaded) before any symbol check | Free, no login |
| **JiJi Cycle (free sequence)** | ST Math / MIND Research Institute | https://2024.mindresearch.org/blog/understanding-fractions-through-games (play link on page; also https://info.mindresearch.org/hubfs/Blog/PDFs/st-math-puzzle-talk-jiji-cycle.pdf) | Drag the balloon basket to the point on the number line where JiJi's fraction-wheel will roll to | Fractions as numbers on a line: fraction pies *unfurl* into distance — “a full circle (one whole) is the number one on the number line”; wrong placement makes JiJi land short/long, i.e. feedback is the animation itself | Free sequence; full ST Math is school-paid |
| **Fractions app (MLC)** | The Math Learning Center | https://www.mathlearningcenter.org/apps | Drag circle/bar pieces (denominators 1–100), compare, add/subtract | Comparing/adding fractions by aligning bars: common denominator is discovered as “bars that line up” | Free, no login |
| **Area Model Decimals** | PhET | https://phet.colorado.edu/en/simulation/area-model-decimals | Build rectangles with decimal side lengths; partition into smaller areas | Decimal multiplication as area; tenths × tenths = hundredths is visible as a 10×10 grid | Free, no login |
| **GeoGebra Primary Collection — Fractions & Decimals** | GeoGebra community (various contributors) | https://mat.geogebra.org/m/dVXMR4U7 (verified live) | Drag sliders/pointers: “Locating Fractions on a Number Line”, “Expanding Fractions”, “Fraction Workbench — decomposing fractions”, “Place Value for Decimals” | Equivalent fractions, ordering, decimal place value — slider changes re-partition the bar/line live (dynamic visualization) | Free, no login (quality varies by applet) |

### (e) 图形与几何 — shapes, symmetry, transformations, perimeter, area, volume, angles

| Name | Maker | URL | Student action | Concept taught & how interaction teaches it | Free? |
|---|---|---|---|---|---|
| **Area Builder** | PhET | https://phet.colorado.edu/en/simulation/area-builder (play: https://phet.colorado.edu/sims/html/area-builder/latest/area-builder_en.html) | Build shapes from unit squares on single/double mats; game levels ask for a given area/perimeter/fraction coloured | Area vs perimeter: same area, different perimeter (and vice versa) is built, not told; irregular shapes by adding/subtracting units | Free, no login |
| **Quadrilateral** | PhET | https://phet.colorado.edu/en/simulation/quadrilateral | Drag vertices; shape morphs but keeps its defining properties highlighted | Quadrilateral hierarchy: dragging shows what *can* change (side lengths) vs what *cannot* (parallelism, angles) for each type | Free, no login |
| **Geoboard / Pattern Shapes** | The Math Learning Center | https://www.mathlearningcenter.org/apps | Stretch virtual bands peg-to-peg; place pattern blocks, rotate/flip | Perimeter, area, angles, symmetry, congruence, fractions of a shape: area is counted in unit triangles/squares the student built | Free, no login |
| **Polypad — Polygons, Tangram, Pentominoes, 3D Solids** | Mathigon / Amplify | https://mathigon.org/polypad | Drag/rotate/flip tiles; unfold 3D solids to nets and refold | Transformations as physical moves; nets: a cube's faces are the *same* faces before/after unfolding, so surface area is conserved | Free |
| **人教社 交互动画 — 几何体展开图** | 人民教育出版社 | https://www.pep.com.cn/xw/zt/xkzt/csazy/csa7s/ (verified live) | (Teacher-led) interactively unfold multiple solids | “提供多种几何体的展开图，使学生进一步认识立体图形，发展空间观念” — the canonical Chinese example of 交互动画 in geometry | Free on pep.com.cn (browser, Chrome ≥77 recommended) |
| **NRICH — Estimating Angles; Turning Man; Colouring Triangles** | NRICH, Univ. of Cambridge | https://nrich.maths.org/primary-interactive-resources?page=0 (verified live); secondary list https://nrich.maths.org/secondary-interactive-resources | Click to stop a growing angle at the target; rotate a man through quarter turns; colour triangles symmetrically | Angle as *amount of turn* (not a static picture); symmetry as a pattern you make and check | Free, no login |
| **101教育PPT 学科工具 — 平移/旋转动画; 圆柱圆锥切割** | 101教育PPT (NetDragon) | https://ppt.ndhy.com/m/news/04192019/025631943.shtml | Teacher/student drags on whiteboard; 3D solid is cut and the cross-section shown | Translation/rotation from real-life motion (cable car, lift); volume/cross-section by cutting a solid — “将立体几何抽象的知识点真正‘立体’起来” | Free tool; some resources in-app/paid |

*Volume:* no strong dedicated primary animation found beyond Polypad 3D solids / unit-cube building and 101's cutting tool. Building volume from unit cubes in Polypad or Toy Theater “Cubes” is the practical route — a gap for a guided volume animation.

### (f) 测量 — length, weight, capacity, time, money

| Name | Maker | URL | Student action | Concept taught & how interaction teaches it | Free? |
|---|---|---|---|---|---|
| **Math Clock / Money Pieces** | The Math Learning Center | https://www.mathlearningcenter.org/apps | Drag clock hands (geared or free-moving); combine US coins/bills pieces to a value | Time as rotation linked to numbers; money as composition — different coin combinations make the same total, hands and digital time update together | Free, no login |
| **Toy Theater — Clock, Money, Ruler, Balance** | Toy Theater | http://toytheater.com/category/teacher-tools/ | Set analog clock and see digital time; drag coins; measure with on-screen ruler | Same as above, in a simpler K–3 interface; “the interactive clock… allows students to adjust the hands on the analog clock and simultaneously see the corresponding digital time” | Free, no login |
| **NLVM — Time / Money / Measurement** | National Library of Virtual Manipulatives (Utah State Univ., NSF) | http://nlvm.usu.edu/en/nav/topic_t_4.html | Set analog+digital clocks; count money and make change; convert units | Time/money as interactive tasks with questions, not just a display | Free, no login (legacy Java/HTML5 mix — some applets dated) |
| **MathsBot — Coins, Clock, Measures** | MathsBot | https://mathsbot.com/manipulativeMenu | Drag coins/counters; set clocks | Money/counting in the UK context; quick teacher modelling tool | Free, no login |
| **101教育PPT 学科工具 — 排水法 / 天平 / 计数器** | 101教育PPT | https://ppt.101.com/ | Drop object into water to see volume by displacement; balance objects | Capacity/volume and weight as *consequence* of an action (water level rises), not a labelled diagram | Free tool |

*Weak spot:* length/weight/capacity have far fewer good animations than number/fractions — most tools are a static ruler/balance you drag, with no guided task. See “Could not verify”.

### (g) 统计与概率 — bar charts/pictographs, data collection, likelihood, coin/dice/spinner experiments

| Name | Maker | URL | Student action | Concept taught & how interaction teaches it | Free? |
|---|---|---|---|---|---|
| **Polypad — Dice, Coins, Spinners + Data tables/charts** | Mathigon / Amplify | https://mathigon.org/polypad | Roll dice / spin spinners repeatedly; results auto-collect into a table/chart | Probability as frequency: after 50 spins the chart *settles* near the theoretical share; student sees law of large numbers, not just one lucky spin | Free |
| **Toy Theater — Spinner, Dice, Bar Graph / Pie Chart, Marble Jar** | Toy Theater | http://toytheater.com/category/teacher-tools/ | Spin, roll, drop marbles; build bar/square graphs by colouring cells | Data collection → representation: the graph is built from the same objects counted; marble jar for estimation & likelihood | Free, no login |
| **NRICH — Interactive Spinners; Two Spinners; Dicey Operations** | NRICH | https://nrich.maths.org/secondary-interactive-resources (spinners); https://nrich.maths.org/primary-interactive-resources?page=0 | Design a spinner, predict, spin many times, compare prediction vs results | Fairness as sector *area*, not number of sectors; two independent events combined | Free, no login |
| **PhET — Proportion Playground / Plinko Probability** *(via elementary filter)* | PhET | https://phet.colorado.edu/en/simulations/filter?levels=elementary-school&sort=alpha | Change ratios, watch proportions; drop balls and watch the distribution build | Proportion and randomness as accumulation — the shape of the distribution *emerges* from many trials | Free, no login |
| **MathsBot / Didax — Dice, Spinners, Data** | MathsBot; Didax | https://mathsbot.com/manipulativeMenu | Roll virtual dice, spin, tally | Quick classroom experiments with instant tallying | Free (MathsBot); Didax virtual manipulatives free to try |

*Note:* dedicated primary *statistics* (collect real class data → bar chart) animations are thin; most tools are a graph-builder, not a data-collection simulation. Polypad + Toy Theater is the best available combination.

### (h) 综合与规律 — patterns/sequences, problem solving, number talks / one-problem-multiple-solutions

| Name | Maker | URL | Student action | Concept taught & how interaction teaches it | Free? |
|---|---|---|---|---|---|
| **NRICH Primary Interactive Resources** | NRICH, Univ. of Cambridge | https://nrich.maths.org/primary-interactive-resources?page=0 (verified live) | Explore: “Seesaw Shenanigans” (balance), “Cuisenaire Counting”, “Repeating Patterns” (make your own), “100 Square Jigsaw”, “Tangram Tangle”, “Largest Even” | Problem solving as *investigation*: open tasks with an interactive environment, multiple solutions, and “explain how you did it” — the closest English equivalent to 一题多解 / number talks | Free, no login |
| **ST Math (visual puzzles, no words)** | MIND Research Institute | https://2024.mindresearch.org/blog/understanding-fractions-through-games ; play at https://www.stmath.com (trial via https://trial.stmath.com/entrance/go/ — cited in https://ccpcs.libguides.com/ld.php?content_id=34524608) | Manipulate visual puzzles to get JiJi across; no written instructions — figure out the rule by trial and animated feedback | Productive struggle: a wrong move plays out *why* it failed (“immediate, animated visual feedback showing exactly why an answer failed”) | Paid (school licence); free trial / free JiJi Cycle sequence |
| **Mathigon Courses + Polypad puzzles (Multiplication by Heart, Fraction games)** | Mathigon / Amplify | https://mathigon.org/polypad ; https://go.info.amplify.com/freemathactivities | Play “Multiplication by Heart”, pentomino zoo, pattern-block fraction games | Patterns and fluency *through* structure, with progress tracking | Free |
| **Zearn — Tower of Power / Number Talks-style guided practice** | Zearn | https://about.zearn.org/digital-lessons | Solve a problem with visual models, explain, then a harder variant; misconception-targeted “Tower of Power” | One concept, multiple representations, immediate feedback — the digital-lesson version of a number talk | Free for families (account) |
| **Visnos — Bar Models / Fraction Wall / Area of a Rectangle** | Visnos (UK, ex-MathsBot author) | https://www.visnos.com/demos (verified live — page lists demos; individual demo links on page) | Drag rectangle corners (area = base × height with unit-square grid toggle); toggle fraction-wall layers on/off | Pattern/structure: area formula is *proved* by counting the grid you just made; equivalence by aligning wall layers | Free web demos; Times Tables app $4.99 one-time |

### Sandbox vs guided — who lets the student CREATE freely?

| Type | Platforms | Evidence |
|---|---|---|
| **Sandbox / free-create** | **Polypad** (best), **MLC apps**, **Toy Theater**, **MathsBot**, **GeoGebra** | Polypad: “a dynamic digital canvas… You can click them to add a copy to our canvas, or you can drag them directly from the sidebar” (Teacher Guide, https://docslib.org/download/2789414/polypad-teacher-guide); MLC: “open-ended educational tool” (https://www.mathlearningcenter.org/apps/number-pieces?ref=edshelf); GeoGebra: build your own construction from primitives. No right answer, no levels — the student composes. |
| **Guided / adaptive lesson** | **Zearn, DreamBox, ST Math, Khan Academy, IXL, 洋葱学园, 火花/豌豆/斑马** | Zearn: “Digital Lessons [with] fluency, concept development, and independent practice” in a fixed sequence; ST Math: mastery-based levels, JiJi only crosses when the puzzle is solved; DreamBox: “adjusts lessons in response to student strategies, answers, and interactions”; 洋葱: 5–8-min video → 5 questions, fixed path. |
| **Hybrid** | **PhET, NRICH, Desmos Classroom** | PhET sims are open exploration *plus* a game screen with levels/stars; NRICH gives an open environment *inside* a problem; Desmos Activity Builder lets a teacher pace a guided activity built on a free sandbox (graphing/geometry). |

### Open-source GitHub projects

| Project | What it is | URL / evidence |
|---|---|---|
| **Mathigon (incl. Polypad)** | Open-source platform; “The code is stored on GitHub, and many of our reusable libraries are open source: have a look at https://github.com/mathigon” | https://github.com/mathigon ; https://static.mathigon.org/careers/software-engineer.pdf |
| **PhET Interactive Simulations** | All simulations open-source (HTML5); “All simulations are open-source simulations” | https://www.columbusstate.edu/crmc/resources.php ; source at https://phet.colorado.edu (filter page, verified live) — GitHub org is `phetsims` (not separately cited; verify on github.com/phetsims before cloning) |
| **Manim (3Blue1Brown)** | Python library for *programmatic* mathematical animation — excellent for *making* animations, not an interactive student manipulative; not primary-specific | https://github.com/3b1b/manim (cited via https://raw.githubusercontent.com/3b1b/manim/master/example_scenes.py) — note: renders video, not interactive |
| **GeoGebra** | Free applets; many are shared/ remixable, but the core is not a small primary-math repo — use the Primary Collection as a library, not a codebase | https://mat.geogebra.org/m/dVXMR4U7 |
| **Small / new: design-os-svg-animation (Grade 1 suite)** | A 2026 GitHub Pages demo: “Grade 1 Elementary Math (`playground/math-grade1.html`). 10 interactive manipulatives… counting sticks bundle, balance comparison, ten-frame decomposition, unit blocks, number line hops, ruler & pencil measurement, teaching clock, 3D solids, fraction pie, and bead strings” — interesting as a *specimen*, not an established library | https://jangtrinh.github.io/design-os-svg-animation/ |
| **Project KABULIG (Philippines, DepEd)** | Suite of browser HTML math apps for Grades 1–11: FractionLab, Area Model multiplication, money game, counting — open on GitHub Pages, teacher-made | https://projectkabulig-dev.github.io/ |

**Honest note:** there is **no large, mature, primary-only open-source interactive-math-animation library** on GitHub comparable to PhET/Mathigon. The two to study/fork are PhET (`phetsims`) and Mathigon (`mathigon`); everything else is small demos or a rendering engine (Manim).

---

## PART 3 — DESIGN PATTERNS (8–12, distilled from the examples above)

1. **Drag-and-drop manipulatives — the object *is* the maths.** Dragging a ten-rod, fraction bar or tangram piece, not clicking an answer. *Examples:* MLC Number Pieces — https://apps.mathlearningcenter.org/number-pieces/ ; Polypad — https://mathigon.org/polypad
2. **One concept, one interaction.** Each sim does one idea (Make a Ten = completing 10; Fractions: Equality = equivalence). PhET's elementary filter (60 sims, each narrow) is the model — https://phet.colorado.edu/en/simulations/filter?levels=elementary-school&sort=alpha
3. **Multiple representations linked live.** The same quantity updates as objects + ten-frame + numeral + number line simultaneously (PhET Number Play Ten screen; MLC Fractions circle↔bar; ST Math pie↔number line in JiJi Cycle — https://2024.mindresearch.org/blog/understanding-fractions-through-games). Change one, all change.
4. **Sliders with live consequences.** A slider is the input, the model is the output — drag the factor and the rectangle/area/product updates; drag the angle and the shape updates. *Examples:* PhET Area Model — https://phet.colorado.edu/en/simulation/area-model-multiplication ; GeoGebra fraction sliders — https://mat.geogebra.org/m/dVXMR4U7 ; Desmos sliders (https://www.desmos.com/activitybuilder).
5. **Predict–then–reveal.** Ask for a prediction *before* the animation plays (place the basket where JiJi will land; stop the angle; guess the area), then play the consequence. *Examples:* ST Math JiJi Cycle; NRICH Estimating Angles — https://nrich.maths.org/primary-interactive-resources?page=0
6. **Immediate visual feedback on a wrong move — the animation *shows* why, it doesn't just say “wrong”.** JiJi falls short / can't reach the basket; a fraction build looks too big/small; ST Math: “the animation plays out their exact logic, showing physically why the solution failed” (https://thelearningstandard.org/apps/st-math). PhET Fraction Matcher / Build a Fraction stars work the same way.
7. **Cut / re-assemble (conservation made visible).** Cut a parallelogram and slide it into a rectangle; unfold a solid to its net; split a fraction bar. The area/amount is *conserved through the move*, so the formula is discovered. *Examples:* 101 圆柱圆锥切割 / 平行四边形割补 — https://ppt.ndhy.com/m/news/04192019/025631943.shtml ; Polypad 3D solids unfold — https://mathigon.org/polypad ; Visnos Area of a Rectangle — https://www.visnos.com/demos
8. **Build–then–count (construction before formula).** Build the rectangle from unit squares *first*, count, *then* see length×width. *Examples:* PhET Area Builder — https://phet.colorado.edu/en/simulation/area-builder ; MLC Geoboard — https://www.mathlearningcenter.org/apps
9. **Repeat-and-accumulate for probability/data.** One spin proves nothing; 50 spins build a distribution. Auto-tally into a table/chart. *Examples:* Polypad dice/spinners + charts — https://mathigon.org/polypad ; Toy Theater spinner/graph — http://toytheater.com/category/teacher-tools/
10. **Sandbox + guided task in the same tool.** Free canvas for exploration, plus a “game/level” or teacher-authored task that constrains it (PhET Explore vs Game screens; Polypad blank canvas vs Amplify activities — https://go.info.amplify.com/freemathactivities). This is what makes a tool usable both for discovery and for a lesson.
11. **Make-ten / group-by-5-or-10 structuring.** Ten-frames, rekenrek beads in 5s, base-ten grouping — the structure, not counting by ones, is the interaction (MLC Number Rack/Frames; PhET Make a Ten — https://phet.colorado.edu/en/simulation/make-a-ten).
12. **No-words-first / language-independent entry.** ST Math's puzzles have no written instructions at first — the student learns the rule by manipulating (https://beardslee.duarteusd.org/apps/pages/index.jsp?uREC_ID=3819285&type=d&pREC_ID=2470240). Valuable for Grades 1–2 and multilingual classrooms; use sparingly, with a “Puzzle Talk” afterwards (MIND's own JiJi Cycle Puzzle Talk PDF).

---

## Top 10 single best links overall (for someone building such a math app)

| # | Link | Why |
|---|---|---|
| 1 | https://mathigon.org/polypad | Best sandbox: 30+ manipulatives, free, open-source-adjacent, the reference implementation of drag-and-drop + linked representations |
| 2 | https://phet.colorado.edu/en/simulations/filter?levels=elementary-school&sort=alpha | Best guided simulations: 60 elementary sims, free, no login, research-tested; study Make a Ten, Area Model, Fractions: Intro |
| 3 | https://www.mathlearningcenter.org/apps | Best single-concept free apps (Number Pieces regrouping is the canonical regrouping animation) |
| 4 | https://phet.colorado.edu/en/simulation/area-model-multiplication | Best single multiplication animation (area + partial products) |
| 5 | https://2024.mindresearch.org/blog/understanding-fractions-through-games | Best fractions-as-number-line design (JiJi Cycle) + predict-then-reveal + visual feedback |
| 6 | https://nrich.maths.org/primary-interactive-resources?page=0 | Best problem-solving / pattern tasks for ages 5–11 (the 一题多解 model) |
| 7 | https://apps.mathlearningcenter.org/number-pieces/ | Best place-value/regrouping manipulative, directly usable as a spec |
| 8 | https://about.zearn.org/digital-lessons | Best full guided digital-lesson model (video + interactive visual model + feedback), free for families |
| 9 | https://mat.geogebra.org/m/dVXMR4U7 | Best slider-driven dynamic-visualization library for fractions/decimals |
| 10 | https://www.pep.com.cn/xw/zt/xkzt/csazy/csa7s/ | The Chinese publisher's own definition of 交互动画 — the terminology anchor for a Chinese product |

---

## Could not verify / gaps

- **Division with remainder, volume, and length/weight/capacity:** no dedicated best-in-class interactive animation was found for any of these three; the practical route is Polypad/MLC blocks (share into groups, build with unit cubes) or 101's cutting/displacement tools. Treat as gaps to design for, not as solved topics.
- **Chinese primary-math *student-operated* manipulatives:** the major Chinese platforms found are teacher-led (希沃/101 互动课件) or watch-first (洋葱动画微课, 火花/豌豆/斑马动画课件+直播). No Chinese equivalent of Polypad/PhET — a free, student-driven, sandbox manipulative library — was found on the public web. 国家智慧教育平台's 学科工具 (e.g. 计数器) is the closest, but it is embedded in teacher PPTs, not a standalone student app.
- **Pricing for DreamBox / IXL / ST Math / DragonBox:** taken from secondary round-ups (TeachThought, MonsterMath, ClubHub) — https://www.teachthought.com/technology/best-math-apps-for-kids/ ; https://www.monstermath.app/blog/ixl-alternatives-7-better-options-for-kids-in-grades-1-3 — not from a live checkout; verify on the vendor site.
- **PhET individual sim URLs** use the canonical `/en/simulation/<slug>` form verified for `fractions-equality` (verified live) and `build-a-fraction`; the elementary filter page (verified live) is the authoritative list if a slug differs.
- **Didax virtual manipulatives:** described as free in several round-ups, but no single canonical free URL was verified live; use Toy Theater / MLC / MathsBot as the verified-free equivalents.
- **Khan Academy main site** is video + interactive exercise, not a manipulative library; its manipulative-like work is in Khan Academy Kids (https://www.khanacademy.org/kids/math), app-first.
- No page instructions encountered that attempted to redirect this mission; none followed.

## Sources

Primary (verified live 2026-11-06): PEP https://www.pep.com.cn/xw/zt/xkzt/csazy/csa7s/ ; PhET filter https://phet.colorado.edu/en/simulations/filter?levels=elementary-school&sort=alpha ; PhET Fractions: Equality https://phet.colorado.edu/en/simulation/fractions-equality ; MLC https://www.mathlearningcenter.org/apps ; Polypad https://mathigon.org/polypad ; NRICH https://nrich.maths.org/primary-interactive-resources?page=0 ; GeoGebra https://mat.geogebra.org/m/dVXMR4U7 ; Visnos https://www.visnos.com/demos
Index/secondary (all URLs verbatim from search results, read 2026-11-06): Zearn https://about.zearn.org/digital-lessons ; ST Math https://2024.mindresearch.org/blog/understanding-fractions-through-games , https://info.mindresearch.org/hubfs/Blog/PDFs/st-math-puzzle-talk-jiji-cycle.pdf , https://thelearningstandard.org/apps/st-math ; 101PPT https://ppt.101.com/ , https://ppt.ndhy.com/m/news/04192019/025631943.shtml ; 希沃 https://kcool.cn/easinote ; 洋葱 https://finance.eastmoney.com/a/202607173810344780.html ; 国家智慧平台 http://www.jyb.cn/rmtzcg/xwy/wzxw/202311/t20231110_2111115527.html ; Toy Theater http://toytheater.com/category/teacher-tools/ ; MathsBot https://mathsbot.com/manipulativeMenu ; NLVM http://nlvm.usu.edu/en/nav/topic_t_4.html ; Brainingcamp https://www.hand2mind.com/brainingcamp ; Mathigon GitHub https://github.com/mathigon (via https://static.mathigon.org/careers/software-engineer.pdf) ; Manim https://github.com/3b1b/manim ; KABULIG https://projectkabulig-dev.github.io/ ; design-os https://jangtrinh.github.io/design-os-svg-animation/ ; dynamic visualization taxonomy https://academic.oup.com/teamat/article/44/1/47/7681993 ; 交互动画 maker community https://blog.csdn.net/FifthDesign/article/details/150953160
Full per-source notes: notes/sources.md
