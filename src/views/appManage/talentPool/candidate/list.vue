<!-- src/pages/candidate/CandidateListOptions.vue -->
<template>
  <div class="list-page candidate-layout">
    <!-- 顶部状态分组 -->
    <div class="header">
      <dc-search
        v-model="queryParams"
        v-bind="searchConfig"
        @reset="handleReset"
        @search="handleSearch"
      />
    </div>

    <div class="mian-content">
      <!-- 左侧：菜单 -->
      <aside class="side">
        <el-input
          v-model="postName"
          size="small"
          placeholder="输入岗位名称"
          prefix-icon="Search"
          class="side-search"
          clearable
          @keyup.enter="getTalentPosition"
        />
        <el-menu class="side-menu" :default-active="activeMenu" @select="onMenuSelect">
          <el-menu-item index="">全部</el-menu-item>
          <el-menu-item :index="post.id" v-for="(post, index) in postList" :key="index">{{
            post.postName
          }}</el-menu-item>
        </el-menu>
      </aside>

      <!-- 右侧：主体 -->
      <section class="main" v-loading="loading">
        <!-- 顶部工具条 -->
        <div class="topbar">
          <el-button
            type="warning"
            size="small"
            class="ml8"
            @click="batchSms"
            :disabled="!batchSelectRows.length"
            >短信通知</el-button
          >
        </div>

        <!-- 表格：占满剩余空间，无滚动条 -->
        <div class="table-wrap">
          <el-table
            :data="tableData"
            border
            stripe
            height="100%"
            @selection-change="handleSelectionChange"
          >
            <!-- 动态列渲染 -->
            <template v-for="col in opts.columns" :key="col.prop || col.type">
              <!-- 勾选列 -->
              <el-table-column
                v-if="col.type === 'selection'"
                type="selection"
                :width="col.width"
                :align="col.align || 'left'"
              />
              <!-- 序号列 -->
              <el-table-column
                v-else-if="col.type === 'index'"
                :label="col.label"
                :width="col.width"
                :align="col.align || 'left'"
              >
                <template #default="scope">
                  {{ col.render ? col.render(scope) : scope.$index + 1 }}
                </template>
              </el-table-column>
              <!-- 操作列（支持 children[].showFunc） -->
              <el-table-column
                v-else-if="col.type === 'actions'"
                :label="col.label"
                :width="col.width"
                :fixed="col.fixed"
                :align="col.align || 'center'"
              >
                <template #default="scope">
                  <el-button
                    v-for="(btn, i) in col.children"
                    :key="i"
                    size="small"
                    text
                    type="primary"
                    v-show="!btn.showFunc || btn.showFunc(scope)"
                    @click="handleAction(btn.action, scope.row)"
                  >
                    {{ btn.label }}
                  </el-button>
                </template>
              </el-table-column>
              <!-- 通用列：优先自定义render；其次字典；否则纯文本 -->
              <el-table-column
                v-else
                :prop="col.prop"
                :label="col.label"
                :width="col.width"
                :min-width="col.minWidth"
                :fixed="col.fixed"
                :align="col.align || 'left'"
                show-overflow-tooltip
              >
                <template #default="scope">
                  <RenderCell v-if="col.render" :render="col.render" :scope="scope" />
                  <component
                    v-else-if="col.props || col.props?.is"
                    :is="col.props?.is"
                    v-bind="col.props"
                    v-model="scope.row[col.prop]"
                  />
                  <dc-dict-key
                    v-else-if="col.dictOptions || col.dictKey"
                    :options="getDictOptions(col)"
                    :value="scope.row[col.prop]"
                  />
                  <span v-else>{{ scope.row[col.prop] ?? '-' }}</span>
                </template>
              </el-table-column>
            </template>
          </el-table>
        </div>

        <!-- 底部：dc-pagination（保持你当前用法） -->
        <div class="footer">
          <dc-pagination
            v-show="total > 0"
            :total="total"
            v-model:page="queryParams.current"
            v-model:limit="queryParams.size"
            @pagination="getData"
          />
        </div>

        <!-- 抽屉：快速跟进 -->
        <FollowDrawer
          v-model="drawerOpen"
          :size="'80vw'"
          :talent="currentTalent"
          :records="currentRecords"
          @save="onSaved"
          @update="onUpdated"
          @delete="onDeleted"
        />
      </section>
    </div>
  </div>
</template>

<script>
import { options, searchConfig } from './listOptions';
import FollowDrawer from './cnps/FollowDrawer.vue';
import Api from '@/api';
import listPage from '@/mixins/list-page';

/* 让列配置里的 render(scope) 可用 */
const RenderCell = {
  name: 'RenderCell',
  props: ['render', 'scope'],
  render() {
    return this.render(this.scope);
  },
};

export default {
  name: 'CandidateListOptions',
  components: { FollowDrawer, RenderCell },
  mixins: [listPage],
  data() {
    const opts = options();

    // 初始化搜索模型
    const query = {};
    opts.columns
      .filter(c => c.search)
      .forEach(c => (query[c.prop] = c.searchProps?.is === 'daterange' ? [] : ''));

    return {
      opts,
      query,
      activeMenu: 'all',
      // 表格数据（接口返回）
      tableData: [],
      loading: false,
      // 分页
      queryParams: { current: 1, size: 20 },
      total: 0,
      // 抽屉
      drawerOpen: false,
      currentTalent: {},
      currentRecords: [],
      // —— 字典缓存（dictKey -> [{label,value}]）——
      dictRefs: {},
      searchConfig: {},
      postList: [],
      postName: '',
    };
  },
  computed: {
    searchCols() {
      return this.opts.columns.filter(c => c.search);
    },
  },
  async created() {
    // 收集所有需要的字典 key，一次性取回
    const dictKeys = [
      'DC_PARSING_STATUS',
      'DC_UPLOAD_POST',
      'DC_PARING_TYPE',
      'DC_FOLLOW_TYPE',
      'DC_EVALUATION_STATUS',
      'DC_SMS_STATUS',
    ].map(val => {
      return {
        key: val,
      };
    });
    this.dictRefs = await this.useAsyncCache(dictKeys);
    const tabs = [
      {
        label: '全部',
        value: '',
      },
      ...this.dictRefs.DC_EVALUATION_STATUS,
    ];
    this.searchConfig = searchConfig(tabs, this.dictRefs.DC_SMS_STATUS);
    this.getData();
    this.getTalentPosition();
    this.queryParams.interviewStatus = '';
  },
  methods: {
    /* 根据列配置拿字典 options */
    getDictOptions(col) {
      if (Array.isArray(col.dictOptions)) return col.dictOptions;
      if (col.dictKey) return this.dictRefs?.[col.dictKey] || [];
      return [];
    },
    getTalentPosition() {
      Api.appManage.talentPosition
        .getList({
          current: 1,
          size: 9999,
          postName: this.postName,
        })
        .then(res => {
          const { code, data } = res.data;
          if (code === 200) {
            this.postList = data.records;
          }
        });
    },
    handleReset() {
      this.queryParams.current = 1;
      this.queryParams.interviewStatus = '';
      this.queryParams.postId = '';
      this.activeMenu = '';
      this.getData();
    },
    handleSearch() {
      this.queryParams.current = 1;
      this.getData();
    },
    /* ==== 真实接口请求 ==== */
    async getData() {
      this.loading = true;
      try {
        const res = await Api.appManage.talentUser.getList(this.queryParams);
        // 兼容常见返回结构
        const { code, data } = res.data;
        if (code === 200) {
          const list = data?.records ?? data?.rows ?? data?.list ?? [];
          this.tableData = Array.isArray(list) ? list : [];
          this.total = Number(data?.total ?? 0);
        }
        this.loading = false;
      } catch (err) {
        console.error('getList error:', err);
        this.$message.error('列表获取失败');
        this.tableData = [];
        this.total = 0;
      } finally {
        this.loading = false;
      }
    },

    // 操作列
    handleAction(action, row) {
      if (action === 'followUp') {
        this.currentTalent = {
          talentUserId: row.id,
          name: row.name,
          sex: row.sex,
          age: row.age,
          phone: row.phone,
          postPath: row.joinPostIds || row.followPostName,
          resumeUrl: row.resumeUrl,
        };
        this.currentRecords = [];
        this.drawerOpen = true;
        return;
      }
      if (action === 'look') {
        this.$message.info(`查看：${row.name || row.materialName || row.id}`);
        return;
      }
      if (action === 'edit') {
        this.$router.push({
          path: '/appManage/talentPool/candidate/detailOrEdit',
          query: { id: row.id, type: 'edit', parentMenuId: '1962342504207798273' },
        });
        return;
      }
      if (action === 'view') {
        this.$router.push({
          path: '/appManage/talentPool/candidate/detailOrEdit',
          query: { id: row.id, type: 'edit', parentMenuId: '1962342504207798273' },
        });
      }
    },

    batchSms() {
      if (!this.batchSelectRows.length) return this.$message.warning('请选择人员发送短信通知');
      const ids = this.batchSelectRows.map(item => item.id);
      const names = this.batchSelectRows.map(item => item.name);

      this.$confirm(`确认向“${names}”发送短信通知吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.loading = true;
        Api.appManage.talentUser
          .sendSms(ids)
          .then(res => {
            const { code } = res.data;
            if (code === 200) {
              this.getData();
            }
            this.loading = false;
          })
          .catch(err => {
            this.loading = false;
          });
      });
    },
    onSaved(payload) {
      console.log('save', payload);
      this.handleReset();
    },
    onUpdated(payload) {
      console.log('update', payload);
      this.handleReset();
    },
    onDeleted(payload) {
      console.log('delete', payload);
      this.handleReset();
    },
    onMenuSelect(val) {
      this.queryParams.postId = val;
      this.activeMenu = val;
      this.handleSearch();
    },
  },
};
</script>

<style scoped lang="scss">
/* 整页无滚动条，自适应填满容器 */
.candidate-layout {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #fff;
}
.header {
  flex: 0 0 auto;
  padding: 0 12px 0;
}
.mian-content {
  flex: 1 1 0;
  min-height: 0;
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 12px;
  box-sizing: border-box;
  overflow: hidden;
}
.side {
  border-right: 1px dashed #e5e7eb;
  padding-right: 8px;
  min-height: 0;
  overflow: hidden;
  .side-search {
    margin-bottom: 8px;
  }
  .side-menu {
    border-right: none;
  }
}
.main {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}
.topbar {
  flex: 0 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  .ml8 {
    margin-left: 8px;
  }
  .right {
    display: flex;
    align-items: center;
  }
  .q-input {
    width: 220px;
    margin: 0 6px;
  }
}
.table-wrap {
  flex: 1 1 0;
  min-height: 0;
  overflow: hidden;
}
.footer {
  flex: 0 0 auto;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 8px 0;
}
:deep(.el-table) {
  border-radius: 6px;
}
</style>
