<!-- src/views/resume/ProjectResume.vue -->
<template>
  <div class="section" v-loading="loading">
    <div class="header">
      <div class="title">
        <span class="bar"></span>
        <span>项目履历</span>
      </div>
      <!-- 新增按钮：同一时间只允许一条编辑/新增 -->
      <el-button type="warning" size="small" :disabled="!!editingId" @click="startCreate">
        新增项目履历
      </el-button>
    </div>

    <div v-if="!list.length && !loading" class="empty">暂无项目履历</div>

    <div
      v-for="item in list"
      :key="item.id"
      class="entry-card"
      @mouseenter="hoverId = item.id"
      @mouseleave="hoverId = null"
    >
      <!-- 顶部：左-项目名/岗位；右-时间/操作（hover 才显示） -->
      <div class="entry-header">
        <div class="left">
          <span class="entry-name">{{ item.projectName || '未命名项目' }}</span>
          <span class="entry-role">{{ item.projectRole || '-' }}</span>
        </div>
        <div class="right">
          <!-- 默认仅显示时间；hover 时切换为操作 -->
          <span v-if="hoverId !== item.id" class="time">
            {{
              isEditing(item)
                ? displayRangeByMonth(form.rangeMonth) || '-'
                : displayRange(item) || '-'
            }}
          </span>

          <div v-else class="actions">
            <el-link type="primary" :underline="false" @click.stop="startEdit(item)">
              编辑
            </el-link>

            <el-divider direction="vertical" />
            <el-link type="danger" :underline="false" @click="removeItem(item)">删除</el-link>
          </div>
        </div>
      </div>

      <!-- 单视图：默认禁用；编辑态解禁；底部出现保存/取消 -->
      <el-form
        :model="isEditing(item) ? form : item"
        label-width="80px"
        size="small"
        class="edit-form mono-form"
        @keydown.esc="isEditing(item) && cancelEdit()"
      >
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="项目名称">
              <el-input
                v-if="isEditing(item)"
                v-model="form.projectName"
                placeholder="XXXX项目名称"
                clearable
                :disabled="submitting"
              />
              <el-input v-else :model-value="item.projectName" readonly disabled placeholder="—" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="项目角色">
              <el-input
                v-if="isEditing(item)"
                v-model="form.projectRole"
                placeholder="XXXX岗位"
                clearable
                :disabled="submitting"
              />
              <el-input v-else :model-value="item.projectRole" readonly disabled placeholder="—" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="项目时间">
              <template v-if="isEditing(item)">
                <el-date-picker
                  v-model="form.rangeMonth"
                  type="monthrange"
                  unlink-panels
                  range-separator="至"
                  start-placeholder="开始"
                  end-placeholder="结束"
                  value-format="YYYY-MM"
                  style="width: 100%"
                  :disabled="submitting"
                />
              </template>
              <template v-else>
                <el-input :model-value="displayRange(item)" readonly disabled placeholder="—" />
              </template>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="项目链接">
              <template v-if="isEditing(item)">
                <el-input
                  v-model="form.projectLink"
                  placeholder="https:// 或域名"
                  clearable
                  :disabled="submitting"
                />
              </template>
              <template v-else>
                <div class="readonly-link">
                  <template v-if="item.projectLink">
                    {{ item.projectLink }}
                  </template>
                  <span v-else class="muted">—</span>
                </div>
              </template>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="项目内容">
          <template v-if="isEditing(item)">
            <el-input
              v-model="form.projectNote"
              type="textarea"
              :rows="6"
              placeholder="职责/业绩/技术栈/难点与解决等"
              :disabled="submitting"
            />
          </template>
          <template v-else>
            <el-input
              :model-value="item.projectNote || ''"
              type="textarea"
              :rows="6"
              readonly
              disabled
              placeholder="—"
            />
          </template>
        </el-form-item>

        <!-- 仅编辑态显示 -->
        <div v-if="isEditing(item)" class="edit-actions">
          <el-button :disabled="submitting" @click="cancelEdit">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="saveEdit(item)">保存</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, computed, watch, getCurrentInstance } from 'vue';
import { ElMessage } from 'element-plus';
import { useRoute } from 'vue-router';
import Api from '@/api'; // 需包含 appManage.talentProjectRecord 模块（getList/submit/remove）

const { proxy } = getCurrentInstance();

// ============== 路由参数（人才ID） ==============
const route = useRoute();
const routeId = computed(() => route.params.id ?? route.query.id);

// ============== 状态 ==============
const loading = ref(false);
const submitting = ref(false);
const list = ref([]); // 从接口加载
const hoverId = ref(null);
const editingId = ref(null);

// 新增临时记录的占位 ID
const TEMP_ID = '$new';

// 用于“当前正在编辑”的那条记录
const form = reactive({
  projectName: '',
  projectRole: '',
  rangeMonth: [], // ['YYYY-MM','YYYY-MM']
  projectNote: '',
  projectLink: '',
});

// ============== 工具函数 ==============
function isoToMonth(iso) {
  if (!iso) return '';
  return String(iso).slice(0, 7); // 2021-03-01T00:00:00 -> 2021-03
}
function monthToISO(month) {
  if (!month) return '';
  return `${month}-01T00:00:00`;
}
const fmtMonthDisp = m => (m ? m.replace('-', '.') : '');
function displayRange(it) {
  if (!it) return '';
  const sm = isoToMonth(it.projectStartDate);
  const em = isoToMonth(it.projectEndDate);
  if (!sm && !em) return '';
  return `${fmtMonthDisp(sm)}-${fmtMonthDisp(em)}`;
}
function displayRangeByMonth(monthRange) {
  if (!monthRange || monthRange.length < 1) return '';
  const [sm, em] = monthRange;
  return `${fmtMonthDisp(sm)}-${fmtMonthDisp(em)}`;
}

const isEditing = it => editingId.value === it.id;

// ============== 数据加载 ==============
async function fetchList() {
  if (!routeId.value) {
    list.value = [];
    return;
  }
  loading.value = true;
  try {
    const res = await Api.appManage.talentProjectRecord.getList({
      talentUserId: routeId.value,
      current: 1,
      size: 9999,
    });
    const { code, data } = res?.data || {};
    list.value = code === 200 ? data?.records || [] : [];
  } catch (e) {
    list.value = [];
  } finally {
    loading.value = false;
  }
}
onMounted(fetchList);
watch(routeId, fetchList);

// ============== 新增 ==============
function startCreate() {
  if (editingId.value) {
    return ElMessage.warning('请先完成当前编辑/新增');
  }
  const temp = {
    id: TEMP_ID,
    $temp: true,
    projectName: '',
    projectRole: '',
    projectStartDate: '',
    projectEndDate: '',
    projectNote: '',
    projectLink: '',
  };
  // 顶部插入一条临时记录
  list.value.unshift(temp);
  editingId.value = TEMP_ID;
  Object.assign(form, {
    projectName: '',
    projectRole: '',
    rangeMonth: [],
    projectNote: '',
    projectLink: '',
  });
}

// ============== 编辑流转 ==============
function startEdit(it) {
  if (editingId.value && editingId.value !== it.id) {
    return ElMessage.warning('请先完成当前编辑/新增');
  }
  editingId.value = it.id;
  Object.assign(form, {
    projectName: it.projectName || '',
    projectRole: it.projectRole || '',
    rangeMonth: [isoToMonth(it.projectStartDate), isoToMonth(it.projectEndDate)].filter(Boolean),
    projectNote: it.projectNote || '',
    projectLink: it.projectLink || '',
  });
}
function cancelEdit() {
  // 若是新增的临时记录，取消时移除
  if (editingId.value === TEMP_ID) {
    const i = list.value.findIndex(x => x.id === TEMP_ID);
    if (i > -1) list.value.splice(i, 1);
  }
  editingId.value = null;
}

async function saveEdit(target) {
  if (!form.projectName?.trim()) return ElMessage.warning('请填写项目名称');
  if (!form.rangeMonth?.length) return ElMessage.warning('请选择项目时间');

  const isCreate = !target?.id || target?.$temp;
  const payload = {
    id: isCreate ? undefined : target?.id, // 无 id / 临时项 => 新增
    talentUserId: routeId.value,
    projectName: form.projectName?.trim(),
    projectRole: form.projectRole?.trim(),
    projectStartDate: monthToISO(form.rangeMonth[0]),
    projectEndDate: monthToISO(form.rangeMonth[1]),
    projectNote: form.projectNote || '',
    projectLink: form.projectLink || '',
  };

  submitting.value = true;
  try {
    const res = await Api.appManage.talentProjectRecord.submit(payload);
    const { code, data } = res?.data || {};
    if (code === 200) {
      const saved = data || payload;
      if (isCreate) {
        // 用后端返回替换临时记录
        const i = list.value.findIndex(x => x.id === TEMP_ID);
        if (i > -1) {
          // 确保有 id：若后端未返 id，回退一个随机占位，避免 key 冲突
          const ensured = { ...saved, id: saved.id ?? String(Date.now()) };
          list.value.splice(i, 1, ensured);
        } else {
          list.value.unshift({ ...saved, id: saved.id ?? String(Date.now()) });
        }
      } else {
        // 更新
        const idx = list.value.findIndex(x => x.id === target?.id);
        if (idx > -1) list.value[idx] = { ...list.value[idx], ...saved };
      }
      ElMessage.success('已保存');
      editingId.value = null;
    } else {
      ElMessage.error('保存失败');
    }
  } catch (e) {
    ElMessage.error('保存失败');
  } finally {
    submitting.value = false;
  }
}

// ============== 删除 ==============
async function removeItem(it) {
  // 删除临时新增项（未保存）
  if (it?.id === TEMP_ID) {
    const i = list.value.findIndex(x => x.id === TEMP_ID);
    if (i > -1) list.value.splice(i, 1);
    if (editingId.value === TEMP_ID) editingId.value = null;
    return;
  }
  if (!it?.id) return;
  proxy
    .$confirm(`确认是否删除该数据项？`)
    .then(async () => {
      return await Api.appManage.talentProjectRecord.remove({ ids: it.id });
    })
    .then(res => {
      const { code } = res?.data || {};
      if (code === 200) {
        const i = list.value.findIndex(x => x.id === it.id);
        if (i > -1) list.value.splice(i, 1);
        proxy.$message.success('删除成功');
      } else {
        ElMessage.error('删除失败');
      }
    })
    .catch(() => {
      ElMessage.error('删除失败');
    });
}
</script>

<style scoped lang="scss">
/* 原样保留 */
.section {
  .title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
    .bar {
      width: 4px;
      height: 14px;
      background: #ff8a00;
      border-radius: 2px;
    }
  }
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }
}

.empty {
  color: #9ca3af;
  font-size: 13px;
  padding: 8px 2px 14px;
}

.entry-card {
  background: #f7f7f8;
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 16px;
}

.entry-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;

  .left {
    display: flex;
    align-items: baseline;
    gap: 10px;
    flex-wrap: wrap;
    .entry-name {
      font-weight: 600;
      color: #333;
    }
    .entry-role {
      color: #666;
    }
  }

  .right {
    position: relative;
    min-width: 160px;

    .time {
      color: #999;
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 6px;

      :deep(.el-link) {
        font-size: 13px;
      }
    }
  }
}

/* 单视图表单 */
.mono-form {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e6e6e9;
  padding: 10px 12px;

  .readonly-link {
    font-size: 14px;
    .link-val {
      word-break: break-all;
    }
    .muted {
      color: #999;
    }
  }
}

/* 底部按钮 */
.edit-actions {
  text-align: right;
  margin-top: 10px;
}

/* 细节：禁用态与启用态的轻微视觉区分 */
:deep(.el-input.is-disabled .el-input__inner),
:deep(.el-textarea.is-disabled .el-textarea__inner) {
  color: #666;
  -webkit-text-fill-color: #666;
}
</style>
