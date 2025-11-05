(function clearStorageOnce() {
  const FLAG_LS = 'app:storage-cleared:v1'; // 版本化的旗标
  const FLAG_SS = 'app:clearing-guard'; // 会话级防抖，避免同一会话重复清

  function isQuotaError(e) {
    const n = e && e.name;
    return (
      n === 'QuotaExceededError' ||
      n === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      e?.code === 22 ||
      e?.code === 1014
    );
  }

  function lsWritable() {
    try {
      const k = '__probe__' + Math.random();
      localStorage.setItem(k, '1');
      localStorage.removeItem(k);
      return true;
    } catch (e) {
      return false;
    }
  }

  // 1) 先检查环境是否允许写入；不允许就直接跳过，避免报错
  if (!lsWritable()) {
    console.warn('[clearStorageOnce] localStorage not writable, skip.');
    return;
  }

  // 2) 会话级防抖（如果本会话已经尝试过清理，就别再来一次）
  try {
    if (sessionStorage.getItem(FLAG_SS) === '1') return;
    sessionStorage.setItem(FLAG_SS, '1');
  } catch {}

  // 3) 已完成过则不重复
  let already = false;
  try {
    already = localStorage.getItem(FLAG_LS) === '1';
  } catch {}
  if (already) return;

  // 4) 优先做“定点清理”而不是 clear()（保留 FLAG_LS）
  try {
    const keep = new Set([FLAG_LS]);
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (!keep.has(k)) {
        try {
          localStorage.removeItem(k);
        } catch {}
      }
    }
  } catch (e) {
    // 兜底：再尝试 clear()
    try {
      localStorage.clear();
    } catch {}
  }

  // 5) 最后写入旗标；若失败，降级用 Cookie 记忆，避免无限循环
  try {
    localStorage.setItem(FLAG_LS, '1');
  } catch (e) {
    if (isQuotaError(e)) {
      console.error('[clearStorageOnce] Quota when setting flag after clear:', e);
    }
    // 30 天 cookie 兜底
    try {
      document.cookie = 'app_storage_cleared=1; max-age=' + 60 * 60 * 24 * 30 + '; path=/';
    } catch {}
  }
})();
