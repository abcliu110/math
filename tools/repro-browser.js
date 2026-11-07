// CDP 真机复现：用真 Chrome + 真鼠标事件（Input.dispatchMouseEvent，
// 和浏览器测试工具同一条输入路径）复现实验室的拖放/手柄问题。
// 测试桩里拖放全通、真机却断——桩模拟不了真机指针事件路径，
// 所以直接用无头 Chrome 当复现环境。
//
// 用法：
//   node tools/repro-browser.js station-drag   # 天平站砝码拖到虚线落点区
//   node tools/repro-browser.js partsbox-drag  # 器材盒 1/6 拖到台面右盘
//   node tools/repro-browser.js rect-refresh   # 长方形手柄刷新后还在不在
//   node tools/repro-browser.js rect-label     # 手柄点击区和 (w,h) 标签重叠
//   node tools/repro-browser.js bal-clear      # 清空重来按钮
// 默认打开本 worktree 的 homepage-standalone.html（--file 可指定别的页面）。
// 退出码 0 = 场景通过，1 = 场景失败或环境出错。
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const CHROME = '/opt/meta-chromium/chrome';
// 本机直接启动这版 Chrome 有两个坑（2026-11-07 实测）：
//  (1) 需要 Hatch WebGL 策略：启动参数带
//      --hatch-webgl-allowed-domains-file=<文件> + 对应 sha256，
//      文件内容一行 `hatch-webgl-all-origins-v1`（浏览器 daemon 平时
//      会提供这个策略；直接跑时自己造一个仅供本地复现用）。
//  (2) Chrome 155 的本地网络访问检查（LNA）会拦 http://127.0.0.1/ 的
//      导航（ERR_BLOCKED_BY_LOCAL_NETWORK_ACCESS_CHECKS，关特性开关
//      也拦不住），所以直接用 file:// 加载独立文件（自包含，无网络请求）。
const WEBGL_POLICY = '/tmp/repro-webgl-policy.txt';
const PORT = 9223;
const HTTP_PORT = 8901;

const scenario = process.argv[2] || 'station-drag';
let fileArg = 'homepage-standalone.html';
for (let i = 3; i < process.argv.length; i++) {
  if (process.argv[i] === '--file') fileArg = process.argv[++i];
}

const WEBROOT = path.resolve(__dirname, '..', 'apps', 'web');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let ws = null;
let msgId = 0;
const pending = new Map();
const consoleErrors = [];
const pageErrors = [];

function send(method, params) {
  return new Promise((resolve, reject) => {
    const id = ++msgId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params: params || {} }));
  });
}

async function evaljs(expr, awaitPromise) {
  const r = await send('Runtime.evaluate', {
    expression: expr, returnByValue: true, awaitPromise: !!awaitPromise,
  });
  if (r.exceptionDetails) {
    return { __error: r.exceptionDetails.exception
      ? (r.exceptionDetails.exception.description || r.exceptionDetails.text)
      : (r.exceptionDetails.text || 'eval exception') };
  }
  return r.result ? r.result.value : undefined;
}

async function mouse(type, x, y) {
  await send('Input.dispatchMouseEvent', {
    type, x: Math.round(x), y: Math.round(y), button: 'left', clickCount: 1,
  });
}
async function drag(x1, y1, x2, y2, steps, stepMs) {
  await mouse('mousePressed', x1, y1);
  await sleep(80);
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    await mouse('mouseMoved', x1 + (x2 - x1) * t, y1 + (y2 - y1) * t);
    await sleep(stepMs || 40);
  }
  await mouse('mouseReleased', x2, y2);
  await sleep(150);
}
async function clickAt(x, y) {
  await mouse('mousePressed', x, y);
  await sleep(60);
  await mouse('mouseReleased', x, y);
  await sleep(150);
}
// 触屏按住：Input.dispatchTouchEvent（真触屏输入路径）。pointerdown 上
// preventDefault 拦不住触屏滚动——要拦滚动得靠 CSS touch-action:none，
// 这正是“按住看台面”在真机上只滚页面、不藏报告的疑点。
async function touch(type, x, y) {
  await send('Input.dispatchTouchEvent', {
    type, touchPoints: type === 'touchEnd' ? [] : [{ x: Math.round(x), y: Math.round(y), id: 1 }],
  });
}
async function rectOf(sel) {
  // 先滚到可见（block:center），再读视口坐标：CDP 鼠标事件用的是视口
  // 坐标，元素在视口外时事件根本落不到它身上（target 会是 <html>）。
  // behavior:'instant'：页面开了 html{scroll-behavior:smooth}，默认
  // scrollIntoView 是动画异步的，同步读数还是旧坐标；instant 立即到位。
  await evaljs(`(function(){var el=document.querySelector(${JSON.stringify(sel)});if(el)el.scrollIntoView({block:'center',inline:'center',behavior:'instant'});})()`);
  await sleep(300);
  return evaljs(`(function(){var el=document.querySelector(${JSON.stringify(sel)});if(!el)return null;var r=el.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,cx:r.x+r.width/2,cy:r.y+r.height/2,visible:r.width>0&&r.height>0&&r.bottom>0&&r.top<window.innerHeight};})()`);
}
async function center(sel) {
  const r = await rectOf(sel);
  return r ? { x: r.cx, y: r.cy } : null;
}
// 一次滚动、一次测量多个选择器：逐个 center() 会互相滚动，
// 后测的会把先测的元素的视口坐标顶掉（拖放起点就落在别处）。
async function centers(...sels) {
  await evaljs(`(function(){var el=document.querySelector(${JSON.stringify(sels[0])});if(el)el.scrollIntoView({block:'center',inline:'center',behavior:'instant'});})()`);
  await sleep(300);
  const out = [];
  for (const sel of sels) {
    const r = await evaljs(`(function(){var el=document.querySelector(${JSON.stringify(sel)});if(!el)return null;var b=el.getBoundingClientRect();return {x:b.x,y:b.y,cx:b.x+b.width/2,cy:b.y+b.height/2,w:b.width,h:b.height,visible:b.width>0&&b.height>0&&b.bottom>0&&b.top<window.innerHeight};})()`);
    out.push(r);
  }
  return out;
}

async function installProbe() {
  await evaljs(`(function(){
    window.__probe = [];
    ['pointerdown','pointermove','pointerup','pointercancel','click'].forEach(function(t){
      document.addEventListener(t, function(e){
        var el = e.target;
        var desc = el ? (el.tagName||'?') + (el.id ? '#'+el.id : '') +
          (el.getAttribute ? ([...['data-drag-chip','data-drag-weight','data-bench','data-bench-rotate','data-drop','data-world']].map(function(a){var v=el.getAttribute(a);return v!=null?a+'='+v:null;}).filter(Boolean).join(' ')) : '') : '?';
        window.__probe.push(t + ' target=' + desc + ' pid=' + e.pointerId + ' primary=' + e.isPrimary + ' buttons=' + e.buttons + ' x=' + Math.round(e.clientX) + ' y=' + Math.round(e.clientY));
      }, true);
    });
  })()`);
}
async function probeLog() { return evaljs(`window.__probe ? window.__probe.join('\\n') : '(no probe)'`); }
async function clearProbe() { await evaljs(`window.__probe = []`); }

async function enterLab() {
  await evaljs(`(function(){ if (typeof navGo === 'function') navGo('lab'); })()`);
  await sleep(400);
  return evaljs(`(function(){ var s=document.getElementById('lab'); return s ? !s.hidden : null; })()`);
}

async function labState() {
  return evaljs(`(function(){
    if (typeof labWorld === 'undefined' || !labWorld) return { hasWorld: false };
    var d = MathWorld.derived(labWorld);
    return { hasWorld: true,
      benchCount: d.bench.count, benchTotal: d.bench.totalStr,
      balL: d.balance.Lstr, balR: d.balance.Rstr, balEqual: d.balance.equal,
      rect: labWorld.rect ? labWorld.rect.w + 'x' + (labWorld.rect.perim / 2 - labWorld.rect.w) + ' (perim ' + labWorld.rect.perim + ')' : null,
      rectAngle: labWorld.rect ? labWorld.rect.angle : null, // 第 3 批：长方形朝向
      benchRect: !!labWorld.benchRect, benchBalance: !!labWorld.benchBalance,
      // 第 3 批：画布 viewBox + 缩放标签（缩放/平移场景断言用）。
      viewBox: (function(){ var s=document.getElementById('worldBenchView'); if(!s||!s.viewBox||!s.viewBox.baseVal) return null; var v=s.viewBox.baseVal; return Math.round(v.x)+' '+Math.round(v.y)+' '+Math.round(v.width)+' '+Math.round(v.height); })(),
      zoomLabel: (function(){ var l=document.querySelector('[data-bench-zoom-label]'); return l?l.textContent:''; })(),
      benchTenframe: !!labWorld.benchTenframe, benchDatatable: !!labWorld.benchDatatable, benchSpinner: !!labWorld.benchSpinner,
      tf: labWorld.tenframe ? labWorld.tenframe.A + '+' + labWorld.tenframe.B + '=' + d.tenframe.sum : null,
      dt: d.datatable ? d.datatable.rows.map(function (r) { return r.label + ':' + r.n; }).join(',') + ' total=' + d.datatable.total : null,
      sp: d.spinner ? 'sectors=' + d.spinner.sectors + ' last=' + d.spinner.lastLabel + ' total=' + d.spinner.total : null,
      inspectSel: (typeof worldInspectSel !== 'undefined' && worldInspectSel) ? JSON.stringify(worldInspectSel) : null,
      benchView: (function(){ var v=document.getElementById('worldBenchViews'); return v ? v.textContent : ''; })(),
    };
  })()`);
}

async function main() {
  // 1. 直接用 file:// 加载独立文件（见文件头注释：http://127.0.0.1 会被
  // Chrome 155 的 LNA 检查拦住；独立文件自包含，无网络请求）。
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'repro-profile-'));
  fs.writeFileSync(WEBGL_POLICY, 'hatch-webgl-all-origins-v1\n');
  const webglSha = execSync(`sha256sum ${WEBGL_POLICY}`).toString().split(' ')[0];
  const url = 'file://' + path.join(WEBROOT, fileArg);
  const chrome = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--no-proxy-server',
    '--remote-debugging-port=' + PORT, '--user-data-dir=' + profile,
    '--window-size=1920,1080',
    '--hatch-webgl-allowed-domains-file=' + WEBGL_POLICY,
    '--hatch-webgl-allowed-domains-sha256=' + webglSha,
    url,
  ], { stdio: 'ignore' });

  const cleanup = () => { try { chrome.kill('SIGKILL'); } catch (e) {} };
  process.on('exit', cleanup);
  process.on('SIGINT', () => { cleanup(); process.exit(2); });

  // 2. Wait for DevTools endpoint and connect.
  let wsUrl = null;
  for (let i = 0; i < 40; i++) {
    await sleep(500);
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const page = list.find((t) => t.type === 'page');
      if (page) { wsUrl = page.webSocketDebuggerUrl; break; }
    } catch (e) { /* not up yet */ }
  }
  if (!wsUrl) { console.log('FAIL: chrome DevTools endpoint did not come up'); cleanup(); process.exit(1); }
  ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id).resolve(m.result || {}); pending.delete(m.id); return; }
    if (m.method === 'Runtime.exceptionThrown') {
      const d = m.params.exceptionDetails;
      pageErrors.push((d.exception && d.exception.description) || d.text || 'page exception');
    }
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
      consoleErrors.push(m.params.args.map((a) => a.value || a.description || '').join(' '));
    }
  };
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Log.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
  // 3. 页面随 Chrome 启动参数直接加载（file://）；等它就绪。
  let ready = null;
  for (let i = 0; i < 30; i++) {
    await sleep(500);
    ready = await evaljs(`(function(){ return { readyState: document.readyState, title: document.title, hasNavGo: typeof navGo === 'function', hasLab: !!document.getElementById('lab'), innerW: window.innerWidth }; })()`);
    if (ready && ready.hasNavGo && ready.hasLab) break;
  }
  console.log('  page ready: ' + JSON.stringify(ready));

  const report = { scenario, url, pass: null, notes: [] };
  const note = (s) => { report.notes.push(s); console.log('  ' + s); };

  try {
    if (scenario === 'station-drag') {
      const inLab = await enterLab();
      note('enter lab: hidden=' + (inLab === false ? 'no (visible)' : inLab));
      await evaljs(`document.getElementById('worldBalCard').classList.remove('collapsed')`);
      await sleep(200);
      await installProbe();
      const [chip, drop] = await centers('[data-drag-chip="weight"][data-qty="1"]', '#worldBalDropL');
      note('chip 1 center: ' + JSON.stringify(chip) + '  dropL center: ' + JSON.stringify(drop));
      const before = await labState();
      note('before: bal L=' + before.balL + ' R=' + before.balR);
      await clearProbe();
      await drag(chip.cx, chip.cy, drop.cx, drop.cy, 12, 40);
      const ghost = await evaljs(`(function(){var g=document.querySelector('.apparatus-ghost');return g?{display:g.style.display,text:g.textContent}:null;})()`);
      note('ghost during/after drag: ' + JSON.stringify(ghost));
      const after = await labState();
      note('after: bal L=' + after.balL + ' R=' + after.balR);
      note('probe events:\n' + (await probeLog()));
      const toast = await evaljs(`(function(){var m=document.getElementById('worldBalMsg');return m?m.textContent:'';})()`);
      note('station msg: ' + toast);
      report.pass = after.balL !== before.balL;
      note(report.pass ? 'RESULT: PASS — drag landed, left pan changed' : 'RESULT: FAIL — left pan unchanged, drag did not land');
    } else if (scenario === 'partsbox-drag') {
      await enterLab();
      // 天平上台面 + 切到天平视图
      await evaljs(`(function(){var b=document.querySelector('[data-bench="balance"]');if(b)b.click();})()`);
      await sleep(300);
      await installProbe();
      const [chip, view] = await centers('#worldBenchBox [data-bench="make"][data-kind="frac"][data-n="1"][data-d="6"]', '#worldBenchView');
      // 台面 viewBox 520x260，右盘 x 380–480、y 148–232 → 中心 (430,190)
      const px = view.x + (430 / 520) * view.w;
      const py = view.y + (190 / 260) * view.h;
      note('chip 1/6 center: ' + JSON.stringify(chip) + '  bench view: ' + JSON.stringify(view) + '  panR target: ' + Math.round(px) + ',' + Math.round(py));
      const before = await labState();
      note('before: bench=' + before.benchTotal + ' bal R=' + before.balR);
      await clearProbe();
      await drag(chip.cx, chip.cy, px, py, 12, 40);
      const ghost = await evaljs(`(function(){var g=document.getElementById('worldBenchGhost');return g?{hidden:g.hidden,text:g.textContent}:null;})()`);
      note('bench ghost: ' + JSON.stringify(ghost));
      const after = await labState();
      note('after: bench=' + after.benchTotal + ' bal R=' + after.balR);
      note('probe events:\n' + (await probeLog()));
      report.pass = after.balR !== before.balR || after.benchTotal !== before.benchTotal;
      note(report.pass ? 'RESULT: PASS — 1/6 landed somewhere on the bench' : 'RESULT: FAIL — nothing changed');
    } else if (scenario === 'bal-inspect-zero') {
      // 复测 (c)：左盘放 1、右盘放 1/6，点左盘合计打开那件砝码的检查器，
      // 把它的值改成 0——右盘的 1/6 不该跟着变 0。
      await enterLab();
      await evaljs(`(function(){var b=document.querySelector('[data-bench="balance"]');if(b)b.click();})()`);
      await sleep(300);
      const [chip1, chipF, view] = await centers(
        '#worldBenchBox [data-bench="make"][data-kind="num"][data-n="1"]',
        '#worldBenchBox [data-bench="make"][data-kind="frac"][data-n="1"][data-d="6"]',
        '#worldBenchView');
      const pxL = view.x + (110 / 520) * view.w, py = view.y + (190 / 260) * view.h;
      const pxR = view.x + (430 / 520) * view.w;
      await drag(chip1.cx, chip1.cy, pxL, py, 12, 40);
      await drag(chipF.cx, chipF.cy, pxR, py, 12, 40);
      const before = await labState();
      note('before: bal L=' + before.balL + ' R=' + before.balR);
      // 点左盘合计（pick-pan）→ 打开左盘最后一件砝码的检查器
      const [panL] = await centers('#worldBenchPanLText');
      await clickAt(panL.cx, panL.cy);
      await sleep(300);
      const insp = await evaljs(`(function(){var b=document.getElementById('worldBenchInspector');return b?b.textContent.slice(0,120):'';})()`);
      note('inspector: ' + insp);
      // 把值改成 0：先走滑杆 input 路径（真人拖滑杆），再走数字输入 change 路径，
      // 两条路都测——滑杆拖动时检查器会中途重建，值得单独验。
      const setRes = await evaljs(`(function(){
        var rng=document.querySelector('#worldBenchInspector input[data-insp="0"]');
        if(!rng) return 'no-range';
        rng.value='0'; rng.dispatchEvent(new Event('input',{bubbles:true}));
        return 'range-set-0';
      })()`);
      note('slider set: ' + setRes);
      await sleep(400);
      const after = await labState();
      note('after set left to 0: bal L=' + after.balL + ' R=' + after.balR);
      report.pass = before.balL === '1' && before.balR === '1/6' && after.balL === '0' && after.balR === '1/6';
      note(report.pass ? 'RESULT: PASS — only the left pan changed' : 'RESULT: FAIL — right pan also changed (or setup failed)');
    } else if (scenario === 'clear-all') {
      // 复测 4(a)：天平+长方形+直线都在台上、台上有散数，点“全部拿走”，
      // 台面要真空（大器材都下台），但站里的天平砝码不动。
      await enterLab();
      // 一个散数：点芯片直接放上台（不用拖）
      await evaljs(`(function(){var b=document.querySelector('#worldBenchBox [data-bench="make"][data-kind="num"][data-n="5"]');if(b)b.click();})()`);
      await sleep(300);
      // 天平最后上台：切到天平视图，再拖 1/6 上右盘
      await evaljs(`(function(){['rect','line','balance'].forEach(function(k){var b=document.querySelector('[data-bench="'+k+'"]');if(b)b.click();});})()`);
      await sleep(400);
      const [chipF, view] = await centers(
        '#worldBenchBox [data-bench="make"][data-kind="frac"][data-n="1"][data-d="6"]',
        '#worldBenchView');
      const pxR = view.x + (430 / 520) * view.w, py = view.y + (190 / 260) * view.h;
      await drag(chipF.cx, chipF.cy, pxR, py, 12, 40);
      const before = await labState();
      note('before: benchCount=' + before.benchCount + ' bench=' + before.benchTotal + ' bal R=' + before.balR + ' balance=' + before.benchBalance + ' rect=' + before.benchRect);
      const [clearBtn] = await centers('[data-bench="clear"]');
      await clickAt(clearBtn.cx, clearBtn.cy);
      await sleep(400);
      const after = await labState();
      const svgHasRect = await evaljs(`document.getElementById('worldBenchView').innerHTML.indexOf('#fde68a')>=0`);
      note('after 全部拿走: benchCount=' + after.benchCount + ' bal R=' + after.balR + ' balance=' + after.benchBalance + ' rect=' + after.benchRect + ' goldRectDrawn=' + svgHasRect);
      report.pass = before.benchCount === 1 && before.balR === '1/6' && after.benchCount === 0 &&
        !after.benchBalance && !after.benchRect && !svgHasRect && after.balR === '1/6';
      note(report.pass ? 'RESULT: PASS — bench truly empty, station weights kept' : 'RESULT: FAIL — apparatus still on bench or weights lost');
    } else if (scenario === 'rect-remove') {
      // 复测 4(b)：长方形+直线都在台上（坐标系视图），把长方形拿下台面，
      // 坐标系里不能再画金色长方形，但直线还在。
      await enterLab();
      await evaljs(`(function(){['rect','line'].forEach(function(k){var b=document.querySelector('[data-bench="'+k+'"]');if(b)b.click();});})()`);
      await sleep(400);
      const hasRectBefore = await evaljs(`document.getElementById('worldBenchView').innerHTML.indexOf('#fde68a')>=0`);
      const hasLineBefore = await evaljs(`document.getElementById('worldBenchView').innerHTML.indexOf('#ea580c')>=0`);
      note('before: goldRect=' + hasRectBefore + ' line=' + hasLineBefore);
      await evaljs(`(function(){var b=document.querySelector('[data-bench="rect"]');if(b)b.click();})()`);
      await sleep(400);
      const hasRectAfter = await evaljs(`document.getElementById('worldBenchView').innerHTML.indexOf('#fde68a')>=0`);
      const hasLineAfter = await evaljs(`document.getElementById('worldBenchView').innerHTML.indexOf('#ea580c')>=0`);
      note('after rect off: goldRect=' + hasRectAfter + ' line=' + hasLineAfter);
      report.pass = hasRectBefore && hasLineBefore && !hasRectAfter && hasLineAfter;
      note(report.pass ? 'RESULT: PASS — rect gone, line stays' : 'RESULT: FAIL — rect still drawn or line lost');
    } else if (scenario === 'combo-persist') {
      // 复测 4(d)：组合台左盘加 1，刷新后左盘还是 1（以前变 0）。
      await enterLab();
      // 组合台在“更多器材”折叠区里（#labWorkbench hidden），先点折叠按钮展开
      await evaljs(`(function(){var f=document.getElementById('labMoreFold');if(f)f.click();})()`);
      await sleep(300);
      const [plus] = await centers('#labWbIntPlus');
      await clickAt(plus.cx, plus.cy);
      await sleep(300);
      const before = await evaljs(`document.getElementById('labWbList').textContent`);
      note('before reload: combo list = ' + before);
      await send('Page.reload', { ignoreCache: true });
      await sleep(2500);
      await enterLab();
      await evaljs(`(function(){var f=document.getElementById('labMoreFold');if(f)f.click();})()`);
      await sleep(300);
      const after = await evaljs(`document.getElementById('labWbList').textContent`);
      const st = await labState();
      note('after reload: combo list = ' + after + ' world bal L=' + st.balL);
      report.pass = before.indexOf('左盘：1') >= 0 && after.indexOf('左盘：1') >= 0 && st.balL === '1';
      note(report.pass ? 'RESULT: PASS — combo left pan persists' : 'RESULT: FAIL — combo left pan lost on refresh');
    } else if (scenario === 'rect-refresh') {
      await enterLab();
      await evaljs(`(function(){var b=document.querySelector('[data-bench="rect"]');if(b)b.click();})()`);
      await sleep(300);
      await evaljs(`(function(){ if (typeof worldInspectSelect === 'function') worldInspectSelect({apparatus:'rect'}); })()`);
      await sleep(300);
      const pre = await evaljs(`(function(){
        var h=document.querySelector('[data-bench-rotate]');
        if (h) h.scrollIntoView({block:'center',behavior:'instant'});
        var r=h?h.getBoundingClientRect():null;
        return { handle: !!h, handleRect: r?{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}:null,
          sel: (typeof worldInspectSel!=='undefined'&&worldInspectSel)?JSON.stringify(worldInspectSel):null };
      })()`);
      await sleep(300);
      note('pre-refresh: ' + JSON.stringify(pre));
      const preW = await labState();
      if (pre.handle) {
        // 重新读一次坐标（滚动后坐标变了），再点手柄中心
        const pre2 = await evaljs(`(function(){var h=document.querySelector('[data-bench-rotate]');var r=h.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
        await clickAt(pre2.x, pre2.y);
        const afterClick = await labState();
        note('pre-refresh handle click: rect ' + preW.rect + ' -> ' + afterClick.rect);
      }
      await send('Page.reload', { ignoreCache: true });
      await sleep(2500);
      await enterLab();
      const post = await evaljs(`(function(){
        var h=document.querySelector('[data-bench-rotate]');
        var r=h?h.getBoundingClientRect():null;
        return { handle: !!h, handleRect: r?{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}:null,
          sel: (typeof worldInspectSel!=='undefined'&&worldInspectSel)?JSON.stringify(worldInspectSel):null,
          benchViewText: (document.getElementById('worldBenchViews')||{}).textContent || '' };
      })()`);
      const postW = await labState();
      note('post-refresh: ' + JSON.stringify(post) + ' rect=' + postW.rect + ' benchRect=' + postW.benchRect);
      // 刷新后手柄本来就不在（没选中）：点长方形本体，看能不能选中、出手柄。
      // 先等页面滚动停稳再量坐标：刷新后 navGo 的平滑滚动还在走时，量的坐标是
      // 半路的，隔几百毫秒再点就脱靶（实测：elementFromPoint 还是对的，点下去
      // 却打在空白 SVG 上；9×1 的长方形只有约 29px 高，滚一点就脱靶）。
      // 量完立刻点，中间不隔 sleep。
      for (let i = 0; i < 10; i++) {
        const y1 = await evaljs(`window.scrollY`);
        await sleep(200);
        const y2 = await evaljs(`window.scrollY`);
        if (y1 === y2) break;
      }
      await installProbe();
      await clearProbe();
      const rectBox = await evaljs(`(function(){
        var rc=document.querySelector('#worldBenchView rect[fill="#fde68a"]');
        if(!rc) return null;
        rc.scrollIntoView({block:'center',behavior:'instant'});
        var b=rc.getBoundingClientRect();
        var cx=b.x+b.width/2, cy=b.y+b.height/2;
        var top=document.elementFromPoint(cx,cy);
        var chain=[]; var el=top;
        while(el&&chain.length<6){chain.push(el.tagName+(el.getAttribute&&el.getAttribute('data-bench')?' data-bench='+el.getAttribute('data-bench'):'')+(el.getAttribute&&el.getAttribute('fill')?' fill='+el.getAttribute('fill'):'')+(el.textContent&&el.children.length===0?' text='+el.textContent.slice(0,12):'')); el=el.parentNode;}
        return {x:cx,y:cy, topChain: chain};
      })()`);
      note('body-center topmost chain: ' + JSON.stringify(rectBox && rectBox.topChain));
      if (rectBox) {
        await clickAt(rectBox.x, rectBox.y);
        await sleep(300);
        const postClick = await evaljs(`(function(){
          var h=document.querySelector('[data-bench-rotate]');
          return { handle: !!h, sel: (typeof worldInspectSel!=='undefined'&&worldInspectSel)?JSON.stringify(worldInspectSel):null };
        })()`);
        note('post-refresh rect-body click: ' + JSON.stringify(postClick));
        note('probe events:\n' + (await probeLog()));
        report.pass = postClick.handle === true;
      } else {
        report.pass = false;
      }
      note(report.pass ? 'RESULT: PASS — rect clickable after refresh, handle appears' : 'RESULT: FAIL — rect not selectable after refresh');
    } else if (scenario === 'rect-label') {
      await enterLab();
      await evaljs(`(function(){var b=document.querySelector('[data-bench="rect"]');if(b)b.click();})()`);
      await sleep(300);
      await evaljs(`(function(){ if (typeof worldInspectSelect === 'function') worldInspectSelect({apparatus:'rect'}); })()`);
      await sleep(300);
      const geo = await evaljs(`(function(){
        var h=document.querySelector('[data-bench-rotate]');
        if(!h) return {handle:false};
        var hr=h.getBoundingClientRect();
        // (w,h) 标签是坐标系里长方形右上角的 text
        var texts=[...document.querySelectorAll('#worldBenchView text')].filter(function(t){return /^\\(\\d+,\\d+\\)$/.test(t.textContent.trim());});
        var tr=texts.length?texts[0].getBoundingClientRect():null;
        return { handle:{x:Math.round(hr.x),y:Math.round(hr.y),w:Math.round(hr.width),h:Math.round(hr.height)},
          label: tr?{x:Math.round(tr.x),y:Math.round(tr.y),w:Math.round(tr.width),h:Math.round(tr.height),text:texts[0].textContent}:null,
          overlap: tr ? !(hr.x+hr.width<tr.x||tr.x+tr.width<hr.x||hr.y+hr.height<tr.y||tr.y+tr.height<hr.y) : null };
      })()`);
      note('geometry: ' + JSON.stringify(geo));
      report.pass = geo.handle && geo.label && geo.overlap === false;
      note(report.pass ? 'RESULT: PASS — handle and label do not overlap' : 'RESULT: FAIL — handle overlaps the (w,h) label');
    } else if (scenario === 'bal-clear') {
      // 非空断言：先放一个砝码上盘（台面拖放是通的），再点天平站“清空重来”，
      // 盘子必须真的清零——初始就是 0/0 时点不点都过，等于没测。
      await enterLab();
      await evaljs(`(function(){var b=document.querySelector('[data-bench="balance"]');if(b)b.click();})()`);
      await sleep(300);
      const [chipF, view] = await centers(
        '#worldBenchBox [data-bench="make"][data-kind="frac"][data-n="1"][data-d="6"]',
        '#worldBenchView');
      const pxR = view.x + (430 / 520) * view.w, py = view.y + (190 / 260) * view.h;
      await drag(chipF.cx, chipF.cy, pxR, py, 12, 40);
      const before = await labState();
      note('before: bal L=' + before.balL + ' R=' + before.balR);
      await evaljs(`document.getElementById('worldBalCard').classList.remove('collapsed')`);
      await sleep(200);
      const [btn] = await centers('[data-world="bal-clear"]');
      note('clear button: ' + JSON.stringify(btn));
      await clickAt(btn.cx, btn.cy);
      await sleep(300);
      const after = await labState();
      note('after click 清空重来: bal L=' + after.balL + ' R=' + after.balR);
      // “清空重来”按设计是重置回左盘 1/2（不是清零）：balanceClear 后再放 1/2，
      // 提示“天平已重置为左盘 1/2”。断言按设计值写。
      report.pass = before.balR === '1/6' && after.balL === '1/2' && after.balR === '0';
      note(report.pass ? 'RESULT: PASS — balance reset to left 1/2' : 'RESULT: FAIL — balance did not reset (or setup failed)');
    } else if (scenario === 'rect-vertex') {
      // 复测第 4 批第 4 项（部分失败）：刷新后点长方形红色顶点圆点，
      // 检查器不从数字卡切回长方形（本体和 (w,h) 标签点开都正常）。
      await enterLab();
      await evaljs(`(function(){var b=document.querySelector('[data-bench="rect"]');if(b)b.click();})()`);
      await sleep(300);
      await evaljs(`(function(){var b=document.querySelector('#worldBenchBox [data-bench="make"][data-kind="num"][data-n="5"]');if(b)b.click();})()`);
      await sleep(400);
      const setup = await evaljs(`(function(){
        var g=document.querySelector('#worldBenchView [data-bench="pick-rect"]');
        var dot=g?g.querySelector('circle'):null;
        var dots=[...document.querySelectorAll('#worldBenchView [data-bench="pick"]')].map(function(e){return e.textContent.trim();});
        return { rectGroup: !!g, vertexDot: !!dot, dotFill: dot?dot.getAttribute('fill'):null, dotR: dot?dot.getAttribute('r'):null,
          numDots: dots, view: (document.getElementById('worldBenchViews')||{}).textContent || '' };
      })()`);
      note('setup: ' + JSON.stringify(setup));
      // 先点数轴/坐标系里的 5 圆点，让检查器显示 数字卡·5
      const dot5 = await evaljs(`(function(){
        var gs=[...document.querySelectorAll('#worldBenchView [data-bench="pick"]')];
        var g=gs.find(function(e){return e.textContent.trim()==='5';});
        if(!g) return null;
        g.scrollIntoView({block:'center',behavior:'instant'});
        var b=g.getBoundingClientRect();
        return {x:b.x+b.width/2,y:b.y+b.height/2};
      })()`);
      note('num-5 dot center: ' + JSON.stringify(dot5));
      if (dot5) { await clickAt(dot5.x, dot5.y); await sleep(300); }
      const inspBefore = await evaljs(`(function(){var b=document.getElementById('worldBenchInspector');return b?b.textContent.slice(0,60):'';})()`);
      note('inspector before vertex click: ' + inspBefore);
      // 顶点圆点中心 + 该点最上层元素
      const vtx = await evaljs(`(function(){
        var dot=document.querySelector('#worldBenchView [data-bench="pick-rect"] circle');
        if(!dot) return null;
        dot.scrollIntoView({block:'center',behavior:'instant'});
        var b=dot.getBoundingClientRect();
        var cx=b.x+b.width/2, cy=b.y+b.height/2;
        var top=document.elementFromPoint(cx,cy);
        return {x:cx,y:cy, top: top ? top.tagName + (top.getAttribute('data-bench')?' data-bench='+top.getAttribute('data-bench'):'') + (top.getAttribute('fill')?' fill='+top.getAttribute('fill'):'') : null,
          topOuter: top && top.parentNode ? top.parentNode.tagName + (top.parentNode.getAttribute&&top.parentNode.getAttribute('data-bench')?' data-bench='+top.parentNode.getAttribute('data-bench'):'') : null};
      })()`);
      await sleep(300);
      note('vertex dot center + topmost: ' + JSON.stringify(vtx));
      await installProbe();
      await clearProbe();
      if (vtx) { await clickAt(vtx.x, vtx.y); await sleep(300); }
      const after = await evaljs(`(function(){
        var b=document.getElementById('worldBenchInspector');
        return { insp: b?b.textContent.slice(0,60):'',
          sel: (typeof worldInspectSel!=='undefined'&&worldInspectSel)?JSON.stringify(worldInspectSel):null };
      })()`);
      note('after vertex click: ' + JSON.stringify(after));
      note('probe events:\n' + (await probeLog()));
      report.pass = after.sel && after.sel.indexOf('"apparatus":"rect"') >= 0;
      note(report.pass ? 'RESULT: PASS — vertex dot switches inspector to the rectangle' : 'RESULT: FAIL — inspector did not switch to the rectangle');
      if (!report.pass) { console.log('SCENARIO ' + scenario + ': FAIL'); cleanup(); process.exit(1); }
      // 第二阶段：刷新后重走复测的确切顺序——点本体（应能选中）、点手柄转一次、
      // 再点 5 圆点（检查器切到数字卡·5），最后点顶点圆点（应切回长方形）。
      await send('Page.reload', { ignoreCache: true });
      await sleep(2500);
      await enterLab();
      const post = await evaljs(`(function(){
        var g=document.querySelector('#worldBenchView [data-bench="pick-rect"]');
        var dot=g?g.querySelector('circle'):null;
        return { rectGroup: !!g, vertexDot: !!dot,
          sel: (typeof worldInspectSel!=='undefined'&&worldInspectSel)?JSON.stringify(worldInspectSel):null,
          view: (document.getElementById('worldBenchViews')||{}).textContent || '' };
      })()`);
      note('post-refresh: ' + JSON.stringify(post));
      const bodyBox = await evaljs(`(function(){
        var rc=document.querySelector('#worldBenchView [data-bench="pick-rect"] rect');
        if(!rc) return null;
        rc.scrollIntoView({block:'center',behavior:'instant'});
        var b=rc.getBoundingClientRect();
        return {x:b.x+b.width/2,y:b.y+b.height/2};
      })()`);
      await sleep(300);
      if (bodyBox) { await clickAt(bodyBox.x, bodyBox.y); await sleep(300); }
      const afterBody = await evaljs(`(function(){return { sel: (typeof worldInspectSel!=='undefined'&&worldInspectSel)?JSON.stringify(worldInspectSel):null, handle: !!document.querySelector('[data-bench-rotate]') };})()`);
      note('post-refresh rect-body click: ' + JSON.stringify(afterBody));
      // 点 5 圆点 → 检查器切到数字卡·5
      const dot5b = await evaljs(`(function(){
        var gs=[...document.querySelectorAll('#worldBenchView [data-bench="pick"]')];
        var g=gs.find(function(e){return e.textContent.trim()==='5';});
        if(!g) return null;
        g.scrollIntoView({block:'center',behavior:'instant'});
        var b=g.getBoundingClientRect();
        return {x:b.x+b.width/2,y:b.y+b.height/2};
      })()`);
      if (dot5b) { await clickAt(dot5b.x, dot5b.y); await sleep(300); }
      const insp5 = await evaljs(`(function(){var b=document.getElementById('worldBenchInspector');return b?b.textContent.slice(0,40):'';})()`);
      note('inspector after 5-dot click (post-refresh): ' + insp5);
      const vtx2 = await evaljs(`(function(){
        var dot=document.querySelector('#worldBenchView [data-bench="pick-rect"] circle');
        if(!dot) return null;
        dot.scrollIntoView({block:'center',behavior:'instant'});
        var b=dot.getBoundingClientRect();
        var cx=b.x+b.width/2, cy=b.y+b.height/2;
        var top=document.elementFromPoint(cx,cy);
        return {x:cx,y:cy, top: top ? top.tagName + (top.getAttribute('data-bench')?' data-bench='+top.getAttribute('data-bench'):'') + (top.getAttribute('fill')?' fill='+top.getAttribute('fill'):'') + (top.getAttribute('data-id')?' data-id='+top.getAttribute('data-id'):'') : null};
      })()`);
      await sleep(300);
      note('post-refresh vertex dot center + topmost: ' + JSON.stringify(vtx2));
      await installProbe();
      await clearProbe();
      if (vtx2) { await clickAt(vtx2.x, vtx2.y); await sleep(300); }
      const after2 = await evaljs(`(function(){
        var b=document.getElementById('worldBenchInspector');
        return { insp: b?b.textContent.slice(0,60):'',
          sel: (typeof worldInspectSel!=='undefined'&&worldInspectSel)?JSON.stringify(worldInspectSel):null };
      })()`);
      note('post-refresh after vertex click: ' + JSON.stringify(after2));
      note('probe events:\n' + (await probeLog()));
      report.pass = after2.sel && after2.sel.indexOf('"apparatus":"rect"') >= 0;
      note(report.pass ? 'RESULT: PASS — post-refresh vertex dot switches inspector to the rectangle' : 'RESULT: FAIL — post-refresh vertex dot did not switch the inspector');
      if (!report.pass) { console.log('SCENARIO ' + scenario + ': FAIL'); cleanup(); process.exit(1); }
      // 第三阶段：复测的确切几何——宽 4（4×6），点手柄转成 6×4，再点 5 圆点，
      // 最后点顶点圆点（6×4 的顶点在 (6,4)，离数轴上的 5 圆点更近）。
      await evaljs(`(function(){ if (typeof worldPlayApply === 'function') worldPlayApply({type:'rectSet', w:4}, ''); })()`);
      await sleep(400);
      const handleBox = await evaljs(`(function(){
        var h=document.querySelector('[data-bench-rotate]');
        if(!h) return null;
        h.scrollIntoView({block:'center',behavior:'instant'});
        var b=h.getBoundingClientRect();
        return {x:b.x+b.width/2,y:b.y+b.height/2};
      })()`);
      await sleep(300);
      if (handleBox) { await clickAt(handleBox.x, handleBox.y); await sleep(300); }
      const afterHandle = await labState();
      note('after handle click: rect=' + afterHandle.rect);
      const dot5c = await evaljs(`(function(){
        var gs=[...document.querySelectorAll('#worldBenchView [data-bench="pick"]')];
        var g=gs.find(function(e){return e.textContent.trim()==='5';});
        if(!g) return null;
        g.scrollIntoView({block:'center',behavior:'instant'});
        var b=g.getBoundingClientRect();
        return {x:b.x+b.width/2,y:b.y+b.height/2};
      })()`);
      if (dot5c) { await clickAt(dot5c.x, dot5c.y); await sleep(300); }
      const vtx3 = await evaljs(`(function(){
        var dot=document.querySelector('#worldBenchView [data-bench="pick-rect"] circle');
        if(!dot) return null;
        dot.scrollIntoView({block:'center',behavior:'instant'});
        var b=dot.getBoundingClientRect();
        var cx=b.x+b.width/2, cy=b.y+b.height/2;
        var top=document.elementFromPoint(cx,cy);
        return {x:cx,y:cy, top: top ? top.tagName + (top.getAttribute('data-bench')?' data-bench='+top.getAttribute('data-bench'):'') + (top.getAttribute('fill')?' fill='+top.getAttribute('fill'):'') : null};
      })()`);
      await sleep(300);
      note('6x4 vertex dot center + topmost: ' + JSON.stringify(vtx3));
      await installProbe();
      await clearProbe();
      if (vtx3) { await clickAt(vtx3.x, vtx3.y); await sleep(300); }
      const after3 = await evaljs(`(function(){
        var b=document.getElementById('worldBenchInspector');
        return { insp: b?b.textContent.slice(0,60):'',
          sel: (typeof worldInspectSel!=='undefined'&&worldInspectSel)?JSON.stringify(worldInspectSel):null };
      })()`);
      note('6x4 after vertex click: ' + JSON.stringify(after3));
      note('probe events:\n' + (await probeLog()));
      report.pass = after3.sel && after3.sel.indexOf('"apparatus":"rect"') >= 0;
      note(report.pass ? 'RESULT: PASS — 6x4 vertex dot switches inspector to the rectangle' : 'RESULT: FAIL — 6x4 vertex dot did not switch the inspector');
    } else if (scenario === 'partsbox-after-exam') {
      // 复测 b5c48b96 的确切顺序：先放长方形（顶点圆点那项），再进挑战做天平题
      // （清空重来 → 站拖 1/6 到右盘 → 交卷 → 答错了 → 提交报告），关报告单、
      // 退出挑战、站拖放几次，最后器材盒快拖 1/6 到台面右盘——复测里这一步断了，
      // 但干净自由玩状态下 partsbox-drag 是通的，所以失败一定和考试后的状态有关。
      await enterLab();
      await evaljs(`(function(){var b=document.querySelector('[data-bench="rect"]');if(b)b.click();})()`);
      await sleep(300);
      await evaljs(`(function(){var b=document.getElementById('labModeChallenge');if(b)b.click();})()`);
      await sleep(300);
      await evaljs(`(function(){var b=document.getElementById('labQ-balfrac');if(b)b.click();})()`);
      await sleep(400);
      await evaljs(`document.getElementById('worldBalCard').classList.remove('collapsed')`);
      await sleep(200);
      const [clearBtn] = await centers('[data-world="bal-clear"]');
      if (clearBtn) { await clickAt(clearBtn.cx, clearBtn.cy); await sleep(300); }
      await installProbe();
      const [chipS, dropR] = await centers('[data-drag-chip="weight"][data-qty="1/6"]', '#worldBalDropR');
      note('station chip 1/6: ' + JSON.stringify(chipS) + '  dropR: ' + JSON.stringify(dropR));
      await clearProbe();
      if (chipS && dropR) await drag(chipS.cx, chipS.cy, dropR.cx, dropR.cy, 12, 40);
      const mid = await labState();
      note('after station drag 1/6 to right: bal L=' + mid.balL + ' R=' + mid.balR);
      await evaljs(`(function(){var b=document.getElementById('labChallengeSubmit');if(b)b.click();})()`);
      await sleep(300);
      await evaljs(`(function(){var b=document.querySelector('[data-lab-mark="wrong"]');if(b)b.click();})()`);
      await sleep(200);
      await evaljs(`(function(){var b=document.getElementById('labChallengeFinish');if(b)b.click();})()`);
      await sleep(400);
      const sheetOpen = await evaljs(`(function(){var s=document.getElementById('labReportSheet');return s?!s.hidden:null;})()`);
      note('report sheet open after submit: ' + sheetOpen);
      await evaljs(`(function(){var s=document.getElementById('labReportSheet');if(s)s.hidden=true;})()`);
      await evaljs(`(function(){var b=document.getElementById('labModeFree');if(b)b.click();})()`);
      await sleep(300);
      // 回归第 1 项：站拖放几次（1/6、1、1/2 到左右盘）
      const [chipA, dropL] = await centers('[data-drag-chip="weight"][data-qty="1/6"]', '#worldBalDropL');
      if (chipA && dropL) await drag(chipA.cx, chipA.cy, dropL.cx, dropL.cy, 12, 40);
      const [chipB, dropR2] = await centers('[data-drag-chip="weight"][data-qty="1"]', '#worldBalDropR');
      if (chipB && dropR2) await drag(chipB.cx, chipB.cy, dropR2.cx, dropR2.cy, 12, 40);
      const afterStation = await labState();
      note('after regression station drags: bal L=' + afterStation.balL + ' R=' + afterStation.balR);
      // 回归第 2 项：器材盒快拖 1/6 到台面右盘
      await evaljs(`(function(){var b=document.querySelector('[data-bench="balance"]');if(b)b.click();})()`);
      await sleep(300);
      const viewState = await evaljs(`(function(){return { showBal: (typeof benchShowBalance!=='undefined'?benchShowBalance:null), benchBal: !!(typeof labWorld!=='undefined'&&labWorld&&labWorld.benchBalance), viewText: (document.getElementById('worldBenchViews')||{}).textContent||'', hasPanR: !!document.getElementById('worldBenchPanR') };})()`);
      note('bench state before partsbox drag: ' + JSON.stringify(viewState));
      const [chip, view] = await centers('#worldBenchBox [data-bench="make"][data-kind="frac"][data-n="1"][data-d="6"]', '#worldBenchView');
      const px = view.x + (430 / 520) * view.w;
      const py = view.y + (190 / 260) * view.h;
      const dropAt = await evaljs(`(function(){return (typeof benchDropTargetAt==='function') ? benchDropTargetAt(${Math.round(px)}, ${Math.round(py)}) : 'no-fn';})()`);
      note('benchDropTargetAt at release point (' + Math.round(px) + ',' + Math.round(py) + '): ' + dropAt);
      const before = await labState();
      note('before: bench=' + before.benchTotal + ' bal R=' + before.balR);
      await installProbe();
      await clearProbe();
      await drag(chip.cx, chip.cy, px, py, 12, 40);
      const ghost = await evaljs(`(function(){var g=document.getElementById('worldBenchGhost');return g?{hidden:g.hidden,text:g.textContent}:null;})()`);
      note('bench ghost: ' + JSON.stringify(ghost));
      const after = await labState();
      note('after: bench=' + after.benchTotal + ' bal R=' + after.balR);
      note('probe events:\n' + (await probeLog()));
      report.pass = after.balR !== before.balR || after.benchTotal !== before.benchTotal;
      note(report.pass ? 'RESULT: PASS — 1/6 landed after the exam flow' : 'RESULT: FAIL — partsbox drag did not land after the exam flow');
    } else if (scenario === 'peek-hold') {
      // 复测 b5c48b96：按住“按住看台面”两次，按住期间只把页面往上滚了 200–350px，
      // 报告单完全没藏起来、台面也没露出来。先走到交卷后的状态（丢分报告 +
      // 报告单都开着），再分别用鼠标和触屏按住，看按住期间两个报告是不是都藏了、
      // 触屏按住会不会滚页面、松开是不是都回来。
      await enterLab();
      await evaljs(`(function(){var b=document.getElementById('labModeChallenge');if(b)b.click();})()`);
      await sleep(300);
      await evaljs(`(function(){var b=document.getElementById('labQ-balfrac');if(b)b.click();})()`);
      await sleep(400);
      await evaljs(`document.getElementById('worldBalCard').classList.remove('collapsed')`);
      await sleep(200);
      const [clearBtn] = await centers('[data-world="bal-clear"]');
      if (clearBtn) { await clickAt(clearBtn.cx, clearBtn.cy); await sleep(300); }
      const [chipS, dropR] = await centers('[data-drag-chip="weight"][data-qty="1/6"]', '#worldBalDropR');
      if (chipS && dropR) await drag(chipS.cx, chipS.cy, dropR.cx, dropR.cy, 12, 40);
      await evaljs(`(function(){var b=document.getElementById('labChallengeSubmit');if(b)b.click();})()`);
      await sleep(300);
      await evaljs(`(function(){var b=document.querySelector('[data-lab-mark="wrong"]');if(b)b.click();})()`);
      await sleep(200);
      await evaljs(`(function(){var b=document.getElementById('labChallengeFinish');if(b)b.click();})()`);
      await sleep(400);
      const peekState = async () => evaljs(`(function(){
        var box=document.getElementById('labChallengeReport');
        var sheet=document.getElementById('labReportSheet');
        return { boxDisplay: box?getComputedStyle(box).display:null, sheetDisplay: sheet?getComputedStyle(sheet).display:null,
          sheetHidden: sheet?sheet.hidden:null, scrollY: Math.round(window.scrollY) };
      })()`);
      const [peekBtn] = await centers('#labReportPeek');
      note('peek button: ' + JSON.stringify(peekBtn));
      const before = await peekState();
      note('before hold: ' + JSON.stringify(before));
      // 鼠标按住
      await installProbe();
      await mouse('mousePressed', peekBtn.cx, peekBtn.cy);
      await sleep(700);
      const heldMouse = await peekState();
      note('while holding (mouse): ' + JSON.stringify(heldMouse));
      await mouse('mouseReleased', peekBtn.cx, peekBtn.cy);
      await sleep(200);
      const afterMouse = await peekState();
      note('after mouse release: ' + JSON.stringify(afterMouse));
      // 触屏按住 + 往上滑（复测里页面往上滚了 200–350px）
      // 调试：按钮自己的 pointerdown/touchstart 监听到底收不收得到触屏事件。
      await evaljs(`(function(){
        window.__touchTest = [];
        var b = document.getElementById('labReportPeek');
        ['pointerdown','touchstart','pointerup','pointercancel','pointerleave'].forEach(function(t){
          b.addEventListener(t, function(e){ window.__touchTest.push(t + ' ptrType=' + (e.pointerType||'-') + ' pid=' + (e.pointerId==null?'-':e.pointerId)); });
        });
      })()`);
      await touch('touchStart', peekBtn.cx, peekBtn.cy);
      await sleep(300);
      const touchTest = await evaljs(`window.__touchTest ? window.__touchTest.join(' | ') : '(none)'`);
      note('button-level touch events: ' + touchTest);
      const clsAfterStart = await evaljs(`(function(){var b=document.getElementById('labChallengeReport');var s=document.getElementById('labReportSheet');return {boxCls:b?b.className:'',sheetCls:s?s.className:''};})()`);
      note('touch classes right after touchStart: ' + JSON.stringify(clsAfterStart));
      for (let i = 1; i <= 5; i++) { await touch('touchMove', peekBtn.cx, peekBtn.cy - i * 40); await sleep(80); }
      const clsAfterMove = await evaljs(`(function(){var b=document.getElementById('labChallengeReport');var s=document.getElementById('labReportSheet');return {boxCls:b?b.className:'',sheetCls:s?s.className:''};})()`);
      note('touch classes after moves: ' + JSON.stringify(clsAfterMove));
      const heldTouch = await peekState();
      note('while holding (touch, moved up 200px): ' + JSON.stringify(heldTouch));
      await touch('touchEnd', peekBtn.cx, peekBtn.cy - 200);
      await sleep(200);
      const afterTouch = await peekState();
      note('after touch release: ' + JSON.stringify(afterTouch));
      note('probe events:\n' + (await probeLog()));
      const mouseOk = heldMouse.boxDisplay === 'none' && heldMouse.sheetDisplay === 'none';
      const touchOk = heldTouch.boxDisplay === 'none' && heldTouch.sheetDisplay === 'none' &&
        Math.abs(heldTouch.scrollY - heldMouse.scrollY) < 10;
      // 注意：按住时 peek 会主动把主台面滚进视口（见 peek-bench 场景），
      // 所以按住的 scrollY 是台面位置，不是按住前的位置；触屏滚动的原 bug
      // 是 scrollY 往上 +172px——拿触屏和鼠标的按住值比，不拿按住前比。
      // 松开后 scrollY 回到 3760 也证明没滚。
      const restoreOk = afterMouse.boxDisplay !== 'none' && afterMouse.sheetDisplay !== 'none' &&
        afterTouch.boxDisplay !== 'none' && afterTouch.sheetDisplay !== 'none';
      report.pass = mouseOk && touchOk && restoreOk;
      note('mouse-hold hides both: ' + mouseOk + ' | touch-hold hides both + no scroll: ' + touchOk + ' | release restores: ' + restoreOk);
      note(report.pass ? 'RESULT: PASS — peek hides the reports while held, no scroll, restores on release'
        : 'RESULT: FAIL — peek does not hide the reports while held (or scrolls / does not restore)');
    } else if (scenario === 'partsbox-noview') {
      // 复测 b5c48b96 的关键疑点：顶点圆点那项先放了长方形（benchShowBalance=false），
      // 之后进天平题、交卷、退出挑战——进题并不把 benchShowBalance 设回 true。
      // 所以台面可能一直停在坐标系视图（长方形），根本没画天平；测试员拖 1/6 去
      // “台面的天平右盘”时，落点判定里就没有台面盘子可认。本场景复现这条路：
      // 走完考试流程后**不点**天平器材/天平视图按钮，直接拖 1/6 到台面盘子坐标，
      // 看台面到底画的是什么、落点判定返回什么、拖放落到哪。
      await enterLab();
      await evaljs(`(function(){var b=document.querySelector('[data-bench="rect"]');if(b)b.click();})()`);
      await sleep(300);
      await evaljs(`(function(){var b=document.getElementById('labModeChallenge');if(b)b.click();})()`);
      await sleep(300);
      await evaljs(`(function(){var b=document.getElementById('labQ-balfrac');if(b)b.click();})()`);
      await sleep(400);
      await evaljs(`document.getElementById('worldBalCard').classList.remove('collapsed')`);
      await sleep(200);
      const [clearBtn] = await centers('[data-world="bal-clear"]');
      if (clearBtn) { await clickAt(clearBtn.cx, clearBtn.cy); await sleep(300); }
      const [chipS, dropR] = await centers('[data-drag-chip="weight"][data-qty="1/6"]', '#worldBalDropR');
      if (chipS && dropR) await drag(chipS.cx, chipS.cy, dropR.cx, dropR.cy, 12, 40);
      await evaljs(`(function(){var b=document.getElementById('labChallengeSubmit');if(b)b.click();})()`);
      await sleep(300);
      await evaljs(`(function(){var b=document.querySelector('[data-lab-mark="wrong"]');if(b)b.click();})()`);
      await sleep(200);
      await evaljs(`(function(){var b=document.getElementById('labChallengeFinish');if(b)b.click();})()`);
      await sleep(400);
      await evaljs(`(function(){var s=document.getElementById('labReportSheet');if(s)s.hidden=true;})()`);
      await evaljs(`(function(){var b=document.getElementById('labModeFree');if(b)b.click();})()`);
      await sleep(300);
      const viewState = await evaljs(`(function(){
        var btns=[...document.querySelectorAll('#worldBenchViews button')].map(function(b){return b.textContent.trim()+(b.className.indexOf('primary')>=0?'(当前)':'');});
        return { showBal: (typeof benchShowBalance!=='undefined'?benchShowBalance:null),
          prefView: (typeof benchPreferredView!=='undefined'?benchPreferredView:null),
          benchBal: !!(typeof labWorld!=='undefined'&&labWorld&&labWorld.benchBalance),
          benchRect: !!(typeof labWorld!=='undefined'&&labWorld&&labWorld.benchRect),
          viewBtns: btns, hasPanR: !!document.getElementById('worldBenchPanR'),
          benchSvgHasPan: (document.getElementById('worldBenchView')||{innerHTML:''}).innerHTML.indexOf('worldBenchPanR')>=0 };
      })()`);
      note('bench view after exam flow (no balance click): ' + JSON.stringify(viewState));
      const [chip, view] = await centers('#worldBenchBox [data-bench="make"][data-kind="frac"][data-n="1"][data-d="6"]', '#worldBenchView');
      const px = view.x + (430 / 520) * view.w;
      const py = view.y + (190 / 260) * view.h;
      const dropAt = await evaljs(`(function(){return (typeof benchDropTargetAt==='function') ? benchDropTargetAt(${Math.round(px)}, ${Math.round(py)}) : 'no-fn';})()`);
      note('benchDropTargetAt at bench-pan coords (' + Math.round(px) + ',' + Math.round(py) + '): ' + dropAt);
      const before = await labState();
      note('before: bench=' + before.benchTotal + ' bal R=' + before.balR);
      await installProbe();
      await clearProbe();
      await drag(chip.cx, chip.cy, px, py, 12, 40);
      const after = await labState();
      const toast = await evaljs(`(function(){var m=document.getElementById('worldBenchMsg');return m?m.textContent:'';})()`);
      note('after drag to bench-pan coords: bench=' + after.benchTotal + ' bal R=' + after.balR + ' toast=' + toast);
      note('probe events:\n' + (await probeLog()));
      // 结论：台面没画天平时，拖到“盘子坐标”只能落成散数（或什么都不发生），
      // 盘子本身认不到——这就是复测里“台面天平视图不接受任何砝码落下”的样子。
      report.pass = viewState.showBal === true && dropAt === 'balance.R';
      note(report.pass ? 'RESULT: PASS — bench is in balance view and the pan accepts drops'
        : 'RESULT: FAIL — bench is NOT in balance view after the exam flow (showBal=' + viewState.showBal + ', dropAt=' + dropAt + ')');
    } else if (scenario === 'combo-sync') {
      // 复测 b5c48b96 第 3 项：站里拖了砝码，组合台的盘子显示还是旧值（stale），
      // 刷新后按世界重摆，看起来像“右盘没保存”。修后：站里一改天平，组合台
      // 的显示就该跟着世界走，不用等刷新、不用点组合台。
      await enterLab();
      await evaljs(`document.getElementById('worldBalCard').classList.remove('collapsed')`);
      await sleep(200);
      await evaljs(`(function(){var f=document.getElementById('labMoreFold');if(f)f.click();})()`);
      await sleep(300);
      const comboBefore = await evaljs(`document.getElementById('labWbList').textContent`);
      note('combo list before station drag: ' + comboBefore);
      const [chipS, dropR] = await centers('[data-drag-chip="weight"][data-qty="1/6"]', '#worldBalDropR');
      if (chipS && dropR) await drag(chipS.cx, chipS.cy, dropR.cx, dropR.cy, 12, 40);
      await sleep(400);
      const st = await labState();
      const comboAfter = await evaljs(`document.getElementById('labWbList').textContent`);
      note('after station drag 1/6 to right: world bal L=' + st.balL + ' R=' + st.balR + ' | combo list = ' + comboAfter);
      report.pass = st.balR === '1/6' && comboAfter.indexOf('右盘：1/6') >= 0;
      note(report.pass ? 'RESULT: PASS — combo display follows the world immediately'
        : 'RESULT: FAIL — combo display is stale (does not match the world)');
    } else if (scenario === 'exam-exit') {
      // 复测 b5c48b96 第 4 项：考完回自由玩，流程面板还留着“考试进行中”。
      // 走完考试（进挑战 → 天平题 → 站拖 1/6 → 交卷 → 答错了 → 提交报告），
      // 退出挑战，看流程面板里还有没有“考试进行中”。
      await enterLab();
      await evaljs(`(function(){var b=document.getElementById('labModeChallenge');if(b)b.click();})()`);
      await sleep(300);
      await evaljs(`(function(){var b=document.getElementById('labQ-balfrac');if(b)b.click();})()`);
      await sleep(400);
      const during = await evaljs(`(function(){var b=document.getElementById('worldProcOut');return b?b.innerHTML.indexOf('考试进行中')>=0:false;})()`);
      note('procedure panel during exam shows 考试进行中: ' + during);
      await evaljs(`document.getElementById('worldBalCard').classList.remove('collapsed')`);
      await sleep(200);
      const [chipS, dropR] = await centers('[data-drag-chip="weight"][data-qty="1/6"]', '#worldBalDropR');
      if (chipS && dropR) await drag(chipS.cx, chipS.cy, dropR.cx, dropR.cy, 12, 40);
      await evaljs(`(function(){var b=document.getElementById('labChallengeSubmit');if(b)b.click();})()`);
      await sleep(300);
      await evaljs(`(function(){var b=document.querySelector('[data-lab-mark="wrong"]');if(b)b.click();})()`);
      await sleep(200);
      await evaljs(`(function(){var b=document.getElementById('labChallengeFinish');if(b)b.click();})()`);
      await sleep(400);
      await evaljs(`(function(){var b=document.getElementById('labModeFree');if(b)b.click();})()`);
      await sleep(400);
      const after = await evaljs(`(function(){
        var b=document.getElementById('worldProcOut');
        return { hasExamLine: b?b.innerHTML.indexOf('考试进行中')>=0:null,
          procMode: (typeof labWorld!=='undefined'&&labWorld&&labWorld.procedure)?labWorld.procedure.mode:null,
          text: b?b.textContent.slice(0,80):'' };
      })()`);
      note('after exiting challenge: ' + JSON.stringify(after));
      report.pass = during === true && after.hasExamLine === false && after.procMode !== 'exam';
      note(report.pass ? 'RESULT: PASS — no stale 考试进行中 after leaving challenge'
        : 'RESULT: FAIL — stale 考试进行中 remains in free play');
    } else if (scenario === 'peek-bench') {
      // 复测 6a012392 第 1 项：按住看台面藏/恢复通了，但按住时页面往上滚约 600px，
      // 露出来的是组合台数轴（空的），不是主台面天平。本场景复现这一点：
      // 走到交卷后状态，按住 peek 按钮，量按住期间视口里到底是哪块台面、
      // 主台面天平的盘子在不在视口里、松开后 scrollY 回不回得来。
      // （旧 peek-hold 只比“按住时 scrollY 动没动”，把藏报告后的 scroll
      // anchoring 当正常——它只证明了藏/恢复，没证明露出来的是主台面。）
      await enterLab();
      await evaljs(`(function(){var b=document.getElementById('labModeChallenge');if(b)b.click();})()`);
      await sleep(300);
      await evaljs(`(function(){var b=document.getElementById('labQ-balfrac');if(b)b.click();})()`);
      await sleep(400);
      await evaljs(`document.getElementById('worldBalCard').classList.remove('collapsed')`);
      await sleep(200);
      const [clearBtn] = await centers('[data-world="bal-clear"]');
      if (clearBtn) { await clickAt(clearBtn.cx, clearBtn.cy); await sleep(300); }
      const [chipS, dropR] = await centers('[data-drag-chip="weight"][data-qty="1/6"]', '#worldBalDropR');
      if (chipS && dropR) await drag(chipS.cx, chipS.cy, dropR.cx, dropR.cy, 12, 40);
      await evaljs(`(function(){var b=document.getElementById('labChallengeSubmit');if(b)b.click();})()`);
      await sleep(300);
      await evaljs(`(function(){var b=document.querySelector('[data-lab-mark="wrong"]');if(b)b.click();})()`);
      await sleep(200);
      await evaljs(`(function(){var b=document.getElementById('labChallengeFinish');if(b)b.click();})()`);
      await sleep(400);
      const viewState = async () => evaljs(`(function(){
        function r(sel){var el=document.querySelector(sel);if(!el)return null;var b=el.getBoundingClientRect();return {top:Math.round(b.top),bottom:Math.round(b.bottom),inView:b.bottom>0&&b.top<window.innerHeight};}
        var c=document.elementFromPoint(Math.round(window.innerWidth/2),Math.round(window.innerHeight/2));
        return { scrollY: Math.round(window.scrollY),
          benchView: r('#worldBenchView'), panL: r('#worldBenchPanL'), panR: r('#worldBenchPanR'),
          comboBal: r('#lab-balance2'), comboLine: r('#lab-numline'),
          centerEl: c?(c.tagName+(c.id?'#'+c.id:'')):'(none)' };
      })()`);
      const [peekBtn] = await centers('#labReportPeek');
      const before = await viewState();
      note('before hold: ' + JSON.stringify(before));
      await mouse('mousePressed', peekBtn.cx, peekBtn.cy);
      await sleep(800);
      const heldMouse = await viewState();
      note('while holding (mouse): ' + JSON.stringify(heldMouse));
      await mouse('mouseReleased', peekBtn.cx, peekBtn.cy);
      await sleep(300);
      const afterMouse = await viewState();
      note('after mouse release: ' + JSON.stringify(afterMouse));
      // 触屏按住同样要露主台面（云端测不了触屏，本地是唯一验证）。
      const [peekBtn2] = await centers('#labReportPeek');
      await touch('touchStart', peekBtn2.cx, peekBtn2.cy);
      await sleep(700);
      const heldTouch = await viewState();
      note('while holding (touch): ' + JSON.stringify(heldTouch));
      await touch('touchEnd', peekBtn2.cx, peekBtn2.cy);
      await sleep(300);
      const afterTouch = await viewState();
      note('after touch release: ' + JSON.stringify(afterTouch));
      const benchInView = (h) => h.benchView && h.benchView.inView && h.panL && h.panL.inView && h.panR && h.panR.inView;
      const mouseOk = benchInView(heldMouse) && Math.abs(afterMouse.scrollY - before.scrollY) < 10;
      const touchOk = benchInView(heldTouch) && Math.abs(afterTouch.scrollY - before.scrollY) < 10;
      report.pass = mouseOk && touchOk;
      note('mouse: bench in view while held + scroll restores: ' + mouseOk + ' | touch: ' + touchOk);
      note(report.pass ? 'RESULT: PASS — main bench balance is in view while held (mouse + touch), scroll restores on release'
        : 'RESULT: FAIL — while held the main bench is NOT in view (mouse scrollY ' + before.scrollY + ' -> ' + heldMouse.scrollY + ', touch -> ' + heldTouch.scrollY + ') or scroll did not restore');
    } else if (scenario === 'exam-refresh') {
      // 复测 6a012392 附带发现：中途刷新页面打断考试，自由玩里“台面在说什么”
      // 仍显示“考试进行中”。进挑战 → 天平题 → 刷新 → 重进实验室，
      // 看流程面板里还有没有“考试进行中”，世界里的流程还挂不挂着考试。
      await enterLab();
      await evaljs(`(function(){var b=document.getElementById('labModeChallenge');if(b)b.click();})()`);
      await sleep(300);
      await evaljs(`(function(){var b=document.getElementById('labQ-balfrac');if(b)b.click();})()`);
      await sleep(400);
      const during = await evaljs(`(function(){var b=document.getElementById('worldProcOut');return b?b.innerHTML.indexOf('考试进行中')>=0:false;})()`);
      note('procedure panel during exam shows 考试进行中: ' + during);
      await send('Page.reload', { ignoreCache: true });
      await sleep(2500);
      await enterLab();
      await sleep(300);
      const after = await evaljs(`(function(){
        var b=document.getElementById('worldProcOut');
        return { hasExamLine: b?b.innerHTML.indexOf('考试进行中')>=0:null,
          procMode: (typeof labWorld!=='undefined'&&labWorld&&labWorld.procedure)?labWorld.procedure.mode:null,
          text: b?b.textContent.slice(0,80):'' };
      })()`);
      note('after refresh + re-enter lab: ' + JSON.stringify(after));
      report.pass = during === true && after.hasExamLine === false && after.procMode !== 'exam';
      note(report.pass ? 'RESULT: PASS — no stale 考试进行中 after refresh mid-exam'
        : 'RESULT: FAIL — stale 考试进行中 remains after refresh mid-exam');
    } else if (scenario === 'tenframe-bench') {
      // Phase 3 batch 2：十格阵上台面。点零件盒的“十格阵（拿上台）”→
      // 台面切到十格阵画法、检查器出 A/B 个数；滑杆改 A=4 → 画布和合计
      // 跟着变；点画布上的十格阵本体 → 选中开关；刷新 → 还在台上。
      await enterLab();
      await evaljs(`(function(){var b=document.querySelector('[data-bench="tenframe"]');if(b)b.click();})()`);
      await sleep(400);
      const afterPut = await labState();
      note('after putting ten-frame on bench: ' + JSON.stringify(afterPut));
      const canvas1 = await evaljs(`(function(){var v=document.getElementById('worldBenchView');return v?v.innerHTML.indexOf('pick-tenframe')>=0:false;})()`);
      const insp1 = await evaljs(`(function(){var b=document.getElementById('worldBenchInspector');return b?b.textContent.slice(0,60):'';})()`);
      note('canvas draws ten-frame: ' + canvas1 + ' | inspector: ' + insp1);
      // 滑杆改 A=4（检查器第 0 个属性）
      const setRes = await evaljs(`(function(){
        var rng=document.querySelector('#worldBenchInspector input[data-insp="0"]');
        if(!rng) return 'no-range';
        rng.value='4'; rng.dispatchEvent(new Event('input',{bubbles:true}));
        return 'range-set-4';
      })()`);
      note('slider set A: ' + setRes);
      await sleep(400);
      const afterSet = await labState();
      note('after setting A=4: ' + JSON.stringify(afterSet));
      const canvas2 = await evaljs(`(function(){var v=document.getElementById('worldBenchView');return v?v.innerHTML.indexOf('A：4 个')>=0&&v.innerHTML.indexOf('合计：4 + 0 = 4')>=0:false;})()`);
      note('canvas shows A 4 and sum 4: ' + canvas2);
      // 点画布上的十格阵本体 → 取消选中；再点一次 → 重新选中。
      const [tfG] = await centers('#worldBenchView [data-bench="pick-tenframe"]');
      if (tfG) { await clickAt(tfG.cx, tfG.cy); await sleep(300); }
      const selOff = await labState();
      note('after clicking canvas ten-frame once: inspectSel=' + selOff.inspectSel);
      if (tfG) { await clickAt(tfG.cx, tfG.cy); await sleep(300); }
      const selOn = await labState();
      note('after clicking canvas ten-frame again: inspectSel=' + selOn.inspectSel);
      // 刷新：自动保存的世界要把十格阵（开关 + A=4）带回来。
      await send('Page.reload', { ignoreCache: true });
      await sleep(2500);
      await enterLab();
      await sleep(300);
      const afterRefresh = await labState();
      note('after refresh: ' + JSON.stringify(afterRefresh));
      const canvas3 = await evaljs(`(function(){var v=document.getElementById('worldBenchView');return v?v.innerHTML.indexOf('A：4 个')>=0:false;})()`);
      note('canvas still shows A 4 after refresh: ' + canvas3);
      report.pass = afterPut.benchTenframe === true && canvas1 === true &&
        insp1.indexOf('十格阵') >= 0 && afterSet.tf === '4+0=4' && canvas2 === true &&
        selOff.inspectSel === null && selOn.inspectSel !== null &&
        selOn.inspectSel.indexOf('tenframe') >= 0 &&
        afterRefresh.benchTenframe === true && afterRefresh.tf === '4+0=4' && canvas3 === true;
      note(report.pass ? 'RESULT: PASS — ten-frame on bench, inspector live, canvas toggle, survives refresh'
        : 'RESULT: FAIL — ten-frame bench flow broken (see notes above)');
      // 收尾：十格阵拿下台面，别影响后面的场景。
      await evaljs(`(function(){var b=document.querySelector('[data-bench="tenframe"]');if(b)b.click();})()`);
      await sleep(300);
    } else if (scenario === 'datatable-bench') {
      // Phase 3 batch 2：数据表上台面。点“数据表（拿上台）”→ 台面切到
      // 数据表画法、检查器出每行的数；滑杆改 A=5 → 表和合计跟着变；
      // 检查器“加一行” → 多一行 C；刷新 → 表（开关 + 行 + 数）都在。
      await enterLab();
      await evaljs(`(function(){var b=document.querySelector('[data-bench="datatable"]');if(b)b.click();})()`);
      await sleep(400);
      const afterPut = await labState();
      note('after putting datatable on bench: ' + JSON.stringify(afterPut));
      const canvas1 = await evaljs(`(function(){var v=document.getElementById('worldBenchView');return v?v.innerHTML.indexOf('pick-datatable')>=0&&v.innerHTML.indexOf('结果')>=0:false;})()`);
      const insp1 = await evaljs(`(function(){var b=document.getElementById('worldBenchInspector');return b?b.textContent.slice(0,60):'';})()`);
      note('canvas draws datatable: ' + canvas1 + ' | inspector: ' + insp1);
      const setRes = await evaljs(`(function(){
        var rng=document.querySelector('#worldBenchInspector input[data-insp="0"]');
        if(!rng) return 'no-range';
        rng.value='5'; rng.dispatchEvent(new Event('input',{bubbles:true}));
        return 'range-set-5';
      })()`);
      note('slider set A row: ' + setRes);
      await sleep(400);
      const afterSet = await labState();
      note('after setting A=5: ' + JSON.stringify(afterSet));
      // 检查器“加一行”（第 0 个动作按钮）
      const addRes = await evaljs(`(function(){
        var b=document.querySelector('#worldBenchInspector [data-insp-action="0"]');
        if(!b) return 'no-action-btn';
        b.click(); return 'clicked-add-row';
      })()`);
      note('add-row action: ' + addRes);
      await sleep(400);
      const afterAdd = await labState();
      note('after add row: ' + JSON.stringify(afterAdd));
      await send('Page.reload', { ignoreCache: true });
      await sleep(2500);
      await enterLab();
      await sleep(300);
      const afterRefresh = await labState();
      note('after refresh: ' + JSON.stringify(afterRefresh));
      report.pass = afterPut.benchDatatable === true && canvas1 === true &&
        insp1.indexOf('数据表') >= 0 && afterSet.dt === 'A:5,B:0 total=5' &&
        addRes === 'clicked-add-row' && afterAdd.dt === 'A:5,B:0,C:0 total=5' &&
        afterRefresh.benchDatatable === true && afterRefresh.dt === 'A:5,B:0,C:0 total=5';
      note(report.pass ? 'RESULT: PASS — datatable on bench, inspector live, add-row works, survives refresh'
        : 'RESULT: FAIL — datatable bench flow broken (see notes above)');
      await evaljs(`(function(){var b=document.querySelector('[data-bench="datatable"]');if(b)b.click();})()`);
      await sleep(300);
    } else if (scenario === 'spinner-spin') {
      // Phase 3 batch 2：转盘上台面。点“转盘（拿上台）”→ 台面切到转盘
      // 画法（4 个扇区 + “转一转”按钮）；点画布上的“转一转” → 转一次
      // 记一次、圆心出现结果；检查器再转一次 → 共 2 次；扇区改 6 个 →
      // 次数清零、6 个扇区；刷新 → 转盘（开关 + 6 扇区）还在。
      await enterLab();
      await evaljs(`(function(){var b=document.querySelector('[data-bench="spinner"]');if(b)b.click();})()`);
      await sleep(400);
      const afterPut = await labState();
      note('after putting spinner on bench: ' + JSON.stringify(afterPut));
      const canvas1 = await evaljs(`(function(){var v=document.getElementById('worldBenchView');var h=v?v.innerHTML:'';return { pick: h.indexOf('pick-spinner')>=0, spinBtn: h.indexOf('data-bench="spin"')>=0, sectors: (h.match(/<path d="M 190 130/g)||[]).length };})()`);
      note('canvas draws spinner: ' + JSON.stringify(canvas1));
      // 点画布上的“转一转”按钮（真鼠标点击，不是 JS 直接调）
      const [spinBtn] = await centers('#worldBenchView [data-bench="spin"]');
      note('spin button center: ' + JSON.stringify(spinBtn));
      if (spinBtn) { await clickAt(spinBtn.cx, spinBtn.cy); await sleep(400); }
      const afterSpin1 = await labState();
      const toast1 = await evaljs(`(function(){var m=document.getElementById('worldBenchMsg');return m?m.textContent:'';})()`);
      note('after canvas spin: ' + JSON.stringify(afterSpin1) + ' toast=' + toast1);
      // 检查器“转一转”动作按钮再转一次
      const insp1 = await evaljs(`(function(){var b=document.getElementById('worldBenchInspector');return b?b.textContent.slice(0,60):'';})()`);
      note('inspector: ' + insp1);
      const spinRes = await evaljs(`(function(){
        var b=document.querySelector('#worldBenchInspector [data-insp-action="0"]');
        if(!b) return 'no-action-btn';
        b.click(); return 'clicked-spin';
      })()`);
      note('inspector spin action: ' + spinRes);
      await sleep(400);
      const afterSpin2 = await labState();
      note('after inspector spin: ' + JSON.stringify(afterSpin2));
      // 扇区改 6 个（检查器第 0 个属性是扇区数滑杆）
      const setRes = await evaljs(`(function(){
        var rng=document.querySelector('#worldBenchInspector input[data-insp="0"]');
        if(!rng) return 'no-range';
        rng.value='6'; rng.dispatchEvent(new Event('input',{bubbles:true}));
        return 'sectors-set-6';
      })()`);
      note('sectors set: ' + setRes);
      await sleep(400);
      const afterSectors = await labState();
      const canvas2 = await evaljs(`(function(){var v=document.getElementById('worldBenchView');var h=v?v.innerHTML:'';return (h.match(/<path d="M 190 130/g)||[]).length;})()`);
      note('after sectors=6: ' + JSON.stringify(afterSectors) + ' sector paths on canvas=' + canvas2);
      await send('Page.reload', { ignoreCache: true });
      await sleep(2500);
      await enterLab();
      await sleep(300);
      const afterRefresh = await labState();
      note('after refresh: ' + JSON.stringify(afterRefresh));
      report.pass = afterPut.benchSpinner === true && canvas1.pick === true && canvas1.spinBtn === true && canvas1.sectors === 4 &&
        afterSpin1.sp !== null && afterSpin1.sp.indexOf('total=1') >= 0 && toast1.indexOf('转到') >= 0 &&
        spinRes === 'clicked-spin' && afterSpin2.sp !== null && afterSpin2.sp.indexOf('total=2') >= 0 &&
        afterSectors.sp !== null && afterSectors.sp.indexOf('sectors=6') >= 0 && afterSectors.sp.indexOf('total=0') >= 0 && canvas2 === 6 &&
        afterRefresh.benchSpinner === true && afterRefresh.sp !== null && afterRefresh.sp.indexOf('sectors=6') >= 0;
      note(report.pass ? 'RESULT: PASS — spinner on bench, canvas + inspector spin, sectors live, survives refresh'
        : 'RESULT: FAIL — spinner bench flow broken (see notes above)');
      await evaljs(`(function(){var b=document.querySelector('[data-bench="spinner"]');if(b)b.click();})()`);
      await sleep(300);
    } else if (scenario === 'rect-rotate-drag') {
      // Phase 3 batch 3：拖手柄转任意角度。1×9 长方形，手柄在右上顶点外；
      // 绕中心顺时针拖 ~90° → 角度 ≈90°、宽/长/面积不动，检查器角度数字
      // 实时跟；拖完那一下 click 不能再触发 90° 互换（长方形不能变成 9×1）；
      // 之后再点一下手柄，90° 互换还在（1×9 → 9×1）。
      await enterLab();
      await evaljs(`(function(){var b=document.querySelector('[data-bench="rect"]');if(b)b.click();})()`);
      await sleep(300);
      await evaljs(`(function(){ if (typeof worldInspectSelect === 'function') worldInspectSelect({apparatus:'rect'}); })()`);
      await sleep(300);
      // 先把手柄滚进视野，再量几何：目标点在 SVG 坐标里算好再换算到视口
      // （画布宽高比万一不是 2:1，视口里直接转 90° 在 SVG 里就不是 90°）。
      await centers('[data-bench-rotate]');
      const geo = await evaljs(`(function(){
        var svg=document.getElementById('worldBenchView');
        if(!svg) return null;
        var r=svg.getBoundingClientRect();
        var vb=svg.viewBox.baseVal;
        var d=MathWorld.derived(labWorld).rect;
        var h=document.querySelector('[data-bench-rotate]');
        if(!h) return null;
        var hr=h.getBoundingClientRect();
        function toSvg(vx,vy){ return { x: vb.x+((vx-r.x)/r.width)*vb.width, y: vb.y+((vy-r.y)/r.height)*vb.height }; }
        function toView(sx,sy){ return { x: r.x+((sx-vb.x)/vb.width)*r.width, y: r.y+((sy-vb.y)/vb.height)*r.height }; }
        var cs={ x: 30+(d.w/2+1)*57.5, y: 230-(d.h/2+2)*(200/14) };
        var hs=toSvg(hr.x+hr.width/2, hr.y+hr.height/2);
        var ox=hs.x-cs.x, oy=hs.y-cs.y;
        var tSvg={ x: cs.x-oy, y: cs.y+ox }; // 顺时针 90°：(x,y) -> (-y,x)
        return { center: toView(cs.x,cs.y), handle: { x: hr.x+hr.width/2, y: hr.y+hr.height/2 },
          target: toView(tSvg.x,tSvg.y), rect: { w:d.w, h:d.h, angle:d.angle, area:d.area } };
      })()`);
      note('geometry: ' + JSON.stringify(geo));
      const before = await labState();
      note('before: rect=' + before.rect + ' angle=' + before.rectAngle);
      if (geo) await drag(geo.handle.x, geo.handle.y, geo.target.x, geo.target.y, 16, 30);
      await sleep(400);
      const after = await labState();
      const inspAngle = await evaljs(`(function(){var r=document.querySelector('#worldBenchInspector input[data-insp="1"]');return r?r.value:'';})()`);
      note('after drag: rect=' + after.rect + ' angle=' + after.rectAngle + ' inspector angle slider=' + inspAngle);
      // 拖完再点一下手柄：90° 互换还在（宽↔长，角度不动——互换本身就是 90° 旋转，
      // 长轴 148°→58°；“互换 + 角度+90”是转两次，1×9 会变成竖细条，见 rect-click-geo）。
      const [h2] = await centers('[data-bench-rotate]');
      if (h2) { await clickAt(h2.cx, h2.cy); await sleep(300); }
      const afterClick = await labState();
      note('after handle click: rect=' + afterClick.rect + ' angle=' + afterClick.rectAngle + ' (angle stays ' + after.rectAngle + ')');
      report.pass = geo !== null && before.rectAngle === 0 &&
        after.rectAngle !== null && after.rectAngle >= 70 && after.rectAngle <= 110 &&
        after.rect === '1x9 (perim 20)' &&
        inspAngle !== '' && Math.abs(parseInt(inspAngle, 10) - after.rectAngle) <= 1 &&
        afterClick.rect === '9x1 (perim 20)' &&
        afterClick.rectAngle === after.rectAngle;
      note(report.pass ? 'RESULT: PASS — handle drag rotates ~90°, dims/area unchanged, click-swap still works and keeps the angle'
        : 'RESULT: FAIL — rotate drag broken (see notes above)');
    } else if (scenario === 'zoom-drop') {
      // Phase 3 batch 3：放大到约 195% 再平移，让右盘回到视野里，然后
      // 从零件盒拖 1/6 到右盘——落点要按当前 viewBox 换算，固定 520×260
      // 的老算法在这个倍率下会打偏。同时验 benchSvgPoint 本身：画布视口
      // 中心对应的 SVG 点就是 viewBox 中心。
      await enterLab();
      await evaljs(`(function(){var b=document.querySelector('[data-bench="balance"]');if(b)b.click();})()`);
      await sleep(300);
      for (let i = 0; i < 3; i++) {
        await evaljs(`(function(){var b=document.querySelector('[data-bench="zoom-in"]');if(b)b.click();})()`);
        await sleep(200);
      }
      const zoom1 = await labState();
      note('after 3x zoom-in: label=' + zoom1.zoomLabel + ' viewBox=' + zoom1.viewBox);
      const pt = await evaljs(`(function(){
        var svg=document.getElementById('worldBenchView');
        var r=svg.getBoundingClientRect();
        var p=benchSvgPoint(r.x+r.width/2, r.y+r.height/2);
        var vb=svg.viewBox.baseVal;
        return { p: p, center: { x: vb.x+vb.width/2, y: vb.y+vb.height/2 } };
      })()`);
      note('benchSvgPoint at viewport centre: ' + JSON.stringify(pt));
      const ptOk = pt && pt.p && Math.abs(pt.p.x - pt.center.x) < 2 && Math.abs(pt.p.y - pt.center.y) < 2;
      // 平移：把右盘（SVG 430,190）拖进视野中心附近。从 SVG (340,180)
      // 拖到 (200,130)：指针左移 140、上移 50，中心就向右/下移 140/50
      // （260,130 → 400,180，再夹到 387,180）。
      // 先把画布滚进视野再量坐标：不滚的话画布在折叠线下，量出来的视口
      // 坐标会落在视口外面（y=1946），按下去根本不是画布。
      await centers('#worldBenchView');
      const panGeo = await evaljs(`(function(){
        var svg=document.getElementById('worldBenchView');
        var r=svg.getBoundingClientRect(); var vb=svg.viewBox.baseVal;
        function toView(sx,sy){ return { x: r.x+((sx-vb.x)/vb.width)*r.width, y: r.y+((sy-vb.y)/vb.height)*r.height }; }
        return { from: toView(340,180), to: toView(200,130) };
      })()`);
      note('pan drag: ' + JSON.stringify(panGeo));
      await drag(panGeo.from.x, panGeo.from.y, panGeo.to.x, panGeo.to.y, 12, 40);
      await sleep(300);
      const afterPan = await labState();
      note('after pan: label=' + afterPan.zoomLabel + ' viewBox=' + afterPan.viewBox);
      // 右盘中心（SVG 430,190）按当前 viewBox 换算到视口，再拖 1/6 过去。
      // 先把芯片和画布一起量（一次滚动，坐标不打架）。
      const vbNow = await evaljs(`(function(){var svg=document.getElementById('worldBenchView');var vb=svg.viewBox.baseVal;return {x:vb.x,y:vb.y,w:vb.width,h:vb.height};})()`);
      const [chip, view] = await centers(
        '#worldBenchBox [data-bench="make"][data-kind="frac"][data-n="1"][data-d="6"]', '#worldBenchView');
      const tx = view.x + ((430 - vbNow.x) / vbNow.w) * view.w;
      const ty = view.y + ((190 - vbNow.y) / vbNow.h) * view.h;
      note('right pan target: ' + Math.round(tx) + ',' + Math.round(ty) + ' view=' + JSON.stringify(view));
      const before = await labState();
      await drag(chip.cx, chip.cy, tx, ty, 12, 40);
      await sleep(300);
      const after = await labState();
      note('before: bal R=' + before.balR + ' bench=' + before.benchTotal + ' | after: bal R=' + after.balR + ' bench=' + after.benchTotal);
      report.pass = zoom1.zoomLabel === '195%' && ptOk &&
        afterPan.viewBox !== null && after.balR !== before.balR;
      note(report.pass ? 'RESULT: PASS — zoom-aware drop lands on the right pan at 195% after panning'
        : 'RESULT: FAIL — zoomed drop missed (see notes above)');
    } else if (scenario === 'zoom-pan') {
      // Phase 3 batch 3：放大后拖画布空白处平移；拖得再远也不能滑出画布；
      // 倍率和中心刷新后还在；复位回 100%；100% 时拖不动。
      await enterLab();
      await evaljs(`(function(){var b=document.querySelector('[data-bench="zoom-in"]');if(b)b.click();})()`);
      await sleep(200);
      await evaljs(`(function(){var b=document.querySelector('[data-bench="zoom-in"]');if(b)b.click();})()`);
      await sleep(300);
      const z1 = await labState();
      note('after 2x zoom-in: label=' + z1.zoomLabel + ' viewBox=' + z1.viewBox);
      // 平移一小段：从 SVG (100,60) 拖到 (150,60)，中心 260 → 210（1:1 时）。
      // 先把画布滚进视野再量坐标（不滚量出来的起点在视口外，按下去不是画布）。
      await centers('#worldBenchView');
      const pan1 = await evaljs(`(function(){
        var svg=document.getElementById('worldBenchView');
        var r=svg.getBoundingClientRect(); var vb=svg.viewBox.baseVal;
        function toView(sx,sy){ return { x: r.x+((sx-vb.x)/vb.width)*r.width, y: r.y+((sy-vb.y)/vb.height)*r.height }; }
        return { from: toView(100,60), to: toView(150,60) };
      })()`);
      await drag(pan1.from.x, pan1.from.y, pan1.to.x, pan1.to.y, 10, 40);
      await sleep(300);
      const z2 = await labState();
      note('after small pan: label=' + z2.zoomLabel + ' viewBox=' + z2.viewBox);
      // 刷新：倍率和中心要带回来
      await send('Page.reload', { ignoreCache: true });
      await sleep(2500);
      await enterLab();
      await sleep(300);
      const z3 = await labState();
      note('after refresh: label=' + z3.zoomLabel + ' viewBox=' + z3.viewBox);
      // 往右猛拖 300：中心夹到右缘，viewBox 不能滑出画布（x>=0，右缘<=520）
      await centers('#worldBenchView');
      const pan2 = await evaljs(`(function(){
        var svg=document.getElementById('worldBenchView');
        var r=svg.getBoundingClientRect(); var vb=svg.viewBox.baseVal;
        function toView(sx,sy){ return { x: r.x+((sx-vb.x)/vb.width)*r.width, y: r.y+((sy-vb.y)/vb.height)*r.height }; }
        return { from: toView(100,60), to: toView(400,60) };
      })()`);
      await drag(pan2.from.x, pan2.from.y, pan2.to.x, pan2.to.y, 10, 30);
      await sleep(300);
      const z4 = await labState();
      note('after big pan: label=' + z4.zoomLabel + ' viewBox=' + z4.viewBox);
      const vb4 = z4.viewBox ? z4.viewBox.split(' ').map(Number) : null;
      // 复位回 100%，再拖一次：100% 时中心锁死，拖了也白拖
      await evaljs(`(function(){var b=document.querySelector('[data-bench="zoom-reset"]');if(b)b.click();})()`);
      await sleep(300);
      const z5 = await labState();
      note('after reset: label=' + z5.zoomLabel + ' viewBox=' + z5.viewBox);
      await centers('#worldBenchView');
      const pan3 = await evaljs(`(function(){
        var svg=document.getElementById('worldBenchView');
        var r=svg.getBoundingClientRect(); var vb=svg.viewBox.baseVal;
        function toView(sx,sy){ return { x: r.x+((sx-vb.x)/vb.width)*r.width, y: r.y+((sy-vb.y)/vb.height)*r.height }; }
        return { from: toView(100,60), to: toView(200,60) };
      })()`);
      await drag(pan3.from.x, pan3.from.y, pan3.to.x, pan3.to.y, 10, 40);
      await sleep(300);
      const z6 = await labState();
      note('after pan at 100%: label=' + z6.zoomLabel + ' viewBox=' + z6.viewBox);
      report.pass = z1.zoomLabel === '156%' && z1.viewBox === '94 47 333 166' &&
        z2.viewBox === '44 47 333 166' && // 1:1：拖 50 个单位，中心 260 → 210
        z3.zoomLabel === '156%' && z3.viewBox === z2.viewBox &&
        vb4 !== null && vb4[0] >= 0 && vb4[0] + vb4[2] <= 520 &&
        z5.zoomLabel === '100%' && z5.viewBox === '0 0 520 260' &&
        z6.viewBox === '0 0 520 260';
      note(report.pass ? 'RESULT: PASS — pan moves the view, clamps at the edge, persists across refresh, reset + 100% lock work'
        : 'RESULT: FAIL — zoom/pan broken (see notes above)');
    } else if (scenario === 'quirk1-view') {
      // 复测 8e38f4c 毛病①：台面上有散数时加十格阵，提示说“切到十格阵”，
      // 画布就要真切过去（旧代码把 benchPreferredView 置 null，自动链把散数
      // 排在前面，画布停在数轴上）。再拿下十格阵，画布回到自动链（数轴）。
      await enterLab();
      await evaljs(`(function(){var b=document.querySelector('#worldBenchBox [data-bench="make"][data-kind="num"][data-n="5"]');if(b)b.click();})()`);
      await sleep(200);
      await evaljs(`(function(){var b=document.querySelector('#worldBenchBox [data-bench="make"][data-kind="num"][data-n="3"]');if(b)b.click();})()`);
      await sleep(300);
      const before = await labState();
      note('before ten-frame: bench=' + before.benchTotal + ' view=' + before.benchView);
      await evaljs(`(function(){var b=document.querySelector('[data-bench="tenframe"]');if(b)b.click();})()`);
      await sleep(400);
      const afterOn = await labState();
      const canvasOn = await evaljs(`(function(){var v=document.getElementById('worldBenchView');return v?v.innerHTML.indexOf('pick-tenframe')>=0:false;})()`);
      note('after ten-frame on: view=' + afterOn.benchView + ' canvas draws ten-frame=' + canvasOn);
      await evaljs(`(function(){var b=document.querySelector('[data-bench="tenframe"]');if(b)b.click();})()`);
      await sleep(400);
      const afterOff = await labState();
      note('after ten-frame off: view=' + afterOff.benchView);
      report.pass = before.benchTotal === '8' && before.benchView.indexOf('现在是：数轴') >= 0 &&
        afterOn.benchView.indexOf('现在是：十格阵') >= 0 && canvasOn === true &&
        afterOff.benchView.indexOf('现在是：数轴') >= 0;
      note(report.pass ? 'RESULT: PASS — canvas really switches to ten-frame with numbers on the bench, back to auto when off'
        : 'RESULT: FAIL — canvas did not switch (see notes above)');
    } else if (scenario === 'p2-beam') {
      // Phase 3 batch 3：P2 演示梁也走 labBeamAnim。点“只左边 −5”，
      // 梁要在约 500ms 里从 0° 平滑转到 −12°（中间帧有 −2° 到 −10° 之间的角度），
      // 不能一下跳到 −12°。
      await evaljs(`(function(){ if (typeof navGo === 'function') navGo('demo-balance'); })()`);
      await sleep(500);
      const beam0 = await evaljs(`(function(){
        var b=document.getElementById('beamGroup');
        if(!b) return null;
        b.scrollIntoView({block:'center',behavior:'instant'});
        var cs=getComputedStyle(b).transform;
        return { transform: cs, style: b.style.transform };
      })()`);
      await sleep(300);
      note('beam before: ' + JSON.stringify(beam0));
      const [wrongBtn] = await centers('#balWrong');
      if (wrongBtn) await clickAt(wrongBtn.cx, wrongBtn.cy);
      const samples = [];
      for (let i = 0; i < 10; i++) {
        await sleep(60);
        const a = await evaljs(`(function(){
          var b=document.getElementById('beamGroup');
          if(!b) return null;
          var m=getComputedStyle(b).transform;
          if(!m || m==='none') return 0;
          var mm=m.match(/matrix\\(([^)]+)\\)/);
          if(!mm) return null;
          var v=mm[1].split(',').map(Number);
          return Math.atan2(v[1], v[0])*180/Math.PI;
        })()`);
        samples.push(a === null || a === undefined ? null : Math.round(a * 10) / 10);
      }
      note('beam angle samples (~60ms apart): ' + JSON.stringify(samples));
      const mid = samples.filter(function (a) { return a !== null && a < -1 && a > -11; });
      const fin = samples[samples.length - 1];
      report.pass = beam0 !== null && mid.length >= 1 && fin !== null && fin <= -11 && fin >= -13;
      note(report.pass ? 'RESULT: PASS — P2 beam animates smoothly 0° → −12° (intermediate frames seen)'
        : 'RESULT: FAIL — P2 beam snapped or did not reach −12°');
    } else if (scenario === 'bench-820') {
      // 顺带修：~820px 下台面/器材架的堆叠（云端浏览器改不了视口）。
      // 820px 时 .world-bench-body 只有一列（≤1024px 媒体查询）：右边的
      // 零件盒（#worldBenchBox，在 .world-bench-side 里）叠到画布列下面，
      // 不横向溢出。注意别量 #worldBenchShelf——那是画布列里的一条虚线
      // 放置条，本来就在 svg 上面，不是零件盒。
      await send('Emulation.setDeviceMetricsOverride', { width: 820, height: 1000, deviceScaleFactor: 1, mobile: false });
      await sleep(300);
      await send('Page.reload', { ignoreCache: true });
      await sleep(2500);
      await enterLab();
      await sleep(400);
      const m = await evaljs(`(function(){
        var c=document.getElementById('worldBenchView');
        var s=document.getElementById('worldBenchBox');
        if(!c||!s) return null;
        var cr=c.getBoundingClientRect(), sr=s.getBoundingClientRect();
        return { innerW: window.innerWidth, scrollW: document.documentElement.scrollWidth,
          canvas: { top: Math.round(cr.top), bottom: Math.round(cr.bottom), left: Math.round(cr.left), right: Math.round(cr.right) },
          box: { top: Math.round(sr.top), bottom: Math.round(sr.bottom), left: Math.round(sr.left), right: Math.round(sr.right) } };
      })()`);
      note('820px layout: ' + JSON.stringify(m));
      report.pass = m !== null && m.scrollW <= 821 &&
        m.box.top >= m.canvas.bottom - 2 && m.box.left >= 0 && m.box.right <= 820 &&
        m.box.bottom > m.box.top;
      note(report.pass ? 'RESULT: PASS — at 820px the parts box stacks below the canvas, no horizontal overflow'
        : 'RESULT: FAIL — parts box does not stack or the page overflows at 820px');
    } else if (scenario === 'weight-drag') {
      // 批 3 复测主缺陷：量组（砝码图标）的 1/6 拖不到台面天平盘上，
      // 而分数 1/6 芯片一次就落。待查根因：砝码走 apparatus.js 的
      // hitAt（只认站天平 #worldBalSvg 和 HTML 落点框），台面画布盘
      // 是 SVG 矩形、没有 data-bal-pan，落点判定认不出来。
      await enterLab();
      // 天平上台面 + 切到天平视图
      await evaljs(`(function(){var b=document.querySelector('[data-bench="balance"]');if(b)b.click();})()`);
      await sleep(300);
      // 站里清空重来：左 1/2、右 0——从已知状态开始算增量。
      await evaljs(`(function(){var b=document.querySelector('[data-world="bal-clear"]');if(b)b.click();})()`);
      await sleep(300);
      const before = await labState();
      note('before: bal L=' + before.balL + ' R=' + before.balR);
      await installProbe();
      const [wt6, view] = await centers('#worldBenchBox [data-drag-weight="1/6"]', '#worldBenchView');
      // 台面 viewBox 520x260，右盘 x 380–480、y 148–232 → 中心 (430,190)
      const pxR = view.x + (430 / 520) * view.w;
      const py = view.y + (190 / 260) * view.h;
      note('weight 1/6 center: ' + JSON.stringify(wt6) + '  bench view: ' + JSON.stringify(view) + '  panR target: ' + Math.round(pxR) + ',' + Math.round(py));
      await clearProbe();
      await drag(wt6.cx, wt6.cy, pxR, py, 12, 40);
      await sleep(300);
      const mid = await labState();
      note('after 1/6 to R: bal L=' + mid.balL + ' R=' + mid.balR + ' bench=' + mid.benchTotal);
      note('probe events:\n' + (await probeLog()));
      // 再拖一个量砝码 1/2 到左盘（中心 (110,190)），两盘都覆盖。
      const [wt2] = await centers('#worldBenchBox [data-drag-weight="1/2"]');
      const pxL = view.x + (110 / 520) * view.w;
      note('weight 1/2 center: ' + JSON.stringify(wt2) + '  panL target: ' + Math.round(pxL) + ',' + Math.round(py));
      await drag(wt2.cx, wt2.cy, pxL, py, 12, 40);
      await sleep(300);
      const after = await labState();
      note('after 1/2 to L: bal L=' + after.balL + ' R=' + after.balR + ' bench=' + after.benchTotal);
      const q = (s) => { if (s == null) return NaN; if (String(s).indexOf('/') >= 0) { const p = String(s).split('/'); return (+p[0]) / (+p[1]); } return +s; };
      const dR = q(mid.balR) - q(before.balR);
      const dL = q(after.balL) - q(mid.balL);
      note('delta R=' + dR + ' (expect 1/6)  delta L=' + dL + ' (expect 1/2)');
      // 195% 下再拖一个量砝码 1/4 到右盘（复测里 195% 下小缝和移后都不行）。
      // 先放大再平移（和 zoom-drop 同一路：把右盘拖进视野），再按当前 viewBox 换算落点。
      for (let i = 0; i < 3; i++) {
        await evaljs(`(function(){var b=document.querySelector('[data-bench="zoom-in"]');if(b)b.click();})()`);
        await sleep(200);
      }
      const zoomed = await labState();
      note('after 3x zoom-in: label=' + zoomed.zoomLabel + ' viewBox=' + zoomed.viewBox);
      await centers('#worldBenchView');
      const panGeo = await evaljs(`(function(){
        var svg=document.getElementById('worldBenchView');
        var r=svg.getBoundingClientRect(); var vb=svg.viewBox.baseVal;
        function toView(sx,sy){ return { x: r.x+((sx-vb.x)/vb.width)*r.width, y: r.y+((sy-vb.y)/vb.height)*r.height }; }
        return { from: toView(340,180), to: toView(200,130) };
      })()`);
      await drag(panGeo.from.x, panGeo.from.y, panGeo.to.x, panGeo.to.y, 12, 40);
      await sleep(300);
      const vbNow = await evaljs(`(function(){var svg=document.getElementById('worldBenchView');var vb=svg.viewBox.baseVal;return {x:vb.x,y:vb.y,w:vb.width,h:vb.height};})()`);
      const [wt4, view2] = await centers('#worldBenchBox [data-drag-weight="1/4"]', '#worldBenchView');
      const tx = view2.x + ((430 - vbNow.x) / vbNow.w) * view2.w;
      const ty = view2.y + ((190 - vbNow.y) / vbNow.h) * view2.h;
      note('zoomed weight 1/4 center: ' + JSON.stringify(wt4) + '  panR target: ' + Math.round(tx) + ',' + Math.round(ty) + ' viewBox=' + JSON.stringify(vbNow));
      const beforeZoom = await labState();
      await drag(wt4.cx, wt4.cy, tx, ty, 12, 40);
      await sleep(300);
      const afterZoom = await labState();
      note('after 1/4 to R at 195%: bal R=' + afterZoom.balR + ' (was ' + beforeZoom.balR + ')');
      const dRz = q(afterZoom.balR) - q(beforeZoom.balR);
      note('delta R at 195%=' + dRz + ' (expect 1/4)');
      report.pass = Math.abs(dR - 1 / 6) < 1e-9 && Math.abs(dL - 1 / 2) < 1e-9 &&
        zoomed.zoomLabel === '195%' && Math.abs(dRz - 1 / 4) < 1e-9;
      note(report.pass ? 'RESULT: PASS — both weights landed on the bench pans' : 'RESULT: FAIL — weight(s) did not land on the pan(s)');
    } else if (scenario === 'rect-click-geo') {
      // 点按“转 90°”是宽↔长互换（角度不动，互换本身就是 90° 旋转）：1×9 点按后
      // 画出来的长方形应该是横着的（宽 > 高）。如果是竖着的（高 > 宽），说明
      // 点按给角度加了 90°、把形状转了两次，是错的（2026-11-07 实测：竖细条 35×1272）。
      await enterLab();
      await evaljs(`(function(){var b=document.querySelector('[data-bench="rect"]');if(b)b.click();})()`);
      await sleep(300);
      const before = await evaljs(`(function(){
        var r=document.querySelector('#worldBenchView [data-bench="pick-rect"] rect');
        if(!r) return null;
        var b=r.getBoundingClientRect();
        return { w: Math.round(b.width), h: Math.round(b.height) };
      })()`);
      note('1x9 @0deg rect bbox: ' + JSON.stringify(before));
      const [h] = await centers('[data-bench-rotate]');
      if (h) { await clickAt(h.cx, h.cy); await sleep(300); }
      const after = await evaljs(`(function(){
        var r=document.querySelector('#worldBenchView [data-bench="pick-rect"] rect');
        if(!r) return null;
        var b=r.getBoundingClientRect();
        var rc=(typeof labWorld!=='undefined'&&labWorld&&labWorld.rect)?labWorld.rect:null;
        return { w: Math.round(b.width), h: Math.round(b.height), angle: rc?rc.angle:null, dims: rc?rc.w+'x'+(rc.perim/2-rc.w):null };
      })()`);
      note('after handle click rect bbox: ' + JSON.stringify(after));
      report.pass = after && after.w > after.h;
      note(report.pass ? 'RESULT: PASS — clicked rect lies horizontal (wide bar)' : 'RESULT: FAIL — clicked rect stands vertical (tall sliver): the click double-rotated it');
    } else if (scenario === 'abs-toggle') {
      // Phase 3 batch 4：具象↔抽象一键切换。台面上有散数 5+3、天平（左 1/2、
      // 右 0）、长方形 1×9：点“看算式”→画布变成一行行算式，数值和检查器
      // 不变；点“看图形”→回到原来的坐标系画布，长方形还在。
      await enterLab();
      await evaljs(`(function(){var b=document.querySelector('[data-bench="clear"]');if(b)b.click();})()`);
      await sleep(200);
      await evaljs(`(function(){var b=document.querySelector('[data-world="bal-clear"]');if(b)b.click();})()`);
      await sleep(200);
      await evaljs(`(function(){var b=document.querySelector('#worldBenchBox [data-bench="make"][data-kind="num"][data-n="5"]');if(b)b.click();})()`);
      await sleep(200);
      await evaljs(`(function(){var b=document.querySelector('#worldBenchBox [data-bench="make"][data-kind="num"][data-n="3"]');if(b)b.click();})()`);
      await sleep(200);
      await evaljs(`(function(){var b=document.querySelector('[data-bench="balance"]');if(b)b.click();})()`);
      await sleep(300);
      await evaljs(`(function(){var b=document.querySelector('[data-bench="rect"]');if(b)b.click();})()`);
      await sleep(400);
      const before = await labState();
      note('before toggle: bench=' + before.benchTotal + ' bal L=' + before.balL + ' R=' + before.balR + ' rect=' + before.rect + ' angle=' + before.rectAngle + ' view=' + before.benchView);
      // 长方形尺寸从状态里读（之前场景可能改过宽），算式行按它拼。
      const rectEq = await evaljs(`(function(){
        var d=MathWorld.derived(labWorld).rect;
        return '长方形：' + d.w + ' × ' + d.h + ' ＝ ' + d.area + '（周长 ' + d.perim + '）';
      })()`);
      note('expected rect line: ' + rectEq);
      await evaljs(`(function(){var b=document.querySelector('[data-bench="abs-toggle"]');if(b)b.click();})()`);
      await sleep(400);
      const svgAbs = await evaljs(`(function(){
        var v=document.getElementById('worldBenchView');
        var t=document.querySelector('[data-bench="abs-toggle"]');
        return { text: v?v.textContent:'', label: t?t.textContent:'' };
      })()`);
      note('abstract svg text: ' + JSON.stringify(svgAbs.text));
      const afterAbs = await labState();
      note('in abstract: bench=' + afterAbs.benchTotal + ' bal L=' + afterAbs.balL + ' R=' + afterAbs.balR + ' view=' + afterAbs.benchView);
      const absOk = svgAbs.text.indexOf('5 + 3 = 8') >= 0 &&
        svgAbs.text.indexOf('天平：左盘 1/2 ＞ 右盘 0') >= 0 &&
        svgAbs.text.indexOf(rectEq) >= 0 &&
        svgAbs.label === '看图形' &&
        afterAbs.benchView.indexOf('现在是：算式') >= 0 &&
        afterAbs.benchTotal === '8' && afterAbs.balL === '1/2' && afterAbs.balR === '0';
      // 切回具象：算式行消失，长方形金色块回来，视图回到坐标系。
      await evaljs(`(function(){var b=document.querySelector('[data-bench="abs-toggle"]');if(b)b.click();})()`);
      await sleep(400);
      const svgBack = await evaljs(`(function(){
        var v=document.getElementById('worldBenchView');
        var t=document.querySelector('[data-bench="abs-toggle"]');
        return { html: v?v.innerHTML:'', label: t?t.textContent:'' };
      })()`);
      const afterBack = await labState();
      note('back to concrete: view=' + afterBack.benchView + ' rect drawn=' + (svgBack.html.indexOf('#fde68a') >= 0));
      report.pass = before.benchTotal === '8' && before.balL === '1/2' && before.balR === '0' &&
        absOk &&
        svgBack.html.indexOf('天平：左盘') < 0 && svgBack.html.indexOf('#fde68a') >= 0 &&
        svgBack.label === '看算式' && afterBack.benchView.indexOf('现在是：坐标系') >= 0;
      note(report.pass ? 'RESULT: PASS — abstract shows the equations, concrete restores the drawing, nothing changes value'
        : 'RESULT: FAIL — toggle broken (see notes above)');
    } else if (scenario === 'tidy-fit') {
      // Phase 3 batch 4：复测 d9b93ef 观察（b）——1×9 长方形转到大角度后，
      // 顶点圆点和手柄跑出可视画布。先真拖手柄转 ~58° 再点手柄换成 9×1，
      // 验手柄确实在画布外面；再点“一键整理”，手柄要回到视野里，倍率
      // 缩到 100% 以下，长方形本身（9×1@~58°）一点没变。
      await enterLab();
      await evaljs(`(function(){var b=document.querySelector('[data-bench="clear"]');if(b)b.click();})()`);
      await sleep(200);
      // 先把长方形归零：宽 1（→1×9）、角度 0，再真拖手柄转 58°。
      await evaljs(`(function(){
        if (typeof worldPlayApply === 'function') {
          worldPlayApply({type:'rectSet', w:1});
          worldPlayApply({type:'rectRotate', deg:0});
        }
      })()`);
      await sleep(200);
      await evaljs(`(function(){var b=document.querySelector('[data-bench="rect"]');if(b)b.click();})()`);
      await sleep(300);
      await evaljs(`(function(){ if (typeof worldInspectSelect === 'function') worldInspectSelect({apparatus:'rect'}); })()`);
      await sleep(300);
      // 先把手柄滚进视野再量几何：不滚的话手柄在折叠线下（视口 y=1568），
      // 拖拽事件落在视口外面，根本拖不动（第一次跑 angle=0 就是这个原因）。
      await centers('[data-bench-rotate]');
      const geo = await evaljs(`(function(){
        var svg=document.getElementById('worldBenchView');
        if(!svg) return null;
        var r=svg.getBoundingClientRect();
        var vb=svg.viewBox.baseVal;
        var d=MathWorld.derived(labWorld).rect;
        var h=document.querySelector('[data-bench-rotate]');
        if(!h) return null;
        var hr=h.getBoundingClientRect();
        function toSvg(vx,vy){ return { x: vb.x+((vx-r.x)/r.width)*vb.width, y: vb.y+((vy-r.y)/r.height)*vb.height }; }
        function toView(sx,sy){ return { x: r.x+((sx-vb.x)/vb.width)*r.width, y: r.y+((sy-vb.y)/vb.height)*r.height }; }
        var cs={ x: 30+(d.w/2+1)*57.5, y: 230-(d.h/2+2)*(200/14) };
        var hs=toSvg(hr.x+hr.width/2, hr.y+hr.height/2);
        var ox=hs.x-cs.x, oy=hs.y-cs.y;
        var c=Math.cos(58*Math.PI/180), s=Math.sin(58*Math.PI/180);
        var tSvg={ x: cs.x+ox*c-oy*s, y: cs.y+ox*s+oy*c }; // 顺时针转 58°
        return { center: toView(cs.x,cs.y), handle: { x: hr.x+hr.width/2, y: hr.y+hr.height/2 },
          target: toView(tSvg.x,tSvg.y), rect: { w:d.w, h:d.h, angle:d.angle } };
      })()`);
      note('geometry: ' + JSON.stringify(geo));
      if (geo) await drag(geo.handle.x, geo.handle.y, geo.target.x, geo.target.y, 16, 30);
      await sleep(400);
      const afterDrag = await labState();
      note('after drag: rect=' + afterDrag.rect + ' angle=' + afterDrag.rectAngle);
      // 点手柄换成 9×1（角度不动），这就是复测里那个跑出画布的条。
      const [h2] = await centers('[data-bench-rotate]');
      if (h2) { await clickAt(h2.cx, h2.cy); await sleep(300); }
      const afterClick = await labState();
      note('after handle click: rect=' + afterClick.rect + ' angle=' + afterClick.rectAngle);
      // 手柄现在是不是在可视画布外面（复现观察（b））？
      const offCanvas = await evaljs(`(function(){
        var svg=document.getElementById('worldBenchView');
        var h=document.querySelector('[data-bench-rotate]');
        var d=document.querySelector('#worldBenchView [data-bench="pick-rect"] circle');
        if(!svg||!h||!d) return null;
        var sr=svg.getBoundingClientRect(), hr=h.getBoundingClientRect(), dr=d.getBoundingClientRect();
        function outside(r){ return r.x+r.width/2<sr.x||r.x+r.width/2>sr.x+sr.width||r.y+r.height/2<sr.y||r.y+r.height/2>sr.y+sr.height; }
        return { handleOutside: outside(hr), dotOutside: outside(dr) };
      })()`);
      note('off-canvas before tidy: ' + JSON.stringify(offCanvas));
      // 一键整理
      await evaljs(`(function(){var b=document.querySelector('[data-bench="tidy"]');if(b)b.click();})()`);
      await sleep(400);
      const afterTidy = await labState();
      const inView = await evaljs(`(function(){
        var svg=document.getElementById('worldBenchView');
        var h=document.querySelector('[data-bench-rotate]');
        var d=document.querySelector('#worldBenchView [data-bench="pick-rect"] circle');
        if(!svg||!h||!d) return null;
        var sr=svg.getBoundingClientRect(), hr=h.getBoundingClientRect(), dr=d.getBoundingClientRect();
        function inside(r){ var cx=r.x+r.width/2, cy=r.y+r.height/2; return cx>=sr.x&&cx<=sr.x+sr.width&&cy>=sr.y&&cy<=sr.y+sr.height; }
        return { handleInside: inside(hr), dotInside: inside(dr) };
      })()`);
      note('after tidy: label=' + afterTidy.zoomLabel + ' viewBox=' + afterTidy.viewBox + ' rect=' + afterTidy.rect + ' angle=' + afterTidy.rectAngle + ' inView=' + JSON.stringify(inView));
      const zoomPct = parseInt((afterTidy.zoomLabel || '100%').replace('%',''), 10);
      report.pass = afterDrag.rectAngle !== null && afterDrag.rectAngle >= 40 && afterDrag.rectAngle <= 75 &&
        afterClick.rect === '9x1 (perim 20)' && afterClick.rectAngle === afterDrag.rectAngle &&
        offCanvas && (offCanvas.handleOutside || offCanvas.dotOutside) &&
        zoomPct < 100 && inView && inView.handleInside && inView.dotInside &&
        afterTidy.rect === '9x1 (perim 20)' && afterTidy.rectAngle === afterDrag.rectAngle;
      note(report.pass ? 'RESULT: PASS — handle/dot off-canvas at a big angle, tidy fits them back in view without touching the bar'
        : 'RESULT: FAIL — tidy did not fit the rotated bar (see notes above)');
    } else if (scenario === 'station-pan-drag') {
      // Phase 3 batch 4 观察（a）定性：站里盘上的砝码从来不支持拖动
      // （git 历史：data-drag-weight 从 c605db7 起只在砝码行上）。
      // 先拖 1/6 上左盘（这条路是通的），再按住盘上的砝码往右盘拖：
      // 应该没有拖拽 ghost，天平数值一点不动——这是站的既定交互。
      await enterLab();
      await evaljs(`document.getElementById('worldBalCard').classList.remove('collapsed')`);
      await sleep(200);
      await evaljs(`(function(){var b=document.querySelector('[data-world="bal-clear"]');if(b)b.click();})()`);
      await sleep(200);
      await installProbe();
      const [chip, dropL] = await centers('[data-drag-chip="weight"][data-qty="1/6"]', '#worldBalDropL');
      note('chip 1/6 center: ' + JSON.stringify(chip) + '  dropL center: ' + JSON.stringify(dropL));
      const before = await labState();
      note('before: bal L=' + before.balL + ' R=' + before.balR);
      await clearProbe();
      await drag(chip.cx, chip.cy, dropL.cx, dropL.cy, 12, 40);
      await sleep(300);
      const afterLand = await labState();
      note('after 1/6 lands: bal L=' + afterLand.balL + ' R=' + afterLand.balR);
      // 盘上现在有砝码（左盘 2/3）。按住盘上第一个砝码块往右盘拖。
      const [panW, dropR] = await centers('#worldBalSvg [data-bal-pan="L"] rect', '#worldBalDropR');
      note('pan weight center: ' + JSON.stringify(panW) + '  dropR center: ' + JSON.stringify(dropR));
      await clearProbe();
      await drag(panW.cx, panW.cy, dropR.cx, dropR.cy, 12, 40);
      const ghost = await evaljs(`(function(){var g=document.querySelector('.apparatus-ghost');return g?{display:g.style.display,text:g.textContent}:null;})()`);
      note('ghost during/after pan-weight drag: ' + JSON.stringify(ghost));
      const after = await labState();
      note('after pan-weight drag: bal L=' + after.balL + ' R=' + after.balR);
      note('probe events:\n' + (await probeLog()));
      report.pass = afterLand.balL === '2/3' && afterLand.balR === '0' &&
        after.balL === '2/3' && after.balR === '0' &&
        (!ghost || ghost.display === 'none');
      note(report.pass ? 'RESULT: PASS — shelf weight lands on the pan, but a weight already on the pan does not drag (no ghost, balance unchanged): by design'
        : 'RESULT: FAIL — pan weight moved or the shelf weight did not land (see notes above)');
    } else if (scenario === 'bal-label') {
      // 批 5 小修：天平标签的“＝”是写死的分隔符，不平衡时也写“＝”。
      // 随便压站（整数）+ 天平站（分数）+ 台面状态行都应按实际比较显示 ＞/＜/＝。
      // 复现：新 profile 默认左 5 右 3（左重），旧代码标签是“左 5 ＝ 右 3”。
      await enterLab();
      const eq0 = await evaljs(`(function(){var e=document.getElementById('labBalEq');return e?e.textContent:'';})()`);
      note('labBalEq initial: ' + eq0);
      await evaljs(`(function(){var b=document.getElementById('labBalAddR');if(b)b.click();})()`);
      await sleep(200);
      const eq1 = await evaljs(`(function(){var e=document.getElementById('labBalEq');return e?e.textContent:'';})()`);
      note('labBalEq after +1 right (5 vs 4): ' + eq1);
      await evaljs(`(function(){var b=document.getElementById('labBalAddR');if(b){b.click();b.click();}})()`);
      await sleep(200);
      const eq2 = await evaljs(`(function(){var e=document.getElementById('labBalEq');return e?e.textContent:'';})()`);
      note('labBalEq after +3 right (5 vs 6): ' + eq2);
      await evaljs(`(function(){var b=document.getElementById('labBalSubR');if(b)b.click();})()`);
      await sleep(200);
      const eq3 = await evaljs(`(function(){var e=document.getElementById('labBalEq');return e?e.textContent:'';})()`);
      note('labBalEq after -1 right (5 vs 5): ' + eq3);
      // 分数天平站：清空重来（左 1/2）+ 拖 1/6 上左盘 → 左 2/3 右 0，站内标签应为“左 2/3 ＞ 右 0”。
      await evaljs(`document.getElementById('worldBalCard').classList.remove('collapsed')`);
      await sleep(200);
      await evaljs(`(function(){var b=document.querySelector('[data-world="bal-clear"]');if(b)b.click();})()`);
      await sleep(200);
      const [chip, dropL] = await centers('[data-drag-chip="weight"][data-qty="1/6"]', '#worldBalDropL');
      await drag(chip.cx, chip.cy, dropL.cx, dropL.cy, 12, 40);
      await sleep(300);
      const st = await labState();
      const svgTexts = await evaljs(`(function(){return [...document.querySelectorAll('#worldBalSvg text')].map(function(t){return t.textContent;});})()`);
      const benchEq = await evaljs(`(function(){var e=document.getElementById('worldBalEq');return e?e.textContent:'';})()`);
      note('after drag: bal L=' + st.balL + ' R=' + st.balR + ' svgTexts=' + JSON.stringify(svgTexts) + ' benchEq=' + benchEq);
      const fracLabel = (svgTexts || []).find(function (t) { return t.indexOf('左 ') === 0; }) || '';
      note('station fraction label: ' + fracLabel);
      report.pass = eq0 === '左 5 ＞ 右 3' && eq1 === '左 5 ＞ 右 4' && eq2 === '左 5 ＜ 右 6' && eq3 === '左 5 ＝ 右 5' &&
        st.balL === '2/3' && fracLabel.indexOf('＞') >= 0 && benchEq.indexOf('＞') >= 0;
      note(report.pass ? 'RESULT: PASS — balance labels follow the real comparison (＞/＜/＝)' : 'RESULT: FAIL — a balance label still uses ＝ when unbalanced (see notes above)');
    } else if (scenario === 'parent-batch5') {
      // 批 5：家长端应有体检表 + 错因分布（6 标签）+ 孩子的发现 + 实验痕迹；
      // 挑战报告在家长端现在是空壳（“探究作业 · 探究作业”、日期 NaN-NaN-NaN、没字）。
      // 先往 localStorage 写两份挑战报告 + 一条发现 + 跨次统计，再进家长端读。
      await evaljs(`(function(){
        var now = Date.now();
        localStorage.setItem('math-inquiry-v1', JSON.stringify([
          { kind: 'lab-challenge-report', qids: ['q-balfrac'], pointIds: ['5.5'],
            lostSteps: [{ lab: 'q-balfrac', step: 'equal', label: '让天平两边相等' }],
            discovery: '天平两边一样重才会平', causes: ['步骤漏了', '算错了'], usedMs: 83000, at: now - 3600000 },
          { kind: 'lab-challenge-report', qids: ['q-fracadd'], pointIds: ['5.11'],
            lostSteps: [{ lab: 'q-fracadd', step: 'add', label: '先通分再相加' }],
            discovery: '', causes: ['步骤漏了'], usedMs: 45000, at: now - 86400000 },
          { kind: 'discovery', taskId: 'thirteen', text: '13 能拆成好多对', demo: 'thirteen', ts: now - 7200000 },
          { kind: 'teach', question: '23×14 怎么算', text: '先拆 10 和 4', ts: now - 172800000 }
        ]));
        localStorage.setItem('math-lab-proc-v1', JSON.stringify({
          'q-balfrac': { attempts: 3, lastScore: 2, max: 3, lost: { equal: 2 }, lastAt: now - 3600000, lastUsedMs: 83000, lastErr: [] },
          'q-fracadd': { attempts: 1, lastScore: 1, max: 2, lost: { add: 1 }, lastAt: now - 86400000, lastUsedMs: 45000, lastErr: [] }
        }));
        localStorage.setItem('math-review-v1', JSON.stringify({
          '5.5': { last: now - 3600000, correct: false, confident: false, streak: 0, due: now }
        }));
        localStorage.setItem('math-tried-demos-v1', JSON.stringify(['tenframe']));
      })()`);
      await evaljs(`(function(){ if (typeof navGo === 'function') navGo('parent'); })()`);
      await sleep(400);
      const html = await evaljs(`(function(){var c=document.getElementById('parentCard');return c?c.innerHTML:'';})()`);
      note('parentCard length: ' + (html ? html.length : 0));
      const checks = {
        health: html.indexOf('哪一步总丢分') >= 0,
        reportKind: html.indexOf('挑战报告') >= 0,
        discovery: html.indexOf('天平两边一样重才会平') >= 0 && html.indexOf('13 能拆成好多对') >= 0,
        noNaN: html.indexOf('NaN') < 0,
        causeDist: html.indexOf('步骤漏了 ×2') >= 0,
        trace: html.indexOf('实验痕迹') >= 0 && html.indexOf('考过 3 次') >= 0,
        teachStillThere: html.indexOf('小老师讲题') >= 0 && html.indexOf('23×14 怎么算') >= 0,
      };
      note('checks: ' + JSON.stringify(checks));
      report.pass = Object.keys(checks).every(function (k) { return checks[k]; });
      note(report.pass ? 'RESULT: PASS — parent shows health table + cause distribution + discoveries + trace, challenge reports render fully' : 'RESULT: FAIL — parent is missing batch-5 sections or a challenge report renders empty (see checks above)');
    } else if (scenario === 'report-dupes') {
      // 批 5 复测 abe77c77：交卷报告保存后“记下来”仍可点，预览→回到报告
      // 再点一次就存了两份完全相同的挑战报告，错因分布也翻倍。
      // 走真流程：进挑战 → 天平题 → 右盘放 1/6 → 交卷 → 答错了 → 提交报告
      // → 写发现、选两个错因 → 记下来 → 预览 → 回到报告 → 再记下来，
      // 数 math-inquiry-v1 里同发现的挑战报告有几份（应为 1 份），
      // 且第一次保存后“记下来”按钮应已禁用。
      const DISCOVERY = '只放 1/6 不够，右边还要再加 1/3 才能平。';
      const countReports = async () => evaljs(`(function(){
        var list = [];
        try { list = JSON.parse(localStorage.getItem('math-inquiry-v1') || '[]'); } catch (e) {}
        return list.filter(function (e) { return e.kind === 'lab-challenge-report' && e.discovery === ` + JSON.stringify(DISCOVERY) + `; }).length;
      })()`);
      const saveState = async () => evaljs(`(function(){
        var b = document.getElementById('labReportSave');
        var n = document.getElementById('labReportSaved');
        var s = document.getElementById('labReportSheet');
        return { disabled: b ? b.disabled : null, note: n ? n.textContent : '', sheetHidden: s ? s.hidden : null };
      })()`);
      await enterLab();
      await evaljs(`(function(){var b=document.getElementById('labModeChallenge');if(b)b.click();})()`);
      await sleep(300);
      await evaljs(`(function(){var b=document.getElementById('labQ-balfrac');if(b)b.click();})()`);
      await sleep(400);
      await evaljs(`document.getElementById('worldBalCard').classList.remove('collapsed')`);
      await sleep(200);
      const [chipS, dropR] = await centers('[data-drag-chip="weight"][data-qty="1/6"]', '#worldBalDropR');
      if (chipS && dropR) await drag(chipS.cx, chipS.cy, dropR.cx, dropR.cy, 12, 40);
      await evaljs(`(function(){var b=document.getElementById('labChallengeSubmit');if(b)b.click();})()`);
      await sleep(300);
      await evaljs(`(function(){var b=document.querySelector('[data-lab-mark="wrong"]');if(b)b.click();})()`);
      await sleep(200);
      await evaljs(`(function(){var b=document.getElementById('labChallengeFinish');if(b)b.click();})()`);
      await sleep(400);
      const sheetShown = await evaljs(`(function(){var s=document.getElementById('labReportSheet');return s?!s.hidden:null;})()`);
      note('report sheet shown after submit: ' + sheetShown);
      await evaljs(`(function(){var i=document.getElementById('labReportDiscovery');if(i)i.value=` + JSON.stringify(DISCOVERY) + `;})()`);
      await evaljs(`(function(){var b=document.querySelector('#labReportCauses .lab-cause[data-cause="概念没弄清"]');if(b)b.click();})()`);
      await evaljs(`(function(){var b=document.querySelector('#labReportCauses .lab-cause[data-cause="步骤漏了"]');if(b)b.click();})()`);
      await sleep(200);
      const pressed = await evaljs(`(function(){return [...document.querySelectorAll('#labReportCauses .lab-cause[aria-pressed="true"]')].map(function(b){return b.getAttribute('data-cause');});})()`);
      note('causes pressed: ' + JSON.stringify(pressed));
      await evaljs(`(function(){var b=document.getElementById('labReportSave');if(b)b.click();})()`);
      await sleep(300);
      const count1 = await countReports();
      const st1 = await saveState();
      note('after 1st save: count=' + count1 + ' ' + JSON.stringify(st1));
      await evaljs(`(function(){var b=document.getElementById('labReportPreview');if(b)b.click();})()`);
      await sleep(200);
      const backVisible = await evaljs(`(function(){var s=document.getElementById('labReportSheet');var b=document.getElementById('labReportBack');return { sheetHidden: s?s.hidden:null, backHidden: b?b.hidden:null };})()`);
      note('after preview: ' + JSON.stringify(backVisible));
      await evaljs(`(function(){var b=document.getElementById('labReportBack');if(b)b.click();})()`);
      await sleep(200);
      const sheetBack = await evaljs(`(function(){var s=document.getElementById('labReportSheet');return s?!s.hidden:null;})()`);
      note('sheet shown again after 回到报告: ' + sheetBack);
      await evaljs(`(function(){var b=document.getElementById('labReportSave');if(b)b.click();})()`);
      await sleep(300);
      const count2 = await countReports();
      const st2 = await saveState();
      note('after 2nd save attempt: count=' + count2 + ' ' + JSON.stringify(st2));
      report.pass = sheetShown === true && count1 === 1 && count2 === 1 && st1.disabled === true;
      note(report.pass ? 'RESULT: PASS — one report saved, save button disabled after save, preview+reopen cannot save a duplicate'
        : 'RESULT: FAIL — duplicate report saved (count ' + count1 + ' -> ' + count2 + ') or save button still enabled after save');
    } else {
      console.log('unknown scenario: ' + scenario);
      cleanup();
      process.exit(2);
    }
  } catch (err) {
    note('ERROR: ' + (err && err.stack ? err.stack : err));
    report.pass = false;
  }

  if (pageErrors.length) { console.log('  page exceptions:'); pageErrors.forEach((e) => console.log('    ' + e)); }
  if (consoleErrors.length) { console.log('  console errors:'); consoleErrors.forEach((e) => console.log('    ' + e)); }
  // 加载期异常 = 某段初始化没跑完（例如绑定 IIFE 抛错）：场景直接判失败，
  // 不管它自己的断言过没过——这是第 4 批拖放断的根因在真机上的表现，
  // 桩里因为 vm 上下文不抛严格模式未声明赋值所以查不出来。
  if (pageErrors.length && report.pass) {
    console.log('  NOTE: scenario assertions passed but page threw at load — marking FAIL');
    report.pass = false;
  }
  console.log('SCENARIO ' + scenario + ': ' + (report.pass ? 'PASS' : 'FAIL'));
  cleanup();
  process.exit(report.pass ? 0 : 1);
}

main();
