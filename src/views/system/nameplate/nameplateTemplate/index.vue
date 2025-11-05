<template>
  <div class="content-warp page-myClients-list">
    <!-- <div class="header"> -->
    <!-- <div class="title">铭牌模版</div> -->
    <!-- <div class="search-area"> -->
    <!-- <dc-search-group :config="searchConfig" @search="handleSearch" /> -->
    <!-- </div> -->
    <!-- </div> -->
    <div ref="content" class="content-body">
      <dc-drag-panel :height="treeHeight + 'px'">
        <template #left>
          <div class="query-tree">
            <div class="search-box">
              <el-input
                v-model="processSearchKey"
                placeholder="请输入关键字"
                prefix-icon="Search"
                clearable
                @input="handleInputChange"
              />
            </div>
            <el-scrollbar :height="treeHeight + 'px'">
              <el-tree
                class="tree"
                ref="treeRef"
                :data="treeData"
                :props="{
                  children: 'children',
                  label: 'label',
                }"
                @node-click="handleNodeClick"
                :highlight-current="true"
                :default-expand-all="true"
                :filter-node-method="filterNode"
              />
            </el-scrollbar>
          </div>
        </template>
        <template #right>
          <div class="content-area">
            <div class="operate-container">
              <el-button
                type="primary"
                icon="Plus"
                @click="openEditDrawer('add', '')"
                v-permission="{
                  id: 'CUSTOMER_ADD',
                }"
                >新增</el-button
              >
              <!-- <el-button
                icon="Delete"
                @click="handleBatchDelete"
                v-permission="{
                  id: 'CUSTOMER_BATCH_DEL',
                }"
                >批量删除</el-button
              > -->
            </div>
            <div class="table-container">
              <el-table
                :data="tableData"
                @selection-change="handleSelectionChange"
                :height="treeHeight - 100 + 'px'"
                @row-dblclick="handleRowDblClick"
              >
                <el-table-column type="selection" width="55" />

                <el-table-column
                  prop="customerName"
                  label="铭牌模板客户名"
                  align="left"
                  min-width="220"
                  show-overflow-tooltip
                />
                <el-table-column
                  prop="nameplateNameCustomer"
                  label="模版名"
                  align="center"
                  width="100"
                  show-overflow-tooltip
                >
                </el-table-column>
                <!-- <el-table-column
                  prop="legalPerson"
                  label="法定代表人"
                  align="center"
                  width="100"
                  show-overflow-tooltip
                /> -->
                <el-table-column
                  prop="nameplateSizeName"
                  label="铭牌模版大小"
                  align="center"
                  min-width="160"
                  show-overflow-tooltip
                >
                  <template #default="scoped">
                    <dc-dict-key
                      :options="DC_NAMEPLATE_SIZE"
                      :value="scoped.row.nameplateSizeName"
                    />
                  </template>
                </el-table-column>

                <el-table-column
                  prop="nameplateAlternative"
                  label="Vender别名"
                  align="center"
                  min-width="100"
                  show-overflow-tooltip
                >
                </el-table-column>
                <el-table-column label="h5铭牌" align="center" min-width="100">
                  <template #default="scoped">
                    <el-popover placement="top" :width="400" trigger="hover">
                      <template #reference>
                        <span style="color: #409eff">查看</span>
                      </template>
                      <NameplateStyleCard
                        :nameplateTypeName="scoped.row.nameplateTypeName"
                        :nameplate-customer-deatils-list="scoped.row.nameplateCustomerDeatilsList"
                      />
                    </el-popover>
                  </template>
                </el-table-column>

                <el-table-column label="操作" align="center" fixed="right" min-width="150">
                  <template #default="scoped">
                    <el-button
                      link
                      type="primary"
                      v-permission="{ id: 'CUSTOMER_EDIT', row: scoped.row }"
                      @click="openEditDrawer('edit', scoped.row)"
                    >
                      修改
                    </el-button>
                    <el-button
                      link
                      type="primary"
                      @click="handleDelete(scoped.row)"
                      v-if="userInfo.role_name.includes('admin')"
                      v-permission="{ id: 'DC_CRM_DELETE', row: scoped.row }"
                      >删除
                    </el-button>
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
          </div>
        </template>
      </dc-drag-panel>
    </div>
    <NameplateDrawer ref="nameplateDrawer" @refreshgetData="getData" />
  </div>
</template>

<script setup name="MyClientsList">
import { reactive, toRefs, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import NameplateDrawer from './NameplateDrawer.vue';
import NameplateStyleCard from './components/NameplateStyleCard.vue';
import Api from '@/api/index';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
const router = useRouter();
const { proxy } = getCurrentInstance();
const { DC_NAMEPLATE_SIZE } = proxy.useCache([{ key: 'DC_NAMEPLATE_SIZE' }]);

// 数据字典
const data = reactive({
  loading: true,
  queryParams: {
    current: 1,
    size: 20,
  },

  total: 0,
  tableData: [],
  batchDelete: [],
  // searchConfig: {
  //   paramType: {
  //     nameplateNameCustomer: {
  //       label: '铭牌客户名',
  //       type: 'select',
  //       options: DC_CRM_CUS_LEVEL,
  //       paramKey: 'cusLevel',
  //     },
  //   },
  // },
});

const treeRef = ref(null);
const processSearchKey = ref('');
const { loading, queryParams, total, tableData, batchDelete } = toRefs(data);
const nameplateDrawer = ref(null);
// 数据字典
const { DC_NAMEPLATE_TYPE } = proxy.useCache([{ key: 'DC_NAMEPLATE_TYPE' }]);
const openEditDrawer = (type, row) => {
  nameplateDrawer.value.openDrawer(type, row);
};
// 树妆列表
const treeData = computed(() => {
  return [
    {
      label: '全部',
    },
    {
      label: '铭牌模版分类',
      children: DC_NAMEPLATE_TYPE.value,
    },
  ];
});

// content dom元素
const content = ref(null);
// 用于存储高度
const contentHeight = ref('auto');

// 计算出侧边栏最大可用高度
const treeHeight = computed(() => {
  return contentHeight.value !== 'auto' ? contentHeight.value - 20 : 'auto';
});
/**
 * 计算高低
 */
const calcContentheight = () => {
  contentHeight.value = content.value.offsetHeight;
};

/**
 * 尺寸变化回调
 */
const resizeCallback = () => {
  calcContentheight();
};

/** 绑定window resize */
const bindWindowEvent = () => {
  window.addEventListener('resize', resizeCallback);
};

/** 解除绑定window resize */
const unBindWindowEvent = () => {
  window.removeEventListener('resize', resizeCallback);
};

onMounted(() => {
  getData();
  setTimeout(() => {
    calcContentheight();
    bindWindowEvent();
  }, 10);
});

onBeforeUnmount(() => {
  unBindWindowEvent();
});

const store = useStore();

const userInfo = computed(() => store.getters.userInfo);

// 自定义过滤方法
const filterNode = (value, data) => {
  if (!value) return true;
  return data.label.toLowerCase().includes(value.toLowerCase());
};

// 输入变化处理
const handleInputChange = val => {
  processSearchKey.value = val;
  if (treeRef.value) {
    treeRef.value.filter(val);
  }
};

/** 查询参数列表 */
const getData = async () => {
  try {
    loading.value = true;
    const res = await Api.mes.moveLabel.nameplateCustomerList(queryParams.value);
    const { code, data } = res.data;
    if (code === 200) {
      tableData.value = data.records;
      total.value = data.total;
    }
    loading.value = false;
  } catch (err) {
    loading.value = false;
  }
};

/** 搜索按钮操作 */
const handleSearch = params => {
  queryParams.value = {
    ...queryParams.value,
    ...params,
  };
  getData();
};

/** 修改按钮操作 */
// const handleUpdate = row => {
//   router.push({
//     name: '编辑客户',
//     params: { id: row.id },
//   });
// };

/**  进入详情操作*/
// const handleDetail = row => {
//   router.push({
//     name: '客户详情',
//     path: 'myClientsDetail',
//     params: { id: row.id },
//   });
// };

// 删除and批量删除接口
const handleDeleteCommon = (ids, message, deleteApi) => {
  proxy
    .$confirm(message)
    .then(async () => {
      const configIds = [ids];
      await deleteApi(configIds); // 调用传入的删除接口
    })
    .then(() => {
      getData(); // 更新数据
      proxy.$message.success('删除成功');
    })
    .catch(() => {
      // 错误处理
    });
};

/** 获取选中的数据 */
const handleSelectionChange = selection => {
  batchDelete.value = selection;
};

// 双击行数据
// const handleRowDblClick = row => {
//   const hasPermission = proxy.hasPermissionCommon('CUSTOMER_DETAIL', row);
//   if (!hasPermission) {
//     proxy.$message.error('当前用户无编辑权限');
//     return;
//   } else {
//     handleDetail(row);
//     // handleUpdate(row);
//   }
// };

/** 删除按钮操作 */
const handleDelete = row => {
  const configIds = row.id;
  const message = `是否确认删除选中的数据项？`;
  handleDeleteCommon(configIds, message, Api.mes.moveLabel.nameplateCustomerRemove);
};

/** 批量删除 */
const handleBatchDelete = () => {
  if (batchDelete.value.length === 0) {
    proxy.$message.error('请选择要删除的客户');
    return;
  }
  const ids = batchDelete.value.map(item => item.id).join(',');
  const message = `是否确认删除选中的数据项？`;
  handleDeleteCommon(ids, message, Api.crm.customer.deleteCustomerRemove);
};

/** 树状点击事件 */
// cusCategory; //客户分类
// cusLevel //客户级别
// cusShareType //共享方式
// createStatus  //当前状态
const handleNodeClick = node => {
  if (node.label === '全部') {
    (queryParams.value = {
      current: 1,
      size: 10,
    }),
      getData();
  } else {
    if (!node.code) return;
    const keys = ['customerName', 'nameplateTypeName', 'nameplateSizeName'];
    keys.forEach(key => (queryParams.value[key] = null));
    console.log(node);
    if (node.code === 'DC_NAMEPLATE_TYPE') queryParams.value.nameplateTypeName = node.dictKey;
    queryParams.value.current = 1;
    getData();
  }
};
</script>
<style lang="scss" scoped>
.page-myClients-list {
  .query-tree {
    width: 100%;
    border-right-color: transparent;
  }

  .search-area {
    width: calc(100% - 80px);
  }
}
</style>
