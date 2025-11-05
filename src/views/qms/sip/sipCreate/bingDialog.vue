<template>
  <el-dialog v-model="importDialog" width="60%" :title="title" @close="cancel" v-loading="loading">
    <el-form ref="ruleFormRef" :model="formData" label-width="auto">
      <template v-for="(col, i) in columns" :key="col.prop + i">
        <el-form-item :label="col.label" :prop="col.prop" :rules="getColumnRules(col)">
          <dc-widget
            v-if="col.type != 'el-select'"
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
            v-else
            v-model="formData[col.prop]"
            :placeholder="col.props.placeholder"
            @change="handleSelectChange"
          >
            <el-option
              v-for="(item, index) in childOptions"
              :key="index"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
      </template>
    </el-form>
    <el-table
      :data="bingTable"
      style="width: 100%"
      height="300"
      border
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55"> </el-table-column>
      <el-table-column prop="moduleName" label="模组名称" width="width" show-overflow-tooltip>
      </el-table-column>
      <el-table-column prop="checkType" label="检验类型" width="width" show-overflow-tooltip>
      </el-table-column>
      <el-table-column prop="fileUrl" label="附件(图片)" width="100">
        <template #default="{ row }">
          <el-image
            v-if="row.fileUrl"
            :src="row.fileUrl"
            :preview-src-list="[row.fileUrl]"
            preview-teleported="true"
            style="width: 20px; height: 20px; position: relative; z-index: 10"
            fit="cover"
          />
        </template>
      </el-table-column>
      <el-table-column
        prop="inspectionItemName"
        label="检查项名称"
        width="400"
        show-overflow-tooltip
      >
      </el-table-column>
      <el-table-column prop="method" label="是否测量" width="width">
        <template #default="{ row }">
          {{ row.method === 0 ? '不测' : '测' }}
        </template>
      </el-table-column>
    </el-table>

    <!-- <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div> -->

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
import options from './bingDialog.js';
export default {
  emits: ['success'],
  name: 'add-edite-dialog',
  mixins: [editDialog],
  data() {
    return {
      loading: true,
      columns: options().columns,
      importDialog: false,
      formData: {},
      ids: [],
      queryParams: {
        current: 1,
        size: 10,
      },
      childOptions: [],
      title: '新增',
      isCopyMode: false,
      tableData: [],
      bingTable: [],
      uploadRefs: {}, // 存储上传组件的引用
      // 新增分页相关数据
      currentPage: 1,
      pageSize: 10,
      total: 0,
      selectedRows: [], // 存储选中的行
    };
  },
  created() {
    this.handleDictKeys();
    this.getData();
    this.initFormData();
    this.getDictData().then(res => {});
  },
  methods: {
    handleSelectChange(val) {
      // console.log('moduleName', val);
      this.formData.moduleName = val;
      this.bingTable = this.tableData.filter(item => item.moduleName === val);
      console.log('bingTable', this.bingTable);
    },
    getDetailOpen() {
      Api.qms.sn
        .querySipByType({
          sipIds: this.formData.sipTypeIdList,
        })
        .then(res => {
          const { code, data } = res.data;
          if (code === 200) {
            this.bingTable = data || [];
          }
        })
        .catch(err => {
          console.error(err);
        });
    },
    initFormData() {
      Api.qms.sn
        .queryModelName({})
        .then(res => {
          const { code, data } = res.data;
          if (code === 200) {
            this.childOptions = data;
          }
        })
        .catch(err => {
          console.error(err);
        });
    },
    /** 获取列表数据 **/
    getData() {
      this.loading = true;
      const params = {
        ...this.queryParams,
        current: this.currentPage,
        size: 9999,
      };
      this.api.qms.sn
        .sipTypeList(params)
        .then(res => {
          const { code, data } = res.data;
          if (code === 200) {
            this.tableData = data.records || [];
            this.total = data.total || 0;
            // this.queryParams.current = data.current;
            // this.queryParams.size = data.size;
            // const options = [...new Set(this.tableData.map(item => item.moduleName))];
            // console.log('moduleName', options);
            // this.childOptions = options || [];
          }
          this.loading = false;
        })
        .catch(err => {
          this.loading = false;
          console.error(err);
        });
    } /** 打开添加弹窗 **/,
    openDialog(row, isCopy, type) {
      this.importDialog = true;

      this.isCopyMode = !!isCopy;
      this.title = row ? (this.isCopyMode ? '复制' : '编辑') : '配置';
      this.title = type == 'config' ? '配置' : this.title;
      this.formData = row ? JSON.parse(JSON.stringify(row)) : {};
      this.getDetailOpen();
    },

    // 弹出框提交表单
    submitForm() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请选择模组名称');
        return;
      }
      this.$refs.ruleFormRef.validate(async valid => {
        if (valid) {
          this.loading = true;
          Api.qms.sn
            .bindSipAndCheckItem({
              sipId: this.formData.id,
              typeIds: this.selectedRows.map(item => item.id).join(','),
            })
            .then(res => {
              const { code, msg } = res.data;
              if (code === 200) {
                this.cancel();
                this.$emit('success');
                this.$message.success(msg);
              }
              this.loading = false;
            });
        }
      });
    },
    cancel() {
      this.importDialog = false;
      this.$refs.ruleFormRef.resetFields();
      this.formData = {};
      this.selectedRows = []; // 清空选中的行
    },
    // 新增分页相关方法
    handleSizeChange(val) {
      this.pageSize = val;
      this.getData();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getData();
    },
    // 新增表格选择变化处理方法
    handleSelectionChange(val) {
      console.log('val', val);
      this.selectedRows = val;
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

.pagination-container {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}
</style>
