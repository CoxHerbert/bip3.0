<template>
  <el-dialog
    :model-value="visible"
    :title="title"
    :width="width"
    :close-on-click-modal="false"
    :destroy-on-close="false"
    @close="handleClose"
  >
    <div class="reference-process-table">
      <!-- 列表 -->
      <el-table
        ref="tableRef"
        :data="list"
        :row-key="rowKey"
        :height="tableHeight"
        :border="true"
        :stripe="true"
        v-loading="loading"
        @selection-change="onSelectionChange"
      >
        <el-table-column type="selection" width="48" :reserve-selection="true" />
        <el-table-column type="index" label="#" width="60" />
        <!-- 工艺名称 -->
        <el-table-column prop="processName" label="工艺名称" min-width="140">
          <template #default="{ row }">
            {{ row.processName || '-' }}
          </template>
        </el-table-column>
        <!-- 工序工艺类型（字典） -->
        <el-table-column prop="orderType" label="订单类型" width="100">
          <template #default="{ row }">
            <dc-dict-key :options="dicts.DC_FORWARD_TYPE" :value="row.orderType" />
          </template>
        </el-table-column>
        <!-- 工序工艺状态（字典） -->
        <el-table-column prop="orderStatus" label="状态" width="80">
          <template #default="{ row }">
            <dc-dict-key :options="dicts.DC_FORWARD_STATUS" :value="row.orderStatus" />
          </template>
        </el-table-column>
      </el-table>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :disabled="selectedRows.length === 0" @click="handleConfirm">
          确定（{{ selectedRows.length }}）
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import Api from '@/api';
import func from '@/utils/func';

export default {
  name: 'ReferenceProcessDialog',
  props: {
    /** 对话框显示控制（受控） */
    visible: { type: Boolean, default: false },
    title: { type: String, default: '选择参考工序' },
    width: { type: [Number, String], default: 600 },

    /** 行唯一键（用于跨页保留选择） */
    rowKey: { type: String, default: 'uid' },

    /** 表格高度（数字或 'auto'），默认 520 */
    tableHeight: { type: [Number, String], default: 520 },

    /** 额外查询参数，会与内置参数合并（如需） */
    extraParams: { type: Object, default: () => ({}) },

    /** 自定义列配置（不传则用默认列） */
    columns: { type: Array, default: null },

    /**
     * 自定义响应解析器
     * 入参：原始 response
     * 出参：{ records: any[], total: number }
     */
    transformResponse: { type: Function, default: null },

    /** 后端需要的源单号 */
    sourceOrderNumber: { type: String, default: null },

    /** 默认选中（用于编辑时回显：数组，元素为完整行或只含 rowKey 的对象/值） */
    defaultSelected: { type: Array, default: () => [] },
  },
  emits: ['update:visible', 'confirm'],
  dicts: ['DC_FORWARD_TYPE', 'DC_FORWARD_STATUS'],
  data() {
    return {
      loading: false,
      list: [],
      selectedRows: [],
    };
  },

  computed: {
    normalizedColumns() {
      const defaults = [
        { prop: 'processNo', label: '工序单号', minWidth: 140 },
        { prop: 'processName', label: '工序名称', minWidth: 160 },
        { prop: 'supplierName', label: '供应商', minWidth: 160 },
        { prop: 'deliveryTime', label: '交期', minWidth: 160 },
      ];
      return this.columns && this.columns.length ? this.columns : defaults;
    },
  },

  watch: {
    // 打开弹窗时加载 & 回显；关闭时统一重置选择
    visible(v) {
      if (v) {
        this.fetchList().then(() => this.applyDefaultSelection());
      } else {
        this.resetSelectionState();
      }
    },
  },

  created() {
    if (this.visible) {
      this.fetchList().then(() => this.applyDefaultSelection());
    }
  },

  methods: {
    /** 发起请求 */
    async fetchList() {
      this.loading = true;
      try {
        const params = {
          sourceOrderNumber: this.sourceOrderNumber,
          ...this.extraParams,
        };
        const res = await Api.mes.forward.getReferenceProcess(params);
        const raw = Array.isArray(res?.data?.data) ? res.data.data : [];
        this.list = raw.map(item => ({
          ...item,
          uid: func.generateUUID(),
        }));
      } catch (err) {
        console.error(err);
        ElMessage.error('获取参考工序列表失败');
        this.list = [];
      } finally {
        this.loading = false;
      }
    },

    /** 选择变更 -> 更新本地 selectedRows */
    onSelectionChange(rows) {
      this.selectedRows = rows;
    },

    /** 清空表格勾选 */
    clearSelection() {
      this.$refs.tableRef && this.$refs.tableRef.clearSelection();
    },

    /** 统一重置本地选择状态 */
    resetSelectionState() {
      this.clearSelection();
      this.selectedRows = [];
    },

    /** 恢复选择（根据 rowKey 与 selectedRows） */
    restoreSelection() {
      const table = this.$refs.tableRef;
      if (!table) return;

      if (!this.selectedRows || this.selectedRows.length === 0) {
        this.clearSelection();
        return;
      }

      const key = this.rowKey;
      const selectedKeySet = new Set(
        this.selectedRows.map(r => r?.[key]).filter(v => v !== undefined && v !== null)
      );

      this.list.forEach(row => {
        if (selectedKeySet.has(row?.[key])) {
          table.toggleRowSelection(row, true);
        }
      });
    },

    /** 根据 defaultSelected 回显 */
    applyDefaultSelection() {
      if (!this.defaultSelected?.length) return;
      const key = this.rowKey;

      // 将 defaultSelected 统一转成 key 集
      const keySet = new Set(
        this.defaultSelected
          .map(r => (typeof r === 'object' ? r?.[key] : r))
          .filter(v => v !== undefined && v !== null)
      );

      // 合并当前已选与当前页可见中命中的行
      const mergedMap = new Map();
      this.selectedRows.forEach(r => mergedMap.set(r[key], r));
      this.list.forEach(row => {
        if (keySet.has(row[key])) mergedMap.set(row[key], row);
      });

      this.selectedRows = Array.from(mergedMap.values());
      this.$nextTick(this.restoreSelection);
    },

    /** 关闭弹窗（不回传） */
    handleClose() {
      this.resetSelectionState();
      this.$emit('update:visible', false);
    },

    /** 确认（回传选中项并关闭） */
    handleConfirm() {
      const rows = this.selectedRows.slice(); // 拷贝一份，避免清空影响回传
      this.resetSelectionState(); // 先清空选择
      this.$emit('confirm', rows); // 回传
      this.$emit('update:visible', false); // 关闭
    },
  },
};
</script>

<style scoped>
.reference-process-table {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
