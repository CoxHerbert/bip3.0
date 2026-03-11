import type { PageParam, PageResult } from '@vben/request';

import { requestClient } from '#/api/request';

export namespace CrmRListApi {
  export interface RListFile {
    id?: number;
    rlistId?: number;
    rlistFileUrl: string;
    createTime?: Date;
  }

  /** 客户需求单 */
  export interface RList {
    id?: number;
    creator?: string;
    createName?: string;
    updater?: string;
    createTime?: Date;
    updateTime?: Date;
    deleted?: boolean;
    tenantId?: number;
    rlistName: string;
    rlistCode?: string;
    customerId?: number;
    customerName?: string;
    oppsId?: number;
    oppsName?: string;
    bdId?: number;
    bdName?: string;
    deviceKey?: string;
    deviceTypeKey?: string;
    filesList?: RListFile[];
    remark?: string;
  }
}

/** 查询客户需求单分页 */
export function getRListPage(params: PageParam) {
  return requestClient.get<PageResult<CrmRListApi.RList>>(
    '/crm/customer-rlist/page',
    {
      params,
    },
  );
}

/** 查询客户需求单详情 */
export function getRList(id: number) {
  return requestClient.get<CrmRListApi.RList>('/crm/customer-rlist/get', {
    params: { id },
  });
}

/** 新增客户需求单 */
export function createRList(data: CrmRListApi.RList) {
  return requestClient.post('/crm/customer-rlist/create', data);
}

/** 修改客户需求单 */
export function updateRList(data: CrmRListApi.RList) {
  return requestClient.put('/crm/customer-rlist/update', data);
}

/** 删除客户需求单 */
export function deleteRList(id: number) {
  return requestClient.delete('/crm/customer-rlist/delete', { params: { id } });
}

/** 批量删除客户需求单 */
export function deleteRListList(ids: number[]) {
  return requestClient.delete('/crm/customer-rlist/delete-list', {
    params: { ids: ids.join(',') },
  });
}

/** 导出客户需求单 */
export function exportRList(params: any) {
  return requestClient.download('/crm/customer-rlist/export-excel', { params });
}
