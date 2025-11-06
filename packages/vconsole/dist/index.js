const STYLE_ID = '__vconsole-mock-style__';
const CLASS_NAME = 'vconsole-mock';
const METHODS = ['log', 'info', 'warn', 'error'];

function ensureStyle() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `.${CLASS_NAME}{position:fixed;bottom:0;left:0;right:0;max-height:50vh;background:rgba(0,0,0,.85);color:#f5f5f5;font-size:12px;line-height:1.4;font-family:Menlo,monospace;z-index:99999;display:flex;flex-direction:column;}.
${CLASS_NAME}__header{padding:6px 10px;border-bottom:1px solid rgba(255,255,255,.2);display:flex;justify-content:space-between;align-items:center;font-weight:600;}.
${CLASS_NAME}__body{flex:1;overflow:auto;padding:8px 10px;white-space:pre-wrap;word-break:break-all;}.
${CLASS_NAME}__close{cursor:pointer;color:#f28b82;}`;
  document.head.appendChild(style);
}

function formatArgs(args) {
  return args
    .map(item => {
      if (typeof item === 'object') {
        try {
          return JSON.stringify(item, null, 2);
        } catch (e) {
          return Object.prototype.toString.call(item);
        }
      }
      return String(item);
    })
    .join(' ');
}

export default class VConsole {
  constructor(options = {}) {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }
    this.options = options;
    ensureStyle();
    this.container = document.createElement('div');
    this.container.className = CLASS_NAME;
    this.container.innerHTML = `<div class="${CLASS_NAME}__header">vConsole<div class="${CLASS_NAME}__close">关闭</div></div><div class="${CLASS_NAME}__body"></div>`;
    this.bodyEl = this.container.querySelector(`.${CLASS_NAME}__body`);
    const closeEl = this.container.querySelector(`.${CLASS_NAME}__close`);
    closeEl.addEventListener('click', () => this.destroy());
    document.body.appendChild(this.container);
    this._patchConsole();
    this._log('info', ['vConsole 已启用']);
  }

  _patchConsole() {
    this._restore = {};
    METHODS.forEach(method => {
      const original = console[method];
      this._restore[method] = original;
      console[method] = (...args) => {
        this._log(method, args);
        if (typeof original === 'function') {
          original.apply(console, args);
        }
      };
    });
  }

  _log(type, args) {
    if (!this.bodyEl) return;
    const line = document.createElement('div');
    line.textContent = `[${type.toUpperCase()}] ${formatArgs(args)}\n`;
    this.bodyEl.appendChild(line);
    this.bodyEl.scrollTop = this.bodyEl.scrollHeight;
  }

  destroy() {
    if (this._restore) {
      METHODS.forEach(method => {
        if (this._restore[method]) {
          console[method] = this._restore[method];
        }
      });
    }
    this._restore = null;
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.bodyEl = null;
    this.container = null;
  }
}
