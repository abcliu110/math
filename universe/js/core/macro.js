/* 打包器材（宏器材）：把一段搭好的、无状态的台面封成一个新器材。
 * spec = { label, group, essence, grades?, inputs: {名: {id, port}}, outputs: {名: {id, port}}, scene }
 *   scene：W.blank() 形状的场景，里面的器材 id 指向 scene.entities
 * 规则：内部不能有有状态器材（记忆器、时钟、骰子…），这样封装后仍然是确定的纯计算。
 * 输入口的类型取内部器材那个口的类型；输出口同理。 */
(function (G) {
  'use strict';
  const U = G.U, W = U.World;
  // 内部引脚：每种值类型一个，把外部输入的值交给内部的口。值放在 U.__pins 里，按 key 取。
  U.__pins = {};
  for (const kind of Object.keys(U.KINDS)) {
    U.define('pin_' + kind, {
      essence: ['E12'], label: '引脚（' + kind + '）', prefix: '脚', group: '关系', grades: [1, 1], hidden: true,
      workspaceRole: 'none', handles: true, sizeFixed: true,   // 内部引脚不画出来，不需要容得下口的卡片尺寸
      props: { key: { type: 'text', label: '名', default: '', hidden: true } },
      inputs: {}, outputs: { v: { dim: null, kind, label: '值' } },
      lint: { minProps: 0, why: '内部引脚，只在打包器材里出现' },
      icon: () => '<circle cx="32" cy="22" r="4"/>', size: () => [10, 10], draw: () => '',
      compute: (c) => ({ v: U.__pins[c.props.key] || null }),
    });
  }

  // 打包器材的定义存一份（可序列化），分享时随台面一起带走（4.3）
  U.MACRO_SPECS = U.MACRO_SPECS || {};
  U.defineMacro = function (id, spec) {
    U.MACRO_SPECS[id] = JSON.parse(JSON.stringify({ label: spec.label, group: spec.group, essence: spec.essence, grades: spec.grades, inputs: spec.inputs, outputs: spec.outputs, scene: spec.scene }));
    const sc = spec.scene;
    const outKinds = {}, outDims = {}, inKinds = {};
    for (const [name, ref] of Object.entries(spec.inputs)) {
      const e = sc.entities[ref.id]; if (!e) throw new Error('输入 ' + name + ' 指向的器材不在台面里');
      const d = U.types[e.type]; const kind = d.inputs[ref.port] && d.inputs[ref.port].kind;
      if (!kind) throw new Error('输入 ' + name + ' 的口 ' + ref.port + ' 不存在');
      inKinds[name] = kind;
    }
    for (const [name, ref] of Object.entries(spec.outputs)) {
      const e = sc.entities[ref.id]; if (!e) throw new Error('输出 ' + name + ' 指向的器材不在台面里');
      const d = U.types[e.type]; const o = d.outputs[ref.port];
      if (!o) throw new Error('输出 ' + name + ' 的口 ' + ref.port + ' 不存在');
      if (U.types[e.type].stateful) throw new Error('内部有状态器材，不能封装');
      outKinds[name] = o.kind; outDims[name] = o.dim;
    }
    for (const e of Object.values(sc.entities)) if (W.isStateful(sc, e.id)) throw new Error('内部有状态器材：' + e.name);
    const ins = {}, outs = {};
    for (const k of Object.keys(inKinds)) ins[k] = { kind: inKinds[k], label: k };
    for (const k of Object.keys(outKinds)) outs[k] = { kind: outKinds[k], dim: outDims[k] === undefined ? null : outDims[k], label: k };
    U.define(id, {
      essence: spec.essence, label: spec.label, prefix: spec.prefix || spec.label, group: spec.group || '关系', grades: spec.grades || [1, 9],
      workspaceRole: 'none', handles: true,   // 打包器材在工作区里就是普通卡片（它没有自己的角色）
      props: { _n: { type: 'int', label: '（封装的）', default: 0, min: 0, max: 0, hidden: true } },
      inputs: ins, outputs: outs,
      lint: { minProps: 0, why: '打包器材没有自己的属性，内部属性已在封装时固定' },
      icon: spec.icon || (() => U.kit.text(32, 24, spec.label.slice(0, 3), { size: 14, weight: 700 })),
      size: () => [180, 110],
      compute: (c) => {
        const s = W.clone(sc);
        for (const k of Object.keys(inKinds)) {
          const pid = W.add(s, 'pin_' + inKinds[k], 0, 0, { key: k });
          s.links.push({ id: 'pl_' + k, from: pid, fromPort: 'v', to: spec.inputs[k].id, toPort: spec.inputs[k].port });
          U.__pins[k] = c.inp[k] && c.inp[k].length ? c.inp[k][0] : null;
        }
        const D = W.evaluate(s); const o = {};
        for (const k of Object.keys(outKinds)) { const v = D[spec.outputs[k].id] && D[spec.outputs[k].id].out[spec.outputs[k].port]; if (v) o[k] = v; }
        return o;
      },
      badge: (c) => '封装器材',
      draw: (c) => U.kit.text(c.w / 2, c.h / 2 + 4, spec.label, { size: 14, weight: 700 }),
    });
    return id;
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
