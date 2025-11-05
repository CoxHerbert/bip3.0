<template>
  <div class="list-page" :loading="loading">
    <div class="header">
      <dc-search
        v-model="queryParams"
        v-bind="searchConfig"
        @reset="handleReset"
        @search="handleSearch"
      />
    </div>
    <div class="action-banner">
      <el-button icon="Plus" type="primary" style="margin-right: 16px" @click="handleInitiate()"
        >新增</el-button
      >
      <el-button type="primary" style="margin-right: 16px" @click="handleInitiateExcel()"
        >导出</el-button
      >
    </div>
    <div class="table-container">
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="dataList"
        row-key="id"
        :span-method="arraySpanMethod"
        @select="handleSelect"
        @select-all="handleSelectAll"
        @selection-change="handleSelectionChange"
        @row-dblclick="row => doAction('dblclick', row)"
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
          <!-- <el-table-column
            v-else-if="col.type === 'index'"
            :key="'index' + i"
            label="序号"
            :align="col.align"
            :width="col.width"
          >
            <template #default="{ $index }">
              {{ $index + 1 }}
            </template>
          </el-table-column> -->
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
              <span v-if="col.prop === 'isDeleted'">
                {{
                  scoped.row[col.prop] === 0
                    ? '询价中'
                    : scoped.row[col.prop] === 1
                    ? '已完成'
                    : scoped.row[col.prop]
                }}
              </span>
              <span v-else>
                {{
                  [null, undefined, ''].includes(scoped.row[col.prop]) ? '-' : scoped.row[col.prop]
                }}
              </span>
            </template>
          </el-table-column>
          <!-- 展开类型 -->
          <el-table-column
            v-else-if="col.type === 'expand'"
            :key="'expand' + i"
            :label="col.label"
            :align="col.align"
          >
            <template #default="props">
              <el-table-column
                v-for="(child, childIndex) in col.children"
                :key="childIndex"
                :prop="child.prop"
                :label="child.label"
                :width="child.width"
                :align="child.align"
              >
                <template #default="scoped">
                  <dc-view
                    v-if="child.type === 'dc-view'"
                    v-model="scoped.row[child.prop]"
                    :objectName="child.objectName"
                  />
                  <span v-else>
                    {{
                      [null, undefined, ''].includes(scoped.row[child.prop])
                        ? '-'
                        : scoped.row[child.prop]
                    }}
                  </span>
                </template>
              </el-table-column>
              <!-- <el-table-column prop="bomCode" label="物料编码" width="120" align="center" />
              <el-table-column prop="bomName" label="物料名称" width="150" align="center" />
              <el-table-column prop="bomModel" label="规格型号" width="120" align="center" />
              <el-table-column prop="bomCount" label="需求数量" width="120" align="center" />
              <el-table-column prop="bomUnit" label="单位" width="120" align="center" />
              <el-table-column prop="customer" label="客户" width="200" align="center">
                <template #default="scoped">
                  <dc-view v-model="scoped.row.customer" :objectName="'customer'" />
                </template>
              </el-table-column>
              <el-table-column prop="taxPrice" label="含税价" width="120" align="center" />
              <el-table-column prop="explanation" label="终端客户价" width="130" align="center" />
              <el-table-column prop="dsnPeopleId" label="处理人" width="110" align="center">
                <template #default="scoped">
                  <dc-view v-model="scoped.row.dsnPeopleId" :objectName="'user'" />
                </template>
              </el-table-column> -->
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
import Api from '@/api/index';
import getOptions from './list';
import listPage from '@/mixins/list-page';
import { exportBlob } from '@/api/common';
import { downloadXls } from '@/utils/util';
export default {
  name: 'inquiryList',
  mixins: [listPage],
  data() {
    const options = getOptions();
    return {
      // 页面数据
      columns: options.columns,
      queryParams: {
        current: 1,
        size: 20,
      },
      batchSelectRows: [],
      dataList: [],
      loading: true,
      total: 0,
      title: '',
      rules: {},
      applyStatus: '',
    };
  },
  created() {
    this.initSearchConfig();
    this.getData();
  },
  methods: {
    // 新增
    async handleInitiate() {
      const params = {
        processKey: 'process_jNpGXcdKmSZtkpi7Sfwz8GJk6netaGhF',
      };
      const res = await this.api.pdp.settled.processForm(params);
      const { code, data } = res.data;
      if (code === 200) {
        this.$router.push(`/workflow/process/start/${data.enCode}`);
      }
    },
    async getData() {
      this.loading = true;
      try {
        // 使用当前的查询参数
        const params = { ...this.queryParams };
        const res = await Api.system.OutsourceQuotation.queryQtList(params);
        const { code, data } = res.data || {};
        if (code === 200 && data) {
          // 处理数据，将 dcQtSonDetails 数组扁平化
          const records = data.records || [];
          const flattenedData = [];

          records.forEach(record => {
            if (record.dcQtSonDetails && record.dcQtSonDetails.length > 0) {
              // 如果有 dcQtSonDetails 数据，为每个子项创建一行
              record.dcQtSonDetails.forEach(detail => {
                flattenedData.push({
                  ...record,
                  ...detail,
                  // 保留原始ID和子项ID
                  mainId: record.id,
                  detailId: detail.id,
                });
              });
            } else {
              // 如果没有 dcQtSonDetails 数据，直接添加原记录
              flattenedData.push({
                ...record,
                mainId: record.id,
                detailId: null,
              });
            }
          });

          this.dataList = flattenedData;
          this.total = data.total || 0;

          // 处理合并单元格数据
          this.getSpanArr(this.dataList);
        }
      } catch (error) {
        console.error(error);
      } finally {
        this.loading = false;
      }
    },

    // 处理合并单元格
    getSpanArr(data) {
      // 清空数据
      this.spanArr = [];
      this.pos = 0;

      // 遍历数据
      for (let i = 0; i < data.length; i++) {
        if (i === 0) {
          this.spanArr.push(1);
          this.pos = 0;
        } else {
          // 判断当前元素与上一个元素的id是否相同
          if (data[i].mainId === data[i - 1].mainId) {
            this.spanArr[this.pos] += 1;
            this.spanArr.push(0);
          } else {
            this.spanArr.push(1);
            this.pos = i;
          }
        }
      }
    },

    // 合并单元格方法
    arraySpanMethod({ row, column, rowIndex, columnIndex }) {
      // 需要合并的列索引（根据实际列顺序调整）
      const mergeColumns = [0, 1, 2, 3]; // 序号、询价单号、创建人、创建日期、询价状态
      if (mergeColumns.includes(columnIndex)) {
        const _row = this.spanArr[rowIndex];
        const _col = _row > 0 ? 1 : 0;
        return {
          rowspan: _row,
          colspan: _col,
        };
      }
    },
    /** 操作 */
    doAction(action, scope = {}) {
      const { row } = scope;
      if (action === 'batchDelete') {
        if (!this.batchSelectRows || this.batchSelectRows.length < 1) {
          this.$message.error('请先勾选要删除的数据');
          return;
        }
        this.deleteData(this.batchSelectRows.map(r => r.id));
      } else if (action === 'delete') {
        if (row && row.id) {
          this.deleteData([row.id]);
        }
      }
    },
    handleInitiateExcel() {
      this.loading = true;
      const paramsWithoutPagination = { ...this.queryParams };
      delete paramsWithoutPagination.current;
      delete paramsWithoutPagination.size;
      // 过滤掉值为 null 的参数
      const filteredParams = Object.fromEntries(
        Object.entries(paramsWithoutPagination).filter(([_, value]) => value !== null)
      );
      console.log(new URLSearchParams(filteredParams).toString());
      this.$confirm('是否导出询价单数据?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        // NProgress.start();
        exportBlob(
          `/blade-bip/dcQt/exportQtList?${new URLSearchParams(filteredParams).toString()}`
        ).then(res => {
          downloadXls(res.data, `询价单数据${this.$dayjs().format('YYYY-MM-DD HH:mm:ss')}.xlsx`);
          // NProgress.done();
          this.loading = false;
        });
      });
    },
    /** 搜索按钮操作 */
    handleSearch(params = {}) {
      this.queryParams = {
        ...this.queryParams,
        ...params,
      };
      this.getData();
    },

    /** 删除（按需对接你的接口） */
    async deleteData(ids = []) {
      try {
        if (!ids.length) return;
        this.$message.success('删除成功');
        this.getData();
      } catch (e) {
        console.error(e);
        this.$message.error('删除失败');
      }
    },
  },
};
</script>
