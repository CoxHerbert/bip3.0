<template>
  <div class="warpName">
    <div class="list-page page-processing-outsourcing">
      <el-form
        ref="searchForm"
        :model="searchParams"
        label-width="80px"
        inline
        @submit.native.prevent
      >
        <el-form-item label="作业组" prop="jobGroup">
          <el-select v-model="searchParams.jobGroup" placeholder="" style="width: 220px">
            <el-option
              v-for="item in xxlGroupList"
              :key="item.value"
              :label="item.title"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="任务描述" prop="jobDesc">
          <el-select
            v-model="searchParams.triggerStatus"
            placeholder="请选择任务状态"
            clearable
            style="width: 220px"
            @keyup.enter.native="handleSearch"
          >
            <el-option label="运行" :value="1" />
            <el-option label="停止" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">搜索</el-button>
          <el-button icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      <!-- </div> -->
      <div class="action-banner">
        <el-button icon="Plus" type="primary" style="margin: 0 16px" @click="doAction('add')"
          >新增</el-button
        >
      </div>
      <div class="table-container">
        <el-table
          ref="tableRef"
          v-loading="loading"
          :data="tableData"
          border
          row-key="id"
          @select="handleSelect"
          @select-all="handleSelectAll"
          @selection-change="handleSelectionChange"
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
            <!-- 普通文字类型 -->
            <el-table-column
              v-else-if="col.type === 'rowText'"
              :key="'rowText' + i"
              :label="col.label"
              :width="col.width"
              :min-width="col.minWidth"
              :prop="col.prop"
              :align="col.align ? col.align : 'center'"
              show-overflow-tooltip
            >
              <template #default="scoped">
                <!-- 触发器状态使用el-tag显示 -->
                <template v-if="col.prop === 'triggerStatus'">
                  <el-tag :type="scoped.row[col.prop] === 1 ? 'success' : 'danger'" size="small">
                    {{ scoped.row[col.prop] === 1 ? '运行' : '停止' }}
                  </el-tag>
                </template>
                <!-- 其他字段保持原有显示 -->
                <span v-else>
                  {{
                    [null, undefined, ''].includes(scoped.row[col.prop])
                      ? '-'
                      : scoped.row[col.prop]
                  }}
                </span>
              </template>
            </el-table-column>
            <!-- 操作列 -->
            <el-table-column
              v-else-if="col.type === 'actions'"
              :key="'actions' + i"
              label="操作"
              :width="col.width"
              :min-width="col.minWidth"
              fixed="right"
            >
              <template #default="scoped">
                <el-dropdown>
                  <el-button type="primary" size="mini">
                    操作<el-icon class="el-icon--right"><arrow-down /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="doAction('edit', scoped)">编辑</el-dropdown-item>
                      <el-dropdown-item @click="doAction('delete', scoped)">删除</el-dropdown-item>
                      <el-dropdown-item @click="doAction('stop', scoped)"
                        >停止任务</el-dropdown-item
                      >
                      <el-dropdown-item @click="doAction('start', scoped)"
                        >开始任务</el-dropdown-item
                      >
                      <el-dropdown-item @click="doAction('runOnce', scoped)"
                        >执行一次</el-dropdown-item
                      >
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
            </el-table-column>
          </template>
        </el-table>
      </div>
      <dc-pagination
        v-show="total > 0"
        :total="total"
        v-model:page="searchParams.current"
        v-model:limit="searchParams.size"
        @pagination="getData"
      />
    </div>
  </div>

  <!-- 新增/编辑弹框 -->
  <el-dialog
    :title="dialogTitle"
    v-model="dialogVisible"
    width="1000px"
    :close-on-click-modal="false"
    @close="handleDialogClose"
    class="job-dialog"
  >
    <div class="dialog-content-wrapper">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        class="job-form"
      >
        <!-- 基础配置 -->
        <div class="config-section">
          <h3 class="section-title">基础配置</h3>
          <el-row :gutter="10">
            <el-col :span="12">
              <el-form-item label="执行器" prop="jobGroup">
                <el-select
                  v-model="formData.jobGroup"
                  placeholder="请选择执行器"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in xxlGroupList"
                    :key="item.id"
                    :label="item.title"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="任务描述" prop="jobDesc">
                <el-input v-model="formData.jobDesc" placeholder="请输入任务描述" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="负责人">
                <el-input v-model="formData.author" placeholder="请输入负责人" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="报警邮件">
                <el-input
                  v-model="formData.alarmEmail"
                  placeholder="请输入报警邮件，多个邮件地址则逗号分隔"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 调度配置 -->
        <div class="config-section">
          <h3 class="section-title">调度配置</h3>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="调度类型" prop="scheduleType">
                <el-select
                  v-model="formData.scheduleType"
                  placeholder="请选择调度类型"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in SchedulingType"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="" v-if="formData.scheduleType === 'NONE'" prop="scheduleConf">
                <div style="display: flex; gap: 8px; align-items: center">
                  <!-- <el-input
                    v-model="formData.scheduleConf"
                    placeholder="cron表达式"
                    style="flex: 1"
                  /> -->
                </div>
              </el-form-item>
              <el-form-item
                label="Cron"
                v-else-if="formData.scheduleType === 'CRON'"
                prop="schedule_conf_CRON"
              >
                <div style="display: flex; gap: 8px; align-items: center">
                  <el-input
                    v-model="formData.scheduleConf"
                    placeholder="cron表达式"
                    style="flex: 1"
                  />
                </div>
              </el-form-item>
              <el-form-item
                label="固定速率"
                v-else-if="formData.scheduleType === 'FIX_RATE'"
                prop="schedule_conf_FIX_RATE"
              >
                <div style="display: flex; gap: 8px; align-items: center">
                  <el-input
                    v-model="formData.scheduleConf"
                    placeholder="固定速率"
                    style="flex: 1"
                  />
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 任务配置 -->
        <div class="config-section">
          <h3 class="section-title">任务配置</h3>
          <el-row :gutter="10" style="margin: 0">
            <el-col :span="12" style="padding: 0 5px">
              <el-form-item label="运行模式" prop="glueType" style="margin-bottom: 15px">
                <el-select
                  v-model="formData.glueType"
                  :disabled="formData.id != ''"
                  placeholder="请选择运行模式"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in OperatingMode"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="JobHandler" prop="executorHandler">
                <el-input v-model="formData.executorHandler" placeholder="请输入JobHandler" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="任务参数">
                <el-input
                  v-model="formData.executorParam"
                  placeholder="请输入任务参数"
                  type="textarea"
                  :rows="2"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 高级配置 -->
        <div class="config-section">
          <h3 class="section-title">高级配置</h3>
          <el-row :gutter="10" style="margin: 0">
            <el-col :span="12" style="padding: 0 5px">
              <el-form-item
                label="路由策略"
                prop="executorRouteStrategy"
                style="margin-bottom: 15px"
              >
                <el-select
                  v-model="formData.executorRouteStrategy"
                  placeholder="请选择路由策略"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in RouteMode"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="子任务ID">
                <el-input
                  v-model="formData.childJobId"
                  placeholder="请输入子任务的任务ID,如存在多个则逗号分隔"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="调度过期策略">
                <el-select
                  v-model="formData.misfireStrategy"
                  placeholder="请选择调度过期策略"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in misfireStrategyList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="阻塞处理策略" prop="executorBlockStrategy">
                <el-select
                  v-model="formData.executorBlockStrategy"
                  placeholder="请选择阻塞处理策略"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in PolicyList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="任务超时时间">
                <el-input
                  v-model="formData.executorTimeout"
                  placeholder="任务超时时间，单位秒，大于零时生效"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="失败重试次数">
                <el-input-number
                  v-model="formData.executorFailRetryCount"
                  :min="0"
                  placeholder="失败重试次数，大于零时生效"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleDialogClose">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script>
import listPage from '@/mixins/list-page';
import options from './jobinfo';

export default {
  mixins: [listPage],
  name: 'jobinfo-list',
  data() {
    return {
      columns: [],
      xxlGroupList: [],
      dialogVisible: false,
      searchParams: {
        jobGroup: '',
        triggerStatus: '',
        current: 1,
        size: 20,
      },
      formData: {
        jobGroup: '',
        jobDesc: '',
        executorRouteStrategy: '',
        executorBlockStrategy: '',
        scheduleType: '',
        // scheduleConf: '',
        schedule_conf_CRON: null,
        schedule_conf_FIX_RATE: 1,
        schedule_conf_FIX_DELAY: null,
        glueType: '',
        executorHandler: '',
        executorParam: '',
        author: '',
        misfireStrategy: '',
        alarmEmail: '',
        executorTimeout: 0,
        executorFailRetryCount: 0,
        childJobId: '',
        triggerStatus: 0,
      },
      formRules: {
        jobGroup: [{ required: true, message: '请选择执行器', trigger: 'change' }],
        jobDesc: [{ required: true, message: '请输入任务描述', trigger: 'blur' }],
        scheduleType: [{ required: true, message: '请选择调度类型', trigger: 'change' }],
        executorHandler: [{ required: true, message: '请输入JobHandler', trigger: 'blur' }],
        executorBlockStrategy: [
          { required: true, message: '请选择阻塞处理策略', trigger: 'change' },
        ],
        author: [{ required: true, message: '请输入作者', trigger: 'blur' }],
      },
      OperatingMode: [],
      RouteMode: [],
      total: 0,
      SchedulingType: [],
      PolicyList: [],
      misfireStrategy: [],
    };
  },
  created() {
    this.columns = options().columns;
    this.OperatingMode = options().OperatingMode;
    this.RouteMode = options().RouteMode;
    this.SchedulingType = options().SchedulingType;
    this.PolicyList = options().PolicyList;
    this.misfireStrategyList = options().misfireStrategy;
  },
  mounted() {
    this.init();
    this.getData();
  },
  // 在methods中添加以下方法
  methods: {
    init() {
      this.api.job.jobinfo.getXxlGroupList().then(res => {
        const { code, data } = res.data;
        if (code === 200) {
          this.xxlGroupList = data;
          this.searchParams.jobGroup = data[0].id;
          this.searchParams.triggerStatus = '';
          this.getData();
        }
      });
    },
    /** 获取列表数据 **/
    getData() {
      this.loading = true;
      this.api.job.jobinfo
        .getXxlJobInfoList(this.searchParams)
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
      if (action === 'stop') {
        this.stopXxlJobInfo(row);
      } else if (action === 'delete') {
        this.deleteXxlJobInfo(row);
      } else if (action === 'edit') {
        this.dialogTitle = '编辑任务';
        this.formData = { ...row };
        this.dialogVisible = true;
      } else if (action === 'add') {
        this.dialogTitle = '新增任务';

        // this.formData = Object.keys(this.formData).reduce((acc, key) => {
        //   acc[key] = null;
        //   return acc;
        // }, {});

        console.log(this.formData);
        this.resetFormData();
        this.dialogVisible = true;
      } else if (action === 'start') {
        this.startXxlJobInfo(row);
      } else if (action === 'runOnce') {
        this.triggerXxlJobInfo(row);
      }
    },
    // 重置表单数据
    resetFormData() {
      this.formData = {
        id: '',
        jobGroup: this.searchParams.jobGroup || '',
        jobDesc: '',
        executorRouteStrategy: 'FIRST',
        executorBlockStrategy: 'SERIAL_EXECUTION',
        scheduleType: 'NONE',
        scheduleConf: '',
        glueType: 'BEAN',
        executorHandler: '',
        executorParam: '',
        author: '',
        alarmEmail: '',
        executorTimeout: 0,
        misfireStrategy: 'DO_NOTHING',
        executorFailRetryCount: 0,
        childJobId: '',
        triggerStatus: 0,
      };
    },
    /** 停止任务 **/
    stopXxlJobInfo(row) {
      this.$confirm('确定停止该任务吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.api.job.jobinfo.stopXxlJobInfo({ id: row.id }).then(res => {
          const { code } = res.data;
          if (code === 200) {
            this.$message.success('停止成功');
            this.getData();
          }
        });
      });
    },
    /** 启动任务 **/
    startXxlJobInfo(row) {
      this.$confirm('确定启动该任务吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.api.job.jobinfo.startXxlJobInfo({ id: row.id }).then(res => {
          const { code } = res.data;
          if (code === 200) {
            this.$message.success('启动成功');
            this.getData();
          }
        });
      });
    },
    /** 手动触发任务 **/
    triggerXxlJobInfo(row) {
      this.$confirm('确定手动触发该任务吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.api.job.jobinfo.triggerXxlJobInfo({ id: row.id }).then(res => {
          const { code } = res.data;
          if (code === 200) {
            this.$message.success('手动触发成功');
            this.getData();
          }
        });
      });
    },
    /** 删除任务 **/
    deleteXxlJobInfo(row) {
      this.$confirm('确定删除该任务吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.api.job.jobinfo.deleteXxlJobInfo({ id: row.id }).then(res => {
          const { code } = res.data;
          if (code === 200) {
            this.$message.success('删除成功');
            this.getData();
          }
        });
      });
    },

    // 提交表单
    submitForm() {
      this.$refs.formRef.validate(valid => {
        if (valid) {
          const apiCall = this.formData.id
            ? this.api.job.jobinfo.upXxlJobInfo(this.formData)
            : this.api.job.jobinfo.addXxlJobInfo(this.formData);

          apiCall.then(res => {
            const { code } = res.data;
            if (code === 200) {
              this.$message.success(this.formData.id ? '编辑成功' : '新增成功');
              this.dialogVisible = false;
              this.getData();
            }
          });
        }
      });
    },
    // 关闭弹框
    handleDialogClose() {
      this.dialogVisible = false;
      this.$refs.formRef.resetFields();
    },
  },
};
</script>
<style scoped>
.warpName {
  display: flex;
  width: 100%;
  height: 100%;
}
.header {
  height: 50px;
}

.query-tree {
  width: 200px;
  flex-shrink: 0; /* 防止左侧树形结构被压缩 */
  border-right: 1px solid #e6e6e6;
  padding-right: 2px;
  height: 100%; /* 设置高度为100%以填充父容器 */
  display: flex;
  flex-direction: column;
}

.tree-scrollbar {
  flex: 1; /* 让滚动条占据剩余空间 */
  height: 100%; /* 确保高度充满父容器 */
  background-color: #fff;
}

.list-page {
  flex: 1; /* 占据剩余空间 */
  padding-left: 2px;
  overflow: hidden; /* 防止内容溢出 */
}

.page-processing-outsourcing {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.table-container {
  flex: 1;
  overflow: auto;
}

/* 弹框配置块样式 */
.config-section {
  margin-bottom: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #ebeef5;
}

/* 确保输入框不溢出容器 */
.job-form .el-input,
.job-form .el-select,
.job-form .el-input-number {
  width: 100%;
  box-sizing: border-box;
}

/* 增加内容包装层，确保内部元素不会溢出 */
.dialog-content-wrapper {
  width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
  padding: 0;
}

/* 强制禁止所有可能的滚动条 */
.job-dialog * {
  overflow-x: hidden !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
}

.config-section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 15px;

  padding-bottom: 5px;
  border-left: 3px solid #f26c0c;
  padding-left: 10px;
  margin-top: 5px;
}
</style>
