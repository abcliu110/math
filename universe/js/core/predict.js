/* 预测表单（纯逻辑，无 DOM）：问题的 predict 可以是五种形式之一。
 * pick：选项（options，每项 {v,label}）；answer 是正确选项的 v
 * place：位置（slots，标签数组）；answer 是正确位置的下标
 * more-less：参照物 ref；answer 是 'more' | 'less' | 'same'（多 / 少 / 一样）
 * number：answer 是精确数字的文字，比如 '12'、'3/4'；按有理数精确比较
 * type：answer 是标准答案文字；accept 是可以接受的其他写法（去掉首尾空格后比较）
 * 没写 form 时：有 options 就当作 pick（兼容旧题目）。 */
(function (G) {
  'use strict';
  const U = G.U;

  const FORMS = ['pick', 'place', 'more-less', 'number', 'type'];
  const CMP = { more: '多', less: '少', same: '一样' };

  // 这道题的预测属于哪些形式（不合法的 form 返回空数组）
  U.Predict = {
    FORMS,
    CMP,
    normalize(predict) {
      if (!predict || typeof predict !== 'object') return [];
      if (predict.form === undefined) return Array.isArray(predict.options) ? ['pick'] : [];
      return FORMS.includes(predict.form) ? [predict.form] : [];
    },
    // 检查学生的回答 answer 是否正确。返回 {ok, why}，why 是给学生看的中文说明
    check(predict, answer) {
      const form = predict.form === undefined ? 'pick' : predict.form;
      if (form === 'pick') {
        if (predict.answer === undefined) return { ok: false, why: '这道题没有标准答案' };
        const ok = String(answer) === String(predict.answer);
        const o = (predict.options || []).find((x) => String(x.v) === String(predict.answer));
        return { ok, why: ok ? '猜对了' : '不对，正确的是「' + (o ? o.label : predict.answer) + '」' };
      }
      if (form === 'place') {
        const slots = predict.slots || [];
        const i = Number(answer);
        if (!Number.isInteger(i) || i < 0 || i >= slots.length) return { ok: false, why: '没有这个位置' };
        const ok = i === Number(predict.answer);
        return { ok, why: ok ? '放对了' : '不对，正确的是「' + slots[predict.answer] + '」' };
      }
      if (form === 'more-less') {
        if (!Object.prototype.hasOwnProperty.call(CMP, answer)) return { ok: false, why: '没有这个选项' };
        const ok = answer === predict.answer;
        return { ok, why: ok ? '对了' : '不对，正确的是「' + CMP[predict.answer] + '」' };
      }
      if (form === 'number') {
        let a;
        try { a = U.Q.parse(answer); } catch (e) { return { ok: false, why: '请写成整数、小数或分数，比如 12、0.5、3/4' }; }
        let b;
        try { b = U.Q.parse(predict.answer); } catch (e) { return { ok: false, why: '这道题的标准答案写错了' }; }
        const ok = U.Q.eq(a, b);
        return { ok, why: ok ? '答对了' : '不对，正确答案是 ' + predict.answer };
      }
      if (form === 'type') {
        const s = String(answer).trim();
        const want = [predict.answer].concat(predict.accept || []).map((x) => String(x).trim());
        const ok = s !== '' && want.includes(s);
        return { ok, why: ok ? '答对了' : '不对，正确答案是「' + predict.answer + '」' };
      }
      return { ok: false, why: '不认识这种预测形式' };
    },
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
