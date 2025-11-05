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
        icon="Upload"
        type="primary"
        @click="doAction('exportErp')"
        :loading="loadingEtn"
        :disabled="isSubmitErp"
        v-if="queryParams.queryPriceStatus === 'DC_WX_VALENCE_STATUS_YHJ'"
        >导出</el-button
      >
    </div>
    <div class="table-container">
      <el-form ref="formRef" class="form-main" :model="tableData">
        <!-- :rules="getTableRule(group.items)" -->
        <el-form-item class="form-item-table" :label-width="0">
          <el-table
            ref="tableRef"
            v-loading="loading"
            :data="tableData"
            :row-key="rowKey"
            @select="handleSelect"
            @select-all="handleSelectAll"
            @selection-change="handleSelectionChange"
            :row-class-name="tableRowClassName"
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
                :fixed="col?.fixed || ''"
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

              <el-table-column
                v-else-if="col.type === 'actions'"
                :key="'option' + i"
                :fixed="col.fixed"
                :label="col.label"
                :min-width="col.minWidth ? col.minWidth : 250"
                :align="col.align ? col.align : 'center'"
              >
                <template #default="scoped">
                  <el-button
                    v-for="(btn, j) in col.children"
                    :key="j"
                    link
                    v-show="!btn.showFunc || (btn.showFunc && btn.showFunc(scoped, queryParams))"
                    type="primary"
                    @click="doAction(btn.action, scoped)"
                    >{{ btn.label }}</el-button
                  >
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
                <template #header><span v-html="getLabelCode(col)"> </span></template>
                <template #default="scoped">
                  <div class="cell-box" :class="getCellBoxClass(scoped, col)">
                    <template
                      v-if="
                        coordinate?.rowIndex === scoped.$index &&
                        scoped.cellIndex === coordinate?.cellIndex
                      "
                    >
                      <el-form-item
                        :prop="`${scoped.$index}.${col.prop}`"
                        :label-width="0"
                        :rules="getColumnRules(col, scoped)"
                      >
                        <dc-widget
                          v-model="scoped.row[col.prop]"
                          :data="col"
                          :dictMaps="dictMaps"
                          @change="
                            val => {
                              handleTableItemChange(val, scoped, col);
                            }
                          "
                        >
                        </dc-widget>
                      </el-form-item>
                    </template>
                    <template v-else>
                      <span v-if="!!col?.transVal">
                        {{ col.transVal(scoped) }}
                      </span>
                      <dc-view
                        v-else-if="['dc-select-user'].includes(col.type)"
                        v-model="scoped.row[col.prop]"
                        objectName="user"
                      />
                      <dc-view
                        v-else-if="['wf-select-dialog', 'dc-select-dialog'].includes(col.type)"
                        v-model="scoped.row[col.prop]"
                        :objectName="col.props.objectName"
                      />
                      <dc-dict-key
                        v-else-if="['dict'].includes(col.type)"
                        :value="scoped.row[col.prop]"
                        :options="dictMaps?.[col.dictKey]"
                      />
                      <span v-else>
                        {{
                          [undefined, null, ''].includes(scoped.row[col.prop])
                            ? '-'
                            : scoped.row[col.prop]
                        }}
                      </span>
                    </template>
                  </div>
                </template>
              </el-table-column>
            </template>
            <el-table-column
              prop="updateUser"
              label="核价人"
              align="center"
              min-width="80"
              v-if="queryParams.queryPriceStatus !== 'DC_WX_VALENCE_STATUS_WHJ'"
              show-overflow-tooltip
            >
              <template #default="scoped">
                <dc-view v-model="scoped.row.updateUser" objectName="user" showKey="realName" />
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
      </el-form>
    </div>

    <dc-pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.current"
      v-model:limit="queryParams.size"
      @pagination="getData"
    />

    <el-dialog
      title="不核价查看"
      v-model="dialogVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <iframe
        class="drawing-wrap"
        :src="`https://www.eastwinbip.com/drawing/${routeRow.fnumber}`"
        title="物料图纸"
        frameBorder="no"
        border="0"
        marginWidth="0"
        marginHeight="0"
        scrolling="no"
        allowTransparency="yes"
      ></iframe>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="rollbackPriceFunc">回滚不核价</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script>
import unsavedChanges from '@/mixins/unsaved-changes';
import listEditPage from '@/mixins/list-edit-page';
import options from './list';
import BigNumber from 'bignumber.js';
import { downloadXls } from '@/utils/util';
import { exportBlobPost } from '@/api/common';
export default {
  mixins: [listEditPage, unsavedChanges],
  name: 'outsource-quotation-list',
  data() {
    return {
      mode: 'model',
      modelParams: {
        modelId: '1937686904528375810',
        datasourceId: '1879454467050659841',
      },
      editRow: {},
      routeRow: {},
      loadingEtn: false,
      dialogVisible: false,
      rowKey: 'id',
    };
  },
  computed: {
    // isSubmitErp() {
    //   return Array.isArray(this.tableData)
    //     ? !this.tableData.filter(item => item?.$edit).length
    //     : true;
    // },
  },
  created() {
    this.columns = options().columns;

    this.handleDictKeys();
    this.getDictData().then(() => {
      this.initSearchConfig();
      this.searchConfig.tabConfig = {
        prop: 'queryPriceStatus',
        items: [
          // { label: '全部', value: '' },
          ...this.dictMaps['DC_WX_VALENCE_STATUS'].map(item => {
            return {
              label: item.dictValue,
              value: item.dictKey,
            };
          }),
        ],
      };

      this.addSearchConfig();
    });
  },
  mounted() {
    this.queryParams.size = 20;
    const cachedStatus = sessionStorage.getItem('queryPriceStatus');
    this.queryParams.queryPriceStatus = cachedStatus || 'DC_WX_VALENCE_STATUS_WHJ';
    if (this.queryParams.queryPriceStatus === 'DC_WX_VALENCE_STATUS_YHJ') {
      this.columns = options().columns;
    } else {
      this.columns = options().columns.filter(item => item.showColumn);
      // console.log(this.columns);
    }
    this.getData();
  },
  methods: {
    handleSearch(data) {
      this.queryParams.size = 20;
      this.queryParams.queryPriceStatus = data.queryPriceStatus;
      sessionStorage.setItem('queryPriceStatus', this.queryParams.queryPriceStatus);
      if (this.queryParams.queryPriceStatus === 'DC_WX_VALENCE_STATUS_YHJ') {
        this.columns = options().columns;
      } else {
        this.columns = options().columns.filter(item => item.showColumn);
        console.log(this.columns);
      }
      this.getData();
    },
    /** 获取列表数据 **/
    getData() {
      this.loading = true;

      this.api.system.OutsourceQuotation.list(this.queryParams)
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
      if (action === 'viewBatches') {
        window.open(`https://www.eastwinbip.com/drawing/${row.fnumber + row.version}`, 'target');
      } else if (action === 'batchDelete') {
        if (this.batchSelectRows.length < 1) {
          this.$message.error('请先勾选要删除的数据');
          return;
        }
        this.deleteData(this.batchSelectRows.map(row => row.id));
      } else if (action === 'delete') {
        deleteData([scope.row.id]);
      } else if (action === 'pricingdetail') {
        if (row && row.id) {
          this.$router.push({
            path: '/system/outsource-quotation/pricingdetail',
            query: {
              srcEntryId: row.srcEntryId,
              srcBillType: row.srcBillType,
              total: this.total,
              quotationStatusId: row.quotationStatusId,
            },
          });
        }
      } else if (action === 'lookdetail') {
        this.$router.push({
          path: '/system/outsource-quotation/pricingdetail',
          query: {
            srcEntryId: row.srcEntryId,
            srcBillType: row.srcBillType,
            status: 'lookstatus',
            quotationStatusId: row.quotationStatusId,
          },
        });
      } else if (action === 'lookEdit') {
        this.$router.push({
          path: '/system/outsource-quotation/pricingdetail',
          query: {
            srcEntryId: row.srcEntryId,
            srcBillType: row.srcBillType,
            status: 'lookedit',
            quotationStatusId: row.quotationStatusId,
          },
        });
      } else if (action === 'lookBuhj') {
        this.routeRow = row;
        this.dialogVisible = !this.dialogVisible;
      } else if (action === 'exportErp') {
        console.log(this.queryParams);
        this.loadingEtn = true;
        exportBlobPost(`/blade-bip/OutsourceQuotation/exportQuotedList`, {
          queryMaterialName: this.queryParams.queryMaterialName || '',
          queryMaterialNumber: this.queryParams.queryMaterialNumber || '',
          queryMtoNo: this.queryParams.queryMtoNo || '',
        }).then(res => {
          downloadXls(res.data, `已核价数据${this.$dayjs().format('YYYY-MM-DD HH:mm:ss')}.xlsx`);
          this.loadingEtn = false;
        });
      }
    },
    /** 回滚不核价 **/
    rollbackPriceFunc() {
      this.api.system.OutsourceQuotation.rollbackPrice({
        ...this.routeRow,
      }).then(res => {
        const { code, data } = res.data;
        if (code === 200) {
          this.$message.success('回滚成功');
          this.getData();
          this.dialogVisible = false;
        }
      });
    },
    /** 处理删除 **/
    deleteData(ids) {
      this.handleDeleteCommon(
        ids,
        `确定要删除数据id为[${ids.join(',')}]的数据项？`,
        this.api.system.OutsourceQuotation.remove
      );
    },
    tableRowClassName({ row, rowIndex }) {
      // 举例：第3行加高亮
      if (row?.$edit) {
        return 'highlight-row';
      }
      return '';
    },
    addSearchConfig() {
      this.searchConfig.searchItemConfig.paramType = {
        queryStartDate: {
          label: '开始时间',
          type: 'el-date-picker',
          paramKey: 'queryStartDate',
          props: {
            placeholder: `请选择开始时间`,
            format: 'YYYY-MM-DD',
            'value-format': 'YYYY-MM-DD',
            clearable: true,
          },
        },
        queryEndDate: {
          label: '结束时间',
          type: 'el-date-picker',
          paramKey: 'queryEndDate',
          props: {
            placeholder: `请选择结束时间`,
            format: 'YYYY-MM-DD',
            // type: 'daterange',
            'value-format': 'YYYY-MM-DD',
            clearable: true,
          },
        },
        queryOrgId: {
          label: '组织',
          type: 'wf-select-dialog',
          paramKey: 'queryOrgId',
          props: {
            objectName: 'org',
          },
        },
        queryMtoNo: {
          label: '计划跟踪号',
          type: 'input',
          paramKey: 'queryMtoNo',
          placeholder: `请输入计划跟踪号`,
        },
        queryMaterialNumber: {
          label: '物料编码',
          type: 'input',
          paramKey: 'queryMaterialNumber',
          placeholder: `请输入物料编码`,
        },
        queryMaterialName: {
          label: '物料名称',
          type: 'input',
          paramKey: 'queryMaterialName',
          placeholder: `请输入物料名称`,
        },
      };
    },
  },
};
</script>
<style lang="scss" scoped>
:deep(.highlight-row) {
  background-color: var(--el-table-row-active-bg-color); /* 浅绿色背景 */
}
.drawing-wrap {
  width: calc(100% - 10px);
  height: calc(78vh - 10px);
}
</style>
