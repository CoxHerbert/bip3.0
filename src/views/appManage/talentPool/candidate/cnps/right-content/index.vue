<!-- src/views/recruit/follow/FollowLogs.vue -->
<template>
  <div class="follow-logs">
    <!-- 头部：标题 + 新增按钮（任意行在编辑时隐藏/禁用） -->
    <div class="header">
      <div class="title">
        <span class="bar"></span>
        <span>跟进记录</span>
      </div>
      <el-button
        v-if="allowCreate"
        type="warning"
        size="small"
        :disabled="isEditingAny || pageLoading"
        @click="openCreate"
      >
        添加跟进记录
      </el-button>
    </div>

    <!-- 内容区域：加载时覆盖 loading；首屏无数据时显示骨架屏 -->
    <div
      class="content"
      v-loading="pageLoading"
      element-loading-text="加载中..."
      element-loading-background="rgba(255, 255, 255, 0.6)"
    >
      <!-- 骨架屏：仅在加载且当前没有任何记录时展示，避免列表闪烁 -->
      <template v-if="pageLoading && !records.length">
        <div class="record-block" v-for="n in 3" :key="'skeleton-' + n">
          <div class="state-row">
            <el-skeleton-item variant="text" style="width: 120px; height: 18px" />
            <el-skeleton-item variant="text" style="width: 80px; height: 18px" />
          </div>
          <div class="record-card">
            <div class="topline" style="min-height: 20px; margin-bottom: 8px">
              <el-skeleton-item variant="text" style="width: 100px; height: 20px" />
            </div>
            <div class="dl">
              <el-skeleton animated :rows="5" />
            </div>
          </div>
        </div>
      </template>

      <!-- 实际列表 -->
      <template v-else>
        <div
          v-for="(rec, idx) in records"
          :key="rec?.id ?? rec?.$uid ?? `row-${idx}`"
          class="record-block"
        >
          <!-- 左：进度（状态） 右：日期 -->
          <div class="state-row">
            <dc-dict-key :options="OPS.evalStatus" :value="rec.followConclusion" />
            <div class="date">{{ dayOf(rec) }}</div>
          </div>

          <!-- 卡片 -->
          <div class="record-card" @mouseenter="hoverId = rec.id" @mouseleave="hoverId = null">
            <!-- 顶部操作：当“别的行”在编辑或页面加载时，禁用当前行进入编辑/删除 -->
            <div class="topline" v-if="!rec.$editing">
              <dc-dict-key :options="OPS.followType" :value="String(rec.followType ?? '')" />
              <div class="actions" v-show="hoverId === rec.id">
                <el-link
                  type="primary"
                  :underline="false"
                  :disabled="isEditingAny || pageLoading"
                  @click="startEdit(rec)"
                  >编辑</el-link
                >
                <el-divider direction="vertical" />
                <el-link
                  type="danger"
                  :underline="false"
                  :disabled="isEditingAny || pageLoading"
                  @click="remove(rec)"
                  >删除</el-link
                >
              </div>
            </div>

            <!-- 浏览态 -->
            <template v-if="!rec.$editing">
              <div class="dl">
                <div class="row">
                  <div class="label">跟进岗位</div>
                  <div class="value">
                    <template v-if="rec.followPostId">
                      <dc-view objectName="post" v-model="rec.followPostId" />
                    </template>
                    <template v-else>{{ rec.followPostName || '-' }}</template>
                  </div>
                </div>

                <div class="row">
                  <div class="label">跟进人</div>
                  <div class="value">
                    <dc-view v-if="rec.followUserId" objectName="user" v-model="rec.followUserId" />
                    <template v-else>-</template>
                  </div>
                </div>

                <div class="row">
                  <div class="label">跟进时间</div>
                  <div class="value">{{ fmtDateTime(rec.followDate) }}</div>
                </div>

                <div class="row">
                  <div class="label">跟进描述</div>
                  <div class="value">
                    <pre class="prewrap">{{ rec.followNote || '-' }}</pre>
                  </div>
                </div>
                <div class="row" v-if="rec.fileLink || rec.fileName">
                  <div class="label">文件</div>
                  <div class="value files">
                    <button
                      v-if="rec.fileLink"
                      class="file-chip"
                      :data-type="extOf(rec)"
                      :title="rec.fileName || rec.fileLink"
                      type="button"
                      @click="openFile(rec)"
                    >
                      <span class="badge">{{ badgeText(extOf(rec)) }}</span>
                    </button>
                    <span v-if="rec.fileName" class="file-name">{{ rec.fileName }}</span>
                  </div>
                </div>
                <div class="row" v-if="rec.followProgress">
                  <div class="label">进程</div>
                  <div class="value">{{ rec.followProgress }}</div>
                </div>
              </div>
            </template>

            <!-- 编辑/新增态（只允许存在一条） -->
            <template v-else>
              <el-form
                :model="rec.$draft"
                :rules="rules"
                label-width="80px"
                class="dl"
                :ref="el => setRowFormRef(rec, el)"
              >
                <el-form-item label="跟进方式" prop="followType">
                  <el-select v-model="rec.$draft.followType" placeholder="选择方式">
                    <el-option
                      v-for="it in OPS.followType"
                      :key="String(it.value)"
                      :label="it.label"
                      :value="it.dictKey ?? it.value"
                    />
                  </el-select>
                </el-form-item>

                <el-form-item prop="followPostId" label="跟进岗位">
                  <el-select
                    v-model="rec.$draft.followPostId"
                    placeholder="请选择跟进岗位"
                    @change="v => onDraftChange(rec, 'followPostId', v)"
                  >
                    <el-option
                      v-for="post in followPostList"
                      :key="post.id"
                      :label="post.postName"
                      :value="post.id"
                    />
                  </el-select>
                </el-form-item>

                <el-form-item prop="followUserId" label="跟进人">
                  <dc-select-user v-model="rec.$draft.followUserId" placeholder="请选择跟进人" />
                </el-form-item>

                <el-form-item prop="followDate" label="跟进时间">
                  <el-date-picker
                    v-model="rec.$draft.followDate"
                    type="date"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    placeholder="选择日期时间"
                    @change="val => onDateChange('followDate', rec, val)"
                  />
                </el-form-item>

                <el-form-item prop="followNote" label="跟进描述">
                  <el-input v-model="rec.$draft.followNote" type="textarea" :rows="5" />
                </el-form-item>

                <el-form-item prop="file" label="文件">
                  <dc-upload-v2
                    v-model="rec.$draft.file"
                    :multiple="false"
                    accept=".pdf,.doc,.docx"
                    :limit="1"
                    targetType="upload/selfResume/follow"
                    @change="v => onDraftChange(rec, 'file', v)"
                  />
                  <span v-if="rec.$draft.fileName" class="file-name">
                    {{ rec.$draft.fileName }}
                  </span>
                </el-form-item>

                <el-form-item prop="followConclusion" label="跟进结论">
                  <el-radio-group v-model="rec.$draft.followConclusion">
                    <el-radio
                      v-for="it in OPS.evalStatus.filter(
                        it => it.dictKey !== 'DC_EVALUATION_STATUS_PGZ'
                      )"
                      :key="String(it.value ?? it.dictKey)"
                      :label="it.dictKey ?? it.value"
                    >
                      {{ it.label }}
                    </el-radio>
                  </el-radio-group>
                </el-form-item>

                <el-form-item prop="followProgress" label="进程">
                  <el-input v-model="rec.$draft.followProgress" placeholder="请输入进程" />
                </el-form-item>

                <div class="row">
                  <div class="label"></div>
                  <div class="value">
                    <el-button
                      type="primary"
                      size="small"
                      :loading="submitLoading"
                      @click="confirmEdit(rec)"
                      >保存</el-button
                    >
                    <el-button size="small" :disabled="submitLoading" @click="cancelEdit(rec)"
                      >取消</el-button
                    >
                  </div>
                </div>
              </el-form>
            </template>
          </div>
        </div>

        <!-- 空状态：非加载且无数据 -->
        <div v-if="!pageLoading && !records.length" class="null-data">暂无数据</div>
      </template>
    </div>
  </div>
</template>

<script setup>
import {
  reactive,
  ref,
  onMounted,
  defineEmits,
  computed,
  watchEffect,
  getCurrentInstance,
} from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import Api from '@/api';
import { useRoute } from 'vue-router';
import { downloadFileBlob } from '@/utils/util';
import dayjs from 'dayjs';

const route = useRoute();
const routeId = computed(() => route.params.id ?? route.query.id);
const { proxy } = getCurrentInstance();
const emit = defineEmits(['update']);

const userInfoAll = computed(() => proxy.$store.getters.userInfoAll);

/** ===== Props ===== */
const props = defineProps({
  talentUserId: { type: [String, Number], required: true },
  talentPostPath: { type: [Array, String], default: '' },
  allowCreate: { type: Boolean, default: true },
});
const allowCreate = computed(() => props.allowCreate);

/** ===== 状态 ===== */
const hoverId = ref(null);
const dictRefs = ref({}); // 这里可能是“对象”或“ref(object)”，下面用 dicts 统一
const dicts = computed(() =>
  dictRefs.value && dictRefs.value.value ? dictRefs.value.value : dictRefs.value || {}
);
const postList = ref([]);
const records = reactive([]);

/** 加载状态 */
const dictLoading = ref(false);
const listLoading = ref(false);
const submitLoading = ref(false);
const pageLoading = computed(() => dictLoading.value || listLoading.value);

/** 只允许存在一条“处于编辑/新增态”的记录 */
const isEditingAny = computed(() => records.some(r => r.$editing));

/** 字典（不改方法，直接拿原始结构） */
const OPS = reactive({
  followType: [],
  evalStatus: [],
});
watchEffect(() => {
  const d = dicts.value || {};
  OPS.followType = Array.isArray(d.DC_FOLLOW_TYPE) ? d.DC_FOLLOW_TYPE : [];
  OPS.evalStatus = Array.isArray(d.DC_EVALUATION_STATUS) ? d.DC_EVALUATION_STATUS : [];
});

/** ===== 初始化：字典与数据 ===== */
onMounted(async () => {
  try {
    dictLoading.value = true;
    dictRefs.value = await proxy.useAsyncCache?.([
      { key: 'DC_GENDER' },
      { key: 'DC_FOLLOW_TYPE' },
      { key: 'DC_EVALUATION_STATUS' },
    ]);
  } catch {
    dictRefs.value = {};
  } finally {
    dictLoading.value = false;
  }
  await getTalentPosition();
  await fetchList();
});

async function getTalentPosition() {
  try {
    const res = await Api.appManage?.talentPosition?.getList({
      talentUserId: routeId.value,
      current: 1,
      size: 9999,
    });
    const { code, data } = res?.data || {};
    postList.value = code === 200 ? data?.records || [] : [];
  } catch {
    postList.value = [];
  }
}

const postIdSet = computed(() => {
  const v = props.talentPostPath;
  if (!v) return new Set();
  if (Array.isArray(v)) return new Set(v.map(x => String(x)));
  if (typeof v === 'string') {
    return new Set(
      v
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .map(String)
    );
  }
  return new Set();
});

const followPostList = computed(() => {
  const list = Array.isArray(postList.value) ? postList.value : [];
  const ids = postIdSet.value;
  if (!ids.size) return list;
  return list.filter(p => ids.has(String(p.id)));
});

/** ===== 拉列表 ===== */
async function fetchList() {
  try {
    listLoading.value = true;
    const res = await Api.appManage?.talentFollowRecord?.getList({
      talentUserId: routeId.value,
      current: 1,
      size: 9999,
    });
    const { code, data } = res?.data || {};
    const arr = code === 200 ? data?.records || [] : [];
    records.splice(0, records.length, ...arr.map(x => ({ ...x, $editing: false })));
  } catch {
    records.splice(0, records.length);
  } finally {
    listLoading.value = false;
  }
}

/** ===== 工具 ===== */
function dayOf(rec) {
  const iso = rec?.createTime || rec?.followDate || '';
  if (!iso) return '-';
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}
function fmtDateTime(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${dd} ${hh}:${mm}`;
}

function extOf(rec) {
  const name = rec?.fileName || rec?.fileLink || '';
  const m = name.match(/\.([a-z0-9]+)$/i);
  return m ? m[1].toLowerCase() : '';
}
function badgeText(ext) {
  if (ext === 'pdf') return 'P';
  if (ext === 'doc' || ext === 'docx') return 'W';
  if (ext === 'xls' || ext === 'xlsx') return 'X';
  if (ext === 'zip' || ext === 'rar') return 'Z';
  return 'F';
}

function openFile(rec) {
  downloadFileBlob(rec?.fileLink, rec.fileName);
}

/** ===== 原位编辑（每行独立 formRef）===== */
const rowFormRefs = new WeakMap();
function setRowFormRef(rec, el) {
  if (rec && el) rowFormRefs.set(rec, el);
}

/** 进入编辑：若已存在其他编辑/新增中的行，或页面在加载，则阻止 */
function startEdit(rec) {
  if (pageLoading.value) {
    ElMessage.warning('数据加载中，请稍后再试');
    return;
  }
  if (!rec.$editing && isEditingAny.value) {
    ElMessage.warning('请先保存或取消当前编辑的记录');
    return;
  }
  rec.$editing = true;
  rec.$draft = {
    id: rec.id ?? null,
    followType: rec.followType || '',
    followPostName: rec.followPostName || '',
    followPostId: rec.followPostId || '',
    followUserId: rec.followUserId || '',
    followDate: rec.followDate || '',
    followNote: rec.followNote || '',
    fileId: rec.fileId || '',
    fileLink: rec.fileLink || '',
    fileName: rec.fileName || '',
    followConclusion: rec.followConclusion || '',
    followProgress: rec.followProgress || '',
    file: undefined,
  };
}

function cancelEdit(rec) {
  if (rec.$isNew) {
    const idx = records.indexOf(rec);
    if (idx > -1) records.splice(idx, 1);
  } else {
    rec.$editing = false;
    rec.$draft = undefined;
  }
}

/** 与子组件交互：同步岗位/文件回填 */
function onDraftChange(rec, prop, val) {
  if (prop === 'file') {
    const f = Array.isArray(val) ? val[0] : val;
    rec.$draft.fileId = f?.attachId || '';
    rec.$draft.fileLink = f?.link || '';
    rec.$draft.fileName = f?.originalName || '';
  } else if (prop === 'followPostId') {
    rec.$draft.followPostName =
      followPostList.value.find(p => String(p.id) === String(val))?.postName || '';
  }
}

/** 保存 */
function confirmEdit(rec) {
  const formEl = rowFormRefs.get(rec);
  if (formEl?.validate) {
    formEl.validate(valid => {
      if (!valid) return;
      doSubmit(rec);
    });
  } else {
    doSubmit(rec);
  }
}

async function doSubmit(rec) {
  const form = {
    ...rec.$draft,
    talentUserId: routeId.value,
  };
  try {
    submitLoading.value = true;
    const res = await Api.appManage.talentFollowRecord.submit(form);
    const { code, msg } = res?.data || {};
    if (code === 200) {
      emit('update');
      ElMessage.success('已保存');
      await fetchList(); // 强制刷新，保持一致
    } else {
      ElMessage.error(msg || '保存失败');
    }
  } catch {
    ElMessage.error('保存失败');
  } finally {
    submitLoading.value = false;
  }
}

/** 新增：若存在其他编辑/新增中的行，或页面加载中，则阻止 */
function openCreate() {
  if (pageLoading.value) {
    ElMessage.warning('数据加载中，请稍后再试');
    return;
  }
  if (isEditingAny.value) {
    ElMessage.warning('请先保存或取消当前编辑的记录');
    return;
  }

  const draft = {
    $uid: `tmp-${Date.now()}`,
    $isNew: true,
    $editing: true,
    $draft: {
      id: null,
      followType: '',
      followPostName: '',
      followPostId: '',
      followUserId: userInfoAll.value.id,
      followDate: '',
      followNote: '',
      fileId: '',
      fileLink: '',
      fileName: '',
      followConclusion: '',
      followProgress: '',
      file: undefined,
    },
    createTime: new Date().toISOString(),
    followProgress: '',
  };
  records.unshift(draft);
}

/** 删除：按你的签名调用，并在成功后强制刷新 */
async function remove(rec) {
  try {
    if (pageLoading.value) {
      ElMessage.warning('数据加载中，请稍后再试');
      return;
    }
    if (isEditingAny.value) {
      ElMessage.warning('请先保存或取消当前编辑的记录再删除');
      return;
    }
    await ElMessageBox.confirm('确定删除该记录吗？', '提示', { type: 'warning' });
    // 未落库的新增草稿，直接本地删除
    if (rec.$isNew && !rec.id) {
      const i = records.indexOf(rec);
      if (i > -1) records.splice(i, 1);
      ElMessage.success('已删除');
      return;
    }
    listLoading.value = true; // 删除后会刷新列表，这里顺便给个 loading
    const res = await Api.appManage.talentFollowRecord.remove({ ids: rec.id });
    const { code, msg } = res?.data || {};
    if (code === 200) {
      ElMessage.success('已删除');
      await fetchList();
    } else {
      ElMessage.error(msg || '删除失败');
    }
  } catch {
    // 用户取消
  } finally {
    listLoading.value = false;
  }
}

/** 校验规则 */
const rules = {
  followType: [{ required: true, message: '请选择跟进方式', trigger: 'change' }],
  followPostId: [{ required: true, message: '请填写跟进岗位', trigger: 'change' }],
  followUserId: [{ required: true, message: '请填写跟进人ID', trigger: 'change' }],
  followDate: [{ required: true, message: '请选择日期', trigger: 'change' }],
  followNote: [{ max: 1000, message: '最多1000字', trigger: 'blur' }],
};

function onDateChange(prop, row, val) {
  if (val) {
    const dateOnly = dayjs(val).format('YYYY-MM-DD');
    const nowTime = dayjs().format('HH:mm:ss');
    row.$draft.followDate = `${dateOnly} ${nowTime}`;
  }
}
</script>

<style scoped lang="scss">
.follow-logs {
  --muted: #999;
  --label: #666;
  --ok: #18a058;
  --warn: #f59e0b;
  --danger: #ef4444;
  --card-border: #e6e6e9;

  max-width: 520px;
  padding: 12px;
  height: 100%;
  display: flex;
  flex-direction: column;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    .title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      .bar {
        width: 4px;
        height: 14px;
        border-radius: 2px;
        background: #ff8a00;
      }
    }
  }
  .content {
    flex: 1;
    overflow: auto;

    .null-data {
      width: 100%;
      height: 100%;
      min-height: 120px;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #999;
    }
  }

  .record-block {
    margin-bottom: 12px;
  }

  .state-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 2px 4px 6px 2px;
    .dict {
      font-size: 18px;
      color: #ff8a00;
      font-weight: 600;
    }
    .date {
      color: #2c2c2c;
      font-weight: 700;
      letter-spacing: 1px;
    }
  }

  .record-card {
    border: 1px solid var(--card-border);
    border-radius: 8px;
    background: #fff;
    padding: 10px 12px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);

    .topline {
      position: relative;
      min-height: 20px;
      margin-bottom: 8px;
      :deep(.dict) {
        padding: 6px 10px;
        font-size: 16px;
        color: #ff8a00;
        border-radius: 8px;
        border: 1px solid #ff8a00;
      }
      .actions {
        position: absolute;
        top: 0;
        right: 0;
        opacity: 0;
        transition: opacity 0.2s ease;
        :deep(.el-link) {
          font-size: 13px;
        }
      }
    }
    &:hover .actions {
      opacity: 1;
    }

    .dl {
      background: #f7f7f8;
      border-radius: 8px;
      padding: 10px 12px;

      .row {
        display: grid;
        grid-template-columns: 70px 1fr;
        column-gap: 10px;
        line-height: 22px;
        font-size: 13px;
        + .row {
          margin-top: 6px;
        }
        .label {
          color: var(--label);
        }
        .value {
          color: #333;
        }
        .prewrap {
          white-space: pre-wrap;
          word-break: break-word;
        }
      }

      .files {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        .file-chip {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 20px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          padding: 0;
          line-height: 1;
          .badge {
            font-size: 12px;
            font-weight: 700;
            color: #fff;
          }
          &[data-type='pdf'] {
            background: #e45454;
          }
          &[data-type='doc'],
          &[data-type='docx'] {
            background: #2f6fde;
          }
          &[data-type='xls'],
          &[data-type='xlsx'] {
            background: #2faa5a;
          }
          &[data-type='zip'],
          &[data-type='rar'] {
            background: #666;
          }
          &:not([data-type]) {
            background: #999;
          }
        }
        .file-name {
          color: #333;
        }
      }
    }
  }
}
</style>
