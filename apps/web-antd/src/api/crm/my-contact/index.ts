export namespace CrmMyContactApi {
  export interface Contact {
    id?: number;
    contactsName: string;
    contactsPhoneNumber: string;
    contactsEmail?: string;
    contactsDeptName?: string;
    contactsPost?: string;
    contactsSuperiorId?: number;
    contactsRole?: string;
    contactsLabel?: string;
    customerId: number;
    familiarityLevelCode?: string;
    contactsTabooItem?: string;
    salesStrategy?: string;
    createTime?: string;
    updateTime?: string;
  }

  export interface ContactQuery {
    pageNo?: number;
    pageSize?: number;
    contactsName?: string;
    contactsPhoneNumber?: string;
    contactsEmail?: string;
    customerId?: number;
    familiarityLevelCode?: string;
  }

  export interface PageResult<T> {
    list: T[];
    total: number;
  }
}

let idSeed = 3;

let myContactDB: CrmMyContactApi.Contact[] = [
  {
    id: 1,
    contactsName: '张三',
    contactsPhoneNumber: '13800000001,010-66667777',
    contactsEmail: 'zhangsan@example.com',
    contactsDeptName: '市场部',
    contactsPost: '总监',
    contactsRole: '决策人',
    contactsLabel: '关键人,易沟通',
    customerId: 1,
    familiarityLevelCode: '2',
    contactsTabooItem: '忌讳频繁电话',
    salesStrategy: '每周一次微信沟通',
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString(),
  },
  {
    id: 2,
    contactsName: 'Alice Smith',
    contactsPhoneNumber: '13900000002',
    contactsEmail: 'alice@example.com',
    contactsDeptName: '技术部',
    contactsPost: '技术总监',
    contactsRole: '技术评估人',
    customerId: 2,
    familiarityLevelCode: '3',
    salesStrategy: '重点介绍产品技术优势',
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString(),
  },
];

function sleep(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

function validateContactName(name: string) {
  if (!name || name.length === 0 || name.length > 50) {
    notAllowedError('contactsName length must be 1-50');
  }
}

function validatePhoneNumber(contactsPhoneNumber: string) {
  if (!contactsPhoneNumber) {
    notAllowedError('contactsPhoneNumber is required');
  }
  const phoneReg = /^(?:1\d{10}|0\d{2,3}-?\d{7,8})$/;
  const phoneList = contactsPhoneNumber
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  if (
    phoneList.length === 0 ||
    !phoneList.every((phone) => phoneReg.test(phone))
  ) {
    notAllowedError('contactsPhoneNumber format is invalid');
  }
}

function validateEmail(email?: string) {
  if (!email) return;
  const emailReg = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/;
  if (!emailReg.test(email)) {
    notAllowedError('contactsEmail format is invalid');
  }
}

function validateCustomerId(customerId?: number) {
  if (!customerId) {
    notAllowedError('customerId is required');
  }
}

function validateContact(data: CrmMyContactApi.Contact) {
  validateContactName(data.contactsName);
  validatePhoneNumber(data.contactsPhoneNumber);
  validateEmail(data.contactsEmail);
  validateCustomerId(data.customerId);
}

export async function getMyContactPage(
  params: CrmMyContactApi.ContactQuery,
): Promise<CrmMyContactApi.PageResult<CrmMyContactApi.Contact>> {
  await sleep();

  const { pageNo = 1, pageSize = 10, ...query } = params;
  let list = [...myContactDB];

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      list = list.filter((item) =>
        String((item as any)[key] ?? '')
          .toLowerCase()
          .includes(String(value).toLowerCase()),
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

export async function getMyContact(
  id: number,
): Promise<CrmMyContactApi.Contact> {
  await sleep();
  const data = myContactDB.find((item) => item.id === id);
  if (!data) {
    notFoundError();
  }
  return data;
}

export async function createMyContact(data: CrmMyContactApi.Contact) {
  await sleep();
  validateContact(data);

  const now = new Date().toISOString();
  const record: CrmMyContactApi.Contact = {
    ...data,
    id: ++idSeed,
    createTime: now,
    updateTime: now,
  };
  myContactDB.unshift(record);
  return idSeed;
}

export async function updateMyContact(data: CrmMyContactApi.Contact) {
  await sleep();
  if (!data.id) {
    notAllowedError('id is required');
  }
  validateContact(data);

  const index = myContactDB.findIndex((item) => item.id === data.id);
  if (index === -1) {
    notFoundError();
  }

  myContactDB[index] = {
    ...myContactDB[index],
    ...data,
    updateTime: new Date().toISOString(),
  };
}

export async function deleteMyContact(id: number) {
  await sleep();
  myContactDB = myContactDB.filter((item) => item.id !== id);
}
