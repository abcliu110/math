/* anims-band-7-9.js：7–9 年级的新动画（注册表）；每加一个动画调一次 registerAnim，格式见 anims-registry.js 的文件头注释；本文件顶层只能调 registerAnim，不能引用 app.js 的标识符。 */
/* 本批：7.1–7.8 全部方法，24 个动画。每个动画：先猜 → 玩 → 说；三档；“我的发现”进 math-inquiry-v1；做完 markTried(key)。 */
/* 第二批：7.9–7.16 全部方法，24 个动画（同上）。 */

registerAnim({
  key: 'm71-numline',
  title: '数轴距离法',
  sub: '温度、海拔、欠款三把尺共用一条数轴：点一动，三处联动；绝对值就是到原点的距离，实时量出来。',
  grade: 7,
  kind: '模拟',
  points: ['7.1'],
  render: function (el) {
    var K = 'm71-numline';
    var LEVELS = [
      { label: '基础', target: -3, q: '|-3| 是几？', opts: ['3', '-3', '0'], ans: 0 },
      { label: '提高', target: 7, q: '|7| 和 |-7| 一样吗？', opts: ['一样，都是 7', '不一样', '都是 -7'], ans: 0 },
      { label: '挑战', target: -5, q: '和 -5 绝对值相等、但不相等的数是？', opts: ['5', '-5', '0'], ans: 0 }
    ];
    var levelIdx = 0, v = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 7 年级 · 正数和负数</p>' +
      '<h3>数轴距离法</h3>' +
      '<p>一条数轴，三种意思：温度、海拔、欠款都用它量。拖动下面的滑杆，数轴上的点跟着走，三处读数一起变；红线段就是它到原点的距离——那就是绝对值。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 拖一拖：滑杆就是数轴上的点，拖到目标数停下。</p>' +
      '<p><input type="range" id="' + K + '-slider" min="-10" max="10" step="1" value="0" style="width:90%"> <b id="' + K + '-v">0</b></p>' +
      '<p id="' + K + '-line"></p>' +
      '<p>温度：<b id="' + K + '-temp">0℃</b>　海拔：<b id="' + K + '-alt">0 米</b>　欠款：<b id="' + K + '-debt">不欠钱</b></p>' +
      '<p>到原点的距离（绝对值）：<b id="' + K + '-abs">0</b></p>' +
      '<p id="' + K + '-msg">先猜一猜，再拖滑杆。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 移到 -3</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 移到 7</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 移到 -5</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都移到目标数，并且能说出“绝对值就是到原点的距离”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function drawLine() {
      var s = '';
      for (var i = -10; i <= 10; i++) {
        s += (i === v) ? '[●' + i + ']' : (i === 0 ? ' 0 ' : ' · ');
      }
      var ln = gid(K + '-line'); if (ln) ln.textContent = s;
    }
    function render() {
      var L = LEVELS[levelIdx];
      gid(K + '-v').textContent = String(v);
      gid(K + '-temp').textContent = (v >= 0 ? v + '℃' : '零下 ' + (-v) + '℃');
      gid(K + '-alt').textContent = (v >= 0 ? '海拔 ' + v + ' 米' : '海拔 -' + (-v) + ' 米（低于海平面）');
      gid(K + '-debt').textContent = (v >= 0 ? '不欠钱' : '欠 ' + (-v) + ' 元');
      gid(K + '-abs').textContent = String(Math.abs(v));
      drawLine();
      if (v === L.target && guessed >= 0) {
        var ok = guessed === L.ans;
        msg('到了 ' + v + '：绝对值是 ' + Math.abs(v) + '。' +
          (levelIdx === 1 ? '|7| = 7，|-7| = 7，方向不同，离原点一样远。' :
            levelIdx === 2 ? '5 和 -5 到原点的距离都是 5，所以 |-5| = |5| = 5。' : '') +
          (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再看一遍红线段：它量的是距离，没有负号。'));
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      levelIdx = i; v = 0; guessed = -1;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-slider').value = '0';
      msg('先猜一猜，再拖滑杆到 ' + L.target + '。');
      render();
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜：' + LEVELS[levelIdx].opts[g] + '。拖滑杆到 ' + LEVELS[levelIdx].target + '，看看对不对。');
        });
      })(g);
    }
    gid(K + '-slider').addEventListener('input', function (e) {
      v = parseInt(e.target.value, 10);
      if (guessed < 0) { msg('先猜一猜，再拖滑杆。'); return; }
      render();
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：|-3| = 3', '提高：|7| = |-7|', '挑战：找到 5'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm71-scene',
  title: '真实情境法（温度/海拔/欠款）',
  sub: '零下 3℃、海拔 -10 米、欠 5 元——负号先有意思，再有规则：把三个情境一个一个放到数轴上。',
  grade: 7,
  kind: '实验',
  points: ['7.1'],
  render: function (el) {
    var K = 'm71-scene';
    var SCENES = [
      { label: '基础', name: '温度', text: '零下 3℃', value: -3, unit: '℃' },
      { label: '提高', name: '海拔', text: '海拔 -10 米', value: -10, unit: '米' },
      { label: '挑战', name: '欠款', text: '欠 5 元', value: -5, unit: '元' }
    ];
    var levelIdx = 0, placed = {}, guessed = null, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 7 年级 · 正数和负数</p>' +
      '<h3>真实情境法（温度/海拔/欠款）</h3>' +
      '<p>负数不是凭空来的：比 0 低、比 0 少的量，就要用负数记。先猜它在 0 的哪边，再点卡片，把它放到数轴上。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-guess-left" type="button">在 0 的左边（负数）</button>' +
      '<button class="btn small primary" id="' + K + '-guess-right" type="button">在 0 的右边（正数）</button></div>' +
      '<p>第 2 步 · 放上数轴：点下面的卡片，再点数轴上的刻度。</p>' +
      '<p id="' + K + '-line">-10 · · · · · · · · · · 0 · · · · · · · · · · 10</p>' +
      '<p id="' + K + '-placed"></p>' +
      '<div class="btn-row">' +
      '<button class="btn small" id="' + K + '-card-0" type="button">温度：零下 3℃</button>' +
      '<button class="btn small" id="' + K + '-card-1" type="button">海拔：-10 米</button>' +
      '<button class="btn small" id="' + K + '-card-2" type="button">欠款：欠 5 元</button></div>' +
      '<p>点数轴刻度：</p><div class="btn-row" id="' + K + '-ticks"></div>' +
      '<p id="' + K + '-msg">先猜一猜：这个情境在 0 的左边还是右边？</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 温度</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 海拔</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 欠款</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三个情境都放到对的位置，并且能说出“比 0 低 / 比 0 少就用负数”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    var selCard = -1;
    function buildTicks() {
      var box = gid(K + '-ticks');
      while (box.firstChild) box.removeChild(box.firstChild);
      for (var i = -10; i <= 10; i++) {
        (function (i) {
          var b = document.createElement('button');
          b.type = 'button'; b.className = 'btn small ghost'; b.textContent = String(i);
          b.addEventListener('click', function () { onTick(i); });
          box.appendChild(b);
        })(i);
      }
    }
    function onTick(i) {
      if (selCard < 0) { msg('先点一张情境卡片，再点刻度。'); return; }
      if (guessed === null) { msg('先猜一猜：它在 0 的左边还是右边？'); return; }
      var sc = SCENES[selCard];
      if (i === sc.value) {
        placed[selCard] = true;
        var p = gid(K + '-placed');
        p.textContent = (p.textContent ? p.textContent + '　' : '') + sc.name + ' → ' + sc.value + sc.unit;
        msg(sc.text + '放在 ' + sc.value + ' 对了！' +
          (guessed === 'left' ? '你猜对了：比 0 低 / 少，在左边。' : '它在 0 的左边，你刚才猜了右边——比 0 低的量就是负数。') +
          (levelIdx === 2 ? '再比一比：-10 比 -5 更靠左，所以 -10 更小。' : ''));
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
        selCard = -1;
      } else {
        msg('放在 ' + i + ' 不对：' + sc.text + ' 是比 0 ' + (sc.value < 0 ? '低' : '高') + ' 的量，再想想它在 0 的哪边、离 0 几格。');
      }
    }
    function setLevel(i) {
      levelIdx = i; selCard = i; guessed = null;
      var sc = SCENES[i];
      gid(K + '-guess-tx').textContent = sc.text + '——在 0 的左边还是右边？';
      gid(K + '-guess-left').disabled = false;
      gid(K + '-guess-right').disabled = false;
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      msg('这一档是“' + sc.name + '”：先猜，再点刻度 ' + sc.value + ' 试试。');
    }
    gid(K + '-guess-left').addEventListener('click', function () { guessed = 'left'; msg('你猜：左边。再点刻度放上去。'); });
    gid(K + '-guess-right').addEventListener('click', function () { guessed = 'right'; msg('你猜：右边。再点刻度放上去。'); });
    for (var c = 0; c < 3; c++) {
      (function (c) {
        gid(K + '-card-' + c).addEventListener('click', function () {
          selCard = c;
          msg('选好了“' + SCENES[c].name + '”，点下面的刻度把它放上去。');
        });
      })(c);
    }
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：零下 3℃ → -3', '提高：海拔 -10 米', '挑战：欠 5 元 → -5'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    buildTicks();
    setLevel(0);
  }
});

registerAnim({
  key: 'm71-mirror',
  title: '相反数镜像法',
  sub: '相反数是关于原点的镜像：距离相等、方向相反。拖动一个数，照照镜子，看它的相反数长什么样。',
  grade: 7,
  kind: '模拟',
  points: ['7.1'],
  render: function (el) {
    var K = 'm71-mirror';
    var LEVELS = [
      { label: '基础', a: 4, q: '4 的相反数是？', opts: ['-4', '4', '0'], ans: 0 },
      { label: '提高', a: -2.5, q: '-2.5 的相反数是？', opts: ['2.5', '-2.5', '5'], ans: 0 },
      { label: '挑战', a: 0, q: '0 的相反数是？', opts: ['0', '1', '-1'], ans: 0 }
    ];
    var levelIdx = 0, a = 4, guessed = -1, shown = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 7 年级 · 正数和负数</p>' +
      '<h3>相反数镜像法</h3>' +
      '<p>0 是镜子：一个数照镜子，镜子里的数离 0 一样远、方向相反。先猜，再点“照镜子”验证；还可以自己拖滑杆换个数照一照。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 照镜子：<button class="btn small primary" id="' + K + '-mirror-btn" type="button">照镜子</button>　自己换个数：<input type="range" id="' + K + '-slider" min="-6" max="6" step="0.5" value="4" style="width:50%"></p>' +
      '<p>这个数：<b id="' + K + '-a">4</b>　镜子里的数：<b id="' + K + '-b">？</b></p>' +
      '<p id="' + K + '-line"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再照镜子。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 4</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · -2.5</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 0</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都照对，并且能说出“相反数到原点的距离相等、方向相反”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function fmt(x) { return (Math.round(x * 10) / 10).toString(); }
    function drawLine() {
      var s = '';
      for (var i = -6; i <= 6; i++) {
        var mark = '';
        if (i === a) mark = '●';
        if (shown && i === -a) mark = '○';
        s += (i === 0 ? ' 0 ' : (mark ? mark + i : ' · '));
      }
      var ln = gid(K + '-line'); if (ln) ln.textContent = s;
    }
    function setLevel(i) {
      levelIdx = i; a = LEVELS[i].a; guessed = -1; shown = false;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-slider').value = String(a);
      gid(K + '-a').textContent = fmt(a);
      gid(K + '-b').textContent = '？';
      drawLine();
      msg('先猜一猜 ' + fmt(a) + ' 的相反数，再照镜子。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜：' + LEVELS[levelIdx].opts[g] + '。点“照镜子”验证。');
        });
      })(g);
    }
    gid(K + '-slider').addEventListener('input', function (e) {
      a = parseFloat(e.target.value);
      shown = false;
      gid(K + '-a').textContent = fmt(a);
      gid(K + '-b').textContent = '？';
      drawLine();
      msg('换成了 ' + fmt(a) + '：先猜它的相反数，再照镜子。');
    });
    gid(K + '-mirror-btn').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜，再照镜子。'); return; }
      shown = true;
      var opp = -a;
      gid(K + '-b').textContent = fmt(opp);
      drawLine();
      var ok = guessed === LEVELS[levelIdx].ans;
      var extra = (a === 0) ? '0 照镜子还是 0——0 的相反数是它自己。' :
        ('两个数到原点的距离都是 ' + fmt(Math.abs(a)) + '，一个在左一个在右，加起来是 0。');
      msg(fmt(a) + ' 的相反数是 ' + fmt(opp) + '。' + extra + (ok ? '你猜对了！' : '你刚才猜的是“' + LEVELS[levelIdx].opts[guessed] + '”。'));
      if (a === LEVELS[levelIdx].a) {
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：4 的相反数是 -4', '提高：-2.5 的相反数是 2.5', '挑战：0 的相反数是 0'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm72-walk',
  title: '数轴走路法',
  sub: '加法就是小人在数轴上走：加正数向右走，加负数向左走；减法就是反方向走。先猜落点，再让小人走。',
  grade: 7,
  kind: '模拟',
  points: ['7.2'],
  render: function (el) {
    var K = 'm72-walk';
    var LEVELS = [
      { label: '基础', start: 2, step: 3, op: '+', q: '2 + 3，小人走到几？', opts: ['5', '-1', '1'], ans: 0 },
      { label: '提高', start: -1, step: -4, op: '+', q: '-1 + (-4)，小人走到几？', opts: ['-5', '3', '-3'], ans: 0 },
      { label: '挑战', start: 5, step: -8, op: '-', q: '5 - 8，小人走到几？', opts: ['-3', '13', '3'], ans: 0 }
    ];
    var levelIdx = 0, pos = 2, walked = false, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 7 年级 · 有理数的加减法</p>' +
      '<h3>数轴走路法</h3>' +
      '<p>小人站在数轴上：加一个数，就朝它的方向走那么多格；加正数向右，加负数向左。减法就是“反方向走”。先猜落点，再点“走”。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 走一走：<button class="btn small primary" id="' + K + '-walk-btn" type="button">走</button>　<button class="btn small ghost" id="' + K + '-reset-btn" type="button">回到起点</button></p>' +
      '<p>算式：<b id="' + K + '-expr"></b>　小人在：<b id="' + K + '-pos"></b></p>' +
      '<p id="' + K + '-line"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再点“走”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 2 + 3</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · -1 + (-4)</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 5 - 8</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都走对，并且能说出“加负数向左走，减法就是反方向走”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function exprText(L) {
      var s = L.step >= 0 ? '+' + L.step : String(L.step);
      return L.start + ' ' + L.op + ' (' + s + ')';
    }
    function drawLine() {
      var s = '';
      for (var i = -10; i <= 10; i++) {
        s += (i === pos) ? '[人' + i + ']' : (i === 0 ? ' 0 ' : ' · ');
      }
      var ln = gid(K + '-line'); if (ln) ln.textContent = s;
    }
    function setLevel(i) {
      levelIdx = i; var L = LEVELS[i];
      pos = L.start; walked = false; guessed = -1;
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-expr').textContent = exprText(L);
      gid(K + '-pos').textContent = String(pos);
      drawLine();
      msg('小人从 ' + L.start + ' 出发，先猜落点，再点“走”。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜：' + LEVELS[levelIdx].opts[g] + '。点“走”，看小人落在哪。');
        });
      })(g);
    }
    gid(K + '-walk-btn').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜落点，再点“走”。'); return; }
      var L = LEVELS[levelIdx];
      var dest = L.op === '+' ? L.start + L.step : L.start - L.step;
      pos = dest; walked = true;
      gid(K + '-pos').textContent = String(pos);
      drawLine();
      var ok = guessed === L.ans;
      var dir = (L.op === '+' ? L.step : -L.step) >= 0 ? '向右' : '向左';
      msg(exprText(L) + ' = ' + dest + '：小人' + dir + '走了 ' + Math.abs(L.op === '+' ? L.step : -L.step) + ' 格。' +
        (levelIdx === 2 ? '减 8 就是反方向走 8 格，也就是加 -8。' : '') +
        (ok ? '你猜对了！' : '你刚才猜的是 ' + L.opts[guessed] + '，再看一遍小人的脚印。'));
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    });
    gid(K + '-reset-btn').addEventListener('click', function () { setLevel(levelIdx); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：2 + 3 = 5', '提高：-1 + (-4) = -5', '挑战：5 - 8 = -3'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm72-chips',
  title: '正负筹码抵消法（零对）',
  sub: '红筹码是 +1，蓝筹码是 -1：一红一蓝凑成零对就消失，剩下的筹码就是答案；减法就是拿走筹码，拿不走就先补零对。',
  grade: 7,
  kind: '实验',
  points: ['7.2'],
  render: function (el) {
    var K = 'm72-chips';
    var LEVELS = [
      { label: '基础', expr: '3 + (-2)', startPos: 0, startNeg: 0, q: '3 + (-2) 是几？', opts: ['1', '5', '-1'], ans: 0, hint: '先放 3 个红筹码，再放 2 个蓝筹码，抵消零对。' },
      { label: '提高', expr: '(-5) + 3', startPos: 0, startNeg: 0, q: '(-5) + 3 是几？', opts: ['-2', '2', '-8'], ans: 0, hint: '先放 5 个蓝筹码，再放 3 个红筹码，抵消零对。' },
      { label: '挑战', expr: '2 - (-3)', startPos: 2, startNeg: 0, q: '2 - (-3) 是几？', opts: ['5', '-1', '-5'], ans: 0, hint: '桌上只有 2 个红筹码，拿不走蓝筹码——先补 3 对零对，再拿走 3 个蓝的。' }
    ];
    var levelIdx = 0, pos = 0, neg = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 7 年级 · 有理数的加减法</p>' +
      '<h3>正负筹码抵消法（零对）</h3>' +
      '<p>红筹码 = +1，蓝筹码 = -1。一红一蓝凑成一对就抵消消失（零对），最后剩下的就是答案。减法就是“拿走”：桌上没有要拿的筹码，就先补几对零对再拿——总数不变。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 摆筹码：</p>' +
      '<div class="btn-row">' +
      '<button class="btn small" id="' + K + '-add-pos" type="button">＋红（+1）</button>' +
      '<button class="btn small" id="' + K + '-add-neg" type="button">＋蓝（-1）</button>' +
      '<button class="btn small" id="' + K + '-take-pos" type="button">拿走红</button>' +
      '<button class="btn small" id="' + K + '-take-neg" type="button">拿走蓝</button>' +
      '<button class="btn small" id="' + K + '-add-zero" type="button">补一对零对</button>' +
      '<button class="btn small primary" id="' + K + '-cancel" type="button">抵消零对</button></div>' +
      '<p>桌上：<b id="' + K + '-table"></b></p>' +
      '<p>算式：<b id="' + K + '-expr"></b>　提示：<span id="' + K + '-hint"></span></p>' +
      '<p><button class="btn small primary" id="' + K + '-check" type="button">算一算，报答案</button></p>' +
      '<p id="' + K + '-msg">先猜一猜，再摆筹码。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 3 + (-2)</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · (-5) + 3</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 2 - (-3)</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都摆对，并且能说出“零对抵消，剩下的就是答案”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function renderTable() {
      var s = '';
      for (var i = 0; i < pos; i++) s += '●';
      for (var j = 0; j < neg; j++) s += '○';
      gid(K + '-table').textContent = (s || '空') + '（红 ' + pos + ' 个，蓝 ' + neg + ' 个，合计 ' + (pos - neg) + '）';
    }
    function setLevel(i) {
      levelIdx = i; var L = LEVELS[i];
      pos = L.startPos; neg = L.startNeg; guessed = -1;
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-expr').textContent = L.expr;
      gid(K + '-hint').textContent = L.hint;
      renderTable();
      msg('先猜 ' + L.expr + ' 的答案，再摆筹码。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜：' + LEVELS[levelIdx].opts[g] + '。摆好筹码，点“算一算”验证。');
        });
      })(g);
    }
    gid(K + '-add-pos').addEventListener('click', function () { pos++; renderTable(); });
    gid(K + '-add-neg').addEventListener('click', function () { neg++; renderTable(); });
    gid(K + '-take-pos').addEventListener('click', function () {
      if (pos <= 0) { msg('桌上没有红筹码可拿——先补零对。'); return; }
      pos--; renderTable();
    });
    gid(K + '-take-neg').addEventListener('click', function () {
      if (neg <= 0) { msg('桌上没有蓝筹码可拿——先补零对。'); return; }
      neg--; renderTable();
    });
    gid(K + '-add-zero').addEventListener('click', function () { pos++; neg++; renderTable(); msg('补了一对零对：+1 和 -1 一起放，总数不变。'); });
    gid(K + '-cancel').addEventListener('click', function () {
      var n = Math.min(pos, neg);
      if (n === 0) { msg('没有能抵消的零对。'); return; }
      pos -= n; neg -= n; renderTable();
      msg('抵消了 ' + n + ' 对零对，剩下红 ' + pos + ' 个、蓝 ' + neg + ' 个。');
    });
    gid(K + '-check').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜答案。'); return; }
      var L = LEVELS[levelIdx];
      var expect = [1, -2, 5][levelIdx];
      if (pos - neg !== expect) {
        msg('桌上合计是 ' + (pos - neg) + '，还不是 ' + expect + '：再摆一摆、抵消一下。');
        return;
      }
      var ok = guessed === L.ans;
      msg(L.expr + ' = ' + expect + '：' +
        (levelIdx === 2 ? '拿走 3 个蓝筹码，等于加上 3 个红筹码——减 -3 就是加 3。' : '零对抵消完，剩下的就是答案。') +
        (ok ? '你猜对了！' : '你刚才猜的是 ' + L.opts[guessed] + '，再看一遍桌上的筹码。'));
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：3 + (-2) = 1', '提高：(-5) + 3 = -2', '挑战：2 - (-3) = 5'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm72-subadd',
  title: '减法变加法（加相反数）',
  sub: 'a - b = a + (-b)：减号翻个面，减数也翻个面，减法就变成了加法。翻一翻，看两边算出来是不是一样。',
  grade: 7,
  kind: '演示',
  points: ['7.2'],
  render: function (el) {
    var K = 'm72-subadd';
    var LEVELS = [
      { label: '基础', a: 5, b: 3, q: '5 - 3 变成加法是？', opts: ['5 + (-3)', '5 + 3', '-5 + 3'], ans: 0 },
      { label: '提高', a: -2, b: 4, q: '-2 - 4 变成加法是？', opts: ['-2 + (-4)', '-2 + 4', '2 + (-4)'], ans: 0 },
      { label: '挑战', a: 3, b: -5, q: '3 - (-5) 变成加法是？', opts: ['3 + 5', '3 + (-5)', '-3 + 5'], ans: 0 }
    ];
    var levelIdx = 0, guessed = -1, flipped = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 7 年级 · 有理数的加减法</p>' +
      '<h3>减法变加法（加相反数）</h3>' +
      '<p>减法不用单独记：减一个数，就是加它的相反数。减号翻面，减数翻面，两边算出来一模一样——自己翻一次就信了。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 翻一翻：<button class="btn small primary" id="' + K + '-flip-btn" type="button">减号翻面，减数翻面</button>　<button class="btn small ghost" id="' + K + '-back-btn" type="button">翻回去</button></p>' +
      '<p>原来：<b id="' + K + '-orig"></b>　翻面后：<b id="' + K + '-flipped">？</b></p>' +
      '<p>两边算出来：<b id="' + K + '-vals">？</b></p>' +
      '<p id="' + K + '-msg">先猜一猜，减法变成加法该怎么写。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 5 - 3</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · -2 - 4</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 3 - (-5)</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都翻对，并且能说出“减一个数就是加它的相反数”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function fmt(x) { return (x >= 0 ? String(x) : '(' + x + ')'); }
    function setLevel(i) {
      levelIdx = i; var L = LEVELS[i];
      guessed = -1; flipped = false;
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-orig').textContent = fmt(L.a) + ' - ' + fmt(L.b);
      gid(K + '-flipped').textContent = '？';
      gid(K + '-vals').textContent = '？';
      msg('先猜：' + fmt(L.a) + ' - ' + fmt(L.b) + ' 变成加法怎么写？');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜：' + LEVELS[levelIdx].opts[g] + '。点“翻一翻”验证。');
        });
      })(g);
    }
    gid(K + '-flip-btn').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜，再翻面。'); return; }
      var L = LEVELS[levelIdx];
      flipped = true;
      var addExpr = fmt(L.a) + ' + ' + fmt(-L.b);
      gid(K + '-flipped').textContent = addExpr;
      var v1 = L.a - L.b, v2 = L.a + (-L.b);
      gid(K + '-vals').textContent = fmt(L.a) + ' - ' + fmt(L.b) + ' = ' + v1 + '，' + addExpr + ' = ' + v2;
      var ok = guessed === L.ans;
      msg('减号翻成加号，' + fmt(L.b) + ' 翻成它的相反数 ' + fmt(-L.b) + '。两边都是 ' + v1 + '，一模一样。' +
        (levelIdx === 2 ? '减 -5 就是加 5，所以 3 - (-5) = 8。' : '') +
        (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，记住：减数要翻面。'));
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    });
    gid(K + '-back-btn').addEventListener('click', function () {
      flipped = false;
      gid(K + '-flipped').textContent = '？';
      gid(K + '-vals').textContent = '？';
      msg('翻回去了。再猜一次，重新翻。');
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：5 - 3 = 5 + (-3)', '提高：-2 - 4 = -2 + (-4)', '挑战：3 - (-5) = 3 + 5'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm73-debt',
  title: '欠款账本法',
  sub: '(-2)×3 是欠 2 元记 3 次，(-2)×(-3) 是划掉 3 次欠款：乘法先有故事再有法则，负负得正在账本上看得见。',
  grade: 7,
  kind: '模拟',
  points: ['7.3'],
  render: function (el) {
    var K = 'm73-debt';
    var LEVELS = [
      { label: '基础', unit: -2, times: 3, mode: 'add', q: '欠 2 元，记 3 次，一共是？', opts: ['-6 元', '6 元', '1 元'], ans: 0, hint: '点 3 次“记一次欠 2 元”。' },
      { label: '提高', unit: -4, times: 3, mode: 'add', q: '欠 4 元，记 3 次，一共是？', opts: ['-12 元', '12 元', '-1 元'], ans: 0, hint: '点 3 次“记一次欠 4 元”。' },
      { label: '挑战', unit: -2, times: 3, mode: 'remove', q: '账上有 3 笔欠 2 元的账，全部划掉，账变了多少？', opts: ['多了 6 元', '少了 6 元', '不变'], ans: 0, hint: '先点 3 次“记一次欠 2 元”把账记上，再点 3 次“划掉一笔”。' }
    ];
    var levelIdx = 0, records = [], guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 7 年级 · 有理数的乘除法</p>' +
      '<h3>欠款账本法</h3>' +
      '<p>乘法就是“记几次”：欠 2 元记 3 次，就是 (-2)×3；把欠款划掉，就是乘上一个负数——划掉欠款，钱就回来了，所以负负得正。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 记账：</p>' +
      '<div class="btn-row">' +
      '<button class="btn small" id="' + K + '-add-btn" type="button">记一次欠款</button>' +
      '<button class="btn small" id="' + K + '-remove-btn" type="button">划掉一笔欠款</button>' +
      '<button class="btn small ghost" id="' + K + '-clear-btn" type="button">账本清零</button></div>' +
      '<p>账本：<b id="' + K + '-book">（空）</b></p>' +
      '<p>合计：<b id="' + K + '-total">0 元</b>　算式：<b id="' + K + '-expr"></b>　提示：<span id="' + K + '-hint"></span></p>' +
      '<p><button class="btn small primary" id="' + K + '-check" type="button">对账：报答案</button></p>' +
      '<p id="' + K + '-msg">先猜一猜，再记账。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · (-2)×3</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · (-4)×3</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · (-2)×(-3)</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都对上账，并且能说出“划掉欠款就是负负得正”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function total() {
      var s = 0;
      for (var i = 0; i < records.length; i++) s += records[i];
      return s;
    }
    function renderBook() {
      gid(K + '-book').textContent = records.length ? records.join('，') + '（每笔单位：元）' : '（空）';
      var t = total();
      gid(K + '-total').textContent = (t < 0 ? '欠 ' + (-t) + ' 元' : t === 0 ? '0 元（不欠不余）' : '余 ' + t + ' 元');
      var L = LEVELS[levelIdx];
      gid(K + '-expr').textContent = '(' + L.unit + ')×' + (L.mode === 'add' ? L.times : '(' + (-L.times) + ')');
    }
    function setLevel(i) {
      levelIdx = i; var L = LEVELS[i];
      records = []; guessed = -1;
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-hint').textContent = L.hint;
      renderBook();
      msg('先猜，再按提示记账。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜：' + LEVELS[levelIdx].opts[g] + '。记好账，点“对账”验证。');
        });
      })(g);
    }
    gid(K + '-add-btn').addEventListener('click', function () {
      records.push(LEVELS[levelIdx].unit);
      renderBook();
    });
    gid(K + '-remove-btn').addEventListener('click', function () {
      var L = LEVELS[levelIdx];
      var idx = records.indexOf(L.unit);
      if (idx < 0) { msg('账上没有欠 ' + (-L.unit) + ' 元的笔可划——先记上几笔。'); return; }
      records.splice(idx, 1);
      renderBook();
      msg('划掉一笔欠 ' + (-L.unit) + ' 元的账，合计多了 ' + (-L.unit) + ' 元。');
    });
    gid(K + '-clear-btn').addEventListener('click', function () { records = []; renderBook(); });
    gid(K + '-check').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜答案。'); return; }
      var L = LEVELS[levelIdx];
      var expect = L.unit * L.times * (L.mode === 'add' ? 1 : -1);
      if (total() !== expect) {
        msg('账上合计是 ' + total() + ' 元，还不是 ' + expect + ' 元：按提示再记一记 / 划一划。');
        return;
      }
      var ok = guessed === L.ans;
      msg('对上了：(' + L.unit + ')×' + (L.mode === 'add' ? L.times : '(' + (-L.times) + ')') + ' = ' + expect + '。' +
        (L.mode === 'remove' ? '划掉 3 笔欠款，每笔 +2 元，一共多了 6 元——负负得正，就是这么来的。' : '欠款记几次，就是负数乘几。') +
        (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再看一遍账本。'));
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：(-2)×3 = -6', '提高：(-4)×3 = -12', '挑战：(-2)×(-3) = 6'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm73-fold',
  title: '对折翻倍法',
  sub: '一张纸对折，厚度 2 倍、4 倍、8 倍地涨：乘方是重复乘，不是重复加。对折 10 次，纸比你还高吗？',
  grade: 7,
  kind: '实验',
  points: ['7.3'],
  render: function (el) {
    var K = 'm73-fold';
    var LEVELS = [
      { label: '基础', folds: 3, q: '对折 3 次，有几层？', opts: ['8 层', '6 层', '3 层'], ans: 0 },
      { label: '提高', folds: 6, q: '对折 6 次，有几层？', opts: ['64 层', '12 层', '36 层'], ans: 0 },
      { label: '挑战', folds: 10, q: '对折 10 次，有几层？', opts: ['1024 层', '20 层', '100 层'], ans: 0 }
    ];
    var levelIdx = 0, folds = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 7 年级 · 有理数的乘方</p>' +
      '<h3>对折翻倍法</h3>' +
      '<p>一张 0.1 毫米的纸，对折一次变 2 层，再对折变 4 层——每次都是“再乘一个 2”，不是“再加一个 2”。先猜层数，再拖滑杆对折。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 对折：<input type="range" id="' + K + '-slider" min="0" max="10" step="1" value="0" style="width:70%"> <b id="' + K + '-folds">0 次</b></p>' +
      '<p>层数：<b id="' + K + '-layers">1 层</b>　算式：<b id="' + K + '-expr">2 的 0 次方 = 1</b></p>' +
      '<p>厚度：<b id="' + K + '-thick">0.1 毫米</b>　如果只是“加”：<b id="' + K + '-add">0.1 毫米</b></p>' +
      '<p id="' + K + '-msg">先猜一猜，再拖滑杆对折。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 对折 3 次</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 对折 6 次</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 对折 10 次</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都对折到目标次数，并且能说出“乘方是重复乘，不是重复加”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function pow2(n) { var r = 1; for (var i = 0; i < n; i++) r *= 2; return r; }
    function render() {
      var layers = pow2(folds);
      gid(K + '-folds').textContent = folds + ' 次';
      gid(K + '-layers').textContent = layers + ' 层';
      var mult = '2';
      for (var i = 1; i < folds; i++) mult += '×2';
      gid(K + '-expr').textContent = folds === 0 ? '2 的 0 次方 = 1' : '2 的 ' + folds + ' 次方 = ' + mult + ' = ' + layers;
      var mm = layers * 0.1;
      gid(K + '-thick').textContent = (mm >= 10 ? (mm / 10) + ' 厘米' : mm + ' 毫米');
      gid(K + '-add').textContent = '对折 ' + folds + ' 次只加 ' + folds + ' 层的话，才 ' + (folds + 1) + ' 层';
      var L = LEVELS[levelIdx];
      if (folds === L.folds && guessed >= 0) {
        var ok = guessed === L.ans;
        msg('对折 ' + folds + ' 次：' + layers + ' 层，厚 ' + (mm >= 10 ? (mm / 10) + ' 厘米' : mm + ' 毫米') + '。' +
          (folds === 10 ? '10 次就超过 10 厘米了——指数涨起来比加法快得多。' : '每次翻倍，不是每次加 2。') +
          (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再看一遍算式：2 连乘 ' + folds + ' 个。'));
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      levelIdx = i; folds = 0; guessed = -1;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-slider').value = '0';
      render();
      msg('先猜对折 ' + L.folds + ' 次有几层，再拖滑杆。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜：' + LEVELS[levelIdx].opts[g] + '。拖滑杆对折到 ' + LEVELS[levelIdx].folds + ' 次验证。');
        });
      })(g);
    }
    gid(K + '-slider').addEventListener('input', function (e) {
      folds = parseInt(e.target.value, 10);
      if (guessed < 0) { msg('先猜一猜，再对折。'); return; }
      render();
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：对折 3 次 = 8 层', '提高：对折 6 次 = 64 层', '挑战：对折 10 次 = 1024 层'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm73-scinote',
  title: '小数点移动法',
  sub: '科学记数法就是小数点搬家：×10ⁿ 向右 n 位，×10⁻ⁿ 向左 n 位。拖动小数点，指数自动跟着走。',
  grade: 7,
  kind: '模拟',
  points: ['7.3'],
  render: function (el) {
    var K = 'm73-scinote';
    var LEVELS = [
      { label: '基础', digits: '38', trail: 3, q: '38000 写成科学记数法，10 的指数是几？', opts: ['4', '5', '3'], ans: 0 },
      { label: '提高', digits: '45', lead: 2, q: '0.0045 写成科学记数法，10 的指数是几？', opts: ['-3', '3', '-2'], ans: 0 },
      { label: '挑战', digits: '7', lead: 6, q: '0.0000007 写成科学记数法，10 的指数是几？', opts: ['-7', '7', '-6'], ans: 0 }
    ];
    var levelIdx = 0, pos = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 7 年级 · 科学记数法</p>' +
      '<h3>小数点移动法</h3>' +
      '<p>一个数写成 a×10ⁿ，a 在 1 到 10 之间：小数点每搬一位，指数就变 1。点“◀ ▶”搬小数点，看指数怎么跟着走。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 搬小数点：<button class="btn small" id="' + K + '-left" type="button">◀ 向左搬</button> <button class="btn small" id="' + K + '-right" type="button">向右搬 ▶</button> <button class="btn small ghost" id="' + K + '-reset" type="button">回到原数</button></p>' +
      '<p>原数：<b id="' + K + '-orig"></b></p>' +
      '<p>现在：<b id="' + K + '-now"></b></p>' +
      '<p>科学记数法：<b id="' + K + '-sci"></b></p>' +
      '<p id="' + K + '-msg">先猜一猜指数，再搬小数点。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 38000</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 0.0045</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 0.0000007</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都搬到 a 在 1 到 10 之间，并且能说出“小数点搬一位，指数变 1”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function origText(L) {
      if (L.trail) {
        var s = L.digits;
        for (var i = 0; i < L.trail; i++) s += '0';
        return s;
      }
      var z = '';
      for (var j = 0; j < L.lead; j++) z += '0';
      return '0.' + z + L.digits;
    }
    function render() {
      var L = LEVELS[levelIdx];
      var exp = pos;
      var val = parseFloat(origText(L));
      var a = val / Math.pow(10, pos);
      var m = String(Math.round(a * 1000000) / 1000000);
      var shown;
      if (pos === 0) {
        shown = origText(L);
      } else if (pos > 0) {
        shown = m + ' × 10 的 ' + exp + ' 次方（小数点向左搬了 ' + pos + ' 位）';
      } else {
        shown = m + ' × 10 的 ' + exp + ' 次方（小数点向右搬了 ' + (-pos) + ' 位）';
      }
      gid(K + '-now').textContent = shown;
      if (a >= 1 && a < 10 && pos !== 0) {
        gid(K + '-sci').textContent = m + ' × 10 的 ' + exp + ' 次方';
        if (guessed >= 0) {
          var ok = guessed === L.ans;
          msg('搬到了：' + m + ' × 10 的 ' + exp + ' 次方。a = ' + m + ' 在 1 到 10 之间，指数是 ' + exp + '。' +
            (ok ? '你猜对了！' : '你刚才猜指数是 ' + L.opts[guessed] + '，数一数小数点搬了几位。'));
          if (tiers) tiers.done(levelIdx);
          if (typeof markTried === 'function') markTried(K);
        }
      } else {
        gid(K + '-sci').textContent = '还没搬到：a 要在 1 到 10 之间';
      }
    }
    function setLevel(i) {
      levelIdx = i; pos = 0; guessed = -1;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-orig').textContent = origText(L);
      render();
      msg('先猜指数，再搬小数点，直到 a 在 1 到 10 之间。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜指数是 ' + LEVELS[levelIdx].opts[g] + '。搬小数点验证。');
        });
      })(g);
    }
    function move(d) {
      if (guessed < 0) { msg('先猜一猜指数，再搬小数点。'); return; }
      pos += d;
      if (pos > 8) pos = 8;
      if (pos < -8) pos = -8;
      render();
    }
    gid(K + '-left').addEventListener('click', function () { move(1); });
    gid(K + '-right').addEventListener('click', function () { move(-1); });
    gid(K + '-reset').addEventListener('click', function () { pos = 0; render(); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：38000 = 3.8×10的4次方', '提高：0.0045 = 4.5×10的-3次方', '挑战：0.0000007 = 7×10的-7次方'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm74-tiles',
  title: '代数瓷砖法',
  sub: '多项式是一堆不同尺寸的砖：x² 是方块、x 是长条、1 是小方块；同尺寸才能数到一起，不同尺寸拼不到一块。',
  grade: 7,
  kind: '模拟',
  points: ['7.4'],
  render: function (el) {
    var K = 'm74-tiles';
    var LEVELS = [
      { label: '基础', expr: '2x + 3x', goal: '5x', q: '2x + 3x 是几？', opts: ['5x', '5x²', '6x'], ans: 0, hint: '放 2 条 x 长条，再放 3 条，数到一起。' },
      { label: '提高', expr: 'x² + 2x²', goal: '3x²', q: 'x² + 2x² 是几？', opts: ['3x²', '3x', '2x²'], ans: 0, hint: '放 1 块 x² 方块，再放 2 块，数到一起。' },
      { label: '挑战', expr: '3x² + 2x + x² + 4x', goal: '4x² + 6x', q: '3x² + 2x + x² + 4x 是几？', opts: ['4x² + 6x', '10x²', '7x² + 6x'], ans: 0, hint: '方块归方块、长条归长条：x² 有 4 块，x 有 6 条。' }
    ];
    var levelIdx = 0, c2 = 0, c1 = 0, c0 = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 7 年级 · 整式</p>' +
      '<h3>代数瓷砖法</h3>' +
      '<p>一块大方块 = x²，一条长条 = x，一个小方块 = 1。尺寸就是类型：只有同尺寸的砖能数到一起，x² 和 x 拼不成一块——先猜，再摆砖数一数。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 摆砖：</p>' +
      '<div class="btn-row">' +
      '<button class="btn small" id="' + K + '-add-x2" type="button">＋ x² 方块</button>' +
      '<button class="btn small" id="' + K + '-add-x" type="button">＋ x 长条</button>' +
      '<button class="btn small" id="' + K + '-add-1" type="button">＋ 1 小方块</button>' +
      '<button class="btn small ghost" id="' + K + '-clear" type="button">清空</button>' +
      '<button class="btn small primary" id="' + K + '-merge" type="button">数到一起</button></div>' +
      '<p>桌上：<b id="' + K + '-table"></b></p>' +
      '<p>算式：<b id="' + K + '-expr"></b>　提示：<span id="' + K + '-hint"></span></p>' +
      '<p>数到一起是：<b id="' + K + '-merged">？</b></p>' +
      '<p id="' + K + '-msg">先猜一猜，再摆砖。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 2x + 3x</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · x² + 2x²</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 3x² + 2x + x² + 4x</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都数对，并且能说出“只有同类项才能合并”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function term(n, s) {
      if (n === 0) return '';
      if (n === 1) return s;
      return n + s;
    }
    function mergedText() {
      var parts = [];
      if (c2) parts.push(term(c2, 'x²'));
      if (c1) parts.push(term(c1, 'x'));
      if (c0) parts.push(String(c0));
      return parts.length ? parts.join(' + ') : '0';
    }
    function renderTable() {
      gid(K + '-table').textContent = 'x² 方块 ' + c2 + ' 块，x 长条 ' + c1 + ' 条，1 小方块 ' + c0 + ' 个';
    }
    function setLevel(i) {
      levelIdx = i; var L = LEVELS[i];
      c2 = 0; c1 = 0; c0 = 0; guessed = -1;
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-expr').textContent = L.expr;
      gid(K + '-hint').textContent = L.hint;
      gid(K + '-merged').textContent = '？';
      renderTable();
      msg('先猜 ' + L.expr + ' 是几，再摆砖。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜：' + LEVELS[levelIdx].opts[g] + '。摆好砖，点“数到一起”验证。');
        });
      })(g);
    }
    gid(K + '-add-x2').addEventListener('click', function () { c2++; renderTable(); });
    gid(K + '-add-x').addEventListener('click', function () { c1++; renderTable(); });
    gid(K + '-add-1').addEventListener('click', function () { c0++; renderTable(); });
    gid(K + '-clear').addEventListener('click', function () { c2 = 0; c1 = 0; c0 = 0; renderTable(); gid(K + '-merged').textContent = '？'; });
    gid(K + '-merge').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜答案。'); return; }
      var L = LEVELS[levelIdx];
      var got = mergedText();
      gid(K + '-merged').textContent = got;
      if (got !== L.goal) {
        msg('桌上数到一起是 ' + got + '，还不是 ' + L.goal + '：' + L.hint);
        return;
      }
      var ok = guessed === L.ans;
      msg(L.expr + ' = ' + got + '：方块归方块、长条归长条，尺寸不一样的拼不到一起。' +
        (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再看一遍砖的尺寸。'));
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：2x + 3x = 5x', '提高：x² + 2x² = 3x²', '挑战：3x² + 2x + x² + 4x = 4x² + 6x'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm74-parts',
  title: '拆零件法',
  sub: '单项式拆成数字 × 字母 × 字母：每个字母头顶标指数，系数与次数分开读。自己调系数和指数，拆一拆就明白。',
  grade: 7,
  kind: '演示',
  points: ['7.4'],
  render: function (el) {
    var K = 'm74-parts';
    var LEVELS = [
      { label: '基础', expr: '3x²', coef: 3, letters: [{ l: 'x', e: 2 }], q: '3x² 的系数和次数是？', opts: ['系数 3，次数 2', '系数 2，次数 3', '系数 3，次数 3'], ans: 0 },
      { label: '提高', expr: '-2a²b', coef: -2, letters: [{ l: 'a', e: 2 }, { l: 'b', e: 1 }], q: '-2a²b 的系数和次数是？', opts: ['系数 -2，次数 3', '系数 2，次数 2', '系数 -2，次数 2'], ans: 0 },
      { label: '挑战', expr: '7xy³', coef: 7, letters: [{ l: 'x', e: 1 }, { l: 'y', e: 3 }], q: '7xy³ 的系数和次数是？', opts: ['系数 7，次数 4', '系数 3，次数 4', '系数 7，次数 3'], ans: 0 }
    ];
    var levelIdx = 0, guessed = -1, opened = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 7 年级 · 整式</p>' +
      '<h3>拆零件法</h3>' +
      '<p>一个单项式就是几个零件乘在一起：前面的数字是系数，字母头顶的指数加起来是次数。先猜，再点“拆开”看零件。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 拆开：<button class="btn small primary" id="' + K + '-open-btn" type="button">拆开看零件</button>　单项式：<b id="' + K + '-expr"></b></p>' +
      '<p>拆开是：<b id="' + K + '-parts">？</b></p>' +
      '<p>系数：<b id="' + K + '-coef">？</b>　次数：<b id="' + K + '-deg">？</b></p>' +
      '<p id="' + K + '-msg">先猜一猜，再拆开。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 3x²</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · -2a²b</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 7xy³</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都拆对，并且能说出“系数是前面的数，次数是指数之和”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function setLevel(i) {
      levelIdx = i; var L = LEVELS[i];
      guessed = -1; opened = false;
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-expr').textContent = L.expr;
      gid(K + '-parts').textContent = '？';
      gid(K + '-coef').textContent = '？';
      gid(K + '-deg').textContent = '？';
      msg('先猜 ' + L.expr + ' 的系数和次数，再拆开。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜：' + LEVELS[levelIdx].opts[g] + '。点“拆开看零件”验证。');
        });
      })(g);
    }
    gid(K + '-open-btn').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜，再拆开。'); return; }
      var L = LEVELS[levelIdx];
      var parts = [String(L.coef)];
      var deg = 0;
      for (var i = 0; i < L.letters.length; i++) {
        var lt = L.letters[i];
        for (var e = 0; e < lt.e; e++) parts.push(lt.l);
        deg += lt.e;
      }
      opened = true;
      gid(K + '-parts').textContent = parts.join(' × ');
      gid(K + '-coef').textContent = String(L.coef);
      gid(K + '-deg').textContent = String(deg);
      var ok = guessed === L.ans;
      msg(L.expr + ' = ' + parts.join(' × ') + '：系数是前面的数 ' + L.coef + '，次数是所有指数加起来，' +
        L.letters.map(function (lt) { return lt.e; }).join(' + ') + ' = ' + deg + '。' +
        (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再数一遍字母头顶的指数。'));
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：3x² 系数 3 次数 2', '提高：-2a²b 系数 -2 次数 3', '挑战：7xy³ 系数 7 次数 4'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm74-area',
  title: '面积模型法',
  sub: 'x² 是边长为 x 的正方形，2x 是两条 x 长条：次数就是维度。拖一拖 x，看 x² 和 2x 哪个长得快。',
  grade: 7,
  kind: '模拟',
  points: ['7.4'],
  render: function (el) {
    var K = 'm74-area';
    var LEVELS = [
      { label: '基础', x: 2, q: 'x = 2 时，x² 和 2x 谁大？', opts: ['一样大', 'x² 大', '2x 大'], ans: 0 },
      { label: '提高', x: 5, q: 'x = 5 时，x² 和 2x 谁大？', opts: ['x² 大', '2x 大', '一样大'], ans: 0 },
      { label: '挑战', x: 3, q: 'x = 3 时，x² 比 2x 大几？', opts: ['大 3', '大 9', '大 6'], ans: 0 }
    ];
    var levelIdx = 0, x = 2, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 7 年级 · 整式</p>' +
      '<h3>面积模型法</h3>' +
      '<p>正方形的边长是 x，面积就是 x²（一共 x×x 个小方格）；两条 x 长条拼起来是 2x。拖滑杆改 x，看两个图形谁长得快。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 拖一拖 x：<input type="range" id="' + K + '-slider" min="1" max="6" step="1" value="2" style="width:70%"> <b id="' + K + '-x">x = 2</b></p>' +
      '<p>x² 正方形（<span id="' + K + '-sq-n">2</span>×<span id="' + K + '-sq-n2">2</span> 个小方格）：</p>' +
      '<p id="' + K + '-sq"></p>' +
      '<p>2x 长条（2 行，每行 x 格）：</p>' +
      '<p id="' + K + '-bars"></p>' +
      '<p>x² = <b id="' + K + '-v2">4</b>　2x = <b id="' + K + '-v1">4</b></p>' +
      '<p id="' + K + '-msg">先猜一猜，再拖滑杆。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · x = 2</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · x = 5</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · x = 3</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都比对，并且能说出“x² 是面积，2x 是长度的两倍”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function render() {
      gid(K + '-x').textContent = 'x = ' + x;
      gid(K + '-sq-n').textContent = String(x);
      gid(K + '-sq-n2').textContent = String(x);
      var sq = '';
      for (var r = 0; r < x; r++) {
        for (var c = 0; c < x; c++) sq += '■';
        sq += ' ';
      }
      gid(K + '-sq').textContent = sq;
      var bars = '';
      for (var b = 0; b < 2; b++) {
        for (var i = 0; i < x; i++) bars += '▬';
        bars += ' ';
      }
      gid(K + '-bars').textContent = bars;
      gid(K + '-v2').textContent = String(x * x);
      gid(K + '-v1').textContent = String(2 * x);
      var L = LEVELS[levelIdx];
      if (x === L.x && guessed >= 0) {
        var ok = guessed === L.ans;
        var cmp = x * x > 2 * x ? 'x² 大' : (x * x < 2 * x ? '2x 大' : '一样大');
        msg('x = ' + x + ' 时，x² = ' + (x * x) + '，2x = ' + (2 * x) + '，' + cmp + '。' +
          (levelIdx === 2 ? '9 比 6 大 3。' : '') +
          (levelIdx === 0 ? 'x = 2 时正好相等：4 = 4。' : '') +
          (levelIdx === 1 ? 'x 变大以后，面积比长度长得快得多。' : '') +
          (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，数一数小方格。'));
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      levelIdx = i; x = LEVELS[i].x; guessed = -1;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-slider').value = String(x);
      render();
      msg('先猜，再把滑杆拖到 x = ' + L.x + '。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜：' + LEVELS[levelIdx].opts[g] + '。拖滑杆到 x = ' + LEVELS[levelIdx].x + ' 验证。');
        });
      })(g);
    }
    gid(K + '-slider').addEventListener('input', function (e) {
      x = parseInt(e.target.value, 10);
      if (guessed < 0) { msg('先猜一猜，再拖滑杆。'); return; }
      render();
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：x = 2 时 x² = 2x', '提高：x = 5 时 x² 大', '挑战：x = 3 时 x² 比 2x 大 3'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm75-merge',
  title: '同类瓷砖合并法',
  sub: '苹果归苹果筐、梨归梨筐：只有同尺寸的砖能数到一起，3a + 2b 拼不成 5ab——试试就知道了。',
  grade: 7,
  kind: '实验',
  points: ['7.5'],
  render: function (el) {
    var K = 'm75-merge';
    var LEVELS = [
      { label: '基础', expr: '3a + 2a', goal: '5a', q: '3a + 2a 是几？', opts: ['5a', '5a²', '6a'], ans: 0, hint: '放 3 块 a 砖，再放 2 块 a 砖，数到一起。' },
      { label: '提高', expr: '5b - 2b', goal: '3b', q: '5b - 2b 是几？', opts: ['3b', '7b', '3b²'], ans: 0, hint: '放 5 块 b 砖，拿走 2 块。' },
      { label: '挑战', expr: '3a + 2b + 4a - b', goal: '7a + b', q: '3a + 2b + 4a - b 是几？', opts: ['7a + b', '8ab', '7a + 2b'], ans: 0, hint: 'a 归 a、b 归 b：a 有 3 + 4 = 7 块，b 剩 2 - 1 = 1 块。' }
    ];
    var levelIdx = 0, ca = 0, cb = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 7 年级 · 整式的加减</p>' +
      '<h3>同类瓷砖合并法</h3>' +
      '<p>a 砖是绿长条，b 砖是蓝长条。同类才能合并：3a + 2b 不是 5ab——a 和 b 尺寸不一样，拼不到一起。先猜，再摆砖。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 摆砖：</p>' +
      '<div class="btn-row">' +
      '<button class="btn small" id="' + K + '-add-a" type="button">＋ a 砖</button>' +
      '<button class="btn small" id="' + K + '-add-b" type="button">＋ b 砖</button>' +
      '<button class="btn small" id="' + K + '-take-a" type="button">拿走 a 砖</button>' +
      '<button class="btn small" id="' + K + '-take-b" type="button">拿走 b 砖</button>' +
      '<button class="btn small ghost" id="' + K + '-clear" type="button">清空</button>' +
      '<button class="btn small primary" id="' + K + '-merge" type="button">合并同类</button></div>' +
      '<p>桌上：<b id="' + K + '-table"></b></p>' +
      '<p>算式：<b id="' + K + '-expr"></b>　提示：<span id="' + K + '-hint"></span></p>' +
      '<p>合并后是：<b id="' + K + '-merged">？</b></p>' +
      '<p id="' + K + '-msg">先猜一猜，再摆砖。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 3a + 2a</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 5b - 2b</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 3a + 2b + 4a - b</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都合并对，并且能说出“只有同类项才能合并，3a + 2b 不是 5ab”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function mergedText() {
      var parts = [];
      if (ca) parts.push(ca === 1 ? 'a' : ca + 'a');
      if (cb) parts.push(cb === 1 ? 'b' : cb + 'b');
      return parts.length ? parts.join(' + ') : '0';
    }
    function renderTable() {
      gid(K + '-table').textContent = 'a 砖 ' + ca + ' 块，b 砖 ' + cb + ' 块';
    }
    function setLevel(i) {
      levelIdx = i; var L = LEVELS[i];
      ca = 0; cb = 0; guessed = -1;
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-expr').textContent = L.expr;
      gid(K + '-hint').textContent = L.hint;
      gid(K + '-merged').textContent = '？';
      renderTable();
      msg('先猜 ' + L.expr + ' 是几，再摆砖。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜：' + LEVELS[levelIdx].opts[g] + '。摆好砖，点“合并同类”验证。');
        });
      })(g);
    }
    gid(K + '-add-a').addEventListener('click', function () { ca++; renderTable(); });
    gid(K + '-add-b').addEventListener('click', function () { cb++; renderTable(); });
    gid(K + '-take-a').addEventListener('click', function () { if (ca > 0) ca--; renderTable(); });
    gid(K + '-take-b').addEventListener('click', function () { if (cb > 0) cb--; renderTable(); });
    gid(K + '-clear').addEventListener('click', function () { ca = 0; cb = 0; renderTable(); gid(K + '-merged').textContent = '？'; });
    gid(K + '-merge').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜答案。'); return; }
      var L = LEVELS[levelIdx];
      var got = mergedText();
      gid(K + '-merged').textContent = got;
      if (got !== L.goal) {
        msg('桌上合并后是 ' + got + '，还不是 ' + L.goal + '：' + L.hint);
        return;
      }
      var ok = guessed === L.ans;
      msg(L.expr + ' = ' + got + '：a 归 a、b 归 b。' +
        (levelIdx === 2 ? '3a + 2b 永远拼不成 5ab——a 砖和 b 砖尺寸不一样。' : '同类项才能合并。') +
        (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再数一遍砖。'));
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：3a + 2a = 5a', '提高：5b - 2b = 3b', '挑战：3a + 2b + 4a - b = 7a + b'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm75-bracket',
  title: '去括号翻面法',
  sub: '括号前是减号，括号里每一项过减号这道门都要翻个面；括号前是加号，照抄。点“过门”，看砖一块一块翻面。',
  grade: 7,
  kind: '模拟',
  points: ['7.5'],
  render: function (el) {
    var K = 'm75-bracket';
    var LEVELS = [
      { label: '基础', sign: '+', terms: [{ t: '2x', s: 1 }, { t: '3', s: -1 }], q: '+(2x - 3) 去括号是？', opts: ['2x - 3', '-2x + 3', '2x + 3'], ans: 0 },
      { label: '提高', sign: '-', terms: [{ t: '2x', s: 1 }, { t: '3', s: -1 }], q: '-(2x - 3) 去括号是？', opts: ['-2x + 3', '2x - 3', '-2x - 3'], ans: 0 },
      { label: '挑战', sign: '-', terms: [{ t: '3a', s: 1 }, { t: '2b', s: -1 }, { t: '1', s: 1 }], q: '-(3a - 2b + 1) 去括号是？', opts: ['-3a + 2b - 1', '3a - 2b + 1', '-3a - 2b - 1'], ans: 0 }
    ];
    var levelIdx = 0, guessed = -1, passed = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 7 年级 · 整式的加减</p>' +
      '<h3>去括号翻面法</h3>' +
      '<p>括号是一道门：门前是加号，砖照原样走过去；门前是减号，每块砖过门都要翻个面（正变负、负变正）。先猜，再点“过门”。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 过门：<button class="btn small primary" id="' + K + '-pass-btn" type="button">过门（去括号）</button>　<button class="btn small ghost" id="' + K + '-back-btn" type="button">回到门前</button></p>' +
      '<p>门前：<b id="' + K + '-before"></b></p>' +
      '<p>过门后：<b id="' + K + '-after">？</b></p>' +
      '<p id="' + K + '-msg">先猜一猜，再过门。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · +(2x - 3)</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · -(2x - 3)</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · -(3a - 2b + 1)</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都过对门，并且能说出“减号门后每一项都要变号”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function beforeText(L) {
      var s = L.sign + '(';
      for (var i = 0; i < L.terms.length; i++) {
        var tm = L.terms[i];
        if (i > 0) s += tm.s > 0 ? ' + ' : ' - ';
        else if (tm.s < 0) s += '-';
        s += tm.t;
      }
      return s + ')';
    }
    function afterText(L) {
      var flip = L.sign === '-';
      var out = '';
      for (var i = 0; i < L.terms.length; i++) {
        var tm = L.terms[i];
        var s = flip ? -tm.s : tm.s;
        if (i === 0) out += (s < 0 ? '-' : '') + tm.t;
        else out += (s > 0 ? ' + ' : ' - ') + tm.t;
      }
      return out;
    }
    function setLevel(i) {
      levelIdx = i; var L = LEVELS[i];
      guessed = -1; passed = false;
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-before').textContent = beforeText(L);
      gid(K + '-after').textContent = '？';
      msg('先猜去括号的结果，再点“过门”。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜：' + LEVELS[levelIdx].opts[g] + '。点“过门”验证。');
        });
      })(g);
    }
    gid(K + '-pass-btn').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜，再过门。'); return; }
      var L = LEVELS[levelIdx];
      passed = true;
      var after = afterText(L);
      gid(K + '-after').textContent = after;
      var ok = guessed === L.ans;
      msg(beforeText(L) + ' → ' + after + '：' +
        (L.sign === '-' ? '减号门：括号里每一项都翻面，+ 变 -、- 变 +。' : '加号门：照抄，一个都不用翻。') +
        (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，注意门前是' + (L.sign === '-' ? '减号' : '加号') + '。'));
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    });
    gid(K + '-back-btn').addEventListener('click', function () {
      passed = false;
      gid(K + '-after').textContent = '？';
      msg('回到门前了。再猜一次，重新过门。');
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：+(2x - 3) = 2x - 3', '提高：-(2x - 3) = -2x + 3', '挑战：-(3a - 2b + 1) = -3a + 2b - 1'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm75-distrib',
  title: '分配律面积法',
  sub: '2(3x - 1) 是 2 行 3x - 1 的矩形：去括号就是把矩形拆成 6x - 2 两块砖。拖一拖行数，拆一拆就明白。',
  grade: 7,
  kind: '模拟',
  points: ['7.5'],
  render: function (el) {
    var K = 'm75-distrib';
    var LEVELS = [
      { label: '基础', k: 2, a: 3, b: -1, q: '2(3x - 1) 拆开是？', opts: ['6x - 2', '6x + 2', '5x - 1'], ans: 0 },
      { label: '提高', k: 3, a: 2, b: 4, q: '3(2x + 4) 拆开是？', opts: ['6x + 12', '6x + 4', '5x + 12'], ans: 0 },
      { label: '挑战', k: -2, a: 1, b: -3, q: '-2(x - 3) 拆开是？', opts: ['-2x + 6', '-2x - 6', '2x + 6'], ans: 0 }
    ];
    var levelIdx = 0, guessed = -1, split = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 7 年级 · 整式的加减</p>' +
      '<h3>分配律面积法</h3>' +
      '<p>k(ax + b) 是一块 k 行、每行 ax + b 的矩形：拆开就是 k 乘进括号，每一项都乘一遍。先猜，再点“拆开”。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 拆开：<button class="btn small primary" id="' + K + '-split-btn" type="button">拆开矩形</button>　<button class="btn small ghost" id="' + K + '-back-btn" type="button">拼回去</button></p>' +
      '<p>矩形：<b id="' + K + '-rect"></b></p>' +
      '<p id="' + K + '-rows"></p>' +
      '<p>拆开是：<b id="' + K + '-after">？</b></p>' +
      '<p id="' + K + '-msg">先猜一猜，再拆开。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 2(3x - 1)</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 3(2x + 4)</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · -2(x - 3)</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都拆对，并且能说出“括号外的数要乘进括号的每一项”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function fmtTerm(n, v) {
      if (n === 0) return '0';
      var s = (n === 1 ? '' : (n === -1 ? '-' : String(n))) + v;
      return s;
    }
    function exprText(L) {
      var inner = fmtTerm(L.a, 'x') + (L.b >= 0 ? ' + ' + L.b : ' - ' + (-L.b));
      return (L.k < 0 ? '(' + L.k + ')' : String(L.k)) + '(' + inner + ')';
    }
    function afterText(L) {
      var p1 = L.k * L.a, p2 = L.k * L.b;
      var s1 = fmtTerm(p1, 'x');
      var s2 = (p2 >= 0 ? ' + ' + p2 : ' - ' + (-p2));
      return s1 + s2;
    }
    function setLevel(i) {
      levelIdx = i; var L = LEVELS[i];
      guessed = -1; split = false;
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-rect').textContent = exprText(L) + '：' + Math.abs(L.k) + ' 行，每行 ' + fmtTerm(L.a, 'x') + (L.b >= 0 ? ' + ' + L.b : ' - ' + (-L.b));
      var rows = '';
      for (var r = 0; r < Math.abs(L.k); r++) {
        rows += '第 ' + (r + 1) + ' 行：' + fmtTerm(L.a, 'x') + (L.b >= 0 ? ' + ' + L.b : ' - ' + (-L.b)) + '　';
      }
      gid(K + '-rows').textContent = rows;
      gid(K + '-after').textContent = '？';
      msg('先猜拆开的结果，再点“拆开矩形”。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜：' + LEVELS[levelIdx].opts[g] + '。点“拆开矩形”验证。');
        });
      })(g);
    }
    gid(K + '-split-btn').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜，再拆开。'); return; }
      var L = LEVELS[levelIdx];
      split = true;
      var after = afterText(L);
      gid(K + '-after').textContent = after;
      var ok = guessed === L.ans;
      msg(exprText(L) + ' = ' + after + '：' + Math.abs(L.k) + ' 行，每行都乘 ' + L.k + '——' +
        L.k + '×' + L.a + 'x = ' + (L.k * L.a) + 'x，' + L.k + '×(' + L.b + ') = ' + (L.k * L.b) + '。' +
        (L.k < 0 ? '负数乘进来，每一项都翻面。' : '') +
        (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，记住每一项都要乘。'));
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    });
    gid(K + '-back-btn').addEventListener('click', function () {
      split = false;
      gid(K + '-after').textContent = '？';
      msg('拼回去了。再猜一次，重新拆。');
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：2(3x - 1) = 6x - 2', '提高：3(2x + 4) = 6x + 12', '挑战：-2(x - 3) = -2x + 6'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm76-balance',
  title: '天平平衡法',
  sub: '方程就是天平：两边同时加减乘除，天平还平着；想只动一边，天平立刻倾斜、操作被拦下。自己动手解方程。',
  grade: 7,
  kind: '实验',
  points: ['7.6'],
  render: function (el) {
    var K = 'm76-balance';
    var LEVELS = [
      { label: '基础', a: 1, b: 5, c: 12, q: 'x + 5 = 12，x 是几？先猜。', opts: ['7', '17', '5'], ans: 0 },
      { label: '提高', a: 2, b: 3, c: 11, q: '2x + 3 = 11，x 是几？先猜。', opts: ['4', '7', '5'], ans: 0 },
      { label: '挑战', a: 3, b: -4, c: 11, q: '3x - 4 = 11，x 是几？先猜。', opts: ['5', '3', '7'], ans: 0 }
    ];
    var levelIdx = 0, a = 1, b = 5, c = 12, guessed = -1, tiers = null, tilt = 0;
    el.innerHTML =
      '<p class="demo-tag">实验 · 7 年级 · 解一元一次方程</p>' +
      '<h3>天平平衡法</h3>' +
      '<p>等号就是天平：左盘是方程左边，右盘是右边。只有两边做同样的事，天平才保持平衡。想只动一边？天平会倾斜，操作不算数。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 两边同做：</p>' +
      '<div class="btn-row">' +
      '<button class="btn small" id="' + K + '-op-sub" type="button">两边同减</button>' +
      '<button class="btn small" id="' + K + '-op-add" type="button">两边同加</button>' +
      '<button class="btn small" id="' + K + '-op-div" type="button">两边同除</button>' +
      '<button class="btn small" id="' + K + '-op-one" type="button">只动左边（试试）</button>' +
      '<button class="btn small ghost" id="' + K + '-reset" type="button">重来</button></div>' +
      '<p>天平：<b id="' + K + '-beam">平衡</b></p>' +
      '<p>左盘：<b id="' + K + '-left"></b>　右盘：<b id="' + K + '-right"></b></p>' +
      '<p>现在方程是：<b id="' + K + '-eq"></b></p>' +
      '<p id="' + K + '-msg">先猜 x 是几，再两边同做、一步步解。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · x + 5 = 12</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 2x + 3 = 11</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 3x - 4 = 11</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都解出 x，并且能说出“等式两边要做同样的事”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function fmtCoef(n, v) {
      if (n === 0) return '';
      if (n === 1) return v;
      if (n === -1) return '-' + v;
      return n + v;
    }
    function leftText() {
      var s = fmtCoef(a, 'x');
      if (b > 0) s += ' + ' + b;
      if (b < 0) s += ' - ' + (-b);
      return s || '0';
    }
    function render() {
      gid(K + '-beam').textContent = tilt === 0 ? '平衡' : (tilt > 0 ? '向左倾斜了！' : '向右倾斜了！');
      gid(K + '-left').textContent = leftText();
      gid(K + '-right').textContent = String(c);
      gid(K + '-eq').textContent = leftText() + ' = ' + c;
      if (a === 1 && b === 0 && guessed >= 0) {
        var L = LEVELS[levelIdx];
        var ok = guessed === L.ans;
        msg('解出来了：x = ' + c + '。代回去验算：' +
          (L.a === 1 ? '' : L.a + '×' + c) +
          (L.b > 0 ? (L.a === 1 ? c + ' + ' + L.b : ' + ' + L.b) : (L.a === 1 ? c + ' - ' + (-L.b) : ' - ' + (-L.b))) +
          ' = ' + L.c + '，等式成立。' + (ok ? '你猜对了！' : '你刚才猜 x 是 ' + L.opts[guessed] + '，再走一遍天平。'));
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      levelIdx = i; var L = LEVELS[i];
      a = L.a; b = L.b; c = L.c; guessed = -1; tilt = 0;
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var bj = gid(K + '-level-' + j);
        if (bj) bj.setAttribute('aria-pressed', String(j === i));
      }
      render();
      msg('先猜 x 是几，再用“两边同做”解方程。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜 x = ' + LEVELS[levelIdx].opts[g] + '。动手解方程验证。');
        });
      })(g);
    }
    function needGuess() {
      if (guessed < 0) { msg('先猜一猜 x 是几。'); return true; }
      return false;
    }
    gid(K + '-op-sub').addEventListener('click', function () {
      if (needGuess()) return;
      if (b === 0) { msg('常数项已经是 0 了，不用再减——下一步该除以系数。'); return; }
      c -= b; b = 0; tilt = 0;
      msg('两边同时减 ' + (LEVELS[levelIdx].b > 0 ? LEVELS[levelIdx].b : -LEVELS[levelIdx].b) + '：天平还平着，方程变成 ' + leftText() + ' = ' + c + '。');
      render();
    });
    gid(K + '-op-add').addEventListener('click', function () {
      if (needGuess()) return;
      if (b === 0) { msg('常数项已经是 0 了，不用再加——下一步该除以系数。'); return; }
      c += -b; b = 0; tilt = 0;
      var d = -LEVELS[levelIdx].b;
      msg('两边同时' + (d >= 0 ? '加 ' + d : '减 ' + (-d)) + '：天平还平着，方程变成 ' + leftText() + ' = ' + c + '。');
      render();
    });
    gid(K + '-op-div').addEventListener('click', function () {
      if (needGuess()) return;
      if (b !== 0) { msg('先把常数项消掉（两边同加 / 同减），再除以系数。'); return; }
      if (a === 1) { msg('x 的系数已经是 1，解出来了。'); return; }
      if (c % a !== 0) { msg('c 除以 a 不是整数——先检查前面的步骤。'); return; }
      c = c / a; a = 1; tilt = 0;
      msg('两边同时除以 ' + LEVELS[levelIdx].a + '：天平还平着，x = ' + c + '。');
      render();
    });
    gid(K + '-op-one').addEventListener('click', function () {
      if (needGuess()) return;
      tilt = 1;
      gid(K + '-beam').textContent = '向左倾斜了！';
      msg('只动一边？天平倾斜了，等式不再成立——这一步不算数。方程只能两边同做。');
    });
    gid(K + '-reset').addEventListener('click', function () { setLevel(levelIdx); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：x + 5 = 12 → x = 7', '提高：2x + 3 = 11 → x = 4', '挑战：3x - 4 = 11 → x = 5'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm76-inverse',
  title: '逆运算倒推法',
  sub: '把 x 一层层剥出来：每一步都是逆运算——加的减回去，乘的除回去。剥一层，方程就简单一层。',
  grade: 7,
  kind: '演示',
  points: ['7.6'],
  render: function (el) {
    var K = 'm76-inverse';
    var LEVELS = [
      { label: '基础', steps: ['3x = 15', 'x = 5'], ops: ['两边同除以 3'], q: '3x = 15，x 是几？', opts: ['5', '45', '12'], ans: 0 },
      { label: '提高', steps: ['x ÷ 2 + 1 = 5', 'x ÷ 2 = 4', 'x = 8'], ops: ['两边同减 1', '两边同乘 2'], q: 'x ÷ 2 + 1 = 5，x 是几？', opts: ['8', '4', '10'], ans: 0 },
      { label: '挑战', steps: ['2(x - 3) = 10', 'x - 3 = 5', 'x = 8'], ops: ['两边同除以 2', '两边同加 3'], q: '2(x - 3) = 10，x 是几？', opts: ['8', '5', '2'], ans: 0 }
    ];
    var levelIdx = 0, stepIdx = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 7 年级 · 解一元一次方程</p>' +
      '<h3>逆运算倒推法</h3>' +
      '<p>方程是给 x 穿上的衣服：一层一层剥，每一步用逆运算——加 1 就减 1，乘 2 就除 2。剥到只剩 x，就解出来了。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 剥一层：<button class="btn small primary" id="' + K + '-peel-btn" type="button">剥一层</button>　<button class="btn small ghost" id="' + K + '-back-btn" type="button">穿回去</button></p>' +
      '<p>现在：<b id="' + K + '-now"></b></p>' +
      '<p>剥过的层：<b id="' + K + '-done">（还没剥）</b></p>' +
      '<p id="' + K + '-msg">先猜 x 是几，再一层一层剥。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 3x = 15</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · x ÷ 2 + 1 = 5</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 2(x - 3) = 10</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都剥到 x，并且能说出“每一步都是逆运算”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function setLevel(i) {
      levelIdx = i; stepIdx = 0; guessed = -1;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-now').textContent = L.steps[0];
      gid(K + '-done').textContent = '（还没剥）';
      msg('先猜 x 是几，再点“剥一层”。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜 x = ' + LEVELS[levelIdx].opts[g] + '。剥一层验证。');
        });
      })(g);
    }
    gid(K + '-peel-btn').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜 x 是几。'); return; }
      var L = LEVELS[levelIdx];
      if (stepIdx >= L.ops.length) { msg('已经剥到只剩 x 了。'); return; }
      var op = L.ops[stepIdx];
      stepIdx++;
      gid(K + '-now').textContent = L.steps[stepIdx];
      var doneList = [];
      for (var i = 0; i < stepIdx; i++) doneList.push(L.ops[i]);
      gid(K + '-done').textContent = doneList.join(' → ');
      if (stepIdx >= L.ops.length) {
        var ok = guessed === L.ans;
        msg('剥完了：' + L.steps[stepIdx] + '。把 x 代回去验算，等式成立。' +
          (ok ? '你猜对了！' : '你刚才猜 x 是 ' + L.opts[guessed] + '，再剥一遍看看。'));
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('剥了一层（' + op + '）：现在是 ' + L.steps[stepIdx] + '，继续剥。');
      }
    });
    gid(K + '-back-btn').addEventListener('click', function () { setLevel(levelIdx); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：3x = 15 → x = 5', '提高：x ÷ 2 + 1 = 5 → x = 8', '挑战：2(x - 3) = 10 → x = 8'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm76-boxes',
  title: '方块消元法',
  sub: '用 X 盒与单位块摆出方程：两边同时拿掉同样的块，直到只剩一个 X——X 盒旁边剩几个单位块，x 就是几。',
  grade: 7,
  kind: '模拟',
  points: ['7.6'],
  render: function (el) {
    var K = 'm76-boxes';
    var LEVELS = [
      { label: '基础', Lx: 1, Lu: 2, Rx: 0, Ru: 5, q: 'x + 2 = 5，x 是几？', opts: ['3', '7', '2'], ans: 0, hint: '两边各拿掉 2 个单位块。' },
      { label: '提高', Lx: 2, Lu: 1, Rx: 0, Ru: 7, q: '2x + 1 = 7，x 是几？', opts: ['3', '6', '4'], ans: 0, hint: '先两边各拿掉 1 个单位块，再把 X 盒和单位块对半分。' },
      { label: '挑战', Lx: 3, Lu: 2, Rx: 2, Ru: 6, q: '3x + 2 = 2x + 6，x 是几？', opts: ['4', '2', '8'], ans: 0, hint: '先两边各拿掉 2 个 X 盒，再两边各拿掉 2 个单位块。' }
    ];
    var levelIdx = 0, Lx = 1, Lu = 2, Rx = 0, Ru = 5, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 7 年级 · 解一元一次方程</p>' +
      '<h3>方块消元法</h3>' +
      '<p>一个 X 盒 = x，一个小方块 = 1。方程就是左右两堆东西一样重：两边同时拿掉同样的块，等式还成立；拿到只剩一个 X 盒，x 就出来了。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 拿块：</p>' +
      '<div class="btn-row">' +
      '<button class="btn small" id="' + K + '-take-unit" type="button">两边各拿掉 1 个单位块</button>' +
      '<button class="btn small" id="' + K + '-take-x" type="button">两边各拿掉 1 个 X 盒</button>' +
      '<button class="btn small" id="' + K + '-halve" type="button">两边对半分</button>' +
      '<button class="btn small ghost" id="' + K + '-reset" type="button">重摆</button></div>' +
      '<p>左边：<b id="' + K + '-left"></b></p>' +
      '<p>右边：<b id="' + K + '-right"></b></p>' +
      '<p>提示：<span id="' + K + '-hint"></span></p>' +
      '<p id="' + K + '-msg">先猜 x 是几，再拿块。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · x + 2 = 5</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 2x + 1 = 7</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 3x + 2 = 2x + 6</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都拿到只剩一个 X 盒，并且能说出“两边同时拿掉同样的块”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function sideText(nx, nu) {
      var parts = [];
      if (nx) parts.push(nx + ' 个 X 盒');
      if (nu) parts.push(nu + ' 个单位块');
      return parts.length ? parts.join(' + ') : '空';
    }
    function render() {
      gid(K + '-left').textContent = sideText(Lx, Lu);
      gid(K + '-right').textContent = sideText(Rx, Ru);
      if (Lx === 1 && Lu === 0 && Rx === 0 && guessed >= 0) {
        var L = LEVELS[levelIdx];
        var ok = guessed === L.ans;
        msg('只剩一个 X 盒，右边是 ' + Ru + ' 个单位块：x = ' + Ru + '。' +
          (ok ? '你猜对了！' : '你刚才猜 x 是 ' + L.opts[guessed] + '，再摆一遍看看。'));
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      levelIdx = i; var L = LEVELS[i];
      Lx = L.Lx; Lu = L.Lu; Rx = L.Rx; Ru = L.Ru; guessed = -1;
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-hint').textContent = L.hint;
      render();
      msg('先猜 x 是几，再拿块。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜 x = ' + LEVELS[levelIdx].opts[g] + '。拿块验证。');
        });
      })(g);
    }
    function needGuess() {
      if (guessed < 0) { msg('先猜一猜 x 是几。'); return true; }
      return false;
    }
    gid(K + '-take-unit').addEventListener('click', function () {
      if (needGuess()) return;
      if (Lu <= 0 || Ru <= 0) { msg('有一边没有单位块可拿了。'); return; }
      Lu--; Ru--;
      msg('两边各拿掉 1 个单位块。');
      render();
    });
    gid(K + '-take-x').addEventListener('click', function () {
      if (needGuess()) return;
      if (Lx <= 0 || Rx <= 0) { msg('有一边没有 X 盒可拿了。'); return; }
      Lx--; Rx--;
      msg('两边各拿掉 1 个 X 盒。');
      render();
    });
    gid(K + '-halve').addEventListener('click', function () {
      if (needGuess()) return;
      if (Lx !== 2 || Lu !== 0 || Rx !== 0) { msg('现在不能对半分：要等到左边只剩 2 个 X 盒、右边是偶数个单位块。'); return; }
      if (Ru % 2 !== 0) { msg('右边的单位块是奇数个，对半分不开。'); return; }
      Lx = 1; Ru = Ru / 2;
      msg('两边对半分：2 个 X 盒变 1 个，' + (Ru * 2) + ' 个单位块变 ' + Ru + ' 个。');
      render();
    });
    gid(K + '-reset').addEventListener('click', function () { setLevel(levelIdx); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：x + 2 = 5 → x = 3', '提高：2x + 1 = 7 → x = 3', '挑战：3x + 2 = 2x + 6 → x = 4'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm77-puzzle',
  title: '等量关系拼图/线段图法',
  sub: '把题目里的数量一块块拼成等式：行程问题画线段图，两人走的路程加起来就是全程。拼不对，等式就不成立。',
  grade: 7,
  kind: '实验',
  points: ['7.7'],
  render: function (el) {
    var K = 'm77-puzzle';
    var LEVELS = [
      { label: '基础', story: '3 支同样的笔一共 12 元，1 支笔几元？', cards: ['3 支笔的钱', '12 元'], slots: ['3x', '12'], eq: '3x = 12', x: 4, q: '1 支笔几元？先猜。', opts: ['4 元', '9 元', '36 元'], ans: 0, hint: '把“3 支笔的钱”拼到等号左边，“12 元”拼到右边。' },
      { label: '提高', story: '甲、乙两人从相距 300 千米的两地相向而行，甲每小时 60 千米，乙每小时 40 千米，几小时相遇？', cards: ['甲走的路程', '乙走的路程', '全程 300 千米'], slots: ['60t', '40t', '300'], eq: '60t + 40t = 300', x: 3, q: '几小时相遇？先猜。', opts: ['3 小时', '5 小时', '7 小时'], ans: 0, hint: '甲走的 + 乙走的 = 全程：60t + 40t = 300。' },
      { label: '挑战', story: '一件衣服打 8 折卖 160 元，原价几元？', cards: ['原价的 8 折', '160 元'], slots: ['0.8x', '160'], eq: '0.8x = 160', x: 200, q: '原价几元？先猜。', opts: ['200 元', '128 元', '180 元'], ans: 0, hint: '打 8 折就是原价的 0.8：0.8x = 160。' }
    ];
    var levelIdx = 0, filled = [], guessed = -1, t = 0, tiers = null, solved = false;
    el.innerHTML =
      '<p class="demo-tag">实验 · 7 年级 · 实际问题与一元一次方程</p>' +
      '<h3>等量关系拼图/线段图法</h3>' +
      '<p>应用题先别急着算：把题目里的数量卡片拼成等式，拼对了再解。点一张卡片，它就落进下一个空位；拼错了，等式不成立。</p>' +
      '<p>题目：<b id="' + K + '-story"></b></p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 拼等式：点卡片，拼进空位。</p>' +
      '<div class="btn-row" id="' + K + '-cards"></div>' +
      '<p>拼出来的等式：<b id="' + K + '-eq">（空）</b>　<button class="btn small ghost" id="' + K + '-clear" type="button">重新拼</button></p>' +
      '<p>第 3 步 · 解一解：<button class="btn small" id="' + K + '-minus" type="button">−</button> <b id="' + K + '-t">0</b> <button class="btn small" id="' + K + '-plus" type="button">＋</button> <button class="btn small primary" id="' + K + '-solve" type="button">代进去验算</button></p>' +
      '<p>提示：<span id="' + K + '-hint"></span></p>' +
      '<p id="' + K + '-msg">先猜一猜，再拼等式。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 买笔</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 相向而行</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 打折</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都拼对等式、解出答案，并且能说出“先找等量关系，再列方程”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function buildCards() {
      var box = gid(K + '-cards');
      while (box.firstChild) box.removeChild(box.firstChild);
      var L = LEVELS[levelIdx];
      for (var i = 0; i < L.cards.length; i++) {
        (function (i) {
          var b = document.createElement('button');
          b.type = 'button'; b.className = 'btn small'; b.textContent = L.cards[i];
          b.addEventListener('click', function () { onCard(i); });
          box.appendChild(b);
        })(i);
      }
    }
    function eqText() {
      var L = LEVELS[levelIdx];
      if (filled.length === 0) return '（空）';
      if (filled.length === 2) return filled[0] + ' = ' + filled[1];
      if (filled.length === 3) return filled[0] + ' + ' + filled[1] + ' = ' + filled[2];
      return filled.join(' + ');
    }
    function onCard(i) {
      var L = LEVELS[levelIdx];
      if (filled.length >= L.slots.length) { msg('空位拼满了：点“代进去验算”解方程，或点“重新拼”。'); return; }
      filled.push(L.slots[i]);
      gid(K + '-eq').textContent = eqText();
      if (filled.length === L.slots.length) {
        var good = true;
        for (var j = 0; j < L.slots.length; j++) {
          if (filled[j] !== L.slots[j]) good = false;
        }
        if (good) msg('拼对了：' + L.eq + '。调一调下面的数，代进去验算。');
        else msg('拼出来的等式是 ' + eqText() + '，不对：' + L.hint + '点“重新拼”再试。');
      } else {
        msg('拼上了“' + L.cards[i] + '”，继续拼下一块。');
      }
    }
    function setLevel(i) {
      levelIdx = i; var L = LEVELS[i];
      filled = []; guessed = -1; t = 0; solved = false;
      gid(K + '-story').textContent = L.story;
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-eq').textContent = '（空）';
      gid(K + '-t').textContent = '0';
      gid(K + '-hint').textContent = L.hint;
      buildCards();
      msg('先猜答案，再点卡片拼等式。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜：' + LEVELS[levelIdx].opts[g] + '。拼好等式，代进去验算。');
        });
      })(g);
    }
    gid(K + '-clear').addEventListener('click', function () {
      filled = [];
      gid(K + '-eq').textContent = '（空）';
      msg('重新拼：' + LEVELS[levelIdx].hint);
    });
    gid(K + '-minus').addEventListener('click', function () {
      var step = levelIdx === 2 ? 10 : 1;
      t -= step;
      if (t < 0) t = 0;
      gid(K + '-t').textContent = String(t);
    });
    gid(K + '-plus').addEventListener('click', function () {
      var step = levelIdx === 2 ? 10 : 1;
      t += step;
      if (t > 500) t = 500;
      gid(K + '-t').textContent = String(t);
    });
    gid(K + '-solve').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜答案。'); return; }
      var L = LEVELS[levelIdx];
      var good = filled.length === L.slots.length;
      if (good) {
        for (var j = 0; j < L.slots.length; j++) {
          if (filled[j] !== L.slots[j]) good = false;
        }
      }
      if (!good) { msg('等式还没拼对：' + L.hint); return; }
      var left = levelIdx === 0 ? 3 * t : (levelIdx === 1 ? 60 * t + 40 * t : 0.8 * t);
      var right = levelIdx === 0 ? 12 : (levelIdx === 1 ? 300 : 160);
      if (Math.abs(left - right) > 0.001) {
        msg('代进去：左边是 ' + left + '，右边是 ' + right + '，两边不相等——再调一调。');
        return;
      }
      solved = true;
      var ok = guessed === L.ans;
      var unit = levelIdx === 1 ? ' 小时' : ' 元';
      msg('对了：' + L.eq + '，解得 ' + (levelIdx === 1 ? 't' : 'x') + ' = ' + L.x + unit + '。' +
        (levelIdx === 1 ? '甲走了 180 千米，乙走了 120 千米，加起来正好 300 千米。' : '') +
        (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，等式拼对了，答案就在里面。'));
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：3x = 12 → x = 4', '提高：60t + 40t = 300 → t = 3', '挑战：0.8x = 160 → x = 200'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm77-table',
  title: '表格建模法',
  sub: '球赛积分表、打折销售先填表再找等量关系：表就是方程的草稿。填一填表，方程自己就出来了。',
  grade: 7,
  kind: '模拟',
  points: ['7.7'],
  render: function (el) {
    var K = 'm77-table';
    var LEVELS = [
      { label: '基础', title: '球赛积分表', rows: ['胜 1 场得', '胜 2 场得', '胜 3 场得'], unit: '分', per: 3, target: 9, q: '胜 3 场得几分？先猜。', opts: ['9 分', '6 分', '12 分'], ans: 0, hint: '胜 1 场 3 分，胜几场就是 3 乘几。' },
      { label: '提高', title: '打折销售表', rows: ['原价 100 元，8 折卖', '原价 150 元，8 折卖', '原价 x 元，8 折卖 160 元'], unit: '元', per: 0.8, target: 160, q: '打 8 折卖 160 元，原价是几元？先猜。', opts: ['200 元', '128 元', '180 元'], ans: 0, hint: '售价 = 原价 × 0.8：先算前两行找规律，再倒推原价。' },
      { label: '挑战', title: '两件衣服盈亏表', rows: ['第一件：进价 120 元，售价 150 元', '第二件：进价 200 元，售价 150 元', '两件一共'], unit: '元', per: 0, target: -10, q: '两件衣服一共赚了还是亏了？先猜。', opts: ['亏 10 元', '赚 10 元', '不赚不亏'], ans: 0, hint: '第一件赚 30 元，第二件亏 50 元，合起来呢？' }
    ];
    var levelIdx = 0, guessed = -1, filled = [false, false, false], x = 0, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 7 年级 · 实际问题与一元一次方程</p>' +
      '<h3>表格建模法</h3>' +
      '<p>先填表，再列方程：表里的每一行都是一个等量关系。点“填这一行”，看规律怎么从表里长出来。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 填表：<b id="' + K + '-title"></b></p>' +
      '<p><button class="btn small" id="' + K + '-fill-0" type="button">填第 1 行</button> <span id="' + K + '-row-0">？</span></p>' +
      '<p><button class="btn small" id="' + K + '-fill-1" type="button">填第 2 行</button> <span id="' + K + '-row-1">？</span></p>' +
      '<p><button class="btn small" id="' + K + '-fill-2" type="button">填第 3 行</button> <span id="' + K + '-row-2">？</span></p>' +
      '<p id="' + K + '-solve-row">原价 x：<button class="btn small" id="' + K + '-minus" type="button">−</button> <b id="' + K + '-x">0</b> <button class="btn small" id="' + K + '-plus" type="button">＋</button> <button class="btn small primary" id="' + K + '-solve" type="button">验算</button></p>' +
      '<p>提示：<span id="' + K + '-hint"></span></p>' +
      '<p id="' + K + '-msg">先猜一猜，再填表。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 球赛积分</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 打折销售</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 两件衣服</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档的表都填对，并且能说出“表就是方程的草稿”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function rowValue(i) {
      var L = LEVELS[levelIdx];
      if (levelIdx === 0) return (i + 1) * 3 + ' 分';
      if (levelIdx === 1) {
        if (i === 0) return '80 元';
        if (i === 1) return '120 元';
        return '0.8x = 160，x = 200 元';
      }
      if (i === 0) return '赚 30 元';
      if (i === 1) return '亏 50 元';
      return '30 - 50 = -10：亏 10 元';
    }
    function setLevel(i) {
      levelIdx = i; var L = LEVELS[i];
      guessed = -1; filled = [false, false, false]; x = 0;
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-title').textContent = L.title;
      for (var r = 0; r < 3; r++) gid(K + '-row-' + r).textContent = L.rows[r] + '：？';
      gid(K + '-x').textContent = '0';
      gid(K + '-hint').textContent = L.hint;
      gid(K + '-solve-row').style.display = levelIdx === 1 ? '' : 'none';
      msg('先猜，再一行一行填表。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜：' + LEVELS[levelIdx].opts[g] + '。填表验证。');
        });
      })(g);
    }
    for (var f = 0; f < 3; f++) {
      (function (f) {
        gid(K + '-fill-' + f).addEventListener('click', function () {
          if (guessed < 0) { msg('先猜一猜，再填表。'); return; }
          var L = LEVELS[levelIdx];
          filled[f] = true;
          gid(K + '-row-' + f).textContent = L.rows[f] + '：' + rowValue(f);
          if (filled[0] && filled[1] && filled[2]) {
            var ok = guessed === L.ans;
            var tail = levelIdx === 0 ? '胜 1 场 3 分，胜 n 场就是 3n 分——表里每行都是 3 的倍数。' :
              levelIdx === 1 ? '售价 = 原价 × 0.8：0.8x = 160，x = 200。' :
              '一件赚 30，一件亏 50，合起来亏 10 元——不能只看一件。';
            msg('表填完了。' + tail + (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再看一遍表。'));
            if (tiers) tiers.done(levelIdx);
            if (typeof markTried === 'function') markTried(K);
          } else {
            msg('填好第 ' + (f + 1) + ' 行，继续填下一行。');
          }
        });
      })(f);
    }
    gid(K + '-minus').addEventListener('click', function () {
      if (x > 0) x -= 10;
      gid(K + '-x').textContent = String(x);
    });
    gid(K + '-plus').addEventListener('click', function () {
      x += 10;
      if (x > 500) x = 500;
      gid(K + '-x').textContent = String(x);
    });
    gid(K + '-solve').addEventListener('click', function () {
      if (0.8 * x === 160) msg('验算：0.8 × 200 = 160，对了！原价 200 元。');
      else msg('0.8 × ' + x + ' = ' + (0.8 * x) + '，还不是 160：再调一调原价。');
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：胜 3 场得 9 分', '提高：0.8x = 160 → x = 200', '挑战：两件一共亏 10 元'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm77-guess',
  title: '天平试值法',
  sub: '先猜一个答案放上天平，看哪边重再调：猜中使天平平衡的数，就是方程的解；再过渡到代数解法。',
  grade: 7,
  kind: '实验',
  points: ['7.7'],
  render: function (el) {
    var K = 'm77-guess';
    var LEVELS = [
      { label: '基础', a: 1, b: 4, c: 9, q: 'x + 4 = 9，x 是几？先猜。', opts: ['5', '13', '4'], ans: 0, hint: '从 5 开始试：左边 = x + 4。' },
      { label: '提高', a: 2, b: -1, c: 9, q: '2x - 1 = 9，x 是几？先猜。', opts: ['5', '4', '10'], ans: 0, hint: '从 5 开始试：左边 = 2x - 1。' },
      { label: '挑战', a: 4, b: -3, c: 21, q: '4x - 3 = 21，x 是几？先猜。', opts: ['6', '5', '7'], ans: 0, hint: '从 6 开始试：左边 = 4x - 3。' }
    ];
    var levelIdx = 0, x = 0, guessed = -1, tiers = null, tries = 0;
    el.innerHTML =
      '<p class="demo-tag">实验 · 7 年级 · 实际问题与一元一次方程</p>' +
      '<h3>天平试值法</h3>' +
      '<p>不知道 x 是几？猜一个放上天平：左边重了，x 猜大了；右边重了，x 猜小了；天平平了，x 就猜中了。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 试一试：<button class="btn small" id="' + K + '-minus" type="button">x − 1</button> <b id="' + K + '-x">0</b> <button class="btn small" id="' + K + '-plus" type="button">x ＋ 1</button> <button class="btn small primary" id="' + K + '-try" type="button">放上天平</button></p>' +
      '<p>方程：<b id="' + K + '-eq"></b></p>' +
      '<p>天平：<b id="' + K + '-beam">还没试</b></p>' +
      '<p>左边：<b id="' + K + '-left">？</b>　右边：<b id="' + K + '-right">？</b>　试了 <b id="' + K + '-tries">0</b> 次</p>' +
      '<p>提示：<span id="' + K + '-hint"></span></p>' +
      '<p id="' + K + '-msg">先猜 x 是几，再放上天平试。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · x + 4 = 9</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 2x - 1 = 9</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 4x - 3 = 21</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都试出 x，并且能说出“天平平了，猜的数就是解”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function leftVal() {
      var L = LEVELS[levelIdx];
      return L.a * x + L.b;
    }
    function eqText(L) {
      var s = (L.a === 1 ? 'x' : L.a + 'x');
      if (L.b > 0) s += ' + ' + L.b;
      if (L.b < 0) s += ' - ' + (-L.b);
      return s + ' = ' + L.c;
    }
    function setLevel(i) {
      levelIdx = i; var L = LEVELS[i];
      x = 0; guessed = -1; tries = 0;
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-eq').textContent = eqText(L);
      gid(K + '-x').textContent = '0';
      gid(K + '-beam').textContent = '还没试';
      gid(K + '-left').textContent = '？';
      gid(K + '-right').textContent = '？';
      gid(K + '-tries').textContent = '0';
      gid(K + '-hint').textContent = L.hint;
      msg('先猜 x 是几，再调数字、放上天平试。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜 x = ' + LEVELS[levelIdx].opts[g] + '。调到这个数，放上天平试试。');
        });
      })(g);
    }
    gid(K + '-minus').addEventListener('click', function () {
      if (x > 0) x--;
      gid(K + '-x').textContent = String(x);
    });
    gid(K + '-plus').addEventListener('click', function () {
      x++;
      if (x > 20) x = 20;
      gid(K + '-x').textContent = String(x);
    });
    gid(K + '-try').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜 x 是几。'); return; }
      var L = LEVELS[levelIdx];
      var lv = leftVal();
      tries++;
      gid(K + '-tries').textContent = String(tries);
      gid(K + '-left').textContent = String(lv);
      gid(K + '-right').textContent = String(L.c);
      if (lv === L.c) {
        gid(K + '-beam').textContent = '平衡了！';
        var ok = guessed === L.ans;
        msg('天平平了：左边 ' + lv + ' = 右边 ' + L.c + '，x = ' + x + ' 就是方程的解。试了 ' + tries + ' 次。' +
          (ok ? '你猜对了！' : '你刚才猜 x 是 ' + L.opts[guessed] + '，试值法找到了真正的解。'));
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      } else if (lv > L.c) {
        gid(K + '-beam').textContent = '左边重了';
        msg('x = ' + x + ' 时左边是 ' + lv + '，比右边 ' + L.c + ' 重：x 猜大了，往小调。');
      } else {
        gid(K + '-beam').textContent = '右边重了';
        msg('x = ' + x + ' 时左边是 ' + lv + '，比右边 ' + L.c + ' 轻：x 猜小了，往大调。');
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：x + 4 = 9 → x = 5', '提高：2x - 1 = 9 → x = 5', '挑战：4x - 3 = 21 → x = 6'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm78-motion',
  title: '点线面体运动法',
  sub: '点动成线、线动成面、面动成体：激光笔的光点、拉直的绳子、转起来的长方形——自己拖一拖，看图形是怎么“动”出来的。',
  grade: 7,
  kind: '演示',
  points: ['7.8'],
  render: function (el) {
    var K = 'm78-motion';
    var LEVELS = [
      { label: '基础', stage: 0, q: '一个点动起来，留下的痕迹是什么？', opts: ['一条线', '一个面', '一个体'], ans: 0 },
      { label: '提高', stage: 1, q: '一条线平移扫过，留下的痕迹是什么？', opts: ['一个面', '一条线', '一个体'], ans: 0 },
      { label: '挑战', stage: 2, q: '长方形绕它的一条边转一圈，得到什么体？', opts: ['圆柱', '圆锥', '球'], ans: 0 }
    ];
    var levelIdx = 0, pos = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 7 年级 · 几何图形</p>' +
      '<h3>点线面体运动法</h3>' +
      '<p>图形不是静止的：点跑过的地方是线，线扫过的地方是面，面转起来的地方是体。先猜，再拖滑杆看它动。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 动一动：<input type="range" id="' + K + '-slider" min="0" max="10" step="1" value="0" style="width:70%"> <b id="' + K + '-pos">0</b></p>' +
      '<p id="' + K + '-stage"></p>' +
      '<p id="' + K + '-trace"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再拖滑杆。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 点动成线</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 线动成面</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 面动成体</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都动一遍，并且能说出“点动成线、线动成面、面动成体”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function render() {
      gid(K + '-pos').textContent = String(pos);
      var stage = LEVELS[levelIdx].stage;
      if (stage === 0) {
        gid(K + '-stage').textContent = '光点在跑：●';
        var tr = '';
        for (var i = 0; i <= pos; i++) tr += '—';
        tr += '●';
        gid(K + '-trace').textContent = '痕迹：' + tr;
      } else if (stage === 1) {
        gid(K + '-stage').textContent = '一根线在平移：│';
        var rows = '';
        for (var r = 0; r <= pos; r++) rows += '│││││ ';
        gid(K + '-trace').textContent = '扫过的面：' + rows;
      } else {
        gid(K + '-stage').textContent = '长方形绕竖边转：▭';
        gid(K + '-trace').textContent = pos >= 10 ? '转满一圈：一个圆柱立起来了（底面是圆，侧面是长方形卷成的）。' : '转了 ' + pos + '/10 圈，继续拖。';
      }
      if (pos >= 10 && guessed >= 0) {
        var ok = guessed === LEVELS[levelIdx].ans;
        var tail = stage === 0 ? '点跑过的地方连成一条线。' :
          stage === 1 ? '线扫过的地方铺成一个面。' : '长方形绕一边旋转，得到圆柱。';
        msg(tail + (ok ? '你猜对了！' : '你刚才猜的是“' + LEVELS[levelIdx].opts[guessed] + '”，再看一遍痕迹。'));
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      levelIdx = i; pos = 0; guessed = -1;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-slider').value = '0';
      render();
      msg('先猜，再把滑杆拖到头（10）。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜：' + LEVELS[levelIdx].opts[g] + '。拖滑杆验证。');
        });
      })(g);
    }
    gid(K + '-slider').addEventListener('input', function (e) {
      pos = parseInt(e.target.value, 10);
      if (guessed < 0) { msg('先猜一猜，再拖滑杆。'); return; }
      render();
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：点动成线', '提高：线动成面', '挑战：面动成体（圆柱）'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm78-rope',
  title: '拉绳比长法',
  sub: '两点之间画直线与曲线比一比：绳子拉直了就是线段，就是最短。拖一拖弯曲程度，看长度怎么变。',
  grade: 7,
  kind: '实验',
  points: ['7.8'],
  render: function (el) {
    var K = 'm78-rope';
    var LEVELS = [
      { label: '基础', ax: 1, ay: 1, bx: 5, by: 1, q: 'A(1,1) 到 B(5,1)，直线段和弯路谁短？', opts: ['直线段短', '弯路短', '一样长'], ans: 0 },
      { label: '提高', ax: 0, ay: 0, bx: 4, by: 3, q: 'A(0,0) 到 B(4,3)，直线段长是几？', opts: ['5', '7', '4'], ans: 0 },
      { label: '挑战', ax: 0, ay: 0, bx: 6, by: 0, q: '还有比直线段更短的路吗？', opts: ['没有', '有，绕一下', '有，走折线'], ans: 0 }
    ];
    var levelIdx = 0, bend = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 7 年级 · 几何图形</p>' +
      '<h3>拉绳比长法</h3>' +
      '<p>A、B 两点之间，一条绳子拉直就是线段，一松手弯下去就变长。拖滑杆调弯曲程度，长度实时算出来：直线永远最短。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 弯一弯：<input type="range" id="' + K + '-slider" min="0" max="5" step="1" value="0" style="width:70%"> 弯曲程度：<b id="' + K + '-bend">0（拉直）</b></p>' +
      '<p>直线段长：<b id="' + K + '-straight"></b>　现在这条路长：<b id="' + K + '-curved"></b></p>' +
      '<p id="' + K + '-draw"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再拖滑杆。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · A(1,1)-B(5,1)</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · A(0,0)-B(4,3)</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 最短的路</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都比对，并且能说出“两点之间，线段最短”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function straightLen(L) {
      var dx = L.bx - L.ax, dy = L.by - L.ay;
      return Math.sqrt(dx * dx + dy * dy);
    }
    function curveLen(L, b) {
      var mx = (L.ax + L.bx) / 2, my = (L.ay + L.by) / 2;
      var nx = -(L.by - L.ay), ny = (L.bx - L.ax);
      var nl = Math.sqrt(nx * nx + ny * ny) || 1;
      var cx = mx + nx / nl * b, cy = my + ny / nl * b;
      var len = 0, px = L.ax, py = L.ay;
      for (var i = 1; i <= 20; i++) {
        var t = i / 20;
        var qx = (1 - t) * (1 - t) * L.ax + 2 * (1 - t) * t * cx + t * t * L.bx;
        var qy = (1 - t) * (1 - t) * L.ay + 2 * (1 - t) * t * cy + t * t * L.by;
        len += Math.sqrt((qx - px) * (qx - px) + (qy - py) * (qy - py));
        px = qx; py = qy;
      }
      return len;
    }
    function fmtLen(x) {
      return String(Math.round(x * 100) / 100);
    }
    function render() {
      var L = LEVELS[levelIdx];
      var sl = straightLen(L);
      var cl = curveLen(L, bend);
      gid(K + '-bend').textContent = bend === 0 ? '0（拉直）' : String(bend);
      gid(K + '-straight').textContent = fmtLen(sl);
      gid(K + '-curved').textContent = fmtLen(cl);
      gid(K + '-draw').textContent = bend === 0 ? 'A ————— B（拉直了，就是线段）' : 'A ～～～ B（弯下去的路变长了）';
      if (bend >= 3 && guessed >= 0) {
        var ok = guessed === L.ans;
        msg('直线段长 ' + fmtLen(sl) + '，弯路长 ' + fmtLen(cl) + '：弯得越厉害，路越长。' +
          (levelIdx === 1 ? '直角三角形 3-4-5：直线段正好是 5。' : '') +
          (levelIdx === 2 ? '不管怎么弯，都比直线长——两点之间，线段最短。' : '') +
          (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再看一遍两条路的长度。'));
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      levelIdx = i; bend = 0; guessed = -1;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-slider').value = '0';
      render();
      msg('先猜，再把滑杆拖到 3 以上比一比。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜：' + LEVELS[levelIdx].opts[g] + '。拖滑杆弯一弯验证。');
        });
      })(g);
    }
    gid(K + '-slider').addEventListener('input', function (e) {
      bend = parseInt(e.target.value, 10);
      if (guessed < 0) { msg('先猜一猜，再拖滑杆。'); return; }
      render();
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：直线段最短', '提高：A(0,0)-B(4,3) 直线段长 5', '挑战：没有更短的路'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm78-count',
  title: '计数法',
  sub: '一条线段上有 n 个点，能数出多少条线段？点两个点连一条线段，连满了数一数，规律自己就出来了。',
  grade: 7,
  kind: '实验',
  points: ['7.8'],
  render: function (el) {
    var K = 'm78-count';
    var LEVELS = [
      { label: '基础', n: 3, q: '3 个点能连出几条线段？先猜。', opts: ['3 条', '6 条', '2 条'], ans: 0 },
      { label: '提高', n: 4, q: '4 个点能连出几条线段？先猜。', opts: ['6 条', '4 条', '8 条'], ans: 0 },
      { label: '挑战', n: 5, q: '5 个点能连出几条线段？先猜。', opts: ['10 条', '8 条', '15 条'], ans: 0 }
    ];
    var levelIdx = 0, sel = -1, drawn = {}, count = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 7 年级 · 几何图形</p>' +
      '<h3>计数法</h3>' +
      '<p>一条线上有几个点，点两点连一条线段：连过的不能重复连。连满了数一数——n 个点，线段数是 n×(n-1)÷2。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 连线段：先点一个点，再点另一个点。</p>' +
      '<div class="btn-row" id="' + K + '-dots"></div>' +
      '<p>已连：<b id="' + K + '-list">（还没连）</b></p>' +
      '<p>连了 <b id="' + K + '-count">0</b> 条　<button class="btn small ghost" id="' + K + '-clear" type="button">重连</button></p>' +
      '<p id="' + K + '-msg">先猜一猜，再连线段。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 3 个点</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 4 个点</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 5 个点</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都连满，并且能说出“n 个点有 n×(n-1)÷2 条线段”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function totalSegs(n) { return n * (n - 1) / 2; }
    function buildDots() {
      var box = gid(K + '-dots');
      while (box.firstChild) box.removeChild(box.firstChild);
      var L = LEVELS[levelIdx];
      for (var i = 0; i < L.n; i++) {
        (function (i) {
          var b = document.createElement('button');
          b.type = 'button'; b.className = 'btn small'; b.textContent = '点' + (i + 1);
          b.addEventListener('click', function () { onDot(i); });
          box.appendChild(b);
        })(i);
      }
    }
    function renderList() {
      var keys = [];
      for (var k in drawn) keys.push(k);
      gid(K + '-list').textContent = keys.length ? keys.join('，') : '（还没连）';
      gid(K + '-count').textContent = String(count);
    }
    function setLevel(i) {
      levelIdx = i; sel = -1; drawn = {}; count = 0; guessed = -1;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      buildDots();
      renderList();
      msg('先猜 ' + L.n + ' 个点能连几条线段，再动手连。');
    }
    function onDot(i) {
      if (guessed < 0) { msg('先猜一猜，再连线段。'); return; }
      if (sel < 0) {
        sel = i;
        msg('选好了点 ' + (i + 1) + '，再点另一个点，跟它连起来。');
        return;
      }
      if (sel === i) { msg('同一个点连不成线段：换一个点。'); return; }
      var a = Math.min(sel, i), b = Math.max(sel, i);
      var key = '点' + (a + 1) + '-点' + (b + 1);
      if (drawn[key]) {
        msg('这条线段已经连过了：换一对点。');
        sel = -1;
        return;
      }
      drawn[key] = true;
      count++;
      sel = -1;
      renderList();
      var L = LEVELS[levelIdx];
      var total = totalSegs(L.n);
      if (count >= total) {
        var ok = guessed === L.ans;
        msg('连满了：一共 ' + total + ' 条线段。规律：每个点能连 ' + (L.n - 1) + ' 条，' + L.n + ' 个点就是 ' +
          L.n + '×' + (L.n - 1) + '÷2 = ' + total + ' 条。' +
          (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，数一数连了几条。'));
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('连好了 ' + key + '，还差 ' + (total - count) + ' 条。');
      }
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜：' + LEVELS[levelIdx].opts[g] + '。动手连线段验证。');
        });
      })(g);
    }
    gid(K + '-clear').addEventListener('click', function () { setLevel(levelIdx); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：3 个点 3 条', '提高：4 个点 6 条', '挑战：5 个点 10 条'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm79-joint',
  title: '张角拼图法',
  sub: '余角是拼满直角缺的那一块，补角是拼满平角缺的那一块：拖动拼块，角一块一块拼满 90° 和 180°。',
  grade: 7,
  kind: '模拟',
  points: ['7.9'],
  render: function (el) {
    var K = 'm79-joint';
    var LEVELS = [
      { label: '基础', given: 30, total: 90, max: 90, q: '30° 还缺几度，才能拼满一个直角？', opts: ['60°', '30°', '90°'], ans: 0, target: 60 },
      { label: '提高', given: 50, total: 90, max: 90, q: '50° 还缺几度，才能拼满一个直角？', opts: ['40°', '50°', '140°'], ans: 0, target: 40 },
      { label: '挑战', given: 120, total: 180, max: 180, q: '120° 还缺几度，才能拼满一个平角？', opts: ['60°', '120°', '90°'], ans: 0, target: 60 }
    ];
    var levelIdx = 0, v = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 7 年级 · 角</p>' +
      '<h3>张角拼图法</h3>' +
      '<p>余角和补角不是背出来的，是拼出来的：一个角加上升起的那一块，正好拼满直角就是互余，拼满平角就是互补。先猜缺几度，再拖滑杆拼一拼。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 拖一拖：滑杆就是你要拼上的那一块角。</p>' +
      '<p><input type="range" id="' + K + '-slider" min="0" max="90" step="1" value="0" style="width:90%"> <b id="' + K + '-v">0°</b></p>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-sum"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再拖滑杆拼角。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 30° 拼直角</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 50° 拼直角</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 120° 拼平角</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都拼满目标角，并且能说出“余角拼满 90°，补角拼满 180°”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function pt(cx, cy, r, a) {
      var rad = a * Math.PI / 180;
      return (cx + r * Math.cos(rad)).toFixed(1) + ' ' + (cy + r * Math.sin(rad)).toFixed(1);
    }
    function wedge(cx, cy, r, a0, a1, fill) {
      var large = (a1 - a0) > 180 ? 1 : 0;
      return '<path d="M ' + cx + ' ' + cy + ' L ' + pt(cx, cy, r, a0) + ' A ' + r + ' ' + r + ' 0 ' + large + ' 1 ' + pt(cx, cy, r, a1) + ' Z" fill="' + fill + '" stroke="#333" stroke-width="1"/>';
    }
    function labelAt(cx, cy, r, a, t) {
      var p = pt(cx, cy, r, a).split(' ');
      return '<text x="' + p[0] + '" y="' + p[1] + '" font-size="13" text-anchor="middle">' + t + '</text>';
    }
    function render() {
      var L = LEVELS[levelIdx];
      var sum = L.given + v;
      gid(K + '-v').textContent = v + '°';
      gid(K + '-sum').textContent = '已有 ' + L.given + '° ＋ 你的 ' + v + '° ＝ ' + sum + '°（目标 ' + L.total + '°）';
      var s = '<svg viewBox="0 0 200 130" style="width:100%;max-width:420px">' +
        '<line x1="30" y1="110" x2="170" y2="110" stroke="#333" stroke-width="1.5"/>' +
        wedge(100, 110, 70, -L.given, 0, '#bcd6ff') +
        wedge(100, 110, 70, -sum, -L.given, '#ffc46b') +
        labelAt(100, 110, 45, -L.given / 2, L.given + '°') +
        labelAt(100, 110, 45, -(L.given + v / 2), v + '°') +
        '<line x1="100" y1="110" x2="' + pt(100, 110, 70, -sum).split(' ')[0] + '" y2="' + pt(100, 110, 70, -sum).split(' ')[1] + '" stroke="#333" stroke-width="1.5"/>';
      if (sum === 90) s += '<path d="M 115 110 L 115 95 L 100 95" fill="none" stroke="#333" stroke-width="1.5"/>';
      if (sum === L.total) s += '<text x="100" y="20" font-size="14" text-anchor="middle">拼满了！</text>';
      s += '</svg>';
      gid(K + '-svg').innerHTML = s;
      if (sum === L.total && guessed >= 0) {
        var ok = guessed === L.ans;
        msg(L.given + '° + ' + v + '° = ' + sum + '°，拼满了' + (L.total === 90 ? '一个直角' : '一个平角') + '。' +
          (L.total === 90 ? '所以 ' + v + '° 是 ' + L.given + '° 的余角。' : '所以 ' + v + '° 是 ' + L.given + '° 的补角。') +
          (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，缺的那块就是 ' + L.target + '°。'));
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      levelIdx = i; v = 0; guessed = -1;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-slider').max = String(L.max);
      gid(K + '-slider').value = '0';
      msg('先猜一猜，再拖滑杆拼满 ' + L.total + '°。');
      render();
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜缺 ' + LEVELS[levelIdx].opts[g] + '。拖滑杆拼一拼，看看对不对。');
        });
      })(g);
    }
    gid(K + '-slider').addEventListener('input', function (e) {
      v = parseInt(e.target.value, 10);
      if (guessed < 0) { msg('先猜一猜，再拖滑杆。'); return; }
      render();
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：30° 的余角是 60°', '提高：50° 的余角是 40°', '挑战：120° 的补角是 60°'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm79-overlap',
  title: '叠合比较法',
  sub: '两个角比大小，不用量角器：顶点对顶点、一条边对一条边叠起来，另一条边谁在外面，谁就大。',
  grade: 7,
  kind: '实验',
  points: ['7.9'],
  render: function (el) {
    var K = 'm79-overlap';
    var LEVELS = [
      { label: '基础', a1: 35, a2: 50, q: '∠1 是 35°，∠2 是 50°，哪个角大？', opts: ['∠2 大', '∠1 大', '一样大'], ans: 0 },
      { label: '提高', a1: 75, a2: 70, q: '∠1 是 75°，∠2 是 70°，哪个角大？', opts: ['∠1 大', '∠2 大', '一样大'], ans: 0 },
      { label: '挑战', a1: 120, a2: 115, q: '∠1 是 120°，∠2 是 115°，哪个角大？', opts: ['∠1 大', '∠2 大', '一样大'], ans: 0 }
    ];
    var levelIdx = 0, guessed = -1, tiers = null, stacked = false;
    el.innerHTML =
      '<p class="demo-tag">实验 · 7 年级 · 角</p>' +
      '<h3>叠合比较法</h3>' +
      '<p>两个角谁大？把它们叠起来就知道了：顶点对齐、一条边重合，看另一条边——伸在外面的那个角更大。先猜，再叠。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 叠起来：</p>' +
      '<div class="btn-row"><button class="btn small" id="' + K + '-stack-btn" type="button">叠起来比一比</button></div>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点“叠起来比一比”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 35° 和 50°</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 75° 和 70°</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 120° 和 115°</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都叠对了，并且能说出“另一条边在外面的角更大”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function pt(cx, cy, r, a) {
      var rad = a * Math.PI / 180;
      return (cx + r * Math.cos(rad)).toFixed(1) + ' ' + (cy + r * Math.sin(rad)).toFixed(1);
    }
    function wedge(cx, cy, r, a0, a1, fill) {
      var large = (a1 - a0) > 180 ? 1 : 0;
      return '<path d="M ' + cx + ' ' + cy + ' L ' + pt(cx, cy, r, a0) + ' A ' + r + ' ' + r + ' 0 ' + large + ' 1 ' + pt(cx, cy, r, a1) + ' Z" fill="' + fill + '" stroke="#333" stroke-width="1"/>';
    }
    function labelAt(cx, cy, r, a, t) {
      var p = pt(cx, cy, r, a).split(' ');
      return '<text x="' + p[0] + '" y="' + p[1] + '" font-size="13" text-anchor="middle">' + t + '</text>';
    }
    function draw() {
      var L = LEVELS[levelIdx];
      var big = Math.max(L.a1, L.a2), small = Math.min(L.a1, L.a2);
      var s = '<svg viewBox="0 0 200 130" style="width:100%;max-width:420px">' +
        '<line x1="30" y1="105" x2="170" y2="105" stroke="#333" stroke-width="1.5"/>';
      if (!stacked) {
        s += wedge(55, 105, 45, -L.a1, 0, '#bcd6ff') + labelAt(55, 105, 60, -L.a1 / 2, '∠1') +
          wedge(155, 105, 45, -L.a2, 0, '#ffc46b') + labelAt(155, 105, 60, -L.a2 / 2, '∠2') +
          '<text x="55" y="125" font-size="12" text-anchor="middle">∠1 = ' + L.a1 + '°</text>' +
          '<text x="155" y="125" font-size="12" text-anchor="middle">∠2 = ' + L.a2 + '°</text>';
      } else {
        s += wedge(100, 105, 70, -big, 0, '#ffc46b') + wedge(100, 105, 70, -small, 0, '#7fb3ff') +
          labelAt(100, 105, 85, -big / 2, '大角 ' + big + '°') +
          labelAt(100, 105, 42, -small / 2, small + '°') +
          '<text x="100" y="125" font-size="12" text-anchor="middle">顶点对齐、一条边重合，另一条边在外面的更大</text>';
      }
      s += '</svg>';
      gid(K + '-svg').innerHTML = s;
    }
    function setLevel(i) {
      levelIdx = i; guessed = -1; stacked = false;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      msg('先猜一猜，再点“叠起来比一比”。');
      draw();
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜 ' + LEVELS[levelIdx].opts[g] + '。叠起来验证一下。');
        });
      })(g);
    }
    gid(K + '-stack-btn').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜哪个角大。'); return; }
      var L = LEVELS[levelIdx];
      stacked = true;
      draw();
      var big = Math.max(L.a1, L.a2), small = Math.min(L.a1, L.a2);
      var winner = L.a1 > L.a2 ? '∠1' : '∠2';
      var ok = guessed === L.ans;
      msg('叠好了：' + winner + ' 的另一条边伸在外面，所以 ' + winner + ' 更大：' + L.a1 + '° 和 ' + L.a2 + '° 比，' + big + '° > ' + small + '°。' +
        (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再看一遍谁的边在外面。'));
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：50° > 35°', '提高：75° > 70°', '挑战：120° > 115°'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm79-protractor',
  title: '量角器/钟表读数法',
  sub: '角是张开的程度：量角器读度数，钟表读分钟，度、分、秒是六十进制——和时钟的分秒一个道理。',
  grade: 7,
  kind: '模拟',
  points: ['7.9'],
  render: function (el) {
    var K = 'm79-protractor';
    var LEVELS = [
      { label: '基础', kind: 'protractor', q: '量角器上这个角是多少度？', opts: ['40°', '140°', '50°'], ans: 0, action: '量一量', verdict: '角的一边对准 0°，另一边指着 40°，这个角是 40°。读内圈还是外圈，看 0° 在哪边：0° 在右边就读内圈。' },
      { label: '提高', kind: 'clock', q: '分针从 12 走到 8，走了几分钟、转了几度？', opts: ['40 分，240°', '8 分，48°', '40 分，40°'], ans: 0, action: '拨分针', verdict: '分针走 1 大格是 5 分钟、30°；走到 8 是 8 大格：8 × 5 = 40 分，8 × 30° = 240°。' },
      { label: '挑战', kind: 'dms', q: '2°30′ 合多少角分？', opts: ['150′', '230′', '90′'], ans: 0, action: '换算一下', verdict: '1° = 60′，2° = 120′，再加 30′：120′ + 30′ = 150′。度、分、秒是六十进制，和时钟的分秒一个道理。' }
    ];
    var levelIdx = 0, guessed = -1, tiers = null, done = false;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 7 年级 · 角</p>' +
      '<h3>量角器/钟表读数法</h3>' +
      '<p>角的大小就是张开的程度：量角器量它，钟表走它，度、分、秒六十进制。先猜，再动手量。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 动手量：</p>' +
      '<div class="btn-row"><button class="btn small" id="' + K + '-act-btn" type="button"></button></div>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再动手量。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 量角器读数</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 钟表分针</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 度分换算</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都量对了，并且能说出“1° = 60′，分针 1 大格是 30°”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function pt(cx, cy, r, a) {
      var rad = a * Math.PI / 180;
      return (cx + r * Math.cos(rad)).toFixed(1) + ' ' + (cy + r * Math.sin(rad)).toFixed(1);
    }
    function draw() {
      var L = LEVELS[levelIdx];
      var s = '';
      if (L.kind === 'protractor') {
        s = '<svg viewBox="0 0 200 120" style="width:100%;max-width:420px">' +
          '<path d="M 20 100 A 80 80 0 0 1 180 100 Z" fill="#eef4ff" stroke="#333" stroke-width="1.5"/>';
        for (var a = 0; a <= 180; a += 10) {
          var p1 = pt(100, 100, 70, -a).split(' ');
          var p2 = pt(100, 100, 80, -a).split(' ');
          s += '<line x1="' + p1[0] + '" y1="' + p1[1] + '" x2="' + p2[0] + '" y2="' + p2[1] + '" stroke="#333" stroke-width="1"/>';
        }
        var ray = pt(100, 100, 80, -40).split(' ');
        s += '<path d="M 100 100 L 180 100 L ' + ray[0] + ' ' + ray[1] + ' Z" fill="#ffc46b" stroke="#333" stroke-width="1"/>' +
          '<text x="100" y="118" font-size="12" text-anchor="middle">0° 在右边，读内圈</text></svg>';
      } else if (L.kind === 'clock') {
        s = '<svg viewBox="0 0 200 200" style="width:100%;max-width:420px">' +
          '<circle cx="100" cy="100" r="80" fill="#fff" stroke="#333" stroke-width="2"/>';
        for (var h = 0; h < 12; h++) {
          var ang = h * 30;
          var q1 = pt(100, 100, 70, ang - 90).split(' ');
          var q2 = pt(100, 100, 80, ang - 90).split(' ');
          s += '<line x1="' + q1[0] + '" y1="' + q1[1] + '" x2="' + q2[0] + '" y2="' + q2[1] + '" stroke="#333" stroke-width="2"/>';
        }
        var hand = pt(100, 100, 55, 240 - 90).split(' ');
        s += '<line x1="100" y1="100" x2="' + hand[0] + '" y2="' + hand[1] + '" stroke="#d33" stroke-width="3"/>' +
          '<text x="100" y="25" font-size="13" text-anchor="middle">12</text>' +
          '<text x="178" y="105" font-size="13" text-anchor="middle">3</text>' +
          '<text x="100" y="185" font-size="13" text-anchor="middle">6</text>' +
          '<text x="22" y="105" font-size="13" text-anchor="middle">9</text>' +
          '<text x="100" y="60" font-size="12" text-anchor="middle">分针指到 8</text></svg>';
      } else {
        s = '<svg viewBox="0 0 200 90" style="width:100%;max-width:420px">' +
          '<rect x="20" y="20" width="160" height="26" fill="#bcd6ff" stroke="#333"/>' +
          '<rect x="20" y="55" width="80" height="26" fill="#ffc46b" stroke="#333"/>' +
          '<text x="100" y="38" font-size="13" text-anchor="middle">1° = 60′</text>' +
          '<text x="60" y="73" font-size="13" text-anchor="middle">2° = 120′</text>' +
          '<text x="140" y="73" font-size="13" text-anchor="middle">＋ 30′</text></svg>';
      }
      gid(K + '-svg').innerHTML = s;
    }
    function setLevel(i) {
      levelIdx = i; guessed = -1; done = false;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-act-btn').textContent = L.action;
      msg('先猜一猜，再点“' + L.action + '”。');
      draw();
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜 ' + LEVELS[levelIdx].opts[g] + '。动手量一量验证。');
        });
      })(g);
    }
    gid(K + '-act-btn').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜。'); return; }
      if (done) { msg('已经量完了，再看一遍上面的图。'); return; }
      done = true;
      var L = LEVELS[levelIdx];
      var ok = guessed === L.ans;
      msg(L.verdict + (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再量一遍。'));
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：这个角是 40°', '提高：分针到 8 是 40 分、240°', '挑战：2°30′ = 150′'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm710-drag',
  title: '拖动发现法',
  sub: '自己拖一拖两条相交直线：对顶角永远相等，邻角永远互补——发现是拖出来的，不是背出来的。',
  grade: 7,
  kind: '模拟',
  points: ['7.10'],
  render: function (el) {
    var K = 'm710-drag';
    var LEVELS = [
      { label: '基础', target: 50, q: '∠1 是 50° 时，它的对顶角 ∠3 是几度？', opts: ['50°', '130°', '180°'], ans: 0 },
      { label: '提高', target: 120, q: '∠1 是 120° 时，对顶角 ∠3 是几度？', opts: ['120°', '60°', '180°'], ans: 0 },
      { label: '挑战', target: 65, q: '∠1 是 65° 时，邻角 ∠2 是几度？', opts: ['115°', '65°', '25°'], ans: 0 }
    ];
    var levelIdx = 0, th = 50, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 7 年级 · 相交线</p>' +
      '<h3>拖动发现法</h3>' +
      '<p>两条直线相交，四个角两两相对：拖动滑杆改 ∠1 的大小，看另外三个角跟着怎么变——对顶角永远跟它一样大，邻角永远跟它加起来是 180°。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 拖一拖：滑杆改 ∠1 的大小。</p>' +
      '<p><input type="range" id="' + K + '-slider" min="30" max="150" step="1" value="50" style="width:90%"> <b id="' + K + '-v">∠1 = 50°</b></p>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-vals"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再拖滑杆。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · ∠1 = 50°</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · ∠1 = 120°</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · ∠1 = 65°</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都拖到目标角，并且能说出“对顶角相等，邻角互补”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function pt(cx, cy, r, a) {
      var rad = a * Math.PI / 180;
      return (cx + r * Math.cos(rad)).toFixed(1) + ' ' + (cy + r * Math.sin(rad)).toFixed(1);
    }
    function wedge(cx, cy, r, a0, a1, fill) {
      var large = (a1 - a0) > 180 ? 1 : 0;
      return '<path d="M ' + cx + ' ' + cy + ' L ' + pt(cx, cy, r, a0) + ' A ' + r + ' ' + r + ' 0 ' + large + ' 1 ' + pt(cx, cy, r, a1) + ' Z" fill="' + fill + '" stroke="#333" stroke-width="1"/>';
    }
    function labelAt(cx, cy, r, a, t) {
      var p = pt(cx, cy, r, a).split(' ');
      return '<text x="' + p[0] + '" y="' + p[1] + '" font-size="12" text-anchor="middle">' + t + '</text>';
    }
    function render() {
      var s = th, o = 180 - th;
      gid(K + '-v').textContent = '∠1 = ' + th + '°';
      gid(K + '-vals').textContent = '∠1 = ' + s + '°　∠2 = ' + o + '°　∠3 = ' + s + '°　∠4 = ' + o + '°';
      var ux = Math.cos(s * Math.PI / 180), uy = Math.sin(s * Math.PI / 180);
      var p1x = (100 - 75 * ux).toFixed(1), p1y = (90 - 75 * uy).toFixed(1);
      var p2x = (100 + 75 * ux).toFixed(1), p2y = (90 + 75 * uy).toFixed(1);
      var svg = '<svg viewBox="0 0 200 170" style="width:100%;max-width:420px">' +
        wedge(100, 90, 26, 180, s + 180, '#bcd6ff') +
        wedge(100, 90, 26, s + 180, 360, '#ffc46b') +
        wedge(100, 90, 26, 0, s, '#bcd6ff') +
        wedge(100, 90, 26, s, 180, '#ffc46b') +
        '<line x1="20" y1="90" x2="180" y2="90" stroke="#333" stroke-width="1.5"/>' +
        '<line x1="' + p1x + '" y1="' + p1y + '" x2="' + p2x + '" y2="' + p2y + '" stroke="#333" stroke-width="1.5"/>' +
        labelAt(100, 90, 42, 180 + s / 2, '∠1 ' + s + '°') +
        labelAt(100, 90, 42, 270 + s / 2, '∠2 ' + o + '°') +
        labelAt(100, 90, 42, s / 2, '∠3 ' + s + '°') +
        labelAt(100, 90, 42, 90 + s / 2, '∠4 ' + o + '°') +
        '</svg>';
      gid(K + '-svg').innerHTML = svg;
      if (th === LEVELS[levelIdx].target && guessed >= 0) {
        var ok = guessed === LEVELS[levelIdx].ans;
        if (levelIdx < 2) {
          msg('∠1 = ∠3 = ' + th + '°：对顶角相等，拖到哪儿都一样。∠2 和 ∠4 也相等，都是 ' + o + '°。' +
            (ok ? '你猜对了！' : '你刚才猜的是“' + LEVELS[levelIdx].opts[guessed] + '”，再看一遍对着的两个角。'));
        } else {
          msg('∠1 = 65°，∠2 = 180° − 65° = 115°：邻角互补，和是 180°。' +
            (ok ? '你猜对了！' : '你刚才猜的是“' + LEVELS[levelIdx].opts[guessed] + '”，邻角是 180° 减去它。'));
        }
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      levelIdx = i; th = 50; guessed = -1;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-slider').value = '50';
      msg('先猜一猜，再拖滑杆到 ∠1 = ' + L.target + '°。');
      render();
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜 ' + LEVELS[levelIdx].opts[g] + '。拖滑杆到 ∠1 = ' + LEVELS[levelIdx].target + '°，看看对不对。');
        });
      })(g);
    }
    gid(K + '-slider').addEventListener('input', function (e) {
      th = parseInt(e.target.value, 10);
      if (guessed < 0) { msg('先猜一猜，再拖滑杆。'); return; }
      render();
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：∠1 = ∠3 = 50°', '提高：∠1 = ∠3 = 120°', '挑战：∠2 = 115°'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm710-suppl',
  title: '补角推理法',
  sub: '对顶角相等不用量：它们都和同一个邻角互补，同一个角的补角只有一个——一步一步推出来。',
  grade: 7,
  kind: '演示',
  points: ['7.10'],
  render: function (el) {
    var K = 'm710-suppl';
    var LEVELS = [
      { label: '基础', adj: 130, ans: 50, q: '∠2 是 130°，∠1 和它的对顶角 ∠3 各是几度？', opts: ['50°', '130°', '180°'], ansIdx: 0,
        steps: ['第 1 步：∠1 和 ∠2 是邻补角：∠1 + 130° = 180°，所以 ∠1 = 50°。', '第 2 步：∠3 和 ∠2 也是邻补角：∠3 + 130° = 180°，所以 ∠3 = 50°。', '第 3 步：∠1 和 ∠3 都等于 180° − 130°，所以 ∠1 = ∠3：对顶角相等，是推出来的，不是量出来的。'] },
      { label: '提高', adj: 75, ans: 105, q: '∠2 是 75°，∠1 和它的对顶角 ∠3 各是几度？', opts: ['105°', '75°', '180°'], ansIdx: 0,
        steps: ['第 1 步：∠1 + 75° = 180°，所以 ∠1 = 105°。', '第 2 步：∠3 + 75° = 180°，所以 ∠3 = 105°。', '第 3 步：∠1 和 ∠3 都是 75° 的补角，同一个角的补角只有一个，所以 ∠1 = ∠3。'] },
      { label: '挑战', adj: 145, ans: 35, q: '∠2 是 145°，∠1 和它的对顶角 ∠3 各是几度？', opts: ['35°', '145°', '180°'], ansIdx: 0,
        steps: ['第 1 步：∠1 + 145° = 180°，所以 ∠1 = 35°。', '第 2 步：∠3 + 145° = 180°，所以 ∠3 = 35°。', '第 3 步：∠1 = ∠3 = 35°：对顶角相等，邻角互补是它的道理。'] }
    ];
    var levelIdx = 0, stepIdx = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 7 年级 · 相交线</p>' +
      '<h3>补角推理法</h3>' +
      '<p>对顶角为什么相等？因为它们都和同一个邻角拼满 180°：同一个角的补角只有一个，两个角既然都是它的补角，当然相等。先猜，再一步一步推。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 往下推：</p>' +
      '<div class="btn-row"><button class="btn small" id="' + K + '-next-btn" type="button">往下推一步</button></div>' +
      '<div id="' + K + '-proof"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点“往下推一步”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · ∠2 = 130°</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · ∠2 = 75°</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · ∠2 = 145°</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都推完了，并且能说出“同一个角的补角只有一个”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function setLevel(i) {
      levelIdx = i; stepIdx = 0; guessed = -1;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-proof').innerHTML = '';
      msg('先猜一猜，再点“往下推一步”。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜 ' + LEVELS[levelIdx].opts[g] + '。往下推，看推理同不同意你。');
        });
      })(g);
    }
    gid(K + '-next-btn').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜。'); return; }
      var L = LEVELS[levelIdx];
      if (stepIdx >= L.steps.length) { msg('已经推完了，再看一遍上面的步骤。'); return; }
      var p = gid(K + '-proof');
      p.innerHTML = p.innerHTML + '<p>' + L.steps[stepIdx] + '</p>';
      stepIdx++;
      if (stepIdx >= L.steps.length) {
        var ok = guessed === L.ansIdx;
        msg('推完了：∠1 = ∠3 = ' + L.ans + '°。' + (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，推理说应该是 ' + L.ans + '°。'));
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('继续往下推。');
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：∠1 = ∠3 = 50°', '提高：∠1 = ∠3 = 105°', '挑战：∠1 = ∠3 = 35°'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm710-perp',
  title: '垂线段最短比较法',
  sub: '从直线外一点向直线画垂线段和几条斜线段，比一比谁最短：垂线段永远赢，斜线越斜越长。',
  grade: 7,
  kind: '实验',
  points: ['7.10'],
  render: function (el) {
    var K = 'm710-perp';
    var LEVELS = [
      { label: '基础', h: 3, d: 4, len: 5, q: '垂线段长 3，斜线段的落点在 4 格外，它的长是几？哪条最短？', opts: ['垂线段最短', '斜线段最短', '一样长'], ans: 0 },
      { label: '提高', h: 4, d: 3, len: 5, q: '垂线段长 4，斜线段的落点在 3 格外，它的长是几？哪条最短？', opts: ['垂线段最短', '斜线段最短', '一样长'], ans: 0 },
      { label: '挑战', h: 5, d: 12, len: 13, q: '垂线段长 5，斜线段的落点在 12 格外，它的长是几？哪条最短？', opts: ['垂线段最短', '斜线段最短', '一样长'], ans: 0 }
    ];
    var levelIdx = 0, d = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 7 年级 · 相交线</p>' +
      '<h3>垂线段最短比较法</h3>' +
      '<p>从直线外一点到直线，垂线段是最近的路：斜线段的落点越远，线段越长。先猜哪条最短，再拖滑杆移动斜线段的落点、比一比长度。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 拖一拖：滑杆移动斜线段的落点。</p>' +
      '<p><input type="range" id="' + K + '-slider" min="0" max="14" step="1" value="0" style="width:90%"> <b id="' + K + '-d">落点在 0 格外</b></p>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-lens"></p>' +
      '<div class="btn-row"><button class="btn small" id="' + K + '-cmp-btn" type="button">比一比谁最短</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再拖滑杆。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 垂线段 3</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 垂线段 4</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 垂线段 5</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都比出来了，并且能说出“垂线段最短，斜线越斜越长”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function fmtLen(x) {
      var r = Math.round(x * 10) / 10;
      return String(r);
    }
    function draw() {
      var L = LEVELS[levelIdx];
      var len = Math.sqrt(L.h * L.h + d * d);
      var px = 100, py = 140 - 10 * L.h, ox = 100, oy = 140, qx = 100 + 10 * d;
      gid(K + '-d').textContent = '落点在 ' + d + ' 格外';
      gid(K + '-lens').textContent = '垂线段长 ' + L.h + '　斜线段长 ' + fmtLen(len);
      var s = '<svg viewBox="0 0 260 160" style="width:100%;max-width:460px">' +
        '<line x1="20" y1="140" x2="250" y2="140" stroke="#333" stroke-width="1.5"/>' +
        '<text x="245" y="132" font-size="12" text-anchor="end">直线 l</text>' +
        '<line x1="' + px + '" y1="' + py + '" x2="' + ox + '" y2="' + oy + '" stroke="#2a7" stroke-width="2.5" stroke-dasharray="5 3"/>' +
        '<line x1="' + px + '" y1="' + py + '" x2="' + qx + '" y2="' + oy + '" stroke="#d33" stroke-width="2.5"/>' +
        '<path d="M 108 140 L 108 132 L 100 132" fill="none" stroke="#333" stroke-width="1.5"/>' +
        '<circle cx="' + px + '" cy="' + py + '" r="4" fill="#333"/>' +
        '<text x="' + (px + 8) + '" y="' + (py + 4) + '" font-size="13">P</text>' +
        '<text x="' + (ox - 14) + '" y="156" font-size="12">O</text>' +
        '<text x="' + qx + '" y="156" font-size="12" text-anchor="middle">Q</text>' +
        '<text x="52" y="' + (py + 40) + '" font-size="12">垂线段 ' + L.h + '</text>' +
        '<text x="150" y="' + (py + 70) + '" font-size="12">斜线段 ' + fmtLen(len) + '</text>' +
        '</svg>';
      gid(K + '-svg').innerHTML = s;
    }
    function setLevel(i) {
      levelIdx = i; d = 0; guessed = -1;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-slider').value = '0';
      msg('先猜一猜，再把滑杆拖到 ' + L.d + ' 格外比一比。');
      draw();
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜 ' + LEVELS[levelIdx].opts[g] + '。拖滑杆、比一比验证。');
        });
      })(g);
    }
    gid(K + '-slider').addEventListener('input', function (e) {
      d = parseInt(e.target.value, 10);
      if (guessed < 0) { msg('先猜一猜，再拖滑杆。'); return; }
      draw();
    });
    gid(K + '-cmp-btn').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜哪条最短。'); return; }
      var L = LEVELS[levelIdx];
      if (d !== L.d) { msg('把滑杆拖到 ' + L.d + ' 格外再比：这一档问的就是落点在 ' + L.d + ' 格外的斜线段。'); return; }
      var ok = guessed === L.ans;
      msg('斜线段长 ' + L.len + '，垂线段长 ' + L.h + '：垂线段最短。' +
        '落点越远斜线越长——' + L.h + '、' + L.d + '、' + L.len + ' 正好是一组勾股数。' +
        (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再看一遍两条线的长度。'));
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：3-4-5，垂线段最短', '提高：4-3-5，垂线段最短', '挑战：5-12-13，垂线段最短'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm711-fzc',
  title: '亮灯辨角法（F/Z/C形）',
  sub: '同位角看 F，内错角看 Z，同旁内角看 C：字母形状就是辨认线索，点一下亮灯，角对自己亮起来。',
  grade: 7,
  kind: '模拟',
  points: ['7.11'],
  render: function (el) {
    var K = 'm711-fzc';
    var LEVELS = [
      { label: '基础', letter: 'F', name: '同位角', q: '哪一对是同位角？', opts: ['∠1 和 ∠5', '∠3 和 ∠6', '∠4 和 ∠6'], ans: 0, pair: [1, 5], verdict: '亮起来的是 ∠1 和 ∠5：都在截线左边、都在平行线上面，一个 F 形框住了它们。同位角相等：∠1 = ∠5 = 60°。' },
      { label: '提高', letter: 'Z', name: '内错角', q: '哪一对是内错角？', opts: ['∠3 和 ∠6', '∠1 和 ∠5', '∠3 和 ∠5'], ans: 0, pair: [3, 6], verdict: '亮起来的是 ∠3 和 ∠6：一个在左下一个在右上，夹在两条平行线中间，一个 Z 形框住了它们。内错角相等：∠3 = ∠6 = 120°。' },
      { label: '挑战', letter: 'C', name: '同旁内角', q: '哪一对是同旁内角？', opts: ['∠4 和 ∠6', '∠2 和 ∠6', '∠4 和 ∠5'], ans: 0, pair: [4, 6], verdict: '亮起来的是 ∠4 和 ∠6：都在截线右边、都夹在两条平行线中间，一个 C 形框住了它们。同旁内角互补：∠4 + ∠6 = 60° + 120° = 180°。' }
    ];
    var levelIdx = 0, guessed = -1, tiers = null, lit = false;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 7 年级 · 平行线与平移</p>' +
      '<h3>亮灯辨角法（F/Z/C形）</h3>' +
      '<p>两条平行线被一条截线切开，8 个角一下子分不清？看字母：同位角排成 F，内错角排成 Z，同旁内角排成 C。先猜是哪一对，再点亮灯。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 亮灯：</p>' +
      '<div class="btn-row"><button class="btn small" id="' + K + '-light-btn" type="button">亮灯</button></div>' +
      '<div id="' + K + '-svg"></div>' +
      '<p>∠1 = 60°　∠2 = 120°　∠3 = 120°　∠4 = 60°　∠5 = 60°　∠6 = 120°　∠7 = 120°　∠8 = 60°</p>' +
      '<p id="' + K + '-msg">先猜一猜，再点亮灯。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 同位角 F</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 内错角 Z</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 同旁内角 C</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都认对了，并且能说出“F 是同位角，Z 是内错角，C 是同旁内角”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function pt(cx, cy, r, a) {
      var rad = a * Math.PI / 180;
      return (cx + r * Math.cos(rad)).toFixed(1) + ' ' + (cy + r * Math.sin(rad)).toFixed(1);
    }
    function wedge(cx, cy, r, a0, a1, fill) {
      var large = (a1 - a0) > 180 ? 1 : 0;
      return '<path d="M ' + cx + ' ' + cy + ' L ' + pt(cx, cy, r, a0) + ' A ' + r + ' ' + r + ' 0 ' + large + ' 1 ' + pt(cx, cy, r, a1) + ' Z" fill="' + fill + '" stroke="#333" stroke-width="1"/>';
    }
    function labelAt(cx, cy, r, a, t) {
      var p = pt(cx, cy, r, a).split(' ');
      return '<text x="' + p[0] + '" y="' + p[1] + '" font-size="12" text-anchor="middle">' + t + '</text>';
    }
    var TX = 82.7, TY = 60, BX = 117.3, BY = 120;
    var SPANS = { 1: [180, 240], 2: [240, 360], 3: [60, 180], 4: [0, 60], 5: [180, 240], 6: [240, 360], 7: [60, 180], 8: [0, 60] };
    var MIDS = { 1: 210, 2: 300, 3: 120, 4: 30, 5: 210, 6: 300, 7: 120, 8: 30 };
    function draw() {
      var L = LEVELS[levelIdx];
      var s = '<svg viewBox="0 0 200 170" style="width:100%;max-width:420px">' +
        '<line x1="20" y1="60" x2="180" y2="60" stroke="#333" stroke-width="1.5"/>' +
        '<line x1="20" y1="120" x2="180" y2="120" stroke="#333" stroke-width="1.5"/>' +
        '<line x1="65" y1="29" x2="135" y2="151" stroke="#333" stroke-width="1.5"/>' +
        '<text x="185" y="58" font-size="11">l1</text>' +
        '<text x="185" y="118" font-size="11">l2</text>';
      var i, n, cx, cy;
      for (i = 1; i <= 8; i++) {
        cx = i <= 4 ? TX : BX;
        cy = i <= 4 ? TY : BY;
        n = SPANS[i];
        s += wedge(cx, cy, 15, n[0], n[1], lit && L.pair.indexOf(i) >= 0 ? '#ffb020' : '#eef4ff');
        s += labelAt(cx, cy, 29, MIDS[i], '∠' + i);
      }
      if (lit) {
        var arm1, arm2;
        if (L.letter === 'F') { arm1 = [50, 60, TX, 60]; arm2 = [85, 120, BX, 120]; }
        else if (L.letter === 'Z') { arm1 = [TX, 60, 115, 60]; arm2 = [85, 120, BX, 120]; }
        else { arm1 = [TX, 60, 115, 60]; arm2 = [BX, 120, 150, 120]; }
        s += '<line x1="' + TX + '" y1="' + TY + '" x2="' + BX + '" y2="' + BY + '" stroke="#f80" stroke-width="5"/>' +
          '<line x1="' + arm1[0] + '" y1="' + arm1[1] + '" x2="' + arm1[2] + '" y2="' + arm1[3] + '" stroke="#f80" stroke-width="5"/>' +
          '<line x1="' + arm2[0] + '" y1="' + arm2[1] + '" x2="' + arm2[2] + '" y2="' + arm2[3] + '" stroke="#f80" stroke-width="5"/>' +
          '<text x="170" y="30" font-size="22" text-anchor="middle">' + L.letter + ' 形</text>';
      }
      s += '</svg>';
      gid(K + '-svg').innerHTML = s;
    }
    function setLevel(i) {
      levelIdx = i; guessed = -1; lit = false;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      msg('先猜一猜，再点亮灯看 ' + L.name + '。');
      draw();
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜 ' + LEVELS[levelIdx].opts[g] + '。亮灯验证一下。');
        });
      })(g);
    }
    gid(K + '-light-btn').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜是哪一对。'); return; }
      var L = LEVELS[levelIdx];
      lit = true;
      draw();
      var ok = guessed === L.ans;
      msg(L.verdict + (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，亮起来的才是 ' + L.name + '。'));
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：同位角 ∠1 和 ∠5', '提高：内错角 ∠3 和 ∠6', '挑战：同旁内角 ∠4 和 ∠6'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm711-slide',
  title: '滑杆拖动法（平行不变性）',
  sub: '拖截线斜率，所有同位角一起变、但始终相等；把一条平行线拖成不平行，等角关系立刻破掉。',
  grade: 7,
  kind: '模拟',
  points: ['7.11'],
  render: function (el) {
    var K = 'm711-slide';
    var LEVELS = [
      { label: '基础', target: 110, mode: 'parallel', q: '把 ∠1 拖到 110°，同位角 ∠5 是几度？', opts: ['110°', '70°', '180°'], ans: 0 },
      { label: '提高', target: 65, mode: 'parallel', q: '把 ∠1 拖到 65°，∠5 是几度？', opts: ['65°', '115°', '25°'], ans: 0 },
      { label: '挑战', target: 110, mode: 'break', q: '∠1 是 110° 时，把下线拖歪 10°，∠5 还等于 ∠1 吗？', opts: ['不相等了', '还相等', '不知道'], ans: 0 }
    ];
    var levelIdx = 0, s = 90, guessed = -1, tiers = null, broken = false;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 7 年级 · 平行线与平移</p>' +
      '<h3>滑杆拖动法（平行不变性）</h3>' +
      '<p>两条平行线被截线切开：截线怎么斜，同位角就怎么跟着变——但只要线还平行，∠1 和 ∠5 永远相等。挑战那档可以把下线拖歪，看看等角关系怎么破掉。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 拖一拖：滑杆改截线的斜率。</p>' +
      '<p><input type="range" id="' + K + '-slider" min="30" max="150" step="1" value="90" style="width:90%"> <b id="' + K + '-v">∠1 = 90°</b></p>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-vals"></p>' +
      '<div class="btn-row"><button class="btn small" id="' + K + '-break-btn" type="button">把下线拖歪 10°</button></div>' +
      '<p id="' + K + '-msg">先猜一猜，再拖滑杆。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · ∠1 = 110°</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · ∠1 = 65°</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 拖歪下线</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都拖对了，并且能说出“线平行，同位角才相等；线不平行，角就不相等”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function pt(cx, cy, r, a) {
      var rad = a * Math.PI / 180;
      return (cx + r * Math.cos(rad)).toFixed(1) + ' ' + (cy + r * Math.sin(rad)).toFixed(1);
    }
    function wedge(cx, cy, r, a0, a1, fill) {
      var large = (a1 - a0) > 180 ? 1 : 0;
      return '<path d="M ' + cx + ' ' + cy + ' L ' + pt(cx, cy, r, a0) + ' A ' + r + ' ' + r + ' 0 ' + large + ' 1 ' + pt(cx, cy, r, a1) + ' Z" fill="' + fill + '" stroke="#333" stroke-width="1"/>';
    }
    function labelAt(cx, cy, r, a, t) {
      var p = pt(cx, cy, r, a).split(' ');
      return '<text x="' + p[0] + '" y="' + p[1] + '" font-size="12" text-anchor="middle">' + t + '</text>';
    }
    function draw() {
      var a5 = broken ? s - 10 : s;
      gid(K + '-v').textContent = '∠1 = ' + s + '°';
      gid(K + '-vals').textContent = '∠1 = ' + s + '°　∠5 = ' + a5 + '°' + (broken ? '（下线歪了 10°）' : '（两条线平行）');
      var sinS = Math.sin(s * Math.PI / 180), cosS = Math.cos(s * Math.PI / 180);
      var tx = 100 - 30 / sinS * cosS, bx = 100 + 30 / sinS * cosS;
      var ux = cosS, uy = sinS;
      var p1x = (100 - 75 * ux).toFixed(1), p1y = (90 - 75 * uy).toFixed(1);
      var p2x = (100 + 75 * ux).toFixed(1), p2y = (90 + 75 * uy).toFixed(1);
      var tilt = 10 * Math.PI / 180, dy = 70 * Math.tan(tilt);
      var svg = '<svg viewBox="0 0 200 170" style="width:100%;max-width:420px">' +
        '<line x1="20" y1="60" x2="180" y2="60" stroke="#333" stroke-width="1.5"/>';
      if (broken) {
        svg += '<line x1="30" y1="' + (120 - dy).toFixed(1) + '" x2="170" y2="' + (120 + dy).toFixed(1) + '" stroke="#d33" stroke-width="2"/>';
      } else {
        svg += '<line x1="20" y1="120" x2="180" y2="120" stroke="#333" stroke-width="1.5"/>';
      }
      svg += '<line x1="' + p1x + '" y1="' + p1y + '" x2="' + p2x + '" y2="' + p2y + '" stroke="#333" stroke-width="1.5"/>' +
        wedge(tx, 60, 15, 180, s + 180, '#bcd6ff') +
        wedge(bx, 120, 15, broken ? 190 : 180, s + 180, broken ? '#f8c8c8' : '#bcd6ff') +
        labelAt(tx, 60, 28, 180 + s / 2, '∠1 ' + s + '°') +
        labelAt(bx, 120, 28, 180 + s / 2, '∠5 ' + a5 + '°') +
        '</svg>';
      gid(K + '-svg').innerHTML = svg;
    }
    function render() {
      draw();
      var L = LEVELS[levelIdx];
      if (L.mode === 'parallel' && s === L.target && guessed >= 0) {
        var ok = guessed === L.ans;
        msg('∠1 = ∠5 = ' + s + '°：两条线平行，同位角永远相等。截线再怎么斜，这个等式都不破。' +
          (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再看一遍两个角的度数。'));
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      levelIdx = i; s = 90; guessed = -1; broken = false;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-slider').value = '90';
      gid(K + '-break-btn').style.display = L.mode === 'break' ? '' : 'none';
      msg('先猜一猜，再拖滑杆到 ∠1 = ' + L.target + '°' + (L.mode === 'break' ? '，再点“把下线拖歪 10°”。' : '。'));
      render();
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜 ' + LEVELS[levelIdx].opts[g] + '。拖滑杆验证一下。');
        });
      })(g);
    }
    gid(K + '-slider').addEventListener('input', function (e) {
      s = parseInt(e.target.value, 10);
      if (guessed < 0) { msg('先猜一猜，再拖滑杆。'); return; }
      render();
    });
    gid(K + '-break-btn').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜。'); return; }
      if (LEVELS[levelIdx].mode !== 'break') { msg('这档不用拖歪下线。'); return; }
      if (s !== LEVELS[levelIdx].target) { msg('先把滑杆拖到 ∠1 = 110°，再拖歪下线。'); return; }
      if (broken) { msg('已经拖歪了，再看一遍两个角。'); return; }
      broken = true;
      draw();
      var ok = guessed === LEVELS[levelIdx].ans;
      msg('下线歪了 10°：∠5 变成了 100°，∠1 还是 110°——线不平行了，同位角不再相等。判定反过来也一样：角不相等，线就不平行。' +
        (ok ? '你猜对了！' : '你刚才猜的是“' + LEVELS[levelIdx].opts[guessed] + '”，再看一遍两个角。'));
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：∠1 = ∠5 = 110°', '提高：∠1 = ∠5 = 65°', '挑战：拖歪后 ∠5 = 100°'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm711-aux',
  title: '辅助线法（拐点问题）',
  sub: '拐点模型“一折就求和”：过拐点作一条平行线，拐角被切成两块，每块都和旁边的角互补，加起来就是答案。',
  grade: 7,
  kind: '实验',
  points: ['7.11'],
  render: function (el) {
    var K = 'm711-aux';
    var LEVELS = [
      { label: '基础', a: 120, c: 130, p1: 60, p2: 50, ans: 110, q: '∠BAP 是 120°，∠PCD 是 130°，拐角 ∠APC 是几度？', opts: ['110°', '250°', '70°'], ansIdx: 0 },
      { label: '提高', a: 140, c: 150, p1: 40, p2: 30, ans: 70, q: '∠BAP 是 140°，∠PCD 是 150°，拐角 ∠APC 是几度？', opts: ['70°', '290°', '40°'], ansIdx: 0 },
      { label: '挑战', a: 105, c: 135, p1: 75, p2: 45, ans: 120, q: '∠BAP 是 105°，∠PCD 是 135°，拐角 ∠APC 是几度？', opts: ['120°', '240°', '75°'], ansIdx: 0 }
    ];
    var levelIdx = 0, guessed = -1, tiers = null, aux = false;
    el.innerHTML =
      '<p class="demo-tag">实验 · 7 年级 · 平行线与平移</p>' +
      '<h3>辅助线法（拐点问题）</h3>' +
      '<p>两条平行线中间拐了一道弯，拐角是多少度？直接量量不出来，作一条辅助线就通了：过拐点 P 作一条平行线，拐角被切成两块，每块都和它旁边的角互补。先猜，再作线。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 作辅助线：</p>' +
      '<div class="btn-row"><button class="btn small" id="' + K + '-aux-btn" type="button">过 P 作一条平行线</button></div>' +
      '<div id="' + K + '-svg"></div>' +
      '<p>示意图：角度按标注，形状不按比例。</p>' +
      '<p id="' + K + '-msg">先猜一猜，再点“过 P 作一条平行线”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 120° 和 130°</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 140° 和 150°</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 105° 和 135°</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都算对了，并且能说出“拐角等于 360° 减去两边的角”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[levelIdx];
      var s = '<svg viewBox="0 0 200 190" style="width:100%;max-width:420px">' +
        '<line x1="30" y1="40" x2="170" y2="40" stroke="#333" stroke-width="1.5"/>' +
        '<line x1="30" y1="160" x2="170" y2="160" stroke="#333" stroke-width="1.5"/>' +
        '<text x="172" y="44" font-size="12">B</text>' +
        '<text x="172" y="164" font-size="12">D</text>' +
        '<text x="22" y="44" font-size="12">A</text>' +
        '<text x="22" y="164" font-size="12">C</text>' +
        '<line x1="60" y1="40" x2="110" y2="100" stroke="#333" stroke-width="2"/>' +
        '<line x1="110" y1="100" x2="150" y2="160" stroke="#333" stroke-width="2"/>' +
        '<circle cx="60" cy="40" r="3" fill="#333"/>' +
        '<circle cx="110" cy="100" r="4" fill="#333"/>' +
        '<circle cx="150" cy="160" r="3" fill="#333"/>' +
        '<text x="56" y="28" font-size="12">P 在这里拐弯</text>' +
        '<text x="60" y="58" font-size="12">∠BAP ' + L.a + '°</text>' +
        '<text x="118" y="98" font-size="12">∠APC ？</text>' +
        '<text x="118" y="152" font-size="12">∠PCD ' + L.c + '°</text>';
      if (aux) {
        s += '<line x1="40" y1="100" x2="180" y2="100" stroke="#d33" stroke-width="2" stroke-dasharray="6 4"/>' +
          '<text x="44" y="94" font-size="12" fill="#d33">过 P 的平行线</text>' +
          '<text x="66" y="90" font-size="12">∠1 = ' + L.p1 + '°</text>' +
          '<text x="128" y="90" font-size="12">∠2 = ' + L.p2 + '°</text>';
      }
      s += '</svg>';
      gid(K + '-svg').innerHTML = s;
    }
    function setLevel(i) {
      levelIdx = i; guessed = -1; aux = false;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      msg('先猜一猜，再点“过 P 作一条平行线”。');
      draw();
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜 ' + LEVELS[levelIdx].opts[g] + '。作一条辅助线验证。');
        });
      })(g);
    }
    gid(K + '-aux-btn').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜拐角是几度。'); return; }
      if (aux) { msg('辅助线已经作好了，再看一遍两块角。'); return; }
      aux = true;
      draw();
      var L = LEVELS[levelIdx];
      var ok = guessed === L.ansIdx;
      msg('过 P 作一条平行线，拐角被切成两块：左边一块 180° − ' + L.a + '° = ' + L.p1 + '°（同旁内角互补），右边一块 180° − ' + L.c + '° = ' + L.p2 + '°，' + L.p1 + '° + ' + L.p2 + '° = ' + L.ans + '°。所以 ∠APC = ' + L.ans + '°。' +
        (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，拐角是两块加起来。'));
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：∠APC = 110°', '提高：∠APC = 70°', '挑战：∠APC = 120°'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm712-diag',
  title: '对角线定位法',
  sub: '边长 1 的正方形，对角线就是 √2：先有长度，再问它是不是分数——把对角线放下来，看它落在数轴的哪里。',
  grade: 7,
  kind: '模拟',
  points: ['7.12'],
  render: function (el) {
    var K = 'm712-diag';
    var LEVELS = [
      { label: '基础', w: 1, val: '√2', approx: '1.414', sq: 2, sqStr: '1.999396', lo: 1, hi: 2, q: '边长 1 的正方形，对角线 √2 落在数轴哪两个整数之间？', opts: ['1 和 2 之间', '2 和 3 之间', '0 和 1 之间'], ans: 0 },
      { label: '提高', w: 1, val: '√2', approx: '1.414', sq: 2, sqStr: '1.999396', lo: 1, hi: 2, q: '√2 大约是几？', opts: ['1.414', '1.732', '2.5'], ans: 0 },
      { label: '挑战', w: 2, val: '√5', approx: '2.236', sq: 5, sqStr: '4.999696', lo: 2, hi: 3, q: '1×2 长方形的对角线是 √5，它落在数轴哪两个整数之间？', opts: ['2 和 3 之间', '1 和 2 之间', '3 和 4 之间'], ans: 0 }
    ];
    var levelIdx = 0, guessed = -1, tiers = null, dropped = false;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 7 年级 · 实数</p>' +
      '<h3>对角线定位法</h3>' +
      '<p>√2 不是凭空编出来的数：边长是 1 的正方形，对角线长就是 √2。先猜它落在数轴的哪里，再把对角线“放下来”，看它落在哪个整数之间。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 放下来：</p>' +
      '<div class="btn-row"><button class="btn small" id="' + K + '-drop-btn" type="button">把对角线放下来</button></div>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再把对角线放下来。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · √2 落在哪</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · √2 约是几</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · √5 落在哪</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都放对了，并且能说出“√2 在数轴上有个确定的点，但写不成分数”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function draw() {
      var L = LEVELS[levelIdx];
      var U = 70, OX = 40, LY = 140;
      var r = U * Math.sqrt(L.w * L.w + 1);
      var landX = OX + r;
      var topX = OX + L.w * U, topY = LY - U;
      var s = '<svg viewBox="0 0 270 170" style="width:100%;max-width:480px">' +
        '<rect x="' + OX + '" y="' + topY + '" width="' + (L.w * U) + '" height="' + U + '" fill="#eef4ff" stroke="#333" stroke-width="1.5"/>' +
        '<line x1="' + OX + '" y1="' + LY + '" x2="' + topX + '" y2="' + topY + '" stroke="#d33" stroke-width="2.5"/>' +
        '<text x="' + ((OX + topX) / 2) + '" y="' + (topY - 6) + '" font-size="12" text-anchor="middle">对角线 ' + L.val + '</text>' +
        '<path d="M ' + topX + ' ' + topY + ' A ' + r.toFixed(1) + ' ' + r.toFixed(1) + ' 0 0 1 ' + landX.toFixed(1) + ' ' + LY + '" fill="none" stroke="#999" stroke-width="1.5" stroke-dasharray="5 3"/>' +
        '<line x1="20" y1="' + LY + '" x2="260" y2="' + LY + '" stroke="#333" stroke-width="1.5"/>';
      for (var i = 0; i <= 3; i++) {
        var tx = OX + i * U;
        s += '<line x1="' + tx + '" y1="' + (LY - 5) + '" x2="' + tx + '" y2="' + (LY + 5) + '" stroke="#333" stroke-width="1.5"/>' +
          '<text x="' + tx + '" y="' + (LY + 20) + '" font-size="12" text-anchor="middle">' + i + '</text>';
      }
      if (dropped) {
        s += '<circle cx="' + landX.toFixed(1) + '" cy="' + LY + '" r="5" fill="#d33"/>' +
          '<text x="' + landX.toFixed(1) + '" y="' + (LY - 12) + '" font-size="13" text-anchor="middle">' + L.val + ' ≈ ' + L.approx + '</text>';
      }
      s += '</svg>';
      gid(K + '-svg').innerHTML = s;
    }
    function setLevel(i) {
      levelIdx = i; guessed = -1; dropped = false;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      msg('先猜一猜，再把对角线放下来。');
      draw();
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜 ' + LEVELS[levelIdx].opts[g] + '。把对角线放下来验证。');
        });
      })(g);
    }
    gid(K + '-drop-btn').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜。'); return; }
      if (dropped) { msg('已经放下来了，再看一遍落点。'); return; }
      dropped = true;
      draw();
      var L = LEVELS[levelIdx];
      var ok = guessed === L.ans;
      msg('对角线放下来，落在 ' + L.approx + '：' + L.lo + ' < ' + L.val + ' < ' + L.hi + '。' +
        L.approx + '² = ' + L.sqStr + '，离 ' + L.sq + ' 只差一点点——它是个确定的长度，在数轴上有个确定的点，但永远写不成分数。' +
        (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再看一遍落点。'));
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：1 < √2 < 2', '提高：√2 ≈ 1.414', '挑战：2 < √5 < 3'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm712-contra',
  title: '反证法',
  sub: '√2 为什么不是分数？先假设它是，再推出矛盾——假设一错，结论就立住了。一步一步往下推。',
  grade: 7,
  kind: '演示',
  points: ['7.12'],
  render: function (el) {
    var K = 'm712-contra';
    var LEVELS = [
      { label: '基础', q: '√2 是有理数还是无理数？', opts: ['无理数', '有理数', '还不知道'], ans: 0, name: '√2',
        steps: ['假设 √2 是有理数：√2 = p/q，而且 p、q 已经约到最简，没有公因数。', '两边平方：p² = 2q²，所以 p² 是偶数，p 一定是偶数（奇数的平方还是奇数）。', '设 p = 2k，代回去：4k² = 2q²，q² = 2k²，所以 q 也是偶数。', 'p 和 q 都是偶数，和“已经最简”矛盾了——假设错了，√2 不是有理数。'] },
      { label: '提高', q: '√3 是有理数还是无理数？', opts: ['无理数', '有理数', '是分数'], ans: 0, name: '√3',
        steps: ['假设 √3 = p/q（p、q 最简）。', '平方：p² = 3q²，p² 是 3 的倍数，p 一定是 3 的倍数。', '设 p = 3k：9k² = 3q²，q² = 3k²，q 也是 3 的倍数。', 'p、q 都有因数 3，和“最简”矛盾——√3 是无理数。'] },
      { label: '挑战', q: '0.1010010001…（两个 1 之间 0 的个数每次加 1）是有理数吗？', opts: ['无理数', '有理数', '是循环小数'], ans: 0, name: '0.1010010001…',
        steps: ['先看它是不是循环小数：0 的个数 1、2、3、4…一直加下去，永远找不到一段重复的节。', '有理数一定能写成分数，也一定能化成有限小数或循环小数。', '这个小数无限又不循环，写不成分数。', '所以它也是无理数：无理数不止 √2 这一家。'] }
    ];
    var levelIdx = 0, stepIdx = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 7 年级 · 实数</p>' +
      '<h3>反证法</h3>' +
      '<p>怎么证明一个数“不是”分数？正面证不出来，就反过来：先假设它是分数，一步一步推，推到自相矛盾，假设就垮了。先猜，再往下推。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 往下推：</p>' +
      '<div class="btn-row"><button class="btn small" id="' + K + '-next-btn" type="button">往下推一步</button></div>' +
      '<div id="' + K + '-proof"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点“往下推一步”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · √2 是不是分数</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · √3 是不是分数</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 0.1010010001…</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都推完了，并且能说出“假设错了，所以它不是有理数”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function setLevel(i) {
      levelIdx = i; stepIdx = 0; guessed = -1;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-proof').innerHTML = '';
      msg('先猜一猜，再点“往下推一步”。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜 ' + LEVELS[levelIdx].opts[g] + '。往下推，看推理同不同意你。');
        });
      })(g);
    }
    gid(K + '-next-btn').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜。'); return; }
      var L = LEVELS[levelIdx];
      if (stepIdx >= L.steps.length) { msg('已经推完了，再看一遍上面的步骤。'); return; }
      var p = gid(K + '-proof');
      p.innerHTML = p.innerHTML + '<p>' + L.steps[stepIdx] + '</p>';
      stepIdx++;
      if (stepIdx >= L.steps.length) {
        var ok = guessed === L.ans;
        msg('推完了：' + L.name + ' 是无理数。' + (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，推理说它是无理数。'));
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('继续往下推。');
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：√2 是无理数', '提高：√3 是无理数', '挑战：0.1010010001… 是无理数'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm712-approx',
  title: '逼近法',
  sub: '√2 被越夹越紧，但永远够不着：1.4²、1.41²、1.414²……小数位越多，平方离 2 越近，差一点点就是差一点点。',
  grade: 7,
  kind: '模拟',
  points: ['7.12'],
  render: function (el) {
    var K = 'm712-approx';
    var LEVELS = [
      { label: '基础', idx: 0, q: '1.4² 是几？', opts: ['1.96', '2', '1.4'], ans: 0 },
      { label: '提高', idx: 1, q: '1.41² 是几？', opts: ['1.9881', '1.988', '2'], ans: 0 },
      { label: '挑战', idx: 2, q: '1.414² 是几？', opts: ['1.999396', '1.999', '2'], ans: 0 }
    ];
    var VALS = ['1.4', '1.41', '1.414', '1.4142'];
    var levelIdx = 0, idx = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 7 年级 · 实数</p>' +
      '<h3>逼近法</h3>' +
      '<p>√2 到底是多少？一位一位小数往下抠：1.4、1.41、1.414……平方一次比一次接近 2，但永远差那么一点点——这就是无理数“无限不循环”的意思。先猜，再拖滑杆加小数位。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 加小数位：滑杆从 1 位小数加到 4 位。</p>' +
      '<p><input type="range" id="' + K + '-slider" min="0" max="3" step="1" value="0" style="width:90%"> <b id="' + K + '-v">1.4</b></p>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-calc"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再拖滑杆。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 1 位小数</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 2 位小数</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 3 位小数</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都算对了，并且能说出“小数位越多越接近 2，但永远够不着”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function render() {
      var L = LEVELS[levelIdx];
      var v = parseFloat(VALS[idx]);
      var dec = 2 * (idx + 1);
      var sq = (v * v).toFixed(dec);
      var diff = (2 - v * v).toFixed(dec);
      gid(K + '-v').textContent = VALS[idx];
      gid(K + '-calc').textContent = '√2 ≈ ' + VALS[idx] + '，' + VALS[idx] + '² = ' + sq + '，离 2 还差 ' + diff + '。';
      var s = '<svg viewBox="0 0 200 70" style="width:100%;max-width:420px">' +
        '<line x1="20" y1="35" x2="180" y2="35" stroke="#333" stroke-width="1.5"/>' +
        '<text x="20" y="55" font-size="11" text-anchor="middle">1.40</text>' +
        '<text x="180" y="55" font-size="11" text-anchor="middle">1.42</text>';
      var marks = [1.4, 1.41, 1.414, 1.4142];
      for (var i = 0; i < 4; i++) {
        var mx = 20 + (marks[i] - 1.4) / 0.02 * 160;
        var on = i <= idx;
        s += '<circle cx="' + mx.toFixed(1) + '" cy="35" r="' + (i === idx ? 6 : 4) + '" fill="' + (on ? '#2a7' : '#ccc') + '" stroke="#333"/>';
        if (i === idx || i === 0) {
          s += '<text x="' + mx.toFixed(1) + '" y="20" font-size="10" text-anchor="middle">' + VALS[i] + '</text>';
        }
      }
      var rx = 20 + (Math.sqrt(2) - 1.4) / 0.02 * 160;
      s += '<line x1="' + rx.toFixed(1) + '" y1="12" x2="' + rx.toFixed(1) + '" y2="58" stroke="#d33" stroke-width="1.5" stroke-dasharray="4 3"/>' +
        '<text x="' + rx.toFixed(1) + '" y="68" font-size="11" text-anchor="middle" fill="#d33">√2 真身</text></svg>';
      gid(K + '-svg').innerHTML = s;
      if (idx === L.idx && guessed >= 0) {
        var ok = guessed === L.ans;
        msg(VALS[idx] + '² = ' + sq + '，离 2 只差 ' + diff + '——小数位越多，离 2 越近，但永远够不着 2：√2 写不成分数。' +
          (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再算一遍平方。'));
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      levelIdx = i; idx = 0; guessed = -1;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-slider').value = '0';
      msg('先猜一猜，再拖滑杆到 ' + (L.idx + 1) + ' 位小数。');
      render();
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜 ' + LEVELS[levelIdx].opts[g] + '。拖滑杆算一算平方。');
        });
      })(g);
    }
    gid(K + '-slider').addEventListener('input', function (e) {
      idx = parseInt(e.target.value, 10);
      if (guessed < 0) { msg('先猜一猜，再拖滑杆。'); return; }
      render();
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：1.4² = 1.96', '提高：1.41² = 1.9881', '挑战：1.414² = 1.999396'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm713-addr',
  title: '编地址法',
  sub: '坐标是点的地址：先横（沿走廊）再纵（上楼梯），(3, 2) 和 (2, 3) 是两个不同的门牌。',
  grade: 7,
  kind: '实验',
  points: ['7.13'],
  render: function (el) {
    var K = 'm713-addr';
    var LEVELS = [
      { label: '基础', tx: 3, ty: 2, q: '点 (3, 2) 怎么走？', opts: ['先向右 3，再向上 2', '先向右 2，再向上 3', '先向上 3，再向右 2'], ans: 0 },
      { label: '提高', tx: 2, ty: 3, q: '点 (2, 3) 怎么走？', opts: ['先向右 2，再向上 3', '先向右 3，再向上 2', '先向上 2，再向右 3'], ans: 0 },
      { label: '挑战', tx: -2, ty: 3, q: '点 (−2, 3) 怎么走？', opts: ['先向左 2，再向上 3', '先向右 2，再向上 3', '先向左 3，再向上 2'], ans: 0 }
    ];
    var levelIdx = 0, x = 0, y = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 7 年级 · 平面直角坐标系</p>' +
      '<h3>编地址法</h3>' +
      '<p>平面上的点也有地址：先说横着走几格（x），再说竖着走几格（y）。(3, 2) 就是“3 号走廊 2 楼的门”——顺序反了，门就找错了。先猜，再拖两个滑杆走到目标点。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 走过去：横着走是 x，竖着走是 y。</p>' +
      '<p>横着走 x：<input type="range" id="' + K + '-x" min="-5" max="5" step="1" value="0" style="width:60%"> <b id="' + K + '-xv">0</b></p>' +
      '<p>竖着走 y：<input type="range" id="' + K + '-y" min="-5" max="5" step="1" value="0" style="width:60%"> <b id="' + K + '-yv">0</b></p>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-addr"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再拖滑杆走过去。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 找 (3, 2)</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 找 (2, 3)</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 找 (−2, 3)</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都走到了目标点，并且能说出“先横后纵，顺序不能反”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function fmtN(n) { return String(n).replace('-', '−'); }
    function render() {
      gid(K + '-xv').textContent = String(x);
      gid(K + '-yv').textContent = String(y);
      gid(K + '-addr').textContent = '现在在 (' + fmtN(x) + ', ' + fmtN(y) + ')' + '——' + (x >= 0 ? '向右 ' : '向左 ') + Math.abs(x) + '、' + (y >= 0 ? '向上 ' : '向下 ') + Math.abs(y) + '。';
      var s = '<svg viewBox="0 0 220 180" style="width:100%;max-width:440px">';
      for (var i = -5; i <= 5; i++) {
        s += '<line x1="' + (110 + 16 * i) + '" y1="10" x2="' + (110 + 16 * i) + '" y2="170" stroke="#eee" stroke-width="1"/>' +
          '<line x1="30" y1="' + (90 - 16 * i) + '" x2="190" y2="' + (90 - 16 * i) + '" stroke="#eee" stroke-width="1"/>';
      }
      s += '<line x1="30" y1="90" x2="190" y2="90" stroke="#333" stroke-width="1.5"/>' +
        '<line x1="110" y1="10" x2="110" y2="170" stroke="#333" stroke-width="1.5"/>' +
        '<text x="186" y="82" font-size="12">x</text>' +
        '<text x="116" y="18" font-size="12">y</text>' +
        '<circle cx="' + (110 + 16 * x) + '" cy="' + (90 - 16 * y) + '" r="6" fill="#d33"/>' +
        '<text x="' + (110 + 16 * x) + '" y="' + (90 - 16 * y - 10) + '" font-size="12" text-anchor="middle">(' + fmtN(x) + ', ' + fmtN(y) + ')</text>' +
        '</svg>';
      gid(K + '-svg').innerHTML = s;
      var L = LEVELS[levelIdx];
      if (x === L.tx && y === L.ty && guessed >= 0) {
        var ok = guessed === L.ans;
        msg('到了 (' + fmtN(L.tx) + ', ' + fmtN(L.ty) + ')：先横后纵，(' + fmtN(L.tx) + ', ' + fmtN(L.ty) + ') 和 (' + fmtN(L.ty) + ', ' + fmtN(L.tx) + ') 是两个不同的门牌号。' +
          (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再走一遍：先横再纵。'));
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      levelIdx = i; x = 0; y = 0; guessed = -1;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-x').value = '0';
      gid(K + '-y').value = '0';
      msg('先猜一猜，再拖滑杆走到 (' + L.tx + ', ' + L.ty + ')。');
      render();
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜 ' + LEVELS[levelIdx].opts[g] + '。拖滑杆走过去验证。');
        });
      })(g);
    }
    gid(K + '-x').addEventListener('input', function (e) {
      x = parseInt(e.target.value, 10);
      if (guessed < 0) { msg('先猜一猜，再拖滑杆。'); return; }
      render();
    });
    gid(K + '-y').addEventListener('input', function (e) {
      y = parseInt(e.target.value, 10);
      if (guessed < 0) { msg('先猜一猜，再拖滑杆。'); return; }
      render();
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：走到 (3, 2)', '提高：走到 (2, 3)', '挑战：走到 (−2, 3)'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm713-quad',
  title: '象限符号法',
  sub: 'x、y 的正负号一组合，就知道点在哪个象限：符号表一查就定位，不用一格一格数。',
  grade: 7,
  kind: '模拟',
  points: ['7.13'],
  render: function (el) {
    var K = 'm713-quad';
    var LEVELS = [
      { label: '基础', tx: 3, ty: 2, quad: '一', signs: '(+, +)', start: [-3, -2], q: '点 (3, 2) 在第几象限？', opts: ['第一象限', '第二象限', '第四象限'], ans: 0 },
      { label: '提高', tx: -2, ty: 3, quad: '二', signs: '(−, +)', start: [2, -3], q: '点 (−2, 3) 在第几象限？', opts: ['第二象限', '第一象限', '第三象限'], ans: 0 },
      { label: '挑战', tx: 2, ty: -4, quad: '四', signs: '(+, −)', start: [-2, 4], q: '点 (2, −4) 在第几象限？', opts: ['第四象限', '第二象限', '第一象限'], ans: 0 }
    ];
    var levelIdx = 0, cx = -3, cy = -2, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 7 年级 · 平面直角坐标系</p>' +
      '<h3>象限符号法</h3>' +
      '<p>平面被两条轴分成四个象限，每个象限里 x、y 的正负号都是固定的：先猜目标点在第几象限，再按“x 变号”“y 变号”把点翻到那个象限。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 翻过去：点一个按钮，点就翻到对面。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small" id="' + K + '-flipx-btn" type="button">x 变号</button>' +
      '<button class="btn small" id="' + K + '-flipy-btn" type="button">y 变号</button></div>' +
      '<div id="' + K + '-svg"></div>' +
      '<p>第一象限 (+, +)　第二象限 (−, +)　第三象限 (−, −)　第四象限 (+, −)</p>' +
      '<p id="' + K + '-now"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再按按钮翻点。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · (3, 2)</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · (−2, 3)</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · (2, −4)</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都翻对了，并且能说出“符号一组合，象限就定了”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function fmtN(n) { return String(n).replace('-', '−'); }
    function quadOf(a, b) {
      if (a > 0 && b > 0) return '一';
      if (a < 0 && b > 0) return '二';
      if (a < 0 && b < 0) return '三';
      return '四';
    }
    function render() {
      var q = quadOf(cx, cy);
      gid(K + '-now').textContent = '现在点是 (' + fmtN(cx) + ', ' + fmtN(cy) + ')，在第' + q + '象限。';
      var s = '<svg viewBox="0 0 200 200" style="width:100%;max-width:420px">' +
        '<line x1="10" y1="100" x2="190" y2="100" stroke="#333" stroke-width="1.5"/>' +
        '<line x1="100" y1="10" x2="100" y2="190" stroke="#333" stroke-width="1.5"/>' +
        '<text x="168" y="32" font-size="13">一</text>' +
        '<text x="28" y="32" font-size="13">二</text>' +
        '<text x="28" y="172" font-size="13">三</text>' +
        '<text x="168" y="172" font-size="13">四</text>' +
        '<circle cx="' + (100 + 18 * cx) + '" cy="' + (100 - 18 * cy) + '" r="7" fill="#d33"/>' +
        '<text x="' + (100 + 18 * cx) + '" y="' + (100 - 18 * cy - 12) + '" font-size="12" text-anchor="middle">(' + fmtN(cx) + ', ' + fmtN(cy) + ')</text>' +
        '</svg>';
      gid(K + '-svg').innerHTML = s;
      var L = LEVELS[levelIdx];
      if (cx === L.tx && cy === L.ty && guessed >= 0) {
        var ok = guessed === L.ans;
        msg('(' + fmtN(L.tx) + ', ' + fmtN(L.ty) + ')：x 是' + (L.tx > 0 ? '正' : '负') + '、y 是' + (L.ty > 0 ? '正' : '负') + ' → 第' + L.quad + '象限 ' + L.signs + '。符号一组合，象限就定了。' +
          (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再查一遍符号表。'));
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      levelIdx = i; guessed = -1;
      var L = LEVELS[i];
      cx = L.start[0]; cy = L.start[1];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      msg('先猜一猜，再按按钮把点翻到 (' + L.tx + ', ' + L.ty + ') 所在的象限。');
      render();
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜 ' + LEVELS[levelIdx].opts[g] + '。翻点验证一下。');
        });
      })(g);
    }
    gid(K + '-flipx-btn').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜。'); return; }
      cx = -cx;
      render();
    });
    gid(K + '-flipy-btn').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜。'); return; }
      cy = -cy;
      render();
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：(3, 2) 在第一象限', '提高：(−2, 3) 在第二象限', '挑战：(2, −4) 在第四象限'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm713-sym',
  title: '对称跳点法',
  sub: '对称点像跳过去：关于 x 轴，横坐标不变、纵坐标变号；关于 y 轴反过来；关于原点，两个都变号。',
  grade: 7,
  kind: '实验',
  points: ['7.13'],
  render: function (el) {
    var K = 'm713-sym';
    var LEVELS = [
      { label: '基础', axis: 'x 轴', tx: 3, ty: -2, q: '点 A(3, 2) 关于 x 轴对称的点是？', opts: ['(3, −2)', '(−3, 2)', '(−3, −2)'], ans: 0, note: '关于 x 轴：横坐标不变，纵坐标变号。' },
      { label: '提高', axis: 'y 轴', tx: -3, ty: 2, q: '点 A(3, 2) 关于 y 轴对称的点是？', opts: ['(−3, 2)', '(3, −2)', '(−3, −2)'], ans: 0, note: '关于 y 轴：纵坐标不变，横坐标变号。' },
      { label: '挑战', axis: '原点', tx: -3, ty: -2, q: '点 A(3, 2) 关于原点对称的点是？', opts: ['(−3, −2)', '(3, −2)', '(−3, 2)'], ans: 0, note: '关于原点：横、纵坐标都变号。' }
    ];
    var levelIdx = 0, guessed = -1, tiers = null, jumped = false;
    el.innerHTML =
      '<p class="demo-tag">实验 · 7 年级 · 平面直角坐标系</p>' +
      '<h3>对称跳点法</h3>' +
      '<p>对称点不是算出来的，是“跳”过去的：镜子在哪边，点就往哪边跳——跳过去的点和原来的点到镜子的距离一样。先猜，再跳。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 跳过去：</p>' +
      '<div class="btn-row"><button class="btn small" id="' + K + '-jump-btn" type="button"></button></div>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点“跳过去”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 关于 x 轴</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 关于 y 轴</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 关于原点</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都跳对了，并且能说出“关于谁对称，谁就变号”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function fmtN(n) { return String(n).replace('-', '−'); }
    function draw() {
      var L = LEVELS[levelIdx];
      var ax = 100 + 18 * 3, ay = 100 - 18 * 2;
      var bx = 100 + 18 * L.tx, by = 100 - 18 * L.ty;
      var s = '<svg viewBox="0 0 200 200" style="width:100%;max-width:420px">' +
        '<line x1="10" y1="100" x2="190" y2="100" stroke="#333" stroke-width="1.5"/>' +
        '<line x1="100" y1="10" x2="100" y2="190" stroke="#333" stroke-width="1.5"/>';
      if (L.axis === 'x 轴') s += '<line x1="10" y1="100" x2="190" y2="100" stroke="#f80" stroke-width="4"/>';
      if (L.axis === 'y 轴') s += '<line x1="100" y1="10" x2="100" y2="190" stroke="#f80" stroke-width="4"/>';
      s += '<circle cx="' + ax + '" cy="' + ay + '" r="6" fill="#2a7"/>' +
        '<text x="' + ax + '" y="' + (ay - 10) + '" font-size="12" text-anchor="middle">A(3, 2)</text>';
      if (jumped) {
        s += '<line x1="' + ax + '" y1="' + ay + '" x2="' + bx + '" y2="' + by + '" stroke="#d33" stroke-width="1.5" stroke-dasharray="5 3"/>' +
          '<circle cx="' + bx + '" cy="' + by + '" r="6" fill="#d33"/>' +
          '<text x="' + bx + '" y="' + (by - 10) + '" font-size="12" text-anchor="middle">A′(' + fmtN(L.tx) + ', ' + fmtN(L.ty) + ')</text>';
      }
      s += '</svg>';
      gid(K + '-svg').innerHTML = s;
    }
    function setLevel(i) {
      levelIdx = i; guessed = -1; jumped = false;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-jump-btn').textContent = '关于' + L.axis + '跳过去';
      msg('先猜一猜，再点“关于' + L.axis + '跳过去”。');
      draw();
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜 ' + LEVELS[levelIdx].opts[g] + '。跳过去验证。');
        });
      })(g);
    }
    gid(K + '-jump-btn').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜。'); return; }
      if (jumped) { msg('已经跳过去了，再看一遍两个点。'); return; }
      jumped = true;
      draw();
      var L = LEVELS[levelIdx];
      var ok = guessed === L.ans;
      msg('跳过去了：A(3, 2) 关于' + L.axis + '的对称点是 (' + fmtN(L.tx) + ', ' + fmtN(L.ty) + ')。' + L.note +
        (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再想想谁变号。'));
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：关于 x 轴是 (3, −2)', '提高：关于 y 轴是 (−3, 2)', '挑战：关于原点是 (−3, −2)'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm714-graph',
  title: '图像交点法',
  sub: '方程组的解就是两条直线的交点：拖动直线，交点跟着跑；平行就无解，重合就有无数解。',
  grade: 7,
  kind: '模拟',
  points: ['7.14'],
  render: function (el) {
    var K = 'm714-graph';
    var LEVELS = [
      { label: '基础', c1: 5, b: -1, mode: 'cross', q: '方程组 x + y = 5，x − y = 1 的解是？', opts: ['(3, 2)', '(2, 3)', '(5, 1)'], ans: 0, note: '两条直线交于 (3, 2)，交点坐标就是方程组的解：3 + 2 = 5，3 − 2 = 1，两边都对得上。' },
      { label: '提高', c1: 7, b: -3, mode: 'cross', q: '方程组 x + y = 7，x − y = 3 的解是？', opts: ['(5, 2)', '(2, 5)', '(7, 3)'], ans: 0, note: '交点 (5, 2)：5 + 2 = 7，5 − 2 = 3，两边都对得上。' },
      { label: '挑战', c1: 4, b: 6, mode: 'parallel', q: '方程组 x + y = 4，x + y = 6 有几组解？', opts: ['0 组', '1 组', '无数多组'], ans: 0, note: '两条直线平行：斜率都是 −1，截距 4 和 6 不一样，永不相交，方程组无解。' }
    ];
    var levelIdx = 0, b = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 7 年级 · 二元一次方程组与消元</p>' +
      '<h3>图像交点法</h3>' +
      '<p>一个二元一次方程就是一条直线，方程组的解就是两条直线的交点。先猜交点在哪，再拖滑杆移动第二条直线、看着交点跑。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 拖一拖：滑杆移动第二条直线。</p>' +
      '<p><input type="range" id="' + K + '-slider" min="-5" max="3" step="1" value="0" style="width:90%"> <b id="' + K + '-v"></b></p>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-cross"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再拖滑杆。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · x + y = 5</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · x + y = 7</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 平行无解</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都找到交点（或确认无解），并且能说出“交点坐标就是方程组的解”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function fmt(v) {
      var r = Math.round(v * 10) / 10;
      return String(r);
    }
    function px(x) { return 40 + 13 * x; }
    function py(y) { return 135 - 13 * y; }
    function render() {
      var L = LEVELS[levelIdx];
      gid(K + '-v').textContent = L.mode === 'cross' ? '第二条直线：y = x + (' + b + ')' : '第二条直线：y = −x + ' + b;
      var s = '<svg viewBox="0 0 180 180" style="width:100%;max-width:420px">';
      var i;
      for (i = -1; i <= 6; i++) {
        s += '<line x1="' + px(i) + '" y1="5" x2="' + px(i) + '" y2="175" stroke="#eee" stroke-width="1"/>';
      }
      for (i = -2; i <= 9; i++) {
        s += '<line x1="5" y1="' + py(i) + '" x2="175" y2="' + py(i) + '" stroke="#eee" stroke-width="1"/>';
      }
      s += '<line x1="12" y1="135" x2="175" y2="135" stroke="#333" stroke-width="1.5"/>' +
        '<line x1="40" y1="5" x2="40" y2="168" stroke="#333" stroke-width="1.5"/>' +
        '<text x="170" y="128" font-size="11">x</text>' +
        '<text x="46" y="12" font-size="11">y</text>';
      var x0 = -2, x1 = 6;
      s += '<line x1="' + px(x0) + '" y1="' + py(-x0 + L.c1) + '" x2="' + px(x1) + '" y2="' + py(-x1 + L.c1) + '" stroke="#2a7" stroke-width="2"/>' +
        '<text x="' + (px(x1) - 4) + '" y="' + (py(-x1 + L.c1) - 6) + '" font-size="11">y = −x + ' + L.c1 + '</text>';
      var crossTxt;
      if (L.mode === 'cross') {
        var y0 = 0, y1 = 6;
        s += '<line x1="' + px(y0) + '" y1="' + py(y0 + b) + '" x2="' + px(y1) + '" y2="' + py(y1 + b) + '" stroke="#d33" stroke-width="2"/>' +
          '<text x="' + (px(y1) - 4) + '" y="' + (py(y1 + b) + 14) + '" font-size="11">y = x + (' + b + ')</text>';
        var ix = (L.c1 - b) / 2, iy = (L.c1 + b) / 2;
        s += '<circle cx="' + px(ix) + '" cy="' + py(iy) + '" r="5" fill="#f80"/>' +
          '<text x="' + px(ix) + '" y="' + (py(iy) - 10) + '" font-size="12" text-anchor="middle">(' + fmt(ix) + ', ' + fmt(iy) + ')</text>';
        crossTxt = '交点 (' + fmt(ix) + ', ' + fmt(iy) + ')';
      } else {
        s += '<line x1="' + px(x0) + '" y1="' + py(-x0 + b) + '" x2="' + px(x1) + '" y2="' + py(-x1 + b) + '" stroke="#d33" stroke-width="2"/>' +
          '<text x="' + (px(x1) - 4) + '" y="' + (py(-x1 + b) - 6) + '" font-size="11">y = −x + ' + b + '</text>';
        crossTxt = b === L.c1 ? '两条直线重合：无数多组解' : '两条直线平行：没有交点';
      }
      s += '</svg>';
      gid(K + '-svg').innerHTML = s;
      gid(K + '-cross').textContent = crossTxt;
      if (b === L.b && guessed >= 0) {
        var ok = guessed === L.ans;
        msg(L.note + (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再看一遍交点。'));
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      }
    }
    function setLevel(i) {
      levelIdx = i; guessed = -1;
      var L = LEVELS[i];
      b = L.mode === 'cross' ? 0 : 2;
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var bj = gid(K + '-level-' + j);
        if (bj) bj.setAttribute('aria-pressed', String(j === i));
      }
      var sl = gid(K + '-slider');
      if (L.mode === 'cross') { sl.min = '-5'; sl.max = '3'; }
      else { sl.min = '0'; sl.max = '8'; }
      sl.value = String(b);
      msg('先猜一猜，再拖滑杆移动第二条直线。');
      render();
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜 ' + LEVELS[levelIdx].opts[g] + '。拖滑杆、看着交点跑。');
        });
      })(g);
    }
    gid(K + '-slider').addEventListener('input', function (e) {
      b = parseInt(e.target.value, 10);
      if (guessed < 0) { msg('先猜一猜，再拖滑杆。'); return; }
      render();
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：交点 (3, 2)', '提高：交点 (5, 2)', '挑战：平行，无解'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm714-subst',
  title: '代入消元法',
  sub: '把一个方程变形成 y = …，代进另一个方程，两个未知数变一个——消元就是把两个未知数的问题变成一个未知数的问题。',
  grade: 7,
  kind: '演示',
  points: ['7.14'],
  render: function (el) {
    var K = 'm714-subst';
    var LEVELS = [
      { label: '基础', q: '方程组 x + y = 9，x = 2y 的解是？', opts: ['(6, 3)', '(3, 6)', '(9, 2)'], ans: 0,
        steps: ['把 x = 2y 代进 x + y = 9：2y + y = 9。', '合并：3y = 9，y = 3。', '代回去：x = 2 × 3 = 6。解是 (6, 3)：6 + 3 = 9，6 = 2 × 3，都对得上。'] },
      { label: '提高', q: '方程组 x + y = 12，y = 2x 的解是？', opts: ['(4, 8)', '(8, 4)', '(6, 6)'], ans: 0,
        steps: ['把 y = 2x 代进 x + y = 12：x + 2x = 12。', '合并：3x = 12，x = 4。', '代回去：y = 2 × 4 = 8。解是 (4, 8)。'] },
      { label: '挑战', q: '方程组 2x + y = 11，y = x − 1 的解是？', opts: ['(4, 3)', '(3, 4)', '(5, 6)'], ans: 0,
        steps: ['把 y = x − 1 代进 2x + y = 11：2x + (x − 1) = 11。', '合并：3x − 1 = 11，3x = 12，x = 4。', '代回去：y = 4 − 1 = 3。解是 (4, 3)。'] }
    ];
    var levelIdx = 0, stepIdx = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 7 年级 · 二元一次方程组与消元</p>' +
      '<h3>代入消元法</h3>' +
      '<p>两个未知数，一个一个来：先把一个方程里的一个未知数用另一个表示出来，代进另一个方程，未知数就少了一个。先猜解是哪个，再一步一步代。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 代进去：</p>' +
      '<div class="btn-row"><button class="btn small" id="' + K + '-next-btn" type="button">下一步</button></div>' +
      '<div id="' + K + '-steps"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点“下一步”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · x = 2y</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · y = 2x</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · y = x − 1</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都代对了，并且能说出“代进去，未知数就少了一个”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function setLevel(i) {
      levelIdx = i; stepIdx = 0; guessed = -1;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-steps').innerHTML = '';
      msg('先猜一猜，再点“下一步”。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜 ' + LEVELS[levelIdx].opts[g] + '。一步一步代进去验证。');
        });
      })(g);
    }
    gid(K + '-next-btn').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜。'); return; }
      var L = LEVELS[levelIdx];
      if (stepIdx >= L.steps.length) { msg('已经算完了，再看一遍上面的步骤。'); return; }
      var p = gid(K + '-steps');
      p.innerHTML = p.innerHTML + '<p>' + L.steps[stepIdx] + '</p>';
      stepIdx++;
      if (stepIdx >= L.steps.length) {
        var ok = guessed === L.ans;
        msg('算完了：' + L.steps[2] + (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再代一遍。'));
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('继续下一步。');
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：解是 (6, 3)', '提高：解是 (4, 8)', '挑战：解是 (4, 3)'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm714-elim',
  title: '加减消元法',
  sub: '两方程相加或相减，一个未知数直接抵消——天平两边同加的升级版：两架天平拼成一架。',
  grade: 7,
  kind: '实验',
  points: ['7.14'],
  render: function (el) {
    var K = 'm714-elim';
    var LEVELS = [
      { label: '基础', q: '方程组 x + y = 7，x − y = 3 的解是？', opts: ['(5, 2)', '(2, 5)', '(7, 3)'], ans: 0,
        steps: ['两式相加：(x + y) + (x − y) = 7 + 3，y 和 −y 抵消了，2x = 10。', 'x = 5。', '把 x = 5 代回 x + y = 7：y = 2。解是 (5, 2)。'] },
      { label: '提高', q: '方程组 x + 2y = 11，x − y = 2 的解是？', opts: ['(5, 3)', '(3, 5)', '(11, 2)'], ans: 0,
        steps: ['两式相减：(x + 2y) − (x − y) = 11 − 2，x 抵消了，3y = 9。', 'y = 3。', '把 y = 3 代回 x − y = 2：x = 5。解是 (5, 3)。'] },
      { label: '挑战', q: '方程组 3x + y = 14，x + y = 6 的解是？', opts: ['(4, 2)', '(2, 4)', '(6, 0)'], ans: 0,
        steps: ['两式相减：(3x + y) − (x + y) = 14 − 6，y 抵消了，2x = 8。', 'x = 4。', '把 x = 4 代回 x + y = 6：y = 2。解是 (4, 2)。'] }
    ];
    var levelIdx = 0, stepIdx = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">实验 · 7 年级 · 二元一次方程组与消元</p>' +
      '<h3>加减消元法</h3>' +
      '<p>两个方程摞在一起，相加或相减：系数互为相反数的那一项自己抵消了，两个未知数就剩一个。先猜解是哪个，再一步一步消。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 相加或相减：</p>' +
      '<div class="btn-row"><button class="btn small" id="' + K + '-next-btn" type="button">下一步</button></div>' +
      '<div id="' + K + '-steps"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点“下一步”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 相加消 y</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 相减消 x</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 相减消 y</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都消对了，并且能说出“相加或相减，消掉一个未知数”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function setLevel(i) {
      levelIdx = i; stepIdx = 0; guessed = -1;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-steps').innerHTML = '';
      msg('先猜一猜，再点“下一步”。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜 ' + LEVELS[levelIdx].opts[g] + '。一步一步消元验证。');
        });
      })(g);
    }
    gid(K + '-next-btn').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜。'); return; }
      var L = LEVELS[levelIdx];
      if (stepIdx >= L.steps.length) { msg('已经算完了，再看一遍上面的步骤。'); return; }
      var p = gid(K + '-steps');
      p.innerHTML = p.innerHTML + '<p>' + L.steps[stepIdx] + '</p>';
      stepIdx++;
      if (stepIdx >= L.steps.length) {
        var ok = guessed === L.ans;
        msg('算完了：' + L.steps[2] + (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再消一遍。'));
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('继续下一步。');
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：解是 (5, 2)', '提高：解是 (5, 3)', '挑战：解是 (4, 2)'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm715-seg',
  title: '数轴画段法',
  sub: '不等式的解是一段区间不是一个数：空心不含端点、实心含端点、阴影是解集——画出来，再代值验算。',
  grade: 7,
  kind: '模拟',
  points: ['7.15'],
  render: function (el) {
    var K = 'm715-seg';
    var LEVELS = [
      { label: '基础', kind: 'gt', end: 3, open: true, dir: 'right', q: 'x > 3 的解集画在哪边？', opts: ['3 右边所有的数', '3 左边所有的数', '只有 3 自己'], ans: 0, note: 'x > 3：3 不算（空心圈），3 右边所有的数都算。', t0: 4, t1: 2 },
      { label: '提高', kind: 'ge', end: -2, open: false, dir: 'right', q: 'x ≥ −2 的端点 −2 包不包括？', opts: ['包括（实心点）', '不包括（空心圈）', '都行'], ans: 0, note: 'x ≥ −2：−2 算（实心点），−2 右边所有的数都算。', t0: -2, t1: -3 },
      { label: '挑战', kind: 'lt', end: 1, open: true, dir: 'left', q: 'x < 1 的解集画在哪边？', opts: ['1 左边所有的数', '1 右边所有的数', '只有 1 自己'], ans: 0, note: 'x < 1：1 不算（空心圈），1 左边所有的数都算。', t0: 0, t1: 2 }
    ];
    var levelIdx = 0, guessed = -1, tiers = null, drawn = false;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 7 年级 · 不等式与一元一次不等式组</p>' +
      '<h3>数轴画段法</h3>' +
      '<p>方程的解是一个数，不等式的解是一段：先在数轴上定端点（空心还是实心），再往解的方向涂阴影，最后代两个值验算。先猜，再画。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 画解集：</p>' +
      '<div class="btn-row">' +
      '<button class="btn small" id="' + K + '-draw-btn" type="button">画解集</button>' +
      '<button class="btn small" id="' + K + '-test-0" type="button"></button>' +
      '<button class="btn small" id="' + K + '-test-1" type="button"></button></div>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点“画解集”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · x > 3</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · x ≥ −2</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · x < 1</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都画对了，并且能说出“空心不含端点，实心含端点”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function fmtN(n) { return String(n).replace('-', '−'); }
    function nx(v) { return 20 + (v + 5) * 18; }
    function ineqText(v) {
      var L = LEVELS[levelIdx];
      if (L.kind === 'gt') return fmtN(v) + ' > ' + fmtN(L.end);
      if (L.kind === 'ge') return fmtN(v) + ' ≥ ' + fmtN(L.end);
      return fmtN(v) + ' < ' + fmtN(L.end);
    }
    function inSet(v) {
      var L = LEVELS[levelIdx];
      if (L.kind === 'gt') return v > L.end;
      if (L.kind === 'ge') return v >= L.end;
      return v < L.end;
    }
    function draw() {
      var L = LEVELS[levelIdx];
      var s = '<svg viewBox="0 0 220 70" style="width:100%;max-width:440px">' +
        '<line x1="10" y1="35" x2="210" y2="35" stroke="#333" stroke-width="1.5"/>';
      for (var i = -5; i <= 5; i++) {
        s += '<line x1="' + nx(i) + '" y1="30" x2="' + nx(i) + '" y2="40" stroke="#333" stroke-width="1"/>' +
          '<text x="' + nx(i) + '" y="56" font-size="11" text-anchor="middle">' + i + '</text>';
      }
      if (drawn) {
        var ex = nx(L.end);
        if (L.dir === 'right') s += '<rect x="' + ex + '" y="29" width="' + (210 - ex) + '" height="12" fill="#7fb3ff" opacity="0.5"/>';
        else s += '<rect x="10" y="29" width="' + (ex - 10) + '" height="12" fill="#7fb3ff" opacity="0.5"/>';
        s += '<circle cx="' + ex + '" cy="35" r="6" fill="' + (L.open ? '#fff' : '#333') + '" stroke="#333" stroke-width="2"/>';
      }
      s += '</svg>';
      gid(K + '-svg').innerHTML = s;
    }
    function setLevel(i) {
      levelIdx = i; guessed = -1; drawn = false;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-test-0').textContent = '代 ' + L.t0 + ' 试试';
      gid(K + '-test-1').textContent = '代 ' + L.t1 + ' 试试';
      msg('先猜一猜，再点“画解集”。');
      draw();
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜 ' + LEVELS[levelIdx].opts[g] + '。画出来验证。');
        });
      })(g);
    }
    gid(K + '-draw-btn').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜。'); return; }
      if (drawn) { msg('已经画好了，再看一遍端点和阴影。'); return; }
      drawn = true;
      draw();
      var L = LEVELS[levelIdx];
      var ok = guessed === L.ans;
      msg(L.note + (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再看一遍端点是空心还是实心、阴影往哪边。'));
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    });
    function testVal(v) {
      if (!drawn) { msg('先把解集画出来，再代值验算。'); return; }
      var ok = inSet(v);
      msg('把 ' + fmtN(v) + ' 代回去：' + ineqText(v) + (ok ? ' 成立，' : ' 不成立，') + fmtN(v) + (ok ? ' 在解集里。' : ' 不在解集里。'));
    }
    gid(K + '-test-0').addEventListener('click', function () { testVal(LEVELS[levelIdx].t0); });
    gid(K + '-test-1').addEventListener('click', function () { testVal(LEVELS[levelIdx].t1); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：x > 3，空心向右', '提高：x ≥ −2，实心向右', '挑战：x < 1，空心向左'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm715-flip',
  title: '翻面验证法',
  sub: '乘除负数要变向：拿 3 < 5 试，两边同乘 −1 得 −3 和 −5，−3 在数轴右边，所以 −3 > −5——方向翻了才对。',
  grade: 7,
  kind: '实验',
  points: ['7.15'],
  render: function (el) {
    var K = 'm715-flip';
    var LEVELS = [
      { label: '基础', pic: 'flip', q: '3 < 5，两边同乘 −1，−3 和 −5 谁大？', opts: ['−3 > −5', '−3 < −5', '−3 = −5'], ans: 0, action: '两边同乘 −1', before: [[3, '3'], [5, '5']], after: [[-3, '−3'], [-5, '−5']], note: '乘了负数，不等号翻向：−3 在数轴上比 −5 靠右，所以 −3 > −5。' },
      { label: '提高', pic: 'flip', q: '−2 < 4，两边同乘 −2，4 和 −8 谁大？', opts: ['4 > −8', '4 < −8', '4 = −8'], ans: 0, action: '两边同乘 −2', before: [[-2, '−2'], [4, '4']], after: [[4, '4'], [-8, '−8']], note: '−2 × (−2) = 4，4 × (−2) = −8：4 > −8，方向翻了。' },
      { label: '挑战', pic: 'interval', q: '解 −2x > 6，x 的范围是？', opts: ['x < −3', 'x > −3', 'x = −3'], ans: 0, action: '两边同除 −2（翻向）', before: [], after: [], note: '两边同除 −2，不等号翻向：x < −3。验算：x = −4 时 −2 × (−4) = 8 > 6，成立；x = 0 时 0 > 6，不成立。' }
    ];
    var levelIdx = 0, guessed = -1, tiers = null, flipped = false;
    el.innerHTML =
      '<p class="demo-tag">实验 · 7 年级 · 不等式与一元一次不等式组</p>' +
      '<h3>翻面验证法</h3>' +
      '<p>解不等式和解方程差不多，只有一处不一样：两边同乘（或除以）一个负数，不等号要变方向。先猜，再动手翻一次、看数轴上的位置怎么变。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 翻一翻：</p>' +
      '<div class="btn-row"><button class="btn small" id="' + K + '-act-btn" type="button"></button></div>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点按钮翻一翻。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 3 < 5 乘 −1</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · −2 < 4 乘 −2</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 解 −2x > 6</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都翻对了，并且能说出“乘除负数，不等号要变向”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function nx(v) { return 110 + 12 * v; }
    function numline(y, dots, label) {
      var s = '<line x1="10" y1="' + y + '" x2="200" y2="' + y + '" stroke="#333" stroke-width="1.5"/>' +
        '<text x="10" y="' + (y - 10) + '" font-size="11">' + label + '</text>';
      for (var i = -9; i <= 6; i++) {
        s += '<line x1="' + nx(i) + '" y1="' + (y - 4) + '" x2="' + nx(i) + '" y2="' + (y + 4) + '" stroke="#333" stroke-width="1"/>';
      }
      for (var j = 0; j < dots.length; j++) {
        var dx = nx(dots[j][0]);
        s += '<circle cx="' + dx + '" cy="' + y + '" r="5" fill="#d33"/>' +
          '<text x="' + dx + '" y="' + (y + 16) + '" font-size="11" text-anchor="middle">' + dots[j][1] + '</text>';
      }
      return s;
    }
    function draw() {
      var L = LEVELS[levelIdx];
      var s = '<svg viewBox="0 0 210 130" style="width:100%;max-width:440px">';
      if (L.pic === 'flip') {
        s += numline(30, L.before, '翻之前');
        if (flipped) s += numline(90, L.after, '翻之后');
        else s += '<text x="105" y="90" font-size="12" text-anchor="middle">点按钮，看两个数翻到哪里</text>';
      } else {
        s += numline(30, [[-3, '−3']], '分界点 −3');
        if (flipped) {
          s += '<rect x="10" y="64" width="' + (nx(-3) - 10) + '" height="12" fill="#7fb3ff" opacity="0.5"/>' +
            '<circle cx="' + nx(-3) + '" cy="70" r="6" fill="#fff" stroke="#333" stroke-width="2"/>' +
            '<line x1="10" y1="70" x2="200" y2="70" stroke="#333" stroke-width="1.5"/>' +
            '<circle cx="' + nx(-4) + '" cy="70" r="5" fill="#2a7"/>' +
            '<text x="' + nx(-4) + '" y="88" font-size="11" text-anchor="middle">−4 成立</text>' +
            '<circle cx="' + nx(0) + '" cy="70" r="5" fill="#d33"/>' +
            '<text x="' + nx(0) + '" y="88" font-size="11" text-anchor="middle">0 不成立</text>' +
            '<text x="105" y="110" font-size="12" text-anchor="middle">解集：x < −3（空心向左）</text>';
        } else {
          s += '<text x="105" y="80" font-size="12" text-anchor="middle">点按钮，解出 x 的范围</text>';
        }
      }
      s += '</svg>';
      gid(K + '-svg').innerHTML = s;
    }
    function setLevel(i) {
      levelIdx = i; guessed = -1; flipped = false;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-act-btn').textContent = L.action;
      msg('先猜一猜，再点“' + L.action + '”。');
      draw();
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜 ' + LEVELS[levelIdx].opts[g] + '。翻一翻验证。');
        });
      })(g);
    }
    gid(K + '-act-btn').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜。'); return; }
      if (flipped) { msg('已经翻过了，再看一遍数轴。'); return; }
      flipped = true;
      draw();
      var L = LEVELS[levelIdx];
      var ok = guessed === L.ans;
      msg(L.note + (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再看一遍翻完之后谁在右边。'));
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：−3 > −5', '提高：4 > −8', '挑战：x < −3'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm715-overlap',
  title: '公共部分重叠法',
  sub: '不等式组的解是两段区间的重叠部分：数轴上两段一画，重叠处亮起来；没有重叠，就是无解。',
  grade: 7,
  kind: '模拟',
  points: ['7.15'],
  render: function (el) {
    var K = 'm715-overlap';
    var LEVELS = [
      { label: '基础', a: { end: 1, dir: 'right', open: true, text: 'x > 1' }, b: { end: 4, dir: 'left', open: true, text: 'x < 4' }, q: 'x > 1 且 x < 4，公共部分是？', opts: ['1 到 4 之间', '大于 4 的数', '小于 1 的数'], ans: 0, result: '1 < x < 4', note: '公共部分是 1 到 4 之间：x 要同时大于 1、小于 4。' },
      { label: '提高', a: { end: 2, dir: 'right', open: false, text: 'x ≥ 2' }, b: { end: 5, dir: 'left', open: false, text: 'x ≤ 5' }, q: 'x ≥ 2 且 x ≤ 5，公共部分是？', opts: ['2 到 5 之间（两头都包括）', '大于 5 的数', '小于 2 的数'], ans: 0, result: '2 ≤ x ≤ 5', note: '公共部分是 2 到 5 之间：2 和 5 都包括（实心点）。' },
      { label: '挑战', a: { end: 0, dir: 'left', open: true, text: 'x < 0' }, b: { end: 3, dir: 'right', open: true, text: 'x > 3' }, q: 'x < 0 且 x > 3，公共部分是？', opts: ['没有公共部分', '0 到 3 之间', '大于 3 的数'], ans: 0, result: '无解', note: '两段不挨着：小于 0 的数和大于 3 的数没有重叠，这个不等式组无解。' }
    ];
    var levelIdx = 0, guessed = -1, tiers = null, hasA = false, hasB = false, over = false;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 7 年级 · 不等式与一元一次不等式组</p>' +
      '<h3>公共部分重叠法</h3>' +
      '<p>不等式组要同时满足两个条件：先把两段解集各画各的，再看重叠的那一段——重叠处亮起来，就是公共部分；没有重叠，就是无解。先猜，再一段一段画。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 一段一段画：</p>' +
      '<div class="btn-row">' +
      '<button class="btn small" id="' + K + '-draw-a-btn" type="button">画第一段</button>' +
      '<button class="btn small" id="' + K + '-draw-b-btn" type="button">画第二段</button>' +
      '<button class="btn small" id="' + K + '-overlap-btn" type="button">看重叠</button></div>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再一段一段画。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · x > 1 且 x < 4</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · x ≥ 2 且 x ≤ 5</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · x < 0 且 x > 3</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都找到公共部分（或确认无解），并且能说出“解是公共部分”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function nx(v) { return 20 + (v + 5) * 16; }
    function segRow(seg, y, color, on) {
      if (!on) return '';
      var ex = nx(seg.end);
      var rect = seg.dir === 'right'
        ? '<rect x="' + ex + '" y="' + (y - 6) + '" width="' + (196 - ex) + '" height="12" fill="' + color + '" opacity="0.5"/>'
        : '<rect x="20" y="' + (y - 6) + '" width="' + (ex - 20) + '" height="12" fill="' + color + '" opacity="0.5"/>';
      return rect + '<circle cx="' + ex + '" cy="' + y + '" r="6" fill="' + (seg.open ? '#fff' : '#333') + '" stroke="#333" stroke-width="2"/>';
    }
    function overlapRect() {
      var L = LEVELS[levelIdx];
      var lo = Math.min(L.a.end, L.b.end), hi = Math.max(L.a.end, L.b.end);
      var aCoversRight = L.a.dir === 'right', bCoversRight = L.b.dir === 'right';
      if (aCoversRight === bCoversRight) return null;
      var leftSeg = aCoversRight ? L.b : L.a;
      var rightSeg = aCoversRight ? L.a : L.b;
      if (leftSeg.end >= rightSeg.end) return null;
      return { x0: nx(leftSeg.end), x1: nx(rightSeg.end) };
    }
    function draw() {
      var L = LEVELS[levelIdx];
      var s = '<svg viewBox="0 0 220 110" style="width:100%;max-width:440px">' +
        '<text x="10" y="18" font-size="11">第一段：' + L.a.text + '</text>' +
        '<line x1="20" y1="30" x2="196" y2="30" stroke="#333" stroke-width="1.5"/>' +
        segRow(L.a, 30, '#7fb3ff', hasA) +
        '<text x="10" y="52" font-size="11">第二段：' + L.b.text + '</text>' +
        '<line x1="20" y1="64" x2="196" y2="64" stroke="#333" stroke-width="1.5"/>' +
        segRow(L.b, 64, '#ffc46b', hasB) +
        '<text x="10" y="86" font-size="11">公共部分</text>' +
        '<line x1="20" y1="98" x2="196" y2="98" stroke="#333" stroke-width="1.5"/>';
      if (over) {
        var r = overlapRect();
        if (r) s += '<rect x="' + r.x0 + '" y="92" width="' + (r.x1 - r.x0) + '" height="12" fill="#f80" opacity="0.6"/>';
      }
      for (var i = -5; i <= 6; i++) {
        s += '<text x="' + nx(i) + '" y="108" font-size="9" text-anchor="middle">' + i + '</text>';
      }
      s += '</svg>';
      gid(K + '-svg').innerHTML = s;
    }
    function setLevel(i) {
      levelIdx = i; guessed = -1; hasA = false; hasB = false; over = false;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-draw-a-btn').textContent = '画第一段（' + L.a.text + '）';
      gid(K + '-draw-b-btn').textContent = '画第二段（' + L.b.text + '）';
      msg('先猜一猜，再一段一段画。');
      draw();
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜 ' + LEVELS[levelIdx].opts[g] + '。画出来验证。');
        });
      })(g);
    }
    gid(K + '-draw-a-btn').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜。'); return; }
      hasA = true; draw();
      msg('第一段画好了：' + LEVELS[levelIdx].a.text + '。再画第二段。');
    });
    gid(K + '-draw-b-btn').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜。'); return; }
      hasB = true; draw();
      msg('第二段画好了：' + LEVELS[levelIdx].b.text + '。再看重叠。');
    });
    gid(K + '-overlap-btn').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜。'); return; }
      if (!hasA || !hasB) { msg('先把两段都画出来，再看重叠。'); return; }
      if (over) { msg('已经看过重叠了，再看一遍亮起来的那段。'); return; }
      over = true;
      draw();
      var L = LEVELS[levelIdx];
      var ok = guessed === L.ans;
      msg(L.note + '所以解是 ' + L.result + '。' + (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再看一遍亮起来的那段。'));
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：解是 1 < x < 4', '提高：解是 2 ≤ x ≤ 5', '挑战：无解'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm716-bins',
  title: '分桶计数法',
  sub: '直方图就是分桶数人头：先定桶宽，再数每桶几人，最后桶高画出来——桶宽一改，同一批数据的样子就跟着变。',
  grade: 7,
  kind: '实验',
  points: ['7.16'],
  render: function (el) {
    var K = 'm716-bins';
    var DATA = [142, 145, 148, 151, 152, 155, 158, 160, 162, 165, 168, 170];
    var LEVELS = [
      { label: '基础', width: 10, q: '桶宽 10 厘米，150–160 这一桶有几人？', opts: ['4 人', '5 人', '3 人'], ans: 0, verdict: '150–160 这一桶：151、152、155、158，共 4 人。' },
      { label: '提高', width: 5, q: '桶宽 5 厘米，哪一桶人最多？', opts: ['有 5 桶并列 2 人', '145–150 那桶', '170–175 那桶'], ans: 0, verdict: '桶宽 5 厘米：有 5 桶都是 2 人，并列最多；两头各 1 人。' },
      { label: '挑战', width: 20, q: '桶宽 20 厘米，140–160 这一桶有几人？', opts: ['7 人', '5 人', '12 人'], ans: 0, verdict: '140–160 这一桶：142、145、148、151、152、155、158，共 7 人。' }
    ];
    var levelIdx = 0, guessed = -1, tiers = null, binned = false;
    el.innerHTML =
      '<p class="demo-tag">实验 · 7 年级 · 统计调查与直方图</p>' +
      '<h3>分桶计数法</h3>' +
      '<p>12 个同学的身高（厘米）：142、145、148、151、152、155、158、160、162、165、168、170。直方图就是把这些数分进桶里数人头：先猜，再点“分桶数人头”。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 分桶：</p>' +
      '<div class="btn-row"><button class="btn small" id="' + K + '-bin-btn" type="button">分桶数人头</button></div>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-counts"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再点“分桶数人头”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 桶宽 10 厘米</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 桶宽 5 厘米</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 桶宽 20 厘米</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都分对了，并且能说出“桶宽不同，同一批数据的直方图也不同”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function binsFor(width) {
      var bins = [];
      for (var lo = 140; lo < 180; lo += width) {
        var c = 0;
        for (var i = 0; i < DATA.length; i++) {
          if (DATA[i] >= lo && DATA[i] < lo + width) c++;
        }
        bins.push({ lo: lo, hi: lo + width, count: c });
      }
      return bins;
    }
    function draw() {
      var L = LEVELS[levelIdx];
      if (!binned) { gid(K + '-svg').innerHTML = ''; gid(K + '-counts').textContent = ''; return; }
      var bins = binsFor(L.width);
      var bw = 240 / bins.length;
      var s = '<svg viewBox="0 0 260 160" style="width:100%;max-width:480px">' +
        '<line x1="10" y1="130" x2="250" y2="130" stroke="#333" stroke-width="1.5"/>';
      var countsTxt = '';
      for (var i = 0; i < bins.length; i++) {
        var bx = 15 + i * bw;
        var bh = bins[i].count * 20;
        s += '<rect x="' + bx.toFixed(1) + '" y="' + (130 - bh) + '" width="' + (bw - 6).toFixed(1) + '" height="' + bh + '" fill="#7fb3ff" stroke="#333"/>' +
          '<text x="' + (bx + bw / 2 - 3).toFixed(1) + '" y="' + (130 - bh - 5) + '" font-size="12" text-anchor="middle">' + bins[i].count + ' 人</text>' +
          '<text x="' + (bx + bw / 2 - 3).toFixed(1) + '" y="145" font-size="10" text-anchor="middle">' + bins[i].lo + '–' + bins[i].hi + '</text>';
        countsTxt += (i > 0 ? '　' : '') + bins[i].lo + '–' + bins[i].hi + '：' + bins[i].count + ' 人';
      }
      s += '</svg>';
      gid(K + '-svg').innerHTML = s;
      gid(K + '-counts').textContent = countsTxt;
    }
    function setLevel(i) {
      levelIdx = i; guessed = -1; binned = false;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      msg('先猜一猜，再点“分桶数人头”。');
      draw();
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜 ' + LEVELS[levelIdx].opts[g] + '。分桶数一数验证。');
        });
      })(g);
    }
    gid(K + '-bin-btn').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜。'); return; }
      if (binned) { msg('已经分好桶了，再看一遍每桶几人。'); return; }
      binned = true;
      draw();
      var L = LEVELS[levelIdx];
      var ok = guessed === L.ans;
      msg(L.verdict + '桶宽一改，直方图的样子就跟着变——分组方式影响看法。' +
        (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再数一遍那一桶。'));
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：150–160 有 4 人', '提高：5 桶并列 2 人', '挑战：140–160 有 7 人'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm716-sample',
  title: '随机抽样模拟法',
  sub: '只抽一个班不能代表全校：模拟里多抽几次，样本均值晃来晃去，样本越大晃得越小。',
  grade: 7,
  kind: '模拟',
  points: ['7.16'],
  render: function (el) {
    var K = 'm716-sample';
    var POP = [138, 142, 145, 147, 150, 152, 155, 158, 160, 163];
    var LEVELS = [
      { label: '基础', n: 3, q: '只抽 3 个人算平均身高，均值会怎么样？', opts: ['晃得厉害，离 151 很远', '几乎不动', '正好就是 151'], ans: 0, verdict: '样本只有 3 个人，均值晃得厉害——只抽 3 个人，不能代表全校。' },
      { label: '提高', n: 10, q: '抽 10 个人，均值晃得比抽 3 个大还是小？', opts: ['晃得小多了', '晃得更大', '一样大'], ans: 0, verdict: '样本 10 个人，均值晃得小多了。' },
      { label: '挑战', n: 30, q: '有放回地抽 30 次算平均身高，均值会怎么样？', opts: ['几乎就是 151', '晃得厉害', '比 151 大 10'], ans: 0, verdict: '抽了 30 个人，均值离总体均值 151 很近——样本越大，均值越稳。' }
    ];
    var levelIdx = 0, guessed = -1, tiers = null, seed = 777, draws = 0, means = [];
    el.innerHTML =
      '<p class="demo-tag">模拟 · 7 年级 · 统计调查与直方图</p>' +
      '<h3>随机抽样模拟法</h3>' +
      '<p>全校 10 个同学的身高总体均值是 151 厘米。现在随机抽几个人算平均身高：抽得少，均值晃得厉害；抽得多，均值就稳了。先猜，再抽三次看看。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 抽一抽：每点一次，随机抽一组算均值。</p>' +
      '<div class="btn-row"><button class="btn small" id="' + K + '-draw-btn" type="button">抽一次</button></div>' +
      '<p id="' + K + '-list"></p>' +
      '<p id="' + K + '-range"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再点“抽一次”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 抽 3 个人</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 抽 10 个人</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 抽 30 次</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都抽了三次，并且能说出“样本越大，均值越稳”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function rnd() {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed / 2147483648;
    }
    function setLevel(i) {
      levelIdx = i; guessed = -1; draws = 0; means = [];
      seed = 777 + levelIdx * 13;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-list').textContent = '';
      gid(K + '-range').textContent = '';
      msg('先猜一猜，再点“抽一次”。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜 ' + LEVELS[levelIdx].opts[g] + '。抽三次看看。');
        });
      })(g);
    }
    gid(K + '-draw-btn').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜。'); return; }
      var L = LEVELS[levelIdx];
      var sum = 0;
      for (var i = 0; i < L.n; i++) sum += POP[Math.floor(rnd() * POP.length)];
      var mean = sum / L.n;
      means.push(mean);
      draws++;
      var listTxt = '';
      for (var j = 0; j < means.length; j++) {
        listTxt += (j > 0 ? '　' : '') + '第 ' + (j + 1) + ' 次：' + means[j].toFixed(1);
      }
      gid(K + '-list').textContent = listTxt;
      var mn = means[0], mx = means[0];
      for (var k = 1; k < means.length; k++) {
        if (means[k] < mn) mn = means[k];
        if (means[k] > mx) mx = means[k];
      }
      gid(K + '-range').textContent = '已抽 ' + draws + ' 次，均值在 ' + mn.toFixed(1) + ' 到 ' + mx.toFixed(1) + ' 之间，最大和最小差 ' + (mx - mn).toFixed(1) + '。总体均值是 151。';
      if (draws >= 3) {
        var ok = guessed === L.ans;
        msg('3 次抽样，均值分别是 ' + means[0].toFixed(1) + '、' + means[1].toFixed(1) + '、' + means[2].toFixed(1) + '，在 ' + mn.toFixed(1) + ' 到 ' + mx.toFixed(1) + ' 之间，最大和最小差 ' + (mx - mn).toFixed(1) + '。' + L.verdict +
          (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再看一遍三次均值晃了多少。'));
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      } else {
        msg('抽了 ' + draws + ' 次，再抽 ' + (3 - draws) + ' 次。');
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：抽 3 人，均值晃 12.7', '提高：抽 10 人，均值晃 3.3', '挑战：抽 30 次，均值晃 2.6'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm716-dotvs',
  title: '点图 vs 直方图对比法',
  sub: '点图一个点是一个人，直方图一根柱是一桶人；数据连续用直方图、离散用点图——都是数出来的，只是“数”的单位不同。',
  grade: 7,
  kind: '模拟',
  points: ['7.16'],
  render: function (el) {
    var K = 'm716-dotvs';
    var DATA = [95, 100, 100, 105, 105, 105, 110, 110, 110, 110, 115, 115, 120, 120, 125];
    var LEVELS = [
      { label: '基础', view: 'dot', q: '点图里 110 上面叠了几个点？', opts: ['4 个', '3 个', '1 个'], ans: 0, action: '画点图', verdict: '110 上面叠了 4 个点：一个点是一个人，4 个点就是 4 个人跳了 110 个。' },
      { label: '提高', view: 'hist', q: '直方图里 105–115 这一桶有几人？', opts: ['7 人', '4 人', '3 人'], ans: 0, action: '画直方图', verdict: '105–115 这一桶：105 的 3 人加 110 的 4 人，共 7 人。点图里 105 那列 3 个点、110 那列 4 个点，加起来正好是这根柱子。' },
      { label: '挑战', view: 'both', q: '“最喜欢的颜色”这种分类数据，适合用哪种图？', opts: ['条形图', '直方图', '点图'], ans: 0, action: '两种图比一比', verdict: '点图一个点是一个人，直方图一根柱是一桶人——都是数出来的，只是“数”的单位不同。颜色分不出高低、也装不进“桶”，所以用条形图：一类一根柱。' }
    ];
    var levelIdx = 0, guessed = -1, tiers = null, shown = false;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 7 年级 · 统计调查与直方图</p>' +
      '<h3>点图 vs 直方图对比法</h3>' +
      '<p>15 个同学一分钟跳绳的个数：95、100、100、105、105、105、110、110、110、110、115、115、120、120、125。同一批数据，点图和直方图两种画法——先猜，再画出来比一比。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 画出来：</p>' +
      '<div class="btn-row"><button class="btn small" id="' + K + '-show-btn" type="button"></button></div>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点按钮画出来。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 画点图</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 画直方图</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 两种图比一比</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都画对了，并且能说出“点图一个点是一个人，直方图一根柱是一桶人”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function dotPlot(y0) {
      var vals = [95, 100, 105, 110, 115, 120, 125];
      var counts = [1, 2, 3, 4, 2, 2, 1];
      var s = '<line x1="15" y1="' + y0 + '" x2="235" y2="' + y0 + '" stroke="#333" stroke-width="1.5"/>' +
        '<text x="15" y="' + (y0 - 62) + '" font-size="11">点图：一个点是一个人</text>';
      for (var i = 0; i < vals.length; i++) {
        var cx = 30 + i * 30;
        for (var j = 0; j < counts[i]; j++) {
          s += '<circle cx="' + cx + '" cy="' + (y0 - 8 - j * 14) + '" r="6" fill="#2a7" stroke="#333"/>';
        }
        s += '<text x="' + cx + '" y="' + (y0 + 14) + '" font-size="11" text-anchor="middle">' + vals[i] + '</text>';
      }
      return s;
    }
    function histPlot(y0) {
      var bins = [[95, 105, 3], [105, 115, 7], [115, 125, 4], [125, 135, 1]];
      var s = '<line x1="15" y1="' + y0 + '" x2="235" y2="' + y0 + '" stroke="#333" stroke-width="1.5"/>' +
        '<text x="15" y="' + (y0 - 140) + '" font-size="11">直方图：一根柱是一桶人</text>';
      for (var i = 0; i < bins.length; i++) {
        var bx = 25 + i * 52;
        var bh = bins[i][2] * 18;
        s += '<rect x="' + bx + '" y="' + (y0 - bh) + '" width="44" height="' + bh + '" fill="#7fb3ff" stroke="#333"/>' +
          '<text x="' + (bx + 22) + '" y="' + (y0 - bh - 5) + '" font-size="12" text-anchor="middle">' + bins[i][2] + ' 人</text>' +
          '<text x="' + (bx + 22) + '" y="' + (y0 + 14) + '" font-size="10" text-anchor="middle">' + bins[i][0] + '–' + bins[i][1] + '</text>';
      }
      return s;
    }
    function draw() {
      var L = LEVELS[levelIdx];
      if (!shown) { gid(K + '-svg').innerHTML = ''; return; }
      var s;
      if (L.view === 'dot') {
        s = '<svg viewBox="0 0 240 120" style="width:100%;max-width:460px">' + dotPlot(90) + '</svg>';
      } else if (L.view === 'hist') {
        s = '<svg viewBox="0 0 240 170" style="width:100%;max-width:460px">' + histPlot(145) + '</svg>';
      } else {
        s = '<svg viewBox="0 0 240 250" style="width:100%;max-width:460px">' + dotPlot(90) + histPlot(230) + '</svg>';
      }
      gid(K + '-svg').innerHTML = s;
    }
    function setLevel(i) {
      levelIdx = i; guessed = -1; shown = false;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var b = gid(K + '-level-' + j);
        if (b) b.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-show-btn').textContent = L.action;
      msg('先猜一猜，再点“' + L.action + '”。');
      draw();
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜 ' + LEVELS[levelIdx].opts[g] + '。画出来验证。');
        });
      })(g);
    }
    gid(K + '-show-btn').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜。'); return; }
      if (shown) { msg('已经画好了，再看一遍。'); return; }
      shown = true;
      draw();
      var L = LEVELS[levelIdx];
      var ok = guessed === L.ans;
      msg(L.verdict + (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再数一遍。'));
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：110 上面 4 个点', '提高：105–115 有 7 人', '挑战：分类数据用条形图'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm81-ext',
  title: '外角等于两内角和法',
  sub: '把三角形一边延长，外角就露出来了：它等于不相邻那两个内角的和，不用一个一个量。',
  grade: 8,
  kind: '演示',
  points: ['8.1'],
  render: function (el) {
    var K = 'm81-ext';
    var LEVELS = [
      { label: '基础', a: 50, b: 60, ax: 60, bx: 300, q: '外角等于哪两个内角的和？', opts: ['∠A ＋ ∠B', '∠A ＋ ∠C', '∠B ＋ ∠C'], ans: 0, note: '外角 ＝ 180° − ∠C ＝ 180° − 70° ＝ 110°；∠A ＋ ∠B ＝ 50° ＋ 60° ＝ 110°，正好相等。' },
      { label: '提高', a: 70, b: 40, ax: 60, bx: 300, q: '外角等于哪两个内角的和？', opts: ['∠A ＋ ∠B', '∠A ＋ ∠C', '∠B ＋ ∠C'], ans: 0, note: '∠A ＋ ∠B ＝ 70° ＋ 40° ＝ 110°；外角 ＝ 180° − 70° ＝ 110°，还是相等。' },
      { label: '挑战', a: 80, b: 50, ax: 100, bx: 260, q: '外角是 130°，∠A 是 80°，∠B 是多少？', opts: ['50°', '80°', '130°'], ans: 0, note: '∠B ＝ 外角 − ∠A ＝ 130° − 80° ＝ 50°。外角定理反过来用：知道外角和一个内角，就能倒推出另一个。' }
    ];
    var levelIdx = 0, guessed = -1, tiers = null, shown = false;
    el.innerHTML =
      '<p class="demo-tag">演示 · 8 年级 · 三角形</p>' +
      '<h3>外角等于两内角和法</h3>' +
      '<p>三角形一个角的外面还有个角：把一边延长，夹在延长线和另一边之间的就是外角。先猜它等于谁，再延长一边看答案。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 延长一边：<button class="btn small primary" id="' + K + '-extend" type="button">延长 BC 边，看外角</button></p>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点“延长 BC 边”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 50°＋60°</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 70°＋40°</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 外角 130°</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出“外角等于不相邻两个内角的和”，挑战档会倒推未知角。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function triPts(L) {
      var ay = 230, ta = Math.tan(L.a * Math.PI / 180), tb = Math.tan(L.b * Math.PI / 180);
      var h = (L.bx - L.ax) / (1 / ta + 1 / tb);
      return { A: [L.ax, ay], B: [L.bx, ay], C: [L.ax + h / ta, ay - h] };
    }
    function arcPath(cx, cy, p1, p2, r) {
      var u1x = p1[0] - cx, u1y = p1[1] - cy, u2x = p2[0] - cx, u2y = p2[1] - cy;
      var l1 = Math.sqrt(u1x * u1x + u1y * u1y), l2 = Math.sqrt(u2x * u2x + u2y * u2y);
      var x1 = cx + r * u1x / l1, y1 = cy + r * u1y / l1;
      var x2 = cx + r * u2x / l2, y2 = cy + r * u2y / l2;
      var sw = (u1x * u2y - u1y * u2x) > 0 ? 1 : 0;
      return 'M ' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' A ' + r + ' ' + r + ' 0 0 ' + sw + ' ' + x2.toFixed(1) + ' ' + y2.toFixed(1);
    }
    function render() {
      var L = LEVELS[levelIdx], t = triPts(L), c = 180 - L.a - L.b, ext = L.a + L.b;
      var dx = t.C[0] - t.B[0], dy = t.C[1] - t.B[1], dl = Math.sqrt(dx * dx + dy * dy);
      var D = [t.C[0] + 55 * dx / dl, t.C[1] + 55 * dy / dl];
      var s = '<svg viewBox="0 0 360 260" style="width:100%;max-width:420px">';
      s += '<polygon points="' + t.A[0] + ',' + t.A[1] + ' ' + t.B[0] + ',' + t.B[1] + ' ' + t.C[0].toFixed(1) + ',' + t.C[1].toFixed(1) + '" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/>';
      if (shown) {
        s += '<line x1="' + t.B[0] + '" y1="' + t.B[1] + '" x2="' + D[0].toFixed(1) + '" y2="' + D[1].toFixed(1) + '" stroke="#d33" stroke-width="2" stroke-dasharray="6 4"/>';
        s += '<path d="' + arcPath(t.C[0], t.C[1], t.A, D, 26) + '" fill="none" stroke="#d33" stroke-width="2"/>';
        s += '<text x="' + (t.C[0] + (D[0] - t.C[0]) * 0.6 + 14).toFixed(1) + '" y="' + (t.C[1] + (D[1] - t.C[1]) * 0.6).toFixed(1) + '" font-size="13" fill="#d33">外角 ' + ext + '°</text>';
      }
      s += '<text x="' + (t.A[0] + 12) + '" y="' + (t.A[1] - 12) + '" font-size="13">∠A ' + L.a + '°</text>';
      s += '<text x="' + (t.B[0] - 52) + '" y="' + (t.B[1] - 12) + '" font-size="13">∠B ' + L.b + '°</text>';
      s += '<text x="' + (t.C[0] - 8).toFixed(1) + '" y="' + (t.C[1] + 24).toFixed(1) + '" font-size="13">∠C ' + c + '°</text>';
      s += '<text x="' + t.A[0] + '" y="' + (t.A[1] + 18) + '" font-size="12">A</text>';
      s += '<text x="' + (t.B[0] - 4) + '" y="' + (t.B[1] + 18) + '" font-size="12">B</text>';
      s += '<text x="' + (t.C[0] - 4).toFixed(1) + '" y="' + (t.C[1] - 8).toFixed(1) + '" font-size="12">C</text>';
      s += '</svg>';
      gid(K + '-svg').innerHTML = s;
    }
    function setLevel(i) {
      levelIdx = i; guessed = -1; shown = false;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var bj = gid(K + '-level-' + j);
        if (bj) bj.setAttribute('aria-pressed', String(j === i));
      }
      msg('先猜一猜，再点“延长 BC 边”。');
      render();
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜 ' + LEVELS[levelIdx].opts[g] + '。点“延长 BC 边”验证。');
        });
      })(g);
    }
    gid(K + '-extend').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜，再延长一边。'); return; }
      shown = true;
      render();
      var L = LEVELS[levelIdx], ok = guessed === L.ans;
      msg(L.note + (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再看一遍外角。'));
      if (ok) {
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：外角 110°', '提高：外角 110°', '挑战：∠B 50°'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm82-move',
  title: '刚性变换叠合法',
  sub: '把一个三角形平移、旋转、翻转着“搬”到另一个上面：搬得过去、严丝合缝，就是全等；搬不过去，就不是。',
  grade: 8,
  kind: '模拟',
  points: ['8.2'],
  render: function (el) {
    var K = 'm82-move';
    var LEVELS = [
      { label: '基础', dx: 3, rot: 0, flip: false, q: '只用平移，能把橙色三角形搬到蓝色上面重合吗？', opts: ['只平移就行', '还要旋转', '还要翻转'], ans: 0, note: '向右平移 3 步，两个三角形严丝合缝：平移不改变形状和大小，重合就是全等。' },
      { label: '提高', dx: 3, rot: 180, flip: false, q: '橙色三角形是倒过来的，要搬过去重合，需要哪几步？', opts: ['只平移就行', '平移＋旋转 180°', '平移＋翻转'], ans: 1, note: '先旋转 180° 把它转正，再平移 3 步：旋转也不改变形状和大小，转正了就能重合。' },
      { label: '挑战', dx: 3, rot: 0, flip: true, q: '橙色三角形是镜面里的样子，要搬过去重合，需要哪几步？', opts: ['只平移就行', '平移＋旋转', '平移＋左右翻转'], ans: 2, note: '先左右翻转一次，再平移 3 步：翻转也不改变形状和大小，翻过来就能重合。' }
    ];
    var levelIdx = 0, guessed = -1, tiers = null;
    var dx = 0, rot = 0, flip = false;
    var P1 = [[190, 150], [230, 70], [260, 150]];
    el.innerHTML =
      '<p class="demo-tag">模拟 · 8 年级 · 全等三角形的判定</p>' +
      '<h3>刚性变换叠合法</h3>' +
      '<p>全等就是“搬得过去”：平移、旋转、翻转都不会改变三角形的形状和大小。先猜要哪几步，再动手搬橙色三角形。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 搬一搬：</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-move" type="button">向右平移一步</button>' +
      '<button class="btn small primary" id="' + K + '-rot" type="button">旋转 90°</button>' +
      '<button class="btn small primary" id="' + K + '-flip" type="button">左右翻转</button>' +
      '<button class="btn small ghost" id="' + K + '-reset" type="button">重置</button></div>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-state"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再动手搬。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 平移</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 旋转</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 翻转</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都把橙色三角形搬到蓝色上面重合，并且能说出“平移、旋转、翻转都不改变形状和大小”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function centroid(pts) {
      var x = 0, y = 0, i;
      for (i = 0; i < pts.length; i++) { x += pts[i][0]; y += pts[i][1]; }
      return [x / pts.length, y / pts.length];
    }
    function rotPt(p, c, deg) {
      var r = deg * Math.PI / 180, co = Math.cos(r), si = Math.sin(r);
      var x = p[0] - c[0], y = p[1] - c[1];
      return [c[0] + x * co - y * si, c[1] + x * si + y * co];
    }
    function flipPt(p, c) { return [2 * c[0] - p[0], p[1]]; }
    function basePts() {
      var L = LEVELS[levelIdx];
      var pts = P1.map(function (p) { return [p[0] - 120, p[1]]; });
      var c = centroid(pts);
      if (L.flip) pts = pts.map(function (p) { return flipPt(p, c); });
      if (L.rot) pts = pts.map(function (p) { return rotPt(p, c, -L.rot); });
      return pts;
    }
    function render() {
      var L = LEVELS[levelIdx], base = basePts(), c = centroid(base);
      var cur = base.map(function (p) { return flip ? flipPt(p, c) : p; })
        .map(function (p) { return rotPt(p, c, rot); })
        .map(function (p) { return [p[0] + dx * 40, p[1]]; });
      function ptsStr(pts) {
        return pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ');
      }
      var s = '<svg viewBox="0 0 360 200" style="width:100%;max-width:420px">';
      s += '<polygon points="' + ptsStr(P1) + '" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/>';
      s += '<polygon points="' + ptsStr(cur) + '" fill="#fed7aa" stroke="#d33" stroke-width="2"/>';
      s += '<text x="205" y="185" font-size="12" fill="#2563eb">蓝色：目标</text>';
      s += '<text x="55" y="185" font-size="12" fill="#d33">橙色：搬它</text>';
      s += '</svg>';
      gid(K + '-svg').innerHTML = s;
      gid(K + '-state').textContent = '现在：平移 ' + dx + ' 步，旋转 ' + rot + '°，翻转：' + (flip ? '是' : '否') + '。目标：平移 ' + L.dx + ' 步，旋转 ' + L.rot + '°，翻转：' + (L.flip ? '是' : '否') + '。';
    }
    function checkDone() {
      var L = LEVELS[levelIdx];
      if (dx === L.dx && rot === L.rot && flip === L.flip) {
        var ok = guessed === L.ans;
        msg('重合了！' + L.note + (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再搬一次看看。'));
        if (ok) {
          if (tiers) tiers.done(levelIdx);
          if (typeof markTried === 'function') markTried(K);
        }
        return true;
      }
      msg('还没重合：橙色三角形还没搬到蓝色上面，再调一调。');
      return false;
    }
    function setLevel(i) {
      levelIdx = i; guessed = -1; dx = 0; rot = 0; flip = false;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var bj = gid(K + '-level-' + j);
        if (bj) bj.setAttribute('aria-pressed', String(j === i));
      }
      msg('先猜一猜，再动手搬。');
      render();
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜 ' + LEVELS[levelIdx].opts[g] + '。动手搬一搬验证。');
        });
      })(g);
    }
    gid(K + '-move').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜，再动手搬。'); return; }
      if (dx < 3) dx++;
      render(); checkDone();
    });
    gid(K + '-rot').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜，再动手搬。'); return; }
      rot = (rot + 90) % 360;
      render(); checkDone();
    });
    gid(K + '-flip').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜，再动手搬。'); return; }
      flip = !flip;
      render(); checkDone();
    });
    gid(K + '-reset').addEventListener('click', function () {
      dx = 0; rot = 0; flip = false;
      render(); msg('回到起点，再搬一次。');
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：只平移', '提高：平移＋旋转', '挑战：平移＋翻转'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm83-trace',
  title: '镜面描迹法',
  sub: '拖着点 A 走，它的镜像 A′ 一路留下脚印：对称轴就是 AA′ 连线的垂直平分线，脚印不会说谎。',
  grade: 8,
  kind: '模拟',
  points: ['8.3'],
  render: function (el) {
    var K = 'm83-trace';
    var LEVELS = [
      { label: '基础', ax: 60, ay: 100, mirror: 'v', q: '镜线是竖线 x ＝ 200。把 A 拖到 (60, 100)，它的镜像 A′ 在哪？', opts: ['(340, 100)', '(60, 100)', '(340, −100)'], ans: 0, note: 'A′ ＝ (340, 100)：横坐标关于 200 对称，纵坐标不变。对称轴是 AA′ 连线的垂直平分线。' },
      { label: '提高', ax: 120, ay: 60, mirror: 'v', q: '镜线还是竖线 x ＝ 200。把 A 拖到 (120, 60)，它的镜像 A′ 在哪？', opts: ['(280, 60)', '(120, 60)', '(280, −60)'], ans: 0, note: 'A′ ＝ (280, 60)：120 到 200 是 80，200 再往右 80 就是 280，纵坐标还是 60。' },
      { label: '挑战', ax: 100, ay: 40, mirror: 'h', q: '镜线改成横线 y ＝ 100。把 A 拖到 (100, 40)，它的镜像 A′ 在哪？', opts: ['(100, 160)', '(100, 40)', '(160, 100)'], ans: 0, note: 'A′ ＝ (100, 160)：横坐标不变，纵坐标关于 100 对称。镜线横过来，变号的就换成纵坐标。' }
    ];
    var levelIdx = 0, guessed = -1, tiers = null, x = 60, y = 140;
    var traceA = [], traceAp = [];
    el.innerHTML =
      '<p class="demo-tag">模拟 · 8 年级 · 轴对称</p>' +
      '<h3>镜面描迹法</h3>' +
      '<p>镜子另一边的点，和这边这个点关于镜线对称。先猜镜像在哪，再拖滑杆移动 A，看 A′ 的脚印。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 拖一拖 A：</p>' +
      '<p>横坐标 <input type="range" id="' + K + '-slider-x" min="20" max="180" step="20" value="60" style="width:60%"> <b id="' + K + '-xv"></b></p>' +
      '<p>纵坐标 <input type="range" id="' + K + '-slider-y" min="20" max="180" step="20" value="140" style="width:60%"> <b id="' + K + '-yv"></b></p>' +
      '<div class="btn-row"><button class="btn small ghost" id="' + K + '-clear" type="button">清掉轨迹</button></div>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-pos"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再拖滑杆。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 竖镜线</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 竖镜线</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 横镜线</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都把 A 拖到目标点，并且能说出“镜像点和原点关于镜线对称，镜线是连线的垂直平分线”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function mirrorPt() {
      var L = LEVELS[levelIdx];
      return L.mirror === 'v' ? [400 - x, y] : [x, 200 - y];
    }
    function render() {
      var L = LEVELS[levelIdx], ap = mirrorPt();
      gid(K + '-xv').textContent = String(x);
      gid(K + '-yv').textContent = String(y);
      var s = '<svg viewBox="0 0 400 220" style="width:100%;max-width:440px">';
      if (L.mirror === 'v') {
        s += '<line x1="200" y1="10" x2="200" y2="210" stroke="#2563eb" stroke-width="2" stroke-dasharray="8 4"/>';
        s += '<text x="206" y="24" font-size="12" fill="#2563eb">镜线 x ＝ 200</text>';
      } else {
        s += '<line x1="10" y1="100" x2="390" y2="100" stroke="#2563eb" stroke-width="2" stroke-dasharray="8 4"/>';
        s += '<text x="300" y="92" font-size="12" fill="#2563eb">镜线 y ＝ 100</text>';
      }
      var i;
      for (i = 0; i < traceA.length; i++) {
        s += '<circle cx="' + traceA[i][0] + '" cy="' + traceA[i][1] + '" r="2.5" fill="#93c5fd"/>';
        s += '<circle cx="' + traceAp[i][0] + '" cy="' + traceAp[i][1] + '" r="2.5" fill="#fdba74"/>';
      }
      s += '<line x1="' + x + '" y1="' + y + '" x2="' + ap[0] + '" y2="' + ap[1] + '" stroke="#999" stroke-width="1" stroke-dasharray="4 3"/>';
      s += '<circle cx="' + x + '" cy="' + y + '" r="7" fill="#2563eb"/>';
      s += '<text x="' + (x + 10) + '" y="' + (y - 8) + '" font-size="13" fill="#2563eb">A(' + x + ', ' + y + ')</text>';
      s += '<circle cx="' + ap[0] + '" cy="' + ap[1] + '" r="7" fill="#d33"/>';
      s += '<text x="' + (ap[0] - 62) + '" y="' + (ap[1] - 8) + '" font-size="13" fill="#d33">A′(' + ap[0] + ', ' + ap[1] + ')</text>';
      s += '</svg>';
      gid(K + '-svg').innerHTML = s;
      gid(K + '-pos').textContent = 'A ＝ (' + x + ', ' + y + ')，A′ ＝ (' + ap[0] + ', ' + ap[1] + ')。';
    }
    function checkDone() {
      var L = LEVELS[levelIdx];
      if (x === L.ax && y === L.ay) {
        var ok = guessed === L.ans;
        msg('到了目标点！' + L.note + (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再看一遍镜像。'));
        if (ok) {
          if (tiers) tiers.done(levelIdx);
          if (typeof markTried === 'function') markTried(K);
        }
      }
    }
    function onMove() {
      if (guessed < 0) { msg('先猜一猜，再拖滑杆。'); return; }
      var ap = mirrorPt();
      traceA.push([x, y]); traceAp.push(ap);
      if (traceA.length > 40) { traceA.shift(); traceAp.shift(); }
      render(); checkDone();
    }
    function setLevel(i) {
      levelIdx = i; guessed = -1; x = 60; y = 140; traceA = []; traceAp = [];
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var bj = gid(K + '-level-' + j);
        if (bj) bj.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-slider-x').value = '60';
      gid(K + '-slider-y').value = '140';
      msg('先猜一猜，再拖滑杆。');
      render();
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜 ' + LEVELS[levelIdx].opts[g] + '。拖滑杆、看着镜像跑。');
        });
      })(g);
    }
    gid(K + '-slider-x').addEventListener('input', function (e) { x = parseInt(e.target.value, 10); onMove(); });
    gid(K + '-slider-y').addEventListener('input', function (e) { y = parseInt(e.target.value, 10); onMove(); });
    gid(K + '-clear').addEventListener('click', function () { traceA = []; traceAp = []; render(); msg('轨迹清掉了，再拖一次。'); });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：A′ (340, 100)', '提高：A′ (280, 60)', '挑战：A′ (100, 160)'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm83-drink',
  title: '将军饮马最短路径法',
  sub: '将军要先到河边饮马、再回军营，走哪条路最短？把家关于河岸翻个面，直线一连，最短点自己跳出来。',
  grade: 8,
  kind: '模拟',
  points: ['8.3'],
  render: function (el) {
    var K = 'm83-drink';
    var LEVELS = [
      { label: '基础', ax: 2, ay: 5, bx: 9, by: 3, cands: [4, 6, 8], ans: 1, note: '最短大约 10.6：A′ ＝ (2, −5)，A′B ＝ √113 ≈ 10.63，P 在 x ＝ 6.4 附近。' },
      { label: '提高', ax: 1, ay: 4, bx: 7, by: 6, cands: [2, 3, 5], ans: 1, note: '最短大约 11.7：A′ ＝ (1, −4)，A′B ＝ √136 ≈ 11.66，P 在 x ＝ 3.4 附近。' },
      { label: '挑战', ax: 3, ay: 7, bx: 10, by: 2, cands: [6, 8, 9], ans: 1, note: '最短大约 11.4：A′ ＝ (3, −7)，A′B ＝ √130 ≈ 11.40，P 在 x ＝ 8.4 附近。' }
    ];
    var levelIdx = 0, guessed = -1, tiers = null, picked = -1, mirrored = false;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 8 年级 · 轴对称</p>' +
      '<h3>将军饮马最短路径法</h3>' +
      '<p>家 A 和军营 B 在河的同一边，将军要先到河边饮马再回营。先猜哪个饮马点最短，再一个一个试，最后作对称点看真相。</p>' +
      '<p>第 1 步 · 先猜：河边三个点，哪个饮马点走的路最短？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 试一试：点一个饮马点，看路长。</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-p0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-p1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-p2" type="button"></button></div>' +
      '<p>第 3 步 · 作对称点：<button class="btn small primary" id="' + K + '-mirror" type="button">把 A 关于河岸翻过去</button></p>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再试饮马点。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · A(2, 5) B(9, 3)</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · A(1, 4) B(7, 6)</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · A(3, 7) B(10, 2)</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都找到最短饮马点，并且能说出“作对称点、连直线，直线与河岸的交点就是最短点”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function fmt1(v) { return String(Math.round(v * 10) / 10); }
    function dist(x1, y1, x2, y2) { return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)); }
    function px(v) { return 20 + 32 * v; }
    function py(v) { return 130 - 14 * v; }
    function render() {
      var L = LEVELS[levelIdx];
      var s = '<svg viewBox="0 0 400 240" style="width:100%;max-width:440px">';
      s += '<line x1="20" y1="130" x2="372" y2="130" stroke="#38bdf8" stroke-width="3"/>';
      s += '<text x="330" y="122" font-size="12" fill="#0284c7">河</text>';
      var i;
      for (i = 0; i < 3; i++) {
        var cx = L.cands[i];
        s += '<circle cx="' + px(cx) + '" cy="130" r="6" fill="' + (picked === i ? '#f80' : '#fff') + '" stroke="#333" stroke-width="2"/>';
        s += '<text x="' + (px(cx) - 8) + '" y="150" font-size="12">x ＝ ' + cx + '</text>';
      }
      if (picked >= 0) {
        var pcx = L.cands[picked];
        s += '<line x1="' + px(L.ax) + '" y1="' + py(L.ay) + '" x2="' + px(pcx) + '" y2="130" stroke="#2563eb" stroke-width="2"/>';
        s += '<line x1="' + px(pcx) + '" y1="130" x2="' + px(L.bx) + '" y2="' + py(L.by) + '" stroke="#d33" stroke-width="2"/>';
      }
      if (mirrored) {
        var apx = L.ax, apy = -L.ay;
        s += '<circle cx="' + px(apx) + '" cy="' + py(apy) + '" r="6" fill="#2a7" stroke="#333" stroke-width="2"/>';
        s += '<text x="' + (px(apx) + 8) + '" y="' + (py(apy) + 4) + '" font-size="12" fill="#2a7">A′(' + apx + ', ' + apy + ')</text>';
        s += '<line x1="' + px(apx) + '" y1="' + py(apy) + '" x2="' + px(L.bx) + '" y2="' + py(L.by) + '" stroke="#2a7" stroke-width="2" stroke-dasharray="6 4"/>';
      }
      s += '<circle cx="' + px(L.ax) + '" cy="' + py(L.ay) + '" r="7" fill="#2563eb"/>';
      s += '<text x="' + (px(L.ax) + 8) + '" y="' + (py(L.ay) - 6) + '" font-size="12" fill="#2563eb">A 家</text>';
      s += '<circle cx="' + px(L.bx) + '" cy="' + py(L.by) + '" r="7" fill="#d33"/>';
      s += '<text x="' + (px(L.bx) + 8) + '" y="' + (py(L.by) - 6) + '" font-size="12" fill="#d33">B 营</text>';
      s += '</svg>';
      gid(K + '-svg').innerHTML = s;
    }
    function setLevel(i) {
      levelIdx = i; guessed = -1; picked = -1; mirrored = false;
      var L = LEVELS[i];
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = 'P 在 x ＝ ' + L.cands[k];
        gid(K + '-p' + k).textContent = '试 x ＝ ' + L.cands[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var bj = gid(K + '-level-' + j);
        if (bj) bj.setAttribute('aria-pressed', String(j === i));
      }
      msg('先猜一猜，再试饮马点。');
      render();
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜 P 在 x ＝ ' + LEVELS[levelIdx].cands[g] + ' 最短。点“试一试”量一路长。');
        });
        gid(K + '-p' + g).addEventListener('click', function () {
          if (guessed < 0) { msg('先猜一猜，再试饮马点。'); return; }
          var L = LEVELS[levelIdx], pcx = L.cands[g];
          picked = g;
          render();
          var total = dist(L.ax, L.ay, pcx, 0) + dist(L.bx, L.by, pcx, 0);
          var ok = g === L.ans;
          msg('P 在 x ＝ ' + pcx + '：AP ＋ PB ＝ ' + fmt1(total) + '。' + (ok ? '这是三个点里最短的！' + L.note : '比最短的长，再试试别的点。'));
          if (ok && guessed === L.ans) {
            if (tiers) tiers.done(levelIdx);
            if (typeof markTried === 'function') markTried(K);
          }
        });
      })(g);
    }
    gid(K + '-mirror').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜，再作对称点。'); return; }
      mirrored = true;
      render();
      var L = LEVELS[levelIdx];
      var x0 = L.ax + (L.bx - L.ax) * L.ay / (L.ay + L.by);
      var best = dist(L.ax, -L.ay, L.bx, L.by);
      msg('A 关于河岸的对称点 A′ ＝ (' + L.ax + ', ' + (-L.ay) + ')。连 A′B 的直线与河岸交于 x ＝ ' + fmt1(x0) + '，最短路长 ' + fmt1(best) + '：两点之间线段最短。');
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：最短 10.6', '提高：最短 11.7', '挑战：最短 11.4'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm84-sas',
  title: '作辅助线证底角法',
  sub: '等腰三角形里画一条辅助线，两个小三角形一全等，底角相等就跟着来了：SAS 是桥，辅助线是路。',
  grade: 8,
  kind: '演示',
  points: ['8.4'],
  render: function (el) {
    var K = 'm84-sas';
    var LEVELS = [
      { label: '基础', top: 40, q: 'AD 是顶角平分线。哪一组相等能用 SAS 证两个小三角形全等？', opts: ['AB ＝ AC，∠BAD ＝ ∠CAD，AD 公共边', 'AB ＝ BD，∠B ＝ ∠D，AD 公共边', 'AB ＝ AC，∠B ＝ ∠C，AD 公共边'], ans: 0, note: 'SAS 成立：△ABD ≌ △ACD，对应角 ∠B ＝ ∠C ＝ 70°。等腰三角形的底角相等，就是这样证出来的。' },
      { label: '提高', top: 100, q: '顶角是钝角 100°，AD 还是顶角平分线。哪一组相等能用 SAS？', opts: ['AB ＝ AC，∠BAD ＝ ∠CAD，AD 公共边', 'AB ＝ BD，∠BAD ＝ ∠CAD，AD 公共边', 'BD ＝ CD，∠B ＝ ∠C，AD 公共边'], ans: 0, note: 'SAS 照样成立：△ABD ≌ △ACD，∠B ＝ ∠C ＝ 40°。顶角钝一点，证法一点没变。' },
      { label: '挑战', top: 80, q: '只知道 AB ＝ AC，AD 是公共边，还缺什么才能用 SAS？', opts: ['∠BAD ＝ ∠CAD', 'BD ＝ CD', '∠B ＝ ∠C'], ans: 0, note: '缺一个夹角：∠BAD ＝ ∠CAD。补上它，SAS 成立，△ABD ≌ △ACD，∠B ＝ ∠C ＝ 50°。' }
    ];
    var levelIdx = 0, guessed = -1, tiers = null, shown = false;
    el.innerHTML =
      '<p class="demo-tag">演示 · 8 年级 · 等腰三角形</p>' +
      '<h3>作辅助线证底角法</h3>' +
      '<p>等腰三角形 AB ＝ AC，底角 ∠B 和 ∠C 为什么相等？画一条顶角平分线 AD，两个小三角形一全等，答案就出来了。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 看辅助线：<button class="btn small primary" id="' + K + '-show" type="button">画出 AD，看 SAS</button></p>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点“画出 AD”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 顶角 40°</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 顶角 100°</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 缺什么</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都找得出 SAS 的三组相等，并且能说出“辅助线把一个等腰三角形劈成两个全等的小三角形”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function render() {
      var L = LEVELS[levelIdx], base = (180 - L.top) / 2;
      var hb = 140 * Math.tan(L.top * Math.PI / 360);
      var A = [180, 40], B = [180 - hb, 180], C = [180 + hb, 180], D = [180, 180];
      var s = '<svg viewBox="0 0 360 210" style="width:100%;max-width:420px">';
      s += '<polygon points="' + A[0] + ',' + A[1] + ' ' + B[0].toFixed(1) + ',' + B[1] + ' ' + C[0].toFixed(1) + ',' + C[1] + '" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/>';
      if (shown) {
        s += '<line x1="' + A[0] + '" y1="' + A[1] + '" x2="' + D[0] + '" y2="' + D[1] + '" stroke="#d33" stroke-width="2" stroke-dasharray="6 4"/>';
        s += '<text x="' + (A[0] + 8) + '" y="' + (A[1] + 90) + '" font-size="12" fill="#d33">AD：顶角平分线</text>';
        s += '<text x="' + (B[0] + 8).toFixed(1) + '" y="' + (B[1] - 10) + '" font-size="13" fill="#2563eb">∠B ' + base + '°</text>';
        s += '<text x="' + (C[0] - 52).toFixed(1) + '" y="' + (C[1] - 10) + '" font-size="13" fill="#2563eb">∠C ' + base + '°</text>';
      }
      s += '<text x="' + (A[0] - 8) + '" y="' + (A[1] - 8) + '" font-size="13">顶角 ' + L.top + '°</text>';
      s += '<text x="' + (A[0] - 6) + '" y="' + (A[1] + 16) + '" font-size="12">A</text>';
      s += '<text x="' + (B[0] - 4).toFixed(1) + '" y="' + (B[1] + 18) + '" font-size="12">B</text>';
      s += '<text x="' + (C[0] - 4).toFixed(1) + '" y="' + (C[1] + 18) + '" font-size="12">C</text>';
      s += '</svg>';
      gid(K + '-svg').innerHTML = s;
    }
    function setLevel(i) {
      levelIdx = i; guessed = -1; shown = false;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var bj = gid(K + '-level-' + j);
        if (bj) bj.setAttribute('aria-pressed', String(j === i));
      }
      msg('先猜一猜，再点“画出 AD”。');
      render();
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜 ' + LEVELS[levelIdx].opts[g] + '。点“画出 AD”验证。');
        });
      })(g);
    }
    gid(K + '-show').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜，再点“画出 AD”。'); return; }
      shown = true;
      render();
      var L = LEVELS[levelIdx], ok = guessed === L.ans;
      msg(L.note + (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再看一遍 SAS 的三组相等。'));
      if (ok) {
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：∠B ＝ ∠C ＝ 70°', '提高：∠B ＝ ∠C ＝ 40°', '挑战：缺夹角'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm84-two',
  title: '分类讨论两解法',
  sub: '一腰上的高与另一腰夹角 40°，顶角是多少？一个条件、两个答案：高在形内是一种，高在形外是另一种，漏掉一个就丢分。',
  grade: 8,
  kind: '演示',
  points: ['8.4'],
  render: function (el) {
    var K = 'm84-two';
    var LEVELS = [
      { label: '基础', gap: 40, acute: 50, obtuse: 130, oH: 60, note: '高与腰夹角 40°：高在形内时顶角 ＝ 90° − 40° ＝ 50°；高在形外时顶角 ＝ 180° − 50° ＝ 130°。一个条件，两个答案。' },
      { label: '提高', gap: 25, acute: 65, obtuse: 115, oH: 60, note: '高与腰夹角 25°：高在形内时顶角 ＝ 90° − 25° ＝ 65°；高在形外时顶角 ＝ 180° − 65° ＝ 115°。' },
      { label: '挑战', gap: 55, acute: 35, obtuse: 145, oH: 40, note: '高与腰夹角 55°：高在形内时顶角 ＝ 90° − 55° ＝ 35°；高在形外时顶角 ＝ 180° − 35° ＝ 145°。' }
    ];
    var levelIdx = 0, guessed = -1, tiers = null, shown = false;
    el.innerHTML =
      '<p class="demo-tag">演示 · 8 年级 · 等腰三角形</p>' +
      '<h3>分类讨论两解法</h3>' +
      '<p>等腰三角形一腰上的高，与另一腰的夹角是 40°，顶角是多少度？先猜有几个答案，再看两种画法。</p>' +
      '<p>第 1 步 · 先猜：这道题有几个答案？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button">1 个</button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button">2 个</button></div>' +
      '<p>第 2 步 · 画两种情况：<button class="btn small primary" id="' + K + '-show" type="button">画出来看看</button></p>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点“画出来看看”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 夹角 40°</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 夹角 25°</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 夹角 55°</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出两个顶角，并且能说出“高在形内一种、高在形外一种”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function foot(P, A, C) {
      var ax = C[0] - A[0], ay = C[1] - A[1];
      var t = ((P[0] - A[0]) * ax + (P[1] - A[1]) * ay) / (ax * ax + ay * ay);
      return [A[0] + t * ax, A[1] + t * ay];
    }
    function triSvg(A, B, C, H, top, gap, title) {
      var s = '<svg viewBox="0 0 320 260" style="width:48%;max-width:260px;display:inline-block;vertical-align:top">';
      s += '<text x="8" y="18" font-size="13">' + title + '</text>';
      s += '<polygon points="' + A[0].toFixed(1) + ',' + A[1].toFixed(1) + ' ' + B[0].toFixed(1) + ',' + B[1].toFixed(1) + ' ' + C[0].toFixed(1) + ',' + C[1].toFixed(1) + '" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/>';
      var ax = C[0] - A[0], ay = C[1] - A[1];
      var t = ((H[0] - A[0]) * ax + (H[1] - A[1]) * ay) / (ax * ax + ay * ay);
      if (t < 0) {
        s += '<line x1="' + A[0].toFixed(1) + '" y1="' + A[1].toFixed(1) + '" x2="' + H[0].toFixed(1) + '" y2="' + H[1].toFixed(1) + '" stroke="#d33" stroke-width="1.5" stroke-dasharray="4 3"/>';
        s += '<text x="' + ((A[0] + H[0]) / 2 - 10).toFixed(1) + '" y="' + ((A[1] + H[1]) / 2 - 6).toFixed(1) + '" font-size="11" fill="#d33">AC 的延长线</text>';
      } else if (t > 1) {
        s += '<line x1="' + C[0].toFixed(1) + '" y1="' + C[1].toFixed(1) + '" x2="' + H[0].toFixed(1) + '" y2="' + H[1].toFixed(1) + '" stroke="#d33" stroke-width="1.5" stroke-dasharray="4 3"/>';
      }
      s += '<line x1="' + B[0].toFixed(1) + '" y1="' + B[1].toFixed(1) + '" x2="' + H[0].toFixed(1) + '" y2="' + H[1].toFixed(1) + '" stroke="#d33" stroke-width="2" stroke-dasharray="6 4"/>';
      s += '<text x="' + (B[0] + 6).toFixed(1) + '" y="' + (B[1] - 10).toFixed(1) + '" font-size="12" fill="#d33">高与腰夹角 ' + gap + '°</text>';
      s += '<text x="' + (A[0] - 30).toFixed(1) + '" y="' + (A[1] - 8).toFixed(1) + '" font-size="13">顶角 ' + top + '°</text>';
      s += '<text x="' + (A[0] - 4).toFixed(1) + '" y="' + (A[1] + 16).toFixed(1) + '" font-size="12">A</text>';
      s += '<text x="' + (B[0] - 4).toFixed(1) + '" y="' + (B[1] + 18).toFixed(1) + '" font-size="12">B</text>';
      s += '<text x="' + (C[0] - 4).toFixed(1) + '" y="' + (C[1] + 18).toFixed(1) + '" font-size="12">C</text>';
      s += '<text x="' + (H[0] + 6).toFixed(1) + '" y="' + (H[1] + 4).toFixed(1) + '" font-size="12" fill="#d33">H</text>';
      s += '</svg>';
      return s;
    }
    function render() {
      var L = LEVELS[levelIdx];
      if (!shown) { gid(K + '-svg').innerHTML = '<p>还没画：先猜，再点“画出来看看”。</p>'; return; }
      var aHb = 145 * Math.tan(L.acute * Math.PI / 360);
      var aA = [160, 25], aB = [160 - aHb, 170], aC = [160 + aHb, 170];
      var aH = foot(aB, aA, aC);
      var oHb = L.oH * Math.tan(L.obtuse * Math.PI / 360);
      var oA = [160, 90], oB = [160 - oHb, 90 + L.oH], oC = [160 + oHb, 90 + L.oH];
      var oH = foot(oB, oA, oC);
      var s = triSvg(aA, aB, aC, aH, L.acute, L.gap, '情况一：高在形内');
      s += triSvg(oA, oB, oC, oH, L.obtuse, L.gap, '情况二：高在形外');
      gid(K + '-svg').innerHTML = s;
    }
    function setLevel(i) {
      levelIdx = i; guessed = -1; shown = false;
      for (var j = 0; j < 3; j++) {
        var bj = gid(K + '-level-' + j);
        if (bj) bj.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-g0').disabled = false;
      gid(K + '-g1').disabled = false;
      msg('先猜一猜，再点“画出来看看”。');
      render();
    }
    gid(K + '-g0').addEventListener('click', function () { guessed = 0; msg('你猜 1 个答案。画出来看看会不会漏。'); });
    gid(K + '-g1').addEventListener('click', function () { guessed = 1; msg('你猜 2 个答案。画出来验证。'); });
    gid(K + '-show').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜，再点“画出来看看”。'); return; }
      shown = true;
      render();
      var L = LEVELS[levelIdx], ok = guessed === 1;
      msg(L.note + (ok ? '你猜对了：两个答案都不能漏！' : '你刚才猜了 1 个，漏了高在形外那一种。'));
      if (ok) {
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：50° 或 130°', '提高：65° 或 115°', '挑战：35° 或 145°'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm85-rules',
  title: '法则表推导法',
  sub: '指数法则不是背下来的，是数出来的：把幂展开成一串乘法，a 的个数加一加，法则自己就出来了。',
  grade: 8,
  kind: '演示',
  points: ['8.5'],
  render: function (el) {
    var K = 'm85-rules';
    var LEVELS = [
      { label: '基础', q: '(2a)³ 等于多少？', opts: ['8a³', '6a³', '2a³'], ans: 0, steps: ['(2a)³ ＝ 2a · 2a · 2a', '系数：2 × 2 × 2 ＝ 8', 'a 的个数：1 ＋ 1 ＋ 1 ＝ 3', '所以 (2a)³ ＝ 8a³'], note: '积的乘方：每个因数都要乘方，系数 2 也要三次方，不是只乘一次。' },
      { label: '提高', q: '(a²)³ 等于多少？', opts: ['a⁶', 'a⁵', 'a⁹'], ans: 0, steps: ['(a²)³ ＝ a² · a² · a²', '指数相加：2 ＋ 2 ＋ 2 ＝ 6', '所以 (a²)³ ＝ a⁶', '幂的乘方，指数相乘：2 × 3 ＝ 6'], note: '易错点：(a²)³ 是 a⁶，不是 a⁵——指数是相加（2＋2＋2），不是相乘后少算。' },
      { label: '挑战', q: '(3a²)² 等于多少？', opts: ['9a⁴', '3a⁴', '6a⁴'], ans: 0, steps: ['(3a²)² ＝ 3a² · 3a²', '系数：3 × 3 ＝ 9', 'a 的指数：2 ＋ 2 ＝ 4', '所以 (3a²)² ＝ 9a⁴'], note: '两处都要算：系数 3² ＝ 9，a 的指数 2＋2 ＝ 4，漏掉任何一处都会错。' }
    ];
    var levelIdx = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 8 年级 · 幂的运算与整式的乘法</p>' +
      '<h3>法则表推导法</h3>' +
      '<p>指数就是“a 写了几次”。先猜答案，再把幂展开成一串乘法、数一数 a 的个数。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 展开数一数：<button class="btn small primary" id="' + K + '-expand" type="button">展开看看</button></p>' +
      '<p id="' + K + '-steps"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再点“展开看看”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · (2a)³</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · (a²)³</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · (3a²)²</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都展开数对，并且能说出“积的乘方每个因数都要乘方，幂的乘方指数相乘”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function setLevel(i) {
      levelIdx = i; guessed = -1;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var bj = gid(K + '-level-' + j);
        if (bj) bj.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-steps').textContent = '';
      msg('先猜一猜，再点“展开看看”。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜 ' + LEVELS[levelIdx].opts[g] + '。点“展开看看”数一数。');
        });
      })(g);
    }
    gid(K + '-expand').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜，再点“展开看看”。'); return; }
      var L = LEVELS[levelIdx], ok = guessed === L.ans;
      gid(K + '-steps').textContent = L.steps.join('；');
      msg(L.note + (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再数一遍 a 的个数。'));
      if (ok) {
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：(2a)³ ＝ 8a³', '提高：(a²)³ ＝ a⁶', '挑战：(3a²)² ＝ 9a⁴'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm86-foil',
  title: '分配律展开法',
  sub: '两个括号相乘，就是前面的每一项乘后面的每一项：四项写出来，中间两项一抵消，平方差就露出来了。',
  grade: 8,
  kind: '演示',
  points: ['8.6'],
  render: function (el) {
    var K = 'm86-foil';
    var LEVELS = [
      { label: '基础', q: '(x ＋ 3)(x − 3) 等于多少？', opts: ['x² − 9', 'x² ＋ 9', 'x² − 6x − 9'], ans: 0, terms: ['x · x ＝ x²', 'x · (−3) ＝ −3x', '3 · x ＝ ＋3x', '3 · (−3) ＝ −9'], cancel: '−3x 和 ＋3x 抵消了', result: '(x ＋ 3)(x − 3) ＝ x² − 9', note: '中间两项一正一负正好抵消，只剩两头：平方差就是这样来的。' },
      { label: '提高', q: '(2x ＋ 5)(2x − 5) 等于多少？', opts: ['4x² − 25', '4x² ＋ 25', '4x² − 20x − 25'], ans: 0, terms: ['2x · 2x ＝ 4x²', '2x · (−5) ＝ −10x', '5 · 2x ＝ ＋10x', '5 · (−5) ＝ −25'], cancel: '−10x 和 ＋10x 抵消了', result: '(2x ＋ 5)(2x − 5) ＝ 4x² − 25', note: '系数也照样算：2x · 2x ＝ 4x²，5 · (−5) ＝ −25，中间项还是抵消。' },
      { label: '挑战', q: '(a ＋ b)² ＝ (a ＋ b)(a ＋ b) 等于多少？', opts: ['a² ＋ 2ab ＋ b²', 'a² ＋ b²', 'a² − 2ab ＋ b²'], ans: 0, terms: ['a · a ＝ a²', 'a · b ＝ ab', 'b · a ＝ ab', 'b · b ＝ b²'], cancel: 'ab 和 ab 不抵消，合起来是 2ab', result: '(a ＋ b)² ＝ a² ＋ 2ab ＋ b²', note: '这次中间项是两个 ＋ab，不抵消：完全平方公式里的 2ab 就是这么来的，丢了它就错了。' }
    ];
    var levelIdx = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 8 年级 · 乘法公式</p>' +
      '<h3>分配律展开法</h3>' +
      '<p>括号乘括号别急着背公式：逐项乘开，四项排好队，看看哪两项抵消、哪两项合并。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 逐项乘：<button class="btn small primary" id="' + K + '-expand" type="button">逐项乘开</button></p>' +
      '<p id="' + K + '-terms"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再点“逐项乘开”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · (x＋3)(x−3)</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · (2x＋5)(2x−5)</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · (a＋b)²</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都逐项乘对，并且能说出“平方差是中间项抵消，完全平方是中间项变成 2ab”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function setLevel(i) {
      levelIdx = i; guessed = -1;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var bj = gid(K + '-level-' + j);
        if (bj) bj.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-terms').textContent = '';
      msg('先猜一猜，再点“逐项乘开”。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜 ' + LEVELS[levelIdx].opts[g] + '。点“逐项乘开”验证。');
        });
      })(g);
    }
    gid(K + '-expand').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜，再点“逐项乘开”。'); return; }
      var L = LEVELS[levelIdx], ok = guessed === L.ans;
      gid(K + '-terms').textContent = L.terms.join('；') + '。' + L.cancel + '。' + L.result + '。';
      msg(L.note + (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再看一遍四项。'));
      if (ok) {
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：x² − 9', '提高：4x² − 25', '挑战：a² ＋ 2ab ＋ b²'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm86-quick',
  title: '数字速算法',
  sub: '101 × 99 不用竖式：把它拆成 (100＋1)(100−1)，平方差一算，答案比竖式先出来。',
  grade: 8,
  kind: '演示',
  points: ['8.6'],
  render: function (el) {
    var K = 'm86-quick';
    var LEVELS = [
      { label: '基础', q: '101 × 99 等于多少？', opts: ['9999', '10000', '9990'], ans: 0, steps: ['101 × 99 ＝ (100 ＋ 1)(100 − 1)', '平方差：100² − 1² ＝ 10000 − 1', '＝ 9999'], note: '101 和 99 都离 100 差 1：一个加 1、一个减 1，正好凑成平方差。' },
      { label: '提高', q: '98 × 102 等于多少？', opts: ['9996', '10000', '9998'], ans: 0, steps: ['98 × 102 ＝ (100 − 2)(100 ＋ 2)', '平方差：100² − 2² ＝ 10000 − 4', '＝ 9996'], note: '98 和 102 离 100 差 2：平方差里的减数是 2² ＝ 4，不是 2。' },
      { label: '挑战', q: '47 × 53 等于多少？', opts: ['2491', '2500', '2499'], ans: 0, steps: ['47 × 53 ＝ (50 − 3)(50 ＋ 3)', '平方差：50² − 3² ＝ 2500 − 9', '＝ 2491'], note: '47 和 53 离 50 差 3：中间数不是 100 也可以，找两个数共同的“中间数”就行。' }
    ];
    var levelIdx = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 8 年级 · 乘法公式</p>' +
      '<h3>数字速算法</h3>' +
      '<p>乘法公式不只是字母题：两个数离同一个整十、整百一样远，就能拆成平方差，心算比竖式快。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 拆成平方差：<button class="btn small primary" id="' + K + '-split" type="button">拆开算</button></p>' +
      '<p id="' + K + '-steps"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再点“拆开算”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 101×99</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 98×102</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 47×53</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都拆对，并且能说出“找中间数、拆成平方差”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function setLevel(i) {
      levelIdx = i; guessed = -1;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var bj = gid(K + '-level-' + j);
        if (bj) bj.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-steps').textContent = '';
      msg('先猜一猜，再点“拆开算”。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜 ' + LEVELS[levelIdx].opts[g] + '。点“拆开算”验证。');
        });
      })(g);
    }
    gid(K + '-split').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜，再点“拆开算”。'); return; }
      var L = LEVELS[levelIdx], ok = guessed === L.ans;
      gid(K + '-steps').textContent = L.steps.join('；') + '。';
      msg(L.note + (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再看一遍拆法。'));
      if (ok) {
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：101×99 ＝ 9999', '提高：98×102 ＝ 9996', '挑战：47×53 ＝ 2491'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm87-tiles',
  title: '代数块拼长方形法',
  sub: '因式分解就是反过来拼长方形：把 x²、x 条、单位块拼成一个严丝合缝的长方形，长和宽就是两个因式。',
  grade: 8,
  kind: '模拟',
  points: ['8.7'],
  render: function (el) {
    var K = 'm87-tiles';
    var LEVELS = [
      { label: '基础', p: 5, q: 6, pairs: [[2, 3], [1, 6], [2, 2]], ans: 0, target: 'x² ＋ 5x ＋ 6' },
      { label: '提高', p: 7, q: 12, pairs: [[3, 4], [2, 6], [3, 3]], ans: 0, target: 'x² ＋ 7x ＋ 12' },
      { label: '挑战', p: 8, q: 15, pairs: [[3, 5], [1, 15], [5, 5]], ans: 0, target: 'x² ＋ 8x ＋ 15' }
    ];
    var levelIdx = 0, guessed = -1, tiers = null, picked = -1;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 8 年级 · 因式分解</p>' +
      '<h3>代数块拼长方形法</h3>' +
      '<p>一块 x²、一堆 x 条、一堆单位块，拼成一个长方形才算分解对：x 条的根数要对得上，单位块的个数也要对得上。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 拼一拼：<button class="btn small primary" id="' + K + '-build" type="button">拼成长方形</button></p>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-counts"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再点“拼成长方形”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · x²＋5x＋6</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · x²＋7x＋12</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · x²＋8x＋15</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都拼出严丝合缝的长方形，并且能说出“长和宽就是两个因式，相乘是 q、相加是 p”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function render() {
      if (picked < 0) { gid(K + '-svg').innerHTML = ''; gid(K + '-counts').textContent = ''; return; }
      var L = LEVELS[levelIdx], a = L.pairs[picked][0], b = L.pairs[picked][1];
      var u = 12, x = 3 * u, ox = 20, oy = 20;
      var s = '<svg viewBox="0 0 260 260" style="width:100%;max-width:300px">';
      s += '<rect x="' + ox + '" y="' + oy + '" width="' + x + '" height="' + x + '" fill="#93c5fd" stroke="#2563eb" stroke-width="2"/>';
      s += '<text x="' + (ox + 6) + '" y="' + (oy + 22) + '" font-size="12">x²</text>';
      var i, j;
      for (i = 0; i < a; i++) {
        s += '<rect x="' + (ox + x + i * u) + '" y="' + oy + '" width="' + u + '" height="' + x + '" fill="#86efac" stroke="#16a34a" stroke-width="1"/>';
      }
      for (j = 0; j < b; j++) {
        s += '<rect x="' + ox + '" y="' + (oy + x + j * u) + '" width="' + x + '" height="' + u + '" fill="#86efac" stroke="#16a34a" stroke-width="1"/>';
      }
      for (i = 0; i < a; i++) {
        for (j = 0; j < b; j++) {
          s += '<rect x="' + (ox + x + i * u) + '" y="' + (oy + x + j * u) + '" width="' + u + '" height="' + u + '" fill="#fdba74" stroke="#d33" stroke-width="1"/>';
        }
      }
      s += '<text x="' + ox + '" y="' + (oy + x + b * u + 18) + '" font-size="12">长 x ＋ ' + a + '，宽 x ＋ ' + b + '</text>';
      s += '</svg>';
      gid(K + '-svg').innerHTML = s;
      gid(K + '-counts').textContent = '拼出来的块：x² 块 1 个，x 条 ' + (a + b) + ' 根，单位块 ' + (a * b) + ' 个。题目要：x 条 ' + L.p + ' 根，单位块 ' + L.q + ' 个。';
    }
    function setLevel(i) {
      levelIdx = i; guessed = -1; picked = -1;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = '把 ' + L.target + ' 拼成长方形，长和宽是哪两个因式？';
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = '(x ＋ ' + L.pairs[k][0] + ')(x ＋ ' + L.pairs[k][1] + ')';
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var bj = gid(K + '-level-' + j);
        if (bj) bj.setAttribute('aria-pressed', String(j === i));
      }
      msg('先猜一猜，再点“拼成长方形”。');
      render();
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g; picked = g;
          msg('你猜 (x ＋ ' + LEVELS[levelIdx].pairs[g][0] + ')(x ＋ ' + LEVELS[levelIdx].pairs[g][1] + ')。点“拼成长方形”验证。');
        });
      })(g);
    }
    gid(K + '-build').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜，再点“拼成长方形”。'); return; }
      render();
      var L = LEVELS[levelIdx], a = L.pairs[picked][0], b = L.pairs[picked][1];
      var ok = (a + b === L.p) && (a * b === L.q);
      if (ok) {
        msg('拼满了！' + L.target + ' ＝ (x ＋ ' + a + ')(x ＋ ' + b + ')：' + a + ' ＋ ' + b + ' ＝ ' + L.p + '，' + a + ' × ' + b + ' ＝ ' + L.q + '，两边都对得上。你猜对了！');
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      } else {
        var bit = '';
        if (a + b !== L.p) bit += 'x 条应该是 ' + L.p + ' 根，这里是 ' + (a + b) + ' 根；';
        if (a * b !== L.q) bit += '单位块应该是 ' + L.q + ' 个，这里是 ' + (a * b) + ' 个；';
        msg('拼不严：' + bit + '长方形拼不成，换一对因式再试。');
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：(x＋2)(x＋3)', '提高：(x＋3)(x＋4)', '挑战：(x＋3)(x＋5)'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm87-gcf',
  title: '先提公因式再套公式法',
  sub: '因式分解要分彻底：先把每一项都有的公因式提出来，再看括号里能不能套公式——停在半路等于没分完。',
  grade: 8,
  kind: '演示',
  points: ['8.7'],
  render: function (el) {
    var K = 'm87-gcf';
    var LEVELS = [
      { label: '基础', expr: '2x² − 8', s1: ['提 2', '提 x', '提 2x'], s1ans: 0, s1why: '公因式是 2：2x² 和 8 都有因数 2。', after1: '2(x² − 4)', s2: ['平方差：(x ＋ 2)(x − 2)', '完全平方', '已经分完了'], s2ans: 0, tip: 'x² − 4 还能再分：4 是 2²，别停在半路。', result: '2x² − 8 ＝ 2(x ＋ 2)(x − 2)' },
      { label: '提高', expr: '3x² − 27', s1: ['提 3', '提 x', '提 3x'], s1ans: 0, s1why: '公因式是 3：3x² 和 27 都有因数 3。', after1: '3(x² − 9)', s2: ['平方差：(x ＋ 3)(x − 3)', '完全平方', '已经分完了'], s2ans: 0, tip: 'x² − 9 还能再分：9 是 3²，别停在半路。', result: '3x² − 27 ＝ 3(x ＋ 3)(x − 3)' },
      { label: '挑战', expr: 'x³ − 4x', s1: ['提 x', '提 2', '提 x²'], s1ans: 0, s1why: '公因式是 x：x³ 和 4x 都有因式 x。', after1: 'x(x² − 4)', s2: ['平方差：(x ＋ 2)(x − 2)', '完全平方', '已经分完了'], s2ans: 0, tip: 'x² − 4 还能再分：4 是 2²，别停在半路。', result: 'x³ − 4x ＝ x(x ＋ 2)(x − 2)' }
    ];
    var levelIdx = 0, guessed = -1, step1ok = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 8 年级 · 因式分解</p>' +
      '<h3>先提公因式再套公式法</h3>' +
      '<p>分解要彻底，分两步走：第一步提公因式，第二步套公式。先猜第一步，再猜第二步。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p id="' + K + '-step1"></p>' +
      '<p>第 2 步 · 套哪个公式？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-s0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-s1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-s2" type="button"></button></div>' +
      '<p id="' + K + '-msg">先猜第一步：提什么？</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 2x²−8</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 3x²−27</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · x³−4x</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都“先提干净、再套公式”，并且能说出“分解要彻底，括号里还能分就不能停”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function setLevel(i) {
      levelIdx = i; guessed = -1; step1ok = false;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = '把 ' + L.expr + ' 分解，第一步提什么？';
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.s1[k];
        gid(K + '-s' + k).textContent = L.s2[k];
        gid(K + '-g' + k).disabled = false;
        gid(K + '-s' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var bj = gid(K + '-level-' + j);
        if (bj) bj.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-step1').textContent = '';
      msg('先猜第一步：提什么？');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          var L = LEVELS[levelIdx];
          guessed = g;
          if (g === L.s1ans) {
            step1ok = true;
            gid(K + '-step1').textContent = '第一步对了：' + L.expr + ' ＝ ' + L.after1 + '。';
            msg(L.s1why + '再猜第二步：括号里套哪个公式？');
          } else {
            step1ok = false;
            gid(K + '-step1').textContent = '';
            msg('不对：' + L.s1why + '再想想第一步提什么。');
          }
        });
        gid(K + '-s' + g).addEventListener('click', function () {
          var L = LEVELS[levelIdx];
          if (!step1ok) { msg('先把第一步猜对：提什么？'); return; }
          if (g === L.s2ans) {
            msg('分完了！' + L.result + '。你两步都猜对了！');
            if (tiers) tiers.done(levelIdx);
            if (typeof markTried === 'function') markTried(K);
          } else if (g === 2) {
            msg(L.tip);
          } else {
            msg('不对：括号里是平方差的样子，不是完全平方。再看看。');
          }
        });
      })(g);
    }
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：2(x＋2)(x−2)', '提高：3(x＋3)(x−3)', '挑战：x(x＋2)(x−2)'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm87-zero',
  title: '从图像零点读因式法',
  sub: '抛物线和 x 轴交在哪里，因式就藏在那里：交点横坐标是根，根反过来就是因式。',
  grade: 8,
  kind: '模拟',
  points: ['8.7'],
  render: function (el) {
    var K = 'm87-zero';
    var LEVELS = [
      { label: '基础', p: -5, q: 6, r1: 2, r2: 3, xmin: -1, xmax: 6, ymin: -1, ymax: 7, expr: 'x² − 5x ＋ 6', opts: ['(x − 2)(x − 3)', '(x ＋ 2)(x ＋ 3)', '(x − 2)(x ＋ 3)'], ans: 0, note: '零点是 2 和 3：x ＝ 2 时 y ＝ 0，x ＝ 3 时 y ＝ 0，所以因式是 (x − 2)(x − 3)。展开验算：(x − 2)(x − 3) ＝ x² − 5x ＋ 6，对得上。' },
      { label: '提高', p: -4, q: -5, r1: 5, r2: -1, xmin: -3, xmax: 7, ymin: -10, ymax: 12, expr: 'x² − 4x − 5', opts: ['(x − 5)(x ＋ 1)', '(x ＋ 5)(x − 1)', '(x − 5)(x − 1)'], ans: 0, note: '零点是 5 和 −1：因式是 (x − 5)(x ＋ 1)。展开验算：(x − 5)(x ＋ 1) ＝ x² − 4x − 5，对得上。负的零点对应 (x ＋ 1)，符号别写反。' },
      { label: '挑战', p: 2, q: -8, r1: 2, r2: -4, xmin: -6, xmax: 4, ymin: -10, ymax: 12, expr: 'x² ＋ 2x − 8', opts: ['(x − 2)(x ＋ 4)', '(x ＋ 2)(x − 4)', '(x − 2)(x − 4)'], ans: 0, note: '零点是 2 和 −4：因式是 (x − 2)(x ＋ 4)。展开验算：(x − 2)(x ＋ 4) ＝ x² ＋ 2x − 8，对得上。' }
    ];
    var levelIdx = 0, guessed = -1, tiers = null, shown = false;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 8 年级 · 因式分解</p>' +
      '<h3>从图像零点读因式法</h3>' +
      '<p>y ＝ x² ＋ px ＋ q 的图像是一条抛物线，它和 x 轴的交点就是方程的根，根就是因式。先猜因式，再画图验证。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 画图像：<button class="btn small primary" id="' + K + '-draw" type="button">画图像、标零点</button></p>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点“画图像、标零点”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · x²−5x＋6</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · x²−4x−5</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · x²＋2x−8</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都从零点读出因式，并且能说出“零点是根，根就是因式”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function render() {
      var L = LEVELS[levelIdx];
      function px(v) { return 20 + (v - L.xmin) / (L.xmax - L.xmin) * 320; }
      function py(v) { return 220 - (v - L.ymin) / (L.ymax - L.ymin) * 200; }
      var s = '<svg viewBox="0 0 360 240" style="width:100%;max-width:420px">';
      if (L.ymin < 0 && L.ymax > 0) {
        s += '<line x1="20" y1="' + py(0).toFixed(1) + '" x2="340" y2="' + py(0).toFixed(1) + '" stroke="#333" stroke-width="1.5"/>';
      }
      if (L.xmin < 0 && L.xmax > 0) {
        s += '<line x1="' + px(0).toFixed(1) + '" y1="10" x2="' + px(0).toFixed(1) + '" y2="230" stroke="#333" stroke-width="1.5"/>';
      }
      if (shown) {
        var pts = [], x;
        for (x = L.xmin; x <= L.xmax; x += 0.1) {
          var y = x * x + L.p * x + L.q;
          pts.push(px(x).toFixed(1) + ',' + py(y).toFixed(1));
        }
        s += '<polyline points="' + pts.join(' ') + '" fill="none" stroke="#2563eb" stroke-width="2"/>';
        s += '<circle cx="' + px(L.r1).toFixed(1) + '" cy="' + py(0).toFixed(1) + '" r="6" fill="#f80" stroke="#333" stroke-width="1.5"/>';
        s += '<circle cx="' + px(L.r2).toFixed(1) + '" cy="' + py(0).toFixed(1) + '" r="6" fill="#f80" stroke="#333" stroke-width="1.5"/>';
        s += '<text x="' + (px(L.r1) - 6).toFixed(1) + '" y="' + (py(0) - 10).toFixed(1) + '" font-size="13" fill="#d33">x ＝ ' + L.r1 + '</text>';
        s += '<text x="' + (px(L.r2) - 6).toFixed(1) + '" y="' + (py(0) - 10).toFixed(1) + '" font-size="13" fill="#d33">x ＝ ' + L.r2 + '</text>';
        s += '<text x="250" y="24" font-size="12">y ＝ ' + L.expr + '</text>';
      }
      s += '</svg>';
      gid(K + '-svg').innerHTML = s;
    }
    function setLevel(i) {
      levelIdx = i; guessed = -1; shown = false;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = 'y ＝ ' + L.expr + ' 的因式是哪个？';
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var bj = gid(K + '-level-' + j);
        if (bj) bj.setAttribute('aria-pressed', String(j === i));
      }
      msg('先猜一猜，再点“画图像、标零点”。');
      render();
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜 ' + LEVELS[levelIdx].opts[g] + '。点“画图像、标零点”验证。');
        });
      })(g);
    }
    gid(K + '-draw').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜，再点“画图像、标零点”。'); return; }
      shown = true;
      render();
      var L = LEVELS[levelIdx], ok = guessed === L.ans;
      msg(L.note + (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再看一遍零点。'));
      if (ok) {
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：(x−2)(x−3)', '提高：(x−5)(x＋1)', '挑战：(x−2)(x＋4)'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm88-factor',
  title: '先因式分解再约分法',
  sub: '分式约分不能乱约：先把分子分母因式分解，约掉乘积里的公因式；加号里的项，再想约也约不掉。',
  grade: 8,
  kind: '演示',
  points: ['8.8'],
  render: function (el) {
    var K = 'm88-factor';
    var LEVELS = [
      { label: '基础', expr: '(x² − 9) ÷ (x ＋ 3)', s1: ['(x ＋ 3)(x − 3)', '(x ＋ 9)(x − 1)', 'x(x − 9)'], s1ans: 0, s1why: 'x² − 9 是平方差：9 是 3²，所以 x² − 9 ＝ (x ＋ 3)(x − 3)。', after1: '分子 ＝ (x ＋ 3)(x − 3)', s2: ['约掉 (x ＋ 3)', '约掉 x² 和 x', '约掉 9 和 3'], s2ans: 0, tip: '约分只能约乘积里的公因式：9 和 3 不在乘积里，加号里的项约不掉。', result: '(x² − 9) ÷ (x ＋ 3) ＝ x − 3' },
      { label: '提高', expr: '(x² − 4) ÷ (x − 2)', s1: ['(x ＋ 2)(x − 2)', '(x ＋ 4)(x − 1)', '(x − 4)(x ＋ 1)'], s1ans: 0, s1why: 'x² − 4 是平方差：4 是 2²，所以 x² − 4 ＝ (x ＋ 2)(x − 2)。', after1: '分子 ＝ (x ＋ 2)(x − 2)', s2: ['约掉 (x − 2)', '约掉 4 和 2', '约掉 x² 和 x'], s2ans: 0, tip: '约分只能约乘积里的公因式：x² 和 x 不在乘积里，约不掉。', result: '(x² − 4) ÷ (x − 2) ＝ x ＋ 2' },
      { label: '挑战', expr: '(x² ＋ 5x ＋ 6) ÷ (x ＋ 2)', s1: ['(x ＋ 2)(x ＋ 3)', '(x ＋ 1)(x ＋ 6)', '(x ＋ 5)(x ＋ 1)'], s1ans: 0, s1why: '(x ＋ 2)(x ＋ 3) 展开是 x² ＋ 5x ＋ 6：2 ＋ 3 ＝ 5，2 × 3 ＝ 6。', after1: '分子 ＝ (x ＋ 2)(x ＋ 3)', s2: ['约掉 (x ＋ 2)', '约掉 5x 和 2', '约掉 6 和 2'], s2ans: 0, tip: '约分只能约乘积里的公因式：5x 和 2 在加号里，约不掉。', result: '(x² ＋ 5x ＋ 6) ÷ (x ＋ 2) ＝ x ＋ 3' }
    ];
    var levelIdx = 0, guessed = -1, step1ok = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 8 年级 · 分式及其运算</p>' +
      '<h3>先因式分解再约分法</h3>' +
      '<p>分子是多项式，别急着约：第一步先把它因式分解，第二步再约乘积里的公因式。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p id="' + K + '-step1"></p>' +
      '<p>第 2 步 · 约掉哪个？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-s0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-s1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-s2" type="button"></button></div>' +
      '<p id="' + K + '-msg">先猜第一步：分子分解成什么？</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · (x²−9)÷(x＋3)</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · (x²−4)÷(x−2)</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · (x²＋5x＋6)÷(x＋2)</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都“先分解、再约分”，并且能说出“只能约乘积里的公因式，加号里的项约不掉”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function setLevel(i) {
      levelIdx = i; guessed = -1; step1ok = false;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = '算 ' + L.expr + '，分子先分解成什么？';
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.s1[k];
        gid(K + '-s' + k).textContent = L.s2[k];
        gid(K + '-g' + k).disabled = false;
        gid(K + '-s' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var bj = gid(K + '-level-' + j);
        if (bj) bj.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-step1').textContent = '';
      msg('先猜第一步：分子分解成什么？');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          var L = LEVELS[levelIdx];
          guessed = g;
          if (g === L.s1ans) {
            step1ok = true;
            gid(K + '-step1').textContent = '第一步对了：' + L.after1 + '。';
            msg(L.s1why + '再猜第二步：约掉哪个？');
          } else {
            step1ok = false;
            gid(K + '-step1').textContent = '';
            msg('不对：' + L.s1why + '再想想分子怎么分解。');
          }
        });
        gid(K + '-s' + g).addEventListener('click', function () {
          var L = LEVELS[levelIdx];
          if (!step1ok) { msg('先把第一步猜对：分子分解成什么？'); return; }
          if (g === L.s2ans) {
            msg('约完了！' + L.result + '。你两步都猜对了！');
            if (tiers) tiers.done(levelIdx);
            if (typeof markTried === 'function') markTried(K);
          } else {
            msg(L.tip);
          }
        });
      })(g);
    }
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：x − 3', '提高：x ＋ 2', '挑战：x ＋ 3'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm88-lcd',
  title: '通分找最简公分母法',
  sub: '异分母分式相加，先把分母凑成同一个：最简公分母就是两个分母“最小的公共倍数”，分子跟着一起变。',
  grade: 8,
  kind: '演示',
  points: ['8.8'],
  render: function (el) {
    var K = 'm88-lcd';
    var LEVELS = [
      { label: '基础', q: '1/x ＋ 1/(2x)，最简公分母是？', opts: ['2x', 'x²', '2'], ans: 0, steps: ['最简公分母是 2x', '1/x ＝ 2/(2x)', '2/(2x) ＋ 1/(2x) ＝ 3/(2x)'], note: '通分就是把分母凑成同一个：1/x 的分子分母同乘 2，变成 2/(2x)。' },
      { label: '提高', q: '1/(x ＋ 1) ＋ 1/(x − 1)，最简公分母是？', opts: ['(x ＋ 1)(x − 1)', 'x ＋ 1', 'x² ＋ 1'], ans: 0, steps: ['最简公分母是 (x ＋ 1)(x − 1) ＝ x² − 1', '1/(x ＋ 1) ＝ (x − 1)/(x² − 1)，1/(x − 1) ＝ (x ＋ 1)/(x² − 1)', '(x − 1) ＋ (x ＋ 1) ＝ 2x，所以和是 2x/(x² − 1)'], note: '两个分母没有公共因式，公分母就是它俩相乘：(x ＋ 1)(x − 1) ＝ x² − 1。' },
      { label: '挑战', q: '1/x ＋ 1/(x ＋ 1)，最简公分母是？', opts: ['x(x ＋ 1)', 'x ＋ 1', 'x²'], ans: 0, steps: ['最简公分母是 x(x ＋ 1)', '1/x ＝ (x ＋ 1)/(x(x ＋ 1))，1/(x ＋ 1) ＝ x/(x(x ＋ 1))', '(x ＋ 1) ＋ x ＝ 2x ＋ 1，所以和是 (2x ＋ 1)/(x(x ＋ 1))'], note: 'x 和 x ＋ 1 也没有公共因式，公分母就是它俩相乘。' }
    ];
    var levelIdx = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 8 年级 · 分式及其运算</p>' +
      '<h3>通分找最简公分母法</h3>' +
      '<p>分母不一样就没法直接加：先找最简公分母，两个分式都变成同分母，再加分子。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 通分：<button class="btn small primary" id="' + K + '-go" type="button">通分、相加</button></p>' +
      '<p id="' + K + '-steps"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再点“通分、相加”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 1/x＋1/(2x)</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 1/(x＋1)＋1/(x−1)</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 1/x＋1/(x＋1)</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都找对最简公分母，并且能说出“分子分母同乘，分式值不变”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function setLevel(i) {
      levelIdx = i; guessed = -1;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var bj = gid(K + '-level-' + j);
        if (bj) bj.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-steps').textContent = '';
      msg('先猜一猜，再点“通分、相加”。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜最简公分母是 ' + LEVELS[levelIdx].opts[g] + '。点“通分、相加”验证。');
        });
      })(g);
    }
    gid(K + '-go').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜，再点“通分、相加”。'); return; }
      var L = LEVELS[levelIdx], ok = guessed === L.ans;
      gid(K + '-steps').textContent = L.steps.join('；') + '。';
      msg(L.note + (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再找一遍公分母。'));
      if (ok) {
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：3/(2x)', '提高：2x/(x²−1)', '挑战：(2x＋1)/(x(x＋1))'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm89-graph',
  title: '分式方程图像法',
  sub: '分式方程也能画出来：等号左边画一条曲线，右边画一条直线，交点的横坐标就是解；分母为 0 的地方，图像断开、永远到不了。',
  grade: 8,
  kind: '模拟',
  points: ['8.9'],
  render: function (el) {
    var K = 'm89-graph';
    var LEVELS = [
      { label: '基础', left: '1/x', right: '1', sol: 'x ＝ 1', opts: ['x ＝ 1', 'x ＝ 0', 'x ＝ −1'], ans: 0, xmin: -3, xmax: 4, ymin: -3, ymax: 4, num: 1, shift: 0, la: 0, lb: 1, pts: [[1, 1]], note: 'y ＝ 1/x 和 y ＝ 1 交于 (1, 1)：x ＝ 1 时两边都是 1，方程的解就是交点的横坐标。' },
      { label: '提高', left: '2/x', right: 'x − 1', sol: 'x ＝ 2 或 x ＝ −1', opts: ['x ＝ 2 或 x ＝ −1', 'x ＝ 2', 'x ＝ 1 或 x ＝ −2'], ans: 0, xmin: -3, xmax: 4, ymin: -3, ymax: 4, num: 2, shift: 0, la: 1, lb: -1, pts: [[2, 1], [-1, -2]], note: 'y ＝ 2/x 和 y ＝ x − 1 交于 (2, 1) 和 (−1, −2)：两个交点，两个解。' },
      { label: '挑战', left: '1/(x − 1)', right: '2', sol: 'x ＝ 1.5', opts: ['x ＝ 1.5', 'x ＝ 1', 'x ＝ 2'], ans: 0, xmin: -1, xmax: 4, ymin: -3, ymax: 5, num: 1, shift: 1, la: 0, lb: 2, pts: [[1.5, 2]], note: 'y ＝ 1/(x − 1) 和 y ＝ 2 交于 (1.5, 2)：x ＝ 1.5。注意 x ＝ 1 时分母是 0，图像在那里断开，永远取不到。' }
    ];
    var levelIdx = 0, guessed = -1, tiers = null, shown = false;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 8 年级 · 分式方程</p>' +
      '<h3>分式方程图像法</h3>' +
      '<p>方程 1/x ＝ 1 的解是多少？把两边各画成一条图像，交点横坐标就是答案。先猜解，再画图。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 画两条图像：<button class="btn small primary" id="' + K + '-draw" type="button">画图像、找交点</button></p>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点“画图像、找交点”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 1/x＝1</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 2/x＝x−1</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 1/(x−1)＝2</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都找到交点，并且能说出“方程的解就是两条图像交点的横坐标”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function render() {
      var L = LEVELS[levelIdx];
      function px(v) { return 20 + (v - L.xmin) / (L.xmax - L.xmin) * 320; }
      function py(v) { return 220 - (v - L.ymin) / (L.ymax - L.ymin) * 200; }
      var s = '<svg viewBox="0 0 360 240" style="width:100%;max-width:420px">';
      if (L.ymin < 0 && L.ymax > 0) {
        s += '<line x1="20" y1="' + py(0).toFixed(1) + '" x2="340" y2="' + py(0).toFixed(1) + '" stroke="#333" stroke-width="1.5"/>';
      }
      if (L.xmin < 0 && L.xmax > 0) {
        s += '<line x1="' + px(0).toFixed(1) + '" y1="10" x2="' + px(0).toFixed(1) + '" y2="230" stroke="#333" stroke-width="1.5"/>';
      }
      if (shown) {
        var segs = [], x, y;
        var leftPts = [], rightPts = [];
        for (x = L.xmin; x < L.shift - 0.15; x += 0.05) {
          y = L.num / (x - L.shift);
          leftPts.push(px(x).toFixed(1) + ',' + py(y).toFixed(1));
        }
        for (x = L.shift + 0.15; x <= L.xmax; x += 0.05) {
          y = L.num / (x - L.shift);
          rightPts.push(px(x).toFixed(1) + ',' + py(y).toFixed(1));
        }
        s += '<polyline points="' + leftPts.join(' ') + '" fill="none" stroke="#2563eb" stroke-width="2"/>';
        s += '<polyline points="' + rightPts.join(' ') + '" fill="none" stroke="#2563eb" stroke-width="2"/>';
        var lp = [];
        for (x = L.xmin; x <= L.xmax; x += 0.1) {
          lp.push(px(x).toFixed(1) + ',' + py(L.la * x + L.lb).toFixed(1));
        }
        s += '<polyline points="' + lp.join(' ') + '" fill="none" stroke="#d33" stroke-width="2"/>';
        var i;
        for (i = 0; i < L.pts.length; i++) {
          s += '<circle cx="' + px(L.pts[i][0]).toFixed(1) + '" cy="' + py(L.pts[i][1]).toFixed(1) + '" r="6" fill="#f80" stroke="#333" stroke-width="1.5"/>';
          s += '<text x="' + (px(L.pts[i][0]) + 8).toFixed(1) + '" y="' + (py(L.pts[i][1]) - 8).toFixed(1) + '" font-size="12" fill="#d33">(' + L.pts[i][0] + ', ' + L.pts[i][1] + ')</text>';
        }
        s += '<text x="250" y="24" font-size="12" fill="#2563eb">y ＝ ' + L.left + '</text>';
        s += '<text x="250" y="42" font-size="12" fill="#d33">y ＝ ' + L.right + '</text>';
      }
      s += '</svg>';
      gid(K + '-svg').innerHTML = s;
    }
    function setLevel(i) {
      levelIdx = i; guessed = -1; shown = false;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.left + ' ＝ ' + L.right + ' 的解是？';
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var bj = gid(K + '-level-' + j);
        if (bj) bj.setAttribute('aria-pressed', String(j === i));
      }
      msg('先猜一猜，再点“画图像、找交点”。');
      render();
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜解是 ' + LEVELS[levelIdx].opts[g] + '。点“画图像、找交点”验证。');
        });
      })(g);
    }
    gid(K + '-draw').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜，再点“画图像、找交点”。'); return; }
      shown = true;
      render();
      var L = LEVELS[levelIdx], ok = guessed === L.ans;
      msg(L.note + (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再看一遍交点。'));
      if (ok) {
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：x ＝ 1', '提高：x ＝ 2 或 −1', '挑战：x ＝ 1.5'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm810-area',
  title: '面积边长法',
  sub: '√12 是多少？把它想成面积 12 的正方形的边长：边长拆一拆，√12 和 2√3 原来是同一条边。',
  grade: 8,
  kind: '演示',
  points: ['8.10'],
  render: function (el) {
    var K = 'm810-area';
    var LEVELS = [
      { label: '基础', area: 12, opts: ['2√3', '√6', '3√2'], ans: 0, split: '√12 ＝ √(4 × 3) ＝ 2√3', note: '12 ＝ 4 × 3，4 是平方数：√4 ＝ 2 提出来，√12 ＝ 2√3。面积 12 的正方形，边长就是 2√3。' },
      { label: '提高', area: 18, opts: ['3√2', '2√3', '√9'], ans: 0, split: '√18 ＝ √(9 × 2) ＝ 3√2', note: '18 ＝ 9 × 2，9 是平方数：√9 ＝ 3 提出来，√18 ＝ 3√2。' },
      { label: '挑战', area: 50, opts: ['5√2', '2√5', '10√2'], ans: 0, split: '√50 ＝ √(25 × 2) ＝ 5√2', note: '50 ＝ 25 × 2，25 是平方数：√25 ＝ 5 提出来，√50 ＝ 5√2。' }
    ];
    var levelIdx = 0, guessed = -1, tiers = null, shown = false;
    el.innerHTML =
      '<p class="demo-tag">演示 · 8 年级 · 二次根式</p>' +
      '<h3>面积边长法</h3>' +
      '<p>一个正方形面积是 12，边长是多少？边长就是 √12。先猜边长的简写法，再拆平方因数验证。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 拆平方因数：<button class="btn small primary" id="' + K + '-split" type="button">拆一拆</button></p>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点“拆一拆”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 面积 12</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 面积 18</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 面积 50</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都拆对，并且能说出“根号里拆出平方因数，化简就是给边长换个更简的写法”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function render() {
      var L = LEVELS[levelIdx];
      var side = 30 * Math.sqrt(L.area);
      var ox = (260 - side) / 2, oy = (260 - side) / 2;
      var s = '<svg viewBox="0 0 260 260" style="width:100%;max-width:300px">';
      s += '<rect x="' + ox.toFixed(1) + '" y="' + oy.toFixed(1) + '" width="' + side.toFixed(1) + '" height="' + side.toFixed(1) + '" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/>';
      s += '<text x="130" y="134" font-size="14" text-anchor="middle">面积 ' + L.area + '</text>';
      if (shown) {
        s += '<text x="130" y="' + (oy + side + 20).toFixed(1) + '" font-size="13" text-anchor="middle" fill="#d33">边长 √' + L.area + ' ＝ ' + L.split.split('＝ ')[2] + '</text>';
      } else {
        s += '<text x="130" y="' + (oy + side + 20).toFixed(1) + '" font-size="13" text-anchor="middle">边长 √' + L.area + ' ＝ ？</text>';
      }
      s += '</svg>';
      gid(K + '-svg').innerHTML = s;
    }
    function setLevel(i) {
      levelIdx = i; guessed = -1; shown = false;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = '面积 ' + L.area + ' 的正方形，边长是几倍根号几？';
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var bj = gid(K + '-level-' + j);
        if (bj) bj.setAttribute('aria-pressed', String(j === i));
      }
      msg('先猜一猜，再点“拆一拆”。');
      render();
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜边长是 ' + LEVELS[levelIdx].opts[g] + '。点“拆一拆”验证。');
        });
      })(g);
    }
    gid(K + '-split').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜，再点“拆一拆”。'); return; }
      shown = true;
      render();
      var L = LEVELS[levelIdx], ok = guessed === L.ans;
      msg(L.split + '。' + L.note + (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再拆一遍。'));
      if (ok) {
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：√12 ＝ 2√3', '提高：√18 ＝ 3√2', '挑战：√50 ＝ 5√2'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm811-water',
  title: '水演示体积守恒法',
  sub: '两条直角边上正方形里的水，倒进斜边上的大正方形，正好倒满——勾股定理不是公式，是水自己量出来的。',
  grade: 8,
  kind: '实验',
  points: ['8.11'],
  render: function (el) {
    var K = 'm811-water';
    var LEVELS = [
      { label: '基础', a: 3, b: 4, c: 5, note: '9 ＋ 16 ＝ 25：两小正方形的水正好倒满大正方形，a² ＋ b² ＝ c²。' },
      { label: '提高', a: 5, b: 12, c: 13, note: '25 ＋ 144 ＝ 169：正好倒满，a² ＋ b² ＝ c²。' },
      { label: '挑战', a: 8, b: 15, c: 17, note: '64 ＋ 225 ＝ 289：正好倒满，a² ＋ b² ＝ c²。' }
    ];
    var levelIdx = 0, guessed = -1, tiers = null, pour = 0;
    el.innerHTML =
      '<p class="demo-tag">实验 · 8 年级 · 勾股定理与逆定理</p>' +
      '<h3>水演示体积守恒法</h3>' +
      '<p>直角三角形三条边上各有一个正方形容器，里面装满了水。把两小的水倒进大的，会怎样？先猜，再倒。</p>' +
      '<p>第 1 步 · 先猜：两小正方形的水倒进大正方形，会怎样？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button">正好倒满</button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button">多出来</button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button">不够满</button></div>' +
      '<p>第 2 步 · 倒水：<input type="range" id="' + K + '-pour" min="0" max="100" step="10" value="0" style="width:70%"> <b id="' + K + '-pour-v">0%</b></p>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-vol"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再拖滑杆倒水。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 3-4-5</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 5-12-13</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 8-15-17</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都倒到 100%，并且能说出“两小面积相加等于大面积”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function render() {
      var L = LEVELS[levelIdx], p = pour / 100;
      var s1 = 120 * L.a / L.c, s2 = 120 * L.b / L.c, s3 = 120;
      var x1 = 20, x2 = x1 + s1 + 16, x3 = x2 + s2 + 16, base = 180;
      function box(x, side, fillFrac, label) {
        var s = '';
        s += '<rect x="' + x.toFixed(1) + '" y="' + (base - side).toFixed(1) + '" width="' + side.toFixed(1) + '" height="' + side.toFixed(1) + '" fill="#fff" stroke="#333" stroke-width="2"/>';
        if (fillFrac > 0) {
          s += '<rect x="' + x.toFixed(1) + '" y="' + (base - fillFrac * side).toFixed(1) + '" width="' + side.toFixed(1) + '" height="' + (fillFrac * side).toFixed(1) + '" fill="#38bdf8" opacity="0.7"/>';
        }
        s += '<text x="' + (x + side / 2).toFixed(1) + '" y="' + (base + 18) + '" font-size="12" text-anchor="middle">' + label + '</text>';
        return s;
      }
      var s = '<svg viewBox="0 0 360 220" style="width:100%;max-width:420px">';
      s += box(x1, s1, 1 - p, L.a + '² ＝ ' + (L.a * L.a));
      s += box(x2, s2, 1 - p, L.b + '² ＝ ' + (L.b * L.b));
      s += box(x3, s3, p, L.c + '² ＝ ' + (L.c * L.c));
      s += '</svg>';
      gid(K + '-svg').innerHTML = s;
      gid(K + '-pour-v').textContent = pour + '%';
      var moved = Math.round(p * (L.a * L.a + L.b * L.b));
      gid(K + '-vol').textContent = '已倒出 ' + moved + ' 份水，大正方形能装 ' + (L.c * L.c) + ' 份。';
    }
    function setLevel(i) {
      levelIdx = i; guessed = -1; pour = 0;
      for (var j = 0; j < 3; j++) {
        var bj = gid(K + '-level-' + j);
        if (bj) bj.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-pour').value = '0';
      gid(K + '-g0').disabled = false;
      gid(K + '-g1').disabled = false;
      gid(K + '-g2').disabled = false;
      msg('先猜一猜，再拖滑杆倒水。');
      render();
    }
    gid(K + '-g0').addEventListener('click', function () { guessed = 0; msg('你猜正好倒满。拖滑杆倒水验证。'); });
    gid(K + '-g1').addEventListener('click', function () { guessed = 1; msg('你猜会多出来。拖滑杆倒水验证。'); });
    gid(K + '-g2').addEventListener('click', function () { guessed = 2; msg('你猜不够满。拖滑杆倒水验证。'); });
    gid(K + '-pour').addEventListener('input', function (e) {
      pour = parseInt(e.target.value, 10);
      render();
      if (guessed < 0) { msg('先猜一猜，再拖滑杆倒水。'); return; }
      var L = LEVELS[levelIdx];
      if (pour >= 100) {
        var ok = guessed === 0;
        msg('倒完了！' + L.note + (ok ? '你猜对了！' : '你刚才猜的是“多出来/不够满”，水自己量出来了：正好倒满。'));
        if (ok) {
          if (tiers) tiers.done(levelIdx);
          if (typeof markTried === 'function') markTried(K);
        }
      } else if (pour > 0) {
        msg('正在倒：两小容器水位在降，大容器水位在升。倒到底看看满不满。');
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：9＋16＝25', '提高：25＋144＝169', '挑战：64＋225＝289'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm811-sim',
  title: '相似证明法',
  sub: '从直角顶点向斜边作高，一个直角三角形变成三个相似三角形：对应边一比，a²＋b²＝c² 自己就出来了。',
  grade: 8,
  kind: '演示',
  points: ['8.11'],
  render: function (el) {
    var K = 'm811-sim';
    var LEVELS = [
      { label: '基础', a: 3, b: 4, c: 5, h: '2.4', pA: '3.2', pB: '1.8', opts: ['1.8 和 3.2', '2 和 3', '1.5 和 3.5'], ans: 0, note: '高 h ＝ 3 × 4 ÷ 5 ＝ 2.4；射影：3² ÷ 5 ＝ 1.8，4² ÷ 5 ＝ 3.2；1.8 ＋ 3.2 ＝ 5。相似得：3² ＝ 5 × 1.8 ＝ 9，4² ＝ 5 × 3.2 ＝ 16，相加 9 ＋ 16 ＝ 25 ＝ 5²。' },
      { label: '提高', a: 6, b: 8, c: 10, h: '4.8', pA: '6.4', pB: '3.6', opts: ['3.6 和 6.4', '4 和 6', '3 和 7'], ans: 0, note: '高 h ＝ 6 × 8 ÷ 10 ＝ 4.8；射影：6² ÷ 10 ＝ 3.6，8² ÷ 10 ＝ 6.4；3.6 ＋ 6.4 ＝ 10。6² ＝ 10 × 3.6 ＝ 36，8² ＝ 10 × 6.4 ＝ 64，相加 36 ＋ 64 ＝ 100 ＝ 10²。' },
      { label: '挑战', a: 5, b: 12, c: 13, h: '4.6', pA: '11.1', pB: '1.9', opts: ['1.9 和 11.1', '2 和 11', '1.5 和 11.5'], ans: 0, note: '高 h ＝ 5 × 12 ÷ 13 ≈ 4.6；射影：5² ÷ 13 ≈ 1.9，12² ÷ 13 ≈ 11.1；1.9 ＋ 11.1 ＝ 13。5² ≈ 13 × 1.9 ＝ 25，12² ≈ 13 × 11.1 ＝ 144，相加 25 ＋ 144 ＝ 169 ＝ 13²。' }
    ];
    var levelIdx = 0, guessed = -1, tiers = null, shown = false;
    el.innerHTML =
      '<p class="demo-tag">演示 · 8 年级 · 勾股定理与逆定理</p>' +
      '<h3>相似证明法</h3>' +
      '<p>直角三角形里作一条高，三个三角形两两相似。先猜高把斜边分成哪两段，再看相似怎么推出勾股定理。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 作高：<button class="btn small primary" id="' + K + '-show" type="button">作高、看相似</button></p>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点“作高、看相似”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 3-4-5</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 6-8-10</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 5-12-13</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出两段射影，并且能说出“a²＝c×射影，b²＝c×射影，相加就是 c²”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function render() {
      var L = LEVELS[levelIdx];
      var scale = 240 / L.c;
      var Ax = 60, Ay = 180, Bx = 300, By = 180;
      var Dx = Ax + (L.b * L.b / L.c) * scale;
      var h = L.a * L.b / L.c;
      var Cx = Dx, Cy = Ay - h * scale;
      var s = '<svg viewBox="0 0 360 210" style="width:100%;max-width:420px">';
      s += '<polygon points="' + Ax + ',' + Ay + ' ' + Bx + ',' + By + ' ' + Cx.toFixed(1) + ',' + Cy.toFixed(1) + '" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/>';
      if (shown) {
        s += '<line x1="' + Cx.toFixed(1) + '" y1="' + Cy.toFixed(1) + '" x2="' + Dx.toFixed(1) + '" y2="' + By + '" stroke="#d33" stroke-width="2" stroke-dasharray="6 4"/>';
        s += '<text x="' + ((Ax + Dx) / 2 - 10).toFixed(1) + '" y="' + (Ay - 8) + '" font-size="12" fill="#d33">' + L.pA + '</text>';
        s += '<text x="' + ((Dx + Bx) / 2 - 10).toFixed(1) + '" y="' + (By - 8) + '" font-size="12" fill="#d33">' + L.pB + '</text>';
        s += '<text x="' + (Cx + 8).toFixed(1) + '" y="' + ((Cy + By) / 2).toFixed(1) + '" font-size="12" fill="#d33">高 ' + L.h + '</text>';
        s += '<text x="' + (Dx - 4).toFixed(1) + '" y="' + (By + 18) + '" font-size="12">D</text>';
      }
      s += '<text x="' + (Ax - 16) + '" y="' + (Ay + 18) + '" font-size="12">A</text>';
      s += '<text x="' + (Bx - 4) + '" y="' + (By + 18) + '" font-size="12">B</text>';
      s += '<text x="' + (Cx - 4).toFixed(1) + '" y="' + (Cy - 8).toFixed(1) + '" font-size="12">C</text>';
      s += '<text x="150" y="205" font-size="12">直角边 ' + L.a + '、' + L.b + '，斜边 ' + L.c + '</text>';
      s += '</svg>';
      gid(K + '-svg').innerHTML = s;
    }
    function setLevel(i) {
      levelIdx = i; guessed = -1; shown = false;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = '斜边上的高把斜边 ' + L.c + ' 分成哪两段？';
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var bj = gid(K + '-level-' + j);
        if (bj) bj.setAttribute('aria-pressed', String(j === i));
      }
      msg('先猜一猜，再点“作高、看相似”。');
      render();
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜两段是 ' + LEVELS[levelIdx].opts[g] + '。点“作高、看相似”验证。');
        });
      })(g);
    }
    gid(K + '-show').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜，再点“作高、看相似”。'); return; }
      shown = true;
      render();
      var L = LEVELS[levelIdx], ok = guessed === L.ans;
      msg(L.note + (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再看一遍射影。'));
      if (ok) {
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：1.8 和 3.2', '提高：3.6 和 6.4', '挑战：1.9 和 11.1'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm812-mid',
  title: '中点四边形法',
  sub: '任意四边形各边中点连起来，得到的永远是平行四边形：拖一个顶点走，它还是平行四边形，不信就量一量。',
  grade: 8,
  kind: '模拟',
  points: ['8.12'],
  render: function (el) {
    var K = 'm812-mid';
    var LEVELS = [
      { label: '基础', quad: [[1, 1], [7, 1], [6, 5], [2, 4]], note: '不管外面的四边形怎么变，中点四边形的对边始终相等——永远是平行四边形。' },
      { label: '提高', quad: [[1, 1], [6, 1], [3, 3], [5, 6]], note: '凹四边形也一样：对边始终相等，还是平行四边形。' },
      { label: '挑战', quad: [[0, 2], [8, 0], [7, 6], [1, 5]], note: '不管外面的四边形长什么样，中点连起来都是平行四边形。' }
    ];
    var levelIdx = 0, guessed = -1, tiers = null;
    var quad = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 8 年级 · 平行四边形</p>' +
      '<h3>中点四边形法</h3>' +
      '<p>随便画一个四边形，把每条边的中点连起来，会得到什么四边形？先猜，再拖顶点、量边长验证。</p>' +
      '<p>第 1 步 · 先猜：连各边中点，得到什么四边形？</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button">平行四边形</button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button">矩形</button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button">梯形</button></div>' +
      '<p>第 2 步 · 拖一拖 D 点：</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-dminus" type="button">D 点向左</button>' +
      '<button class="btn small primary" id="' + K + '-dplus" type="button">D 点向右</button>' +
      '<button class="btn small primary" id="' + K + '-measure" type="button">量一量边长</button></div>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-lens"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再拖 D 点、量边长。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 凸四边形</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 凹四边形</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 斜四边形</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都量出对边相等，并且能说出“中点四边形永远是平行四边形”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function fmt2(v) { return (Math.round(v * 100) / 100).toFixed(2); }
    function dist(p, q) { return Math.sqrt((p[0] - q[0]) * (p[0] - q[0]) + (p[1] - q[1]) * (p[1] - q[1])); }
    function px(v) { return 15 + 38 * v; }
    function py(v) { return 205 - 28 * v; }
    function mids() {
      var m = [], i;
      for (i = 0; i < 4; i++) {
        var a = quad[i], b = quad[(i + 1) % 4];
        m.push([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]);
      }
      return m;
    }
    function render() {
      var m = mids();
      var s = '<svg viewBox="0 0 340 220" style="width:100%;max-width:420px">';
      var i;
      s += '<polygon points="' + quad.map(function (p) { return px(p[0]).toFixed(1) + ',' + py(p[1]).toFixed(1); }).join(' ') + '" fill="#f1f5f9" stroke="#94a3b8" stroke-width="2"/>';
      s += '<polygon points="' + m.map(function (p) { return px(p[0]).toFixed(1) + ',' + py(p[1]).toFixed(1); }).join(' ') + '" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/>';
      var names = ['A', 'B', 'C', 'D'];
      for (i = 0; i < 4; i++) {
        s += '<circle cx="' + px(quad[i][0]).toFixed(1) + '" cy="' + py(quad[i][1]).toFixed(1) + '" r="5" fill="#94a3b8"/>';
        s += '<text x="' + (px(quad[i][0]) + 7).toFixed(1) + '" y="' + (py(quad[i][1]) - 6).toFixed(1) + '" font-size="12">' + names[i] + '</text>';
        s += '<circle cx="' + px(m[i][0]).toFixed(1) + '" cy="' + py(m[i][1]).toFixed(1) + '" r="5" fill="#2563eb"/>';
      }
      s += '</svg>';
      gid(K + '-svg').innerHTML = s;
      var lens = [];
      for (i = 0; i < 4; i++) lens.push(fmt2(dist(m[i], m[(i + 1) % 4])));
      gid(K + '-lens').textContent = '中点四边形四条边：' + lens.join('、') + '。';
    }
    function setLevel(i) {
      levelIdx = i; guessed = -1;
      quad = LEVELS[i].quad.map(function (p) { return [p[0], p[1]]; });
      for (var j = 0; j < 3; j++) {
        var bj = gid(K + '-level-' + j);
        if (bj) bj.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-g0').disabled = false;
      gid(K + '-g1').disabled = false;
      gid(K + '-g2').disabled = false;
      msg('先猜一猜，再拖 D 点、量边长。');
      render();
    }
    gid(K + '-g0').addEventListener('click', function () { guessed = 0; msg('你猜平行四边形。拖 D 点、量边长验证。'); });
    gid(K + '-g1').addEventListener('click', function () { guessed = 1; msg('你猜矩形。拖 D 点、量边长验证：角是直角吗？'); });
    gid(K + '-g2').addEventListener('click', function () { guessed = 2; msg('你猜梯形。拖 D 点、量边长验证。'); });
    gid(K + '-dminus').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜，再拖 D 点。'); return; }
      quad[3][0] = Math.max(0, quad[3][0] - 1);
      render(); msg('D 点向左移了一格，中点四边形跟着变：量一量，对边还相等吗？');
    });
    gid(K + '-dplus').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜，再拖 D 点。'); return; }
      quad[3][0] = Math.min(8, quad[3][0] + 1);
      render(); msg('D 点向右移了一格，中点四边形跟着变：量一量，对边还相等吗？');
    });
    gid(K + '-measure').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜，再量边长。'); return; }
      var m = mids(), lens = [], i;
      for (i = 0; i < 4; i++) lens.push(fmt2(dist(m[i], m[(i + 1) % 4])));
      var L = LEVELS[levelIdx], ok = guessed === 0;
      msg('量完了：四条边是 ' + lens.join('、') + '，对边相等。' + L.note + (ok ? '你猜对了！' : '你刚才猜的是“矩形/梯形”，再看一遍边长：对边相等、邻边不一定相等，是平行四边形。'));
      if (ok) {
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：对边 3.20/2.92', '提高：对边 1.41/2.55', '挑战：对边 4.03/4.30'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm813-cut',
  title: '菱形面积切四块法',
  sub: '两条对角线把菱形切成 4 个一模一样的小直角三角形：每块面积一算，菱形面积＝对角线乘积的一半就出来了。',
  grade: 8,
  kind: '演示',
  points: ['8.13'],
  render: function (el) {
    var K = 'm813-cut';
    var LEVELS = [
      { label: '基础', d1: 6, d2: 8, each: '6', total: '24', opts: ['24', '48', '14'], ans: 0, note: '每块小直角三角形：3 × 4 ÷ 2 ＝ 6；4 块共 24。菱形面积 ＝ 对角线乘积的一半 ＝ 6 × 8 ÷ 2 ＝ 24。' },
      { label: '提高', d1: 10, d2: 24, each: '30', total: '120', opts: ['120', '240', '34'], ans: 0, note: '每块：5 × 12 ÷ 2 ＝ 30；4 块共 120 ＝ 10 × 24 ÷ 2。' },
      { label: '挑战', d1: 9, d2: 12, each: '13.5', total: '54', opts: ['54', '108', '21'], ans: 0, note: '每块：4.5 × 6 ÷ 2 ＝ 13.5；4 块共 54 ＝ 9 × 12 ÷ 2。' }
    ];
    var levelIdx = 0, guessed = -1, tiers = null, shown = false;
    el.innerHTML =
      '<p class="demo-tag">演示 · 8 年级 · 特殊的平行四边形</p>' +
      '<h3>菱形面积切四块法</h3>' +
      '<p>菱形两条对角线是 6 和 8，面积是多少？先猜，再把菱形切成 4 块小直角三角形，一块一块算。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 切一切：<button class="btn small primary" id="' + K + '-cut" type="button">沿对角线切开</button></p>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点“沿对角线切开”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 对角线 6、8</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 对角线 10、24</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 对角线 9、12</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都切出 4 块并且算对，并且能说出“菱形面积＝对角线乘积的一半”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function render() {
      var L = LEVELS[levelIdx];
      var k = 220 / Math.max(L.d1, L.d2);
      var hw = L.d1 * k / 2, hh = L.d2 * k / 2, cx = 180, cy = 120;
      var left = [cx - hw, cy], right = [cx + hw, cy], top = [cx, cy - hh], bot = [cx, cy + hh];
      var colors = ['#fca5a5', '#93c5fd', '#86efac', '#fcd34d'];
      var tris = [[left, top, right], [top, right, bot], [right, bot, left], [bot, left, top]];
      var s = '<svg viewBox="0 0 360 240" style="width:100%;max-width:420px">';
      var i;
      for (i = 0; i < 4; i++) {
        var t = tris[i];
        s += '<polygon points="' + t[0][0].toFixed(1) + ',' + t[0][1].toFixed(1) + ' ' + t[1][0].toFixed(1) + ',' + t[1][1].toFixed(1) + ' ' + t[2][0].toFixed(1) + ',' + t[2][1].toFixed(1) + '" fill="' + (shown ? colors[i] : '#dbeafe') + '" stroke="#2563eb" stroke-width="2"/>';
        if (shown) {
          var gx = (t[0][0] + t[1][0] + t[2][0]) / 3, gy = (t[0][1] + t[1][1] + t[2][1]) / 3;
          s += '<text x="' + (gx - 8).toFixed(1) + '" y="' + (gy + 4).toFixed(1) + '" font-size="13">' + L.each + '</text>';
        }
      }
      s += '<text x="' + (cx - 90) + '" y="' + (cy - hh - 8).toFixed(1) + '" font-size="12">对角线 ' + L.d1 + ' × ' + L.d2 + '</text>';
      s += '</svg>';
      gid(K + '-svg').innerHTML = s;
    }
    function setLevel(i) {
      levelIdx = i; guessed = -1; shown = false;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = '菱形对角线是 ' + L.d1 + ' 和 ' + L.d2 + '，面积是多少？';
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var bj = gid(K + '-level-' + j);
        if (bj) bj.setAttribute('aria-pressed', String(j === i));
      }
      msg('先猜一猜，再点“沿对角线切开”。');
      render();
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜面积是 ' + LEVELS[levelIdx].opts[g] + '。点“沿对角线切开”验证。');
        });
      })(g);
    }
    gid(K + '-cut').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜，再点“沿对角线切开”。'); return; }
      shown = true;
      render();
      var L = LEVELS[levelIdx], ok = guessed === L.ans;
      msg(L.note + (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再数一遍 4 块。'));
      if (ok) {
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：面积 24', '提高：面积 120', '挑战：面积 54'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm814-machine',
  title: '输入输出机器法',
  sub: '函数就是一台机器：输进去一个数，出来一个数；一个输入只出一个输出，不然机器就不知道该出什么了。',
  grade: 8,
  kind: '演示',
  points: ['8.14'],
  render: function (el) {
    var K = 'm814-machine';
    var LEVELS = [
      { label: '基础', rule: 'y ＝ 2x', input: 3, q: '机器是 y ＝ 2x。输入 3，输出是多少？', opts: ['6', '5', '9'], ans: 0, steps: ['输入 3', '机器算：2 × 3 ＝ 6', '输出 6'], note: '一个输入，一个输出：x ＝ 1 出 2，x ＝ 2 出 4，x ＝ 3 出 6——这就是函数 y ＝ 2x。' },
      { label: '提高', rule: 'y ＝ 2x ＋ 1', input: 4, q: '机器是 y ＝ 2x ＋ 1。输入 4，输出是多少？', opts: ['9', '8', '10'], ans: 0, steps: ['输入 4', '机器算：2 × 4 ＋ 1 ＝ 9', '输出 9'], note: '先乘 2 再加 1：x ＝ 4 出 9，一个输入还是一个输出。' },
      { label: '挑战', rule: '坏机器', input: 2, q: 'x ＝ 2 时 y 有时是 3、有时是 5，这是函数吗？', opts: ['不是', '是', '看情况'], ans: 0, steps: ['输入 2', '机器一会儿出 3，一会儿出 5', '一个输入出了两个输出'], note: '一个输入出了两个输出，机器不知道该出什么——这不是函数。函数要求：每个输入恰好一个输出。' }
    ];
    var levelIdx = 0, guessed = -1, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 8 年级 · 函数与正比例函数</p>' +
      '<h3>输入输出机器法</h3>' +
      '<p>函数就是一台“输入→加工→输出”的机器。先猜输出，再开机器看看它吐出什么。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 开机器：<button class="btn small primary" id="' + K + '-run" type="button">开机器</button></p>' +
      '<p id="' + K + '-steps"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再点“开机器”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · y＝2x</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · y＝2x＋1</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 坏机器</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都说得出输出，并且能说出“函数就是一个输入恰好一个输出”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function setLevel(i) {
      levelIdx = i; guessed = -1;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var bj = gid(K + '-level-' + j);
        if (bj) bj.setAttribute('aria-pressed', String(j === i));
      }
      gid(K + '-steps').textContent = '机器：' + L.rule + '。';
      msg('先猜一猜，再点“开机器”。');
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜 ' + LEVELS[levelIdx].opts[g] + '。点“开机器”验证。');
        });
      })(g);
    }
    gid(K + '-run').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜，再点“开机器”。'); return; }
      var L = LEVELS[levelIdx], ok = guessed === L.ans;
      gid(K + '-steps').textContent = L.steps.join(' → ') + '。';
      msg(L.note + (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再看一遍机器。'));
      if (ok) {
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：输入 3 出 6', '提高：输入 4 出 9', '挑战：不是函数'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm814-carnival',
  title: '看动画画图法',
  sub: '先猜高度随时间怎么变，再拖时间看小球、摩天轮动起来：猜的曲线和真的轨迹对不上，就说明猜错了。',
  grade: 8,
  kind: '实验',
  points: ['8.14'],
  render: function (el) {
    var K = 'm814-carnival';
    var LEVELS = [
      { label: '基础', name: '抛球', tmax: 4, q: '把球往上抛，高度随时间怎么变？', opts: ['先升后降', '一直上升', '一直下降'], ans: 0, note: '球先升后降：t ＝ 2 秒时最高 20 米，t ＝ 4 秒落地。高度随时间变的图像是一条抛物线。' },
      { label: '提高', name: '摩天轮', tmax: 4, q: '摩天轮座舱从地面出发，高度随时间怎么变？', opts: ['波浪线', '直线上升', '先升后降一次'], ans: 0, note: '座舱先升后降：t ＝ 2 秒时最高 20 米，t ＝ 4 秒回到地面。高度随时间变的图像是波浪线。' },
      { label: '挑战', name: '小车上坡、平路、下坡', tmax: 5, q: '小车先上坡、再走平路、再下坡，高度随时间怎么变？', opts: ['升—平—降', '一直升', '升—降—升'], ans: 0, note: '上坡 0 到 2 秒升到 10 米，平路 2 到 3 秒不变，下坡 3 到 5 秒回到地面。' }
    ];
    var levelIdx = 0, guessed = -1, tiers = null, t = 0;
    var trace = [];
    function curve(i, tt) {
      if (i === 0) return 20 * tt - 5 * tt * tt;
      if (i === 1) return 10 - 10 * Math.cos(Math.PI * tt / 2);
      if (tt < 2) return 5 * tt;
      if (tt < 3) return 10;
      return 10 - 5 * (tt - 3);
    }
    el.innerHTML =
      '<p class="demo-tag">实验 · 8 年级 · 函数与正比例函数</p>' +
      '<h3>看动画画图法</h3>' +
      '<p>函数图像就是“一个量随另一个量变”的轨迹。先猜曲线的样子，再拖时间滑杆，看点一路走出来的轨迹。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 拖时间：<input type="range" id="' + K + '-time" min="0" max="4" step="0.5" value="0" style="width:70%"> <b id="' + K + '-tv">t ＝ 0 秒</b></p>' +
      '<div class="btn-row"><button class="btn small ghost" id="' + K + '-reset" type="button">重走一遍</button></div>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-pos"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再拖时间滑杆。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 抛球</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 摩天轮</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 小车</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都走完时间，并且能说出“图像就是点随时间走出来的轨迹”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function fmt1(v) { return String(Math.round(v * 10) / 10); }
    function px(v) { return 30 + 65 * v; }
    function py(v) { return 200 - 9 * v; }
    function render() {
      var L = LEVELS[levelIdx], h = curve(levelIdx, t);
      var s = '<svg viewBox="0 0 360 220" style="width:100%;max-width:420px">';
      s += '<line x1="30" y1="200" x2="350" y2="200" stroke="#333" stroke-width="1.5"/>';
      s += '<line x1="30" y1="10" x2="30" y2="200" stroke="#333" stroke-width="1.5"/>';
      s += '<text x="330" y="192" font-size="12">时间 t</text>';
      s += '<text x="36" y="20" font-size="12">高度</text>';
      var i;
      if (trace.length > 1) {
        s += '<polyline points="' + trace.map(function (p) { return px(p[0]).toFixed(1) + ',' + py(p[1]).toFixed(1); }).join(' ') + '" fill="none" stroke="#2563eb" stroke-width="2"/>';
      }
      for (i = 0; i < trace.length; i++) {
        s += '<circle cx="' + px(trace[i][0]).toFixed(1) + '" cy="' + py(trace[i][1]).toFixed(1) + '" r="2.5" fill="#93c5fd"/>';
      }
      s += '<circle cx="' + px(t).toFixed(1) + '" cy="' + py(h).toFixed(1) + '" r="7" fill="#f80" stroke="#333" stroke-width="1.5"/>';
      s += '</svg>';
      gid(K + '-svg').innerHTML = s;
      gid(K + '-tv').textContent = 't ＝ ' + fmt1(t) + ' 秒';
      gid(K + '-pos').textContent = LEVELS[levelIdx].name + '：t ＝ ' + fmt1(t) + ' 秒时，高度是 ' + fmt1(h) + ' 米。';
    }
    function setLevel(i) {
      levelIdx = i; guessed = -1; t = 0; trace = [[0, 0]];
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var bj = gid(K + '-level-' + j);
        if (bj) bj.setAttribute('aria-pressed', String(j === i));
      }
      var sl = gid(K + '-time');
      sl.max = String(L.tmax);
      sl.value = '0';
      msg('先猜一猜，再拖时间滑杆。');
      render();
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜 ' + LEVELS[levelIdx].opts[g] + '。拖时间滑杆、看轨迹。');
        });
      })(g);
    }
    gid(K + '-time').addEventListener('input', function (e) {
      if (guessed < 0) { msg('先猜一猜，再拖时间滑杆。'); return; }
      t = parseFloat(e.target.value);
      trace.push([t, curve(levelIdx, t)]);
      render();
      var L = LEVELS[levelIdx];
      if (t >= L.tmax) {
        var ok = guessed === L.ans;
        msg('走完了！' + L.note + (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再看一遍走出来的轨迹。'));
        if (ok) {
          if (tiers) tiers.done(levelIdx);
          if (typeof markTried === 'function') markTried(K);
        }
      }
    });
    gid(K + '-reset').addEventListener('click', function () {
      t = 0; trace = [[0, 0]];
      gid(K + '-time').value = '0';
      render(); msg('回到起点，再走一遍。');
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：抛物线', '提高：波浪线', '挑战：升—平—降'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm815-two',
  title: '两点定直线法',
  sub: '一条直线由两个点定下来：先算斜率 k，再找截距 b——k 是“每走 1 步上几格”，b 是“从 y 轴哪里出发”。',
  grade: 8,
  kind: '演示',
  points: ['8.15'],
  render: function (el) {
    var K = 'm815-two';
    var LEVELS = [
      { label: '基础', p1: [0, 3], p2: [1, 5], k: 2, b: 3, kopts: ['2', '3', '5'], bopts: ['3', '1', '5'], xmin: -1, xmax: 4, ymin: -1, ymax: 7, bwhy: 'b 就是直线与 y 轴交点的纵坐标：过 (0, 3)，b ＝ 3。', note: 'k ＝ (5 − 3) ÷ (1 − 0) ＝ 2；直线过 (0, 3)，b ＝ 3。所以 y ＝ 2x ＋ 3。' },
      { label: '提高', p1: [0, -1], p2: [2, 3], k: 2, b: -1, kopts: ['2', '1', '4'], bopts: ['−1', '1', '3'], xmin: -1, xmax: 4, ymin: -3, ymax: 5, bwhy: 'b 就是直线与 y 轴交点的纵坐标：过 (0, −1)，b ＝ −1。', note: 'k ＝ (3 − (−1)) ÷ (2 − 0) ＝ 2；直线过 (0, −1)，b ＝ −1。所以 y ＝ 2x − 1。' },
      { label: '挑战', p1: [1, 2], p2: [3, 8], k: 3, b: -1, kopts: ['3', '2', '6'], bopts: ['−1', '2', '1'], xmin: -1, xmax: 5, ymin: -2, ymax: 10, bwhy: '把 (1, 2) 代进 y ＝ 3x ＋ b：2 ＝ 3 ＋ b，b ＝ −1。', note: 'k ＝ (8 − 2) ÷ (3 − 1) ＝ 3；把 (1, 2) 代进 y ＝ 3x ＋ b：2 ＝ 3 ＋ b，b ＝ −1。所以 y ＝ 3x − 1。' }
    ];
    var levelIdx = 0, kGuessed = -1, bGuessed = -1, kOk = false, drawn = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">演示 · 8 年级 · 一次函数</p>' +
      '<h3>两点定直线法</h3>' +
      '<p>直线 y ＝ kx ＋ b 过两个已知点，k 和 b 是多少？先猜 k，再猜 b，最后画直线验证。</p>' +
      '<p>第 1 步 · 先猜 k：<span id="' + K + '-guess-k"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 再猜 b：</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-h0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-h1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-h2" type="button"></button></div>' +
      '<p>第 3 步 · 画直线：<button class="btn small primary" id="' + K + '-draw" type="button">画直线验证</button></p>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-msg">先猜 k：斜率是多少？</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 过 (0,3)(1,5)</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 过 (0,−1)(2,3)</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 过 (1,2)(3,8)</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都算对 k 和 b，并且能说出“两点定直线：k 是斜率，b 是截距”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function render() {
      var L = LEVELS[levelIdx];
      function px(v) { return 20 + (v - L.xmin) / (L.xmax - L.xmin) * 320; }
      function py(v) { return 220 - (v - L.ymin) / (L.ymax - L.ymin) * 200; }
      var s = '<svg viewBox="0 0 360 240" style="width:100%;max-width:420px">';
      if (L.ymin < 0 && L.ymax > 0) {
        s += '<line x1="20" y1="' + py(0).toFixed(1) + '" x2="340" y2="' + py(0).toFixed(1) + '" stroke="#333" stroke-width="1.5"/>';
      }
      if (L.xmin < 0 && L.xmax > 0) {
        s += '<line x1="' + px(0).toFixed(1) + '" y1="10" x2="' + px(0).toFixed(1) + '" y2="230" stroke="#333" stroke-width="1.5"/>';
      }
      if (drawn) {
        s += '<line x1="' + px(L.xmin).toFixed(1) + '" y1="' + py(L.k * L.xmin + L.b).toFixed(1) + '" x2="' + px(L.xmax).toFixed(1) + '" y2="' + py(L.k * L.xmax + L.b).toFixed(1) + '" stroke="#2563eb" stroke-width="2"/>';
        s += '<text x="250" y="24" font-size="12" fill="#2563eb">y ＝ ' + L.k + 'x ' + (L.b >= 0 ? '＋ ' + L.b : '− ' + (-L.b)) + '</text>';
      }
      var i, pts = [L.p1, L.p2];
      for (i = 0; i < 2; i++) {
        s += '<circle cx="' + px(pts[i][0]).toFixed(1) + '" cy="' + py(pts[i][1]).toFixed(1) + '" r="6" fill="#f80" stroke="#333" stroke-width="1.5"/>';
        s += '<text x="' + (px(pts[i][0]) + 8).toFixed(1) + '" y="' + (py(pts[i][1]) - 8).toFixed(1) + '" font-size="12">(' + pts[i][0] + ', ' + pts[i][1] + ')</text>';
      }
      s += '</svg>';
      gid(K + '-svg').innerHTML = s;
    }
    function setLevel(i) {
      levelIdx = i; kGuessed = -1; bGuessed = -1; kOk = false; drawn = false;
      var L = LEVELS[i];
      gid(K + '-guess-k').textContent = '直线过 (' + L.p1[0] + ', ' + L.p1[1] + ') 和 (' + L.p2[0] + ', ' + L.p2[1] + ')，斜率 k 是多少？';
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.kopts[k];
        gid(K + '-h' + k).textContent = L.bopts[k];
        gid(K + '-g' + k).disabled = false;
        gid(K + '-h' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var bj = gid(K + '-level-' + j);
        if (bj) bj.setAttribute('aria-pressed', String(j === i));
      }
      msg('先猜 k：斜率是多少？');
      render();
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          var L = LEVELS[levelIdx];
          kGuessed = g;
          if (g === 0) {
            kOk = true;
            msg('k ＝ ' + L.k + ' 对了！再猜 b：截距是多少？');
          } else {
            kOk = false;
            msg('k 不对：k ＝ (y2 − y1) ÷ (x2 − x1)，再算一遍。');
          }
        });
        gid(K + '-h' + g).addEventListener('click', function () {
          var L = LEVELS[levelIdx];
          if (!kOk) { msg('先把 k 猜对。'); return; }
          bGuessed = g;
          if (g === 0) {
            msg('b ＝ ' + L.b + ' 对了！点“画直线验证”。');
          } else {
            msg('b 不对：' + L.bwhy);
          }
        });
      })(g);
    }
    gid(K + '-draw').addEventListener('click', function () {
      if (!kOk) { msg('先把 k 猜对。'); return; }
      if (bGuessed !== 0) { msg('先把 b 猜对。'); return; }
      drawn = true;
      render();
      var L = LEVELS[levelIdx];
      msg(L.note + '直线穿过两个点，你猜对了！');
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：y ＝ 2x ＋ 3', '提高：y ＝ 2x − 1', '挑战：y ＝ 3x − 1'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm815-ineq',
  title: '方程与不等式的图像解法',
  sub: 'y＝0 的点就是方程的解，y＞0 的一段就是不等式的解：直线与 x 轴一交，方程和不等式一起有了答案。',
  grade: 8,
  kind: '模拟',
  points: ['8.15'],
  render: function (el) {
    var K = 'm815-ineq';
    var LEVELS = [
      { label: '基础', k: 2, b: -4, zero: '2', zopts: ['2', '4', '−2'], zans: 0, ropts: ['x ＞ 2', 'x ＜ 2', 'x ＞ 4'], rans: 0, xmin: -1, xmax: 5, ymin: -6, ymax: 8, note: 'y ＝ 2x − 4：y ＝ 0 时 x ＝ 2；x ＞ 2 时 y ＞ 0，x ＜ 2 时 y ＜ 0。方程的解是零点，不等式的解是零点的一边。' },
      { label: '提高', k: -1, b: 3, zero: '3', zopts: ['3', '−3', '1'], zans: 0, ropts: ['x ＜ 3', 'x ＞ 3', 'x ＜ −3'], rans: 0, xmin: -1, xmax: 6, ymin: -4, ymax: 6, note: 'y ＝ −x ＋ 3：y ＝ 0 时 x ＝ 3；x ＜ 3 时 y ＞ 0，x ＞ 3 时 y ＜ 0。斜率是负的，y ＞ 0 在零点左边。' },
      { label: '挑战', k: 1, b: 2, zero: '−2', zopts: ['−2', '2', '0'], zans: 0, ropts: ['x ＞ −2', 'x ＜ −2', 'x ＞ 2'], rans: 0, xmin: -4, xmax: 3, ymin: -3, ymax: 6, note: 'y ＝ x ＋ 2：y ＝ 0 时 x ＝ −2；x ＞ −2 时 y ＞ 0，x ＜ −2 时 y ＜ 0。' }
    ];
    var levelIdx = 0, zGuessed = -1, rGuessed = -1, zOk = false, drawn = false, tiers = null;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 8 年级 · 一次函数</p>' +
      '<h3>方程与不等式的图像解法</h3>' +
      '<p>一次函数 y ＝ kx ＋ b 的图像是一条直线：它和 x 轴交在哪里，方程 kx ＋ b ＝ 0 的解就是哪里；直线在 x 轴上面那一段，就是不等式 kx ＋ b ＞ 0 的解。</p>' +
      '<p>第 1 步 · 先猜零点：<span id="' + K + '-guess-z"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 再猜 y ＞ 0 的范围：</p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-h0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-h1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-h2" type="button"></button></div>' +
      '<p>第 3 步 · 画图涂色：<button class="btn small primary" id="' + K + '-draw" type="button">画图涂色</button></p>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-msg">先猜零点：y ＝ 0 时 x 是多少？</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · y＝2x−4</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · y＝−x＋3</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · y＝x＋2</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都找对零点和 y ＞ 0 的范围，并且能说出“零点是方程的解，零点的一边是不等式的解”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function render() {
      var L = LEVELS[levelIdx];
      function px(v) { return 20 + (v - L.xmin) / (L.xmax - L.xmin) * 320; }
      function py(v) { return 220 - (v - L.ymin) / (L.ymax - L.ymin) * 200; }
      var s = '<svg viewBox="0 0 360 240" style="width:100%;max-width:420px">';
      if (L.ymin < 0 && L.ymax > 0) {
        s += '<line x1="20" y1="' + py(0).toFixed(1) + '" x2="340" y2="' + py(0).toFixed(1) + '" stroke="#333" stroke-width="1.5"/>';
      }
      if (L.xmin < 0 && L.xmax > 0) {
        s += '<line x1="' + px(0).toFixed(1) + '" y1="10" x2="' + px(0).toFixed(1) + '" y2="230" stroke="#333" stroke-width="1.5"/>';
      }
      if (drawn) {
        var x0 = -L.b / L.k;
        var xa = L.k > 0 ? Math.max(x0, L.xmin) : L.xmin;
        var xb = L.k > 0 ? L.xmax : Math.min(x0, L.xmax);
        s += '<line x1="' + px(xa).toFixed(1) + '" y1="' + py(L.k * xa + L.b).toFixed(1) + '" x2="' + px(xb).toFixed(1) + '" y2="' + py(L.k * xb + L.b).toFixed(1) + '" stroke="#f80" stroke-width="5" opacity="0.7"/>';
        s += '<line x1="' + px(L.xmin).toFixed(1) + '" y1="' + py(L.k * L.xmin + L.b).toFixed(1) + '" x2="' + px(L.xmax).toFixed(1) + '" y2="' + py(L.k * L.xmax + L.b).toFixed(1) + '" stroke="#2563eb" stroke-width="2"/>';
        s += '<circle cx="' + px(x0).toFixed(1) + '" cy="' + py(0).toFixed(1) + '" r="6" fill="#f80" stroke="#333" stroke-width="1.5"/>';
        s += '<text x="' + (px(x0) + 8).toFixed(1) + '" y="' + (py(0) - 10).toFixed(1) + '" font-size="12" fill="#d33">零点 x ＝ ' + L.zero + '</text>';
        s += '<text x="230" y="24" font-size="12" fill="#f80">橙色一段：y ＞ 0</text>';
      }
      s += '<text x="250" y="42" font-size="12" fill="#2563eb">y ＝ ' + L.k + 'x ' + (L.b >= 0 ? '＋ ' + L.b : '− ' + (-L.b)) + '</text>';
      s += '</svg>';
      gid(K + '-svg').innerHTML = s;
    }
    function setLevel(i) {
      levelIdx = i; zGuessed = -1; rGuessed = -1; zOk = false; drawn = false;
      var L = LEVELS[i];
      gid(K + '-guess-z').textContent = 'y ＝ ' + L.k + 'x ' + (L.b >= 0 ? '＋ ' + L.b : '− ' + (-L.b)) + '，y ＝ 0 时 x 是多少？';
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.zopts[k];
        gid(K + '-h' + k).textContent = L.ropts[k];
        gid(K + '-g' + k).disabled = false;
        gid(K + '-h' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var bj = gid(K + '-level-' + j);
        if (bj) bj.setAttribute('aria-pressed', String(j === i));
      }
      msg('先猜零点：y ＝ 0 时 x 是多少？');
      render();
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          var L = LEVELS[levelIdx];
          zGuessed = g;
          if (g === L.zans) {
            zOk = true;
            msg('零点 x ＝ ' + L.zero + ' 对了！再猜：y ＞ 0 是零点的哪一边？');
          } else {
            zOk = false;
            msg('零点不对：令 y ＝ 0，解 ' + L.k + 'x ' + (L.b >= 0 ? '＋ ' + L.b : '− ' + (-L.b)) + ' ＝ 0，再算一遍。');
          }
        });
        gid(K + '-h' + g).addEventListener('click', function () {
          var L = LEVELS[levelIdx];
          if (!zOk) { msg('先把零点猜对。'); return; }
          rGuessed = g;
          if (g === L.rans) {
            msg('y ＞ 0 的范围对了！点“画图涂色”验证。');
          } else {
            msg('范围不对：直线在 x 轴上面那一段才是 y ＞ 0，再想想是哪一边。');
          }
        });
      })(g);
    }
    gid(K + '-draw').addEventListener('click', function () {
      var L = LEVELS[levelIdx];
      if (!zOk) { msg('先把零点猜对。'); return; }
      if (rGuessed !== L.rans) { msg('先把 y ＞ 0 的范围猜对。'); return; }
      drawn = true;
      render();
      msg(L.note + '你猜对了！');
      if (tiers) tiers.done(levelIdx);
      if (typeof markTried === 'function') markTried(K);
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：零点 2', '提高：零点 3', '挑战：零点 −2'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm816-var',
  title: '方差是距离的平均法',
  sub: '方差就是“数据点离平均数多远”的平均：点离平均线越远，离差越大，方差越大，数据越散。',
  grade: 8,
  kind: '模拟',
  points: ['8.16'],
  render: function (el) {
    var K = 'm816-var';
    var LEVELS = [
      { label: '基础', data: [1, 3, 5, 7], data2: null, q: '这组数据的方差是多少？', opts: ['5', '2', '4'], ans: 0, note: '平均数是 4；离差是 3、1、1、3，平方是 9、1、1、9，平均是 (9 ＋ 1 ＋ 1 ＋ 9) ÷ 4 ＝ 5。方差是 5。' },
      { label: '提高', data: [3, 3, 5, 5], data2: null, q: '这组数据的方差是多少？', opts: ['1', '2', '4'], ans: 0, note: '平均数是 4；离差都是 1，平方都是 1，平均是 1。方差是 1——点离平均线近，方差就小。' },
      { label: '挑战', data: [1, 3, 5, 7], data2: [2, 4, 4, 6], q: '哪组数据更散（方差更大）？', opts: ['第一组', '第二组', '一样散'], ans: 0, note: '第一组方差是 5，第二组方差是 2：第一组点离平均线更远，更散。' }
    ];
    var levelIdx = 0, guessed = -1, tiers = null, work = null, farSteps = 0;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 8 年级 · 数据的分析</p>' +
      '<h3>方差是距离的平均法</h3>' +
      '<p>平均数是数据的“重心”，方差是数据“离重心多远”的平均。先猜方差，再看每个点到平均线的距离。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 画距离：<button class="btn small primary" id="' + K + '-show" type="button">画出离差</button> <button class="btn small ghost" id="' + K + '-far" type="button">把最远的点再拉远 2</button></p>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-calc"></p>' +
      '<p id="' + K + '-msg">先猜一猜，再点“画出离差”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 1,3,5,7</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 3,3,5,5</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 两组比一比</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都算对方差，并且能说出“点离平均线越远，方差越大”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function fmt(v) { return String(Math.round(v * 100) / 100); }
    function stats(arr) {
      var sum = 0, i;
      for (i = 0; i < arr.length; i++) sum += arr[i];
      var mean = sum / arr.length;
      var sq = 0;
      for (i = 0; i < arr.length; i++) sq += (arr[i] - mean) * (arr[i] - mean);
      return { mean: mean, variance: sq / arr.length };
    }
    function plot(arr, yBase, shown) {
      function px(v) { return 20 + 26 * v; }
      var st = stats(arr), s = '';
      s += '<line x1="20" y1="' + yBase + '" x2="340" y2="' + yBase + '" stroke="#333" stroke-width="1.5"/>';
      var v;
      for (v = 0; v <= 12; v++) {
        s += '<text x="' + (px(v) - 3) + '" y="' + (yBase + 16) + '" font-size="10">' + v + '</text>';
      }
      s += '<line x1="' + px(st.mean).toFixed(1) + '" y1="' + (yBase - 70) + '" x2="' + px(st.mean).toFixed(1) + '" y2="' + (yBase + 6) + '" stroke="#d33" stroke-width="2" stroke-dasharray="6 4"/>';
      s += '<text x="' + (px(st.mean) + 4).toFixed(1) + '" y="' + (yBase - 74) + '" font-size="12" fill="#d33">平均 ' + fmt(st.mean) + '</text>';
      var i;
      for (i = 0; i < arr.length; i++) {
        s += '<circle cx="' + px(arr[i]).toFixed(1) + '" cy="' + yBase + '" r="6" fill="#2563eb" stroke="#333" stroke-width="1"/>';
        if (shown) {
          s += '<line x1="' + px(arr[i]).toFixed(1) + '" y1="' + (yBase - 24) + '" x2="' + px(st.mean).toFixed(1) + '" y2="' + (yBase - 24) + '" stroke="#f80" stroke-width="3"/>';
          s += '<text x="' + ((px(arr[i]) + px(st.mean)) / 2 - 6).toFixed(1) + '" y="' + (yBase - 30) + '" font-size="11" fill="#d33">' + fmt(Math.abs(arr[i] - st.mean)) + '</text>';
        }
      }
      return s;
    }
    function render(shown) {
      var L = LEVELS[levelIdx];
      var s = '<svg viewBox="0 0 360 220" style="width:100%;max-width:420px">';
      if (L.data2) {
        s += plot(work, 80, shown);
        s += plot(L.data2, 180, shown);
        s += '<text x="20" y="30" font-size="12">第一组：1、3、5、7</text>';
        s += '<text x="20" y="130" font-size="12">第二组：2、4、4、6</text>';
      } else {
        s += plot(work, 120, shown);
        s += '<text x="20" y="30" font-size="12">数据：' + work.join('、') + '</text>';
      }
      s += '</svg>';
      gid(K + '-svg').innerHTML = s;
      if (shown) {
        var st = stats(work);
        var devs = work.map(function (v) { return fmt(Math.abs(v - st.mean)); }).join('、');
        var sqs = work.map(function (v) { return fmt((v - st.mean) * (v - st.mean)); }).join('、');
        var txt = '平均数 ' + fmt(st.mean) + '；离差 ' + devs + '；平方 ' + sqs + '；方差 ＝ (' + sqs.replace(/、/g, ' ＋ ') + ') ÷ ' + work.length + ' ＝ ' + fmt(st.variance) + '。';
        if (L.data2) {
          var st2 = stats(L.data2);
          txt += '第二组方差 ＝ ' + fmt(st2.variance) + '。';
        }
        gid(K + '-calc').textContent = txt;
      } else {
        gid(K + '-calc').textContent = '';
      }
    }
    function setLevel(i) {
      levelIdx = i; guessed = -1; farSteps = 0;
      work = LEVELS[i].data.slice();
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = L.q;
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var bj = gid(K + '-level-' + j);
        if (bj) bj.setAttribute('aria-pressed', String(j === i));
      }
      msg('先猜一猜，再点“画出离差”。');
      render(false);
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜 ' + LEVELS[levelIdx].opts[g] + '。点“画出离差”验证。');
        });
      })(g);
    }
    gid(K + '-show').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜，再点“画出离差”。'); return; }
      render(true);
      var L = LEVELS[levelIdx], ok = guessed === L.ans;
      msg(L.note + (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再看一遍离差。'));
      if (ok) {
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      }
    });
    gid(K + '-far').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜，再拉远。'); return; }
      if (LEVELS[levelIdx].data2) { msg('挑战档是两组比一比，不用拉远。'); return; }
      if (farSteps >= 3) { msg('已经拉到头了：点越散，方差越大。'); return; }
      var mi = 0, i;
      for (i = 1; i < work.length; i++) if (work[i] > work[mi]) mi = i;
      work[mi] += 2;
      farSteps++;
      render(true);
      var st = stats(work);
      msg('最远的点拉远了 2，现在方差是 ' + fmt(st.variance) + '：点离平均线越远，方差越大。');
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：方差 5', '提高：方差 1', '挑战：第一组更散'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});

registerAnim({
  key: 'm816-mode',
  title: '众数看频数峰法',
  sub: '众数就是出现次数最多的那个数：画出频数条，最高的那根就是众数；两根一样高，就是双众数。',
  grade: 8,
  kind: '模拟',
  points: ['8.16'],
  render: function (el) {
    var K = 'm816-mode';
    var LEVELS = [
      { label: '基础', data: [150, 155, 155, 155, 160, 165], opts: ['155', '150', '160'], ans: 0, note: '155 出现了 3 次，最多：众数是 155，频数条最高的那根就是它。' },
      { label: '提高', data: [60, 70, 70, 80, 80, 80, 90], opts: ['80', '70', '60'], ans: 0, note: '80 出现了 3 次，最多：众数是 80。' },
      { label: '挑战', data: [70, 70, 80, 80, 90], opts: ['70 和 80', '70', '90'], ans: 0, note: '70 和 80 各出现 2 次，并列最多：这组数据有两个众数，70 和 80。' }
    ];
    var levelIdx = 0, guessed = -1, tiers = null, shown = false;
    el.innerHTML =
      '<p class="demo-tag">模拟 · 8 年级 · 数据的分析</p>' +
      '<h3>众数看频数峰法</h3>' +
      '<p>一组成绩里，哪个分数出现最多？先猜众数，再画频数条：最高的那根就是答案。</p>' +
      '<p>第 1 步 · 先猜：<span id="' + K + '-guess-tx"></span></p>' +
      '<div class="btn-row">' +
      '<button class="btn small primary" id="' + K + '-g0" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g1" type="button"></button>' +
      '<button class="btn small primary" id="' + K + '-g2" type="button"></button></div>' +
      '<p>第 2 步 · 画频数条：<button class="btn small primary" id="' + K + '-bars" type="button">画频数条</button></p>' +
      '<div id="' + K + '-svg"></div>' +
      '<p id="' + K + '-msg">先猜一猜，再点“画频数条”。</p>' +
      '<p>换一档：</p><div class="btn-row">' +
      '<button class="btn small ghost" id="' + K + '-level-0" type="button">基础 · 150,155,155,155,160,165</button>' +
      '<button class="btn small ghost" id="' + K + '-level-1" type="button">提高 · 60,70,70,80,80,80,90</button>' +
      '<button class="btn small ghost" id="' + K + '-level-2" type="button">挑战 · 70,70,80,80,90</button></div>' +
      '<div class="tier-row" id="' + K + '-tiers"></div>' +
      '<div class="find-row"><label>说一说你的发现：<input type="text" id="' + K + '-find" placeholder="我发现……"></label><button class="btn small primary" id="' + K + '-find-save" type="button">记下来</button></div>' +
      '<p id="' + K + '-find-saved"></p>' +
      '<p class="demo-foot">成功标准：三档都找对众数，并且能说出“众数就是频数最高的那根”。</p>';
    function gid(id) { return document.getElementById(id); }
    function msg(t) { var m = gid(K + '-msg'); if (m) m.textContent = t; }
    function render() {
      var L = LEVELS[levelIdx];
      var freq = {}, vals = [], i;
      for (i = 0; i < L.data.length; i++) {
        var v = L.data[i];
        if (!freq[v]) { freq[v] = 0; vals.push(v); }
        freq[v]++;
      }
      vals.sort(function (a, b) { return a - b; });
      var maxF = 0;
      for (i = 0; i < vals.length; i++) if (freq[vals[i]] > maxF) maxF = freq[vals[i]];
      var s = '<svg viewBox="0 0 360 220" style="width:100%;max-width:420px">';
      s += '<line x1="30" y1="180" x2="340" y2="180" stroke="#333" stroke-width="1.5"/>';
      for (i = 0; i < vals.length; i++) {
        var x = 50 + i * 60, h = freq[vals[i]] * 40;
        var isTop = shown && freq[vals[i]] === maxF;
        s += '<rect x="' + x + '" y="' + (180 - h) + '" width="40" height="' + h + '" fill="' + (isTop ? '#f80' : '#93c5fd') + '" stroke="#2563eb" stroke-width="2"/>';
        s += '<text x="' + (x + 20) + '" y="' + (180 - h - 8) + '" font-size="12" text-anchor="middle">' + freq[vals[i]] + ' 次</text>';
        s += '<text x="' + (x + 20) + '" y="198" font-size="12" text-anchor="middle">' + vals[i] + '</text>';
      }
      s += '</svg>';
      gid(K + '-svg').innerHTML = s;
    }
    function setLevel(i) {
      levelIdx = i; guessed = -1; shown = false;
      var L = LEVELS[i];
      gid(K + '-guess-tx').textContent = '数据是 ' + L.data.join('、') + '，众数是哪个？';
      for (var k = 0; k < 3; k++) {
        gid(K + '-g' + k).textContent = L.opts[k];
        gid(K + '-g' + k).disabled = false;
      }
      for (var j = 0; j < 3; j++) {
        var bj = gid(K + '-level-' + j);
        if (bj) bj.setAttribute('aria-pressed', String(j === i));
      }
      msg('先猜一猜，再点“画频数条”。');
      render();
    }
    for (var g = 0; g < 3; g++) {
      (function (g) {
        gid(K + '-g' + g).addEventListener('click', function () {
          guessed = g;
          msg('你猜众数是 ' + LEVELS[levelIdx].opts[g] + '。点“画频数条”验证。');
        });
      })(g);
    }
    gid(K + '-bars').addEventListener('click', function () {
      if (guessed < 0) { msg('先猜一猜，再点“画频数条”。'); return; }
      shown = true;
      render();
      var L = LEVELS[levelIdx], ok = guessed === L.ans;
      msg(L.note + (ok ? '你猜对了！' : '你刚才猜的是“' + L.opts[guessed] + '”，再看一遍最高的那根。'));
      if (ok) {
        if (tiers) tiers.done(levelIdx);
        if (typeof markTried === 'function') markTried(K);
      }
    });
    gid(K + '-level-0').addEventListener('click', function () { setLevel(0); });
    gid(K + '-level-1').addEventListener('click', function () { setLevel(1); });
    gid(K + '-level-2').addEventListener('click', function () { setLevel(2); });
    if (typeof makeTiers === 'function') {
      tiers = makeTiers(gid(K + '-tiers'),
        ['基础：众数 155', '提高：众数 80', '挑战：众数 70 和 80'], K);
    }
    if (typeof wireDiscovery === 'function') {
      wireDiscovery(K, K + '-find', K + '-find-save', K + '-find-saved');
    }
    setLevel(0);
  }
});
