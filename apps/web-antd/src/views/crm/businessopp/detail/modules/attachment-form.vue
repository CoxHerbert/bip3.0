<script lang="ts" setup>
import type { CrmAttachmentApi } from '#/api/crm/attachment';

import { ref, watch } from 'vue';

import { IconifyIcon } from '@vben/icons';

import { Button, Card, message, Popconfirm, Upload } from 'ant-design-vue';

import {
  createAttachment,
  deleteAttachment,
  deleteAttachmentList,
  getAttachmentPage,
} from '#/api/crm/attachment';
import { uploadFile } from '#/api/infra/file';
// import { useUpload } from '#/components/upload';

// Props 定义
const props = defineProps<{
  bizId: number; // 商机ID
  bizType: number; // 业务类型（CRM_BUSINESS = 4）
}>();

const emit = defineEmits(['refresh']);

// 上传组件实例
// const { httpRequest } = useUpload();

// 附件列表数据
const fileList = ref<CrmAttachmentApi.Attachment[]>([]);
const loading = ref(false);
const selectedFileIds = ref<number[]>([]);

// 分页参数
const pagination = ref({
  current: 1,
  pageSize: 20,
  total: 0,
});

// 加载附件列表
async function loadAttachmentList() {
  if (!props.bizId) return;

  loading.value = true;
  try {
    const res = await getAttachmentPage({
      bizType: props.bizType,
      bizId: props.bizId,
      pageNo: pagination.value.current,
      pageSize: pagination.value.pageSize,
    });
    fileList.value = res.list || [];
    pagination.value.total = res.total || 0;
  } catch (error) {
    console.error('加载附件列表失败:', error);
    message.error('加载附件列表失败');
  } finally {
    loading.value = false;
  }
}

// 监听 bizId 变化，自动加载
watch(() => props.bizId, loadAttachmentList, { immediate: true });

// 处理文件上传
async function handleUpload(file: File) {
  try {
    loading.value = true;

    // 1. 上传文件到文件服务器
    const uploadRes = await uploadFile({ file });
    const fileUrl = uploadRes?.url || uploadRes?.data || uploadRes;

    // 2. 创建CRM附件记录
    await createAttachment({
      bizType: props.bizType,
      bizId: props.bizId,
      urlPath: fileUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    message.success('上传成功');

    // 3. 刷新列表
    await loadAttachmentList();
    emit('refresh');

    return false; // 阻止默认上传行为
  } catch (error) {
    console.error('上传失败:', error);
    message.error('上传失败');
    return false;
  } finally {
    loading.value = false;
  }
}

// 单个删除
async function handleDeleteSingle(id: number) {
  try {
    await deleteAttachment(id);
    message.success('删除成功');
    await loadAttachmentList();
    emit('refresh');
  } catch (error) {
    console.error('删除失败:', error);
    message.error('删除失败');
  }
}

// 批量删除
async function handleDeleteBatch() {
  if (selectedFileIds.value.length === 0) {
    message.warning('请选择要删除的文件');
    return;
  }

  try {
    await deleteAttachmentList(selectedFileIds.value);
    message.success('删除成功');
    selectedFileIds.value = [];
    await loadAttachmentList();
    emit('refresh');
  } catch (error) {
    console.error('批量删除失败:', error);
    message.error('批量删除失败');
  }
}

// 下载文件
function handleDownload(file: CrmAttachmentApi.Attachment) {
  if (!file.urlPath) {
    message.error('文件地址不存在');
    return;
  }

  // 创建隐藏的 a 标签进行下载
  const link = document.createElement('a');
  link.href = file.urlPath;
  link.download = file.fileName || 'download';
  link.target = '_blank';
  document.body.append(link);
  link.click();
  link.remove();

  message.success('开始下载');
}

// 批量下载
// function handleDownloadBatch() {
//   if (selectedFileIds.value.length === 0) {
//     message.warning('请选择要下载的文件');
//     return;
//   }

//   fileList.value
//     .filter((f) => selectedFileIds.value.includes(f.id!))
//     .forEach((f) => handleDownload(f));
// }

// 切换选择状态
function toggleSelect(fileId: number) {
  const index = selectedFileIds.value.indexOf(fileId);
  if (index === -1) {
    selectedFileIds.value.push(fileId);
  } else {
    selectedFileIds.value.splice(index, 1);
  }
}

// 判断是否选中
function isSelected(fileId: number) {
  return selectedFileIds.value.includes(fileId);
}

// 全选/取消全选
function toggleSelectAll() {
  selectedFileIds.value =
    selectedFileIds.value.length === fileList.value.length
      ? []
      : fileList.value.map((f) => f.id!);
}

// 根据文件类型获取图标
function getFileIcon(fileType?: string) {
  if (!fileType) return 'lucide:file';

  if (fileType.includes('image')) return 'lucide:image';
  if (fileType.includes('pdf')) return 'lucide:file-text';
  if (fileType.includes('word') || fileType.includes('document'))
    return 'lucide:file-text';
  if (fileType.includes('excel') || fileType.includes('sheet'))
    return 'lucide:file-spreadsheet';
  if (fileType.includes('zip') || fileType.includes('rar'))
    return 'lucide:archive';

  return 'lucide:file';
}

// 格式化文件大小
function formatFileSize(bytes?: number) {
  if (!bytes) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  let unitIndex = 0;
  let size = bytes;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- 操作按钮栏 -->
    <div class="mb-4 flex items-center gap-2">
      <Upload
        :before-upload="handleUpload"
        :show-upload-list="false"
        multiple
        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar"
      >
        <Button type="primary" :loading="loading">
          <IconifyIcon icon="lucide:upload" class="mr-1 size-4" />
          上传
        </Button>
      </Upload>

      <Button @click="toggleSelectAll" v-if="fileList.length > 0">
        <IconifyIcon icon="lucide:check-square" class="mr-1 size-4" />
        {{ selectedFileIds.length === fileList.length ? '取消全选' : '全选' }}
      </Button>

      <Popconfirm
        title="确定删除选中的文件吗？"
        ok-text="确定"
        cancel-text="取消"
        @confirm="handleDeleteBatch"
      >
        <Button danger :disabled="selectedFileIds.length === 0">
          <IconifyIcon icon="lucide:trash-2" class="mr-1 size-4" />
          删除 ({{ selectedFileIds.length }})
        </Button>
      </Popconfirm>

      <!-- <Button
        @click="handleDownloadBatch"
        :disabled="selectedFileIds.length === 0"
      >
        <IconifyIcon icon="lucide:download" class="mr-1 size-4" />
        下载 ({{ selectedFileIds.length }})
      </Button> -->
    </div>

    <!-- 提示信息 -->
    <div class="mb-4 text-sm text-muted-foreground" v-if="fileList.length > 0">
      已选择 {{ selectedFileIds.length }} 个文件，共
      {{ fileList.length }} 个附件
    </div>

    <!-- 空状态 -->
    <div
      v-if="!loading && fileList.length === 0"
      class="flex flex-1 items-center justify-center"
    >
      <div class="text-center text-muted-foreground">
        <IconifyIcon icon="lucide:folder-open" class="mb-2 size-16" />
        <p>暂无附件</p>
        <p class="mt-1 text-sm">点击上方"上传"按钮添加附件</p>
      </div>
    </div>

    <!-- 文件列表 -->
    <div v-else class="flex-1 overflow-auto">
      <div class="grid grid-cols-6 gap-4">
        <Card
          v-for="file in fileList"
          :key="file.id"
          class="cursor-pointer transition-all hover:shadow-md"
          :class="[
            isSelected(file.id!)
              ? 'border-primary ring-2 ring-primary/20'
              : 'border-border',
          ]"
          @click="toggleSelect(file.id!)"
        >
          <div class="flex flex-col items-center p-4">
            <!-- 文件图标 -->
            <div class="mb-3 text-6xl text-blue-500">
              <IconifyIcon :icon="getFileIcon(file.fileType)" class="size-16" />
            </div>

            <!-- 文件名称 -->
            <div
              class="w-full truncate text-center text-sm font-medium text-foreground"
              :title="file.fileName"
            >
              {{ file.fileName }}
            </div>

            <!-- 文件大小 -->
            <div class="mt-1 text-xs text-muted-foreground">
              {{ formatFileSize(file.fileSize) }}
            </div>

            <!-- 操作按钮 -->
            <div class="mt-3 flex gap-2">
              <Button
                size="small"
                type="link"
                @click.stop="handleDownload(file)"
              >
                <IconifyIcon icon="lucide:download" class="size-4" />
              </Button>
              <Popconfirm
                title="确定删除此文件吗？"
                ok-text="确定"
                cancel-text="取消"
                @confirm="handleDeleteSingle(file.id!)"
              >
                <Button size="small" type="link" danger @click.stop>
                  <IconifyIcon icon="lucide:trash-2" class="size-4" />
                </Button>
              </Popconfirm>
            </div>
          </div>
        </Card>
      </div>

      <!-- 分页（可选） -->
      <div
        class="mt-4 flex justify-center"
        v-if="pagination.total > pagination.pageSize"
      >
        <!-- 可添加 Ant Design Pagination 组件 -->
      </div>
    </div>
  </div>
</template>
