<template>
  <div class="warpName">
    <!-- <div class="query-tree" style="width: 200px">
      <el-scrollbar class="tree-scrollbar">
        <el-tree
          class="tree"
          :data="treeData"
          :props="{
            children: 'children',
            label: 'label',
          }"
          @node-click="handleNodeClick"
          :highlight-current="true"
          :default-expand-all="true"
        />
      </el-scrollbar>
    </div> -->

    <div class="list-page page-processing-outsourcing">
      <div class="header">
        <dc-search
          v-model="queryParams"
          v-bind="searchConfig"
          @reset="handleReset"
          @search="handleSearch"
        />
      </div>
      <div class="action-banner">
        <el-button icon="Plus" type="primary" style="margin: 0 16px" @click="doAction('add')"
          >新增</el-button
        >
        <el-button icon="Plus" type="primary" @click="doAction('copy')">复制</el-button>
        <!-- <el-upload
          class="upload-demo"
          action="#"
          :auto-upload="false"
          :on-change="handleFileChange"
          :show-file-list="false"
          accept=".xlsx,.xls"
        >
          <el-button type="primary" icon="Upload"> 选择Excel文件批量创建 </el-button>
        </el-upload> -->

        <!-- <span v-if="fileName" class="file-name">{{ fileName }}</span> -->

        <!-- <div class="file-info" v-if="fileName"> -->
        <!-- <p>支持格式：.xlsx, .xls</p> -->
        <!-- <p>提示：可预览并选择需要导入的工作表</p> -->
        <!-- </div> -->
        <!-- </div>
        </el-card> -->
      </div>
      <div class="table-container">
        <el-table
          ref="tableRef"
          v-loading="loading"
          @selection-change="handleSelectionChange"
          :data="tableData"
          border
        >
          <template v-for="(col, i) in columns">
            <!-- 多选 -->
            <el-table-column
              v-if="col.type === 'selection'"
              :key="i"
              type="selection"
              :align="col.align"
              :width="col.width"
            />
            <!-- 序号类型 -->
            <el-table-column
              v-else-if="col.type === 'index'"
              :key="'index' + i"
              label="序号"
              :align="col.align"
              :width="col.width"
              :min-width="col.minWidth"
            >
              <template #default="{ $index }">
                {{ $index + 1 }}
              </template>
            </el-table-column>
            <!-- 普通文字类型 -->
            <el-table-column
              v-else-if="col.type === 'rowText'"
              :key="'rowText' + i"
              :label="col.label"
              :width="col.width"
              :min-width="col.minWidth"
              :prop="col.prop"
              :align="col.align ? col.align : 'center'"
              show-overflow-tooltip
            >
              <template #default="scoped">
                <span v-if="col.prop === 'taskName' || col.prop === 'taskUserName'">
                  {{
                    [null, undefined, ''].includes(scoped.row[col.prop])
                      ? '流程节点结束'
                      : scoped.row[col.prop]
                  }}
                </span>
                <span v-else>
                  {{
                    [null, undefined, ''].includes(scoped.row[col.prop])
                      ? '-'
                      : scoped.row[col.prop]
                  }}
                </span>
              </template>
            </el-table-column>
            <!-- 人员类型 -->
            <el-table-column
              v-else-if="col.type === 'dc-view'"
              :key="'dc-view' + i"
              :label="col.label"
              :width="col.width"
              :min-width="col.minWidth"
              :align="col.align ? col.align : 'center'"
              :prop="col.prop"
              show-overflow-tooltip
            >
              <template #default="scoped">
                <dc-view
                  v-model="scoped.row[col.prop]"
                  :objectName="col.objectName"
                  :showKey="col.showKey"
                />
              </template>
            </el-table-column>

            <el-table-column
              v-else-if="col.type === 'imageUrl'"
              :key="'imageUrl' + i"
              :label="col.label"
              :width="col.width"
              :min-width="col.minWidth"
              :align="col.align ? col.align : 'center'"
              :prop="col.prop"
              show-overflow-tooltip
            >
              <template #default="scoped">
                <el-image
                  :src="scoped.row[col.prop]"
                  style="width: 30px; height: 30px; border-radius: 50%"
                  preview-src-list="[scoped.row[col.prop]]"
                ></el-image>
              </template>
            </el-table-column>
            <!-- 字典类型 -->
            <el-table-column
              v-else-if="col.type === 'dict'"
              :key="'dict' + i"
              :label="col.label"
              :width="col.width"
              :min-width="col.minWidth"
              :prop="col.prop"
              :align="col.align ? col.align : 'center'"
              show-overflow-tooltip
            >
              <template #default="scoped">
                <dc-dict-key
                  v-if="dictMaps[col.dictKey]"
                  type="text"
                  :options="dictMaps[col.dictKey]"
                  :value="scoped.row[col.prop]"
                ></dc-dict-key>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column
              v-else-if="col.type === 'actions'"
              :key="'option' + i"
              :fixed="col.fixed"
              :label="col.label"
              :width="col.width ? col.width : 180"
              :min-width="col.minWidth"
              :align="col.align ? col.align : 'center'"
            >
              <template #default="scoped">
                <el-button
                  v-for="(btn, j) in col.children"
                  :key="j"
                  link
                  v-show="!btn.showFunc || (btn.showFunc && btn.showFunc(scoped))"
                  type="primary"
                  @click="doAction(btn.action, scoped)"
                  >{{ btn.label }}</el-button
                >
              </template>
            </el-table-column>
          </template>
        </el-table>
      </div>
      <dc-pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.current"
        v-model:limit="queryParams.size"
        @pagination="getData"
      />
    </div>

    <!-- 表格弹窗组件 -->
    <TableModal
      ref="tableModalRef"
      v-model:visible="showTableModal"
      :excelData="excelData"
      @close="handleTableModalClose"
      @confirm="handleTableModalConfirm"
    />
    <!-- 新增铭牌批次 -->
    <CreateDrawer v-model="createVisibleDrawer" @success="handleCreateSuccess" />
    <el-drawer
      v-model="detailVisibleDrawer"
      :title="form.processDefinitionName"
      class="nf-drawer"
      size="60%"
      @close="detailVisibleDrawer = false"
      append-to-body
    >
      <TaskDetailChange
        v-if="detailVisibleDrawer"
        :taskId="form.taskId"
        :flowIsType="form.flowIsType"
        :processInstanceId="form.flowId"
        @close="handleDetailClose"
      ></TaskDetailChange>
      <!-- <TaskDetail
        v-if="detailVisibleDrawer"
        :taskId="form.taskId"
        :flowIsType="form.flowIsType"
        :processInstanceId="form.flowId"
      ></TaskDetail> -->
    </el-drawer>
  </div>
</template>
<script>
import listPage from '@/mixins/list-page';
import exForm from '@/views/plugin/workflow/mixins/ex-form';
import options from './index';
import TableModal from './components/TableModal.vue';
import CreateDrawer from './components/CreateDrawer.vue';
import { parseExcelFile, getSheetNames } from '@/utils/excelImporter';
import Api from '@/api/index';
export default {
  mixins: [listPage, exForm],
  name: 'solution-plan-list',
  components: {
    TableModal,
    CreateDrawer,
  },
  data() {
    return {
      mode: 'customize',
      showTableModal: false,
      createVisibleDrawer: false,
      // 文件相关状态
      fileName: '',
      selectedFile: null,
      loading: false,

      // 数据相关状态
      excelData: {},
      importedData: [],
      importedColumns: [],
      importedSheetName: '',
      form: {},
      columns: [],
      formData: {
        id: '',
        currentNodeUserName: '',
        flowName: '',
        equipmentId: '',
        leaderUserId: '',
        leaderUserPhone: '',
        leaderUserDept: '',
        leaderImage: '',
      },
      dialogVisible: false,
      detailVisibleDrawer: false,
      queryParams: {
        current: 1,
        size: 20,
      },
    };
  },
  created() {
    this.columns = options().columns;
    this.handleDictKeys();
    this.getDictData().then(() => {
      this.initSearchConfig();
    });
  },
  mounted() {
    this.getData();
  },
  // 在methods中添加以下方法
  methods: {
    // 新增
    // async handleInitiate() {
    //   const params = {
    //     processKey: 'process_KFZiEDAAkHDZMr2F2TfGbaDHpjjmJNrS',
    //   };
    //   const res = await this.api.pdp.settled.processForm(params);
    //   const { code, data } = res.data;
    //   if (code === 200) {
    //     this.$router.push(`/workflow/process/start/${data.enCode}`);
    //   }
    // },
    // 选中行
    handleSelectionChange(selection) {
      if (selection.length > 1) {
        this.$refs.tableRef.clearSelection();
        this.$refs.tableRef.toggleRowSelection(selection.pop());
      }
      this.batchSelectRows = selection;
      console.log(this.batchSelectRows);
      // this.tenderProjectId = this.tableRef[0].data.projectId;
    },
    handleDetail(row) {
      console.log(row);
      this.dynamicRoute(row, 'detail', true).then(() => {
        console.log(row);
        this.form = { ...row };
        this.detailVisibleDrawer = true;
      });
    },
    /** 处理详情弹框关闭 **/
    handleDetailClose() {
      this.detailVisibleDrawer = false;
      // 关闭弹框后刷新列表数据
      this.getData();
    },
    /** 获取列表数据 **/
    getData() {
      this.loading = true;
      this.api.mes.moveLabel
        .queryNameplateBatchList(this.queryParams)
        .then(res => {
          const { code, data } = res.data;
          if (code === 200) {
            this.tableData = data.records;
            this.total = data.total;
          }
          this.loading = false;
        })
        .catch(err => {
          this.loading = false;
          console.error(err);
        });
    },

    doAction(action, scope = {}) {
      const { row } = scope;
      if (action === 'batchDelete') {
        if (this.batchSelectRows.length < 1) {
          this.$message.error('请先勾选要删除的数据');
          return;
        }
        this.deleteData(this.batchSelectRows.map(row => row.entryId));
      } else if (action === 'delete') {
        this.deleteData(scope.row.id);
      } else if (action === 'edit') {
        this.dialogVisible = true;
        this.formData = row;
        this.formData.equipmentId = row.equipmentId.toString();
      } else if (action === 'add') {
        // this.createVisibleDrawer = true;
        this.$router.push({
          path: '/system/nameplate/nameplateBatch/createSubmit',
        });
        // this.handleInitiate();
      } else if (action === 'detail') {
        this.handleDetail(row);
      } else if (action === 'copy') {
        this.handleCopy();
      }
    },
    // 处理复制
    handleCopy() {
      if (this.batchSelectRows.length !== 1) {
        this.$message.error('请先勾选要复制的数据');
        return;
      }

      const row = this.batchSelectRows[0];
      console.log(row);
      this.$router.push({
        path: '/system/nameplate/nameplateBatch/createSubmit',
        query: {
          id: row.id,
        },
      });
      // 调用查询所有详情接口
    },
    // 处理新增成功
    handleCreateSuccess() {
      // 刷新列表数据
      this.getData();
    },
    /** 处理删除 **/
    async deleteData(id) {
      try {
        await this.$messageBox.confirm('确定要删除这条记录吗？', '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        });
        const res = await this.api.mes.moveLabel.deleteNameplateBatch([id]);
        if (res.data.code === 200) {
          this.$message.success('删除成功');
          this.getData();
        }
      } catch (error) {
        if (error.message !== 'cancel') {
          this.$message.error(`删除失败：${error.message || '网络错误'}`);
        }
      }
    },

    // 处理文件选择变化
    async handleFileChange(file) {
      this.selectedFile = file.raw;
      this.fileName = file.name;

      if (!this.selectedFile) {
        this.$message.error('请先选择Excel文件');
        return;
      }

      this.loading = true;

      try {
        // 解析Excel文件
        const excelData = await parseExcelFile(this.selectedFile);
        console.log('解析后的Excel数据:', excelData);

        // 保存解析后的数据
        this.excelData = excelData;

        // 获取工作表名称列表
        const sheetNames = Object.keys(excelData);
        console.log('工作表名称列表:', sheetNames);

        if (sheetNames.length === 0) {
          this.$message.error('Excel文件中没有有效数据');
          return;
        }

        // 默认选择第一个工作表
        this.importedSheetName = sheetNames[0];
        this.importedData = excelData[this.importedSheetName];
        console.log('选中的工作表数据:', this.importedData);

        // 提取列信息
        if (this.importedData.length > 0) {
          this.importedColumns = Object.keys(this.importedData[0]).map(key => ({
            prop: key,
            label: key,
          }));
          console.log('提取的列信息:', this.importedColumns);
        }

        // 显示表格预览弹窗
        this.showTableModal = true;

        this.$message.success('Excel文件解析成功');
      } catch (error) {
        console.error('Excel解析错误:', error);
        this.$message.error(`Excel文件解析失败: ${error.message || '未知错误'}`);
      } finally {
        this.loading = false;
      }
    },
    // 处理表格弹窗关闭
    handleTableModalClose() {
      this.showTableModal = false;
      // 重置所有文件相关状态
      this.fileName = '';
      this.selectedFile = null;
      this.excelData = {};
      this.importedData = [];
      this.importedColumns = [];
      this.importedSheetName = '';
    },
    // 处理表格弹窗确认
    handleTableModalConfirm(data) {
      this.importedData = data;
      console.log(this.importedData);
      this.importedData.forEach(item => {
        item.isJy = item.isJy ? 1 : 0;
        delete item.undefined; // 移除 undefined: null 属性
      });
      this.api.mes.moveLabel.startNameplateBatch(this.importedData).then(res => {
        if (res.data.code === 200) {
          this.$message.success('启动成功');
          this.handleTableModalClose();
        }
      });
    },
  },
};
</script>
<style scoped>
.warpName {
  display: flex;
  width: 100%;
  height: 100%;
}

.query-tree {
  width: 200px;
  flex-shrink: 0; /* 防止左侧树形结构被压缩 */
  border-right: 1px solid #e6e6e6;
  padding-right: 2px;
  height: 100%; /* 设置高度为100%以填充父容器 */
  display: flex;
  flex-direction: column;
}

.tree-scrollbar {
  flex: 1; /* 让滚动条占据剩余空间 */
  height: 100%; /* 确保高度充满父容器 */
  background-color: #fff;
}

.list-page {
  flex: 1; /* 占据剩余空间 */
  padding-left: 2px;
  overflow: hidden; /* 防止内容溢出 */
}

.page-processing-outsourcing {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.table-container {
  flex: 1;
  overflow: auto;
}
</style>
