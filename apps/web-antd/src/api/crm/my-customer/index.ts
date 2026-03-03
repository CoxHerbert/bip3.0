export namespace CrmCustomerApi {
  export type CreateStatus = 'APPROVED' | 'DRAFT' | 'SUBMITTED';

  export interface Customer {
    id?: number;

    erpFid?: string;
    erpFentryid?: string;
    erpFnumber?: string;

    orgId?: string;
    orgName?: string;

    fullname?: string;
    cusLevel?: number;
    cusCategory?: number;
    cusShareType?: number;
    sector?: number;
    staffSize?: number;

    personInChargeUser?: number | string;
    sharerUser?: string;

    customerDesc?: string;
    alias?: string;

    code?: string;
    customerCode?: string;

    legalPerson?: string;
    legalPersonContact?: string;

    regCap?: string;
    regType?: string;

    taxNo?: string;
    runningStatus?: string;

    regAddress?: string;
    regCode?: string;

    regDate?: string;
    cancelDate?: string;

    govBelong?: string;
    website?: string;

    companyScope?: string;

    bankOfDeposit?: string;
    bankAccount?: string;

    attachments?: string;

    createStatus?: CreateStatus;

    isCm?: boolean;
    cmCode?: string;

    createTime?: string;
    updateTime?: string;
  }

  export interface PageResult<T> {
    list: T[];
    total: number;
  }
}

/* ------------------------
   内存数据库（Mock）
-------------------------*/

let idSeed = 3;

let customerDB: CrmCustomerApi.Customer[] = [
  {
    id: 1,
    fullname: '北京测试科技有限公司',
    code: 'CRM001',
    customerCode: 'CRM001',
    taxNo: '91110000123456789A',
    orgId: 'ORG001',
    personInChargeUser: 1001,
    cusLevel: 1,
    cusCategory: 1,
    runningStatus: '存续',
    companyScope: '技术开发；技术服务',
    createStatus: 'DRAFT',
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString(),
  },
  {
    id: 2,
    fullname: '上海示例贸易有限公司',
    code: 'CRM002',
    customerCode: 'CRM002',
    taxNo: '91310000123456789B',
    orgId: 'ORG002',
    personInChargeUser: 1002,
    cusLevel: 2,
    cusCategory: 2,
    runningStatus: '存续',
    companyScope: '货物进出口',
    createStatus: 'APPROVED',
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString(),
  },
];

/* ------------------------
   工具函数
-------------------------*/

function sleep(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function conflictError() {
  const error: any = new Error('Conflict');
  error.response = { status: 409 };
  throw error;
}

function notAllowedError(message = 'Not allowed') {
  const error: any = new Error(message);
  error.response = { status: 400 };
  throw error;
}

function notFoundError() {
  const error: any = new Error('Not Found');
  error.response = { status: 404 };
  throw error;
}

function validateCancelDate(data: CrmCustomerApi.Customer) {
  if (data.runningStatus === '注销' && !data.cancelDate) {
    notAllowedError('cancelDate required when runningStatus=注销');
  }
}

function normalizeCode(data: CrmCustomerApi.Customer) {
  // 兼容：customerCode / code
  if (data.code && !data.customerCode) data.customerCode = data.code;
  if (data.customerCode && !data.code) data.code = data.customerCode;
}

/* ------------------------
   API 实现（Mock）
-------------------------*/

export async function getCustomerPage(
  params: any,
): Promise<CrmCustomerApi.PageResult<CrmCustomerApi.Customer>> {
  await sleep();

  const { pageNo = 1, pageSize = 10, ...query } = params;

  let list = [...customerDB];

  // 简单筛选：字符串 contains
  Object.keys(query).forEach((key) => {
    const val = query[key];
    if (val !== undefined && val !== null && val !== '') {
      list = list.filter((item) =>
        String((item as any)[key] ?? '').includes(String(val)),
      );
    }
  });

  const start = (pageNo - 1) * pageSize;
  const end = start + pageSize;

  return {
    list: list.slice(start, end),
    total: list.length,
  };
}

export async function getCustomer(
  id: number,
): Promise<CrmCustomerApi.Customer> {
  await sleep();
  const data = customerDB.find((c) => c.id === id);
  if (!data) notFoundError();
  return data;
}

export async function createCustomer(data: CrmCustomerApi.Customer) {
  await sleep();

  normalizeCode(data);
  validateCancelDate(data);

  // 唯一性校验
  const exists = customerDB.find(
    (c) =>
      c.fullname === data.fullname ||
      c.code === data.code ||
      c.taxNo === data.taxNo,
  );
  if (exists) conflictError();

  const now = new Date().toISOString();

  const newCustomer: CrmCustomerApi.Customer = {
    ...data,
    id: ++idSeed,
    createStatus: 'DRAFT',
    createTime: now,
    updateTime: now,
  };

  customerDB.unshift(newCustomer);

  return newCustomer.id!;
}

export async function updateCustomer(data: CrmCustomerApi.Customer) {
  await sleep();

  if (!data.id) notAllowedError('id required');

  normalizeCode(data);
  validateCancelDate(data);

  const index = customerDB.findIndex((c) => c.id === data.id);
  if (index === -1) notFoundError();

  const old = customerDB[index];

  if (old.createStatus === 'APPROVED') {
    notAllowedError('APPROVED customer cannot update');
  }

  // 唯一性校验（排除自己）
  const exists = customerDB.find(
    (c) =>
      c.id !== data.id &&
      (c.fullname === data.fullname ||
        c.code === data.code ||
        c.taxNo === data.taxNo),
  );
  if (exists) conflictError();

  customerDB[index] = {
    ...old,
    ...data,
    updateTime: new Date().toISOString(),
  };
}

export async function deleteCustomer(id: number) {
  await sleep();
  customerDB = customerDB.filter((c) => c.id !== id);
}

export async function submitCustomer(id: number) {
  await sleep();

  const customer = customerDB.find((c) => c.id === id);
  if (!customer) notFoundError();

  if (!customer?.attachments) {
    notAllowedError('attachments required');
  }

  validateCancelDate(customer);

  if (customer.createStatus === 'APPROVED') {
    notAllowedError('APPROVED customer cannot submit');
  }

  customer.createStatus = 'SUBMITTED';
  customer.updateTime = new Date().toISOString();
}
