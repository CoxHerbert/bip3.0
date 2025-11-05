import { createI18n } from 'vue-i18n';
import Store from '@/store';
import elementEnLocale from 'element-plus/es/locale/lang/en';
import elementZhLocale from 'element-plus/es/locale/lang/zh-cn';
import elementJaLocale from 'element-plus/es/locale/lang/ja';
import elementViLocale from 'element-plus/es/locale/lang/vi';
import enLocale from './en';
import zhLocale from './zh';
import viLocale from './vi';
import AvueEnLocale from '@smallwei/avue/lib/locale/lang/en';
import AvueZhLocale from '@smallwei/avue/lib/locale/lang/zh';
// import AvueViLocale from '@smallwei/avue/lib/locale/lang/vi';

import NfDesignEnLocale from '@nutflow/nf-design-elp/lib/locale/lang/en';
import NfDesignZhLocale from '@nutflow/nf-design-elp/lib/locale/lang/zh';
// import NfDesignViLocale from '@nutflow/nf-design-elp/lib/locale/lang/vi';
export const messages = {
  en: {
    ...enLocale,
    ...AvueEnLocale,
    ...elementEnLocale,
    ...NfDesignEnLocale,
  },
  'zh-cn': {
    ...zhLocale,
    ...AvueZhLocale,
    ...elementZhLocale,
    ...NfDesignZhLocale,
  },
  vi: {
    ...viLocale,
    // ...AvueViLocale, // 使用Avue组件越南语翻译
    ...elementViLocale, // 使用Element Plus越南语语言包
    ...NfDesignEnLocale, // 使用NfDesign组件越南语翻译
  },
};

// 添加调试日志
// console.log('i18n初始化调试:');
// console.log('当前语言:', Store.getters.language);
// console.log('enLocale类型:', typeof enLocale);
// console.log('enLocale包含menu:', !!enLocale.menu);
// console.log('enLocale包含menu:', enLocale);
// if (enLocale.menu) {
//   console.log('enLocale.menu.curriculumVitae:', enLocale.menu.curriculumVitae);
//   console.log('enLocale.menu.candidate:', enLocale.menu.candidate);
//   console.log('enLocale.menu.postManage:', enLocale.menu.postManage);
// }

export const language = Store.getters.language;
export default createI18n({
  locale: language,
  messages,
});
