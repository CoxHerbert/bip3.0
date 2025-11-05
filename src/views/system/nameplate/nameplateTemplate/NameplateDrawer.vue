<template>
  <div>
    <el-drawer
      :title="isEdit ? '编辑铭牌' : '新增铭牌'"
      v-model="drawerVisible"
      direction="rtl"
      :before-close="handleClose"
      size="60%"
    >
      <div class="drawer-container">
        <div class="subtitle">基本信息</div>
        <!-- 基础信息表单 -->
        <el-form
          :model="form"
          :rules="rules"
          ref="formRef"
          label-width="140px"
          size="medium"
          class="basic-form"
        >
          <el-row :gutter="20">
            <!-- 左列 -->
            <el-col :span="12">
              <el-form-item label="铭牌模板客户名" prop="customerName">
                <el-select
                  v-model="form.customerName"
                  placeholder="请输入客户名搜索"
                  clearable
                  filterable
                  remote
                  :remote-method="remoteCustomerSearch"
                  :loading="customerLoading"
                  @change="handleNameplateCustomerChange"
                >
                  <el-option
                    v-for="item in customerOptions"
                    :key="item.customerFName"
                    :label="item.customerFName"
                    :value="item.customerFName"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="模板名" prop="nameplateNameCustomer">
                <el-input v-model="form.nameplateNameCustomer" placeholder="输入模板名称" />
              </el-form-item>
              <el-form-item label="铭牌模板分类" prop="nameplateTypeName">
                <el-select v-model="form.nameplateTypeName" placeholder="请选择分类">
                  <el-option
                    v-for="item in DC_NAMEPLATE_TYPE"
                    :key="item.dictKey"
                    :label="item.dictValue"
                    :value="item.dictKey"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <!-- 右列 -->
            <el-col :span="12">
              <el-form-item label="铭牌模板大小" prop="nameplateSizeName">
                <el-select
                  v-model="form.nameplateSizeName"
                  placeholder="请选择尺寸"
                  @change="handleNameplateSizeChange"
                >
                  <el-option
                    v-for="item in DC_NAMEPLATE_SIZE"
                    :key="item.dictKey"
                    :label="item.dictValue"
                    :value="item.dictKey"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="Vender别名" prop="nameplateAlternative">
                <el-input
                  v-model="form.nameplateAlternative"
                  placeholder="输入别名（如East-Win）"
                />
              </el-form-item>
              <el-form-item label="登记人">
                <el-input v-model="form.register" disabled="true" placeholder="输入登记人姓名" />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 模板参数表格 -->
          <div class="params-table">
            <div class="subtitle">参考模版</div>
            <!-- <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="获取参数">
                  <el-select
                    v-model="form.constantType"
                    value-key="id"
                    @change="handleConstantTypeChange"
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
              </el-col>
            </el-row> -->

            <el-form-item>
              <div class="table-actions">
                <el-button type="primary" icon="el-icon-plus" size="small" @click="handleAddParam">
                  新增参数
                </el-button>
                <el-button
                  type="primary"
                  icon="el-icon-plus"
                  size="small"
                  @click="handleSelectParam"
                >
                  选择模版
                </el-button>
              </div>
              <el-table
                :data="form.nameplateCustomerDeatilsList.filter(item => item.isDeleted !== 1)"
                border
                size="small"
                style="width: 100%"
              >
                <el-table-column label="序号" width="60">
                  <template #default="scope">
                    {{ scope.$index + 1 }}
                  </template>
                </el-table-column>
                <el-table-column label="常量分类">
                  <template #default="scope">
                    <el-select
                      v-model="scope.row.constantType"
                      placeholder="请选择常量分类"
                      size="small"
                      style="width: 100%"
                      @change="handleConstantTypeChangeInTable(scope.row)"
                    >
                      <el-option
                        v-for="item in DC_NAMEPLATE_TYPE_PARAMETER"
                        :key="item.dictKey"
                        :label="item.dictValue"
                        :value="item.dictKey"
                      />
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column label="栏位">
                  <template #default="scope">
                    <el-input
                      v-model="scope.row.nameplateField"
                      placeholder="输入栏位"
                      size="small"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="名称">
                  <template #default="scope">
                    <el-input
                      v-model="scope.row.nameplateName"
                      placeholder="输入名称"
                      size="small"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="排序">
                  <template #default="scope">
                    <el-input
                      v-model.number="scope.row.nameplateSort"
                      placeholder="输入排序"
                      size="small"
                      type="number"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="是否SN" width="80">
                  <template #default="scope">
                    <el-checkbox v-model="scope.row.isSn" true-value="是" false-value="否" />
                  </template>
                </el-table-column>
                <el-table-column label="默认值">
                  <template #default="scope">
                    <el-input
                      v-model="scope.row.defaultValue"
                      placeholder="输入默认值"
                      size="small"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="80">
                  <template #default="scope">
                    <el-button
                      type="danger"
                      icon="el-icon-delete"
                      size="small"
                      @click="handleDeleteParam(scope.row)"
                    />
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
          </div>
          <el-form-item label="铭牌大小">
            <el-input v-model="form.nameplateSize" placeholder="输入铭牌大小" disabled />
          </el-form-item>
          <el-form-item label="铭牌样式">
            <NameplateStyleCard
              :nameplate-customer-deatils-list="form.nameplateCustomerDeatilsList"
              :nameplateTypeName="form.nameplateTypeName"
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

    <!-- 常量选择弹窗 -->
    <el-dialog
      v-model="paramDialogVisible"
      title="选择常量导入"
      width="800px"
      :before-close="cancelImportConstants"
    >
      <div class="constant-dialog-container">
        <!-- 左侧常量分类 -->
        <div class="constant-categories">
          <div class="category-title">常量分类</div>
          <div
            v-for="item in DC_NAMEPLATE_TYPE_PARAMETER"
            :key="item.dictKey"
            class="category-item"
            :class="{ active: selectedConstantType === item.dictKey }"
            @click="handleConstantCategorySelect(item.dictKey)"
          >
            {{ item.dictValue }}
          </div>
        </div>

        <!-- 右侧常量列表 -->
        <div class="constant-list">
          <div class="list-title">常量列表</div>
          <el-table
            v-if="constantsList.length > 0"
            :data="constantsList"
            border
            size="small"
            style="width: 100%"
            @selection-change="handleConstantSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column label="常量分类">
              <template #default="scope">
                <dc-dict-key
                  :options="DC_NAMEPLATE_TYPE_PARAMETER"
                  :value="scope.row.constantType"
                />
              </template>
            </el-table-column>
            <el-table-column prop="nameplateField" label="栏位" />
            <el-table-column prop="nameplateName" label="名称" />
            <el-table-column prop="isSn" label="是否SN" width="80" />
            <el-table-column prop="defaultValue" label="默认值" />
          </el-table>
          <div v-else class="empty-message">
            {{ selectedConstantType ? '该分类下暂无常量' : '请先选择常量分类' }}
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelImportConstants">取消</el-button>
          <el-button type="primary" @click="confirmImportConstants">确认导入</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted, defineExpose, defineEmits } from 'vue';
import { ElMessage } from 'element-plus';
import { getCurrentInstance } from 'vue';
import Api from '@/api/index';
import NameplateStyleCard from './components/NameplateStyleCard.vue';
import { useStore } from 'vuex';
const { proxy } = getCurrentInstance();
const store = useStore();

const userInfo = computed(() => store.getters.userInfo);
const templateTypeParams = ref(null);
// 在组件中获取字典数据
const dictCache = proxy.useCache([
  { key: 'DC_NAMEPLATE_TYPE' },
  { key: 'DC_NAMEPLATE_SIZE' },
  { key: 'DC_NAMEPLATE_BATCH_FLOW' },
  { key: 'DC_NAMEPLATE_BATCH_OPERATION' },
  { key: 'DC_NAMEPLATE_TYPE_PARAMETER' },
]);

// 在script setup中添加以下代码（在form定义之前）
// 客户相关状态
const customerLoading = ref(false);
const customerOptions = ref([]);
// 常量选择弹窗状态
const paramDialogVisible = ref(false);
// 左侧选中的常量分类
const selectedConstantType = ref('');
// 右侧选中的常量列表
const checkedConstants = ref([]);
// 常量列表数据
const constantsList = ref([]);
// 远程搜索客户
const remoteCustomerSearch = async query => {
  if (query.length < 1) {
    return;
  }
  customerLoading.value = true;
  try {
    const res = await Api.pdp.execution.customers({ name: query });
    customerOptions.value = res.data.data || [];
  } catch (error) {
    console.error('搜索客户失败:', error);
    customerOptions.value = [];
  } finally {
    customerLoading.value = false;
  }
};

// 客户选择变化处理
const handleNameplateCustomerChange = value => {
  form.customerName = value;
};

const { DC_NAMEPLATE_TYPE, DC_NAMEPLATE_SIZE, DC_NAMEPLATE_TYPE_PARAMETER } = dictCache;
console.log(DC_NAMEPLATE_TYPE);
// 定义emit事件
const emit = defineEmits(['submit', 'close', 'refreshgetData']);

const namePalteList = ref([]);
const namePalteFunc = async () => {
  try {
    let params = {
      current: 1,
      size: 999,
    };
    const { data } = await Api.mes.moveLabel.nameplateList(params);
    namePalteList.value = data.data.records || [];
    return namePalteList.value;
  } catch (error) {
    namePalteList.value = [];
    return [];
  }
};

// 铭牌模板大小变化处理
const handleNameplateSizeChange = value => {
  console.log(value);
  console.log(DC_NAMEPLATE_SIZE);
  // 根据选择的值找到对应的字典项
  const selectedSize = DC_NAMEPLATE_SIZE.value.find(item => item.dictKey === value);
  if (selectedSize) {
    // 将铭牌模板大小的显示值同步到铭牌大小字段
    form.nameplateSize = selectedSize.dictValue;
  } else {
    form.nameplateSize = '';
  }
};

// 组件挂载时初始化数据
onMounted(() => {
  // 可以在这里添加初始化逻辑
  console.log('NameplateDrawer组件已挂载');
});

// 外部控制：是否为编辑模式（可选，用于区分新增/编辑逻辑）
const isEdit = ref(false);
// 抽屉显隐
const drawerVisible = ref(false);
// 表单引用
const formRef = ref(null);
// 表单数据（关联铭牌基础信息 + 参数列表）
const form = reactive({
  tenantId: '',
  customerId: 0,
  customerName: '',
  nameplateNameCustomer: '',
  nameplateTypeName: '',
  nameplateSizeName: '',
  nameplateAlternative: '',
  nameTypeParams: '',
  nameplateSize: '', // 新增铭牌大小字段
  nameplateStyle: '', // 新增铭牌样式字段
  nameplateCustomerDeatilsList: [],
});
form.register = userInfo.value?.real_name;
form.tenantId = userInfo.value?.user_id;
// 选中的参数（用于联动预览）
const selectedParams = ref([]);

// 表单验证规则
const rules = {
  nameplateNameCustomer: [{ required: true, message: '请选择铭牌模板客户名', trigger: 'change' }],
  customerName: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  nameplateTypeName: [{ required: true, message: '请选择铭牌模板分类', trigger: 'change' }],
  nameplateSizeName: [{ required: true, message: '请选择铭牌模板大小', trigger: 'change' }],
  nameplateAlternative: [{ required: true, message: '请输入Vender别名', trigger: 'blur' }],
};

// 打开抽屉（支持传入初始数据和操作类型，用于区分新增/编辑场景）
const openDrawer = (type = 'add', initData) => {
  // 根据传入的 type 判定是否为编辑模式
  isEdit.value = type === 'edit';
  namePalteFunc();
  if (isEdit.value) {
    // 深拷贝初始数据，避免影响原数据
    Object.assign(form, JSON.parse(JSON.stringify(initData)));
    // 过滤掉已删除的数据
    if (form.nameplateCustomerDeatilsList && form.nameplateCustomerDeatilsList.length > 0) {
      form.nameplateCustomerDeatilsList = form.nameplateCustomerDeatilsList.filter(
        item => item.isDeleted !== 1
      );
    }
    // 编辑模式下，根据nameplateSizeName设置nameplateSize
    if (form.nameplateSizeName) {
      const selectedSize = DC_NAMEPLATE_SIZE.value.find(
        item => item.dictKey === form.nameplateSizeName
      );
      if (selectedSize) {
        form.nameplateSize = selectedSize.dictValue;
      }
    }
  } else {
    // 重置为默认值
    form.id = null;
    form.tenantId = '';
    form.customerId = null;
    form.customerName = '';
    form.nameplateNameCustomer = '';
    form.nameplateTypeName = '';
    form.nameplateSizeName = '';
    form.nameplateAlternative = '';
    form.nameplateSize = '';
    form.nameplateStyle = '';
    form.nameplateCustomerDeatilsList = [];
  }
  form.constantType = null;
  drawerVisible.value = true;
};

// 关闭抽屉
const handleClose = () => {
  drawerVisible.value = false;
  // 重置选中参数（可选，根据需求保留/清空）
  selectedParams.value = [];
  emit('close');
};
const sortList = ref([]);
const handleConstantTypeChange = val => {
  let matchedParams = [];
  if (isEdit.value) {
    matchedParams = namePalteList.value.filter(item => item.constantType === val);
    sortList.value = matchedParams;
    if (form.nameplateCustomerDeatilsList && form.nameplateCustomerDeatilsList.length > 0) {
      form.nameplateCustomerDeatilsList.forEach(item => {
        item.isDeleted = 1; // 标记为删除状态
      });
    }
    const newParams = matchedParams.map((item, index) => ({
      ...item,
      id: null, // 新添加的参数没有id
      nameplateSort: index + 1, // 设置排序值
      isDeleted: 0, // 确保新参数未被标记为删除
    }));
    form.nameplateCustomerDeatilsList = [...form.nameplateCustomerDeatilsList, ...newParams];
  } else {
    matchedParams = namePalteList.value
      .filter(item => item.constantType === val)
      .map(item => {
        const { id, ...rest } = item;
        return rest;
      });
    sortList.value = matchedParams;
    const newParams = matchedParams.map((item, index) => ({
      ...item,
      id: null, // 新添加的参数没有id
      nameplateSort: index + 1, // 设置排序值
      isDeleted: 0, // 确保新参数未被标记为删除
    }));
    form.nameplateCustomerDeatilsList = newParams;
  }

  console.log('匹配到的参数:', matchedParams);

  // 清空列表，而不是标记为删除并追加新参数

  // 将matchedParams映射后添加到列表中，并设置正确的排序值

  // console.log(newParams);
  // 将新参数添加到列表中
  // form.nameplateCustomerDeatilsList = newParams;
};
// 新增参数行
const handleAddParam = () => {
  // 获取第一个常量分类作为默认值

  // 创建新对象，避免引用问题
  // 查找未删除的模板项，若未找到则使用空对象作为默认值
  const templateItem =
    namePalteList.value.find(
      item => item.isDeleted !== 1 && item.constantType == 'DC_NAMEPLATE_TYPE_PARAMETER_PUBLIC'
    ) || {};

  console.log(templateItem);
  const newParam = {
    ...templateItem,
    constantType: 'DC_NAMEPLATE_TYPE_PARAMETER_PUBLIC', // 默认使用第一个常量分类
    id: null,
    defaultValue: '',
    nameplateField: '',
    nameplateName: '',
    nameplateSort:
      form.nameplateCustomerDeatilsList.filter(item => item.isDeleted === 0).length + 1,
  };

  form.nameplateCustomerDeatilsList.push(newParam);
};

// 常量导入
// 常量导入
// 打开常量选择弹窗
const handleSelectParam = () => {
  // 重置选中状态
  // selectedConstantType.value = '';
  checkedConstants.value = [];
  constantsList.value = [];
  // 显示弹窗
  handleConstantCategorySelect('DC_NAMEPLATE_TYPE_PARAMETER_PUBLIC');
  paramDialogVisible.value = true;
};

// 处理常量分类选择
const handleConstantCategorySelect = type => {
  console.log(type);
  selectedConstantType.value = type;
  // 根据选择的分类加载常量列表
  loadConstantsByType(type);
};

// 根据分类加载常量列表
const loadConstantsByType = type => {
  // 从namePalteList中过滤出对应分类的常量
  constantsList.value = namePalteList.value
    .filter(item => item.constantType === type)
    .map(item => {
      const { id, ...rest } = item;
      return rest;
    });
};

// 处理常量选择
const handleConstantSelectionChange = selection => {
  checkedConstants.value = selection;
};

// 确认导入选中的常量
const confirmImportConstants = () => {
  if (checkedConstants.value.length === 0) {
    ElMessage.warning('请至少选择一个常量');
    return;
  }

  // 生成新的参数对象，设置正确的排序值
  const currentCount = form.nameplateCustomerDeatilsList.filter(
    item => item.isDeleted !== 1
  ).length;
  const newParams = checkedConstants.value.map((item, index) => ({
    ...item,
    id: null, // 新添加的参数没有id
    constantType: selectedConstantType.value,
    nameplateSort: currentCount + index + 1, // 设置排序值
    isDeleted: 0, // 确保新参数未被标记为删除
  }));

  // 添加到表单数据中
  form.nameplateCustomerDeatilsList = [...form.nameplateCustomerDeatilsList, ...newParams];

  // 关闭弹窗
  paramDialogVisible.value = false;

  ElMessage.success(`成功导入 ${checkedConstants.value.length} 个常量`);
};

// 取消导入
const cancelImportConstants = () => {
  paramDialogVisible.value = false;
};
// 删除参数行
const handleDeleteParam = row => {
  // 查找要删除的行索引
  const index = form.nameplateCustomerDeatilsList.findIndex(item => item === row);
  if (index !== -1) {
    if (row.id) {
      // 编辑状态下，使用isDeleted字段标记删除
      form.nameplateCustomerDeatilsList[index].isDeleted = 1;
      let sortIndex = 1;
      form.nameplateCustomerDeatilsList.forEach(item => {
        if (item.isDeleted !== 1) {
          item.nameplateSort = sortIndex++;
        }
      });
    } else {
      // 新增状态下，执行真正的删除操作
      form.nameplateCustomerDeatilsList.splice(index, 1);
      // 重新排序剩余的元素
      // form.nameplateCustomerDeatilsList.filter(item => item.isDeleted === 0).length
      // 只对未删除的项重新排序
      let sortIndex = 1;
      form.nameplateCustomerDeatilsList.forEach(item => {
        if (item.isDeleted === 0) {
          item.nameplateSort = sortIndex++;
        }
      });
    }
  }
};

// 动作处理方法
const doAction = action => {
  if (action === 'submit') {
    // 使用表单验证
    formRef.value.validate((valid, fields) => {
      if (valid) {
        // 验证通过，提交数据
        handleSave();
      } else {
        // 验证失败，显示第一个错误信息
        const firstField = Object.keys(fields)[0];
        const firstError = fields[firstField][0].message;
        ElMessage.warning(firstError);
        return;
      }
    });
  } else if (action === 'close') {
    handleClose();
  }
};

// 数据转换方法：将表单数据转换为API要求的格式
const transformFormData = () => {
  return {
    id: form.id,
    tenantId: form.tenantId || '',
    customerId: form.customerId || 0,
    customerName: form.customerName || '',
    nameplateNameCustomer: form.nameplateNameCustomer || '',
    nameplateTypeName: form.nameplateTypeName || '',
    nameplateSizeName: form.nameplateSizeName || '',
    nameplateAlternative: form.nameplateAlternative || '',
    nameplateTypeParams: form.nameTypeParams || '',
    nameplateCustomerDeatilsList: form.nameplateCustomerDeatilsList.map(item => ({
      ...item,

      tenantId: item.tenantId || '',
      constantType: item.constantType || '',
      nameplateField: item.nameplateField || '',
      nameplateName: item.nameplateName || '',
      nameplateSort: item.nameplateSort || 0,
      isSn: item.isSn === '是' ? '是' : '否',
      defaultValue: item.defaultValue || '',
      dcNameplateCustomerId: item.dcNameplateCustomerId || 0,
    })),
  };
};
// 修改保存逻辑
const handleSave = async () => {
  try {
    // 转换数据格式
    const submitData = transformFormData();
    console.log('最终提交数据：', submitData);

    let res;
    if (isEdit.value) {
      // 编辑场景，调用更新接口
      res = await Api.mes.moveLabel.nameplateCustomerAdd(submitData);
    } else {
      // 新增场景，调用新增接口
      res = await Api.mes.moveLabel.nameplateCustomerAdd(submitData);
    }
    console.log('接口返回数据：', res);
    if (res.data.code === 200) {
      if (isEdit.value) {
        ElMessage.success('更新成功');
      } else {
        ElMessage.success('新增成功');
      }
      handleClose();
      // 触发提交事件
      emit('submit', submitData);
      emit('refreshgetData');
    } else {
      if (isEdit.value) {
        ElMessage.error(res.msg || '更新失败');
      } else {
        ElMessage.error(res.msg || '新增失败');
      }
    }
  } catch (error) {
    console.error('保存铭牌信息失败:', error);
    if (isEdit.value) {
      ElMessage.error('更新失败，请稍后重试');
    } else {
      ElMessage.error('新增失败，请稍后重试');
    }
  }
};

// 监听参数默认值变化，实时更新预览（可选增强）
watch(
  () => form.params,
  newParams => {
    // 可在此写更精细的预览更新逻辑，比如参数值变化同步到预览文本
  },
  { deep: true }
);

// 暴露方法给外部调用
defineExpose({
  openDrawer,
  handleClose,
  // form,
});
</script>

<style scoped>
/* 副标题样式 */
.subtitle {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 20px 0 15px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #e4e7ed;
  display: flex;
  align-items: center;
}
.subtitle:first-child {
  margin-top: 0;
}
.subtitle::before {
  content: '';
  width: 4px;
  height: 16px;
  background: #f26c0c;
  margin-right: 8px;
  border-radius: 2px;
}

/* 常量选择弹窗样式 */
.constant-dialog-container {
  display: flex;
  height: 500px;
  gap: 10px;
}

/* 左侧常量分类样式 */
.constant-categories {
  width: 200px;
  background-color: #f5f7fa;
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.category-title {
  padding: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  background-color: #edeff3;
  border-bottom: 1px solid #dcdfe6;
}

.category-item {
  padding: 12px 16px;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid #ebeef5;
}

.category-item:hover {
  background-color: #ecf5ff;
  color: #f26c0c;
}

.category-item.active {
  background-color: #f26c0c;
  color: #ffffff;
}

.category-item:last-child {
  border-bottom: none;
}

/* 右侧常量列表样式 */
.constant-list {
  flex: 1;
  background-color: #ffffff;
  border-radius: 6px;
  border: 1px solid #f3f4f8;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.list-title {
  padding: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  border-bottom: 1px solid #ebeef5;
  background-color: #f5f7fa;
}

.constant-list .el-table {
  flex: 1;
  border: none;
}

.constant-list .el-table__header-wrapper {
  background-color: #fafafa;
}

.constant-list .el-table__header {
  border-bottom: 1px solid #ebeef5;
}

.constant-list .el-table__body {
  font-size: 13px;
}

.empty-message {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 14px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .constant-dialog-container {
    flex-direction: column;
    height: auto;
  }

  .constant-categories {
    width: 100%;
    max-height: 200px;
    overflow-y: auto;
  }

  .constant-list {
    min-height: 300px;
  }
}
</style>
