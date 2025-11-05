<template>
  <el-drawer
    v-model="visible"
    size="900px"
    append-to-body
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleClose"
  >
    <!-- 标题 -->
    <template #header>
      <div class="header-wrap">
        <div>供应商下达</div>
        <div class="header-desc">[工艺单] {{ detailData?.processNo || '-' }}</div>
      </div>
    </template>
    <!-- 主体 -->
    <div class="drawer-body">
      <!-- 上半部分：工艺表格（仅用于查看/选择，但提交不依赖这里的选择） -->
      <ProcessTable
        ref="ptRef"
        :order-id="detailData?.id || orderId"
        :disabled="false"
        :detailData="detailData"
        :toolbarShow="false"
        @saved="onSaved"
      />

      <!-- 下半部分：转单表单 -->
      <div class="transfer-form">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" size="small">
          <el-form-item label="转单类型" prop="transferType">
            <el-radio-group v-model="form.transferType" disabled>
              <el-radio-button
                v-for="dict in dicts.DC_FORWARD_TYPE"
                :label="dict.value"
                :key="dict.value"
              >
                {{ dict.label }}
              </el-radio-button>
            </el-radio-group>
          </el-form-item>
          <!-- 已选工艺：由 getTransferById 带出，仅展示，不可编辑 -->
          <el-form-item label="已选工艺" prop="processIds">
            <el-select
              v-model="form.processIds"
              placeholder="<系统带入>"
              multiple
              disabled
              style="width: 100%"
            >
              <el-option
                v-for="p in selectedProcess"
                :key="p.id"
                :label="p.processName"
                :value="p.id"
              />
            </el-select>
          </el-form-item>
          <!-- 来源采购说明（展示型，可按需删除） -->
          <el-form-item label="来源采购">
            <wf-select-dialog v-model="form.userId" objectName="user" :disabled="true" />
          </el-form-item>
          <el-divider></el-divider>

          <!-- 供应商：外协必填；选择时同时带出 supplierId -->
          <el-form-item
            label="供应商"
            prop="supplierNo"
            v-if="form.transferType === 'DC_FORWARD_TYPE_WW'"
          >
            <dc-supplier-select
              v-model="form.supplierNo"
              placeholder="请输入供应商名称查询选择"
              size="small"
              @change="onSupplierChange"
            />
          </el-form-item>
          <el-form-item label="转单数量" prop="transferQty">
            <el-input-number
              v-model="form.transferQty"
              :min="1"
              :max="detailData?.plannedQty"
              :step="1"
              controls-position="right"
              style="width: 100%"
              disabled
            />
          </el-form-item>

          <!-- 单价：由 getTransferById 带出，只展示不可编辑 -->
          <el-form-item
            label="单价"
            prop="unitPrice"
            v-if="form.transferType === 'DC_FORWARD_TYPE_WW'"
          >
            <el-input-number
              v-model="form.unitPrice"
              :min="0"
              :precision="2"
              :step="0.1"
              controls-position="right"
              style="width: 100%"
              @change="syncTotalPrice"
            />
            <!-- 若希望可编辑，去掉上面的 disabled 即可 -->
          </el-form-item>

          <el-form-item
            label="总价"
            prop="totalPrice"
            v-if="form.transferType === 'DC_FORWARD_TYPE_WW'"
          >
            <el-input v-model="form.totalPrice" placeholder="自动=单价×数量，可改" />
            <!-- 若希望只读展示：加 disabled -->
          </el-form-item>

          <!-- 交期：要求到秒，使用 datetime -->
          <el-form-item label="交期" prop="deliveryTime">
            <el-date-picker
              v-model="form.deliveryTime"
              type="date"
              placeholder="选择交期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="footer-wrap">
        <el-button type="primary" :loading="saving" @click="handleTransfer">供应商下达</el-button>
        <el-button :disabled="saving" @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script>
import ProcessTable from './ProcessTable.vue';
import dcSupplierSelect from './../../outDoc/addOrEdit/dc-supplier-select.vue';
import Api from '@/api';

export default {
  name: 'ProcessTransferDrawer',
  components: { ProcessTable, dcSupplierSelect },
  dicts: ['DC_FORWARD_TYPE', 'DC_FORWARD_STATUS'],
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
      ids: [],
      form: {
        supplierId: null, // number
        supplierNo: '', // string
        unitPrice: null, // number
        totalPrice: 0, // number
        transferQty: 0, // integer
        deliveryTime: '', // 'YYYY-MM-DD HH:mm:ss'
        processIds: [], // string[]
        userId: null, // 负责人（你那边业务要求）
      },
      rules: {
        supplierId: [{ required: true, message: '请选择供应商', trigger: 'change' }],
        supplierNo: [{ required: true, message: '请选择供应商', trigger: 'change' }],
        unitPrice: [{ required: true, message: '请输入单价', trigger: 'blur' }],
        totalPrice: [{ required: true, message: '请输入总价', trigger: 'blur' }],
        transferQty: [{ required: true, message: '请输入数量', trigger: 'blur' }],
        deliveryTime: [{ required: true, message: '请选择交期', trigger: 'change' }],
        processIds: [{ required: true, message: '工艺为必选项', trigger: 'change' }],
        userId: [{ required: true, message: '请选择负责人', trigger: 'change' }],
      },
    };
  },
  computed: {
    selectedProcess() {
      // 1) 取表格已勾选的行（优先用对外方法）
      const selected = this.$refs.ptRef?.getAllServerRows?.() ?? [];

      // 2) 当前类型对应的允许选项
      const t = this.form.transferType;
      const opts = this.processOptions?.[t];

      // 兼容：opts 可能是 [1,2,3] 或 [{id:1}, {id:2}]
      let allowIdSet = null;
      if (Array.isArray(opts) && opts.length) {
        allowIdSet = new Set(typeof opts[0] === 'object' ? opts.map(o => o.id) : opts);
      }

      // 3) 过滤：有有效ID、（如有 allowIdSet 则在白名单内）、且不是已完成行
      return selected.filter(r => {
        const pid = r.id ?? r.processId;
        if (!pid) return false;
        if (allowIdSet && !allowIdSet.has(pid)) return false;
        // 如需严控“已完成”不可转发，借助表格方法判断
        if (this.$refs.ptRef?.isCompletedRow?.(r)) return false;
        return true;
      });
    },
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
    /** 外部打开：拿到行数据后，先预填，再请求 getTransferById 带出“工艺+单价”等 */
    async openDrawer({ row, ids }) {
      this.visible = true;
      this.detailData = row;
      this.ids = ids || [];

      // 交期默认 = 今天 23:59:59
      if (!this.form.deliveryTime) {
        const dt = new Date();
        dt.setHours(23, 59, 59, 0);
        const pad = n => String(n).padStart(2, '0');
        this.form.deliveryTime = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(
          dt.getDate()
        )} ${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`;
      }

      // 拉取：工艺 + 单价（不可编辑）
      await this.fetchTransferPrefill();
      this.syncTotalPrice();
    },

    /** 从后端带出：工艺（processIds + 名称）与 单价 */
    async fetchTransferPrefill() {
      try {
        const res = await Api.mes.transfer.getTransferById({ id: this.ids[0] });
        const { code, data } = res?.data || {};
        if (code === 200 && data) {
          this.form.processIds = data?.processIds;
          this.form.transferQty = data?.transferQty;
          this.form.transferType = data?.transferType;
          this.form.userId = data?.userId;
          this.form.id = data?.id;
        }
      } catch (e) {
        console.error(e);
        this.$message.error('获取转单基础信息失败');
      }
    },

    /** 供应商选择变化：同时回填 supplierId / supplierNo */
    onSupplierChange(val) {
      // dc-supplier-select 通常回传一个对象，按你的旧逻辑兼容两种键位
      this.form.supplierId = val?.supplierId || null;
    },

    /** 自动联动总价 */
    syncTotalPrice() {
      const price = Number(this.form.unitPrice || 0);
      const qty = Number(this.form.transferQty || 0);
      this.form.totalPrice = +(price * qty).toFixed(2);
    },

    /** 提交：Api.mes.transfer.postErpTransfer */
    async handleTransfer() {
      // 要求：表格内如有未保存数据需先保存
      const unsaved = this.$refs.ptRef?.getUnsavedCount?.() ?? 0;
      if (unsaved > 0) {
        this.$message.warning(`还有 ${unsaved} 条未保存数据，请在表格中批量保存后再进行下达`);
        return;
      }

      this.$refs.formRef.validate(async valid => {
        if (!valid) return;
        try {
          this.saving = true;
          console.log(this.form);
          const payload = {
            ...this.form,
            processNo: this.detailData.processNo,
          };

          await Api.mes.transfer.postErpTransfer(payload);
          this.$message.success('供应商下达成功');
          this.$emit('success', payload);
          this.handleClose();
        } catch (err) {
          console.error(err);
        } finally {
          this.saving = false;
        }
      });
    },

    handleClose() {
      this.visible = false;
      this.detailData = null;
      this.ids = [];
      this.chargePersonList = [];
      this.form = {
        id: null,
        supplierId: null,
        supplierNo: '',
        unitPrice: null,
        totalPrice: 0,
        transferQty: 0,
        deliveryTime: '',
        processIds: [],
        userId: null,
      };
    },

    onSaved() {
      // 表格保存成功后，如需刷新选项/限制，可在此处理
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
  gap: 20px;
  min-height: 400px;
  overflow-y: auto;
}
.transfer-form {
  background: #fafafa;
  padding: 16px;
  border-radius: 6px;
}
.footer-wrap {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.text-muted {
  color: var(--el-text-color-secondary);
}
.ml-2 {
  margin-left: 8px;
}
</style>
