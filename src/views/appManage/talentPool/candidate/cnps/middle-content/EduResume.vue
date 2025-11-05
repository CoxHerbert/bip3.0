<!-- src/views/resume/EduResume.vue -->
<template>
  <div class="section" v-loading="loading">
    <div class="header">
      <div class="title">
        <span class="bar"></span>
        <span>教育履历</span>
      </div>
      <!-- 同时只能编辑/新增一条：有正在编辑的记录时禁用 -->
      <el-button type="warning" size="small" :disabled="!!editingId" @click="addNew">
        添加教育履历
      </el-button>
    </div>

    <div class="content">
      <div v-if="!list.length && !loading" class="empty">暂无教育履历</div>

      <div
        v-for="(it, idx) in list"
        :key="it.id ?? it.$uid ?? idx"
        class="entry-card"
        @mouseenter="hoverId = it.id ?? it.$uid"
        @mouseleave="hoverId = null"
      >
        <!-- 头部：左-学校/专业/学历；右-时间/操作（hover 才显示） -->
        <div class="entry-header">
          <div class="left">
            <span class="school">{{ it.schoolName || '未填写学校' }}</span>
            <span class="major">{{ it.professionalName || '-' }}</span>
            <span class="degree">{{ it.qualification || '-' }}</span>
          </div>
          <div class="right">
            <!-- 非 hover：仅显示时间；编辑态：预览编辑中的时间 -->
            <span v-if="hoverId !== (it.id ?? it.$uid)" class="time">
              {{
                isEditing(it)
                  ? displayRangeByMonth(form.rangeMonth) || '-'
                  : displayRange(it) || '-'
              }}
            </span>

            <!-- hover：显示编辑/删除 -->
            <div v-else class="actions">
              <el-link type="primary" :underline="false" @click.stop="startEdit(it)">
                编辑
              </el-link>

              <el-divider direction="vertical" />
              <el-link type="danger" :underline="false" @click="removeItem(it)">删除</el-link>
            </div>
          </div>
        </div>

        <!-- 单视图表单：默认控件禁用；编辑态解禁；底部出现保存/取消 -->
        <el-form
          :model="isEditing(it) ? form : it"
          label-width="88px"
          size="small"
          class="edit-form mono-form"
          @keydown.esc="isEditing(it) && cancelEdit()"
        >
          <el-row :gutter="12">
            <el-col :span="12">
              <el-form-item label="学校名称">
                <el-input
                  v-if="isEditing(it)"
                  v-model="form.schoolName"
                  placeholder="XXXX大学"
                  clearable
                  :disabled="submitting"
                />
                <el-input v-else :model-value="it.schoolName" readonly disabled placeholder="—" />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="专业">
                <el-input
                  v-if="isEditing(it)"
                  v-model="form.professionalName"
                  placeholder="XXXX专业"
                  clearable
                  :disabled="submitting"
                />
                <el-input
                  v-else
                  :model-value="it.professionalName"
                  readonly
                  disabled
                  placeholder="—"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="12">
            <el-col :span="12">
              <el-form-item label="学历">
                <template v-if="isEditing(it)">
                  <el-input
                    v-model="form.qualification"
                    placeholder="请输入学历"
                    :disabled="submitting"
                  />
                </template>
                <template v-else>
                  <el-input
                    :model-value="it.qualification || ''"
                    readonly
                    disabled
                    placeholder="—"
                  />
                </template>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="就读时间">
                <template v-if="isEditing(it)">
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
                  <el-input :model-value="displayRange(it)" readonly disabled placeholder="—" />
                </template>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="经历">
            <template v-if="isEditing(it)">
              <el-input
                v-model="form.experienceNote"
                type="textarea"
                :rows="6"
                placeholder="课程/竞赛/科研/奖项/社团等"
                :disabled="submitting"
              />
            </template>
            <template v-else>
              <el-input
                :model-value="it.experienceNote || ''"
                type="textarea"
                :rows="6"
                readonly
                disabled
                placeholder="—"
              />
            </template>
          </el-form-item>

          <!-- 仅编辑态显示 -->
          <div v-if="isEditing(it)" class="edit-actions">
            <el-button :disabled="submitting" @click="cancelEdit">取消</el-button>
            <el-button type="primary" :loading="submitting" @click="saveEdit(it)">保存</el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, watch, getCurrentInstance } from 'vue';
import { ElMessage } from 'element-plus';
import { useRoute } from 'vue-router';
import Api from '@/api';
const { proxy } = getCurrentInstance();

/** 路由 id（params 优先，fallback query） */
const route = useRoute();
const routeId = computed(() => route.params.id ?? route.query.id);

/** 列表数据 + 状态 */
const list = ref([]);
const loading = ref(false);
const submitting = ref(false);
const hoverId = ref(null);
const editingId = ref(null);

/** 当前编辑表单 */
const form = reactive({
  schoolName: '',
  professionalName: '',
  qualification: '',
  rangeMonth: [], // ['YYYY-MM','YYYY-MM']
  experienceNote: '',
});

/** 时间工具 */
const isoToMonth = iso => (iso ? String(iso).slice(0, 7) : '');
function monthStartISO(m) {
  return m ? `${m}-01T00:00:00` : '';
}
function monthEndISO(m) {
  if (!m) return '';
  const [y, mm] = m.split('-').map(x => parseInt(x, 10));
  const last = new Date(y, mm, 0).getDate();
  return `${y}-${String(mm).padStart(2, '0')}-${String(last).padStart(2, '0')}T00:00:00`;
}
const fmtMonthDisp = m => (m ? m.replace('-', '.') : '');
function displayRange(it) {
  const sm = isoToMonth(it.startDate);
  const em = isoToMonth(it.endDate);
  if (!sm && !em) return '';
  return `${fmtMonthDisp(sm)}-${em ? fmtMonthDisp(em) : '至今'}`;
}
function displayRangeByMonth(monthRange) {
  if (!monthRange || monthRange.length < 1) return '';
  const [sm, em] = monthRange;
  return `${fmtMonthDisp(sm)}-${em ? fmtMonthDisp(em) : '至今'}`;
}
const isEditing = it => editingId.value === (it.id ?? it.$uid);

/** 加载列表 */
async function fetchList() {
  if (!routeId.value) {
    list.value = [];
    return;
  }
  loading.value = true;
  try {
    const res = await Api.appManage.talentEducation.getList({
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

/** 新增一条（一次只能一条） */
function addNew() {
  if (editingId.value) {
    return ElMessage.warning('请先保存或取消当前正在编辑的记录');
  }
  const uid = `new_${Date.now()}`;
  const blank = {
    $uid: uid,
    $isNew: true,
    schoolName: '',
    professionalName: '',
    qualification: '',
    startDate: '',
    endDate: '',
    experienceNote: '',
  };
  // 插到最前
  list.value.unshift(blank);
  // 进入编辑态并填空表单
  editingId.value = uid;
  Object.assign(form, {
    schoolName: '',
    professionalName: '',
    qualification: '',
    rangeMonth: [],
    experienceNote: '',
  });
  hoverId.value = uid;
}

/** 进入/取消编辑 */
function startEdit(it) {
  if (editingId.value && editingId.value !== (it.id ?? it.$uid)) {
    return ElMessage.warning('请先保存或取消当前正在编辑的记录');
  }
  editingId.value = it.id ?? it.$uid;
  Object.assign(form, {
    schoolName: it.schoolName || '',
    professionalName: it.professionalName || '',
    qualification: it.qualification || '',
    rangeMonth: [isoToMonth(it.startDate), isoToMonth(it.endDate)].filter(Boolean),
    experienceNote: it.experienceNote || '',
  });
}
function cancelEdit() {
  if (!editingId.value) return;
  // 如果是新增的临时行，取消时移除
  const i = list.value.findIndex(
    x => (x.id ?? x.$uid) === editingId.value || x.$uid === editingId.value
  );
  if (i > -1 && list.value[i].$isNew) list.value.splice(i, 1);
  editingId.value = null;
}

/** 保存（新增/编辑共用） */
async function saveEdit(target) {
  if (!form.schoolName?.trim()) return ElMessage.warning('请填写学校名称');
  if (!form.rangeMonth?.length) return ElMessage.warning('请选择就读时间');

  const [mStart, mEnd] = form.rangeMonth;
  const payload = {
    id: target?.id, // 新增时为空；编辑时有值
    talentUserId: routeId.value,
    schoolName: form.schoolName?.trim(),
    professionalName: form.professionalName?.trim(),
    qualification: form.qualification || '',
    experienceNote: form.experienceNote || '',
    startDate: monthStartISO(mStart),
    endDate: monthEndISO(mEnd),
    period: `${fmtMonthDisp(mStart)}-${mEnd ? fmtMonthDisp(mEnd) : '至今'}`,
  };

  submitting.value = true;
  try {
    const res = await Api.appManage.talentEducation.submit(payload);
    const { code, data } = res?.data || {};
    if (code === 200) {
      const saved = data || { ...payload };
      // 替换原有项（兼容新增行以 $uid 定位）
      const idx = list.value.findIndex(
        x =>
          (target?.id && x.id === target.id) ||
          (!target?.id && x.$uid === (target?.$uid ?? editingId.value))
      );
      if (idx > -1) {
        const next = { ...list.value[idx], ...saved };
        // 清理临时字段
        delete next.$uid;
        delete next.$isNew;
        list.value[idx] = next;
      } else {
        list.value.unshift(saved);
      }
      ElMessage.success('已保存');
      editingId.value = null;
      hoverId.value = null;
    } else {
      ElMessage.error('保存失败');
    }
  } catch (e) {
    ElMessage.error('保存失败');
  } finally {
    submitting.value = false;
  }
}

/** 删除（保留原有逻辑；新增的临时行没有 id，不走接口） */
async function removeItem(it) {
  if (!it?.id) {
    // 新增未保存的临时行：本地移除即可
    const i = list.value.findIndex(x => x.$uid && x.$uid === it.$uid);
    if (i > -1) list.value.splice(i, 1);
    if (editingId.value === it.$uid) editingId.value = null;
    return;
  }
  proxy
    .$confirm(`确认是否删除该数据项？`)
    .then(async () => {
      return await Api.appManage.talentEducation.remove({ ids: it.id });
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
    .catch(e => {
      ElMessage.error('删除失败', e);
    });
}
</script>

<style scoped lang="scss">
.section {
  .content {
    flex: 1;
    overflow: auto;
  }
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

/* 卡片 */
.entry-card {
  background: #fff;
  border: 1px solid #e6e6e9;
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 16px;
}

/* 头部 */
.entry-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;

  .left {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    align-items: baseline;
    .school {
      font-weight: 600;
      color: #333;
    }
    .major,
    .degree {
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

/* 单视图表单：禁用态样式统一 */
.mono-form {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e6e6e9;
  padding: 10px 12px;
}

/* 底部按钮 */
.edit-actions {
  text-align: right;
  margin-top: 10px;
}

/* 细节：禁用态颜色统一 */
:deep(.el-input.is-disabled .el-input__inner),
:deep(.el-textarea.is-disabled .el-textarea__inner) {
  color: #666;
  -webkit-text-fill-color: #666;
}
</style>
