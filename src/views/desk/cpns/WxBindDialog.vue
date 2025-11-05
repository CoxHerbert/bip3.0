<!-- WxBindDialog.vue -->
<template>
  <el-dialog
    :model-value="visible"
    width="400px"
    align-center
    destroy-on-close
    :close-on-click-modal="false"
    :before-close="handleClose"
    close-icon="CircleCloseFilled"
    class="wx-bind-dialog"
  >
    <template #header>
      <div class="dialog-header">
        {{ titleText }}
      </div>
    </template>
    <!-- 确认态 -->
    <div v-if="payload.bindWx !== true" class="confirm-wrap">
      <p class="confirm-tip">
        是否确认绑定企业微信，绑定企业微信后，您当前的设置将在 BIP2.0 系统中生效，
        后续可扫码直接进入 BIP2.0！如果确认请注意短信消息！
      </p>
    </div>

    <!-- 成功态 -->
    <div v-else class="success-wrap">
      <img class="success-icon" src="/img/desk/success-icon.svg" alt="" srcset="" />
      <div class="success-text">企业微信授权绑定成功</div>
    </div>

    <!-- 底部按钮（仅确认态显示） -->
    <template #footer v-if="payload.bindWx !== true">
      <div class="footer-btns">
        <el-button :disabled="submitting" @click="onCancel">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="onConfirm">确认</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { wechatCreate } from '@/api/system/user';

// ✅ 这里直接用 defineProps（对象式），不要用 withDefaults
const props = defineProps({
  visible: { type: Boolean, default: false },
  payload: { type: Object, default: () => ({}) },
  // 可注入自定义绑定函数：(payload) => Promise<{code?:number,success?:boolean,msg?:string}>
  bindFn: { type: Function, default: null },
  // 成功后自动关闭的毫秒：传 0 不自动关
  autoCloseAfter: { type: Number, default: 1200 },
  title: { type: String, default: '' },
});

const emit = defineEmits(['update:visible', 'success', 'error', 'closed']);

const titleText = computed(() => props.title || '企业微信绑定提示');
const submitting = ref(false);
let timer = null;

watch(
  () => props.visible,
  v => {
    if (v) {
      submitting.value = false;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    }
  }
);

function onCancel() {
  handleClose();
}

async function onConfirm() {
  if (submitting.value) return;
  submitting.value = true;
  try {
    const res = await wechatCreate(props.payload.userId || {});
    const { code, data } = res.data;
    const ok = code === 200;
    if (!ok) throw new Error(res?.msg || '绑定失败');
    emit('success', res);

    if (props.autoCloseAfter > 0) {
      timer = setTimeout(() => handleClose(), props.autoCloseAfter);
    }
  } catch (err) {
    ElMessage.error(err?.message || '绑定失败，请稍后重试');
    emit('error', err);
  } finally {
    submitting.value = false;
  }
}

function handleClose() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  emit('update:visible', false);
  emit('closed');
}
</script>

<style lang="scss">
.wx-bind-dialog {
  border-radius: 16px;
  .dialog-header {
    width: 144px;
    height: 18px;
    font-family: Source Han Sans CN, Source Han Sans CN;
    font-weight: bold;
    font-size: 18px;
    color: #333333;
    line-height: 18px;
    text-align: left;
    font-style: normal;
    text-transform: none;
  }
  .confirm-tip {
    padding: 36px 0;
    margin: auto;
    width: 348px;
    font-weight: 400;
    font-size: 20px;
    color: #333333;
    line-height: 32px;
    text-align: center;
    font-style: normal;
    text-transform: none;
  }
  .success-wrap {
    padding: 6px 0 2px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .success-icon {
    width: 140px;
    height: 140px;
    border-radius: 50%;
    background: #e8f7ef;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 30px 0 14px;
    .el-icon {
      font-size: 72px;
    }
  }
  .success-text {
    margin: 20px 0 40px;
    font-weight: 400;
    font-size: 20px;
    color: #23c69f;
    line-height: 24px;
    text-align: center;
    font-style: normal;
    text-transform: none;
  }

  .footer-btns {
    padding: 12px 0;
    display: flex;
    justify-content: center;
    gap: 12px;
  }
}
</style>
