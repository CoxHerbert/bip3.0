<!-- components/WorkOrderProgress.vue (Vue 3 Options API, 点击显示 / 直调固定接口) -->
<template>
  <div class="wo-progress" :style="{ gap: gap + 'px' }">
    <div v-for="(n, i) in transNodes" :key="n.code || i" class="wo-item">
      <div class="wo-line"></div>

      <el-popover
        v-if="clickEnabled"
        trigger="hover"
        :width="popoverWidth"
        popper-class="wo-popover"
        @show="onShowPopover(n)"
      >
        <template #default>
          <div class="popover-header">
            <span class="val">{{ hoverState[n.code]?.data?.processName || '-' }}</span>
            <span class="val">
              {{ hoverState[n.code]?.data?.completeQty ?? '-' }}/{{
                hoverState[n.code]?.data?.plannedQty ?? '-'
              }}
            </span>
            <dc-dict-key
              :options="dicts?.DC_FORWARD_STATUS"
              :value="hoverState[n.code]?.data?.processStatus"
            />
          </div>
          <div class="wo-popover-body">
            <template v-if="hoverState[n.code]?.loading">
              <el-skeleton :rows="3" animated />
            </template>

            <template v-else-if="hoverState[n.code]?.error">
              <el-empty :image-size="60" description="加载失败">
                <template #description>
                  <span class="err">{{ hoverState[n.code]?.error }}</span>
                </template>
              </el-empty>
            </template>

            <template v-else>
              <!-- 顶部概览卡片：根据你的真实字段调整 -->

              <!-- 转单列表 -->
              <el-card
                class="w-full mb-1"
                v-for="(order, idx) in hoverState[n.code]?.data?.transferOrderList || []"
                :key="idx"
                shadow
              >
                <div class="info-row">
                  <span class="lbl">单据编号：</span>
                  <span class="val">{{ order?.billNo || '-' }}</span>
                </div>
                <div class="info-row">
                  <span class="lbl">回库/转单：</span>
                  <span class="val"
                    >{{ order?.returnQty ?? '-' }}/{{ order?.transferQty ?? '-' }}</span
                  >
                </div>
                <div class="info-row">
                  <span class="lbl">交期：</span>
                  <span class="val">{{ order?.deliveryTime || '-' }}</span>
                </div>
                <div class="info-row">
                  <span class="lbl">供应商名称：</span>
                  <span class="val">{{ order?.supplierName || '-' }}</span>
                </div>
              </el-card>
            </template>
          </div>
        </template>

        <!-- 点击这个圆点/标题作为触发器 -->
        <template #reference>
          <div class="wo-dot" :style="{ width: size + 'px' }">
            <el-progress v-bind="n.props">
              <el-icon v-if="Number(n?.percent) === 100"><Check /></el-icon>
            </el-progress>
            <div class="wo-title" :title="n.label">{{ n.label }}</div>
          </div>
        </template>
      </el-popover>

      <!-- 如果禁用点击弹出，仅展示节点 -->
      <template v-else>
        <div class="wo-dot" :style="{ width: size + 'px' }">
          <el-progress v-bind="n.props">
            <el-icon v-if="Number(n?.percent) === 100"><Check /></el-icon>
          </el-progress>
          <div class="wo-title" :title="n.label">{{ n.label }}</div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { Check } from '@element-plus/icons-vue';
import Api from '@/api';

export default {
  name: 'WorkOrderProgress',
  components: { Check },
  dicts: ['DC_FORWARD_STATUS'],
  props: {
    nodes: { type: Array, required: true },
    size: { type: Number, default: 40 },
    gap: { type: Number, default: 5 },
    // 改为点击控制：开关命名更贴切
    clickEnabled: { type: Boolean, default: true },
    popoverWidth: { type: [Number, String], default: 320 },
    cacheHover: { type: Boolean, default: true },
  },
  data() {
    return {
      // { [code]: { loading, error, data, ts, inflight } }
      hoverState: {},
    };
  },
  computed: {
    transNodes() {
      const sz = Number(this.size) || 40;
      return (this.nodes || []).map(n => ({
        ...n,
        props: {
          width: sz,
          'stroke-width': 3,
          'show-text': true,
          type: 'circle',
          percentage: Number(n?.percent) || 0,
        },
      }));
    },
  },
  methods: {
    ensureEntry(code) {
      if (!this.hoverState[code]) {
        this.hoverState[code] = {
          loading: false,
          error: null,
          data: null,
          ts: 0,
          inflight: false,
        };
      }
    },

    async onShowPopover(node) {
      if (!this.clickEnabled || !node || !node.code) return;
      const code = node.code;
      this.ensureEntry(code);

      const state = this.hoverState[code];

      // 缓存命中：已有数据且无错误
      if (this.cacheHover && state.data && !state.error) return;
      // 避免并发重复请求
      if (state.inflight) return;

      state.loading = true;
      state.error = null;
      state.inflight = true;

      try {
        const resp = await Api.mes.forward.getProcessHoverInfo({ processCode: code });
        const payload = resp?.data ?? resp;

        if (payload && typeof payload === 'object' && 'code' in payload) {
          if (Number(payload.code) === 200) {
            state.data = payload.data ?? null;
            state.error = null;
          } else {
            state.data = null;
            state.error = payload.msg || '接口返回错误';
          }
        } else {
          // 兼容直接返回数据的情况
          state.data = payload ?? null;
          state.error = null;
        }
      } catch (e) {
        state.data = null;
        state.error = e?.message || '请求失败';
      } finally {
        state.loading = false;
        state.inflight = false;
        state.ts = Date.now();
        // 可选：浅拷贝一次以确保更新
        this.hoverState[code] = { ...state };
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.wo-progress {
  display: flex;
  align-items: flex-start;

  .wo-item {
    display: flex;
    align-items: center;

    &:first-child {
      .wo-line {
        display: none;
      }
    }
    .wo-line {
      margin-top: -12px;
      width: 18px;
      height: 2px;
      background: #dcdfe6;
    }

    .wo-dot {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer; /* 点击手势 */
    }

    .wo-title {
      line-height: 14px;
      font-size: 12px;
      color: #606266;
      width: 100%;
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-top: 4px;
    }
  }
}

/* Element Plus 的进度文字微调 */
:deep(.el-progress__text) {
  font-size: 12px !important;
  width: 40px;
  min-width: 40px;
  color: #4dc799;
}
.popover-header {
  padding: 5px 0;
  margin-bottom: 5px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid rgba(204, 204, 204, 0.3);
}
.wo-popover-body {
  width: 100%;
  max-height: 300px;
  overflow: auto;
}
/* Popover 内样式（非 scoped） */
:global(.wo-popover) {
  display: flex;
  flex-direction: column;
  .el-card__body {
    width: 100%;
  }
  .wo-popover-body {
    .info-row {
      display: flex;
      align-items: baseline;
      margin-bottom: 6px;

      .lbl {
        width: 72px;
        flex: 0 0 auto;
        color: #9aa0a6;
        font-size: 12px;
      }
      .val {
        flex: 1;
        font-size: 13px;
        color: #303133;
      }
      &.desc .val {
        white-space: pre-wrap;
        word-break: break-word;
      }
    }
    .err {
      color: #f56c6c;
      font-size: 13px;
    }
  }
}
</style>
