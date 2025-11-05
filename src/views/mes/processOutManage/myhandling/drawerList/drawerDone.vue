<template>
  <el-drawer
    v-model="visible"
    size="800px"
    append-to-body
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleClose"
  >
    <template #header>
      <div class="header-wrap">
        <div>标记完成</div>
        <div class="header-desc">[工艺单] {{ detailData?.processNo || '-' }}</div>
      </div>
    </template>

    <div class="drawer-body">
      <ProcessTable
        ref="ptRef"
        :order-id="detailData?.id || orderId"
        :detailData="detailData"
        :disabled="false"
        @saved="onSaved"
      />
    </div>

    <!-- ✅ footer 只保留“标记完成 / 关闭”，去掉“批量保存” -->
    <template #footer>
      <div class="footer-wrap">
        <el-button type="primary" :loading="saving" @click="handleMarkDone">标记完成</el-button>
        <el-button :disabled="saving" @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script>
import ProcessTable from './ProcessTable.vue';
import Api from '@/api'; // 如需调用后端标记完成接口再打开

export default {
  name: 'ProcessFinishDrawer',
  components: { ProcessTable },
  props: {
    modelValue: { type: Boolean, default: false },
    orderId: { type: [String, Number], default: null },
  },
  emits: ['update:modelValue', 'done'],
  data() {
    return {
      visible: false,
      saving: false,
      detailData: null,
      action: null,
      ids: [],
    };
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(v) {
        this.visible = v;
      },
    },
    visible(v) {
      this.$emit('update:modelValue', v);
    },
  },
  methods: {
    openDrawer(options = {}) {
      const { ids, row, action } = options;
      this.ids = ids || [];
      this.detailData = row || null;
      this.action = action || null;
      this.visible = true;
    },

    async handleMarkDone() {
      const unsaved = this.$refs.ptRef?.getUnsavedCount?.() ?? 0;
      if (unsaved > 0) {
        this.$message.warning(
          `还有 ${unsaved} 条未保存数据，请在表格工具栏点击“批量保存”后再标记完成`
        );
        return;
      }

      const selectedRows = this.$refs.ptRef?.getSelectedRows?.() ?? [];
      const selectedIds = this.$refs.ptRef?.getSelectedServerIds?.() ?? [];

      this.saving = true;
      try {
        console.log(this.detailData);
        // TODO: 如需后端标记完成接口，在此调用
        await Api.mes.forward.postMarkComplete({
          processId: this.detailData?.id,
          processItemIds: selectedIds.join(','),
        });

        this.$emit('success', {
          ids: this.ids,
          row: this.detailData,
          action: this.action,
          selectedRows,
          selectedIds,
        });
        this.handleClose();
      } finally {
        this.saving = false;
      }
    },

    onSaved() {
      // 表格保存成功后的回调（保留钩子，不自动关闭）
    },

    handleClose() {
      this.visible = false;
      this.detailData = null;
      this.action = null;
      this.ids = [];
    },
  },
};
</script>

<style scoped lang="scss">
.header-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 20px;
  font-weight: 600;
  .header-desc {
    font-size: 14px;
    color: #606266;
    font-weight: normal;
  }
}
.drawer-body {
  display: flex;
  flex-direction: column;
  min-height: 300px;
}
.footer-wrap {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
