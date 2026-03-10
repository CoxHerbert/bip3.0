<script lang="ts" setup>
import type { UploadRequestOption } from 'ant-design-vue/lib/vc-upload/interface';

import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page, useVbenModal } from '@vben/common-ui';
import { formatDateTime } from '@vben/utils';

import {
  Button,
  Card,
  message,
  Popconfirm,
  Space,
  Table,
  Tabs,
  Upload,
} from 'ant-design-vue';

import { ACTION_ICON, TableAction } from '#/adapter/vxe-table';
import { deleteRListFile, deleteRListFileList } from '#/api/crm/rlist-file';
import {
  deleteRList,
  getRList,
  updateRList,
  type CrmRListApi,
} from '#/api/crm/rlist';
import { uploadFile } from '#/api/infra/file';
import { DictTag } from '#/components/dict-tag';
import { $t } from '#/locales';

import { DICT_TYPE } from '@vben/constants';

import RListForm from '../modules/rlist-form.vue';

defineOptions({ name: 'CrmRListDetail' });

const props = defineProps<{ id?: number }>();

const route = useRoute();
const { push } = useRouter();

const loading = ref(false);
const rlistId = ref<number>(0);
const detail = ref<CrmRListApi.RList>({} as CrmRListApi.RList);
const fileList = ref<CrmRListApi.RListFile[]>([]);
const selectedRowKeys = ref<number[]>([]);

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: RListForm,
  destroyOnClose: true,
});

function handleSelectChange(keys: (number | string)[]) {
  selectedRowKeys.value = keys.map((item) => Number(item));
}

const columns = [
  { title: '文件链接', dataIndex: 'rlistFileUrl', key: 'rlistFileUrl' },
  { title: '操作', key: 'action', width: 180 },
];

const headerItems = computed(() => [
  { label: 'BD', value: detail.value.bdName || '--' },
  { label: '关联商机', value: detail.value.oppsName || '--' },
  { label: '关联客户', value: detail.value.customerName || '--' },
  { label: '创建人', value: detail.value.creator || '--' },
  {
    label: '创建时间',
    value: detail.value.createTime
      ? formatDateTime(detail.value.createTime)
      : '--',
  },
]);

async function loadDetail() {
  loading.value = true;
  try {
    detail.value = await getRList(rlistId.value);
    fileList.value = detail.value.filesList || [];
    selectedRowKeys.value = [];
  } finally {
    loading.value = false;
  }
}

function handleBack() {
  push({ name: 'CrmRList' });
}

function handleCreate() {
  formModalApi.setData({}).open();
}

function handleEdit() {
  formModalApi.setData({ id: rlistId.value }).open();
}

async function handleDelete() {
  await deleteRList(rlistId.value);
  message.success('删除成功');
  handleBack();
}

function fileNameByUrl(url: string) {
  return url.split('/').pop() || '附件文件';
}

function handleDownload(url: string) {
  window.open(url, '_blank');
}

async function handleDeleteFile(record: CrmRListApi.RListFile) {
  if (!record.id) {
    return;
  }
  await deleteRListFile(record.id);
  message.success('删除成功');
  await loadDetail();
}

async function handleDeleteSelected() {
  if (!selectedRowKeys.value.length) {
    message.warning('请先选择附件');
    return;
  }
  await deleteRListFileList(selectedRowKeys.value);
  message.success('批量删除成功');
  await loadDetail();
}

async function handleUpload({ file, onSuccess, onError }: UploadRequestOption) {
  try {
    const res = await uploadFile({
      file: file as File,
      directory: 'crm/rlist',
    });
    const nextFiles = [
      ...(detail.value.filesList || []),
      { rlistFileUrl: res },
    ];
    await updateRList({
      ...detail.value,
      id: rlistId.value,
      filesList: nextFiles,
    });
    onSuccess?.(res);
    message.success('上传成功');
    await loadDetail();
  } catch (error) {
    onError?.(error as Error);
  }
}

onMounted(() => {
  rlistId.value = Number(props.id || route.params.id);
  loadDetail();
});
</script>

<template>
  <Page
    auto-content-height
    :loading="loading"
    :title="detail.rlistName || '需求单详情'"
  >
    <FormModal @success="loadDetail" />
    <template #extra>
      <TableAction
        :actions="[
          {
            label: '返回',
            type: 'default',
            icon: 'lucide:arrow-left',
            onClick: handleBack,
          },
          {
            label: '创建客户需求表',
            type: 'primary',
            icon: ACTION_ICON.ADD,
            onClick: handleCreate,
          },
          {
            label: $t('ui.actionTitle.edit'),
            type: 'primary',
            icon: ACTION_ICON.EDIT,
            onClick: handleEdit,
          },
          {
            label: $t('common.delete'),
            type: 'default',
            danger: true,
            icon: ACTION_ICON.DELETE,
            popConfirm: {
              title: `确认删除需求单【${detail.rlistName || ''}】吗？`,
              confirm: handleDelete,
            },
          },
        ]"
      />
    </template>

    <Card>
      <div class="mt-2 flex flex-wrap gap-x-8 gap-y-2 text-sm text-gray-600">
        <div v-for="item in headerItems" :key="item.label">
          <span class="text-gray-500">{{ item.label }}：</span>{{ item.value }}
        </div>
      </div>
    </Card>

    <Card class="mt-4">
      <Tabs>
        <Tabs.TabPane tab="详情" key="detail" force-render>
          <div class="mb-3 text-base font-semibold">基本信息</div>
          <div class="grid grid-cols-2 gap-y-3 text-sm">
            <div>需求名称：{{ detail.rlistName || '--' }}</div>
            <div>关联客户：{{ detail.customerName || '--' }}</div>
            <div>关联商机：{{ detail.oppsName || '--' }}</div>
            <div>BD：{{ detail.bdName || '--' }}</div>
            <div>
              设备种类：
              <DictTag
                v-if="detail.deviceTypeKey"
                :type="DICT_TYPE.CRM_RLIST_DEVICE_TYPE"
                :value="detail.deviceTypeKey"
              />
              <span v-else>--</span>
            </div>
            <div>
              设备类型：
              <DictTag
                v-if="detail.deviceKey"
                :type="DICT_TYPE.CRM_RLIST_DEVICE"
                :value="detail.deviceKey"
              />
              <span v-else>--</span>
            </div>
            <div class="col-span-2">描述：{{ detail.remark || '--' }}</div>
          </div>
        </Tabs.TabPane>

        <Tabs.TabPane tab="附件" key="file" force-render>
          <Space class="mb-4">
            <Upload :custom-request="handleUpload" :show-upload-list="false">
              <Button type="primary">上传</Button>
            </Upload>
            <Popconfirm
              title="确认删除选中附件吗？"
              @confirm="handleDeleteSelected"
            >
              <Button danger>删除</Button>
            </Popconfirm>
          </Space>
          <Table
            :columns="columns"
            :data-source="fileList"
            :pagination="false"
            :row-selection="{ selectedRowKeys, onChange: handleSelectChange }"
            row-key="id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'rlistFileUrl'">
                <a
                  class="text-primary hover:underline"
                  @click="handleDownload(record.rlistFileUrl)"
                >
                  {{ fileNameByUrl(record.rlistFileUrl) }}
                </a>
              </template>
              <template v-if="column.key === 'action'">
                <Space>
                  <Button
                    type="link"
                    size="small"
                    @click="handleDownload(record.rlistFileUrl)"
                  >
                    下载
                  </Button>
                  <Popconfirm
                    title="确认删除该附件吗？"
                    @confirm="handleDeleteFile(record)"
                  >
                    <Button type="link" size="small" danger>删除</Button>
                  </Popconfirm>
                </Space>
              </template>
            </template>
          </Table>
        </Tabs.TabPane>
      </Tabs>
    </Card>
  </Page>
</template>
