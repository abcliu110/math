// Exam-mode checks for the math lab (Phase 2: visible timer, clean bench,
// per-step scoring into review, collapsible score report, health table,
// report sheet with discovery + cause tags + quick preview + swipe close).
// These verify code and structure only — behavior can only be verified in a
// real browser, never by this file.
// Run: node tools/smoke-lab-exam.js
const fs = require('fs');
const path = require('path');

let pass = 0, fail = 0;
function check(name, ok) {
  if (ok) { pass++; console.log('  ok  ' + name); }
  else { fail++; console.log('FAIL  ' + name); }
}

const root = path.resolve(__dirname, '..');
function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
const html = read('apps/web/index.html');
const css = read('apps/web/styles.css');
const app = read('apps/web/app.js');

// 1) Visible timer in challenge mode (10 minutes, same design as 模拟测)
check('timer: challenge timer element exists in the lab mode row',
  html.includes('id="labExamTimer"') && html.includes('还剩 10:00'));
check('timer: labExamStart/labExamTick/labExamTimeout/labExamStop exist',
  ['labExamStart', 'labExamTick', 'labExamTimeout', 'labExamStop'].every(function (n) { return app.includes('function ' + n + '('); }));
check('timer: 10-minute countdown reuses EXAM_MS (模拟测 design)',
  app.includes('deadline: Date.now() + EXAM_MS') && app.includes('labExam = { startedAt: Date.now()'));
check('timer: setTimeout chain (no setInterval — smoke sandbox only has setTimeout)',
  app.includes('setTimeout(function () { labExamTick(seq); }, 1000)'));
check('timer: tick is guarded by challenge mode + seq',
  app.includes("labExam.seq !== seq || labMode !== 'challenge'"));
check('timer: entering challenge starts the clock, leaving stops it',
  app.includes("if (m === 'challenge') { if (!labExam) labExamStart();") && app.includes('else labExamStop();'));
check('timer: timeout auto-submits when questions were attempted',
  app.includes('labExamTimeout') && app.includes("if (labChallengeAttempts.length) {") && app.includes("labTrace('时间到了，自动交卷', false);"));
check('timer: submitting stops the clock (marking is not timed)',
  app.includes('labExamStop(); // 交卷停表'));

// 2) Clean bench in challenge mode (NB §6 #39/#40: no hints, no practice aids)
check('clean bench: why/discovery buttons + box hidden in challenge mode',
  css.includes('#lab.lab-challenge .lab-bench-foot') && css.includes('#lab.lab-challenge #labWhyBox') && css.includes('display:none'));
check('clean bench: procedure panel hides score + history until submit in exam mode',
  app.includes("if (rep.mode === 'exam' && !labChallengeSubmitted) {") && app.includes('考试进行中，做完点“交卷”，交卷后看每一步的得分。'));

// 3) Lost step goes into review (NB §6 #42: score detail names the lost step)
check('lost step: labFinishChallenge writes labLost into reviewStore',
  app.includes('st.labLost = lost; saveReview();') && app.includes('rep.lines.filter(function (l) { return !l.got; })'));
check('lost step: submit summary names the lost steps, not just the point',
  app.includes("const steps = rep && rep.lost && rep.lost.length ? '（' + rep.lost.join('、') + '）' : '';"));
check('lost step: wrong book + today review show “卡在：…”',
  app.includes('function labLostText(st)') && app.includes("return '卡在：'") && app.includes('labLostText(st)'));
check('lost step: cross-attempt history records used time (§6 #43 单次成绩详情)',
  app.includes('function procHistRecord(rep, usedMs)') && app.includes('e.lastUsedMs = usedMs || 0') && app.includes("用了 ' + fmtClock(e.lastUsedMs)"));

// 4) Score report collapse / press-and-hold hide (NB §6 #36/#37)
check('report: fold + peek buttons exist in the challenge box',
  html.includes('id="labReportFold"') && html.includes('id="labReportPeek"'));
check('report: fold toggles the report box hidden + button text',
  app.includes("box.hidden = !hidden;") && app.includes("fold.textContent = hidden ? '收起报告' : '展开报告';"));
check('report: peek hides the box while held (pointerdown/up/leave/cancel)',
  app.includes("box.classList.add('lab-report-peek')") && app.includes("peek.addEventListener('pointerdown', on)") && app.includes("peek.addEventListener('pointercancel', off)") && css.includes('#labChallengeReport.lab-report-peek'));
check('report: submitting unhides the box even if the student collapsed it',
  app.includes('// 交卷了，报告盒子要看得见：之前学生可能把它收起来了。') && app.includes("box.hidden = false;"));

// 5) Health table — “which step always loses points” (NB §6 #44)
check('health table: labHealthHtml aggregates proc history by point × step',
  app.includes('function labHealthHtml()') && app.includes('procHistLoad()') && app.includes('e.lastAt < now - WEEK'));
check('health table: wrong book opens with the table (top 3 steps + top 3 points)',
  app.includes('哪一步总丢分（最近 7 天）') && app.includes('topSteps = stepRows.slice(0, 3)') && app.includes('重灾区：'));

// 6) Report sheet (NB §6 #45/#46/#47)
check('report sheet: sheet + handle + discovery + causes + save + preview exist',
  ['labReportSheet', 'labReportHandle', 'labReportDiscovery', 'labReportCauses', 'labReportSave', 'labReportPreview', 'labReportBack'].every(function (id) { return html.includes('id="' + id + '"'); }));
check('report sheet: six cause tags',
  ['算错了', '概念没弄清', '步骤漏了', '看错题', '没思路', '粗心写错'].every(function (c) { return html.includes('data-cause="' + c + '"'); }));
check('report sheet: shown after submit with lost steps + used time in context',
  app.includes('function labReportShow(wrong)') && app.includes("labReportCtx = { wrong: wrong.slice(), pointIds: pointIds, lostSteps: lostSteps, usedMs: labExamUsedMs };"));
check('report sheet: save writes a lab-challenge-report into inquiry',
  app.includes("kind: 'lab-challenge-report'") && app.includes('saveInquiry(list);'));
check('report sheet: quick preview hides the sheet, “回到报告” brings it back',
  app.includes("preview.addEventListener('click', function () { sheet.hidden = true; back.hidden = false; });") && app.includes("back.addEventListener('click', function () { sheet.hidden = false; back.hidden = true; });"));
check('report sheet: drag the handle down 60px to close (keyboard Enter/Space too)',
  app.includes("if (dy > 60) { sheet.hidden = true; }") && app.includes("if (e.key === 'Enter' || e.key === ' ')"));

console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
