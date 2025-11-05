<!-- src/components/FollowDrawer.vue -->
<template>
  <el-drawer
    v-model="visible"
    :with-header="false"
    size="900"
    :append-to-body="true"
    :close-on-click-modal="false"
  >
    <!-- 自定义头部 -->
    <div class="fd-header">
      <div class="left">
        <span class="bar"></span>
        <span class="title">添加跟进记录</span>
        <span class="tip">（多次改动请务必补充备注）</span>
      </div>
      <el-button type="danger" @click="close">关闭</el-button>
    </div>

    <div class="follow-board">
      <!-- 左：历史跟进 -->
      <div class="left-pane">
        <div class="header">
          <span class="bar"></span>
          <span class="title">历史跟进</span>
        </div>
        <div class="content">
          <div v-for="rec in hisList" :key="rec.id || rec">
            <div class="group-head">
              <dc-dict-key
                :options="dictRefs?.DC_EVALUATION_STATUS"
                :value="rec.followConclusion"
              />
              {{ dayjs(rec.createTime).format('YYYY-MM-DD') }}
            </div>
            <div class="record-card">
              <div class="topline">
                <dc-dict-key :options="dictRefs?.DC_FOLLOW_TYPE" :value="rec.followType" />
              </div>

              <div class="dl">
                <div class="row">
                  <div class="label">跟进岗位</div>
                  <div class="value">
                    <span v-if="rec.followPostId" class="muted">
                      <dc-view objectName="post" v-model="rec.followPostId" />
                    </span>
                  </div>
                </div>
                <div class="row">
                  <div class="label">跟进人</div>
                  <div class="value">
                    <dc-view objectName="user" v-model="rec.followUserId" />
                  </div>
                </div>
                <div class="row">
                  <div class="label">跟进时间</div>
                  <div class="value">{{ rec.followDate }}</div>
                </div>
                <div class="row">
                  <div class="label">跟进描述</div>
                  <div class="value">
                    <pre class="prewrap">{{ rec.followNote }}</pre>
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
            </div>
          </div>

          <div v-if="!hisList.length" class="null-data">暂无数据</div>
        </div>
      </div>

      <!-- 右：候选人信息 + 表单 -->
      <div class="right-pane">
        <div class="talent-brief">
          <div class="name-line">
            <span class="name">
              {{ talent.name || '-' }}
              <span v-if="talent.sex" class="sex">
                <dc-dict-key :options="dictRefs?.DC_GENDER || []" :value="talent.sex" />
              </span>
            </span>
            <!-- 简历预览按钮：点击左侧弹出预览 Drawer -->
            <el-button :disabled="!previewUrl" @click="openPreview">简历预览</el-button>
          </div>

          <div class="grid">
            <div>
              <span class="label">年龄</span><span>{{ talent.age ?? '-' }}</span>
            </div>
            <div>
              <span class="label">电话</span><span>{{ talent.phone || '-' }}</span>
            </div>
            <div class="full">
              <span class="label">投递岗位</span>
              <span>
                <dc-view objectName="post" v-model="talent.postPath" />
              </span>
            </div>
          </div>
        </div>

        <el-form ref="formRef" :model="form" :rules="rules" label-width="96px" class="follow-form">
          <el-form-item label="跟进方式" prop="followType">
            <el-select v-model="form.followType" placeholder="选择方式">
              <el-option
                v-for="t in dictRefs?.DC_FOLLOW_TYPE || []"
                :key="t.value"
                :label="t.label"
                :value="t.dictKey"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="跟进岗位" prop="followPostId">
            <el-select
              v-model="form.followPostId"
              placeholder="请选择跟进岗位"
              @change="val => handleChange('followPostId', val)"
            >
              <el-option
                v-for="post in followPostList"
                :key="post.id"
                :label="post.postName"
                :value="post.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="跟进人" prop="followUserId">
            <dc-select-user v-model="form.followUserId" placeholder="请选择跟进人" />
          </el-form-item>

          <el-form-item label="跟进时间" prop="followDate">
            <el-date-picker
              v-model="form.followDate"
              type="date"
              value-format="YYYY-MM-DD HH:mm:ss"
              placeholder="选择日期"
              @change="onDateChange"
            />
          </el-form-item>

          <el-form-item label="跟进描述" prop="followNote">
            <el-input
              v-model="form.followNote"
              type="textarea"
              :rows="5"
              placeholder="请填写关键沟通要点"
            />
          </el-form-item>

          <el-form-item label="上传文件">
            <dc-upload-v2
              v-model="form.file"
              :multiple="false"
              accept=".pdf,.doc,.docx"
              pain
              :limit="1"
              targetType="upload/selfResume/follow"
              @change="val => handleChange('file', val)"
            />
          </el-form-item>

          <el-form-item label="跟进结论">
            <el-radio-group v-model="form.followConclusion">
              <el-radio
                v-for="item in (dictRefs?.DC_EVALUATION_STATUS || []).filter(
                  it => it.dictKey !== 'DC_EVALUATION_STATUS_PGZ'
                )"
                :key="item.value"
                :label="item.dictKey"
              >
                {{ item.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="进程">
            <el-input v-model="form.followProgress" placeholder="请输入进程" />
          </el-form-item>

          <div class="actions">
            <el-button type="primary" @click="submit">提交</el-button>
            <el-button @click="reset">取消</el-button>
          </div>
        </el-form>
      </div>
    </div>

    <!-- ========== 左侧：简历预览 Drawer（iframe） ========== -->
    <el-drawer
      v-model="previewVisible"
      :with-header="false"
      direction="ltr"
      size="40%"
      :append-to-body="true"
      :close-on-click-modal="false"
      :destroy-on-close="true"
    >
      <div class="preview-header">
        <div class="left">
          <span class="bar"></span>
          <span class="title">简历预览</span>
          <span class="muted">{{ talent.name || '-' }}</span>
        </div>
        <el-button type="danger" @click="previewVisible = false">关闭</el-button>
      </div>

      <div class="preview-body">
        <iframe
          v-if="previewUrl"
          :src="previewUrl"
          title="简历预览"
          frameborder="0"
          border="0"
          marginwidth="0"
          marginheight="0"
          scrolling="auto"
          allowtransparency="yes"
        ></iframe>
        <div v-else class="no-file">暂无可预览的简历文件</div>
      </div>
    </el-drawer>
  </el-drawer>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch, getCurrentInstance, toRefs } from 'vue';
import Api from '@/api';
import dayjs from 'dayjs';
import { Base64 } from 'js-base64';

const { proxy } = getCurrentInstance();

const userInfoAll = computed(() => proxy.$store.getters.userInfoAll);

/* ======== Props / Emits ======== */
const props = defineProps({
  /** 抽屉显隐 v-model */
  modelValue: { type: Boolean, default: false },
  /** 抽屉宽度，支持 '70%' / '960px' / '80vw' 等 */
  size: { type: String, default: '900' },
  /** 候选人抬头（可选） */
  talent: { type: Object, default: () => ({}) },
});
const emit = defineEmits(['update:modelValue', 'save', 'update', 'delete']);

/* 抬头信息需先于依赖它的计算属性声明 */
const talent = computed(() => props.talent || {});

const pageData = reactive({
  hisList: [],
  dictRefs: {},
});
const { hisList, dictRefs } = toRefs(pageData);

const visible = ref(props.modelValue);
watch(
  () => props.modelValue,
  v => {
    visible.value = v;
    if (visible.value) init();
  }
);
watch(visible, v => emit('update:modelValue', v));
onMounted(async () => {
  dictRefs.value = await proxy.useAsyncCache([
    { key: 'DC_GENDER' },
    { key: 'DC_FOLLOW_TYPE' },
    { key: 'DC_EVALUATION_STATUS' },
  ]);
  getTalentPosition();
});

const init = () => {
  form.followUserId = userInfoAll.value.id;
  getHisList();
};

/** 岗位集合（全部） */
const postList = ref([]);

/** talent.postPath 可能是 [1,2,3] 或 "1,2,3" */
const postIdSet = computed(() => {
  const v = talent.value?.postPath;
  if (!v) return new Set();
  if (Array.isArray(v)) return new Set(v.map(String));
  if (typeof v === 'string') {
    return new Set(
      v
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
    );
  }
  return new Set();
});

/** 过滤出 post.id 在 ids 组里的帖子 */
const followPostList = computed(() => {
  return (postList.value || []).filter(p => postIdSet.value.has(String(p.id)));
});

function getTalentPosition() {
  Api.appManage.talentPosition
    .getList({
      current: 1,
      size: 9999,
    })
    .then(res => {
      const { code, data } = res.data || {};
      if (code === 200) {
        postList.value = data?.records || [];
      }
    })
    .catch(() => {});
}

/** ========== 历史记录 ========== */
function groupByDate(records) {
  const arr = Array.isArray(records) ? records : [];
  return arr;
}

const getHisList = () => {
  Api.appManage.talentFollowRecord
    .getList({ talentUserId: talent.value?.talentUserId, size: 9999, current: 1 })
    .then(res => {
      const { code, data } = res.data || {};
      if (code === 200) {
        pageData.hisList = groupByDate(data?.records || []);
      } else {
        pageData.hisList = [];
      }
    })
    .catch(() => {
      pageData.hisList = [];
    });
};

/* ======== 表单 ======== */
const formRef = ref();
const form = reactive({
  talentUserId: '',
  followType: '',
  followPostId: '',
  followUserId: '',
  followDate: '',
  followNote: '',
  fileId: '',
  fileLink: '',
  fileName: '',
  followConclusion: '',
  followProgress: '',
  // 组件双向绑定的文件路径/对象（由 dc-upload-v2 维护）
  file: undefined,
  followPostName: '',
});

const rules = {
  followType: [{ required: true, message: '请选择跟进方式', trigger: 'change' }],
  followPostId: [{ required: true, message: '请填写跟进岗位', trigger: 'change' }],
  followUserId: [{ required: true, message: '请填写跟进人ID', trigger: 'change' }],
  followDate: [{ required: true, message: '请选择日期', trigger: 'change' }],
  followNote: [{ max: 1000, message: '最多1000字', trigger: 'blur' }],
};

const handleChange = (prop, val) => {
  if (prop === 'file') {
    const f = Array.isArray(val) ? val[0] : val;
    form.fileId = f?.attachId || '';
    form.fileLink = f?.link || '';
    form.fileName = f?.originalName || '';
  } else if (prop === 'followPostId') {
    form.followPostName =
      followPostList.value.find(item => String(item.id) === String(val))?.postName || '';
  }
};

/* ======== 预览（左侧弹窗） ======== */
const previewVisible = ref(false);

function absoluteUrl(u) {
  if (!u) return '';
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith('/')) return `${location.origin}${u}`;
  return `${location.origin}/${u}`;
}

const previewUrl = computed(() => {
  // 优先使用人才卡片上的文件，其次使用当前表单选中的文件
  const raw = talent.value?.resumeUrl || form.resumeUrl || '';
  const abs = absoluteUrl(raw);
  if (!abs) return '';
  const base = import.meta.env.VITE_FILE_URL + '?url=';
  return base + encodeURIComponent(Base64.encode(abs));
});

function openPreview() {
  if (!previewUrl.value) {
    proxy?.$message?.warning?.('暂无可预览的简历文件');
    return;
  }
  previewVisible.value = true;
}

/* ======== 工具 ======== */
function extOf(rec) {
  const name = rec.fileName || rec.fileLink || '';
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
function normalizeLink(u) {
  if (!u) return '';
  return /^https?:\/\//i.test(u) ? u : u.startsWith('/') ? u : `/${u}`;
}
function openFile(rec) {
  const url = absoluteUrl(rec.fileLink);
  if (url) window.open(url, '_blank');
}

/* ======== 行为 ======== */
function submit() {
  formRef.value?.validate(valid => {
    if (!valid) return;
    const payload = {
      ...form,
      talentUserId: talent.value?.talentUserId || form.talentUserId,
    };
    Api.appManage.talentFollowRecord
      .submit(payload)
      .then(res => {
        const { code, data, msg } = res.data || {};
        if (code === 200) {
          proxy?.$message?.success?.('已提交');
          emit('save', data ?? null);
          getHisList();
          reset();
        } else {
          proxy?.$message?.error?.(msg || '提交失败');
        }
      })
      .catch(() => {
        proxy?.$message?.error?.('提交失败');
      });
  });
}

function reset() {
  formRef.value?.resetFields?.();
  Object.assign(form, {
    id: null,
    followType: '',
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
    followPostName: '',
  });
}

function close() {
  visible.value = false;
}

function onDateChange(val) {
  if (val) {
    const dateOnly = dayjs(val).format('YYYY-MM-DD');
    const nowTime = dayjs().format('HH:mm:ss');
    form.followDate = `${dateOnly} ${nowTime}`;
  }
}
</script>

<style scoped lang="scss">
/* 头部 */
.fd-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid #eef0f2;
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 2;
  .left {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    .bar {
      width: 4px;
      height: 14px;
      background: #ff8a00;
      border-radius: 2px;
    }
    .title {
      font-size: 16px;
    }
    .tip {
      color: #ff8a00;
      font-weight: 400;
    }
  }
}

/* 主体布局 */
.follow-board {
  --left-w: 380px;
  --muted: #999;
  --label: #666;
  --ok: #18a058;
  --warn: #f59e0b;
  --danger: #ef4444;

  display: grid;
  grid-template-columns: var(--left-w) 1fr;
  gap: 12px;
  padding: 12px;
  height: calc(100% - 60px);
}

/* 左列 */
.left-pane {
  display: flex;
  flex-direction: column;
  border-right: 1px dashed #e5e7eb;
  padding-right: 8px;
  overflow: auto;

  .header {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 8px;
    font-weight: 600;
    .bar {
      width: 4px;
      height: 14px;
      background: #ff8a00;
      border-radius: 2px;
    }
  }
  .content {
    flex: 1;
    overflow: auto;
    .null-data {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #999;
    }
  }

  .date-group {
    margin-bottom: 12px;
  }
  .group-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 2px 4px 6px 2px;
    font-size: 16px;
    font-weight: 600;
    .dict {
      font-size: 18px;
      color: #ff8a00;
      font-weight: 600;
    }
    .state {
      font-weight: 700;
      &.ok {
        color: var(--ok);
      }
      &.warn {
        color: var(--warn);
      }
      &.danger {
        color: var(--danger);
      }
      &.muted {
        color: var(--muted);
      }
    }
    .date {
      font-weight: 700;
      letter-spacing: 1px;
    }
  }

  .record-card {
    border: 1px solid #e6e6e9;
    border-radius: 8px;
    background: #fff;
    padding: 10px 12px;
    margin-bottom: 10px;
    .topline {
      position: relative;
      min-height: 22px;
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
        right: 0;
        top: 0;
        opacity: 0.2;
        transition: opacity 0.2s;
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
        font-size: 13px;
        line-height: 22px;
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
        .muted {
          color: var(--muted);
        }
      }
      .files {
        display: flex;
        align-items: center;
        gap: 8px;
        .file-chip {
          width: 28px;
          height: 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          .badge {
            color: #fff;
            font-size: 12px;
            font-weight: 700;
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

/* 右列 */
.right-pane {
  overflow: auto;
  padding-left: 6px;
  .talent-brief {
    border: 1px solid #e6e6e9;
    border-radius: 8px;
    padding: 10px 12px;
    background: #fff;
    margin-bottom: 10px;
    .name-line {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      font-weight: 700;
      font-size: 18px;
      .sex {
        font-size: 12px;
        color: #409eff;
        margin-left: 6px;
      }
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 6px;
      margin-top: 6px;
      .full {
        grid-column: 1/-1;
      }
      .label {
        color: var(--label);
        margin-right: 6px;
      }
    }
  }
  .follow-form {
    border: 1px solid #e6e6e9;
    border-radius: 8px;
    background: #fff;
    padding: 12px;
    .uploader {
      margin-right: 8px;
    }
    .chosen {
      margin-left: 8px;
      color: #333;
    }
    .actions {
      text-align: right;
      margin-top: 4px;
    }
  }
}

/* ======== 预览 Drawer 样式 ======== */
.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid #eef0f2;
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 2;
  .left {
    display: flex;
    align-items: center;
    gap: 8px;
    .bar {
      width: 4px;
      height: 14px;
      background: #409eff;
      border-radius: 2px;
    }
    .title {
      font-weight: 700;
      font-size: 16px;
    }
    .muted {
      color: #999;
      font-weight: 400;
    }
  }
}
.preview-body {
  height: calc(100vh - 100px);
  padding: 0;
  display: flex;
  > iframe {
    width: 100%;
    height: 100%;
    border: none;
    display: block;
  }
  .no-file {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
  }
}
</style>
