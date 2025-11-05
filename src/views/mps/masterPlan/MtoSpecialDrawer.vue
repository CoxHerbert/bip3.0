<!-- src/components/MtoSpecialDrawer.vue -->
<template>
  <el-drawer
    v-model="visible"
    :with-header="false"
    :append-to-body="true"
    :close-on-click-modal="false"
    :destroy-on-close="false"
    :size="width"
    class="mto-special-drawer"
  >
    <!-- 头部 -->
    <div class="md-header">
      <div class="left">
        <span class="bar" />
        <span class="title">{{ title }}</span>
      </div>
    </div>

    <!-- 表单主体 -->
    <div class="md-body">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <!-- 父传：只读 -->
        <el-form-item label="专案号：" prop="mtoNo" required>
          <el-input v-model="form.mtoNo" disabled placeholder="系统自动带入" />
        </el-form-item>

        <el-form-item label="物料名称：" prop="materialName" required>
          <el-input v-model="form.materialName" disabled placeholder="系统自动带入" />
        </el-form-item>

        <el-form-item label="物料编码：" prop="materialNumber" required>
          <el-input v-model="form.materialNumber" disabled placeholder="系统自动带入" />
        </el-form-item>

        <!-- 必填：Switch（0/1），默认0=否 -->
        <el-form-item label="关键SOP：" prop="needKeySop" required>
          <el-switch
            v-model="form.needKeySop"
            :active-value="true"
            :inactive-value="false"
            inline-prompt
            active-text="是"
            inactive-text="否"
          />
        </el-form-item>

        <el-form-item label="电气原理图：" prop="needEsd" required>
          <el-switch
            v-model="form.needEsd"
            :active-value="true"
            :inactive-value="false"
            inline-prompt
            active-text="是"
            inactive-text="否"
          />
        </el-form-item>

        <el-form-item label="无尘包线：" prop="needCrw" required>
          <el-switch
            v-model="form.needCrw"
            :active-value="true"
            :inactive-value="false"
            inline-prompt
            active-text="是"
            inactive-text="否"
          />
        </el-form-item>

        <el-form-item label="防静电气管：" prop="needEsdPipe" required>
          <el-switch
            v-model="form.needEsdPipe"
            :active-value="true"
            :inactive-value="false"
            inline-prompt
            active-text="是"
            inactive-text="否"
          />
        </el-form-item>

        <!-- 非必填 -->
        <el-form-item label="其他特殊要求：" prop="otherSpecialRequire">
          <el-input
            v-model="form.otherSpecialRequire"
            type="textarea"
            :rows="4"
            placeholder="请输入其他特殊要求"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <!-- 底部按钮 -->
      <div class="dialog-footer">
        <el-button @click="close">取消</el-button>
        <el-button type="primary" :loading="saving" @click="onSubmit">保存</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { reactive, ref, toRaw } from 'vue';
import Api from '@/api';

const props = defineProps({
  title: { type: String, default: '特殊需求' },
  width: { type: [Number, String], default: 620 },
  // 父级传入的三项
  baseInfo: {
    type: Object,
    default: () => ({ mtoNo: '', materialName: '', materialNumber: '' }),
  },
});
const emit = defineEmits(['success', 'open', 'close']);

const visible = ref(false);
const saving = ref(false);
const formRef = ref(null);

const blank = () => ({
  moId: '', // 父传
  mtoNo: '', // 父传
  materialName: '', // 父传
  materialNumber: '', // 父传
  // 必填：Switch 默认否(false)
  needKeySop: false,
  needEsd: false,
  needCrw: false,
  needEsdPipe: false,
  // 非必填
  otherSpecialRequire: '',
});
const form = reactive(blank());

// 校验：false/true 必填（type:Boolean 能接受 false）
const mustNum = msg => ({ type: 'Boolean', required: true, message: msg, trigger: 'change' });
const rules = {
  mtoNo: [{ required: true, message: '缺少专案号（父级传入）', trigger: 'change' }],
  materialName: [{ required: true, message: '缺少物料名称（父级传入）', trigger: 'change' }],
  materialNumber: [{ required: true, message: '缺少物料编码（父级传入）', trigger: 'change' }],
  needKeySop: [mustNum('请选择关键SOP')],
  needEsd: [mustNum('请选择电气原理图')],
  needCrw: [mustNum('请选择无尘包线')],
  needEsdPipe: [mustNum('请选择防静电气管')],
  otherSpecialRequire: [{ max: 1000, message: '不超过1000字', trigger: 'blur' }],
};

/** 对外方法 */
function applyBase(base) {
  form.moId = base?.id ?? '';
  form.mtoNo = base?.projectCaseMo ?? '';
  form.materialName = base?.materialName ?? '';
  form.materialNumber = base?.materialCode ?? '';
}
async function open(base) {
  Object.assign(form, blank());
  try {
    const res = await Api.mps.SpecialRequire.detail({
      moId: base.id,
    });
    const { data } = res.data;
    if (data) {
      Object.keys(form).forEach(key => {
        if (data.hasOwnProperty(key)) {
          form[key] = data[key];
        }
      });
      // form.id = null;
      console.log(form);
    } else {
      applyBase(base ?? props.baseInfo);
    }
  } finally {
  }
  visible.value = true;
  emit('open');
}
function close() {
  visible.value = false;
  emit('close');
}
defineExpose({ open, close });

/** 提交（保留 false 值；otherSpecialRequire 为空则不传） */
function buildPayload(src) {
  const p = { ...toRaw(src) };
  if (p.otherSpecialRequire === '') delete p.otherSpecialRequire;
  return p;
}
function onSubmit() {
  formRef.value.validate(async ok => {
    if (!ok) return;
    try {
      saving.value = true;
      const payload = buildPayload(form);
      await Api.mps.SpecialRequire.submitsave(payload);
      console.log('[submit]', payload);
      emit('success', payload);
      close();
    } finally {
      saving.value = false;
    }
  });
}
</script>

<style scoped>
.mto-special-drawer {
  display: flex;
  flex-direction: column;
}
.md-header {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color);
  background: #fff;
}
.md-header .bar {
  width: 4px;
  height: 18px;
  background: #409eff;
  border-radius: 2px;
}
.md-header .title {
  font-weight: 600;
  font-size: 16px;
}
.md-body {
  padding: 16px;
  flex: 1;
  overflow: auto;
}
</style>
