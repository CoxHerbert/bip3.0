<template>
  <el-dialog v-model="dialogVisible" width="500" :title="title" @close="cancel" v-loading="loading">
    <el-form ref="ruleFormRef" :model="formData" label-width="auto">
      <template v-for="(col, i) in columns" :key="col.prop + i">
        <el-form-item :label="col.label" :prop="col.prop" :rules="getColumnRules(col)">
          <dc-widget
            v-if="col.type !== 'el-select' && col.type !== 'radio' && col.type !== 'upload'"
            :data="col"
            :dictMaps="dictMaps"
            v-model="formData[col.prop]"
            @change="
              val => {
                handleFormItemChange(col, val);
              }
            "
          />
          <el-select
            v-else-if="col.type === 'el-select'"
            v-model="formData[col.prop]"
            clearable
            :placeholder="col.props.placeholder"
            filterable
            allow-create
            default-first-option
          >
            <el-option v-for="(item, index) in options" :key="index" :label="item" :value="item" />
          </el-select>
          <el-radio-group v-else-if="col.type === 'radio'" v-model="formData[col.prop]">
            <el-radio v-for="item in col.props.options" :key="item.value" :label="item.value">
              {{ item.label }}
            </el-radio>
          </el-radio-group>
          <dc-upload-img v-else-if="col.type === 'upload'" v-model="formData[col.prop]" limit="1" />
        </el-form-item>
      </template>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" :loading="loading" @click="submitForm()">提交</el-button>
        <el-button @click="cancel()">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script>
import Api from '@/api/index';
import editDialog from '@/mixins/edit-dialog';
import options from './addEditeDialog.js';
export default {
  emits: ['success'],
  name: 'sip-class-add-edite-dialog',
  mixins: [editDialog],
  props: {
    options: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      loading: false,
      columns: options().columns,
      dialogVisible: false,
      formData: {},
      ids: [],
      title: '新增',
      isCopyMode: false,
    };
  },
  created() {
    this.handleDictKeys();
    this.getDictData().then(res => {});
  },
  methods: {
    /** 获取列验证规则 **/
    getColumnRules(col) {
      const rules = [];

      // 基础必填验证
      if (col.required) {
        rules.push({ required: true, message: `请输入${col.label}`, trigger: 'change' });
      }

      return rules;
    },
    /** 处理表单项变化 **/
    handleFormItemChange(col, val) {
      // 处理表单项变化逻辑
    },
    /** 打开添加弹窗 **/
    openDialog(row, isCopy) {
      this.dialogVisible = true;
      this.isCopyMode = !!isCopy;
      this.title = row ? (this.isCopyMode ? '复制' : '编辑') : '新增';
      this.formData = row ? JSON.parse(JSON.stringify(row)) : {};

      // 设置默认值
      if (!row) {
        this.columns.forEach(col => {
          if (col.value !== undefined) {
            this.formData[col.prop] = col.value;
          }
        });
      }
    },
    // 弹出框提交表单
    submitForm() {
      this.$refs.ruleFormRef.validate(async valid => {
        if (valid) {
          this.loading = true;
          let newrow = Object.assign(this.formData, {});

          Api.qms.sn
            .sipTypeSubmit({
              ...newrow,
              id: this.isCopyMode ? undefined : newrow.id,
              copyId: this.isCopyMode ? newrow.id : undefined,
            })
            .then(res => {
              const { code, msg } = res.data;
              if (code === 200) {
                this.cancel();
                this.$emit('success');
                this.$message.success(msg);
              }
              this.loading = false;
            })
            .catch(err => {
              this.loading = false;
              console.error(err);
            });
        }
      });
    },
    cancel() {
      this.dialogVisible = false;
      this.$refs.ruleFormRef?.resetFields();
      this.formData = {};
    },
  },
};
</script>

<style scoped lang="scss">
.dialog-search-box {
  width: 600px;
  display: flex;
  padding-top: 16px;

  :deep(.el-form-item) {
    width: 50%;
    display: inline-flex;

    .el-form-item__content {
      width: calc(100% - 120px);
    }
  }
}
</style>
