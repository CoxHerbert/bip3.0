<template>
  <el-dialog
    v-model="visible"
    width="960px"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    title="手工解析"
    @close="close"
  >
    <div class="steps-wrap" v-loading="loading">
      <el-steps :active="active" finish-status="success" align-center>
        <el-step title="基础信息" />
        <el-step title="教育履历" />
        <el-step title="工作履历" />
        <el-step title="项目履历" />
      </el-steps>

      <!-- Step 1: 基础信息（全部必填） -->
      <div v-show="active === 0" class="step-body">
        <el-form ref="baseFormRef" label-width="88px" :model="baseForm" :rules="baseRules">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="姓名" prop="name">
                <el-input v-model="baseForm.name" placeholder="请输入姓名" />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="性别" prop="sex">
                <el-select v-model="baseForm.sex" placeholder="请选择性别">
                  <el-option
                    v-for="di in dictRefs.DC_GENDER || []"
                    :key="di.dictKey"
                    :label="di.dictValue"
                    :value="di.dictKey"
                  />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="学校" prop="graduateSchool">
                <el-input v-model="baseForm.graduateSchool" placeholder="最高学历学校" />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="专业" prop="professionalName">
                <el-input v-model="baseForm.professionalName" placeholder="专业" />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="电话" prop="phone">
                <el-input v-model="baseForm.phone" placeholder="手机号" />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="意向岗位" prop="joinPostIds">
                <el-select
                  v-model="baseForm.joinPostIds"
                  placeholder="请选择意向岗位"
                  multiple
                  multiple-limit="3"
                >
                  <el-option
                    v-for="post in postList"
                    :key="post.id"
                    :label="post.postName"
                    :value="post.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="应聘渠道" prop="applyChannel">
                <el-radio-group v-model="baseForm.applyChannel">
                  <el-radio
                    v-for="ch in dictRefs.DC_APPLY_CHANNEL || []"
                    :key="ch.dictKey"
                    :label="ch.dictKey"
                    >{{ ch.dictValue }}</el-radio
                  >
                </el-radio-group>
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item
                label="推荐人"
                prop="referrerName"
                v-if="
                  ['DC_APPLY_CHANNEL_TSTJ', 'DC_APPLY_CHANNEL_TXXTJ'].includes(
                    baseForm.applyChannel
                  )
                "
              >
                <el-input v-model="baseForm.referrerName" placeholder="请输入推荐人" />
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="附件" prop="file">
                <dc-upload-v2
                  v-model="baseForm.file"
                  :multiple="false"
                  accept=".pdf,.doc,.docx"
                  :limit="1"
                  targetType="upload/resume"
                  @change="val => handleChange('file', val)"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <!-- Step 2: 教育履历 -->
      <div v-show="active === 1" class="step-body">
        <div class="toolbar">
          <el-button type="primary" size="small" @click="addEdu">添加教育履历</el-button>
        </div>
        <el-empty v-if="!eduList.length" description="暂无教育履历" />
        <el-card v-for="(it, idx) in eduList" :key="idx" class="mb-3" shadow="never">
          <template #header>
            <div class="card-hd">
              <b>教育履历 {{ idx + 1 }}</b>
              <el-button text type="danger" @click="removeEdu(idx)">删除</el-button>
            </div>
          </template>
          <el-form label-width="88px">
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="学校名称">
                  <el-input v-model="it.schoolName" placeholder="请输入学校名称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="专业">
                  <el-input v-model="it.professionalName" placeholder="XXXX专业" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="学历">
                  <el-input v-model="it.qualification" placeholder="请输入学历" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="就读时间">
                  <el-date-picker
                    v-model="it.rangeMonth"
                    type="monthrange"
                    start-placeholder="开始"
                    end-placeholder="结束"
                    value-format="YYYY-MM"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="经历">
                  <el-input
                    v-model="it.experienceNote"
                    placeholder="课程/竞赛/科研/奖项/社团等"
                    type="textarea"
                    :rows="3"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
      </div>

      <!-- Step 3: 工作履历 -->
      <div v-show="active === 2" class="step-body">
        <div class="toolbar">
          <el-button type="primary" size="small" @click="addWork">添加工作履历</el-button>
        </div>
        <el-empty v-if="!workList.length" description="暂无工作履历" />
        <el-card v-for="(it, idx) in workList" :key="idx" class="mb-3" shadow="never">
          <template #header>
            <div class="card-hd">
              <b>工作履历 {{ idx + 1 }}</b>
              <el-button text type="danger" @click="removeWork(idx)">删除</el-button>
            </div>
          </template>
          <el-form label-width="88px">
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="公司名称">
                  <el-input v-model="it.companyName" placeholder="XXXX公司" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="公司岗位">
                  <el-input v-model="it.position" placeholder="XXXX岗位" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="在职时间">
                  <el-date-picker
                    v-model="it.rangeMonth"
                    type="monthrange"
                    start-placeholder="开始"
                    end-placeholder="结束"
                    value-format="YYYY-MM"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="工作内容">
                  <el-input
                    type="textarea"
                    :rows="3"
                    v-model="it.workContent"
                    placeholder="填写你的职责、业绩、技术栈、产出等"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
      </div>

      <!-- Step 4: 项目履历 -->
      <div v-show="active === 3" class="step-body">
        <div class="toolbar">
          <el-button type="primary" size="small" @click="addProj">添加项目履历</el-button>
        </div>
        <el-empty v-if="!projList.length" description="暂无项目履历" />
        <el-card v-for="(it, idx) in projList" :key="idx" class="mb-3" shadow="never">
          <template #header>
            <div class="card-hd">
              <b>项目履历 {{ idx + 1 }}</b>
              <el-button text type="danger" @click="removeProj(idx)">删除</el-button>
            </div>
          </template>
          <el-form label-width="88px">
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="项目名称">
                  <el-input v-model="it.projectName" placeholder="XXXX项目名称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="项目角色">
                  <el-input v-model="it.projectRole" placeholder="XXXX岗位" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="项目时间">
                  <el-date-picker
                    v-model="it.rangeMonth"
                    type="monthrange"
                    start-placeholder="开始"
                    end-placeholder="结束"
                    value-format="YYYY-MM"
                  />
                </el-form-item> </el-col
              ><el-col :span="12">
                <el-form-item label="项目链接">
                  <el-input v-model="it.projectLink" placeholder="https:// 或域名" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="项目内容">
                  <el-input
                    type="textarea"
                    :rows="3"
                    v-model="it.projectNote"
                    placeholder="职责/业绩/技术栈/难点与解决等"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
      </div>
    </div>

    <template #footer>
      <div class="dlg-ft">
        <el-button @click="close">取 消</el-button>
        <el-button :disabled="active === 0" @click="handlePrev">上 一 步</el-button>
        <el-button type="primary" :disabled="nextDisabled" @click="handleNext">
          {{ active === 3 ? '完 成' : '下 一 步' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch, toRefs, getCurrentInstance, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import Api from '@/api';

/** props & emits */
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  request: { type: Object, required: true },
});
const emit = defineEmits(['update:modelValue', 'success']);

/** dict / posts */
const { proxy } = getCurrentInstance();
const pageData = reactive({
  dictRefs: {},
  postList: [],
});
const { dictRefs, postList } = toRefs(pageData);

onMounted(async () => {
  // 字典获取
  pageData.dictRefs = await proxy.useAsyncCache([
    { key: 'DC_GENDER' },
    { key: 'DC_APPLY_CHANNEL' },
  ]);
  getTalentPosition();
});

/** dialog show/hide */
const visible = ref(false);
watch(
  () => props.modelValue,
  v => (visible.value = v),
  { immediate: true }
);
const close = () => {
  resetAll();
  emit('update:modelValue', false);
};

/** steps */
const active = ref(0);
const loading = ref(false);
const talentUserId = ref(null);
const baseFormRef = ref();

/** 基础信息 - 全必填 */
const baseForm = reactive({
  name: '',
  sex: '',
  graduateSchool: '',
  professionalName: '',
  phone: '',
  joinPostIds: '',
  applyChannel: '',
  referrerName: '',
  file: [],
  resumeUrl: '',
  resumeId: '',
});

const phoneReg = /^1[3-9]\d{9}$/;
const baseRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  sex: [{ required: true, message: '请选择性别', trigger: 'change' }],
  graduateSchool: [{ required: true, message: '请输入学校', trigger: 'blur' }],
  professionalName: [{ required: true, message: '请输入专业', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    {
      validator: (_, v, cb) => (phoneReg.test(v) ? cb() : cb(new Error('手机号格式不正确'))),
      trigger: 'blur',
    },
  ],
  joinPostIds: [{ required: true, message: '请选择意向岗位', trigger: 'change' }],
  applyChannel: [{ required: true, message: '请选择应聘渠道', trigger: 'change' }],
  referrerName: [
    { required: true, message: '请输入推荐人', trigger: 'blur' },
    {
      validator: (_, v, cb) => {
        const need = ['DC_APPLY_CHANNEL_TSTJ', 'DC_APPLY_CHANNEL_TXXTJ'].includes(
          baseForm.applyChannel
        );
        if (!need) return cb();
        if (need && !v?.trim()) return cb(new Error('请输入推荐人'));
        cb();
      },
      trigger: 'blur',
    },
  ],
};

const nextDisabled = computed(() => loading.value);

/** 子表集合 */
const eduList = ref([]);
const addEdu = () =>
  eduList.value.push({
    schoolName: '',
    professionalName: '',
    qualification: '',
    rangeMonth: [],
  });
const removeEdu = idx => eduList.value.splice(idx, 1);

const workList = ref([]);
const addWork = () =>
  workList.value.push({
    companyName: '',
    position: '',
    rangeMonth: [],
    workContent: '',
  });
const removeWork = idx => workList.value.splice(idx, 1);

const projList = ref([]);
const addProj = () =>
  projList.value.push({
    projectName: '',
    projectRole: '',
    rangeMonth: [],
    projectNote: '',
    projectLink: '',
  });
const removeProj = idx => projList.value.splice(idx, 1);

/** 时间范围 -> 开止 */
const toPeriod = rangeMonth => {
  const [s, e] = rangeMonth || [];
  return {
    startDate: s ? `${s}-01` : null,
    endDate: e ? `${e}-01` : null,
  };
};

/** 下一步 */
const handleNext = async () => {
  try {
    loading.value = true;

    if (active.value === 0) {
      // ✅ 先校验
      await baseFormRef.value.validate();

      // 再提交主表
      if (!props.request?.submitBaseInfo) {
        throw new Error('缺少 submitBaseInfo 实现（请在 index.vue 通过 props 传入）');
      }
      const { id } = await props.request.submitBaseInfo({ ...baseForm });
      if (!id) throw new Error('基础信息提交未返回 id');
      talentUserId.value = id;
      active.value++;
      return;
    }

    if (active.value === 1) {
      if (props.request?.submitEduList && eduList.value.length) {
        const payload = eduList.value.map(it => ({
          ...it,
          ...toPeriod(it.rangeMonth),
          talentUserId: talentUserId.value,
        }));
        await props.request.submitEduList(talentUserId.value, payload);
      }
      active.value++;
      return;
    }

    if (active.value === 2) {
      if (props.request?.submitWorkList && workList.value.length) {
        const payload = workList.value.map(it => ({
          ...it,
          ...toPeriod(it.rangeMonth),
          talentUserId: talentUserId.value,
        }));
        await props.request.submitWorkList(talentUserId.value, payload);
      }
      active.value++;
      return;
    }

    if (active.value === 3) {
      if (props.request?.submitProjectList && projList.value.length) {
        const payload = projList.value.map(it => ({
          ...it,
          ...toPeriod(it.rangeMonth),
          talentUserId: talentUserId.value,
        }));
        await props.request.submitProjectList(talentUserId.value, payload);
      }
      ElMessage.success('提交成功');
      close();
      emit('success');
      resetAll();
      return;
    }
  } catch (err) {
    ElMessage.error(err?.message || '提交失败，请重试');
  } finally {
    loading.value = false;
  }
};

const handlePrev = () => {
  if (active.value > 0) active.value--;
};

const resetAll = () => {
  active.value = 0;
  Object.assign(baseForm, {
    name: '',
    sex: '',
    graduateSchool: '',
    professionalName: '',
    phone: '',
    joinPostIds: null,
    applyChannel: '',
    referrerName: '',
    file: null,
    resumeUrl: '',
    resumeId: '',
  });
  eduList.value = [];
  workList.value = [];
  projList.value = [];
  talentUserId.value = null;
};

/** 上传 change */
function handleChange(prop, val) {
  if (prop === 'file') {
    baseForm.file = val || null;
    baseForm.resumeUrl = val?.[0]?.name || '';
    baseForm.resumeId = val?.[0]?.attachId || '';
  }
}

/** 岗位列表 */
function getTalentPosition() {
  Api.appManage.talentPosition
    .getList({ current: 1, size: 9999 })
    .then(res => {
      const { code, data } = res.data || {};
      if (code === 200) pageData.postList = data?.records || [];
    })
    .catch(() => {});
}

watch(visible, v => {
  if (!v) resetAll();
});
</script>

<style scoped>
:deep(.el-row) {
  margin: 0 !important;
}
.steps-wrap {
  margin-top: 8px;
}
.step-body {
  margin-top: 16px;
}
.toolbar {
  margin-bottom: 8px;
  display: flex;
  justify-content: flex-end;
}
.mb-3 {
  margin-bottom: 12px;
}
.card-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.dlg-ft {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
