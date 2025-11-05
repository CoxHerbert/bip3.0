<template>
  <div class="content-warp page-translation-list">
    <div class="header search-areaHeader">
      <!-- <dc-search
        v-model="queryParams"
        v-bind="searchConfig"
        @reset="handleReset"
        @search="handleSearch"
      /> -->

      <div class="title"></div>
      <div class="search-area">
        <el-form :inline="true" :model="queryParams" class="search-form">
          <el-form-item label="常量分类" prop="constantType">
            <el-select
              style="width: 220px"
              v-model="form.constantType"
              clearable
              value-key="id"
              @change="handleChange"
              placeholder="请选择参考模版"
            >
              <el-option
                v-for="item in DC_NAMEPLATE_TYPE_PARAMETER"
                :key="item.dictKey"
                :label="item.dictValue"
                :value="item.dictKey"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <!-- <el-button type="primary" @click="handleSearch">搜索</el-button> -->
            <el-button @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="action-banner">
      <el-button type="primary" icon="Plus" @click="openEditDrawer('add')">新增</el-button>
    </div>
    <div class="table-container">
      <el-table
        :data="tableData.filter(item => item.isDeleted !== 1)"
        @selection-change="handleSelectionChange"
        border
        v-loading="loading"
      >
        <!-- <el-table-column
          prop="constantType"
          label="常量分类"
          min-width="120"
          show-overflow-tooltip
        /> -->
        <el-table-column
          prop="constantType"
          label="常量分类"
          align="center"
          min-width="160"
          show-overflow-tooltip
        >
          <template #default="scoped">
            <dc-dict-key :options="DC_NAMEPLATE_TYPE_PARAMETER" :value="scoped.row.constantType" />
          </template>
        </el-table-column>
        <el-table-column prop="nameplateField" label="栏位" min-width="120" show-overflow-tooltip />
        <!-- <el-table-column prop="nameplateName" label="名称" min-width="150" show-overflow-tooltip /> -->
        <el-table-column
          prop="variableExpression"
          label="变量表达式"
          align="center"
          min-width="160"
          show-overflow-tooltip
        >
          <template #default="scoped">
            <dc-dict-key
              :options="DC_NAMEPLATE_EXPRESSION"
              :value="scoped.row.variableExpression"
            />
          </template>
        </el-table-column>
        <!-- <el-table-column
          prop="variableExpression"
          label="变量表达式"
          min-width="150"
          show-overflow-tooltip
        /> -->

        <el-table-column prop="isSn" label="是否SN" width="100" align="center">
          <template #default="scoped">
            <el-tag :type="scoped.row.isSn === 'true' ? 'success' : 'info'">
              {{ scoped.row.isSn === '是' ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="defaultValue" label="默认值" min-width="120" show-overflow-tooltip />
        <el-table-column prop="nameplateSort" label="排序" width="80" align="center" />
        <el-table-column label="操作" align="center" fixed="right" width="150">
          <template #default="scoped">
            <el-button link type="primary" @click="openEditDrawer('edit', scoped.row)">
              修改
            </el-button>
            <el-button link type="danger" @click="handleDelete(scoped.row)"> 删除 </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <dc-pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.current"
      v-model:limit="queryParams.size"
      @pagination="getData"
    />
    <!-- 编辑抽屉 -->
    <el-drawer
      :title="isEdit ? '编辑铭牌分类' : '新增铭牌分类'"
      v-model="drawerVisible"
      direction="rtl"
      :before-close="handleClose"
      size="50%"
    >
      <div class="drawer-container">
        <el-form :model="form" :rules="rules" ref="formRef" label-width="120px" size="medium">
          <el-form-item label="常量分类" prop="constantType">
            <el-select
              v-model="form.constantType"
              value-key="id"
              placeholder="请选择参考模版"
              filterable
              allow-create
              default-first-option
            >
              <el-option
                v-for="item in DC_NAMEPLATE_TYPE_PARAMETER"
                :key="item.dictKey"
                :label="item.dictValue"
                :value="item.dictKey"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="栏位" prop="nameplateField">
            <el-input v-model="form.nameplateField" placeholder="请输入栏位" />
          </el-form-item>
          <el-form-item label="变量表达式" prop="variableExpression">
            <el-select
              v-model="form.variableExpression"
              value-key="id"
              placeholder="请选择参考模版"
            >
              <el-option
                v-for="item in DC_NAMEPLATE_EXPRESSION"
                :key="item.dictKey"
                :label="item.dictValue"
                :value="item.dictKey"
              />
            </el-select>
          </el-form-item>
          <!-- <el-form-item label="排序" prop="nameplateSort">
            <el-input-number
              v-model="form.nameplateSort"
              :min="tableData.length + 1"
              :max="999"
              placeholder="请输入排序"
            />
          </el-form-item> -->
          <el-form-item label="是否SN" prop="isSn">
            <el-radio-group v-model="form.isSn">
              <el-radio label="是">是</el-radio>
              <el-radio label="否">否</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="默认值" prop="defaultValue">
            <el-input v-model="form.defaultValue" placeholder="请输入默认值" />
          </el-form-item>
          <el-form-item label="排序" prop="nameplateSort">
            <el-input-number
              v-model="form.nameplateSort"
              :min="0"
              :max="999"
              placeholder="请输入排序"
            />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="doAction('submit')">提交</el-button>
          <el-button @click="doAction('close')">取消</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup name="TranslationList">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getCurrentInstance } from 'vue';
import Api from '@/api/index';

const { proxy } = getCurrentInstance();
const dictCache = proxy.useCache([
  { key: 'DC_NAMEPLATE_TYPE_PARAMETER' },
  { key: 'DC_NAMEPLATE_EXPRESSION' },
]);
const { DC_NAMEPLATE_TYPE_PARAMETER, DC_NAMEPLATE_EXPRESSION } = dictCache;
// const searchConfig = ref({});
// searchConfig.value.searchItemConfig.paramType = {};
// 响应式数据
const loading = ref(false);
const queryParams = ref({
  current: 1,
  size: 20,
});
const total = ref(0);
const tableData = ref([]);
const batchDelete = ref([]);

// 抽屉相关
const drawerVisible = ref(false);
const isEdit = ref(false);
const formRef = ref(null);

// 表单数据
const form = reactive({
  id: null,
  tenantId: '',
  constantType: '',
  nameplateField: '',
  nameplateName: '',
  nameplateSort: 0,
  isSn: '否',
  defaultValue: '',
});

// 表单验证规则
const rules = {
  constantType: [{ required: true, message: '请输入常量分类', trigger: 'blur' }],
  nameplateField: [{ required: true, message: '请输入栏位', trigger: 'blur' }],
  nameplateName: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  nameplateSort: [{ required: true, message: '请输入排序', trigger: 'blur' }],
  isSn: [{ required: true, message: '请选择是否SN', trigger: 'change' }],
};

// 表格高度
const tableHeight = ref(500);

// 计算属性
const userInfo = computed(() => {
  return proxy.$store.getters.userInfo;
});

// 生命周期
onMounted(() => {
  getData();
  calcTableHeight();
  window.addEventListener('resize', calcTableHeight);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', calcTableHeight);
});

// 方法

/** 计算表格高度 */
const calcTableHeight = () => {
  tableHeight.value = window.innerHeight - 280;
};

/** 获取数据列表 */
const getData = async () => {
  try {
    loading.value = true;
    const res = await Api.mes.moveLabel.nameplateList(queryParams.value);
    const { code, data } = res.data;
    if (code === 200) {
      tableData.value = data.records || [];
      total.value = data.total || 0;
    } else {
      ElMessage.error(res.data.msg || '获取数据失败');
    }
  } catch (error) {
    console.error('获取数据失败:', error);
    ElMessage.error('获取数据失败');
  } finally {
    loading.value = false;
  }
};

/** 搜索 */
const handleSearch = () => {
  queryParams.value.current = 1;
  getData();
};
const handleChange = val => {
  queryParams.value.constantType = val;
  queryParams.value.current = 1;
  getData();
};
/** 重置查询 */
const resetQuery = () => {
  queryParams.value.constantType = '';
  queryParams.value.nameplateField = '';
  queryParams.value.nameplateName = '';
  queryParams.value.current = 1;
  getData();
};

/** 打开编辑抽屉 */
const openEditDrawer = (type = 'add', row = null) => {
  isEdit.value = type === 'edit';

  if (isEdit.value && row) {
    // 编辑模式，填充数据
    Object.assign(form, {
      id: row.id,
      tenantId: row.tenantId || '',
      constantType: row.constantType || '',
      nameplateField: row.nameplateField || '',
      nameplateName: row.nameplateName || '',
      nameplateSort: row.nameplateSort || 0,
      isSn: row.isSn === '是' ? '是' : '否',
      defaultValue: row.defaultValue || '',
    });
  } else {
    // 新增模式，重置表单
    Object.assign(form, {
      id: null,
      tenantId: userInfo.value?.user_id || '',
      constantType: '',
      nameplateField: '',
      nameplateName: '',
      nameplateSort: 0,
      isSn: '否',
      defaultValue: '',
    });
  }
  drawerVisible.value = true;
};

/** 关闭抽屉 */
const handleClose = () => {
  drawerVisible.value = false;
  formRef.value?.resetFields();
};

/** 动作处理 */
const doAction = action => {
  if (action === 'submit') {
    formRef.value.validate(valid => {
      if (valid) {
        handleSave();
      } else {
        return false;
      }
    });
  } else if (action === 'close') {
    handleClose();
  }
};

/** 保存数据 */
const handleSave = async () => {
  try {
    const submitData = {
      ...form,
      isSn: form.isSn === '是' ? '是' : '否',
    };
    const res = await Api.mes.moveLabel.nameplateSubmit(submitData);
    if (res.data.code === 200) {
      ElMessage.success(isEdit.value ? '更新成功' : '新增成功');
      handleClose();
      getData();
    } else {
      ElMessage.error(res.data.msg || '保存失败');
    }
  } catch (error) {
    console.error('保存失败:', error);
    ElMessage.error('保存失败，请稍后重试');
  }
};

/** 获取选中的数据 */
const handleSelectionChange = selection => {
  batchDelete.value = selection;
};

/** 删除操作 */
const handleDelete = row => {
  ElMessageBox.confirm('是否确认删除该数据项？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        const ids = [row.id];
        const res = await Api.mes.moveLabel.nameplateRemove(ids.join(','));
        if (res.data.code === 200) {
          ElMessage.success('删除成功');
          getData();
        } else {
          ElMessage.error(res.data.msg || '删除失败');
        }
      } catch (error) {
        console.error('删除失败:', error);
        ElMessage.error('删除失败，请稍后重试');
      }
    })
    .catch(() => {
      // 用户取消删除
    });
};

/** 批量删除 */
// const handleBatchDelete = () => {
//   if (batchDelete.value.length === 0) {
//     ElMessage.warning('请选择要删除的数据');
//     return;
//   }
//   const ids = batchDelete.value.map(item => item.id).join(',');

//   ElMessageBox.confirm(`是否确认删除选中的 ${batchDelete.value.length} 条数据？`, '警告', {
//     confirmButtonText: '确定',
//     cancelButtonText: '取消',
//     type: 'warning',
//   })
//     .then(async () => {
//       try {
//         const res = await Api.mes.moveLabel.nameplateRemove({ ids });
//         if (res.data.code === 200) {
//           ElMessage.success('批量删除成功');
//           getData();
//         } else {
//           ElMessage.error(res.data.msg || '批量删除失败');
//         }
//       } catch (error) {
//         console.error('批量删除失败:', error);
//         ElMessage.error('批量删除失败，请稍后重试');
//       }
//     })
//     .catch(() => {
//       // 用户取消删除
//     });
// };
</script>

<style lang="scss" scoped>
.page-translation-list {
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    // margin-bottom: 20px;

    .title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }

    .search-area {
      .search-form {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
      }
    }
  }

  .action-banner {
    margin: 8px;
  }
  .el-form-item {
    margin-bottom: 8px;
  }
  .el-form--inline .el-form-item {
    margin-right: 20px;
  }
  .table-container {
    margin-bottom: 20px;
  }

  .drawer-container {
    padding: 20px;
  }

  .dialog-footer {
    text-align: right;
    padding: 0 20px 20px;
  }
}
.search-areaHeader {
  width: 100%;
  display: flex;
  justify-content: flex-end;
}
</style>
