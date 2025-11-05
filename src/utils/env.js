// src/utils/env.js
export function isMobile() {
  try {
    const ch = navigator.userAgentData;
    if (ch && typeof ch.mobile === 'boolean') return ch.mobile;
  } catch (_) {}
  const ua = (typeof navigator !== 'undefined' && navigator.userAgent) || '';
  return /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
}

function getUA(ua) {
  if (ua) return String(ua);
  if (typeof navigator === 'undefined') return '';
  return navigator.userAgent || '';
}

export function isWeCom(ua) {
  return /(wxwork|WeCom)/i.test(getUA(ua));
}

export function isWeChat(ua) {
  const u = getUA(ua);
  // 识别微信但排除企业微信
  return /MicroMessenger/i.test(u) && !isWeCom(u);
}

/**
 * 同步环境识别
 * 返回值：'WECHAT_ENTERPRISE' | 'WECHAT_MP' | 'normal'
 */
export function getLoginEnv(ua) {
  if (isWeCom(ua)) return 'WECHAT_ENTERPRISE';
  if (isWeChat(ua)) return 'WECHAT_MP';
  return 'normal';
}

/**
 * 该方法只对transfer页面做修改
 * 同步环境识别
 * 返回值：'WECHAT_ENTERPRISE_WEB' | 'WECHAT_MP' | 'normal'
 */
export function getLoginEnvNew(ua) {
  if (isWeCom(ua)) return 'WECHAT_ENTERPRISE_WEB';
  if (isWeChat(ua)) return 'WECHAT_MP';
  return 'normal';
}
