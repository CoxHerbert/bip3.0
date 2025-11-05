<template>
  <div class="wrap">
    <div id="transfer-loader-wrapper" class="transfer-loader-wrapper">
      <div class="loader-box">
        <span>联</span><span>合</span><span>东</span><span>创</span> <span>B</span><span>I</span
        ><span>P</span><span>2</span><span>.</span><span>0</span>
      </div>
      <div class="card">
        <div class="sub">{{ statusText }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, getCurrentInstance } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getLoginEnvNew } from '@/utils/env.js';
import store from '@/store';
import Api from '@/api';
import { loginBySocial2, authRender, talentRegister } from '@/api/user';

const { proxy } = getCurrentInstance();
const route = useRoute();
const router = useRouter();

const userInfo = computed(() => store.getters.userInfo || {});
const browserEnv = getLoginEnvNew(); // WECHAT_MP / WECHAT_ENTERPRISE / normal / 其它
const env = import.meta.env;

const fallbackUrl = {
  h5: env.VITE_WEB_OLD_H5_URL,
  pc: env.VITE_WEB_PC_URL,
  mobile: env.VITE_WEB_MOBILE_URL,
};

const sceneId = ref('');
const statusText = ref('正在为你跳转…');
const platform = getPlatform();

/** 识别 “已登录直跳” 路由：/transfer/:sceneId/Logged 或 param/query/state=Logged */
const isLoggedRoute = computed(() => {
  const p = String(route.path || '').toLowerCase();
  return (
    p.endsWith('/logged') || route.params?.state === 'Logged' || route.query?.state === 'Logged'
  );
});

/** 返回 'pc' | 'mobile' */
function getPlatform() {
  const ua = String(typeof navigator !== 'undefined' ? navigator.userAgent : '');
  const isMobileUA = /Android|iPhone|iPad|iPod|Windows Phone|Mobile/i.test(ua);
  return isMobileUA ? 'mobile' : 'pc';
}

onMounted(async () => {
  sceneId.value = String(route.params?.sceneId || '').trim();

  // 命中 /Logged 分支：直接跳平台
  if (isLoggedRoute.value) {
    await jumpByPlatform();
    return;
  }

  if (browserEnv === 'normal') {
    try {
      await proxy.$store.dispatch('updateHasUsavedChanges', false);
    } catch {}
    await proxy.$store.dispatch('FedLogOut');
    // 登录成功后返回到 /transfer/:sceneId/Logged，直接进行平台跳转
    const path = `/login?redirect=/transfer/${route.params?.sceneId}/Logged`;
    router.replace(path);
    return;
  }

  // 读取 code / state
  const sp = new URLSearchParams(window.location.search || '');
  const code = sp.get('code');
  const state = sp.get('state');

  try {
    if (code && state) {
      // 已回跳：直接换 token 并跳平台
      await loginBySocialFun({
        tenantId: '000000',
        source: browserEnv,
        code,
        state,
        callbackUrl: window.location.href || '/',
      });
      await jumpByPlatform();
    } else {
      // 未授权：先去授权
      await authorize();
    }
  } catch (err) {
    console.error('[social] onMounted error:', err);
    statusText.value = '出错啦，正在返回首页…';
    router.replace('/');
  }
});

/** 监听路由变化：如果后续被推到 /Logged，也能立刻直跳 */
watch(
  () => route.fullPath,
  async () => {
    if (!sceneId.value) sceneId.value = String(route.params?.sceneId || '').trim();
    if (isLoggedRoute.value) await jumpByPlatform();
  }
);

/** 去后端换取第三方授权地址并跳转 */
async function authorize() {
  const href = window.location.href;
  try {
    const res = await authRender({ redirectUrl: href }, browserEnv);
    const payload = res?.data ?? res;
    const url = payload?.data || payload?.url || payload;
    if (typeof url === 'string') {
      window.location.href = url;
    } else {
      throw new Error('Authorize response missing redirect url');
    }
  } catch (error) {
    console.error('[authorize] failed:', error);
    statusText.value = '获取授权地址失败';
  }
}

/** 后端用 code/state 换 token，写入 Store */
async function loginBySocialFun(data) {
  const res = await loginBySocial2(data);
  const d = res?.data;
  const accessToken = d?.access_token;
  const refreshToken = d?.refresh_token;

  if (!accessToken) {
    const msg = d?.error_description || d?.msg || '登录失败：未获取到 access_token';
    statusText.value = msg;
    throw new Error(msg);
  }

  // 1) 写入 Token
  await proxy.$store.dispatch('setTokenPair', { accessToken, refreshToken });

  // 2) 未建档且公众号：先建档
  const userId = String(d?.user_id ?? '');
  const oauthId = d?.oauth_id;
  if ((userId === 'null' || userId === '') && browserEnv === 'WECHAT_MP' && oauthId) {
    await createUserThenRedirect(oauthId);
  } else {
    await proxy.$store.dispatch('SetUserInfo', d);
  }
}

/** 未建档用户：用 oauthId 建档后再写入 */
async function createUserThenRedirect(oauthId) {
  try {
    const res = await talentRegister({ oauthId });
    const code = res?.data?.code;
    if (code !== 200) {
      console.error('[social] userCreate failed:', res);
      statusText.value = '初始化账号失败，请稍后重试';
      return;
    }
    const id = res?.data?.data?.id || res?.data?.id || res?.id;
    if (id) {
      const next = { ...(userInfo.value || {}), id };
      await proxy.$store.dispatch('SetUserInfo', next);
    }
  } catch (error) {
    console.error('[userCreate] failed:', error);
  }
}

const reH5 = /^\/(?:h5)(?:\/|$)/i;
const reMobile = /^\/(?:mobile)(?:\/|$)/i;

/** 平台跳转 */
async function jumpByPlatform() {
  if (!sceneId.value) {
    statusText.value = '缺少 sceneId，无法跳转';
    return;
  }

  if (platform === 'pc') {
    try {
      statusText.value = '登录成功，正在跳转到 PC 端…';
      const res = await Api.urlMatch.updateByCode({ code: sceneId.value });
      const { code, data } = res?.data || {};
      const pcUrl = data?.pcUrl || '/';
      if (code === 200) {
        if (/^https?:\/\//i.test(pcUrl)) window.location.href = pcUrl;
        else router.push({ path: pcUrl });
      } else {
        throw new Error('未匹配到 PC 地址');
      }
    } catch (err) {
      console.error('[jumpByPlatform:pc] failed:', err);
      statusText.value = 'PC 跳转失败';
    }
    return;
  }

  // H5 / Mobile
  try {
    statusText.value = '登录成功，正在跳转到移动端…';
    const res = await Api.urlMatch.updateByCode({ code: sceneId.value });
    const { data } = res?.data || {};
    const h5Url = data?.h5Url || '/';

    const query = { ...userInfo.value, urlMatchCode: sceneId.value };
    const ticketRes = await Api.urlMatch.submmitTicket(query).catch(() => null);
    const urlTicketId = ticketRes?.data?.data?.urlTicketId;

    if (urlTicketId) {
      if (reH5.test(h5Url)) {
        window.location.href = `${
          import.meta.env.VITE_H5_URL
        }/pages/login/UserInfoTransition?urlTicketId=${urlTicketId}`;
        return;
      }
      if (reMobile.test(h5Url)) {
        window.location.href = `${
          import.meta.env.VITE_MOBILE_URL
        }/login/userInfoTransition/${urlTicketId}`;
        return;
      }
    }
    // 兜底：未拿到 ticket 或非内置路由，直接跳
    window.location.href = h5Url;
  } catch (err) {
    console.error('[jumpByPlatform:mobile] failed:', err);
    statusText.value = '移动端跳转失败';
  }
}
</script>

<style scoped lang="scss">
$bg-page: #0f1622; /* 全屏深背景 */
$bg-loader: #0f1622;
$muted: #c7c9cf;
$primary: #007aff;

.wrap {
  position: fixed;
  inset: 0;
  background: $bg-page;
  display: grid;
  place-items: center;
  text-align: center;
  padding: max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right))
    max(16px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left));
}

#transfer-loader-wrapper.transfer-loader-wrapper {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background-color: $bg-loader;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .loader-box {
    width: min(520px, 88vw);
    text-align: center;
    font-weight: bold;
    color: rgba(255, 255, 255, 0.68);
    font-size: clamp(20px, 6vw, 56px);
    letter-spacing: 0.08em;

    > span {
      opacity: 0.5;
      display: inline-block;
      animation: bouncingLoader 1s infinite alternate;
      &:nth-child(2) {
        animation-delay: 0.1s;
      }
      &:nth-child(3) {
        animation-delay: 0.2s;
      }
      &:nth-child(4) {
        animation-delay: 0.3s;
      }
      &:nth-child(5) {
        animation-delay: 0.4s;
      }
      &:nth-child(6) {
        animation-delay: 0.5s;
      }
      &:nth-child(7) {
        animation-delay: 0.6s;
      }
    }
  }

  .card {
    margin-top: 12px;
    padding: 18px 20px;
    width: min(92vw, 520px);
    background: transparent;
    box-shadow: none;
    color: $muted;
    .sub {
      font-size: clamp(12px, 3.4vw, 14px);
      color: #ff6b6b;
      margin: 8px 0 12px;
      word-break: break-all;
    }
    .hint {
      font-size: clamp(12px, 3.4vw, 13px);
      color: $primary;
      a {
        color: inherit;
        text-decoration: underline;
      }
    }
  }
}

@keyframes bouncingLoader {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(25%);
  }
  100% {
    transform: translateY(0);
  }
}
@media (prefers-reduced-motion: reduce) {
  #transfer-loader-wrapper .loader-box > span {
    animation: none !important;
  }
}
</style>
