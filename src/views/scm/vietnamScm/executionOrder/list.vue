<template>
  <div class="page-processing-outsourcing list-edit-page">
    <div class="header">
      <dc-search
        v-model="queryParams"
        v-bind="searchConfig"
        @reset="handleReset"
        @search="handleSearch"
      />
    </div>
    <div class="action-banner">
      <el-button
        icon="Plus"
        type="primary"
        size="small"
        style="margin-right: 8px"
        @click="doAction('1111')"
        >同 步</el-button
      >
      <el-button
        icon="Plus"
        type="primary"
        size="small"
        style="margin-right: 8px"
        @click="doAction('3333')"
        >手工关闭</el-button
      >
      <!-- v-if="!queryParams.examineStatus" -->
      <el-button
        icon="remove"
        type="primary"
        size="small"
        :loading="loading"
        :disabled="batchActionDisabled"
        @click="doAction('2222')"
        >作 废</el-button
      >
    </div>
    <div class="table-container">
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="tableData"
        row-key="id"
        size="small"
        @select="handleSelect"
        @select-all="handleSelectAll"
        @selection-change="handleSelectionChange"
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
            :fixed="col.fixed"
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

          <el-table-column
            v-else-if="col.type === 'clickable-text'"
            :key="'clickable-text' + i"
            :label="col.label"
            :width="col.width"
            :min-width="col.minWidth"
            :prop="col.prop"
            :fixed="col.fixed"
            :align="col.align ? col.align : 'center'"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <span
                class="clickable-text"
                v-if="scoped.row[col.prop]"
                @click="handleBillNoClick(scoped.row)"
              >
                {{ scoped.row[col.prop] }}
              </span>
              <!-- <span v-if="scoped.row[col.prop]">
                {{ scoped.row[col.prop] }}
              </span> -->
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column
            v-else
            :key="col.type + i"
            :label="col.label"
            :width="col.width"
            :min-width="col.minWidth"
            :prop="col.prop"
            :align="col.align ? col.align : 'center'"
            show-overflow-tooltip
          >
            <template #default="scoped">
              <span
                v-if="col.prop === 'costSavingRatio'"
                :style="getCostSavingRatioStyle(scoped.row[col.prop])"
              >
                {{
                  scoped.row[col.prop] !== null && scoped.row[col.prop] !== undefined
                    ? scoped.row[col.prop]
                    : '-'
                }}
                <span v-if="scoped.row[col.prop]"> % </span>
              </span>
              <dc-field-view
                v-else
                :value="col?.transVal ? col?.transVal(scoped, treeData) : scoped.row[col.prop]"
                :data="col"
                :dictMaps="dictMaps"
              />
            </template>
          </el-table-column>
        </template>
      </el-table>
      <!-- </el-form-item> -->
      <!-- </el-form> -->
    </div>
    <dc-pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.current"
      v-model:limit="queryParams.size"
      @pagination="getData"
    />
    <el-drawer
      v-model="detailVisibleDrawer"
      :title="form.processDefinitionName"
      class="nf-drawer"
      size="70%"
      @close="detailVisibleDrawer = false"
      append-to-body
    >
      <TaskDetailChange
        v-if="detailVisibleDrawer"
        :taskId="form.taskId"
        :flowIsType="form.flowIsType"
        :processInstanceId="form.flowId"
      ></TaskDetailChange>
    </el-drawer>

    <!-- 添加物料详情抽屉 -->
    <el-drawer
      v-model="materialDetailVisibleDrawer"
      title="物料"
      class="material-drawer"
      size="50%"
      @close="materialDetailVisibleDrawer = false"
      append-to-body
    >
      <div class="pdf-container">
        <iframe :src="visibleDrawerUrl" frameborder="0" width="100%" height="100%"></iframe>
      </div>
    </el-drawer>
  </div>
</template>
<script>
import listPage from '@/mixins/list-page';
import options from './list';
import Api from '@/api';
import { mergeMainAndSubData } from '@/utils/mainSubData';
import exForm from '@/views/plugin/workflow/mixins/ex-form';

export default {
  mixins: [listPage, exForm],
  name: 'material-price-config-list',
  data() {
    return {
      mode: 'customize',
      columns: [],
      detailVisibleDrawer: false,
      materialDetailVisibleDrawer: false,
      queryParams: {
        current: 1,
        size: 10,
      },
      form: {},
      visibleDrawerUrl: '',
      fit: 'contain',
    };
  },
  created() {
    this.columns = options().columns;
    this.handleDictKeys();
    this.getDictData().then(() => {
      this.initSearchConfig();
      this.searchConfig.tabConfig = {
        prop: 'examineStatus',
        items: [
          { label: '全部', value: '' },
          { label: '已审核', value: '1' },
          { label: '重新审核', value: '2' },
          { label: '暂存', value: '3' },
        ],
      };
    });
  },
  mounted() {
    this.queryParams.isMy = 1;
    this.queryParams.examineStatus = '';
    this.getData();
  },
  methods: {
    handleBillNoClick(row) {
      console.log(row);
      // console.log('单据编号被点击:', row);
      this.dynamicRoute(row, 'detail', true).then(() => {
        // console.log(row);
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

    handleMaterialNumClick(childRow, parentRow) {
      this.materialDetailVisibleDrawer = true;
      this.visibleDrawerUrl = `https://www.eastwinbip.com/drawing/${childRow.materialNum}${childRow.versionNum}`;
    },

    /**
     * 根据成本节约比的值返回不同的样式
     * @param {number|string} value - 成本节约比的值
     * @returns {object} 样式对象
     */
    getCostSavingRatioStyle(value) {
      if (value === null || value === undefined || value === '') {
        return {};
      }

      const numValue = Number(value);
      if (isNaN(numValue)) {
        return {};
      }

      return {
        color: numValue < 0 ? '#F56C6C' : '#67C23A', // 小于0为红色，大于等于0为绿色
        fontWeight: 'bold',
      };
    },

    /**
     * 从列配置中提取主数据字段
     * @returns {Array} 主数据字段名数组
     */
    extractMainDataFields() {
      const mainDataFields = [];
      // 遍历列配置，提取主数据字段
      this.columns.forEach(column => {
        // 跳过特殊类型的列（selection、index、actions、expand）
        if (!['selection', 'index', 'actions', 'expand'].includes(column.type) && column.prop) {
          mainDataFields.push(column.prop);
        }
      });

      return mainDataFields;
    },
    /** 获取列表数据 **/
    // 新增
    async handleInitiate() {
      const params = {
        processKey: 'process_ec26ebrm64JR4W7mwtb8SzA2nCk2kmeR',
      };
      const res = await this.api.pdp.settled.processForm(params);
      const { code, data } = res.data;
      if (code === 200) {
        this.$router.push(`/workflow/process/start/${data.enCode}`);
      }
    },
    handleSearch() {
      if (this.queryParams.examineStatus === '') {
        this.queryParams.isMy = 1;
      } else {
        this.queryParams.isMy = 0;
      }
      this.queryParams.current = 1;
      this.getData();
    },
    /** 获取列表数据 **/
    getData() {
      this.loading = true;
      // 新增：根据当前登录用户过滤数据

      Api.system.OutsourceQuotation.queryPurchaseOrderList(this.queryParams)
        .then(res => {
          const { code, data } = res.data;
          if (code === 200) {
            // 从列配置中提取主数据字段
            const mainDataFields = this.extractMainDataFields();
            // 使用通用函数合并主数据和子数据
            const mergedData = mergeMainAndSubData(
              data.records,
              'purchaseOrderDetailList',
              mainDataFields,
              'id',
              'erpPurchaseOrderId'
            );
            this.tableData = mergedData;
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
      if (action === 'row-edit') {
        const options = {
          type: 'materialPrice',
          mode: 'edit',
          row: row,
          api: Api.appManage.materialPriceConfig.postOutsourcePrice,
        };
        this.$refs.addEditeDialogRef.openDialog(options);
      } else if (action === 'batch-submit') {
        this.handleBatchSubmit();
      }
    },

    handleBatchSubmit() {
      this.loading = true;
      const mainIdbList = [...new Set(this.batchSelectRows.map(item => item.mainId))];
      // console.log(mainIdbList);
      // const data = {
      //   dcErpPurchaseOrderIds: mainIdbList,
      // };
      Api.system.OutsourceQuotation.batchCompleteExamine(mainIdbList)
        .then(res => {
          const { code, data } = res.data;
          if (code === 200) {
            this.$message.success('批量提交成功');
            this.loading = false;
            this.getData();
          }
        })
        .catch(err => {
          console.error(err);
          this.loading = false;
        });
    },
    /** 处理删除 **/
    deleteData(ids) {
      this.handleDeleteCommon(
        ids.join(','),
        `确定要删除数据id为[${ids.join(',')}]的数据项？`,
        Api.appManage.materialPriceConfig.removeOutsourcePrice
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.table-container {
  height: calc(100vh - 220px);
  overflow-x: auto;
  overflow-y: auto;
}
.clickable-text {
  color: #409eff;
  cursor: pointer;
  text-decoration: underline;

  &:hover {
    color: #66b1ff;
  }
}

.pdf-container {
  height: 100%;
  width: 100%;
}
.pdf-drawer {
  .el-drawer__body {
    padding: 0;
    height: 100%;
  }
}
/* 移除表格单元格间距 */
::deep(.el-table) {
  --el-table-cell-padding: 0;
  border-collapse: collapse;
}

::deep(.el-table th),
::deep(.el-table td) {
  padding: 0 !important;
  border-right: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
}

::deep(.el-table th.is-leaf),
::deep(.el-table td) {
  padding: 0 !important;
}
</style>
