<template>
  <basic-container>
    <div class="list-page">
      <div class="header">
        <dc-search
          v-model="queryParams"
          v-bind="searchConfig"
          @reset="handleReset"
          @search="handleSearch"
        />
      </div>
      <div class="action-banner">
        <el-button type="primary" icon="Plus" @click="doAction('add')">新增</el-button>
      </div>
      <div class="table-container">
        <el-table
          ref="tableRef"
          v-loading="loading"
          :data="tableData"
          row-key="id"
          @row-dblclick="
            row => {
              doAction('row-dblclick', row);
            }
          "
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
                <template v-if="col.type === 'rowText'">
                  <template v-if="col?.transVal">
                    {{ col?.transVal(scoped, this.dictMaps.DC_SIP_CHECK_ITEM) }}
                  </template>
                  <template v-else>
                    {{
                      [null, undefined, ''].includes(scoped.row[col.prop])
                        ? '-'
                        : scoped.row[col.prop]
                    }}
                  </template>
                </template>
                <template v-else-if="col.type === 'image'">
                  <el-image
                    v-if="scoped.row.fileUrl"
                    :src="scoped.row.fileUrl"
                    :preview-src-list="[scoped.row.fileUrl]"
                    preview-teleported="true"
                    style="width: 20px; height: 20px; position: relative; z-index: 10"
                    fit="cover"
                  />
                  <span v-else>-</span>
                </template>
                <template v-else-if="col.type === 'dict'">
                  <template v-if="col.dicData">
                    <el-tag :type="scoped.row[col.prop] === 1 ? 'success' : 'info'">
                      {{
                        col.dicData.find(item => item.value === scoped.row[col.prop])?.label || '-'
                      }}
                    </el-tag>
                  </template>
                  <dc-dict-key
                    v-else-if="dictMaps[col.dictKey]"
                    type="text"
                    :options="dictMaps[col.dictKey]"
                    :value="scoped.row[col.prop]"
                  ></dc-dict-key>
                  <span v-else>-</span>
                </template>
                <template v-else>
                  {{
                    [null, undefined, ''].includes(scoped.row[col.prop])
                      ? '-'
                      : scoped.row[col.prop]
                  }}
                </template>
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
    <AddEditeDialog ref="addEditeDialogRef" :options="childOptions" @success="handleReset" />
  </basic-container>
</template>

<script>
import listPage from '@/mixins/list-page';
import options from './index.js';
import AddEditeDialog from './addEditeDialog.vue';

export default {
  components: { AddEditeDialog },
  mixins: [listPage],
  name: 'sip-class-list',
  data() {
    return {
      mode: 'customize',
      columns: [],
      childOptions: [],
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
  methods: {
    /** 获取列表数据 **/
    getData() {
      this.loading = true;
      const params = {
        ...this.queryParams,
      };
      this.api.qms.sn
        .sipTypeList(params)
        .then(res => {
          const { code, data } = res.data;
          if (code === 200) {
            this.tableData = data.records || [];
            this.total = data.total || 0;
            this.queryParams.current = data.current;
            this.queryParams.size = data.size;
            const options = [...new Set(this.tableData.map(item => item.moduleName))];
            console.log('moduleName', options);
            this.childOptions = options || [];
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
      if (action === 'delete') {
        this.deleteData([scope.row.id]);
      } else if (action === 'edit') {
        this.$refs.addEditeDialogRef.openDialog(row);
      } else if (action === 'add') {
        this.$refs.addEditeDialogRef.openDialog();
      } else if (action === 'row-dblclick') {
        this.$refs.addEditeDialogRef.openDialog(row);
      }
    },
    /** 处理删除 **/
    deleteData(ids) {
      this.loading = true;
      this.handleDeleteCommon(
        ids.join(','),
        `确定要删除数据id为[${ids.join(',')}]的数据项？`,
        this.api.qms.sn.sipTypeRemove
      );
      this.loading = false;
    },
  },
};
</script>

<style lang="scss" scoped>
:deep(.el-image-viewer__wrapper) {
  z-index: 3000 !important;
}
</style>
