<template>
  <el-dialog v-model="dialogVisible" width="500" :title="title" @close="cancel" v-loading="loading">
    <el-form ref="ruleFormRef" :model="formData" label-width="auto">
      <template v-for="(col, i) in columns" :key="col.prop + i">
        <el-form-item :label="col.label" :prop="col.prop" :rules="getColumnRules(col)">
          <dc-widget
            v-if="col.type !== 'el-select' && col.type !== 'el-upload'"
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
            placeholder="请选择"
          >
            <el-option
              v-for="item in col.props.options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-upload
            v-else-if="col.type === 'el-upload'"
            :ref="el => setUploadRef(el, col.prop)"
            accept=".xls,.xlsx"
            :http-request="uploadFile"
            class="ml-2 mr-2"
            :limit="1"
            :on-exceed="handleExceed"
            :auto-upload="true"
          >
            <el-button type="primary" size="small" icon="Upload">导入</el-button>
          </el-upload>
        </el-form-item>
      </template>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="submitForm()">提交</el-button>
        <el-button @click="cancel()">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import dayjs from 'dayjs';
import Api from '@/api/index';
import Const from '@/const';
import editDialog from '@/mixins/edit-dialog';
import options from './addEditeDialog.js';

export default {
  emits: ['success'],
  name: 'combined-dialog',
  mixins: [editDialog],
  data() {
    return {
      loading: true,
      columns: [],
      dialogVisible: false,
      formData: {},
      ids: [],
      title: '新增',
      mode: 'addEdit', // 'addEdit' 或 'import'
      isCopyMode: false,
      uploadRefs: {}, // 存储上传组件的引用
    };
  },
  created() {
    this.handleDictKeys();
    this.dictKeys.push({ key: 'DC_INSPECTION_CLASS' });
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

      // mtoNo 和 materialName 的特殊验证规则
      if (col.prop === 'mtoNo' || col.prop === 'materialNumber') {
        rules.push({
          validator: (rule, value, callback) => {
            // 检查 mtoNo 和 materialName 是否都为空
            const mtoNo = this.formData.mtoNo;
            const materialNumber = this.formData.materialNumber;

            // 如果两个字段都为空，则显示错误提示
            if ((!mtoNo || mtoNo === '') && (!materialNumber || materialNumber === '')) {
              callback(new Error('专案号和物料至少需要填写一个'));
            } else {
              // 如果至少有一个字段填写了，则通过验证
              callback();
            }
          },
          trigger: 'change',
        });
      }

      return rules;
    },

    /** 处理表单项变化 **/
    handleFormItemChange(col, val) {
      if (col.prop === 'mtoNo') {
        // 处理专案号选择
        if (Array.isArray(val) && val.length > 0) {
          this.formData.mtoNo = val.map(item => item.billNo).join(',');
        }
        this.$nextTick(() => {
          this.$refs.ruleFormRef.validateField('materialNumber');
        });
      } else if (col.prop === 'materialNumber') {
        // 处理物料选择
        if (Array.isArray(val) && val.length > 0) {
          this.formData.materialName = val.map(item => item.fname).join(',');
          this.formData.materialId = val.map(item => item.id).join(',');
          this.formData.materialNumber = val.map(item => item.fnumber).join(',');
        }
        this.$nextTick(() => {
          this.$refs.ruleFormRef.validateField('mtoNo');
        });
      }
    },

    /** 打开弹窗 **/
    openDialog(row, isCopy, mode = 'addEdit') {
      this.mode = mode;
      this.columns = options(mode).columns;
      this.dialogVisible = true;
      this.isCopyMode = !!isCopy;

      // 根据模式设置标题
      if (mode === 'import') {
        this.title = '导入';
      } else {
        this.title = row ? (this.isCopyMode ? '复制' : '编辑') : '新增';
      }

      this.formData = row ? JSON.parse(JSON.stringify(row)) : {};
    },

    /** 设置上传组件引用 **/
    setUploadRef(el, prop) {
      if (el) {
        this.uploadRefs[prop] = el;
      }
    },

    /** 处理文件超出限制 **/
    handleExceed(files) {
      const uploadColumn = this.columns.find(col => col.type === 'el-upload');
      if (uploadColumn) {
        // 获取对应的上传组件引用
        const uploadRef = this.uploadRefs[uploadColumn.prop];
        if (uploadRef) {
          uploadRef.clearFiles();
          const file = files[0];
          uploadRef.handleStart(file);
        }
        // 将文件保存到正确的位置
        this.formData[uploadColumn.prop] = files[0];
        console.log('文件已保存到formData', this.formData);
        this.$message.success('文件选择成功');
      }
    },

    /** 上传文件 **/
    uploadFile(option) {
      console.log('上传文件', option.file);
      if (option.file) {
        // 找到上传列的prop
        const uploadColumn = this.columns.find(col => col.type === 'el-upload');
        if (uploadColumn) {
          // 将文件保存到正确的位置
          this.formData[uploadColumn.prop] = option.file;
          console.log('文件已保存到formData', this.formData);
          this.$message.success('文件选择成功');
        }
      } else {
        this.$message.error('未获取到文件');
      }
      return new Promise(resolve => {
        resolve();
      });
    },

    // 弹出框提交表单
    submitForm() {
      this.$refs.ruleFormRef.validate(async valid => {
        if (valid) {
          this.loading = true;

          // 根据模式调用不同的API
          const apiCall = this.mode === 'import' ? Api.qms.sn.importSip : Api.qms.sn.submitSip;

          const params =
            this.mode === 'import'
              ? { ...this.formData }
              : {
                  ...this.formData,
                  id: this.isCopyMode ? undefined : this.formData.id,
                  copyId: this.isCopyMode ? this.formData.id : undefined,
                };

          apiCall(params)
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
      this.$refs.ruleFormRef.resetFields();
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
