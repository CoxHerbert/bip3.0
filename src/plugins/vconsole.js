import { STORAGE_KEY } from '@/const/key';

let instance = null;
let creating = null;

function setPersistedState(value) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY.VCONSOLE_ENABLED, value ? '1' : '0');
  } catch (e) {}
}

export function isVConsolePersistedEnabled() {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY.VCONSOLE_ENABLED) === '1';
  } catch (e) {
    return false;
  }
}

function createVConsole() {
  if (typeof window === 'undefined') {
    return Promise.resolve(null);
  }
  if (!creating) {
    creating = import('vconsole')
      .then(({ default: VConsole }) => {
        const vcInstance = new VConsole();
        instance = vcInstance;
        creating = null;
        return vcInstance;
      })
      .catch(error => {
        creating = null;
        throw error;
      });
  }
  return creating;
}

export function enableVConsole() {
  if (instance) {
    setPersistedState(true);
    return Promise.resolve(instance);
  }
  return createVConsole().then(vcInstance => {
    setPersistedState(true);
    return vcInstance;
  });
}

export function disableVConsole() {
  setPersistedState(false);
  if (creating) {
    creating = null;
  }
  if (instance && typeof instance.destroy === 'function') {
    instance.destroy();
  }
  instance = null;
}

export function getVConsoleInstance() {
  return instance;
}

export function initVConsole() {
  if (!isVConsolePersistedEnabled()) {
    return;
  }
  enableVConsole().catch(error => {
    console.error('[vConsole] 初始化失败', error);
  });
}
