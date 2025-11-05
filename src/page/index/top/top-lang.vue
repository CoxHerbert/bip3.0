<template>
  <el-dropdown trigger="click" @command="handleSetLanguage">
    <div class="lang-switcher">
      <i class="iconfont icon-zhongyingwen"></i>
      <span class="lang-text">{{ getLanguageText(language) }}</span>
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item :disabled="language === 'zh-cn'" command="zh-cn">中文</el-dropdown-item>
        <el-dropdown-item :disabled="language === 'en'" command="en">English</el-dropdown-item>
        <el-dropdown-item :disabled="language === 'vi'" command="vi">Tiếng Việt</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'top-lang',
  data() {
    return {};
  },
  created() {},
  mounted() {},
  computed: {
    ...mapGetters(['language', 'tag']),
  },
  props: [],
  methods: {
    handleSetLanguage(lang) {
      console.log(lang);
      // 更新store中的语言设置
      this.$store.commit('SET_LANGUAGE', lang);
      // 更新i18n实例的语言
      this.$i18n.locale = lang;
      // 刷新菜单数据以应用新语言
      this.$store.dispatch('GetMenu').then(() => {
        // 强制刷新侧边栏
        this.$store.commit('SET_IS_REFRESH', false);
        this.$nextTick(() => {
          this.$store.commit('SET_IS_REFRESH', true);
        });
        // 更新当前标签页的标题
        let tag = this.tag;
        let title = this.$router.$avueRouter.generateTitle(tag);
        this.$router.$avueRouter.setTitle(title);
      });

      // location.reload();
    },
    getLanguageText(lang) {
      const langMap = {
        'zh-cn': '中文',
        en: 'English',
        vi: 'Tiếng Việt',
      };
      return langMap[lang] || '中文';
    },
  },
};
</script>

<style lang="scss" scoped>
.lang-switcher {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0 10px;
  height: 48px;

  .icon-zhongyingwen {
    font-size: 18px;
    margin-right: 5px;
  }

  .lang-text {
    font-size: 14px;
    font-weight: 500;
  }

  &:hover {
    background-color: rgba(0, 0, 0, 0.025);
  }
}
</style>
