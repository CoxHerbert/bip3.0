<template>
  <div class="list-page mil-process-list-page">
    <div class="header">
      <dc-search
        v-model="queryParams"
        v-bind="searchConfig"
        @reset="handleReset"
        @search="handleSearch"
      />
    </div>
    <div class="action-banner">
      <el-button icon="Plus" type="primary" @click="doAction('add')">新增</el-button>
      <el-button icon="Download" type="primary" @click="doAction('exportTable')">导出</el-button>
    </div>
    <div class="table-container">
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="tableData"
        row-key="id"
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
          />
          <!-- 序号类型 -->
          <el-table-column
            v-else-if="col.type === 'index'"
            :key="'index' + i"
            label="序号"
            :align="col.align"
            :width="col.width"
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
              {{
                [null, undefined, ''].includes(scoped.row[col.prop]) ? '-' : scoped.row[col.prop]
              }}
            </template>
          </el-table-column>
          <el-table-column
            v-else-if="col?.transVal"
            :key="'rowTextKey' + i"
            :label="col.label"
            :width="col.width"
            :min-width="col.minWidth"
            :prop="col.prop"
            :align="col.align ? col.align : 'center'"
            show-overflow-tooltip
          >
            <template #default="scoped">
              {{ col?.transVal(scoped) }}
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
            prop="purchaserId"
          >
            <template #default="scoped">
              <dc-view
                v-model="scoped.row[col.prop]"
                :objectName="col.objectName"
                :showKey="col.showKey"
              />
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
              <dc-dict
                v-if="pageData[col.dictKey]"
                type="text"
                :options="pageData[col.dictKey]"
                :value="scoped.row[col.prop]"
              ></dc-dict>
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
</template>
<script>
import listPage from '@/mixins/list-page';
import options from './mil-process.js';
import exForm from '@/views/plugin/workflow/mixins/ex-form';
import Api from '@/api/index';
import { exportBlob } from '@/api/common';
import { downloadXls } from '@/utils/util';
import NProgress from 'nprogress';
import { exportSingleSheetExcel } from '@/utils/useExcelExport';
export default {
  mixins: [listPage, exForm],
  name: 'mil-process-list-page',
  data() {
    return {
      mode: 'customize',
      columns: options().columns,
      tableColumns: [],
    };
  },
  created() {
    if (this.mode === 'customize') {
      this.handleDictKeys();
      this.getDictData().then(() => {
        this.initSearchConfig();
      });
    }
  },
  mounted() {
    this.getData();
  },
  methods: {
    /** 获取列表数据 **/
    getData() {
      this.loading = true;
      this.api.pdp.milProcess
        .list(this.queryParams)
        .then(res => {
          const { code, data } = res.data;
          if (code === 200) {
            this.tableData = data.records;
            this.total = data.total;
          }
          this.loading = false;
        })
        .catch(err => {
          ths.loading = false;
          console.error(err);
        });
    },
    doAction(action, scope = {}) {
      const { row } = scope;
      if (action === 'look') {
        this.handleDynamicRoute(row);
      } else if (action === 'add') {
        this.handleClickProcessItem();
      } else if (action === 'exportTable') {
        // this.exportExcelFunc();
        this.handleExport();
      }
    },

    handleExport() {
      const paramsWithoutPagination = { ...this.queryParams };
      delete paramsWithoutPagination.current;
      delete paramsWithoutPagination.size;
      // 过滤掉值为 null 的参数
      const filteredParams = Object.fromEntries(
        Object.entries(paramsWithoutPagination).filter(([_, value]) => value !== null)
      );
      console.log(new URLSearchParams(filteredParams).toString());
      this.$confirm('是否导出mil异常数据?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        NProgress.start();
        exportBlob(
          `/blade-bip/mil-process-data/exportMilAbnormal?${new URLSearchParams(
            filteredParams
          ).toString()}`
        ).then(res => {
          downloadXls(res.data, `mil异常数据${this.$dayjs().format('YYYY-MM-DD HH:mm:ss')}.xlsx`);
          NProgress.done();
        });
      });
    },
    exportExcelFunc() {
      this.$confirm('是否导出MIL流程数据?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.loading = true;
        // 获取所有数据，不分页
        const allParams = { ...this.queryParams, current: 1, size: 999999 };
        this.api.pdp.milProcess
          .list(allParams)
          .then(res => {
            const { code, data } = res.data;
            if (code === 200) {
              const exportData = data.records;
              if (exportData.length > 0) {
                // 根据 mil-process.js 中的列配置生成导出字段
                const exportFields = this.columns
                  .filter(col => col.type !== 'actions') // 过滤掉操作列
                  .map(col => ({
                    key: col.prop,
                    title: col.label,
                    // 如果有转换函数，则使用转换函数处理数据
                    formatter: col.transVal ? row => col.transVal({ row }) : null,
                  }));

                // 调用导出方法
                exportSingleSheetExcel({
                  data: exportData,
                  fields: exportFields,
                  filename: `MIL流程数据_${this.$dayjs().format('YYYY-MM-DD HH:mm:ss')}`,
                  sheetName: 'MIL流程数据',
                });

                this.$message.success('导出成功');
              } else {
                this.$message.warning('暂无数据可导出');
              }
            }
            this.loading = false;
          })
          .catch(err => {
            this.loading = false;
            console.error(err);
            this.$message.error('导出失败');
          });
      });
    },

    async handleClickProcessItem() {
      const params = {
        processKey: 'mil_process_v2',
      };
      const res = await Api.pdp.settled.processForm(params);
      const { code, data } = res.data;
      if (code === 200) {
        this.$router.push(
          `/workflow/process/start/${data.enCode}?parentMenuId=1892114945981734913`
        );
      }
    },
    handleDynamicRoute(row) {
      this.loading = true;
      this.api.pdp.milProcess
        .getProcessTaskV2({ processId: row.processId })
        .then(res => {
          const { data, code } = res.data;
          if (code === 200) {
            this.dynamicRoute(
              {
                processId: row.processId,
                taskId: data,
                parentMenuId: '1892114945981734913',
              },
              'detail'
            );
          }
          this.loading = false;
        })
        .catch(err => {
          this.loading = false;
        });
    },
  },
};
</script>
