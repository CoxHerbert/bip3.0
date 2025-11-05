<template>
  <basic-container>
    <div class="list-edit-page mrp-list-page">
      <div class="header">
        <dc-search
          v-model="queryParams"
          v-bind="searchConfig"
          @reset="handleReset"
          @search="handleSearch"
        />
      </div>
      <div class="action-banner"></div>
      <div class="table-container">
        <el-form ref="formRef" class="form-main" :model="tableData">
          <!-- :rules="getTableRule(group.items)" -->
          <el-form-item class="form-item-table" :label-width="0">
            <el-table
              ref="tableRef"
              v-loading="loading"
              :data="tableData"
              row-key="id"
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
                  :width="col.width ? col.width : 180"
                  :min-width="col.minWidth"
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
                    <div
                      class="cell-box"
                      :class="getCellBoxClass(scoped, col)"
                      @click.stop="handleCellClick(scoped, col)"
                    >
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
                        <dc-view
                          v-if="['dc-select-user'].includes(col.type)"
                          v-model="scoped.row[col.prop]"
                          objectName="user"
                        />
                        <dc-view
                          v-if="['wf-select-dialog', 'dc-select-dialog'].includes(col.type)"
                          v-model="scoped.row[col.prop]"
                          :objectName="col.props.objectName"
                        />
                        <dc-dict-key
                          v-if="['dict'].includes(col.type)"
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
    </div>
  </basic-container>
  <!-- <his-price ref="hisPriceRef" /> -->
</template>
<script>
import unsavedChanges from '@/mixins/unsaved-changes';
import listEditPage from '@/mixins/list-edit-page';
// import useEditState from '@/mixins/useEditState';
import options from './list';
import { mapGetters } from 'vuex';
// import hisPrice from './cpns/his-price.vue';
import BigNumber from 'bignumber.js';

export default {
  //   components: { hisPrice },
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
    };
  },
  computed: {
    ...mapGetters(['userInfo']),
  },
  created() {
    this.columns = options().columns;
    this.handleDictKeys();
    this.getDictData().then(() => {
      this.initSearchConfig();
      this.searchConfig.tabConfig = {
        prop: 'label',
        items: [
          { label: '未考核', value: '未考核' },
          { label: '有异议', value: '有异议' },
          { label: '已考核', value: '已考核' },
        ],
      };

      this.queryParams.label = '未考核';
      this.addSearchConfig();
    });
  },
  mounted() {
    this.getData();
  },
  methods: {
    /** 获取列表数据 **/
    getData() {
      this.loading = true;
      this.api.system.po
        .getAssessmentRecordList(this.queryParams)
        .then(res => {
          const { code, data } = res.data;
          if (code === 200) {
            this.tableData = data;
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
        // 这里需要判断当前用户跟考核人id是否一样
        console.log(this.userInfo.user_id, row.assessorId);
        if (this.userInfo.user_id !== row.assessorId) {
          this.$message.error('您不是考核人，不能查看');
          return;
        }
        this.$router.push({
          path: '/system/companyUser/index',
          query: {
            templateId: row.templateId,
            department: row.department,
            assessor: row.assessor,
            label: this.queryParams.label,
            assessmentPeriod: row.assessmentPeriod,
          },
        });
      } else if (action === 'batchDelete') {
        if (this.batchSelectRows.length < 1) {
          this.$message.error('请先勾选要删除的数据');
          return;
        }
        this.deleteData(this.batchSelectRows.map(row => row.id));
      } else if (action === 'delete') {
        deleteData([scope.row.id]);
      } else if (action === 'his-price') {
        // this.$refs.hisPriceRef.openDialog(row);
      }
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
      // this.searchConfig.searchItemConfig.paramType = null;
    },
  },
};
</script>
<style lang="scss" scoped>
.mrp-list-page {
  :deep(.form-main) {
    width: 100%;
    height: 100%;
  }
}
:deep(.el-table) {
  .warning-row {
    --el-table-tr-bg-color: var(--el-color-warning-light-9);
  }
}
:deep(.highlight-row) {
  background-color: var(--el-table-row-active-bg-color); /* 浅绿色背景 */
}
</style>
