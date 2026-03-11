import { requestClient } from '#/api/request';

export namespace CrmRListFileApi {
  export interface RListFile {
    id?: number;
    rlistId?: number;
    rlistFileUrl: string;
    createTime?: Date;
  }
}

/** 删除需求单附件 */
export function deleteRListFile(id: number) {
  return requestClient.delete('/crm/customer-rlist-files/delete', {
    params: { id },
  });
}

/** 批量删除需求单附件 */
export function deleteRListFileList(ids: number[]) {
  return requestClient.delete('/crm/customer-rlist-files/delete-list', {
    params: { ids: ids.join(',') },
  });
}
