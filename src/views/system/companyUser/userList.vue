<template>
  <div ref="content" class="page-user">
    <el-row>
      <el-col :span="5">
        <div class="box">
          <basic-container>
            <div class="left-content">
              <el-scrollbar>
                <avue-tree :option="treeOption" :data="treeData" @node-click="nodeClick" />
              </el-scrollbar>
            </div>
          </basic-container>
        </div>
      </el-col>
      <el-col :span="19">
        <basic-container>
          <avue-crud
            :option="option"
            v-model:search="search"
            :table-loading="loading"
            :data="data"
            ref="crud"
            v-model="form"
            :permission="permissionList"
            @row-update="rowUpdate"
            :before-open="beforeOpen"
            v-model:page="page"
            @search-change="searchChange"
            @search-reset="searchReset"
            @selection-change="selectionChange"
            @current-change="currentChange"
            @size-change="sizeChange"
            @refresh-change="refreshChange"
            @on-load="onLoad"
          >
            <template v-if="roleName && roleName.length > 0" #menu-left>
              <!-- <el-button
                v-if="permission.user_add && !auditMode"
                type="primary"
                icon="el-icon-plus"
                v-permission="{ id: 'user_add' }"
                @click="handleBatchUpdate()"
                >批量修改
              </el-button> -->
              <wf-select-dialog
                placeholder="请选择关联项目"
                objectName="user"
                type="input"
                returnType="object"
                :multiple="false"
                :initChangeable="true"
                :clearable="true"
                :useSlot="true"
                :query="{
                  enabled: true,
                }"
                @change="hanleLeaderDevice"
              >
                <template #default>
                  <el-button type="primary" plain icon="el-icon-plus">绑定审核人 </el-button>
                </template>
              </wf-select-dialog>
            </template>
            <template #tenantName="{ row }">
              <el-tag>{{ row.tenantName }}</el-tag>
            </template>
            <template #roleName="{ row }">
              <el-tag>{{ row.roleName }}</el-tag>
            </template>
            <template #deptName="{ row }">
              <el-tag>{{ row.deptName }}</el-tag>
            </template>
            <template #userTypeName="{ row }">
              <el-tag>{{ row.userTypeName }}</el-tag>
            </template>
            <template #evaluatorName="{ row }">
              <el-tag>{{ row.evaluatorName }}</el-tag>
            </template>
            <!-- <template #option="{ row }">
              <el-button
                type="text"
                @click="doAction('edit', row)"
                v-permission="{ id: 'user_edit', row: row }"
                icon="edit"
                >编辑</el-button
              >
            </template> -->
          </avue-crud>
        </basic-container>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import {
  getList,
  getUser,
  getUserPlatform,
  remove,
  update,
  updatePlatform,
  add,
  grant,
  resetPassword,
  unlock,
  auditPass,
  auditRefuse,
  wechatCreate,
} from '@/api/system/user';
import { exportBlob } from '@/api/common';
import { getDeptTree, getDeptLazyTree } from '@/api/system/dept';
import { getRoleTree } from '@/api/system/role';
import { getPostList } from '@/api/system/post';
import { mapGetters } from 'vuex';
import website from '@/config/website';
import { getToken } from '@/utils/auth';
import { downloadXls } from '@/utils/util';
import NProgress from 'nprogress';
import func from '@/utils/func';

export default {
  data() {
    const validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'));
      } else {
        callback();
      }
    };
    const validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'));
      } else if (value !== this.form.password) {
        callback(new Error('两次输入密码不一致!'));
      } else {
        callback();
      }
    };
    return {
      form: {},
      search: {},
      initFlag: true,
      selectionList: [],
      query: {},
      loading: true,
      page: {
        pageSize: 10,
        currentPage: 1,
        total: 0,
      },
      init: {
        roleTree: [],
        deptTree: [],
      },
      props: {
        label: 'title',
        value: 'key',
      },
      treeDeptId: '',
      treeData: [],
      treeOption: {
        nodeKey: 'id',
        lazy: true,
        treeLoad: function (node, resolve) {
          const parentId = node.level === 0 ? 0 : node.data.id;
          getDeptLazyTree(parentId).then(res => {
            resolve(
              res.data.data.map(item => {
                return {
                  ...item,
                  leaf: !item.hasChildren,
                };
              })
            );
          });
        },
        addBtn: false,
        menu: false,
        size: 'small',
        props: {
          labelText: '标题',
          label: 'title',
          value: 'value',
          children: 'children',
        },
      },
      option: {
        height: 'auto',
        calcHeight: 140,
        tip: false,
        searchShow: true,
        searchMenuSpan: 6,
        dialogWidth: '800',
        border: true,
        menu: false,
        index: true,
        selection: true,
        addBtn: false,
        viewBtn: true,
        dialogType: 'drawer',
        dialogClickModal: true,
        enter: true,
        column: [
          {
            label: '登录账号',
            prop: 'account',
            search: true,
            display: false,
          },
          {
            label: '所属租户',
            prop: 'tenantName',
            slot: true,
            display: false,
          },
          {
            label: '用户姓名',
            prop: 'realName',
            search: true,
            display: false,
          },
          {
            label: '绑定审核人',
            prop: 'evaluatorBool',
            search: true,
            display: false,
            type: 'select', // 设置为下拉选择类型
            dicData: [
              {
                label: '是',
                value: 1,
              },
              {
                label: '否',
                value: 0,
              },
            ],
            dataType: 'number', // 指定数据类型为数字
          },
          {
            label: '所属角色',
            prop: 'roleName',
            slot: true,
            display: false,
          },
          {
            label: '所属部门',
            prop: 'deptName',
            slot: true,
            display: false,
          },
          {
            label: '用户平台',
            prop: 'userTypeName',
            slot: true,
            display: false,
          },
          {
            label: '用户平台',
            type: 'select',
            dicUrl: '/blade-system/dict/dictionary?code=user_type',
            props: {
              label: 'dictValue',
              value: 'dictKey',
            },
            dataType: 'number',
            search: true,
            hide: true,
            display: false,
            prop: 'userType',
            rules: [
              {
                required: true,
                message: '请选择用户平台',
                trigger: 'blur',
              },
            ],
          },
          {
            label: '绑定审核人',
            prop: 'evaluatorName',
            slot: true,
            display: false,
          },
          //   {
          //     label: '操作',
          //     prop: 'option',
          //     width: '220px',
          //     slot: true,
          //     editDisplay: false, // 编辑时显示
          //     addDisplay: false, // 新增时显示（可选）
          //   },
        ],
        group: [
          {
            label: '基础信息',
            prop: 'baseInfo',
            icon: 'el-icon-user-solid',
            column: [
              {
                label: '所属租户',
                prop: 'tenantId',
                type: 'tree',
                dicUrl: '/blade-system/tenant/select',
                props: {
                  label: 'tenantName',
                  value: 'tenantId',
                },
                hide: !website.tenantMode,
                addDisplay: website.tenantMode,
                editDisplay: website.tenantMode,
                viewDisplay: website.tenantMode,
                rules: [
                  {
                    required: true,
                    message: '请输入所属租户',
                    trigger: 'click',
                  },
                ],
                span: 24,
              },
              {
                label: '登录账号',
                prop: 'account',
                rules: [
                  {
                    required: true,
                    message: '请输入登录账号',
                    trigger: 'blur',
                  },
                ],
              },
              {
                label: '用户平台',
                type: 'select',
                dicUrl: '/blade-system/dict/dictionary?code=user_type',
                props: {
                  label: 'dictValue',
                  value: 'dictKey',
                },
                dataType: 'number',
                slot: true,
                prop: 'userType',
                rules: [
                  {
                    required: true,
                    message: '请选择用户平台',
                    trigger: 'blur',
                  },
                ],
              },
              {
                label: '密码',
                prop: 'password',
                hide: true,
                editDisplay: false,
                viewDisplay: false,
                rules: [{ required: true, validator: validatePass, trigger: 'blur' }],
              },
              {
                label: '确认密码',
                prop: 'password2',
                hide: true,
                editDisplay: false,
                viewDisplay: false,
                rules: [{ required: true, validator: validatePass2, trigger: 'blur' }],
              },
            ],
          },
          {
            label: '详细信息',
            prop: 'detailInfo',
            icon: 'el-icon-s-order',
            column: [
              {
                label: '用户昵称',
                prop: 'name',
                hide: true,
                rules: [
                  {
                    required: true,
                    message: '请输入用户昵称',
                    trigger: 'blur',
                  },
                ],
              },
              {
                label: '用户姓名',
                prop: 'realName',
                rules: [
                  {
                    required: true,
                    message: '请输入用户姓名',
                    trigger: 'blur',
                  },
                  {
                    min: 2,
                    max: 10,
                    message: '姓名长度在2到5个字符',
                  },
                ],
              },
              {
                label: '手机号码',
                prop: 'phone',
                overHidden: true,
              },
              {
                label: '电子邮箱',
                prop: 'email',
                hide: true,
                overHidden: true,
              },
              {
                label: '用户性别',
                prop: 'sex',
                type: 'select',
                dicData: [
                  {
                    label: '男',
                    value: 1,
                  },
                  {
                    label: '女',
                    value: 2,
                  },
                  {
                    label: '未知',
                    value: 3,
                  },
                ],
                hide: true,
              },
              {
                label: '用户生日',
                type: 'date',
                prop: 'birthday',
                format: 'YYYY-MM-DD HH:mm:ss',
                valueFormat: 'YYYY-MM-DD HH:mm:ss',
                hide: true,
              },
              {
                label: '账号状态',
                prop: 'statusName',
                hide: true,
                display: false,
              },
            ],
          },
        ],
      },
      data: [],
    };
  },
  watch: {
    'form.tenantId'() {
      if (this.form.tenantId !== '' && this.initFlag) {
        this.initData(this.form.tenantId);
      }
    },
  },
  computed: {
    ...mapGetters(['userInfo', 'permission']),
    roleName() {
      return this.userInfo?.role_name || [];
    },
    permissionList() {
      return {
        addBtn: this.validData(this.permission.user_add, false),
        viewBtn: this.validData(this.permission.user_view, false),
        delBtn: this.validData(this.permission.user_delete, false),
        editBtn: this.validData(this.permission.user_edit, false),
      };
    },
    ids() {
      let ids = [];
      this.selectionList.forEach(ele => {
        ids.push(ele.id);
      });
      return ids.join(',');
    },
  },
  mounted() {
    // 非租户模式默认加载管理组数据
    if (!website.tenantMode) {
      this.initData(website.tenantId);
    }
  },
  methods: {
    hanleLeaderDevice(val) {
      console.log(val);
      //   return;
      this.api.system.dept
        .upByUserEvaluatorId({
          id: this.selectionList.map(item => item.id),
          userId: val.id,
        })
        .then(res => {
          this.$message({
            type: 'success',
            message: '操作成功!',
          });
          this.initData(this.form.tenantId);
        })
        .catch(err => {
          this.$message({
            type: 'error',
            message: err.message,
          });
        });
      //   this.$refs.userDialogRef.openDialog();
    },
    nodeClick(data) {
      this.treeDeptId = data.id;
      this.query = {};
      this.page.currentPage = 1;
      this.onLoad(this.page);
    },
    initData(tenantId) {
      getRoleTree(tenantId).then(res => {
        const column = this.findObject(this.option.group, 'roleId');
        column.dicData = res.data.data;
      });
      getDeptTree(tenantId).then(res => {
        const column = this.findObject(this.option.group, 'deptId');
        column.dicData = res.data.data;
      });
      getPostList(tenantId).then(res => {
        const column = this.findObject(this.option.group, 'postId');
        column.dicData = res.data.data;
      });
    },
    rowUpdate(row, index, done, loading) {
      row.deptId = func.join(row.deptId);
      row.roleId = func.join(row.roleId);
      row.postId = func.join(row.postId);
      update(row).then(
        () => {
          this.initFlag = false;
          this.onLoad(this.page);
          this.$message({
            type: 'success',
            message: '操作成功!',
          });
          done();
        },
        error => {
          window.console.log(error);
          loading();
        }
      );
    },
    searchReset() {
      this.query = {};
      this.treeDeptId = '';
      this.onLoad(this.page);
    },
    searchChange(params, done) {
      this.query = params;
      this.page.currentPage = 1;
      this.onLoad(this.page, params);
      done();
    },
    selectionChange(list) {
      this.selectionList = list;
      console.log('选中的id集合:', this.ids);
    },
    selectionClear() {
      this.selectionList = [];
      this.$refs.crud.toggleSelection();
    },
    beforeOpen(done, type) {
      if (['edit', 'view'].includes(type)) {
        getUser(this.form.id).then(res => {
          this.form = res.data.data;
          if (this.form.hasOwnProperty('deptId')) {
            this.form.deptId = func.split(this.form.deptId);
          }
          if (this.form.hasOwnProperty('roleId')) {
            this.form.roleId = func.split(this.form.roleId);
          }
          if (this.form.hasOwnProperty('postId')) {
            this.form.postId = func.split(this.form.postId);
          }
        });
      }
      this.initFlag = true;
      done();
    },
    currentChange(currentPage) {
      this.page.currentPage = currentPage;
    },
    sizeChange(pageSize) {
      this.page.pageSize = pageSize;
    },
    refreshChange() {
      this.onLoad(this.page, this.query);
    },
    onLoad(page, params = {}) {
      this.loading = true;
      getList(
        page.currentPage,
        page.pageSize,
        Object.assign(params, this.query),
        this.treeDeptId
      ).then(res => {
        const data = res.data.data;
        this.page.total = data.total;
        this.data = data.records;
        this.loading = false;
        this.selectionClear();
      });
    },
    doAction(action, row) {
      const tableRef = this.$refs.crud;
      if (action === 'edit') {
        tableRef.rowEdit(row);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.page-user {
  width: 100%;
  height: 100%;
}
.box {
  height: 100%;
  box-sizing: border-box;
  padding-right: 20px;
}

.left-content {
  padding-top: 10px;

  :deep(.avue-tree__filter) {
    margin-bottom: 10px;
    .el-input {
      height: 32px;
    }
  }
}

.el-scrollbar {
  height: 100%;
}

.box .el-scrollbar__wrap {
  overflow: scroll;
}
</style>
