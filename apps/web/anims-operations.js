/* anims-operations.js：运算动画（注册表）；每加一个动画调一次 registerAnim，格式见 anims-registry.js 的文件头注释，另写 group: 'operations'；本文件顶层只能调 registerAnim，不能引用 app.js 的标识符。
   本批 10 个动画，对应第 10 轮调研“ Biggest opportunities ”的 10 个空白机会。
   与已有演示的关系写在每个动画的副文和段首注释里：已有演示只扩展，不重复做。
   约定：字符串里不写花括号，render 里不出现 script 结束标签；所有 id 以动画 key 为前缀。 */

/* (1) op-overshoot：试商可见超调。已有 trialdiv 是单步文字验算（150÷26，拨商、乘回去看大了还是小了）。
   本动画是它的进阶版：超调画成一条会“冒出去”的条，商×除数超过被除数多少一眼可见；
   另加“把除数看成整十数再试”的试商策略，三道新题都不与 trialdiv 重复。 */
registerAnim({
  key: 'op-overshoot',
  title: '试商超调：商大了会怎样',
  sub: '试一个商，乘回去，超出的部分画出来给你看——商大了就调小，调到正好停住。',
  grade: 4,
  kind: '实验',
  points: ['4.6'],
  group: 'operations',
  render: function (el) {
    var K = 'op-overshoot';
    var LEVELS = [
      { label: '基础', a: 168, b: 24, q: 7, start: 8, round: '把 24 看成 20：168÷20 大约是 8，从 8 往下试。' },
      { label: '提高', a: 252, b: 36, q: 7, start: 6, round: '把 36 看成 40：252÷40 大约是 6，从 6 往上试。' },
      { label: '挑战', a: 483, b: 69, q: 7, start: 7, round: '把 69 看成 70：483÷70 大约是 7，直接试 7。' }
    ];
    var li = 0, guess = 8, sawOver = [false, false, false], tiers = null;
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function barHtml() {
      var L = LEVELS[li];
      return '<p>被除数 ' + L.a + '（整条蓝条）</p>' +
        '<div style="height:22px;background:#dbeafe;border:1px solid #93c5fd;border-radius:4px"></div>' +
        '<p>商 × 除数：' + guess + ' × ' + L.b + ' = ' + (guess * L.b) + '</p>' +
        '<div id="' + K + '-bar"></div>' +
        '<p id="' + K + '-bar-note"></p>';
    }
    function paintBar() {
      var L = LEVELS[li], prod = guess * L.b;
      var bar = gid(K + '-bar'), note = gid(K + '-bar-note');
      if (!bar) return;
      var pct = Math.min(100, Math.round(prod / L.a * 100));
      var color = prod > L.a ? '#ef4444' : '#22c55e';
      bar.innerHTML = '<div style="height:22px;width:' + pct + '%;background:' + color + ';border-radius:4px"></div>';
      if (note) {
        if (prod > L.a) note.textContent = '红条超过了蓝条：超了 ' + (prod - L.a) + '。';
        else if (prod === L.a) note.textContent = '绿条和蓝条一样长：正好除尽。';
        else note.textContent = '绿条比蓝条短 ' + (L.a - prod) + '，还剩 ' + (L.a - prod) + ' 没分。';
      }
    }
    function setLevel(i) {
      li = i; guess = LEVELS[i].start;
      var g = gid(K + '-guess'); if (g) g.textContent = '试商：' + guess;
      var eq = gid(K + '-eq'); if (eq) eq.textContent = LEVELS[i].a + ' ÷ ' + LEVELS[i].b + ' = ?';
      var box = gid(K + '-bars'); if (box) box.innerHTML = barHtml();
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      paintBar();
      msg('先猜一个商（拨到那个数），再点“乘回去验算”。');
    }
    function checkGuess() {
      var L = LEVELS[li], prod = guess * L.b;
      paintBar();
      if (prod > L.a) {
        sawOver[li] = true;
        msg('商大了：' + guess + ' × ' + L.b + ' = ' + prod + '，比 ' + L.a + ' 超了 ' + (prod - L.a) + '。红条冒出去了，调小 1 再试。');
      } else if (prod === L.a) {
        var extra = sawOver[li] ? '你刚才看到过超调，调下来就对了。' : '一次就试中了。';
        msg('正好除尽：' + guess + ' × ' + L.b + ' = ' + L.a + '，商是 ' + guess + '。' + extra);
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      } else {
        var rem = L.a - prod;
        if (rem >= L.b) msg('商小了：' + guess + ' × ' + L.b + ' = ' + prod + '，还剩 ' + rem + '，还能再分一个 ' + L.b + '，调大 1 再试。');
        else msg('还剩 ' + rem + '，不够再分一个 ' + L.b + '。');
      }
    }
    el.innerHTML =
      '<p class="demo-tag">实验 · 4 年级 · 除数是两位数的除法</p>' +
      '<h3>试商超调：商大了会怎样</h3>' +
      '<p>试商不是瞎猜：先把除数看成整十数估一个商，再乘回去验算。乘大了，超出的部分会画成红条冒出去；乘小了，剩下的比除数大，还能再分。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx">拨一拨，猜一个商。</span></p>' +
      '<p class="func-eq" id="' + K + '-eq">168 ÷ 24 = ?</p>' +
      '<div class="btn-row"><button class="btn small ghost" id="' + K + '-guess-minus" type="button">−1</button><b id="' + K + '-guess">试商：8</b><button class="btn small ghost" id="' + K + '-guess-plus" type="button">+1</button><button class="btn small primary" id="' + K + '-check" type="button">乘回去验算</button></div>' +
      '<div id="' + K + '-bars"></div>' +
      '<p id="' + K + '-msg">先猜一个商，再点“乘回去验算”。</p>' +
      '<div class="btn-row"><button class="btn small ghost" id="' + K + '-hint" type="button">看试商窍门</button></div>' +
      '<p id="' + K + '-hint-tx"></p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 168÷24</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 252÷36</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 483÷69</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都试到正好，并且能说出“超了多少、往哪调”。</p>';
    gid(K + '-guess-minus').addEventListener('click', function () {
      guess = Math.max(1, guess - 1);
      gid(K + '-guess').textContent = '试商：' + guess;
      paintBar();
    });
    gid(K + '-guess-plus').addEventListener('click', function () {
      guess = Math.min(12, guess + 1);
      gid(K + '-guess').textContent = '试商：' + guess;
      paintBar();
    });
    gid(K + '-check').addEventListener('click', checkGuess);
    gid(K + '-hint').addEventListener('click', function () {
      gid(K + '-hint-tx').textContent = LEVELS[li].round;
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：试中 168÷24', '提高：试中 252÷36', '挑战：试中 483÷69'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

/* (2) op-vertical：学生做的竖式动画。已有工具只“放”竖式（MiniWebtool 式演示不在站内；站内 verify 是算回去验算）。
   本动画反过来：竖式不自己长出来，学生一个数字一个数字亲手搭——进位的小 1 也要自己写上去，写错了竖式会告诉你。 */
registerAnim({
  key: 'op-vertical',
  title: '竖式我来搭：一步一步写出来',
  sub: '竖式不自己长出来：个位写几、进位写几、借位怎么变，都由你一个一个填上去。',
  grade: 3,
  kind: '模拟',
  points: ['3.2', '2.3'],
  group: 'operations',
  render: function (el) {
    var K = 'op-vertical';
    var LEVELS = [
      { label: '基础', op: '+', a: 38, b: 45, ans: 83, steps: [
        { prompt: '个位：8+5=13，个位写几？', fill: 'r-o', ans: 3, hint: '8+5=13，个位写 3，十位进 1。' },
        { prompt: '满十进 1：进位的小 1 写在十位上面，点数字 1。', fill: 'c-t', ans: 1, hint: '个位满了十，要往十位进 1。' },
        { prompt: '十位：3+4，再加进来的 1，是几？', fill: 'r-t', ans: 8, hint: '3+4=7，再加进来的 1，是 8。' }
      ] },
      { label: '提高', op: '-', a: 52, b: 27, ans: 25, steps: [
        { prompt: '个位：2−7 不够减，先从十位借 1 个十。十位 5 借走 1 个十，还剩几？', fill: 'a-t', ans: 4, hint: '5 借走 1 个十，剩下 4。' },
        { prompt: '个位变成 12：12−7=？', fill: 'r-o', ans: 5, hint: '12−7=5。' },
        { prompt: '十位：4−2=？', fill: 'r-t', ans: 2, hint: '4−2=2。' }
      ] },
      { label: '挑战', op: '+', a: 486, b: 257, ans: 743, steps: [
        { prompt: '个位：6+7=13，个位写几？', fill: 'r-o', ans: 3, hint: '6+7=13，个位写 3，十位进 1。' },
        { prompt: '进位 1 写在十位上面，点数字 1。', fill: 'c-t', ans: 1, hint: '个位满了十，往十位进 1。' },
        { prompt: '十位：8+5+1=14，十位写几？', fill: 'r-t', ans: 4, hint: '8+5=13，再加进来的 1，是 14，十位写 4。' },
        { prompt: '再进位 1 写在百位上面，点数字 1。', fill: 'c-h', ans: 1, hint: '十位满了十，往百位进 1。' },
        { prompt: '百位：4+2+1=？', fill: 'r-h', ans: 7, hint: '4+2=6，再加进来的 1，是 7。' }
      ] }
    ];
    var li = 0, si = 0, tiers = null;
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function cell(id, v, small, red) {
      var st = 'display:inline-block;width:36px;text-align:center;font-size:26px;';
      if (small) st += 'font-size:16px;color:#dc2626;';
      if (red) st += 'color:#dc2626;';
      return '<span id="' + K + '-' + id + '" style="' + st + '">' + v + '</span>';
    }
    function boardHtml() {
      var L = LEVELS[li];
      var a = String(L.a), b = String(L.b);
      var aH = a.length > 2 ? a[0] : '', aT = a.length > 2 ? a[1] : a[0], aO = a.length > 2 ? a[2] : a[1];
      var bH = b.length > 2 ? b[0] : '', bT = b.length > 2 ? b[1] : b[0], bO = b.length > 2 ? b[2] : b[1];
      var w = Math.max(a.length, b.length, String(L.ans).length);
      var rH = w > 2 ? '？' : '';
      return '<div style="font-size:26px;line-height:1.4">' +
        '<div>' + cell('sign', '&nbsp;') + cell('c-h', '&nbsp;', true) + cell('c-t', '&nbsp;', true) + cell('c-o', '&nbsp;', true) + '</div>' +
        '<div>' + cell('sign', '&nbsp;') + cell('a-h', aH) + cell('a-t', aT) + cell('a-o', aO) + '</div>' +
        '<div>' + cell('sign', L.op) + cell('b-h', bH) + cell('b-t', bT) + cell('b-o', bO) + '</div>' +
        '<div style="border-top:3px solid #1e293b;width:150px"></div>' +
        '<div>' + cell('sign', '&nbsp;') + cell('r-h', rH) + cell('r-t', '？') + cell('r-o', '？') + '</div></div>' +
        '<p id="' + K + '-anote"></p>';
    }
    function askStep() {
      var L = LEVELS[li];
      if (si >= L.steps.length) return;
      msg('第 ' + (si + 1) + ' 步 · ' + L.steps[si].prompt);
    }
    function setLevel(i) {
      li = i; si = 0;
      var box = gid(K + '-board'); if (box) box.innerHTML = boardHtml();
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      var eq = gid(K + '-eq'); if (eq) eq.textContent = LEVELS[i].a + ' ' + LEVELS[i].op + ' ' + LEVELS[i].b + ' = ?';
      askStep();
    }
    function onDigit(d) {
      var L = LEVELS[li];
      if (si >= L.steps.length) { msg('这道题已经搭完了，换一档试试。'); return; }
      var st = L.steps[si];
      if (d !== st.ans) { msg('不对：' + st.hint); return; }
      var slot = gid(K + '-' + st.fill);
      if (slot) { slot.textContent = String(d); slot.style.color = '#15803d'; }
      if (st.fill === 'a-t') {
        var an = gid(K + '-anote');
        if (an) an.textContent = '十位借走 1 个十：5 变成 4，个位 2 变成 12。';
      }
      si++;
      if (si >= L.steps.length) {
        msg('搭完了：' + L.a + ' ' + L.op + ' ' + L.b + ' = ' + L.ans + '。竖式是你一步一步搭出来的。');
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      } else askStep();
    }
    var pad = '';
    for (var d = 0; d <= 9; d++) {
      pad += '<button class="btn small" id="' + K + '-d' + d + '" type="button">' + d + '</button>';
    }
    el.innerHTML =
      '<p class="demo-tag">模拟 · 3 年级 · 万以内加减法</p>' +
      '<h3>竖式我来搭：一步一步写出来</h3>' +
      '<p>竖式不是看会的，是搭会的。下面这道题，个位写几、进位写几、借位怎么变，都由你点数字填上去；填错了，它会告诉你为什么不对。</p>' +
      '<p class="func-eq" id="' + K + '-eq">38 + 45 = ?</p>' +
      '<div id="' + K + '-board"></div>' +
      '<p id="' + K + '-msg">先看第一步，再点下面的数字。</p>' +
      '<p>点数字填空：</p><div class="btn-row">' + pad + '</div>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 38+45</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 52−27</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 486+257</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档竖式都亲手搭完，并且能说出“进 1 和借 1 是怎么回事”。</p>';
    for (var dd = 0; dd <= 9; dd++) {
      (function (n) {
        gid(K + '-d' + n).addEventListener('click', function () { onDigit(n); });
      })(dd);
    }
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：搭出 38+45', '提高：搭出 52−27', '挑战：搭出 486+257'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

/* (3) op-estimate：先估算再算。已有 estimate 是“估算用来抓错”（48+31，拨档位猜大约是多少，再精确算）。
   本动画是它的另一做法：估的数落在数轴上，先在数轴上定一个“圈”，再看精确答案的点落不落进圈里——估和算的距离画出来。 */
registerAnim({
  key: 'op-estimate',
  title: '先估再算：估的圈，算的点',
  sub: '先在数轴上定一个估计，再精确算：答案的点落进你的圈里了吗？',
  grade: 3,
  kind: '模拟',
  points: ['3.2'],
  group: 'operations',
  render: function (el) {
    var K = 'op-estimate';
    var LEVELS = [
      { label: '基础', a: 48, b: 31, op: '+', exact: 79, lo: 60, hi: 100, start: 70, step: 10, hint: '48 接近 50，31 接近 30，50+30=80。' },
      { label: '提高', a: 297, b: 486, op: '+', exact: 783, lo: 600, hi: 1000, start: 700, step: 10, hint: '297 接近 300，486 接近 490，300+490=790。' },
      { label: '挑战', a: 512, b: 268, op: '-', exact: 244, lo: 100, hi: 400, start: 200, step: 10, hint: '512 接近 510，268 接近 270，510−270=240。' }
    ];
    var li = 0, est = 70, locked = false, tiers = null;
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function pct(v) {
      var L = LEVELS[li];
      return Math.round((v - L.lo) / (L.hi - L.lo) * 100);
    }
    function paintLine() {
      var L = LEVELS[li];
      var line = gid(K + '-line');
      if (!line) return;
      var mid = Math.round((L.lo + L.hi) / 2);
      var estPct = pct(est);
      var bandL = Math.max(0, pct(est - 30)), bandR = Math.min(100, pct(est + 30));
      var bandW = Math.max(0, bandR - bandL);
      line.innerHTML =
        '<div style="position:relative;height:70px">' +
        '<div style="position:absolute;left:0;right:0;top:34px;height:4px;background:#cbd5e1;border-radius:2px"></div>' +
        '<div style="position:absolute;left:' + bandL + '%;width:' + bandW + '%;top:26px;height:20px;background:#bbf7d0;border-radius:10px"></div>' +
        '<div style="position:absolute;left:' + estPct + '%;top:20px;width:16px;height:16px;background:#2563eb;border-radius:50%;margin-left:-8px"></div>' +
        '<div style="position:absolute;left:' + estPct + '%;top:40px;margin-left:-8px;font-size:14px;color:#2563eb">估 ' + est + '</div>' +
        '<div id="' + K + '-exact-dot"></div>' +
        '<div style="position:absolute;left:0;top:52px;font-size:14px">' + L.lo + '</div>' +
        '<div style="position:absolute;left:46%;top:52px;font-size:14px">' + mid + '</div>' +
        '<div style="position:absolute;right:0;top:52px;font-size:14px">' + L.hi + '</div>' +
        '</div>';
    }
    function setLevel(i) {
      li = i; est = LEVELS[i].start; locked = false;
      var eq = gid(K + '-eq'); if (eq) eq.textContent = LEVELS[i].a + ' ' + LEVELS[i].op + ' ' + LEVELS[i].b + ' = ?';
      var e = gid(K + '-est'); if (e) e.textContent = '我的估计：' + est;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      paintLine();
      msg('先估：拨一拨，把蓝点移到你觉得答案该在的位置，再点“估计定下来了”。');
    }
    function lockEst() {
      if (locked) return;
      locked = true;
      msg('估计定下来了：' + est + '。现在点“精确算一算”，看答案的点落在哪里。');
    }
    function exact() {
      if (!locked) { msg('先把估计定下来，再精确算。'); return; }
      var L = LEVELS[li];
      var dot = gid(K + '-exact-dot');
      if (dot) {
        dot.innerHTML = '<div style="position:absolute;left:' + pct(L.exact) + '%;top:20px;width:16px;height:16px;background:#dc2626;border-radius:50%;margin-left:-8px"></div>' +
          '<div style="position:absolute;left:' + pct(L.exact) + '%;top:2px;margin-left:-8px;font-size:14px;color:#dc2626">算 ' + L.exact + '</div>';
      }
      var diff = Math.abs(est - L.exact);
      var verdict = diff <= 10 ? '估得很准，只差 ' + diff + '。' : diff <= 30 ? '落在绿圈里了，差 ' + diff + '，估得不错。' : '差 ' + diff + '，离得有点远：下次先把两个数凑整再估。';
      msg('精确答案是 ' + L.exact + '。' + verdict);
      if (diff <= 30 && tiers) tiers.done(li);
      if (diff <= 30 && typeof markTried === 'function') markTried(K);
    }
    el.innerHTML =
      '<p class="demo-tag">模拟 · 3 年级 · 万以内加减法</p>' +
      '<h3>先估再算：估的圈，算的点</h3>' +
      '<p>估算不是瞎猜：先把两个数凑成整十整百，心里有个大约的数；再精确算一算，看答案落不落进你画的圈里。圈是估计上下 30 的范围。</p>' +
      '<p class="func-eq" id="' + K + '-eq">48 + 31 = ?</p>' +
      '<p>第 1 步 · 先估：拨蓝点。</p>' +
      '<div class="btn-row"><button class="btn small ghost" id="' + K + '-est-minus" type="button">−10</button><b id="' + K + '-est">我的估计：70</b><button class="btn small ghost" id="' + K + '-est-plus" type="button">+10</button><button class="btn small primary" id="' + K + '-lock" type="button">估计定下来了</button></div>' +
      '<div id="' + K + '-line"></div>' +
      '<p>第 2 步 · 再算：</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-exact" type="button">精确算一算</button><button class="btn small ghost" id="' + K + '-hint" type="button">看凑整提示</button></div>' +
      '<p id="' + K + '-hint-tx"></p>' +
      '<p id="' + K + '-msg">先估一估，再精确算。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 48+31</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 297+486</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 512−268</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档的估计都落在绿圈里（和精确答案差 30 以内）。</p>';
    gid(K + '-est-minus').addEventListener('click', function () {
      if (locked) { msg('估计已经定下来了，换一档可以重新估。'); return; }
      var L = LEVELS[li];
      est = Math.max(L.lo, est - L.step);
      gid(K + '-est').textContent = '我的估计：' + est;
      paintLine();
    });
    gid(K + '-est-plus').addEventListener('click', function () {
      if (locked) { msg('估计已经定下来了，换一档可以重新估。'); return; }
      var L = LEVELS[li];
      est = Math.min(L.hi, est + L.step);
      gid(K + '-est').textContent = '我的估计：' + est;
      paintLine();
    });
    gid(K + '-lock').addEventListener('click', lockEst);
    gid(K + '-exact').addEventListener('click', exact);
    gid(K + '-hint').addEventListener('click', function () {
      gid(K + '-hint-tx').textContent = LEVELS[li].hint;
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：48+31 估进圈里', '提高：297+486 估进圈里', '挑战：512−268 估进圈里'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

/* (4) op-transform：凑整/翻倍减半可拖拽变换。调研里只找到文字和视频讲解，没有能拖的工具。
   本动画把“拿 2 过去”和“一个减半、一个翻倍”做成按钮和会动的条：算式变了，总数没变。 */
registerAnim({
  key: 'op-transform',
  title: '凑整变一变：拖一下，算式变简单',
  sub: '398+456 太难算？从 456 拿 2 给 398，变成 400+454。16×25 呢？一个减半、一个翻倍。',
  grade: 4,
  kind: '模拟',
  points: ['4.10'],
  group: 'operations',
  render: function (el) {
    var K = 'op-transform';
    var LEVELS = [
      { label: '基础', kind: 'add', a: 398, b: 456, move: 2, total: 854, guesses: [854, 844, 864], hint: '398 再加 2 就是整百的 400，从 456 里拿 2 过来。' },
      { label: '提高', kind: 'mul', a: 16, b: 25, total: 400, guesses: [400, 350, 450], hint: '16 减半是 8，25 翻倍是 50，8×50 还是 400。' },
      { label: '挑战', kind: 'add', a: 597, b: 386, move: 3, total: 983, guesses: [983, 973, 993], hint: '597 再加 3 就是 600，从 386 里拿 3 过来。' }
    ];
    var li = 0, moved = false, halvings = 0, guessedOk = false, tiers = null;
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function barRow(label, v, max, color) {
      var pct = Math.max(2, Math.round(v / max * 100));
      return '<p>' + label + ' ' + v + '</p>' +
        '<div style="height:22px;background:#e2e8f0;border-radius:4px"><div style="height:22px;width:' + pct + '%;background:' + color + ';border-radius:4px"></div></div>';
    }
    function paint() {
      var L = LEVELS[li], box = gid(K + '-stage'), eq = gid(K + '-eq');
      if (!box) return;
      if (L.kind === 'add') {
        var a2 = moved ? L.a + L.move : L.a, b2 = moved ? L.b - L.move : L.b;
        box.innerHTML = barRow('第一个数', a2, 1000, '#93c5fd') + barRow('第二个数', b2, 1000, '#fda4af');
        if (eq) eq.textContent = a2 + ' + ' + b2 + ' = ' + L.total;
      } else {
        var a2m = L.a, b2m = L.b;
        for (var i = 0; i < halvings; i++) { a2m = a2m / 2; b2m = b2m * 2; }
        box.innerHTML = barRow('第一个因数', a2m, 100, '#93c5fd') + barRow('第二个因数', b2m, 100, '#fda4af');
        if (eq) eq.textContent = a2m + ' × ' + b2m + ' = ' + L.total;
      }
    }
    function setLevel(i) {
      li = i; moved = false; halvings = 0; guessedOk = false;
      var L = LEVELS[i];
      var g = gid(K + '-guesses');
      if (g) {
        var h = '';
        for (var k = 0; k < 3; k++) {
          h += '<button class="btn small" id="' + K + '-guess-' + k + '" type="button">' + L.guesses[k] + '</button>';
        }
        g.innerHTML = h;
        for (var j = 0; j < 3; j++) {
          (function (jj) {
            gid(K + '-guess-' + jj).addEventListener('click', function () { onGuess(jj); });
          })(j);
        }
      }
      var mv = gid(K + '-move');
      if (mv) mv.textContent = L.kind === 'add' ? '从第二个数拿 ' + L.move + ' 给第一个数' : '一个减半、一个翻倍';
      var bk = gid(K + '-back');
      if (bk) bk.textContent = L.kind === 'add' ? '拿回来' : '变回去';
      for (var k2 = 0; k2 < 3; k2++) {
        var b = gid(K + '-level-' + k2);
        if (b) b.setAttribute('aria-pressed', String(k2 === i));
      }
      paint();
      msg('第 1 步 · 先猜：变完之后结果是多少？点一个数。再点下面的按钮动手变。');
    }
    function onGuess(j) {
      var L = LEVELS[li];
      if (L.guesses[j] === L.total) {
        guessedOk = true;
        msg('猜对了，就是 ' + L.total + '。现在动手变一变，看算式怎么变简单。');
      } else {
        msg('不是 ' + L.guesses[j] + '：变来变去，总数不会变。看看提示再猜。');
      }
    }
    function doMove() {
      var L = LEVELS[li];
      if (L.kind === 'add') {
        if (moved) { msg('已经拿过去了：' + (L.a + L.move) + ' + ' + (L.b - L.move) + ' = ' + L.total + '，总数没变。'); return; }
        moved = true;
        paint();
        msg('拿过去了：' + L.a + ' 变成 ' + (L.a + L.move) + '，' + L.b + ' 变成 ' + (L.b - L.move) + '，和还是 ' + L.total + '。整百数好算多了。');
        finishIfReady();
      } else {
        if (halvings >= 2) { msg('已经变到头了：4 × 100 = 400。'); return; }
        halvings++;
        paint();
        var a2 = L.a, b2 = L.b;
        for (var i = 0; i < halvings; i++) { a2 = a2 / 2; b2 = b2 * 2; }
        msg('变了一下：' + a2 + ' × ' + b2 + ' = ' + L.total + '。一个减半、一个翻倍，积不变。');
        finishIfReady();
      }
    }
    function doBack() {
      var L = LEVELS[li];
      if (L.kind === 'add') moved = false; else halvings = 0;
      paint();
      msg('变回去了。再变一次看看。');
    }
    function finishIfReady() {
      var L = LEVELS[li];
      var done = L.kind === 'add' ? moved : halvings >= 2;
      if (done && guessedOk) {
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      } else if (done) {
        msg('变好了，结果还是 ' + L.total + '。再点上面的数字猜一猜，猜对了才算完成。');
      }
    }
    el.innerHTML =
      '<p class="demo-tag">模拟 · 4 年级 · 运算定律</p>' +
      '<h3>凑整变一变：拖一下，算式变简单</h3>' +
      '<p>难算的算式，变一变就好算了：加法可以凑整，乘法可以一个减半、一个翻倍。变的是算式，不变的是结果——条的长度会告诉你。</p>' +
      '<p class="func-eq" id="' + K + '-eq">398 + 456 = ?</p>' +
      '<p>第 1 步 · 先猜结果是几？</p><div class="btn-row" id="' + K + '-guesses"></div>' +
      '<p>第 2 步 · 动手变：</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-move" type="button">从第二个数拿 2 给第一个数</button><button class="btn small ghost" id="' + K + '-back" type="button">拿回来</button><button class="btn small ghost" id="' + K + '-hint" type="button">看提示</button></div>' +
      '<div id="' + K + '-stage"></div>' +
      '<p id="' + K + '-hint-tx"></p>' +
      '<p id="' + K + '-msg">先猜，再变。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 398+456</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 16×25</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 597+386</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都猜对结果、变到最简单的样子，并且能说出“变的是算式，不变的是结果”。</p>';
    gid(K + '-move').addEventListener('click', doMove);
    gid(K + '-back').addEventListener('click', doBack);
    gid(K + '-hint').addEventListener('click', function () {
      gid(K + '-hint-tx').textContent = LEVELS[li].hint;
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：398+456 变简单', '提高：16×25 变简单', '挑战：597+386 变简单'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

/* (5) op-decscale：小数除法当缩放。已有 decdiv 是“两数同乘”的数字规则（2.4÷0.6 变成 24÷6）。
   本动画是它的可视化版：两根条一起放大 ×10、×100，小数点跟着动，商那根条一动不动。 */
registerAnim({
  key: 'op-decscale',
  title: '小数除法当缩放：一起放大，商不变',
  sub: '3.6÷0.9 不好算？两根条一起放大 10 倍，变成 36÷9，商还是 4。',
  grade: 5,
  kind: '模拟',
  points: ['5.3'],
  group: 'operations',
  render: function (el) {
    var K = 'op-decscale';
    var LEVELS = [
      { label: '基础', a: 3.6, b: 0.9, q: 4, a10: '36', b10: '9', a100: '360', b100: '90' },
      { label: '提高', a: 0.48, b: 0.12, q: 4, a10: '4.8', b10: '1.2', a100: '48', b100: '12' },
      { label: '挑战', a: 5.4, b: 0.6, q: 9, a10: '54', b10: '6', a100: '540', b100: '60' }
    ];
    var li = 0, scale = 1, guess = 1, tiers = null;
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function scaled(v, s) {
      var n = Math.round(v * s * 100) / 100;
      return String(n);
    }
    function paint() {
      var L = LEVELS[li];
      var aS = scaled(L.a, scale), bS = scaled(L.b, scale);
      var eq = gid(K + '-eq');
      if (eq) eq.textContent = aS + ' ÷ ' + bS + ' = ?　（原来是 ' + L.a + ' ÷ ' + L.b + '）';
      var segs = gid(K + '-segs');
      if (segs) {
        var h = '';
        for (var i = 0; i < L.q; i++) {
          h += '<span style="display:inline-block;width:44px;height:34px;line-height:34px;text-align:center;background:#bfdbfe;border:1px solid #60a5fa;border-radius:4px;margin:2px;font-size:14px">' + bS + '</span>';
        }
        segs.innerHTML = h;
      }
      var cap = gid(K + '-cap');
      if (cap) cap.textContent = '被除数的条里装了 ' + L.q + ' 个 ' + bS + '，一共 ' + L.q + ' 段。';
    }
    function setLevel(i) {
      li = i; scale = 1; guess = 1;
      var g = gid(K + '-guess'); if (g) g.textContent = '我猜商是：' + guess;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      paint();
      msg('第 1 步 · 先猜商是几。再点 ×10、×100 看两根条一起放大，商动不动。');
    }
    function setScale(s) {
      scale = s;
      paint();
      var L = LEVELS[li];
      msg('放大了 ' + s + ' 倍：' + scaled(L.a, s) + ' ÷ ' + scaled(L.b, s) + '。两个数一起变，商还是那个商。');
    }
    function verify() {
      var L = LEVELS[li];
      if (guess === L.q) {
        msg('对了：' + L.b + ' 能装进 ' + L.a + ' 里 ' + L.q + ' 次，商是 ' + L.q + '。放大 ' + scale + ' 倍再数，还是 ' + L.q + ' 次。');
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('不对：数一数下面的段，' + L.b + ' 能装进 ' + L.a + ' 里 ' + L.q + ' 次，商是 ' + L.q + '，不是 ' + guess + '。');
      }
    }
    el.innerHTML =
      '<p class="demo-tag">模拟 · 5 年级 · 小数除法</p>' +
      '<h3>小数除法当缩放：一起放大，商不变</h3>' +
      '<p>小数除法难，是因为除数是小数。把被除数和除数一起放大 10 倍、100 倍，除数变成整数了，商却一点没变——下面的段数会数给你看。</p>' +
      '<p class="func-eq" id="' + K + '-eq">3.6 ÷ 0.9 = ?</p>' +
      '<p>第 1 步 · 先猜商：</p>' +
      '<div class="btn-row"><button class="btn small ghost" id="' + K + '-guess-minus" type="button">−1</button><b id="' + K + '-guess">我猜商是：1</b><button class="btn small ghost" id="' + K + '-guess-plus" type="button">+1</button><button class="btn small primary" id="' + K + '-verify" type="button">数一数，验证</button></div>' +
      '<p>第 2 步 · 玩缩放：两个数一起放大。</p>' +
      '<div class="btn-row"><button class="btn small" id="' + K + '-s1" type="button">×1</button><button class="btn small" id="' + K + '-s10" type="button">×10</button><button class="btn small" id="' + K + '-s100" type="button">×100</button></div>' +
      '<div id="' + K + '-segs"></div>' +
      '<p id="' + K + '-cap"></p>' +
      '<p id="' + K + '-msg">先猜商，再玩缩放。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 3.6÷0.9</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 0.48÷0.12</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 5.4÷0.6</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都猜对商，并且能说出“两个数一起放大，商不变”。</p>';
    gid(K + '-guess-minus').addEventListener('click', function () {
      guess = Math.max(1, guess - 1);
      gid(K + '-guess').textContent = '我猜商是：' + guess;
    });
    gid(K + '-guess-plus').addEventListener('click', function () {
      guess = Math.min(20, guess + 1);
      gid(K + '-guess').textContent = '我猜商是：' + guess;
    });
    gid(K + '-verify').addEventListener('click', verify);
    gid(K + '-s1').addEventListener('click', function () { setScale(1); });
    gid(K + '-s10').addEventListener('click', function () { setScale(10); });
    gid(K + '-s100').addEventListener('click', function () { setScale(100); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：3.6÷0.9=4', '提高：0.48÷0.12=4', '挑战：5.4÷0.6=9'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

/* (6) op-fracwrong：分数加减错法可视化。已有 fracadd 教的是正确做法（先重切再数）。
   本动画专门画错法：分子加分子、分母加分母，拼出来的条比正确答案短一大截——错在哪，图上看得见。 */
registerAnim({
  key: 'op-fracwrong',
  title: '分数加减错在哪：2/5 对不上',
  sub: '1/2+1/3，有人算成 2/5。把两条答案画出来比一比：错的比对的短了一大截。',
  grade: 5,
  kind: '实验',
  points: ['5.11'],
  group: 'operations',
  render: function (el) {
    var K = 'op-fracwrong';
    var LEVELS = [
      { label: '基础', n1: 1, d1: 2, n2: 1, d2: 3, op: '+', naive: '2/5', naiveDec: '0.4', naivePct: 40, tru: '5/6', trueDec: '0.83', truePct: 83, cut: '都切成 6 份：1/2 是 3/6，1/3 是 2/6，3/6+2/6=5/6。' },
      { label: '提高', n1: 3, d1: 4, n2: 1, d2: 2, op: '-', naive: '2/2', naiveDec: '1', naivePct: 100, tru: '1/4', trueDec: '0.25', truePct: 25, cut: '都切成 4 份：3/4 是 3/4，1/2 是 2/4，3/4−2/4=1/4。' },
      { label: '挑战', n1: 2, d1: 3, n2: 1, d2: 6, op: '+', naive: '3/9', naiveDec: '0.33', naivePct: 33, tru: '5/6', trueDec: '0.83', truePct: 83, cut: '都切成 6 份：2/3 是 4/6，1/6 是 1/6，4/6+1/6=5/6。' }
    ];
    var li = 0, guessed = null, sawNaive = false, sawTrue = false, tiers = null;
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function barRow(label, pct, color, val) {
      return '<p>' + label + ' ' + val + '</p>' +
        '<div style="height:22px;background:#e2e8f0;border-radius:4px"><div style="height:22px;width:' + pct + '%;background:' + color + ';border-radius:4px"></div></div>';
    }
    function expr() {
      var L = LEVELS[li];
      return L.n1 + '/' + L.d1 + ' ' + L.op + ' ' + L.n2 + '/' + L.d2;
    }
    function naiveExpr() {
      var L = LEVELS[li];
      if (L.op === '+') return '(' + L.n1 + '+' + L.n2 + ')/(' + L.d1 + '+' + L.d2 + ') = ' + L.naive;
      return '(' + L.n1 + '−' + L.n2 + ')/(' + L.d1 + '−' + L.d2 + ') = ' + L.naive;
    }
    function setLevel(i) {
      li = i; guessed = null; sawNaive = false; sawTrue = false;
      var eq = gid(K + '-eq'); if (eq) eq.textContent = expr() + ' = ?';
      var box = gid(K + '-bars'); if (box) box.innerHTML = '';
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      msg('第 1 步 · 先猜：有人说，分子加分子、分母加分母就行。你觉得对吗？');
    }
    function onGuess(ok) {
      guessed = ok;
      if (ok) msg('你觉得错法是对的？点“按错法画出来”，看画出来的条有多长。');
      else msg('你觉得错法不对。点“按错法画出来”，再点“重切再加画出来”，两条一比就明白了。');
    }
    function showNaive() {
      var L = LEVELS[li];
      sawNaive = true;
      var box = gid(K + '-bars');
      if (box) box.innerHTML = barRow('错法画出来：' + naiveExpr(), L.naivePct, '#ef4444', L.naive + '（大约 ' + L.naiveDec + '）');
      msg('错法是这样算的：' + naiveExpr() + '。可是 1/2 的块和 1/3 的块大小不一样，根本拼不到一起——分母不一样，不能直接加分子。');
      maybeDone();
    }
    function showTrue() {
      var L = LEVELS[li];
      sawTrue = true;
      var box = gid(K + '-bars');
      if (box) {
        var cur = box.innerHTML;
        box.innerHTML = cur + barRow('正确画出来：' + L.cut, L.truePct, '#22c55e', L.tru + '（大约 ' + L.trueDec + '）');
      }
      msg('正确做法：先把两块都切成一样大的小份，再数。' + L.cut + '两条一比，错的比对的短了一大截。');
      maybeDone();
    }
    function maybeDone() {
      if (sawNaive && sawTrue) {
        if (guessed === false) msg('你猜对了：错法不对。' + LEVELS[li].cut + '分母不一样，先重切，再加减。');
        else if (guessed === true) msg('看到了吗？错的条比对的条短了一大截。' + LEVELS[li].cut);
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    el.innerHTML =
      '<p class="demo-tag">实验 · 5 年级 · 分数的加法和减法</p>' +
      '<h3>分数加减错在哪：2/5 对不上</h3>' +
      '<p>分数加减最容易错的一步，就是分子加分子、分母加分母。为什么错？把错的答案和对的答案都画成条，比一比长度就知道了。</p>' +
      '<p class="func-eq" id="' + K + '-eq">1/2 + 1/3 = ?</p>' +
      '<p>第 1 步 · 先猜：</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-guess-yes" type="button">错法是对的</button><button class="btn small primary" id="' + K + '-guess-no" type="button">错法不对</button></div>' +
      '<p>第 2 步 · 画出来比一比：</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-show-naive" type="button">按错法画出来</button><button class="btn small primary" id="' + K + '-show-true" type="button">重切再加画出来</button></div>' +
      '<div id="' + K + '-bars"></div>' +
      '<p id="' + K + '-msg">先猜，再画出来比一比。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 1/2+1/3</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 3/4−1/2</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 2/3+1/6</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都画出两条比过，并且能说出“分母不一样，先重切，再加减”。</p>';
    gid(K + '-guess-yes').addEventListener('click', function () { onGuess(true); });
    gid(K + '-guess-no').addEventListener('click', function () { onGuess(false); });
    gid(K + '-show-naive').addEventListener('click', showNaive);
    gid(K + '-show-true').addEventListener('click', showTrue);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：看穿 1/2+1/3 的错法', '提高：看穿 3/4−1/2 的错法', '挑战：看穿 2/3+1/6 的错法'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

/* (7) op-bracket：可拖括号改结果。已有 mixop 是“先算哪一堆”（运算顺序的步骤选择）。
   本动画只做一件事：括号套在哪，结果就变到哪——点一下，括号挪过去，答案当场重算。 */
registerAnim({
  key: 'op-bracket',
  title: '拖括号，改结果',
  sub: '2+3×4，括号套在 2+3 上是 20，不套是 14。点一下，括号挪过去，答案当场变。',
  grade: 4,
  kind: '模拟',
  points: ['4.9'],
  group: 'operations',
  render: function (el) {
    var K = 'op-bracket';
    var LEVELS = [
      { label: '基础', expr: '2 + 3 × 4', targets: [14, 20], placements: [
        { name: '不加括号', disp: '2 + 3 × 4', val: 14, steps: '先算 3×4=12，再算 2+12=14。' },
        { name: '括号套在 2+3 上', disp: '(2 + 3) × 4', val: 20, steps: '先算 2+3=5，再算 5×4=20。' },
        { name: '括号套在 3×4 上', disp: '2 + (3 × 4)', val: 14, steps: '先算 3×4=12，再算 2+12=14。' }
      ] },
      { label: '提高', expr: '12 − 3 × 2', targets: [6, 18], placements: [
        { name: '不加括号', disp: '12 − 3 × 2', val: 6, steps: '先算 3×2=6，再算 12−6=6。' },
        { name: '括号套在 12−3 上', disp: '(12 − 3) × 2', val: 18, steps: '先算 12−3=9，再算 9×2=18。' },
        { name: '括号套在 3×2 上', disp: '12 − (3 × 2)', val: 6, steps: '先算 3×2=6，再算 12−6=6。' }
      ] },
      { label: '挑战', expr: '6 + 8 ÷ 2 − 1', targets: [9, 14], placements: [
        { name: '不加括号', disp: '6 + 8 ÷ 2 − 1', val: 9, steps: '先算 8÷2=4，再算 6+4−1=9。' },
        { name: '括号套在 6+8 上', disp: '(6 + 8) ÷ 2 − 1', val: 6, steps: '先算 6+8=14，再算 14÷2−1=6。' },
        { name: '括号套在 2−1 上', disp: '6 + 8 ÷ (2 − 1)', val: 14, steps: '先算 2−1=1，再算 8÷1=8，6+8=14。' }
      ] }
    ];
    var li = 0, target = 14, hits = {}, tiers = null;
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function setLevel(i) {
      li = i; hits = {};
      var L = LEVELS[i];
      target = L.targets[0];
      var t = gid(K + '-targets');
      if (t) {
        var h = '';
        for (var k = 0; k < L.targets.length; k++) {
          h += '<button class="btn small" id="' + K + '-target-' + k + '" type="button">凑出 ' + L.targets[k] + '</button>';
        }
        t.innerHTML = h;
        for (var j = 0; j < L.targets.length; j++) {
          (function (jj) {
            gid(K + '-target-' + jj).addEventListener('click', function () { pickTarget(jj); });
          })(j);
        }
      }
      var p = gid(K + '-places');
      if (p) {
        var ph = '';
        for (var m = 0; m < L.placements.length; m++) {
          ph += '<button class="btn small" id="' + K + '-place-' + m + '" type="button">' + L.placements[m].name + '</button>';
        }
        p.innerHTML = ph;
        for (var n = 0; n < L.placements.length; n++) {
          (function (nn) {
            gid(K + '-place-' + nn).addEventListener('click', function () { place(nn); });
          })(n);
        }
      }
      var eq = gid(K + '-eq'); if (eq) eq.textContent = L.expr + ' = ?';
      var tg = gid(K + '-target-tx'); if (tg) tg.textContent = '目标：凑出 ' + target;
      for (var k2 = 0; k2 < 3; k2++) {
        var b = gid(K + '-level-' + k2);
        if (b) b.setAttribute('aria-pressed', String(k2 === i));
      }
      msg('第 1 步 · 先选一个目标：要凑出几？再点下面的按钮挪括号。');
    }
    function pickTarget(j) {
      target = LEVELS[li].targets[j];
      var tg = gid(K + '-target-tx'); if (tg) tg.textContent = '目标：凑出 ' + target;
      msg('目标是 ' + target + '。挪括号，看看哪个位置能凑出来。');
    }
    function place(j) {
      var L = LEVELS[li], pl = L.placements[j];
      var eq = gid(K + '-eq'); if (eq) eq.textContent = pl.disp + ' = ' + pl.val;
      if (pl.val === target) {
        hits[target] = true;
        msg('凑到了！' + pl.disp + ' = ' + pl.val + '。' + pl.steps + '括号套在哪，答案就跟着变。');
        var all = true;
        for (var k = 0; k < L.targets.length; k++) { if (!hits[L.targets[k]]) all = false; }
        if (all) {
          if (tiers) tiers.done(li);
          if (typeof markTried === 'function') markTried(K);
        }
      } else {
        msg(pl.disp + ' = ' + pl.val + '，不是 ' + target + '。' + pl.steps + '换个位置试试。');
      }
    }
    el.innerHTML =
      '<p class="demo-tag">模拟 · 4 年级 · 四则运算</p>' +
      '<h3>拖括号，改结果</h3>' +
      '<p>括号不是装饰：它说“先算我”。同一个算式，括号套在哪，答案就变到哪。先选一个目标数，再挪括号把它凑出来。</p>' +
      '<p class="func-eq" id="' + K + '-eq">2 + 3 × 4 = ?</p>' +
      '<p id="' + K + '-target-tx">目标：凑出 14</p>' +
      '<p>第 1 步 · 先选目标：</p><div class="btn-row" id="' + K + '-targets"></div>' +
      '<p>第 2 步 · 挪括号：</p><div class="btn-row" id="' + K + '-places"></div>' +
      '<p id="' + K + '-msg">先选目标，再挪括号。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 2+3×4</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 12−3×2</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 6+8÷2−1</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档的每个目标都用括号凑出来，并且能说出“括号说先算我”。</p>';
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：2+3×4 凑出两个数', '提高：12−3×2 凑出两个数', '挑战：6+8÷2−1 凑出两个数'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

/* (8) op-assoc：结合律。已有 laws 一次讲三条定律（交换、结合、分配各看一眼）。
   本动画只讲结合律一件事：三个数，先合哪两个都行；再补一个反例——减法换组合，结果就变了。 */
registerAnim({
  key: 'op-assoc',
  title: '结合律：先算哪两个，结果一样',
  sub: '8+5+7，先合 8 和 5，还是先合 5 和 7？两条路都走到 20。减法可不行。',
  grade: 4,
  kind: '模拟',
  points: ['4.10'],
  group: 'operations',
  render: function (el) {
    var K = 'op-assoc';
    var LEVELS = [
      { label: '基础', kind: '加法', nums: [8, 5, 7], total: 20, left: '(8+5)+7', right: '8+(5+7)',
        leftSteps: '先算 8+5=13，再算 13+7=20。', rightSteps: '先算 5+7=12，再算 8+12=20。' },
      { label: '提高', kind: '乘法', nums: [2, 3, 4], total: 24, left: '(2×3)×4', right: '2×(3×4)',
        leftSteps: '先算 2×3=6，再算 6×4=24。', rightSteps: '先算 3×4=12，再算 2×12=24。' },
      { label: '挑战', kind: '加法', nums: [25, 17, 13], total: 55, left: '(25+13)+17', right: '25+(17+13)',
        leftSteps: '先算 25+13=38，再算 38+17=55。', rightSteps: '先算 17+13=30，再算 25+30=55。', note: '25 和 13 先凑成整十 38，算得更快。' }
    ];
    var li = 0, guessed = null, sawLeft = false, sawRight = false, tiers = null;
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function blocksHtml(group) {
      var L = LEVELS[li];
      var h = '<div style="display:flex;gap:6px;align-items:stretch;margin:8px 0">';
      for (var i = 0; i < 3; i++) {
        var grouped = (group === 'left' && i < 2) || (group === 'right' && i > 0);
        var w = L.kind === '加法' ? Math.max(12, Math.round(L.nums[i] / L.total * 100)) : 30;
        var inner = '<div style="flex:' + w + ';min-height:44px;line-height:44px;text-align:center;background:#bfdbfe;border-radius:6px;font-size:20px">' + L.nums[i] + '</div>';
        if (grouped) h += '<div style="flex:' + w + ';border:3px solid #f59e0b;border-radius:8px;padding:2px">' + inner + '</div>';
        else h += inner;
      }
      return h + '</div>';
    }
    function setLevel(i) {
      li = i; guessed = null; sawLeft = false; sawRight = false;
      var L = LEVELS[i];
      var eq = gid(K + '-eq'); if (eq) eq.textContent = L.nums.join(L.kind === '加法' ? ' + ' : ' × ') + ' = ?';
      var box = gid(K + '-blocks'); if (box) box.innerHTML = blocksHtml(null);
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      msg('第 1 步 · 先猜：三个数，先合哪两个，结果变不变？');
    }
    function onGuess(same) {
      guessed = same;
      if (same) msg('你猜结果不变。点“先合前两个”和“先合后两个”，两条路都走一遍。');
      else msg('你猜结果会变？点“先合前两个”和“先合后两个”，看看两条路走到哪。');
    }
    function showSide(side) {
      var L = LEVELS[li];
      var box = gid(K + '-blocks');
      if (box) box.innerHTML = blocksHtml(side);
      if (side === 'left') {
        sawLeft = true;
        msg(L.left + ' = ' + L.total + '。' + L.leftSteps);
      } else {
        sawRight = true;
        msg(L.right + ' = ' + L.total + '。' + L.rightSteps + (L.note ? L.note : ''));
      }
      if (sawLeft && sawRight) {
        if (guessed === true) msg('两条路都走到 ' + L.total + '：' + L.left + '=' + L.total + '，' + L.right + '=' + L.total + '。你猜对了：先合哪两个，结果一样，这就是结合律。');
        else if (guessed === false) msg('两条路都走到 ' + L.total + '：' + L.left + '=' + L.total + '，' + L.right + '=' + L.total + '。结果没变：先合哪两个都行，这就是结合律。');
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    el.innerHTML =
      '<p class="demo-tag">模拟 · 4 年级 · 运算定律</p>' +
      '<h3>结合律：先算哪两个，结果一样</h3>' +
      '<p>三个数相加（或相乘），先合哪两个都行，结果一样——这就是结合律。下面的三块，橙框框住的就是先合起来的两个。</p>' +
      '<p class="func-eq" id="' + K + '-eq">8 + 5 + 7 = ?</p>' +
      '<p>第 1 步 · 先猜：</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-guess-same" type="button">结果一样</button><button class="btn small primary" id="' + K + '-guess-diff" type="button">结果会变</button></div>' +
      '<p>第 2 步 · 两条路都走一遍：</p>' +
      '<div class="btn-row"><button class="btn small primary" id="' + K + '-left" type="button">先合前两个</button><button class="btn small primary" id="' + K + '-right" type="button">先合后两个</button></div>' +
      '<div id="' + K + '-blocks"></div>' +
      '<p id="' + K + '-msg">先猜，再走两条路。</p>' +
      '<p><b>反例 · 减法试试：</b>(10−3)−2=5，可是 10−(3−2)=9，不一样！减法不能随便换组合。</p>' +
      '<div class="btn-row"><button class="btn small ghost" id="' + K + '-sub" type="button">算一算减法反例</button></div>' +
      '<p id="' + K + '-sub-tx"></p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 8+5+7</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 2×3×4</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 25+17+13</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档的两条路都走过，并且能说出“加法乘法可以换组合，减法不行”。</p>';
    gid(K + '-guess-same').addEventListener('click', function () { onGuess(true); });
    gid(K + '-guess-diff').addEventListener('click', function () { onGuess(false); });
    gid(K + '-left').addEventListener('click', function () { showSide('left'); });
    gid(K + '-right').addEventListener('click', function () { showSide('right'); });
    gid(K + '-sub').addEventListener('click', function () {
      gid(K + '-sub-tx').textContent = '(10−3)−2：先算 10−3=7，再算 7−2=5。10−(3−2)：先算 3−2=1，再算 10−1=9。5 和 9 不一样，所以减法没有结合律。';
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：8+5+7 两条路', '提高：2×3×4 两条路', '挑战：25+17+13 两条路'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

/* (9) op-maketen：免费中文凑十法/破十法（可拖版）。已有 maketen 是“点圆点送进盒子”（点击式，只有加法）。
   本动画补两块：圆点可以拖进盒子（也支持点），再加破十法减法（13−5，先拿走 3 剩下 10，再拿走 2）。 */
registerAnim({
  key: 'op-maketen',
  title: '凑十法·破十法：拖着算',
  sub: '8+5：把圆点拖进盒子凑满 10。13−5：先把 3 拿走剩下 10，再拿走 2。',
  grade: 2,
  kind: '模拟',
  points: ['2.3'],
  group: 'operations',
  render: function (el) {
    var K = 'op-maketen';
    var LEVELS = [
      { label: '基础', kind: 'add', a: 8, b: 5, need: 2, rest: 3, total: 13, guessQ: '要从 5 里拿几个给 8，才能凑满 10？', guessAns: 2 },
      { label: '提高', kind: 'sub', a: 13, b: 5, take: 3, then: 2, total: 8, guessQ: '13−5：先拿走几个，剩下正好是 10？', guessAns: 3 },
      { label: '挑战', kind: 'add', a: 9, b: 6, need: 1, rest: 5, total: 15, guessQ: '要从 6 里拿几个给 9，才能凑满 10？', guessAns: 1 }
    ];
    var li = 0, guess = 0, guessedOk = false, moved = 0, remOut = 0, remBox = 0, tiers = null;
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function dotHtml(id, filled, clickable, label) {
      var bg = filled ? '#2563eb' : '#e2e8f0';
      var tag = clickable ? 'button' : 'span';
      var extra = clickable ? ' type="button"' : '';
      return '<' + tag + ' class="btn small" id="' + id + '"' + extra + ' draggable="true" style="width:38px;height:38px;border-radius:50%;background:' + bg + ';color:#fff;font-size:18px;line-height:38px;padding:0;text-align:center">' + label + '</' + tag + '>';
    }
    function buildStage() {
      var L = LEVELS[li];
      var box = gid(K + '-stage');
      if (!box) return;
      var h = '';
      if (L.kind === 'add') {
        var filled = L.a + moved;
        h += '<p>盒子（装满 10 个）</p><div id="' + K + '-box" style="display:flex;flex-wrap:wrap;gap:4px;max-width:230px;padding:6px;border:2px solid #93c5fd;border-radius:8px">';
        for (var i = 0; i < 10; i++) {
          h += dotHtml(K + '-slot-' + i, i < filled, false, i < filled ? '●' : '○');
        }
        h += '</div><p>外面还剩 ' + (L.b - moved) + ' 个：点一个或拖一个进盒子。</p><div>';
        for (var j = 0; j < L.b - moved; j++) {
          h += dotHtml(K + '-out-' + j, true, true, '●');
        }
        h += '</div><p id="' + K + '-eq2">' + L.a + ' + ' + L.b + ' = ?</p>';
      } else {
        var inBox = 10 - remBox;
        var phase2 = remOut >= L.take;
        h += '<p>盒子（原来 10 个）</p><div id="' + K + '-box" style="display:flex;flex-wrap:wrap;gap:4px;max-width:230px;padding:6px;border:2px solid #93c5fd;border-radius:8px">';
        for (var k = 0; k < 10; k++) {
          h += dotHtml(K + '-slot-' + k, k < inBox, phase2 && k < inBox, k < inBox ? '●' : '○');
        }
        h += '</div><p>外面有 ' + (3 - remOut) + ' 个：' + (phase2 ? '外面拿完了，点盒子里的圆点拿走 ' + L.then + ' 个。' : '先点外面的圆点，把 3 个拿走。') + '</p><div>';
        for (var m = 0; m < 3 - remOut; m++) {
          h += dotHtml(K + '-out-' + m, true, true, '●');
        }
        h += '</div><p id="' + K + '-eq2">13 − 5 = ?</p>';
      }
      box.innerHTML = h;
      wireStage();
    }
    function wireStage() {
      var L = LEVELS[li];
      var box = gid(K + '-box');
      if (box) {
        box.addEventListener('dragover', function (e) { if (e && e.preventDefault) e.preventDefault(); });
        box.addEventListener('drop', function (e) { if (e && e.preventDefault) e.preventDefault(); moveOne(); });
      }
      if (L.kind === 'add') {
        for (var j = 0; j < L.b - moved; j++) {
          (function (n) {
            var b = gid(K + '-out-' + n);
            if (b) {
              b.addEventListener('click', moveOne);
              b.addEventListener('dragstart', function (e) { if (e && e.dataTransfer) e.dataTransfer.setData('text/plain', 'dot'); });
            }
          })(j);
        }
      } else {
        for (var m = 0; m < 3 - remOut; m++) {
          (function (n) {
            var b = gid(K + '-out-' + n);
            if (b) b.addEventListener('click', removeOne);
          })(m);
        }
        var inBox = 10 - remBox;
        for (var k = 0; k < inBox; k++) {
          (function (n) {
            var s = gid(K + '-slot-' + n);
            if (s) s.addEventListener('click', removeOne);
          })(k);
        }
      }
    }
    function moveOne() {
      var L = LEVELS[li];
      if (L.kind !== 'add') return;
      if (moved >= L.need) { msg('盒子已经满了：' + L.a + ' + ' + L.need + ' = 10，剩下 ' + L.rest + ' 个不用进来。10 + ' + L.rest + ' = ' + L.total + '。'); return; }
      moved++;
      buildStage();
      if (moved >= L.need) {
        var eq2 = gid(K + '-eq2');
        if (eq2) eq2.textContent = L.a + ' + ' + L.need + ' = 10，10 + ' + L.rest + ' = ' + L.total + '。';
        msg('装满 10 了！拿了 ' + L.need + ' 个，剩下 ' + L.rest + ' 个：' + L.a + '+' + L.b + '=' + L.total + '。');
        if (tiers) tiers.done(li);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('送进去 ' + moved + ' 个，还差 ' + (L.need - moved) + ' 个装满。');
      }
    }
    function removeOne() {
      var L = LEVELS[li];
      if (L.kind !== 'sub') return;
      if (remOut < L.take) {
        remOut++;
        buildStage();
        if (remOut >= L.take) msg('外面 3 个拿完了，还剩 10 个。13 变成 10+3 里面的 10。再从盒子里拿走 2 个。');
        else msg('拿走 ' + remOut + ' 个，还差 ' + (L.take - remOut) + ' 个，外面就拿完了。');
        return;
      }
      if (remBox < L.then) {
        remBox++;
        buildStage();
        if (remBox >= L.then) {
          var eq2 = gid(K + '-eq2');
          if (eq2) eq2.textContent = '13 − 3 = 10，10 − 2 = 8。';
          msg('拿完了：13−5=8。先拿走 3 剩下 10，再拿走 2 剩下 8——这就是破十法。');
          if (tiers) tiers.done(li);
          if (typeof markTried === 'function') markTried(K);
        } else {
          msg('从盒子里拿走 ' + remBox + ' 个，再拿 ' + (L.then - remBox) + ' 个。');
        }
      }
    }
    function setLevel(i) {
      li = i; guess = 0; guessedOk = false; moved = 0; remOut = 0; remBox = 0;
      var L = LEVELS[i];
      var g = gid(K + '-guess'); if (g) g.textContent = '我猜：0 个';
      var q = gid(K + '-guess-q'); if (q) q.textContent = L.guessQ;
      for (var k = 0; k < 3; k++) {
        var b = gid(K + '-level-' + k);
        if (b) b.setAttribute('aria-pressed', String(k === i));
      }
      buildStage();
      msg('第 1 步 · 先猜：' + L.guessQ + '拨一拨，再点“就猜这个”。');
    }
    function onGuessSet() {
      var L = LEVELS[li];
      if (guess === L.guessAns) {
        guessedOk = true;
        msg('猜对了，就是 ' + guess + ' 个。现在动手：点圆点或拖圆点。');
      } else {
        msg('不是 ' + guess + ' 个：' + (L.kind === 'add' ? L.a + ' 再加几是 10？' : '13 拿走几个剩下 10？') + '再猜猜。');
      }
    }
    el.innerHTML =
      '<p class="demo-tag">模拟 · 2 年级 · 100以内加减法</p>' +
      '<h3>凑十法·破十法：拖着算</h3>' +
      '<p>凑十法和破十法是一对：加法是“凑满 10”，减法是“破开 10”。圆点可以点，也可以拖进盒子、拖出盒子——手一动，算式就变了。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-q">要从 5 里拿几个给 8，才能凑满 10？</span></p>' +
      '<div class="btn-row"><button class="btn small ghost" id="' + K + '-guess-minus" type="button">−1</button><b id="' + K + '-guess">我猜：0 个</b><button class="btn small ghost" id="' + K + '-guess-plus" type="button">+1</button><button class="btn small primary" id="' + K + '-guess-set" type="button">就猜这个</button></div>' +
      '<p>第 2 步 · 玩：点圆点，或把它拖进盒子（减法是拖出去）。</p>' +
      '<div id="' + K + '-stage"></div>' +
      '<p id="' + K + '-msg">先猜，再动手。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 8+5 凑十</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 13−5 破十</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 9+6 凑十</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都做完，并且能说出“加法凑满 10，减法破开 10”。</p>';
    gid(K + '-guess-minus').addEventListener('click', function () {
      guess = Math.max(0, guess - 1);
      gid(K + '-guess').textContent = '我猜：' + guess + ' 个';
    });
    gid(K + '-guess-plus').addEventListener('click', function () {
      guess = Math.min(5, guess + 1);
      gid(K + '-guess').textContent = '我猜：' + guess + ' 个';
    });
    gid(K + '-guess-set').addEventListener('click', onGuessSet);
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：8+5 凑满 10', '提高：13−5 破开 10', '挑战：9+6 凑满 10'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

/* (10) op-powroot：幂与根当运算。已有 powerup 是对折纸和科学记数法，roots 是开方机器。
   本动画把幂和根连成一对反运算：平方是面积长大，开方是反过来问边长；立方是体积长大，开立方是反过来问棱长。 */
registerAnim({
  key: 'op-powroot',
  title: '幂与根：一对反运算',
  sub: '3² 是边长 3 的正方形面积，√9 反过来问边长是几。立方也一样。',
  grade: 8,
  kind: '模拟',
  points: ['8.5', '8.10'],
  group: 'operations',
  render: function (el) {
    var K = 'op-powroot';
    var mode = 'square', n = 1, rootA = 9, s = 1, cn = 1, tiers = null;
    var flags = { sq3: false, sq7: false, root9: false, root49: false, cube5: false };
    var tierDone = [false, false, false];
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function paintSquare() {
      var grid = gid(K + '-grid'), tx = gid(K + '-sq-tx');
      if (grid) {
        var h = '';
        for (var i = 0; i < n * n; i++) {
          h += '<span style="display:inline-block;width:18px;height:18px;background:#93c5fd;border:1px solid #fff"></span>';
        }
        grid.innerHTML = '<div style="width:' + (n * 20) + 'px;line-height:0">' + h + '</div>';
      }
      if (tx) tx.textContent = n + '² = ' + (n * n) + '：边长 ' + n + ' 的正方形，里面有 ' + (n * n) + ' 个小方块。';
      if (n === 3) flags.sq3 = true;
      if (n === 7) flags.sq7 = true;
      checkTiers();
    }
    function paintCube() {
      var tx = gid(K + '-cube-tx');
      var v = cn * cn * cn;
      if (tx) tx.textContent = cn + '³ = ' + cn + '×' + cn + '×' + cn + ' = ' + v + ' 个小方块。' + (cn === 5 ? '反过来：∛125 = 5。' : '');
      if (cn === 5) flags.cube5 = true;
      checkTiers();
    }
    function checkTiers() {
      var t0 = flags.sq3 && flags.root9, t1 = flags.cube5, t2 = flags.sq7 && flags.root49;
      var ts = [t0, t1, t2];
      for (var i = 0; i < 3; i++) {
        if (ts[i] && !tierDone[i]) {
          tierDone[i] = true;
          if (tiers) tiers.done(i);
        }
      }
      if (t0 && t1 && t2 && typeof markTried === 'function') markTried(K);
    }
    function setMode(m) {
      mode = m;
      var panels = ['square', 'root', 'cube'];
      for (var i = 0; i < 3; i++) {
        var p = gid(K + '-panel-' + panels[i]);
        if (p) p.hidden = panels[i] !== m;
        var b = gid(K + '-mode-' + panels[i]);
        if (b) b.setAttribute('aria-pressed', String(panels[i] === m));
      }
      if (m === 'square') msg('先猜：7² 是多少？把边长调到 7，看面积是多少。');
      if (m === 'root') msg('先猜：面积 49 的正方形，边长是几？调一调，点“验算”。');
      if (m === 'cube') msg('先猜：5³ 是多少个小方块？把棱长调到 5 看一看。');
    }
    function verifyRoot() {
      var v = s * s;
      if (v === rootA) {
        if (rootA === 9) flags.root9 = true;
        if (rootA === 49) flags.root49 = true;
        msg('对了：√' + rootA + ' = ' + s + '，因为 ' + s + '² = ' + v + '。开方就是乘方的反运算。');
        checkTiers();
      } else if (v < rootA) {
        msg(s + '² = ' + v + '，比 ' + rootA + ' 小，边长再调大一点。');
      } else {
        msg(s + '² = ' + v + '，比 ' + rootA + ' 大，边长调小一点。');
      }
    }
    el.innerHTML =
      '<p class="demo-tag">模拟 · 8 年级 · 幂的运算、二次根式</p>' +
      '<h3>幂与根：一对反运算</h3>' +
      '<p>乘方是“连乘几次”：平方是面积长大，立方是体积长大。开方反过来问：面积这么大，边长是几？两个是一对反运算。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-mode-square" type="button">平方当面积</button>' +
      '<button class="btn small primary" id="' + K + '-mode-root" type="button">开方当反运算</button>' +
      '<button class="btn small primary" id="' + K + '-mode-cube" type="button">立方当体积</button></div>' +
      '<div id="' + K + '-panel-square">' +
      '<p>边长 n：</p>' +
      '<div class="btn-row"><button class="btn small ghost" id="' + K + '-n-minus" type="button">−1</button><b id="' + K + '-n">边长：1</b><button class="btn small ghost" id="' + K + '-n-plus" type="button">+1</button></div>' +
      '<div id="' + K + '-grid"></div>' +
      '<p id="' + K + '-sq-tx">1² = 1</p></div>' +
      '<div id="' + K + '-panel-root" hidden>' +
      '<p>面积 A：</p>' +
      '<div class="btn-row"><button class="btn small" id="' + K + '-a9" type="button">面积 9</button><button class="btn small" id="' + K + '-a49" type="button">面积 49</button><button class="btn small" id="' + K + '-a144" type="button">面积 144</button></div>' +
      '<p>猜边长 s：</p>' +
      '<div class="btn-row"><button class="btn small ghost" id="' + K + '-s-minus" type="button">−1</button><b id="' + K + '-s">边长：1</b><button class="btn small ghost" id="' + K + '-s-plus" type="button">+1</button><button class="btn small primary" id="' + K + '-verify" type="button">验算</button></div>' +
      '<p id="' + K + '-root-tx">面积 9 的正方形，边长是几？</p></div>' +
      '<div id="' + K + '-panel-cube" hidden>' +
      '<p>棱长 n：</p>' +
      '<div class="btn-row"><button class="btn small ghost" id="' + K + '-c-minus" type="button">−1</button><b id="' + K + '-c">棱长：1</b><button class="btn small ghost" id="' + K + '-c-plus" type="button">+1</button></div>' +
      '<p id="' + K + '-cube-tx">1³ = 1</p>' +
      '<p>一层有 n×n 个，两层、三层……一共 n 层，所以是 n³ 个。</p></div>' +
      '<p id="' + K + '-msg">先选一种，再动手。</p>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：算出 3² 和 √9、5³ 和 ∛125、7² 和 √49，并且能说出“开方是乘方的反运算”。</p>';
    gid(K + '-mode-square').addEventListener('click', function () { setMode('square'); });
    gid(K + '-mode-root').addEventListener('click', function () { setMode('root'); });
    gid(K + '-mode-cube').addEventListener('click', function () { setMode('cube'); });
    gid(K + '-n-minus').addEventListener('click', function () {
      n = Math.max(1, n - 1);
      gid(K + '-n').textContent = '边长：' + n;
      paintSquare();
    });
    gid(K + '-n-plus').addEventListener('click', function () {
      n = Math.min(9, n + 1);
      gid(K + '-n').textContent = '边长：' + n;
      paintSquare();
    });
    gid(K + '-a9').addEventListener('click', function () {
      rootA = 9;
      gid(K + '-root-tx').textContent = '面积 9 的正方形，边长是几？';
      msg('面积改成 9 了，猜边长，点“验算”。');
    });
    gid(K + '-a49').addEventListener('click', function () {
      rootA = 49;
      gid(K + '-root-tx').textContent = '面积 49 的正方形，边长是几？';
      msg('面积改成 49 了，猜边长，点“验算”。');
    });
    gid(K + '-a144').addEventListener('click', function () {
      rootA = 144;
      gid(K + '-root-tx').textContent = '面积 144 的正方形，边长是几？';
      msg('面积改成 144 了，猜边长，点“验算”。');
    });
    gid(K + '-s-minus').addEventListener('click', function () {
      s = Math.max(1, s - 1);
      gid(K + '-s').textContent = '边长：' + s;
    });
    gid(K + '-s-plus').addEventListener('click', function () {
      s = Math.min(12, s + 1);
      gid(K + '-s').textContent = '边长：' + s;
    });
    gid(K + '-verify').addEventListener('click', verifyRoot);
    gid(K + '-c-minus').addEventListener('click', function () {
      cn = Math.max(1, cn - 1);
      gid(K + '-c').textContent = '棱长：' + cn;
      paintCube();
    });
    gid(K + '-c-plus').addEventListener('click', function () {
      cn = Math.min(5, cn + 1);
      gid(K + '-c').textContent = '棱长：' + cn;
      paintCube();
    });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：3² 和 √9', '提高：5³ 和 ∛125', '挑战：7² 和 √49'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    paintSquare();
    paintCube();
    setMode('square');
  }
});
