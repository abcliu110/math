/* 学习事件流：只追加。复习排期、错题本、家长端、老师看板都从它现算（本文件只负责记和读）。
 * 存储：浏览器里写 localStorage('universe-events-v1')，最多 4000 条，超出丢最旧的。node 里只在内存。 */
(function (G) {
  'use strict';
  const U = G.U;
  const KEY = 'universe-events-v1', CAP = 4000;
  const store = (() => { try { return G.localStorage || null; } catch (e) { return null; } })();
  const E = {
    log: [], ctx: {},
    load() { if (!store) return; try { E.log = JSON.parse(store.getItem(KEY)) || []; } catch (e) { E.log = []; } },
    save() { if (!store) return; try { store.setItem(KEY, JSON.stringify(E.log.slice(-CAP))); } catch (e) { /* 存储满了就不存，不影响使用 */ } },
    push(type, data) {
      const e = Object.assign({ ts: Date.now() }, E.ctx, { type, data: data || {} });
      E.log.push(e); if (E.log.length > CAP) E.log.shift();
      E.save(); return e;
    },
    where(fn) { return E.log.filter(fn); },
    // 某个问题的历史：练过几次、考过几次、最近得分
    history(pid) {
      const fin = E.log.filter((e) => e.pid === pid && (e.type === 'finish' || e.type === 'submit'));
      const last = fin[fin.length - 1];
      return { practice: fin.filter((e) => e.mode === 'practice').length, exam: fin.filter((e) => e.type === 'submit').length, last: last ? last.data : null };
    },
    clear() { E.log = []; E.save(); },
  };
  U.Events = E;
})(typeof globalThis !== 'undefined' ? globalThis : window);
