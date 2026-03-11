import type { Ref } from 'vue';

import type { VbenFormSchema } from '#/adapter/form';
import type { CrmBusinessApi } from '#/api/crm/business';
import type { DescriptionItemSchema } from '#/components/description';

import { h } from 'vue';

import { DICT_TYPE } from '@vben/constants';
import { erpPriceInputFormatter, formatDateTime } from '@vben/utils';

import {
  DEFAULT_STATUSES,
  getBusinessStatusSimpleList,
} from '#/api/crm/business/status';
import { DictTag } from '#/components/dict-tag';

/** 详情页的字段 */
export function useDetailSchema(): DescriptionItemSchema[] {
  return [
    {
      field: 'creatorName',
      label: '负责人',
    },
    {
      field: 'fromId',
      label: '商机来源',
      render: (val) =>
        h(DictTag, {
          type: DICT_TYPE.CRM_OPPS_FROM,
          value: val,
        }),
    },
    // {
    //   field: 'sectorId',
    //   label: '商机分类',
    //   render: (val) =>
    //     h(DictTag, {
    //       type: DICT_TYPE.CRM_PMS_PROJECT_INDUSTRY,
    //       value: val,
    //     }),
    // },
    {
      field: 'oppsLevelId',
      label: '商机级别',
      render: (val) =>
        h(DictTag, {
          type: DICT_TYPE.CRM_OPPS_LEVEL,
          value: val,
        }),
    },

    {
      field: 'createTime',
      label: '创建时间',
      render: (val) => formatDateTime(val) as string,
    },
  ];
}

/** 详情页的基础字段 */
export function useDetailBaseSchema(): DescriptionItemSchema[] {
  return [
    {
      field: 'oppsName',
      label: '商机名称',
    },
    {
      field: 'oppsCode',
      label: '商机编码',
    },
    {
      field: 'customerName',
      label: '客户名称',
    },
    {
      field: 'expAmount',
      label: '预估金额（元）',
      render: (val) => erpPriceInputFormatter(val),
    },
    // {
    //   field: 'dealTime',
    //   label: '预计成交日期',
    //   render: (val) => formatDateTime(val) as string,
    // },
    // {
    //   field: 'contactNextTime',
    //   label: '下次联系时间',
    //   render: (val) => formatDateTime(val) as string,
    // },
    {
      field: 'fromId',
      label: '商机来源',
      render: (val) =>
        h(DictTag, {
          type: DICT_TYPE.CRM_OPPS_FROM,
          value: val,
        }),
    },
    {
      field: 'sectorId',
      label: '行业类别',
      render: (val) =>
        h(DictTag, {
          type: DICT_TYPE.CRM_PMS_PROJECT_INDUSTRY,
          value: val,
        }),
    },
    {
      field: 'deptId',
      label: '所属部门',

      render: (val) =>
        h(DictTag, {
          type: DICT_TYPE.CRM_OPPS_DEPARTMENT,
          value: val,
        }),
    },
    {
      field: 'oppsOrgId',
      label: '所属组织',
      render: (val) =>
        h(DictTag, {
          type: DICT_TYPE.CRM_OPPS_ORGANIZATION,
          value: val,
        }),
    },
    // {
    //   field: 'createTime',
    //   label: '创建时间',
    //   render: (val) => formatDateTime(val) as string,
    // },
    {
      field: 'bdUserName',
      label: 'BD负责人',
    },
    {
      field: 'tpmUserName',
      label: 'TPM负责人',
    },
    {
      field: 'oppsStatusId',
      label: '商机状态',
      render: (val) =>
        h(DictTag, {
          type: DICT_TYPE.CRM_OPPS_STATUS,
          value: val,
        }),
    },
    {
      field: 'oppsBackground',
      label: '商机背景',
      span: 12,
    },
  ];
}

/** 商机状态更新表单 */
export function useStatusFormSchema(
  formData: Ref<CrmBusinessApi.Business | undefined>,
): VbenFormSchema[] {
  return [
    {
      fieldName: 'id',
      component: 'Input',
      dependencies: {
        triggerFields: [''],
        show: () => false,
      },
    },
    {
      fieldName: 'statusId',
      label: '商机状态',
      component: 'Input',
      dependencies: {
        triggerFields: [''],
        show: () => false,
      },
    },
    {
      fieldName: 'endStatus',
      label: '商机状态',
      component: 'Input',
      dependencies: {
        triggerFields: [''],
        show: () => false,
      },
    },
    {
      fieldName: 'status',
      label: '商机阶段',
      component: 'Select',
      dependencies: {
        triggerFields: [''],
        async componentProps() {
          const statusList = await getBusinessStatusSimpleList(
            formData.value?.statusTypeId ?? 0,
          );
          const statusOptions = statusList.map((item) => ({
            label: `${item.name}(赢单率：${item.percent}%)`,
            value: item.id,
          }));
          const options = DEFAULT_STATUSES.map((item) => ({
            label: `${item.name}(赢单率：${item.percent}%)`,
            value: item.endStatus,
          }));
          statusOptions.push(...options);
          return {
            options: statusOptions,
          };
        },
      },
      rules: 'required',
    },
  ];
}
