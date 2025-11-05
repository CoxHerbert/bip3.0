<!-- src/views/appManage/talentPosition/list.vue -->
<template>
  <div class="list-page talent-position-page" v-loading="pageLoading">
    <!-- 顶部工具栏：查询 -->
    <div class="header">
      <dc-search
        v-model="queryParams"
        v-bind="searchConfig"
        @reset="resetQuery"
        @search="handleSearch"
      />
    </div>

    <!-- 操作条 -->
    <div class="action-banner">
      <el-button type="warning" @click="openCreate">新增岗位</el-button>
    </div>

    <div class="table-container">
      <!-- 列表 -->
      <el-table
        :data="list"
        row-key="id"
        border
        v-loading="tableLoading"
        :header-cell-style="{ fontWeight: 600 }"
      >
        <el-table-column type="index" label="#" width="56" align="center" />

        <el-table-column
          prop="postName"
          label="岗位名称"
          min-width="160"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="postDescription"
          label="岗位描述"
          min-width="240"
          show-overflow-tooltip
        />

        <!-- 招聘类型 显示多选标签 -->
        <el-table-column prop="recruitType" label="招聘类型" width="120" align="center">
          <template #default="{ row }">
            <template v-if="row.recruitTypeArr?.length">
              <el-tag v-for="id in row.recruitTypeArr" :key="id" size="small" class="mr-4">
                {{ labelOf(id) }}
              </el-tag>
            </template>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <el-table-column prop="isEnable" label="是否启用" width="120" align="center">
          <template #default="{ row }">
            <el-switch
              :model-value="!!row.isEnable"
              :active-value="true"
              :inactive-value="false"
              @change="toggleEnable(row, $event)"
            />
          </template>
        </el-table-column>

        <el-table-column label="操作" width="140" fixed="right" align="center">
          <template #default="{ row }">
            <el-link type="primary" :underline="false" @click="openEdit(row)">编辑</el-link>
            <el-divider direction="vertical" />
            <el-popconfirm
              title="确认删除该岗位？"
              confirm-button-text="删除"
              cancel-button-text="取消"
              confirm-button-type="danger"
              @confirm="handleRemove(row)"
            >
              <template #reference>
                <el-link type="danger" :underline="false">删除</el-link>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 分页 -->
    <dc-pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.current"
      v-model:limit="queryParams.size"
      @pagination="getData"
    />

    <!-- 新增/编辑 弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="form.id ? '编辑岗位' : '新增岗位'"
      width="560px"
      :close-on-click-modal="false"
      :destroy-on-close="true"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="88px">
        <el-form-item label="岗位名称" prop="postName">
          <el-input
            v-model.trim="form.postName"
            maxlength="60"
            show-word-limit
            placeholder="请输入名称"
          />
        </el-form-item>

        <!-- 表单内多选：v-model 为数组 -->
        <el-form-item label="招聘类型" prop="recruitType">
          <el-checkbox-group v-model="form.recruitType">
            <el-checkbox
              v-for="op in dictRefs.DC_RECRUIT_TYPE"
              :key="op.dictKey"
              :label="op.dictKey"
            >
              {{ op.label }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="是否启用" prop="isEnable">
          <el-switch v-model="form.isEnable" />
        </el-form-item>

        <el-form-item label="岗位描述" prop="postDescription">
          <el-input
            v-model.trim="form.postDescription"
            type="textarea"
            :rows="3"
            maxlength="200"
            show-word-limit
            placeholder="请输入描述"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">保 存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus';
import Api from '@/api';

export default {
  name: 'TalentPositionList',

  data() {
    return {
      /** 页面与表格加载态 */
      pageLoading: false,
      tableLoading: false,

      /** 列表数据与总数 */
      list: [],
      total: 0,

      /** 统一的查询参数（含分页） */
      queryParams: {
        postName: '',
        recruitType: '', // 顶部tab为单选字符串；若做多选搜索，可改数组并用 toIdString
        current: 1,
        size: 20,
      },

      /** 弹窗与表单 */
      dialogVisible: false,
      submitLoading: false,
      form: {
        id: undefined,
        postName: '',
        postDescription: '',
        recruitType: [], // 表单里始终是数组
      },

      rules: {
        postName: [{ required: true, message: '请输入岗位名称', trigger: 'blur' }],
        recruitType: [
          { type: 'array', required: true, message: '请选择招聘类型', trigger: 'change' },
          {
            validator: (_, v, cb) => (v?.length ? cb() : cb(new Error('至少选择一项'))),
            trigger: 'change',
          },
        ],
      },

      dictRefs: {},
      searchConfig: {
        resetExcludeKeys: ['page', 'current', 'recruitType'],
        searchItemConfig: {
          paramType: {
            postName: {
              label: '岗位名称',
              type: 'input',
              placeholder: '请输入岗位名称',
              paramKey: 'postName',
            },
          },
        },
        tabConfig: {
          prop: 'recruitType',
          items: [],
        },
      },
    };
  },

  async created() {
    this.pageLoading = true;
    // 假设你已有字典缓存工具
    this.dictRefs = await this.useAsyncCache([{ key: 'DC_RECRUIT_TYPE' }]);

    // 顶部tab：单选
    const tabs = (this.dictRefs.DC_RECRUIT_TYPE || []).map(item => ({
      ...item,
      value: item.dictKey,
    }));
    this.queryParams.recruitType = '';
    this.searchConfig.tabConfig.items = [{ label: '全部', value: '' }, ...tabs];

    this.getData(true).finally(() => (this.pageLoading = false));
  },

  methods: {
    /** —— 通用转换：字符串 ↔ 数组 —— */
    toIdArray(v) {
      if (Array.isArray(v)) return v.map(String);
      if (typeof v === 'string')
        return v
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);
      if (v == null) return [];
      return [String(v)];
    },
    toIdString(arr) {
      if (Array.isArray(arr)) return arr.map(String).filter(Boolean).join(',');
      if (typeof arr === 'string') return arr;
      return '';
    },
    labelOf(id) {
      const list = this.dictRefs?.DC_RECRUIT_TYPE || [];
      const hit = list.find(o => String(o.dictKey) === String(id));
      return hit?.label ?? id;
    },

    /** 重置查询参数 */
    resetQuery() {
      this.queryParams = {
        ...this.queryParams,
        current: 1,
      };
      this.getData(true);
    },
    handleSearch() {
      this.queryParams.current = 1;
      this.getData(true);
    },

    /** 获取数据（@pagination 也调用它） */
    async getData() {
      try {
        this.tableLoading = true;

        const res = await Api.appManage.talentPosition.getList(this.queryParams);

        // 兼容多种返回结构
        let rows = [];
        let tot = 0;
        if (res?.data?.code === 200) {
          const data = res.data.data || {};
          rows = data.records || data.rows || data.list || [];
          tot = data.total ?? data.count ?? rows.length;
        } else {
          const data = res?.data || res || {};
          rows = data.records || data.rows || data.list || [];
          tot = data.total ?? data.count ?? rows.length;
        }

        this.list = rows.map(it => {
          const arr = this.toIdArray(it.recruitType); // 后端可能返回 'a,b'
          return {
            ...it,
            isEnable: it.isEnable === 1 || it.isEnable === true,
            recruitTypeArr: arr, // 显示数组
            recruitTypeStr: this.toIdString(arr), // 如需字符串也在这
          };
        });
        this.total = tot;
      } catch (e) {
        console.error(e);
        ElMessage.error('查询失败');
      } finally {
        this.tableLoading = false;
      }
    },

    /** 打开新增 */
    openCreate() {
      Object.assign(this.form, {
        id: undefined,
        postName: '',
        postDescription: '',
        isEnable: true,
        recruitType: [], // 表单数组
      });
      this.dialogVisible = true;
    },

    /** 打开编辑 */
    openEdit(row) {
      Object.assign(this.form, {
        id: row.id,
        postName: row.postName,
        postDescription: row.postDescription,
        isEnable: !!row.isEnable,
        // 兼容后端返回 'id,id'
        recruitType: this.toIdArray(row.recruitType),
      });
      this.dialogVisible = true;
    },

    /** 提交（新增/编辑） */
    async handleSubmit() {
      await this.$refs.formRef?.validate();
      try {
        this.submitLoading = true;
        const payload = {
          ...this.form,
          isEnable: this.form.isEnable ? 1 : 0,
          // 核心：表单数组转后端所需 'id,id'
          recruitType: this.toIdString(this.form.recruitType),
        };
        await Api.appManage.talentPosition.submit(payload);
        ElMessage.success(this.form.id ? '编辑成功' : '新增成功');
        this.dialogVisible = false;
        this.getData();
      } catch (e) {
        console.error(e);
        ElMessage.error('保存失败');
      } finally {
        this.submitLoading = false;
      }
    },

    /** 删除 */
    async handleRemove(row) {
      try {
        await Api.appManage.talentPosition.remove({ ids: row.id });
        ElMessage.success('删除成功');
        if (this.list.length === 1 && this.queryParams.current > 1) {
          this.queryParams.current -= 1;
        }
        this.getData();
      } catch (e) {
        console.error(e);
        ElMessage.error('删除失败');
      }
    },

    /** 行内启用开关（最小字段提交，避免把数组等冗余字段回传） */
    async toggleEnable(row, val) {
      const old = !!row.isEnable;
      row.isEnable = val;
      try {
        await Api.appManage.talentPosition.submit({
          id: row.id,
          isEnable: row.isEnable ? 1 : 0,
        });
        ElMessage.success('状态已更新');
      } catch (e) {
        console.error(e);
        row.isEnable = old; // 回滚
        ElMessage.error('更新失败');
      }
    },
  },
};
</script>

<style scoped>
.mr-4 {
  margin-right: 4px;
}
</style>
