<template>
  <div class="settings-page">
    <el-card class="settings-card" shadow="never">
      <h2 class="settings-title">调试设置</h2>
      <div class="settings-row">
        <div>
          <div class="settings-label">vConsole 调试面板</div>
          <div class="settings-desc">在移动端页面中启用轻量调试面板，便于查看日志信息。</div>
        </div>
        <el-switch
          v-model="enabled"
          :loading="loading"
          active-text="已开启"
          inactive-text="已关闭"
          @change="handleToggle"
        />
      </div>
      <el-alert
        class="settings-tip"
        type="info"
        :closable="false"
        title="切换开关会立即生效，并同步保存到浏览器本地存储。"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { enableVConsole, disableVConsole, isVConsolePersistedEnabled } from '@/plugins/vconsole';

const enabled = ref(false);
const loading = ref(false);

onMounted(() => {
  enabled.value = isVConsolePersistedEnabled();
});

const handleToggle = async value => {
  loading.value = true;
  try {
    if (value) {
      await enableVConsole();
      ElMessage.success('vConsole 已启用');
    } else {
      disableVConsole();
      ElMessage.success('vConsole 已关闭');
    }
  } catch (error) {
    console.error('启用 vConsole 失败', error);
    ElMessage.error('切换失败，请稍后重试');
    enabled.value = !value;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #f5f7fa 0%, #eef2f6 100%);
  padding: 24px;
  box-sizing: border-box;
}

.settings-card {
  max-width: 520px;
  width: 100%;
  padding: 32px;
}

.settings-title {
  margin: 0 0 24px;
  font-size: 22px;
  font-weight: 600;
  color: #1f2d3d;
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 20px;
}

.settings-label {
  font-size: 16px;
  font-weight: 500;
  color: #1f2d3d;
}

.settings-desc {
  margin-top: 6px;
  font-size: 13px;
  color: #606266;
  max-width: 320px;
}

.settings-tip {
  margin-top: 12px;
}

@media (max-width: 560px) {
  .settings-card {
    padding: 24px;
  }

  .settings-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .settings-desc {
    max-width: 100%;
  }
}
</style>
