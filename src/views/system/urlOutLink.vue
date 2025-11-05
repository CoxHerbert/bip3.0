<template>
  <basic-container>
    <div class="list-page">
      <div class="header">
        <!-- <dc-search
          v-model="queryParams"
          v-bind="searchConfig"
          @reset="handleReset"
          @search="handleSearch"
        /> -->
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

    <!-- 弹窗 -->
    <el-dialog :title="formTitle" v-model="dialogVisible" width="50%" :before-close="handleClose">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" size="default">
        <!-- <el-form-item label="链接名称" prop="linkName">
          <el-input v-model="form.linkName" placeholder="请输入链接名称" />
        </el-form-item>
        <el-form-item label="链接地址" prop="linkUrl">
          <el-input v-model="form.linkUrl" placeholder="请输入链接地址" />
        </el-form-item> -->
        <el-form-item label="规则类型" prop="urlMatchRuleType">
          <el-select
            v-model="form.urlMatchRuleType"
            placeholder="请选择规则类型"
            @change="handleRuleTypeChange"
          >
            <el-option label="正则" :value="1" />
            <el-option label="静态" :value="2" />
          </el-select>
        </el-form-item>

        <!-- 正则相关字段 -->
        <template v-if="form.urlMatchRuleType == '1'">
          <el-form-item label="正则来源类型" prop="regularSourceType">
            <el-select
              v-model="form.regularSourceType"
              placeholder="请选择正则来源类型"
              @change="handleSourceTypeChange"
            >
              <el-option label="PC" :value="1" />
              <el-option label="H5" :value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="正则目标类型" prop="regularTargetType">
            <el-select
              v-model="form.regularTargetType"
              disabled="true"
              placeholder="请选择正则匹配目标类型"
            >
              <el-option label="PC" :value="1" />
              <el-option label="H5" :value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="正则表达式" prop="regularRegexPattern">
            <el-input v-model="form.regularRegexPattern" placeholder="请输入正则表达式" />
          </el-form-item>
          <el-form-item label="正则替换值" prop="regularReplacement">
            <el-input v-model="form.regularReplacement" placeholder="请输入正则替换值" />
          </el-form-item>
        </template>

        <!-- 静态相关字段 -->
        <template v-if="form.urlMatchRuleType == '2'">
          <el-form-item label="静态名称" prop="staticName">
            <el-input v-model="form.staticName" placeholder="请输入静态名称" />
          </el-form-item>

          <el-form-item label="PCurl" prop="staticPcUrl">
            <el-input v-model="form.staticPcUrl" placeholder="请输入静态值" />
          </el-form-item>
          <el-form-item label="H5url" prop="staticH5Url">
            <el-input v-model="form.staticH5Url" placeholder="请输入静态值" />
          </el-form-item>
        </template>

        <el-form-item label="优先级" prop="priority">
          <el-input-number
            v-model="form.priority"
            type="number"
            min="0"
            placeholder="请输入优先级"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取 消</el-button>
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </basic-container>
</template>

<script>
import listPage from '@/mixins/list-page';
import options from './urlOutLink.js';

export default {
  mixins: [listPage],
  name: 'url-out-link',
  data() {
    return {
      mode: 'customize',
      columns: [],
      childOptions: [],
      queryParams: {
        current: 1,
        size: 20,
      },
      // 弹窗相关
      dialogVisible: false,
      formTitle: '',
      form: {
        id: '',
        urlMatchRuleType: '',
        regularSourceType: '',
        regularTargetType: '',
        regularRegexPattern: '',
        regularReplacement: '',
        staticName: '',
        staticPcUrl: '',
        staticH5Url: '',
        priority: '',
      },
      rules: {
        linkName: [{ required: true, message: '请输入链接名称', trigger: 'blur' }],
        linkUrl: [{ required: true, message: '请输入链接地址', trigger: 'blur' }],
        urlMatchRuleType: [{ required: true, message: '请选择规则类型', trigger: 'change' }],
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
      this.api.system.pda
        .getMessageList(params)
        .then(res => {
          const { code, data } = res.data;
          if (code === 200) {
            this.tableData = data.records || [];
            this.total = data.total || 0;
            this.queryParams.current = data.current;
            this.queryParams.size = data.size;
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
        this.openDialog(row);
      } else if (action === 'add') {
        this.openDialog();
      } else if (action === 'row-dblclick') {
        this.openDialog(row);
      }
    },
    /** 处理删除 **/
    deleteData(ids) {
      this.loading = true;
      this.handleDeleteCommon(
        ids.join(','),
        `确定要删除数据id为[${ids.join(',')}]的数据项？`,
        this.api.system.pda.deleteMessage
      );
      this.loading = false;
    },
    // 打开弹窗
    openDialog(row) {
      this.dialogVisible = true;
      if (row) {
        this.formTitle = '编辑';
        this.form = JSON.parse(JSON.stringify(row));
      } else {
        this.formTitle = '新增';
        this.form = {
          urlMatchRuleType: '',
          regularSourceType: '',
          regularTargetType: '',
          regularRegexPattern: '',
          regularReplacement: '',
          staticName: '',
          staticPcUrl: '',
          staticH5Url: '',
          priority: '',
        };
      }
    },
    // 关闭弹窗
    handleClose() {
      this.dialogVisible = false;
      this.$refs.formRef.resetFields();
    },
    // 规则类型变化
    handleRuleTypeChange(val) {
      // 清空相关字段
      if (val === '1') {
        this.form.staticName = '';
        this.form.staticPcUrl = '';
        this.form.staticH5Url = '';
      } else if (val === '2') {
        this.form.regularSourceType = '';
        this.form.regularTargetType = '';
        this.form.regularRegexPattern = '';
        this.form.regularReplacement = '';
      }
    },
    // 正则来源类型变化
    handleSourceTypeChange(val) {
      // 当选择PC时，目标类型自动设置为H5；当选择H5时，目标类型自动设置为PC
      if (val == '1') {
        this.form.regularTargetType = 2;
      } else if (val == '2') {
        this.form.regularTargetType = 1;
      }
    },
    // 提交表单
    handleSubmit() {
      this.$refs.formRef.validate(valid => {
        if (valid) {
          this.loading = true;
          // 调用API保存数据
          const apiMethod = this.api.system.pda.postMessage;

          // 这里需要根据实际的API调整
          apiMethod(this.form)
            .then(res => {
              if (res.data.code === 200) {
                this.$message.success(this.form.id ? '更新成功' : '添加成功');
                this.handleClose();
                this.getData();
              } else {
                this.$message.error(res.data.msg || '操作失败');
              }
              this.loading = false;
            })
            .catch(err => {
              this.loading = false;
              console.error(err);
              this.$message.error('操作失败');
            });
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
:deep(.el-image-viewer__wrapper) {
  z-index: 3000 !important;
}
</style>
