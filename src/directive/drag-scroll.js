// src/directives/drag-scroll.js
// 仅支持 X 轴拖拽。无须改动 WorkOrderProgress.vue，直接挂在 .progress-wrap 上即可。
// 兼容你当前写法：v-drag-scroll="'.progress-wrap'"（容器既可取自身，也可传选择器/元素/函数）。
// 为了不影响 Element Plus 的交互，内置了常见 EP 控件与 Popover/Tooltip 的逃逸选择器。

const DEFAULTS = {
  momentum: true, // 惯性滚动
  multiplier: 1, // 拖动速度倍数
  exclude: [
    // 通用可交互元素
    'input',
    'textarea',
    'button',
    'select',
    'a',
    '[role="button"]',
    '[contenteditable="true"]',
    '[data-drag-ignore]',
    // Element Plus 常见控件
    '.el-button',
    '.el-link',
    '.el-input',
    '.el-input__inner',
    '.el-textarea',
    '.el-select',
    '.el-date-editor',
    '.el-cascader',
    '.el-slider',
    '.el-switch',
    '.el-radio',
    '.el-checkbox',
    '.el-checkbox__input',
    // 悬浮/提示相关：避免拖拽时误触发或吞掉 hover
    '.el-popover',
    '.el-popover__reference',
    '.el-tooltip',
  ].join(','),
  clickThreshold: 5, // 像素，超过视为拖动并阻止 click
  handle: null, // 仅允许从该选择器触发拖动（可选）
  pointerCapture: false, // 进入拖动后是否 setPointerCapture
};

function assign(target, src) {
  for (const k in src) target[k] = src[k];
  return target;
}

/** 解析 binding：支持
 *  v-drag-scroll
 *  v-drag-scroll="'.inner'"
 *  v-drag-scroll="elementRef"
 *  v-drag-scroll="() => elementRef"
 *  v-drag-scroll="{ container: '.inner', momentum: true, handle: '.drag-handle' }"
 */
function resolveContainerAndOptions(el, binding) {
  let container = el;
  const opt = assign({}, DEFAULTS);
  const v = binding?.value;

  if (v && typeof v === 'object' && !(v instanceof Element)) {
    if ('container' in v) container = normalizeContainer(el, v.container) ?? el;
    assign(opt, v);
    if ('container' in opt) delete opt.container;
  } else if (typeof v === 'string' || typeof v === 'function' || v instanceof Element) {
    container = normalizeContainer(el, v) ?? el;
  }
  return { container, opt };
}

/** 支持 selector / Element / () => Element */
function normalizeContainer(contextEl, input) {
  if (!input) return null;
  if (input instanceof Element) return input;
  if (typeof input === 'function') {
    try {
      const res = input();
      return res instanceof Element ? res : null;
    } catch {
      return null;
    }
  }
  if (typeof input === 'string') {
    // 先在当前元素作用域内找，避免命中到别的行
    return contextEl.querySelector(input) || document.querySelector(input);
  }
  return null;
}

export default {
  mounted(el, binding) {
    const { container: ct, opt } = resolveContainerAndOptions(el, binding);
    el.__dragScroll__ = { container: ct, opt };

    // 仅 X 轴：开放横向滚动，不强制隐藏纵向，保留原生竖向滚轮/触摸
    ct.style.overflowX = ct.style.overflowX || 'auto';
    ct.style.userSelect = ct.style.userSelect || 'none';
    ct.style.cursor = ct.style.cursor || 'grab';
    ct.style.touchAction = ct.style.touchAction || 'pan-y'; // 允许纵向原生手势

    // 状态
    let isPointerDown = false; // 已按下（但未必进入拖动）
    let dragging = false; // 已超过阈值，进入拖动
    let startX = 0;
    let startLeft = 0;
    let lastX = 0;
    let lastT = 0;
    let vx = 0;
    let raf = 0;
    let movedDist = 0;
    let pointerId = null;

    const stopMomentum = () => cancelAnimationFrame(raf);
    const easeOutCubic = p => 1 - Math.pow(1 - p, 3);
    const hasExcluded = t => !!(t && t.closest && opt.exclude && t.closest(opt.exclude));
    const fromHandle = t => !opt.handle || (t && t.closest && t.closest(opt.handle));

    const onPointerDown = e => {
      // 在排除元素上开始 → 放行
      if (hasExcluded(e.target)) return;
      // 限定手柄（若配置）
      if (!fromHandle(e.target)) return;

      isPointerDown = true;
      dragging = false;
      pointerId = e.pointerId;

      startX = lastX = e.clientX;
      startLeft = ct.scrollLeft;
      lastT = performance.now();
      vx = 0;
      movedDist = 0;

      stopMomentum();
      // 先不 capture，不阻止点击，等确认进入拖动
    };

    const onPointerMove = e => {
      if (!isPointerDown) return;

      const x = e.clientX;
      const now = performance.now();

      // 还没“宣布”为拖动 → 先累计位移，判断是否超过阈值（仅看 X 轴）
      if (!dragging) {
        movedDist += Math.abs(x - lastX);
        lastX = x;
        lastT = now;

        if (movedDist > opt.clickThreshold) {
          dragging = true;
          ct.classList.add('is-grabbing');
          if (opt.pointerCapture) ct.setPointerCapture?.(pointerId);
        } else {
          return;
        }
      }

      // 真正拖动：横向滚动 & 阻止默认，避免选中文本或触发表格/单元格点击
      const dx = (x - startX) * opt.multiplier;
      ct.scrollLeft = startLeft - dx;

      vx = (x - lastX) / (now - lastT || 1);
      lastX = x;
      lastT = now;

      e.preventDefault();
    };

    const onPointerUpOrCancel = () => {
      if (!isPointerDown) return;

      isPointerDown = false;

      if (!dragging) {
        // 未进入拖动 → 保持点击行为
        movedDist = 0;
        return;
      }

      // 结束拖动
      dragging = false;
      ct.classList.remove('is-grabbing');

      if (!opt.momentum) return;

      const startL = ct.scrollLeft;
      const K = 800;
      const targetL = startL - vx * K * 0.5;

      const duration = 400;
      const t0 = performance.now();

      const step = t => {
        const p = Math.min(1, (t - t0) / duration);
        const e = easeOutCubic(p);
        ct.scrollLeft = startL + (targetL - startL) * e;
        if (p < 1) raf = requestAnimationFrame(step);
      };

      if (Math.abs(vx) > 0.02) {
        raf = requestAnimationFrame(step);
      }
    };

    // 只有发生过拖动才阻断 click，普通点击（含 Popover 触发）不干预
    const onClick = e => {
      if (movedDist > opt.clickThreshold) {
        e.stopImmediatePropagation?.();
        e.preventDefault?.();
      }
      movedDist = 0;
    };

    // 鼠标滚轮：仅在按住 Shift 时把纵向滚动映射为横向（避免影响表格天然滚动）
    const onWheel = e => {
      if (!e.shiftKey) return;
      ct.scrollLeft += e.deltaY;
      e.preventDefault();
    };

    // 绑定事件
    el.__dragScroll__.handlers = {
      onPointerDown,
      onPointerMove,
      onPointerUpOrCancel,
      onClick,
      onWheel,
    };
    el.__dragScroll__.raf = raf;

    ct.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUpOrCancel, { passive: true });
    window.addEventListener('pointercancel', onPointerUpOrCancel, { passive: true });
    ct.addEventListener('click', onClick, true);
    ct.addEventListener('wheel', onWheel, { passive: false });
  },

  unmounted(el) {
    const state = el.__dragScroll__;
    if (!state) return;

    const ct = state.container || el;
    const h = state.handlers || {};

    cancelAnimationFrame?.(state.raf);

    ct.removeEventListener?.('pointerdown', h.onPointerDown);
    window.removeEventListener?.('pointermove', h.onPointerMove);
    window.removeEventListener?.('pointerup', h.onPointerUpOrCancel);
    window.removeEventListener?.('pointercancel', h.onPointerUpOrCancel);
    ct.removeEventListener?.('click', h.onClick, true);
    ct.removeEventListener?.('wheel', h.onWheel);

    delete el.__dragScroll__;
  },
};
