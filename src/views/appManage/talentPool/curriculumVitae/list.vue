<template>
  <div class="list-page curriculum-vitae-list-page">
    <div class="header">
      <dc-search
        v-model="queryParams"
        v-bind="searchConfig"
        @reset="handleReset"
        @search="handleReset"
      />
    </div>

    <div class="content-container">
      <!-- 左侧岗位 -->
      <el-aside width="220px" class="sidebar">
        <el-input
          v-model="queryParams.postName"
          size="small"
          placeholder="输入岗位名称"
          prefix-icon="Search"
          class="side-search"
          clearable
          @keyup.enter="getTalentPosition"
        />
        <el-menu class="side-menu" :default-active="activeMenu" @select="onSelectMenu">
          <el-menu-item index="">全部</el-menu-item>
          <el-menu-item :index="post.id" v-for="(post, index) in postList" :key="index">
            {{ post.postName }}
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 右侧卡片列表 -->
      <div class="list-page" v-loading="loading">
        <div class="action-banner">
          <el-button size="small" type="primary" @click="aiResumeProcessing">全部AI解析</el-button>
          <el-button size="small" type="success" @click="openUpload">上传简历</el-button>
          <el-button size="small" type="primary" @click="showManual = true">手工解析</el-button>
        </div>

        <div class="table-container">
          <div class="grid">
            <div v-for="item in pagedList" :key="item.id" class="cv-card" @click="open(item)">
              <!-- 彩色文件块 -->
              <div class="tile" :class="tileClass(item.type)">
                <!-- 状态标签（用字典组件渲染） -->
                <span class="ribbon" :class="ribbonClass(item.parseStatus)">
                  <dc-dict-key :options="dictRefs.DC_PARSING_STATUS" :value="item.parseStatus" />
                </span>

                <!-- 图标/字母 -->
                <div class="icon">
                  <el-icon v-if="item.type === 'pdf'"><Document /></el-icon>
                  <span v-else-if="item.type === 'word'">W</span>
                  <el-icon v-else><Files /></el-icon>
                </div>

                <!-- 失败时 hover 出现操作条 -->
                <div v-if="isParseFailed(item.parseStatus)" class="tile-actions" @click.stop>
                  <el-button size="small" type="primary" @click="manualParse(item)"
                    >手工解析</el-button
                  >
                  <el-button size="small" type="success" @click="aiParse(item)">AI解析</el-button>
                </div>
              </div>

              <!-- 文件名 -->
              <el-tooltip effect="dark" :content="displayName(item)">
                <div class="filename" :title="displayName(item)">
                  {{ displayName(item) }}
                </div>
              </el-tooltip>
            </div>
          </div>
          <div v-if="!pagedList.length" class="null-data">暂无数据</div>
        </div>

        <dc-pagination
          v-show="total > 0"
          :total="total"
          v-model:page="queryParams.current"
          v-model:limit="queryParams.size"
          @pagination="getData"
        />
      </div>
    </div>
    <!-- 上传简历（多文件） -->
    <el-dialog
      v-model="uploadDialog.visible"
      title="上传简历（支持多文件）"
      width="560px"
      :close-on-click-modal="false"
    >
      <el-upload
        drag
        multiple
        :file-list="uploadDialog.fileList"
        :auto-upload="false"
        :on-change="onFileChange"
        :on-remove="onFileRemove"
        :before-upload="beforeUpload"
        :http-request="noop"
        accept=".pdf,.doc,.docx"
        list-type="text"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或 <em>点击选择</em></div>
        <template #tip>
          <div class="el-upload__tip">
            文件请以“xx姓名_xx学校”命名，仅支持 PDF/Word（.pdf .doc .docx），单文件 ≤
            {{ (uploadLimit / 1024 / 1024).toFixed(0) }}MB
          </div>
        </template>
      </el-upload>

      <template #footer>
        <el-button @click="uploadDialog.visible = false">取 消</el-button>
        <el-button type="primary" :loading="uploadDialog.loading" @click="submitBatchUpload">
          开始上传
        </el-button>
      </template>
    </el-dialog>
    <ManualParseDialog
      v-model="showManual"
      :request="{ submitBaseInfo, submitEduList, submitWorkList, submitProjectList }"
      @success="refreshTable"
    >
    </ManualParseDialog>
  </div>
</template>

<script>
import Api from '@/api';
import ManualParseDialog from './ManualParseDialog.vue';
import { searchConfigFun } from './listOptions.js';
import { arrayToCsv } from '@/utils/csv';

// 解析状态字典键
const PARSE_KEYS = {
  ERROR: 'DC_PARSING_STATUS_ERROR',
  DONE: 'DC_PARSING_STATUS_YJX',
  TODO: 'DC_PARSING_STATUS_WJX',
  RUN: 'DC_PARSING_STATUS_JXZ',
};

export default {
  name: 'ResumeLibrary',
  components: { ManualParseDialog },
  data() {
    return {
      loading: false,
      activeMenu: '',
      queryParams: {
        size: 24,
        current: 1,
        type: '',
        parseStatus: '',
        postId: '',
        postName: '',
      },
      total: 0,
      list: [],
      postList: [],
      dictRefs: {},
      showManual: false,
      uploadDialog: { visible: false, loading: false, fileList: [] },
      uploadLimit: 10 * 1024 * 1024, // 10MB
      currentItem: null,
    };
  },
  async created() {
    this.dictRefs =
      (await this.useAsyncCache?.([{ key: 'DC_PARSING_STATUS' }]).catch(() => ({}))) || {};
    this.getData();
    this.getTalentPosition();
  },
  computed: {
    searchConfig() {
      return searchConfigFun(this.dictRefs?.DC_PARSING_STATUS);
    },
    filteredList() {
      const kw = (this.queryParams.keyword || '').trim().toLowerCase();
      const { type, parseStatus, postId } = this.queryParams;
      let arr = (this.list || []).filter(it => {
        const okKw =
          !kw ||
          (it.employeeName && it.employeeName.toLowerCase().includes(kw)) ||
          (it.position && it.position.toLowerCase().includes(kw));
        const okType = !type || it.type === type;
        const okStatus = !parseStatus || String(it.parseStatus) === String(parseStatus);
        const okPost = !postId || String(it.postId || '') === String(postId);
        return okKw && okType && okStatus && okPost;
      });

      const by = this.queryParams.orderBy;
      arr = arr.sort((a, b) => {
        if (by === 'employeeName')
          return (a.employeeName || '').localeCompare(b.employeeName || '', 'zh-Hans-CN');
        if (by === 'position')
          return (a.position || '').localeCompare(b.position || '', 'zh-Hans-CN');
        if (by === 'type') return (a.type || '').localeCompare(b.type || '');
        if (by === 'parseStatus') return (a.parseStatus || '').localeCompare(b.parseStatus || '');
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      });
      return arr;
    },
    pagedList() {
      const start = (this.queryParams.current - 1) * this.queryParams.size;
      return this.filteredList.slice(start, start + this.queryParams.size);
    },
  },
  methods: {
    async getData() {
      this.loading = true;
      Api.appManage.talentResumeHandle
        .getList({ ...this.queryParams })
        .then(res => {
          const { code, data } = res.data || {};
          if (code === 200) {
            this.list = (data?.records || []).map(item => ({
              ...item,
              type: this.getFileType(item.filePath),
              parseStatus: item.parseStatus,
            }));
            this.total = data?.total || 0;
          } else {
            this.list = [];
            this.total = 0;
          }
        })
        .catch(() => {
          this.list = [];
          this.total = 0;
        })
        .finally(() => (this.loading = false));
    },
    getTalentPosition() {
      Api.appManage.talentPosition
        .getList({ current: 1, size: 9999, postName: this.queryParams.postName })
        .then(res => {
          const { code, data } = res.data || {};
          this.postList = code === 200 ? data?.records || [] : [];
        })
        .catch(() => (this.postList = []));
    },
    aiResumeProcessing() {
      this.$message.success('正在解析中，解析完成功后下次进入自动加载！');
      Api.appManage.talentResumeHandle
        .aiResumeProcessing()
        .then(res => {
          const { code } = res.data;
          if (code === 200) {
          }
        })
        .catch(e => {
          this.$message.error('解析失败', e);
        });
    },
    getFileType(filePath) {
      if (!filePath) return 'other';
      const ext = String(filePath).split('.').pop().toLowerCase();
      if (ext === 'pdf') return 'pdf';
      if (ext === 'doc' || ext === 'docx') return 'word';
      return 'other';
    },
    displayName(item) {
      return item?.employeeName || item?.fileName || '未命名';
    },
    isParseFailed(s) {
      return String(s) === PARSE_KEYS.ERROR || String(s) === PARSE_KEYS.TODO;
    },
    ribbonClass(s) {
      switch (String(s)) {
        case PARSE_KEYS.DONE:
          return 'r-reviewed';
        case PARSE_KEYS.RUN:
          return 'r-generating';
        case PARSE_KEYS.TODO:
          return 'r-pending';
        case PARSE_KEYS.ERROR:
          return 'r-failed';
        default:
          return 'r-default';
      }
    },
    tileClass(type) {
      return {
        't-word': type === 'word',
        't-pdf': type === 'pdf',
        't-other': type !== 'word' && type !== 'pdf',
      };
    },
    onSelectMenu(key) {
      this.activeMenu = key;
      this.queryParams.postId = key || '';
      this.queryParams.current = 1;
      this.getData();
    },
    handleReset() {
      this.queryParams.current = 1;
      this.getData();
    },
    applyFilters() {
      this.queryParams.current = 1;
      this.getData();
    },
    resetFilters() {
      this.queryParams = {
        ...this.queryParams,
        keyword: '',
        type: '',
        parseStatus: '',
        postId: '',
        current: 1,
      };
    },
    open(item) {
      console.log('open item', item);
    },
    manualParse(item) {
      this.showManual = true;
      this.currentItem = item;
    },
    aiParse(item) {
      this.$message.success('正在解析中，解析完成功后下次进入自动加载！');
      Api.appManage.talentResumeHandle
        .aiResumeProcessing({ ids: item.id })
        .then(res => {
          const { code } = res.data;
          if (code === 200) {
          }
        })
        .catch(e => {
          this.$message.error('解析失败', e);
        });
    },
    // ===== 主表 & 子表提交（手动解析弹窗调用） =====
    async submitBaseInfo(base) {
      const form = {
        ...base,
        joinPostIds: arrayToCsv(base.joinPostIds),
      };
      if (this.currentItem) {
        form['resumeHandleId'] = this.currentItem?.id;
      }
      const res = await Api.appManage.talentUser.submit(form);
      const { data } = res.data || {};
      return { id: data?.id };
    },
    async submitEduList(talentUserId, list) {
      const payload = (list || []).map(item => ({ ...item, talentUserId }));
      await Api.appManage.talentEducation.batchSubmit(payload);
    },
    async submitWorkList(talentUserId, list) {
      const payload = (list || []).map(item => ({ ...item, talentUserId }));
      await Api.appManage.talentWorkRecord.batchSubmit(payload);
    },
    async submitProjectList(talentUserId, list) {
      const payload = (list || []).map(item => ({
        ...item,
        talentUserId,
        projectStartDate: item.startDate,
        projectEndDate: item.endDate,
      }));
      await Api.appManage.talentProjectRecord.batchSubmit(payload);
    },
    // ===== 上传 =====
    openUpload() {
      this.uploadDialog.visible = true;
      this.uploadDialog.fileList = [];
    },
    onFileChange(file, fileList) {
      this.uploadDialog.fileList = fileList;
    },
    onFileRemove(file, fileList) {
      this.uploadDialog.fileList = fileList;
    },
    beforeUpload(file) {
      const okType = /\.(pdf|docx?)$/i.test(file?.name || '');
      const okSize = file.size <= this.uploadLimit;
      if (!okType) this.$message.error('仅支持 PDF/Word（.pdf .doc .docx）');
      if (!okSize) this.$message.error(`单文件 ≤ ${(this.uploadLimit / 1024 / 1024).toFixed(0)}MB`);
      return okType && okSize;
    },
    noop() {},
    normalizeBatchResponse(res) {
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      return (list || []).map(it => ({
        link: it?.link || '',
        domain: it?.domain || '',
        name: it?.name || '',
        originalName: it?.originalName || it?.name || '',
        attachId: it?.attachId || '',
      }));
    },
    async submitBatchUpload() {
      const files = this.uploadDialog.fileList.map(f => f.raw).filter(Boolean);
      if (!files.length) return this.$message.error('请先选择文件');

      this.uploadDialog.loading = true;
      try {
        const form = new FormData();
        files.forEach(f => form.append('files', f)); // @RequestPart("files")
        const resp = await Api.common.upload.postFiles(form, {
          filePath: 'upload/resume',
        });
        const { code, data } = resp?.data || {};
        if (code !== 200) throw new Error('上传失败');

        const objs = this.normalizeBatchResponse(data);
        this.onBatchUploadSuccess?.(objs);

        this.uploadDialog.visible = false;
        this.uploadDialog.fileList = [];
        this.$message.success('上传成功');
        return objs;
      } catch (e) {
        console.error(e);
        this.$message.error('上传失败，请重试');
        throw e;
      } finally {
        this.uploadDialog.loading = false;
      }
    },
    onBatchUploadSuccess(objs) {
      console.log('批量上传完成：', objs);
      this.getData();
    },
  },
};
</script>

<style lang="scss" scoped>
.header {
  display: flex;
}
.content-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}
.table-container {
  overflow: auto;
  .null-data {
    display: flex;
    color: #999;
    justify-content: center;
  }
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(164px, 1fr));
  gap: 16px;
  padding: 4px 0;
}

.cv-card {
  background: #fff;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.cv-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.12);
}

.tile {
  width: 100%;
  aspect-ratio: 1/1;
  border-radius: 14px 14px 10px 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.t-word {
  background: linear-gradient(135deg, #3a8dff, #1e80ff);
}
.t-pdf {
  background: linear-gradient(135deg, #ff5f56, #e53935);
}
.t-other {
  background: linear-gradient(135deg, #9ca3af, #6b7280);
}

/* 状态标签 */
.ribbon {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 999px;
  color: #fff;
  z-index: 2;
  .dict {
    color: #fff;
    font-size: 600;
  }
}
.r-reviewed {
  background: #2abc6d;
}
.r-generating {
  background: blue;
}
.r-pending {
  background: #e6a23c;
}
.r-failed {
  background: #ff0000;
}
.r-default {
  background: #909399;
}

/* 图标 */
.icon {
  color: #fff;
  font-size: 56px;
  font-weight: 800;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 1;
}
.icon :deep(svg) {
  width: 52px;
  height: 52px;
}

/* 失败态覆盖半透明白 */
.tile:has(.r-failed)::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: rgba(255, 255, 255, 0.6);
  z-index: 0;
}
.tile:has(.r-failed) .icon {
  filter: saturate(0.85) contrast(0.95);
}

/* 操作条 */
.tile-actions {
  position: absolute;
  left: 50%;
  bottom: 10px;
  transform: translate(-50%, 10px);
  display: flex;
  gap: 8px;
  opacity: 1;
  transition: all 0.18s ease;
  z-index: 2;
}
.cv-card:hover .tile-actions {
  opacity: 1;
  transform: translate(-50%, 0);
}

.filename {
  width: 100%;
  padding: 10px;
  font-size: 13px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
