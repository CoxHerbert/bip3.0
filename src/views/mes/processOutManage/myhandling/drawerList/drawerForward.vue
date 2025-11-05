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
        <div>工艺转发</div>
        <div class="header-desc">[工艺单] {{ detailData?.processNo || '-' }}</div>
      </div>
    </template>

    <!-- 主体 -->
    <div class="drawer-body">
      <!-- 上半部分：工艺表格 -->
      <ProcessTable
        ref="ptRef"
        :order-id="detailData?.id || orderId"
        :disabled="false"
        :detailData="detailData"
        @saved="onSaved"
      />

      <!-- 下半部分：转单表单 -->
      <div class="transfer-form">
        <el-divider>转单信息</el-divider>
        <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" size="small">
          <el-form-item label="工序单号" prop="processNo">
            <el-input v-model="form.processNo" placeholder="<系统带入>" disabled />
          </el-form-item>

          <el-form-item label="转单类型" prop="transferType">
            <el-radio-group
              v-model="form.transferType"
              @change="
                val => {
                  handleFormItemChange('transferType', val);
                }
              "
            >
              <el-radio-button
                v-for="dict in dicts.DC_FORWARD_TYPE"
                :label="dict.value"
                :key="dict.value"
              >
                {{ dict.label }}
              </el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="已选工艺" prop="processIds" v-if="!!form.transferType">
            <el-select
              v-model="form.processIds"
              multiple
              :multiple-limit="form.transferType === 'DC_FORWARD_TYPE_WW' ? 1 : 0"
              placeholder="请选择工艺"
              style="width: 100%"
              @change="
                val => {
                  handleFormItemChange('processIds', val);
                }
              "
            >
              <el-option
                v-for="(opt, i) in processOptions?.[form?.transferType] || []"
                :label="opt.processName"
                :value="opt.id"
                :key="i"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="转单数量" prop="transferQty">
            <el-input-number
              v-model="form.transferQty"
              :min="1"
              :max="detailData?.plannedQty"
              :step="1"
              controls-position="right"
              style="width: 100%"
              @change="syncTotalPrice"
            />
          </el-form-item>

          <el-form-item label="负责人" prop="userId" v-if="!!form?.processIds?.length">
            <el-select v-model="form.userId" placeholder="选择负责人" style="width: 100%">
              <el-option
                v-for="(opt, i) in chargePersonList"
                :label="opt.realName"
                :value="opt.id"
                :key="i"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <!-- 底部按钮 -->
    <template #footer>
      <div class="footer-wrap">
        <el-button type="primary" :loading="saving" @click="handleTransfer">工艺转发</el-button>
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
      processOptions: [],
      chargePersonList: [],
      form: {
        processNo: '',
        transferType: '',
        processIds: [],
        transferQty: 0,
        userId: null,
      },
      rules: {
        processNo: [{ required: true, message: '工序单号为必填项', trigger: 'blur' }],
        processIds: [{ required: true, message: '工艺为必选项', trigger: 'blur' }],
        transferType: [{ required: true, message: '类型必选项', trigger: 'blur' }],
        transferQty: [{ required: true, message: '请输入数量', trigger: 'blur' }],
        userId: [{ required: true, message: '请选择负责人', trigger: 'change' }],
      },
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
    /** 外部打开 */
    openDrawer({ row, ids }) {
      this.visible = true;
      this.detailData = row;
      this.ids = ids || [];
      this.form.processNo = row?.processNo || '';
      this.form.transferQty = row?.plannedQty || 1;
      this.getChooseProcess();
    },
    handleFormItemChange(prop, val) {
      if (prop === 'processIds') {
        if (this.form.processIds.length) {
          this.getChargePersonList();
        }
        this.form.userId = null;
      }else if(prop === 'transferType') {
        this.form.processIds = null;
        this.form.userId = null;
      }
    },
    async getChargePersonList() {
      try {
        if (!this.form.processIds || !this.form.processIds.length) {
          return;
        }
        const params = {
          processIds: this.form.processIds.join(','),
        };
        const res = await Api.mes.forward.getChargePersonList(params);
        const { code, data } = res.data;
        if (code === 200) {
          this.chargePersonList = data;
        }
      } catch (err) {
        console.error(err);
      }
    },
    /** 工艺选项获取 */
    async getChooseProcess() {
      try {
        const params = {
          ...this.detailData,
          currentOpsData: JSON.stringify(this.detailData?.currentOpsData),
        };
        const res = await Api.mes.transfer.getChooseProcess(params);
        const { code, data } = res.data;
        if (code === 200) {
          this.processOptions = data;
        }
      } catch (err) {
        console.error(err);
      }
    },

    async handleTransfer() {
      const unsaved = this.$refs.ptRef?.getUnsavedCount?.() ?? 0;
      if (unsaved > 0) {
        this.$message.warning(`还有 ${unsaved} 条未保存数据，请在表格中批量保存后再进行转单`);
        return;
      }

      this.$refs.formRef.validate(async valid => {
        if (!valid) return;
        try {
          this.saving = true;
          const payload = {
            ...this.form,
            orderId: this.detailData?.id,
          };
          // 调用后端接口
          await Api.mes.forward.postOrderTransfer(payload);
          this.$message.success('工艺转发成功');
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
      this.form = {
        processNo: '',
        transferType: '',
        processIds: [],
        transferQty: 0,
        userId: null,
      };
    },

    onSaved() {
      this.getChooseProcess();
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
</style>
