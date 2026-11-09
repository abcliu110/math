/* 作者层的数据部分（设计 v2 §3.3、§4.1–4.3）：
 *  - 台面分享：场景 + 用到的打包器材定义 → 一段 base64url 文本（链接的 # 后面）；超过 8 KB 改用文件
 *  - 作业：老师生成作业码，学生导入后交回结果文件，老师按班汇总达成率
 *  - 出题自检：学生目标是数据形式的条件；台面满足目标、清空后的开场台面不满足
 * 全部是纯数据，不联网。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  const LIMIT = 8 * 1024;

  // 浏览器和 node 都有 btoa / atob / TextEncoder（UTF-8 安全）
  const b64 = {
    enc(s) { const bytes = new TextEncoder().encode(s); let bin = ''; bytes.forEach((x) => { bin += String.fromCharCode(x); }); return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); },
    dec(s) { const t = String(s).replace(/-/g, '+').replace(/_/g, '/'); const bin = atob(t + '='.repeat((4 - t.length % 4) % 4)); return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))); },
  };

  U.Share = {
    LIMIT,
    // 台面 → 分享文本。用到的打包器材（type 以 macro_ 开头、在 U.MACRO_SPECS 里）一起带上
    encode(scene) {
      const macros = {};
      for (const e of Object.values(scene.entities)) if (U.MACRO_SPECS && U.MACRO_SPECS[e.type]) macros[e.type] = U.MACRO_SPECS[e.type];
      const payload = U.JSON.stringify({ v: 1, scene: U.JSON.parse(W.save(scene)), macros });
      const text = b64.enc(payload);
      return text.length <= LIMIT ? { mode: 'link', text } : { mode: 'file', text: payload };
    },
    // 分享文本 → 台面（先把带来的打包器材登记好，再载入场景）
    decode(text) {
      const obj = U.JSON.parse(b64.dec(text));
      if (!obj || obj.v !== 1 || !obj.scene) throw new Error('不是台面分享');
      for (const id of Object.keys(obj.macros || {})) if (!U.types[id]) U.defineMacro(id, obj.macros[id]);
      return W.load(obj.scene);
    },

    // ---- 作业（3.3）----
    assignment(title, pids, dueTs) {
      const a = { v: 1, id: 'a' + Math.abs(hash(title + pids.join(',') + dueTs)).toString(36), title, pids, due: dueTs };
      return Object.assign(a, { code: b64.enc(JSON.stringify(a)) });
    },
    parseAssignment(code) { return JSON.parse(b64.dec(code)); },
    // 结果码：结果文件 → 一段 base64url 文本（老师端一行一个粘贴进来）
    resultCode(file) { return b64.enc(JSON.stringify(file)); },
    parseResult(code) {
      const o = JSON.parse(b64.dec(String(code).trim()));
      if (!o || o.v !== 1 || !o.results) throw new Error('不是结果码');
      return o;
    },
    // 学生交回的结果文件：该作业里每题的最近一次结果
    resultFile(aid, pids, events, student) {
      const res = {};
      for (const e of events) if ((e.type === 'finish' || e.type === 'submit') && pids.includes(e.pid)) res[e.pid] = { ts: e.ts, items: e.data.items || [], traps: e.data.traps || [] };
      return { v: 1, aid, student: student || 'student', results: res };
    },
    // 老师端：按班汇总每题每个里程碑的达成率、常踩的陷阱
    classSummary(files, problems) {
      const out = {};
      for (const p of problems) {
        const rs = files.map((f) => f.results[p.id]).filter(Boolean);
        if (!rs.length) continue;
        const rate = {}; for (const m of p.milestones) rate[m.id] = rs.filter((r) => (r.items || []).some((i) => i.id === m.id && i.done)).length / rs.length;
        const traps = {}; for (const r of rs) for (const t of r.traps) traps[t] = (traps[t] || 0) + 1;
        out[p.id] = { students: rs.length, rate, traps };
      }
      return out;
    },

    // ---- 出题自检（4.2）----
    // goals：数据形式的条件数组（同 when）；palette：器材架允许的类型；opening：开场台面
    selfCheck(goals, opening) {
      const compile = U.Judge.compile;
      const test = (sc) => { const D = W.evaluate(sc); const view = U.Judge.makeW(sc, D, { ms: {} }); return goals.every((g) => compile(g)(view)); };
      const ok = test(opening.build ? opening.build() : opening);
      const empty = W.blank();
      if (!ok) return { ok: false, why: '台面没有满足目标：先把目标搭出来再出题' };
      if (test(empty)) return { ok: false, why: '空台面就满足目标，题没有意思' };
      return { ok: true };
    },
  };

  function hash(s) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return h; }
})(typeof globalThis !== 'undefined' ? globalThis : window);
