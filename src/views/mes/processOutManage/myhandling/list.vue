<template>
  <div class="list-page out-doc-page">
    <div class="header">
      <dc-search
        v-model="queryParams"
        v-bind="searchConfig2"
        @reset="handleReset"
        @search="handleSearch"
      />
    </div>
    <div class="action-banner" v-if="Array.isArray(batchSelectRows) && batchSelectRows.length">
      <el-button type="primary" @click="doAction('addProcess')">添加工艺</el-button>
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
              <!-- <el-button
                v-for="(ids, code, i) in scoped.row.currentOpsData?.[userInfo.user_id] || {}"
                :key="i"
                type="text"
                @click="doAction(code, scoped, ids)"
              >
                <dc-dict-key :options="dicts?.DC_PROCESS_STEP_STATUS" :value="code" />
              </el-button> -->
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
            :show-overflow-tooltip="col.type !== 'workOrderProgress'"
          >
            <template #default="scoped">
              <div
                v-if="col.type === 'workOrderProgress'"
                class="progress-wrap"
                v-drag-scroll="{ momentum: true, multiplier: 1, clickThreshold: 5 }"
              >
                <workOrderProgress
                  :nodes="scoped.row[col.prop]"
                  :hover-api="
                    p => {
                      console.log(p);
                      return Api.mes.forward.getProcessHoverInfo(p);
                    }
                  "
                />
              </div>
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
    </div>
    <dc-pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.current"
      v-model:limit="queryParams.size"
      @pagination="getData"
    />
    <drawerDone ref="drawerDoneRef" v-model="visibleDrawerDone" @success="handleSuccess" />
    <drawerForward ref="drawerForwardRef" v-model="visibleDrawerForward" @success="handleSuccess" />
    <drawerTasks ref="drawerTasksRef" v-model="visibleDrawerTasks" @success="handleSuccess" />
    <BatchTransferDialog ref="dialogRef" @submit="handleSubmit" />
  </div>
</template>
<script>
import listPage from '@/mixins/list-page';
import options from './list';
import Api from '@/api';
import workOrderProgress from './../outDoc/cnps/workOrderProgress.vue';
import drawerDone from './drawerList/drawerDone.vue';
import drawerForward from './drawerList/drawerForward.vue';
import drawerTasks from './drawerList/drawerTasks.vue';
import BatchTransferDialog from './cnps/BatchTransferDialog.vue';

export default {
  components: { workOrderProgress, drawerDone, drawerForward, drawerTasks, BatchTransferDialog },
  mixins: [listPage],
  dicts: ['DC_FORWARD_STATUS', 'DC_PROCESS_STEP_STATUS'],
  name: 'out-doc-list',
  data() {
    return {
      mode: 'customize',
      columns: [],
      queryParams: {
        current: 1,
        size: 20,
      },
      visibleDrawerDone: false,
      visibleDrawerForward: false,
      visibleDrawerTasks: false,
    };
  },
  computed: {
    searchConfig2() {
      const base = this.searchConfig ?? {};
      const dict =
        [
          {
            id: '1958414754783076353',
            tenantId: '000000',
            parentId: '1958414587259248642',
            code: 'DC_FORWARD_STATUS',
            dictKey: 'DC_FORWARD_STATUS_WD',
            dictValue: '我的',
            sort: 1,
            remark: '',
            isSealed: null,
            opsType: null,
            isDeleted: null,
            listClass: 'dict-default',
          },
          {
            id: '1958414754783076353',
            tenantId: '000000',
            parentId: '1958414587259248642',
            code: 'DC_FORWARD_STATUS',
            dictKey: 'DC_FORWARD_STATUS_JXZ',
            dictValue: '进行中',
            sort: 2,
            remark: '',
            isSealed: null,
            opsType: null,
            isDeleted: null,
            listClass: 'dict-default',
          },
          {
            id: '1958414918976733186',
            tenantId: '000000',
            parentId: '1958414587259248642',
            code: 'DC_FORWARD_STATUS',
            dictKey: 'DC_FORWARD_STATUS_YWC',
            dictValue: '已完成',
            sort: 3,
            remark: '',
            isSealed: null,
            opsType: null,
            isDeleted: null,
            listClass: 'dict-1',
          },
        ] ?? [];

      // 将字典安全映射为 tabs 项；不修改原数组
      const items = dict.map(d => ({
        label: d.dictValue ?? d.label ?? '',
        value: d.dictKey ?? d.value ?? '',
      }));

      // 纯返回新对象，避免改动 this.searchConfig
      return {
        ...base,
        resetExcludeKeys: ['page', 'current', 'billStatus'],
        tabConfig: {
          prop: 'billStatus',
          items,
        },
      };
    },
    userInfo() {
      return this.$store.getters.userInfo;
    },
  },
  created() {
    this.columns = options().columns;
    this.handleDictKeys();
    this.getDictData().then(() => {
      this.initSearchConfig();
      this.queryParams.billStatus = 'DC_FORWARD_STATUS_WD';
    });
  },
  mounted() {
    this.getData();
  },
  methods: {
    /** 获取列表数据 **/
    getData() {
      this.$nextTick(() => {
        this.loading = true;
        let params = {
          ...this.queryParams,
        };
        if (this.queryParams.billStatus === 'DC_FORWARD_STATUS_WD') {
          params = {
            ...this.queryParams,
            billStatus: null,
            myPlan: true,
          };
        }
        Api.mes.forward
          .getForwardPlanList(params)
          .then(res => {
            const { code, data } = res.data;
            if (code === 200) {
              this.tableData = data.records.map(item => ({
                ...item,
                currentOpsData: JSON.parse(item.currentOpsData),
              }));
              this.total = data.total;
            }
            this.loading = false;
          })
          .catch(err => {
            this.loading = false;
            console.error(err);
          });
      });
    },
    handleSuccess() {
      this.getData();
    },
    doAction(action, scope = {}, ids) {
      const { row } = scope;
      if (action === 'add') {
        this.$router.push({
          path: '/mes/processOutManage/outDoc/addOrEdit',
          query: {
            type: action,
            parentMenuId: '1957702102835257345',
          },
        });
      } else if (action === 'look' || action === 'edit') {
        this.$router.push({
          path: '/mes/processOutManage/outDoc/addOrEdit',
          query: {
            id: row.id,
            type: action,
            parentMenuId: '1957702102835257345',
          },
        });
      } else if (action === 'DC_PROCESS_STEP_STATUS_BJWC') {
        this.visibleDrawerDone = true;
        this.$refs.drawerDoneRef.openDrawer({
          ids,
          row,
          action,
        });
      } else if (action === 'DC_PROCESS_STEP_STATUS_GYZF') {
        this.visibleDrawerForward = true;
        this.$refs.drawerForwardRef.openDrawer({
          ids,
          row,
          action,
        });
      } else if (action === 'DC_PROCESS_STEP_STATUS_GYSXD') {
        this.visibleDrawerTasks = true;
        this.$refs.drawerTasksRef.openDrawer({
          ids,
          row,
          action,
        });
      } else if (action === 'addProcess') {
        this.open = true;
        this.$refs.dialogRef.open(this.batchSelectRows, {
          title: '添加工艺',
        });
      }
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
:deep(.dict-text) {
  color: unset;
}
:deep(.el-button) {
  margin-left: 0;
}
.table-container {
  display: flex;
  justify-content: flex-start;
  .left-main {
    width: 200px;
    border: 1px solid #e4e7ed;
    padding: 10px;
    font-size: 14px;
    color: #303133;
  }
}
.out-doc-page {
  .progress-wrap {
    padding-top: 2px;
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    user-select: none;
    cursor: grab;

    &.is-grabbing {
      cursor: grabbing;
    }

    // 你的滚动条样式
    &::-webkit-scrollbar {
      height: 2px;
      background-color: transparent;
    }
    &::-webkit-scrollbar-thumb {
      background-color: transparent;
      border-radius: 4px;
    }
    &:hover {
      &::-webkit-scrollbar-thumb {
        background-color: rgba(0, 0, 0, 0.3);
      }
      &::-webkit-scrollbar-track {
        background-color: rgba(0, 0, 0, 0.05);
      }
    }
  }
}
</style>
