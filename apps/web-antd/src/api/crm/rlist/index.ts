import type { PageParam, PageResult } from '@vben/request';

import { requestClient } from '#/api/request';

export namespace CrmRListApi {
  /** 客户需求单 */
  export interface RList {
    id?: number;
    creator?: string;
    updater?: string;
    createTime?: Date;
    updateTime?: Date;
    deleted?: boolean;
    tenantId?: number;
    rlistName: string;
    rlistCode?: string;
    customerId?: number;
    customerName?: string;
    deviceKey?: string;
    deviceTypeKey?: string;
    remark?: string;
  }
}

/** 查询客户需求单分页 */
export function getRListPage(params: PageParam) {
  return requestClient.get<PageResult<CrmRListApi.RList>>('/crm/rlist/page', {
    params,
  });
}

/** 查询客户需求单详情 */
export function getRList(id: number) {
  return requestClient.get<CrmRListApi.RList>(`/crm/rlist/get?id=${id}`);
}

/** 新增客户需求单 */
export function createRList(data: CrmRListApi.RList) {
  return requestClient.post('/crm/rlist/create', data);
}

/** 修改客户需求单 */
export function updateRList(data: CrmRListApi.RList) {
  return requestClient.put('/crm/rlist/update', data);
}

/** 删除客户需求单 */
export function deleteRList(id: number) {
  return requestClient.delete(`/crm/rlist/delete?id=${id}`);
}
