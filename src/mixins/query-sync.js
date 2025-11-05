// 通用判空：'', null, undefined, 空白字符串、空数组、空对象 都视为“空”
function isEmptyVal(v) {
  if (v === '' || v === null || v === undefined) return true;
  if (typeof v === 'string' && v.trim() === '') return true;
  if (Array.isArray(v) && v.length === 0) return true;
  if (Object.prototype.toString.call(v) === '[object Object]') {
    return Object.keys(v).length === 0;
  }
  return false;
}

// 序列化到 URL
function serializeQuery(obj) {
  const out = {};
  Object.keys(obj || {}).forEach(k => {
    const v = obj[k];
    if (isEmptyVal(v)) return; // 过滤空值
    out[k] = typeof v === 'object' ? JSON.stringify(v) : String(v);
  });
  return out;
}

// 反序列化从 URL
function deserializeQuery(query) {
  const out = {};
  Object.keys(query || {}).forEach(k => {
    const raw = query[k];
    if (typeof raw !== 'string') {
      out[k] = raw;
      return;
    }
    const t = raw.trim();
    if ((t.startsWith('{') && t.endsWith('}')) || (t.startsWith('[') && t.endsWith(']'))) {
      try {
        out[k] = JSON.parse(t);
        return;
      } catch {}
    }
    out[k] = raw;
  });
  return out;
}

// 简单稳定比较（避免死循环）
function isSameQuery(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

// 防抖
function debounce(fn, ms) {
  if (!ms) return fn;
  let t = null;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

export default {
  // 组件内可配置：
  // querySync: { paramName='queryParams', useReplace=true, debounceMs=0 }
  created() {
    const opt = this.$options.querySync || {};
    this.__qs_paramName = opt.paramName || 'queryParams';
    this.__qs_useReplace = opt.useReplace !== undefined ? opt.useReplace : true;
    this.__qs_pushFn = this.__qs_useReplace ? this.$router.replace : this.$router.push;
    this.__qs_debouncedUpdate = debounce(payload => this.__qs_pushFn(payload), opt.debounceMs || 0);

    // ① 初始：URL -> 本地
    const fromUrl = deserializeQuery(this.$route.query);
    if (this[this.__qs_paramName] == null) this[this.__qs_paramName] = {};
    this[this.__qs_paramName] = { ...this[this.__qs_paramName], ...fromUrl };

    // ② 监听本地 -> URL
    this.$watch(
      this.__qs_paramName,
      val => {
        const serialized = serializeQuery(val || {});
        if (!isSameQuery(this.$route.query, serialized)) {
          this.__qs_debouncedUpdate({ query: serialized });
        }
      },
      { deep: true, immediate: false }
    );

    // ③ 监听 URL 变化（外部导航）-> 本地
    this.unwatchRoute = this.$watch(
      () => this.$route.query,
      q => {
        const obj = deserializeQuery(q || {});
        const merged = { ...(this[this.__qs_paramName] || {}) };
        let changed = false;
        // 用 URL 覆盖本地（并移除 URL 中不存在的键）
        const keys = new Set([...Object.keys(merged), ...Object.keys(obj)]);
        keys.forEach(k => {
          if (k in obj) {
            if (JSON.stringify(merged[k]) !== JSON.stringify(obj[k])) {
              merged[k] = obj[k];
              changed = true;
            }
          } else {
            if (k in merged) {
              delete merged[k];
              changed = true;
            }
          }
        });
        if (changed) this[this.__qs_paramName] = merged;
      }
    );
  },
  beforeUnmount() {
    if (this.unwatchRoute) this.unwatchRoute();
  },
};
