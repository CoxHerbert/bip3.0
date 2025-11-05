<!-- src/views/recruit/campus/apply-detail.vue -->
<template>
  <div class="apply-detail-page" v-loading="loadingDetail">
    <!-- 顶部摘要 -->
    <div class="summary">
      <div class="title-row">
        <div class="name">
          {{ detail?.name || '-' }}
          <dc-dict-key
            class="interview-state"
            :options="dictMap?.DC_EVALUATION_STATUS"
            :value="detail.interviewStatus"
          />
        </div>
        <div class="grow"></div>
        <el-text type="info">跟进岗位</el-text>
        <el-text class="ml-4">
          <template v-if="detail.postId">
            <!-- dc-view 未注册时也不要报错 -->
            <dc-view objectName="post" v-model="detail.postId" />
          </template>
          <template v-else>{{ detail.post || '-' }}</template>
        </el-text>
      </div>

      <div class="row">
        <span class="label">投递岗位</span>
        <span class="text">
          <dc-view objectName="post" v-model="detail.joinPostIds" />
        </span>
      </div>

      <div class="row">
        <span class="label">应聘渠道</span>
        <span class="text">
          <dc-dict-key :options="dictMap.DC_APPLY_CHANNEL" :value="detail.applyChannel" />
        </span>
      </div>

      <div class="row">
        <span class="label">短信状态</span>
        <dc-dict-key :options="dictMap.DC_SMS_STATUS" :value="detail.smsStatus" />
      </div>
    </div>

    <!-- 基础信息 -->
    <div class="card info-card" @mouseenter="hovering = true" @mouseleave="hovering = false">
      <div class="section-title">
        <span class="bar"></span>
        <span>基础信息</span>
        <el-button class="edit-btn" size="small" @click="toggleEdit" :class="{ show: hovering }">
          {{ editing ? '收起' : '编辑' }}
        </el-button>
      </div>

      <transition name="fade">
        <div class="edit-panel" v-if="editing">
          <el-form :model="editForm" label-width="40px" size="small">
            <el-form-item label="性别">
              <el-radio-group v-model="editForm.sex">
                <el-radio
                  :label="dict.label"
                  :value="dict.dictKey"
                  v-for="(dict, i) in dictMap.DC_GENDER"
                  :key="i"
                ></el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="籍贯">
              <el-input v-model="editForm.nativePlace" placeholder="请输入籍贯" />
            </el-form-item>

            <el-form-item label="电话">
              <el-input v-model="editForm.phone" placeholder="请输入手机号" />
            </el-form-item>

            <el-form-item label="邮箱">
              <el-input v-model="editForm.email" placeholder="请输入邮箱" />
            </el-form-item>

            <el-form-item label="优势">
              <el-input v-model="editForm.advantage" type="textarea" :rows="4" />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" size="small" :loading="saving" @click="saveEdit">
                保存
              </el-button>
              <el-button size="small" @click="editing = false">取消</el-button>
            </el-form-item>
          </el-form>
          <el-divider />
        </div>
      </transition>

      <div class="info-list">
        <div class="info-row">
          <span class="label">性别</span>
          <span class="value">
            <dc-dict-key :options="dictMap.DC_GENDER" :value="detail.sex" />
          </span>
        </div>
        <div class="info-row">
          <span class="label">籍贯</span>
          <span class="value">{{ detail.nativePlace || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="label">电话</span>
          <span class="value">{{ detail.phone || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="label">邮箱</span>
          <span class="value">{{ detail.email || '-' }}</span>
        </div>

        <div class="info-row">
          <span class="label">优势</span>
          <div class="value">{{ detail.advantage || '-' }}</div>
        </div>

        <div class="info-row">
          <span class="label">附件</span>
          <div class="value attach">
            <el-button
              v-if="detail.resumeUrl"
              size="small"
              type="danger"
              plain
              @click="onOpenAttach"
            >
              <el-icon><Document /></el-icon>
              简历
            </el-button>
            <span v-else class="muted">-</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 系统信息 -->
    <div class="card">
      <div class="section-title">
        <span class="bar"></span>
        <span>系统信息</span>
      </div>
      <div class="info-list">
        <div class="info-row">
          <span class="label">创建方式</span>
          <span class="value">
            <dc-dict-key :options="dictMap.DC_PARING_TYPE" :value="detail.parseType" />
          </span>
        </div>
        <div class="info-row">
          <span class="label">创建时间</span>
          <span class="value">{{ fmtDateTime(detail.createTime) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, watch, getCurrentInstance } from 'vue';
import { useRoute } from 'vue-router';
import { Document } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import Api from '@/api';
import { downloadFileBlob } from '@/utils/util';

/** 路由 id（params 优先，fallback query） */
const route = useRoute();
const routeId = computed(() => route.params.id ?? route.query.id);

/** 字典统一存到 dictMap（ref）里，避免 .value 判空白屏 */
const dictMap = ref({
  DC_SMS_STATUS: [],
  DC_PARING_TYPE: [],
  DC_GENDER: [],
  DC_EVALUATION_STATUS: [],
  DC_APPLY_CHANNEL: [],
});

const { proxy } = getCurrentInstance();

async function loadDicts() {
  try {
    // 兼容：useAsyncCache 存在时优先；否则尝试你们的 dict 客户端 / 插件
    if (typeof proxy?.useAsyncCache === 'function') {
      const result = await proxy.useAsyncCache([
        { key: 'DC_SMS_STATUS' },
        { key: 'DC_PARING_TYPE' },
        { key: 'DC_GENDER' },
        { key: 'DC_EVALUATION_STATUS' },
        { key: 'DC_APPLY_CHANNEL' },
      ]);
      // result 可能是普通对象，也可能是 {value: {...}}
      const data = result?.value ?? result ?? {};
      dictMap.value = {
        DC_SMS_STATUS: data.DC_SMS_STATUS ?? [],
        DC_PARING_TYPE: data.DC_PARING_TYPE ?? [],
        DC_GENDER: data.DC_GENDER ?? [],
        DC_EVALUATION_STATUS: data.DC_EVALUATION_STATUS ?? [],
        DC_APPLY_CHANNEL: data.DC_APPLY_CHANNEL ?? [],
      };
    }
  } catch (err) {
    console.warn('加载字典失败，使用空列表：', err);
  }
}

/** UI 状态 */
const hovering = ref(false);
const editing = ref(false);
const loadingDetail = ref(false);
const saving = ref(false);

/** 详情模型 */
const detail = reactive({
  id: null,
  createUser: null,
  createDept: null,
  createTime: '',
  updateUser: null,
  updateTime: '',
  isDeleted: 0,
  status: 1,
  tenantId: '',

  name: '',
  phone: '',
  post: '',
  postId: '',

  interviewStatus: '',
  smsStatus: '',
  smsRemark: '',
  parseType: '',

  lastFollowDate: '',
  followType: '',
  followUserId: '',

  nativePlace: '',
  email: '',
  advantage: '',
  sex: '',

  joinPosts: '',
  joinPostIds: '',

  resumeUrl: '',
});

/** 编辑表单 */
const editForm = reactive({
  sex: '',
  nativePlace: '',
  phone: '',
  email: '',
  advantage: '',
});
function fillEditFormFromDetail() {
  editForm.sex = detail.sex || '';
  editForm.nativePlace = detail.nativePlace || '';
  editForm.phone = detail.phone || '';
  editForm.email = detail.email || '';
  editForm.advantage = detail.advantage || '';
}
function toggleEdit() {
  if (!editing.value) fillEditFormFromDetail();
  editing.value = !editing.value;
}

function pad(n) {
  return String(n).padStart(2, '0');
}
function fmtDateTime(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '-';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

/** 附件/短信 */
function onOpenAttach() {
  downloadFileBlob(detail?.resumeUrl, detail?.resumeUrl);
}

/** API */
function pickDetail(res) {
  return res?.data?.data || res?.data || res?.record || res?.detail || res || {};
}
async function fetchDetail() {
  if (!routeId.value) return;
  loadingDetail.value = true;
  try {
    const res = await Api.appManage.talentUser.getDetail({ id: routeId.value });
    const data = pickDetail(res);
    Object.assign(detail, data || {}, { id: data?.id ?? routeId.value });
    fillEditFormFromDetail();
  } catch (e) {
    console.error(e);
    ElMessage.error('获取详情失败');
  } finally {
    loadingDetail.value = false;
  }
}
async function saveEdit() {
  if (!detail.id && !routeId.value) return ElMessage.warning('缺少候选人ID');
  const payload = { ...detail, ...editForm, id: detail.id || routeId.value };
  saving.value = true;
  try {
    await Api.appManage.talentUser.submit(payload);
    Object.assign(detail, payload);
    editing.value = false;
    ElMessage.success('保存成功');
  } catch (e) {
    console.error(e);
    ElMessage.error('保存失败');
  } finally {
    saving.value = false;
  }
}

/** 生命周期 */
onMounted(async () => {
  await loadDicts();
  await fetchDetail();
});
watch(() => routeId.value, fetchDetail);
defineExpose({ fetchDetail });
</script>

<style scoped lang="scss">
.interview-state {
  color: #ff8a00;
  font-size: 16px;
  font-weight: 600;
  border: 1px solid #ff8a00;
}
.apply-detail-page {
  --radius: 8px;
  --muted: #999;
  --label: #666;
  max-width: 520px;
  margin: 0 auto;
  padding: 12px;
}
.summary {
  border: 1px solid #e5e7eb;
  border-radius: var(--radius);
  background: #fff;
  padding: 12px 12px 8px;
  margin-bottom: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  .title-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 18px;
    margin-bottom: 8px;
    .grow {
      flex: 1;
    }
    .ml-4 {
      margin-left: 4px;
    }
  }
  .row {
    display: flex;
    align-items: center;
    gap: 8px;
    line-height: 24px;
    font-size: 13px;
    margin-top: 2px;
    color: #333;
    .label {
      color: var(--label);
      width: 72px;
      flex: 0 0 72px;
    }
    .muted {
      color: var(--muted);
    }
  }
  .sms-help {
    font-size: 12px;
    color: var(--label);
  }
}
.card {
  border: 1px solid #e5e7eb;
  border-radius: var(--radius);
  background: #fff;
  padding: 10px 12px 12px;
  margin-bottom: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  margin-bottom: 8px;
  position: relative;
  .bar {
    width: 4px;
    height: 14px;
    border-radius: 2px;
    background: #ff8a00;
  }
}
.info-card:hover .edit-btn {
  opacity: 1;
}
.edit-btn {
  position: absolute;
  right: 0;
  top: -2px;
  opacity: 0;
  transition: opacity 0.2s;
}
.edit-panel {
  background: #fafafa;
  border: 1px dashed #e5e7eb;
  padding: 8px;
  border-radius: 6px;
  margin: 8px 0;
}
.info-list {
  display: grid;
  grid-template-columns: 1fr;
  row-gap: 6px;
}
.info-row {
  display: grid;
  grid-template-columns: 50px 1fr;
  align-items: start;
  column-gap: 8px;
  font-size: 13px;
  line-height: 22px;
  .label {
    color: var(--label);
    white-space: nowrap;
  }
  .value {
    color: #333;
    word-break: break-all;
  }
  .attach .el-button {
    padding: 4px 8px;
  }
}
.mr-6 {
  margin-right: 6px;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
