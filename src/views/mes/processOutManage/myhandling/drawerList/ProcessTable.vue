<template>
  <div class="process-table" v-loading="loading">
    <!-- 工具栏 -->
    <div class="toolbar" v-if="toolbarShow">
      <div class="toolbar-left">
        <el-button size="small" @click="addRow" :disabled="disabled">添加工艺</el-button>
        <el-button size="small" :disabled="deleteDisabled || disabled" @click="removeSelected"
          >删除</el-button
        >
      </div>
      <div class="toolbar-right" v-if="localNewOrEditLen">
        <el-tag size="small">已添加\编辑：{{ localNewOrEditLen }}条</el-tag>
        <el-button size="small" type="primary" @click="batchSave">批量保存</el-button>
      </div>
    </div>

    <!-- 表格 -->
    <div class="table-container">
      <el-table
        ref="tableRef"
        :data="rowsInner"
        border
        size="small"
        height="100%"
        @selection-change="onSelectionChange"
        @row-click="onRowClick"
        :row-key="rowKeyGetter"
        :row-class-name="tableRowClassName"
      >
        <el-table-column
          v-if="!disabled"
          type="selection"
          width="48"
          :selectable="rowSelectable"
          align="center"
        />
        <el-table-column type="index" label="序号" width="60" align="center" />

        <!-- 工艺名称（仅新增行可编辑：前端搜索，全局 options 共用） -->
        <el-table-column prop="processName" :label="labels.processName" min-width="220">
          <template #default="{ row }">
            <el-select
              v-if="row.$editing"
              v-model="row.processId"
              size="small"
              filterable
              :loading="processLoading"
              placeholder="搜索并选择工艺名称"
              style="width: 100%"
              @change="() => onProcessPicked(row)"
            >
              <el-option
                v-for="opt in processOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
            <span v-else>{{ row.processName || '-' }}</span>
          </template>
        </el-table-column>

        <!-- 类型：由所选工艺自动带出，整体只读展示 -->
        <el-table-column prop="orderType" :label="labels.orderType" width="150">
          <template #default="{ row }">
            <dc-dict-key :options="dicts.DC_FORWARD_TYPE" :value="row.orderType" />
          </template>
        </el-table-column>

        <!-- 计划数量：新增显示 '-'，其他显示数字 -->
        <el-table-column prop="plannedQty" :label="labels.plannedQty" width="90" align="center">
          <template #default="{ row }">
            <span>{{ row.$localNew ? '-' : row.plannedQty ?? '-' }}</span>
          </template>
        </el-table-column>

        <!-- 已发数量：新增显示 '-'，其他显示数字 -->
        <el-table-column prop="issuedQty" :label="labels.issuedQty" width="90" align="center">
          <template #default="{ row }">
            <span>{{ row.$localNew ? '-' : row.issuedQty ?? 0 }}</span>
          </template>
        </el-table-column>

        <!-- 已收数量：新增显示 '-'，其他显示数字 -->
        <el-table-column prop="receivedQty" :label="labels.receivedQty" width="90" align="center">
          <template #default="{ row }">
            <span>{{ row.$localNew ? '-' : row.receivedQty ?? 0 }}</span>
          </template>
        </el-table-column>

        <!-- 状态：新增显示 '未保存'（只读），其他走字典 -->
        <el-table-column prop="orderStatus" :label="labels.orderStatus" width="100">
          <template #default="{ row }">
            <span v-if="row.$localNew" class="unsaved">未保存</span>
            <dc-dict-key v-else :options="dicts.DC_FORWARD_STATUS" :value="row.orderStatus" />
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import Api from '@/api';

let __uid__ = 1;
const genUid = () => `__tmp_${Date.now()}_${__uid__++}`;

export default {
  name: 'ProcessTable',
  props: {
    /** 若传入，则优先作为接口请求的 orderId；否则回退路由 query.id */
    orderId: { type: [String, Number], default: null },
    rowKey: { type: String, default: 'id' },
    labels: {
      type: Object,
      default: () => ({
        processName: '工艺',
        orderType: '类型',
        plannedQty: '计划',
        issuedQty: '已发',
        receivedQty: '已收',
        orderStatus: '状态',
      }),
    },
    typeDict: { type: String, default: 'DC_FORWARD_TYPE' },
    statusDict: { type: String, default: 'DC_FORWARD_STATUS' },
    disabled: { type: Boolean, default: false },
    detailData: { type: Object, default: null }, // 用于拉取工艺库
    toolbarShow: { type: Boolean, default: true },
  },
  dicts: ['DC_FORWARD_TYPE', 'DC_FORWARD_STATUS'],
  emits: ['add', 'delete', 'saved', 'selection-change'],
  data() {
    return {
      loading: false,
      routeId: null,
      routeType: null,

      rowsInner: [],
      selected: [],

      // 全局工艺选项（一次拉取，所有行共用）
      processOptions: [], // [{label, value, type, raw}]
      processLoading: false,
    };
  },
  computed: {
    deleteDisabled() {
      return !this.selected.length;
    },
    localNewOrEditLen() {
      return this.rowsInner.filter(row => row.$localNew || row.$localEdit).length;
    },
    /** 统一取得当前使用的订单ID */
    currentOrderId() {
      return this.orderId ?? this.routeId;
    },
  },
  created() {
    const { id, type } = this.$route?.query || {};
    this.routeId = id || null;
    this.routeType = type || null;
    this.getData();
    // 首次进入就尝试拉一次选项
    this.loadProcessOptions();
  },
  watch: {
    orderId() {
      this.getData();
    },
    detailData: {
      deep: true,
      handler() {
        // 订单/物料切换时，重拉可选工艺
        this.loadProcessOptions();
      },
    },
  },
  methods: {
    /* ---------- 通用 ---------- */
    decorateRows(list = []) {
      return list.map(r => ({ $uid: genUid(), ...r }));
    },
    rowKeyGetter(row) {
      return row?.[this.rowKey] ?? row?.$uid;
    },
    dictOptions(key) {
      return this.dicts?.[key] || [];
    },
    isEditable(row) {
      return !!row.$localNew; // 仅新增行允许编辑“工艺名称”
    },

    /* ---------- 数据加载 ---------- */
    async getData() {
      if (!this.currentOrderId) return;
      try {
        this.loading = true;
        const res = await Api.mes.forwardItem.getForwardItem({ orderId: this.currentOrderId });
        const { code, data, message } = res?.data || {};
        if (code !== 200) throw new Error(message || '获取数据失败');

        const list = Array.isArray(data?.records) ? data.records : [];
        const mapped = list.map(it => ({
          ...it,
          [this.rowKey]: it[this.rowKey],
          processName: it.processName ?? '',
          orderType: it.orderType ?? '',
          plannedQty: Number(it.plannedQty ?? 0),
          issuedQty: Number(it.issuedQty ?? 0),
          receivedQty: Number(it.receivedQty ?? 0),
          orderStatus: it.orderStatus ?? 'DC_FORWARD_STATUS_WKS',
          $editing: false,
          $localNew: false,
          $localEdit: false,
        }));
        this.rowsInner = this.decorateRows(mapped);
      } catch (e) {
        console.error(e);
        this.$message.error(e.message || '加载失败');
      } finally {
        this.loading = false;
      }
    },

    /* ---------- 工艺库：一次拉取，前端过滤 ---------- */
    async loadProcessOptions() {
      // 依据 detailData 里的物料/来源单信息拉取一次“可选工艺库”
      this.processLoading = true;
      try {
        const res = await Api.mes.forward.getTechnologyList();
        // 支持 records / data / root
        const list = res?.data?.data?.records || res?.data?.data || res?.data || [];
        // 统一映射：label(展示)，value(工艺ID)，type(工艺类型编码)
        this.processOptions = (list || []).map(it => {
          const typeLabel = this.dicts.DC_FORWARD_TYPE.find(d => d.value === it.orderType).label;
          return {
            label: it.processName + `(${typeLabel})` || '',
            value: it.processId || '',
            type: it.orderType || '', // 用于带出 orderType
            state: it.orderStatus || '',
            raw: it,
          };
        });
      } catch (e) {
        console.error(e);
        this.processOptions = [];
      } finally {
        this.processLoading = false;
      }
    },

    /* ---------- 表格交互 ---------- */
    onSelectionChange(rows) {
      this.selected = rows;
      this.$emit('selection-change', [...rows]);
    },
    onRowClick(row, column, event) {
      if (this.disabled) return;
      const el = event?.target;
      if (el?.closest?.('input,textarea,select,.el-input,.el-select,.el-input-number')) return;
      if (column?.type === 'selection' || column?.property === undefined) return;
      if (!this.isEditable(row)) return;
      this.enterEdit(row);
    },
    enterEdit(row) {
      if (!this.isEditable(row)) return;
      this.rowsInner.forEach(r => (r.$editing = false));
      row.$editing = true;
      row.$localEdit = true;
    },

    /* ---------- 新增 / 删除 / 批量保存 ---------- */
    addRow() {
      const unstartKey =
        this.dicts.DC_FORWARD_STATUS?.find(d => d.label === '未开始')?.value ??
        'DC_FORWARD_STATUS_WKS';
      const row = {
        [this.rowKey]: undefined,
        $uid: genUid(),
        processName: '',
        processId: undefined,
        orderType: '', // 将由选中的工艺自动带出
        plannedQty: 0,
        issuedQty: 0,
        receivedQty: 0,
        orderStatus: unstartKey,
        processOrder: this.rowsInner.length,
        $editing: true,
        $localNew: true,
        $localEdit: false,
      };
      this.rowsInner.push(row);
      this.$emit('add', row);
    },

    async removeSelected() {
      if (!this.selected.length) return;

      // 新规则：未开始 & 未保存 都允许删除
      // 1) 先计算需要删除的所有选中行
      const allSelected = [...this.selected];

      // 2) 本地移除全部选中行
      const selectedUidSet = new Set(allSelected.map(r => r.$uid));
      const serverRows = allSelected.filter(r => r[this.rowKey]);
      this.rowsInner = this.rowsInner.filter(r => !selectedUidSet.has(r.$uid));

      // 3) 调后端删除已存在服务端的行
      const ids = serverRows.map(r => r[this.rowKey]).filter(Boolean);
      if (ids.length) {
        try {
          this.loading = true;
          await Api.mes.forwardItem.removeForwardItem({ ids: ids.join(',') });
          this.$message.success('删除成功');
          this.$emit('delete');
        } catch (e) {
          console.error(e);
          this.$message.error('部分数据删除失败，请刷新后核对');
        } finally {
          this.loading = false;
        }
      }

      // 4) 清空选中
      this.selected = [];
    },

    validateRows(rows) {
      for (const [index, row] of rows.entries()) {
        if (!row.processName || !row.orderType) {
          this.$message.error(`第 ${index + 1} 条新增：工艺或类型不能为空`);
          return false;
        }
      }
      return true;
    },

    async batchSave() {
      const needSave = this.rowsInner.filter(r => r.$localNew || r.$localEdit);
      if (!needSave.length) return this.$message.warning('没有需要保存的数据');
      if (!this.currentOrderId) return this.$message.error('缺少订单 id');
      if (!this.validateRows(needSave)) return;

      this.loading = true;
      const form = {
        id: this.currentOrderId,
        items: needSave.map(row => ({
          [this.rowKey]: row[this.rowKey],
          processId: row.processId, // ✅ 推荐提交工艺ID
          processName: row.processName, // 若后端仍需名称，也带上
          orderType: row.orderType, // 由工艺元数据带出
          plannedQty: row.plannedQty,
          issuedQty: row.issuedQty,
          receivedQty: row.receivedQty,
          orderStatus: row.orderStatus,
          processOrder: row.processOrder,
        })),
      };
      try {
        const res = await Api.mes.forwardItem.submitForwardItem(form);
        const { code } = res?.data || {};
        if (code === 200) {
          this.$message.success('批量保存成功');
          this.$emit('saved');
          await this.getData();
        }
      } finally {
        this.loading = false;
      }
    },

    /* ---------- 选择工艺后：带出 ID + 类型 ---------- */
    onProcessPicked(row) {
      const hit = this.processOptions.find(o => o.value === row.processId);
      row.orderType = hit?.type || ''; // 类型由工艺元数据带出
      row.orderStatus = hit?.state || ''; // 状态由工艺元数据带出
      row.processName = hit?.raw?.processName || ''; // 状态由工艺元数据带出
      // 进入编辑时已置 $localEdit；新增场景也会被包含在 needSave 中
    },

    /* ---------- 行样式 / 选择控制 ---------- */
    tableRowClassName({ row }) {
      if (row.orderStatus === 'DC_FORWARD_STATUS_JXZ') return 'jxz-row';
      if (row.orderStatus === 'DC_FORWARD_STATUS_YWC') return 'ywc-row';
      return '';
    },
    isCompletedRow(row) {
      const completedSet = new Set(['DC_FORWARD_STATUS_YWC']);
      return completedSet.has(row?.orderStatus);
    },
    // 允许“未开始”和“未保存”选中；仍禁止“已完成”被选中
    rowSelectable(row) {
      return !this.isCompletedRow(row);
    },

    /* ---------- 对外暴露 ---------- */
    getUnsavedCount() {
      return this.rowsInner.filter(r => r.$localNew || r.$localEdit).length;
    },
    hasUnsaved() {
      return this.getUnsavedCount() > 0;
    },
    getSelectedRows() {
      return [...this.selected];
    },
    getSelectedKeys() {
      return this.selected.map(r => r?.[this.rowKey] ?? r?.$uid).filter(Boolean);
    },
    getSelectedServerIds() {
      return this.selected.map(r => r?.[this.rowKey]).filter(Boolean);
    },
    getAllServerRows({ excludeCompleted = false } = {}) {
      const hasId = r => Boolean(r?.[this.rowKey]);
      const rows = this.rowsInner.filter(hasId);
      return excludeCompleted ? rows.filter(r => !this.isCompletedRow?.(r)) : rows;
    },
    getAllServerIds({ excludeCompleted = false } = {}) {
      return this.getAllServerRows({ excludeCompleted }).map(r => r[this.rowKey]);
    },
  },
};
</script>

<style lang="scss">
.jxz-row {
  .el-table__cell {
    color: #1d65f3;
    .dict-text {
      color: #1d65f3;
    }
  }
}
.ywc-row {
  .el-table__cell {
    color: #67c23a;
    .dict-text {
      color: #67c23a;
    }
  }
}
</style>
<style lang="scss" scoped>
.process-table {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}
.table-container {
  flex: 1;
  overflow: hidden;
}
.toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  justify-content: space-between;
  &-right,
  &-left {
    display: flex;
    align-items: center;
  }
  &-right {
    gap: 5px;
  }
}
.unsaved {
  color: #f59e0b;
} /* “未保存”提示色 */
</style>
