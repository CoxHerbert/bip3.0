<!-- src/views/resume/WorkResume.vue -->
<template>
  <div class="section" v-loading="loading">
    <div class="header">
      <div class="title">
        <span class="bar"></span>
        <span>工作履历</span>
      </div>
      <!-- ✅ 新增按钮：与编辑共用接口；有编辑中则禁用 -->
      <el-button type="warning" size="small" :disabled="isEditingAny" @click="openCreate">
        添加工作履历
      </el-button>
    </div>

    <div v-if="!list.length && !loading" class="empty">暂无工作履历</div>

    <div
      v-for="item in list"
      :key="item.id"
      class="entry-card"
      @mouseenter="hoverId = item.id"
      @mouseleave="hoverId = null"
    >
      <!-- 顶部：左 公司 + 岗位；右 时间 / 操作（hover 才显示） -->
      <div class="entry-header">
        <div class="left">
          <span class="entry-name">{{ item.companyName || '未填写公司' }}</span>
          <span class="entry-role">{{ item.position || '-' }}</span>
        </div>
        <div class="right">
          <!-- 非 hover 显示时间；编辑态显示表单时间预览 -->
          <span v-if="hoverId !== item.id" class="time">
            {{
              isEditing(item)
                ? displayRangeByMonth(form.rangeMonth) || '-'
                : displayRange(item) || '-'
            }}
          </span>

          <!-- hover 时显示操作 -->
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
        label-width="96px"
        size="small"
        class="edit-form mono-form"
        @keydown.esc="isEditing(item) && cancelEdit()"
      >
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="公司名称">
              <el-input
                v-if="isEditing(item)"
                v-model="form.companyName"
                placeholder="XXXX公司"
                clearable
                :disabled="submitting"
              />
              <el-input v-else :model-value="item.companyName" readonly disabled placeholder="—" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="公司岗位">
              <el-input
                v-if="isEditing(item)"
                v-model="form.position"
                placeholder="XXXX岗位"
                clearable
                :disabled="submitting"
              />
              <el-input v-else :model-value="item.position" readonly disabled placeholder="—" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="在职时间">
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

          <el-col :span="24">
            <el-form-item label="工作内容">
              <template v-if="isEditing(item)">
                <el-input
                  v-model="form.workContent"
                  type="textarea"
                  :rows="4"
                  placeholder="填写你的职责、业绩、技术栈、产出等"
                  :disabled="submitting"
                />
              </template>
              <template v-else>
                <el-input
                  :model-value="item.workContent || ''"
                  type="textarea"
                  :rows="4"
                  readonly
                  disabled
                  placeholder="—"
                />
              </template>
            </el-form-item>
          </el-col>
        </el-row>

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
import { reactive, ref, computed, onMounted, watch, getCurrentInstance } from 'vue';
import { ElMessage } from 'element-plus';
import { useRoute } from 'vue-router';
import Api from '@/api'; // 需包含 appManage.talentWorkRecord: getList/submit/remove
const { proxy } = getCurrentInstance();

// 路由参数（人才ID）
const route = useRoute();
const routeId = computed(() => route.params.id ?? route.query.id);

// 状态
const loading = ref(false);
const submitting = ref(false);
const list = ref([]); // 列表数据
const hoverId = ref(null);
const editingId = ref(null); // 当前编辑的记录 id
const isEditingAny = computed(() => editingId.value != null); // ✅ 有编辑中则视为“占用”

// 当前编辑表单
const form = reactive({
  companyName: '',
  position: '',
  rangeMonth: [], // ['YYYY-MM','YYYY-MM']
  workContent: '', // 工作内容（自由输入）
});

// 工具函数：时间/月格式
const isoToMonth = iso => (iso ? String(iso).slice(0, 7) : ''); // 2021-03-01T.. -> 2021-03
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
  return `${fmtMonthDisp(sm)}-${em ? fmtMonthDisp(em) : '至今'}`;
}
function displayRangeByMonth(monthRange) {
  if (!monthRange || !monthRange.length) return '';
  const [sm, em] = monthRange;
  return `${fmtMonthDisp(sm)}-${em ? fmtMonthDisp(em) : '至今'}`;
}
const isEditing = it => editingId.value === it.id;

// ✅ 新增：一次只允许一条（若正在编辑则禁用按钮）
function openCreate() {
  if (isEditingAny.value) return;

  // 临时草稿行（id 用特殊值）
  const draft = {
    id: '$new',
    talentUserId: routeId.value,
    companyName: '',
    position: '',
    startDate: '',
    endDate: '',
    workContent: '',
  };

  // 置顶插入
  list.value = [draft, ...list.value];

  // 进入编辑态并清空表单
  editingId.value = draft.id;
  Object.assign(form, {
    companyName: '',
    position: '',
    rangeMonth: [],
    workContent: '',
  });
}

// 加载列表
async function fetchList() {
  if (!routeId.value) {
    list.value = [];
    return;
  }
  loading.value = true;
  try {
    const res = await Api.appManage.talentWorkRecord.getList({
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

// 编辑/取消
function startEdit(it) {
  editingId.value = it.id;
  Object.assign(form, {
    companyName: it.companyName || '',
    position: it.position || '',
    rangeMonth: [isoToMonth(it.startDate), isoToMonth(it.endDate)].filter(Boolean),
    workContent: it.workContent || '',
  });
}
function cancelEdit() {
  // 如果是新增草稿行，取消时移除
  if (editingId.value === '$new') {
    const i = list.value.findIndex(x => x.id === '$new');
    if (i > -1) list.value.splice(i, 1);
  }
  editingId.value = null;
}

// 保存（新增/编辑共用）
async function saveEdit(target) {
  if (!form.companyName?.trim()) return ElMessage.warning('请填写公司名称');
  if (!form.rangeMonth?.length) return ElMessage.warning('请选择在职时间');

  const [mStart, mEnd] = form.rangeMonth;
  // 生成 period：YYYY.MM-YYYY.MM / YYYY.MM-至今
  const period = `${fmtMonthDisp(mStart)}-${mEnd ? fmtMonthDisp(mEnd) : '至今'}`;

  const payload = {
    id: target?.id && target.id !== '$new' ? target.id : undefined, // 有 id 更新；无/临时id 则新增
    talentUserId: routeId.value,
    companyName: form.companyName?.trim(),
    position: form.position?.trim(),
    workContent: form.workContent?.trim() || '',
    startDate: monthStartISO(mStart),
    endDate: monthEndISO(mEnd),
    period, // 提交给后端
  };

  submitting.value = true;
  try {
    const res = await Api.appManage.talentWorkRecord.submit(payload);
    const { code, data } = res?.data || {};
    if (code === 200) {
      const saved = data || payload;
      const idx = list.value.findIndex(x => x.id === target?.id);
      if (idx > -1) {
        // 覆盖（包含把 $new 替换为后端返回的真实 id）
        list.value[idx] = { ...list.value[idx], ...saved };
      } else {
        list.value.unshift(saved);
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

// 删除
async function removeItem(it) {
  // 删除临时新增行
  if (it?.id === '$new') {
    const i = list.value.findIndex(x => x.id === '$new');
    if (i > -1) list.value.splice(i, 1);
    if (editingId.value === '$new') editingId.value = null;
    return;
  }

  if (!it?.id) return;
  proxy
    .$confirm(`确认是否删除该数据项？`)
    .then(async () => {
      return await Api.appManage.talentWorkRecord.remove({ ids: it.id });
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
  background: #fff;
  border: 1px solid #e6e6e9;
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 16px;
}

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
