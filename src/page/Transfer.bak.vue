<template>
  <div class="wrap">
    <div id="transfer-loader-wrapper" class="transfer-loader-wrapper">
      <div class="loader-box">
        <span>联</span><span>合</span><span>东</span><span>创</span> <span>B</span><span>I</span
        ><span>P</span><span>2</span><span>.</span><span>0</span>
      </div>
      <div class="card">
        <div class="sub">{{ statusText }}</div>
        <div class="hint">若未自动跳转，请</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getLoginEnvNew } from '@/utils/env.js';
import store from '@/store';
import Api from '@/api';
import { loginBySocial2, authRender, talentRegister } from '@/api/user';
const { proxy } = getCurrentInstance();
const userInfo = computed(() => store.getters.userInfo || {});

const route = useRoute();
const router = useRouter();

const browserEnv = getLoginEnvNew(); // WECHAT_MP / WECHAT_ENTERPRISE / 其它

const env = import.meta.env;

const fallbackUrl = {
  h5: env.VITE_WEB_OLD_H5_URL,
  pc: env.VITE_WEB_PC_URL,
  mobile: env.VITE_WEB_MOBILE_URL,
};

const sceneId = ref('');
const statusText = ref('正在为你跳转…');
const platform = getPlatform();

/** 返回 'pc' | 'mobile' */
function getPlatform() {
  const ua = String(typeof navigator !== 'undefined' ? navigator.userAgent : '');
  const isMobileUA = /Android|iPhone|iPad|iPod|Windows Phone|Mobile/i.test(ua);
  return isMobileUA ? 'mobile' : 'pc';
}

onMounted(async () => {
  sceneId.value = String(route.params?.sceneId || '').trim();
  if (route.params?.state === 'Logged') {
    jumpByPlatform();
    return;
  }
  if (browserEnv === 'normal') {
    proxy.$store.dispatch('updateHasUsavedChanges', false);
    proxy.$store.dispatch('FedLogOut').then(() => {
      const path = `/login?redirect=/transfer/${route.params?.sceneId}`;
      router.replace(path);
    });
  } else {
    // 读取 code / state
    const sp = new URLSearchParams(window.location.search || '');
    const code = sp.get('code');
    const state = sp.get('state');
    try {
      if (code && state) {
        // 已回跳，携带 code/state，直接走登录
        await loginBySocialFun({
          tenantId: '000000',
          source: browserEnv,
          code,
          state,
          callbackUrl: window.location.href || '/',
        });
      } else {
        // 未授权，先去授权
        await authorize();
      }
    } catch (err) {
      console.error('[social] onMounted error:', err);
      router.replace('/');
    }
  }
});

/** 去后端换取第三方授权地址并跳转 */
async function authorize() {
  const href = window.location.href;

  try {
    const res = await authRender(
      {
        redirectUrl: href,
      },
      browserEnv
    );

    // 容错多种返回结构
    const payload = res?.data ?? res;
    const url = payload?.data || payload?.url || payload;
    if (typeof url === 'string') {
      window.location.href = url;
    } else {
      throw new Error('Authorize response missing redirect url');
    }
  } catch (error) {
    console.log(error);
  }
}

/** 后端用 code/state 换 token，写入 Pinia，并按 callbackUrl 跳转 */
async function loginBySocialFun(data) {
  return new Promise((resolve, reject) => {
    loginBySocial2(data)
      .then(async res => {
        const data = res?.data;
        console.log(res, '-res');

        const accessToken = data?.access_token;
        const refreshToken = data?.refresh_token;

        if (!accessToken) {
          const msg = data?.error_description || data?.msg || '登录失败：未获取到 access_token';
          console.error('[social] loginBySocialFun error:', msg, data);
          alert(msg);
          return;
        }

        // 1) 写入 Token（Pinia）
        proxy.$store.dispatch('setTokenPair', { accessToken, refreshToken });

        // 2) 特例：若后端提示“未建档用户且微信开放平台”，按旧逻辑先建档再走回调
        const userId = String(data?.user_id ?? '');
        const oauthId = data?.oauth_id;
        console.log(userId, oauthId, 'userId, oauthId');
        if ((userId === 'null' || userId === '') && browserEnv === 'WECHAT_MP' && oauthId) {
          await createUserThenRedirect(oauthId);
        } else {
          proxy.$store.dispatch('SetUserInfo', data);
        }

        // 3) 拉取用户信息（Pinia）
        // try {
        //   await dispatch('GetUserInfo');
        // } catch (e) {
        //   console.warn('[social] GetUserInfo failed:', e);
        // }
        jumpByPlatform();
        resolve();
      })
      .catch(err => {
        reject(err);
      });
  });
}

/** 未建档用户：用 oauthId 建档后再回跳 */
async function createUserThenRedirect(oauthId) {
  try {
    const res = await talentRegister({ oauthId });
    const { code } = res.data;

    if (code !== 200) {
      console.error('[social] userCreate failed:', res);
      alert('初始化账号失败，请稍后重试');
      return;
    }
    const id = res?.data?.data?.id || res?.data?.id || res?.id;
    if (id) {
      const next = { ...(userInfo.value || {}), id };
      proxy.$store.dispatch('SetUserInfo', next);
    }
  } catch (error) {
    console.log(error);
  }
}
const reH5 = /^\/(?:h5)(?:\/|$)/;
const reMobile = /^\/(?:mobile)(?:\/|$)/;
async function jumpByPlatform() {
  if (platform === 'pc') {
    Api.urlMatch
      .updateByCode({ code: sceneId.value })
      .then(res => {
        const { code, data } = res.data;
        const { pcUrl } = data;
        if (code === 200) {
          router.push({ path: pcUrl || '/' });
          resolve();
        }
      })
      .catch(err => {
        reject(err);
      });
  } else {
    statusText.value = '登录成功，正在跳转到移动端…';
    const res = await Api.urlMatch.updateByCode({ code: sceneId.value });
    const { data } = res.data;
    const { h5Url } = data;
    const query = {
      ...userInfo.value,
      urlMatchCode: sceneId.value,
    };
    Api.urlMatch.submmitTicket(query).then(res => {
      const { code, data } = res.data;
      if (code === 200) {
        const { urlTicketId } = data;
        if (reH5.test(h5Url)) {
          window.location.href = `${
            import.meta.env.VITE_H5_URL
          }/pages/login/UserInfoTransition?urlTicketId=${urlTicketId}`;
        } else if (reMobile.test(h5Url)) {
          window.location.href = `${
            import.meta.env.VITE_MOBILE_URL
          }/login/userInfoTransition/${urlTicketId}`;
        }
      }
    });
  }
}
</script>

<style scoped lang="scss">
$bg-page: #f7f8fa;
$bg-loader: #151a26;
$muted: #87888e;
$primary: #007aff;

.wrap {
  min-height: 100vh;
  background: $bg-page;
  position: relative;
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
    color: $muted;
    font-size: clamp(20px, 6vw, 35px);

    > span {
      opacity: 0.4;
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
      opacity: 0.7;
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
