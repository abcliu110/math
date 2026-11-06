# Best Math Tutorials Worldwide for Grades 1–9 — Research Report
**Research date:** 2026-11-06 (JST) | **Method:** web index (`browser_search`) + text fetch (`browser_open`) on selected primary pages. “Verified live” = opened successfully in this run; “index” = search-result text only. No prices are quoted — none were verified as current in this run, and several sources warn prices change.
**Mission:** identify what to copy/borrow — as inspiration, open-licensed content, or design patterns — for a new tablet/desktop math app in Chinese curriculum context (Renjiao / People's Education Press, 人教版, grades 1–9), learning from worldwide sources.

## Summary — answer first

**Ranked shortlist (for a Chinese grades 1–9 tablet/desktop app, not a global popularity ranking):**

| Rank | Source | Best for (grades) | Verdict for us |
|---|---|---|---|
| 1 | **Singapore Math CPA + bar model** (method, not one app) | 1–9, esp. word problems, fractions, ratio, early algebra | **Borrow first.** The pedagogical spine for the whole app. Method/idea is free to learn from; do not copy any publisher's textbook wording, diagrams or problem sets. |
| 2 | **Mathigon Polypad** | 1–9 manipulatives | **Borrow the interaction pattern** (draggable fraction bars, number bars, algebra tiles, geoboard). Content is NOT reusable — see §4. |
| 3 | **ST Math (JiJi Cycle etc.)** | 1–6, esp. fractions, number sense | **Borrow the principle:** visual-first, symbols last; show the answer by animation, not by telling. Proprietary — inspiration only. |
| 4 | **GeoGebra** | 7–9 geometry, functions, transformations | **Borrow the linked-representation principle** (drag a point → equation + graph update together). Free for non-commercial use; commercial use needs a separate licence — check before embedding. Do not embed its code/UI verbatim in a commercial product without that check. |
| 5 | **Desmos** | 7–9 functions, graphing, systems | **Borrow the slider/table/graph triad.** Free to use as a tool; its activities and brand are proprietary — inspiration only, build our own grapher. |
| 6 | **Zearn Math** | K–8 lesson arc + visual models | **Borrow the lesson arc** (concrete model → guided practice → Tower of Power / mastery check → built-in reteach on struggle). Content is derivative of Eureka Math / © Great Minds — inspiration only. |
| 7 | **Khan Academy (+ Khan Academy Kids)** | 1–9 complete curriculum spine, mastery | **Borrow the curriculum map + mastery structure** (grade → unit → lesson → quiz → unit test → course challenge). Do NOT embed its videos/exercises in a commercial app — see licensing conflict in §4. |
| 8 | **Brilliant** | 5–9 (its own range is grades 5–12) intuition-first, Visual Algebra | **Borrow the “one small interactive question at a time, intelligent feedback on the wrong answer” pattern.** All content proprietary — inspiration only. |
| 9 | **Illustrative Mathematics (IM) K–8, via Open Up Resources** | 6–8 problem-based tasks | **The one large curriculum that IS openly reusable** (CC BY 4.0, 1st/2nd eds) — usable as a sequencing/task-design reference and, with attribution, as adaptable source material. Still rewrite for Renjiao topics, Chinese contexts and tablet interaction. |
| 10 | **DragonBox (now Kahoot! Algebra by DragonBox)** | 5–9 algebra intuition | **Borrow the “algebra without arithmetic/symbols first” game mechanic.** Proprietary, subscription — inspiration only. |
| 11 | **3Blue1Brown / Manim + Math Antics (YouTube)** | 7–9 intuition; 1–6 foundations | **Borrow the animation grammar** (morph, trace, colour = meaning). Manim code is MIT — reusable as a *tool* to render our own animations. The videos themselves are copyrighted — do not re-upload, clip or transcribe them. |
| 12 | **DreamBox / IXL** | 1–8 adaptive practice | **Borrow the adaptive-feedback logic** (track strategy, not just right/wrong; SmartScore-style mastery meter). Both proprietary/paid — inspiration only. |

**Bottom line for the build:** do not build a video library or a drill app. Build a **CPA manipulative-first app**: every topic starts with a draggable visual (bars, tiles, number line, balance, graph), the symbol is introduced only after the visual is understood, every wrong answer triggers a *visual* correction (show, don't tell), and practice is short, adaptive and spaced. That is the convergent lesson of Singapore, ST Math, Zearn, Polypad and DragonBox — and it is exactly where most Chinese photo-help / drill apps (Xueersi, Yuanfudao, Zuoyebang — see §5) are weakest.

---

## How to read this report on copyright — the rule applied throughout

Per the additional instruction, **nothing in this report is to be copied verbatim** — no tutorial text, image, video, problem wording or code from any source below. For every recommended technique in §6, three things are separated:

- **(a) Underlying idea / principle — free to learn from.** Pedagogical ideas, mental models, misconceptions, interaction patterns and sequencing principles are not owned by any one publisher. E.g. “a fraction is a point on a number line”, “do the same thing to both sides of a balance”, “CPA: concrete → pictorial → abstract”.
- **(b) Specific expression / assets — copyrighted, must NOT be copied.** The other party's exact wording, story, characters, artwork, colour palette, layout, problem sets, videos, code and trademarks. E.g. ST Math's JiJi the penguin, DragonBox's dragon-in-a-box, Brilliant's lesson text and diagrams, Khan Academy's videos and Sal Khan's scripts, Mathigon's textbook text, GeoGebra's UI images, Desmos's activity files.
- **(c) Our own rewritten version — how it must differ.** New visuals, new wording in Chinese (with Renjiao vocabulary), new everyday examples (Chinese contexts: yuan/jiao, metre, dumpling-sharing, classroom, high-speed rail, etc.), new interaction built from scratch, new characters/art if any. Even where source content is open-licensed (IM CC BY, Manim MIT), the report recommends rewriting/adapting rather than pasting, and attributing where the licence requires it.

**General legal caution (not legal advice):** “free to use” ≠ “free to copy into a commercial product”. Several sources are free for learners but not for commercial reuse. Get a licence check before embedding any third-party content, code or trademark, and before using the words “Khan Academy”, “GeoGebra”, “Desmos”, “DragonBox”, “Brilliant” or “ST Math” in marketing.

---

## 1. Which platforms / apps / websites / YouTube channels / curricula are best, and why?

### 1.1 Ranked table with evidence

| # | Source | URL (verbatim, as returned) | Grades / coverage | Why it is regarded as best — concrete evidence found |
|---|---|---|---|---|
| 1 | **Singapore Math — CPA + bar model + number bonds** (method; publishers include Singapore Math Inc / Dimensions Math, Marshall Cavendish) | https://bhanzu.com/parents/what-is-singapore-math ; https://www.getyourtutors.com/blog/singapore-math-vs-traditional-math-dubai/ ; https://www.aceacademy.com/en/guides/article/cpa-method-singapore-math | 1–9 | Developed by Singapore's Ministry of Education in the 1980s; Singapore has ranked #1 in TIMSS in virtually every cycle since (secondary summary, see note in §Sources). Mastery model: fewer topics, deeper, fluency before moving on. Two load-bearing tools: CPA progression and the bar model (see §2). Number bonds (e.g. 10 = 6+4) are the seed of part–whole thinking from kindergarten. |
| 2 | **Mathigon — Polypad** | https://docslib.org/download/2789414/polypad-teacher-guide (teacher-guide mirror) ; https://deepwiki.com/mathigon/textbooks/4.2-polypad | 1–9+ (textbooks aimed 12–18, Polypad K–12) | A free interactive canvas of virtual manipulatives: polygons/pattern blocks (8 regular polygons), number bars / Cuisenaire rods 1–10, fraction bars (unit fractions 1/1–1/9), tangram (7 pieces), algebra tiles, 3D polyhedra that fold/unfold, prime-factor tiles. Touch-screen, 19 languages, offline in the iOS/Android app. Described as “the textbook of the future” / “mathematical playground”. |
| 3 | **ST Math (MIND Research Institute)** | https://2024.mindresearch.org/blog/understanding-fractions-through-games ; https://connect.opened.co/tools/st-math | K–8, strongest K–3 | Spatial-temporal, language-free visual puzzles: a penguin (JiJi) must cross the screen; the pupil manipulates shapes/distances/quantities visually *before* any standard notation appears. No up-front instruction — learning by trial, pattern recognition and informative feedback. See the JiJi Cycle fraction example in §2. |
| 4 | **GeoGebra** | https://en.wikipedia.org/wiki/GeoGebra | Primary–university; used in schools grades 4–12 per secondary summary | One workspace linking geometry, algebra, statistics, calculus and 3D: points, vectors, segments, polygons, conics, inequalities, functions — all editable dynamically. Drag a point and the whole construction + its algebra update in real time. Built-in spreadsheet + CAS, sliders as parameters. GeoGebra Materials is a large community library of applets. Apps: Graphing, Geometry, 3D Calculator, CAS, Classic. |
| 5 | **Desmos** | https://knilt.arcc.albany.edu/index.php?title=Unit_2:_Incorporating_Desmos_and_Desmos_Activities_into_Mathematics_Lessons&oldid=115743 ; https://www.perkins.org/resource/graph-board-to-desmos-series-representing-functions-in-desmos/ | 3–12, strongest 6–9 functions | Free online graphing calculator + Activity Builder (teacher-paced custom activities, data collection). Type `f(x)=2x+3`, see table + graph + audio trace; any free letter becomes a slider. Marbleslides: guide marbles with piecewise functions. Classroom activities named in sources: Number Line Jumps, Linear Transformations, Polynomial Challenge (hit all given points), Building Conic Sections. |
| 6 | **Zearn Math** | https://www.teachthought.com/technology/best-math-apps-for-kids/ ; https://about.zearn.org/texas/staar | K–8 | Non-profit, 1,000+ adaptive digital lessons. Rated “Strong” (Tier 1) by Evidence for ESSA on an independent randomised study (TeachThought summary). Lessons combine fluency, visual models, guided instruction, feedback, mastery checks and paper-and-pencil prompts. Built-in differentiated support when a pupil struggles. |
| 7 | **Khan Academy** | https://blog.khanacademy.org/free-math-curriculum-from-kindergarten-to-calculus/ ; https://support.khanacademy.org/hc/en-us/articles/202262954-Can-I-use-Khan-Academy-s-videos-name-materials-links-in-my-project (verified live 2026-11-06) | K–12; Kids app ages 2–8 | Free non-profit, full curricula K–calculus with videos, articles, practice. Grade courses 1–8 plus Basic Geometry, Pre-algebra, Algebra Basics, Algebra 1, Statistics & Probability. Mastery-based: “students don't move on until they've demonstrated understanding” (secondary summary). Immediate feedback: “they can immediately learn from their mistakes, unlike traditional worksheets” (Khan blog, quoted). |
| 8 | **Brilliant** | https://brilliant.org/math/practice/ (verified live 2026-11-06) | Grades 5–12 (its own statement) | “Step-by-step interactive lessons make even complex concepts feel intuitive. Custom, intelligent feedback catches mistakes as you learn.” “Start at your level and ramp up fast. Brilliant tracks the concepts you've mastered and designs practice sets based on your progress.” Topics listed live include Fractions, Negative Numbers, Visual Algebra, Linear Equations, Functions, Quadratics, Probability and Chance, Exploring Data Visually. 10m+ learners claimed on the page. |
| 9 | **Illustrative Mathematics (IM) / Open Up Resources** | https://illustrativemathematics.org/about-im/ (verified live 2026-11-06) ; https://doe.louisiana.gov/docs/default-source/curricular-resources/price-list---illustrative-mathematics-(open-up-resources)---math-grades-6-8.pdf?sfvrsn=cc77911f_3 | K–12, esp. 6–8 | Non-profit founded 2011 at University of Arizona; IM K–5, 6–8 and 9–12 “available as open educational resources (OER) and free to access by anyone”. Problem-based, discussion-led: pupils reason, explain thinking, connect ideas across grades. EdReports all-green / perfect scores in Focus & Coherence and Rigor & Mathematical Practices (IM's own statement). |
| 10 | **DragonBox (Kahoot! Algebra by DragonBox / Algebra 2)** | https://www.edsurge.com/news/2016-03-13-enter-the-dragonbox-can-a-game-really-teach-third-graders-algebra ; https://play.google.com/store/apps/details?id=com.kahoot.algebra5 | Ages 5+ (Algebra 5+), 12–17 (Algebra 2) | Game that “secretly teaches algebra”: board split in two, isolate the box (baby dragon) on one side; 10 progressive chapters / 200 puzzles in the current Kahoot! version; Algebra 2 adds parentheses, positive/negative signs, adding fractions with common denominators, collecting like terms, factorisation, substitution. Carnegie Mellon study cited by EdSurge found gains did not automatically transfer to conventional algebra proficiency — a warning, not just praise (see §5). Now requires Kahoot!+ Family subscription (Google Play listing). |
| 11 | **YouTube: Math Antics, 3Blue1Brown, Numberphile, Khan Academy** | https://gauravtiwari.org/best-math-youtube-channels/ ; https://www.wizert.com/mathematics/blog/the-best-youtube-math-channels-for-middle-school-students | Math Antics: primary–middle; 3Blue1Brown: high-school+; Numberphile: any age | Math Antics: “simple and engaging”, animated, fractions/decimals/geometry for younger pupils; “particularly appealing to younger audiences, as it uses animations and humor”. 3Blue1Brown (Grant Sanderson): “visually stunning explanations”, “changes what the symbols mean to you” — animation-first, not procedure-first. Numberphile: mathematicians visibly delighted by numbers, curiosity/extension rather than syllabus. |
| 12 | **DreamBox Math / IXL Math** | https://dreamboxlearning.zendesk.com/hc/en-us/articles/27281843188243-How-Does-DreamBox-Math-Work ; https://jfd.jacksonms.gov/uploaded-files/fUh097/9OK174/ixl__math-grade-3.pdf (secondary PDF on IXL) | K–8 (DreamBox), Pre-K–12 (IXL) | DreamBox: Intelligent Adaptive Learning tracks *strategy*, not just right/wrong, and “immediately adjusts the lesson and the level of difficulty, scaffolding, sequencing, number of hints, and pacing”. Explicit instruction comes *after* exploration. IXL: adaptive difficulty + SmartScore, instant feedback with explanations, analytics recommending weakest skills. Both are the reference for adaptive practice — and for the risk of drill-without-understanding if copied shallowly. |
| 13 | **Math Learning Center (MLC) free apps** | https://www.neilsquire.ca/the-math-learning-center-app-suite/ ; https://teach.com/resources/10-free-math-apps-for-students-that-teachers-swear-by/ | Pre-K–5 | Free suite based on Bridges in Mathematics visual models: Fractions (circles/bars, 1–100), Geoboard (stretch bands: perimeter, area, angles, congruence, fractions), Number Pieces (base-ten), Number Frames, Number Rack, Number Line, Money Pieces, Pattern Shapes, Math Clock, Partial Product Finder. Web + iOS; no Android app (web apps instead). Not gamified — a clean manipulative toolkit, which is a strength to copy and a weakness (no sequencing) to avoid. |
| — | **China: Xueersi (TAL), Yuanfudao / Xiaohou AI, Zuoyebang** | https://github.com/studyarena-com/awesome-study-tools/blob/HEAD/README.md | China K–12 | The domestic incumbents: photo-based homework help, adaptive devices/digital practice, enrichment classes, huge question banks, AI explanation. Useful as a *competitive* reference (what Chinese parents/students already expect: photo search, wrong-question notebook / 错题本, exam-paper search) — not as a visualisation reference. See §5. |

**Also noted, not ranked as core:** Prodigy Math (grades 1–8 fantasy RPG, adaptive questions inside battles; free core, memberships), SplashLearn (Pre-K–grade 5, 4,400+ games/worksheets), Numberblocks (BBC, early number), Kumon (mastery by repetition, Japan — fluency, not visualisation), CK-12 (US non-profit OER STEM). These were mentioned in the TeachThought / Editorialge round-ups but add little beyond the ranked list for visualisation design, except Prodigy's lesson that *the maths must be the action, not the toll booth*.

**Japan — a method, not a product:** the sources found were weak/secondary (PDF mirrors). What is reliably documented in the wider literature and reflected in the sources above is: lesson study (teachers collaboratively plan–observe–revise one lesson), visual/concrete representations (number lines, fraction bars, geometric models), and a single rich problem per lesson with multiple pupil solutions compared on the board (*neriage*). Borrow the *lesson-study discipline* (one concept, several pupil strategies, compare) as a content-design process — do not claim a specific Japanese app. See “Could not verify”.

### 1.2 Renjiao (人教版) mapping — tentative, to be confirmed against the actual textbooks

The People's Education Press textbooks for grades 1–6 are organised by grade and semester (two volumes per grade) as part of China's compulsory-education curriculum — https://deepwiki.com/TapXWorld/ChinaTextbook/2.1-elementary-school-textbooks (secondary mirror, index). A GitHub knowledge graph claims 531 topics / 909 prerequisite edges aligned to China's 2022 curriculum standards and Renjiao textbooks, grades 1–9 — via https://github.locker/topics/english (index; the claim itself was not verified against the graph in this run).

**Do not treat the topic order below as a verified Renjiao table of contents.** It is the *standard* Chinese primary–junior-high sequence as it appears across the sources consulted, and it is where the visualisation priorities land:

- **Grades 1–2:** number sense to 100, addition/subtraction (incl. regrouping / 进位退位), multiplication tables, length/mass/time, shapes, simple data.
- **Grades 3–4:** multi-digit multiplication/division (incl. vertical algorithms), fractions (初步认识, then加减), decimals (初步), area/perimeter, angles, bar charts.
- **Grades 5–6:** fractions (约分/通分, mixed operations), decimals (×/÷), ratio/比例, percentages/百分数, negative numbers (初步, grade 6), circles, volume, simple equations (简易方程, grade 5), statistics (折线图, 扇形图).
- **Grades 7–9 (junior high):** rational numbers / 有理数, integers & powers, linear equations (一元一次方程) & systems (二元一次方程组), inequalities, functions (一次函数, 反比例函数, 二次函数), congruent/similar triangles, Pythagoras (勾股定理), circles, probability & statistics (概率, 统计).

**Implication:** the visualisation budget should be heaviest in grades 3–6 (fractions/decimals/ratio) and grades 7–8 (negative numbers → equations → functions), because those are the abstraction cliffs in both Renjiao and the worldwide sources.

---

## 2. Visualization & simplification techniques — concrete examples per topic

For each topic: the *technique*, a *concrete example as the source does it*, the *mental model / misconception it fixes*, and — in one line — what must change in our version (full a/b/c treatment is in §6).

### Fractions
- **ST Math — JiJi Cycle:** fraction pie wedges roll a wheel; the pupil estimates where the wheel will drop the penguin on a number line. A full circle = 1 on the number line. When the wedges unfurl, JiJi drops at the exact spot; if the pupil's basket is there, both lift into the sky, otherwise only the basket lifts. *Model:* a fraction is *one number, one point* — not two numbers stacked. *Fixes:* “1/4 is small so it must be near 0” confusion and pie-only thinking. Source: https://2024.mindresearch.org/blog/understanding-fractions-through-games
- **Polypad / MLC Fractions:** drag fraction bars (1/1–1/9) and circles; shade, compare, overlay 1/2 = 2/4 = 3/6 by laying bars side by side. *Fixes:* equivalence as same length, not same numerals.
- **Zearn:** “build and shade fraction models to visualize the math” throughout; fraction tiles model whole × fraction as repeated addition (e.g. 3 groups of 1/4). *Fixes:* multiplication of fractions as repeated addition before the algorithm. Source: https://about.zearn.org/texas/staar
- **Singapore bar model:** 3/4 of a bar shaded; part–whole bars for “3/4 of 20”. *Fixes:* fraction-of-a-quantity word problems.
- **Our rewrite must differ:** no penguin, no JiJi Cycle wheel; use e.g. a Chinese mooncake / pizza / ribbon cut on a number line, with Renjiao vocabulary (分子/分母, 约分, 通分) and yuan-sharing contexts.

### Decimals
- **Zearn / MLC Number Pieces:** decimal grids — shade 0.6 on a 10×10 grid, ask “what does this represent? How would you write it as a fraction?” (Texas IMRA review of Zearn, quoted in search). Base-ten pieces: 1 flat = 1, 1 rod = 0.1, 1 unit = 0.01. *Model:* decimals are fractions with denominator 10/100, in place-value form. *Fixes:* 0.6 vs 0.06, and “longer decimal = bigger”.
- **Number line (Desmos / Zearn):** place 0.6, 0.65, 0.7 on the same line; zoom in between 0.6 and 0.7. *Fixes:* density (“there is nothing between 0.6 and 0.7”).
- **Our rewrite:** use metre/centimetre and yuan/jiao/fen (1元=10角=100分) as the native Chinese decimal context — a place-value system pupils already live in.

### Multiplication / division
- **Area model (Zearn / Singapore):** rectangle split into tens × ones (e.g. 23×14 as 20×10 + 20×4 + 3×10 + 3×4); partial-product finder in MLC. *Model:* multiplication is area; the distributive law is visible as sub-rectangles. *Fixes:* the vertical algorithm as meaningless digit-shuffling.
- **ST Math / Singapore arrays:** 3×4 as three groups of four objects, manipulated spatially before memorising facts. *Fixes:* “× means add the same number” vs. commutativity as rotating the array.
- **Bar model for division (Inside Mathematics, via Singapore):** a bar split into equal parts; the unknown part is “?” — division as finding the unit size. Source: https://scitechinstitute.org/listing/inside-mathematics-4th-grade-math-number-operations-multiplication-division/
- **Long division (DragonBox / EdSurge discussion):** the EdSurge piece notes a long-division problem can need 12 single-digit calculations — so 90% per-step accuracy gives only ~28% whole-problem accuracy. *Lesson:* fluency (instant, accurate facts) must be built *before* multi-step procedures, or the procedure collapses. Do not copy the article's numbers as our marketing; use the principle to justify a fluency track.

### Negative numbers
- **Brilliant:** lists Negative Numbers as a foundational topic, taught through interactive problems with intelligent feedback (not a lecture). **DragonBox Algebra 2:** adds positive/negative signs as game objects to be manipulated. **Number line (all sources):** temperature, lift/elevator, debt — move left/right, see −3 + 5 as a journey, not a rule. *Fixes:* “minus a negative = ?” and “−5 is bigger than −3 because 5 > 3”.
- **Our rewrite:** use Harbin winter temperature, basement floors (B1/B2), and a Chinese number-line “lift” — not a copied Brilliant/DragonBox screen.

### Equations
- **DragonBox:** two-sided board; isolate the dragon-box by doing the *same* drag/operation to both sides; cards that cancel (e.g. +5 / −5, ×/÷) become visible as inverse pairs. No symbols at first — “algebra without arithmetic”.
- **Balance-scale (the classic, used by GeoGebra / many IM tasks):** a scale stays level only if both pans change equally; remove 3 from both sides, the scale stays balanced. *Model:* equality is balance, not “the answer comes next”. *Fixes:* “do it to one side only” and “= means compute”.
- **Singapore comparison bar → algebra:** 1 unit = x, 3 units = 3x, total 4 units = 180 → x + 3x = 180 emerges from the picture (secondary summary). *Fixes:* the jump from arithmetic bar to symbolic equation.
- **Our rewrite:** a new balance with Chinese weights / a steelyard (杆秤) or a seesaw, new art, Renjiao equation vocabulary (等式, 方程, 移项 as “move across, change sign” *shown* by the balance tipping).

### Functions
- **Desmos:** slider for `a` in `y = ax + b`; drag `a` and watch slope steepen, drag `b` and watch the line slide; table ↔ graph ↔ equation shown together. Marbleslides: piecewise functions guide a marble along a path. *Model:* a parameter is a *handle* you can pull; a function is a machine / a trace, not a formula to memorise.
- **GeoGebra:** same linked representation, plus dragging a point on a parabola and seeing its coordinates and equation update; transformations as dragging.
- **3Blue1Brown:** morphing animations — e.g. a line rotating, an area sweeping — to show *why* a derivative/integral behaves as it does. *For grades 7–9:* the same grammar at a simpler level — a taxi fare (起步价 + per-km) as a line whose intercept is the flag-fall and slope is the per-km price.
- **Our rewrite:** build our own lightweight grapher (do not embed Desmos/GeoGebra UI); Chinese contexts (taxi, phone data plan, water bill) with Renjiao function vocabulary (自变量/因变量, 一次函数 y=kx+b).

### Geometry proofs
- **GeoGebra:** construct a triangle, drag a vertex, watch angle sum stay 180°, or a parallelogram's opposite sides stay equal — *proof by invariance under dragging*. Fold/unfold 3D polyhedra in Polypad. Geoboard (MLC): stretch bands to make shapes with a given perimeter/area. *Model:* a theorem is a property that *survives* dragging. *Fixes:* “proof is a list of steps to memorise” and static-diagram thinking.
- **Mathigon:** tessellations with polygon tiles, pentagon exploration, origami/tangram dissections — proof as *doing* (cut, rotate, reassemble).
- **Our rewrite:** drag-to-prove with Renjiao theorems (三角形内角和, 勾股定理 by area dissection, 全等/相似 by overlay) — new dissection animations, not GeoGebra's construction UI.

### Probability / statistics
- **Brilliant:** “Exploring Data Visually”, “Probability in Data”, “Predicting with Probability” — interactive data, not formulas first. **Desmos:** regression / data plots, sliders for data sets. **IM (6–8):** problem-based data tasks (collect, plot, argue). **Polypad:** dice / spinners / data tiles on a canvas.
- **Concrete pattern to borrow:** *simulate first, formula second* — flip a (virtual) coin 100 times, watch the running proportion settle near 1/2; draw a bar chart, drag a data point, watch mean/median move. *Fixes:* “probability = a fraction I compute” vs. “probability = long-run frequency”, and mean as a balancing point.
- **Our rewrite:** Chinese data contexts (class height, weekly rainfall, dice games / 骰子, red-envelope draws) with Renjiao terms (众数/中位数/平均数, 概率).

---

## 3. Structure, sequencing, practice, feedback, mistakes, adaptive review

| Dimension | What the best do (with source) | What to borrow as a *pattern* |
|---|---|---|
| **Grade → topic map** | Khan: Early Math → K → grades 1–8 → Pre-algebra → Algebra 1 → Geometry → Algebra 2, each course = units → lessons → quiz → unit test → course challenge. IM: units of problem-based lessons, coherent across grades. Zearn: “missions” in a fixed sequence (e.g. grade 5: place value → decimal fractions → base-ten operations → … → coordinate graphing). | One spine: **Renjiao grade/semester → unit → concept → lesson**. Every lesson shows its prerequisite (e.g. “needs: equivalent fractions”) and its next step. Do not copy Khan/IM/Zearn unit titles or ordering verbatim — re-derive the order from Renjiao + the prerequisite graph (cf. the cn-math-taxonomy idea: 531 topics / 909 edges — treat as an *idea*, verify against Renjiao). |
| **Lesson arc** | Zearn/DreamBox: *explore with a visual → guided instruction (short) → practice with the same visual → mastery check*. DreamBox: “explicit instruction … after student exploration” and “scaffolding to help students explore patterns … through manipulatives, number progressions, and guided discovery”. ST Math: no instruction up front at all. | **Explore → Name → Practise → Check** in every lesson. Never start with a rule. The symbol/name appears after the pupil has *done* it visually. |
| **CPA sequencing** | Singapore: Concrete (blocks/counters) → Pictorial (bar, ten-frame, number line) → Abstract (symbols only). On tablet, “concrete” = draggable tiles that behave like physical objects (snap, stack, cut). | Make CPA a *mode switch* in every manipulative: [实物/tiles] → [图/bar/line] → [式/symbols], with a visible toggle so the pupil sees the same problem in all three forms. |
| **Practice & fluency** | Khan: mastery levels per skill (Proficient/Mastered), mixed “mastery challenge”. IXL: SmartScore rises with correct answers, falls with mistakes; 10 questions/day free (secondary summary — do not quote as current pricing). DreamBox: 48,000 data points/hour claimed (secondary summary) — track *strategy*, not just correctness. | Fluency as a *separate, short, daily* track (5–10 min, e.g. times tables, fraction equivalence) with instant facts, distinct from concept lessons. Do not build a SmartScore clone with the same name/meter — build our own mastery meter with different visuals and thresholds. |
| **Feedback on mistakes** | Brilliant: “Custom, intelligent feedback catches mistakes as you learn.” Khan: immediate feedback, learn from mistakes at once. ST Math: *informative* feedback — the animation *shows* where JiJi lands vs. where the pupil predicted; no red X + “wrong”. Zearn: “when students struggle, they get built-in differentiated support”. | **Show, don't tell.** On a wrong answer: replay the visual (the wheel unfurls, the balance tips, the bar doesn't match), highlight the *specific* misconception (e.g. “you added denominators”), offer a *smaller* visual step — not the answer. Never a bare “× Wrong, the answer is …”. |
| **Mistakes as data** | DreamBox: “wrong answers only give the system more information”; “If students complete topics without fully grasping them, conceptual gaps can form.” IXL Analytics: recommends only weakest skills. | Keep a **misconception tag** per error (e.g. `frac-add-denominators`, `neg-sign`, `balance-one-side`), not just a score. Reteach that tag, not the whole unit. |
| **Adaptive review / spaced repetition** | Khan: mastery challenge mixes old skills. DreamBox: adjusts difficulty, scaffolding, sequencing, hints, pacing “immediately” from each interaction. Zearn: adaptive lessons “move students through this consistent mission sequence” with support in the moment. | **Adaptive loop:** diagnostic → lesson at the right CPA stage → 3–5 practice items → if 2 errors on one tag, drop back one CPA stage + a visual reteach → spaced re-check at +1 day / +1 week (own intervals, not copied from any vendor). Wrong-question notebook (错题本) is the Chinese-native form of this — make it visual (each wrong item stores its *visual* state, not just the question text). |
| **Motivation** | DragonBox: stars for efficiency, puzzles unlock. Prodigy: maths is the spell-casting action. Brilliant: streaks/daily encouragement. ST Math: JiJi crossing is the reward. | Reward *insight*, not just completion: “aha” moments, efficiency, explaining in own words. Avoid Prodigy-style pay-to-win / grinding and DragonBox's star-chasing if it rewards speed over understanding. |
| **Teacher / parent view** | Khan: activity overview, per-student report, assignments. Zearn: teacher-led small-group lessons + digital lessons. Desmos Activity Builder: teacher pacing + live data. | Parent/teacher dashboard: time, mastery by tag, misconceptions, next reteach — in Chinese, aligned to Renjiao units. No pupil data sale / ads (note Zearn's own privacy stance as a *principle* to match). |

---

## 4. Open-licensed / free to reuse vs. inspiration-only

| Source | Licence / terms as found | What this means for us |
|---|---|---|
| **Illustrative Mathematics (IM) K–12 via Open Up Resources** | CC BY 4.0 (1st & 2nd editions). “Our Illustrative Mathematics 6–8 Math Curriculum is an Open Educational Resources (OER) [sic] free to download and use with a CC-BY license.” — Louisiana DOE price list (index). IM itself: K–5, 6–8, 9–12 “available as open educational resources (OER) and free to access by anyone” (verified live). | **Genuinely reusable with attribution** — the strongest open curriculum in this set. Still rewrite: translate, re-contextualise to China, rebuild interactions for tablet, and do not present it as IM / Open Up Resources. Attribute the original. Check the edition/version licence on the actual files before reuse (later IM v.360 editions may differ). |
| **Manim (3Blue1Brown's animation engine)** | MIT License. “Manim is an open-source Python animation engine … released under the MIT License” (Wikipedia, index). ManimCE also MIT. | **Reusable code (tool).** Use ManimCE to *render our own* explanatory animations (our scripts, our drawings, our narration). Do not reuse 3Blue1Brown's video files, scripts or scenes. |
| **Mathigon JS libraries (core.js / euclid.js / boost.js)** | MIT License (GitHub / jsDelivr). “Released under the MIT license.” | **Reusable code libraries only.** The *textbook content* is NOT MIT. |
| **Mathigon textbooks (content)** | **UNLICENSED / private — “do not copy content into other projects.”** — AGENTS.md in a mirror of the textbooks repo (index). Treat as authoritative for caution until the official repo states otherwise. | **Inspiration only.** Do not copy Polypad's lesson text, images or course content. The *idea* of a draggable manipulative canvas is a pattern, not content. |
| **Khan Academy videos / articles / exercises** | **Conflict — flag it.** Khan Help Center (verified live, updated 2026-07-15): CC BY-NC-SA licence “for video and exercise use”, attribution + non-commercial, platform not licensable; use in a paid offering is NOT non-commercial. BUT a college OER guide notes: “Technically, Khan Academy is no longer an OER repository. The videos are no longer openly licensed as they removed CC BY NC SA license notice… do not download, modify the content, and repurpose it.” — https://www.hcc.edu/library/build-your-oer-course/find-oer/oer-videos/khan-academy (index). | **Treat as inspiration-only for a commercial app.** Do not embed, download or adapt Khan videos/exercises. Linking out to khanacademy.org is the safe use Khan itself invites. Resolve the conflict with a direct licence check before any reuse. |
| **GeoGebra** | GeoGebra Licence; free for non-commercial use; source code (except installers, web services, UI images/style, docs/language files) GPL-3.0; UI/docs CC BY-NC-SA 3.0. “Free for non-commercial use, including most use by teachers, students, and parents… Commercial use requires a separate license.” (Wikipedia + secondary summaries, index). | **Free to use as a tool; not free to embed in a commercial product without a licence.** Build our own grapher/geometry engine, or seek a commercial licence. Do not copy GeoGebra's UI assets. |
| **Desmos** | Free to use (graphing calculator, no ads, offline). No open licence found for its code or Activity Builder content in this run. | **Inspiration only / tool use.** Do not embed Desmos code or copy its activities. Build our own slider-graph interaction. |
| **Brilliant** | Terms of Use eff. 2026-02-09: all content “protected by copyrights… User agrees not to sell, license, rent, modify, distribute, copy, reproduce, transmit, publicly display… adapt, edit or create derivative works” without written permission. https://brilliant.org/terms-of-use/ (index). | **Inspiration only. No reuse.** |
| **ST Math, Zearn, DreamBox, IXL, DragonBox/Kahoot!, Prodigy, SplashLearn** | All proprietary / paid / subscription (per their listings and round-ups). Zearn content is derivative of Eureka Math © Great Minds 2019 (Zearn family materials, index). DragonBox requires Kahoot!+ Family subscription. | **Inspiration only. No reuse** of characters, puzzles, lessons, wording or art. |
| **Math Learning Center apps** | Free to use (web + iOS). Licence for reuse *not verified* in this run; one round-up warns: “Check the license on each simulation before reusing it outside your own class.” | **Treat as inspiration-only until the licence on each app is checked on mathlearningcenter.org.** Free ≠ open-licensed. |
| **3Blue1Brown / Math Antics / Numberphile videos** | Copyrighted videos (YouTube standard licence unless stated otherwise). Manim is MIT; the videos are not. | **Inspiration only for the videos.** Reuse only the *tool* (Manim) and the *animation grammar*. |
| **Singapore Math (method)** | CPA / bar model / number bonds are *methods* (Bruner 1966; Singapore MOE 1980s). No one owns the method. Specific textbooks (Dimensions Math, Marshall Cavendish, etc.) are copyrighted. | **Method: free to learn from. Textbooks/problems/diagrams: do not copy.** Draw our own bars, use our own word problems. |
| **Renjiao / PEP textbooks** | Copyrighted by People's Education Press. (No licence found suggesting open reuse.) | **Align to the topic sequence (a fact about the curriculum); do not copy textbook text, images or exercises verbatim.** Write original problems. |
| **CK-12, OpenStax** (not deep-checked) | CK-12 is a US non-profit OER provider (mentioned in round-ups); OpenStax is CC BY. | **Candidate for a follow-up check** — not relied on in this report. Do not assume reuse rights without opening the licence page. |

**Rule of thumb for the team:** if a source's licence was not found on its own official page in this run, assume **inspiration-only** and log it as “licence not verified” in the build backlog.

---

## 5. Gaps / weaknesses for Chinese primary–junior-high students on tablet & desktop

1. **Language & curriculum mismatch.** Almost all top sources are in English and aligned to US Common Core / UK / Singapore syllabuses. None maps to Renjiao chapter order, Chinese vocabulary (约分, 通分, 简易方程, 一次函数, 勾股定理), or Chinese exam formats (填空, 选择, 解答题, 应用题). A direct translation would teach the wrong sequence and the wrong problem types.
2. **Transfer gap (DragonBox / ST Math warning).** EdSurge/Carnegie Mellon: DragonBox builds algebra *intuition* but does not automatically produce conventional algebra proficiency. ST Math is “not a primary curriculum” and “not a fit for older students who already grasp the concepts” (OpenEd summary). **Gap to close:** every visual game must end with a *bridging* step to symbolic, written, exam-style work — otherwise pupils can play but not pass.
3. **Fluency vs. understanding split.** Khan/IXL/DreamBox are strong on adaptive drill; ST Math/DragonBox are strong on intuition; few do both in one lesson. Chinese pupils need both: instant arithmetic fluency (the EdSurge long-division arithmetic) *and* conceptual models. Chinese drill apps (Xueersi/Yuanfudao/Zuoyebang) do the drill + photo-help well but are weak on visualisation (per their own positioning: photo search, question banks, AI explanation — see §1.13).
4. **Tablet interaction is an afterthought in most sources.** Khan is video + typed/multiple-choice; Brilliant is tap-to-answer; Desmos/GeoGebra are desktop-first (mouse, keyboard). Only Polypad, MLC and DragonBox are genuinely touch-first (drag, pinch, cut, fold). **Gap:** a tablet app must be designed for fingers (large drag targets, no tiny text entry, handwriting / 错题本 with stylus) and for desktop (keyboard shortcuts, larger canvas) — not a phone UI stretched.
5. **Word problems in Chinese are linguistically dense.** Singapore bar models help, but Chinese 应用题 often pack several conditions into one sentence with implicit units. None of the Western sources teaches *parsing* Chinese word problems. **Gap:** a “read → draw the bar → label → ?” scaffold in Chinese, with the bar built *from* the sentence (tap a phrase, it becomes a bar segment).
6. **Parent/teacher expectations in China.** Chinese parents expect visible progress against school units, a wrong-question notebook, and exam readiness. Western apps optimise for “fun / aha / streak”. **Gap:** progress must be reported per Renjiao unit and per misconception, not just “XP / stars”.
7. **Offline / device reality.** Polypad's app runs offline; Desmos calculator runs offline; most others need internet. Chinese learning tablets are often used offline or on shared family devices. **Gap:** core manipulatives must work offline; sync/progress only when online.
8. **No source covers Chinese-specific visual conventions.** E.g. the vertical multiplication/division algorithm (竖式) as taught in China, the number-line conventions in Renjiao, or the specific fraction/decimal introductions in grades 3–5. Copying a US number-line or area model without checking Renjiao's conventions will confuse pupils who see a different layout at school.
9. **Age cliff at grades 7–9.** Most “best apps for kids” stop at grade 5–6 (SplashLearn, Khan Kids, MLC). Brilliant starts at grade 5, GeoGebra/Desmos are not curricula. **Gap:** grades 7–9 need a *curriculum*, not just a tool — which is why IM (6–8) + Singapore bar→algebra + Desmos-style functions matter most there.

---

## 6. Recommendations — borrow first (with a/b/c separation for each)

### 6.1 Top 8 techniques / content patterns to borrow first

#### 1. CPA mode-switch in every manipulative (Singapore)
- **(a) Principle:** a concept is learned Concrete → Pictorial → Abstract; the symbol only arrives after the meaning is built. The hand does the thinking first (Bruner). *Mental model:* the same quantity in three forms is the *same* thing. *Misconception fixed:* symbols as meaningless rules.
- **(b) Do NOT copy:** any Singapore publisher's textbook pages, bar-model worksheets, number-bond diagrams, or Dimensions Math problem wording/images.
- **(c) Our version:** a three-tab toggle on every canvas — [动手 Drag tiles] → [画图 Bar / number line] → [列式 Symbols] — with the *same* numbers carried across. Visuals: our own flat, high-contrast tiles in a Chinese palette (not Singapore's), Chinese labels, contexts (e.g. 12个饺子分成3盘). Interaction: drag tiles on tablet; on desktop, drag + keyboard nudges.

#### 2. Visual-first, symbols-last + animated feedback (ST Math JiJi Cycle)
- **(a) Principle:** show the answer by animation; let the pupil predict, then *see* where the prediction lands vs. reality. No red X. *Mental model:* a fraction is a point; an error is a visible distance, not a moral failure. *Fixes:* fear of being wrong, pie-only fraction thinking.
- **(b) Do NOT copy:** JiJi the penguin, the JiJi Cycle wheel/basket, ST Math's puzzles, art, sounds or level names.
- **(c) Our version:** e.g. a “fraction train” — a ribbon that unrolls onto a number line, or a mooncake cut that slides onto a line; our own character (if any — a panda/red panda is a cliché; prefer no mascot, or an abstract “小方” block character drawn originally). Feedback: the ribbon unrolls to the true point; the pupil's marker stays where they put it; the *gap* is the lesson. Wording in Chinese: “你猜的在这里，实际在这里，相差多少？”

#### 3. Bar model as a word-problem parser (Singapore)
- **(a) Principle:** turn prose into proportional rectangles; label knowns, mark “?” for the unknown; the picture *says* the operation. Part–whole bars (addition/subtraction/fractions) and comparison bars (ratio/algebra). *Fixes:* “I don't know whether to add or subtract” — the bar decides.
- **(b) Do NOT copy:** Singapore textbook bar diagrams, worked examples or word problems verbatim.
- **(c) Our version:** an interactive bar builder: tap a phrase in the Chinese problem → it becomes a labelled bar segment; drag to resize proportionally; the equation appears *from* the bar (1 unit = x). Examples: sharing 红包, comparing two classes' book counts, “小明比小红多8个”. Visuals: our own rounded bars, distinct from any publisher's style.

#### 4. Balance-scale equations (DragonBox + classic balance)
- **(a) Principle:** equality is balance; do the same to both sides or it tips. Inverse operations are visible as cancelling pairs. *Fixes:* one-sided operations, “=” as “compute”.
- **(b) Do NOT copy:** DragonBox's two-sided board, dragon-in-a-box, cards, stars, sounds, puzzle sequence; nor any other app's balance artwork.
- **(c) Our version:** a steelyard / seesaw / kitchen scale with Chinese weights, built from scratch; drag “+3” onto both pans and watch it stay level, drag it onto one pan and watch it tip with a wobble. Wording: Renjiao 等式/方程/移项, with the “move across, change sign” step *shown* as lifting a weight across the pivot. Start with pictures (grade 5 简易方程), end with symbols (grade 7 一元一次方程).

#### 5. Slider + table + graph triad for functions (Desmos / GeoGebra)
- **(a) Principle:** a parameter is a handle; changing it changes the table *and* the graph *and* the equation together (linked representations). *Fixes:* functions as formulas to memorise; slope/intercept as abstract letters.
- **(b) Do NOT copy:** Desmos's calculator UI, Activity Builder activities, Marbleslides, or GeoGebra's Classic UI, icons, or construction tools.
- **(c) Our version:** a minimal, tablet-first grapher we build ourselves: one big graph, one slider per parameter (k, b), a live table that fills as you drag a point. Contexts: taxi fare (起步价 + 每公里), phone plan, water bill — y=kx+b with Chinese units. No Desmos/GeoGebra branding or layout.

#### 6. Explore → Name → Practise → Check lesson arc + visual reteach on struggle (Zearn / DreamBox)
- **(a) Principle:** exploration before explicit instruction; when a pupil struggles, drop back a stage and reteach *visually*, don't just repeat the question. Track strategy/misconception, not just score. *Fixes:* “I got it wrong, I don't know why, I'll guess”.
- **(b) Do NOT copy:** Zearn's lesson scripts, Tower of Power, Eureka-derived content, DreamBox's lesson text/art, or IXL's SmartScore name/meter.
- **(c) Our version:** a 4-step arc in Chinese with our own scripts: ① 动手试一试 (drag) ② 说一说 (name the pattern in own words) ③ 练一练 (3–5 items, same visual) ④ 测一测 (mastery check). On 2 errors with the same tag: auto-drop to the pictorial stage + a 30-second reteach animation. Our own mastery meter (e.g. three lanterns / three stars with different meaning — or no stars at all, a “掌握度” bar).

#### 7. Misconception-tagged adaptive review + visual wrong-question notebook (DreamBox / IXL + Chinese 错题本)
- **(a) Principle:** every error is tagged by *why* (not just *which* question); review is spaced and targeted at the tag; the notebook stores the visual state, not just text. *Fixes:* re-doing whole units, forgetting the same error.
- **(b) Do NOT copy:** DreamBox's adaptive engine description as a spec, IXL's SmartScore/analytics UI, or any vendor's question bank.
- **(c) Our version:** 错题本 where each entry replays the manipulative as the pupil left it (the bar they drew, the balance they tipped), with a one-line Chinese hint (“分母不能直接相加，先通分”). Spaced re-checks at our own intervals (+1 day, +1 week) per tag. Parent view: “本周3个易错点：分数加法、负数大小、移项” — in Chinese, per Renjiao unit.

#### 8. Short animation grammar for “why” (3Blue1Brown / Manim + Math Antics)
- **(a) Principle:** morph, trace and colour = meaning; a transformation shown over time teaches *why*, not just *how*. One idea per 60–90 second animation; pause-and-predict before the reveal. *Fixes:* procedure without intuition (e.g. “invert and multiply” for dividing fractions).
- **(b) Do NOT copy:** 3Blue1Brown's videos, scripts, scenes, colour scheme (dark background + specific palette is their signature — choose a different, light, classroom-friendly palette), Math Antics' character/scripts, or any YouTube clip/transcript.
- **(c) Our version:** render our own animations with ManimCE (MIT — reusable tool) or our own web animation code, from *our* scripts in Chinese, with our own drawings (e.g. dividing fractions as “how many 1/4s fit in 3/4?” shown by fitting tiles). Keep them short, silent-friendly (subtitles), and replayable inside the lesson — not a separate video library.

### 6.2 Three flagship interactive visualisations to prototype first

| # | Prototype | Inspired by | Renjiao home | What to build (original) |
|---|---|---|---|---|
| **P1** | **Fraction cutting + number-line unrolling** | ST Math JiJi Cycle (a) + Polypad fraction bars (a) + Zearn shading | Grades 3–5: 分数的初步认识, 分数加减, 约分/通分 | Drag to cut a ribbon/mooncake into equal parts; the cut pieces *unroll* onto a number line (1 whole = 1); overlay two fractions to compare/equate; add fractions by laying pieces end-to-end on the line, then *see* why denominators must match (pieces of different sizes don't line up). (a) Fraction = point + part of a whole. (b) No penguin/wheel, no Polypad/Zearn art. (c) Chinese contexts, our own cut/unroll animation, Renjiao terms. **Success metric:** pupil can place 3/4 and 6/8 at the same point and explain why. |
| **P2** | **Balance-scale equations** | DragonBox two-sided board (a) + Singapore bar→algebra (a) | Grade 5 简易方程 → Grade 7 一元一次方程 | A balance that tips in real time. Pupil drags weights / x-blocks onto pans; “do the same to both sides” is enforced by the physics (one-sided drag tips it). Inverse pairs cancel with a visible “pop”. Then the bar model appears beside the balance, then the equation `x + 3x = 180` appears *from* the bar. (a) Equality = balance. (b) No dragon/box/cards, no copied balance art. (c) Steelyard/seesaw with our own art, Chinese weights, Renjiao wording. **Success metric:** pupil solves `3x + 5 = 20` by balance moves, then writes the steps. |
| **P3** | **Function graph dragging (slider + table + graph)** | Desmos sliders (a) + GeoGebra linked representations (a) | Grade 7–8: 一次函数, 反比例函数, 二次函数 (intro) | Drag `k` and `b` sliders for `y = kx + b`; the line, the table and the story (taxi fare) update together. Drag a point along the line and read its (x, y) in the table. “What if” challenges: make the line pass through (2, 10); make it steeper but keep the same starting price. Later: drag the vertex of a parabola. (a) Parameter = handle; function = trace. (b) No Desmos/GeoGebra UI, no Marbleslides. (c) Our own lightweight grapher, Chinese contexts, Renjiao function vocabulary. **Success metric:** pupil predicts the graph from `k`/`b` before dragging, and explains slope as “每公里多少钱”. |

**Prototype order:** P1 first (grades 3–5, highest pain, clearest visual win), P2 second (bridges primary→junior high, the algebra cliff), P3 third (grades 7–8, needs the most engineering — build the grapher once, reuse for all functions).

---

## Could not verify / open questions

- **Khan Academy licence conflict** (see §4): Khan Help Center says CC BY-NC-SA; a college OER guide says Khan “is no longer an OER repository” and the CC notice was removed. **Do not reuse Khan content until this is resolved by reading Khan's current Terms of Service directly.** Khan's main math page returned a “Client Challenge” on text fetch in this run, so it was not verified live.
- **Detailed Renjiao chapter/topic order per grade/semester** was not verified against the official People's Education Press site in this run. The mapping in §1.2 is a standard-sequence summary from secondary mirrors; confirm against the actual 人教版 textbooks (or the 2022 curriculum standards) before locking the content spine.
- **Prices / subscription costs** for Brilliant, DragonBox/Kahoot!, IXL, DreamBox, Prodigy, etc. were not verified as current and are deliberately not quoted. Check each vendor's current pricing page before any build-vs-buy decision.
- **GeoGebra commercial licence terms and Math Learning Center reuse licence** were not read on their official licence pages in this run — both are flagged “check before embedding”.
- **Japan:** no primary Japanese source (textbook, app, or MEXT material) was verified; the Japan paragraph in §1.1 is a method summary, not a product recommendation.
- **Effect sizes:** Zearn's ESSA Tier 1 and Singapore's TIMSS #1 claims are as reported in secondary summaries; the underlying studies were not re-read in this run. Do not quote effect sizes in product marketing without reading the studies.
- **China apps:** Xueersi/Yuanfudao/Zuoyebang positioning is from a directory summary; their current features/pricing were not verified on their official sites.

## Sources

*Every URL below is copied verbatim from a search result or a page opened in this run (2026-11-06). “Verified live” = `browser_open` succeeded; otherwise “index”.*

- Khan Academy curriculum list — https://blog.khanacademy.org/free-math-curriculum-from-kindergarten-to-calculus/ (index)
- Khan Academy reuse / CC BY-NC-SA — https://support.khanacademy.org/hc/en-us/articles/202262954-Can-I-use-Khan-Academy-s-videos-name-materials-links-in-my-project (verified live)
- Khan Academy no-longer-OER note — https://www.hcc.edu/library/build-your-oer-course/find-oer/oer-videos/khan-academy (index)
- Brilliant math practice — https://brilliant.org/math/practice/ (verified live)
- Brilliant Terms of Use — https://brilliant.org/terms-of-use/ (index)
- GeoGebra — https://en.wikipedia.org/wiki/GeoGebra (index)
- Desmos activities — https://knilt.arcc.albany.edu/index.php?title=Unit_2:_Incorporating_Desmos_and_Desmos_Activities_into_Mathematics_Lessons&oldid=115743 (index)
- Desmos functions — https://www.perkins.org/resource/graph-board-to-desmos-series-representing-functions-in-desmos/ (index)
- Mathigon Polypad teacher guide — https://docslib.org/download/2789414/polypad-teacher-guide (index)
- Mathigon Polypad (DeepWiki) — https://deepwiki.com/mathigon/textbooks/4.2-polypad (index)
- Mathigon textbooks licence warning — https://github.com/liangdabiao/textbooks/blob/HEAD/AGENTS.md (index)
- Mathigon MIT licence (boost.js) — https://github.com/mathigon/boost.js/blob/master/LICENSE (index)
- DragonBox / EdSurge — https://www.edsurge.com/news/2016-03-13-enter-the-dragonbox-can-a-game-really-teach-third-graders-algebra (index)
- DragonBox (Google Play) — https://play.google.com/store/apps/details?id=com.kahoot.algebra5 (index)
- Singapore Math CPA — https://bhanzu.com/parents/what-is-singapore-math (index)
- Singapore Math vs traditional — https://www.getyourtutors.com/blog/singapore-math-vs-traditional-math-dubai/ (index)
- Singapore CPA guide — https://www.aceacademy.com/en/guides/article/cpa-method-singapore-math (index)
- ST Math fractions (JiJi Cycle) — https://2024.mindresearch.org/blog/understanding-fractions-through-games (index)
- ST Math review — https://connect.opened.co/tools/st-math (index)
- Zearn — https://www.teachthought.com/technology/best-math-apps-for-kids/ (index)
- Zearn models — https://about.zearn.org/texas/staar (index)
- Illustrative Mathematics — https://illustrativemathematics.org/about-im/ (verified live)
- IM / Open Up Resources CC BY price list — https://doe.louisiana.gov/docs/default-source/curricular-resources/price-list---illustrative-mathematics-(open-up-resources)---math-grades-6-8.pdf?sfvrsn=cc77911f_3 (index)
- DreamBox how it works — https://dreamboxlearning.zendesk.com/hc/en-us/articles/27281843188243-How-Does-DreamBox-Math-Work (index)
- IXL (secondary PDF) — https://jfd.jacksonms.gov/uploaded-files/fUh097/9OK174/ixl__math-grade-3.pdf (index)
- Math Learning Center apps — https://www.neilsquire.ca/the-math-learning-center-app-suite/ (index)
- Math Learning Center / free apps — https://teach.com/resources/10-free-math-apps-for-students-that-teachers-swear-by/ (index)
- 3Blue1Brown / Manim — https://en.m.wikipedia.org/wiki/Manim#Manim (index)
- Manim MIT — https://animo.video/what-is-manim (index)
- YouTube channels — https://gauravtiwari.org/best-math-youtube-channels/ (index) ; https://www.wizert.com/mathematics/blog/the-best-youtube-math-channels-for-middle-school-students (index)
- Bar model in division — https://scitechinstitute.org/listing/inside-mathematics-4th-grade-math-number-operations-multiplication-division/ (index)
- Renjiao textbooks (secondary mirror) — https://deepwiki.com/TapXWorld/ChinaTextbook/2.1-elementary-school-textbooks (index)
- China math taxonomy (Renjiao-aligned graph, claim unverified) — https://github.locker/topics/english (index)
- China apps directory — https://github.com/studyarena-com/awesome-study-tools/blob/HEAD/README.md (index)

*No page instructions were encountered that attempted to redirect this mission; none were followed. No copyrighted text, image or code from any source above was copied verbatim into this report — all descriptions are original summaries, and §6 explicitly separates principle (free to learn from) from expression (must not be copied) from our rewritten version.*
