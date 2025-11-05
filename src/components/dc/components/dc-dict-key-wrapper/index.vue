<template>
  <div class="dc-dict-key-wrapper">
    <!-- 包装原始 dc-dict-key 组件 -->
    <dc-dict-key
      ref="dcDictKeyRef"
      :type="type"
      :options="options"
      :value="value"
      :color="color"
    />
    
    <!-- 匹配状态指示器（可选） -->
    <div v-if="showStatus" class="match-status-indicator">
      <el-tooltip
        :content="hasMatched ? '数据匹配成功' : '数据未匹配'"
        placement="top"
      >
        <div
          class="status-dot"
          :class="{ 'matched': hasMatched, 'unmatched': !hasMatched }"
        ></div>
      </el-tooltip>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue';
import dcDictKey from '../dc-dict-key/index.vue';

export default {
  name: 'DcDictKeyWrapper',
  components: { dcDictKey },
  props: {
    // 传递所有 dc-dict-key 的 props
    type: { type: String, default: '' },
    options: { type: Array, default: null },
    value: [Number, String, Array],
    color: { type: String, default: null },
    // 新增 props
    showStatus: { type: Boolean, default: false }, // 是否显示匹配状态指示器
  },
  emits: ['match-status-change', 'initialized'],
  setup(props, { emit }) {
    const dcDictKeyRef = ref(null);
    const initialized = ref(false);
    
    // 递归查找字典项
    const findDict = (options, value) => {
      for (const item of options) {
        if (item.dictKey === String(value)) {
          return item;
        }
        if (item.children && Array.isArray(item.children)) {
          const found = findDict(item.children, value);
          if (found) return found;
        }
      }
      return null;
    };
    
    // 计算属性：字典项
    const dict = computed(() => {
      if (Array.isArray(props.options) && props.options.length) {
        const result = findDict(props.options, props.value);
        return result || props.value;
      }
      return props.value;
    });
    
    // 计算属性：是否匹配到数据
    const hasMatched = computed(() => {
      if (!props.value) return false;
      
      if (Array.isArray(props.options) && props.options.length) {
        const result = findDict(props.options, props.value);
        return result !== null && typeof result === 'object';
      }
      
      return false;
    });
    
    // 监听匹配状态变化
    watch(hasMatched, (newVal) => {
      if (initialized.value) {
        emit('match-status-change', newVal);
      }
    });
    
    // 组件挂载完成后发出初始化事件
    onMounted(() => {
      initialized.value = true;
      emit('initialized', hasMatched.value);
    });
    
    // 暴露方法给父组件
    const getMatchStatus = () => {
      return hasMatched.value;
    };
    
    return {
      dcDictKeyRef,
      hasMatched,
      getMatchStatus
    };
  }
};
</script>

<style lang="scss" scoped>
.dc-dict-key-wrapper {
  position: relative;
  display: inline-flex;
}

.match-status-indicator {
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(50%, -50%);
  
  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    
    &.matched {
      background-color: #67c23a;
    }
    
    &.unmatched {
      background-color: #f56c6c;
    }
  }
}
</style>