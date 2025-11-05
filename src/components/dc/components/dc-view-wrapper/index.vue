<template>
  <div class="dc-view-wrapper">
    <!-- 包装原始 dc-view 组件 -->
    <dc-view
      ref="dcViewRef"
      :type="type"
      :bgColor="bgColor"
      :textColor="textColor"
      :objectName="objectName"
      :modelValue="modelValue"
      :showKey="showKey"
      @update:modelValue="$emit('update:modelValue', $event)"
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
import { ref, watch, onMounted, nextTick } from 'vue';
import dcView from '../dc-view/index.vue';
import ComponentApi from './../../api/index';
import store from '@/store/';
import cacheData from './../../constant/cacheData';

export default {
  name: 'DcViewWrapper',
  components: { dcView },
  props: {
    // 传递所有 dc-view 的 props
    type: { type: String, default: 'text' },
    bgColor: { type: String, default: 'rgb(252.5, 245.7, 235.5)' },
    textColor: { type: String, default: '#e6a23c' },
    objectName: { type: String, default: null },
    modelValue: { type: [String, Number, Array, Object], default: null },
    showKey: { type: String, default: null },
    // 新增 props
    showStatus: { type: Boolean, default: false }, // 是否显示匹配状态指示器
  },
  emits: ['update:modelValue', 'match-status-change', 'initialized'],
  setup(props, { emit }) {
    const dcViewRef = ref(null);
    const hasMatched = ref(false);
    const initialized = ref(false);
    
    // 内部数据，用于计算匹配状态
    const iptTagData = ref([]);
    const currentObject = ref(null);
    const rowKey = ref('id');
    const loadingFlag = ref(0);
    
    // 计算属性：判断是否匹配到数据
    const computeHasMatched = () => {
      if (!props.modelValue) return false;
      
      if (Array.isArray(iptTagData.value) && iptTagData.value.length) {
        return iptTagData.value.some(item => {
          if (item && typeof item === 'object') {
            const labelKey = currentObject.value?.defaultLabel || props.showKey || 'id';
            return item[labelKey] !== undefined || item.id !== undefined;
          }
          return false;
        });
      }
      return false;
    };
    
    // 将各种输入类型统一为 id 数组
    const normalizeIds = (val) => {
      if (Array.isArray(val))
        return val
          .map(v => (v && typeof v === 'object' ? v.id : v))
          .filter(v => v !== undefined && v !== null && v !== '');
      if (val && typeof val === 'object') return [val.id].filter(Boolean);
      if (typeof val === 'string')
        return val
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);
      if (typeof val === 'number') return [String(val)];
      return [];
    };
    
    // 从值刷新数据
    const refreshFromValue = async () => {
      try {
        // 1) 基础映射
        currentObject.value = cacheData[props.objectName] || null;
        rowKey.value = currentObject.value?.rowKey || 'id';
        const url = currentObject.value?.url;
        const ids = normalizeIds(props.modelValue);
        
        if (!ids || (Array.isArray(ids) && ids.length === 0) || !url) {
          iptTagData.value = [];
          updateMatchStatus();
          return;
        }
        
        // 2) 简单竞态保护：仅保留最后一次请求
        const token = ++loadingFlag.value;
        
        // 3) 触发缓存加载（全局 store 写入）
        await ComponentApi.cache.getView({ url, data: ids });
        
        if (token !== loadingFlag.value) return; // 有更新，丢弃旧结果
        
        // 4) 从全局数据拼装渲染用数据
        const globalData = (store.getters.globalData && store.getters.globalData[url]) || {};
        const asList = Object.keys(globalData).map(k => globalData[k]);
        
        if (rowKey.value !== 'id') {
          iptTagData.value = ids.map(id => {
            const found = asList.find(it => it?.[rowKey.value] === id);
            return found ? { ...found } : id;
          });
        } else {
          iptTagData.value = ids.map(id => globalData[id] || id);
        }
        
        // 更新匹配状态
        updateMatchStatus();
      } catch (err) {
        // 保持静默失败，不打断展示
        console.error('[DcViewWrapper] refresh error:', err);
        iptTagData.value = [];
        updateMatchStatus();
      }
    };
    
    // 更新匹配状态并发出事件
    const updateMatchStatus = () => {
      const newMatchStatus = computeHasMatched();
      
      if (hasMatched.value !== newMatchStatus) {
        hasMatched.value = newMatchStatus;
        
        if (initialized.value) {
          emit('match-status-change', newMatchStatus);
        }
      }
      
      if (!initialized.value) {
        initialized.value = true;
        emit('initialized', newMatchStatus);
      }
    };
    
    // 监听 props 变化
    watch(() => props.modelValue, refreshFromValue, { immediate: true, deep: true });
    watch(() => props.objectName, refreshFromValue, { immediate: true });
    
    // 暴露方法给父组件
    const getMatchStatus = () => {
      return hasMatched.value;
    };
    
    return {
      dcViewRef,
      hasMatched,
      getMatchStatus
    };
  }
};
</script>

<style lang="scss" scoped>
.dc-view-wrapper {
  position: relative;
  display: inline-block;
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