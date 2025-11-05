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
    <!-- <div class="action-banner">
      <el-button icon="Plus" type="primary" @click="doAction('add')">创建</el-button>
    </div> -->
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
  </div>
</template>
<script>
import listPage from '@/mixins/list-page';
import options from './listOptions';
import Api from '@/api';
import workOrderProgress from './cnps/workOrderProgress.vue';

export default {
  components: { workOrderProgress },
  mixins: [listPage],
  dicts: ['DC_FORWARD_STATUS'],
  name: 'out-doc-list',
  data() {
    return {
      mode: 'customize',
      columns: [],
      queryParams: {
        current: 1,
        size: 20,
      },
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
            dictKey: 'DC_FORWARD_STATUS_JXZ',
            dictValue: '进行中',
            sort: 2,
            remark: '',
            isSealed: null,
            status: null,
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
            status: null,
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
  },
  created() {
    this.columns = options().columns;
    this.handleDictKeys();
    this.getDictData().then(() => {
      this.initSearchConfig();
      this.queryParams.billStatus = 'DC_FORWARD_STATUS_JXZ';
    });
  },
  mounted() {
    this.getData();
  },
  methods: {
    /** 获取列表数据 **/
    getData() {
      this.loading = true;
      Api.mes.forward
        .getForwardPlanList(this.queryParams)
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
